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
  navCommissions:   { fr: "Commissions",      en: "Commissions",    wo: "Commissions" },
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
  navCatalogue:     { fr: "Catalogue",         en: "Catalogue",     wo: "Liste yi" },
  navClients:       { fr: "Clients",           en: "Clients",       wo: "Jëkkër yi" },
  navRapport:       { fr: "Rapport mensuel",   en: "Monthly report", wo: "Rapport bi" },
  navZones:         { fr: "Zones de livraison", en: "Delivery zones", wo: "Seen yoon yi" },

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

  // ── Driver bottom nav ──
  navCarte:         { fr: "Carte",                 en: "Map",               wo: "Kaart" },
  navLivraison:     { fr: "Livraison",             en: "Delivery",          wo: "Yëgël" },
  navGains:         { fr: "Gains",                 en: "Earnings",          wo: "Xaalis" },
  navClassement:    { fr: "Classement",            en: "Ranking",           wo: "Xayma" },
  navProfil:        { fr: "Profil",                en: "Profile",           wo: "Xeex bi" },

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

  // ── Driver historique ──
  pastDeliveries:   { fr: "Vos livraisons passées",              en: "Your past deliveries",        wo: "Sa jën yi bu yëgël" },
  noDeliveries:     { fr: "Aucune livraison pour ce filtre.",    en: "No deliveries for this filter.", wo: "Jën amul ci filtre bii." },
  livraisons:       { fr: "Livraisons",                          en: "Deliveries",                  wo: "Jën yi" },
  totalEarnings:    { fr: "F total",                             en: "Total F",                     wo: "F yépp" },
  perCourse:        { fr: "F / course",                          en: "F / ride",                    wo: "F / jën" },
  exportBtn:        { fr: "Export",                              en: "Export",                      wo: "Jënd" },

  // ── Driver gains ──
  instantWithdraw:  { fr: "Retrait immédiat",                   en: "Instant withdrawal",           wo: "Fëcc bu tammit" },
  salaryAdvance:    { fr: "Avance sur salaire",                  en: "Salary advance",              wo: "Njëkk liggéey" },
  advanceDesc:      { fr: "Recevez jusqu'à 80% de vos gains du jour immédiatement.", en: "Receive up to 80% of today's earnings instantly.", wo: "Jël ñaata 80% xaalis bi tey rekk." },
  requestAdvance:   { fr: "Demander l'avance",                   en: "Request advance",             wo: "Laaj njëkk" },
  todayDeliveries:  { fr: "Livraisons du jour",                  en: "Today's deliveries",          wo: "Jën yi ci tey" },

  // ── Merchant analytics ──
  monthlyRevenue:   { fr: "Revenus mensuels",                   en: "Monthly revenue",              wo: "Xaalis bi wiyu" },
  uniqueClients:    { fr: "Clients uniques",                     en: "Unique clients",              wo: "Jëkkër yu neex" },
  topClients:       { fr: "Top clients",                         en: "Top clients",                 wo: "Jëkkër yu ndaw" },
  yonneCommission:  { fr: "Commission YONNE",                    en: "YONNE commission",            wo: "YONNE njëkk" },
  grossRevenue:     { fr: "Revenus bruts",                       en: "Gross revenue",               wo: "Xaalis bu réér" },
  netReturned:      { fr: "Net reversé",                         en: "Net returned",                wo: "Xaalis bu dëkk" },

  // ── Merchant commandes ──
  totalOrders:      { fr: "Total commandes",                    en: "Total orders",                 wo: "Ñépp komaand" },
  enRouteLabel:     { fr: "En route",                           en: "En route",                     wo: "Ci yoon" },
  livreesLabel:     { fr: "Livrées",                            en: "Delivered",                    wo: "Yëgël" },
  revenuToday:      { fr: "F aujourd'hui",                      en: "F today",                      wo: "F ci tey" },
  resultsCount:     { fr: "résultat",                           en: "result",                       wo: "njëkk" },
  ordersTotal:      { fr: "commandes au total",                 en: "orders in total",              wo: "komaand yépp" },

  // ── Merchant nouvelle commande ──
  wizardSubtitle:   { fr: "3 étapes · dispatch IA automatique", en: "3 steps · AI auto-dispatch",  wo: "3 yoon · dispatch IA" },

  // ── Merchant catalogue ──
  myCatalogue:      { fr: "Mon catalogue",                      en: "My catalogue",                 wo: "Sam liste" },
  addArticle:       { fr: "Ajouter un article",                 en: "Add article",                  wo: "Yokk yoon" },
  inStock:          { fr: "En stock",                           en: "In stock",                     wo: "Am na" },
  outOfStock:       { fr: "Rupture",                            en: "Out of stock",                 wo: "Dafa weex" },

  // ── Admin page titles ──
  analyticsTitle:   { fr: "Analytics avancé",                   en: "Advanced analytics",           wo: "Xabar yu xam-xam" },
  fideliteTitle:    { fr: "Fidélité Livreurs",                   en: "Driver Loyalty",               wo: "Yëgëlkat yi ci dëkk" },
  groupageTitle:    { fr: "Groupage Multi-stops",                en: "Multi-stop Grouping",          wo: "Groupage bu bari" },
  hivernageTitle:   { fr: "Mode Hivernage",                      en: "Rainy Season Mode",            wo: "Nawet" },
  landmarksTitle:   { fr: "Points de Repère",                    en: "Landmarks",                    wo: "Dëkk-dëkk yi" },
  parrainageTitle:  { fr: "Programme Parrainage",                en: "Referral Program",             wo: "Jëg-ànd bu bees" },
  tontineTitle:     { fr: "Tontine Livreurs",                    en: "Driver Tontine",               wo: "Tontine yëgëlkat" },
  carboneTitle:     { fr: "Score Carbone CO₂",                   en: "CO₂ Carbon Score",             wo: "Xayma CO₂" },
  surgeTitle:       { fr: "Surge Pricing",                       en: "Surge Pricing",                wo: "Jëkkër bu yokk" },
  tabaskiTitle:     { fr: "Tabaski 2026",                        en: "Tabaski 2026",                 wo: "Tabaski 2026" },
  clientsTitle:     { fr: "Clients",                             en: "Clients",                      wo: "Jëkkër yi" },
  driversTitle:     { fr: "Livreurs",                            en: "Drivers",                      wo: "Yëgëlkat yi" },
  merchantsTitle:   { fr: "Commerçants",                         en: "Merchants",                    wo: "Jëkërbaat yi" },
  zonesTitle:       { fr: "Zones de livraison",                  en: "Delivery zones",               wo: "Seen yoon yi" },

  // ── Assurance ──
  navAssurance:     { fr: "Assurance Colis",   en: "Parcel Insurance",  wo: "Asuraas colis" },
  assuranceTitle:   { fr: "Assurance Colis",   en: "Parcel Insurance",  wo: "Asuraas colis" },

  // ── Onboarding marchand ──
  navOnboarding:    { fr: "Démarrage",         en: "Get started",       wo: "Tànneef" },
  navSinistre:      { fr: "Litiges",           en: "Claims",            wo: "Litiges" },
  onboardingTitle:  { fr: "Bienvenue sur YONNE !", en: "Welcome to YONNE!", wo: "Dalal YONNE !" },
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
