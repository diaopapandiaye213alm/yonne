/**
 * test-auth-rls.mjs — Vérifie que :
 *  1. signToken() encode bien sub = userId (UUID de users.id)
 *  2. Le client Supabase enrichi du JWT transmet correctement auth.uid()
 *  3. Les politiques RLS pour le rôle "driver" fonctionnent comme prévu
 *
 * Prérequis :
 *  - AUTH_SECRET dans .env.local = JWT Secret de votre projet Supabase
 *    (Dashboard → Settings → API → JWT Secret)
 *  - Colonne user_id présente sur la table drivers
 *  - Au moins un driver avec user_id renseigné (linked to a users.id)
 *
 * Usage : node scripts/test-auth-rls.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import ws from "ws";

// Node 20 n'a pas de WebSocket natif — on le fournit au client Supabase
const SUPABASE_OPTS_BASE = {
  auth:           { persistSession: false },
  realtime:       { transport: ws },
};

// ── Charger .env.local ────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((s, i) => (i === 0 ? s.trim() : l.slice(l.indexOf("=") + 1).trim())))
);

const AUTH_SECRET   = envVars["AUTH_SECRET"];
const SUPABASE_URL  = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_ANON = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!AUTH_SECRET || !SUPABASE_URL || !SUPABASE_ANON) {
  console.error("❌  Variables d'environnement manquantes (.env.local)");
  process.exit(1);
}

const SECRET_BYTES = new TextEncoder().encode(AUTH_SECRET);

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✅  ${label}`);
  passed++;
}

function fail(label, detail) {
  console.log(`  ❌  ${label}`);
  if (detail) console.log(`       → ${detail}`);
  failed++;
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(60 - title.length)}`);
}

// Crée un client Supabase authentifié avec un JWT custom
function supabaseWithJwt(jwt) {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    ...SUPABASE_OPTS_BASE,
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

// Signe un JWT de test (même logique que lib/auth.ts)
async function signTestToken(userId, role) {
  return new SignJWT({
    role:        "authenticated",  // rôle DB Supabase standard
    app_role:    role,             // rôle applicatif lu par yonne_role()
    userId,
    email:       `test-${role}@yonne.sn`,
    displayName: `Test ${role}`,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("1h")
    .sign(SECRET_BYTES);
}

// ── TEST 1 : Structure du JWT ─────────────────────────────────────────────────

section("1. Structure du JWT (sub = userId)");

// UUID factice pour les tests de structure — pas utilisé pour RLS
const FAKE_UUID = "00000000-0000-4000-8000-000000000001";

const token = await signTestToken(FAKE_UUID, "driver");
const raw   = decodeJwt(token);

if (raw.sub === FAKE_UUID) {
  ok(`claim "sub" = "${raw.sub}"`);
} else {
  fail(`claim "sub" attendu "${FAKE_UUID}", reçu "${raw.sub}"`);
}

if (raw.app_role === "driver") {
  ok(`claim "app_role" = "driver" (role DB = "${raw.role}")`);
} else {
  fail(`claim "app_role" attendu "driver", reçu "${raw.app_role}" (role DB = "${raw.role}")`);
}

if (raw.exp && raw.exp > Date.now() / 1000) {
  ok(`token non expiré (exp=${new Date(raw.exp * 1000).toISOString()})`);
} else {
  fail("token expiré ou exp manquant");
}

// ── TEST 2 : Vérification avec le secret ─────────────────────────────────────

section("2. Vérification cryptographique (jwtVerify avec AUTH_SECRET)");

try {
  const { payload } = await jwtVerify(token, SECRET_BYTES);
  if (payload.sub === FAKE_UUID) {
    ok("jwtVerify() réussit — secret AUTH_SECRET valide");
  } else {
    fail("jwtVerify() OK mais sub ne correspond pas");
  }
} catch (e) {
  fail(`jwtVerify() a échoué : ${e.message}`);
  console.log("   ℹ️   Vérifiez que AUTH_SECRET est bien le JWT Secret du projet Supabase");
  console.log("       Dashboard → Settings → API → JWT Secret");
}

// ── TEST 3 : RLS driver — lecture drivers (toutes les lignes) ─────────────────

section("3. RLS driver — SELECT all drivers");

// On récupère d'abord un driver réel avec user_id pour les tests suivants
const adminClient = createClient(SUPABASE_URL, envVars["SUPABASE_SERVICE_ROLE_KEY"] ?? SUPABASE_ANON, SUPABASE_OPTS_BASE);
const { data: allDrivers } = await adminClient.from("drivers").select("id, user_id").limit(10);

let driverWithUserId = allDrivers?.find((d) => d.user_id);
let tempBackfillDone = false;

// Backfill temporaire : lie le 1er user driver existant au 1er driver row
// (annulé en fin de script — données de démo sans register)
if (!driverWithUserId) {
  const { data: driverUsers } = await adminClient
    .from("users")
    .select("id, email")
    .eq("role", "driver")
    .limit(1);
  const firstDriverUser = driverUsers?.[0];
  const firstDriver     = allDrivers?.[0];

  if (firstDriverUser && firstDriver) {
    await adminClient
      .from("drivers")
      .update({ user_id: firstDriverUser.id })
      .eq("id", firstDriver.id);
    driverWithUserId = { id: firstDriver.id, user_id: firstDriverUser.id };
    tempBackfillDone = true;
    console.log(`  ℹ️   Backfill temporaire : drivers.${firstDriver.id}.user_id = ${firstDriverUser.id}`);
    console.log(`       (lié à ${firstDriverUser.email} — sera annulé en fin de script)\n`);
  } else {
    console.log("  ⚠️   Aucun driver avec user_id trouvé et backfill impossible.");
    console.log("       Vérifiez que la table users contient au moins un role='driver'.");
  }
}

if (driverWithUserId) {
  const driverUserId = driverWithUserId.user_id;
  const driverJwt    = await signTestToken(driverUserId, "driver");
  const db           = supabaseWithJwt(driverJwt);

  // 3a. SELECT toutes les lignes drivers (policy "driver read all drivers")
  const { data: rows, error: selErr } = await db.from("drivers").select("id").limit(20);
  if (selErr) {
    fail(`SELECT drivers a été bloqué : ${selErr.message}`);
    console.log("   ℹ️   Vérifiez que la policy 'driver read all drivers' est active et que le JWT Secret Supabase = AUTH_SECRET");
  } else if (!rows || rows.length === 0) {
    fail("SELECT drivers a retourné 0 lignes (attendu ≥ 1)");
  } else {
    ok(`SELECT drivers → ${rows.length} ligne(s) visibles (toutes)`);
  }

  // 3b. UPDATE sa propre ligne (policy "driver update own row")
  const ownDriverId = driverWithUserId.id;
  const { error: ownUpd } = await db
    .from("drivers")
    .update({ online: false })
    .eq("id", ownDriverId);

  if (ownUpd) {
    fail(`UPDATE propre ligne bloqué : ${ownUpd.message}`);
  } else {
    ok(`UPDATE propre ligne (id=${ownDriverId}) → autorisé`);
  }

  // 3c. UPDATE une autre ligne (policy doit bloquer)
  const otherDriver = allDrivers?.find((d) => d.id !== ownDriverId);
  if (otherDriver) {
    const { data: otherData, error: otherErr } = await db
      .from("drivers")
      .update({ online: false })
      .eq("id", otherDriver.id)
      .select();

    // Supabase retourne data=[] (0 lignes) sans erreur quand RLS filtre silencieusement
    if (otherErr) {
      ok(`UPDATE ligne tierce → rejeté par RLS (${otherErr.message})`);
    } else if (!otherData || otherData.length === 0) {
      ok(`UPDATE ligne tierce (id=${otherDriver.id}) → filtré par RLS (0 lignes affectées)`);
    } else {
      fail(`UPDATE ligne tierce a affecté ${otherData.length} ligne(s) — policy 'driver update own row' inactive ?`);
    }
  }

  // ── TEST 4 : RLS driver — commandes ─────────────────────────────────────────
  section("4. RLS driver — SELECT orders (uniquement ses commandes)");

  const { data: myOrders, error: ordErr } = await db
    .from("orders")
    .select("id, driver_id")
    .limit(20);

  if (ordErr) {
    fail(`SELECT orders bloqué : ${ordErr.message}`);
  } else {
    const alien = myOrders?.find((o) => o.driver_id !== ownDriverId);
    if (alien) {
      fail(`Des commandes d'autres drivers sont visibles (driver_id=${alien.driver_id})`);
    } else {
      ok(`SELECT orders → ${myOrders?.length ?? 0} commande(s), toutes driver_id = "${ownDriverId}"`);
    }
  }

  // ── TEST 5 : auth.uid() cohérence via une fonction SQL custom ────────────────
  section("5. Contrôle direct : auth.uid() dans Postgres");

  let uidRow = null, uidErr = null;
  try {
    const res = await db.rpc("check_auth_uid").maybeSingle();
    uidRow = res.data;
    uidErr = res.error;
  } catch {
    uidErr = { message: "RPC check_auth_uid non disponible" };
  }

  if (uidErr) {
    // La fonction n'existe probablement pas — c'est attendu, on affiche le SQL à lancer manuellement
    console.log("  ℹ️   Vérification auth.uid() manuelle : collez dans le SQL Editor Supabase :");
    console.log(`
    -- Injectez le header Authorization: Bearer <token> dans le client REST Supabase,
    -- puis lancez (fonctionne via l'API REST, pas le SQL Editor direct) :
    select auth.uid() as uid, auth.jwt() ->> 'app_role' as app_role;

    -- Résultat attendu :
    --   uid      | ${driverUserId}
    --   app_role | driver
    `);
    console.log(`  ℹ️   Token driver de test (valable 1h) :`);
    console.log(`       ${driverJwt.slice(0, 80)}…`);
  } else if (uidRow?.uid === driverUserId) {
    ok(`auth.uid() = "${uidRow.uid}" correspond au userId du token`);
  } else {
    fail(`auth.uid() = "${uidRow?.uid}" ≠ userId attendu "${driverUserId}"`);
    console.log("   ℹ️   AUTH_SECRET ≠ JWT Secret Supabase → les tokens ne sont pas vérifiables par Postgres");
  }
}

// ── Résumé ────────────────────────────────────────────────────────────────────

section("Résumé");
console.log(`  ${passed} test(s) passés  |  ${failed} échec(s)\n`);

// ── Rollback du backfill temporaire ──────────────────────────────────────────
if (tempBackfillDone && driverWithUserId) {
  await adminClient
    .from("drivers")
    .update({ user_id: null })
    .eq("id", driverWithUserId.id);
  console.log(`  ↩️   Backfill annulé : drivers.${driverWithUserId.id}.user_id remis à null\n`);
}

if (failed > 0) {
  console.log("Points de vérification si des tests échouent :");
  console.log("  A. Dashboard Supabase → Settings → API → JWT Secret");
  console.log("     → doit être identique à AUTH_SECRET dans .env.local");
  console.log("  B. Pour les drivers seedés en démo, exécutez dans le SQL Editor :");
  console.log("     UPDATE drivers d SET user_id = u.id");
  console.log("       FROM users u WHERE u.role = 'driver'");
  console.log("       ORDER BY u.created_at LIMIT 1;  -- adapter selon votre logique");
  console.log("  C. lib/supabase.ts ne transmet pas le JWT — voir note en fin de script");
  process.exit(1);
}

// ── Note architecturale ───────────────────────────────────────────────────────
console.log("Note : lib/supabase.ts (client browser) ne transmet pas le JWT yonne_session.");
console.log("Pour que auth.uid() fonctionne côté client, créez un client enrichi :");
console.log(`
  // lib/supabase-authed.ts (server component ou API route)
  import { cookies } from "next/headers";
  import { createClient } from "@supabase/supabase-js";
  export function supabaseAuthed() {
    const token = cookies().get("yonne_session")?.value ?? "";
    return createClient(url, anonKey, {
      global: { headers: { Authorization: \`Bearer \${token}\` } },
    });
  }
`);
