import {
  COLOR_TOKENS,
  RADIUS_TOKENS,
  SHADOW_TOKENS,
  SPACE_TOKENS,
  STATE_LAYER_TOKENS,
  FONT_SIZE_TOKENS,
  fynnsVarName,
} from "@fynns/ui";

/** Sandbox chrome only — not part of `--fynns-*` / tokens.ts writeback. */
export const SANDBOX_BLOCK_GAP_VAR = "--sandbox-block-gap";
export const SANDBOX_BLOCK_GAP_BASELINE = "0.5rem";

/** Snapshot of production baseline values the sandbox can override. */
export const BASELINE: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(RADIUS_TOKENS).map(([k, v]) => [fynnsVarName("radius", k), v]),
  ),
  ...Object.fromEntries(
    Object.entries(COLOR_TOKENS).map(([k, v]) => [fynnsVarName("color", k), v]),
  ),
  ...Object.fromEntries(
    Object.entries(SHADOW_TOKENS).map(([k, v]) => [fynnsVarName("shadow", k), v]),
  ),
  ...Object.fromEntries(
    Object.entries(STATE_LAYER_TOKENS).map(([k, v]) => [fynnsVarName("state", k), v]),
  ),
  ...Object.fromEntries(
    Object.entries(SPACE_TOKENS)
      .filter(([k]) => ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"].includes(k))
      .map(([k, v]) => [fynnsVarName("space", k), v]),
  ),
  ...Object.fromEntries(
    Object.entries(FONT_SIZE_TOKENS)
      .filter(([k]) => ["xs", "sm", "md", "lg", "xl", "2xl"].includes(k))
      .map(([k, v]) => [fynnsVarName("font-size", k), v]),
  ),
  [SANDBOX_BLOCK_GAP_VAR]: SANDBOX_BLOCK_GAP_BASELINE,
};

/** Cheap content hash so drafts can detect stale baselines. */
export function hashBaseline(baseline: Record<string, string> = BASELINE): string {
  const payload = Object.keys(baseline)
    .sort()
    .map((k) => `${k}=${baseline[k]}`)
    .join("|");
  let h = 0;
  for (let i = 0; i < payload.length; i += 1) {
    h = (Math.imul(31, h) + payload.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(16)}`;
}

export const BASE_TOKENS_HASH = hashBaseline();
