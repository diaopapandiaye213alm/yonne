"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Store, QrCode, Package, MapPin, CreditCard, ChevronRight, ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useSession } from "@/lib/hooks/useSession";
import { landmarks } from "@/lib/mock-data/landmarks";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Votre boutique",         icon: Store,    desc: "Nom, zone, type de commerce" },
  { id: 2, title: "QR Code boutique",       icon: QrCode,   desc: "Code imprimable pour vos clients" },
  { id: 3, title: "Première commande",      icon: Package,  desc: "Tester le workflow en 3 étapes" },
  { id: 4, title: "Points de repère",       icon: MapPin,   desc: "Choisissez vos zones habituelles" },
  { id: 5, title: "Modes de paiement",      icon: CreditCard, desc: "Wave, Orange Money, Cash" },
];

const COMMERCE_TYPES = ["Alimentation", "Mode & textile", "Électronique", "Cosmétiques", "Pharmacie", "Restauration", "Artisanat", "Services", "Autre"];
const ZONES = ["Plateau", "Médina", "Liberté", "Sacré-Cœur", "Mermoz", "Almadies", "HLM", "Patte d'Oie", "Ouakam", "Parcelles Assainies"];
const PAYMENT_OPTIONS = [
  { id: "wave",   label: "Wave",         logo: "🌊", desc: "Paiement instantané · Sénégal #1" },
  { id: "orange", label: "Orange Money", logo: "🟠", desc: "Réseau Orange · 12M utilisateurs" },
  { id: "cash",   label: "Cash",         logo: "💵", desc: "Paiement à la livraison" },
];

const LANDMARK_ICONS: Record<string, string> = {
  transport: "🚉", commerce: "🛒", culte: "🕌", santé: "🏥", loisir: "🌳", éducation: "🎓",
};

