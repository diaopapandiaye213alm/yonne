"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { KpiCard } from "@/components/kpi/KpiCard";
import { DriverLeaderboard } from "@/components/kpi/DriverLeaderboard";
import DakarMap from "@/components/map/DakarMapClient";
import { useDriversStore } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useLiveKpis } from "@/lib/hooks/useLiveKpis";
import { useT, useLang } from "@/lib/i18n";
import { LiveFeed } from "@/components/admin/LiveFeed";
import { SimulationControls } from "@/components/admin/SimulationControls";
import { useSimulationStore } from "@/lib/store/simulation";
import { Sparkles, ChevronRight } from "lucide-react";

const IS_PROD = process.env.NEXT_PUBLIC_APP_ENV === "production";

export default function AdminHomePage() {
  const kpis = useLiveKpis(10000);
  const { running, start } = useSimulationStore();
  const autoStarted = useRef(false);

  // Auto-start simulation 3s after admin dashboard loads — demo mode only.
  // Disabled in production to prevent synthetic orders from hitting the real DB.
  useEffect(() => {
    if (IS_PROD || running || autoStarted.current) return;
    autoStarted.current = true;
    const t = setTimeout(() => {
      if (!useSimulationStore.getState().running) start(1);
    }, 3000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const t    = useT();
  const lang = useLang(s => s.lang);
  const { drivers } = useDriversStore();
  const { orders }  = useOrdersStore();

  const onlineDrivers  = drivers.filter(d => d.online);
  const inPrayerCount  = drivers.filter(d => d.inPrayer).length;
  const activeOrders   = orders.filter(o => o.active);
  const deliveredToday = orders.filter(o => {
    if (o.status !== "livrée") return false;
    return new Date(o.createdAt).toDateString() === new Date().toDateString();
  }).length;
  const driverPins = onlineDrivers.slice(0, 15).map(d => ({ id: d.id, lat: d.lat, lng: d.lng, kind: "driver" as const }));
  const orderPins = activeOrders.map(o => {
    const lm = landmarks.find(l => l.id === o.landmarkId)!;
    return { id: o.id, lat: lm?.lat ?? 14.71, lng: lm?.lng ?? -17.45, kind: "order" as const };
  });

  const dateStr = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">

      {/* ── Hero gradient ── */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 p-6 shadow-glow-emerald">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse shrink-0" />
              {t("dashboardLive")}
            </div>
            <div className="text-2xl font-display font-bold text-white capitalize">{dateStr}</div>
            <div className="mt-1 text-emerald-200/60 text-sm">
              {kpis.onlineDrivers} {t("driversOnline").toLowerCase()} · {kpis.orders} {t("ordersCount").toLowerCase()}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {!IS_PROD && <SimulationControls />}
            <Link
              href="/admin/tabaski"
              className="flex items-center gap-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 hover:text-gold-200 rounded-lg px-4 py-2.5 text-sm font-medium transition-all w-fit"
            >
              <Sparkles className="w-4 h-4" />
              {t("tabaskiAlert").split("—")[0].trim()}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stagger-1 animate-fade-in-up">
          <KpiCard
            label={t("revenusToday")}
            value={`${kpis.revenue.toLocaleString("fr-FR")} F`}
            delta={{ value: "23 %", direction: "up" }}
            hint={t("vsYesterday")}
            spark={kpis.sparkRevenue}
            accent="emerald"
          />
        </div>
        <div className="stagger-2 animate-fade-in-up">
          <KpiCard
            label={t("ordersCount")}
            value={String(kpis.orders)}
            delta={{ value: "12 actives", direction: "up" }}
            spark={kpis.sparkOrders}
            accent="gold"
          />
        </div>
        <div className="stagger-3 animate-fade-in-up">
          <KpiCard
            label={t("driversOnline")}
            value={`${kpis.onlineDrivers} / ${drivers.length}`}
            hint={inPrayerCount > 0 ? `${inPrayerCount} en pause prière` : "Tous disponibles"}
            accent="ink"
          />
        </div>
        <div className="stagger-4 animate-fade-in-up">
          <KpiCard
            label={t("avgRating")}
            value={`${kpis.rating.toFixed(1)} ★`}
            hint={deliveredToday > 0 ? `${deliveredToday} livraisons aujourd'hui` : "Aucune livraison encore"}
            accent="gold"
            highlight
          />
        </div>
      </div>

      {/* ── Map + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DakarMap pins={[...driverPins, ...orderPins]} />
        </div>
        <DriverLeaderboard />
      </div>

      {/* ── Live feed ── */}
      <LiveFeed />
    </div>
  );
}
