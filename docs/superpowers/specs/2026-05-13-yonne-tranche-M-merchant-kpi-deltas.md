# Tranche M — KPI Deltas Dashboard Marchand

## Contexte

Le dashboard marchand (`/merchant`) affiche 3 KPI cards sans comparaison temporelle :
- Commandes ce mois
- Revenus ce mois
- Taux livré

Les valeurs sont affichées sans contexte — le marchand ne sait pas si c'est en hausse ou en baisse.

## Objectif

Afficher un badge delta sous chaque valeur : `↑ +8% vs mois passé` (vert) ou `↓ -3% vs mois passé` (rouge).

## Architecture

Deux fichiers modifiés :

```
lib/mock-data/merchants.ts          ← Ajouter ordersLastMonth + revenueLastMonth
app/(merchant)/merchant/page.tsx    ← Calculer deltas + composant Delta inline
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/mock-data/merchants.ts` | Modifier — ajouter `ordersLastMonth` et `revenueLastMonth` |
| `app/(merchant)/merchant/page.tsx` | Modifier — calculer deltas + afficher badge Delta |

---

## `lib/mock-data/merchants.ts`

### Changements à l'interface

```ts
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
  ordersLastMonth: number;     // nouveau
  revenueLastMonth: number;    // nouveau
  joinedAt: string;
}
```

### Génération mock

Dans le `.map()` existant, ajouter les deux champs générés avec `r()` :

```ts
ordersLastMonth:  Math.floor(r(i + 15, 30, 380)),
revenueLastMonth: Math.floor(r(i + 17, 150_000, 1_800_000) / 1000) * 1000,
```

Les seeds `i + 15` et `i + 17` sont différents des seeds existants pour éviter les doublons.

---

## `app/(merchant)/merchant/page.tsx`

### Composant Delta

Ajouter ce composant inline (avant `MerchantAccueilPage`) :

```tsx
function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? "↑" : "↓"} {up ? "+" : ""}{pct}% vs mois passé
    </span>
  );
}
```

### Calcul des deltas dans `MerchantAccueilPage`

```tsx
const deltaOrders  = Math.round((merchant.ordersThisMonth  - merchant.ordersLastMonth)  / merchant.ordersLastMonth  * 100);
const deltaRevenue = Math.round((merchant.revenueThisMonth - merchant.revenueLastMonth) / merchant.revenueLastMonth * 100);
const tauxLivreLastMonth = Math.round(tauxLivre * (0.92 + (merchant.ordersLastMonth % 10) / 100));
const deltaTaux = tauxLivre - tauxLivreLastMonth;
```

### Mise à jour des KPI cards

Remplacer le tableau des KPIs pour inclure les deltas :

```tsx
{[
  { label: "Commandes ce mois", value: String(merchant.ordersThisMonth), icon: Package,      delta: deltaOrders  },
  { label: "Revenus ce mois",   value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp, delta: deltaRevenue },
  { label: "Taux livré",        value: `${tauxLivre}%`, icon: CheckCircle2,                 delta: deltaTaux    },
].map(({ label, value, icon: Icon, delta }) => (
  <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
    <Icon className="w-4 h-4 text-ink-500 mb-2" />
    <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
    <div className="text-xs text-ink-500 mt-0.5">{label}</div>
    <div className="mt-1"><Delta pct={delta} /></div>
  </div>
))}
```

---

## Non-objectifs (hors scope)

- Pas de graphique sparkline
- Pas de tooltip avec les valeurs absolues du mois passé
- Pas de sélecteur de période
- Pas de modification de la page admin
