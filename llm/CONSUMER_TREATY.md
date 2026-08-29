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
**org · dates glued in supportingText** /
**List rail / ChatActivity as timeline** /
**lettered timeline A/B/C / list-detail** /
**UI · — punctuation in chrome** /
**List run history stacked vertically** /
**trailingSupportingText right-hug drift** /
**trailing meta end-ink (staggered date starts)** /
**status meta far from --with-end action** /
**Collapsible inside List (skeleton crush)** /
**Drawer tip-fill ≠ IconButton toolbar** /
**ListItem zero-gap pill fuse** /
**DropdownMenu bare btn in IconButton strip** /
**sparse dashboard shortcut List** /
**NavigationDrawer destination gap ≠ unit-stack** /
**settings gear in TopAppBar / destination list (use navFooter)** /
**BusyRegion fill / loading placement** / **BusyRegion fill nested in unit-stack / Card** /
**BusyRegion transparent overlay (no surface wash)** /
**BusyRegion cold body + pager chrome siblings** /
**BusyRegion empty cold-start overlaps SearchBar** /
**BusyRegion linear overflows NavigationDrawer** /
**page-scroll host flush with Card** /
**empty ControlRow label as action footer** /
**twin Button loading rings in one control-cluster** /
**BusyRegion + chrome loading stack** /
**List trailing Select + labeled Button overlap** /
**one progress chrome per busy host** /
**bare CircularProgress as body loader** /
**private hub progress shell vs BusyRegion linear** /
**Pagination crushed or stacked off-spec** /
**GitHub Packages install auth (E401 / empty NODE_AUTH_TOKEN)**). Local install
gate: `consume --check` — see [`CONSUME.md`](CONSUME.md) Hard rule 5a. There is
no `consume:sync` / `consume:watch`; unreleased local tries use `file:` /
`npm link` / publish. Formal delivery: GitHub Packages version bump
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

## Failure mode this treaty targets: GitHub Packages install auth (E401 / empty NODE_AUTH_TOKEN)

**Consumer agents own this.** On `npm install` / `consume:install` / version bump
of `@fynn7/ui-design-core`, treat registry auth as a **first-class debug path** —
do **not** escalate as “core unpublished” or invent a sibling Vite alias until
the checklist below fails honestly.

**Symptoms:**

- `npm error code E401` / `401 Unauthorized` /
  `User cannot be authenticated with the token provided`
- `E404` for `@fynn7/ui-design-core` on **`registry.npmjs.org`** (wrong registry)
- Install works in one shell / machine and fails in another (or in CI)

**Typical causes (check in order):**

1. **Empty `${NODE_AUTH_TOKEN}` in the consumer `.npmrc`** — project
   `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}` expands to empty and
   **overrides** a working user-level `~/.npmrc` token.
2. **Missing `@fynn7:registry=https://npm.pkg.github.com`** — npm hits npmjs →
   E404.
3. **Token lacks `read:packages`** (or expired / rotated `gho_` from `gh`).
4. **Other machine / CI** never set `NODE_AUTH_TOKEN` — User env and Actions
   secrets are **not** inherited across machines.

**Consumer self-fix (do this before asking core):**

```text
# 1) Ensure non-empty token in THIS shell (Windows User env example)
NODE_AUTH_TOKEN = User env or `gh auth token` (read:packages / write:packages)

# 2) .npmrc (commit placeholder only — never a literal PAT)
@fynn7:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

# 3) Probe then install (from the directory that owns .npmrc)
npm view @fynn7/ui-design-core version
npm install @fynn7/ui-design-core@<ver>
```

CI: inject `env.NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}` (PAT with
`read:packages`). Do **not** commit secrets.

Authority detail: [`CONSUME.md`](CONSUME.md) **Auth troubleshooting (E401)**.
Pasteable hard rule: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) §2a.

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

## Failure mode this treaty targets: icon-only rail densify (narrow)

Symptoms when the window crowds or shrinks while destinations stay “open”:

- Left column is ~80px with **icons only** (`data-label-visibility=unlabeled`
  / `nav.fynns-nav-rail`)
- Badge numbers dominate; destination **names** are gone
- User wanted either a full labeled drawer (resizable) or fully collapsed

**Cause (legacy ≤ 0.4.83):** apps densified `drawer` → `"rail"` +
`NavigationRail` on narrow / `onNavCrowded` (including DestinationAppShell).

**Fix in core (≥ 0.4.84):** DestinationAppShell destinations are **binary** —
labeled `NavigationDrawer` or `hidden`. `onNavCrowded` **closes** nav (never
swaps to unlabeled rail). Narrow viewports still keep a side column for an
open drawer (no rem-capped stack — that was 0.4.83). Standalone
`NavigationRail` remains for intentional phone roots only (`#layouts-demo-navigation-rail`).

**Consumer fix:** hand-composed `ClippedNavShell` →
`navMode={open ? "drawer" : "hidden"}` + `onNavCrowded={() => setOpen(false)}`
+ drawer-only `nav` slot. Drop `narrow` / `compact` → rail branches and
`railLabelVisibility`. Re-paste `consumer-cursor-rule.mdc`.

## Failure mode this treaty targets: stacked drawer ribbon (narrow)

Symptoms when the window is ≤56.25rem (~900px) and destinations stay open
**(legacy ≤ 0.4.82 only)**:

- Nav is a **full-width band under the TopAppBar** (~9rem / 144dp tall historically)
- Only SearchBar + account footer peek through; destination rows are clipped
- DevTools: `data-nav="drawer"` + `.fynns-nav-drawer` with tiny `height` /
  `max-height` while `visible_text` still lists every destination

**Cause (legacy core ≤ 0.4.82):** narrow CSS stacked `NavigationDrawer` above
main with `max-height: 9rem`.

**Fix in core (≥ 0.4.83):** narrow keeps a **side column** for drawer (and for
intentional rail). Do **not** densify to icon rail — see **icon-only rail
densify** above (≥ 0.4.84 closes instead).

**Consumer fix:** binary drawer|hidden (same as DestinationAppShell). Drop any
private CSS that re-stacks the drawer.

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
   nav toggle — live samples: sandbox Layout templates `#layouts-demo-shell`
   (decorative) and **`#layouts-demo-drill-in`** (interactive drawer-body
   swap + full-width main detail).
3. **Do not** invent a floating count in the sheet title band. Do **not** pad
   Group/Item `label` with `· N` either (see **padded destination labels**
   below). Unread / notification counts → `NavigationDrawerItem` `badge`
   **only when the product actually needs a badge**.
4. Bulk / select toolbars → drawer **body** tools sibling (same band as
   `SearchBar` / `--fynns-navdrawer-search-gap`), or TopAppBar `trailing` while
   select mode is on — never `headline`.

Authority: [`AGENTS.md`](../AGENTS.md) NavigationDrawer platform row;
pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: main-canvas list|detail split (hub-split)

Symptoms:

- Catalog sections keep a **list column inside main**
  (`grid-template-columns: var(--fynns-layout-list-pane-width) 1fr` / private
  `hub-split`) while root destinations stay in the drawer — then “Chats /
  Favorites” modes **move the list into the drawer**, so switching sections
  feels like a full page shell swap
- Main hosts both the pick list and the editor; narrow breakpoints stack
  inconsistently with drill-in modes

**Cause:** treating `--fynns-layout-list-pane-width` as the default catalog
layout. That token is for rare **main-internal** master–detail grids only.
Destination apps that already have a NavigationDrawer should put the catalog
list in the **nav track** (drawer-body morph) and keep **main full-width
detail** (M3 compact list-detail / Cursor Agent layout).

**Consumer fix (props / shell state only):**

1. Entering a catalog destination → **swap** `ClippedNavShell.nav` to
   `NavigationDrawer` + `NavigationDrawerItem`s (+ optional
   `SearchBar density="destination"`). Omit drawer `headline` toolbar.
2. Mode exit → TopAppBar back (`leading` / `leadingExtra`) — see
   **drawer headline toolbar** above.
3. Selection drives main detail (`EmptyState` when none). Do **not** remount
   the whole shell on each selection.
4. Flat root-only apps → keep `DestinationAppShell`. Any dynamic nav body →
   hand-compose `ClippedNavShell` (no `NavStack` primitive).
5. Optional `EndAside` remains a **third** supporting axis — not the catalog
   list column.

Live: sandbox Layout templates **`#layouts-demo-drill-in`**.
Authority: [`AGENTS.md`](../AGENTS.md) DestinationAppShell / ClippedNavShell /
NavigationDrawer. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Card title count glued (OpenSpec8)

Symptoms (上游资产 / any catalog Card):

- Card head reads as **`OpenSpec8`** / `oh-my-opencode-slim12` — section name
  and entry count fused with **no gap**
- DevTools: `.fynns-card-title > .fynns-control-cluster` wraps a text node +
  muted `<span>{n}</span>` but computed `display` is **`block`**, not flex

**Cause:** consumers put count meta in `Card` `title` via
`fynns-control-cluster`. Core (≤ **0.4.90**) forced
`.fynns-card-title > * { display: block }` for mono ellipsis — that **cancelled
the cluster’s flex + gap**. Separately, counts in Card `title` fight the
**short section name** rule (meta belongs in body / catalog ControlRow).

**Fix in core (≥ 0.4.91):** `.fynns-card-title > .fynns-control-cluster` keeps
`display: flex`; only non-cluster children stay `display: block` for ellipsis.
Live: sandbox `#card` meta-in-body sample (`cardMetaBody*`).
**Fix in the consumer:** `title="OpenSpec"` (short name only). Put counts /
paths in the **body** as `.fynns-table-meta` (or omit — the List already
shows rows). Do **not** invent title clusters for tallies. Authority:
[`AGENTS.md`](../AGENTS.md) Hard rules **padded destination labels** + Card
`actions` / Content density. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: crushed command / menu chrome proportion

Symptoms (command palette, filter lists, menu rows — often after “tighten
density” or “align icons”):

- Item label at `font-size-md` (16) next to group captions at `xs` (12) —
  reads as some text too big / some too small
- Label↔description `gap: 0` under a large title while inter-row gutters stay
  tiny — “行间距崩溃”
- Leading icon centered on title+description when the product reference is
  **single-line** (Cursor Actions), or the reverse for two-line rows
- Shortcuts as one fused capsule (`Ctrl K`) instead of split key chips

**Cause:** agents skip naming the **primary row model**, then invent type
steps and crush gaps for “density.” Rhythm must come from **in-row pad** and
a **one-step** type ladder.

**Fix (core first):** follow [`AGENTS.md`](../AGENTS.md) **Chrome type & row
proportion**; live `#command-palette`. Consumers: props only — do not restyle
`.fynns-command-*`.

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

## Failure mode this treaty targets: settings gear in TopAppBar / destination list

Symptoms (Cursor-like destination apps):

- Settings / Preferences control lives in TopAppBar `trailing` while the
  left column has no account / footer chrome
- Settings is a last `NavigationDrawerItem` with consumer
  `margin-top: auto` (or private spacer) to fake a pinned footer
- Account / project / workspace strips reinvented as Card rows inside `nav`

**Cause:** destination sheet had no public footer slot — agents parked
settings in the app bar or last destination.

**Fix in core (≥ 0.4.59):** `NavigationDrawer` / `NavigationRail` `footer`
+ `DestinationAppShell` `navFooter`. Footer recipe: `.fynns-nav-drawer-footer-account` +
`.fynns-nav-drawer-footer-account-start` (`Avatar` + optional
`.fynns-nav-drawer-footer-account-label` — soft end fade **only when the
name truncates** (`data-fade` from DrawerSheet; ≥ **0.4.130** — short names
must not fade), not `…`) + settings
`IconButton` **`size="sm"`** end (core optical glyph align — not default md
40dp disk). Footer / rail footer: **no** `border-block-start` hairline
(≥ 0.4.64 — Cursor separates with pad only). When drawer **body** content
overflows downward, core applies `data-fade-bottom` / `data-fade-top` mask
fades on `.fynns-nav-drawer-body` (≥ 0.4.65) — soft edge into the account
footer, not a hard clip + divider. Omit account
label → avatar/initial only; identity in `Tooltip` on avatar. Live: sandbox
Layouts `#layouts-demo-shell` (toggle **Show account name** / **Long account
name**) + SandboxShell +
`#layouts-demo-drill-in`. DestinationAppShell (≥ 0.4.84) keeps the drawer
footer when open and **closes** on crowd — no rail densify that hides the
account label strip.

**Consumer:** bump ≥ 0.4.84 for binary drawer|hidden; pass `navFooter`
(or Drawer/Rail `footer`); workspace row in body — do **not** `margin-top: auto`
a destination Item; do **not** put settings in TopAppBar `trailing` when the
product wants Cursor-style bottom chrome; do **not** also list Settings as a
root `NavigationDrawerItem` beside the footer gear.

