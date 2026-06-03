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
} as const;

/** Durations. Emitted as `--fynns-duration-<key>`. */
export const DURATION_TOKENS = {
  /** Near-zero; used by the reduced-motion override. */
  instant: "1ms",
  tooltip: "120ms",
  toggle: "140ms",
  fast: "140ms",
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
