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
**Collapsible inside List (skeleton crush)** /
**Drawer tip-fill ≠ IconButton toolbar** /
**NavigationDrawer destination gap ≠ unit-stack** /
**BusyRegion fill / loading placement** / **BusyRegion fill nested in unit-stack / Card** /
**BusyRegion transparent overlay (no surface wash)** /
**BusyRegion cold body + pager chrome siblings** /
**BusyRegion empty cold-start overlaps SearchBar** /
**BusyRegion linear overflows NavigationDrawer** /
**page-scroll host flush with Card** /
**empty ControlRow label as action footer** /
**one progress chrome per busy host** /
**bare CircularProgress as body loader** /
**private hub progress shell vs BusyRegion linear** /
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

Authority: `/constrain-then-consumer` → [`.cursor/skills/constrain-then-consumer/SKILL.md`](../.cursor/skills/constrain-then-consumer/SKILL.md).
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

## Failure mode this treaty targets: drawer headline toolbar

Symptoms (mode sidebars: Favorites / Chats / Archived / “drill-in” destination
lists):

- `NavigationDrawer` `headline` is a custom row: back `IconButton` flush-start,
  empty middle, muted count flush-end (often via a private `hub-row` +
  `CatalogCount`)
- Reads as a sparse toolbar under an already-titled `TopAppBar`, not an M3
  drawer title
- Bulk select chrome (`ListBulkToolbar`) also parked in `headline`

**Cause:** the sheet `headline` slot is M3 **static title-small** chrome
(`.fynns-nav-drawer-headline` — muted semibold padding). It is **not** a
ControlRow / Toolbar. Stuffing interactive chrome + tallies fights the type
role and leaves a hollow space-between strip.

**Consumer fix (props only):**

1. **Omit** `headline`, or pass a **plain string** title only when the app bar
   does not already name the mode.
2. Mode **back / exit** → `TopAppBar` `leading` or `DestinationAppShell`
   `leadingExtra` (`IconButton` + `Tooltip` + `ArrowLeftIcon`) next to the
   nav toggle — live sample: sandbox Layout templates `#layouts-demo-shell`.
3. **Do not** invent a floating count in the sheet title band. Do **not** pad
   Group/Item `label` with `· N` either (see **padded destination labels**
   below). Unread / notification counts → `NavigationDrawerItem` `badge`
   **only when the product actually needs a badge**.
4. Bulk / select toolbars → drawer **body** tools sibling (same band as
   `SearchBar` / `--fynns-navdrawer-search-gap`), or TopAppBar `trailing` while
   select mode is on — never `headline`.

Authority: [`AGENTS.md`](../AGENTS.md) NavigationDrawer platform row;
pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: padded destination labels

Symptoms (Favorites / Chats / Archived group rows, destination lists, root
drawer sections):

- `NavigationDrawerGroup` `label` shows `全局规则 · 1` / `Global rules · 1` /
  `Repositories · 3` — middle-dot + child count baked into the trigger text
- Or `全局（OpenCode + Cursor）` / `Project (each repo .opencode + .cursor)` /
  `共享 UI（@fynns/ui 子模块）` — parenthetical gloss / product-stack footnote
  in the title
- Same patterns on Item / Headline / TopAppBar titles “for clarity” or “for
  density”

**Cause:** agents treat folder tallies and “helpful” explanations as free label
chrome. The disclose row already has a chevron; leaves / page body carry the
detail. Padding `label` with decorative `·` + `N`, or with `(…)` footnotes the
user did not ask for, fights truncation and adds noise.

**Consumer fix (props only):**

1. Pass the **short name** only: `label="全局"` / `label="项目级"` /
   `label={g.label}` — not `` `${name} · ${n}` `` and not
   `Name（product A + product B）`.
2. If (and only if) the product needs an unread / notification mark →
   `NavigationDrawerItem` `badge` on the leaf — not on the Group trigger
   string.
3. Never invent `Name · N` or parenthetical glosses because a prior recipe
   mentioned them. Put longer explanation in page help / `InfoHint` / empty
   copy if needed.

Authority: [`AGENTS.md`](../AGENTS.md) Hard rules (chrome label copy);
pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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
   `--fynns-navdrawer-search-gap` (**8dp**, aliases layout
   `control-stack-gap`) so Search↔Item matches Search↔Toggle inside a
   tools column — wider than Item↔Item `section-gap` (4dp), never a 16dp
   kind-jump.

