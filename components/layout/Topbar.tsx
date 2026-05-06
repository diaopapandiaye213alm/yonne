"use client";
import { Bell } from "lucide-react";
import { LangSwitcher } from "./LangSwitcher";

interface Props {
  breadcrumb: string;
  userName: string;
  notifications?: number;
}

export function Topbar({ breadcrumb, userName, notifications = 0 }: Props) {
  return (
    <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
      <div className="text-sm text-ink-500">{breadcrumb}</div>
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
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
          {userName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
