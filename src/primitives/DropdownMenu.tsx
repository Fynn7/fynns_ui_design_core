import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "./icons";
import { useFloatingBoxPosition, type Align } from "./floatingBox";
import { OverflowTip, overflowTipText } from "./OverflowTip";

type MenuContextValue = {
  /** Close this surface (submenu or root). */
  close: () => void;
  /** Close the outermost DropdownMenu (and nested submenus). */
  closeRoot: () => void;
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

/** Keep in sync with `--fynns-duration-flyout`. */
export const FLYOUT_TRANSITION_MS = 160;

function flyoutExitMs(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return FLYOUT_TRANSITION_MS;
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
  /** Flyout origin side (drives enter/exit animation). */
  dataSide?: "top" | "bottom" | "left" | "right";
  /** Called when the portaled panel mounts / unmounts (for positioning). */
  onPanelElement?: (el: HTMLDivElement | null) => void;
};

/**
 * Shared menu panel: MenuContext + portal + arrow-key paging + enter/exit
 * presence. Used by `DropdownMenu` and `ContextMenu`.
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
  const parent = useMenuContext(true);
  const generatedId = useId();
  const menuId = id ?? generatedId;
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [presenting, setPresenting] = useState(open);

  const setPanelRef = useCallback(
    (el: HTMLDivElement | null) => {
      setMenuEl(el);
      onPanelElement?.(el);
    },
    [onPanelElement],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPresenting(true);
      return;
    }
    if (!mounted) return;
    setPresenting(false);
    const timer = setTimeout(() => setMounted(false), flyoutExitMs());
    return () => clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !presenting || !menuEl) return;
    const items = itemSelector(menuEl);
    items[0]?.focus();
  }, [open, presenting, menuEl]);

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!presenting) return;
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
      const next =
        index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === "ArrowLeft" && parent) {
      // Nested submenu only — close this surface, keep the parent menu open.
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  const closeRoot = parent?.closeRoot ?? onClose;

  return createPortal(
    <MenuContext.Provider value={{ close: onClose, closeRoot, menuId }}>
      <div
        ref={setPanelRef}
        id={menuId}
        role="menu"
        aria-label={ariaLabel}
        aria-hidden={!presenting}
        {...(!presenting ? { inert: true } : {})}
        data-side={dataSide}
        data-state={presenting ? "open" : "closing"}
        className={join("fynns-menu", "fynns-scroll", className)}
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
  /**
   * Optional leading glyph on a **labeled** trigger (16dp slot, vertically
   * centered with the label — ≥ **0.5.258**). Prefer this over stuffing an
   * icon into `trigger` as a fragment. Ignored when `iconOnly`.
   */
  leadingIcon?: ReactNode;
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
  /**
   * Icon-only circular trigger (`IconButton` geometry). Use in catalog /
   * toolbar `.fynns-control-cluster` strips beside other `IconButton`s —
   * never a bare labeled `.fynns-btn` (agents-hub EntrySort lesson).
   * Defaults `variant="ghost"` and `size="sm"` when omitted.
   */
  iconOnly?: boolean;
  /** Trigger `Button` / `IconButton` size. Default `md` (labeled) or `sm` (`iconOnly`). */
  size?: ButtonSize;
  /**
   * Trigger surface. Labeled menus keep the historical outlined `.fynns-btn`
   * look when omitted; `iconOnly` defaults to `ghost`.
   */
  variant?: ButtonVariant;
  /**
   * Pin portaled menu **width = live trigger** (Select ≥ **0.5.238** parity).
   * Long item labels ellipsize inside. Defaults **on** when the root sits under
   * `.fynns-field-block` (form FieldBlock replacement) and **off** for toolbar /
   * `iconOnly` menus. Pass explicitly to force either way (≥ **0.5.239**).
   */
  matchTriggerWidth?: boolean;
};

/**
 * M3 Menu — trigger + portaled surface (groups, separators, checkbox items).
 * Outside-click / Escape dismiss; arrow keys move between items.
 * Labeled triggers auto-append a trailing chevron that rotates open
 * (≥ **0.5.253**). Optional `leadingIcon` centers a 16dp glyph with the
 * label (≥ **0.5.258**). Form FieldBlock hosts auto-match menu width to the
 * trigger (≥ **0.5.239**). Long catalogs: panel caps height + `fynns-scroll`
 * (visible flyout overlay rails ≥ **0.5.251**). Huge catalogs — filter /
 * window in the consumer.
 * @see https://m3.material.io/components/menus/overview
 */
