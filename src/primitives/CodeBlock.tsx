import type { CSSProperties, HTMLAttributes } from "react";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";
import { ClipboardIcon } from "./icons";

export type CodeBlockVariant = "default" | "plain";

export type CodeBlockProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Source text shown inside `<pre><code>`. */
  code: string;
  /**
   * `default` — optional head (label + hover fade-in copy).
   * `plain` — code only; copy floats and fades in on hover.
   */
  variant?: CodeBlockVariant;
  /** Optional language tag (also sets `data-language` on the root). */
  language?: string;
  /** Visible label above the code (e.g. file name / language). Ignored for `plain`. */
  label?: string;
  /** Copy button tooltip / aria-label. @default "Copy" */
  copyAriaLabel?: string;
  /** Show the copy control. @default true */
  showCopy?: boolean;
  /** Max height of the scrollable `<pre>` (CSS length). */
  maxHeight?: string | number;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Monospace code sample with optional copy affordance (`IconButton` +
 * `Tooltip` + `ClipboardIcon`). The `<pre>` uses `fynns-scroll`.
 * Copy fades in on hover (keyboard: :focus-visible); `plain` has no head.
 */
export function CodeBlock({
  code,
  variant = "default",
  language,
  label,
  copyAriaLabel = "Copy",
  showCopy = true,
  maxHeight,
  className,
  style,
  ...rest
}: CodeBlockProps) {
  const plain = variant === "plain";
  const preStyle: CSSProperties | undefined =
    maxHeight == null
      ? undefined
      : {
          maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        };

  const onCopy = (event: { currentTarget: HTMLElement }) => {
    void navigator.clipboard.writeText(code);
    /* Drop mouse click focus so copy does not stick visible after unhover. */
    event.currentTarget.blur();
  };

  const copyControl = showCopy ? (
    <div className="fynns-code-block-copy">
      <Tooltip content={copyAriaLabel}>
        <IconButton
          type="button"
          size="sm"
          aria-label={copyAriaLabel}
          onClick={onCopy}
        >
          <ClipboardIcon size={16} />
        </IconButton>
      </Tooltip>
    </div>
  ) : null;

  return (
    <div
      {...rest}
      className={join(
        "fynns-code-block",
        plain && "fynns-code-block--plain",
        className,
      )}
      data-language={language}
      style={style}
    >
      {plain ? (
        copyControl
      ) : label != null || showCopy ? (
        <div className="fynns-code-block-head">
          {label != null ? (
            <span className="fynns-code-block-label">{label}</span>
          ) : (
            <span className="fynns-code-block-label" />
          )}
          {copyControl}
        </div>
      ) : null}
      <pre className="fynns-code-block-pre fynns-scroll" style={preStyle}>
        <code className="fynns-code-block-code">{code}</code>
      </pre>
    </div>
  );
}
