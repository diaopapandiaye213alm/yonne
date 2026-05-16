// POST /api/payments/paytech/request
// Crée une session de paiement PayTech et retourne le redirect_url.
// Sécurité : nécessite une session authentifiée (rôle merchant ou admin).

import { NextRequest, NextResponse } from "next/server";
import { createPayTechSession } from "@/lib/paytech";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSession } from "@/lib/session";

interface RequestBody {
  order_id:    string;
  amount:      number;
  client_name: string;
}

function isValidBody(x: unknown): x is RequestBody {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.order_id    === "string" && o.order_id.trim()    !== "" &&
    typeof o.amount      === "number" && o.amount              > 0   &&
    typeof o.client_name === "string" && o.client_name.trim() !== ""
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Authentification ──────────────────────────────────────────────────
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── 2. Validation du corps ───────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "missing_fields: order_id, amount, client_name requis" }, { status: 422 });
  }

  // ── 3. Vérifier que la commande appartient bien au marchand connecté ────
  if (session.role === "merchant") {
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id, merchant_id, merchants!inner(user_id)")
      .eq("id", body.order_id)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }

    const merchantUserId = (order.merchants as unknown as { user_id: string })?.user_id;
    if (merchantUserId !== session.userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  // ── 4. Création de la session PayTech ────────────────────────────────────
  const result = await createPayTechSession({
    orderId:    body.order_id,
    amount:     body.amount,
    clientName: body.client_name,
  });

  if (!result.ok) {
    console.error("[paytech/request] Erreur PayTech:", result.error);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // ── 5. Persiste le token pour associer l'IPN à la commande ──────────────
  const { error: dbErr } = await supabaseAdmin
    .from("paytech_sessions")
    .upsert({ token: result.token, order_id: body.order_id, amount: body.amount, status: "pending" });

  if (dbErr) {
    console.error("[paytech/request] Erreur DB:", dbErr.message);
  }

  return NextResponse.json({ redirect_url: result.redirectUrl, token: result.token });
}
