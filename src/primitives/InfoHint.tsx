import type { ReactNode } from "react";
import { InfoIcon } from "./icons";
import { Tooltip } from "./Tooltip";

export type InfoHintProps = {
  content: ReactNode;
  /**
   * Optional visible label. When set, the label alone is the help trigger
   * (`cursor: help`, no underline / trailing "i" — dense rows stay calm).
   * Omit for a standalone info glyph.
   */
  label?: ReactNode;
  ariaLabel?: string;
  iconSize?: number;
  className?: string;
};

/** Informational affordance: icon-only, or plain labeled help trigger. */
export function InfoHint({
  content,
  label,
  ariaLabel = "More information",
  iconSize = 14,
  className,
}: InfoHintProps) {
  const labeled = label != null;
  return (
    <Tooltip content={<span className="fynns-info-hint">{content}</span>}>
      <button
        type="button"
        className={[
          "fynns-info-hint-trigger",
          labeled ? "fynns-info-hint-trigger--labeled" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
      >
        {labeled ? <span className="fynns-info-hint-label">{label}</span> : null}
        {labeled ? null : <InfoIcon size={iconSize} />}
      </button>
    </Tooltip>
  );
}
