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

const NON_CANCELLABLE = new Set(["livrée", "annulée"]);

// ── POST /api/orders/:ref/cancel ──────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { ref: string } },
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401, headers: CORS });
  }

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("id, status, merchant_id, driver_id, amount, payment_method")
    .eq("id", params.ref)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500, headers: CORS });
  if (!order)   return NextResponse.json({ error: "Commande introuvable" }, { status: 404, headers: CORS });

  // Vérification d'accès — seul le marchand propriétaire ou un admin peut annuler
  if (session.role === "driver") {
    return NextResponse.json({ error: "Les livreurs ne peuvent pas annuler une commande" }, { status: 403, headers: CORS });
  }
  if (session.role === "merchant") {
    const { data: merchant } = await supabaseAdmin
      .from("merchants").select("id").eq("email", session.email).maybeSingle();
    if (!merchant || order.merchant_id !== (merchant as { id: string }).id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: CORS });
    }
  }

  if (NON_CANCELLABLE.has(order.status as string)) {
    return NextResponse.json(
      { error: `Impossible d'annuler une commande au statut "${order.status}"` },
      { status: 422, headers: CORS },
    );
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ status: "annulée", active: false })
    .eq("id", params.ref);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500, headers: CORS });
  }

  // Libère le livreur si assigné (non-bloquant)
  if (order.driver_id) {
    try {
      await supabaseAdmin
        .from("drivers")
        .update({ online: true })
        .eq("id", order.driver_id as string);
    } catch { /* non-bloquant */ }
  }

  return NextResponse.json(
    {
      ok: true,
      ref: params.ref,
      status: "annulée",
      refund_required: order.payment_method !== "cash",
    },
    { headers: CORS },
  );
}
