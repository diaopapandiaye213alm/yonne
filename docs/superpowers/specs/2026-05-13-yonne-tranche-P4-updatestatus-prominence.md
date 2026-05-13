# Tranche P4 — Bouton updateStatus Proéminent dans le Détail Commande Admin

## Contexte

La page détail commande admin (`/admin/commandes/[id]`) affiche le bouton "Passer à : {next}" en bas de page, après les cartes Client, Livreur, Carte et Timeline. L'action principale est difficile à trouver sans scroller.

## Objectif

Repositionner le bouton d'avancement de statut dans l'en-tête de la page, visible dès le chargement, à droite du titre et du badge statut.

## Architecture

Un seul fichier modifié :

```
app/(admin)/admin/commandes/[id]/page.tsx   ← restructurer l'en-tête + supprimer section bas
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/(admin)/admin/commandes/[id]/page.tsx` | Modifier — header `justify-between`, bouton en haut, suppression section bas |

---

## Changements

### En-tête

**Avant :**
```tsx
<div className="flex items-center gap-3">
  <Link href="/admin/commandes" ...><ArrowLeft /></Link>
  <div>
    <h1>...</h1>
    <span className={STATUS_COLORS[order.status]}>{order.status}</span>
  </div>
</div>
```

**Après :**
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Link href="/admin/commandes" ...><ArrowLeft /></Link>
    <div>
      <h1>...</h1>
      <span className={STATUS_COLORS[order.status]}>{order.status}</span>
    </div>
  </div>
  <div>
    {next && (
      <button
        onClick={() => updateStatus(order.id, next)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-display font-bold transition-colors"
      >
        Passer à : <span className="capitalize">{next}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    )}
    {!next && order.status === "livrée" && (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-medium">
        ✓ Commande livrée
      </div>
    )}
  </div>
</div>
```

### Import à ajouter

```ts
import { ArrowLeft, ChevronRight } from "lucide-react";
```

### Section bas supprimée

Retirer entièrement le bloc situé à la fin du `return` :

```tsx
<div className="flex items-center gap-3">
  {next && (
    <button onClick={...}>Passer à : ...</button>
  )}
  {!next && order.status === "livrée" && (
    <div>✓ Commande livrée</div>
  )}
</div>
```

---

## Non-objectifs (hors scope)

- Pas de confirmation modale avant le changement de statut
- Pas de modification de la page détail commande marchand
- Pas de modification de la logique `updateStatus` ou `NEXT_STATUS`
