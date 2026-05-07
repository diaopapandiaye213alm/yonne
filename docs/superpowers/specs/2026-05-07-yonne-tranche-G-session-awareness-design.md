# Tranche G — Session Awareness : displayName dans les headers

## Contexte

L'auth JWT (Tranche F) est en place : chaque utilisateur connecté possède un cookie `yonne_session` contenant `{ email, role, displayName }`. Cependant, les layouts hardcodent encore le nom de l'utilisateur (`userName="Admin YONNE"`, `userName="Boutique Plateau"`). Cette tranche lit le JWT côté serveur pour afficher le vrai `displayName` dans les headers.

## Objectif

Les topbars admin et merchant affichent le `displayName` issu du JWT plutôt qu'une chaîne en dur. Bonus : corriger le logout du profil livreur (Link GET → form POST).

## Architecture

Un seul nouveau fichier partagé (`lib/session.ts`) expose `getSession()` — une fonction serveur qui lit le cookie et vérifie le JWT. Les layouts deviennent des Server Components async qui appellent `getSession()` et passent le résultat au composant `<Topbar>`.

**Aucun état client ajouté.** Tout se passe côté serveur dans les layouts, ce qui est cohérent avec le pattern App Router.

## Fichiers

| Fichier | Action | Notes |
|---------|--------|-------|
| `lib/session.ts` | Créer | `getSession(): Promise<SessionPayload \| null>` |
| `app/(admin)/admin/layout.tsx` | Modifier | async Server Component, lit session |
| `app/(merchant)/merchant/layout.tsx` | Modifier | idem |
| `app/(driver)/driver/profil/page.tsx` | Modifier | logout Link → form POST |

---

## `lib/session.ts`

```ts
import { cookies } from "next/headers";
import { verifyToken, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("yonne_session")?.value ?? "";
  return token ? verifyToken(token) : null;
}
```

- `cookies()` est une API Next.js Server-only — ce fichier ne peut être importé que depuis des Server Components ou Route Handlers.
- Retourne `null` si le cookie est absent ou invalide (token expiré, signature incorrecte).

---

## `app/(admin)/admin/layout.tsx`

Avant :
```tsx
<Topbar breadcrumb="Admin" userName="Admin YONNE" notifications={3} />
```

Après :
```tsx
const session = await getSession();
// ...
<Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} notifications={3} />
```

La fonction layout devient `async`. `notifications` reste en dur (hors scope).

---

## `app/(merchant)/merchant/layout.tsx`

Même pattern :
```tsx
const session = await getSession();
// ...
<Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} notifications={1} />
```

---

## `app/(driver)/driver/profil/page.tsx`

Le lien de déconnexion actuel :
```tsx
<Link href="/login" className="...">
  <LogOut className="w-4 h-4" />
  Se déconnecter
</Link>
```

Remplacé par :
```tsx
<form action="/api/auth/logout" method="POST">
  <button type="submit" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors cursor-pointer">
    <LogOut className="w-4 h-4" />
    Se déconnecter
  </button>
</form>
```

Supprimer l'import `Link` de `next/link` s'il n'est plus utilisé ailleurs dans le fichier.

---

## Non-objectifs (hors scope)

- Les pages intérieures (accueil marchand, finances, etc.) gardent leurs données mock (`merchants[0]`, `drivers[0]`)
- `notifications` reste en dur dans les topbars
- Le nom du livreur sur la page profil reste `demo.name` (pas de topbar driver)
- Aucun endpoint `/api/auth/session`
