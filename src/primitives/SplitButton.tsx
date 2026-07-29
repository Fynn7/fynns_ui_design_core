import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { ChevronDownIcon } from "./icons";

/**
 * Split button: a primary action plus a dropdown-arrow that opens a menu. The
 * menu is rendered by the caller (`menu`) and its open state is controlled.
 */
export type SplitButtonProps = {
  children: ReactNode;
  onMainClick: () => void;
  /** Menu content shown when the arrow is toggled open. */
  menu: ReactNode;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  disabled?: boolean;
  mainAriaLabel?: string;
  menuAriaLabel?: string;
  className?: string;
};

export function SplitButton({
  children,
  onMainClick,
  menu,
  menuOpen,
  onMenuOpenChange,
  disabled = false,
  mainAriaLabel,
  menuAriaLabel = "More actions",
  className,
}: SplitButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onMenuOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMenuOpenChange(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, onMenuOpenChange]);

  return (
    <div
      ref={rootRef}
      className={["fynns-splitbtn", className ?? ""].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className="fynns-splitbtn-main"
        onClick={onMainClick}
        disabled={disabled}
        aria-label={mainAriaLabel}
      >
        {children}
      </button>
      <button
        type="button"
        className="fynns-splitbtn-arrow"
        onClick={() => onMenuOpenChange(!menuOpen)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={menuAriaLabel}
      >
        <ChevronDownIcon size={16} />
      </button>
      {menuOpen ? (
        <div className="fynns-splitbtn-menu" role="menu">
          {menu}
        </div>
      ) : null}
    </div>
  );
}
