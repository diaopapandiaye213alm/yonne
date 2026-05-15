"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { downloadCsv } from "@/lib/utils/csv";
import { Search, Download, CalendarDays, X } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { useT } from "@/lib/i18n";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
  "annulée":  "bg-red-100 text-red-600",
};

const PAYMENT_FILTERS: FilterDef[] = [
  { key: "payment", label: "Paiement", options: [
    { label: "Tous", value: "" },
    { label: "Wave", value: "wave" },
    { label: "Orange Money", value: "orange" },
    { label: "Cash", value: "cash" },
  ]},
];

export default function CommandesPage() {
  const t = useT();
  const router = useRouter();
  const { orders }  = useOrdersStore();
  const { drivers } = useDriversStore();
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [payment, setPayment]   = useState("");
  const [driverId, setDriverId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const driver = drivers.find(d => d.id === o.driverId);
      const q = search.toLowerCase();
      const matchSearch  = !q
        || o.id.toLowerCase().includes(q)
        || o.clientName.toLowerCase().includes(q)
        || driver?.name.toLowerCase().includes(q);
      const matchStatus  = !status   || o.status === status;
      const matchPayment = !payment  || o.paymentMethod === payment;
      const matchDriver  = !driverId || o.driverId === driverId;
      const created = new Date(o.createdAt);
      const matchFrom = !dateFrom || created >= new Date(dateFrom);
      const matchTo   = !dateTo   || created <= new Date(dateTo + "T23:59:59");
      return matchSearch && matchStatus && matchPayment && matchDriver && matchFrom && matchTo;
    });
  }, [orders, drivers, search, status, payment, driverId, dateFrom, dateTo]);

  const hasFilters = !!(search || status || payment || driverId || dateFrom || dateTo);

  const columns: Column<Order>[] = [
    { key: "id",            label: "ID",       render: o => <span className="font-mono text-xs text-emerald-500">{o.id}</span> },
    { key: "clientName",    label: "Client" },
    { key: "driverId",      label: "Livreur",  render: o => drivers.find(d => d.id === o.driverId)?.name ?? "—" },
    { key: "status",        label: "Statut",   render: o => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
    )},
    { key: "paymentMethod", label: "Paiement", render: o => o.paymentMethod },
    { key: "amount",        label: "Montant",  render: o => `${o.amount.toLocaleString("fr-FR")} F` },
    { key: "createdAt",     label: "Date",     render: o => new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) },
  ];

  function handleExport() {
    downloadCsv("commandes-yonne.csv", filtered.map(o => {
      const driver = drivers.find(d => d.id === o.driverId);
      return {
        id:          o.id,
        client:      o.clientName,
        telephone:   o.clientPhone,
        livreur:     driver?.name ?? "",
        statut:      o.status,
        paiement:    o.paymentMethod,
        montant:     o.amount,
        assurance:   o.insurance ? "oui" : "non",
        date:        new Date(o.createdAt).toLocaleString("fr-FR"),
      };
    }));
  }

  function handleReset() {
    setSearch(""); setStatus(""); setPayment(""); setDriverId(""); setDateFrom(""); setDateTo("");
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("navOrders")}</h1>
          <p className="text-sm text-ink-500 mt-1">{filtered.length} commande{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <button type="button" onClick={handleExport}
          className="flex items-center gap-2 border border-cream-200 rounded-lg px-4 py-2 text-sm text-ink-700 hover:bg-cream-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ID, client, livreur…"
            className="w-full pl-9 pr-3 py-2 border border-cream-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-10" />
        </div>

        {/* Status */}
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-10">
          <option value="">Tous statuts</option>
          {["créée","assignée","collecte","en route","livrée"].map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Payment */}
        <FilterBar search="" onSearch={() => {}} filters={PAYMENT_FILTERS}
          values={{ payment }} onFilter={(_, v) => setPayment(v)} />

        {/* Driver */}
        <select value={driverId} onChange={e => setDriverId(e.target.value)}
          className="border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-10 max-w-[180px]">
          <option value="">Tous livreurs</option>
          {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-1.5 border border-cream-200 rounded-lg px-3 h-10 bg-white">
          <CalendarDays className="w-4 h-4 text-ink-400 shrink-0" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-sm text-ink-700 bg-transparent focus:outline-none w-32" />
          <span className="text-ink-300 text-xs">→</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-sm text-ink-700 bg-transparent focus:outline-none w-32" />
        </div>

        {/* Reset */}
        {hasFilters && (
          <button type="button" onClick={handleReset}
            className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 px-2 py-1 rounded hover:bg-cream-100 transition-colors h-10">
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        )}
      </div>

      <DataTable<Order>
        columns={columns}
        data={filtered}
        onRowClick={o => router.push(`/admin/commandes/${o.id}`)}
        pageSize={20}
        emptyTitle="Aucune commande trouvée"
        emptyBody="Essayez de modifier le statut, le paiement ou la recherche."
        onReset={handleReset}
      />
    </div>
  );
}
