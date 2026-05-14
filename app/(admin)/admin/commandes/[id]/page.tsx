"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight, Printer, UserCheck, Search } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-cream-100 animate-pulse rounded-lg" />,
});

const STATUS_STAGE: Record<OrderStatus, "created" | "assigned" | "enroute" | "delivered"> = {
  "créée":    "created",
  "assignée": "assigned",
  "collecte": "assigned",
  "en route": "enroute",
  "livrée":   "delivered",
  "annulée":  "created",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500/20 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
  "annulée":  "bg-red-100 text-red-600",
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  "créée":    "assignée",
  "assignée": "collecte",
  "collecte": "en route",
  "en route": "livrée",
  "livrée":   null,
  "annulée":  null,
};

export default function CommandeDetailPage({ params }: { params: { id: string } }) {
  const { orders, updateStatus } = useOrdersStore();
  const { drivers } = useDriversStore();
  const order = orders.find(o => o.id === params.id);
  const onlineDrivers = drivers.filter(d => d.online && !d.inPrayer).sort((a, b) => b.scoreIA - a.scoreIA);

  const [showDispatch,    setShowDispatch]    = useState(false);
  const [driverSearch,    setDriverSearch]    = useState("");
  const [selectedDriver,  setSelectedDriver]  = useState<string | null>(null);

  if (!order) return <div className="p-6 text-ink-500">Commande introuvable.</div>;

  const filteredDrivers = onlineDrivers.filter(d =>
    !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );

  function confirmDispatch() {
    if (!selectedDriver) return;
    const d = drivers.find(dr => dr.id === selectedDriver);
    toast.success(`Livreur ${d?.name ?? selectedDriver} assigné à ${order!.id}`);
    setShowDispatch(false);
    setSelectedDriver(null);
  }

  const driver   = order ? drivers.find(d => d.id === order.driverId) : undefined;
  const landmark = landmarks.find(l => l.id === order.landmarkId);
  const DAKAR: [number, number] = [14.6928, -17.4467];
  const center: [number, number] = landmark ? [landmark.lat, landmark.lng] : DAKAR;

  const pins = landmark
    ? [{ id: "dest", lat: landmark.lat, lng: landmark.lng, kind: "dest" as const }]
    : [];

  const next = NEXT_STATUS[order.status];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/commandes" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold text-ink-900">{order.id}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cream-200 text-sm text-ink-600 hover:bg-cream-50 transition-colors print:hidden">
            <Printer className="w-4 h-4" /> Bon de livraison
          </button>
          <button type="button" onClick={() => setShowDispatch(v => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors print:hidden">
            <UserCheck className="w-4 h-4" /> Dispatcher
          </button>
          {next && (
            <button
              type="button"
              onClick={() => updateStatus(order.id, next)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-display font-bold transition-colors print:hidden"
            >
              Passer à : <span className="capitalize">{next}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {!next && order.status === "livrée" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 text-sm font-medium print:hidden">
              ✓ Commande livrée
            </div>
          )}
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

      {showDispatch && (
        <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 space-y-4 print:hidden animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Dispatcher un livreur
            </h2>
            <span className="text-xs text-ink-500">{onlineDrivers.length} livreurs disponibles</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={driverSearch}
              onChange={e => setDriverSearch(e.target.value)}
              placeholder="Rechercher un livreur…"
              className="w-full pl-9 pr-3 py-2 border border-cream-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredDrivers.length === 0 && (
              <p className="text-sm text-ink-500 py-4 text-center">Aucun livreur disponible</p>
            )}
            {filteredDrivers.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDriver(prev => prev === d.id ? null : d.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  selectedDriver === d.id
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-cream-200 hover:border-emerald-300 hover:bg-cream-50"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                  {d.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 text-sm">{d.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={d.scoreIA} className="h-1.5 flex-1" />
                    <span className="text-xs text-ink-500 tabular-nums w-12 shrink-0">Score {d.scoreIA}</span>
                  </div>
                </div>
                <div className="text-xs text-ink-500 shrink-0">{d.rating} ★</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-cream-100">
            <button type="button" onClick={() => { setShowDispatch(false); setSelectedDriver(null); }}
              className="px-4 py-2 rounded-lg border border-cream-200 text-sm text-ink-600 hover:bg-cream-50 transition-colors">
              Annuler
            </button>
            <button type="button" onClick={confirmDispatch} disabled={!selectedDriver}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
              Confirmer l&apos;assignation
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="md:col-span-2 bg-white rounded-lg overflow-hidden">
          <DakarMap pins={pins} center={center} zoom={14} height="300px" />
        </div>
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Suivi</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[order.status]} />
        </div>
      </div>

      {/* Bon de livraison — print only */}
      <div className="hidden print:block border-2 border-ink-900 rounded-xl p-8 space-y-6 text-ink-900">
        <div className="flex items-start justify-between border-b border-ink-200 pb-6">
          <div>
            <div className="text-2xl font-bold tracking-tight">YONNE</div>
            <div className="text-xs text-ink-500 mt-1">Livraison intelligente · Dakar, Sénégal</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-400 uppercase tracking-widest">Bon de livraison</div>
            <div className="text-xl font-bold font-mono mt-1">{order.id}</div>
            <div className="text-xs text-ink-500 mt-1">{new Date(order.createdAt).toLocaleString("fr-FR")}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Client</div>
            <div className="font-semibold">{order.clientName}</div>
            <div className="text-sm text-ink-600 mt-1">{order.clientPhone}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Livreur</div>
            <div className="font-semibold">{driver?.name ?? "—"}</div>
            <div className="text-sm text-ink-600 mt-1">{driver?.phone ?? ""}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Point de livraison</div>
            <div className="font-semibold">{landmark?.name ?? "—"}</div>
            <div className="text-sm text-ink-600 mt-1">{landmark?.quartier ?? ""}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Paiement</div>
            <div className="font-semibold capitalize">{order.paymentMethod}</div>
            <div className="text-sm text-ink-600 mt-1">{order.amount.toLocaleString("fr-FR")} F CFA</div>
            {order.insurance && <div className="text-xs text-ink-500 mt-1">+ Assurance colis 200 F</div>}
          </div>
        </div>
        <div className="border-t border-ink-200 pt-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-xs text-ink-400 mb-4">Signature client</div>
            <div className="h-12 border-b border-ink-300" />
          </div>
          <div>
            <div className="text-xs text-ink-400 mb-4">Signature livreur</div>
            <div className="h-12 border-b border-ink-300" />
          </div>
          <div>
            <div className="text-xs text-ink-400 mb-2">Statut</div>
            <div className="text-sm font-bold capitalize">{order.status}</div>
          </div>
        </div>
        <div className="text-[10px] text-ink-400 text-center">
          YONNE · yonne.sn · contact@yonne.sn · +221 78 000 00 00 · Généré le {new Date().toLocaleString("fr-FR")}
        </div>
      </div>
    </div>
  );
}
