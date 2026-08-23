import {
  Children,
  forwardRef,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
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

/**
 * Cursor-style scroll-edge fade: soft mask when more content is past the
 * top / bottom edge (no hairline divider into the footer). Observes the
 * drawer **body** only — never the ClippedNavShell root (see llm/PERF.md).
 */
function syncNavDrawerBodyFade(el: HTMLElement) {
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  const canDown = max > 1 && el.scrollTop < max - 1;
  const canUp = max > 1 && el.scrollTop > 1;
  if (canDown) el.setAttribute("data-fade-bottom", "");
  else el.removeAttribute("data-fade-bottom");
  if (canUp) el.setAttribute("data-fade-top", "");
  else el.removeAttribute("data-fade-top");
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
  /**
   * Optional **static** sheet title (M3 title-small / muted semibold).
   * Plain text or light markup only — **not** a toolbar. Do **not** put
   * `IconButton` (back / bulk), counts, or `hub-row` chrome here. Mode exit
   * (back to root destinations) lives on `TopAppBar` `leading` /
   * `leadingExtra`. Omit when the app bar already owns the mode title.
   * Do **not** invent counts in `headline` or pad Group/Item `label` with
   * `· N` / parenthetical glosses — see AGENTS Hard rules (chrome label
   * copy). Live: sandbox Layouts `#layouts-demo-shell` (`leadingExtra`
   * back) + Globals NavigationDrawer (string `headline`).
   */
  headline?: ReactNode;
  ariaLabel?: string;
  className?: string;
  /**
   * Destinations as **direct** body children: `NavigationDrawerItem`,
   * `NavigationDrawerHeadline`, `NavigationDrawerGroup`, `Divider`, etc.
   * Item ↔ Item uses `--fynns-navdrawer-section-gap` (4dp). SearchBar /
   * tools as a body sibling uses `--fynns-navdrawer-search-gap` (aliases
   * layout `control-stack-gap` — 8dp; matches Search↔Toggle in a tools
   * column; wider than Item↔Item, not a 16dp kind-jump).
   * Do **not** wrap destinations in `.fynns-unit-stack`.
   */
  children?: ReactNode;
  /**
   * Optional sheet **footer** pinned under the scroll body (Cursor-style
   * single account row + settings). Not a destination — keep
   * `NavigationDrawerItem`s in `children`. Workspace / project context
   * belongs in **body** (e.g. `.fynns-nav-drawer-footer-slot--pill` row via
   * `navBodyExtra` on `DestinationAppShell`). Footer recipe:
   * `.fynns-nav-drawer-footer-account` + `.fynns-nav-drawer-footer-account-start`
   * (Avatar + optional `.fynns-nav-drawer-footer-account-label`) + settings
   * IconButton end — not TopAppBar `trailing`. Live: sandbox Layouts
   * `#layouts-demo-shell` + SandboxShell.
   */
  footer?: ReactNode;
};

function DrawerSheet({
  headline,
  footer,
  className,
  children,
  ...navRest
}: {
  headline?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const rootClass = ["fynns-nav-drawer", className ?? ""].filter(Boolean).join(" ");

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncNavDrawerBodyFade(el);
      });
    };
    syncNavDrawerBodyFade(el);
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    // Body direct children only — destination swaps / SearchBar remounts;
    // avoid subtree thrash from deep SearchBar / tip DOM churn (llm/PERF.md).
    const mo = new MutationObserver(sync);
    mo.observe(el, { childList: true, subtree: false });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <nav {...navRest} className={rootClass}>
      {headline != null && headline !== false ? (
        <div className="fynns-nav-drawer-headline">{headline}</div>
      ) : null}
      <div ref={bodyRef} className="fynns-nav-drawer-body fynns-scroll">
        {children}
      </div>
      {footer != null && footer !== false ? (
        <div className="fynns-nav-drawer-footer">{footer}</div>
      ) : null}
    </nav>
  );
}

/**
 * M3 Navigation drawer — destination list in a dense side sheet.
 * Modal overlays content; `standard` sits in the layout permanently.
 * Prefer `Drawer` for generic side panels (forms, inspectors).
 * Sibling Item / Group / Headline spacing uses
 * `--fynns-navdrawer-section-gap` (4dp). SearchBar / tools ↔ destinations
 * uses `--fynns-navdrawer-search-gap` (aliases layout `control-stack-gap`
 * / 8dp). Never
 * `.fynns-unit-stack` for the destination list itself.
 * @see https://m3.material.io/components/navigation-drawer/overview
 */
export function NavigationDrawer({
  variant = "modal",
  open = false,
  onClose,
  side = "left",
  modal = true,
  headline,
  footer,
  ariaLabel,
  className,
  children,
}: NavigationDrawerProps) {
  if (variant === "standard") {
    return (
      <DrawerSheet
        headline={headline}
        footer={footer}
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
      <DrawerSheet headline={headline} footer={footer}>
        {children}
      </DrawerSheet>
    </DialogFrame>
  );
}

export type NavigationDrawerHeadlineProps = HTMLAttributes<HTMLDivElement>;

/**
 * Static **section** label inside the drawer body (M3 headline) — not the
 * sheet `headline` prop, and not a place for IconButtons / counts.
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
  /**
   * Group title (visible + accessible name for the disclose control).
   * **Short name only** — do not pad with `· N` / counts / parenthetical
   * glosses unless the user explicitly asks. Unread → nested Item `badge`
   * only when required (AGENTS Hard rules).
   */
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
