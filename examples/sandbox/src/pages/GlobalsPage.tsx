import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  Input,
  Select,
  Switch,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale, type MessageKey } from "../i18n";

const SWATCH_KEYS = [
  { key: "xs", usesKey: "globals.swatchXsUses" },
  { key: "sm", usesKey: "globals.swatchSmUses" },
  { key: "md", usesKey: "globals.swatchMdUses" },
  { key: "lg", usesKey: "globals.swatchLgUses" },
  { key: "xl", usesKey: "globals.swatchXlUses" },
] as const satisfies ReadonlyArray<{ key: string; usesKey: MessageKey }>;

/**
 * Live stage proving `--fynns-radius-*` is system-wide: multiple primitives
 * share the same token ladder (not Card-only).
 */
export function GlobalsPage() {
  const { t } = useLocale();
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <div className="sandbox-globals">
      <p className="sandbox-globals-lead">{t("globals.lead")}</p>

      <section className="sandbox-globals-section" aria-label={t("globals.controlsAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.controls")}</h3>
        <div className="sandbox-globals-row">
          <Button size="sm">{t("globals.btnSmall")}</Button>
          <Button>{t("globals.btnDefault")}</Button>
          <Button variant="primary">{t("globals.btnPrimary")}</Button>
          <Button variant="ghost">{t("globals.btnGhost")}</Button>
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Input placeholder={t("globals.inputPlaceholder")} aria-label={t("globals.inputAria")} />
          <Select
            ariaLabel={t("globals.selectAria")}
            value="one"
            options={["one", "two", "three"]}
            onChange={() => {}}
          />
        </div>
        <div className="sandbox-globals-row">
          <Badge>{t("globals.badgeNeutral")}</Badge>
          <Badge variant="accent">{t("globals.badgeAccent")}</Badge>
          <Badge variant="success">{t("globals.badgeSuccess")}</Badge>
          <Switch
            size="sm"
            labelSide="end"
            label={t("globals.switchPill")}
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
        </div>
        <p className="sandbox-help">{t("globals.controlsRadiusHelp")}</p>
      </section>

      <section className="sandbox-globals-section" aria-label={t("globals.surfacesAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.surfaces")}</h3>
        <div className="sandbox-globals-cards">
          {(["elevated", "filled", "outlined"] as const).map((variant) => (
            <Card key={variant} variant={variant} className="sandbox-globals-card">
              <CardHeader title={variant} subtitle={t("globals.cardSubtitle")} />
              <CardContent>{t("globals.cardBody")}</CardContent>
            </Card>
          ))}
        </div>
        <Collapsible title={t("globals.collapsible")} defaultOpen>
          <p className="sandbox-help">{t("globals.collapsibleHelp")}</p>
        </Collapsible>
      </section>

      <section className="sandbox-globals-section" aria-label={t("globals.swatchesAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.swatches")}</h3>
        <p className="sandbox-help">{t("globals.swatchesHelp")}</p>
        <div className="sandbox-globals-swatches">
          {SWATCH_KEYS.map(({ key, usesKey }) => (
            <div key={key} className="sandbox-globals-swatch">
              <div
                className="sandbox-globals-swatch-box"
                style={{ borderRadius: `var(--fynns-radius-${key})` }}
                aria-hidden
              />
              <code>{key}</code>
              <span className="sandbox-globals-swatch-uses">{t(usesKey)}</span>
            </div>
          ))}
        </div>
        <p className="sandbox-help">{t("globals.swatchesSpecialHelp")}</p>
      </section>
    </div>
  );
}
