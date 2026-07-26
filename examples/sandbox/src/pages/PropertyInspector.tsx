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
  Tooltip,
} from "@fynns/ui";
import { useMemo, useState } from "react";
import { CARD_PRESETS } from "../../presets/presets";
import { HueWheel } from "../manipulators/HueWheel";
import { BASELINE, SANDBOX_BLOCK_GAP_VAR } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { estimateBrightnessDelta, shiftHexBrightness } from "../theme/colorUtils";
import { ApplyChangesControl } from "./ApplyChangesControl";

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

const SHADOW_XS_PRESETS = [
  { id: "none", label: "None", value: "none" },
  { id: "soft", label: "Soft", value: "0 1px 2px rgba(0, 0, 0, 0.12)" },
  {
    id: "default",
    label: "Default",
    value: BASELINE["--fynns-shadow-xs"] ?? "0 1px 2px rgba(0, 0, 0, 0.22)",
  },
  { id: "strong", label: "Strong", value: "0 2px 8px rgba(0, 0, 0, 0.4)" },
] as const;

const SURFACE_KEYS = [
  {
    cssVar: "--fynns-color-surface-1",
    key: "surface-1",
    label: "Elevated (surface-1)",
    hint: "Elevation 1 panel surface — resting fill for elevated Card and sidebar chrome.",
  },
  {
    cssVar: "--fynns-color-surface-4",
    key: "surface-4",
    label: "Filled (surface-4)",
    hint: "Elevation 4 filled surface — filled Card and dragged / emphasis fills.",
  },
  {
    cssVar: "--fynns-color-app-bg",
    key: "app-bg",
    label: "Outlined (app-bg)",
    hint: "App background — outlined Card sits on this; lowest rung of the elevation ladder.",
  },
] as const;

const STATE_LAYER_KEYS = [
  {
    key: "hover",
    hint: "--fynns-state-hover opacity for pointer-hover overlays (color-mix on interactive surfaces).",
  },
  {
    key: "focus",
    hint: "--fynns-state-focus opacity for keyboard / focus-visible overlays.",
  },
  {
    key: "pressed",
    hint: "--fynns-state-pressed opacity while the control is actively pressed.",
  },
  {
    key: "dragged",
    hint: "--fynns-state-dragged opacity for drag / high-emphasis interactive overlays.",
  },
] as const;

const SPACE_KEYS = [
  {
    key: "lg",
    label: "Content (space-lg)",
    hint: "--fynns-space-lg — Card content padding and related roomy content gaps.",
  },
  {
    key: "md",
    label: "Header (space-md)",
    hint: "--fynns-space-md — Card header spacing and mid-density gaps.",
  },
  {
    key: "sm",
    label: "Actions gap (space-sm)",
    hint: "--fynns-space-sm — Card actions row gap and compact control spacing.",
  },
] as const;

const FONT_SIZE_HINTS = {
  sm: "--fynns-font-size-sm — compact UI copy (captions, dense labels).",
  md: "--fynns-font-size-md — default body / control text size.",
  lg: "--fynns-font-size-lg — emphasized titles and larger chrome text.",
} as const;

const BRIGHTNESS_HINT =
  "Shift this surface’s hex brightness relative to the tokens.ts baseline (does not change hue).";

function matchShadowPreset(value: string): string {
  const hit = SHADOW_XS_PRESETS.find((p) => p.value === value);
  return hit?.id ?? "custom";
}

