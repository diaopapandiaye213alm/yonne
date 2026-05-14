"use client";
import { LangSwitcher } from "./LangSwitcher";
import { NotificationBell } from "./NotificationBell";
import type { NotifRole } from "@/lib/store/notifications";
import { LogOut } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <LangSwitcher />
        <NotificationBell role={role} />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-900 hidden sm:block">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-cream-50 text-sm font-bold flex items-center justify-center ring-2 ring-gold-500/60 ring-offset-1">
            {initials}
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            title="Se déconnecter"
            className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
