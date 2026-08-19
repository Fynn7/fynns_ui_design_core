# Consumer treaty — pasteable `@fynns/ui` contract

**Purpose:** give any consumer repo a short, always-on agent rule so it obeys
`@fynns/ui` even when nobody opens `AGENTS.md` / `CONSUME.md`.

**Single paste source:** [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)
(copy that entire file).

Install / design catalog remain elsewhere — this file only explains *why* and
*how* to paste. Do not duplicate the full design language here.

## How to paste (any consumer)

1. Create `.cursor/rules/fynns-ui-consumer.mdc` in the **consumer** root
   (or merge into an existing always-apply rule).
2. Paste the full contents of
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
3. Optional: one line in the consumer `AGENTS.md` / README:

   > UI: follow `.cursor/rules/fynns-ui-consumer.mdc` and
   > `node_modules/@fynn7/ui-design-core/llm/CONSUME.md` (or the core checkout).

The consume installer may also drop this rule when wiring a consumer
(`scripts/install-as-npm.mjs`); if the file already exists it is left
alone unless you re-copy by hand — **re-paste after treaty updates** (e.g. npm
consume / Dialog row recipe / **CodeBlock `label` ≠ `language`** /
**ChatMessage Markdown ownership** / **shell slot ownership** /
**Clipped ≠ text-clip** / **ControlRow toolbar rhythm** /
**List tree = ul>li + children** /
**NavigationDrawer destination gap ≠ unit-stack** /
**BusyRegion fill / loading placement** / **one progress chrome per busy host** /
**Pagination full-row stack**). Local install gate:
`consume --check` — see [`CONSUME.md`](CONSUME.md) Hard rule 5a. There is no
`consume:sync` / `consume:watch`; unreleased local tries use `file:` / `npm link`
/ publish. Formal delivery: GitHub Packages version bump
([`docs/package-propagation.md`](../docs/package-propagation.md)).

## Core-first loop (when a consumer screen is wrong)

Same task — **all three**, not pick-one:

1. **Core constraint** — token / primitive / CSS in `fynns_ui_design_core`.
2. **Sandbox demo** — update Globals / Preview / Layout sample that teaches the
   fix; browser-verify in sandbox (`#field-header`, `#form-recipe`, …).
3. **Consumer** — dispatch subagent (or continue in consumer checkout): bump core,
   props-only fix, browser-verify on the reported screen.

Authority: [`.cursor/rules/constrain-then-consumer.mdc`](../.cursor/rules/constrain-then-consumer.mdc).
Never consumer-only; never core-only without a living sandbox sample.

## Failure mode this treaty targets: sandbox-only aesthetics

Symptoms: Select / Input look rounder in the aesthetic sandbox than in a
consumer (e.g. `--fynns-radius-md` was 20px in sandbox resting but 8px in
shipped `theme.css`).

**Cause:** non-empty `SANDBOX_DEFAULT_OVERRIDES` in
`examples/sandbox/src/state/baseline.ts` — sandbox lies about the shipped
default. **Fix in core:** promote the nodded value into
`src/theme/tokens.ts` + `npm run gen:theme`, keep
`SANDBOX_DEFAULT_OVERRIDES` empty (`npm run check:wysiwyg`). Core maintainers:
public API deletes are **atomic** (export + source + sandbox demo +
`BREAKING_PURGE` Removed row) — see [`BREAKING_PURGE.md`](BREAKING_PURGE.md).

## Failure mode this treaty targets: squashed drawer

**Prefer** `DestinationAppShell` for greenfield — it syncs Drawer↔Rail for you.
Only hand-compose `ClippedNavShell` when you need a fully custom shell.

Symptoms (often on **first paint** after crowding / narrow init):

- Left column ~**80px** (`--fynns-navrail-width`)
- Labels stay **horizontal** (drawer items / headline)
- Unexpected **scrollbar** on the nav column (drawer body `overflow: auto`)
- Looks like “mini icon mode” but glyphs + text never became a real rail

**Not** a healthy `NavigationRail`. Mechanism:

1. `ClippedNavShell` sets `data-nav` / grid track from `navMode` only.
2. Crowding (`onNavCrowded` / `wouldClippedNavDrawerCrowd`) or app logic sets
   `navMode="rail"`.
3. Consumer keeps rendering `NavigationDrawer` + `NavigationDrawerItem`
   (optional `NavigationDrawerGroup` / `NavigationDrawerHeadline` for sections).
