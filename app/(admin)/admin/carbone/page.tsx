"use client";
import { toast } from "sonner";
import { Leaf, TrendingDown, Award, Bike } from "lucide-react";

const VEHICLES = [
  { type: "Moto thermique",   icon: "🛵", kgPerKm: 0.080, count: 28, color: "bg-amber-100 text-amber-700" },
  { type: "Moto électrique",  icon: "⚡", kgPerKm: 0.020, count: 8,  color: "bg-emerald-100 text-emerald-700" },
  { type: "Vélo",             icon: "🚲", kgPerKm: 0.000, count: 5,  color: "bg-emerald-100 text-emerald-700" },
];

const MONTHLY = [
  { month: "Jan", kg: 142 }, { month: "Fév", kg: 128 }, { month: "Mar", kg: 135 },
  { month: "Avr", kg: 118 }, { month: "Mai", kg: 103 },
];
const maxKg = Math.max(...MONTHLY.map(m => m.kg));

const GREEN_DELIVERIES = 31;
const TOTAL_DELIVERIES = 147;
const TOTAL_KG = 103;
const SAVED_KG = 18;

export default function CarbonePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">Score Carbone CO₂</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Émissions ce mois",    value: `${TOTAL_KG} kg CO₂`,  icon: Leaf,        color: "text-ink-500" },
          { label: "Économisé (groupage)", value: `${SAVED_KG} kg`,       icon: TrendingDown, color: "text-emerald-600" },
          { label: "Livraisons vertes",    value: `${GREEN_DELIVERIES}`,   icon: Bike,        color: "text-emerald-500" },
          { label: "Taux vert",            value: `${Math.round(GREEN_DELIVERIES / TOTAL_DELIVERIES * 100)}%`, icon: Award, color: "text-gold-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Émissions mensuelles (kg CO₂)</h2>
        <div className="flex items-end gap-3 h-24">
          {MONTHLY.map(({ month, kg }, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all ${i === MONTHLY.length - 1 ? "bg-emerald-500" : "bg-cream-300"}`}
                style={{ height: `${Math.round((kg / maxKg) * 88)}px` }}
              />
              <span className="text-xs text-ink-500">{month}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          −12% vs mois précédent grâce au groupage
        </p>
      </div>

      {/* Vehicles table */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">Émissions par type de véhicule</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-cream-50 border-b border-cream-100">
            <tr>
              {["Véhicule", "Livreurs", "kg CO₂/km", "Badge", "Émissions estimées"].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-50">
            {VEHICLES.map(v => (
              <tr key={v.type} className="hover:bg-cream-50 transition-colors">
                <td className="px-5 py-3 font-medium text-ink-900">{v.icon} {v.type}</td>
                <td className="px-5 py-3 text-ink-700">{v.count}</td>
                <td className="px-5 py-3 font-mono text-ink-700">{v.kgPerKm.toFixed(3)}</td>
                <td className="px-5 py-3">
                  {v.kgPerKm === 0
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">🌿 Zéro émission</span>
                    : v.kgPerKm < 0.05
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">✅ Livraison verte</span>
                    : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.color}`}>Standard</span>}
                </td>
                <td className="px-5 py-3 font-mono text-ink-700">
                  ~{(v.count * 3.2 * v.kgPerKm).toFixed(1)} kg/jour
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Certificate */}
      <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-ink-900">Certificat Éco Partenaire</span>
          </div>
          <p className="text-sm text-ink-500">Généré mensuellement pour les commerçants ayant ≥ 30% de livraisons vertes</p>
        </div>
        <button type="button"
          onClick={() => toast.success("Certificats Éco Partenaire envoyés à 12 commerçants qualifiés")}
          className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-display font-bold transition-colors shadow-glow-emerald"
        >
          Envoyer certificats
        </button>
      </div>
    </div>
  );
}
