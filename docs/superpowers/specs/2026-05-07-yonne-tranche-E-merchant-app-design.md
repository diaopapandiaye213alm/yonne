# Tranche E — App Marchand : 4 Pages Complètes

## Contexte

L'app marchand (`app/(merchant)/merchant/`) dispose déjà d'un wizard "Nouvelle commande" (3 étapes) et d'une page de tracking en temps réel. Le `MerchantSidebar` référence 4 pages manquantes qui mènent actuellement à des 404 :

- `/merchant` (Accueil — redirige vers `nouvelle-commande` au lieu d'un vrai dashboard)
- `/merchant/commandes` (Mes commandes)
- `/merchant/finances` (Finances)
- `/merchant/parametres` (Paramètres)

Cette tranche implémente ces 4 pages en suivant l'approche A : Server Components pour les pages statiques, Client Components pour les pages interactives — même pattern que les pages admin existantes.

## Données mock utilisées

- **Marchand courant** : `merchants[0]` (Boutique Fatou Textile) — correspond au compte démo `boutique.plateau@gmail.com`
- **Commandes** : `orders` (global) — l'interface `Order` n'a pas de `merchantId`, donc on utilise toutes les orders (même stratégie que `/admin/marchands/[id]/page.tsx` qui fait `orders.slice(0, 5)`)
- **Types disponibles** : `Order`, `OrderStatus`, `PaymentMethod` depuis `@/lib/mock-data/orders`; `Merchant`, `MerchantPlan` depuis `@/lib/mock-data/merchants`

## Composants réutilisés (ne pas recréer)

- `DataTable<T extends object>` de `@/components/admin/DataTable`
- `FilterBar` de `@/components/admin/FilterBar`
- `downloadCsv` de `@/lib/utils/csv`
- `Progress` de `@/components/ui/progress`
- `Switch`, `Label`, `Input`, `Button` de `@/components/ui/`
- Tokens Tailwind : `cream-50/100/200`, `ink-900/700/500`, `gold-500`, `emerald-500`, `shadow-card`

---

## Page 1 — Accueil (`app/(merchant)/merchant/page.tsx`)

**Type** : Server Component (remplace le redirect actuel)

### Contenu

**KPI Cards (3)** — layout `grid grid-cols-3 gap-4`

| Card | Valeur | Icône |
|------|--------|-------|
| Commandes ce mois | `merchant.ordersThisMonth` | `Package` |
| Revenus ce mois | `merchant.revenueThisMonth.toLocaleString("fr-FR") + " F"` | `TrendingUp` |
| Taux livré | `Math.round(orders.filter(o => o.status === "livrée").length / orders.length * 100) + "%"` | `CheckCircle2` |

**Bouton CTA** — centré, lien vers `/merchant/nouvelle-commande`
```
bg-emerald-500 text-white rounded-lg py-3 px-6 font-display font-bold
"+ Nouvelle commande"
```

**Dernières commandes** — liste des 5 premières orders (`orders.slice(0, 5)`)
- Chaque ligne : `<Link href="/merchant/commande/[o.id]">` avec ID (mono vert), nom client, montant, badge statut

---

## Page 2 — Mes commandes (`app/(merchant)/merchant/commandes/page.tsx`)

**Type** : Client Component (`"use client"`)

### Comportement

- `useState` pour `search` et `filters`
- `useMemo` pour filtrer les orders
- `useRouter` pour `router.push("/merchant/commande/[id]")` au clic sur une ligne

### DataTable colonnes

| Clé | Label | Render |
|-----|-------|--------|
| `id` | ID | `<span className="font-mono text-xs text-emerald-500">{o.id}</span>` |
| `clientName` | Client | — |
| `status` | Statut | badge coloré `STATUS_COLORS[o.status]` |
| `paymentMethod` | Paiement | — |
| `amount` | Montant | `${o.amount.toLocaleString("fr-FR")} F` |
| `createdAt` | Date | `toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })` |

### FilterBar

- 1 filtre : Statut (Tous / Créée / Assignée / Collecte / En route / Livrée)
- Export CSV via `downloadCsv("commandes-marchand.csv", filtered.map(...))`

### STATUS_COLORS (identique à la page admin)

```ts
const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};
```

---

## Page 3 — Finances (`app/(merchant)/merchant/finances/page.tsx`)

**Type** : Server Component

### Contenu

**KPI Cards (3)** — `grid grid-cols-3 gap-4`

```
commissionRate = merchant.plan === "Premium" ? 0.15 : 0.12
revenuBrut     = merchant.revenueThisMonth
commission     = Math.round(revenuBrut * commissionRate)
net            = revenuBrut - commission
```

| Card | Valeur | Icône |
|------|--------|-------|
| Revenu brut ce mois | `revenuBrut.toLocaleString("fr-FR") + " F"` | `TrendingUp` |
| Commission YONNE | `commission.toLocaleString("fr-FR") + " F"` + sous-titre `"Taux ${commissionRate*100}%"` | `Percent` |
| Net marchand | `net.toLocaleString("fr-FR") + " F"` | `Wallet` |

**Répartition par paiement** — 3 lignes Wave / Orange Money / Cash

```ts
const byMethod = (method: PaymentMethod) => orders.filter(o => o.paymentMethod === method)
const waveCount  = byMethod("wave").length
const orangeCount = byMethod("orange").length
const cashCount  = byMethod("cash").length
const total      = orders.length
```

Chaque ligne : label + badge coloré + pourcentage `(count/total*100).toFixed(0) + "%"`

**10 dernières transactions** — `orders.slice(0, 10)` en tableau simple

Colonnes : ID (mono), Date, Montant, Commission déduite (`Math.round(o.amount * commissionRate)`), Net

---

## Page 4 — Paramètres (`app/(merchant)/merchant/parametres/page.tsx`)

**Type** : Client Component (`"use client"`)

### Sections

**1. Profil boutique** (`useState` initialisé depuis `merchants[0]`)

4 champs avec `<Label>` + `<Input>` :
- Nom boutique (disabled — non modifiable par le marchand)
- Email
- Téléphone
- Ville

Bouton "Enregistrer" → `alert("Paramètres enregistrés")` (mock, pas d'API)

**2. Mon plan**

Badge plan actuel + liste des fonctionnalités :
- Standard : jusqu'à 200 commandes/mois, commission 12%, support email
- Premium : commandes illimitées, commission 15%, support prioritaire, analytics avancés

**3. Notifications**

3 switches (`<Switch>` + `<Label>`) avec `useState` local :
- WhatsApp (défaut `true`)
- SMS (défaut `true`)
- Email (défaut `false`)

---

## Fichiers à créer / modifier

| Fichier | Action | Type |
|---------|--------|------|
| `app/(merchant)/merchant/page.tsx` | **Modifier** (remplace redirect) | Server Component |
| `app/(merchant)/merchant/commandes/page.tsx` | **Créer** | Client Component |
| `app/(merchant)/merchant/finances/page.tsx` | **Créer** | Server Component |
| `app/(merchant)/merchant/parametres/page.tsx` | **Créer** | Client Component |

Aucun nouveau composant partagé. Aucun nouveau store. Aucune modification du layout ou de la sidebar.

---

## Non-objectifs (hors scope)

- Authentification réelle (pas de vrai user context — `merchants[0]` est hardcodé)
- Persistance des paramètres (pas d'API)
- Graphiques sur la page Finances (Server Component, pas de Recharts)
- Page de notifications dédiée
