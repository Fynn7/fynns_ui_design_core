import type { ButtonHTMLAttributes } from "react";
import { ChevronDownIcon } from "./icons";

export type ExpandToggleProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "type" | "aria-expanded" | "aria-controls"
> & {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  controls: string;
  expandLabel?: string;
  collapseLabel?: string;
};

/**
 * Content-preview disclosure: plain text + chevron, never action Button chrome.
 * Place directly below the controlled content at its start edge, outside an
 * action cluster. Prefer ExpandableText / ExpandableCodeBlock / ExpandableContent
 * for core-owned preview behavior; keep full copy data intact.
 * For progressive catalog rows use RevealMore instead. Live: #code-block.
 */
export function ExpandToggle({
  expanded,
  onExpandedChange,
  controls,
  expandLabel = "Show more",
  collapseLabel = "Show less",
  className,
  ...rest
}: ExpandToggleProps) {
  return (
    <button
      {...rest}
      type="button"
      className={["fynns-expand-toggle", className].filter(Boolean).join(" ")}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={() => onExpandedChange(!expanded)}
    >
      {expanded ? collapseLabel : expandLabel}
      <ChevronDownIcon size={14} aria-hidden className="fynns-expand-toggle-chevron" />
    </button>
  );
}
