# Tranche P3 — Empty States sur les listes filtrables

## Contexte

Les 4 pages avec `FilterBar` + `DataTable` affichent actuellement un simple "Aucun résultat" centré quand la recherche ou les filtres ne matchent rien. C'est fonctionnel mais peu explicatif — l'utilisateur ne sait pas quoi faire pour trouver ce qu'il cherche.

## Objectif

Remplacer le texte minimaliste par un état vide enrichi : icône Search, titre contextuel, sous-titre d'aide, et bouton "Réinitialiser les filtres".

## Architecture

Un seul composant modifié, 4 pages mises à jour.

```
components/admin/DataTable.tsx          ← +3 props optionnelles
app/(admin)/admin/commandes/page.tsx    ← emptyTitle + emptyBody + onReset
app/(merchant)/merchant/commandes/page.tsx
app/(admin)/admin/marchands/page.tsx
app/(admin)/admin/livreurs/page.tsx
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `components/admin/DataTable.tsx` | Modifier — ajouter `emptyTitle?`, `emptyBody?`, `onReset?` |
| `app/(admin)/admin/commandes/page.tsx` | Modifier — passer props contextuelles + `handleReset` |
| `app/(merchant)/merchant/commandes/page.tsx` | Modifier — idem |
| `app/(admin)/admin/marchands/page.tsx` | Modifier — idem |
| `app/(admin)/admin/livreurs/page.tsx` | Modifier — idem |

---

## `components/admin/DataTable.tsx`

### Nouvelles props

```ts
interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  onReset?: () => void;
}
```

### UI état vide

Remplacer la `<tr>` actuelle par :

```tsx
{slice.length === 0 && (
  <tr>
    <td colSpan={columns.length} className="py-14 text-center">
      <Search className="w-8 h-8 text-ink-300 mx-auto mb-3" />
      <p className="text-sm font-semibold text-ink-900">
        {emptyTitle ?? "Aucun résultat"}
      </p>
      {emptyBody && (
        <p className="text-xs text-ink-500 mt-1">{emptyBody}</p>
      )}
      {onReset && (
        <button
          onClick={onReset}
          className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-700"
        >
          Réinitialiser les filtres
        </button>
      )}
    </td>
  </tr>
)}
```

Import à ajouter : `import { ChevronLeft, ChevronRight, Search } from "lucide-react";`

---

## Mise à jour des 4 pages

### Pattern commun

Chaque page ajoute :

```ts
function handleReset() {
  setSearch("");
  setFilters({});
}
```

Et passe au `<DataTable>` :

```tsx
emptyTitle="..."
emptyBody="..."
onReset={handleReset}
```

### Messages contextuels

| Page | `emptyTitle` | `emptyBody` |
|------|-------------|-------------|
| admin/commandes | `"Aucune commande trouvée"` | `"Essayez de modifier le statut, le paiement ou la recherche."` |
| merchant/commandes | `"Aucune commande trouvée"` | `"Essayez de modifier le statut ou la recherche."` |
| admin/marchands | `"Aucun commerçant trouvé"` | `"Essayez de modifier le plan, la ville ou le statut."` |
| admin/livreurs | `"Aucun livreur trouvé"` | `"Essayez de modifier le statut ou le badge."` |

---

## Non-objectifs (hors scope)

- Pas d'illustration SVG ou image
- Pas de différence visuelle entre "liste vide sans filtres" et "liste vide avec filtres actifs"
- Pas de modification de la page admin Finance (pas de DataTable)
- Pas de modification du dashboard marchand (`/merchant`)
