/**
 * Single source of truth for the fynns design tokens.
 *
 * These typed tables are mirrored to `:root` CSS custom properties (the
 * canonical `--fynns-*` namespace) by `scripts/gen-theme.mjs`, which writes the
 * committed `./theme.css`. Consumers reference `var(--fynns-color-accent)` etc.
 * in CSS, or import these tables directly in TS.
 *
 * Rules:
 *   - This file (plus `./motionTokens`) is the ONLY place raw color/spacing/
 *     font literals appear. Never hardcode them in component CSS or TSX.
 *   - Names are categorized: `--fynns-<group>-<key>` (e.g. `--fynns-color-accent`,
 *     `--fynns-space-2`, `--fynns-radius-md`). The `misc` group has no sub-prefix.
 *   - Domain/teaching tokens (automata canvas, DSA bars/pointers) do NOT live
 *     here; they stay in their app under `--afs-*` / `--dsa-*`.
 */
import { DURATION_TOKENS, EASING_TOKENS } from "./motionTokens";

/** Surfaces, text, accents, and semantic role colors. `--fynns-color-<key>`. */
export const COLOR_TOKENS = {
  /** Base canvas. oklch(9% 0.02 192) */
  "app-bg": "#031417",
  /** Legacy alias for app-bg; kept for backward compatibility. */
  surface: "#031417",
  /** Legacy panel header; kept for backward compatibility. */
  "surface-head": "#021012",
  /** Elevation 1 — panels, cards, dialogs. oklch(11% 0.025 192) */
  "surface-1": "#051a1d",
  /** Elevation 2 — menus, selects, popovers. oklch(14% 0.03 192) */
  "surface-2": "#082225",
  /** Elevation 3 — tooltips, toasts. oklch(17% 0.035 192) */
  "surface-3": "#0a2a2e",
  /** Elevation 4 — dragged cards, reserved emphasis. oklch(20% 0.038 192) */
  "surface-4": "#0c3237",
  /** Elevation 5 — reserved hover emphasis. oklch(23% 0.04 192) */
  "surface-5": "#0e3a40",
  "surface-muted": "rgba(255, 255, 255, 0.03)",
  "surface-hover": "rgba(255, 255, 255, 0.08)",
  border: "#0d2e2c",
  /** Higher-contrast border for emphasis. oklch(22% 0.04 192) */
  "border-strong": "#164038",
  text: "#e2f0ed",
  "text-muted": "#7a9e98",
  accent: "#2dd4bf",
  "accent-dim": "#14b8a6",
  /** Primary hover state. oklch(78% 0.12 192) */
  "accent-hover": "#34dfc9",
  /** Primary pressed state. oklch(72% 0.11 192) */
  "accent-active": "#26c9b3",
  "accent-soft": "rgba(45, 212, 191, 0.18)",
  "accent-mid": "rgba(45, 212, 191, 0.5)",
  "accent-24": "rgba(45, 212, 191, 0.24)",
  "accent-42": "rgba(45, 212, 191, 0.42)",
  /** Soft mark for small controls (checkbox/radio/switch/nav indicators). */
  "accent-ring": "rgba(45, 212, 191, 0.18)",
  /** Content on solid accent (M3 onPrimary; e.g. primary Button label). */
  "on-accent": "#031417",
  /** Selected / tonal container fill (M3 primaryContainer analogue). */
  "accent-container": "rgba(45, 212, 191, 0.2)",
  /** Text/icons on accent-container. */
  "on-accent-container": "#7ee8d8",
  /**
   * M3 secondaryContainer — solid tonal fill for NavigationRail / NavigationBar
   * active indicators (not a translucent overlay).
   */
  "secondary-container": "#1a4542",
  /** Content on secondary-container (M3 onSecondaryContainer). */
  "on-secondary-container": "#9eeae0",
  /**
   * M3 tertiaryContainer — cooler blue tonal for FAB / accent hierarchy
   * (distinct from teal primary / secondary).
   */
  "tertiary-container": "#1a2f4a",
  /** Content on tertiary-container (M3 onTertiaryContainer). */
  "on-tertiary-container": "#a8c7fa",
  /** Quieter divider than border / border-strong. */
  "outline-subtle": "#0a2524",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  "danger-border": "rgba(248, 113, 113, 0.5)",
  info: "#60a5fa",
  /** Keyboard ring fill — keep faint (fields use quiet border-mix instead). */
  focus: "rgba(45, 212, 191, 0.22)",
  overlay: "rgba(0, 0, 0, 0.48)",
  /** Legacy toast surface; kept for backward compatibility. */
  "toast-surface": "#062126",
  "control-surface": "rgba(255, 255, 255, 0.02)",
  "control-surface-hover": "rgba(255, 255, 255, 0.05)",
  /** Dense text/number fields (forms, counters). */
  "input-fill": "rgba(0, 0, 0, 0.28)",
  "flyout-item": "rgba(255, 255, 255, 0.03)",
  "flyout-item-hover": "rgba(255, 255, 255, 0.08)",
  "toggle-track": "rgba(255, 255, 255, 0.06)",
  "toggle-track-hover": "rgba(255, 255, 255, 0.1)",
  /**
   * Quiet lift for Chat user bubbles (ChatGPT message-surface role; teal tint).
   * Not accent / secondary-container — those read as selected chips.
   */
  "chat-user-bubble": "#0c3237",
  /**
   * Inline `code` pill fill in ChatMessage body (assistant / system on the
   * bare thread). Same text wash as user-bubble code — **not** ChatGPT
   * gray-700 `#424242` (reads muddy/warm on teal `app-bg`). Mix % lives on
   * `--fynns-chatmessage-code-user-bg-mix` (light overrides that mix).
   */
  "chat-inline-code-bg":
    "color-mix(in srgb, var(--fynns-color-text) var(--fynns-chatmessage-code-user-bg-mix), transparent)",
} as const;

/**
 * Spacing scale (rem). `--fynns-space-<key>`.
 * Prefer the t-shirt keys (`xs`, `sm`, `md`, …) for new work; numeric keys are
 * legacy aliases kept for backward compatibility.
 */
export const SPACE_TOKENS = {
  /** T-shirt scale (preferred). */
  "2xs": "0.125rem",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  /** Legacy numeric keys — do not remove. */
  "1": "0.25rem",
  "15": "0.35rem",
  "2": "0.4rem",
  "25": "0.45rem",
  "3": "0.65rem",
  "35": "0.55rem",
  "4": "1rem",
  "5": "0.5rem",
  "55": "0.6rem",
  "6": "0.7rem",
  "65": "0.75rem",
  "7": "0.85rem",
  "78": "0.78rem",
  "8": "0.8rem",
  "84": "0.84rem",
  "9": "0.9rem",
  "10": "0.15rem",
  "11": "0.48rem",
  "12": "0.6rem",
  "13": "0.7rem",
  "14": "0.92rem",
  "17": "2.35rem",
  "18": "2.25rem",
  "min-line": "1.2rem",
} as const;

/** Fixed pixel sizes. `--fynns-size-<key>`. */
export const SIZE_TOKENS = {
  "1": "1px",
  "2": "2px",
  "6": "6px",
  "8": "8px",
  "10": "10px",
  "12": "12px",
  "13": "13px",
  "14": "14px",
  "16": "16px",
  /**
   * Standard UI / chrome glyph (IconButton, nav destinations, Banner, …).
   * 16dp — denser than stock M3 IconButton 24dp.
   */
  icon: "1rem",
  /** Optional larger glyph (20dp) when a control needs more presence. */
  "icon-md": "1.25rem",
  /** IconButton / touch target (40dp). */
  "icon-target": "2.5rem",
  "20": "20px",
  "22": "22px",
  "24": "24px",
  "34": "34px",
  "152": "152px",
  "240": "240px",
  "360": "360px",
} as const;

/**
 * Corner radii. `--fynns-radius-<key>`.
 * T-shirt keys roughly track the M3 shape scale (see `llm/m3-draft-tokens.md`);
 * numeric values remain fynns overrides, not a 1:1 M3 copy.
 *
 * Hard rule: every key here MUST appear in the sandbox Globals shape inspector
 * (`GlobalsInspector` EDITABLE_RADIUS or READONLY_RADIUS). Do not add radius
 * tokens under other groups (`--fynns-<component>-*-radius`).
 */
export const RADIUS_TOKENS = {
  none: "0",
  /** Finer than xs — checkbox box (M3 ≈ 2dp). */
  "2xs": "2px",
  /** M3 extra-small ≈ 4dp */
  xs: "4px",
  sm: "6px",
  /**
   * Default control / card corner (Input, Select, Autocomplete, field shells,
   * Card / Collapsible / Surface). Role name — not a sorted step between `sm`
   * and `lg`. Value (20px) matches long-standing sandbox resting; `lg`/`xl`
   * stay smaller for Fab / Drawer / menu chrome.
   */
  md: "20px",
  /** Dense chrome (e.g. Fab `sm`) — smaller than form `md` by role, not rank. */
  lg: "10px",
  /** Fab default / Drawer / menu panels — between `lg` and Chat `22`. */
  xl: "16px",
  /**
   * ChatGPT user-message bubble (`rounded-[22px]`). Between form `md` and
   * long-strip `3xl` — not a long-strip chrome radius.
   */
  "22": "22px",
  /**
   * Long chrome strips ≈ 28dp: SearchBar, Banner, BottomAppBar,
   * NavigationDrawer items, BottomSheet top corners. (No `2xl` step — unused.)
   */
  "3xl": "28px",
  pill: "999px",
  round: "50%",
} as const;

