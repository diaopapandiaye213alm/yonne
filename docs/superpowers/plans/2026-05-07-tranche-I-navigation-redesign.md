# Tranche I — Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer la sidebar admin et marchand en colonne de marque emerald foncé avec accents gold, et améliorer la topbar avec le nom de l'utilisateur visible et un avatar premium.

**Architecture:** Quatre fichiers modifiés, zéro nouveau fichier. `tailwind.config.ts` reçoit deux nouvelles teintes (`emerald-800`, `emerald-900`). Les deux sidebars reçoivent un fond `bg-emerald-900`, item actif avec barre gauche `border-gold-500` + fond `bg-gold-500/10` + texte `text-gold-400`. La topbar reçoit un breadcrumb plus affirmé, le `userName` affiché en texte à côté de l'avatar, et l'avatar en `bg-emerald-700` avec anneau `ring-gold-500/60`.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, TypeScript strict, `cn()` utilitaire (clsx + twMerge)

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `tailwind.config.ts` | Modifier — ajouter `emerald-800` et `emerald-900` |
| `components/layout/AdminSidebar.tsx` | Modifier — dark emerald + gold active state |
| `components/layout/MerchantSidebar.tsx` | Modifier — mêmes changements |
| `components/layout/Topbar.tsx` | Modifier — breadcrumb bold, userName visible, avatar ring gold |

---

## Task 1 : Étendre la palette Tailwind avec `emerald-800` et `emerald-900`

**Files:**
- Modify: `tailwind.config.ts:12`

