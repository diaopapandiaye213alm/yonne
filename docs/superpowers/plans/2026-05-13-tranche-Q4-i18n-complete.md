# Tranche Q4 — i18n Complète Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Étendre le système i18n de 5 à ~60 clés couvrant toutes les pages, et appliquer les traductions sur les pages principales.

**Architecture:** Expansion de `lib/i18n.ts` + hook `useT()` convenience + application sur 8 pages prioritaires (admin dashboard, merchant dashboard, login, commandes, livreurs, marchands, driver profil, driver gains).

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Zustand (store i18n existant)

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/i18n.ts` | Modifier — 60+ clés FR/EN/WO + hook useT() |
| `app/(auth)/login/page.tsx` | Modifier — appliquer t() |
| `app/(admin)/admin/page.tsx` | Modifier — appliquer t() |
| `app/(merchant)/merchant/page.tsx` | Modifier — appliquer t() |
| `app/(driver)/driver/gains/page.tsx` | Modifier — appliquer t() |
| `app/(driver)/driver/profil/page.tsx` | Modifier — appliquer t() |
| `components/layout/AdminSidebar.tsx` | Modifier — labels traduits |
| `components/layout/MerchantSidebar.tsx` | Modifier — labels traduits |

---

## Task 1 : Étendre lib/i18n.ts

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1 : Remplacer `lib/i18n.ts` entièrement**

```ts
// lib/i18n.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "fr" | "en" | "wo";

