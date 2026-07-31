import {
  COLOR_TOKENS,
  FONT_SIZE_TOKENS,
  LAYOUT_TOKENS,
  RADIUS_TOKENS,
  SHADOW_TOKENS,
  SPACE_TOKENS,
  STATE_LAYER_TOKENS,
  fynnsVarName,
} from "@fynns/ui";

/**
 * Sandbox-only chrome layout vars (`--sandbox-*`).
 * Live in the token draft + GUI; **not** written to `tokens.ts` on Apply.
 * Agents must use these (or `--fynns-layout-control-*`) instead of inventing gaps.
 */
export const SANDBOX_CHROME_TOKENS = {
  /**
   * Demo / Foundations `Row` wrap gap (horizontal + between wrapped rows).
   * Motion easing bars use this — raise it to separate wrap lines.
   */
  "row-gap": "1rem",
  /** Gallery / demo `Section` title → body gap. */
  "section-gap": "0.75rem",
  /** Brand cell + page topbar shared strip height. */
  "chrome-bar-height": "3.5rem",
} as const;

export type SandboxChromeKey = keyof typeof SANDBOX_CHROME_TOKENS;

export function sandboxChromeVar(key: SandboxChromeKey): string {
  return `--sandbox-${key}`;
}

/** Toolbar / unit-stack rhythm keys editable in the sandbox (Apply → LAYOUT_TOKENS). */
export const EDITABLE_LAYOUT_CONTROL_KEYS = [
  "unit-stack-gap",
  "control-stack-gap",
  "control-row-gap",
  "control-row-column-gap",
  "control-cluster-gap",
] as const satisfies ReadonlyArray<keyof typeof LAYOUT_TOKENS>;

export type EditableLayoutControlKey = (typeof EDITABLE_LAYOUT_CONTROL_KEYS)[number];

/** Prefer `--fynns-layout-unit-stack-gap` / sandbox `.sandbox-stack`. */
export const SANDBOX_BLOCK_GAP_VAR = "--fynns-layout-unit-stack-gap";
/** @deprecated Prefer `LAYOUT_TOKENS["unit-stack-gap"]`. */
export const SANDBOX_BLOCK_GAP_BASELINE = LAYOUT_TOKENS["unit-stack-gap"];

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
  ...Object.fromEntries(
    EDITABLE_LAYOUT_CONTROL_KEYS.map((k) => [
      fynnsVarName("layout", k),
      LAYOUT_TOKENS[k],
    ]),
  ),
  ...Object.fromEntries(
    (Object.keys(SANDBOX_CHROME_TOKENS) as SandboxChromeKey[]).map((k) => [
      sandboxChromeVar(k),
      SANDBOX_CHROME_TOKENS[k],
    ]),
  ),
};

/**
 * Sandbox aesthetic starting overrides (not written to `tokens.ts` until Apply).
 * Fresh draft / full Reset land here; shape-ladder Reset restores these too.
 */
export const SANDBOX_DEFAULT_OVERRIDES: Record<string, string> = {
  [fynnsVarName("radius", "md")]: "20px",
};

/** Resting values for sandbox knobs: production baseline + sandbox defaults. */
export const SANDBOX_RESTING: Record<string, string> = {
  ...BASELINE,
  ...SANDBOX_DEFAULT_OVERRIDES,
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

/**
 * Agent-facing catalog: every gap / chrome length the sandbox owns.
 * Prefer these CSS vars — do not invent ad-hoc `gap` / `margin` values.
 */
export const SANDBOX_LAYOUT_AGENT_CATALOG: ReadonlyArray<{
  cssVar: string;
  role: string;
  applyWrites: boolean;
}> = [
  {
    cssVar: sandboxChromeVar("row-gap"),
    role: "Demo Row wrap gap (Motion easing bars, Foundations flex wraps)",
    applyWrites: false,
  },
  {
    cssVar: sandboxChromeVar("section-gap"),
    role: "Demo Section title → body",
    applyWrites: false,
  },
  {
    cssVar: sandboxChromeVar("chrome-bar-height"),
    role: "Brand + topbar strip height",
    applyWrites: false,
  },
  ...EDITABLE_LAYOUT_CONTROL_KEYS.map((k) => ({
    cssVar: fynnsVarName("layout", k),
    role:
      k === "unit-stack-gap"
        ? "Unit stack · between inspector/form units (.sandbox-stack)"
        : `Toolbar rhythm · ${k}`,
    applyWrites: true,
  })),
];
