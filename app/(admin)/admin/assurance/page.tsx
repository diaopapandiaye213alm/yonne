"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, TrendingUp, Banknote, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { useOrdersStore } from "@/lib/store/orders";
import { useT } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import type { SavTicketRow } from "@/lib/database.types";

const INSURANCE_RATE = 0.005;
const INSURANCE_MIN  = 200;
const PAYOUT_RATE    = 0.18; // 18% sinistres → revenu net 82%

const STATUT_STYLE: Record<"ouvert" | "en cours" | "résolu", string> = {
  "ouvert":   "bg-amber-100 text-amber-700",
  "en cours": "bg-blue-100 text-blue-700",
  "résolu":   "bg-emerald-100 text-emerald-700",
};

export default function AssurancePage() {
  const t = useT();
  const { orders } = useOrdersStore();
  const [activeTab, setActiveTab] = useState<"stats" | "sinistres" | "info">("stats");
  const [sinistres, setSinistres] = useState<SavTicketRow[]>([]);

  useEffect(() => {
    supabase
      .from("sav_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setSinistres(data); });
  }, []);

  const stats = useMemo(() => {
    const assuredOrders = orders.filter(o => o.insurance);
    const primes = assuredOrders.reduce((s, o) => {
      return s + Math.max(Math.round(o.amount * INSURANCE_RATE), INSURANCE_MIN);
    }, 0);
    const sinistresResolus = sinistres.filter(s => s.status === "résolu");
    const montantRembourse = sinistresResolus.length * 50000 * 0.8;
    const revenuNet = primes - montantRembourse;
    const tauxCouverture = assuredOrders.length / Math.max(orders.length, 1);
    return { assuredOrders: assuredOrders.length, primes, montantRembourse, revenuNet, tauxCouverture };
  }, [orders, sinistres]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("assuranceTitle")}</h1>
          <p className="text-sm text-ink-500 mt-0.5">Option +200 F CFA · calcul automatique 0,5% du montant</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          Revenu net 82%
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Commandes assurées",
            value: stats.assuredOrders,
            sub: `${Math.round(stats.tauxCouverture * 100)}% du total`,
            icon: Shield,
            color: "text-emerald-500",
            border: "border-emerald-200",
          },
          {
            label: "Primes collectées",
            value: `${stats.primes.toLocaleString("fr-FR")} F`,
            sub: "depuis le début",
            icon: Banknote,
            color: "text-gold-500",
            border: "border-gold-300/40",
          },
          {
            label: "Sinistres déclarés",
            value: sinistres.length,
            sub: `${sinistres.filter(s => s.status === "ouvert").length} en cours`,
            icon: AlertTriangle,
            color: "text-amber-500",
            border: "border-amber-200",
          },
          {
            label: "Revenu net assurance",
            value: `${Math.max(stats.revenuNet, 0).toLocaleString("fr-FR")} F`,
            sub: "après remboursements",
            icon: TrendingUp,
            color: "text-emerald-600",
            border: "border-emerald-200",
          },
        ].map(({ label, value, sub, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-lg border ${border} shadow-card p-4`}>
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
            <div className="text-[10px] text-ink-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Barre revenu */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-ink-700">Répartition des primes</span>
          <span className="text-xs text-ink-400">Taux de sinistralité : {Math.round(PAYOUT_RATE * 100)}%</span>
        </div>
        <div className="flex h-5 rounded-full overflow-hidden text-xs font-medium">
          <div className="bg-emerald-500 flex items-center justify-center text-white" style={{ width: "82%" }}>
            82% net
          </div>
          <div className="bg-amber-400 flex items-center justify-center text-ink-900" style={{ width: "18%" }}>
            18%
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Revenu net YONNE (82%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Remboursements sinistres (18%)</span>
        </div>
      </div>

      {/* Onglets */}
      <div>
        <div className="flex gap-1 bg-cream-100 p-1 rounded-lg w-fit mb-4">
          {(["stats", "sinistres", "info"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white shadow-sm text-ink-900"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {tab === "stats" ? "Vue d'ensemble" : tab === "sinistres" ? "Sinistres" : "Fonctionnement"}
            </button>
          ))}
        </div>

        {activeTab === "stats" && (
          <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
            <div className="p-4 border-b border-cream-100">
              <h2 className="text-sm font-semibold text-ink-900">Commandes récentes assurées</h2>
            </div>
            <div className="divide-y divide-cream-100">
              {orders.filter(o => o.insurance).slice(0, 8).map(o => {
                const prime = Math.max(Math.round(o.amount * INSURANCE_RATE), INSURANCE_MIN);
                return (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3 hover:bg-cream-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-ink-900 font-mono">{o.id}</div>
                        <div className="text-xs text-ink-500">{o.clientName} · {o.amount.toLocaleString("fr-FR")} F</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">+{prime} F</div>
                      <div className="text-xs text-ink-400">prime</div>
                    </div>
                  </div>
                );
              })}
              {orders.filter(o => o.insurance).length === 0 && (
                <div className="p-8 text-center text-sm text-ink-400">
                  Aucune commande assurée pour l&apos;instant
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sinistres" && (
          <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
            <div className="p-4 border-b border-cream-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Sinistres déclarés</h2>
              <Link href="/admin/sav" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                Gérer via SAV <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-cream-100">
              {sinistres.length === 0 && (
                <div className="p-8 text-center text-sm text-ink-400">
                  Aucun sinistre déclaré.
                </div>
              )}
              {sinistres.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-cream-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      s.status === "ouvert"   ? "text-amber-500" :
                      s.status === "en cours" ? "text-blue-500"  : "text-emerald-500"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-900 font-mono">{s.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUT_STYLE[s.status]}`}>{s.status}</span>
                      </div>
                      <div className="text-xs text-ink-500">{s.type ?? "—"} · {s.order_ref ?? "—"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink-900">—</div>
                    <div className="text-xs text-ink-400">{new Date(s.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-ink-900">Comment fonctionne l&apos;assurance ?</h2>
              <div className="space-y-3">
                {[
                  {
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                    title: "À la création de commande",
                    desc: "Le commerçant coche l'option assurance (+200 F minimum). La prime est calculée automatiquement : 0,5% du montant de la commande, minimum 200 F CFA.",
                  },
                  {
                    icon: Shield,
                    color: "text-emerald-500",
                    title: "Ce qui est couvert",
                    desc: "Perte du colis, dommages majeurs (> 30% de la valeur), mauvaise livraison confirmée par le livreur. Les dommages mineurs ou le refus du client ne sont pas couverts.",
                  },
                  {
                    icon: AlertTriangle,
                    color: "text-amber-500",
                    title: "Processus sinistre",
                    desc: "Le commerçant signale via le SAV en choisissant le type « Sinistre assurance ». L'équipe YONNE instruit le dossier sous 48h. Le remboursement (80% du montant) est effectué par Wave ou Orange Money.",
                  },
                  {
                    icon: Clock,
                    color: "text-ink-400",
                    title: "Délai de remboursement",
                    desc: "Le remboursement intervient dans les 5 jours ouvrés après validation du sinistre. Le livreur est notifié et sa note peut être impactée.",
                  },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                    <div>
                      <div className="text-sm font-medium text-ink-800">{title}</div>
                      <div className="text-xs text-ink-500 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-emerald-800 mb-1">Exemple de calcul</div>
              <div className="text-xs text-emerald-700 space-y-1">
                <div>Commande 50 000 F → prime = 50 000 × 0,5% = <strong>250 F</strong></div>
                <div>Commande 15 000 F → prime = max(75 F, 200 F) = <strong>200 F</strong> (minimum)</div>
                <div>Remboursement sinistre → 80% de la valeur du colis déclaré</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
