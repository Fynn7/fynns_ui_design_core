import { ToggleGroup } from "@fynns/ui";
import { LOCALES, useLocale, type Locale } from "../i18n";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type LanguageSwitcherProps = {
  className?: string;
};

/**
 * Sandbox **Settings** body: switch UI locale (`en` ↔ `zh`) via compact
 * `ToggleGroup` inside a `FieldBlock` / form host. Persists via
 * `LocaleProvider` / `localStorage`. Not a `@fynns/ui` primitive — consumers
 * copy this recipe into the Settings screen opened from `navFooter` gear.
 * **Never** park language in TopAppBar `trailing` (neither ToggleGroup nor
 * Select). Live: Layouts `#layouts-demo-shell` Settings Card + Templates.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <ToggleGroup
      className={join("sandbox-language-switcher", className)}
      size="compact"
      showCheck={false}
      value={locale}
      onChange={(id) => setLocale(id as Locale)}
      ariaLabel={t("settings.languageAria")}
      options={LOCALES.map((code) => ({
        value: code,
        label:
          code === "en" ? t("settings.languageEn") : t("settings.languageZh"),
        ariaLabel:
          code === "en" ? t("settings.languageEn") : t("settings.languageZh"),
      }))}
    />
  );
}
