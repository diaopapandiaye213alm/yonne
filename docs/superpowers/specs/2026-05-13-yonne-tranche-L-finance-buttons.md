# Tranche L — Boutons Finance Fonctionnels

## Contexte

La page admin Finance (`/admin/finance`) affiche deux sections avec des boutons d'action inactifs :
- **Parrainage livreurs** : bouton "Verser X F" par prime de parrainage
- **Avances sur salaire** : boutons "Approuver" et "Rejeter" par demande

Les boutons ne font rien au clic. Par ailleurs, le composant `Toaster` de Sonner n'est pas monté dans le root layout — aucun toast n'apparaît nulle part dans l'app.

## Objectif

- Monter `<Toaster />` dans le root layout
- Bouton "Verser" → toast success + retire l'item de la liste
- Bouton "Approuver" → toast success + retire l'item de la liste
- Bouton "Rejeter" → toast error + retire l'item de la liste
- Section vide si tous les items sont traités

## Architecture

Deux fichiers. La page finance devient Client Component avec `useState` local initialisé depuis les mock data.

```
app/layout.tsx                          ← Modifier — ajouter <Toaster />
app/(admin)/admin/finance/page.tsx      ← Modifier — "use client" + useState + handlers
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/layout.tsx` | Modifier — monter `<Toaster />` dans `<body>` |
| `app/(admin)/admin/finance/page.tsx` | Modifier — Client Component + useState + toast handlers |

---

## `app/layout.tsx`

Ajouter l'import et le composant dans `<body>` :

```tsx
import { Toaster } from "@/components/ui/sonner";
// ...
<body>
  {children}
  <Toaster />
</body>
```

---

## `app/(admin)/admin/finance/page.tsx`

### Changements

1. Ajouter `"use client"` en première ligne
2. Ajouter imports : `useState` depuis react, `toast` depuis sonner
3. Remplacer les imports directs de `referralPrizes` et `advanceRequests` par `useState` initialisé depuis ces valeurs
4. Ajouter handlers :

```ts
const [prizes, setPrizes] = useState(referralPrizes);
const [advances, setAdvances] = useState(advanceRequests);

function handleVerser(idx: number) {
  const p = prizes[idx];
  toast.success(`Prime versée à ${p.referrerName} — ${fmt(p.prizeAmount)} F`);
  setPrizes((prev) => prev.filter((_, i) => i !== idx));
}

function handleApprouver(id: string) {
  const r = advances.find((a) => a.id === id);
  if (r) toast.success(`Avance approuvée pour ${r.driverName} — ${fmt(r.requestedAmount)} F`);
  setAdvances((prev) => prev.filter((a) => a.id !== id));
}

function handleRejeter(id: string) {
  const r = advances.find((a) => a.id === id);
  if (r) toast.error(`Demande rejetée — ${r.driverName}`);
  setAdvances((prev) => prev.filter((a) => a.id !== id));
}
```

5. Bouton "Verser" : `onClick={() => handleVerser(i)}`
6. Bouton "Approuver" : `onClick={() => handleApprouver(r.id)}`
7. Bouton "Rejeter" : `onClick={() => handleRejeter(r.id)}`
8. Empty states :
   - Parrainage vide : `<p className="text-sm text-ink-500">Aucune prime en attente</p>`
   - Avances vide : `<p className="text-sm text-ink-500">Aucune demande en attente</p>`

### Toast messages

| Action | Type | Message |
|--------|------|---------|
| Verser | `toast.success` | `Prime versée à {referrerName} — {amount} F` |
| Approuver | `toast.success` | `Avance approuvée pour {driverName} — {amount} F` |
| Rejeter | `toast.error` | `Demande rejetée — {driverName}` |

Toast position : défaut Sonner (bas droite), durée 3s.

---

## Non-objectifs (hors scope)

- Pas de confirmation modale avant l'action
- Pas de spinner/état loading
- Pas de persistance (reset au rechargement)
- Pas de Zustand store (état local suffisant)
- Pas de modification de la page merchant/finances
