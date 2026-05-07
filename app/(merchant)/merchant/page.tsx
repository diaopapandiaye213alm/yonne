import Link from "next/link";
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { Package, TrendingUp, CheckCircle2, PlusSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export const dynamic = "force-dynamic";

export default function MerchantAccueilPage() {
  const merchant  = merchants[0];
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = Math.round(delivered / orders.length * 100);
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Bonjour, {merchant.name}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Commandes ce mois", value: String(merchant.ordersThisMonth), icon: Package },
          { label: "Revenus ce mois",   value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp },
          { label: "Taux livré",        value: `${tauxLivre}%`, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <Link
        href="/merchant/nouvelle-commande"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-3 px-6 font-display font-bold transition-colors"
      >
        <PlusSquare className="w-4 h-4" />
        Nouvelle commande
      </Link>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">Dernières commandes</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {recent.map(o => (
            <Link
              key={o.id}
              href={`/merchant/commande/${o.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-cream-50 transition-colors"
            >
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-sm text-ink-700">{o.clientName}</span>
              <span className="text-sm font-medium tabular-nums">{o.amount.toLocaleString("fr-FR")} F</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
