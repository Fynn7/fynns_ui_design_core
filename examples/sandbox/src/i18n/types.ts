/** Supported sandbox UI locales. */
export type Locale = "en" | "zh";

export const LOCALES: readonly Locale[] = ["en", "zh"] as const;

export const LOCALE_STORAGE_KEY = "fynns-sandbox-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};
