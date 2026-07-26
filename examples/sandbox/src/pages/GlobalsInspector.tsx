import { Button, Collapsible, Select, Slider, toast, Tooltip } from "@fynns/ui";
import { useMemo, useState } from "react";
import { GLOBAL_SHAPE_PRESETS } from "../../presets/presets";
import { applyTokenOverrides } from "../export/applyTokens";
import { BASELINE } from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

const EDITABLE_RADIUS = [
  { key: "xs", label: "xs", max: 16 },
  { key: "sm", label: "sm", max: 20 },
  { key: "md", label: "md", max: 28 },
  { key: "lg", label: "lg", max: 32 },
  { key: "xl", label: "xl", max: 40 },
] as const;

const READONLY_RADIUS = [
  { key: "none", label: "none" },
  { key: "pill", label: "pill" },
  { key: "round", label: "round" },
] as const;

const LADDER_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Global shape inspector: edits `--fynns-radius-*` for the whole UI core.
 */
export function GlobalsInspector() {
  const { apply, resolved, reset, loadPreset, draft, mergeOverrides } = useTokenDraft();
  const [presetId, setPresetId] = useState(GLOBAL_SHAPE_PRESETS[0]?.id ?? "");
  const [applying, setApplying] = useState(false);

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

  const applyChanges = async () => {
    if (overrideCount === 0 || applying) return;
    setApplying(true);
    try {
      const result = await applyTokenOverrides(draft.overrides);
      if (!result.ok) {
        toast.error(result.error ?? "Apply failed");
        return;
      }
      reset();
      if (result.skipped.length > 0) {
        toast.warning(
          `Applied ${result.applied.length} token(s); skipped ${result.skipped.length}`,
        );
      } else {
        toast.success(`Applied ${result.applied.length} token(s) to tokens.ts`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setApplying(false);
    }
  };

  const resetShapeLadder = () => {
    const patch: Record<string, string> = {};
    for (const key of LADDER_KEYS) {
      const cssVar = `--fynns-radius-${key}`;
      patch[cssVar] = BASELINE[cssVar] ?? "0";
    }
    mergeOverrides(patch, { source: "reset", group: "radius" });
    toast.message("Shape ladder reset to baseline");
  };

  const alignM3Ladder = () => {
    const preset = GLOBAL_SHAPE_PRESETS.find((p) => p.id === "m3-aligned-radius");
    if (!preset) return;
    mergeOverrides(preset.overrides, { source: "preset", group: "radius" });
    setPresetId(preset.id);
    toast.message("Aligned to M3 radius ladder");
  };

  return (
    <div className="sandbox-inspector">
      <div className="sandbox-inspector-scroll fynns-scroll">
        <header className="sandbox-inspector-head">
          <h2>Global properties</h2>
          <span className="sandbox-muted">{overrideCount} overrides</span>
        </header>

        <Collapsible title="Shape presets" defaultOpen>
          <div className="sandbox-field">
            <Select
              ariaLabel="Shape preset"
              value={presetId}
              options={GLOBAL_SHAPE_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
              onChange={setPresetId}
            />
            <p className="sandbox-help">
              {GLOBAL_SHAPE_PRESETS.find((p) => p.id === presetId)?.description}
            </p>
            <Tooltip content="Replace the entire draft with this preset's overrides (clears other knobs)">
              <Button
                size="sm"
                onClick={() => {
                  const preset = GLOBAL_SHAPE_PRESETS.find((p) => p.id === presetId);
                  if (!preset) return;
                  loadPreset(preset.overrides);
                  toast.message(`Loaded preset: ${preset.label}`);
                }}
              >
                Apply preset
              </Button>
            </Tooltip>
            <p className="sandbox-help">
              Apply preset replaces the whole draft. Align M3 / Reset ladder only touch radius.
            </p>
          </div>
        </Collapsible>

        <Collapsible title="Shape ladder" defaultOpen>
          <p className="sandbox-help">
            Writes `--fynns-radius-*` used by every primitive (Button, Input, Card, flyouts,
            …) — not Card-only.
          </p>
          {EDITABLE_RADIUS.map(({ key, label, max }) => {
            const cssVar = `--fynns-radius-${key}`;
            const px = parseLengthToPx(resolved(cssVar));
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <span>radius-{label}</span>
                  <code>{px}px</code>
                </div>
                <Slider
                  ariaLabel={`Radius ${label}`}
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
              <span>Special (read-only)</span>
            </div>
            <ul className="sandbox-globals-readonly">
              {READONLY_RADIUS.map(({ key, label }) => (
                <li key={key}>
                  <code>
                    {label}: {resolved(`--fynns-radius-${key}`) || BASELINE[`--fynns-radius-${key}`]}
                  </code>
                </li>
              ))}
            </ul>
          </div>
          <div className="sandbox-field-row">
            <Tooltip content="Apply the M3-aligned radius values (xs–xl only; other overrides stay)">
              <Button size="sm" variant="ghost" onClick={alignM3Ladder}>
                Align M3 ladder
              </Button>
            </Tooltip>
            <Tooltip content="Restore radius xs–xl to baseline; leaves color and other overrides">
              <Button size="sm" variant="ghost" onClick={resetShapeLadder}>
                Reset ladder
              </Button>
            </Tooltip>
          </div>
        </Collapsible>
      </div>

      <footer className="sandbox-inspector-actions">
        <Tooltip content="Clear all token overrides in the draft (same as topbar Reset)">
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset to default
          </Button>
        </Tooltip>
        <Tooltip content="Write draft overrides into tokens.ts and regenerate theme.css">
          <Button
            size="sm"
            variant="primary"
            disabled={overrideCount === 0 || applying}
            onClick={() => void applyChanges()}
          >
            {applying ? "Applying…" : "Apply changes"}
          </Button>
        </Tooltip>
      </footer>
    </div>
  );
}