/** Elevation shadows. `--fynns-shadow-<key>`. */
export const SHADOW_TOKENS = {
  none: "none",
  /** Elevation 1 resting (elevated card). */
  xs: "0 1px 2px rgba(0, 0, 0, 0.22)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.25)",
  md: "0 4px 12px rgba(0, 0, 0, 0.35)",
  lg: "0 16px 48px rgba(0, 0, 0, 0.45)",
  xl: "0 24px 64px rgba(0, 0, 0, 0.5)",
  flyout: "0 8px 24px rgba(0, 0, 0, 0.35)",
  tooltip: "0 6px 20px rgba(0, 0, 0, 0.45)",
  "toggle-thumb": "0 1px 2px rgba(0, 0, 0, 0.35)",
  "glow-accent": "0 0 12px rgba(45, 212, 191, 0.35)",
  "glow-danger": "0 0 12px rgba(248, 113, 113, 0.35)",
} as const;

/**
 * State-layer opacities for interactive overlays.
 * Consumed via `color-mix(in srgb, var(--fynns-color-*) var(--fynns-state-hover), transparent)`.
 * `--fynns-state-<key>`.
 */
export const STATE_LAYER_TOKENS = {
  hover: "8%",
  focus: "10%",
  pressed: "12%",
  dragged: "16%",
} as const;

/**
 * M3-informed elevation ladder (tonal surface + optional shadow).
 * Lookup table for components — not emitted as CSS custom properties.
 */
export const ELEVATION_TOKENS = {
  0: { surfaceVar: "--fynns-color-app-bg", shadowVar: "--fynns-shadow-none" },
  1: { surfaceVar: "--fynns-color-surface-1", shadowVar: "--fynns-shadow-xs" },
  2: { surfaceVar: "--fynns-color-surface-2", shadowVar: "--fynns-shadow-sm" },
  3: { surfaceVar: "--fynns-color-surface-3", shadowVar: "--fynns-shadow-md" },
  4: { surfaceVar: "--fynns-color-surface-4", shadowVar: "--fynns-shadow-lg" },
  5: { surfaceVar: "--fynns-color-surface-5", shadowVar: "--fynns-shadow-xl" },
} as const;

export type ElevationLevel = keyof typeof ELEVATION_TOKENS;
export type StateLayerName = keyof typeof STATE_LAYER_TOKENS;

/**
 * Font stacks. `--fynns-font-<key>`.
 *
 * When to use (also AGENTS.md **Font families**):
 * - `ui` — default body + chrome (inherit from `body`; do not override to serif).
 * - `mono` — code / CodeBlock / `code`|`kbd`|`samp`|`pre` only.
 * - `serif` — rare academic/editorial prose (theorem text) when the user
 *   explicitly asks; never main UI body; not a KaTeX/math-font substitute.
 */
export const FONT_FAMILY_TOKENS = {
  ui: 'system-ui, "Segoe UI", Roboto, sans-serif',
  mono: 'Consolas, "Cascadia Code", "Fira Code", ui-monospace, monospace',
  serif: '"CMU Serif", "Latin Modern Roman", Cambria, "Times New Roman", serif',
} as const;

/**
 * Font sizes. `--fynns-font-size-<key>`.
 * Prefer the t-shirt keys for new work; semantic keys are legacy aliases.
 */
export const FONT_SIZE_TOKENS = {
  /** T-shirt scale (preferred). */
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  /** M3 title-large ≈ 22sp. */
  "title-large": "1.375rem",
  xl: "1.5rem",
  "2xl": "2rem",
  /** Legacy semantic keys — do not remove. */
  root: "1rem",
  "body-small": "0.875rem",
  "panel-heading": "0.82rem",
  caption: "0.75rem",
  "form-label": "0.85rem",
  "settings-section": "0.8rem",
  "dialog-close": "1.35rem",
} as const;

/** Font weights. `--fynns-font-weight-<key>`. */
export const FONT_WEIGHT_TOKENS = {
  /** M3 regular (title-large, body). */
  regular: "400",
  medium: "500",
  semibold: "600",
  title: "650",
  bold: "700",
} as const;

/** Line heights. `--fynns-line-height-<key>`. */
export const LINE_HEIGHT_TOKENS = {
  root: "1.4",
  tight: "1",
  snug: "1.25",
  /** M3 title-large line height ≈ 28sp / 22sp. */
  "title-large": "1.2727",
  body: "1.45",
  compact: "1.35",
} as const;

/** Letter spacing. `--fynns-letter-spacing-<key>`. */
export const LETTER_SPACING_TOKENS = {
  wide: "0.04em",
  subtle: "0.01em",
} as const;

/** Z-index layers. `--fynns-z-<key>`. */
export const Z_TOKENS = {
  /** Open menus / Select / Autocomplete / SearchBar results. */
  dropdown: "40",
  /**
   * Sticky chrome inside a scroll host (e.g. catalog SearchBar). Must sit
   * above page dropdowns so scrolled Select/Autocomplete cannot paint through
   * the sticky field (same `dropdown` layer + later DOM otherwise wins).
   */
  sticky: "45",
  popover: "50",
  modal: "60",
  toast: "70",
  tooltip: "8000",
} as const;

/**
 * Toggle/switch geometry (dense Switch only — former `sm` proportions).
 * Track ~39×24dp; handle morphs modestly. Outline 1.5px.
 * `track-pad-*` = padding-box inset (outer gap ≈ pad + outline).
 * The large M3 md ladder (52×32) was removed — do not reintroduce `*-sm`
 * dual keys or a Switch `size` prop.
 * `--fynns-toggle-<key>`.
 */
export const TOGGLE_TOKENS = {
  "track-w": "2.4375rem",
  "track-h": "1.5rem",
  /** Unselected handle. */
  thumb: "0.875rem",
  /** Selected handle. */
  "thumb-checked": "1.0625rem",
  /** Padding-box inset; pairs with `track-outline` for outer-edge symmetry. */
  "track-pad-inline": "0.21875rem",
  "track-pad-checked": "0.125rem",
  "track-outline": "1.5px",
} as const;

/**
 * Checkbox / radio geometry (M3 Selection controls at 16px rem).
 * Checkbox box 18dp; radio 20dp; state layer 40dp; outline 2dp.
 * `--fynns-selection-<key>`.
 */
export const SELECTION_TOKENS = {
  "box-size": "1.125rem",
  "box-outline": "2px",
  "radio-size": "1.25rem",
  "radio-dot": "0.625rem",
  "icon-size": "0.875rem",
  "state-layer": "2.5rem",
} as const;

/**
 * Chip geometry (M3 Assist / Filter / Input at 16px rem).
 * Height 32dp; leading icon 18dp; outline 1dp.
 * `--fynns-chip-<key>`.
 */
export const CHIP_TOKENS = {
  height: "2rem",
  "icon-size": "1.125rem",
  /** M3 trailing-action ripple: 4/3 × 18dp icon = 24dp. */
  "trailing-action-size": "1.5rem",
  "pad-inline": "0.75rem",
  "pad-inline-icon": "0.5rem",
  gap: "0.5rem",
  outline: "1px",
} as const;

/**
 * M3 Segmented button (ToggleGroup) geometry at 16px rem.
 * Container ~40dp; check icon 18dp; stadium outer outline.
 * `--fynns-segmented-<key>`.
 */
export const SEGMENTED_TOKENS = {
  height: "2.5rem",
  "height-compact": "2rem",
  "icon-size": "1.125rem",
  "pad-inline": "0.75rem",
  "pad-inline-compact": "0.5rem",
  gap: "0.5rem",
  outline: "1px",
} as const;

/**
 * Progress indicator geometry (linear / circular at 16px rem).
 * Track + active indicator 4dp; circular default 48dp; active↔track gap 4dp.
 * `--fynns-progress-<key>`.
 */
export const PROGRESS_TOKENS = {
  "track-thickness": "0.25rem",
  gap: "0.25rem",
  "circular-size": "3rem",
  "circular-size-sm": "2.25rem",
  "circular-size-lg": "4rem",
} as const;

/**
 * Avatar geometry (M3 list leading avatar at 16px rem).
 * Default 40dp; sm 32dp; lg 56dp.
 * `--fynns-avatar-<key>`.
 */
export const AVATAR_TOKENS = {
  size: "2.5rem",
  "size-sm": "2rem",
  "size-lg": "3.5rem",
  "font-size": "1rem",
  "font-size-sm": "0.75rem",
  "font-size-lg": "1.25rem",
} as const;

/**
 * FAB geometry (M3 Floating Action Button at 16px rem).
 * Default 56dp; small 40dp; large 96dp; extended height matches default.
 * `--fynns-fab-<key>`.
 */
export const FAB_TOKENS = {
  size: "3.5rem",
  "size-sm": "2.5rem",
  "size-lg": "6rem",
  "icon-size": "1.5rem",
  /** Matches `--fynns-size-icon-md` (20dp). */
  "icon-size-sm": "1.25rem",
  "icon-size-lg": "2.25rem",
  "pad-inline-extended": "1.25rem",
  gap: "0.75rem",
} as const;

/**
 * FAB menu geometry (M3 Expressive FAB menu — items stack above the toggle).
 * `--fynns-fabmenu-<key>`.
 */
