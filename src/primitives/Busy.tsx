import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CircularProgress,
  type CircularProgressSize,
} from "./Progress";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
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

    const onWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onWindowKeyDown, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onWindowKeyDown, true);
      previous?.focus?.();
    };
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key !== "Tab") return;
    const container = rootRef.current;
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
      onKeyDown={onKeyDown}
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
      <div
        className="fynns-busy-region-content"
        {...(busy ? { inert: true } : {})}
      >
        {children}
      </div>
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
