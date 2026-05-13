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
