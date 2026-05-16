export type MerchantPlan   = "Standard" | "Premium";
export type MerchantStatus = "actif" | "suspendu";

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  plan: MerchantPlan;
  status: MerchantStatus;
  ordersThisMonth: number;
  revenueThisMonth: number;
  ordersLastMonth: number;
  revenueLastMonth: number;
  joinedAt: string;
  onboardingDone: boolean;
  notifWhatsapp: boolean;
  notifSms: boolean;
  notifEmail: boolean;
}

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}

const cities = ["Dakar", "Thiès", "Saint-Louis", "Touba"];
const plans: MerchantPlan[] = ["Standard", "Premium"];
const shopNames = [
  "Boutique Fatou Textile", "Resto Keur Sénégal", "Boulangerie du Plateau",
  "Pharma Médina", "Superette Point E", "Mode et Style Dakar",
  "Librairie Sandaga", "Traiteur Mariama", "Épicerie Colobane", "Tech Shop VDN",
];

export const merchants: Merchant[] = shopNames.map((name, i) => ({
  id: `mch-${String(i + 1).padStart(3, "0")}`,
  name,
  email: `contact${i + 1}@${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "")}.sn`,
  phone: `+221 77 ${String(Math.floor(r(i + 1, 100, 999)))} ${String(Math.floor(r(i + 2, 1000, 9999)))}`,
  city: cities[Math.floor(r(i + 3, 0, cities.length))],
  plan: plans[Math.floor(r(i + 5, 0, plans.length))],
  status: i < 8 ? "actif" : "suspendu",
  ordersThisMonth:  Math.floor(r(i + 7,  40,       400)),
  revenueThisMonth: Math.floor(r(i + 9,  200_000,  2_000_000) / 1000) * 1000,
  ordersLastMonth:  Math.floor(r(i + 15, 30,       380)),
  revenueLastMonth: Math.floor(r(i + 17, 150_000,  1_800_000) / 1000) * 1000,
  joinedAt: new Date(2025, Math.floor(r(i + 11, 0, 12)), Math.floor(r(i + 13, 1, 28)) + 1)
    .toISOString().split("T")[0],
  onboardingDone: false,
  notifWhatsapp: true,
  notifSms: true,
  notifEmail: false,
}));
