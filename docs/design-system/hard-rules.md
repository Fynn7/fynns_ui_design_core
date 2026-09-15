# Hard rules (Do / Don't)

← back to [Design system index](../DESIGN_SYSTEM.md)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc. Missing value →
  [`src/theme/tokens.ts`](../../src/theme/tokens.ts) + `npm run gen:theme`.
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
- **DON'T** invent path/repo List trailing soup — **no** `Switch` + IconButtons
  in one end cluster, **no** `IconButton` `danger` filled disk on the row
  (delete = ghost **md** + `ConfirmDialog`), **no** `Chip` / consumer
  `CatalogBadges` in the headline for kind/status. Overline / path /
  `trailingSupportingText` / `.fynns-table-meta` for status; enable-for-batch
  → leading **`Checkbox`** (not Switch mid-cluster). Same-size **md** disks
  share one horizontal baseline. Live `#sandbox-list-repo-path-actions` /
  `#list` catalog. Failure: CONSUMER_TREATY List path catalog Switch+Chip+danger
  disk soup.
- **DON'T** let capped `List.fynns-scroll` wells park `trailingSupportingText` /
  `.fynns-table-meta` against the overlay Y rail — core ≥ **0.5.171** reserves
  `--fynns-scrollbar-size` on the list end (PageScroll parity) and keeps
  `--with-end` idle pad at `list-pad-inline` when row meta is present (not
  `space-xs` crush). Live `#sandbox-list-repo-path-actions`. Failure:
  CONSUMER_TREATY List scroll-well trailing meta kisses overlay rail.
- **DON'T** let capped `List.fynns-scroll` + `list-well-max-height*` **paint**
  overflowing rows over the next help / List — base List only set
  `overflow-x: clip`, so `overflow-y` stayed `visible` and the layout box
  stayed short while ink spilled. Core ≥ **0.5.224** forces `overflow-y: auto`
  on scroll wells. Live `#sandbox-list-repo-path-actions`. Failure:
  CONSUMER_TREATY List scroll-well overflow-y spill overlaps siblings.
- **DON'T** let in-row `trailingSupportingText` (short status / kind / Builtin)
  sit under revealed `--with-end` IconButtons — core ≥ **0.5.207** gates the
  idle `list-pad-inline` rule with `:not(:hover):not(:focus-within)` and
  mirrors `:has(meta)` on coarse so hover / always-visible reserve can clear
  the disks (0.5.171 `:has` was stronger than bare `:hover` and locked pad at
  20dp while icons painted over “Builtin”). Do not invent consumer
  `z-index` / meta margin. Live `#sandbox-list-recipe-catalog` /
  `#sandbox-list-status-action`. Failure: CONSUMER_TREATY List
  trailingSupportingText underlaps --with-end IconButtons.
- **DON'T** paint ListItem `:focus-visible` as a child `outline` on the row
  button — host uses `overflow: clip` + `radius-3xl`, and absolute
  `--with-end` IconButtons sit above the button on `:focus-within`, so the
  ring cracks at corners / under end disks. Core ≥ **0.5.218** paints an
  **inset** `box-shadow` on the flat host via
  `:has(> .fynns-list-item:focus-visible)`; with-detail paints the same ring
  on `.fynns-list-item-row` (≥ **0.5.219** — not the outer host wrapping
  nested detail). Do not invent consumer `outline` /
  `box-shadow` on `.fynns-list-item`. Live `#sandbox-list-recipe-catalog` /
  `#sandbox-list-status-action`. Failure: CONSUMER_TREATY ListItem Tab focus
  ring cracked by --with-end overlay.
- **DON'T** paint List catalog kind with start tick / inset rail / `::before` /
  second `hostClassName` wash — leading icon + `trailingSupportingText` /
  `.fynns-table-meta`; selected = host `radius-3xl` pill only; never
  `ul > div > li`. Crush List gaps: keep `--fynns-list-gap` (**16dp**),
  content-gap **4dp** / **8dp** (3-line), optical `--fynns-list-end-actions-gap`
  (≥ **0.5.62**); no 40dp empty leading column. Duration units **spaced**
  (`1m 47s`, never `1m47s`). Live `#list`.
- **DON'T** glue name + count / chars / tokens / path into Card or Collapsible
  `title` (or FieldBlock label) with middle-dot **`·`** / em-dash **`—`** /
  decorative **`–`** — e.g. `系统提示 · 14,279 字 ≈ 3,887 token`,
  `消息 messages · 2`, `Tools · 12`. `title` = short natural name only; put
  metrics in the **body** as `.fynns-table-meta` (or List trailing / `badge`).
  Live `#card` meta-in-body. Failure: CONSUMER_TREATY Card title · meta glued /
  UI · — punctuation in chrome.
- **DON'T** glue org + dates in one `supportingText` with `·` / `–` / `—` —
  org under title; dates → `trailingSupportingText` + `trailingMetaAlign="start"`
  on mixed-length date catalogs (core **start**-aligns glyphs in a **fixed**
  meta column ≥ **0.5.13** / fixed width ≥ **0.5.223** — not content-width
  end-hug). **Do not** invent private CSS `text-align` / width on trailing meta
  when you meant that shared column. **Do not** glue status into the date
  trailing (`Done, 2025-10 - 2026-03`) — status / kind → `overline`; dates only
  in trailing so the 17ch grid stays honest. Same: no `·` / `—` in visible
  chrome strings. Live `#list` org+dates.
- **DON'T** omit `trailingMetaAlign="start"` on experience / job / history Lists
  whose `trailingSupportingText` is a date or timestamp catalog — default
  content-width end-hug **staggers** short vs long starts (no grid). Failure:
  CONSUMER_TREATY trailingSupportingText right-hug drift / trailing meta end-ink.
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
  (`inspector-end-gap`); ≥ **0.5.70** reuses form Select shell; ≥ **0.5.208**
  Select options are a **portaled** `.fynns-select-menu` (field stays 40dp —
  not in-flow joined capsule; ≥ **0.5.229** equal block pad start/end so the
  last option’s bottom inset matches the first option’s top); ≥ **0.5.71**/72 pins meta|CTA on the **trigger
  band**; ≥ **0.5.226** opening Select must **not** switch the host to
  `align-items: flex-start` (docked SearchBar/Autocomplete expand only —
  Select `data-expanded` must not yank meta|CTA|Select to the top of height-3
  rows). Leave `trailingMetaAlign` unset. Card/Collapsible head Select +
  labeled Button uses the same trigger-band grammar (≥ **0.5.73**/74; gap
  **8dp** ≥ **0.5.75**); ≥ **0.5.227** Card/Collapsible head must **not**
  switch to expanded grid / `overflow: visible` when Select opens (same
  `:not(.fynns-select)` gate). Live `#list` inspector trailing /
  `#sandbox-list-inspector-trailing` / `#sandbox-card-head-select`.
- **DON'T** use a flex `.fynns-control-cluster` for multi-metric List trailing
  that must **column-align across sibling rows** — use
  `.fynns-list-item-trailing-stats` (fixed grid; `--pair` for two metrics).
  One metric per `.fynns-table-meta` cell (wrap label in `<span>` for ellipsis);
  second metric → sibling meta or trailing-stats. Run/job rows → single-line
  headline cluster with `.fynns-list-item-status` (core turns that cluster into
  a **CSS grid** with fixed `--fynns-list-stats-col-status` ≥ **0.5.295** so
  Success / Failed / Cancelled do not shift the model column) — never nest
  `InlineAlert`/`Banner`/`Chip` in ListItem headline. Live `#list` run-summary.
