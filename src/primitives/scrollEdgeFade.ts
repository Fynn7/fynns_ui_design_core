/**
 * Soft scroll-edge fade for every core scroll host, with caret-safe paths for
 * Textarea, ChatComposer and editable CodeBlock.
 *
 * Fixed overlay scrollbars live in a portal and ignore host overflow. Edge
 * fade is a CSS `mask-image` driven by `data-fade-top` / `data-fade-bottom`
 * (block axis) and `data-fade-left` / `data-fade-right` (inline axis) so hard
 * clips read as soft gradients into the well (Cursor-style).
 * The overlay scrollbar manager syncs all non-replaced `.fynns-scroll` hosts;
 * canvas-capped FillColumn `header` also syncs directly. `.fynns-table-wrap`
 * gets inline-axis fade when
 * columns overflow (≥ **0.5.296** — live `#table`). Masks keep the outer
 * hairline opaque on Textarea (≥ **0.5.282**) so borders are not erased with
 * the fade. Editable CodeBlock: never mask `.fynns-code-block-input` — fade
 * the highlight twin via `syncScrollEdgeFadeOnto` (≥ **0.5.299**) so
 * Chromium `::selection` stays locked to the scrolling caret host.
 */

const FADE_ATTRS = [
  "data-fade-top",
  "data-fade-bottom",
  "data-fade-left",
  "data-fade-right",
] as const;

function writeScrollEdgeFadeAttrs(
  target: HTMLElement,
  metrics: {
    scrollTop: number;
    scrollLeft: number;
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
  },
  axes: { y: boolean; x: boolean },
): void {
  const maxY = axes.y ? Math.max(0, metrics.scrollHeight - metrics.clientHeight) : 0;
  const canDown = maxY > 1 && metrics.scrollTop < maxY - 1;
  const canUp = maxY > 1 && metrics.scrollTop > 1;
  if (canDown) target.setAttribute("data-fade-bottom", "");
  else target.removeAttribute("data-fade-bottom");
  if (canUp) target.setAttribute("data-fade-top", "");
  else target.removeAttribute("data-fade-top");

  const maxX = axes.x ? Math.max(0, metrics.scrollWidth - metrics.clientWidth) : 0;
  /* Use absolute scrollLeft so RTL / negative-scroll engines still gate. */
  const left = Math.abs(metrics.scrollLeft);
  const canRight = maxX > 1 && left < maxX - 1;
  const canLeft = maxX > 1 && left > 1;
  if (canRight) target.setAttribute("data-fade-right", "");
  else target.removeAttribute("data-fade-right");
  if (canLeft) target.setAttribute("data-fade-left", "");
  else target.removeAttribute("data-fade-left");
}

export function syncScrollEdgeFade(el: HTMLElement): void {
  writeScrollEdgeFadeAttrs(el, el, scrollableAxes(el));
}

function scrollableAxes(el: HTMLElement): { y: boolean; x: boolean } {
  const css = getComputedStyle(el);
  const canScroll = (overflow: string) =>
    overflow === "auto" || overflow === "scroll" || overflow === "overlay";
  return { y: canScroll(css.overflowY), x: canScroll(css.overflowX) };
}

/**
 * Apply fade attrs to `target` using another element's scroll metrics.
 * Editable CodeBlock: metrics from the transparent textarea, attrs on the
 * visible highlight twin only — never mask the textarea (Chromium sticks
 * `::selection` in viewport space under `mask-image` while scrollTop moves).
 */
export function syncScrollEdgeFadeOnto(
  metricsEl: HTMLElement,
  target: HTMLElement,
): void {
  writeScrollEdgeFadeAttrs(target, metricsEl, scrollableAxes(metricsEl));
}

/** Mirror fade attrs onto a scroll-synced twin (editable CodeBlock highlight). */
export function copyScrollEdgeFadeAttrs(
  from: HTMLElement,
  to: HTMLElement,
): void {
  for (const attr of FADE_ATTRS) {
    if (from.hasAttribute(attr)) to.setAttribute(attr, "");
    else to.removeAttribute(attr);
  }
}

export function clearScrollEdgeFade(el: HTMLElement): void {
  el.removeAttribute("data-fade-top");
  el.removeAttribute("data-fade-bottom");
  el.removeAttribute("data-fade-left");
  el.removeAttribute("data-fade-right");
}
