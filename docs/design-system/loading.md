# Content-position loading skeletons

← back to [Design system index](../DESIGN_SYSTEM.md)

A skeleton means **UI or text will appear at this exact position**. It is a
placeholder for upcoming content, never a generic busy glyph. Loading screens
show large, correctly placed skeleton UI without visible `Loading…` copy.
Keep an accessible-only `label` for screen readers.

Core owns the theme-aware fill and soft ChatThinking sweep
(`--fynns-duration-thinking-shimmer`). Reduced motion stops the sweep and keeps
the placeholder visible. Do not write consumer shimmer CSS or keyframes.

| Upcoming content | Placement |
| --- | --- |
| Text / document / content body | `LoadingSkeleton` defaults to the large, full-width six-row text skeleton, placed where the text will appear |
| Image / iframe / canvas / similar whole component | Explicit `variant="block"` in that component's footprint |
| Known text layout | Use the default text variant and set `lines` to the expected rows |
| Pane / section / Dialog body | `BusyRegion busy label` with a matching `skeleton` slot; `fill` only for a height-resolved pane |
| Full app | `BusyScrim open label` with the upcoming layout in `skeleton` |
| Real percentage | `value` in `[0, 1]` or `LinearProgress value`; no fabricated progress |
| Existing action during a content wait | Keep its label / glyph; set `disabled` and `aria-busy`, with the content skeleton owning the wait |
| Chat reasoning / tool activity | Existing ChatThinking / ChatActivity lifecycle |

`LoadingSkeleton` supports `variant="block" | "text"`, `fill`, `lines`, text
`size` and an accessible `label`. The default is the **large six-row text
skeleton** from the sandbox: it spans the content column, with repeating
58% / 82% / 100% row widths. `BusyRegion` and `BusyScrim` use this same default.
Keep this large text pattern; only the smaller busy emblems were removed.
The block variant is for whole media / embedded components, not the default
for a text body. Consumers place either shape at its upcoming content position
using their existing layout and `--fynns-*` tokens.
`variant="compact"` has been removed. Never put a skeleton inside an existing
button as a busy mark; the button already exists and is not about to render.

```tsx
import { BusyRegion, LoadingSkeleton } from "@fynns/ui";

<BusyRegion
  busy={loading}
  label="Loading preview" // accessible only; not visible loading copy
  skeleton={<LoadingSkeleton variant="block" fill aria-hidden />}
>
  {preview}
</BusyRegion>
```

The skeleton slot is decorative, contains no interactive controls, and occupies
the content region. Loaded children remain mounted, hidden and inert during
the wait, preserving local state and the region's geometry. Clearing busy
reveals them at the same bounds. No centered 20rem skeleton stack, visible
loading message or frosted mask accompanies a content skeleton. A cold-start
without children uses the large text skeleton; provide matching layout when its shape
is known. `fill` preserves the existing FillColumn / PageScroll height chain.
Do not overlay a new region skeleton on top of an existing nested placeholder.

## Permanently archived loading rings

**Permanent archive / deprecated, strongly discouraged in consumers:**
`CircularProgress`, internal Spinner, Button / IconButton /
NavigationDrawerAction `loading`, and busy hosts' message + ring presentation.
Keep these for old callers; do not evolve them into new loading conventions.

An explicit visible `message` with no skeleton slot, or `indicator="circular"`,
restores the archived **ring + text** presentation. The ring is a compatibility
fallback, not a recommended alternative to a content skeleton. A supplied
`skeleton` suppresses message copy in skeleton mode. A supplied real `value`
uses one linear bar; without a message its label remains accessible-only.
New consumers omit loading copy and circular indicators, and place skeletons
where content will appear. Delete all previous compact skeleton call sites.

Loading ends on success, failure, cancellation and timeout. Preserve task
helpers, timeoutMs, AbortSignal, errors + Retry, and completed zero-result
EmptyState. Prefer sectional waits; full-app blocking remains exceptional.

Live sandbox: `#sandbox-loading-skeleton-text` retains the large default text
example. `#sandbox-loading-skeleton` also demonstrates an explicit media block
(Show busy / Clear busy replaces a preview at the same bounds), alongside
`#busy-region` and `#busy-scrim`. The closed
`#sandbox-archived-loading-ring` example documents compatibility only.
