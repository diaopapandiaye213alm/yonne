"use client";
import { useEffect, useState } from "react";
import { TABASKI_DATE, DEMO_NOW } from "@/lib/mock-data/tabaski";

export function J7Countdown() {
  const [diff, setDiff] = useState(() => TABASKI_DATE.getTime() - DEMO_NOW.getTime());

  useEffect(() => {
    const start = Date.now();
    const initial = diff;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setDiff(initial - elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div className="inline-flex items-baseline gap-3 font-mono tabular-nums text-ink-900">
      <span><span className="text-3xl font-bold">{days}</span><span className="text-sm text-ink-500">j</span></span>
      <span><span className="text-3xl font-bold">{String(hours).padStart(2, "0")}</span><span className="text-sm text-ink-500">h</span></span>
      <span><span className="text-3xl font-bold">{String(minutes).padStart(2, "0")}</span><span className="text-sm text-ink-500">m</span></span>
      <span className="text-emerald-500"><span className="text-3xl font-bold">{String(seconds).padStart(2, "0")}</span><span className="text-sm">s</span></span>
    </div>
  );
}
