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

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? "↑" : "↓"} {up ? "+" : ""}{pct}% vs mois passé
    </span>
  );
}

export default function MerchantAccueilPage() {
  const merchant  = merchants[0];
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = Math.round(delivered / orders.length * 100);
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const deltaOrders  = Math.round((merchant.ordersThisMonth  - merchant.ordersLastMonth)  / merchant.ordersLastMonth  * 100);
  const deltaRevenue = Math.round((merchant.revenueThisMonth - merchant.revenueLastMonth) / merchant.revenueLastMonth * 100);
  const tauxLivreLastMonth = Math.round(tauxLivre * (0.92 + (merchant.ordersLastMonth % 10) / 100));
  const deltaTaux = tauxLivre - tauxLivreLastMonth;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in-up">

      {/* ── Greeting header ── */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 shadow-glow-emerald">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="merchant-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#merchant-dots)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-emerald-300/60 text-xs font-medium uppercase tracking-widest mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Bonjour, {merchant.name} 👋</h1>
          <p className="text-emerald-200/60 text-sm mt-0.5">Plan {merchant.plan} · Commission {merchant.plan === "Premium" ? "12%" : "15%"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Commandes ce mois", value: String(merchant.ordersThisMonth),                         icon: Package,      delta: deltaOrders  },
          { label: "Revenus ce mois",   value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp,   delta: deltaRevenue },
          { label: "Taux livré",        value: `${tauxLivre}%`,                                          icon: CheckCircle2, delta: deltaTaux    },
        ].map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
            <div className="mt-1"><Delta pct={delta} /></div>
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
