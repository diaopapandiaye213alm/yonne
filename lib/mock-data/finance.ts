export interface Transaction {
  id: string;
  driverName: string;
  method: "wave" | "orange" | "cash";
  amount: number;
  commission: number;
  date: string;
}
export interface TontineMember   { name: string; paid: boolean; }
export interface AdvanceRequest  { id: string; driverName: string; earningsToday: number; requestedAmount: number; fee: number; }
export interface ReferralPrize   { referrerName: string; refereeName: string; prizeAmount: number; }

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
const names = ["Ibrahima Sow","Moussa Diop","Fatou Ndiaye","Cheikh Sarr","Awa Diouf","Pape Fall","Aminata Mbaye","Ousmane Cissé"];
const methods = ["wave", "orange", "cash"] as const;

export const transactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: `TXN-${String(1000 + i)}`,
  driverName: names[Math.floor(r(i + 1, 0, names.length))],
  method: methods[Math.floor(r(i + 3, 0, 3))],
  amount: Math.floor(r(i + 5, 8_000, 30_000) / 100) * 100,
  commission: Math.floor(r(i + 7, 1_200, 4_500) / 100) * 100,
  date: new Date(2026, 4, 20, Math.floor(r(i + 9, 8, 22)), 0).toISOString(),
}));

export const waveTotal   = transactions.filter(t => t.method === "wave").reduce((s, t) => s + t.amount, 0);
export const orangeTotal = transactions.filter(t => t.method === "orange").reduce((s, t) => s + t.amount, 0);
export const cashTotal   = transactions.filter(t => t.method === "cash").reduce((s, t) => s + t.amount, 0);

export const tontineWeek           = 12;
export const tontineMembers: TontineMember[] = names.slice(0, 8).map((name, i) => ({ name, paid: i < 6 }));
export const tontineBeneficiary     = names[3];
export const tontineNextBeneficiary = names[5];

export const advanceRequests: AdvanceRequest[] = [
  { id: "ADV-001", driverName: "Ibrahima Sow", earningsToday: 34_000, requestedAmount: 27_200, fee: 544 },
  { id: "ADV-002", driverName: "Moussa Diop",  earningsToday: 28_000, requestedAmount: 22_400, fee: 448 },
  { id: "ADV-003", driverName: "Cheikh Sarr",  earningsToday: 41_000, requestedAmount: 32_800, fee: 656 },
];

export const referralPrizes: ReferralPrize[] = [
  { referrerName: "Ibrahima Sow",  refereeName: "Lamine Ka",     prizeAmount: 5_000 },
  { referrerName: "Moussa Diop",   refereeName: "Ousmane Cissé", prizeAmount: 5_000 },
  { referrerName: "Cheikh Sarr",   refereeName: "Saliou Niang",  prizeAmount: 5_000 },
];

export const insuranceCount   = 34;
export const insuranceRevenue = insuranceCount * 200;
export const insuranceMargin  = Math.round(insuranceRevenue * 0.82);
