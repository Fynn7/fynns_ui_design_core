import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CircularProgress,
  LinearProgress,
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

export type BusyIndicator = "circular" | "linear";

function BusyStack({
  label,
  message,
  value,
  size,
  indicator,
  messageId,
}: {
  label: string;
  message: ReactNode;
  value?: number;
  size: CircularProgressSize;
  indicator: BusyIndicator;
  messageId?: string;
}) {
  return (
    <div
      className={join(
        "fynns-busy-stack",
        indicator === "linear" && "fynns-busy-stack--linear",
      )}
    >
      {indicator === "linear" ? (
        <LinearProgress label={label} value={value} />
      ) : (
        <CircularProgress label={label} value={value} size={size} />
      )}
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
  /**
   * Visible copy under the single progress chrome. Defaults to `label`.
   * Phrasing only — never nest `LinearProgress` / `CircularProgress`.
   */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** Ring size. Ignored when `indicator` is `linear`. @default "md" */
  size?: CircularProgressSize;
  /**
   * One progress chrome per host. Known % / counts → `linear`;
   * unknown wait → `circular` (default).
   */
  indicator?: BusyIndicator;
};

/**
 * Full-viewport blocking busy layer (M3 scrim + one progress chrome + message).
 * Non-dismissible: no Esc / scrim click. Prefer `BusyRegion` for sectional waits.
 * For heavy boots, open via `runBusyTask` / `useBusyTask` so the ring can paint
 * before the main thread blocks (see AGENTS.md Feedback).
 */
export function BusyScrim({
  open,
  label,
  message,
  value,
  size = "md",
  indicator = "circular",
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
        indicator={indicator}
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
  /**
   * Visible copy under the single progress chrome. Defaults to `label`.
   * Phrasing only — never nest `LinearProgress` / `CircularProgress`.
   */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** Ring size. Ignored when `indicator` is `linear`. @default "md" */
  size?: CircularProgressSize;
  /**
   * One progress chrome per host. Known % / counts → `linear`;
   * unknown wait → `circular` (default).
   */
  indicator?: BusyIndicator;
  /**
   * Stretch to a height-resolved parent (`FillColumn` children, shell main /
   * canvas) so the overlay centers in the **visible pane**. Required for
   * cold-start (no content yet). Do not pair with `EmptyState`.
   */
  fill?: boolean;
  /** Omit / `null` on cold-start when `fill` is set. */
  children?: ReactNode;
};

/**
 * Sectional busy wrapper: children stay mounted under a **frosted blur** overlay
 * (`backdrop-filter` + transparent fill — well colors unchanged; not
 * `--fynns-color-overlay` tint or `surface-*` wash). Sets `aria-busy` on the
 * region while active. Overlay uses `place-items: center` — the chrome sits in
 * the region's box, so a content-sized host leaves it stuck at the top of a
 * tall pane. **Empty cold-start without `fill`:** chrome is in normal flow
 * (not absolute) so it cannot paint over previous siblings such as a
 * NavigationDrawer `SearchBar`. Full-viewport blocking → `BusyScrim`.
 */
export function BusyRegion({
  busy,
  label,
  message,
  value,
  size = "md",
  indicator = "circular",
  fill = false,
  children,
  className,
  ...rest
}: BusyRegionProps) {
  const messageId = useId();
  const visibleMessage = message ?? label;

  return (
    <div
      {...rest}
      className={join(
        "fynns-busy-region",
        busy && "fynns-busy-region--busy",
        fill && "fynns-busy-region--fill",
        className,
      )}
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
            indicator={indicator}
            messageId={messageId}
          />
        </div>
      ) : null}
    </div>
  );
}
