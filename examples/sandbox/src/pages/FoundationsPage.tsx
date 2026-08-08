import { Foundations } from "./FoundationsContent";
import { useLocale } from "../i18n";

export function FoundationsPage() {
  const { t } = useLocale();
  return (
    <Foundations
      titles={{
        elevation: t("foundations.elevation"),
        accent: t("foundations.accent"),
        containers: t("foundations.containers"),
        textBorder: t("foundations.textBorder"),
        controlSurfaces: t("foundations.controlSurfaces"),
        legacyColors: t("foundations.legacyColors"),
        semantic: t("foundations.semantic"),
        spacing: t("foundations.spacing"),
        spaceLegacy: t("foundations.spaceLegacy"),
        size: t("foundations.size"),
        type: t("foundations.type"),
        fontFamily: t("foundations.fontFamily"),
        fontFamilyHelp: t("foundations.fontFamilyHelp"),
        fontWeight: t("foundations.fontWeight"),
        radiusShadow: t("foundations.radiusShadow"),
        lightTheme: t("foundations.lightTheme"),
        lightThemeHelp: t("foundations.lightThemeHelp"),
      }}
    />
  );
}
