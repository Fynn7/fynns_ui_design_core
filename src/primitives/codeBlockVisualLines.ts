/** Copy layout/type metrics from a textarea onto an offscreen mirror. */
function applyTextareaMirrorStyles(
  template: HTMLTextAreaElement,
  mirror: HTMLTextAreaElement,
  widthPx: number,
): void {
  const cs = getComputedStyle(template);
  mirror.setAttribute("aria-hidden", "true");
  mirror.setAttribute("tabindex", "-1");
  mirror.readOnly = true;
  mirror.style.position = "fixed";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.resize = "none";
  mirror.style.overflow = "hidden";
  mirror.style.width = `${widthPx}px`;
  mirror.style.height = "0";
  mirror.style.boxSizing = cs.boxSizing;
  mirror.style.padding = cs.padding;
  mirror.style.border = cs.border;
  mirror.style.margin = "0";
  mirror.style.font = cs.font;
  mirror.style.fontFamily = cs.fontFamily;
  mirror.style.fontSize = cs.fontSize;
  mirror.style.fontWeight = cs.fontWeight;
  mirror.style.fontStyle = cs.fontStyle;
  mirror.style.lineHeight = cs.lineHeight;
  mirror.style.letterSpacing = cs.letterSpacing;
  mirror.style.tabSize = cs.tabSize;
  mirror.style.fontVariantLigatures = cs.fontVariantLigatures;
  mirror.style.fontFeatureSettings = cs.fontFeatureSettings;
  mirror.style.textTransform = cs.textTransform;
  mirror.style.whiteSpace = cs.whiteSpace;
  mirror.style.wordBreak = cs.wordBreak;
  mirror.style.overflowWrap = cs.overflowWrap;
  mirror.wrap = template.wrap;
  mirror.rows = 1;
}

function mirrorScrollHeight(mirror: HTMLTextAreaElement, prefix: string): number {
  mirror.value = prefix;
  mirror.style.height = "0";
  return mirror.scrollHeight;
}

function pushUniqueLineStart(starts: number[], index: number): void {
  if (index <= 0) return;
  const last = starts[starts.length - 1]!;
  if (index <= last) return;
  starts.push(index);
}

/**
 * Measure soft-wrap visual line starts using an offscreen **textarea** mirror
 * (div/pre mirrors diverge from Chromium textarea wrap columns). Each index is
 * the first code unit on a new visual row (hard `\n` or soft wrap).
 */
export function measureVisualLineStarts(
  text: string,
  hostWidth: number,
  styleSource: HTMLTextAreaElement,
): number[] {
  if (text.length === 0) return [0];
  if (hostWidth <= 0) return [0];

  const mirror = document.createElement("textarea");
  applyTextareaMirrorStyles(styleSource, mirror, hostWidth);
  document.body.appendChild(mirror);

  const starts = [0];
  let prevHeight = mirrorScrollHeight(mirror, "");

  try {
    for (let i = 0; i < text.length; i++) {
      const prefix = text.slice(0, i + 1);
      const height = mirrorScrollHeight(mirror, prefix);
      if (height <= prevHeight + 0.5) {
        prevHeight = height;
        continue;
      }

      const ch = text[i]!;
      if (ch === "\n") {
        pushUniqueLineStart(starts, i + 1);
      } else {
        pushUniqueLineStart(starts, i);
      }
      prevHeight = height;
    }

    if (text.endsWith("\n")) {
      pushUniqueLineStart(starts, text.length);
    }
  } finally {
    document.body.removeChild(mirror);
  }

  return starts;
}

/** One visual row of source text — never embed `\n` (block rows carry the break). */
export function visualLineSlice(source: string, start: number, end: number): string {
  let slice = source.slice(start, end);
  if (slice.endsWith("\n")) slice = slice.slice(0, -1);
  return slice;
}