- **DON'T** park Timeline edit/delete as `--with-end` hover IconButtons —
  flat row `onClick` → `Dialog` `size="lg"` + `showCloseButton`; foot LTR
  **Cancel → Delete → Save** (never Delete leftmost of Cancel); prefer omit
  `leading`. Live `#timeline`.
- **DON'T** park `InlineAlert`/`Banner` beside a List in the same ControlStack
  row — severity **above** catalog (unit-stack). Live `#env-check`.
- **DON'T** top-align `Banner` leading icon or dismiss X against multi-line
  `supportingText` — the strip row is cross-axis **center** (icon | body |
  trailing). Dismiss only via `onDismiss` **inside** the rounded host — never a
  sibling `IconButton` outside the strip. Live `#banner`.
- **DON'T** put two+ `loading` spinners in one `.fynns-control-cluster`; leave
  `IconButton` `loading` showing spinner **and** glyph (core ≥ **0.5.80** =
  spinner-only for iconOnly); stack BusyRegion/BusyScrim with chrome `loading`
  on the same wait host — **one** progress chrome per wait. Live `#rhythm`
  end-align / `#busy-region`.
- **DON'T** twin the same in-flight wait as **Card / Collapsible `actions`
  primary `loading`** **and** every (or many) path-catalog row rebuild
  `IconButton` `loading` — **information redundancy (hard)** (≥ **0.5.265**).
  One shared batch task → **one** ring on the batch CTA; list rows stay
  `disabled` **without** `loading`. One per-row rebuild → ring **only** on that
  row's IconButton; Card primary stays `disabled` without a second ring. Never
  `loading={busy === "run"}` on both the head Button and every row Refresh.
  Live `#sandbox-list-repo-path-actions`. Failure: CONSUMER_TREATY Card batch
  CTA + ListItem row twin loading rings.
- **DON'T** swap `IconButton` children for a nested `CircularProgress` while
  busy — use the stock **`loading`** prop (Spinner; iconOnly = spinner-only).
  Nesting `CircularProgress` on `variant="primary"` / `danger` paints an
  accent ring on an accent fill (looks like a blank disk — core ≥ **0.5.217**
  retints nested rings to `currentColor` as a safety net, but the API is still
  `loading`). Live `#icon-button` / `#sandbox-iconbutton-primary-loading`.
  Failure: CONSUMER_TREATY IconButton busy swaps CircularProgress instead of
  loading.
- **DON'T** put service status in ControlRow `__controls` (Chip/badge/meta) —
  status on **`label` only**; controls = labeled Buttons only; use public
  `.fynns-control-cluster` (**8dp** labeled-Button gap ≥ **0.5.80**), not
  private `*-control-cluster` at 4dp. Same for **CLI / tool install probes**
  inside a Status Card: do **not** put the tool name on `label` while a status
  Chip says `OK`/`未安装` and an install Button already names the tool —
  **information redundancy**. `label` = short status (`可用` / `未安装` /
  `Not running`); install / repair = labeled Button; path may stay as plain
  meta text; failure detail → **`InfoHint`** on the row — **never** a sibling
  `FieldHint` that repeats `tool：error…`. Prefer short status + Button;
  do not teach multi-row OK/Fail walls in Globals.
- **DON'T** left-pack ControlRow / `.fynns-control-cluster` **Buttons** (or
  action+meta strips) under the label — clusters **default end-pack**
  (`justify-content: flex-end`, ≥ **0.5.158**). Start packing is **opt-in
  only**: ControlStack `controlsAlign="start"` (probe / path / outcome **meta**
  value grids — `.fynns-list-item-status` / path / InfoHint) or
  `.fynns-control-cluster--start-align`. **Never** put labeled install /
  service / Configure Buttons under `controlsAlign="start"` (that freezes the
  label track and parks CTAs under the label with a dead trailing gutter —
  Archify / RepoTools failure). Core ≥ **0.5.205** restores end-pack when a
  labeled `.fynns-btn` is present under `start`, but CTA stacks should still
  omit `start`. Never invent consumer `justify-content: flex-start` /
  `margin-inline-start: auto` to “fix” left-parked CTAs. Live `#rhythm`
  end-align strips.
- **DON'T** crush ControlRow `__label` to a hairline / 2px sliver — form-host
  + standalone label tracks floor at `--fynns-layout-control-row-label`
  (**7.5rem**, ≥ **0.5.159**); long path meta / Button clusters shrink in the
  controls track (`minmax(0, max-content)`), never steal the label column to
  `0`. **Also (≥ **0.5.175**):** `.fynns-control-cluster > .fynns-table-meta`
  shrinks + ellipsis — never let end-pack nowrap path **overflow left** and
  paint over the status label (looks like a crushed “就绪” even when the
  track is 120px). Full path → `InfoHint` / Tooltip when users need the
  untruncated string. Rules in Hard rules / Content density (no live anti-demo).
- **DON'T** stack `InfoHint` **above** a `Switch` in a ControlRow controls
  cluster (narrow NavigationDrawer / mode-sidebar lesson) — preference how-to
  lives as trailing **`InfoHint` on the ControlRow `label`** (core styles
  `:has(.fynns-info-hint-trigger)`); `__controls` keeps the track-only Switch.
  Core ≥ **0.5.292** also nowraps tip+Switch when both remain in `__controls`
  / a tip-only cluster. Do **not** invent consumer `flex-direction: column` /
  private wrap overrides. Live `#info-hint`. Failure: CONSUMER_TREATY
  ControlRow InfoHint stacks above Switch.
- **DON'T** let `.fynns-table-meta` hard-clip past a Card / unit-stack /
  narrow host **without** `…` — core ≥ **0.5.231** applies
  `overflow: hidden` + `text-overflow: ellipsis` + `min-width: 0` /
  `max-width: 100%` on the keep-set class (not only inside ControlCluster).
  Prefer short metrics; long copy → Tooltip / InfoHint / FieldHint. Do **not**
  invent consumer `white-space: normal` / remove ellipsis on `.fynns-table-meta`.
  Live `#sandbox-card-table-meta-ellipsis`. Failure: CONSUMER_TREATY
  table-meta overflows without ellipsis.
- **DON'T** paint success / fail / OK / ready **outcome signals** as `Chip`
  (`assist` / `filter` / `input` / `suggestion`) or a consumer `StatusChip`
  wrapper around Chip — use **`.fynns-list-item-status`** (default success
  wash; `data-tone="danger"` for fail) with optional leading glyph
  (`CheckCircleIcon` / `AlertTriangleIcon`). Neutral muted captions stay
  `.fynns-table-meta`. Live `#list` run-summary + `#provider-settings` active status.
- **DON'T** dump install / CLI availability (path meta) and backend /
  runtime readiness (outcome marks + model meta) into **one** Card-body
  `ControlStack` — different kinds → adjacent stacks + horizontal `Divider`
  (≥ **0.5.154**). Probe / path / outcome stacks use
  `ControlStack` `controlsAlign="start"` + `columns` = cell count; pass each
  cell as a **direct** ControlRow child (subgrid). **Never** wrap unequal
  path + marks + `FieldHint` in one `.fynns-control-cluster` under
  `columns={1}` (form-host end-hug misaligns value starts). Model / route
  strings → `.fynns-table-meta`, not FieldHint. Preference Switch stacks keep
  default end-hug. Live `#provider-settings` (active-only status) — no
  multi-kind probe wall in Globals.
- **DON'T** use `IconButton` `sm` or labeled `Button` `primary`/`tonal` on
  PageScroll **section-body** ControlRows when the row `label` already names
  the section — default **md** ghost IconButton + Tooltip only; primary-end
  labeled CTA stays for Dialog feet / unlabeled action rows. Same page:
  catalog ControlRow + List trailing + section strip share **md**. Live
  `#rhythm` morph + cover-letter.