## Failure mode this treaty targets: footer settings gear md disk / asymmetric inset

Symptoms (NavigationDrawer / DestinationAppShell footer):

- Settings `IconButton` uses default **md** (40dp hover disk) beside **sm**
  (32dp) `Avatar` — reads as an oversized gear vs account chrome
- Settings glyph right edge sits **~16dp** inside footer pad while Avatar
  left edge sits at `--fynns-navdrawer-pad-inline` (~10dp) — asymmetric

**Cause:** footer recipe omitted `size="sm"` on settings; md disk centers 16dp
glyph inside 40dp target.

**Fix in core (≥ 0.4.109):** settings `IconButton` **`size="sm"`** +
`.fynns-nav-drawer-footer-account` optical end-align (glyph edge = pad-inline,
same math as Dialog close). Rail footer resets margin (gear stays centered).
Live: sandbox `#layouts-demo-shell` + `NavDrawerFooterAccount`.

**Consumer:** bump ≥ 0.4.109; footer gear `size="sm"` + keep public
`.fynns-nav-drawer-footer-account` structure — no private negative margins.

## Failure mode this treaty targets: drawer footer Avatar/settings packed tight

Symptoms (NavigationDrawer / DestinationAppShell `navFooter`):

- Avatar (start) and settings gear sit with only **~4dp** breath; faded
  account label kisses the gear
- Row does not read as Cursor-style **left account | right settings** across
  the sheet width

**Cause:** `.fynns-nav-drawer-footer-account` reused
`--fynns-layout-control-cluster-gap` after that token densified to **4dp**
(0.4.122) for IconButton strips — wrong rhythm for the account row.

**Fix in core (≥ 0.4.124):** account row `width: 100%` +
`justify-content: space-between` + gap `--fynns-layout-control-stack-gap`
(**8dp**); settings keeps `margin-inline-start: auto` + optical end inset.
Live: `#layouts-demo-shell` / `NavDrawerFooterAccount`.

**Consumer:** bump ≥ 0.4.124; keep `.fynns-nav-drawer-footer-account` +
`account-start` + end `IconButton` `sm` — do **not** invent private
`space-between` / gap CSS.

## Failure mode this treaty targets: drawer footer Avatar↔label packed tight

Symptoms (NavigationDrawer / DestinationAppShell `navFooter` with account
label visible):

- Avatar and `.fynns-nav-drawer-footer-account-label` sit with only **~4dp**
  (reads as “本地” kissing “本地用户”)
- Sheet edge inset is ~10dp (`pad-inline`) but Avatar↔copy is denser

**Cause:** `.fynns-nav-drawer-footer-account-start` reused
`--fynns-layout-control-cluster-gap` after that token densified to **4dp**
(0.4.122).

**Fix in core (≥ 0.4.125):** start-column gap =
`--fynns-navdrawer-pad-inline` (**~10dp**) — same as footer L/R inset /
Avatar↔drawer edge. Live: `#layouts-demo-shell` (Show account name on).

**Consumer:** bump ≥ 0.4.125; no private Avatar↔label gap.

## Failure mode this treaty targets: drawer footer middle still packed (flex-grow)

Symptoms (NavigationDrawer / DestinationAppShell `navFooter`):

- Avatar at start and settings at end of the **sheet** look correct in
  bounds, but the faded account label still **kisses** the gear — only
  ~8dp between label box and disk; no Cursor-style empty middle band
- Bumping 0.4.124 / 0.4.125 appears to “do nothing” for Avatar↔settings

**Cause:** `.fynns-nav-drawer-footer-account-start` (and the label) used
`flex: 1` / grow — free space went **inside** the start column, so
`justify-content: space-between` never opened a visible middle.

**Fix in core (≥ 0.4.126):** `account-start` and label `flex: 0 1 auto`
(hug / shrink) + start `max-width` reserving the gear; parent keeps
`space-between` + `control-stack-gap`. Short names leave a clear middle
band; long names fade before the gear. Live: `#layouts-demo-shell`.

**Consumer:** bump ≥ 0.4.126; keep public footer-account structure — do
**not** set `width: 100%` / `flex: 1` on `account-start` in app CSS.

## Failure mode this treaty targets: drawer footer Avatar/gear flush to sheet edge

Symptoms (NavigationDrawer / DestinationAppShell `navFooter`):

- Avatar sits at **~10dp** from the sheet start while destination icons sit
  at **~26dp** (`pad-inline` + `item-pad-inline-start`)
- Settings sm disk ends **~2dp** from the sheet end (Dialog-style optical
  `margin-inline-end: −8` on top of footer pad only)
- Feels “restored middle band but still cramped to the chrome edges”

**Cause:** account row omitted Item-level inline pad; optical end pull was
tuned for glyph↔pad-inline, not disk↔sheet symmetry with destinations.

**Fix in core (≥ 0.4.127 / adjusted **0.4.128** / equal four-way **0.4.129** /
Cursor-calibrated **0.4.131**):**
drop settings optical `margin-inline-end: −8`. Do **not** stack
`item-pad-inline-*` on the account row (~26dp over-pad in 0.4.127).
**0.4.129 / 0.4.131:** `.fynns-nav-drawer-footer` uses
`--fynns-navdrawer-footer-account-inset` (**≈16dp** / `space-lg`; was 12dp
in 0.4.129) on all four
sides so Avatar↔sheet start, settings↔sheet end, and both disks↔sheet bottom
are **equal** (top breath matches). Sheet `padding-block-end` stays 0 when a
footer is present. Live: `#layouts-demo-shell`.

**Consumer:** bump ≥ 0.4.131; do **not** invent private footer pad /
negative margins on the gear.

## Failure mode this treaty targets: short account label always fades

Symptoms (NavigationDrawer / DestinationAppShell `navFooter`):

- Short names (`本地用户` / `Sample user`) show a **soft end fade** on the
  last glyphs even though the string fully fits
- Feels like damaged / translucent copy next to a wide empty middle band

**Cause:** `.fynns-nav-drawer-footer-account-label` always painted a
1.25rem end `mask-image`. Content-hug short labels are only as wide as the
glyphs, so the mask ate the trailing characters.

**Fix in core (≥ 0.4.130):** DrawerSheet sets `data-fade` only when
`scrollWidth > clientWidth`; CSS mask applies solely under `[data-fade]`.
Live: `#layouts-demo-shell` (short default; optional long-name toggle).

**Consumer:** bump ≥ 0.4.130; keep the public `footer-account-label` class —
do **not** force a private always-on mask.

## Failure mode this treaty targets: feature panels parked in Settings

Symptoms:

- Root destination **Settings** (or footer gear → Settings) hosts LLM /
  provider / tool / catalog / generation-pipeline Cards next to (or instead of)
  locale / appearance / account
- Drawer shows both an active **Settings** `NavigationDrawerItem` and a footer
  settings gear for the same screen

**Cause:** treating Settings as a catch-all inspector. Cursor-style apps keep
**software chrome** prefs under the footer gear; **feature** surfaces are
first-class destinations.

**Fix in the consumer:**

1. Entry: `navFooter` settings `IconButton` only — remove Settings from
   `destinations[]` when the footer gear opens that screen.
2. Settings body: locale / theme / account / other **software** prefs only
   (UI language = `FieldBlock` + compact `ToggleGroup` — **not** TopAppBar).
3. Feature / runtime panels → their **own** destinations (or feature Cards on
   those pages) — not under Settings.

Live: Layouts `#layouts-demo-shell` (footer gear → software prefs Card;
destinations stay Home / Search / Archive). Authority: [`AGENTS.md`](../AGENTS.md)
Hard rules. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: mode drawer tools↔filter crushed to 4dp

Symptoms (MCP / skills mode sidebars): `--toolbar-end` IconButton strip and
the SyncSideFilter `ToggleGroup` (or preference `ControlRow`) sit almost
flush — DevTools ~**4px** between `hub-mode-nav-tools` bottom and the
filter top — while Item↔Item also reads ~4dp.

**Cause:** `.fynns-nav-drawer-body > * + *` defaulted to `section-gap`
(**4dp**). `--fynns-navdrawer-search-gap` (**8dp**) only matched
`SearchBar` / `:has(.fynns-search-bar)` — mode drawers with **no** SearchBar
(toolbar + ToggleGroup + catalog) never got the chrome step.

**Fix in core (≥ 0.4.98):** `search-gap` also applies when a body sibling is
`.fynns-toggle-group`, `:has(.fynns-control-cluster--toolbar-end)`, or a
direct `ControlRow` host — chrome↔ chrome and chrome ↔ destinations.
Live: Layouts `#layouts-demo-navigation-drawer` mode sample. Do **not**
invent consumer `margin` / private gap under `.hub-mode-nav-tools`.

