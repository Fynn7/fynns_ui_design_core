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
  const { draft } = useRecipeDraft();
  const [options, setOptions] = useState<CollapsibleCardPreviewOptions>(DEFAULT_OPTIONS);

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
        <ControlRow label="Anatomy">
          <Switch
            size="sm"
            labelSide="end"
            label="Media"
            checked={options.showMedia}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showMedia: checked }))}
          />
        </ControlRow>
        <ControlRow label="States">
          <Grid x={2} y="unbounded">
            <Switch
              size="sm"
              labelSide="end"
              label="Default open"
              checked={options.defaultOpen}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, defaultOpen: checked }))}
            />
            <Switch
              size="sm"
              labelSide="end"
              label="Disabled"
              checked={options.disabled}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, disabled: checked }))}
            />
          </Grid>
        </ControlRow>
        <ControlRow label="Actions">
          <ToggleGroup
            size="compact"
            value={options.actionsAlign}
            onChange={(id) => setOptions((o) => ({ ...o, actionsAlign: id as ActionsAlign }))}
            options={[
              { value: "start", label: "Start" },
              { value: "end", label: "End" },
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
                variant={variant}
                defaultOpen={options.defaultOpen}
                disabled={options.disabled}
                mediaCollapse={draft.mediaCollapse}
                cssOverrides={draft.cssOverrides}
              >
                {options.showMedia ? (
                  <CardMedia>
                    <div className="fynns-card-media-placeholder" aria-hidden>
                      Media
                    </div>
                  </CardMedia>
                ) : null}
                <CollapsibleCardHeader
                  avatar="F"
                  title="Aurora project"
                  subtitle="Tap header to expand"
                  action={
                    <InfoHint content="Header action stays outside the trigger." ariaLabel="More info" />
                  }
                />
                <CardContent>
                  CollapsibleCard combines Card anatomy with a disclosure header. Template defaults
                  come from the recipe draft; global Card tokens still use Apply changes.
                </CardContent>
                <CardActions align={options.actionsAlign}>
                  <Button size="sm" variant="ghost" disabled={options.disabled}>
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={options.disabled}
                    onClick={() => toast.message(`${variant} action`)}
                  >
                    Open
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
