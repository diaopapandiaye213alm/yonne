# YONNE Tranche C — Vue Démo Split-Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un écran `/demo` plein écran qui montre côte à côte la vue marchand et la vue livreur, avec un pin livreur se déplaçant simultanément sur les deux cartes via une simulation de 30 secondes.

**Architecture:** Un Zustand store `demo-sim` contrôle `progress` (0-100) et `running`. Un `setInterval` dans la page avance `progress` de 1 toutes les 300ms. Les deux panels (`MerchantPanel` et `DriverPanel`) lisent `progress` depuis le même store pour calculer `driverPos`, `deliveryStep` et le stage de timeline — synchronisation garantie.

**Tech Stack:** Next.js 14 App Router, TypeScript, Zustand v5, react-leaflet@4.2.1 (SSR-safe via dynamic import), Recharts, Tailwind CSS v3, shadcn/ui.

---

## Fichiers

| Fichier | Action |
|---|---|
| `lib/store/demo-sim.ts` | Créer — store Zustand simulation |
| `components/demo/DemoTopBar.tsx` | Créer — barre top avec progress + contrôles |
| `components/demo/MerchantPanel.tsx` | Créer — vue marchand (carte + timeline + ETA) |
| `components/demo/DriverPanel.tsx` | Créer — vue livreur (carte + stepper) |
| `app/demo/page.tsx` | Créer — page assemblage |
| `components/driver/DeliveryStepperCard.tsx` | Modifier — ajouter prop `disabled?: boolean` |

---

## Task 1 — Demo simulation store

**Files:**
- Create: `lib/store/demo-sim.ts`

- [ ] **Créer le store**

```ts
// lib/store/demo-sim.ts
"use client";
import { create } from "zustand";

interface DemoSimState {
  progress: number;   // 0-100
  running: boolean;
  tick: () => void;
  start: () => void;
  reset: () => void;
}

export const useDemoSim = create<DemoSimState>((set) => ({
  progress: 0,
  running: false,
  tick: () =>
    set((s) => {
      const next = Math.min(100, s.progress + 1);
      return { progress: next, running: next < 100 };
    }),
  start: () => set((s) => (s.progress >= 100 ? { progress: 0, running: true } : { running: true })),
  reset: () => set({ progress: 0, running: false }),
}));
```

- [ ] **Créer le dossier `components/demo/`**

```bash
mkdir -p /home/papa-ndiaye-diao/yonne/components/demo
```

- [ ] **Commit**

```bash
git add lib/store/demo-sim.ts
git commit -m "feat(demo): simulation store"
```

---

## Task 2 — DeliveryStepperCard `disabled` prop

**Files:**
- Modify: `components/driver/DeliveryStepperCard.tsx`

- [ ] **Ajouter `disabled` à l'interface Props et conditionner le bouton**

Remplacer :
```tsx
interface Props {
  step: DeliveryStep;
  onAdvance: () => void;
}

export function DeliveryStepperCard({ step, onAdvance }: Props) {
```

Par :
```tsx
interface Props {
  step: DeliveryStep;
  onAdvance: () => void;
  disabled?: boolean;
}

export function DeliveryStepperCard({ step, onAdvance, disabled }: Props) {
```

Remplacer le bouton en bas du composant :
```tsx
      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold mt-2"
        onClick={onAdvance}
      >
        {STEPS[step].action}
      </Button>
```

Par :
```tsx
      {disabled ? (
        <div className="w-full mt-2 text-center text-sm text-ink-500 py-2 bg-cream-100 rounded-lg">
          Simulation en cours…
        </div>
      ) : (
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold mt-2"
          onClick={onAdvance}
        >
          {STEPS[step].action}
        </Button>
      )}
```

- [ ] **Vérifier le build**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | tail -5
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
git add components/driver/DeliveryStepperCard.tsx
git commit -m "feat(driver): DeliveryStepperCard disabled prop"
```

---

## Task 3 — DemoTopBar component

**Files:**
- Create: `components/demo/DemoTopBar.tsx`

- [ ] **Créer le composant**

```tsx
// components/demo/DemoTopBar.tsx
"use client";
import { Wordmark } from "@/components/brand/Wordmark";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDemoSim } from "@/lib/store/demo-sim";
import { Play, RotateCcw } from "lucide-react";

