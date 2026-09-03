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
[`llm/opencode-fynns-ui-consume.md`](llm/opencode-fynns-ui-consume.md)) — do not
expect a long task brief.

## Design philosophy & UX principles

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
   is omitted). **Select + chevron** already ships a dropdown indicator — do
   **not** stack refresh on `Select.trailing`. Use **`FieldBlock` +
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
   `--fynns-z-toast` so Dialog / Drawer / Sheet hosts stay above
   `--fynns-z-modal`; portal `pointer-events: none`, rails re-enable so thumbs
   can be dragged / track-clicked). **Modal Dialog open:** suppress overlay rails
   for scroll hosts **outside** the open modal layer (≥ **0.5.33**) — otherwise
   PageScroll rails behind Dialog paint a phantom idle thumb. **Modal
   `.fynns-dialog-body`:** suppress thumb until panel enter settles (≥ **0.5.34**,
   mount + `transitionend` ≥ **0.5.35**); on fine pointer reveal on **host hover
   only** — not `:focus-within` from the focus trap. **Nested scroll in Drawer /
   FullscreenDialog:** Y rails clamp below overlay chrome heads (TopAppBar,
   dialog head, Card / Collapsible heads, nav headlines ≥ **0.5.134**) — live
   `#drawer-nested-scroll` + Layouts `#layouts-demo-shell`. Fine pointer + hover:
   idle-transparent thumbs with soft fade; touch / coarse keeps thumbs tinted.
   **Scroll-edge fade (≥ 0.5.135):** capped CodeBlock / Textarea /
   NavigationDrawer body soft-mask top+bottom when content overflows
   (`data-fade-top` / `data-fade-bottom`, length
   `--fynns-layout-scroll-edge-fade-length`) — not a hard clip. Textarea /
   input hosts hide the native bar only (no overlay rail). Do **not**
   use `scrollbar-gutter: stable` / `both-edges`. NavigationDrawer keeps
   `--fynns-navdrawer-pad-inline` (10dp) only. Vertical scroll hosts must pin
   `overflow-x: clip` (not bare `overflow: auto`).
5. **Always show loading / empty / error state.** Prefer `LinearProgress` /
   `CircularProgress` (inline / determinate), `BusyScrim` (fullscreen blocking) /
   `BusyRegion` (sectional **frosted blur** overlay + **one** progress chrome +
   message — well hue unchanged; never a dark overlay scrim; never a second
   `surface-*` wash; **pane cold-start uses `fill`**, never `EmptyState` + a
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
   (relative frosted blur — content `inert` while busy; no surface tint;
   full-viewport tint → `BusyScrim`). Heavy boots use **`runBusyTask` /
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
    field joiner) in labels, `supportingText`, destination names, or status
    cells. Prefer **layout** to separate unrelated meta (org in
    `supportingText`, dates in `trailingSupportingText`). Date ranges use ASCII
    hyphen with spaces (`2025-10 - 2026-03`) or locale words; empty trail marks
    use ASCII **`-`**. Counts / badges stay on `badge` / body meta — never
    `Name · N`. Docs / comments may still use English em dashes.
    **Sandbox / core demos must stay product-agnostic:** never paste consumer
    app copy into Globals, Preview, Layout templates, or primitive defaults —
    invent generic placeholders (see Hard rules /
    [`.cursor/rules/no-consumer-content.mdc`](.cursor/rules/no-consumer-content.mdc)).
11. **Performance discipline.** Dense inspectors, live token drafts, catalog
    pages, and `ClippedNavShell` crowding checks must not thrash the main thread
    (observer↔probe loops, tip forests, per-tick history). Authoritative rules:
    [`llm/PERF.md`](llm/PERF.md). Agents building playgrounds / shells / token
    GUIs **must** read that file before coding.

## Hard rules (Do / Don't)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc. Missing value →
  [`src/theme/tokens.ts`](src/theme/tokens.ts) + `npm run gen:theme`.
- **DO** group inspector / settings / Dialog form options with **`FieldStack`**
  by **semantic kind** (identity fields together, radio/checkbox choices
  together, preference switches together, …) — not one flat list of FieldBlocks
  / ControlBlocks. Plain FieldBlocks share `field-stack-gap` (12dp); label-row
  **FieldHeader** actions lift the header band to
  `field-header-action-row-min-height` (32dp); inside one **`FieldStack`**, if
  **any** sibling has those actions, **every** header in that stack shares the
  band — label→control stays `field-label-control-gap` (12dp); **Input**
  `trailing` for in-field reveal; **Select + row action** → control-cluster band
  (not `Select.trailing`); **repeatable Textarea + remove rows** → same
  `.fynns-control-cluster--end-align` + `__grow` on each Textarea (not bare
  `.fynns-control-cluster` — default wrap parks delete under tall autoGrow
  wells). FieldBlocks with description/error (no choice cluster) open the next
  sibling to `unit-stack-gap` (16dp); FieldBlocks that host a
  `.fynns-control-cluster` open to `form-cluster-gap` (32dp); sibling
  ControlBlocks open to `unit-stack-gap` (16dp). **Strongly recommend** a
  horizontal `Divider` between adjacent FieldStacks on kind jumps. Live tree:
  sandbox `#form-recipe`. See **Toolbar / unit rhythm** → **FieldStack semantic
  clusters**.
- **DON'T** hardcode raw colors / hex / rgba; invent muted `<p>` subtitle classes
  (use `ControlBlock` / `FieldBlock` `description`); dump consecutive form units
  as flat Card siblings when they belong in different semantic groups.
- **DON'T** wrap each path/link/bookmark in its own padded `Surface`/`Card` —
  one `List` of `ListItem`s (trailing ghost **md** IconButtons; not under text;
  not a filled danger disk). See **Content density**.
- **DON'T** paint List catalog kind with start tick / inset rail / `::before` /
  second `hostClassName` wash — leading icon + `trailingSupportingText` /
  `.fynns-table-meta`; selected = host `radius-3xl` pill only; never
  `ul > div > li`. Crush List gaps: keep `--fynns-list-gap` (**16dp**),
  content-gap **4dp** / **8dp** (3-line), optical `--fynns-list-end-actions-gap`
  (≥ **0.5.62**); no 40dp empty leading column. Duration units **spaced**
  (`1m 47s`, never `1m47s`). Live `#list`.
- **DON'T** glue org + dates in one `supportingText` with `·` / `–` / `—` —
  org under title; dates → `trailingSupportingText` + `trailingMetaAlign="start"`
  on mixed-length date catalogs (core **start**-aligns glyphs in the shared
  min-width column ≥ **0.5.13**). **Do not** invent private CSS `text-align` /
  width on trailing meta when you meant that shared column. Same: no `·` / `—`
  in visible chrome strings. Live `#list` org+dates.
- **DON'T** put `trailingMetaAlign="start"` on short-status + `--with-end`
  catalogs (parks status far from IconButton) — leave unset. Live `#list`
  status+action.