## Failure mode this treaty targets: NavigationDrawer Search↔Item vacant band

Symptoms: destination drawer shows a **taller empty band** between
GlobalSearch / destination `SearchBar` and the first `NavigationDrawerItem`
(“快捷链接”) than between two Item labels inside a Group (“全局规则” →
“工作流”). Icon→label horizontal gap looks fine; the complaint is
**vertical optical distance between label glyphs**.

**Cause:** `--fynns-navdrawer-search-gap` formerly aliased
`unit-stack-gap` (**16dp**) while Item↔Item uses `section-gap` (**4dp**).
Destination-density SearchBar is already a 40dp row peer — the kind-jump
inflated Search text ↔ next Item text (~40px) vs Item↔Item (~26.5px).

**Fix in core (≥ 0.4.48):** dropped the 16dp kind-jump. **≥ 0.4.52:**
`search-gap` aliases layout `control-stack-gap` (**8dp**) so Search↔Item
matches Search↔Toggle inside hub-mode tools — still well below the old
16dp vacant band; Item↔Item stays on `section-gap` (**4dp**). Live:
sandbox Layouts `#layouts-demo-navigation-drawer`. Do **not** add
consumer `margin` under `.hub-mode-nav-tools` / SearchBar to retune.

**Consumer:** bump `@fynn7/ui-design-core` ≥ 0.4.52; re-paste
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc). Keep SearchBar as a
**direct** body sibling (or a single tools host that contains it). Tools
column internal gap should stay `--fynns-layout-control-stack-gap` so it
stays in lockstep with `search-gap`.

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

## Failure mode this treaty targets: catalog ControlRow actions float mid-left

Symptoms: list panel chrome like `MCP servers (7/7)` / `技能（28/28）` shows the
name on the left, but **IconButton**s (bulk / sort / import / +) sit in a
**content-sized island** just after the label — a huge empty band to the
trailing edge of the column (Card title `actions` stay end-hug by contrast).

**Cause:** standalone `ControlRow` used to be `width: max-content` with a fixed
`--fynns-layout-control-row-label` track (toolbar-in-`ControlStack` geometry).
Catalog chrome is **not** a ControlStack preference row — it must fill the
host. Loose action siblings (or private `hub-row`) also break cluster gap.

**Fix in core (≥ 0.4.31):** standalone ControlRow (not a `ControlStack` child)
→ `width: 100%`, `1fr | max-content`, controls `justify-self: end`.

**Fix in the consumer:** keep `ControlRow` `label={<>Name ({n}/{m})</>}` and wrap
**all** trailing IconButtons in **one** `.fynns-control-cluster` (no private
`hub-spread` / `space-between` for this job). Live: sandbox `#rhythm` catalog
strip. Authority: [`AGENTS.md`](../AGENTS.md) Content density **Catalog list
chrome**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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
Section chrome stays **one** outer `Card` if needed.

## Failure mode this treaty targets: ListItem trailing IconButtons stacked vertically

Symptoms (scan / upstream / readonly path catalogs):

- Open + folder (or edit + delete) glyphs sit in a **vertical** stack on the
  trailing edge; row looks crushed / “整体错位”
- DevTools: `interactive={false}` `ListItem` with `trailing` inside
  `.fynns-list-item-trailing-icon` (~16dp) + `.fynns-control-cluster` at ~20px
  width and `flex-wrap: wrap`

**Cause:** core used to park **non-interactive** `trailing` in the decorative
16dp icon slot (and `aria-hidden`). Action clusters need the **end sibling**
(`.fynns-list-item-trailing--end`) whether or not the row is a button — same as
interactive catalogs. Secondary cause: stuffing origin/kind **`Chip`**s into
`headline` (status pills belong in tables as `.fynns-table-meta`, or list
`overline` / `trailingSupportingText`).

**Fix in core (≥ 0.4.34):** `trailing` always renders on the end sibling;
`--end` clusters are `width: auto` + `nowrap`. Live: sandbox `#list` static
catalog row. **Consumer:** keep `interactive={false}` when the row is not
selectable; pass open/folder on `trailing`; put origin/kind in `overline` /
`trailingSupportingText` — not `Chip`. Drop nested Card `max-height` list
scrollports (page scroll on FillColumn). Authority: [`AGENTS.md`](../AGENTS.md)
**Content density**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

