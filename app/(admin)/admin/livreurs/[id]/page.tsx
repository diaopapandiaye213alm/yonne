import { notFound } from "next/navigation";
import Link from "next/link";
import { drivers, Tier } from "@/lib/mock-data/drivers";
import { orders } from "@/lib/mock-data/orders";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Bike, Package, Wallet } from "lucide-react";

const TIER_COLORS: Record<Tier, string> = {
  Bronze: "bg-amber-100 text-amber-700 border-amber-200",
  Argent: "bg-gray-100 text-gray-700 border-gray-200",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/30",
};

const ALL_BADGES = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"] as const;

export default function LivreurDetailPage({ params }: { params: { id: string } }) {
  const driver = drivers.find(d => d.id === params.id);
  if (!driver) notFound();

  const driverOrders = orders.filter(o => o.driverId === driver.id).slice(0, 10);
  const weekEarnings = [12000, 18500, 22000, 15000, 28000, 31000, driver.earningsToday];
  const maxEarning   = Math.max(...weekEarnings);

  const scoreDistance  = Math.round(driver.scoreIA * 0.92);
  const scoreCharge    = Math.round(driver.scoreIA * 0.85);
  const scoreFiabilite = Math.round(driver.scoreIA * 0.97);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/livreurs" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold">
              {driver.name.split(" ").filter(Boolean).map(n => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-ink-900">{driver.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${TIER_COLORS[driver.tier]}`}>{driver.tier}</span>
            </div>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${driver.online ? "bg-emerald-500/15 text-emerald-700" : "bg-cream-200 text-ink-500"}`}>
          {driver.online ? "● Actif" : "○ Hors-ligne"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Livraisons totales", value: String(orders.filter(o => o.driverId === driver.id).length), icon: Package },
          { label: "Note moyenne",       value: `${driver.rating} ★`,           icon: Star },
          { label: "Véhicule",           value: driver.vehicle,                  icon: Bike },
          { label: "Gains aujourd'hui",  value: `${driver.earningsToday.toLocaleString("fr-FR")} F`, icon: Wallet },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className="w-4 h-4 text-ink-500 mb-2" />
            <div className="text-lg font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Score IA — {driver.scoreIA}/100</h2>
          <div className="space-y-3">
            {[
              { label: "Distance (40%)",   value: scoreDistance },
              { label: "Charge (30%)",     value: scoreCharge },
              { label: "Fiabilité (30%)",  value: scoreFiabilite },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-700">{label}</span>
                  <span className="tabular-nums font-medium">{value}/100</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Gains — 7 derniers jours</h2>
          <div className="flex items-end gap-1 h-24">
            {weekEarnings.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === 6 ? "bg-emerald-500" : "bg-cream-200"}`}
                  style={{ height: `${Math.round((v / maxEarning) * 80)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {["L","M","Me","J","V","S","D"].map(j => (
              <div key={j} className="flex-1 text-center text-xs text-ink-500">{j}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map(badge => (
            <span
              key={badge}
              className={`text-sm px-3 py-1.5 rounded-full border font-medium ${
                (driver.badges as readonly string[]).includes(badge)
                  ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
                  : "bg-cream-100 border-cream-200 text-ink-500 opacity-40"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">10 dernières livraisons</h2>
        {driverOrders.length === 0 ? (
          <p className="text-sm text-ink-500">Aucune livraison enregistrée.</p>
        ) : (
          <div className="space-y-2">
            {driverOrders.map(o => (
              <Link key={o.id} href={`/admin/commandes/${o.id}`} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded transition-colors">
                <span className="font-mono text-xs text-emerald-500">{o.id}</span>
                <span className="text-sm text-ink-700">{o.clientName}</span>
                <span className="text-sm font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
