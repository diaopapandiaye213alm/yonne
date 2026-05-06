import Link from "next/link";
import { KpiCard } from "@/components/kpi/KpiCard";
import { DriverLeaderboard } from "@/components/kpi/DriverLeaderboard";
import DakarMap from "@/components/map/DakarMapClient";
import { drivers } from "@/lib/mock-data/drivers";
import { activeOrders } from "@/lib/mock-data/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { Sparkles, ChevronRight } from "lucide-react";

const sparkRevenue = [620, 705, 690, 760, 810, 805, 847];
const sparkOrders  = [110, 122, 118, 129, 138, 141, 147];

export default function AdminHomePage() {
  const onlineDrivers = drivers.filter(d => d.online);
  const driverPins = onlineDrivers.slice(0, 15).map(d => ({ id: d.id, lat: d.lat, lng: d.lng, kind: "driver" as const }));
  const orderPins = activeOrders.map(o => {
    const lm = landmarks.find(l => l.id === o.landmarkId)!;
    return { id: o.id, lat: lm.lat, lng: lm.lng, kind: "order" as const };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Link
        href="/admin/tabaski"
        className="block rounded-lg bg-emerald-500 text-white p-5 shadow-card hover:shadow-glow-emerald transition-shadow"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="font-medium">Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt.</span>
          <ChevronRight className="ml-auto w-5 h-5" />
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenus aujourd'hui" value="847 200 F" delta={{ value: "23 %", direction: "up" }} hint="vs hier" spark={sparkRevenue} />
        <KpiCard label="Commandes" value="147" delta={{ value: "12 actives", direction: "up" }} spark={sparkOrders} />
        <KpiCard label="Livreurs en ligne" value="28 / 41" hint="3 en pause prière" />
        <KpiCard label="Note moyenne" value="4,7 ★" hint="89 avis aujourd'hui" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DakarMap pins={[...driverPins, ...orderPins]} />
        </div>
        <DriverLeaderboard />
      </div>
    </div>
  );
}