export function PropertyInspector() {
  const { apply, mergeOverrides, resolved, reset, loadPreset, draft } = useTokenDraft();
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

  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
        <header className="sandbox-inspector-head">
          <h2>Property inspector</h2>
          <span className="sandbox-inspector-meta">
            <InfoHint
              label={`${overrideCount} override${overrideCount === 1 ? "" : "s"}`}
              ariaLabel="What overrides means"
              content="Count of draft CSS variables versus baseline (--fynns-* and sandbox chrome). Reset clears them; Apply changes writes only --fynns-* into tokens.ts."
            />
          </span>
        </header>

        <Collapsible title="Presets" defaultOpen>
          <div className="sandbox-stack">
            <div className="sandbox-field">
              <Select
                ariaLabel="Preset"
                value={presetId}
                options={CARD_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                onChange={setPresetId}
              />
            </div>
            <p className="sandbox-help">
              {CARD_PRESETS.find((p) => p.id === presetId)?.description}
            </p>
            <div className="sandbox-field">
              <Button
                size="sm"
                onClick={() => {
                  const preset = CARD_PRESETS.find((p) => p.id === presetId);
                  if (!preset) return;
                  loadPreset(preset.overrides);
                  toast.message(`Loaded preset: ${preset.label}`);
                }}
              >
                Apply preset
              </Button>
            </div>
            <p className="sandbox-help">
              Shape / radius lives under Globals — these presets cover elevation and state layers.
            </p>
          </div>
        </Collapsible>

        <Collapsible title="Color" defaultOpen>
          <div className="sandbox-stack">
            <HueWheel />
            <p className="sandbox-help">
              Preset chips stay inline; open the rainbow chip for the full hue ring.
              Surfaces stay on the committed ladder — only the accent family shifts.
            </p>
            {SURFACE_KEYS.map(({ cssVar, key, label, hint }) => {
              const baseline = BASELINE[cssVar] ?? "#000000";
              const current = resolved(cssVar);
              const delta = estimateBrightnessDelta(baseline, current);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint label={label} ariaLabel={`About ${label}`} content={hint} />
                    <code>{current}</code>
                  </div>
                  <div
                    className="sandbox-surface-swatch"
                    style={{ background: `var(${cssVar})` }}
                    aria-hidden
                  />
                  <div className="sandbox-field-row">
                    <InfoHint
                      label="Brightness"
                      ariaLabel={`About brightness for ${label}`}
                      content={BRIGHTNESS_HINT}
                    />
                    <code>{delta > 0 ? `+${delta}` : delta}</code>
                  </div>
                  <Slider
                    ariaLabel={`${label} brightness`}
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
                  label="Outline border (border-strong)"
                  ariaLabel="About outline border"
                  content="--fynns-color-border-strong — stroke for outlined Card and strong borders."
                />
                <code>{borderStrong}</code>
              </div>
              <div
                className="sandbox-surface-swatch"
                style={{ background: borderStrong }}
                aria-hidden
              />
              <Slider
                ariaLabel="Outline border brightness"
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
              <p className="sandbox-help">Used by outlined cards as the stroke color.</p>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Elevation" defaultOpen>
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
                  label="Elevated resting shadow (xs)"
                  ariaLabel="About elevated resting shadow"
                  content="--fynns-shadow-xs — resting elevation shadow for elevated Card (ladder swatches above are read-only)."
                />
                <code>{shadowPreset}</code>
              </div>
              <Select
                ariaLabel="Elevated shadow preset"
                value={shadowPreset === "custom" ? "default" : shadowPreset}
                options={SHADOW_XS_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                onChange={(id) => {
                  const preset = SHADOW_XS_PRESETS.find((p) => p.id === id);
                  if (!preset) return;
                  apply({
                    group: "shadow",
                    key: "xs",
                    value: preset.value,
                    source: "preset",
                  });
                }}
              />
              <p className="sandbox-help">
                Tonal ladder is read-only above; elevated cards use shadow-xs at rest. Dragged /
                reserved levels use surface-4/5.
              </p>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="State layers" defaultOpen>
          <div className="sandbox-stack">
            {STATE_LAYER_KEYS.map(({ key, hint }) => {
              const valueByKey = { hover, focus, pressed, dragged } as const;
              const value = valueByKey[key];
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={key}
                      ariaLabel={`About state layer ${key}`}
                      content={hint}
                    />
                    <code>{value}%</code>
                  </div>
                  <Slider
                    ariaLabel={`${key} state layer`}
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
              <CardHeader title="State demo" subtitle="Hover / press me" />
              <CardContent>Live overlay uses the opacities above.</CardContent>
            </Card>
          </div>
        </Collapsible>

        <Collapsible title="Spacing" defaultOpen>
          <div className="sandbox-stack">
            <p className="sandbox-help">
              Card anatomy — `--fynns-space-*` used by Card content / header / actions (Apply
              writeback).
            </p>
            {SPACE_KEYS.map(({ key, label, hint }) => {
              const pxByKey = { lg: spaceLgPx, md: spaceMdPx, sm: spaceSmPx } as const;
              const px = pxByKey[key];
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint label={label} ariaLabel={`About ${label}`} content={hint} />
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
            <p className="sandbox-help">
              Inspector blocks — gap between adjacent chrome blocks in every inspector stack
              (`--sandbox-block-gap`, sandbox-only; not written by Apply changes).
            </p>
            <div className="sandbox-field">
              <div className="sandbox-field-row">
                <InfoHint
                  label="Block gap"
                  ariaLabel="About block gap"
                  content="--sandbox-block-gap — uniform gap between adjacent blocks in inspector stacks (sandbox chrome; not Apply writeback)."
                />
                <code>{blockGapPx}px</code>
              </div>
              <Slider
                ariaLabel="Inspector block gap"
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

        <Collapsible title="Typography">
          <div className="sandbox-stack">
            {(["sm", "md", "lg"] as const).map((key) => {
              const raw = resolved(`--fynns-font-size-${key}`);
              const px = parseLengthToPx(raw);
              return (
                <div key={key} className="sandbox-field">
                  <div className="sandbox-field-row">
                    <InfoHint
                      label={`font-size-${key}`}
                      ariaLabel={`About font-size-${key}`}
                      content={FONT_SIZE_HINTS[key]}
                    />
                    <code>{raw}</code>
                  </div>
                  <Slider
                    ariaLabel={`Font size ${key}`}
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
      </div>

      <div className="sandbox-inspector-actions">
        <Tooltip content="Clear all token overrides in the draft (same as topbar Reset)">
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset to default
          </Button>
        </Tooltip>
        <ApplyChangesControl />
      </div>
    </div>
  );
}
