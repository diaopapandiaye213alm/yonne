import Image from "next/image";
import { topDriversToday, avatarUrl } from "@/lib/mock-data/drivers";
import { Star } from "lucide-react";

const tierColor = { Or: "bg-gold-500", Argent: "bg-ink-500/30", Bronze: "bg-amber-700/40" } as const;

export function DriverLeaderboard() {
  const top = topDriversToday(5);
  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-900">Top livreurs · aujourd'hui</h3>
        <button className="text-xs text-emerald-500 hover:underline">Voir tous</button>
      </div>
      <ol className="space-y-3">
        {top.map((d, i) => (
          <li key={d.id} className="flex items-center gap-3">
            <span className="w-6 text-center font-display font-bold text-ink-500">{i + 1}</span>
            <Image src={avatarUrl(d)} alt={d.name} width={36} height={36} unoptimized className="rounded-full bg-cream-100" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-900 truncate">{d.name}</div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className={`inline-block w-2 h-2 rounded-full ${tierColor[d.tier]}`} />
                {d.tier}
                <Star className="w-3 h-3 text-gold-500 fill-gold-500 ml-2" />
                {d.rating.toFixed(1)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-ink-900 tabular-nums">{d.earningsToday.toLocaleString("fr-FR")} F</div>
              <div className="text-xs text-ink-500">{d.ordersToday} courses</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