- **DON'T** treat List `--with-end` as a wide inspector strip for labeled
  Button/Select **as if** it were path-catalog IconButton overlay (that reserve
  is **1–2×40dp disks** only). Prefer IconButton + Tooltip for row actions.
  When a row genuinely needs Select ± labeled CTA: core ≥ **0.5.54** pins
  in-flow (always visible; Select content-hug); ≥ **0.5.55** clears host
  `radius-3xl` clip on the end; ≥ **0.5.56** co-locates gap `trailingSupportingText`
  in that end strip; ≥ **0.5.67** widens meta|CTA|Select gaps to **8dp**
  (`inspector-end-gap`); ≥ **0.5.70** reuses inline form Select
  `search-bar--expanded` (not absolute flyout); ≥ **0.5.71**/72 pins
  meta|CTA on the **trigger band** when expanded. Leave `trailingMetaAlign`
  unset. Card/Collapsible head Select + labeled Button uses the same
  trigger-band grammar (≥ **0.5.73**/74; gap **8dp** ≥ **0.5.75**). Live
  `#list` inspector trailing / `#sandbox-card-head-select`.
- **DON'T** use a flex `.fynns-control-cluster` for multi-metric List trailing
  that must **column-align across sibling rows** — use
  `.fynns-list-item-trailing-stats` (fixed grid; `--pair` for two metrics).
  One metric per `.fynns-table-meta` cell (wrap label in `<span>` for ellipsis);
  second metric → sibling meta or trailing-stats. Run/job rows → single-line
  cluster with `.fynns-list-item-status` — never nest `InlineAlert`/`Banner`/
  `Chip` in ListItem headline. Live `#list` run-summary.
- **DON'T** park Timeline edit/delete as `--with-end` hover IconButtons —
  flat row `onClick` → `Dialog` `size="lg"` + `showCloseButton`; foot LTR
  **Cancel → Delete → Save** (never Delete leftmost of Cancel); prefer omit
  `leading`. Live `#timeline`.
- **DON'T** park `InlineAlert`/`Banner` beside a List in the same ControlStack
  row — severity **above** catalog (unit-stack). Live `#env-check`.
- **DON'T** put two+ `loading` spinners in one `.fynns-control-cluster`; leave
  `IconButton` `loading` showing spinner **and** glyph (core ≥ **0.5.80** =
  spinner-only for iconOnly); stack BusyRegion/BusyScrim with chrome `loading`
  on the same wait host — **one** progress chrome per wait. Live `#rhythm`
  end-align / `#busy-region`.
- **DON'T** put service status in ControlRow `__controls` (Chip/badge/meta) —
  status on **`label` only**; controls = labeled Buttons only; use public
  `.fynns-control-cluster` (**8dp** labeled-Button gap ≥ **0.5.80**), not
  private `*-control-cluster` at 4dp. Live `#rhythm` service control.
- **DON'T** use `IconButton` `sm` or labeled `Button` `primary`/`tonal` on
  PageScroll **section-body** ControlRows when the row `label` already names
  the section — default **md** ghost IconButton + Tooltip only; primary-end
  labeled CTA stays for Dialog feet / unlabeled action rows. Same page:
  catalog ControlRow + List trailing + section strip share **md**. Live
  `#rhythm` morph + cover-letter.
- **DON'T** invent shell/column/chat insets as raw `rem`/`px` or private CSS
  vars — reuse `--fynns-layout-*` (see **Inset decision tree**). Don't ship
  broken chrome type/row proportion (see **Chrome type & row proportion** /
  `.cursor/rules/chrome-proportion.mdc`). Don't pad above first flush-start
  bordered well in FullscreenDialog. Don't invent private radius vars outside
  `RADIUS_TOKENS` (every key must appear in GlobalsInspector). Don't park
  aesthetics only in `SANDBOX_DEFAULT_OVERRIDES` (must stay empty). Don't ship
  Chat containers squarer than `radius-22`; don't “fix” ChatMessage body
  stack gap with consumer CSS (`--fynns-chatmessage-body-stack-gap` **16dp**).
- **DON'T** reintroduce measure probes under `ClippedNavShell` /
  MutationObserver hosts; default-open dense sandbox inspectors full of
  InfoHint/Slider — see [`llm/PERF.md`](llm/PERF.md). Don't reintroduce
  `@radix-ui/*` / `sonner` / purged Toast/Popover/Panel APIs. Don't drop a
  sandbox demo while the symbol stays exported (or reverse) — atomic
  unexport+delete+demo+BREAKING_PURGE; `npm run check:wysiwyg`.
- **DON'T** paste **consumer product content** into core/sandbox — generic
  placeholders only. Rule: [`.cursor/rules/no-consumer-content.mdc`](.cursor/rules/no-consumer-content.mdc).
- **DON'T** stack diagnostic essays as FieldHint / muted `<p>` unit-stacks —
  short status + `InfoHint` on the ControlRow. Settings Card policy: compress
  to Tooltip / label-row `InfoHint` `sm` (≤1 per head); `FieldHint` =
  one short line. Env keys: InfoHint on label row (danger when required empty);
  no status Chip; Input trailing reveal = `sm` only. Live `#rhythm` /
  `#sandbox-field-header-env-keys`.
- **DON'T** put Settings both as root NavigationDrawerItem **and** footer gear
  — `navFooter` only; Settings = software chrome (locale/appearance/account);
  feature config = own destination; language not in TopAppBar. Live
  `#layouts-demo-shell`.
- **DON'T** turn an in-canvas catalog into a silent full-canvas detail
  PageScroll replace — keep List/Timeline mounted; edit → `Dialog` `size="lg"`
  (+ `FullscreenDialog` only for multi-Card long workflows). Drill-in is
  `#layouts-demo-drill-in`. Don't mount a full-workflow Card as sole
  FillColumn `header` (compact preview band only ≥ **0.5.76**). Tall
  PageScroll multi-field brief (≥3 FieldBlocks) → **`Collapsible`** (body
  end-align **md** save; head actions **sm** only if product asks) — not
  static Card. Live `#form-recipe` / `#form-recipe-page-scroll` /
  `#layouts-demo-fill-column`.
- **DON'T** (EndAside*): conditionally mount `{asideOpen && <EndAside>}` —
  toggle **`open` only** so width morph can run (core ≥ **0.5.86** morph track
  stays mounted in DestinationAppShell — never unmount on close). Don't remount
  the pipeline shell into BusyRegion `fill` with app-boot copy on aside chrome
  toggle — keep fetch keyed on **id** only; park unstable `onExit` in a ref.
  Don't let standalone ControlRow labeled Button clusters overflow narrow Card /
  EndAside (core ≥ **0.5.88** wraps labeled clusters; ≥ **0.5.92** raises
  `end-aside-min-width`). Don't stack three or more labeled Buttons in one
  narrow aside ControlRow — **one** primary labeled Button; save/sync →
  IconButton + Tooltip; variant exports → one `DropdownMenu` `iconOnly`
  `UploadIcon` (not `DownloadIcon`). Don't put a visible ControlRow `label`
  when Card `title` already names the section (`label=""` → full-width controls
  band). Don't paint secondary IconButtons / `iconOnly` menu triggers as
  `tonal` / `primary` — default **ghost**. Don't put PageScroll in EndAside
  without the height chain (track flex + `max-height:100%`, aside `height:100%`,
  PageScroll `flex:1` `min-height:0` `overflow-y:auto` — ≥ **0.5.93**). Live
  `#layouts-demo-shell`.
- **DON'T** pad destination labels with redundant meta (`· N`, parenthetical
  glosses) unless asked — short name + optional Item `badge`. Don't pass
  `drawerHeadline` / sheet `headline` under DestinationAppShell / TopAppBar
  title (omit; Groups for body sections). Live `#layouts-demo-shell`.
