"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: Lang[] = ["fr", "en", "wo"];

export function LangSwitcher() {
  const locale = useLocale() as Lang;
  const { setLang } = useLang();
  const router = useRouter();

  function changeLang(l: Lang) {
    document.cookie = `yonne_lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setLang(l);
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-0 rounded-md bg-cream-100 p-1">
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => changeLang(l)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
            locale === l ? "bg-white text-emerald-500 shadow-card" : "text-ink-500 hover:text-ink-900"
          )}
          aria-pressed={locale === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
