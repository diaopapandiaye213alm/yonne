# YONNE Tranche A — Démo de pitch · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a frontend-only Next.js 14 demo of YONNE — 5 polished screens (Login, Admin Home, Admin Tabaski J-7, Marchand Wizard, Marchand Tracking), Téranga design system, simulated real-time, realistic Senegalese mock data.

**Architecture:** Next.js 14 App Router · TypeScript strict · Tailwind + shadcn/ui · Leaflet for maps (dynamic-imported, no SSR) · Recharts for charts · Zustand for wizard state · mock data in TypeScript files · "real-time" via `setInterval`. No backend.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui (radix), Leaflet + react-leaflet, Recharts, Zustand, lucide-react, Geist + Inter + JetBrains Mono fonts.

---

## Spec reference

The full design spec is at `docs/superpowers/specs/2026-05-06-yonne-tranche-A-pitch-demo-design.md`. Read it first.

## Working directory

All commands run from `/home/papa-ndiaye-diao/yonne/`. The spec already lives there in `docs/superpowers/`.

## Notes for the engineer

- **No automated tests.** The spec explicitly excludes them — this is a demo. Verification is visual/manual: each task ends with a "QA visuel" step (browser check) and a commit.
- **Leaflet + Next.js App Router:** map components must use `next/dynamic` with `ssr: false`, otherwise hydration breaks.
- **Real-time:** all simulated via `setInterval` inside `useEffect` with cleanup. Never leak.
- **Package manager:** use `pnpm`. Install once: `npm install -g pnpm`.
- **Dev server** runs at `http://localhost:3000` throughout. Keep it running in a separate terminal.
- **Commit after every task.** Use Conventional Commits (`feat:`, `chore:`, `style:`).

---

## Project file tree (target)

```
~/yonne/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (admin)/admin/layout.tsx
│   ├── (admin)/admin/page.tsx
│   ├── (admin)/admin/tabaski/page.tsx
│   ├── (merchant)/merchant/layout.tsx
│   ├── (merchant)/merchant/nouvelle-commande/page.tsx
│   ├── (merchant)/merchant/commande/[id]/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                            (shadcn primitives)
│   ├── brand/Wordmark.tsx
│   ├── layout/{AdminSidebar,MerchantSidebar,Topbar,LangSwitcher}.tsx
│   ├── kpi/{KpiCard,RevenueSparkline,DriverLeaderboard}.tsx
│   ├── map/{DakarMap,DriverPin,OrderMarker}.tsx
│   ├── tabaski/{J7Countdown,DemandCurve,ActionPlanCard}.tsx
│   ├── wizard/{Stepper,ClientStep,PaymentStep,DispatchStep}.tsx
│   └── tracking/{GlovoTimeline,ChatBubble,EtaBadge,DriverCard}.tsx
├── lib/
│   ├── tokens.ts
│   ├── i18n.ts
│   ├── utils.ts
│   ├── auth-mock.ts
│   ├── store/wizard.ts
│   └── mock-data/{drivers,orders,landmarks,tabaski,chat}.ts
├── public/og.png
└── package.json
```

---

## Task 1 — Bootstrap project & git

**Files:**
- Create: `~/yonne/.gitignore` (via create-next-app)
- Create: `~/yonne/package.json` (via create-next-app)
- Create: `~/yonne/tsconfig.json` (via create-next-app)

- [ ] **Step 1: Init git and ignore brainstorm artifacts**

```bash
cd ~/yonne
git init -b main
echo ".superpowers/" >> .gitignore-pre
git add .gitignore-pre docs/
git status   # should show docs/ + .gitignore-pre staged
```

- [ ] **Step 2: Bootstrap Next.js 14 in current directory**

```bash
pnpm create next-app@14 . \
  --ts --tailwind --app --eslint \
  --no-src-dir --import-alias "@/*"
```

When prompted "directory not empty", confirm `Yes`. The existing `docs/` and `.gitignore-pre` will be preserved.

- [ ] **Step 3: Merge .gitignore additions**

Append to the new `.gitignore`:
```
.superpowers/
.next/
.env.local
```
Then delete `.gitignore-pre`:
```bash
cat .gitignore-pre >> .gitignore && rm .gitignore-pre
```

- [ ] **Step 4: Verify dev server starts**

```bash
pnpm dev
```
Open `http://localhost:3000` — Next.js default page must render. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 + TypeScript + Tailwind"
```

---

## Task 2 — Install runtime dependencies

**Files:**
- Modify: `~/yonne/package.json`

- [ ] **Step 1: Install shadcn/ui CLI and init**

```bash
pnpm dlx shadcn-ui@latest init
```
Answers:
- TypeScript: yes
- Style: Default
- Base color: Stone
- CSS variables: yes
- tailwind.config.js: keep default path
- Components alias: `@/components`
- Utils alias: `@/lib/utils`
- React Server Components: yes

- [ ] **Step 2: Install shadcn primitives we need**

```bash
pnpm dlx shadcn-ui@latest add button card input label dialog switch dropdown-menu badge progress separator sonner
```

- [ ] **Step 3: Install runtime libraries**

```bash
pnpm add zustand recharts lucide-react leaflet react-leaflet
pnpm add -D @types/leaflet
```

- [ ] **Step 4: Install fonts via next/font (no install needed — built-in)**

We'll use `next/font/google` for Geist, Inter, JetBrains Mono in Task 4.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add shadcn/ui + leaflet + recharts + zustand"
```

---

## Task 3 — Téranga design tokens

**Files:**
- Create: `~/yonne/lib/tokens.ts`
- Modify: `~/yonne/tailwind.config.ts`
- Modify: `~/yonne/app/globals.css`

- [ ] **Step 1: Create `lib/tokens.ts`**

```ts
// lib/tokens.ts
export const colors = {
  emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
  gold:    { 400: "#D4A574", 500: "#C8924C", 600: "#A87434" },
  cream:   { 50: "#FAF7F0", 100: "#F5EFE0", 200: "#E8DFD0" },
  ink:     { 900: "#3F2A1F", 700: "#5C4536", 500: "#8B7363" },
  success: "#15803D",
  warning: "#D4A574",
  danger:  "#B43A2E",
  info:    "#3B6CA8",
} as const;

export const radii = { sm: "6px", md: "10px", lg: "14px", xl: "20px" } as const;

export const shadows = {
  card: "0 4px 14px rgba(63,42,31,0.08)",
  glow: "0 0 30px rgba(212,165,116,0.25)",
  glowEmerald: "0 0 30px rgba(21,128,61,0.18)",
} as const;
```

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
        gold:    { 400: "#D4A574", 500: "#C8924C", 600: "#A87434" },
        cream:   { 50: "#FAF7F0", 100: "#F5EFE0", 200: "#E8DFD0" },
        ink:     { 900: "#3F2A1F", 700: "#5C4536", 500: "#8B7363" },
        success: "#15803D",
        warning: "#D4A574",
        danger:  "#B43A2E",
        info:    "#3B6CA8",
        // shadcn-required (mapped to Téranga)
        background: "#FAF7F0",
        foreground: "#3F2A1F",
        primary: { DEFAULT: "#15803D", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#D4A574", foreground: "#3F2A1F" },
        muted: { DEFAULT: "#F5EFE0", foreground: "#5C4536" },
        accent: { DEFAULT: "#D4A574", foreground: "#3F2A1F" },
        destructive: { DEFAULT: "#B43A2E", foreground: "#FFFFFF" },
        border: "#E8DFD0",
        input: "#E8DFD0",
        ring: "#15803D",
        card: { DEFAULT: "#FFFFFF", foreground: "#3F2A1F" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#3F2A1F" },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 4px 14px rgba(63,42,31,0.08)",
        glow: "0 0 30px rgba(212,165,116,0.25)",
        "glow-emerald": "0 0 30px rgba(21,128,61,0.18)",
      },
      fontFamily: {
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,165,116,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212,165,116,0)" },
        },
      },
      animation: {
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

Install the missing animate plugin:
```bash
pnpm add tailwindcss-animate
```

- [ ] **Step 3: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 36 56% 96%;
    --foreground: 22 35% 19%;
  }
  body {
    @apply bg-cream-50 text-ink-900 font-body;
    font-feature-settings: "cv11", "ss01";
  }
  h1, h2, h3, h4 {
    @apply font-display tracking-tight;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

- [ ] **Step 4: QA visuel**

```bash
pnpm dev
```
The default page should now render in cream background with brown text. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(design): add Téranga tokens to Tailwind + globals"
```

---

## Task 4 — Configure fonts via `next/font`

**Files:**
- Modify: `~/yonne/app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "yonne · livraison intelligente Sénégal",
  description: "Plateforme SaaS de livraison last-mile pour le Sénégal et l'Afrique de l'Ouest.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: QA visuel**

`pnpm dev`. Inspect any text — should render in Inter. Headings use Geist. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(fonts): wire Geist + Inter + JetBrains Mono"
```

---

## Task 5 — Wordmark component

**Files:**
- Create: `~/yonne/components/brand/Wordmark.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/brand/Wordmark.tsx
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function Wordmark({ size = "md", variant = "light", className }: Props) {
  const colorClass = variant === "light" ? "text-emerald-500" : "text-cream-50";
  const dotColor = variant === "light" ? "bg-gold-500" : "bg-gold-400";

  return (
    <span className={cn("font-display font-bold tracking-tight inline-flex items-baseline", sizeClasses[size], colorClass, className)}>
      yonne
      <span className={cn("ml-[2px] inline-block rounded-full self-start mt-[0.4em]", dotColor)} style={{ width: "0.18em", height: "0.18em" }} aria-hidden />
    </span>
  );
}
```

- [ ] **Step 2: Smoke render in home page**

Modify `app/page.tsx`:
```tsx
import { Wordmark } from "@/components/brand/Wordmark";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center gap-8 flex-wrap">
      <Wordmark size="sm" />
      <Wordmark size="md" />
      <Wordmark size="lg" />
      <Wordmark size="xl" />
    </main>
  );
}
```

- [ ] **Step 3: QA visuel**

`pnpm dev`. Open `http://localhost:3000`. Four "yonne" wordmarks at increasing sizes, each with a gold dot floating to the right. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(brand): add Wordmark component"
```

---

## Task 6 — Mock data: landmarks

**Files:**
- Create: `~/yonne/lib/mock-data/landmarks.ts`

- [ ] **Step 1: Create the file with 50+ Dakar landmarks**

```ts
// lib/mock-data/landmarks.ts
export type LandmarkType = "transport" | "commerce" | "culte" | "santé" | "loisir" | "éducation";

