import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-mock";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let email = "", password = "";
  try {
    const body = await req.json();
    email    = String(body?.email    ?? "").trim();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const account = authenticate(email, password);
  if (!account) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  let token: string;
  try {
    token = await signToken({
      email:       account.email,
      role:        account.role,
      displayName: account.displayName,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  const res = NextResponse.json({ role: account.role, redirect: account.redirect });
  res.cookies.set("yonne_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
