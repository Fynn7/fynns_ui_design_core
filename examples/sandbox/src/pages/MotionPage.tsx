import { Motion } from "../../../gallery/src/Motion";
import { useLocale } from "../i18n";

export function MotionPage() {
  const { t } = useLocale();
  return (
    <Motion
      titles={{
        easing: t("motion.easing"),
        flyout: t("motion.flyout"),
        flyoutHelp: t("motion.flyoutHelp"),
        replay: t("motion.replay"),
      }}
    />
  );
}
