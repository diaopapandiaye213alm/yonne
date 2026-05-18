"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings2, Percent, Save, TrendingUp, Truck,
  ShieldCheck, Smartphone, Gift, BadgeDollarSign, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommissionConfig {
  platform_fee_percent: number;
  fixed_fee: number;
  driver_share_percent: number;
  insurance_percent: number;
  insurance_min: number;
  surge_base: number;
  surge_peak: number;
  surge_tabaski: number;
  paytech_fee_percent: number;
  referral_bonus: number;
  advance_fee_percent: number;
}

const DEFAULTS: CommissionConfig = {
  platform_fee_percent: 15,
  fixed_fee: 100,
  driver_share_percent: 80,
  insurance_percent: 0.5,
  insurance_min: 200,
  surge_base: 1.0,
  surge_peak: 1.4,
  surge_tabaski: 2.0,
  paytech_fee_percent: 2.5,
  referral_bonus: 5000,
  advance_fee_percent: 2,
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-cream-100 bg-cream-50">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="font-display font-semibold text-ink-900 text-sm">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function FieldInput({
  label, hint, value, onChange, step = 1, min = 0, max,
}: {
  label: string; hint?: string; value: number;
  onChange: (v: number) => void; step?: number; min?: number; max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ink-700">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full h-10 rounded-lg border border-cream-200 px-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 tabular-nums"
      />
      {hint && <p className="text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}

function SimRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2.5 px-4 rounded-lg text-sm", highlight ? "bg-emerald-500/5 font-semibold" : "")}>
      <span className={highlight ? "text-emerald-700" : "text-ink-600"}>{label}</span>
      <span className={cn("font-mono tabular-nums", highlight ? "text-emerald-600" : "text-ink-900")}>
        {value.toLocaleString("fr-FR")} F
      </span>
    </div>
  );
}