export const FABMENU_TOKENS = {
  /** Vertical gap between menu items, and between the stack and the toggle. */
  gap: "0.75rem",
  /** Horizontal gap between the item label chip and its small FAB. */
  "item-gap": "0.75rem",
  "label-pad-block": "0.5rem",
  "label-pad-inline": "0.75rem",
  /** Stagger step between successive item enter animations (M3 ~35ms). */
  stagger: "0.035s",
  /** Slightly snappier stagger on exit (M3 ~25ms). */
  "stagger-exit": "0.025s",
} as const;

/**
 * Top app bar geometry (M3-informed, denser for desktop/tool chrome).
 * Small uses shared `--fynns-layout-bar-height` (56dp); medium 80dp; large 104dp.
 * Action row matches small height so 40dp IconButtons sit inset, not edge-flush.
 * `--fynns-appbar-<key>`.
 */
export const APPBAR_TOKENS = {
  height: "var(--fynns-layout-bar-height)",
  "height-md": "5rem",
  "height-lg": "6.5rem",
  "row-height": "var(--fynns-layout-bar-height)",
  /** Inline inset for the action row (leading / trailing icons). */
  "pad-inline": "0.5rem",
  /**
   * Gap between adjacent action IconButtons — aliases shared chrome icon
   * rhythm (`--fynns-layout-chrome-icon-gap`) so TopAppBar matches
   * NavigationRail destinations (icon-only).
   */
  "actions-gap": "var(--fynns-layout-chrome-icon-gap)",
  /**
   * Shared dense hover disc (DatePicker nav etc.). TopAppBar actions use the
   * standard 40dp IconButton target instead.
   */
  "action-hover-size": "2.25rem",
  /** Title inset under the action row (medium / large only). */
  "title-pad-inline": "0.75rem",
  "title-pad-bottom-md": "0.75rem",
  "title-pad-bottom-lg": "1rem",
  /** sm inline title; md/lg stacked headlines (below M3 title-large / headline). */
  "title-size": "0.9375rem",
  "title-size-md": "1.125rem",
  "title-size-lg": "1.375rem",
  "title-line": "1.333",
  "title-line-md": "1.3",
  "title-line-lg": "1.25",
} as const;

/**
 * Bottom app bar geometry (at 16px rem).
 * Height shares `--fynns-layout-bar-height` (56dp) with TopAppBar sm / SearchBar
 * (below stock M3 80dp). Actions / FAB share a 40dp control size inside the bar
 * (M3: FAB inside, no cradle).
 * `--fynns-bottomappbar-<key>`.
 */
export const BOTTOM_APPBAR_TOKENS = {
  height: "var(--fynns-layout-bar-height)",
  "pad-inline": "0.5rem",
  "pad-block": "0.25rem",
  "actions-gap": "0.125rem",
  /** IconButton / Fab sm hit target inside the bar. */
  "action-size": "2.5rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "action-icon-size": "1rem",
  "fab-pad-inline-end": "0.25rem",
} as const;

/**
 * Toolbar geometry (M3 Expressive docked / floating at 16px rem).
 * Height shares `--fynns-layout-bar-height` (56dp; stock floating is 64dp).
 * Docked uses long-strip `--fynns-radius-3xl`; floating uses `--fynns-radius-pill`.
 * Distinct from ControlStack “toolbar rhythm” (label | control form rows).
 * `--fynns-toolbar-<key>`.
 */
export const TOOLBAR_TOKENS = {
  height: "var(--fynns-layout-bar-height)",
  "pad-inline": "0.5rem",
  "pad-block": "0.25rem",
  "actions-gap": "0.125rem",
  /** IconButton / Fab sm hit target inside the bar. */
  "action-size": "2.5rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "action-icon-size": "1rem",
  /** Gap between floating toolbar capsule and optional adjacent FAB. */
  "fab-gap": "0.75rem",
} as const;

/**
 * Search bar geometry (M3 SearchBar at 16px rem).
 * Collapsed capsule height shares `--fynns-layout-bar-height` (56dp); expanded
 * merges field + results into one shell.
 * Corner radius uses `--fynns-radius-3xl` (not a private searchbar token).
 * Prefer `Input` for dense form rows (SearchInput removed).
 * `--fynns-searchbar-<key>`.
 */
export const SEARCHBAR_TOKENS = {
  height: "var(--fynns-layout-bar-height)",
  /**
   * Capsule edge chrome next to icons — layout `capsule-chrome-pad-inline`.
   * Dense form `Input` / `.fynns-field-shell` use layout `field-pad-inline`
   * (`space-md`) — do not share this key with form fields.
   */
  "pad-inline": "var(--fynns-layout-capsule-chrome-pad-inline)",
  "icon-slot": "3rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "icon-size": "1rem",
  "input-pad-inline": "var(--fynns-layout-capsule-chrome-pad-inline)",
  "font-size": "1rem",
  "line-height": "1.5",
  "results-max-height": "20rem",
  /**
   * Inset around suggestion rows: shell and result row highlights both use
   * `--fynns-radius-3xl` (same long-strip chrome as NavigationDrawer items);
   * pad keeps hover off the outer capsule edge.
   */
  "results-pad-block-start": "0.5rem",
  "results-pad-block-end": "0.75rem",
  "results-pad-inline": "0.5rem",
  "results-gap": "0.125rem",
} as const;

/**
 * Banner geometry (M3 Banner at 16px rem).
 * Full-width strip under TopAppBar: message + actions + optional dismiss.
 * Also used by in-panel `InlineAlert` for pad / gap / icon-size (same strip
 * rhythm — do not invent a parallel pad set).
 * `--fynns-banner-<key>`.
 */
export const BANNER_TOKENS = {
  "min-height": "3.25rem",
  /**
   * Horizontal content pad — aliases layout strip pad (do not hardcode rem).
   * Same token as InlineAlert / Snackbar long-strip text chrome.
   */
  "pad-inline": "var(--fynns-layout-strip-pad-inline)",
  "pad-block": "0.75rem",
  gap: "0.75rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "icon-size": "1rem",
  "text-size": "0.875rem",
  "text-line": "1.25",
  "actions-gap": "0.5rem",
} as const;

/**
 * ChatMessage geometry (assistant / user / system rows — not M3 catalog).
 * Streaming cues use a caret blink (killed under `prefers-reduced-motion`;
 * ChatGPT’s optional `.pulse` caret scale does **not** — see AGENTS.md
 * Chat **Parity note (`prefers-reduced-motion`)**); no LLM / transport —
 * callers append `children` and toggle `streaming`. Failed generation uses
 * `error` + `onRetry` (ChatGPT-style footer under the assistant turn).
 * `--fynns-chatmessage-<key>`.
 */
