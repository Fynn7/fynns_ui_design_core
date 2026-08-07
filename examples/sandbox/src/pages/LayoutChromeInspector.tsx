import { useLocale } from "../i18n";
import { LazyCollapsible } from "../components/LazyCollapsible";
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
        <LazyCollapsible title={t("layoutChrome.collapsible")}>
          <LayoutChromeSliders />
        </LazyCollapsible>
      </div>
      <footer className="sandbox-inspector-actions">
        <ApplyChangesControl />
      </footer>
    </div>
  );
}