export default function CommissionsPage() {
  const [config, setConfig] = useState<CommissionConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simAmount, setSimAmount] = useState(25000);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.ok ? r.json() : null)
      .then((data: { settings?: CommissionConfig } | null) => {
        if (data?.settings) setConfig({ ...DEFAULTS, ...data.settings });
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof CommissionConfig>(key: K, value: CommissionConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      toast.success("Commissions enregistrées");
    } catch {
      toast.error("Impossible d'enregistrer");
    } finally {
      setSaving(false);
    }
  }

  // Simulator calculations
  const platformFee    = Math.round(simAmount * config.platform_fee_percent / 100 + config.fixed_fee);
  const driverShare    = Math.round(platformFee * config.driver_share_percent / 100);
  const yonneNet       = platformFee - driverShare;
  const paytechFee     = Math.round(platformFee * config.paytech_fee_percent / 100);
  const yonneAfterFees = yonneNet - paytechFee;
  const insuranceFee   = Math.max(config.insurance_min, Math.round(simAmount * config.insurance_percent / 100));

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-cream-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2.5">
            <Settings2 className="w-6 h-6 text-emerald-500" />
            Commissions & Tarification
          </h1>
          <p className="text-sm text-ink-500 mt-1">Paramètres financiers de la plateforme</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={save}
          disabled={saving}
          className="hidden sm:inline-flex"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </Button>
      </div>

      {/* Platform commission */}
      <SectionCard title="Commission plateforme" icon={Percent}>
        <FieldInput
          label="Pourcentage commission (%)"
          hint="Appliqué sur le montant de la commande"
          value={config.platform_fee_percent}
          onChange={v => set("platform_fee_percent", v)}
          step={0.5} min={0} max={50}
        />
        <FieldInput
          label="Frais fixe par commande (F CFA)"
          hint="S'ajoute au % commission"
          value={config.fixed_fee}
          onChange={v => set("fixed_fee", v)}
          step={50} min={0}
        />
      </SectionCard>

      {/* Driver share */}
      <SectionCard title="Rémunération livreur" icon={Truck}>
        <FieldInput
          label="% des frais reversés au livreur"
          hint="Le reste constitue la marge YONNE"
          value={config.driver_share_percent}
          onChange={v => set("driver_share_percent", v)}
          step={1} min={0} max={100}
        />
      </SectionCard>

      {/* Surge pricing */}
      <SectionCard title="Tarification dynamique (Surge)" icon={TrendingUp}>
        <FieldInput
          label="Multiplicateur normal"
          value={config.surge_base}
          onChange={v => set("surge_base", v)}
          step={0.1} min={1} max={5}
        />
        <FieldInput
          label="Multiplicateur heures de pointe"
          hint="Matin 7h-9h / Soir 17h-20h"
          value={config.surge_peak}
          onChange={v => set("surge_peak", v)}
          step={0.1} min={1} max={5}
        />
        <FieldInput
          label="Multiplicateur fêtes (Tabaski / Korité)"
          value={config.surge_tabaski}
          onChange={v => set("surge_tabaski", v)}
          step={0.1} min={1} max={10}
        />
      </SectionCard>

      {/* Insurance */}
      <SectionCard title="Assurance colis" icon={ShieldCheck}>
        <FieldInput
          label="% du montant de la commande"
          value={config.insurance_percent}
          onChange={v => set("insurance_percent", v)}
          step={0.1} min={0} max={10}
        />
        <FieldInput
          label="Minimum F CFA"
          value={config.insurance_min}
          onChange={v => set("insurance_min", v)}
          step={50} min={0}
        />
      </SectionCard>

      {/* PayTech */}
      <SectionCard title="Frais PayTech (agrégateur paiement)" icon={Smartphone}>
        <FieldInput
          label="Frais agrégateur (%)"
          hint="Déduits de la marge YONNE"
          value={config.paytech_fee_percent}
          onChange={v => set("paytech_fee_percent", v)}
          step={0.1} min={0} max={10}
        />
      </SectionCard>

      {/* Bonus & advances */}
      <SectionCard title="Bonus & avances livreur" icon={Gift}>
        <FieldInput
          label="Bonus parrainage livreur (F CFA)"
          hint="Versé au parrain à la 1ère livraison"
          value={config.referral_bonus}
          onChange={v => set("referral_bonus", v)}
          step={500} min={0}
        />
        <FieldInput
          label="Frais avance sur salaire (%)"
          hint="Prélevé sur le montant de l'avance"
          value={config.advance_fee_percent}
          onChange={v => set("advance_fee_percent", v)}
          step={0.5} min={0} max={20}
        />
      </SectionCard>

      {/* Simulator */}
      <div className="bg-white rounded-xl border border-cream-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-cream-100 bg-cream-50">
          <div className="w-7 h-7 rounded-lg bg-gold-500/10 flex items-center justify-center">
            <BadgeDollarSign className="w-4 h-4 text-gold-600" />
          </div>
          <h2 className="font-display font-semibold text-ink-900 text-sm">Simulateur de commande</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-700">Montant de la commande (F CFA)</label>
            <input
              type="number"
              value={simAmount}
              step={1000}
              min={0}
              onChange={e => setSimAmount(parseFloat(e.target.value) || 0)}
              className="w-full h-10 rounded-lg border border-cream-200 px-3 text-sm font-mono focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
            />
          </div>
          <div className="rounded-xl border border-cream-100 divide-y divide-cream-100 overflow-hidden">
            <SimRow label="Commission totale prélevée" value={platformFee} />
            <SimRow label="Part livreur" value={driverShare} />
            <SimRow label="Marge brute YONNE" value={yonneNet} />
            <SimRow label={`Frais PayTech (${config.paytech_fee_percent}%)`} value={-paytechFee} />
            <SimRow label="Marge nette YONNE" value={yonneAfterFees} highlight />
            <SimRow label="Assurance colis (optionnelle)" value={insuranceFee} />
          </div>
          <p className="text-xs text-ink-400">
            Taux effectif : {((platformFee / simAmount) * 100).toFixed(1)}% du montant
          </p>
        </div>
      </div>

      {/* Mobile save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-cream-200 sm:hidden z-40">
        <Button variant="primary" size="lg" onClick={save} disabled={saving} className="w-full">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les commissions
        </Button>
      </div>
    </div>
  );
}
