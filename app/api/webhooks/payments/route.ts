// Webhook POST /api/webhooks/payments
// Fournisseurs supportés : Wave, Orange Money
// Sécurité : HMAC-SHA256 (header x-webhook-signature) + idempotence RPC côté DB
// Fail-closed : tout échec de vérification retourne 401 ou 500 — jamais 200.

import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;

// ── HMAC verification ────────────────────────────────────────────────────────
// Compare en temps constant pour éviter les attaques temporelles.
function verifyHmacSha256(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    // Buffer.from throws if signature is not valid hex or lengths differ
    return false;
  }
}

// ── Wave payload ─────────────────────────────────────────────────────────────
interface WavePayload {
  event: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: "completed" | "failed" | "pending";
  metadata: { order_id: string };
}

function isWavePayload(x: unknown): x is WavePayload {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const meta = o.metadata as Record<string, unknown> | null | undefined;
  return (
    typeof o.event === "string" &&
    typeof o.transaction_id === "string" &&
    (o.transaction_id as string).trim() !== "" &&
    typeof o.amount === "number" &&
    (o.amount as number) > 0 &&
    typeof o.currency === "string" &&
    (o.status === "completed" || o.status === "failed" || o.status === "pending") &&
    meta !== null &&
    meta !== undefined &&
    typeof meta === "object" &&
    typeof meta.order_id === "string" &&
    (meta.order_id as string).trim() !== ""
  );
}

// ── Orange Money payload ─────────────────────────────────────────────────────
interface OrangePayload {
  txnid: string;
  txnstatus: string; // "00" = success
  amount: string;    // Orange Money envoie le montant en string
  currency: string;
  orderId: string;
}

function isOrangePayload(x: unknown): x is OrangePayload {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.txnid === "string" &&
    (o.txnid as string).trim() !== "" &&
    typeof o.txnstatus === "string" &&
    typeof o.amount === "string" &&
    !isNaN(Number(o.amount)) &&
    Number(o.amount) > 0 &&
    typeof o.currency === "string" &&
    typeof o.orderId === "string" &&
    (o.orderId as string).trim() !== ""
  );
}

// ── PaymentEvent (forme normalisée) ─────────────────────────────────────────
interface PaymentEvent {
  eventId: string;
  orderId: string;
  provider: "wave" | "orange";
  amount: number;
  currency: string;
  status: "completed" | "failed" | "pending";
  raw: unknown;
}

function normalizeWave(p: WavePayload): PaymentEvent {
  return {
    eventId:  p.transaction_id,
    orderId:  p.metadata.order_id,
    provider: "wave",
    amount:   p.amount,
    currency: p.currency,
    status:   p.status,
    raw:      p,
  };
}

function normalizeOrange(p: OrangePayload): PaymentEvent {
  return {
    eventId:  p.txnid,
    orderId:  p.orderId,
    provider: "orange",
    amount:   Number(p.amount),
    currency: p.currency,
    status:   p.txnstatus === "00" ? "completed" : "failed",
    raw:      p,
  };
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!PAYMENT_WEBHOOK_SECRET) {
    console.error("[webhook/payments] PAYMENT_WEBHOOK_SECRET non configuré — rejet systématique");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  // 1. Lire le corps brut AVANT tout parsing pour que la signature soit valide
  const rawBody = await req.text();

  // 2. Vérification cryptographique de la signature (fail-closed)
  const signature = req.headers.get("x-webhook-signature") ?? "";
  if (!signature || !verifyHmacSha256(rawBody, signature, PAYMENT_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 3. Parsing JSON strict
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 4. Normalisation vers PaymentEvent selon le fournisseur
  let event: PaymentEvent;
  if (isWavePayload(parsed)) {
    event = normalizeWave(parsed);
  } else if (isOrangePayload(parsed)) {
    event = normalizeOrange(parsed);
  } else {
    return NextResponse.json({ error: "unknown_payload_format" }, { status: 422 });
  }

  // 5. RPC idempotente — verrou SELECT FOR UPDATE + mise à jour atomique
  const { data, error } = await supabaseAdmin.rpc("process_payment_webhook", {
    p_event_id: event.eventId,
    p_order_id: event.orderId,
    p_provider: event.provider,
    p_amount:   event.amount,
    p_currency: event.currency,
    p_status:   event.status,
    p_raw:      event.raw,
  });

  if (error) {
    console.error("[webhook/payments] RPC error:", error.message);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
