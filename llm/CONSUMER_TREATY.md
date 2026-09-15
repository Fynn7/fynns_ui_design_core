# Consumer treaty — pasteable `@fynns/ui` contract

**Purpose:** give any consumer repo a short, always-on agent rule so it obeys
`@fynns/ui` even when nobody opens `AGENTS.md` / `CONSUME.md`.

**Single paste source:** [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)
(copy that entire file).

**Moved:** long failure-mode essays are gone. Authoritative rules live in
[`AGENTS.md`](../AGENTS.md) (Hard rules + Content density) and live sandbox
demos. This file keeps paste instructions, the core-first loop, and a **stable
slug index** for bookmarks / consumer-rule cross-links.

Install contract: [`CONSUME.md`](CONSUME.md). Publish:
[`docs/package-propagation.md`](../docs/package-propagation.md).

## How to paste (any consumer)

1. Create `.cursor/rules/fynns-ui-consumer.mdc` in the **consumer** root
   (or merge into an existing always-apply rule).
2. Paste the full contents of
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
3. Optional: one line in the consumer `AGENTS.md` / README:

   > UI: follow `.cursor/rules/fynns-ui-consumer.mdc` and
   > `node_modules/@fynn7/ui-design-core/llm/CONSUME.md` (or the core checkout).

The consume installer may also drop this rule when wiring a consumer
(`scripts/install-as-npm.mjs`); if the file already exists it is left alone
unless you re-copy by hand. **Re-paste after treaty / pasteable-rule updates.**
Local install gate: `consume --check` — see [`CONSUME.md`](CONSUME.md).

## Core-first loop (when a consumer screen is wrong)

Same task — **all three**, not pick-one:

1. **Core constraint** — token / primitive / CSS in `fynns_ui_design_core`.
2. **Sandbox demo** — update Globals / Preview / Layout sample that teaches the
   fix; browser-verify in sandbox.
3. **Consumer** — dispatch a subagent into the consumer checkout: bump core,
   props-only fix, browser-verify on the reported screen.

Authority: `/constrain-then-consumer` →
[`.cursor/skills/constrain-then-consumer/SKILL.md`](../.cursor/skills/constrain-then-consumer/SKILL.md).
Never consumer-only; never core-only without a living sandbox sample.

## Failure mode index

Slug text matches former `## Failure mode …` headings (bookmark-stable).
Details → **docs/DESIGN_SYSTEM.md Hard rules** (or the DESIGN_SYSTEM / topic column) + sandbox
`#anchor`. Do **not** reintroduce long essays here.

