"use client";

import { useState } from "react";
import Image from "next/image";
import { useDriversStore, avatarUrl } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriverStore } from "@/lib/store/driver";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { PushNotifBanner } from "@/components/driver/PushNotifBanner";
import { cn } from "@/lib/utils";
import { LogOut, Moon, Pencil, Check, X, Star, Award } from "lucide-react";

// demo resolved in component from store

const ALL_BADGES = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"] as const;

const BADGE_DESC: Record<string, string> = {
  "Rapide":     "Livraison en moins de 25 min",
  "Top noté":   "Note ≥ 4.8 sur 7 jours",
  "Précis":     "0 erreur d'adresse sur 20 courses",
  "10 jours":   "10 jours consécutifs actif",
  "50 courses": "50 livraisons complétées",
  "Eco":        "100% véhicule propre",
};

const tierStyle: Record<string, string> = {
  Bronze: "bg-amber-700/15 text-amber-800 border-amber-700/30",
  Argent: "bg-slate-200 text-slate-700 border-slate-300",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/50",
};

const monthlyEarnings = [
  { month: "Jan", amount: 145000 },
  { month: "Fév", amount: 168000 },
  { month: "Mar", amount: 152000 },
  { month: "Avr", amount: 187000 },
  { month: "Mai", amount: 210000 },
];
const maxMonth = Math.max(...monthlyEarnings.map(m => m.amount));

export default function ProfilPage() {
  const t = useT();
  const { online, inPrayer, setOnline, setInPrayer } = useDriverStore();
  const { drivers } = useDriversStore();
  const { orders }  = useOrdersStore();
  const demo = drivers[0] ?? { id: "drv-001", name: "—", phone: "", vehicle: "Moto Yamaha", rating: 5, tier: "Bronze", badges: [], ordersToday: 0, earningsToday: 0, avatarSeed: "" };

  const [editing,     setEditing]     = useState(false);
  const [editPhone,   setEditPhone]   = useState(demo.phone);
  const [editVehicle, setEditVehicle] = useState(demo.vehicle);

  const totalOrders = orders.filter(o => o.driverId === demo.id).length || demo.ordersToday * 14;

  function saveEdit() {
    setEditing(false);
    toast.success("Profil mis à jour");
  }

  return (
    <div className="pb-24 px-4 pt-6 space-y-5">
      <PushNotifBanner />

      {inPrayer && (
        <div className="bg-gold-500/15 border border-gold-500/30 rounded-lg text-center text-sm font-medium text-ink-900 py-2 px-4">
          🕌 Mode prière actif — vous apparaissez hors ligne
        </div>
      )}

      {/* Avatar + identity */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
        <div className="flex items-center gap-4">
          <Image src={avatarUrl(demo)} alt={demo.name} width={72} height={72} unoptimized
            className="rounded-full bg-cream-100 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-xl text-ink-900 truncate">{demo.name}</div>
            <span className={cn("inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium", tierStyle[demo.tier] ?? tierStyle.Bronze)}>
              Livreur {demo.tier}
            </span>
          </div>
          {editing ? (
            <div className="flex gap-1.5 shrink-0">
              <button type="button" onClick={saveEdit}
                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => { setEditing(false); setEditPhone(demo.phone); setEditVehicle(demo.vehicle); }}
                className="p-1.5 border border-cream-200 text-ink-500 rounded-lg hover:bg-cream-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditing(true)}
              className="p-1.5 border border-cream-200 text-ink-500 rounded-lg hover:bg-cream-100 transition-colors shrink-0">
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Téléphone</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Véhicule</label>
              <select value={editVehicle} onChange={e => setEditVehicle(e.target.value as typeof demo.vehicle)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                {(["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"] as const).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
            <span className="text-ink-500">Téléphone</span>
            <span className="text-ink-900 font-medium text-right">{editPhone}</span>
            <span className="text-ink-500">Véhicule</span>
            <span className="text-ink-900 font-medium text-right">{editVehicle}</span>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card divide-y divide-cream-100">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium text-ink-900">{t("online")}</span>
          <Switch checked={online} onCheckedChange={setOnline} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-ink-900">{t("prayerMode")}</span>
          </div>
          <Switch checked={inPrayer} onCheckedChange={setInPrayer} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Courses auj.",      value: String(demo.ordersToday),                                    color: "text-ink-900" },
          { label: "Gains auj.",        value: `${demo.earningsToday.toLocaleString("fr-FR")} F`,           color: "text-emerald-500" },
          { label: "Note moyenne",      value: `${demo.rating.toFixed(1)} ★`,                              color: "text-gold-500" },
          { label: "Total livraisons",  value: String(totalOrders),                                         color: "text-ink-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-3">
            <div className={`font-mono font-bold text-lg ${color}`}>{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly earnings chart */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
        <h2 className="text-sm font-display font-semibold text-ink-900 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-gold-500" /> Gains mensuels
        </h2>
        <div className="flex items-end gap-2 h-20">
          {monthlyEarnings.map(({ month, amount }, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t transition-all ${i === monthlyEarnings.length - 1 ? "bg-emerald-500" : "bg-cream-200"}`}
                style={{ height: `${Math.round((amount / maxMonth) * 72)}px` }} />
              <span className="text-xs text-ink-500">{month}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-cream-100 flex justify-between text-xs text-ink-500">
          <span>Ce mois</span>
          <span className="font-semibold text-emerald-600 tabular-nums">
            {monthlyEarnings[monthlyEarnings.length - 1].amount.toLocaleString("fr-FR")} F
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
        <h2 className="text-sm font-display font-semibold text-ink-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-gold-500" /> Badges
        </h2>
        <div className="space-y-2">
          {ALL_BADGES.map(badge => {
            const earned = (demo.badges as readonly string[]).includes(badge);
            return (
              <div key={badge} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                earned ? "bg-gold-500/5 border-gold-500/20" : "border-transparent opacity-40"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  earned ? "bg-gold-500/20" : "bg-cream-100"
                }`}>
                  {earned ? "🏅" : "○"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${earned ? "text-ink-900" : "text-ink-500"}`}>{badge}</div>
                  <div className="text-xs text-ink-400">{BADGE_DESC[badge]}</div>
                </div>
                {earned && <span className="text-xs text-gold-600 font-medium shrink-0">Obtenu ✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <form action="/api/auth/logout" method="POST">
        <button type="submit" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors cursor-pointer">
          <LogOut className="w-4 h-4" /> Se déconnecter
        </button>
      </form>
    </div>
  );
}