export const CHATMESSAGE_TOKENS = {
  gap: "0.75rem",
  /** Row gap when `avatar` is passed — default ChatMessage omits avatar. */
  "avatar-gap": "0.75rem",
  /** ChatGPT user bubble `px-4` (16dp). */
  "bubble-pad-inline": "1rem",
  /** ChatGPT `py-2.5` (10dp). */
  "bubble-pad-block": "0.625rem",
  /**
   * User bubble ceiling for **main-column** chat — ChatGPT `max-w-[70%]`.
   * Percentage containing block is the **message-row host** (same element as
   * `max-width` below / ChatGPT `MessagePrimitive.Root` with `w-full
   * max-w-3xl`), **not** full main / viewport after the sidebar.
   * **Dual placement:** `EndAside` / `.fynns-chat-host--fill` keep the host at
   * 100% of aside content (CSS drops the rem ceiling) but **override** this
   * ceiling to `100%` so a long user turn shares the composer shell start+end
   * edges (narrow panes make 70% look short next to a full-width composer).
   * Short copy still shrinks (`width: fit-content`, `border-box`, flex-end).
   * Soft mins live on the pane (`LAYOUT_TOKENS` `end-aside-min-width` /
   * `NAVDRAWER_TOKENS` `min-width`), not here. Screenshot figs of ~66–68%
   * usually divide bubble by an *outer* padded shell (70% of content ≈ 65–68%
   * of shell with ~1.5rem gutters) — still this lock on main.
   * **Unchanged under 640px** on main (no responsive widen). See
   * `scripts/_focus-verify/chatgpt-bubble-containing-block.html`,
   * `chatgpt-bubble-width.html`, and `chatgpt-narrow-layout.html`.
   * Corner radius: `--fynns-radius-22` (ChatGPT `rounded-[22px]`; composer
   * shell stays `--fynns-radius-3xl`). Fill: `--fynns-color-chat-user-bubble`.
   */
  "bubble-max-width": "70%",
  /**
   * Chat row host ceiling for **main-column** placement (ChatGPT /
   * `max-w-3xl` = 48rem). This host is the % CB for `bubble-max-width`.
   * Aside placement ignores it (`max-width: 100%` of pane content).
   * Keep in sync with `--fynns-layout-chat-max-width`.
   */
  "max-width": "48rem",
  /** ChatGPT message body `text-base` / 16px. */
  "body-size": "1rem",
  "body-line": "1.5",
  /**
   * Gap between adjacent **direct** children of `.fynns-chat-message-body`
   * (16dp — aliases `--fynns-layout-unit-stack-gap`). Same constant as
   * `.fynns-unit-stack` / Card body siblings — CodeBlock + prose, two
   * surfaces, etc. Not CodeBlock-specific. Streaming caret is excluded.
   */
  "body-stack-gap": "var(--fynns-layout-unit-stack-gap)",
  "name-size": "0.75rem",
  "actions-gap": "0",
  /**
   * Copy / Regenerate / More cluster fade on message hover / focus-within
   * (and leave). Slower than chrome `fast` so the icons ease in without a snap.
   */
  "actions-reveal": "var(--fynns-duration-slow)",
  /**
   * Streaming incomplete cue — last glyph color pulse between on-surface text
   * and ChatThinking-shimmer mid (accent→muted mix; R05). No extra caret
   * glyph. Duration aliases thinking shimmer.
   */
  "stream-tail": "var(--fynns-duration-thinking-shimmer)",
  /** Gap between error copy and Regenerate (ChatGPT failed-turn footer). */
  "error-gap": "0.75rem",
  /**
   * Inline `code` in message body (ChatGPT `.prose code` — not `pre code`).
   * Radius: reuse `--fynns-radius-xs` (4px = ChatGPT `.25rem`).
   * Font: `--fynns-font-mono` (Consolas-first; ChatGPT uses system mono stack).
   * Fill: `--fynns-color-chat-inline-code-bg` (text wash via
   * `code-user-bg-mix` — not ChatGPT gray-700).
   * Weight: medium (ChatGPT `font-weight: 500`).
   */
  "code-pad-block": "0.15rem",
  "code-pad-inline": "0.3rem",
  /** Relative to bubble body size (ChatGPT `.875em`). */
  "code-size": "0.875em",
  /**
   * User-bubble inline code (ChatGPT `.user-message-inline-code`).
   * Pad = `--spacing` / half; wash = text at `code-user-bg-mix` (dark 15%;
   * light override via theme.css).
   */
  "code-user-pad-block": "0.125rem",
  "code-user-pad-inline": "0.25rem",
  "code-user-bg-mix": "15%",
  /** Gap between citation chips under an assistant turn. */
  "citation-gap": "0.375rem",
  /** Chip pad (ChatGPT publisher pill). */
  "citation-pad-inline": "0.5rem",
  "citation-pad-block": "0.25rem",
  /** Favicon / leading mark in a citation chip. */
  "citation-favicon": "0.875rem",
  /** Favicon ↔ publisher (also artifact icon ↔ filename). */
  "citation-chip-gap": "0.375rem",
  /** Expanded footnote card stack gap. */
  "citation-list-gap": "0.375rem",
  "citation-card-pad": "0.625rem",
  "citation-card-gap": "0.625rem",
  /**
   * Gap under `ChatThinking` (name ↔ thinking ↔ bubble). Label size reuses
   * `name-size` — no separate THINKING_* token group.
   */
  "thinking-gap": "0.375rem",
  /** Gap between optional icon / label / chevron in the thinking trigger row. */
  "thinking-trigger-gap": "0.375rem",
  /**
   * Thought body inset under the trigger (and ChatActivity steps under
   * the header). Aliases field-stack-gap so label ↔ body is not flush.
   */
  "thinking-body-pad-block": "var(--fynns-layout-field-stack-gap)",
  "thinking-body-pad-inline": "0",
  /**
   * `ChatActivity` Wave 2 chain chrome (collapsible header + status tree).
   * Separate from `thinking-*` — single-block vs multi-step rail.
   */
  "activity-gap": "0.375rem",
  "activity-trigger-gap": "0.375rem",
  /** Vertical gap between step rows. */
  "activity-step-gap": "0.5rem",
  /** Gap between step node and headline / description column. */
  "activity-node-gap": "0.5rem",
  /** Gap between step title and optional description. */
  "activity-desc-gap": "0.25rem",
  /** Gap between step title and artifact capsule. */
  "activity-artifact-gap": "0.5rem",
  /** Inline pad inside artifact capsule. */
  "activity-artifact-pad-inline": "0.375rem",
  "activity-artifact-pad-block": "0.125rem",
  /**
   * Step icon|headline band floor — form-cluster style `max(floor, content)`.
   * Sized for the artifact capsule (xs + snug + pad + hairline borders) so
   * rows without a chip still match chip rows; never a fixed `height`.
   * `ChatActivity` may raise `--fynns-chat-activity-step-row-height` to the
   * measured max across open steps (wrap / multi-line).
   */
  "activity-step-min-height":
    "max(var(--fynns-size-icon), calc((var(--fynns-font-size-xs) * var(--fynns-line-height-snug)) + (2 * var(--fynns-chatmessage-activity-artifact-pad-block)) + (2 * var(--fynns-border-hairline))))",
  /**
   * While `ChatActivity` is streaming, a step that arrives already `done`
   * (instant tool) still shows the active mark for at least this long
   * before the complete one-shot — one `presentation-hint` pulse.
   * `prefers-reduced-motion` skips the hold (JS reads this token).
   */
  "activity-step-min-busy": "var(--fynns-duration-presentation-hint)",
  /**
   * Newest-step copy fade (opacity only — step shells snap `0fr`/`1fr`,
   * no height morph). Aliases `--fynns-duration-activity` (slower than
   * chrome `slow`); not `presentation-hint` (that pulse is for min-busy).
   */
  "activity-enter": "var(--fynns-duration-activity)",
  /**
   * Hold → done (and active → done) glyph + artifact settle. Next step
   * stays queued until this finishes. Glyph fades (no scale / spring).
   * Same duration band as enter.
   */
  "activity-complete": "var(--fynns-duration-activity)",
} as const;

/**
 * Chat shell geometry (thread / composer / scroll-to-bottom).
 * Corner radius: reuse `--fynns-radius-3xl`. Column ceiling:
 * `--fynns-layout-chat-max-width` (same as chatmessage max-width).
 * Scroll-to-bottom uses instant `scrollTo` under `prefers-reduced-motion`
 * (ChatGPT gates smooth-scroll utilities the same way — AGENTS.md Chat
 * reduced-motion parity note).
 *
 * Composer multiline: model C + compact morph (Cursor) — full-width text
 * above a bottom toolbar when `data-expanded`; collapsed toolbar uses
 * `display: contents` so leading | field | Send stay one ~44dp row
 * (32dp control + 6dp pad — Cursor-dense circle; not SearchBar 56dp chrome).
 * Spec: `llm/CHAT_COMPOSER_LAYOUT.md`. `--fynns-chat-<key>`.
 */
export const CHAT_TOKENS = {
  /**
   * Vertical gap between turns. ChatGPT clones use `gap-8` (2rem); live
   * turn shells also use `pb-10` (2.5rem) — lock the denser clone gap.
   */
  "thread-gap": "2rem",
  /**
   * Thread + composer share this inline inset so user-bubble end edge and
   * composer shell end edge align (equal L/R on the chat column).
   * Aliases `dialog-inset` (24dp reading-column breath) — **not**
   * `strip-pad-inline` (20dp radius-3xl text-in-shell). Composer outer
   * inset must alias **this** key (`composer-inset-inline`), never a
   * second independent layout literal.
   */
  "thread-pad-inline": "var(--fynns-layout-dialog-inset)",
  "thread-pad-block": "var(--fynns-layout-content-pad-block)",
  /** Scroll/fade clearance above sticky composer (~28dp). */
  "composer-scroll-pad": "1.75rem",
  /**
   * Soft floor for the collapsed single-line body (32dp control row).
   * With `composer-pad-block` 6dp×2 + hairline → ~44dp shell — Cursor-dense
   * Send/Stop circle (one step below IconButton md 40dp), not SearchBar
   * `--fynns-layout-bar-height` 56dp chrome. Expanded shell grows with wrap;
   * controls move to the bottom toolbar (not mid-text center).
   */
  "composer-min-height": "2rem",
  /**
   * Soft cap before textarea inner scroll. ChatGPT’s ProseMirror parent
   * uses ~`max-h-52` (13rem) + `max(30svh,5rem)`; rem token for the
   * JS-resized textarea path.
   */
  "composer-max-height": "13rem",
  /**
   * Collapsed shell pad — equal inset around the control circle (~6dp).
   * Expanded uses `composer-expanded-pad-*` (strip-pad Cursor breath). When
   * collapsed with **no** leading, CSS adds start pad on the textarea so
   * text lands at `--fynns-layout-strip-pad-inline`.
   */
  "composer-pad-inline": "0.375rem",
  /** Collapsed block pad: 6dp×2 + 32dp control row + hairline → ~44dp shell. */
  "composer-pad-block": "0.375rem",
  /**
   * Expanded shell pad — strip breath minus glyph inset (~12dp with 32dp
   * controls) so toolbar IconButtons sit inset from the shell edge while
   * copy still lands at `strip-pad-inline` via textarea
   * `composer-glyph-inset` (optical align with + / Send **glyphs**, not
   * the 32dp hit boxes).
   */
  "composer-expanded-pad-inline": "calc(var(--fynns-layout-strip-pad-inline) - var(--fynns-chat-composer-glyph-inset))",
  "composer-expanded-pad-block": "calc(var(--fynns-layout-strip-pad-inline) - var(--fynns-chat-composer-glyph-inset))",
  /**
   * Half of (`composer-control-size` − `--fynns-size-icon`) — 8dp at 32dp
   * controls. Expanded textarea inline pad (optical glyph align); also used
   * in `composer-expanded-pad-*` so text edge = strip-pad from the shell.
   */
  "composer-glyph-inset": "calc((var(--fynns-chat-composer-control-size) - var(--fynns-size-icon)) / 2)",
  /** Collapsed control cluster gap (4px). */
  "composer-gap": "var(--fynns-space-xs)",
  /** Expanded gap between full-width text and bottom toolbar (~8dp). */
  "composer-expanded-gap": "var(--fynns-space-sm)",
  /**
   * Leading/trailing IconButton hit target inside the composer (32dp).
   * Scoped via CSS — does not change global IconButton. Matches
   * `composer-line-height` so controls and text share one midline.
   * One step below chrome `icon-target` 40dp (Cursor-dense circle).
   */
  "composer-control-size": "2rem",
  /**
   * Outer form inset — aliases `--fynns-chat-thread-pad-inline` (→
   * `dialog-inset`) so the composer shell and user-bubble end edges share
   * one vertical line. Do **not** point this at a different layout key.
   */
  "composer-inset-inline": "var(--fynns-chat-thread-pad-inline)",
  "composer-inset-block": "var(--fynns-space-md)",
  "composer-offset": "var(--fynns-space-sm)",
  /**
   * Collapsed control-row floor / min-height (32dp) — **not** multiline
   * typography. With pad-block → ~44dp shell (Cursor-dense capsule).
   */
  "composer-line-height": "2rem",
  /**
   * Expanded textarea typography line-height (22dp). Collapsed still uses
   * `composer-line-height` (32dp) to align the control row.
   */
  "composer-text-line-height": "1.375rem",
  /** Gap above the live composer box for scroll-to-bottom (ChatGPT ≈12dp). */
  "scroll-fab-inset": "var(--fynns-space-md)",
  /** Leave-bottom threshold before showing scroll FAB (ChatGPT sidebar IO ≈80dp). */
  "scroll-threshold": "5rem",
} as const;

