export interface HourlyRevenue { hour: string; today: number; lastWeek: number; }
export interface ZoneActivity  { name: string; lat: number; lng: number; orders: number; radius: number; }
export interface WeeklyMerchants { week: string; active: number; }

export const hourlyRevenue: HourlyRevenue[] = Array.from({ length: 24 }, (_, h) => {
  const active = h >= 7 && h <= 22;
  return {
    hour: `${String(h).padStart(2, "0")}h`,
    today:    active ? Math.floor(40_000 + Math.sin((h - 7) * 0.5) * 35_000 + (h * 1234 % 8000)) : 0,
    lastWeek: active ? Math.floor(32_000 + Math.sin((h - 7) * 0.5) * 30_000 + (h * 987  % 6000)) : 0,
  };
});

export const zoneActivity: ZoneActivity[] = [
  { name: "Plateau",             lat: 14.6720, lng: -17.4380, orders: 45, radius: 600 },
  { name: "Médina",              lat: 14.6770, lng: -17.4480, orders: 38, radius: 550 },
  { name: "Parcelles Assainies", lat: 14.7610, lng: -17.4290, orders: 29, radius: 500 },
  { name: "Grand Yoff",          lat: 14.7320, lng: -17.4580, orders: 22, radius: 450 },
  { name: "Ouakam",              lat: 14.7430, lng: -17.5010, orders: 18, radius: 400 },
  { name: "Almadies",            lat: 14.7490, lng: -17.5290, orders: 12, radius: 350 },
  { name: "Point E",             lat: 14.6930, lng: -17.4650, orders: 31, radius: 500 },
  { name: "Mermoz",              lat: 14.7140, lng: -17.4780, orders: 25, radius: 460 },
];

export const weeklyMerchants: WeeklyMerchants[] = [
  { week: "S18", active: 21 }, { week: "S19", active: 24 }, { week: "S20", active: 28 },
  { week: "S21", active: 31 }, { week: "S22", active: 29 }, { week: "S23", active: 35 },
  { week: "S24", active: 38 }, { week: "S25", active: 42 },
];

export const ordersToday      = 147;
export const breakEvenTarget  = 24;
export const profitableTarget = 300;
