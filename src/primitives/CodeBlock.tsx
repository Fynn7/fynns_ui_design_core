import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
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

export type CodeBlockVariant = "default" | "plain" | "editable";

type CodeBlockShared = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "defaultValue"
> & {
  /**
   * `default` — optional head (label + hover fade-in copy).
   * `plain` — code only; copy floats and fades in on hover.
   * `editable` — highlighted backdrop + transparent textarea (caret stays
   * snappy; highlight / parent `onChange` update via deferred work).
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
  /** Max height of the scrollable code surface (CSS length). */
  maxHeight?: string | number;
};

export type CodeBlockReadonlyProps = CodeBlockShared & {
  variant?: "default" | "plain";
  /** Source text shown inside `<pre><code>`. */
  code: string;
  value?: never;
  defaultValue?: never;
  onChange?: never;
};

export type CodeBlockEditableProps = CodeBlockShared & {
  variant: "editable";
  /** Optional seed when using controlled `value` / uncontrolled `defaultValue`. */
  code?: string;
  /** Controlled source (editable). */
  value?: string;
  /** Uncontrolled initial source (editable). */
  defaultValue?: string;
  onChange?: (code: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  name?: string;
  /** Accessible name when `label` is omitted. */
  "aria-label"?: string;
};

export type CodeBlockProps = CodeBlockReadonlyProps | CodeBlockEditableProps;

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function omitKnownKeys<T extends object>(
  obj: T,
  keys: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  for (const key of keys) delete out[key];
  return out;
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

function highlightSource(
  source: string,
  language: string | undefined,
  highlightProfile: SimpleHighlightProfile | undefined,
): ReactNode {
  return renderSegments(
    highlightProfile != null
      ? highlightWithProfile(source, highlightProfile)
      : highlightCode(source, language),
  );
}

function initialEditableSource(props: CodeBlockEditableProps): string {
  if (props.value != null) return props.value;
  if (props.defaultValue != null) return props.defaultValue;
  if (props.code != null) return props.code;
  return "";
}

/**
 * Monospace code sample with optional copy affordance (`IconButton` +
 * `Tooltip` + `ClipboardIcon`). Supported `language` values get zero-dep
 * syntax coloring via `--fynns-code-*` tokens. Pass `highlightProfile` for
 * app-owned line-command languages. The scroll surface uses `fynns-scroll`.
 * Copy fades in on hover (keyboard: :focus-visible); `plain` has no head.
 * `editable` stacks a highlighted `<pre>` under a transparent textarea.
 */
export function CodeBlock(props: CodeBlockProps) {
  const editable = props.variant === "editable";
  const plain = props.variant === "plain";
  const {
    language,
    highlightProfile,
    label,
    copyAriaLabel = "Copy",
    showCopy = true,
    maxHeight,
    className,
    style,
  } = props;

  const highlighted =
    highlightProfile != null || isHighlightableLanguage(language);

  /* Editable keeps a local draft so the caret never waits on parent re-renders
     (sandbox GlobalsPage is huge) or on re-tokenization. */
  const [editableText, setEditableText] = useState(() =>
    editable ? initialEditableSource(props) : "",
  );
  const emittedRef = useRef(editableText);
  const lastNotifiedRef = useRef(editableText);
  const focusedRef = useRef(false);
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeProp = editable ? props.onChange : undefined;
  const valueProp = editable ? props.value : undefined;

  /* While focused, ignore stale controlled echoes (startTransition parents
     often lag behind the draft). Apply external `value` only when blurred. */
  useEffect(() => {
    if (valueProp === undefined) return;
    if (focusedRef.current) return;
    if (valueProp === emittedRef.current) return;
    emittedRef.current = valueProp;
    lastNotifiedRef.current = valueProp;
    setEditableText(valueProp);
  }, [valueProp]);

  useEffect(() => {
    return () => {
      if (notifyTimerRef.current != null) clearTimeout(notifyTimerRef.current);
    };
  }, []);

  const source = editable ? editableText : props.code;
  const deferredSource = useDeferredValue(source);

  const highlightRef = useRef<HTMLPreElement>(null);
  const maxHeightCss =
    maxHeight == null
      ? undefined
      : typeof maxHeight === "number"
        ? `${maxHeight}px`
        : maxHeight;
  const surfaceStyle: CSSProperties | undefined =
    maxHeightCss == null ? undefined : { maxHeight: maxHeightCss };

  const flushNotify = (next: string) => {
    if (!onChangeProp) return;
    if (next === lastNotifiedRef.current) return;
    lastNotifiedRef.current = next;
    const notify = onChangeProp;
    startTransition(() => {
      notify(next);
    });
  };

  const onCopy = (event: { currentTarget: HTMLElement }) => {
    void navigator.clipboard.writeText(source);
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

  const onInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    emittedRef.current = next;
    setEditableText(next);
    if (!onChangeProp) return;
    /* Coalesce parent updates while typing — a controlled CodeBlock inside a
       large tree must not re-render that tree on every key. */
    if (notifyTimerRef.current != null) clearTimeout(notifyTimerRef.current);
    notifyTimerRef.current = setTimeout(() => {
      notifyTimerRef.current = null;
      flushNotify(emittedRef.current);
    }, 120);
  };

  const onInputFocus = () => {
    focusedRef.current = true;
  };

  const onInputBlur = () => {
    focusedRef.current = false;
    if (notifyTimerRef.current != null) {
      clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = null;
    }
    flushNotify(emittedRef.current);
  };

  const onInputScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const pre = highlightRef.current;
    if (!pre) return;
    pre.scrollTop = event.currentTarget.scrollTop;
    pre.scrollLeft = event.currentTarget.scrollLeft;
  };

  /* Trailing newline on the highlight layer only — keeps last-line height
     aligned with the textarea caret. Defer tokenization so typing stays
     responsive while spans catch up a frame or two behind. */
  const highlightBase = editable ? deferredSource : source;
  const highlightText =
    editable && !highlightBase.endsWith("\n")
      ? `${highlightBase}\n`
      : highlightBase;
  const codeBody = highlighted
    ? highlightSource(highlightText, language, highlightProfile)
    : highlightText;

  const disabled = editable ? props.disabled : undefined;
  const readOnly = editable ? props.readOnly : undefined;
  const placeholder = editable ? props.placeholder : undefined;
  const rows = editable ? props.rows : undefined;
  const name = editable ? props.name : undefined;
  const ariaLabelProp = editable ? props["aria-label"] : undefined;

  const rootProps = omitKnownKeys(props, [
    "variant",
    "language",
    "highlightProfile",
    "label",
    "copyAriaLabel",
    "showCopy",
    "maxHeight",
    "className",
    "style",
    "code",
    "value",
    "defaultValue",
    "onChange",
    "disabled",
    "readOnly",
    "placeholder",
    "rows",
    "name",
    "aria-label",
  ]);

  return (
    <div
      {...rootProps}
      className={join(
        "fynns-code-block",
        plain && "fynns-code-block--plain",
        editable && "fynns-code-block--editable",
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
      {editable ? (
        <div className="fynns-code-block-editor">
          <pre
            ref={highlightRef}
            className="fynns-code-block-highlight"
            aria-hidden
          >
            <code className="fynns-code-block-code">{codeBody}</code>
          </pre>
          <textarea
            className="fynns-code-block-input fynns-scroll"
            style={surfaceStyle}
            value={source}
            onChange={onInputChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onScroll={onInputScroll}
            spellCheck={false}
            wrap="off"
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            rows={rows ?? 6}
            name={name}
            aria-label={ariaLabelProp ?? label}
          />
        </div>
      ) : (
        <pre className="fynns-code-block-pre fynns-scroll" style={surfaceStyle}>
          <code className="fynns-code-block-code">
            {highlighted
              ? highlightSource(source, language, highlightProfile)
              : source}
          </code>
        </pre>
      )}
    </div>
  );
}
