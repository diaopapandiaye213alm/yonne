// PayTech Sénégal — server-only API client
// Doc: https://paytech.sn — never import this file from client components.

import { createHash, timingSafeEqual } from "crypto";

const PAYTECH_BASE       = "https://paytech.sn/api/payment";
const PAYTECH_API_KEY    = process.env.PAYTECH_API_KEY    ?? "";
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET ?? "";
const APP_URL            = process.env.APP_URL            ?? "http://localhost:3000";

export type PayTechSessionResult =
  | { ok: true;  token: string; redirectUrl: string }
  | { ok: false; error: string };

// Creates a hosted payment session on PayTech and returns the checkout URL.
export async function createPayTechSession({
  orderId,
  amount,
  clientName,
}: {
  orderId:    string;
  amount:     number;
  clientName: string;
}): Promise<PayTechSessionResult> {
  if (!PAYTECH_API_KEY || !PAYTECH_API_SECRET) {
    return { ok: false, error: "PayTech non configuré — variables PAYTECH_API_KEY/SECRET manquantes" };
  }

  const params = new URLSearchParams({
    item_name:    `Livraison YONNE — ${orderId}`,
    item_price:   String(amount),
    currency:     "XOF",
    ref_command:  orderId,
    ipn_url:      `${APP_URL}/api/webhooks/paytech`,
    success_url:  `${APP_URL}/payment/success?ref=${encodeURIComponent(orderId)}`,
    cancel_url:   `${APP_URL}/payment/cancel?ref=${encodeURIComponent(orderId)}`,
    env:          "prod",
    custom_field: JSON.stringify({ order_id: orderId, client_name: clientName }),
  });

  let res: Response;
  try {
    res = await fetch(`${PAYTECH_BASE}/request-payment`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "API_KEY":    PAYTECH_API_KEY,
        "API_SECRET": PAYTECH_API_SECRET,
      },
      body: params.toString(),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Réseau PayTech indisponible" };
  }

  if (!res.ok) return { ok: false, error: `PayTech HTTP ${res.status}` };

  const data = await res.json() as {
    success:      0 | 1;
    token?:       string;
    redirect_url?: string;
    error?:       string[];
  };

  if (data.success !== 1 || !data.token || !data.redirect_url) {
    return { ok: false, error: data.error?.[0] ?? "Réponse PayTech invalide" };
  }

  return { ok: true, token: data.token, redirectUrl: data.redirect_url };
}

// Verifies PayTech IPN authenticity via SHA-256 key hashes.
// PayTech includes api_key_sha256 and api_secret_sha256 in every IPN body.
export function verifyPayTechIpn(body: URLSearchParams): boolean {
  if (!PAYTECH_API_KEY || !PAYTECH_API_SECRET) return false;

  const receivedKeyHash    = body.get("api_key_sha256")    ?? "";
  const receivedSecretHash = body.get("api_secret_sha256") ?? "";

  const expectedKeyHash    = createHash("sha256").update(PAYTECH_API_KEY).digest("hex");
  const expectedSecretHash = createHash("sha256").update(PAYTECH_API_SECRET).digest("hex");

  try {
    return (
      timingSafeEqual(Buffer.from(receivedKeyHash),    Buffer.from(expectedKeyHash)) &&
      timingSafeEqual(Buffer.from(receivedSecretHash), Buffer.from(expectedSecretHash))
    );
  } catch {
    return false;
  }
}

// Maps PayTech payment_method string → YONNE provider enum (wave | orange).
export function normalizePayTechMethod(method: string): "wave" | "orange" {
  return method.toLowerCase().includes("wave") ? "wave" : "orange";
}
