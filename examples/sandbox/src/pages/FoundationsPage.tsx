import { Foundations } from "../../../gallery/src/Foundations";
import { useLocale } from "../i18n";

export function FoundationsPage() {
  const { t } = useLocale();
  return (
    <Foundations
      titles={{
        elevation: t("foundations.elevation"),
        accent: t("foundations.accent"),
        semantic: t("foundations.semantic"),
        spacing: t("foundations.spacing"),
        type: t("foundations.type"),
        radiusShadow: t("foundations.radiusShadow"),
      }}
    />
  );
}
