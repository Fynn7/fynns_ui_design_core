import { Select } from "@fynns/ui";
import { LOCALES, useLocale, type Locale } from "../i18n";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type LanguageSwitcherProps = {
  className?: string;
};

/**
 * Sandbox-only chrome: switch UI locale (`en` ↔ `zh`) via form Select.
 * Persists via `LocaleProvider` / `localStorage`. Not a `@fynns/ui` primitive.
 * Lives on Templates / settings — not duplicated in the TopAppBar.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <Select
      className={join("sandbox-language-select", className)}
      value={locale}
      onChange={(id) => setLocale(id as Locale)}
      ariaLabel={t("settings.languageAria")}
      options={LOCALES.map((code) => ({
        value: code,
        label:
          code === "en" ? t("settings.languageEn") : t("settings.languageZh"),
      }))}
    />
  );
}
