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
  "app-bg": "#031417",
  surface: "#031417",
  "surface-head": "#021012",
  "surface-muted": "rgba(255, 255, 255, 0.03)",
  "surface-hover": "rgba(255, 255, 255, 0.08)",
  border: "#0d2e2c",
  text: "#e2f0ed",
  "text-muted": "#7a9e98",
  accent: "#2dd4bf",
  "accent-dim": "#14b8a6",
  "accent-soft": "rgba(45, 212, 191, 0.18)",
  "accent-mid": "rgba(45, 212, 191, 0.5)",
  "accent-24": "rgba(45, 212, 191, 0.24)",
  "accent-42": "rgba(45, 212, 191, 0.42)",
  "accent-ring": "rgba(45, 212, 191, 0.4)",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  "danger-border": "rgba(248, 113, 113, 0.5)",
  info: "#60a5fa",
  focus: "rgba(45, 212, 191, 0.48)",
  overlay: "rgba(0, 0, 0, 0.48)",
  "toast-surface": "#062126",
  "control-surface": "rgba(255, 255, 255, 0.02)",
  "control-surface-hover": "rgba(255, 255, 255, 0.05)",
  /** Dense text/number fields (LLM settings, Counter). */
  "input-fill": "rgba(0, 0, 0, 0.28)",
  "flyout-item": "rgba(255, 255, 255, 0.03)",
  "flyout-item-hover": "rgba(255, 255, 255, 0.08)",
  "toggle-track": "rgba(255, 255, 255, 0.06)",
  "toggle-track-hover": "rgba(255, 255, 255, 0.1)",
} as const;

/** Spacing scale (rem). `--fynns-space-<key>`. */
export const SPACE_TOKENS = {
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

/** Corner radii. `--fynns-radius-<key>`. */
export const RADIUS_TOKENS = {
  sm: "6px",
  md: "8px",
  lg: "10px",
  "flyout-glyph": "5px",
  pill: "999px",
  round: "50%",
} as const;

/** Elevation shadows. `--fynns-shadow-<key>`. */
export const SHADOW_TOKENS = {
  lg: "0 16px 48px rgba(0, 0, 0, 0.45)",
  flyout: "0 8px 24px rgba(0, 0, 0, 0.35)",
  tooltip: "0 6px 20px rgba(0, 0, 0, 0.45)",
  "toggle-thumb": "0 1px 2px rgba(0, 0, 0, 0.35)",
} as const;

/** Font stacks. `--fynns-font-<key>`. */
export const FONT_FAMILY_TOKENS = {
  ui: 'system-ui, "Segoe UI", Roboto, sans-serif',
  mono: '"Cascadia Code", "Fira Code", ui-monospace, monospace',
  serif: '"CMU Serif", "Latin Modern Roman", Cambria, "Times New Roman", serif',
} as const;

/** Font sizes. `--fynns-font-size-<key>`. */
export const FONT_SIZE_TOKENS = {
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
  semibold: "600",
  title: "650",
} as const;

/** Line heights. `--fynns-line-height-<key>`. */
export const LINE_HEIGHT_TOKENS = {
  root: "1.4",
  tight: "1",
  snug: "1.25",
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

/** Toggle/switch geometry. `--fynns-toggle-<key>`. */
export const TOGGLE_TOKENS = {
  "track-w": "2.2rem",
  "track-h": "1.25rem",
  thumb: "0.86rem",
  "thumb-shift": "0.92rem",
  "track-pad-inline": "0.14rem",
  "margin-top": "0.08em",
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
  "tooltip-max-width": "min(14rem, 85vw)",
  "command-palette-width": "min(100%, 34rem)",
  "command-palette-max-height": "min(70vh, 28rem)",
  "command-palette-top-padding": "12vh",
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

export type ColorTokenName = keyof typeof COLOR_TOKENS;
export type SpaceTokenName = keyof typeof SPACE_TOKENS;
export type SizeTokenName = keyof typeof SIZE_TOKENS;
export type RadiusTokenName = keyof typeof RADIUS_TOKENS;
export type ShadowTokenName = keyof typeof SHADOW_TOKENS;

/** Ordered [cssGroupPrefix, table] pairs used to emit the `:root` block. */
export const TOKEN_GROUPS: ReadonlyArray<readonly [string, Record<string, string>]> = [
  ["color", COLOR_TOKENS],
  ["space", SPACE_TOKENS],
  ["size", SIZE_TOKENS],
  ["radius", RADIUS_TOKENS],
  ["shadow", SHADOW_TOKENS],
  ["font", FONT_FAMILY_TOKENS],
  ["font-size", FONT_SIZE_TOKENS],
  ["font-weight", FONT_WEIGHT_TOKENS],
  ["line-height", LINE_HEIGHT_TOKENS],
  ["letter-spacing", LETTER_SPACING_TOKENS],
  ["z", Z_TOKENS],
  ["duration", DURATION_TOKENS],
  ["ease", EASING_TOKENS],
  ["toggle", TOGGLE_TOKENS],
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
