"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, TrendingUp, MessageSquare, Clock, Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Check, X } from "lucide-react";

type Msg      = { from: "user" | "bot"; text: string; time: string };
type Scenario = { id: string; keyword: string; response: string; active: boolean; hits: number };

const INIT_SCENARIOS: Scenario[] = [
  { id: "s1", keyword: "1, commander",    response: "📦 Créons votre commande. Entrez le nom du client et l'adresse de livraison.",              active: true, hits: 58 },
  { id: "s2", keyword: "statut",          response: "🔍 Entrez votre référence (ex: YN-2026-XXXXX) pour voir le statut de votre livraison.",    active: true, hits: 41 },
  { id: "s3", keyword: "annuler",         response: "❌ Pour annuler : envoyez *annuler YN-2026-XXXXX*. La commande ne doit pas encore être collectée.", active: true, hits: 12 },
  { id: "s4", keyword: "agent",           response: "👤 Je vous transfère vers un agent YONNE. Temps d'attente estimé : 3 min.",                active: true, hits: 19 },
  { id: "s5", keyword: "horaires, heures",response: "⏰ YONNE livre 7j/7 de 8h à 22h. Pendant Tabaski : 7h–23h.",                              active: true, hits: 7 },
  { id: "s6", keyword: "prix, tarif",     response: "💰 Frais de livraison à partir de 1 000 F CFA selon la zone. Demandez un devis : *devis*.", active: false, hits: 3 },
];

const INITIAL: Msg[] = [
  { from: "bot", text: "Bienvenu à YONNE Bot ! 🛵\n\nTapez :\n• *1* ou *commander* — nouvelle commande\n• *statut* — suivre votre colis\n• *annuler* — annuler une commande\n• *agent* — parler à un humain\n• *horaires* — nos horaires", time: "14:30" },
];

function now() { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }

