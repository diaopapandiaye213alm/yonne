"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, XCircle, Filter, ChevronDown, ChevronUp, Send, UserCircle, Bot } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";

type Status = "ouvert" | "en cours" | "résolu";
type MsgFrom = "client" | "admin";
type Msg = { from: MsgFrom; text: string; time: string };

type Ticket = {
  id: string; ref: string; type: string; description: string;
  status: Status; responsable: string; date: string; delay: string;
  messages: Msg[];
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Auj. ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hier ${time}`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + ` ${time}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  "ouvert":   { label: "Ouvert",   color: "bg-red-100 text-red-700",          icon: XCircle },
  "en cours": { label: "En cours", color: "bg-amber-100 text-amber-700",       icon: Clock },
  "résolu":   { label: "Résolu",   color: "bg-emerald-100 text-emerald-700",   icon: CheckCircle2 },
};

function now() { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }

function TicketCard({ ticket, supabase, onTake, onResolve }: {
  ticket: Ticket;
  supabase: ReturnType<typeof useSupabaseAuthed>;
  onTake: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState<Msg[]>(ticket.messages);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[ticket.status];
  const Icon = cfg.icon;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function sendReply() {
    if (!draft.trim()) return;
    const text = draft;
    setDraft("");
    const { error } = await supabase.from("sav_messages").insert({ ticket_id: ticket.id, from_role: "admin", text });
    if (error) {
      setDraft(text);
      toast.error("Impossible d'envoyer la réponse");
      return;
    }
    setMsgs(prev => [...prev, { from: "admin", text, time: now() }]);
    toast.success("Réponse envoyée au client via WhatsApp");
  }

  return (
    <div className={`bg-white rounded-lg border shadow-card overflow-hidden transition-all ${
      ticket.status === "ouvert" ? "border-red-200" :
      ticket.status === "en cours" ? "border-amber-200" : "border-cream-200"
    }`}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-cream-50 transition-colors"
      >
        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${ticket.status === "résolu" ? "text-ink-300" : "text-amber-500"}`} />
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
          <div className="flex items-center gap-4 mt-1 text-xs text-ink-400">
            <span>📅 {ticket.date}</span>
            {ticket.delay !== "—" && <span>⏱ {ticket.delay}</span>}
            {ticket.responsable !== "—" && <span>👤 {ticket.responsable}</span>}
            <span className="text-emerald-500">{msgs.length} message{msgs.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status === "ouvert" && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onTake(ticket.id); }}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
              Prendre en charge
            </button>
          )}
          {ticket.status === "en cours" && (
            <button type="button"
              onClick={e => { e.stopPropagation(); onResolve(ticket.id); }}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
              Marquer résolu
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
        </div>
      </button>

      {/* Inline chat thread */}
      {open && (
        <div className="border-t border-cream-100 bg-[#E5DDD5]">
          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.from === "admin" ? "flex-row-reverse" : ""}`}>
                <div className="shrink-0 mt-0.5">
                  {m.from === "client"
                    ? <UserCircle className="w-7 h-7 text-ink-400" />
                    : <Bot className="w-7 h-7 text-emerald-600" />}
                </div>
                <div className={`max-w-[75%] ${m.from === "admin" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed shadow-sm ${
                    m.from === "admin"
                      ? "bg-[#DCF8C6] rounded-tr-none text-ink-800"
                      : "bg-white rounded-tl-none text-ink-800"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-ink-400 px-1">{m.time}</span>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          {ticket.status !== "résolu" && (
            <div className="flex items-center gap-2 p-3 border-t border-[#D0C8BF] bg-[#F0ECE8]">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Répondre au client…"
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm focus:outline-none border-0 shadow-sm"
              />
              <button type="button" onClick={sendReply} disabled={!draft.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SavPage() {
  const supabase = useSupabaseAuthed();
  const t = useT();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter,  setFilter]  = useState<Status | "tous">("tous");

  useEffect(() => {
    async function load() {
      const { data: trows } = await supabase.from("sav_tickets").select("*").order("created_at", { ascending: false });
      const { data: mrows } = await supabase.from("sav_messages").select("*").order("sent_at");
      if (!trows) return;
      const msgs = (mrows ?? []) as { ticket_id: string; from_role: string; text: string; sent_at: string }[];
      setTickets(trows.map(r => ({
        id: r.id as string,
        ref: (r.order_ref as string) ?? "—",
        type: (r.type as string) ?? "—",
        description: (r.description as string) ?? "",
        status: (r.status as Status),
        responsable: (r.responsable as string) ?? "—",
        date: fmtDate(r.created_at as string),
        delay: (r.delay as string) ?? "—",
        messages: msgs.filter(m => m.ticket_id === r.id).map(m => ({
          from: m.from_role as MsgFrom,
          text: m.text,
          time: fmtTime(m.sent_at),
        })),
      })));
    }
    load();
  }, [supabase]);

  const visible = filter === "tous" ? tickets : tickets.filter(tk => tk.status === filter);
  const open    = tickets.filter(tk => tk.status === "ouvert").length;
  const cours   = tickets.filter(tk => tk.status === "en cours").length;
  const solved  = tickets.filter(tk => tk.status === "résolu").length;
  const rate    = tickets.length ? Math.round((solved / tickets.length) * 100) : 0;

  async function take(id: string) {
    const { error } = await supabase.from("sav_tickets").update({ status: "en cours", responsable: "Admin" }).eq("id", id);
    if (error) { toast.error("Impossible de prendre en charge ce ticket"); return; }
    setTickets(prev => prev.map(tk => tk.id === id ? { ...tk, status: "en cours" as Status, responsable: "Admin" } : tk));
    toast.success(`Ticket ${id} pris en charge`);
  }
  async function resolve(id: string) {
    const { error } = await supabase.from("sav_tickets").update({ status: "résolu", delay: "—" }).eq("id", id);
    if (error) { toast.error("Impossible de résoudre ce ticket"); return; }
    setTickets(prev => prev.map(tk => tk.id === id ? { ...tk, status: "résolu" as Status, delay: "—" } : tk));
    toast.success(`Ticket ${id} marqué résolu`);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">{t("navSav")}</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Ouverts",           value: open,        color: "text-red-600",     bg: "border-red-100" },
          { label: "En cours",          value: cours,       color: "text-amber-600",   bg: "border-amber-100" },
          { label: "Résolus",           value: solved,      color: "text-emerald-600", bg: "border-emerald-100" },
          { label: "Taux résolution",   value: `${rate}%`,  color: "text-ink-900",     bg: "border-cream-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-white rounded-lg border shadow-card p-4 ${bg}`}>
            <div className={`text-2xl font-display font-bold tabular-nums ${color}`}>{value}</div>
            <div className="text-xs text-ink-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-ink-400" />
        {(["tous", "ouvert", "en cours", "résolu"] as const).map(s => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize ${
              filter === s ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} supabase={supabase} onTake={take} onResolve={resolve} />
        ))}
      </div>
    </div>
  );
}
