import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  InfoHint,
  Select,
  Slider,
  toast,
} from "@fynns/ui";
import { useMemo, useState } from "react";
import { CARD_PRESETS } from "../../presets/presets";
import { useLocale, type MessageKey } from "../i18n";
import { HueWheel } from "../manipulators/HueWheel";
import { BASELINE, SANDBOX_BLOCK_GAP_VAR } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { estimateBrightnessDelta, shiftHexBrightness } from "../theme/colorUtils";
import { ApplyChangesControl } from "./ApplyChangesControl";
import { ApplyRecipeControl } from "./ApplyRecipeControl";
import { CollapsibleCardRecipeInspector } from "./CollapsibleCardRecipeInspector";
import { usePlaygroundTarget } from "../state/PlaygroundTargetProvider";

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

const SHADOW_XS_PRESET_DEFS = [
  { id: "none", labelKey: "inspector.shadowNone" as const, value: "none" },
  {
    id: "soft",
    labelKey: "inspector.shadowSoft" as const,
    value: "0 1px 2px rgba(0, 0, 0, 0.12)",
  },
  {
    id: "default",
    labelKey: "inspector.shadowDefault" as const,
    value: BASELINE["--fynns-shadow-xs"] ?? "0 1px 2px rgba(0, 0, 0, 0.22)",
  },
  {
    id: "strong",
    labelKey: "inspector.shadowStrong" as const,
    value: "0 2px 8px rgba(0, 0, 0, 0.4)",
  },
] as const;

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

const SPACE_KEYS = [
  {
    key: "lg",
    labelKey: "inspector.spaceLg" as const,
    hintKey: "inspector.spaceLgHint" as const,
  },
  {
    key: "md",
    labelKey: "inspector.spaceMd" as const,
    hintKey: "inspector.spaceMdHint" as const,
  },
  {
    key: "sm",
    labelKey: "inspector.spaceSm" as const,
    hintKey: "inspector.spaceSmHint" as const,
  },
] as const;

const FONT_SIZE_HINT_KEYS = {
  sm: "inspector.fontSmHint",
  md: "inspector.fontMdHint",
  lg: "inspector.fontLgHint",
} as const satisfies Record<"sm" | "md" | "lg", MessageKey>;

const CARD_PRESET_LABEL_KEYS: Record<string, { label: MessageKey; desc: MessageKey }> = {
  "stronger-elevation": {
    label: "preset.strongerElev",
    desc: "preset.strongerElevDesc",
  },
  "softer-state-layers": {
    label: "preset.softerState",
    desc: "preset.softerStateDesc",
  },
};

function matchShadowPreset(value: string): string {
  const hit = SHADOW_XS_PRESET_DEFS.find((p) => p.value === value);
  return hit?.id ?? "custom";
}

