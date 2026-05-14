"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Gift, Users, TrendingUp, Share2, Copy } from "lucide-react";
import { useT } from "@/lib/i18n";

type Referral = { id: string; name: string; code: string; referred: number; earned: string; status: "actif" | "inactif" };

const REFERRALS_INIT: Referral[] = [
  { id: "R-001", name: "Khady Diallo",  code: "KHADY23", referred: 8,  earned: "16 000 F", status: "actif" },
  { id: "R-002", name: "Moussa Sarr",   code: "MOUSSA7", referred: 5,  earned: "10 000 F", status: "actif" },
  { id: "R-003", name: "Fatou Ndiaye",  code: "FATOU99", referred: 12, earned: "24 000 F", status: "actif" },
  { id: "R-004", name: "Ibou Diallo",   code: "IBOU42",  referred: 2,  earned: "4 000 F",  status: "inactif" },
  { id: "R-005", name: "Seydou Mbaye",  code: "SEYDOU1", referred: 7,  earned: "14 000 F", status: "actif" },
];

export default function ParrainagePage() {
  const t = useT();
  const [bonus, setBonus] = useState(2000);
  const [referrals] = useState<Referral[]>(REFERRALS_INIT);

  function copyCode(code: string) {
    navigator.clipboard.writeText(`yonne.sn/ref/${code}`).catch(() => {});
    toast.success(`Lien de parrainage copié : yonne.sn/ref/${code}`);
  }

  function broadcast() {
    const active = referrals.filter(r => r.status === "actif").length;
    toast.success(`Campagne parrainage envoyée à ${active} livreurs actifs via WhatsApp`);
  }

  const totalReferred = referrals.reduce((s, r) => s + r.referred, 0);
  const totalEarned   = referrals.reduce((s, r) => s + r.referred * bonus, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("parrainageTitle")}</h1>
          <p className="text-sm text-ink-500 mt-1">Livreurs qui recrutent d'autres livreurs</p>
        </div>
        <button type="button" onClick={broadcast}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-colors shadow-glow-emerald">
          <Share2 className="w-4 h-4" /> Lancer campagne
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Parrains actifs",       value: String(referrals.filter(r => r.status === "actif").length), icon: Users,      color: "text-emerald-600" },
          { label: "Filleuls recrutés",      value: String(totalReferred),                                     icon: Gift,       color: "text-gold-500" },
          { label: "Primes versées (total)", value: `${totalEarned.toLocaleString("fr-FR")} F`,                icon: TrendingUp, color: "text-ink-700" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Configuration prime</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-ink-700 font-medium whitespace-nowrap">Prime par filleul</label>
          <input type="range" min={500} max={5000} step={500} value={bonus}
            onChange={e => setBonus(Number(e.target.value))}
            className="flex-1 accent-emerald-500" />
          <span className="text-sm font-bold text-emerald-600 w-24 text-right">{bonus.toLocaleString("fr-FR")} F</span>
        </div>
        <p className="text-xs text-ink-400 mt-2">Prime versée au parrain après 5 livraisons du filleul · Paiement Wave / Orange Money</p>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900 text-sm">Top parrains</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {referrals.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 text-sm">{r.name}</div>
                <div className="text-xs text-ink-400 mt-0.5">{r.referred} filleul{r.referred > 1 ? "s" : ""} · {r.earned} gagnés</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "actif" ? "bg-emerald-50 text-emerald-600" : "bg-cream-100 text-ink-400"}`}>
                {r.status}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-400 bg-cream-50 px-2 py-1 rounded">{r.code}</span>
                <button type="button" onClick={() => copyCode(r.code)}
                  className="p-1.5 hover:bg-cream-100 rounded-lg transition-colors text-ink-400 hover:text-ink-700">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
