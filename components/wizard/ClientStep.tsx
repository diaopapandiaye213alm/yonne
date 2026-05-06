"use client";
import { useState } from "react";
import { useWizard } from "@/lib/store/wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchLandmarks, landmarks } from "@/lib/mock-data/landmarks";
import { MapPin } from "lucide-react";

export function ClientStep() {
  const w = useWizard();
  const [query, setQuery] = useState("");
  const selected = landmarks.find(l => l.id === w.landmarkId) ?? null;
  const suggestions = searchLandmarks(query);
  const canNext = w.clientName.trim() && w.clientPhone.trim() && w.landmarkId;

  return (
    <div className="space-y-5 max-w-xl">
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

      <div className="space-y-2">
        <Label htmlFor="ad">Précisions adresse (optionnel)</Label>
        <Input id="ad" value={w.addressDetails} onChange={e => w.set("addressDetails", e.target.value)} placeholder="Bâtiment B, 3ᵉ étage, porte gauche" />
      </div>

      <div className="flex justify-end">
        <Button onClick={w.next} disabled={!canNext} className="bg-emerald-500 hover:bg-emerald-600">
          Suivant
        </Button>
      </div>
    </div>
  );
}
