/**
 * Soft scroll-edge fade (NavigationDrawer / CodeBlock / Textarea / PageScroll /
 * FillColumn header / Table wrap).
 *
 * Fixed overlay scrollbars live in a portal and ignore host overflow. Edge
 * fade is a CSS `mask-image` driven by `data-fade-top` / `data-fade-bottom`
 * (block axis) and `data-fade-left` / `data-fade-right` (inline axis) so hard
 * clips read as soft gradients into the well (Cursor-style).
 * PageScroll hosts sync mid-scroll (≥ **0.5.247**); canvas-capped FillColumn
 * `header` ≥ **0.5.278**. `.fynns-table-wrap` gets inline-axis fade when
 * columns overflow (≥ **0.5.296** — live `#table`). Masks keep the outer
 * hairline opaque on Textarea (≥ **0.5.282**) so borders are not erased with
 * the fade.
 */

export function syncScrollEdgeFade(el: HTMLElement): void {
  const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
  const canDown = maxY > 1 && el.scrollTop < maxY - 1;
  const canUp = maxY > 1 && el.scrollTop > 1;
  if (canDown) el.setAttribute("data-fade-bottom", "");
  else el.removeAttribute("data-fade-bottom");
  if (canUp) el.setAttribute("data-fade-top", "");
  else el.removeAttribute("data-fade-top");

  const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
  /* Use absolute scrollLeft so RTL / negative-scroll engines still gate. */
  const left = Math.abs(el.scrollLeft);
  const canRight = maxX > 1 && left < maxX - 1;
  const canLeft = maxX > 1 && left > 1;
  if (canRight) el.setAttribute("data-fade-right", "");
  else el.removeAttribute("data-fade-right");
  if (canLeft) el.setAttribute("data-fade-left", "");
  else el.removeAttribute("data-fade-left");
}

/** Mirror fade attrs onto a scroll-synced twin (editable CodeBlock highlight). */
export function copyScrollEdgeFadeAttrs(
  from: HTMLElement,
  to: HTMLElement,
): void {
  for (const attr of [
    "data-fade-top",
    "data-fade-bottom",
    "data-fade-left",
    "data-fade-right",
  ] as const) {
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
