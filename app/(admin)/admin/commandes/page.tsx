"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { orders } from "@/lib/mock-data/orders";
import { drivers } from "@/lib/mock-data/drivers";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { downloadCsv } from "@/lib/utils/csv";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

const FILTERS: FilterDef[] = [
  { key: "status", label: "Statut", options: [
    { label: "Tous", value: "" },
    { label: "Créée", value: "créée" },
    { label: "Assignée", value: "assignée" },
    { label: "Collecte", value: "collecte" },
    { label: "En route", value: "en route" },
    { label: "Livrée", value: "livrée" },
  ]},
  { key: "payment", label: "Paiement", options: [
    { label: "Tous", value: "" },
    { label: "Wave", value: "wave" },
    { label: "Orange Money", value: "orange" },
    { label: "Cash", value: "cash" },
  ]},
];

export default function CommandesPage() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const driver = drivers.find(d => d.id === o.driverId);
      const q = search.toLowerCase();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q) || driver?.name.toLowerCase().includes(q);
      const matchStatus  = !filters.status  || o.status === filters.status;
      const matchPayment = !filters.payment || o.paymentMethod === filters.payment;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [search, filters]);

  const columns: Column<Order>[] = [
    { key: "id", label: "ID", render: o => <span className="font-mono text-xs text-emerald-500">{o.id}</span> },
    { key: "clientName", label: "Client" },
    { key: "driverId", label: "Livreur", render: o => drivers.find(d => d.id === o.driverId)?.name ?? "—" },
    { key: "status", label: "Statut", render: o => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
    )},
    { key: "paymentMethod", label: "Paiement", render: o => o.paymentMethod },
    { key: "amount", label: "Montant", render: o => `${o.amount.toLocaleString("fr-FR")} F` },
    { key: "createdAt", label: "Date", render: o => new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) },
  ];

  function handleExport() {
    downloadCsv("commandes-yonne.csv", filtered.map(o => ({
      id: o.id, client: o.clientName, statut: o.status,
      paiement: o.paymentMethod, montant: o.amount,
      date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
    })));
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink-900">Commandes</h1>
        <p className="text-sm text-ink-500 mt-1">{filtered.length} commande{filtered.length > 1 ? "s" : ""}</p>
      </div>
      <FilterBar
        search={search} onSearch={setSearch}
        filters={FILTERS} values={filters}
        onFilter={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onExport={handleExport}
      />
      <DataTable<Order>
        columns={columns}
        data={filtered}
        onRowClick={o => router.push(`/admin/commandes/${o.id}`)}
        pageSize={20}
      />
    </div>
  );
}
