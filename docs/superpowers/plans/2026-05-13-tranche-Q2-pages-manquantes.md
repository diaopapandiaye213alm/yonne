# Tranche Q2 — Pages Manquantes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer les 3 pages manquantes : 404 brandée, landing page publique à `/`, et historique livreur.

**Architecture:** 3 nouveaux fichiers + modification du sidebar driver pour ajouter le lien historique.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/not-found.tsx` | Créer — page 404 brandée |
| `app/page.tsx` | Modifier — landing page publique (remplace le redirect) |
| `app/(driver)/driver/historique/page.tsx` | Créer — historique des livraisons |
| `components/layout/DriverBottomNav.tsx` | Modifier — ajouter lien historique |

---

## Task 1 : Page 404 brandée

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1 : Créer `app/not-found.tsx`**

```tsx
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <Wordmark size="lg" />
      </div>

      {/* Illustration numérique */}
      <div className="relative mb-8">
        <div className="text-[10rem] font-display font-bold text-cream-200 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl">🛵</div>
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">
        Cette page est introuvable
      </h1>
      <p className="text-ink-500 text-sm max-w-xs mb-8">
        Notre livreur a cherché partout — cette page n&apos;existe pas ou a été déplacée.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          <Home className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <button
          onClick={() => history.back()}
          className="inline-flex items-center gap-2 bg-white hover:bg-cream-100 text-ink-700 border border-cream-200 rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Page précédente
        </button>
      </div>

      <div className="mt-12 text-xs text-ink-500/50">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </div>
    </main>
  );
}
```

Note: le bouton "Page précédente" nécessite `"use client"` pour `history.back()`. Transformer en composant client ou utiliser un `<Link href="javascript:history.back()">` — **préférer** `"use client"` + `useRouter().back()`.

Version correcte avec client :

```tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <Wordmark size="lg" />
      </div>

      <div className="relative mb-8">
        <div className="text-[9rem] font-display font-bold text-cream-200 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl animate-bounce">🛵</div>
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">
        Cette page est introuvable
      </h1>
      <p className="text-ink-500 text-sm max-w-xs mb-8">
        Notre livreur a cherché partout — cette page n&apos;existe pas ou a été déplacée.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          <Home className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-white hover:bg-cream-100 text-ink-700 border border-cream-200 rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Page précédente
        </button>
      </div>

      <div className="mt-12 text-xs text-ink-500/50">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </div>
    </main>
  );
}
```

- [ ] **Step 2 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add app/not-found.tsx && git commit -m "feat(404): page not-found brandée avec animation livreur"
```

---

## Task 2 : Landing page publique `/`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1 : Remplacer `app/page.tsx`**

```tsx
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Store, Bike, BarChart3, ChevronRight, CheckCircle2, Zap } from "lucide-react";

const personas = [
  {
    icon: Store,
    role: "Commerçants",
    desc: "Créez et suivez vos livraisons en temps réel. Partagez le suivi par WhatsApp.",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    iconBg: "bg-emerald-500/20",
  },
  {
    icon: Bike,
    role: "Livreurs",
    desc: "Recevez vos missions, naviguez avec la carte et gérez vos gains en un clic.",
    color: "bg-gold-500/10 border-gold-500/20 text-gold-500",
    iconBg: "bg-gold-500/20",
  },
  {
    icon: BarChart3,
    role: "Administrateurs",
    desc: "Pilotez la plateforme avec des analytics avancés, le surge pricing et l'IA.",
    color: "bg-ink-500/10 border-ink-500/20 text-ink-700",
    iconBg: "bg-ink-500/10",
  },
] as const;

const stats = [
  { value: "147", label: "commandes / jour" },
  { value: "41",  label: "livreurs actifs" },
  { value: "4,7★", label: "note moyenne" },
  { value: "× 1.4", label: "surge Tabaski" },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">

      {/* ── Topbar ── */}
      <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
        <Wordmark size="md" />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-display font-bold transition-colors shadow-glow-emerald"
        >
          Se connecter <ChevronRight className="w-4 h-4" />
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-dots)" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 text-gold-300 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Tabaski dans 7 jours — plan d&apos;action IA prêt
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
            Livraison intelligente<br />
            <span className="text-gold-400">au cœur du Sénégal</span>
          </h1>

          <p className="mt-6 text-emerald-200/80 text-lg max-w-xl mx-auto leading-relaxed">
            La plateforme qui connecte commerçants, livreurs et clients à Dakar et au-delà — avec suivi GPS en direct et partage WhatsApp.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 py-3 font-display font-bold text-base transition-colors shadow-glow-emerald"
            >
              Accéder à la plateforme <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-display font-bold text-white tabular-nums">{value}</div>
                <div className="text-xs text-emerald-300/70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personas ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-bold text-ink-900 text-center mb-10">
          Une plateforme pour tous
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map(({ icon: Icon, role, desc, color, iconBg }) => (
            <div key={role} className={`rounded-xl border p-6 ${color} bg-white`}>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">{role}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-t border-cream-200 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-display font-bold text-ink-900 text-center mb-8">
            Pourquoi choisir YONNE ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Suivi GPS en temps réel partagé par WhatsApp",
              "Surge pricing automatique géré par l'IA",
              "Gestion Tabaski avec pic de demande × 3.2",
              "Score IA pour chaque livreur",
              "Paiement Wave · Orange Money · Cash",
              "Interface optimisée mobile pour les livreurs",
            ].map(f => (
              <div key={f} className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-ink-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-emerald-900 py-12 px-6 text-center mt-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Prêt à transformer vos livraisons ?
        </h2>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-ink-900 rounded-lg px-6 py-3 font-display font-bold text-base transition-colors"
        >
          Commencer maintenant <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="bg-emerald-900 border-t border-emerald-800 py-4 px-6 text-center text-xs text-emerald-500/50">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </footer>
    </div>
  );
}
```

