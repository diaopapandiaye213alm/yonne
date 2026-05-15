import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { signToken } from "@/lib/auth";
import { sendSms } from "@/lib/sms";

function shortId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const role     = String(body?.role     ?? "").trim();
  const name     = String(body?.name     ?? "").trim();
  const email    = String(body?.email    ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone    = String(body?.phone    ?? "").trim();
  const city     = String(body?.city     ?? "").trim() || "Dakar";
  const vehicle  = String(body?.vehicle  ?? "").trim() || "Moto Yamaha";

  if (!name)
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  if (!email || !isValidEmail(email))
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
  if (role !== "merchant" && role !== "driver")
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existing)
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 10);
  const redirectUrl   = role === "merchant" ? "/merchant/onboarding" : "/driver/carte";

  // Insérer l'utilisateur et récupérer son UUID (devient le `sub` du JWT)
  const { data: newUser, error: userErr } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      password_hash,
      role,
      display_name: name,
      redirect_url: redirectUrl,
    })
    .select("id")
    .single();

  if (userErr || !newUser)
    return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 });

  const userId = newUser.id as string;

  if (role === "merchant") {
    const { error: mErr } = await supabaseAdmin.from("merchants").insert({
      id:      "mch-" + shortId(),
      name,
      email,
      phone,
      city,
      plan:    "Standard",
      status:  "actif",
      user_id: userId,   // FK → users.id pour les RLS
    });
    if (mErr)
      return NextResponse.json({ error: "Erreur lors de la création du profil marchand" }, { status: 500 });
  } else {
    const { error: dErr } = await supabaseAdmin.from("drivers").insert({
      id:             "drv-" + shortId(),
      name,
      phone,
      vehicle,
      score_ia:       75,
      rating:         4.5,
      tier:           "Bronze",
      badges:         [],
      orders_today:   0,
      earnings_today: 0,
      online:         false,
      in_prayer:      false,
      lat:            14.6928,
      lng:            -17.4467,
      user_id:        userId,   // FK → users.id pour les RLS
    });
    if (dErr)
      return NextResponse.json({ error: "Erreur lors de la création du profil livreur" }, { status: 500 });
  }

  // SMS de bienvenue (non-bloquant)
  if (phone) {
    const welcomeMsg = role === "driver"
      ? `Bienvenue sur YONNE ${name} ! Votre compte livreur est actif. Connectez-vous sur yonne-sigma.vercel.app 🛵`
      : `Bienvenue sur YONNE ${name} ! Votre boutique est créée. Commencez à livrer sur yonne-sigma.vercel.app 🏪`;
    void sendSms(phone, welcomeMsg);
  }

  const token = await signToken({
    userId,
    email,
    role: role as "merchant" | "driver",
    displayName: name,
  });

  const res = NextResponse.json({ ok: true, redirectUrl });
  res.cookies.set("yonne_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