export function DropdownMenu({
  trigger,
  leadingIcon,
  children,
  ariaLabel = "Menu",
  align = "start",
  className,
  triggerClassName,
  disabled = false,
  open: openProp,
  onOpenChange,
  iconOnly = false,
  size,
  variant,
  matchTriggerWidth: matchTriggerWidthProp,
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
  const [triggerWidthPx, setTriggerWidthPx] = useState<number | null>(null);
  const [inFieldBlock, setInFieldBlock] = useState(false);
  const menuId = useId();
  const floatingAlign: Align = align === "end" ? "end" : "start";
  const pos = useFloatingBoxPosition(triggerRef.current, menuEl, open, {
    side: "bottom",
    align: floatingAlign,
    offset: 6,
    /* Default is element (≥ 0.5.254); keep explicit for labeled label+chevron. */
    anchorMode: "element",
  });
  // Keep last box while MenuSurface plays exit (hook clears box when `open` is false).
  const lastPosRef = useRef(pos);
  if (pos) lastPosRef.current = pos;
  const displayPos = pos ?? lastPosRef.current;

  const setRootRef = useCallback((el: HTMLDivElement | null) => {
    rootRef.current = el;
    setInFieldBlock(Boolean(el?.closest(".fynns-field-block")));
  }, []);

  const matchTriggerWidth =
    matchTriggerWidthProp ?? (!iconOnly && inFieldBlock);

  useLayoutEffect(() => {
    if (!matchTriggerWidth || !open) return;
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;
    const sync = () => {
      const w = triggerEl.getBoundingClientRect().width;
      if (w > 0) setTriggerWidthPx(w);
    };
    sync();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    ro?.observe(triggerEl);
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [matchTriggerWidth, open]);

  useEffect(() => {
    if (!open && !menuEl) setTriggerWidthPx(null);
  }, [open, menuEl]);

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
      const ownerId = menuId;
      const nested = document.querySelectorAll(
        `[data-fynns-submenu-of="${ownerId}"]`,
      );
      for (const el of nested) {
        if (el.contains(target)) return;
      }
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
  }, [open, menuEl, close, menuId]);

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const resolvedSize = size ?? (iconOnly ? "sm" : "md");
  const resolvedVariant = variant ?? (iconOnly ? "ghost" : undefined);
  const triggerTip = !iconOnly ? overflowTipText(trigger) : null;

  const menuStyle: CSSProperties = displayPos
    ? { top: displayPos.top, left: displayPos.left }
    : { top: 0, left: 0, visibility: "hidden" as const };
  if (matchTriggerWidth && triggerWidthPx != null) {
    menuStyle.width = `${triggerWidthPx}px`;
    menuStyle.minWidth = `${triggerWidthPx}px`;
    menuStyle.maxWidth = `${triggerWidthPx}px`;
  }

  const triggerBody =
    triggerTip != null ? (
      <OverflowTip content={triggerTip}>{trigger}</OverflowTip>
    ) : (
      trigger
    );

  return (
    <div
      ref={setRootRef}
      className={join(
        "fynns-menu-root",
        matchTriggerWidth && "fynns-menu-root--match-trigger",
        className,
      )}
      data-match-trigger={matchTriggerWidth ? "true" : undefined}
    >
      {iconOnly ? (
        <Button
          ref={triggerRef}
          type="button"
          variant={resolvedVariant ?? "ghost"}
          size={resolvedSize}
          iconOnly
          className={triggerClassName}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => setOpen(!open)}
          onKeyDown={onTriggerKeyDown}
        >
          {trigger}
        </Button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className={join(
            "fynns-btn",
            "fynns-menu-trigger-btn",
            open && "fynns-menu-trigger-btn--open",
            resolvedVariant && `fynns-btn--${resolvedVariant}`,
            size === "sm" && "fynns-btn--sm",
            size === "lg" && "fynns-btn--lg",
            triggerClassName,
          )}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => setOpen(!open)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="fynns-menu-trigger-label">
            {leadingIcon != null && leadingIcon !== false ? (
              <span className="fynns-menu-trigger-leading" aria-hidden="true">
                {leadingIcon}
              </span>
            ) : null}
            {triggerBody}
          </span>
          <span className="fynns-menu-trigger-trailing" aria-hidden="true">
            <ChevronDownIcon className="fynns-menu-trigger-chevron" />
          </span>
        </button>
      )}
      <MenuSurface
        open={open}
        onClose={close}
        id={menuId}
        ariaLabel={ariaLabel}
        className={join(
          `fynns-menu--${align}`,
          matchTriggerWidth && "fynns-menu--match-trigger",
        )}
        dataSide={displayPos?.side ?? "bottom"}
        onPanelElement={setMenuEl}
        style={menuStyle}
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
  /**
   * Semantic tone. `danger` paints icon + label with `--fynns-color-danger`
   * (ChatGPT-style destructive More-menu rows). Default is neutral text.
   */
  tone?: "default" | "danger";
};

export function DropdownMenuItem({
  icon,
  children,
  className,
  closeOnSelect = true,
  tone = "default",
  onClick,
  ...rest
}: DropdownMenuItemProps) {
  const ctx = useMenuContext(true);
  const tip = overflowTipText(children);
  return (
    <button
      {...rest}
      type="button"
      role="menuitem"
      className={join(
        "fynns-menu-item",
        tone === "danger" && "fynns-menu-item--danger",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && closeOnSelect) ctx?.closeRoot();
      }}
    >
      {icon ? <span className="fynns-menu-item-icon">{icon}</span> : null}
      <span className="fynns-menu-item-label">
        {tip != null ? <OverflowTip content={tip}>{children}</OverflowTip> : children}
      </span>
    </button>
  );
}

