export type SandboxPreset = {
  id: string;
  label: string;
  description: string;
  overrides: Record<string, string>;
};

/** Global shape / radius ladder presets (Globals page). */
export const GLOBAL_SHAPE_PRESETS: SandboxPreset[] = [
  {
    id: "m3-aligned-radius",
    label: "M3 rounder",
    description: "Rounder M3-style ladder: md 12px (xs 4 · sm 8 · md 12 · lg 16 · xl 28).",
    overrides: {
      "--fynns-radius-xs": "4px",
      "--fynns-radius-sm": "8px",
      "--fynns-radius-md": "12px",
      "--fynns-radius-lg": "16px",
      "--fynns-radius-xl": "28px",
    },
  },
  {
    id: "restrained-radius",
    label: "Sharper",
    description: "Clearly tighter corners: md 4px (xs 2 · sm 3 · md 4 · lg 6 · xl 8).",
    overrides: {
      "--fynns-radius-xs": "2px",
      "--fynns-radius-sm": "3px",
      "--fynns-radius-md": "4px",
      "--fynns-radius-lg": "6px",
      "--fynns-radius-xl": "8px",
    },
  },
];

/** @deprecated Prefer GLOBAL_SHAPE_PRESETS. */
export const SANDBOX_PRESETS: SandboxPreset[] = [...GLOBAL_SHAPE_PRESETS];