4. Drawer fills the **rail-width** track → cramped horizontal chrome + scroll.

Reference implementation:
[`examples/sandbox/src/shell/SandboxShell.tsx`](../examples/sandbox/src/shell/SandboxShell.tsx)
(`navMode` and `nav` swap together). Declarative default:
sandbox Layout templates `#layouts-demo-shell` (`DestinationAppShell`).
Catalog notes: [`AGENTS.md`](../AGENTS.md) (destination ladder).
Main canvas Preview+Chat: [`AGENTS.md`](../AGENTS.md) **FillColumn** (Layout
templates `#layouts-demo-fill-column`) — do not stack Preview / EmptyState /
Composer as canvas siblings. A catalog in that band is a scrolling
`.fynns-unit-stack` (content-sized `Surface` wells — not `fill`); crushed
~36px outlined pills with clipped ToggleGroup means the wells shrank inside
the flex column (core: default Surface is not `min-height: 0`; unit-stack
children do not shrink).

Core slot shell does **not** auto-swap Drawer↔Rail. Dev builds warn when
`data-nav="rail"` still hosts `.fynns-nav-drawer`.

## Failure mode this treaty targets: wrong shell slot / “Clipped” misread

**Naming:** `ClippedNavShell` = Material 3 **clipped** chrome (full-bleed
TopAppBar; destination column under it). It does **not** mean “clip sidebar
labels” or crop prose into a vertical strip.

**Slot ownership (hard):**

| Slot | Owns | Must not own |
| --- | --- | --- |
| `nav` | Destinations only (`NavigationDrawer` **or** `NavigationRail`) | Page body, wiki/docs, forms, Chat, Preview |
| `children` (main) | Primary canvas / route outlet | Destination lists |
| `aside` / `EndAside` | Inspector / supporting pane | The whole primary page |
| Modal `Drawer` | Temporary **content** sheet | Destination navigation |

Symptoms agents mis-attribute to “broken clipped shell”:

- Narrow vertical strip of **documentation / wiki / FAIL prose** (not
  destination labels)
- “Agents Hub”-style title visible while the strip is actually **main**
  content or a mis-nested tree under `.fynns-clipped-nav-shell-nav`
- Healthy drawer width (~192–280px+) but the **visible** bug is elsewhere

**Diagnose before CSS** (pasteable checklist lives in
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)):

1. Read `data-nav` on `.fynns-clipped-nav-shell`.
2. Measure the nav track: ~280px → drawer; ~80px → rail (rail + still
   `.fynns-nav-drawer` → squashed drawer above).
3. Find the odd copy in the DOM: under `…-nav` → move it to `children`;
   under `…-main` crushed → fix consumer layout / nesting — **do not**
   widen with local `.fynns-*` overrides.
4. Do not confuse `NavigationDrawer` (destinations) with modal `Drawer`
   (content) or the shell itself (layout only).
5. Destination row gap ≠ form unit gap: put Item / Group / Headline as
   **direct** drawer-body children (`--fynns-navdrawer-section-gap` / **4dp**,
   same as Group leaves). Do **not** wrap the list in `.fynns-unit-stack`
   (16dp) — that makes top-level rows look sparse vs folded sections.
   Destination-density SearchBar / tools as a body sibling use
   `--fynns-navdrawer-search-gap` (**16dp**, aliases `unit-stack-gap`) to
   the next destination — not the 4dp row step.

## Failure mode this treaty targets: ad-hoc Surface / inspector row chaos

Symptoms inside a `Surface` / `Card` strip:

- A field **name** and a **timestamp / hint** stacked in a left column while
  `ToggleGroup` / `Switch` / action `Button` float mid/right
- Label top-aligned, controls sitting high — ToggleGroup not centered on
  name + hint
- Hint alone on a **full-bleed** second row with a wide empty band to its
  right (common on a **narrow** window)
- Long `ControlBlock` `description` wrapping in a **~7.5rem** left band while
  the `Switch` / cluster sits end-aligned — the block grows very tall in
  Drawer / narrow `Card` (stale core grid on form hosts)

