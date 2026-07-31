import {
  Button,
  CardActions,
  Collapsible,
  InfoHint,
  Slider,
  Tooltip,
} from "@fynns/ui";
import { useMemo } from "react";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { BASELINE, SANDBOX_RESTING } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { ApplyChangesControl } from "./ApplyChangesControl";
import { LayoutChromeSliders } from "./LayoutChromeSliders";

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

type RadiusRow = {
  key: string;
  label: string;
  max: number;
  usesKey: MessageKey;
  hintKey: MessageKey;
};

/** Every editable `--fynns-radius-*` length step (must match RADIUS_TOKENS). */
const EDITABLE_RADIUS: ReadonlyArray<RadiusRow> = [
  {
    key: "2xs",
    label: "2xs",
    max: 8,
    usesKey: "globalsInspector.radius2xsUses",
    hintKey: "globalsInspector.radius2xsHint",
  },
  {
    key: "xs",
    label: "xs",
    max: 16,
    usesKey: "globalsInspector.radiusXsUses",
    hintKey: "globalsInspector.radiusXsHint",
  },
  {
    key: "sm",
    label: "sm",
    max: 20,
    usesKey: "globalsInspector.radiusSmUses",
    hintKey: "globalsInspector.radiusSmHint",
  },
  {
    key: "md",
    label: "md",
    max: 28,
    usesKey: "globalsInspector.radiusMdUses",
    hintKey: "globalsInspector.radiusMdHint",
  },
  {
    key: "lg",
    label: "lg",
    max: 32,
    usesKey: "globalsInspector.radiusLgUses",
    hintKey: "globalsInspector.radiusLgHint",
  },
  {
    key: "xl",
    label: "xl",
    max: 40,
    usesKey: "globalsInspector.radiusXlUses",
    hintKey: "globalsInspector.radiusXlHint",
  },
  {
    key: "3xl",
    label: "3xl",
    max: 56,
    usesKey: "globalsInspector.radius3xlUses",
    hintKey: "globalsInspector.radius3xlHint",
  },
];

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

const LADDER_KEYS = EDITABLE_RADIUS.map((r) => r.key);

/**
 * Global shape inspector: edits `--fynns-radius-*` for the whole UI core.
 * Must list every key from RADIUS_TOKENS (editable or read-only).
 */
export function GlobalsInspector() {
  const { t, plural } = useLocale();
  const { apply, resolved, draft, mergeOverrides } = useTokenDraft();

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  const resetShapeLadder = () => {
    const patch: Record<string, string> = {};
    for (const key of LADDER_KEYS) {
      const cssVar = `--fynns-radius-${key}`;
      patch[cssVar] = SANDBOX_RESTING[cssVar] ?? BASELINE[cssVar] ?? "0";
    }
    mergeOverrides(patch, { source: "reset", group: "radius" });
    /* feedback removed with toast purge */
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
            <SandboxHelp text={t("globalsInspector.shapeLadderHelp")} />
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
