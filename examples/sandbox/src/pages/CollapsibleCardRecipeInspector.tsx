import { Collapsible, InfoHint, Select, Slider, Switch, ToggleGroup } from "@fynns/ui";
import { useLocale } from "../i18n";
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
/** Fallback px when header gap resolves to `var(--fynns-space-sm)`. */
const SPACE_SM_FALLBACK_PX = 8;

export function CollapsibleCardRecipeInspector() {
  const { t } = useLocale();
  const { draft, patch, setCssOverride, isDirty } = useRecipeDraft();

  const cssOverrides = draft.cssOverrides ?? {};
  const headerGap = cssOverrides[HEADER_GAP_VAR] ?? "var(--fynns-space-sm)";
  const headerGapPx = headerGap.startsWith("var(")
    ? SPACE_SM_FALLBACK_PX
    : parseLengthToPx(headerGap);

  const dirtyLabel = isDirty ? t("recipe.dirty") : t("recipe.clean");

  return (
    <Collapsible title={t("recipe.title")} defaultOpen>
      <div className="sandbox-stack">
        <p className="sandbox-help">{t("recipe.help", { dirty: dirtyLabel })}</p>

        <div className="sandbox-field">
          <InfoHint label={t("recipe.defaultVariant")} content={t("recipe.defaultVariantHint")} />
          <Select
            ariaLabel={t("recipe.defaultVariant")}
            value={draft.defaultVariant}
            options={[
              { value: "elevated", label: t("recipe.variantElevated") },
              { value: "filled", label: t("recipe.variantFilled") },
              { value: "outlined", label: t("recipe.variantOutlined") },
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
            label={t("recipe.defaultOpen")}
            checked={draft.defaultOpen}
            onCheckedChange={(checked) => patch({ defaultOpen: checked })}
          />
        </div>

        <div className="sandbox-field">
          <InfoHint label={t("recipe.mediaCollapse")} content={t("recipe.mediaCollapseHint")} />
          <ToggleGroup
            size="compact"
            value={draft.mediaCollapse}
            onChange={(id) =>
              patch({ mediaCollapse: id as typeof draft.mediaCollapse })
            }
            options={[
              { value: "always", label: t("recipe.mediaAlways") },
              { value: "withBody", label: t("recipe.mediaWithBody") },
            ]}
          />
        </div>

        <div className="sandbox-field">
          <div className="sandbox-field-row">
            <InfoHint
              label={t("recipe.headerGap")}
              ariaLabel={t("recipe.headerGapAria")}
              content={t("recipe.headerGapHint", { cssVar: HEADER_GAP_VAR })}
            />
            <code>{headerGapPx}px</code>
          </div>
          <Slider
            ariaLabel={t("recipe.headerGap")}
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
