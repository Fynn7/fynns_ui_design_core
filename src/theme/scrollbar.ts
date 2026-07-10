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

/** Authoritative scrollbar palette (hex; equals `--fynns-scrollbar-*` dark). */
export const SCROLLBAR_COLORS = {
  thumb: "#6a90955b",
  thumbHover: "#169fb162",
  thumbActive: "#169fb1ad",
  track: "transparent",
} as const;

/** Light-theme scrollbar palette (hex; equals light `--fynns-scrollbar-*`). */
export const SCROLLBAR_COLORS_LIGHT = {
  thumb: "#5a7a7459",
  thumbHover: "#0d948873",
  thumbActive: "#0d9488a6",
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
export function monacoScrollbarColors(light = false): Record<string, string> {
  const palette = light ? SCROLLBAR_COLORS_LIGHT : SCROLLBAR_COLORS;
  return {
    "scrollbarSlider.background": palette.thumb,
    "scrollbarSlider.hoverBackground": palette.thumbHover,
    "scrollbarSlider.activeBackground": palette.thumbActive,
  };
}

/**
 * Publish the palette as CSS custom properties on the given root. Optional:
 * `theme.css` already defines these globally; use this only if you need to
 * (re)apply them to a detached root.
 */
export function applyScrollbarCssVars(
  root: HTMLElement = document.documentElement,
  light = false,
): void {
  const palette = light ? SCROLLBAR_COLORS_LIGHT : SCROLLBAR_COLORS;
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumb, palette.thumb);
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumbHover, palette.thumbHover);
  root.style.setProperty(SCROLLBAR_CSS_VARS.thumbActive, palette.thumbActive);
  root.style.setProperty(SCROLLBAR_CSS_VARS.track, palette.track);
}
