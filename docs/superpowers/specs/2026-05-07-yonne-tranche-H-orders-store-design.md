# Tranche H — Zustand Orders Store : commandes vivantes

## Contexte

Les pages admin et marchand lisent `orders` depuis un tableau statique (`lib/mock-data/orders.ts`). Le wizard marchand génère un ID de commande mais ne l'enregistre nulle part. Résultat : les trois rôles sont des îlots déconnectés — aucune action d'un rôle n'est visible par les autres.

Cette tranche remplace le tableau statique par un store Zustand partagé. Le marchand crée une commande → elle apparaît dans la liste admin. L'admin change le statut → le marchand voit la mise à jour.

## Objectif

- Marchand termine le wizard → commande ajoutée au store, visible dans `/admin/commandes`
- Admin ouvre le détail d'une commande → peut faire avancer le statut (créée → assignée → collecte → en route → livrée)
- Les listes admin et marchand lisent le store en temps réel

## Périmètre (éphémère — pas de persistance)

Le store se remet à zéro à chaque refresh. Acceptable pour une démo live.

Pages **hors scope** qui restent sur le tableau statique : `merchant/page.tsx` (dashboard KPI) et `merchant/finances/page.tsx` (transactions historiques).

## Architecture

Un store Zustand `useOrdersStore` initialisé avec les 147 commandes mock existantes. Deux actions : `addOrder` et `updateStatus`. Les pages qui ont besoin de données live importent le store au lieu du tableau statique.

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/store/orders.ts` | Créer — store Zustand `useOrdersStore` |
| `components/wizard/DispatchStep.tsx` | Modifier — appelle `addOrder` avant `router.push` |
| `app/(admin)/admin/commandes/page.tsx` | Modifier — `orders` statique → `useOrdersStore` |
| `app/(admin)/admin/commandes/[id]/page.tsx` | Modifier — devient Client Component + bouton `updateStatus` |
| `app/(merchant)/merchant/commandes/page.tsx` | Modifier — `orders` statique → `useOrdersStore` |

---

## `lib/store/orders.ts`

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

- `[...seedOrders]` crée une copie du tableau statique pour éviter les mutations
- `addOrder` insère en tête (commande la plus récente d'abord)
- `updateStatus` est une mise à jour immutable (map + spread)

---

## `components/wizard/DispatchStep.tsx`

Ajouter `useOrdersStore` et `useWizard`. Au clic sur "Voir le suivi" :

```ts
const { addOrder } = useOrdersStore();
// w = useWizard() — déjà présent dans le composant

const orderId = `YN-2026-${String(20000 + Math.floor(Math.random() * 9999))}`;

function handleConfirm() {
  addOrder({
    id: orderId,
    driverId: assignedDriver.id,
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
```

Statut `"assignée"` : le dispatch IA a déjà trouvé un livreur, la commande n'est plus `"créée"`.

---

## `app/(admin)/admin/commandes/page.tsx`

Déjà `"use client"`. Seul changement :

```ts
// Avant
import { orders } from "@/lib/mock-data/orders";
// ...
const filtered = useMemo(() => {
  return orders.filter(...)
}, [search, filters]);

// Après
const { orders } = useOrdersStore();
// ...
const filtered = useMemo(() => {
  return orders.filter(...)
}, [orders, search, filters]);
```

Ajouter `orders` dans le tableau de dépendances du `useMemo`.

---

## `app/(admin)/admin/commandes/[id]/page.tsx`

Actuellement Server Component. Devient Client Component.

Changements :
1. Ajouter `"use client"` en haut du fichier
2. Remplacer `orders.find(o => o.id === params.id)` → `useOrdersStore`
3. Supprimer `import { notFound } from "next/navigation"` (remplacer par un fallback JSX)
4. Ajouter le bouton de progression de statut en bas de page

```ts
const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  "créée":    "assignée",
  "assignée": "collecte",
  "collecte": "en route",
  "en route": "livrée",
  "livrée":   null,
};
```

UI du bouton (à ajouter après les cards existantes) :

```tsx
const { orders, updateStatus } = useOrdersStore();
const order = orders.find(o => o.id === params.id);
const next = order ? NEXT_STATUS[order.status] : null;

// ...

{next && (
  <button
    onClick={() => updateStatus(order.id, next)}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-display font-bold transition-colors"
  >
    Passer à : <span className="capitalize">{next}</span>
  </button>
)}
{!next && order?.status === "livrée" && (
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-medium">
    ✓ Commande livrée
  </div>
)}
```

---

## `app/(merchant)/merchant/commandes/page.tsx`

Déjà `"use client"`. Même changement que la liste admin :

```ts
// Avant
import { orders } from "@/lib/mock-data/orders";
// Après
const { orders } = useOrdersStore();
```

Ajouter `orders` dans les tableaux de dépendances des `useMemo`.

---

## Non-objectifs (hors scope)

- Persistance localStorage (store éphémère = reset au refresh)
- `merchant/page.tsx` dashboard KPI (reste sur tableau statique)
- `merchant/finances/page.tsx` transactions (reste sur tableau statique)
- Pas de WebSocket / SSE / polling
- Pas de notification temps réel
