"use client";
import dynamic from "next/dynamic";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { hourlyRevenue, zoneActivity, weeklyMerchants, ordersToday, breakEvenTarget, profitableTarget } from "@/lib/mock-data/analytics";

const LeafletMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => <div className="h-[240px] bg-cream-100 animate-pulse rounded-lg" />,
});

function fmt(n: number) { return `${(n / 1000).toFixed(0)}k`; }

export default function AnalyticsPage() {
  const breakEvenPct  = Math.min(100, Math.round((ordersToday / breakEvenTarget)  * 100));
  const profitablePct = Math.min(100, Math.round((ordersToday / profitableTarget) * 100));

  const zonePins = zoneActivity.map(z => ({
    id: z.name, lat: z.lat, lng: z.lng, kind: "order" as const,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Analytics avancé</h1>

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
          <div className="text-4xl font-display font-bold text-ink-900 tabular-nums mb-1">{ordersToday}</div>
          <div className="text-sm text-ink-500 mb-6">commandes aujourd'hui</div>

          <div className="space-y-4">
            {[
              { label: `Point mort (${breakEvenTarget}/jour)`,     pct: breakEvenPct,  color: "bg-emerald-500" },
              { label: `Rentable (${profitableTarget}/jour)`,      pct: profitablePct, color: "bg-gold-500" },
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
