/** Selection capture is separate from floating placement. Offsets use UTF-16. */
export type CapturedTextSelection = {
  text: string;
  start: number;
  end: number;
  source: HTMLElement;
  sourceText: string;
  range: Range | null;
};

function isTextControl(node: Element | null): node is HTMLTextAreaElement | HTMLInputElement {
  return node instanceof HTMLTextAreaElement ||
    (node instanceof HTMLInputElement && ["text", "search", "url", "tel"].includes(node.type));
}

export function captureTextSelection(root: HTMLElement): CapturedTextSelection | null {
  const active = root.ownerDocument.activeElement;
  if (isTextControl(active) && root.contains(active)) {
    if (active.closest(".fynns-text-selection-composer") !== root) return null;
    const start = active.selectionStart ?? 0;
    const end = active.selectionEnd ?? 0;
    const text = active.value.slice(start, end);
    return text.trim() ? { text, start, end, source: active, sourceText: active.value, range: null } : null;
  }
  const selection = root.ownerDocument.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  // Nested wrappers own their selections independently.
  const startElement = range.startContainer instanceof Element
    ? range.startContainer : range.startContainer.parentElement;
  if (startElement?.closest(".fynns-text-selection-composer") !== root) return null;
  const prefix = root.ownerDocument.createRange();
  prefix.selectNodeContents(root);
  prefix.setEnd(range.startContainer, range.startOffset);
  const text = range.toString();
  const start = prefix.toString().length;
  return text.trim() ? {
    text, start, end: start + text.length, source: root,
    sourceText: root.textContent ?? "", range: range.cloneRange(),
  } : null;
}

export function selectionIsCurrent(selection: CapturedTextSelection): boolean {
  const { source, sourceText, range, text } = selection;
  return source.isConnected && (isTextControl(source)
    ? source.value === sourceText
    : source.textContent === sourceText && !!range &&
      source.contains(range.startContainer) && source.contains(range.endContainer) && range.toString() === text);
}

/** Measure native textarea selection via a transient, inert typography mirror. */
export function textSelectionRect(selection: CapturedTextSelection): DOMRect {
  const { source, range, start, end, sourceText } = selection;
  if (range) {
    const rects = range.getClientRects();
    return rects[rects.length - 1] ?? range.getBoundingClientRect();
  }
  const doc = source.ownerDocument;
  const mirror = doc.createElement("div");
  const style = getComputedStyle(source);
  for (const prop of [
    "box-sizing", "width", "height", "padding", "border", "font", "line-height",
    "letter-spacing", "word-spacing", "text-align", "text-indent", "text-transform",
    "tab-size", "direction", "word-break", "overflow-wrap",
  ]) mirror.style.setProperty(prop, style.getPropertyValue(prop));
  const rect = source.getBoundingClientRect();
  Object.assign(mirror.style, {
    position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
    visibility: "hidden", pointerEvents: "none", overflow: "hidden",
    whiteSpace: source instanceof HTMLTextAreaElement && source.wrap !== "off" ? "pre-wrap" : "pre",
  });
  mirror.setAttribute("aria-hidden", "true");
  mirror.inert = true;
  const text = doc.createTextNode(sourceText + "\u200b");
  mirror.append(text);
  doc.body.append(mirror);
  try {
    mirror.scrollTop = source.scrollTop;
    mirror.scrollLeft = source.scrollLeft;
    const probe = doc.createRange();
    probe.setStart(text, start);
    probe.setEnd(text, end);
    const rects = probe.getClientRects();
    return rects[rects.length - 1] ?? rect;
  } finally {
    mirror.remove();
  }
}
