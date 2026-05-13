"use client";
import { useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/StatCard";
import {
  transactions, waveTotal, orangeTotal, cashTotal,
  tontineWeek, tontineMembers, tontineBeneficiary, tontineNextBeneficiary,
  referralPrizes as seedPrizes, advanceRequests as seedAdvances,
  insuranceCount, insuranceRevenue, insuranceMargin,
} from "@/lib/mock-data/finance";
import type { ReferralPrize, AdvanceRequest } from "@/lib/mock-data/finance";
import { CheckCircle2, Circle } from "lucide-react";

function fmt(n: number) { return n.toLocaleString("fr-FR"); }

export default function FinancePage() {
  const totalDay = waveTotal + orangeTotal + cashTotal;
  const [prizes, setPrizes] = useState<ReferralPrize[]>(seedPrizes);
  const [advances, setAdvances] = useState<AdvanceRequest[]>(seedAdvances);

  function handleVerser(idx: number) {
    const p = prizes[idx];
    toast.success(`Prime versée à ${p.referrerName} — ${fmt(p.prizeAmount)} F`);
    setPrizes((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleApprouver(id: string) {
    const r = advances.find((a) => a.id === id);
    if (r) toast.success(`Avance approuvée pour ${r.driverName} — ${fmt(r.requestedAmount)} F`);
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  }

  function handleRejeter(id: string) {
    const r = advances.find((a) => a.id === id);
    if (r) toast.error(`Demande rejetée — ${r.driverName}`);
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-display font-bold text-ink-900">Finance</h1>
        <p className="text-sm text-ink-500 mt-1">Vue d'ensemble — aujourd'hui</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard title="💳 Réconciliation" className="xl:col-span-1">
          <div className="text-3xl font-display font-bold text-ink-900 tabular-nums mb-4">{fmt(totalDay)} F</div>
          <div className="space-y-2">
            {[
              { label: "Wave",         value: waveTotal,   color: "bg-emerald-500/15 text-emerald-700" },
              { label: "Orange Money", value: orangeTotal, color: "bg-orange-100 text-orange-700" },
              { label: "Cash",         value: cashTotal,   color: "bg-cream-200 text-ink-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                <span className="font-mono text-sm font-medium">{fmt(value)} F</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-cream-100 pt-3 max-h-32 overflow-y-auto space-y-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between text-xs text-ink-500">
                <span className="font-mono">{t.id}</span>
                <span>{t.driverName.split(" ")[0]}</span>
                <span className="font-medium text-ink-900">{fmt(t.amount)} F</span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="🤝 Parrainage livreurs">
          <div className="text-sm text-ink-500 mb-3">
            {prizes.length} primes à verser · {fmt(prizes.length * 5_000)} F
          </div>
          {prizes.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune prime en attente</p>
          ) : (
            <div className="space-y-2">
              {prizes.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-cream-50 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{p.referrerName}</div>
                    <div className="text-xs text-ink-500">Filleul : {p.refereeName} · 10ᵉ livraison ✓</div>
                  </div>
                  <button
                    onClick={() => handleVerser(i)}
                    className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    Verser {fmt(p.prizeAmount)} F
                  </button>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="🏦 Tontine numérique">
          <div className="mb-3">
            <div className="text-xs text-ink-500">Semaine {tontineWeek} / 52 · Cotisation : 2 000 F/membre</div>
            <div className="mt-2 text-sm">
              <span className="text-ink-500">Bénéficiaire actuel :</span>{" "}
              <strong className="text-ink-900">{tontineBeneficiary}</strong>
            </div>
            <div className="text-sm">
              <span className="text-ink-500">Prochain :</span>{" "}
              <span className="text-ink-700">{tontineNextBeneficiary}</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {tontineMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {m.paid
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <Circle className="w-4 h-4 text-cream-200 shrink-0" />}
                <span className={m.paid ? "text-ink-700" : "text-ink-400"}>{m.name}</span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="💵 Avances sur salaire" className="md:col-span-2 xl:col-span-2">
          <div className="text-sm text-ink-500 mb-3">
            {advances.length} demandes · Total : {fmt(advances.reduce((s, r) => s + r.requestedAmount, 0))} F
          </div>
          {advances.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune demande en attente</p>
          ) : (
            <div className="space-y-3">
              {advances.map(r => (
                <div key={r.id} className="flex items-center gap-4 bg-cream-50 rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <div className="font-medium text-ink-900 text-sm">{r.driverName}</div>
                    <div className="text-xs text-ink-500">
                      Gains du jour : {fmt(r.earningsToday)} F · Demande : {fmt(r.requestedAmount)} F · Frais : {fmt(r.fee)} F
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprouver(r.id)}
                      className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >Approuver</button>
                    <button
                      onClick={() => handleRejeter(r.id)}
                      className="text-xs bg-cream-200 text-ink-700 px-3 py-1.5 rounded-lg hover:bg-cream-300 transition-colors"
                    >Rejeter</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="🛡️ Assurance colis">
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">{insuranceCount}</div>
              <div className="text-xs text-ink-500">assurances actives aujourd'hui</div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Primes collectées</span>
                <span className="font-medium">{fmt(insuranceRevenue)} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Marge nette (82%)</span>
                <span className="font-bold text-emerald-600">{fmt(insuranceMargin)} F</span>
              </div>
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  );
}
