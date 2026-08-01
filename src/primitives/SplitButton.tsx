import { useCallback, useState, type ReactNode } from "react";
import { Button, type ButtonSize } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import { ChevronDownIcon } from "./icons";

export type SplitButtonVariant = "primary" | "tonal" | "default" | "elevated";
export type SplitButtonSize = ButtonSize;

export type SplitButtonProps = {
  /** Menu contents (`DropdownMenuItem` / groups / separators). */
  children: ReactNode;
  /** Leading segment — primary action. */
  onMainClick: () => void;
  /** Leading label text (or node). */
  label: ReactNode;
  leadingIcon?: ReactNode;
  /** M3 filled / tonal / outlined / elevated. Default `primary`. */
  variant?: SplitButtonVariant;
  size?: SplitButtonSize;
  disabled?: boolean;
  /** Spins on the leading Button only. */
  loading?: boolean;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  mainAriaLabel?: string;
  /** Required — trailing control is icon-only. */
  menuAriaLabel: string;
  className?: string;
};

const VARIANT_CLASS: Record<SplitButtonVariant, string> = {
  primary: "fynns-btn--primary",
  tonal: "fynns-btn--tonal",
  default: "fynns-btn--default",
  elevated: "fynns-btn--elevated",
};

const SIZE_CLASS: Record<SplitButtonSize, string> = {
  sm: "fynns-btn--sm",
  md: "",
  lg: "fynns-btn--lg",
};

/**
 * M3 Expressive split button: leading primary action + trailing menu trigger.
 * Segments are separate focusable controls, flush (no gap between halves).
 */
export function SplitButton({
  children,
  onMainClick,
  label,
  leadingIcon,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  menuOpen: menuOpenProp,
  onMenuOpenChange,
  mainAriaLabel,
  menuAriaLabel,
  className,
}: SplitButtonProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = menuOpenProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (menuOpenProp === undefined) setUncontrolledOpen(next);
      onMenuOpenChange?.(next);
    },
    [menuOpenProp, onMenuOpenChange],
  );

  const sizeClass = SIZE_CLASS[size];
  const variantClass = VARIANT_CLASS[variant];
  const triggerClass = [
    "fynns-btn--icon",
    sizeClass,
    variantClass,
    "fynns-splitbtn-menu-trigger",
    open ? "fynns-splitbtn-menu-trigger--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={["fynns-splitbtn", className ?? ""].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-state={open ? "open" : "closed"}
    >
      <Button
        type="button"
        className="fynns-splitbtn-main"
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        aria-label={mainAriaLabel}
        onClick={onMainClick}
      >
        {leadingIcon ? (
          <span className="fynns-splitbtn-main-icon" aria-hidden>
            {leadingIcon}
          </span>
        ) : null}
        <span className="fynns-splitbtn-main-label">{label}</span>
      </Button>
      <DropdownMenu
        className="fynns-splitbtn-menu-root"
        trigger={
          <ChevronDownIcon
            className="fynns-splitbtn-chevron"
          />
        }
        triggerClassName={triggerClass}
        ariaLabel={menuAriaLabel}
        disabled={disabled || loading}
        open={open}
        onOpenChange={setOpen}
        align="end"
      >
        {children}
      </DropdownMenu>
    </div>
  );
}
