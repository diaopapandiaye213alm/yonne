"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const INCIDENT_TYPES = [
  "Colis endommagé",
  "Colis perdu",
  "Livreur non présenté",
  "Mauvaise adresse",
  "Retard excessif (>2h)",
  "Autre",
];

type TicketStatus = "ouvert" | "en cours" | "résolu";

interface Ticket {
  id: string;
  date: string;
  type: string;
  orderId: string;
  status: TicketStatus;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TK-2026-001",
    date: "10/05/2026",
    type: "Colis endommagé",
    orderId: "YN-2026-18432",
    status: "résolu",
  },
  {
    id: "TK-2026-002",
    date: "08/05/2026",
    type: "Livreur non présenté",
    orderId: "YN-2026-17851",
    status: "en cours",
  },
  {
    id: "TK-2026-003",
    date: "03/05/2026",
    type: "Retard excessif (>2h)",
    orderId: "YN-2026-16990",
    status: "ouvert",
  },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string; icon: React.ElementType }> = {
  ouvert:    { label: "Ouvert",    className: "bg-red-100 text-red-700",     icon: AlertCircle },
  "en cours": { label: "En cours", className: "bg-amber-100 text-amber-700", icon: Clock },
  résolu:    { label: "Résolu",    className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export default function SinistrePage() {
  const [incidentType, setIncidentType] = useState("");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [askRefund, setAskRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incidentType || !description.trim()) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Signalement soumis avec succès. Notre équipe vous contactera sous 24h.");
      setIncidentType("");
      setOrderId("");
      setDescription("");
      setAskRefund(false);
      setSubmitting(false);
    }, 800);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Signaler un incident</h1>
          <p className="text-sm text-ink-500 mt-1">
            Déclarez un sinistre assurance ou un litige de livraison. Notre équipe traitera votre demande sous 24h.
          </p>
        </div>
      </div>

      {/* Declaration form */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6">
        <h2 className="font-semibold text-ink-900 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">1</span>
          Nouvelle déclaration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Incident type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-700" htmlFor="incident-type">
              Type d&apos;incident <span className="text-red-500">*</span>
            </label>
            <select
              id="incident-type"
              value={incidentType}
              onChange={e => setIncidentType(e.target.value)}
              className="w-full h-10 rounded-md border border-cream-200 bg-white px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un type…</option>
              {INCIDENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Order number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-700" htmlFor="order-id">
              N° commande concernée
            </label>
            <input
              id="order-id"
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="ex. YN-2026-18432"
              className="w-full h-10 rounded-md border border-cream-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-700" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="Décrivez précisément l'incident survenu…"
              className="w-full rounded-md border border-cream-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Refund checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={askRefund}
              onChange={e => setAskRefund(e.target.checked)}
              className="w-4 h-4 rounded border-cream-300 accent-emerald-500 cursor-pointer"
            />
            <span className="text-sm text-ink-700">Demander remboursement (si assuré)</span>
          </label>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Soumettre le signalement
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Previous declarations */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6">
        <h2 className="font-semibold text-ink-900 mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cream-200 text-ink-600 text-xs font-bold flex items-center justify-center">2</span>
          Mes déclarations précédentes
        </h2>

        <div className="space-y-3">
          {MOCK_TICKETS.map(ticket => {
            const config = STATUS_CONFIG[ticket.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={ticket.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-cream-100 bg-cream-50 hover:bg-white transition-colors"
              >
                <StatusIcon className={`w-5 h-5 shrink-0 ${config.className.split(" ")[1]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-ink-400">{ticket.id}</span>
                    <span className="text-sm font-medium text-ink-900 truncate">{ticket.type}</span>
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    Commande {ticket.orderId} · {ticket.date}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.className}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
