import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export type DropdownMenuProps = {
  /** Trigger label / content (rendered inside the trigger button). */
  trigger: ReactNode;
  /** Menu items, typically `<DropdownMenuItem>`s. */
  children: ReactNode;
  ariaLabel?: string;
  align?: "start" | "end";
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

/**
 * Button + menu popover. Self-contained open state with outside-click and
 * Escape dismissal. `.fynns-menu-*`.
 */
export function DropdownMenu({
  trigger,
  children,
  ariaLabel = "Menu",
  align = "start",
  className,
  triggerClassName,
  disabled = false,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={["fynns-menu-root", className ?? ""].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className={["fynns-btn", triggerClassName ?? ""].filter(Boolean).join(" ")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={[
            "fynns-menu",
            align === "end" ? "fynns-menu--end" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export type DropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export function DropdownMenuItem({ icon, children, className, ...rest }: DropdownMenuItemProps) {
  return (
    <button
      {...rest}
      type="button"
      role="menuitem"
      className={["fynns-menu-item", className ?? ""].filter(Boolean).join(" ")}
    >
      {icon ? <span className="fynns-menu-item-icon">{icon}</span> : null}
      {children}
    </button>
  );
}
