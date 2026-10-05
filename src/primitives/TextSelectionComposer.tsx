import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BusyRegion } from "./Busy";
import { IconButton } from "./IconButton";
import { ArrowUpIcon } from "./icons";
import { InlineAlert } from "./InlineAlert";
import { Input } from "./Input";
import { Tooltip } from "./Tooltip";
import { useFloatingBoxPosition } from "./floatingBox";
import {
  captureTextSelection, selectionIsCurrent, textSelectionRect,
  type CapturedTextSelection,
} from "./textSelection";

export type TextSelectionComposerSelection = {
  text: string;
  /** UTF-16 offsets into the selected control value, or wrapper textContent. */
  start: number;
  end: number;
};

export type TextSelectionComposerSubmit = {
  prompt: string;
  selection: TextSelectionComposerSelection;
};

export type TextSelectionComposerProps = {
  /** Wrap Textarea, editable/read-only CodeBlock, or selectable rendered text. */
  children: ReactNode;
  onSubmit: (submission: TextSelectionComposerSubmit) => void | Promise<void>;
  /** Hover reveals an existing selection; keyboard/touch selection also reveals. @default "hover" */
  reveal?: "hover" | "selection";
  disabled?: boolean;
  placeholder?: string;
  inputLabel?: string;
  sendLabel?: string;
  busyLabel?: string;
  /** Localized retry message if onSubmit throws/rejects; draft and selection remain. */
  errorMessage?: string;
  className?: string;
};

/** Optional selection-reference variant. Core owns capture, capsule, placement and motion;
 * the consumer owns what the submitted reference does (no network behavior in Core). */
