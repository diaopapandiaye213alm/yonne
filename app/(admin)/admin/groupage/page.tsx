"use client";
import { useState } from "react";
import { toast } from "sonner";
import { GitMerge, MapPin, Clock, TrendingDown, Package } from "lucide-react";
import { useT } from "@/lib/i18n";

type Group = { id: string; orders: string[]; zone: string; driver: string; saving: string; distance: string };

const GROUPS_INIT: Group[] = [
  { id: "G-001", orders: ["YN-2026-10124", "YN-2026-10122", "YN-2026-10118"], zone: "Plateau",   driver: "Khady Diallo", saving: "35 min", distance: "2.1 km" },
  { id: "G-002", orders: ["YN-2026-10115", "YN-2026-10113"],                   zone: "Médina",    driver: "Moussa Sarr",  saving: "18 min", distance: "1.4 km" },
  { id: "G-003", orders: ["YN-2026-10108", "YN-2026-10106", "YN-2026-10104"], zone: "Grand Yoff", driver: "—",            saving: "28 min", distance: "1.8 km" },
];

export default function GroupagePage() {
  const t = useT();
  const [radius, setRadius]   = useState(800);
  const [maxSize, setMaxSize] = useState(3);
  const [groups, setGroups]   = useState<Group[]>(GROUPS_INIT);

  function assign(gid: string) {
    setGroups(prev => prev.map(g => g.id === gid ? { ...g, driver: "Auto-assigné" } : g));
    toast.success(`Groupe ${gid} assigné au meilleur livreur disponible`);
  }

  const totalOrders = groups.reduce((s, g) => s + g.orders.length, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">{t("groupageTitle")}</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Groupes actifs",     value: String(groups.length), icon: GitMerge,    color: "text-emerald-600" },
          { label: "Commandes groupées", value: String(totalOrders),   icon: Package,     color: "text-ink-700" },
          { label: "Temps économisé",    value: "81 min",              icon: Clock,       color: "text-gold-500" },
          { label: "CO₂ évité",          value: "1.2 kg",              icon: TrendingDown, color: "text-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Configuration algorithme Haversine</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-ink-700 font-medium">Rayon de groupage</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={200} max={2000} step={100} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="flex-1 accent-emerald-500" />
              <span className="text-sm font-medium text-ink-900 w-16">{radius} m</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-ink-700 font-medium">Taille max du groupe</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={2} max={4} step={1} value={maxSize}
                onChange={e => setMaxSize(Number(e.target.value))}
                className="flex-1 accent-emerald-500" />
              <span className="text-sm font-medium text-ink-900 w-16">{maxSize} cmdes</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-cream-50 rounded-lg text-sm text-ink-500">
          Économie estimée : <strong className="text-emerald-600">~{Math.round(radius / 10 + maxSize * 8)} min</strong> · Rayon {radius} m · Max {maxSize} commandes/groupe
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-ink-900">Groupes en cours</h2>
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-400">{g.id}</span>
                <span className="text-sm font-semibold text-ink-900">{g.zone}</span>
                <span className="text-xs bg-cream-100 text-ink-500 px-2 py-0.5 rounded-full">{g.orders.length} commandes</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold-500" /> {g.saving}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-ink-400" /> {g.distance}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {g.orders.map(ref => (
                <span key={ref} className="font-mono text-xs bg-emerald-500/10 text-emerald-700 px-2 py-1 rounded">{ref}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Livreur : <strong className="text-ink-900">{g.driver}</strong></span>
              {g.driver === "—" && (
                <button type="button" onClick={() => assign(g.id)}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Assigner livreur IA
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
