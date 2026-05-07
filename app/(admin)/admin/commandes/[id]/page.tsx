import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { orders } from "@/lib/mock-data/orders";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { ArrowLeft } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const STATUS_STAGE: Record<string, "created" | "assigned" | "enroute" | "delivered"> = {
  "créée":    "created",
  "assignée": "assigned",
  "collecte": "assigned",
  "en route": "enroute",
  "livrée":   "delivered",
};

const STATUS_COLORS: Record<string, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export default function CommandeDetailPage({ params }: { params: { id: string } }) {
  const order = orders.find(o => o.id === params.id);
  if (!order) notFound();

  const driver   = drivers.find(d => d.id === order.driverId);
  const landmark = landmarks.find(l => l.id === order.landmarkId);
  const DAKAR: [number, number] = [14.6928, -17.4467];
  const center: [number, number] = landmark ? [landmark.lat, landmark.lng] : DAKAR;

  const pins = landmark
    ? [{ id: "dest", lat: landmark.lat, lng: landmark.lng, kind: "dest" as const }]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/commandes" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">{order.id}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Client</h2>
          <div className="text-sm text-ink-700">{order.clientName}</div>
          <div className="text-sm text-ink-500">{order.clientPhone}</div>
          <div className="text-sm"><span className="text-ink-500">Paiement :</span> <span className="font-medium capitalize">{order.paymentMethod}</span></div>
          <div className="text-sm"><span className="text-ink-500">Montant :</span> <span className="font-bold text-ink-900">{order.amount.toLocaleString("fr-FR")} F</span></div>
          {order.insurance && <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Assurance colis activée (+200 F)</div>}
          <div className="text-sm text-ink-500">Créée le {new Date(order.createdAt).toLocaleString("fr-FR")}</div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Livreur assigné</h2>
          {driver ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {driver.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-medium text-ink-900">{driver.name}</div>
                  <div className="text-xs text-ink-500">{driver.phone}</div>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span><span className="text-ink-500">Score IA :</span> <strong>{driver.scoreIA}/100</strong></span>
                <span><span className="text-ink-500">Note :</span> <strong>{driver.rating} ★</strong></span>
              </div>
              <Link href={`/admin/livreurs/${driver.id}`} className="text-xs text-emerald-500 hover:underline">
                Voir profil livreur →
              </Link>
            </>
          ) : (
            <div className="text-sm text-ink-500">Aucun livreur assigné</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
          <DakarMap pins={pins} center={center} zoom={14} height="300px" />
        </div>
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Suivi</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[order.status] ?? "created"} />
        </div>
      </div>
    </div>
  );
}
