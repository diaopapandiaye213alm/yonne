/**
 * Seed Supabase with YONNE mock data.
 * Run: node scripts/seed-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const URL  = "https://jugajqiggyvkbjlrsmvq.supabase.co";
const KEY  = "sb_publishable_at3euPzj3aAyofQNFvChTw_w3gk4sBE";
const sb   = createClient(URL, KEY, { realtime: { transport: ws } });

// ── Helpers ─────────────────────────────────────────────────
function rand(seed, min, max) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
function pick(arr, seed) { return arr[Math.floor(rand(seed, 0, arr.length))]; }

// ── Drivers ─────────────────────────────────────────────────
const firstNames = ["Ibrahima","Aminata","Moussa","Fatou","Cheikh","Awa","Modou","Babacar","Mariama","Ousmane","Aïssatou","Pape","Ndèye","Mamadou","Khady","Abdoulaye","Astou","Lamine","Coumba","Souleymane","Aïda","Saliou","Bineta","Daouda","Ramatoulaye","Insa","Yacine","Boubacar","Fanta","Idrissa","Sokhna","Demba","Maty","Tidiane","Adama","Penda","Serigne","Anta","Bara","Maguette","Khadim"];
const lastNames  = ["Sow","Diop","Ndiaye","Sarr","Diouf","Fall","Mbaye","Cissé","Ba","Niang","Sy","Faye","Wade","Gueye","Sène","Thiaw","Ka","Kane","Sané","Touré","Camara","Bâ","Coly","Diagne","Diallo","Toure","Seck","Bop","Goudiaby","Manga","Badji","Fofana","Niasse","Tine","Mané","Konaté","Mendy","Boye","Pouye","Ly","Dramé"];
const vehicles   = ["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"];
const tiers      = ["Bronze","Argent","Or"];
const allBadges  = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"];
const dakarBox   = { latMin: 14.660, latMax: 14.760, lngMin: -17.520, lngMax: -17.380 };

const drivers = Array.from({ length: 41 }, (_, i) => {
  const first = pick(firstNames, i * 7 + 1);
  const last  = pick(lastNames,  i * 11 + 3);
  const badgeCount = 2 + Math.floor(rand(i + 13, 0, 3));
  const badges = [...new Set(Array.from({ length: badgeCount }, (_, k) => pick(allBadges, i * 17 + k * 5)))];
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
    online: i < 28,
    in_prayer: i >= 25 && i < 28,
    lat: rand(i + 37, dakarBox.latMin, dakarBox.latMax),
    lng: rand(i + 41, dakarBox.lngMin, dakarBox.lngMax),
  };
});

// ── Merchants ────────────────────────────────────────────────
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
  email: `contact${i + 1}@${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "")}.sn`,
  phone: `+221 77 ${String(Math.floor(rand(i + 1, 100, 999)))} ${String(Math.floor(rand(i + 2, 1000, 9999)))}`,
  city: pick(cities, i + 3),
  plan: pick(plans, i + 5),
  status: i < 8 ? "actif" : "suspendu",
  orders_this_month:  Math.floor(rand(i + 7,  40,       400)),
  revenue_this_month: Math.floor(rand(i + 9,  200000,   2000000) / 1000) * 1000,
  orders_last_month:  Math.floor(rand(i + 15, 30,       380)),
  revenue_last_month: Math.floor(rand(i + 17, 150000,   1800000) / 1000) * 1000,
  joined_at: new Date(2025, Math.floor(rand(i + 11, 0, 12)), Math.floor(rand(i + 13, 1, 28)) + 1)
    .toISOString().split("T")[0],
}));

// ── Orders ───────────────────────────────────────────────────
const clientFirstNames = ["Awa","Moussa","Mariama","Pape","Khady","Cheikh","Fatou","Ibrahima","Aminata","Modou"];
const clientLastNames  = ["Diop","Sow","Mbaye","Cissé","Ndiaye","Sarr","Diouf","Fall","Ba","Niang"];
const statuses = ["créée","assignée","collecte","en route","livrée"];
const methods  = ["wave","orange","cash"];
const landmarkIds = Array.from({ length: 30 }, (_, i) => `lmk-${String(i+1).padStart(3,"0")}`);

const baseDate = new Date("2026-05-20T08:00:00+00:00");

const orders = Array.from({ length: 147 }, (_, i) => {
  const driverIdx  = Math.floor(rand(i + 11, 0, 41));
  const lmkIdx     = Math.floor(rand(i + 17, 0, landmarkIds.length));
  const statusIdx  = i < 12 ? Math.floor(rand(i + 23, 1, 4)) : Math.floor(rand(i + 29, 0, 5));
  const minsOffset = Math.floor(rand(i + 31, 0, 600));
  return {
    id: `YN-2026-${String(10000 + i)}`,
    driver_id: `drv-${String(driverIdx + 1).padStart(3, "0")}`,
    merchant_id: pick(merchants, i + 7).id,
    landmark_id: landmarkIds[lmkIdx],
    client_name: `${pick(clientFirstNames, i + 41)} ${pick(clientLastNames, i + 43)}`,
    client_phone: `+221 7${rand(i, 0, 1) < 0.5 ? "7" : "8"} ${String(Math.floor(rand(i + 47, 100, 999)))} ${String(Math.floor(rand(i + 53, 1000, 9999)))}`,
    amount: Math.floor(rand(i + 59, 3500, 28000) / 100) * 100,
    payment_method: pick(methods, i + 61),
    insurance: rand(i + 67, 0, 1) > 0.7,
    status: statuses[statusIdx],
    active: i < 12,
    created_at: new Date(baseDate.getTime() + minsOffset * 60000).toISOString(),
  };
});

// ── Seed ─────────────────────────────────────────────────────
async function seed() {
  console.log("🚀 Seeding Supabase...\n");

  console.log(`📦 Inserting ${drivers.length} drivers...`);
  const { error: e1 } = await sb.from("drivers").upsert(drivers, { onConflict: "id" });
  if (e1) { console.error("❌ Drivers:", e1.message); process.exit(1); }
  console.log("✅ Drivers OK");

  console.log(`🏪 Inserting ${merchants.length} merchants...`);
  const { error: e2 } = await sb.from("merchants").upsert(merchants, { onConflict: "id" });
  if (e2) { console.error("❌ Merchants:", e2.message); process.exit(1); }
  console.log("✅ Merchants OK");

  console.log(`📋 Inserting ${orders.length} orders...`);
  const { error: e3 } = await sb.from("orders").upsert(orders, { onConflict: "id" });
  if (e3) { console.error("❌ Orders:", e3.message); process.exit(1); }
  console.log("✅ Orders OK");

  console.log("\n🎉 Seed complet !");
}

seed().catch(console.error);
