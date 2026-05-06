"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "created",   label: "Commande créée",     time: "14:12" },
  { id: "assigned",  label: "Livreur assigné",    time: "14:13" },
  { id: "enroute",   label: "En route vers vous", time: "14:17" },
  { id: "delivered", label: "Livré",              time: null },
] as const;

interface Props { activeStage: typeof stages[number]["id"] }

export function GlovoTimeline({ activeStage }: Props) {
  const activeIdx = stages.findIndex(s => s.id === activeStage);
  return (
    <ol className="space-y-0">
      {stages.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <li key={s.id} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                done && "bg-emerald-500 text-white",
                active && "bg-gold-500 text-ink-900 ring-4 ring-gold-500/20 animate-pulse-gold",
                !done && !active && "bg-cream-200"
              )}>
                {done && <Check className="w-3 h-3" />}
              </div>
              {i < stages.length - 1 && (
                <div className={cn("w-px flex-1 mt-1", done ? "bg-emerald-500" : "bg-cream-200")} />
              )}
            </div>
            <div className="pb-1">
              <div className={cn("text-sm font-medium", (done || active) ? "text-ink-900" : "text-ink-500")}>{s.label}</div>
              {s.time && <div className="text-xs text-ink-500 mt-0.5">{s.time}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
