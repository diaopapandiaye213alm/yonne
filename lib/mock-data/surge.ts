export interface SurgeHour { hour: string; multiplier: number; }

export const surgeHistory: SurgeHour[] = Array.from({ length: 24 }, (_, h) => {
  let m = 1.0;
  if (h >= 7  && h <= 9)  m = 1.2 + (h - 7) * 0.1;
  if (h >= 12 && h <= 14) m = 1.4;
  if (h >= 17 && h <= 21) m = 1.5 + (h - 17) * 0.1;
  return { hour: `${String(h).padStart(2, "0")}h`, multiplier: Math.min(2.0, Math.round(m * 10) / 10) };
});
