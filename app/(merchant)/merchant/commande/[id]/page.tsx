"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useDriversStore } from "@/lib/store/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { ChatBubble } from "@/components/tracking/ChatBubble";
import { EtaBadge } from "@/components/tracking/EtaBadge";
import { DriverCard } from "@/components/tracking/DriverCard";
import { Button } from "@/components/ui/button";
import { Share2, XCircle, AlertTriangle, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";

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
  "en route": "bg-gold-500 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
  "annulée":  "bg-red-100 text-red-600",
};

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

export default function TrackingPage({ params }: { params: { id: string } }) {
  const supabase = useSupabaseAuthed();
  const { orders, cancelOrder, loading } = useOrdersStore();
  const order = orders.find(o => o.id === params.id);
  // RLS filters orders to only the current merchant's — if not found after load, it's not theirs
  const notFound = !loading && orders.length > 0 && !order;

  const status: OrderStatus = order?.status ?? "en route";
  const isCancelled = order?.status === "annulée";
  const canCancel   = order ? order.status !== "livrée" && order.status !== "annulée" : false;

  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling]   = useState(false);

  async function handleCancel() {
    setCancelling(true);
    await cancelOrder(params.id);
    setCancelling(false);
    setShowConfirm(false);
  }

  const { drivers } = useDriversStore();
  const seed = params.id.charCodeAt(params.id.length - 1);
  const onlineDrivers = useMemo(() => drivers.filter(d => d.online && !d.inPrayer), [drivers]);
  const driver = useMemo(() => onlineDrivers[seed % Math.max(1, onlineDrivers.length)] ?? drivers[seed % Math.max(1, drivers.length)], [seed, onlineDrivers, drivers]);
  const destination = useMemo(() => landmarks[seed % landmarks.length], [seed]);

  const [pos, setPos] = useState<[number, number]>([14.6928, -17.4467]);

  useEffect(() => {
    const total = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / total);
      const lat = driver.lat + (destination.lat - driver.lat) * t;
      const lng = driver.lng + (destination.lng - driver.lng) * t;
      setPos([lat, lng]);
      if (t >= 1) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [driver, destination]);

  const distanceKm = useMemo(() => {
    const dLat = destination.lat - pos[0];
    const dLng = destination.lng - pos[1];
    return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;
  }, [pos, destination]);

  const [messages, setMessages] = useState<{ id: number; from_role: "merchant" | "driver"; text: string; sent_at: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", params.id)
      .order("sent_at")
      .then(({ data, error }) => {
        if (error) { toast.error("Impossible de charger les messages"); return; }
        if (data) setMessages(data as { id: number; from_role: "merchant" | "driver"; text: string; sent_at: string }[]);
      });

    const channel = supabase
      .channel(`order_messages_${params.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${params.id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as { id: number; from_role: "merchant" | "driver"; text: string; sent_at: string }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [params.id, supabase]);

  async function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    const { error } = await supabase.from("order_messages").insert({ order_id: params.id, from_role: "merchant", text });
    if (error) {
      setChatInput(text);
      toast.error("Impossible d'envoyer le message");
    }
  }

  const pins = [
    { id: "drv", lat: pos[0], lng: pos[1], kind: "driver" as const },
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ];

  const waText = encodeURIComponent(
    `Suis ta livraison YONNE en temps réel 🛵 ${typeof window !== "undefined" ? `${window.location.origin}/suivi/${params.id}` : ""}`
  );

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
        <XCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-lg font-display font-bold text-ink-900">Commande introuvable</h2>
        <p className="text-sm text-ink-500">Cette commande n&apos;existe pas ou ne vous appartient pas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] h-full">
      <div className="relative">
        <DakarMap pins={pins} trail={{ from: pos, to: [destination.lat, destination.lng] }} center={pos} zoom={14} height="100%" />
      </div>
      <aside className="bg-white border-l border-cream-200 p-5 space-y-5 overflow-y-auto animate-fade-in-up">
        <div>
          <div className="text-xs text-ink-500">Commande</div>
          <div className="font-mono text-sm text-ink-900">{params.id}</div>
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-sm font-bold ${STATUS_COLORS[status]}`}>{status}</span>
        </div>
        <DriverCard driver={driver} />
        <EtaBadge distanceKm={distanceKm} />
        <div>
          <h3 className="font-display font-semibold text-ink-900 mb-3">Suivi</h3>
          <GlovoTimeline activeStage={STATUS_STAGE[status]} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-ink-900 mb-3">Discussion</h3>
          <div className="space-y-2">
            {messages.length === 0 && (
              <div className="text-xs text-ink-400 text-center py-3">Aucun message pour le moment</div>
            )}
            {messages.map(m => (
              <ChatBubble key={m.id} msg={{ from: m.from_role === "merchant" ? "client" : "driver", text: m.text, time: new Date(m.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }} />
            ))}
            <div className="flex gap-2 mt-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Envoyer un message…"
                className="flex-1 border border-cream-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button type="button" onClick={sendMessage} disabled={!chatInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg px-3 py-2">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow gap-2">
            <Share2 className="w-4 h-4" /> Partager le suivi par WhatsApp
          </Button>
        </a>

        {status === "livrée" && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `🛵 Bon de livraison YONNE\n\n` +
              `📦 Commande : ${params.id}\n` +
              `👤 Client : ${order?.clientName ?? "—"}\n` +
              `💰 Montant : ${order?.amount.toLocaleString("fr-FR") ?? "—"} F CFA\n` +
              `💳 Paiement : ${order?.paymentMethod ?? "—"}\n` +
              `✅ Statut : Livrée\n` +
              `📅 Date : ${order ? new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}\n\n` +
              `Merci de votre confiance — YONNE Dakar 🇸🇳`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold gap-2">
              <FileText className="w-4 h-4" /> Envoyer le bon de livraison
            </Button>
          </a>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Commande annulée</span>
          </div>
        )}

        {canCancel && (
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 gap-2"
            onClick={() => setShowConfirm(true)}
          >
            <XCircle className="w-4 h-4" /> Annuler la commande
          </Button>
        )}
      </aside>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-ink-900">Annuler la commande ?</h3>
                <p className="text-sm text-ink-500 mt-1">
                  Cette action est irréversible. La commande {params.id} sera annulée et le livreur en sera informé.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                Garder
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? "Annulation…" : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
