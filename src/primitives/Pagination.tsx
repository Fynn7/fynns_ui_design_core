import type { HTMLAttributes } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> & {
  /** 1-based current page. */
  page: number;
  /** Total page count (≥ 1). */
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** Pages shown on each side of the current page. @default 1 */
  siblingCount?: number;
  /** Pages always shown at the start and end. @default 1 */
  boundaryCount?: number;
  /** Accessible name for the nav landmark. @default "Pagination" */
  ariaLabel?: string;
  /** @default "Previous page" */
  previousAriaLabel?: string;
  /** @default "Next page" */
  nextAriaLabel?: string;
  /** Accessible name for a page number button. @default `(n) => \`Page ${n}\`` */
  getPageAriaLabel?: (page: number) => string;
  /** Page button size; prev/next IconButtons match. @default "sm" */
  size?: "sm" | "md";
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/**
 * Build the visible page list with ellipses (MUI-style range).
 * Always includes boundary pages and siblings around the current page.
 */
export function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): PageItem[] {
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundaries = Math.max(1, Math.floor(boundaryCount));

  const range = (start: number, end: number) => {
    const out: number[] = [];
    for (let i = start; i <= end; i += 1) out.push(i);
    return out;
  };

  // Small sets: show every page (no ellipsis).
  if (count <= boundaries * 2 + siblings * 2 + 2) {
    return range(1, count);
  }

  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);

  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    endPages[0]! - 2,
  );

  const items: PageItem[] = [...startPages];

  if (siblingsStart > boundaries + 2) {
    items.push("start-ellipsis");
  } else if (boundaries + 1 < count - boundaries) {
    items.push(boundaries + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundaries - 1) {
    items.push("end-ellipsis");
  } else if (count - boundaries > boundaries) {
    items.push(count - boundaries);
  }

  items.push(...endPages);
  return items;
}

/**
 * Page navigator for lists and tables (Previous / numbered pages / Next).
 * High-frequency app chrome — not an M3 catalog component. Prev/next reuse
 * `IconButton`; page numbers reuse `Button` `ghost` (current = `tonal`).
 * The list is a **single nowrap row** with content-sized width — put page-size
 * Select / range copy in the **previous** Card-body sibling (unit-stack), never
 * in a horizontal space-between with this nav.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  disabled = false,
  siblingCount = 1,
  boundaryCount = 1,
  ariaLabel = "Pagination",
  previousAriaLabel = "Previous page",
  nextAriaLabel = "Next page",
  getPageAriaLabel = (n: number) => `Page ${n}`,
  size = "sm",
  className,
  ...rest
}: PaginationProps) {
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const items = getPaginationItems(current, count, siblingCount, boundaryCount);
  const atStart = current <= 1;
  const atEnd = current >= count;

  return (
    <nav
      {...rest}
      className={join("fynns-pagination", className)}
      aria-label={ariaLabel}
    >
      <ul className="fynns-pagination-list">
        <li className="fynns-pagination-item">
          <Tooltip content={previousAriaLabel}>
            <IconButton
              variant="ghost"
              size={size}
              aria-label={previousAriaLabel}
              disabled={disabled || atStart}
              onClick={() => onPageChange(current - 1)}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </li>
        {items.map((item, index) => {
          // Slot-stable keys: when the window slides (4 5 6 → 5 6 7) the center
          // slot stays `tonal` and only the label updates — page-number keys would
          // move the tonal node sideways and flash the selected circle.
          if (item === "start-ellipsis" || item === "end-ellipsis") {
            return (
              <li
                key={item}
                className="fynns-pagination-item fynns-pagination-ellipsis"
                aria-hidden
              >
                …
              </li>
            );
          }
          const isCurrent = item === current;
          return (
            <li key={`slot-${index}`} className="fynns-pagination-item">
              <Button
                type="button"
                variant={isCurrent ? "tonal" : "ghost"}
                size={size}
                disabled={disabled}
                aria-label={getPageAriaLabel(item)}
                aria-current={isCurrent ? "page" : undefined}
                className={join(
                  "fynns-pagination-page",
                  size === "md" && "fynns-pagination-page--md",
                  isCurrent && "fynns-pagination-page--current",
                )}
                onClick={() => onPageChange(item)}
              >
                <span key={item} className="fynns-pagination-page-label">
                  {item}
                </span>
              </Button>
            </li>
          );
        })}
        <li className="fynns-pagination-item">
          <Tooltip content={nextAriaLabel}>
            <IconButton
              variant="ghost"
              size={size}
              aria-label={nextAriaLabel}
              disabled={disabled || atEnd}
              onClick={() => onPageChange(current + 1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </li>
      </ul>
    </nav>
  );
}
