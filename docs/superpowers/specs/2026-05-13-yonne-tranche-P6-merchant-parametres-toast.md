# Tranche P6 — Merchant Paramètres Toast

## Contexte

La page `/merchant/parametres` contient deux sections interactives avec état local :

1. **Profil boutique** — champs email, téléphone, ville + bouton "Enregistrer" qui appelle `alert("Paramètres enregistrés")` au lieu d'un toast Sonner.
2. **Notifications** — trois switches (WhatsApp, SMS, Email) sans bouton de sauvegarde.

Le `<Toaster />` est déjà monté dans le root layout depuis la Tranche L. Le pattern `toast.success` est utilisé partout ailleurs (`/admin/settings`, `/admin/surge`).

## Objectif

- Remplacer `alert("Paramètres enregistrés")` par `toast.success("Profil enregistré")`
- Ajouter un bouton "Enregistrer" dans la section Notifications → `toast.success("Notifications enregistrées")`

## Architecture

Un seul fichier modifié :

```
app/(merchant)/merchant/parametres/page.tsx   ← import toast + fix bouton profil + ajout bouton notifications
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/(merchant)/merchant/parametres/page.tsx` | Modifier — import toast + fix bouton + nouveau bouton notifications |

---

## Changements

### Import à ajouter

```ts
import { toast } from "sonner";
```

### Bouton Profil boutique (existant)

**Avant :**
```tsx
<Button
  onClick={() => alert("Paramètres enregistrés")}
  className="bg-emerald-500 hover:bg-emerald-600 text-white"
>
  Enregistrer
</Button>
```

**Après :**
```tsx
<Button
  type="button"
  onClick={() => toast.success("Profil enregistré")}
  className="bg-emerald-500 hover:bg-emerald-600 text-white"
>
  Enregistrer
</Button>
```

### Bouton Notifications (à ajouter)

Ajouter après la liste des switches, toujours dans la card Notifications :

```tsx
<Button
  type="button"
  onClick={() => toast.success("Notifications enregistrées")}
  className="bg-emerald-500 hover:bg-emerald-600 text-white"
>
  Enregistrer
</Button>
```

---

## Non-objectifs (hors scope)

- Pas de persistance réelle (store ou API) — mock uniquement
- Pas de modification de la structure des sections
- Pas de validation de formulaire
