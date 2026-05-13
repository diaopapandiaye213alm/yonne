"use client";
import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "wo", label: "WO", flag: "🇸🇳" },
];

interface Props {
  variant?: "dark" | "light";
}

export function LangSwitcher({ variant = "dark" }: Props) {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-0.5 rounded-lg overflow-hidden border border-emerald-800/60 bg-emerald-900/50">
      {LANGS.map(({ code, label, flag }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1 ${
            lang === code
              ? variant === "dark"
                ? "bg-gold-500 text-ink-900"
                : "bg-emerald-600 text-white"
              : variant === "dark"
                ? "text-emerald-300/60 hover:text-emerald-100 hover:bg-emerald-800/60"
                : "text-ink-500 hover:text-ink-900 hover:bg-cream-100"
          }`}
          title={code === "wo" ? "Wolof" : code === "fr" ? "Français" : "English"}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
