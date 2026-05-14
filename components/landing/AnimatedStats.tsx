"use client";
import { useEffect, useState, useRef } from "react";

interface Stat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
  const [counts, setCounts] = useState(stats.map(() => 0));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 1600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(stats.map(s => Math.round(s.value * eased)));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [stats]);

  return (
    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 animate-fade-in-up"
          style={{ animationDelay: `${300 + i * 100}ms` }}
        >
          <div className="text-3xl font-display font-bold text-white tabular-nums">
            {s.prefix}{counts[i].toLocaleString("fr-FR")}{s.suffix}
          </div>
          <div className="text-xs text-emerald-300/70 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
