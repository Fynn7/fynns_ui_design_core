# AGENTS.md — @fynns/ui-design-core

Authoritative guide for humans and AI agents working with the fynns UI design
system. This is the **single source of truth** for the design language; other
repos should link here, not duplicate it.

## What this is

A dark-teal design system: canonical `--fynns-*` CSS tokens + self-developed,
dependency-free React primitives. Consumed as source via the `@fynns/ui` alias
into **`@fynn7/ui-design-core`** (GitHub Packages).

**Installing into a consumer repo (npm + Vite alias):** follow
[`llm/CONSUME.md`](llm/CONSUME.md) and run
`npm run consume:install -- --target <consumer-root>`
(`scripts/install-as-npm.mjs`). Machine contract: [`llm/consume.json`](llm/consume.json).
Add `@fynn7/ui-design-core` to the consumer’s `package.json` dependencies
(registry: `https://npm.pkg.github.com`). Do **not** use a git submodule for
day-to-day consume. Publish / bumps:
[`docs/package-propagation.md`](docs/package-propagation.md).
**Public API purge / migration:** [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
**Short prompts:** still start from `llm/CONSUME.md` (OpenCode rule template:
[`llm/opencode-fynns-ui-consume.md`](llm/opencode-fynns-ui-consume.md)) — do not expect a long task brief.

## Design philosophy & UX principles

This is the **single source of truth** for *how* UI is built across every repo
that consumes `@fynns/ui` (agents-hub, awesome_afs_visualizer, fynns_corrector,
fynns_cursor_db_dashboard, fynns_music_studio, the thesis `gsc-live-preview`,
…). Distilled from those projects so the look **and the behavior** stay
identical. Consumer repos must follow these and link here instead of restating
them; only genuinely app-specific deviations belong in a consumer's own doc.

1. **One system, no native or third-party equivalents.** Build every control
   from `@fynns/ui`; reach for an existing primitive before writing a new one.
   No `@radix-ui/*`, no `sonner`, no raw `<select>`/`<dialog>`/`alert()` — extend
   the primitives instead. Drift between projects is a bug; converge on the core.
2. **Tokens are the only styling vocabulary.** Color, space, radius, shadow,
   font, z-index, motion — all via `var(--fynns-*)`. Never hardcode hex/rgba or
   magic numbers. Derive translucent/variant shades with `color-mix(in srgb,
   var(--fynns-color-*) N%, transparent)` or `var(--fynns-color-x, <fallback
   token>)`, **not** a new hex. Missing value → add a token in `tokens.ts` and run
   `npm run gen:theme`. App/teaching tokens stay namespaced in the app (`--afs-*`
   automata canvas, `--dsa-*` DSA visuals); never add them to this core.
3. **Icon actions: tooltip when the glyph is not self-evident — never `title=`.**
   Use `<Tooltip content={…}>` (and an `aria-label` on the `IconButton`); the HTML
   `title` attribute is forbidden (browser-default styling breaks the system).
   `IconButton` is a 40dp circular target (`ghost` / `primary` / `tonal` /
   `default` / `elevated` / `danger` — same variants as `Button`).
   **Skip Tooltip** on chrome dismiss/clear whose glyph already means the action
   (Dialog / FullscreenDialog / Drawer / BottomSheet close X, Banner / Snackbar
   dismiss, Chip input remove, SearchBar clear) — keep `aria-label` only.
   Pure informational help uses **`InfoHint`**: standalone icon when there is no
   visible name (`cursor: help` — **same 40dp circular target and 16dp glyph as
   `IconButton` `ghost` `md`**, not a separate 14px muted dot); dense rows may
   use `size="sm"`. **`tone="danger"`** tints the info glyph for Fail / error
   detail beside short `OK`/`Fail` probe rows (OK rows stay default). For
   form/inspector rows pass `label` (plain text trigger,
   `cursor: help`, no underline / trailing icon). Not an action `IconButton`.
   **Field header actions:** **M3 in-field icons** (reveal password, refresh
   list, clear) belong in `Input` **`trailing`** inside the field shell. **Select
   + chevron** also ships a dropdown indicator — do **not** stack refresh / list
   reload on `Select.trailing` (icons fight for one slot). Use **`FieldBlock` +
   `.fynns-control-cluster--end-align`**: Select with
   `className="fynns-control-cluster__grow"` + trailing `IconButton` as a
   sibling — live `#field-header` / `#form-recipe`. **Label-row
   actions** (e.g. expand / reset next to a Textarea label): use
   **`FieldHeader`** / **`FieldBlock`** (label row + trailing `IconButton`s +
   `Tooltip` above the control — not overlaid on the textarea corner). Label
   text is flush with the control’s outer start edge. Label→control gap is
   `--fynns-layout-field-hint-gap` on `.fynns-field-block__main`. Label-row
   headers use `--fynns-layout-field-header-action-row-min-height` (32dp); inside
   a `FieldStack`, if **any** sibling has those actions, **every** header in
   that stack shares the band so plain labels align. Trailing
   actions stay on the label line (`IconButton` sm). Default `ghost`; dense
   forms may use `size="sm"`. Card / Collapsible
   `chrome="card"` body keeps full `--fynns-layout-content-pad-block` (16dp)
   even when `FieldStack` / `FieldBlock` / `FieldHeader` is the first child
   (do not crush to `space-xs` under the head hairline). Inline stays
   `content-inset`. Do not reinvent this with sandbox-only CSS.
   **Text underlines:** chrome path links (`Breadcrumb`) stay undecorated —
   ancestors are real `Button` `ghost` `sm` (stadium + state-layer). Tooltips also describe *dynamic* state (e.g. why a control is
   disabled).
   **Positioning conventions** (per NN/g, Material 3, Carbon — a tooltip must not
   cover its trigger or the adjacent related content; the caret links the bubble
   to the anchor so it need not touch the text):
   - Icon buttons → default `side="top" align="center"`.
   - Full-width sidebar rows (list items, group headers) → `side="right"` so the
     bubble sits beside the row and never covers the rows above/below.
   - Inline truncated text in main content (table cells, detail fields) → default
     `side="top" align="start"`; never `side="right"` (it would cover the content
     to the right).
   - Chat citation chips under a message body → `side="bottom" align="start"`
     so the preview does not cover the turn text above (flip still moves to
     `top` near the viewport bottom). Prefer this over the Tooltip default.
   - Never pair `align="center"` with `side="top/bottom"` on a full-width anchor.
4. **Scrollbar discipline.** Every scroll container (`overflow:auto/scroll`)
   carries the `fynns-scroll` class. Browser-default scrollbars are the most
   common source of visual drift — never ship them. **Native classic bars on
   `.fynns-scroll` are hidden** so they never steal content width (NavigationDrawer
   badges / chevrons, Dialog Switch tracks, Chat actions, …). Overlay thumbs are
   painted by `src/theme/overlayScrollbar.ts` (fixed portal rails at
   `--fynns-z-toast` so Dialog / Drawer / Sheet hosts stay above `--fynns-z-modal`;
   portal `pointer-events: none`, rails re-enable so thumbs can be **dragged** /
   track-clicked; no layout / scrollWidth impact). **Modal Dialog open:** suppress
   overlay rails for scroll hosts **outside** the open modal layer (≥ **0.5.33**) —
   otherwise PageScroll / shell rails behind Dialog paint a idle thumb at
   `scrollTop=0` while the dialog body scrolls (phantom jump). **Modal
   `.fynns-dialog-body`:** suppress thumb until panel enter transition settles
   (≥ **0.5.34**, mount + `transitionend` ≥ **0.5.35**); on fine pointer reveal on **host hover only** — not
   `:focus-within` from the focus trap. On fine pointer + hover
   (`(hover: hover) and (pointer: fine)`), overlay thumbs are **idle-transparent**
   and reveal on host `:hover` or `:focus-within` with a soft fade
   (`--fynns-duration-scrollbar` + `--fynns-ease-out`). Touch / coarse
   pointer keeps thumbs tinted when overflowing. Textarea / input hosts hide the
   native bar only (no overlay rail — replaced elements cannot host children).
   Do **not** use `scrollbar-gutter: stable` / `both-edges` (would reserve a permanent
   empty track or inflate pad). NavigationDrawer keeps `--fynns-navdrawer-pad-inline`
   (10dp) only — no pad+scrollbar inflation; do not crush below ~8dp. Carousel tracks
   and SearchBar / single-line `Input` focused fields may hide bars entirely
   (caret scroll; SearchBar uses caret scroll on narrow hosts — not scroll-snap).
   Vertical scroll hosts must pin `overflow-x: clip` (not bare
   `overflow: auto`): CSS overflow pairing otherwise promotes x→auto and can
   reserve *block* gutters that clip the first/last pill radii.
5.    **Always show loading / empty / error state.** Prefer `LinearProgress` /
   `CircularProgress` (inline / determinate widgets), `BusyScrim` (fullscreen
   blocking) / `BusyRegion` (sectional **transparent** overlay + **one**
   progress chrome + message — host / pane background shows through; never a
   second `surface-*` wash; **pane cold-start uses `fill`**, never
   `EmptyState` + a ring, never a ring stacked on a bar), `EmptyState`
   (**zero-result
   catalogs only**), `Banner` / `InlineAlert` /
   `BadgedBox` (notification overlay), and
   imperative `snackbar` (+ root `<SnackbarHost />`) for transient feedback. Do
   **not** use deleted Toast APIs or the removed pill `Badge` (see
   `llm/BREAKING_PURGE.md`). Color status as
   `danger` / `warning` / `info` / `success`.
6. **Accessibility is on by default.** `aria-label` on every icon-only control,
   `aria-busy` on regions that are loading, `aria-hidden` on decorative SVG, an
   `.fynns-sr-only` class for screen-reader-only text, a visible `:focus-visible` cue —
   soft ring (`--fynns-focus-ring-width` + `--fynns-color-focus` / `accent-ring`),
   quiet border tint (`--fynns-focus-border-mix` into `--fynns-color-border` for
   fields / SearchBar / Select / Autocomplete / editable CodeBlock / Carousel /
   TimePicker / Collapsible), or a state-layer wash on destination rows
   (NavigationDrawer items), and keyboard affordances
   (Esc closes overlays, arrow-key paging, Ctrl+Enter to run, etc.).
7. **Motion is tokenized and reduced-motion-safe.** Durations/eases come from the
   motion tokens (`--fynns-duration-*`, `--fynns-ease-*`); `theme.css` already
   honors `prefers-reduced-motion`. No hand-tuned ms or easing curves. Flyouts
   (menu, select, popover, tooltip) and centered dialogs animate enter/exit via
   `data-state` on the shared `DialogFrame` presence lifecycle.
8. **Elevation = brightness in dark mode.** Surfaces climb a ladder:
   `app-bg` → `surface-1` (panels) → `surface-2` (flyouts) → `surface-3`
   (tooltips/toasts) → `surface-4` / `surface-5` (dragged / reserved emphasis).
   Higher surfaces are brighter, not darker.
9. **Layout patterns.** Destination apps: `ClippedNavShell` (full-bleed
   TopAppBar + drawer|rail|hidden; toggle = open↔closed; destination column
   **width-morphs** like `EndAside`) + optional `EndAside`
   inspector; overlays via
   `Dialog` /
   `ConfirmDialog` / `Drawer` / `FullscreenDialog` / `BottomSheet` /
   `NavigationDrawer`; blocking / sectional busy: `BusyScrim` (full-viewport
   non-dismissible scrim + focus trap + `CircularProgress` + message) or
   `BusyRegion` (relative **transparent** overlay over children; content is
   `inert` while busy — no surface tint; full-viewport tint → `BusyScrim`);
   for heavy boots use **`runBusyTask` / `useBusyTask`** (show busy →
   paint → then work) so the ring can start before the main thread blocks;
   do not revive `BlockingLoadingOverlay` or purged `Panel` /
   `PanelCard`;
   **Nested containment** (host → section → field): any `surface-1` (or higher)
   host — page body, Dialog, Drawer, etc. — may group fields with
   `Card` (static head: `title` / optional `icon` / `actions` + always-visible
   body; same shell as Collapsible, no collapse / head hover / chevron). Prefer
   **`Surface`** for a bordered / tonal well with **no** title/actions head
   (preview iframe, chart stage, arbitrary children; default unpadded + optional
   `fill`). Prefer `FieldBlock` for label-row
   IconButtons above the control. Card / Collapsible default `chrome="card"`:
   inline pad `--fynns-layout-content-inset`; body **block** pad
   `--fynns-layout-content-pad-block`. When nesting a **surface-owning child**
   (CodeBlock, Surface, canvas, BusyRegion, …), pass **`chrome="plain"`** —
   Collapsible/Card stays the **main** outer shell; body uses
   **`--fynns-layout-nest-gap`** (four-side pad + column gap) so the child
   insets as a secondary frame.    Nested CodeBlock with **no filename** → `variant="plain"` (titled
   `default` **throws** without a non-empty `label`). **`chrome="plain"` ≠
   flush** — never cancel nest-gap with negative margins, zero body pad, or
   restyle `.fynns-*`.
   Outside Card/Collapsible, wrap nested wells with **`.fynns-nest`** (same
   nest-gap). No title needed → `Surface` alone. Do not add a second
   page-level outer pad. Consumers choose whether the section lives inline or
   inside an overlay. Simple forms may put fields directly on the host (no
   Card). Avoid semantic-free card-in-card (nest Card only when the inner block
   is an independent interactive subject; otherwise outer `chrome="plain"`).
   Live sample: sandbox Globals → Containment → Card / Collapsible
   `chrome="plain"`, Preview → Collapsible / Card chrome toggle.
   `Input` / `Textarea` fill the parent width by default (`width: 100%`).
   **progressive disclosure** (reveal results only once they exist); and
   **safety-first interactivity** — disable/refuse a destructive action while
   it is unsafe and say why in a tooltip (e.g. disabling a rescan while a
   conflicting process holds the file), rather than letting it fail.
10. **Language.** Design-system docs, default primitive labels, and source comments
 stay **English or German**. Consumer apps (and the aesthetic sandbox) may offer
 an **English ↔ Chinese** UI locale switch for their own chrome strings; Chinese
 is allowed when the active locale is `zh`. Do not bake CJK into `@fynns/ui`
 default labels — pass localized strings from the app.
 **Chrome locale switch (hard):** binary en↔zh lives in the **Settings** body
 (footer gear → software prefs) as compact **`ToggleGroup`**
 (`showCheck={false}`, labels `English` / `中文`) inside a `FieldBlock` —
 live sandbox `LanguageSwitcher` on Layouts `#layouts-demo-shell` Settings +
 Templates. **Never** put language in TopAppBar `trailing` (neither
 `ToggleGroup` nor form `Select` / chevron). Longer locale lists may still use
 Select **inside Settings**, not the app bar.
 **UI punctuation (hard — visible chrome only):** strongly **do not** use
 middle-dot **`·`** or em-dash **`—`** (or decorative en-dash **`–`** as a
 field joiner) in labels, `supportingText`, destination names, status cells,
 or other on-screen chrome. Prefer **layout** to separate unrelated meta
 (e.g. org in `supportingText`, dates in `trailingSupportingText` — never
 `Org · 2025-10 – 2026-03`). Date ranges use ASCII hyphen with spaces
 (`2025-10 - 2026-03`) or locale words (`to` / `至`); empty trail marks use
 ASCII **`-`** (not `—`). Counts / badges stay on `badge` / body meta — never
 `Name · N`. Docs / code comments may still use English em dashes.
 **Sandbox / core demos must stay product-agnostic:** never paste consumer app
 copy (feature names, providers, routes, domain jargon) into Globals, Preview,
 Layout templates, or primitive defaults — invent generic placeholders instead
 (see Hard rules).
11. **Performance discipline.** Dense inspectors, live token drafts, catalog
 pages, and `ClippedNavShell` crowding checks must not thrash the main thread
 (observer↔probe loops, tip forests, per-tick history). Authoritative rules:
 [`llm/PERF.md`](llm/PERF.md). Agents building playgrounds / shells / token GUIs
 **must** read that file before coding.

## Hard rules (Do / Don't)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc.
- **DO** group inspector / settings / Dialog form options with **`FieldStack`**
  by **semantic kind** (identity fields together, radio/checkbox choices
  together, preference switches together, …) — not one flat list of FieldBlocks
  / ControlBlocks. Plain FieldBlocks share `field-stack-gap` (12dp);
  label-row **FieldHeader** actions lift the header band to
  `field-header-action-row-min-height` (32dp); inside one **`FieldStack`**, if
  **any** sibling has those actions, **every** header in that stack shares the
  band — label→control stays `field-hint-gap` (8dp); **Input** `trailing` for
  in-field reveal; **Select + row action** → control-cluster band (not
  `Select.trailing`); **repeatable Textarea + remove rows** → same
  `.fynns-control-cluster--end-align` + `__grow` on each Textarea inside
  `FieldStack` (not bare `.fynns-control-cluster` — default wrap parks delete
  under tall autoGrow wells). FieldBlocks with description/error (no choice cluster) open the next
  sibling to `unit-stack-gap` (16dp); FieldBlocks that host a
  `.fynns-control-cluster` open to `form-cluster-gap` (32dp); sibling
  ControlBlocks open to `unit-stack-gap` (16dp). **Strongly recommend** a
  horizontal `Divider` between adjacent FieldStacks on kind jumps. Live tree:
  sandbox `#form-recipe`.
  See **Toolbar / unit rhythm** → **FieldStack semantic clusters**.
- **DON'T** hardcode raw colors / hex / rgba in component or app CSS. If a value
  is missing, add a token in [`src/theme/tokens.ts`](src/theme/tokens.ts) and run
  `npm run gen:theme`.
- **DON'T** dump consecutive form units as bare Card / Dialog siblings when they
  belong in different semantic groups (or leave related FieldBlocks ungrouped).
  Flat stacks lose the tight-within / wide-between rhythm — use `FieldStack`.
  Do not invent muted `<p>` / subtitle classes for control notes (`ControlBlock`
  / `FieldBlock` `description` instead).
- **DON'T** wrap each path / link / bookmark entry in its own padded
  `Surface` or `Card` (tall sparse “fat cards”). Use one `List` of
  `ListItem`s — see **Content density (data → component)**. Row actions belong
  in `ListItem` `trailing` (`ghost` **md** — default size; not `sm` on path catalogs), not under the text and not as a
  filled danger disk.
- **DON'T** paint **List** catalog kind with a start tick, inset rail,
  `::before` bar, inset `box-shadow`, or a second `hostClassName` wash.
  Builtin / readonly = **leading icon** + `trailingSupportingText` /
  `.fynns-table-meta`; selected = host `radius-3xl` pill only. Never wrap
  `ListItem` in a `div` for stripes (`ul > div > li`). Live: `#list`.
- **DON'T** crush List row proportion: leading→copy stays `--fynns-list-gap`
  (**16dp**); two-line stack `--fynns-list-content-gap` (**4dp**); three-line
  (overline + headline + supporting) `--fynns-list-content-gap-3` (**8dp**);
  `--with-end` reveal copy→first action disk stays `--fynns-list-end-actions-gap`
  (**optical** for IconButton overlay ≥ **0.5.62** — text→glyph matches
  glyph↔glyph; IconButton↔IconButton stays `control-cluster-gap` **4dp** —
  not navdrawer pad-inline). Do not override with private gaps or a 40dp empty
  leading column.
- **DON'T** glue duration units in List meta (`1m47s`). Compact duration
  copy uses a **space between units** (`1m 47s`, `2h 5m`) in
  `trailingSupportingText` / overline — same for consumer zh/en strings.
- **DON'T** stack organization + date range in one `supportingText` with a
  middle-dot / `·` or fancy dash (`Acme · 2025-10 – 2026-03`). **Org stays
  under the title** (`supportingText`); **dates → `trailingSupportingText`**
  so layout separates them — never a glued meta blob. Date range copy uses
  ASCII hyphen (`2025-10 - 2026-03`), not `–` / `—`. Mixed-length date catalogs
  → parent **`List` `trailingMetaAlign="start"`**. Live: sandbox `#list`
  org+dates. Same punctuation rule for any chrome field glue — see Language
  **UI punctuation**.
- **DON'T** put middle-dot **`·`** or em-dash **`—`** (or decorative en-dash
  **`–`** as a joiner) in visible UI chrome strings. Prefer layout slots,
  ASCII `-` ranges, locale words, or `badge` — not `Name · N` / prose em
  dashes in labels. Failure mode:
  [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) **org · dates glued** /
  **UI · — punctuation**.
