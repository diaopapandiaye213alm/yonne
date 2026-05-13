"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Umbrella, AlertTriangle, TrendingUp, ToggleLeft, ToggleRight, MapPin } from "lucide-react";

const ZONES = [
  { name: "Médina",              risk: 5, status: "Inondée",      lat: 14.677, lng: -17.448 },
  { name: "Parcelles Assainies", risk: 4, status: "Risque élevé", lat: 14.761, lng: -17.429 },
  { name: "Grand Yoff",          risk: 3, status: "Vigilance",    lat: 14.732, lng: -17.458 },
  { name: "Plateau",             risk: 1, status: "OK",           lat: 14.672, lng: -17.438 },
  { name: "Almadies",            risk: 1, status: "OK",           lat: 14.749, lng: -17.529 },
  { name: "Ouakam",              risk: 2, status: "Légère",       lat: 14.743, lng: -17.501 },
];

const RISK_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-700", 2: "bg-yellow-100 text-yellow-700",
  3: "bg-amber-100 text-amber-700",     4: "bg-orange-100 text-orange-700",
  5: "bg-red-100 text-red-700",
};

export default function HivernagePage() {
  const [active, setActive] = useState(false);
  const [surge, setSurge] = useState(1.3);
  const [bonus, setBonus] = useState(500);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Mode Hivernage</h1>
          <p className="text-sm text-ink-500 mt-1">Saison des pluies · Juillet–Octobre</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-200 rounded-lg px-4 py-2.5 shadow-card">
          <Umbrella className={`w-5 h-5 ${active ? "text-blue-500" : "text-ink-400"}`} />
          <span className="text-sm text-ink-700 font-medium">Mode hivernage</span>
          <button type="button" onClick={() => {
            setActive(v => !v);
            toast.success(active ? "Mode hivernage désactivé" : "Mode hivernage activé — surge et prime actifs");
          }}>
            {active
              ? <ToggleRight className="w-8 h-8 text-blue-500" />
              : <ToggleLeft className="w-8 h-8 text-ink-400" />}
          </button>
        </div>
      </div>

      {active && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="text-sm text-blue-700 font-medium">Mode hivernage actif — surge ×{surge.toFixed(1)} · Prime livreur +{bonus} F/livraison · 3 zones restreintes</span>
        </div>
      )}

      {/* Config */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gold-500" />
            <h2 className="font-semibold text-ink-900">Surge météo</h2>
          </div>
          <div className="text-3xl font-display font-bold text-gold-500 mb-3">×{surge.toFixed(1)}</div>
          <input type="range" min={1.0} max={2.0} step={0.1} value={surge}
            onChange={e => setSurge(Number(e.target.value))}
            className="w-full accent-gold-500" />
          <div className="flex justify-between text-xs text-ink-500 mt-1">
            <span>×1.0</span><span>×2.0</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Umbrella className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-ink-900">Prime livreur</h2>
          </div>
          <div className="text-3xl font-display font-bold text-blue-500 mb-3">+{bonus.toLocaleString("fr-FR")} F</div>
          <input type="range" min={0} max={2000} step={250} value={bonus}
            onChange={e => setBonus(Number(e.target.value))}
            className="w-full accent-blue-500" />
          <div className="flex justify-between text-xs text-ink-500 mt-1">
            <span>0 F</span><span>2 000 F</span>
          </div>
        </div>
      </div>

      {/* Zones risk table */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-ink-400" />
          <h2 className="font-semibold text-ink-900">Carte des risques — Dakar</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-cream-50 border-b border-cream-100">
            <tr>
              {["Zone", "Niveau de risque", "Statut", "Action"].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {ZONES.map(z => (
              <tr key={z.name} className="hover:bg-cream-50 transition-colors">
                <td className="px-5 py-3 font-medium text-ink-900">{z.name}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-3 h-3 rounded-sm ${n <= z.risk ? "bg-red-400" : "bg-cream-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-ink-500">{z.risk}/5</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_COLORS[z.risk]}`}>{z.status}</span>
                </td>
                <td className="px-5 py-3">
                  {z.risk >= 4 && (
                    <button type="button"
                      onClick={() => toast.success(`Zone ${z.name} : livreurs redirigés vers zones alternatives`)}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded font-medium transition-colors">
                      Rediriger
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button type="button"
          onClick={() => toast.success("Configuration hivernage enregistrée")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
