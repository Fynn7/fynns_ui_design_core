import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";
import { ChevronRightIcon } from "./icons";

export type BreadcrumbItemData = {
  label: ReactNode;
  /** When set, renders an `<a>` styled as `Button` ghost sm (use for real routes). */
  href?: string;
  /** When set (and no `href`), renders `Button` ghost sm. Ignored for the current crumb. */
  onClick?: () => void;
  /**
   * Mark as the current page. When omitted, the **last** item is current.
   * Only one current crumb is rendered as plain text (`aria-current="page"`).
   */
  current?: boolean;
};

export type BreadcrumbProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  items: BreadcrumbItemData[];
  /** Accessible name for the nav landmark. @default "Breadcrumb" */
  ariaLabel?: string;
  /** Between crumbs; default chevron. Decorative (`aria-hidden`). */
  separator?: ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Path trail for hierarchical pages (Home › Section › Page).
 * Not an M3 catalog component, but high-frequency app chrome — use instead of
 * hand-rolled separators + links. Ancestor crumbs reuse `Button` `ghost` `sm`
 * (stadium + state-layer). Last item (or `current`) is non-interactive.
 */
export function Breadcrumb({
  items,
  ariaLabel = "Breadcrumb",
  separator,
  className,
  ...rest
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  const explicitCurrent = items.findIndex((item) => item.current === true);
  const currentIndex = explicitCurrent >= 0 ? explicitCurrent : items.length - 1;
  const sep =
    separator ?? <ChevronRightIcon size={14} className="fynns-breadcrumb-sep-icon" />;

  return (
    <nav
      {...rest}
      className={join("fynns-breadcrumb", className)}
      aria-label={ariaLabel}
    >
      <ol className="fynns-breadcrumb-list">
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          return (
            <li key={index} className="fynns-breadcrumb-item">
              {index > 0 ? (
                <span className="fynns-breadcrumb-sep" aria-hidden>
                  {sep}
                </span>
              ) : null}
              {isCurrent ? (
                <span className="fynns-breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href != null ? (
                <a
                  className="fynns-btn fynns-btn--ghost fynns-btn--sm fynns-breadcrumb-link"
                  href={item.href}
                >
                  {item.label}
                </a>
              ) : item.onClick != null ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="fynns-breadcrumb-link"
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              ) : (
                <span className="fynns-breadcrumb-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
