import type { ChangeEvent } from "react";

export type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Styled range slider built on a native `<input type="range">` (keeps full
 * keyboard + a11y support). `.fynns-slider`.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  ariaLabel,
  id,
  disabled = false,
  className,
}: SliderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };
  return (
    <input
      id={id}
      type="range"
      className={["fynns-slider", className ?? ""].filter(Boolean).join(" ")}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={handleChange}
    />
  );
}
