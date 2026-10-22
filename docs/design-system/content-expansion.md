# Content expansion

Research and implementation decision, 2026-10-09. Live examples: sandbox Components → CodeBlock, anchors #sandbox-content-expand, #sandbox-content-expand-text and #sandbox-content-expand-units.

## Findings from primary sources

| System | Encapsulation | Implication for this core |
| --- | --- | --- |
| [Mantine Spoiler](https://mantine.dev/core/spoiler/) | Arbitrary children, measured maxHeight, no toggle below the threshold, controlled expansion and explicit labels | Measurement and toggle belong together; a trigger alone leaves consumers to reinvent behavior. |
| [Chakra Collapsible](https://chakra-ui.com/docs/components/collapsible) | Root / Trigger / Content / Indicator, controlled or uncontrolled; collapsedHeight supports partial previews | Separate visibility state from shell chrome; partial height is one use case, not a universal recipe. |
| [Radix Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible) | Root / Trigger / Content; always-visible units alongside optional complete units | Rich content should expand complete units. Reference only: no dependency introduced. |
| [GOV.UK Details](https://design-system.service.gov.uk/components/details/) | Quiet disclosure for one optional section; short descriptive trigger copy | Keep secondary detail low emphasis; do not conceal information most users need. Existing Collapsible remains the header-led section API. |
| [WAI-ARIA disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Button, aria-expanded, optional aria-controls; Enter and Space | Shared native button semantics, relationship to content and keyboard activation. |

These sources establish behavior and composition, not a universal mandated visual style. The following is this design system's decision: keep the existing accent text + chevron, aligned with the content start edge. A framed preview keeps the disclosure inside the same shell; its bottom border follows the disclosure. Unframed copy uses a 16dp gap. No action Button chrome, download cluster placement or extra consumer spacer.

## APIs and selection

- Plain copy: `ExpandableText text={fullText}`. Default five actual rendered lines, ellipsis at the end; resize and font completion remeasure overflow. Short copy renders without a toggle. Only plain text is accepted, so no clipped hidden controls can enter keyboard traversal. Full text remains available to assistive technology.
- Readonly code: `ExpandableCodeBlock`, same titled/plain CodeBlock union and full source, plus `previewLines` (default five). Measures wrapped code, retains the complete frame/header/Copy, with the disclosure footer inside that same frame and no separator above the footer. The preview uses CodeBlock's existing scroll surface and edge fade; expanding removes the height cap. Copy always receives the entire source. Editable code stays CodeBlock and is never cropped by disclosure. The wrapper owns maxHeight.
- Rich copy, cards, fields, images and mixed components: `ExpandableContent preview={visibleUnits}` with additional units in `children`. No pixel crop or gradient on the whole shell. Additional children remain mounted to preserve form state but are `hidden` while collapsed; keyboard and accessibility traversal cannot reach them. Closing while focus is inside the extra content returns focus to the toggle. Omit preview for wholly optional detail; set `canExpand={false}` when there is no overflow to hide.
- All three support `expanded`, `defaultExpanded`, `onExpandedChange`, `expandLabel`, `collapseLabel`. Products supply localized, descriptive labels; use specific action copy when several disclosures coexist. Expansion is a local view state, not network pagination.
- Existing ChatMessage manages its own streaming-aware collapse. Existing Collapsible is for a named section with a header trigger. Collections continue to use `useRevealMore` + `RevealMore` or Pagination. Do not wrap arbitrary List/Table collections in a pixel-height preview.

## Examples

```tsx
import { ExpandableText, ExpandableCodeBlock, ExpandableContent, Card } from "@fynns/ui";

<ExpandableText text={description} expandLabel={expandCopy} collapseLabel={collapseCopy} />
<ExpandableCodeBlock label={sourceLabel} code={fullSource} language="text"
  copyAriaLabel={copyLabel} expandLabel={expandCopy} collapseLabel={collapseCopy} />
<Card title={summaryLabel}>
  <ExpandableContent preview={summary}
    expandLabel={expandCopy} collapseLabel={collapseCopy}>
    {details}
  </ExpandableContent>
</Card>
```

The preview is an explicit subset and children are the remainder, not a second copy of the preview. For a single uninterrupted paragraph use ExpandableText; for rich prose divide on paragraph or section boundaries. Avoid hidden duplicated IDs, duplicated stateful controls, sliced source strings for Copy, consumer gradient overlays, negative margins and fixed arbitrary preview heights.

## Review boundaries

No existing API signatures changed; the new wrappers are additive. This change stays in core and sandbox. Consumer migration prompts follow user review and should name these APIs, rather than instruct consumers to rebuild the style.
