import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CloseIcon } from "./icons";

export type ChipVariant = "assist" | "filter" | "input";

export type ChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  children: ReactNode;
  /**
   * - `assist` — action chip (default).
   * - `filter` — toggleable filter; pass `selected`.
   * - `input` — entry chip; pass `onRemove` for trailing dismiss.
   */
  variant?: ChipVariant;
  /** Filter / input selected fill (`accent-container`). */
  selected?: boolean;
  /** Soft elevated surface instead of flat outline. */
  elevated?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Trailing dismiss control (renders a sibling button — valid HTML). */
  onRemove?: () => void;
  removeAriaLabel?: string;
};

function ChipCheckIcon() {
  return (
    <svg
      className="fynns-chip-check"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * M3 Chip — compact assist / filter / input pill. Distinct from segmented
 * `ToggleGroup` and from non-interactive `Badge`.
 */
export function Chip({
  children,
  variant = "assist",
  selected = false,
  elevated = false,
  leadingIcon,
  trailingIcon,
  onRemove,
  removeAriaLabel = "Remove",
  disabled = false,
  className,
  onClick,
  ...rest
}: ChipProps) {
  const isSelected =
    (variant === "filter" || variant === "input") && selected;
  const showCheck = variant === "filter" && selected && !leadingIcon;
  const rootClass = [
    "fynns-chip",
    `fynns-chip--${variant}`,
    elevated ? "fynns-chip--elevated" : "",
    isSelected ? "fynns-chip--selected" : "",
    onRemove ? "fynns-chip--removable" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const leading =
    leadingIcon || showCheck ? (
      <span className="fynns-chip-leading" aria-hidden>
        {showCheck ? <ChipCheckIcon /> : leadingIcon}
      </span>
    ) : null;

  const label = <span className="fynns-chip-label">{children}</span>;

  const trailing =
    !onRemove && trailingIcon ? (
      <span className="fynns-chip-trailing" aria-hidden>
        {trailingIcon}
      </span>
    ) : null;

  if (onRemove) {
    return (
      <div className={rootClass} role="group">
        <button
          {...rest}
          type="button"
          className="fynns-chip-face"
          disabled={disabled}
          aria-pressed={variant === "filter" ? selected : undefined}
          onClick={onClick}
        >
          {leading}
          {label}
        </button>
        <button
          type="button"
          className="fynns-chip-remove-btn"
          aria-label={removeAriaLabel}
          disabled={disabled}
          onClick={onRemove}
        >
          <CloseIcon size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      {...rest}
      type="button"
      className={rootClass}
      disabled={disabled}
      aria-pressed={variant === "filter" ? selected : undefined}
      onClick={onClick}
    >
      {leading}
      {label}
      {trailing}
    </button>
  );
}

export type ChipSetProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/** Wrapping row for related chips (`role="group"`). */
export function ChipSet({ children, className, ariaLabel }: ChipSetProps) {
  return (
    <div
      className={["fynns-chip-set", className ?? ""].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
