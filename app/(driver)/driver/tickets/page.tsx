"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";
import { ShieldCheck, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { SavTicketRow } from "@/lib/database.types";

type TicketStatus = "ouvert" | "en cours" | "résolu";

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string; icon: React.ElementType }> = {
  ouvert:     { label: "Ouvert",    className: "bg-red-100 text-red-700",            icon: AlertCircle },
  "en cours": { label: "En cours", className: "bg-amber-100 text-amber-700",         icon: Clock },
  résolu:     { label: "Résolu",   className: "bg-emerald-100 text-emerald-700",     icon: CheckCircle2 },
};

export default function DriverTicketsPage() {
  const supabase = useSupabaseAuthed();
  const [tickets, setTickets] = useState<SavTicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      const { data } = await supabase
        .from("sav_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setTickets(data);
      setLoading(false);
    }
    fetchTickets();
  }, [supabase]);

  return (
    <div className="pb-24 px-4 pt-6 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Mes signalements</h1>
        <p className="text-sm text-ink-500 mt-1">Historique de vos incidents déclarés</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-cream-200 shadow-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-cream-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-cream-200 rounded w-3/4" />
                  <div className="h-2.5 bg-cream-100 rounded w-1/2" />
                </div>
                <div className="h-5 w-16 bg-cream-200 rounded-full shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-cream-200 shadow-card py-16 flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-500" />
          <p className="text-sm font-medium text-ink-700">Aucun incident signalé</p>
          <p className="text-xs text-ink-400">Tout va bien — aucun ticket ouvert.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                className="bg-white rounded-lg border border-cream-200 shadow-card p-4 flex items-center gap-4 hover:border-cream-300 transition-colors"
              >
                <StatusIcon className={`w-5 h-5 shrink-0 ${config.className.split(" ")[1]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink-900 truncate">{ticket.type ?? "Incident"}</span>
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
      )}
    </div>
  );
}
