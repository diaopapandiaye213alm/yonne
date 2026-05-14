# Tranche Q1 — Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre l'app YONNE visuellement spectaculaire — animations d'entrée, login split-layout, KPI cards avec hover/accent, hero gradient admin, podium leaderboard, PageWrapper.

**Architecture:** 8 fichiers modifiés + 1 nouveau composant (`PageWrapper`). Tout s'appuie sur `tailwindcss-animate` déjà installé et la palette Téranga existante.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, tailwindcss-animate

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `tailwind.config.ts` | Modifier — nouveaux keyframes fadeInUp, shimmer |
| `app/globals.css` | Modifier — classe `.skeleton`, animation entrée |
| `components/ui/PageWrapper.tsx` | Créer — wrapper d'animation d'entrée |
| `app/(auth)/login/page.tsx` | Modifier — split layout spectaculaire |
| `components/kpi/KpiCard.tsx` | Modifier — hover élévation + accent bar |
| `components/kpi/DriverLeaderboard.tsx` | Modifier — podium or/argent/bronze |
| `app/(admin)/admin/page.tsx` | Modifier — hero gradient + live dot |
| `app/(merchant)/merchant/page.tsx` | Modifier — greeting header gradient |

---

## Task 1 : Foundations — tailwind.config.ts + globals.css + PageWrapper

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Create: `components/ui/PageWrapper.tsx`

- [ ] **Step 1 : Ajouter keyframes dans `tailwind.config.ts`**

Remplacer le bloc `keyframes` et `animation` par :

```ts
keyframes: {
  pulseGold: {
    "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,165,116,0.5)" },
    "50%": { boxShadow: "0 0 0 8px rgba(212,165,116,0)" },
  },
  fadeInUp: {
    "0%": { opacity: "0", transform: "translateY(12px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  shimmer: {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
  livePulse: {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.3" },
  },
},
animation: {
  "pulse-gold":  "pulseGold 2s ease-in-out infinite",
  "fade-in-up":  "fadeInUp 0.4s ease-out both",
  shimmer:       "shimmer 1.8s linear infinite",
  "live-pulse":  "livePulse 1.4s ease-in-out infinite",
},
```

- [ ] **Step 2 : Ajouter classes utilitaires dans `app/globals.css`**

Ajouter à la fin du fichier (après `::selection`) :

```css
/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(90deg, #E8DFD0 25%, #F5EFE0 50%, #E8DFD0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s linear infinite;
  border-radius: 6px;
}

/* Staggered card entrance */
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 60ms; }
.stagger-3 { animation-delay: 120ms; }
.stagger-4 { animation-delay: 180ms; }
```

- [ ] **Step 3 : Créer `components/ui/PageWrapper.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function PageWrapper({ className, children }: Props) {
  return (
    <div className={cn("animate-fade-in-up fill-mode-both", className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4 : Build**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi.

- [ ] **Step 5 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add tailwind.config.ts app/globals.css components/ui/PageWrapper.tsx && git commit -m "feat(design): animation foundations — keyframes fadeInUp/shimmer/livePulse + PageWrapper"
```

---

