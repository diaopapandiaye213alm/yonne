"use client";
import type { IncomingOrder } from "@/lib/mock-data/incoming-orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Package } from "lucide-react";
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

  return (
    <div className="bg-white rounded-t-xl p-4 space-y-3 animate-in fade-in duration-200">
      {/* Badge groupage — affiché uniquement si un batch est disponible */}
      {batchInfo && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-emerald-700">
            Commande Groupée ×2
          </span>
          <span className="text-xs text-emerald-600 ml-auto">
            +{batchInfo.distanceKm.toFixed(1)} km · {batchInfo.totalAmount.toLocaleString("fr-FR")} F total
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-ink-900">{order.clientName}</span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", paymentColor[order.paymentMethod])}>
          {paymentLabel[order.paymentMethod]}
        </span>
      </div>

      {dest && (
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">
            {dest.name} · <span className="text-ink-500">{dest.quartier}</span>
          </span>
        </div>
      )}

      {/* Deuxième destination si batch */}
      {batchInfo && (
        <div className="flex items-center gap-2 text-sm text-ink-500 pl-6">
          <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="truncate">
            {batchInfo.secondaryClient} · <span className="text-ink-400">{batchInfo.distanceKm.toFixed(1)} km</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-500">{order.distanceKm.toFixed(1)} km</span>
        <span className="font-mono font-bold text-ink-900">{order.amount.toLocaleString("fr-FR")} F</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium", urgent ? "text-red-500" : "text-ink-500")}>
            {secondsLeft}s
          </span>
        </div>
        <Progress
          value={(secondsLeft / 30) * 100}
          className={cn("h-1.5", urgent ? "[&>div]:bg-red-500" : "[&>div]:bg-emerald-500")}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          onClick={onRefuse}
        >
          Refuser
        </Button>
        <Button
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold"
          onClick={onAccept}
        >
          {batchInfo ? "Accepter ×2" : "Accepter"}
        </Button>
      </div>
    </div>
  );
}
