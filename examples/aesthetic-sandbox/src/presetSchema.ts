import type { CardVariant, FynnsThemeMode } from "@fynns/ui";

export const AESTHETIC_PRESET_VERSION = 1 as const;
export const AESTHETIC_PRESET_STORAGE_KEY = "fynns-card-aesthetic-preset-v1";

export const CARD_PRESET_VARS = {
  defaultVariant: "--fynns-card-default-variant",
  theme: "--fynns-card-sandbox-theme",
  elevationMode: "--fynns-card-elevation-mode",
  elevationStrength: "--fynns-card-elevation-elevated",
  draggedElevation: "--fynns-card-elevation-dragged",
  brightnessDelta: "--fynns-card-sandbox-brightness-delta",
  shadowOpacity: "--fynns-card-sandbox-shadow-opacity",
  radius: "--fynns-card-radius",
  mediaRadius: "--fynns-card-media-radius",
  padding: "--fynns-card-padding",
  compactPadding: "--fynns-card-padding-compact",
  margin: "--fynns-card-margin",
  actionsPaddingBlock: "--fynns-card-actions-padding-block",
  actionsPaddingInline: "--fynns-card-actions-padding-inline",
  borderWidth: "--fynns-card-border-width",
  borderColor: "--fynns-card-border-color",
  hoverLayer: "--fynns-card-state-layer-hover",
  focusLayer: "--fynns-card-state-layer-focus",
  pressedLayer: "--fynns-card-state-layer-pressed",
  rippleEnabled: "--fynns-card-sandbox-ripple-enabled",
  rippleOpacity: "--fynns-card-ripple-opacity",
  typographyMode: "--fynns-card-typography-mode",
  titleSize: "--fynns-card-title-size",
  bodySize: "--fynns-card-body-size",
  titleTransform: "--fynns-card-title-transform",
  panelTitleTransform: "--fynns-card-panel-title-transform",
  surfaceFilled: "--fynns-card-surface-filled",
  surfaceElevated: "--fynns-card-surface-elevated",
  surfaceOutlined: "--fynns-card-surface-outlined",
} as const;

export type CardPresetVariable = (typeof CARD_PRESET_VARS)[keyof typeof CARD_PRESET_VARS];
export type ElevationMode = "shadow" | "brightness" | "mixed";
export type TypographyMode = "m3" | "fynns";
export type TitleTransform = "none" | "uppercase";

export type AestheticPreset = {
  version: typeof AESTHETIC_PRESET_VERSION;
  label: string;
  vars: Record<string, string>;
};

export const DEFAULT_AESTHETIC_PRESET: AestheticPreset = {
  version: AESTHETIC_PRESET_VERSION,
  label: "fynns M3 baseline",
  vars: {
    [CARD_PRESET_VARS.defaultVariant]: "filled",
    [CARD_PRESET_VARS.theme]: "dark",
    [CARD_PRESET_VARS.elevationMode]: "mixed",
    [CARD_PRESET_VARS.elevationStrength]: "1",
    [CARD_PRESET_VARS.draggedElevation]: "8",
    [CARD_PRESET_VARS.brightnessDelta]: "3",
    [CARD_PRESET_VARS.shadowOpacity]: "48",
    [CARD_PRESET_VARS.radius]: "12px",
    [CARD_PRESET_VARS.mediaRadius]: "0px",
    [CARD_PRESET_VARS.padding]: "16px",
    [CARD_PRESET_VARS.compactPadding]: "12px",
    [CARD_PRESET_VARS.margin]: "8px",
    [CARD_PRESET_VARS.actionsPaddingBlock]: "8px",
    [CARD_PRESET_VARS.actionsPaddingInline]: "16px",
    [CARD_PRESET_VARS.borderWidth]: "1px",
    [CARD_PRESET_VARS.borderColor]: "var(--fynns-color-border-strong)",
    [CARD_PRESET_VARS.hoverLayer]: "0.08",
    [CARD_PRESET_VARS.focusLayer]: "0.12",
    [CARD_PRESET_VARS.pressedLayer]: "0.12",
    [CARD_PRESET_VARS.rippleEnabled]: "0",
    [CARD_PRESET_VARS.rippleOpacity]: "0.08",
    [CARD_PRESET_VARS.typographyMode]: "m3",
    [CARD_PRESET_VARS.titleSize]: "16px",
    [CARD_PRESET_VARS.bodySize]: "14px",
    [CARD_PRESET_VARS.titleTransform]: "none",
    [CARD_PRESET_VARS.panelTitleTransform]: "none",
    [CARD_PRESET_VARS.surfaceFilled]: "var(--fynns-color-surface-1)",
    [CARD_PRESET_VARS.surfaceElevated]: "var(--fynns-color-surface-1)",
    [CARD_PRESET_VARS.surfaceOutlined]: "var(--fynns-color-surface-1)",
  },
};

