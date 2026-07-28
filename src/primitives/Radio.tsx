import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "onChange" | "size"
> & {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  name: string;
  value: string;
  /** Error / invalid outline (M3 error). */
  invalid?: boolean;
  className?: string;
};

/**
 * M3 Radio button — circular control + label. Group via shared `name`.
 * Prefer this over `ToggleControl` when you need a real radio look.
 */
export function Radio({
  label,
  checked,
  onCheckedChange,
  name,
  value,
  invalid = false,
  disabled = false,
  className,
  id,
  ...rest
}: RadioProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-radio`;
  const rootClass = [
    "fynns-radio",
    invalid ? "fynns-radio--invalid" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={rootClass} htmlFor={inputId}>
      <input
        {...rest}
        id={inputId}
        type="radio"
        className="fynns-radio-input"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        className="fynns-radio-mark"
        data-state={checked ? "checked" : "unchecked"}
        aria-hidden="true"
      />
      <span className="fynns-radio-label">{label}</span>
    </label>
  );
}
