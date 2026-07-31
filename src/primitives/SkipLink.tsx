import type { AnchorHTMLAttributes, ReactNode } from "react";

export type SkipLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** In-page target. @default "#main" */
  href?: string;
  /**
   * Visible label when focused. Prefer `children`; `label` is a string
   * shorthand. Default `"Skip to content"`.
   */
  label?: string;
  children?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Accessibility skip link: visually hidden until `:focus-visible`, then
 * appears as a ghost button (`fynns-btn fynns-btn--ghost`) so keyboard users
 * can jump past chrome into main content.
 */
export function SkipLink({
  href = "#main",
  label,
  children,
  className,
  ...rest
}: SkipLinkProps) {
  const content = children ?? label ?? "Skip to content";

  return (
    <a
      {...rest}
      href={href}
      className={join("fynns-btn", "fynns-btn--ghost", "fynns-skip-link", className)}
    >
      {content}
    </a>
  );
}
