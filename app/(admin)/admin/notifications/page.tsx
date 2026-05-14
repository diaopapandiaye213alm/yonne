"use client";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, CheckCircle2, XCircle, ToggleLeft, ToggleRight, Send, Plus, Users, Bike, Store, X } from "lucide-react";
import { useT } from "@/lib/i18n";

const TEMPLATES = [
  {
    id: "assigned",
    label: "✅ Livreur assigné",
    preview: "Votre commande {ref} a été assignée à {driver}. Suivi en direct : dernierkm.sn/track/{ref}",
    sent: 42, cost: 210, color: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "pickup",
    label: "📦 En collecte",
    preview: "{driver} est en route pour collecter votre colis chez {merchant}. ETA ~{eta} min.",
    sent: 38, cost: 190, color: "bg-blue-50 border-blue-200",
  },
  {
    id: "enroute",
    label: "🛵 En route",
    preview: "Votre colis est en route ! Livreur : {driver}. Suivre : dernierkm.sn/track/{ref}",
    sent: 35, cost: 175, color: "bg-gold-500/10 border-gold-500/30",
  },
  {
    id: "delivered",
    label: "🎉 Livré",
    preview: "Commande {ref} livrée avec succès ! Merci de noter votre livreur ⭐ sur YONNE.",
    sent: 31, cost: 155, color: "bg-emerald-500/10 border-emerald-500/30",
  },
];

const LOGS = [
  { id: "L001", time: "14:32", ref: "YN-2026-10124", template: "✅ Assigné",    recipient: "+221 77 123 4567", status: "envoyé",  cost: 5 },
  { id: "L002", time: "14:28", ref: "YN-2026-10120", template: "🛵 En route",   recipient: "+221 76 234 5678", status: "envoyé",  cost: 5 },
  { id: "L003", time: "14:15", ref: "YN-2026-10115", template: "🎉 Livré",      recipient: "+221 70 345 6789", status: "envoyé",  cost: 5 },
  { id: "L004", time: "14:10", ref: "YN-2026-10110", template: "📦 Collecte",   recipient: "+221 78 456 7890", status: "échec",   cost: 0 },
  { id: "L005", time: "13:58", ref: "YN-2026-10108", template: "✅ Assigné",    recipient: "+221 77 567 8901", status: "envoyé",  cost: 5 },
  { id: "L006", time: "13:45", ref: "YN-2026-10102", template: "🎉 Livré",      recipient: "+221 76 678 9012", status: "envoyé",  cost: 5 },
];

type Audience = "drivers" | "merchants" | "clients" | "all";
const AUDIENCE_OPTS: { value: Audience; label: string; icon: React.ElementType; count: number }[] = [
  { value: "drivers",   label: "Livreurs",    icon: Bike,   count: 12 },
  { value: "merchants", label: "Marchands",   icon: Store,  count: 8 },
  { value: "clients",   label: "Clients",     icon: Users,  count: 43 },
  { value: "all",       label: "Tous",        icon: Users,  count: 63 },
];

