import type { InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { CheckIcon } from "./icons";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "onChange" | "size"
> & {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  /** Mixed state (select-all). Sets the native `indeterminate` property. */
  indeterminate?: boolean;
  /** Error / invalid outline (M3 error). */
  invalid?: boolean;
  className?: string;
};

/**
 * M3 Checkbox — square control + label. Prefer this over `ToggleControl` when
 * you need a real checkbox look (not a switch-skinned input).
 */
export function Checkbox({
  label,
  checked,
  onCheckedChange,
  indeterminate = false,
  invalid = false,
  disabled = false,
  className,
  id,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-cb`;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const rootClass = [
    "fynns-checkbox",
    invalid ? "fynns-checkbox--invalid" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={rootClass} htmlFor={inputId}>
      <input
        {...rest}
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className="fynns-checkbox-input"
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-checked={indeterminate ? "mixed" : checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        className="fynns-checkbox-box"
        data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
        aria-hidden="true"
      >
        {indeterminate ? (
          <span className="fynns-checkbox-dash" />
        ) : (
          <CheckIcon className="fynns-checkbox-icon" size={14} />
        )}
      </span>
      <span className="fynns-checkbox-label">{label}</span>
    </label>
  );
}
