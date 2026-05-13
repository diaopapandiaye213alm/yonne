"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n";
import {
  Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut,
  Bell, HeadphonesIcon, Trophy, MapPin, Umbrella, GitMerge, Users, Gift,
  PiggyBank, Moon, Leaf, Code2, Bot
} from "lucide-react";

type NavItem = {
  href: string;
  icon: React.ElementType;
  badge?: string;
} & ({ key: StringKey; label?: never } | { label: string; key?: never });

type Section = { title?: string; items: NavItem[] };

const sections: Section[] = [
  {
    items: [
      { href: "/admin",           key: "navHome",      icon: Home },
      { href: "/admin/commandes", key: "navOrders",    icon: Package },
      { href: "/admin/livreurs",  key: "navDrivers",   icon: Bike },
      { href: "/admin/marchands", key: "navMerchants", icon: Store },
      { href: "/admin/finance",   key: "navFinance",   icon: Wallet },
      { href: "/admin/analytics", key: "navAnalytics", icon: BarChart3 },
      { href: "/admin/surge",     key: "navSurge",     icon: Zap },
      { href: "/admin/tabaski",   key: "navTabaski",   icon: Sparkles, badge: "J-7" },
    ],
  },
  {
    title: "Communications",
    items: [
      { href: "/admin/notifications", label: "Notifications",  icon: Bell },
      { href: "/admin/sav",           label: "SAV & Incidents", icon: HeadphonesIcon },
      { href: "/admin/bot",           label: "Bot WhatsApp",   icon: Bot },
    ],
  },
  {
    title: "Opérations",
    items: [
      { href: "/admin/groupage",   label: "Groupage",    icon: GitMerge },
      { href: "/admin/landmarks",  label: "Landmarks",   icon: MapPin },
      { href: "/admin/fidelite",   label: "Fidélité",    icon: Trophy },
      { href: "/admin/parrainage", label: "Parrainage",  icon: Gift },
      { href: "/admin/tontine",    label: "Tontine",     icon: PiggyBank },
    ],
  },
  {
    title: "Sénégal",
    items: [
      { href: "/admin/priere",   label: "Heures de prière", icon: Moon },
      { href: "/admin/hivernage", label: "Hivernage",       icon: Umbrella },
      { href: "/admin/carbone",  label: "Score CO₂",        icon: Leaf },
    ],
  },
  {
    title: "Système",
    items: [
      { href: "/admin/api",      label: "API & Webhooks",   icon: Code2 },
      { href: "/admin/settings", key: "navSettings",        icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useT();

  return (
    <aside className="w-60 shrink-0 bg-emerald-900 flex flex-col overflow-y-auto">
      <div className="h-16 px-5 flex items-center border-b border-emerald-800 shrink-0">
        <Link href="/admin"><Wordmark size="md" variant="dark" /></Link>
      </div>

      <nav className="flex-1 p-3 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-600/70">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, badge, key, label }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                const text = key ? t(key) : (label ?? "");
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
                    <span className="flex-1">{text}</span>
                    {badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded-sm bg-gold-500 text-ink-900 font-bold">{badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-emerald-800 shrink-0">
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
