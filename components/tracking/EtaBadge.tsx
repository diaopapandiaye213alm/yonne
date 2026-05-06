"use client";
import { useEffect, useState } from "react";

export function EtaBadge({ initialMinutes = 18 }: { initialMinutes?: number }) {
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    const id = setInterval(() => {
      setMinutes(m => (m > 0 ? m - 1 : 0));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gold-500/15 border border-gold-500 rounded-lg p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">ETA</div>
      <div className="font-display text-4xl font-bold text-ink-900 tabular-nums tracking-tight">
        {minutes} <span className="text-lg text-ink-500 font-normal">min</span>
      </div>
    </div>
  );
}