- **DON'T** park bare item counts (`.fynns-table-meta` with `{n}` / `.length`)
  in catalog / section `ControlRow` clusters beside IconButtons (add /
  import / clear / refresh), and **don't** bake `(N)` / `N/M` into the row
  `label`, when the sibling List / EmptyState already communicates
  cardinality — **information redundancy (hard)** (≥ **0.5.266**) unless the
  product explicitly requires a count (user asked, selection tally, pagination
  range, or an ops KPI the product named). Section chrome = **label +
  IconButtons only**. When a count *is* required, prefer Card / Collapsible
  **body** `.fynns-table-meta` (never glue into `title` / action cluster).
  Live `#rhythm` catalog. Failure: CONSUMER_TREATY ControlRow unsolicited
  item count.
- **DON'T** flatten credentialed **provider Manage** into one Card that always
  shows: every provider's OK/Fail wall + unrelated API-key rows + model picker
  + probe CTAs + `default=` / `override=` / raw-slug debug footnotes —
  **information redundancy (hard)** (≥ **0.5.267**). Manage surface = short
  Card title (≤1 InfoHint) → preference **`ControlRow`** for active provider →
  credential **when needed** as password `FieldBlock` (eye in `trailing`) +
  **same-row** end-align Save (`Input` `fynns-control-cluster__grow` then
  `SaveIcon` IconButton — hard ≥ **0.5.252** / **0.5.268**; live
  `#provider-settings` — **not** a connection-chip / Add Dialog; **not**
  `unit-stack` Save under the field)
  → model as `FieldBlock` + **`DropdownMenu`** (`__grow`) + refresh sm
  IconButton (**not** a selectable `List` wall of model chips; keep-set
  prefers Menu over soft-deprecated `Select`) → fail = `InlineAlert`
  (success silent) → one
  end-align Verify. Omit debug meta. Status marks when needed =
  `.fynns-list-item-status`, **not** `Chip`. Runtime composer pickers are a
  **different** surface. Live `#provider-settings`. Failure: CONSUMER_TREATY
  provider Manage flat dump; **FieldBlock Save IconButton wraps under Input**.
- **DON'T** put sibling FieldBlocks in a `Grid` that vertically **centers** when
  a sibling cell grows taller — core ≥ **0.5.172** defaults `.fynns-grid` to
  `align-items: start` so labels share one top edge (Hub Inspector agent | cwd
  failure). Select menu is **portaled** (≥ **0.5.208**); shell stays 40dp — do
  **not** invent consumer `align-items: center` on `.fynns-grid` (still fails if
  Autocomplete/SearchBar docks or any cell grows). Live
  `#sandbox-field-stack-grid-select`. Failure: CONSUMER_TREATY FieldStack Grid
  vertically centers short FieldBlock beside expanded Select.
- **DON'T** leave FieldStack→`Grid` `x={N}` hugging `max-content` in a wide
  form Surface / Card (short island + dead gutter) — core ≥ **0.5.211** fixed-`x`
  grids fill the parent with equal `minmax(0, 1fr)` tracks; Select stays
  `width: 100%` with measure as a **floor** only. Do **not** invent consumer
  `width: 100%` / `1fr` patches on `.fynns-grid`. Do **not** use `equalCells`
  (or other Grid variants) for form FieldBlocks — sandbox `#form-recipe` /
  `#sandbox-field-stack-grid-select` teach **only** fixed-`x` fill; `equalCells`
  is for measured tile catalogs (`#code-block` tokens). Live
  `#sandbox-field-stack-grid-select`. Failure: CONSUMER_TREATY FieldStack Grid
  hugs max-content leaving dead gutter in form Surface.
- **DON'T** paint self-evident save / copy / open-folder actions as **labeled**
  `Button`s (ghost **or** tonal / primary) in Card chrome, densified Select
  clusters, **or FieldBlock / form `.fynns-control-cluster--end-align`**
  (e.g. visible `Save key` / `Save defaults` / `Copy Prompt` beside a secret
  Input) — **information redundancy**. Use **`IconButton` + `Tooltip`**
  (+ `aria-label`): copy → `ClipboardIcon`; save key / token / defaults /
  draft → `SaveIcon` (busy → IconButton `loading`); open folder →
  `FolderOpenIcon`. **Secret / Manage Save (hard ≥ **0.5.252** / **0.5.268** /
  chrome ≥ **0.5.271**):** one `.fynns-control-cluster--end-align` — `Input`
  with `className="fynns-control-cluster__grow"` (optional reveal `trailing`
  sm) **then** Save `IconButton` `variant="ghost"` `size="sm"` on the **same
  line** (match model-refresh / in-field sm disks — **not** tonal 40dp). Do
  **not** `unit-stack` the Save under the field. Keep **labeled** Buttons for
  primary workflow CTAs that need a verb on the face (`Validate` / `Deliver` /
  Dialog feet / generate).
  Live `#sandbox-card-chrome-icon-actions` / `#provider-settings` /
  `#sandbox-card-draft-actions`. Failures: CONSUMER_TREATY Card chrome labeled
  ghost Copy/Save instead of IconButton+Tooltip; **FieldBlock labeled Save key
  instead of IconButton+Tooltip**; **FieldBlock Save IconButton wraps under
  Input**.
- **DON'T** put `variant="primary"` (filled) **leading** a multi-control
  `.fynns-control-cluster` in Card / Collapsible `actions` (or densified head
  strips) — LTR order is secondary ghost/tonal IconButtons **then primary last**
  (end-edge), same grammar as Cancel…→primary / mode-drawer Plus last. Failure:
  CONSUMER_TREATY Card head primary IconButton leftmost in control-cluster.
  Live `#sandbox-card-head-primary-end`.
- **DON'T** invent a consumer `wheel` / `onWheel` remapper on
  `.fynns-table-wrap` so vertical scrolling pans columns — core ≥ **0.5.184**
  maps vertical wheel → `scrollLeft` when the host has H overflow and cannot
  scroll further on Y (default on; opt out `data-fynns-wheel-x="off"`; edge
  trap ≥ **0.5.186** so slide-back does not yank PageScroll). Live `#table`.
  Failure: CONSUMER_TREATY wide Table wheel scrolls PageScroll.
- **DON'T** invent a private absolute dock for Pagination rows-per-page Select
  (or any consumer CSS that docks `.fynns-search-bar-panel` with
  `position:absolute; bottom:100%`, or restyles `.fynns-select-menu`) — use the
  **stock** Keep-set Select: 40dp shell + **portaled** `.fynns-select-menu`
  (≥ **0.5.208** — M3 Exposed Dropdown; default **content width** ≥ **0.5.244**
  via `--fynns-select-measure-min`; stretch only with `fullWidth`,
  `.fynns-field-block`, or `.fynns-control-cluster__grow`; menu **width = live
  shell** ≥ **0.5.238** — header and list share one length; long labels
  ellipsize; retires ≥ **0.5.209** `max-content` grow past a narrow trigger;
  stretched short-option fields still match ≥ **0.5.220**;
  trigger `--fynns-select-measure-min` absolute
  floor ≥ **0.5.210** — never `min(100%, …)` crush under Grid; retires both the
  0.5.151–0.5.193 upward panel fork, the 0.5.194–0.5.207 in-flow joined
  capsule, and the 0.5.216 short-label floating chip). Live `#select` /
  `#sandbox-select-wide-short` / `#pagination` /
  `#sandbox-field-stack-grid-select`. Failure: CONSUMER_TREATY Pagination
  Select invents absolute overlay / Select stretched without fullWidth /
  Select menu narrower than stretched trigger / Select menu wider than narrow
  trigger.
