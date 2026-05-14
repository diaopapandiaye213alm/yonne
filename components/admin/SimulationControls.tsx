"use client";

import { useSimulationStore } from "@/lib/store/simulation";
import { Play, Pause, Zap } from "lucide-react";

const SPEEDS: { label: string; value: 1 | 2 | 5 }[] = [
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "5×", value: 5 },
];

export function SimulationControls() {
  const { running, speed, ordersCreated, start, pause, setSpeed } = useSimulationStore();

  function toggle() {
    if (running) pause();
    else start(speed);
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
      {/* Indicateur */}
      <div className="flex items-center gap-1.5 mr-1">
        <span className={`w-2 h-2 rounded-full ${running ? "bg-emerald-400 animate-live-pulse" : "bg-white/30"}`} />
        <span className="text-xs text-white/70 font-medium hidden sm:block">
          {running ? `Sim · ${ordersCreated} cmd` : "Simulation"}
        </span>
      </div>

      {/* Bouton Play / Pause */}
      <button
        type="button"
        onClick={toggle}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          running
            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
            : "bg-white/20 hover:bg-white/30 text-white"
        }`}
        title={running ? "Pause" : "Démarrer la simulation"}
      >
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>

      {/* Sélecteur vitesse */}
      <div className="flex items-center gap-0.5">
        <Zap className="w-3 h-3 text-gold-400 shrink-0" />
        {SPEEDS.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSpeed(s.value)}
            className={`text-xs px-1.5 py-0.5 rounded font-bold transition-all ${
              speed === s.value && running
                ? "bg-gold-500 text-ink-900"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
