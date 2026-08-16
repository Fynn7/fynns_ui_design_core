import {
  Children,
  forwardRef,
  isValidElement,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { DialogFrame, type DrawerSide } from "./Dialog";
import { ChevronRightIcon, ICON_SIZE } from "./icons";

/** True when any nested destination (or nested group) reports `active`. */
function hasActiveDestination(node: ReactNode): boolean {
  let found = false;
  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) return;
    const props = child.props as { active?: boolean; children?: ReactNode };
    if (props.active) {
      found = true;
      return;
    }
    if (props.children != null) found = hasActiveDestination(props.children);
  });
  return found;
}

export type NavigationDrawerVariant = "modal" | "standard";

export type NavigationDrawerProps = {
  /**
   * - `modal` — slides over content with scrim (default). Requires `open` /
   *   `onClose`.
   * - `standard` — permanent / always-visible sheet (no overlay). Prefer for
   *   medium+ layouts; use `NavigationRail` when space is tighter.
   */
  variant?: NavigationDrawerVariant;
  open?: boolean;
  onClose?: () => void;
  /** Modal slide-in edge. Default `left`. Ignored for `standard`. */
  side?: DrawerSide;
  /**
   * Modal only: lock scroll / trap focus / block page. Default `true`.
   * Pass `false` for a dismissible but non-blocking sheet.
   */
  modal?: boolean;
  /** Optional top headline inside the sheet (M3 title-small). */
  headline?: ReactNode;
  ariaLabel?: string;
  className?: string;
  /**
   * Destinations as **direct** body children: `NavigationDrawerItem`,
   * `NavigationDrawerHeadline`, `NavigationDrawerGroup`, `Divider`, etc.
   * Body siblings (including destination-density SearchBar / tools) share
   * `--fynns-navdrawer-section-gap` (4dp) — same as Item ↔ Item.
   * Do **not** wrap destinations in `.fynns-unit-stack`.
   */
  children?: ReactNode;
};

