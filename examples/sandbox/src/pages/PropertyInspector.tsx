import {
  Button,
  Collapsible,
  InfoHint,
  Slider,
  SPACE_TOKENS,
} from "@fynns/ui";
import { useMemo } from "react";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { HueWheel } from "../manipulators/HueWheel";
import { BASELINE } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { estimateBrightnessDelta, shiftHexBrightness } from "../theme/colorUtils";
import { ApplyChangesControl } from "./ApplyChangesControl";
import { LayoutChromeSliders } from "./LayoutChromeSliders";

function parsePercent(value: string): number {
  return Number.parseFloat(value) || 0;
}

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

function pxToRem(px: number): string {
  const rem = px / 16;
  return `${Number(rem.toFixed(4))}rem`;
}

const SURFACE_KEYS = [
  {
    cssVar: "--fynns-color-surface-1",
    key: "surface-1",
    labelKey: "inspector.surface1" as const,
    hintKey: "inspector.surface1Hint" as const,
  },
  {
    cssVar: "--fynns-color-surface-4",
    key: "surface-4",
    labelKey: "inspector.surface4" as const,
    hintKey: "inspector.surface4Hint" as const,
  },
  {
    cssVar: "--fynns-color-app-bg",
    key: "app-bg",
    labelKey: "inspector.appBg" as const,
    hintKey: "inspector.appBgHint" as const,
  },
] as const;

const STATE_LAYER_KEYS = [
  { key: "hover", hintKey: "inspector.stateHoverHint" as const },
  { key: "focus", hintKey: "inspector.stateFocusHint" as const },
  { key: "pressed", hintKey: "inspector.statePressedHint" as const },
  { key: "dragged", hintKey: "inspector.stateDraggedHint" as const },
] as const;

/** Full t-shirt ladder — editable in inspector. */
const SPACE_TSHIRT = [
  { key: "2xs", max: 8 },
  { key: "xs", max: 16 },
  { key: "sm", max: 24 },
  { key: "md", max: 32 },
  { key: "lg", max: 40 },
  { key: "xl", max: 48 },
  { key: "2xl", max: 64 },
  { key: "3xl", max: 96 },
] as const;

const SPACE_LEGACY_KEYS = (
  Object.keys(SPACE_TOKENS) as Array<keyof typeof SPACE_TOKENS>
).filter((k) => !(SPACE_TSHIRT.map((r) => r.key) as readonly string[]).includes(k));

const FONT_SIZE_ROWS = [
  { key: "xs", hintKey: "inspector.fontXsHint" as const, max: 18 },
  { key: "sm", hintKey: "inspector.fontSmHint" as const, max: 22 },
  { key: "md", hintKey: "inspector.fontMdHint" as const, max: 28 },
  { key: "lg", hintKey: "inspector.fontLgHint" as const, max: 32 },
  { key: "title-large", hintKey: "inspector.fontTitleLargeHint" as const, max: 36 },
  { key: "xl", hintKey: "inspector.fontXlHint" as const, max: 40 },
  { key: "2xl", hintKey: "inspector.font2xlHint" as const, max: 48 },
] as const;

