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
