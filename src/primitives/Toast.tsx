import type { ReactNode } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from "./icons";

/**
 * Self-developed toast system with an imperative API compatible with the
 * subset of `sonner` used across the apps (`toast`, `toast.message`,
 * `toast.success`, `toast.error`, `toast.warning`, `toast.info`,
 * `toast.dismiss`). Render `<Toaster />` once near the app root.
 */
export type ToastLevel = "message" | "success" | "error" | "warning" | "info";

export type ToastAction = { label: ReactNode; onClick: () => void };

export type ToastOptions = {
  id?: number | string;
  description?: ReactNode;
  duration?: number;
  action?: ToastAction;
};

export type ToastItem = {
  id: number | string;
  level: ToastLevel;
  message: ReactNode;
  description?: ReactNode;
  duration: number;
  action?: ToastAction;
  closing?: boolean;
};

const DEFAULT_DURATION_MS = 6000;
const EMPTY: ToastItem[] = [];

/**
 * Slide/fade duration for enter/exit transitions. Keep in sync with
 * `--fynns-duration-base` (used by the toast CSS transition).
 */
const TOAST_TRANSITION_MS = 240;

class ToastStore {
  private items: ToastItem[] = EMPTY;
  private listeners = new Set<() => void>();
  private timers = new Map<number | string, ReturnType<typeof setTimeout>>();
  private exitTimers = new Map<number | string, ReturnType<typeof setTimeout>>();
  private seq = 1;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): ToastItem[] => this.items;

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private clearAutoDismissTimer(id: number | string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearExitTimer(id: number | string) {
    const timer = this.exitTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.exitTimers.delete(id);
    }
  }

  private scheduleAutoDismiss(id: number | string, duration: number) {
    this.clearAutoDismissTimer(id);
    if (duration !== Infinity && typeof window !== "undefined") {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
  }

  private removeItem(id: number | string) {
    this.clearAutoDismissTimer(id);
    this.clearExitTimer(id);
    this.items = this.items.filter((item) => item.id !== id);
    this.emit();
  }

  add(level: ToastLevel, message: ReactNode, opts: ToastOptions = {}): number | string {
    const id = opts.id ?? this.seq++;
    const duration = opts.duration ?? DEFAULT_DURATION_MS;
    const item: ToastItem = {
      id,
      level,
      message,
      description: opts.description,
      duration,
      action: opts.action,
    };
    this.clearExitTimer(id);
    this.items = [...this.items.filter((existing) => existing.id !== id), item];
    this.emit();
    this.scheduleAutoDismiss(id, duration);
    return id;
  }

  dismiss(id?: number | string) {
    if (id === undefined) {
      for (const timer of this.timers.values()) clearTimeout(timer);
      this.timers.clear();
      const closingIds = this.items.map((item) => item.id);
      if (closingIds.length === 0) return;
      this.items = this.items.map((item) => ({ ...item, closing: true }));
      this.emit();
      for (const closingId of closingIds) {
        this.clearExitTimer(closingId);
        this.exitTimers.set(
          closingId,
          setTimeout(() => this.removeItem(closingId), TOAST_TRANSITION_MS),
        );
      }
      return;
    }

    const existing = this.items.find((item) => item.id === id);
    if (!existing || existing.closing) return;

    this.clearAutoDismissTimer(id);
    this.items = this.items.map((item) =>
      item.id === id ? { ...item, closing: true } : item,
    );
    this.emit();

    this.clearExitTimer(id);
    this.exitTimers.set(
      id,
      setTimeout(() => this.removeItem(id), TOAST_TRANSITION_MS),
    );
  }
}

const store = new ToastStore();

type ToastFn = ((message: ReactNode, opts?: ToastOptions) => number | string) & {
  message: (message: ReactNode, opts?: ToastOptions) => number | string;
  success: (message: ReactNode, opts?: ToastOptions) => number | string;
  error: (message: ReactNode, opts?: ToastOptions) => number | string;
  warning: (message: ReactNode, opts?: ToastOptions) => number | string;
  info: (message: ReactNode, opts?: ToastOptions) => number | string;
  dismiss: (id?: number | string) => void;
};

