"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDriversStore } from "@/lib/store/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { useDriverStore } from "@/lib/store/driver";
import { DeliveryStepperCard } from "@/components/driver/DeliveryStepperCard";
import { Button } from "@/components/ui/button";
import { Phone, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pin } from "@/components/map/DakarMap";
import { QrScannerModal } from "@/components/driver/QrScannerModal";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-100 animate-pulse w-full" style={{ height: "calc(100dvh - 56px)" }} />
  ),
});

export default function LivraisonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { drivers } = useDriversStore();
  const { activeOrderId, deliveryStep, advanceStep, completeDelivery } = useDriverStore();
  const demo = useMemo(() => drivers[0] ?? { lat: 14.6928, lng: -17.4467 }, [drivers]);

  useEffect(() => {
    if (activeOrderId === null) router.replace("/driver/carte");
  }, [activeOrderId, router]);

  const order = useMemo(
    () => incomingOrders.find((o) => o.id === params.id) ?? incomingOrders[0],
    [params.id]
  );

  const pickup = useMemo(
    () => landmarks.find((l) => l.id === order.pickupLandmarkId) ?? landmarks[0],
    [order]
  );
  const dest = useMemo(
    () => landmarks.find((l) => l.id === order.destLandmarkId) ?? landmarks[1],
    [order]
  );

  const target = deliveryStep <= 1 ? pickup : dest;

  const [pos, setPos]         = useState<[number, number]>([demo.lat, demo.lng]);
  const [showQr, setShowQr]   = useState(false);

  useEffect(() => {
    const total = 30;
    let i = 0;
    setPos([demo.lat, demo.lng]);
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / total);
      setPos([
        demo.lat + (target.lat - demo.lat) * t,
        demo.lng + (target.lng - demo.lng) * t,
      ]);
      if (t >= 1) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lat, target.lng, demo.lat, demo.lng]);

  const pins: Pin[] = [
    { id: "driver", lat: pos[0], lng: pos[1], kind: "driver" },
    { id: "dest",   lat: target.lat, lng: target.lng, kind: "dest" },
  ];

  function handleAdvance() {
    if (deliveryStep < 3) {
      advanceStep();
    } else {
      completeDelivery();
      router.push("/driver/gains");
    }
  }

  const complete = deliveryStep === 3;

  function handleQrConfirm() {
    setShowQr(false);
    handleAdvance();
  }

  return (
    <div className="relative" style={{ height: "calc(100dvh - 56px)" }}>
      <DakarMap
        pins={pins}
        trail={{ from: pos, to: [target.lat, target.lng] }}
        center={pos}
        zoom={14}
        height="calc(100dvh - 56px)"
      />

      <div className="absolute top-0 left-0 right-0 z-[1001] p-3">
        <div className="bg-white rounded-lg shadow-card p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-ink-500 font-mono">{order.id}</div>
            <div className="font-display font-bold text-ink-900 truncate">{order.clientName}</div>
            <div className="text-xs text-ink-500">{order.amount.toLocaleString("fr-FR")} F · {order.paymentMethod}</div>
          </div>
          <a href={`tel:${order.clientPhone}`}>
            <Button size="sm" className="w-10 h-10 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0">
              <Phone className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      {showQr && (
        <QrScannerModal orderId={order.id} onConfirm={handleQrConfirm} onClose={() => setShowQr(false)} />
      )}

      <div className="fixed bottom-14 left-0 right-0 z-[1001] max-w-sm mx-auto">
        {/* QR collect button at step 1 */}
        {deliveryStep === 1 && !complete && !showQr && (
          <div className="px-4 pb-2">
            <button type="button" onClick={() => setShowQr(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-emerald-500 text-emerald-600 font-semibold text-sm py-3 rounded-xl shadow-card hover:bg-emerald-50 transition-colors">
              <QrCode className="w-4 h-4" /> Scanner QR du colis
            </button>
          </div>
        )}
        {complete ? (
          <div className={cn(
            "bg-white rounded-t-xl p-6 text-center space-y-3",
            "animate-in zoom-in-50 duration-500"
          )}>
            <div className="text-4xl">✅</div>
            <div className="font-display font-bold text-lg text-ink-900">Livraison confirmée !</div>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold"
              onClick={handleAdvance}
            >
              Voir mes gains
            </Button>
          </div>
        ) : (
          <DeliveryStepperCard step={deliveryStep} onAdvance={handleAdvance} />
        )}
      </div>
    </div>
  );
}
