# Content rhythm

Core owns media and copy spacing. Live: Components `#rhythm` →
`#sandbox-content-rhythm`. These classes ship with `@fynns/ui`.

| Relationship | Constant |
| --- | --- |
| Body and captions, including wrapped text | `--fynns-line-height-body` (1.45, unitless) |
| Media to caption | `--fynns-layout-media-caption-gap` → `--fynns-space-sm` (8dp) |
| Gallery columns and rows, after the tallest caption in the row | `--fynns-layout-media-grid-gap` → `--fynns-layout-unit-stack-gap` (16dp) |
| Gallery to copy, paragraphs, copy to actions | `--fynns-layout-unit-stack-gap` (16dp) |

Use semantic markup with the core recipe:

```tsx
<div className="fynns-content-flow">
  <div className="fynns-media-gallery">
    <figure className="fynns-media-figure">
      <img src={previewUrl} alt="Preview" />
      <figcaption>Preview ready for inspection</figcaption>
    </figure>
  </div>
  <p>Short result metadata.</p>
  <p>Result description that can wrap naturally.</p>
  <div><Button><RefreshIcon aria-hidden />Refresh preview</Button></div>
</div>
```

The gallery adapts to available width using `--fynns-layout-media-min-width`
(12rem). Captions stay with their image. Core resets figure, caption and
direct flow-child margins to avoid doubled gaps. Block media removes the
inline baseline gap. No new React API is required.

Never put the entire stream in one text node, use `<br>` as block spacing,
clamp caption heights, add negative margins, override these classes/tokens
locally, or choose a smaller token merely to fit more rows. Tight, snug and
compact line heights belong to core control/chrome anatomy, not prose or
captions. Unitless line height scales with font size; it does not replace
the fixed gap between separate blocks.

Consumer verification must measure image→caption, caption→next row and
gallery→copy→action at the narrowest supported width with long captions,
wrapped prose and late-loaded media, in light and dark themes.
Regression gate: `npx playwright test e2e/treaty/content-rhythm.spec.ts`.
Existing consumers must re-copy the always-apply rule after treaty updates;
linking the latest core alone does not update an already-copied rule.