export interface Landmark {
  id: string;
  name: string;
  quartier: string;
  type: LandmarkType;
  lat: number;
  lng: number;
}

export const landmarks: Landmark[] = [
  { id: "lm-001", name: "Grande Mosquée de Dakar", quartier: "Médina", type: "culte", lat: 14.6770, lng: -17.4480 },
  { id: "lm-002", name: "Marché Sandaga", quartier: "Plateau", type: "commerce", lat: 14.6730, lng: -17.4380 },
  { id: "lm-003", name: "Marché Kermel", quartier: "Plateau", type: "commerce", lat: 14.6716, lng: -17.4321 },
  { id: "lm-004", name: "Total Liberté 6", quartier: "Liberté 6", type: "transport", lat: 14.7245, lng: -17.4622 },
  { id: "lm-005", name: "Total Mermoz", quartier: "Mermoz", type: "transport", lat: 14.7142, lng: -17.4781 },
  { id: "lm-006", name: "Total VDN", quartier: "VDN", type: "transport", lat: 14.7290, lng: -17.4710 },
  { id: "lm-007", name: "Place de l'Indépendance", quartier: "Plateau", type: "loisir", lat: 14.6699, lng: -17.4356 },
  { id: "lm-008", name: "Université Cheikh Anta Diop", quartier: "Fann", type: "éducation", lat: 14.6920, lng: -17.4634 },
  { id: "lm-009", name: "Hôpital Principal de Dakar", quartier: "Plateau", type: "santé", lat: 14.6680, lng: -17.4280 },
  { id: "lm-010", name: "Sea Plaza", quartier: "Almadies", type: "commerce", lat: 14.7415, lng: -17.5145 },
  { id: "lm-011", name: "Allées Khalifa Ababacar Sy", quartier: "Médina", type: "transport", lat: 14.6840, lng: -17.4470 },
  { id: "lm-012", name: "Patte d'Oie", quartier: "Patte d'Oie", type: "transport", lat: 14.7330, lng: -17.4520 },
  { id: "lm-013", name: "Auchan Sacré-Cœur", quartier: "Sacré-Cœur", type: "commerce", lat: 14.7095, lng: -17.4595 },
  { id: "lm-014", name: "Casino Supermarché Mermoz", quartier: "Mermoz", type: "commerce", lat: 14.7125, lng: -17.4760 },
  { id: "lm-015", name: "Stade Léopold Sédar Senghor", quartier: "Pikine", type: "loisir", lat: 14.7480, lng: -17.4180 },
  { id: "lm-016", name: "Aéroport LSS (ancien)", quartier: "Yoff", type: "transport", lat: 14.7395, lng: -17.4900 },
  { id: "lm-017", name: "Corniche Ouest", quartier: "Mamelles", type: "loisir", lat: 14.7185, lng: -17.4995 },
  { id: "lm-018", name: "Embarcadère Île de Gorée", quartier: "Plateau", type: "transport", lat: 14.6708, lng: -17.4225 },
  { id: "lm-019", name: "Mosquée de la Divinité", quartier: "Ouakam", type: "culte", lat: 14.7245, lng: -17.5050 },
  { id: "lm-020", name: "Monument de la Renaissance", quartier: "Ouakam", type: "loisir", lat: 14.7270, lng: -17.4965 },
  { id: "lm-021", name: "Phare des Mamelles", quartier: "Mamelles", type: "loisir", lat: 14.7235, lng: -17.5125 },
  { id: "lm-022", name: "Hôpital Le Dantec", quartier: "Plateau", type: "santé", lat: 14.6740, lng: -17.4290 },
  { id: "lm-023", name: "Marché Tilène", quartier: "Médina", type: "commerce", lat: 14.6810, lng: -17.4450 },
  { id: "lm-024", name: "Marché HLM", quartier: "HLM", type: "commerce", lat: 14.7220, lng: -17.4590 },
  { id: "lm-025", name: "Gare routière Pompiers", quartier: "Liberté 5", type: "transport", lat: 14.7145, lng: -17.4615 },
  { id: "lm-026", name: "Ucad 2", quartier: "Fann", type: "éducation", lat: 14.6915, lng: -17.4620 },
  { id: "lm-027", name: "Lycée Lamine Guèye", quartier: "Plateau", type: "éducation", lat: 14.6725, lng: -17.4330 },
  { id: "lm-028", name: "Place du Souvenir Africain", quartier: "Corniche", type: "loisir", lat: 14.7160, lng: -17.4885 },
  { id: "lm-029", name: "Cathédrale Notre-Dame des Victoires", quartier: "Plateau", type: "culte", lat: 14.6720, lng: -17.4310 },
  { id: "lm-030", name: "Auchan Liberté 6", quartier: "Liberté 6", type: "commerce", lat: 14.7280, lng: -17.4630 },
  { id: "lm-031", name: "Hôpital Fann", quartier: "Fann", type: "santé", lat: 14.6940, lng: -17.4655 },
  { id: "lm-032", name: "Stade Iba Mar Diop", quartier: "Médina", type: "loisir", lat: 14.6855, lng: -17.4395 },
  { id: "lm-033", name: "Pharmacie Mermoz Centre", quartier: "Mermoz", type: "santé", lat: 14.7155, lng: -17.4795 },
  { id: "lm-034", name: "Centre Culturel Blaise Senghor", quartier: "HLM", type: "loisir", lat: 14.7230, lng: -17.4575 },
  { id: "lm-035", name: "Marché Castors", quartier: "Castors", type: "commerce", lat: 14.7195, lng: -17.4445 },
  { id: "lm-036", name: "Gare de Dakar", quartier: "Plateau", type: "transport", lat: 14.6735, lng: -17.4250 },
  { id: "lm-037", name: "Mosquée Massalikoul Djinane", quartier: "Colobane", type: "culte", lat: 14.6940, lng: -17.4495 },
  { id: "lm-038", name: "Lycée Blaise Diagne", quartier: "Plateau", type: "éducation", lat: 14.6750, lng: -17.4365 },
  { id: "lm-039", name: "BICIS Plateau", quartier: "Plateau", type: "commerce", lat: 14.6705, lng: -17.4365 },
  { id: "lm-040", name: "Galerie Cinquième Avenue", quartier: "Mermoz", type: "commerce", lat: 14.7165, lng: -17.4805 },
  { id: "lm-041", name: "Eden Plaza", quartier: "Almadies", type: "commerce", lat: 14.7430, lng: -17.5180 },
  { id: "lm-042", name: "Plage de Yoff", quartier: "Yoff", type: "loisir", lat: 14.7560, lng: -17.4860 },
  { id: "lm-043", name: "Plage des Almadies", quartier: "Almadies", type: "loisir", lat: 14.7480, lng: -17.5260 },
  { id: "lm-044", name: "Lac Rose (Retba)", quartier: "Niaga", type: "loisir", lat: 14.8400, lng: -17.2360 },
  { id: "lm-045", name: "Total Yoff", quartier: "Yoff", type: "transport", lat: 14.7440, lng: -17.4830 },
  { id: "lm-046", name: "Total Almadies", quartier: "Almadies", type: "transport", lat: 14.7475, lng: -17.5210 },
  { id: "lm-047", name: "Marché Grand Yoff", quartier: "Grand Yoff", type: "commerce", lat: 14.7340, lng: -17.4640 },
  { id: "lm-048", name: "Hôpital Roi Baudouin", quartier: "Guédiawaye", type: "santé", lat: 14.7740, lng: -17.4055 },
  { id: "lm-049", name: "Université Amadou Mahtar Mbow", quartier: "Diamniadio", type: "éducation", lat: 14.7220, lng: -17.1840 },
  { id: "lm-050", name: "Centre Commercial Dakar City", quartier: "Diamniadio", type: "commerce", lat: 14.7245, lng: -17.1850 },
  { id: "lm-051", name: "Marché Liberté 6", quartier: "Liberté 6", type: "commerce", lat: 14.7270, lng: -17.4640 },
  { id: "lm-052", name: "Mermoz Plage", quartier: "Mermoz", type: "loisir", lat: 14.7200, lng: -17.4830 },
];

