"use client";

import { useState, useEffect, useRef } from "react";
import { Radio } from "lucide-react";
import { useOrdersStore } from "@/lib/store/orders";

type EventKind = "assigned" | "picked_up" | "en_route" | "delivered" | "new_order";

const KIND_CONFIG: Record<EventKind, { label: string; color: string; dot: string }> = {
  new_order:  { label: "Nouvelle commande",  color: "text-emerald-600", dot: "bg-emerald-500" },
  assigned:   { label: "Livreur assigné",    color: "text-blue-600",    dot: "bg-blue-400" },
  picked_up:  { label: "Collecte effectuée", color: "text-amber-600",   dot: "bg-gold-500" },
  en_route:   { label: "En route",           color: "text-ink-700",     dot: "bg-ink-400" },
  delivered:  { label: "Livré ✓",            color: "text-emerald-700", dot: "bg-emerald-600" },
};

const PAYMENT_COLORS: Record<string, string> = {
  Wave:   "bg-[#1B96D4]/10 text-[#1B96D4]",
  Orange: "bg-orange-100 text-orange-700",
  Cash:   "bg-cream-200 text-ink-600",
};

const CLIENTS = ["Fatou D.", "Ibrahima S.", "Awa B.", "Cheikh N.", "Mariama F.", "Ousmane K.", "Aïssatou T.", "Babacar D.", "Khady S.", "Moussa C."];
const DRIVERS = ["Lamine B.", "Pape D.", "Ndèye S.", "Modou F.", "Saliou N."];
const PAYMENTS: Array<"Wave" | "Orange" | "Cash"> = ["Wave", "Wave", "Orange", "Cash"];
const KINDS: EventKind[] = ["new_order", "assigned", "picked_up", "en_route", "delivered"];

let _seq = 10200;

class Prng {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }
}
const _feedRng = new Prng(Date.now() & 0xffffffff);

function pick<T>(arr: T[]): T { return arr[Math.floor(_feedRng.next() * arr.length)]; }
function randAmt() { return (Math.floor(_feedRng.next() * 180 + 20) * 100); }
function nextId() { return `YN-${++_seq}`; }
function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

interface FeedEvent {
  uid: string;
  time: string;
  id: string;
  client: string;
  driver: string;
  amount: number;
  payment: "Wave" | "Orange" | "Cash";
  kind: EventKind;
}

function makeSeedEvents(): FeedEvent[] {
  return Array.from({ length: 6 }, (_, i) => ({
    uid: `seed-${i}`,
    time: `${14 - i}:${String(Math.floor(_feedRng.next() * 59)).padStart(2,"0")}`,
    id: nextId(),
    client: pick(CLIENTS),
    driver: pick(DRIVERS),
    amount: randAmt(),
    payment: pick(PAYMENTS),
    kind: pick(KINDS),
  }));
}

const STATUS_KIND: Record<string, EventKind> = {
  "créée":    "new_order",
  "assignée": "assigned",
  "collecte": "picked_up",
  "en route": "en_route",
  "livrée":   "delivered",
};

const PAY_MAP: Record<string, "Wave" | "Orange" | "Cash"> = {
  wave: "Wave", orange: "Orange", cash: "Cash",
};

export function LiveFeed() {
  const { orders } = useOrdersStore();
  const [events, setEvents] = useState<FeedEvent[]>(makeSeedEvents);
  const [flash,  setFlash]  = useState<string | null>(null);
  const prevOrdersRef = useRef<typeof orders>([]);

  // Inject real events when order list changes
  useEffect(() => {
    const prev = prevOrdersRef.current;
    if (prev.length === 0) { prevOrdersRef.current = orders; return; }

    const changed = orders.filter(o => {
      const old = prev.find(p => p.id === o.id);
      return !old || old.status !== o.status;
    });

    for (const o of changed.slice(0, 3)) {
      const ev: FeedEvent = {
        uid:     `real-${o.id}-${o.status}`,
        time:    nowStr(),
        id:      o.id,
        client:  o.clientName,
        driver:  pick(DRIVERS),
        amount:  o.amount,
        payment: PAY_MAP[o.paymentMethod] ?? "Cash",
        kind:    STATUS_KIND[o.status] ?? "new_order",
      };
      setEvents(prev => [ev, ...prev].slice(0, 12));
      setFlash(ev.uid);
      setTimeout(() => setFlash(null), 600);
    }
    prevOrdersRef.current = orders;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function addEvent() {
      const ev: FeedEvent = {
        uid:     `live-${Date.now()}`,
        time:    nowStr(),
        id:      nextId(),
        client:  pick(CLIENTS),
        driver:  pick(DRIVERS),
        amount:  randAmt(),
        payment: pick(PAYMENTS),
        kind:    pick(KINDS),
      };
      setEvents(prev => [ev, ...prev].slice(0, 12));
      setFlash(ev.uid);
      setTimeout(() => setFlash(null), 600);
      timeoutId = setTimeout(addEvent, 4000 + _feedRng.next() * 6000);
    }

    timeoutId = setTimeout(addEvent, 4000 + _feedRng.next() * 6000);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-cream-100 flex items-center gap-2 bg-cream-50/60">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-live-pulse" />
        </div>
        <h2 className="font-semibold text-ink-900 text-sm">Flux en direct</h2>
        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
          Live
        </span>
        <span className="ml-auto text-xs text-ink-400 tabular-nums">{events.length} événements</span>
      </div>

      <div className="divide-y divide-cream-50 max-h-72 overflow-y-auto">
        {events.map(ev => {
          const cfg = KIND_CONFIG[ev.kind];
          return (
            <div
              key={ev.uid}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                flash === ev.uid ? "bg-emerald-50" : "hover:bg-cream-50/70"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
              <span className="text-[11px] text-ink-400 tabular-nums shrink-0 w-16 font-mono">{ev.time}</span>
              <span className="font-mono text-xs font-semibold text-emerald-600 shrink-0 w-20">{ev.id}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className="text-xs text-ink-400 ml-1">· {ev.client}</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${PAYMENT_COLORS[ev.payment]}`}>
                {ev.payment}
              </span>
              <span className="text-xs font-mono font-bold text-ink-900 tabular-nums shrink-0 w-20 text-right">
                {ev.amount.toLocaleString("fr-FR")} F
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
