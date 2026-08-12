import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  ToggleGroup,
} from "@fynns/ui";
import {
  LOCALES,
  LOCALE_SHORT,
  useLocale,
  type Locale,
} from "../i18n";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type LanguageSwitcherProps = {
  /**
   * `toolbar` — TopAppBar icon mark + menu (checkmarks).
   * `segmented` — compact ToggleGroup for Settings.
   */
  variant?: "toolbar" | "segmented";
  className?: string;
};

/**
 * Sandbox-only chrome: switch UI locale (`en` ↔ `zh`). Persists via
 * `LocaleProvider` / `localStorage`. Not a `@fynns/ui` primitive.
 */
export function LanguageSwitcher({
  variant = "toolbar",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  if (variant === "segmented") {
    return (
      <ToggleGroup
        className={join("sandbox-language-switcher", className)}
        size="compact"
        value={locale}
        onChange={(id) => setLocale(id as Locale)}
        ariaLabel={t("settings.languageAria")}
        options={LOCALES.map((code) => ({
          value: code,
          label:
            code === "en"
              ? t("settings.languageEn")
              : t("settings.languageZh"),
        }))}
      />
    );
  }

  return (
    <DropdownMenu
      className={join("sandbox-language-switcher", className)}
      align="end"
      ariaLabel={t("settings.languageAria")}
      triggerClassName="fynns-btn--ghost fynns-btn--icon sandbox-language-switcher-trigger"
      trigger={
        <span className="sandbox-language-switcher-mark" aria-hidden>
          {LOCALE_SHORT[locale]}
        </span>
      }
    >
      {LOCALES.map((code) => (
        <DropdownMenuCheckboxItem
          key={code}
          checked={locale === code}
          closeOnSelect
          onCheckedChange={(checked) => {
            if (checked) setLocale(code);
          }}
        >
          {code === "en" ? t("settings.languageEn") : t("settings.languageZh")}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenu>
  );
}
