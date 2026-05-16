"use client";
import type { IncomingOrder } from "@/lib/mock-data/incoming-orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { Progress } from "@/components/ui/progress";
import { MapPin, Package, Navigation } from "lucide-react";
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

export function IncomingOrderCard({ order, secondsLeft, onAccept, onRefuse, batchInfo }: Props) {
  const dest   = landmarks.find((l) => l.id === order.destLandmarkId);
  const urgent = secondsLeft <= 10;
  const displayAmount = batchInfo ? batchInfo.totalAmount : order.amount;

  return (
    <div data-testid="order-card" className="bg-white rounded-t-2xl shadow-card-lg animate-in fade-in duration-200 overflow-hidden">
      {/* ── Enamel batch badge — full width premium strip ─────────────────── */}
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
        {/* Header: client + payment badge */}
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-ink-900">{order.clientName}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", paymentColor[order.paymentMethod])}>
            {paymentLabel[order.paymentMethod]}
          </span>
        </div>

        {/* Destinations */}
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

        {/* Amount — prominent */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-sm">{order.distanceKm.toFixed(1)} km</span>
          </div>
          <span className={cn(
            "font-display font-extrabold tabular-nums leading-none",
            batchInfo ? "text-2xl text-emerald-600" : "text-xl text-ink-900"
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

      {/* ── Action zone — full-width buttons ────────────────────────────── */}
      <div className="px-4 pb-4 space-y-2">
        <button
          type="button"
          onClick={onAccept}
          className="w-full h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-display font-bold text-base shadow-glow-emerald active:scale-[0.98] transition-transform duration-100"
        >
          {batchInfo ? "Accepter ×2 — " + displayAmount.toLocaleString("fr-FR") + " F" : "Accepter la course"}
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
  );
}
