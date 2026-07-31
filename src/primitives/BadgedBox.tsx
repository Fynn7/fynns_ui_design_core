import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { NavigationRailBadge } from "./NavigationRail";

export type BadgedBoxProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  /**
   * Notification badge — number/string, `true` for a dot, or a custom node
   * (e.g. `NavigationRailBadge`).
   */
  badge?: number | string | true | ReactNode;
};

function withNavRailBadgeClass(node: ReactNode): ReactNode {
  if (!isValidElement(node)) {
    return <span className="fynns-nav-rail-badge">{node}</span>;
  }
  const el = node as ReactElement<{ className?: string }>;
  const existing = el.props.className ?? "";
  if (existing.split(/\s+/).includes("fynns-nav-rail-badge")) {
    return el;
  }
  return cloneElement(el, {
    className: ["fynns-nav-rail-badge", existing].filter(Boolean).join(" "),
  });
}

/**
 * Positions a notification badge over an arbitrary child (icon, avatar, etc.).
 * Reuses `NavigationRailBadge` chrome for scalar / dot values.
 */
export function BadgedBox({
  children,
  badge,
  className,
  ...rest
}: BadgedBoxProps) {
  let badgeNode: ReactNode = null;
  if (badge === true || typeof badge === "number" || typeof badge === "string") {
    badgeNode = <NavigationRailBadge value={badge === true ? true : badge} />;
  } else if (badge != null) {
    badgeNode = withNavRailBadgeClass(badge);
  }

  return (
    <span
      {...rest}
      className={["fynns-badged-box", className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
      {badgeNode}
    </span>
  );
}
