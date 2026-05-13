"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Moon, Clock, TrendingUp, ToggleLeft, ToggleRight, Users } from "lucide-react";

type Prayer = {
  name: string; arabic: string; time: string;
  hour: number; minute: number;
  reduction: number; surge: boolean;
  driversOffline: number;
};

const PRAYERS_INIT: Prayer[] = [
  { name: "Fajr (Subh)",  arabic: "الفجر",   time: "05:45", hour: 5,  minute: 45, reduction: 20, surge: false, driversOffline: 4 },
  { name: "Dhuhr (Zuhr)", arabic: "الظهر",   time: "13:15", hour: 13, minute: 15, reduction: 15, surge: true,  driversOffline: 9 },
  { name: "Asr",          arabic: "العصر",   time: "16:30", hour: 16, minute: 30, reduction: 10, surge: true,  driversOffline: 7 },
  { name: "Maghrib",      arabic: "المغرب",  time: "19:48", hour: 19, minute: 48, reduction: 20, surge: true,  driversOffline: 8 },
  { name: "Isha",         arabic: "العشاء",  time: "21:10", hour: 21, minute: 10, reduction: 15, surge: false, driversOffline: 5 },
];

function toMinutes(h: number, m: number) { return h * 60 + m; }

function getNextPrayer(prayers: Prayer[]) {
  const now = new Date();
  const nowMin = toMinutes(now.getHours(), now.getMinutes());
  return prayers.find(p => toMinutes(p.hour, p.minute) > nowMin) ?? prayers[0];
}

