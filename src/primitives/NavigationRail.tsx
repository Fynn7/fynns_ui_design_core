import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

export type NavigationRailLabelVisibility = "labeled" | "selected" | "unlabeled";
export type NavigationRailAlignment = "start" | "center" | "end";

type RailContextValue = {
  labelVisibility: NavigationRailLabelVisibility;
};

const NavigationRailContext = createContext<RailContextValue>({
  labelVisibility: "labeled",
});

export type NavigationRailProps = HTMLAttributes<HTMLElement> & {
  /**
   * How destination labels render (M3 label visibility):
   * - `labeled` — always show labels when provided (**default** / agent densify).
   * - `selected` — label only on the active item (`alwaysShowLabel={false}`).
   * - `unlabeled` — icon-only; taller active indicators.
   */
  labelVisibility?: NavigationRailLabelVisibility;
  /**
   * Vertical packing of the destination group inside the rail.
   * Default `start` (below menu/header). `center` / `end` push the group.
   */
  alignment?: NavigationRailAlignment;
  /**
   * Compound children: `NavigationRailMenu`, `NavigationRailHeader`,
   * `NavigationRailItem` (any order; items are collected into destinations).
   */
  children?: ReactNode;
};

function isElementOfType(
  child: ReactNode,
  type: unknown,
): child is ReactElement {
  return isValidElement(child) && child.type === type;
}

/**
 * M3 Navigation rail — compact vertical destinations (80dp) for medium+
 * layouts. Anatomy: optional menu → optional header/FAB → destinations.
 * Prefer `NavigationDrawer` for full sidebar destination lists.
 * @see https://m3.material.io/components/navigation-rail/overview
 */
export function NavigationRail({
  labelVisibility = "labeled",
  alignment = "start",
  children,
  className,
  ...rest
}: NavigationRailProps) {
  const menu: ReactElement[] = [];
  const header: ReactElement[] = [];
  const destinations: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isElementOfType(child, NavigationRailMenu)) {
      menu.push(child);
      return;
    }
    if (isElementOfType(child, NavigationRailHeader)) {
      header.push(child);
      return;
    }
    if (child != null && child !== false) {
      destinations.push(child);
    }
  });

  const rootClass = [
    "fynns-nav-rail",
    `fynns-nav-rail--align-${alignment}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NavigationRailContext.Provider value={{ labelVisibility }}>
      <nav
        {...rest}
        className={rootClass}
        data-has-menu={menu.length > 0 ? "true" : undefined}
        data-has-header={header.length > 0 ? "true" : undefined}
        data-label-visibility={labelVisibility}
      >
        {menu}
        {header}
        <div className="fynns-nav-rail-destinations" role="presentation">
          {destinations}
        </div>
      </nav>
    </NavigationRailContext.Provider>
  );
}

export type NavigationRailMenuProps = HTMLAttributes<HTMLDivElement>;

/** Top menu / navigation drawer affordance (M3 menu icon slot). */
export function NavigationRailMenu({
  className,
  children,
  ...rest
}: NavigationRailMenuProps) {
  return (
    <div
      {...rest}
      className={["fynns-nav-rail-menu", className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export type NavigationRailHeaderProps = HTMLAttributes<HTMLDivElement>;

/** Optional header below the menu — typically a small / extended `Fab`. */
export function NavigationRailHeader({
  className,
  children,
  ...rest
}: NavigationRailHeaderProps) {
  return (
    <div
      {...rest}
      className={["fynns-nav-rail-header", className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export type NavigationRailBadgeProps = {
  /**
   * Badge content:
   * - `true` / omit children — small dot
   * - `number` / `string` — large badge with that text (99+ capped by caller)
   */
  value?: number | string | true;
  children?: ReactNode;
  className?: string;
};

/**
 * Notification badge on a rail destination — anchored to the icon’s top-end
 * corner (dot or short count/text). Not the removed pill label `Badge`.
 */
export function NavigationRailBadge({
  value,
  children,
  className,
}: NavigationRailBadgeProps) {
  const content =
    children ??
    (value === true || value === undefined ? null : String(value));
  const isDot = content == null || content === "";
  return (
    <span
      className={[
        "fynns-nav-rail-badge",
        isDot ? "fynns-nav-rail-badge--dot" : "fynns-nav-rail-badge--large",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {isDot ? null : content}
    </span>
  );
}

export type NavigationRailItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Destination icon (required). */
  icon: ReactNode;
  /** Optional text under the icon. Hidden when rail is `unlabeled`. */
  label?: string;
  /** Selected / current destination. */
  active?: boolean;
  /**
   * When `false`, hide the label unless this item is active (Compose
   * `alwaysShowLabel={false}`). Overrides rail `labelVisibility="labeled"`.
   */
  alwaysShowLabel?: boolean;
  /**
   * Notification badge on the icon — pass a number/string, `true` for a dot,
   * or a `NavigationRailBadge` node.
   */
  badge?: number | string | true | ReactNode;
};

/**
 * Single Navigation rail destination — icon + optional label inside one
 * active/hover highlight (+ optional badge on the icon).
 */
export const NavigationRailItem = forwardRef(function NavigationRailItem(
  {
    icon,
    label,
    active = false,
    alwaysShowLabel,
    badge,
    className,
    type = "button",
    "aria-label": ariaLabel,
    ...rest
  }: NavigationRailItemProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { labelVisibility } = useContext(NavigationRailContext);
  const labelId = useId();

  const forceUnlabeled = labelVisibility === "unlabeled";
  const showLabel =
    Boolean(label) &&
    !forceUnlabeled &&
    (alwaysShowLabel === true ||
      (alwaysShowLabel !== false && labelVisibility === "labeled") ||
      (alwaysShowLabel === false && active) ||
      (labelVisibility === "selected" && active));

  const iconOnly = !showLabel;

  let badgeNode: ReactNode = null;
  if (badge === true || typeof badge === "number" || typeof badge === "string") {
    badgeNode = <NavigationRailBadge value={badge === true ? true : badge} />;
  } else if (badge != null) {
    badgeNode = badge;
  }

  const badgeCountText =
    typeof badge === "number" || typeof badge === "string" ? String(badge) : null;
  const baseName = ariaLabel ?? label;
  const resolvedAriaLabel =
    baseName && badgeCountText
      ? `${baseName}, ${badgeCountText}`
      : ariaLabel ?? (showLabel ? undefined : label);

  const rootClass = [
    "fynns-nav-rail-item",
    iconOnly ? "fynns-nav-rail-item--icon" : "fynns-nav-rail-item--labeled",
    active ? "fynns-nav-rail-item--active" : "",
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
      aria-labelledby={
        showLabel && resolvedAriaLabel == null ? labelId : undefined
      }
    >
      <span className="fynns-nav-rail-indicator">
        <span className="fynns-nav-rail-icon-wrap">
          <span className="fynns-nav-rail-icon" aria-hidden>
            {icon}
          </span>
          {badgeNode}
        </span>
        {showLabel ? (
          <span className="fynns-nav-rail-label" id={labelId}>
            {label}
          </span>
        ) : null}
      </span>
    </button>
  );
});
