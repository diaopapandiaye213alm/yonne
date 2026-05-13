"use client";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Filter } from "lucide-react";

type Status = "ouvert" | "en cours" | "résolu";
type Ticket = {
  id: string; ref: string; type: string; description: string;
  status: Status; responsable: string; date: string; delay: string;
};

const INITIAL: Ticket[] = [
  { id: "SAV-001", ref: "YN-2026-10124", type: "Retard livraison",   description: "Client signale un retard de plus de 2h", status: "ouvert",   responsable: "—",           date: "Auj. 14:30", delay: "45 min" },
  { id: "SAV-002", ref: "YN-2026-10098", type: "Colis abîmé",        description: "Tissu endommagé à la livraison",         status: "en cours", responsable: "Moussa D.",    date: "Auj. 11:20", delay: "3h 10m" },
  { id: "SAV-003", ref: "YN-2026-10085", type: "Mauvaise adresse",   description: "Livreur livré à mauvais point repère",   status: "en cours", responsable: "Fatou S.",     date: "Hier 16:45", delay: "22h" },
  { id: "SAV-004", ref: "YN-2026-10071", type: "Non livré",          description: "Commande marquée livrée mais non reçue", status: "résolu",   responsable: "Ibrahima C.",  date: "Hier 09:15", delay: "—" },
  { id: "SAV-005", ref: "YN-2026-10060", type: "Paiement incorrect", description: "Montant Wave incorrect débité",          status: "résolu",   responsable: "Admin",        date: "13/05 18:00", delay: "—" },
  { id: "SAV-006", ref: "YN-2026-10050", type: "Retard livraison",   description: "Zone inondée, livreur bloqué",           status: "ouvert",   responsable: "—",            date: "13/05 17:30", delay: "2h 30m" },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  "ouvert":   { label: "Ouvert",   color: "bg-red-100 text-red-700",      icon: XCircle },
  "en cours": { label: "En cours", color: "bg-amber-100 text-amber-700",   icon: Clock },
  "résolu":   { label: "Résolu",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export default function SavPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL);
  const [filter, setFilter] = useState<Status | "tous">("tous");

  const visible = filter === "tous" ? tickets : tickets.filter(t => t.status === filter);
  const open   = tickets.filter(t => t.status === "ouvert").length;
  const cours  = tickets.filter(t => t.status === "en cours").length;
  const solved = tickets.filter(t => t.status === "résolu").length;
  const rate   = Math.round((solved / tickets.length) * 100);

  function resolve(id: string) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "résolu", responsable: "Admin", delay: "—" } : t));
    toast.success(`Ticket ${id} marqué résolu`);
  }
  function take(id: string) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "en cours", responsable: "Admin" } : t));
    toast.success(`Ticket ${id} pris en charge`);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">SAV & Incidents</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Ouverts",    value: open,   color: "text-red-600",      bg: "border-red-100" },
          { label: "En cours",   value: cours,  color: "text-amber-600",    bg: "border-amber-100" },
          { label: "Résolus",    value: solved, color: "text-emerald-600",  bg: "border-emerald-100" },
          { label: "Taux résolution", value: `${rate}%`, color: "text-ink-900", bg: "border-cream-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-white rounded-lg border shadow-card p-4 ${bg}`}>
            <div className={`text-2xl font-display font-bold tabular-nums ${color}`}>{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-ink-400" />
        {(["tous", "ouvert", "en cours", "résolu"] as const).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize ${
              filter === s ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {visible.map(ticket => {
          const cfg = STATUS_CONFIG[ticket.status];
          const Icon = cfg.icon;
          return (
            <div key={ticket.id} className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-ink-400">{ticket.id}</span>
                    <span className="font-mono text-xs text-emerald-500">{ticket.ref}</span>
                    <span className="font-semibold text-sm text-ink-900">{ticket.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-ink-500 mt-1">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-ink-400">
                    <span>📅 {ticket.date}</span>
                    {ticket.delay !== "—" && <span>⏱ En attente : {ticket.delay}</span>}
                    {ticket.responsable !== "—" && <span>👤 {ticket.responsable}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {ticket.status === "ouvert" && (
                    <button type="button" onClick={() => take(ticket.id)}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Prendre en charge
                    </button>
                  )}
                  {ticket.status === "en cours" && (
                    <button type="button" onClick={() => resolve(ticket.id)}
                      className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Marquer résolu
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
