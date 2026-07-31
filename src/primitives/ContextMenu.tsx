import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { MenuSurface } from "./DropdownMenu";

export type ContextMenuProps = {
  /** Controlled open state. Parent owns open / x / y — no document listener required. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Client X where the menu should appear. */
  x: number;
  /** Client Y where the menu should appear. */
  y: number;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

const VIEWPORT_MARGIN = 8;

/**
 * Controlled context menu at client coordinates. Reuses `DropdownMenuItem` /
 * Group / CheckboxItem / Separator via shared `MenuSurface` + MenuContext.
 * Escape and outside-click dismiss; arrow keys page items.
 */
export function ContextMenu({
  open,
  onOpenChange,
  x,
  y,
  children,
  ariaLabel = "Context menu",
  className,
}: ContextMenuProps) {
  const menuId = useId();
  const [menuEl, setMenuEl] = useState<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useLayoutEffect(() => {
    if (!open) return;
    let left = x;
    let top = y;
    if (menuEl) {
      const { width, height } = menuEl.getBoundingClientRect();
      const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
      const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
      left = Math.min(Math.max(VIEWPORT_MARGIN, x), Math.max(VIEWPORT_MARGIN, maxLeft));
      top = Math.min(Math.max(VIEWPORT_MARGIN, y), Math.max(VIEWPORT_MARGIN, maxTop));
    } else {
      left = Math.min(Math.max(VIEWPORT_MARGIN, x), window.innerWidth - VIEWPORT_MARGIN);
      top = Math.min(Math.max(VIEWPORT_MARGIN, y), window.innerHeight - VIEWPORT_MARGIN);
    }
    setPos({ left, top });
  }, [open, x, y, menuEl]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuEl?.contains(event.target as Node)) return;
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

  return (
    <MenuSurface
      open={open}
      onClose={close}
      id={menuId}
      ariaLabel={ariaLabel}
      className={className}
      dataSide="bottom"
      onPanelElement={setMenuEl}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </MenuSurface>
  );
}

export type ContextMenuTriggerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  /** Receives client coordinates from the contextmenu event. */
  onPositionChange: (x: number, y: number) => void;
};

/**
 * Wraps children and opens a controlled `ContextMenu` on right-click
 * (`preventDefault` + position).
 */
export function ContextMenuTrigger({
  children,
  onOpenChange,
  onPositionChange,
  onContextMenu,
  className,
  ...rest
}: ContextMenuTriggerProps) {
  return (
    <div
      {...rest}
      className={["fynns-context-menu-trigger", className].filter(Boolean).join(" ")}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onPositionChange(event.clientX, event.clientY);
        onOpenChange(true);
      }}
    >
      {children}
    </div>
  );
}
