"use client";
import { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, MessageSquare, Clock } from "lucide-react";

type Msg = { from: "user" | "bot"; text: string; time: string };

const RESPONSES: Record<string, string> = {
  "1":        "📦 Créons votre commande. Entrez le nom du client et l'adresse de livraison.",
  "commander":"📦 Créons votre commande. Entrez le nom et l'adresse.",
  "statut":   "🔍 Entrez votre référence (ex: YN-2026-XXXXX) pour voir le statut.",
  "annuler":  "❌ Pour annuler : envoyez *annuler YN-2026-XXXXX*. La commande doit ne pas encore être collectée.",
  "agent":    "👤 Je vous transfère vers un agent YONNE. Temps d'attente estimé : 3 min.",
};

const INITIAL: Msg[] = [
  { from: "bot", text: "Bonsul à YONNE Bot ! 🛵\n\nTapez :\n• *1* ou *commander* — nouvelle commande\n• *statut* — suivre votre colis\n• *annuler* — annuler une commande\n• *agent* — parler à un humain", time: "14:30" },
];

function getResponse(msg: string): string {
  const lower = msg.toLowerCase().trim();
  for (const [key, resp] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return resp;
  }
  return "🤖 Je n'ai pas compris. Tapez *1* pour commander, *statut*, *annuler*, ou *agent*.";
}

function now() { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }

export default function BotPage() {
  const [msgs, setMsgs]   = useState<Msg[]>(INITIAL);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { from: "user", text: input, time: now() };
    const botMsg: Msg  = { from: "bot",  text: getResponse(input), time: now() };
    setMsgs(prev => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">Bot WhatsApp</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Commandes via bot",   value: "23",   icon: MessageSquare, color: "text-emerald-600" },
          { label: "Taux de conversion",  value: "67%",  icon: TrendingUp,    color: "text-gold-500" },
          { label: "Temps réponse moyen", value: "1.2s", icon: Clock,         color: "text-ink-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* WhatsApp simulator */}
        <div className="lg:col-span-3 bg-[#E5DDD5] rounded-xl overflow-hidden border border-cream-200 shadow-card">
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold">Y</div>
            <div>
              <div className="text-white font-semibold text-sm">YONNE Bot</div>
              <div className="text-emerald-200 text-xs">En ligne</div>
            </div>
          </div>
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${m.from === "user" ? "bg-[#DCF8C6] rounded-tr-none" : "bg-white rounded-tl-none"}`}>
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

        {/* Commands */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <h3 className="font-semibold text-ink-900 mb-3 text-sm">Commandes reconnues</h3>
            <div className="space-y-2">
              {[
                { cmd: "1 / commander", desc: "Créer une commande",  color: "bg-emerald-100 text-emerald-700" },
                { cmd: "statut",        desc: "Suivre un colis",     color: "bg-blue-100 text-blue-700" },
                { cmd: "annuler",       desc: "Annuler la commande", color: "bg-amber-100 text-amber-700" },
                { cmd: "agent",         desc: "Support humain",      color: "bg-ink-100 text-ink-700" },
              ].map(({ cmd, desc, color }) => (
                <div key={cmd} className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${color}`}>{cmd}</span>
                  <span className="text-xs text-ink-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <h3 className="font-semibold text-ink-900 mb-2 text-sm">NLP supporté</h3>
            <p className="text-xs text-ink-500 leading-relaxed">Détection en français et wolof. Extraction automatique : nom client, adresse, montant, mode paiement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