export default function BotPage() {
  const [tab,       setTab]       = useState<"simulator" | "scenarios">("simulator");
  const [msgs,      setMsgs]      = useState<Msg[]>(INITIAL);
  const [input,     setInput]     = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>(INIT_SCENARIOS);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editKw,    setEditKw]    = useState("");
  const [editResp,  setEditResp]  = useState("");
  const [newKw,     setNewKw]     = useState("");
  const [newResp,   setNewResp]   = useState("");
  const [showAdd,   setShowAdd]   = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  function getResponse(msg: string): string {
    const lower = msg.toLowerCase().trim();
    for (const s of scenarios.filter(s => s.active)) {
      const keywords = s.keyword.split(",").map(k => k.trim().toLowerCase());
      if (keywords.some(k => lower.includes(k))) return s.response;
    }
    return "🤖 Je n'ai pas compris. Tapez *1* pour commander, *statut*, *annuler*, ou *agent*.";
  }

  function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { from: "user", text: input, time: now() };
    const botMsg:  Msg = { from: "bot",  text: getResponse(input), time: now() };
    setMsgs(prev => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function toggleScenario(id: string) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }

  function startEdit(s: Scenario) {
    setEditId(s.id); setEditKw(s.keyword); setEditResp(s.response);
  }

  function saveEdit(id: string) {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, keyword: editKw, response: editResp } : s));
    setEditId(null);
    toast.success("Scénario mis à jour");
  }

  function deleteScenario(id: string) {
    setScenarios(prev => prev.filter(s => s.id !== id));
    toast.success("Scénario supprimé");
  }

  function addScenario() {
    if (!newKw.trim() || !newResp.trim()) return;
    setScenarios(prev => [...prev, {
      id: `s${Date.now()}`, keyword: newKw.trim(), response: newResp.trim(), active: true, hits: 0,
    }]);
    setNewKw(""); setNewResp(""); setShowAdd(false);
    toast.success("Scénario ajouté");
  }

  const activeCount = scenarios.filter(s => s.active).length;
  const totalHits   = scenarios.reduce((s, sc) => s + sc.hits, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">Bot WhatsApp</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Commandes via bot",    value: "23",           icon: MessageSquare, color: "text-emerald-600" },
          { label: "Taux de conversion",   value: "67%",          icon: TrendingUp,    color: "text-gold-500" },
          { label: "Temps réponse moyen",  value: "1.2s",         icon: Clock,         color: "text-ink-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 p-1 rounded-lg w-fit">
        {([["simulator", "Simulateur"], ["scenarios", `Scénarios (${activeCount})`]] as const).map(([v, label]) => (
          <button key={v} type="button" onClick={() => setTab(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === v ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* WhatsApp simulator */}
          <div className="lg:col-span-3 bg-[#E5DDD5] rounded-xl overflow-hidden border border-cream-200 shadow-card">
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold">Y</div>
              <div>
                <div className="text-white font-semibold text-sm">YONNE Bot</div>
                <div className="text-emerald-200 text-xs">En ligne · {activeCount} scénarios actifs</div>
              </div>
            </div>
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                    m.from === "user" ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"
                  }`}>
                    <p className="text-sm text-ink-900 whitespace-pre-line">{m.text}</p>
                    <p className="text-[10px] text-ink-400 text-right mt-1">{m.time}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="bg-[#F0F0F0] p-3 flex items-center gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Tapez un message…"
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm focus:outline-none" />
              <button type="button" onClick={send}
                className="w-9 h-9 bg-[#075E54] hover:bg-[#128C7E] rounded-full flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
              <h3 className="font-semibold text-ink-900 mb-3 text-sm">Commandes actives</h3>
              <div className="space-y-2">
                {scenarios.filter(s => s.active).map(s => (
                  <div key={s.id} className="flex items-start gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-emerald-100 text-emerald-700 shrink-0">
                      {s.keyword.split(",")[0].trim()}
                    </span>
                    <span className="text-xs text-ink-500 leading-tight">{s.response.slice(0, 50)}…</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
              <h3 className="font-semibold text-ink-900 mb-2 text-sm">NLP supporté</h3>
              <p className="text-xs text-ink-500 leading-relaxed">Détection en français et wolof. Mots-clés séparés par virgule. {totalHits} interactions totales.</p>
            </div>
          </div>
        </div>
      )}

      {tab === "scenarios" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">{scenarios.length} scénarios · {activeCount} actifs</p>
            <button type="button" onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors">
              {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAdd ? "Annuler" : "Nouveau scénario"}
            </button>
          </div>

          {showAdd && (
            <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-4 space-y-3 animate-fade-in-up">
              <h3 className="font-semibold text-ink-900 text-sm">Nouveau scénario</h3>
              <div>
                <label className="text-xs text-ink-500 mb-1 block">Mots-clés (séparés par virgule)</label>
                <input value={newKw} onChange={e => setNewKw(e.target.value)}
                  placeholder="prix, tarif, combien"
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs text-ink-500 mb-1 block">Réponse du bot</label>
                <textarea value={newResp} onChange={e => setNewResp(e.target.value)}
                  placeholder="💰 Réponse automatique…"
                  rows={3}
                  className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
              </div>
              <button type="button" onClick={addScenario}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                Créer
              </button>
            </div>
          )}

          {scenarios.map(s => {
            const isEditing = editId === s.id;
            return (
              <div key={s.id} className={`bg-white rounded-lg border shadow-card p-4 ${s.active ? "border-cream-200" : "border-cream-100 opacity-60"}`}>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-ink-500 mb-1 block">Mots-clés</label>
                      <input value={editKw} onChange={e => setEditKw(e.target.value)}
                        className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs text-ink-500 mb-1 block">Réponse</label>
                      <textarea value={editResp} onChange={e => setEditResp(e.target.value)}
                        rows={3}
                        className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveEdit(s.id)}
                        className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditId(null)}
                        className="text-xs border border-cream-200 text-ink-500 px-3 py-1.5 rounded-lg hover:bg-cream-100 transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {s.keyword.split(",").map(k => (
                          <span key={k.trim()} className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-emerald-100 text-emerald-700">
                            {k.trim()}
                          </span>
                        ))}
                        <span className="text-xs text-ink-400">{s.hits} déclenchements</span>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed">{s.response}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => startEdit(s)}
                        className="p-1.5 hover:bg-cream-100 rounded-lg text-ink-400 hover:text-ink-700 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => toggleScenario(s.id)}>
                        {s.active
                          ? <ToggleRight className="w-7 h-7 text-emerald-500" />
                          : <ToggleLeft className="w-7 h-7 text-ink-300" />}
                      </button>
                      <button type="button" onClick={() => deleteScenario(s.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-ink-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