function DrawerSheet({
  headline,
  className,
  children,
  ...navRest
}: {
  headline?: ReactNode;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const rootClass = ["fynns-nav-drawer", className ?? ""].filter(Boolean).join(" ");
  return (
    <nav {...navRest} className={rootClass}>
      {headline != null && headline !== false ? (
        <div className="fynns-nav-drawer-headline">{headline}</div>
      ) : null}
      <div className="fynns-nav-drawer-body fynns-scroll">{children}</div>
    </nav>
  );
}

/**
 * M3 Navigation drawer — destination list in a dense side sheet.
 * Modal overlays content; `standard` sits in the layout permanently.
 * Prefer `Drawer` for generic side panels (forms, inspectors).
 * Sibling Item / Group / Headline / SearchBar / tools spacing uses
 * `--fynns-navdrawer-section-gap` (4dp) — never `.fynns-unit-stack` for the
 * destination list itself.
 * @see https://m3.material.io/components/navigation-drawer/overview
 */
export function NavigationDrawer({
  variant = "modal",
  open = false,
  onClose,
  side = "left",
  modal = true,
  headline,
  ariaLabel,
  className,
  children,
}: NavigationDrawerProps) {
  if (variant === "standard") {
    return (
      <DrawerSheet
        headline={headline}
        className={["fynns-nav-drawer--standard", className ?? ""]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
      >
        {children}
      </DrawerSheet>
    );
  }

  if (!onClose) {
    throw new Error('NavigationDrawer variant="modal" requires onClose.');
  }

  const panelClass = ["fynns-dialog-panel--nav-drawer", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <DialogFrame
      open={open}
      onClose={onClose}
      variant="drawer"
      side={side}
      modal={modal}
      panelClassName={panelClass}
      ariaLabel={ariaLabel}
    >
      <DrawerSheet headline={headline}>{children}</DrawerSheet>
    </DialogFrame>
  );
}

export type NavigationDrawerHeadlineProps = HTMLAttributes<HTMLDivElement>;

/**
 * Static section label inside a navigation drawer (M3 headline).
 * For collapsible Cursor-style folders use `NavigationDrawerGroup`.
 */
export function NavigationDrawerHeadline({
  className,
  children,
  ...rest
}: NavigationDrawerHeadlineProps) {
  return (
    <div
      {...rest}
      className={["fynns-nav-drawer-section-headline", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export type NavigationDrawerGroupProps = {
  /** Group title (visible + accessible name for the disclose control). */
  label: string;
  /**
   * Optional leading glyph — any node (folder, globe, sparkles, …).
   * Does **not** own the disclose chevron (trailing, always present).
   */
  icon?: ReactNode;
  /** Controlled open state. Omit for uncontrolled `defaultOpen`. */
  open?: boolean;
  /** Initial open when uncontrolled. Default `true` (match always-visible lists). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Nested destinations — usually `NavigationDrawerItem` children. */
  children: ReactNode;
};

/**
 * Collapsible destination group (Cursor-style folder row + one-level indent).
 * Leading `icon` is caller-owned; trailing chevron discloses. Not a destination
 * itself — selection stays on nested `NavigationDrawerItem`s. When collapsed and
 * a nested item is `active`, the trigger shows the same selected pill so the
 * current leaf is not invisible.
 */
export function NavigationDrawerGroup({
  label,
  icon,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  children,
}: NavigationDrawerGroupProps) {
  const bodyId = useId();
  const labelId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const containsActive = hasActiveDestination(children);
  /** Collapsed folder hides the active leaf — surface selection on the trigger. */
  const showActiveOnTrigger = containsActive && !isOpen;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div
      className={[
        "fynns-nav-drawer-group",
        isOpen ? "fynns-nav-drawer-group--open" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className={[
          "fynns-nav-drawer-group-trigger",
          showActiveOnTrigger ? "fynns-nav-drawer-group-trigger--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        aria-labelledby={labelId}
        onClick={toggle}
      >
        {icon != null ? (
          <span className="fynns-nav-drawer-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="fynns-nav-drawer-label" id={labelId}>
          {label}
        </span>
        <span className="fynns-nav-drawer-group-chevron" aria-hidden>
          <ChevronRightIcon size={ICON_SIZE} />
        </span>
      </button>
      <div
        className="fynns-expand"
        data-state={isOpen ? "open" : "closed"}
        aria-hidden={!isOpen}
      >
        <div className="fynns-expand-inner">
          <div
            id={bodyId}
            className="fynns-nav-drawer-group-body"
            role="group"
            aria-labelledby={labelId}
            inert={isOpen ? undefined : true}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export type NavigationDrawerItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Leading icon (optional). */
  icon?: ReactNode;
  /** Destination label (required for visible text). */
  label: string;
  /** Selected / current destination. */
  active?: boolean;
  /**
   * Trailing badge — number/string, `true` for a bare mark, or a custom node.
   * Counts fold into the accessible name when set.
   */
  badge?: number | string | true | ReactNode;
};

/**
 * Single navigation drawer destination — icon + label + optional trailing
 * badge, with a full-width pill active indicator (`secondary-container`).
 */
export const NavigationDrawerItem = forwardRef(function NavigationDrawerItem(
  {
    icon,
    label,
    active = false,
    badge,
    className,
    type = "button",
    "aria-label": ariaLabel,
    ...rest
  }: NavigationDrawerItemProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const labelId = useId();

  let badgeNode: ReactNode = null;
  if (badge === true) {
    badgeNode = <span className="fynns-nav-drawer-badge fynns-nav-drawer-badge--mark" />;
  } else if (typeof badge === "number" || typeof badge === "string") {
    badgeNode = (
      <span className="fynns-nav-drawer-badge">{String(badge)}</span>
    );
  } else if (badge != null) {
    badgeNode = badge;
  }

  const badgeCountText =
    typeof badge === "number" || typeof badge === "string" ? String(badge) : null;
  const baseName = ariaLabel ?? label;
  const resolvedAriaLabel =
    baseName && badgeCountText ? `${baseName}, ${badgeCountText}` : ariaLabel;

  const rootClass = [
    "fynns-nav-drawer-item",
    active ? "fynns-nav-drawer-item--active" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={rootClass}
      aria-current={active ? "page" : undefined}
      aria-label={resolvedAriaLabel}
      aria-labelledby={resolvedAriaLabel == null ? labelId : undefined}
    >
      {icon != null ? (
        <span className="fynns-nav-drawer-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="fynns-nav-drawer-label" id={labelId}>
        {label}
      </span>
      {badgeNode}
    </button>
  );
});
