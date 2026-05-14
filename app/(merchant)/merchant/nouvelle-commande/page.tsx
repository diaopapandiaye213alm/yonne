"use client";
import { useWizard } from "@/lib/store/wizard";
import { useT } from "@/lib/i18n";
import { Stepper } from "@/components/wizard/Stepper";
import { ClientStep } from "@/components/wizard/ClientStep";
import { PaymentStep } from "@/components/wizard/PaymentStep";
import { DispatchStep } from "@/components/wizard/DispatchStep";

export default function NouvelleCommandePage() {
  const t        = useT();
  const { step } = useWizard();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{t("navNewOrder")}</h1>
        <p className="text-sm text-ink-500 mt-1">{t("wizardSubtitle")}</p>
      </div>
      <Stepper step={step} />
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6">
        {step === 1 && <ClientStep />}
        {step === 2 && <PaymentStep />}
        {step === 3 && <DispatchStep />}
      </div>
    </div>
  );
}
