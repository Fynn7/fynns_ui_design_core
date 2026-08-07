import {
  Card,
  type CollapsibleChrome,
  ControlRow,
  ControlStack,
  FolderOpenIcon,
  IconButton,
  SettingsIcon,
  Surface,
  Switch,
  Tooltip,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";

export type CardPreviewOptions = {
  showIcon: boolean;
  showActions: boolean;
  chromePlain: boolean;
};

const DEFAULT_OPTIONS: CardPreviewOptions = {
  showIcon: true,
  showActions: true,
  chromePlain: false,
};

export function CardPreviewCanvas() {
  const { t } = useLocale();
  const [options, setOptions] = useState<CardPreviewOptions>(DEFAULT_OPTIONS);
  const chrome: CollapsibleChrome = options.chromePlain ? "plain" : "card";

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
        <ControlRow label={t("preview.states")}>
          <Switch
            labelSide="end"
            label={t("preview.cardChromePlain")}
            checked={options.chromePlain}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, chromePlain: checked }))}
          />
        </ControlRow>
        <ControlRow label={t("preview.anatomy")}>
          <Switch
            labelSide="end"
            label={t("preview.cardIcon")}
            checked={options.showIcon}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showIcon: checked }))}
          />
          <Switch
            labelSide="end"
            label={t("preview.cardActions")}
            checked={options.showActions}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showActions: checked }))}
          />
        </ControlRow>
      </ControlStack>

      <div className="sandbox-preview-grid">
        <div className="sandbox-preview-slot">
          <div className="sandbox-preview-label">
            {t("preview.cardLabel")}
            {` · chrome="${chrome}"`}
            {options.showIcon || options.showActions
              ? ` · ${[
                  options.showIcon ? t("preview.cardIcon") : null,
                  options.showActions ? t("preview.cardActions") : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}`
              : ` · ${t("preview.cardTitleOnly")}`}
          </div>
          <div className="sandbox-preview-card-wrap">
            <Card
              title={t("preview.cardTitle")}
              chrome={chrome}
              icon={options.showIcon ? <FolderOpenIcon aria-hidden /> : undefined}
              actions={
                options.showActions ? (
                  <Tooltip content={t("preview.cardActionTip")}>
                    <IconButton aria-label={t("preview.cardActionAria")} onClick={() => undefined}>
                      <SettingsIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                ) : undefined
              }
            >
              {options.chromePlain ? (
                <>
                  <Surface fill padded style={{ minHeight: "4rem" }}>
                    <SandboxHelp as="span" text={t("preview.cardChromePlainBody")} />
                  </Surface>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--fynns-color-text-muted)",
                      fontSize: "var(--fynns-font-size-sm)",
                      lineHeight: "var(--fynns-line-height-normal)",
                    }}
                  >
                    {t("preview.cardChromePlainNote")}
                  </p>
                </>
              ) : (
                <SandboxHelp text={t("preview.cardBody")} />
              )}
            </Card>
          </div>
          {options.chromePlain ? (
            <SandboxHelp text={t("preview.cardChromePlainHelp")} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
