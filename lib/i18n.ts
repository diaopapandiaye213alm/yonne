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

  // ── Navigation admin — core ──
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

  // ── Navigation admin — Communications ──
  navNotifications: { fr: "Notifications",   en: "Notifications",  wo: "Xibaar yi" },
  navSav:           { fr: "SAV & Incidents", en: "Support",        wo: "Ndimbal" },
  navBot:           { fr: "Bot WhatsApp",    en: "WhatsApp Bot",   wo: "Bot WhatsApp" },

  // ── Navigation admin — Opérations ──
  navGroupage:      { fr: "Groupage",        en: "Grouping",       wo: "Groupage" },
  navLandmarks:     { fr: "Landmarks",       en: "Landmarks",      wo: "Dëkk-dëkk yi" },
  navFidelite:      { fr: "Fidélité",        en: "Loyalty",        wo: "Yëgël ci dëkk" },
  navParrainage:    { fr: "Parrainage",      en: "Referral",       wo: "Jëg-ànd" },
  navTontine:       { fr: "Tontine",         en: "Tontine",        wo: "Tontine" },

  // ── Navigation admin — Sénégal ──
  navPriere:        { fr: "Heures de prière", en: "Prayer times",  wo: "Waktu ju njëkk" },
  navHivernage:     { fr: "Hivernage",       en: "Rainy season",   wo: "Nawet" },
  navCarbone:       { fr: "Score CO₂",       en: "CO₂ Score",      wo: "Xayma CO₂" },

  // ── Navigation admin — Système ──
  navApi:           { fr: "API & Webhooks",  en: "API & Webhooks", wo: "API & Webhooks" },

  // ── Sidebar section titles ──
  sectionComms:     { fr: "Communications", en: "Communications", wo: "Xibaar" },
  sectionOps:       { fr: "Opérations",     en: "Operations",     wo: "Liggéey" },
  sectionSenegal:   { fr: "Sénégal",        en: "Senegal",        wo: "Senegaal" },
  sectionSystem:    { fr: "Système",        en: "System",         wo: "Xabal" },

  // ── Navigation merchant ──
  navNewOrder:      { fr: "Nouvelle commande", en: "New order",     wo: "Komaand bu bees" },
  navMyOrders:      { fr: "Mes commandes",     en: "My orders",     wo: "Sam komaand yi" },
  navFinances:      { fr: "Finances",          en: "Finances",      wo: "Xaalis yi" },
  navParams:        { fr: "Paramètres",        en: "Settings",      wo: "Setal yi" },

  // ── Admin dashboard ──
  dashboardLive:    { fr: "En direct",                         en: "Live",                       wo: "Yoon wii" },
  revenusToday:     { fr: "Revenus aujourd'hui",               en: "Revenue today",              wo: "Xaalis ci tey" },
  ordersCount:      { fr: "Commandes",                         en: "Orders",                     wo: "Komaand" },
  driversOnline:    { fr: "Livreurs en ligne",                 en: "Drivers online",             wo: "Yëgëlkat yi ci yoon" },
  avgRating:        { fr: "Note moyenne",                      en: "Average rating",             wo: "Xayma bu cees" },
  vsYesterday:      { fr: "vs hier",                           en: "vs yesterday",               wo: "ak démb" },
  topDrivers:       { fr: "Top livreurs · aujourd'hui",       en: "Top drivers · today",        wo: "Yëgëlkat yu mag · tey" },
  seeAll:           { fr: "Voir tous",                         en: "See all",                    wo: "Xool ñépp" },
  tabaskiAlert:     { fr: "Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt", en: "Tabaski in 7 days — demand peak forecast × 3.2. Action plan ready", wo: "Tabaski 7 fan ak ñàkk — yokk gu mag (× 3.2). Plan biy jëfandikoo prèt" },

  // ── Merchant dashboard ──
  goodMorning:      { fr: "Bonjour",              en: "Good morning",      wo: "Ba ngën def" },
  ordersThisMonth:  { fr: "Commandes ce mois",    en: "Orders this month", wo: "Komaand bi wiyu" },
  revenueThisMonth: { fr: "Revenus ce mois",      en: "Revenue this month", wo: "Xaalis bi wiyu" },
  deliveryRate:     { fr: "Taux livré",            en: "Delivery rate",     wo: "Liggéey yi" },
  newOrder:         { fr: "Nouvelle commande",     en: "New order",         wo: "Komaand bu bees" },
  recentOrders:     { fr: "Dernières commandes",   en: "Recent orders",     wo: "Komaand yi mujj" },
  vsLastMonth:      { fr: "vs mois passé",         en: "vs last month",     wo: "ak wiyu" },

  // ── Driver ──
  myEarnings:       { fr: "Mes gains",             en: "My earnings",       wo: "Sam xaalis yi" },
  courses:          { fr: "Courses",               en: "Rides",             wo: "Ak dem yi" },
  weekBadge:        { fr: "Badge de la semaine",   en: "Week badge",        wo: "Badge bi bes bi" },
  requestWave:      { fr: "Demander un virement Wave", en: "Request Wave transfer", wo: "Laaj xaalis Wave" },
  online:           { fr: "En ligne",              en: "Online",            wo: "Ci yoon" },
  prayerMode:       { fr: "Mode prière",           en: "Prayer mode",       wo: "Njëkk nguuram" },
  thisWeek:         { fr: "Cette semaine",         en: "This week",         wo: "Bes yi ak" },
  driverHistory:    { fr: "Historique",            en: "History",           wo: "Gannaaw yi" },
  driverProfile:    { fr: "Mon profil",            en: "My profile",        wo: "Sa xeex" },

  // ── Orders / Commandes ──
  orderStatus:      { fr: "Statut",               en: "Status",            wo: "Njëkk" },
  filterAll:        { fr: "Tous",                 en: "All",               wo: "Ñépp" },
  filterSearch:     { fr: "Rechercher…",          en: "Search…",           wo: "Seet…" },
  noResults:        { fr: "Aucun résultat",       en: "No results",        wo: "Dara amul" },
  resetFilters:     { fr: "Réinitialiser les filtres", en: "Reset filters", wo: "Tàkk filtri" },
  exportCsv:        { fr: "Export CSV",           en: "Export CSV",        wo: "Jënd CSV" },
  printBon:         { fr: "Bon de livraison",     en: "Delivery note",     wo: "Takk yëgël" },

  // ── Common ──
  save:             { fr: "Enregistrer",          en: "Save",              wo: "Denc" },
  cancel:           { fr: "Annuler",              en: "Cancel",            wo: "Bàyyi" },
  back:             { fr: "Retour",               en: "Back",              wo: "Déllu" },
  loading:          { fr: "Chargement…",          en: "Loading…",          wo: "Yëgël…" },
  apply:            { fr: "Appliquer",            en: "Apply",             wo: "Def" },
  confirm:          { fr: "Confirmer",            en: "Confirm",           wo: "Seeti" },
  language:         { fr: "Langue",               en: "Language",          wo: "Làkk" },
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
