import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { DURATION_TOKENS } from "../theme/motionTokens";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type SnackbarDuration = "short" | "long" | "indefinite";

export type SnackbarAction = {
  label: string;
  onClick: () => void;
};

export type SnackbarOptions = {
  /** Optional single text action (M3: at most one). */
  action?: SnackbarAction;
  /**
   * Auto-dismiss timing. Defaults to `indefinite` when `action` is set,
   * otherwise `short`.
   */
  duration?: SnackbarDuration;
  /**
   * Show a trailing close control. Defaults to `true` when duration is
   * `indefinite`.
   */
  dismissible?: boolean;
  /** Accessible label for the close IconButton. */
  dismissAriaLabel?: string;
};

export type SnackbarItem = {
  id: string;
  message: ReactNode;
  action?: SnackbarAction;
  duration: SnackbarDuration;
  dismissible: boolean;
  dismissAriaLabel: string;
  closing?: boolean;
};

const SHORT_MS = 4000;
const LONG_MS = 10000;
const EXIT_MS = Number.parseFloat(DURATION_TOKENS.base) || 240;

const DURATION_MS: Record<SnackbarDuration, number> = {
  short: SHORT_MS,
  long: LONG_MS,
  indefinite: Number.POSITIVE_INFINITY,
};

type Listener = () => void;

class SnackbarStore {
  private item: SnackbarItem | null = null;
  private listeners = new Set<Listener>();
  private autoTimer: ReturnType<typeof setTimeout> | null = null;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;
  private seq = 0;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): SnackbarItem | null => this.item;

  getServerSnapshot = (): SnackbarItem | null => null;

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private clearAutoTimer() {
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private clearExitTimer() {
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }
  }

  private scheduleAutoDismiss(id: string, duration: SnackbarDuration) {
    this.clearAutoTimer();
    const ms = DURATION_MS[duration];
    if (!Number.isFinite(ms) || typeof window === "undefined") return;
    this.autoTimer = setTimeout(() => {
      this.autoTimer = null;
      this.dismiss(id);
    }, ms);
  }

  show(message: ReactNode, opts: SnackbarOptions = {}): string {
    const duration =
      opts.duration ?? (opts.action ? "indefinite" : "short");
    const dismissible = opts.dismissible ?? duration === "indefinite";
    const id = `snackbar-${++this.seq}`;
    const next: SnackbarItem = {
      id,
      message,
      action: opts.action,
      duration,
      dismissible,
      dismissAriaLabel: opts.dismissAriaLabel ?? "Dismiss",
    };

    this.clearAutoTimer();
    this.clearExitTimer();
    this.item = next;
    this.emit();
    this.scheduleAutoDismiss(id, duration);
    return id;
  }

  dismiss(id?: string) {
    const current = this.item;
    if (!current || current.closing) return;
    if (id !== undefined && current.id !== id) return;

    this.clearAutoTimer();
    this.item = { ...current, closing: true };
    this.emit();

    if (typeof window === "undefined") {
      this.item = null;
      this.emit();
      return;
    }

    this.clearExitTimer();
    this.exitTimer = setTimeout(() => {
      this.exitTimer = null;
      if (this.item?.id === current.id) {
        this.item = null;
        this.emit();
      }
    }, EXIT_MS);
  }
}

const store = new SnackbarStore();

type SnackbarFn = ((message: ReactNode, opts?: SnackbarOptions) => string) & {
  dismiss: (id?: string) => void;
};

/**
 * Imperative M3 Snackbar API. Mount `<SnackbarHost />` once near the app root.
 * Only one snackbar is visible at a time; a new call replaces the current one.
 */
export const snackbar: SnackbarFn = Object.assign(
  (message: ReactNode, opts?: SnackbarOptions) => store.show(message, opts),
  {
    dismiss: (id?: string) => store.dismiss(id),
  },
);

export type SnackbarHostProps = {
  className?: string;
};

/**
 * Live snackbar portal. Mount once (e.g. next to the app shell).
 */
export function SnackbarHost({ className }: SnackbarHostProps) {
  const item = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [entered, setEntered] = useState(false);
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!item || item.closing) {
      setEntered(false);
      prevId.current = item?.id ?? null;
      return;
    }
    if (prevId.current !== item.id) {
      setEntered(false);
      prevId.current = item.id;
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(true);
  }, [item]);

  if (typeof document === "undefined" || !item) return null;

  const open = entered && !item.closing;
  const onAction = () => {
    item.action?.onClick();
    store.dismiss(item.id);
  };

  return createPortal(
    <div
      className={["fynns-snackbar-host", className ?? ""].filter(Boolean).join(" ")}
      data-state={open ? "open" : "closed"}
    >
      <div
        className="fynns-snackbar"
        role="status"
        aria-live="polite"
        data-state={open ? "open" : "closed"}
      >
        <div className="fynns-snackbar__message">{item.message}</div>
        {item.action || item.dismissible ? (
          <div className="fynns-snackbar__trailing">
            {item.action ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="fynns-snackbar__action"
                onClick={onAction}
              >
                {item.action.label}
              </Button>
            ) : null}
            {item.dismissible ? (
              <Tooltip content={item.dismissAriaLabel}>
                <IconButton
                  type="button"
                  size="sm"
                  className="fynns-snackbar__dismiss"
                  aria-label={item.dismissAriaLabel}
                  onClick={() => store.dismiss(item.id)}
                >
                  <CloseIcon size={16} aria-hidden />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
