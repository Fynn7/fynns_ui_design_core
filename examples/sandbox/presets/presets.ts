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

/** Card Playground presets (non-shape). */
export const CARD_PRESETS: SandboxPreset[] = [
  {
    id: "stronger-elevation",
    label: "Stronger elevation",
    description: "Emphasize elevated cards with a deeper resting shadow.",
    overrides: {
      "--fynns-shadow-xs": "0 2px 6px rgba(0, 0, 0, 0.32)",
    },
  },
  {
    id: "softer-state-layers",
    label: "Softer state layers",
    description: "Dial back interactive overlay opacities.",
    overrides: {
      "--fynns-state-hover": "6%",
      "--fynns-state-focus": "8%",
      "--fynns-state-pressed": "10%",
      "--fynns-state-dragged": "14%",
    },
  },
];

/** @deprecated Prefer CARD_PRESETS or GLOBAL_SHAPE_PRESETS. */
export const SANDBOX_PRESETS: SandboxPreset[] = [...GLOBAL_SHAPE_PRESETS, ...CARD_PRESETS];
