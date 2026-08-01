import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type DialogVariant = "centered" | "command" | "drawer" | "sheet" | "fullscreen";

export type DrawerSide = "left" | "right";

/** Enter/exit animation phase for overlay surfaces. */
export type DialogDataState = "open" | "closing";

/** Keep in sync with `--fynns-duration-base` (dialog/drawer transitions). */
export const DIALOG_TRANSITION_MS = 240;

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export type DialogFrameProps = {
  open: boolean;
  onClose: () => void;
  variant: DialogVariant;
  /** Drawer slide-in edge. Ignored for non-drawer variants. */
  side?: DrawerSide;
  /**
   * Modal frames lock body scroll, trap focus, and render a click-dismiss
   * scrim. Non-modal frames (e.g. a side drawer) leave the rest of the page
   * interactive: no scroll lock, no focus trap, and a click-through overlay.
   */
  modal?: boolean;
  /** 为 false 时 scrim 不响应点击（避免长任务误触遮罩）。 */
  scrimDismiss?: boolean;
  /**
   * Drives CSS enter/exit transitions via `data-state`. When omitted, the frame
   * manages its own presence lifecycle (mount → enter → exit → unmount).
   */
  dataState?: DialogDataState;
  panelClassName?: string;
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * Shared frame: portal + scrim + focus-trap + Esc + body scroll lock.
 * Low-level building block reused by FullscreenDialog, BottomSheet,
 * NavigationDrawer, and date/time dialogs. Not part of the public barrel.
 */
export function DialogFrame({
  open,
  onClose,
  variant,
  side = "right",
  modal = true,
  scrimDismiss = true,
  dataState: dataStateProp,
  panelClassName,
  labelledBy,
  ariaLabel,
  children,
}: DialogFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);
  const managesPresence = dataStateProp === undefined;

  useEffect(() => {
    if (!managesPresence) return;
    if (open) {
      // Mount (or keep mounted) in the closed visual state first.
      setRendered(true);
      return;
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), DIALOG_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open, managesPresence]);

  // Enter only after the closed frame has committed — otherwise React can paint
  // `rendered` + `entered` together and skip the sheet/drawer slide-in.
  useEffect(() => {
    if (!managesPresence || !open || !rendered) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, rendered, managesPresence]);

  const visible = managesPresence ? rendered : open;
  const resolvedDataState: DialogDataState | undefined = managesPresence
    ? entered
      ? "open"
      : "closing"
    : dataStateProp;

  useEffect(() => {
    if (!visible || resolvedDataState !== "open") return;
    const previous = document.activeElement as HTMLElement | null;
    const container = panelRef.current;
    if (container) {
      const focusable = getFocusable(container);
      (focusable[0] ?? container).focus();
    }
    if (!modal) {
      return () => {
        previous?.focus?.();
      };
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [visible, resolvedDataState, modal]);

  // Non-modal frames cannot rely on the panel's onKeyDown for Esc, because
  // focus may live outside the panel (e.g. the list behind a side drawer).
  useEffect(() => {
    if (!visible || modal) return;
    const onWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [visible, modal, onClose]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !modal) return;
    const container = panelRef.current;
    if (!container) return;
    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (!active || !container.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!visible) return null;

  const overlayVariantClass =
    variant === "command"
      ? "fynns-dialog-overlay--command"
      : variant === "drawer"
        ? "fynns-dialog-overlay--drawer"
        : variant === "sheet"
          ? "fynns-dialog-overlay--sheet"
          : variant === "fullscreen"
            ? "fynns-dialog-overlay--fullscreen"
            : "fynns-dialog-overlay--centered";
  const panelVariantClass =
    variant === "command"
      ? "fynns-dialog-panel--command"
      : variant === "drawer"
        ? `fynns-dialog-panel--drawer fynns-dialog-panel--drawer-${side}`
        : variant === "sheet"
          ? "fynns-dialog-panel--sheet"
          : variant === "fullscreen"
            ? "fynns-dialog--fullscreen"
            : "fynns-dialog-panel--centered";

  return createPortal(
    <div
      className={[
        "fynns-dialog-overlay",
        overlayVariantClass,
        modal ? "" : "fynns-dialog-overlay--nonmodal",
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={resolvedDataState}
    >
      {modal ? (
        <button
          type="button"
          className={["fynns-dialog-scrim", scrimDismiss ? "" : "fynns-dialog-scrim--inert"]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
          tabIndex={-1}
          onClick={scrimDismiss ? onClose : undefined}
        />
      ) : null}
      <div
        ref={panelRef}
        className={[
          "fynns-dialog-panel",
          panelVariantClass,
          panelClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal={modal}
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        data-state={resolvedDataState}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Low-level modal shell. The caller renders the full panel content (head +
 * body). Use this when you need full control of the panel layout.
 */
export type DialogShellProps = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  ariaLabel?: string;
  variant?: DialogVariant;
  className?: string;
  children: ReactNode;
};

export function DialogShell({
  open,
  onClose,
  labelledBy,
  ariaLabel,
  variant = "centered",
  className,
  children,
}: DialogShellProps) {
  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      variant={variant}
      panelClassName={className}
      labelledBy={labelledBy}
      ariaLabel={ariaLabel}
    >
      {children}
    </DialogFrame>
  );
}

/**
 * High-level dialog with a standard head (title + actions + close) and a body
 * slot. Focus trap, scroll lock, Esc + scrim dismiss are built in via
 * `DialogFrame`.
 */
export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  visibleTitle?: boolean;
  description?: ReactNode;
  children: ReactNode;
  headActions?: ReactNode;
  variant?: DialogVariant;
  /** Maps to `--fynns-layout-dialog-max-width-*` for centered dialogs. */
  size?: "sm" | "md" | "lg";
  className?: string;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  visibleTitle = true,
  description,
  children,
  headActions,
  variant = "centered",
  size = "md",
  className,
  showCloseButton = false,
  closeAriaLabel = "Close",
}: DialogProps) {
  const titleId = useId();
  const close = () => onOpenChange(false);
  const showHead = visibleTitle || !!headActions || showCloseButton;
  const sizeClass =
    variant === "centered"
      ? size === "sm"
        ? "fynns-dialog-panel--size-sm"
        : size === "lg"
          ? "fynns-dialog-panel--size-lg"
          : "fynns-dialog-panel--size-md"
      : "";
  return (
    <DialogFrame
      open={open}
      onClose={close}
      variant={variant}
      panelClassName={[sizeClass, className ?? ""].filter(Boolean).join(" ") || undefined}
      labelledBy={titleId}
    >
      {showHead ? (
        <div className="fynns-dialog-head">
          <h2
            id={titleId}
            className={visibleTitle ? "fynns-dialog-title" : "fynns-sr-only"}
          >
            {title}
          </h2>
          <div className="fynns-dialog-head-actions">
            {headActions}
            {showCloseButton ? (
              <Tooltip content={closeAriaLabel}>
                <IconButton
                  variant="ghost"
                  className="fynns-dialog-close"
                  aria-label={closeAriaLabel}
                  onClick={close}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
        </div>
      ) : (
        <h2 id={titleId} className="fynns-sr-only">
          {title}
        </h2>
      )}
      {description ? <p className="fynns-dialog-description">{description}</p> : null}
      <div className="fynns-dialog-body fynns-scroll">{children}</div>
    </DialogFrame>
  );
}

/**
 * Confirmation dialog with a start-aligned title and a right-aligned footer of
 * Cancel + Confirm. Dismiss via Cancel, Esc, or scrim (no close X — M3 basic
 * dialog anatomy). `danger` styles Confirm destructively; `loading` blocks
 * dismiss when `blockCloseWhileLoading` (default).
 */
export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  danger?: boolean;
  confirmDisabled?: boolean;
  loading?: boolean;
  blockCloseWhileLoading?: boolean;
  /** When false, scrim click does not dismiss (use Cancel instead). */
  scrimDismiss?: boolean;
  confirmIcon?: ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  confirmDisabled = false,
  loading = false,
  blockCloseWhileLoading = true,
  scrimDismiss = true,
  confirmIcon,
}: ConfirmDialogProps) {
  const titleId = useId();
  const closeBlocked = loading && blockCloseWhileLoading;
  const cancel = () => {
    if (closeBlocked) return;
    if (onCancel) onCancel();
    else onOpenChange(false);
  };
  return (
    <DialogFrame
      open={open}
      onClose={cancel}
      variant="centered"
      labelledBy={titleId}
      scrimDismiss={scrimDismiss && !closeBlocked}
    >
      <div className="fynns-dialog-head fynns-dialog-head--confirm">
        <h2 id={titleId} className="fynns-dialog-title">
          {title}
        </h2>
      </div>
      {description ? <p className="fynns-dialog-description">{description}</p> : null}
      {children ? <div className="fynns-dialog-body fynns-scroll">{children}</div> : null}
      <div className="fynns-dialog-foot">
        <Button variant="ghost" onClick={cancel} disabled={closeBlocked}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={confirmDisabled}
          loading={loading}
        >
          {confirmIcon}
          {confirmLabel}
        </Button>
      </div>
    </DialogFrame>
  );
}

/**
 * Full-viewport dialog: close IconButton + title + optional actions in the
 * head, scrollable body. Uses `DialogFrame` with `variant="fullscreen"`.
 */
export type FullscreenDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  closeAriaLabel?: string;
};

export function FullscreenDialog({
  open,
  onOpenChange,
  title,
  children,
  actions,
  closeAriaLabel = "Close",
}: FullscreenDialogProps) {
  const titleId = useId();
  const close = () => onOpenChange(false);
  return (
    <DialogFrame
      open={open}
      onClose={close}
      variant="fullscreen"
      labelledBy={titleId}
    >
      <div className="fynns-dialog-head fynns-dialog-head--fullscreen">
        <Tooltip content={closeAriaLabel}>
          <IconButton
            variant="ghost"
            className="fynns-dialog-close"
            aria-label={closeAriaLabel}
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
        <h2 id={titleId} className="fynns-dialog-title">
          {title}
        </h2>
        {actions ? (
          <div className="fynns-dialog-head-actions">{actions}</div>
        ) : (
          <span aria-hidden />
        )}
      </div>
      <div className="fynns-dialog-body fynns-scroll">{children}</div>
    </DialogFrame>
  );
}