/**
 * M3 content List / ListItem geometry (at 16px rem).
 * One-line 56dp; two-line 72dp; three-line 88dp. Selected row uses the same
 * `secondary-container` + `radius-3xl` long-strip highlight as
 * NavigationDrawerItem / Select / menu items. Sidebar destinations still use
 * Navigation* chrome (not deleted ListRow / ListGroup).
 * `--fynns-list-<key>`.
 */
export const LIST_TOKENS = {
  "height-1": "3.5rem",
  "height-2": "4.5rem",
  "height-3": "5.5rem",
  "pad-inline": "1rem",
  "pad-block": "0.5rem",
  /**
   * Outer inset on `.fynns-list` so `radius-3xl` row highlights breathe
   * (matches `--fynns-navdrawer-pad-inline`).
   */
  "inset-inline": "0.5rem",
  "inset-block": "0.5rem",
  gap: "1rem",
  /**
   * Leading / trailing glyph — one step above chrome `--fynns-size-icon`
   * (20dp / `--fynns-size-icon-md`) so list icons read against Avatar `md`.
   */
  "icon-size": "1.25rem",
  /**
   * Fixed leading column (matches `--fynns-avatar-size` / 40dp) so icon and
   * avatar rows share one vertical grid; glyphs center inside the slot.
   */
  "leading-width": "2.5rem",
} as const;

/**
 * M3 DatePicker / DateRangePicker calendar geometry (at 16px rem).
 * Day cells 40dp; 7-column week grid. Range uses secondary-container fill
 * between accent endpoints (no private range color tokens).
 * `--fynns-datepicker-<key>`.
 */
export const DATEPICKER_TOKENS = {
  "day-size": "2.5rem",
  "pad-inline": "0.75rem",
  "pad-block": "0.75rem",
  "header-min-height": "3rem",
  "weekday-font": "0.75rem",
  /** Keeps adjacent today/selected discs from touching (4dp). */
  gap: "0.25rem",
} as const;

/**
 * M3 TimePicker input geometry (at 16px rem).
 * Large hour/minute fields + colon; optional AM/PM column for `h12`.
 * `--fynns-timepicker-<key>`. Dial / clock face is permanently out of scope.
 */
export const TIMEPICKER_TOKENS = {
  "pad-inline": "0.75rem",
  "pad-block": "0.75rem",
  /** Hour / minute field (≈96×80dp denser). */
  "field-min-width": "5.5rem",
  "field-min-height": "4.5rem",
  "field-font": "2.75rem",
  "colon-pad-inline": "0.25rem",
  /** Decorative colon dots (avoids font glyph bias). */
  "colon-dot": "0.375rem",
  "colon-gap": "0.75rem",
  /** AM/PM stacked period control. */
  "period-min-width": "3.25rem",
  "period-font": "0.875rem",
  gap: "0.75rem",
} as const;

/**
 * Breadcrumb trail geometry (at 16px rem).
 * Hierarchical path chrome (not an M3 catalog component).
 * `--fynns-breadcrumb-<key>`.
 */
export const BREADCRUMB_TOKENS = {
  gap: "0.125rem",
  "sep-pad-inline": "0.25rem",
  /** Match `Button` `sm` label (`--fynns-font-size-xs`). */
  "font-size": "var(--fynns-font-size-xs)",
} as const;

/**
 * Pagination trail geometry (at 16px rem).
 * List/table page navigator chrome (not an M3 catalog component).
 * `--fynns-pagination-<key>`.
 */
export const PAGINATION_TOKENS = {
  gap: "0.125rem",
} as const;

/**
 * M3 Carousel geometry (at 16px rem).
 * Horizontal snap strip; hero = full-bleed slide, multi = peek neighbors.
 * `--fynns-carousel-<key>`.
 */
export const CAROUSEL_TOKENS = {
  gap: "0.5rem",
  "item-min-height": "11rem",
  /** Multi-browse slide width (peek neighbors). */
  "item-width-multi": "72%",
  "indicator-size": "0.5rem",
  "indicator-gap": "0.5rem",
  "controls-gap": "0.5rem",
  "pad-block": "0.25rem",
} as const;

/**
 * Navigation rail geometry (at 16px rem).
 * Container 80dp; destination highlight wraps icon (+ label when shown).
 * Icon-only / unlabeled hover = TopAppBar IconButton target (40dp).
 * Labeled (icon + caption stacked) keeps a larger inset square — never
 * crush into 40dp or it clips the label (sandbox / DestinationAppShell
 * densify defaults to `labelVisibility="labeled"`).
 * `--fynns-navrail-<key>`.
 */
export const NAVRAIL_TOKENS = {
  width: "5rem",
  /**
   * Icon-only destination highlight — same 40dp chrome target as TopAppBar
   * IconButton (`--fynns-size-icon-target`).
   */
  "indicator-width": "var(--fynns-size-icon-target)",
  "indicator-height-icon": "var(--fynns-size-icon-target)",
  /** Labeled destination highlight — square inset from the 80dp rail edge. */
  "indicator-size-labeled": "4rem",
  /** Padding inside the labeled square (symmetric; keep content off the edge). */
  "indicator-pad-block": "0.5rem",
  "indicator-pad-inline": "0.5rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "icon-size": "1rem",
  /** Outer space around each destination button (keep tight — gap owns rhythm). */
  "item-pad-block": "0",
  /**
   * Space between destination buttons — aliases `--fynns-layout-chrome-icon-gap`
   * (same rhythm as TopAppBar trailing IconButtons).
   */
  "destinations-gap": "var(--fynns-layout-chrome-icon-gap)",
  /**
   * Inset before the first destination when a **menu** sits above with no
   * header (keeps hover/active indicators off the menu chrome). When a header
   * is present, `header-gap` alone matches `destinations-gap` — do not stack.
   */
  "destinations-pad-block-start": "0.5rem",
  "pad-block-start": "2.75rem",
  "menu-pad-block": "0.5rem",
  /** Menu control min touch target — same 40dp chrome icon target. */
  "menu-target": "var(--fynns-size-icon-target)",
  /** Space below header FAB — same as `destinations-gap` (item rhythm). */
  "header-gap": "var(--fynns-layout-chrome-icon-gap)",
  "header-pad-block": "0.25rem",
  "label-size": "0.75rem",
  "label-line": "1.25",
  "label-gap": "0.125rem",
  /** Small badge (dot) on destination icon. */
  "badge-dot": "0.375rem",
  /** Large badge min size (count / short text). */
  "badge-size": "0.875rem",
  "badge-font-size": "0.625rem",
  /**
   * Extra outward shift past the icon corner so badge centers (dot and
   * large) share one point and clear the glyph.
   */
  "badge-nudge": "0.125rem",
} as const;

/**
 * Navigation bar geometry (at 16px rem).
 * Horizontal bottom destinations (3–5); container 80dp.
 * Labeled square matches NavigationRail; icon-only matches IconButton 40dp.
 * `--fynns-navbar-<key>`.
 */
export const NAVBAR_TOKENS = {
  height: "5rem",
  "pad-inline": "0.5rem",
  /** Labeled — same 64dp inset square as NavigationRail (icon + caption). */
  "indicator-size-labeled": "4rem",
  /** Icon-only — TopAppBar / IconButton 40dp target. */
  "indicator-height-icon": "var(--fynns-size-icon-target)",
  "indicator-pad-block": "0.5rem",
  "indicator-pad-inline": "0.5rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "icon-size": "1rem",
  "label-size": "0.75rem",
  "label-line": "1.25",
  "label-gap": "0.125rem",
  "badge-dot": "0.375rem",
  "badge-size": "0.875rem",
  "badge-font-size": "0.625rem",
  "badge-nudge": "0.125rem",
} as const;

/**
 * Navigation drawer geometry (at 16px rem).
 * Dense destination sheet — 280dp wide; 40dp rows (stock M3 is 360 / 56).
 * Label / icon sizes stay on the shared chrome glyph scale.
 * `--fynns-navdrawer-<key>`.
 */
