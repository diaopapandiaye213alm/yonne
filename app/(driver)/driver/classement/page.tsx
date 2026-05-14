"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useDriversStore, avatarUrl } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";
import { useSession } from "@/lib/hooks/useSession";
import { Trophy, Star } from "lucide-react";

const TIER_STYLE: Record<string, string> = {
  Bronze: "bg-amber-700/15 text-amber-800 border-amber-700/30",
  Argent: "bg-slate-200 text-slate-700 border-slate-300",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/50",
};

function getWeekBounds(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const label = `${fmt(monday)} – ${fmt(sunday).split(" ").slice(-2).join(" ")} ${sunday.getFullYear()}`;

  return { start: monday, end: sunday, label };
}

export default function ClassementPage() {
  const session = useSession();
  const { drivers } = useDriversStore();
  const { orders } = useOrdersStore();

  const { start, end, label } = useMemo(() => getWeekBounds(), []);

  const currentDriver = useMemo(() => {
    const byName = session?.displayName
      ? drivers.find(d => d.name === session.displayName)
      : null;
    return byName ?? drivers[0];
  }, [drivers, session?.displayName]);

  const ranked = useMemo(() => {
    const weekOrders = orders.filter(o => {
      if (o.status !== "livrée") return false;
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });

    const countMap: Record<string, number> = {};
    const gainMap: Record<string, number> = {};
    weekOrders.forEach(o => {
      countMap[o.driverId] = (countMap[o.driverId] ?? 0) + 1;
      gainMap[o.driverId] = (gainMap[o.driverId] ?? 0) + Math.round(o.amount * 0.25);
    });

    const hasData = Object.keys(countMap).length > 0;

    return drivers
      .map(d => ({
        driver: d,
        courses: countMap[d.id] ?? 0,
        gains: gainMap[d.id] ?? 0,
      }))
      .sort((a, b) => {
        if (hasData) return b.courses - a.courses || b.gains - a.gains;
        return b.driver.rating - a.driver.rating;
      });
  }, [drivers, orders, start, end]);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const medals = ["🥇", "🥈", "🥉"];
  const medalBg = [
    "border-gold-500 bg-gold-500/5",
    "border-slate-300 bg-slate-50",
    "border-amber-700/30 bg-amber-700/5",
  ];

  return (
    <div className="pb-20 px-4 pt-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-gold-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Classement</h1>
          <p className="text-xs text-ink-500 mt-0.5">{label}</p>
        </div>
      </div>

      {/* Podium top 3 */}
      <div className="grid grid-cols-3 gap-2">
        {top3.map(({ driver, courses, gains }, i) => {
          const isMe = driver.id === currentDriver?.id;
          return (
            <div
              key={driver.id}
              className={`rounded-xl border p-3 flex flex-col items-center gap-2 ${medalBg[i]} ${isMe ? "ring-2 ring-emerald-400" : ""}`}
            >
              <span className="text-2xl">{medals[i]}</span>
              <div className="relative">
                <Image
                  src={avatarUrl(driver)}
                  alt={driver.name}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-white shadow"
                  unoptimized
                />
                {isMe && (
                  <span className="absolute -bottom-1 -right-1 text-[9px] bg-emerald-500 text-white rounded-full px-1 font-bold leading-4">
                    Moi
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="font-display font-semibold text-xs text-ink-900 leading-tight truncate w-full max-w-[70px] text-center">
                  {driver.name.split(" ")[0]}
                </div>
                <div className="font-mono font-bold text-sm text-emerald-600 mt-0.5">{courses}</div>
                <div className="text-[10px] text-ink-500">courses</div>
                <div className="font-mono text-[10px] text-ink-500">{gains.toLocaleString("fr-FR")} F</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table ranks 4+ */}
      {rest.length > 0 && (
        <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-cream-100">
            <h2 className="font-semibold text-ink-900 text-sm">Autres livreurs</h2>
          </div>
          <div className="divide-y divide-cream-100">
            {rest.map(({ driver, courses, gains }, i) => {
              const rank = i + 4;
              const isMe = driver.id === currentDriver?.id;
              return (
                <div
                  key={driver.id}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-emerald-50" : "hover:bg-cream-50"} transition-colors`}
                >
                  <div className="w-7 shrink-0 text-center font-mono font-bold text-sm text-ink-400">
                    {rank}
                  </div>
                  <Image
                    src={avatarUrl(driver)}
                    alt={driver.name}
                    width={32}
                    height={32}
                    className="rounded-full border border-cream-200 shrink-0"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-ink-900 truncate">{driver.name}</span>
                      {isMe && (
                        <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 font-bold">
                          Moi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${TIER_STYLE[driver.tier] ?? TIER_STYLE.Bronze}`}>
                        {driver.tier}
                      </span>
                      <span className="text-[10px] text-ink-400 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                        {driver.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono font-bold text-sm text-emerald-600">{courses}</div>
                    <div className="text-[10px] text-ink-500">courses</div>
                    <div className="font-mono text-[10px] text-ink-500">{gains.toLocaleString("fr-FR")} F</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If user is far down, highlight their position */}
      {currentDriver && ranked.findIndex(r => r.driver.id === currentDriver.id) >= 3 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="font-mono font-bold text-emerald-600 w-7 text-center">
            #{ranked.findIndex(r => r.driver.id === currentDriver.id) + 1}
          </div>
          <Image
            src={avatarUrl(currentDriver)}
            alt={currentDriver.name}
            width={36}
            height={36}
            className="rounded-full border-2 border-emerald-400"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-ink-900 text-sm">Votre position</div>
            <div className="text-xs text-ink-500">{currentDriver.name}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-emerald-600 text-sm">
              {ranked.find(r => r.driver.id === currentDriver.id)?.courses ?? 0}
            </div>
            <div className="text-[10px] text-ink-500">courses</div>
          </div>
        </div>
      )}
    </div>
  );
}
