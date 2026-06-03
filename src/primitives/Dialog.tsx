import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { CloseIcon } from "./icons";

export type DialogVariant = "centered" | "command";

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

type DialogFrameProps = {
  open: boolean;
  onClose: () => void;
  variant: DialogVariant;
  panelClassName?: string;
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
};

/** Shared modal frame: portal + scrim + focus-trap + Esc + body scroll lock. */
function DialogFrame({
  open,
  onClose,
  variant,
  panelClassName,
  labelledBy,
  ariaLabel,
  children,
}: DialogFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const container = panelRef.current;
    if (container) {
      const focusable = getFocusable(container);
      (focusable[0] ?? container).focus();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
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

  if (!open) return null;

  return createPortal(
    <div
      className={[
        "fynns-dialog-overlay",
        variant === "command" ? "fynns-dialog-overlay--command" : "fynns-dialog-overlay--centered",
      ].join(" ")}
    >
      <button
        type="button"
        className="fynns-dialog-scrim"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={[
          "fynns-dialog-panel",
          variant === "command" ? "fynns-dialog-panel--command" : "fynns-dialog-panel--centered",
          panelClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
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
 * slot. Replaces the radix-based Dialog: focus trap, scroll lock, Esc + scrim
 * dismiss are all built in.
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
  className,
  showCloseButton = true,
  closeAriaLabel = "Close",
}: DialogProps) {
  const titleId = useId();
  const close = () => onOpenChange(false);
  const showHead = visibleTitle || !!headActions || showCloseButton;
  return (
    <DialogFrame
      open={open}
      onClose={close}
      variant={variant}
      panelClassName={className}
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
              <Button
                iconOnly
                variant="ghost"
                className="fynns-dialog-close"
                aria-label={closeAriaLabel}
                onClick={close}
              >
                <CloseIcon size={22} />
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <h2 id={titleId} className="fynns-sr-only">
          {title}
        </h2>
      )}
      {description ? <p className="fynns-dialog-description">{description}</p> : null}
      <div className="fynns-dialog-body">{children}</div>
    </DialogFrame>
  );
}
