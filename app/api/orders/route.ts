import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionFromRequest } from "@/lib/session";
import { haversineKm } from "@/lib/utils";

// ── CORS ─────────────────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── Rate limit (100 req / min / user) ────────────────────────────────────────
async function rateLimit(userId: string): Promise<boolean> {
  const key     = `api:orders:${userId}:${new Date().toISOString().slice(0, 16)}`; // 1-min bucket
  const window  = 60_000;
  const maxHits = 100;
  try {
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
      return false;
    }
    const count = data.count as number;
    if (count >= maxHits) return true;
    await supabaseAdmin.from("api_rate_limits").update({ count: count + 1 }).eq("key", key);
    return false;
  } catch {
    return false; // fail-open on DB error
  }
}

// ── Ref unique ────────────────────────────────────────────────────────────────
async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const rand = String(Math.floor(10000 + Math.random() * 89999));
    const ref  = `YN-${year}-${rand}`;
    const { data } = await supabaseAdmin
      .from("orders").select("id").eq("id", ref).maybeSingle();
    if (!data) return ref;
  }
  // Fallback UUID suffix si collision répétée (improbable)
  return `YN-${year}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
}

// ── Fees ─────────────────────────────────────────────────────────────────────
function calcFee(amount: number): number {
  return Math.max(1500, Math.round(amount * 0.05));
}
function calcInsuranceFee(amount: number): number {
  return Math.max(200, Math.round(amount * 0.005));
}

// ── Dispatch IA — livreur online le plus proche de Dakar centre ───────────────
// Sans géocodage, on utilise les coordonnées du livreur vs centre Dakar.
async function dispatchDriver(): Promise<{ id: string; name: string } | null> {
  const { data: drivers } = await supabaseAdmin
    .from("drivers")
    .select("id, name, lat, lng, score_ia")
    .eq("online", true)
    .eq("in_prayer", false);

  if (!drivers || drivers.length === 0) return null;

  // Centre Dakar — coordonnées par défaut quand l'adresse n'est pas géocodée
  const DAKAR_LAT = 14.6928, DAKAR_LNG = -17.4467;

  const best = drivers
    .map(d => ({
      id:    d.id   as string,
      name:  d.name as string,
      score: d.score_ia as number,
      dist:  haversineKm(d.lat as number, d.lng as number, DAKAR_LAT, DAKAR_LNG),
    }))
    // Tri composite : distance d'abord, score IA en départage
    .sort((a, b) => a.dist - b.dist || b.score - a.score)[0];

  return best ? { id: best.id, name: best.name } : null;
}

// ── GET /api/orders ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401, headers: CORS });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const limit  = Math.min(Number(searchParams.get("limit")  ?? 50), 100);
  const offset = Number(searchParams.get("offset") ?? 0);

  let query = supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (session.role === "merchant") {
    const { data: merchant } = await supabaseAdmin
      .from("merchants").select("id").eq("email", session.email).maybeSingle();
    if (!merchant) return NextResponse.json({ orders: [], count: 0 }, { headers: CORS });
    query = query.eq("merchant_id", merchant.id as string);
  } else if (session.role === "driver") {
    const { data: driver } = await supabaseAdmin
      .from("drivers").select("id")
      .or(`user_id.eq.${session.userId},email.eq.${session.email}`)
      .maybeSingle();
    if (!driver) return NextResponse.json({ orders: [], count: 0 }, { headers: CORS });
    query = query.eq("driver_id", driver.id as string);
  }
  // admin → pas de filtre

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ orders: data ?? [], count: data?.length ?? 0 }, { headers: CORS });
}

// ── POST /api/orders ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401, headers: CORS });
  }
  if (session.role === "driver") {
    return NextResponse.json({ error: "Les livreurs ne peuvent pas créer de commandes" }, { status: 403, headers: CORS });
  }
  if (await rateLimit(session.userId)) {
    return NextResponse.json({ error: "Trop de requêtes — max 100/min" }, { status: 429, headers: CORS });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400, headers: CORS }); }

  const customer_name  = String(body?.customer_name  ?? "").trim();
  const customer_phone = String(body?.customer_phone ?? "").trim();
  const address        = String(body?.address        ?? "").trim();
  const amount         = Number(body?.amount);
  const payment_mode   = String(body?.payment_mode   ?? "").trim().toLowerCase();
  const insurance      = body?.insurance === true || body?.insurance === "true";

  // Validation
  const errors: string[] = [];
  if (!customer_name)  errors.push("customer_name requis");
  if (!customer_phone) errors.push("customer_phone requis");
  if (!address)        errors.push("address requis");
  if (!amount || amount <= 0 || !Number.isFinite(amount)) errors.push("amount invalide");
  if (!["wave", "orange", "cash", "paytech"].includes(payment_mode)) {
    errors.push("payment_mode invalide (wave|orange|cash|paytech)");
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400, headers: CORS });
  }

  // Résolution merchant_id
  let merchantId: string;
  if (session.role === "admin") {
    merchantId = String(body?.merchant_id ?? "").trim() || "admin";
  } else {
    const { data: merchant } = await supabaseAdmin
      .from("merchants").select("id").eq("email", session.email).maybeSingle();
    if (!merchant) {
      return NextResponse.json(
        { error: "Profil marchand introuvable — avez-vous complété l'onboarding ?" },
        { status: 404, headers: CORS },
      );
    }
    merchantId = merchant.id as string;
  }

  const ref      = await generateRef();
  const fee      = calcFee(amount);
  const insFee   = insurance ? calcInsuranceFee(amount) : 0;
  const driver   = await dispatchDriver();
  const status   = driver ? "assignée" : "créée";

  const { error: insertErr } = await supabaseAdmin
    .from("orders")
    .insert({
      id:             ref,
      merchant_id:    merchantId,
      driver_id:      driver?.id ?? null,
      client_name:    customer_name,
      client_phone:   customer_phone,
      landmark_id:    address,  // stocké comme texte libre (pas de géocodage)
      amount,
      payment_method: payment_mode,
      insurance,
      status,
      active:         driver !== null,
    });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500, headers: CORS });
  }

  const origin = req.headers.get("x-forwarded-host")
    ? `https://${req.headers.get("x-forwarded-host")}`
    : (process.env.APP_URL ?? "https://yonne-sigma.vercel.app");

  return NextResponse.json(
    {
      ok: true,
      order: {
        ref,
        status,
        driver_id:    driver?.id   ?? null,
        driver_name:  driver?.name ?? null,
        fee,
        insurance_fee: insFee,
        total_fee:    fee + insFee,
        eta:          driver ? "15–20 min" : "En attente d'un livreur disponible",
        tracking_url: `${origin}/suivi/${ref}`,
      },
    },
    { status: 201, headers: CORS },
  );
}