**Also (path / link rows — scroll + glyphs):**

- **Headline = display name** in the UI font — do **not** put
  `--fynns-font-mono` / a `mono` class on CJK or mixed labels (Consolas has no
  Han → tofu / “broken icon” glyphs between Latin and Chinese).
- **Path / id** may use mono on `supportingText` only.
- Do **not** wrap the headline in `Tooltip className="tip-fill"` /
  `tip-grow` — core already ellipsizes `.fynns-list-item-headline`; tip-fill
  fights that. Optional `Tooltip` for the full **path** on supporting copy.
- Page scroll lives on the FillColumn catalog host via **`PageScroll`**
  (or `.fynns-page-scroll.fynns-scroll` → `.fynns-content-column`) — **never**
  a private `.hub-scroll` with `max-width` on the same node (rail paints on
  the Card). Pane ancestor (`hub-main`) must not add horizontal pad.
  Native bars stay hidden; overlay thumbs come from core.

Live: sandbox `#list`. Authority: [`AGENTS.md`](../AGENTS.md) **Content
density**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)
**内容密度**.

## Failure mode this treaty targets: page-scroll host flush with Card

Symptoms (Usage / Quicklinks / any Card catalog under a max-width column):

- Overlay Y scrollbar thumb sits on the **Card’s** right edge (looks like an
  inner Card scrollbar) even when Card itself is not the scrollport
- **Or** the thumb floats **inset** from the pane (`hub-main` / shell main)
  right edge — a dead strip between the rail and the pane border (CDP:
  `pageScroll.right < hubMain.right` by the ancestor’s `padding-inline`)

**Cause:** (1) `fynns-scroll` on the **content max-width** column. (2) Even with
`.fynns-page-scroll` → `.fynns-content-column`, a **padded ancestor** of the
scroll host (e.g. `.hub-main { padding-inline: dialog-inset }`) insets the
host — overlay paints at `host.rect.right − scrollbar-size`, so the rail
follows the padded content box, **not** the pane edge. The scroll parent is
the **pane** (`hub-main` / FillColumn main), not the Card.

**Fix in core (≥ 0.4.49):** Prefer the **`PageScroll`** primitive (wraps
`.fynns-page-scroll.fynns-scroll` → `.fynns-content-column`). Classes alone
still work (≥ 0.4.47): page-scroll is edge-flush with the pane
(+ `padding-inline-end: scrollbar-size` for the rail band only);
content-column carries `padding-inline: dialog-inset`. Live: sandbox
`#page-scroll`. Do **not** use `scrollbar-gutter`.

**Fix in the consumer:** FillColumn `children` = `<PageScroll>{catalog}</PageScroll>`
(or the two keep-set classes). **Do not** put `fynns-scroll` + `max-width` on
the same `.content` / `.hub-scroll` node. **Do not** put horizontal pad on
`.hub-main` / shell main **around** the page-scroll host. Bump
`@fynn7/ui-design-core` ≥ 0.4.49. CDP smoke: `card.right < pageRail.left`
and `pageScroll.right === hubMain.right`. Authority: [`AGENTS.md`](../AGENTS.md)
**FillColumn** / **PageScroll**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: BusyRegion cold body + pager chrome siblings

Symptoms (Usage sessions Card / any catalog + page-size strip):

- Cold load shows a spinner **on top of** a Sessions `Select` / `Pagination`
  strip (transparent overlay covers the whole Card `unit-stack`)
- Footer chrome is interactive under the busy mask

**Cause:** Card body renders `BusyRegion` (empty / no children) **and**
Select / Pagination as **siblings** in the same stack. `BusyRegion` overlay is
transparent and covers the region’s box — siblings painted under that box still
show through while the ring centers on the whole stack.

**Fix in the consumer:** cold-start → render **only** `BusyRegion` (no pager
siblings). After data: keep Sessions / page-size / `Pagination` **outside**
the busy wrapper; wrap **only** the List / table on refresh. Authority:
[`AGENTS.md`](../AGENTS.md) Feedback **Loading placement**. Live: sandbox
`#busy-region` cold-body sample. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: empty ControlRow label as action footer

Symptoms (Backup / Import / rebuild / Graphify footers):

