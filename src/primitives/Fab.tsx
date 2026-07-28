import type { ButtonHTMLAttributes, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";

export type FabSize = "sm" | "md" | "lg";

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
};

/**
 * M3 Floating Action Button — high-emphasis primary action.
 * Pass `label` for Extended FAB. Distinct from `IconButton` (ghost chrome).
 */
export const Fab = forwardRef(function Fab(
  {
    children,
    label,
    size = "md",
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
    extended ? "fynns-fab--extended" : "",
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
