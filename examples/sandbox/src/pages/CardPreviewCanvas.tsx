import {
  Card,
  ControlRow,
  ControlStack,
  FolderOpenIcon,
  IconButton,
  SettingsIcon,
  Switch,
  Tooltip,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";

export type CardPreviewOptions = {
  showIcon: boolean;
  showActions: boolean;
};

const DEFAULT_OPTIONS: CardPreviewOptions = {
  showIcon: true,
  showActions: true,
};

export function CardPreviewCanvas() {
  const { t } = useLocale();
  const [options, setOptions] = useState<CardPreviewOptions>(DEFAULT_OPTIONS);

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
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
            {options.showIcon || options.showActions
              ? ` · ${[
                  options.showIcon ? t("preview.cardIcon") : null,
                  options.showActions ? t("preview.cardActions") : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}`
              : ` · ${t("preview.cardPlain")}`}
          </div>
          <div className="sandbox-preview-card-wrap">
            <Card
              title={t("preview.cardTitle")}
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
              <SandboxHelp text={t("preview.cardBody")} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
