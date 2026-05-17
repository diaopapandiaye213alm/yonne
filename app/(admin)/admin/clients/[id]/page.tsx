"use client";

import Link from "next/link";
import { ArrowLeft, Phone, ShoppingBag, TrendingUp, Star, CreditCard, Calendar, Package } from "lucide-react";
import { useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/mock-data/orders";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":                  "bg-gray-100 text-gray-700",
  "en_attente_de_paiement": "bg-amber-100 text-amber-700",
  "payée_a_collecter":      "bg-emerald-100 text-emerald-700",
  "assignée":               "bg-blue-100 text-blue-700",
  "collecte":               "bg-amber-100 text-amber-700",
  "en route":               "bg-gold-500/20 text-ink-900",
  "livrée":                 "bg-emerald-500/20 text-emerald-700",
  "annulée":                "bg-red-100 text-red-600",
};

const PAY_COLORS: Record<string, string> = {
  wave:   "bg-[#1B96D4]/10 text-[#1B96D4]",
  orange: "bg-orange-100 text-orange-700",
  cash:   "bg-cream-200 text-ink-700",
};
const PAY_LABELS: Record<string, string> = { wave: "Wave", orange: "Orange", cash: "Cash" };

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const { orders } = useOrdersStore();
  const phone = decodeURIComponent(params.id);
  const clientOrders = orders
    .filter(o => o.clientPhone === phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (clientOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/admin/clients" className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <p className="text-ink-500">Client introuvable.</p>
      </div>
    );
  }

  const name     = clientOrders[0].clientName;
  const isVip    = clientOrders.length >= 5;
  const total    = clientOrders.reduce((s, o) => s + o.amount, 0);
  const avg      = Math.round(total / clientOrders.length);
  const delivered = clientOrders.filter(o => o.status === "livrée").length;
  const rate     = Math.round((delivered / clientOrders.length) * 100);

  const payCounts = clientOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + 1;
    return acc;
  }, {});
  const payTotal = Object.values(payCounts).reduce((s, v) => s + v, 0);
  const preferredPay = Object.entries(payCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "cash";

  const loyaltyPoints = clientOrders.length * 10 + (isVip ? 50 : 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/clients"
          className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700 font-bold text-lg">
            {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-ink-900">{name}</h1>
              {isVip && (
                <span className="text-xs bg-gold-500/20 border border-gold-500/30 text-gold-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> VIP
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ink-500 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono">{phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Commandes",     value: String(clientOrders.length), icon: ShoppingBag, color: "text-ink-700" },
          { label: "Total dépensé", value: `${total.toLocaleString("fr-FR")} F`, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Panier moyen",  value: `${avg.toLocaleString("fr-FR")} F`,   icon: CreditCard, color: "text-gold-500" },
          { label: "Taux livré",    value: `${rate} %`,                           icon: Package,   color: "text-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Paiements */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900">Paiements</h2>
          <div className="space-y-3">
            {Object.entries(payCounts).sort((a, b) => b[1] - a[1]).map(([method, count]) => {
              const pct = Math.round((count / payTotal) * 100);
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${PAY_COLORS[method] ?? "bg-cream-100 text-ink-600"}`}>
                      {PAY_LABELS[method] ?? method}
                      {method === preferredPay && <span className="ml-1 opacity-60">★ préféré</span>}
                    </span>
                    <span className="text-xs text-ink-500 tabular-nums">{count} × · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fidélité */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900">Fidélité</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-500/15 flex items-center justify-center">
              <Star className="w-8 h-8 text-gold-500" />
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-ink-900">{loyaltyPoints}</div>
              <div className="text-sm text-ink-500">points cumulés</div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-ink-500">
              <span>Prochain palier</span>
              <span className="font-medium text-ink-700">{Math.max(0, 200 - loyaltyPoints)} pts restants</span>
            </div>
            <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((loyaltyPoints / 200) * 100))}%` }} />
            </div>
          </div>
          {isVip && (
            <div className="text-xs text-gold-600 bg-gold-500/10 px-3 py-2 rounded-lg border border-gold-500/20">
              Client VIP — accès prioritaire &amp; bonus ×2 sur les points
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ink-400" /> Historique des commandes
          </h2>
          <span className="text-xs text-ink-400">{clientOrders.length} commande{clientOrders.length > 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-100">
              <tr>
                {["Réf.", "Date", "Montant", "Paiement", "Statut"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {clientOrders.map(o => (
                <tr key={o.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.id}`}
                      className="font-mono text-xs text-emerald-500 hover:underline"
                      onClick={e => e.stopPropagation()}>
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-ink-900 tabular-nums">
                    {o.amount.toLocaleString("fr-FR")} F
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${PAY_COLORS[o.paymentMethod] ?? "bg-cream-100 text-ink-600"}`}>
                      {PAY_LABELS[o.paymentMethod] ?? o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
