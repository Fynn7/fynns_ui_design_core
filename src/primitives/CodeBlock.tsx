import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
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
   * Language id for syntax highlighting (`ts` / `tsx` / `js` / `jsx` / `py` /
   * `cpp` / `css` / `json` / `xml` / `html` / `bash` / `sh`, or a
   * consumer-registered id). Also sets `data-language` on the root. Unknown
   * values render as plain mono unless `highlightProfile` is set.
   * **Not inferred from `label`** — a filename like `prompt.xml` still needs
   * `language="xml"` (see `llm/AGENT_INTERFACES.md`).
   */
  language?: string;
  /**
   * One-shot line-command profile (Raycaster `.gsc` shape). Wins over
   * `language` lookup. See `llm/AGENT_INTERFACES.md`.
   */
  highlightProfile?: SimpleHighlightProfile;
  /** Copy button tooltip / aria-label. @default "Copy" */
  copyAriaLabel?: string;
  /** Show the copy control. @default true. */
  showCopy?: boolean;
  /**
   * Soft-wrap long lines inside the block (no horizontal scrollbar).
   * Pass `false` for classic `pre` scrolling when a line overflows.
   * @default true
   */
  wrap?: boolean;
  /** Max height of the scrollable code surface (CSS length). */
  maxHeight?: string | number;
};

/**
 * Titled chrome: filename / title + hairline divider + copy in the head.
 * **Requires** a non-empty `label`. No filename → use `variant="plain"`.
 */
export type CodeBlockLabeledProps = CodeBlockShared & {
  variant?: "default";
  /**
   * Visible filename / title in the head (required, non-empty after trim).
   * Empty / omitted → throws; do not pass `label=""` to “hide” the head.
   */
  label: string;
  /** Source text shown inside `<pre><code>`. */
  code: string;
  value?: never;
  defaultValue?: never;
  onChange?: never;
};

/**
 * Headless chrome: bordered frame + copy in a reserved end column (no title
 * bar, no divider). Do **not** pass `label`.
 */
export type CodeBlockPlainProps = CodeBlockShared & {
  variant: "plain";
  label?: never;
  /** Source text shown inside `<pre><code>`. */
  code: string;
  value?: never;
  defaultValue?: never;
  onChange?: never;
};

export type CodeBlockReadonlyProps =
  | CodeBlockLabeledProps
  | CodeBlockPlainProps;

export type CodeBlockEditableProps = CodeBlockShared & {
  variant: "editable";
  /**
   * When set (non-empty), shows the titled head. Omit for reserved-column copy
   * chrome (same visual contract as `plain`). Empty string throws.
   */
  label?: string;
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
  /**
   * When true (default), editable height tracks content from `rows` (min
   * floor, default 1) up to `maxHeight`. Pass `false` for a fixed `rows`
   * well, or when a fill host stretches the textarea with `height: 100%`.
   */
  autoGrow?: boolean;
  /**
   * Intrinsic textarea row floor (also empty-state height when `autoGrow`).
   * Default `1` so short copy does not sit in a tall well. With
   * `autoGrow={false}`, sets the fixed row count.
   */
  rows?: number;
  name?: string;
  /** Accessible name when `label` is omitted. */
  "aria-label"?: string;
};

export type CodeBlockProps = CodeBlockReadonlyProps | CodeBlockEditableProps;

const LABELED_WITHOUT_LABEL =
  '[fynns] CodeBlock: the titled variant (head + hairline + copy) requires a non-empty `label` (e.g. a filename). Use `variant="plain"` when there is no title — do not pass `label=""` or omit `label` on `variant="default"`.';

const PLAIN_WITH_LABEL =
  '[fynns] CodeBlock: `variant="plain"` is headless (frame + copy in a reserved end column). Do not pass `label` — use `variant="default"` (or omit variant) with a non-empty `label` for the titled head.';

const EMPTY_EDITABLE_LABEL =
  '[fynns] CodeBlock: `variant="editable"` with `label` requires a non-empty string. Omit `label` for reserved-column copy chrome, or pass a real filename/title.';

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

function assertCodeBlockChrome(
  variant: CodeBlockVariant | undefined,
  label: string | undefined,
): string | undefined {
  const plain = variant === "plain";
  const editable = variant === "editable";
  const trimmed = label == null ? undefined : label.trim();

  if (plain) {
    if (label != null) {
      throw new Error(PLAIN_WITH_LABEL);
    }
    return undefined;
  }

  if (editable) {
    if (label != null && trimmed === "") {
      throw new Error(EMPTY_EDITABLE_LABEL);
    }
    return trimmed || undefined;
  }

  /* default / omitted → titled head */
  if (trimmed == null || trimmed === "") {
    throw new Error(LABELED_WITHOUT_LABEL);
  }
  return trimmed;
}

