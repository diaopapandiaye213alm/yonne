// lib/mock-data/drivers.ts
export type Badge = "Rapide" | "Top noté" | "Précis" | "10 jours" | "50 courses" | "Eco";
export type Tier = "Bronze" | "Argent" | "Or";

export interface Driver {
  id: string;
  name: string;
  avatarSeed: string;
  phone: string;
  vehicle: "Moto Yamaha" | "Moto TVS" | "Vélo électrique" | "Tricycle";
  scoreIA: number;          // 0-100
  rating: number;           // 0-5
  tier: Tier;
  badges: Badge[];
  ordersToday: number;
  earningsToday: number;    // FCFA
  online: boolean;
  inPrayer: boolean;
  lat: number;
  lng: number;
}

const senegaleseFirstNames = ["Ibrahima","Aminata","Moussa","Fatou","Cheikh","Awa","Modou","Babacar","Mariama","Ousmane","Aïssatou","Pape","Ndèye","Mamadou","Khady","Abdoulaye","Astou","Lamine","Coumba","Souleymane","Aïda","Saliou","Bineta","Daouda","Ramatoulaye","Insa","Yacine","Boubacar","Fanta","Idrissa","Sokhna","Demba","Maty","Tidiane","Adama","Penda","Serigne","Anta","Bara","Maguette","Khadim"];
const senegaleseLastNames = ["Sow","Diop","Ndiaye","Sarr","Diouf","Fall","Mbaye","Cissé","Ba","Niang","Sy","Faye","Wade","Gueye","Sène","Thiaw","Ka","Kane","Sané","Touré","Camara","Bâ","Coly","Diagne","Diallo","Toure","Seck","Bop","Goudiaby","Manga","Badji","Fofana","Niasse","Tine","Mané","Konaté","Mendy","Boye","Pouye","Ly","Dramé"];
const vehicles: Driver["vehicle"][] = ["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"];
const tiers: Tier[] = ["Bronze","Argent","Or"];
const allBadges: Badge[] = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"];

// Coords roughly inside Dakar metropolitan area
const dakarBox = { latMin: 14.660, latMax: 14.760, lngMin: -17.520, lngMax: -17.380 };

function rand(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(rand(seed, 0, arr.length))];
}

export const drivers: Driver[] = Array.from({ length: 41 }, (_, i) => {
  const id = `drv-${String(i + 1).padStart(3, "0")}`;
  const first = pick(senegaleseFirstNames, i * 7 + 1);
  const last = pick(senegaleseLastNames, i * 11 + 3);
  const tier = pick(tiers, i * 3 + 5);
  const badgeCount = 2 + Math.floor(rand(i + 13, 0, 3));
  const badges = Array.from(new Set(Array.from({ length: badgeCount }, (_, k) => pick(allBadges, i * 17 + k * 5))));
  return {
    id,
    name: `${first} ${last}`,
    avatarSeed: `${first}${last}${i}`,
    phone: `+221 77 ${String(Math.floor(rand(i + 1, 100, 999)))} ${String(Math.floor(rand(i + 2, 1000, 9999)))}`,
    vehicle: pick(vehicles, i * 5 + 7),
    scoreIA: Math.floor(rand(i + 19, 65, 99)),
    rating: Math.round(rand(i + 23, 4.0, 5.0) * 10) / 10,
    tier,
    badges,
    ordersToday: Math.floor(rand(i + 29, 4, 22)),
    earningsToday: Math.floor(rand(i + 31, 12_000, 58_000) / 100) * 100,
    online: i < 28,        // first 28 online
    inPrayer: i >= 25 && i < 28,
    lat: rand(i + 37, dakarBox.latMin, dakarBox.latMax),
    lng: rand(i + 41, dakarBox.lngMin, dakarBox.lngMax),
  };
});

export function avatarUrl(driver: Driver) {
  return `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(driver.avatarSeed)}`;
}

export function topDriversToday(limit = 5) {
  return [...drivers]
    .sort((a, b) => b.earningsToday - a.earningsToday)
    .slice(0, limit);
}
