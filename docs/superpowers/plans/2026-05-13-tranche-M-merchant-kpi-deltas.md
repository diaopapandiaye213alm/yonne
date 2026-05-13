# Tranche M — KPI Deltas Dashboard Marchand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher un badge delta `↑ +8% vs mois passé` (vert) ou `↓ -3% vs mois passé` (rouge) sous chaque KPI du dashboard marchand.

**Architecture:** Deux champs `ordersLastMonth` et `revenueLastMonth` ajoutés à l'interface `Merchant` et au mock data. Le dashboard calcule les deltas et les affiche via un composant `Delta` inline. Le taux livré utilise une dérivation déterministe basée sur les données existantes.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/mock-data/merchants.ts` | Modifier — ajouter `ordersLastMonth` et `revenueLastMonth` à l'interface + mock |
| `app/(merchant)/merchant/page.tsx` | Modifier — composant `Delta` + calculs + KPI cards avec delta |

---

## Task 1 : Étendre le mock merchants

**Files:**
- Modify: `lib/mock-data/merchants.ts`

Contenu actuel complet (pour référence) :
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
  email: `contact${i + 1}@${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "")}.sn`,
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

- [ ] **Step 1 : Remplacer `lib/mock-data/merchants.ts`**

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
  ordersLastMonth: number;
  revenueLastMonth: number;
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
  email: `contact${i + 1}@${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "")}.sn`,
  phone: `+221 77 ${String(Math.floor(r(i + 1, 100, 999)))} ${String(Math.floor(r(i + 2, 1000, 9999)))}`,
  city: cities[Math.floor(r(i + 3, 0, cities.length))],
  plan: plans[Math.floor(r(i + 5, 0, plans.length))],
  status: i < 8 ? "actif" : "suspendu",
  ordersThisMonth:  Math.floor(r(i + 7,  40,       400)),
  revenueThisMonth: Math.floor(r(i + 9,  200_000,  2_000_000) / 1000) * 1000,
  ordersLastMonth:  Math.floor(r(i + 15, 30,       380)),
  revenueLastMonth: Math.floor(r(i + 17, 150_000,  1_800_000) / 1000) * 1000,
  joinedAt: new Date(2025, Math.floor(r(i + 11, 0, 12)), Math.floor(r(i + 13, 1, 28)) + 1)
    .toISOString().split("T")[0],
}));
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add lib/mock-data/merchants.ts && git commit -m "feat(merchants): ajouter ordersLastMonth + revenueLastMonth au mock"
```

---

## Task 2 : Mettre à jour le dashboard marchand + build + tag

**Files:**
- Modify: `app/(merchant)/merchant/page.tsx`

Contenu actuel (pour référence) :
```tsx
import Link from "next/link";
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { Package, TrendingUp, CheckCircle2, PlusSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export const dynamic = "force-dynamic";

export default function MerchantAccueilPage() {
  const merchant  = merchants[0];
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = Math.round(delivered / orders.length * 100);
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Bonjour, {merchant.name}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Commandes ce mois", value: String(merchant.ordersThisMonth), icon: Package },
          { label: "Revenus ce mois",   value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp },
          { label: "Taux livré",        value: `${tauxLivre}%`, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <Link
        href="/merchant/nouvelle-commande"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-3 px-6 font-display font-bold transition-colors"
      >
        <PlusSquare className="w-4 h-4" />
        Nouvelle commande
      </Link>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">Dernières commandes</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {recent.map(o => (
            <Link
              key={o.id}
              href={`/merchant/commande/${o.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-cream-50 transition-colors"
            >
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-sm text-ink-700">{o.clientName}</span>
              <span className="text-sm font-medium tabular-nums">{o.amount.toLocaleString("fr-FR")} F</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer `app/(merchant)/merchant/page.tsx`**

```tsx
import Link from "next/link";
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { Package, TrendingUp, CheckCircle2, PlusSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export const dynamic = "force-dynamic";

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? "↑" : "↓"} {up ? "+" : ""}{pct}% vs mois passé
    </span>
  );
}

export default function MerchantAccueilPage() {
  const merchant  = merchants[0];
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = Math.round(delivered / orders.length * 100);
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const deltaOrders  = Math.round((merchant.ordersThisMonth  - merchant.ordersLastMonth)  / merchant.ordersLastMonth  * 100);
  const deltaRevenue = Math.round((merchant.revenueThisMonth - merchant.revenueLastMonth) / merchant.revenueLastMonth * 100);
  const tauxLivreLastMonth = Math.round(tauxLivre * (0.92 + (merchant.ordersLastMonth % 10) / 100));
  const deltaTaux = tauxLivre - tauxLivreLastMonth;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Bonjour, {merchant.name}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Commandes ce mois", value: String(merchant.ordersThisMonth),                     icon: Package,      delta: deltaOrders  },
          { label: "Revenus ce mois",   value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp,   delta: deltaRevenue },
          { label: "Taux livré",        value: `${tauxLivre}%`,                                       icon: CheckCircle2, delta: deltaTaux    },
        ].map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
            <div className="mt-1"><Delta pct={delta} /></div>
          </div>
        ))}
      </div>

      <Link
        href="/merchant/nouvelle-commande"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-3 px-6 font-display font-bold transition-colors"
      >
        <PlusSquare className="w-4 h-4" />
        Nouvelle commande
      </Link>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">Dernières commandes</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {recent.map(o => (
            <Link
              key={o.id}
              href={`/merchant/commande/${o.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-cream-50 transition-colors"
            >
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-sm text-ink-700">{o.clientName}</span>
              <span className="text-sm font-medium tabular-nums">{o.amount.toLocaleString("fr-FR")} F</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur.

- [ ] **Step 4 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(merchant)/merchant/page.tsx" && git commit -m "feat(dashboard): KPI deltas vs mois passé sur le dashboard marchand" && git tag v1.3.0-tranche-M
```
