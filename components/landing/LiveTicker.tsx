"use client";

const EVENTS = [
  { id: "YN-10142", client: "Fatou D.",     amount: "12 500 F", method: "Wave",   status: "Livré ✓",  zone: "Plateau"   },
  { id: "YN-10156", client: "Ibrahima S.",  amount: "8 200 F",  method: "Orange", status: "En route", zone: "Médina"    },
  { id: "YN-10163", client: "Awa B.",       amount: "23 800 F", method: "Wave",   status: "Collecte", zone: "Almadies"  },
  { id: "YN-10171", client: "Moussa C.",    amount: "5 600 F",  method: "Cash",   status: "Assigné",  zone: "Parcelles" },
  { id: "YN-10179", client: "Mariama F.",   amount: "18 100 F", method: "Wave",   status: "Livré ✓",  zone: "VDN"       },
  { id: "YN-10185", client: "Cheikh N.",    amount: "9 900 F",  method: "Orange", status: "En route", zone: "HLM"       },
  { id: "YN-10192", client: "Aïssatou T.", amount: "31 200 F", method: "Wave",   status: "Livré ✓",  zone: "Fann"      },
  { id: "YN-10198", client: "Ousmane K.",   amount: "7 400 F",  method: "Cash",   status: "Collecte", zone: "Ouakam"    },
  { id: "YN-10204", client: "Khady S.",     amount: "14 600 F", method: "Wave",   status: "Livré ✓",  zone: "Sacré-Cœur"},
  { id: "YN-10211", client: "Modou F.",     amount: "6 800 F",  method: "Orange", status: "En route", zone: "Pikine"    },
];

const STATUS_DOT: Record<string, string> = {
  "Livré ✓":  "bg-emerald-400",
  "En route": "bg-gold-400",
  "Collecte": "bg-amber-400",
  "Assigné":  "bg-blue-400",
};

const METHOD_COLOR: Record<string, string> = {
  Wave:   "text-[#1B96D4]",
  Orange: "text-orange-400",
  Cash:   "text-ink-400",
};

export function LiveTicker() {
  return (
    <div className="bg-emerald-950/90 border-b border-emerald-800/50 overflow-hidden py-2 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...EVENTS, ...EVENTS].map((ev, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-5 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[ev.status] ?? "bg-ink-400"}`} />
            <span className="font-mono text-emerald-400/60">{ev.id}</span>
            <span className="text-white/60">{ev.client}</span>
            <span className="text-white/30">·</span>
            <span className="font-semibold text-white">{ev.amount}</span>
            <span className={`font-medium ${METHOD_COLOR[ev.method] ?? "text-white/50"}`}>{ev.method}</span>
            <span className="text-white/30">·</span>
            <span className="text-emerald-300/50">{ev.zone}</span>
            <span className="text-white/15 ml-3">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
