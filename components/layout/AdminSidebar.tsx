"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/admin",           label: "Accueil",      icon: Home },
  { href: "/admin/commandes", label: "Commandes",    icon: Package },
  { href: "/admin/livreurs",  label: "Livreurs",     icon: Bike },
  { href: "/admin/marchands", label: "Commerçants",  icon: Store },
  { href: "/admin/finance",   label: "Finance",      icon: Wallet },
  { href: "/admin/analytics", label: "Analytics",    icon: BarChart3 },
  { href: "/admin/surge",     label: "Surge",        icon: Zap },
  { href: "/admin/tabaski",   label: "Tabaski",      icon: Sparkles, badge: "J-7" },
  { href: "/admin/settings",  label: "Paramètres",   icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-emerald-900 flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-emerald-800">
        <Link href="/admin"><Wordmark size="md" variant="dark" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
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
              <span className="flex-1">{label}</span>
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
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
