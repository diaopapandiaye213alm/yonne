#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════
//  YONNE — Production Readiness Guard
//  Usage : node scripts/check-production-ready.js
//
//  Valide la configuration critique avant d'ouvrir les vannes aux
//  marchands. Charge automatiquement .env.local si présent.
//  ✅ / ❌ par contrôle — exit 1 si au moins un contrôle échoue.
//  Aucun secret n'est affiché en clair (masquage 6…4 chars).
// ══════════════════════════════════════════════════════════════════

"use strict";
const path = require("path");
const fs   = require("fs");

// ── Chargement .env.local (développement / CI local) ─────────────
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
} catch { /* ignore — vars may come from system env */ }

// ── Helpers ───────────────────────────────────────────────────────
const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

let allOk   = true;
let results = [];

function check(label, ok, detail = "") {
  const icon = ok ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
  const detailStr = detail
    ? ` ${DIM}→ ${detail}${RESET}`
    : "";
  results.push({ label, ok, detail });
  console.log(`  ${icon}  ${label}${detailStr}`);
  if (!ok) allOk = false;
}

function warn(label, detail = "") {
  console.log(`  ${YELLOW}⚠️ ${RESET}  ${label} ${DIM}→ ${detail}${RESET}`);
}

function mask(val) {
  if (!val || val.length < 10) return val ? "(trop court)" : "(non défini)";
  return `${val.slice(0, 6)}…${val.slice(-4)} [${val.length} chars]`;
}

// ── En-tête ───────────────────────────────────────────────────────
console.log();
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}   YONNE — Production Readiness Guard${RESET}`);
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log();

// ── Bloc 1 : Domaine & environnement ─────────────────────────────
console.log(`${BOLD}  [1/3] Domaine & Environnement${RESET}`);

const EXPECTED_URL = "https://yonne-sigma.vercel.app";
const appUrl = process.env.APP_URL ?? "";
check(
  "APP_URL pointe vers le domaine de production",
  appUrl === EXPECTED_URL,
  appUrl || "(vide)"
);

const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "";
check(
  "NEXT_PUBLIC_APP_ENV = 'production' (simulation terrain bloquée)",
  appEnv === "production",
  appEnv ? `valeur actuelle : '${appEnv}'` : "(vide — simulation NON bloquée !)"
);

console.log();

// ── Bloc 2 : PayTech ──────────────────────────────────────────────
console.log(`${BOLD}  [2/3] PayTech Sénégal${RESET}`);

// Les clés PayTech sont des hex SHA-256 de 64 chars
const EXPECTED_PAYTECH_KEY_LEN = 64;

const ptKey = process.env.PAYTECH_API_KEY ?? "";
check(
  "PAYTECH_API_KEY défini et longueur conforme (64 chars hex)",
  ptKey.length === EXPECTED_PAYTECH_KEY_LEN && /^[0-9a-f]+$/i.test(ptKey),
  mask(ptKey)
);

const ptSecret = process.env.PAYTECH_API_SECRET ?? "";
check(
  "PAYTECH_API_SECRET défini et longueur conforme (64 chars hex)",
  ptSecret.length === EXPECTED_PAYTECH_KEY_LEN && /^[0-9a-f]+$/i.test(ptSecret),
  mask(ptSecret)
);

const ptUrlOk = (process.env.APP_URL ?? "").startsWith("https://");
check(
  "APP_URL utilise HTTPS (IPN PayTech requiert TLS)",
  ptUrlOk,
  ptUrlOk ? "ok" : "protocole HTTP non accepté par PayTech en production"
);

console.log();

// ── Bloc 3 : Supabase & Auth ──────────────────────────────────────
console.log(`${BOLD}  [3/3] Supabase & Authentification${RESET}`);

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
check(
  "NEXT_PUBLIC_SUPABASE_URL défini",
  sbUrl.startsWith("https://") && sbUrl.includes("supabase"),
  sbUrl ? sbUrl.slice(0, 38) + "…" : "(vide)"
);

const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
check(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY défini",
  sbAnon.length > 20,
  mask(sbAnon)
);

const sbService = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
check(
  "SUPABASE_SERVICE_ROLE_KEY défini (service-role, server-only)",
  sbService.length > 20,
  mask(sbService)
);

const authSecret = process.env.AUTH_SECRET ?? "";
check(
  "AUTH_SECRET défini (≥ 32 chars, JWT signing)",
  authSecret.length >= 32,
  mask(authSecret)
);

// ── Avertissements non-bloquants ──────────────────────────────────
console.log();
console.log(`${BOLD}  Avertissements (non bloquants)${RESET}`);

const vapidPub = process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
if (!vapidPub) {
  warn("VAPID_PUBLIC_KEY manquant", "Push Notifications livreurs désactivées (SMS fallback actif)");
} else {
  console.log(`  ${GREEN}ℹ️ ${RESET}  Push Notifications configurées ${DIM}→ ${mask(vapidPub)}${RESET}`);
}

const atKey = process.env.AT_API_KEY ?? "";
if (!atKey) {
  warn("AT_API_KEY manquant", "Fallback SMS Africa's Talking désactivé");
} else {
  console.log(`  ${GREEN}ℹ️ ${RESET}  SMS Africa's Talking configuré ${DIM}→ ${mask(atKey)}${RESET}`);
}

// ── Résultat final ────────────────────────────────────────────────
console.log();
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
if (allOk) {
  console.log(`${GREEN}${BOLD}  ✅  PRÊT POUR LA PRODUCTION — ouverture marchands autorisée${RESET}`);
} else {
  const failed = results.filter(r => !r.ok).length;
  console.log(`${RED}${BOLD}  ❌  ${failed} CONTRÔLE(S) ÉCHOUÉ(S) — NE PAS OUVRIR AUX MARCHANDS${RESET}`);
  console.log();
  console.log(`${RED}  Échecs :${RESET}`);
  results.filter(r => !r.ok).forEach(r => {
    console.log(`${RED}    • ${r.label}${RESET}`);
  });
}
console.log(`${BOLD}══════════════════════════════════════════════════${RESET}`);
console.log();

process.exit(allOk ? 0 : 1);