export function PropertyInspector() {
  const { t, plural } = useLocale();
  const { apply, mergeOverrides, resolved, loadPreset, draft } = useTokenDraft();
  const { target } = usePlaygroundTarget();
  const [presetId, setPresetId] = useState(CARD_PRESETS[0]?.id ?? "");

  const hover = parsePercent(resolved("--fynns-state-hover"));
  const focus = parsePercent(resolved("--fynns-state-focus"));
  const pressed = parsePercent(resolved("--fynns-state-pressed"));
  const dragged = parsePercent(resolved("--fynns-state-dragged"));
  const spaceLgPx = parseLengthToPx(resolved("--fynns-space-lg"));
  const spaceMdPx = parseLengthToPx(resolved("--fynns-space-md"));
  const spaceSmPx = parseLengthToPx(resolved("--fynns-space-sm"));
  const blockGapPx = parseLengthToPx(resolved(SANDBOX_BLOCK_GAP_VAR));
  const shadowXs = resolved("--fynns-shadow-xs");
  const shadowPreset = matchShadowPreset(shadowXs);
  const borderStrong = resolved("--fynns-color-border-strong");

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  const presetOptions = CARD_PRESETS.map((p) => {
    const keys = CARD_PRESET_LABEL_KEYS[p.id];
    return {
      value: p.id,
      label: keys ? t(keys.label) : p.label,
    };
  });

  const activePresetDesc = (() => {
    const keys = CARD_PRESET_LABEL_KEYS[presetId];
    if (keys) return t(keys.desc);
    return CARD_PRESETS.find((p) => p.id === presetId)?.description;
  })();

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

        <Collapsible title={t("inspector.presets")} defaultOpen>
          <div className="sandbox-stack">
            <div className="sandbox-field">
              <Select
                ariaLabel={t("inspector.presetAria")}
                value={presetId}
                options={presetOptions}
                onChange={setPresetId}
              />
            </div>
            <p className="sandbox-help">{activePresetDesc}</p>
            <div className="sandbox-field">
              <Button
                size="sm"
                onClick={() => {
                  const preset = CARD_PRESETS.find((p) => p.id === presetId);
                  if (!preset) return;
                  loadPreset(preset.overrides);
                  const keys = CARD_PRESET_LABEL_KEYS[preset.id];
                  toast.message(
                    t("inspector.loadedPreset", {
                      label: keys ? t(keys.label) : preset.label,
                    }),
                  );
                }}
              >
                {t("inspector.applyPreset")}
              </Button>
            </div>
            <p className="sandbox-help">{t("inspector.presetShapeNote")}</p>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.color")} defaultOpen>
          <div className="sandbox-stack">
            <HueWheel />
            <p className="sandbox-help">{t("inspector.colorHelp")}</p>
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
                      label={t("inspector.brightness")}
                      ariaLabel={`${t("inspector.brightness")} · ${label}`}
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
              <Slider
                ariaLabel={t("inspector.outlineBorderBrightness")}
                min={-40}
                max={40}
                step={1}
                value={estimateBrightnessDelta(
                  BASELINE["--fynns-color-border-strong"] ?? "#164038",
                  borderStrong,
                )}
                onChange={(v) =>
                  apply({
                    group: "color",
                    key: "border-strong",
                    value: shiftHexBrightness(
                      BASELINE["--fynns-color-border-strong"] ?? "#164038",
                      v,
                    ),
                    source: "slider",
                  })
                }
              />
              <p className="sandbox-help">{t("inspector.outlineHelp")}</p>
            </div>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.elevation")} defaultOpen>
          <div className="sandbox-stack">
            <div className="sandbox-elev-ladder">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="sandbox-elev-step"
                  style={{
                    background:
                      level === 0
                        ? "var(--fynns-color-app-bg)"
                        : `var(--fynns-color-surface-${level})`,
                  }}
                >
                  L{level}
                </div>
              ))}
            </div>
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <InfoHint
                  label={t("inspector.elevatedShadow")}
                  ariaLabel={t("inspector.elevatedShadowAria")}
                  content={t("inspector.elevatedShadowHint")}
                />
                <code>{shadowPreset}</code>
              </div>
              <Select
                ariaLabel={t("inspector.elevatedShadowSelect")}
                value={shadowPreset === "custom" ? "default" : shadowPreset}
                options={SHADOW_XS_PRESET_DEFS.map((p) => ({
                  value: p.id,
                  label: t(p.labelKey),
                }))}
                onChange={(id) => {
                  const preset = SHADOW_XS_PRESET_DEFS.find((p) => p.id === id);
                  if (!preset) return;
                  apply({
                    group: "shadow",
                    key: "xs",
                    value: preset.value,
                    source: "preset",
                  });
                }}
              />
              <p className="sandbox-help">{t("inspector.elevationHelp")}</p>
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
            <Card variant="filled" interactive className="sandbox-state-demo">
              <CardHeader
                title={t("inspector.stateDemoTitle")}
                subtitle={t("inspector.stateDemoSubtitle")}
              />
              <CardContent>{t("inspector.stateDemoBody")}</CardContent>
            </Card>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.spacing")} defaultOpen>
          <div className="sandbox-stack">
            <p className="sandbox-help">{t("inspector.spacingHelp")}</p>
            {SPACE_KEYS.map(({ key, labelKey, hintKey }) => {
              const pxByKey = { lg: spaceLgPx, md: spaceMdPx, sm: spaceSmPx } as const;
              const px = pxByKey[key];
              const label = t(labelKey);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint label={label} ariaLabel={label} content={t(hintKey)} />
                    <code>{px}px</code>
                  </div>
                  <Slider
                    ariaLabel={label}
                    min={4}
                    max={32}
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
            <p className="sandbox-help">{t("inspector.blockGapHelp")}</p>
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <InfoHint
                  label={t("inspector.blockGap")}
                  ariaLabel={t("inspector.blockGapAria")}
                  content={t("inspector.blockGapHint")}
                />
                <code>{blockGapPx}px</code>
              </div>
              <Slider
                ariaLabel={t("inspector.blockGapSlider")}
                min={0}
                max={32}
                step={1}
                value={blockGapPx}
                onChange={(v) =>
                  mergeOverrides(
                    { [SANDBOX_BLOCK_GAP_VAR]: pxToRem(v) },
                    { source: "slider", coalesce: true, group: "spacing" },
                  )
                }
              />
            </div>
          </div>
        </Collapsible>

        <Collapsible title={t("inspector.typography")}>
          <div className="sandbox-stack">
            {(["sm", "md", "lg"] as const).map((key) => {
              const raw = resolved(`--fynns-font-size-${key}`);
              const px = parseLengthToPx(raw);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={`font-size-${key}`}
                      ariaLabel={`font-size-${key}`}
                      content={t(FONT_SIZE_HINT_KEYS[key])}
                    />
                    <code>{raw}</code>
                  </div>
                  <Slider
                    ariaLabel={`font-size-${key}`}
                    min={10}
                    max={28}
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

        {target === "collapsible-card" ? <CollapsibleCardRecipeInspector /> : null}
      </div>

      <div className="sandbox-inspector-actions">
        <ApplyChangesControl />
        {target === "collapsible-card" ? <ApplyRecipeControl /> : null}
      </div>
    </div>
  );
}
