"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { SavTicketRow } from "@/lib/database.types";

const INCIDENT_TYPES = [
  "Colis endommagé",
  "Colis perdu",
  "Livreur non présenté",
  "Mauvaise adresse",
  "Retard excessif (>2h)",
  "Autre",
];

type TicketStatus = "ouvert" | "en cours" | "résolu";

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
  const [tickets, setTickets] = useState<SavTicketRow[]>([]);

  async function fetchTickets() {
    const { data } = await supabase
      .from("sav_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setTickets(data);
  }

  useEffect(() => { fetchTickets(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incidentType || !description.trim()) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("sav_tickets").insert({
      order_ref:   orderId || null,
      type:        incidentType,
      description: description.trim() + (askRefund ? " [Remboursement demandé]" : ""),
      status:      "ouvert" as const,
      responsable: "—",
      delay:       "—",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } else {
      toast.success("Signalement soumis. Notre équipe vous contactera sous 24h.");
      setIncidentType(""); setOrderId(""); setDescription(""); setAskRefund(false);
      fetchTickets();
    }
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
          {tickets.length === 0 && (
            <p className="text-sm text-ink-400 text-center py-4">Aucun incident signalé.</p>
          )}
          {tickets.map(ticket => {
            const status = ticket.status as TicketStatus;
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["ouvert"];
            const StatusIcon = config.icon;
            const dateFormatted = ticket.created_at
              ? new Date(ticket.created_at).toLocaleDateString("fr-FR")
              : "—";
            return (
              <div
                key={ticket.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-cream-100 bg-cream-50 hover:bg-white transition-colors"
              >
                <StatusIcon className={`w-5 h-5 shrink-0 ${config.className.split(" ")[1]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-ink-400">{ticket.id.slice(0, 8)}</span>
                    <span className="text-sm font-medium text-ink-900 truncate">{ticket.type}</span>
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {ticket.order_ref ? `Commande ${ticket.order_ref} · ` : ""}{dateFormatted}
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