function getCountdown(prayer: Prayer): string {
  const now = new Date();
  const prayerMin = toMinutes(prayer.hour, prayer.minute);
  const nowMin = toMinutes(now.getHours(), now.getMinutes()) + now.getSeconds() / 60;
  let diff = prayerMin - nowMin;
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = Math.floor(diff % 60);
  const s = Math.floor((diff % 1) * 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function DayTimeline({ prayers }: { prayers: Prayer[] }) {
  const now = new Date();
  const nowMin = toMinutes(now.getHours(), now.getMinutes());
  const dayMin = 24 * 60;

  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
      <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-ink-400" /> Timeline du jour · 00h–24h
      </h2>
      <div className="relative h-8 bg-cream-100 rounded-full overflow-hidden">
        {/* Current time marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${(nowMin / dayMin) * 100}%` }}
        />
        {/* Prayer windows */}
        {prayers.map((p) => {
          const startMin = toMinutes(p.hour, p.minute) - p.reduction;
          const endMin   = toMinutes(p.hour, p.minute) + 20;
          const isPast   = toMinutes(p.hour, p.minute) < nowMin;
          return (
            <div
              key={p.name}
              title={`${p.name} · ${p.time}`}
              className={`absolute top-0 bottom-0 rounded-sm ${isPast ? "bg-ink-300/40" : "bg-emerald-500/40"}`}
              style={{
                left:  `${Math.max(0, (startMin / dayMin) * 100)}%`,
                width: `${((endMin - startMin) / dayMin) * 100}%`,
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-ink-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-emerald-500/40" />
          <span>Fenêtre prière (à venir)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-ink-300/40" />
          <span>Prière passée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-red-500" />
          <span>Maintenant</span>
        </div>
      </div>
      {/* Time labels */}
      <div className="flex justify-between text-[10px] text-ink-400 mt-1">
        {["00h", "06h", "12h", "18h", "24h"].map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  );
}

export default function PrierePage() {
  const [enabled,  setEnabled]  = useState(true);
  const [prayers,  setPrayers]  = useState<Prayer[]>(PRAYERS_INIT);
  const [countdown, setCountdown] = useState("");

  const nextPrayer = getNextPrayer(prayers);

  useEffect(() => {
    setCountdown(getCountdown(nextPrayer));
    const id = setInterval(() => setCountdown(getCountdown(nextPrayer)), 1000);
    return () => clearInterval(id);
  }, [nextPrayer]);

  function toggleSurge(i: number) {
    setPrayers(prev => prev.map((p, idx) => idx === i ? { ...p, surge: !p.surge } : p));
    toast.success("Configuration sauvegardée");
  }

  function updateReduction(i: number, val: number) {
    setPrayers(prev => prev.map((p, idx) => idx === i ? { ...p, reduction: val } : p));
  }

  const totalOffline = prayers.reduce((s, p) => Math.max(s, p.driversOffline), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Heures de Prière</h1>
          <p className="text-sm text-ink-500 mt-1">Horaires Dakar · API IslamicFinder</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-200 rounded-lg px-4 py-2.5 shadow-card">
          <span className="text-sm text-ink-700 font-medium">Mode prière actif</span>
          <button type="button" onClick={() => {
            setEnabled(v => !v);
            toast.success(enabled ? "Mode prière désactivé" : "Mode prière activé");
          }}>
            {enabled
              ? <ToggleRight className="w-8 h-8 text-emerald-500" />
              : <ToggleLeft className="w-8 h-8 text-ink-400" />}
          </button>
        </div>
      </div>

      {/* Next prayer banner with live countdown */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-300/60 uppercase tracking-widest mb-1">Prochaine prière</div>
            <div className="text-2xl font-display font-bold text-white">{nextPrayer.name}</div>
            <div className="text-gold-400 text-lg mt-0.5">{nextPrayer.arabic}</div>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-3.5 h-3.5 text-ink-400" />
              <span className="text-xs text-ink-400">{nextPrayer.driversOffline} livreurs en pause · {totalOffline} au pic</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-white tabular-nums">{nextPrayer.time}</div>
            <div className="text-xs text-gold-400 mt-1 font-mono tabular-nums animate-live-pulse">
              dans {countdown}
            </div>
            {nextPrayer.surge && (
              <div className="mt-2 text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
                Micro-surge ×1.1 activé
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day timeline */}
      <DayTimeline prayers={prayers} />

      {/* Impact stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Prières / jour",         value: "5",                               icon: Moon,       color: "text-ink-700" },
          { label: "Pic hors-ligne (Dhuhr)", value: `${PRAYERS_INIT[1].driversOffline} livreurs`, icon: Users,      color: "text-amber-600" },
          { label: "Revenus surge (estimé)", value: "+8%",                              icon: TrendingUp, color: "text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Prayer cards */}
      <div className="space-y-3">
        {prayers.map((p, i) => {
          const now = new Date();
          const isPast = toMinutes(p.hour, p.minute) < toMinutes(now.getHours(), now.getMinutes());
          const isNext = p.name === nextPrayer.name;
          return (
            <div key={p.name} className={`bg-white rounded-lg border shadow-card p-4 transition-all ${
              isNext ? "border-gold-500/50 ring-1 ring-gold-500/20" :
              isPast ? "border-cream-100 opacity-60" : "border-cream-200"
            }`}>
              <div className="flex items-center gap-4">
                <Moon className={`w-5 h-5 shrink-0 ${isNext ? "text-gold-500" : isPast ? "text-ink-300" : "text-ink-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-ink-900">{p.name}</span>
                    <span className="text-ink-400 font-display text-sm">{p.arabic}</span>
                    <span className="font-mono text-sm text-ink-500">{p.time}</span>
                    {isNext && <span className="text-xs text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">Suivante</span>}
                    <span className="text-xs text-ink-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {p.driversOffline} off
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-ink-400" />
                      <span className="text-xs text-ink-500">Réduction dispatch :</span>
                      <input type="range" min={5} max={30} step={5} value={p.reduction}
                        onChange={e => updateReduction(i, Number(e.target.value))}
                        className="w-24 accent-emerald-500" />
                      <span className="text-xs font-medium text-ink-700 w-12">{p.reduction} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                      <span className="text-xs text-ink-500">Micro-surge ×1.1 :</span>
                      <button type="button" onClick={() => toggleSurge(i)}>
                        {p.surge
                          ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                          : <ToggleLeft className="w-6 h-6 text-ink-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button type="button"
          onClick={() => toast.success("Paramètres heures de prière enregistrés")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
