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
  /** Selected / toggled-on (M3 container or filled + state layer — not a dark wash). */
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
  default: "fynns-btn--default",
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
  const loadingLabel =
    typeof rest["aria-label"] === "string" && rest["aria-label"].length > 0
      ? rest["aria-label"]
      : "Loading";
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
      aria-pressed={active || undefined}
    >
      {loading ? (
        iconOnly ? (
          <Spinner size="sm" label={loadingLabel} />
        ) : (
          <span className="fynns-btn-loading">
            <Spinner size="sm" label={loadingLabel} />
            <span className="fynns-btn-loading-label">{children}</span>
          </span>
        )
      ) : iconOnly ? (
        children
      ) : (
        <span className="fynns-btn-label">{children}</span>
      )}
    </button>
  );
});
