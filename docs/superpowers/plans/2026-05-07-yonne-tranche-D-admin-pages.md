# YONNE Tranche D — Admin Pages Manquantes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer les 7 pages admin manquantes (commandes, livreurs, marchands, finance, analytics, surge, settings) avec pages de détail, composants partagés et données mock.

**Architecture:** Les pages de liste sont des Server Components qui passent les données à un `DataTable` client-side pour pagination/filtrage. Les pages de détail sont Server Components. La page Surge utilise un store Zustand pour le slider. Finance et Settings utilisent `"use client"` pour l'interactivité.

**Tech Stack:** Next.js 14 App Router, TypeScript, Zustand v5, Recharts v3, react-leaflet@4.2.1 (dynamic import, SSR: false), Tailwind CSS v3, shadcn/ui, lucide-react.

---

## Fichiers

| Action | Chemin |
|---|---|
| Créer | `lib/mock-data/merchants.ts` |
| Créer | `lib/mock-data/finance.ts` |
| Créer | `lib/mock-data/analytics.ts` |
| Créer | `lib/mock-data/surge.ts` |
| Créer | `lib/utils/csv.ts` |
| Créer | `lib/store/surge.ts` |
| Créer | `components/admin/DataTable.tsx` |
| Créer | `components/admin/FilterBar.tsx` |
| Créer | `components/admin/StatCard.tsx` |
| Créer | `app/(admin)/admin/commandes/page.tsx` |
| Créer | `app/(admin)/admin/commandes/[id]/page.tsx` |
| Créer | `app/(admin)/admin/livreurs/page.tsx` |
| Créer | `app/(admin)/admin/livreurs/[id]/page.tsx` |
| Créer | `app/(admin)/admin/marchands/page.tsx` |
| Créer | `app/(admin)/admin/marchands/[id]/page.tsx` |
| Créer | `app/(admin)/admin/finance/page.tsx` |
| Créer | `app/(admin)/admin/analytics/page.tsx` |
| Créer | `app/(admin)/admin/surge/page.tsx` |
| Créer | `app/(admin)/admin/settings/page.tsx` |

---

## Task 1 — Mock data : merchants, finance, analytics, surge

**Files:**
- Create: `lib/mock-data/merchants.ts`
- Create: `lib/mock-data/finance.ts`
- Create: `lib/mock-data/analytics.ts`
- Create: `lib/mock-data/surge.ts`

- [ ] **Créer `lib/mock-data/merchants.ts`**

```ts
export type MerchantPlan   = "Standard" | "Premium";
export type MerchantStatus = "actif" | "suspendu";

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  plan: MerchantPlan;
  status: MerchantStatus;
  ordersThisMonth: number;
  revenueThisMonth: number;
  joinedAt: string;
}

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}

const cities = ["Dakar", "Thiès", "Saint-Louis", "Touba"];
const plans: MerchantPlan[] = ["Standard", "Premium"];
const shopNames = [
  "Boutique Fatou Textile", "Resto Keur Sénégal", "Boulangerie du Plateau",
  "Pharma Médina", "Superette Point E", "Mode et Style Dakar",
  "Librairie Sandaga", "Traiteur Mariama", "Épicerie Colobane", "Tech Shop VDN",
];

export const merchants: Merchant[] = shopNames.map((name, i) => ({
  id: `mch-${String(i + 1).padStart(3, "0")}`,
  name,
  email: `contact${i + 1}@${name.toLowerCase().replace(/[^a-z]/g, "")}.sn`,
  phone: `+221 77 ${String(Math.floor(r(i + 1, 100, 999)))} ${String(Math.floor(r(i + 2, 1000, 9999)))}`,
  city: cities[Math.floor(r(i + 3, 0, cities.length))],
  plan: plans[Math.floor(r(i + 5, 0, plans.length))],
  status: i < 8 ? "actif" : "suspendu",
  ordersThisMonth: Math.floor(r(i + 7, 40, 400)),
  revenueThisMonth: Math.floor(r(i + 9, 200_000, 2_000_000) / 1000) * 1000,
  joinedAt: new Date(2025, Math.floor(r(i + 11, 0, 12)), Math.floor(r(i + 13, 1, 28)) + 1)
    .toISOString().split("T")[0],
}));
```

- [ ] **Créer `lib/mock-data/finance.ts`**