- **DON'T** treat a bare Select as a full-bleed form field — default is
  **content width** (≥ **0.5.244**). Opt into stretch with `fullWidth`, place
  the Select inside `.fynns-field-block`, or use `.fynns-control-cluster__grow`.
  Do **not** invent consumer `width: 100%` on `.fynns-select`. Live `#select` /
  `#sandbox-select-wide-short` / `#form-recipe`. Failure: CONSUMER_TREATY
  Select stretched without fullWidth.
- **DON'T** leave a portaled `.fynns-select-menu` narrower than a stretched
  form trigger when options are short — that reads as a duplicate floating
  chip under the field. Core ≥ **0.5.238** sets menu **width = live shell**
  (same as ≥ **0.5.220** stretch match). Do **not** invent consumer
  `min-width` / `width` overrides on the menu. Live `#sandbox-select-wide-short`.
  Failure: CONSUMER_TREATY Select menu narrower than stretched trigger.
- **DON'T** let a portaled `.fynns-select-menu` grow wider than a narrow
  trigger for long option labels — menu stays shell-width; labels ellipsize
  (≥ **0.5.238**). Live `.sandbox-select-narrow-host` under `#select`.
  Failure: CONSUMER_TREATY Select menu wider than narrow trigger.
- **DON'T** hard-clip truncated Select / Autocomplete / SearchBar result /
  Menu item / FieldBlock Menu trigger / Card·Collapsible title /
  NavigationDrawerItem / **NavigationDrawerGroup** label / TopAppBar title /
  Button string label / List string headline·supporting·trailing text /
  CodeBlock label / CommandPalette item label·description /
  ChatActivity·ChatThinking labels / Snackbar line-clamped message /
  ControlRow string label / DatePicker month title / SplitButton main label /
  TimelineItem string lines / Tree item label / Breadcrumb current·link /
  Switch `labelSide=end` / ChatCitation chip publisher·card snippet without
  `…` **and** a Tooltip of the full string (≥ **0.5.240** `OverflowTip` on
  menus/fields; ≥ **0.5.242** expands the same pattern; ≥ **0.5.243** keeps
  Select / NavDrawer / Command **trigger labels** visible — tip `width: 0`
  only on true flex-row hosts — never `title=`).
  `NavigationDrawerGroup` `label` is `ReactNode` (≥ **0.5.242**); prefer a
  **string** so core wraps `OverflowTip` (full worktree path on hover) — do
  **not** cast ReactNode `as unknown as string`. List `__grow` /
  `.fynns-table-meta` ReactNode cells → wrap at the call site (sandbox
  `#list` run-summary). Live `#select` / `#autocomplete` / `#search-bar` /
  `#sandbox-menu-field-match` / `#card` / `#toggle-group` / `#activity` /
  `#list` / `#layouts-demo-shell`. Failure: CONSUMER_TREATY truncated option
  lacks ellipsis Tooltip / truncated chrome / list / snack label lacks
  ellipsis Tooltip.
- **DON'T** leave a FieldBlock `DropdownMenu` panel wider (or narrower) than
  its labeled trigger — core ≥ **0.5.239** auto **matchTriggerWidth** under
  `.fynns-field-block` (menu width = live trigger; long items ellipsize).
  Toolbar / `iconOnly` menus stay content-fit. Do **not** invent consumer
  `width` / `min-width` on `.fynns-menu`. Live `#sandbox-menu-field-match`.
  Failure: CONSUMER_TREATY DropdownMenu wider than FieldBlock trigger.
- **DON'T** wrap a FieldBlock match-width `DropdownMenu` in `Tooltip` (or a
  bare `span`) and leave it **content-sized** while a sibling bare Menu
  stretches — tip hosts default `inline-flex` shrink-wrap. Core ≥ **0.5.290**
  stretches `.fynns-field-block__main > .fynns-tooltip-trigger:has(.fynns-menu-root)`
  (+ nested `span:has(.fynns-menu-root)`). Prefer string `trigger` (built-in
  OverflowTip) + FieldHeader `InfoHint` for how-to; do **not** invent consumer
  `width: 100%` on tip wrappers. Live `#sandbox-menu-field-match`. Failure:
  CONSUMER_TREATY FieldBlock Menu tip-wrap shrinks trigger.
- **DON'T** leave a FieldBlock / match-width `DropdownMenu` panel **left-shifted**
  vs the trigger — floating default is `anchorMode: "element"` (≥ **0.5.254**);
  `anchorTargetRect` seatbelt measures `button` / `[aria-haspopup]` as **self**,
  never the inset label child. Do **not** invent consumer `left` / `transform`
  on `.fynns-menu`. Live `#sandbox-menu-field-match`. Failure: CONSUMER_TREATY
  DropdownMenu panel left-shifted vs trigger.
- **DON'T** ship a labeled `DropdownMenu` trigger with **no trailing chevron**
  — users cannot tell it is a menu. Core ≥ **0.5.253** auto-appends
  `ChevronDownIcon` in a trailing flex slot (Select recipe) and rotates it when
  open; `iconOnly` stays glyph-only. Do **not** invent consumer chevron markup /
  CSS. Live `#menu` / `#sandbox-menu-field-match`. Failure: CONSUMER_TREATY
  labeled DropdownMenu missing chevron.
- **DON'T** invent a consumer nested flyout / absolute submenu for Menu
  rows — use keep-set `DropdownMenuSub` (hover / ArrowRight; panel docks end
  via floatingBox). Live `#sandbox-menu-submenu`. Failure: CONSUMER_TREATY
  DropdownMenu missing nested submenu.
- **DON'T** leave Menu / Button icons riding the inline SVG baseline strut
  (chevron looks 高 / 歪) — core icons default `.fynns-icon { display: block }`
  (≥ **0.5.254**); Menu chevron lives in `.fynns-menu-trigger-trailing`. Do
  **not** invent consumer `transform: translateY` optical nudges. Failure:
  CONSUMER_TREATY Menu chevron optically high.
- **DON'T** clip Latin descenders on **any** single-line ellipsis label
  (`g` / `y` / `p` look flat) — including `DropdownMenu` triggers,
  `ChatComposerToggle`, `Button` / SplitButton labels, `ToggleChip`, Chip,
  Switch end-labels, DatePicker title, and **`.fynns-overflow-tip-label`**
  (global seatbelt ≥ **0.5.294**; Menu ≥ **0.5.255**). Use
  `--fynns-line-height-snug`, never `line-height: 1` /
  `--fynns-line-height-tight` together with `overflow: hidden`. Do **not**
  invent consumer padding / line-height on tip or pill labels. Live
  `#sandbox-menu-field-match` / `#sandbox-chat-composer-thinking-toggle`
  (Thinking **g**). Failure: CONSUMER_TREATY Ellipsis label clips descenders.
- **DON'T** ship a labeled `DropdownMenu` with a leading glyph **misaligned**
  vs the label (icon rides baseline / floats high) — pass **`leadingIcon`**
  (16dp `.fynns-menu-trigger-leading`, flex-centered with the label — ≥
  **0.5.258**). Do **not** stuff `<>icon text</>` into `trigger` and invent
  consumer `align-items` / `translateY` on `.fynns-menu-trigger-label`. Live
  `#sandbox-menu-leading-icon` / `#menu`. Failure: CONSUMER_TREATY Menu trigger
  leading icon misaligned.
