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
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";

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
  const { t } = useLocale();
  const [options, setOptions] = useState<CardPreviewOptions>(DEFAULT_OPTIONS);

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
              label={t("preview.interactive")}
              checked={options.interactive}
              onCheckedChange={(checked) => setOptions((o) => ({ ...o, interactive: checked }))}
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
                  onClick={interactive ? () => undefined : undefined}
                >
                  {options.showMedia ? (
                    <CardMedia>
                      <div className="fynns-card-media-placeholder" aria-hidden>
                        {t("preview.media")}
                      </div>
                    </CardMedia>
                  ) : null}
                  <CardHeader
                    avatar="F"
                    title={t("preview.cardTitle")}
                    subtitle={t("preview.cardSubtitle")}
                    action={
                      <InfoHint content={t("preview.cardInfo")} ariaLabel={t("preview.cardInfoAria")} />
                    }
                  />
                  <CardContent>{t("preview.cardBody")}</CardContent>
                  <CardActions align={options.actionsAlign}>
                    <Button size="sm" variant="ghost" disabled={options.disabled}>
                      {t("preview.dismiss")}
                    </Button>
                    <Button size="sm" variant="primary" disabled={options.disabled}>
                      {t("preview.open")}
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
