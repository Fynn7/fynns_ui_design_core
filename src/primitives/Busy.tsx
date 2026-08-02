import type { HTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CircularProgress,
  type CircularProgressSize,
} from "./Progress";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function BusyStack({
  label,
  message,
  value,
  size,
  messageId,
}: {
  label: string;
  message: ReactNode;
  value?: number;
  size: CircularProgressSize;
  messageId?: string;
}) {
  return (
    <div className="fynns-busy-stack">
      <CircularProgress label={label} value={value} size={size} />
      <div className="fynns-busy-message" id={messageId}>
        {message}
      </div>
    </div>
  );
}

export type BusyScrimProps = {
  open: boolean;
  /** Progress accessible name; also used as visible text when `message` is omitted. */
  label: string;
  /** Visible copy under the ring. Defaults to `label`. */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** @default "md" */
  size?: CircularProgressSize;
};

/**
 * Full-viewport blocking busy layer (M3 scrim + circular progress + message).
 * Non-dismissible: no Esc / scrim click. Prefer `BusyRegion` for sectional waits.
 */
export function BusyScrim({
  open,
  label,
  message,
  value,
  size = "md",
}: BusyScrimProps) {
  const messageId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleMessage = message ?? label;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
      previous?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      className="fynns-busy-scrim"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby={messageId}
      tabIndex={-1}
    >
      <BusyStack
        label={label}
        message={visibleMessage}
        value={value}
        size={size}
        messageId={messageId}
      />
    </div>,
    document.body,
  );
}

export type BusyRegionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  busy: boolean;
  /** Progress accessible name; also used as visible text when `message` is omitted. */
  label: string;
  /** Visible copy under the ring. Defaults to `label`. */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** @default "md" */
  size?: CircularProgressSize;
  children: ReactNode;
};

/**
 * Sectional busy wrapper: children stay mounted under a dim layer with
 * circular progress + message. Sets `aria-busy` on the region while active.
 */
export function BusyRegion({
  busy,
  label,
  message,
  value,
  size = "md",
  children,
  className,
  ...rest
}: BusyRegionProps) {
  const messageId = useId();
  const visibleMessage = message ?? label;

  return (
    <div
      {...rest}
      className={join("fynns-busy-region", busy && "fynns-busy-region--busy", className)}
      aria-busy={busy || undefined}
    >
      <div className="fynns-busy-region-content">{children}</div>
      {busy ? (
        <div
          className="fynns-busy-region-overlay"
          role="status"
          aria-labelledby={messageId}
        >
          <BusyStack
            label={label}
            message={visibleMessage}
            value={value}
            size={size}
            messageId={messageId}
          />
        </div>
      ) : null}
    </div>
  );
}
