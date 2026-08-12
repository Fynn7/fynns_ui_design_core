/** Supported sandbox UI locales. */
export type Locale = "en" | "zh";

export const LOCALES: readonly Locale[] = ["en", "zh"] as const;

export const LOCALE_STORAGE_KEY = "fynns-sandbox-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

/** Compact chrome mark for the topbar language control. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  zh: "中",
};
