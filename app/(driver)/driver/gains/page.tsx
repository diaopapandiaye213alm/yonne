"use client";

import { drivers } from "@/lib/mock-data/drivers";
import { WeeklyEarningsChart } from "@/components/driver/WeeklyEarningsChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const demo = drivers[0];

export default function GainsPage() {
  const dateStr = new Date("2026-05-20").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">Mes gains</h1>
        <p className="text-xs text-ink-500 capitalize">{dateStr}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-ink-900">{demo.ordersToday}</div>
          <div className="text-xs text-ink-500">Courses</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-lg text-emerald-500">
            {demo.earningsToday.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F CFA</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-gold-500">{demo.rating.toFixed(1)}</div>
          <div className="text-xs text-ink-500">Note ★</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3">Cette semaine</h2>
        <WeeklyEarningsChart />
      </div>

      <div className="bg-white rounded-lg border border-gold-500 p-4 flex items-center gap-3">
        <div className="text-2xl">🏆</div>
        <div>
          <div className="text-xs text-ink-500">Badge de la semaine</div>
          <Badge className="mt-1 bg-gold-500/20 text-ink-900 border border-gold-500 font-medium">
            {demo.badges[0]}
          </Badge>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => toast.success("Demande de virement envoyée — vous recevrez un paiement Wave d'ici 24h")}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold shadow-glow-emerald"
      >
        Demander un virement Wave
      </Button>
    </div>
  );
}
