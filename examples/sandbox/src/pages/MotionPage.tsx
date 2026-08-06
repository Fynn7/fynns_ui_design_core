import { Motion } from "./MotionContent";
import { useLocale } from "../i18n";

export function MotionPage() {
  const { t } = useLocale();
  return (
    <Motion
      titles={{
        easing: t("motion.easing"),
        duration: t("motion.duration"),
        flyout: t("motion.flyout"),
        flyoutHelp: t("motion.flyoutHelp"),
        flyoutPanel: t("motion.flyoutPanel"),
        replay: t("motion.replay"),
      }}
    />
  );
}
