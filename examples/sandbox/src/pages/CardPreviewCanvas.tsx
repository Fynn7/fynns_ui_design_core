import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  ControlRow,
  ControlStack,
  Grid,
  InfoHint,
  Switch,
  ToggleGroup,
  toast,
} from "@fynns/ui";
import { useState } from "react";

const ALL_VARIANTS = ["elevated", "filled", "outlined"] as const;
type ActionsAlign = "start" | "end";

export type CardPreviewOptions = {
  showMedia: boolean;
  interactive: boolean;
  disabled: boolean;
  actionsAlign: ActionsAlign;
};

const DEFAULT_OPTIONS: CardPreviewOptions = {
  showMedia: false,
  interactive: true,
  disabled: false,
  actionsAlign: "end",
};

export function CardPreviewCanvas() {
  const [options, setOptions] = useState<CardPreviewOptions>(DEFAULT_OPTIONS);

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
              label="Interactive"
              checked={options.interactive}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, interactive: checked }))}
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
        {ALL_VARIANTS.map((variant) => {
          const interactive = options.interactive;
          return (
            <div key={variant} className="sandbox-preview-slot">
              <div className="sandbox-preview-label">{variant}</div>
              <div className="sandbox-preview-card-wrap">
                <Card
                  variant={variant}
                  interactive={interactive}
                  disabled={options.disabled}
                  onClick={
                    interactive
                      ? () => toast.message(`${variant} card activated`)
                      : undefined
                  }
                >
                  {options.showMedia ? (
                    <CardMedia>
                      <div className="fynns-card-media-placeholder" aria-hidden>
                        Media
                      </div>
                    </CardMedia>
                  ) : null}
                  <CardHeader
                    avatar="F"
                    title="Aurora project"
                    subtitle="Updated just now"
                    action={
                      <InfoHint content="More info about this card subject." ariaLabel="More info" />
                    }
                  />
                  <CardContent>
                    A subject card with shared anatomy. Use the inspector to tune Card-related
                    tokens — sandbox chrome updates from the same variables. Shape / radius lives
                    under Globals.
                  </CardContent>
                  <CardActions align={options.actionsAlign}>
                    <Button size="sm" variant="ghost" disabled={options.disabled}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="primary" disabled={options.disabled}>
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
