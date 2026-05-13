# Tranche P3 — Empty States sur les listes filtrables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le texte "Aucun résultat" minimaliste dans `DataTable` par un état vide enrichi (icône Search + titre contextuel + sous-titre + bouton reset) sur les 4 pages filtrables.

**Architecture:** `DataTable` reçoit 3 props optionnelles (`emptyTitle`, `emptyBody`, `onReset`). Chaque page ajoute une fonction `handleReset` qui vide `search` et `filters`, puis passe les props contextuelles à `<DataTable>`. Aucun nouveau fichier.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, lucide-react

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `components/admin/DataTable.tsx` | Modifier — +3 props, icône Search, empty state enrichi |
| `app/(admin)/admin/commandes/page.tsx` | Modifier — handleReset + props contextuelles |
| `app/(merchant)/merchant/commandes/page.tsx` | Modifier — handleReset + props contextuelles |
| `app/(admin)/admin/marchands/page.tsx` | Modifier — handleReset + props contextuelles |
| `app/(admin)/admin/livreurs/page.tsx` | Modifier — handleReset + props contextuelles |

---

## Task 1 : Étendre DataTable avec l'état vide enrichi

**Files:**
- Modify: `components/admin/DataTable.tsx`

Contenu actuel (pour référence) :
```tsx
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T extends object>({ columns, data, onRowClick, pageSize = 20 }: Props<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const slice = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 border-b border-cream-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr><td colSpan={columns.length} className="text-center py-10 text-ink-500 text-sm">Aucun résultat</td></tr>
            )}
            {slice.map((row, i) => {
              const r = row as Record<string, unknown>;
              return (
              <tr
                key={String(r.id ?? i)}
                className={cn("border-t border-cream-100 text-ink-900", onRowClick && "cursor-pointer hover:bg-cream-50 transition-colors")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : String(r[col.key] ?? "")}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 border-t border-cream-100 text-sm text-ink-500">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer `components/admin/DataTable.tsx`**

```tsx
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  onReset?: () => void;
}

export function DataTable<T extends object>({
  columns, data, onRowClick, pageSize = 20, emptyTitle, emptyBody, onReset,
}: Props<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const slice = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 border-b border-cream-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <Search className="w-8 h-8 text-ink-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink-900">
                    {emptyTitle ?? "Aucun résultat"}
                  </p>
                  {emptyBody && (
                    <p className="text-xs text-ink-500 mt-1">{emptyBody}</p>
                  )}
                  {onReset && (
                    <button
                      onClick={onReset}
                      className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-700"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </td>
              </tr>
            )}
            {slice.map((row, i) => {
              const r = row as Record<string, unknown>;
              return (
                <tr
                  key={String(r.id ?? i)}
                  className={cn("border-t border-cream-100 text-ink-900", onRowClick && "cursor-pointer hover:bg-cream-50 transition-colors")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : String(r[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 border-t border-cream-100 text-sm text-ink-500">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add components/admin/DataTable.tsx && git commit -m "feat(DataTable): empty state enrichi avec icône, titre contextuel et reset"
```

---

## Task 2 : Mettre à jour les 4 pages + build + tag

**Files:**
- Modify: `app/(admin)/admin/commandes/page.tsx`
- Modify: `app/(merchant)/merchant/commandes/page.tsx`
- Modify: `app/(admin)/admin/marchands/page.tsx`
- Modify: `app/(admin)/admin/livreurs/page.tsx`

---

- [ ] **Step 1 : Remplacer `app/(admin)/admin/commandes/page.tsx`**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
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
  const { orders } = useOrdersStore();
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
  }, [orders, search, filters]);

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

  function handleReset() {
    setSearch("");
    setFilters({});
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
        emptyTitle="Aucune commande trouvée"
        emptyBody="Essayez de modifier le statut, le paiement ou la recherche."
        onReset={handleReset}
      />
    </div>
  );
}
```

- [ ] **Step 2 : Remplacer `app/(merchant)/merchant/commandes/page.tsx`**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
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
    { label: "Tous",      value: "" },
    { label: "Créée",     value: "créée" },
    { label: "Assignée",  value: "assignée" },
    { label: "Collecte",  value: "collecte" },
    { label: "En route",  value: "en route" },
    { label: "Livrée",    value: "livrée" },
  ]},
];

export default function MesCommandesPage() {
  const { orders } = useOrdersStore();
  const router = useRouter();
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const q           = search.toLowerCase();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
      const matchStatus = !filters.status || o.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filters]);

  const columns: Column<Order>[] = [
    { key: "id",            label: "ID",       render: o => <span className="font-mono text-xs text-emerald-500">{o.id}</span> },
    { key: "clientName",    label: "Client" },
    { key: "status",        label: "Statut",   render: o => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
    )},
    { key: "paymentMethod", label: "Paiement", render: o => o.paymentMethod },
    { key: "amount",        label: "Montant",  render: o => `${o.amount.toLocaleString("fr-FR")} F` },
    { key: "createdAt",     label: "Date",     render: o => new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) },
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
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink-900">Mes commandes</h1>
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
        onRowClick={o => router.push(`/merchant/commande/${o.id}`)}
        pageSize={20}
        emptyTitle="Aucune commande trouvée"
        emptyBody="Essayez de modifier le statut ou la recherche."
        onReset={handleReset}
      />
    </div>
  );
}
```

- [ ] **Step 3 : Remplacer `app/(admin)/admin/marchands/page.tsx`**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { merchants, Merchant, MerchantPlan, MerchantStatus } from "@/lib/mock-data/merchants";
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
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => merchants.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchPlan   = !filters.plan   || m.plan   === filters.plan;
    const matchCity   = !filters.city   || m.city   === filters.city;
    const matchStatus = !filters.status || m.status === filters.status;
    return matchSearch && matchPlan && matchCity && matchStatus;
  }), [search, filters]);

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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink-900">Commerçants</h1>
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
```

- [ ] **Step 4 : Remplacer `app/(admin)/admin/livreurs/page.tsx`**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-ink-900">Livreurs</h1>
        <p className="text-sm text-ink-500 mt-1">{filtered.length} livreur{filtered.length > 1 ? "s" : ""}</p>
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
```

- [ ] **Step 5 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 6 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur.

- [ ] **Step 7 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(admin)/admin/commandes/page.tsx" "app/(merchant)/merchant/commandes/page.tsx" "app/(admin)/admin/marchands/page.tsx" "app/(admin)/admin/livreurs/page.tsx" && git commit -m "feat(empty-states): messages contextuels + reset sur les 4 listes filtrables" && git tag v1.4.0-tranche-P3
```