- **DON'T** rename tokens to non-`--fynns-*` forms; invent consumer
  `width`/`min-width` on `.fynns-dialog-panel` (use FieldStack + `size="lg"`);
  pin CodeBlock/Textarea to fixed height on PageScroll catalogs (default
  autoGrow; `autoGrow={false}` only for height-resolved fill hosts); set main
  app chrome to `--fynns-font-serif`. Live `#form-recipe` / `#code-block`.

**Consumer failure-mode slug index:** [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md)
(details live in this file’s Hard rules + Content density + sandbox demos — do
not reintroduce long treaty essays).

**Consumer apps (agents in any repo that consumes `@fynns/ui`):** treat this
package as a **function API** — import primitives and pass props / children /
labels only. **Do not** wrap `@fynns/ui` components in local restyles, fork CSS,
or invent parallel variants in the consumer. **Do not** edit
`node_modules/@fynn7/ui-design-core` for app features (bump the package version
or use a temporary `file:` / `npm link`). If the keep-set cannot meet the
requirement after exploring `AGENTS.md` + sandbox Globals, **stop and tell the
user explicitly** that the work must land in `fynns_ui_design_core` first, then
the consumer only calls the new API. Install / pin rules:
[`llm/CONSUME.md`](llm/CONSUME.md). Pasteable always-on consumer rule:
[`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc).

**High-traffic sandbox anchors (start here):**

| Topic | Anchor |
| --- | --- |
| Form / FieldStack / Dialog | `#form-recipe`, `#form-recipe-page-scroll`, `#field-header` |
| List catalogs / density | `#list`, `#page-scroll`, `#sandbox-list-status-action` |
| Timeline | `#timeline` |
| Toolbar / ControlRow / service | `#rhythm` |
| Busy / loading | `#busy-region` |
| CodeBlock file body | `#code-block` |
| Env key FieldHeader | `#sandbox-field-header-env-keys` |
| Card head Select / draft actions | `#sandbox-card-head-select`, `#sandbox-card-draft-actions` |
| Destination shell / EndAside | `#layouts-demo-shell`, `#layouts-demo-drill-in`, `#layouts-demo-fill-column` |
| Mode drawer / bulk | `#layouts-demo-navigation-drawer` |
| Command chrome proportion | `#command-palette` |
| Flush-start overlay | `#fullscreen-flush` |
| Split / Tree / Chart / Table | `#split-pane`, `#tree`, `#chart`, `#table` |
| Icons | `#icons` |

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

Groups: `color`, `space`, `size`, `radius`, `shadow`, `state`, `font`,
`font-size`, `font-weight`, `line-height`, `letter-spacing`, `z`, `duration`,
`ease`, `toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`,
`appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `chatmessage`,
`chat`, `list`, `datepicker`, `timepicker`, `carousel`, `breadcrumb`,
`pagination`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`,
`code` (CodeBlock highlight roles), plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`, `chat-user-bubble`.
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
  `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
  `accent-ring`, `on-accent`, container roles, `focus` (faint keyboard ring).
- Focus geometry (`--fynns-focus-*`): `ring-width`, `ring-offset-control`,
  `ring-offset-input`, `border-mix` (accent % into resting border for fields).
- Lines/text: `border` `#0d2e2c`, `border-strong`, `outline-subtle`, `text`
  `#e2f0ed`, `text-muted` `#7a9e98`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `toggle-track`, `toggle-track-hover`, `scrollbar-thumb*`
  (also under the `scrollbar` group).
- State layers (`--fynns-state-*`): `hover` 8%, `focus` 10%, `pressed` 12%,
  `dragged` 16% — used via `color-mix(...)` for interactive overlays.
- Elevation lookups (TS only, not CSS vars): `ELEVATION_TOKENS`. M3 reference
  mirror: [`llm/m3-draft-tokens.md`](llm/m3-draft-tokens.md).

Spacing: prefer t-shirt keys `--fynns-space-{2xs,xs,sm,md,lg,xl,2xl,3xl}`;
legacy numeric keys (`--fynns-space-1` …) remain as aliases. Standard chrome
glyph: `--fynns-size-icon` (`1rem` / 16dp) + TS `ICON_SIZE` (exported from
`@fynns/ui`). Nav / Banner / SearchBar / BottomAppBar / Toolbar action icons
share this. Fab `sm` stays on `--fynns-size-icon-md` (20dp). Dense micro glyphs
(chip trailing, select chevron, steppers) may stay smaller. Font sizes: prefer
t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`; legacy semantic keys
remain. Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`,
`toggle-thumb`, `glow-accent`, `glow-danger`. Motion:
`--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,tooltip-show-delay,tooltip-skip-delay,toggle,
fast,flyout,base,slow,scrollbar,loading-spin,activity,presentation-hint,
thinking-shimmer,reduced-motion-spin}`.

**Font families (`--fynns-font-*`) — when to use:**

| Token | Stack | Use for | Do **not** use for |
| --- | --- | --- | --- |
| `ui` | system-ui / Segoe / Roboto | **Default everything:** page body, chrome, forms, Dialog, Chat, lists, buttons, captions. `theme.css` already sets `body { font-family: var(--fynns-font-ui) }` — prefer inheriting | — |
| `mono` | Consolas-first | Code only: `CodeBlock`, bare `code` / `kbd` / `samp` / `pre`, technical identifiers | Running prose, UI labels, Chat bubbles |
| `serif` | CMU Serif / Times-like | **Rare** academic / editorial *prose* when the user explicitly asks (theorem / definition / proof, paper-like passages). Not a math renderer | App chrome, main body, forms, Chat, Dialog, lists, buttons; live formula rendering |

If you are about to write `font-family`, stop — inherit `ui` unless the content
is literally code (`mono`) or the user demanded serif for a narrow display
passage. Never pick serif to make body text “more serious”.

**Code highlight (`--fynns-code-*`):** semantic roles for `CodeBlock` (fg, bg,
comment, keyword, string, number, type, function, variable, property, parameter,
operator, module, constant, constant-named, escape, invalid). Distilled from
cpptools VS dark/light TextMate themes — readable CodeBlock ink, not a full VS
Code grammar. Zero-dep tokenizer in `src/primitives/codeHighlight/`; no
Shiki/Prism. **Consumer custom languages:** see
[`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md)
(`SimpleHighlightProfile` / `registerHighlightLanguage`).

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

**Breaking surface:** only symbols demoed in sandbox Globals + Layouts + Preview
are public. Removed APIs and migration table:
[`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md). **Surface sync:**
`npm run check:wysiwyg` — every barrel value needs a demo (or companion);
Removed-table names must not be exported; never companion-park
`src/primitives/<Name>.tsx`. Import from `@fynns/ui`. Components emit `.fynns-*`
classes.

### Keep set (summary)

- **Actions:** Button, IconButton, SplitButton (M3 Expressive; no `danger` on
  SplitButton; sizes `sm`/`md`/`lg`; `ghost` on Button/IconButton), Fab,
  FabMenu / FabMenuItem
- **Fields:** Input, Textarea (default width 100%, autoGrow, soft
  `--fynns-layout-textarea-max-height` ≥ **0.5.103**; `spellCheck={false}`
  default), FieldHeader / FieldBlock, Select (content min-width floor; cluster
  `__grow` disables floor), Autocomplete, OtpInput, NumberInput, SearchBar /
  SearchBarResult, Switch (dense track; `labelSide`), Checkbox, Radio, Chip /
  ChipSet (`assist`|`filter`|`input`|`suggestion` — never table-cell status),
  Slider, ToggleGroup, Tabs (M3 Primary underline)
- **Feedback:** Banner, InlineAlert (phrasing copy only — never nest List /
  FieldStack / CodeBlock inside), BadgedBox, LinearProgress / CircularProgress,
  BusyScrim `{ open, label, message?, value?, size?, indicator? }` /
  BusyRegion `{ busy, label, children?, message?, value?, size?, fill?,
  indicator? }` (frosted blur; `indicator` `circular`|`linear`; never stack
  ring on bar; `fill` for height-resolved cold-start), EmptyState,
  **Chat** family (see below), Snackbar (`snackbar()` + `<SnackbarHost />`),
  Tooltip, InfoHint

  **Loading placement (hard):**

  | Scene | Use | Do **not** |
  | --- | --- | --- |
  | Full-app block | `BusyScrim` | `EmptyState` + ring; revived `BlockingLoadingOverlay` |
  | Pane cold-start | `BusyRegion` `fill` as FillColumn/shell child **or** PageScroll → `.fynns-content-column` (direct / thin section wrapper hosting only the fill — core ≥ **0.5.136** stretches scrollport + pass-through wrappers so BusyStack centers, does not overflow a collapsed overlay); hide section FieldHint until ready | Nest under content-sized unit-stack/Card; EmptyState as loading; FieldHint + busy in one well; bare `fill` inside PageScroll without the content-column height chain |
  | Dialog/Card body load | `BusyRegion` (+ `fill` if height resolved); no pager siblings under empty overlay; drawer SearchBar **above** BusyRegion | Bare CircularProgress as body; wrap List+Select+Pagination so chrome flickers |
  | Refresh over existing | BusyRegion around List/table only | Unmount → EmptyState; second surface tint; wrap whole Card |
  | Known % / unknown wait | `linear`+`value` / default `circular`; chrome `min(20rem,100%)` | Stack ring+bar; nest progress in `message` |
  | Button/icon slot | Inline Spinner via `loading` | Page-level CircularProgress in the slot |
  | Multi-action footer | **At most one** `loading` in cluster | Twin `loading={busy}` rings |
  | Section wait + chrome | BusyRegion only; header/foot `disabled` without `loading` | BusyRegion + chrome loading |
  | Zero-result catalog | `EmptyState` (`fill` if sole pane body) | EmptyState as loading; content-sized EmptyState as sole canvas child |

  **paint-before-work:** `afterNextPaint` / `yieldToMain` /
  `runBusyTask(setBusy, task)` / `useBusyTask()` — `flushSync` busy on → wait one
  paint → then run the async task so `CircularProgress` can start spinning. Does
  **not** keep the ring smooth through long sync / WASM compile on the main
  thread (use a Worker or `yieldToMain` slices for that). Prefer over
  `setBusy(true)` then immediately blocking work.

  **Chat:** `Chat` / `ChatThread` / `ChatComposer` / `ChatScrollToBottom` /
  `ChatMessage` (`user`|`assistant`|`system`; prefer `markdown` /
  `ChatMarkdown` L2 GFM: paragraphs, AT, fenced→CodeBlock, lists, GFM task
  labels as plain items, inline marks — not full tables/raw HTML).

  - **Shell:** `Chat` full-height flex; soft min
    `min(var(--fynns-layout-chat-min-width), 100%)`. Parent must resolve height —
    Preview above Chat → wrap with **`FillColumn`** (`header` = Preview,
    `children` = Chat or pane-boot `BusyRegion` `fill`). Only `ChatThread`
    scrolls (`role="log"` + `fynns-scroll`); composer docks at root; scroll-to-
    bottom = 32dp elevated IconButton (not Fab). `empty` prefers `EmptyState`;
    starter prompts = `Chip`/`ChipSet` **inside** `empty` (above composer).
  - **Main vs aside:** **main** = column ceiling `--fynns-layout-chat-max-width`
    (**48rem**); user bubble **70%** of host (`radius-22`,
    `--fynns-color-chat-user-bubble`); composer **100%** of same host
    (`radius-3xl`, ~44dp collapsed). Thread pad =
    `--fynns-chat-thread-pad-inline` → `dialog-inset`; composer inset **aliases**
    the thread token so bubble end and shell end align. **Aside**
    (`.fynns-chat-host--fill` / EndAside): host 100%; user bubble ceiling
    **100%**; composer 100%.
  - **Composer:** controlled `<textarea>` (not ChatGPT ProseMirror); Enter
    sends, Shift+Enter newline, Esc stops while `busy`; **CJK IME:** Enter
    during composition must **not** send. Collapsed ≈ one row; expanded =
    full-width text above toolbar — **do not auto-collapse a non-empty draft**
    (narrow hosts can hit update-depth loops). Cap:
    `--fynns-chat-composer-max-height` (13rem). Layout authority:
    [`llm/CHAT_COMPOSER_LAYOUT.md`](llm/CHAT_COMPOSER_LAYOUT.md).
  - **Message extras:** `streaming` = last-glyph color pulse only while answer
    text exists + `aria-busy`; `error`/`onRetry` = failed-generation footer;
    `thinking`/`ChatThinking` = single-block reasoning (Wave 1); `ChatActivity`/
    Step/Artifact = multi-step tool tree (Wave 2 — label tense: **active** =
    *-ing*, **done** = past; header may summarize latest completed milestone
    while later step still streams). `citations`/`ChatCitations`/
    `ChatCitationChip` under assistant (Tooltip `side="bottom"`). Idle
    `actions`: IconButton + Tooltip for Copy / Regenerate + More menu.
    Body sibling stack gap **16dp** from core — bare strings promoted to
    `.fynns-chat-message-prose`; do **not** patch with consumer CSS. ARIA:
    [`llm/CHAT_ARIA_PARITY.md`](llm/CHAT_ARIA_PARITY.md). User edit UX (not in
    core yet): [`llm/CHAT_USER_EDIT_UX.md`](llm/CHAT_USER_EDIT_UX.md). Live
    `#activity` / `#thinking`.
- **Overlay / sheets:** Dialog / DialogShell / ConfirmDialog / FullscreenDialog
  (M3 basic + full-screen only). `ConfirmDialog` = title + supporting + foot
  (no close). `Dialog` optional `showCloseButton` for dismissible forms —
  **form bodies** (`FieldStack` / `FieldBlock` / `Textarea` / `CodeBlock`)
  stretch to the `size` ceiling (prefer `size="lg"` / M3 560dp). Dismissible
  preference rows: `showCloseButton` + full-width `ControlStack` /
  `ControlRow` + track-only `Switch` (`label=""` + `ariaLabel`) — CloseIcon
  **glyph** end aligns with Switch track end. FullscreenDialog:
  `content-inset` head; **flush-start** when first body child is a bordered
  well (`CodeBlock` / `Surface` / `.fynns-table-wrap`) — live
  `#fullscreen-flush`. Drawer (~400dp modal **content** sheet ≠ NavigationDrawer),
  BottomSheet, DropdownMenu (+ Item/CheckboxItem/Group/Separator; catalog
  IconButton strips → `iconOnly` ghost), ContextMenu / ContextMenuTrigger,
  CommandPalette (Spotlight / ⌘K; apps own accelerator; live `#command-palette`)
- **Dates / time:** DatePicker / DatePickerDialog / DateRangePicker /
  DateRangePickerDialog, TimePicker / TimePickerDialog (**no dial / clock-face
  variant — permanent skip**)
- **Chrome:** TopAppBar (edge-flush — no outer radius/card frame), BottomAppBar,
  StatusBar / StatusBarItem (~22dp IDE strip — live `#status-bar`), Toolbar,
  NavigationRail (+ Menu/Header/Item), NavigationBar / Item, NavigationDrawer
  (+ Headline/Group/Item + optional `footer` = Cursor-style account row +
  settings gear `sm` — **not** a destination Item; never wrap destinations in
  `.fynns-unit-stack`; SearchBar/tools ↔ destinations =
  `--fynns-navdrawer-search-gap` **8dp**; Item↔Item =
  `--fynns-navdrawer-section-gap` **4dp**), SkipLink, Breadcrumb, Pagination
  (`.fynns-pagination-bar` = single M3/MUI footer row — never wrap to two rows)
- **App shells:** **`DestinationAppShell`** (default greenfield — declarative
  `destinations[]` / `title` / optional `leadingExtra` / `trailing` /
  `navFooter` / `children` / optional `aside`). Destinations are **binary**:
  open labeled resizable drawer **or** fully `hidden` — **no** icon-only
  `NavigationRail` densify (`onNavCrowded` **closes**). Flat root destinations
  only — drill-in / dynamic drawer body → hand-compose `ClippedNavShell`
  (`#layouts-demo-drill-in`). Low-level **`ClippedNavShell`**: full-bleed
  TopAppBar + `nav | main`; `navMode` `drawer`|`rail`|`hidden` must match the
  `nav` slot (shell never auto-swaps). Drawer seam resizable (rAF live width;
  commit on pointerup). Crowding watches main-column overflow too; predict
  before open paint; must **not** fire while drawer/EndAside mid-drag or
  EndAside closing. Length reads without measure probes under MutationObserver
  ([`llm/PERF.md`](llm/PERF.md)). **`EndAside`:** width morph (≥ **0.5.86**
  track stays mounted — toggle `open` only); desktop leading-edge resize;
  main ≤32rem → end-edge overlay; ≤56.25rem → bottom sheet
  `min(52dvh, 22rem)`. Live `#layouts-demo-shell`.
- **Content:** List / ListItem (selected = `secondary-container` +
  `radius-3xl`; host paints whole-row wash; sibling gap =
  `--fynns-list-item-gap` **4dp**; **no Divider between items**; `--with-end`
  overlay reveal for path catalogs; expandable trees = row `onClick` +
  decorative chevron + `detail` — keep mounted, do not `open ? … : null`),
  Card / Collapsible (`chrome="card"`|`"plain"` — plain = nest-gap, **≠ flush**;
  head actions = interactive chrome only), Surface (untitled well; `fill` only
  when parent height-resolved), Carousel, Divider, Table (host
  `.fynns-table-wrap.fynns-scroll`; nowrap + max-content; cell status =
  `.fynns-table-meta` never Chip), DiffView, CodeBlock (titled `default`
  **requires** non-empty `label`; else `variant="plain"`; `label` ≠ `language`
  — always pass matching `language` / `codeLanguageFromPath`; editable
  autoGrow default on PageScroll; soft-wrap live highlight ≥ **0.5.52**;
  `readOnly` = single pre), Stepper, Dropzone, Avatar / AvatarGroup
- **Layout helpers:** ControlStack, ControlRow, ControlBlock `{ description?,
  errorText? }`, FieldHint, FieldBlock / FieldHeader, FieldStack,
  `.fynns-unit-stack` (sibling units only — children `flex-shrink: 0`), Grid
  (`equalCells`), FillColumn `{ header?, children, footer? }` (header =
  compact preview band — core ≥ **0.5.76** pads+caps on destination canvas;
  children = Chat / BusyRegion fill / PageScroll), PageScroll (pane-edge
  scroll + inner `.fynns-content-column`), SplitPane (in-content resize — not
  EndAside), Tree / TreeItem (`role=tree` — not nav destinations), Timeline /
  TimelineItem (flat + detail only — see
  [`.cursor/rules/timeline-catalog.mdc`](.cursor/rules/timeline-catalog.mdc)),
  `measureOverflow` / `overflowsBounds` / `measureContentOverflow` /
  `useOverflowBounds`

Theme exports (`applyFynnsThemeMode`, tokens, scrollbar helpers) remain public.
`DialogFrame` (`src/primitives/DialogFrame.tsx`), `Spinner`, floating placement
(`src/primitives/floatingBox.tsx`), and ChatActivity stream timing
(`src/primitives/chatActivityPolicy.ts`) are **internal**. Domain CSS lives
under `src/primitives/css/` — `primitives.css` only `@import`s (see CONTEXT.md
**Architecture seams**).

### Platform targeting (agents — authoritative)

Labels: **`both`** = any viewport; **`mobile-first`** = prefer on compact /
phone (pair with a desktop sibling when adapting); **`desktop-first`** =
prefer on medium+ / pointer; **`adaptive`** = same component changes layout by
breakpoint or `(hover: none)`. Most controls are **`both`**. Only
**ClippedNavShell** / **EndAside** implement a real viewport break
(`max-width: 56.25rem`). Destination chrome does **not** auto-swap — the
**app** chooses Rail vs Bar vs Drawer.

**Destination ladder (not duplicates):** phone → `NavigationBar` (bottom) or
intentional `NavigationRail` as a **standalone** phone root (not
DestinationAppShell densify); wide labeled → `NavigationDrawer` `standard`
inside **DestinationAppShell** (desktop default; open drawer or fully hidden —
never unlabeled rail intermediate); overlay → `modal`. Live composed default:
sandbox **Layout templates** (`#layouts-demo-shell`). Standalone Rail/Bar demos
on that page are parts — not a desktop greenfield root.

| Symbol | Platform | Notes |
| --- | --- | --- |
| DestinationAppShell | adaptive | Default greenfield; binary drawer/hidden; flat roots only — drill-in → hand-compose ClippedNavShell (`#layouts-demo-drill-in`) |
| TopAppBar | both | Edge-flush; slot into shell |
| BottomAppBar | mobile-first | Actions + optional FAB — not destinations |
| StatusBar | desktop-first | ~22dp IDE strip; live `#status-bar` |
| Toolbar | both | Contextual `docked` / `floating` |
| NavigationBar | mobile-first | Bottom destinations (phone) |
| NavigationRail | mobile-first | Intentional phone/icon root only — never DestinationAppShell densify |
| NavigationDrawer | adaptive | Desktop default inside DestinationAppShell; Group (collapsible) or Headline; sheet `headline` = static title only (never back/bulk row); Group/Item short labels; SearchBar↔dest = `navdrawer-search-gap` (8dp); optional `footer` account+settings |
| ClippedNavShell | adaptive | Low-level TopAppBar + nav\|main; `drawer`\|`rail`\|`hidden` must match `nav` slot; prefer DestinationAppShell; use for drill-in (`#layouts-demo-drill-in`) |
| EndAside | adaptive | Width morph (≥ **0.5.86**); desktop resize; main ≤32rem → overlay; ≤56.25rem → bottom sheet |
| Drawer | desktop-first | Modal **content** side sheet (~400dp). Phone → BottomSheet. ≠ NavigationDrawer |
| BottomSheet | mobile-first | Bottom content sheet. Desktop → Drawer. Drag handle; no header\|body divider |
| FullscreenDialog | mobile-first | Full-viewport; flush-start when first body child is bordered well (`#fullscreen-flush`) |
| Dialog / ConfirmDialog | both | Centered; form hosts fill `size` ceiling; dismissible prefs = `showCloseButton` + ControlStack |
| CommandPalette | both | ⌘K filter dialog; live `#command-palette` |
| ContextMenu / Tooltip / InfoHint | desktop-first | Pointer/hover-first |
| Table* | desktop-first | Horizontal scroll when narrow |
| Dropzone | desktop-first | Drag-drop primary |
| Collapsible / CodeBlock | adaptive | Hover-none changes disclose/copy |
| Chat* / List* / Timeline* / FillColumn / PageScroll / SplitPane / Tree / Busy* / Banner / … | both | See keep-set + Content density |

**Content density (data → component — hard):** pick host by **data shape**, not
“everything is a Card.” Detailed recipes live in sandbox demos (and on-demand
rules such as timeline-catalog). Live index: `#list`.

| Data shape | Use | Sandbox | Forbidden (one line) |
| --- | --- | --- | --- |
| Name + path + optional row actions | Two-line `List` / `ListItem`; trailing ghost **md** IconButtons; `--with-end` overlay | `#list` / `#page-scroll` | Fat Card/Surface per entry; Divider between items; trailing `sm` on same page as catalog `md` |
| Expandable catalog / nested records | Same List + `detail`; expand morph; multi-metric → `trailing-stats` | `#list` tree | `ul > div`; unmount `detail`; headline-tail count beside `--with-end` |
| Title + org + date range | Org in `supportingText`; dates in `trailingSupportingText` + `trailingMetaAlign="start"` (start-ink ≥ **0.5.13**) | `#list` org+dates / `#timeline` | Glue org·dates; private `text-align`/width on trailing meta |
| Short status + row action | Short meta + `--with-end`; omit `trailingMetaAlign` | `#list` status+action | `trailingMetaAlign="start"` on status+action |
| Inspector Select ± CTA | In-flow end strip; inline Select; trigger-band | `#list` inspector trailing | Absolute flyout; 4dp kiss; meta mid expanded panel |
| Status + identity + duration | Single-line cluster + `.fynns-list-item-status`; one metric/cell | `#list` run-summary | InlineAlert in headline; latency+tokens in one meta |
| Catalog create / edit | Keep list mounted → `Dialog` `lg` (+ FullscreenDialog for long) | `#timeline` / `#form-recipe` | Silent PageScroll replace with ghost “back” |
| Dashboard shortcut links | One Card wrapping one path List | `#list` shortcut Card | Button cluster + empty headline-only rows |
| Catalog kind (builtin) | Leading icon + meta; host pill selected | `#list` kind | Start tick / inset rail / Chip as kind |
| List row type stack | Gaps 4/8/16dp + optical end-actions | `#list` | Private gaps; 40dp empty leading |
| App destinations | NavigationDrawer / Rail / Bar / DestinationAppShell | `#layouts-demo-shell` | List/Card as app root nav |
| Multi-column records | Table in `.fynns-table-wrap.fynns-scroll` inside Card | `#table` | Surface + FieldHeader fake head |
| Table cell status + action | `.fynns-table-meta` + end-align cluster | `#table` | Chip as cell status |
| Form / preference options | FieldStack (+ Divider on kind jumps) | `#form-recipe` | Flat Card-per-field |
| Settings scope / field policy | InfoHint on Card/Field actions; short FieldHint only | `#field-header` | Card-body FieldHint essays |
| Env / config key FieldBlock | Key label + label-row InfoHint; Input trailing `sm` | `#sandbox-field-header-env-keys` | Status Chip; portal FieldHint under Input |
| Select + refresh beside | end-align cluster + `__grow`; trail size match | `#field-header` | `Select.trailing` beside chevron; sm+md trail mix |
| Repeatable Textarea + remove | end-align + `__grow` Textarea; add on label row | `#form-recipe` Highlights | Bare cluster (delete wraps under well) |
| Multi-Card Dialog workflow | Sibling Cards in dialog body (flex-shrink 0) | `#form-recipe` Card stack | Crushed Cards to head height |
| Toolbar strip (name + control + note) | ControlStack / ControlRow / ControlBlock | `#rhythm` | Hand-rolled flex; full-bleed FieldHint row |
| Catalog list chrome | Standalone ControlRow + md IconButton cluster | `#rhythm` catalog | Content-sized island; private hub-spread |
| PageScroll section-body chrome | Named ControlRow + md ghost IconButtons only | `#rhythm` morph | sm disks; labeled primary generate pill |
| Section strip + hint + body | `.fynns-unit-stack` (16dp) | `#rhythm` morph + hint | Bare ControlRow + sibling FieldHint (0 gap) |
| Narrow EndAside Card actions | `label=""`; one primary Button; ghost sm icons; UploadIcon export | `#layouts-demo-shell` aside | Visible label crush; tonal icons; DownloadIcon export |
| Chrome locale switch | Settings ToggleGroup en/zh | `#layouts-demo-shell` | TopAppBar language control |
| Action footer / end-align strip | `--end-align`; Cancel…→primary; one loading | `#rhythm` / `#timeline` foot | Empty-label ControlRow; Delete leftmost of Cancel |
| Error recovery | InlineAlert + hint + end-align reload | `#sandbox-inline-alert-recovery` | Start-aligned bare Button under alert |
| Service / process control | Label = status only; labeled Buttons in cluster | `#rhythm` service | Status Chip in `__controls` |
| Mode drawer tools | `--toolbar-end`; primary Plus last; ListChecksIcon bulk | `#layouts-demo-navigation-drawer` | Clipboard for bulk; twin page InfoHints |
| Bulk-select rows | Checkbox in icon/leading; checked ≠ active/selected | `#layouts-demo-navigation-drawer` | `active={checked}` wall |
| Mode drawer preference | ControlRow + InfoHint sm + track-only Switch; label inset = Item `item-pad-inline` (core ≥ **0.5.137**) | `#layouts-demo-navigation-drawer` / `#info-hint` | ControlBlock multi-sentence description; flush on body `pad-inline` only |
| Mode SyncSideFilter | Omit option `tip`; `showCheck={false}` for marks | Layouts mode sample | tip collisions; 4dp tools↔filter |
| Draft discard / save | Card `actions` on owning Card | `#sandbox-card-draft-actions` | Orphan end-align outside any Card |
| PageScroll multi-field brief | Collapsible + body md save | `#form-recipe-page-scroll` | Static tall Card; md on Collapsible head |
| Titled section shell | Card/Collapsible; short title; ≤1 InfoHint; same trail size | `#card` / `#field-header` | Mixed sm/md trail; path/count in title |
| Card head Select + Button | Trigger-band grammar; 8dp action gap | `#sandbox-card-head-select` | Title/CTA centered on expanded Select |
| Untitled well / preview | `Surface` | — | Surface as List-row substitute |
| In-content editor\|preview | `SplitPane` | `#split-pane` | Hand-rolled resize; EndAside inside Card |
| File / settings hierarchy | `Tree` / `TreeItem` | `#tree` | NavDrawer for file trees; HubTreeDisclosure |
| Chronological timeline | Timeline flat|detail; edit in Dialog | `#timeline` | Lettered A/B/C shells; rail hover edit icons |
| Empty catalog | EmptyState (`fill` if sole pane) | `#empty-state` | EmptyState as loading shell |
| Pane / section wait | `BusyRegion` (`fill` if height-resolved — FillColumn **or** PageScroll content-column ≥ **0.5.136**); one progress chrome | `#busy-region` / `#sandbox-busy-region-page-scroll-fill` | EmptyState+ring; `fill` in unit-stack/Card; FieldHint + busy in one well; BusyRegion + chrome `loading`; fill overlay collapsed → BusyStack top overflow |
| Table / list pager | `.fynns-pagination-bar` single row | `#pagination` | Two-row wrap; Select grown to crush discs |
| Time-series / combo chart | Card + ControlRow ToggleGroup + `.fynns-chart`; line = gentle **monotone** (not Catmull-Rom); hover tip follows pointer via `.fynns-chart-tooltip` + `clampChartPointerTooltipBox()` | `#chart` | Idle dense line dots; locked tooltip Y; tip clipped/jitter at edge; unit-stack inside tip; consumer hex |
| Multi-status / probe strip | ControlRow + short OK/Fail + InfoHint | `#rhythm` status | FieldHint diagnostic essays |
| Named readiness / tip status | Same ControlRow pattern | `#rhythm` | Lone tip glyph as only cluster child |
| Suffixed file body | CodeBlock editable + language; autoGrow | `#code-block` | Textarea for real extensions; fixed-height on page |
| Plain note / `.txt` | Textarea (autoGrow) | — | CodeBlock on extensionless notes |

**Chrome type & row proportion (hard — agents):** Applies to filter lists,
command palettes, menus, pickers, and similar **dense chrome lists** (live
reference: sandbox `#command-palette` vs Cursor Actions). Form / Card rhythm
stays under **Toolbar / unit rhythm** below. Also
[`.cursor/rules/chrome-proportion.mdc`](.cursor/rules/chrome-proportion.mdc).

1. **Row model first.** Before CSS, name the **primary** row shape from the
   product reference (Cursor / ChatGPT / M3):

   | Primary model | Icon / trailing | Typical height |
   | --- | --- | --- |
   | **Single-line** (icon \| label \| shortcut) | Vertically **center** on the row | ~32–36dp (pad ~8dp block + `font-size-sm`) |
   | **Two-line** (label + description stack) | Icon / shortcut align to the **title line only** — not mid title+description | Grows from content + pad; label↔description ≥ `space-2xs` |

   Do **not** design for two-line then ship a single-line reference (or the
   reverse). Optional `description` is a **modifier** (`--described`), not the
   default when the reference is single-line.
2. **Type ladder — one step max.** In one panel, primary text and secondary
   captions may differ by **at most one** t-shirt step (`md`↔`sm` or
   `sm`↔`xs`). Command / Actions chrome: search + item label →
   `--fynns-font-size-sm` (14); group / description / shortcut →
   `--fynns-font-size-xs` (12). **Forbidden:** label `md` (16) next to group
   `xs` (12).
3. **Breath from in-row pad, not crushed gaps.** Prefer item `padding-block`
   (~8dp) so a single line clears ~32–36dp. Do **not** fake density with
   `gap: 0` between label and description under a large title, or rely on tiny
   inter-row gutters while starving in-row pad. Sibling rows may sit flush;
   selection pills carry separation (Cursor Actions).
4. **Shortcut chips are keys.** Split accelerators on whitespace into separate
   `kbd` chips (`Ctrl` `Shift` `R`), not one fused string capsule.
5. **Calibrate with evidence.** Against a positive screenshot: count lines per
   row, measure title vs group font-size, icon mid vs label mid (and vs
   title+description mid when two-line). Ship only when those match the chosen
   row model. Component tokens for CommandPalette live under `COMMAND_TOKENS` /
   `--fynns-command-*`.

**Toolbar / unit rhythm** (prefer these over ad-hoc `--fynns-space-*`):

Inside a padded `Surface` / `Card` strip that is **name + ToggleGroup/Switch +
action + supporting timestamp**, use `ControlStack` + `ControlRow` +
`.fynns-control-cluster` + `ControlBlock` `description` — do **not** hand-roll
flex that stacks name+hint on the left while controls float mid/right.
**Single-row `ControlBlock`:** the hint docks in the **label column** of the
same row unit (may wrap inside that column on a narrow window); the ToggleGroup
/ cluster is **vertically centered** on name + hint. Do **not** let FieldHint
become a full-bleed next row (empty band to the right of the timestamp,
controls look top-heavy). Do **not** stuff the timestamp into `ControlRow`
`label`. Padded `Surface` is a **form host** (same label-fill + end-hug as Card
body). Live: Globals `#rhythm`. Pasteable recipe:
[`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc).

| Role | Token / host |
| --- | --- |
| Between ControlRows (toolbar) | `--fynns-layout-control-stack-gap` (**8dp**) |
| Between ControlRows (form-host) | `--fynns-layout-control-stack-form-gap` (**12dp**) |
| Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
| Label above controls (narrow) | `--fynns-layout-control-row-gap` |
| Sibling IconButtons in one cluster | `--fynns-layout-control-cluster-gap` (**4dp**). List short text meta → first `--with-end` IconButton uses optical `--fynns-list-end-actions-gap` (≥ **0.5.62**) |
| Labeled Buttons in one cluster / Dialog foot | `--fynns-layout-action-cluster-gap` (**8dp**, ≥ **0.5.52**/80) |
| TopAppBar IconButtons + NavigationRail destinations | `--fynns-layout-chrome-icon-gap` |
| Control → supporting / error hint; FieldBlock control→FieldHint | `--fynns-layout-field-hint-gap` (**8dp**) |
| FieldHeader / FieldBlock label→control | `field-label-control-gap` (**12dp**) |
| FieldHeader label row with trailing sm IconButtons | `field-header-action-row-min-height` (**32dp**); any label-row actions in a FieldStack → all headers share the band |
| Related FieldBlocks in FieldStack | `field-stack-gap` (**12dp**); +description → 16dp; +cluster → 32dp |
| Sibling ControlBlocks in FieldStack | visual **16dp** (`unit-stack-gap`) |
| Adjacent FieldStacks (fields → switches) | `form-cluster-gap` (**32dp**) + Divider |
| Unit siblings / `.fynns-unit-stack` | `unit-stack-gap` (**16dp**) |
| Nested surface frames (`chrome="plain"`, `.fynns-nest`) | `nest-gap` |

**FieldStack semantic clusters (hard):** When building inspector / settings /
Dialog / multi-section forms, **partition by meaning** with `FieldStack` —
do not leave every FieldBlock / ControlBlock as a flat Card-body sibling.

- **Same kind → one `FieldStack`:** consecutive related Input/Select/Textarea/
  Otp FieldBlocks, **or** same-kind choice cluster (Radio / Checkbox / Slider
  under FieldBlocks), **or** Preference ControlBlocks (Switch + note). Inside:
  plain FieldBlocks keep `field-stack-gap` (**12dp**); with description/error →
  next sibling `unit-stack-gap` (**16dp**); host a `.fynns-control-cluster` →
  next sibling `form-cluster-gap` (**32dp**); sibling ControlBlocks →
  `unit-stack-gap`. Choice lists use `.fynns-control-cluster--stack` (not bare
  radios in form-host ControlStack — that grid auto-flows into label|control
  columns). Stack rows share a dense 2rem min-height floor; taller children
  win. Radio **Other** + free-text Input `sm` →
  `.fynns-control-cluster--choice-extra` (same-row; keep Input mounted —
  `disabled` when Other is not selected).
- **Kind jump → adjacent FieldStacks + Divider (strongly recommended):** e.g.
  identity → choices → preference switches. Between stacks: `form-cluster-gap`
  (**32dp**) **and** a horizontal `Divider`.
- **Control + its narrative** stay one unit → `ControlBlock` (`description` /
  `errorText`). Never a loose muted `<p>` under ControlStack.
- **Copy the tree** from sandbox `#form-recipe` (same FieldStack body under
  Card, Collapsible, and dismissible Dialog).

**Recipe (hard):** Switch (or other labeled row) **and** its narrative are
**one unit** → wrap in `ControlBlock`. On a **single** ControlRow, `description`
stays in the **label column**; controls vertically center on name + hint. Form
hosts (Card body, padded Surface, centered Dialog, Collapsible body **direct**
ControlStack/ControlBlock): ControlStack is label-fill (`1fr`) + end-hug
controls (`max-content`) so Switch tracks share one trailing edge; form-host
row gap = `control-stack-form-gap` (**12dp**). Toolbar stacks outside those
hosts keep `control-stack-gap` (**8dp**). Live `#rhythm` + `#form-recipe`.

**Inset decision tree:** Panel shells (Collapsible, Drawer, Card): equal outer
inset via `--fynns-layout-content-inset` (18dp) on the **inline** edges of heads
/ `chrome="card"` bodies. Collapsible / Card `chrome="card"` body also uses
`content-inset` for **block** pad and stacks direct children with
`unit-stack-gap`. Nested surface-owning child → **`chrome="plain"`**: body pad =
`content-inset`; column gap = `nest-gap` so the child reads as a secondary inset
frame — **plain ≠ flush** (never cancel with negative margins, zero body pad, or
restyling `.fynns-*`). Custom hosts outside Card/Collapsible → **`.fynns-nest`**
(same nest-gap). Card / Collapsible heads share one `min-height`; trailing head
actions keep `space-xs` block pad so IconButton hover disks clear the edge. Do
**not** add a second padding wrapper inside those shells. Stack siblings
(section label → InlineAlert → next block) with `unit-stack-gap` — never ad-hoc
rem margins.

Long-strip / `radius-3xl` text chrome (Banner, InlineAlert, Snackbar,
ChatComposer text edge) → `--fynns-layout-strip-pad-inline` (20dp). Capsule
chrome (SearchBar beside IconButtons) →
`--fynns-layout-capsule-chrome-pad-inline` (4dp) — **not** ChatComposer shell
pad. Chat conversation column (thread + composer outer) → `dialog-inset` via
`--fynns-chat-thread-pad-inline`; composer inset **must** alias the thread
token so bubble end and composer shell end stay one vertical line. Form fields:
`Input` / field-shell inline = `capsule-chrome-pad-inline` + `field-pad-inline`
(4+12dp) so text start matches densified Select / Autocomplete; Textarea adds
`field-pad-block` (12dp) and default autoGrow (soft cap
`--fynns-layout-textarea-max-height` ≥ **0.5.103**). Centered Dialog /
ConfirmDialog: head/foot/body **inline** `dialog-inset` (24dp); form hosts fill
the `size` ceiling (prefer `size="lg"` for tall inspectors); ControlStack-only
bodies stay content-fit. FullscreenDialog inherits content-inset on head/body —
**flush-start** when the first body child (or one unpadded fill wrapper’s first
child) is a bordered well (`CodeBlock` / `Surface` / `.fynns-table-wrap`) — live
`#fullscreen-flush`. BottomSheet: asymmetric `sheet-pad-*` (M3 block≠inline);
no header|body divider (handle is enough). Do not invent rem literals for shell
**outer** insets (inter-section optical pads like head+body `space-sm` / foot
`space-lg` are the documented exception). Sandbox Layout chrome GUI edits these
via `SANDBOX_LAYOUT_AGENT_CATALOG` in `examples/sandbox/src/state/baseline.ts`.

**Icons (full library — not a subset gate):** every glyph in
[`src/primitives/icons.tsx`](src/primitives/icons.tsx) is exported from
`@fynns/ui`. Consumers may use **any** of them — do **not** treat older “public
subset” lists as an allowlist. Missing semantic → add the glyph to `icons.tsx` +
barrel + sandbox `#icons` in the same change. Prefer `IconButton` + `Tooltip`
over `title=`. Live catalog: Globals `#icons`.

**Action → glyph (hard — pick by meaning, not nearest shape):**

| Action | Use | Avoid |
| --- | --- | --- |
| Enter bulk / multi-select | `ListChecksIcon` | `ClipboardIcon` |
| Exit bulk | `CloseIcon` | `ArrowLeftIcon` as mode dismiss |
| Select all / Deselect all | `CheckSquareIcon` / `SquareIcon` | bare `CheckIcon` |
| Archive | `ArchiveIcon` | |
| Restore from archive | `UndoIcon` | `ArchiveIcon` (archive again) |
| Delete | `TrashIcon` | |
| Nav / mode exit back (TopAppBar) | `ArrowLeftIcon` | `CloseIcon` as destination back |
| Export (write file / format menu — Word, PDF, …) | `UploadIcon` | `DownloadIcon` (pull/download semantics) |
| Download (fetch / pull from remote) | `DownloadIcon` | `UploadIcon` for export menus |

**Bulk row check (hard ≥ 0.5.65):** multi-select uses leading/icon **`Checkbox`**
only — never map `checked` → `NavigationDrawerItem` `active` or `ListItem`
`selected`. Live: Layouts `#layouts-demo-navigation-drawer` (third column).

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
   stack every combo in Components. Do not expand the public barrel without
   that demo (see `llm/BREAKING_PURGE.md`).
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
   in the consumer** when the bug was reported there. Never a consumer-only
   patch. Cursor: `/constrain-then-consumer` →
   [`.cursor/skills/constrain-then-consumer/SKILL.md`](.cursor/skills/constrain-then-consumer/SKILL.md).

<!-- OPENWIKI:START -->

## OpenWiki

This repository uses OpenWiki for agent-facing docs under `openwiki/`. Start with [`openwiki/quickstart.md`](openwiki/quickstart.md), then architecture / workflows / consume.

Local updates: **Agents Hub → OpenWiki** (thin wrap: `openwiki code --update --print` + Cursor Agent CLI `auto` via `cursor-api-proxy`). Brief: [`openwiki/INSTRUCTIONS.md`](openwiki/INSTRUCTIONS.md). Prefer updating source + regenerating over rewriting seeds unless fixing a seed; authority specs stay in this file and `llm/`.

<!-- OPENWIKI:END -->
