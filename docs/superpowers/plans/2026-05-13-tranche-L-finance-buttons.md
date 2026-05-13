# Tranche L — Boutons Finance Fonctionnels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher les boutons Verser/Approuver/Rejeter de la page admin Finance sur des toasts Sonner + retrait de l'item de la liste.

**Architecture:** La page admin Finance devient Client Component avec `useState` local initialisé depuis les mock data. Le `<Toaster />` est monté dans le root layout (il manquait — aucun toast n'apparaissait nulle part dans l'app). Deux fichiers touchés.

**Tech Stack:** Next.js 14 App Router, React useState, Sonner (sonner + `components/ui/sonner.tsx`), TypeScript strict, Tailwind CSS

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/layout.tsx` | Modifier — ajouter `<Toaster />` dans `<body>` |
| `app/(admin)/admin/finance/page.tsx` | Modifier — `"use client"` + `useState` + toast handlers + empty states |

---

## Task 1 : Monter `<Toaster />` dans le root layout

**Files:**
- Modify: `app/layout.tsx`

Le `Toaster` de Sonner est défini dans `components/ui/sonner.tsx` mais jamais monté — les toasts ne s'affichent nulle part dans l'app.

Contenu actuel de `app/layout.tsx` :
```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "yonne · livraison intelligente Sénégal",
  description: "Plateforme SaaS de livraison last-mile pour le Sénégal et l'Afrique de l'Ouest. Surpasser Glovo grâce à 10 fonctionnalités sans équivalent.",
  themeColor: "#FAF7F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 1 : Ajouter `<Toaster />` dans `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "yonne · livraison intelligente Sénégal",
  description: "Plateforme SaaS de livraison last-mile pour le Sénégal et l'Afrique de l'Ouest. Surpasser Glovo grâce à 10 fonctionnalités sans équivalent.",
  themeColor: "#FAF7F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add app/layout.tsx && git commit -m "fix: monter Toaster Sonner dans le root layout"
```

---

## Task 2 : Convertir la page Finance + brancher les boutons

**Files:**
- Modify: `app/(admin)/admin/finance/page.tsx`

La page passe de Server Component à Client Component. `referralPrizes` et `advanceRequests` sont copiés dans du `useState` local. Les boutons déclenchent un toast et retirent l'item de la liste.

Structure des types (depuis `lib/mock-data/finance.ts`) :
```ts
interface ReferralPrize   { referrerName: string; refereeName: string; prizeAmount: number; }
interface AdvanceRequest  { id: string; driverName: string; earningsToday: number; requestedAmount: number; fee: number; }
```

- [ ] **Step 1 : Remplacer `app/(admin)/admin/finance/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/StatCard";
import {
  transactions, waveTotal, orangeTotal, cashTotal,
  tontineWeek, tontineMembers, tontineBeneficiary, tontineNextBeneficiary,
  referralPrizes as seedPrizes, advanceRequests as seedAdvances,
  insuranceCount, insuranceRevenue, insuranceMargin,
} from "@/lib/mock-data/finance";
import type { ReferralPrize, AdvanceRequest } from "@/lib/mock-data/finance";
import { CheckCircle2, Circle } from "lucide-react";

function fmt(n: number) { return n.toLocaleString("fr-FR"); }

