"use client";

import { useState } from "react";
import { toast } from "sonner";
import { drivers } from "@/lib/mock-data/drivers";
import { merchants } from "@/lib/mock-data/merchants";
import { Printer, Download, TrendingUp, TrendingDown, Package, Wallet, Star, Bike } from "lucide-react";

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai"] as const;
type Month = typeof MONTHS[number];

const MONTHLY_DATA: Record<Month, { orders: number; revenue: number; avgRating: number; newDrivers: number }> = {
  Janvier:  { orders: 2841, revenue: 4_210_000, avgRating: 4.6, newDrivers: 3 },
  Février:  { orders: 3102, revenue: 4_780_000, avgRating: 4.7, newDrivers: 2 },
  Mars:     { orders: 2988, revenue: 4_520_000, avgRating: 4.6, newDrivers: 4 },
  Avril:    { orders: 3421, revenue: 5_110_000, avgRating: 4.7, newDrivers: 1 },
  Mai:      { orders: 4012, revenue: 6_240_000, avgRating: 4.8, newDrivers: 5 },
};

const DAILY = [142, 158, 147, 163, 155, 178, 192, 168, 145, 171, 183, 197, 152, 166, 188, 201, 175, 160, 195, 210, 188, 172, 205, 218, 195, 180, 225, 198, 212, 230, 248];
const maxDay = Math.max(...DAILY);

const topDrivers = drivers
  .slice(0, 5)
  .map(d => ({ name: d.name, earnings: d.earningsToday * 22, orders: d.ordersToday * 22, rating: d.rating }))
  .sort((a, b) => b.earnings - a.earnings);

const topMerchants = merchants
  .slice(0, 5)
  .map(m => ({ name: m.name, revenue: m.revenueThisMonth, orders: m.ordersThisMonth, plan: m.plan }))
  .sort((a, b) => b.revenue - a.revenue);

export default function RapportPage() {
  const [month, setMonth] = useState<Month>("Mai");

  const cur  = MONTHLY_DATA[month];
  const prevIdx = MONTHS.indexOf(month) - 1;
  const prev = prevIdx >= 0 ? MONTHLY_DATA[MONTHS[prevIdx]] : null;

  const ordersGrowth  = prev ? Math.round(((cur.orders - prev.orders) / prev.orders) * 100) : null;
  const revenueGrowth = prev ? Math.round(((cur.revenue - prev.revenue) / prev.revenue) * 100) : null;

  const commission    = Math.round(cur.revenue * 0.13);
  const netRevenue    = cur.revenue - commission;

  function printReport() {
    window.print();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Rapport mensuel</h1>
          <p className="text-sm text-ink-500 mt-1">Synthèse opérationnelle YONNE</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={printReport}
            className="flex items-center gap-2 border border-cream-200 text-ink-700 rounded-lg px-4 py-2 text-sm hover:bg-cream-100 transition-colors">
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button type="button" onClick={() => toast.success("Rapport PDF téléchargé")}
            className="flex items-center gap-2 bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 flex-wrap print:hidden">
        {MONTHS.map(m => (
          <button key={m} type="button" onClick={() => setMonth(m)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              month === m ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}>
            {m}
          </button>
        ))}
      </div>

      {/* Print header (hidden on screen) */}
      <div className="hidden print:block mb-6">
        <div className="text-2xl font-bold">YONNE · Rapport mensuel — {month} 2026</div>
        <div className="text-sm text-gray-500 mt-1">Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Commandes",
            value: cur.orders.toLocaleString("fr-FR"),
            growth: ordersGrowth,
            icon: Package,
            color: "text-emerald-600",
          },
          {
            label: "Revenus bruts",
            value: `${(cur.revenue / 1000).toFixed(0)} k F`,
            growth: revenueGrowth,
            icon: Wallet,
            color: "text-gold-500",
          },
          {
            label: "Commission YONNE",
            value: `${(commission / 1000).toFixed(0)} k F`,
            growth: null,
            icon: TrendingUp,
            color: "text-ink-700",
          },
          {
            label: "Note moyenne",
            value: `${cur.avgRating.toFixed(1)} ★`,
            growth: null,
            icon: Star,
            color: "text-gold-500",
          },
        ].map(({ label, value, growth, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-ink-500">{label}</span>
              {growth !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {growth >= 0 ? "+" : ""}{growth}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Daily orders chart */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Commandes par jour — {month}</h2>
        <div className="flex items-end gap-0.5 h-28">
          {DAILY.slice(0, 31).map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={`w-full rounded-t transition-all ${i === DAILY.length - 1 ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-400/50"}`}
                style={{ height: `${Math.round((v / maxDay) * 100)}px` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-ink-400 mt-2">
          <span>1 {month}</span>
          <span className="tabular-nums font-medium text-ink-700">Moy : {Math.round(DAILY.reduce((a,b) => a+b,0)/DAILY.length)} / jour</span>
          <span>31 {month}</span>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Répartition revenus</h2>
        <div className="space-y-3">
          {[
            { label: "Revenus bruts",     amount: cur.revenue,  pct: 100, color: "bg-emerald-500" },
            { label: "Commission YONNE",  amount: commission,   pct: 13,  color: "bg-gold-500" },
            { label: "Reversé marchands", amount: netRevenue,   pct: 87,  color: "bg-cream-300" },
          ].map(({ label, amount, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink-700">{label}</span>
                <span className="tabular-nums font-medium text-ink-900">{amount.toLocaleString("fr-FR")} F <span className="text-ink-400 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top drivers + merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Bike className="w-4 h-4 text-emerald-500" /> Top livreurs — {month}
          </h2>
          <ol className="space-y-2">
            {topDrivers.map((d, i) => (
              <li key={d.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-ink-400 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">{d.name}</div>
                  <div className="text-xs text-ink-500">{d.orders} livraisons · ⭐ {d.rating.toFixed(1)}</div>
                </div>
                <span className="text-sm font-mono font-semibold text-emerald-600 tabular-nums shrink-0">
                  {d.earnings.toLocaleString("fr-FR")} F
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-gold-500" /> Top marchands — {month}
          </h2>
          <ol className="space-y-2">
            {topMerchants.map((m, i) => (
              <li key={m.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-ink-400 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">{m.name}</div>
                  <div className="text-xs text-ink-500">{m.orders} commandes · {m.plan}</div>
                </div>
                <span className="text-sm font-mono font-semibold text-gold-600 tabular-nums shrink-0">
                  {(m.revenue / 1000).toFixed(0)} k F
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Payroll summary */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Résumé masse salariale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Livreurs actifs",      value: String(drivers.filter(d => d.online).length) },
            { label: "Nouveaux livreurs",     value: String(cur.newDrivers) },
            { label: "Masse salariale",       value: `${(topDrivers.reduce((s, d) => s + d.earnings, 0) * 8).toLocaleString("fr-FR")} F` },
            { label: "Prime performance",    value: `50 000 F` },
          ].map(({ label, value }) => (
            <div key={label} className="py-2 border-b border-cream-100">
              <div className="text-ink-500 text-xs mb-0.5">{label}</div>
              <div className="font-semibold text-ink-900 tabular-nums">{value}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
