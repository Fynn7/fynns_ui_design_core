import type { ButtonHTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";

/**
 * Button primitive. The single source of truth for `<button>` styling across
 * fynns apps. Style axes are `variant`, `size`, `active`, `iconOnly` only; any
 * other visual tweak must go through `--fynns-*` overrides, never inline color.
 */
export type ButtonVariant = "default" | "primary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pressed / selected styling. */
  active?: boolean;
  /** Shorthand for `variant="danger"`. */
  danger?: boolean;
  /** Layout-only: renders a square icon button. */
  iconOnly?: boolean;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "",
  primary: "fynns-btn--primary",
  danger: "fynns-btn--danger",
  ghost: "fynns-btn--ghost",
};

export const Button = forwardRef(function Button(
  {
    variant = "default",
    size = "md",
    active = false,
    danger = false,
    iconOnly = false,
    className,
    type = "button",
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const resolvedVariant = danger ? "danger" : variant;
  const classes = [
    "fynns-btn",
    VARIANT_CLASS[resolvedVariant],
    size === "sm" ? "fynns-btn--sm" : "",
    active ? "fynns-btn--active" : "",
    iconOnly ? "fynns-btn--icon" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <button {...rest} ref={ref} type={type} className={classes} />;
});
