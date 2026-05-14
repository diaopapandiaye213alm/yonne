"use client";

import { useState, useMemo, useEffect } from "react";
import { useDriversStore } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import { WeeklyEarningsChart } from "@/components/driver/WeeklyEarningsChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { Smartphone, Banknote, ChevronRight, Star, MapPin, Target, X, CheckCircle2, Loader2 } from "lucide-react";

const DAILY_GOAL = 20000;

type RetraitEntry = { id: string; amount: number; phone: string; provider: "wave" | "orange"; date: string };
const RETRAIT_KEY = "yonne_retrait_history";

function loadHistory(): RetraitEntry[] {
  try { return JSON.parse(localStorage.getItem(RETRAIT_KEY) ?? "[]"); } catch { return []; }
}

export default function GainsPage() {
  const t = useT();
  const session = useSession();
  const { drivers } = useDriversStore();
  const { orders } = useOrdersStore();

  const demo = useMemo(() => {
    const byName = session?.displayName ? drivers.find(d => d.name === session.displayName) : null;
    return byName ?? drivers[0] ?? { id: "", ordersToday: 8, earningsToday: 14200, badges: ["Rapide"], rating: 4.8 };
  }, [drivers, session?.displayName]);

  // Build today's deliveries from real orders
  const todayDeliveries = useMemo(() => {
    const todayStr = new Date().toDateString();
    const real = orders.filter(o =>
      o.status === "livrée" &&
      o.driverId === demo.id &&
      new Date(o.createdAt).toDateString() === todayStr
    );

    const source = real;

    return source.map(o => {
      const d = new Date(o.createdAt);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const landmark = landmarks.find(l => l.id === o.landmarkId);
      return {
        id: o.id,
        time: `${hh}:${mm}`,
        client: o.clientName,
        zone: landmark?.name ?? o.landmarkId,
        amount: o.amount,
        gain: Math.round(o.amount * 0.25),
        rating: 5 as const,
      };
    });
  }, [orders, demo.id]);

  const earningsToday = todayDeliveries.reduce((s, o) => s + o.gain, 0);
  const coursesCount = todayDeliveries.length;
  const avgRating = todayDeliveries.length > 0
    ? (todayDeliveries.reduce((s, d) => s + d.rating, 0) / todayDeliveries.length).toFixed(1)
    : "5.0";

  const goalPct = Math.min(100, Math.round((earningsToday / DAILY_GOAL) * 100));
  const remaining = Math.max(0, DAILY_GOAL - earningsToday);

  const ADVANCE_MAX = Math.floor(earningsToday * 0.8) || Math.floor(demo.earningsToday * 0.8);
  const [avanceAmount, setAvanceAmount] = useState(0);
  useEffect(() => { setAvanceAmount(Math.floor(ADVANCE_MAX / 2)); }, [ADVANCE_MAX]);
  const [showDeliveries, setShowDeliveries] = useState(false);

  type WithdrawProvider = "wave" | "orange" | null;
  const [withdrawProvider, setWithdrawProvider] = useState<WithdrawProvider>(null);
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawStep, setWithdrawStep] = useState<"form" | "processing" | "done">("form");
  const [retraitHistory, setRetraitHistory] = useState<RetraitEntry[]>([]);
  useEffect(() => { setRetraitHistory(loadHistory()); }, []);

  function openWithdraw(provider: "wave" | "orange") {
    setWithdrawProvider(provider);
    setWithdrawPhone("");
    setWithdrawStep("form");
  }
  function closeWithdraw() {
    if (withdrawStep === "done" && withdrawProvider && withdrawPhone) {
      const entry: RetraitEntry = {
        id: `r${Date.now()}`,
        amount: earningsToday,
        phone: withdrawPhone,
        provider: withdrawProvider,
        date: new Date().toLocaleDateString("fr-FR"),
      };
      const next = [entry, ...retraitHistory].slice(0, 10);
      setRetraitHistory(next);
      try { localStorage.setItem(RETRAIT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    }
    setWithdrawProvider(null);
    setWithdrawStep("form");
  }
  function confirmWithdraw() {
    if (!withdrawPhone.trim()) return;
    setWithdrawStep("processing");
    setTimeout(() => setWithdrawStep("done"), 2500);
  }
  const dateStr = new Date().toLocaleDateString("fr-FR", {
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
          <div className="font-mono font-bold text-xl text-ink-900">{coursesCount}</div>
          <div className="text-xs text-ink-500">{t("courses")}</div>
        </div>
        <div className="stagger-2 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-lg text-emerald-500">
            {earningsToday.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F CFA</div>
        </div>
        <div className="stagger-3 animate-fade-in-up bg-white rounded-lg border border-cream-200 p-3 text-center">
          <div className="font-mono font-bold text-xl text-gold-500">{avgRating}</div>
          <div className="text-xs text-ink-500">Note ★</div>
        </div>
      </div>

      {/* Objectif du jour */}
      <div className="bg-white rounded-lg border border-emerald-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h2 className="font-display font-semibold text-ink-900 text-sm">Objectif du jour</h2>
          <span className="ml-auto text-xs font-mono text-ink-500">{goalPct}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-cream-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-emerald-700">
            {earningsToday.toLocaleString("fr-FR")} F
            <span className="text-ink-400 font-normal"> / 20 000 F</span>
          </span>
          {goalPct >= 100 ? (
            <span className="text-emerald-600 font-semibold">🎉 Objectif atteint !</span>
          ) : earningsToday === 0 ? (
            <span className="text-ink-500">🚀 Première livraison du jour — bonne journée !</span>
          ) : (
            <span className="text-ink-500">
              Encore <span className="font-semibold text-ink-700">{remaining.toLocaleString("fr-FR")} F</span> pour atteindre votre objectif !
            </span>
          )}
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
              {todayDeliveries.length} courses
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ChevronRight className={`w-4 h-4 text-ink-400 transition-transform ${showDeliveries ? "rotate-90" : ""}`} />
          </div>
        </button>

        {showDeliveries && (
          <div className="border-t border-cream-100 divide-y divide-cream-50">
            {todayDeliveries.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-2xl">🛵</div>
                <div className="text-sm font-medium text-ink-900">Aucune livraison aujourd&apos;hui</div>
                <div className="text-xs text-ink-500">Vos gains s&apos;afficheront ici dès votre première livraison</div>
              </div>
            ) : (
              todayDeliveries.map(d => (
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
                      {d.gain.toLocaleString("fr-FR")} F
                    </div>
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3 h-3 ${n <= d.rating ? "text-gold-500 fill-gold-500" : "text-cream-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {/* Summary row */}
            {todayDeliveries.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5">
                <span className="text-xs font-semibold text-ink-700">Total du jour</span>
                <span className="font-mono font-bold text-emerald-600">
                  {earningsToday.toLocaleString("fr-FR")} F
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-lg border border-cream-200 p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3">{t("thisWeek")}</h2>
        <WeeklyEarningsChart orders={orders} driverId={demo.id ?? ""} />
      </div>

      {/* Badge */}
      <div className="bg-white rounded-lg border border-gold-500 p-4 flex items-center gap-3">
        <div className="text-2xl">🏆</div>
        <div>
          <div className="text-xs text-ink-500">{t("weekBadge")}</div>
          <Badge className="mt-1 bg-gold-500/20 text-ink-900 border border-gold-500 font-medium">
            {demo.badges?.[0] ?? "Livreur"}
          </Badge>
        </div>
      </div>

      {/* Retrait Wave / Orange Money */}
      <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
        <h2 className="font-display font-semibold text-ink-900 text-sm">{t("instantWithdraw")}</h2>
        <p className="text-xs text-ink-500">Recevez vos gains instantanément sur votre portefeuille mobile.</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button"
            onClick={() => openWithdraw("wave")}
            className="flex items-center gap-2 bg-[#1B96D4] hover:bg-[#1580B8] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Wave</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
          <button type="button"
            onClick={() => openWithdraw("orange")}
            className="flex items-center gap-2 bg-[#FF6600] hover:bg-[#E55A00] text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Orange Money</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        </div>
      </div>

      {retraitHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
          <h2 className="font-display font-semibold text-ink-900 text-sm">Historique des retraits</h2>
          <div className="divide-y divide-cream-50">
            {retraitHistory.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${r.provider === "wave" ? "bg-[#1B96D4]" : "bg-[#FF6600]"}`}>
                    {r.provider === "wave" ? "W" : "O"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">{r.provider === "wave" ? "Wave" : "Orange Money"}</div>
                    <div className="text-xs text-ink-400">{r.phone} · {r.date}</div>
                  </div>
                </div>
                <div className="font-mono font-semibold text-emerald-600 text-sm">
                  {r.amount.toLocaleString("fr-FR")} F
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avance sur salaire */}
      <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-gold-500" />
          <h2 className="font-display font-semibold text-ink-900 text-sm">{t("salaryAdvance")}</h2>
        </div>
        <p className="text-xs text-ink-500">{t("advanceDesc")}</p>
        <div className="flex items-center gap-3">
          <input type="range" min={500} max={Math.max(500, ADVANCE_MAX)} step={500} value={avanceAmount}
            onChange={e => setAvanceAmount(Number(e.target.value))}
            className="flex-1 accent-gold-500" />
          <span className="font-bold text-gold-500 text-sm w-24 text-right tabular-nums">
            {avanceAmount.toLocaleString("fr-FR")} F
          </span>
        </div>
        <Button type="button"
          onClick={() => { setWithdrawProvider("wave"); setWithdrawPhone(""); setWithdrawStep("form"); }}
          className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold">
          {t("requestAdvance")}
        </Button>
      </div>

      {/* Withdraw modal */}
      {withdrawProvider && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-sm p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
            {withdrawStep === "done" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h3 className="font-display font-bold text-lg text-ink-900">Virement initié !</h3>
                <p className="text-sm text-ink-500">
                  {earningsToday.toLocaleString("fr-FR")} F CFA vers votre{" "}
                  {withdrawProvider === "wave" ? "Wave" : "Orange Money"}{" "}
                  ({withdrawPhone})<br />
                  <span className="font-medium text-emerald-600">
                    Délai estimé : {withdrawProvider === "wave" ? "2–5 min" : "5–10 min"}
                  </span>
                </p>
                <Button onClick={closeWithdraw} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold">
                  Fermer
                </Button>
              </div>
            ) : withdrawStep === "processing" ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm font-medium text-ink-700">
                  Traitement du virement{withdrawProvider === "wave" ? " Wave" : " Orange Money"}…
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-ink-900">
                    Retrait {withdrawProvider === "wave" ? "Wave" : "Orange Money"}
                  </h3>
                  <button type="button" onClick={closeWithdraw}>
                    <X className="w-5 h-5 text-ink-400" />
                  </button>
                </div>
                <div className="bg-cream-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-ink-500 mb-1">Montant à virer</div>
                  <div className="font-mono font-bold text-2xl text-emerald-600">
                    {earningsToday.toLocaleString("fr-FR")} F CFA
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink-700">
                    Numéro {withdrawProvider === "wave" ? "Wave" : "Orange Money"}
                  </label>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={e => setWithdrawPhone(e.target.value)}
                    placeholder="+221 7X XXX XX XX"
                    className="w-full border border-cream-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  disabled={!withdrawPhone.trim() || earningsToday === 0}
                  onClick={confirmWithdraw}
                  className={`w-full font-display font-bold text-white ${
                    withdrawProvider === "wave"
                      ? "bg-[#1B96D4] hover:bg-[#1580B8]"
                      : "bg-[#FF6600] hover:bg-[#E55A00]"
                  } disabled:opacity-50`}
                >
                  Confirmer le virement
                </Button>
                {earningsToday === 0 && (
                  <p className="text-xs text-red-500 text-center">Aucun gain à retirer pour le moment.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
