import {
  Collapsible,
  ControlRow,
  ControlStack,
  IconButton,
  SettingsIcon,
  Switch,
  toast,
  Tooltip,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale } from "../i18n";

export type CollapsiblePreviewOptions = {
  open: boolean;
  showActions: boolean;
};

const DEFAULT_OPTIONS: CollapsiblePreviewOptions = {
  open: true,
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
            label={t("preview.collapsibleActions")}
            checked={options.showActions}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showActions: checked }))}
          />
        </ControlRow>
      </ControlStack>

      <div className="sandbox-preview-grid">
        <div className="sandbox-preview-slot">
          <div className="sandbox-preview-label">{t("preview.collapsibleLabel")}</div>
          <div className="sandbox-preview-card-wrap">
            <Collapsible
              title={t("preview.collapsibleTitle")}
              open={options.open}
              onOpenChange={(open) => setOptions((o) => ({ ...o, open }))}
              actions={
                options.showActions ? (
                  <Tooltip content={t("preview.collapsibleActionTip")}>
                    <IconButton
                      aria-label={t("preview.collapsibleActionAria")}
                      onClick={() => toast.message(t("preview.collapsibleActionToast"))}
                    >
                      <SettingsIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                ) : undefined
              }
            >
              <p className="sandbox-help">{t("preview.collapsibleBody")}</p>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
