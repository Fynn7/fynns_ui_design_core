import type {
  ChangeEvent,
  ForwardedRef,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

export type TextareaSize = "sm" | "md";
export type TextareaVariant = "filled" | "outlined";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  size?: TextareaSize;
  /** @default "outlined" */
  variant?: TextareaVariant;
  supportingText?: ReactNode;
  errorText?: ReactNode;
  /**
   * When true (default), height tracks content from `minRows` up to
   * `--fynns-layout-textarea-max-height`. Pass `false` for a fixed well
   * with native vertical resize.
   */
  autoGrow?: boolean;
  /**
   * Auto-grow floor (also empty-state height). Defaults to `rows` when set,
   * otherwise `1` so short copy does not sit in a tall well.
   */
  minRows?: number;
  /**
   * Optional row-unit soft cap. When set, overrides the CSS
   * `--fynns-layout-textarea-max-height` for this instance.
   */
  maxRows?: number;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function resolveMinRows(
  minRows: number | undefined,
  rows: TextareaHTMLAttributes<HTMLTextAreaElement>["rows"],
): number {
  if (minRows != null && minRows > 0) return minRows;
  if (typeof rows === "number" && rows > 0) return rows;
  if (typeof rows === "string") {
    const n = Number.parseInt(rows, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 1;
}

/** Multiline form control sharing Input chrome. Not a full M3 Text Field
 * (no floating label; `filled` is a dense fill, not M3 filled anatomy).
 * `.fynns-input .fynns-textarea`. Default `autoGrow` — height follows text.
 * Default `spellCheck={false}` (same as `Input`); pass `spellCheck` to opt in. */
export const Textarea = forwardRef(function Textarea(
  {
    className,
    invalid = false,
    size = "md",
    variant = "outlined",
    supportingText,
    errorText,
    id,
    "aria-describedby": ariaDescribedBy,
    autoGrow = true,
    minRows: minRowsProp,
    maxRows,
    rows,
    value,
    defaultValue,
    onChange,
    style,
    spellCheck = false,
    ...rest
  }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const isInvalid = invalid || !!errorText;
  const hint = errorText ?? supportingText;
  const minRows = resolveMinRows(minRowsProp, rows);
  const localRef = useRef<HTMLTextAreaElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const resize = useCallback(() => {
    const el = localRef.current;
    if (!el || !autoGrow) return;
    const cs = getComputedStyle(el);
    const lineHeight =
      Number.parseFloat(cs.lineHeight) ||
      Number.parseFloat(cs.fontSize) * 1.5 ||
      24;
    const padY =
      (Number.parseFloat(cs.paddingTop) || 0) +
      (Number.parseFloat(cs.paddingBottom) || 0);
    const borderY =
      (Number.parseFloat(cs.borderTopWidth) || 0) +
      (Number.parseFloat(cs.borderBottomWidth) || 0);
    // border-box: scrollHeight covers content + padding, not borders.
    const floor = minRows * lineHeight + padY + borderY;
    const rowCap =
      maxRows != null && maxRows > 0
        ? maxRows * lineHeight + padY + borderY
        : null;
    // Explicit maxRows wins over the layout token soft cap.
    el.style.maxHeight = rowCap != null ? `${rowCap}px` : "";
    const cssMax = Number.parseFloat(cs.maxHeight);
    const tokenCap =
      Number.isFinite(cssMax) && cssMax > 0
        ? cssMax
        : 12 * lineHeight + padY + borderY;
    const cap = rowCap ?? tokenCap;

    // Empty: minRows floor only — ignore placeholder wrap scrollHeight.
    if (!el.value) {
      el.style.height = `${floor}px`;
      return;
    }

    el.style.height = "0px";
    const contentBox = el.scrollHeight + borderY;
    const next = Math.min(Math.max(contentBox, floor), cap);
    el.style.height = `${next}px`;
  }, [autoGrow, maxRows, minRows]);

  useLayoutEffect(() => {
    resize();
  }, [resize, value, defaultValue]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    // Uncontrolled: DOM already has the new value; measure now.
    if (value === undefined) resize();
  };

  const control = (
    <textarea
      {...rest}
      id={fieldId}
      ref={setRefs}
      rows={rows ?? (autoGrow ? minRows : undefined)}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      style={style}
      spellCheck={spellCheck}
      aria-invalid={isInvalid || undefined}
      aria-describedby={hint ? join(ariaDescribedBy, hintId) : ariaDescribedBy}
      className={join(
        "fynns-input",
        "fynns-textarea",
        "fynns-scroll",
        autoGrow && "fynns-textarea--auto-grow",
        size === "sm" && "fynns-input--sm",
        variant === "filled" && "fynns-input--filled",
        isInvalid && "fynns-input--invalid",
        className,
      )}
    />
  );

  if (!hint) return control;

  return (
    <div className={join("fynns-field", isInvalid && "fynns-field--invalid")}>
      {control}
      <p
        id={hintId}
        className={join("fynns-field-hint", !!errorText && "fynns-field-hint--error")}
      >
        {hint}
      </p>
    </div>
  );
});