- **DON'T** put `trailingMetaAlign="start"` on catalogs whose short status
  (`Current` / `当前`) must sit next to `--with-end` actions — the 17ch floor
  parks the label far from the IconButton. Leave the prop unset (content-width
  hug). Live: `#list` status+action.
- **DON'T** put **labeled** `Button` / `Select` (or other wide inspector chrome)
  into List `--with-end` **as if** it were path-catalog IconButton overlay —
  that reserve is **1–2×40dp disks** only. Prefer IconButton + Tooltip for
  row actions; when a row genuinely needs Select ± labeled CTA, core ≥
  **0.5.54** **pins** that end cluster **in-flow** (always visible; Select
  content-hug), ≥ **0.5.55** clears host `radius-3xl` clip on the end, and ≥
  ≥ **0.5.56** co-locates gap `trailingSupportingText` in that end strip (before
  CTA|Select) so short status columns do not drift when end widths vary; ≥
  **0.5.67** widens meta|CTA|Select cell gaps to **8dp** (`inspector-end-gap`
  — not 4dp cluster kiss); ≥ **0.5.70** reuses **inline** form Select
  `search-bar--expanded` (same as `#globals-demo-select` — not absolute flyout);
  ≥ **0.5.71** pinned end strip `align-items: flex-start` so gap meta|CTA stay on
  the **trigger band** when expanded (not centered on full panel); host `flex-start`
  only while expanded. Still keep the cluster
  `nowrap` and short labels. Live:
  `#list` inspector trailing. Failure mode:
  [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) **List trailing Select
  + labeled Button overlap**.
- **DON'T** park edit / delete as `TimelineItem` `--with-end` hover
  `IconButton`s (or stack leading kind glyphs + hover chrome as the default
  rail recipe). Chronological catalog edit → flat row `onClick` → **`Dialog`**
  (`size="lg"` + `showCloseButton`); Dialog foot LTR **Cancel → Delete →
  Save** (≥ **0.5.17**; `ConfirmDialog` for destroy — never Delete leftmost
  when Cancel is present). Prefer omit `leading` (default disc). List
  path catalogs still use trailing hover IconButtons — that is **not** the
  Timeline default. Live: `#timeline`. Failure modes:
  [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) **Timeline row hover
  edit/delete icons** / **Dialog foot Delete leftmost of Cancel**.
- **DON'T** nest `InlineAlert` / `Banner` inside `ListItem` headline or
  supporting (panel chrome is `width: 100%` and stacks status above the title).
  Run / job history Success|title|duration → **one** single-line
  `.fynns-control-cluster` with `.fynns-list-item-status` (≥ 0.4.141). Live:
  `#list` run-summary.
- **DON'T** jam latency + tokens / cost into **one** headline
  `.fynns-table-meta` (fixed elapse+icon track hard-clips mid-glyph). **One
  metric per cell** — wrap the label in `<span>` for ellipsis (≥ **0.4.145**);
  second metric → **sibling** `.fynns-table-meta` (tokens track) or
  `.fynns-list-item-trailing-stats`. Live: `#list` run-summary.
- **DON'T** right-align plain List / Timeline `trailingSupportingText` with
  private CSS when you meant a cross-row date / timestamp column — use
  `trailingMetaAlign="start"` instead (core **start**-aligns glyphs inside
  the shared min-width column ≥ **0.5.13** — not 0.4.148 end-ink that
  parks short dates at the column end). Multi-metric grids stay on
  `.fynns-list-item-trailing-stats` (start-aligned cells).
- **DON'T** put **two or more** `Button` / `IconButton` `loading` spinners in
  the same `.fynns-control-cluster` (Card foot Probe + Start, Dialog Copy +
  Import, …). That is **information redundancy** — one ring already means the
  strip is busy. Track which action is in flight (`busy === "probe"`) so only
  that control shows `loading`; siblings stay `disabled` with no spinner.
  Live: `#rhythm` end-align. Failure mode: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)
  **twin Button loading rings**.
- **DON'T** stack **BusyRegion** / **BusyScrim** progress chrome with a
  sibling `Button` / `IconButton` `loading` on the **same wait host**
  (FieldBlock `actions` refresh + body BusyRegion, Card `actions` spinner +
  body BusyRegion, Dialog foot `loading` while body BusyRegion is busy, …).
  Same information-redundancy rule: **one** progress chrome per wait.
  Section / field body wait → **BusyRegion only**; header / foot chrome stays
  `disabled` **without** `loading`. Per-control wait with **no** BusyRegion →
  Button / IconButton `loading` alone. Live: `#busy-region` FieldBlock actions
  sample. Failure mode: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)
  **BusyRegion + chrome loading stack**.
- **DON'T** use a flex `.fynns-control-cluster` for multi-metric List trailing
  meta that must **column-align across sibling rows** (elapse / tokens / cost /
  count). Use `.fynns-list-item-trailing-stats` (fixed grid tracks; `--pair`
  for two metrics). Live: `#list`.
- **DON'T** invent shell / column / chat **insets or gaps** as raw `rem` / `px`
  or a fresh private CSS variable. Reuse an existing `--fynns-layout-*` key
  (or a component token that **aliases** one — e.g.
  `--fynns-chat-thread-pad-inline` → `dialog-inset`). Missing step → add it to
  `LAYOUT_TOKENS`, run `npm run gen:theme`, and expose it in the sandbox Layout
  chrome inspector in the **same** change. Consumers must not redefine
  margins in app CSS — see [`llm/CONSUME.md`](llm/CONSUME.md). Decision tree:
  **Inset decision tree** below.
- **DON'T** ship filter / command / menu / picker **chrome with broken type or
  row proportion** (title two font steps above group captions; description
  `gap: 0` under a 16dp title; icons centered on title+description when the
  reference product is single-line). Authority:
  **Chrome type & row proportion** below (and `.cursor/rules/chrome-proportion.mdc`).
- **DON'T** pad above the first ceiling-flush **bordered well** in
  `FullscreenDialog` (`CodeBlock` / `Surface` / `.fynns-table-wrap` as the
  first body child, or first child of one unpadded fill host). Core already
  flush-starts; do not wrap with extra `padding-top`. See **Flush-start overlay
  body**.
- **DON'T** invent private radius CSS variables outside `--fynns-radius-*`
  (e.g. `--fynns-searchbar-container-radius`, `--fynns-selection-box-radius`,
  `--fynns-<component>-*-radius`). Corner radius **must** use
  `var(--fynns-radius-<key>)` from [`RADIUS_TOKENS`](src/theme/tokens.ts).
  Every key in `RADIUS_TOKENS` **must** appear in the sandbox Components shape
  inspector (editable slider or explicit read-only row). If a new radius step is
  required, add it to `RADIUS_TOKENS` **and** to
  [`GlobalsInspector`](examples/sandbox/src/pages/GlobalsInspector.tsx) in the
  same change — never ship a radius token that the GUI cannot show.
- **DON'T** park nodded aesthetics only in
  `SANDBOX_DEFAULT_OVERRIDES` (`examples/sandbox/src/state/baseline.ts`). That
  map must stay **empty** — promote into `tokens.ts` + `npm run gen:theme` so
  consumers match sandbox (`npm run check:wysiwyg`).
- **DON'T** ship a Chat-family **container** squarer than the user bubble
  (`--fynns-radius-22` / ChatGPT `rounded-[22px]`). Floor applies to
  `ChatMessage` bubble, citation footnote cards, composer shell, and any new
  Chat* chrome panel — use `radius-22` **or rounder** (`3xl`, `pill`).
  Micro marks stay smaller (`inline code` → `xs`, favicon → `2xs`). Override
  only when the user **explicitly** asks for a squarer Chat container.
- **DON'T** “fix” missing ChatMessage body spacing in the consumer with
  local CSS or one-off wrappers as the **source of truth**. Sibling answer
  units (prose + `CodeBlock`, two wells, …) must get
  `--fynns-chatmessage-body-stack-gap` (**16dp**) from core — bare strings
  are promoted to `.fynns-chat-message-prose` inside `ChatMessage`. Prefer
  element children for markdown; never invent a parallel body-gap token in
  the app. See **Body sibling stack**.
- **DON'T** reintroduce measure probes under `ClippedNavShell` (or any host
  watched by a subtree `MutationObserver`) to resolve CSS lengths — see
  [`llm/PERF.md`](llm/PERF.md).
- **DON'T** default-open dense sandbox inspectors full of `InfoHint`/`Slider`
  after hard refresh; unmount closed catalog/inspector bodies (lazy /
  render-prop). Details: [`llm/PERF.md`](llm/PERF.md).
- **DON'T** reintroduce `@radix-ui/*` or `sonner`. Extend the self-developed
  primitives instead. Do not resurrect purged Toast / Popover / Panel APIs
  (see [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md)).
- **DON'T** drop a sandbox Globals/catalog demo while the symbol stays exported
  from `src/index.ts` (or the reverse: export without demo). Public surface is
  **one allowlist** — sandbox ↔ barrel. Deleting a public component is
  **atomic** in one change: unexport + delete TSX/CSS + remove demo/catalog/i18n
  + update keep-set docs + add a Removed row in `llm/BREAKING_PURGE.md`.
  `npm run check:wysiwyg` enforces export⇒demo, purge∩barrel=∅, and forbids
  companion-parking `src/primitives/<Name>.tsx` components. Half-deletes that
  only edit sandbox historically caused CI to *restore* demos — never do that.
- **DON'T** paste **consumer product content** into this core (sandbox Globals /
 Preview / Layout demos, default labels, i18n samples, docs screenshots used as
 specs). Forbidden: consumer feature names, LLM/provider settings, app routes,
 teaching-domain jargon from a specific consumer, or wholesale “realistic”
 settings cards copied from an app. Use **generic** placeholders only; consumers
 supply their own strings when they copy a recipe (`#form-recipe`, AGENTS
 recipes). Cursor rule: [`.cursor/rules/no-consumer-content.mdc`](.cursor/rules/no-consumer-content.mdc).
- **DON'T** stack diagnostic / probe / connection essays as a
  `.fynns-unit-stack` of `FieldHint` / muted `<p>` / bare strings
  (`Provider: Fail — long reason… Installed: a, b, c…`). Visible chrome stays
  **short** (service name + `OK` / `Fail` / `-`). Important detail →
  **`InfoHint`** on the same `ControlRow` (bubble / Tooltip — not inline
  essay). Same for multi-sentence policy next to a Switch: `InfoHint`, not
  `ControlBlock` `description`. Live: sandbox `#rhythm` status legend +
  `#info-hint`.
- **DON'T** use visible **Card-body** `FieldHint` or multi-sentence
  **`FieldBlock` `description`** for session scope / catalog policy /
  reload behavior in settings forms — compress instead: **Tooltip** on the
  related **IconButton** (action-specific, ≤~1–2 sentences); **`InfoHint`
  `size="sm"`** on the **field label row** (`FieldBlock` `actions`) or
  **Card** `actions` (≤1 per head) for field- or section-level policy.
  Reserve **`FieldHint` / `description`** for **one short line** (format,
  validation, empty-state). Live: `#field-header`.
- **DON'T** put **Settings** both as a root `NavigationDrawerItem` **and** as
  the footer gear — Cursor-style entry is **`navFooter` only**. **DON'T** park
  feature / runtime / domain panels (providers, tools, catalogs, generation
  pipelines) inside the Settings screen — Settings body stays **software chrome**
  (locale, appearance, account). Feature config gets its **own** destination.
  **DON'T** put UI language in TopAppBar `trailing` — language belongs in that
  Settings body (`FieldBlock` + compact `ToggleGroup`). Live: Layouts
  `#layouts-demo-shell` (footer gear → software prefs Card).
- **DON'T** turn an in-canvas catalog `List` (Experiences / Applications-style
  records under `PageScroll`) into a **silent full-canvas detail** by unmounting
  the list and swapping in another `PageScroll` whose only “back” is a ghost
  text `Button` / `ControlRow` (“All items”). Create / edit / open a row →
  **`Dialog` `size="lg"` + `showCloseButton`** (same host as `#form-recipe` /
  Experiences); escalate to **`FullscreenDialog`** (leading X) only when the
  body is a multi-Card long workflow that cannot fit a centered panel. List
  stays mounted under the overlay. Nav **drill-in** (`#layouts-demo-drill-in`
  — catalog in drawer body + TopAppBar back) is a different grammar — do not
  invent a third “fake page” without chrome back. Failure mode:
  [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) **catalog edit as silent
  PageScroll replace**. Live: `#list` status+action / `#form-recipe` Dialog.
- **DON'T** pad chrome / destination **labels** with redundant meta unless the
  user **explicitly** asks (counts, middle-dot tallies, decorative separators,
  parenthetical glosses, product-stack footnotes).
 `NavigationDrawerGroup` / `NavigationDrawerItem` / `NavigationDrawerHeadline`
 `label` stay the **short name only** (`Global` / `全局规则` — not
 `Global (OpenCode + Cursor)`, not `Global rules · 1`).
 Optional unread / notification counts → `NavigationDrawerItem` `badge` **only
 when the product requires a badge**; do not invent `Name · N` or
 `Name (explanation)` on Group triggers “for clarity.” Same for TopAppBar
 titles and List headlines unless the user asked for that meta. Failure mode:
 [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) **padded destination labels**.
- **DON'T** rename tokens to non-`--fynns-*` forms. App/teaching-specific tokens
  live in the app under `--afs-*` (automata canvas) or `--dsa-*` (DSA bars,
  pointers, DSU) — never in this core.
- **DON'T** invent consumer `width` / `min-width` on `.fynns-dialog-panel` to
  fix a skinny tall form — body must use `FieldStack` / `FieldBlock` /
  `CodeBlock` (core stretches form / file-editor hosts to the `size` ceiling);
  prefer `size="lg"` for long inspector / edit dialogs. ControlStack-only
  preference rows stay content-fit. Live: `#form-recipe` Dialog host (FieldStack
  + file-body CodeBlock dialogs).
- **DON'T** pin `CodeBlock` `variant="editable"` or form `Textarea` to a
  fixed height (`autoGrow={false}` + large `rows` / private `max-height`) on
  **PageScroll / Card / Dialog** catalogs so the well grows an **inner**
  scrollbar while the page barely moves. Default **autoGrow** (content height;
  optional soft `maxHeight`) — let the **page** scroll. Reserve
  `autoGrow={false}` for **height-resolved fill hosts** only (FullscreenDialog
  fill pane, SplitPane editor, `textarea { height: 100% }`). Live: `#code-block`
  file-body Card. Failure mode: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)
  **fixed-height CodeBlock / Textarea on page scroll**.
- **DON'T** set main app body / chrome / forms / Chat / Dialog / lists to
  `--fynns-font-serif` (or any serif / “editorial” stack). Default text inherits
  `body { font-family: var(--fynns-font-ui) }`. Serif is reserved — see Tokens
  **Font families**. Do not invent parallel stacks (Inter, Georgia, …) outside
  `--fynns-font-*`.