- [ ] **Step 2 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add app/page.tsx && git commit -m "feat(landing): page publique YONNE — hero, personas, features, CTA"
```

---

## Task 3 : Driver historique + sidebar

**Files:**
- Create: `app/(driver)/driver/historique/page.tsx`
- Modify: `components/layout/DriverBottomNav.tsx`

- [ ] **Step 1 : Trouver le fichier DriverBottomNav**

```bash
find /home/papa-ndiaye-diao/yonne/components -name "*Nav*" -o -name "*Bottom*" | head -10
find /home/papa-ndiaye-diao/yonne/app -path "*/driver/*layout*" | head -5
```

- [ ] **Step 2 : Lire le layout driver pour comprendre la navigation**

```bash
find /home/papa-ndiaye-diao/yonne/app -path "*/driver*" -name "layout.tsx" | head -3
```

Lire le fichier trouvé pour comprendre comment la navigation est structurée. Puis adapter l'ajout du lien historique selon le pattern existant.

- [ ] **Step 3 : Créer `app/(driver)/driver/historique/page.tsx`**

```tsx
import { drivers } from "@/lib/mock-data/drivers";
import { orders } from "@/lib/mock-data/orders";
import { History, TrendingUp, Package } from "lucide-react";

const demo = drivers[0];

const driverOrders = orders
  .filter(o => o.driverId === demo.id && o.status === "livrée")
  .slice(0, 20);

const totalEarnings = driverOrders.reduce((sum, o) => sum + Math.round(o.amount * 0.25), 0);
const avgPerOrder   = driverOrders.length > 0 ? Math.round(totalEarnings / driverOrders.length) : 0;

const weeklyData = [
  { day: "Lun", orders: 8,  earnings: 12000 },
  { day: "Mar", orders: 11, earnings: 18500 },
  { day: "Mer", orders: 14, earnings: 22000 },
  { day: "Jeu", orders: 9,  earnings: 15000 },
  { day: "Ven", orders: 17, earnings: 28000 },
  { day: "Sam", orders: 20, earnings: 31000 },
  { day: "Dim", orders: demo.ordersToday, earnings: demo.earningsToday },
];
const maxEarning = Math.max(...weeklyData.map(w => w.earnings));

export default function HistoriquePage() {
  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900">Historique</h1>
        <p className="text-xs text-ink-500 mt-0.5">Vos 20 dernières livraisons</p>
      </div>

      {/* KPI résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <History className="w-4 h-4 text-ink-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-ink-900">{driverOrders.length}</div>
          <div className="text-xs text-ink-500">Livraisons</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-lg text-emerald-500">
            {totalEarnings.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F total</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3 text-center">
          <Package className="w-4 h-4 text-gold-500 mx-auto mb-1" />
          <div className="font-mono font-bold text-xl text-gold-500">
            {avgPerOrder.toLocaleString("fr-FR")}
          </div>
          <div className="text-xs text-ink-500">F / course</div>
        </div>
      </div>

      {/* Graphe semaine */}
      <div className="bg-white rounded-lg border border-cream-200 p-4">
        <h2 className="font-display font-semibold text-ink-900 mb-3 text-sm">Cette semaine</h2>
        <div className="flex items-end gap-1.5 h-20">
          {weeklyData.map(({ day, earnings }, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all ${i === weeklyData.length - 1 ? "bg-emerald-500" : "bg-cream-200 hover:bg-gold-500/50"}`}
                style={{ height: `${Math.round((earnings / maxEarning) * 72)}px` }}
              />
              <span className="text-xs text-ink-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste livraisons */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm">Dernières livraisons</h2>
          <span className="text-xs text-ink-500">{driverOrders.length} commandes</span>
        </div>
        {driverOrders.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-500">
            Aucune livraison enregistrée.
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {driverOrders.map(o => {
              const gain = Math.round(o.amount * 0.25);
              return (
                <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-cream-50 transition-colors">
                  <div>
                    <div className="font-mono text-xs text-emerald-500">{o.id}</div>
                    <div className="text-sm text-ink-700">{o.clientName}</div>
                    <div className="text-xs text-ink-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-500 text-sm">
                      +{gain.toLocaleString("fr-FR")} F
                    </div>
                    <div className="text-xs text-ink-500">{o.paymentMethod}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Ajouter le lien Historique dans la navigation driver**

Lire le layout driver trouvé à l'étape 1 et ajouter le lien `/driver/historique` avec l'icône `History` selon le pattern existant.

- [ ] **Step 5 : Build + commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(driver)/driver/historique/page.tsx" && git commit -m "feat(driver): page historique — livraisons, gains semaine, graphe" && git tag v2.1.0-tranche-Q2
```