export const CARD_VARIANTS: CardVariant[] = ["filled", "elevated", "outlined", "panel"];
export const ELEVATION_MODES: ElevationMode[] = ["mixed", "shadow", "brightness"];
export const TYPOGRAPHY_MODES: TypographyMode[] = ["m3", "fynns"];
export const TITLE_TRANSFORMS: TitleTransform[] = ["none", "uppercase"];
export const THEME_MODES: FynnsThemeMode[] = ["dark", "light"];

export const SURFACE_OPTIONS = [
  { value: "var(--fynns-color-surface-1)", label: "Surface 1" },
  { value: "var(--fynns-color-surface-2)", label: "Surface 2" },
  { value: "var(--fynns-color-surface-3)", label: "Surface 3" },
] as const;

export const BORDER_OPTIONS = [
  { value: "var(--fynns-color-border)", label: "Border" },
  { value: "var(--fynns-color-border-strong)", label: "Strong border" },
  { value: "var(--fynns-color-accent-dim)", label: "Accent" },
] as const;

export function readPresetNumber(preset: AestheticPreset, variable: string, fallback: number) {
  const value = Number.parseFloat(preset.vars[variable] ?? "");
  return Number.isFinite(value) ? value : fallback;
}

export function readPresetVar(preset: AestheticPreset, variable: string, fallback: string) {
  return preset.vars[variable] ?? fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeCssValue(value: string) {
  const normalized = value.toLowerCase();
  return (
    value.length <= 256 &&
    !/[;{}<>]/.test(value) &&
    !normalized.includes("url(") &&
    !normalized.includes("expression(")
  );
}

export function normalizeAestheticPreset(value: unknown): AestheticPreset {
  if (!isRecord(value)) throw new Error("Preset must be a JSON object.");
  if (value.version !== AESTHETIC_PRESET_VERSION) {
    throw new Error(`Unsupported preset version. Expected ${AESTHETIC_PRESET_VERSION}.`);
  }
  if (typeof value.label !== "string" || value.label.trim().length === 0) {
    throw new Error("Preset label must be a non-empty string.");
  }
  if (!isRecord(value.vars)) throw new Error("Preset vars must be an object.");

  const vars: Record<string, string> = { ...DEFAULT_AESTHETIC_PRESET.vars };
  for (const [key, rawValue] of Object.entries(value.vars)) {
    if (!key.startsWith("--fynns-card-")) {
      throw new Error(`Unsupported variable: ${key}`);
    }
    if (typeof rawValue !== "string" || !isSafeCssValue(rawValue)) {
      throw new Error(`Invalid CSS value for ${key}.`);
    }
    vars[key] = rawValue;
  }

  return {
    version: AESTHETIC_PRESET_VERSION,
    label: value.label.trim(),
    vars,
  };
}

export function cloneDefaultPreset(): AestheticPreset {
  return {
    ...DEFAULT_AESTHETIC_PRESET,
    vars: { ...DEFAULT_AESTHETIC_PRESET.vars },
  };
}
