import {
  COLOR_TOKENS,
  FONT_SIZE_TOKENS,
  LAYOUT_TOKENS,
  NAVDRAWER_TOKENS,
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
 * 3. panelInsets — content-inset / content-pad-block / dialog-inset /
 *    strip-pad-inline / capsule-chrome-pad-inline / field-pad-inline /
 *    field-pad-block / textarea-max-height
 * 4. sheetPads — BottomSheet M3 asymmetric pads (do not merge with panelInsets)
 * 5. shellSize — container width / chrome bar height (not padding)
 * 6. navDrawer — NavigationDrawer absolute rem width / min / max
 */
export type LayoutChromeSectionId =
  | "sandbox"
  | "rhythm"
  | "panelInsets"
  | "sheetPads"
  | "shellSize"
  | "navDrawer";

/** Apply-writable `--fynns-layout-*` keys exposed in the sandbox GUI. */
export const EDITABLE_LAYOUT_KEYS = [
  // rhythm — field-hint-gap aliases unit-stack-gap in CSS (not separately editable)
  "unit-stack-gap",
  "control-stack-gap",
  "control-row-gap",
  "control-row-column-gap",
  "control-cluster-gap",
  "chrome-icon-gap",
  "control-row-label",
  // panelInsets
  "content-inset",
  "content-pad-block",
  "nest-gap",
  "dialog-inset",
  "strip-pad-inline",
  "capsule-chrome-pad-inline",
  "field-pad-inline",
  "field-pad-block",
  "textarea-max-height",
  // sheetPads
  "sheet-pad-inline",
  "sheet-pad-block",
  // shellSize
  "drawer-width",
  "end-aside-width",
  // end-aside-max-width stays a CSS token (often vw) — not rem-slider editable
  "dialog-max-width-sm",
  "dialog-max-width-md",
  "dialog-max-width-lg",
  "bar-height",
  "chat-max-width",
  "chat-min-width",
] as const satisfies ReadonlyArray<keyof typeof LAYOUT_TOKENS>;

export type EditableLayoutKey = (typeof EDITABLE_LAYOUT_KEYS)[number];

/**
 * `--fynns-navdrawer-*` absolute rem keys (ClippedNavShell drawer track).
 * Apply writes `NAVDRAWER_TOKENS`.
 */
export const EDITABLE_NAVDRAWER_KEYS = [
  "width",
  "min-width",
  "max-width",
] as const satisfies ReadonlyArray<keyof typeof NAVDRAWER_TOKENS>;

export type EditableNavdrawerKey = (typeof EDITABLE_NAVDRAWER_KEYS)[number];

/**
 * Layout keys with vh / `min()` / `clamp()` / `var()` — visible read-only
 * (same pattern as radius none/pill/round).
 */
export const READONLY_LAYOUT_KEYS = [
  "end-aside-max-width",
  "end-aside-min-width",
  "main-min-width",
  "sheet-max-height",
  "sheet-half-height",
  "tooltip-max-width",
  "snackbar-max-width",
  "field-hint-gap",
] as const satisfies ReadonlyArray<keyof typeof LAYOUT_TOKENS>;

export type ReadonlyLayoutKey = (typeof READONLY_LAYOUT_KEYS)[number];

/**
 * @deprecated Prefer `EDITABLE_LAYOUT_KEYS` — now includes panel insets / sheet
 * pads / shell size, not only control-* gaps.
 */
export const EDITABLE_LAYOUT_CONTROL_KEYS = EDITABLE_LAYOUT_KEYS;
/** @deprecated Prefer `EditableLayoutKey`. */
export type EditableLayoutControlKey = EditableLayoutKey;

export const EDITABLE_LAYOUT_BY_SECTION: Record<
  Exclude<LayoutChromeSectionId, "sandbox" | "navDrawer">,
  ReadonlyArray<EditableLayoutKey>
> = {
  rhythm: [
    "unit-stack-gap",
    "control-stack-gap",
    "control-row-column-gap",
    "control-row-gap",
    "control-cluster-gap",
    "chrome-icon-gap",
    "control-row-label",
  ],
  panelInsets: [
    "content-inset",
    "content-pad-block",
    "nest-gap",
    "dialog-inset",
    "strip-pad-inline",
    "capsule-chrome-pad-inline",
    "field-pad-inline",
    "field-pad-block",
    "textarea-max-height",
  ],
  sheetPads: ["sheet-pad-inline", "sheet-pad-block"],
  shellSize: [
    "drawer-width",
    "end-aside-width",
    "dialog-max-width-sm",
    "dialog-max-width-md",
    "dialog-max-width-lg",
    "bar-height",
    "chat-max-width",
    "chat-min-width",
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
      .filter(([k]) =>
        ["xs", "sm", "md", "lg", "title-large", "xl", "2xl"].includes(k),
      )
      .map(([k, v]) => [fynnsVarName("font-size", k), v]),
  ),
  ...Object.fromEntries(
    EDITABLE_LAYOUT_KEYS.map((k) => [fynnsVarName("layout", k), LAYOUT_TOKENS[k]]),
  ),
  ...Object.fromEntries(
    EDITABLE_NAVDRAWER_KEYS.map((k) => [
      fynnsVarName("navdrawer", k),
      NAVDRAWER_TOKENS[k],
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
 * Sandbox-only starting overrides on top of production `BASELINE`.
 *
 * **WYSIWYG hard rule:** keep this map **empty**. Anything you nod at in the
 * sandbox must live in `src/theme/tokens.ts` (then `npm run gen:theme`) so
 * consumers see the same resting look. A non-empty entry here is how Select
 * used to look 20px in sandbox while shipped `--fynns-radius-md` stayed 8px.
 * Fresh draft / full Reset / shape-ladder Reset still merge this object — it
 * must not diverge from shipped tokens.
 */
export const SANDBOX_DEFAULT_OVERRIDES: Record<string, string> = {};

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
  "unit-stack-gap":
    "Unit stack · between siblings / demos; also control→hint via field-hint-gap alias",
  "control-stack-gap": "Toolbar rhythm · between ControlRows",
  "control-row-gap": "Toolbar rhythm · stacked label above controls",
  "control-row-column-gap": "Toolbar rhythm · horizontal label | controls",
  "control-cluster-gap": "Toolbar rhythm · siblings in one controls cluster",
  "chrome-icon-gap":
    "Chrome icons · TopAppBar actions + NavigationRail destination gap (shared)",
  "control-row-label": "Toolbar structure · ControlRow fixed label column",
  "content-inset":
    "Panel inset · Card / Collapsible / Drawer equal **inline** pad",
  "content-pad-block":
    "Panel inset · Collapsible / Card chrome=card body / Surface padded / CodeBlock **block** (16dp)",
  "nest-gap":
    "Nest frames · chrome=plain body pad+gap / .fynns-nest (surface well nesting; ≠ flush)",
  "dialog-inset":
    "Panel inset · Dialog / ConfirmDialog / Chat column (thread+composer outer)",
  "strip-pad-inline":
    "Long-strip · Banner / InlineAlert / Snackbar / ChatComposer collapsed text + expanded text edge",
  "capsule-chrome-pad-inline":
    "Capsule chrome · SearchBar / ChatComposer collapsed shell (Send/mic flush, ~4dp)",
  "field-pad-inline":
    "Form field · Input / field-shell horizontal pad (12dp — not capsule 4dp)",
  "field-pad-block":
    "Form field · Textarea vertical pad (12dp — not Input sm zero block)",
  "textarea-max-height":
    "Form field · Textarea autoGrow soft cap before inner scroll (13rem)",
  "sheet-pad-inline": "Sheet pad · BottomSheet horizontal (M3 ≠ content-inset)",
  "sheet-pad-block": "Sheet pad · BottomSheet vertical (M3 ≠ content-inset)",
  "drawer-width": "Shell size · content Drawer width",
  "end-aside-width": "Shell size · EndAside open width",
  "dialog-max-width-sm": "Shell size · Dialog size=sm max width",
  "dialog-max-width-md": "Shell size · Dialog size=md max width",
  "dialog-max-width-lg": "Shell size · Dialog size=lg max width",
  "bar-height":
    "Shell size · product chrome bar (TopAppBar sm / BottomAppBar / SearchBar / Toolbar)",
  "chat-max-width":
    "Shell size · Chat main column ceiling (sync chatmessage-max-width)",
  "chat-min-width":
    "Shell size · Chat soft floor (apply as min(token, 100%))",
};

const NAVDRAWER_KEY_ROLES: Record<EditableNavdrawerKey, string> = {
  width: "NavigationDrawer preferred width (absolute rem)",
  "min-width": "ClippedNavShell drawer resize floor (absolute rem — no %)",
  "max-width": "ClippedNavShell drawer resize cap (absolute rem — no %)",
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
    role: "Sandbox TopAppBar height override (not product --fynns-layout-bar-height)",
    section: "sandbox",
    applyWrites: false,
  },
  ...EDITABLE_LAYOUT_KEYS.map((k) => {
    const section = (
      Object.entries(EDITABLE_LAYOUT_BY_SECTION) as Array<
        [Exclude<LayoutChromeSectionId, "sandbox" | "navDrawer">, ReadonlyArray<EditableLayoutKey>]
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
  ...EDITABLE_NAVDRAWER_KEYS.map((k) => ({
    cssVar: fynnsVarName("navdrawer", k),
    role: NAVDRAWER_KEY_ROLES[k],
    section: "navDrawer" as const,
    applyWrites: true,
  })),
];