DropdownMenuItem.displayName = "DropdownMenuItem";

export type DropdownMenuCheckboxItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "aria-checked"
> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Leading glyph beside the check column — same slot as `DropdownMenuItem` `icon`. */
  icon?: ReactNode;
  /** Keep the menu open after toggle (default `false` for multi-select filters). */
  closeOnSelect?: boolean;
};

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  icon,
  children,
  className,
  closeOnSelect = false,
  onClick,
  disabled,
  ...rest
}: DropdownMenuCheckboxItemProps) {
  const ctx = useMenuContext(true);
  const tip = overflowTipText(children);
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
        if (closeOnSelect) ctx?.closeRoot();
      }}
    >
      <span className="fynns-menu-item-leading" aria-hidden>
        {checked ? <CheckIcon size={16} /> : null}
      </span>
      {icon ? <span className="fynns-menu-item-icon">{icon}</span> : null}
      <span className="fynns-menu-item-label">
        {tip != null ? <OverflowTip content={tip}>{children}</OverflowTip> : children}
      </span>
    </button>
  );
}

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

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

DropdownMenuGroup.displayName = "DropdownMenuGroup";

export type DropdownMenuSubProps = {
  /** Row label (string preferred — OverflowTip). */
  trigger: ReactNode;
  /** Nested menu body (items / groups / separators). */
  children: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Nested submenu row inside a `DropdownMenu` / `MenuSurface`.
 * Opens on hover / focus / ArrowRight; panel docks to the **end** (right in
 * LTR) of the row via `useFloatingBoxPosition` (≥ **0.5.287**). Live
 * `#sandbox-menu-submenu`.
 */
export function DropdownMenuSub({
  trigger,
  children,
  icon,
  ariaLabel,
  disabled = false,
  className,
}: DropdownMenuSubProps) {
  const parent = useMenuContext()!;
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const subId = useId();
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const openSoon = useCallback(() => {
    if (disabled) return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 80);
  }, [clearTimers, disabled]);

  const closeSoon = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }, [clearTimers]);

  const stayOpen = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!panelEl) return;
    const onEnter = () => stayOpen();
    const onLeave = () => closeSoon();
    panelEl.addEventListener("mouseenter", onEnter);
    panelEl.addEventListener("mouseleave", onLeave);
    return () => {
      panelEl.removeEventListener("mouseenter", onEnter);
      panelEl.removeEventListener("mouseleave", onLeave);
    };
  }, [panelEl, stayOpen, closeSoon]);

  const pos = useFloatingBoxPosition(itemRef.current, panelEl, open, {
    side: "right",
    align: "start",
    offset: 4,
    sides: ["right", "left"],
    anchorMode: "element",
  });
  const lastPosRef = useRef(pos);
  if (pos) lastPosRef.current = pos;
  const displayPos = pos ?? lastPosRef.current;

  const tip = overflowTipText(trigger);
  const label =
    tip != null ? <OverflowTip content={tip}>{trigger}</OverflowTip> : trigger;

  const menuStyle: CSSProperties = displayPos
    ? { top: displayPos.top, left: displayPos.left }
    : { top: 0, left: 0, visibility: "hidden" as const };

  return (
    <div
      className={join("fynns-menu-sub", className)}
      onMouseEnter={openSoon}
      onMouseLeave={closeSoon}
    >
      <button
        ref={itemRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? subId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={join("fynns-menu-item", "fynns-menu-item--sub", open && "fynns-menu-item--sub-open")}
        onClick={(event) => {
          event.preventDefault();
          if (disabled) return;
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        onFocus={openSoon}
      >
        {icon ? <span className="fynns-menu-item-icon">{icon}</span> : null}
        <span className="fynns-menu-item-label">{label}</span>
        <span className="fynns-menu-item-sub-chevron" aria-hidden="true">
          <ChevronRightIcon size={16} />
        </span>
      </button>
      <MenuSurface
        open={open}
        onClose={() => setOpen(false)}
        id={subId}
        ariaLabel={ariaLabel ?? (typeof tip === "string" ? tip : "Submenu")}
        className="fynns-menu--sub"
        dataSide={displayPos?.side ?? "right"}
        onPanelElement={setPanelEl}
        style={menuStyle}
      >
        {children}
      </MenuSurface>
      <SubmenuOwnerMarker ownerId={parent.menuId} panelEl={panelEl} />
    </div>
  );
}

DropdownMenuSub.displayName = "DropdownMenuSub";

/** Marks a nested panel as owned by `ownerId` for root outside-click. */
function SubmenuOwnerMarker({
  ownerId,
  panelEl,
}: {
  ownerId: string;
  panelEl: HTMLDivElement | null;
}) {
  useEffect(() => {
    if (!panelEl) return;
    panelEl.setAttribute("data-fynns-submenu-of", ownerId);
    return () => panelEl.removeAttribute("data-fynns-submenu-of");
  }, [ownerId, panelEl]);
  return null;
}
