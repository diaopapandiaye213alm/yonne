"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
import { useT } from "@/lib/i18n";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { downloadCsv } from "@/lib/utils/csv";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { Package, Truck, CheckCircle2, Banknote, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

const FILTERS: FilterDef[] = [
  { key: "status", label: "Statut", options: [
    { label: "Tous",      value: "" },
    { label: "Créée",     value: "créée" },
    { label: "Assignée",  value: "assignée" },
    { label: "Collecte",  value: "collecte" },
    { label: "En route",  value: "en route" },
    { label: "Livrée",    value: "livrée" },
  ]},
];

const STATUS_QUICK: { label: string; value: OrderStatus | ""; color: string }[] = [
  { label: "Tous",      value: "",          color: "bg-cream-100 text-ink-600" },
  { label: "En route",  value: "en route",  color: "bg-gold-500/20 text-ink-900" },
  { label: "Livrée",    value: "livrée",    color: "bg-emerald-500/20 text-emerald-700" },
  { label: "Créée",     value: "créée",     color: "bg-gray-100 text-gray-700" },
  { label: "Collecte",  value: "collecte",  color: "bg-amber-100 text-amber-700" },
  { label: "Assignée",  value: "assignée",  color: "bg-blue-100 text-blue-700" },
];

export default function MesCommandesPage() {
  const t           = useT();
  const { orders }  = useOrdersStore();
  const router      = useRouter();
  const [search,      setSearch]      = useState("");
  const [filters,     setFilters]     = useState<Record<string, string>>({});
  const [quickStatus, setQuickStatus] = useState<string>("");

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const kpis = useMemo(() => {
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    return {
      total:    orders.length,
      enRoute:  orders.filter(o => o.status === "en route").length,
      livrees:  orders.filter(o => o.status === "livrée").length,
      revToday: todayOrders.reduce((s, o) => s + o.amount, 0),
    };
  }, [orders, today]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const activeStatus = quickStatus || filters.status || "";
    return orders.filter(o => {
      const q           = search.toLowerCase();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
      const matchStatus = !activeStatus || o.status === activeStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filters, quickStatus]);

  const trackingBase = typeof window !== "undefined" ? window.location.origin : "";

  const columns: Column<Order>[] = [
    { key: "id",            label: "ID",       render: o => <span className="font-mono text-xs text-emerald-500">{o.id}</span> },
    { key: "clientName",    label: "Client" },
    { key: "status",        label: "Statut",   render: o => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
    )},
    { key: "paymentMethod", label: "Paiement", render: o => o.paymentMethod },
    { key: "amount",        label: "Montant",  render: o => `${o.amount.toLocaleString("fr-FR")} F` },
    { key: "createdAt",     label: "Date",     render: o => new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) },
    {
      key: "id" as keyof Order,
      label: "Suivi",
      render: o => {
        const isActive = ["assignée", "collecte", "en route"].includes(o.status);
        return (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <a
              href={`/suivi/${o.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir le tracking client"
              className={`p-1.5 rounded-md transition-colors ${isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-ink-300 hover:bg-cream-100"}`}
            >
              <MapPin className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              title="Copier le lien tracking"
              onClick={() => {
                const url = `${trackingBase}/suivi/${o.id}`;
                navigator.clipboard.writeText(url).then(() => toast.success("Lien copié !"));
              }}
              className="p-1.5 rounded-md text-ink-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  function handleExport() {
    downloadCsv("mes-commandes.csv", filtered.map(o => ({
      id: o.id, client: o.clientName, statut: o.status,
      paiement: o.paymentMethod, montant: o.amount,
      date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
    })));
  }

  function handleReset() {
    setSearch("");
    setFilters({});
    setQuickStatus("");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">{t("navMyOrders")}</h1>
        <p className="text-sm text-ink-500 mt-1">{orders.length} {t("ordersTotal")}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stagger-1 animate-fade-in-up bg-white rounded-lg border border-cream-200 shadow-card p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-ink-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-2xl font-display font-bold text-ink-900 tabular-nums">{kpis.total}</div>
            <div className="text-xs text-ink-500 mt-0.5">{t("totalOrders")}</div>
          </div>
        </div>
        <div className="stagger-2 animate-fade-in-up bg-white rounded-lg border border-gold-500/30 shadow-card p-4 flex items-start gap-3">
          <Truck className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-2xl font-display font-bold text-ink-900 tabular-nums">{kpis.enRoute}</div>
            <div className="text-xs text-ink-500 mt-0.5">{t("enRouteLabel")}</div>
          </div>
        </div>
        <div className="stagger-3 animate-fade-in-up bg-white rounded-lg border border-emerald-200 shadow-card p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-2xl font-display font-bold text-emerald-600 tabular-nums">{kpis.livrees}</div>
            <div className="text-xs text-ink-500 mt-0.5">{t("livreesLabel")}</div>
          </div>
        </div>
        <div className="stagger-4 animate-fade-in-up bg-white rounded-lg border border-cream-200 shadow-card p-4 flex items-start gap-3">
          <Banknote className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-2xl font-display font-bold text-ink-900 tabular-nums">
              {kpis.revToday.toLocaleString("fr-FR")}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">{t("revenuToday")}</div>
          </div>
        </div>
      </div>

      {/* Quick-filter status bubbles */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_QUICK.map(s => {
          const count = s.value === "" ? orders.length : (statusCounts[s.value] ?? 0);
          const active = quickStatus === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => { setQuickStatus(s.value); setFilters({}); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                active
                  ? `${s.color} ring-2 ring-offset-1 ring-current`
                  : `${s.color} opacity-70 hover:opacity-100`
              }`}
            >
              {s.label}
              <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <div>
        <FilterBar
          search={search} onSearch={setSearch}
          filters={FILTERS} values={filters}
          onFilter={(k, v) => { setFilters(prev => ({ ...prev, [k]: v })); setQuickStatus(""); }}
          onExport={handleExport}
        />
        <p className="text-xs text-ink-400 mt-2">{filtered.length} {t("resultsCount")}{filtered.length > 1 ? "s" : ""}</p>
      </div>
      <DataTable<Order>
        columns={columns}
        data={filtered}
        onRowClick={o => router.push(`/merchant/commande/${o.id}`)}
        pageSize={20}
        emptyTitle="Aucune commande trouvée"
        emptyBody="Essayez de modifier le statut ou la recherche."
        onReset={handleReset}
      />
    </div>
  );
}
