import { RevenueSparkline } from "./RevenueSparkline";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  hint?: string;
  spark?: number[];
  highlight?: boolean;
  accent?: "emerald" | "gold" | "ink";
}

const accentClasses = {
  emerald: "bg-emerald-500",
  gold:    "bg-gold-500",
  ink:     "bg-ink-500",
} as const;

export function KpiCard({ label, value, delta, hint, spark, highlight, accent = "emerald" }: Props) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-card p-5 border border-cream-200 group",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      highlight && "ring-2 ring-gold-500 shadow-glow"
    )}>
      <div className={cn("h-0.5 w-8 rounded-full mb-4", accentClasses[accent])} />
      <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
        {delta && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-0.5",
            delta.direction === "up" ? "text-emerald-500" : "text-danger"
          )}>
            {delta.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
      {spark && <div className="mt-3"><RevenueSparkline values={spark} /></div>}
    </div>
  );
}
