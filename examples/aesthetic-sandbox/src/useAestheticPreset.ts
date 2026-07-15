import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyFynnsThemeMode,
  type CardVariant,
  type FynnsThemeMode,
} from "@fynns/ui";
import {
  AESTHETIC_PRESET_STORAGE_KEY,
  CARD_PRESET_VARS,
  CARD_VARIANTS,
  cloneDefaultPreset,
  normalizeAestheticPreset,
  readPresetNumber,
  readPresetVar,
  type AestheticPreset,
  type ElevationMode,
  type TypographyMode,
} from "./presetSchema";

function loadStoredPreset() {
  if (typeof window === "undefined") return cloneDefaultPreset();
  const stored = window.localStorage.getItem(AESTHETIC_PRESET_STORAGE_KEY);
  if (!stored) return cloneDefaultPreset();
  try {
    return normalizeAestheticPreset(JSON.parse(stored));
  } catch {
    window.localStorage.removeItem(AESTHETIC_PRESET_STORAGE_KEY);
    return cloneDefaultPreset();
  }
}

function buildShadow(level: number, opacity: number) {
  if (level <= 0) return "none";
  const offset = Math.max(1, Math.round(level / 2));
  const blur = Math.max(2, Math.round(level * 3));
  return `0 ${offset}px ${blur}px color-mix(in srgb, var(--fynns-color-overlay) ${opacity}%, transparent)`;
}

function isCardVariant(value: string): value is CardVariant {
  return CARD_VARIANTS.some((variant) => variant === value);
}

