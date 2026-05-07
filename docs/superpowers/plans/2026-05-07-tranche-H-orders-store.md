# Tranche H — Zustand Orders Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le tableau statique `orders` par un store Zustand partagé pour que les commandes créées par le marchand apparaissent en temps réel dans les vues admin et marchand.

**Architecture:** Un store Zustand `useOrdersStore` initialisé avec les 147 commandes mock existantes expose `addOrder` et `updateStatus`. Le wizard marchand appelle `addOrder` à la confirmation du dispatch. Les pages admin/commandes et merchant/commandes lisent le store au lieu du tableau statique. La page admin/commandes/[id] devient un Client Component avec un bouton de progression de statut.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Zustand (déjà installé — `useDriverStore` et `useWizardStore` l'utilisent).

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/store/orders.ts` | Créer |
| `components/wizard/DispatchStep.tsx` | Modifier |
| `app/(admin)/admin/commandes/page.tsx` | Modifier |
| `app/(admin)/admin/commandes/[id]/page.tsx` | Modifier (→ Client Component) |
| `app/(merchant)/merchant/commandes/page.tsx` | Modifier |

## Contexte codebase à lire avant de commencer

- `lib/mock-data/orders.ts` — `Order`, `OrderStatus`, `PaymentMethod`, tableau `orders`
- `lib/store/driver.ts` — exemple du pattern Zustand déjà utilisé dans le projet
- `lib/store/wizard.ts` — `useWizard()` utilisé dans DispatchStep

---

## Task 1 : Créer `lib/store/orders.ts`

**Files:**
- Create: `lib/store/orders.ts`

- [ ] **Step 1 : Vérifier que le fichier n'existe pas**

```bash
ls /home/papa-ndiaye-diao/yonne/lib/store/orders.ts 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer `lib/store/orders.ts`**

```ts
import { create } from "zustand";
import { orders as seedOrders } from "@/lib/mock-data/orders";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [...seedOrders],
  addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
  updateStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add lib/store/orders.ts
git commit -m "feat(store): useOrdersStore — addOrder + updateStatus, initialisé avec mock data"
```

---

## Task 2 : Modifier `components/wizard/DispatchStep.tsx`

**Files:**
- Modify: `components/wizard/DispatchStep.tsx`

Contenu actuel du fichier (pour référence) :

```tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWizard } from "@/lib/store/wizard";
import { drivers, avatarUrl, type Driver } from "@/lib/mock-data/drivers";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";

export function DispatchStep() {
  const w = useWizard();
  const router = useRouter();
  const [phase, setPhase] = useState<"dispatching" | "assigned">("dispatching");
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const candidate = [...drivers].filter(d => d.online && !d.inPrayer).sort((a, b) => b.scoreIA - a.scoreIA)[0];
      setAssignedDriver(candidate);
      setPhase("assigned");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "dispatching" || !assignedDriver) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="font-display text-lg text-ink-900">IA dispatch en cours…</div>
        <div className="text-sm text-ink-500">Recherche du livreur optimal · score Haversine composite</div>
      </div>
    );
  }

  const orderId = `YN-2026-${String(20000 + Math.floor(Math.random() * 9999))}`;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-xs uppercase tracking-wider text-emerald-500 font-medium">Livreur assigné</div>
        <div className="mt-3 flex items-center gap-4">
          <Image src={avatarUrl(assignedDriver)} alt={assignedDriver.name} width={56} height={56} unoptimized className="rounded-full bg-cream-100" />
          <div className="flex-1">
            <div className="font-display font-bold text-ink-900 text-lg">{assignedDriver.name}</div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Star className="w-3 h-3 text-gold-500 fill-gold-500" /> {assignedDriver.rating.toFixed(1)} · {assignedDriver.vehicle}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-cream-200">
          <Stat label="Distance" value="2,3 km" />
          <Stat label="ETA" value="18 min" />
          <Stat label="Score IA" value={`${assignedDriver.scoreIA}`} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow"
        onClick={() => { w.reset(); router.push(`/merchant/commande/${orderId}`); }}
      >
        Voir le suivi
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-ink-900 tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
```

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat /home/papa-ndiaye-diao/yonne/components/wizard/DispatchStep.tsx
```

- [ ] **Step 2 : Remplacer le contenu complet par la version ci-dessous**

```tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWizard } from "@/lib/store/wizard";
import { useOrdersStore } from "@/lib/store/orders";
import { drivers, avatarUrl, type Driver } from "@/lib/mock-data/drivers";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";

