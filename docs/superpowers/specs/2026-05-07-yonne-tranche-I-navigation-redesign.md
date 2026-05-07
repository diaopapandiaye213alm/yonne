# Tranche I — Navigation Redesign : sidebar brand emerald + topbar premium

## Contexte

Les sidebars admin et marchand utilisent un fond blanc avec un item actif `bg-emerald-500 text-white` — efficace mais sans personnalité. La topbar est minimaliste. Cette tranche transforme la navigation en colonne d'identité YONNE : fond emerald profond, accents gold sur l'item actif, topbar avec le nom de l'utilisateur visible et un avatar premium.

## Objectif

- Sidebar : fond `emerald-900`, item actif avec barre gauche gold + bg gold/10 + texte gold-400
- Topbar : breadcrumb plus affirmé, nom de l'utilisateur visible, avatar avec anneau gold

## Périmètre

Pages **dans scope** : `AdminSidebar`, `MerchantSidebar`, `Topbar`, `tailwind.config.ts`

Pages **hors scope** : tous les layouts de page, le wizard marchand, les pages livreur

---

## Architecture

Trois composants modifiés, zéro nouveau fichier. Les changements sont purement CSS (classes Tailwind). Le `tailwind.config.ts` reçoit deux nouvelles teintes `emerald-800` et `emerald-900` cohérentes avec la palette existante.

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `tailwind.config.ts` | Modifier — ajouter `emerald-800` et `emerald-900` |
| `components/layout/AdminSidebar.tsx` | Modifier — dark emerald + gold active state |
| `components/layout/MerchantSidebar.tsx` | Modifier — même changements |
| `components/layout/Topbar.tsx` | Modifier — breadcrumb bold, userName visible, avatar ring gold |

---

## `tailwind.config.ts`

Ajouter dans `colors.emerald` :

```ts
emerald: {
  500: "#15803D",
  600: "#166534",
  700: "#14532D",
  800: "#0F3D21",  // hover items sidebar
  900: "#071A0E",  // fond sidebar
},
```

---

## `components/layout/AdminSidebar.tsx`

Remplacement complet :

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

**Différences clés :**
- `bg-white border-r border-cream-200` → `bg-emerald-900`
- `border-b border-cream-200` (logo) → `border-b border-emerald-800`
- Item actif : `bg-emerald-500 text-white rounded-lg` → `border-l-2 border-gold-500 bg-gold-500/10 text-gold-400` avec padding compensé `pl-[calc(0.75rem-2px)]`
- Item inactif : `text-ink-700 hover:bg-cream-100` → `text-emerald-100/60 hover:text-cream-50 hover:bg-emerald-800/60`
- Icône active : `text-gold-400` (était héritée de `text-white`)
- Icône inactive : `text-emerald-300/70`
- Footer : `border-t border-cream-200` → `border-t border-emerald-800`, couleurs logout adaptées

---

## `components/layout/MerchantSidebar.tsx`

Même changements que `AdminSidebar`, nav items différents :

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

---

## `components/layout/Topbar.tsx`

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
- Breadcrumb : `text-sm text-ink-500` → `text-sm font-display font-semibold text-ink-900`
- Avatar : `bg-emerald-500 text-white` → `bg-emerald-700 text-cream-50 ring-2 ring-gold-500/60 ring-offset-1`
- Initiales : `userName.charAt(0)` → prend les initiales de chaque mot (max 2 lettres)
- Nom affiché : `<span className="text-sm font-medium text-ink-900 hidden sm:block">{userName}</span>` ajouté à gauche de l'avatar

---

## Non-objectifs (hors scope)

- Mode réduit (sidebar icônes seules) — tranche future
- Dark mode global
- Driver layout (pas de sidebar classique)
- Responsive mobile (la sidebar reste fixe w-60)
