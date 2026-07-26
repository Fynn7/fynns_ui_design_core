import { useMemo } from "react";
import { Slider } from "@fynns/ui";
import { useTokenDraft } from "../state/TokenDraftProvider";

/**
 * Hue ring for the OKLCH teal system: shift accent (+ derived soft/mid/ring)
 * while keeping the surface ladder's hue family coherent.
 *
 * Surfaces stay on the committed ladder; only accent-family tokens are shifted
 * so the brand stays coordinated without free-form hex picking.
 */
export function HueWheel() {
  const { apply, resolved } = useTokenDraft();

  const hue = useMemo(() => {
    // Encode current accent as a synthetic hue angle for the slider (0–360).
    // Baseline teal sits near 168° in sRGB HSL for #2dd4bf.
    const accent = resolved("--fynns-color-accent");
    return approxHueFromHex(accent) ?? 168;
  }, [resolved]);

  const setHue = (nextHue: number) => {
    const accent = hslToHex(nextHue, 62, 50);
    const dim = hslToHex(nextHue, 62, 40);
    const hover = hslToHex(nextHue, 64, 54);
    const active = hslToHex(nextHue, 60, 46);
    const rgb = hexToRgb(accent);
    if (!rgb) return;
    const [r, g, b] = rgb;
    apply({ group: "color", key: "accent", value: accent, source: "colorwheel" });
    apply({ group: "color", key: "accent-dim", value: dim, source: "colorwheel" });
    apply({ group: "color", key: "accent-hover", value: hover, source: "colorwheel" });
    apply({ group: "color", key: "accent-active", value: active, source: "colorwheel" });
    apply({
      group: "color",
      key: "accent-soft",
      value: `rgba(${r}, ${g}, ${b}, 0.18)`,
      source: "colorwheel",
    });
    apply({
      group: "color",
      key: "accent-mid",
      value: `rgba(${r}, ${g}, ${b}, 0.5)`,
      source: "colorwheel",
    });
    apply({
      group: "color",
      key: "accent-24",
      value: `rgba(${r}, ${g}, ${b}, 0.24)`,
      source: "colorwheel",
    });
    apply({
      group: "color",
      key: "accent-42",
      value: `rgba(${r}, ${g}, ${b}, 0.42)`,
      source: "colorwheel",
    });
    apply({
      group: "color",
      key: "accent-ring",
      value: `rgba(${r}, ${g}, ${b}, 0.4)`,
      source: "colorwheel",
    });
    apply({
      group: "color",
      key: "focus",
      value: `rgba(${r}, ${g}, ${b}, 0.48)`,
      source: "colorwheel",
    });
  };

  return (
    <div className="sandbox-hue-wheel">
      <div
        className="sandbox-hue-swatch"
        style={{ background: `hsl(${hue} 62% 50%)` }}
        aria-hidden
      />
      <div className="sandbox-hue-meta">
        <span>Accent hue</span>
        <code>{Math.round(hue)}°</code>
      </div>
      <Slider
        value={Math.round(hue)}
        min={0}
        max={360}
        step={1}
        ariaLabel="Accent hue"
        onChange={setHue}
      />
    </div>
  );
}

function approxHueFromHex(value: string): number | null {
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

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hslToHex(h: number, s: number, l: number): string {
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
