import {
  Button,
  CardActions,
  Collapsible,
  InfoHint,
  Slider,
  toast,
  Tooltip,
} from "@fynns/ui";
import { useMemo } from "react";
import { useLocale } from "../i18n";
import { BASELINE } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { ApplyChangesControl } from "./ApplyChangesControl";

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

const EDITABLE_RADIUS = [
  {
    key: "xs",
    label: "xs",
    max: 16,
    usesKey: "globalsInspector.radiusXsUses" as const,
    hintKey: "globalsInspector.radiusXsHint" as const,
  },
  {
    key: "sm",
    label: "sm",
    max: 20,
    usesKey: "globalsInspector.radiusSmUses" as const,
    hintKey: "globalsInspector.radiusSmHint" as const,
  },
  {
    key: "md",
    label: "md",
    max: 28,
    usesKey: "globalsInspector.radiusMdUses" as const,
    hintKey: "globalsInspector.radiusMdHint" as const,
  },
  {
    key: "lg",
    label: "lg",
    max: 32,
    usesKey: "globalsInspector.radiusLgUses" as const,
    hintKey: "globalsInspector.radiusLgHint" as const,
  },
  {
    key: "xl",
    label: "xl",
    max: 40,
    usesKey: "globalsInspector.radiusXlUses" as const,
    hintKey: "globalsInspector.radiusXlHint" as const,
  },
] as const;

const READONLY_RADIUS = [
  {
    key: "none",
    label: "none",
    usesKey: "globalsInspector.radiusNoneUses" as const,
    hintKey: "globalsInspector.radiusNoneHint" as const,
  },
  {
    key: "pill",
    label: "pill",
    usesKey: "globalsInspector.radiusPillUses" as const,
    hintKey: "globalsInspector.radiusPillHint" as const,
  },
  {
    key: "round",
    label: "round",
    usesKey: "globalsInspector.radiusRoundUses" as const,
    hintKey: "globalsInspector.radiusRoundHint" as const,
  },
] as const;

const LADDER_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Global shape inspector: edits `--fynns-radius-*` for the whole UI core.
 */
export function GlobalsInspector() {
  const { t, plural } = useLocale();
  const { apply, resolved, draft, mergeOverrides } = useTokenDraft();

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  const resetShapeLadder = () => {
    const patch: Record<string, string> = {};
    for (const key of LADDER_KEYS) {
      const cssVar = `--fynns-radius-${key}`;
      patch[cssVar] = BASELINE[cssVar] ?? "0";
    }
    mergeOverrides(patch, { source: "reset", group: "radius" });
    toast.message(t("globalsInspector.toastReset"));
  };

  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
        <header className="sandbox-inspector-head">
          <h2>{t("inspector.globalTitle")}</h2>
          <span className="sandbox-inspector-meta">
            <InfoHint
              label={t("inspector.overrides", {
                count: overrideCount,
                plural: plural(overrideCount),
              })}
              ariaLabel={t("inspector.overridesAria")}
              content={t("inspector.overridesHint")}
            />
          </span>
        </header>

        <Collapsible title={t("globalsInspector.shapeLadder")} defaultOpen>
          <div className="sandbox-stack">
            <p className="sandbox-help">{t("globalsInspector.shapeLadderHelp")}</p>
            {EDITABLE_RADIUS.map(({ key, label, max, usesKey, hintKey }) => {
              const cssVar = `--fynns-radius-${key}`;
              const px = parseLengthToPx(resolved(cssVar));
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={
                        <span className="sandbox-radius-label">
                          <code>radius-{label}</code>
                          <span className="sandbox-radius-uses">{t(usesKey)}</span>
                        </span>
                      }
                      ariaLabel={`radius-${label}: ${t(usesKey)}`}
                      content={t(hintKey)}
                    />
                    <code>{px}px</code>
                  </div>
                  <Slider
                    ariaLabel={`radius-${label}`}
                    min={0}
                    max={max}
                    step={1}
                    value={px}
                    onChange={(v) =>
                      apply({ group: "radius", key, value: `${v}px`, source: "slider" })
                    }
                  />
                </div>
              );
            })}
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <span>{t("globalsInspector.specialReadonly")}</span>
              </div>
              <ul className="sandbox-globals-readonly">
                {READONLY_RADIUS.map(({ key, label, usesKey, hintKey }) => (
                  <li key={key}>
                    <InfoHint
                      label={
                        <span className="sandbox-radius-label">
                          <code>
                            {label}:{" "}
                            {resolved(`--fynns-radius-${key}`) || BASELINE[`--fynns-radius-${key}`]}
                          </code>
                          <span className="sandbox-radius-uses">{t(usesKey)}</span>
                        </span>
                      }
                      ariaLabel={`radius-${label}: ${t(usesKey)}`}
                      content={t(hintKey)}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <CardActions align="end" className="sandbox-field-actions">
              <Tooltip content={t("globalsInspector.resetLadderTip")}>
                <Button size="sm" variant="ghost" onClick={resetShapeLadder}>
                  {t("globalsInspector.resetLadder")}
                </Button>
              </Tooltip>
            </CardActions>
          </div>
        </Collapsible>
      </div>

      <footer className="sandbox-inspector-actions">
        <ApplyChangesControl />
      </footer>
    </div>
  );
}
