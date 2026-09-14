# Design philosophy & UX principles

← back to [Design system index](../DESIGN_SYSTEM.md)

This is the **single source of truth** for *how* UI is built across every repo
that consumes `@fynns/ui` (agents-hub, visualizer, corrector, music studio,
thesis preview, …). Distilled so look **and** behavior stay identical. Consumer
repos must follow these and link here; only genuinely app-specific deviations
belong in a consumer’s own doc.

1. **One system, no native or third-party equivalents.** Build every control
   from `@fynns/ui`; reach for an existing primitive before writing a new one.
   No `@radix-ui/*`, no `sonner`, no raw `<select>`/`<dialog>`/`alert()` — extend
   the primitives instead. Drift between projects is a bug; converge on the core.
2. **Tokens are the only styling vocabulary.** Color, space, radius, shadow,
   font, z-index, motion — all via `var(--fynns-*)`. Never hardcode hex/rgba or
   magic numbers. Derive translucent/variant shades with `color-mix(in srgb,
   var(--fynns-color-*) N%, transparent)` or `var(--fynns-color-x, <fallback>)`,
   **not** a new hex. Missing value → add a token in `tokens.ts` and run
   `npm run gen:theme`. App/teaching tokens stay namespaced in the app
   (`--afs-*` automata canvas, `--dsa-*` DSA visuals); never add them here.
3. **Icon actions: tooltip when the glyph is not self-evident — never `title=`.**
   Use `<Tooltip content={…}>` (and an `aria-label` on the `IconButton`); the
   HTML `title` attribute is forbidden (browser-default styling breaks the
   system). `IconButton` is a 40dp circular target (`ghost` / `primary` /
   `tonal` / `default` / `elevated` / `danger` — same variants as `Button`).
   **Skip Tooltip** on chrome dismiss/clear whose glyph already means the action
   (Dialog / FullscreenDialog / Drawer / BottomSheet close X, Banner / Snackbar
   dismiss, Chip input remove, SearchBar clear) — keep `aria-label` only.
   Pure informational help uses **`InfoHint`**: standalone icon when there is no
   visible name (`cursor: help` — **same 40dp circular target and 16dp glyph as
   `IconButton` `ghost` `md`**); dense rows may use `size="sm"`. **`tone="danger"`**
   tints the info glyph for Fail / error detail beside short `OK`/`Fail` probe
   rows. For form/inspector rows pass `label` (plain text trigger, `cursor: help`,
   no underline / trailing icon). Not an action `IconButton`.
   **Field header actions:** M3 in-field icons (reveal password, refresh list,
   clear) belong in `Input` **`trailing`** — always **`IconButton` `size="sm"`**
   (32dp in the 40dp shell; core ≥ **0.5.131** caps affix disks even when `size`
   is omitted). Core ≥ **0.5.237** also tightens that shell edge to
   `--fynns-layout-capsule-chrome-pad-inline` (**4dp**) when an affix owns it —
   same flush as SearchBar / NumberInput steppers; **DON'T** leave the eye on
   full text `capsule + field-pad` (**16dp**), invent consumer end-pad / negative
   margin on `.fynns-field-shell` / `.fynns-field-affix`, or clone reveal **outside**
   `Input` `trailing`. Live `#password` / `#input`. **Select + chevron** already ships a dropdown
   indicator — do **not** stack refresh on `Select.trailing`. Use **`FieldBlock` +
   `.fynns-control-cluster--end-align`**: Select with
   `className="fynns-control-cluster__grow"` + trailing `IconButton` sibling —
   live `#field-header` / `#form-recipe`. **Label-row actions** (expand / reset
   next to a Textarea label): **`FieldHeader`** / **`FieldBlock`**. Label text
   is flush with the control’s outer start edge. Label→control gap is
   `--fynns-layout-field-label-control-gap` on `.fynns-field-block__main`.
   Label-row headers use `--fynns-layout-field-header-action-row-min-height`
   (32dp); inside a `FieldStack`, if **any** sibling has those actions, **every**
   header in that stack shares the band. Card / Collapsible `chrome="card"` body
   keeps full `--fynns-layout-content-inset` (18dp) even when FieldStack is the
   first child. **Breadcrumb** path links stay undecorated (real `Button` `ghost`
   `sm`). Tooltips also describe *dynamic* state (e.g. why a control is disabled).
   **Positioning conventions** (tooltip must not cover its trigger or adjacent
   related content):
   - Icon buttons → default `side="top" align="center"`.
   - Full-width sidebar rows → `side="right"`.
   - Inline truncated text in main content → `side="top" align="start"`; never
     `side="right"`.
   - Chat citation chips → `side="bottom" align="start"`.
   - Never pair `align="center"` with `side="top/bottom"` on a full-width anchor.
