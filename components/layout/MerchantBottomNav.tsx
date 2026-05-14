"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, ListOrdered, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n";

const items: { href: string; key: StringKey; icon: React.ElementType }[] = [
  { href: "/merchant",                   key: "navHome",     icon: Home },
  { href: "/merchant/nouvelle-commande", key: "navNewOrder", icon: PlusSquare },
  { href: "/merchant/commandes",         key: "navMyOrders", icon: ListOrdered },
  { href: "/merchant/finances",          key: "navFinances", icon: Wallet },
  { href: "/merchant/parametres",        key: "navParams",   icon: Settings },
];

export function MerchantBottomNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-cream-200 flex z-50 safe-area-bottom">
      {items.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || (href !== "/merchant" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors",
              active ? "text-emerald-600" : "text-ink-400 hover:text-ink-600"
            )}
          >
            <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span className="text-[9px] font-semibold leading-none">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