export const NAVDRAWER_TOKENS = {
  width: "17.5rem",
  /**
   * Floor when the ClippedNavShell drawer column is resized (or flex-shrunk).
   * Absolute rem only — do **not** use `%` here: on `.fynns-nav-drawer` the
   * percentage resolves against the grid track (≈ current width), which collapses
   * `clamp(…, N%, …)` to the preferred width and makes the seam undraggable.
   * Labels ellipsize below preferred `width`.
   */
  "min-width": "12rem",
  /**
   * Cap for manual drawer resize in ClippedNavShell (pairs with `width`).
   * Absolute rem only (see `min-width`). Drag also respects remaining room for
   * main / EndAside mins.
   */
  "max-width": "28rem",
  "pad-block": "0.5rem",
  /**
   * Extra inset between headline / chrome hairline and the first destination
   * row (same role as navrail destinations-pad-block-start).
   */
  "body-pad-block-start": "0.75rem",
  /**
   * Outer inset to destination pills (10dp). Do **not** stack scrollbar-size /
   * both-edges on top — that inflated to ~18–30dp and looked oversized; do
   * **not** crush below ~8dp either (reads as flush / zeroed). Overlay thumbs
   * do not steal item width — this pad is optical edge breath only.
   */
  "pad-inline": "0.625rem",
  "item-height": "2.5rem",
  "item-pad-inline-start": "1rem",
  "item-pad-inline-end": "1rem",
  "item-gap": "0.5rem",
  /** Matches `--fynns-size-icon` (16dp). */
  "icon-size": "1rem",
  "label-size": "0.875rem",
  "label-line": "1.25",
  "headline-size": "0.875rem",
  "headline-line": "1.25",
  "headline-pad-block": "0.5rem",
  /** Section / sheet title inset past body pad (aligns with item icon column). */
  "headline-pad-inline": "1rem",
  /**
   * Vertical gap between consecutive body siblings (Item / Group / Headline /
   * Divider / destination-density SearchBar / tools wrappers) in
   * `.fynns-nav-drawer-body` **and** between leaf items inside
   * `.fynns-nav-drawer-group-body` (4dp). Never wrap destinations in
   * `.fynns-unit-stack` for spacing.
   */
  "section-gap": "0.25rem",
  "badge-dot": "0.375rem",
  /**
   * Nested destination pad inside `NavigationDrawerGroup` (Cursor-style one
   * level indent — ~icon column past top-level `item-pad-inline-start`).
   */
  "group-item-pad-inline-start": "2rem",
} as const;

/** Focus ring geometry + quiet field border tint. `--fynns-focus-<key>`. */
export const FOCUS_TOKENS = {
  "ring-width": "2px",
  "ring-offset-control": "2px",
  "ring-offset-input": "1px",
  /**
   * Accent % mixed into `--fynns-color-border` for Input / field-shell /
   * SearchBar / Collapsible / editable CodeBlock focus (not a full ring).
   */
  "border-mix": "12%",
} as const;

