import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

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
 * Place above the control — not overlaid on a Textarea corner. Dense Card
 * nesting: when this is the first child of `CardContent`, top inset shrinks
 * to `--fynns-space-sm` (see `.fynns-card-content:has(> .fynns-field-header)`).
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
};

/**
 * Encapsulates `FieldHeader` + control with compact vertical rhythm.
 * First child of `CardContent` also triggers the denser top inset.
 */
export function FieldBlock({
  label,
  htmlFor,
  actions,
  labelProps,
  children,
  className,
  ...rest
}: FieldBlockProps) {
  return (
    <div {...rest} className={join("fynns-field-block", className)}>
      <FieldHeader
        label={label}
        htmlFor={htmlFor}
        actions={actions}
        labelProps={labelProps}
      />
      {children}
    </div>
  );
}
