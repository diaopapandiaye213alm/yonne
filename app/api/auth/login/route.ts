import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { signToken } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const { data, error } = await supabase
    .from("users")
    .select("email, password_hash, role, display_name, redirect_url")
    .eq("email", email)
    .single();

  if (error || !data)
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

  const valid = await bcrypt.compare(password, data.password_hash as string);
  if (!valid)
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

  const role        = data.role as "admin" | "merchant" | "driver";
  const displayName = (data.display_name as string) ?? email;
  const redirect    = (data.redirect_url as string) ?? ROLE_REDIRECTS[role] ?? "/";

  const token = await signToken({ email: data.email as string, role, displayName });

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
