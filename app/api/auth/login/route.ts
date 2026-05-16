import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { signToken } from "@/lib/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  admin:    "/admin",
  merchant: "/merchant/nouvelle-commande",
  driver:   "/driver/carte",
};

const MIN_RESPONSE_MS = 800;

// Brute-force protection: max 10 login attempts per IP per 15 minutes.
// Uses the api_rate_limits table (same infrastructure as SMS circuit breaker).
// Fail-open if the DB is unavailable — don't block legitimate users on DB outage.
async function checkLoginRateLimit(ip: string): Promise<boolean> {
  try {
    const window = 15 * 60 * 1000; // 15 min
    const limit  = 10;
    const key    = `login:ip:${ip}:${new Date().toISOString().slice(0, 15)}`; // 15-min bucket

    const { data } = await supabaseAdmin
      .from("api_rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .maybeSingle();

    const now = new Date();
    if (!data || new Date(data.reset_at as string) <= now) {
      await supabaseAdmin.from("api_rate_limits").upsert({
        key, count: 1, reset_at: new Date(now.getTime() + window).toISOString(),
      });
      return true;
    }
    const count = data.count as number;
    if (count >= limit) return false;
    await supabaseAdmin.from("api_rate_limits").update({ count: count + 1 }).eq("key", key);
    return true;
  } catch {
    return true; // fail-open on DB error
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  // Rate limit by IP before any other work
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  const allowed = await checkLoginRateLimit(ip);
  if (!allowed) {
    const elapsed = Date.now() - start;
    if (elapsed < MIN_RESPONSE_MS) await new Promise(r => setTimeout(r, MIN_RESPONSE_MS - elapsed));
    return NextResponse.json({ error: "Trop de tentatives — réessayez dans 15 minutes" }, { status: 429 });
  }

  let email = "", password = "";
  try {
    const body = await req.json();
    email    = String(body?.email    ?? "").trim().toLowerCase();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!email || !password)
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  // Dummy hash ensures bcrypt always runs, preventing email-enumeration via timing.
  const DUMMY_HASH = "$2b$12$invalidhashpaddingtomatch60charsXXXXXXXXXXXXXXXXXXXXXX";

  // Lire via le client admin pour bypasser RLS sur la table users
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, password_hash, role, display_name, redirect_url")
    .eq("email", email)
    .single();

  const hashToCompare = (data?.password_hash as string | undefined) ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCompare);

  const elapsed = Date.now() - start;
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
  }

  if (error || !data || !valid)
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

  const userId      = data.id as string;
  const role        = data.role as "admin" | "merchant" | "driver";
  const displayName = (data.display_name as string) ?? email;
  const redirect    = (data.redirect_url as string) ?? ROLE_REDIRECTS[role] ?? "/";

  // userId → claim `sub` du JWT → auth.uid() dans les policies RLS Postgres
  const token = await signToken({ userId, email: data.email as string, role, displayName });

  const res = NextResponse.json({ role, redirect });
  res.cookies.set("yonne_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