/**
 * Monospace code sample with optional copy affordance (`IconButton` +
 * `Tooltip` + `ClipboardIcon`).
 *
 * **Chrome contract (strict):**
 * - **Titled** (`variant="default"` / omit variant): non-empty `label`
 *   (filename) + head hairline + copy. Missing / empty `label` **throws**.
 * - **Headless** (`variant="plain"`): frame + copy in a reserved end column —
 *   no `label`. Glyphs must never sit under the copy `IconButton`.
 * - **Editable** (`variant="editable"`): same head rules when `label` is set;
 *   omit `label` for the same reserved-column copy chrome.
 *
 * Supported `language` values get zero-dep syntax coloring via
 * `--fynns-code-*` tokens. Pass `highlightProfile` for app-owned line-command
 * languages. The scroll surface uses `fynns-scroll`. Vertical overflow is
 * gated with `data-scrollable` (same idea as `ChatComposer`) so a 1px
 * scrollHeight/clientHeight mismatch from padding / trailing newlines does
 * not paint an early thumb while copy still fits the host.
 *
 * Editable height defaults to **autoGrow** (content-sized from `rows` floor
 * up to `maxHeight`); pass `autoGrow={false}` for a fixed well or fill hosts
 * that set `textarea { height: 100% }`.
 */
