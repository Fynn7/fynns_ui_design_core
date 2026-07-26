/**
 * M3 reference draft — read-only mirror of Material Design 3 values for Card
 * aesthetics. NOT consumed by production components and NOT emitted into
 * `theme.css`. Use this file (and the aesthetic sandbox) to compare against
 * `tokens.ts` / `fynns-override` values.
 *
 * Layers (see AGENTS.md / sandbox plan):
 *   m3-reference (this file) → fynns-base (tokens.ts) → fynns-override (sandbox)
 *
 * Values are approximate translations of M3 dp into CSS (1dp ≈ 1px at 1x).
 */

/** M3 corner radius scale (functional steps used by cards / surfaces). */
export const M3_SHAPE_REFERENCE = {
  none: "0",
  "extra-small": "4px",
  small: "8px",
  /** Card default */
  medium: "12px",
  large: "16px",
  "extra-large": "28px",
  full: "999px",
} as const;

/**
 * M3 surface-container roles mapped onto the fynns OKLCH teal hue (192).
 * These are suggested L/C targets, not committed production colors.
 */
export const M3_SURFACE_CONTAINER_REFERENCE = {
  surface: "oklch(9% 0.02 192)",
  "surface-container-lowest": "oklch(10% 0.022 192)",
  "surface-container-low": "oklch(11% 0.025 192)",
  "surface-container": "oklch(14% 0.03 192)",
  "surface-container-high": "oklch(17% 0.035 192)",
  "surface-container-highest": "oklch(20% 0.038 192)",
} as const;

/** M3 elevation levels → suggested fynns surface / shadow pairing. */
export const M3_ELEVATION_REFERENCE = {
  0: { role: "flat / filled+outlined resting", surface: "surface", shadow: "none" },
  1: { role: "elevated card resting", surface: "surface-container-low", shadow: "xs" },
  2: { role: "nav / menu", surface: "surface-container", shadow: "sm" },
  3: { role: "FAB / dialog", surface: "surface-container-high", shadow: "md" },
  4: { role: "card dragged", surface: "surface-container-highest", shadow: "lg" },
  5: { role: "reserved hover emphasis", surface: "surface-container-highest+", shadow: "xl" },
} as const;

/** M3 state-layer opacities (starting points for the sandbox). */
export const M3_STATE_LAYER_REFERENCE = {
  hover: "8%",
  focus: "10%",
  pressed: "12%",
  dragged: "16%",
} as const;

/** Card variant anatomy per M3 component spec. */
export const M3_CARD_VARIANT_REFERENCE = {
  elevated: {
    surfaceRole: "surface-container-low",
    elevation: 1,
    outline: false,
  },
  filled: {
    surfaceRole: "surface-container-highest",
    elevation: 0,
    outline: false,
  },
  outlined: {
    surfaceRole: "surface",
    elevation: 0,
    outline: true,
  },
} as const;

/** Content padding used by M3 card content regions. */
export const M3_CARD_SPACING_REFERENCE = {
  contentPadding: "16px",
  headerPaddingBlock: "12px",
  actionsPaddingBlock: "8px",
} as const;
