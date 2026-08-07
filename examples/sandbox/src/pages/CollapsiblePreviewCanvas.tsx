import {
  CodeBlock,
  Collapsible,
  type CollapsibleChrome,
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
  chromePlain: boolean;
};

const DEFAULT_OPTIONS: CollapsiblePreviewOptions = {
  open: true,
  showIcon: true,
  showActions: true,
  chromePlain: false,
};

const PLAIN_NEST_CODE_A = `setdir output/demo
resize 512 512
screenshot candidate.png
`;

const PLAIN_NEST_CODE_B = `# sibling CodeBlock — nest-gap between wells
npm run sandbox
`;

export function CollapsiblePreviewCanvas() {
  const { t } = useLocale();
  const [options, setOptions] = useState<CollapsiblePreviewOptions>(DEFAULT_OPTIONS);
  const chrome: CollapsibleChrome = options.chromePlain ? "plain" : "card";

  return (
    <div className="sandbox-preview">
      <ControlStack className="sandbox-preview-toolbar" columns={2}>
        <ControlRow label={t("preview.states")}>
          <Switch
            labelSide="end"
            label={t("preview.collapsibleOpen")}
            checked={options.open}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, open: checked }))}
          />
          <Switch
            labelSide="end"
            label={t("preview.collapsibleChromePlain")}
            checked={options.chromePlain}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, chromePlain: checked }))}
          />
        </ControlRow>
        <ControlRow label={t("preview.anatomy")}>
          <Switch
            labelSide="end"
            label={t("preview.collapsibleIcon")}
            checked={options.showIcon}
            onCheckedChange={(checked) => setOptions((o) => ({ ...o, showIcon: checked }))}
          />
          <Switch
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
            {` · chrome="${chrome}"`}
            {options.showIcon || options.showActions
              ? ` · ${[
                  options.showIcon ? t("preview.collapsibleIcon") : null,
                  options.showActions ? t("preview.collapsibleActions") : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}`
              : ` · ${t("preview.collapsibleTitleOnly")}`}
          </div>
          <div className="sandbox-preview-card-wrap">
            <Collapsible
              title={t("preview.collapsibleTitle")}
              chrome={chrome}
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
              {options.chromePlain ? (
                <>
                  <CodeBlock
                    variant="plain"
                    language="bash"
                    copyAriaLabel={t("globals.codeBlockCopy")}
                    code={PLAIN_NEST_CODE_A}
                    maxHeight="6rem"
                  />
                  <CodeBlock
                    variant="plain"
                    language="bash"
                    copyAriaLabel={t("globals.codeBlockCopy")}
                    code={PLAIN_NEST_CODE_B}
                    maxHeight="5rem"
                  />
                  <p
                    style={{
                      margin: 0,
                      color: "var(--fynns-color-text-muted)",
                      fontSize: "var(--fynns-font-size-sm)",
                      lineHeight: "var(--fynns-line-height-normal)",
                    }}
                  >
                    {t("preview.collapsibleChromePlainNote")}
                  </p>
                </>
              ) : (
                <SandboxHelp text={t("preview.collapsibleBody")} />
              )}
            </Collapsible>
          </div>
          {options.chromePlain ? (
            <SandboxHelp text={t("preview.collapsibleChromePlainHelp")} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