export function searchLandmarks(query: string, limit = 6): Landmark[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return landmarks
    .filter((l) => l.name.toLowerCase().includes(q) || l.quartier.toLowerCase().includes(q))
    .slice(0, limit);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(data): add 52 Dakar landmarks with coordinates"
```

---

## Task 7 — Mock data: drivers

**Files:**
- Create: `~/yonne/lib/mock-data/drivers.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/mock-data/drivers.ts
export type Badge = "Rapide" | "Top noté" | "Précis" | "10 jours" | "50 courses" | "Eco";
export type Tier = "Bronze" | "Argent" | "Or";

export interface Driver {
  id: string;
  name: string;
  avatarSeed: string;
  phone: string;
  vehicle: "Moto Yamaha" | "Moto TVS" | "Vélo électrique" | "Tricycle";
  scoreIA: number;          // 0-100
  rating: number;           // 0-5
  tier: Tier;
  badges: Badge[];
  ordersToday: number;
  earningsToday: number;    // FCFA
  online: boolean;
  inPrayer: boolean;
  lat: number;
  lng: number;
}

const senegaleseFirstNames = ["Ibrahima","Aminata","Moussa","Fatou","Cheikh","Awa","Modou","Babacar","Mariama","Ousmane","Aïssatou","Pape","Ndèye","Mamadou","Khady","Abdoulaye","Astou","Lamine","Coumba","Souleymane","Aïda","Saliou","Bineta","Daouda","Ramatoulaye","Insa","Yacine","Boubacar","Fanta","Idrissa","Sokhna","Demba","Maty","Tidiane","Adama","Penda","Serigne","Anta","Bara","Maguette","Khadim"];
const senegaleseLastNames = ["Sow","Diop","Ndiaye","Sarr","Diouf","Fall","Mbaye","Cissé","Ba","Niang","Sy","Faye","Wade","Gueye","Sène","Thiaw","Ka","Kane","Sané","Touré","Camara","Bâ","Coly","Diagne","Diallo","Toure","Seck","Bop","Goudiaby","Manga","Badji","Fofana","Niasse","Tine","Mané","Konaté","Mendy","Boye","Pouye","Ly","Dramé"];
const vehicles: Driver["vehicle"][] = ["Moto Yamaha","Moto TVS","Vélo électrique","Tricycle"];
const tiers: Tier[] = ["Bronze","Argent","Or"];
const allBadges: Badge[] = ["Rapide","Top noté","Précis","10 jours","50 courses","Eco"];

// Coords roughly inside Dakar metropolitan area
const dakarBox = { latMin: 14.660, latMax: 14.760, lngMin: -17.520, lngMax: -17.380 };

function rand(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(rand(seed, 0, arr.length))];
}

export const drivers: Driver[] = Array.from({ length: 41 }, (_, i) => {
  const id = `drv-${String(i + 1).padStart(3, "0")}`;
  const first = pick(senegaleseFirstNames, i * 7 + 1);
  const last = pick(senegaleseLastNames, i * 11 + 3);
  const tier = pick(tiers, i * 3 + 5);
  const badgeCount = 2 + Math.floor(rand(i + 13, 0, 3));
  const badges = Array.from(new Set(Array.from({ length: badgeCount }, (_, k) => pick(allBadges, i * 17 + k * 5))));
  return {
    id,
    name: `${first} ${last}`,
    avatarSeed: `${first}${last}${i}`,
    phone: `+221 77 ${String(Math.floor(rand(i + 1, 100, 999)))} ${String(Math.floor(rand(i + 2, 1000, 9999)))}`,
    vehicle: pick(vehicles, i * 5 + 7),
    scoreIA: Math.floor(rand(i + 19, 65, 99)),
    rating: Math.round(rand(i + 23, 4.0, 5.0) * 10) / 10,
    tier,
    badges,
    ordersToday: Math.floor(rand(i + 29, 4, 22)),
    earningsToday: Math.floor(rand(i + 31, 12_000, 58_000) / 100) * 100,
    online: i < 28,        // first 28 online
    inPrayer: i >= 25 && i < 28,
    lat: rand(i + 37, dakarBox.latMin, dakarBox.latMax),
    lng: rand(i + 41, dakarBox.lngMin, dakarBox.lngMax),
  };
});

export function avatarUrl(driver: Driver) {
  return `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(driver.avatarSeed)}`;
}