## Task 2 : Login page — split layout spectaculaire

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1 : Remplacer `app/(auth)/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

const features = [
  "147 commandes traitées aujourd'hui",
  "28 livreurs actifs en temps réel",
  "Suivi GPS partagé via WhatsApp",
];

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) { setError("Email ou mot de passe invalide."); return; }
      const { redirect } = await res.json();
      router.push(redirect ?? "/");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Panneau gauche — brand ── */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-10 relative overflow-hidden">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-login" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-login)" />
          </svg>
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-none">
          <Wordmark size="lg" variant="dark" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12">
          <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse" />
            En direct · Dakar
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Livraison intelligente<br />au cœur du Sénégal
          </h2>
          <p className="mt-4 text-emerald-200/70 text-base leading-relaxed max-w-sm">
            La plateforme qui connecte commerçants, livreurs et clients — partout à Dakar et au-delà.
          </p>

          <ul className="mt-8 space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-emerald-100/90 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-emerald-500/50 text-xs">
          © 2026 YONNE · Sénégal
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex items-center justify-center p-8 bg-cream-50">
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Logo mobile uniquement */}
          <div className="lg:hidden text-center mb-8">
            <Wordmark size="xl" />
            <p className="mt-2 text-ink-500 text-sm">Livraison intelligente · Sénégal</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-ink-900">Connexion</h1>
            <p className="text-ink-500 text-sm mt-1">Accédez à votre espace YONNE</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@yonne.sn" required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald font-display font-bold text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion…
                </span>
              ) : "Se connecter"}
            </Button>

            <button type="button" className="block w-full text-center text-xs text-ink-500 hover:text-ink-700 transition-colors">
              Mot de passe oublié ?
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Authentification 2FA SMS activée
          </div>

          <details className="mt-6 text-xs text-ink-500 bg-white rounded-lg p-3 border border-cream-200 shadow-sm">
            <summary className="cursor-pointer font-medium text-ink-700">Comptes de démo</summary>
            <ul className="mt-2 space-y-1 font-mono text-ink-500">
              <li>admin@yonne.sn / Admin123!</li>
              <li>boutique.plateau@gmail.com / Demo123!</li>
              <li>livreur.dakar@yonne.sn / Demo123!</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(auth)/login/page.tsx" && git commit -m "feat(login): split layout spectaculaire — brand panel gauche + form panel droit"
```

---

## Task 3 : KpiCard + DriverLeaderboard polish

**Files:**
- Modify: `components/kpi/KpiCard.tsx`
- Modify: `components/kpi/DriverLeaderboard.tsx`

- [ ] **Step 1 : Remplacer `components/kpi/KpiCard.tsx`**

```tsx
import { RevenueSparkline } from "./RevenueSparkline";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  hint?: string;
  spark?: number[];
  highlight?: boolean;
  accent?: "emerald" | "gold" | "ink";
}

const accentClasses = {
  emerald: "bg-emerald-500",
  gold:    "bg-gold-500",
  ink:     "bg-ink-500",
} as const;

export function KpiCard({ label, value, delta, hint, spark, highlight, accent = "emerald" }: Props) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-card p-5 border border-cream-200 group",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      highlight && "ring-2 ring-gold-500 shadow-glow"
    )}>
      <div className={cn("h-0.5 w-8 rounded-full mb-4", accentClasses[accent])} />
      <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-display font-bold text-ink-900 tabular-nums">{value}</div>
        {delta && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-0.5",
            delta.direction === "up" ? "text-emerald-500" : "text-danger"
          )}>
            {delta.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
      {spark && <div className="mt-3"><RevenueSparkline values={spark} /></div>}
    </div>
  );
}
```

- [ ] **Step 2 : Remplacer `components/kpi/DriverLeaderboard.tsx`**

```tsx
import Image from "next/image";
import { topDriversToday, avatarUrl } from "@/lib/mock-data/drivers";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const rankMedal = ["🥇", "🥈", "🥉"] as const;

const rankRing = [
  "ring-2 ring-gold-500/60",
  "ring-2 ring-ink-500/30",
  "ring-2 ring-amber-700/30",
] as const;

const rankNumStyle = [
  "bg-gold-500/20 border border-gold-500/50 text-gold-500",
  "bg-ink-500/10 border border-ink-500/20 text-ink-500",
  "bg-amber-700/10 border border-amber-700/20 text-amber-700",
] as const;

export function DriverLeaderboard() {
  const top = topDriversToday(5);
  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-ink-900">Top livreurs · aujourd&apos;hui</h3>
        <button className="text-xs text-emerald-500 hover:underline transition-colors">Voir tous</button>
      </div>
      <ol className="space-y-3">
        {top.map((d, i) => (
          <li key={d.id} className="flex items-center gap-3 group">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0",
              i < 3 ? rankNumStyle[i] : "text-ink-500"
            )}>
              {i < 3 ? rankMedal[i] : i + 1}
            </div>
            <Image
              src={avatarUrl(d)} alt={d.name}
              width={i === 0 ? 40 : 34} height={i === 0 ? 40 : 34}
              unoptimized
              className={cn(
                "rounded-full bg-cream-100 transition-transform group-hover:scale-105",
                i < 3 && rankRing[i]
              )}
            />
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-ink-900 truncate",
                i === 0 ? "text-sm font-semibold" : "text-sm"
              )}>{d.name}</div>
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                {d.rating.toFixed(1)}
                <span className="mx-1">·</span>
                {d.ordersToday} courses
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={cn(
                "font-display font-bold tabular-nums",
                i === 0 ? "text-base text-emerald-600" : "text-sm text-ink-900"
              )}>
                {d.earningsToday.toLocaleString("fr-FR")} F
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 3 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add components/kpi/KpiCard.tsx components/kpi/DriverLeaderboard.tsx && git commit -m "feat(design): KpiCard hover/accent-bar + DriverLeaderboard podium médailles"
```