```ts
export interface Transaction {
  id: string;
  driverName: string;
  method: "wave" | "orange" | "cash";
  amount: number;
  commission: number;
  date: string;
}
export interface TontineMember   { name: string; paid: boolean; }
export interface AdvanceRequest  { id: string; driverName: string; earningsToday: number; requestedAmount: number; fee: number; }
export interface ReferralPrize   { referrerName: string; refereeName: string; prizeAmount: number; }

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
const names = ["Ibrahima Sow","Moussa Diop","Fatou Ndiaye","Cheikh Sarr","Awa Diouf","Pape Fall","Aminata Mbaye","Ousmane Cissé"];
const methods = ["wave", "orange", "cash"] as const;

export const transactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: `TXN-${String(1000 + i)}`,
  driverName: names[Math.floor(r(i + 1, 0, names.length))],
  method: methods[Math.floor(r(i + 3, 0, 3))],
  amount: Math.floor(r(i + 5, 8_000, 30_000) / 100) * 100,
  commission: Math.floor(r(i + 7, 1_200, 4_500) / 100) * 100,
  date: new Date(2026, 4, 20, Math.floor(r(i + 9, 8, 22)), 0).toISOString(),
}));

export const waveTotal   = transactions.filter(t => t.method === "wave").reduce((s, t) => s + t.amount, 0);
export const orangeTotal = transactions.filter(t => t.method === "orange").reduce((s, t) => s + t.amount, 0);
export const cashTotal   = transactions.filter(t => t.method === "cash").reduce((s, t) => s + t.amount, 0);

export const tontineWeek           = 12;
export const tontineMembers: TontineMember[] = names.slice(0, 8).map((name, i) => ({ name, paid: i < 6 }));
export const tontineBeneficiary     = names[3];
export const tontineNextBeneficiary = names[5];

export const advanceRequests: AdvanceRequest[] = [
  { id: "ADV-001", driverName: "Ibrahima Sow", earningsToday: 34_000, requestedAmount: 27_200, fee: 544 },
  { id: "ADV-002", driverName: "Moussa Diop",  earningsToday: 28_000, requestedAmount: 22_400, fee: 448 },
  { id: "ADV-003", driverName: "Cheikh Sarr",  earningsToday: 41_000, requestedAmount: 32_800, fee: 656 },
];

export const referralPrizes: ReferralPrize[] = [
  { referrerName: "Ibrahima Sow",  refereeName: "Lamine Ka",     prizeAmount: 5_000 },
  { referrerName: "Moussa Diop",   refereeName: "Ousmane Cissé", prizeAmount: 5_000 },
  { referrerName: "Cheikh Sarr",   refereeName: "Saliou Niang",  prizeAmount: 5_000 },
];

export const insuranceCount   = 34;
export const insuranceRevenue = insuranceCount * 200;
export const insuranceMargin  = Math.round(insuranceRevenue * 0.82);
```

- [ ] **Créer `lib/mock-data/analytics.ts`**

```ts
export interface HourlyRevenue { hour: string; today: number; lastWeek: number; }
export interface ZoneActivity  { name: string; lat: number; lng: number; orders: number; radius: number; }
export interface WeeklyMerchants { week: string; active: number; }

export const hourlyRevenue: HourlyRevenue[] = Array.from({ length: 24 }, (_, h) => {
  const active = h >= 7 && h <= 22;
  return {
    hour: `${String(h).padStart(2, "0")}h`,
    today:    active ? Math.floor(15_000 + Math.sin((h - 7) * 0.5) * 35_000 + (h * 1234 % 8000)) : 0,
    lastWeek: active ? Math.floor(12_000 + Math.sin((h - 7) * 0.5) * 30_000 + (h * 987  % 6000)) : 0,
  };
});

export const zoneActivity: ZoneActivity[] = [
  { name: "Plateau",             lat: 14.6720, lng: -17.4380, orders: 45, radius: 600 },
  { name: "Médina",              lat: 14.6770, lng: -17.4480, orders: 38, radius: 550 },
  { name: "Parcelles Assainies", lat: 14.7610, lng: -17.4290, orders: 29, radius: 500 },
  { name: "Grand Yoff",          lat: 14.7320, lng: -17.4580, orders: 22, radius: 450 },
  { name: "Ouakam",              lat: 14.7430, lng: -17.5010, orders: 18, radius: 400 },
  { name: "Almadies",            lat: 14.7490, lng: -17.5290, orders: 12, radius: 350 },
  { name: "Point E",             lat: 14.6930, lng: -17.4650, orders: 31, radius: 500 },
  { name: "Mermoz",              lat: 14.7140, lng: -17.4780, orders: 25, radius: 460 },
];

export const weeklyMerchants: WeeklyMerchants[] = [
  { week: "S18", active: 21 }, { week: "S19", active: 24 }, { week: "S20", active: 28 },
  { week: "S21", active: 31 }, { week: "S22", active: 29 }, { week: "S23", active: 35 },
  { week: "S24", active: 38 }, { week: "S25", active: 42 },
];

export const ordersToday      = 147;
export const breakEvenTarget  = 24;
export const profitableTarget = 300;
```

- [ ] **Créer `lib/mock-data/surge.ts`**

```ts
export interface SurgeHour { hour: string; multiplier: number; }

export const surgeHistory: SurgeHour[] = Array.from({ length: 24 }, (_, h) => {
  let m = 1.0;
  if (h >= 7  && h <= 9)  m = 1.2 + (h - 7) * 0.1;
  if (h >= 12 && h <= 14) m = 1.4;
  if (h >= 17 && h <= 21) m = 1.5 + (h - 17) * 0.1;
  return { hour: `${String(h).padStart(2, "0")}h`, multiplier: Math.min(2.0, Math.round(m * 10) / 10) };
});
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
git add lib/mock-data/merchants.ts lib/mock-data/finance.ts lib/mock-data/analytics.ts lib/mock-data/surge.ts
git commit -m "feat(data): mock data merchants, finance, analytics, surge"
```

---

## Task 2 — Composants partagés admin

**Files:**
- Create: `components/admin/DataTable.tsx`
- Create: `components/admin/FilterBar.tsx`
- Create: `components/admin/StatCard.tsx`

- [ ] **Créer `components/admin/DataTable.tsx`**

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

