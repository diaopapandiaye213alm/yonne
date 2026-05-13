"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Moon, Clock, TrendingUp, ToggleLeft, ToggleRight } from "lucide-react";

type Prayer = {
  name: string; arabic: string; time: string; reduction: number; surge: boolean;
};

const PRAYERS_INIT: Prayer[] = [
  { name: "Fajr (Subh)",  arabic: "الفجر",   time: "05:45", reduction: 20, surge: false },
  { name: "Dhuhr (Zuhr)", arabic: "الظهر",   time: "13:15", reduction: 15, surge: true  },
  { name: "Asr",          arabic: "العصر",   time: "16:30", reduction: 10, surge: true  },
  { name: "Maghrib",      arabic: "المغرب",  time: "19:48", reduction: 20, surge: true  },
  { name: "Isha",         arabic: "العشاء",  time: "21:10", reduction: 15, surge: false },
];

export default function PrierePage() {
  const [enabled, setEnabled] = useState(true);
  const [prayers, setPrayers] = useState<Prayer[]>(PRAYERS_INIT);

  function toggleSurge(i: number) {
    setPrayers(prev => prev.map((p, idx) => idx === i ? { ...p, surge: !p.surge } : p));
    toast.success("Configuration sauvegardée");
  }

  function updateReduction(i: number, val: number) {
    setPrayers(prev => prev.map((p, idx) => idx === i ? { ...p, reduction: val } : p));
  }

  const nextPrayer = PRAYERS_INIT[1]; // Dhuhr as next for demo

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Heures de Prière</h1>
          <p className="text-sm text-ink-500 mt-1">Horaires Dakar · API IslamicFinder</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-200 rounded-lg px-4 py-2.5 shadow-card">
          <span className="text-sm text-ink-700 font-medium">Mode prière actif</span>
          <button type="button" onClick={() => {
            setEnabled(v => !v);
            toast.success(enabled ? "Mode prière désactivé" : "Mode prière activé");
          }}>
            {enabled
              ? <ToggleRight className="w-8 h-8 text-emerald-500" />
              : <ToggleLeft className="w-8 h-8 text-ink-400" />}
          </button>
        </div>
      </div>

      {/* Next prayer banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-300/60 uppercase tracking-widest mb-1">Prochaine prière</div>
            <div className="text-2xl font-display font-bold text-white">{nextPrayer.name}</div>
            <div className="text-gold-400 text-lg mt-0.5">{nextPrayer.arabic}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-white">{nextPrayer.time}</div>
            <div className="text-xs text-ink-300/60 mt-1">dans 47 min</div>
          </div>
        </div>
      </div>

      {/* Prayer cards */}
      <div className="space-y-3">
        {prayers.map((p, i) => (
          <div key={p.name} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <div className="flex items-center gap-4">
              <Moon className="w-5 h-5 text-ink-400 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink-900">{p.name}</span>
                  <span className="text-ink-400 font-display">{p.arabic}</span>
                  <span className="font-mono text-sm text-ink-500">{p.time}</span>
                </div>
                <div className="mt-2 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-ink-400" />
                    <span className="text-xs text-ink-500">Réduction dispatch :</span>
                    <input
                      type="range" min={5} max={30} step={5} value={p.reduction}
                      onChange={e => updateReduction(i, Number(e.target.value))}
                      className="w-24 accent-emerald-500"
                    />
                    <span className="text-xs font-medium text-ink-700 w-12">{p.reduction} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-xs text-ink-500">Micro-surge ×1.1 :</span>
                    <button type="button" onClick={() => toggleSurge(i)}>
                      {p.surge
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-ink-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="button"
          onClick={() => toast.success("Paramètres heures de prière enregistrés")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
