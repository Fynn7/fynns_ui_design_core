import type { ReactNode } from "react";
import { useId } from "react";
import { Button } from "./Button";
import { DialogFrame } from "./Dialog";
import { CloseIcon } from "./icons";

export type BottomSheetSize = "content" | "half" | "full";

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /**
   * Modal sheets lock body scroll, trap focus, and dim/block the page. A
   * non-modal sheet leaves the rest of the page interactive (no scrim).
   */
  modal?: boolean;
  title?: ReactNode;
  /** Supporting text under the title (`body-medium` / on-surface-variant). */
  description?: ReactNode;
  /**
   * Optional trailing header control. M3 bottom sheets usually omit a close
   * icon (dismiss via scrim / Esc / drag); default is `false`.
   */
  showCloseButton?: boolean;
  /** M3 drag-handle pill. Default `true`. */
  showHandle?: boolean;
  closeAriaLabel?: string;
  ariaLabel?: string;
  /**
   * Height behavior:
   * - `content` — grow with body up to max height (default).
   * - `half` — ~50vh.
   * - `full` — near-viewport (`--fynns-layout-sheet-max-height`).
   */
  size?: BottomSheetSize;
  /** Optional bottom action row (M3 start-aligned actions). */
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/**
 * M3 bottom sheet — `surface-container-low`, extra-large top corners (28dp),
 * drag handle, title-large headline. Prefer `Drawer` for desktop side panels.
 * @see https://m3.material.io/components/bottom-sheets/specs
 */
export function BottomSheet({
  open,
  onClose,
  modal = true,
  title,
  description,
  showCloseButton = false,
  showHandle = true,
  closeAriaLabel = "Close",
  ariaLabel,
  size = "content",
  actions,
  className,
  children,
}: BottomSheetProps) {
  const titleId = useId();
  const showHeader = Boolean(title) || showCloseButton;
  const panelClass = [
    size === "half" ? "fynns-dialog-panel--sheet-half" : "",
    size === "full" ? "fynns-dialog-panel--sheet-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      variant="sheet"
      modal={modal}
      panelClassName={panelClass || undefined}
      labelledBy={title ? titleId : undefined}
      ariaLabel={ariaLabel}
    >
      {showHandle ? (
        <div className="fynns-sheet-handle" aria-hidden>
          <span className="fynns-sheet-handle-pill" />
        </div>
      ) : null}

      {showHeader ? (
        <div className="fynns-sheet-header">
          {title ? (
            <h2 id={titleId} className="fynns-sheet-title">
              {title}
            </h2>
          ) : (
            <span className="fynns-sheet-header-spacer" />
          )}
          {showCloseButton ? (
            <Button
              iconOnly
              variant="ghost"
              className="fynns-sheet-close"
              aria-label={closeAriaLabel}
              onClick={onClose}
            >
              <CloseIcon />
            </Button>
          ) : null}
        </div>
      ) : null}

      {description ? (
        <p className="fynns-sheet-description">{description}</p>
      ) : null}

      {children != null ? (
        <div className="fynns-sheet-body fynns-scroll">{children}</div>
      ) : null}

      {actions != null ? (
        <div className="fynns-sheet-actions">{actions}</div>
      ) : null}
    </DialogFrame>
  );
}
