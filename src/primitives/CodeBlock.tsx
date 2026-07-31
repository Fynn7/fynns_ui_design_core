import type { CSSProperties, HTMLAttributes } from "react";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";
import { ClipboardIcon } from "./icons";

export type CodeBlockProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Source text shown inside `<pre><code>`. */
  code: string;
  /** Optional language tag (also sets `data-language` on the root). */
  language?: string;
  /** Visible label above the code (e.g. file name / language). */
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
 */
export function CodeBlock({
  code,
  language,
  label,
  copyAriaLabel = "Copy",
  showCopy = true,
  maxHeight,
  className,
  style,
  ...rest
}: CodeBlockProps) {
  const preStyle: CSSProperties | undefined =
    maxHeight == null
      ? undefined
      : {
          maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        };

  const onCopy = () => {
    void navigator.clipboard.writeText(code);
  };

  return (
    <div
      {...rest}
      className={join("fynns-code-block", className)}
      data-language={language}
      style={style}
    >
      {label != null || showCopy ? (
        <div className="fynns-code-block-head">
          {label != null ? (
            <span className="fynns-code-block-label">{label}</span>
          ) : (
            <span className="fynns-code-block-label" />
          )}
          {showCopy ? (
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
          ) : null}
        </div>
      ) : null}
      <pre className="fynns-code-block-pre fynns-scroll" style={preStyle}>
        <code className="fynns-code-block-code">{code}</code>
      </pre>
    </div>
  );
}
