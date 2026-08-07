import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CheckIcon, CloseIcon } from "./icons";
import { IconButton } from "./IconButton";

export type ChipVariant = "assist" | "filter" | "input" | "suggestion";

export type ChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  children: ReactNode;
  /**
   * - `assist` — action chip (default).
   * - `filter` — toggleable filter; pass `selected`.
   * - `input` — entry chip; pass `onRemove` for trailing dismiss.
   * - `suggestion` — outlined suggestion; not pressed, no leading check.
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

/**
 * M3 Chip — compact assist / filter / input / suggestion pill. Distinct from
 * segmented `ToggleGroup`. Prefer Chip / InlineAlert / BadgedBox over the
 * removed non-interactive pill `Badge`.
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
        {showCheck ? <CheckIcon className="fynns-chip-check" size={18} /> : leadingIcon}
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
        <IconButton
          type="button"
          className="fynns-chip-remove-btn"
          aria-label={removeAriaLabel}
          disabled={disabled}
          size="sm"
          onClick={onRemove}
        >
          <CloseIcon size={14} />
        </IconButton>
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