4. **Scrollbar discipline.** Every scroll container (`overflow:auto/scroll`)
   carries the `fynns-scroll` class. Browser-default scrollbars are the most
   common source of visual drift — never ship them. **Native classic bars on
   `.fynns-scroll` are hidden** so they never steal content width. Overlay thumbs
   are painted by `src/theme/overlayScrollbar.ts` (fixed portal rails at
   `--fynns-z-scroll-overlay` — above `--fynns-z-modal`, **below**
   `--fynns-z-modal-flyout` so **page** rails never sit on Select / DropdownMenu
   ≥ **0.5.249**; was wrongly `--fynns-z-toast`). **Flyout scroll hosts**
   (`.fynns-menu` / `.fynns-select-list`) use a **second** portal at
   `--fynns-z-scroll-overlay-flyout` (above modal-flyout, below toast) so the
   panel’s own thumb stays visible while scrolling (≥ **0.5.251**). Portal
   `pointer-events: none`,
   rails re-enable so thumbs can be dragged / track-clicked. **One portal per
   tier only**
   (≥ **0.5.200** — Vite HMR / dual import must not stack a second
   page `.fynns-scroll-overlay-portal` or PageScroll shows twin Y thumbs). **Modal
   Dialog open:** suppress overlay rails for scroll hosts **outside** the open
   modal layer (≥ **0.5.33**) — otherwise PageScroll rails behind Dialog paint a
   phantom idle thumb. **Modal `.fynns-dialog-body`:** suppress thumb until panel
   enter settles (≥ **0.5.34**, mount + `transitionend` ≥ **0.5.35**); on fine
   pointer reveal on **host hover only** — not `:focus-within` from the focus
   trap. **Nested scroll in Drawer / FullscreenDialog:** Y rails clamp below
   overlay chrome heads (TopAppBar, dialog head, Card / Collapsible heads, nav
   headlines ≥ **0.5.134**) — live `#drawer-nested-scroll` /
   `#sandbox-scroll-menu-stack`. Fine pointer + hover:
   idle-transparent thumbs with soft fade; touch / coarse keeps thumbs tinted.
   **Wheel → horizontal (≥ 0.5.184 / trap at edge ≥ **0.5.186**):**
   `.fynns-scroll` hosts with horizontal overflow map a dominant vertical wheel
   to `scrollLeft` when the host can no longer scroll on Y (wide
   `.fynns-table-wrap` pans columns instead of driving PageScroll). Default
   **on**; opt out `data-fynns-wheel-x="off"`. While H overflows, vertical wheel
   stays on that host even at the left/right edge (no PageScroll chaining mid
   hover — avoids thumb jump when sliding back). Live `#table`. **Scroll-edge
   fade (≥ 0.5.135; PageScroll ≥ **0.5.247**):**
   capped CodeBlock / Textarea / NavigationDrawer body / **`PageScroll`**
   soft-mask top+bottom when content overflows mid-scroll
   (`data-fade-top` / `data-fade-bottom`, length
   `--fynns-layout-scroll-edge-fade-length`) — **built into `PageScroll`
   (≥ **0.5.247**); zero consumer props / private mask CSS**. Not a hard clip
   into TopAppBar / canvas floor. Do **not** invent consumer `mask-image` on
   `.fynns-page-scroll`, and do **not** replace destination catalogs with a bare
   `overflow:auto` host that hard-clips. Textarea / input hosts hide the native
   bar only (no overlay rail). Do **not** use `scrollbar-gutter: stable` /
   `both-edges`. NavigationDrawer keeps `--fynns-navdrawer-pad-inline` (10dp)
   only. Vertical scroll hosts must pin `overflow-x: clip` (not bare
   `overflow: auto`). Live `#page-scroll` (scroll mid-pane → both edges fade).
