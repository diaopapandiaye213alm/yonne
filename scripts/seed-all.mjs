/**
 * Seed complet YONNE — users + drivers + merchants + orders
 * Utilise la service_role key pour bypasser RLS.
 * Usage: node scripts/seed-all.mjs
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import ws from "ws";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
          ?? "https://jugajqiggyvkbjlrsmvq.supabase.co";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local"); process.exit(1); }
const sb   = createClient(URL, KEY, { realtime: { transport: ws } });

// ── Helpers ─────────────────────────────────────────────────
function rand(seed, min, max) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
function pick(arr, seed) { return arr[Math.floor(rand(seed, 0, arr.length))]; }

// ─────────────────────────────────────────────────────────────
// 1. USERS (comptes login)
// ─────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { email: "admin@yonne.sn",            password: "Admin123!", role: "admin",    display_name: "Admin YONNE",      redirect_url: "/admin" },
  { email: "boutique.plateau@gmail.com", password: "Demo123!", role: "merchant", display_name: "Boutique Plateau", redirect_url: "/merchant/nouvelle-commande" },
  { email: "livreur.dakar@yonne.sn",    password: "Demo123!", role: "driver",   display_name: "Ibrahima Sow",     redirect_url: "/driver/carte" },
];

async function seedUsers() {
  console.log("\n🔐 Seeding users...");
  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    const { error } = await sb.from("users").upsert(
      { email: u.email, password_hash: hash, role: u.role, display_name: u.display_name, redirect_url: u.redirect_url },
      { onConflict: "email" }
    );
    console.log(error ? `  ❌ ${u.email}: ${error.message}` : `  ✅ ${u.email} (${u.role})`);
  }
}

// ─────────────────────────────────────────────────────────────
// 2. DRIVERS
// ─────────────────────────────────────────────────────────────
const firstNames = ["Ibrahima","Aminata","Moussa","Fatou","Cheikh","Awa","Modou","Babacar","Mariama","Ousmane","Aïssatou","Pape","Ndèye","Mamadou","Khady","Abdoulaye","Astou","Lamine","Coumba","Souleymane"];
const lastNames  = ["Sow","Diop","Ndiaye","Sarr","Diouf","Fall","Mbaye","Cissé","Ba","Niang","Sy","Faye","Wade","Gueye","Sène","Thiaw","Ka","Kane","Sané","Touré"];
const vehicles   = ["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"];
const tiers      = ["Bronze","Argent","Or"];
const allBadges  = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"];
const dakarBox   = { latMin: 14.660, latMax: 14.760, lngMin: -17.520, lngMax: -17.380 };

const drivers = Array.from({ length: 20 }, (_, i) => {
  const first = pick(firstNames, i * 7 + 1);
  const last  = pick(lastNames,  i * 11 + 3);
  const badges = [...new Set(Array.from({ length: 2 }, (_, k) => pick(allBadges, i * 17 + k * 5)))];
  return {
    id: `drv-${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    avatar_seed: `${first}${last}${i}`,
    phone: `+221 77 ${String(Math.floor(rand(i + 1, 100, 999)))} ${String(Math.floor(rand(i + 2, 1000, 9999)))}`,
    vehicle: pick(vehicles, i * 5 + 7),
    score_ia: Math.floor(rand(i + 19, 65, 99)),
    rating: Math.round(rand(i + 23, 4.0, 5.0) * 10) / 10,
    tier: pick(tiers, i * 3 + 5),
    badges,
    orders_today: Math.floor(rand(i + 29, 4, 22)),
    earnings_today: Math.floor(rand(i + 31, 12000, 58000) / 100) * 100,
    online: i < 12,
    in_prayer: i === 12,
    lat: rand(i + 37, dakarBox.latMin, dakarBox.latMax),
    lng: rand(i + 41, dakarBox.lngMin, dakarBox.lngMax),
  };
});

async function seedDrivers() {
  console.log("\n🛵 Seeding drivers...");
  const { error } = await sb.from("drivers").upsert(drivers, { onConflict: "id" });
  if (error) console.log(`  ❌ drivers: ${error.message}`);
  else console.log(`  ✅ ${drivers.length} livreurs insérés`);
}

// ─────────────────────────────────────────────────────────────
// 3. MERCHANTS
// ─────────────────────────────────────────────────────────────
const shopNames = [
  "Boutique Fatou Textile","Resto Keur Sénégal","Boulangerie du Plateau",
  "Pharma Médina","Superette Point E","Mode et Style Dakar",
  "Librairie Sandaga","Traiteur Mariama","Épicerie Colobane","Tech Shop VDN",
];
const cities = ["Dakar","Thiès","Saint-Louis","Touba"];
const plans  = ["Standard","Premium"];

const merchants = shopNames.map((name, i) => ({
  id: `mch-${String(i + 1).padStart(3, "0")}`,
  name,
  email: `contact${i + 1}@yonne.sn`,
  phone: `+221 77 ${String(Math.floor(rand(i + 1, 100, 999)))} ${String(Math.floor(rand(i + 2, 1000, 9999)))}`,
  city: pick(cities, i + 3),
  plan: pick(plans, i + 5),
  status: i < 8 ? "actif" : "suspendu",
  orders_this_month:  Math.floor(rand(i + 7,  40,  400)),
  revenue_this_month: Math.floor(rand(i + 9,  200000, 2000000) / 1000) * 1000,
  orders_last_month:  Math.floor(rand(i + 15, 30,  380)),
  revenue_last_month: Math.floor(rand(i + 17, 150000, 1800000) / 1000) * 1000,
  joined_at: new Date(2025, Math.floor(rand(i + 11, 0, 12)), Math.floor(rand(i + 13, 1, 28)) + 1)
    .toISOString().split("T")[0],
}));

async function seedMerchants() {
  console.log("\n🏪 Seeding merchants...");
  const { error } = await sb.from("merchants").upsert(merchants, { onConflict: "id" });
  if (error) console.log(`  ❌ merchants: ${error.message}`);
  else console.log(`  ✅ ${merchants.length} commerçants insérés`);
}

// ─────────────────────────────────────────────────────────────
// 4. ORDERS
// ─────────────────────────────────────────────────────────────
const clientFirstNames = ["Awa","Moussa","Mariama","Pape","Khady","Cheikh","Fatou","Ibrahima","Aminata","Modou"];
const clientLastNames  = ["Diop","Sow","Mbaye","Cissé","Ndiaye","Sarr","Diouf","Fall","Ba","Niang"];
const statuses = ["créée","assignée","collecte","en route","livrée"];
const methods  = ["wave","orange","cash"];
const landmarkIds = ["lm-001","lm-002","lm-003","lm-004","lm-005","lm-007","lm-008","lm-009","lm-010","lm-011","lm-013","lm-017","lm-023"];

const orders = Array.from({ length: 147 }, (_, i) => {
  const driverIdx = Math.floor(rand(i + 11, 0, drivers.length));
  const lmkIdx    = Math.floor(rand(i + 17, 0, landmarkIds.length));
  const statusIdx = i < 15 ? Math.floor(rand(i + 23, 1, 4)) : Math.floor(rand(i + 29, 0, statuses.length));
  const daysBack  = Math.floor(rand(i + 31, 0, 30));
  const date      = new Date(Date.now() - daysBack * 86400000 - Math.floor(rand(i + 33, 0, 86400000)));
  return {
    id: `YN-2026-${String(10000 + i)}`,
    driver_id: drivers[driverIdx].id,
    merchant_id: merchants[i % merchants.length].id,
    landmark_id: landmarkIds[lmkIdx],
    client_name: `${pick(clientFirstNames, i + 41)} ${pick(clientLastNames, i + 43)}`,
    client_phone: `+221 7${rand(i, 0, 1) < 0.5 ? "7" : "8"} ${String(Math.floor(rand(i + 47, 100, 999)))} ${String(Math.floor(rand(i + 53, 1000, 9999)))}`,
    amount: Math.floor(rand(i + 59, 3500, 28000) / 100) * 100,
    payment_method: pick(methods, i + 61),
    insurance: rand(i + 67, 0, 1) > 0.7,
    status: statuses[statusIdx % statuses.length],
    active: statusIdx >= 1 && statusIdx <= 3,
    created_at: date.toISOString(),
  };
});

async function seedOrders() {
  console.log("\n📦 Seeding orders...");
  // Insert in batches of 50
  for (let i = 0; i < orders.length; i += 50) {
    const batch = orders.slice(i, i + 50);
    const { error } = await sb.from("orders").upsert(batch, { onConflict: "id" });
    if (error) { console.log(`  ❌ batch ${i}-${i+50}: ${error.message}`); break; }
    else console.log(`  ✅ batch ${i + 1}–${Math.min(i + 50, orders.length)} insérés`);
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 YONNE — Seed complet (service role)\n");
  await seedUsers();
  await seedDrivers();
  await seedMerchants();
  await seedOrders();
  console.log("\n✅ Seed terminé !");
  console.log("\n📋 Comptes démo :");
  console.log("  admin    admin@yonne.sn            /  Admin123!");
  console.log("  merchant boutique.plateau@gmail.com /  Demo123!");
  console.log("  driver   livreur.dakar@yonne.sn    /  Demo123!");
}

main().catch(console.error);
