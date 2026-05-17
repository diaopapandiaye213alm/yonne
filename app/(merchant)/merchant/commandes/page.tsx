"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrdersStore } from "@/lib/store/orders";
import { useT } from "@/lib/i18n";
import { FilterBar, FilterDef } from "@/components/admin/FilterBar";
import { downloadCsv } from "@/lib/utils/csv";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { OrderListSkeleton, KpiCardSkeleton } from "@/components/ui/OrderSkeleton";
import { InlineErrorBanner } from "@/components/driver/OfflineBanner";
import {
  Package, Truck, CheckCircle2, Banknote, MapPin, Share2, RotateCcw,
  X, ExternalLink, Clock, CreditCard, ChevronRight, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":                  "bg-gray-100 text-gray-700",
  "en_attente_de_paiement": "bg-amber-100 text-amber-700",
  "payée_a_collecter":      "bg-emerald-100 text-emerald-700",
  "assignée":               "bg-blue-100 text-blue-700",
  "collecte":               "bg-amber-100 text-amber-700",
  "en route":               "bg-gold-500/20 text-ink-900",
  "livrée":                 "bg-emerald-500/20 text-emerald-700",
  "annulée":                "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  "créée":                  "Créée",
  "en_attente_de_paiement": "Att. paiement",
  "payée_a_collecter":      "Payée",
  "assignée":               "Assignée",
  "collecte":               "Collecte",
  "en route":               "En route",
  "livrée":                 "Livrée",
  "annulée":                "Annulée",
};

const PAY_LABELS: Record<string, string> = {
  wave:    "Wave",
  orange:  "Orange Money",
  cash:    "Cash",
  paytech: "PayTech",
};

const FILTERS: FilterDef[] = [
  { key: "status", label: "Statut", options: [
    { label: "Tous",           value: "" },
    { label: "Créée",          value: "créée" },
    { label: "Att. paiement",  value: "en_attente_de_paiement" },
    { label: "Payée",          value: "payée_a_collecter" },
    { label: "Assignée",       value: "assignée" },
    { label: "Collecte",       value: "collecte" },
    { label: "En route",       value: "en route" },
    { label: "Livrée",         value: "livrée" },
    { label: "Annulée",        value: "annulée" },
  ]},
];

const STATUS_QUICK: { label: string; value: OrderStatus | ""; color: string }[] = [
  { label: "Tous",      value: "",                    color: "bg-cream-100 text-ink-600" },
  { label: "En route",  value: "en route",            color: "bg-gold-500/20 text-ink-900" },
  { label: "Livrée",    value: "livrée",              color: "bg-emerald-500/20 text-emerald-700" },
  { label: "Payée",     value: "payée_a_collecter",   color: "bg-emerald-100 text-emerald-700" },
  { label: "Collecte",  value: "collecte",            color: "bg-amber-100 text-amber-700" },
  { label: "Assignée",  value: "assignée",            color: "bg-blue-100 text-blue-700" },
  { label: "Annulée",   value: "annulée",             color: "bg-red-100 text-red-600" },
];

// ── Bottom Sheet : détails d'une commande ────────────────────────────────────
interface OrderBottomSheetProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  trackingBase: string;
}

