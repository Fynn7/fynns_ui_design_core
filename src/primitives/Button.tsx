import type { ButtonHTMLAttributes, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import { Spinner } from "./Loading";

/**
 * Button primitive. The single source of truth for `<button>` styling across
 * fynns apps. Default variant is `primary` (M3 filled). Style axes are
 * `variant`, `size`, `active`, `iconOnly`, `loading` only; any other visual
 * tweak must go through `--fynns-*` overrides, never inline color.
 */
export type ButtonVariant =
  | "default"
  | "primary"
  | "tonal"
  | "elevated"
  | "danger"
  | "ghost";
export type ButtonSize = "md" | "sm" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pressed / selected styling. */
  active?: boolean;
  /** Shorthand for `variant="danger"`. */
  danger?: boolean;
  /** Layout-only: renders a square icon button. */
  iconOnly?: boolean;
  /** Shows a spinner and disables the control. */
  loading?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "",
  primary: "fynns-btn--primary",
  tonal: "fynns-btn--tonal",
  elevated: "fynns-btn--elevated",
  danger: "fynns-btn--danger",
  ghost: "fynns-btn--ghost",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    active = false,
    danger = false,
    iconOnly = false,
    loading = false,
    className,
    type = "button",
    disabled,
    children,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const resolvedVariant = danger ? "danger" : variant;
  const classes = [
    "fynns-btn",
    VARIANT_CLASS[resolvedVariant],
    size === "sm" ? "fynns-btn--sm" : "",
    size === "lg" ? "fynns-btn--lg" : "",
    active ? "fynns-btn--active" : "",
    iconOnly ? "fynns-btn--icon" : "",
    loading ? "fynns-btn--loading" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="fynns-btn-loading">
          <Spinner size="sm" label="Loading" />
          <span className="fynns-btn-loading-label">{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});
