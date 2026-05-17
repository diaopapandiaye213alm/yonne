"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useDriversStore } from "@/lib/store/drivers";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriverStore } from "@/lib/store/driver";
import { DeliveryStepperCard } from "@/components/driver/DeliveryStepperCard";
import { Button } from "@/components/ui/button";
import { Phone, QrCode, Navigation2, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn, haversineKm } from "@/lib/utils";
import type { Pin } from "@/components/map/DakarMap";
import { QrScannerModal } from "@/components/driver/QrScannerModal";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-cream-100 animate-pulse w-full" style={{ height: "calc(100dvh - 56px)" }} />
  ),
});

export default function LivraisonPage({ params }: { params: { id: string } }) {
  const supabase = useSupabaseAuthed();
  const router  = useRouter();
  const session = useSession();
  const { drivers } = useDriversStore();
  const { activeOrderId, deliveryStep, hasHydrated } = useDriverStore();
  const { orders } = useOrdersStore();
  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0] ?? { lat: 14.6928, lng: -17.4467 };
  }, [drivers, session?.displayName]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (activeOrderId === null) router.replace("/driver/carte");
  }, [hasHydrated, activeOrderId, router]);

  // Resolve order from real Supabase orders only — no mock fallback.
  const order = useMemo(() => {
    const real = orders.find(o => o.id === params.id);
    if (!real) return null;
    const destLm = landmarks.find(l => l.id === real.landmarkId) ?? landmarks[1];
    const merchantSeed = real.merchantId ?? real.id;
    const seedIdx = parseInt(merchantSeed.slice(-2), 16) % landmarks.length;
    const pickupLm = landmarks[seedIdx] ?? landmarks[0];
    return {
      id: real.id,
      clientName: real.clientName,
      clientPhone: real.clientPhone ?? "",
      pickupLandmarkId: pickupLm.id,
      destLandmarkId: destLm.id,
      distanceKm: Math.round(haversineKm(pickupLm.lat, pickupLm.lng, destLm.lat, destLm.lng) * 10) / 10,
      amount: real.amount,
      paymentMethod: real.paymentMethod as "wave" | "orange" | "cash",
    };
  }, [orders, params.id]);

  const pickup = useMemo(
    () => order ? (landmarks.find((l) => l.id === order.pickupLandmarkId) ?? landmarks[0]) : null,
    [order]
  );
  const dest = useMemo(
    () => order ? (landmarks.find((l) => l.id === order.destLandmarkId) ?? landmarks[1]) : null,
    [order]
  );

  const target = (deliveryStep <= 1 ? pickup : dest) ?? { lat: 14.6928, lng: -17.4467 };

  const [pos, setPos]           = useState<[number, number]>([demo.lat, demo.lng]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [showQr, setShowQr]     = useState(false);
  const [showNavChoice, setShowNavChoice] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [incidentNote, setIncidentNote] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  const INCIDENT_TYPES = [
    "Colis endommagé",
    "Client introuvable",
    "Adresse incorrecte",
    "Panne / accident",
    "Problème de paiement",
    "Autre",
  ];

  async function handleIncidentSubmit() {
    if (!incidentType) return;
    setSubmitting(true);
    const { error } = await supabase.from("sav_tickets").insert({
      order_ref:   order?.id ?? "",
      type:        incidentType,
      description: incidentNote || incidentType,
      status:      "ouvert" as const,
      responsable: "—",
      delay:       "—",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Impossible de signaler l'incident");
      return;
    }
    setSubmitted(true);
    setTimeout(() => { setShowIncident(false); setSubmitted(false); setIncidentType(""); setIncidentNote(""); }, 1500);
  }

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

  // Fetch OSRM route when driver position or target changes
  useEffect(() => {
    const from = pos;
    const to: [number, number] = [target.lat, target.lng];
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    fetch(url)
      .then(r => r.json())
      .then((data: { routes?: { geometry: { coordinates: [number, number][] } }[] }) => {
        const coords = data.routes?.[0]?.geometry?.coordinates;
        if (coords) setRouteCoords(coords.map(c => [c[1], c[0]]));
      })
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lat, target.lng]);

  const pins: Pin[] = [
    { id: "driver", lat: pos[0], lng: pos[1], kind: "driver" },
    { id: "dest",   lat: target.lat, lng: target.lng, kind: "dest" },
  ];

  const { syncAdvanceStep, syncCompleteDelivery } = useDriverStore();

  async function handleAdvance() {
    if (deliveryStep < 3) {
      await syncAdvanceStep(params.id);
    } else {
      await syncCompleteDelivery(params.id);
      router.push("/driver/gains");
    }
  }

  const complete = deliveryStep === 3;

  if (!hasHydrated) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ height: "calc(100dvh - 56px)" }}>
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center p-8" style={{ height: "calc(100dvh - 56px)" }}>
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-sm text-ink-500">Commande introuvable.</p>
      </div>
    );
  }

  function handleQrConfirm() {
    setShowQr(false);
    handleAdvance();
  }

  return (
    <div className="relative" style={{ height: "calc(100dvh - 56px)" }}>
      <DakarMap
        pins={pins}
        routeCoords={routeCoords.length > 1 ? routeCoords : undefined}
        trail={routeCoords.length <= 1 ? { from: pos, to: [target.lat, target.lng] } : undefined}
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNavChoice(true)}
              title="Choisir une app de navigation"
              className="w-10 h-10 p-0 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
            >
              <Navigation2 className="w-4 h-4" />
            </button>
            <a href={`tel:${order.clientPhone}`}>
              <Button size="sm" className="w-10 h-10 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <Phone className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {showQr && (
        <QrScannerModal orderId={order.id} onConfirm={handleQrConfirm} onClose={() => setShowQr(false)} />
      )}

      {showNavChoice && (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-sm p-5 space-y-3 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink-900">Choisir une app de navigation</h3>
              <button type="button" onClick={() => setShowNavChoice(false)}><X className="w-5 h-5 text-ink-400" /></button>
            </div>
            {[
              { label: "Google Maps", icon: "🗺️", url: `https://maps.google.com/?q=${target.lat},${target.lng}` },
              { label: "Waze", icon: "🚗", url: `https://waze.com/ul?ll=${target.lat},${target.lng}&navigate=yes` },
              { label: "OsmAnd / Maps.me", icon: "🌍", url: `https://osmand.net/go?lat=${target.lat}&lon=${target.lng}&z=16` },
            ].map(nav => (
              <a key={nav.label} href={nav.url} target="_blank" rel="noopener noreferrer"
                onClick={() => setShowNavChoice(false)}
                className="flex items-center gap-4 p-3 rounded-xl border border-cream-200 hover:bg-cream-50 transition-colors">
                <span className="text-2xl">{nav.icon}</span>
                <span className="font-medium text-ink-900">{nav.label}</span>
                <Navigation2 className="w-4 h-4 text-ink-400 ml-auto" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Incident report button */}
      <button
        type="button"
        onClick={() => setShowIncident(true)}
        className="absolute top-16 right-3 z-[1002] bg-white border border-amber-300 text-amber-600 rounded-full p-2 shadow-card hover:bg-amber-50 transition-colors"
        title="Signaler un incident"
      >
        <AlertTriangle className="w-4 h-4" />
      </button>

      {showIncident && (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-0">
          <div className="bg-white rounded-t-2xl w-full max-w-sm p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink-900">Signaler un incident</h3>
              <button type="button" onClick={() => setShowIncident(false)}>
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>
            {submitted ? (
              <div className="text-center py-6 text-emerald-600 font-semibold">✅ Incident signalé</div>
            ) : (
              <>
                <div className="space-y-2">
                  {INCIDENT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setIncidentType(t)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors",
                        incidentType === t
                          ? "border-amber-400 bg-amber-50 text-amber-700 font-semibold"
                          : "border-cream-200 text-ink-700 hover:bg-cream-50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  value={incidentNote}
                  onChange={e => setIncidentNote(e.target.value)}
                  placeholder="Note optionnelle…"
                  rows={2}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-display font-bold"
                  disabled={!incidentType || submitting}
                  onClick={handleIncidentSubmit}
                >
                  {submitting ? "Envoi…" : "Envoyer"}
                </Button>
              </>
            )}
          </div>
        </div>
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