export function useAestheticPreset() {
  const [preset, setPreset] = useState<AestheticPreset>(loadStoredPreset);
  const appliedVariables = useRef<Set<string>>(new Set());

  useEffect(() => {
    const root = document.documentElement;

    for (const variable of appliedVariables.current) {
      if (!(variable in preset.vars)) root.style.removeProperty(variable);
    }
    for (const [variable, value] of Object.entries(preset.vars)) {
      root.style.setProperty(variable, value);
    }
    appliedVariables.current = new Set(Object.keys(preset.vars));

    const typographyMode = readPresetVar(
      preset,
      CARD_PRESET_VARS.typographyMode,
      "m3",
    ) as TypographyMode;
    root.dataset.fynnsCardTypographyMode = typographyMode;
    if (typographyMode === "fynns") {
      root.style.setProperty("--fynns-card-title-font", "var(--fynns-font-ui)");
      root.style.setProperty("--fynns-card-title-weight", "var(--fynns-font-weight-title)");
      root.style.setProperty("--fynns-card-title-line-height", "var(--fynns-line-height-snug)");
      root.style.setProperty("--fynns-card-title-tracking", "var(--fynns-letter-spacing-subtle)");
      root.style.setProperty("--fynns-card-body-font", "var(--fynns-font-ui)");
      root.style.setProperty("--fynns-card-body-weight", "var(--fynns-font-weight-regular)");
      root.style.setProperty("--fynns-card-body-line-height", "var(--fynns-line-height-body)");
      root.style.setProperty("--fynns-card-body-tracking", "var(--fynns-letter-spacing-subtle)");
    } else {
      root.style.setProperty(
        "--fynns-card-title-font",
        "var(--fynns-typography-role-title-medium-font)",
      );
      root.style.setProperty(
        "--fynns-card-title-weight",
        "var(--fynns-typography-role-title-medium-weight)",
      );
      root.style.setProperty(
        "--fynns-card-title-line-height",
        "var(--fynns-typography-role-title-medium-line-height)",
      );
      root.style.setProperty(
        "--fynns-card-title-tracking",
        "var(--fynns-typography-role-title-medium-tracking)",
      );
      root.style.setProperty(
        "--fynns-card-body-font",
        "var(--fynns-typography-role-body-medium-font)",
      );
      root.style.setProperty(
        "--fynns-card-body-weight",
        "var(--fynns-typography-role-body-medium-weight)",
      );
      root.style.setProperty(
        "--fynns-card-body-line-height",
        "var(--fynns-typography-role-body-medium-line-height)",
      );
      root.style.setProperty(
        "--fynns-card-body-tracking",
        "var(--fynns-typography-role-body-medium-tracking)",
      );
    }

    const theme = readPresetVar(preset, CARD_PRESET_VARS.theme, "dark") as FynnsThemeMode;
    applyFynnsThemeMode(theme);

    const elevationMode = readPresetVar(
      preset,
      CARD_PRESET_VARS.elevationMode,
      "mixed",
    ) as ElevationMode;
    const elevation = readPresetNumber(preset, CARD_PRESET_VARS.elevationStrength, 1);
    const draggedElevation = readPresetNumber(preset, CARD_PRESET_VARS.draggedElevation, 8);
    const brightnessDelta = readPresetNumber(preset, CARD_PRESET_VARS.brightnessDelta, 3);
    const shadowOpacity = readPresetNumber(preset, CARD_PRESET_VARS.shadowOpacity, 48);
    const elevatedSurface = readPresetVar(
      preset,
      CARD_PRESET_VARS.surfaceElevated,
      "var(--fynns-color-surface-1)",
    );

    const usesShadow = elevationMode === "shadow" || elevationMode === "mixed";
    const usesBrightness = elevationMode === "brightness" || elevationMode === "mixed";
    root.style.setProperty(
      "--fynns-card-shadow-elevated",
      usesShadow ? buildShadow(elevation, shadowOpacity) : "none",
    );
    root.style.setProperty(
      "--fynns-card-shadow-hover",
      usesShadow ? buildShadow(elevation + 2, shadowOpacity) : "none",
    );
    root.style.setProperty(
      "--fynns-card-shadow-dragged",
      usesShadow ? buildShadow(draggedElevation, shadowOpacity) : "none",
    );
    root.style.setProperty(
      "--fynns-card-surface-elevated",
      usesBrightness && brightnessDelta > 0
        ? `color-mix(in srgb, var(--fynns-color-accent) ${brightnessDelta}%, ${elevatedSurface})`
        : elevatedSurface,
    );

    const rippleEnabled =
      readPresetVar(preset, CARD_PRESET_VARS.rippleEnabled, "0") === "1";
    root.style.setProperty(
      "--fynns-card-ripple-opacity",
      rippleEnabled
        ? readPresetVar(preset, CARD_PRESET_VARS.rippleOpacity, "0.08")
        : "0",
    );

    window.localStorage.setItem(AESTHETIC_PRESET_STORAGE_KEY, JSON.stringify(preset));
  }, [preset]);

  const setVariable = useCallback((variable: string, value: string) => {
    setPreset((current) => ({
      ...current,
      vars: { ...current.vars, [variable]: value },
    }));
  }, []);

  const setLabel = useCallback((label: string) => {
    setPreset((current) => ({ ...current, label }));
  }, []);

  const replacePreset = useCallback((nextPreset: AestheticPreset) => {
    setPreset(normalizeAestheticPreset(nextPreset));
  }, []);

  const resetPreset = useCallback(() => {
    setPreset(cloneDefaultPreset());
  }, []);

  const snapshotPreset = useCallback(
    (label = preset.label): AestheticPreset => {
      const root = document.documentElement;
      const computed = window.getComputedStyle(root);
      const vars: Record<string, string> = {};
      for (let index = 0; index < computed.length; index += 1) {
        const variable = computed.item(index);
        if (!variable.startsWith("--fynns-card-")) continue;
        const value = computed.getPropertyValue(variable).trim();
        if (value) vars[variable] = value;
      }
      // Source controls win over derived runtime values so an export/import
      // round-trip does not apply tonal lift or shadow derivation twice.
      Object.assign(vars, preset.vars);
      return normalizeAestheticPreset({
        version: preset.version,
        label,
        vars,
      });
    },
    [preset],
  );

  const defaultVariant = useMemo(() => {
    const value = readPresetVar(preset, CARD_PRESET_VARS.defaultVariant, "filled");
    return isCardVariant(value) ? value : "filled";
  }, [preset]);

  const theme = readPresetVar(preset, CARD_PRESET_VARS.theme, "dark") as FynnsThemeMode;

  return {
    preset,
    defaultVariant,
    theme,
    setVariable,
    setLabel,
    replacePreset,
    resetPreset,
    snapshotPreset,
  };
}

export type AestheticPresetController = ReturnType<typeof useAestheticPreset>;
