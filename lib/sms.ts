// SMS via Africa's Talking — serveur uniquement (API Routes / Server Actions)
// Variables d'env requises : AT_API_KEY, AT_USERNAME, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const AT_BASE = "https://api.africastalking.com/version1/messaging";

// ── Circuit Breaker — limites de quota ──────────────────────────────────────
const LIMIT_GLOBAL_HOURLY   = 200;   // 200 SMS/heure globalement
const LIMIT_GLOBAL_DAILY    = 1_000; // 1 000 SMS/jour globalement
const LIMIT_MERCHANT_DAILY  = 50;    // 50 SMS/jour par marchand

// Client Supabase service-role pour les écritures dans api_rate_limits (contourne RLS).
// Null si les variables d'env ne sont pas configurées → fail-closed.
const _db =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
    : null;

if (!process.env.AT_API_KEY) {
  console.warn("[YONNE/sms] AT_API_KEY is not set — SMS notifications are disabled.");
}

// ── Vérification et incrémentation du quota ──────────────────────────────────
// Utilise la table api_rate_limits : { key TEXT PK, count INT, reset_at TIMESTAMPTZ }
// Stratégie fail-closed : si la base est inaccessible, on bloque le SMS.
// Les race conditions légères (±1 SMS) sont tolérées pour éviter les verrous.
async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  if (!_db) {
    console.warn(`[YONNE/sms] No DB client — blocking SMS for key=${key} (fail-closed)`);
    return false;
  }

  const now = new Date();

  const { data, error } = await _db
    .from("api_rate_limits")
    .select("count, reset_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("[YONNE/sms] rate-limit DB read error:", error.message);
    return false; // fail-closed
  }

  if (!data || new Date(data.reset_at as string) <= now) {
    // Nouvelle fenêtre : créer ou réinitialiser le compteur à 1.
    const { error: upsertErr } = await _db.from("api_rate_limits").upsert({
      key,
      count: 1,
      reset_at: new Date(now.getTime() + windowMs).toISOString(),
    });
    if (upsertErr) {
      console.error("[YONNE/sms] rate-limit upsert error:", upsertErr.message);
      return false;
    }
    return true;
  }

  const currentCount = data.count as number;
  if (currentCount >= limit) {
    console.warn(
      `[YONNE/sms] Circuit breaker OPEN — key=${key} count=${currentCount}/${limit}`
    );
    return false;
  }

  // Incrémenter le compteur.
  const { error: updateErr } = await _db
    .from("api_rate_limits")
    .update({ count: currentCount + 1 })
    .eq("key", key);
  if (updateErr) {
    console.error("[YONNE/sms] rate-limit update error:", updateErr.message);
    return false;
  }

  return true;
}

// ── Envoi SMS avec circuit breaker ──────────────────────────────────────────
export async function sendSms(
  to: string,
  message: string,
  opts?: { merchantId?: string }
): Promise<void> {
  const apiKey   = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME ?? "sandbox";
  if (!apiKey) return;

  // Normalise le numéro sénégalais → format international +221
  const phone = to.replace(/\s/g, "").replace(/^0/, "").replace(/^\+?221/, "+221");
  if (!phone.startsWith("+221")) return;

  const now   = new Date();
  const today = now.toISOString().slice(0, 10);   // YYYY-MM-DD
  const hour  = now.toISOString().slice(0, 13);   // YYYY-MM-DDTHH

  // ── Vérification du circuit breaker (quotas en parallèle) ─────────────────
  const checks: Promise<boolean>[] = [
    checkRateLimit(`sms:global:hourly:${hour}`,  LIMIT_GLOBAL_HOURLY,  60 * 60 * 1000),
    checkRateLimit(`sms:global:daily:${today}`,  LIMIT_GLOBAL_DAILY,  24 * 60 * 60 * 1000),
  ];
  if (opts?.merchantId) {
    checks.push(
      checkRateLimit(
        `sms:merchant:${opts.merchantId}:${today}`,
        LIMIT_MERCHANT_DAILY,
        24 * 60 * 60 * 1000
      )
    );
  }

  const results = await Promise.all(checks);
  if (results.some(allowed => !allowed)) return; // au moins un quota dépassé

  // ── Envoi Africa's Talking ─────────────────────────────────────────────────
  try {
    const body = new URLSearchParams({
      username,
      to: phone,
      message,
      from: "YONNE",
    });
    const res = await fetch(AT_BASE, {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) {
      console.error(`[YONNE/sms] AT API error ${res.status} for ${phone}`);
    }
  } catch (err) {
    console.error("[YONNE/sms] sendSms failed:", err instanceof Error ? err.message : err);
  }
}
