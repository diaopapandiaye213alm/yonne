"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DAYS = [
  { day: "Mer", amount: 18500 },
  { day: "Jeu", amount: 22000 },
  { day: "Ven", amount: 31000 },
  { day: "Sam", amount: 45000 },
  { day: "Dim", amount: 28000 },
  { day: "Lun", amount: 19500 },
  { day: "Auj", amount: 24000 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-200 rounded-md px-3 py-2 shadow-card text-xs">
      <div className="font-medium text-ink-900">{label}</div>
      <div className="text-ink-700">{payload[0].value.toLocaleString("fr-FR")} F</div>
    </div>
  );
}

export function WeeklyEarningsChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={DAYS} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8B7363" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {DAYS.map((entry, i) => (
            <Cell key={i} fill={entry.day === "Auj" ? "#15803D" : "rgba(200,146,76,0.45)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
