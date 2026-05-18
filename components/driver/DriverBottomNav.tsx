"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Package, Wallet, User, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDriverStore } from "@/lib/store/driver";
import { useT } from "@/lib/i18n";
import type { StringKey } from "@/lib/i18n";

const tabs: { href: string; labelKey: StringKey; icon: React.ElementType }[] = [
  { href: "/driver/carte",      labelKey: "navCarte",      icon: Map     },
  { href: "/driver/gains",      labelKey: "navGains",      icon: Wallet  },
  { href: "/driver/classement", labelKey: "navClassement", icon: Trophy  },
  { href: "/driver/profil",     labelKey: "navProfil",     icon: User    },
] as const;

export function DriverBottomNav() {
  const pathname      = usePathname();
  const activeOrderId = useDriverStore((s) => s.activeOrderId);
  const t             = useT();

  const livraisonHref   = activeOrderId ? `/driver/livraison/${activeOrderId}` : "/driver/carte";
  const livraisonActive = pathname.startsWith("/driver/livraison");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-cream-200 max-w-sm mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14">
        {/* Carte tab */}
        {tabs.slice(0, 1).map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                active ? "text-emerald-500" : "text-ink-500 hover:text-ink-700"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {t(tab.labelKey)}
            </Link>
          );
        })}

        {/* Livraison tab (dynamic href) */}
        <Link
          href={livraisonHref}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
            livraisonActive ? "text-emerald-500" : "text-ink-500 hover:text-ink-700"
          )}
        >
          <Package className="w-5 h-5" />
          {t("navLivraison")}
        </Link>

        {/* Remaining tabs */}
        {tabs.slice(1).map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                active ? "text-emerald-500" : "text-ink-500 hover:text-ink-700"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
