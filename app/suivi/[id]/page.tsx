"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDriversStore } from "@/lib/store/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { EtaBadge } from "@/components/tracking/EtaBadge";
import { Wordmark } from "@/components/brand/Wordmark";
import { Share2, Phone, MessageCircle, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

const STATUS_LABELS: Record<OrderStatus, string> = {
  "créée":    "Commande reçue",
  "assignée": "Livreur assigné",
  "collecte": "Collecte en cours",
  "en route": "En route vers vous",
  "livrée":   "Livrée avec succès 🎉",
};

function StarRating({ onRate }: { onRate: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        <p className="text-sm font-medium text-ink-900">Merci pour votre note !</p>
        <p className="text-xs text-ink-500">Votre avis aide YONNE à s'améliorer.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="text-sm text-ink-700 font-medium">Comment s'est passée votre livraison ?</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => {
              setSelected(n);
              setSubmitted(true);
              onRate(n);
            }}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star className={`w-9 h-9 transition-colors ${
              n <= (hovered || selected) ? "text-gold-500 fill-gold-500" : "text-cream-300"
            }`} />
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-400">
        {hovered === 1 ? "Très mauvais" : hovered === 2 ? "Mauvais" : hovered === 3 ? "Correct" : hovered === 4 ? "Bien" : hovered === 5 ? "Excellent !" : "Touchez une étoile"}
      </p>
    </div>
  );
}

export default function PublicTrackingPage({ params }: { params: { id: string } }) {
  const { orders } = useOrdersStore();
  const order = orders.find(o => o.id === params.id);
  const status: OrderStatus = order?.status ?? "en route";
  const isDelivered = status === "livrée";

  const { drivers } = useDriversStore();
  const seed = params.id.charCodeAt(params.id.length - 1);
  const onlineDrivers = useMemo(() => drivers.filter(d => d.online && !d.inPrayer), [drivers]);
  const driver = useMemo(() => onlineDrivers[seed % Math.max(1, onlineDrivers.length)] ?? drivers[seed % Math.max(1, drivers.length)], [seed, onlineDrivers, drivers]);
  const destination = useMemo(() => landmarks[seed % landmarks.length], [seed]);

  const [pos, setPos] = useState<[number, number]>([14.6928, -17.4467]);

  const distanceKm = useMemo(() => {
    const dLat = destination.lat - pos[0];
    const dLng = destination.lng - pos[1];
    return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;
  }, [pos, destination]);

  useEffect(() => {
    if (isDelivered) return;
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
  }, [driver, destination, isDelivered]);

  const pins = isDelivered ? [
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ] : [
    { id: "drv", lat: pos[0], lng: pos[1], kind: "driver" as const },
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ];

  const waShareText = encodeURIComponent(
    `Suis ta livraison YONNE en temps réel 🛵 ${typeof window !== "undefined" ? window.location.href : ""}`
  );
  const waDriverText = encodeURIComponent(`Bonjour, je suis le client de la commande ${params.id}. Où en êtes-vous ?`);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between">
        <Link href="/login"><Wordmark size="sm" /></Link>
        <div className="text-right">
          <div className="text-xs text-ink-500">Suivi de commande</div>
          <div className="font-mono text-xs text-ink-900 font-medium">{params.id}</div>
        </div>
      </header>

      {/* Status banner */}
      <div className={`px-4 py-2 text-center text-sm font-medium ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </div>

      <div className="w-full" style={{ height: 260 }}>
        <DakarMap
          pins={pins}
          trail={isDelivered ? undefined : { from: pos, to: [destination.lat, destination.lng] }}
          center={isDelivered ? [destination.lat, destination.lng] : pos}
          zoom={14}
          height="260px"
        />
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status}
          </span>
          {!isDelivered && <EtaBadge distanceKm={distanceKm} />}
        </div>

        {/* Driver card */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
              {driver.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900">{driver.name}</div>
              <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                <span className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3 h-3 ${n <= Math.round(driver.rating) ? "text-gold-500 fill-gold-500" : "text-cream-300"}`} />
                  ))}
                </span>
                <span>{driver.rating.toFixed(1)}</span>
                <span>·</span>
                <span className="capitalize">{driver.vehicle}</span>
              </div>
            </div>
            {!isDelivered && (
              <div className="flex gap-2 shrink-0">
                <a href={`tel:${driver.phone}`}
                  className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${driver.phone.replace(/\s+/g, "").replace("+", "")}?text=${waDriverText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#1ebe5d] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
          <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">Progression</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[status]} />
        </div>

        {/* Rating — shown when delivered */}
        {isDelivered && (
          <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-4 animate-fade-in-up">
            <StarRating onRate={async (n) => {
              toast.success(`Note ${n}★ envoyée — merci !`);
              if (driver?.id) {
                const newRating = Math.round((driver.rating * 0.9 + n * 0.1) * 10) / 10;
                await supabase.from("drivers").update({ rating: newRating }).eq("id", driver.id);
              }
            }} />
          </div>
        )}

        {/* Share */}
        <a
          href={`https://wa.me/?text=${waShareText}`}
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
