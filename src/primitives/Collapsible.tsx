import type { ReactNode } from "react";
import { useId, useState } from "react";
import { ChevronRightIcon, ICON_SIZE } from "./icons";

/** Visible section shell (`card`) or structure-only host (`plain`). */
export type CollapsibleChrome = "card" | "plain";

export type CollapsibleProps = {
  /** Header content shown in the always-visible trigger row. */
  title: ReactNode;
  /**
   * Optional glyph that occupies the disclose slot at rest (same place as the
   * chevron). On header hover (or keyboard focus-visible) the chevron replaces
   * it (direction still follows open state). On `(hover: none)` the slot stays
   * chevron-only. Omit to always show the chevron.
   * Prefer a ~16dp glyph (`--fynns-size-icon`). Decorative (`aria-hidden`);
   * put meaning in `title`.
   */
  icon?: ReactNode;
  /** Optional right-aligned content in the header (e.g. action buttons). Not part of the toggle button. */
  actions?: ReactNode;
  /**
   * Outer chrome. Default `card` — bordered shell for padded copy / forms.
   * `plain` — same outer shell (Collapsible remains the main container); use when
   * nesting a surface-owning child (CodeBlock, Surface, canvas, …) so the child
   * sits inset as a secondary frame. Prefer CodeBlock `variant="plain"` to avoid
   * an empty code head. Do not cancel body pad with negative margins.
   */
  chrome?: CollapsibleChrome;
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
 *
 * Body stays mounted so open and close both run the same CSS height + fade
 * transitions (M3-inspired container morph). When open, a full-bleed hairline
 * under the head meets the outer border (`chrome="card"`). Focus uses the same
 * quiet accent-tinted border as Input — not an inset focus ring.
 *
 * Optional `icon`: rests in the chevron slot; header hover / focus-visible
 * swaps to the expand chevron (`(hover: none)` keeps chevron only). No
 * separate leading column.
 *
 * Agents: call this once as the whole section — do not hand-assemble chevron,
 * head, trigger, or body chrome. When nesting a surface-owning child, pass
 * `chrome="plain"` (outer shell stays; child insets inside — do not cancel body
 * pad with negative margins).
 *
 * @example
 * ```tsx
 * <Collapsible title="Presets" defaultOpen>
 *   {children}
 * </Collapsible>
 *
 * <Collapsible title="Scripts" icon={<FolderOpenIcon aria-hidden />} actions={…}>
 *   {children}
 * </Collapsible>
 *
 * <Collapsible title="GSC" chrome="plain" defaultOpen>
 *   <CodeBlock variant="plain" language="gsc" … />
 * </Collapsible>
 * ```
 */
export function Collapsible({
  title,
  icon,
  actions,
  chrome = "card",
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
  const hasIcon = icon != null;
  const plain = chrome === "plain";

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={[
        "fynns-collapsible",
        isOpen ? "fynns-collapsible--open" : "",
        hasIcon ? "fynns-collapsible--has-icon" : "",
        plain ? "fynns-collapsible--plain" : "",
        className ?? "",
      ]
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
          <span className="fynns-collapsible-disclose" aria-hidden>
            {hasIcon ? <span className="fynns-collapsible-icon">{icon}</span> : null}
            <ChevronRightIcon className="fynns-collapsible-chevron" size={ICON_SIZE} />
          </span>
          <span className="fynns-collapsible-title">{title}</span>
        </button>
        {actions ? <div className="fynns-collapsible-actions">{actions}</div> : null}
      </div>
      <div className="fynns-expand" data-state={isOpen ? "open" : "closed"} aria-hidden={!isOpen}>
        <div className="fynns-expand-inner">
          <div id={bodyId} className="fynns-collapsible-body" inert={isOpen ? undefined : true}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
