import type { HTMLAttributes, ReactNode } from "react";
import { FieldHint } from "./FieldHint";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ControlBlockProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Control chrome — typically one `ControlRow`, or a `ControlStack` of related
   * rows that share one supporting note.
   */
  children: ReactNode;
  /**
   * Supporting copy under the control(s). Same muted role as Input
   * `supportingText` / `.fynns-field-hint`. On a **single** ControlRow the
   * note docks in the label column; controls stay vertically centered on
   * name + hint (not a full-bleed next row). Do **not** leave this as a
   * loose Card / Surface sibling.
   */
  description?: ReactNode;
  /** Error copy under the control(s); wins over `description` when both set. */
  errorText?: ReactNode;
};

/**
 * Unit host for a labeled control row (or stack) **plus** its supporting /
 * error note. Uses `--fynns-layout-field-hint-gap` between chrome and hint —
 * the same rhythm as `.fynns-field`.
 *
 * Related switch + narrative must live here (one virtual container), not as
 * adjacent Card-body siblings. Consecutive FieldBlocks (or a same-kind
 * ControlBlock group) → wrap in `FieldStack`. Sibling **clusters** / intro /
 * Checkbox are spaced by Card / Collapsible body `unit-stack-gap` or
 * `.fynns-unit-stack`.
 */
export function ControlBlock({
  children,
  description,
  errorText,
  className,
  ...rest
}: ControlBlockProps) {
  const hint = errorText ?? description;
  return (
    <div {...rest} className={join("fynns-control-block", className)}>
      {children}
      {hint != null && hint !== false ? (
        <FieldHint error={errorText != null}>{hint}</FieldHint>
      ) : null}
    </div>
  );
}
