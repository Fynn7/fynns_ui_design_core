import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { DialogFrame, type DrawerSide } from "./Dialog";

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
   * Destinations: `NavigationDrawerItem`, `NavigationDrawerHeadline`,
   * `Divider`, etc.
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
 * M3 Navigation drawer — destination list in a 360dp side sheet.
 * Modal overlays content; `standard` sits in the layout permanently.
 * Prefer `Drawer` for generic side panels (forms, inspectors).
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

/** Section label inside a navigation drawer (M3 headline). */
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
