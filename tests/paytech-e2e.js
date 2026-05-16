#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════
//  YONNE — PayTech IPN End-to-End Smoke Test
//
//  Simule un appel IPN PayTech complet (sale_complete) avec les
//  empreintes SHA-256 authentiques des clés API.
//  Valide que le Route Handler accepte la requête et appelle
//  process_payment_webhook via Supabase.
//
//  Usage :
//    node tests/paytech-e2e.js                              → localhost:3000
//    node tests/paytech-e2e.js --prod                       → yonne-sigma.vercel.app
//    node tests/paytech-e2e.js --prod --order=YN-2026-ABCD → order_id spécifique
//    node tests/paytech-e2e.js --method=orange-money        → Orange Money
// ══════════════════════════════════════════════════════════════════

"use strict";
const crypto = require("crypto");
const path   = require("path");
const fs     = require("fs");

// ── Chargement .env.local ─────────────────────────────────────────
try {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim();
      if (!(k in process.env)) process.env[k] = v;
    }
  }
} catch { /* vars come from system env in CI */ }

// ── CLI args ──────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const isProd    = args.includes("--prod");
const orderArg  = args.find(a => a.startsWith("--order="));
const methodArg = args.find(a => a.startsWith("--method="));
const orderId   = orderArg
  ? orderArg.split("=")[1]
  : `YN-2026-SMOKE${Date.now().toString(16).toUpperCase().slice(-6)}`;
const method    = methodArg ? methodArg.split("=")[1] : "wave";

const BASE_URL = isProd
  ? (process.env.APP_URL ?? "https://yonne-sigma.vercel.app")
  : "http://localhost:3000";

// ── Clés PayTech ──────────────────────────────────────────────────
const PAYTECH_API_KEY    = process.env.PAYTECH_API_KEY    ?? "";
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET ?? "";

if (!PAYTECH_API_KEY || !PAYTECH_API_SECRET) {
  console.error("\n❌ PAYTECH_API_KEY / PAYTECH_API_SECRET manquants dans .env.local\n");
  process.exit(1);
}

// ── Calcul des empreintes SHA-256 (identique à ce que PayTech envoie) ──
// RFC : PayTech inclut sha256(api_key) et sha256(api_secret) dans chaque IPN.
// Notre handler (lib/paytech.ts::verifyPayTechIpn) fait timingSafeEqual sur ces valeurs.
const apiKeyHash    = crypto.createHash("sha256").update(PAYTECH_API_KEY).digest("hex");
const apiSecretHash = crypto.createHash("sha256").update(PAYTECH_API_SECRET).digest("hex");

// ── Payload IPN PayTech ───────────────────────────────────────────
const token  = `pt_smoke_${crypto.randomBytes(14).toString("hex")}`;
const amount = 15000; // 15 000 F XOF — montant de test réaliste

const payload = new URLSearchParams({
  type_event:        "sale_complete",
  ref_command:       orderId,
  item_name:         `Livraison YONNE — ${orderId}`,
  item_price:        String(amount),
  devise:            "XOF",
  command_name:      `Livraison YONNE — ${orderId}`,
  payment_method:    method,
  client_phone:      "+221771234567",
  token,
  env:               "prod",
  // Empreintes SHA-256 — mécanisme de vérification d'authenticité PayTech
  api_key_sha256:    apiKeyHash,
  api_secret_sha256: apiSecretHash,
});

const TARGET = `${BASE_URL}/api/webhooks/paytech`;

// ── Affichage ─────────────────────────────────────────────────────
const BOLD  = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED   = "\x1b[31m";
const DIM   = "\x1b[2m";
const RESET = "\x1b[0m";

console.log();
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}   YONNE — PayTech IPN Smoke Test${RESET}`);
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log(`  Cible        : ${TARGET}`);
console.log(`  Order ID     : ${orderId}`);
console.log(`  Montant      : ${amount.toLocaleString("fr-FR")} F XOF`);
console.log(`  Méthode      : ${method}`);
console.log(`  Token IPN    : ${token}`);
console.log(`  Env          : ${isProd ? "PRODUCTION" : "local"}`);
console.log(`  SHA-256 key  : ${apiKeyHash.slice(0, 8)}…${apiKeyHash.slice(-8)} ${DIM}[vérification en temps constant]${RESET}`);
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log(`  Envoi du payload IPN…`);
console.log();

// ── Requête HTTP ──────────────────────────────────────────────────
(async () => {
  let res;
  const start = Date.now();

  try {
    res = await fetch(TARGET, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    payload.toString(),
    });
  } catch (e) {
    console.error(`${RED}❌ Impossible de joindre le serveur :${RESET}`, e.message);
    console.error(`   → Vérifiez que 'npm run dev' tourne sur le port 3000 (local)\n`);
    process.exit(1);
  }

  const elapsed = Date.now() - start;
  const rawBody = await res.text();
  let parsed;
  try { parsed = JSON.parse(rawBody); } catch { parsed = rawBody; }

  // ── Interprétation du résultat ────────────────────────────────
  const ok = res.status === 200 && parsed?.received === true;

  console.log(`  Status HTTP   : ${res.status} ${res.statusText} ${DIM}(${elapsed}ms)${RESET}`);
  console.log(`  Corps réponse : ${JSON.stringify(parsed)}`);
  console.log();

  if (ok) {
    console.log(`${GREEN}${BOLD}  ✅  IPN ACCEPTÉ — Paiement enregistré${RESET}`);
    console.log();
    console.log(`  ${DIM}Requêtes SQL de vérification :${RESET}`);
    console.log();
    console.log(`  ${DIM}-- Vérifie que le paiement est enregistré dans payment_events${RESET}`);
    console.log(`  SELECT event_id, order_id, provider, amount, status`);
    console.log(`  FROM payment_events`);
    console.log(`  WHERE event_id = '${token}';`);
    console.log();
    console.log(`  ${DIM}-- Vérifie que la session PayTech est marquée 'completed'${RESET}`);
    console.log(`  SELECT token, order_id, status, completed_at`);
    console.log(`  FROM paytech_sessions`);
    console.log(`  WHERE token = '${token}';`);
    console.log();
    console.log(`  ${DIM}-- Vérifie que le revenu marchand a été mis à jour${RESET}`);
    console.log(`  SELECT revenue_this_month, orders_this_month`);
    console.log(`  FROM merchants`);
    console.log(`  WHERE id = (SELECT merchant_id FROM orders WHERE id = '${orderId}');`);
  } else if (res.status === 401) {
    console.log(`${RED}${BOLD}  ❌  SIGNATURE REJETÉE${RESET}`);
    console.log(`  → Vérifiez PAYTECH_API_KEY et PAYTECH_API_SECRET`);
    console.log(`  → Les empreintes SHA-256 doivent correspondre exactement`);
  } else if (res.status === 400) {
    console.log(`${RED}${BOLD}  ❌  PAYLOAD INVALIDE — champs manquants${RESET}`);
    console.log(`  → Détail :`, parsed);
  } else {
    console.log(`\x1b[33m${BOLD}  ⚠️   RÉPONSE INATTENDUE${RESET}`);
    console.log(`  → Consultez les logs Vercel (dashboard → Functions → Logs)`);
  }

  console.log();
  console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
  console.log();
  process.exit(ok ? 0 : 1);
})();
