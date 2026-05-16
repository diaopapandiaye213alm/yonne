"use client";
import { useEffect, useRef } from "react";
import { useWizard } from "@/lib/store/wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PaymentMethod } from "@/lib/mock-data/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { cn } from "@/lib/utils";
import { Banknote, TrendingUp } from "lucide-react";

const methods: { id: PaymentMethod; label: string; sub: string; bg: string }[] = [
  { id: "wave",   label: "Wave Sénégal",        sub: "Paiement instantané",  bg: "from-blue-500 to-blue-700"   },
  { id: "orange", label: "Orange Money",        sub: "Réseau orange",        bg: "from-orange-500 to-orange-700" },
  { id: "cash",   label: "Cash à la livraison", sub: "Paiement à réception", bg: "from-ink-700 to-ink-900"     },
];

export function PaymentStep() {
  const w = useWizard();

  const surgeRef = useRef(false); // empêche les appels multiples si le composant re-render

  // ── Fetch surge au montage de l'étape ───────────────────────────────────────
  // On récupère le landmark sélectionné à l'étape 1 pour trouver la zone géographique.
  useEffect(() => {
    if (surgeRef.current) return;
    surgeRef.current = true;

    const lm = landmarks.find((l) => l.id === w.landmarkId);
    if (!lm) return; // pas de landmark → pas de surge (multiplier reste à 1.0)

    fetch(`/api/surge?lat=${lm.lat}&lng=${lm.lng}`)
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) return null;
        return res.json() as Promise<{ multiplier: number; zone_id: string | null }>;
      })
      .then((data) => {
        if (data && typeof data.multiplier === "number") {
          w.setSurge(data.multiplier, data.zone_id ?? null);
        }
      })
      .catch(() => {
        // fail-safe : surge reste à 1.0 si l'API est indisponible
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionnel : un seul fetch par montage d'étape

  const hasSurge   = w.surgeMultiplier > 1.0;
  const baseAmount = w.amount;
  const surgedAmt  = hasSurge ? Math.round(baseAmount * w.surgeMultiplier) : baseAmount;
  const commission = Math.round(surgedAmt * 0.15) + 100;
  const canNext    = baseAmount >= 500 && w.paymentMethod !== null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="amt">Montant FCFA</Label>
        <Input
          id="amt"
          type="number"
          min={500}
          value={w.amount || ""}
          onChange={e => w.set("amount", Number(e.target.value) || 0)}
          placeholder="12 500"
          className="text-2xl font-display font-bold text-ink-900 h-14"
        />

        {/* Indicateur de majoration surge */}
        {hasSurge && baseAmount >= 500 && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
            <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-amber-700">Forte demande — majoration ×{w.surgeMultiplier.toFixed(2)}</span>
              <span className="text-amber-600">
                {" "}&middot; Tarif ajusté : <span className="font-mono font-bold">{surgedAmt.toLocaleString("fr-FR")} F</span>
                {" "}(base {baseAmount.toLocaleString("fr-FR")} F)
              </span>
            </div>
          </div>
        )}

        {baseAmount >= 500 && (
          <div className="text-xs text-ink-500">
            Commission YONNE : {commission.toLocaleString("fr-FR")} F (15 % + 100 F
            {hasSurge ? " · appliquée sur tarif majoré" : ""})
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Méthode de paiement</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {methods.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => w.set("paymentMethod", m.id)}
              className={cn(
                "relative rounded-lg overflow-hidden text-left p-4 border-2 transition-all",
                w.paymentMethod === m.id
                  ? "border-emerald-500 shadow-glow-emerald"
                  : "border-cream-200 hover:border-cream-200",
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", m.bg)} />
              <div className="relative text-white">
                <Banknote className="w-5 h-5 mb-2 opacity-80" />
                <div className="font-display font-bold">{m.label}</div>
                <div className="text-xs opacity-80">{m.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream-100 rounded-md p-4 flex items-center justify-between">
        <div>
          <div className="font-medium text-ink-900">Assurance colis</div>
          <div className="text-xs text-ink-500">Couverture jusqu'à 50 000 F · +200 F</div>
        </div>
        <Switch checked={w.insurance} onCheckedChange={(v) => w.set("insurance", v)} />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={w.prev} className="text-ink-700">Retour</Button>
        <Button onClick={w.next} disabled={!canNext} className="bg-emerald-500 hover:bg-emerald-600">
          Suivant
        </Button>
      </div>
    </div>
  );
}
