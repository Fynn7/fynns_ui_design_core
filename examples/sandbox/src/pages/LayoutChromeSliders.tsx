import { InfoHint, Slider, UnitStack } from "@fynns/ui";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import {
  SANDBOX_CHROME_TOKENS,
  sandboxChromeVar,
  type EditableLayoutControlKey,
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

const LAYOUT_ROWS: ReadonlyArray<{
  key: EditableLayoutControlKey;
  labelKey: MessageKey;
  hintKey: MessageKey;
  max: number;
}> = [
  {
    key: "unit-stack-gap",
    labelKey: "layoutChrome.unitStackGap",
    hintKey: "layoutChrome.unitStackGapHint",
    max: 40,
  },
  {
    key: "control-stack-gap",
    labelKey: "layoutChrome.stackGap",
    hintKey: "layoutChrome.stackGapHint",
    max: 32,
  },
  {
    key: "control-row-column-gap",
    labelKey: "layoutChrome.rowColGap",
    hintKey: "layoutChrome.rowColGapHint",
    max: 32,
  },
  {
    key: "control-row-gap",
    labelKey: "layoutChrome.rowGapStack",
    hintKey: "layoutChrome.rowGapStackHint",
    max: 24,
  },
  {
    key: "control-cluster-gap",
    labelKey: "layoutChrome.clusterGap",
    hintKey: "layoutChrome.clusterGapHint",
    max: 24,
  },
];

/** Shared GUI for `--sandbox-*` + `--fynns-layout-control-*` draft knobs. */
export function LayoutChromeSliders({ showChrome = true }: { showChrome?: boolean }) {
  const { t } = useLocale();
  const { resolved, mergeOverrides, apply } = useTokenDraft();

  return (
    <UnitStack>
      <SandboxHelp text={t("layoutChrome.help")} />
      {showChrome
        ? CHROME_ROWS.map(({ key, labelKey, hintKey, max }) => {
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
          })
        : null}
      <SandboxHelp text={t("layoutChrome.rhythmHelp")} />
      {LAYOUT_ROWS.map(({ key, labelKey, hintKey, max }) => {
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
    </UnitStack>
  );
}
