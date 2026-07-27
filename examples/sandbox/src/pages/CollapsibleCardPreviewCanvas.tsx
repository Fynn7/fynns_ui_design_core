import {
  Button,
  CardActions,
  CardContent,
  CardMedia,
  CollapsibleCard,
  CollapsibleCardHeader,
  ControlRow,
  ControlStack,
  Grid,
  InfoHint,
  Switch,
  ToggleGroup,
  toast,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { useRecipeDraft } from "../state/RecipeDraftProvider";

const ALL_VARIANTS = ["elevated", "filled", "outlined"] as const;
type ActionsAlign = "start" | "end";

export type CollapsibleCardPreviewOptions = {
  showMedia: boolean;
  defaultOpen: boolean;
  disabled: boolean;
  actionsAlign: ActionsAlign;
};

const DEFAULT_OPTIONS: CollapsibleCardPreviewOptions = {
  showMedia: true,
  defaultOpen: false,
  disabled: false,
  actionsAlign: "end",
};

export function CollapsibleCardPreviewCanvas() {
  const { t } = useLocale();
  const { draft } = useRecipeDraft();
  const [options, setOptions] = useState<CollapsibleCardPreviewOptions>(DEFAULT_OPTIONS);

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
        <ControlRow label={t("preview.anatomy")}>
          <Switch
            size="sm"
            labelSide="end"
            label={t("preview.media")}
            checked={options.showMedia}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showMedia: checked }))}
          />
        </ControlRow>
        <ControlRow label={t("preview.states")}>
          <Grid x={2} y="unbounded">
            <Switch
              size="sm"
              labelSide="end"
              label={t("preview.defaultOpen")}
              checked={options.defaultOpen}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, defaultOpen: checked }))}
            />
            <Switch
              size="sm"
              labelSide="end"
              label={t("preview.disabled")}
              checked={options.disabled}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, disabled: checked }))}
            />
          </Grid>
        </ControlRow>
        <ControlRow label={t("preview.actions")}>
          <ToggleGroup
            size="compact"
            value={options.actionsAlign}
            onChange={(id) => setOptions((o) => ({ ...o, actionsAlign: id as ActionsAlign }))}
            options={[
              { value: "start", label: t("preview.start") },
              { value: "end", label: t("preview.end") },
            ]}
          />
        </ControlRow>
      </ControlStack>

      <div className="sandbox-preview-grid">
        {ALL_VARIANTS.map((variant) => (
          <div key={variant} className="sandbox-preview-slot">
            <div className="sandbox-preview-label">{variant}</div>
            <div className="sandbox-preview-card-wrap">
              <CollapsibleCard
                key={`${variant}-${options.defaultOpen ? "open" : "closed"}`}
                variant={variant}
                defaultOpen={options.defaultOpen}
                disabled={options.disabled}
                mediaCollapse={draft.mediaCollapse}
                cssOverrides={draft.cssOverrides}
              >
                {options.showMedia ? (
                  <CardMedia>
                    <div className="fynns-card-media-placeholder" aria-hidden>
                      {t("preview.media")}
                    </div>
                  </CardMedia>
                ) : null}
                <CollapsibleCardHeader
                  avatar="F"
                  title={t("preview.cardTitle")}
                  subtitle={t("preview.collapsibleSubtitle")}
                  action={
                    <InfoHint
                      content={t("preview.collapsibleInfo")}
                      ariaLabel={t("preview.cardInfoAria")}
                    />
                  }
                />
                <CardContent>{t("preview.collapsibleBody")}</CardContent>
                <CardActions align={options.actionsAlign}>
                  <Button size="sm" variant="ghost" disabled={options.disabled}>
                    {t("preview.dismiss")}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={options.disabled}
                    onClick={() => toast.message(t("preview.collapsibleActivated", { variant }))}
                  >
                    {t("preview.open")}
                  </Button>
                </CardActions>
              </CollapsibleCard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