export default function FinancePage() {
  const totalDay = waveTotal + orangeTotal + cashTotal;
  const [prizes, setPrizes] = useState<ReferralPrize[]>(seedPrizes);
  const [advances, setAdvances] = useState<AdvanceRequest[]>(seedAdvances);

  function handleVerser(idx: number) {
    const p = prizes[idx];
    toast.success(`Prime versée à ${p.referrerName} — ${fmt(p.prizeAmount)} F`);
    setPrizes((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleApprouver(id: string) {
    const r = advances.find((a) => a.id === id);
    if (r) toast.success(`Avance approuvée pour ${r.driverName} — ${fmt(r.requestedAmount)} F`);
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  }

  function handleRejeter(id: string) {
    const r = advances.find((a) => a.id === id);
    if (r) toast.error(`Demande rejetée — ${r.driverName}`);
    setAdvances((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-display font-bold text-ink-900">Finance</h1>
        <p className="text-sm text-ink-500 mt-1">Vue d'ensemble — aujourd'hui</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard title="💳 Réconciliation" className="xl:col-span-1">
          <div className="text-3xl font-display font-bold text-ink-900 tabular-nums mb-4">{fmt(totalDay)} F</div>
          <div className="space-y-2">
            {[
              { label: "Wave",         value: waveTotal,   color: "bg-emerald-500/15 text-emerald-700" },
              { label: "Orange Money", value: orangeTotal, color: "bg-orange-100 text-orange-700" },
              { label: "Cash",         value: cashTotal,   color: "bg-cream-200 text-ink-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                <span className="font-mono text-sm font-medium">{fmt(value)} F</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-cream-100 pt-3 max-h-32 overflow-y-auto space-y-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between text-xs text-ink-500">
                <span className="font-mono">{t.id}</span>
                <span>{t.driverName.split(" ")[0]}</span>
                <span className="font-medium text-ink-900">{fmt(t.amount)} F</span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="🤝 Parrainage livreurs">
          <div className="text-sm text-ink-500 mb-3">
            {prizes.length} primes à verser · {fmt(prizes.length * 5_000)} F
          </div>
          {prizes.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune prime en attente</p>
          ) : (
            <div className="space-y-2">
              {prizes.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-cream-50 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{p.referrerName}</div>
                    <div className="text-xs text-ink-500">Filleul : {p.refereeName} · 10ᵉ livraison ✓</div>
                  </div>
                  <button
                    onClick={() => handleVerser(i)}
                    className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    Verser {fmt(p.prizeAmount)} F
                  </button>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="🏦 Tontine numérique">
          <div className="mb-3">
            <div className="text-xs text-ink-500">Semaine {tontineWeek} / 52 · Cotisation : 2 000 F/membre</div>
            <div className="mt-2 text-sm">
              <span className="text-ink-500">Bénéficiaire actuel :</span>{" "}
              <strong className="text-ink-900">{tontineBeneficiary}</strong>
            </div>
            <div className="text-sm">
              <span className="text-ink-500">Prochain :</span>{" "}
              <span className="text-ink-700">{tontineNextBeneficiary}</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            {tontineMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {m.paid
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <Circle className="w-4 h-4 text-cream-200 shrink-0" />}
                <span className={m.paid ? "text-ink-700" : "text-ink-400"}>{m.name}</span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="💵 Avances sur salaire" className="md:col-span-2 xl:col-span-2">
          <div className="text-sm text-ink-500 mb-3">
            {advances.length} demandes · Total : {fmt(advances.reduce((s, r) => s + r.requestedAmount, 0))} F
          </div>
          {advances.length === 0 ? (
            <p className="text-sm text-ink-500">Aucune demande en attente</p>
          ) : (
            <div className="space-y-3">
              {advances.map(r => (
                <div key={r.id} className="flex items-center gap-4 bg-cream-50 rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <div className="font-medium text-ink-900 text-sm">{r.driverName}</div>
                    <div className="text-xs text-ink-500">
                      Gains du jour : {fmt(r.earningsToday)} F · Demande : {fmt(r.requestedAmount)} F · Frais : {fmt(r.fee)} F
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprouver(r.id)}
                      className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >Approuver</button>
                    <button
                      onClick={() => handleRejeter(r.id)}
                      className="text-xs bg-cream-200 text-ink-700 px-3 py-1.5 rounded-lg hover:bg-cream-300 transition-colors"
                    >Rejeter</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="🛡️ Assurance colis">
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">{insuranceCount}</div>
              <div className="text-xs text-ink-500">assurances actives aujourd'hui</div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Primes collectées</span>
                <span className="font-medium">{fmt(insuranceRevenue)} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Marge nette (82%)</span>
                <span className="font-bold text-emerald-600">{fmt(insuranceMargin)} F</span>
              </div>
            </div>
          </div>
        </StatCard>
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
cd /home/papa-ndiaye-diao/yonne && git add "app/(admin)/admin/finance/page.tsx" && git commit -m "feat(finance): boutons Verser/Approuver/Rejeter avec toast + retrait liste" && git tag v1.2.0-tranche-L
```
