/**
 * Custom scrollbar skin helpers for the fynns design system.
 *
 * The colors here are the 8-digit-hex equivalents of the `--fynns-scrollbar-*`
 * CSS variables (see `./tokens.ts` SCROLLBAR_TOKENS); the hex form is required
 * by editors like Monaco whose theme colors do not accept `rgba()`.
 *
 *   - DOM overflow surfaces inherit the skin from `theme.css` (every `*`) or via
 *     the `.fynns-scroll` / `.fynns-scroll-area` classes (see `primitives.css`).
 *   - Monaco reads the palette through {@link monacoScrollbarColors}.
 */

/** Authoritative scrollbar palette (hex; equals `--fynns-scrollbar-*`). */
export const SCROLLBAR_COLORS = {
  thumb: "#6a90955b",
  thumbHover: "#169fb162",
  thumbActive: "#169fb1ad",
  track: "transparent",
} as const;

/** CSS custom properties that carry the scrollbar palette. */
export const SCROLLBAR_CSS_VARS = {
  thumb: "--fynns-scrollbar-thumb",
  thumbHover: "--fynns-scrollbar-thumb-hover",
  thumbActive: "--fynns-scrollbar-thumb-active",
  track: "--fynns-scrollbar-track",
} as const;

/** Class that turns an element into a scrollable container with the skin. */
export const SCROLL_CONTAINER_CLASS = "fynns-scroll-area";

/** Class that paints any scrollable element with the custom skin. */
export const SCROLL_SURFACE_CLASS = "fynns-scroll";

/** Append the scroll-surface skin class to caller-provided classes. */
export function mergeScrollSurfaceClass(
  ...classes: Array<string | false | null | undefined>
): string {
  return [...classes, SCROLL_SURFACE_CLASS].filter(Boolean).join(" ");
}

/** Monaco `theme.colors` entries derived from the shared palette. */
export function monacoScrollbarColors(): Record<string, string> {
  return {
    "scrollbarSlider.background": SCROLLBAR_COLORS.thumb,
    "scrollbarSlider.hoverBackground": SCROLLBAR_COLORS.thumbHover,
    "scrollbarSlider.activeBackground": SCROLLBAR_COLORS.thumbActive,
  };
}

/**
 * Publish the palette as CSS custom properties on the given root. Optional:
 * `theme.css` already defines these globally; use this only if you need to
 * (re)apply them to a detached root.
 */
export function applyScrollbarCssVars(
  root: HTMLElement = document.documentElement,
): void {
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumb, SCROLLBAR_COLORS.thumb);
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumbHover, SCROLLBAR_COLORS.thumbHover);
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumbActive, SCROLLBAR_COLORS.thumbActive);
  root.style.setProperty(SCROLLBAR_CSS_VARS.track, SCROLLBAR_COLORS.track);
}
