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
Details → **AGENTS.md Hard rules** (or the AGENTS / topic column) + sandbox
`#anchor`. Do **not** reintroduce long essays here.

| slug | where | sandbox |
| --- | --- | --- |
| GitHub Packages install auth (E401 / empty NODE_AUTH_TOKEN) | CONSUME.md | `—` |
| sandbox-only aesthetics | AGENTS Hard rules / check:wysiwyg | `—` |
| squashed drawer | AGENTS shells / Hard rules | `#layouts-demo-drill-in` |
| icon-only rail densify (narrow) | AGENTS shells / Hard rules | `#layouts-demo-navigation-rail` |
| stacked drawer ribbon (narrow) | AGENTS shells / Hard rules | `—` |
| drawer headline toolbar | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| drawer sheet headline under TopAppBar | AGENTS shells / Hard rules | `#layouts-demo-drill-in` |
| main-canvas list\|detail split (hub-split) | AGENTS shells / Hard rules | `#layouts-demo-drill-in` |
| Card title count glued (OpenSpec8) | AGENTS Card / Collapsible | `#card` |
| padded destination labels | AGENTS shells / Hard rules | `—` |
| crushed command / menu chrome proportion | AGENTS Hard rules | `#command-palette` |
| wrong shell slot / “Clipped” misread | AGENTS shells / Hard rules | `—` |
| settings gear in TopAppBar / destination list | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| footer settings gear md disk / asymmetric inset | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| drawer footer Avatar/settings packed tight | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| drawer footer Avatar↔label packed tight | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| drawer footer middle still packed (flex-grow) | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| drawer footer Avatar/gear flush to sheet edge | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| short account label always fades | AGENTS Hard rules | `#layouts-demo-shell` |
| feature panels parked in Settings | AGENTS Hard rules | `#layouts-demo-shell` |
| NavigationDrawer Search↔Item vacant band | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| NavigationDrawer Card Collapsible stack kissed | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| FieldHeader inline InfoHint kissed | AGENTS forms / FieldStack | `#sandbox-field-header-inline-infohint` |
| env key FieldHint under input (hint split) | AGENTS forms / FieldStack | `#sandbox-field-header-env-keys` |
| env key status Chip (information redundancy) | AGENTS forms / FieldStack | `#sandbox-field-header-env-keys` |
| Input trailing md IconButton in field shell | AGENTS shells / Hard rules | `#field-header` |
| mode drawer tools↔filter crushed to 4dp | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| ad-hoc Surface / inspector row chaos | AGENTS Card / Collapsible | `#info-hint` |
| diagnostic prose wall (probe / connection) | AGENTS Hard rules | `#rhythm` |
| settings Card FieldHint wall (hint compression) | AGENTS Card / Collapsible | `#field-header` |
| language control in TopAppBar | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| Select language pill in TopAppBar | AGENTS shells / Hard rules | `—` |
| catalog ControlRow actions float mid-left | AGENTS Content density / List | `#rhythm` |
| org · dates glued in supportingText | AGENTS Language / Hard rules | `#list` |
| List rail / ChatActivity as timeline | AGENTS Chat / llm/CHAT_* | `#timeline` |
| lettered timeline A/B/C / list-detail | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline node/chevron kissing copy | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline flat vs detail headline stagger | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline hover pill kissing the node | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline hover pill flush text (zero inner pad) | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline disc not centered on copy | AGENTS Timeline / timeline-catalog | `#timeline` |
| Timeline row hover edit/delete icons | AGENTS Timeline / timeline-catalog | `#timeline` |
| UI · — punctuation in chrome | AGENTS Language / Hard rules | `#list` |
| trailingSupportingText right-hug drift | AGENTS shells / Hard rules | `#list` |
| trailing meta end-ink (staggered date starts) | AGENTS shells / Hard rules | `#timeline` |
| status meta far from --with-end action | AGENTS Hard rules | `#list` |
| loose IconButton pair in control-cluster | AGENTS Toolbar / unit rhythm | `#list` |
| status kisses first List IconButton | AGENTS Content density / List | `#sandbox-list-status-action` |
| fat Surface / Card per catalog row | AGENTS Content density / List | `—` |
| ListItem trailing IconButtons stacked vertically | AGENTS shells / Hard rules | `#list` |
| page-scroll host flush with Card | AGENTS Card / Collapsible | `#page-scroll` |
| catalog ControlRow sinks below drawer labels | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| BusyRegion cold body + pager chrome siblings | AGENTS Busy/Loading | `#busy-region` |
| empty ControlRow label as action footer | AGENTS Toolbar / unit rhythm | `#rhythm` |
| orphan recovery CTA left-aligned | AGENTS Hard rules | `#sandbox-inline-alert-recovery` |
| Banner icon/dismiss top-pinned vs multi-line | AGENTS Hard rules / Content density | `#banner` |
| Banner dismiss as sibling IconButton outside strip | AGENTS Hard rules / Content density | `#banner` |
| Dialog foot Delete leftmost of Cancel | AGENTS Dialog / overlays | `#timeline` |
| twin Button loading rings in one control-cluster | AGENTS Toolbar / unit rhythm | `#rhythm` |
| BusyRegion + chrome loading stack | AGENTS Busy/Loading | `#busy-region` |
| tight labeled Button gaps in end-align footers | AGENTS Toolbar / unit rhythm | `#timeline` |
| private labeled Button cluster gap | AGENTS Toolbar / unit rhythm | `#rhythm` |
| labeled Button cluster gap stacked to 12dp | AGENTS Toolbar / unit rhythm | `#rhythm` |
| service control status Chip + label (information redundancy) | AGENTS forms / FieldStack | `#rhythm` |
| ControlRow IconButton crushed to ellipse | AGENTS Toolbar / unit rhythm | `#rhythm` |
| end-align IconButton strip crushed | AGENTS Toolbar / unit rhythm | `#rhythm` |
| Pagination crushed or stacked off-spec | AGENTS Toolbar / unit rhythm | `#pagination` |
| Pagination bar wraps to two rows | AGENTS Toolbar / unit rhythm | `—` |
| KPI stat grid stacks full-width (undefined layout token) | AGENTS Hard rules | `—` |
| DropdownMenu bare btn in IconButton strip | AGENTS Toolbar / unit rhythm | `#menu` |
| sparse dashboard shortcut List | AGENTS Content density / List | `#list` |
| ListItem zero-gap pill fuse | AGENTS Content density / List | `#list` |
| Divider between contained ListItems | AGENTS Content density / List | `#list` |
| Drawer tip-fill stretches IconButton toolbars | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| mode drawer sort+new cluster start-packed | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| bulk toolbar wrong glyphs | AGENTS Hard rules | `#icons` |
| bulk select teal wall (checked → active) | AGENTS forms / FieldStack | `#layouts-demo-navigation-drawer` |
| expandable List `--with-end` trailing mid-gap | AGENTS shells / Hard rules | `#list` |
| expandable parent row kisses nested member | AGENTS Hard rules | `#list` |
| expandable group count kisses `--with-end` icons | AGENTS Hard rules | `#list` |
| twin section InfoHint (TopAppBar + mode drawer) | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| bulk select uses ClipboardIcon | AGENTS forms / FieldStack | `#layouts-demo-navigation-drawer` |
| mode drawer primary New not rightmost | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| mode drawer hide-builtin ControlBlock stack | AGENTS shells / Hard rules | `#layouts-demo-navigation-drawer` |
| mode drawer preference ControlRow flush on pad-inline | AGENTS Content density / shells | `#layouts-demo-navigation-drawer` |
| SyncSideFilter tooltip covers chrome or list | AGENTS Content density / List | `—` |
| SyncSideFilter / ToggleGroup segment wash bleed | AGENTS Hard rules | `#toggle-group` |
| CodeBlock editable selection stripes | AGENTS CodeBlock | `#code-block` |
| Collapsible inside List (skeleton crush) | AGENTS Content density / List | `#list` |
| nested short List well + invented list-well token | AGENTS Content density / List | `#list` |
| tiny InfoHint in TopAppBar / toolbar chrome | AGENTS forms / FieldStack | `—` |
| Surface + FieldHeader as titled table shell | AGENTS Card / Collapsible | `#table` |
| List tree wrapped in divs / buttons in leading | AGENTS Content density / List | `#list` |
| ListItem kind via wrapping div / start rail | AGENTS shells / Hard rules | `#list` |
| builtin ListItem looks like a square / chip island | AGENTS Content density / List | `#list` |
| List icon↔copy / three-line stack crushed | AGENTS Content density / List | `#list` |
| duration meta glued (`1m47s`) | AGENTS Hard rules | `#list` |
| List trailing stats drift across rows | AGENTS shells / Hard rules | `#list` |
| Card head actions wrap into a tall stack | AGENTS Card / Collapsible | `#card` |
| orphan draft save/discard outside Card | AGENTS Card / Collapsible | `#sandbox-card-draft-actions` |
| Card head actions clip at the end edge | AGENTS Card / Collapsible | `#card` |
| path / branch text in Card `actions` | AGENTS Card / Collapsible | `#card` |
| stacked InfoHints / essay tips in Card head | AGENTS Card / Collapsible | `#card` |
| mixed IconButton / InfoHint hover sizes | AGENTS forms / FieldStack | `#card` |
| mode drawer sm + Card head md | AGENTS shells / Hard rules | `#card` |
| form ControlRow label vs FieldHeader title | AGENTS forms / FieldStack | `#field-header` |
| status icon soup in a control-cluster | AGENTS Toolbar / unit rhythm | `#rhythm` |
| ListItem leading column / ellipsis / trailing island | AGENTS shells / Hard rules | `#list` |
| List --with-end ellipsis kisses action disk | AGENTS Content density / List | `#list` |
| List trailing Select + labeled Button overlap | AGENTS shells / Hard rules | `#globals-demo-select` |
| Card head Select centers on expanded panel | AGENTS Card / Collapsible | `#sandbox-card-head-select` |
| Card head Select↔Button 4dp kiss | AGENTS Card / Collapsible | `#sandbox-card-head-select` |
| List row copy cramped on the start edge | AGENTS Content density / List | `#list` |
| Chip as table-cell status / mapping kind | AGENTS Hard rules | `#table` |
| Select refresh crammed beside chevron | AGENTS forms / FieldStack | `#field-header` |
| Select row-action IconButton drifts when open | AGENTS forms / FieldStack | `#field-header` |
| repeatable Textarea remove wraps below row | AGENTS CodeBlock | `#form-recipe` |
| Dialog body Card stack crush | AGENTS Dialog / overlays | `#form-recipe` |
| phantom PageScroll rail behind modal Dialog | AGENTS shells / Hard rules | `#form-recipe` |
| overlay scrollbar paints through chrome heads | AGENTS Hard rules | `#drawer-nested-scroll` |
| modal Dialog scrollbar flash on enter | AGENTS Dialog / overlays | `#timeline` |
| table row action not sharing one trailing edge | AGENTS shells / Hard rules | `#table` |
| table map cluster top-hugged in a tall cell | AGENTS Hard rules | `#table` |
| chart tooltip locked to series-value Y | AGENTS chart recipe | `#chart` |
| chart tooltip loose unit-stack spacing | AGENTS chart recipe | `#chart` |
| chart tooltip clipped at plot edge | AGENTS shells / Hard rules | `#chart` |
| chart tooltip edge clamp jitter | AGENTS chart recipe | `—` |
| catalog morph remounts ClippedNavShell (drawer bounce) | AGENTS shells / Hard rules | `—` |
| InlineAlert + orphan List for one catalog | AGENTS Content density / List | `—` |
| InlineAlert beside List in ControlStack | AGENTS Content density / List | `#env-check` |
| List / FieldHeader nested inside InlineAlert | AGENTS Content density / List | `—` |
| CodeBlock copy covering the last glyphs | AGENTS CodeBlock | `#code-block` |
| plain CodeBlock despite a filetype label | AGENTS CodeBlock | `—` |
| Textarea for a suffixed file body | AGENTS CodeBlock | `#code-block` |
| catalog edit as silent PageScroll replace | AGENTS Content density / List | `#layouts-demo-drill-in` |
| fixed-height CodeBlock / Textarea on page scroll | AGENTS CodeBlock | `#code-block` |
| Textarea autoGrow soft-capped like ChatComposer (13rem) | AGENTS Chat / llm/CHAT_* | `#textarea` |
| skinny form Dialog (tall FieldStack / CodeBlock) | AGENTS CodeBlock | `#form-recipe` |
| Dialog body end-align footer clipped | AGENTS shells / Hard rules | `#form-recipe` |
| vacant band under FullscreenDialog title | AGENTS Dialog / overlays | `#fullscreen-flush` |
| BusyRegion colored loading wash (surface-*) | AGENTS Busy/Loading | `#busy-region` |
| BusyRegion busy copy bleeds through overlay | AGENTS Busy/Loading | `#sandbox-busy-region-field-sample` |
| bare CircularProgress as body loader | AGENTS Busy/Loading | `#busy-region` |
| BusyRegion empty cold-start overlaps SearchBar | AGENTS Busy/Loading | `#busy-region` |
| BusyRegion linear overflows NavigationDrawer | AGENTS Busy/Loading | `#busy-region` |
| stacked progress chromes in BusyRegion | AGENTS Busy/Loading | `#busy-region` |
| LinearProgress end-stop / “dotted” bar | AGENTS Busy/Loading | `#progress` |
| private hub progress shell for section loads | AGENTS Busy/Loading | `#busy-region` |
| BusyRegion fill nested in unit-stack / Card | AGENTS Busy/Loading | `#busy-region` |
| BusyRegion fill BusyStack top overflow in PageScroll | AGENTS Busy/Loading | `#sandbox-busy-region-page-scroll-fill` |
| section FieldHint + pane cold-start BusyRegion in one well | AGENTS Busy/Loading | `#busy-region` |
| EmptyState parks top-left in destination canvas | AGENTS shells / Hard rules | `#empty-state` |
| master–detail / content max-width token missing | AGENTS Hard rules | `#layouts-demo-drill-in` |
| canvas FillColumn megacard zero inset | AGENTS shells / Hard rules | `#layouts-demo-fill-column` |
| IconButton loading spinner + glyph overlap | AGENTS Toolbar / unit rhythm | `#rhythm` |
| bare ControlRow + FieldHint zero gap (PageScroll section) | AGENTS forms / FieldStack | `#rhythm` |
| ControlRow primary leftmost in mixed cluster | AGENTS Toolbar / unit rhythm | `—` |
| section-body IconButton sm | AGENTS Toolbar / unit rhythm | `#rhythm` |
| section-body labeled generate Button | AGENTS Toolbar / unit rhythm | `#rhythm` |
| CodeBlock autoGrow stuck in hidden tab | AGENTS CodeBlock | `#code-block` |
| PageScroll brief Card | AGENTS Card / Collapsible | `#form-recipe-page-scroll` |
| Collapsible brief save on head | AGENTS Card / Collapsible | `#form-recipe-page-scroll` |
| literal backticks in Chat bubbles | AGENTS Chat / llm/CHAT_* | `—` |
| ChatComposer field↔Send tighter than glyph↔field | AGENTS Chat / llm/CHAT_* | `#chat` |
| List run history stacked vertically | AGENTS Content density / List | `#list` |
| jammed headline list meta (overflow clip) | AGENTS Content density / List | `#list` |
| EndAside instant open / close (no width morph) | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| EndAside toggle workspace BusyRegion flash | AGENTS Busy/Loading | `#layouts-demo-shell` |
| ControlRow labeled Button cluster overflow (Card / EndAside) | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| EndAside PageScroll no scroll | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| EndAside dense labeled Button strip (information redundancy) | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| EndAside ControlRow label crush | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| EndAside icon tonal disks | AGENTS shells / Hard rules | `#layouts-demo-shell` |
| Export menu uses DownloadIcon | AGENTS Hard rules | `#split-button` |

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) | Install GitHub Packages + hard consume rules |
| [`consume.json`](consume.json) | Machine contract |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Custom highlight + CodeBlock language |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Short-prompt reminder |
| [`AGENTS.md`](../AGENTS.md) | Tokens + keep-set + Hard rules |
| [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) | Pasteable always-on consumer rule |
