# Tranche G — Session Awareness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le `displayName` du JWT dans les topbars admin et merchant, et corriger le logout du profil livreur.

**Architecture:** Créer `lib/session.ts` avec `getSession()` (lit cookie + vérifie JWT côté serveur). Les layouts admin et merchant deviennent des Server Components async qui appellent `getSession()` et passent `displayName` au `<Topbar>`. La page profil livreur remplace son `<Link href="/login">` par un `<form method="POST">`.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, `jose` (déjà installé), `next/headers` (cookies).

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/session.ts` | Créer |
| `app/(admin)/admin/layout.tsx` | Modifier |
| `app/(merchant)/merchant/layout.tsx` | Modifier |
| `app/(driver)/driver/profil/page.tsx` | Modifier |

## Contexte codebase à lire avant de commencer

- `lib/auth.ts` — `verifyToken(token)` retourne `Promise<SessionPayload | null>`. `SessionPayload = { email, role, displayName }`.
- `app/(admin)/admin/layout.tsx` — `<Topbar breadcrumb="Admin" userName="Admin YONNE" notifications={3} />`
- `app/(merchant)/merchant/layout.tsx` — `<Topbar breadcrumb="Marchand" userName="Boutique Plateau" notifications={1} />`
- `app/(driver)/driver/profil/page.tsx` — `<Link href="/login" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors"><LogOut className="w-4 h-4" />Se déconnecter</Link>`

---

## Task 1 : Créer `lib/session.ts`

**Files:**
- Create: `lib/session.ts`

- [ ] **Step 1 : Vérifier que le fichier n'existe pas**

```bash
ls /home/papa-ndiaye-diao/yonne/lib/session.ts 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer `lib/session.ts`**

```ts
import { cookies } from "next/headers";
import { verifyToken, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("yonne_session")?.value ?? "";
  return token ? verifyToken(token) : null;
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add lib/session.ts
git commit -m "feat(session): helper getSession() — lit cookie yonne_session côté serveur"
```

---

## Task 2 : Mettre à jour `app/(admin)/admin/layout.tsx`

**Files:**
- Modify: `app/(admin)/admin/layout.tsx`

État actuel du fichier :

```tsx
// app/(admin)/admin/layout.tsx
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Admin" userName="Admin YONNE" notifications={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer le contenu complet du fichier**

```tsx
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} notifications={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

Différences clés :
- Ajout de `import { getSession } from "@/lib/session"`
- Fonction rendue `async`
- `userName="Admin YONNE"` → `userName={session?.displayName ?? "Admin"}`

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add "app/(admin)/admin/layout.tsx"
git commit -m "feat(session): admin layout — displayName depuis JWT"
```

---

## Task 3 : Mettre à jour `app/(merchant)/merchant/layout.tsx`

**Files:**
- Modify: `app/(merchant)/merchant/layout.tsx`

État actuel du fichier :

```tsx
// app/(merchant)/merchant/layout.tsx
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName="Boutique Plateau" notifications={1} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer le contenu complet du fichier**

```tsx
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} notifications={1} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

Différences clés :
- Ajout de `import { getSession } from "@/lib/session"`
- Fonction rendue `async`
- `userName="Boutique Plateau"` → `userName={session?.displayName ?? "Marchand"}`

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add "app/(merchant)/merchant/layout.tsx"
git commit -m "feat(session): merchant layout — displayName depuis JWT"
```

---

## Task 4 : Corriger le logout dans `app/(driver)/driver/profil/page.tsx`

**Files:**
- Modify: `app/(driver)/driver/profil/page.tsx`

Le lien actuel (ligne ~83) :

```tsx
<Link href="/login" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors">
  <LogOut className="w-4 h-4" />
  Se déconnecter
</Link>
```

- [ ] **Step 1 : Remplacer le Link par un form POST**

Chercher la section logout et remplacer uniquement ce bloc par :

```tsx
<form action="/api/auth/logout" method="POST">
  <button type="submit" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors cursor-pointer">
    <LogOut className="w-4 h-4" />
    Se déconnecter
  </button>
</form>
```

- [ ] **Step 2 : Vérifier si `Link` est encore utilisé dans le fichier**

```bash
grep -n "Link" "app/(driver)/driver/profil/page.tsx"
```

Si `Link` n'apparaît plus que dans l'import (et pas dans le JSX), supprimer la ligne `import Link from "next/link"`.

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Build de production**

```bash
pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur (warnings OK).

- [ ] **Step 5 : Commit + tag**

```bash
git add "app/(driver)/driver/profil/page.tsx"
git commit -m "feat(session): driver profil — logout via form POST + fix cookie httpOnly"
git tag v0.7.0-tranche-G
```
