"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useDemoSim } from "@/lib/store/demo-sim";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { DriverCard } from "@/components/tracking/DriverCard";
import type { Pin } from "@/components/map/DakarMap";
import type { DeliveryStep } from "@/lib/store/driver";

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

function timelineStage(step: DeliveryStep): "created" | "assigned" | "enroute" | "delivered" {
  if (step >= 3) return "delivered";
  if (step >= 2) return "enroute";
  return "assigned";
}

export function MerchantPanel() {
  const { progress } = useDemoSim();
  const driverPos = useMemo(() => computeDriverPos(progress), [progress]);
  const step = stepFromProgress(progress);
  const dest = landmarks.find((l) => l.id === order.destLandmarkId)!;
  const etaMinutes = Math.max(0, Math.round(18 * (1 - progress / 100)));

  const pins: Pin[] = [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    { id: "dest",   lat: dest.lat,     lng: dest.lng,     kind: "dest"   },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20">
        <span className="text-xs font-medium text-emerald-700">👤 Vue Marchand</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 min-w-0">
          <DakarMap
            pins={pins}
            trail={{ from: driverPos, to: [dest.lat, dest.lng] }}
            center={driverPos}
            zoom={13}
            height="100%"
          />
        </div>
        <div className="w-48 shrink-0 bg-white border-l border-cream-200 overflow-y-auto p-3 space-y-3">
          <div>
            <div className="text-xs text-ink-500">Commande</div>
            <div className="font-mono text-xs text-ink-900">{order.id}</div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-sm font-bold ${
              step >= 3 ? "bg-emerald-500 text-white" : "bg-gold-500 text-ink-900"
            }`}>
              {step >= 3 ? "Livré ✓" : "En route"}
            </span>
          </div>

          <DriverCard driver={demo} />

          <div className="bg-gold-500/15 border border-gold-500 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">ETA</div>
            <div className="font-display text-3xl font-bold text-ink-900 tabular-nums">
              {etaMinutes} <span className="text-sm text-ink-500 font-normal">min</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-900 mb-2">Suivi</h3>
            <GlovoTimeline activeStage={timelineStage(step)} />
          </div>
        </div>
      </div>
    </div>
  );
}