- A `ControlRow` with `label=""` parks an action cluster mid-left (or leaves
  an empty label column) instead of hugging the trailing edge
- Looks like a broken catalog strip without a name

**Cause:** `ControlRow` is for **visible name \| controls**. An empty label
still allocates the form-host label track. Action-only footers need
`.fynns-control-cluster--end-align` (optional `__grow`), not a fake row.

**Fix in the consumer:** replace empty-label `ControlRow` with
`.fynns-control-cluster.fynns-control-cluster--end-align`. Keep real names on
`ControlRow` `label`. Live: sandbox `#rhythm` end-align footer. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: Drawer tip-fill stretches IconButton toolbars

Symptoms (归档 / 收藏夹 / mode sidebars under `ClippedNavShell` +
`NavigationDrawer`):

- Below destination `SearchBar`, bulk / restore IconButtons appear as
  **full-width 32dp strips stacked vertically** (≈40px step with tools-column
  gap) instead of one horizontal IconButton row
- DevTools: each control is `span.fynns-tooltip-trigger` with `width: 100%`
  inside `.hub-mode-nav-tools` (or any column tools host); often a
  Fragment of Tooltips without `.fynns-control-cluster`

**Cause:** shell CSS tip-filled **every** `.fynns-tooltip-trigger` in the
drawer body so Tooltip-wrapped `NavigationDrawerItem`s could span the track.
That rule also matched Tooltip → `IconButton` chrome. Combined with a
**column** tools host (`SearchBar` above actions) and loose Fragment
siblings (no cluster), each tip became its own full-bleed flex row.

**Fix in core (≥ 0.4.54):** tip-fill only
`.fynns-tooltip-trigger:has(.fynns-nav-drawer-item)`. Live: Layouts
`#layouts-demo-navigation-drawer` (SearchBar + `.fynns-control-cluster` of
ghost `sm` IconButtons). **Fix in the consumer:** wrap IconButton /
Tooltip strips in **one** `.fynns-control-cluster` (nowrap preferred);
keep tip-fill / `side="right"` only on destination Item wrappers. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Collapsible inside List (skeleton crush)

Symptoms (项目规则 / 项目技能 / 工作流 catalogs under `PageScroll`):

- `ul.fynns-list` shows **~19px teal/muted pills** instead of full group heads —
  reads as broken skeleton loaders
- DevTools: list children are `div.fynns-collapsible` (`ul > div`); each has
  `flex-shrink: 1`, `overflow: hidden`, height ≪ head min-height (~49px)
- Nested `ListItem`s live under Collapsible body (**orphan `li`**, not under `ul`)

**Cause:** `CatalogGroup`-style **Collapsible** (or Card / unit-stack) as a
**direct** `List` child. `.fynns-list` is a column flex; height-capped
`hub-scroll` + Collapsible `overflow: hidden` **shrinks** groups into pill
slivers. Expandable catalogs belong to **`ListItem` + `detail`** (nested
`List` inside the same `<li>`) — AGENTS **Content density**.

**Fix in core (≥ 0.4.53):** `.fynns-list > * { flex-shrink: 0 }` so mistaken
children keep intrinsic height (scroll instead of crush). Live: sandbox
`#list` expandable tree. **Fix in the consumer:** rewrite group chrome to
`ListItem` (`aria-expanded` + leading chevron + `detail={<List>…}</List>`);
never wrap Collapsible in `List`. Under page `PageScroll`, prefer **no**
nested `list-well` max-height — let the pane scroll. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode: nested short List well + invented list-well token

Symptoms (repo / graphify / skill catalogs inside a Card):

- One-row `List` paints a vertical overlay scrollbar / empty scroll chrome
  even when content fits; DevTools: `ul.fynns-list.hub-scroll` with
  `max-height: var(--fynns-layout-list-well-max-height-sm)` while the custom
  property was **undefined** (or the list cannot overflow)
- Headline hosts a `Chip` status pill beside a `tip-grow` path Tooltip;
  trailing IconButtons look cramped or stacked

**Cause:** (1) inventing `--fynns-layout-list-well-*` before core shipped it —
invalid `max-height` + `overflow-y: auto` / `fynns-scroll` still attaches
overlay hosts; (2) nesting a Card-body list scrollport for a short catalog
instead of FillColumn page scroll; (3) Chip / tip-grow fighting ListItem
slots (status → `overline` / `.fynns-table-meta`).

