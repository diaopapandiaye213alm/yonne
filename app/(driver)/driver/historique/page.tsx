import { drivers } from "@/lib/mock-data/drivers";
import { orders } from "@/lib/mock-data/orders";
import { History, TrendingUp, Package } from "lucide-react";

const demo = drivers[0];

const driverOrders = orders
  .filter(o => o.status === "livrée")
  .slice(0, 20);

const totalEarnings = driverOrders.reduce((sum, o) => sum + Math.round(o.amount * 0.25), 0);
const avgPerOrder   = driverOrders.length > 0 ? Math.round(totalEarnings / driverOrders.length) : 0;

const weeklyData = [
  { day: "Lun", orders: 8,  earnings: 12000 },
  { day: "Mar", orders: 11, earnings: 18500 },
  { day: "Mer", orders: 14, earnings: 22000 },
  { day: "Jeu", orders: 9,  earnings: 15000 },
  { day: "Ven", orders: 17, earnings: 28000 },
  { day: "Sam", orders: 20, earnings: 31000 },
  { day: "Dim", orders: demo.ordersToday, earnings: demo.earningsToday },
];
const maxEarning = Math.max(...weeklyData.map(w => w.earnings));

export default function HistoriquePage() {
  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">Historique</h1>
        <p className="text-xs text-ink-500 mt-0.5">Vos 20 dernières livraisons</p>
      </div>

      {/* KPI résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <History className="w-4 h-4 text-ink-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-ink-900">{driverOrders.length}</div>
          <div className="text-xs text-ink-500">Livraisons</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-lg text-emerald-500">
            {totalEarnings.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F total</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <Package className="w-4 h-4 text-gold-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-gold-500">
            {avgPerOrder.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F / course</div>
        </div>
      </div>

      {/* Graphe semaine */}
      <div className="bg-white rounded-lg border border-cream-200 p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">Cette semaine</h2>
        <div className="flex items-end gap-1.5 h-20">
          {weeklyData.map(({ day, earnings }, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all ${i === weeklyData.length - 1 ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-500/50"}`}
                style={{ height: `${Math.round((earnings / maxEarning) * 72)}px` }}
              />
              <span className="text-xs text-ink-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste livraisons */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm">Dernières livraisons</h2>
          <span className="text-xs text-ink-500">{driverOrders.length} commandes</span>
        </div>
        {driverOrders.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-500">
            Aucune livraison enregistrée.
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {driverOrders.map(o => {
              const gain = Math.round(o.amount * 0.25);
              return (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-cream-50 transition-colors">
                  <div>
                    <div className="font-mono text-xs text-emerald-500">{o.id}</div>
                    <div className="text-sm text-ink-700">{o.clientName}</div>
                    <div className="text-xs text-ink-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-500 text-sm">
                      +{gain.toLocaleString("fr-FR")} F
                    </div>
                    <div className="text-xs text-ink-500">{o.paymentMethod}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