export function DataTable<T extends Record<string, unknown>>({ columns, data, onRowClick, pageSize = 20 }: Props<T>) {
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
            {slice.map((row, i) => (
              <tr
                key={String(row.id ?? i)}
                className={cn("border-t border-cream-100 text-ink-900", onRowClick && "cursor-pointer hover:bg-cream-50 transition-colors")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
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

- [ ] **Créer `components/admin/FilterBar.tsx`**

```tsx
"use client";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface FilterDef {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilter?: (key: string, value: string) => void;
  onExport?: () => void;
}

export function FilterBar({ search, onSearch, filters = [], values = {}, onFilter, onExport }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher…" className="pl-9" />
      </div>
      {filters.map(f => (
        <select
          key={f.key}
          value={values[f.key] ?? ""}
          onChange={e => onFilter?.(f.key, e.target.value)}
          className="border border-input rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-ring h-10"
        >
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2 h-10">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Créer `components/admin/StatCard.tsx`**

```tsx
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export function StatCard({ title, children, action, className }: Props) {
  return (
    <div className={cn("bg-white rounded-lg border border-cream-200 shadow-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-900">{title}</h3>
        {action && (
          <Link href={action.href} className="text-xs text-emerald-500 hover:underline">{action.label} →</Link>
        )}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add components/admin/
git commit -m "feat(admin): shared DataTable, FilterBar, StatCard components"
```

---

## Task 3 — CSV util + Surge store

**Files:**
- Create: `lib/utils/csv.ts`
- Create: `lib/store/surge.ts`

- [ ] **Créer `lib/utils/csv.ts`**

```ts
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape  = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines   = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))];
  const blob    = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Créer `lib/store/surge.ts`**

```ts
"use client";
import { create } from "zustand";

interface SurgeState {
  multiplier: number;
  autoMode: boolean;
  setMultiplier: (v: number) => void;
  toggleAutoMode: () => void;
}

export const useSurgeStore = create<SurgeState>((set) => ({
  multiplier: 1.4,
  autoMode: true,
  setMultiplier: (v) => set({ multiplier: Math.round(v * 10) / 10 }),
  toggleAutoMode: () => set((s) => ({ autoMode: !s.autoMode })),
}));
```

- [ ] **Commit**

```bash
git add lib/utils/csv.ts lib/store/surge.ts
git commit -m "feat(admin): csv util and surge store"
```

---

## Task 4 — `/admin/commandes` — liste

**Files:**
- Create: `app/(admin)/admin/commandes/page.tsx`

- [ ] **Créer `app/(admin)/admin/commandes/page.tsx`**

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { orders } from "@/lib/mock-data/orders";
import { drivers } from "@/lib/mock-data/drivers";
import { DataTable, Column } from "@/components/admin/DataTable";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { downloadCsv } from "@/lib/utils/csv";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/mock-data/orders";

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
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={o => router.push(`/admin/commandes/${(o as unknown as Order).id}`)}
        pageSize={20}
      />
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add app/\(admin\)/admin/commandes/page.tsx
git commit -m "feat(admin): commandes list page with search, filters, export CSV"
```

---

## Task 5 — `/admin/commandes/[id]` — détail commande

**Files:**
- Create: `app/(admin)/admin/commandes/[id]/page.tsx`

- [ ] **Créer `app/(admin)/admin/commandes/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { orders } from "@/lib/mock-data/orders";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { ArrowLeft } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const STATUS_STAGE: Record<string, "created" | "assigned" | "enroute" | "delivered"> = {
  "créée":    "created",
  "assignée": "assigned",
  "collecte": "assigned",
  "en route": "enroute",
  "livrée":   "delivered",
};

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export default function CommandeDetailPage({ params }: { params: { id: string } }) {
  const order = orders.find(o => o.id === params.id);
  if (!order) notFound();

  const driver   = drivers.find(d => d.id === order.driverId);
  const landmark = landmarks.find(l => l.id === order.landmarkId);
  const DAKAR: [number, number] = [14.6928, -17.4467];
  const center: [number, number] = landmark ? [landmark.lat, landmark.lng] : DAKAR;

  const pins = landmark
    ? [{ id: "dest", lat: landmark.lat, lng: landmark.lng, kind: "dest" as const }]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/commandes" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">{order.id}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Client</h2>
          <div className="text-sm text-ink-700">{order.clientName}</div>
          <div className="text-sm text-ink-500">{order.clientPhone}</div>
          <div className="text-sm"><span className="text-ink-500">Paiement :</span> <span className="font-medium capitalize">{order.paymentMethod}</span></div>
          <div className="text-sm"><span className="text-ink-500">Montant :</span> <span className="font-bold text-ink-900">{order.amount.toLocaleString("fr-FR")} F</span></div>
          {order.insurance && <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Assurance colis activée (+200 F)</div>}
          <div className="text-sm text-ink-500">Créée le {new Date(order.createdAt).toLocaleString("fr-FR")}</div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Livreur assigné</h2>
          {driver ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {driver.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-medium text-ink-900">{driver.name}</div>
                  <div className="text-xs text-ink-500">{driver.phone}</div>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span><span className="text-ink-500">Score IA :</span> <strong>{driver.scoreIA}/100</strong></span>
                <span><span className="text-ink-500">Note :</span> <strong>{driver.rating} ★</strong></span>
              </div>
              <Link href={`/admin/livreurs/${driver.id}`} className="text-xs text-emerald-500 hover:underline">
                Voir profil livreur →
              </Link>
            </>
          ) : (
            <div className="text-sm text-ink-500">Aucun livreur assigné</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
          <DakarMap pins={pins} center={center} zoom={14} height="300px" />
        </div>
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Suivi</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[order.status] ?? "created"} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/commandes/[id]/page.tsx"
git commit -m "feat(admin): commande detail page with map, timeline, driver info"
```

---

## Task 6 — `/admin/livreurs` — liste

**Files:**
- Create: `app/(admin)/admin/livreurs/page.tsx`

- [ ] **Créer `app/(admin)/admin/livreurs/page.tsx`**

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
          {d.name.split(" ").map(n => n[0]).join("")}
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
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={d => router.push(`/admin/livreurs/${(d as unknown as Driver).id}`)}
        pageSize={20}
      />
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/livreurs/page.tsx"
git commit -m "feat(admin): livreurs list page with score IA, tier, status filters"
```

---

## Task 7 — `/admin/livreurs/[id]` — profil livreur

**Files:**
- Create: `app/(admin)/admin/livreurs/[id]/page.tsx`

- [ ] **Créer `app/(admin)/admin/livreurs/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { drivers, Tier } from "@/lib/mock-data/drivers";
import { orders } from "@/lib/mock-data/orders";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Bike, Package } from "lucide-react";

const TIER_COLORS: Record<Tier, string> = {
  Bronze: "bg-amber-100 text-amber-700 border-amber-200",
  Argent: "bg-gray-100 text-gray-700 border-gray-200",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/30",
};

const ALL_BADGES = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"] as const;

export default function LivreurDetailPage({ params }: { params: { id: string } }) {
  const driver = drivers.find(d => d.id === params.id);
  if (!driver) notFound();

  const driverOrders = orders.filter(o => o.driverId === driver.id).slice(0, 10);
  const weekEarnings = [12000, 18500, 22000, 15000, 28000, 31000, driver.earningsToday];
  const maxEarning   = Math.max(...weekEarnings);

  const scoreDistance  = Math.round(driver.scoreIA * 0.92);
  const scoreCharge    = Math.round(driver.scoreIA * 0.85);
  const scoreFiabilite = Math.round(driver.scoreIA * 0.97);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/livreurs" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold">
              {driver.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-ink-900">{driver.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TIER_COLORS[driver.tier]}`}>{driver.tier}</span>
            </div>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${driver.online ? "bg-emerald-500/15 text-emerald-700" : "bg-cream-200 text-ink-500"}`}>
          {driver.online ? "● Actif" : "○ Hors-ligne"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Livraisons totales", value: String(driver.ordersToday * 14), icon: Package },
          { label: "Note moyenne",       value: `${driver.rating} ★`,           icon: Star },
          { label: "Véhicule",           value: driver.vehicle,                  icon: Bike },
          { label: "Gains aujourd'hui",  value: `${driver.earningsToday.toLocaleString("fr-FR")} F`, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-lg font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Score IA — {driver.scoreIA}/100</h2>
          <div className="space-y-3">
            {[
              { label: "Distance (40%)",   value: scoreDistance },
              { label: "Charge (30%)",     value: scoreCharge },
              { label: "Fiabilité (30%)",  value: scoreFiabilite },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-700">{label}</span>
                  <span className="tabular-nums font-medium">{value}/100</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Gains — 7 derniers jours</h2>
          <div className="flex items-end gap-1 h-24">
            {weekEarnings.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === 6 ? "bg-emerald-500" : "bg-cream-200"}`}
                  style={{ height: `${Math.round((v / maxEarning) * 80)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {["L","M","Me","J","V","S","D"].map(j => (
              <div key={j} className="flex-1 text-center text-xs text-ink-500">{j}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map(badge => (
            <span
              key={badge}
              className={`text-sm px-3 py-1.5 rounded-full border font-medium ${
                driver.badges.includes(badge as typeof driver.badges[number])
                  ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
                  : "bg-cream-100 border-cream-200 text-ink-500 opacity-40"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">10 dernières livraisons</h2>
        {driverOrders.length === 0 ? (
          <p className="text-sm text-ink-500">Aucune livraison enregistrée.</p>
        ) : (
          <div className="space-y-2">
            {driverOrders.map(o => (
              <Link key={o.id} href={`/admin/commandes/${o.id}`} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded transition-colors">
                <span className="font-mono text-xs text-emerald-500">{o.id}</span>
                <span className="text-sm text-ink-700">{o.clientName}</span>
                <span className="text-sm font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/livreurs/[id]/page.tsx"
git commit -m "feat(admin): livreur detail page with score IA, badges, earnings chart"
```

---

## Task 8 — `/admin/marchands` — liste + détail

**Files:**
- Create: `app/(admin)/admin/marchands/page.tsx`
- Create: `app/(admin)/admin/marchands/[id]/page.tsx`

- [ ] **Créer `app/(admin)/admin/marchands/page.tsx`**

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
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        onRowClick={m => router.push(`/admin/marchands/${(m as unknown as Merchant).id}`)}
        pageSize={20}
      />
    </div>
  );
}
```

- [ ] **Créer `app/(admin)/admin/marchands/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { ArrowLeft } from "lucide-react";

const PLAN_COLORS = { Standard: "bg-cream-200 text-ink-700", Premium: "bg-gold-500/20 text-ink-900" } as const;

export default function MarchandDetailPage({ params }: { params: { id: string } }) {
  const merchant = merchants.find(m => m.id === params.id);
  if (!merchant) notFound();

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/marchands" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">{merchant.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[merchant.plan]}`}>{merchant.plan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Informations</h2>
          {[
            ["Email",       merchant.email],
            ["Téléphone",   merchant.phone],
            ["Ville",       merchant.city],
            ["Inscrit le",  new Date(merchant.joinedAt).toLocaleDateString("fr-FR")],
            ["Statut",      merchant.status],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-ink-500">{k}</span>
              <span className="text-ink-900 font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Performance ce mois</h2>
          <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">
            {merchant.revenueThisMonth.toLocaleString("fr-FR")} F
          </div>
          <div className="text-sm text-ink-500">{merchant.ordersThisMonth} commandes</div>
          <div className="text-sm text-ink-500">
            Commission YONNE : <strong className="text-ink-900">
              {Math.round(merchant.revenueThisMonth * (merchant.plan === "Premium" ? 0.12 : 0.15)).toLocaleString("fr-FR")} F
            </strong>
            <span className="ml-1">({merchant.plan === "Premium" ? "12%" : "15%"})</span>
          </div>
          {merchant.plan === "Standard" && (
            <button className="w-full mt-2 bg-gold-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-gold-600 transition-colors">
              Passer en Premium (15 000 F/mois)
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">QR Code boutique</h2>
        <div className="flex items-center gap-6">
          <svg width="80" height="80" viewBox="0 0 80 80" className="border border-cream-200 rounded p-1">
            {/* Motif QR statique simplifié pour la démo */}
            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
              const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
              const dot = corner || ((r + c + parseInt(merchant.id.replace(/\D/g,""),10)) % 3 === 0);
              return dot ? <rect key={`${r}-${c}`} x={c*11+2} y={r*11+2} width="9" height="9" fill="#3F2A1F" rx="1" /> : null;
            }))}
          </svg>
          <div>
            <p className="text-sm text-ink-700">Les clients scannent ce QR pour commander directement depuis WhatsApp.</p>
            <button className="mt-3 text-sm text-emerald-500 hover:underline">↓ Télécharger (PNG)</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">5 dernières commandes</h2>
        <div className="space-y-2">
          {recentOrders.map(o => (
            <Link key={o.id} href={`/admin/commandes/${o.id}`} className="flex justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded text-sm transition-colors">
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-ink-700">{o.clientName}</span>
              <span className="font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/marchands/"
git commit -m "feat(admin): marchands list and detail pages with QR code"
```

---

## Task 9 — `/admin/finance` — vue d'ensemble

**Files:**
- Create: `app/(admin)/admin/finance/page.tsx`

- [ ] **Créer `app/(admin)/admin/finance/page.tsx`**

```tsx
import { StatCard } from "@/components/admin/StatCard";
import {
  transactions, waveTotal, orangeTotal, cashTotal,
  tontineWeek, tontineMembers, tontineBeneficiary, tontineNextBeneficiary,
  advanceRequests, referralPrizes, insuranceCount, insuranceRevenue, insuranceMargin,
} from "@/lib/mock-data/finance";
import { CheckCircle2, Circle } from "lucide-react";

function fmt(n: number) { return n.toLocaleString("fr-FR"); }

export default function FinancePage() {
  const totalDay = waveTotal + orangeTotal + cashTotal;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-display font-bold text-ink-900">Finance</h1>
        <p className="text-sm text-ink-500 mt-1">Vue d'ensemble — aujourd'hui</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Réconciliation */}
        <StatCard title="💳 Réconciliation" className="xl:col-span-1">
          <div className="text-3xl font-display font-bold text-ink-900 tabular-nums mb-4">{fmt(totalDay)} F</div>
          <div className="space-y-2">
            {[
              { label: "Wave",         value: waveTotal,   color: "bg-emerald-500/15 text-emerald-700" },
              { label: "Orange Money", value: orangeTotal, color: "bg-orange-100 text-orange-700" },
              { label: "Cash",         value: cashTotal,   color: "bg-cream-200 text-ink-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                <span className="font-mono text-sm font-medium">{fmt(value)} F</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-cream-100 pt-3 max-h-32 overflow-y-auto space-y-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between text-xs text-ink-500">
                <span className="font-mono">{t.id}</span>
                <span>{t.driverName.split(" ")[0]}</span>
                <span className="font-medium text-ink-900">{fmt(t.amount)} F</span>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Parrainage */}
        <StatCard title="🤝 Parrainage livreurs">
          <div className="text-sm text-ink-500 mb-3">{referralPrizes.length} primes à verser · {fmt(referralPrizes.length * 5_000)} F</div>
          <div className="space-y-2">
            {referralPrizes.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-cream-50 rounded-lg px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-ink-900">{p.referrerName}</div>
                  <div className="text-xs text-ink-500">Filleul : {p.refereeName} · 10ᵉ livraison ✓</div>
                </div>
                <button className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                  Verser {fmt(p.prizeAmount)} F
                </button>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Tontine */}
        <StatCard title="🏦 Tontine numérique">
          <div className="mb-3">
            <div className="text-xs text-ink-500">Semaine {tontineWeek} / 52 · Cotisation : 2 000 F/membre</div>
            <div className="mt-2 text-sm">
              <span className="text-ink-500">Bénéficiaire actuel :</span>{" "}
              <strong className="text-ink-900">{tontineBeneficiary}</strong>
            </div>
            <div className="text-sm">
              <span className="text-ink-500">Prochain :</span>{" "}
              <span className="text-ink-700">{tontineNextBeneficiary}</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {tontineMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {m.paid
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <Circle className="w-4 h-4 text-cream-200 shrink-0" />}
                <span className={m.paid ? "text-ink-700" : "text-ink-400"}>{m.name}</span>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Avance sur salaire */}
        <StatCard title="💵 Avances sur salaire" className="md:col-span-2 xl:col-span-2">
          <div className="text-sm text-ink-500 mb-3">
            {advanceRequests.length} demandes · Total : {fmt(advanceRequests.reduce((s, r) => s + r.requestedAmount, 0))} F
          </div>
          <div className="space-y-3">
            {advanceRequests.map(r => (
              <div key={r.id} className="flex items-center gap-4 bg-cream-50 rounded-lg px-4 py-3">
                <div className="flex-1">
                  <div className="font-medium text-ink-900 text-sm">{r.driverName}</div>
                  <div className="text-xs text-ink-500">
                    Gains du jour : {fmt(r.earningsToday)} F · Demande : {fmt(r.requestedAmount)} F · Frais : {fmt(r.fee)} F
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium">Approuver</button>
                  <button className="text-xs bg-cream-200 text-ink-700 px-3 py-1.5 rounded-lg hover:bg-cream-300 transition-colors">Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Assurance */}
        <StatCard title="🛡️ Assurance colis">
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">{insuranceCount}</div>
              <div className="text-xs text-ink-500">assurances actives aujourd'hui</div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Primes collectées</span>
                <span className="font-medium">{fmt(insuranceRevenue)} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Marge nette (82%)</span>
                <span className="font-bold text-emerald-600">{fmt(insuranceMargin)} F</span>
              </div>
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/finance/page.tsx"
git commit -m "feat(admin): finance overview page — réconciliation, tontine, avances, parrainage, assurance"
```

---

## Task 10 — `/admin/analytics` — analytics avancé

**Files:**
- Create: `app/(admin)/admin/analytics/page.tsx`

- [ ] **Créer `app/(admin)/admin/analytics/page.tsx`**

```tsx
"use client";
import dynamic from "next/dynamic";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { hourlyRevenue, zoneActivity, weeklyMerchants, ordersToday, breakEvenTarget, profitableTarget } from "@/lib/mock-data/analytics";

const LeafletMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

function fmt(n: number) { return `${(n / 1000).toFixed(0)}k` }

export default function AnalyticsPage() {
  const breakEvenPct  = Math.min(100, Math.round((ordersToday / breakEvenTarget)  * 100));
  const profitablePct = Math.min(100, Math.round((ordersToday / profitableTarget) * 100));

  const zonePins = zoneActivity.map(z => ({
    id: z.name, lat: z.lat, lng: z.lng, kind: "order" as const,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Analytics avancé</h1>

      {/* Revenus heure/heure */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Revenus heure/heure — 24h</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hourlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#8B7363" }} interval={3} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#8B7363" }} width={40} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} F`, ""]} />
            <Legend />
            <Line type="monotone" dataKey="today"    stroke="#15803D" strokeWidth={2} dot={false} name="Aujourd'hui" />
            <Line type="monotone" dataKey="lastWeek" stroke="#D4A574" strokeWidth={2} dot={false} name="Semaine dernière" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zones Dakar */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Zones actives — Dakar</h2>
          <LeafletMap pins={zonePins} zoom={12} height="240px" />
          <div className="mt-3 grid grid-cols-2 gap-1">
            {zoneActivity.sort((a, b) => b.orders - a.orders).slice(0, 4).map(z => (
              <div key={z.name} className="flex justify-between text-xs text-ink-700 bg-cream-50 px-2 py-1 rounded">
                <span>{z.name}</span>
                <span className="font-bold">{z.orders} cmdes</span>
              </div>
            ))}
          </div>
        </div>

        {/* Métriques point mort */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Métriques business</h2>
          <div className="text-4xl font-display font-bold text-ink-900 tabular-nums mb-1">{ordersToday}</div>
          <div className="text-sm text-ink-500 mb-6">commandes aujourd'hui</div>

          <div className="space-y-4">
            {[
              { label: `Point mort (${breakEvenTarget}/jour)`,     pct: breakEvenPct,  color: "bg-emerald-500" },
              { label: `Rentable (${profitableTarget}/jour)`,      pct: profitablePct, color: "bg-gold-500" },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-700">{label}</span>
                  <span className={`font-bold ${pct >= 100 ? "text-emerald-600" : "text-ink-900"}`}>{pct}%</span>
                </div>
                <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rétention commerçants */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Rétention commerçants — 8 semaines</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyMerchants} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8B7363" }} />
            <YAxis tick={{ fontSize: 11, fill: "#8B7363" }} width={30} />
            <Tooltip />
            <Bar dataKey="active" fill="#15803D" radius={[4, 4, 0, 0]} name="Commerçants actifs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/analytics/page.tsx"
git commit -m "feat(admin): analytics page — revenus horaires, zones Dakar, métriques business"
```

---

## Task 11 — `/admin/surge` — surge pricing

**Files:**
- Create: `app/(admin)/admin/surge/page.tsx`

- [ ] **Créer `app/(admin)/admin/surge/page.tsx`**

```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { useSurgeStore } from "@/lib/store/surge";
import { surgeHistory } from "@/lib/mock-data/surge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function multiplierColor(m: number) {
  if (m < 1.3) return "#15803D";
  if (m < 1.7) return "#C8924C";
  return "#B43A2E";
}

function multiplierBadgeClass(m: number) {
  if (m < 1.3) return "text-emerald-600 bg-emerald-500/10";
  if (m < 1.7) return "text-ink-900 bg-gold-500/20";
  return "text-red-700 bg-red-100";
}

export default function SurgePage() {
  const { multiplier, autoMode, setMultiplier, toggleAutoMode } = useSurgeStore();
  const extraPct = Math.round((multiplier - 1) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Surge Pricing</h1>

      {/* Contrôle */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn("text-5xl font-display font-bold tabular-nums", multiplierBadgeClass(multiplier).split(" ")[0])}>
              ×{multiplier.toFixed(1)}
            </div>
            <div className="text-sm text-ink-500 mt-1">Multiplicateur actuel</div>
          </div>
          <div className={cn("px-4 py-2 rounded-xl text-sm font-medium", multiplierBadgeClass(multiplier))}>
            {extraPct > 0 ? `+${extraPct}% de revenus estimés` : "Tarif normal"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="auto" checked={autoMode} onCheckedChange={toggleAutoMode} />
          <Label htmlFor="auto" className="text-sm font-medium cursor-pointer">
            Mode automatique IA
            {autoMode && <span className="ml-2 text-xs text-ink-500">— Le slider est désactivé, l'IA ajuste automatiquement</span>}
          </Label>
        </div>

        <div>
          <div className="flex justify-between text-xs text-ink-500 mb-2">
            <span>×1.0</span><span>×1.2</span><span>×1.4</span><span>×1.6</span><span>×1.8</span><span>×2.0</span>
          </div>
          <input
            type="range"
            min={10} max={20} step={1}
            value={Math.round(multiplier * 10)}
            onChange={e => setMultiplier(Number(e.target.value) / 10)}
            disabled={autoMode}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed accent-emerald-600"
          />
        </div>

        {!autoMode && (
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Appliquer ×{multiplier.toFixed(1)}
          </Button>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Historique du jour — multiplicateur par heure</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={surgeHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#8B7363" }} interval={2} />
            <YAxis domain={[1, 2]} tickFormatter={v => `×${v}`} tick={{ fontSize: 10, fill: "#8B7363" }} width={36} />
            <Tooltip formatter={(v: number) => [`×${v}`, "Multiplicateur"]} />
            <ReferenceLine y={1} stroke="#E8DFD0" />
            <Bar dataKey="multiplier" radius={[3, 3, 0, 0]}>
              {surgeHistory.map((entry, i) => (
                <Cell key={i} fill={multiplierColor(entry.multiplier)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/surge/page.tsx"
git commit -m "feat(admin): surge pricing page — slider, auto IA, historique barres"
```

---

## Task 12 — `/admin/settings` — paramètres

**Files:**
- Create: `app/(admin)/admin/settings/page.tsx`

- [ ] **Créer `app/(admin)/admin/settings/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
type Prayer = typeof PRAYERS[number];

const FLOOD_ZONES = ["Parcelles Assainies", "Pikine", "Guédiawaye", "Thiaroye", "Yeumbeul"] as const;

const IA_WEIGHTS_DEFAULT = { distance: 40, charge: 30, fiabilite: 30 };

const WA_TEMPLATES_DEFAULT = {
  assigned: "Bonjour {client_name}, votre livreur {driver_name} est en route. Commande {order_id}.",
  pickup:   "Votre livreur {driver_name} arrive au point de collecte. ETA : {eta} min.",
  enroute:  "{driver_name} est en route vers vous. Arrivée estimée : {eta} min.",
  delivered:"Livraison confirmée ! Merci d'avoir utilisé YONNE. Commande {order_id} livrée ✓",
};

export default function SettingsPage() {
  const [iaWeights,   setIaWeights]   = useState(IA_WEIGHTS_DEFAULT);
  const [templates,   setTemplates]   = useState(WA_TEMPLATES_DEFAULT);
  const [hivernage,   setHivernage]   = useState(false);
  const [floodZones,  setFloodZones]  = useState<string[]>([]);
  const [prayers,     setPrayers]     = useState<Record<Prayer, boolean>>({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });

  const weightsSum = iaWeights.distance + iaWeights.charge + iaWeights.fiabilite;

  function save(section: string) { toast.success(`${section} enregistré`); }

  function toggleZone(z: string) {
    setFloodZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>

      {/* Plateforme */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Plateforme</h2>
        {[
          { id: "platform-name",  label: "Nom",               defaultValue: "YONNE" },
          { id: "platform-city",  label: "Ville principale",  defaultValue: "Dakar" },
          { id: "platform-email", label: "Email contact",     defaultValue: "contact@yonne.sn" },
          { id: "platform-phone", label: "Téléphone support", defaultValue: "+221 78 000 00 00" },
        ].map(({ id, label, defaultValue }) => (
          <div key={id} className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} defaultValue={defaultValue} />
          </div>
        ))}
        <Button onClick={() => save("Plateforme")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>

      {/* Algorithme IA */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Algorithme Dispatch IA</h2>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", weightsSum === 100 ? "bg-emerald-500/15 text-emerald-700" : "bg-red-100 text-red-700")}>
            Somme : {weightsSum}%{weightsSum !== 100 && " ≠ 100"}
          </span>
        </div>
        {(["distance", "charge", "fiabilite"] as const).map(key => {
          const labels = { distance: "Distance (cible 40%)", charge: "Charge livreur (cible 30%)", fiabilite: "Fiabilité (cible 30%)" };
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <Label>{labels[key]}</Label>
                <span className="tabular-nums font-medium">{iaWeights[key]}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={iaWeights[key]}
                onChange={e => setIaWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
            </div>
          );
        })}
        <Button onClick={() => save("Algorithme IA")} disabled={weightsSum !== 100} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50">Enregistrer</Button>
      </div>

      {/* Templates WhatsApp */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Templates WhatsApp</h2>
        <p className="text-xs text-ink-500">Variables disponibles : <code className="bg-cream-100 px-1 rounded">{"{client_name}"}</code> <code className="bg-cream-100 px-1 rounded">{"{driver_name}"}</code> <code className="bg-cream-100 px-1 rounded">{"{eta}"}</code> <code className="bg-cream-100 px-1 rounded">{"{order_id}"}</code></p>
        {(["assigned", "pickup", "enroute", "delivered"] as const).map(k => {
          const labels = { assigned: "Commande assignée", pickup: "En route collecte", enroute: "En route client", delivered: "Livraison confirmée" };
          return (
            <div key={k} className="space-y-1">
              <Label>{labels[k]}</Label>
              <textarea
                rows={2}
                value={templates[k]}
                onChange={e => setTemplates(prev => ({ ...prev, [k]: e.target.value }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          );
        })}
        <Button onClick={() => save("Templates WhatsApp")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>

      {/* Mode Hivernage */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Mode Hivernage 🌧️</h2>
          <Switch checked={hivernage} onCheckedChange={setHivernage} />
        </div>
        {hivernage && (
          <>
            <p className="text-sm text-ink-500">Zones inondées — surge météo +20%, prime livreur +500 F/livraison</p>
            <div className="grid grid-cols-2 gap-2">
              {FLOOD_ZONES.map(z => (
                <label key={z} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={floodZones.includes(z)} onChange={() => toggleZone(z)} className="accent-emerald-600" />
                  {z}
                </label>
              ))}
            </div>
            <Button onClick={() => save("Mode Hivernage")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
          </>
        )}
      </div>

      {/* Heures de prière */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Pause heures de prière 🕌</h2>
        <p className="text-sm text-ink-500">Micro-surge ×1.1 activé 10 min avant chaque prière sélectionnée.</p>
        <div className="space-y-3">
          {PRAYERS.map(p => (
            <div key={p} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id={`prayer-${p}`}
                  checked={prayers[p]}
                  onCheckedChange={v => setPrayers(prev => ({ ...prev, [p]: v }))}
                />
                <Label htmlFor={`prayer-${p}`} className="cursor-pointer">{p}</Label>
              </div>
              {prayers[p] && <span className="text-xs text-ink-500 bg-cream-100 px-2 py-1 rounded">Pause + ×1.1 avant</span>}
            </div>
          ))}
        </div>
        <Button onClick={() => save("Heures de prière")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

- [ ] **Commit**

```bash
git add "app/(admin)/admin/settings/page.tsx"
git commit -m "feat(admin): settings page — plateforme, IA dispatch, WhatsApp, hivernage, prières"
```

---

## Task 13 — Build final + tag

**Files:** aucun nouveau fichier

- [ ] **Build complet et vérification des routes**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "error|✓ Compiled|/admin"
```

Attendu : `✓ Compiled successfully` et les routes `/admin/commandes`, `/admin/livreurs`, `/admin/marchands`, `/admin/finance`, `/admin/analytics`, `/admin/surge`, `/admin/settings` présentes.

- [ ] **Tag v0.4.0**

```bash
git tag v0.4.0-tranche-D
git log --oneline -10
```

---

## Self-Review — Couverture spec

| Spec requirement | Task |
|---|---|
| Tableau plein écran + export CSV | Task 4 (commandes), composant DataTable Task 2 |
| Page détail commande : carte + timeline + infos | Task 5 |
| Livreurs : score IA décomposé, badges, gains semaine | Task 7 |
| Marchands : QR code, CA, plan, upgrade Premium | Task 8 |
| Finance : réconciliation Wave/OM/Cash | Task 9 |
| Finance : parrainage 5 000 F | Task 9 |
| Finance : tontine 2 000 F/semaine | Task 9 |
| Finance : avance salaire 80% + frais 2% | Task 9 |
| Finance : assurance colis 200 F marge 82% | Task 9 |
| Analytics : revenus heure/heure | Task 10 |
| Analytics : zones Dakar (Leaflet) | Task 10 |
| Analytics : point mort + rentabilité | Task 10 |
| Analytics : rétention commerçants | Task 10 |
| Surge : slider x1.0→x2.0 + toggle auto IA | Task 11 |
| Surge : historique barre 24h | Task 11 |
| Settings : algorithme dispatch IA (poids) | Task 12 |
| Settings : templates WhatsApp | Task 12 |
| Settings : mode Hivernage + zones | Task 12 |
| Settings : pause heures de prière + micro-surge | Task 12 |
