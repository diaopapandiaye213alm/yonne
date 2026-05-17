"use client";
import { useState, useEffect, useRef } from "react";
import type { IncomingOrder } from "@/lib/mock-data/incoming-orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { Progress } from "@/components/ui/progress";
import { MapPin, Package, Navigation, Phone, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const paymentLabel: Record<IncomingOrder["paymentMethod"], string> = {
  wave:   "Wave",
  orange: "Orange",
  cash:   "Cash",
};
const paymentColor: Record<IncomingOrder["paymentMethod"], string> = {
  wave:   "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  cash:   "bg-cream-200 text-ink-700",
};

export interface BatchInfo {
  batchOrderId: string;
  distanceKm: number;
  totalAmount: number;
  secondaryClient: string;
}

interface Props {
  order: IncomingOrder;
  secondsLeft: number;
  onAccept: () => void;
  onRefuse: () => void;
  batchInfo?: BatchInfo;
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-ink-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-ink-900 truncate">{value}</span>
    </div>
  );
}

export function IncomingOrderCard({ order, secondsLeft, onAccept, onRefuse, batchInfo }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const startY      = useRef<number>(0);
  const [dragDelta, setDragDelta] = useState(0);
  const isDragging  = useRef(false);

  const dest    = landmarks.find((l) => l.id === order.destLandmarkId);
  const pickup  = landmarks.find((l) => l.id === order.pickupLandmarkId);
  const urgent  = secondsLeft <= 10;
  const displayAmount = batchInfo ? batchInfo.totalAmount : order.amount;

  // Keyboard dismiss
  useEffect(() => {
    if (!showDetails) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setShowDetails(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showDetails]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = showDetails ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDetails]);

  function handleTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    isDragging.current = false;
    setDragDelta(0);
  }
  function handleTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 4) { isDragging.current = true; }
    if (delta > 0) setDragDelta(delta);
  }
  function handleTouchEnd() {
    if (dragDelta > 80) {
      setShowDetails(false);
    }
    setDragDelta(0);
  }

  const sheetStyle = dragDelta > 0
    ? { transform: `translateY(${dragDelta}px)`, transition: "none" }
    : {};

  return (
    <>
      {/* ── Compact card ─────────────────────────────────────────────────── */}
      <div
        data-testid="order-card"
        className="bg-white rounded-t-2xl shadow-card-lg animate-in fade-in duration-200 overflow-hidden"
      >
        {/* Batch badge */}
        {batchInfo && (
          <div className="relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18)_0%,transparent_60%)] pointer-events-none" />
            <Package className="w-4 h-4 text-white shrink-0" />
            <span className="text-sm font-display font-bold text-white tracking-tight">
              Commande Groupée ×2
            </span>
            <span className="ml-auto text-xs text-emerald-100/80 font-medium">
              +{batchInfo.distanceKm.toFixed(1)} km
            </span>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header: client + payment + details button */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-ink-900 truncate">{order.clientName}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", paymentColor[order.paymentMethod])}>
                {paymentLabel[order.paymentMethod]}
              </span>
              <button
                type="button"
                aria-label="Voir les détails de la commande"
                onClick={() => setShowDetails(true)}
                className="w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center hover:bg-cream-200 transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-ink-500" />
              </button>
            </div>
          </div>

          {/* Destination */}
          {dest && (
            <div className="flex items-center gap-2 text-sm text-ink-700">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">
                {dest.name} · <span className="text-ink-500">{dest.quartier}</span>
              </span>
            </div>
          )}
          {batchInfo && (
            <div className="flex items-center gap-2 text-sm text-ink-500 pl-6">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">
                {batchInfo.secondaryClient} · <span className="text-ink-400">{batchInfo.distanceKm.toFixed(1)} km</span>
              </span>
            </div>
          )}

          {/* Amount + distance */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1.5 text-ink-500">
              <Navigation className="w-3.5 h-3.5" />
              <span className="text-sm">{order.distanceKm.toFixed(1)} km</span>
            </div>
            <span className={cn(
              "font-display font-extrabold tabular-nums leading-none",
              batchInfo ? "text-2xl text-emerald-600" : "text-xl text-ink-900",
            )}>
              {displayAmount.toLocaleString("fr-FR")} <span className="text-base font-bold">F</span>
            </span>
          </div>

          {/* Timer bar */}
          <div className="space-y-1">
            <span className={cn("text-xs font-medium block text-right", urgent ? "text-red-500" : "text-ink-500")}>
              {secondsLeft}s
            </span>
            <Progress
              value={(secondsLeft / 30) * 100}
              className={cn("h-1.5", urgent ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500")}
            />
          </div>
        </div>

        {/* Action zone */}
        <div className="px-4 pb-4 space-y-2">
          <button
            type="button"
            onClick={onAccept}
            className="w-full h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-display font-bold text-base shadow-glow-emerald active:scale-[0.98] transition-transform duration-100"
          >
            {batchInfo
              ? "Accepter ×2 — " + displayAmount.toLocaleString("fr-FR") + " F"
              : "Accepter la course"}
          </button>
          <button
            type="button"
            onClick={onRefuse}
            className="w-full py-2 text-sm text-ink-500 hover:text-red-500 transition-colors"
          >
            Refuser
          </button>
        </div>
      </div>

      {/* ── Detail bottom sheet ──────────────────────────────────────────── */}
      {showDetails && (
        <div className="fixed inset-0 z-[2000]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
            onClick={() => setShowDetails(false)}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-card-lg transition-transform duration-300 ease-out max-h-[85dvh] overflow-y-auto"
            style={sheetStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-cream-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200">
              <h2 className="text-base font-display font-bold text-ink-900">
                Détails de la commande
              </h2>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-ink-700" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-8 space-y-4">
              {/* Batch badge */}
              {batchInfo && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-700 truncate">
                      Commande groupée · {batchInfo.secondaryClient}
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      Total : {batchInfo.totalAmount.toLocaleString("fr-FR")} F · {batchInfo.distanceKm.toFixed(1)} km
                    </p>
                  </div>
                </div>
              )}

              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCell label="Client" value={order.clientName} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-ink-400 uppercase tracking-wider">Téléphone</span>
                  <a
                    href={`tel:${order.clientPhone}`}
                    className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Phone className="w-3 h-3 shrink-0" />
                    {order.clientPhone || "—"}
                  </a>
                </div>
              </div>

              {/* Route */}
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-0.5">Collecte</p>
                    <p className="text-sm font-semibold text-ink-900 truncate">{pickup?.name ?? "—"}</p>
                    <p className="text-xs text-ink-500">{pickup?.quartier ?? ""}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-0.5 pl-[5px]">
                    <div className="w-px h-full bg-cream-200 min-h-[12px]" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-ink-900 ring-2 ring-ink-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-0.5">Livraison</p>
                    <p className="text-sm font-semibold text-ink-900 truncate">{dest?.name ?? "—"}</p>
                    <p className="text-xs text-ink-500">{dest?.quartier ?? ""}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200">
                <InfoCell label="Distance" value={`${order.distanceKm.toFixed(1)} km`} />
                <InfoCell label="Montant" value={`${displayAmount.toLocaleString("fr-FR")} F`} />
                <InfoCell label="Paiement" value={paymentLabel[order.paymentMethod]} />
              </div>

              {/* Timer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-500">Temps restant</span>
                  <span className={cn("text-xs font-bold tabular-nums", urgent ? "text-red-500" : "text-ink-700")}>
                    {secondsLeft}s
                  </span>
                </div>
                <Progress
                  value={(secondsLeft / 30) * 100}
                  className={cn("h-2", urgent ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500")}
                />
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={onAccept}
                  className="w-full h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-display font-bold text-base shadow-glow-emerald active:scale-[0.98] transition-transform duration-100"
                >
                  {batchInfo
                    ? "Accepter ×2 — " + displayAmount.toLocaleString("fr-FR") + " F"
                    : "Accepter la course"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDetails(false); onRefuse(); }}
                  className="w-full py-2 text-sm text-ink-500 hover:text-red-500 transition-colors"
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
