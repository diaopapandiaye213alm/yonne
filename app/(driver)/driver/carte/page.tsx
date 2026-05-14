"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDriversStore } from "@/lib/store/drivers";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders as mockOrders } from "@/lib/mock-data/incoming-orders";
import type { IncomingOrder } from "@/lib/mock-data/incoming-orders";
import { useDriverStore } from "@/lib/store/driver";
import { IncomingOrderCard } from "@/components/driver/IncomingOrderCard";
import { Switch } from "@/components/ui/switch";
import type { Pin } from "@/components/map/DakarMap";
import { triggerOrderNotification } from "@/components/driver/PushNotifBanner";
import { Navigation } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-100 animate-pulse w-full" style={{ height: "calc(100dvh - 56px)" }} />
  ),
});

export default function CartePage() {
  const router  = useRouter();
  const session = useSession();
  const { drivers } = useDriversStore();
  const { online, inPrayer, activeOrderId, setOnline, acceptOrder } = useDriverStore();

  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0];
  }, [drivers, session?.displayName]);
  const defaultPos: [number, number] = [demo?.lat ?? 14.6928, demo?.lng ?? -17.4467];

  // Supabase real orders assigned to this driver
  const [realOrders, setRealOrders] = useState<IncomingOrder[]>([]);

  // Combined queue: real Supabase orders first, then mock rotation for demo
  const allOrders = useMemo<IncomingOrder[]>(() => {
    return realOrders.length > 0 ? realOrders : mockOrders;
  }, [realOrders]);

  const [orderIndex, setOrderIndex]   = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [gpsPos, setGpsPos]           = useState<[number, number]>(defaultPos);
  const [gpsActive, setGpsActive]     = useState(false);
  const watchIdRef    = useRef<number | null>(null);
  const lastGpsSend   = useRef<number>(0);

  // Convert a Supabase order row to IncomingOrder format
  const rowToIncoming = useCallback((row: Record<string, unknown>): IncomingOrder => {
    const destLm = landmarks.find(l => l.id === (row.landmark_id as string)) ?? landmarks[0];
    const pickupLm = landmarks[Math.floor(Math.random() * Math.min(5, landmarks.length))];
    const dLat = destLm.lat - (demo?.lat ?? 14.6928);
    const dLng = destLm.lng - (demo?.lng ?? -17.4467);
    const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;
    return {
      id: row.id as string,
      clientName: (row.client_name as string) ?? "Client",
      clientPhone: (row.client_phone as string) ?? "",
      pickupLandmarkId: pickupLm.id,
      destLandmarkId: destLm.id,
      distanceKm: dist,
      amount: row.amount as number,
      paymentMethod: (row.payment_method as IncomingOrder["paymentMethod"]) ?? "cash",
    };
  }, [demo]);

  // Subscribe to real Supabase orders for this driver
  useEffect(() => {
    if (!demo?.id) return;

    // Fetch existing assigned orders
    supabase
      .from("orders")
      .select("*")
      .eq("driver_id", demo.id)
      .eq("status", "assignée")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRealOrders(data.map(r => rowToIncoming(r as Record<string, unknown>)));
          setOrderIndex(0);
        }
      });

    // Subscribe to new orders assigned to this driver
    const channel = supabase
      .channel(`driver-orders-${demo.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `driver_id=eq.${demo.id}` },
        (payload) => {
          const incoming = rowToIncoming(payload.new as Record<string, unknown>);
          setRealOrders(prev => [incoming, ...prev]);
          setOrderIndex(0);
          setSecondsLeft(30);
          triggerOrderNotification(incoming.id, incoming.clientName, incoming.amount);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `driver_id=eq.${demo.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.status !== "assignée") {
            setRealOrders(prev => prev.filter(o => o.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [demo?.id, rowToIncoming]);

  // Geolocation watch + send position to Supabase every 10s
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsPos([lat, lng]);
        setGpsActive(true);

        // Send to Supabase at most every 10s
        const now = Date.now();
        if (now - lastGpsSend.current > 10000 && demo?.id) {
          lastGpsSend.current = now;
          supabase.from("drivers").update({ lat, lng }).eq("id", demo.id);
        }
      },
      () => { setGpsActive(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [demo?.id]);

  // Mock order rotation (only when no real orders)
  useEffect(() => {
    if (!online || activeOrderId || realOrders.length > 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setOrderIndex((i) => {
            const next = (i + 1) % mockOrders.length;
            const o = mockOrders[next];
            triggerOrderNotification(o.id, o.clientName, o.amount);
            return next;
          });
          return 30;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [online, activeOrderId, realOrders.length]);

  // Countdown for real orders
  useEffect(() => {
    if (!online || activeOrderId || realOrders.length === 0) return;
    const id = setInterval(() => {
      setSecondsLeft(s => (s <= 1 ? 30 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [online, activeOrderId, realOrders.length]);

  const currentOrder = allOrders[Math.min(orderIndex, allOrders.length - 1)] ?? allOrders[0];
  const driverPos: [number, number] = gpsActive ? gpsPos : defaultPos;

  const pins: Pin[] = [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    ...allOrders.map((o) => {
      const lm = landmarks.find((l) => l.id === o.pickupLandmarkId) ?? landmarks[0];
      return { id: o.id, lat: lm.lat, lng: lm.lng, kind: "order" as const };
    }),
  ];

  function handlePinClick(pinId: string) {
    const idx = allOrders.findIndex((o) => o.id === pinId);
    if (idx !== -1) { setOrderIndex(idx); setSecondsLeft(30); }
  }

  function handleAccept() {
    if (!currentOrder) return;
    acceptOrder(currentOrder.id);
    // Update Supabase order status to "collecte" for real orders
    if (realOrders.some(o => o.id === currentOrder.id)) {
      supabase.from("orders").update({ status: "collecte", active: true }).eq("id", currentOrder.id);
      setRealOrders(prev => prev.filter(o => o.id !== currentOrder.id));
    }
    router.push(`/driver/livraison/${currentOrder.id}`);
  }

  function handleRefuse() {
    if (realOrders.length > 0) {
      // Move to next real order
      setOrderIndex(i => (i + 1) % realOrders.length);
    } else {
      setOrderIndex((i) => (i + 1) % mockOrders.length);
    }
    setSecondsLeft(30);
  }

  return (
    <div className="relative" style={{ height: "calc(100dvh - 56px)" }}>
      <DakarMap
        pins={pins}
        center={driverPos}
        zoom={14}
        height="calc(100dvh - 56px)"
        onPinClick={handlePinClick}
      />

      {!online && (
        <div className="absolute inset-0 z-[1000] bg-ink-900/20 pointer-events-none" />
      )}

      {/* Online toggle */}
      <div className="absolute top-4 right-4 z-[1001] bg-white rounded-full shadow-card px-3 py-2 flex items-center gap-2">
        {inPrayer ? (
          <span className="text-sm font-medium text-gold-600">🕌 Mode prière</span>
        ) : (
          <>
            <Switch checked={online} onCheckedChange={setOnline} />
            <span className="text-sm font-medium text-ink-900">En ligne</span>
          </>
        )}
      </div>

      {/* GPS indicator */}
      <div className="absolute top-4 left-4 z-[1001] bg-white rounded-full shadow-card px-3 py-2 flex items-center gap-1.5">
        <Navigation className={`w-3.5 h-3.5 ${gpsActive ? "text-emerald-500 animate-live-pulse" : "text-ink-300"}`} />
        <span className={`text-xs font-medium ${gpsActive ? "text-emerald-600" : "text-ink-400"}`}>
          {gpsActive ? "GPS actif" : "GPS désactivé"}
        </span>
        {realOrders.length > 0 && (
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
            {realOrders.length} réelle{realOrders.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="fixed bottom-14 left-0 right-0 z-[1001] max-w-sm mx-auto">
        {online ? (
          currentOrder ? (
            <IncomingOrderCard
              key={currentOrder.id}
              order={currentOrder}
              secondsLeft={secondsLeft}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
            />
          ) : (
            <div className="bg-white rounded-t-xl p-4 text-center text-sm text-ink-500 border-t border-cream-200">
              En attente de commandes…
            </div>
          )
        ) : (
          <div className="bg-white rounded-t-xl p-4 text-center text-sm text-ink-500 border-t border-cream-200">
            Vous êtes hors ligne
          </div>
        )}
      </div>
    </div>
  );
}
