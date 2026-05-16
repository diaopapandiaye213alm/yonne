// Web Push sender — RFC 8291 (aes128gcm) + RFC 8292 (VAPID/ES256)
// Uses Node.js 20 built-in crypto only — no external web-push dependency.
//
// Required env vars (server-side only):
//   VAPID_PUBLIC_KEY  — base64url uncompressed P-256 point (65 bytes)
//   VAPID_PRIVATE_KEY — base64url raw P-256 private scalar (32 bytes)
//   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS for subscription reads)
//
// POST body: { driver_id, title, body, phone?, merchant_id? }
// Returns:   { sent: "push" | "sms" | "none" }

import { NextResponse } from "next/server";
import { createECDH, hkdfSync, createCipheriv, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SignJWT, importJWK } from "jose";
import { sendSms } from "@/lib/sms";

const FAIL_SAFE = NextResponse.json({ sent: "none" }, { status: 200 });

// ── Admin client — reads push subscriptions bypassing RLS ──────────────────
const adminDb =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
    : null;

// ── VAPID JWT (ES256) ──────────────────────────────────────────────────────
async function buildVapidJwt(audience: string): Promise<string> {
  const pubRaw  = process.env.VAPID_PUBLIC_KEY!;
  const privRaw = process.env.VAPID_PRIVATE_KEY!;

  const pubBytes = Buffer.from(pubRaw, "base64url");
  const x = pubBytes.subarray(1, 33).toString("base64url");
  const y = pubBytes.subarray(33, 65).toString("base64url");
  const d = Buffer.from(privRaw, "base64url").toString("base64url");

  const key = await importJWK({ kty: "EC", crv: "P-256", x, y, d }, "ES256");

  return new SignJWT({ sub: "mailto:tech@yonne.sn" })
    .setProtectedHeader({ alg: "ES256" })
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key);
}

// ── RFC 8291 aes128gcm payload encryption ─────────────────────────────────
function encryptPayload(plaintext: string, p256dh: string, authKey: string): Buffer {
  const uaPublicKey = Buffer.from(p256dh, "base64url");
  const authSecret  = Buffer.from(authKey, "base64url");
  const salt        = randomBytes(16);

  // Ephemeral server ECDH key pair
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  const asPublicKey = ecdh.getPublicKey(); // uncompressed, 65 bytes

  // Shared secret
  const ecdhSecret = ecdh.computeSecret(uaPublicKey);

  // IKM = HKDF-Extract(auth_secret, ecdh_secret) → HKDF-Expand(_, key_info, 32)
  const keyInfo = Buffer.concat([
    Buffer.from("WebPush: info\x00"),
    uaPublicKey,
    asPublicKey,
  ]);
  const ikm = Buffer.from(
    hkdfSync("sha256", ecdhSecret, authSecret, keyInfo, 32) as ArrayBuffer
  );

  // CEK and Nonce via second HKDF pass
  const cek = Buffer.from(
    hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\x00"), 16) as ArrayBuffer
  );
  const nonce = Buffer.from(
    hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\x00"), 12) as ArrayBuffer
  );

  // AES-128-GCM encryption — single record, 0x02 delimiter
  const cipher = createCipheriv("aes-128-gcm", cek, nonce);
  const padded = Buffer.concat([Buffer.from(plaintext, "utf8"), Buffer.from([0x02])]);
  const ciphertext = Buffer.concat([cipher.update(padded), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16 bytes

  // aes128gcm content-coding header: salt(16) | rs(4BE) | idlen(1) | keyid(65) | ciphertext+tag
  const rs = Buffer.allocUnsafe(4);
  rs.writeUInt32BE(4096, 0);

  return Buffer.concat([salt, rs, Buffer.from([asPublicKey.length]), asPublicKey, ciphertext, tag]);
}

// ── Core Web Push send ─────────────────────────────────────────────────────
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  authKey: string,
  payload: { title: string; body: string },
): Promise<{ ok: boolean; status: number }> {
  const { protocol, host } = new URL(endpoint);
  const audience = `${protocol}//${host}`;

  const [jwt, body] = await Promise.all([
    buildVapidJwt(audience),
    Promise.resolve(encryptPayload(JSON.stringify(payload), p256dh, authKey)),
  ]);

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization:      `vapid t=${jwt},k=${vapidPublicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type":     "application/octet-stream",
      TTL:                "300",
    },
    body: new Uint8Array(body),
  });

  return { ok: res.ok, status: res.status };
}

// ── Route handler ──────────────────────────────────────────────────────────
interface SendBody {
  driver_id:   string;
  title:       string;
  body:        string;
  phone?:      string;       // for SMS fallback
  merchant_id?: string;      // for SMS rate limiter
}

export async function POST(req: Request): Promise<NextResponse> {
  // Validate VAPID config is present
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("[push] VAPID keys not configured — skipping Web Push");
    return FAIL_SAFE;
  }

  let parsed: SendBody;
  try {
    parsed = (await req.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { driver_id, title, body, phone, merchant_id } = parsed;
  if (!driver_id || !title || !body) {
    return NextResponse.json({ error: "driver_id, title, body required" }, { status: 400 });
  }

  // ── Try Web Push ──────────────────────────────────────────────────────────
  if (adminDb) {
    const { data: sub } = await adminDb
      .from("driver_push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("driver_id", driver_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub) {
      try {
        const result = await sendWebPush(
          sub.endpoint as string,
          sub.p256dh as string,
          sub.auth_key as string,
          { title, body },
        );

        if (result.ok) {
          return NextResponse.json({ sent: "push" });
        }

        // Subscription gone — clean it up
        if (result.status === 410 || result.status === 404) {
          await adminDb
            .from("driver_push_subscriptions")
            .delete()
            .eq("driver_id", driver_id)
            .eq("endpoint", sub.endpoint as string);
        }
        // Fall through to SMS
      } catch (err) {
        console.error("[push] sendWebPush error:", err instanceof Error ? err.message : err);
        // Fall through to SMS
      }
    }
  }

  // ── SMS fallback ──────────────────────────────────────────────────────────
  if (phone) {
    await sendSms(phone, `${title} — ${body}`, { merchantId: merchant_id });
    return NextResponse.json({ sent: "sms" });
  }

  return NextResponse.json({ sent: "none" });
}