export function DispatchStep() {
  const w = useWizard();
  const router = useRouter();
  const { addOrder } = useOrdersStore();
  const [phase, setPhase] = useState<"dispatching" | "assigned">("dispatching");
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [orderId] = useState(
    () => `YN-2026-${String(20000 + Math.floor(Math.random() * 9999))}`
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const candidate = [...drivers].filter(d => d.online && !d.inPrayer).sort((a, b) => b.scoreIA - a.scoreIA)[0];
      setAssignedDriver(candidate);
      setPhase("assigned");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "dispatching" || !assignedDriver) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="font-display text-lg text-ink-900">IA dispatch en cours…</div>
        <div className="text-sm text-ink-500">Recherche du livreur optimal · score Haversine composite</div>
      </div>
    );
  }

  function handleConfirm() {
    addOrder({
      id: orderId,
      driverId: assignedDriver!.id,
      landmarkId: w.landmarkId ?? "",
      clientName: w.clientName,
      clientPhone: w.clientPhone,
      amount: w.amount,
      paymentMethod: w.paymentMethod!,
      insurance: w.insurance,
      status: "assignée",
      createdAt: new Date().toISOString(),
      active: true,
    });
    w.reset();
    router.push(`/merchant/commande/${orderId}`);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-xs uppercase tracking-wider text-emerald-500 font-medium">Livreur assigné</div>
        <div className="mt-3 flex items-center gap-4">
          <Image src={avatarUrl(assignedDriver)} alt={assignedDriver.name} width={56} height={56} unoptimized className="rounded-full bg-cream-100" />
          <div className="flex-1">
            <div className="font-display font-bold text-ink-900 text-lg">{assignedDriver.name}</div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Star className="w-3 h-3 text-gold-500 fill-gold-500" /> {assignedDriver.rating.toFixed(1)} · {assignedDriver.vehicle}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-cream-200">
          <Stat label="Distance" value="2,3 km" />
          <Stat label="ETA" value="18 min" />
          <Stat label="Score IA" value={`${assignedDriver.scoreIA}`} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow"
        onClick={handleConfirm}
      >
        Voir le suivi
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-ink-900 tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
```

Différences clés :
- Import `useOrdersStore` ajouté
- `orderId` déplacé dans un `useState` avec initialiseur pour éviter qu'il change entre renders
- `handleConfirm()` extrait de l'inline onClick — appelle `addOrder` puis `w.reset()` puis `router.push`

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add components/wizard/DispatchStep.tsx
git commit -m "feat(store): DispatchStep — addOrder au store à la confirmation"
```

---

## Task 3 : Modifier `app/(admin)/admin/commandes/page.tsx`

**Files:**
- Modify: `app/(admin)/admin/commandes/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat "/home/papa-ndiaye-diao/yonne/app/(admin)/admin/commandes/page.tsx"
```

- [ ] **Step 2 : Remplacer le contenu complet**

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
```

Différences clés vs l'original :
- `import { orders } from "@/lib/mock-data/orders"` → `const { orders } = useOrdersStore()`
- Import `useOrdersStore` ajouté
- `orders` ajouté dans les dépendances du `useMemo`

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add "app/(admin)/admin/commandes/page.tsx"
git commit -m "feat(store): admin commandes — lit useOrdersStore au lieu du tableau statique"
```

---

## Task 4 : Modifier `app/(admin)/admin/commandes/[id]/page.tsx`

**Files:**
- Modify: `app/(admin)/admin/commandes/[id]/page.tsx`

Contenu actuel pour référence — c'est un Server Component qui importe `notFound` et lit `orders` directement.

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat "/home/papa-ndiaye-diao/yonne/app/(admin)/admin/commandes/[id]/page.tsx"
```

- [ ] **Step 2 : Remplacer le contenu complet**

```tsx
"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useOrdersStore } from "@/lib/store/orders";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { ArrowLeft } from "lucide-react";
import type { OrderStatus } from "@/lib/mock-data/orders";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-cream-100 animate-pulse rounded-lg" />,
});

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

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  "créée":    "assignée",
  "assignée": "collecte",
  "collecte": "en route",
  "en route": "livrée",
  "livrée":   null,
};

export default function CommandeDetailPage({ params }: { params: { id: string } }) {
  const { orders, updateStatus } = useOrdersStore();
  const order = orders.find(o => o.id === params.id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-ink-500">Commande introuvable.</p>
        <Link href="/admin/commandes" className="mt-4 inline-block text-emerald-500 hover:underline text-sm">
          ← Retour aux commandes
        </Link>
      </div>
    );
  }

  const driver   = drivers.find(d => d.id === order.driverId);
  const landmark = landmarks.find(l => l.id === order.landmarkId);
  const DAKAR: [number, number] = [14.6928, -17.4467];
  const center: [number, number] = landmark ? [landmark.lat, landmark.lng] : DAKAR;

  const pins = landmark
    ? [{ id: "dest", lat: landmark.lat, lng: landmark.lng, kind: "dest" as const }]
    : [];

  const next = NEXT_STATUS[order.status];

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
        <div className="md:col-span-2 bg-white rounded-lg overflow-hidden">
          <DakarMap pins={pins} center={center} zoom={14} height="300px" />
        </div>
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Suivi</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[order.status] ?? "created"} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {next ? (
          <button
            onClick={() => updateStatus(order.id, next)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-display font-bold transition-colors"
          >
            Passer à : <span className="capitalize">{next}</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-medium">
            ✓ Commande livrée
          </div>
        )}
      </div>
    </div>
  );
}
```

Différences clés vs l'original :
- `"use client"` ajouté
- `notFound` supprimé → fallback JSX à la place
- `orders.find(...)` → `useOrdersStore()` + `orders.find(...)`
- `NEXT_STATUS` record ajouté
- Bouton "Passer à : [next]" ajouté en bas

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add "app/(admin)/admin/commandes/[id]/page.tsx"
git commit -m "feat(store): admin commandes/[id] — client component + bouton updateStatus"
```

---

## Task 5 : Modifier `app/(merchant)/merchant/commandes/page.tsx`

**Files:**
- Modify: `app/(merchant)/merchant/commandes/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat "/home/papa-ndiaye-diao/yonne/app/(merchant)/merchant/commandes/page.tsx"
```

- [ ] **Step 2 : Remplacer le contenu complet**

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
  const router = useRouter();
  const { orders } = useOrdersStore();
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
      />
    </div>
  );
}
```

Différences clés vs l'original :
- `import { orders } from "@/lib/mock-data/orders"` → `const { orders } = useOrdersStore()`
- Import `useOrdersStore` ajouté
- `orders` ajouté dans les dépendances du `useMemo`

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Build de production**

```bash
pnpm run build 2>&1 | tail -20
```

Expected : build réussi.

- [ ] **Step 5 : Commit + tag**

```bash
git add "app/(merchant)/merchant/commandes/page.tsx"
git commit -m "feat(store): merchant commandes — lit useOrdersStore au lieu du tableau statique"
git tag v0.8.0-tranche-H
```
