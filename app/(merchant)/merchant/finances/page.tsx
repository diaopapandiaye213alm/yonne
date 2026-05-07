import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { TrendingUp, Percent, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/lib/mock-data/orders";

export default function FinancesPage() {
  const merchant       = merchants[0];
  const commissionRate = merchant.plan === "Premium" ? 0.15 : 0.12;
  const revenuBrut     = merchant.revenueThisMonth;
  const commission     = Math.round(revenuBrut * commissionRate);
  const net            = revenuBrut - commission;
  const total          = orders.length;

  const byMethod = (method: PaymentMethod) =>
    orders.filter(o => o.paymentMethod === method).length;
  const wavePct   = Math.round(byMethod("wave")   / total * 100);
  const orangePct = Math.round(byMethod("orange") / total * 100);
  const cashPct   = Math.round(byMethod("cash")   / total * 100);

  const transactions = orders.slice(0, 10);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Finances</h1>
        <p className="text-sm text-ink-500 mt-1">
          Plan {merchant.plan} · Commission {commissionRate * 100}%
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Revenu brut ce mois",              value: `${revenuBrut.toLocaleString("fr-FR")} F`,   icon: TrendingUp },
          { label: `Commission YONNE (${commissionRate * 100}%)`, value: `${commission.toLocaleString("fr-FR")} F`, icon: Percent },
          { label: "Net marchand",                     value: `${net.toLocaleString("fr-FR")} F`,           icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Répartition par paiement</h2>
        <div className="space-y-2">
          {[
            { label: "Wave",         pct: wavePct,   color: "bg-blue-100 text-blue-700" },
            { label: "Orange Money", pct: orangePct, color: "bg-orange-100 text-orange-700" },
            { label: "Cash",         pct: cashPct,   color: "bg-gray-100 text-gray-700" },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-sm text-ink-700">{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">10 dernières transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 border-b border-cream-200">
              <tr>
                {["ID", "Date", "Montant", "Commission", "Net"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((o, i) => {
                const comm = Math.round(o.amount * commissionRate);
                return (
                  <tr key={o.id} className={`border-t border-cream-100 ${i % 2 !== 0 ? "bg-cream-50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-500 whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">{o.amount.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap text-red-600">-{comm.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap font-medium">{(o.amount - comm).toLocaleString("fr-FR")} F</td>
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
