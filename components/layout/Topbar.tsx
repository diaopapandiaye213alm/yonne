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
