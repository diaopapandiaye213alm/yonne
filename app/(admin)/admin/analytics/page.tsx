"use client";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { hourlyRevenue, zoneActivity, weeklyMerchants } from "@/lib/mock-data/analytics";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import { Activity, Zap } from "lucide-react";
import { useT } from "@/lib/i18n";

const BREAKEVEN_TARGET  = 24;
const PROFITABLE_TARGET = 300;

const LeafletMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => <div className="h-[240px] bg-cream-100 animate-pulse rounded-lg" />,
});

function fmt(n: number) { return `${(n / 1000).toFixed(0)}k`; }

const STATUS_EVENT_TYPE: Record<string, string> = {
  "collecte":  "collect",
  "livrée":    "deliver",
  "assignée":  "driver",
  "en route":  "deliver",
  "créée":     "merchant",
  "annulée":   "surge",
};

const EVENT_COLORS: Record<string, string> = {
  collect:  "bg-emerald-500",
  deliver:  "bg-blue-500",
  driver:   "bg-gold-500",
  surge:    "bg-amber-500",
  merchant: "bg-purple-500",
  predict:  "bg-ink-400",
};

const STATUS_LABELS: Record<string, string> = {
  "collecte": "collectée",
  "livrée":   "livrée",
  "assignée": "assignée à un livreur",
  "en route": "en route",
  "créée":    "créée",
  "annulée":  "annulée",
};

// BI predictions — model estimates updated weekly
const PREDICTIONS = [
  { label: "Commandes prévues demain",   value: "162",     trend: "+10%",         up: true  },
  { label: "Pic attendu",                value: "16h–18h", trend: "créneau fort", up: true  },
  { label: "Livreurs requis",            value: "24",      trend: "+3 vs hier",   up: true  },
  { label: "Risque météo hivernage",     value: "Faible",  trend: "vent 12km/h",  up: false },
];

