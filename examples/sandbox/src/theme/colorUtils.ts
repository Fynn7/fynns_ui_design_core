/** Tiny color helpers for sandbox surface / accent knobs. */

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Normalize `#rgb` / `#rrggbb` / `rrggbb` → `#rrggbb`, or null if invalid. */
export function normalizeHex(value: string): string | null {
  const raw = value.trim();
  const short = raw.match(/^#?([0-9a-f]{3})$/i);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const full = raw.match(/^#?([0-9a-f]{6})$/i);
  if (!full) return null;
  return `#${full[1].toLowerCase()}`;
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Mix `hex` toward white (positive delta) or black (negative). Delta is roughly -40..+40. */
export function shiftHexBrightness(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb || delta === 0) return hex;
  const target: [number, number, number] = delta > 0 ? [255, 255, 255] : [0, 0, 0];
  const t = Math.min(1, Math.abs(delta) / 100);
  return toHex(
    rgb[0] + (target[0] - rgb[0]) * t,
    rgb[1] + (target[1] - rgb[1]) * t,
    rgb[2] + (target[2] - rgb[2]) * t,
  );
}

/** Estimate brightness delta of `current` vs `baseline` (-40..+40). */
export function estimateBrightnessDelta(baseline: string, current: string): number {
  const a = hexToRgb(baseline);
  const b = hexToRgb(current);
  if (!a || !b) return 0;
  const la = (a[0] + a[1] + a[2]) / 3;
  const lb = (b[0] + b[1] + b[2]) / 3;
  const diff = lb - la;
  // Map ~0..255 channel delta into -40..+40 slider space (heuristic).
  return Math.max(-40, Math.min(40, Math.round((diff / 255) * 100)));
}

/** sRGB hex → HSL hue degrees (0–360), or null if not a hex color. */
export function approxHueFromHex(value: string): number | null {
  const rgb = hexToRgb(value);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return h * 360;
}

/** HSL (h 0–360, s/l 0–100) → `#rrggbb`. */
export function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return toHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/**
 * Pointer angle relative to element center → hue degrees.
 * Matches CSS `conic-gradient` (0° at 12 o'clock, clockwise).
 */
export function hueFromPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(clientY - cy, clientX - cx);
  return (((angle * 180) / Math.PI + 90) % 360 + 360) % 360;
}