export default function OnboardingPage() {
  const router  = useRouter();
  const session = useSession();
  const { merchants } = useMerchantsStore();

  const merchant = merchants.find(m =>
    session?.role === "merchant" && m.name === session.displayName
  ) ?? merchants[0];

  const [step, setStep]                       = useState(1);
  const [shopName, setShopName]               = useState(merchant?.name ?? "");
  const [zone, setZone]                       = useState("");
  const [commerceType, setCommerceType]       = useState("");
  const [selectedLandmarks, setSelectedLandmarks] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments]   = useState<string[]>(["wave", "cash"]);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  function toggleLandmark(id: string) {
    setSelectedLandmarks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 5)
    );
  }

  function togglePayment(id: string) {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function finish() {
    toast.success("Configuration terminée ! Bienvenue sur YONNE 🎉");
    router.push("/merchant");
  }

  const qrData = `https://yonne-sigma.vercel.app/merchant/nouvelle-commande?ref=${merchant?.id ?? "demo"}`;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-cream-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest mb-0.5">Configuration initiale</p>
              <h1 className="text-xl font-display font-bold text-ink-900">Bienvenue sur YONNE !</h1>
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
            >
              Passer →
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`text-[10px] font-medium transition-colors ${
                  s.id === step ? "text-emerald-600" :
                  s.id < step  ? "text-emerald-400" : "text-ink-300"
                }`}
              >
                {s.id < step ? "✓" : s.id}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-fade-in-up">

          {/* Step 1 — Infos boutique */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-cream-200 shadow-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink-900">Votre boutique</h2>
                  <p className="text-xs text-ink-500">Ces informations apparaissent sur vos bons de livraison</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de votre boutique</Label>
                  <Input
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="Boutique Plateau, Chez Aminata…"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zone principale de livraison</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ZONES.map(z => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZone(z)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${
                          zone === z
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-cream-50 text-ink-600 border-cream-200 hover:border-emerald-300"
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type de commerce</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMMERCE_TYPES.map(ct => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setCommerceType(ct)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${
                          commerceType === ct
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-cream-50 text-ink-600 border-cream-200 hover:border-emerald-300"
                        }`}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — QR Code */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-cream-200 shadow-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink-900">QR Code boutique</h2>
                  <p className="text-xs text-ink-500">Imprimez-le et collez-le sur votre caisse</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                {/* QR code visuel SVG inline */}
                <div className="w-48 h-48 bg-white border-2 border-emerald-500 rounded-xl p-3 flex items-center justify-center relative">
                  <div className="absolute inset-3 grid grid-cols-7 grid-rows-7 gap-0.5">
                    {/* Simulation QR simplifié */}
                    {Array.from({ length: 49 }).map((_, i) => {
                      const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48];
                      const fill = corners.includes(i) || Math.random() > 0.5;
                      return (
                        <div
                          key={i}
                          className={`rounded-[1px] ${fill ? "bg-ink-900" : "bg-transparent"}`}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                      <Store className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-ink-900">{shopName || "Votre boutique"}</p>
                  <p className="text-xs text-ink-400 mt-1 font-mono break-all max-w-xs">{qrData}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-sm"
                  >
                    Imprimer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(qrData);
                      toast.success("Lien copié !");
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  >
                    Copier le lien
                  </Button>
                </div>

                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 max-w-sm">
                  <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Vos clients scannent ce QR depuis votre boutique pour suivre leur livraison ou passer commande directement.</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Première commande demo */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-cream-200 shadow-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink-900">Créer votre première commande</h2>
                  <p className="text-xs text-ink-500">Le workflow complet en 3 étapes</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { num: "01", title: "Client + adresse", desc: "Nom, téléphone, point de repère Dakar. Pas de code postal nécessaire.", done: true },
                  { num: "02", title: "Montant + paiement", desc: "Entrez le montant et choisissez Wave, Orange Money ou Cash. +200 F assurance optionnel.", done: true },
                  { num: "03", title: "Dispatch IA", desc: "L'algorithme Haversine choisit le meilleur livreur disponible en 3s.", done: false },
                ].map(item => (
                  <div
                    key={item.num}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                      item.done ? "bg-emerald-50/50 border-emerald-200" : "bg-cream-50 border-cream-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      item.done ? "bg-emerald-500 text-white" : "bg-cream-200 text-ink-500"
                    }`}>
                      {item.done ? "✓" : item.num}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => router.push("/merchant/nouvelle-commande")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Créer ma première commande →
              </Button>
              <p className="text-center text-xs text-ink-400">Vous pouvez aussi le faire plus tard</p>
            </div>
          )}

          {/* Step 4 — Landmarks */}
          {step === 4 && (
            <div className="bg-white rounded-xl border border-cream-200 shadow-card p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink-900">Points de repère favoris</h2>
                  <p className="text-xs text-ink-500">Choisissez jusqu&apos;à 5 repères fréquents pour vos livraisons</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {landmarks.slice(0, 20).map(lm => {
                  const selected = selectedLandmarks.includes(lm.id);
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      onClick={() => toggleLandmark(lm.id)}
                      disabled={!selected && selectedLandmarks.length >= 5}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all disabled:opacity-40 ${
                        selected
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                          : "bg-cream-50 border-cream-200 hover:border-emerald-300 text-ink-700"
                      }`}
                    >
                      <span className="text-lg shrink-0">{LANDMARK_ICONS[lm.type] ?? "📍"}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{lm.name}</div>
                        <div className="text-[10px] text-ink-400">{lm.quartier}</div>
                      </div>
                      {selected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-400">{selectedLandmarks.length}/5 sélectionnés</p>
            </div>
          )}

          {/* Step 5 — Paiements */}
          {step === 5 && (
            <div className="bg-white rounded-xl border border-cream-200 shadow-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink-900">Modes de paiement</h2>
                  <p className="text-xs text-ink-500">Activez les méthodes acceptées par votre boutique</p>
                </div>
              </div>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(opt => {
                  const active = selectedPayments.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => togglePayment(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        active
                          ? "bg-emerald-50 border-emerald-400"
                          : "bg-cream-50 border-cream-200 hover:border-emerald-300"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{opt.logo}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-ink-900">{opt.label}</div>
                        <div className="text-xs text-ink-500">{opt.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-emerald-500 border-emerald-500" : "border-cream-300"
                      }`}>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-emerald-800">Récapitulatif de votre configuration</p>
                <div className="text-xs text-emerald-700 space-y-1">
                  <div>🏪 {shopName || "—"} {zone ? `· ${zone}` : ""} {commerceType ? `· ${commerceType}` : ""}</div>
                  <div>📍 {selectedLandmarks.length} repère(s) favori(s)</div>
                  <div>💳 {selectedPayments.map(p => PAYMENT_OPTIONS.find(o => o.id === p)?.label).join(", ")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length ? (
              <Button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finish}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                Terminer la configuration ✓
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Step indicators bottom */}
      <div className="flex justify-center gap-2 pb-6">
        {STEPS.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`transition-all rounded-full ${
              s.id === step ? "w-6 h-2 bg-emerald-500" :
              s.id < step   ? "w-2 h-2 bg-emerald-300" :
                              "w-2 h-2 bg-cream-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
