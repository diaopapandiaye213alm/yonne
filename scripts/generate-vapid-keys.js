#!/usr/bin/env node
// Generate VAPID key pair for Web Push notifications.
// Run once: node scripts/generate-vapid-keys.js
// Then add the output to your Vercel environment variables:
//   VAPID_PUBLIC_KEY   → server env
//   VAPID_PRIVATE_KEY  → server env (never expose client-side)
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY → same value as VAPID_PUBLIC_KEY (public, client-safe)

const { generateKeyPairSync } = require("crypto");

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });

// Export uncompressed public key (65 bytes, starts with 0x04)
const pubDer  = publicKey.export({ type: "spki", format: "der" });
const pubRaw  = pubDer.subarray(pubDer.length - 65); // last 65 bytes = uncompressed point

// Export raw private scalar (32 bytes from the private key DER)
const privDer = privateKey.export({ type: "pkcs8", format: "der" });
// The private scalar is the last 32 bytes in a PKCS#8 EC private key
const privRaw = privDer.subarray(privDer.length - 32);

console.log("Add these to Vercel Dashboard → Settings → Environment Variables:\n");
console.log(`VAPID_PUBLIC_KEY=${pubRaw.toString("base64url")}`);
console.log(`VAPID_PRIVATE_KEY=${privRaw.toString("base64url")}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${pubRaw.toString("base64url")}`);