export function TextSelectionComposer({
  children, onSubmit, reveal = "hover", disabled = false,
  placeholder = "Describe changes", inputLabel = "Message about selected text",
  sendLabel = "Send", busyLabel = "Sending", errorMessage = "Unable to send. Try again.",
  className,
}: TextSelectionComposerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<CapturedTextSelection | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const suppressed = useRef<CapturedTextSelection | null>(null);
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const hovered = useRef(false);
  const dragging = useRef(false);
  const generation = useRef(0);
  const locked = useRef(false);
  const id = useId();
  const open = !!selection && !disabled;
  const getAnchorRect = useCallback(() => selection
    ? textSelectionRect(selection) : new DOMRect(), [selection]);
  const position = useFloatingBoxPosition(rootRef.current, panel, open, {
    side: "bottom", align: "start", sides: ["bottom", "top"], getAnchorRect,
  });

  const dismiss = useCallback(() => {
    suppressed.current = selectionRef.current;
    generation.current += 1;
    locked.current = false;
    setSelection(null);
    setPrompt("");
    setFailed(false);
    setPending(false);
  }, []);

  const restoreFocus = useCallback(() => {
    if (!selection) return;
    const { source, range, start, end } = selection;
    if (!source.isConnected) return;
    source.focus({ preventScroll: true });
    if (!selectionIsCurrent(selection)) return;
    if (source instanceof HTMLTextAreaElement || source instanceof HTMLInputElement) {
      source.setSelectionRange(start, end);
    } else if (range) {
      const native = source.ownerDocument.getSelection();
      native?.removeAllRanges();
      native?.addRange(range);
    }
  }, [selection]);

  const capture = useCallback((accessible = false) => {
    const root = rootRef.current;
    if (!root || disabled || locked.current || panelRef.current?.contains(document.activeElement)) return;
    const next = captureTextSelection(root);
    if (!next) {
      if (selection) dismiss();
      suppressed.current = null;
      return;
    }
    if (reveal === "hover" && !hovered.current && !accessible) return;
    const previous = suppressed.current;
    if (previous && previous.source === next.source && previous.start === next.start &&
      previous.end === next.end && previous.sourceText === next.sourceText) return;
    if (selection && selection.source === next.source && selection.start === next.start &&
      selection.end === next.end && selection.sourceText === next.sourceText) return;
    generation.current += 1;
    setSelection(next);
    setPrompt("");
    setFailed(false);
  }, [disabled, dismiss, reveal, selection]);

  useEffect(() => {
    if (disabled) dismiss();
  }, [disabled, dismiss]);
  useEffect(() => { suppressed.current = null; }, [reveal]);
  useLayoutEffect(() => {
    if (selection && !selectionIsCurrent(selection)) dismiss();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const changed = () => { if (!dragging.current) capture(); };
    const pointerUp = (event: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      capture(event.pointerType !== "mouse");
    };
    document.addEventListener("selectionchange", changed);
    document.addEventListener("pointerup", pointerUp);
    return () => {
      document.removeEventListener("selectionchange", changed);
      document.removeEventListener("pointerup", pointerUp);
    };
  }, [capture]);

  useEffect(() => {
    if (!open || !selection) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      // Restoring selection after dismiss must not reopen the composer.
      restoreFocus();
      dismiss();
    };
    const validate = () => { if (!selectionIsCurrent(selection)) dismiss(); };
    const focusOutside = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) dismiss();
    };
    const observer = new MutationObserver(validate);
    observer.observe(selection.source, { subtree: true, childList: true, characterData: true });
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    document.addEventListener("focusin", focusOutside);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("focusin", focusOutside);
    };
  }, [open, selection, dismiss, restoreFocus]);

  useEffect(() => () => { generation.current += 1; }, []);
  const setPanelRef = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    setPanel(node);
  }, []);

  async function submit() {
    if (!selection || locked.current || !prompt.trim() || disabled) return;
    if (!selectionIsCurrent(selection)) { dismiss(); return; }
    locked.current = true;
    const current = ++generation.current;
    setPending(true);
    setFailed(false);
    try {
      await onSubmit({ prompt: prompt.trim(), selection: {
        text: selection.text, start: selection.start, end: selection.end,
      } });
      if (current !== generation.current) return;
      restoreFocus();
      dismiss();
    } catch {
      if (current !== generation.current) return;
      locked.current = false;
      setPending(false);
      setFailed(true);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={["fynns-text-selection-composer", className].filter(Boolean).join(" ")}
      onPointerEnter={() => { hovered.current = true; if (!dragging.current) capture(); }}
      onPointerLeave={() => { hovered.current = false; }}
      onPointerDown={() => { dragging.current = true; suppressed.current = null; }}
      onSelect={() => { if (!dragging.current) capture(true); }}
      onKeyUp={(event) => {
        if (["Shift", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key) ||
          ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a")) {
          suppressed.current = null;
          capture(true);
        }
      }}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          restoreFocus();
          dismiss();
        } else if (open && event.key === "Tab" && !event.shiftKey && inputRef.current) {
          event.preventDefault();
          event.stopPropagation();
          inputRef.current.focus({ preventScroll: true });
        }
      }}
      onInput={dismiss}
    >
      {children}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={setPanelRef}
          className="fynns-text-selection-composer-panel"
          style={{ top: position?.top, left: position?.left, maxWidth: position?.maxWidth,
            visibility: position ? "visible" : "hidden" }}
          // React portals bubble to the wrapper: input selection must not recapture itself.
          onPointerDown={(event) => event.stopPropagation()}
          onSelect={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape" ||
              (event.key === "Tab" && event.shiftKey && event.target === inputRef.current)) {
              event.preventDefault();
              restoreFocus();
              dismiss();
            }
          }}
          onInput={(event) => event.stopPropagation()}
        >
          <span id={`${id}-selection`} className="fynns-sr-only">
            {selection.text}
          </span>
          <BusyRegion busy={pending} label={busyLabel}>
            <form
              className="fynns-text-selection-composer-form"
              aria-label={inputLabel}
              onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void submit(); }}
            >
              <Input
                ref={inputRef}
                className="fynns-text-selection-composer-input"
                aria-label={inputLabel}
                aria-describedby={`${id}-selection${failed ? ` ${id}-error` : ""}`}
                placeholder={placeholder}
                value={prompt}
                disabled={pending}
                onChange={(event) => { setPrompt(event.target.value); setFailed(false); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) {
                    event.preventDefault();
                  }
                }}
              />
              <Tooltip content={sendLabel}>
                <IconButton type="submit" aria-label={sendLabel}
                  disabled={pending || !prompt.trim()} variant="ghost">
                  <ArrowUpIcon />
                </IconButton>
              </Tooltip>
            </form>
          </BusyRegion>
          {failed && <InlineAlert id={`${id}-error`} severity="error" message={errorMessage} />}
        </div>, document.body,
      )}
    </div>
  );
}
