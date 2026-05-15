import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { signToken } from "@/lib/auth";

const ROLE_REDIRECTS: Record<string, string> = {
  admin:    "/admin",
  merchant: "/merchant/nouvelle-commande",
  driver:   "/driver/carte",
};

export async function POST(req: NextRequest) {
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
