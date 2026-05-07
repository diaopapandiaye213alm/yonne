"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/admin",          label: "Accueil",       icon: Home },
  { href: "/admin/commandes",label: "Commandes",     icon: Package },
  { href: "/admin/livreurs", label: "Livreurs",      icon: Bike },
  { href: "/admin/marchands",label: "Commerçants",   icon: Store },
  { href: "/admin/finance",  label: "Finance",       icon: Wallet },
  { href: "/admin/analytics",label: "Analytics",     icon: BarChart3 },
  { href: "/admin/surge",    label: "Surge",         icon: Zap },
  { href: "/admin/tabaski",  label: "Tabaski",       icon: Sparkles, badge: "J-7" },
  { href: "/admin/settings", label: "Paramètres",    icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-cream-200 bg-white flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-cream-200">
        <Link href="/admin"><Wordmark size="md" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-emerald-500 text-white" : "text-ink-700 hover:bg-cream-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-sm bg-gold-500 text-ink-900 font-bold">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-cream-200">
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100 w-full">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
