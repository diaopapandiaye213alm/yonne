import { RevenueSparkline } from "./RevenueSparkline";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, TrendingUp, ShoppingCart, Users, Star } from "lucide-react";

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
  emerald: { bar: "bg-emerald-500", iconBg: "bg-emerald-500/10 text-emerald-600" },
  gold:    { bar: "bg-gold-500",    iconBg: "bg-gold-500/10 text-gold-600" },
  ink:     { bar: "bg-ink-500",     iconBg: "bg-ink-500/10 text-ink-700" },
} as const;

const accentIcons = {
  emerald: TrendingUp,
  gold:    ShoppingCart,
  ink:     Users,
} as const;

export function KpiCard({ label, value, delta, hint, spark, highlight, accent = "emerald" }: Props) {
  const IconComp = highlight ? Star : accentIcons[accent];
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-card p-5 border border-cream-200 group",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      highlight && "ring-2 ring-gold-500 shadow-glow"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", accentClasses[accent].iconBg)}>
          <IconComp className="w-4 h-4" />
        </div>
        {delta && (
          <span className={cn(
            "text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full",
            delta.direction === "up"
              ? "text-emerald-700 bg-emerald-500/10"
              : "text-danger bg-red-50"
          )}>
            {delta.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">{label}</div>
      <div className="mt-1.5">
        <div key={value} className="text-2xl font-display font-bold text-ink-900 tabular-nums animate-flash-green">{value}</div>
      </div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
      {spark && <div className="mt-3"><RevenueSparkline values={spark} /></div>}
    </div>
  );
}
