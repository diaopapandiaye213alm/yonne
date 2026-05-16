"use client";
import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useOrdersStore } from "@/lib/store/orders";
import { useSession } from "@/lib/hooks/useSession";
import { Package, TrendingUp, CheckCircle2, PlusSquare, Clock } from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import { toast } from "sonner";

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-card p-5 space-y-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton w-24 h-8 rounded-md" />
      <div className="skeleton w-32 h-3 rounded" />
      <div className="skeleton w-20 h-3 rounded" />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
  "annulée":  "bg-red-100 text-red-600",
};

export default function MerchantAccueilPage() {
  const t    = useT();
  const lang = useLang(s => s.lang);
  const session       = useSession();
  const { merchants } = useMerchantsStore();
  const { orders }    = useOrdersStore();

  const { loading } = useOrdersStore();

  const merchant = useMemo(() => {
    const byEmail = session?.email ? merchants.find(m => m.email === session.email) : null;
    return byEmail ?? merchants[0] ?? { name: "—", plan: "Standard", ordersThisMonth: 0, revenueThisMonth: 0, ordersLastMonth: 1, revenueLastMonth: 1 };
  }, [merchants, session?.email]);
  const delivered = orders.filter(o => o.status === "livrée").length;
  const tauxLivre = orders.length > 0 ? Math.round(delivered / orders.length * 100) : 0;
  const recent    = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const deltaOrders  = merchant.ordersLastMonth  > 0 ? Math.round((merchant.ordersThisMonth  - merchant.ordersLastMonth)  / merchant.ordersLastMonth  * 100) : 0;
  const deltaRevenue = merchant.revenueLastMonth > 0 ? Math.round((merchant.revenueThisMonth - merchant.revenueLastMonth) / merchant.revenueLastMonth * 100) : 0;

  // Notifier le marchand quand une nouvelle commande arrive en temps réel
  const prevCountRef = useRef(orders.length);
  useEffect(() => {
    const prev = prevCountRef.current;
    if (orders.length > prev) {
      const newest = orders[0];
      if (newest) {
        toast(`📦 Nouvelle commande — ${newest.id}`, {
          description: `${newest.clientName} · ${newest.amount.toLocaleString("fr-FR")} F`,
          duration: 5000,
        });
      }
    }
    prevCountRef.current = orders.length;
  }, [orders]);
  const tauxLivreLastMonth = Math.round(tauxLivre * (0.92 + (merchant.ordersLastMonth % 10) / 100));
  const deltaTaux = tauxLivre - tauxLivreLastMonth;

  const dateStr = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" });

  function Delta({ pct }: { pct: number }) {
    const up = pct >= 0;
    return (
      <span className={`text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
        {up ? "↑" : "↓"} {up ? "+" : ""}{pct}% {t("vsLastMonth")}
      </span>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in-up">

      {/* ── Greeting header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 p-6 shadow-glow-emerald">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,146,76,0.18)_0%,transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="merchant-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#merchant-dots)" />
          </svg>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
              <span className="capitalize">{dateStr}</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white leading-tight">{t("goodMorning")}, <span className="text-gold-300">{merchant.name}</span> 👋</h1>
            <p className="text-emerald-200/60 text-sm mt-1">Plan {merchant.plan} · Commission {merchant.plan === "Premium" ? "12%" : "15%"}</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-300/80" />
            <span className="text-white/80 text-sm font-mono font-medium">{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          [
            { label: t("ordersThisMonth"),  value: String(merchant.ordersThisMonth),                         icon: Package,      delta: deltaOrders,  chip: "bg-emerald-100 text-emerald-600", border: "border-emerald-100", strip: "bg-gradient-to-r from-emerald-500 to-emerald-400" },
            { label: t("revenueThisMonth"), value: `${merchant.revenueThisMonth.toLocaleString("fr-FR")} F`, icon: TrendingUp,   delta: deltaRevenue, chip: "bg-gold-500/15 text-gold-600",     border: "border-gold-300/40", strip: "bg-gradient-to-r from-gold-500 to-gold-400" },
            { label: t("deliveryRate"),     value: `${tauxLivre}%`,                                          icon: CheckCircle2, delta: deltaTaux,    chip: "bg-blue-100 text-blue-600",        border: "border-blue-100",    strip: "bg-gradient-to-r from-blue-500 to-blue-400" },
          ].map(({ label, value, icon: Icon, delta, chip, border, strip }, idx) => (
            <div key={label} className={`relative bg-white rounded-xl border ${border} shadow-card p-5 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden stagger-${idx + 1} animate-fade-in-up`}>
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl ${strip}`} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${chip}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
              <div className="text-xs text-ink-500 mt-1">{label}</div>
              <div className="mt-2.5"><Delta pct={delta} /></div>
            </div>
          ))
        )}
      </div>

      <Link
        href="/merchant/nouvelle-commande"
        className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 px-6 font-display font-bold text-base transition-all shadow-glow-emerald hover:scale-[1.01] hover:shadow-lg group"
      >
        <PlusSquare className="w-5 h-5 group-hover:animate-pulse" />
        {t("newOrder")}
        <span className="ml-1 text-emerald-200/70 font-normal text-sm hidden sm:inline">— en 30 secondes</span>
      </Link>

      <div className="bg-white rounded-xl border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">{t("recentOrders")}</h2>
          <Link href="/merchant/commandes" className="text-xs text-emerald-600 hover:underline font-medium">Voir tout →</Link>
        </div>
        <div className="divide-y divide-cream-100">
          {recent.map(o => {
            const dotColor: Record<string, string> = {
              "créée":    "bg-gray-400",
              "assignée": "bg-blue-400",
              "collecte": "bg-amber-400",
              "en route": "bg-gold-500",
              "livrée":   "bg-emerald-500",
              "annulée":  "bg-red-400",
            };
            return (
              <Link
                key={o.id}
                href={`/merchant/commande/${o.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-50 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[o.status] ?? "bg-gray-300"}`} />
                <span className="font-mono text-xs text-emerald-500 shrink-0">{o.id}</span>
                <span className="text-sm text-ink-700 flex-1 min-w-0 truncate">{o.clientName}</span>
                <span className="text-sm font-bold tabular-nums text-ink-900 shrink-0">{o.amount.toLocaleString("fr-FR")} F</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[o.status]}`}>{o.status}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