export function topDriversToday(limit = 5) {
  return [...drivers]
    .sort((a, b) => b.earningsToday - a.earningsToday)
    .slice(0, limit);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(data): add 41 mock drivers with Senegalese names"
```

---

## Task 8 — Mock data: orders

**Files:**
- Create: `~/yonne/lib/mock-data/orders.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/mock-data/orders.ts
import { drivers } from "./drivers";
import { landmarks } from "./landmarks";

export type OrderStatus = "créée" | "assignée" | "collecte" | "en route" | "livrée";
export type PaymentMethod = "wave" | "orange" | "cash";

export interface Order {
  id: string;
  driverId: string;
  landmarkId: string;
  clientName: string;
  clientPhone: string;
  amount: number;          // FCFA
  paymentMethod: PaymentMethod;
  insurance: boolean;
  status: OrderStatus;
  createdAt: string;       // ISO string
  active: boolean;         // shown on live map
}

const clientFirstNames = ["Awa","Moussa","Mariama","Pape","Khady","Cheikh","Fatou","Ibrahima","Aminata","Modou"];
const clientLastNames  = ["Diop","Sow","Mbaye","Cissé","Ndiaye","Sarr","Diouf","Fall","Ba","Niang"];
const statuses: OrderStatus[] = ["créée","assignée","collecte","en route","livrée"];
const methods: PaymentMethod[] = ["wave","orange","cash"];

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
function pick<T>(arr: T[], seed: number) { return arr[Math.floor(r(seed, 0, arr.length))]; }

const baseDate = new Date("2026-05-20T08:00:00+00:00");  // demo "today"

export const orders: Order[] = Array.from({ length: 147 }, (_, i) => {
  const driver = drivers[Math.floor(r(i + 11, 0, drivers.length))];
  const landmark = landmarks[Math.floor(r(i + 17, 0, landmarks.length))];
  const status = i < 12 ? statuses[Math.floor(r(i + 23, 1, 4))] : pick(statuses, i + 29);
  const minutesOffset = Math.floor(r(i + 31, 0, 600));
  return {
    id: `YN-2026-${String(10000 + i)}`,
    driverId: driver.id,
    landmarkId: landmark.id,
    clientName: `${pick(clientFirstNames, i + 41)} ${pick(clientLastNames, i + 43)}`,
    clientPhone: `+221 7${Math.random() < 0.5 ? "7" : "8"} ${String(Math.floor(r(i + 47, 100, 999)))} ${String(Math.floor(r(i + 53, 1000, 9999)))}`,
    amount: Math.floor(r(i + 59, 3500, 28000) / 100) * 100,
    paymentMethod: pick(methods, i + 61),
    insurance: r(i + 67, 0, 1) > 0.7,
    status,
    createdAt: new Date(baseDate.getTime() + minutesOffset * 60_000).toISOString(),
    active: i < 12,
  };
});

export const activeOrders = orders.filter(o => o.active);
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(data): add 147 mock orders for demo day"
```

---

## Task 9 — Mock data: Tabaski + chat

**Files:**
- Create: `~/yonne/lib/mock-data/tabaski.ts`
- Create: `~/yonne/lib/mock-data/chat.ts`

- [ ] **Step 1: Create `tabaski.ts`**

```ts
// lib/mock-data/tabaski.ts
// Tabaski 2026 estimate: 2026-05-27 (à valider selon CMS)
export const TABASKI_DATE = new Date("2026-05-27T08:00:00+00:00");
// Demo "today" is 2026-05-20 → J-7
export const DEMO_NOW = new Date("2026-05-20T10:00:00+00:00");

export interface DemandPoint {
  date: string;          // YYYY-MM-DD
  hour: number;          // 0-23
  baseline: number;      // commandes/h en jour normal
  predicted: number;     // commandes/h prévues
}

function buildCurve(): DemandPoint[] {
  const points: DemandPoint[] = [];
  const start = new Date("2026-05-20T00:00:00+00:00");
  for (let day = 0; day < 10; day++) {
    const date = new Date(start.getTime() + day * 86400000);
    const dayKey = date.toISOString().slice(0, 10);
    const isTabaskiDay = day === 7;        // J0 (May 27)
    const isJMinus1   = day === 6;         // J-1 (May 26)
    const isJPlus1    = day === 8;         // J+1 (May 28)
    for (let hour = 0; hour < 24; hour++) {
      const baseline = hour < 6 || hour > 22 ? 6 : 18 + Math.round(Math.sin((hour - 9) / 6) * 8);
      let multiplier = 1;
      if (isTabaskiDay && hour >= 10 && hour <= 14) multiplier = 3.2;
      else if (isTabaskiDay) multiplier = 2.4;
      else if (isJMinus1) multiplier = 1.6;
      else if (isJPlus1) multiplier = 1.4;
      else multiplier = 1 + day * 0.05;    // gentle ramp
      points.push({ date: dayKey, hour, baseline, predicted: Math.round(baseline * multiplier) });
    }
  }
  return points;
}

export const demandCurve = buildCurve();

export interface ActionPlanItem {
  id: string;
  title: string;
  detail: string;
  status: "pending" | "in_progress" | "done";
  progress?: { current: number; total: number };
  toggleable?: boolean;
}

export const actionPlan: ActionPlanItem[] = [
  {
    id: "ap-1",
    title: "Recruter 12 livreurs temporaires",
    detail: "Activation du pool de réserve · contact automatique · KYC accéléré.",
    status: "in_progress",
    progress: { current: 8, total: 12 },
  },
  {
    id: "ap-2",
    title: "Bonus livreurs Tabaski : 2 000 F par course",
    detail: "Active du J-1 au J+1, sur toute la zone Dakar. Prime cumulable.",
    status: "pending",
    toggleable: true,
  },
  {
    id: "ap-3",
    title: "Surge automatique J-1 → J+1 (×1.5 → ×2.0)",
    detail: "Pic prévu mardi 10h-14h. Surge passe à ×2.0 sur cette fenêtre.",
    status: "pending",
    toggleable: true,
  },
];

export interface HistoryStat { label: string; value: string }
export const tabaski2025Stats: HistoryStat[] = [
  { label: "Revenus vs jour normal", value: "+287 %" },
  { label: "Commandes < 30 min", value: "94 %" },
  { label: "Commandes traitées", value: "1 247" },
];
```

- [ ] **Step 2: Create `chat.ts`**

```ts
// lib/mock-data/chat.ts
export interface ChatMessage {
  from: "driver" | "client";
  text: string;
  time: string;          // HH:mm
}

export const trackingChat: ChatMessage[] = [
  { from: "driver", text: "Bonjour, je suis en route 🛵", time: "14:17" },
  { from: "client", text: "Merci, je suis au RDC", time: "14:18" },
  { from: "driver", text: "OK, j'arrive dans 15 min", time: "14:18" },
];
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(data): add Tabaski curve, action plan, tracking chat"
```

---

## Task 10 — i18n minimal (FR full + EN/WO toggle)

**Files:**
- Create: `~/yonne/lib/i18n.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/i18n.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "fr" | "en" | "wo";

const dict = {
  loginTitle: { fr: "Bienvenue sur yonne", en: "Welcome to yonne", wo: "Dalal ak diam ci yonne" },
  loginCta: { fr: "Se connecter", en: "Sign in", wo: "Dugg" },
  tabaskiAlert: {
    fr: "Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt",
    en: "Tabaski in 7 days — demand peak forecast × 3.2. Action plan ready",
    wo: "Tabaski 7 fan ak ñàkk — yokk gu mag (× 3.2). Plan biy jëfandikoo prèt",
  },
  revenusToday: { fr: "Revenus aujourd'hui", en: "Revenue today", wo: "Xaalis ci tey" },
  newOrder: { fr: "Nouvelle commande", en: "New order", wo: "Komaand bu bees" },
} as const;

export type StringKey = keyof typeof dict;

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLang = create<I18nState>()(
  persist(
    (set) => ({ lang: "fr", setLang: (l) => set({ lang: l }) }),
    { name: "yonne-lang" }
  )
);

export function t(key: StringKey, lang: Lang): string {
  return dict[key][lang] ?? dict[key].fr;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(i18n): minimal FR/EN/WO toggle (5 keys)"
```

---

## Task 11 — Mock auth helper

**Files:**
- Create: `~/yonne/lib/auth-mock.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/auth-mock.ts
export interface DemoAccount {
  email: string;
  password: string;
  role: "admin" | "merchant";
  redirect: string;
  displayName: string;
}

export const demoAccounts: DemoAccount[] = [
  { email: "admin@yonne.sn",          password: "Admin123!", role: "admin",    redirect: "/admin",                    displayName: "Admin YONNE" },
  { email: "boutique.plateau@gmail.com", password: "Demo123!", role: "merchant", redirect: "/merchant/nouvelle-commande", displayName: "Boutique Plateau" },
];

export function authenticate(email: string, password: string): DemoAccount | null {
  return demoAccounts.find(a => a.email === email && a.password === password) ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(auth): mock authenticate() against demo accounts"
```

---

## Task 12 — LangSwitcher + Topbar

**Files:**
- Create: `~/yonne/components/layout/LangSwitcher.tsx`
- Create: `~/yonne/components/layout/Topbar.tsx`

- [ ] **Step 1: Create `LangSwitcher.tsx`**

```tsx
"use client";
import { useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const labels: Record<Lang, string> = { fr: "FR", en: "EN", wo: "WO" };

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center gap-0 rounded-md bg-cream-100 p-1">
      {(Object.keys(labels) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
            lang === l ? "bg-white text-emerald-500 shadow-card" : "text-ink-500 hover:text-ink-900"
          )}
          aria-pressed={lang === l}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `Topbar.tsx`**

```tsx
"use client";
import { Bell } from "lucide-react";
import { LangSwitcher } from "./LangSwitcher";

interface Props {
  breadcrumb: string;
  userName: string;
  notifications?: number;
}

export function Topbar({ breadcrumb, userName, notifications = 0 }: Props) {
  return (
    <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
      <div className="text-sm text-ink-500">{breadcrumb}</div>
      <div className="flex items-center gap-4">
        <LangSwitcher />
        <button className="relative p-2 rounded-md hover:bg-cream-100" aria-label="Notifications">
          <Bell className="w-5 h-5 text-ink-700" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
          {userName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(layout): Topbar + LangSwitcher"
```

---

## Task 13 — AdminSidebar + MerchantSidebar

**Files:**
- Create: `~/yonne/components/layout/AdminSidebar.tsx`
- Create: `~/yonne/components/layout/MerchantSidebar.tsx`

- [ ] **Step 1: Create `AdminSidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, Package, Bike, Store, Wallet, BarChart3, Zap, Sparkles, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/admin",          label: "Accueil",       icon: Home },
  { href: "/admin/commandes",label: "Commandes",     icon: Package },
  { href: "/admin/livreurs", label: "Livreurs",      icon: Bike },
  { href: "/admin/marchands",label: "Commerçants",   icon: Store },
  { href: "/admin/finance",  label: "Finance",       icon: Wallet },
  { href: "/admin/analytics",label: "Analytics",     icon: BarChart3 },
  { href: "/admin/surge",    label: "Surge",         icon: Zap },
  { href: "/admin/tabaski",  label: "Tabaski",       icon: Sparkles, badge: "J-7" },
  { href: "/admin/settings", label: "Paramètres",    icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-cream-200 bg-white flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-cream-200">
        <Link href="/admin"><Wordmark size="md" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-emerald-500 text-white" : "text-ink-700 hover:bg-cream-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-sm bg-gold-500 text-ink-900 font-bold">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-cream-200">
        <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100">
          <LogOut className="w-4 h-4" /> Déconnexion
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `MerchantSidebar.tsx`**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";
import { Home, PlusSquare, ListOrdered, Wallet, Settings, LogOut } from "lucide-react";

const items = [
  { href: "/merchant",                   label: "Accueil",          icon: Home },
  { href: "/merchant/nouvelle-commande", label: "Nouvelle commande",icon: PlusSquare },
  { href: "/merchant/commandes",         label: "Mes commandes",    icon: ListOrdered },
  { href: "/merchant/finances",          label: "Finances",         icon: Wallet },
  { href: "/merchant/parametres",        label: "Paramètres",       icon: Settings },
];

export function MerchantSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-cream-200 bg-white flex flex-col">
      <div className="h-16 px-5 flex items-center border-b border-cream-200">
        <Link href="/merchant"><Wordmark size="md" /></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/merchant" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-emerald-500 text-white" : "text-ink-700 hover:bg-cream-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-cream-200">
        <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100">
          <LogOut className="w-4 h-4" /> Déconnexion
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(layout): admin + merchant sidebars"
```

---

## Task 14 — Admin & Merchant route layouts

**Files:**
- Create: `~/yonne/app/(admin)/admin/layout.tsx`
- Create: `~/yonne/app/(merchant)/merchant/layout.tsx`

- [ ] **Step 1: Create admin layout**

```tsx
// app/(admin)/admin/layout.tsx
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Admin" userName="Admin YONNE" notifications={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create merchant layout**

```tsx
// app/(merchant)/merchant/layout.tsx
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName="Boutique Plateau" notifications={1} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(layout): admin + merchant route layouts"
```

---

## Task 15 — Login screen

**Files:**
- Create: `~/yonne/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { authenticate } from "@/lib/auth-mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const account = authenticate(email.trim(), password);
    if (!account) {
      setError("Email ou mot de passe invalide.");
      return;
    }
    router.push(account.redirect);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-gold-400/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wordmark size="xl" />
          <p className="mt-3 text-ink-500 text-sm">Livraison intelligente · Sénégal</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-lg shadow-card p-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@yonne.sn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald">Se connecter</Button>
          <button type="button" className="block w-full text-center text-xs text-ink-500 hover:text-ink-700">Mot de passe oublié ?</button>
        </form>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Authentification 2FA SMS activée pour votre sécurité
        </div>
        <details className="mt-8 text-xs text-ink-500 bg-white/50 rounded-md p-3">
          <summary className="cursor-pointer font-medium">Comptes de démo</summary>
          <ul className="mt-2 space-y-1 font-mono">
            <li>admin@yonne.sn / Admin123!</li>
            <li>boutique.plateau@gmail.com / Demo123!</li>
          </ul>
        </details>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update root `app/page.tsx` to redirect to login**

```tsx
import { redirect } from "next/navigation";
export default function Home() { redirect("/login"); }
```

- [ ] **Step 3: QA visuel**

`pnpm dev` → `http://localhost:3000`. Should redirect to `/login`. Form renders. Bad creds show error. Correct admin creds → `/admin` (404 for now). Correct merchant creds → `/merchant/nouvelle-commande` (404 for now).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(auth): login screen with mock credentials"
```

---

## Task 16 — KPI components

**Files:**
- Create: `~/yonne/components/kpi/KpiCard.tsx`
- Create: `~/yonne/components/kpi/RevenueSparkline.tsx`

- [ ] **Step 1: Create `RevenueSparkline.tsx`**

```tsx
"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Props { values: number[]; color?: string }

export function RevenueSparkline({ values, color = "#15803D" }: Props) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create `KpiCard.tsx`**

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
}

export function KpiCard({ label, value, delta, hint, spark, highlight }: Props) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-card p-5 border border-cream-200",
      highlight && "ring-2 ring-gold-500 shadow-glow"
    )}>
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

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(kpi): KpiCard + RevenueSparkline"
```

---

## Task 17 — DakarMap (Leaflet, SSR-safe)

**Files:**
- Create: `~/yonne/components/map/DakarMap.tsx`
- Modify: `~/yonne/app/globals.css` (Leaflet CSS)

- [ ] **Step 1: Add Leaflet CSS to globals**

Append to `app/globals.css`:
```css
@import "leaflet/dist/leaflet.css";

.driver-pin {
  background: #D4A574;
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 0 rgba(212,165,116,0.6);
  animation: pulseGold 2s ease-in-out infinite;
}
.order-pin {
  background: #15803D;
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid white;
}
.dest-pin {
  background: #15803D;
  width: 18px; height: 18px; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid white;
}
```

- [ ] **Step 2: Create `DakarMap.tsx`**

```tsx
"use client";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { divIcon } from "leaflet";
import { useMemo } from "react";
import "leaflet/dist/leaflet.css";

export interface Pin {
  id: string;
  lat: number;
  lng: number;
  kind: "driver" | "order" | "dest";
}

interface Props {
  pins: Pin[];
  trail?: { from: [number, number]; to: [number, number] };
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const DAKAR: [number, number] = [14.6928, -17.4467];

const icons = {
  driver: divIcon({ className: "", html: '<div class="driver-pin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
  order:  divIcon({ className: "", html: '<div class="order-pin"></div>',  iconSize: [12, 12], iconAnchor: [6, 6] }),
  dest:   divIcon({ className: "", html: '<div class="dest-pin"></div>',   iconSize: [18, 18], iconAnchor: [9, 18] }),
};

export default function DakarMap({ pins, trail, center = DAKAR, zoom = 12, height = "480px" }: Props) {
  const markers = useMemo(() => pins.map((p) => ({ ...p, icon: icons[p.kind] })), [pins]);
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-cream-200 shadow-card">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={m.icon} />
        ))}
        {trail && (
          <Polyline positions={[trail.from, trail.to]} pathOptions={{ color: "#D4A574", weight: 3, dashArray: "6 6" }} />
        )}
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 3: Create dynamic wrapper**

Create `~/yonne/components/map/DakarMapClient.tsx`:
```tsx
"use client";
import dynamic from "next/dynamic";

const DakarMap = dynamic(() => import("./DakarMap"), { ssr: false, loading: () => <div className="h-[480px] rounded-lg bg-cream-100 animate-pulse" /> });

export default DakarMap;
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(map): DakarMap with Leaflet (SSR-safe via dynamic import)"
```

---

## Task 18 — DriverLeaderboard

**Files:**
- Create: `~/yonne/components/kpi/DriverLeaderboard.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Image from "next/image";
import { topDriversToday, avatarUrl } from "@/lib/mock-data/drivers";
import { Star } from "lucide-react";

const tierColor = { Or: "bg-gold-500", Argent: "bg-ink-500/30", Bronze: "bg-amber-700/40" } as const;

export function DriverLeaderboard() {
  const top = topDriversToday(5);
  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-900">Top livreurs · aujourd'hui</h3>
        <button className="text-xs text-emerald-500 hover:underline">Voir tous</button>
      </div>
      <ol className="space-y-3">
        {top.map((d, i) => (
          <li key={d.id} className="flex items-center gap-3">
            <span className="w-6 text-center font-display font-bold text-ink-500">{i + 1}</span>
            <Image src={avatarUrl(d)} alt={d.name} width={36} height={36} unoptimized className="rounded-full bg-cream-100" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-900 truncate">{d.name}</div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className={`inline-block w-2 h-2 rounded-full ${tierColor[d.tier]}`} />
                {d.tier}
                <Star className="w-3 h-3 text-gold-500 fill-gold-500 ml-2" />
                {d.rating.toFixed(1)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-ink-900 tabular-nums">{d.earningsToday.toLocaleString("fr-FR")} F</div>
              <div className="text-xs text-ink-500">{d.ordersToday} courses</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Allow Dicebear images in next.config.js**

Modify `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "api.dicebear.com" }],
  },
};
module.exports = nextConfig;
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(kpi): DriverLeaderboard with Senegalese driver names"
```

---

## Task 19 — Admin Home page

**Files:**
- Create: `~/yonne/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Create the page**

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Link
        href="/admin/tabaski"
        className="block rounded-lg bg-emerald-500 text-white p-5 shadow-card hover:shadow-glow-emerald transition-shadow"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="font-medium">Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt.</span>
          <ChevronRight className="ml-auto w-5 h-5" />
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenus aujourd'hui" value="847 200 F" delta={{ value: "23 %", direction: "up" }} hint="vs hier" spark={sparkRevenue} />
        <KpiCard label="Commandes" value="147" delta={{ value: "12 actives", direction: "up" }} spark={sparkOrders} />
        <KpiCard label="Livreurs en ligne" value="28 / 41" hint="3 en pause prière" />
        <KpiCard label="Note moyenne" value="4,7 ★" hint="89 avis aujourd'hui" />
      </div>

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

