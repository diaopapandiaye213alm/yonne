# Tranche E — App Marchand : 4 Pages Complètes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les 4 pages manquantes de l'app marchand (Accueil, Mes commandes, Finances, Paramètres) pour éliminer les 404 référencés dans `MerchantSidebar`.

**Architecture:** Server Components pour les pages statiques (Accueil, Finances), Client Components pour les pages interactives (Mes commandes, Paramètres). Zéro nouveau composant partagé ni nouveau store — réutilisation de `DataTable`, `FilterBar`, `downloadCsv` depuis l'admin.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS (tokens `cream-*`, `ink-*`, `gold-500`, `emerald-500`), lucide-react, shadcn/ui (`Input`, `Button`, `Label`, `Switch`).

---

## Fichiers

| Fichier | Action | Notes |
|---------|--------|-------|
| `app/(merchant)/merchant/page.tsx` | **Modifier** | Remplace le `redirect()` par le vrai dashboard |
| `app/(merchant)/merchant/commandes/page.tsx` | **Créer** | Nouveau dossier `commandes/` |
| `app/(merchant)/merchant/finances/page.tsx` | **Créer** | Nouveau dossier `finances/` |
| `app/(merchant)/merchant/parametres/page.tsx` | **Créer** | Nouveau dossier `parametres/` |

Aucune modification du layout, de la sidebar, des mock data ou des composants partagés.

---

## Contexte codebase à lire avant de commencer

- `app/(merchant)/merchant/layout.tsx` — layout avec `MerchantSidebar` + `Topbar`
- `components/layout/MerchantSidebar.tsx` — sidebar avec les 5 liens nav (dont les 4 manquants)
- `components/admin/DataTable.tsx` — `DataTable<T extends object>`, `Column<T>` interface
- `components/admin/FilterBar.tsx` — `FilterBar`, `FilterDef` interface
- `lib/utils/csv.ts` — `downloadCsv(filename, rows)`
- `lib/mock-data/merchants.ts` — `Merchant`, `MerchantPlan`, `merchants` array
- `lib/mock-data/orders.ts` — `Order`, `OrderStatus`, `PaymentMethod`, `orders` array

---

## Task 1: Page Accueil (dashboard marchand)

**Files:**
- Modify: `app/(merchant)/merchant/page.tsx`

- [ ] **Step 1 : Vérifier que la page actuelle est juste un redirect**

```bash
cat app/\(merchant\)/merchant/page.tsx
```

Expected output :
```
import { redirect } from "next/navigation";
export default function MerchantIndex() { redirect("/merchant/nouvelle-commande"); }
```

- [ ] **Step 2 : Remplacer le fichier par le dashboard**

Écrire le contenu suivant dans `app/(merchant)/merchant/page.tsx` :

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