export function DemoTopBar() {
  const { progress, running, start, reset } = useDemoSim();
  const done = progress >= 100;

  return (
    <div className="h-14 bg-white border-b border-cream-200 flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <Wordmark size="md" />
        <span className="text-xs font-medium px-2 py-0.5 bg-gold-500/20 text-ink-900 rounded-full border border-gold-500/40">
          Mode Démo
        </span>
      </div>

      <div className="flex-1 flex items-center gap-3 max-w-xs mx-auto">
        <Progress value={progress} className="flex-1 h-2" />
        <span className="text-xs text-ink-500 shrink-0 w-8 tabular-nums">{progress}%</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-500 hidden sm:block">
          {done ? "Livraison confirmée 🎉" : running ? "Livraison en cours…" : "Prêt"}
        </span>
        {done ? (
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Rejouer
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
            onClick={start}
            disabled={running}
          >
            <Play className="w-3.5 h-3.5" /> Lancer
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add components/demo/DemoTopBar.tsx
git commit -m "feat(demo): DemoTopBar with progress and controls"
```

---

## Task 4 — MerchantPanel component

**Files:**
- Create: `components/demo/MerchantPanel.tsx`

- [ ] **Créer le composant**

```tsx
// components/demo/MerchantPanel.tsx
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useDemoSim } from "@/lib/store/demo-sim";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { DriverCard } from "@/components/tracking/DriverCard";
import type { Pin } from "@/components/map/DakarMap";
import type { DeliveryStep } from "@/lib/store/driver";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const demo = drivers[0];
const order = incomingOrders[0];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function computeDriverPos(progress: number): [number, number] {
  const pickup = landmarks.find((l) => l.id === order.pickupLandmarkId)!;
  const dest   = landmarks.find((l) => l.id === order.destLandmarkId)!;

  if (progress <= 33) {
    const t = progress / 33;
    return [lerp(demo.lat, pickup.lat, t), lerp(demo.lng, pickup.lng, t)];
  }
  if (progress <= 66) {
    const t = (progress - 33) / 33;
    return [lerp(pickup.lat, dest.lat, t), lerp(pickup.lng, dest.lng, t)];
  }
  return [dest.lat, dest.lng];
}

function stepFromProgress(p: number): DeliveryStep {
  if (p >= 100) return 3;
  if (p >= 66)  return 2;
  if (p >= 33)  return 1;
  return 0;
}

function timelineStage(step: DeliveryStep): "created" | "assigned" | "enroute" | "delivered" {
  if (step >= 3) return "delivered";
  if (step >= 2) return "enroute";
  return "assigned";
}

export function MerchantPanel() {
  const { progress } = useDemoSim();
  const driverPos = useMemo(() => computeDriverPos(progress), [progress]);
  const step = stepFromProgress(progress);
  const dest = landmarks.find((l) => l.id === order.destLandmarkId)!;
  const etaMinutes = Math.max(0, Math.round(18 * (1 - progress / 100)));

  const pins: Pin[] = [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    { id: "dest",   lat: dest.lat,     lng: dest.lng,     kind: "dest"   },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20">
        <span className="text-xs font-medium text-emerald-700">👤 Vue Marchand</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 min-w-0">
          <DakarMap
            pins={pins}
            trail={{ from: driverPos, to: [dest.lat, dest.lng] }}
            center={driverPos}
            zoom={13}
            height="100%"
          />
        </div>
        <div className="w-48 shrink-0 bg-white border-l border-cream-200 overflow-y-auto p-3 space-y-3">
          <div>
            <div className="text-xs text-ink-500">Commande</div>
            <div className="font-mono text-xs text-ink-900">{order.id}</div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-sm font-bold ${
              step >= 3 ? "bg-emerald-500 text-white" : "bg-gold-500 text-ink-900"
            }`}>
              {step >= 3 ? "Livré ✓" : "En route"}
            </span>
          </div>

          <DriverCard driver={demo} />

          <div className="bg-gold-500/15 border border-gold-500 rounded-lg p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">ETA</div>
            <div className="font-display text-3xl font-bold text-ink-900 tabular-nums">
              {etaMinutes} <span className="text-sm text-ink-500 font-normal">min</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-900 mb-2">Suivi</h3>
            <GlovoTimeline activeStage={timelineStage(step)} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add components/demo/MerchantPanel.tsx
git commit -m "feat(demo): MerchantPanel with synced map and timeline"
```

---

## Task 5 — DriverPanel component

**Files:**
- Create: `components/demo/DriverPanel.tsx`

- [ ] **Créer le composant**

```tsx
// components/demo/DriverPanel.tsx
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useDemoSim } from "@/lib/store/demo-sim";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { incomingOrders } from "@/lib/mock-data/incoming-orders";
import { DeliveryStepperCard } from "@/components/driver/DeliveryStepperCard";
import type { Pin } from "@/components/map/DakarMap";
import type { DeliveryStep } from "@/lib/store/driver";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const demo = drivers[0];
const order = incomingOrders[0];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function computeDriverPos(progress: number): [number, number] {
  const pickup = landmarks.find((l) => l.id === order.pickupLandmarkId)!;
  const dest   = landmarks.find((l) => l.id === order.destLandmarkId)!;

  if (progress <= 33) {
    const t = progress / 33;
    return [lerp(demo.lat, pickup.lat, t), lerp(demo.lng, pickup.lng, t)];
  }
  if (progress <= 66) {
    const t = (progress - 33) / 33;
    return [lerp(pickup.lat, dest.lat, t), lerp(pickup.lng, dest.lng, t)];
  }
  return [dest.lat, dest.lng];
}

function stepFromProgress(p: number): DeliveryStep {
  if (p >= 100) return 3;
  if (p >= 66)  return 2;
  if (p >= 33)  return 1;
  return 0;
}

export function DriverPanel() {
  const { progress } = useDemoSim();
  const driverPos = useMemo(() => computeDriverPos(progress), [progress]);
  const step = stepFromProgress(progress);
  const dest = landmarks.find((l) => l.id === order.destLandmarkId)!;
  const done = progress >= 100;

  const pins: Pin[] = [
    { id: "driver", lat: driverPos[0], lng: driverPos[1], kind: "driver" },
    { id: "dest",   lat: dest.lat,     lng: dest.lng,     kind: "dest"   },
  ];

  const mapHeight = done ? "calc(100% - 80px)" : "calc(100% - 160px)";

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-cream-200">
      <div className="px-3 py-1.5 bg-gold-500/10 border-b border-gold-500/20">
        <span className="text-xs font-medium text-ink-900">🛵 Vue Livreur</span>
      </div>

      <div className="flex-1 relative overflow-hidden max-w-sm mx-auto w-full">
        <DakarMap
          pins={pins}
          trail={{ from: driverPos, to: [dest.lat, dest.lng] }}
          center={driverPos}
          zoom={14}
          height={mapHeight}
        />

        <div className="absolute top-2 left-2 right-2 z-[1001]">
          <div className="bg-white rounded-lg shadow-card p-2.5 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm text-ink-900 truncate">{order.clientName}</div>
              <div className="text-xs text-ink-500">{order.amount.toLocaleString("fr-FR")} F · {order.paymentMethod}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[1001]">
          {done ? (
            <div className={cn(
              "bg-white rounded-t-xl p-4 text-center space-y-2",
              "animate-in zoom-in-50 duration-500"
            )}>
              <div className="text-3xl">✅</div>
              <div className="font-display font-bold text-ink-900">Livraison confirmée !</div>
            </div>
          ) : (
            <DeliveryStepperCard step={step} onAdvance={() => {}} disabled />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add components/demo/DriverPanel.tsx
git commit -m "feat(demo): DriverPanel with synced map and stepper"
```

---

## Task 6 — Page `/demo` assemblage

**Files:**
- Create: `app/demo/page.tsx`

- [ ] **Créer le dossier et la page**

```bash
mkdir -p /home/papa-ndiaye-diao/yonne/app/demo
```

```tsx
// app/demo/page.tsx
"use client";
import { useEffect } from "react";
import { DemoTopBar } from "@/components/demo/DemoTopBar";
import { MerchantPanel } from "@/components/demo/MerchantPanel";
import { DriverPanel } from "@/components/demo/DriverPanel";
import { useDemoSim } from "@/lib/store/demo-sim";

export default function DemoPage() {
  const { tick, running, reset } = useDemoSim();

  useEffect(() => {
    const timeout = setTimeout(() => {
      useDemoSim.getState().start();
    }, 1500);
    return () => {
      clearTimeout(timeout);
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [running, tick]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-cream-50">
      <DemoTopBar />
      <div className="flex flex-1 overflow-hidden">
        <MerchantPanel />
        <DriverPanel />
      </div>
    </div>
  );
}
```

- [ ] **Vérifier le build complet**

```bash
cd /home/papa-ndiaye-diao/yonne && export PATH="$HOME/.local/share/npm-global/bin:$PATH" && pnpm build 2>&1 | grep -E "(error|warning|✓|Route)" | head -30
```

Attendu : `✓ Compiled successfully`, route `/demo` présente dans le tableau.

- [ ] **Commit final + tag**

```bash
git add app/demo/ components/demo/
git commit -m "feat(demo): split-screen demo page with synced merchant and driver views"
git tag v0.3.0-tranche-C
```

---

## Self-Review

**Spec coverage :**
- ✓ Route `/demo` sans auth, plein écran → `app/demo/page.tsx`
- ✓ Store `demo-sim` avec `progress`, `running`, `tick`, `start`, `reset` → Task 1
- ✓ `setInterval` 300ms dans la page → Task 6
- ✓ `deliveryStep` calculé depuis `progress` → `stepFromProgress()` dans Tasks 4 et 5
- ✓ `driverPos` interpolé en 3 phases → `computeDriverPos()` dans Tasks 4 et 5
- ✓ `GlovoTimeline` stage calculé depuis step → `timelineStage()` dans Task 4
- ✓ `EtaBadge` remplacé par ETA inline contrôlé par `progress` → Task 4
- ✓ `DeliveryStepperCard` en mode passif → prop `disabled` → Task 2
- ✓ Démarrage automatique après 1,5s → `setTimeout` dans Task 6
- ✓ Bouton "Rejouer" → `reset()` dans `DemoTopBar` → Task 3
- ✓ Animation `zoom-in-50` à la livraison → Task 5

**Cohérence des types :**
- `computeDriverPos` retourne `[number, number]` → compatible avec `Pin.lat/lng` et `DakarMap.center`
- `stepFromProgress` retourne `DeliveryStep` (importé depuis `lib/store/driver`) → compatible avec `DeliveryStepperCard.step` et `timelineStage()`
- `lerp` définie localement dans Tasks 4 et 5 (identique dans les deux — pas de shared util nécessaire, DRY respecté au niveau du plan)
- `useDemoSim.getState().start()` dans le `useEffect` de Task 6 — pattern valide avec Zustand v5

**Placeholders :** Aucun.