/** Generic layout sizes for modals / sheets / tooltips / chrome. `--fynns-layout-<key>`. */
export const LAYOUT_TOKENS = {
  "dialog-max-width": "32rem",
  /** Within M3 basic dialog max (560dp). Ceiling only — panel is content-fit. */
  "dialog-max-width-sm": "24rem",
  "dialog-max-width-md": "32rem",
  "dialog-max-width-lg": "35rem",
  /** Content side sheet (M3 ~400dp); not NavigationDrawer width. */
  "drawer-width": "25rem",
  /**
   * Equal **inline** inset for Collapsible / Drawer / Card (18dp).
   * Also: centered Dialog body **block** padding (top = bottom) — denser than
   * `dialog-inset` while staying symmetric. Between `space-lg` (16dp) and
   * Dialog `dialog-inset` (24dp). Do not force BottomSheet / Snackbar /
   * ListItem / Chat column onto this. Section body **block** pad uses
   * `content-pad-block`. Long-strip / `radius-3xl` **text** chrome (Banner,
   * Snackbar, composer label start) uses `strip-pad-inline` — not this key
   * alone. Chat **conversation column** (thread + composer outer) uses
   * `dialog-inset` via `--fynns-chat-thread-pad-inline`.
   */
  "content-inset": "1.125rem",
  /**
   * Horizontal content pad for **long-strip** text surfaces that use
   * `--fynns-radius-3xl` (Banner, InlineAlert, Snackbar, ChatComposer **text
   * start** / expanded shell pad when no leading control). Default 20dp —
   * slightly larger than `content-inset` so copy clears the large corner
   * curve. Do **not** invent `--fynns-banner-pad-inline` literals or raw
   * `--fynns-space-*` for these. Do **not** use this as the Chat column
   * outer inset — that is `dialog-inset` via `--fynns-chat-thread-pad-inline`.
   *
   * ChatComposer collapsed **shell** pad is `--fynns-chat-composer-pad-*`
   * (6dp), not this strip key and not `capsule-chrome-pad-inline`. SearchBar
   * IconButton edges stay on capsule-chrome (4dp).
   */
  "strip-pad-inline": "1.25rem",
  /**
   * Outer chrome pad when IconButtons sit at a `radius-3xl` capsule edge
   * (SearchBar — ChatGPT-style flush ~4dp). Not for ChatComposer shell
   * (use `--fynns-chat-composer-pad-*`). Not for text-only Banner strips —
   * use `strip-pad-inline`. Not for dense form `Input` shells — use
   * `field-pad-inline`.
   */
  "capsule-chrome-pad-inline": "0.25rem",
  /**
   * Horizontal pad *step* for dense form fields (`Input` / `.fynns-field-shell`
   * compose this with `capsule-chrome-pad-inline` for Select-matching text
   * start — see primitives.css). Default = `space-md` (12dp). Do **not**
   * reuse `capsule-chrome-pad-inline` alone here — that 4dp token is for
   * SearchBar IconButton flush; Input CSS adds it on top of this step.
   */
  "field-pad-inline": "var(--fynns-space-md)",
  /**
   * Block pad for multiline form fields (`Textarea`). Same default as
   * `field-pad-inline` (12dp). Single-line `Input` keeps a tighter
   * `space-25` / `sm` zero block pad to fit 40dp / 32dp control height —
   * do **not** apply this to `Input`.
   */
  "field-pad-block": "var(--fynns-space-md)",
  /**
   * Soft cap for auto-growing `Textarea` before inner scroll (13rem).
   * Matches ChatComposer `composer-max-height` density — not a Chat token.
   */
  "textarea-max-height": "13rem",
  /**
   * Vertical pad under section chrome before the first control (16dp):
   * Collapsible / Card `chrome="card"` body, Surface `padded`, CodeBlock pre.
   * Larger than `--fynns-space-sm` so headers don’t sit on Inputs.
   * Nesting surface wells (`chrome="plain"`, `.fynns-nest`) use `nest-gap`.
   */
  "content-pad-block": "1rem",
  /**
   * Space between **nested surface frames** (16dp): outer shell ↔ inner well
   * (CodeBlock / Surface / canvas / BusyRegion), and sibling wells / meta
   * inside a nest host. Used as four-side pad + column `gap` on
   * `chrome="plain"` Card/Collapsible body and `.fynns-nest`. Same default as
   * `unit-stack-gap`, but role is nest frames — not generic inspector stacks.
   * `chrome="plain"` ≠ flush; never cancel with negative margins.
   */
  "nest-gap": "1rem",
  /**
   * Dialog shell inset (24dp): head / foot / body **inline**. Also the Chat
   * **conversation column** outer pad (`--fynns-chat-thread-pad-inline` /
   * `--fynns-chat-composer-inset-inline`). Distinct from `content-inset`
   * (panel / dialog body block) and from `strip-pad-inline` (radius-3xl
   * text-in-shell). Prefer these layout keys over ad-hoc `--fynns-space-*`
   * or rem literals so nested Card / chat column stay symmetric.
   */
  "dialog-inset": "1.5rem",
  /** Bottom sheet — M3 max width 640dp. */
  "sheet-max-width": "40rem",
  /** Near-fullscreen height (leaves a peek of the page above). */
  "sheet-max-height": "90vh",
  "sheet-half-height": "50vh",
  /** Top inset so the sheet never covers the full viewport (M3 72dp). */
  "sheet-top-margin": "4.5rem",
  /** When viewport > 640dp (M3 56dp). */
  "sheet-top-margin-wide": "3.5rem",
  "sheet-side-margin-wide": "3.5rem",
  /** M3 docked drag handle 32×4dp. */
  "sheet-handle-width": "2rem",
  "sheet-handle-height": "0.25rem",
  /** Handle vertical padding (M3 22dp). */
  "sheet-handle-pad-block": "1.375rem",
  /** Content inset (M3 24dp inline / 16dp block). */
  "sheet-pad-inline": "1.5rem",
  "sheet-pad-block": "1rem",
  /** Gap between header stack elements (M3 12dp). */
  "sheet-header-gap": "0.75rem",
  /** Actions: top 16dp / bottom 24dp. */
  "sheet-actions-pad-top": "1rem",
  "sheet-actions-pad-bottom": "1.5rem",
  /** Cap to token width and viewport inset (2×8px margin — matches Popover VIEWPORT_MARGIN). */
  "tooltip-max-width": "min(14rem, calc(100vw - 16px))",
  /** M3 Snackbar — max width (~560dp) capped to viewport. */
  "snackbar-max-width": "min(35rem, calc(100vw - 2rem))",
  /** Single-line bar target (~48dp). */
  "snackbar-min-height": "3rem",
  /** Horizontal pad — layout strip pad (same long-strip text chrome as Banner). */
  "snackbar-pad-inline": "var(--fynns-layout-strip-pad-inline)",
  /** Vertical pad so single-line + sm dismiss (32dp) stays ~48dp (M3). */
  "snackbar-pad-block": "0.5rem",
  "snackbar-gap": "0.5rem",
  /** Trailing dismiss target inside the bar (not the 40dp chrome IconButton). */
  "snackbar-dismiss-size": "2rem",
  /** Enter slide distance (reduced-motion disables translate). */
  "snackbar-enter-offset": "0.5rem",
  /** Distance from the viewport bottom edge. */
  "snackbar-inset": "1rem",
  /** Fixed label column for `ControlRow` (toolbars / labeled strips). */
  "control-row-label": "7.5rem",
  /**
   * Toolbar / unit rhythm — prefer these over raw `--fynns-space-*`
   * (see AGENTS.md “Toolbar / unit rhythm”).
   */
  /**
   * Gap between ControlRows in a ControlStack (8dp). Must read **tighter** than
   * `unit-stack-gap` (16dp) so a sibling `ControlBlock` / FieldBlock is clearly
   * the next unit — not another row in the same switch cluster. Toolbar /
   * page chrome only — form hosts use `control-stack-form-gap`.
   */
  "control-stack-gap": "0.5rem",
  /**
   * Gap between ControlRows in a **form-host** ControlStack (12dp): centered
   * Dialog / Card body / Collapsible body direct. Aliases `space-md` — between
   * toolbar-tight `control-stack-gap` (8dp) and `unit-stack-gap` (16dp).
   */
  "control-stack-form-gap": "var(--fynns-space-md)",
  /**
   * Base gap inside `FieldStack` / `.fynns-field-stack` (**12dp** — aliases
   * `control-stack-form-gap` / `space-md`). Plain FieldBlocks stay at this
   * step (slightly roomier than toolbar `control-stack-gap` 8dp);
   * FieldBlocks with description/error (no choice cluster) open the next
   * sibling to `unit-stack-gap` (16dp); FieldBlocks hosting a
   * `.fynns-control-cluster` open to `form-cluster-gap` (32dp); sibling
   * ControlBlocks open to `unit-stack-gap` (16dp). Adjacent FieldStacks use
   * `form-cluster-gap` and should insert a horizontal `Divider` on kind jumps.
   */
  "field-stack-gap": "var(--fynns-layout-control-stack-form-gap)",
  /**
   * Gap between adjacent `FieldStack` clusters **and** after a FieldBlock
   * that hosts a choice `.fynns-control-cluster` (32dp — two unit steps).
   * Larger than `unit-stack-gap` (16dp). Between stacks, also place a
   * `Divider` (strongly recommended). Adjacent-stack margin is implemented
   * on `.fynns-field-stack + .fynns-field-stack` when no Divider sits between
   * (Card body gap still contributes `unit-stack-gap`).
   */
  "form-cluster-gap": "2rem",
  /** Label → controls when the row stacks vertically (narrow). */
  "control-row-gap": "0.25rem",
  /** Label | controls when the row is horizontal. */
  "control-row-column-gap": "0.5rem",
  /** Sibling switches / chips / Grid cells inside one controls cluster. */
  "control-cluster-gap": "0.5rem",
  /**
   * Gap between adjacent chrome icon targets (2dp): TopAppBar leading/trailing
   * IconButtons and NavigationRail destination indicators (icon-only).
   * `--fynns-appbar-actions-gap` / `--fynns-navrail-destinations-gap` alias this.
   * Labeled rail squares stay on `indicator-size-labeled` (64dp) — not this gap.
   */
  "chrome-icon-gap": "0.125rem",
  /**
   * Gap between a form control and its supporting / error hint (8dp):
   * `.fynns-field`, Otp, Autocomplete, `ControlBlock`, `FieldBlock`
   * description. **Tighter** than `unit-stack-gap` — within-unit copy must
   * not match the gap between sibling FieldBlocks / ControlBlocks.
   */
  "field-hint-gap": "0.5rem",
  /**
   * Vertical gap between stacked *units* (16dp): Card / Collapsible body
   * siblings, `.fynns-unit-stack`, inspector FieldBlock / ControlBlock /
   * intro copy / Checkbox. Prefer flex + this token (sandbox `.sandbox-stack`)
   * over ad-hoc margins. M3-aligned “between components” step on the 8dp
   * grid — clearly larger than `field-hint-gap` / `control-stack-gap` (8dp),
   * smaller than section gaps (24dp+).
   */
  "unit-stack-gap": "1rem",
  /**
   * Max inline size for `Switch` `labelSide="end"` captions (7rem).
   * Ellipsis when the ControlStack / Card host is narrower than the label —
   * prefer truncation over overflowing the frame.
   */
  "switch-label-end": "7rem",
  /**
   * Single-line chrome bar height (56dp): TopAppBar `sm` row, BottomAppBar,
   * SearchBar field, Toolbar. Taller than `--fynns-size-icon-target` (40dp) so
   * IconButton hover discs are not flush with the bar edge. Multi-line app bars
   * use `--fynns-appbar-height-md` / `-lg` instead.
   */
  "bar-height": "3.5rem",
  /**
   * `EndAside` supporting pane width (desktop). Child content locks to the same
   * width while the pane morphs so the canvas seam does not reflow.
   */
  "end-aside-width": "22rem",
  /**
   * Cap for `EndAside` on wide viewports (pairs with `end-aside-width`).
   * Also clamps live drag resize.
   */
  "end-aside-max-width": "36vw",
  /**
   * Floor for `EndAside` when open (and drag-resize min). Preferred width stays
   * on `end-aside-width`; flex uses `min-width: 0` (not `min(token, 100%)` of
   * the full row — that overflows beside main). When the main track is ≤32rem
   * (container query), EndAside leaves flex flow and overlays the end edge.
   * Also: `onNavCrowded` → rail when drawer + floors still overflow; ≤56.25rem
   * viewport → bottom sheet (resize handle hidden).
   */
  "end-aside-min-width": "clamp(12rem, 28%, 18rem)",
  /**
   * Preferred main canvas size beside `EndAside` (`flex-basis`). Shrink with
   * `min-width: 0` in CSS — never `min(token, 100%)` of the flex parent row.
   * Dropped while EndAside overlays (≤32rem main).
   */
  "main-min-width": "clamp(10rem, 36%, 20rem)",
  /**
   * Chat thread + composer column ceiling when Chat fills ClippedNavShell main
   * (ChatGPT `max-w-3xl`). Keep in sync with `--fynns-chatmessage-max-width`.
   * EndAside / `.fynns-chat-host--fill` children ignore this (100% of pane).
   */
  "chat-max-width": "48rem",
  /**
   * Soft floor for Chat stage root when flex-competing. Apply as
   * `min(var(--fynns-layout-chat-min-width), 100%)` — never bare (no window lock).
   * Message column stays `min-width: 0`.
   */
  "chat-min-width": "20rem",
  /**
   * Hub master-detail list pane track width.
   * Must leave room for CatalogGroup title + count + IconButton cluster
   * (project rules/skills); 18rem crushed titles to a few glyphs.
   */
  "list-pane-width": "22rem",
  /** Destination / mode NavigationDrawer pane width. */
  "nav-pane-width": "17.5rem",
  /** Main content column ceiling (`.content` / hub max width). */
  "content-max-width": "73.75rem",
  /** Catalog list well scroll max height (full shell). */
  "list-well-max-height": "calc(100vh - 13.75rem)",
  /** Catalog list well scroll max height (narrow / stacked split). */
  "list-well-max-height-sm": "20rem",
  /** StatCard / hub-grid--stats auto-fill min column. */
  "stats-min-col": "11.25rem",
  /** StatCard min column on narrow viewports. */
  "stats-min-col-sm": "9.375rem",
  /** Card grid auto-fill min column. */
  "card-min-col": "17.5rem",
  /** Dense card grid min column (Quicklinks etc.). */
  "dense-card-min-col": "15rem",
  /** Wide data tables (usage model subtotals) min width before horizontal scroll. */
  "table-min-width-lg": "47.5rem",
  /** Chart tooltip / tip panel soft min width. */
  "chart-tip-min-width": "12.5rem",
  /** Legend color swatch size. */
  "legend-swatch": "0.625rem",
  /** Numeric count column soft min (tables / catalogs). */
  "count-col-min": "2.25rem",
  /** SectionLoading / hub-busy-block minimum height. */
  "busy-min-height": "10rem",
} as const;

/**
 * Scrollbar skin. `--fynns-scrollbar-<key>`.
 * Note: thumb colors equal the 8-digit hex in `./scrollbar.ts` (used by Monaco).
 */
export const SCROLLBAR_TOKENS = {
  size: "10px",
  thumb: "rgba(106, 144, 149, 0.357)",
  "thumb-hover": "rgba(22, 159, 177, 0.384)",
  "thumb-active": "rgba(22, 159, 177, 0.678)",
  track: "transparent",
  "thumb-border": "2px",
} as const;

/**
 * CodeBlock syntax colors — distilled from Fynn’s VS C/C++ theme
 * (`cpptools_dark_vs_new` / `cpptools_light_vs_new` TextMate last-wins).
 * `--fynns-code-<key>`. Semantic roles for the zero-dep highlighter (not a
 * full TextMate engine).
 */