const base = (message: ReactNode, opts?: ToastOptions) => store.add("message", message, opts);
export const toast: ToastFn = Object.assign(base, {
  message: (message: ReactNode, opts?: ToastOptions) => store.add("message", message, opts),
  success: (message: ReactNode, opts?: ToastOptions) => store.add("success", message, opts),
  error: (message: ReactNode, opts?: ToastOptions) => store.add("error", message, opts),
  warning: (message: ReactNode, opts?: ToastOptions) => store.add("warning", message, opts),
  info: (message: ReactNode, opts?: ToastOptions) => store.add("info", message, opts),
  dismiss: (id?: number | string) => store.dismiss(id),
});

function levelIcon(level: ToastLevel): ReactNode {
  switch (level) {
    case "error":
      return <AlertCircleIcon size={16} />;
    case "warning":
      return <AlertTriangleIcon size={16} />;
    case "success":
      return <CheckCircleIcon size={16} />;
    case "info":
      return <InfoIcon size={16} />;
    default:
      return null;
  }
}

export type ToasterPosition =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left"
  | "top-center";

export type ToasterProps = {
  position?: ToasterPosition;
  className?: string;
};

type ToastEntryProps = {
  item: ToastItem;
};

function ToastEntry({ item }: ToastEntryProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (item.closing) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [item.closing, item.id]);

  const icon = levelIcon(item.level);
  const dataState = entered && !item.closing ? "open" : undefined;

  return (
    <div
      className={["fynns-toast", `fynns-toast--${item.level}`].join(" ")}
      role={item.level === "error" ? "alert" : "status"}
      data-state={dataState}
    >
      {icon ? <span className="fynns-toast-icon">{icon}</span> : null}
      <div className="fynns-toast-body">
        <div className="fynns-toast-title">{item.message}</div>
        {item.description ? (
          <div className="fynns-toast-desc">{item.description}</div>
        ) : null}
      </div>
      {item.action ? (
        <button
          type="button"
          className="fynns-toast-action"
          onClick={() => {
            item.action?.onClick();
            store.dismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="fynns-toast-close"
        aria-label="Dismiss"
        onClick={() => store.dismiss(item.id)}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

/** Renders the live toast stack. Mount once near the app root. */
export function Toaster({ position = "bottom-right", className }: ToasterProps) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);
  return (
    <div
      className={[`fynns-toaster`, `fynns-toaster--${position}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((item) => (
        <ToastEntry key={item.id} item={item} />
      ))}
    </div>
  );
}

/**
 * Declarative single toast (compat for the old `<Toast open onOpenChange>`
 * pattern). Self-rendered, fixed bottom-center; auto-dismisses after
 * `durationMs`. Prefer the imperative `toast.*` API for new code.
 */
export type ToastProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  action?: ReactNode;
  durationMs?: number;
};

export function Toast({ open, onOpenChange, children, action, durationMs = 6000 }: ToastProps) {
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), TOAST_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !rendered) return;
    const id = window.setTimeout(() => onOpenChange(false), durationMs);
    return () => window.clearTimeout(id);
  }, [open, rendered, durationMs, onOpenChange]);

  if (!rendered) return null;

  const dataState = entered && open ? "open" : undefined;

  return (
    <div
      className="fynns-toast fynns-toast--standalone"
      role="status"
      data-state={dataState}
    >
      <div className="fynns-toast-body">
        <div className="fynns-toast-title">{children}</div>
      </div>
      {action ? <div className="fynns-toast-actions">{action}</div> : null}
      <button
        type="button"
        className="fynns-toast-close"
        aria-label="Dismiss"
        onClick={() => onOpenChange(false)}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

/**
 * Compat: wraps children and renders a `<Toaster />`. New code can just place
 * `<Toaster />` once and call `toast.*` imperatively.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

/** Compat shape for the old afs `useToast()` API. */
export type ToastApi = {
  showToast: (input: { message: ReactNode; level?: ToastLevel }) => void;
};

/** Compat hook mirroring the old afs `useToast().showToast({ message, level })`. */
export function useToast(): ToastApi {
  return {
    showToast: ({ message, level = "message" }: { message: ReactNode; level?: ToastLevel }) => {
      store.add(level, message);
    },
  };
}
