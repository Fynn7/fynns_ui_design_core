import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";
import { ClipboardIcon } from "./icons";
import {
  highlightCode,
  highlightWithProfile,
  isHighlightableLanguage,
  type CodeSegment,
  type SimpleHighlightProfile,
} from "./codeHighlight";

export type CodeBlockVariant = "default" | "plain";

export type CodeBlockProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Source text shown inside `<pre><code>`. */
  code: string;
  /**
   * `default` — optional head (label + hover fade-in copy).
   * `plain` — code only; copy floats and fades in on hover.
   */
  variant?: CodeBlockVariant;
  /**
   * Language id for syntax highlighting (`ts` / `tsx` / `js` / `jsx` / `py` /
   * `cpp` / `css` / `json` / `bash` / `sh`, or a consumer-registered id).
   * Also sets `data-language` on the root. Unknown values render as plain mono
   * unless `highlightProfile` is set.
   */
  language?: string;
  /**
   * One-shot line-command profile (Raycaster `.gsc` shape). Wins over
   * `language` lookup. See `llm/AGENT_INTERFACES.md`.
   */
  highlightProfile?: SimpleHighlightProfile;
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

function renderSegments(segments: CodeSegment[]): ReactNode {
  return segments.map((seg, index) => {
    if (seg.kind === "plain") {
      return <span key={index}>{seg.text}</span>;
    }
    return (
      <span key={index} className={`fynns-code-${seg.kind}`}>
        {seg.text}
      </span>
    );
  });
}

/**
 * Monospace code sample with optional copy affordance (`IconButton` +
 * `Tooltip` + `ClipboardIcon`). Supported `language` values get zero-dep
 * syntax coloring via `--fynns-code-*` tokens. Pass `highlightProfile` for
 * app-owned line-command languages. The `<pre>` uses `fynns-scroll`.
 * Copy fades in on hover (keyboard: :focus-visible); `plain` has no head.
 */
export function CodeBlock({
  code,
  variant = "default",
  language,
  highlightProfile,
  label,
  copyAriaLabel = "Copy",
  showCopy = true,
  maxHeight,
  className,
  style,
  ...rest
}: CodeBlockProps) {
  const plain = variant === "plain";
  const highlighted =
    highlightProfile != null || isHighlightableLanguage(language);
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

  const codeBody = highlighted
    ? renderSegments(
        highlightProfile != null
          ? highlightWithProfile(code, highlightProfile)
          : highlightCode(code, language),
      )
    : code;

  return (
    <div
      {...rest}
      className={join(
        "fynns-code-block",
        plain && "fynns-code-block--plain",
        highlighted && "fynns-code-block--highlighted",
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
        <code className="fynns-code-block-code">{codeBody}</code>
      </pre>
    </div>
  );
}
