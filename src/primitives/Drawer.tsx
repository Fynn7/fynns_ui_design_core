import type { ReactNode } from "react";
import { useId } from "react";
import { DialogFrame } from "./Dialog";
import type { DrawerSide } from "./Dialog";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Edge the drawer slides in from. Defaults to the right. */
  side?: DrawerSide;
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
 * + close) and a scrollable body. Built on the shared `DialogFrame`. Always
 * modal (scrim + focus trap). Prefer `NavigationDrawer` for destination
 * navigation.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
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
  const showHead = visibleTitle || !!headActions || showCloseButton;

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      variant="drawer"
      side={side}
      modal
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
              <Tooltip content={closeAriaLabel}>
                <IconButton
                  variant="ghost"
                  className="fynns-dialog-close"
                  aria-label={closeAriaLabel}
                  onClick={onClose}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
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
      <div className="fynns-dialog-body fynns-scroll">{children}</div>
    </DialogFrame>
  );
}
