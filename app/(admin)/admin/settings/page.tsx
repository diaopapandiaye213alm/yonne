"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
type Prayer = typeof PRAYERS[number];

const FLOOD_ZONES = ["Parcelles Assainies", "Pikine", "Guédiawaye", "Thiaroye", "Yeumbeul"] as const;

const DEFAULTS = {
  platform: { name: "YONNE", city: "Dakar", email: "contact@yonne.sn", phone: "+221 78 000 00 00" },
  ia:       { distance: 40, charge: 30, fiabilite: 30 },
  templates: {
    assigned: "Bonjour {client_name}, votre livreur {driver_name} est en route. Commande {order_id}.",
    pickup:   "Votre livreur {driver_name} arrive au point de collecte. ETA : {eta} min.",
    enroute:  "{driver_name} est en route vers vous. Arrivée estimée : {eta} min.",
    delivered:"Livraison confirmée ! Merci d'avoir utilisé YONNE. Commande {order_id} livrée ✓",
  },
  hivernage:   false,
  floodZones:  [] as string[],
  prayers:     { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true } as Record<Prayer, boolean>,
};

export default function SettingsPage() {
  const t = useT();

  const [loadingInit, setLoadingInit] = useState(true);

  const [platform,   setPlatform]   = useState(DEFAULTS.platform);
  const [iaWeights,  setIaWeights]  = useState(DEFAULTS.ia);
  const [templates,  setTemplates]  = useState(DEFAULTS.templates);
  const [hivernage,  setHivernage]  = useState(DEFAULTS.hivernage);
  const [floodZones, setFloodZones] = useState<string[]>(DEFAULTS.floodZones);
  const [prayers,    setPrayers]    = useState<Record<Prayer, boolean>>(DEFAULTS.prayers);

  const [saving, setSaving] = useState<string | null>(null);

  const weightsSum = iaWeights.distance + iaWeights.charge + iaWeights.fiabilite;

  // Load persisted settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then(r => (r.ok ? r.json() : null))
      .then((data: Record<string, unknown> | null) => {
        if (!data) return;
        if (data.platform)   setPlatform(prev => ({ ...prev, ...(data.platform as typeof DEFAULTS.platform) }));
        if (data.ia)         setIaWeights(prev => ({ ...prev, ...(data.ia as typeof DEFAULTS.ia) }));
        if (data.templates)  setTemplates(prev => ({ ...prev, ...(data.templates as typeof DEFAULTS.templates) }));
        if (typeof data.hivernage === "boolean") setHivernage(data.hivernage);
        if (Array.isArray(data.floodZones)) setFloodZones(data.floodZones as string[]);
        if (data.prayers)    setPrayers(prev => ({ ...prev, ...(data.prayers as Record<Prayer, boolean>) }));
      })
      .catch(() => {/* fallback to defaults silently */})
      .finally(() => setLoadingInit(false));
  }, []);

  const save = useCallback(async (section: string, payload: Record<string, unknown>) => {
    setSaving(section);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur serveur");
      toast.success(`${section} enregistré`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSaving(null);
    }
  }, []);

  function toggleZone(z: string) {
    setFloodZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">{t("navSettings")}</h1>

      {/* Plateforme */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <h2 className="font-semibold text-ink-900">Plateforme</h2>
        {(["name", "city", "email", "phone"] as const).map((field) => {
          const labels = { name: "Nom", city: "Ville principale", email: "Email contact", phone: "Téléphone support" };
          return (
            <div key={field} className="space-y-1">
              <Label htmlFor={`platform-${field}`}>{labels[field]}</Label>
              <Input
                id={`platform-${field}`}
                value={platform[field]}
                onChange={e => setPlatform(prev => ({ ...prev, [field]: e.target.value }))}
              />
            </div>
          );
        })}
        <Button
          onClick={() => save("Plateforme", { platform })}
          disabled={saving === "Plateforme"}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {saving === "Plateforme" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enregistrer
        </Button>
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
        <Button
          onClick={() => save("Algorithme IA", { ia: iaWeights })}
          disabled={weightsSum !== 100 || saving === "Algorithme IA"}
          className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
        >
          {saving === "Algorithme IA" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enregistrer
        </Button>
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
        <Button
          onClick={() => save("Templates WhatsApp", { templates })}
          disabled={saving === "Templates WhatsApp"}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {saving === "Templates WhatsApp" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enregistrer
        </Button>
      </div>

      {/* Mode Hivernage */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Mode Hivernage 🌧️</h2>
          <Switch checked={hivernage} onCheckedChange={v => { setHivernage(v); save("Mode Hivernage", { hivernage: v, floodZones }); }} />
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
            <Button
              onClick={() => save("Mode Hivernage", { hivernage, floodZones })}
              disabled={saving === "Mode Hivernage"}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {saving === "Mode Hivernage" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer zones
            </Button>
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
        <Button
          onClick={() => save("Heures de prière", { prayers })}
          disabled={saving === "Heures de prière"}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {saving === "Heures de prière" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
