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
 * Agents must use these (or `--fynns-layout-*`) instead of inventing gaps.
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

/**
 * Layout chrome GUI sections — classify by *role*, not by component name.
 *
 * 1. sandbox — demo-only `--sandbox-*` (not Apply)
 * 2. rhythm — gaps between units / ControlRows + toolbar label column
 * 3. panelInsets — equal four-side outer pad (Card / Collapsible / Drawer / Dialog)
 * 4. sheetPads — BottomSheet M3 asymmetric pads (do not merge with panelInsets)
 * 5. shellSize — container width / chrome bar height (not padding)
 */
export type LayoutChromeSectionId =
  | "sandbox"
  | "rhythm"
  | "panelInsets"
  | "sheetPads"
  | "shellSize";

/** Apply-writable `--fynns-layout-*` keys exposed in the sandbox GUI. */
export const EDITABLE_LAYOUT_KEYS = [
  // rhythm
  "unit-stack-gap",
  "control-stack-gap",
  "control-row-gap",
  "control-row-column-gap",
  "control-cluster-gap",
  "control-row-label",
  // panelInsets
  "content-inset",
  "dialog-inset",
  // sheetPads
  "sheet-pad-inline",
  "sheet-pad-block",
  // shellSize
  "drawer-width",
  "dialog-max-width-sm",
  "dialog-max-width-md",
  "dialog-max-width-lg",
  "bar-height",
] as const satisfies ReadonlyArray<keyof typeof LAYOUT_TOKENS>;

export type EditableLayoutKey = (typeof EDITABLE_LAYOUT_KEYS)[number];

/** @deprecated Prefer `EDITABLE_LAYOUT_KEYS`. */
export const EDITABLE_LAYOUT_CONTROL_KEYS = EDITABLE_LAYOUT_KEYS;
/** @deprecated Prefer `EditableLayoutKey`. */
export type EditableLayoutControlKey = EditableLayoutKey;

export const EDITABLE_LAYOUT_BY_SECTION: Record<
  Exclude<LayoutChromeSectionId, "sandbox">,
  ReadonlyArray<EditableLayoutKey>
> = {
  rhythm: [
    "unit-stack-gap",
    "control-stack-gap",
    "control-row-column-gap",
    "control-row-gap",
    "control-cluster-gap",
    "control-row-label",
  ],
  panelInsets: ["content-inset", "dialog-inset"],
  sheetPads: ["sheet-pad-inline", "sheet-pad-block"],
  shellSize: [
    "drawer-width",
    "dialog-max-width-sm",
    "dialog-max-width-md",
    "dialog-max-width-lg",
    "bar-height",
  ],
};

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
    EDITABLE_LAYOUT_KEYS.map((k) => [fynnsVarName("layout", k), LAYOUT_TOKENS[k]]),
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

const LAYOUT_KEY_ROLES: Record<EditableLayoutKey, string> = {
  "unit-stack-gap": "Unit stack · between inspector/form units (.sandbox-stack)",
  "control-stack-gap": "Toolbar rhythm · between ControlRows",
  "control-row-gap": "Toolbar rhythm · stacked label above controls",
  "control-row-column-gap": "Toolbar rhythm · horizontal label | controls",
  "control-cluster-gap": "Toolbar rhythm · siblings in one controls cluster",
  "control-row-label": "Toolbar structure · ControlRow fixed label column",
  "content-inset": "Panel inset · Card / Collapsible / Drawer equal outer pad",
  "dialog-inset": "Panel inset · centered Dialog / ConfirmDialog equal outer pad",
  "sheet-pad-inline": "Sheet pad · BottomSheet horizontal (M3 ≠ content-inset)",
  "sheet-pad-block": "Sheet pad · BottomSheet vertical (M3 ≠ content-inset)",
  "drawer-width": "Shell size · content Drawer width",
  "dialog-max-width-sm": "Shell size · Dialog size=sm max width",
  "dialog-max-width-md": "Shell size · Dialog size=md max width",
  "dialog-max-width-lg": "Shell size · Dialog size=lg max width",
  "bar-height":
    "Shell size · product chrome bar (TopAppBar sm / BottomAppBar / SearchBar / Toolbar)",
};

/**
 * Agent-facing catalog: every gap / chrome length the sandbox owns.
 * Prefer these CSS vars — do not invent ad-hoc `gap` / `margin` values.
 */
export const SANDBOX_LAYOUT_AGENT_CATALOG: ReadonlyArray<{
  cssVar: string;
  role: string;
  section: LayoutChromeSectionId;
  applyWrites: boolean;
}> = [
  {
    cssVar: sandboxChromeVar("row-gap"),
    role: "Demo Row wrap gap (Motion easing bars, Foundations flex wraps)",
    section: "sandbox",
    applyWrites: false,
  },
  {
    cssVar: sandboxChromeVar("section-gap"),
    role: "Demo Section title → body",
    section: "sandbox",
    applyWrites: false,
  },
  {
    cssVar: sandboxChromeVar("chrome-bar-height"),
    role: "Sandbox brand + page topbar strip (not product --fynns-layout-bar-height)",
    section: "sandbox",
    applyWrites: false,
  },
  ...EDITABLE_LAYOUT_KEYS.map((k) => {
    const section = (
      Object.entries(EDITABLE_LAYOUT_BY_SECTION) as Array<
        [Exclude<LayoutChromeSectionId, "sandbox">, ReadonlyArray<EditableLayoutKey>]
      >
    ).find(([, keys]) => keys.includes(k))?.[0];
    if (!section) {
      throw new Error(`EDITABLE_LAYOUT_KEYS missing section for ${k}`);
    }
    return {
      cssVar: fynnsVarName("layout", k),
      role: LAYOUT_KEY_ROLES[k],
      section,
      applyWrites: true,
    };
  }),
];
