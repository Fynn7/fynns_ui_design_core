import { Button, RefreshIcon } from "@fynns/ui";

/** Generic content, including long captions and a wrapped paragraph. */
export function ContentRhythmDemo() {
  return (
    <div id="sandbox-content-rhythm" className="fynns-content-flow">
      <div className="fynns-media-gallery">
        {Array.from({ length: 6 }, (_, index) => (
          <figure className="fynns-media-figure" key={index}>
            <svg viewBox="0 0 240 160" role="img" aria-label={`Preview ${index + 1}`}>
              <rect width="240" height="160" rx="16" fill="var(--fynns-color-surface-2)" />
              <circle cx="120" cy="80" r="40" fill="var(--fynns-color-accent)" />
            </svg>
            <figcaption>Preview {index + 1}: a longer caption that wraps naturally in a narrow content column.</figcaption>
          </figure>
        ))}
      </div>
      <p>Recorded preview available for inspection.</p>
      <p>The content keeps a readable line height when this longer paragraph wraps across multiple lines. Captions, adjacent tiles, paragraphs and the following action each retain their own shared spacing.</p>
      <div><Button><RefreshIcon aria-hidden />Refresh preview</Button></div>
    </div>
  );
}
