# Loading skeleton convention

← back to [Design system index](../DESIGN_SYSTEM.md)

Unknown-duration loading uses **sweep skeletons** from `@fynns/ui`. Do not
introduce spinning circles, pulsing dots, local skeleton CSS or keyframes.
Core owns rounded bars, quiet theme-aware fills and the soft accent sweep
shared with ChatThinking (`--fynns-duration-thinking-shimmer`). Reduced motion
keeps the placeholders visible and stops the sweep.

| Scene | Use |
| --- | --- |
| Pane / section / Dialog body | `BusyRegion busy label`; add `fill` only with a height-resolved pane |
| Full-app blocking task | `BusyScrim open label` |
| Text / list placeholder | `LoadingSkeleton lines={3}` (1–12 rows) |
| Preview placeholder | `LoadingSkeleton variant="block"` |
| Single action | Existing `Button` / `IconButton` / `NavigationDrawerAction` `loading`; core renders a compact skeleton |
| Real percentage / count | `BusyRegion` / `BusyScrim` with `value` in `[0, 1]`, or `LinearProgress value` |
| Chat reasoning / tool activity | Keep `ChatThinking` / `ChatActivity` and their existing streaming policy |

`LoadingSkeleton` supports `variant="text" | "block" | "compact"`,
`size="sm" | "md" | "lg"`, `lines` and an accessible `label` (default
`Loading`). It exposes a single status; its bars are decorative. Use
`aria-hidden` when composing inside a busy host, which owns the announcement.
Match the expected content footprint using rows or a block; use existing
layout primitives for composition, rather than styling `.fynns-*` locally.

```tsx
import { BusyRegion, LoadingSkeleton } from "@fynns/ui";

<BusyRegion
  busy={loading}
  label="Loading catalog"
  skeleton={<LoadingSkeleton lines={6} aria-hidden />}
>
  {catalog}
</BusyRegion>
```

The optional `skeleton` slot is decorative content, not interactive UI.
Omitting it gives the canonical three-row skeleton. `message` remains visible
phrasing only; never put another loading indicator in it. Supplying `value`
replaces the skeleton with **one** linear progress bar; the skeleton slot is
ignored. Do not fabricate a percentage for an unknown wait.

Compatibility: `indicator="circular"` and `indicator="linear"` remain accepted
on busy hosts. All indicator values follow the new rule: omitted `value` →
skeleton; supplied `value` → linear progress. Consumers should omit redundant
`indicator` props. `CircularProgress` remains exported for compatibility but
is no longer the loading convention. Internal Spinner DOM hooks are retained
for existing callers; their appearance is now a compact rectangular skeleton.
Do not import internal Spinner or revive purged PanelSkeleton / LoadingIndicator.

Keep loaded content mounted and inert under BusyRegion while refreshing.
Cold-start with no content has no frosted mask island. Preserve the existing
FillColumn / PageScroll height chain for `fill`; preserve search and pager
placement. One wait has one loading surface: when BusyRegion is active, its
header / footer actions are `disabled` without `loading`.

Loading must end on success, failure, cancellation and timeout. Preserve
`runBusyTask` / `useBusyTask`, `runLoadingTask` / `useLoadingTask`, `timeoutMs`
and `AbortSignal`. Errors clear busy and show InlineAlert + Retry or the
existing transient snackbar; EmptyState is only a completed zero-result state.

Live sandbox: `#busy-region` / `#sandbox-loading-skeleton`, `#busy-scrim`,
`#sandbox-iconbutton-primary-loading`, `#sandbox-pane-load-error`.
