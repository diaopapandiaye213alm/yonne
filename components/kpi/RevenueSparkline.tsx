"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Props { values: number[]; color?: string }

export function RevenueSparkline({ values, color = "#15803D" }: Props) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