**Cause:** hand-rolled flex/grid, **or** a `FieldHint` / `ControlBlock`
`description` that still paints as a full-width next row (stale core, or the
hint is a Surface sibling instead of `ControlBlock` `description`). Stale
core may also leave the ControlBlock hint grid on fixed
`--fynns-layout-control-row-label` inside Card / Dialog / padded Surface.
**Fix:**
keep `ControlStack` + `ControlRow` `label` + `.fynns-control-cluster` +
`ControlBlock` `description` for **one short phrasing line** (timestamp,
single-sentence toggle note — do **not** put the timestamp in `ControlRow`
`label`, do **not** restyle `.fynns-*`). Core docks the hint in the **label
column** and vertically centers the cluster on name + hint. **Multi-sentence /
policy paragraphs** in a narrow Drawer or Card → **`InfoHint`** on the **same
label line** as `ControlRow` (`label={<><span className="fynns-control-row__label-text">…</span><InfoHint size="sm" … /></>}` — dense rows) — **not** trailing the Switch / action cluster and **not**
`ControlBlock` `description` (see `#info-hint`). Bump / `file:` link
`@fynn7/ui-design-core` if the consumer still shows the empty band or the
7.5rem wrap. Live: sandbox `#rhythm` + `#form-recipe` + `#info-hint`. Pasteable recipe:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **标签行 / 工具条节奏**.

## Failure mode this treaty targets: fat Surface / Card per catalog row

Symptoms: bookmarks / custom links / path shortcuts each sit in a tall padded
`Surface` or `Card`; edit/delete icons under the text (or a filled danger disk);
huge empty bands; wrong type / gap rhythm.

**Cause:** treating every datum as a section shell instead of a list row.
Nested `IconButton` inside interactive `ListItem` used to be invalid HTML, so
apps invented Surface wrappers — core now keeps interactive `trailing` **outside**
the row button. **Fix in the consumer:** one `List` of `ListItem`s —
`headline` + path `supportingText` + `trailing` = ghost `sm` `IconButton`s
(`.fynns-control-cluster`); open/confirm destructive work in `ConfirmDialog`.
Section chrome stays **one** outer `Card` if needed. Live: sandbox `#list`.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **内容密度**.

## Failure mode this treaty targets: Pagination squeezed beside page-size

Symptoms in a table / list Card footer:

- Page-size `Select` (“Rows: 10”) sits **left**, `Pagination` sits **right**
- When the Card is narrow, page numbers **wrap onto a second row** (tall
  pager, broken disc row) instead of the whole pager dropping below

**Cause:** a horizontal space-between flex (`justify-content: space-between`)
wrapping Select + Pagination as columns. Core Pagination is a **content-width
nowrap** strip — shrinking it beside a sibling is what wraps the pages.
**Fix in the consumer:** make page-size / range copy and `Pagination`
**adjacent Card-body siblings** (unit-stack-gap). Do not restyle
`.fynns-pagination*`. Live: sandbox `#pagination`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **内容密度**.

## Failure mode: KPI stat grid stacks full-width (undefined layout token)

Symptoms in a dashboard / overview:

- Four `StatCard` / `Surface` KPI tiles stack in **one column**, each stretching
  the full host width with empty space on the right
- `grid-template-columns: repeat(auto-fill, minmax(var(--fynns-layout-stats-min-col), 1fr))`
  silently falls back when `--fynns-layout-stats-min-col` is **undefined**

