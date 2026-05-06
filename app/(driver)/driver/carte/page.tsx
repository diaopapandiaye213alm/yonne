"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { useDriverStore } from "@/lib/store/driver";
import { IncomingOrderCard } from "@/components/driver/IncomingOrderCard";
import { Switch } from "@/components/ui/switch";
import type { Pin } from "@/components/map/DakarMap";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-100 animate-pulse w-full" style={{ height: "calc(100dvh - 56px)" }} />
  ),
});

const demo = drivers[0];

export default function CartePage() {
  const router = useRouter();
  const { online, activeOrderId, setOnline, acceptOrder } = useDriverStore();

  const [orderIndex, setOrderIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (!online || activeOrderId) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setOrderIndex((i) => (i + 1) % incomingOrders.length);
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [online, activeOrderId]);

  const currentOrder = incomingOrders[orderIndex];

  const pins: Pin[] = [
    { id: "driver", lat: demo.lat, lng: demo.lng, kind: "driver" },
    ...incomingOrders.map((o) => {
      const lm = landmarks.find((l) => l.id === o.pickupLandmarkId) ?? landmarks[0];
      return { id: o.id, lat: lm.lat, lng: lm.lng, kind: "order" as const };
    }),
  ];

  function handlePinClick(pinId: string) {
    const idx = incomingOrders.findIndex((o) => o.id === pinId);
    if (idx !== -1) {
      setOrderIndex(idx);
      setSecondsLeft(30);
    }
  }

  function handleAccept() {
    acceptOrder(currentOrder.id);
    router.push(`/driver/livraison/${currentOrder.id}`);
  }

  function handleRefuse() {
    setOrderIndex((i) => (i + 1) % incomingOrders.length);
    setSecondsLeft(30);
  }

  return (
    <div className="relative" style={{ height: "calc(100dvh - 56px)" }}>
      <DakarMap
        pins={pins}
        center={[demo.lat, demo.lng]}
        zoom={14}
        height="calc(100dvh - 56px)"
        onPinClick={handlePinClick}
      />

      {!online && (
        <div className="absolute inset-0 z-[1000] bg-ink-900/20 pointer-events-none" />
      )}

      <div className="absolute top-4 right-4 z-[1001] bg-white rounded-full shadow-card px-3 py-2 flex items-center gap-2">
        <Switch checked={online} onCheckedChange={setOnline} />
        <span className="text-sm font-medium text-ink-900">En ligne</span>
      </div>

      <div className="fixed bottom-14 left-0 right-0 z-[1001] max-w-sm mx-auto">
        {online ? (
          <IncomingOrderCard
            key={currentOrder.id}
            order={currentOrder}
            secondsLeft={secondsLeft}
            onAccept={handleAccept}
            onRefuse={handleRefuse}
          />
        ) : (
          <div className="bg-white rounded-t-xl p-4 text-center text-sm text-ink-500 border-t border-cream-200">
            Vous êtes hors ligne
          </div>
        )}
      </div>
    </div>
  );
}