**Fix in the consumer:** short catalogs → plain `List` (no nested
`hub-scroll` / max-height). Long catalogs → shipped
`--fynns-layout-list-well-max-height` / `-sm` + `fynns-scroll` only when rows
can overflow. Status → `overline`; path → `supportingText` (mono OK); no
headline `Chip` / `tip-grow`. Live: sandbox `#list`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: ListItem tone stripe via wrapping div

Symptoms in a skills / rules / MCP catalog:

- Broken or double **vertical rails** (accent inset) that start/stop between
  rows; selected `radius-3xl` wash looks **clipped** or oversized empty pills
- DevTools shows `ul.fynns-list > div.hub-builtin-row--* > li.fynns-list-item-host`

**Cause:** App wraps each `ListItem` in a `div` for builtin tone (inset
`box-shadow` + wash). `ListItem` **is** the `<li>` — the wrapper breaks
`ul > li`, so overflow clip and overlay scroll rails fight the selected
pill. Comment “don’t put stripe on ListItem” was wrong for the **host**.

**Fix:** Pass tone classes on `ListItem` **`hostClassName`** (outer `<li>`).
`className` stays on the row control. Never `return <div className={tone}>{item}</div>`.
Core hosts use `border-radius: var(--fynns-radius-3xl)` + `overflow: clip` so
tone fills follow the M3 long-strip. Live: sandbox `#list` (host tone rows).
Authority: [`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: builtin ListItem looks like a square / chip island

Symptoms (agents / skills catalog, OpenCode builtins like `build` / `plan`):

- Idle builtin rows look like floating **capsules or square bars** (not the same
  transparent ListItem rhythm as neighbor rows); mono headline makes them read
  as code chips rather than catalog names
- DevTools: tone is already on `li.fynns-list-item-host.hub-builtin-row--*`
  (not a wrapping `div`) but the wash still paints square

**Cause:** (1) `.fynns-list-item-host` used `overflow-x: clip` only — with
`overflow-y: visible`, the host **background is not clipped** to
`radius-3xl`, so `hostClassName` washes read as rectangles. (2) Catalog
**display names** forced onto `--fynns-font-mono` (UI names belong on
`--fynns-font-ui`; mono is for paths / ids in supporting text).

**Fix in core:** host `overflow: clip` (both axes) so tone fills match the
long-strip radius. Live: `#list` host-tone rows. **Consumer:** keep tone on
`hostClassName`; drop `mono` from `CatalogName` / list headlines (path /
`supportingText` may stay mono). Do not invent a parallel Chip for builtins.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density** / **Font families**.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Card head actions wrap into a tall stack

Symptoms in a detail pane (skills / rules / MCP Card):

- Header `actions` IconButtons stack **2–3 rows** (~72–112dp tall) instead of one
  horizontal strip; empty band to the right of the first column of icons
- DevTools: `.fynns-card-actions > .fynns-control-cluster` hosts **nested**
  `.fynns-control-cluster` children (e.g. BookmarkActions + SourceFileActions);
  outer cluster `height` ≈ 72 while `width` is only content-sized

**Cause:** `.fynns-control-cluster` defaults to `width: 100%` + `flex-wrap: wrap`
(form / ControlRow fill). Nested clusters each claim 100% of the parent → each
group becomes its own full-width row. A sole `>` nowrap rule on the outer
cluster is not enough if nested helpers keep `wrap` / full width.

**Fix in core:** nested clusters hug + nowrap; **every** cluster under
`.fynns-card-actions` / `.fynns-collapsible-actions` (descendant) is
`width: auto` + `flex-wrap: nowrap`. Live: sandbox `#card` (narrow multi-action
head). **Consumer:** prefer one outer cluster of IconButtons; action helpers
should return a **fragment** of IconButtons (no inner cluster) when composed
into Card `actions`. Do **not** invent `flex-wrap: nowrap` in app CSS on
`.fynns-*`. Authority: [`AGENTS.md`](../AGENTS.md) Card keep-set. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: path / branch text in Card `actions`

Symptoms (shared-UI board / repo cards):

- Card head end shows mono path or branch (`main`, `src-path`) where IconButtons
  belong; DevTools: `.fynns-card-actions > span.src-path`

**Cause:** treating `Card` `actions` as a free “end of title” text slot. Keep-set
`actions` is **interactive chrome only** (`IconButton` / `Button` / `InfoHint` /
one control cluster) — same band as Collapsible head actions.

**Fix in the consumer:** omit `actions` when there is no chrome; put branch /
path / pin meta in the **body** (first unit-stack row, mono OK). Do not pad the
`title` with `Name · main` unless the user asked for that meta. Live: sandbox
`#card` (meta-in-body sample). Authority: [`AGENTS.md`](../AGENTS.md)
**Content density** titled section shell. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: status icon soup in a control-cluster

Symptoms (repo / submodule board Card body):

- One `.fynns-control-cluster` interleaves short labels (`落后` / `CI` /
  `保护`) with tip glyphs; reads as a single messy icon string; no shared
  trailing edge; DevTools shows label spans + `CatalogTipGlyph` as flat
  cluster siblings
- **Or** a Card-body `.fynns-control-cluster` whose only child is a tip
  glyph (check / close) under mono config lines — full-width empty band,
  icon floats at the start (`bounds` ~600px wide × ~16px tall)

**Cause:** using `.fynns-control-cluster` (sibling **controls** / IconButtons)
as a free-form status host. Clusters are for **≥2 sibling controls** in a
toolbar / row end (IconButtons, Switch+Toggle), not a status legend and not
a lone tip glyph.

**Fix in the consumer:** Card-body `ControlStack` of `ControlRow`s — `label` =
short status name, children = tip glyph (or muted `—`). Form-host stack keeps
label-fill + end-hug so glyphs share one trailing edge. If an apply / fix
`IconButton` shares the readiness row, put **glyph + button** in one cluster
**inside** that `ControlRow` — never lift the lone glyph into a Card-body
cluster of its own. Live: sandbox `#rhythm` status legend. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density** multi-status / named
readiness. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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
`tip-grow` / max-content the trigger. **Do not** force `--fynns-font-mono` on
CJK headlines (tofu / false “icon” glyphs) — mono is for path /
`supportingText` only. Live: sandbox `#list`. Authority:
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
fill editors also `autoGrow={false}`. Prefer `codeLanguageFromPath(path)` when
the path is known. Authority:
[`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) (`label` ≠ `language`) +
[`CONSUME.md`](CONSUME.md) Hard rule 9b. Pasteable checklist:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Textarea for a suffixed file body

Symptoms: inspector Card titled `文件内容（SKILL.md）` / `plugin.ts` /
`prompt.xml` shows a **UI-font** multiline well (native `Textarea`) — no mono
frame, no reserved Copy column, no highlight path.

**Cause:** consumer treated “editable long text” as Form `Textarea` even when
the source has a real filetype suffix. **`.md` / `.xml` / `.py` / `.ts` / … are
not notes** — they are file bodies. Only **`.txt` / `.text` / extensionless**
drafts stay on Textarea.

**Fix in the consumer:**
1. Prefer `CodeBlock` `variant="editable"` (omit `label` when the Card title
   already names the file; else titled `label` + head).
2. Pass `language={codeLanguageFromPath(path) ?? undefined}` (or an explicit
   id). `null` from the helper → keep Textarea.
3. Nesting Card → `chrome="plain"`; fixed / fill well → `autoGrow={false}`.
4. Do **not** use `ChatMarkdown` for the **source** editor of a `.md` file —
   that API renders prose; the file body stays CodeBlock.

Live: sandbox Globals `#code-block` (file-body Card). Authority:
[`AGENTS.md`](../AGENTS.md) Content density **Suffixed file body** +
[`CONSUME.md`](CONSUME.md) Hard rule 9d. Pasteable:
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

## Failure mode this treaty targets: BusyRegion colored loading wash

Symptoms: pane cold-start or refresh shows a **second** solid / washed
background under the ring (e.g. `surface-1` block that does not match
`app-bg` / the card host) — screenshot reads as “loading painted a new
colored panel”.

**Cause:** `.fynns-busy-region-overlay` used to tint with
`color-mix(... surface-1 78% ...)`, or the consumer wrapped the ring in a
private hub loading shell with its own background. **Fix in core:** overlay
`background: transparent` — host / pane shows through; `BusyScrim` keeps
`--fynns-color-overlay` for full-viewport blocks. **Fix in the consumer:**
use `BusyRegion` / `BusyScrim` as-is; do **not** restyle
`.fynns-busy-region-overlay` or invent a colored `hub-*-loading` wash under
the chrome. Bare `CircularProgress` in a tinted box is also wrong for pane
boot — use `BusyRegion` `fill`. Authority: [`AGENTS.md`](../AGENTS.md)
Feedback **Loading placement**. Live: sandbox `#busy-region` /
`#busy-region` fill sample. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: bare CircularProgress as body loader

Symptoms: Dialog body, Card body, or section `unit-stack` shows a lone
default-size (`md`) `CircularProgress` (often with a short “Loading…” label)
instead of a centered busy host — ring sits flush / content-sized at the top
of the dialog or table well; no `aria-busy` region; looks like a dangling
spinner, not a sectional load.

**Cause:** treating `CircularProgress` as a page/section loading shell.
`CircularProgress` default `md` is for **inline widgets**; body / dialog /
pane waits belong to `BusyRegion` (or `BusyScrim` for full-app). **Fix in the
consumer:** Dialog / Card / section body cold-start →
`<BusyRegion fill busy label="…" />` when the host height is resolved (Dialog
body with a min-height / FillColumn / fill pane), else
`<BusyRegion busy label="…" />` wrapping or replacing the future surface.
Button / IconButton / field trailing stay on `CircularProgress` `sm`. Do
**not** invent private hub loading CSS. Authority: [`AGENTS.md`](../AGENTS.md)
Feedback **Loading placement**. Live: sandbox Globals `#busy-region`
(section wrap + fill + **Dialog body** sample). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: BusyRegion empty cold-start overlaps SearchBar

Symptoms (收藏夹 / ChatsSidebar / any NavigationDrawer catalog):

- Circular (or linear) BusyStack **sits on top of** the drawer `SearchBar`
  (magnifier + placeholder clipped / covered)
- DevTools: `.fynns-busy-region` height ≈ **0** while `.fynns-busy-stack`
  still paints; overlay `position: absolute; inset: 0` on an empty region

**Cause:** cold-start `BusyRegion` with **no children** and **no `fill`** used an
absolute overlay. Absolute children do not size the host → height 0 → stack
overflows upward over the previous sibling (`SearchBar` / tools). Wrapping
Search **inside** BusyRegion makes the same overlap. **Fix in core (≥ 0.4.51):**
empty content + not `fill` → overlay is **relative / in-flow** so chrome sits
below tools. Live: sandbox Globals `#busy-region` drawer-tools sample.
**Consumer:** keep `SearchBar` / ToggleGroup as **siblings above** BusyRegion
(see ChatsSidebar / FavoritesSidebar) — do **not** wrap Search in BusyRegion;
do **not** invent private absolute/offset hacks on `.fynns-busy-*`. Authority:
[`AGENTS.md`](../AGENTS.md) Feedback **Loading placement**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: BusyRegion linear overflows NavigationDrawer

Symptoms (聊天记录 / ChatsSidebar / any drawer-body scan):

- `.fynns-busy-stack--linear` is **~320px (20rem)** while SearchBar /
  ToggleGroup in the same `NavigationDrawer` body are ~224px
- Teal bar + long status copy (`扫描 … 8/16099`) crosses the nav|main seam
- DevTools: stack `width` resolves from **viewport** (`100vw` / fixed `20rem`),
  not the drawer track; `BusyRegion` content-sizes to that preferred width

**Cause:** BusyStack linear used `width: min(20rem, 100vw − pads)` and a
content-sized `BusyRegion` grew with the stack; `max-width: 100%` could not
shrink a parent that had already expanded. **Fix in core (≥ 0.4.50):** stack
width is host-relative (`min(20rem, 100%)`); region / overlay use `min-width: 0`
+ `minmax(0, 1fr)` grid so the chrome cannot expand the host; message
`overflow-wrap: anywhere`. Live: sandbox Globals `#busy-region` narrow sample
(`.sandbox-busy-narrow`). **Consumer:** keep `BusyRegion` `indicator="linear"`
props-only — do **not** invent a private narrow busy CSS or `max-width` hack on
`.fynns-busy-*`. Authority: [`AGENTS.md`](../AGENTS.md) Feedback **Loading
placement**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: LinearProgress end-stop / “dotted” bar

Symptoms (Backup / Inspector / 共享 UI 子模块 / BusyRegion linear):

- Determinate bar shows a **teal end dot** (stop mark) at the track’s far end
  while active fill is only part-way — reads as a second progress thumb
- DevTools: `.fynns-linear-progress-stop` or `stopIndicator` on `LinearProgress`

**Cause:** an incomplete purge left `stopIndicator` default `true` +
`--fynns-progress-stop-size` in core while `BREAKING_PURGE` already listed the
API as removed. **Fix in core (≥ 0.4.35):** stop prop / CSS / token deleted —
active fill + remaining track only (optional gap). Live: sandbox `#progress`.
**Consumer:** drop any `stopIndicator={…}` or private end-dot CSS; keep
`TaskProgressBar` / `BusyRegion indicator="linear"` as plain bars. Authority:
[`BREAKING_PURGE.md`](BREAKING_PURGE.md) Behavioral breaking. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: private hub progress shell for section loads

Symptoms: known-progress **cold-start / section load** paints a consumer
centered shell (e.g. `.hub-progress-block` + `TaskProgressBar` /
standalone `LinearProgress`) instead of keep-set `BusyRegion` — looks like a
private loading geometry, not the sandbox `#busy-region` linear sample.

**Cause:** apps wrapped determinate bars in a hub-only flex center block
(padding / muted copy) and treated that as the section busy host. **Fix in
the consumer:** section / pane loads with known % → `BusyRegion` `fill` (or
wrap existing children) + `indicator="linear"` + `value` in `[0,1]`;
`message` = status copy only. Drop obsolete `.hub-progress-block` (or any
parallel centered progress host). Keep a domain `TaskProgressBar` /
`LinearProgress` **only** as a non-overlay strip **beside** live content
(toolbar / form row) — never as the cold-start shell, and never nested in
`BusyRegion` `message`. Authority: [`AGENTS.md`](../AGENTS.md) Feedback
**Loading placement**. Live: sandbox Globals `#busy-region` (determinate
linear). Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: BusyRegion fill nested in unit-stack / Card

Symptoms: pane or section cold-start shows `BusyRegion` `fill`, but the ring
parks at the **top** of the main column (or inside a short Card / List /
NavigationDrawer well) instead of centering in the visible pane — same
geometry as a content-sized busy host.

**Cause:** `fill` only stretches in a **height-resolved** flex parent.
Core wires that for **`FillColumn` `children`** (`.fynns-fill-column-main >
.fynns-busy-region--fill`) and shell main / canvas direct children. A
consumer that wraps every section in `.fynns-unit-stack` (children are
`flex-shrink: 0` / content-sized) or nests `fill` inside `Card` / `List` /
Dialog `unit-stack` / NavigationDrawer body **breaks** the stretch chain —
`fill` becomes a no-op. **Fix in the consumer:** pane cold-start →
`<BusyRegion fill busy … />` as the **`FillColumn` `children`** (or shell
main flex child) — do **not** park it under an App-level `unit-stack`.
Catalog siblings stay in a **section-owned** `.fynns-unit-stack` +
`fynns-scroll` **after** load. Card / List / Dialog / drawer body loads
without a resolved height → `BusyRegion` **without** `fill` (or wrap the
future surface). Do not invent a hub CSS rule that makes `unit-stack >
BusyRegion--fill` “work” — that teaches the anti-pattern. Authority:
[`AGENTS.md`](../AGENTS.md) Feedback **Loading placement** + **FillColumn**.
Live: sandbox `#busy-region` fill sample (FillColumn stage — not inside a
unit-stack). Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode: master–detail / content max-width token missing

Symptoms (hub-split / main canvas):

- List+detail grid stacks full-width in one column; DevTools shows
  `grid-template-columns: var(--fynns-layout-list-pane-width) 1fr` with the
  custom property **undefined**
- Content column sprawls (no soft max-width)

**Cause:** consumer referenced `--fynns-layout-list-pane-width` /
`nav-pane-width` / `content-max-width` before core shipped them (same class of
bug as `stats-min-col`). **Fix in core (≥ 0.4.45):** tokens exist. **Consumer:**
bump `@fynn7/ui-design-core` ≥ 0.4.45; do not invent private rem fallbacks.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density** / **FillColumn**.

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
