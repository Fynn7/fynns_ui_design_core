import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { Button } from "./Button";
import { DialogFrame } from "./Dialog";
import type { DialogDataState, DrawerSide } from "./Dialog";
import { CloseIcon } from "./icons";

/**
 * Slide duration for the enter/exit transition. Keep in sync with
 * `--fynns-duration-base` (used by the drawer CSS transition).
 */
const DRAWER_TRANSITION_MS = 240;

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Edge the drawer slides in from. Defaults to the right. */
  side?: DrawerSide;
  /**
   * Modal drawers lock body scroll, trap focus, and dim/block the page. A
   * non-modal drawer leaves the rest of the page interactive (e.g. a list the
   * user can keep clicking to swap the drawer content).
   */
  modal?: boolean;
  title?: ReactNode;
  visibleTitle?: boolean;
  description?: ReactNode;
  headActions?: ReactNode;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

/**
 * High-level side drawer with a sliding panel, standard head (title + actions
 * + close) and a scrollable body. Built on the shared `DialogFrame`; manages
 * its own enter/exit animation lifecycle so the panel slides out before it
 * unmounts.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  modal = true,
  title,
  visibleTitle = true,
  description,
  headActions,
  showCloseButton = true,
  closeAriaLabel = "Close",
  ariaLabel,
  className,
  children,
}: DrawerProps) {
  const titleId = useId();
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), DRAWER_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  if (!rendered) return null;

  const dataState: DialogDataState = entered ? "open" : "closing";
  const showHead = visibleTitle || !!headActions || showCloseButton;

  return (
    <DialogFrame
      open={rendered}
      onClose={onClose}
      variant="drawer"
      side={side}
      modal={modal}
      dataState={dataState}
      panelClassName={className}
      labelledBy={title ? titleId : undefined}
      ariaLabel={ariaLabel}
    >
      {showHead ? (
        <div className="fynns-dialog-head">
          {title ? (
            <h2
              id={titleId}
              className={visibleTitle ? "fynns-dialog-title" : "fynns-sr-only"}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <div className="fynns-dialog-head-actions">
            {headActions}
            {showCloseButton ? (
              <Button
                iconOnly
                variant="ghost"
                className="fynns-dialog-close"
                aria-label={closeAriaLabel}
                onClick={onClose}
              >
                <CloseIcon size={22} />
              </Button>
            ) : null}
          </div>
        </div>
      ) : title ? (
        <h2 id={titleId} className="fynns-sr-only">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="fynns-dialog-description">{description}</p>
      ) : null}
      <div className="fynns-dialog-body">{children}</div>
    </DialogFrame>
  );
}
