import type { ReactNode } from "react";
import { useId, useState } from "react";
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

/**
 * Disclosure row that collapses its content behind a clickable header. Use it
 * to keep long lists (e.g. repeated form sections) scannable: each item shows a
 * compact summary and expands on demand. Works controlled (`open`) or
 * uncontrolled (`defaultOpen`). `.fynns-collapsible*`.
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

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

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
      {isOpen ? (
        <div id={bodyId} className="fynns-collapsible-body">
          {children}
        </div>
      ) : null}
    </div>
  );
}
