import { InfoHint, Slider } from "@fynns/ui";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import {
  EDITABLE_LAYOUT_BY_SECTION,
  SANDBOX_CHROME_TOKENS,
  sandboxChromeVar,
  type EditableLayoutKey,
  type LayoutChromeSectionId,
  type SandboxChromeKey,
} from "../state/baseline";
import { useTokenDraft } from "../state/TokenDraftProvider";

function parseLengthToPx(value: string): number {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.trim().endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

function pxToRem(px: number): string {
  const rem = px / 16;
  return `${Number(rem.toFixed(4))}rem`;
}

const CHROME_ROWS: ReadonlyArray<{
  key: SandboxChromeKey;
  labelKey: MessageKey;
  hintKey: MessageKey;
  max: number;
}> = [
  {
    key: "row-gap",
    labelKey: "layoutChrome.rowGap",
    hintKey: "layoutChrome.rowGapHint",
    max: 48,
  },
  {
    key: "section-gap",
    labelKey: "layoutChrome.sectionGap",
    hintKey: "layoutChrome.sectionGapHint",
    max: 32,
  },
  {
    key: "chrome-bar-height",
    labelKey: "layoutChrome.chromeBar",
    hintKey: "layoutChrome.chromeBarHint",
    max: 72,
  },
];

const LAYOUT_ROW_META: Record<
  EditableLayoutKey,
  { labelKey: MessageKey; hintKey: MessageKey; max: number }
> = {
  "unit-stack-gap": {
    labelKey: "layoutChrome.unitStackGap",
    hintKey: "layoutChrome.unitStackGapHint",
    max: 40,
  },
  "control-stack-gap": {
    labelKey: "layoutChrome.stackGap",
    hintKey: "layoutChrome.stackGapHint",
    max: 32,
  },
  "control-row-column-gap": {
    labelKey: "layoutChrome.rowColGap",
    hintKey: "layoutChrome.rowColGapHint",
    max: 32,
  },
  "control-row-gap": {
    labelKey: "layoutChrome.rowGapStack",
    hintKey: "layoutChrome.rowGapStackHint",
    max: 24,
  },
  "control-cluster-gap": {
    labelKey: "layoutChrome.clusterGap",
    hintKey: "layoutChrome.clusterGapHint",
    max: 24,
  },
  "control-row-label": {
    labelKey: "layoutChrome.controlRowLabel",
    hintKey: "layoutChrome.controlRowLabelHint",
    max: 200,
  },
  "content-inset": {
    labelKey: "layoutChrome.contentInset",
    hintKey: "layoutChrome.contentInsetHint",
    max: 48,
  },
  "content-pad-block": {
    labelKey: "layoutChrome.contentPadBlock",
    hintKey: "layoutChrome.contentPadBlockHint",
    max: 48,
  },
  "dialog-inset": {
    labelKey: "layoutChrome.dialogInset",
    hintKey: "layoutChrome.dialogInsetHint",
    max: 48,
  },
  "sheet-pad-inline": {
    labelKey: "layoutChrome.sheetPadInline",
    hintKey: "layoutChrome.sheetPadInlineHint",
    max: 48,
  },
  "sheet-pad-block": {
    labelKey: "layoutChrome.sheetPadBlock",
    hintKey: "layoutChrome.sheetPadBlockHint",
    max: 48,
  },
  "drawer-width": {
    labelKey: "layoutChrome.drawerWidth",
    hintKey: "layoutChrome.drawerWidthHint",
    max: 560,
  },
  "end-aside-width": {
    labelKey: "layoutChrome.endAsideWidth",
    hintKey: "layoutChrome.endAsideWidthHint",
    max: 480,
  },
  "end-aside-max-width": {
    labelKey: "layoutChrome.endAsideMaxWidth",
    hintKey: "layoutChrome.endAsideMaxWidthHint",
    max: 720,
  },
  "dialog-max-width-sm": {
    labelKey: "layoutChrome.dialogMaxSm",
    hintKey: "layoutChrome.dialogMaxSmHint",
    max: 560,
  },
  "dialog-max-width-md": {
    labelKey: "layoutChrome.dialogMaxMd",
    hintKey: "layoutChrome.dialogMaxMdHint",
    max: 640,
  },
  "dialog-max-width-lg": {
    labelKey: "layoutChrome.dialogMaxLg",
    hintKey: "layoutChrome.dialogMaxLgHint",
    max: 720,
  },
  "bar-height": {
    labelKey: "layoutChrome.barHeight",
    hintKey: "layoutChrome.barHeightHint",
    max: 96,
  },
};

const LAYOUT_SECTIONS: ReadonlyArray<{
  id: Exclude<LayoutChromeSectionId, "sandbox">;
  helpKey: MessageKey;
}> = [
  { id: "rhythm", helpKey: "layoutChrome.rhythmHelp" },
  { id: "panelInsets", helpKey: "layoutChrome.panelInsetsHelp" },
  { id: "sheetPads", helpKey: "layoutChrome.sheetPadsHelp" },
  { id: "shellSize", helpKey: "layoutChrome.shellSizeHelp" },
];

/** Shared GUI for `--sandbox-*` + editable `--fynns-layout-*` draft knobs. */
export function LayoutChromeSliders({ showChrome = true }: { showChrome?: boolean }) {
  const { t } = useLocale();
  const { resolved, mergeOverrides, apply } = useTokenDraft();

  return (
    <div className="sandbox-stack">
      {showChrome ? (
        <>
          <SandboxHelp text={t("layoutChrome.help")} />
          {CHROME_ROWS.map(({ key, labelKey, hintKey, max }) => {
            const cssVar = sandboxChromeVar(key);
            const px = parseLengthToPx(resolved(cssVar) || SANDBOX_CHROME_TOKENS[key]);
            const label = t(labelKey);
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <InfoHint
                    label={
                      <span className="sandbox-radius-label">
                        <code>--sandbox-{key}</code>
                        <span className="sandbox-radius-uses">{label}</span>
                      </span>
                    }
                    ariaLabel={`${cssVar}: ${label}`}
                    content={t(hintKey)}
                  />
                  <code>{px}px</code>
                </div>
                <Slider
                  ariaLabel={label}
                  min={0}
                  max={max}
                  step={1}
                  value={px}
                  onChange={(v) =>
                    mergeOverrides(
                      { [cssVar]: pxToRem(v) },
                      { source: "slider", coalesce: true, group: "sandbox" },
                    )
                  }
                />
              </div>
            );
          })}
        </>
      ) : null}

      {LAYOUT_SECTIONS.map(({ id, helpKey }) => (
        <div key={id} className="sandbox-stack">
          <SandboxHelp text={t(helpKey)} />
          {EDITABLE_LAYOUT_BY_SECTION[id].map((key) => {
            const { labelKey, hintKey, max } = LAYOUT_ROW_META[key];
            const cssVar = `--fynns-layout-${key}`;
            const px = parseLengthToPx(resolved(cssVar));
            const label = t(labelKey);
            return (
              <div key={key} className="sandbox-field">
                <div className="sandbox-field-row">
                  <InfoHint
                    label={
                      <span className="sandbox-radius-label">
                        <code>layout-{key}</code>
                        <span className="sandbox-radius-uses">{label}</span>
                      </span>
                    }
                    ariaLabel={`${cssVar}: ${label}`}
                    content={t(hintKey)}
                  />
                  <code>{px}px</code>
                </div>
                <Slider
                  ariaLabel={label}
                  min={0}
                  max={max}
                  step={1}
                  value={px}
                  onChange={(v) =>
                    apply({
                      group: "layout",
                      key,
                      value: pxToRem(v),
                      source: "slider",
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
