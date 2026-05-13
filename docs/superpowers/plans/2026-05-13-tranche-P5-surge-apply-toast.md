# Tranche P5 — Bouton Surge "Appliquer" avec Toast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher le bouton "Appliquer" de la page Surge sur un `toast.success` confirmant l'application du multiplicateur.

**Architecture:** Un seul fichier modifié — ajout de `import { toast } from "sonner"` et d'un `onClick` sur le `<Button>`. Aucun changement au store.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Sonner, Tailwind CSS

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/(admin)/admin/surge/page.tsx` | Modifier — import toast + onClick |

---

## Task 1 : Brancher le bouton Appliquer + build + tag

**Files:**
- Modify: `app/(admin)/admin/surge/page.tsx`

Contenu actuel complet (pour référence) :
```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { useSurgeStore } from "@/lib/store/surge";
import { surgeHistory } from "@/lib/mock-data/surge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function multiplierColor(m: number) {
  if (m < 1.3) return "#15803D";
  if (m < 1.7) return "#C8924C";
  return "#B43A2E";
}

function multiplierBadgeClass(m: number) {
  if (m < 1.3) return "text-emerald-600 bg-emerald-500/10";
  if (m < 1.7) return "text-ink-900 bg-gold-500/20";
  return "text-red-700 bg-red-100";
}

export default function SurgePage() {
  const { multiplier, autoMode, setMultiplier, toggleAutoMode } = useSurgeStore();
  const extraPct = Math.round((multiplier - 1) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Surge Pricing</h1>

      {/* Contrôle */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn("text-5xl font-display font-bold tabular-nums", multiplierBadgeClass(multiplier).split(" ")[0])}>
              ×{multiplier.toFixed(1)}
            </div>
            <div className="text-sm text-ink-500 mt-1">Multiplicateur actuel</div>
          </div>
          <div className={cn("px-4 py-2 rounded-xl text-sm font-medium", multiplierBadgeClass(multiplier))}>
            {extraPct > 0 ? `+${extraPct}% de revenus estimés` : "Tarif normal"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="auto" checked={autoMode} onCheckedChange={toggleAutoMode} />
          <Label htmlFor="auto" className="text-sm font-medium cursor-pointer">
            Mode automatique IA
            {autoMode && <span className="ml-2 text-xs text-ink-500">— Le slider est désactivé, l&apos;IA ajuste automatiquement</span>}
          </Label>
        </div>

        <div>
          <div className="flex justify-between text-xs text-ink-500 mb-2">
            <span>×1.0</span><span>×1.2</span><span>×1.4</span><span>×1.6</span><span>×1.8</span><span>×2.0</span>
          </div>
          <input
            type="range"
            min={10} max={20} step={1}
            value={Math.round(multiplier * 10)}
            onChange={e => setMultiplier(Number(e.target.value) / 10)}
            disabled={autoMode}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed accent-emerald-600"
          />
        </div>

        {!autoMode && (
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Appliquer ×{multiplier.toFixed(1)}
          </Button>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Historique du jour — multiplicateur par heure</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={surgeHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#8B7363" }} interval={2} />
            <YAxis domain={[1, 2]} tickFormatter={v => `×${v}`} tick={{ fontSize: 10, fill: "#8B7363" }} width={36} />
            <Tooltip formatter={(v: unknown) => [`×${v}`, "Multiplicateur"]} />
            <ReferenceLine y={1} stroke="#E8DFD0" />
            <Bar dataKey="multiplier" radius={[3, 3, 0, 0]}>
              {surgeHistory.map((entry, i) => (
                <Cell key={i} fill={multiplierColor(entry.multiplier)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer `app/(admin)/admin/surge/page.tsx`**

```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { toast } from "sonner";
import { useSurgeStore } from "@/lib/store/surge";
import { surgeHistory } from "@/lib/mock-data/surge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function multiplierColor(m: number) {
  if (m < 1.3) return "#15803D";
  if (m < 1.7) return "#C8924C";
  return "#B43A2E";
}

function multiplierBadgeClass(m: number) {
  if (m < 1.3) return "text-emerald-600 bg-emerald-500/10";
  if (m < 1.7) return "text-ink-900 bg-gold-500/20";
  return "text-red-700 bg-red-100";
}

export default function SurgePage() {
  const { multiplier, autoMode, setMultiplier, toggleAutoMode } = useSurgeStore();
  const extraPct = Math.round((multiplier - 1) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink-900">Surge Pricing</h1>

      {/* Contrôle */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn("text-5xl font-display font-bold tabular-nums", multiplierBadgeClass(multiplier).split(" ")[0])}>
              ×{multiplier.toFixed(1)}
            </div>
            <div className="text-sm text-ink-500 mt-1">Multiplicateur actuel</div>
          </div>
          <div className={cn("px-4 py-2 rounded-xl text-sm font-medium", multiplierBadgeClass(multiplier))}>
            {extraPct > 0 ? `+${extraPct}% de revenus estimés` : "Tarif normal"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="auto" checked={autoMode} onCheckedChange={toggleAutoMode} />
          <Label htmlFor="auto" className="text-sm font-medium cursor-pointer">
            Mode automatique IA
            {autoMode && <span className="ml-2 text-xs text-ink-500">— Le slider est désactivé, l&apos;IA ajuste automatiquement</span>}
          </Label>
        </div>

        <div>
          <div className="flex justify-between text-xs text-ink-500 mb-2">
            <span>×1.0</span><span>×1.2</span><span>×1.4</span><span>×1.6</span><span>×1.8</span><span>×2.0</span>
          </div>
          <input
            type="range"
            min={10} max={20} step={1}
            value={Math.round(multiplier * 10)}
            onChange={e => setMultiplier(Number(e.target.value) / 10)}
            disabled={autoMode}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed accent-emerald-600"
          />
        </div>

        {!autoMode && (
          <Button
            type="button"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() =>
              toast.success(`Surge ×${multiplier.toFixed(1)} appliqué — toutes les nouvelles courses utilisent ce multiplicateur`)
            }
          >
            Appliquer ×{multiplier.toFixed(1)}
          </Button>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Historique du jour — multiplicateur par heure</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={surgeHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#8B7363" }} interval={2} />
            <YAxis domain={[1, 2]} tickFormatter={v => `×${v}`} tick={{ fontSize: 10, fill: "#8B7363" }} width={36} />
            <Tooltip formatter={(v: unknown) => [`×${v}`, "Multiplicateur"]} />
            <ReferenceLine y={1} stroke="#E8DFD0" />
            <Bar dataKey="multiplier" radius={[3, 3, 0, 0]}>
              {surgeHistory.map((entry, i) => (
                <Cell key={i} fill={multiplierColor(entry.multiplier)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur.

- [ ] **Step 4 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(admin)/admin/surge/page.tsx" && git commit -m "feat(surge): bouton Appliquer branché sur toast.success" && git tag v1.6.0-tranche-P5
```
