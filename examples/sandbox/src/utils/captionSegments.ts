export type CaptionSegment = { text: string; code: boolean };

/** Split prose on `` `code` `` spans for sandbox help captions. */
export function splitCaptionByBackticks(text: string): CaptionSegment[] {
  const parts = text.split(/`([^`]+)`/g);
  const segments: CaptionSegment[] = [];
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    if (!chunk) continue;
    segments.push({ text: chunk, code: i % 2 === 1 });
  }
  return segments.length > 0 ? segments : [{ text, code: false }];
}