| slug | where | sandbox |
| --- | --- | --- |
| zero-token sibling consume (no NODE_AUTH_TOKEN) | CONSUME.md | `—` |
| leftover Packages `.npmrc` auth → E401 on clone | CONSUME.md | `—` |
| sandbox-only aesthetics | DESIGN_SYSTEM Hard rules / check:wysiwyg | `—` |
| squashed drawer | DESIGN_SYSTEM hard-rules | `#layouts-demo-drill-in` |
| drill-in / mode sidebar hard-swap (no navKey morph) | DESIGN_SYSTEM hard-rules | `#layouts-demo-drill-in` |
| drill-in Back Shared Axis ghost (out layer / double Y rail) | DESIGN_SYSTEM hard-rules (≥ **0.5.198**; prepare-frame flash ≥ **0.5.201**–**0.5.203**) | `#layouts-demo-drill-in` |
| icon-only rail densify (narrow) | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-rail` |
| stacked drawer ribbon (narrow) | DESIGN_SYSTEM hard-rules | `—` |
| drawer headline toolbar | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| drawer sheet headline under TopAppBar | DESIGN_SYSTEM hard-rules | `#layouts-demo-drill-in` |
| main-canvas list\|detail split (hub-split) | DESIGN_SYSTEM hard-rules | `#layouts-demo-drill-in` |
| Card title count glued (OpenSpec8) | DESIGN_SYSTEM Card / Collapsible | `#card` |
| padded destination labels | DESIGN_SYSTEM hard-rules | `—` |
| crushed command / menu chrome proportion | DESIGN_SYSTEM Hard rules | `#command-palette` |
| wrong shell slot / “Clipped” misread | DESIGN_SYSTEM hard-rules | `—` |
| settings gear in TopAppBar / destination list | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| footer settings gear md disk / asymmetric inset | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| drawer footer Avatar/settings packed tight | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| drawer footer Avatar↔label packed tight | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| drawer footer middle still packed (flex-grow) | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| drawer footer Avatar/gear flush to sheet edge | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| short account label always fades | DESIGN_SYSTEM Hard rules | `#layouts-demo-shell` |
| NavDrawer footer Avatar initials ignore visible label | DESIGN_SYSTEM Hard rules | `#layouts-demo-shell` / `#avatar` |
| feature panels parked in Settings | DESIGN_SYSTEM Hard rules | `#layouts-demo-shell` |
| NavigationDrawer Search↔Item vacant band | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| NavigationDrawer Card Collapsible stack kissed | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| NavigationDrawerItem badge IconButton always visible | DESIGN_SYSTEM Hard rules | `#layouts-demo-navigation-drawer` |
| NavigationDrawerItem always-visible trash / no more-menu | DESIGN_SYSTEM Hard rules | `#layouts-demo-navigation-drawer` |
| mode drawer toolbar trash+new twin | DESIGN_SYSTEM Hard rules / NavigationDrawerNewChat ≥ 0.5.256 | `#sandbox-navdrawer-session-chrome` |
| chat product / session host wrong tree | DESIGN_SYSTEM Content density / Chat product | `#layouts-demo-chat-product` |
| chat aside host wrong tree | DESIGN_SYSTEM Content density / Chat aside | `#layouts-demo-chat-aside` |
| FieldHeader inline InfoHint kissed | DESIGN_SYSTEM forms / FieldStack | `#info-hint` / `#form-recipe` |
| env key FieldHint under input (hint split) | DESIGN_SYSTEM forms / FieldStack | `#env-check` / `#password` |
| env key status Chip (information redundancy) | DESIGN_SYSTEM forms / FieldStack | `#env-check` / `#password` |
| Input trailing md IconButton in field shell | DESIGN_SYSTEM hard-rules | `#field-header` |
| Input trailing affix far from shell edge | DESIGN_SYSTEM hard-rules | `#password` / `#input` |
| mode drawer tools↔filter crushed to 4dp | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| ad-hoc Surface / inspector row chaos | DESIGN_SYSTEM Card / Collapsible | `#info-hint` |
| diagnostic prose wall (probe / connection) | DESIGN_SYSTEM Hard rules | `#rhythm` |
| settings Card FieldHint wall (hint compression) | DESIGN_SYSTEM Card / Collapsible | `#field-header` |
| language control in TopAppBar | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| Select language pill in TopAppBar | DESIGN_SYSTEM hard-rules | `—` |
| catalog ControlRow actions float mid-left | DESIGN_SYSTEM content-density / List | `#rhythm` |
| ControlRow unsolicited item count | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-rhythm-catalog` / `#rhythm` |
| provider Manage flat dump | DESIGN_SYSTEM Hard rules / Content density | `#provider-settings` |
| org · dates glued in supportingText | DESIGN_SYSTEM Language / Hard rules | `#list` |
| List rail / ChatActivity as timeline | DESIGN_SYSTEM catalog / llm/CHAT_* | `#timeline` |
| lettered timeline A/B/C / list-detail | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline node/chevron kissing copy | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline flat vs detail headline stagger | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline hover pill kissing the node | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline hover pill flush text (zero inner pad) | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline disc not centered on copy | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| Timeline row hover edit/delete icons | DESIGN_SYSTEM Timeline / timeline-catalog | `#timeline` |
| UI · — punctuation in chrome | DESIGN_SYSTEM Language / Hard rules | `#list` / `#card` |
| Card title · meta glued | DESIGN_SYSTEM Language / Hard rules | `#card` |
| trailingSupportingText right-hug drift | DESIGN_SYSTEM hard-rules | `#list` |
| inspector Select open yanks trailing | DESIGN_SYSTEM / DESIGN_SYSTEM Hard rules | `#sandbox-list-inspector-trailing` |
| Card head Select open yanks title band | DESIGN_SYSTEM / DESIGN_SYSTEM Hard rules | `#sandbox-card-head-select` |
| trailing meta end-ink (staggered date starts) | DESIGN_SYSTEM hard-rules | `#timeline` |
| status meta far from --with-end action | DESIGN_SYSTEM Hard rules | `#list` |
| loose IconButton pair in control-cluster | DESIGN_SYSTEM form-rhythm | `#list` |
| status kisses first List IconButton | DESIGN_SYSTEM content-density / List | `#sandbox-list-status-action` |
| List trailingSupportingText underlaps --with-end IconButtons | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-recipe-catalog` / `#sandbox-list-status-action` |
| ListItem Tab focus ring cracked by --with-end overlay | DESIGN_SYSTEM Hard rules / List | `#sandbox-list-recipe-catalog` / `#sandbox-list-status-action` |
| fat Surface / Card per catalog row | DESIGN_SYSTEM content-density / List | `#list` / `#page-scroll` |
| recipe catalog fat Card FieldHint essays / ChipSet tag soup | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-recipe-catalog` / `#list` |
| ListItem trailing IconButtons stacked vertically | DESIGN_SYSTEM hard-rules | `#list` |
| page-scroll host flush with Card | DESIGN_SYSTEM Card / Collapsible | `#page-scroll` |
| PageScroll mid-scroll hard clip (no edge fade) | DESIGN_SYSTEM Hard rules / Scrollbar | `#page-scroll` |
| FillColumn header mid-scroll hard clip (no edge fade) | DESIGN_SYSTEM Hard rules / Scrollbar | `#sandbox-fill-column-guide` |
| Textarea / bordered scroll-edge fade erases stroke | DESIGN_SYSTEM philosophy / Scrollbar (≥ **0.5.282**) | `#textarea` |
| PageScroll Card sheet-max-width under ControlRow | DESIGN_SYSTEM Hard rules / Card | `#page-scroll` |
| PageScroll form Card chat-max-width column | DESIGN_SYSTEM Hard rules / Card | `#page-scroll` |
| PageScroll content-column soft reading-width gutters | DESIGN_SYSTEM Hard rules / Card | `#page-scroll` |
| FullscreenDialog settings column sheet-max / content-sized | DESIGN_SYSTEM Hard rules / overlays | `#overlays` |
| catalog ControlRow sinks below drawer labels | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| BusyRegion cold body + pager chrome siblings | DESIGN_SYSTEM hard-rules | `#busy-region` |
| empty ControlRow label as action footer | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| orphan recovery CTA left-aligned | DESIGN_SYSTEM Hard rules | `#sandbox-inline-alert-recovery` |
| Banner icon/dismiss top-pinned vs multi-line | DESIGN_SYSTEM Hard rules / Content density | `#banner` |
| Banner dismiss as sibling IconButton outside strip | DESIGN_SYSTEM Hard rules / Content density | `#banner` |
| Dialog foot Delete leftmost of Cancel | DESIGN_SYSTEM Dialog / overlays | `#timeline` |
| Dialog exit clears title/body (flash) | DESIGN_SYSTEM Hard rules / overlays | `#sandbox-list-recipe-catalog` |
| twin Button loading rings in one control-cluster | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| Card batch CTA + ListItem row twin loading rings | DESIGN_SYSTEM Hard rules / Loading placement | `#sandbox-list-repo-path-actions` |
| BusyRegion + chrome loading stack | DESIGN_SYSTEM hard-rules | `#busy-region` |
| runBusyTask hang forever (no timeout/signal) | DESIGN_SYSTEM paint-before-work | `#sandbox-busy-task-timeout` / `#busy-paint` |
| overlapping runBusyTask clears busy early | DESIGN_SYSTEM paint-before-work | `#sandbox-busy-task-generation` |
| Button loading hung without runLoadingTask | DESIGN_SYSTEM Loading placement | `#sandbox-button-loading-task` |
| ConfirmDialog blockCloseWhileLoading trap | DESIGN_SYSTEM Dialog / ConfirmDialog | `#sandbox-confirm-loading-trap` |
| ChatComposer busy without onStop | DESIGN_SYSTEM catalog | `#sandbox-chat-busy-no-stop` |
| Chat streaming/busy never cleared after stop/error | DESIGN_SYSTEM catalog / Loading placement | `#chat` / `#sandbox-chat-busy-no-stop` |
| BusyRegion / BusyScrim stuck busy (no timeout / no error exit) | DESIGN_SYSTEM hard-rules | `#sandbox-pane-load-error` / `#sandbox-busy-task-timeout` |
| opaque error without stable code | DESIGN_SYSTEM Error surface pick | `#sandbox-inline-alert-recovery` / `#sandbox-pane-load-error` |
| Empty data shown as BusyRegion | DESIGN_SYSTEM hard-rules | `#busy-region` |
| pane cold-start hang without error surface | DESIGN_SYSTEM hard-rules | `#sandbox-pane-load-error` |
| snackbar used as AppError / ErrorCode bus | DESIGN_SYSTEM feedback (boundary) | `#snackbar` |
| tight labeled Button gaps in end-align footers | DESIGN_SYSTEM form-rhythm | `#timeline` |
| private labeled Button cluster gap | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| labeled Button cluster gap stacked to 12dp | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| service control status Chip + label (information redundancy) | DESIGN_SYSTEM forms / FieldStack | `#rhythm` |
| CLI/tool probe: name label + status Chip + FieldHint essay (information redundancy) | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` |
| ControlRow / control-cluster Buttons left-packed under label | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` end-align |
| ControlRow label crushed to 2px / hairline sliver | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` end-align |
| path meta paints over ControlRow label | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` end-align |
| outcome Chip as status (suggestion/assist / StatusChip fake Badge) | DESIGN_SYSTEM Hard rules / Content density | `#list` |
| List path catalog Switch+Chip+danger disk soup | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-repo-path-actions` / `#list` |
| List scroll-well trailing meta kisses overlay rail | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-repo-path-actions` |
| List scroll-well overflow-y spill overlaps siblings | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-repo-path-actions` |
| ControlStack probe meta end-hug / kind mix (Available+Backend; path/chips/hint cluster) | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` |
| FieldHint restates ToggleGroup / Tabs labels (information redundancy) | DESIGN_SYSTEM Hard rules / Content density | `#rhythm` |
| section FieldHint restates TopAppBar InfoHint | DESIGN_SYSTEM Hard rules / Content density | `#layouts-demo-shell` |
| Dialog description how-to essay (information redundancy) | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.284**) | `#overlays` |
| ListItem overline restates trailing status | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-list-repo-path-actions` |
| ControlRow IconButton crushed to ellipse | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| end-align IconButton strip crushed | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| Pagination crushed or stacked off-spec | DESIGN_SYSTEM form-rhythm | `#pagination` |
| Pagination bar wraps to two rows | DESIGN_SYSTEM form-rhythm | `—` |
| Pagination Select invents absolute overlay | DESIGN_SYSTEM Hard rules / Content density | `#pagination` / `#select` |
| Select stretched without fullWidth | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.244**) | `#select` / `#sandbox-select-wide-short` / `#form-recipe` |
| Select menu narrower than stretched trigger | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-select-wide-short` / `#select` |
| Select menu wider than narrow trigger | DESIGN_SYSTEM Hard rules / Content density | `#select` (`.sandbox-select-narrow-host`) |
| truncated option lacks ellipsis Tooltip | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.240** menus/fields) | `#select` / `#autocomplete` / `#search-bar` / `#sandbox-menu-field-match` |
| truncated chrome / list / snack label lacks ellipsis Tooltip | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.243**) | `#card` / `#list` / `#select` / `#layouts-demo-shell` / `#toggle-group` / `#activity` / `#rhythm` end-align |
| DropdownMenu wider than FieldBlock trigger | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.239**) | `#sandbox-menu-field-match` / `#menu` |
| FieldBlock Menu tip-wrap shrinks trigger | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.290**) | `#sandbox-menu-field-match` / `#menu` |
| labeled DropdownMenu missing chevron | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.253**) | `#menu` / `#sandbox-menu-field-match` |
| DropdownMenu missing nested submenu | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.288**) | `#sandbox-menu-submenu` / `#menu` |
| DropdownMenu panel left-shifted vs trigger | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.254**) | `#sandbox-menu-field-match` / `#menu` |
| Menu chevron optically high | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.254**) | `#menu` / `#sandbox-menu-field-match` |
| Menu trigger clips descenders | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.255**) | `#sandbox-menu-field-match` / `#menu` |
| ChatComposer leading Menu label hard-clips | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.288**) | `#sandbox-chat-composer-leading-menus` / `#chat` |
| ChatComposer model Menu left-clustered | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.288**) | `#sandbox-chat-composer-leading-menus` / `#chat` |
| ChatComposer narrow host crushes draft | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.288**) | `#sandbox-chat-composer-leading-menus-narrow` / `#chat` |
| ChatComposer endActions model crushed by toggles | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.291**) | `#sandbox-chat-composer-thinking-toggle` / `#chat` |
| ChatComposer mode toggle buried in + Menu | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.289**) | `#sandbox-chat-composer-thinking-toggle` / `#chat` |
| ChatComposer model Menu flat without source sections | DESIGN_SYSTEM Hard rules / CHAT_COMPOSER_LAYOUT (≥ **0.5.290**) | `#sandbox-chat-composer-model-sections` / `#sandbox-chat-composer-model-empty` / `#chat` |
| Menu trigger leading icon misaligned | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.258**) | `#sandbox-menu-leading-icon` / `#menu` |
| Select supporting copy kisses trigger | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-select-wide-short` |
| Card teaching help kisses shell | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-card-draft-actions` / `#sandbox-card-chrome-icon-actions` / `#sandbox-card-head-primary-end` |
| table-meta overflows without ellipsis | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-card-table-meta-ellipsis` |
| Pagination Select siblings center on expanded height | DESIGN_SYSTEM Hard rules / Content density | `#pagination` |
| Pagination bar gaps crushed to 4dp | DESIGN_SYSTEM Hard rules / Content density | `#pagination` |
| Pagination Select option repeats noun | DESIGN_SYSTEM Hard rules / Content density | `#pagination` |
| consumer restyles keep-set chrome radius | DESIGN_SYSTEM Hard rules / Consumer apps | `#select` / `#menu` |
| Select Autocomplete deprecated prefer Menu SearchBar | DESIGN_SYSTEM Hard rules / Consumer apps | `#select` / `#autocomplete` / `#menu` / `#search-bar` |
| KPI stat grid stacks full-width (undefined layout token) | DESIGN_SYSTEM Hard rules | `—` |
| DropdownMenu bare btn in IconButton strip | DESIGN_SYSTEM form-rhythm | `#menu` |
| sparse dashboard shortcut List | DESIGN_SYSTEM content-density / List | `#list` |
| ListItem zero-gap pill fuse | DESIGN_SYSTEM content-density / List | `#list` |
| Divider between contained ListItems | DESIGN_SYSTEM content-density / List | `#list` |
| Drawer tip-fill stretches IconButton toolbars | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer sort+new cluster start-packed | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| bulk toolbar wrong glyphs | DESIGN_SYSTEM Hard rules | `#icons` |
| bulk select teal wall (checked → active) | DESIGN_SYSTEM forms / FieldStack | `#layouts-demo-navigation-drawer` |
| expandable List `--with-end` trailing mid-gap | DESIGN_SYSTEM hard-rules | `#list` |
| expandable parent row kisses nested member | DESIGN_SYSTEM Hard rules | `#list` |
| expandable group count kisses `--with-end` icons | DESIGN_SYSTEM Hard rules | `#list` |
| twin section InfoHint (TopAppBar + mode drawer) | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| bulk select uses ClipboardIcon | DESIGN_SYSTEM forms / FieldStack | `#layouts-demo-navigation-drawer` |
| mode drawer primary New not rightmost | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer hide-builtin ControlBlock stack | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer toolbar Plus ≠ Switch end | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer Plus ≠ Item pill end | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer toolbar-end IconButton md | DESIGN_SYSTEM hard-rules | `#layouts-demo-navigation-drawer` |
| mode drawer InlineAlert essay | DESIGN_SYSTEM Hard rules / Content density | `#sandbox-navdrawer-mode-catalog-fail` / `#layouts-demo-navigation-drawer` |
| mode drawer preference ControlRow flush on pad-inline | DESIGN_SYSTEM content-density / shells | `#layouts-demo-navigation-drawer` |
| SyncSideFilter tooltip covers chrome or list | DESIGN_SYSTEM content-density / List | `—` |
| SyncSideFilter / ToggleGroup segment wash bleed | DESIGN_SYSTEM Hard rules | `#toggle-group` |
| SyncSideFilter long labels crush / flush pad | DESIGN_SYSTEM content-density / shells | `#layouts-demo-navigation-drawer` / `#toggle-group` |
| CodeBlock editable selection stripes | DESIGN_SYSTEM catalog | `#code-block` |
| Collapsible inside List (skeleton crush) | DESIGN_SYSTEM content-density / List | `#list` |
| nested short List well + invented list-well token | DESIGN_SYSTEM content-density / List | `#list` |
| tiny InfoHint in TopAppBar / toolbar chrome | DESIGN_SYSTEM forms / FieldStack | `—` |
| Surface + FieldHeader as titled table shell | DESIGN_SYSTEM Card / Collapsible | `#table` |
| wide Table wheel scrolls PageScroll (no wheel→X) | DESIGN_SYSTEM Scrollbar / Content density | `#table` |
| long Table dumps all rows | DESIGN_SYSTEM Hard rules / Content density | `#table` |
| long List dumps all rows | DESIGN_SYSTEM Hard rules / Content density | `#list` |
| List tree wrapped in divs / buttons in leading | DESIGN_SYSTEM content-density / List | `#list` |
| ListItem kind via wrapping div / start rail | DESIGN_SYSTEM hard-rules | `#list` |
| builtin ListItem looks like a square / chip island | DESIGN_SYSTEM content-density / List | `#list` |
| List icon↔copy / three-line stack crushed | DESIGN_SYSTEM content-density / List | `#list` |
| duration meta glued (`1m47s`) | DESIGN_SYSTEM Hard rules | `#list` |
| List trailing stats drift across rows | DESIGN_SYSTEM hard-rules | `#list` |
| Card head actions wrap into a tall stack | DESIGN_SYSTEM Card / Collapsible | `#card` |
| orphan draft save/discard outside Card | DESIGN_SYSTEM Card / Collapsible | `#sandbox-card-draft-actions` |
| Card head actions clip at the end edge | DESIGN_SYSTEM Card / Collapsible | `#card` |
| path / branch text in Card `actions` | DESIGN_SYSTEM Card / Collapsible | `#card` |
| stacked InfoHints / essay tips in Card head | DESIGN_SYSTEM Card / Collapsible | `#card` |
| mixed IconButton / InfoHint hover sizes | DESIGN_SYSTEM forms / FieldStack | `#card` |
| mode drawer sm + Card head md | DESIGN_SYSTEM hard-rules | `#card` |
| form ControlRow label vs FieldHeader title | DESIGN_SYSTEM forms / FieldStack | `#field-header` |
| status icon soup in a control-cluster | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| ListItem leading column / ellipsis / trailing island | DESIGN_SYSTEM hard-rules | `#list` |
| List --with-end ellipsis kisses action disk | DESIGN_SYSTEM content-density / List | `#list` |
| List trailing Select + labeled Button overlap | DESIGN_SYSTEM hard-rules | `#globals-demo-select` |
| Card head Select centers on expanded panel | DESIGN_SYSTEM Card / Collapsible | `#sandbox-card-head-select` |
| Card head Select↔Button 4dp kiss | DESIGN_SYSTEM Card / Collapsible | `#sandbox-card-head-select` |
| List row copy cramped on the start edge | DESIGN_SYSTEM content-density / List | `#list` |
| Chip as table-cell status / mapping kind | DESIGN_SYSTEM Hard rules | `#table` |
| Select refresh crammed beside chevron | DESIGN_SYSTEM forms / FieldStack | `#field-header` |
| Select row-action IconButton drifts when open | DESIGN_SYSTEM forms / FieldStack | `#field-header` |
| FieldStack Grid vertically centers short FieldBlock beside expanded Select | DESIGN_SYSTEM FieldStack / Grid | `#sandbox-field-stack-grid-select` |
| FieldStack Grid hugs max-content leaving dead gutter in form Surface | DESIGN_SYSTEM FieldStack / Grid | `#sandbox-field-stack-grid-select` |
| Card chrome labeled ghost Copy/Save instead of IconButton+Tooltip | DESIGN_SYSTEM Card / Hard rules | `#sandbox-card-chrome-icon-actions` |
| FieldBlock labeled Save key instead of IconButton+Tooltip | DESIGN_SYSTEM Hard rules | `#provider-settings` |
| FieldBlock Save IconButton wraps under Input | DESIGN_SYSTEM Hard rules | `#provider-settings` |
| revived `#field-header` Manage mega-Card / OK·Fail wall | DESIGN_SYSTEM Hard rules | `#field-header` / `#provider-settings` |
| `#rhythm` morph + cover-letter twin section strips | DESIGN_SYSTEM Hard rules | `#sandbox-rhythm-catalog` |
| Card head primary IconButton leftmost in control-cluster | DESIGN_SYSTEM Card / Hard rules | `#sandbox-card-head-primary-end` |
| repeatable Textarea remove wraps below row | DESIGN_SYSTEM catalog | `#form-recipe` |
| Dialog body Card stack crush | DESIGN_SYSTEM Dialog / overlays | `#form-recipe` |
| phantom PageScroll rail behind modal Dialog | DESIGN_SYSTEM hard-rules | `#form-recipe` |
| overlay scrollbar paints through chrome heads | DESIGN_SYSTEM Hard rules | `#drawer-nested-scroll` |
| overlay scrollbar paints above Select/Menu flyout | DESIGN_SYSTEM Scrollbar discipline | `#sandbox-scroll-menu-stack` |
| Menu/Select flyout scroll thumb buried under panel | DESIGN_SYSTEM Scrollbar discipline | `#sandbox-scroll-menu-stack` |
| modal Dialog scrollbar flash on enter | DESIGN_SYSTEM Dialog / overlays | `#timeline` |
| table row action not sharing one trailing edge | DESIGN_SYSTEM hard-rules | `#table` |
| table map cluster top-hugged in a tall cell | DESIGN_SYSTEM Hard rules | `#table` |
| chart tooltip locked to series-value Y | DESIGN_SYSTEM chart recipe | `#chart` |
| chart tooltip loose unit-stack spacing | DESIGN_SYSTEM chart recipe | `#chart` |
| chart tooltip clipped at plot edge | DESIGN_SYSTEM hard-rules | `#chart` |
| chart tooltip edge clamp jitter | DESIGN_SYSTEM chart recipe | `—` |
| catalog morph remounts ClippedNavShell (drawer bounce) | DESIGN_SYSTEM hard-rules | `—` |
| InlineAlert + orphan List for one catalog | DESIGN_SYSTEM content-density / List | `—` |
| InlineAlert beside List in ControlStack | DESIGN_SYSTEM content-density / List | `#env-check` |
| List / FieldHeader nested inside InlineAlert | DESIGN_SYSTEM content-density / List | `—` |
| CodeBlock copy covering the last glyphs | DESIGN_SYSTEM catalog | `#code-block` |
| plain CodeBlock despite a filetype label | DESIGN_SYSTEM catalog | `—` |
| Textarea for a suffixed file body | DESIGN_SYSTEM catalog | `#code-block` |
| catalog edit as silent PageScroll replace | DESIGN_SYSTEM content-density / List | `#layouts-demo-drill-in` |
| fixed-height CodeBlock / Textarea on page scroll | DESIGN_SYSTEM catalog | `#code-block` |
| Textarea autoGrow soft-capped like ChatComposer (13rem) | DESIGN_SYSTEM catalog / llm/CHAT_* | `#textarea` |
| skinny form Dialog (tall FieldStack / CodeBlock) | DESIGN_SYSTEM catalog | `#form-recipe` |
| Dialog body end-align footer clipped | DESIGN_SYSTEM hard-rules | `#form-recipe` |
| Dialog title top ≠ body-end IconButton | DESIGN_SYSTEM hard-rules / Dialog | `#overlays` |
| Dialog title top ≠ body-end foot | DESIGN_SYSTEM Hard rules / overlays (≥ **0.5.286**) | `#overlays` |
| Dialog foot IconButton / check-disk | DESIGN_SYSTEM Hard rules / Content density (≥ **0.5.286**) | `#overlays` |
| BottomSheet title top ≠ actions bottom | DESIGN_SYSTEM hard-rules / overlays | `#overlays` |
| FillColumn header top-only inset | DESIGN_SYSTEM hard-rules / FillColumn | `#sandbox-fill-column-guide` |
| vacant band under FullscreenDialog title | DESIGN_SYSTEM Dialog / overlays | `#fullscreen-flush` |
| BusyRegion colored loading wash (consumer surface-*) | DESIGN_SYSTEM hard-rules | `#busy-region` |
| BusyRegion empty cold-start mask island (贴图色块) | DESIGN_SYSTEM hard-rules | `#sandbox-busy-region-empty-no-mask` |
| BusyRegion busy copy bleeds through overlay | DESIGN_SYSTEM hard-rules | `#sandbox-busy-region-field-sample` |
| bare CircularProgress as body loader | DESIGN_SYSTEM hard-rules | `#busy-region` |
| BusyRegion empty cold-start overlaps SearchBar | DESIGN_SYSTEM hard-rules | `#busy-region` |
| BusyRegion linear overflows NavigationDrawer | DESIGN_SYSTEM hard-rules | `#busy-region` |
| stacked progress chromes in BusyRegion | DESIGN_SYSTEM hard-rules | `#busy-region` |
| LinearProgress end-stop / “dotted” bar | DESIGN_SYSTEM hard-rules | `#progress` |
| private hub progress shell for section loads | DESIGN_SYSTEM hard-rules | `#busy-region` |
| BusyRegion fill nested in unit-stack / Card | DESIGN_SYSTEM hard-rules | `#busy-region` |
| BusyRegion fill BusyStack top overflow in PageScroll | DESIGN_SYSTEM hard-rules | `#sandbox-busy-region-page-scroll-fill` |
| section FieldHint + pane cold-start BusyRegion in one well | DESIGN_SYSTEM hard-rules | `#busy-region` |
| EmptyState parks top-left in destination canvas | DESIGN_SYSTEM hard-rules | `#empty-state` |
| master–detail / content max-width token missing | DESIGN_SYSTEM Hard rules | `#layouts-demo-drill-in` |
| canvas FillColumn megacard zero inset | DESIGN_SYSTEM hard-rules | `#layouts-demo-fill-column` |
| FillColumn guide Surface flush to Chat | DESIGN_SYSTEM hard-rules / Content density | `#layouts-demo-fill-column` / `#sandbox-fill-column-guide` |
| IconButton loading spinner + glyph overlap | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| IconButton busy swaps CircularProgress instead of loading | DESIGN_SYSTEM Hard rules / Busy | `#icon-button` / `#sandbox-iconbutton-primary-loading` |
| bare ControlRow + FieldHint zero gap (PageScroll section) | DESIGN_SYSTEM forms / FieldStack | `#rhythm` |
| ControlRow primary leftmost in mixed cluster | DESIGN_SYSTEM form-rhythm | `—` |
| section-body IconButton sm | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| section-body labeled generate Button | DESIGN_SYSTEM form-rhythm | `#rhythm` |
| CodeBlock autoGrow stuck in hidden tab | DESIGN_SYSTEM catalog | `#code-block` |
| PageScroll multi-field brief Collapsible (≥3 FieldBlocks) | DESIGN_SYSTEM hard-rules / Form | `#table` / `#form-recipe` |
| revived `#form-recipe-page-scroll` questionnaire stack | DESIGN_SYSTEM hard-rules / Form | `#table` / `#form-recipe` |
| literal backticks in Chat bubbles | DESIGN_SYSTEM catalog / llm/CHAT_* | `—` |
| ChatComposer field↔Send tighter than glyph↔field | DESIGN_SYSTEM catalog / llm/CHAT_* | `#chat` |
| empty-thread Chip / revived ChatStarterPrompts | DESIGN_SYSTEM catalog / Content density | `#chat` |
| empty-thread starter ≠ composer-shell edges | DESIGN_SYSTEM catalog / Content density | `#chat` |
| empty-thread starter rotate no slide | DESIGN_SYSTEM catalog / Content density | `#chat` |
| Surface padded uneven / rem inset | DESIGN_SYSTEM catalog / Content density | `#surface` / `#chat` |
| List run history stacked vertically | DESIGN_SYSTEM content-density / List | `#list` |
| jammed headline list meta (overflow clip) | DESIGN_SYSTEM content-density / List | `#list` |
| EndAside instant open / close (no width morph) | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside toggle workspace BusyRegion flash | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| ControlRow labeled Button cluster overflow (Card / EndAside) | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside PageScroll no scroll | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside PageScroll Card flush to pane bottom | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside dense labeled Button strip (information redundancy) | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside ControlRow label crush | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| EndAside icon tonal disks | DESIGN_SYSTEM hard-rules | `#layouts-demo-shell` |
| Export menu uses DownloadIcon | DESIGN_SYSTEM Hard rules | `#split-button` |

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json) | Install + greenfield skeleton |
| [`consumer-AGENTS.md`](consumer-AGENTS.md) | Consumer `AGENTS.md` template (OpenCode / local models) |
| [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) | Pasteable always-on consumer rule |
| [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) | Hard rules / density SoT index |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | **Full documentation catalog** (+ CodeBlock highlight + `api.mjs`) |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`LOCAL_LLM.md`](LOCAL_LLM.md) | LM Studio + OpenCode local-model budgets |
