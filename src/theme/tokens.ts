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
  "accent-ring": "rgba(45, 212, 191, 0.4)",
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
  /** Quieter divider than border / border-strong. */
  "outline-subtle": "#0a2524",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  "danger-border": "rgba(248, 113, 113, 0.5)",
  info: "#60a5fa",
  focus: "rgba(45, 212, 191, 0.48)",
  overlay: "rgba(0, 0, 0, 0.48)",
  /** Legacy toast surface; kept for backward compatibility. */
  "toast-surface": "#062126",
  "control-surface": "rgba(255, 255, 255, 0.02)",
  "control-surface-hover": "rgba(255, 255, 255, 0.05)",
  /** Dense text/number fields (LLM settings, Counter). */
  "input-fill": "rgba(0, 0, 0, 0.28)",
  "flyout-item": "rgba(255, 255, 255, 0.03)",
  "flyout-item-hover": "rgba(255, 255, 255, 0.08)",
  "toggle-track": "rgba(255, 255, 255, 0.06)",
  "toggle-track-hover": "rgba(255, 255, 255, 0.1)",
  /** Skeleton shimmer base. */
  "skeleton-base": "rgba(255, 255, 255, 0.06)",
  /** Skeleton shimmer highlight. */
  "skeleton-sheen": "rgba(255, 255, 255, 0.14)",
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
 * T-shirt keys roughly track the M3 shape scale (see `tokens.m3-draft.ts`);
 * numeric values remain fynns overrides, not a 1:1 M3 copy.
 */
