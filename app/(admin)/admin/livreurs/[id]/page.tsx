"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useDriversStore } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";
import type { Tier } from "@/lib/mock-data/drivers";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import {
  ArrowLeft, Star, Bike, Package,
  Edit2, Check, X, MessageSquare, Send, Phone, WifiOff,
} from "lucide-react";

const TIER_COLORS: Record<Tier, string> = {
  Bronze: "bg-amber-100 text-amber-700 border-amber-200",
  Argent: "bg-gray-100 text-gray-700 border-gray-200",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/30",
};

const ALL_BADGES = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"] as const;

type ChatMessage = { id: number; from_role: string; text: string; sent_at: string };

function ScoreGauge({ value }: { value: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f0eb" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-display font-bold text-ink-900 tabular-nums leading-none">{value}</div>
        <div className="text-xs text-ink-500">/100</div>
      </div>
    </div>
  );
}

export default function LivreurDetailPage({ params }: { params: { id: string } }) {
  const supabase = useSupabaseAuthed();
  const { drivers, updateDriver } = useDriversStore();
  const { orders }  = useOrdersStore();
  const driver = drivers.find(d => d.id === params.id);
  const [editing,     setEditing]     = useState(false);
  const [editName,    setEditName]    = useState("");
  const [editPhone,   setEditPhone]   = useState("");
  const [editVehicle, setEditVehicle] = useState<"Moto Yamaha" | "Moto TVS" | "Vélo électrique" | "Tricycle">("Moto Yamaha");
  const [editTier,    setEditTier]    = useState<Tier>("Bronze");
  const [editOnline,  setEditOnline]  = useState(false);

  useEffect(() => {
    if (driver) {
      setEditName(driver.name);
      setEditPhone(driver.phone);
      setEditVehicle(driver.vehicle);
      setEditTier(driver.tier);
      setEditOnline(driver.online);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver?.id]); // intentionally keyed on id to avoid re-running on unrelated re-renders

  const [chatMsg,    setChatMsg]    = useState("");
  const [chat,       setChat]       = useState<ChatMessage[]>([]);
  const [chatOnline, setChatOnline] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    supabase
      .from("admin_messages")
      .select("id, from_role, text, sent_at")
      .eq("subject_type", "driver")
      .eq("subject_id", params.id)
      .order("sent_at")
      .then(
        ({ data, error }) => {
          if (error) { toast.error("Impossible de charger les messages"); return; }
          if (data) setChat(data as ChatMessage[]);
        },
        () => toast.error("Impossible de charger les messages")
      );

    const channel = supabase
      .channel(`admin_messages_driver_${params.id}_${Date.now()}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "admin_messages",
        filter: `subject_id=eq.${params.id}`,
      }, (payload) => {
        setChat(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe((status) => {
        if (
          status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
          status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
        ) {
          setChatOnline(false);
          console.error("[Realtime] admin_messages subscription failed — driver:", params.id);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [params.id, supabase]);

  if (drivers.length > 0 && !driver) notFound();
  if (!driver) return <div className="p-6 text-ink-500">Chargement…</div>;

  const driverOrders  = orders.filter(o => o.driverId === driver.id).slice(0, 10);
  const weekEarnings  = [12000, 18500, 22000, 15000, 28000, 31000, driver.earningsToday];
  const maxEarning    = Math.max(...weekEarnings);
  const scoreDistance = Math.round(driver.scoreIA * 0.92);
  const scoreCharge   = Math.round(driver.scoreIA * 0.85);
  const scoreFiab     = Math.round(driver.scoreIA * 0.97);

  async function saveEdit() {
    if (!driver) return;
    const { error } = await supabase.from("drivers").update({
      name:    editName,
      phone:   editPhone,
      vehicle: editVehicle,
      tier:    editTier,
      online:  editOnline,
    }).eq("id", driver.id);
    if (error) { toast.error("Impossible de sauvegarder les modifications"); return; }
    updateDriver(driver.id, { name: editName, phone: editPhone, vehicle: editVehicle, tier: editTier, online: editOnline });
    setEditing(false);
    toast.success("Fiche livreur mise à jour");
  }

  async function sendChat() {
    const text = chatMsg.trim();
    if (!text) return;
    setChatMsg("");
    const { error } = await supabase.from("admin_messages").insert({
      subject_type: "driver",
      subject_id: params.id,
      from_role: "admin",
      text,
    });
    if (error) {
      setChatMsg(text);
      toast.error("Impossible d'envoyer le message");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/livreurs" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-lg">
              {editName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              {editing ? (
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="text-xl font-display font-bold text-ink-900 border-b border-emerald-400 outline-none bg-transparent w-48" />
              ) : (
                <h1 className="text-xl font-display font-bold text-ink-900">{editName}</h1>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TIER_COLORS[driver.tier]}`}>{driver.tier}</span>
            </div>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${driver.online ? "bg-emerald-500/15 text-emerald-700" : "bg-cream-200 text-ink-500"}`}>
          {driver.online ? "● Actif" : "○ Hors-ligne"}
        </span>
        {editing ? (
          <div className="flex gap-2">
            <button type="button" onClick={saveEdit}
              className="flex items-center gap-1.5 bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-emerald-600 transition-colors">
              <Check className="w-4 h-4" /> Enregistrer
            </button>
            <button type="button" onClick={() => { setEditing(false); setEditName(driver.name); setEditPhone(driver.phone); setEditVehicle(driver.vehicle); setEditTier(driver.tier); setEditOnline(driver.online); }}
              className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 border border-cream-200 text-ink-700 rounded-lg px-3 py-1.5 text-sm hover:bg-cream-100 transition-colors">
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 animate-fade-in-up">
          <h2 className="font-semibold text-ink-900 mb-4">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Nom complet</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Téléphone</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Véhicule</label>
              <select value={editVehicle} onChange={e => setEditVehicle(e.target.value as typeof driver.vehicle)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                {(["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"] as const).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Tier</label>
              <select value={editTier} onChange={e => setEditTier(e.target.value as Tier)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                {(["Bronze","Argent","Or"] as const).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="text-xs text-ink-500">Actif</label>
              <button
                type="button"
                onClick={() => setEditOnline(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editOnline ? "bg-emerald-500" : "bg-cream-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editOnline ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-xs text-ink-700">{editOnline ? "En ligne" : "Hors-ligne"}</span>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Livraisons totales", value: String(driverOrders.length), icon: Package },
          { label: "Note moyenne",       value: `${driver.rating} ★`,                                        icon: Star },
          { label: "Véhicule",           value: editVehicle,                                                  icon: Bike },
          { label: "Téléphone",          value: editPhone,                                                    icon: Phone },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-base font-display font-bold text-ink-900 tabular-nums truncate">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Score IA + Gains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Score IA</h2>
          <div className="flex items-center gap-6">
            <ScoreGauge value={driver.scoreIA} />
            <div className="flex-1 space-y-3">
              {[
                { label: "Distance (40%)",  value: scoreDistance },
                { label: "Charge (30%)",    value: scoreCharge },
                { label: "Fiabilité (30%)", value: scoreFiab },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ink-700">{label}</span>
                    <span className="tabular-nums font-medium">{value}/100</span>
                  </div>
                  <Progress value={value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Gains — 7 derniers jours</h2>
          <div className="flex items-end gap-1 h-24">
            {weekEarnings.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t ${i === 6 ? "bg-emerald-500" : "bg-cream-200"}`}
                  style={{ height: `${Math.round((v / maxEarning) * 80)}px` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {["L","M","Me","J","V","S","D"].map(j => (
              <div key={j} className="flex-1 text-center text-xs text-ink-500">{j}</div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-cream-100 flex justify-between text-xs text-ink-500">
            <span>Total semaine</span>
            <span className="font-semibold text-ink-900 tabular-nums">
              {weekEarnings.reduce((a, b) => a + b, 0).toLocaleString("fr-FR")} F
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map(badge => (
            <span key={badge}
              className={`text-sm px-3 py-1.5 rounded-full border font-medium ${
                (driver.badges as readonly string[]).includes(badge)
                  ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
                  : "bg-cream-100 border-cream-200 text-ink-500 opacity-40"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Last deliveries */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">10 dernières livraisons</h2>
        {driverOrders.length === 0 ? (
          <p className="text-sm text-ink-500">Aucune livraison enregistrée.</p>
        ) : (
          <div className="space-y-2">
            {driverOrders.map(o => (
              <Link key={o.id} href={`/admin/commandes/${o.id}`}
                className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded transition-colors">
                <span className="font-mono text-xs text-emerald-500">{o.id}</span>
                <span className="text-sm text-ink-700">{o.clientName}</span>
                <span className="text-sm font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SAV Chat */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" /> Chat SAV
          {!chatOnline && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
              <WifiOff className="w-3 h-3" /> Déconnecté
            </span>
          )}
        </h2>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
          {chat.length === 0 && (
            <div className="text-xs text-ink-400 text-center py-4">Aucun message pour le moment</div>
          )}
          {chat.map(m => (
            <div key={m.id} className={`flex ${m.from_role === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                m.from_role === "admin"
                  ? "bg-emerald-500 text-white rounded-br-none"
                  : "bg-cream-100 text-ink-900 rounded-bl-none"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Envoyer un message au livreur…"
            className="flex-1 border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          <button type="button" onClick={sendChat}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-2 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