export const CODE_TOKENS = {
  /** Default code ink (`editor.foreground`). */
  fg: "#b2cacd",
  /** Optional code well (`editor.background`). */
  bg: "#031417",
  comment: "#848484",
  keyword: "#df769b",
  string: "#16b673",
  number: "#7060eb",
  type: "#4EC9B0",
  function: "#c3c37a",
  variable: "#75b4e8",
  property: "#2ab4ff",
  parameter: "#ff53ff",
  operator: "#b4b4b4",
  /** Namespaces / modules (`std::`, Python import) — grassy green. */
  module: "#75c94e",
  /** Language constants (`true` / `null` / …). */
  constant: "#7060eb",
  /** Named constants (`MAX`, `PI`, …). */
  "constant-named": "#d5971a",
  escape: "#FFD68F",
  invalid: "#f44747",
} as const;

/** Ungrouped tokens. Emitted as `--fynns-<key>` (no sub-prefix). */
export const MISC_TOKENS = {
  "border-hairline": "1px",
  "opacity-muted": "0.8",
} as const;

/**
 * Light-theme overrides for color, shadow, and scrollbar groups.
 * Applied via `:root[data-fynns-theme="light"]` in the generated theme.css.
 */
export const LIGHT_THEME_OVERRIDES: ReadonlyArray<
  readonly [string, Record<string, string>]
> = [
  [
    "color",
    {
      "app-bg": "#e8f4f2",
      surface: "#e8f4f2",
      "surface-head": "#eef6f4",
      "surface-1": "#ffffff",
      "surface-2": "#f5fafa",
      "surface-3": "#ffffff",
      "surface-4": "#f0f7f5",
      "surface-5": "#e8f2ef",
      "surface-muted": "rgba(0, 0, 0, 0.03)",
      "surface-hover": "rgba(0, 0, 0, 0.05)",
      border: "#c5ddd8",
      "border-strong": "#a8ccc4",
      text: "#0d2e2c",
      "text-muted": "#5a7a74",
      accent: "#0d9488",
      "accent-dim": "#0f766e",
      "accent-hover": "#14b8a6",
      "accent-active": "#0d9488",
      "accent-soft": "rgba(13, 148, 136, 0.12)",
      "accent-mid": "rgba(13, 148, 136, 0.45)",
      "accent-24": "rgba(13, 148, 136, 0.18)",
      "accent-42": "rgba(13, 148, 136, 0.32)",
      "accent-ring": "rgba(13, 148, 136, 0.16)",
      "on-accent": "#ffffff",
      "accent-container": "rgba(13, 148, 136, 0.14)",
      "on-accent-container": "#0f766e",
      "secondary-container": "#cce8e3",
      "on-secondary-container": "#0a3d3a",
      "tertiary-container": "#d6e3ff",
      "on-tertiary-container": "#1a3a6e",
      "outline-subtle": "#d5e8e4",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      "danger-border": "rgba(220, 38, 38, 0.45)",
      info: "#2563eb",
      focus: "rgba(13, 148, 136, 0.2)",
      overlay: "rgba(0, 0, 0, 0.32)",
      "toast-surface": "#ffffff",
      "control-surface": "rgba(0, 0, 0, 0.02)",
      "control-surface-hover": "rgba(0, 0, 0, 0.04)",
      "input-fill": "rgba(0, 0, 0, 0.04)",
      "flyout-item": "rgba(0, 0, 0, 0.02)",
      "flyout-item-hover": "rgba(0, 0, 0, 0.05)",
      "toggle-track": "rgba(0, 0, 0, 0.08)",
      "toggle-track-hover": "rgba(0, 0, 0, 0.12)",
      "chat-user-bubble": "#e8f0ee",
    },
  ],
  [
    "chatmessage",
    {
      /** ChatGPT `.user-message-inline-code` light wash (text at 10%). */
      "code-user-bg-mix": "10%",
    },
  ],
  [
    "shadow",
    {
      none: "none",
      xs: "0 1px 2px rgba(0, 0, 0, 0.06)",
      sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
      md: "0 4px 12px rgba(0, 0, 0, 0.1)",
      lg: "0 16px 48px rgba(0, 0, 0, 0.12)",
      xl: "0 24px 64px rgba(0, 0, 0, 0.14)",
      flyout: "0 8px 24px rgba(0, 0, 0, 0.1)",
      tooltip: "0 6px 20px rgba(0, 0, 0, 0.12)",
      "toggle-thumb": "0 1px 2px rgba(0, 0, 0, 0.15)",
      "glow-accent": "0 0 12px rgba(13, 148, 136, 0.28)",
      "glow-danger": "0 0 12px rgba(220, 38, 38, 0.28)",
    },
  ],
  [
    "scrollbar",
    {
      thumb: "rgba(90, 122, 116, 0.35)",
      "thumb-hover": "rgba(13, 148, 136, 0.45)",
      "thumb-active": "rgba(13, 148, 136, 0.65)",
    },
  ],
  [
    "code",
    {
      fg: "#000000",
      bg: "#ffffff",
      comment: "#008000",
      keyword: "#0000ff",
      string: "#a31515",
      number: "#098658",
      type: "#2B91AF",
      function: "#74531F",
      variable: "#1F377F",
      property: "#0451a5",
      parameter: "#808080",
      operator: "#000000",
      module: "#098658",
      constant: "#0000ff",
      "constant-named": "#000000",
      escape: "#B776FB",
      invalid: "#cd3131",
    },
  ],
];

export type ColorTokenName = keyof typeof COLOR_TOKENS;
export type SpaceTokenName = keyof typeof SPACE_TOKENS;
export type SizeTokenName = keyof typeof SIZE_TOKENS;
export type RadiusTokenName = keyof typeof RADIUS_TOKENS;
export type ShadowTokenName = keyof typeof SHADOW_TOKENS;
export type StateLayerTokenName = keyof typeof STATE_LAYER_TOKENS;

/** Ordered [cssGroupPrefix, table] pairs used to emit the `:root` block. */
export const TOKEN_GROUPS: ReadonlyArray<readonly [string, Record<string, string>]> = [
  ["color", COLOR_TOKENS],
  ["space", SPACE_TOKENS],
  ["size", SIZE_TOKENS],
  ["radius", RADIUS_TOKENS],
  ["shadow", SHADOW_TOKENS],
  ["state", STATE_LAYER_TOKENS],
  ["font", FONT_FAMILY_TOKENS],
  ["font-size", FONT_SIZE_TOKENS],
  ["font-weight", FONT_WEIGHT_TOKENS],
  ["line-height", LINE_HEIGHT_TOKENS],
  ["letter-spacing", LETTER_SPACING_TOKENS],
  ["z", Z_TOKENS],
  ["duration", DURATION_TOKENS],
  ["ease", EASING_TOKENS],
  ["toggle", TOGGLE_TOKENS],
  ["selection", SELECTION_TOKENS],
  ["chip", CHIP_TOKENS],
  ["segmented", SEGMENTED_TOKENS],
  ["progress", PROGRESS_TOKENS],
  ["avatar", AVATAR_TOKENS],
  ["fab", FAB_TOKENS],
  ["fabmenu", FABMENU_TOKENS],
  ["appbar", APPBAR_TOKENS],
  ["bottomappbar", BOTTOM_APPBAR_TOKENS],
  ["toolbar", TOOLBAR_TOKENS],
  ["searchbar", SEARCHBAR_TOKENS],
  ["banner", BANNER_TOKENS],
  ["chatmessage", CHATMESSAGE_TOKENS],
  ["chat", CHAT_TOKENS],
  ["list", LIST_TOKENS],
  ["datepicker", DATEPICKER_TOKENS],
  ["timepicker", TIMEPICKER_TOKENS],
  ["carousel", CAROUSEL_TOKENS],
  ["breadcrumb", BREADCRUMB_TOKENS],
  ["pagination", PAGINATION_TOKENS],
  ["navrail", NAVRAIL_TOKENS],
  ["navbar", NAVBAR_TOKENS],
  ["navdrawer", NAVDRAWER_TOKENS],
  ["focus", FOCUS_TOKENS],
  ["layout", LAYOUT_TOKENS],
  ["scrollbar", SCROLLBAR_TOKENS],
  ["code", CODE_TOKENS],
  ["", MISC_TOKENS],
];

/** Build the canonical CSS variable name for a token. */
export function fynnsVarName(groupPrefix: string, key: string): string {
  return groupPrefix ? `--fynns-${groupPrefix}-${key}` : `--fynns-${key}`;
}

/** Build the `:root { ... }` declaration block for all tokens. */
export function buildRootCssVarsBlock(): string {
  const lines: string[] = ["  color-scheme: dark;"];
  for (const [groupPrefix, table] of TOKEN_GROUPS) {
    for (const [key, value] of Object.entries(table)) {
      lines.push(`  ${fynnsVarName(groupPrefix, key)}: ${value};`);
    }
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

/** Build the `:root[data-fynns-theme="light"] { ... }` override block. */
export function buildLightThemeCssBlock(): string {
  const lines: string[] = ["  color-scheme: light;"];
  for (const [groupPrefix, table] of LIGHT_THEME_OVERRIDES) {
    for (const [key, value] of Object.entries(table)) {
      lines.push(`  ${fynnsVarName(groupPrefix, key)}: ${value};`);
    }
  }
  return `:root[data-fynns-theme="light"] {\n${lines.join("\n")}\n}`;
}
