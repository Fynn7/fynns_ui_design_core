import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapsible,
  Select,
  Slider,
  toast,
} from "@fynns/ui";
import { useMemo, useState } from "react";
import { SANDBOX_PRESETS } from "../../presets/presets";
import { formatCssPatch, formatOverrideDiff, formatTokensTsHints } from "../export/formatDiff";
import { HueWheel } from "../manipulators/HueWheel";
import { useTokenDraft } from "../state/TokenDraftProvider";

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

export function PropertyInspector() {
  const { apply, resolved, reset, loadPreset, draft } = useTokenDraft();
  const [presetId, setPresetId] = useState(SANDBOX_PRESETS[0]?.id ?? "");

  const radiusMd = parseLengthToPx(resolved("--fynns-radius-md"));
  const hover = parsePercent(resolved("--fynns-state-hover"));
  const focus = parsePercent(resolved("--fynns-state-focus"));
  const pressed = parsePercent(resolved("--fynns-state-pressed"));
  const dragged = parsePercent(resolved("--fynns-state-dragged"));
  const spaceLgPx = parseLengthToPx(resolved("--fynns-space-lg"));

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  const copyDiff = async () => {
    const text = [
      formatOverrideDiff(draft.overrides),
      formatCssPatch(draft.overrides),
      formatTokensTsHints(draft.overrides),
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Diff copied to clipboard");
  };

  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
      <header className="sandbox-inspector-head">
        <h2>Property inspector</h2>
        <span className="sandbox-muted">{overrideCount} overrides</span>
      </header>

      <Collapsible title="Presets" defaultOpen>
        <div className="sandbox-field">
          <Select
            ariaLabel="Preset"
            value={presetId}
            options={SANDBOX_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            onChange={setPresetId}
          />
          <p className="sandbox-help">
            {SANDBOX_PRESETS.find((p) => p.id === presetId)?.description}
          </p>
          <Button
            size="sm"
            onClick={() => {
              const preset = SANDBOX_PRESETS.find((p) => p.id === presetId);
              if (!preset) return;
              loadPreset(preset.overrides);
              toast.message(`Loaded preset: ${preset.label}`);
            }}
          >
            Apply preset
          </Button>
        </div>
      </Collapsible>

      <Collapsible title="Shape" defaultOpen>
        <div className="sandbox-field">
          <div className="sandbox-field-row">
            <span>Corner radius (md)</span>
            <code>{radiusMd}px</code>
          </div>
          <Slider
            ariaLabel="Corner radius"
            min={0}
            max={28}
            step={1}
            value={radiusMd}
            onChange={(v) =>
              apply({ group: "radius", key: "md", value: `${v}px`, source: "slider" })
            }
          />
          <p className="sandbox-help">
            Also drag the handle on the elevated preview card. M3 medium reference is 12px.
          </p>
        </div>
      </Collapsible>

      <Collapsible title="Color" defaultOpen>
        <HueWheel />
        <p className="sandbox-help">
          Shifts the accent family as a hue. Surfaces stay on the committed elevation ladder.
        </p>
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
        <p className="sandbox-help">
          Tonal surfaces climb app-bg → surface-5. Elevated cards rest at L1. Shadow
          scale is previewed on the live cards, not on these swatches.
        </p>
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

      <Collapsible title="Spacing">
        <div className="sandbox-field">
          <div className="sandbox-field-row">
            <span>Content padding (space-lg)</span>
            <code>{spaceLgPx}px</code>
          </div>
          <Slider
            ariaLabel="Content spacing"
            min={8}
            max={32}
            step={1}
            value={spaceLgPx}
            onChange={(v) =>
              apply({
                group: "spacing",
                key: "lg",
                value: pxToRem(v),
                source: "slider",
              })
            }
          />
          <p className="sandbox-help">Mapped to --fynns-space-lg (Card content padding).</p>
        </div>
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
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset to default
        </Button>
        <Button size="sm" variant="primary" onClick={() => void copyDiff()}>
          Copy diff
        </Button>
      </div>
    </div>
  );
}