---

## Task 4 : Admin dashboard hero gradient + merchant greeting

**Files:**
- Modify: `app/(admin)/admin/page.tsx`
- Modify: `app/(merchant)/merchant/page.tsx`

- [ ] **Step 1 : Remplacer `app/(admin)/admin/page.tsx`**

```tsx
import Link from "next/link";
import { KpiCard } from "@/components/kpi/KpiCard";
import { DriverLeaderboard } from "@/components/kpi/DriverLeaderboard";
import DakarMap from "@/components/map/DakarMapClient";
import { drivers } from "@/lib/mock-data/drivers";
import { activeOrders } from "@/lib/mock-data/orders";
import { landmarks } from "@/lib/mock-data/landmarks";
import { Sparkles, ChevronRight } from "lucide-react";

const sparkRevenue = [620, 705, 690, 760, 810, 805, 847];
const sparkOrders  = [110, 122, 118, 129, 138, 141, 147];

export default function AdminHomePage() {
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
        {/* Dot pattern */}
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
        {/* Glow orb */}
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse shrink-0" />
              En direct
            </div>
            <div className="text-2xl font-display font-bold text-white capitalize">{dateStr}</div>
            <div className="mt-1 text-emerald-200/60 text-sm">
              {onlineDrivers.length} livreurs actifs · {activeOrders.length} commandes en cours
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
          <KpiCard label="Revenus aujourd'hui" value="847 200 F" delta={{ value: "23 %", direction: "up" }} hint="vs hier" spark={sparkRevenue} accent="emerald" />
        </div>
        <div className="stagger-2 animate-fade-in-up">
          <KpiCard label="Commandes" value="147" delta={{ value: "12 actives", direction: "up" }} spark={sparkOrders} accent="gold" />
        </div>
        <div className="stagger-3 animate-fade-in-up">
          <KpiCard label="Livreurs en ligne" value="28 / 41" hint="3 en pause prière" accent="ink" />
        </div>
        <div className="stagger-4 animate-fade-in-up">
          <KpiCard label="Note moyenne" value="4,7 ★" hint="89 avis aujourd'hui" accent="gold" highlight />
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

- [ ] **Step 2 : Mettre à jour `app/(merchant)/merchant/page.tsx`**

Remplacer le `<div>` d'en-tête (lignes 37-43) par :

```tsx
{/* ── Greeting header ── */}
<div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 shadow-glow-emerald">
  <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="merchant-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#merchant-dots)" />
    </svg>
  </div>
  <div className="relative">
    <div className="flex items-center gap-2 text-emerald-300/60 text-xs font-medium uppercase tracking-widest mb-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
      {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
    </div>
    <h1 className="text-2xl font-display font-bold text-white">Bonjour, {merchant.name} 👋</h1>
    <p className="text-emerald-200/60 text-sm mt-0.5">Plan {merchant.plan} · Commission {merchant.plan === "Premium" ? "12%" : "15%"}</p>
  </div>
</div>
```

Remplacer aussi le `<div className="p-6 max-w-4xl mx-auto space-y-6">` par `<div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in-up">`.

Supprimer les lignes `<div>` (h1 + p) du code original (elles sont maintenant dans le hero).

- [ ] **Step 3 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(admin)/admin/page.tsx" "app/(merchant)/merchant/page.tsx" && git commit -m "feat(design): hero gradient admin + greeting header marchand" && git tag v2.0.0-tranche-Q1
```
