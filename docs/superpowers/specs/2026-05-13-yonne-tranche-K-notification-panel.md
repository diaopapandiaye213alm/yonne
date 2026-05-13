# Tranche K — Panneau Notifications

## Contexte

La topbar admin et marchand affiche une icône cloche avec un badge hardcodé (`notifications={3}` / `notifications={1}`). Le bouton est inerte — aucun dropdown, aucune vraie donnée. Cette tranche branche les notifications sur un store Zustand et ouvre un panneau au clic.

## Objectif

- Icône cloche interactive dans la topbar (admin + marchand)
- Badge rouge = nombre de notifications non-lues pour le rôle courant
- Click → dropdown listant les notifications
- Click sur une notif → marquer comme lue
- Bouton "Tout marquer comme lu"
- Données mockées, reset à chaque chargement (pas de persistance localStorage)

## Architecture

Trois fichiers modifiés, deux créés :

```
lib/store/notifications.ts                      ← Créer — Zustand store
components/layout/NotificationBell.tsx          ← Créer — composant cloche + dropdown
components/layout/Topbar.tsx                    ← Modifier — remplacer button Bell statique
app/(admin)/admin/layout.tsx                    ← Modifier — ajouter role="admin"
app/(merchant)/merchant/layout.tsx              ← Modifier — ajouter role="merchant"
```

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/store/notifications.ts` | Créer — store + mock data |
| `components/layout/NotificationBell.tsx` | Créer — cloche + dropdown |
| `components/layout/Topbar.tsx` | Modifier — prop `role`, retire `notifications` |
| `app/(admin)/admin/layout.tsx` | Modifier — `role="admin"` |
| `app/(merchant)/merchant/layout.tsx` | Modifier — `role="merchant"` |

---

## `lib/store/notifications.ts`

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
  { id: "n1", role: "admin",    title: "Nouvelle commande",    body: "CMD-0042 créée par Chez Aminata",        time: "il y a 2 min",  read: false, icon: "order"  },
  { id: "n2", role: "admin",    title: "Livreur hors ligne",   body: "Moussa Diallo s'est déconnecté",         time: "il y a 8 min",  read: false, icon: "driver" },
  { id: "n3", role: "admin",    title: "Surge activé",         body: "Zone Plateau — x1.4 depuis 14h30",       time: "il y a 15 min", read: true,  icon: "surge"  },
  { id: "n4", role: "merchant", title: "Commande en route",    body: "CMD-0042 — livreur en chemin vers vous", time: "il y a 3 min",  read: false, icon: "status" },
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

---

## `components/layout/NotificationBell.tsx`

Client Component. Props : `role: NotifRole`.

Comportement :
- Lit `useNotificationsStore`, filtre par `role`
- `unread` = count des notifs non-lues pour ce rôle
- `open` state (boolean) — toggle au click sur la cloche
- Fermeture au click en dehors via `useEffect` + `mousedown` listener
- Badge rouge si `unread > 0`
- Dropdown (absolute, z-50) :
  - Header "Notifications" + bouton "Tout lire" (désactivé si `unread === 0`)
  - Liste : chaque notif avec icône Lucide, fond `bg-cream-50` si non-lue, `bg-white` si lue, click → `markRead(id)`
  - Icônes par type : `order` → `Package`, `status` → `Truck`, `driver` → `User`, `surge` → `Zap`
  - Si liste vide : message "Aucune notification"

---

## `components/layout/Topbar.tsx`

Modification :
- Retirer le prop `notifications?: number`
- Ajouter le prop `role: "admin" | "merchant"`
- Remplacer le `<button>` Bell statique par `<NotificationBell role={role} />`

---

## Layouts

`app/(admin)/admin/layout.tsx` :
```tsx
<Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} role="admin" />
```

`app/(merchant)/merchant/layout.tsx` :
```tsx
<Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} role="merchant" />
```

---

## Non-objectifs (hors scope)

- Pas de persistance localStorage
- Pas de polling / websocket — données statiques
- Pas de notifications livreur (interface mobile, hors scope web)
- Pas de sons / push browser notifications