- **DON'T** let `ChatComposer` **leading** / `endActions` labeled
  `DropdownMenu` triggers mid-glyph hard-clip past the capsule (or spill
  hover/focus paint outside the shell) — pass **string** `trigger` (core wraps
  OverflowTip); core caps each labeled menu at
  `--fynns-chat-composer-leading-menu-max` and clips shell overflow
  (≥ **0.5.288**). Do **not** invent consumer `max-width` / manual `slice` /
  private chip-label CSS. Live `#sandbox-chat-composer-leading-menus` /
  `#chat`. Failure: CONSUMER_TREATY ChatComposer leading Menu label hard-clips.
- **DON'T** park the **model** picker in `ChatComposer` `leading` (stays
  start-clustered) — put it in `endActions` (end / right, before Send) with
  `align="end"` (≥ **0.5.288**). Volume / tools stay in `leading`. Do **not**
  use `trailing` for the model Menu (`trailing` **replaces** Send). Live
  `#sandbox-chat-composer-leading-menus`. Failure: CONSUMER_TREATY ChatComposer
  model Menu left-clustered.
- **DON'T** let labeled volume / model Menus starve the ChatComposer draft
  on narrow hosts (~365px) — core ≥ **0.5.288** shares menu shrink + field
  floor (`--fynns-chat-composer-field-min`). Live
  `#sandbox-chat-composer-leading-menus-narrow`. Failure: CONSUMER_TREATY
  ChatComposer narrow host crushes draft.
- **DON'T** let `endActions` model Menu crush to chevron-only beside
  Thinking / Vision / Send — core ≥ **0.5.291** uses content-first model flex
  + `--fynns-chat-composer-leading-menu-min`; mode pills go icon-only on
  ≤ **36rem** containers (≥ **0.5.293**, was 26rem — mid widths must not
  ellipsize to “T.”). Do **not** invent consumer min-width / icon-only
  chip CSS. Live `#sandbox-chat-composer-thinking-toggle` /
  `#sandbox-chat-composer-thinking-toggle-narrow`. Failure:
  CONSUMER_TREATY ChatComposer endActions model crushed by toggles.
- **DON'T** bury ChatComposer **mode** switches (Thinking / Vision / …) in the
  leading `+` Menu — use keep-set `ChatComposerToggle` in `endActions`
  (Model → Thinking → Vision → Send; Tooltip for tip copy — ≥ **0.5.289**).
  Do **not** invent consumer chip / Switch CSS inside the capsule. Live
  `#sandbox-chat-composer-thinking-toggle` (wide / labeled) /
  `#sandbox-chat-composer-thinking-toggle-narrow` (≤ **36rem** icon-only +
  Tooltip). Failure: CONSUMER_TREATY ChatComposer mode toggle buried in + Menu.
- **DON'T** flatten every LLM source into one ChatComposer model Menu — use
  `DropdownMenuGroup` sections **Local** / **Cloud** / **CLI** with
  separators (≥ **0.5.290**). Show a section **only** when that source is
  configured (key / endpoint / CLI auth); omit empty sections; if none →
  disabled “No models available”. Live `#sandbox-chat-composer-model-sections`
  / `#sandbox-chat-composer-model-empty`. Failure: CONSUMER_TREATY ChatComposer
  model Menu flat without source sections.
- **DON'T** park supporting / muted helper copy **flush** under a Select (or
  other form control) at 0–4dp — control → hint uses
  `--fynns-layout-field-hint-gap` (**8dp**). Prefer `FieldBlock` + `FieldHint`
  (or `ControlBlock` `description`). Live `#sandbox-select-wide-short` (≥
  **0.5.230**). Failure: CONSUMER_TREATY Select supporting copy kisses trigger.
- **DON'T** park teaching / muted helper copy **tight** against a Card shell
  (help above or below at ≤**field-hint-gap** / **8dp**) — Card shell ↔
  teaching essay uses `--fynns-layout-unit-stack-gap` (**16dp**, ≥ **0.5.233**).
  Prefer a `unit-stack` / flex column host with that gap; do **not** leave bare
  Card + `<p>` as block siblings with no gap, and do **not** reuse control→hint
  **8dp** for a full Card chrome band. Live `#sandbox-card-draft-actions`
  / `#sandbox-card-chrome-icon-actions` / `#sandbox-card-head-primary-end`.
  Failure: CONSUMER_TREATY Card teaching help kisses shell.
- **DON'T** let Pagination bar siblings (`.fynns-table-meta` noun, range
  `FieldHint`, `__end` page discs) invent `align-items: center` on `__start`
  — core ≥ **0.5.197** pins `.fynns-pagination-bar` / `__start` to
  `align-items: flex-start` and gives noun/range a **40dp**
  (`--fynns-size-icon-target`) trigger-band min-height so they share the
  Select **shell** band (menu is portaled ≥ **0.5.208** and does not grow the
  host). Live `#pagination`. Failure: CONSUMER_TREATY Pagination Select
  siblings center on expanded height.
- **DON'T** crush Pagination bar horizontal breath to IconButton
  `control-cluster-gap` (**4dp**) — noun | Select | range use
  `--fynns-layout-action-cluster-gap` (**8dp**); start cluster ↔ `__end`
  discs use `--fynns-layout-unit-stack-gap` (**16dp**, ≥ **0.5.202**). Never
  invent consumer `gap: 4px` / `gap: var(--fynns-layout-control-cluster-gap)`
  on `.fynns-pagination-bar` / `__start`. Live `#pagination`. Failure:
  CONSUMER_TREATY Pagination bar gaps crushed to 4dp.
- **DON'T** (any consumer) locally restyle keep-set **chrome anatomy** —
  especially Select / SearchBar / Autocomplete / DropdownMenu / **Input
  `.fynns-field-shell`** **border-radius**, padding, shadow, overflow, or
  expand placement (no `.hub-*` / app CSS that targets `.fynns-select`,
  `.fynns-select-menu`, `.fynns-search-bar`, `.fynns-search-bar-panel`,
  `.fynns-menu`, **`.fynns-field-shell`**, **`.fynns-field-affix`**). Props +
  strings only; missing capability → core first.
  Live `#select` / `#menu` / `#password` / `#input`. Failure: CONSUMER_TREATY
  consumer restyles keep-set chrome radius; Input trailing affix far from
  shell edge.
- **DON'T** invent consumer negative margin / private pad on
  `.fynns-field-shell` / `.fynns-field-affix`, ship **md** IconButton in Input
  `leading`/`trailing`, or clone reveal/clear **outside** `Input` `trailing`
  (sibling eye, absolute overlay). Affix-owned edges use capsule-chrome only
  (**4dp**, ≥ **0.5.237**); affix disks stay **sm** (**32dp**, core clamp ≥
  **0.5.131**). Live `#password` / `#input`. Failure: CONSUMER_TREATY Input
  trailing affix far from shell edge; Input trailing md IconButton in field
  shell.
- **DON'T** start **new** consumer screens on soft-deprecated **`Select`** /
  **`Autocomplete`** (≥ **0.5.236**) — still exported + taught on Globals
  `#select` / `#autocomplete` with `InlineAlert` warning, but prefer
  **`DropdownMenu`** (`#menu`) for discrete picks and **`SearchBar`** /
  **`CommandPalette`** for type-to-filter / commands. Temporary carve-out:
  Pagination `.fynns-pagination-bar` rows-per-page may keep stock Select until
  a Menu-based pager recipe lands. Failure: CONSUMER_TREATY Select Autocomplete
  deprecated prefer Menu SearchBar.
- **DON'T** bake the page-size noun into every Select option (`Rows: 10`,
  `Sessions: 50`, `每页 100 行`) — options are **digits only**; noun once via
  sibling `.fynns-table-meta` + `ariaLabel`. Live `#pagination`. Failure:
  CONSUMER_TREATY Pagination Select option repeats noun.
