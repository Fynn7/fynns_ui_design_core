import type { ReactNode } from "react";
import { InfoIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type InfoHintProps = {
  content: ReactNode;
  ariaLabel?: string;
  iconSize?: number;
  className?: string;
};

/** A small "i" affordance that reveals `content` in a tooltip on hover/focus. */
export function InfoHint({
  content,
  ariaLabel = "More information",
  iconSize = 14,
  className,
}: InfoHintProps) {
  return (
    <Tooltip content={<span className="fynns-info-hint">{content}</span>}>
      <button
        type="button"
        className={["fynns-info-hint-trigger", className ?? ""].filter(Boolean).join(" ")}
        aria-label={ariaLabel}
      >
        <InfoIcon size={iconSize} />
      </button>
    </Tooltip>
  );
}
