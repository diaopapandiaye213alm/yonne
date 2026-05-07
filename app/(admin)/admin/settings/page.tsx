"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
type Prayer = typeof PRAYERS[number];

const FLOOD_ZONES = ["Parcelles Assainies", "Pikine", "Guédiawaye", "Thiaroye", "Yeumbeul"] as const;

const IA_WEIGHTS_DEFAULT = { distance: 40, charge: 30, fiabilite: 30 };

const WA_TEMPLATES_DEFAULT = {
  assigned: "Bonjour {client_name}, votre livreur {driver_name} est en route. Commande {order_id}.",
  pickup:   "Votre livreur {driver_name} arrive au point de collecte. ETA : {eta} min.",
  enroute:  "{driver_name} est en route vers vous. Arrivée estimée : {eta} min.",
  delivered:"Livraison confirmée ! Merci d'avoir utilisé YONNE. Commande {order_id} livrée ✓",
};

export default function SettingsPage() {
  const [iaWeights,   setIaWeights]   = useState(IA_WEIGHTS_DEFAULT);
  const [templates,   setTemplates]   = useState(WA_TEMPLATES_DEFAULT);
  const [hivernage,   setHivernage]   = useState(false);
  const [floodZones,  setFloodZones]  = useState<string[]>([]);
  const [prayers,     setPrayers]     = useState<Record<Prayer, boolean>>({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true });

  const weightsSum = iaWeights.distance + iaWeights.charge + iaWeights.fiabilite;

  function save(section: string) { toast.success(`${section} enregistré`); }

  function toggleZone(z: string) {
    setFloodZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>

      {/* Plateforme */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Plateforme</h2>
        {[
          { id: "platform-name",  label: "Nom",               defaultValue: "YONNE" },
          { id: "platform-city",  label: "Ville principale",  defaultValue: "Dakar" },
          { id: "platform-email", label: "Email contact",     defaultValue: "contact@yonne.sn" },
          { id: "platform-phone", label: "Téléphone support", defaultValue: "+221 78 000 00 00" },
        ].map(({ id, label, defaultValue }) => (
          <div key={id} className="space-y-1">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} defaultValue={defaultValue} />
          </div>
        ))}
        <Button onClick={() => save("Plateforme")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>

      {/* Algorithme IA */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Algorithme Dispatch IA</h2>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", weightsSum === 100 ? "bg-emerald-500/15 text-emerald-700" : "bg-red-100 text-red-700")}>
            Somme : {weightsSum}%{weightsSum !== 100 && " ≠ 100"}
          </span>
        </div>
        {(["distance", "charge", "fiabilite"] as const).map(key => {
          const labels = { distance: "Distance (cible 40%)", charge: "Charge livreur (cible 30%)", fiabilite: "Fiabilité (cible 30%)" };
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <Label>{labels[key]}</Label>
                <span className="tabular-nums font-medium">{iaWeights[key]}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={iaWeights[key]}
                onChange={e => setIaWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
            </div>
          );
        })}
        <Button onClick={() => save("Algorithme IA")} disabled={weightsSum !== 100} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50">Enregistrer</Button>
      </div>

      {/* Templates WhatsApp */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Templates WhatsApp</h2>
        <p className="text-xs text-ink-500">Variables disponibles : <code className="bg-cream-100 px-1 rounded">{"{client_name}"}</code> <code className="bg-cream-100 px-1 rounded">{"{driver_name}"}</code> <code className="bg-cream-100 px-1 rounded">{"{eta}"}</code> <code className="bg-cream-100 px-1 rounded">{"{order_id}"}</code></p>
        {(["assigned", "pickup", "enroute", "delivered"] as const).map(k => {
          const labels = { assigned: "Commande assignée", pickup: "En route collecte", enroute: "En route client", delivered: "Livraison confirmée" };
          return (
            <div key={k} className="space-y-1">
              <Label>{labels[k]}</Label>
              <textarea
                rows={2}
                value={templates[k]}
                onChange={e => setTemplates(prev => ({ ...prev, [k]: e.target.value }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          );
        })}
        <Button onClick={() => save("Templates WhatsApp")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>

      {/* Mode Hivernage */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Mode Hivernage 🌧️</h2>
          <Switch checked={hivernage} onCheckedChange={setHivernage} />
        </div>
        {hivernage && (
          <>
            <p className="text-sm text-ink-500">Zones inondées — surge météo +20%, prime livreur +500 F/livraison</p>
            <div className="grid grid-cols-2 gap-2">
              {FLOOD_ZONES.map(z => (
                <label key={z} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={floodZones.includes(z)} onChange={() => toggleZone(z)} className="accent-emerald-600" />
                  {z}
                </label>
              ))}
            </div>
            <Button onClick={() => save("Mode Hivernage")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
          </>
        )}
      </div>

      {/* Heures de prière */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Pause heures de prière 🕌</h2>
        <p className="text-sm text-ink-500">Micro-surge ×1.1 activé 10 min avant chaque prière sélectionnée.</p>
        <div className="space-y-3">
          {PRAYERS.map(p => (
            <div key={p} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id={`prayer-${p}`}
                  checked={prayers[p]}
                  onCheckedChange={v => setPrayers(prev => ({ ...prev, [p]: v }))}
                />
                <Label htmlFor={`prayer-${p}`} className="cursor-pointer">{p}</Label>
              </div>
              {prayers[p] && <span className="text-xs text-ink-500 bg-cream-100 px-2 py-1 rounded">Pause + ×1.1 avant</span>}
            </div>
          ))}
        </div>
        <Button onClick={() => save("Heures de prière")} className="bg-emerald-500 hover:bg-emerald-600 text-white">Enregistrer</Button>
      </div>
    </div>
  );
}
