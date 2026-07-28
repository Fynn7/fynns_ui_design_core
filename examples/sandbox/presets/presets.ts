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
    label: "M3-aligned radius",
    description: "Push radius-md toward M3 medium (12px) and expand the shape ladder.",
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
    label: "Restrained radius",
    description: "Slightly tighter corners than current baseline.",
    overrides: {
      "--fynns-radius-md": "6px",
      "--fynns-radius-lg": "8px",
    },
  },
];

/** @deprecated Prefer GLOBAL_SHAPE_PRESETS. */
export const SANDBOX_PRESETS: SandboxPreset[] = [...GLOBAL_SHAPE_PRESETS];
