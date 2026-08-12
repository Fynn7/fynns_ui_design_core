import type { HTMLAttributes, ReactNode } from "react";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type FieldHintProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  /** Danger ink — validation / blocking reason. */
  error?: boolean;
};

/**
 * Supporting or error copy under a control. Prefer via `ControlBlock`
 * `description` / `errorText`, or Input / Autocomplete / Otp built-in hints.
 * Use this when the app owns the layout column and only needs the muted
 * caption style (do not invent a parallel `.gsc-card-subtitle` for control
 * notes).
 */
export function FieldHint({
  children,
  error = false,
  className,
  ...rest
}: FieldHintProps) {
  return (
    <p
      {...rest}
      className={join(
        "fynns-field-hint",
        error && "fynns-field-hint--error",
        className,
      )}
    >
      {children}
    </p>
  );
}
