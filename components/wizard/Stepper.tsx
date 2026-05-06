"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props { step: 1 | 2 | 3 }

const labels = ["Client", "Paiement", "Dispatch"];

export function Stepper({ step }: Props) {
  return (
    <ol className="flex items-center gap-3">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              done && "bg-emerald-500 text-white",
              active && "bg-gold-500 text-ink-900 shadow-glow",
              !done && !active && "bg-cream-200 text-ink-500"
            )}>
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            <span className={cn("text-sm font-medium", active ? "text-ink-900" : "text-ink-500")}>{label}</span>
            {i < 2 && <span className={cn("w-8 h-px", done ? "bg-emerald-500" : "bg-cream-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
