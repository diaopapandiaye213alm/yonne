"use client";
import { useState, useEffect, useRef } from "react";
import { useWizard } from "@/lib/store/wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchLandmarks, landmarks } from "@/lib/mock-data/landmarks";
import { MapPin, User, Globe } from "lucide-react";
import { SENEGAL_REGIONS, citiesForRegion } from "@/lib/senegal-locations";

type RecentClient = {
  name: string;
  phone: string;
  landmarkId: string;
  landmarkName: string;
};

export function ClientStep() {
  const w = useWizard();
  const [query, setQuery] = useState("");
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const prefillApplied = useRef(false);
  const selected = landmarks.find(l => l.id === w.landmarkId) ?? null;
  const suggestions = searchLandmarks(query);
  const canNext = w.clientName.trim() && w.clientPhone.trim() && w.landmarkId;

  // Read recent clients from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yonne_recent_clients");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (c): c is RecentClient =>
              c !== null &&
              typeof c === "object" &&
              typeof (c as RecentClient).name === "string" && (c as RecentClient).name.trim() !== "" &&
              typeof (c as RecentClient).phone === "string" && (c as RecentClient).phone.trim() !== "" &&
              typeof (c as RecentClient).landmarkId === "string" && (c as RecentClient).landmarkId.trim() !== "" &&
              typeof (c as RecentClient).landmarkName === "string"
          );
          setRecentClients(valid.slice(0, 5));
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Read prefill from "Re-commander" action — only apply once per mount.
  // Removal is deferred to handleNext() so that navigating away and back
  // still shows the prefill (it's only cleared after the user confirms).
  useEffect(() => {
    if (prefillApplied.current) return;
    prefillApplied.current = true;
    try {
      const raw = localStorage.getItem("yonne_prefill_order");
      if (raw) {
        const prefill: unknown = JSON.parse(raw);
        if (prefill !== null && typeof prefill === "object") {
          const p = prefill as Record<string, unknown>;
          const hasName     = typeof p.clientName  === "string" && !!(p.clientName  as string).trim();
          const hasPhone    = typeof p.clientPhone === "string" && !!(p.clientPhone as string).trim();
          const hasLandmark = typeof p.landmarkId  === "string" && !!(p.landmarkId  as string).trim();
          if (hasName && hasPhone && hasLandmark) {
            w.set("clientName",  p.clientName  as string);
            w.set("clientPhone", p.clientPhone as string);
            w.set("landmarkId",  p.landmarkId  as string);
            if (typeof p.amount === "number" && p.amount > 0) w.set("amount", p.amount);
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyRecentClient(c: RecentClient) {
    w.set("clientName", c.name);
    w.set("clientPhone", c.phone);
    w.set("landmarkId", c.landmarkId);
    setQuery("");
  }

  return (
    <div className="space-y-5 max-w-xl">
      {/* Recent clients */}
      {recentClients.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-ink-500 uppercase tracking-wide">Clients récents</Label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentClients.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyRecentClient(c)}
                className="flex items-center gap-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-200 rounded-full px-3 py-1.5 shrink-0 transition-colors"
              >
                <User className="w-3 h-3 text-ink-400 shrink-0" />
                <span className="text-xs font-medium text-ink-700 truncate max-w-[120px]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cn">Nom client</Label>
          <Input id="cn" value={w.clientName} onChange={e => w.set("clientName", e.target.value)} placeholder="Awa Diop" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp">Téléphone</Label>
          <Input id="cp" value={w.clientPhone} onChange={e => w.set("clientPhone", e.target.value)} placeholder="+221 77 123 4567" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Adresse · point de repère</Label>
        {selected ? (
          <button
            type="button"
            onClick={() => { w.set("landmarkId", null); setQuery(""); }}
            className="w-full text-left bg-emerald-500/10 border border-emerald-500 rounded-md p-3 flex items-center gap-3"
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-ink-900">{selected.name}</div>
              <div className="text-xs text-ink-500">{selected.quartier} · {selected.type}</div>
            </div>
            <span className="text-xs text-emerald-500">Modifier</span>
          </button>
        ) : (
          <>
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tape « Total », « Mosquée », « Marché »…" />
            {suggestions.length > 0 && (
              <div className="bg-white rounded-md border border-cream-200 shadow-card overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { w.set("landmarkId", s.id); setQuery(""); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-cream-100 flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-ink-500" />
                    <div>
                      <div className="text-sm font-medium text-ink-900">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.quartier} · {s.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Region + City selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-ink-400" /> Région</Label>
          <select
            value={w.deliveryRegion}
            onChange={e => { w.set("deliveryRegion", e.target.value); w.set("deliveryCity", ""); }}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SENEGAL_REGIONS.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Ville / Commune</Label>
          <select
            value={w.deliveryCity}
            onChange={e => w.set("deliveryCity", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Toutes les villes —</option>
            {citiesForRegion(w.deliveryRegion).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad">Précisions adresse (optionnel)</Label>
        <Input id="ad" value={w.addressDetails} onChange={e => w.set("addressDetails", e.target.value)} placeholder="Bâtiment B, 3ᵉ étage, porte gauche" />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            try { localStorage.removeItem("yonne_prefill_order"); } catch { /* ignore */ }
            w.next();
          }}
          disabled={!canNext}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
