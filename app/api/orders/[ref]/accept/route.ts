import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionFromRequest } from "@/lib/session";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// ── POST /api/orders/:ref/accept ──────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { ref: string } },
) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "driver") {
    return NextResponse.json({ error: "Accès réservé aux livreurs" }, { status: 403, headers: CORS });
  }

  // Lookup the real driver record by user_id (from JWT)
  const { data: driver } = await supabaseAdmin
    .from("drivers")
    .select("id, name")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!driver) {
    return NextResponse.json({ error: "Profil livreur introuvable" }, { status: 404, headers: CORS });
  }

  // Fetch the order
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("id, status, driver_id")
    .eq("id", params.ref)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500, headers: CORS });
  if (!order)   return NextResponse.json({ error: "Commande introuvable" }, { status: 404, headers: CORS });

  // Idempotent — driver already accepted this order
  if (order.driver_id === driver.id && ["collecte", "en route"].includes(order.status as string)) {
    return NextResponse.json(
      { ok: true, idempotent: true, order_id: params.ref, status: order.status, driver_id: driver.id },
      { headers: CORS },
    );
  }

  // Order must be in an acceptable state
  if (!["créée", "assignée", "payée_a_collecter"].includes(order.status as string)) {
    return NextResponse.json(
      { error: `Commande non disponible (statut: ${order.status})` },
      { status: 409, headers: CORS },
    );
  }

  // Already taken by a different driver
  if (order.driver_id && order.driver_id !== driver.id) {
    return NextResponse.json(
      { error: "Commande déjà prise par un autre livreur" },
      { status: 409, headers: CORS },
    );
  }

  // Atomic accept: set status → collecte, assign driver, mark active
  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ status: "collecte", driver_id: driver.id, active: true })
    .eq("id", params.ref);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json(
    { ok: true, order_id: params.ref, status: "collecte", driver_id: driver.id },
    { headers: CORS },
  );
}