- **DON'T** hard-swap `ClippedNavShell` `nav` while `navMode` stays `"drawer"`
  for root ↔ drill-in / mode catalog — pass **`navKey`** + **`navDirection`**
  so the body Shared-Axis-X slides (core ≥ **0.5.183**; width stays open —
  not close→swap→open).   Core ≥ **0.5.198** finishes the morph without leaving
  an outgoing catalog / second Y rail ghost on Back; ≥ **0.5.201** hides
  `--out` on the first prepare paint (not only `--out-run`); ≥ **0.5.202**
  suppresses portal overlay rails for **every** host under the nav-axis for
  the whole morph, and `refreshOverlayScrollbars` updates **synchronously**
  (no rAF defer — stale rails for one paint = Back Y flash). Live
  `#layouts-demo-drill-in`. (≥ **0.5.202**/ **0.5.203**)
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
  InfoHint/Slider — see [`llm/PERF.md`](../../llm/PERF.md). Don't reintroduce
  `@radix-ui/*` / `sonner` / purged Toast/Popover/Panel APIs. Don't drop a
  sandbox demo while the symbol stays exported (or reverse) — atomic
  unexport+delete+demo+BREAKING_PURGE; `npm run check:wysiwyg`.
- **DON'T** cap PageScroll / destination-canvas Card / form stacks with
  layout max tokens that belong elsewhere — especially
  `--fynns-layout-sheet-max-width` (BottomSheet **only**, 40rem / 640dp),
  `--fynns-layout-chat-max-width` (**Chat** main column **only**, 48rem),
  `--fynns-layout-dialog-max-width*` (centered Dialog panels), or private
  rem/`maxWidth` on a `hub-col` / unit wrapper. Card / Collapsible already
  stretch (`width: 100%`, `align-self: stretch` ≥ **0.5.141**); BusyRegion
  content stretches with them. Section ControlRow + Cards share one
  **right edge**; even without a sibling ControlRow, destination Cards fill
  `.fynns-content-column`. **`.fynns-content-column` itself fills the
  PageScroll pane** (inset pad only; `--fynns-layout-content-max-width`
  default **`none`** ≥ **0.5.186** — do **not** revive a soft ~1180dp
  reading strip or invent a centered reading-width column). **FullscreenDialog**
  body direct children also stretch inline (≥ **0.5.186**) — never leave a
  sheet-max / content-sized settings column with dead gutters. Live
  `#page-scroll` / `#overlays`. ≥ **0.5.142** names chat/dialog misuse
  explicitly.
- **DON'T** dump every row of a Card / PageScroll **data Table** when the
  catalog can grow past ~10 rows — use `useRevealMore` + `RevealMore` (default
  **10** / step **10**, ≥ **0.5.144**): slice in the app; foot = **tonal**
  **md** labeled Button (≥ **0.5.147** tonal; size back to **md** ≥ **0.5.149**),
  centered **outside** `.fynns-table-wrap`; pass locale (`更多` / `Show more`).
  Short tables, Dialog-hosted tables, and true page `Pagination` are exempt. Do
  not bounce an expanded window when polling only grows `total` — use `resetKey`
  for filter / source identity. Live `#table`.
- **DON'T** dump every item of a Card / PageScroll **List** catalog when it can
  grow past ~5 rows — same `useRevealMore` + `RevealMore`, but pass
  `REVEAL_MORE_LIST_DEFAULT_INITIAL` / `_STEP` (**5** / **5**, ≥ **0.5.145**)
  because ListItems are taller: foot **after** the List (unit-stack sibling);
  short lists / Dialog / `Pagination` exempt. Live `#list`.
- **DON'T** open a **DropdownMenu** that paints a near-viewport item tower —
  panel caps `max-height: min(70dvh, 20rem)` + `fynns-scroll` (≥ **0.5.250**);
  overlay thumbs for the menu itself use `--fynns-z-scroll-overlay-flyout`
  (≥ **0.5.251**). Do **not** invent consumer Show-more / private menu
  virtualizers for ordinary catalogs (~dozens of rows). Huge catalogs (filter /
  search / async window) belong in the **consumer**. Failure: CONSUMER_TREATY
  Menu/Select flyout scroll thumb buried under panel. Live
  `#sandbox-scroll-menu-stack`.
- **DON'T** paste **consumer product content** into core/sandbox — generic
  placeholders only. Rule: [`.cursor/rules/no-consumer-content.mdc`](../../.cursor/rules/no-consumer-content.mdc).
- **DON'T** stack diagnostic essays as FieldHint / muted `<p>` unit-stacks —
  short status + `InfoHint` on the ControlRow. Settings Card policy: compress
  to Tooltip / label-row `InfoHint` `sm` (≤1 per head); `FieldHint` =
  one short line. Env keys: InfoHint on label row (danger when required empty);
  no status Chip; Input trailing reveal = `sm` only inside `trailing` (never
  a cloned eye outside the shell; never consumer pad/margin on
  `.fynns-field-shell` / `.fynns-field-affix` — ≥ **0.5.237**). Live `#rhythm` /
  `#env-check` / `#password` / `#provider-settings`.
- **DON'T** paint **named recipe / preset / pack catalogs** as a grid of fat
  Cards each dumping description + evidence + `id:` as stacked `FieldHint`s
  plus a `ChipSet` tag soup in `actions` — that is Path-catalog fat-Card
  failure. Host = **one** `Card` (or section) wrapping **one** `List` of
  `ListItem`s: short one-line `supportingText`; kind/source in
  `trailingSupportingText` / `.fynns-table-meta` (not Chip); long copy + id →
  Preview `Dialog` / row `InfoHint`; row actions = ghost **md** IconButtons
  (+ Tooltip) or one labeled primary CTA. Do **not** also restack the same
  essay as a page `FieldHint` under a Card that repeats the TopAppBar title.
  Live `#sandbox-list-recipe-catalog` / `#list`. Failure: CONSUMER_TREATY
  recipe catalog fat Card FieldHint essays.
- **DON'T** put a page/section `FieldHint` (or section-lead copy) that only
  restates visible **ToggleGroup** / **Tabs** option labels (“A / B / C; three
  tabs”) — **information redundancy**. The control already names the modes;
  TopAppBar `InfoHint` may keep a short **scope** tip that does **not** list
  those labels. Live `#rhythm` (Surface + ToggleGroup — no sibling FieldHint
  naming Catalog / Mirror).
- **DON'T** paint a page/section `FieldHint` / section-lead / **`FieldBlock`
  `description`** / ControlBlock `description` that **restates** the same tip
  already on TopAppBar `trailing` `InfoHint`（页面说明）— **information
  redundancy (hard)**. Section / destination help lives **once**: TopAppBar
  InfoHint only. Do **not** twin the identical (or paraphrased) copy as the
  first body lead **or** as a FieldBlock description (e.g. “shared with Tab X”
  when the bar tip already says the list is shared). FieldBlock description may
  keep **ops-only** copy (browse / paste path) that is **not** in the bar tip.
  Live `#layouts-demo-shell` (TopAppBar InfoHint; main canvas has **no** sibling
  lead / FieldBlock description restating that tip). Failure: CONSUMER_TREATY
  section FieldHint restates TopAppBar InfoHint.
- **DON'T** park a **how-to / direction / path essay** in Dialog / Drawer /
  BottomSheet **`description`** (or a multi-line caption under the title) —
  **information redundancy (hard)** (≥ **0.5.284**). `description` is optional
  **short caption** only (≤ ~one sentence). Ops / scan / overwrite / path help
  → **one** `headActions` **`InfoHint`** `sm` (Tooltip on the “i”); do **not**
  dump the same paragraph as body lead. ConfirmDialog may keep a short
  **confirm-intent** line (what will happen). Live `#overlays` (create Dialog:
  no essay `description`; tip on head `InfoHint`). Failure: CONSUMER_TREATY
  Dialog description how-to essay.