- Text in this package (docs, default primitive labels, comments) is **English or
  German**. Consumer apps / the sandbox may localize their chrome to Chinese via
  a locale switch — see [README.md](README.md#aesthetic-sandbox).

**Consumer apps (agents in any repo that consumes `@fynns/ui`):** treat this
package as a **function API** — import primitives and pass props / children /
labels only. **Do not** wrap `@fynns/ui` components in local restyles, fork
CSS, or invent parallel variants in the consumer. **Do not** edit
  `node_modules/@fynn7/ui-design-core` for app features (bump the package
  version or use a temporary `file:` / `npm link`). If the keep-set cannot meet the
  requirement after exploring `AGENTS.md` + sandbox Globals, **stop and tell the
  user explicitly** that the work must land in `fynns_ui_design_core` first, then
  the consumer only calls the new API. Install / pin rules:
  [`llm/CONSUME.md`](llm/CONSUME.md).

## Tokens

Source of truth: [`src/theme/tokens.ts`](src/theme/tokens.ts) +
[`src/theme/motionTokens.ts`](src/theme/motionTokens.ts). Generated CSS:
[`src/theme/theme.css`](src/theme/theme.css) (`:root { --fynns-* }` + light
override + reset + scrollbar + reduced-motion). Naming: `--fynns-<group>-<key>`
(the `misc` group has no sub-prefix).

**Light theme:** dark is the default (no attribute). Activate light via
`applyFynnsThemeMode("light")` from `@fynns/ui`, which sets
`data-fynns-theme="light"` on `<html>` and overrides a subset of color/shadow/
scrollbar/`code` tokens. `restoreFynnsThemeMode()` reads `localStorage` key
`fynns-theme-mode`.

Groups: `color`, `space`, `size`, `radius`, `shadow`, `state`, `font`, `font-size`,
`font-weight`, `line-height`, `letter-spacing`, `z`, `duration`, `ease`,
`toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`, `appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `chatmessage`, `chat`, `list`, `datepicker`, `timepicker`, `carousel`, `breadcrumb`, `pagination`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`, `code` (CodeBlock highlight roles — see below), plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases kept: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`,
  `chat-user-bubble` (quiet Chat user-bubble lift; light override).
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
  `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
    `accent-ring` (soft mark for small controls / nav indicators), `on-accent`, `accent-container`, `on-accent-container`,
    `secondary-container`, `on-secondary-container`, `tertiary-container`,
    `on-tertiary-container`, `focus` (faint keyboard ring fill).
  - Focus geometry (`--fynns-focus-*`): `ring-width`, `ring-offset-control`,
    `ring-offset-input`, `border-mix` (accent % into resting border for fields).
  - Lines/text: `border` `#0d2e2c`, `border-strong`, `outline-subtle`, `text` `#e2f0ed`,
    `text-muted` `#7a9e98`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `toggle-track`, `toggle-track-hover`,
  `scrollbar-thumb*` (also under the `scrollbar` group).
- State layers (`--fynns-state-*`): `hover` `8%`, `focus` `10%`, `pressed`
  `12%`, `dragged` `16%` — used via `color-mix(...)` for interactive overlays.
- Elevation lookups (TS only, not CSS vars): `ELEVATION_TOKENS`.
  M3 reference mirror: [`llm/m3-draft-tokens.md`](llm/m3-draft-tokens.md).

Spacing: prefer t-shirt keys `--fynns-space-{2xs,xs,sm,md,lg,xl,2xl,3xl}`;
legacy numeric keys (`--fynns-space-1` …) remain as aliases.

Standard chrome glyph: `--fynns-size-icon` (`1rem` / 16dp) + TS `ICON_SIZE`
(exported from `@fynns/ui`; default for inline icons / IconButton). Nav / Banner /
SearchBar / BottomAppBar / Toolbar action icons share this. Fab `sm` stays on
`--fynns-size-icon-md` (20dp). Dense micro glyphs (chip trailing, select chevron,
steppers) may stay smaller.

Font sizes: prefer t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`;
legacy semantic keys (`caption`, `form-label`, …) remain.

Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`, `toggle-thumb`,
`glow-accent`, `glow-danger`.

Fonts: three stacks only — see **Font families** below. Motion:
`--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,tooltip-show-delay,tooltip-skip-delay,toggle,fast,flyout,base,slow,
scrollbar,loading-spin,activity,presentation-hint,thinking-shimmer,reduced-motion-spin}`.

**Font families (`--fynns-font-*`) — when to use (agents / consumers):**

| Token | Stack | Use for | Do **not** use for |
| --- | --- | --- | --- |
| `ui` | system-ui / Segoe / Roboto | **Default everything:** page body, chrome, forms, Dialog, Chat, lists, buttons, captions. `theme.css` already sets `body { font-family: var(--fynns-font-ui) }` — prefer inheriting; only set explicitly when resetting a subtree. | — |
| `mono` | Consolas-first | Code only: `CodeBlock`, bare `code` / `kbd` / `samp` / `pre` (already reset in `theme.css`), technical identifiers. | Running prose, UI labels, Chat bubbles |
| `serif` | CMU Serif / Times-like | **Rare** academic / editorial *prose* when the user explicitly asks for formal serif (theorem / definition / proof statements, paper-like reading passages). CMU Serif matches TeX-adjacent teaching tone — **not** a substitute for a math renderer. | App chrome, main body copy, forms, Chat, Dialog, lists, buttons; live formula *rendering* (use KaTeX/MathJax or app math chrome — those bring their own Computer Modern); ASCII / code-like identifiers (`mono`) |

Consumer rule of thumb: if you are about to write `font-family`, stop — inherit `ui` unless the content is literally code (`mono`) or the user demanded serif for a narrow display passage. Never pick serif to make body text “more serious”.

**Code highlight (`--fynns-code-*`):** semantic roles for `CodeBlock` (fg, bg,
comment, keyword, string, number, type, function, variable, property, parameter,
operator, module, constant, constant-named, escape, invalid). Distilled from the
cpptools VS dark/light TextMate themes (last-wins colors) — readable CodeBlock
ink, not a full VS Code grammar. Zero-dep tokenizer in
`src/primitives/codeHighlight/`; no Shiki/Prism. **Consumer custom languages**
(line-command / Raycaster `.gsc` shape): see
[`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md) technical interface
(`SimpleHighlightProfile` / `registerHighlightLanguage`).

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

**Breaking surface:** only symbols demoed in sandbox Globals + Layouts + Preview are
public. Removed APIs and migration table: [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
**Surface sync:** `npm run check:wysiwyg` — every barrel value needs a demo (or
companion); Removed-table names must not be exported; never companion-park
`src/primitives/<Name>.tsx`. Import from `@fynns/ui`. Components emit `.fynns-*`
classes.

### Keep set (summary)

- **Actions:** Button, IconButton, SplitButton (M3 Expressive: leading action +
  trailing `DropdownMenu`; variants `primary` / `tonal` / `default` /
  `elevated` / `danger` on **Button** only — SplitButton omits `danger`;
  sizes `sm` / `md` / `lg`; **`ghost`** on Button / IconButton), Fab,
  FabMenu / FabMenuItem
- **Fields:** Input, Textarea (`width: 100%` by default; dense multiline; no
  floating label — not full M3 Text Field anatomy; **autoGrow** height from
  content by default — `minRows`, soft cap `--fynns-layout-textarea-max-height`,
  optional `maxRows` overrides the token; `autoGrow={false}` keeps a fixed well
  + vertical resize; block pad → `--fynns-layout-field-pad-block`; default
  **`spellCheck={false}`** so multilingual / technical copy has no browser
  red squiggles — pass `spellCheck` to opt in; Chromium overlay editors also
  hide marks via `::spelling-error` / `::grammar-error`), **FieldHeader** /
  **FieldBlock** (label | trailing IconButtons above a control), Select
  (trigger `min-width` floors to the widest option / placeholder so
  content-sized hosts do not resize when the value changes; still
  `width: 100%` in form rows; **`trailing`** only when no chevron conflict
  (discouraged for refresh / reload beside dropdown — use control-cluster band).
  In a cluster pass `className="fynns-control-cluster__grow"` — disables the
  content min-width floor so Select + sibling `IconButton` share one row),
  Autocomplete (same docked SearchBar expand shell as Select; open on
  click/type/ArrowDown, not focus alone; hint wrap only when
  supporting/error text), OtpInput, NumberInput (spinbutton + trailing steppers;
  discrete inspector / form counts — prefer over Slider when typing or stepping;
  not RangeSlider), SearchBar / SearchBarResult (narrow hosts
  ellipsis the field value — not mid-glyph hard clip; same on Autocomplete
  **and** single-line `Input`; idle ellipsis / focused caret scroll; chrome
  default 56dp; `density="destination"` / SearchBar in NavigationDrawer body
  matches NavigationDrawerItem 40dp height + label type + icon gap — keeps
  SearchBar surface / focus), Switch
  (dense track only — no `size` / no former md 52×32; `labelSide`
  `start`|`end`),
  Checkbox, Radio,
  Chip / ChipSet (`assist` | `filter` | `input` | `suggestion` — interactive /
  decorative **outside** data tables: filters, legends, empty starters,
  catalog tips. **Never** a table-cell status / mapping-kind pill), Slider,
  ToggleGroup, Tabs (M3 Primary underline — not a ToggleGroup substitute)
- **Feedback:** Banner (M3 chrome), InlineAlert (fynns in-panel severity — **not**
  M3; soft tonal fill; shares Banner pad/gap/icon tokens; icon tinted, body
  on-surface; long copy wraps — **phrasing copy only** (`message` or short
  `children`); never nest `List`, `FieldHeader`, `FieldStack`, `CodeBlock`,
  `Surface`, or `.fynns-unit-stack` block hosts inside the alert — stack catalogs
  **below** as unit-stack siblings; do not confuse with Banner; **never** put
  `InlineAlert` inside `ListItem` (use `.fynns-list-item-status` on a
  single-line run row — `#list`)), BadgedBox
  (notification overlay via `NavigationRailBadge` — **not** the removed pill
  label `Badge`),
  LinearProgress (`value` in `[0,1]` or omit indeterminate; determinate =
  active fill + remaining track only — **no** end-stop / end “dot”) /
  CircularProgress, **BusyScrim** `{ open, label, message?, value?, size?, indicator? }` /
  **BusyRegion** `{ busy, label, children?, message?, value?, size?, fill?, indicator? }`
  (M3-style fullscreen non-dismissible scrim via **BusyScrim**, or sectional
  **transparent** overlay + **one** progress chrome + visible message —
  keep host / pane background; do **not** wash with `surface-*` /
  private colored loading shells; `indicator` `"circular"` (default) |
  `"linear"` — known % / counts → `linear`, unknown wait → `circular`; never
  stack a ring on a bar; `message` is phrasing copy only — never nest
  `LinearProgress` / `CircularProgress`; `label` is the progress accessible
  name and the default visible copy when `message` is omitted; `value` in
  `[0, 1]` for determinate, omit for indeterminate; `size` defaults `md` and
  applies to the ring only; **`fill`** stretches in a height-resolved
  parent so the overlay centers in the visible pane — required for cold-start
  with no children). Overlay is `place-items: center` in the region's box;
  a content-sized host parks the chrome at the top of leftover canvas.
  **Loading placement (hard):**
  | Scene | Use | Do **not** |
  | --- | --- | --- |
  | Full-app block | `BusyScrim` | `EmptyState` + `CircularProgress`; revived `BlockingLoadingOverlay` |
  | Pane / section cold-start (no content yet) | `BusyRegion` `fill` `busy` as `FillColumn` `children` (or shell main / canvas flex child); omit children; overlay stays **transparent** | Nesting `fill` under App-level `.fynns-unit-stack` / `Card` / `List` / Dialog body (content-sized → ring parks at top); `EmptyState` as a loading shell; bare `CircularProgress` (md default) as the body; private `SectionLoading` / colored loading wash |
  | Dialog / Card / section **body** load (catalog, table, detail list — no content yet) | `BusyRegion` `busy` (+ `fill` when the host height is resolved); **BusyRegion only** — do **not** also render pager chrome (`Select` / `Pagination` / Sessions strip) as siblings under the empty overlay; **NavigationDrawer:** `SearchBar` / tools stay **siblings above** BusyRegion — empty cold-start without `fill` paints chrome **in flow** (never absolute over a 0-height box that spills onto SearchBar) | Bare `CircularProgress` (default md) as the Dialog/`unit-stack`/Card body; inventing hub loading CSS; Card `unit-stack` with empty `BusyRegion` **plus** Sessions `Select` / `Pagination` siblings (transparent overlay covers the footer; spinner sits on the Select); wrapping drawer `SearchBar` inside `BusyRegion` |
  | Refresh over existing surface | `BusyRegion` wrapping **only** the List / table / surface being refreshed (fill optional if that host already has height); keep pager / Sessions chrome **outside** the busy wrapper; transparent overlay so the surface shows through | Unmount the section and swap in EmptyState; second `surface-*` tint under the ring; wrapping the whole Card (List + Select + Pagination) so chrome flickers under the overlay |
  | Known-progress long task (scan / upload / copy) | Same host: `indicator="linear"` + `value` in `[0,1]`; `message` = status copy only; chrome width is **host-relative** (`min(20rem, 100%)` — never viewport/`100vw`) so NavigationDrawer / EndAside do not spill | Stack `CircularProgress` with `LinearProgress`; nest a bar / ring in `message`; private `width: 20rem` / `100vw` on the busy chrome |
  | Unknown-duration wait | Default `indicator="circular"`; button / icon / field slot = inline **`Spinner`** (Button / IconButton `loading` — sm footprint) | Two progress chromes in one overlay |
  | Button / icon / field busy | Inline **`Spinner`** via Button / IconButton `loading` (sm footprint; not a standalone `CircularProgress` in the slot) | Page-level / Dialog-body / Card-body layout |
  | **Multi-action footer wait** (`.fynns-control-cluster` of `Button` / `IconButton`) | **At most one** `loading` spinner in the cluster — the action that is running. Siblings → `disabled` **without** a second spinner (shared `busy` boolean on every `loading` is the anti-pattern). Live: `#rhythm` end-align | Two+ sibling Buttons both `loading={true}` / both `loading={busy}` (twin rings = information redundancy) |
  | **Section wait + header / foot chrome** (FieldBlock `actions`, Card `actions`, Dialog foot while body is BusyRegion-busy) | **BusyRegion only** for the wait; chrome Buttons / IconButtons → `disabled` **without** `loading`. Live: `#busy-region` FieldBlock actions | BusyRegion (or BusyScrim) ring **and** FieldHeader / Card / foot `loading` at once (double rings = information redundancy) |
  | Zero-result catalog | `EmptyState` | Using it for loading |
  | Pane sole zero-result (DestinationAppShell canvas / FillColumn children / shell main — no sibling chrome) | `EmptyState` **`fill`** (centers title + description in the visible pane — same host contract as `BusyRegion` `fill`) | Content-sized EmptyState parked top / mid-left; private `margin: auto` / absolute centering; inventing a second empty shell |
  | Zero-result **inside** Card / List / ChatThread.empty | `EmptyState` default (no `fill`) | `fill` under a content-sized Card / unit-stack (cannot stretch) |
  **paint-before-work:** `afterNextPaint` / `yieldToMain` / `runBusyTask(setBusy,
  task)` / `useBusyTask()` — `flushSync` busy on → wait one paint → then run
  the async task so `CircularProgress` can start spinning. Does **not** keep
  the ring smooth through long sync / WASM compile on the main thread (use a
  Worker or `yieldToMain` slices for that). Prefer over `setBusy(true)` then
  immediately blocking work.
  EmptyState,
  **Chat** / **ChatThread** / **ChatComposer** / **ChatScrollToBottom** /
  **ChatMessage** `{ role, children?, avatar?, name?, streaming?,
  streamingLabel?, error?, onRetry?, retryLabel?, thinking?, citations?,
  citationsLabel?, citationsVisibleCount?, onCitationOpen?, actions? }` (**dual
  placement** — main keeps ChatGPT 70% bubble; aside lifts bubble to 100% to
  match composer shell on long turns; no density mode):
  - **Shell:** `Chat` full-height flex column; soft floor
    `min(var(--fynns-layout-chat-min-width), 100%)` (**no** OS window lock).
    Parent must resolve height — on DestinationAppShell canvas / shell main
    with a Preview (or other) band above Chat, wrap with **`FillColumn`**
    (`header` = Preview, `children` = `Chat` **or** `BusyRegion` `fill` while
    the thread is booting); do **not** stack Preview /
    EmptyState / Composer as canvas siblings (dead band under content height;
    canvas `overflow-y: auto` does not replace a fill column). Aside full-pane
    Chat still uses `.fynns-chat-host--fill` / EndAside (bubble 100%) — not
    FillColumn’s job. Only `ChatThread` scrolls (`role="log"` + `fynns-scroll`);
    composer docks at root bottom; stick-to-bottom + scroll-to-bottom (32dp
    elevated `IconButton`, not Fab; show after ~80dp leave-bottom /
    `--fynns-chat-scroll-threshold`; sit `--fynns-chat-scroll-fab-inset`
    above the **live** composer box — not collapsed `composer-min-height`).
    `empty` prefers `EmptyState`;
    optional starter prompts = `Chip` / `ChipSet` (`suggestion` /
    `assist`, `radius-pill`) **inside** `empty`, centered wrap — they
    sit in the thread **above** the docked composer (do **not** mirror
    ChatGPT’s centered-composer “chips below input”; do not add
    `ChatStarterChip`). Composer stays docked. Prefer **`ChatMessage`
    `markdown`** or **`ChatMarkdown`** for LLM turns (L2 GFM subset — see
    below). No Voice Mode / quote-reply / Slack-style emoji reactions /
    attachment upload (`attachments` slot + optional dictation hook only).
    **Parity note (markdown / GFM):** ChatGPT renders GFM in assistant turns,
    including **task-list checkboxes** (`- [ ]` / `- [x]`). `@fynns/ui` ships
    a **zero-dep L2 subset** via `ChatMarkdown` / `ChatMessage markdown`:
    paragraphs, AT1–6, fenced → `CodeBlock`, blockquotes, hr, ul/ol,
    GFM `- [ ]` / `- [x]` → ordinary list items (label only — no interactive `Checkbox`), inline `code` / **strong** / *em* / ~~del~~ /
    links. Not full CommonMark/GFM (no tables / raw HTML). Streaming: append
    into `markdown`; incomplete fences stay open through EOF. Custom trees
    still use opaque `children`. **Parity note (reactions):** ChatGPT and
    Claude.ai ship **thumbs up/down** as vendor quality feedback under
    assistant turns — not multi-emoji reactions (those remain feature
    requests on both). Pass thumbs via the `actions` slot if the app
    needs them; do not add a reaction picker primitive.
    **`actions` recipe (assistant):** `IconButton` + `Tooltip` for **Copy**
    and **Regenerate** (`RefreshIcon`), plus a **More** (`MoreHorizontalIcon`)
    `DropdownMenu` for overflow — hover / focus-within reveal (touch always;
    opacity fade). Core paints chrome only; **consumer agents must
    implement LLM rerun** on Regenerate (same ownership as streaming tokens).
    Failed-turn footer stays `error` + `onRetry` (labeled Regenerate button) —
    do not confuse with idle-turn `actions` regenerate.
  - **Main** (`ClippedNavShell` main): column ceiling
    `--fynns-layout-chat-max-width` / `--fynns-chatmessage-max-width`
    (**48rem**, ChatGPT `max-w-3xl`) — **not** full main / viewport. User
    bubble `--fynns-chatmessage-bubble-max-width` **70%** of that host row
    (short copy shrinks; `radius-22` / ChatGPT `rounded-[22px]`;
    `--fynns-color-chat-user-bubble`; body `1rem` / pad-inline `1rem`).
    Composer = **100%** of the same host (`radius-3xl`, ~44dp collapsed
    shell with 32dp controls + 6dp pad — Cursor-dense circle, one step
    below IconButton md 40dp; not SearchBar 56dp chrome; not viewport
    full-bleed). Thread
    `--fynns-chat-thread-pad-inline` (= `dialog-inset`, 24dp column breath)
    and composer `--fynns-chat-composer-inset-inline` (**aliases the thread
    token**) so the user bubble end edge and composer shell end edge align
    (equal L/R on the capped column; see `llm/CHAT_COMPOSER_LAYOUT.md`).
    Inner radius-3xl expanded text breath: shell pad = strip − glyph-inset,
    textarea glyph-inset so copy aligns with + / Send **glyphs** (text edge
    still at strip-pad); do not conflate column outer inset with shell pad.
  - **Aside** (`EndAside` / `.fynns-chat-host--fill`): host = **100%** of
    aside content (rem ceiling dropped). User bubble ceiling **100%** of that
    host (long turns share composer shell start+end; short still shrinks);
    composer **100%**. Pane soft mins + chat stage min on the shell root.
  - Unchanged under 640px; `assistant` plain; `system` centered muted
    notice (no pill); **`avatar` default omit**; `actions` hover /
    focus-within on the message (opacity fade via
    `--fynns-chatmessage-actions-reveal` → `duration-slow` / `--fynns-ease-out`
    both ways; touch always; reduced-motion snaps);
    `streaming` = last-glyph color pulse + `aria-busy` / polite
    live — no LLM; pulse only while answer `children` / `markdown` has
    text (no empty bubble / lone cue during thinking-only wait —
    conditional `null` child slots also count as empty); cue =
    `.fynns-chat-message-stream-tail` on the last glyph (text ↔
    ChatThinking-shimmer mid — accent→muted mix, never full neon accent;
    duration `--fynns-chatmessage-stream-tail` → thinking-shimmer; no
    I-beam / extra caret box); **`error` / `onRetry` / `retryLabel`** = ChatGPT failed-
    generation footer under the assistant turn (danger copy + optional
    Regenerate; wins over streaming / citations / actions);
    **`thinking`** / **`ChatThinking`** = single-block reasoning /
    Agent activity disclosure between `name` and the answer bubble
    (ChatGPT / Claude “Thinking / Thought for Ns”; Cursor-style tool
    status via `streamingLabel` — not only “Thinking”; `.fynns-expand`
    height morph — not Collapsible card chrome; muted trigger).
    **Secondary ink (dark teal):** rest = `text-muted`; hover / active
    emphasis = soft `color-mix` into `text` (never full
    `--fynns-color-text` — VS Code/Vercel jump muted→foreground, which
    reads as a white flash here);     no trigger state-layer wash. Streaming
    = label shimmer (`--fynns-duration-thinking-shimmer` 2s linear,
    muted base + accent-into-muted mid peak — never full `text`) + swap
    enter (`--fynns-duration-base`, opacity fade only — no translateY); no default streaming orb (`icon` is
    optional leading glyph only);
    force-open while streaming unless user pinned closed (trigger stays
    enabled so the disclosure can collapse mid-run; a new streaming cycle
    clears the pin); auto-collapse once when done; user expand sticks;
    no body → static duration strip without chevron; caller owns thought `children` — core does **not**
    parse markdown / CoT; do **not** pipe thinking tokens into
    `aria-live` — see
    [`llm/CHAT_ARIA_PARITY.md`](llm/CHAT_ARIA_PARITY.md); geometry under
    `CHATMESSAGE_TOKENS` `thinking-*`, no `THINKING_*` group;
    `thinking-body-pad-block` aliases `field-stack-gap` so trigger ↔ body
    is not flush).
    **`ChatActivity`** / **`ChatActivityStep`** / **`ChatActivityArtifact`**
    = Wave 2 multi-step agent / tool-call **status tree** (Cursor-style
    collapsible header + vertical rail + `ChatActivityStep` rows).
    **`icon`** is any ReactNode — consumers swap per tool / situation
    (`FileIcon` / `PencilIcon` / `SearchIcon` / …). Omit → `WrenchIcon`
    (`done` / `pending`) or the soft status mark (`active`); `null` →
    empty node (rail still connects). Node box + SVG descendants use
    `--fynns-size-icon`. Optional file capsule + description (icon ↔
    filename gap aliases `--fynns-chatmessage-citation-chip-gap`). Each step
    is its own `ChatActivityStep` with a dedicated `.fynns-chat-activity-step-row`
    (icon | headline label(+artifact); description indented under the band —
    form-style `--fynns-chatmessage-activity-step-min-height` floor, then
    measured max across open steps applied as shared min-height so glyph /
    label / artifact vertically center; rail starts at centered icon bottom).
    Same secondary-ink band as
    ChatThinking (header label inherits muted; active step / artifact
    hover use soft mixes — not full on-surface). Header `label` remounts
    with the same fade-only swap as ChatThinking (no translateY). While
    `streaming`, every newly mounted step fades the **whole row** over
    `--fynns-chatmessage-activity-enter` (aliases `duration-activity` — not
    `presentation-hint` / not chrome `duration-slow`) / `--fynns-ease-emphasized`
    (`--enter` on the step, opacity only). Step shells snap `.fynns-expand`
    `0fr`/`1fr` with **no** height transition — morphing the row clips the
    tree top-to-bottom (`overflow: hidden`) and reads as a bounce. Closed
    shells stay `opacity: 0`. Node + rail stay in the layout box so the
    tree does not desync. Already-visible rows stay still. Growing trees
    need a stable `key` per logical step so
    rows do not morph identity. Static completed trees skip the enter
    flash. Instant-complete `done`
    steps still visualize while streaming: the active mark holds for
    `--fynns-chatmessage-activity-step-min-busy` (aliases
    `presentation-hint`, one pulse) then glyph + artifact play a
    complete one-shot (`--fynns-chatmessage-activity-complete`, aliases
    `duration-activity`; glyph fade, no scale; artifact stays in layout,
    `visibility: hidden` during hold).
    `active` → `done` on the same row skips the hold and plays complete
    (if that row is still entering, complete waits for enter to finish).
    The hold + complete finish even if `streaming` ends mid-pulse;
    steps that already painted as `active` skip the hold;
    `prefers-reduced-motion` skips hold / enter / complete.
    A newly mounted last step stays
    queued (`0fr`, not painted) until earlier holds **and** complete one-shots
    finish, then snaps open + whole-step fade —
    complete and enter never overlap. Uncontrolled: force-open
    while `streaming` unless the user pinned closed (trigger stays
    enabled so the tree can collapse mid-run; a new streaming cycle
    clears the pin). Completed trees stay at last open — no post-stream
    auto-collapse. Also slots via
    `ChatMessage.thinking` (alone or above `ChatThinking`). Keep
    `ChatThinking` for single-block reasoning — do **not** overload it
    into a tool timeline. Geometry: `CHATMESSAGE_TOKENS` `activity-*`.
    **Label tense (consumer-owned — strongly recommended):** core does
    **not** rewrite copy. Apps own every `ChatActivity` / `ChatActivityStep`
    `label`, header `label`, and `ChatThinking` `streamingLabel` / done
    `label`. Match **step** status with English aspect (or locale
    equivalent):
    - **`active` / in-flight step** → progressive / continuous (*-ing*):
      `Calling the function…`, `Executing sample script…`,
      `Gathering context…`, `Reading the plan…`, `Presenting the plan…`.
    - **`done` / completed step** → simple past (or locale perfect):
      `Ran the script`, `Loaded the dataset`, `Created memory file`,
      `Presented plan`, `Thought for 4s`.
    Do **not** leave a finished step on an *-ing* title, or an in-flight
    step on a past-tense title. Swap the string when `status` flips
    (`active` → `done`) and when `ChatThinking` leaves streaming.
    **`ChatActivity` header** may summarize the latest **completed**
    milestone in past tense even while `streaming` (Cursor-style stage
    strip: e.g. `Updated plan with details` while a later step is still
    `Executing…`); only the open/`active` step row must stay progressive.
    Live samples: sandbox `#activity` / `#thinking`. Same rule applies to
    consumer zh/de chrome (`正在…` / `已…`, German Partizip II, …) —
    default primitive docs stay English or German (Language hard rule).
    **`citations`** / **`ChatCitations`** / **`ChatCitationChip`** =
    browsing source chips under the assistant body (publisher + favicon;
    hover title/snippet preview with Tooltip `side="bottom"` so it does not
    cover the turn text; click opens `href` or `onCitationOpen`;
    +N expands footnote cards at `--fynns-radius-22` — same floor as the
    user bubble, never squarer — no Sources sidebar); `data-message-author-role`
    on each row. **Body sibling stack (hard — 16dp):** adjacent **element**
    children of `.fynns-chat-message-body` use
    `--fynns-chatmessage-body-stack-gap` (aliases
    `--fynns-layout-unit-stack-gap` / same as `.fynns-unit-stack`) — CodeBlock
    + prose, two wells, etc.; not CodeBlock-specific. **Core guarantee:**
    bare string / number `children` are promoted to
    `.fynns-chat-message-prose` so `{text}<CodeBlock/>` still gets the gap —
    consumers must **not** patch this with app CSS or ad-hoc wrappers as the
    primary fix. Consecutive **non-block** children (string + inline `code`,
    …) coalesce into **one** prose unit so caption-style mixes stay inline;
    block wells (`CodeBlock`, `div`/`p`/`pre`, …) stay siblings. Prefer
    element siblings for markdown roots (app `<div>` /
    `.fynns-unit-stack`); nested markdown still stacks inside the wrapper
    with the same layout token. While `streaming`, the last glyph in the
    trailing prose / markdown host gets `.fynns-chat-message-stream-tail`
    (color pulse — no extra caret box; excluded from body-stack-gap).
    **Inline `code`** (caller-rendered, not markdown): ChatGPT
    prose parity — `--fynns-font-mono`, `--fynns-color-chat-inline-code-bg`
    (text wash via `code-user-bg-mix` 15% dark / 10% light — not ChatGPT
    gray-700), pad `.15rem` / `.3rem`,
    `--fynns-radius-xs` (4px), size `.875em`, weight medium; user bubble uses
    the same wash + tighter pad.
    `pre code` stays unstyled by these rules.
    **ARIA (ChatGPT parity):** skip → `#main`; **prefer** dual `.fynns-sr-only` notify
    regions for respond/complete (app-owned today — not token-live on the
    bubble; core ships `role="log"` on `ChatThread` + `aria-busy` on the
    row). Keep composer focus after send; Send/Stop/dictate labels — full
    contract: [`llm/CHAT_ARIA_PARITY.md`](llm/CHAT_ARIA_PARITY.md). Idle without
    `onDictate`: Send stays visible and is **disabled** when the draft is empty
    (not omitted). With `onDictate`, empty idle still shows Dictate.
  - **Composer keys (ChatGPT parity):** Enter sends; Shift+Enter newline;
    Esc stops while `busy`. **CJK IME:** Enter during composition (or the
    confirming Enter some browsers fire just after `compositionend`)
    commits the candidate only — it must **not** send; a later Enter
    sends. Guarded via `compositionstart`/`end` + `isComposing` /
    `keyCode === 229`.
    **Parity note (composer input model — ProseMirror vs textarea):**
    ChatGPT’s docked prompt is **not** a growing `<textarea>` as the
    primary editor. Captured CSS/DOM (`scripts/_focus-verify/chatgpt-*`):
    parent `.wcDTda_prosemirror-parent` hosts
    `.ProseMirror[contenteditable]` (ProseMirror) after hydration, with a
    `.wcDTda_fallbackTextarea` (`name="prompt-textarea"`, empty height
    `1lh`) for the SSR / no-JS path. The scroll host caps growth with
    `max-h-[max(30svh,5rem)]` + `max-h-52` (~13rem) and `overflow-auto`.
    **Height growth:** a contenteditable block sizes to its paragraphs
    (layout does the grow); the parent scrolls past the cap. A native
    `<textarea>` does **not** — it needs either `field-sizing: content`
    (uneven support) or the classic JS resize (`height: 0` →
    `scrollHeight`, clamp to max). Placeholder wrap can inflate
    `scrollHeight` on empty textareas (narrow panes); ProseMirror uses a
    CSS `::after`/`::before` placeholder instead. **fynns:**
    `ChatComposer` stays a controlled `<textarea>` (`rows={1}`,
    `field-sizing: fixed`, layout-effect auto-grow). Empty value forces
    height to `--fynns-chat-composer-line-height` (32dp) so
    placeholder wrap cannot inflate a narrow EndAside; shell pad is
    `--fynns-chat-composer-pad-inline` / `pad-block` (~6dp equal inset
    around the Send/Stop circle). Without a leading
    control, textarea start adds pad so text lands at
    `--fynns-layout-strip-pad-inline` (Banner breath on the text side only).
    Outer form inset aliases `--fynns-chat-thread-pad-inline` →
    `dialog-inset` (column breath, not strip-pad). **Multiline layout** is model C
    + compact morph (Cursor): collapsed ≈ one horizontal row (~44dp = 32dp
    control + 6dp pad — Cursor-dense circle, not SearchBar 56dp; toolbar
    `display: contents`; `line-height` = 32dp control row); expanded =
    full-width textarea above a bottom `role="toolbar"` (leading start,
    Send end) with shell pad `composer-expanded-pad-inline` /
    `composer-expanded-pad-block` (= strip-pad − glyph-inset), textarea
    `composer-glyph-inset` so copy shares + / Send **glyph** edges (text
    at strip-pad from shell), **8dp** text↔toolbar gap
    (`composer-expanded-gap`), and `composer-text-line-height` (22dp).
    Height auto-grows from `scrollHeight` after the expanded morph
    (remeasures when `data-expanded` flips) — never leave icons vertically
    centered beside tall text. **Do not auto-collapse a non-empty draft:**
    EndAside / narrow hosts morph width when `data-expanded` flips, so
    expand↔collapse can hit `Maximum update depth exceeded` and blank
    `#root`. Collapse only when the value is cleared. Spec:
    [`llm/CHAT_COMPOSER_LAYOUT.md`](llm/CHAT_COMPOSER_LAYOUT.md).
    Collapsed shell ≈ 44dp (`--fynns-radius-3xl`). Cap:
    `--fynns-chat-composer-max-height` (13rem).
    Plain-text prompts only, zero ProseMirror dependency. Do **not** swap
    to contenteditable for visual parity alone.
    **Parity note (paste):** Upgraded ChatGPT ProseMirror keeps rich HTML
    (bold/lists/headings per schema); pure `text/plain` that looks like
    Markdown is parsed into rich nodes; code marks stay literal. Native
    `<textarea>` strips HTML to plain and never Markdown-parses — that is
    the intentional fynns composer model until a rich editor is adopted.
    **User edit (ChatGPT parity — not built into core yet):** pencil under
    the bubble → **inline** host-width Cancel/Send surface (does **not**
    replace the docked composer); Send forks + `< N/M >` branch picker.
    Full UX: [`llm/CHAT_USER_EDIT_UX.md`](llm/CHAT_USER_EDIT_UX.md).
  - **Parity note (`prefers-reduced-motion`)** — ChatGPT (captured CSS in
    `scripts/_focus-verify/chatgpt-{root,conversation}.css`) vs `@fynns/ui`:
    - **Streaming cue:** ChatGPT’s default `.result-streaming` trailing
      `●` is **static** (no animation). The optional `.pulse` / `pulseSize`
      scale loop is **not** killed under `prefers-reduced-motion: reduce`
      (hard-coded `animation: … pulseSize`). Related streaming motion that
      **does** respect reduce: text color-decay, content-enter fade; working
      wave dots / `.pulsing-dot` only run under `no-preference`. **fynns:**
      `.fynns-chat-message-stream-tail` color pulse → `animation: none` +
      accent→muted mid under reduce (plus global `theme.css` instant
      durations).
    - **Scroll-to-bottom:** ChatGPT CSS only positions the control
      (`--thread-scroll-to-bottom-banner-offset`); no dedicated enter/exit
      motion found. Smooth-scroll utilities are gated
      (`not-motion-reduce:…scroll-smooth`); carousels set
      `scroll-behavior: auto` under reduce. **fynns:** `Chat.scrollToBottom`
      uses `behavior: "auto"` when reduce matches (else `"smooth"`); FAB
      itself has no enter animation.
    - **Shell transitions:** ChatGPT disables page↔page / sidebar **View
      Transitions** under reduce (`::view-transition { display: none }`) and
      zeros model-picker / chrome menu transitions. Orphaned
      `float-sidebar-in/out` keyframes exist but are unused in the dump.
      **fynns:** composer focus border transition → none; `EndAside` /
      `ClippedNavShell` width-morph durations → `0` via `matchMedia`.
    Evidence dumps only — re-check live ChatGPT if product CSS drifts.,
  **Snackbar** (`snackbar(message, opts?)` / `snackbar.dismiss(id?)`
  + root `<SnackbarHost />`;
  one at a time, bottom-center; optional single action; `short` / `long` /
  `indefinite`; surface `--fynns-color-toast-surface`, z `--fynns-z-toast`),
  Tooltip (hover opens after `--fynns-duration-tooltip-show-delay`;
  leave hides immediately; focus opens at once; after any tip has shown,
  further tips skip the delay for `--fynns-duration-tooltip-skip-delay` so
  consecutive toolbar hovers are instant; enter fades/slides via
  `--fynns-duration-tooltip` once placement is ready; bubble stays inside the
  viewport via flip/shift + inline `maxWidth` from the floating placer), InfoHint
- **Overlay / sheets:** Dialog / DialogShell / ConfirmDialog / FullscreenDialog
  (**M3 variants** — official catalog is basic + full-screen only):
  | Role | API | Close | Notes |
  | --- | --- | --- | --- |
  | Basic confirm | `ConfirmDialog` | none | Title + supporting text + foot actions; `dialog-inset`. |
  | Basic content | `Dialog` (`showCloseButton` default **false**) | optional | Same M3 basic shell (`radius-3xl`, content-fit width / `size` ceiling). **Form body** (`FieldStack` / `FieldBlock` / `Textarea`) **stretches to the `size` ceiling** — prefer `size="lg"` (35rem / M3 560dp max) for tall inspector forms; body scrolls at panel `max-height`. ControlStack-only preference rows stay content-fit. Optional X is a web extension for dismissible forms — **not** a separate component. |
  | Full-screen | `FullscreenDialog` | leading X | `content-inset` header; **flush-start** when the first body child is a bordered well — see **Flush-start overlay body**. Mobile-first long tasks. |
  **Dismissible Dialog + ControlStack** (do **not** invent a parallel
  `SettingsDialog` / Preferences shell): `Dialog` + `showCloseButton` +
  full-width `ControlStack` / `ControlRow` / `Switch`. Live sample: sandbox
  Globals → Containment overlays → Open Dialog with close (not the InfoHint
  demo). **Row recipe (hard):** one visible name = `ControlRow` `label`;
  `Switch` uses `label=""` + matching `ariaLabel` (track only at the end).
  **Do not** put a second visible Switch `label` / `labelSide="end"` copy on
  the same row, and **do not** treat Globals `#info-hint` (`ControlRow` +
  labeled Switch + trailing `InfoHint`) as a Dialog / Preferences template —
  that demo is InfoHint anatomy only. Add `InfoHint` only where help is
  needed (dense rows prefer plain labels — see [`llm/PERF.md`](llm/PERF.md)).
  No forced uppercase on `ControlRow` captions — pass the casing you show.
  Centered panel CSS stretches the stack (`width: 100%`, label `1fr`,
  controls `max-content`) and optically shifts the close IconButton so the
  **CloseIcon glyph** end edge (not the 40dp hover disk) shares the Switch
  track end edge (`panel − dialog-inset`). Do not wrap body in extra padding
  or keep toolbar `max-content` stacks inside Dialog.
  Drawer (content side sheet ~400dp, open-edge `radius-xl`; always modal),
  BottomSheet, DropdownMenu (+ Item / CheckboxItem / Group / Separator;
  catalog / toolbar IconButton strips → `iconOnly` ghost sm circular trigger),
  ContextMenu / ContextMenuTrigger,
  **CommandPalette** `{ open, onOpenChange, items, query?, onQueryChange?,
  placeholder?, emptyLabel?, label?, closeOnSelect? }` (Spotlight / ⌘K filter
  dialog — `DialogFrame` centered; apps own the global accelerator; arrow keys
  + Enter select; Esc / scrim dismiss; display-only `shortcut` on items; not
  DropdownMenu, not SearchBar alone; Cursor Actions rhythm: single-line rows
  (icon centered | label | split shortcut chips); optional `description` stacks
  under the label (then icon aligns to the title row); group gap via
  `--fynns-command-group-gap`; live `#command-palette`)
- **Dates / time:** DatePicker / DatePickerDialog / DateRangePicker /
  DateRangePickerDialog, TimePicker / TimePickerDialog
- **Chrome:** TopAppBar (**edge-flush** — no outer radius / no card frame;
  greenfield via DestinationAppShell / `ClippedNavShell.topBar`), BottomAppBar,
  **StatusBar** / **StatusBarItem** `{ leading?, trailing? }` (IDE status strip
  — ~22dp edge-flush under shell main / EndAside; branch / diagnostics /
  encoding chips; `StatusBarItem` `onClick` for interactive chips. **Not**
  BottomAppBar actions+FAB and **not** Banner. Live
  `#status-bar` / Layouts `#layouts-demo-status-bar`),
  Toolbar (docked / floating — use floating when a rounded tool strip is needed),
  NavigationRail (+ Menu / Header /
  Item + optional `footer`), NavigationBar / Item, NavigationDrawer (+ Headline / Group / Item + optional `footer`;
  Headline = static section label; Group = collapsible Cursor-style folder row
  with optional leading `icon` any ReactNode + indented items; sibling Item /
  Group / Headline / Divider gap = `--fynns-navdrawer-section-gap` — do **not**
  wrap destinations in `.fynns-unit-stack`; SearchBar / tools /
  SyncSideFilter `ToggleGroup` / `--toolbar-end` host as body siblings use
  `--fynns-navdrawer-search-gap` (aliases layout `control-stack-gap` / 8dp)
  between chrome peers and before destinations — never Item `section-gap`
  (4dp) for that band
  to destinations; **sheet `footer`** = Cursor-style **single account row**
  (Avatar + optional `.fynns-nav-drawer-footer-account-label` — soft end
  fade **only when truncated** via core `data-fade`, ≥ 0.4.130; short names
  stay fully opaque — not always-on mask) +
  settings gear (`IconButton` `size="sm"`; Avatar start / settings end /
  Avatar+settings bottom / footer top = one
  `--fynns-navdrawer-footer-account-inset` ≈ **16dp** / `space-lg` — equal
  four-way chrome, ≥ 0.4.131 (was 12dp in 0.4.129); **no** Dialog optical negative end margin,
  **no** Item `item-pad` stack) in
  `.fynns-nav-drawer-footer-account` end — **full-width**
  `space-between` + gap `--fynns-layout-control-stack-gap` (**8dp**, ≥ 0.4.124 —
  **not** denser `control-cluster-gap` 4dp, or the label kisses the gear);
  Avatar↔label in `account-start` = `--fynns-navdrawer-pad-inline` (**~10dp**,
  ≥ 0.4.125 — body sheet inset, not 4dp cluster gap); start + label
  **hug** (no `flex-grow`, ≥ 0.4.126) so space-between leaves a visible
  middle band before the gear —
  **not** a destination Item and
  **not** TopAppBar `trailing` for settings; footer has
  **no** hairline divider above it — pad only, Cursor-style; when body content
  overflows, `.fynns-nav-drawer-body` gets `data-fade-bottom` / `data-fade-top`
  mask fades into the footer / top — not a hard clip). Omit
  account label → avatar/initial only; put identity in `Tooltip`. SkipLink,
  Breadcrumb, Pagination (list/table pager: **`.fynns-pagination-bar`** —
  M3/MUI single footer row: rows-per-page Select + range start, content-width
  nowrap `Pagination` end; **never wrap to two rows** on narrow — bar scrolls
  inline (`fynns-scroll`); do not grow Select to crush page discs)
- **App shells:** **`DestinationAppShell` (default greenfield template)** —
  declarative `destinations[]` / `title` / optional `leadingExtra` /
  `trailing` / `navFooter` (Cursor-style single account row + settings end) / `children` /
  optional `aside` (not assumed Chat). Internally
  wires `ClippedNavShell` + `TopAppBar` + labeled `NavigationDrawer` + optional
  `EndAside`. Destinations are **binary**: open labeled drawer (resizable) or
  fully `hidden` — **no** icon-only `NavigationRail` densify on narrow /
  crowding (`onNavCrowded` **closes** nav). Agents **must** use this unless the
  user specifies another template. Demo: sandbox **Layout templates**
  `#layouts-demo-shell`.
  Low-level **ClippedNavShell** (full-bleed `TopAppBar` + `nav | main`
  under it — M3 clipped; no topbar×sidebar crosshair; `navMode`
  `drawer`|`rail`|`hidden` drives column width via `--fynns-navdrawer-width` /
  `--fynns-navrail-width` / `0`. Open↔closed **width-morphs** the destination
  track (two grid columns → `0px`; shell keeps the last `nav` through
  `--fynns-duration-flyout` so consumers may pass `null` when hidden).
  TopAppBar leading toggle is **open ↔ closed** only (`drawer` ↔ `hidden`).
  `"rail"` is **not** a DestinationAppShell / crowding intermediate — only when
  the app intentionally mounts `NavigationRail` (phone greenfield standalone).
  Crowding → **close** destinations (`hidden`), never swap to unlabeled rail.
  **Consumer sync (slot API only):** `navMode` and the `nav` slot must match
  (`drawer`→`NavigationDrawer`, `rail`→`NavigationRail`); the shell never
  auto-swaps. Prefer `DestinationAppShell` so agents never hand-sync this.
  A rail-width track still hosting a labeled drawer is a
  **squashed drawer** (narrow strip + body scrollbar) — not a real rail.
  **`nav` = destinations only** — never wiki / page body / forms / Chat /
  Preview in the nav track (`children` = main; `aside` / `EndAside` =
  inspector). “Clipped” = M3 chrome topology (full-bleed TopAppBar + nav
  under it) — **not** text clipping; diagnose `data-nav` / track width /
  which slot holds odd copy before restyling `.fynns-*`. Pasteable consumer
  rule + failure modes: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) /
  [`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc).
  In `drawer` mode the nav|main seam is **resizable** (local
  `--fynns-navdrawer-width`; drawer fills the grid track; clamped by absolute
  `--fynns-navdrawer-min-width` / `max-width` rem tokens and remaining room for
  main / EndAside mins — do not use `%` in those tokens). Live drag paints the
  CSS variable directly (rAF) and commits React width on pointerup so the seam
  tracks the pointer without per-pixel re-renders. `onNavCrowded` also
  watches **main-column** overflow (canvas + `EndAside` floors vs the main
  track), not only the outer shell scrollWidth — also when shrink-to-fit hides
  overflow (drawer track starves main below `main-min` + `end-aside-min`, or
  nav column ≥ main while EndAside is open).   On open, crowding is predicted from **target** drawer width
  (`wouldClippedNavDrawerCrowd(shellEl, drawerWidthPx?)`) in `useLayoutEffect`
  **before** applying `navMode="drawer"` paint — if the open width would crowd,
  **close** destinations (`hidden`) so they never flash as a full labeled drawer
  then snap closed. Export is also available for
  apps that open destinations themselves. It **must not** fire while the
  drawer seam is being dragged, while `EndAside` is in `data-state="closing"`,
  or while `EndAside` is mid-drag (`data-resizing`)
  (closing morph would otherwise false-trip overflow and collapse the labeled
  drawer). Crowding length reads (`readVarPx` / `readRemPx`) resolve
  `px`/`rem`/`%`/`clamp()` **without** inserting measure probes into the shell
  root — probes under a `subtree` `MutationObserver` cause idle layout thrash
  (see [`llm/PERF.md`](llm/PERF.md)).
  and
  **EndAside** (end-edge supporting pane with **width** open/close; tokens
  `--fynns-layout-end-aside-width` / `end-aside-max-width` /
  `end-aside-min-width`; canvas preferred size `--fynns-layout-main-min-width`).
  Desktop leading-edge **drag resize** (parity with drawer trailing seam —
  live `--fynns-layout-end-aside-width` via rAF; clamp by
  `end-aside-min-width` / `end-aside-max-width` and remaining room for
  `main-min-width`; `width` / `defaultWidth` / `onWidthChange` /
  `disableResize`; DestinationAppShell mirrors as `asideWidth` / …). Hidden on
  the ≤56.25rem bottom-sheet path. Mid-drag sets `data-resizing` so
  `onNavCrowded` does not fire. Flex panes use **`min-width: 0`** (not
  `min(token, 100%)` of the full row — that percentage resolves against the
  parent and overflows when both panes are open). Preferred size stays on
  `width` / `flex-basis`. When `.fynns-clipped-nav-shell-main` is ≤32rem
  (container query — works for nested demos), EndAside **overlays** the end
  edge at its min/preferred width (out of flex flow) so both mins stay usable
  without horizontal overflow. Drawer still open + floors overflowing →
  `onNavCrowded` → **close** (`hidden`). Viewport ≤56.25rem → EndAside bottom
  sheet (`max-height: min(52dvh, 22rem)` — usable sheet, not a thin ribbon).
  Narrow viewports keep a **side column** for an open drawer (no rem-capped
  stack above main); geometric crowd still **closes** destinations —
  `DestinationAppShell` never densifies to an unlabeled icon rail.
  Slot-only — destinations stay in `nav`, inspector content in `EndAside`
  children; toggle IconButtons live in the consumer `TopAppBar`. Prefer for
  destination chrome apps. **Not** `Drawer` (modal content side sheet) and
  **not** a revived `Panel` / `ListGroup` shell. Demo: sandbox Layouts
  (`#layouts-demo-shell`).
- **Content:** List / ListItem (main-content M3 rows; selected =
  `secondary-container` + `radius-3xl` like NavigationDrawerItem / Select /
  menu; **host** paints hover/selected wash for the whole row including
  trailing chrome — never a split left/right island; sibling hosts use `--fynns-list-item-gap` (= navdrawer `section-gap` /
  **4dp**) so selected/hover pills do not fuse; **no `Divider` between
  `ListItem`s** (contained list = gap + pills; `Divider` is section/group
  only); **catalog kind** (builtin / readonly) → **leading icon** +
  `trailingSupportingText` / `.fynns-table-meta` — never a start tick, inset
  rail, or second host wash; never wrap `ListItem` in a `div`; **path / link / bookmark catalogs** = one `List` of `ListItem`s —
  headline + path `supportingText` + trailing ghost **md** `IconButton`s
  (`--with-end` **overlay reveal**: idle actions do not reserve flex width;
  `:hover` / `:focus-within` shows the cluster; `(hover: none)` keeps actions
  visible). Interactive trailing is a **sibling** of the row button — valid nesting —
  the **host / row** still paints one `radius-3xl` state-layer so the
  IconButton is not a floating island); headline / supporting ellipsize
  through `Tooltip` wrappers; leading **hugs** the glyph (not a 40dp empty
  column); leading → copy gutter `--fynns-list-gap` (**16dp**, aliases `space-lg`);
  `--with-end` reveal clears copy→first action with `--fynns-list-end-actions-gap`
  (**optical** IconButton overlay ≥ **0.5.62** — disk inset + cluster-gap so
  text ink → first glyph matches glyph↔glyph; IconButton↔IconButton stays
  **4dp** / `control-cluster-gap`, not navdrawer pad-inline / footer Avatar inset);
  overline / headline / supporting stack with
  `--fynns-list-content-gap`
  (**4dp**, aliases `space-xs`; three-line uses `--fynns-list-content-gap-3` /
  **8dp** / `space-sm`);
  timestamp / kind label → `overline`; duration / count →
  `trailingSupportingText` (optional `.fynns-list-item-trailing-stats` for
  multi-metric columns that must align across rows — **not** a flex
  `.fynns-control-cluster`; `--pair` for duration + count; duration units
  **spaced** — `1m 47s`, never `1m47s`); **expandable trees** = row `onClick` + decorative leading
  chevron + `aria-expanded`; nested `List` / `.fynns-table-wrap` = `ListItem`
  **`detail`** (JSX `children` alias; same `<li>` — `ul > li` only); nested `List`
  under `detail` keeps the same inset / item pad as a top-level List (child
  chevron is not flush; `--with-end` chrome is child-only so a parent trailing
  IconButton does not crush nested pad-end); **never** wrap a `ListItem` in
  a `div`, never put a button in `leading` (slot is `aria-hidden`), never a
  `Button` in `headline`; **never** one padded `Surface`/`Card` per entry;
  sidebar destinations use
  `NavigationDrawer` / `NavigationRail` / `NavigationBar` — not deleted
  `ListGroup` / `ListRow`; see **Content density**), Card (`title` /
  optional `icon` / `actions` + body;
  same shell as Collapsible, static head — no collapse / hover layer / chevron;
  title = `--fynns-font-size-md` + medium; body = `--fynns-font-size-sm` /
  body line-height — do not leave both on inherited root size;
  **`actions` = one horizontal IconButton strip** (direct `.fynns-control-cluster`
  is `nowrap` + content width; nested clusters hug — never a tall wrapped stack;
  **interactive chrome only** — never path / branch / mono meta in `actions`);
  `chrome="card"` (default) | `chrome="plain"` nesting host (same outer shell;
  body uses `--fynns-layout-nest-gap` — plain ≠ flush),
  old Media/Header/Content/Actions / variant APIs deleted),
  **Surface** (generic bordered / tonal well; any children; no Card head —
  use for preview wells / stages; default is **content-sized** — `fill` is the
  only path that sets `min-height: 0` for a height-resolved parent; a
  `.fynns-unit-stack` of padded wells inside `FillColumn` must scroll, not
  shrink — crushed ~36px pills with clipped ToggleGroup are this bug, not a
  theme failure), Collapsible (optional `icon` in the chevron slot — header hover /
  keyboard focus-visible swaps to expand chevron; on `(hover: none)` the slot stays chevron-only;
  open: full-bleed hairline under head; focus = quiet Input-like border; same title/body
  type roles as Card; same `chrome` prop — `plain` = nest surface children with nest-gap
  the main shell),
  Carousel / CarouselItem,
  **Chat** / **ChatThread** / **ChatComposer** / **ChatScrollToBottom** /
  **ChatMessage** (`user` | `assistant` | `system`; dual placement main |
  left/right resizable asides — see Feedback keep-set; user bubble
  `--fynns-chatmessage-bubble-max-width` 70% of the message-row host on
  **main** / `radius-22` / body `1rem` — main: 48rem column; **aside**
  (`.fynns-end-aside` / `.fynns-chat-host--fill`): 100% pane + user bubble
  ceiling **100%** so long turns share the composer shell edges; composer
  100% of same host (`radius-3xl`,
  32dp controls + 6dp pad ≈ 44dp shell); soft mins on the
  pane + `--fynns-layout-chat-min-width` on the shell; **avatar omitted by
  default**; `streaming` last-glyph color pulse only with answer text + busy — no LLM; `error` / `onRetry` =
  failed-generation footer — see Feedback keep-set; `thinking` /
  `ChatThinking` = single-block reasoning disclosure (name ↔ bubble; Wave 1)
  — see Feedback keep-set; **`ChatActivity`** / Step / Artifact = Wave 2
  multi-step status tree — see Feedback keep-set; `citations` /
  `ChatCitations` / `ChatCitationChip` = browsing source chips — see
  Feedback keep-set; prefer `ChatMessage markdown` / `ChatMarkdown` (L2 GFM
  subset) — see Feedback keep-set; CJK IME Enter while
  composing does not send — see Feedback **Composer keys**; composer is
  a growing `<textarea>` (not ChatGPT ProseMirror; paste stays plain) — see Feedback
  **composer input model**),
  Divider, Table (+ Head / Body / Row /
  HeaderCell / Cell / Caption; host `.fynns-table-wrap.fynns-scroll` —
  nowrap cells + max-content width → horizontal scroll when narrow, never
  column crush / CJK header shatter; cell mapping kind / status =
  `.fynns-table-meta`, never `Chip` — see **Content density**), DiffView (scrollable unified-diff
  panel — add/del/same/meta lines; caller owns `+`/`-` in text), CodeBlock (**strict chrome** — titled
  `default` **requires** non-empty `label` (filename) + head hairline + copy;
  missing / empty / whitespace `label` **throws**; no title →
  `variant="plain"` (frame + copy in a **reserved end column** — do not pass
  `label` or `label=""`; never pad `.fynns-code-block-pre` in the app to dodge
  the button); `editable` same head rules when `label` is set, omit `label`
  for the same reserved-column copy; live highlight via pre backdrop + transparent textarea —
  `value`/`defaultValue`/`onChange` (local draft + deferred highlight;
  `onChange` coalesced while typing / flushed on blur); editable height
  defaults to **autoGrow** (content-sized from `rows` floor, default `1`,
  up to `maxHeight` — prefer this on PageScroll / Card / Dialog; optional soft
  `maxHeight` only); `autoGrow={false}` **only** for height-resolved **fill**
  hosts that set `textarea { height: 100% }` / FullscreenDialog fill /
  SplitPane editor — never as the default for page catalog file bodies);
  **`label` ≠ `language`** — filename chrome
  does not select a highlighter; always pass matching `language` /
  `highlightProfile` (see [`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md));
  prefer `codeLanguageFromPath(path)` for suffixed file bodies (`.txt` /
  extensionless → `null` → Textarea OK); **`readOnly`** on `variant="editable"`
  renders a **single** `.fynns-code-block-pre` (full token colors + native
  `::selection` — not the textarea overlay). Soft-wrap **edit** with a known
  `language` / `highlightProfile` uses the **deferred token overlay** (dual-layer
  `<pre>` + transparent textarea) — **live syntax colors while typing** (restored
  ≥ **0.5.52**; pre-**3241e15** / Aug 2026 behavior). Token spans can shift soft
  wrap points vs the textarea — native `::selection` may stripe or misalign on long
  wrapped lines; **`wrap={false}`** avoids wrap drift (classic nowrap dual-layer);
  **`readOnly`** keeps full colors with native selection on one `<pre>`. Do **not**
  reintroduce 0.5.38–0.5.50 visual-line mirror bands. **`wrap={false}`**
  still uses dual-layer deferred highlight. Editable highlight spans on the
  nowrap path inherit textarea font-weight (no bold keyword/module metrics).
  `wrap` defaults
  **true** (soft-wrap, no horizontal scrollbar; `wrap={false}` → classic
  `pre` scroll); vertical thumb only when content exceeds the host
  (`data-scrollable`, same gate as ChatComposer — avoids early bars from
  pad / trailing-newline noise); focus = quiet Input-like border
  (`--fynns-focus-border-mix`), not an inset ring;
  supported `language` → zero-dep `--fynns-code-*` spans (`ts`/`js`/`py`/`cpp`/
  `css`/`json`/`xml`/`html`/`bash`/`markdown`/… or consumer `registerHighlightLanguage` /
  `highlightProfile`); unknown → plain mono;
  copy fades in on hover, keyboard via :focus-visible), Stepper, Dropzone, Avatar /
  AvatarGroup
- **Layout helpers:** ControlStack, ControlRow, **ControlBlock** `{ children,
  description?, errorText? }` (control chrome + supporting/error note —
  `--fynns-layout-field-hint-gap`; related Switch + narrative **must** wrap
  here; **single-row** `description` docks in the **label column**, controls
  vertically center on name + hint — not a full-bleed next row), **FieldHint** (muted/error caption;
  prefer via ControlBlock / FieldBlock / Input), FieldBlock / FieldHeader
  (`description?` / `errorText?` under the control), **FieldStack** (**strongly
  recommended** invisible cluster: group consecutive form units by **semantic
  kind** — e.g. all identity FieldBlocks in one stack, all Preference
  ControlBlocks in another — gap `--fynns-layout-field-stack-gap` / 12dp;
  adjacent stacks → `form-cluster-gap` / 32dp; live `#form-recipe`),
  `.fynns-unit-stack`
  (CSS host — purged `UnitStack` replacement; sibling **units** only — not a
  substitute for FieldStack inside forms; children `flex-shrink: 0` so a
  height-capped `FillColumn` / `fynns-scroll` host scrolls instead of crushing
  `Surface` / `Card` wells),
  Grid (`equalCells` makes every
  cell match the largest content width/height via measure),
  **FillColumn** `{ header?, children, footer? }` (vertical fill host for a
  height-resolved parent — shell main / DestinationAppShell canvas / fixed
  stage: `header`/`footer` content-sized, `children` `flex:1` + `min-height:0`;
  put `<Chat>` **or** pane-boot `BusyRegion` `fill` **or** **`PageScroll`**
  (page catalogs; wraps `.fynns-page-scroll.fynns-scroll` →
  `.fynns-content-column`) in `children` so the band absorbs leftover (Chat
  composer docks; loading ring centers; overlay Y rail sits on the **pane**
  edge — page-scroll must be **edge-flush** with the pane; never pad
  `.hub-main` / shell main **around** the scroll host).   Inside page-scroll /
  PageScroll: content column (`max-width` + `padding: dialog-inset` on
  **inline and block** — first Card clears TopAppBar; never invent
  consumer `padding-top` on the first unit). When the **first** child is a
  standalone catalog `ControlRow`, pad-block-start uses
  `--fynns-navdrawer-body-pad-block-start` so that label midlines with the
  active `NavigationDrawerItem` (Layouts `#layouts-demo-shell`; ≥ 0.4.101).
  Never put `fynns-scroll` on the content column
  itself (or on a private `.content` / `.hub-scroll` with `max-width` — rail
  paints on the Card). Page-scroll keeps `padding-inline-end: scrollbar-size`
  for the rail band only. A **long in-Card catalog** may use List +
  `fynns-scroll` + list-well max-height; short catalogs page-scroll.
  **Do not** stack Preview / EmptyState / Composer as canvas siblings — that
  leaves a dead band under content height. Does **not** apply aside bubble
  100% (`.fynns-chat-host--fill` / EndAside stay for that)),
  **SplitPane** `{ start, end, orientation?, size?, defaultSize?,
  onSizeChange?, minStart?, minEnd?, disableResize?, label? }` (in-content
  resizable two panes — editor | preview, list | detail; **not** `EndAside`
  / drawer shell seams. Live drag paints `--fynns-split-size` via rAF;
  host must resolve height. Tokens `--fynns-split-*`. Live `#split-pane`),
  **Tree** / **TreeItem** `{ id, label, icon?, expanded?, defaultExpanded?,
  trailing?, children? }` (hierarchical file / settings explorer —
  WAI-ARIA `tree`; branch row click selects **and** toggles expand; ↑↓ →← keyboard. **Not**
  `NavigationDrawer` destinations and **not** expandable catalog
  `List` / `ListItem` `detail`. Tokens `--fynns-tree-*`. Live `#tree`),
  **Timeline** / **TimelineItem** `{ headline, supportingText?,
  trailingSupportingText?, leading?, detail?, trailing?, interactive?,
  trailingMetaAlign? }` (chronological history **rail** — node + vertical
  line; optional expandable `detail` bullets; org+dates same slots as List.
  **Not** List pills, ChatActivity, Tree, or lettered A/B/C / list-detail
  shells. Node→copy (`--fynns-timeline-gap`) aliases `--fynns-list-gap`
  (**16dp**, ≥ 0.5.6); expandable chevron→copy is **not** that alias —
  `chevron-gap` is the pad-band remainder after `chevron-inset` + icon
  (≥ **0.5.15**, ~4dp). `pad-block` → List (**8dp**, ≥ 0.5.7); hover wash
  starts at `node-col` + `gap` (≥ 0.5.8); content **inner** `pad-inline-start` =
  `radius-md` + `space-xs` (**24dp**, ≥ 0.5.10) so **copy / headline** clear the
  wash curve — never flush to the pill’s rounded start. Expandable chevron
  tucks into that pad band (`chevron-inset` + icon + `chevron-gap`, ≥ **0.5.15**)
  so flat and detail headlines share one start edge. Two-line rows **center**
  the disc on the full `.fynns-timeline-item-copy` stack; rail mid uses
  `--fynns-timeline-copy-band-2` (≥ **0.5.16**). Tokens `--fynns-timeline-*`.
  Live `#timeline`;
  [`.cursor/rules/timeline-catalog.mdc`](.cursor/rules/timeline-catalog.mdc)),
  `measureOverflow` / `overflowsBounds` / `measureContentOverflow` /
  `useOverflowBounds` (dynamic border-box or scroll overflow vs a container or
  the viewport — small public API; prefer over ad-hoc getBoundingClientRect).

  ### Platform targeting (agents — authoritative)

  Labels: **`both`** = any viewport; **`mobile-first`** = prefer on compact /
  phone (pair with a desktop sibling when adapting); **`desktop-first`** =
  prefer on medium+ / pointer (pair with a mobile sibling when adapting);
  **`adaptive`** = same component changes layout by breakpoint or
  `(hover: none)`. Most controls are **`both`**. Only **ClippedNavShell** /
  **EndAside** implement a real viewport break (`max-width: 56.25rem`). Destination
  chrome does **not** auto-swap — the **app** chooses Rail vs Bar vs Drawer.

  **Destination ladder (not duplicates):** phone → `NavigationBar` (bottom) or
  intentional `NavigationRail` as a **standalone** phone root (not
  DestinationAppShell densify); wide labeled →
  `NavigationDrawer` `standard` inside **DestinationAppShell** (desktop default;
  open drawer or fully hidden — never unlabeled rail intermediate);
  overlay → `modal`. Live composed default: sandbox **Layout templates**
  (`#layouts-demo-shell`). Standalone Rail/Bar demos on that page are parts —
  not a desktop greenfield root.

  | Symbol | Platform | Notes |
  | --- | --- | --- |
  | DestinationAppShell | adaptive | **Default greenfield chrome.** Declarative destinations + TopAppBar + optional EndAside + optional `navFooter` (settings in drawer footer). Destinations **binary**: labeled resizable drawer or fully `hidden` — **no** icon-only rail densify (`onNavCrowded` closes). Prefer over hand-composed ClippedNavShell. **Flat root destinations only** — any drill-in / dynamic drawer body → hand-compose `ClippedNavShell` + app state (live `#layouts-demo-drill-in`); there is no `NavStack` primitive. |
  | TopAppBar | both | **Edge-flush** page header (`border-radius: 0`, no card frame). Slot into `ClippedNavShell.topBar` / DestinationAppShell — shell adds bottom hairline only. Floating rounded strips → `Toolbar`. |
  | BottomAppBar | mobile-first | Bottom **actions** + optional FAB — not destinations. |
  | StatusBar | desktop-first | IDE status strip under shell (~22dp). Not BottomAppBar / Banner. Live `#status-bar`. |
  | Toolbar | both | Contextual actions (`docked` / `floating`). |
  | NavigationBar | mobile-first | Bottom **destinations** (phone). |
  | NavigationRail | mobile-first | Vertical destinations for **intentional** phone / icon-column roots only. **Never** DestinationAppShell / ClippedNav crowding densify, and **never** the default desktop app root. Standalone Layouts demo `#layouts-demo-navigation-rail`. |
  | NavigationDrawer | adaptive | `standard` = medium+ permanent; `modal` = overlay. Destinations only. **Desktop default** inside DestinationAppShell. Optional `NavigationDrawerGroup` (collapsible; leading icon any ReactNode; collapsed + active leaf → selected pill on trigger; group body `aria-labelledby` the label) or static `NavigationDrawerHeadline`. Sheet `headline` prop = **static title only** (plain text) — **never** a back `IconButton`, bulk toolbar, or bare count row (`hub-row`); mode exit → `TopAppBar` `leading` / `leadingExtra` (Layouts `#layouts-demo-shell` decorative; **`#layouts-demo-drill-in`** interactive drawer-body swap + full-width main). Catalog list-in-drawer (not main `list-pane-width` split) is the destination-app default — see CONSUMER_TREATY **hub-split**. Group/Item `label` = **short name only** — no `· N` and no parenthetical glosses unless the user explicitly asks; unread → Item `badge` only when required. Sibling Item / Group / Headline gap = `--fynns-navdrawer-section-gap` (**4dp**, same inside Group). SearchBar / tools / SyncSideFilter `ToggleGroup` / `--toolbar-end` chrome ↔ peers & destinations = `--fynns-navdrawer-search-gap` (**8dp**, aliases layout `control-stack-gap` — ≥ 0.4.98; wider than Item↔Item 4dp; not a 16dp kind-jump). Optional sheet `footer` = Cursor-style account chrome (`.fynns-nav-drawer-footer*`; settings IconButton end — not TopAppBar `trailing` for that role; DestinationAppShell `navFooter`). Tools under SearchBar = **one** .fynns-control-cluster of Tooltip→IconButton (horizontal) — tip-fill width:100% applies only to Tooltip wrapping NavigationDrawerItem. **Never** wrap destinations in `.fynns-unit-stack`. |
  | ClippedNavShell | adaptive | Low-level layout: full-bleed TopAppBar + nav\|main; `drawer`\|`rail`\|`hidden`. Prefer DestinationAppShell for greenfield. Use this shell when the drawer body must **morph** (catalog / chats drill-in) — swap `nav`, keep main full-width detail; live `#layouts-demo-drill-in`. Narrow `hidden` with an empty nav slot stays **one** main row (no empty second track under main / EndAside). |
  | EndAside | adaptive | Inspector width morph + desktop leading-edge resize (min/max clamp; sheet path hides handle); flex `min-width: 0` + child `max-width:100%`; main ≤32rem → end-edge overlay; ≤56.25rem → bottom sheet (`min(52dvh, 22rem)`). Not Drawer. |
  | Banner / SearchBar / SkipLink / Breadcrumb / Pagination / Fab / FabMenu | both | Chrome utilities. Pagination footer = `.fynns-pagination-bar` (M3/MUI single row). Live `#pagination` / `#fab`. |
  | Drawer | desktop-first | Modal **content** side sheet. Phone → BottomSheet. ≠ NavigationDrawer. Head: **no** head|body divider / no `surface-head` strip (single surface with body). |
  | BottomSheet | mobile-first | Bottom content sheet. Desktop → Drawer. Drag handle identifies the sheet; header has **no** head|body divider. |
  | FullscreenDialog | mobile-first | Full-viewport dialog. Short tasks → Dialog / ConfirmDialog. Head: **no** head|body divider / no `surface-head` strip (`content-inset` pad only). Body: **flush-start** when the first child is a keep-set bordered well — see **Flush-start overlay body**. |
  | Dialog / DialogShell / ConfirmDialog | both | Centered modals. M3 basic + optional close on `Dialog`; dismissible labeled rows = `showCloseButton` + full-width ControlStack (Switch track aligns with CloseIcon glyph, not hit box). Centered Dialog head: **no** head|body divider; non-confirm head pad-block-start `dialog-inset/2` + end `0` + `head + body` pad-top `space-sm`; **ConfirmDialog** title pad-block-start full `dialog-inset`. Date/Time picker dialogs: **no** head hairline (picker head pad may stay picker-specific). |
  | DropdownMenu / snackbar / SnackbarHost / BusyScrim / BusyRegion | both | Menus / feedback / busy. |
  | CommandPalette | both | Spotlight / ⌘K filter dialog; apps own accelerator; keyboard-first list. Live `#command-palette`. |
  | ContextMenu / Tooltip / InfoHint | desktop-first | Pointer / hover-first; touch apps need care. |
  | Button → Grid / FillColumn / PageScroll / SplitPane / Tree / Timeline (form / selection / action / layout keep-set) | both | FillColumn = vertical fill host; PageScroll = pane-edge catalog scroll; SplitPane = in-content resize (not EndAside); Tree = file/settings hierarchy (not nav destinations / not List detail); Timeline = chronological rail (`#timeline` — flat + detail only). |
  | Card / Surface / List / ListItem / Timeline* / Divider / Avatar* / Carousel* / EmptyState / Chat* / ChatMessage / ChatThinking / ChatActivity* / Progress* / BadgedBox / InlineAlert / Date* / Time* / measureOverflow* | both | Content / data. Timeline = chronological rail (`#timeline`) — not ChatActivity / List fake rails. |
  | Collapsible / CodeBlock | adaptive | `(hover: none)` changes disclose / copy visibility. |
  | Table* | desktop-first | Wide tables; narrow = **horizontal scroll**, not reflow. Host in `.fynns-table-wrap.fynns-scroll`; cells are `nowrap` + table `width: max-content; min-width: 100%` so dense columns / CJK headers do not crush or character-stack. |
  | Dropzone | desktop-first | Drag-drop primary; file input still works on touch. |
  | Stepper | both | `orientation` is caller-chosen — no auto breakpoint. |

  **Content density (data → component — hard for agents):** Pick the keep-set
  host by **data shape**, not by “everything is a Card.” Fat padded
  `Surface`/`Card` per catalog row is a consumer failure mode (see
  [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)). Live: sandbox `#list`
  (anatomy + path catalog).

  | Data shape | Use | Do **not** |
  | --- | --- | --- |
  | Name + path / subtitle + optional row actions (bookmarks, custom links, file shortcuts) | One `List` of **two-line** `ListItem`s (`headline` = display name in **UI font** — never mono on CJK/mixed labels; `supportingText` = path, mono OK; kind → **leading icon only** — **never** `overline` on path/shortcut catalogs (`overline` forces `height-3` / ~88dp and reads as vacant band; freshness / builtin → `trailingSupportingText` / `.fynns-table-meta` — **not** `Chip`; `trailing` = `.fynns-control-cluster` of `IconButton` `ghost` **md** (default) + `Tooltip`, **horizontal nowrap**). **`--with-end` overlay reveal** — idle row copy fills width; hover / focus-within shows trailing; touch always visible. Trailing **actions** stay on the **end sibling** even when `interactive={false}` (static row + open/folder); decorative chevron / count stay **in** the row. **Same destination page:** catalog `ControlRow` strip + List trailing share one IconButton `size` (**md** default). **Never** `Divider` between `ListItem`s — `--fynns-list-item-gap` + host pill. Destructive → `ConfirmDialog`, not a filled danger disk in the row. No `tip-fill` / `tip-grow` on the headline Tooltip. **Scroll:** `.fynns-page-scroll.fynns-scroll` **edge-flush** with the pane (FillColumn / `hub-main` — never pad that ancestor horizontally) + inner `.fynns-content-column` (max-width + dialog-inset pad) — **not** `fynns-scroll` on the max-width column, and **not** a nested Card scrollport on a short list. Long catalogs only: List + `fynns-scroll` + `max-height: var(--fynns-layout-list-well-max-height)` / `-sm` (shipped — never invent the name). Live: `#list` / `#page-scroll` | One `Surface`/`Card` per entry; **`Divider` between rows** of a contained List; actions under the text in a second row; `unit-stack` of single-item Lists; mono headline tofu; tip-fill breaking ellipsis; `Chip` as origin/kind in the headline; IconButton trailing crushed into the 16dp `trailing-icon` slot (`interactive={false}` vertical stack); nested Card `hub-scroll` + invented `--fynns-layout-list-well-*` on a one-row List (phantom scroll chrome); scroll host = content max-width column; padded `.hub-main` around page-scroll (rail floats inset from pane); **always-visible trailing** reserving flex on wide idle rows (sparse middle); **ControlRow md + List trailing sm** on the same page |
  | Expandable catalog (session / turn tree + nested records) | Same `List`: **direct** `ul > li`. Timestamp / kind → `overline`; name → `headline`; path → `supportingText`; duration / count → `trailingSupportingText` (duration units **spaced**: `1m 47s`, never `1m47s`). **Multi-metric trailing** (elapse \| tokens \| cost \| count that must **column-align across rows**) → `.fynns-list-item-trailing-stats` (fixed CSS grid tracks; `--pair` for duration + count only) — **not** a flex `.fynns-control-cluster` (content-width cells drift per row). Expand = row `onClick` + decorative leading chevron + `aria-expanded` (do **not** `selected` for open). Nested `List` or `.fynns-table-wrap.fynns-scroll` → `ListItem` **`detail`**. Parent **`trailing` `--with-end` IconButtons** dock to the **row shell** only (≥ **0.5.66** — not vertically centered on parent+detail host). Open-record / group actions → trailing `IconButton` cluster (same row chrome). Long copy → `Tooltip` on headline; core ellipsizes. Live: sandbox `#list` | `ul > div` around items (**Collapsible / Card / unit-stack as List children** — illegal nesting; flex-shrink + `overflow: hidden` crushes groups to ~19px “skeleton” pills); orphan `ListItem` outside `List`; raw `<button>` / `HubTreeDisclosure` in `leading`; `ControlRow` in trailing; `Button` in headline; nested table `width:100%` + `table-layout:fixed` + `overflow-x:hidden`; cell or headline `Chip` as status; consumer `width: max-content` / `tip-grow` on headline (breaks `…`); trailing IconButton as a second highlight island; **`--with-end` actions mid-gap over nested children** (core &lt; 0.5.66); glued duration `1m47s`; flex cluster for multi-stat trailing that must align across rows |
  | **Title + organization + date range** (experience / job / internship records) | Two-line `ListItem` / **`TimelineItem`**: `headline` = role/title; `supportingText` = **organization only**; date range → **`trailingSupportingText`** (ASCII hyphen ranges: `2025-10 - 2026-03` — **no** `·` / `–` / `—` glue); parent **`List` / `Timeline` `trailingMetaAlign="start"`** — shared min-width column; box **and** glyph **start** edges align (**start-ink** ≥ **0.5.13** — not 0.4.148 end-ink that parks short dates at the column end). Live: `#list` org+dates / `#timeline` | Gluing org + dates with `·` / `–` / `—` in `supportingText`; inventing a third text column; private `text-align` / width hacks; omitting `trailingMetaAlign="start"` on mixed-length date catalogs; pinning core &lt; 0.5.13 (end-ink staggered short vs long dates) |
  | **Short status + row action** (e.g. Current + delete) | Same `ListItem` slots: short `trailingSupportingText` + `--with-end` IconButton(s). **Omit** `trailingMetaAlign` so meta stays content-width. Core ≥ **0.4.121** reserves `--with-end` pad for **1** md IconButton by default (2 when the cluster has a second child). ≥ **0.5.62** optically spaces status→first disk so text→glyph air matches glyph↔glyph in the cluster — do not invent private meta margins. Live: `#list` status+action / `#sandbox-list-status-action` | `trailingMetaAlign="start"`; core &lt; 0.4.121 always-2-icon pad; status kissing the first disk while icon↔icon looks wider; inventing private end margins |
  | **Inspector row: kind Select ± gap CTA** (catalog line + remap / assist) | Same `ListItem`: overline / headline + optional short `trailingSupportingText` + trailing `.fynns-control-cluster` of optional labeled `Button` `sm` + `Select` (content-hug). Core ≥ **0.5.54** pins in-flow; ≥ **0.5.55** end pad ≥ `radius-3xl`; ≥ **0.5.56** gap meta in end strip; ≥ **0.5.67** meta|CTA|Select gaps **8dp** (`inspector-end-gap`); ≥ **0.5.70** inline form Select shell (not absolute flyout); ≥ **0.5.71** end strip `flex-start` pins meta|CTA on trigger band when expanded. Leave `trailingMetaAlign` unset. Live: `#list` inspector trailing | Select+Button overlay stack; Select clip; meta drift; 4dp kiss; absolute flyout overlapping sibling rows; **gap meta mid expanded panel**; private position hacks |
  | **Status + identity + duration on one row** (run / job / experiment history) | **Single-line** `ListItem` (no `supportingText` / no `lines={2}` stack). `headline` = **one** `.fynns-control-cluster` of `.fynns-list-item-status` (Success/Failed pill — **not** `InlineAlert` / `Banner` / `Chip`) + identity (`__grow` ellipsis; mono OK for model ids) + **one** duration meta (`.fynns-table-meta`; units **spaced** — `1m 47s`; wrap label in `<span>`). Cluster gap = `--fynns-layout-control-stack-gap` (**8dp**, ≥ **0.4.142**). Headline `.fynns-table-meta` = **fixed** track (`elapse` + optional **one** icon) + **start** align (≥ **0.4.143**); overflow ellipsizes the label span (≥ **0.4.145**). **One metric per cell** — second metric (tokens) → **sibling** `.fynns-table-meta` (tokens track) or `.fynns-list-item-trailing-stats` — never jam latency+tokens in one cell. Timestamp → `trailingSupportingText` on parent **`List` `trailingMetaAlign="start"`** (start-ink ≥ **0.5.13**; ellipsis ≥ **0.4.145**). Open → `trailing` chevron / IconButton. Live: `#list` run-summary | `lines={2}` status/metrics stack; `InlineAlert` in headline; jamming latency+tokens into one `.fynns-table-meta`; bare text (no `<span>`) so icon+copy cannot ellipsize; private `text-align` / width; omitting `trailingMetaAlign="start"` on timestamp catalogs |
  | **Catalog row create / edit** (Experiences / Applications-style records on the main canvas) | Keep the `List` / **`Timeline`** mounted. Row click / `+` → **`Dialog` `size="lg"` + `showCloseButton`** + `FieldStack` form (parity with `#form-recipe` / `#timeline`). **Timeline:** edit + delete live **in the Dialog** — not rail `--with-end` IconButtons. List path / status+action catalogs may still use trailing pencil/trash. Multi-Card long workflows may use **`FullscreenDialog`** (leading X) — still an overlay. Destructive → `ConfirmDialog`. Live: `#timeline` flat → Dialog; `#list` status+action; `#form-recipe` Dialog host | Unmount the list/timeline and replace `PageScroll` with a detail view whose only exit is a ghost text “back” / “All …” `Button` in a `ControlRow` (no Dialog close, no TopAppBar back); inventing a parallel destination id for every edit; mixing Dialog on one catalog and silent page-swap on a sibling catalog; Timeline hover pencil/trash as the edit path |
  | **Dashboard / overview shortcut links** | **One** `Card` (`title` + `actions` = IconButtons — **not** a tonal Button strip in the body) wrapping **one** path/link `List` (leading kind icon + headline + real path `supportingText` + trailing open — **no** `overline`). Live: `#list` shortcut Card. **No** `ShortcutPanel` primitive | Card body = Button cluster + List of headline-only / “稍后接入” rows (reads empty); inventing a parallel shortcut host; path/shortcut rows with `overline` |
  | Catalog kind (builtin / readonly) | **Leading icon** + `trailingSupportingText` / `.fynns-table-meta`. Selected = host pill only — **no** start tick / inset rail / second wash. Headline = **UI font** (not mono). Leading→copy `--fynns-list-gap` (**16dp**). Live: `#list` kind rows | Start ticks / inset rails / `hostClassName` wash; wrap `ListItem` in `div` (`ul > div > li`); `Chip` as kind; `mono` on catalog display names; private gaps crushing icon↔copy |
  | List row type stack | Two-line: `--fynns-list-content-gap` (**4dp**). Three-line (overline + headline + supporting): `--fynns-list-content-gap-3` (**8dp**). Leading→copy: `--fynns-list-gap` (**16dp**). Preceding **text** → first `--with-end` IconButton: optical `--fynns-list-end-actions-gap` (≥ **0.5.62** — disk inset + `control-cluster-gap` so ink matches glyph↔glyph; IconButton↔IconButton stays **4dp** box). Live: `#list` status+action | `gap: 0` under title; inventing private list gaps; 40dp empty leading column; status kissing the first disk; calibrating meta→icon to navdrawer 10dp / footer Avatar inset |
  | App destinations (nav) | `NavigationDrawer` / `Rail` / `Bar` (or `DestinationAppShell`) | `List` / `Card` as the app root nav |
  | Multi-column records / sortable grids | `Table` in `.fynns-table-wrap.fynns-scroll` inside **`Card` `title`** | `Surface` + `FieldHeader` as a fake section head; Card grid of the same rows when a table fits |
  | Table cell: mapping kind / status + optional id + trailing action | `.fynns-table-meta` (muted caption) + optional mono id in `.fynns-control-cluster--end-align`; if the middle is missing, insert `.fynns-control-cluster__grow` so the action shares one trailing edge across rows. Live: sandbox `#table` | `Chip` (`suggestion` / `filter`) as a status pill in the cell; unmapped rows leaving the action flush-start |
  | Form / preference options | `FieldStack` (+ `Divider` on kind jumps) inside `Card` / Dialog — `#form-recipe` | Flat Card-per-field; fat Surface list of FieldBlocks |
  | Settings Card scope / field policy copy | **Compress:** Card `actions` **`InfoHint`** (≤1) for section scope; **`FieldBlock` `actions` `InfoHint`** for field policy; **Tooltip** on row **IconButton** for reload/cache behavior. **`FieldHint` / `description`** = one short line only (validation / format / empty). Live: `#field-header` | Card-body `<FieldHint>` essay before `FieldStack`; multi-sentence `FieldBlock` `description`; duplicate same copy in hint + tooltip |
  | Select + reload / refresh beside dropdown | `FieldBlock` + `.fynns-control-cluster--end-align` + Select `className="fynns-control-cluster__grow"` + `IconButton` **`size="sm"`** when the field label row has `InfoHint` `size="sm"` (same Card trailing icon column — hover-disk **end edges** share one vertical line with FieldHeader actions and ControlRow probe InfoHints; do **not** leave refresh at default `md` 40dp). **Form title text-start (hard):** when the same Card / Dialog mixes `FieldBlock` / Select / Input with preference or probe `ControlRow`s, `ControlRow` **label** glyphs share one flush start edge with `FieldHeader` / FieldBlock **titles** (core ≥ **0.5.58** — reverses 0.4.138 ControlRow inset). Select / Input **value** text stays inset inside the shell; do **not** pad ControlRow labels to chase value ink. Reload/policy copy in **Tooltip** (action) + optional **`InfoHint` on label row** — not `FieldBlock` `description`; `#field-header` | `Select.trailing` beside chevron; **ControlRow label inset vs FieldHeader** (0.4.138 residue); `FieldBlock` label-row refresh; private `align-self`; Card-body / `FieldBlock` **FieldHint** essays for session or reload policy; **sm InfoHint + md refresh** in one Card (disks jump left/right) |
  | **Repeatable multiline rows** (bullet / highlight list in Dialog — Textarea + remove per row) | **`FieldBlock` + `FieldStack`**; each row = **one** `.fynns-control-cluster.fynns-control-cluster--end-align` with `Textarea` `className="fynns-control-cluster__grow"` + trailing `Tooltip` → `IconButton` (delete **vertically centered** on the autoGrow well — core ≥ **0.5.30**; Select + refresh stays trigger-band `flex-start`). **Add row** → `FieldBlock` `actions` on the label row (`Tooltip` → ghost `IconButton` `sm` — not a body-foot end-align strip). Default `.fynns-control-cluster` is `flex-wrap: wrap` — tall autoGrow Textarea **wraps** the IconButton to the next line without `--end-align`. Live: `#form-recipe` Highlights | Bare `.fynns-control-cluster` (remove parks under the well); delete top-pinned on multi-line wells; add `Button` parked below the stack; ListItem / `--with-end` hover chrome for static catalog rows; private margin to fake inline delete |
  | **Multi-Card workflow in Dialog** (`size="lg"` inspector / multi-step) | Several `Card` / `Divider` / `InlineAlert` **siblings** in one `.fynns-dialog-body` — core ≥ **0.5.32** keeps direct children `flex-shrink: 0` so the **body scrolls** instead of crushing Cards to head height (`overflow: hidden` clip). Optional single `.fynns-unit-stack` wrapper is also OK. Live: `#form-recipe` **Open Dialog Card stack** | Cards ~49–69dp tall with body clipped; only title visible; private Card `min-height` / dialog-body flex hacks; mistaking it for one Card “overflow” while earlier Cards are squashed |
  | Toolbar strip (name + Switch/Toggle + note) | `ControlStack` / `ControlRow` / `ControlBlock` `description` — `#rhythm` (hint in **label column**; cluster vertically centered) | Hand-rolled flex; FieldHint as a full-bleed next row (empty band, controls sit high) |
  | **Catalog list chrome** (section name + count \| IconButton strip — e.g. `Servers (3/3)`) | Standalone `ControlRow` (fills host: label `1fr`, actions end-hug) + **one** `.fynns-control-cluster` of **`md`** `IconButton`s (overflow / sort menus → `DropdownMenu` **`iconOnly`**). **Same destination page:** match List `trailing` `size`. Live: `#rhythm` catalog strip | `ControlRow` as content-sized island (actions float mid-left); loose IconButton siblings without a cluster; private `hub-spread` / `space-between` for the same job; bare labeled `.fynns-btn` DropdownMenu beside IconButtons (48×40 pill vs 32dp circle) |
  | **Chrome locale switch** (English ↔ 中文 UI chrome) | Settings body (`navFooter` gear): `FieldBlock` + compact **`ToggleGroup`** (`showCheck={false}`; `English` / `中文`) — sandbox `LanguageSwitcher`. Live: `#layouts-demo-shell` Settings + Templates | TopAppBar `trailing` language control (`ToggleGroup` **or** `Select` / chevron); inventing a core LanguageSwitcher primitive |
  | **Action footer / end-aligned button strip** (no visible name — Import / Export / rebuild / apply) | One `.fynns-control-cluster.fynns-control-cluster--end-align` (`justify-content: flex-end` — IconButton strips need no `__grow`; add `__grow` only for a leading Select / meta filler). **Labeled Button** feet use `--fynns-layout-action-cluster-gap` (**8dp**, ≥ **0.5.52**) — same as `.fynns-dialog-foot`; IconButton / Select+refresh clusters keep `control-cluster-gap` (**4dp**). **Dialog body** foot (several labeled Buttons): same cluster as last body child — core ≥ 0.4.111 wraps inside the clipped scroll host so the first action is never clipped. **LTR button order (hard):** **Cancel / dismiss first** (leftmost in the end-aligned cluster) → optional secondary → optional **destructive** → **primary / confirm last** (rightmost). Same as `ConfirmDialog` (ghost Cancel then confirm). Never put Delete leftmost when Cancel is present (`Delete | Cancel | Save`). `Tooltip` → `IconButton` trailing strips use the same host (core ≥ 0.4.93 keeps 40dp circles). **Busy (hard):** at most **one** `Button`/`IconButton` `loading` in the cluster; siblings `disabled` without a spinner — never bind the same `busy` to every `loading`. Live: `#timeline` edit Dialog foot; `#form-recipe` Dialog multi-action foot; `#rhythm` end-align | `ControlRow` with empty `label=""` (fake label column + mid-left island); private `hub-spread` / `space-between`; `--end-align` without expecting trailing dock (core ≥ 0.4.90 pins flex-end); private width hacks on `.fynns-btn--icon`; Dialog body `overflow-x: visible` hacks; **twin loading rings** on Probe + Start / Copy + Import; **Delete leftmost** ahead of Cancel; **4dp pill-on-pill** labeled Button feet (use core `action-cluster-gap`, not `control-cluster-gap`) |
| **Mode drawer tools** (sort menu + primary new — no SearchBar above destinations) | One `.fynns-control-cluster.fynns-control-cluster--toolbar-end` (nowrap, trailing hug). LTR: secondary ghost tools first (sort / refresh / bulk **`ListChecksIcon`**) → **primary New/Plus `IconButton` last (rightmost)** — same primary-end rule as Dialog feet (≥ **0.5.60**). Bulk enter / multi-select → **`ListChecksIcon`** — **never** `ClipboardIcon` (copy/paste). **Section / destination help (hard ≥ 0.5.63):** at most **one** page-scope `InfoHint` in **TopAppBar `trailing`** — do **not** also park a section `InfoHint` in `--toolbar-end` (twin “i” = information redundancy). Field-level `InfoHint` on a preference `ControlRow` (hide-builtin) stays OK. Sort trigger **not** `ChevronDown`. Live: Layouts `#layouts-demo-shell` (TopAppBar InfoHint) + `#layouts-demo-navigation-drawer` mode sample | Full-width default cluster start-packed above first `NavigationDrawerItem` (reads as stray group chevron / overlap); chevron sort icon beside `NavigationDrawerGroup` expanders; **primary Plus parked mid-strip** (bulk after New); **Clipboard for「批量选择」**; **TopAppBar「页面说明」+ drawer「…说明」 twin InfoHints** |
| **Bulk-select drawer / list rows** (multi-check catalog in mode sidebar or List) | **`Checkbox`** in `NavigationDrawerItem` `icon` or `ListItem` `leading`; **`checked` must not drive `active` / `selected`** (≥ **0.5.65**) — one open destination may keep a single `active` pill; all-selected stays default row + checkbox only (no `secondary-container` wall). Live: Layouts `#layouts-demo-navigation-drawer` third column | `active={checked}` / `selected={checked}` on every row; all-select paints a teal pill stack; using `active`/`selected` as the multi-select signal |
| **Mode drawer preference** (hide built-in / long policy toggle in ~224px tools column) | One **`ControlRow`** + **`InfoHint` `size="sm"`** + track-only **`Switch`** (`label=""` + `ariaLabel`) — paragraph in Tooltip, **not** `ControlBlock` `description`. Live: same Layouts sample + Globals `#info-hint` | `ControlBlock` + multi-sentence `description` (~102dp tall stack above destination list) |
| **Mode drawer SyncSideFilter** (compact `ToggleGroup` between toolbar and catalog) | **Omit option `tip`** (keep `ariaLabel` / visible labels) — ≥ 0.4.97. **`showCheck={false}`** when labels are mark glyphs (C / O) — default check slot + optical translate used to bleed into “全部” (≥ 0.4.100 also clips chips). Body sibling gap to tools / destinations = `--fynns-navdrawer-search-gap` (**8dp**, ≥ 0.4.98 — not Item `section-gap` 4dp). Live: Layouts `#layouts-demo-navigation-drawer` | Any `tip` collides with sort/+ or EmptyState; tools↔filter crushed to 4dp `section-gap`; default `showCheck` wash bleed onto next mark |
  | Titled section shell | One `Card` (`title` / optional `icon` / `actions`) wrapping the **list or form**. `title` = **short section name only** — counts / branch / path → **body** (`.fynns-table-meta` / mono), never a title `fynns-control-cluster` of name+tally (glued `OpenSpec8`). Header `actions` = **interactive chrome only** (one horizontal `.fynns-control-cluster` of `IconButton` / `Button` / **at most one** `InfoHint` — nowrap under `.fynns-card-actions`); nested helper clusters hug + nowrap. Prefer **flat** IconButtons in `actions` (not nested clusters). **Do not** park ToggleGroup / labeled segmented controls in Card ctions (move to body ControlRow / FieldBlock; overflow secondary icons into DropdownMenu iconOnly More). Lead prefers ~40% flex-basis but **yields** (min-width: 0) so a dense IconButton strip never clips under Card overflow: hidden (≥ **0.5.57**) — long titles ellipsize. **InfoHint density (hard):** ≤1 help “i” in `actions`; `content` = **short tip** (≈1–2 sentences / ≤~120 chars preferred) — never twin InfoHints (include vs exclude) and never multi-topic essays in the bubble; longer / split topics → Card **body** `FieldHint` / `InlineAlert` / unit-stack bullets. **Form trailing chrome column (hard — not icons only):** in one strip (`.fynns-top-app-bar-trailing` / leading+trailing of one TopAppBar, `.fynns-card-actions`, one `.fynns-control-cluster` of icon chrome, **or the same destination page’s catalog `ControlRow` + List `trailing`**) **and** in one Card **body trailing chrome column** that spans components (`FieldBlock` / `FieldHeader` `actions` InfoHint, `.fynns-control-cluster--end-align` refresh `IconButton`, ControlRow trailing InfoHint **or lone `.fynns-table-meta`**) every trail cell shares the **same** box size — IconButton / icon `InfoHint` use one `size`; lone status meta (`-` / `OK` / `Fail` without a sibling tip) occupies that same trail box (core ≥ **0.4.137** centers the glyph in `--fynns-form-trail-chrome`). End-docked cells share **one vertical end edge** (same size ⇒ same left edge too). Think grid columns: Select+refresh and probe rows’ trailing cells align as one trail track — not “icons lock” while meta floats as a thin end glyph. Default page chrome / TopAppBar = **`md` (40dp)**; dense form field headers / probe rows = **`sm` (32dp)** — when the label-row InfoHint is `sm`, the Select-row refresh and ControlRow InfoHints in that Card stay `sm` (never default `md` refresh under `sm` InfoHint). Dense Card heads may use `sm` only when **every** icon in that head is `sm`. Never mix `sm` + `md` in the same strip or the same Card trailing column (e.g. InfoHint `sm` at left≈810 beside refresh `md` at left≈802). **CatalogMorph / mode-sidebar detail** (drawer `--toolbar-end` already `sm`): Card `actions` IconButtons / icon SplitButtons **must** be `size="sm"` (32dp) so head chrome matches the mode tools — default `md` (40dp) overfills the Card head (agents-hub workflows lesson ≥ **0.5.62**). Root destination pages without mode tools still prefer TopAppBar-matched Card head `md`. Live: `#card` actions strip + `#field-header` (label InfoHint + refresh + probe OK/Fail + idle `-` meta all on the `sm` trail) + `#list` / `#rhythm` catalog strip. | Card/Surface **inside** each ListItem; nested `width:100%` / wrap clusters stacking IconButtons into a ~72dp tall head; raw path/branch/count in `title` or `actions`; narrow host that leaves the lead ~one glyph wide; **two+ InfoHints** in one head; long paragraph tips; **mixed 32/40 trail cells** (icons or lone `.fynns-table-meta`) in one bar, one Card head, **or one Card body trailing column** |
  | Untitled well / stage / preview | `Surface` | Surface as a substitute for List rows |
  | **In-content editor \| preview / list \| detail** (resizable) | **`SplitPane`** (`start` / `end`; optional `orientation`). Host must resolve height. **Not** `EndAside` (shell inspector). Live `#split-pane` | Hand-rolled flex + private resize handles; using EndAside inside a Card for a local split |
  | **File / settings hierarchy** (folders + leaves, keyboard tree) | **`Tree`** / **`TreeItem`** (`role=tree`). Branch row click selects **and** toggles expand. Live `#tree` | `NavigationDrawer` / `NavigationDrawerGroup` for app destinations; expandable catalog `List` + `ListItem` `detail` for session/record trees; inventing `HubTreeDisclosure` |
  | **Chronological timeline** (dated history + vertical rail) | **`Timeline`** / **`TimelineItem`**: `headline` / org `supportingText` / dates `trailingSupportingText` + `trailingMetaAlign="start"` (**start-ink** date column ≥ **0.5.13**); optional `detail` bullets (**read** disclosure only). Sandbox teaches **exactly two** unlabeled shells — **flat** and **with `detail`**. **Catalog edit (default):** flat row `onClick` → **`Dialog` `size="lg"` + `showCloseButton`**; edit fields + delete live **in the Dialog** (foot **Cancel → Delete → Save** LTR ≥ **0.5.17** / `ConfirmDialog` for destroy) — **not** `--with-end` hover IconButtons on the rail, **not** row-parked pencil/trash. Prefer **omit `leading`** (default disc); kind / role chrome belongs in the Dialog (`Select` / fields), not node glyphs + hover reveal. When the row also opens an edit Dialog, prefer **flat** (put long bullets in the Dialog body — avoid dual click = expand + edit). Node→copy = `--fynns-list-gap` (**16dp**, ≥ 0.5.6); hover wash = `node-col` + `gap` (≥ 0.5.8); content inner breath `--fynns-timeline-pad-inline-start` = `radius-md` + `space-xs` (**24dp**, ≥ **0.5.10**) to the **headline** start; expandable chevron tucks into that band (`chevron-inset` + icon + `chevron-gap`, ≥ **0.5.15**) so flat ↔ detail titles share one start edge; two-line disc **centers on** `.fynns-timeline-item-copy`; rail mid `copy-band-2` (≥ **0.5.16**). Live `#timeline` | List start tick / inset rail / `::before` fake chronology; **ChatActivity** / **Tree** for role/org/date rows; lettered **A/B/C** / **`list-detail`** comparison shells; private pad on `.fynns-timeline-*`; hover pill that kisses the node **or** flush chevron/text inside the wash; **Timeline `--with-end` edit/delete IconButtons** (List path-catalog hover chrome on a rail); stacking leading kind icons + hover actions as the default recipe; **end-ink** date column (short dates park at column end); disc only on title line (not copy mid); detail headlines shoved right of flat by a full chevron column; **Delete leftmost** ahead of Cancel in the edit Dialog foot |
  | Empty catalog | `EmptyState` (optional suggestion `Chip`s). **Pane sole body** → `fill` so copy centers in the canvas (live `#empty-state` fill stage / Layouts `#layouts-demo-drill-in`). Inside Card / List / `ChatThread.empty` → default (no `fill`) | A lone tall empty Card; **EmptyState as a loading shell** (use `BusyRegion` `fill`); content-sized EmptyState as the only DestinationAppShell canvas child (parks top — not centered) |
  | Table / list pager (page-size + `Pagination`) | **`.fynns-pagination-bar`**: one footer row — `__start` = content-hug Select + range, `__end` = nowrap `Pagination` (M3 data-table / MUI TablePagination). **Never** wrap start/end onto two rows when narrow — add `fynns-scroll` and let the bar scroll inline. Live `#pagination` | Vertical Card-body stack of Select then pager; private space-between that grows Select (`width:100%` / `1fr`) and wraps page discs; `flex-wrap` two-line footer |
 | Multi-status / probe strip (behind / CI / protection / connection OK·Fail) | `ControlStack` of `ControlRow`s (`label` = short name; children = short `OK`/`Fail`/`-` **or** tip glyph + **`InfoHint`** for the long reason / installed list / proxy URL; **Fail** → `InfoHint` `tone="danger"`). Form-host → label-fill + end-hug. Live: `#rhythm` status legend | `.fynns-unit-stack` of `FieldHint` essays (`Name: Fail — …Installed: …`); flat cluster of mono labels + icons; Fail row uses default white InfoHint; dumping diagnostics into visible body copy |
 | Named readiness / tip status (config OK, sync OK) | Same: Card-body `ControlRow` (`label` = short name; children = short status + **`InfoHint`** for detail (`tone="danger"` when status is Fail), tip glyph, **or** lone `Tooltip` → `IconButton` for row actions like sync). If an apply / fix `IconButton` shares the row, wrap **status/glyph + button** in one `.fynns-control-cluster` **inside** that row. Live: `#rhythm` status legend (+ sync row) | A Card-body `.fynns-control-cluster` whose only child is a tip glyph (full-width empty band; icon floats start) — cluster is for **≥2 sibling controls**, not a status host; private width hacks on `.fynns-btn--icon`; multi-line Fail essays as FieldHint siblings |
  | **Suffixed file body** (inspector / skill / rule / plugin source — `.md`, `.xml`, `.py`, `.ts`, `.json`, …) | **`CodeBlock`** (`variant="editable"` when editing; pass `language` via `codeLanguageFromPath(path)` or explicit id; Card host → `chrome="plain"`; **default autoGrow** on PageScroll / Card / Dialog — page scrolls with content; `autoGrow={false}` **only** for height-resolved fill hosts). Unknown suffix still CodeBlock (plain mono). Live: sandbox `#code-block` file-body Card | **`Textarea`** for anything with a real extension other than `.txt` / `.text`; UI-font prose well for `SKILL.md` / `prompt.xml` / `plugin.ts`; **`autoGrow={false}` + large `rows`** on page catalogs (inner scrollbar, page barely moves) |
  | Plain note / extensionless draft / **`.txt`** | `Textarea` (or Form `FieldBlock` + Textarea; **default autoGrow** on PageScroll / Card — same rule as CodeBlock; `autoGrow={false}` only for fill hosts) | Forcing CodeBlock on freeform notes with no filetype; fixed-height Textarea on page scroll |

  **Chrome type & row proportion (hard — agents):** Applies to filter lists,
  command palettes, menus, pickers, and similar **dense chrome lists** (live
  reference: sandbox `#command-palette` vs Cursor Actions). Form / Card
  rhythm stays under **Toolbar / unit rhythm** below.

  1. **Row model first.** Before CSS, name the **primary** row shape from the
     product reference (Cursor / ChatGPT / M3):
     | Primary model | Icon / trailing | Typical height |
     | --- | --- | --- |
     | **Single-line** (icon \| label \| shortcut) | Vertically **center** on the row | ~32–36dp (pad ~8dp block + `font-size-sm`) |
     | **Two-line** (label + description stack) | Icon / shortcut align to the **title line only** — not mid title+description | Grows from content + pad; label↔description ≥ `space-2xs` |
     Do **not** design for two-line then ship a single-line reference (or the
     reverse). Optional `description` is a **modifier** (`--described`), not
     the default when the reference is single-line.
  2. **Type ladder — one step max.** In one panel, primary text and secondary
     captions may differ by **at most one** t-shirt step (`md`↔`sm` or
     `sm`↔`xs`). Command / Actions chrome: search + item label →
     `--fynns-font-size-sm` (14); group / description / shortcut →
     `--fynns-font-size-xs` (12). **Forbidden:** label `md` (16) next to group
     `xs` (12) — reads as “some too big / some too small”.
  3. **Breath from in-row pad, not crushed gaps.** Prefer item
     `padding-block` (~8dp) so a single line clears ~32–36dp. Do **not** fake
     density with `gap: 0` between label and description under a large title,
     or rely on tiny inter-row gutters while starving in-row pad. Sibling rows
     may sit flush; selection pills carry separation (Cursor Actions).
  4. **Shortcut chips are keys.** Split accelerators on whitespace into
     separate `kbd` chips (`Ctrl` `Shift` `R`), not one fused string capsule.
  5. **Calibrate with evidence.** Against a positive screenshot: count lines
     per row, measure title vs group font-size, icon mid vs label mid (and vs
     title+description mid when two-line). Ship only when those match the
     chosen row model. Component tokens for CommandPalette live under
     `COMMAND_TOKENS` / `--fynns-command-*`.

  **Toolbar / unit rhythm** (prefer these over ad-hoc `--fynns-space-*`):

  Inside a padded `Surface` / `Card` strip that is **name + ToggleGroup/Switch
  + action + supporting timestamp**, use `ControlStack` + `ControlRow` +
  `.fynns-control-cluster` + `ControlBlock` `description` — do **not** hand-roll
  flex that stacks name+hint on the left while controls float mid/right
  (consumer failure mode: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)
  **ad-hoc Surface / inspector row chaos**; pasteable recipe:
  [`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc)).
  **Single-row `ControlBlock`:** the hint docks in the **label column** of the
  same row unit (may wrap **inside that column** on a narrow window); the
  ToggleGroup / cluster is **vertically centered** on name + hint. Do **not**
  let FieldHint become a full-bleed next row (empty band to the right of the
  timestamp, controls look top-heavy). Do **not** stuff the timestamp into
  `ControlRow` `label`. Padded `Surface` is a **form host** (same label-fill +
  end-hug as Card body). Live: Globals `#rhythm`.

  | Role | Token / host |
  | --- | --- |
  | Between `ControlRow`s in a `ControlStack` | `--fynns-layout-control-stack-gap` (**8dp** — toolbar / page chrome; tighter than unit-stack) |
  | Between `ControlRow`s in a **form-host** `ControlStack` (centered Dialog / Card body / **padded Surface** / Collapsible body direct) | `--fynns-layout-control-stack-form-gap` (**12dp**, aliases `space-md` — between `control-stack-gap` 8dp and `unit-stack-gap` 16dp) |
  | Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
  | Label above controls (narrow) | `--fynns-layout-control-row-gap` |
  | Sibling switches / chips / IconButtons in one cluster | `--fynns-layout-control-cluster-gap` (**4dp** — IconButton↔IconButton boxes). List short **text** meta → first `--with-end` IconButton uses optical `--fynns-list-end-actions-gap` (≥ **0.5.62**) |
  | TopAppBar IconButtons + NavigationRail destinations (shared) | `--fynns-layout-chrome-icon-gap` |
  | Control → supporting / error hint; **also** `FieldBlock` label→control (`.fynns-field`, `ControlBlock`, `FieldBlock` description / `__main`, Otp / Autocomplete) | `--fynns-layout-field-hint-gap` (**8dp** — tighter than unit-stack) |
  | `FieldHeader` label row with trailing sm IconButtons (Textarea expand / reset — not Input/Select in-field icons) | **`field-header-action-row-min-height`** (**32dp**); lone block or **any** label-row actions in a `FieldStack` → **all** headers in that stack use this band; label→control stays **`field-hint-gap`** |
  | Consecutive related FieldBlocks inside `FieldStack` | `--fynns-layout-field-stack-gap` (**12dp**, aliases `control-stack-form-gap`); with description/error → next sibling **16dp** (`unit-stack-gap`); host a `.fynns-control-cluster` → next sibling **32dp** (`form-cluster-gap`) |
  | Sibling ControlBlocks inside `FieldStack` | visual **16dp** (`unit-stack-gap`; CSS adds the remainder over field-stack-gap) |
  | Adjacent `FieldStack` clusters (fields → switches) | `--fynns-layout-form-cluster-gap` (**32dp**) + **strongly recommend** a horizontal `Divider` between stacks |
  | Vertical stacked **units** / other Card siblings (`.fynns-unit-stack`, intro, Checkbox, …) | `--fynns-layout-unit-stack-gap` (**16dp**) |
  | Nested surface frames (`chrome="plain"` body, `.fynns-nest`) | `--fynns-layout-nest-gap` |

  **FieldStack semantic clusters (hard — agents):** When building any inspector,
  settings Card, Preferences Dialog, or multi-section form, **partition options
  by meaning** with `FieldStack` — do **not** leave every FieldBlock /
  ControlBlock as a flat Card-body sibling.
  - **Same kind → one `FieldStack`:** consecutive related Input / Select /
    Textarea / Otp `FieldBlock`s, **or** a same-kind choice cluster
    (`Radio` single-select, `Checkbox` multi-select, and/or `Slider` under
    `FieldBlock`s), **or** Preference `ControlBlock`s (Switch + note).
    Inside: plain **FieldBlock**s keep `field-stack-gap` (**12dp**); FieldBlocks
    with description/error (no choice cluster) open the next sibling to
    `unit-stack-gap` (**16dp**); FieldBlocks that host a
    `.fynns-control-cluster` open to `form-cluster-gap` (**32dp**); sibling
    **ControlBlock**s open to `unit-stack-gap` (**16dp**) so Switch+note
    units breathe. Choice lists use
    `.fynns-control-cluster--stack` (not bare radios in form-host
    `ControlStack` — that grid auto-flows into label|control columns).
    Stack rows share a dense 2rem **min-height** (option floor) and `space-xs`
    (4dp) gap. Taller children win (`max(floor, content)` — never a fixed
    row `height`). Radio **Other** + free-text `Input` `sm` use
    `.fynns-control-cluster--choice-extra`: Google Forms-style **same-row**
    short field beside the option; keep the Input mounted — **`disabled`
    when Other is not selected** (preserve draft text; enable when Other
    is selected).
  - **Kind jump → adjacent `FieldStack`s + `Divider` (strongly recommended):**
    e.g. identity fields → radio/checkbox choices → preference switches.
    Between stacks: `form-cluster-gap` (**32dp**) **and** a horizontal
    `Divider` so the topic change reads as a hard partition (choice-cluster
    FieldBlocks also use the cluster step between siblings — spacing alone
    without FieldStack / Divider is not enough). Card / Collapsible / Dialog
    body `unit-stack-gap` stays **16dp** for intro / lone Checkbox / actions /
    other non-cluster siblings.
  - **Control + its narrative** stay one unit → `ControlBlock` (`description` /
    `errorText`). Never a loose muted `<p>` under `ControlStack`.
  - **Copy the tree** from sandbox Globals **Inspector form recipe**
    (`#form-recipe`) — same FieldStack body under **Card**, **Collapsible**,
    and dismissible **Dialog** (`showCloseButton`); supply consumer-owned
    strings only.

  **Recipe (hard):** a Switch (or other labeled row) **and** its narrative
  supporting text are **one unit** → wrap in `ControlBlock` (`description` /
  `errorText`). Do **not** place the note as the next Card-body sibling under
  a bare `ControlStack` (zero gap / invented subtitle classes). Prefer
  `ControlStack` + `ControlRow` (+ `Grid` for multi-control rows) inside the
  block. On a **single** ControlRow, `description` stays in the **label
  column**; controls vertically center on name + hint (not a full-bleed next
  row). **Form hosts** (Card body, padded Surface, centered Dialog, Collapsible body
  **direct** `ControlStack` / `ControlBlock`): ControlStack is label-fill
  (`1fr`) + end-hug controls (`max-content`) so Switch tracks share one trailing
  edge across sibling rows / ControlBlocks — same Preferences recipe as
  dismissible Dialog. Form-host stacks also open row gap to
  `--fynns-layout-control-stack-form-gap` (**12dp**, aliases `space-md` —
  between `control-stack-gap` 8dp and `unit-stack-gap` 16dp); toolbar stacks
  keep `control-stack-gap` (**8dp**).
  Do not rely on a descendant
  `.fynns-collapsible-body .fynns-control-stack` rule (sandbox category
  Collapsibles would steal toolbar demos). Toolbar / page chrome outside those
  hosts keep the fixed `--fynns-layout-control-row-label` track. Values
  live in `LAYOUT_TOKENS`; sandbox Layout chrome GUI edits
  them via `SANDBOX_LAYOUT_AGENT_CATALOG`. Live samples: Globals → Toolbar /
  unit rhythm (`#rhythm`) + **Inspector form recipe** (`#form-recipe`).

  **Inset decision tree:** Panel shells (Collapsible, Drawer, Card): equal outer
  inset via `--fynns-layout-content-inset` (18dp) on the **inline** edges of
  heads / `chrome="card"` bodies (`chrome="card"` and `chrome="plain"` share the
  outer shell). Collapsible / Card **`chrome="card"`** body uses shared **block**
  pad `--fynns-layout-content-pad-block` (16dp) **and** stacks direct children
  with `--fynns-layout-unit-stack-gap` so FieldBlock / ControlBlock / intro
  copy do not need ad-hoc margins. Nesting a surface-owning child → **`chrome="plain"`**:
  body pad + column gap are **`--fynns-layout-nest-gap`** (16dp) so the child
  reads as a secondary inset frame; sibling wells / meta in that body also use
  the same gap. **plain ≠ flush** — never cancel nest-gap with negative margins
  or by zeroing `.fynns-*-body` pad. Custom hosts outside Card/Collapsible use
  **`.fynns-nest`**. Card / Collapsible **heads** share one
  `min-height` (`icon-target` + `space-xs`×2 + hairline); lead/trigger use
  `padding-block: 0` (flex-centered). Trailing head actions keep
  `space-xs` block pad so IconButton hover disks clear the edge.
  Do **not** add a second padding wrapper inside those shells. Stack siblings
  (section label → `InlineAlert` → next block) with
  `gap: var(--fynns-layout-unit-stack-gap)` — never ad-hoc rem margins or a
  second custom status box (use `InlineAlert` for in-panel severity).
  **Long-strip / `radius-3xl` text chrome** (Banner, InlineAlert, Snackbar,
  ChatComposer **collapsed** text-only start, and **expanded** ChatComposer
  **text edge**): `--fynns-layout-strip-pad-inline` (20dp default). Banner /
  InlineAlert / Snackbar pad-inline **alias** this key — never hardcode
  `--fynns-banner-pad-inline: 1rem` or raw `--fynns-space-*`.
  Expanded ChatComposer shell pad is derived: `composer-expanded-pad-*` =
  strip − glyph-inset; textarea uses `composer-glyph-inset` (optical glyphs;
  text edge still = strip). See `llm/CHAT_COMPOSER_LAYOUT.md`.
  **Collapsed ChatComposer shell** uses `--fynns-chat-composer-pad-inline` /
  `pad-block` (~6dp equal inset around the 32dp Send/Stop circle — not
  capsule-chrome). Text-only start (no leading) adds pad so copy lands at
  `strip-pad-inline` (`strip − composer-pad-inline`). Collapsed **with**
  leading + Send: optical gap is **leading glyph → field** (not IconButton
  hit box → field); core pads `.fynns-chat-composer-primary-slot` by
  `composer-glyph-inset` so **field → filled Send disk** matches that glyph
  gap (≥ 0.4.140 — `llm/CHAT_COMPOSER_LAYOUT.md`).
  **Capsule chrome** (SearchBar field next to IconButtons — ChatGPT-style
  flush): `--fynns-layout-capsule-chrome-pad-inline` (4dp). Do **not** use
  this for ChatComposer shell pad.
  **Chat conversation column** (thread + composer **outer** form):
  `--fynns-layout-dialog-inset` (24dp) via `--fynns-chat-thread-pad-inline`;
  `--fynns-chat-composer-inset-inline` **must** alias the thread token so
  bubble end and composer shell end stay one vertical line. Do **not** use
  `strip-pad-inline` for the column outer inset (that key is text-in-shell /
  expanded composer shell pad only).
  **Form fields:** `Input` / `.fynns-field-shell` inline pad =
  `--fynns-layout-capsule-chrome-pad-inline` + `--fynns-layout-field-pad-inline`
  (4dp + 12dp) so text start matches densified **Select** / Autocomplete
  (searchbar capsule pad + trigger `space-md`). `field-pad-inline` alone
  stays the 12dp step (aliases `space-md`) — do **not** use capsule alone
  for form fields. `Textarea` →
  same inline recipe **plus** `--fynns-layout-field-pad-block` (12dp) so
  multiline copy is not flush to the top/bottom — do **not** let
  `.fynns-input--sm`’s zero block pad (32dp single-line Input) apply to
  Textarea. Default **autoGrow** (content height; soft cap
  `--fynns-layout-textarea-max-height`). Affix → text gap uses
  `--fynns-layout-control-cluster-gap`.
  Centered Dialog /
  ConfirmDialog: head/foot/body **inline** `--fynns-layout-dialog-inset`
  (24dp); non-confirm centered head **block-start** `dialog-inset / 2`,
  **block-end** `0`; confirm head **block-start** full `dialog-inset`;
  body block-end / no-head bodies still use `--fynns-layout-content-inset`.
  **Inter-section optical pads** (not outer column insets) may use space
  tokens: `head + body` pad-top `space-sm`; foot **block-end** `space-lg`
  (under 40dp action Buttons). (**no** head|body hairline.)
  Width: content-fit (`max-content`) up to the `size` token ceiling
  (`--fynns-layout-dialog-max-width-*`) for short copy / ControlStack-only
  bodies; **form hosts** (`FieldStack` / `FieldBlock` / `Textarea` / `CodeBlock`
  in body) **fill to that ceiling** so tall fields / file editors are not a
  ~280px skinny column —
  use `size="lg"` for long inspector / edit forms (M3 560dp max). At the
  ceiling, Switch / ControlStack labels wrap (body `overflow-x: clip` — no
  horizontal scrollbar). Do not invent consumer width or wrap hacks. Vertical
  scroll only when body exceeds panel `max-height`.
  FullscreenDialog inherits content-inset on head/body — **no** head|body
  hairline / `surface-head`. **Flush-start overlay body (hard):** when the
  first child of `.fynns-dialog-body` (or that child’s first child — one
  unpadded fill wrapper) is a keep-set **bordered well** (`CodeBlock`,
  `Surface`, `.fynns-table-wrap`), core sets `padding-block-start: 0` so the
  well frame sits under the title — do **not** leave an 18dp vacant band, and
  do **not** add consumer `padding-top` / negative margin on a private host
  to fake it. Head chrome stays `content-inset`. Inline and block-end inset
  stay. This is **not** the removed Card/Collapsible Field* crush, and **not**
  `chrome="plain"` flush (`plain ≠ flush` still holds inside Card /
  Collapsible). Put the well as the first body child; a height-only wrapper
  must not add pad-block-start. Live: sandbox `#fullscreen-flush`.
  BottomSheet keeps asymmetric
  `--fynns-layout-sheet-pad-inline` / `sheet-pad-block` (M3 block≠inline) and
  **no** header|body divider (handle is enough). Drawer content head same:
  content-inset, no divider. Do not force ListItem onto equal four-side
  padding.
  Do not substitute raw `--fynns-space-*` or rem literals for
  dialog/panel/strip/chat-column **outer** shell insets (inline / confirm
  head-start stay on `--fynns-layout-*`). Inter-section optical pads above
  are the documented exception.
  Sandbox Layout chrome GUI groups these under panel insets / sheet pads /
  shell size (see `SANDBOX_LAYOUT_AGENT_CATALOG` in
  `examples/sandbox/src/state/baseline.ts`).
- **Icons (full library — not a subset gate):** every glyph in
  [`src/primitives/icons.tsx`](src/primitives/icons.tsx) is exported from
  `@fynns/ui`. Consumers may use **any** of them — do **not** treat older
  “public subset” lists as an allowlist. Missing semantic → add the glyph to
  `icons.tsx` + barrel + sandbox `#icons` in the same change. Prefer
  `IconButton` + `Tooltip` over `title=`. Live catalog: Globals `#icons`.
  **Action → glyph (hard — pick by meaning, not nearest shape):**
  | Action | Use | Avoid |
  | --- | --- | --- |
  | Enter bulk / multi-select | `ListChecksIcon` | `ClipboardIcon` (copy/paste) |
  | Exit bulk / dismiss mode strip | `CloseIcon` | `ArrowLeftIcon` (nav / TopAppBar back) |
  | Select all | `CheckSquareIcon` | `CheckIcon` (confirm / done) |
  | Deselect all | `SquareIcon` | bare `CheckIcon` |
  | Archive | `ArchiveIcon` | |
  | Restore from archive | `UndoIcon` | `ArchiveIcon` (archive again) |
  | Delete | `TrashIcon` | |
  | Nav / mode exit back (TopAppBar) | `ArrowLeftIcon` | `CloseIcon` as destination back |
  **Bulk row check (hard ≥ 0.5.65):** multi-select uses leading/icon **`Checkbox`**
  only — never map `checked` → `NavigationDrawerItem` `active` or `ListItem`
  `selected`. Live: Layouts `#layouts-demo-navigation-drawer` (third column).

Theme exports (`applyFynnsThemeMode`, tokens, scrollbar helpers) remain public.
`DialogFrame` (`src/primitives/DialogFrame.tsx`), `Spinner`, floating
placement (`src/primitives/floatingBox.tsx`), and ChatActivity stream timing
(`src/primitives/chatActivityPolicy.ts`) are **internal**. Domain CSS lives
under `src/primitives/css/` — `primitives.css` only `@import`s (see
CONTEXT.md **Architecture seams**).

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in the matching
   `src/primitives/css/<domain>.css` — form Field cluster → `form-rhythm.css`;
   do **not** invent empty TSX for CSS-only hosts; barrel
   `src/primitives/primitives.css` keeps `@import` order), export from
   `src/index.ts`, document it here, **and add a live sample to sandbox
   Globals or Preview** in the same change. Prefer **one live sample +
   Preview switches** for optional anatomy (`icon`, `actions`, …) — do not
   stack every combo in Components. Do not expand the public barrel
   without that demo (see `llm/BREAKING_PURGE.md`).
3. Keep `npm run typecheck` and `npm run lint` green.
4. **Bump + publish (hard):** every landed change consumers should see is a
   new GitHub Packages version in the **same task**. Authority:
   [`docs/package-propagation.md`](docs/package-propagation.md). Do **not**
   ship via a consumer Vite alias to this checkout.
5. **Consumer pattern bugs (hard):** same-task **three-way** loop — (a) constrain
   in this core (`AGENTS.md` + treaty + pasteable rule + public CSS if needed),
   (b) **update sandbox Globals / Preview / Layout demo** that teaches the fix
   and **browser-verify in sandbox**, (c) **dispatch a subagent** into the
   consumer checkout to bump, patch props-only if needed, and **browser-verify
   in the consumer** when the bug was reported there. Never a consumer-only patch.
   Cursor: `/constrain-then-consumer` → [`.cursor/skills/constrain-then-consumer/SKILL.md`](.cursor/skills/constrain-then-consumer/SKILL.md).

<!-- OPENWIKI:START -->

## OpenWiki

This repository uses OpenWiki for agent-facing docs under `openwiki/`. Start with [`openwiki/quickstart.md`](openwiki/quickstart.md), then architecture / workflows / consume.

Local updates: **Agents Hub → OpenWiki** (thin wrap: `openwiki code --update --print` + Cursor Agent CLI `auto` via `cursor-api-proxy`). Brief: [`openwiki/INSTRUCTIONS.md`](openwiki/INSTRUCTIONS.md). Prefer updating source + regenerating over rewriting seeds unless fixing a seed; authority specs stay in this file and `llm/`.

<!-- OPENWIKI:END -->
