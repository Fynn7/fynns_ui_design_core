import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";

export type EndAsideProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

function endAsideTransitionMs(): number {
  if (typeof window === "undefined") return 240;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--fynns-duration-base")
    .trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 240;
  if (raw.endsWith("ms")) return value;
  if (raw.endsWith("s")) return value * 1000;
  return 240;
}

/**
 * End-edge supporting pane with **width** open/close (no translate) so the
 * canvas | aside seam stays a hard edge. Toggle lives in the consumer’s
 * `TopAppBar` trailing (IconButton) — not inside this component.
 *
 * Place beside the canvas inside `ClippedNavShell`’s main column (flex row).
 * Soft floor: `--fynns-layout-end-aside-min-width` (`min(token, 100%)`).
 *
 * **Chat dual placement:** `ChatMessage` / composer may fill this pane —
 * host = 100% of aside content (rem ceiling dropped); user bubble ceiling
 * lifts to 100% of that host (matches composer shell on long turns); composer
 * 100%. Start-edge chat hosts use `.fynns-chat-host--fill` instead. See
 * AGENTS.md Feedback → ChatMessage.
 *
 * @example
 * ```tsx
 * <div className="app-main-row">
 *   <main>…</main>
 *   <EndAside open={inspectorOpen}>{inspector}</EndAside>
 * </div>
 * ```
 */
export function EndAside({ open, children, className, style }: EndAsideProps) {
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(open);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = window.setTimeout(() => setRendered(false), endAsideTransitionMs());
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!rendered) return null;

  return (
    <aside
      className={["fynns-end-aside", className ?? ""].filter(Boolean).join(" ")}
      data-state={entered ? "open" : "closing"}
      aria-hidden={!open || undefined}
      inert={!open ? true : undefined}
      style={style}
    >
      {children}
    </aside>
  );
}
