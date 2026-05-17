"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDriversStore } from "@/lib/store/drivers";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import type { IncomingOrder } from "@/lib/mock-data/incoming-orders";
import { useDriverStore } from "@/lib/store/driver";
import { IncomingOrderCard, type BatchInfo } from "@/components/driver/IncomingOrderCard";
import { Switch } from "@/components/ui/switch";
import type { Pin } from "@/components/map/DakarMap";
import { triggerOrderNotification } from "@/components/driver/PushNotifBanner";
import { simulationEngine } from "@/lib/simulation/engine";
import { Navigation, Bell, Moon } from "lucide-react";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";
import { toast } from "sonner";
import { usePushNotification } from "@/lib/hooks/usePushNotification";
import { haversineKm } from "@/lib/utils";
import { InlineErrorBanner } from "@/components/driver/OfflineBanner";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-100 animate-pulse w-full" style={{ height: "calc(100dvh - 56px)" }} />
  ),
});

export default function CartePage() {
  const supabase = useSupabaseAuthed();
  const router  = useRouter();
  const session = useSession();
  const { drivers } = useDriversStore();
  const { online, inPrayer, activeOrderId, setOnline, acceptOrder } = useDriverStore();

  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0];
  }, [drivers, session?.displayName]);

  // Real driver profile resolved server-side by userId — overrides displayName matching
  const [myDriverId, setMyDriverId] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/driver/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: { driver?: { id: string; lat: number; lng: number } } | null) => {
        if (d?.driver) setMyDriverId(d.driver.id);
      })
      .catch(() => null);
  }, []);
  const effectiveDriverId = myDriverId ?? demo?.id ?? null;

  const defaultPos: [number, number] = [demo?.lat ?? 14.6928, demo?.lng ?? -17.4467];

  // Supabase real orders assigned to this driver
  const [realOrders, setRealOrders] = useState<IncomingOrder[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey]     = useState(0);

  // Only real Supabase orders — no mock fallback
  const allOrders = useMemo<IncomingOrder[]>(() => realOrders, [realOrders]);

  const [orderIndex, setOrderIndex]   = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [gpsPos, setGpsPos]           = useState<[number, number]>(defaultPos);
  const [gpsActive, setGpsActive]     = useState(false);
  // BatchInfo indexé par orderId — peuplé par checkBatch() dès qu'un batch est trouvé
  const [batchInfoMap, setBatchInfoMap] = useState<Map<string, BatchInfo>>(new Map());
  const { pushState, subscribe: subscribePush } = usePushNotification(demo?.id ?? null);
  const watchIdRef    = useRef<number | null>(null);
  const lastGpsSend   = useRef<number>(0);

  // Deterministic index into landmarks array, based on a string hash.
  function deterministicIndex(str: string, max: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash % max;
  }

  // ── Batch check ─────────────────────────────────────────────────────────────
  // Appel RPC asynchrone : si un groupage est possible, stocke le BatchInfo.
  const checkBatch = useCallback(async (orderId: string) => {
    interface BatchRpcResult {
      eligible: boolean;
      batch_order_id?: string;
      distance_km?: number;
      total_amount?: number;
      secondary_order?: { client: string; amount: number };
    }
    const { data } = await supabase
      .rpc("yonne_find_eligible_batch", { p_order_id: orderId })
      .then((r) => r, () => ({ data: null, error: null }));

    const result = data as BatchRpcResult | null;
    if (!result?.eligible) return;

    const info: BatchInfo = {
      batchOrderId:    result.batch_order_id ?? "",
      distanceKm:      result.distance_km    ?? 0,
      totalAmount:     result.total_amount   ?? 0,
      secondaryClient: result.secondary_order?.client ?? "Client",
    };
    setBatchInfoMap((prev) => new Map(prev).set(orderId, info));
  }, [supabase]);

  // Convert a Supabase order row to IncomingOrder format
  const rowToIncoming = useCallback((row: Record<string, unknown>): IncomingOrder => {
    const destLm = landmarks.find(l => l.id === (row.landmark_id as string)) ?? landmarks[0];
    const orderId = row.id as string;
    const pickupIdx = deterministicIndex(orderId, Math.min(5, landmarks.length));
    const pickupLm = landmarks[pickupIdx];
    const dist = Math.round(haversineKm(demo?.lat ?? 14.6928, demo?.lng ?? -17.4467, destLm.lat, destLm.lng) * 10) / 10;
    return {
      id: orderId,
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
    if (!effectiveDriverId) return;

    // Fetch existing assigned or paid orders visible par ce livreur
    supabase
      .from("orders")
      .select("*")
      .eq("driver_id", effectiveDriverId)
      .in("status", ["assignée", "payée_a_collecter", "collecte"])
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setFetchError("Impossible de charger vos commandes. Vérifiez votre connexion.");
          return;
        }
        setFetchError(null);
        if (data && data.length > 0) {
          const incoming = data.map(r => rowToIncoming(r as Record<string, unknown>));
          setRealOrders(incoming);
          setOrderIndex(0);
          incoming.forEach((o) => { void checkBatch(o.id); });
        }
      });

    // Subscribe to new orders assigned to this driver
    const channel = supabase
      .channel(`driver-orders-${effectiveDriverId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `driver_id=eq.${effectiveDriverId}` },
        (payload) => {
          const incoming = rowToIncoming(payload.new as Record<string, unknown>);
          setRealOrders(prev => [incoming, ...prev]);
          setOrderIndex(0);
          setSecondsLeft(30);
          triggerOrderNotification(incoming.id, incoming.clientName, incoming.amount);
          void checkBatch(incoming.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `driver_id=eq.${effectiveDriverId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const visibleStatuses = ["assignée", "payée_a_collecter"];
          if (!visibleStatuses.includes(row.status as string)) {
            setRealOrders(prev => prev.filter(o => o.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDriverId, rowToIncoming, supabase, checkBatch, retryKey]);

  // Enregistrer ce livreur dans le moteur de simulation
  useEffect(() => {
    if (demo?.id) simulationEngine.registerActiveDriver(demo.id);
    return () => simulationEngine.registerActiveDriver(null);
  }, [demo?.id]);

  // Geolocation watch + send position to Supabase every 10s
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsPos([lat, lng]);
        setGpsActive(true);

        // Send position via REST API at most every 10s (avoids Supabase anon auth issues)
        const now = Date.now();
        if (now - lastGpsSend.current > 10000) {
          lastGpsSend.current = now;
          fetch("/api/driver/position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          }).catch((err: unknown) => console.error("[GPS] position sync failed:", err));
        }
      },
      (err) => {
        setGpsActive(false);
        if (err.code !== err.PERMISSION_DENIED) {
          toast.error("GPS indisponible — position approximative utilisée");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [demo?.id, supabase]);

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

  const pins = useMemo<Pin[]>(() => [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    ...allOrders.map((o) => {
      const lm = landmarks.find((l) => l.id === o.pickupLandmarkId) ?? landmarks[0];
      return { id: o.id, lat: lm.lat, lng: lm.lng, kind: "order" as const };
    }),
  ], [driverPos, allOrders]);

  function handlePinClick(pinId: string) {
    const idx = allOrders.findIndex((o) => o.id === pinId);
    if (idx !== -1) { setOrderIndex(idx); setSecondsLeft(30); }
  }

  async function handleAccept() {
    if (!currentOrder) return;

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/accept`, { method: "POST" });
      const body = await res.json() as { ok?: boolean; error?: string; idempotent?: boolean };

      if (!res.ok) {
        const msg = body?.error ?? "Erreur inconnue";
        if (res.status === 409) {
          toast.error("Commande déjà prise par un autre livreur");
          setRealOrders(prev => prev.filter(o => o.id !== currentOrder.id));
        } else {
          toast.error(`Impossible d'accepter — ${msg}`);
        }
        return;
      }
    } catch {
      toast.error("Erreur réseau — vérifiez votre connexion");
      return;
    }

    setRealOrders(prev => prev.filter(o => o.id !== currentOrder.id));
    acceptOrder(currentOrder.id);
    router.push(`/driver/livraison/${currentOrder.id}`);
  }

  function handleRefuse() {
    if (realOrders.length > 0) {
      setOrderIndex(i => (i + 1) % realOrders.length);
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
          <span className="text-sm font-medium text-gold-600 flex items-center gap-1.5"><Moon className="w-4 h-4" /> Mode prière</span>
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

      {/* Push notification opt-in — shown once when not yet subscribed */}
      {pushState === "idle" && online && (
        <div className="absolute top-16 left-4 z-[1001]">
          <button
            onClick={() => {
              subscribePush().then((ok) => {
                if (ok) toast.success("Notifications activées");
                else toast.error("Notifications non autorisées");
              });
            }}
            className="flex items-center gap-1.5 bg-white rounded-full shadow-card px-3 py-2 text-xs font-medium text-ink-700 hover:bg-cream-50 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-500" />
            Activer les notifications
          </button>
        </div>
      )}

      {/* Fetch error banner — shown when initial order load fails */}
      {fetchError && (
        <div className="absolute top-16 left-4 right-4 z-[1001]">
          <InlineErrorBanner
            message={fetchError}
            onRetry={() => {
              setFetchError(null);
              setRetryKey(k => k + 1);
            }}
          />
        </div>
      )}

      {/* Waiting state overlay — shown when online but no real orders */}
      {online && allOrders.length === 0 && !fetchError && (
        <div className="absolute bottom-20 left-0 right-0 z-[1001] flex justify-center px-4">
          <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-3 max-w-xs w-full">
            <div className="w-2 h-2 rounded-full bg-ink-300 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink-900">En attente de commandes</p>
              <p className="text-xs text-ink-500 mt-0.5">Vous serez notifié dès qu&apos;une livraison arrive</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-14 left-0 right-0 z-[1001] max-w-sm mx-auto">
        {online ? (
          currentOrder ? (
            <IncomingOrderCard
              key={currentOrder.id}
              order={currentOrder}
              secondsLeft={secondsLeft}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              batchInfo={batchInfoMap.get(currentOrder.id)}
            />
          ) : null
        ) : (
          <div className="bg-white rounded-t-xl p-4 text-center text-sm text-ink-500 border-t border-cream-200">
            Vous êtes hors ligne
          </div>
        )}
      </div>
    </div>
  );
}