5. **Always show loading / empty / error state.** Prefer `LinearProgress` /
   `CircularProgress` (inline / determinate), `BusyScrim` (fullscreen blocking) /
   `BusyRegion` (sectional **soft frosted blur** + tokenized gray mask
   `--fynns-color-busy-region-mask` + **one** progress chrome + message —
   never `--fynns-color-overlay` / BusyScrim; never a consumer `surface-*`
   wash; keep blur radius light so busy does not read as a glitchy frame;
   **empty cold-start** (no children) drops the wash so BusyStack is not a
   floating surface island on bare `app-bg` — ≥ **0.5.191**; **pane
   cold-start uses `fill`**, never `EmptyState` + a
   ring, never a ring stacked on a bar), `EmptyState` (**zero-result catalogs
   only**), `Banner` / `InlineAlert` / `BadgedBox`, and imperative `snackbar`
   (+ root `<SnackbarHost />`). Do **not** use deleted Toast APIs or the removed
   pill `Badge` (see `llm/BREAKING_PURGE.md`). Color status as `danger` /
   `warning` / `info` / `success`.
6. **Accessibility is on by default.** `aria-label` on every icon-only control,
   `aria-busy` on regions that are loading, `aria-hidden` on decorative SVG,
   `.fynns-sr-only` for screen-reader-only text, a visible `:focus-visible` cue —
   soft ring (`--fynns-focus-ring-width` + `--fynns-color-focus` / `accent-ring`),
   quiet border tint (`--fynns-focus-border-mix` into `--fynns-color-border` for
   fields / SearchBar / Select / Autocomplete / editable CodeBlock / Carousel /
   TimePicker / Collapsible), or a state-layer wash on destination rows, plus
   keyboard affordances (Esc closes overlays, arrow-key paging, Ctrl+Enter, etc.).
7. **Motion is tokenized and reduced-motion-safe.** Durations/eases come from
   motion tokens (`--fynns-duration-*`, `--fynns-ease-*`); `theme.css` already
   honors `prefers-reduced-motion`. No hand-tuned ms or easing curves. Flyouts
   and centered dialogs animate enter/exit via `data-state` on the shared
   `DialogFrame` presence lifecycle.
8. **Elevation = brightness in dark mode.** Surfaces climb a ladder: `app-bg` →
   `surface-1` (panels) → `surface-2` (flyouts) → `surface-3` (tooltips/toasts) →
   `surface-4` / `surface-5` (dragged / reserved). Higher surfaces are brighter,
   not darker.