- [ ] **Step 2: QA visuel**

`pnpm dev` → log in as admin → land on `/admin`. Should see banner, 4 KPIs, map with pins, leaderboard. Map pins must animate (gold pulse).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(admin): home page with KPIs, live map, leaderboard"
```

---

## Task 20 — Tabaski components

**Files:**
- Create: `~/yonne/components/tabaski/J7Countdown.tsx`
- Create: `~/yonne/components/tabaski/DemandCurve.tsx`
- Create: `~/yonne/components/tabaski/ActionPlanCard.tsx`

- [ ] **Step 1: Create `J7Countdown.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { TABASKI_DATE, DEMO_NOW } from "@/lib/mock-data/tabaski";

export function J7Countdown() {
  const [diff, setDiff] = useState(() => TABASKI_DATE.getTime() - DEMO_NOW.getTime());

  useEffect(() => {
    const start = Date.now();
    const initial = diff;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setDiff(initial - elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);     // intentionally empty: we capture initial diff once

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div className="inline-flex items-baseline gap-3 font-mono tabular-nums text-ink-900">
      <span><span className="text-3xl font-bold">{days}</span><span className="text-sm text-ink-500">j</span></span>
      <span><span className="text-3xl font-bold">{String(hours).padStart(2, "0")}</span><span className="text-sm text-ink-500">h</span></span>
      <span><span className="text-3xl font-bold">{String(minutes).padStart(2, "0")}</span><span className="text-sm text-ink-500">m</span></span>
      <span className="text-emerald-500"><span className="text-3xl font-bold">{String(seconds).padStart(2, "0")}</span><span className="text-sm">s</span></span>
    </div>
  );
}
```

- [ ] **Step 2: Create `DemandCurve.tsx`**

```tsx
"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { demandCurve } from "@/lib/mock-data/tabaski";

export function DemandCurve() {
  // aggregate per day for readability
  const byDay = Object.values(
    demandCurve.reduce<Record<string, { date: string; baseline: number; predicted: number }>>((acc, p) => {
      acc[p.date] ??= { date: p.date, baseline: 0, predicted: 0 };
      acc[p.date].baseline   += p.baseline;
      acc[p.date].predicted  += p.predicted;
      return acc;
    }, {})
  ).map(d => ({
    label: new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    ...d,
  }));

  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-ink-900">Demande prévue · J-7 → J+2</h3>
        <span className="text-xs text-ink-500">Pic mardi 27 mai · ×3.2</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={byDay}>
            <defs>
              <linearGradient id="emeraldFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803D" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#15803D" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#8B7363" fontSize={11} />
            <YAxis stroke="#8B7363" fontSize={11} />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #E8DFD0", borderRadius: 10 }} />
            <ReferenceLine x="mar. 27" stroke="#D4A574" strokeDasharray="4 4" label={{ value: "Tabaski", fill: "#D4A574", fontSize: 11 }} />
            <Area type="monotone" dataKey="baseline"  stroke="#8B7363" strokeOpacity={0.5} fill="transparent" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="predicted" stroke="#15803D" strokeWidth={2} fill="url(#emeraldFade)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `ActionPlanCard.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import type { ActionPlanItem } from "@/lib/mock-data/tabaski";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ActionPlanCard({ item }: { item: ActionPlanItem }) {
  const [active, setActive] = useState(item.status === "in_progress");

  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {item.status === "in_progress" ? (
          <Loader2 className="w-5 h-5 text-gold-500 mt-0.5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
        )}
        <h4 className="font-display font-semibold text-ink-900 leading-tight">{item.title}</h4>
      </div>
      <p className="text-sm text-ink-700">{item.detail}</p>
      {item.progress && (
        <div className="space-y-1">
          <Progress value={(item.progress.current / item.progress.total) * 100} />
          <div className="text-xs text-ink-500">{item.progress.current} / {item.progress.total} confirmés</div>
        </div>
      )}
      {item.toggleable && (
        <div className="flex items-center justify-between pt-2 border-t border-cream-200">
          <span className="text-sm text-ink-700">Activer</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(tabaski): countdown, demand curve, action plan card"
```

---

## Task 21 — Tabaski page assembly

**Files:**
- Create: `~/yonne/app/(admin)/admin/tabaski/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { J7Countdown } from "@/components/tabaski/J7Countdown";
import { DemandCurve } from "@/components/tabaski/DemandCurve";
import { ActionPlanCard } from "@/components/tabaski/ActionPlanCard";
import { actionPlan, tabaski2025Stats } from "@/lib/mock-data/tabaski";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function TabaskiPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg p-7 shadow-card">
        <div className="flex items-center gap-2 text-gold-400 text-sm font-medium uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Tabaski 2026
        </div>
        <h1 className="font-display text-3xl font-bold mt-2">Mercredi 27 mai · J-7</h1>
        <p className="mt-2 text-cream-100/90 max-w-2xl">
          Pic de demande prévu × 3.2 sur la fenêtre 10h–14h le jour J. Voici votre plan d'action préparé par l'IA YONNE.
        </p>
        <div className="mt-5">
          <J7Countdown />
        </div>
      </header>

      <DemandCurve />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Plan d'action IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionPlan.map(item => <ActionPlanCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="bg-cream-100 rounded-lg p-6">
        <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Historique · Tabaski 2025</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tabaski2025Stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-display font-bold text-emerald-500 tabular-nums">{s.value}</div>
              <div className="text-sm text-ink-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Button size="lg" className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold text-base shadow-glow">
        Activer le plan d'action complet
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: QA visuel**

Click sidebar "Tabaski" → page renders with hero, ticking countdown, demand curve, 3 action cards, history banner, golden CTA.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(tabaski): J-7 page assembly"
```

---

## Task 22 — Wizard store + Stepper

**Files:**
- Create: `~/yonne/lib/store/wizard.ts`
- Create: `~/yonne/components/wizard/Stepper.tsx`

- [ ] **Step 1: Create `wizard.ts`**

```ts
"use client";
import { create } from "zustand";
import type { PaymentMethod } from "@/lib/mock-data/orders";

export type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  clientName: string;
  clientPhone: string;
  landmarkId: string | null;
  addressDetails: string;
  amount: number;
  paymentMethod: PaymentMethod | null;
  insurance: boolean;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  reset: () => void;
  next: () => void;
  prev: () => void;
}

const initial = {
  step: 1 as WizardStep,
  clientName: "",
  clientPhone: "",
  landmarkId: null,
  addressDetails: "",
  amount: 0,
  paymentMethod: null,
  insurance: false,
};

export const useWizard = create<WizardState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<WizardState>),
  reset: () => set({ ...initial }),
  next: () => set((s) => ({ step: Math.min(3, s.step + 1) as WizardStep })),
  prev: () => set((s) => ({ step: Math.max(1, s.step - 1) as WizardStep })),
}));
```

- [ ] **Step 2: Create `Stepper.tsx`**

```tsx
"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props { step: 1 | 2 | 3 }