export const RADIUS_TOKENS = {
  none: "0",
  /** M3 extra-small ≈ 4dp */
  xs: "4px",
  sm: "6px",
  /** Card default (M3 medium ≈ 12dp is a sandbox starting point, not forced here). */
  md: "8px",
  lg: "10px",
  /** M3 extra-large band */
  xl: "16px",
  "2xl": "24px",
  /** M3 extra-large / sheet top corners ≈ 28dp. */
  "3xl": "28px",
  "flyout-glyph": "5px",
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

/**
 * Card variant → surface / elevation / border mapping.
 * Lookup table for the Card primitive — not a CSS token group.
 */
export const CARD_VARIANT_MAP = {
  elevated: { surfaceContainer: "surface-1", elevation: 1, border: false },
  filled: { surfaceContainer: "surface-4", elevation: 0, border: false },
  outlined: { surfaceContainer: "app-bg", elevation: 0, border: true },
} as const;

export type ElevationLevel = keyof typeof ELEVATION_TOKENS;
export type StateLayerName = keyof typeof STATE_LAYER_TOKENS;
export type CardVariant = keyof typeof CARD_VARIANT_MAP;

/** Font stacks. `--fynns-font-<key>`. */
export const FONT_FAMILY_TOKENS = {
  ui: 'system-ui, "Segoe UI", Roboto, sans-serif',
  mono: '"Cascadia Code", "Fira Code", ui-monospace, monospace',
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
  dropdown: "40",
  popover: "50",
  modal: "60",
  toast: "70",
  tooltip: "8000",
} as const;

/**
 * Toggle/switch geometry (M3 Switch proportions at 16px rem).
 * Track 52×32dp; fixed handle 20dp (between M3 unselected 16 / selected 24).
 * Outline 2dp at md; sm uses 1.5px so the stroke does not look heavier.
 * `track-pad-*` = padding-box inset (outer gap ≈ pad + outline = (track-h − thumb)/2).
 * No selected-size morph.
 * `--fynns-toggle-<key>`.
 */
export const TOGGLE_TOKENS = {
  "track-w": "3.25rem",
  "track-h": "2rem",
  /** Fixed handle diameter (20dp both states). */
  thumb: "1.25rem",
  /** @deprecated Alias of `thumb` — kept so older CSS/refs stay valid. */
  "thumb-checked": "1.25rem",
  /** Legacy transform shift; prefer absolute left for Switch. */
  "thumb-shift": "1.25rem",
  /** Padding-box inset; pairs with `track-outline` for outer-edge symmetry. */
  "track-pad-inline": "0.25rem",
  "track-pad-checked": "0.25rem",
  /** M3 `track-outline-width` = 2dp. */
  "track-outline": "2px",
  /** Proportional outline for `size="sm"` (~75% track). */
  "track-outline-sm": "1.5px",
  "track-w-sm": "2.4375rem",
  "track-h-sm": "1.5rem",
  "thumb-sm": "0.9375rem",
  "thumb-checked-sm": "0.9375rem",
  "track-pad-inline-sm": "0.1875rem",
  "track-pad-checked-sm": "0.1875rem",
  "margin-top": "0.08em",
} as const;

/**
 * Checkbox / radio geometry (M3 Selection controls at 16px rem).
 * Checkbox box 18dp; radio 20dp; state layer 40dp; outline 2dp.
 * `--fynns-selection-<key>`.
 */
export const SELECTION_TOKENS = {
  "box-size": "1.125rem",
  "box-radius": "2px",
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
 * Progress indicator geometry (M3 linear / circular at 16px rem).
 * Track + active indicator 4dp; circular default 48dp; gap + stop 4dp.
 * `--fynns-progress-<key>`.
 */
export const PROGRESS_TOKENS = {
  "track-thickness": "0.25rem",
  gap: "0.25rem",
  "stop-size": "0.25rem",
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
  "icon-size-sm": "1.25rem",
  "icon-size-lg": "2.25rem",
  "pad-inline-extended": "1.25rem",
  gap: "0.75rem",
} as const;

/**
 * Top app bar geometry (M3-informed, denser for desktop/tool chrome).
 * Small 40dp; medium 80dp; large 104dp. Action row matches small height.
 * `--fynns-appbar-<key>`.
 */
export const APPBAR_TOKENS = {
  height: "2.5rem",
  "height-md": "5rem",
  "height-lg": "6.5rem",
  "row-height": "2.5rem",
  "pad-inline": "0.25rem",
  /** Title inset under the action row (medium / large). */
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
 * Navigation rail geometry (at 16px rem).
 * Container 80dp; destination highlight wraps icon (+ label when shown).
 * Icon-only highlight is 56×56; labeled uses width + padding (not an icon pill).
 * `--fynns-navrail-<key>`.
 */
export const NAVRAIL_TOKENS = {
  width: "5rem",
  /** Icon-only destination highlight (56×56). */
  "indicator-width": "3.5rem",
  "indicator-height-icon": "3.5rem",
  /** Labeled destination highlight — square, inset from the 80dp rail edge. */
  "indicator-size-labeled": "4rem",
  /** Padding inside the labeled square (symmetric; keep content off the edge). */
  "indicator-pad-block": "0.5rem",
  "indicator-pad-inline": "0.5rem",
  "icon-size": "1.5rem",
  /** Outer space around each destination button (keep tight — gap owns rhythm). */
  "item-pad-block": "0",
  /** Space between destination buttons. */
  "destinations-gap": "0.5rem",
  "pad-block-start": "2.75rem",
  "menu-pad-block": "0.75rem",
  /** Menu control min touch target (48dp). */
  "menu-target": "3rem",
  "header-gap": "0.75rem",
  "header-pad-block": "0.25rem",
  "label-size": "0.75rem",
  "label-line": "1.25",
  "label-gap": "0.125rem",
  /** Small badge (dot) on destination icon. */
  "badge-dot": "0.375rem",
  /** Large badge min size (count / short text). */
  "badge-size": "1rem",
  "badge-font-size": "0.6875rem",
  /**
   * Extra outward shift past the icon corner so badge centers (dot and
   * large) share one point and clear the glyph.
   */
  "badge-nudge": "0.125rem",
} as const;

/** Focus ring geometry. `--fynns-focus-<key>`. */
export const FOCUS_TOKENS = {
  "ring-width": "2px",
  "ring-offset-control": "2px",
  "ring-offset-input": "1px",
} as const;

/** Generic layout sizes for modals/tooltips/command palette. `--fynns-layout-<key>`. */
export const LAYOUT_TOKENS = {
  "dialog-max-width": "32rem",
  "dialog-max-width-sm": "24rem",
  "dialog-max-width-md": "32rem",
  "dialog-max-width-lg": "42rem",
  "drawer-width": "72vw",
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
  "tooltip-max-width": "min(14rem, 85vw)",
  "command-palette-width": "min(100%, 34rem)",
  "command-palette-max-height": "min(70vh, 28rem)",
  "command-palette-top-padding": "12vh",
  /** Fixed label column for `ControlRow` (toolbars / settings strips). */
  "control-row-label": "7.5rem",
  /** Optional floor for dense `Switch labelSide="end"` layouts (prefer content). */
  "switch-label-end": "7rem",
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
  "thumb-radius": "10px",
  "thumb-border": "2px",
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
      "accent-ring": "rgba(13, 148, 136, 0.38)",
      "on-accent": "#ffffff",
      "accent-container": "rgba(13, 148, 136, 0.14)",
      "on-accent-container": "#0f766e",
      "secondary-container": "#cce8e3",
      "on-secondary-container": "#0a3d3a",
      "outline-subtle": "#d5e8e4",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      "danger-border": "rgba(220, 38, 38, 0.45)",
      info: "#2563eb",
      focus: "rgba(13, 148, 136, 0.42)",
      overlay: "rgba(0, 0, 0, 0.32)",
      "toast-surface": "#ffffff",
      "control-surface": "rgba(0, 0, 0, 0.02)",
      "control-surface-hover": "rgba(0, 0, 0, 0.04)",
      "input-fill": "rgba(0, 0, 0, 0.04)",
      "flyout-item": "rgba(0, 0, 0, 0.02)",
      "flyout-item-hover": "rgba(0, 0, 0, 0.05)",
      "toggle-track": "rgba(0, 0, 0, 0.08)",
      "toggle-track-hover": "rgba(0, 0, 0, 0.12)",
      "skeleton-base": "rgba(0, 0, 0, 0.06)",
      "skeleton-sheen": "rgba(0, 0, 0, 0.12)",
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
  ["progress", PROGRESS_TOKENS],
  ["avatar", AVATAR_TOKENS],
  ["fab", FAB_TOKENS],
  ["appbar", APPBAR_TOKENS],
  ["navrail", NAVRAIL_TOKENS],
  ["focus", FOCUS_TOKENS],
  ["layout", LAYOUT_TOKENS],
  ["scrollbar", SCROLLBAR_TOKENS],
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
