// IPN handler POST /api/webhooks/paytech
// PayTech envoie un POST form-urlencoded à cette URL après chaque paiement.
// Sécurité : vérification SHA-256 (api_key_sha256 + api_secret_sha256) — fail-closed.

import { NextRequest, NextResponse } from "next/server";
import { verifyPayTechIpn, normalizePayTechMethod } from "@/lib/paytech";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const body    = new URLSearchParams(rawBody);

  // 1. Vérification cryptographique — rejet immédiat si invalide
  if (!verifyPayTechIpn(body)) {
    console.warn("[webhooks/paytech] Signature IPN invalide — rejet");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const typeEvent  = body.get("type_event")      ?? "";
  const refCommand = body.get("ref_command")      ?? "";
  const token      = body.get("token")            ?? "";
  const itemPrice  = parseInt(body.get("item_price") ?? "0", 10);
  const payMethod  = body.get("payment_method")   ?? "";

  if (!token || !refCommand) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const status   = typeEvent === "sale_complete" ? "completed" : "canceled";
  const provider = normalizePayTechMethod(payMethod);

  // 2. Met à jour le statut de la session PayTech
  await supabaseAdmin
    .from("paytech_sessions")
    .update({ status, completed_at: new Date().toISOString() })
    .eq("token", token);

  // 3. Enregistre le paiement confirmé via RPC idempotente
  if (status === "completed" && itemPrice > 0) {
    const { error } = await supabaseAdmin.rpc("process_payment_webhook", {
      p_event_id: token,
      p_order_id: refCommand,
      p_provider: provider,
      p_amount:   itemPrice,
      p_currency: "XOF",
      p_status:   "completed",
      p_raw:      Object.fromEntries(body.entries()),
    });
    if (error) {
      console.error("[webhooks/paytech] RPC error:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}
