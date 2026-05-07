"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, PlusSquare, ListOrdered, Wallet, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/merchant",                   label: "Accueil",          icon: Home },
  { href: "/merchant/nouvelle-commande", label: "Nouvelle commande",icon: PlusSquare },
  { href: "/merchant/commandes",         label: "Mes commandes",    icon: ListOrdered },
  { href: "/merchant/finances",          label: "Finances",         icon: Wallet },
  { href: "/merchant/parametres",        label: "Paramètres",       icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-cream-200 bg-white flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-cream-200">
        <Link href="/merchant"><Wordmark size="md" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/merchant" && pathname.startsWith(href));
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
              <span>{label}</span>
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
