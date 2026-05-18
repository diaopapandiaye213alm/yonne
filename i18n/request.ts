import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const SUPPORTED = ["fr", "en", "wo"] as const;
type Locale = (typeof SUPPORTED)[number];

function isSupported(v: unknown): v is Locale {
  return SUPPORTED.includes(v as Locale);
}

export default getRequestConfig(async () => {
  const raw = (await cookies()).get("yonne_lang")?.value;
  const locale: Locale = isSupported(raw) ? raw : "fr";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
