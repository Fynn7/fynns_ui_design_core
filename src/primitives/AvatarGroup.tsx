import {
  Children,
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Avatar, type AvatarSize } from "./Avatar";

const AvatarGroupContext = createContext<AvatarSize | undefined>(undefined);

/** Optional size from a parent `AvatarGroup` (consumers may read it later). */
export function useAvatarGroupSize(): AvatarSize | undefined {
  return useContext(AvatarGroupContext);
}

export type AvatarGroupProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  /** Avatar nodes to stack. */
  children: ReactNode;
  /** Max visible avatars before `+N` overflow. Default `3`. */
  max?: number;
  /** Optional size hint for overflow avatar / nested context. */
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
    <AvatarGroupContext.Provider value={size}>
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
              name={`+${overflow}`}
              size={size}
              className="fynns-avatar-group-overflow"
            />
          </span>
        ) : null}
      </span>
    </AvatarGroupContext.Provider>
  );
}
