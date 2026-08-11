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
  /** Fade / motion for tooltip bubble enter/exit. */
  tooltip: "120ms",
  /**
   * Hover intent delay before a plain tooltip opens (MDC `SHOW_DELAY_MS`).
   * Leave / blur hides immediately; keyboard focus skips this delay.
   * After any tip has opened, further tips skip this delay while the pointer
   * stays in the “warm” window (`tooltip-skip-delay`) — consecutive toolbar
   * hovers feel instant (M3 / Cursor / native UI).
   */
  "tooltip-show-delay": "500ms",
  /**
   * After the last tooltip closes, how long subsequent hovers still skip the
   * show delay (Radix `skipDelayDuration` analogue; M3 consecutive-tooltip UX).
   */
  "tooltip-skip-delay": "500ms",
  toggle: "140ms",
  fast: "140ms",
  flyout: "160ms",
  base: "240ms",
  slow: "360ms",
  /**
   * Soft hover/focus-within scrollbar thumb reveal / hide (theme.css).
   * Slower than `slow` so the bar eases in without a flash.
   */
  scrollbar: "520ms",
  "loading-spin": "750ms",
  "presentation-hint": "1200ms",
  "reduced-motion-spin": "2200ms",
} as const;

export type EasingTokenName = keyof typeof EASING_TOKENS;
export type DurationTokenName = keyof typeof DURATION_TOKENS;
