"use client";
import { useMemo } from "react";
import { toast } from "sonner";
import { Trophy, Star, Gift } from "lucide-react";
import { useDriversStore } from "@/lib/store/drivers";
import { useT } from "@/lib/i18n";

const BADGES = [
  { tier: "Bronze", min: 0,   max: 50,  color: "bg-amber-700/20 text-amber-700 border-amber-700/30",  emoji: "🥉", points: 2 },
  { tier: "Argent", min: 51,  max: 100, color: "bg-ink-500/20 text-ink-600 border-ink-500/30",        emoji: "🥈", points: 3 },
  { tier: "Or",     min: 101, max: 999, color: "bg-gold-500/20 text-gold-500 border-gold-500/40",     emoji: "🥇", points: 5 },
];

function getBadge(points: number) {
  return BADGES.find(b => points >= b.min && points <= b.max) ?? BADGES[0];
}

export default function FidelitePage() {
  const t = useT();
  const { drivers } = useDriversStore();
  const leaderboard = useMemo(() =>
    drivers.slice(0, 10).map((d, i) => ({
      ...d,
      points: Math.round(d.ordersToday * 2.5 + d.rating * 8 + (10 - i) * 5),
    })).sort((a, b) => b.points - a.points),
    [drivers]
  );
  const totalPoints = leaderboard.reduce((s, d) => s + d.points, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">{t("fideliteTitle")}</h1>

      {/* Badges legend */}
      <div className="grid grid-cols-3 gap-4">
        {BADGES.map(b => (
          <div key={b.tier} className={`rounded-xl border p-4 ${b.color} bg-white`}>
            <div className="text-3xl mb-2">{b.emoji}</div>
            <div className="font-display font-bold text-ink-900">{b.tier}</div>
            <div className="text-xs text-ink-500 mt-1">{b.min}–{b.max === 999 ? "∞" : b.max} pts · {b.points} pts/livraison</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Points distribués",   value: totalPoints.toLocaleString("fr-FR"), icon: Star,   color: "text-gold-500" },
          { label: "Livreurs Or",         value: String(leaderboard.filter(d => getBadge(d.points).tier === "Or").length), icon: Trophy, color: "text-gold-500" },
          { label: "Bonus mensuel prévu", value: "50 000 F",  icon: Gift,  color: "text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Classement points</h2>
          <button type="button"
            onClick={() => toast.success("Bonus mensuel Top livreur versé — 50 000 F")}
            className="text-xs bg-gold-500 hover:bg-gold-600 text-ink-900 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Verser bonus mensuel
          </button>
        </div>
        <ol className="divide-y divide-cream-50">
          {leaderboard.map((d, i) => {
            const badge = getBadge(d.points);
            return (
              <li key={d.id} className="flex items-center gap-4 px-5 py-3 hover:bg-cream-50 transition-colors">
                <span className="w-6 text-center font-display font-bold text-ink-500 text-sm">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900 text-sm truncate">{d.name}</div>
                  <div className="text-xs text-ink-500">{d.ordersToday} courses · ⭐ {d.rating.toFixed(1)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                  {badge.emoji} {badge.tier}
                </span>
                <div className="text-right">
                  <div className="font-display font-bold text-ink-900 tabular-nums">{d.points}</div>
                  <div className="text-xs text-ink-500">pts</div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
