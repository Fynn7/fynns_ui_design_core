/**
 * Caption helpers: split a string on backticks into prose vs monospace
 * segments. Generic text utilities shared by caption renderers.
 */
export function splitCaptionByBackticks(
  caption: string,
): Array<{ code: boolean; text: string }> {
  const segments: Array<{ code: boolean; text: string }> = [];
  let pos = 0;
  let inCode = false;
  while (pos <= caption.length) {
    const tick = caption.indexOf("`", pos);
    const end = tick === -1 ? caption.length : tick;
    const chunk = caption.slice(pos, end);
    if (chunk.length > 0) segments.push({ code: inCode, text: chunk });
    if (tick === -1) break;
    inCode = !inCode;
    pos = tick + 1;
  }
  if (segments.length === 0) return [{ code: false, text: caption }];
  return segments;
}

/** Plain text for aria-labels (backticks are presentation-only). */
export function stripCaptionBackticks(caption: string): string {
  return caption.replaceAll("`", "");
}