export function CodeBlock(props: CodeBlockProps) {
  const editable = props.variant === "editable";
  const plain = props.variant === "plain";
  const {
    language,
    highlightProfile,
    label: labelProp,
    copyAriaLabel = "Copy",
    showCopy = true,
    wrap = true,
    maxHeight,
    className,
    style,
  } = props;

  const label = assertCodeBlockChrome(props.variant, labelProp);

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const updateScrollableRef = useRef<() => void>(() => {});
  const scrollSyncRafRef = useRef(0);
  const maxHeightCss =
    maxHeight == null
      ? undefined
      : typeof maxHeight === "number"
        ? `${maxHeight}px`
        : maxHeight;
  const surfaceStyle: CSSProperties | undefined =
    maxHeightCss == null ? undefined : { maxHeight: maxHeightCss };

  const syncHighlightScroll = () => {
    const input = inputRef.current;
    const pre = highlightRef.current;
    if (!input || !pre) return;
    pre.scrollTop = input.scrollTop;
    pre.scrollLeft = input.scrollLeft;
  };

  /* Opt into overflow auto only when content actually exceeds the host.
     Default CSS keeps overflow hidden so sub-pixel / trailing-newline
     noise cannot paint a nearly-full thumb over empty pad.
     Soft-wrap: vertical gate only. `wrap={false}` also gates on width so
     long lines still get classic pre scroll (x and/or y).
     When a vertical thumb appears, pad the highlight layer by the
     scrollbar width so transparent caret/ink stay column-locked.
     ResizeObserver stays mounted across keystrokes — content changes call
     `updateScrollableRef` without reconnecting observers every paint. */
  useLayoutEffect(() => {
    const el = editable ? inputRef.current : preRef.current;
    if (!el) return;

    let padRaf = 0;
    let wasScrollable = el.hasAttribute("data-scrollable");

    const syncHighlightPad = (scrollable: boolean) => {
      const pre = highlightRef.current;
      if (!pre || !editable) return;
      if (!scrollable) {
        pre.style.paddingInlineEnd = "";
        return;
      }
      const sb = Math.max(0, el.offsetWidth - el.clientWidth);
      pre.style.paddingInlineEnd =
        sb > 0
          ? `calc(var(--fynns-layout-content-inset) + ${sb}px)`
          : "";
    };

    const update = () => {
      const yOverflow = el.scrollHeight - el.clientHeight > 1;
      const xOverflow = !wrap && el.scrollWidth - el.clientWidth > 1;
      const scrollable = yOverflow || xOverflow;
      if (scrollable) {
        el.setAttribute("data-scrollable", "");
        wasScrollable = true;
        // Scrollbar width is only known after overflow:auto paints.
        if (padRaf) cancelAnimationFrame(padRaf);
        padRaf = requestAnimationFrame(() => {
          padRaf = 0;
          syncHighlightPad(true);
        });
      } else {
        el.removeAttribute("data-scrollable");
        /* Only clear scroll when leaving the scrollable state — avoids
           resetting mid-edit near the overflow threshold every key. */
        if (wasScrollable) {
          if (el.scrollTop !== 0) el.scrollTop = 0;
          if (el.scrollLeft !== 0) el.scrollLeft = 0;
          if (editable && highlightRef.current) {
            highlightRef.current.scrollTop = 0;
            highlightRef.current.scrollLeft = 0;
          }
        }
        wasScrollable = false;
        syncHighlightPad(false);
      }
    };

    updateScrollableRef.current = update;
    update();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            update();
          })
        : null;
    ro?.observe(el);
    return () => {
      if (padRaf) cancelAnimationFrame(padRaf);
      ro?.disconnect();
      updateScrollableRef.current = () => {};
      if (highlightRef.current) highlightRef.current.style.paddingInlineEnd = "";
    };
  }, [editable, wrap, maxHeightCss]);

  const disabled = editable ? props.disabled : undefined;
  const readOnly = editable ? props.readOnly : undefined;
  const placeholder = editable ? props.placeholder : undefined;
  const rows = editable ? (props.rows ?? 1) : undefined;
  const autoGrow = editable ? (props.autoGrow ?? true) : false;
  const name = editable ? props.name : undefined;
  const ariaLabelProp = editable ? props["aria-label"] : undefined;

  const syncEditableHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el || !editable) return;
    if (!autoGrow) {
      el.style.height = "";
      return;
    }
    const cs = getComputedStyle(el);
    const lineHeight =
      Number.parseFloat(cs.lineHeight) ||
      Number.parseFloat(cs.fontSize) * 1.5 ||
      18;
    const padY =
      (Number.parseFloat(cs.paddingTop) || 0) +
      (Number.parseFloat(cs.paddingBottom) || 0);
    const borderY =
      (Number.parseFloat(cs.borderTopWidth) || 0) +
      (Number.parseFloat(cs.borderBottomWidth) || 0);
    const minRows = typeof rows === "number" && rows > 0 ? rows : 1;
    const floor = minRows * lineHeight + padY + borderY;
    const cssMax = Number.parseFloat(cs.maxHeight);
    const hasCssMax = Number.isFinite(cssMax) && cssMax > 0;
    const cap = hasCssMax ? cssMax : Number.POSITIVE_INFINITY;

    if (!el.value) {
      el.style.height = `${floor}px`;
      return;
    }

    el.style.height = "0px";
    const contentBox = el.scrollHeight + borderY;
    const next = Math.min(Math.max(contentBox, floor), cap);
    el.style.height = `${next}px`;
  }, [autoGrow, editable, rows]);

  /* Content / autoGrow / deferred highlight: resize → overflow gate → scroll lock. */
  useLayoutEffect(() => {
    syncEditableHeight();
    updateScrollableRef.current();
    if (editable) syncHighlightScroll();
  }, [autoGrow, editable, source, deferredSource, maxHeightCss, syncEditableHeight]);

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
    /* DOM already has `next`; resize before paint (layout effect also re-runs). */
    syncEditableHeight();
    updateScrollableRef.current();
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

  const onInputScroll = () => {
    /* Sync now + one trailing frame — trackpad inertia / scroll coalescing
       can leave the highlight layer a paint behind the caret otherwise. */
    syncHighlightScroll();
    if (scrollSyncRafRef.current) cancelAnimationFrame(scrollSyncRafRef.current);
    scrollSyncRafRef.current = requestAnimationFrame(() => {
      scrollSyncRafRef.current = 0;
      syncHighlightScroll();
    });
  };

  useEffect(() => {
    return () => {
      if (scrollSyncRafRef.current) cancelAnimationFrame(scrollSyncRafRef.current);
    };
  }, []);

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

  const rootProps = omitKnownKeys(props, [
    "variant",
    "language",
    "highlightProfile",
    "label",
    "copyAriaLabel",
    "showCopy",
    "wrap",
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
    "autoGrow",
    "name",
    "aria-label",
  ]);

  const showHead = label != null;
  const headlessCopy = Boolean(showCopy && !showHead);

  return (
    <div
      {...rootProps}
      className={join(
        "fynns-code-block",
        plain && "fynns-code-block--plain",
        editable && "fynns-code-block--editable",
        highlighted && "fynns-code-block--highlighted",
        !wrap && "fynns-code-block--nowrap",
        headlessCopy && "fynns-code-block--copy-float",
        className,
      )}
      data-language={language}
      style={style}
    >
      {showHead ? (
        <div className="fynns-code-block-head">
          <span className="fynns-code-block-label">{label}</span>
          {copyControl}
        </div>
      ) : (
        copyControl
      )}
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
            ref={inputRef}
            className="fynns-code-block-input fynns-scroll"
            style={surfaceStyle}
            value={source}
            onChange={onInputChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onScroll={onInputScroll}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            wrap={wrap ? "soft" : "off"}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            /* Intrinsic row floor — with autoGrow (default) this is the min
               height; pass autoGrow={false} for a fixed well or fill hosts
               that stretch via flex + optional host `textarea { height: 100% }`. */
            rows={rows ?? 1}
            name={name}
            aria-label={ariaLabelProp ?? label}
          />
        </div>
      ) : (
        <pre
          ref={preRef}
          className="fynns-code-block-pre fynns-scroll"
          style={surfaceStyle}
        >
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