function OrderBottomSheet({ order, open, onClose, onNavigate, trackingBase }: OrderBottomSheetProps) {
  // Fermeture sur swipe vers le bas (touch)
  const startY = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const isDragging = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    (startY as [number, (v: number) => void])[1](e.touches[0].clientY);
    (isDragging as [boolean, (v: boolean) => void])[1](true);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!(isDragging as [boolean, (v: boolean) => void])[0]) return;
    const delta = e.touches[0].clientY - (startY as [number, (v: number) => void])[0];
    if (delta > 0) setDragDelta(delta);
  }
  function onTouchEnd() {
    if (dragDelta > 80) onClose();
    setDragDelta(0);
    (isDragging as [boolean, (v: boolean) => void])[1](false);
  }

  // Fermeture clavier Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && open) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Blocage du scroll arrière-plan quand ouvert
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!order) return null;

  const isActive = ["assignée", "collecte", "en route", "payée_a_collecter"].includes(order.status);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Commande ${order.id}`}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "rounded-t-3xl bg-white shadow-2xl",
          "transition-transform duration-300 ease-out will-change-transform",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ transform: open ? `translateY(${dragDelta}px)` : "translateY(100%)" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Handle visuel + drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-ink-300" />
        </div>

        <div className="px-5 pb-8 space-y-5 max-h-[85dvh] overflow-y-auto overscroll-contain">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-ink-500 font-mono">{order.id}</p>
              <h2 className="font-display font-bold text-xl text-ink-900 mt-0.5">
                {order.clientName}
              </h2>
              <span className={cn(
                "inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold",
                STATUS_COLORS[order.status]
              )}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-cream-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-ink-400" />
            </button>
          </div>

          {/* Grille infos */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCell
              icon={<Phone className="w-4 h-4 text-emerald-500" />}
              label="Téléphone"
              value={order.clientPhone || "—"}
            />
            <InfoCell
              icon={<CreditCard className="w-4 h-4 text-blue-500" />}
              label="Paiement"
              value={PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
            />
            <InfoCell
              icon={<Banknote className="w-4 h-4 text-gold-500" />}
              label="Montant"
              value={`${order.amount.toLocaleString("fr-FR")} F`}
            />
            <InfoCell
              icon={<Clock className="w-4 h-4 text-ink-400" />}
              label="Date"
              value={new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            />
          </div>

          {/* Assurance */}
          {order.insurance && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs font-semibold text-emerald-700">Colis assuré jusqu'à 50 000 F</p>
            </div>
          )}

          {/* CTA principal */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigate(order.id)}
              className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all duration-100 shadow-glow-emerald"
            >
              Voir le suivi complet
              <ChevronRight className="w-5 h-5" />
            </button>

            {isActive && (
              <div className="flex gap-2">
                <a
                  href={`/suivi/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 rounded-xl border border-cream-200 text-ink-700 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-cream-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-ink-400" />
                  Suivi client
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(`${trackingBase}/suivi/${order.id}`)
                      .then(() => toast.success("Lien copié !"))
                      .catch(() => toast.error("Impossible de copier le lien"));
                  }}
                  className="h-11 px-4 rounded-xl border border-cream-200 text-ink-600 text-sm font-medium flex items-center gap-1.5 hover:bg-cream-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Copier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-cream-50 border border-cream-200 px-3 py-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-ink-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-semibold text-ink-900 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesCommandesPage() {
  const t                              = useT();
  const { orders, loading, error, fetchOrders } = useOrdersStore();
  const router                         = useRouter();
  const [search,        setSearch]     = useState("");
  const [filters,       setFilters]    = useState<Record<string, string>>({});
  const [quickStatus,   setQuickStatus]= useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen,     setSheetOpen]  = useState(false);

  const trackingBase = typeof window !== "undefined" ? window.location.origin : "";

  // Déclenche un re-fetch si les données sont absentes
  useEffect(() => {
    if (orders.length === 0 && !loading) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const kpis = useMemo(() => {
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    return {
      total:    orders.length,
      enRoute:  orders.filter(o => o.status === "en route").length,
      livrees:  orders.filter(o => o.status === "livrée").length,
      revToday: todayOrders.reduce((s, o) => s + o.amount, 0),
    };
  }, [orders, today]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const activeStatus = quickStatus || filters.status || "";
    return orders.filter(o => {
      const q           = search.toLowerCase();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
      const matchStatus = !activeStatus || o.status === activeStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filters, quickStatus]);

  function openSheet(order: Order) {
    setSelectedOrder(order);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  }

  const handleNavigate = useCallback((id: string) => {
    closeSheet();
    router.push(`/merchant/commande/${id}`);
  }, [router]);

  function handleExport() {
    downloadCsv("mes-commandes.csv", filtered.map(o => ({
      id: o.id, client: o.clientName, statut: o.status,
      paiement: o.paymentMethod, montant: o.amount,
      date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
    })));
  }

  function handleReset() {
    setSearch("");
    setFilters({});
    setQuickStatus("");
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("navMyOrders")}</h1>
          <p className="text-sm text-ink-500 mt-1">
            {loading ? "Chargement…" : `${orders.length} ${t("ordersTotal")}`}
          </p>
        </div>

        {/* Erreur réseau localisée */}
        {error && !loading && (
          <InlineErrorBanner
            message="Impossible de joindre le serveur. Vos données locales sont affichées."
            onRetry={() => void fetchOrders()}
          />
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading && orders.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : (
            <>
              <KpiCard icon={<Package className="w-5 h-5 text-ink-400" />}
                value={kpis.total} label={t("totalOrders")} />
              <KpiCard icon={<Truck className="w-5 h-5 text-gold-500" />}
                value={kpis.enRoute} label={t("enRouteLabel")} accent="gold" />
              <KpiCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                value={kpis.livrees} label={t("livreesLabel")} accent="emerald" />
              <KpiCard icon={<Banknote className="w-5 h-5 text-gold-500" />}
                value={kpis.revToday.toLocaleString("fr-FR")} label={t("revenuToday")} suffix="F" />
            </>
          )}
        </div>

        {/* Quick-filter status bubbles */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_QUICK.map(s => {
            const count = s.value === "" ? orders.length : (statusCounts[s.value] ?? 0);
            const active = quickStatus === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => { setQuickStatus(s.value); setFilters({}); }}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all",
                  s.color,
                  active ? "ring-2 ring-offset-1 ring-current" : "opacity-70 hover:opacity-100"
                )}
              >
                {s.label}
                <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <FilterBar
            search={search} onSearch={setSearch}
            filters={FILTERS} values={filters}
            onFilter={(k, v) => { setFilters(prev => ({ ...prev, [k]: v })); setQuickStatus(""); }}
            onExport={handleExport}
          />
          <p className="text-xs text-ink-400 mt-2">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Liste des commandes */}
        {loading && orders.length === 0 ? (
          <OrderListSkeleton rows={8} />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-cream-200 bg-white shadow-card p-12 text-center">
            <Package className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="font-display font-semibold text-ink-700">Aucune commande trouvée</p>
            <p className="text-sm text-ink-400 mt-1">Essayez de modifier le statut ou la recherche.</p>
            <button
              type="button" onClick={handleReset}
              className="mt-4 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-cream-200 bg-white shadow-card overflow-hidden">
            {/* En-tête desktop uniquement */}
            <div className="hidden md:grid grid-cols-[180px_1fr_130px_100px_110px_120px_44px] gap-x-3 px-4 py-2.5 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-ink-500 uppercase tracking-wide">
              <span>ID</span><span>Client</span><span>Statut</span>
              <span>Paiement</span><span>Montant</span><span>Date</span><span />
            </div>

            {filtered.map((order, idx) => (
              <OrderRow
                key={order.id}
                order={order}
                isLast={idx === filtered.length - 1}
                trackingBase={trackingBase}
                onOpenSheet={openSheet}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <OrderBottomSheet
        order={selectedOrder}
        open={sheetOpen}
        onClose={closeSheet}
        onNavigate={handleNavigate}
        trackingBase={trackingBase}
      />
    </>
  );
}

// ── Composants internes ───────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  accent?: "gold" | "emerald";
  suffix?: string;
}

function KpiCard({ icon, value, label, accent, suffix }: KpiCardProps) {
  const borderColor = accent === "emerald" ? "border-emerald-200"
                    : accent === "gold"    ? "border-gold-500/30"
                    : "border-cream-200";
  const textColor   = accent === "emerald" ? "text-emerald-600" : "text-ink-900";
  return (
    <div className={cn(
      "animate-fade-in-up bg-white rounded-xl border shadow-card p-4 flex items-start gap-3",
      borderColor
    )}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className={cn("text-2xl font-display font-bold tabular-nums", textColor)}>
          {value}{suffix && <span className="text-sm font-normal text-ink-500 ml-0.5">{suffix}</span>}
        </div>
        <div className="text-xs text-ink-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

interface OrderRowProps {
  order: Order;
  isLast: boolean;
  trackingBase: string;
  onOpenSheet: (o: Order) => void;
  onNavigate: (id: string) => void;
}

function OrderRow({ order, isLast, trackingBase, onOpenSheet, onNavigate }: OrderRowProps) {
  const isActive = ["assignée", "collecte", "en route", "payée_a_collecter"].includes(order.status);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 cursor-pointer",
        "hover:bg-cream-50 active:bg-cream-100 transition-colors duration-100",
        !isLast && "border-b border-cream-200",
      )}
      onClick={() => onOpenSheet(order)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpenSheet(order)}
    >
      {/* ID */}
      <span className="font-mono text-xs text-emerald-600 shrink-0 w-[160px] truncate hidden md:block">
        {order.id}
      </span>

      {/* Client (visible mobile) */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{order.clientName}</p>
        <p className="text-xs text-ink-500 md:hidden">
          {order.amount.toLocaleString("fr-FR")} F · {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </p>
      </div>

      {/* Statut */}
      <span className={cn(
        "shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-semibold",
        STATUS_COLORS[order.status]
      )}>
        {STATUS_LABELS[order.status]}
      </span>

      {/* Desktop-only cols */}
      <span className="hidden md:block w-[100px] text-xs text-ink-600 shrink-0">
        {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
      </span>
      <span className="hidden md:block w-[110px] text-sm font-semibold text-ink-900 tabular-nums shrink-0">
        {order.amount.toLocaleString("fr-FR")} F
      </span>
      <span className="hidden md:block w-[120px] text-xs text-ink-500 shrink-0">
        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit", month: "2-digit",
          hour: "2-digit", minute: "2-digit",
        })}
      </span>

      {/* Actions rapides — visibles au hover (desktop) / toujours (mobile) */}
      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
        {isActive && (
          <a
            href={`/suivi/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Suivi client"
            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          type="button"
          title="Copier le lien"
          onClick={() => {
            navigator.clipboard
              .writeText(`${trackingBase}/suivi/${order.id}`)
              .then(() => toast.success("Lien copié !"))
              .catch(() => toast.error("Impossible de copier le lien"));
          }}
          className="p-1.5 rounded-md text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Re-commander"
          onClick={e => {
            e.stopPropagation();
            try {
              localStorage.setItem("yonne_prefill_order", JSON.stringify({
                clientName: order.clientName, clientPhone: order.clientPhone,
                landmarkId: (order as { landmarkId?: string }).landmarkId ?? "",
                amount: order.amount,
              }));
            } catch { /* ignore */ }
            onNavigate("/merchant/nouvelle-commande");
          }}
          className="p-1.5 rounded-md text-ink-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors ml-0.5" />
      </div>
    </div>
  );
}
