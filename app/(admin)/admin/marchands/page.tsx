"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMerchantsStore } from "@/lib/store/merchants";
import type { Merchant, MerchantPlan, MerchantStatus } from "@/lib/mock-data/merchants";
import { useT } from "@/lib/i18n";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";

const PLAN_COLORS: Record<MerchantPlan, string> = {
  Standard: "bg-cream-200 text-ink-700",
  Premium:  "bg-gold-500/20 text-ink-900",
};

const STATUS_COLORS: Record<MerchantStatus, string> = {
  actif:    "bg-emerald-500/15 text-emerald-700",
  suspendu: "bg-red-100 text-red-700",
};

const FILTERS: FilterDef[] = [
  { key: "plan",   label: "Plan",   options: [{ label: "Tous", value: "" }, { label: "Standard", value: "Standard" }, { label: "Premium", value: "Premium" }] },
  { key: "city",   label: "Ville",  options: [{ label: "Toutes", value: "" }, { label: "Dakar", value: "Dakar" }, { label: "Thiès", value: "Thiès" }, { label: "Saint-Louis", value: "Saint-Louis" }, { label: "Touba", value: "Touba" }] },
  { key: "status", label: "Statut", options: [{ label: "Tous", value: "" }, { label: "Actif", value: "actif" }, { label: "Suspendu", value: "suspendu" }] },
];

export default function MarchandsPage() {
  const t = useT();
  const router = useRouter();
  const { merchants } = useMerchantsStore();
  const [search, setSearch]   = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => merchants.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchPlan   = !filters.plan   || m.plan   === filters.plan;
    const matchCity   = !filters.city   || m.city   === filters.city;
    const matchStatus = !filters.status || m.status === filters.status;
    return matchSearch && matchPlan && matchCity && matchStatus;
  }), [search, filters, merchants]);

  const columns: Column<Merchant>[] = [
    { key: "name",  label: "Boutique" },
    { key: "email", label: "Email",   render: m => <span className="text-ink-500 text-xs">{m.email}</span> },
    { key: "city",  label: "Ville" },
    { key: "plan",  label: "Plan",    render: m => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[m.plan]}`}>{m.plan}</span> },
    { key: "ordersThisMonth",  label: "Cmdes/mois", render: m => String(m.ordersThisMonth) },
    { key: "revenueThisMonth", label: "CA mois",    render: m => `${m.revenueThisMonth.toLocaleString("fr-FR")} F` },
    { key: "status", label: "Statut", render: m => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[m.status]}`}>{m.status}</span> },
  ];

  function handleReset() {
    setSearch("");
    setFilters({});
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink-900">{t("merchantsTitle")}</h1>
        <p className="text-sm text-ink-500 mt-1">{filtered.length} commerçant{filtered.length > 1 ? "s" : ""}</p>
      </div>
      <FilterBar
        search={search} onSearch={setSearch}
        filters={FILTERS} values={filters}
        onFilter={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
      />
      <DataTable<Merchant>
        columns={columns}
        data={filtered}
        onRowClick={m => router.push(`/admin/marchands/${m.id}`)}
        pageSize={20}
        emptyTitle="Aucun commerçant trouvé"
        emptyBody="Essayez de modifier le plan, la ville ou le statut."
        onReset={handleReset}
      />
    </div>
  );
}
