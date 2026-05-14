"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
import { Search, Users, ShoppingBag, TrendingUp, Star } from "lucide-react";

interface ClientSummary {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  preferredPayment: string;
  isVip: boolean;
}

const PAY_COLORS: Record<string, string> = {
  wave:   "bg-[#1B96D4]/10 text-[#1B96D4]",
  orange: "bg-orange-100 text-orange-700",
  cash:   "bg-cream-200 text-ink-700",
};
const PAY_LABELS: Record<string, string> = { wave: "Wave", orange: "Orange", cash: "Cash" };

function buildClients(orders: ReturnType<typeof useOrdersStore.getState>["orders"]): ClientSummary[] {
  const map = new Map<string, { orders: typeof orders; phone: string }>();
  for (const o of orders) {
    const existing = map.get(o.clientName);
    if (existing) {
      existing.orders.push(o);
    } else {
      map.set(o.clientName, { orders: [o], phone: o.clientPhone });
    }
  }

  return Array.from(map.entries()).map(([name, { orders: os, phone }]) => {
    const totalSpent = os.reduce((s, o) => s + o.amount, 0);
    const sorted = [...os].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const payCounts = os.reduce<Record<string, number>>((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + 1;
      return acc;
    }, {});
    const preferredPayment = Object.entries(payCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "cash";

    return {
      name,
      phone,
      totalOrders: os.length,
      totalSpent,
      lastOrder: new Date(sorted[0].createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      preferredPayment,
      isVip: os.length >= 5,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
}

export default function ClientsPage() {
  const router = useRouter();
  const { orders } = useOrdersStore();
  const [search, setSearch] = useState("");
  const [vipOnly, setVipOnly] = useState(false);

  const ALL_CLIENTS = useMemo(() => buildClients(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_CLIENTS.filter(c =>
      (!vipOnly || c.isVip) &&
      (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q))
    );
  }, [search, vipOnly, ALL_CLIENTS]);

  const totalRevenue = ALL_CLIENTS.reduce((s, c) => s + c.totalSpent, 0);
  const vipCount     = ALL_CLIENTS.filter(c => c.isVip).length;
  const avgSpent     = ALL_CLIENTS.length > 0 ? Math.round(totalRevenue / ALL_CLIENTS.length) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">

      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Clients</h1>
        <p className="text-sm text-ink-500 mt-1">{ALL_CLIENTS.length} client{ALL_CLIENTS.length > 1 ? "s" : ""} uniques</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Clients uniques",   value: ALL_CLIENTS.length,                  icon: Users,       color: "text-ink-700" },
          { label: "Clients VIP (≥5)",  value: vipCount,                            icon: Star,        color: "text-gold-500" },
          { label: "Panier moyen",      value: `${avgSpent.toLocaleString("fr-FR")} F`, icon: TrendingUp, color: "text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom ou téléphone…"
            className="w-full border border-cream-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        <button type="button" onClick={() => setVipOnly(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors border ${
            vipOnly
              ? "bg-gold-500/10 border-gold-500/30 text-gold-600"
              : "border-cream-200 text-ink-600 hover:bg-cream-100"
          }`}>
          <Star className="w-3.5 h-3.5" /> VIP seulement
        </button>
        <span className="text-xs text-ink-400">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-200">
              <tr>
                {["Client", "Téléphone", "Commandes", "Total dépensé", "Paiement préféré", "Dernière cmd", "Badge"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-ink-500">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.name} onClick={() => router.push(`/admin/clients/${encodeURIComponent(c.phone)}`)} className={`border-t border-cream-100 hover:bg-cream-50 transition-colors cursor-pointer ${i % 2 !== 0 ? "bg-cream-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-ink-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-ink-500">{c.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-ink-400" />
                        <span className="tabular-nums font-medium">{c.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-ink-900 tabular-nums">
                      {c.totalSpent.toLocaleString("fr-FR")} F
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${PAY_COLORS[c.preferredPayment] ?? "bg-cream-100 text-ink-600"}`}>
                        {PAY_LABELS[c.preferredPayment] ?? c.preferredPayment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">{c.lastOrder}</td>
                    <td className="px-4 py-3">
                      {c.isVip ? (
                        <span className="text-xs bg-gold-500/20 border border-gold-500/30 text-gold-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3" /> VIP
                        </span>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
