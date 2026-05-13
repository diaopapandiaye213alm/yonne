"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut } from "lucide-react";
import type { StringKey } from "@/lib/i18n";

const items: { href: string; key: StringKey; icon: React.ElementType; badge?: string }[] = [
  { href: "/admin",           key: "navHome",      icon: Home },
  { href: "/admin/commandes", key: "navOrders",    icon: Package },
  { href: "/admin/livreurs",  key: "navDrivers",   icon: Bike },
  { href: "/admin/marchands", key: "navMerchants", icon: Store },
  { href: "/admin/finance",   key: "navFinance",   icon: Wallet },
  { href: "/admin/analytics", key: "navAnalytics", icon: BarChart3 },
  { href: "/admin/surge",     key: "navSurge",     icon: Zap },
  { href: "/admin/tabaski",   key: "navTabaski",   icon: Sparkles, badge: "J-7" },
  { href: "/admin/settings",  key: "navSettings",  icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useT();
  return (
    <aside className="w-60 shrink-0 bg-emerald-900 flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-emerald-800">
        <Link href="/admin"><Wordmark size="md" variant="dark" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, key, icon: Icon, badge }) => {
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
              <span className="flex-1">{t(key)}</span>
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
            <LogOut className="w-4 h-4" /> {t("navLogout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
