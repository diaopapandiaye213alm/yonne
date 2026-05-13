"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { drivers, Driver, Tier } from "@/lib/mock-data/drivers";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { Progress } from "@/components/ui/progress";

const TIER_COLORS: Record<Tier, string> = {
  Bronze: "bg-amber-100 text-amber-700",
  Argent: "bg-gray-100 text-gray-600",
  Or:     "bg-gold-500/20 text-ink-900",
};

const FILTERS: FilterDef[] = [
  { key: "status", label: "Statut", options: [
    { label: "Tous", value: "" },
    { label: "Actif", value: "actif" },
    { label: "Hors-ligne", value: "offline" },
  ]},
  { key: "tier", label: "Badge", options: [
    { label: "Tous", value: "" },
    { label: "Bronze", value: "Bronze" },
    { label: "Argent", value: "Argent" },
    { label: "Or", value: "Or" },
  ]},
];

export default function LivreursPage() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      const q = search.toLowerCase();
      const matchSearch  = !q || d.name.toLowerCase().includes(q) || d.phone.includes(q);
      const matchStatus  = !filters.status || (filters.status === "actif" ? d.online : !d.online);
      const matchTier    = !filters.tier   || d.tier === filters.tier;
      return matchSearch && matchStatus && matchTier;
    });
  }, [search, filters]);

  const columns: Column<Driver>[] = [
    { key: "name", label: "Nom", render: d => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-xs font-bold text-ink-700">
          {d.name.split(" ").filter(Boolean).map(n => n[0]).join("")}
        </div>
        <span>{d.name}</span>
      </div>
    )},
    { key: "scoreIA", label: "Score IA", render: d => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <Progress value={d.scoreIA} className="h-1.5 flex-1" />
        <span className="text-xs tabular-nums">{d.scoreIA}</span>
      </div>
    )},
    { key: "online", label: "Statut", render: d => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.online ? "bg-emerald-500/15 text-emerald-700" : "bg-cream-200 text-ink-500"}`}>
        {d.online ? "Actif" : "Hors-ligne"}
      </span>
    )},
    { key: "ordersToday",  label: "Livraisons", render: d => String(d.ordersToday) },
    { key: "rating",       label: "Note",        render: d => `${d.rating} ★` },
    { key: "tier",         label: "Badge",       render: d => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[d.tier]}`}>{d.tier}</span>
    )},
  ];

  function handleReset() {
    setSearch("");
    setFilters({});
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Livreurs</h1>
          <p className="text-sm text-ink-500 mt-1">{filtered.length} livreur{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/livreurs/nouveau"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" /> Nouveau livreur
        </Link>
      </div>
      <FilterBar
        search={search} onSearch={setSearch}
        filters={FILTERS} values={filters}
        onFilter={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
      />
      <DataTable<Driver>
        columns={columns}
        data={filtered}
        onRowClick={d => router.push(`/admin/livreurs/${d.id}`)}
        pageSize={20}
        emptyTitle="Aucun livreur trouvé"
        emptyBody="Essayez de modifier le statut ou le badge."
        onReset={handleReset}
      />
    </div>
  );
}
