/**
 * Soft scroll-edge fade (NavigationDrawer / CodeBlock / Textarea).
 *
 * Fixed overlay scrollbars live in a portal and ignore host overflow. Edge
 * fade is a CSS `mask-image` driven by `data-fade-top` / `data-fade-bottom`
 * so hard clips read as soft gradient into the well (Cursor-style).
 */

export function syncScrollEdgeFade(el: HTMLElement): void {
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  const canDown = max > 1 && el.scrollTop < max - 1;
  const canUp = max > 1 && el.scrollTop > 1;
  if (canDown) el.setAttribute("data-fade-bottom", "");
  else el.removeAttribute("data-fade-bottom");
  if (canUp) el.setAttribute("data-fade-top", "");
  else el.removeAttribute("data-fade-top");
}

/** Mirror fade attrs onto a scroll-synced twin (editable CodeBlock highlight). */
export function copyScrollEdgeFadeAttrs(
  from: HTMLElement,
  to: HTMLElement,
): void {
  if (from.hasAttribute("data-fade-top")) to.setAttribute("data-fade-top", "");
  else to.removeAttribute("data-fade-top");
  if (from.hasAttribute("data-fade-bottom")) {
    to.setAttribute("data-fade-bottom", "");
  } else {
    to.removeAttribute("data-fade-bottom");
  }
}

export function clearScrollEdgeFade(el: HTMLElement): void {
  el.removeAttribute("data-fade-top");
  el.removeAttribute("data-fade-bottom");
}