- **DON'T** twin the same empty/status signal on a `ListItem` in both `overline`
  **and** `trailingSupportingText` (e.g. overline “尚无构建记录” + trailing
  “未构建”) — **information redundancy (hard)**. Status / empty → **`overline`
  once**; kind / wiki / complementary marks → `trailingSupportingText` /
  `.fynns-table-meta`; dates / build timestamps → trailing meta (or omit when
  unbuilt). Live `#sandbox-list-repo-path-actions`. Failure: CONSUMER_TREATY
  ListItem overline restates trailing status.
- **DON'T** put Settings both as root NavigationDrawerItem **and** footer gear
  — `navFooter` only; Settings = software chrome (locale/appearance/account);
  feature config = own destination; language not in TopAppBar. Live
  `#layouts-demo-shell`.
- **DON'T** park mode / session delete (or other row `IconButton`s) on
  `NavigationDrawerItem` `badge` — `badge` is **counts / marks only**. Row
  actions use `trailing` ghost **sm** `IconButton` / `DropdownMenu` `iconOnly`
  (List `--with-end` overlay reveal ≥ **0.5.221**; disk clamp ≥ **0.5.225**:
  destination pill is **40dp**, so trailing actions stay **32dp** — never
  default **md** / 40dp; ≥ **0.5.234** also keeps ≥ **`space-xs`** (**4dp**)
  clear on the **inline-end**; ≥ **0.5.245** fades with
  `--fynns-navdrawer-actions-reveal` / `--fynns-duration-slow` — **not**
  `duration-fast` snap; 1/2/3 disks auto-reserve; menu-open
  `:has([aria-expanded="true"])` keeps trailing visible while a portaled
  More menu is open). Idle-hidden on fine pointer; hover / focus-within;
  coarse always visible; action is a **sibling** of the destination button —
  never nested. Live `#layouts-demo-navigation-drawer`. Failure:
  CONSUMER_TREATY NavigationDrawerItem badge IconButton always visible.
- **DON'T** leave a mode / session **trash** (or other destructive) IconButton
  as the only always-on-hover row action when a **More (`…`)** menu can hold
  it — **information redundancy** / ChatGPT-style chrome: prefer
  `MoreHorizontalIcon` + `DropdownMenu` `iconOnly` for secondary / destructive
  ops; optional 1–2 high-frequency shortcuts (Rename / Pin) may sit beside
  More. Menu rows = **icon + label**; section with `DropdownMenuSeparator`;
  delete = `DropdownMenuItem` `tone="danger"`. Do **not** invent consumer CSS
  for the fade. Live `#layouts-demo-navigation-drawer` (More-only /
  Rename+More / Pin+Rename+More). Failure: CONSUMER_TREATY
  NavigationDrawerItem always-visible trash / no more-menu.
- **DON'T** park an always-visible ghost **Trash** next to primary **New**
  on session / history chrome — use **`NavigationDrawerNewChat`** (full-width
  labeled New chat, **ghost / no border**, ≥ **0.5.256** / **0.5.257**) with
  optional `trailing` More for bulk delete `tone="danger"` (or omit). Do
  **not** use icon-only `--toolbar-end` Plus for history sidebars. Catalog
  tools may still show sort / refresh / bulk-select beside New on
  `--toolbar-end` — **not** a lone trash twin. Live
  `#sandbox-navdrawer-session-chrome`. Failure: CONSUMER_TREATY mode drawer
  toolbar trash+new twin.
- **DON'T** put a leading `icon` on session / history `NavigationDrawerItem`s
  by default — rows are **label (+ optional `trailing` More) only**. `icon` is
  **opt-in** when the glyph carries meaning (typed destinations, distinct
  kinds) — never a uniform decorative `FileIcon` on every chat title. Live
  `#sandbox-navdrawer-session-chrome` (clean default) /
  `#sandbox-navdrawer-session-icon` (opt-in icon variant). Failure:
  CONSUMER_TREATY session history leading icon by default.
- **DON'T** invent a chat / session-history product layout that skips the
  keep-set tree — default = **`ClippedNavShell`** + session
  `NavigationDrawer` (`NavigationDrawerNewChat` …) + **`FillColumn` → `Chat`**.
  New-chat landing = greeting + soft starters + `ChatComposer` inside
  `ChatThread.empty` (centered); active thread docks composer under
  `ChatThread` inside Chat. Flat destination roots stay on
  `DestinationAppShell`. Do **not** put composer in FillColumn `footer`, use
  `PageScroll` as chat main scroll, Chip starters, or Trash+Plus twin. Live
  `#layouts-demo-chat-product`. Failure: CONSUMER_TREATY chat product /
  session host wrong tree.
- **DON'T** inset mode `--toolbar-end` Plus (or preference Switch) with Item
  `item-pad-inline-end` so it sits ~16dp short of destination **Item pill
  outer** — Plus / Switch / **pill outer** share one trailing edge (body
  content edge; ≥ **0.5.228**). Trailing **hover disks** still inset
  `space-xs` from that outer (≥ **0.5.234**) — do not flush the IconButton
  wash to the stadium end. Live `#layouts-demo-navigation-drawer`. Failure:
  CONSUMER_TREATY mode drawer Plus ≠ Item pill end.
- **DON'T** ship mode `--toolbar-end` IconButtons at default **md** (**40dp**)
  — drawer chrome tools are **sm** (**32dp**, core clamps ≥ **0.5.235**). Prefer
  `size="sm"` in props; do not invent consumer overrides that restore 40dp
  disks beside destination pills. Live `#layouts-demo-navigation-drawer`.
  Failure: CONSUMER_TREATY mode drawer toolbar-end IconButton md.
- **DON'T** let bare mode `--toolbar-end` / preference `ControlRow` as **direct**
  drawer-body children open only Item `section-gap` (**4dp**) before the next
  sibling — chrome ↔ destinations / filter must use `--fynns-navdrawer-search-gap`
  (**8dp**, ≥ **0.5.222**). Do **not** invent a consumer tools wrapper solely to
  fake that gap. Live `#layouts-demo-navigation-drawer`. Failure: CONSUMER_TREATY
  mode drawer tools↔filter crushed to 4dp.
- **DON'T** drive NavigationDrawer footer `Avatar` initials from a **truncated**
  `name` while the visible `.fynns-nav-drawer-footer-account-label` stays the
  full string (`Hub` → `HU` while label reads `Agents Hub`) — pass the **same**
  visible label into Avatar `name` (multi-word → first+last initials,
  uppercased ≥ **0.5.214**: `Agents Hub` → `AH`). Sandbox recipe
  `NavDrawerFooterAccount` has no separate initials prop. Live
  `#layouts-demo-shell` / `#avatar`. Failure: CONSUMER_TREATY NavDrawer footer
  Avatar initials ignore visible label.
- **DON'T** paste a long diagnostic essay into mode / drill-in
  `NavigationDrawer` `InlineAlert.message` (backend timeout, ports, log paths)
  — keep a **short** status line; park detail on `InfoHint` `tone="danger"`;
  Retry = end-align labeled Button (toolbar Refresh may also clear). Prefer
  this over main-canvas Banner for catalog-host failures. Live
  `#sandbox-navdrawer-mode-catalog-fail` / `#layouts-demo-navigation-drawer`.
  Main pane cold-start remains `#sandbox-pane-load-error`. Failure:
  CONSUMER_TREATY mode drawer InlineAlert essay.
