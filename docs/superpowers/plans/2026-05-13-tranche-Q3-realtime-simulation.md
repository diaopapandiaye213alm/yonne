# Tranche Q3 — Simulation Temps Réel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire vivre le dashboard admin avec des KPIs qui s'incrémentent automatiquement toutes les 30s et des notifications qui arrivent périodiquement.

**Architecture:** Hook `useLiveKpis` + Zustand live store + dashboard admin client. Le dashboard passe de server component à client component.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Zustand, React hooks (useEffect, useInterval pattern)

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/hooks/useLiveKpis.ts` | Créer — hook de simulation KPIs live |
| `app/(admin)/admin/page.tsx` | Modifier — passer en client + utiliser live KPIs |
| `lib/store/notifications.ts` | Modifier — ajouter simulation de nouvelles notifs |
| `components/layout/Topbar.tsx` | Modifier — breadcrumb avec indicateur live |

---

## Task 1 : Hook useLiveKpis

**Files:**
- Create: `lib/hooks/useLiveKpis.ts`

- [ ] **Step 1 : Créer `lib/hooks/useLiveKpis.ts`**

```ts
"use client";
import { useState, useEffect } from "react";

interface LiveKpis {
  revenue: number;
  orders: number;
  onlineDrivers: number;
  rating: number;
  sparkRevenue: number[];
  sparkOrders: number[];
}

const BASE: LiveKpis = {
  revenue:       847200,
  orders:        147,
  onlineDrivers: 28,
  rating:        4.7,
  sparkRevenue: [620, 705, 690, 760, 810, 805, 847],
  sparkOrders:  [110, 122, 118, 129, 138, 141, 147],
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useLiveKpis(intervalMs = 28000): LiveKpis {
  const [kpis, setKpis] = useState<LiveKpis>(BASE);

  useEffect(() => {
    const id = setInterval(() => {
      setKpis(prev => {
        const newOrders  = prev.orders + randInt(1, 3);
        const newRevenue = prev.revenue + randInt(3000, 12000);
        const newOnline  = Math.max(20, Math.min(41, prev.onlineDrivers + randInt(-1, 2)));

        const newSparkOrders  = [...prev.sparkOrders.slice(1), newOrders];
        const newSparkRevenue = [...prev.sparkRevenue.slice(1), Math.round(newRevenue / 1000)];

        return {
          revenue:       newRevenue,
          orders:        newOrders,
          onlineDrivers: newOnline,
          rating:        prev.rating,
          sparkRevenue:  newSparkRevenue,
          sparkOrders:   newSparkOrders,
        };
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return kpis;
}
```

- [ ] **Step 2 : Build pour vérifier**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add lib/hooks/useLiveKpis.ts && git commit -m "feat(realtime): hook useLiveKpis — simulation incrémentale toutes les 28s"
```

---

## Task 2 : Admin dashboard — client + live KPIs

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

Le dashboard admin est actuellement un server component. Il faut le passer en client component pour utiliser le hook.

- [ ] **Step 1 : Remplacer `app/(admin)/admin/page.tsx`**

```tsx
"use client";
import Link from "next/link";
import { KpiCard } from "@/components/kpi/KpiCard";
import { DriverLeaderboard } from "@/components/kpi/DriverLeaderboard";
import DakarMap from "@/components/map/DakarMapClient";
import { drivers } from "@/lib/mock-data/drivers";
import { activeOrders } from "@/lib/mock-data/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useLiveKpis } from "@/lib/hooks/useLiveKpis";
import { Sparkles, ChevronRight } from "lucide-react";

export default function AdminHomePage() {
  const kpis = useLiveKpis(28000);

  const onlineDrivers = drivers.filter(d => d.online);
  const driverPins = onlineDrivers.slice(0, 15).map(d => ({ id: d.id, lat: d.lat, lng: d.lng, kind: "driver" as const }));
  const orderPins = activeOrders.map(o => {
    const lm = landmarks.find(l => l.id === o.landmarkId)!;
    return { id: o.id, lat: lm.lat, lng: lm.lng, kind: "order" as const };
  });

  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">

      {/* ── Hero gradient ── */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600 p-6 shadow-glow-emerald">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse shrink-0" />
              En direct
            </div>
            <div className="text-2xl font-display font-bold text-white capitalize">{dateStr}</div>
            <div className="mt-1 text-emerald-200/60 text-sm">
              {kpis.onlineDrivers} livreurs actifs · {kpis.orders} commandes aujourd&apos;hui
            </div>
          </div>

          <Link
            href="/admin/tabaski"
            className="flex items-center gap-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 hover:text-gold-200 rounded-lg px-4 py-2.5 text-sm font-medium transition-all shrink-0 w-fit"
          >
            <Sparkles className="w-4 h-4" />
            Tabaski J-7 — Plan d&apos;action prêt
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stagger-1 animate-fade-in-up">
          <KpiCard
            label="Revenus aujourd'hui"
            value={`${kpis.revenue.toLocaleString("fr-FR")} F`}
            delta={{ value: "23 %", direction: "up" }}
            hint="vs hier"
            spark={kpis.sparkRevenue}
            accent="emerald"
          />
        </div>
        <div className="stagger-2 animate-fade-in-up">
          <KpiCard
            label="Commandes"
            value={String(kpis.orders)}
            delta={{ value: "12 actives", direction: "up" }}
            spark={kpis.sparkOrders}
            accent="gold"
          />
        </div>
        <div className="stagger-3 animate-fade-in-up">
          <KpiCard
            label="Livreurs en ligne"
            value={`${kpis.onlineDrivers} / 41`}
            hint="3 en pause prière"
            accent="ink"
          />
        </div>
        <div className="stagger-4 animate-fade-in-up">
          <KpiCard
            label="Note moyenne"
            value={`${kpis.rating.toFixed(1)} ★`}
            hint="89 avis aujourd'hui"
            accent="gold"
            highlight
          />
        </div>
      </div>

      {/* ── Map + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DakarMap pins={[...driverPins, ...orderPins]} />
        </div>
        <DriverLeaderboard />
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Build + commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(admin)/admin/page.tsx" && git commit -m "feat(realtime): dashboard admin live — KPIs s'incrémentent automatiquement" && git tag v2.2.0-tranche-Q3
```
