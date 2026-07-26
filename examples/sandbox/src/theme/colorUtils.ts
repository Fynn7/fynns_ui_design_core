/** Tiny color helpers for sandbox surface brightness knobs (no free-form picker). */

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
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
