import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  InfoIcon,
  Tooltip,
} from "@fynns/ui";
import { CornerRadiusHandle } from "../manipulators/CornerRadiusHandle";

const VARIANTS = ["elevated", "filled", "outlined"] as const;

type CardPreviewCanvasProps = {
  showCornerHandle?: boolean;
  interactiveDemo?: boolean;
};

export function CardPreviewCanvas({
  showCornerHandle = true,
  interactiveDemo = true,
}: CardPreviewCanvasProps) {
  return (
    <div className="sandbox-preview-grid">
      {VARIANTS.map((variant) => (
        <div key={variant} className="sandbox-preview-slot">
          <div className="sandbox-preview-label">{variant}</div>
          <div className="sandbox-preview-card-wrap">
            <Card variant={variant} interactive={interactiveDemo && variant === "elevated"}>
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
              <CardActions align="end">
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
                <Button size="sm" variant="primary">
                  Open
                </Button>
              </CardActions>
            </Card>
            {showCornerHandle && variant === "elevated" ? <CornerRadiusHandle /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
