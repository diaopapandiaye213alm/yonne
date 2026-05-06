// lib/mock-data/tabaski.ts
// Tabaski 2026 estimate: 2026-05-27 (à valider selon CMS)
export const TABASKI_DATE = new Date("2026-05-27T08:00:00+00:00");
// Demo "today" is 2026-05-20 → J-7
export const DEMO_NOW = new Date("2026-05-20T10:00:00+00:00");

export interface DemandPoint {
  date: string;          // YYYY-MM-DD
  hour: number;          // 0-23
  baseline: number;      // commandes/h en jour normal
  predicted: number;     // commandes/h prévues
}

function buildCurve(): DemandPoint[] {
  const points: DemandPoint[] = [];
  const start = new Date("2026-05-20T00:00:00+00:00");
  for (let day = 0; day < 10; day++) {
    const date = new Date(start.getTime() + day * 86400000);
    const dayKey = date.toISOString().slice(0, 10);
    const isTabaskiDay = day === 7;        // J0 (May 27)
    const isJMinus1   = day === 6;         // J-1 (May 26)
    const isJPlus1    = day === 8;         // J+1 (May 28)
    for (let hour = 0; hour < 24; hour++) {
      const baseline = hour < 6 || hour > 22 ? 6 : 18 + Math.round(Math.sin((hour - 9) / 6) * 8);
      let multiplier = 1;
      if (isTabaskiDay && hour >= 10 && hour <= 14) multiplier = 3.2;
      else if (isTabaskiDay) multiplier = 2.4;
      else if (isJMinus1) multiplier = 1.6;
      else if (isJPlus1) multiplier = 1.4;
      else multiplier = 1 + day * 0.05;    // gentle ramp
      points.push({ date: dayKey, hour, baseline, predicted: Math.round(baseline * multiplier) });
    }
  }
  return points;
}

export const demandCurve = buildCurve();

export interface ActionPlanItem {
  id: string;
  title: string;
  detail: string;
  status: "pending" | "in_progress" | "done";
  progress?: { current: number; total: number };
  toggleable?: boolean;
}

export const actionPlan: ActionPlanItem[] = [
  {
    id: "ap-1",
    title: "Recruter 12 livreurs temporaires",
    detail: "Activation du pool de réserve · contact automatique · KYC accéléré.",
    status: "in_progress",
    progress: { current: 8, total: 12 },
  },
  {
    id: "ap-2",
    title: "Bonus livreurs Tabaski : 2 000 F par course",
    detail: "Active du J-1 au J+1, sur toute la zone Dakar. Prime cumulable.",
    status: "pending",
    toggleable: true,
  },
  {
    id: "ap-3",
    title: "Surge automatique J-1 → J+1 (×1.5 → ×2.0)",
    detail: "Pic prévu mardi 10h-14h. Surge passe à ×2.0 sur cette fenêtre.",
    status: "pending",
    toggleable: true,
  },
];

export interface HistoryStat { label: string; value: string }
export const tabaski2025Stats: HistoryStat[] = [
  { label: "Revenus vs jour normal", value: "+287 %" },
  { label: "Commandes < 30 min", value: "94 %" },
  { label: "Commandes traitées", value: "1 247" },
];
