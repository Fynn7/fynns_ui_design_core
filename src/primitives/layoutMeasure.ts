/**
 * Destination geometry (CONTEXT.md): resolve layout CSS lengths without
 * inserting measure probes under a host watched by `MutationObserver`
 * (ClippedNavShell crowding — see llm/PERF.md).
 */

function hostFontSizePx(host: Element): number {
  const n = Number.parseFloat(getComputedStyle(host).fontSize);
  return Number.isFinite(n) && n > 0 ? n : 16;
}

function hostWidthPx(host: Element): number {
  return host instanceof HTMLElement
    ? host.clientWidth
    : host.getBoundingClientRect().width;
}

/**
 * Resolve a CSS length used by layout tokens (`px` / `rem` / `%` / `clamp()`)
 * without inserting probe nodes into `host`.
 */
export function resolveLengthPx(host: Element, raw: string): number {
  const v = raw.trim();
  if (!v) return 0;
  if (v.endsWith("px")) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (v.endsWith("rem")) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n * hostFontSizePx(host) : 0;
  }
  if (v.endsWith("%")) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? (hostWidthPx(host) * n) / 100 : 0;
  }
  const clampMatch = /^clamp\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)$/i.exec(v);
  if (clampMatch) {
    const min = resolveLengthPx(host, clampMatch[1]);
    const preferred = resolveLengthPx(host, clampMatch[2]);
    const max = resolveLengthPx(host, clampMatch[3]);
    return Math.min(max, Math.max(min, preferred));
  }
  /* Exotic `calc()` etc.: measure under body, never under an observed shell. */
  const box = document.createElement("div");
  box.style.cssText =
    "position:absolute;left:-99999px;top:0;height:0;overflow:hidden;" +
    "visibility:hidden;pointer-events:none;font-size:" +
    hostFontSizePx(host) +
    "px;width:" +
    hostWidthPx(host) +
    "px";
  const probe = document.createElement("div");
  probe.style.cssText = "height:0;width:" + v;
  box.appendChild(probe);
  document.body.appendChild(box);
  const w = probe.getBoundingClientRect().width;
  box.remove();
  return w;
}

/** Resolve a CSS custom-property length (rem / clamp / px) to CSS pixels. */
export function readVarPx(host: Element, varName: string): number {
  const raw = getComputedStyle(host).getPropertyValue(varName).trim();
  return resolveLengthPx(host, raw);
}

export function readRemPx(host: Element, rem: number): number {
  return rem * hostFontSizePx(host);
}