const labels = ["Client", "Paiement", "Dispatch"];

export function Stepper({ step }: Props) {
  return (
    <ol className="flex items-center gap-3">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              done && "bg-emerald-500 text-white",
              active && "bg-gold-500 text-ink-900 shadow-glow",
              !done && !active && "bg-cream-200 text-ink-500"
            )}>
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            <span className={cn("text-sm font-medium", active ? "text-ink-900" : "text-ink-500")}>{label}</span>
            {i < 2 && <span className={cn("w-8 h-px", done ? "bg-emerald-500" : "bg-cream-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(wizard): zustand store + Stepper"
```

---

## Task 23 — Wizard step 1: Client + Landmark autocomplete

**Files:**
- Create: `~/yonne/components/wizard/ClientStep.tsx`

- [ ] **Step 1: Create the component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 1 with landmark autocomplete"
```

---

## Task 24 — Wizard step 2: Payment + Insurance

**Files:**
- Create: `~/yonne/components/wizard/PaymentStep.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useWizard } from "@/lib/store/wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PaymentMethod } from "@/lib/mock-data/orders";
import { cn } from "@/lib/utils";
import { Banknote } from "lucide-react";

const methods: { id: PaymentMethod; label: string; sub: string; bg: string }[] = [
  { id: "wave",   label: "Wave Sénégal",      sub: "Paiement instantané",      bg: "from-blue-500 to-blue-700" },
  { id: "orange", label: "Orange Money",      sub: "Réseau orange",            bg: "from-orange-500 to-orange-700" },
  { id: "cash",   label: "Cash à la livraison", sub: "Paiement à réception",   bg: "from-ink-700 to-ink-900" },
];

export function PaymentStep() {
  const w = useWizard();
  const canNext = w.amount >= 500 && w.paymentMethod;
  const commission = Math.round(w.amount * 0.15) + 100;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="amt">Montant FCFA</Label>
        <Input
          id="amt"
          type="number"
          min={500}
          value={w.amount || ""}
          onChange={e => w.set("amount", Number(e.target.value) || 0)}
          placeholder="12 500"
          className="text-2xl font-display font-bold text-ink-900 h-14"
        />
        {w.amount >= 500 && <div className="text-xs text-ink-500">Commission YONNE : {commission.toLocaleString("fr-FR")} F (15 % + 100 F)</div>}
      </div>

      <div className="space-y-2">
        <Label>Méthode de paiement</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {methods.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => w.set("paymentMethod", m.id)}
              className={cn(
                "relative rounded-lg overflow-hidden text-left p-4 border-2 transition-all",
                w.paymentMethod === m.id ? "border-emerald-500 shadow-glow-emerald" : "border-cream-200 hover:border-cream-200"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", m.bg)} />
              <div className="relative text-white">
                <Banknote className="w-5 h-5 mb-2 opacity-80" />
                <div className="font-display font-bold">{m.label}</div>
                <div className="text-xs opacity-80">{m.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream-100 rounded-md p-4 flex items-center justify-between">
        <div>
          <div className="font-medium text-ink-900">Assurance colis</div>
          <div className="text-xs text-ink-500">Couverture jusqu'à 50 000 F · +200 F</div>
        </div>
        <Switch checked={w.insurance} onCheckedChange={(v) => w.set("insurance", v)} />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={w.prev} className="text-ink-700">Retour</Button>
        <Button onClick={w.next} disabled={!canNext} className="bg-emerald-500 hover:bg-emerald-600">
          Suivant
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 2 payment + insurance"
```

---

## Task 25 — Wizard step 3: Dispatch animation

**Files:**
- Create: `~/yonne/components/wizard/DispatchStep.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWizard } from "@/lib/store/wizard";
import { drivers, avatarUrl } from "@/lib/mock-data/drivers";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";

export function DispatchStep() {
  const w = useWizard();
  const router = useRouter();
  const [phase, setPhase] = useState<"dispatching" | "assigned">("dispatching");
  const [assignedDriver, setAssignedDriver] = useState(typeof window !== "undefined" ? null : null as any);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Pick the highest-score online driver
      const candidate = [...drivers].filter(d => d.online && !d.inPrayer).sort((a, b) => b.scoreIA - a.scoreIA)[0];
      setAssignedDriver(candidate);
      setPhase("assigned");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "dispatching" || !assignedDriver) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="font-display text-lg text-ink-900">IA dispatch en cours…</div>
        <div className="text-sm text-ink-500">Recherche du livreur optimal · score Haversine composite</div>
      </div>
    );
  }

  const orderId = `YN-2026-${String(20000 + Math.floor(Math.random() * 9999))}`;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-xs uppercase tracking-wider text-emerald-500 font-medium">Livreur assigné</div>
        <div className="mt-3 flex items-center gap-4">
          <Image src={avatarUrl(assignedDriver)} alt={assignedDriver.name} width={56} height={56} unoptimized className="rounded-full bg-cream-100" />
          <div className="flex-1">
            <div className="font-display font-bold text-ink-900 text-lg">{assignedDriver.name}</div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Star className="w-3 h-3 text-gold-500 fill-gold-500" /> {assignedDriver.rating.toFixed(1)} · {assignedDriver.vehicle}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-cream-200">
          <Stat label="Distance" value="2,3 km" />
          <Stat label="ETA" value="18 min" />
          <Stat label="Score IA" value={`${assignedDriver.scoreIA}`} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow"
        onClick={() => { w.reset(); router.push(`/merchant/commande/${orderId}`); }}
      >
        Voir le suivi
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-ink-900 tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(wizard): step 3 dispatch animation + driver assignment"
```

---

## Task 26 — Wizard page assembly

**Files:**
- Create: `~/yonne/app/(merchant)/merchant/nouvelle-commande/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
"use client";
import { useWizard } from "@/lib/store/wizard";
import { Stepper } from "@/components/wizard/Stepper";
import { ClientStep } from "@/components/wizard/ClientStep";
import { PaymentStep } from "@/components/wizard/PaymentStep";
import { DispatchStep } from "@/components/wizard/DispatchStep";

export default function NouvelleCommandePage() {
  const { step } = useWizard();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Nouvelle commande</h1>
        <p className="text-sm text-ink-500 mt-1">3 étapes · dispatch IA automatique</p>
      </div>
      <Stepper step={step} />
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6">
        {step === 1 && <ClientStep />}
        {step === 2 && <PaymentStep />}
        {step === 3 && <DispatchStep />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: QA visuel**

Log in as merchant. Walk through wizard end-to-end. Step 1 search "Total" → suggestions appear. Step 2 enter 12500, pick Wave, toggle insurance. Step 3 wait 1.5s → driver card appears. Click "Voir le suivi" → 404 (next task).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(merchant): wizard page assembly"
```

---

## Task 27 — Tracking components

**Files:**
- Create: `~/yonne/components/tracking/GlovoTimeline.tsx`
- Create: `~/yonne/components/tracking/ChatBubble.tsx`
- Create: `~/yonne/components/tracking/EtaBadge.tsx`
- Create: `~/yonne/components/tracking/DriverCard.tsx`

- [ ] **Step 1: Create `GlovoTimeline.tsx`**

```tsx
"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "created",  label: "Commande créée",     time: "14:12" },
  { id: "assigned", label: "Livreur assigné",    time: "14:13" },
  { id: "enroute",  label: "En route vers vous", time: "14:17" },
  { id: "delivered", label: "Livré",             time: null },
] as const;

interface Props { activeStage: typeof stages[number]["id"] }

export function GlovoTimeline({ activeStage }: Props) {
  const activeIdx = stages.findIndex(s => s.id === activeStage);
  return (
    <ol className="space-y-0">
      {stages.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <li key={s.id} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                done && "bg-emerald-500 text-white",
                active && "bg-gold-500 text-ink-900 ring-4 ring-gold-500/20 animate-pulse-gold",
                !done && !active && "bg-cream-200"
              )}>
                {done && <Check className="w-3 h-3" />}
              </div>
              {i < stages.length - 1 && (
                <div className={cn("w-px flex-1 mt-1", done ? "bg-emerald-500" : "bg-cream-200")} />
              )}
            </div>
            <div className="pb-1">
              <div className={cn("text-sm font-medium", (done || active) ? "text-ink-900" : "text-ink-500")}>{s.label}</div>
              {s.time && <div className="text-xs text-ink-500 mt-0.5">{s.time}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Create `ChatBubble.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/mock-data/chat";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const fromDriver = msg.from === "driver";
  return (
    <div className={cn("flex", fromDriver ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[80%] px-3 py-2 rounded-lg text-sm",
        fromDriver ? "bg-cream-100 text-ink-900 rounded-bl-sm" : "bg-emerald-500 text-white rounded-br-sm"
      )}>
        {msg.text}
        <div className={cn("text-[10px] mt-1", fromDriver ? "text-ink-500" : "text-cream-100/80")}>{msg.time}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `EtaBadge.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";

export function EtaBadge({ initialMinutes = 18 }: { initialMinutes?: number }) {
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    const id = setInterval(() => {
      setMinutes(m => (m > 0 ? m - 1 : 0));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gold-500/15 border border-gold-500 rounded-lg p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">ETA</div>
      <div className="font-display text-4xl font-bold text-ink-900 tabular-nums tracking-tight">
        {minutes} <span className="text-lg text-ink-500 font-normal">min</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `DriverCard.tsx`**

```tsx
import Image from "next/image";
import type { Driver } from "@/lib/mock-data/drivers";
import { avatarUrl } from "@/lib/mock-data/drivers";
import { Phone, Star } from "lucide-react";

export function DriverCard({ driver }: { driver: Driver }) {
  return (
    <div className="bg-white rounded-lg border border-cream-200 p-4 flex items-center gap-3">
      <Image src={avatarUrl(driver)} alt={driver.name} width={48} height={48} unoptimized className="rounded-full bg-cream-100" />
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-ink-900 truncate">{driver.name}</div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Star className="w-3 h-3 fill-gold-500 text-gold-500" /> {driver.rating.toFixed(1)} · {driver.vehicle}
        </div>
      </div>
      <a href={`tel:${driver.phone}`} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600">
        <Phone className="w-4 h-4" />
      </a>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(tracking): timeline, chat bubble, ETA badge, driver card"
```

---

## Task 28 — Tracking page

**Files:**
- Create: `~/yonne/app/(merchant)/merchant/commande/[id]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { drivers } from "@/lib/mock-data/drivers";
import { landmarks } from "@/lib/mock-data/landmarks";
import { trackingChat } from "@/lib/mock-data/chat";
import { GlovoTimeline } from "@/components/tracking/GlovoTimeline";
import { ChatBubble } from "@/components/tracking/ChatBubble";
import { EtaBadge } from "@/components/tracking/EtaBadge";
import { DriverCard } from "@/components/tracking/DriverCard";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

const DakarMap = dynamic(() => import("@/components/map/DakarMap"), { ssr: false });

const merchantPos: [number, number] = [14.6730, -17.4380]; // Plateau (Sandaga)

export default function TrackingPage({ params }: { params: { id: string } }) {
  // Pick a deterministic driver/destination from the order id
  const seed = params.id.charCodeAt(params.id.length - 1);
  const driver = useMemo(() => drivers.filter(d => d.online && !d.inPrayer)[seed % drivers.filter(d => d.online && !d.inPrayer).length], [seed]);
  const destination = useMemo(() => landmarks[seed % landmarks.length], [seed]);

  const [pos, setPos] = useState<[number, number]>([driver.lat, driver.lng]);

  useEffect(() => {
    const total = 30;             // 30 ticks of 3s = 90s journey demo
    let i = 0;
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / total);
      const lat = driver.lat + (destination.lat - driver.lat) * t;
      const lng = driver.lng + (destination.lng - driver.lng) * t;
      setPos([lat, lng]);
      if (t >= 1) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [driver, destination]);

  const pins = [
    { id: "drv", lat: pos[0], lng: pos[1], kind: "driver" as const },
    { id: "dst", lat: destination.lat, lng: destination.lng, kind: "dest" as const },
  ];

  const waText = encodeURIComponent(`Suivi de ta commande YONNE 🛵 ${typeof window !== "undefined" ? window.location.href : ""}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] h-full">
      <div className="relative">
        <DakarMap pins={pins} trail={{ from: pos, to: [destination.lat, destination.lng] }} center={pos} zoom={14} height="100%" />
      </div>
      <aside className="bg-white border-l border-cream-200 p-5 space-y-5 overflow-y-auto">
        <div>
          <div className="text-xs text-ink-500">Commande</div>
          <div className="font-mono text-sm text-ink-900">{params.id}</div>
          <span className="inline-block mt-2 text-xs bg-gold-500 text-ink-900 px-2 py-0.5 rounded-sm font-bold">En route</span>
        </div>
        <DriverCard driver={driver} />
        <EtaBadge initialMinutes={18} />
        <div>
          <h3 className="font-display font-semibold text-ink-900 mb-3">Suivi</h3>
          <GlovoTimeline activeStage="enroute" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-ink-900 mb-3">Discussion</h3>
          <div className="space-y-2">
            {trackingChat.map((m, i) => <ChatBubble key={i} msg={m} />)}
          </div>
        </div>
        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow gap-2">
            <Share2 className="w-4 h-4" /> Partager le suivi par WhatsApp
          </Button>
        </a>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: QA visuel**

Walk wizard end-to-end and click "Voir le suivi" → tracking page. Pin must move toward destination over ~90s. ETA decrements every 5s. WhatsApp button opens `wa.me`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(merchant): tracking page with moving driver pin"
```

---

## Task 29 — Merchant index redirect

**Files:**
- Create: `~/yonne/app/(merchant)/merchant/page.tsx`

- [ ] **Step 1: Redirect to wizard**

```tsx
import { redirect } from "next/navigation";
export default function MerchantIndex() { redirect("/merchant/nouvelle-commande"); }
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(merchant): index redirects to wizard"
```

---

## Task 30 — Polish pass

**Files:**
- Modify: `~/yonne/app/globals.css`
- Modify: `~/yonne/app/layout.tsx` (metadata + favicon)

- [ ] **Step 1: Add subtle scroll polish + selection style + favicon**

Append to `app/globals.css`:
```css
::selection { background: #D4A574; color: #3F2A1F; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #E8DFD0; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #D4A574; }
```

Replace `app/icon.svg` (or create) — wordmark 'y' icon:
```bash
cat > app/icon.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#15803D"/><text x="16" y="22" text-anchor="middle" font-family="Geist, sans-serif" font-weight="700" font-size="18" fill="#FAF7F0">y</text><circle cx="22" cy="11" r="2" fill="#D4A574"/></svg>
EOF
```

- [ ] **Step 2: Update root metadata**

Replace `metadata` in `app/layout.tsx`:
```ts
export const metadata: Metadata = {
  title: "yonne · livraison intelligente Sénégal",
  description: "Plateforme SaaS de livraison last-mile pour le Sénégal et l'Afrique de l'Ouest. Surpasser Glovo grâce à 10 fonctionnalités sans équivalent.",
  themeColor: "#FAF7F0",
};
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(polish): selection style, scrollbar, favicon, metadata"
```

---

## Task 31 — Final QA against acceptance criteria

**Files:** none (verification only)

- [ ] **Step 1: Build production bundle**

```bash
pnpm build
```
Expected: success, no type errors. If any error: fix and re-run.

- [ ] **Step 2: Run production server**

```bash
pnpm start
```
Open `http://localhost:3000`.

- [ ] **Step 3: Walk acceptance criteria from spec § 11**

For each, verify in browser. Record pass/fail:

1. Login redirects to /login
2. `admin@yonne.sn / Admin123!` → admin home
3. `boutique.plateau@gmail.com / Demo123!` → wizard
4. Admin home: 4 KPIs, banner, map with ≥15 driver pins (gold pulsing) + ≥10 order pins (emerald), leaderboard
5. Click sidebar "Tabaski" → page renders with countdown ticking, demand curve, 3 action cards, history banner
6. Wizard step 1: typing "Total" returns ≥3 suggestions
7. Wizard step 2: methods radio works, insurance toggle works
8. Wizard step 3: 1.5s spinner → driver card appears
9. Tracking page: pin moves toward destination
10. ETA decrements every 5s
11. WhatsApp button opens `wa.me/?text=...`
12. LangSwitcher: clicking EN or WO changes the visible "Tabaski dans 7 jours" banner text on admin home
13. No console errors during the full walkthrough

- [ ] **Step 4: Lighthouse**

In Chrome DevTools, run Lighthouse on `http://localhost:3000/admin` (logged in). Target ≥85 on Performance.

If <85, common fixes: pre-size images, add `priority` to above-fold image (none here), reduce initial JS by code-splitting heavy chart imports.

- [ ] **Step 5: Final commit + tag**

```bash
git add -A
git commit -m "chore: pass acceptance criteria for tranche A"
git tag -a v0.1.0-tranche-A -m "YONNE pitch demo · tranche A"
```

---

## Self-review

- ✅ All 5 screens (Login, Admin Home, Tabaski, Wizard, Tracking) have an explicit task
- ✅ Design tokens, fonts, layouts, sidebars, mock data all covered
- ✅ Each task ends with a commit
- ✅ All file paths absolute or unambiguous
- ✅ All non-trivial code is shown literally — no "implement appropriately"
- ✅ Type names consistent across tasks (`Driver`, `Order`, `Landmark`, `ActionPlanItem`, `ChatMessage`)
- ✅ Spec coverage: every §9 screen + §10 real-time + §7 mock data + §11 acceptance criteria implemented

## Spec items intentionally deferred (out of scope per spec §2)

- Backend Laravel · auth réelle · 2FA SMS effective
- Wave / Orange Money / Twilio / WhatsApp intégrations réelles
- PWA Livreur (tranche B)
- Mode sombre
- i18n complet Wolof / Anglais (uniquement 5 strings)
- Tests automatisés
- 9 modules admin restants (Commandes, Livreurs, Commerçants, Finance, Analytics, Surge, Tontine, Hivernage, Paramètres) — accessibles depuis sidebar mais pages 404
