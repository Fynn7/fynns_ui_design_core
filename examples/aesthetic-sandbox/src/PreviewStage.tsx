import { useState, type CSSProperties } from "react";
import {
  Badge,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  FileIcon,
  FolderOpenIcon,
  PanelCard,
  toast,
  type CardVariant,
} from "@fynns/ui";
import type { AestheticPresetController } from "./useAestheticPreset";

const mediaStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  minHeight: "var(--fynns-size-152)",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--fynns-color-surface-2)",
  color: "var(--fynns-color-accent)",
};

const horizontalMediaStyle: CSSProperties = {
  ...mediaStyle,
  minHeight: "var(--fynns-size-240)",
};

const mutedCopyStyle: CSSProperties = {
  margin: 0,
  color: "var(--fynns-color-text-muted)",
};

const variants: CardVariant[] = ["filled", "elevated", "outlined"];

const states = [
  { id: "enabled", label: "Enabled" },
  { id: "hover", label: "Hovered" },
  { id: "focus", label: "Focused" },
  { id: "pressed", label: "Pressed" },
  { id: "dragged", label: "Dragged" },
  { id: "disabled", label: "Disabled" },
] as const;

type PreviewStageProps = {
  controller: AestheticPresetController;
};

export function PreviewStage({ controller }: PreviewStageProps) {
  const { defaultVariant, theme, preset } = controller;
  const [selected, setSelected] = useState(true);

  return (
    <main className="fynns-sandbox-preview fynns-scroll" aria-label="Card preview">
      <div className="fynns-sandbox-preview-toolbar">
        <div>
          <h1 className="fynns-sandbox-page-title">M3 card aesthetic sandbox</h1>
          <p className="fynns-sandbox-page-subtitle">
            Live component, layout, and interaction-state comparison.
          </p>
        </div>
        <div className="fynns-sandbox-preview-badges">
          <Badge variant="accent">{defaultVariant}</Badge>
          <Badge variant="neutral">{theme}</Badge>
          <Badge variant="info">{preset.label}</Badge>
        </div>
      </div>

      <section className="fynns-sandbox-preview-section" aria-labelledby="hero-preview-title">
        <div className="fynns-sandbox-section-heading">
          <div>
            <h2 id="hero-preview-title">Primary composition</h2>
            <p>Media, primary action area, supporting copy, and detached actions.</p>
          </div>
        </div>
        <div className="fynns-sandbox-hero-grid">
          <Card variant={defaultVariant}>
            <CardActionArea
              aria-label="Open design study"
              onClick={() => toast.success("Primary card action")}
            >
              <CardMedia>
                <div style={mediaStyle} aria-hidden="true">
                  <FolderOpenIcon size={34} />
                </div>
              </CardMedia>
              <CardHeader
                title="Design study"
                subheader="A single subject with a clear information hierarchy"
              />
              <CardContent>
                <p style={mutedCopyStyle}>
                  Adjust the controls and watch this card, every comparison sample, and the
                  editor chrome respond to the same variables.
                </p>
              </CardContent>
            </CardActionArea>
            <CardActions align="end">
              <Button variant="ghost" size="sm">
                Share
              </Button>
              <Button variant="ghost" size="sm">
                Open
              </Button>
            </CardActions>
          </Card>

          <Card variant={defaultVariant} layout="horizontal">
            <CardMedia orientation="start">
              <div style={horizontalMediaStyle} aria-hidden="true">
                <FileIcon size={34} />
              </div>
            </CardMedia>
            <CardContent>
              <Badge variant="accent">Adaptive</Badge>
              <h3 className="fynns-card-title">Horizontal research card</h3>
              <p style={mutedCopyStyle}>
                Intrinsic sizing wraps media and copy instead of forcing a rigid desktop layout.
              </p>
            </CardContent>
            <CardActions align="end">
              <Button variant="ghost" size="sm">
                Inspect
              </Button>
            </CardActions>
          </Card>
        </div>
      </section>

      <section className="fynns-sandbox-preview-section" aria-labelledby="variant-title">
        <div className="fynns-sandbox-section-heading">
          <div>
            <h2 id="variant-title">Variant comparison</h2>
            <p>Identical content isolates each container treatment.</p>
          </div>
        </div>
        <div className="fynns-sandbox-card-grid">
          {variants.map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader
                title={`${variant[0].toUpperCase()}${variant.slice(1)}`}
                subheader="Material 3 container variant"
              />
              <CardContent>
                <p style={mutedCopyStyle}>
                  Surface, outline, tint, and elevation remain independently adjustable.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="fynns-sandbox-preview-section" aria-labelledby="state-title">
        <div className="fynns-sandbox-section-heading">
          <div>
            <h2 id="state-title">Interaction states</h2>
            <p>Forced states make subtle overlays and elevation changes comparable at once.</p>
          </div>
        </div>
        <div className="fynns-sandbox-state-grid">
          {states.map((state) => (
            <Card
              key={state.id}
              variant={defaultVariant}
              clickable
              disabled={state.id === "disabled"}
              dragged={state.id === "dragged"}
              data-preview-state={state.id === "enabled" ? undefined : state.id}
              aria-label={`${state.label} state preview`}
              onClick={() => toast.info(`${state.label} card activated`)}
            >
              <CardContent padding="compact">
                <Badge variant={state.id === "disabled" ? "neutral" : "accent"}>
                  {state.label}
                </Badge>
                <p style={mutedCopyStyle}>State layer and container response</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="fynns-sandbox-preview-section" aria-labelledby="selection-title">
        <div className="fynns-sandbox-section-heading">
          <div>
            <h2 id="selection-title">Selection and actions</h2>
            <p>Keyboard-operable selection stays separate from supplemental controls.</p>
          </div>
        </div>
        <div className="fynns-sandbox-card-grid">
          <Card
            variant="outlined"
            checkable
            checked={selected}
            onCheckedChange={setSelected}
            aria-label="Select reference set"
          >
            <CardHeader
              title="Reference set"
              subheader={selected ? "Selected" : "Not selected"}
            />
            <CardContent>
              <p style={mutedCopyStyle}>
                Press Space or Enter anywhere on the non-control surface to toggle selection.
              </p>
            </CardContent>
          </Card>

          <Card variant="filled">
            <CardContent>
              <h3 className="fynns-card-title">Actions-only footer</h3>
              <p style={mutedCopyStyle}>
                Supplemental actions are explicit and do not turn the whole card into a target.
              </p>
            </CardContent>
            <CardActions align="between">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Continue
              </Button>
            </CardActions>
          </Card>
        </div>
      </section>

      <section className="fynns-sandbox-preview-section" aria-labelledby="panel-title">
        <div className="fynns-sandbox-section-heading">
          <div>
            <h2 id="panel-title">Panel compatibility</h2>
            <p>Legacy PanelCard markup delegates to the same panel variant tokens.</p>
          </div>
        </div>
        <PanelCard
          title="Project settings"
          actions={
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          }
          fill={false}
        >
          Panel content keeps its existing scrolling and fill behavior while sharing the new card
          container system.
        </PanelCard>
      </section>
    </main>
  );
}
