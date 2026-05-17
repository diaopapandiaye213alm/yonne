"use client";
import type { DeliveryStep } from "@/lib/store/driver";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "En route vers le point de collecte",  action: "J'arrive au point de collecte" },
  { label: "À la collecte — En attente du colis", action: "Colis récupéré ✓" },
  { label: "En route vers le client",             action: "J'arrive chez le client" },
  { label: "Livraison confirmée !",               action: "Voir mes gains" },
] as const;

interface Props {
  step: DeliveryStep;
  onAdvance: () => void;
  disabled?: boolean;
}

export function DeliveryStepperCard({ step, onAdvance, disabled }: Props) {
  return (
    <div className="bg-white rounded-t-2xl p-4 space-y-4 shadow-card-lg">
      <div className="space-y-1">
        {STEPS.map((s, i) => {
          const past    = i < step;
          const current = i === step;
          const future  = i > step;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-0.5">
                {past ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : current ? (
                  <div className="relative w-5 h-5 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 animate-step-pulse" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-80" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-cream-200 bg-cream-100 shrink-0" />
                )}
                {i < STEPS.length - 1 && (
                  <div className={cn("w-0.5 h-5 mt-0.5", past ? "bg-emerald-500" : "bg-cream-200")} />
                )}
              </div>
              <span className={cn(
                "text-sm pt-0.5 leading-snug",
                past    ? "text-ink-400 line-through" : "",
                current ? "text-ink-900 font-semibold" : "",
                future  ? "text-ink-300"               : "",
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {disabled ? (
        <div className="w-full text-center text-sm text-ink-500 py-2.5 bg-cream-100 rounded-xl">
          Simulation en cours…
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdvance}
          className="w-full h-14 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-display font-bold text-base shadow-glow-emerald active:scale-[0.98] transition-transform duration-100"
        >
          {STEPS[step].action}
        </button>
      )}
    </div>
  );
}
