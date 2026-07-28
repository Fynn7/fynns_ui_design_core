import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { DIALOG_TRANSITION_MS } from "./Dialog";
import { ChevronDownIcon } from "./icons";

export type CollapsibleProps = {
  /** Header content shown in the always-visible trigger row. */
  title: ReactNode;
  /** Optional right-aligned content in the header (e.g. action buttons). Not part of the toggle button. */
  actions?: ReactNode;
  /** Controlled open state. Omit to use the uncontrolled `defaultOpen`. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

function expandTransitionMs(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return DIALOG_TRANSITION_MS;
}

/**
 * Disclosure row that collapses its content behind a clickable header. Use it
 * to keep long lists (e.g. repeated form sections) scannable: each item shows a
 * compact summary and expands on demand. Works controlled (`open`) or
 * uncontrolled (`defaultOpen`). `.fynns-collapsible*`.
 *
 * Body expands/collapses with an M3-inspired container transform: the outer
 * card morphs height (`grid-template-rows` + presence `data-state`); body
 * content fades out instantly on close so the clip edge is not read as a
 * second rule. No head/body hairline (spacing only) — a mid border stacks
 * with the rising outer bottom edge while collapsing.
 *
 * Agents: call this once as the whole section — do not hand-assemble chevron,
 * head, trigger, or body chrome.
 *
 * @example
 * ```tsx
 * <Collapsible title="Presets" defaultOpen>
 *   {children}
 * </Collapsible>
 * ```
 */
export function Collapsible({
  title,
  actions,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  const bodyId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [rendered, setRendered] = useState(isOpen);
  const [entered, setEntered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), expandTransitionMs());
    return () => clearTimeout(timer);
  }, [isOpen]);

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const dataState = entered ? "open" : "closing";

  return (
    <div
      className={["fynns-collapsible", isOpen ? "fynns-collapsible--open" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="fynns-collapsible-head">
        <button
          type="button"
          className="fynns-collapsible-trigger"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={toggle}
        >
          <ChevronDownIcon className="fynns-collapsible-chevron" size={18} />
          <span className="fynns-collapsible-title">{title}</span>
        </button>
        {actions ? <div className="fynns-collapsible-actions">{actions}</div> : null}
      </div>
      {rendered ? (
        <div className="fynns-expand" data-state={dataState}>
          <div className="fynns-expand-inner">
            <div id={bodyId} className="fynns-collapsible-body" inert={isOpen ? undefined : true}>
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
