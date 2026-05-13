# Tranche P5 — Bouton Surge "Appliquer" avec Toast

## Contexte

La page `/admin/surge` affiche un bouton "Appliquer ×{n}" quand le mode automatique est désactivé. Ce bouton est purement visuel — il n'a pas de `onClick` et ne fournit aucun retour à l'utilisateur.

## Objectif

Brancher le bouton "Appliquer" sur un `toast.success` confirmant l'application du multiplicateur. Le `Toaster` est déjà monté dans le root layout (Tranche L).

## Architecture

Un seul fichier modifié :

```
app/(admin)/admin/surge/page.tsx   ← +import toast + onClick sur le bouton
```

Aucun changement au store (`useSurgeStore`) — le multiplicateur est déjà "live" via `setMultiplier`.

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/(admin)/admin/surge/page.tsx` | Modifier — import toast + onClick |

---

## Changements

### Import à ajouter

```ts
import { toast } from "sonner";
```

### Bouton mis à jour

```tsx
{!autoMode && (
  <Button
    className="bg-emerald-500 hover:bg-emerald-600 text-white"
    onClick={() =>
      toast.success(`Surge ×${multiplier.toFixed(1)} appliqué — toutes les nouvelles courses utilisent ce multiplicateur`)
    }
  >
    Appliquer ×{multiplier.toFixed(1)}
  </Button>
)}
```

---

## Non-objectifs (hors scope)

- Pas de modification du store `useSurgeStore`
- Pas de persistance du multiplicateur appliqué
- Pas de différenciation visuelle "appliqué vs en attente"