- **DON'T** turn an in-canvas catalog into a silent full-canvas detail
  PageScroll replace — keep List/Timeline mounted; edit → `Dialog` `size="lg"`
  (+ `FullscreenDialog` only for multi-Card long workflows). Drill-in is
  `#layouts-demo-drill-in`. Don't mount a full-workflow Card as sole
  FillColumn `header` (compact preview band only ≥ **0.5.76**). **DON'T**
  ship a PageScroll 「要点问卷 / multi-field brief」Collapsible that stacks
  ≥3 `FieldBlock`+description rows above a generate strip — removed from
  sandbox (`#form-recipe-page-scroll` purged). Multi-column / label+value
  records → `#table`; short inspector forms → `#form-recipe` Card /
  Collapsible / Dialog hosts only. Live `#form-recipe` /
  `#layouts-demo-fill-column` / `#table`.
- **DON'T** park a guide / questionnaire soft `Surface` as a `FillColumn`
  `children` sibling of `Chat` with `paddingBottom: 0` (or any flush stack) —
  Surface kisses `ChatActivity` / thread (≥ **0.5.277**). Put short above-chat
  chrome in **`header`**; core gaps header↔main and main siblings with
  `unit-stack-gap`. Canvas-capped header mid-scroll soft-masks (≥ **0.5.278**)
  — do **not** invent consumer `mask-image` on `.fynns-fill-column-header`.
  Header stays **content-sized** (`flex: 0 0 auto` ≥ **0.5.279**) and only
  scrolls when content exceeds the max-height cap — do **not** rely on
  flex-shrink to crush short guide / answer Surfaces into a nested scrollbar.
  Live `#layouts-demo-fill-column` / `#sandbox-fill-column-guide`.
  Failure: CONSUMER_TREATY FillColumn guide Surface flush to Chat /
  FillColumn header mid-scroll hard clip (no edge fade).
- **DON'T** clear `Dialog` / `ConfirmDialog` title/body source state in the
  same tick as `open→false` — `DialogFrame` exit (~240ms) still paints props;
  keep content until the next open. Never reuse a Confirm title as a Dialog
  title fallback (exit flash / wrong head). Live `#sandbox-list-recipe-catalog`.
  Failure: CONSUMER_TREATY Dialog exit clears title/body (flash).
- **DON'T** crush centered `Dialog` title top clearance below body end —
  non-confirm `.fynns-dialog-head` `padding-block-start` is
  `--fynns-layout-content-inset` (**18dp**, ≥ **0.5.280**) so title ink top
  matches body `padding-block-end` / labeled Dialog-foot Button bottom inset.
  Do **not** patch consumer `.fynns-dialog-head` pad or revive `dialog-inset/2`.
  Confirm heads keep full `dialog-inset`. Live `#overlays`. Failure:
  CONSUMER_TREATY Dialog title top ≠ body-end foot.
- **DON'T** park **`IconButton` / check-disk / Fab** (or any icon-only primary)
  as the confirm / dismiss control inside a centered `Dialog` /
  `ConfirmDialog` **body or foot** — **one Dialog foot style only** (≥
  **0.5.286**). Canonical foot = Dialog **`feet`** prop (sticky
  `.fynns-dialog-foot`, ≥ **0.5.297**) or `ConfirmDialog` stock foot — never
  bury Cancel inside scrollable `children`. Inside `feet`: 
  `.fynns-control-cluster--end-align` with **labeled** `Button`s only: LTR
  **Cancel** `ghost` `sm` leftmost → optional secondary tonal → **primary**
  confirm **rightmost** (Wave1 OverflowTip on long labels). Always render
  Cancel in `feet` on loading / empty-plan branches. How-to stays on
  `headActions` `InfoHint` `sm` — not a `description` essay that restates the
  FieldBlock label. Live `#overlays` / `#dialog-nested-scroll`. Failure:
  CONSUMER_TREATY Dialog foot IconButton / check-disk;
  Dialog body end-align footer clipped; Dialog feet omitted on empty plan.
- **DON'T** leave a transparent Dialog overlay eating clicks while
  `data-state="closing"` — core sets `pointer-events: none` on closing
  overlays (≥ **0.5.297**). Live `#overlays`. Failure: CONSUMER_TREATY
  Dialog closing scrim blocks clicks.
- **DON'T** crush BottomSheet title top below actions bottom — header outer
  `padding-block-start` aliases `--fynns-layout-sheet-actions-pad-bottom`
  (**24dp**, ≥ **0.5.281**). Do not revive `sheet-header-gap` as the outer
  title clearance. Live `#overlays`. Failure: CONSUMER_TREATY BottomSheet
  title top ≠ actions bottom.
- **DON'T** omit Destination FillColumn header `padding-block-end` on the
  canvas host — use equal `dialog-inset` block (≥ **0.5.281**). Live
  `#sandbox-fill-column-guide`. Failure: CONSUMER_TREATY FillColumn header
  top-only inset.
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
  PageScroll `flex:1` `min-height:0` `overflow-y:auto` — ≥ **0.5.93**). Don't
  let PageScroll Cards sit flush on the EndAside / scrollport **bottom** —
  `.fynns-content-column` keeps `--fynns-layout-dialog-inset` block pad, and
  core ≥ **0.5.263** sizes that column `flex: 0 0 auto` + `min-height: 100%`
  so pad-block-end joins scroll overflow (never `flex:1` inside the scrolling
  host, which ate bottom breath). Live `#layouts-demo-shell`.
- **DON'T** pad destination labels with redundant meta (`· N`, parenthetical
  glosses) unless asked — short name + optional Item `badge`. Don't pass
  `drawerHeadline` / sheet `headline` under DestinationAppShell / TopAppBar
  title (omit; Groups for body sections). Live `#layouts-demo-shell`.
- **DON'T** rename tokens to non-`--fynns-*` forms; invent consumer
  `width`/`min-width` on `.fynns-dialog-panel` (use FieldStack + `size="lg"`);
  pin CodeBlock/Textarea to fixed height on PageScroll catalogs (default
  autoGrow; `autoGrow={false}` only for height-resolved fill hosts); set main
  app chrome to `--fynns-font-serif`. Live `#form-recipe` / `#code-block`.

**Consumer failure-mode slug index:** [`llm/CONSUMER_TREATY.md`](../../llm/CONSUMER_TREATY.md)
(details live in this file’s Hard rules + Content density + sandbox demos — do
not reintroduce long treaty essays).

**Consumer apps (agents in any repo that consumes `@fynns/ui`):** treat this
package as a **function API** — import primitives and pass props / children /
labels only. **Do not** wrap `@fynns/ui` components in local restyles, fork CSS,
or invent parallel variants in the consumer. **Hard — chrome anatomy:** never
“fix” Select / SearchBar / DropdownMenu / Autocomplete **radius**, padding,
shadow, overflow, or expand placement in the consumer (no
`.fynns-select { border-radius… }`, no absolute dock of
`.fynns-search-bar-panel` / `.fynns-select-menu`, no private joined/half-shell CSS). Wrong look →
constrain in **this** core + sandbox `#select` / `#menu` first — never
self-author keep-set chrome in agents-hub or any sibling app. **Do not** edit
`node_modules/@fynn7/ui-design-core` for app features (bump the package version
or use a temporary `file:` / `npm link`). If the keep-set cannot meet the
requirement after exploring `AGENTS.md` + sandbox Globals, **stop and tell the
user explicitly** that the work must land in `fynns_ui_design_core` first, then
the consumer only calls the new API. Install / pin rules:
[`llm/CONSUME.md`](../../llm/CONSUME.md). Pasteable always-on consumer rule:
[`llm/consumer-cursor-rule.mdc`](../../llm/consumer-cursor-rule.mdc).
Failure: CONSUMER_TREATY consumer restyles keep-set chrome radius.
