# Tranche J — Page de suivi publique Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une page `/suivi/[id]` publique (sans auth) pour que le client puisse suivre sa livraison via le lien WhatsApp partagé par le marchand.

**Architecture:** Nouvelle route `app/suivi/[id]/page.tsx` — Client Component qui lit le statut réel depuis `useOrdersStore`. Non protégée par le middleware (le matcher ne couvre que `/admin`, `/merchant`, `/driver`). La page merchant de tracking met à jour son lien WhatsApp pour pointer vers `/suivi/[id]` au lieu de l'URL actuelle (qui nécessite une session marchande).

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, TypeScript strict, Zustand (`useOrdersStore`), Leaflet (dynamic import), Recharts-free

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/suivi/[id]/page.tsx` | Créer — page publique de suivi |
| `app/(merchant)/merchant/commande/[id]/page.tsx` | Modifier — URL WhatsApp vers `/suivi/${params.id}` |

---

## Task 1 : Créer `app/suivi/[id]/page.tsx`

**Files:**
- Create: `app/suivi/[id]/page.tsx`

**Contexte :**
- `useOrdersStore` est à `@/lib/store/orders` — expose `{ orders }`
- `OrderStatus` est à `@/lib/mock-data/orders` — type union des 5 statuts français
- `GlovoTimeline` accepte `activeStage: "created" | "assigned" | "enroute" | "delivered"`
- `EtaBadge` accepte `initialMinutes: number`
- `Wordmark` accepte `size: "sm" | "md" | "lg" | "xl"`
- `DakarMap` doit être importé en `dynamic` avec `{ ssr: false }` (Leaflet ne supporte pas SSR)
- La carte anime le livreur vers la destination avec `setInterval` toutes les 3000ms

- [ ] **Step 1 : Vérifier que le dossier `app/suivi/` n'existe pas encore**

```bash
ls /home/papa-ndiaye-diao/yonne/app/suivi 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer `app/suivi/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { useOrdersStore } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { EtaBadge } from "@/components/tracking/EtaBadge";
import { Wordmark } from "@/components/brand/Wordmark";
import { Share2 } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const STATUS_STAGE: Record<OrderStatus, "created" | "assigned" | "enroute" | "delivered"> = {
  "créée":    "created",
  "assignée": "assigned",
  "collecte": "assigned",
  "en route": "enroute",
  "livrée":   "delivered",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  "créée":    "bg-gray-100 text-gray-700",
  "assignée": "bg-blue-100 text-blue-700",
  "collecte": "bg-amber-100 text-amber-700",
  "en route": "bg-gold-500 text-ink-900",
  "livrée":   "bg-emerald-500/20 text-emerald-700",
};

export default function PublicTrackingPage({ params }: { params: { id: string } }) {
  const { orders } = useOrdersStore();
  const order = orders.find(o => o.id === params.id);
  const status: OrderStatus = order?.status ?? "en route";

  const seed = params.id.charCodeAt(params.id.length - 1);
  const onlineDrivers = useMemo(() => drivers.filter(d => d.online && !d.inPrayer), []);
  const driver = useMemo(() => onlineDrivers[seed % onlineDrivers.length], [seed, onlineDrivers]);
  const destination = useMemo(() => landmarks[seed % landmarks.length], [seed]);

  const [pos, setPos] = useState<[number, number]>([driver.lat, driver.lng]);

  useEffect(() => {
    const total = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / total);
      setPos([
        driver.lat + (destination.lat - driver.lat) * t,
        driver.lng + (destination.lng - driver.lng) * t,
      ]);
      if (t >= 1) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [driver, destination]);

  const pins = [
    { id: "drv", lat: pos[0], lng: pos[1], kind: "driver" as const },
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ];

  const waText = encodeURIComponent(
    `Suis ta livraison YONNE en temps réel 🛵 ${typeof window !== "undefined" ? window.location.href : ""}`
  );

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <header className="bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between">
        <Link href="/login"><Wordmark size="sm" /></Link>
        <div className="text-right">
          <div className="text-xs text-ink-500">Suivi de commande</div>
          <div className="font-mono text-xs text-ink-900 font-medium">{params.id}</div>
        </div>
      </header>

      <div className="w-full" style={{ height: 300 }}>
        <DakarMap
          pins={pins}
          trail={{ from: pos, to: [destination.lat, destination.lng] }}
          center={pos}
          zoom={14}
          height="300px"
        />
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[status]}`}>
            {status}
          </span>
          <EtaBadge initialMinutes={18} />
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4">
          <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">Progression</h2>
          <GlovoTimeline activeStage={STATUS_STAGE[status]} />
        </div>

        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold py-3 rounded-lg shadow-glow transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Partager ce suivi
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/suivi/[id]/page.tsx" && git commit -m "feat(tracking): page suivi publique /suivi/[id] — sans auth"
```

---

## Task 2 : Mettre à jour le lien WhatsApp dans `merchant/commande/[id]` + build + tag

**Files:**
- Modify: `app/(merchant)/merchant/commande/[id]/page.tsx`

La ligne à modifier est le `waText`. Actuellement il envoie `window.location.href` (URL merchant protégée). On la remplace par l'URL de la page publique.

Ligne actuelle (chercher dans le fichier) :
```ts
const waText = encodeURIComponent(`Suivi de ta commande YONNE 🛵 ${typeof window !== "undefined" ? window.location.href : ""}`);
```

- [ ] **Step 1 : Remplacer le `waText` dans `app/(merchant)/merchant/commande/[id]/page.tsx`**

```ts
const waText = encodeURIComponent(
  `Suis ta livraison YONNE en temps réel 🛵 ${typeof window !== "undefined" ? `${window.location.origin}/suivi/${params.id}` : ""}`
);
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
cd /home/papa-ndiaye-diao/yonne && git add "app/(merchant)/merchant/commande/[id]/page.tsx" && git commit -m "feat(tracking): lien WhatsApp → /suivi/[id] public"
cd /home/papa-ndiaye-diao/yonne && git tag v1.0.0-tranche-J
```
