import type { ForwardedRef, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Multiline text input primitive. `.fynns-input .fynns-textarea`. */
export const Textarea = forwardRef(function Textarea(
  { className, ...rest }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...rest}
      ref={ref}
      className={["fynns-input", "fynns-textarea", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    />
  );
});
