import { Collapsible, InfoHint, Select, Slider, Switch, ToggleGroup } from "@fynns/ui";
import { useMemo } from "react";
import { useRecipeDraft } from "../state/RecipeDraftProvider";

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

function pxToRem(px: number): string {
  return `${Number((px / 16).toFixed(4))}rem`;
}

const HEADER_GAP_VAR = "--fynns-collapsible-card-header-gap";

export function CollapsibleCardRecipeInspector() {
  const { draft, patch, setCssOverride, isDirty } = useRecipeDraft();

  const cssOverrides = draft.cssOverrides ?? {};
  const headerGap = cssOverrides[HEADER_GAP_VAR] ?? "var(--fynns-space-sm)";
  const headerGapPx = headerGap.startsWith("var(") ? 8 : parseLengthToPx(headerGap);

  const dirtyLabel = useMemo(
    () => (isDirty ? "Template draft modified" : "Matches committed template"),
    [isDirty],
  );

  return (
    <Collapsible title="CollapsibleCard template" defaultOpen>
      <div className="sandbox-stack">
        <p className="sandbox-help">
          Component defaults and local CSS variables — use Apply component template below (not Apply
          changes). {dirtyLabel}.
        </p>

        <div className="sandbox-field">
          <InfoHint
            label="Default variant"
            content="Factory default Card variant when callers omit variant."
          />
          <Select
            ariaLabel="Default variant"
            value={draft.defaultVariant}
            options={[
              { value: "elevated", label: "Elevated" },
              { value: "filled", label: "Filled" },
              { value: "outlined", label: "Outlined" },
            ]}
            onChange={(value) =>
              patch({ defaultVariant: value as typeof draft.defaultVariant })
            }
          />
        </div>

        <div className="sandbox-field">
          <Switch
            size="sm"
            labelSide="end"
            label="Default open"
            checked={draft.defaultOpen}
            onCheckedChange={(checked) => patch({ defaultOpen: checked })}
          />
        </div>

        <div className="sandbox-field">
          <InfoHint
            label="Media collapse"
            content='When "withBody", CardMedia hides with the collapsible region.'
          />
          <ToggleGroup
            size="compact"
            value={draft.mediaCollapse}
            onChange={(id) =>
              patch({ mediaCollapse: id as typeof draft.mediaCollapse })
            }
            options={[
              { value: "always", label: "Always visible" },
              { value: "withBody", label: "With body" },
            ]}
          />
        </div>

        <div className="sandbox-field">
          <div className="sandbox-field-row">
            <InfoHint
              label="Header gap"
              ariaLabel="About header gap"
              content={`${HEADER_GAP_VAR} — gap between trigger and header action.`}
            />
            <code>{headerGapPx}px</code>
          </div>
          <Slider
            ariaLabel="Header gap"
            min={0}
            max={24}
            step={1}
            value={headerGapPx}
            onChange={(v) => setCssOverride(HEADER_GAP_VAR, pxToRem(v))}
          />
        </div>
      </div>
    </Collapsible>
  );
}
