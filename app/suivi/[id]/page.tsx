"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { EtaBadge } from "@/components/tracking/EtaBadge";
import { Wordmark } from "@/components/brand/Wordmark";
import { Share2 } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const STATUS_STAGE: Record<OrderStatus, "created" | "assigned" | "enroute" | "delivered"> = {
  "créée":    "created",
  "assignée": "assigned",
  "collecte": "assigned",
  "en route": "enroute",
  "livrée":   "delivered",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export default function PublicTrackingPage({ params }: { params: { id: string } }) {
  const { orders } = useOrdersStore();
  const order = orders.find(o => o.id === params.id);
  const status: OrderStatus = order?.status ?? "en route";

  const seed = params.id.charCodeAt(params.id.length - 1);
  const onlineDrivers = useMemo(() => drivers.filter(d => d.online && !d.inPrayer), []);
  const driver = useMemo(() => onlineDrivers[seed % onlineDrivers.length], [seed, onlineDrivers]);
  const destination = useMemo(() => landmarks[seed % landmarks.length], [seed]);

  const [pos, setPos] = useState<[number, number]>([driver.lat, driver.lng]);

  useEffect(() => {
    const total = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / total);
      setPos([
        driver.lat + (destination.lat - driver.lat) * t,
        driver.lng + (destination.lng - driver.lng) * t,
      ]);
      if (t >= 1) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [driver, destination]);

  const pins = [
    { id: "drv", lat: pos[0], lng: pos[1], kind: "driver" as const },
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ];

  const waText = encodeURIComponent(
    `Suis ta livraison YONNE en temps réel 🛵 ${typeof window !== "undefined" ? window.location.href : ""}`
  );

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between">
        <Link href="/login"><Wordmark size="sm" /></Link>
        <div className="text-right">
          <div className="text-xs text-ink-500">Suivi de commande</div>
          <div className="font-mono text-xs text-ink-900 font-medium">{params.id}</div>
        </div>
      </header>

      <div className="w-full" style={{ height: 300 }}>
        <DakarMap
          pins={pins}
          trail={{ from: pos, to: [destination.lat, destination.lng] }}
          center={pos}
          zoom={14}
          height="300px"
        />
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status}
          </span>
          <EtaBadge initialMinutes={18} />
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
          <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">Progression</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[status]} />
        </div>

        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold py-3 rounded-lg shadow-glow transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Partager ce suivi
        </a>
      </div>
    </div>
  );
}
