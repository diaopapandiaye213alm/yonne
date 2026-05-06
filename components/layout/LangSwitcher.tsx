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
