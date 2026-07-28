export type SandboxPreset = {
  id: string;
  label: string;
  description: string;
  overrides: Record<string, string>;
};

/**
 * Named token bundles for the Templates JSON flow.
 * Radius is tuned with the Globals level sliders + Save as template — no
 * built-in shape preset dropdown.
 */
export const SANDBOX_PRESETS: SandboxPreset[] = [];
