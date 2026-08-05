import {
  Collapsible,
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

export type CollapsiblePreviewOptions = {
  open: boolean;
  showIcon: boolean;
  showActions: boolean;
};

const DEFAULT_OPTIONS: CollapsiblePreviewOptions = {
  open: true,
  showIcon: true,
  showActions: true,
};

export function CollapsiblePreviewCanvas() {
  const { t } = useLocale();
  const [options, setOptions] = useState<CollapsiblePreviewOptions>(DEFAULT_OPTIONS);

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
        <ControlRow label={t("preview.states")}>
          <Switch
            size="sm"
            labelSide="end"
            label={t("preview.collapsibleOpen")}
            checked={options.open}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, open: checked }))}
          />
        </ControlRow>
        <ControlRow label={t("preview.anatomy")}>
          <Switch
            size="sm"
            labelSide="end"
            label={t("preview.collapsibleIcon")}
            checked={options.showIcon}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showIcon: checked }))}
          />
          <Switch
            size="sm"
            labelSide="end"
            label={t("preview.collapsibleActions")}
            checked={options.showActions}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showActions: checked }))}
          />
        </ControlRow>
      </ControlStack>

      <div className="sandbox-preview-grid">
        <div className="sandbox-preview-slot">
          <div className="sandbox-preview-label">
            {t("preview.collapsibleLabel")}
            {options.showIcon || options.showActions
              ? ` · ${[
                  options.showIcon ? t("preview.collapsibleIcon") : null,
                  options.showActions ? t("preview.collapsibleActions") : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}`
              : ` · ${t("preview.collapsiblePlain")}`}
          </div>
          <div className="sandbox-preview-card-wrap">
            <Collapsible
              title={t("preview.collapsibleTitle")}
              open={options.open}
              onOpenChange={(open) => setOptions((o) => ({ ...o, open }))}
              icon={options.showIcon ? <FolderOpenIcon aria-hidden /> : undefined}
              actions={
                options.showActions ? (
                  <Tooltip content={t("preview.collapsibleActionTip")}>
                    <IconButton
                      aria-label={t("preview.collapsibleActionAria")}
                      onClick={() => undefined}
                    >
                      <SettingsIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                ) : undefined
              }
            >
              <SandboxHelp text={t("preview.collapsibleBody")} />
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
