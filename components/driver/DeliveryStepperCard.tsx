"use client";
import type { DeliveryStep } from "@/lib/store/driver";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "En route vers le point de collecte",  action: "J'arrive au point de collecte" },
  { label: "À la collecte — En attente du colis", action: "Colis récupéré ✓" },
  { label: "En route vers le client",             action: "J'arrive chez le client" },
  { label: "Livraison confirmée 🎉",              action: "Voir mes gains" },
] as const;

interface Props {
  step: DeliveryStep;
  onAdvance: () => void;
  disabled?: boolean;
}

export function DeliveryStepperCard({ step, onAdvance, disabled }: Props) {
  return (
    <div className="bg-white rounded-t-xl p-4 space-y-3">
      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const past    = i < step;
          const current = i === step;
          const future  = i > step;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {past ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : current ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gold-500 bg-gold-500/20 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-cream-200 shrink-0" />
                )}
                {i < STEPS.length - 1 && (
                  <div className={cn("w-0.5 h-4 mt-0.5", past ? "bg-emerald-500" : "bg-cream-200")} />
                )}
              </div>
              <span className={cn(
                "text-sm pt-0.5",
                past    ? "text-ink-500 line-through" : "",
                current ? "text-ink-900 font-medium"  : "",
                future  ? "text-ink-300"              : "",
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {disabled ? (
        <div className="w-full mt-2 text-center text-sm text-ink-500 py-2 bg-cream-100 rounded-lg">
          Simulation en cours…
        </div>
      ) : (
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold mt-2"
          onClick={onAdvance}
        >
          {STEPS[step].action}
        </Button>
      )}
    </div>
  );
}
