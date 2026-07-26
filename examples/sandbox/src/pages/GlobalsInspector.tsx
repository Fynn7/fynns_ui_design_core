import { Button, Collapsible, InfoHint, Select, Slider, toast, Tooltip } from "@fynns/ui";
import { useMemo, useState } from "react";
import { GLOBAL_SHAPE_PRESETS } from "../../presets/presets";
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
    hint: "Smallest ladder step (M3 XS ≈ 4dp). Finest corners; keep below sm in the scale.",
  },
  {
    key: "sm",
    label: "sm",
    max: 20,
    hint: "Compact controls: Button, SplitButton, ToggleGroup, Badge, PickList, toast action chips.",
  },
  {
    key: "md",
    label: "md",
    max: 28,
    hint: "Default surface radius: Input, Select, Card, PanelCard, Popover, Tooltip, Tabs, Collapsible, list rows, Alert/Toast.",
  },
  {
    key: "lg",
    label: "lg",
    max: 32,
    hint: "Larger chrome: DropdownMenu / SplitButton menus, Dialog and Drawer panels.",
  },
  {
    key: "xl",
    label: "xl",
    max: 40,
    hint: "Largest ladder step (M3 XL band). Soft / emphasis shells; keep above lg in the scale.",
  },
] as const;

const READONLY_RADIUS = [
  {
    key: "none",
    label: "none",
    hint: "Sharp corners (0). Flush edges when a control must meet a hard boundary.",
  },
  {
    key: "pill",
    label: "pill",
    hint: "Capsule (999px): Switch track, SearchInput, fully rounded chips.",
  },
  {
    key: "round",
    label: "round",
    hint: "Circle (50%): Switch thumb and other circular affordances.",
  },
] as const;

const LADDER_KEYS = ["xs", "sm", "md", "lg", "xl"] as const;

/**
 * Global shape inspector: edits `--fynns-radius-*` for the whole UI core.
 */
export function GlobalsInspector() {
  const { apply, resolved, reset, loadPreset, draft, mergeOverrides } = useTokenDraft();
  const [presetId, setPresetId] = useState(GLOBAL_SHAPE_PRESETS[0]?.id ?? "");

  const overrideCount = useMemo(() => Object.keys(draft.overrides).length, [draft.overrides]);

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
          <span className="sandbox-inspector-meta">
            <InfoHint
              label={`${overrideCount} override${overrideCount === 1 ? "" : "s"}`}
              ariaLabel="What overrides means"
              content="Count of --fynns-* tokens changed in the live draft versus the tokens.ts baseline. Reset clears them; Apply changes writes them to source."
            />
          </span>
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
          {EDITABLE_RADIUS.map(({ key, label, max, hint }) => {
            const cssVar = `--fynns-radius-${key}`;
            const px = parseLengthToPx(resolved(cssVar));
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <InfoHint
                    label={<code>radius-{label}</code>}
                    ariaLabel={`About radius-${label}`}
                    content={hint}
                  />
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
              {READONLY_RADIUS.map(({ key, label, hint }) => (
                <li key={key}>
                  <InfoHint
                    label={
                      <code>
                        {label}:{" "}
                        {resolved(`--fynns-radius-${key}`) || BASELINE[`--fynns-radius-${key}`]}
                      </code>
                    }
                    ariaLabel={`About radius-${label}`}
                    content={hint}
                  />
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
        <ApplyChangesControl />
      </footer>
    </div>
  );
}
