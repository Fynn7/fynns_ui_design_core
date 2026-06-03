import type { ForwardedRef, InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** Text input primitive. `.fynns-input`. */
export const Input = forwardRef(function Input(
  { className, ...rest }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      {...rest}
      ref={ref}
      className={["fynns-input", className ?? ""].filter(Boolean).join(" ")}
    />
  );
});
