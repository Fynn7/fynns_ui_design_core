import { useState, type HTMLAttributes, type ReactNode } from "react";
import { PersonIcon } from "./icons";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Image URL. Falls back to initials / icon when missing or load fails. */
  src?: string;
  /** Accessible name. Required when using `src` or when there is no visible text. */
  alt?: string;
  /**
   * Display name used to derive initials (up to 2 letters) when there is no
   * image / custom child.
   */
  name?: string;
  /** Custom content (icon, etc.). Wins over initials; loses to a loaded image. */
  children?: ReactNode;
  /** Default `md` (40dp — M3 list leading avatar). */
  size?: AvatarSize;
};

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const ICON_SIZE: Record<AvatarSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
};

/**
 * M3 Avatar — circular identity mark for people / entities.
 * Priority: loaded `src` → `children` → initials from `name` → person glyph.
 */
export function Avatar({
  src,
  alt,
  name,
  children,
  size = "md",
  className,
  ...rest
}: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;
  const initials = !showImage && !children && name ? initialsFromName(name) : "";
  const label = alt ?? name ?? undefined;

  const rootClass = [
    "fynns-avatar",
    `fynns-avatar--${size}`,
    showImage ? "fynns-avatar--image" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      {...rest}
      className={rootClass}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {showImage ? (
        <img
          className="fynns-avatar-img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setBroken(true)}
        />
      ) : children ? (
        <span className="fynns-avatar-content" aria-hidden>
          {children}
        </span>
      ) : initials ? (
        <span className="fynns-avatar-initials" aria-hidden>
          {initials}
        </span>
      ) : (
        <span className="fynns-avatar-content" aria-hidden>
          <PersonIcon size={ICON_SIZE[size]} />
        </span>
      )}
    </span>
  );
}