const dict = {
  // ── Auth ──
  loginTitle:       { fr: "Connexion",                         en: "Sign in",                      wo: "Dugg" },
  loginSubtitle:    { fr: "Accédez à votre espace YONNE",      en: "Access your YONNE space",      wo: "Dugg ci sa bunt yi YONNE" },
  loginEmail:       { fr: "Email",                             en: "Email",                        wo: "Email" },
  loginPassword:    { fr: "Mot de passe",                      en: "Password",                     wo: "Kàddug ndimbal" },
  loginCta:         { fr: "Se connecter",                      en: "Sign in",                      wo: "Dugg" },
  loginLoading:     { fr: "Connexion…",                        en: "Signing in…",                  wo: "Dugg rekk…" },
  loginForgot:      { fr: "Mot de passe oublié ?",             en: "Forgot password?",             wo: "Defal kàddu ak dëkk?" },
  loginDemoTitle:   { fr: "Comptes de démo",                   en: "Demo accounts",                wo: "Xeltu yi ci demo" },
  loginError:       { fr: "Email ou mot de passe invalide.",   en: "Invalid email or password.",   wo: "Email walla kàddu bu baax amul." },
  loginTagline:     { fr: "Livraison intelligente · Sénégal",  en: "Smart delivery · Senegal",     wo: "Yëgël bu xam-xam · Senegaal" },

  // ── Navigation admin ──
  navHome:          { fr: "Accueil",          en: "Home",           wo: "Kër gi" },
  navOrders:        { fr: "Commandes",        en: "Orders",         wo: "Komaand yi" },
  navDrivers:       { fr: "Livreurs",         en: "Drivers",        wo: "Yëgëlkat yi" },
  navMerchants:     { fr: "Commerçants",      en: "Merchants",      wo: "Jëkërbaat yi" },
  navFinance:       { fr: "Finance",          en: "Finance",        wo: "Xaalis" },
  navAnalytics:     { fr: "Analytics",        en: "Analytics",      wo: "Xabar yi" },
  navSurge:         { fr: "Surge",            en: "Surge",          wo: "Surge" },
  navTabaski:       { fr: "Tabaski",          en: "Tabaski",        wo: "Tabaski" },
  navSettings:      { fr: "Paramètres",       en: "Settings",       wo: "Setal yi" },
  navLogout:        { fr: "Déconnexion",      en: "Sign out",       wo: "Génn" },

  // ── Navigation merchant ──
  navNewOrder:      { fr: "Nouvelle commande", en: "New order",     wo: "Komaand bu bees" },
  navMyOrders:      { fr: "Mes commandes",     en: "My orders",     wo: "Sam komaand yi" },
  navFinances:      { fr: "Finances",          en: "Finances",      wo: "Xaalis yi" },
  navParams:        { fr: "Paramètres",        en: "Settings",      wo: "Setal yi" },

  // ── Admin dashboard ──
  dashboardLive:    { fr: "En direct",                      en: "Live",                       wo: "Yoon wii" },
  revenusToday:     { fr: "Revenus aujourd'hui",            en: "Revenue today",              wo: "Xaalis ci tey" },
  ordersCount:      { fr: "Commandes",                      en: "Orders",                     wo: "Komaand" },
  driversOnline:    { fr: "Livreurs en ligne",              en: "Drivers online",             wo: "Yëgëlkat yi ci yoon" },
  avgRating:        { fr: "Note moyenne",                   en: "Average rating",             wo: "Xayma bu cees" },
  vsYesterday:      { fr: "vs hier",                        en: "vs yesterday",               wo: "ak démb" },
  topDrivers:       { fr: "Top livreurs · aujourd'hui",    en: "Top drivers · today",        wo: "Yëgëlkat yu mag · tey" },
  seeAll:           { fr: "Voir tous",                      en: "See all",                    wo: "Xool ñépp" },
  tabaskiAlert:     { fr: "Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt", en: "Tabaski in 7 days — demand peak forecast × 3.2. Action plan ready", wo: "Tabaski 7 fan ak ñàkk — yokk gu mag (× 3.2). Plan biy jëfandikoo prèt" },

  // ── Merchant dashboard ──
  goodMorning:      { fr: "Bonjour",           en: "Good morning",   wo: "Ba ngën def" },
  ordersThisMonth:  { fr: "Commandes ce mois", en: "Orders this month", wo: "Komaand bi wiyu" },
  revenueThisMonth: { fr: "Revenus ce mois",   en: "Revenue this month", wo: "Xaalis bi wiyu" },
  deliveryRate:     { fr: "Taux livré",         en: "Delivery rate",  wo: "Liggéey yi" },
  newOrder:         { fr: "Nouvelle commande",  en: "New order",      wo: "Komaand bu bees" },
  recentOrders:     { fr: "Dernières commandes", en: "Recent orders", wo: "Komaand yi mujj" },
  vsLastMonth:      { fr: "vs mois passé",      en: "vs last month",  wo: "ak wiyu" },

  // ── Driver ──
  myEarnings:       { fr: "Mes gains",          en: "My earnings",    wo: "Sam xaalis yi" },
  courses:          { fr: "Courses",            en: "Rides",          wo: "Ak dem yi" },
  weekBadge:        { fr: "Badge de la semaine", en: "Week badge",    wo: "Badge bi bes bi" },
  requestWave:      { fr: "Demander un virement Wave", en: "Request Wave transfer", wo: "Laaj xaalis Wave" },
  online:           { fr: "En ligne",           en: "Online",         wo: "Ci yoon" },
  prayerMode:       { fr: "Mode prière",        en: "Prayer mode",    wo: "Njëkk nguuram" },
  thisWeek:         { fr: "Cette semaine",      en: "This week",      wo: "Bes yi ak" },

  // ── Orders ──
  orderStatus: {
    fr: "Statut",  en: "Status",  wo: "Njëkk"
  },
  filterAll:        { fr: "Tous",            en: "All",          wo: "Ñépp" },
  filterSearch:     { fr: "Rechercher…",     en: "Search…",      wo: "Seet…" },
  noResults:        { fr: "Aucun résultat",  en: "No results",   wo: "Dara amul" },
  resetFilters:     { fr: "Réinitialiser les filtres", en: "Reset filters", wo: "Tàkk filtri" },

  // ── Common ──
  save:             { fr: "Enregistrer",    en: "Save",         wo: "Denc" },
  cancel:           { fr: "Annuler",        en: "Cancel",       wo: "Bàyyi" },
  back:             { fr: "Retour",         en: "Back",         wo: "Déllu" },
  loading:          { fr: "Chargement…",   en: "Loading…",     wo: "Yëgël…" },
  apply:            { fr: "Appliquer",      en: "Apply",        wo: "Def" },
  confirm:          { fr: "Confirmer",      en: "Confirm",      wo: "Seeti" },
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

export function useT() {
  const lang = useLang(s => s.lang);
  return (key: StringKey) => t(key, lang);
}
```

- [ ] **Step 2 : TypeScript check**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
cd /home/papa-ndiaye-diao/yonne && git add lib/i18n.ts && git commit -m "feat(i18n): expansion dictionnaire 5 → 60 clés + hook useT()"
```

---

## Task 2 : Appliquer i18n sur AdminSidebar + MerchantSidebar

**Files:**
- Modify: `components/layout/AdminSidebar.tsx`
- Modify: `components/layout/MerchantSidebar.tsx`

- [ ] **Step 1 : Mettre à jour `components/layout/AdminSidebar.tsx`**

Lire le fichier actuel, puis :
1. Importer `useT` depuis `@/lib/i18n`
2. Appeler `const t = useT()` dans le composant
3. Remplacer les labels hardcodés par les appels `t()` correspondants :
   - "Accueil" → `t("navHome")`
   - "Commandes" → `t("navOrders")`
   - "Livreurs" → `t("navDrivers")`
   - "Commerçants" → `t("navMerchants")`
   - "Finance" → `t("navFinance")`
   - "Analytics" → `t("navAnalytics")`
   - "Surge" → `t("navSurge")`
   - "Tabaski" → `t("navTabaski")`
   - "Paramètres" → `t("navSettings")`
   - Bouton déconnexion → `t("navLogout")`

- [ ] **Step 2 : Mettre à jour `components/layout/MerchantSidebar.tsx`**

Même processus :
   - "Accueil" → `t("navHome")`
   - "Nouvelle commande" → `t("navNewOrder")`
   - "Mes commandes" → `t("navMyOrders")`
   - "Finances" → `t("navFinances")`
   - "Paramètres" → `t("navParams")`
   - Bouton déconnexion → `t("navLogout")`

- [ ] **Step 3 : Build + commit**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add components/layout/AdminSidebar.tsx components/layout/MerchantSidebar.tsx && git commit -m "feat(i18n): sidebars admin + merchant traduits (navHome/navOrders/…)"
```

---

## Task 3 : Appliquer i18n sur les pages prioritaires

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(driver)/driver/gains/page.tsx`
- Modify: `app/(driver)/driver/profil/page.tsx`

- [ ] **Step 1 : Login — appliquer useT()**

Dans `app/(auth)/login/page.tsx` :
1. Importer `useT` depuis `@/lib/i18n`
2. Appeler `const t = useT()` dans le composant
3. Remplacer :
   - Titre "Connexion" → `t("loginTitle")`
   - Sous-titre "Accédez à votre espace YONNE" → `t("loginSubtitle")`
   - Label "Email" → `t("loginEmail")`
   - Label "Mot de passe" → `t("loginPassword")`
   - Bouton "Se connecter" / "Connexion…" → `t(loading ? "loginLoading" : "loginCta")`
   - "Mot de passe oublié ?" → `t("loginForgot")`
   - "Comptes de démo" → `t("loginDemoTitle")`
   - Message d'erreur réseau/invalide → `t("loginError")`

- [ ] **Step 2 : Driver gains — appliquer useT()**

Dans `app/(driver)/driver/gains/page.tsx` :
1. Importer `useT` depuis `@/lib/i18n`
2. Appeler `const t = useT()` dans le composant
3. Remplacer :
   - "Mes gains" → `t("myEarnings")`
   - "Courses" → `t("courses")`
   - "Cette semaine" → `t("thisWeek")`
   - "Badge de la semaine" → `t("weekBadge")`
   - "Demander un virement Wave" → `t("requestWave")`

- [ ] **Step 3 : Driver profil — appliquer useT()**

Dans `app/(driver)/driver/profil/page.tsx` :
1. Importer `useT` depuis `@/lib/i18n`
2. Appeler `const t = useT()` dans le composant
3. Remplacer :
   - "En ligne" → `t("online")`
   - "Mode prière" → `t("prayerMode")`

- [ ] **Step 4 : Build + commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(auth)/login/page.tsx" "app/(driver)/driver/gains/page.tsx" "app/(driver)/driver/profil/page.tsx" && git commit -m "feat(i18n): login + driver gains + driver profil traduits" && git tag v2.3.0-tranche-Q4
```
