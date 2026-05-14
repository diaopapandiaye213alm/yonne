"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Order } from "@/lib/mock-data/orders";

const DAY_LABELS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-200 rounded-md px-3 py-2 shadow-card text-xs">
      <div className="font-medium text-ink-900">{label}</div>
      <div className="text-ink-700">{payload[0].value.toLocaleString("fr-FR")} F</div>
    </div>
  );
}

export function WeeklyEarningsChart({ orders, driverId }: { orders: Order[]; driverId: string }) {
  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const gain = orders
      .filter(o => o.status === "livrée" && o.driverId === driverId)
      .filter(o => { const t = new Date(o.createdAt); return t >= dayStart && t <= dayEnd; })
      .reduce((s, o) => s + Math.round(o.amount * 0.25), 0);
    const isToday = i === 6;
    return { day: DAY_LABELS[d.getDay()], amount: gain, isToday };
  });

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8B7363" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isToday ? "#15803D" : "rgba(200,146,76,0.45)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
