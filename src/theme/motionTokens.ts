/**
 * Motion tokens (easing curves + durations) for the fynns design system.
 *
 * Single source of truth, mirrored to `--fynns-ease-*` / `--fynns-duration-*`
 * CSS variables by `scripts/gen-theme.mjs`. Do not reintroduce duration or
 * easing literals in component CSS; reference the generated variables instead.
 */

/** Easing curves. Emitted as `--fynns-ease-<key>`. */
export const EASING_TOKENS = {
  /** Default UI easing. */
  standard: "ease",
  /** Emphasized ease-out for step transitions / FLIP animations. */
  emphasized: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Expo-out for flyout enter / overlay reveal. */
  "out": "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Symmetric ease for hover / color transitions. */
  "in-out": "cubic-bezier(0.45, 0, 0.55, 1)",
  /** Light overshoot for toggle thumb / micro-interactions. */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Durations. Emitted as `--fynns-duration-<key>`. */
export const DURATION_TOKENS = {
  /** Near-zero; used by the reduced-motion override. */
  instant: "1ms",
  tooltip: "120ms",
  toggle: "140ms",
  fast: "140ms",
  flyout: "160ms",
  base: "240ms",
  slow: "360ms",
  pointer: "420ms",
  "loop-pulse": "450ms",
  "loading-spin": "750ms",
  "presentation-hint": "1200ms",
  "loading-skeleton": "1250ms",
  "reduced-motion-spin": "2200ms",
} as const;

export type EasingTokenName = keyof typeof EASING_TOKENS;
export type DurationTokenName = keyof typeof DURATION_TOKENS;
