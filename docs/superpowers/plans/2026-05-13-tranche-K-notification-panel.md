# Tranche K — Panneau Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher la cloche de la topbar sur un store Zustand et ouvrir un dropdown de notifications au clic, pour les rôles admin et marchand.

**Architecture:** Nouveau store Zustand `lib/store/notifications.ts` avec 4 notifs mockées (3 admin, 1 marchand). Nouveau composant `NotificationBell` qui encapsule la cloche + le dropdown. `Topbar` remplace son bouton Bell statique par `<NotificationBell role={role} />` et reçoit `role` en prop à la place de `notifications`.

**Tech Stack:** Next.js 14 App Router, Zustand, TypeScript strict, Tailwind CSS, lucide-react

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/store/notifications.ts` | Créer — store + types + mock data |
| `components/layout/NotificationBell.tsx` | Créer — cloche interactive + dropdown |
| `components/layout/Topbar.tsx` | Modifier — prop `role`, retire `notifications` |
| `app/(admin)/admin/layout.tsx` | Modifier — `role="admin"` |
| `app/(merchant)/merchant/layout.tsx` | Modifier — `role="merchant"` |

---

## Task 1 : Créer `lib/store/notifications.ts`

**Files:**
- Create: `lib/store/notifications.ts`

- [ ] **Step 1 : Vérifier que le fichier n'existe pas**

```bash
ls /home/papa-ndiaye-diao/yonne/lib/store/notifications.ts 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer `lib/store/notifications.ts`**

```ts
import { create } from "zustand";

export type NotifRole = "admin" | "merchant";
export type NotifIcon = "order" | "status" | "driver" | "surge";

export interface Notification {
  id: string;
  role: NotifRole;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: NotifIcon;
}

interface NotificationsState {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: (role: NotifRole) => void;
}

const SEED: Notification[] = [
  { id: "n1", role: "admin",    title: "Nouvelle commande",  body: "CMD-0042 créée par Chez Aminata",        time: "il y a 2 min",  read: false, icon: "order"  },
  { id: "n2", role: "admin",    title: "Livreur hors ligne", body: "Moussa Diallo s'est déconnecté",         time: "il y a 8 min",  read: false, icon: "driver" },
  { id: "n3", role: "admin",    title: "Surge activé",       body: "Zone Plateau — x1.4 depuis 14h30",       time: "il y a 15 min", read: true,  icon: "surge"  },
  { id: "n4", role: "merchant", title: "Commande en route",  body: "CMD-0042 — livreur en chemin vers vous", time: "il y a 3 min",  read: false, icon: "status" },
];

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: SEED,
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: (role) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.role === role ? { ...n, read: true } : n
      ),
    })),
}));
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add lib/store/notifications.ts && git commit -m "feat(notifications): Zustand store avec mock data admin + marchand"
```

---

## Task 2 : Créer `components/layout/NotificationBell.tsx`

**Files:**
- Create: `components/layout/NotificationBell.tsx`

- [ ] **Step 1 : Créer `components/layout/NotificationBell.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Package, Truck, User, Zap } from "lucide-react";
import { useNotificationsStore } from "@/lib/store/notifications";
import type { NotifIcon, NotifRole } from "@/lib/store/notifications";

const ICON_MAP: Record<NotifIcon, React.ComponentType<{ className?: string }>> = {
  order:  Package,
  status: Truck,
  driver: User,
  surge:  Zap,
};

export function NotificationBell({ role }: { role: NotifRole }) {
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mine = notifications.filter((n) => n.role === role);
  const unread = mine.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md hover:bg-cream-100"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-ink-700" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-cream-200 shadow-card z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream-100">
            <span className="font-display font-semibold text-ink-900 text-sm">Notifications</span>
            <button
              onClick={() => markAllRead(role)}
              disabled={unread === 0}
              className="text-xs text-emerald-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tout marquer comme lu
            </button>
          </div>

          {mine.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-ink-500">Aucune notification</div>
          ) : (
            <ul>
              {mine.map((n) => {
                const Icon = ICON_MAP[n.icon];
                return (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-cream-100 border-b border-cream-100 last:border-0 ${
                      n.read ? "bg-white" : "bg-cream-50"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-ink-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${n.read ? "font-normal text-ink-700" : "font-semibold text-ink-900"}`}>
                        {n.title}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5 truncate">{n.body}</div>
                      <div className="text-xs text-ink-400 mt-1">{n.time}</div>
                    </div>
                    {!n.read && (
                      <div className="shrink-0 self-center w-2 h-2 rounded-full bg-gold-500" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
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
cd /home/papa-ndiaye-diao/yonne && git add components/layout/NotificationBell.tsx && git commit -m "feat(notifications): composant NotificationBell avec dropdown"
```

---

## Task 3 : Mettre à jour Topbar + layouts + build + tag

**Files:**
- Modify: `components/layout/Topbar.tsx`
- Modify: `app/(admin)/admin/layout.tsx`
- Modify: `app/(merchant)/merchant/layout.tsx`

Topbar actuel (pour référence) :
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
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
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

- [ ] **Step 1 : Remplacer `components/layout/Topbar.tsx`**

```tsx
"use client";
import { LangSwitcher } from "./LangSwitcher";
import { NotificationBell } from "./NotificationBell";
import type { NotifRole } from "@/lib/store/notifications";

interface Props {
  breadcrumb: string;
  userName: string;
  role: NotifRole;
}

export function Topbar({ breadcrumb, userName, role }: Props) {
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
      <div className="text-sm font-display font-semibold text-ink-900">{breadcrumb}</div>
      <div className="flex items-center gap-4">
        <LangSwitcher />
        <NotificationBell role={role} />
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

- [ ] **Step 2 : Mettre à jour `app/(admin)/admin/layout.tsx`**

Remplacer :
```tsx
<Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} notifications={3} />
```
Par :
```tsx
<Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} role="admin" />
```

- [ ] **Step 3 : Mettre à jour `app/(merchant)/merchant/layout.tsx`**

Remplacer :
```tsx
<Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} notifications={1} />
```
Par :
```tsx
<Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} role="merchant" />
```

- [ ] **Step 4 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 5 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur.

- [ ] **Step 6 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add components/layout/Topbar.tsx "app/(admin)/admin/layout.tsx" "app/(merchant)/merchant/layout.tsx" && git commit -m "feat(notifications): Topbar branché sur NotificationBell — role-based" && git tag v1.1.0-tranche-K
```
