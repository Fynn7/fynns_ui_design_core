import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CircularProgress,
  LinearProgress,
  type CircularProgressSize,
} from "./Progress";
import { LoadingSkeleton } from "./LoadingSkeleton";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export type BusyIndicator = "skeleton" | "circular" | "linear";

function hasVisibleContent(content: ReactNode) {
  return content != null && content !== false && content !== "";
}

function isContentSkeleton(value: number | undefined, indicator: BusyIndicator, message: ReactNode, skeleton: ReactNode) {
  return value == null && indicator !== "circular" &&
    (hasVisibleContent(skeleton) || !hasVisibleContent(message));
}

function BusyStack({
  label,
  message,
  value,
  size,
  indicator,
  skeleton,
  messageId,
  fillSkeleton = false,
}: {
  label: string;
  message: ReactNode;
  value?: number;
  size: CircularProgressSize;
  indicator: BusyIndicator;
  skeleton?: ReactNode;
  messageId?: string;
  fillSkeleton?: boolean;
}) {
  const chrome = value != null ? "linear"
    : isContentSkeleton(value, indicator, message, skeleton) ? "skeleton" : "circular";
  return (
    <div
      className={join(
        "fynns-busy-stack",
        chrome === "linear" && "fynns-busy-stack--linear",
        chrome === "skeleton" && "fynns-busy-stack--skeleton",
      )}
      data-loading-appearance={chrome === "circular" ? "archived-ring" : chrome}
    >
      {chrome === "skeleton" ? (
        <>
          <div className="fynns-busy-skeleton" aria-hidden="true">
            {hasVisibleContent(skeleton) ? skeleton : <LoadingSkeleton fill={fillSkeleton} aria-hidden="true" />}
          </div>
          <span className="fynns-sr-only" id={messageId}>{label}</span>
        </>
      ) : (
        <>
          {chrome === "linear" ? (
            <LinearProgress label={label} value={value} />
          ) : (
            <CircularProgress label={label} size={size} />
          )}
          <div
            className={join("fynns-busy-message", chrome === "linear" && !hasVisibleContent(message) && "fynns-sr-only")}
            id={messageId}
          >
            {hasVisibleContent(message) ? message : label}
          </div>
        </>
      )}
    </div>
  );
}

export type BusyScrimProps = {
  open: boolean;
  /** Accessible name only on content skeletons; never visible loading copy. */
  label: string;
  /**
   * @deprecated Permanently archived message + ring wait (unless real value is supplied).
   * Omit for content-position skeletons. Explicit skeleton slots suppress this copy.
   */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** Archived ring size. Skeleton geometry belongs to the content slot. @default "md" */
  size?: CircularProgressSize;
  /**
   * Content wait → skeleton (default); real `value` → linear progress.
   * `circular` is permanently archived / deprecated; explicit visible message
   * also opts into the archived ring when no skeleton slot is supplied.
   */
  indicator?: BusyIndicator;
  /** Upcoming content footprint, placed in the region; hides message. Ignored with `value`. */
  skeleton?: ReactNode;
};

/**
 * Full-viewport blocking layer: content skeletons and an accessible-only label.
 * Explicit message / circular retains the permanently archived ring presentation.
 * Non-dismissible: no Esc / scrim click. Prefer `BusyRegion` for sectional waits.
 * For heavy boots, open via `runBusyTask` / `useBusyTask` (with `timeoutMs` /
 * `signal` when the work can hang) so the skeleton can paint
 * before the main thread blocks (see AGENTS.md Feedback).
 */
export function BusyScrim({
  open,
  label,
  message,
  value,
  size = "md",
  indicator = "skeleton",
  skeleton,
}: BusyScrimProps) {
  const messageId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const skeletonMode = isContentSkeleton(value, indicator, message, skeleton);

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
      className={join("fynns-busy-scrim", skeletonMode && "fynns-busy-scrim--skeleton")}
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby={messageId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <BusyStack
        label={label}
        message={message}
        value={value}
        size={size}
        indicator={indicator}
        skeleton={skeleton}
        messageId={messageId}
        fillSkeleton
      />
    </div>,
    document.body,
  );
}

export type BusyRegionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  busy: boolean;
  /** Accessible name only on content skeletons; never visible loading copy. */
  label: string;
  /**
   * @deprecated Permanently archived message + ring wait (unless real value is supplied).
   * Omit for content-position skeletons. Explicit skeleton slots suppress this copy.
   */
  message?: ReactNode;
  /** Determinate progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  /** Archived ring size. Skeleton geometry belongs to the content slot. @default "md" */
  size?: CircularProgressSize;
  /**
   * Content wait → skeleton (default); real `value` → linear progress.
   * `circular` is permanently archived / deprecated; explicit visible message
   * also opts into the archived ring when no skeleton slot is supplied.
   */
  indicator?: BusyIndicator;
  /** Upcoming content footprint, placed in the region; hides message. Ignored with `value`. */
  skeleton?: ReactNode;
  /**
   * Stretch to a height-resolved parent (`FillColumn` children, shell main /
   * canvas) so the text skeleton fills the **visible pane**. Required for
   * cold-start (no content yet). Do not pair with `EmptyState`.
   */
  fill?: boolean;
  /** Omit / `null` on cold-start when `fill` is set. */
  children?: ReactNode;
};

/**
 * Content-position loading: children remain mounted, hidden and inert while a
 * matching skeleton occupies their bounds. No visible loading text. Empty
 * cold-start stays in normal flow unless fill resolves to the pane height.
 *
 * Explicit message / circular is permanently archived: the centered ring and
 * copy retain the soft frosted mask over existing content. Empty cold-start
 * has no mask island. Prefer content skeletons for all new consumer UI.
 */
export function BusyRegion({
  busy,
  label,
  message,
  value,
  size = "md",
  indicator = "skeleton",
  skeleton,
  fill = false,
  children,
  className,
  ...rest
}: BusyRegionProps) {
  const messageId = useId();
  const skeletonMode = isContentSkeleton(value, indicator, message, skeleton);

  return (
    <div
      {...rest}
      className={join(
        "fynns-busy-region",
        busy && "fynns-busy-region--busy",
        busy && skeletonMode && "fynns-busy-region--skeleton",
        busy && skeletonMode && !hasVisibleContent(skeleton) && "fynns-busy-region--default-skeleton",
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
          className={join("fynns-busy-region-overlay", skeletonMode && "fynns-busy-region-overlay--skeleton")}
          role="status"
          aria-labelledby={messageId}
        >
          <BusyStack
            label={label}
            message={message}
            value={value}
            size={size}
            indicator={indicator}
            skeleton={skeleton}
            messageId={messageId}
            fillSkeleton={fill || hasVisibleContent(children)}
          />
        </div>
      ) : null}
    </div>
  );
}
