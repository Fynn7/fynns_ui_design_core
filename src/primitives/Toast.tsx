import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
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
};

const DEFAULT_DURATION_MS = 6000;
const EMPTY: ToastItem[] = [];

class ToastStore {
  private items: ToastItem[] = EMPTY;
  private listeners = new Set<() => void>();
  private timers = new Map<number | string, ReturnType<typeof setTimeout>>();
  private seq = 1;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): ToastItem[] => this.items;

  private emit() {
    for (const listener of this.listeners) listener();
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
    this.items = [...this.items.filter((existing) => existing.id !== id), item];
    this.emit();
    const existingTimer = this.timers.get(id);
    if (existingTimer) clearTimeout(existingTimer);
    if (duration !== Infinity && typeof window !== "undefined") {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
    return id;
  }

  dismiss(id?: number | string) {
    if (id === undefined) {
      for (const timer of this.timers.values()) clearTimeout(timer);
      this.timers.clear();
      this.items = EMPTY;
      this.emit();
      return;
    }
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.items = this.items.filter((item) => item.id !== id);
    this.emit();
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
      {items.map((item) => {
        const icon = levelIcon(item.level);
        return (
          <div
            key={item.id}
            className={["fynns-toast", `fynns-toast--${item.level}`].join(" ")}
            role={item.level === "error" ? "alert" : "status"}
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
      })}
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
