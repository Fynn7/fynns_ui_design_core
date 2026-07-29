import type { ButtonHTMLAttributes, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";

export type FabSize = "sm" | "md" | "lg";

/**
 * M3 FAB color roles (container + on-container).
 * `primary` → accent-container (default, matches prior Fab fill).
 */
export type FabVariant = "primary" | "secondary" | "tertiary" | "surface";

export type FabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Leading icon (required). */
  children: ReactNode;
  /**
   * Visible text — when set, renders an Extended FAB (icon + label).
   * Icon-only FABs must pass `aria-label` (and usually a `Tooltip`).
   */
  label?: string;
  /** Default `md` (56dp). `sm` 40dp, `lg` 96dp. */
  size?: FabSize;
  /** M3 color role. Default `primary` (accent-container). */
  variant?: FabVariant;
  /** Lower elevation (closer to the surface). */
  lowered?: boolean;
};

/**
 * M3 Floating Action Button — high-emphasis primary action.
 * Pass `label` for Extended FAB. Distinct from `IconButton` (ghost chrome).
 * @see https://m3.material.io/components/floating-action-button/overview
 */
export const Fab = forwardRef(function Fab(
  {
    children,
    label,
    size = "md",
    variant = "primary",
    lowered = false,
    className,
    type = "button",
    disabled,
    "aria-label": ariaLabel,
    ...rest
  }: FabProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const extended = Boolean(label);
  const rootClass = [
    "fynns-fab",
    `fynns-fab--${size}`,
    `fynns-fab--${variant}`,
    extended ? "fynns-fab--extended" : "",
    lowered ? "fynns-fab--lowered" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={rootClass}
      disabled={disabled}
      aria-label={ariaLabel ?? (extended ? label : undefined)}
    >
      <span className="fynns-fab-icon" aria-hidden>
        {children}
      </span>
      {extended ? <span className="fynns-fab-label">{label}</span> : null}
    </button>
  );
});
