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
   * `supportingText` / `.fynns-field-hint`. Do **not** leave this as a loose
   * Card sibling — wrap control + copy in `ControlBlock` so
   * `--fynns-layout-field-hint-gap` applies.
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
 * adjacent Card-body siblings. Sibling **units** (FieldBlock, ControlBlock,
 * intro copy) are spaced by Card / Collapsible body `unit-stack-gap` or
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
