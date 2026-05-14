"use client";

import { useState } from "react";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useOrdersStore } from "@/lib/store/orders";
import { TrendingUp, TrendingDown, Package, Wallet, Users, Star } from "lucide-react";

const PAYMENTS = [
  { label: "Wave",   pct: 52, color: "bg-[#1B96D4]",  textColor: "text-[#1B96D4]" },
  { label: "Orange", pct: 31, color: "bg-orange-400",  textColor: "text-orange-600" },
  { label: "Cash",   pct: 17, color: "bg-cream-300",   textColor: "text-ink-600" },
];

export default function MerchantAnalyticsPage() {
  const { merchants } = useMerchantsStore();
  const { orders }    = useOrdersStore();
  const merchant = merchants[0] ?? { revenueThisMonth: 310000, ordersThisMonth: 91 };

  const MONTHLY = [
    { month: "Jan", revenue: 820000,  orderCount: 68 },
    { month: "Fév", revenue: 940000,  orderCount: 79 },
    { month: "Mar", revenue: 875000,  orderCount: 73 },
    { month: "Avr", revenue: 1080000, orderCount: 91 },
    { month: "Mai", revenue: merchant.revenueThisMonth, orderCount: merchant.ordersThisMonth },
  ];
  const maxRevenue   = Math.max(...MONTHLY.map(m => m.revenue));
  const DAILY_ORDERS = [4,6,3,8,5,7,9,4,6,8,11,7,5,9,12,8,6,10,13,9,7,11,14,10,8,12,15,11,9,13,merchant.ordersThisMonth % 18 + 5];
  const maxDay       = Math.max(...DAILY_ORDERS);

  const clientMap = new Map<string, { count: number; total: number }>();
  for (const o of orders.slice(0, 40)) {
    const existing = clientMap.get(o.clientName);
    if (existing) { existing.count++; existing.total += o.amount; }
    else clientMap.set(o.clientName, { count: 1, total: o.amount });
  }
  const topClients = Array.from(clientMap.entries())
    .map(([name, { count, total }]) => ({ name, count, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const deliveryRate = Math.round((orders.filter(o => o.status === "livrée").length / Math.max(1, orders.length)) * 100);

  const [period, setPeriod] = useState<"month" | "week">("month");

  const currentMonth = MONTHLY[MONTHLY.length - 1];
  const prevMonth    = MONTHLY[MONTHLY.length - 2];
  const revenueGrowth = Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100);
  const ordersGrowth  = Math.round(((currentMonth.orderCount - prevMonth.orderCount) / prevMonth.orderCount) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Analytics</h1>
          <p className="text-sm text-ink-500 mt-1">{merchant.name}</p>
        </div>
        <div className="flex gap-1 bg-cream-100 p-1 rounded-lg">
          {(["month", "week"] as const).map(p => (
            <button key={p} type="button" onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                period === p ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}>
              {p === "month" ? "Ce mois" : "Cette semaine"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Revenus",
            value: `${(currentMonth.revenue / 1000).toFixed(0)} k F`,
            growth: revenueGrowth,
            icon: Wallet, color: "text-gold-500",
          },
          {
            label: "Commandes",
            value: String(currentMonth.orderCount),
            growth: ordersGrowth,
            icon: Package, color: "text-emerald-600",
          },
          {
            label: "Taux livré",
            value: `${deliveryRate}%`,
            growth: null,
            icon: Star, color: "text-emerald-500",
          },
          {
            label: "Clients uniques",
            value: String(clientMap.size),
            growth: null,
            icon: Users, color: "text-ink-600",
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

      {/* Monthly revenue bars */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Revenus mensuels</h2>
        <div className="flex items-end gap-3 h-32">
          {MONTHLY.map(({ month, revenue }, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs font-mono text-ink-500 tabular-nums">
                {(revenue / 1000).toFixed(0)}k
              </span>
              <div className={`w-full rounded-t transition-all ${i === MONTHLY.length - 1 ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-400/50"}`}
                style={{ height: `${Math.round((revenue / maxRevenue) * 80)}px` }} />
              <span className="text-xs text-ink-500">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily orders + Payment breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Commandes / jour — Mai</h2>
          <div className="flex items-end gap-0.5 h-20">
            {DAILY_ORDERS.map((v, i) => (
              <div key={i} className="flex-1">
                <div className={`w-full rounded-t transition-all ${i === DAILY_ORDERS.length - 1 ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-400/50"}`}
                  style={{ height: `${Math.round((v / maxDay) * 72)}px` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-ink-400 mt-2">
            <span>1 Mai</span>
            <span className="font-medium text-ink-700 tabular-nums">
              Moy : {Math.round(DAILY_ORDERS.reduce((a, b) => a + b, 0) / DAILY_ORDERS.length)} / jour
            </span>
            <span>31 Mai</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Répartition paiements</h2>
          {/* Stacked bar */}
          <div className="flex h-6 rounded-full overflow-hidden mb-4">
            {PAYMENTS.map(p => (
              <div key={p.label} className={`${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
            ))}
          </div>
          <div className="space-y-2">
            {PAYMENTS.map(p => (
              <div key={p.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                  <span className="text-ink-700">{p.label}</span>
                </div>
                <span className={`font-semibold tabular-nums ${p.textColor}`}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top clients */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Top clients</h2>
        <ol className="space-y-2.5">
          {topClients.map((c, i) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-ink-400 text-center shrink-0">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink-900 truncate">{c.name}</div>
                <div className="text-xs text-ink-500">{c.count} commande{c.count > 1 ? "s" : ""}</div>
              </div>
              <span className="text-sm font-mono font-semibold text-ink-900 tabular-nums shrink-0">
                {c.total.toLocaleString("fr-FR")} F
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Commission summary */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-3">Commission YONNE — Mai</h2>
        <div className="flex items-center justify-between text-sm py-2 border-b border-cream-100">
          <span className="text-ink-500">Revenus bruts</span>
          <span className="font-semibold tabular-nums">{currentMonth.revenue.toLocaleString("fr-FR")} F</span>
        </div>
        <div className="flex items-center justify-between text-sm py-2 border-b border-cream-100">
          <span className="text-ink-500">Commission ({merchant.plan === "Premium" ? "12%" : "15%"})</span>
          <span className="font-semibold text-red-600 tabular-nums">
            − {Math.round(currentMonth.revenue * (merchant.plan === "Premium" ? 0.12 : 0.15)).toLocaleString("fr-FR")} F
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="font-semibold text-ink-900">Net reversé</span>
          <span className="font-bold text-emerald-600 tabular-nums text-base">
            {Math.round(currentMonth.revenue * (merchant.plan === "Premium" ? 0.88 : 0.85)).toLocaleString("fr-FR")} F
          </span>
        </div>
      </div>

    </div>
  );
}
