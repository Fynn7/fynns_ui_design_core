import type { ReactNode } from "react";
import { useId } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import {
  DialogFrame,
  type DialogVariant,
} from "./DialogFrame";

export {
  DialogFrame,
  DIALOG_TRANSITION_MS,
  type DialogVariant,
  type DrawerSide,
  type DialogDataState,
  type DialogFrameProps,
} from "./DialogFrame";

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
  /**
   * Centered only: max-width ceiling via `--fynns-layout-dialog-max-width-*`
   * (`sm` / `md` / `lg`). Panel width is content-fit by default (`max-content`);
   * it grows with body content up to this ceiling (and the viewport). At the
   * ceiling, ControlStack / Switch labels wrap — body never shows a horizontal
   * scrollbar (`overflow-x: clip`).
   */
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
              <IconButton
                variant="ghost"
                className="fynns-dialog-close"
                aria-label={closeAriaLabel}
                onClick={close}
              >
                <CloseIcon />
              </IconButton>
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
        <IconButton
          variant="ghost"
          className="fynns-dialog-close"
          aria-label={closeAriaLabel}
          onClick={close}
        >
          <CloseIcon />
        </IconButton>
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

