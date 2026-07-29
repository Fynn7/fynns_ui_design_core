import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { NavigationRailBadge } from "./NavigationRail";

export type NavigationBarLabelVisibility = "labeled" | "selected" | "unlabeled";

type BarContextValue = {
  labelVisibility: NavigationBarLabelVisibility;
};

const NavigationBarContext = createContext<BarContextValue>({
  labelVisibility: "labeled",
});

export type NavigationBarProps = HTMLAttributes<HTMLElement> & {
  /**
   * How destination labels render (M3 label visibility):
   * - `labeled` — always show labels when provided (default).
   * - `selected` — label only on the active item.
   * - `unlabeled` — icon-only; square active indicators.
   */
  labelVisibility?: NavigationBarLabelVisibility;
  /** Typically 3–5 `NavigationBarItem` children. */
  children?: ReactNode;
};

/**
 * M3 Navigation bar — horizontal bottom destinations (80dp) for compact /
 * phone layouts. Prefer `NavigationRail` on medium+ widths.
 * Active highlight matches the rail: square wrapping icon (+ label).
 * @see https://m3.material.io/components/navigation-bar/overview
 */
export function NavigationBar({
  labelVisibility = "labeled",
  children,
  className,
  ...rest
}: NavigationBarProps) {
  const rootClass = ["fynns-nav-bar", className ?? ""].filter(Boolean).join(" ");

  return (
    <NavigationBarContext.Provider value={{ labelVisibility }}>
      <nav
        {...rest}
        className={rootClass}
        data-label-visibility={labelVisibility}
      >
        <div className="fynns-nav-bar-destinations" role="presentation">
          {children}
        </div>
      </nav>
    </NavigationBarContext.Provider>
  );
}

export type NavigationBarItemProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Destination icon (required). */
  icon: ReactNode;
  /** Optional text under the icon. Hidden when bar is `unlabeled`. */
  label?: string;
  /** Selected / current destination. */
  active?: boolean;
  /**
   * When `false`, hide the label unless this item is active.
   * Overrides bar `labelVisibility="labeled"`.
   */
  alwaysShowLabel?: boolean;
  /**
   * Notification badge on the icon — number/string, `true` for a dot,
   * or a `NavigationRailBadge` node.
   */
  badge?: number | string | true | ReactNode;
};

/**
 * Single Navigation bar destination — icon + optional label inside one
 * active/hover highlight (+ optional badge on the icon).
 */
export const NavigationBarItem = forwardRef(function NavigationBarItem(
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
  }: NavigationBarItemProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { labelVisibility } = useContext(NavigationBarContext);
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
    "fynns-nav-bar-item",
    iconOnly ? "fynns-nav-bar-item--icon" : "fynns-nav-bar-item--labeled",
    active ? "fynns-nav-bar-item--active" : "",
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
      <span className="fynns-nav-bar-indicator">
        <span className="fynns-nav-bar-icon-wrap">
          <span className="fynns-nav-bar-icon" aria-hidden>
            {icon}
          </span>
          {badgeNode}
        </span>
        {showLabel ? (
          <span className="fynns-nav-bar-label" id={labelId}>
            {label}
          </span>
        ) : null}
      </span>
    </button>
  );
});