**Cause:** consumer invented a `--fynns-layout-*` name that core never shipped, or
typo'd the token. Invalid `minmax()` invalidates the whole grid column rule.
**Fix in the consumer:** use shipped tokens only —
`--fynns-layout-stats-min-col` (default `17.5rem`) and
`--fynns-layout-stats-min-col-sm` (`min(100%, var(--fynns-layout-stats-min-col))` on
narrow hosts). Do not hardcode rem in app CSS. Authority: [`AGENTS.md`](../AGENTS.md) **Content
density**; pasteable [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: tiny InfoHint in TopAppBar / toolbar chrome

Symptoms beside Import / Settings `IconButton`s:

- Standalone page-help `InfoHint` renders a **14px** muted “i” on a bare `<button>`
- Glyph reads smaller / dimmer than neighboring chrome icons; no 40dp hover disk

**Cause:** consumer passed `iconSize={14}`, restyled `.fynns-info-hint-trigger`, or
invented `IconButton` + `Tooltip` for pure help. Icon-only **`InfoHint`** in core
now reuses **`IconButton` `ghost` `md`** geometry (`--fynns-size-icon-target` /
`--fynns-size-icon`) with `cursor: help` — not a separate micro glyph.

**Fix in the consumer:** drop custom sizes; use default `InfoHint` in
`TopAppBar` `trailing` / `Toolbar`. Dense form rows may use `size="sm"`. Do not
restyle `.fynns-info-hint*`. Authority: [`AGENTS.md`](../AGENTS.md) principle 3
(**InfoHint**). Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Surface + FieldHeader as titled table shell

Symptoms in a dashboard / inspector:

- A wide `Table` sits in `Surface variant="outlined" padded` with `FieldHeader` as the
  section title (double pad, form-label rhythm on a data grid)
- Columns crush or clip; consumer used inline `width: 100%` / ad-hoc `overflow-x` on a
  bare `div` instead of `.fynns-table-wrap.fynns-scroll`

**Cause:** `FieldHeader` is for **form label rows** above a control; titled data tables
belong in **`Card` `title`** + table wrap host. `Surface` is for untitled wells / stages.

**Fix in the consumer:** `Card title="…"` body → `.fynns-table-wrap.fynns-scroll` →
`Table*` (no forced `width: 100%` on `.fynns-table`). Live: sandbox `#table`; hub
usage model subtotals. Authority: [`AGENTS.md`](../AGENTS.md) **Content density**.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List tree wrapped in divs / buttons in leading

Symptoms in a usage / session catalog:

- `List` (`<ul>`) children are `div.fynns-unit-stack` wrapping each `ListItem`,
  and expanded turns are more `ListItem`s **not** inside a `List` (orphan `<li>`)
- Expand control is a raw 16dp `<button>` (or app `HubTreeDisclosure`) in
  `leading` — that slot is `aria-hidden`, so the only toggle is invisible to AT
- Timestamp + title (+ a `Button`) are stuffed into `headline` (nowrap); stats
  use `ControlRow` in `trailing`; nested `Table` is `width:100%` /
  `table-layout:fixed` / `overflow-x:hidden` with a `Chip` “est.” pill

**Cause:** `ListItem` is the `<li>`. Wrapping it to attach “detail below the
row” breaks `ul > li`. `leading` is decorative. `ControlRow` is form/toolbar
name|control, not list meta.

**Fix in the consumer:** `ListItem`s are **direct** `List` children. Expand =
row `onClick` + decorative chevron in `leading` + `aria-expanded`. Nested
`List` / `.fynns-table-wrap.fynns-scroll` go in `ListItem` **`detail`** (same
`<li>`). Slots: `overline` (time / kind), `headline` (name), `supportingText`
(path), `trailingSupportingText` (duration / count cluster), trailing
`IconButton` for open-record. No `Chip` in table cells (`.fynns-table-meta`).
Live: sandbox `#list`. Authority: [`AGENTS.md`](../AGENTS.md) **Content
density**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: ListItem leading column / ellipsis / trailing island

Symptoms in a usage / session catalog (or any `ListItem` with `Tooltip` copy):

- Decorative chevron sits in a **40dp** empty leading column (Avatar-sized slot)
  so overline / headline start far to the right
- Overline, headline, and supporting are **flush** (`gap: 0`) and read cramped
- Long turn / title copy **spills** horizontally — `text-overflow: ellipsis` on
  `.fynns-list-item-headline` never paints because `Tooltip` wraps the string in
  `.fynns-tooltip-trigger` (`inline-flex` min-content = full string). Consumer
  `tip-grow` / `width: max-content` makes it worse
- `trailing` `IconButton` sits **outside** the row’s `radius-3xl` wash (valid
  sibling for nested buttons) and reads as a second floating control

**Cause:** leading was locked to Avatar `md`; content stack had no gap;
ellipsis was only on the headline box, not the Tooltip trigger; state-layer
lived only on the inner `<button>`.

**Fix in core (do not patch with app CSS):** leading hugs the glyph;
`--fynns-list-content-gap`; headline/supporting constrain `.fynns-tooltip-trigger`;
`--with-end` paints hover/selected on the **row / host**. Nested `List` under
`detail` keeps the same `--fynns-list-inset-inline` and item `--fynns-list-pad-inline`
as a top-level List (do **not** zero nested `padding-inline-start` — that flushes
the child chevron). `--with-end` pad-end / row-chrome rules are **child-only**
(`>`): a parent session with a trailing `IconButton` must not crush nested turn
rows that have no end actions. Consumer: pass `Tooltip` for the full string — do **not**
`tip-grow` / max-content the trigger. Live: sandbox `#list`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Chip as table-cell status / mapping kind

Symptoms in a wide usage / catalog table:

- A column of **Manual / Auto / Unpriced** (or similar metadata) renders as
  `Chip variant="suggestion"` (or `filter`) pills — 32dp stadium buttons next to
  muted numbers and mono ids
- The pill looks clickable even when it is not a filter; density fights the
  table caption / cell type

**Cause:** sandbox historically showed Chip in `#table`, and `Chip suggestion`
was the leftover after pill `Badge` was purged. Chip is **interactive chrome**
(filters, legends, empty starters, catalog tips) — **not** table metadata.

**Fix in the consumer:** mapping kind / row status in a `TableCell` is
`.fynns-table-meta` (muted, `font-size-xs`). Optional id stays mono + ellipsis.
Do not restyle `.fynns-chip*` to look like caption. Live: sandbox `#table`.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Select refresh crammed beside chevron

Symptoms in a settings drawer / inspector `FieldStack`:

- `Select` uses `trailing` for refresh / reload while the dropdown chevron
  shares the same trailing cluster (~50×40px)
- Hover discs overlap; refresh feels misaligned; disabled Select still shows
  two icons in one tight slot
- Or refresh `IconButton` **overflows** the drawer — Select kept a content
  `min-width` floor and did not shrink with the cluster

**Cause:** `Select` always reserves a chevron for the menu anchor. Auxiliary
actions (refresh model list, reload options) are not in-field trailing icons
when a dropdown indicator is present — they need a separate hit target. In a
control band, Select must use `fynns-control-cluster__grow` so the cluster is
**one** nowrap row (Select ellipsizes; action `flex-shrink: 0`) — not a full-
width Select plus an extra button.

**Fix in the consumer:** **`FieldBlock` + control-cluster band** — label on
`FieldHeader`; control =
`.fynns-control-cluster.fynns-control-cluster--end-align` with `Select`
`className="fynns-control-cluster__grow"` (no `trailing`) + sibling
`IconButton` + `Tooltip`. Keep **Input** reveal on `Input` `trailing`. Do not
use `FieldBlock` `actions` on the label row for Select refresh. Live: sandbox
`#field-header`, `#form-recipe`; consumer settings Model row. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: table row action not sharing one trailing edge

Symptoms in a mapping / actions column:

- Rows with an id + «Map» look end-aligned; rows with only «Map» (unmapped /
  free) sit **flush-start**, so the buttons do not share a vertical line

**Cause:** `.fynns-control-cluster` is start-packed. When the middle (id /
tooltip) is omitted, the trailing `Button` collapses to the kind caption.

**Fix in the consumer:** wrap the cell in `.fynns-control-cluster--end-align`
(nowrap). Keep a `.fynns-control-cluster__grow` flex spacer when the middle is
missing (or put `__grow` on the id / `Tooltip` trigger when it is present) so
every row’s action shares one trailing edge. Do not invent a second
`justify-content: space-between` layout. Live: sandbox `#table`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: InlineAlert + orphan List for one catalog

Symptoms in a dashboard panel:

- A warning `InlineAlert` repeats the same topic as a `List` of rows directly below
  (duplicate title + explanation + actions feel like two bands)
- Or `List` / `FieldHeader` were nested **inside** `InlineAlert` (invalid / tall strip)

**Cause:** a **titled actionable catalog** (unmapped models, path fixes, …) was split
into a page-level severity strip plus a sibling list, instead of one section shell.

**Fix in the consumer:** **`Card` `title`** + `FieldHint` (one supporting paragraph) +
`List` / `ListItem` rows in the Card body; optional warning `icon` on the Card head.
Reserve standalone `InlineAlert` for **single-line** in-panel notices with no row
catalog. Live: hub usage unmapped-models band. Authority: [`AGENTS.md`](../AGENTS.md)
**Content density**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List / FieldHeader nested inside InlineAlert

Symptoms in a settings / dashboard panel:

- Warning `InlineAlert` is **tall** with empty bands between title, hint, and rows
- Model names and trailing actions sit inside the alert tonal box; «映射» hugs the
  far edge under the icon column inset
- `FieldHeader` / `FieldHint` / `.fynns-unit-stack` / `List` / `CodeBlock` were
  passed as `children` of `InlineAlert`

**Cause:** `InlineAlert` body is a **phrasing-only** text slot (icon + copy strip).
Block hosts (`List`, form labels, unit stacks, `CodeBlock` wells) belong
**outside** the alert as `.fynns-unit-stack` siblings — same rhythm as
«section label → InlineAlert → next block» in [`AGENTS.md`](../AGENTS.md)
**Inset decision tree**.

**Fix in the consumer:** keep `InlineAlert` to title + supporting sentence
(`message` or short `children` with `<strong>` / `<br />`); stack the catalog
**below** with `Card` / `List` / `ListItem` (formula snippets → `CodeBlock`
`variant="plain"` in the Card, not inside the alert). Do not
restyle `.fynns-inline-alert*`. Live: sandbox Globals severity samples; hub usage
unmapped-models band. Authority: [`AGENTS.md`](../AGENTS.md) **Content density** +
Feedback **InlineAlert**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: CodeBlock copy covering the last glyphs

Symptoms: `variant="plain"` (or headless `editable`) one-liners hide the last
word under the hover Copy `IconButton` (e.g. a formula ending in `Output`).

**Cause:** headless copy used to `position: absolute` over the code surface with
no reserved end column. **Fix in core:** `--copy-float` pads the root by
`--fynns-space-sm` + `--fynns-size-icon-target` so wrap and nowrap stay clear.
**Fix in the consumer:** do **not** add private `padding` / `padding-right` on
`.fynns-code-block-pre`. Formula / snippet catalogs belong in `Card`
`chrome="plain"`, not nested in `InlineAlert`. Live: sandbox Globals `#code-block`
(long plain line). Authority: [`AGENTS.md`](../AGENTS.md) CodeBlock chrome.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: plain CodeBlock despite a filetype label

Symptoms: titled head shows `system-prompt.xml` / `theme.json` / `tokens.ts`, but
the body is **one-color mono** (no keyword / string spans).

**Cause:** consumer set `label` (filename chrome) but omitted `language` (or
passed an unknown id). Core does **not** infer language from the label
extension. **Fix in the consumer:** pass matching `language` / profile; for
fill editors also `autoGrow={false}`. Authority:
[`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) (`label` ≠ `language`) +
[`CONSUME.md`](CONSUME.md) Hard rule 9b. Pasteable checklist:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: vacant band under FullscreenDialog title

Symptoms: `FullscreenDialog` title looks fine, but the first body child is a
bordered well (`CodeBlock` / `Surface` / table wrap) sitting ~18dp below the
head — an empty strip between title and the well’s top border.

**Cause:** overlay body used to always apply `--fynns-layout-content-inset` on
all four sides. A framed well already paints its own edge, so the extra
block-start pad reads as a desert — not as title chrome. **Fix in core:**
flush-start (`padding-block-start: 0`) when that well is the first body child,
or the first child of one unpadded fill wrapper. **Fix in the consumer:** put
the well first; a height-only host must not add `padding-top`. Do not restyle
`.fynns-dialog-body`. Not Card `chrome="plain"` flush (`plain ≠ flush`). Live:
sandbox `#fullscreen-flush`. Authority: [`AGENTS.md`](../AGENTS.md)
**Flush-start overlay body**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: stacked progress chromes in BusyRegion

Symptoms: overlay shows **CircularProgress + LinearProgress** (or a consumer
`TaskProgressBar` inside `BusyRegion` `message`); the same counts appear twice
on one caption row (`扫描会话 10440/14179` and `10440 / 14179`).

**Cause:** `BusyStack` used to always paint a ring, so a known-progress bar
in `message` doubled the chrome. **Fix in core:** `indicator="circular"` |
`"linear"` — one widget. **Fix in the consumer:** known % / counts →
`BusyRegion` / `BusyScrim` `indicator="linear"` + `value`; `message` is status
copy (+ optional `FieldHint`) only — never nest `LinearProgress` /
`CircularProgress` / a task-progress bar. Standalone `LinearProgress` beside
content (not inside the overlay `message`) is fine. Authority:
[`AGENTS.md`](../AGENTS.md) Feedback **Loading placement**. Live:
sandbox Globals `#busy-region` (determinate sample is linear). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: literal backticks in Chat bubbles

Symptoms: assistant/user turns show raw `` `token` `` / unrendered `**bold**` /
GFM lists inside `.fynns-chat-message-prose`.

**Cause:** the app passed the LLM Markdown **string** as bare `ChatMessage`
`children`. Prefer **`markdown={md}`** or **`<ChatMarkdown source={md} />`**
(core L2 subset). Raw children stay plain prose. Authority:
[`AGENTS.md`](../AGENTS.md) **Parity note (markdown / GFM)** + pasteable
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **ChatMessage Markdown**.

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) | Install GitHub Packages + hard consume rules |
| [`consume.json`](consume.json) | Machine contract |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Custom highlight + CodeBlock language hard rules |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Short-prompt reminder |
| [`AGENTS.md`](../AGENTS.md) | Tokens + component catalog |
