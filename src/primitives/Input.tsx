import type { ForwardedRef, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

export type InputSize = "sm" | "md";
export type InputVariant = "filled" | "outlined";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Marks the field invalid and sets `aria-invalid`. */
  invalid?: boolean;
  size?: InputSize;
  /** @default "outlined" */
  variant?: InputVariant;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Muted helper under the control (ignored when `errorText` is set). */
  supportingText?: ReactNode;
  /** Danger helper under the control; implies invalid styling. */
  errorText?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Text input primitive. `.fynns-input` (+ optional field chrome). */
export const Input = forwardRef(function Input(
  {
    className,
    invalid = false,
    size = "md",
    variant = "outlined",
    leading,
    trailing,
    supportingText,
    errorText,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;
  const needsShell = !!(leading || trailing || hint);

  const input = (
    <input
      {...rest}
      id={inputId}
      ref={ref}
      aria-invalid={isInvalid || undefined}
      aria-describedby={hint ? join(ariaDescribedBy, hintId) : ariaDescribedBy}
      className={join(
        "fynns-input",
        size === "sm" && "fynns-input--sm",
        variant === "filled" && "fynns-input--filled",
        isInvalid && "fynns-input--invalid",
        !!(leading || trailing) && "fynns-input--in-shell",
        className,
      )}
    />
  );

  if (!needsShell) return input;

  return (
    <div className={join("fynns-field", isInvalid && "fynns-field--invalid")}>
      {leading || trailing ? (
        <div
          className={join(
            "fynns-field-shell",
            size === "sm" && "fynns-field-shell--sm",
            variant === "filled" && "fynns-field-shell--filled",
            isInvalid && "fynns-field-shell--invalid",
          )}
        >
          {leading ? <span className="fynns-field-affix fynns-field-affix--leading">{leading}</span> : null}
          {input}
          {trailing ? <span className="fynns-field-affix fynns-field-affix--trailing">{trailing}</span> : null}
        </div>
      ) : (
        input
      )}
      {hint ? (
        <p
          id={hintId}
          className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});
