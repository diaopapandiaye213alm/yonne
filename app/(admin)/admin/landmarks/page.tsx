"use client";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Search } from "lucide-react";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useT } from "@/lib/i18n";
import type { LandmarkType } from "@/lib/mock-data/landmarks";

const TYPE_ICONS: Record<LandmarkType, string> = {
  transport: "⛽", commerce: "🏪", culte: "🕌", santé: "🏥", loisir: "🌳", éducation: "🏫",
};

const QUARTIERS = ["Plateau", "Médina", "Grand Yoff", "Parcelles Assainies", "Ouakam", "Almadies", "Mermoz", "Liberté 6", "Sacré-Cœur", "Fann"];
const ICONS_LIST: string[] = ["🏪", "🏥", "🕌", "🏫", "🏦", "🌳", "🏟️", "⛽", "🛒", "🏨"];

type Extra = { id: string; name: string; quartier: string; icon: string; type: LandmarkType };

export default function LandmarksPage() {
  const t = useT();
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: "", quartier: "Plateau", icon: "🏪" });
  const [extras, setExtras]   = useState<Extra[]>([]);

  const all = [
    ...landmarks.map(l => ({ id: l.id, name: l.name, quartier: l.quartier, icon: TYPE_ICONS[l.type], type: l.type })),
    ...extras,
  ].filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.quartier.toLowerCase().includes(search.toLowerCase())
  );

  function add() {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    setExtras(prev => [...prev, { ...form, id: `LM-${Date.now()}`, type: "commerce" }]);
    setForm({ name: "", quartier: "Plateau", icon: "🏪" });
    setShowForm(false);
    toast.success(`Repère "${form.name}" ajouté`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("landmarksTitle")}</h1>
          <p className="text-sm text-ink-500 mt-1">{all.length} repères · Autocomplétion activée</p>
        </div>
        <button type="button" onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-colors shadow-glow-emerald">
          <Plus className="w-4 h-4" /> Ajouter un repère
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900">Nouveau repère</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-ink-500 font-medium mb-2">Icône</p>
              <div className="flex flex-wrap gap-2">
                {ICONS_LIST.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`text-xl p-1.5 rounded-lg transition-colors ${form.icon === ic ? "bg-emerald-100 ring-2 ring-emerald-500" : "hover:bg-cream-100"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-3">
              <div>
                <label className="text-xs text-ink-500 font-medium mb-1 block">Nom</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="ex: Marché Tilène"
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-ink-500 font-medium mb-1 block">Quartier</label>
                <select value={form.quartier} onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {QUARTIERS.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <button type="button" onClick={add}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou quartier…"
          className="w-full pl-9 pr-4 py-2.5 border border-cream-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {all.map(l => (
          <div key={l.id} className="bg-white rounded-lg border border-cream-200 shadow-card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all hover:shadow-lg">
            <div className="text-2xl w-10 text-center">{l.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink-900 truncate">{l.name}</div>
              <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{l.quartier}
              </div>
            </div>
            <span className="font-mono text-xs text-ink-300 shrink-0">{l.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
