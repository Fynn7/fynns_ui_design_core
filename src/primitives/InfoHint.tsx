import type { ReactNode } from "react";
import type { ButtonSize } from "./Button";
import { IconButton } from "./IconButton";
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
  /** Icon-only: matches IconButton target (`md` = 40dp chrome default). */
  size?: ButtonSize;
  /** Rare override — default follows `--fynns-size-icon` (16dp). */
  iconSize?: number;
  className?: string;
};

/** Informational affordance: icon-only (IconButton-sized help), or labeled text trigger. */
export function InfoHint({
  content,
  label,
  ariaLabel = "More information",
  size = "md",
  iconSize,
  className,
}: InfoHintProps) {
  const labeled = label != null;
  if (labeled) {
    return (
      <Tooltip content={<span className="fynns-info-hint">{content}</span>}>
        <button
          type="button"
          className={[
            "fynns-info-hint-trigger",
            "fynns-info-hint-trigger--labeled",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={ariaLabel}
        >
          <span className="fynns-info-hint-label">{label}</span>
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={<span className="fynns-info-hint">{content}</span>}>
      <IconButton
        variant="ghost"
        size={size}
        aria-label={ariaLabel}
        className={["fynns-info-hint-trigger", "fynns-info-hint-trigger--icon", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        <InfoIcon {...(iconSize != null ? { size: iconSize } : {})} />
      </IconButton>
    </Tooltip>
  );
}
