"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Package, Wallet, User, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDriverStore } from "@/lib/store/driver";

const tabs = [
  { href: "/driver/carte",       label: "Carte",       icon: Map     },
  { href: "/driver/gains",       label: "Gains",       icon: Wallet  },
  { href: "/driver/classement",  label: "Classement",  icon: Trophy  },
  { href: "/driver/profil",      label: "Profil",      icon: User    },
] as const;

export function DriverBottomNav() {
  const pathname = usePathname();
  const activeOrderId = useDriverStore((s) => s.activeOrderId);

  const livraisonHref = activeOrderId
    ? `/driver/livraison/${activeOrderId}`
    : "/driver/carte";

  const livraisonActive = pathname.startsWith("/driver/livraison");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-cream-200 max-w-sm mx-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-14">
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
              {tab.label}
            </Link>
          );
        })}

        <Link
          href={livraisonHref}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
            livraisonActive ? "text-emerald-500" : "text-ink-500 hover:text-ink-700"
          )}
        >
          <Package className="w-5 h-5" />
          Livraison
        </Link>

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
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
