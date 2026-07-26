import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  InfoIcon,
  Switch,
  ToggleGroup,
  Tooltip,
  toast,
} from "@fynns/ui";
import { useState } from "react";
import { CornerRadiusHandle } from "../manipulators/CornerRadiusHandle";

const ALL_VARIANTS = ["elevated", "filled", "outlined"] as const;
type VariantFocus = "all" | (typeof ALL_VARIANTS)[number];
type ActionsAlign = "start" | "end";

export type CardPreviewOptions = {
  variantFocus: VariantFocus;
  showMedia: boolean;
  showActionArea: boolean;
  interactive: boolean;
  disabled: boolean;
  actionsAlign: ActionsAlign;
  disableSpacing: boolean;
};

const DEFAULT_OPTIONS: CardPreviewOptions = {
  variantFocus: "all",
  showMedia: false,
  showActionArea: false,
  interactive: true,
  disabled: false,
  actionsAlign: "end",
  disableSpacing: false,
};

export function CardPreviewCanvas() {
  const [options, setOptions] = useState<CardPreviewOptions>(DEFAULT_OPTIONS);
  const variants =
    options.variantFocus === "all" ? [...ALL_VARIANTS] : [options.variantFocus];

  return (
    <div className="sandbox-preview">
      <div className="sandbox-preview-toolbar">
        <div className="sandbox-preview-toolbar-row">
          <span className="sandbox-preview-toolbar-label">Variant focus</span>
          <ToggleGroup
            size="compact"
            segmentLayout="content"
            value={options.variantFocus}
            onChange={(id) => setOptions((o) => ({ ...o, variantFocus: id as VariantFocus }))}
            options={[
              { value: "all", label: "All" },
              { value: "elevated", label: "Elevated" },
              { value: "filled", label: "Filled" },
              { value: "outlined", label: "Outlined" },
            ]}
          />
        </div>
        <div className="sandbox-preview-toolbar-row">
          <span className="sandbox-preview-toolbar-label">Anatomy</span>
          <Switch
            size="sm"
            label="Media"
            checked={options.showMedia}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showMedia: checked }))}
          />
          <Switch
            size="sm"
            label="Action area"
            checked={options.showActionArea}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showActionArea: checked }))}
          />
        </div>
        <div className="sandbox-preview-toolbar-row">
          <span className="sandbox-preview-toolbar-label">States</span>
          <Switch
            size="sm"
            label="Interactive"
            checked={options.interactive}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, interactive: checked }))}
          />
          <Switch
            size="sm"
            label="Disabled"
            checked={options.disabled}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, disabled: checked }))}
          />
        </div>
        <div className="sandbox-preview-toolbar-row">
          <span className="sandbox-preview-toolbar-label">Actions</span>
          <ToggleGroup
            size="compact"
            segmentLayout="content"
            value={options.actionsAlign}
            onChange={(id) => setOptions((o) => ({ ...o, actionsAlign: id as ActionsAlign }))}
            options={[
              { value: "start", label: "Start" },
              { value: "end", label: "End" },
            ]}
          />
          <Switch
            size="sm"
            label="Dense spacing"
            checked={options.disableSpacing}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, disableSpacing: checked }))}
          />
        </div>
      </div>

      <div
        className={[
          "sandbox-preview-grid",
          options.variantFocus !== "all" ? "sandbox-preview-grid--focus" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {variants.map((variant) => {
          const interactive = options.interactive && !options.showActionArea;
          const body = (
            <>
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
                  <Tooltip content="More info">
                    <IconButton aria-label="More info">
                      <InfoIcon size={16} />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                A subject card with shared anatomy. Drag the corner handle or use the inspector
                to tune tokens — sandbox chrome updates from the same variables.
              </CardContent>
            </>
          );

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
                  {options.showActionArea ? (
                    <CardActionArea
                      disabled={options.disabled}
                      onClick={() => toast.message(`${variant} action area`)}
                    >
                      {body}
                    </CardActionArea>
                  ) : (
                    body
                  )}
                  <CardActions align={options.actionsAlign} disableSpacing={options.disableSpacing}>
                    <Button size="sm" variant="ghost" disabled={options.disabled}>
                      Dismiss
                    </Button>
                    <Button size="sm" variant="primary" disabled={options.disabled}>
                      Open
                    </Button>
                  </CardActions>
                </Card>
                <CornerRadiusHandle />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
