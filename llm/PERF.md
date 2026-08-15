# Frontend performance (sandbox + consumers)

**Authoritative** rules so agents avoid the jank patterns found in the
aesthetic sandbox / `ClippedNavShell` work. Design language stays in
[`AGENTS.md`](../AGENTS.md). Install stays in [`CONSUME.md`](CONSUME.md).

When a task touches **any** of: `ClippedNavShell` / `EndAside`, property or
token inspectors, Globals-style catalogs, live token drafts, dense
`InfoHint`/`Tooltip` rows, or continuous gestures (hue / sliders) — **read this
file before coding**.

## Hard rules

1. **Never insert/remove measure probes under an observed tree.**  
   If a `MutationObserver` or `ResizeObserver` watches a host (esp.
   `ClippedNavShell` root with `subtree: true`), do **not**
   `appendChild`/`remove` temporary nodes on that host to resolve `rem` /
   `clamp()`. That creates a probe → mutation → check → probe loop and makes
   **every hover** feel sticky. Resolve `px` / `rem` / `%` / `clamp()` in JS, or
   measure under `document.body` with an explicit containing width. Core
   `readVarPx` / `readRemPx` already follow this — **do not reintroduce** the
   old probe-on-host pattern in apps.

2. **Closed disclosure must not keep heavy bodies mounted** in catalogs /
   inspectors.  
   Product `Collapsible` keeps children mounted for height animation — fine for
   small sections. Sandbox inspectors and huge demos must **unmount** when
   closed (`LazyCollapsible`, or `children: () => …` only invoked when `open`).
   Do **not** ship `defaultOpen` on every dense inspector block after a hard
   refresh.

3. **`InfoHint` is a `Tooltip`.**  
   Dense slider / token rows: prefer plain labels; reserve `InfoHint` for real
   help. Dozens of tip triggers on one aside dominate pointer intent and make
   hover feel delayed (show-delay + warm skip).

4. **Split draft / theme subscriptions.**  
   Shell chrome: undo/redo only (no full override map). Action bars that only
   call `apply`: mutators context. Continuous gestures: paint via
   `document.documentElement.style.setProperty` (or equivalent), **commit**
   draft on pointerup / short debounce. Coalesce history for the same key
   within a gesture window — never one undo step per slider tick.

5. **Isolate high-frequency React state.**  
   Streaming text, caret ticks, 16–60 Hz UI must live in a leaf component.
   Parent pages with dozens of `useState` must not re-render on every tick.
   Catalog sections: pass render props so closed categories do not even
   *create* the demo element tree.

6. **Cheap paint for state layers.**  
   Prefer opacity (or transform) transitions. Do **not** transition
   `box-shadow` or interpolated `color-mix(…)` backgrounds on every button /
   chip hover across a dense shell.

7. **Diagnose “everything is laggy” in this order.**  
   (a) Idle childList churn on the shell / observer hosts.  
   (b) Tip trigger + `input[type=range]` counts after hard refresh.  
   (c) Who subscribes to the live token draft.  
   (d) Infinite CSS / `setInterval` only after confirming the section is
   actually mounted.

## DoD (hard refresh)

- Tip triggers on the default playground route: roughly shell chrome only
  (order of ~10–15), not dozens from an open inspector.
- With inspector sections collapsed: no range inputs from those sections.
- Wide viewport + `navMode="drawer"`: no per-frame probe DOM churn on the
  shell root.
- Dragging a token slider does not append unbounded history entries for the
  same key.

## Core gate

```bash
npm run check:perf-sandbox
```

Fails the sandbox when inspector `defaultOpen` / probe-on-host regressions
return. Consumers: follow the rules above; bump the submodule pin when core
fixes ship.

## Related

- Sandbox helpers: `examples/sandbox/src/components/LazyCollapsible.tsx`,
  `examples/sandbox/src/state/TokenDraftProvider.tsx`,
  `examples/sandbox/src/manipulators/HueWheel.tsx`
- Shell: `src/primitives/layoutMeasure.ts` (`resolveLengthPx` — no host probes; used by `ClippedNavShell` / `EndAside`)
