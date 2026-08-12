import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { FieldHint } from "./FieldHint";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type FieldHeaderProps = HTMLAttributes<HTMLDivElement> & {
  /** Visible field name (rendered as `<label>` when `htmlFor` is set). */
  label: ReactNode;
  /** Associates the label with a control id. */
  htmlFor?: string;
  /** Trailing actions — typically ghost `IconButton` + `Tooltip`. */
  actions?: ReactNode;
  /** Extra props forwarded to the `<label>` when `htmlFor` is set. */
  labelProps?: Omit<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor" | "children">;
};

/**
 * Form field label row with optional trailing icon actions (expand / reset).
 * Place above the control — not overlaid on a Textarea corner. Label text is
 * flush with the control’s outer start edge. Inside `FieldBlock`, label→
 * control uses `--fynns-layout-field-hint-gap` (works for wrapped prompts).
 * With `actions`, the row grows to fit trailing `IconButton` sm
 * (`2rem` + `space-2xs` pad). Dense Card nesting: when this is the first
 * child of `Card` body, top inset shrinks to `--fynns-space-xs`
 * (see `.fynns-card-body:has(> .fynns-field-header)`).
 * Prefer `FieldBlock` when wrapping label + control together.
 */
export function FieldHeader({
  label,
  htmlFor,
  actions,
  labelProps,
  className,
  ...rest
}: FieldHeaderProps) {
  const labelNode =
    htmlFor != null ? (
      <label {...labelProps} htmlFor={htmlFor} className="fynns-field-header__label">
        {label}
      </label>
    ) : (
      <div className="fynns-field-header__label">{label}</div>
    );

  return (
    <div {...rest} className={join("fynns-field-header", className)}>
      {labelNode}
      {actions != null ? (
        <div className="fynns-field-header__actions">{actions}</div>
      ) : null}
    </div>
  );
}

export type FieldBlockProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  htmlFor?: string;
  actions?: ReactNode;
  labelProps?: FieldHeaderProps["labelProps"];
  children: ReactNode;
  /**
   * Supporting copy under the control (not under the label row). Prefer this
   * over a loose muted `<p>` sibling in the Card body.
   */
  description?: ReactNode;
  /** Error copy under the control; wins over `description` when both set. */
  errorText?: ReactNode;
};

/**
 * Encapsulates `FieldHeader` + control with compact vertical rhythm.
 * Label→control and optional `description` / `errorText` both use
 * `--fynns-layout-field-hint-gap` (via `.fynns-field-block__main` /
 * `.fynns-field-hint`). First child of `Card` body also triggers the
 * denser top inset. Sibling FieldBlocks rely on Card / Collapsible body
 * `unit-stack-gap` (or `.fynns-unit-stack`) — do not add ad-hoc margins.
 */
export function FieldBlock({
  label,
  htmlFor,
  actions,
  labelProps,
  children,
  description,
  errorText,
  className,
  ...rest
}: FieldBlockProps) {
  const hint = errorText ?? description;
  return (
    <div {...rest} className={join("fynns-field-block", className)}>
      <div className="fynns-field-block__main">
        <FieldHeader
          label={label}
          htmlFor={htmlFor}
          actions={actions}
          labelProps={labelProps}
        />
        {children}
      </div>
      {hint != null && hint !== false ? (
        <FieldHint error={errorText != null}>{hint}</FieldHint>
      ) : null}
    </div>
  );
}