**Consumer:** bump ≥ 0.4.98; keep tools host + SyncSideFilter as **direct**
drawer-body siblings (no extra wrapper that drops `:has(--toolbar-end)`).
Re-paste [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: diagnostic prose wall (probe / connection)

Symptoms (Settings / LLM backend / sync Cards):

- Card body is a `.fynns-unit-stack` of `FieldHint` (or muted `<p>`) lines like
  `Ollama: Fail — reachable but model '…' not found. Installed: a, b, c, …`
- Long installed-model lists, proxy URLs, and API-key reasons sit **inline** so
  the Card grows into a text wall; hard to scan OK vs Fail

**Cause:** treating probe / connection detail as visible body copy. `FieldHint`
and `ControlBlock` `description` are for **one short phrasing line** — not
multi-sentence diagnostics or comma-lists.

**Fix in the consumer:**

1. One `ControlStack` of `ControlRow`s — `label` = short service name
   (`Ollama` / `Gemini` / …).
2. Children = short status (`OK` / `Fail` / `-`) **plus** `InfoHint` `size="sm"`
   (or tip glyph + `InfoHint`) whose `content` holds the long reason /
   installed list / proxy URL. **`Fail` rows:** `InfoHint` `tone="danger"` so
   the help glyph reads as error detail — OK rows stay default tone.
3. Do **not** concatenate `Name: Fail — essay` into a FieldHint stack.

Live: sandbox `#rhythm` status legend + `#info-hint`. Authority:
[`AGENTS.md`](../AGENTS.md) Hard rules + Content density **Multi-status /
probe strip**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: settings Card FieldHint wall (hint compression)

Symptoms in a settings / provider Card (`FieldStack` of backends / models):

- Card body opens with a full-width **`FieldHint`** paragraph (session scope,
  env defaults, browser persistence, …) before any control
- **`FieldBlock` `description`** under a Select repeats catalog source /
  refresh / cache policy in visible copy
- Reload behavior is buried in a one-word **`IconButton` `Tooltip`** while the
  paragraph stays visible
- Status lines (`Model list as of …`) stack as more **`FieldHint`** siblings

**Cause:** using **`FieldHint` / `description`** as the default help surface
instead of **compressing**: short action copy → **Tooltip** on the
**IconButton**; medium field / section policy → **`InfoHint`** on the label row
or Card `actions`; **`FieldHint`** only for one-line validation / format /
empty-state.

**Fix in the consumer (props only):**

1. Remove Card-body scope essays → **Card `actions` `InfoHint`** (≤1) or omit.
2. Remove multi-sentence **`FieldBlock` `description`** → **`FieldBlock`
   `actions` `InfoHint` `size="sm"`** on the label row.
3. Put reload / cache / failure copy on the refresh **`Tooltip`** (`content` =
   full sentence; short `aria-label`).
4. Fold “last updated” into that Tooltip or drop the visible line.

Live: sandbox `#field-header`. Authority: [`AGENTS.md`](../AGENTS.md) Hard
rules (**hint compression**) + Content density. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: language control in TopAppBar

Symptoms (CV Generator / destination apps):

- TopAppBar `trailing` shows compact **`ToggleGroup`** (`English` | `中文`) or a
  chevron **`Select`** pill for UI locale
- Settings screen has no language row while the app bar carries chrome locale

**Cause:** treating binary locale as always-on app-bar chrome. After software-
prefs densify, locale belongs with other Settings body prefs opened from the
footer gear — not beside theme / search IconButtons.

**Fix in the consumer:**

1. Remove language from TopAppBar `trailing`.
2. Put compact **`ToggleGroup`** (`showCheck={false}`, `English` / `中文`) in
   Settings inside a `FieldBlock` (copy sandbox
   `examples/sandbox/src/components/LanguageSwitcher.tsx`).
3. Do **not** invent a core `LanguageSwitcher` primitive. Longer locale lists
   may use `Select` **inside Settings** only.

Live: Layouts `#layouts-demo-shell` Settings Card + Templates language Card.
Authority: [`AGENTS.md`](../AGENTS.md) **Chrome locale switch**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Select language pill in TopAppBar

> **Superseded for placement by the failure mode above** (language leaves the
> app bar entirely). Kept for agents still shipping chevron Select in chrome:

Symptoms (legacy):

- TopAppBar `trailing` shows a **chevron Select** pill (`中文 ▼` / `English ▼`)
  for English ↔ Chinese UI locale

**Fix:** move language to Settings as compact `ToggleGroup` in a `FieldBlock`
— never Select in TopAppBar. See **language control in TopAppBar** above.

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

## Failure mode this treaty targets: org · dates glued in supportingText

Symptoms (experience / job / internship catalogs):

- `supportingText` reads `Vodafone · 2025-10 – 2026-03` (or `Acme · Jan 2024`)
- Org and date range share one muted line under the title; middle-dot / en-dash
  stacks unrelated meta; row looks like a prose blob instead of a list record

**Cause:** joining every secondary field with ` · ` / fancy dashes into one
`supportingText` string instead of using List slots. **Fix in the consumer:**
`headline` = role/title; `supportingText` = **organization only**; date range →
`trailingSupportingText` (ASCII hyphen: `2025-10 - 2026-03`; stays inside the
row button — layout separates L/R); `trailing` IconButtons stay on the end
sibling. **Never** invent a private third text column or keep `·` / `–` / `—`
glue. Live: sandbox `#list` org+dates sample. Authority:
[`AGENTS.md`](../AGENTS.md) Content density **Title + organization + date
range** + Language **UI punctuation**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List rail / ChatActivity as timeline

Symptoms (dated history / experience catalogs in a consumer):

- Consumer CSS paints a start tick, inset rail, or `::before` bar on `ListItem`
  to look “chronological”
- `ChatActivity` / `Tree` hosts dated role rows (missing org+date columns, wrong a11y)

**Cause:** List hard-forbids start rails (kind = leading icon only); ChatActivity
is agent tool status; Tree is file/settings hierarchy. **Fix:** use
**`Timeline` / `TimelineItem`** for a vertical rail (optional `detail` bullets),
or keep plain List org+dates without a fake rail — never a private timeline
clone — never invent a List+chevron fake rail. Live: sandbox
`#timeline`. Authority: [`AGENTS.md`](../AGENTS.md) Content density
**Chronological timeline** + [`.cursor/rules/timeline-catalog.mdc`](../.cursor/rules/timeline-catalog.mdc).
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: lettered timeline A/B/C / list-detail

Symptoms (core sandbox or consumer layout pickers):

- Visible chrome ranks hosts as **A / B / C**, `Variant A`, `Shell B`,
  `A · flat`, `C with detail`
- A third layout mode **`list-detail`** (List + chevron expand sold as a
  timeline middle option alongside flat Timeline / Timeline+detail)

**Cause:** treating density research as shippable product UI; List expand ≠
Timeline rail. **Fix:** keep-set / sandbox teach **exactly two** unlabeled
shells — **flat** Timeline and Timeline **with `detail`**. Consumers may keep
plain List org+dates as a separate density (no rail) — never letter the trio,
never revive `list-detail` as recommended. Gate:
[`.cursor/rules/timeline-catalog.mdc`](../.cursor/rules/timeline-catalog.mdc);
`npm run check:no-consumer`. Live: `#timeline`.

## Failure mode this treaty targets: Timeline node/chevron kissing copy

Symptoms (`Timeline` / Experiences-style dated rows):

- Headline / org sit ~4dp from the **node** glyph (reads glued to the rail)
- Consumer tries private `margin-inline-start` / pad on `.fynns-timeline-*`

**Cause:** early Timeline used `space-md` (12dp) for node→copy. **Fix (core
≥ 0.5.6):** `--fynns-timeline-gap` aliases `list-gap` (**16dp**). Expandable
chevron is **not** a second 16dp column beside the copy — it tucks into
`pad-inline-start` (≥ 0.5.15). Consumers bump only — do **not** restyle
`.fynns-timeline-*`. Live: `#timeline`. Authority: [`AGENTS.md`](../AGENTS.md)
Content density **Chronological timeline**.

## Failure mode this treaty targets: Timeline flat vs detail headline stagger

Symptoms (sandbox `#timeline` flat shell next to with-`detail` shell):

- Flat headlines start ~32dp left of expandable headlines (chevron + 16dp gap
  shoved the title)
- Consumer tries private negative margin on `.fynns-timeline-item-chevron` /
  pad on `.fynns-timeline-item-copy`

**Cause:** expandable rows painted chevron **before** the copy after a full
`pad-inline-start`, then added a second `chevron-gap` that still aliased
list-gap (**16dp**). **Fix (core ≥ 0.5.15):** chevron lives **inside** the
pad band — `chevron-inset` (wash→glyph breath) + icon + `chevron-gap`
(remainder, ~4dp — **not** list-gap) = `pad-inline-start`, so flat and
detail **headline** starts match; detail bullets use the same start (no
extra icon+gap in `detail-pad-inline-start`). Consumers bump only. Live:
`#timeline`.

## Failure mode this treaty targets: Timeline hover pill kissing the node

Symptoms (interactive / expandable Timeline rows on hover):

- The row hover wash (pill) starts flush against the node disc — the **16dp**
  flex gap disappears under the wash
- Consumer tries private `::after` / negative margin on `.fynns-timeline-item`

**Cause:** early hover wash used `inset-inline-start: node-col` only, so the
pill painted across the node→copy gap. **Fix (core ≥ 0.5.8):**
`--fynns-timeline-hover-inset-inline-start` = `node-col` + `gap`. Consumers
bump only — do **not** restyle `.fynns-timeline-*`. Live: `#timeline`.
Authority: [`AGENTS.md`](../AGENTS.md) Content density **Chronological
timeline**.

## Failure mode this treaty targets: Timeline hover pill flush text (zero inner pad)

Symptoms (interactive Timeline rows on hover — Experiences / `#timeline`):

- Headline / supporting / expandable **chevron** sit **flush** on the pill’s
  **start** edge (rounded wash kisses the first glyph) even when node↔wash
  gap looks correct
- Consumer tries private `padding-inline-start` on `.fynns-timeline-item-*`

**Cause:** hover wash starts at `node-col` + `gap` (content box start) while
inner pad was missing or only List `pad-inline` (**16dp**) — shorter than
wash `radius-md` (**20dp**), so the first child still reads flush inside the
curve. **Fix (core ≥ 0.5.10):** `--fynns-timeline-pad-inline-start` =
`radius-md` + `space-xs` (**24dp**) on `.fynns-timeline-item-content`; detail
indent adds the same step. Consumers bump only — do **not** restyle
`.fynns-timeline-*`. Live: `#timeline`. Authority: [`AGENTS.md`](../AGENTS.md)
Content density **Chronological timeline**.

## Failure mode this treaty targets: Timeline disc not centered on copy

Symptoms (two-line org+dates `TimelineItem` — Experiences / `#timeline`):

- Default disc sits on the **title line only** (or floats high) while the
  full `.fynns-timeline-item-copy` (headline + org) reads as one block —
  disc mid ≠ copy mid
- Consumer tries private `align-items` / `margin-block` on
  `.fynns-timeline-node` / `.fynns-timeline-node-disc`

**Cause:** 0.5.14 locked the node to the headline band and top-aligned it;
rail used `node-band/2`. **Fix (core ≥ 0.5.16):** two-line rows
`align-items: center` so the node centers on the copy stack; rail mid uses
`--fynns-timeline-copy-band-2` (`pad-block + copy-band-2/2`) so the stroke
still meets the disc (no stub above the first ball). Consumers bump only —
do **not** restyle `.fynns-timeline-*`. Live: `#timeline`. Authority:
[`AGENTS.md`](../AGENTS.md) Content density **Chronological timeline**.

## Failure mode this treaty targets: Timeline row hover edit/delete icons

Symptoms (dated history / Experiences-style `Timeline` catalogs):

- Pencil / trash `IconButton`s appear on hover (`--with-end` overlay) beside
  date meta — same chrome as List path catalogs
- Leading kind glyphs + hover edit/delete stacked on the rail as the default
  recipe; row click also expands `detail` while icons open edit (dual paths)

**Cause:** copying List `--with-end` hover actions onto Timeline. Chronological
catalogs read as a clean rail; edit/delete belong after the row opens a form.
**Fix:** flat `TimelineItem` `onClick` → **`Dialog` `size="lg"` +
`showCloseButton`**; edit fields + delete in the Dialog foot —
LTR **Cancel → Delete → Save** (≥ **0.5.17**; `ConfirmDialog` for destroy —
see **Dialog foot Delete leftmost of Cancel**). Prefer omit `leading`
(default disc) — kind / role via Dialog fields. `detail` expand is **read**
disclosure only; when the row opens an edit Dialog, prefer flat + bullets
in the Dialog body. List path / status rows may keep trailing hover
IconButtons — that is not the Timeline default. Live: sandbox `#timeline`.
Authority: [`AGENTS.md`](../AGENTS.md) Content density **Chronological
timeline** + Hard rules. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: UI · — punctuation in chrome

Symptoms (any destination / list / status chrome):

- Visible labels use middle-dot **`·`** as a field joiner (`Name · N`,
  `Org · dates`, `A · B`)
- Em-dash **`—`** or decorative en-dash **`–`** appears in chrome strings as
  prose separators or fancy range marks (not a lone empty trail mark that
  should be ASCII `-`)

**Cause:** treating UI meta like newspaper / CV body copy instead of structured
slots. **Fix:** split unrelated fields across keep-set slots / layout; date
ranges → `2025-10 - 2026-03` or locale words; counts → `badge` or body meta;
empty trail → ASCII `-`. Docs / source comments may keep English em dashes.
Live: `#list` org+dates. Authority: [`AGENTS.md`](../AGENTS.md) Language
**UI punctuation**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: trailingSupportingText right-hug drift

Symptoms (experience / job date columns):

- Full ranges (`2025-10 - 2026-03`) and short open dates (`2023-03`) sit in
  **content-width** boxes parked with `margin-inline-start: auto` — short
  strings start further right; no shared meta **column** across sibling rows

**Cause:** mixed-length `trailingSupportingText` without a shared column floor,
or content-width meta that only lines up trailing glyphs.
**Fix:** parent **`List` / `Timeline` `trailingMetaAlign="start"`** (≥ **0.4.120**;
token since 0.4.119; **column start-ink ≥ 0.5.13**) — shared
`--fynns-*-trailing-meta-min-width` (box **and** glyph start edges align).
Do **not** invent private `text-align` / `min-width` on `.fynns-*-trailing*`.
Multi-metric grids stay on `.fynns-list-item-trailing-stats` (start-aligned
cells ≥ 0.4.144). Live: `#list` org+dates / `#timeline` / run-summary.
Authority: [`AGENTS.md`](../AGENTS.md). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: trailing meta end-ink (staggered date starts)

Symptoms (Timeline / List date columns with `trailingMetaAlign="start"`):

- Shared column **boxes** align, but shorter dates (`2026-04`) hug the
  **end** of the band while long ranges (`2025-10 - 2026-03`) start further
  left — glyph start edges stagger (reads as right-aligned noise, not a grid)

**Cause:** core **0.4.148–0.5.12** used `text-align: end` inside the shared
column (aimed at hugging `--with-end` IconButtons). Timeline catalogs without
row actions make that look broken; date grids need start-ink.
**Fix:** bump `@fynn7/ui-design-core` ≥ **0.5.13** (start-ink for plain
`trailingSupportingText` columns; trailing-stats cells stay start-aligned).
Keep consumer `trailingMetaAlign="start"` on date catalogs — do not patch
with app CSS. Live: `#timeline` / `#list` org+dates. Authority:
[`AGENTS.md`](../AGENTS.md). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: status meta far from --with-end action

Symptoms (application / catalog rows with short status + delete):

- Hover reveals the end IconButton; short `trailingSupportingText` (`当前` /
  `Current`) sits far left of the action with a large empty band between
- Looks like the status is stranded mid-row

**Cause:** (1) **`trailingMetaAlign="start"`** / always-on 17ch band on a
status+action list; and/or (2) `--with-end` hover pad reserved **two** md
IconButtons while the row only has one (phantom disk between status and
trash) — fixed in core ≥ **0.4.121** (`--fynns-list-end-actions-reserve`
scales 1→2 via `:has`).
**Fix:** **omit** `trailingMetaAlign` (default); bump core ≥ 0.4.121; keep
status in `trailingSupportingText` and delete in `trailing`. Live: `#list`
status+action. Authority: [`AGENTS.md`](../AGENTS.md) Content density **Short
status + row action**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: loose IconButton pair in control-cluster

Symptoms (catalog ControlRow / Card actions / List trailing strips):

- Two adjacent ghost IconButtons sit with an **8dp** air gap that reads sparse
  next to TopAppBar chrome (2dp)
- **Or** List `trailingSupportingText` / any preceding meta sits **~10dp+**
  from the first `--with-end` IconButton (date / 当前 / Chip left of pencil)

**Cause:** pinning core &lt; **0.4.123**, or a consumer `gap` override on
`.fynns-control-cluster` / inventing a larger meta→icon margin.
**Fix:** bump `@fynn7/ui-design-core` ≥ **0.4.123** —
`--fynns-layout-control-cluster-gap` is **4dp**; List
`--fynns-list-end-actions-gap` **aliases** it (any sibling immediately left of
an IconButton shares that rhythm). Do not invent private cluster / end-action
gaps. TopAppBar / NavigationRail stay on `chrome-icon-gap` (**2dp**). Live:
`#rhythm` catalog strip / `#list` org+dates. Authority: [`AGENTS.md`](../AGENTS.md)
Toolbar / unit rhythm. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: fat Surface / Card per catalog row

Symptoms: bookmarks / custom links / path shortcuts each sit in a tall padded
`Surface` or `Card`; edit/delete icons under the text (or a filled danger disk);
huge empty bands; wrong type / gap rhythm.

**Cause:** treating every datum as a section shell instead of a list row.
Nested `IconButton` inside interactive `ListItem` used to be invalid HTML, so
apps invented Surface wrappers — core now keeps interactive `trailing` **outside**
the row button. **Fix in the consumer:** one `List` of `ListItem`s —
`headline` + path `supportingText` + `trailing` = ghost **md** `IconButton`s
(`.fynns-control-cluster`; default size — do not pass `size="sm"` on path
catalogs). Core **`--with-end` overlay reveal** keeps idle rows full-bleed;
hover / focus-within shows actions; touch always visible. Open/confirm
destructive work in `ConfirmDialog`. Section chrome stays **one** outer `Card`
if needed.

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

**File / settings hierarchy (not session catalogs):** use **`Tree`** /
**`TreeItem`** (`#tree`) — do not stretch `List` + `detail` into a deep
folder explorer, and do not invent a private disclosure button.

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
- **Or** the **first Card** sits flush under TopAppBar / canvas ceiling
  (`top` ≈ shell head bottom; no block breath — Agents Hub overview 枢纽状态)

**Cause:** (1) `fynns-scroll` on the **content max-width** column. (2) Even with
`.fynns-page-scroll` → `.fynns-content-column`, a **padded ancestor** of the
scroll host (e.g. `.hub-main { padding-inline: dialog-inset }`) insets the
host — overlay paints at `host.rect.right − scrollbar-size`, so the rail
follows the padded content box, **not** the pane edge. (3) Pre-0.4.58
content-column had **inline-only** pad — block breath was missing (sandbox
once faked it with private CSS). The scroll parent is the **pane**
(`hub-main` / FillColumn main), not the Card.

**Fix in core (≥ 0.4.58):** Prefer the **`PageScroll`** primitive (wraps
`.fynns-page-scroll.fynns-scroll` → `.fynns-content-column`). Classes alone
still work: page-scroll is edge-flush with the pane
(+ `padding-inline-end: scrollbar-size` for the rail band only);
content-column carries `padding-inline` **and** `padding-block`:
`dialog-inset` (24dp). Live: sandbox `#page-scroll`. Do **not** use
`scrollbar-gutter`. Do **not** invent consumer `margin-top` /
`padding-top` on the first Card.

**Fix in the consumer:** FillColumn `children` = `<PageScroll>{catalog}</PageScroll>`
(or the two keep-set classes). **Do not** put `fynns-scroll` + `max-width` on
the same `.content` / `.hub-scroll` node. **Do not** put horizontal pad on
`.hub-main` / shell main **around** the page-scroll host. Bump
`@fynn7/ui-design-core` ≥ 0.4.58. CDP smoke: `card.right < pageRail.left`,
`pageScroll.right === hubMain.right`, and first Card
`top ≥ pageScroll.top + dialog-inset`. Authority: [`AGENTS.md`](../AGENTS.md)
**FillColumn** / **PageScroll**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: catalog ControlRow sinks below drawer labels

Symptoms (CV Generator Experiences / any DestinationAppShell catalog page):

- Active `NavigationDrawerItem` label (“经历”) and the main `PageScroll`
  catalog `ControlRow` label (“经历（1）”) sit on **different** horizontal
  bands — ControlRow text reads ~12–16dp lower
- Browser measure: drawer label `top` ≈ appbar + body-pad + item centering;
  ControlRow label `top` ≈ appbar + **dialog-inset** + IconButton centering

**Cause:** `.fynns-content-column` used full `dialog-inset` (24dp) for
**every** first child. Catalog chrome is a 40dp `ControlRow` (IconButton md)
that should share the drawer destination band
(`--fynns-navdrawer-body-pad-block-start` / 12dp under ClippedNavShell, where
drawer `pad-block-start` is already 0) — not Card-style 24dp breath.

**Fix in core (≥ 0.4.101):** when the first child of `.fynns-content-column`
is a standalone `.fynns-control-row`, `padding-block-start` becomes
`--fynns-navdrawer-body-pad-block-start`. First Card / EmptyState / other
units keep full `dialog-inset`. Live: Layouts `#layouts-demo-shell`.

**Fix in the consumer:** keep catalog chrome as the **first** `PageScroll`
child (`ControlRow` + IconButton strip, then List). Do **not** invent
consumer `padding-top` / negative margin / private CSS on
`.fynns-control-row` / `.fynns-content-column`. Bump
`@fynn7/ui-design-core` ≥ **0.4.101**. CDP: ControlRow label mid ≈
NavigationDrawerItem label mid (±2px). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

Symptoms (Backup / Import / rebuild / Graphify / LLM pack footers):

- A `ControlRow` with `label=""` parks an action cluster mid-left (or leaves
  an empty label column) instead of hugging the trailing edge
- Or a full-width `.fynns-control-cluster--end-align` of IconButtons still
  **start-packs** (teal pack / download / folder flush-start under a Card)
- Looks like a broken catalog strip without a name

**Cause:** `ControlRow` is for **visible name \| controls**. An empty label
still allocates the form-host label track. Action-only footers need
`.fynns-control-cluster--end-align`. Before **0.4.90**, that modifier only
set `nowrap` + `align-items: flex-start` and did **not** `justify-content:
flex-end`, so consumers who followed the class name still saw a left island
unless they also inserted `__grow`.

**Fix in core (≥ 0.4.90):** `--end-align` sets `justify-content: flex-end`.
Pure IconButton footers need no `__grow`. Keep `__grow` for Select / meta
fillers. Live: sandbox `#rhythm` end-align footer.
**Fix in the consumer:** replace empty-label `ControlRow` with
`.fynns-control-cluster.fynns-control-cluster--end-align`; bump core ≥
0.4.90. Keep real names on `ControlRow` `label`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Dialog foot Delete leftmost of Cancel

Symptoms (Timeline / Experiences edit Dialog body end-align foot):

- Cluster reads `删除 | 取消 | 保存` / `Delete | Cancel | Save`
- Primary Save is on the right (correct), but **Cancel is not** the
  leftmost action in the end-aligned strip — Delete occupies that slot

**Cause:** agents park danger Delete first “because destructive is left,”
mirroring some Material samples, without matching `ConfirmDialog` (Cancel
then confirm) or the end-align **dismiss → … → primary** recipe.

**Fix (docs + sandbox ≥ 0.5.17):** LTR order in
`.fynns-control-cluster--end-align` Dialog feet —
**Cancel → optional secondary → optional Delete → Save / primary**.
Live: `#timeline` edit Dialog; `#form-recipe` already starts with Cancel.
Prefer `ConfirmDialog` for destroy when the product needs a second step.
**Fix in the consumer:** reorder the three Buttons only (props); re-paste
`consumer-cursor-rule.mdc`. Authority: [`AGENTS.md`](../AGENTS.md)
**Action footer / end-aligned button strip**.

## Failure mode this treaty targets: twin Button loading rings in one control-cluster

Symptoms (Models / LLM backend Card foot, Dialog multi-action foot, Probe +
Start / Copy + Import strips):

- Two sibling `Button`s in one `.fynns-control-cluster--end-align` both show
  a leading `CircularProgress` (`loading`) at the same time
- Often both also share one `busy` boolean on every `loading={busy}`
- Reads as **information redundancy** — two rings for one strip wait

**Cause:** consumers treat “section busy” as “every action button paints
busy chrome.” Core `Button` `loading` is a **per-control** slot spinner,
not a section-level BusyRegion. Same philosophy as Loading placement: **one**
progress chrome per wait host.

**Fix (docs + sandbox ≥ 0.4.146):** track **which** action is in flight
(`busy === "probe" | "proxy" | null`). Only that Button gets `loading`;
siblings get `disabled` **without** a spinner. Live: sandbox `#rhythm`
end-align (click either action) + `#form-recipe` Dialog foot (Extract
loading; Cancel / Copy / Import disabled, no rings).

**Fix in the consumer:** split shared `busy` into an action id (or
mutually exclusive flags). Never `loading={busy}` on two cluster siblings.
Bump / re-paste `consumer-cursor-rule.mdc`. Authority:
[`AGENTS.md`](../AGENTS.md) Hard rules + Loading placement **Multi-action
footer wait**.

## Failure mode this treaty targets: BusyRegion + chrome loading stack

Symptoms (Dialog / FieldBlock extract / refresh — e.g. notice body cold
extract):

- `BusyRegion` paints a centered `CircularProgress` (or linear) over the
  field / section body
- **At the same time** a FieldHeader / FieldBlock `actions` `IconButton`
  (or Card `actions` / Dialog foot `Button`) shows `loading` with a second
  ring
- Two teal rings for **one** wait — reads as information redundancy

**Cause:** consumers bind the same `busy` flag to both `BusyRegion busy`
and the triggering chrome `loading={busy}`. Section wait already owns the
progress chrome; slot `loading` is only for **per-control** waits with no
BusyRegion / BusyScrim.

**Fix (docs + sandbox ≥ 0.5.53):** pick **one** host chrome:
- Body / section wait → `BusyRegion` (or `BusyScrim`); header / foot actions
  → `disabled` **without** `loading`
- Per-control wait only (no BusyRegion) → that Button / IconButton
  `loading` alone

Live: sandbox `#busy-region` FieldBlock actions sample (refresh starts
BusyRegion over the mounted body; header IconButton stays glyph + disabled,
no second ring).

**Fix in the consumer:** when `BusyRegion` is mounted busy for that field /
section, drop `loading` on sibling chrome (`disabled` only). Re-paste
`consumer-cursor-rule.mdc`. Authority: [`AGENTS.md`](../AGENTS.md) Hard
rules + Loading placement **Section wait + header / foot chrome**.

## Failure mode this treaty targets: tight labeled Button gaps in end-align footers

Symptoms (Dialog body foot, Card action strip — e.g. Applications edit Dialog
`取消 | 删除 | 保存 | 下一步`):

- Adjacent pill Buttons read **kissed** / ~4dp apart (same gap as IconButton
  strips)
- `.fynns-dialog-foot` Confirm hosts look looser than body-foot
  `.fynns-control-cluster--end-align` labeled Buttons

**Cause:** `.fynns-control-cluster` defaulted every sibling gap to
`control-cluster-gap` (**4dp**). Labeled action feet should match
`.fynns-dialog-foot` (**8dp** / `action-cluster-gap`).

**Fix in core (≥ **0.5.52**):** end-align clusters with labeled
`.fynns-btn:not(.fynns-btn--icon)` and **no** `__grow` use
`--fynns-layout-action-cluster-gap`. Select+refresh / table-map rows with
`__grow` keep **4dp**.

**Fix in the consumer:** bump `@fynn7/ui-design-core`; keep one
`.fynns-control-cluster--end-align` — drop private `margin` / `gap` on
`.fynns-btn`. Re-paste `consumer-cursor-rule.mdc`. Live: sandbox `#timeline`
edit Dialog foot / `#rhythm` end-align. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: ControlRow IconButton crushed to ellipse

Symptoms (Card-body `ControlStack` — sync / apply row beside status legend):

- Primary `IconButton` in `ControlRow` reads as a **tall narrow pill**
  (~18×40px) instead of a **40×40dp circle**
- DevTools: `.fynns-tooltip-trigger` is `width: 100%` on the subgrid control
  track; inner `.fynns-btn--icon` has `min-width: 0` and flex-shrinks

**Cause:** form-host `ControlStack` subgrid stretches value-button tooltip
hosts to the shared track width; the shrink rule intended for labeled Buttons
also applied to `Tooltip` → `IconButton`.

**Fix in core (≥ 0.4.92):** `ControlRow` tooltip hosts with `.fynns-btn--icon`
hug the circular target (`width: auto`, `flex-shrink: 0`) — same band as
InfoHint. **Consumer:** keep `ControlRow` + `Tooltip` + `IconButton`; no
private width on the button. Live: sandbox `#rhythm` sync row. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density** named readiness. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: end-align IconButton strip crushed

Symptoms (Card-body `.fynns-control-cluster--end-align` — archive open/start
footers, import IconButton strips):

- Primary `IconButton` inside `Tooltip` reads as a **tall narrow pill**
  (~18×40px) or the full-width cluster looks like an empty bar with a sliver
  at the trailing edge
- DevTools: `.fynns-control-cluster` is `width: 100%`; tooltip flex child
  shrinks; inner `.fynns-btn--icon` loses its 40dp min width

**Cause:** end-align clusters are full-width flex rows; tooltip triggers /
icon buttons inherited generic flex shrink (`min-width: 0`) meant for labeled
value buttons — not circular IconButton targets.

**Fix in core (≥ 0.4.93):** `--end-align` icon strips hug tips and restore
`min-width` / `min-height` on `.fynns-btn--icon`; pure icon strips use
`align-items: center`. **Consumer:** keep one
`.fynns-control-cluster.fynns-control-cluster--end-align` of
`Tooltip` → `IconButton` — no private width hacks. Live: sandbox `#rhythm`
end-align icon strip. Authority: [`AGENTS.md`](../AGENTS.md) **Content
density** action footer. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Pagination crushed or stacked off-spec

Symptoms in a table / list Card footer:

- Page-size `Select` and `Pagination` stacked as **two Card-body rows**
  (tall sparse footer — not M3 / MUI)
- Or a hand-rolled space-between row where Select grows (`width: 100%` /
  `flex: 1`) and page numbers **wrap onto a second disc row**

**Cause:** older fynns recipes banned any horizontal pairing and pushed a
vertical stack; or consumers put `Pagination` beside a full-width Select.
Mainstream (MDC data-table pagination, MUI `TablePagination`) is **one**
footer band: rows-per-page + range on the start, navigator on the end.
**Fix:** use core **`.fynns-pagination-bar`** (`__start` / `__end`) +
`fynns-scroll`. Select stays content-hug; `Pagination` stays nowrap
`flex: 0 0 auto`. Core keeps **`flex-wrap: nowrap`** — narrow hosts must **not**
stack start above end (two-line ~80dp footer); overflow scrolls on the bar.
Do not restyle `.fynns-pagination*`. Live: sandbox `#pagination`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **内容密度**.

## Failure mode this treaty targets: Pagination bar wraps to two rows

Symptoms (Usage / table Card footer ~554px wide → ~82dp tall):

- `.fynns-pagination-bar` shows Select + range on row 1 and page discs on row 2
- DevTools: `flex-wrap: wrap` (legacy core) or consumer `flex-wrap` / stacked
  siblings

**Cause (legacy ≤ 0.4.84):** core allowed wrapping the whole end strip under
start on narrow hosts.

**Fix in core (≥ 0.4.85):** `.fynns-pagination-bar` is `nowrap` +
`overflow-x: auto`. Pair with `fynns-scroll`. Drop private wrap CSS.

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

## Failure mode this treaty targets: DropdownMenu bare btn in IconButton strip

Symptoms (全局规则 / catalog `ControlRow` chrome — sort / overflow next to
Import / New `IconButton`s):

- Sort / more control is a **wider 40×48 outlined pill** with a tiny chevron;
  neighboring `IconButton` `ghost` `sm` are **32dp circles** — vertical and
  optical misalignment (“按钮位置不对”)
- DevTools: `DropdownMenu` trigger is bare `.fynns-btn` (no `--icon` / `--sm`)

**Cause:** `DropdownMenu` default trigger is a labeled outlined button.
Catalog strips are IconButton clusters; icon-only menus must match.

**Fix in core (≥ 0.4.56):** `DropdownMenu` `iconOnly` (defaults `ghost` +
`size="sm"` circular). Live: sandbox `#menu`. **Consumer:**
`EntrySortControl` / overflow → `<DropdownMenu iconOnly trigger={<Chevron…/>} />`
— do not invent private `.entry-sort` height hacks. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: sparse dashboard shortcut List

Symptoms (Agents Hub overview「快捷入口」):

- Card body hosts a **tonal Button strip** then a `List` of rows with only
  headline + placeholder supporting (“稍后接入”) — rows look **empty / sparse**
- **or** each path row stacks `overline` (“文件/文件夹”) + headline + path →
  `ListItem` `--3` / ~88dp min-height × N builtins → Card body ~1300px tall
  and reads as **huge vertical vacant band** (user: 空旷 = spacing, not fake
  copy)
- DevTools: `ListItem` has no path / trailing open, **or** has `overline` on
  a path catalog

**Cause:** there is **no** ShortcutPanel primitive. Dashboard links are the
**path-catalog** recipe inside one Card. Placeholder supporting is not
anatomy; **kind as overline** on every shortcut row forces three-line
geometry meant for session trees.

**Fix in core (≥ 0.4.57 anatomy; ≥ 0.4.60 density):** sandbox `#list`
shortcut Card = Card `actions` + **two-line** ListItem (leading kind glyph +
headline + real path + trailing open) — **no** `overline`. `height-2` =
**60dp** (was 72dp). **Consumer:** drop overline on Overview quicklinks;
kind = leading icon only; refresh in Card `actions`. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: ListItem zero-gap pill fuse

Symptoms (全局规则 / commands / skills catalogs — `List` of interactive
`ListItem`s with `selected` + optional hover):

- Adjacent selected / hovered rows look like **one mega-capsule** (shared
  stadium outline, thin seam only) because both paint `radius-3xl`
  secondary-container / state-layer washes with **0** sibling gap
- Unselected rows then read as “loose floating text” with a larger optical
  band — rhythm feels broken vs NavigationDrawer destinations

**Cause:** `.fynns-list` was a column flex with no `gap` while ListItem
selected/hover reuse NavigationDrawerItem’s long-strip pill. Drawer items
already open `--fynns-navdrawer-section-gap` (**4dp**) between siblings;
List did not.

**Fix in core (≥ 0.4.55):** `--fynns-list-item-gap` aliases
`navdrawer-section-gap`; `.fynns-list { gap: var(--fynns-list-item-gap) }`.
`--fynns-list-content-gap` aliases `space-xs` (**4dp**) so two-line
headline↔supporting stays dense; three-line uses `--fynns-list-content-gap-3`
(`space-sm` / **8dp**). Leading → copy is `--fynns-list-gap` (`space-lg` /
**16dp**), not a 40dp icon column. Live: sandbox `#list` (select + hover neighbors).
**Consumer:** no private row `margin` / `gap` — rely on core. Under
`PageScroll`, prefer no nested `list-well` max-height for short catalogs.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Divider between contained ListItems

Symptoms: inbox / bookmark / settings List looks like a spreadsheet; selected
or hover pill is cut by a hairline; `#list` anatomy demo used inset `Divider`
as `ul` children.

**Cause:** treating M3 **contained** lists (gap + filled items) as uncontained
ruled lists. Hairlines fight `radius-3xl` pills.

**Fix:** no `Divider` between `ListItem`s. Use `--fynns-list-item-gap` + host
hover/selected wash. `Divider` only at **section** boundaries (FieldStack
jumps, sidebar footer, unrelated blocks). Decorative chevron stays in the row
hit; IconButton trailing is a sibling but the **host** still paints one pill.

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

## Failure mode this treaty targets: mode drawer sort+new cluster start-packed

Symptoms (全局规则 / 技能 / 代理 mode sidebars — `MdSidebar` / `SkillsSidebar` under
`NavigationDrawer` without SearchBar):

- Sort menu + primary **New** sit **start-left** in a full-width
  `.fynns-control-cluster` directly above the first `NavigationDrawerItem`
- The sort trigger uses **`ChevronDown`** (icon-only menu) — reads like a
  `NavigationDrawerGroup` expander beside the first destination row; users
  report overlap / “不合理” layout
- DevTools: `.hub-mode-nav-tools .fynns-control-cluster` is ~224×32dp with
  children at `x≈10` / `x≈50` while the track is full drawer width

**Cause:** default `.fynns-control-cluster` is `width: 100%` + start-packed.
Mode catalogs omit SearchBar but reuse the archived bulk-toolbar cluster
without **`--toolbar-end`**. Chevron sort triggers collide visually with
group/row chevron language.

**Fix in core (≥ 0.4.86):** public `.fynns-control-cluster--toolbar-end`
(nowrap + `justify-content: flex-end`). Live: Layouts
`#layouts-demo-navigation-drawer` mode sidebar sample.
**Fix in the consumer:** mode tools row →
`fynns-control-cluster fynns-control-cluster--toolbar-end`; sort menu
trigger → non-chevron icon (`BarChartIcon` / `MoreHorizontalIcon`, …). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: mode drawer hide-builtin ControlBlock stack

Symptoms (全局技能 / 全局规则 mode sidebars — `SkillsSidebar` / `MdSidebar` tools
column under `NavigationDrawer`):

- A **`ControlBlock`** with label **隐藏内置** + multi-sentence `description`
  wraps in a **~224px** drawer body band (~102dp tall) while the `Switch` sits
  below the wrapped copy
- DevTools: `.hub-mode-nav-tools > .fynns-control-block` ≈ 224×102dp directly
  under the sort+new cluster and above the first destination row
- Reads as a broken form strip — not a single preference row

**Cause:** long policy / built-in help copy passed as `ControlBlock`
`description` in a **narrow nav tools column**. Core docks one-line hints in
the label column of form hosts; multi-sentence paragraphs still wrap and
inflate block height in Drawer (~7.5rem label track).

**Fix in core (≥ 0.4.87):** documented recipe only — **one-row**
`ControlRow` + `InfoHint size="sm"` (Tooltip for the paragraph) + track-only
`Switch` (`label=""` + `ariaLabel`). Live: Layouts
`#layouts-demo-navigation-drawer` mode sidebar sample + Globals `#info-hint`.
**Fix in the consumer:** replace `ControlBlock description={…}` in
`.hub-mode-nav-tools` with the row above; keep sort+new on
`--toolbar-end`. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: SyncSideFilter tooltip covers chrome or list

Symptoms (MCP / 全局规则 / 全局技能 mode sidebars):

- Hovering a compact `ToggleGroup` segment (e.g. Cursor **C** mark) shows a
  tooltip **over** the sort / **+** / bulk icons (`side=top`), **or** over
  the catalog / EmptyState (`side=bottom`), **or** still under the trailing
  **+** when `side=right` but the tip is long / even a short tip in a
  ~224px tools column (`tip.right` ≥ `+`.left)
- DevTools: a `.fynns-tooltip` while the pointer is on the SyncSideFilter

**Cause:** option `tip` always portals a bubble. This filter is sandwiched
between a trailing-hug toolbar and the list — **no** side has clear air in
the narrow mode drawer (long `right` tips sit under `+`; short ones still
kiss the `+` column).

**Fix in core (≥ 0.4.97):** recipe = **omit option `tip`** on sandwich
SyncSideFilter (keep `ariaLabel` / visible labels). `tipSide="right"` remains
for other ToggleGroups that have room. Live Layouts mode sample omits tips.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
**Fix in the consumer:** `SyncSideFilter` — **no** `tip` props; do not re-add
essay tooltips. Keep the filter **outside** `hub-mode-nav-tools`. Pass
**`showCheck={false}`** when labels are mark glyphs (C / O / dual) — see next
failure mode.

## Failure mode this treaty targets: SyncSideFilter / ToggleGroup segment wash bleed

Symptoms (mode drawer SyncSideFilter — 全部 | C | O | dual):

- Selected “全部” teal wash overlaps the next segment’s “C” mark
- DevTools: unselected chip content `getBoundingClientRect().left` is **left of**
  its own button’s left (optical `translateX` spill)
- Classes: `fynns-toggle-chip--with-icon` without `--leading-open` on the mark
  segments while `showCheck` defaults true

**Cause:** default `showCheck` reserves a leading check slot on **every**
segment. Empty-slot optical centering translates content left; without clip it
paints into the previous selected wash. Mark-glyph labels do not need that slot.

**Fix in core (≥ 0.4.100):** `.fynns-toggle-chip { overflow: hidden }` so the
translate cannot bleed into siblings. Live: Globals `#toggle-group` (default
check) + Layouts mode SyncSideFilter sample (`showCheck={false}`).
**Fix in the consumer:** SyncSideFilter / compact mark filters →
`showCheck={false}` (match Layouts `#layouts-demo-navigation-drawer`). Do not
restyle `.fynns-toggle-*`.

## Failure mode this treaty targets: CodeBlock editable selection stripes

Symptoms (suffixed file body — `FileBodyCodeBlock` / `variant="editable"` in a
Card, e.g. agents-hub `SKILL.md` viewer):

- Drag-select shows **teal wash stripes** with dark gaps between lines — wash
  does not hug visible syntax-colored glyphs
- DevTools: `.fynns-code-block-input` + `.fynns-code-block-highlight` stack
  while **`readOnly={true}`** (view mode still on textarea overlay)
- Long wrapped paragraphs (markdown frontmatter / policy copy) look worst

**Cause:** editable overlay = transparent textarea over a highlighted `<pre>`.
Token `<span>`s in the highlight layer can shift **soft-wrap** breakpoints vs
plain textarea text → `::selection` rectangles drift. View mode should not use
the overlay at all.

**Fix in core (≥ 0.4.88; visual-line mirror bands **reverted**; live soft-wrap edit tokens **restored** in **0.5.52**):** `readOnly` on
`variant="editable"` → **single** `.fynns-code-block-pre` (full token colors +
native selection). Active edit + `wrap` + highlight → **live deferred token overlay**
(wrap/selection may stripe). Use **`wrap={false}`** or `readOnly` when alignment matters. **`wrap={false}`** → classic dual-layer `<pre>`. Live: Globals `#code-block`
soft-wrap sample + file-body + readOnly pair.
**Fix in the consumer:** pass **`readOnly`** from view/edit state (already via
`FileBodyCodeBlock`); do not patch selection in app CSS. Bump
`@fynn7/ui-design-core`. Pasteable:
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

## Failure mode this treaty targets: ListItem kind via wrapping div / start rail

Symptoms in a skills / rules / MCP catalog:

- **Vertical rails** or ticks (accent inset) on the start of rows
- Selected `radius-3xl` wash looks **clipped** or oversized empty pills
- DevTools shows `ul.fynns-list > div.hub-builtin-row--* > li.fynns-list-item-host`

**Cause:** App wraps each `ListItem` in a `div` for builtin tone (inset
`box-shadow` + wash / `::before` tick). `ListItem` **is** the `<li>` — the
wrapper breaks `ul > li`. Kind was painted as a second highlight language
(rail / tick / extra wash) on top of the selected pill.

**Fix:** Do **not** wrap. Do **not** paint start ticks, inset rails, or a
second host wash. Builtin / readonly = **leading icon** +
`trailingSupportingText` / `.fynns-table-meta`. Selected already owns the
host pill. `hostClassName` is layout-only if you need a class on `<li>` —
never a stripe. Live: sandbox `#list` kind rows. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: builtin ListItem looks like a square / chip island

Symptoms (agents / skills catalog, OpenCode builtins like `build` / `plan`):

- Idle builtin rows look like floating **capsules or square bars** (not the same
  transparent ListItem rhythm as neighbor rows); mono headline makes them read
  as code chips rather than catalog names
- DevTools: a wash or rail on `li.fynns-list-item-host.hub-builtin-row--*`

**Cause:** Extra `hostClassName` background / rail, plus catalog **display
names** forced onto `--fynns-font-mono` (UI names belong on `--fynns-font-ui`;
mono is for paths / ids in supporting text).

**Fix:** Drop the wash / rail. Kind = leading icon + trailing meta. Headline
UI font. Core still `overflow: clip` on the host so leftover backgrounds
cannot paint a square bar. Live: `#list` kind rows. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density** / **Font families**.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List icon↔copy / three-line stack crushed

Symptoms:

- Leading glyph kisses the headline (reads as one blob)
- Three-line rows (overline + title + supporting) have `gap: 0` under a
  large title (“行间距崩溃”)
- Consumer CSS invents private `--hub-list-*` gaps or a 40dp empty leading
  column for a 16–20dp icon

**Cause:** Ignoring core List tokens after density work, or copying an old
8dp leading gutter / 4dp-only three-line stack.

**Fix:** Do **not** restyle `.fynns-list-*` gaps. Core owns:
`--fynns-list-gap` (**16dp**, leading→copy), `--fynns-list-content-gap`
(**4dp**, two-line), `--fynns-list-content-gap-3` (**8dp**, three-line).
Leading slot **hugs** the glyph (`leading-width` = icon-size). Live: `#list`.
Authority: [`AGENTS.md`](../AGENTS.md) Hard rules / **Content density**.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: duration meta glued (`1m47s`)

Symptoms in session / turn catalogs:

- Trailing duration reads `1m47s` / `2h5m` with no space between units
- Cluster of duration + count (`1m47s` + `4 次`) looks denser than neighbors

**Cause:** Compact duration formatters omit the unit separator; sandbox once
shipped `1m47s` as a bad example.

**Fix (consumer-owned strings):** space between units — `1m 47s`, `2h 5m`
(locale equivalent OK). Put duration in `trailingSupportingText`. For
**multi-metric** trailing that must align across rows, use
`.fynns-list-item-trailing-stats` (not a flex `.fynns-control-cluster`);
duration + count only → add `--pair`. Live: `#list` stats + tree rows
(`globals.listTreeDuration`). Authority: [`AGENTS.md`](../AGENTS.md) Hard
rules / **Content density**.

## Failure mode this treaty targets: List trailing stats drift across rows

Symptoms in usage / session catalogs:

- Each row’s duration / tokens / cost / count sit in a flex cluster; `$0.081`
  on one row does **not** share a vertical edge with `$1.240` on the next
- Short values (`2m 15s`, `12k`) pull later columns left; long values push
  them right — the strip reads as one fused string, not columns

**Cause:** `.fynns-control-cluster` sizes each cell to content. Cross-row
column alignment needs **shared track widths**, not per-row flex gaps.

**Fix:** wrap metric cells in `.fynns-list-item-trailing-stats` (core fixed
CSS grid: elapse | tokens | cost | count; `tabular-nums`; **start**-aligned ≥
**0.4.144**). Two metrics → `--pair`. Do **not** invent a private
`hub-*-stats` grid. Live: sandbox `#list` usage-stats sample. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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
`width: auto` + `flex-wrap: nowrap`. Lead / Collapsible trigger prefers
`flex: 1 1 40%` with **`min-width: 0`** (yield — see next failure mode). Live:
sandbox `#card` (multi-action head on a full-row host).
**Consumer:** prefer one **flat** outer cluster of IconButtons; action helpers
should return a **fragment** of IconButtons (no inner cluster) when composed
into Card `actions`. Do not park the Card in a ~12rem grid cell with five
IconButtons and expect a long path title to survive. Do **not** invent
`flex-wrap: nowrap` in app CSS on `.fynns-*`. Authority: [`AGENTS.md`](../AGENTS.md)
Card keep-set / **Content density**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Card head actions clip at the end edge

Symptoms (file-catalog detail / dual-side editor Card — agents-hub):

- End `IconButton` (often danger trash) is **half-cut** by the Card border;
  DevTools: `.fynns-card-actions` wider than leftover head space; Card
  `overflow: hidden` clips the disk
- Head also hosts a wide `ToggleGroup` (e.g. two labeled sides) **plus** a
  strip of file / sync / edit / delete IconButtons — strip ~500dp on a
  content-column Card

**Cause (two layers):**
1. **Core &lt; 0.5.57:** lead hard-floored `min-width: max(0px, 40%)` while
   `.fynns-card-actions` stayed `flex: 0 0 auto`. When chrome needed &gt; ~60%
   of the head, the strip overflowed and `overflow: hidden` on `.fynns-card`
   clipped the trailing disk.
2. **Consumer pattern:** treating Card `actions` as a free toolbar for
   **`ToggleGroup` + many IconButtons**. Keep-set `actions` is an IconButton /
   Button / ≤1 InfoHint strip — labeled segmented mode belongs in the **body**.

**Fix in core (≥ 0.5.57):** lead `flex: 1 1 40%; min-width: 0` — prefers ~40%
but **yields** so actions stay fully painted; title ellipsizes. Actions stay
`flex: 0 0 auto` (never crush chrome). Live: sandbox `#card` actions-strip
(narrow host + dense icons — trash fully visible) + mode-in-body sample.

**Fix in the consumer (hard):**
1. **Move** `ToggleGroup` / labeled mode switches out of Card `actions` into
   the Card **body** (`ControlRow` / `FieldBlock` — first unit).
2. Keep head `actions` as one flat `.fynns-control-cluster` of IconButtons
   (+ optional ≤1 InfoHint). If still too dense, overflow secondary actions
   into a `DropdownMenu` `iconOnly` More — do **not** invent private
   `overflow` / negative-margin CSS on `.fynns-card-*`.
3. Bump `@fynn7/ui-design-core` to ≥ **0.5.57**.

Authority: [`AGENTS.md`](../AGENTS.md) **Content density** titled section
shell. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

## Failure mode this treaty targets: stacked InfoHints / essay tips in Card head

Symptoms (Backup / snapshot / settings Cards):

- Two identical “i” icons in `.fynns-card-actions` (e.g. include vs exclude)
- Hover opens a **long multi-topic paragraph** (include list + exclude list +
  cross-links) that crowds the title strip and reads as stacked help clutter

**Cause:** treating `InfoHint` as a docs dump / splitting one topic into twin
head icons. Keep-set help in `actions` is **one** short tip; dense inspectors
prefer plain labels (`llm/PERF.md`).

**Fix in the consumer (hard):**
1. **At most one** `InfoHint` in Card / Collapsible `actions` (may sit beside
   IconButtons in one cluster — still ≤1 help glyph).
2. `content` = **short tip** (≈1–2 sentences / prefer ≤~120 characters). No
   multi-topic essays.
3. Longer scope / include·exclude / policy → Card **body** `FieldHint`,
   `InlineAlert`, or a short unit-stack of bullets — not a second head “i”.
4. Prefer merge: one tip that names the rule (“Full snapshot packs managed
   configs; large chat DBs use Archive below”) over two encyclopedic tips.

Live: sandbox `#card` (single short InfoHint sample) + `#info-hint`. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density** titled section shell /
**InfoHint density**. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: mixed IconButton / InfoHint hover sizes

Symptoms (MCP / settings destination pages):

- TopAppBar trailing: InfoHint `size="sm"` (32dp) beside Import/Export
  `size="md"` (40dp) — hover disks jump
- Card `actions`: default InfoHint `md` (40) beside ImportButton default
  `sm` (32) — reverse mismatch on the same screen
- **Same Card body trailing column:** FieldBlock label-row InfoHint `sm`
  (left≈810) beside Select-row refresh IconButton default `md` (left≈802) —
  disks do not share one vertical end edge; ControlRow probe InfoHints at
  `sm` look aligned with the label “i” but the refresh sits inset

**Cause:** mixing `IconButton` / icon `InfoHint` `size` in one chrome strip
**or** across components that share one end-docked trailing column in the
same Card (FieldHeader / FieldBlock `actions`, `.fynns-control-cluster--end-align`
refresh, ControlRow trailing InfoHint). End-align + different diameters
shifts the **left** edge by 8dp (40−32). Core `< 0.4.136` also (a) re-floored
Tooltip-wrapped end-align IconButtons to 40dp even when `size="sm"` was
passed, and (b) start-packed form-host ControlRow clusters so shorter
OK/Fail status rows inset the trailing “i”. Lone `—` / status meta without InfoHint stayed content-width at the end edge under a 32/40dp disk (broken trail column). Bump to ≥ **0.4.137** (icon size lock alone was **0.4.136**).

**Fix in the consumer (hard):**
1. In one strip (TopAppBar leading+trailing, `.fynns-card-actions`, one
   icon `.fynns-control-cluster`, **or the same page’s catalog ControlRow +
   List trailing**) every `IconButton` and icon `InfoHint` uses the **same**
   `size`.
2. In one Card **body trailing icon column** that spans FieldBlock /
   FieldHeader `actions` InfoHint + end-align refresh + ControlRow InfoHint —
   same rule: **one** `size` so end-docked hover disks share one vertical
   end edge. When the label-row InfoHint is `sm`, pass **`size="sm"`** on
   the refresh IconButton (and keep probe InfoHints `sm`) — do **not** leave
   refresh at default `md`. Prefer adjusting the refresh to match the
   InfoHint column (keep the `sm` InfoHint position).
3. Page chrome / TopAppBar → prefer **`md` (40dp)**; drop stray
   `size="sm"` on TopAppBar InfoHint when siblings are `md`.
4. Dense Card heads may use **`sm`** only when **every** icon in that head
   is `sm` (pass `size="sm"` on InfoHint too). Prefer matching TopAppBar
   `md` for Card **head** actions on the same destination page.
5. Do **not** invent private width / margin CSS on `.fynns-btn--icon` to
   fake column alignment.

Also: lone ControlRow `.fynns-table-meta` (`-` / status without InfoHint) must sit in the **same trail box** as the refresh / InfoHint (core ≥ **0.4.137** — not a thin end glyph). Live: sandbox `#card` actions strip (head all `md`); `#field-header`
(label InfoHint + refresh + probe OK/Fail + idle `-` all on the `sm` trail). Authority:
[`AGENTS.md`](../AGENTS.md) **Form trailing chrome column**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: form ControlRow label vs FieldHeader title

Symptoms (LLM / provider Card with FieldBlocks + preference Switches):

- `FieldHeader` titles (“Provider” / “Model”) sit flush at the Card body start
- Preference / probe `ControlRow` labels (“Thinking” / status names) sit
  ~16–17dp inset — chase Select **value** text via old 0.4.138
  `--fynns-form-control-text-inset-inline`
- Agent “fixes” by inventing consumer `padding-left` / negative margin on
  `.fynns-control-row__label` or `.fynns-field-header__label`

**Cause:** 0.4.138 padded ControlRow labels to match Select / Input **value**
ink. Title glyphs (FieldHeader + ControlRow) must share one flush column;
value ink stays inset inside the field shell.

**Fix in the consumer (hard):** bump to ≥ **0.5.58**; keep FieldStack +
ControlStack siblings (no private pad). Do not reintroduce ControlRow inset
to chase Select value text.

Live: sandbox `#field-header` (preference Switch + probe rows under
FieldBlocks). Authority: [`AGENTS.md`](../AGENTS.md)
**Form title text-start**. Pasteable:
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
short status name, children = tip glyph (or muted `-`). Form-host stack keeps
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
`--with-end` paints hover/selected on the **row / host** and **overlay-reveals**
end action clusters (idle copy full-bleed; hover / focus-within shows trailing;
touch always visible — ≥ 0.4.107). Reveal pad-end includes
`--fynns-list-end-actions-gap` (**4dp**, aliases
`--fynns-layout-control-cluster-gap`, ≥ 0.4.123) so preceding meta / ellipsis
clears the first IconButton with the same rhythm as any sibling left of an
icon — **not** navdrawer pad-inline / footer Avatar inset. Do **not** invent consumer
`padding` / `margin` on
`.fynns-list-item*` to fake it. Nested `List` under
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

## Failure mode this treaty targets: List --with-end ellipsis kisses action disk

Symptoms on a path / experience / bookmark `ListItem` with trailing edit/delete:

- Long headline ellipsis sits flush against the first `IconButton` hover disk
- Supporting line (company · dates) also runs into the action cluster
- Consumer adds private `padding-inline-end` / `margin` on `.fynns-list-item*`

**Cause:** `--with-end` reveal reserved only icon targets + list pad — **zero**
copy→disk breath.

**Fix in core (≥ 0.4.115; denser alias ≥ 0.4.123):** `--fynns-list-end-actions-gap`
aliases `--fynns-layout-control-cluster-gap` (**4dp**). Consumer: bump only —
no app CSS. Live: sandbox `#list` path catalog / org+dates (hover a row).

## Failure mode this treaty targets: List trailing Select + labeled Button overlap

Symptoms on an inspector / pipeline `ListItem` whose `trailing` is a
`.fynns-control-cluster` of a **labeled** tonal `Button` + `Select` (optional
short gap meta in `trailingSupportingText`):

- CTA label (e.g. multi-character assist copy) paints **onto** the Select
  trigger (“技能” / kind) — siblings collide mid-row
- Hover / focus “reveal” still uses the IconButton overlay geometry
- Consumer adds private `position` / `z-index` / negative margin on the cluster
- Short gap status (“未映射” / “Unmapped”) **left edges drift** across sibling
  gap rows while Button / Select columns stay put

**Cause:** `trailingIsRowAction` correctly parks Button/Select **outside** the
row control (`--with-end`), but overlay reveal reserves only **1–2×40dp**
IconButton disks while `Select` defaults to `width: 100%`. Absolute end +
undersized pad stacks the wide CTA onto the Select shell.

**Fix in core (≥ 0.5.54):** when the end cluster contains `.fynns-select` or a
non-icon `.fynns-btn`, core **pins** trailing **in-flow** (always visible;
normal list pad — not IconButton reserve) and forces Select / labeled Button to
content-hug (`width: auto` / max-width caps). Path-catalog IconButton strips
keep overlay reveal. **≥ 0.5.55:** pinned trailing `padding-inline-end` is at
least `--fynns-radius-3xl` so host `overflow: clip` + radius does **not** slice
the Select’s end curve; cluster stays inside the padded box. **≥ 0.5.56:**
gap / short status in `trailingSupportingText` is co-located **inside** the
pinned end strip (before the action cluster) so sibling “Unmapped” labels
stay glued to CTA|Select when end widths match — not a separate list-item
right-hug that drifts. Leave `trailingMetaAlign` unset (17ch floors short
status away from the CTA). Consumer: bump ≥ 0.5.56; keep cluster `nowrap`;
prefer short CTA labels; prefer IconButton + Tooltip when the action is not
an inspector control. Live: sandbox `#list` inspector trailing. Authority:
[`AGENTS.md`](../AGENTS.md) Content density **Inspector row**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List row copy cramped on the start edge

Symptoms on a page-catalog `ListItem` (Applications / Experiences-style
create-edit rows — headline + org `supportingText` + short status meta):

- Headline / supporting copy sits visually tight against the **left** curve of
  the `radius-3xl` hover pill (≈16dp inner pad felt narrow on 56dp rows)
- Consumer adds private `padding-inline-start` on `.fynns-list-item*` or wraps
  copy in an extra padded `div`

**Cause:** legacy `--fynns-list-pad-inline: 1rem` (16dp) was one step below
long-strip text breath on the same pill geometry.

**Fix in core (≥ 0.5.36):** `--fynns-list-pad-inline` aliases
`--fynns-layout-strip-pad-inline` (**20dp**). Trailing `--with-end` reserve
uses the same token — end breath stays symmetric. Consumer: bump only — no app
CSS. Live: sandbox `#list` status+action.

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

## Failure mode this treaty targets: Select row-action IconButton drifts when open

Symptoms in a settings Card / inspector `FieldBlock`:

- `Select` `className="fynns-control-cluster__grow"` + sibling refresh /
  reload `IconButton` in `.fynns-control-cluster--end-align` looks correct
  when closed
- Opening the dropdown list moves the refresh button **down** — it vertically
  centers against trigger + results instead of staying on the **trigger row**
  (often ~160px gap vs the closed state)

**Cause:** Core end-align clusters pin row actions with `align-items:
flex-start`, but IconButton siblings also had `align-self: center`. When the
grow Select stacks its results, cluster height grows and the centered sibling
drifts. Not a consumer flex hack — fixed in core (≥ 0.4.112).

**Fix in the consumer:** Keep the **`FieldBlock` + control-cluster** recipe
(`Select` `__grow` + trailing `IconButton` — no `Select.trailing`). Bump
`@fynn7/ui-design-core`; do **not** add private `align-self` / margin on the
button. Live: sandbox `#field-header` (open Select — refresh stays on trigger
band). Authority: [`AGENTS.md`](../AGENTS.md) **Select + reload** row.

## Failure mode this treaty targets: repeatable Textarea remove wraps below row

Symptoms in a Dialog / Card `FieldBlock` with a dynamic bullet / highlight list:

- Each row is `Textarea` + trash `IconButton` inside `.fynns-control-cluster`
- Multi-line / autoGrow copy is fine, but the remove disk sits **on the next
  line** under the well — often flush-start below the text block, not beside it
- DevTools: cluster is `flex-wrap: wrap` (default); IconButton `top` clears
  the Textarea `bottom` by one row height + gap

**Cause:** default `.fynns-control-cluster` is full-width + `flex-wrap: wrap`.
Tall `Textarea` `__grow` fills the first flex line; the trailing IconButton
wraps when there is no horizontal room on that line — reads as a stray delete
between entries.

**Fix in core (≥ 0.5.29):** `Textarea.fynns-control-cluster__grow` in
`.fynns-control-cluster--end-align` shares the Select grow flex recipe; sandbox
`#form-recipe` Highlights teaches the row.

**Fix in core (≥ 0.5.30):** delete IconButton **centers vertically** on the
autoGrow Textarea well. The Select + refresh rule (`align-self: flex-start`) no
longer applies to Textarea `__grow` rows — only `.fynns-select.__grow`.

**Fix in the consumer:** each repeatable row →
`.fynns-control-cluster.fynns-control-cluster--end-align` with `Textarea`
`className="fynns-control-cluster__grow"` + sibling `Tooltip` → `IconButton`.
Stack rows in `FieldStack` under one `FieldBlock`; **add row** on `FieldBlock`
`actions` (label-row `Tooltip` → ghost `IconButton` `sm` — not a body-foot
end-align strip). Do **not** private margin / absolute delete on the well. Live:
sandbox `#form-recipe`; consumer repeatable bullet fields. Authority:
[`AGENTS.md`](../AGENTS.md) **Content density** repeatable multiline rows.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Dialog body Card stack crush

Symptoms in a `Dialog` `size="lg"` multi-step / workflow host:

- Several `Card` siblings show **only the title row** (~49–69px tall); body copy,
  lists, and buttons are clipped or invisible
- DevTools: each `.fynns-card` has `flex-shrink: 1` (default) inside
  `.fynns-dialog-body` (column flex + `max-height` on the panel); Card
  `overflow: hidden` hides crushed body
- A later Card with a tall `Textarea` may keep more height and look like the
  only “broken overflow” card while earlier steps are silently squashed

**Cause:** `.fynns-dialog-body` is a height-capped scroll flex column but direct
children lacked the **`flex-shrink: 0`** contract already used on
`.fynns-unit-stack > *` and `.fynns-list > *`. Total intrinsic height exceeds
the panel → flex distributes shrink to every Card shell.

**Fix in core (≥ 0.5.32):** `.fynns-dialog-body > * { flex-shrink: 0 }` — body
scrolls instead of crushing units. Sandbox `#form-recipe` → **Open Dialog Card
stack**.

**Fix in the consumer:** bump `@fynn7/ui-design-core`; drop private Card
`min-height` hacks. Optional: wrap siblings in `.fynns-unit-stack` (one body
child) for the same scroll contract. Do **not** restyle `.fynns-dialog-body` /
`.fynns-card` in app CSS. Authority: [`AGENTS.md`](../AGENTS.md) **Content
density** Dialog Card stack. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: phantom PageScroll rail behind modal Dialog

Symptoms when a centered `Dialog` `size="lg"` opens over a scrolling main
canvas (`PageScroll` / shell `fynns-scroll`):

- User wheel-scrolls **inside the Dialog body**; content moves but the overlay
  scrollbar thumb **jumps**, stays at the top, or a second idle thumb appears
- DevTools: **two** visible `.fynns-scroll-rail[data-axis="y"]` — one for
  `.fynns-page-scroll` (or shell canvas) at `scrollTop=0`, one for
  `.fynns-dialog-body` that tracks correctly
- The background rail uses the page host rect (`top` ≈ shell top) while dialog
  body starts lower (below dialog head) — reads as wrong track geometry

**Cause:** overlay scrollbar portal paints **every** overflowing `.fynns-scroll`
host. Modal scrim does not hide background hosts; both rails share the same
end column at `--fynns-z-toast`.

**Fix in core (≥ 0.5.33):** when any **modal** `.fynns-dialog-overlay` is
`data-state="open"`, suppress overlay rails for scroll hosts **outside** that
overlay layer. Live: sandbox `#form-recipe` Dialog + consumer edit Dialog.

**Fix in the consumer:** bump `@fynn7/ui-design-core`; no app CSS. Do not
disable `fynns-scroll` on PageScroll. Authority: [`AGENTS.md`](../AGENTS.md)
overlay scrollbar note. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: modal Dialog scrollbar flash on enter

Symptoms when a Timeline row / catalog entry opens a centered edit `Dialog`:

- Overlay scrollbar thumb **fully visible** while the panel is still scaling /
  sliding in — before the user hovers the dialog body
- Focus trap focuses the panel immediately; `:focus-within` on
  `.fynns-dialog-body` used to reveal the thumb on fine pointer

**Cause:** overlay thumb visibility treated modal dialog body like any scroll
host (`:focus-within` reveal) and did not wait for panel enter transition.

**Fix in core (≥ 0.5.34):** suppress modal `.fynns-dialog-body` thumb until
enter transition settles (~`--fynns-duration-base`); after that, fine pointer
reveals on **host hover only** (not focus trap alone). Live: `#timeline` edit
Dialog + `#form-recipe` Dialog.

**Fix in the consumer:** bump only — no app CSS.

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
Prefer `codeLanguageFromPath(path)` when the path is known. Fill / pane editors
that must stretch to a resolved height also use `autoGrow={false}` — not
PageScroll Cards. Authority:
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
3. Nesting Card → `chrome="plain"`; keep **default autoGrow** on PageScroll /
   Card / Dialog (page scrolls). `autoGrow={false}` **only** for
   height-resolved fill hosts.
4. Do **not** use `ChatMarkdown` for the **source** editor of a `.md` file —
   that API renders prose; the file body stays CodeBlock.

Live: sandbox Globals `#code-block` (file-body Card). Authority:
[`AGENTS.md`](../AGENTS.md) Content density **Suffixed file body** +
[`CONSUME.md`](CONSUME.md) Hard rule 9d. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: catalog edit as silent PageScroll replace

Symptoms (Applications / similar main-canvas catalogs): clicking a `ListItem`
(or `+`) **unmounts** the list and paints a second full `PageScroll` “detail”
with **no** Dialog close X and **no** TopAppBar back — only a ghost text
`Button` / `ControlRow` (“All applications” / “全部申请”). Sibling catalogs
(Experiences / 档案) correctly open `Dialog` + `showCloseButton`. Feels like a
broken navigation stack and breaks product grammar unity.

**Cause:** consumer invented a third host — silent main-canvas list→detail
swap — instead of the keep-set overlays. That pattern is **not** nav
**drill-in** (`#layouts-demo-drill-in`: catalog lives in the drawer body;
exit = TopAppBar `leading` / `leadingExtra`). A text “back” in the canvas is
not chrome.

**Fix in the consumer:**
1. Keep the catalog `List` mounted under `PageScroll`.
2. Row click / create / edit → **`Dialog` `size="lg"` + `showCloseButton`** +
   `FieldStack` (same as Experiences / sandbox `#form-recipe`).
3. If the body is a multi-Card long workflow that cannot fit a centered panel →
   **`FullscreenDialog`** (leading X) — still an overlay; never a silent
   PageScroll replace.
4. Delete → `ConfirmDialog`. Do not invent a destination id per edit, and do
   not leave one catalog on Dialog while a sibling uses page-swap.

Live: sandbox `#list` status+action (row opens Dialog) + `#form-recipe`
Dialog host. Authority: [`AGENTS.md`](../AGENTS.md) Hard rules + Content
density **Catalog row create / edit**. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: fixed-height CodeBlock / Textarea on page scroll

Symptoms (Prompts / settings Cards under `PageScroll`): editable
`CodeBlock` / `Textarea` sits at a **fixed ~400–500px** with a **visible
inner vertical scrollbar**, while the page canvas barely scrolls — long
prompts feel trapped in a well.

**Cause:** consumer passed `autoGrow={false}` + large `rows` (or a private
height) on a **content-sized** PageScroll / Card / Dialog host. Core defaults
to **autoGrow** so the well grows with content and the **page** scrolls.
`autoGrow={false}` is for **fill** hosts only (FullscreenDialog fill pane,
SplitPane editor, `textarea { height: 100% }`).

**Fix in the consumer:** drop `autoGrow={false}` (and oversized fixed `rows`)
on page catalogs; keep soft `maxHeight` only when a long body must not dominate
the viewport. Do not invent app CSS height on `.fynns-code-block*`. Live:
sandbox `#code-block` file-body Card (default autoGrow). Authority:
[`AGENTS.md`](../AGENTS.md) Hard rules + Content density **Suffixed file body**.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: skinny form Dialog (tall FieldStack / CodeBlock)

Symptoms: centered `Dialog` with many `FieldBlock` / `Textarea` rows **or** an
editable `CodeBlock` file body looks like a **narrow column** (~280px) beside a
tall scroll body — `size="lg"` does not seem to widen the panel.

**Cause:** centered Dialog default width is `max-content`; `Input` /
`Textarea` / `CodeBlock` are `width: 100%` inside content-sized hosts, so the
panel shrinks to the M3 min width while height grows — wrong aspect for
inspector forms and prompt / skill file editors.
**Fix in core:** when body hosts `FieldStack` / `FieldBlock` / `Textarea` /
`CodeBlock`, panel width **fills to the `size` ceiling**
(`--fynns-layout-dialog-max-width-*`).
**Fix in the consumer:** keep `FieldStack` tree (not bare stacked inputs) or
`CodeBlock` `variant="editable"` for suffixed file bodies; use `size="lg"` for
long edit dialogs; do **not** private `.fynns-dialog-panel { width: … }`. Body
scrolls at panel `max-height` — do not invent aspect-ratio CSS. Live: sandbox
`#form-recipe` Dialog hosts (FieldStack + file-body CodeBlock). Authority:
[`AGENTS.md`](../AGENTS.md) **Inset decision tree** (Dialog width). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: Dialog body end-align footer clipped

Symptoms: centered `Dialog` with several labeled footer Buttons inside
`.fynns-dialog-body` (Cancel + Copy prompt + Import JSON + Extract…) shows the
**leftmost action clipped** — only part of “Cancel” visible; DevTools: cluster
`nowrap` wider than body, body `overflow-x: clip`, first button `left` slightly
left of body `left`.

**Cause:** `.fynns-control-cluster--end-align` defaults to `flex-wrap: nowrap`
+ `justify-content: flex-end`. When the cluster is wider than the dialog body,
overflow extends to the **start** edge and is clipped — not scrollable.

**Fix in core (≥ 0.4.111):** direct `.fynns-dialog-body > .fynns-control-cluster--end-align`
wraps (`flex-wrap: wrap`, `align-items: center`) while keeping end alignment per
row. **Fix in the consumer:** keep one end-align cluster in the Dialog body
(props-only); do **not** negative margin / private `overflow-x: visible` on
`.fynns-dialog-body`. Live: sandbox `#form-recipe` Dialog multi-action foot.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density** action footer.
Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

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

Related (header / foot slot spinner + BusyRegion): see
**BusyRegion + chrome loading stack**.

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

## Failure mode: EmptyState parks top-left in destination canvas

Symptoms: DestinationAppShell / ClippedNavShell main shows a zero-result
`EmptyState` (title + description) **flush to the top** of the canvas (or
mid-left as a short content box) instead of **centered** in the visible pane —
users expect empty-pane copy like BusyRegion chrome.

**Cause:** default `EmptyState` is **content-sized** (`max-width: 24rem`, no
vertical stretch). As the sole child of `.fynns-destination-app-shell-canvas`
/ shell main / FillColumn main it parks at the start of the flex column.
**Fix in the consumer (≥ 0.4.106):** pass **`fill`** on that sole pane
EmptyState — core stretches `.fynns-empty-state--fill` and
`justify-content: center`s the copy (BusyRegion `fill` host contract). Keep
default (no `fill`) inside Card / List / `ChatThread.empty`. Do **not** invent
private `margin: auto` / absolute / min-height hacks on `.fynns-empty-state`.
Authority: [`AGENTS.md`](../AGENTS.md) **Content density** Empty catalog +
Loading placement. Live: sandbox `#empty-state` fill stage + Layouts
`#layouts-demo-drill-in`. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode: master–detail / content max-width token missing

Symptoms (legacy hub-split / main canvas):

- List+detail grid stacks full-width in one column; DevTools shows
  `grid-template-columns: var(--fynns-layout-list-pane-width) 1fr` with the
  custom property **undefined**
- Content column sprawls (no soft max-width)

**Cause:** consumer referenced `--fynns-layout-list-pane-width` /
`nav-pane-width` / `content-max-width` before core shipped them (same class of
bug as `stats-min-col`). **Fix in core (≥ 0.4.45):** tokens exist. **Consumer:**
bump `@fynn7/ui-design-core` ≥ 0.4.45; do not invent private rem fallbacks.

**Prefer drill-in over main split:** for destination apps with a drawer, put
the catalog list in the **nav** track and keep main full-width detail — see
**main-canvas list|detail split (hub-split)** above and live
`#layouts-demo-drill-in`. Do not treat `list-pane-width` as the default
catalog recipe.

Authority: [`AGENTS.md`](../AGENTS.md) **Content density** / **FillColumn**.

## Failure mode this treaty targets: literal backticks in Chat bubbles

Symptoms: assistant/user turns show raw `` `token` `` / unrendered `**bold**` /
GFM lists inside `.fynns-chat-message-prose`.

**Cause:** the app passed the LLM Markdown **string** as bare `ChatMessage`
`children`. Prefer **`markdown={md}`** or **`<ChatMarkdown source={md} />`**
(core L2 subset). Raw children stay plain prose. Authority:
[`AGENTS.md`](../AGENTS.md) **Parity note (markdown / GFM)** + pasteable
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **ChatMessage Markdown**.

## Failure mode this treaty targets: ChatComposer field↔Send tighter than glyph↔field

Symptoms (collapsed EndAside / main ChatComposer with leading + Send):

- Ghost leading **glyph** → textarea looks ~12dp open
- Textarea → filled Send/Generate **disk** looks ~4dp (same as IconButton hit
  box → field) — Send reads cramped vs the leading side
- Measuring IconButton box → field and matching that on the Send side is the
  wrong reference

**Cause:** collapsed body uses one `composer-gap` between all flex peers.
Leading visual mass is the **16dp glyph** inside a 32dp ghost circle; Send
visual mass is the **full filled disk**. Equating hit-box gaps leaves
field→disk short by `composer-glyph-inset` (~8dp).

**Fix in core (≥ 0.4.140):** `.fynns-chat-composer-primary-slot` gets
`padding-inline-start: var(--fynns-chat-composer-glyph-inset)` when collapsed
so **field → primary disk == leading glyph → field**. **Consumer:** bump
core; do **not** invent private margin on Send / Generate. Spec:
[`CHAT_COMPOSER_LAYOUT.md`](CHAT_COMPOSER_LAYOUT.md). Live: sandbox `#chat`
(leading + Send collapsed). Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: List run history stacked vertically

Symptoms (FullscreenDialog / catalog run list):

- Left column reads **three bands**: Success pill → model id → duration /
  tokens (user asks to put them on **one** horizontal line)
- Timestamp sits on the trailing edge while status alone shares its row
- DevTools: `ListItem` `lines={2}` with `InlineAlert` (or private summary
  wrap) in `headline` and metrics in `supportingText`

**Cause:** (1) `InlineAlert` defaults to **`width: 100%`** panel chrome — inside
a headline flex cluster it steals the full row so the model wraps under
Success; (2) `supportingText` opens a **second** List line for duration; (3)
optional `Divider` between `ListItem`s fights gap+pill separation.

**Fix in core (≥ 0.4.141):** single-line recipe — `headline` = one
`.fynns-control-cluster` of `.fynns-list-item-status` + identity
(`__grow`) + duration meta; timestamp → `trailingSupportingText`; **no**
`InlineAlert` in `ListItem`. **Gap (≥ 0.4.142):** headline run-summary
cluster uses `--fynns-layout-control-stack-gap` (**8dp**), not IconButton
`control-cluster-gap` 4dp — do **not** pad status↔title in the consumer.
**Duration column (≥ 0.4.143):** headline `.fynns-table-meta` uses a fixed
track (elapse + optional icon) + **start** align so digit / glyph starts
share a vertical line (content-width end-pack lined up trailing `s`). Do
**not** invent consumer `text-align` / `min-width` on `.gsc-llm-history-meta`.
**Overflow / one metric (≥ 0.4.145):** wrap the label in `<span>`; **do not**
jam latency+tokens into one cell (hard mid-glyph clip) — use a **sibling**
`.fynns-table-meta` (tokens track) or `.fynns-list-item-trailing-stats`.
Trailing timestamp columns also ellipsize when squeezed.
**Consumer:** drop `StatusInline` / `lines={2}` / between-row `Divider`;
split jammed meta; bump core. Live: sandbox `#list` run-summary. Pasteable:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: jammed headline list meta (overflow clip)

Symptoms (run / LLM history rows):

- One `.fynns-table-meta` shows duration + token count (two icons / two
  numbers); the second value is **hard-clipped** mid-glyph inside a ~96px box
- Private `.gsc-*-meta { display: inline-flex }` cannot widen the core track

**Cause:** core sizes each headline `.fynns-table-meta` for **one** metric
(elapse + optional one icon). Packing latency+tokens exceeds `max-width`.
**Fix:** bump ≥ **0.4.145**; **one metric per cell** (label in `<span>`);
second metric → sibling `.fynns-table-meta` or trailing-stats. Live: `#list`
run-summary. Pasteable: [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) | Install GitHub Packages + hard consume rules |
| [`consume.json`](consume.json) | Machine contract |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Custom highlight + CodeBlock language hard rules |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Short-prompt reminder |
| [`AGENTS.md`](../AGENTS.md) | Tokens + component catalog |
