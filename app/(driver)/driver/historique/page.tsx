"use client";

import { useState, useMemo } from "react";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useT } from "@/lib/i18n";
import { History, TrendingUp, Package, Download, Filter } from "lucide-react";
import { toast } from "sonner";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"] as const;
type Month = typeof MONTH_LABELS[number];
type PayFilter = "Tous" | "wave" | "orange" | "cash";

const PAY_COLORS: Record<string, string> = {
  wave:   "bg-[#1B96D4]/10 text-[#1B96D4]",
  orange: "bg-orange-100 text-orange-700",
  cash:   "bg-cream-200 text-ink-700",
};

const PAY_LABELS: Record<string, string> = {
  wave: "Wave", orange: "Orange", cash: "Cash",
};

export default function HistoriquePage() {
  const t           = useT();
  const { orders }  = useOrdersStore();
  const { drivers } = useDriversStore();
  const session     = useSession();

  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0];
  }, [drivers, session?.displayName]);

  const [payFilter, setPayFilter] = useState<PayFilter>("Tous");

  // Derive available months from real createdAt dates
  const allDeliveries = useMemo(() =>
    orders
      .filter(o => o.status === "livrée" && (!demo || o.driverId === demo.id))
      .map(o => ({
        ...o,
        gain: Math.round(o.amount * 0.25),
        month: MONTH_LABELS[new Date(o.createdAt).getMonth()] as Month,
      })),
    [orders, demo]
  );

  const availableMonths = useMemo(() => {
    const seen = new Set<Month>();
    allDeliveries.forEach(o => seen.add(o.month));
    return MONTH_LABELS.filter(m => seen.has(m as Month));
  }, [allDeliveries]);

  const currentMonth = MONTH_LABELS[new Date().getMonth()] as Month;
  const [month, setMonth] = useState<Month>(
    availableMonths.includes(currentMonth) ? currentMonth : (availableMonths[availableMonths.length - 1] ?? currentMonth)
  );

  const filtered = useMemo(() =>
    allDeliveries.filter(o =>
      o.month === month &&
      (payFilter === "Tous" || o.paymentMethod === payFilter)
    ),
    [allDeliveries, month, payFilter]
  );

  const totalEarnings = filtered.reduce((s, o) => s + o.gain, 0);
  const avgPerOrder   = filtered.length > 0 ? Math.round(totalEarnings / filtered.length) : 0;

  function exportCsv() {
    const rows = [
      ["ID", "Client", "Montant", "Gain", "Paiement", "Date"],
      ...filtered.map(o => [
        o.id, o.clientName, o.amount, o.gain, PAY_LABELS[o.paymentMethod] ?? o.paymentMethod,
        new Date(o.createdAt).toLocaleDateString("fr-FR"),
      ]),
    ];
    const csv  = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `historique-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-5 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">{t("driverHistory")}</h1>
          <p className="text-xs text-ink-500 mt-0.5">{t("pastDeliveries")}</p>
        </div>
        <button type="button" onClick={exportCsv}
          className="flex items-center gap-1.5 text-xs border border-cream-200 text-ink-700 rounded-lg px-3 py-1.5 hover:bg-cream-100 transition-colors">
          <Download className="w-3.5 h-3.5" /> {t("exportBtn")}
        </button>
      </div>

      {/* Month tabs — only months with real data */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(availableMonths.length > 0 ? availableMonths : [currentMonth]).map(m => (
          <button key={m} type="button" onClick={() => setMonth(m)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              month === m ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}>
            {m}
          </button>
        ))}
      </div>

      {/* KPI résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stagger-1 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <History className="w-4 h-4 text-ink-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-ink-900">{filtered.length}</div>
          <div className="text-xs text-ink-500">{t("livraisons")}</div>
        </div>
        <div className="stagger-2 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-lg text-emerald-500">{totalEarnings.toLocaleString("fr-FR")}</div>
          <div className="text-xs text-ink-500">{t("totalEarnings")}</div>
        </div>
        <div className="stagger-3 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <Package className="w-4 h-4 text-gold-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-gold-500">{avgPerOrder.toLocaleString("fr-FR")}</div>
          <div className="text-xs text-ink-500">{t("perCourse")}</div>
        </div>
      </div>

      {/* Graphe 7 derniers jours — données réelles */}
      {(() => {
        const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const today = new Date(); today.setHours(23,59,59,999);
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today); d.setDate(today.getDate() - (6 - i));
          const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
          const dayEnd   = new Date(d); dayEnd.setHours(23,59,59,999);
          const gain = allDeliveries
            .filter(o => { const t = new Date(o.createdAt); return t >= dayStart && t <= dayEnd; })
            .reduce((s, o) => s + o.gain, 0);
          return { day: DAY_LABELS[d.getDay()], earnings: gain, isToday: i === 6 };
        });
        const maxDay = Math.max(...days.map(d => d.earnings), 1);
        return (
          <div className="bg-white rounded-lg border border-cream-200 p-4">
            <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">{t("thisWeek")}</h2>
            <div className="flex items-end gap-1.5 h-20">
              {days.map(({ day, earnings, isToday }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${isToday ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-500/50"}`}
                    style={{ height: `${Math.round((earnings / maxDay) * 72)}px`, minHeight: earnings > 0 ? "4px" : "0" }}
                  />
                  <span className={`text-xs ${isToday ? "text-emerald-600 font-semibold" : "text-ink-500"}`}>{day}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Payment filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-ink-400 shrink-0" />
        {(["Tous", "wave", "orange", "cash"] as PayFilter[]).map(p => (
          <button key={p} type="button" onClick={() => setPayFilter(p)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              payFilter === p ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}>
            {PAY_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      {/* Liste livraisons */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm">Livraisons — {month}</h2>
          <span className="text-xs text-ink-500">{filtered.length} commandes</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-500">{t("noDeliveries")}</div>
        ) : (
          <div className="divide-y divide-cream-100">
            {filtered.map(o => {
              const landmark = landmarks.find(l => l.id === o.landmarkId);
              const duration = parseInt(o.id.slice(-2), 16) % 20 + 10;
              const rating = parseInt(o.id.slice(-1), 16) % 2 === 0 ? 5 : 4;
              return (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-cream-50 transition-colors">
                  <div>
                    <div className="font-mono text-xs text-emerald-500">{o.id}</div>
                    <div className="text-sm text-ink-700">{o.clientName}</div>
                    <div className="text-xs text-ink-400 mt-0.5">
                      {landmark?.name ?? o.landmarkId}
                    </div>
                    <div className="text-xs text-ink-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PAY_COLORS[o.paymentMethod] ?? "bg-cream-100 text-ink-600"}`}>
                      {PAY_LABELS[o.paymentMethod] ?? o.paymentMethod}
                    </span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-500 text-sm">+{o.gain.toLocaleString("fr-FR")} F</div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[#F59E0B] text-xs">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
                      </div>
                      <div className="text-xs text-ink-500 tabular-nums mt-0.5">⏱ {duration} min</div>
                    </div>
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
