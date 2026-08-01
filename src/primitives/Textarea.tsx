import type { ForwardedRef, ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

export type TextareaSize = "sm" | "md";
export type TextareaVariant = "filled" | "outlined";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  size?: TextareaSize;
  /** @default "outlined" */
  variant?: TextareaVariant;
  supportingText?: ReactNode;
  errorText?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Multiline form control sharing Input chrome. Not a full M3 Text Field
 * (no floating label; `filled` is a dense fill, not M3 filled anatomy).
 * `.fynns-input .fynns-textarea`. */
export const Textarea = forwardRef(function Textarea(
  {
    className,
    invalid = false,
    size = "md",
    variant = "outlined",
    supportingText,
    errorText,
    id,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;

  const control = (
    <textarea
      {...rest}
      id={fieldId}
      ref={ref}
      aria-invalid={isInvalid || undefined}
      aria-describedby={hint ? join(ariaDescribedBy, hintId) : ariaDescribedBy}
      className={join(
        "fynns-input",
        "fynns-textarea",
        size === "sm" && "fynns-input--sm",
        variant === "filled" && "fynns-input--filled",
        isInvalid && "fynns-input--invalid",
        className,
      )}
    />
  );

  if (!hint) return control;

  return (
    <div className={join("fynns-field", isInvalid && "fynns-field--invalid")}>
      {control}
      <p
        id={hintId}
        className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
      >
        {hint}
      </p>
    </div>
  );
});
