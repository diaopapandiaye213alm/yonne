"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zoneActivity } from "@/lib/mock-data/analytics";
import { MapPin, Plus, Zap, ToggleLeft, ToggleRight, TrendingUp, X, Globe } from "lucide-react";
import { useT } from "@/lib/i18n";
import { SENEGAL_REGIONS } from "@/lib/senegal-locations";

interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  orders: number;
  radius: number;
  active: boolean;
  surgeMultiplier: number;
  deliveryFee: number;
}

const INITIAL_ZONES: Zone[] = zoneActivity.map((z, i) => ({
  id:              `zone-${i + 1}`,
  name:            z.name,
  lat:             z.lat,
  lng:             z.lng,
  orders:          z.orders,
  radius:          z.radius,
  active:          true,
  surgeMultiplier: i < 2 ? 1.4 : i < 5 ? 1.2 : 1.0,
  deliveryFee:     1000 + Math.floor((8 - i) * 200),
}));

const ZONES_KEY = "yonne_delivery_zones";
function isZoneArray(v: unknown): v is Zone[] {
  return (
    Array.isArray(v) &&
    v.every(
      (z) =>
        z !== null &&
        typeof z === "object" &&
        typeof (z as Zone).id === "string" &&
        typeof (z as Zone).name === "string" &&
        typeof (z as Zone).lat === "number" &&
        typeof (z as Zone).lng === "number" &&
        typeof (z as Zone).active === "boolean"
    )
  );
}
function loadZones(): Zone[] {
  try {
    const raw = localStorage.getItem(ZONES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isZoneArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return INITIAL_ZONES;
}
function saveZones(zones: Zone[]) {
  try { localStorage.setItem(ZONES_KEY, JSON.stringify(zones)); } catch { /* ignore */ }
}

const ACTIVITY_COLORS = ["bg-red-500","bg-orange-500","bg-amber-500","bg-emerald-400","bg-emerald-300","bg-emerald-200","bg-cream-300","bg-cream-200"];

function ActivityBar({ orders, max }: { orders: number; max: number }) {
  const pct = Math.round((orders / max) * 100);
  const colorIdx = Math.min(7, Math.floor((1 - orders / max) * 8));
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${ACTIVITY_COLORS[colorIdx]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-ink-500 w-8 text-right">{orders}</span>
    </div>
  );
}

interface RegionCoverage {
  region: string;
  active: boolean;
  surge_multiplier: number;
  base_fee: number;
}

const INITIAL_COVERAGE: RegionCoverage[] = SENEGAL_REGIONS.map((r, i) => ({
  region: r.name,
  active: i < 4,
  surge_multiplier: 1.0,
  base_fee: i === 0 ? 900 : i < 3 ? 1200 : 1500 + i * 100,
}));

export default function ZonesPage() {
  const t = useT();
  const [zones,    setZones]    = useState<Zone[]>(INITIAL_ZONES); // loaded from localStorage on mount
  const [coverage, setCoverage] = useState<RegionCoverage[]>(INITIAL_COVERAGE);
  useEffect(() => { setZones(loadZones()); }, []);
  function persistZones(next: Zone[]) {
    setZones(next);
    saveZones(next);
  }
  const [showAdd,  setShowAdd]  = useState(false);
  const [newName,  setNewName]  = useState("");
  const [newFee,   setNewFee]   = useState("1000");
  const [editId,   setEditId]   = useState<string | null>(null);
  const [editFee,  setEditFee]  = useState("");
  const [editSurge,setEditSurge]= useState("");

  const maxOrders = Math.max(...zones.map(z => z.orders));
  const activeCount = zones.filter(z => z.active).length;
  const totalOrders = zones.reduce((s, z) => s + (z.active ? z.orders : 0), 0);
  const avgFee = Math.round(zones.reduce((s, z) => s + z.deliveryFee, 0) / zones.length);

  function toggleZone(id: string) {
    const next = zones.map(z => z.id === id ? { ...z, active: !z.active } : z);
    persistZones(next);
  }

  function saveEdit(id: string) {
    const next = zones.map(z =>
      z.id === id
        ? { ...z, deliveryFee: Number(editFee) || z.deliveryFee, surgeMultiplier: Number(editSurge) || z.surgeMultiplier }
        : z
    );
    persistZones(next);
    setEditId(null);
    toast.success("Zone mise à jour");
  }

  function addZone() {
    if (!newName.trim()) return;
    const zone: Zone = {
      id:              `zone-${Date.now()}`,
      name:            newName.trim(),
      lat:             14.693,
      lng:             -17.447,
      orders:          0,
      radius:          400,
      active:          true,
      surgeMultiplier: 1.0,
      deliveryFee:     Number(newFee) || 1000,
    };
    persistZones([...zones, zone]);
    setShowAdd(false);
    setNewName(""); setNewFee("1000");
    toast.success(`Zone "${zone.name}" ajoutée`);
  }

  function removeZone(id: string) {
    persistZones(zones.filter(z => z.id !== id));
    toast.success("Zone supprimée");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("zonesTitle")}</h1>
          <p className="text-sm text-ink-500 mt-1">Dakar · {zones.length} zones configurées</p>
        </div>
        <button type="button" onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? "Annuler" : "Ajouter une zone"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 animate-fade-in-up">
          <h2 className="font-semibold text-ink-900 mb-4">Nouvelle zone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Nom du quartier</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Yoff"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Frais de livraison de base (F)</label>
              <input type="number" value={newFee} onChange={e => setNewFee(e.target.value)} placeholder="1000"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <button type="button" onClick={addZone}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors">
            Créer la zone
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Zones actives",   value: `${activeCount} / ${zones.length}`, icon: MapPin,     color: "text-emerald-600" },
          { label: "Commandes actives", value: String(totalOrders),              icon: TrendingUp, color: "text-gold-500" },
          { label: "Frais moyen",     value: `${avgFee.toLocaleString("fr-FR")} F`, icon: Zap,     color: "text-ink-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Zone list */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cream-100 bg-cream-50">
          <div className="grid grid-cols-[1fr_2fr_80px_90px_90px_80px_40px] gap-3 text-xs font-semibold text-ink-500 uppercase tracking-wider">
            <span>Zone</span>
            <span>Activité</span>
            <span>Frais</span>
            <span>Surge</span>
            <span>Rayon</span>
            <span>Statut</span>
            <span />
          </div>
        </div>

        <div className="divide-y divide-cream-50">
          {zones.map(zone => {
            const isEditing = editId === zone.id;
            return (
              <div key={zone.id} className={`px-5 py-3 grid grid-cols-[1fr_2fr_80px_90px_90px_80px_40px] gap-3 items-center text-sm hover:bg-cream-50 transition-colors ${!zone.active ? "opacity-50" : ""}`}>

                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium text-ink-900 truncate">{zone.name}</span>
                </div>

                {/* Activity bar */}
                <ActivityBar orders={zone.orders} max={maxOrders} />

                {/* Delivery fee */}
                {isEditing ? (
                  <input type="number" value={editFee} onChange={e => setEditFee(e.target.value)}
                    className="w-full border border-cream-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                ) : (
                  <button type="button" onClick={() => { setEditId(zone.id); setEditFee(String(zone.deliveryFee)); setEditSurge(String(zone.surgeMultiplier)); }}
                    className="text-xs text-ink-700 hover:text-emerald-600 tabular-nums text-left">
                    {zone.deliveryFee.toLocaleString("fr-FR")} F
                  </button>
                )}

                {/* Surge */}
                {isEditing ? (
                  <input type="number" step="0.1" min="1" max="3" value={editSurge} onChange={e => setEditSurge(e.target.value)}
                    className="w-full border border-cream-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                ) : (
                  <span className={`text-xs font-medium tabular-nums px-1.5 py-0.5 rounded ${
                    zone.surgeMultiplier >= 1.4 ? "bg-red-100 text-red-700" :
                    zone.surgeMultiplier >= 1.2 ? "bg-amber-100 text-amber-700" :
                    "bg-cream-100 text-ink-600"
                  }`}>
                    × {zone.surgeMultiplier.toFixed(1)}
                  </span>
                )}

                {/* Radius */}
                <span className="text-xs text-ink-500 tabular-nums">{zone.radius} m</span>

                {/* Toggle */}
                <div className="flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={() => saveEdit(zone.id)}
                        className="text-xs bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600 transition-colors">
                        ✓
                      </button>
                      <button type="button" onClick={() => setEditId(null)}
                        className="text-xs border border-cream-200 text-ink-500 px-2 py-1 rounded hover:bg-cream-100 transition-colors">
                        ✕
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => toggleZone(zone.id)}
                      className="transition-colors">
                      {zone.active
                        ? <ToggleRight className="w-7 h-7 text-emerald-500" />
                        : <ToggleLeft className="w-7 h-7 text-ink-300" />}
                    </button>
                  )}
                </div>

                {/* Delete */}
                <button type="button" onClick={() => removeZone(zone.id)}
                  className="text-ink-300 hover:text-red-500 transition-colors p-1 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sénégal regions coverage */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-cream-100 bg-cream-50">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h2 className="font-display font-semibold text-ink-900 text-sm">Couverture régionale Sénégal</h2>
        </div>
        <div className="divide-y divide-cream-50">
          {coverage.map(rc => (
            <div key={rc.region} className={`px-5 py-3 grid grid-cols-[1fr_80px_90px_48px] gap-3 items-center text-sm hover:bg-cream-50 transition-colors ${!rc.active ? "opacity-50" : ""}`}>
              <span className="font-medium text-ink-900">{rc.region}</span>
              <span className="text-xs tabular-nums text-ink-600">{rc.base_fee.toLocaleString("fr-FR")} F</span>
              <span className={`text-xs font-medium tabular-nums px-1.5 py-0.5 rounded text-center ${
                rc.surge_multiplier >= 1.4 ? "bg-red-100 text-red-700" :
                rc.surge_multiplier >= 1.2 ? "bg-amber-100 text-amber-700" :
                "bg-cream-100 text-ink-600"
              }`}>× {rc.surge_multiplier.toFixed(1)}</span>
              <button
                type="button"
                onClick={() => {
                  setCoverage(prev => prev.map(c =>
                    c.region === rc.region ? { ...c, active: !c.active } : c
                  ));
                  toast.success(`${rc.region} ${rc.active ? "désactivée" : "activée"}`);
                }}
                className="transition-colors"
              >
                {rc.active
                  ? <ToggleRight className="w-7 h-7 text-emerald-500" />
                  : <ToggleLeft className="w-7 h-7 text-ink-300" />}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
