"use client";

import { J7Countdown } from "@/components/tabaski/J7Countdown";
import { DemandCurve } from "@/components/tabaski/DemandCurve";
import { ActionPlanCard } from "@/components/tabaski/ActionPlanCard";
import { actionPlan, tabaski2025Stats } from "@/lib/mock-data/tabaski";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export default function TabaskiPage() {
  const t = useT();
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <header className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg p-7 shadow-card">
        <div className="flex items-center gap-2 text-gold-400 text-sm font-medium uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Tabaski 2026
        </div>
        <h1 className="font-display text-3xl font-bold mt-2">{t("tabaskiTitle")}</h1>
        <p className="mt-2 text-cream-100/90 max-w-2xl">
          Pic de demande prévu × 3.2 sur la fenêtre 10h–14h le jour J. Voici votre plan d'action préparé par l'IA YONNE.
        </p>
        <div className="mt-5">
          <J7Countdown />
        </div>
      </header>

      <DemandCurve />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Plan d'action IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionPlan.map(item => <ActionPlanCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="bg-cream-100 rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Historique · Tabaski 2025</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tabaski2025Stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-display font-bold text-emerald-500 tabular-nums">{s.value}</div>
              <div className="text-sm text-ink-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Button type="button" size="lg" className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold text-base shadow-glow" onClick={() => toast.success("Plan d'action Tabaski activé — notifications envoyées aux livreurs et commerçants")}>
        Activer le plan d'action complet
      </Button>
    </div>
  );
}
