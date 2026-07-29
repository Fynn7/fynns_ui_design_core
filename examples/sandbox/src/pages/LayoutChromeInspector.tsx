import { Collapsible } from "@fynns/ui";
import { useLocale } from "../i18n";
import { ApplyChangesControl } from "./ApplyChangesControl";
import { LayoutChromeSliders } from "./LayoutChromeSliders";

/** Aside for pages without a domain inspector (Motion, Foundations, …). */
export function LayoutChromeInspector() {
  const { t } = useLocale();
  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
        <header className="sandbox-inspector-head">
          <h2>{t("layoutChrome.title")}</h2>
        </header>
        <Collapsible title={t("layoutChrome.collapsible")} defaultOpen>
          <LayoutChromeSliders />
        </Collapsible>
      </div>
      <footer className="sandbox-inspector-actions">
        <ApplyChangesControl />
      </footer>
    </div>
  );
}