export default function NotificationsPage() {
  const t = useT();
  const [smsActive, setSmsActive] = useState(true);
  const [showCampaign, setShowCampaign] = useState(false);
  const [audience, setAudience] = useState<Audience>("drivers");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const totalSent = TEMPLATES.reduce((s, t) => s + t.sent, 0);
  const totalCost = TEMPLATES.reduce((s, t) => s + t.cost, 0);
  const selectedAudience = AUDIENCE_OPTS.find(a => a.value === audience)!;

  function sendCampaign() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Sujet et message requis");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success(`Campagne envoyée à ${selectedAudience.count} destinataires`);
      setShowCampaign(false);
      setSubject(""); setBody(""); setSending(false);
    }, 900);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("navNotifications")}</h1>
          <p className="text-sm text-ink-500 mt-1">WhatsApp Business · SMS Orange</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowCampaign(v => !v)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
            {showCampaign ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCampaign ? "Annuler" : "Nouvelle campagne"}
          </button>
          <div className="flex items-center gap-3 bg-white border border-cream-200 rounded-lg px-4 py-2.5 shadow-card">
            <span className="text-sm text-ink-700 font-medium">SMS Orange</span>
            <button
              type="button"
              onClick={() => {
                setSmsActive(v => !v);
                toast.success(smsActive ? "SMS Orange désactivé" : "SMS Orange activé");
              }}
            >
              {smsActive
                ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                : <ToggleLeft className="w-8 h-8 text-ink-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Campaign panel */}
      {showCampaign && (
        <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 space-y-4 animate-fade-in-up">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-500" /> Nouvelle campagne WhatsApp
          </h2>

          {/* Audience */}
          <div>
            <label className="text-xs text-ink-500 mb-2 block">Destinataires</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AUDIENCE_OPTS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.value} type="button" onClick={() => setAudience(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      audience === opt.value
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-cream-200 text-ink-600 hover:border-emerald-300"
                    }`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                    <span className="ml-auto text-xs opacity-60">{opt.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-ink-500 mb-1 block">Sujet / Objet</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Ex : Annonce Tabaski — prime livreur ×2"
              className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-ink-500 mb-1 block">Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Bonjour {nom}, …"
              rows={4}
              className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
          </div>

          {/* WhatsApp preview */}
          {body.trim() && (
            <div className="bg-[#E5DDD5] rounded-xl p-4">
              <div className="text-[10px] text-ink-400 mb-2 font-medium uppercase tracking-wider">Aperçu WhatsApp</div>
              <div className="bg-[#DCF8C6] rounded-lg rounded-tl-none px-3 py-2 max-w-xs text-xs text-ink-800 shadow-sm font-sans leading-relaxed whitespace-pre-wrap">
                {body}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-cream-100">
            <span className="text-xs text-ink-500">
              ~{selectedAudience.count * 5} F CFA estimé · {selectedAudience.count} destinataires
            </span>
            <button type="button" onClick={sendCampaign} disabled={sending}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <Send className="w-3.5 h-3.5" />
              {sending ? "Envoi…" : "Envoyer la campagne"}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Messages aujourd'hui", value: String(totalSent), icon: MessageSquare, color: "text-emerald-600" },
          { label: "Coût total", value: `${totalCost} F CFA`, icon: Send, color: "text-gold-500" },
          { label: "Taux d'envoi", value: "94%", icon: CheckCircle2, color: "text-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-display font-bold text-ink-900">{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div>
        <h2 className="font-display font-semibold text-ink-900 mb-3">Templates automatiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map(tmpl => (
            <div key={tmpl.id} className={`rounded-xl border p-4 ${tmpl.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-ink-900 text-sm">{tmpl.label}</span>
                <span className="text-xs text-ink-500">{tmpl.sent} envois · {tmpl.cost} F</span>
              </div>
              {/* WhatsApp bubble preview */}
              <div className="bg-[#DCF8C6] rounded-lg rounded-tl-none px-3 py-2 max-w-xs text-xs text-ink-800 shadow-sm font-sans leading-relaxed">
                {tmpl.preview}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-500">~5 F CFA / message</span>
                <button
                  type="button"
                  onClick={() => toast.success(`Template "${tmpl.label}" testé — aperçu envoyé`)}
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Tester
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-100">
          <h2 className="font-semibold text-ink-900">Logs d&apos;envoi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-cream-100">
              <tr>
                {["Heure", "Réf.", "Template", "Destinataire", "Statut", "Coût"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50">
              {LOGS.map(log => (
                <tr key={log.id} className="hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-ink-500 font-mono">{log.time}</td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-500">{log.ref}</td>
                  <td className="px-4 py-3 text-sm text-ink-700">{log.template}</td>
                  <td className="px-4 py-3 text-xs text-ink-500 font-mono">{log.recipient}</td>
                  <td className="px-4 py-3">
                    {log.status === "envoyé"
                      ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> envoyé</span>
                      : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3.5 h-3.5" /> échec</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-700">{log.cost > 0 ? `${log.cost} F` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
