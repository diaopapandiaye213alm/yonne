"use client";
import Image from "next/image";
import { useMemo } from "react";
import { useDriversStore, avatarUrl } from "@/lib/store/drivers";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const rankMedal = ["🥇", "🥈", "🥉"] as const;

const rankRing = [
  "ring-2 ring-gold-500/60",
  "ring-2 ring-ink-500/30",
  "ring-2 ring-amber-700/30",
] as const;

const rankNumStyle = [
  "bg-gold-500/20 border border-gold-500/50 text-gold-500",
  "bg-ink-500/10 border border-ink-500/20 text-ink-500",
  "bg-amber-700/10 border border-amber-700/20 text-amber-700",
] as const;

export function DriverLeaderboard() {
  const { drivers } = useDriversStore();
  const top = useMemo(() =>
    [...drivers].sort((a, b) => b.earningsToday - a.earningsToday).slice(0, 5),
    [drivers]
  );
  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-ink-900">Top livreurs · aujourd&apos;hui</h3>
        <button className="text-xs text-emerald-500 hover:underline transition-colors">Voir tous</button>
      </div>
      <ol className="space-y-3">
        {top.map((d, i) => (
          <li key={d.id} className="flex items-center gap-3 group">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0",
              i < 3 ? rankNumStyle[i] : "text-ink-500"
            )}>
              {i < 3 ? rankMedal[i] : i + 1}
            </div>
            <Image
              src={avatarUrl(d)} alt={d.name}
              width={i === 0 ? 40 : 34} height={i === 0 ? 40 : 34}
              unoptimized
              className={cn(
                "rounded-full bg-cream-100 transition-transform group-hover:scale-105",
                i < 3 && rankRing[i]
              )}
            />
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-ink-900 truncate",
                i === 0 ? "text-sm font-semibold" : "text-sm"
              )}>{d.name}</div>
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                {d.rating.toFixed(1)}
                <span className="mx-1">·</span>
                {d.ordersToday} courses
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={cn(
                "font-display font-bold tabular-nums",
                i === 0 ? "text-base text-emerald-600" : "text-sm text-ink-900"
              )}>
                {d.earningsToday.toLocaleString("fr-FR")} F
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
