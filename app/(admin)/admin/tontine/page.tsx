"use client";
import { useState } from "react";
import { toast } from "sonner";
import { PiggyBank, CheckCircle2, Circle, Bell, TrendingUp, Users } from "lucide-react";
import { useT } from "@/lib/i18n";

type Member = { id: string; name: string; paid: boolean; week: number };

const COTISATION = 2000;
const CURRENT_WEEK = 12;
const BENEFICIARY = "Awa Fall";
const NEXT_BENE = "Cheikh Ba";
const TOTAL_WEEKS = 24;

const MEMBERS_INIT: Member[] = [
  { id: "M-01", name: "Awa Fall",       paid: true,  week: 12 },
  { id: "M-02", name: "Cheikh Ba",      paid: true,  week: 13 },
  { id: "M-03", name: "Fatou Ndiaye",   paid: false, week: 14 },
  { id: "M-04", name: "Ibou Diallo",    paid: true,  week: 15 },
  { id: "M-05", name: "Mariama Sow",    paid: false, week: 16 },
  { id: "M-06", name: "Omar Thiam",     paid: true,  week: 17 },
  { id: "M-07", name: "Rokhaya Gaye",   paid: true,  week: 18 },
  { id: "M-08", name: "Seydou Mbaye",   paid: false, week: 19 },
];

export default function TontinePage() {
  const t = useT();
  const [members, setMembers] = useState<Member[]>(MEMBERS_INIT);

  function markPaid(id: string) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, paid: true } : m));
    const m = members.find(m => m.id === id);
    toast.success(`Paiement de ${m?.name} enregistré`);
  }

  function relancerTous() {
    const unpaid = members.filter(m => !m.paid);
    if (unpaid.length === 0) { toast.success("Tous les membres ont payé !"); return; }
    toast.success(`Rappel envoyé à ${unpaid.length} membre${unpaid.length > 1 ? "s" : ""} via WhatsApp`);
  }

  const paid = members.filter(m => m.paid).length;
  const totalPot = paid * COTISATION;
  const progress = Math.round((CURRENT_WEEK / TOTAL_WEEKS) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-900">{t("tontineTitle")}</h1>
        <button type="button" onClick={relancerTous}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-colors shadow-glow-emerald">
          <Bell className="w-4 h-4" /> Relancer tous
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pot commun",       value: `${totalPot.toLocaleString("fr-FR")} F`, icon: PiggyBank,   color: "text-emerald-600" },
          { label: "Membres actifs",   value: `${members.length}`,                    icon: Users,        color: "text-ink-700" },
          { label: "Taux de collecte", value: `${Math.round((paid / members.length) * 100)}%`, icon: TrendingUp, color: "text-gold-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Beneficiary banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Bénéficiaire · Semaine {CURRENT_WEEK}</p>
            <p className="text-2xl font-display font-bold">{BENEFICIARY}</p>
            <p className="text-emerald-100 text-sm mt-1">Reçoit <strong className="text-white">{(members.length * COTISATION).toLocaleString("fr-FR")} F</strong> ce vendredi</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-xs mb-1">Prochain bénéficiaire</p>
            <p className="font-semibold">{NEXT_BENE}</p>
            <p className="text-emerald-100 text-xs mt-0.5">Semaine {CURRENT_WEEK + 1}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-emerald-100 mb-1">
            <span>Progression du cycle</span>
            <span>Semaine {CURRENT_WEEK} / {TOTAL_WEEKS}</span>
          </div>
          <div className="h-2 bg-emerald-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm">Cotisations — Semaine {CURRENT_WEEK}</h2>
          <span className="text-xs text-ink-500">{paid}/{members.length} payés · {COTISATION.toLocaleString("fr-FR")} F/membre</span>
        </div>
        <div className="divide-y divide-cream-100">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-4 px-5 py-3">
              {m.paid
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                : <Circle className="w-5 h-5 text-ink-300 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 text-sm">{m.name}</div>
                <div className="text-xs text-ink-400">Bénéficiaire sem. {m.week}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {m.paid ? "Payé" : "En attente"}
                </span>
                {!m.paid && (
                  <button type="button" onClick={() => markPaid(m.id)}
                    className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                    Marquer payé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