export default function AnalyticsPage() {
  const t = useT();
  const { orders } = useOrdersStore();
  const { drivers } = useDriversStore();
  const ordersToday = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length || orders.length; // fallback: total if no today orders (demo data has fixed dates)

  const breakEvenPct  = Math.min(100, Math.round((ordersToday / BREAKEVEN_TARGET)  * 100));
  const profitablePct = Math.min(100, Math.round((ordersToday / PROFITABLE_TARGET) * 100));
  const [liveCount, setLiveCount] = useState(ordersToday);

  useEffect(() => { setLiveCount(ordersToday); }, [ordersToday]);

  // Live feed — 7 most recent orders from the store
  const liveFeed = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7)
      .map(o => {
        const driver = drivers.find(d => d.id === o.driverId);
        const time = new Date(o.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        const label = STATUS_LABELS[o.status] ?? o.status;
        const driverPart = driver ? ` — ${driver.name}` : "";
        return {
          time,
          event: `Commande ${o.id.slice(0, 16)} ${label}${driverPart}`,
          type: STATUS_EVENT_TYPE[o.status] ?? "merchant",
        };
      });
  }, [orders, drivers]);

  // LTV segments — derived from orders grouped by merchantId
  const ltvData = useMemo(() => {
    const merchantOrderCount = new Map<string, { count: number; revenue: number }>();
    for (const o of orders) {
      const mid = o.merchantId ?? "__unknown__";
      const existing = merchantOrderCount.get(mid);
      if (existing) { existing.count++; existing.revenue += o.amount; }
      else merchantOrderCount.set(mid, { count: 1, revenue: o.amount });
    }
    const segments = [
      { key: "vip",   label: "VIP (>50 cmdes)",    min: 51, max: Infinity, color: "bg-emerald-500" },
      { key: "reg",   label: "Régulier (10–50)",    min: 10, max: 50,       color: "bg-blue-500"    },
      { key: "occ",   label: "Occasionnel (1–10)",  min: 1,  max: 9,        color: "bg-gold-500"    },
      { key: "inact", label: "Inactif (0 cmdes)",   min: 0,  max: 0,        color: "bg-cream-300"   },
    ];
    const counts = segments.map(s => {
      const entries = Array.from(merchantOrderCount.values()).filter(m =>
        s.min === 0 ? m.count === 0 : m.count >= s.min && m.count <= s.max
      );
      const avgLtv = entries.length > 0
        ? Math.round(entries.reduce((sum, m) => sum + m.revenue, 0) / entries.length)
        : 0;
      return { segment: s.label, ltv: avgLtv > 0 ? `${avgLtv.toLocaleString("fr-FR")} F` : "0 F", count: entries.length, color: s.color };
    });
    const maxCount = Math.max(...counts.map(c => c.count), 1);
    return counts.map(c => ({ ...c, pct: Math.round((c.count / maxCount) * 100) }));
  }, [orders]);

  // Deterministic per-cell noise using Mulberry32 PRNG — consistent with engine.ts pattern.
  const heatmap = useMemo(() => {
    function mulberry32(seed: number): () => number {
      let s = seed >>> 0;
      return function() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    return Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const active  = h >= 7 && h <= 22;
        const weekend = d >= 5;
        const base    = active ? (weekend ? 0.4 : 0.3) : 0.02;
        const peak    = (h >= 11 && h <= 13) || (h >= 18 && h <= 20) ? 0.5 : 0;
        const noise   = mulberry32(d * 24 + h)() * 0.2;
        const intensity = Math.min(1, base + peak + noise);
        return Math.round(intensity * 9) / 9;
      })
    );
  }, []);

  const zonePins = zoneActivity.map(z => ({
    id: z.name, lat: z.lat, lng: z.lng, kind: "order" as const,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-900">{t("analyticsTitle")}</h1>
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-live-pulse" />
          <span className="tabular-nums">{liveCount} commandes live</span>
        </div>
      </div>

      {/* Revenus heure/heure */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Revenus heure/heure — 24h</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hourlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#8B7363" }} interval={3} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#8B7363" }} width={40} />
            <Tooltip formatter={(v: unknown) => [String(v), ""]} />
            <Legend />
            <Line type="monotone" dataKey="today"    stroke="#15803D" strokeWidth={2} dot={false} name="Aujourd'hui" />
            <Line type="monotone" dataKey="lastWeek" stroke="#D4A574" strokeWidth={2} dot={false} name="Semaine dernière" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap 24h */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Heatmap activité — 24h × 7 jours</h2>
        <div className="overflow-x-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: "40px repeat(24, 1fr)" }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center text-[9px] text-ink-400 font-mono">{String(h).padStart(2, "0")}</div>
            ))}
            {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((day, d) => (
              <>
                <div key={`label-${d}`} className="text-[10px] text-ink-500 flex items-center">{day}</div>
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={`cell-${d}-${h}`}
                    className="h-5 rounded-sm bg-emerald-500 transition-opacity"
                    style={{ opacity: heatmap[d][h] }}
                    title={`${day} ${String(h).padStart(2, "0")}h`}
                  />
                ))}
              </>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-ink-400">Moins</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
              <div key={o} className="w-3 h-3 rounded-sm bg-emerald-500" style={{ opacity: o }} />
            ))}
            <span className="text-[10px] text-ink-400">Plus</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zones Dakar */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Zones actives — Dakar</h2>
          <LeafletMap pins={zonePins} zoom={12} height="240px" />
          <div className="mt-3 grid grid-cols-2 gap-1">
            {[...zoneActivity].sort((a, b) => b.orders - a.orders).slice(0, 4).map(z => (
              <div key={z.name} className="flex justify-between text-xs text-ink-700 bg-cream-50 px-2 py-1 rounded">
                <span>{z.name}</span>
                <span className="font-bold">{z.orders} cmdes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métriques business */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Métriques business</h2>
          <div className="text-4xl font-display font-bold text-ink-900 tabular-nums mb-1">{liveCount}</div>
          <div className="text-sm text-ink-500 mb-6">commandes aujourd'hui</div>
          <div className="space-y-4">
            {[
              { label: `Point mort (${BREAKEVEN_TARGET}/jour)`,     pct: breakEvenPct,  color: "bg-emerald-500" },
              { label: `Rentable (${PROFITABLE_TARGET}/jour)`,      pct: profitablePct, color: "bg-gold-500" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-700">{label}</span>
                  <span className={`font-bold ${pct >= 100 ? "text-emerald-600" : "text-ink-900"}`}>{pct}%</span>
                </div>
                <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LTV Segments */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">LTV commerçants par segment</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ltvData.map(s => (
            <div key={s.segment} className="bg-cream-50 rounded-lg p-4">
              <div className={`w-8 h-1.5 rounded-full ${s.color} mb-3`} />
              <div className="text-lg font-display font-bold text-ink-900">{s.ltv}</div>
              <div className="text-xs text-ink-500 mt-0.5 mb-2">{s.segment}</div>
              <div className="text-xs text-ink-400">{s.count} commerçants</div>
              <div className="mt-2 h-1 bg-cream-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BI Prédictive */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-gold-500" />
            <h2 className="font-semibold text-ink-900">BI Prédictive</h2>
            <span className="text-[10px] bg-gold-500/10 text-gold-600 px-2 py-0.5 rounded-full font-medium">ML</span>
          </div>
          <div className="space-y-3">
            {PREDICTIONS.map(p => (
              <div key={p.label} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                <div>
                  <div className="text-xs text-ink-500">{p.label}</div>
                  <div className="font-semibold text-ink-900 text-sm mt-0.5">{p.value}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.up ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {p.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="font-semibold text-ink-900">Live Feed</h2>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-live-pulse ml-1" />
          </div>
          <div className="space-y-2">
            {liveFeed.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-mono text-[10px] text-ink-400 mt-0.5 shrink-0">{ev.time}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${EVENT_COLORS[ev.type]}`} />
                <span className="text-xs text-ink-700 leading-relaxed">{ev.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rétention commerçants */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Rétention commerçants — 8 semaines</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyMerchants} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8B7363" }} />
            <YAxis tick={{ fontSize: 11, fill: "#8B7363" }} width={30} />
            <Tooltip />
            <Bar dataKey="active" fill="#15803D" radius={[4, 4, 0, 0]} name="Commerçants actifs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
