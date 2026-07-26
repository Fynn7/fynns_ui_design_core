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
import { BASELINE } from "../state/baseline";
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
  { cssVar: "--fynns-color-surface-1", key: "surface-1", label: "Elevated (surface-1)" },
  { cssVar: "--fynns-color-surface-4", key: "surface-4", label: "Filled (surface-4)" },
  { cssVar: "--fynns-color-app-bg", key: "app-bg", label: "Outlined (app-bg)" },
] as const;

function matchShadowPreset(value: string): string {
  const hit = SHADOW_XS_PRESETS.find((p) => p.value === value);
  return hit?.id ?? "custom";
}

export function PropertyInspector() {
  const { apply, resolved, reset, loadPreset, draft } = useTokenDraft();
  const [presetId, setPresetId] = useState(CARD_PRESETS[0]?.id ?? "");

  const hover = parsePercent(resolved("--fynns-state-hover"));
  const focus = parsePercent(resolved("--fynns-state-focus"));
  const pressed = parsePercent(resolved("--fynns-state-pressed"));
  const dragged = parsePercent(resolved("--fynns-state-dragged"));
  const spaceLgPx = parseLengthToPx(resolved("--fynns-space-lg"));
  const spaceMdPx = parseLengthToPx(resolved("--fynns-space-md"));
  const spaceSmPx = parseLengthToPx(resolved("--fynns-space-sm"));
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
              content="Count of --fynns-* tokens changed in the live draft versus the tokens.ts baseline. Reset clears them; Apply changes writes them to source."
            />
          </span>
        </header>

        <Collapsible title="Presets" defaultOpen>
          <div className="sandbox-field">
            <Select
              ariaLabel="Preset"
              value={presetId}
              options={CARD_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
              onChange={setPresetId}
            />
            <p className="sandbox-help">
              {CARD_PRESETS.find((p) => p.id === presetId)?.description}
            </p>
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
            <p className="sandbox-help">
              Shape / radius lives under Globals — these presets cover elevation and state layers.
            </p>
          </div>
        </Collapsible>

        <Collapsible title="Color" defaultOpen>
          <HueWheel />
          <p className="sandbox-help">
            Preset chips stay inline; open the rainbow chip for the full hue ring.
            Surfaces stay on the committed ladder — only the accent family shifts.
          </p>
          {SURFACE_KEYS.map(({ cssVar, key, label }) => {
            const baseline = BASELINE[cssVar] ?? "#000000";
            const current = resolved(cssVar);
            const delta = estimateBrightnessDelta(baseline, current);
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <span>{label}</span>
                  <code>{current}</code>
                </div>
                <div
                  className="sandbox-surface-swatch"
                  style={{ background: `var(${cssVar})` }}
                  aria-hidden
                />
                <div className="sandbox-field-row">
                  <span>Brightness</span>
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
              <span>Outline border (border-strong)</span>
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
        </Collapsible>

        <Collapsible title="Elevation" defaultOpen>
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
              <span>Elevated resting shadow (xs)</span>
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
        </Collapsible>

        <Collapsible title="State layers" defaultOpen>
          {(
            [
              ["hover", hover],
              ["focus", focus],
              ["pressed", pressed],
              ["dragged", dragged],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="sandbox-field">
              <div className="sandbox-field-row">
                <span>{key}</span>
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
          ))}
          <Card variant="filled" interactive className="sandbox-state-demo">
            <CardHeader title="State demo" subtitle="Hover / press me" />
            <CardContent>Live overlay uses the opacities above.</CardContent>
          </Card>
        </Collapsible>

        <Collapsible title="Spacing" defaultOpen>
          {(
            [
              ["lg", spaceLgPx, "Content (space-lg)"],
              ["md", spaceMdPx, "Header (space-md)"],
              ["sm", spaceSmPx, "Actions gap (space-sm)"],
            ] as const
          ).map(([key, px, label]) => (
            <div key={key} className="sandbox-field">
              <div className="sandbox-field-row">
                <span>{label}</span>
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
          ))}
          <p className="sandbox-help">
            Reuses existing space tokens consumed by Card anatomy regions.
          </p>
        </Collapsible>

        <Collapsible title="Typography">
          {(["sm", "md", "lg"] as const).map((key) => {
            const raw = resolved(`--fynns-font-size-${key}`);
            const px = parseLengthToPx(raw);
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <span>font-size-{key}</span>
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
