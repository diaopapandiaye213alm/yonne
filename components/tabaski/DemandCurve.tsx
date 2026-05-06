"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { demandCurve } from "@/lib/mock-data/tabaski";

export function DemandCurve() {
  const byDay = Object.values(
    demandCurve.reduce<Record<string, { date: string; baseline: number; predicted: number }>>((acc, p) => {
      acc[p.date] ??= { date: p.date, baseline: 0, predicted: 0 };
      acc[p.date].baseline   += p.baseline;
      acc[p.date].predicted  += p.predicted;
      return acc;
    }, {})
  ).map(d => ({
    label: new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    ...d,
  }));

  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-ink-900">Demande prévue · J-7 → J+2</h3>
        <span className="text-xs text-ink-500">Pic mardi 27 mai · ×3.2</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={byDay}>
            <defs>
              <linearGradient id="emeraldFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803D" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#15803D" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#8B7363" fontSize={11} />
            <YAxis stroke="#8B7363" fontSize={11} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #E8DFD0", borderRadius: 10 }} />
            <ReferenceLine x="mar. 27" stroke="#D4A574" strokeDasharray="4 4" label={{ value: "Tabaski", fill: "#D4A574", fontSize: 11 }} />
            <Area type="monotone" dataKey="baseline"  stroke="#8B7363" strokeOpacity={0.5} fill="transparent" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="predicted" stroke="#15803D" strokeWidth={2} fill="url(#emeraldFade)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
