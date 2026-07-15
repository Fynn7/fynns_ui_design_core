import { useState, type CSSProperties } from "react";
import {
  ArchiveIcon,
  Badge,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  FileIcon,
  IconButton,
  PanelCard,
  Tooltip,
  toast,
  type CardVariant,
} from "@fynns/ui";
import { Section } from "./galleryShared";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(var(--fynns-size-240), 1fr))",
  gap: "var(--fynns-card-gap)",
};

const stackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--fynns-card-gap)",
};

const mediaPlaceholderStyle: CSSProperties = {
  display: "flex",
  minHeight: "var(--fynns-size-152)",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--fynns-color-surface-2)",
  color: "var(--fynns-color-accent)",
};

const horizontalMediaStyle: CSSProperties = {
  ...mediaPlaceholderStyle,
  minHeight: "var(--fynns-size-240)",
};

const copyStyle: CSSProperties = {
  margin: 0,
  color: "var(--fynns-color-text-muted)",
};

const variants: CardVariant[] = ["filled", "elevated", "outlined"];

export function Cards() {
  const [checkedCards, setCheckedCards] = useState<Record<string, boolean>>({
    research: true,
    drafts: false,
    archive: false,
  });
  const [dragged, setDragged] = useState(false);

  const toggleChecked = (id: string, checked: boolean) => {
    setCheckedCards((current) => ({ ...current, [id]: checked }));
  };

  return (
    <Section title="Cards (Material 3)">
      <div style={stackStyle}>
        <Card variant="outlined">
          <CardHeader
            title="Aesthetic sandbox"
            subheader="Run the dedicated playground to tune card tokens and compare every state."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("http://localhost:5174", "_blank", "noopener,noreferrer")}
              >
                Open sandbox
              </Button>
            }
          />
          <CardContent padding="compact">
            <span style={copyStyle}>Command: </span>
            <code>npm run sandbox</code>
          </CardContent>
        </Card>

        <div style={gridStyle}>
          {variants.map((variant) => (
            <Card key={variant} variant={variant}>
              <CardHeader
                title={`${variant[0].toUpperCase()}${variant.slice(1)} card`}
                subheader="Same hierarchy, different container treatment"
              />
              <CardContent>
                <p style={copyStyle}>
                  M3 variants keep the same content and behavior. Choose by visual emphasis.
                </p>
              </CardContent>
              <CardActions align="end">
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>

        <div style={gridStyle}>
          <Card variant="filled">
            <CardContent>
              <h3 className="fynns-card-title">Text-only card</h3>
              <p style={copyStyle}>
                A concise subject, supporting copy, and related actions without decorative chrome.
              </p>
            </CardContent>
            <CardActions>
              <Button variant="ghost" size="sm">
                Learn more
              </Button>
              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
            </CardActions>
          </Card>

          <Card variant="elevated">
            <CardActionArea
              aria-label="Open field notes"
              onClick={() => toast.success("Opened field notes")}
            >
              <CardMedia>
                <div style={mediaPlaceholderStyle} aria-hidden="true">
                  <ArchiveIcon size={34} />
                </div>
              </CardMedia>
              <CardHeader title="Field notes" subheader="Vertical card with 16:9 media" />
              <CardContent>
                <p style={copyStyle}>
                  The primary action area contains media and copy while supplemental actions remain
                  separate.
                </p>
              </CardContent>
            </CardActionArea>
            <CardActions align="end">
              <Button variant="ghost" size="sm">
                Share
              </Button>
            </CardActions>
          </Card>
        </div>

        <Card variant="outlined" layout="horizontal">
          <CardMedia orientation="start">
            <div style={horizontalMediaStyle} aria-hidden="true">
              <FileIcon size={34} />
            </div>
          </CardMedia>
          <CardContent>
            <Badge variant="accent">Horizontal</Badge>
            <h3 className="fynns-card-title">Research summary</h3>
            <p style={copyStyle}>
              Intrinsic flex sizing lets the media and content wrap cleanly when the card becomes
              narrow.
            </p>
          </CardContent>
          <CardActions align="end">
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </CardActions>
        </Card>

        <div style={gridStyle}>
          {[
            ["research", "Research", "Collected references and experiments"],
            ["drafts", "Drafts", "Work that still needs review"],
            ["archive", "Archive", "Completed material kept for context"],
          ].map(([id, title, description]) => (
            <Card
              key={id}
              variant="outlined"
              checkable
              checked={checkedCards[id]}
              onCheckedChange={(checked) => toggleChecked(id, checked)}
              aria-label={`Select ${title}`}
            >
              <CardHeader title={title} subheader={description} />
            </Card>
          ))}
        </div>

        <div style={gridStyle}>
          <Card
            variant="filled"
            clickable
            aria-label="Open keyboard-accessible card"
            onClick={() => toast.info("Card activated with pointer or keyboard")}
          >
            <CardHeader title="Clickable surface" subheader="Focus this card, then press Enter or Space" />
            <CardContent>
              <p style={copyStyle}>The whole card is the only action, so nested controls are omitted.</p>
            </CardContent>
          </Card>

          <Card
            variant="elevated"
            draggable
            dragged={dragged}
            onDraggedChange={setDragged}
            onDragStart={(event) => event.dataTransfer.setData("text/plain", "dragged-card")}
          >
            <CardHeader
              title="Pick up and move"
              subheader={dragged ? "Dragged elevation active" : "Drag to inspect the lifted state"}
              action={
                <Tooltip content={dragged ? "Card is being dragged" : "Drag state preview"}>
                  <IconButton aria-label={dragged ? "Card is being dragged" : "Drag state preview"}>
                    <ArchiveIcon size={16} />
                  </IconButton>
                </Tooltip>
              }
            />
          </Card>
        </div>

        <PanelCard
          title="Panel card compatibility"
          actions={
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          }
          fill={false}
        >
          Existing PanelCard props and class names now delegate to the shared panel card variant.
        </PanelCard>
      </div>
    </Section>
  );
}