export default function MerchantAccueilPage() {
  const merchant  = merchants[0];
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = Math.round(delivered / orders.length * 100);
  const recent    = orders.slice(0, 5);

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

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur (ou uniquement des erreurs dans d'autres fichiers déjà présentes).

- [ ] **Step 4 : Commit**

```bash
git add app/\(merchant\)/merchant/page.tsx
git commit -m "feat(merchant): page Accueil — KPI cards + dernières commandes"
```

---

## Task 2: Page Mes commandes

**Files:**
- Create: `app/(merchant)/merchant/commandes/page.tsx`

- [ ] **Step 1 : Vérifier que le dossier n'existe pas encore**

```bash
ls app/\(merchant\)/merchant/commandes/ 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire dans `app/(merchant)/merchant/commandes/page.tsx` :

```tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { orders } from "@/lib/mock-data/orders";
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
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const q           = search.toLowerCase();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
      const matchStatus = !filters.status || o.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [search, filters]);

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

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add app/\(merchant\)/merchant/commandes/page.tsx
git commit -m "feat(merchant): page Mes commandes — DataTable filtrable + export CSV"
```

---

## Task 3: Page Finances

**Files:**
- Create: `app/(merchant)/merchant/finances/page.tsx`

- [ ] **Step 1 : Vérifier que le dossier n'existe pas encore**

```bash
ls app/\(merchant\)/merchant/finances/ 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire dans `app/(merchant)/merchant/finances/page.tsx` :

```tsx
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { TrendingUp, Percent, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/lib/mock-data/orders";

export default function FinancesPage() {
  const merchant       = merchants[0];
  const commissionRate = merchant.plan === "Premium" ? 0.15 : 0.12;
  const revenuBrut     = merchant.revenueThisMonth;
  const commission     = Math.round(revenuBrut * commissionRate);
  const net            = revenuBrut - commission;
  const total          = orders.length;

  const byMethod = (method: PaymentMethod) =>
    orders.filter(o => o.paymentMethod === method).length;
  const wavePct   = Math.round(byMethod("wave")   / total * 100);
  const orangePct = Math.round(byMethod("orange") / total * 100);
  const cashPct   = Math.round(byMethod("cash")   / total * 100);

  const transactions = orders.slice(0, 10);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Finances</h1>
        <p className="text-sm text-ink-500 mt-1">
          Plan {merchant.plan} · Commission {commissionRate * 100}%
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Revenu brut ce mois",              value: `${revenuBrut.toLocaleString("fr-FR")} F`,   icon: TrendingUp },
          { label: `Commission YONNE (${commissionRate * 100}%)`, value: `${commission.toLocaleString("fr-FR")} F`, icon: Percent },
          { label: "Net marchand",                     value: `${net.toLocaleString("fr-FR")} F`,           icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Répartition par paiement</h2>
        <div className="space-y-2">
          {[
            { label: "Wave",         pct: wavePct,   color: "bg-blue-100 text-blue-700" },
            { label: "Orange Money", pct: orangePct, color: "bg-orange-100 text-orange-700" },
            { label: "Cash",         pct: cashPct,   color: "bg-gray-100 text-gray-700" },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-sm text-ink-700">{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">10 dernières transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 border-b border-cream-200">
              <tr>
                {["ID", "Date", "Montant", "Commission", "Net"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((o, i) => {
                const comm = Math.round(o.amount * commissionRate);
                return (
                  <tr key={o.id} className={`border-t border-cream-100 ${i % 2 !== 0 ? "bg-cream-50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-500 whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">{o.amount.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap text-red-600">-{comm.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap font-medium">{(o.amount - comm).toLocaleString("fr-FR")} F</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add app/\(merchant\)/merchant/finances/page.tsx
git commit -m "feat(merchant): page Finances — KPI cards + répartition paiements + transactions"
```

---

## Task 4: Page Paramètres

**Files:**
- Create: `app/(merchant)/merchant/parametres/page.tsx`

- [ ] **Step 1 : Vérifier que le dossier n'existe pas encore**

```bash
ls app/\(merchant\)/merchant/parametres/ 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire dans `app/(merchant)/merchant/parametres/page.tsx` :

```tsx
"use client";
import { useState } from "react";
import { merchants } from "@/lib/mock-data/merchants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ParametresPage() {
  const merchant = merchants[0];

  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);
  const [city,  setCity]  = useState(merchant.city);

  const [whatsapp,   setWhatsapp]   = useState(true);
  const [sms,        setSms]        = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>
        <p className="text-sm text-ink-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil boutique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Profil boutique</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Nom boutique</Label>
            <Input id="name" value={merchant.name} disabled className="bg-cream-50 opacity-60" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
          </div>
        </div>
        <Button
          onClick={() => alert("Paramètres enregistrés")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>

      {/* Mon plan */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Mon plan</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
            merchant.plan === "Premium"
              ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
              : "bg-cream-100 border-cream-200 text-ink-700"
          }`}>
            {merchant.plan}
          </span>
        </div>
        <ul className="text-sm text-ink-700 space-y-1">
          {merchant.plan === "Premium" ? (
            <>
              <li>✓ Commandes illimitées</li>
              <li>✓ Commission 15%</li>
              <li>✓ Support prioritaire</li>
              <li>✓ Analytics avancés</li>
            </>
          ) : (
            <>
              <li>✓ Jusqu&apos;à 200 commandes/mois</li>
              <li>✓ Commission 12%</li>
              <li>✓ Support email</li>
            </>
          )}
        </ul>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          {[
            { id: "wa",    label: "WhatsApp", checked: whatsapp,   onCheckedChange: setWhatsapp },
            { id: "sms",   label: "SMS",       checked: sms,        onCheckedChange: setSms },
            { id: "email", label: "Email",     checked: emailNotif, onCheckedChange: setEmailNotif },
          ].map(({ id, label, checked, onCheckedChange }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-sm text-ink-700 cursor-pointer">{label}</Label>
              <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add app/\(merchant\)/merchant/parametres/page.tsx
git commit -m "feat(merchant): page Paramètres — profil, plan, notifications"
```

---

## Task 5: Build final et tag

**Files:** aucun nouveau fichier

- [ ] **Step 1 : Build de production pour valider tout le projet**

```bash
npm run build 2>&1 | tail -30
```

Expected :
```
✓ Compiled successfully
Route (app)                              Size    First Load JS
...
/merchant                                ...
/merchant/commandes                      ...
/merchant/finances                       ...
/merchant/parametres                     ...
```

Si erreurs TypeScript ou lint : corriger avant de continuer.

- [ ] **Step 2 : Poser le tag git**

```bash
git tag v0.5.0-tranche-E
```

- [ ] **Step 3 : Vérifier les 4 pages dans le navigateur**

Dev server déjà lancé sur `http://localhost:3002` (ou relancer avec `npm run dev -- --port 3002`).

Checklist visuelle :
- `http://localhost:3002/merchant` → 3 KPI cards + bouton vert + liste 5 commandes (non vide)
- `http://localhost:3002/merchant/commandes` → table 147 commandes + filtre statut + bouton CSV
- `http://localhost:3002/merchant/finances` → 3 cards (revenu/commission/net) + répartition + 10 transactions
- `http://localhost:3002/merchant/parametres` → 3 sections (profil/plan/notifications) + switches actifs

Aucune page ne doit afficher 404.
