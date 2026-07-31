import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckIcon } from "./icons";
import { useFloatingBoxPosition, type Align } from "./Popover";

type MenuContextValue = {
  close: () => void;
  menuId: string;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(optional = false): MenuContextValue | null {
  const ctx = useContext(MenuContext);
  if (!ctx && !optional) {
    throw new Error("DropdownMenuItem must be used inside DropdownMenu");
  }
  return ctx;
}

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function itemSelector(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([disabled]), [role="menuitemcheckbox"]:not([disabled])',
    ),
  );
}

export type MenuSurfaceProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: CSSProperties;
  id?: string;
  ariaLabel?: string;
  className?: string;
  /** Flyout origin side (drives enter animation). */
  dataSide?: "top" | "bottom" | "left" | "right";
  /** Called when the portaled panel mounts / unmounts (for positioning). */
  onPanelElement?: (el: HTMLDivElement | null) => void;
};

/**
 * Shared menu panel: MenuContext + portal + arrow-key paging.
 * Used by `DropdownMenu` and `ContextMenu`.
 */
export function MenuSurface({
  open,
  onClose,
  children,
  style,
  id,
  ariaLabel = "Menu",
  className,
  dataSide = "bottom",
  onPanelElement,
}: MenuSurfaceProps) {
  const generatedId = useId();
  const menuId = id ?? generatedId;
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);

  const setPanelRef = useCallback(
    (el: HTMLDivElement | null) => {
      setMenuEl(el);
      onPanelElement?.(el);
    },
    [onPanelElement],
  );

  useEffect(() => {
    if (!open || !menuEl) return;
    const items = itemSelector(menuEl);
    items[0]?.focus();
  }, [open, menuEl]);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = itemSelector(menuEl);
    if (items.length === 0) return;
    const current = document.activeElement as HTMLElement | null;
    const index = current ? items.indexOf(current) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = index < 0 ? 0 : (index + 1) % items.length;
      items[next]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <MenuContext.Provider value={{ close: onClose, menuId }}>
      <div
        ref={setPanelRef}
        id={menuId}
        role="menu"
        aria-label={ariaLabel}
        data-side={dataSide}
        className={join("fynns-menu", className)}
        style={style}
        onKeyDown={onMenuKeyDown}
      >
        {children}
      </div>
    </MenuContext.Provider>,
    document.body,
  );
}

export type DropdownMenuProps = {
  /** Trigger label / content (rendered inside the trigger button). */
  trigger: ReactNode;
  /** Menu body — items, groups, separators, labels. */
  children: ReactNode;
  ariaLabel?: string;
  /** Horizontal alignment of the portaled menu relative to the trigger. */
  align?: "start" | "end";
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * M3 Menu — trigger + portaled surface (groups, separators, checkbox items).
 * Outside-click / Escape dismiss; arrow keys move between items.
 * @see https://m3.material.io/components/menus/overview
 */
export function DropdownMenu({
  trigger,
  children,
  ariaLabel = "Menu",
  align = "start",
  className,
  triggerClassName,
  disabled = false,
  open: openProp,
  onOpenChange,
}: DropdownMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const menuId = useId();
  const floatingAlign: Align = align === "end" ? "end" : "start";
  const pos = useFloatingBoxPosition(triggerRef.current, menuEl, open, {
    side: "bottom",
    align: floatingAlign,
    offset: 6,
  });

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuEl?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, menuEl, close]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className={join("fynns-menu-root", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={join("fynns-btn", triggerClassName)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={onTriggerKeyDown}
      >
        {trigger}
      </button>
      <MenuSurface
        open={open}
        onClose={close}
        id={menuId}
        ariaLabel={ariaLabel}
        className={`fynns-menu--${align}`}
        dataSide={pos?.side ?? "bottom"}
        onPanelElement={setMenuEl}
        style={
          pos
            ? { top: pos.top, left: pos.left }
            : { top: 0, left: 0, visibility: "hidden" as const }
        }
      >
        {children}
      </MenuSurface>
    </div>
  );
}

export type DropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  /** Keep the menu open after activate (default closes). */
  closeOnSelect?: boolean;
};

export function DropdownMenuItem({
  icon,
  children,
  className,
  closeOnSelect = true,
  onClick,
  ...rest
}: DropdownMenuItemProps) {
  const ctx = useMenuContext(true);
  return (
    <button
      {...rest}
      type="button"
      role="menuitem"
      className={join("fynns-menu-item", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && closeOnSelect) ctx?.close();
      }}
    >
      {icon ? <span className="fynns-menu-item-icon">{icon}</span> : null}
      <span className="fynns-menu-item-label">{children}</span>
    </button>
  );
}

export type DropdownMenuCheckboxItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "aria-checked"
> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Keep the menu open after toggle (default `false` for multi-select filters). */
  closeOnSelect?: boolean;
};

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  className,
  closeOnSelect = false,
  onClick,
  disabled,
  ...rest
}: DropdownMenuCheckboxItemProps) {
  const ctx = useMenuContext(true);
  return (
    <button
      {...rest}
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      className={join(
        "fynns-menu-item",
        "fynns-menu-item--checkbox",
        checked && "fynns-menu-item--checked",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onCheckedChange?.(!checked);
        if (closeOnSelect) ctx?.close();
      }}
    >
      <span className="fynns-menu-item-leading" aria-hidden>
        {checked ? <CheckIcon size={16} /> : null}
      </span>
      <span className="fynns-menu-item-label">{children}</span>
    </button>
  );
}

export type DropdownMenuLabelProps = HTMLAttributes<HTMLDivElement>;

/** Non-interactive section heading inside a menu. */
export function DropdownMenuLabel({
  children,
  className,
  ...rest
}: DropdownMenuLabelProps) {
  return (
    <div
      {...rest}
      role="presentation"
      className={join("fynns-menu-label", className)}
    >
      {children}
    </div>
  );
}

export type DropdownMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

/** Hairline divider between menu sections. */
export function DropdownMenuSeparator({
  className,
  ...rest
}: DropdownMenuSeparatorProps) {
  return (
    <div
      {...rest}
      role="separator"
      className={join("fynns-menu-separator", className)}
    />
  );
}

export type DropdownMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional visible group label (also used as `aria-label` when set). */
  label?: ReactNode;
};

/** Groups related items; optional label renders as `DropdownMenuLabel`. */
export function DropdownMenuGroup({
  label,
  children,
  className,
  ...rest
}: DropdownMenuGroupProps) {
  const labelId = useId();
  const hasLabel = label != null && label !== false;
  return (
    <div
      {...rest}
      role="group"
      aria-labelledby={hasLabel ? labelId : undefined}
      className={join("fynns-menu-group", className)}
    >
      {hasLabel ? (
        <DropdownMenuLabel id={labelId}>{label}</DropdownMenuLabel>
      ) : null}
      {children}
    </div>
  );
}