9. **Layout patterns.** Destination apps: prefer **`DestinationAppShell`**
   (declarative destinations + TopAppBar + labeled drawer + optional `EndAside`;
   internally `ClippedNavShell` — destination column **width-morphs** like
   EndAside; toggle = open↔closed). Overlays via `Dialog` / `ConfirmDialog` /
   `Drawer` / `FullscreenDialog` / `BottomSheet` / `NavigationDrawer`. Blocking /
   sectional busy: `BusyScrim` (full-viewport non-dismissible) or `BusyRegion`
   (relative soft frosted blur + `--fynns-color-busy-region-mask` when
   children are mounted — empty cold-start ≥ **0.5.191** = chrome only, no
   mask island; content `inert` while busy; never consumer `surface-*` wash
   or BusyScrim overlay; full-viewport tint → `BusyScrim`). Heavy boots use **`runBusyTask` /
   `useBusyTask`** (show busy → paint → then work). Do not revive
   `BlockingLoadingOverlay` or purged `Panel` / `PanelCard`.
   **Nested containment** (host → section → field): any `surface-1`+ host may
   group fields with `Card` (static head: `title` / optional `icon` / `actions` +
   always-visible body). Prefer **`Surface`** for a bordered / tonal well with
   **no** title/actions head. Prefer `FieldBlock` for label-row IconButtons.
   Card / Collapsible default `chrome="card"`: pad `--fynns-layout-content-inset`
   (18dp, ≥ **0.5.114**). Nesting a **surface-owning child** (CodeBlock, Surface,
   canvas, BusyRegion, …) → **`chrome="plain"`**: body pad = `content-inset`;
   column gap = `nest-gap`. Nested CodeBlock with **no filename** →
   `variant="plain"` (titled `default` **throws** without non-empty `label`).
   **`chrome="plain"` ≠ flush** — never cancel nest-gap with negative margins or
   zero body pad. Outside Card/Collapsible use **`.fynns-nest`**. Simple forms may
   put fields directly on the host. Avoid semantic-free card-in-card. Live:
   sandbox Containment Card / Collapsible `chrome="plain"`. `Input` / `Textarea`
   fill parent width by default. Progressive disclosure + safety-first
   interactivity (disable unsafe destructive actions and say why in a Tooltip).
10. **Language.** Design-system docs, default primitive labels, and source
    comments stay **English or German**. Consumer apps (and the aesthetic
    sandbox) may offer an **English ↔ Chinese** UI locale switch; Chinese is
    allowed when the active locale is `zh`. Do not bake CJK into `@fynns/ui`
    default labels — pass localized strings from the app.
    **Chrome locale switch (hard):** binary en↔zh lives in the **Settings** body
    (footer gear → software prefs) as compact **`ToggleGroup`**
    (`showCheck={false}`, labels `English` / `中文`) inside a `FieldBlock` —
    live sandbox `LanguageSwitcher` on Layouts `#layouts-demo-shell`. **Never**
    put language in TopAppBar `trailing`. Longer locale lists may still use Select
    **inside Settings**.
    **UI punctuation (hard — visible chrome only):** strongly **do not** use
    middle-dot **`·`** or em-dash **`—`** (or decorative en-dash **`–`** as a
    field joiner) in **any** visible product chrome — including Card /
    Collapsible **`title`**, FieldBlock / ControlRow labels, List headlines /
    `supportingText`, destination names, Menu triggers, and status cells.
    **Natural-language titles (hard):** a title/label is a **short section
    name a person would say** (`System prompt`, `Messages`, `Tools`) — never a
    telegraphic glue of name + count / chars / tokens / path
    (`系统提示 · 14,279 字`, `消息 · 2`, `Name · N`). Prefer **layout** to
    separate unrelated meta (counts / branch / token estimates → Card body
    `.fynns-table-meta` or List slots; org in `supportingText`, dates in
    `trailingSupportingText`). Date ranges use ASCII hyphen with spaces
    (`2025-10 - 2026-03`) or locale words; empty trail marks use ASCII **`-`**.
    Counts / badges stay on `badge` / body meta. Docs / comments may still use
    English em dashes. Live: sandbox `#card` meta-in-body + `#list` org+dates.
    **Sandbox / core demos must stay product-agnostic:** never paste consumer
    app copy into Globals, Preview, Layout templates, or primitive defaults —
    invent generic placeholders (see Hard rules /
    [`.cursor/rules/no-consumer-content.mdc`](../../.cursor/rules/no-consumer-content.mdc)).
11. **Performance discipline.** Dense inspectors, live token drafts, catalog
    pages, and `ClippedNavShell` crowding checks must not thrash the main thread
    (observer↔probe loops, tip forests, per-tick history). Authoritative rules:
    [`llm/PERF.md`](../../llm/PERF.md). Agents building playgrounds / shells / token
    GUIs **must** read that file before coding.
