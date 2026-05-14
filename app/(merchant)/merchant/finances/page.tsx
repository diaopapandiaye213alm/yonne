"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useOrdersStore } from "@/lib/store/orders";
import { useSession } from "@/lib/hooks/useSession";
import { TrendingUp, Percent, Wallet, Download } from "lucide-react";
import { downloadCsv } from "@/lib/utils/csv";
import type { PaymentMethod } from "@/lib/mock-data/orders";

const MONTH_NAMES = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

function fmt(n: number) { return `${(n / 1000).toFixed(0)}k`; }

export default function FinancesPage() {
  const session       = useSession();
  const { merchants } = useMerchantsStore();
  const { orders }    = useOrdersStore();
  const merchant = useMemo(() => {
    const byEmail = session?.email ? merchants.find(m => m.email === session.email) : null;
    return byEmail ?? merchants[0] ?? { plan: "Standard", revenueThisMonth: 0 };
  }, [merchants, session?.email]);
  const commissionRate = merchant.plan === "Premium" ? 0.12 : 0.15;
  const commissionPct  = Math.round(commissionRate * 100);

  // Filter orders for this merchant
  const myOrders = useMemo(() =>
    merchant.id ? orders.filter(o => o.merchantId === merchant.id || !o.merchantId) : orders,
    [orders, merchant]
  );

  // KPIs from real orders (current month)
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();
  const thisMonthOrders = useMemo(() =>
    myOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [myOrders, currentMonth, currentYear]
  );
  const revenuBrut = useMemo(() => thisMonthOrders.reduce((s, o) => s + o.amount, 0), [thisMonthOrders]);
  const commission = Math.round(revenuBrut * commissionRate);
  const net        = revenuBrut - commission;
  const total      = myOrders.length;

  // Monthly chart from real data
  const monthlyData = useMemo(() => {
    const grouped: Record<string, {brut: number, net: number}> = {};
    for (const o of myOrders) {
      const m = MONTH_NAMES[new Date(o.createdAt).getMonth()];
      if (!grouped[m]) grouped[m] = { brut: 0, net: 0 };
      grouped[m].brut += o.amount;
      grouped[m].net  += o.amount - Math.round(o.amount * commissionRate);
    }
    // Keep last 6 months in calendar order
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = MONTH_NAMES[d.getMonth()];
      last6.push({ month: m, ...(grouped[m] ?? { brut: 0, net: 0 }) });
    }
    return last6;
  }, [myOrders, commissionRate]);

  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "">("");

  const byMethod = (method: PaymentMethod) =>
    myOrders.filter(o => o.paymentMethod === method).length;
  const wavePct   = total > 0 ? Math.round(byMethod("wave")   / total * 100) : 0;
  const orangePct = total > 0 ? Math.round(byMethod("orange") / total * 100) : 0;
  const cashPct   = total > 0 ? Math.round(byMethod("cash")   / total * 100) : 0;

  const transactions = myOrders
    .filter(o => !filterMethod || o.paymentMethod === filterMethod)
    .slice(0, 20);

  function handleExport() {
    downloadCsv("transactions-yonne.csv", transactions.map(o => {
      const comm = Math.round(o.amount * commissionRate);
      return {
        id:          o.id,
        date:        new Date(o.createdAt).toLocaleDateString("fr-FR"),
        client:      o.clientName,
        paiement:    o.paymentMethod,
        brut:        o.amount,
        commission:  comm,
        net:         o.amount - comm,
      };
    }));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Finances</h1>
        <p className="text-sm text-ink-500 mt-1">
          Plan {merchant.plan} · Commission {commissionPct}%
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Revenu brut ce mois",              value: `${revenuBrut.toLocaleString("fr-FR")} F`,  icon: TrendingUp, color: "text-emerald-600" },
          { label: `Commission YONNE (${commissionPct}%)`, value: `${commission.toLocaleString("fr-FR")} F`, icon: Percent,    color: "text-red-500" },
          { label: "Net marchand",                     value: `${net.toLocaleString("fr-FR")} F`,          icon: Wallet,     color: "text-gold-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-4 h-4 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Revenus 6 derniers mois</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8B7363" }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#8B7363" }} width={36} />
            <Tooltip formatter={(v: unknown) => [`${Number(v).toLocaleString("fr-FR")} F`, ""]} />
            <Bar dataKey="brut" fill="#D4A574" radius={[4,4,0,0]} name="Brut" />
            <Bar dataKey="net"  fill="#15803D" radius={[4,4,0,0]} name="Net" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-end mt-2 text-xs text-ink-500">
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gold-500/60 rounded-sm inline-block" />Brut</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-600 rounded-sm inline-block" />Net</span>
        </div>
      </div>

      {/* Payment split */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Répartition par paiement</h2>
        <div className="space-y-3">
          {[
            { label: "Wave",         pct: wavePct,   color: "bg-blue-500",   badge: "bg-blue-100 text-blue-700" },
            { label: "Orange Money", pct: orangePct, color: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
            { label: "Cash",         pct: cashPct,   color: "bg-ink-400",    badge: "bg-gray-100 text-gray-700" },
          ].map(({ label, pct, color, badge }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-700">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{pct}%</span>
              </div>
              <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Transactions</h2>
          <div className="flex items-center gap-2">
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value as PaymentMethod | "")}
              className="text-xs border border-cream-200 rounded-lg px-2 py-1.5 bg-white text-ink-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">Tous</option>
              <option value="wave">Wave</option>
              <option value="orange">Orange Money</option>
              <option value="cash">Cash</option>
            </select>
            <button type="button" onClick={handleExport}
              className="flex items-center gap-1.5 text-xs border border-cream-200 rounded-lg px-3 py-1.5 text-ink-600 hover:bg-cream-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                {["ID", "Date", "Client", "Paiement", "Brut", "Commission", "Net"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((o, i) => {
                const comm = Math.round(o.amount * commissionRate);
                return (
                  <tr key={o.id} className={`border-t border-cream-100 hover:bg-cream-50 transition-colors ${i % 2 !== 0 ? "bg-cream-50/50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-500 whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-600">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{o.clientName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.paymentMethod === "wave" ? "bg-blue-100 text-blue-700" :
                        o.paymentMethod === "orange" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{o.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">{o.amount.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap text-red-500">-{comm.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap font-semibold text-emerald-600">{(o.amount - comm).toLocaleString("fr-FR")} F</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