export function PropertyInspector() {
  const { t, plural } = useLocale();
  const { apply, resolved, draft } = useTokenDraft();

  const hover = parsePercent(resolved("--fynns-state-hover"));
  const focus = parsePercent(resolved("--fynns-state-focus"));
  const pressed = parsePercent(resolved("--fynns-state-pressed"));
  const dragged = parsePercent(resolved("--fynns-state-dragged"));
  const borderStrong = resolved("--fynns-color-border-strong");
  const borderStrongBaseline = BASELINE["--fynns-color-border-strong"] ?? "#164038";
  const borderStrongDelta = estimateBrightnessDelta(borderStrongBaseline, borderStrong);

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
        <header className="sandbox-inspector-head">
          <h2>{t("inspector.propertyTitle")}</h2>
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

        <SandboxHelp text={t("inspector.lightThemeHelp")} />

        <Collapsible title={t("inspector.color")} defaultOpen>
          <div className="sandbox-stack">
            <HueWheel />
            <SandboxHelp text={t("inspector.colorHelp")} />
            {SURFACE_KEYS.map(({ cssVar, key, labelKey, hintKey }) => {
              const baseline = BASELINE[cssVar] ?? "#000000";
              const current = resolved(cssVar);
              const delta = estimateBrightnessDelta(baseline, current);
              const label = t(labelKey);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={label}
                      ariaLabel={`${t("inspector.brightness")} · ${label}`}
                      content={t(hintKey)}
                    />
                    <code>{current}</code>
                  </div>
                  <div
                    className="sandbox-surface-swatch"
                    style={{ background: `var(${cssVar})` }}
                    aria-hidden
                  />
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={t("inspector.brightnessOf", { name: label })}
                      ariaLabel={t("inspector.brightnessOf", { name: label })}
                      content={t("inspector.brightnessHint")}
                    />
                    <code>{delta > 0 ? `+${delta}` : delta}</code>
                  </div>
                  <Slider
                    ariaLabel={`${label} · ${t("inspector.brightness")}`}
                    min={-40}
                    max={40}
                    step={1}
                    value={delta}
                    onChange={(v) =>
                      apply({
                        group: "color",
                        key,
                        value: shiftHexBrightness(baseline, v),
                        source: "slider",
                      })
                    }
                  />
                </div>
              );
            })}
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <InfoHint
                  label={t("inspector.outlineBorder")}
                  ariaLabel={t("inspector.outlineBorderAria")}
                  content={t("inspector.outlineBorderHint")}
                />
                <code>{borderStrong}</code>
              </div>
              <div
                className="sandbox-surface-swatch"
                style={{ background: borderStrong }}
                aria-hidden
              />
              <div className="sandbox-field-row">
                <InfoHint
                  label={t("inspector.outlineBorderBrightness")}
                  ariaLabel={t("inspector.outlineBorderBrightness")}
                  content={t("inspector.outlineBorderHint")}
                />
                <code>{borderStrongDelta > 0 ? `+${borderStrongDelta}` : borderStrongDelta}</code>
              </div>
              <Slider
                ariaLabel={t("inspector.outlineBorderBrightness")}
                min={-40}
                max={40}
                step={1}
                value={borderStrongDelta}
                onChange={(v) =>
                  apply({
                    group: "color",
                    key: "border-strong",
                    value: shiftHexBrightness(borderStrongBaseline, v),
                    source: "slider",
                  })
                }
              />
              <SandboxHelp text={t("inspector.outlineHelp")} />
            </div>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.stateLayers")} defaultOpen>
          <div className="sandbox-stack">
            {STATE_LAYER_KEYS.map(({ key, hintKey }) => {
              const valueByKey = { hover, focus, pressed, dragged } as const;
              const value = valueByKey[key];
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint label={key} ariaLabel={key} content={t(hintKey)} />
                    <code>{value}%</code>
                  </div>
                  <Slider
                    ariaLabel={key}
                    min={0}
                    max={24}
                    step={1}
                    value={value}
                    onChange={(v) =>
                      apply({
                        group: "stateLayer",
                        key,
                        value: `${v}%`,
                        source: "slider",
                      })
                    }
                  />
                </div>
              );
            })}
            <div className="sandbox-state-demo">
              <Button size="sm" variant="tonal">
                {t("inspector.stateDemoSubtitle")}
              </Button>
              <SandboxHelp text={t("inspector.stateDemoBody")} />
            </div>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.spacing")} defaultOpen>
          <div className="sandbox-stack">
            <SandboxHelp text={t("inspector.spacingHelp")} />
            {SPACE_TSHIRT.map(({ key, max }) => {
              const px = parseLengthToPx(resolved(`--fynns-space-${key}`));
              const label = `space-${key}`;
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={label}
                      ariaLabel={label}
                      content={t("inspector.spaceTshirtHint", { key })}
                    />
                    <code>{px}px</code>
                  </div>
                  <Slider
                    ariaLabel={label}
                    min={0}
                    max={max}
                    step={1}
                    value={px}
                    onChange={(v) =>
                      apply({
                        group: "spacing",
                        key,
                        value: pxToRem(v),
                        source: "slider",
                      })
                    }
                  />
                </div>
              );
            })}
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <span>{t("inspector.spaceLegacyTitle")}</span>
              </div>
              <ul className="sandbox-globals-readonly">
                {SPACE_LEGACY_KEYS.map((key) => (
                  <li key={key}>
                    <code>
                      space-{key}: {SPACE_TOKENS[key]}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Collapsible>

        <Collapsible title={t("layoutChrome.collapsible")}>
          <LayoutChromeSliders />
        </Collapsible>

        <Collapsible title={t("inspector.typography")}>
          <div className="sandbox-stack">
            {FONT_SIZE_ROWS.map(({ key, hintKey, max }) => {
              const raw = resolved(`--fynns-font-size-${key}`);
              const px = parseLengthToPx(raw);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={`font-size-${key}`}
                      ariaLabel={`font-size-${key}`}
                      content={t(hintKey as MessageKey)}
                    />
                    <code>{raw}</code>
                  </div>
                  <Slider
                    ariaLabel={`font-size-${key}`}
                    min={10}
                    max={max}
                    step={1}
                    value={px}
                    onChange={(v) =>
                      apply({
                        group: "typography",
                        key,
                        value: pxToRem(v),
                        source: "slider",
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </Collapsible>
      </div>

      <div className="sandbox-inspector-actions">
        <ApplyChangesControl />
      </div>
    </div>
  );
}
