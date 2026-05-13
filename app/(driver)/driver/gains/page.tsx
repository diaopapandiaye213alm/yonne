"use client";

import { useState } from "react";
import { drivers } from "@/lib/mock-data/drivers";
import { WeeklyEarningsChart } from "@/components/driver/WeeklyEarningsChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { Smartphone, Banknote, ChevronRight } from "lucide-react";

const demo = drivers[0];
const ADVANCE_MAX = Math.floor(demo.earningsToday * 0.8);

export default function GainsPage() {
  const t = useT();
  const [avanceAmount, setAvanceAmount] = useState(Math.floor(ADVANCE_MAX / 2));
  const dateStr = new Date("2026-05-20").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">{t("myEarnings")}</h1>
        <p className="text-xs text-ink-500 capitalize">{dateStr}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-ink-900">{demo.ordersToday}</div>
          <div className="text-xs text-ink-500">{t("courses")}</div>
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
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t("thisWeek")}</h2>
        <WeeklyEarningsChart />
      </div>

      <div className="bg-white rounded-lg border border-gold-500 p-4 flex items-center gap-3">
        <div className="text-2xl">🏆</div>
        <div>
          <div className="text-xs text-ink-500">{t("weekBadge")}</div>
          <Badge className="mt-1 bg-gold-500/20 text-ink-900 border border-gold-500 font-medium">
            {demo.badges[0]}
          </Badge>
        </div>
      </div>

      {/* Retrait Wave / Orange Money */}
      <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
        <h2 className="font-display font-semibold text-ink-900 text-sm">Retrait immédiat</h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button"
            onClick={() => toast.success("Virement Wave de " + demo.earningsToday.toLocaleString("fr-FR") + " F CFA lancé · 2–5 min")}
            className="flex items-center gap-2 bg-[#1B96D4] hover:bg-[#1580B8] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Wave</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
          <button type="button"
            onClick={() => toast.success("Virement Orange Money de " + demo.earningsToday.toLocaleString("fr-FR") + " F CFA lancé · 5–10 min")}
            className="flex items-center gap-2 bg-[#FF6600] hover:bg-[#E55A00] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Orange Money</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        </div>
      </div>

      {/* Avance sur salaire */}
      <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-gold-500" />
          <h2 className="font-display font-semibold text-ink-900 text-sm">Avance sur salaire</h2>
        </div>
        <p className="text-xs text-ink-500">Recevez jusqu'à 80% de vos gains du jour immédiatement.</p>
        <div className="flex items-center gap-3">
          <input type="range" min={500} max={ADVANCE_MAX} step={500} value={avanceAmount}
            onChange={e => setAvanceAmount(Number(e.target.value))}
            className="flex-1 accent-gold-500" />
          <span className="font-bold text-gold-500 text-sm w-24 text-right tabular-nums">
            {avanceAmount.toLocaleString("fr-FR")} F
          </span>
        </div>
        <Button type="button"
          onClick={() => toast.success(`Avance de ${avanceAmount.toLocaleString("fr-FR")} F validée · Wave dans 2 min`)}
          className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold">
          Demander l'avance
        </Button>
      </div>

      <Button
        type="button"
        onClick={() => toast.success("Demande de virement envoyée — vous recevrez un paiement Wave d'ici 24h")}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold shadow-glow-emerald"
      >
        {t("requestWave")}
      </Button>
    </div>
  );
}
