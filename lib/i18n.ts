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
