import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionFromRequest } from "@/lib/session";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Vérifie que l'user a le droit de voir/modifier la commande
function canAccess(
  session: { role: string; email: string },
  order: Record<string, unknown>,
  merchantId: string | null,
  driverId: string | null,
): boolean {
  if (session.role === "admin") return true;
  if (session.role === "merchant" && merchantId && order.merchant_id === merchantId) return true;
  if (session.role === "driver"   && driverId   && order.driver_id   === driverId)   return true;
  return false;
}

// ── GET /api/orders/:ref ──────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { ref: string } },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401, headers: CORS });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.ref)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404, headers: CORS });

  // Résolution des IDs pour vérification d'accès
  const { data: merchant } = session.role === "merchant"
    ? await supabaseAdmin.from("merchants").select("id").eq("email", session.email).maybeSingle()
    : { data: null };
  const { data: driver } = session.role === "driver"
    ? await supabaseAdmin.from("drivers").select("id")
        .eq("user_id", session.userId).maybeSingle()
    : { data: null };

  if (!canAccess(session, order as Record<string, unknown>, (merchant as { id: string } | null)?.id ?? null, (driver as { id: string } | null)?.id ?? null)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: CORS });
  }

  // Enrichit avec les infos du livreur si assigné
  let driverInfo = null;
  if (order.driver_id) {
    const { data: d } = await supabaseAdmin
      .from("drivers")
      .select("id, name, phone, vehicle, rating, lat, lng")
      .eq("id", order.driver_id as string)
      .maybeSingle();
    driverInfo = d;
  }

  const origin = process.env.APP_URL ?? "https://yonne-sigma.vercel.app";

  return NextResponse.json(
    {
      order,
      driver: driverInfo,
      tracking_url: `${origin}/suivi/${params.ref}`,
    },
    { headers: CORS },
  );
}

// ── PATCH /api/orders/:ref ────────────────────────────────────────────────────
const VALID_STATUSES = ["créée", "assignée", "collecte", "en route", "livrée", "annulée"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "créée":    ["assignée", "annulée"],
  "assignée": ["collecte", "annulée"],
  "collecte": ["en route"],
  "en route": ["livrée"],
  "livrée":   [],
  "annulée":  [],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { ref: string } },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401, headers: CORS });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400, headers: CORS }); }

  const newStatus = String(body?.status ?? "").trim() as OrderStatus;
  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      { error: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(", ")}` },
      { status: 400, headers: CORS },
    );
  }

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.ref)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500, headers: CORS });
  if (!order)   return NextResponse.json({ error: "Commande introuvable" }, { status: 404, headers: CORS });

  // Vérification d'accès
  const { data: merchant } = session.role === "merchant"
    ? await supabaseAdmin.from("merchants").select("id").eq("email", session.email).maybeSingle()
    : { data: null };
  const { data: driver } = session.role === "driver"
    ? await supabaseAdmin.from("drivers").select("id")
        .eq("user_id", session.userId).maybeSingle()
    : { data: null };

  if (!canAccess(session, order as Record<string, unknown>, (merchant as { id: string } | null)?.id ?? null, (driver as { id: string } | null)?.id ?? null)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: CORS });
  }

  // Vérifie la transition
  const currentStatus = order.status as OrderStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Transition interdite : ${currentStatus} → ${newStatus}` },
      { status: 422, headers: CORS },
    );
  }

  // Met à jour le statut
  const isActive  = ["assignée", "collecte", "en route"].includes(newStatus);
  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus, active: isActive })
    .eq("id", params.ref);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500, headers: CORS });
  }

  // Si livré → incrémente les stats du livreur via RPC (non-bloquant)
  if (newStatus === "livrée" && order.driver_id) {
    try {
      await supabaseAdmin.rpc("increment_driver_stats", {
        p_driver_id: order.driver_id,
        p_amount:    order.amount,
      });
    } catch { /* RPC optionnelle — peut ne pas exister */ }
  }

  return NextResponse.json({ ok: true, ref: params.ref, status: newStatus }, { headers: CORS });
}
