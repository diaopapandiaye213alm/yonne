"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useDemoSim } from "@/lib/store/demo-sim";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { DeliveryStepperCard } from "@/components/driver/DeliveryStepperCard";
import type { Pin } from "@/components/map/DakarMap";
import type { DeliveryStep } from "@/lib/store/driver";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const demo = drivers[0];
const order = incomingOrders[0];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function computeDriverPos(progress: number): [number, number] {
  const pickup = landmarks.find((l) => l.id === order.pickupLandmarkId)!;
  const dest   = landmarks.find((l) => l.id === order.destLandmarkId)!;

  if (progress <= 33) {
    const t = progress / 33;
    return [lerp(demo.lat, pickup.lat, t), lerp(demo.lng, pickup.lng, t)];
  }
  if (progress <= 66) {
    const t = (progress - 33) / 33;
    return [lerp(pickup.lat, dest.lat, t), lerp(pickup.lng, dest.lng, t)];
  }
  return [dest.lat, dest.lng];
}

function stepFromProgress(p: number): DeliveryStep {
  if (p >= 100) return 3;
  if (p >= 66)  return 2;
  if (p >= 33)  return 1;
  return 0;
}

export function DriverPanel() {
  const { progress } = useDemoSim();
  const driverPos = useMemo(() => computeDriverPos(progress), [progress]);
  const step = stepFromProgress(progress);
  const dest = landmarks.find((l) => l.id === order.destLandmarkId)!;
  const done = progress >= 100;

  const pins: Pin[] = [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    { id: "dest",   lat: dest.lat,     lng: dest.lng,     kind: "dest"   },
  ];

  const mapHeight = done ? "calc(100% - 80px)" : "calc(100% - 160px)";

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-cream-200">
      <div className="px-3 py-1.5 bg-gold-500/10 border-b border-gold-500/20">
        <span className="text-xs font-medium text-ink-900">🛵 Vue Livreur</span>
      </div>

      <div className="flex-1 relative overflow-hidden max-w-sm mx-auto w-full">
        <DakarMap
          pins={pins}
          trail={{ from: driverPos, to: [dest.lat, dest.lng] }}
          center={driverPos}
          zoom={14}
          height={mapHeight}
        />

        <div className="absolute top-2 left-2 right-2 z-[1001]">
          <div className="bg-white rounded-lg shadow-card p-2.5 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm text-ink-900 truncate">{order.clientName}</div>
              <div className="text-xs text-ink-500">{order.amount.toLocaleString("fr-FR")} F · {order.paymentMethod}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          {done ? (
            <div className={cn(
              "bg-white rounded-t-xl p-4 text-center space-y-2",
              "animate-in zoom-in-50 duration-500"
            )}>
              <div className="text-3xl">✅</div>
              <div className="font-display font-bold text-ink-900">Livraison confirmée !</div>
            </div>
          ) : (
            <DeliveryStepperCard step={step} onAdvance={() => {}} disabled />
          )}
        </div>
      </div>
    </div>
  );
}
