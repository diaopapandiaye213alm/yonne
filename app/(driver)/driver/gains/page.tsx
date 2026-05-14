"use client";

import { useState, useMemo, useEffect } from "react";
import { useDriversStore } from "@/lib/store/drivers";
import { useSession } from "@/lib/hooks/useSession";
import { WeeklyEarningsChart } from "@/components/driver/WeeklyEarningsChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { Smartphone, Banknote, ChevronRight, Star, MapPin } from "lucide-react";


type Delivery = {
  id: string; time: string; client: string; zone: string;
  amount: number; rating: number; tip: number;
};

const TODAY_DELIVERIES: Delivery[] = [
  { id: "YN-2026-10128", time: "08:14", client: "Fatou Diallo",   zone: "Médina → Plateau",     amount: 1500, rating: 5, tip: 0 },
  { id: "YN-2026-10125", time: "09:02", client: "Ibou Mbaye",     zone: "Ouakam → Almadies",    amount: 2000, rating: 5, tip: 200 },
  { id: "YN-2026-10122", time: "09:51", client: "Aminata Sow",    zone: "Grand Yoff → Mermoz",  amount: 1200, rating: 4, tip: 0 },
  { id: "YN-2026-10119", time: "10:30", client: "Cheikh Ba",      zone: "Liberté → Fann",       amount: 1800, rating: 5, tip: 300 },
  { id: "YN-2026-10115", time: "11:45", client: "Rokhaya Gaye",   zone: "Sacré-Cœur → Médina",  amount: 1000, rating: 4, tip: 0 },
  { id: "YN-2026-10112", time: "13:22", client: "Omar Thiam",     zone: "Plateau → Grand Yoff", amount: 2500, rating: 5, tip: 500 },
  { id: "YN-2026-10108", time: "14:55", client: "Mariama Ndiaye", zone: "Parcelles → Ouakam",   amount: 1800, rating: 5, tip: 0 },
  { id: "YN-2026-10104", time: "16:10", client: "Seydou Sarr",    zone: "Almadies → Ngor",      amount: 1200, rating: 4, tip: 100 },
];

const totalTips = TODAY_DELIVERIES.reduce((s, d) => s + d.tip, 0);
const avgRating = (TODAY_DELIVERIES.reduce((s, d) => s + d.rating, 0) / TODAY_DELIVERIES.length).toFixed(1);

export default function GainsPage() {
  const t = useT();
  const session = useSession();
  const { drivers } = useDriversStore();
  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0] ?? { ordersToday: 8, earningsToday: 14200, badges: ["Rapide"], rating: 4.8 };
  }, [drivers, session?.displayName]);
  const ADVANCE_MAX = Math.floor(demo.earningsToday * 0.8);
  const [avanceAmount, setAvanceAmount] = useState(0);
  useEffect(() => { setAvanceAmount(Math.floor(ADVANCE_MAX / 2)); }, [ADVANCE_MAX]);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const dateStr = new Date("2026-05-20").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="pb-20 px-4 pt-6 space-y-5 animate-fade-in-up">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">{t("myEarnings")}</h1>
        <p className="text-xs text-ink-500 capitalize">{dateStr}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stagger-1 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-ink-900">{demo.ordersToday}</div>
          <div className="text-xs text-ink-500">{t("courses")}</div>
        </div>
        <div className="stagger-2 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-lg text-emerald-500">
            {demo.earningsToday.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F CFA</div>
        </div>
        <div className="stagger-3 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-gold-500">{avgRating}</div>
          <div className="text-xs text-ink-500">Note ★</div>
        </div>
      </div>

      {/* Today's deliveries */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDeliveries(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="font-display font-semibold text-ink-900 text-sm">{t("todayDeliveries")}</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {TODAY_DELIVERIES.length} courses
            </span>
          </div>
          <div className="flex items-center gap-3">
            {totalTips > 0 && (
              <span className="text-xs text-gold-500 font-medium">+{totalTips.toLocaleString("fr-FR")} F tips</span>
            )}
            <ChevronRight className={`w-4 h-4 text-ink-400 transition-transform ${showDeliveries ? "rotate-90" : ""}`} />
          </div>
        </button>

        {showDeliveries && (
          <div className="border-t border-cream-100 divide-y divide-cream-50">
            {TODAY_DELIVERIES.map(d => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <div className="shrink-0 text-center">
                  <div className="text-xs font-mono text-ink-400">{d.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-ink-900 truncate">{d.client}</div>
                  <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{d.zone}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono font-semibold text-sm text-emerald-600">
                    {d.amount.toLocaleString("fr-FR")} F
                    {d.tip > 0 && <span className="text-gold-500 ml-1">+{d.tip}</span>}
                  </div>
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= d.rating ? "text-gold-500 fill-gold-500" : "text-cream-300"}`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Summary row */}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5">
              <span className="text-xs font-semibold text-ink-700">Total du jour</span>
              <span className="font-mono font-bold text-emerald-600">
                {(demo.earningsToday + totalTips).toLocaleString("fr-FR")} F
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-lg border border-cream-200 p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t("thisWeek")}</h2>
        <WeeklyEarningsChart />
      </div>

      {/* Badge */}
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
        <h2 className="font-display font-semibold text-ink-900 text-sm">{t("instantWithdraw")}</h2>
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
          <h2 className="font-display font-semibold text-ink-900 text-sm">{t("salaryAdvance")}</h2>
        </div>
        <p className="text-xs text-ink-500">{t("advanceDesc")}</p>
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
          {t("requestAdvance")}
        </Button>
      </div>

      <Button type="button"
        onClick={() => toast.success("Demande de virement envoyée — vous recevrez un paiement Wave d'ici 24h")}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold shadow-glow-emerald">
        {t("requestWave")}
      </Button>
    </div>
  );
}
