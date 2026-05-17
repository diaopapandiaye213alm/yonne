"use client";

import { useState, useMemo } from "react";
import { useDriversStore } from "@/lib/store/drivers";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useOrdersStore } from "@/lib/store/orders";
import { Printer, TrendingUp, TrendingDown, Package, Wallet, Star, Bike } from "lucide-react";
import { useT } from "@/lib/i18n";

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function buildAvailableMonths(orders: { createdAt: string }[]): { label: string; year: number; month: number }[] {
  const seen = new Set<string>();
  const result: { label: string; year: number; month: number }[] = [];
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth() });
    }
  }
  // Sort descending, cap at 6
  return result
    .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
    .slice(0, 6)
    .reverse();
}

export default function RapportPage() {
  const t = useT();
  const { drivers }   = useDriversStore();
  const { merchants } = useMerchantsStore();
  const { orders }    = useOrdersStore();

  const availableMonths = useMemo(() => buildAvailableMonths(orders), [orders]);
  const defaultMonth = availableMonths[availableMonths.length - 1] ?? { label: MONTH_NAMES[new Date().getMonth()], year: new Date().getFullYear(), month: new Date().getMonth() };
  const [selectedKey, setSelectedKey] = useState<string>(`${defaultMonth.year}-${defaultMonth.month}`);

  const selectedMonth = useMemo(() => {
    const found = availableMonths.find(m => `${m.year}-${m.month}` === selectedKey);
    return found ?? defaultMonth;
  }, [availableMonths, selectedKey, defaultMonth]);

  const monthOrders = useMemo(() =>
    orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === selectedMonth.month && d.getFullYear() === selectedMonth.year;
    }), [orders, selectedMonth]
  );

  const prevMonthOrders = useMemo(() => {
    const prevM = selectedMonth.month === 0 ? 11 : selectedMonth.month - 1;
    const prevY = selectedMonth.month === 0 ? selectedMonth.year - 1 : selectedMonth.year;
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === prevM && d.getFullYear() === prevY;
    });
  }, [orders, selectedMonth]);

  const revenue     = useMemo(() => monthOrders.reduce((s, o) => s + o.amount, 0), [monthOrders]);
  const prevRevenue = useMemo(() => prevMonthOrders.reduce((s, o) => s + o.amount, 0), [prevMonthOrders]);
  const commission  = Math.round(revenue * 0.13);
  const netRevenue  = revenue - commission;

  const ordersGrowth  = prevMonthOrders.length > 0 ? Math.round(((monthOrders.length - prevMonthOrders.length) / prevMonthOrders.length) * 100) : null;
  const revenueGrowth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

  // Average driver rating from store
  const avgRating = drivers.length > 0
    ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length)
    : 4.7;

  // Daily orders for selected month
  const daysInMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
  const dailyOrders = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return monthOrders.filter(o => new Date(o.createdAt).getDate() === day).length;
    });
  }, [monthOrders, daysInMonth]);
  const maxDay = Math.max(...dailyOrders, 1);
  const avgDay = dailyOrders.reduce((a, b) => a + b, 0) / (daysInMonth || 1);

  // Top drivers from orders this month
  const topDrivers = useMemo(() => {
    const byDriver = new Map<string, { name: string; earnings: number; orders: number; rating: number }>();
    for (const o of monthOrders) {
      if (!o.driverId) continue;
      const driver = drivers.find(d => d.id === o.driverId);
      if (!driver) continue;
      const existing = byDriver.get(o.driverId);
      if (existing) { existing.orders++; existing.earnings += Math.round(o.amount * 0.25); }
      else byDriver.set(o.driverId, { name: driver.name, earnings: Math.round(o.amount * 0.25), orders: 1, rating: driver.rating });
    }
    return Array.from(byDriver.values()).sort((a, b) => b.earnings - a.earnings).slice(0, 5);
  }, [monthOrders, drivers]);

  // Top merchants from real store data
  const topMerchants = useMemo(() =>
    [...merchants]
      .map(m => ({ name: m.name, revenue: m.revenueThisMonth, orders: m.ordersThisMonth, plan: m.plan }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    [merchants]
  );

  const activeDriverCount = drivers.filter(d => d.online).length;

  function printReport() { window.print(); }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("navRapport")}</h1>
          <p className="text-sm text-ink-500 mt-1">Synthèse opérationnelle YONNE</p>
        </div>
        <button type="button" onClick={printReport}
          className="flex items-center gap-2 border border-cream-200 text-ink-700 rounded-lg px-4 py-2 text-sm hover:bg-cream-100 transition-colors">
          <Printer className="w-4 h-4" /> Imprimer
        </button>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 flex-wrap print:hidden">
        {availableMonths.map(m => {
          const key = `${m.year}-${m.month}`;
          return (
            <button key={key} type="button" onClick={() => setSelectedKey(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedKey === key ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
              }`}>
              {m.label} {m.year}
            </button>
          );
        })}
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <div className="text-2xl font-bold">YONNE · Rapport mensuel — {selectedMonth.label} {selectedMonth.year}</div>
        <div className="text-sm text-gray-500 mt-1">Généré le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Commandes",       value: monthOrders.length.toLocaleString("fr-FR"),   growth: ordersGrowth,  icon: Package,    color: "text-emerald-600" },
          { label: "Revenus bruts",   value: `${(revenue / 1000).toFixed(0)} k F`,          growth: revenueGrowth, icon: Wallet,     color: "text-gold-500"    },
          { label: "Commission YONNE",value: `${(commission / 1000).toFixed(0)} k F`,        growth: null,          icon: TrendingUp, color: "text-ink-700"     },
          { label: "Note moyenne",    value: `${avgRating.toFixed(1)} ★`,                   growth: null,          icon: Star,       color: "text-gold-500"    },
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
        <h2 className="font-semibold text-ink-900 mb-4">Commandes par jour — {selectedMonth.label}</h2>
        {monthOrders.length === 0 ? (
          <p className="text-sm text-ink-500 py-6 text-center">Aucune commande ce mois-ci</p>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-28">
              {dailyOrders.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center" title={`${i + 1} ${selectedMonth.label} : ${v} commande${v !== 1 ? "s" : ""}`}>
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 ${v > 0 ? "bg-emerald-500" : "bg-cream-200"}`}
                    style={{ height: `${Math.max(2, Math.round((v / maxDay) * 100))}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-ink-400 mt-2">
              <span>1 {selectedMonth.label}</span>
              <span className="tabular-nums font-medium text-ink-700">Moy : {avgDay.toFixed(1)} / jour</span>
              <span>{daysInMonth} {selectedMonth.label}</span>
            </div>
          </>
        )}
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Répartition revenus</h2>
        {revenue === 0 ? (
          <p className="text-sm text-ink-500">Aucun revenu ce mois-ci</p>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Revenus bruts",     amount: revenue,     pct: 100, color: "bg-emerald-500" },
              { label: "Commission YONNE",  amount: commission,  pct: 13,  color: "bg-gold-500"    },
              { label: "Reversé marchands", amount: netRevenue,  pct: 87,  color: "bg-cream-300"   },
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
        )}
      </div>

      {/* Top drivers + merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Bike className="w-4 h-4 text-emerald-500" /> Top livreurs — {selectedMonth.label}
          </h2>
          {topDrivers.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune donnée ce mois-ci</p>
          ) : (
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
          )}
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-gold-500" /> Top marchands — {selectedMonth.label}
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
            { label: "Livreurs actifs",   value: String(activeDriverCount) },
            { label: "Total livreurs",    value: String(drivers.length) },
            { label: "Gains livreurs",    value: `${(monthOrders.reduce((s, o) => s + Math.round(o.amount * 0.25), 0) / 1000).toFixed(0)} k F` },
            { label: "Commission / cmd",  value: monthOrders.length > 0 ? `${Math.round(commission / monthOrders.length).toLocaleString("fr-FR")} F` : "—" },
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
