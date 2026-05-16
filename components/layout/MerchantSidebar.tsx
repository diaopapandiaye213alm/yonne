"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { Home, PlusSquare, ListOrdered, Wallet, Settings, LogOut, BookOpen, BarChart3, Rocket, ShieldAlert } from "lucide-react";
import type { StringKey } from "@/lib/i18n";

const items: { href: string; key: StringKey; icon: React.ElementType }[] = [
  { href: "/merchant",                    key: "navHome",     icon: Home },
  { href: "/merchant/nouvelle-commande",  key: "navNewOrder", icon: PlusSquare },
  { href: "/merchant/commandes",          key: "navMyOrders", icon: ListOrdered },
  { href: "/merchant/analytics",           key: "navAnalytics",  icon: BarChart3 },
  { href: "/merchant/catalogue",           key: "navCatalogue", icon: BookOpen },
  { href: "/merchant/finances",           key: "navFinances", icon: Wallet },
  { href: "/merchant/sinistre",            key: "navSinistre", icon: ShieldAlert },
  { href: "/merchant/parametres",         key: "navParams",   icon: Settings },
  { href: "/merchant/onboarding",         key: "navOnboarding", icon: Rocket },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  const t = useT();
  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-navy-900 flex-col">
      <div className="h-16 px-5 flex items-center border-b border-navy-800">
        <Link href="/merchant"><Wordmark size="md" variant="dark" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== "/merchant" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "border-l-2 border-gold-400 bg-gold-500/10 text-gold-400 pl-[calc(0.75rem-2px)] pr-3"
                  : "text-navy-400 hover:text-cream-50 hover:bg-navy-800 px-3"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold-400" : "text-navy-500")} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-navy-800 space-y-3">
        <LangSwitcher variant="dark" />
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-navy-400 hover:text-cream-50 hover:bg-navy-800 w-full text-left cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t("navLogout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
