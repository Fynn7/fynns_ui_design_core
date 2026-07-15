import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  ScrollArea,
  Select,
  Switch,
  ToggleGroup,
} from "@fynns/ui";
import {
  BORDER_OPTIONS,
  CARD_PRESET_VARS,
  CARD_VARIANTS,
  ELEVATION_MODES,
  SURFACE_OPTIONS,
  TITLE_TRANSFORMS,
  TYPOGRAPHY_MODES,
  readPresetVar,
  type ElevationMode,
  type TitleTransform,
  type TypographyMode,
} from "./presetSchema";
import type { AestheticPresetController } from "./useAestheticPreset";
import { ControlSection } from "./components/ControlSection";
import { PresetIO } from "./components/PresetIO";
import { TokenSlider } from "./components/TokenSlider";

type ControlsPanelProps = {
  controller: AestheticPresetController;
};

export function ControlsPanel({ controller }: ControlsPanelProps) {
  const {
    preset,
    defaultVariant,
    theme,
    setVariable,
    setLabel,
    replacePreset,
    resetPreset,
    snapshotPreset,
  } = controller;

  const sliderProps = {
    preset,
    onChange: setVariable,
  };

  const elevationMode = readPresetVar(
    preset,
    CARD_PRESET_VARS.elevationMode,
    "mixed",
  ) as ElevationMode;
  const typographyMode = readPresetVar(
    preset,
    CARD_PRESET_VARS.typographyMode,
    "m3",
  ) as TypographyMode;
  const titleTransform = readPresetVar(
    preset,
    CARD_PRESET_VARS.titleTransform,
    "none",
  ) as TitleTransform;
  const rippleEnabled =
    readPresetVar(preset, CARD_PRESET_VARS.rippleEnabled, "0") === "1";

  return (
    <Card variant={defaultVariant} className="fynns-sandbox-controls">
      <CardHeader
        title="Aesthetic controls"
        subheader={preset.label}
        titleAs="h2"
        action={
          <Button size="sm" onClick={resetPreset}>
            Reset
          </Button>
        }
      />
      <CardContent padding="none" className="fynns-sandbox-controls-body">
        <ScrollArea className="fynns-sandbox-controls-scroll">
          <div className="fynns-sandbox-control-sections">
            <ControlSection
              title="Preset and preview"
              description="The control chrome consumes the same card variables as the preview."
              variant={defaultVariant}
            >
              <label className="fynns-sandbox-field-label" htmlFor="preset-label">
                Preset label
              </label>
              <Input
                id="preset-label"
                value={preset.label}
                onChange={(event) => setLabel(event.currentTarget.value)}
              />
              <span className="fynns-sandbox-field-label">Default card variant</span>
              <ToggleGroup
                fullWidth
                ariaLabel="Default card variant"
                value={defaultVariant}
                options={CARD_VARIANTS.map((variant) => ({
                  value: variant,
                  label: `${variant[0].toUpperCase()}${variant.slice(1)}`,
                }))}
                onChange={(variant) => setVariable(CARD_PRESET_VARS.defaultVariant, variant)}
              />
              <Switch
                label="Light theme"
                checked={theme === "light"}
                onCheckedChange={(checked) =>
                  setVariable(CARD_PRESET_VARS.theme, checked ? "light" : "dark")
                }
              />
            </ControlSection>

            <ControlSection
              title="Elevation"
              description="Compare tonal brightness, shadow elevation, or a restrained mix."
              variant={defaultVariant}
            >
              <ToggleGroup
                fullWidth
                ariaLabel="Elevation mode"
                value={elevationMode}
                options={ELEVATION_MODES.map((mode) => ({
                  value: mode,
                  label: `${mode[0].toUpperCase()}${mode.slice(1)}`,
                }))}
                onChange={(mode) => setVariable(CARD_PRESET_VARS.elevationMode, mode)}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.elevationStrength}
                label="Resting shadow"
                min={0}
                max={12}
                step={1}
                fallback={1}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.brightnessDelta}
                label="Tonal lift"
                min={0}
                max={16}
                step={1}
                fallback={3}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.draggedElevation}
                label="Dragged lift"
                min={0}
                max={24}
                step={1}
                fallback={8}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.shadowOpacity}
                label="Shadow opacity"
                min={0}
                max={100}
                step={1}
                fallback={48}
              />
            </ControlSection>

            <ControlSection
              title="Shape"
              description="M3 starts at a 12px medium corner; media can stay square or become inset."
              variant={defaultVariant}
            >
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.radius}
                label="Container radius"
                min={0}
                max={32}
                step={1}
                fallback={12}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.mediaRadius}
                label="Media radius"
                min={0}
                max={32}
                step={1}
                fallback={0}
                unit="px"
              />
            </ControlSection>

            <ControlSection
              title="Spacing"
              description="Tune information density without introducing empty marketing-page space."
              variant={defaultVariant}
            >
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.padding}
                label="Content padding"
                min={8}
                max={32}
                step={1}
                fallback={16}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.compactPadding}
                label="Compact padding"
                min={4}
                max={24}
                step={1}
                fallback={12}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.actionsPaddingBlock}
                label="Actions block padding"
                min={0}
                max={24}
                step={1}
                fallback={8}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.actionsPaddingInline}
                label="Actions inline padding"
                min={0}
                max={32}
                step={1}
                fallback={16}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.margin}
                label="Collection gap"
                min={0}
                max={24}
                step={1}
                fallback={8}
                unit="px"
              />
            </ControlSection>

            <ControlSection
              title="Border"
              description="Outlined cards use a visible boundary without becoming a flat wireframe."
              variant={defaultVariant}
            >
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.borderWidth}
                label="Outline width"
                min={0}
                max={4}
                step={1}
                fallback={1}
                unit="px"
              />
              <label className="fynns-sandbox-field-label" htmlFor="border-color">
                Outline color
              </label>
              <Select
                value={readPresetVar(
                  preset,
                  CARD_PRESET_VARS.borderColor,
                  "var(--fynns-color-border-strong)",
                )}
                options={[...BORDER_OPTIONS]}
                ariaLabel="Outline color"
                onChange={(value) => setVariable(CARD_PRESET_VARS.borderColor, value)}
              />
            </ControlSection>

            <ControlSection
              title="State layer"
              description="M3 defaults are 8% hover and 12% focus/pressed."
              variant={defaultVariant}
            >
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.hoverLayer}
                label="Hover opacity"
                min={0}
                max={0.24}
                step={0.01}
                fallback={0.08}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.focusLayer}
                label="Focus opacity"
                min={0}
                max={0.24}
                step={0.01}
                fallback={0.12}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.pressedLayer}
                label="Pressed opacity"
                min={0}
                max={0.24}
                step={0.01}
                fallback={0.12}
              />
            </ControlSection>

            <ControlSection
              title="Ripple"
              description="Disabled by default; enable it to compare a restrained contained ripple."
              variant={defaultVariant}
            >
              <Switch
                label="Enable ripple"
                checked={rippleEnabled}
                onCheckedChange={(checked) =>
                  setVariable(CARD_PRESET_VARS.rippleEnabled, checked ? "1" : "0")
                }
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.rippleOpacity}
                label="Ripple opacity"
                min={0}
                max={0.24}
                step={0.01}
                fallback={0.08}
              />
            </ControlSection>

            <ControlSection
              title="Typography"
              description="Compare M3 roles with the compact fynns scale. Titles stay sentence case by default."
              variant={defaultVariant}
            >
              <ToggleGroup
                fullWidth
                ariaLabel="Typography mode"
                value={typographyMode}
                options={TYPOGRAPHY_MODES.map((mode) => ({
                  value: mode,
                  label: mode === "m3" ? "Material 3" : "fynns",
                }))}
                onChange={(mode) => setVariable(CARD_PRESET_VARS.typographyMode, mode)}
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.titleSize}
                label="Title size"
                min={12}
                max={28}
                step={1}
                fallback={16}
                unit="px"
              />
              <TokenSlider
                {...sliderProps}
                variable={CARD_PRESET_VARS.bodySize}
                label="Body size"
                min={11}
                max={22}
                step={1}
                fallback={14}
                unit="px"
              />
              <ToggleGroup
                fullWidth
                ariaLabel="Title transform"
                value={titleTransform}
                options={TITLE_TRANSFORMS.map((transform) => ({
                  value: transform,
                  label: transform === "none" ? "Sentence case" : "Uppercase",
                }))}
                onChange={(transform) => {
                  setVariable(CARD_PRESET_VARS.titleTransform, transform);
                  setVariable(CARD_PRESET_VARS.panelTitleTransform, transform);
                }}
              />
            </ControlSection>

            <ControlSection
              title="Surfaces"
              description="Choose each variant's resting surface independently."
              variant={defaultVariant}
            >
              {[
                [CARD_PRESET_VARS.surfaceFilled, "Filled surface"],
                [CARD_PRESET_VARS.surfaceElevated, "Elevated surface"],
                [CARD_PRESET_VARS.surfaceOutlined, "Outlined surface"],
              ].map(([variable, label]) => (
                <div key={variable} className="fynns-sandbox-control-stack">
                  <label className="fynns-sandbox-field-label" htmlFor={`surface-${variable}`}>
                    {label}
                  </label>
                  <Select
                    value={readPresetVar(
                      preset,
                      variable,
                      "var(--fynns-color-surface-1)",
                    )}
                    options={[...SURFACE_OPTIONS]}
                    ariaLabel={label}
                    onChange={(value) => setVariable(variable, value)}
                  />
                </div>
              ))}
            </ControlSection>

            <ControlSection
              title="Preset JSON"
              description="Import and export runtime CSS-variable backups. Source tokens are never edited."
              variant={defaultVariant}
            >
              <PresetIO
                preset={preset}
                replacePreset={replacePreset}
                snapshotPreset={snapshotPreset}
              />
            </ControlSection>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