Ces deux teintes sont nécessaires avant de modifier les sidebars — Tailwind génère les classes CSS au build, toute classe non définie dans la config sera ignorée (pas d'erreur, juste pas de style). La ligne 12 du fichier actuel est :

```ts
emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
```

- [ ] **Step 1 : Modifier la ligne 12 de `tailwind.config.ts`**

Remplacer :
```ts
emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
```

Par :
```ts
emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D", 800: "#0F3D21", 900: "#071A0E" },
```

`#0F3D21` = vert forêt profond (hover items sidebar)
`#071A0E` = vert quasi-noir (fond sidebar)

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add tailwind.config.ts && git commit -m "feat(design): ajouter emerald-800 et emerald-900 à la palette Tailwind"
```

---

## Task 2 : Redesign `AdminSidebar`

**Files:**
- Modify: `components/layout/AdminSidebar.tsx`

Le fichier actuel utilise `bg-white`, item actif `bg-emerald-500 text-white`, inactif `text-ink-700 hover:bg-cream-100`. On remplace le contenu complet.

**Contexte :** `Wordmark` a déjà une variante `variant="dark"` qui affiche le texte en `cream-50` et le dot en `gold-400`. `cn()` est importé depuis `@/lib/utils`. La barre gauche de l'item actif (`border-l-2 border-gold-500`) réduit le padding gauche de 2px, compensé par `pl-[calc(0.75rem-2px)]` (12px - 2px = 10px) pour maintenir l'alignement visuel.

- [ ] **Step 1 : Remplacer le contenu complet de `components/layout/AdminSidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/admin",           label: "Accueil",      icon: Home },
  { href: "/admin/commandes", label: "Commandes",    icon: Package },
  { href: "/admin/livreurs",  label: "Livreurs",     icon: Bike },
  { href: "/admin/marchands", label: "Commerçants",  icon: Store },
  { href: "/admin/finance",   label: "Finance",      icon: Wallet },
  { href: "/admin/analytics", label: "Analytics",    icon: BarChart3 },
  { href: "/admin/surge",     label: "Surge",        icon: Zap },
  { href: "/admin/tabaski",   label: "Tabaski",      icon: Sparkles, badge: "J-7" },
  { href: "/admin/settings",  label: "Paramètres",   icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-emerald-900 flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-emerald-800">
        <Link href="/admin"><Wordmark size="md" variant="dark" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "border-l-2 border-gold-500 bg-gold-500/10 text-gold-400 pl-[calc(0.75rem-2px)] pr-3"
                  : "text-emerald-100/60 hover:text-cream-50 hover:bg-emerald-800/60 px-3"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold-400" : "text-emerald-300/70")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-sm bg-gold-500 text-ink-900 font-bold">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-emerald-800">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-emerald-300/70 hover:text-cream-50 hover:bg-emerald-800/60 w-full text-left cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "components/layout/AdminSidebar.tsx" && git commit -m "feat(design): AdminSidebar — fond emerald-900 + item actif gold"
```

---

## Task 3 : Redesign `MerchantSidebar`

**Files:**
- Modify: `components/layout/MerchantSidebar.tsx`

Même pattern que `AdminSidebar`, nav items différents (pas de `badge`).

- [ ] **Step 1 : Remplacer le contenu complet de `components/layout/MerchantSidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, PlusSquare, ListOrdered, Wallet, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/merchant",                    label: "Accueil",           icon: Home },
  { href: "/merchant/nouvelle-commande",  label: "Nouvelle commande", icon: PlusSquare },
  { href: "/merchant/commandes",          label: "Mes commandes",     icon: ListOrdered },
  { href: "/merchant/finances",           label: "Finances",          icon: Wallet },
  { href: "/merchant/parametres",         label: "Paramètres",        icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-emerald-900 flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-emerald-800">
        <Link href="/merchant"><Wordmark size="md" variant="dark" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/merchant" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "border-l-2 border-gold-500 bg-gold-500/10 text-gold-400 pl-[calc(0.75rem-2px)] pr-3"
                  : "text-emerald-100/60 hover:text-cream-50 hover:bg-emerald-800/60 px-3"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold-400" : "text-emerald-300/70")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-emerald-800">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-emerald-300/70 hover:text-cream-50 hover:bg-emerald-800/60 w-full text-left cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "components/layout/MerchantSidebar.tsx" && git commit -m "feat(design): MerchantSidebar — fond emerald-900 + item actif gold"
```

---

## Task 4 : Redesign `Topbar` + build + tag

**Files:**
- Modify: `components/layout/Topbar.tsx`

Le fichier actuel affiche seulement l'initiale `userName.charAt(0)` dans un avatar `bg-emerald-500`. On ajoute : initiales complètes (2 lettres max), `userName` affiché en texte, avatar `bg-emerald-700` avec anneau gold, breadcrumb en `font-display font-semibold`.

- [ ] **Step 1 : Remplacer le contenu complet de `components/layout/Topbar.tsx`**

```tsx
"use client";
import { Bell } from "lucide-react";
import { LangSwitcher } from "./LangSwitcher";

interface Props {
  breadcrumb: string;
  userName: string;
  notifications?: number;
}

export function Topbar({ breadcrumb, userName, notifications = 0 }: Props) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
      <div className="text-sm font-display font-semibold text-ink-900">{breadcrumb}</div>
      <div className="flex items-center gap-4">
        <LangSwitcher />
        <button className="relative p-2 rounded-md hover:bg-cream-100" aria-label="Notifications">
          <Bell className="w-5 h-5 text-ink-700" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-900 hidden sm:block">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-cream-50 text-sm font-bold flex items-center justify-center ring-2 ring-gold-500/60 ring-offset-1">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Différences clés :**
- `initials` : `userName.charAt(0)` → `userName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()` (ex. "Moussa Diop" → "MD")
- Breadcrumb : `text-sm text-ink-500` → `text-sm font-display font-semibold text-ink-900`
- Avatar : `bg-emerald-500 text-white` → `bg-emerald-700 text-cream-50 ring-2 ring-gold-500/60 ring-offset-1`
- Nom affiché : `<span className="text-sm font-medium text-ink-900 hidden sm:block">{userName}</span>` — masqué sur mobile (`hidden sm:block`)

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur (warnings OK).

- [ ] **Step 4 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "components/layout/Topbar.tsx" && git commit -m "feat(design): Topbar — breadcrumb bold + userName visible + avatar ring gold"
cd /home/papa-ndiaye-diao/yonne && git tag v0.9.0-tranche-I
```
