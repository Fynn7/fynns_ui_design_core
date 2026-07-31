import {
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Avatar, AvatarGroupSizeContext, type AvatarSize } from "./Avatar";

export { useAvatarGroupSize } from "./Avatar";

export type AvatarGroupProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Avatar nodes to stack. */
  children: ReactNode;
  /** Max visible avatars before `+N` overflow. Default `3`. */
  max?: number;
  /** Size for nested Avatars (when they omit `size`) and the overflow mark. */
  size?: AvatarSize;
};

/**
 * Overlapping stack of Avatars with an optional `+N` overflow mark.
 */
export function AvatarGroup({
  children,
  max = 3,
  size,
  className,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <AvatarGroupSizeContext.Provider value={size}>
      <span
        {...rest}
        className={["fynns-avatar-group", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {visible.map((child, index) => (
          <span key={index} className="fynns-avatar-group-item">
            {child}
          </span>
        ))}
        {overflow > 0 ? (
          <span className="fynns-avatar-group-item">
            <Avatar
              size={size}
              className="fynns-avatar-group-overflow"
              alt={`+${overflow}`}
            >
              {`+${overflow}`}
            </Avatar>
          </span>
        ) : null}
      </span>
    </AvatarGroupSizeContext.Provider>
  );
}
