import { Input, Slider } from "@fynns/ui";
import {
  readPresetNumber,
  type AestheticPreset,
} from "../presetSchema";

type TokenSliderProps = {
  preset: AestheticPreset;
  variable: string;
  label: string;
  min: number;
  max: number;
  step: number;
  fallback: number;
  unit?: string;
  description?: string;
  onChange: (variable: string, value: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TokenSlider({
  preset,
  variable,
  label,
  min,
  max,
  step,
  fallback,
  unit = "",
  description,
  onChange,
}: TokenSliderProps) {
  const value = readPresetNumber(preset, variable, fallback);
  const update = (nextValue: number) => {
    onChange(variable, `${clamp(nextValue, min, max)}${unit}`);
  };

  return (
    <div className="fynns-sandbox-token-control">
      <div className="fynns-sandbox-token-head">
        <label className="fynns-sandbox-token-label" htmlFor={`token-${variable}`}>
          {label}
        </label>
        <Input
          id={`token-${variable}`}
          className="fynns-sandbox-token-value"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${label} exact value`}
          onChange={(event) => update(Number(event.currentTarget.value))}
        />
      </div>
      {description ? <p className="fynns-sandbox-control-help">{description}</p> : null}
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        ariaLabel={label}
        onChange={update}
      />
    </div>
  );
}
