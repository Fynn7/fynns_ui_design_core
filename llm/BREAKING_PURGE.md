# Breaking purge — public surface = Globals + Layouts + Preview

**Authoritative migration guide** for agents and humans after the destructive
export cleanup. Do not reintroduce purged symbols into `src/index.ts` without a
sandbox Globals/Preview demo and review.

## Policy

1. **Legal public components** are only those imported by:
   - [`examples/sandbox/src/pages/GlobalsPage.tsx`](../examples/sandbox/src/pages/GlobalsPage.tsx)
   - [`examples/sandbox/src/pages/LayoutsPage.tsx`](../examples/sandbox/src/pages/LayoutsPage.tsx)
   - [`examples/sandbox/src/pages/CardPreviewCanvas.tsx`](../examples/sandbox/src/pages/CardPreviewCanvas.tsx)
   - [`examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx`](../examples/sandbox/src/pages/CollapsiblePreviewCanvas.tsx)
   (plus their anatomy subcomponents and the icons those pages import).
2. **Theme / token infrastructure** stays public (`tokens`, `motionTokens`,
   `applyFynnsThemeMode` / `restoreFynnsThemeMode` / `getFynnsThemeMode`,
   scrollbar helpers, `fynnsVarName`, etc.).
3. **Internals** (`DialogFrame`, `MenuSurface`, `Spinner`, floating-box helpers in
   `floatingBox.tsx`; `Popover.tsx` is a deprecate re-export shim only) may exist
   on disk for KEEP components but are **not** barrel exports.
4. **Gallery** (`examples/gallery`) is removed. Foundations / Motion live under
   the sandbox pages.
5. **Atomic delete (sandbox ↔ source).** Never drop a Globals/Layouts/catalog demo while
   the symbol stays in `src/index.ts`. That half-delete fails `check:wysiwyg`
   (export without demo) and historically led agents to *restore the demo*
   instead of removing the export. One change must include **all** of:
   - remove barrel export (+ types)
   - delete primitive TSX + `.fynns-*` CSS
   - remove Globals demo + `globalsCatalog` entry + i18n help
   - update `AGENTS.md` / keep-set Cursor rules
   - add a **Removed** row below (machine-checked: Removed ∩ barrel = ∅)

## How to verify the allowlist

Run the machine check (fails CI / local when surface drifts):

```bash
npm run check:wysiwyg
```

Contract:

```text
Value exports from src/index.ts
  − imports in GlobalsPage + CardPreviewCanvas + CollapsiblePreviewCanvas
    + SandboxShell
  − symbols in llm/wysiwyg-companion.json
= must be empty

Removed-table identifiers (first column only)
  ∩ (value ∪ type exports from src/index.ts)
= must be empty

Companion must not list src/primitives/<Name>.tsx component basenames
globalsCatalog must not label purged PascalCase names
SANDBOX_DEFAULT_OVERRIDES must be {}
--fynns-radius-md in tokens.ts == theme.css
```

Companions are theme/token infrastructure, mount-once hosts (`SnackbarHost`),
shell-only icons, and pure helpers (date/time formatters, highlight registry,
overflow free functions, busy schedulers). Components and visual anatomy must
be demoed — do not park them in the companion list.

Anything else must be deleted or kept as a non-exported internal.

## Snackbar status

- Old **Toast / Toaster / toast / ToastProvider / useToast** are **deleted**.
- **Do not** import or reimplement those names.
- Use **`snackbar(...)` + `<SnackbarHost />`** (M3 Snackbar). Mount the host
  once near the app root. Never re-add sonner-shaped toast APIs.

## Removed → how consumers should fix

| Removed | Consumer fix |
| --- | --- |
| `Badge` / `BadgeProps` / `BadgeSize` / `BadgeVariant` / `.fynns-badge` / `.fynns-badge--*` | Non-M3 outlined pill labels (clashed with InfoHint / inline chrome). Use `Chip` (interactive), `InlineAlert` / `Banner` (status), or `BadgedBox` + `NavigationRailBadge` (notification overlay). Do not revive pill `Badge`. |
| `toast` / `Toaster` / `Toast` / `ToastProvider` / `useToast` | Use `snackbar` + `SnackbarHost`. Do not revive toast/sonner names. |
| `Popover` | Build a local anchored panel, or use `DropdownMenu` / `Tooltip` where they fit. |
| `SearchInput` | Use `SearchBar` (chrome) or `Input` (dense forms). |
| `Counter` | `Input type="number"` (+ steppers if needed in the app). |
| `ToggleControl` | Prefer `Checkbox` / `Radio` / `Switch` / `ToggleGroup`. |
| `SwitchSize` / Switch `size` prop (`md` / `sm`) | Dense track only (former sm ~39×24). Drop the `size` prop; `--fynns-toggle-*-sm` keys removed — use `--fynns-toggle-track-*` etc. Do **not** treat `Switch` itself as removed. |
| `InfoBanner` / `WarningBanner` / `ErrorBanner` / `SuccessBanner` / `AlertMessageBase` | Use `InlineAlert` for in-panel severity, or chrome `Banner`. Do not revive Alert `*Banner` names. |
| `ListGroup*` / `ListRow*` / `NavItem*` / `ShellNav*` | Deleted — rebuild with `List`/`ListItem`, `Navigation*` chrome, or app layout. |
| `Panel` / `PanelCard` / `ScrollArea` | Compose with `Surface` (bordered / tonal well, any children), `Card`, `ClippedNavShell` + `EndAside` (destination + inspector), `Drawer` for modal content sheets, app flex/grid, and `fynns-scroll`. Do not revive the old `Panel` / `PanelCard` / `ScrollArea` names. |
| `Kbd` / `Combobox` | Delete usage or reimplement in the app. (`CommandPalette` restored — see Restored.) |
| `UnitStack` | `.fynns-unit-stack` or Card / Collapsible / Dialog body (built-in `unit-stack-gap`). Control + its note → `ControlBlock`, not a revived stack component. Related form fields / preference switches by **semantic kind** → `FieldStack` (not a flat Card-body list). Sandbox demos may still use `.sandbox-stack`. |
| `captions` / `splitCaptionByBackticks` | Copy helper into the app (sandbox: `examples/sandbox/src/utils/captionSegments.ts`). |
| `Spinner` / `PanelSkeleton` / `BlockingLoadingOverlay` | Use `LinearProgress` / `CircularProgress` (inline / determinate), `BusyScrim` (fullscreen) / `BusyRegion` (section; **pane cold-start = `fill`**; **one** progress chrome — `indicator="linear"` for known %). `EmptyState` is **zero-result catalogs only** — not a loading shell. Do not revive the old `BlockingLoadingOverlay` name. `Spinner` remains **internal** for `Button` `loading` (not a barrel export). |
| `CardHeader` / `CardContent` / `CardActions` / `CardMedia` / `CardActionArea` / `variant` / `interactive` / `selected` / `CARD_VARIANT_MAP` | Use one-shot `Card` (`title` / optional `icon` / `actions` + children). Same shell as Collapsible; head is static (no hover layer, no chevron). Title-less wells → `Surface`. App-level selected chrome via consumer class / `Surface`, not Card `selected`. |
| Deleted / unused private glyphs (not in `icons.tsx`) | Prefer any glyph from the **full** `@fynns/ui` icon barrel (`icons.tsx` — not a subset gate ≥ **0.5.64**). Missing meaning → add SVG + export + Globals `#icons` in the same change. Do not revive glyphs removed from `icons.tsx`. |

## Still public (companion / demoed helpers)

These stay on the barrel but are **not** required as Globals demos — listed in
`llm/wysiwyg-companion.json` (or live next to their host control). Do **not**
put them in the Removed table above; `check:wysiwyg` treats Removed ∩ barrel
as a hard fail.

| Symbol | Notes |
| --- | --- |
| `formatDateValue` / `parseDateValue` / `formatTimeValue` / `parseTimeValue` | Companion APIs with DatePicker / TimePicker. |
| `measureOverflow` / `overflowsBounds` / `measureContentOverflow` / `OVERFLOW_EPSILON` | Layout overflow free functions — companion APIs. Prefer `useOverflowBounds` (demoed in Globals). |

## Restored after purge (use these)

| Symbol | Notes |
| --- | --- |
| `Dialog` / `DialogShell` / `ConfirmDialog` | Centered modals via `DialogFrame`. M3 shape: `radius-3xl`, no default close X on Dialog/Confirm. Dismissible labeled rows: `Dialog` + `showCloseButton` + full-width `ControlStack` (see Behavioral). |
| `Drawer` | Content side sheet (~25rem / open-edge `radius-xl`); not `NavigationDrawer`. Always modal (no `modal={false}`). Layout token `--fynns-layout-drawer-width` is now `25rem` (was `72vw`). |
| `Textarea` | Multiline dense field aligned to Input chrome; **not** full M3 floating-label Text Field. |
| `Tabs` | M3 primary underline tabs — **not** a `ToggleGroup` substitute. |
| `InlineAlert` | In-panel severity strip (**fynns utility, not M3**): soft `color-mix` tonal fill. Pad / gap / icon size reuse `--fynns-banner-*` strip tokens (same constants as chrome Banner). Icon tinted by severity; body on-surface. Width follows parent (`width: 100%`). Long paths wrap. **Phrasing copy only** — stack `List` / form clusters below as unit-stack siblings, not inside `children`. Replaces old Alert `*Banner` exports. Do not invent a second bordered status shell. |
| Dialog sizes | `--fynns-layout-dialog-max-width-lg` is now `35rem` (was `42rem`; stays within M3 ≤560dp). |
| `SplitButton` | M3 Expressive split: leading `Button` + trailing menu (`DropdownMenu`); flush segments (no gap); variants `primary` / `tonal` / `default` / `elevated`. Demoed in Globals Actions. |
| `CommandPalette` | Spotlight / ⌘K filter dialog (`open` / `onOpenChange` / `items[]`). Apps own the global accelerator. Live: sandbox Globals `#command-palette`. Not DropdownMenu / SearchBar alone. |
| `Button` `danger` | Filled like `primary`: `--fynns-color-danger` surface + `--fynns-color-on-accent` ink (outlined red chrome retired). IconButton danger mirrors filled primary. |
| `Card` | One-shot static section: `title` + optional `icon` / `actions` + always-visible `children`. Shares Collapsible shell; not a disclosure. Anatomy parts and elevated/filled/outlined variants deleted. |
| `ClippedNavShell` / `EndAside` | Low-level destination chrome (full-bleed TopAppBar + drawer\|rail) and end-edge inspector width morph. Prefer **`DestinationAppShell`** for greenfield. Not `Drawer` (modal content). Demoed in Layout templates. |
| `DestinationAppShell` | **Default** declarative app chrome (`destinations` / `title` / `trailing` / `children` / optional `aside`). Wraps ClippedNavShell + Drawer|Rail sync. Demoed in Layout templates `#layouts-demo-shell`. |

## Behavioral breaking (still exported)

| Change | Consumer fix |
| --- | --- |
| `CodeBlock` titled chrome | `variant="default"` (or omit) **requires** non-empty `label`. Omitting `label`, `label=""`, or whitespace-only **throws** (no silent empty head). No filename → `variant="plain"`. Do not use empty `label` to “hide” the title bar. |
| Editable `CodeBlock` height | Default **`autoGrow`** (content-sized from `rows` floor `1` up to `maxHeight`). Previously editable wells used fixed `rows` height only. Pass `autoGrow={false}` for a fixed well or fill hosts that set `textarea { height: 100% }` — otherwise inline content height fights percentage fill. |
| Centered `Dialog` ControlStack / Switch | Inside `.fynns-dialog-panel--centered`, stacks are **full width** with label `1fr` + end `max-content`, and the close control uses a glyph-inset negative margin so the **CloseIcon** end edge aligns with Switch tracks (not the 40dp hit box). Remove consumer padding that re-insets the body. Row recipe: `ControlRow` label + track-only `Switch` — do not copy Globals `#info-hint` (labeled Switch + trailing `InfoHint`) as a Preferences shell; see AGENTS.md **Dismissible Dialog + ControlStack**. |
| Overlay head\|body hairline | Centered `Dialog` / `ConfirmDialog`, `Drawer`, `BottomSheet`, `FullscreenDialog`, and Date/Time picker dialogs paint **no** head\|body `border-strong` divider and no `surface-head` title strip (single surface; Sheet keeps the drag handle). Do not restyle a Card-like hairline back onto these heads. Centered Dialog pads: non-confirm head block-start `dialog-inset/2` + end `0`; Confirm head block-start full `dialog-inset`; `head + body` pad-top `space-sm`; foot block-end `space-lg` (was full `dialog-inset` under the hit box). |
| FullscreenDialog flush-start | When the first body child (or that child’s first child — one unpadded fill wrapper) is a keep-set bordered well (`CodeBlock` / `Surface` / `.fynns-table-wrap`), `.fynns-dialog-body` uses `padding-block-start: 0`. Drop consumer `padding-top` / vacant-band hacks between the fullscreen title and the well frame. Head chrome stays `content-inset`. Not Card Field* crush; not `chrome="plain"` flush. Live: sandbox `#fullscreen-flush`. Authority: AGENTS.md **Flush-start overlay body**. |
| Choice Other+Input host class | `.fynns-control-cluster--nowrap` renamed to `.fynns-control-cluster--choice-extra` (Google same-row Radio/Checkbox + free-text). Replace the old class on form recipes; keep the write-in mounted and `disabled` when Other is not selected (preserve draft). Live: sandbox `#form-recipe`. |
| `ControlRow` / chrome captions | No forced `text-transform: uppercase`. Pass the casing you want shown; do not rely on CSS to shout labels. |
| `Avatar` initials from `name` | Initials keep the source string’s casing (no `.toUpperCase()`). Normalize in the app if you need all-caps marks. |
| Card / Collapsible `chrome="card"` body / Dialog body | Bodies are flex columns with `--fynns-layout-unit-stack-gap` (**16dp**) between **direct** children. Drop consumer `margin-bottom` on FieldBlock / intro copy that doubles the gap. Related control + narrative → `ControlBlock` (`description`), not a loose muted `<p>` after `ControlStack`. Consecutive same-kind form units → `FieldStack`: plain **FieldBlock**s keep `field-stack-gap` (**12dp**, aliases `control-stack-form-gap`); with description/error → next sibling **16dp**; hosting a `.fynns-control-cluster` → next sibling **32dp** (`form-cluster-gap`); sibling **ControlBlock**s to `unit-stack-gap` (**16dp**); adjacent FieldStacks → `form-cluster-gap` (**32dp**) **+ strongly prefer a horizontal `Divider`** on kind jumps. `--fynns-layout-field-hint-gap` is **8dp** (no longer aliases unit-stack). Live: sandbox `#form-recipe`. |
| Card / Collapsible `chrome="card"` body pad | Body **block** pad uses full `--fynns-layout-content-inset` (**18dp**) on all edges (≥ **0.5.114**). The former `:has(> .fynns-field-*:first-child)` crush to `space-xs` (**4dp**) is removed — do not rely on a tighter top under Field* in Card/Collapsible. `content-pad-block` remains for Surface padded / CodeBlock pre — not Card body. |
| `ChatMessage` streaming cue | **I-beam caret removed.** Cue = last-glyph color pulse (`.fynns-chat-message-stream-tail`, text ↔ ChatThinking-shimmer mid / accent→muted — never full neon accent). Tokens `--fynns-chatmessage-cursor-width` / `cursor-height` → `--fynns-chatmessage-stream-tail` (aliases thinking-shimmer). Class `.fynns-chat-message-cursor` deleted. Still: `streaming` with no paint-worthy `children` / `markdown` paints **no** answer bubble and **no** cue (thinking / activity may show above); empty / whitespace / nullish-only slots count as empty; row stays `aria-busy`. |
| `ChatMessage` body sibling stack | Adjacent **element** children get `--fynns-chatmessage-body-stack-gap` (**16dp**). Bare string / number children (and consecutive inline marks such as `code`) coalesce into `.fynns-chat-message-prose` so `{text}<CodeBlock/>` stacks without a consumer wrapper, while caption-style string+`code` mixes stay one inline run. Do **not** invent app CSS for this gap; drop one-off `<div>{text}</div>` workarounds that only existed to force element siblings. Streaming wraps the last glyph in the trailing prose / markdown host (no extra caret box). |
| `ChatMessage` / `ChatMarkdown` (additive) | Prefer `markdown={md}` or `<ChatMarkdown source={md} />` for LLM turns (L2 GFM subset → keep-set nodes). When `markdown` is set it **wins** over `children` for the bubble body. Raw Markdown strings as bare `children` still render as plain prose (backticks stay literal). GFM `- [ ]` / `- [x]` render as **ordinary** ul/ol items (label only — **no** interactive `Checkbox` in Chat). Re-paste `consumer-cursor-rule.mdc` after this treaty update. |
| `ChatThinking` default streaming orb | Omitting `icon` no longer paints the soft pulsing mark. Pass an explicit `icon` when you want a leading glyph; `icon={null}` stays empty. Rely on label shimmer + `aria-busy` for streaming cues. |
| `LinearProgress` stop indicator removed (≥ 0.4.35) | Prop `stopIndicator` and `.fynns-linear-progress-stop` / `--fynns-progress-stop-size` deleted (was still default-on until this ship). Determinate bars are active fill + remaining track only (optional gap). Drop any `stopIndicator` props / private end-dot CSS in the consumer. Live: sandbox `#progress`. |
| `ChatActivity` mid-stream collapse | While `streaming`, the header trigger stays **enabled** (no longer force-disabled). Uncontrolled trees force-open unless the user pinned closed; a new streaming cycle clears the pin. Completed trees keep last open — **no** post-stream auto-collapse. |
| `Table` dense / narrow hosts | `.fynns-table` is `width: max-content; min-width: 100%`; header/body cells are `white-space: nowrap` (+ `word-break: keep-all`). Narrow hosts **scroll** via `.fynns-table-wrap` instead of crushing columns (CJK headers no longer character-stack). Do not force `width: 100%` / wrap on `.fynns-table*` in the consumer to “fit” a Surface. |
| `NavigationDrawer` destination gap | Body **destination** siblings (Item / Group / Headline / Divider) share `--fynns-navdrawer-section-gap` (**4dp**). SearchBar / tools ↔ destinations use `--fynns-navdrawer-search-gap` (**8dp**, aliases layout `control-stack-gap`; was 16dp before 0.4.48, then 4dp/`section-gap`, then 8dp in 0.4.52). Do **not** wrap Item / Group / Headline lists in `.fynns-unit-stack` (that would also 16dp the destination rows). Core remaps **direct** `.fynns-nav-drawer-body > .fynns-unit-stack` to `section-gap` (≥ **0.5.125** — not nested Card/Collapsible body stacks). Re-paste `consumer-cursor-rule.mdc`. |
| NavigationDrawer Card Collapsible stack gap (≥ **0.5.125**) | `.fynns-nav-drawer-body > .fynns-unit-stack` only → `section-gap` (4dp). **Nested** `.fynns-card-body` / `.fynns-collapsible-body` / `.fynns-dialog-body` `.fynns-unit-stack` keeps `unit-stack-gap` (16dp) — stacked Collapsible shells must not kiss at ~4dp. Live: Layouts `#layouts-demo-navigation-drawer` inspector Card sample. Re-paste `consumer-cursor-rule.mdc`. |
| FieldHeader inline InfoHint gap (≥ **0.5.128**) | `.fynns-field-header__label:has(.fynns-info-hint-trigger)` uses `inline-flex` + `--fynns-space-xs` (4dp) — same breath as `ControlRow` label + InfoHint. Pre-0.5.128 kissed the 32dp disk against title ink when policy `InfoHint` lived inside `FieldBlock` `label` beside trailing `actions` IconButtons. Live: `#sandbox-field-header-inline-infohint`. Re-paste `consumer-cursor-rule.mdc`. |
| `Pagination` page strip | The page list is **nowrap** and the nav is **content-width**. Table/list footers use **`.fynns-pagination-bar`** (M3/MUI single row: Select + range start, `Pagination` end). Do **not** stack Select above Pagination as Card-body siblings, and do **not** grow Select beside the pager. Re-paste `consumer-cursor-rule.mdc`. |
| `Pagination` bar narrow wrap (≥ 0.4.85) | `.fynns-pagination-bar` is **`flex-wrap: nowrap`** + `overflow-x: auto` — never two rows on narrow. Pair with `fynns-scroll`. Drop consumer wrap overrides. Live: `#pagination`. |
| Mode drawer sort+new cluster (≥ 0.4.86; **primary New rightmost ≥ 0.5.60**; **section InfoHint TopAppBar-only ≥ 0.5.63**) | Mode sidebars without SearchBar: **`.fynns-control-cluster--toolbar-end`** (nowrap + trailing hug). LTR: secondary ghost tools → **primary New/Plus last**. Sort menu trigger → non-chevron icon. **Section help** → one TopAppBar `trailing` `InfoHint` — not a twin in `--toolbar-end`. Drop start-packed full-width tool clusters; never park Plus mid-strip. Live: Layouts `#layouts-demo-shell` + `#layouts-demo-navigation-drawer`. |
| Full icon library + bulk glyphs (≥ **0.5.64**) | Barrel exports **every** glyph in `icons.tsx` (not a curated subset). New `CheckSquareIcon` / `SquareIcon`. Bulk recipe: exit → `CloseIcon`; select all → `CheckSquareIcon`; deselect → `SquareIcon`; enter → `ListChecksIcon`; restore → `UndoIcon`. Live: Globals `#icons`. Re-paste `consumer-cursor-rule.mdc`. |
| ControlStack block-child span (≥ **0.5.120**) | `.fynns-control-stack > :not(.fynns-control-row)` spans full grid width so `InlineAlert` / `List` / `FieldStack` do not sit beside catalogs. Prefer `.fynns-unit-stack` for alert → list → foot; live `#env-check`. Re-paste `consumer-cursor-rule.mdc`. |
| BusyRegion frosted blur overlay (≥ **0.5.122**; soft radius ≥ **0.5.139**) | `.fynns-busy-region-overlay` = transparent fill + `backdrop-filter: blur(var(--fynns-layout-busy-region-backdrop-blur))` (default **3px** — soft enough to de-emphasize mono under busy copy; do not raise toward “glitchy” heavy frost). Well hue unchanged. **Not** `--fynns-color-overlay` (BusyScrim only), **not** `surface-*` wash, **not** bare transparent. Do **not** add consumer scrim / blur CSS. Live: `#busy-region` FieldBlock refresh over `CodeBlock`. Re-paste `consumer-cursor-rule.mdc`. |
| ToggleGroup fullWidth shrink + compact pad (≥ **0.5.140**) | `--full` segments/chips `min-width: 0` (was `max-content` — equal columns could not shrink); label ellipsis; `--fynns-segmented-pad-inline-compact` **8dp → 12dp**. Narrow mode SyncSideFilter: **short** visible labels + `showCheck={false}` + omit `tip` — long product names still ellipsize, do not invent consumer pad. Live: `#layouts-demo-navigation-drawer` / `#toggle-group`. Re-paste `consumer-cursor-rule.mdc`. |
| RevealMore for long data Tables (≥ **0.5.144**) | `useRevealMore` + `RevealMore`: default **10** visible / step **10**; foot **outside** `.fynns-table-wrap` (Card / unit-stack sibling). App slices rows; default label `Show more` (pass locale). Fully revealed → foot gone (no collapse). `resetKey` on filter change; do not reset on polling `total` growth. **Hard** for Card / PageScroll data Tables that can exceed ~10 rows — short / Dialog / `Pagination` exempt. Live: `#table`. Re-paste `consumer-cursor-rule.mdc`. |
| RevealMore for long Lists (≥ **0.5.145**) | Same primitives; pass `REVEAL_MORE_LIST_DEFAULT_INITIAL` / `_STEP` (**5** / **5**) — ListItems are taller. Foot **after** the `List`. **Hard** for Card / PageScroll Lists that can exceed ~5 items — short / Dialog / `Pagination` exempt. Live: `#list`. Re-paste `consumer-cursor-rule.mdc`. |
| RevealMore foot centered (≥ **0.5.146**) | `.fynns-reveal-more` uses `justify-content: center`. Live: `#table` / `#list`. |
| RevealMore tonal (≥ **0.5.147**; size **md** ≥ **0.5.149**) | Default foot chrome: `Button` **`tonal`** + **`md`** (40dp). **0.5.147** briefly defaulted `lg` (48dp); **0.5.149** restores **md**. Optional `variant` / `size` override. Live: `#table` / `#list`. |
| CLI/tool probe ControlRow redundancy (≥ **0.5.150**) | Status Card CLI probes: `label` = short status only; no tool-name label + status Chip + sibling `FieldHint` essay — use install Button + row `InfoHint`. Live: `#rhythm` service. Re-paste `consumer-cursor-rule.mdc`. |
| FieldHint must not restate ToggleGroup / Tabs labels (≥ **0.5.148**) | Page/section `FieldHint` / section-lead copy that only lists visible segmented option names is **information redundancy** — delete it; TopAppBar `InfoHint` may keep a short scope tip without listing those labels. Live: `#rhythm` Surface. Re-paste `consumer-cursor-rule.mdc`. |
| PageScroll Card column = content-column width (≥ **0.5.141**; chat/dialog misuse named ≥ **0.5.142**) | Card / Collapsible stretch (`width: 100%`, `align-self: stretch`); BusyRegion content `width: 100%`. **Do not** wrap destination Cards / form `hub-col` in `sheet-max-width` (BottomSheet), `chat-max-width` (Chat host only), or `dialog-max-width*` (Dialog panels). Section ControlRow + sibling Cards share one right edge; solo form pages still fill `.fynns-content-column`. Live: `#page-scroll`. Re-paste `consumer-cursor-rule.mdc`. |
| BusyRegion fill in PageScroll (≥ **0.5.136**) | `.fynns-page-scroll > .fynns-content-column` gets `min-height: 100%`; thin wrappers hosting only `--fill` BusyRegion / EmptyState pass the flex height chain. Pane cold-start `fill` under PageScroll + SectionLead must **center** BusyStack — not top-park / overflow a collapsed absolute overlay. Live: `#sandbox-busy-region-page-scroll-fill`. Re-paste `consumer-cursor-rule.mdc`. |
| Bulk select soft rows (≥ **0.5.65**) | Multi-check rows: **`Checkbox` only** — **never** `active`/`selected` from `checked`. One open destination may keep a single `active` pill; all-selected stays default row + checkbox (no teal wall). Live: Layouts `#layouts-demo-navigation-drawer` third column. Re-paste `consumer-cursor-rule.mdc`. |
| Expandable List `--with-end` row anchor (≥ **0.5.66**) | Parent `ListItem` with `detail` + `trailing`: `--with-end` IconButtons anchor to `.fynns-list-item-row` only (not full host height). Live: `#list` expandable tree. Bump-only consumer fix. |
| Mode drawer hide-builtin preference (≥ 0.4.87; **label inset ≥ 0.5.137**; **toolbar/Switch end align ≥ 0.5.143**) | No **`ControlBlock` + long `description`** in narrow nav tools (~224px → ~102dp stack). Use one-row **`ControlRow` + `InfoHint size="sm"` + track-only `Switch`**. Core ≥ **0.5.137** pads that ControlRow with Item `item-pad-inline-*`. Core ≥ **0.5.143** pads `--toolbar-end` with the same end inset so primary Plus and Switch track share one trailing edge. Live: Layouts `#layouts-demo-navigation-drawer` + Globals `#info-hint`. Bump-only when the consumer already uses this recipe. |
| CodeBlock editable selection / wrap (≥ 0.4.88; **reverted** 0.5.38–0.5.50 visual-line / mirror bands; **restored** live soft-wrap edit tokens in **0.5.52** — pre-**3241e15**) | **`readOnly`** → single `.fynns-code-block-pre` (full tokens + native `::selection`). Soft-wrap **edit** + highlight → **live deferred token overlay** (dual-layer; wrap/selection may stripe — use **`wrap={false}`** or `readOnly` when alignment matters). **`wrap={false}`** → classic dual-layer `<pre>`. Live: Globals `#code-block` soft-wrap sample + file-body + readOnly pair. |
| Text field spellCheck default (≥ **0.5.28**) | **`Input`**, **`Textarea`**, **`SearchBar`**, **`ChatComposer`** default **`spellCheck={false}`** (browser red squiggles off for technical / multilingual copy). Opt in with `spellCheck` where prose checking is desired. Editable **CodeBlock** hides native spelling marks via CSS when overlay textarea is transparent. Re-paste `consumer-cursor-rule.mdc`. |
| Nav drawer workspace pill removed (≥ **0.5.29**) | Drop `NavDrawerWorkspaceRow`, `DestinationAppShell` `navBodyExtra`, and `.fynns-nav-drawer-footer-slot*` CSS. Workspace / repo context is **not** a drawer-body pill — use a real destination, TopAppBar title, or app-owned body chrome outside this recipe. Re-paste `consumer-cursor-rule.mdc`. |
| `ListItem` interactive trailing | On interactive **and** static (`interactive={false}`) rows, action `trailing` (IconButtons / menus / unknown composites) is a **sibling** of the row control (valid nesting; shares host `radius-3xl` state-layer). Decorative leaves (`*Icon` / svg / text) may stay inside. Meta `trailingSupportingText` stays inside the row control. Minified builds prefer **outside** when the component name is unknown — do not rely on `displayName` alone. Path / link catalogs: one `List` — never `Surface`/`Card` per entry. Re-paste `consumer-cursor-rule.mdc`. |
| `List` kind chrome / gaps / trailing stats (≥ this ship) | Catalog kind = **leading icon** + `trailingSupportingText` / `.fynns-table-meta` — **not** `hostClassName` start tick / inset rail / second wash. `--fynns-list-gap` is **16dp** (`space-lg`; was 8dp). Three-line stacks use `--fynns-list-content-gap-3` (**8dp**). Duration meta spaces units (`1m 47s`). Multi-metric trailing that must column-align across rows → `.fynns-list-item-trailing-stats` (fixed tracks; `--pair` for two metrics) — not flex `.fynns-control-cluster`. Drop consumer rail CSS and private gap / stats-grid overrides. Live: sandbox `#list`. |
| Card / Collapsible title lead (≥ this ship; **yield** ≥ **0.5.57**; CatalogMorph head **sm** ≥ **0.5.59**) | `.fynns-card-lead` / `.fynns-collapsible-trigger` prefer `flex: 1 1 40%` with **`min-width: 0`** (not a hard `40%` floor) so dense header actions stay fully visible under Card `overflow: hidden`; title ellipsizes. Prefer one flat `.fynns-control-cluster` of IconButtons in `actions` — **no** `ToggleGroup` in the head (body `ControlRow`). **Mode detail:** Card `actions` IconButtons / icon SplitButtons use **`size="sm"`** when drawer `--toolbar-end` is `sm`. Live: sandbox `#card` actions-strip + mode-body. |
| `List` two-line density (≥ 0.4.65) | `--fynns-list-height-2` **72dp → 60dp**; `--fynns-list-leading-width` **40dp → 20dp** (hug glyph, not empty icon column). Path catalogs / expandable trees get shorter rows and tighter leading. Drop consumer CSS that assumed the old floors. Live: sandbox `#list`. |
| `DestinationAppShell` densify rail labels (≥ 0.4.64, **superseded**) | Historical: default `railLabelVisibility` was **`unlabeled`**. **≥ 0.4.84:** DestinationAppShell **removed** rail densify — destinations are drawer \| hidden only. Drop `railLabelVisibility` / `narrowBreakpoint`. Re-paste `consumer-cursor-rule.mdc`. |
| `ClippedNavShell` narrow drawer (≥ 0.4.83) | Viewport ≤56.25rem **no longer** stacks a rem-capped (`9rem`) labeled drawer above main. Destinations stay a side column. |
| Destination binary nav (≥ 0.4.84) | **No** icon-only `NavigationRail` densify on crowd / narrow for DestinationAppShell / sandbox shell. `onNavCrowded` **closes** (`hidden`). Standalone `NavigationRail` remains for intentional phone roots only. Live: `#layouts-demo-shell`. |
| PageScroll catalog ControlRow band (≥ 0.4.101) | When the **first** child of `.fynns-content-column` is a standalone `.fynns-control-row`, `padding-block-start` uses `--fynns-navdrawer-body-pad-block-start` (12dp) instead of full `dialog-inset` (24dp) so the ControlRow label midlines with the active `NavigationDrawerItem`. First Card / EmptyState keep full inset. Drop consumer `padding-top` / negative-margin hacks. Live: Layouts `#layouts-demo-shell`. |
| Chrome locale switch recipe (≥ 0.4.102) | Historical: binary en↔zh as compact `ToggleGroup` in TopAppBar. **≥ 0.4.105:** language moves to **Settings body** only (`FieldBlock` + ToggleGroup) — not TopAppBar. Re-paste `consumer-cursor-rule.mdc`. |
| Settings = software chrome only (≥ 0.4.104) | Footer gear entry only (no Settings `NavigationDrawerItem` beside it). Settings body = locale / appearance / account — feature / provider / catalog panels get their own destinations. Live: `#layouts-demo-shell`. Re-paste `consumer-cursor-rule.mdc`. |
| Language in Settings only (≥ 0.4.105) | Remove TopAppBar language `ToggleGroup` / Select. Settings `FieldBlock` + compact `ToggleGroup` (`LanguageSwitcher` recipe). Live: `#layouts-demo-shell` + Templates. |
| EmptyState pane center `fill` (≥ 0.4.106) | Sole DestinationAppShell canvas / FillColumn / shell-main zero-result → `EmptyState` **`fill`** (centers like `BusyRegion` `fill`). Default stays content-sized for Card / List / `ChatThread.empty`. Live: `#empty-state` fill stage / `#layouts-demo-drill-in`. Re-paste `consumer-cursor-rule.mdc`. |
| `List` `--with-end` overlay reveal + path trailing md (≥ 0.4.107; brief in-flow experiment 0.4.116 **superseded ≥ 0.4.117**; gap densify **≥ 0.4.123**) | End action clusters on `--with-end` rows **overlay-reveal** (idle full-bleed copy for balanced L/R breath; hover / focus-within shows trailing; touch always visible). `--fynns-list-end-actions-gap` clears copy→first disk on reveal — **4dp**, aliases `control-cluster-gap` (≥ **0.4.123**; briefly **10dp** / navdrawer `pad-inline` only in 0.4.107–0.4.122). Path catalogs use default **`md`** IconButtons; `--fynns-list-height-2` **56dp**. Do **not** keep always-visible in-flow trailing that reserves flex on idle (sparse middle). Live: `#list` / `#rhythm`. Re-paste `consumer-cursor-rule.mdc`. |
| Experience / job List meta (≥ 0.4.118; start column token 0.4.119; **opt-in `trailingMetaAlign` ≥ 0.4.120**; **1-icon `--with-end` reserve ≥ 0.4.121**; end-ink **0.4.133** / **0.4.148**; **start-ink restored ≥ 0.5.13**) | Organization under title; dates → `trailingSupportingText`. Mixed-length date / timestamp catalogs → **`List` / `Timeline` `trailingMetaAlign="start"`** (shared min-width column; **start**-aligned ink ≥ **0.5.13** — 0.4.148 end-ink superseded). Short status + `--with-end` action catalogs **omit** the prop. Live: `#list` org+dates / `#timeline` / run-summary / status+action. Re-paste `consumer-cursor-rule.mdc`. |
| Control-cluster sibling gap denser (≥ **0.4.122**; **List meta→icon aliases same 4dp ≥ 0.4.123**) | `--fynns-layout-control-cluster-gap` **8dp → 4dp**. `--fynns-list-end-actions-gap` aliases that token (was navdrawer `pad-inline` / 10dp) so date / status / any preceding content sits **4dp** from the first `--with-end` IconButton — same as IconButton↔IconButton. TopAppBar stays on `chrome-icon-gap` (**2dp**). Drop consumer private `gap` overrides. Live: `#rhythm` / `#list` org+dates. |
| NavDrawer footer account L/R (≥ **0.4.124**) | `.fynns-nav-drawer-footer-account` no longer uses `control-cluster-gap` for Avatar-column↔settings — uses `control-stack-gap` (**8dp**) + `width: 100%` space-between so the gear stays sheet-end (label must not kiss the disk after 0.4.122 densify). Live: `#layouts-demo-shell`. |
| NavDrawer footer Avatar↔label (≥ **0.4.125**) | `.fynns-nav-drawer-footer-account-start` gap = `--fynns-navdrawer-pad-inline` (**~10dp**, same as sheet L/R inset) — not `control-cluster-gap` 4dp. Live: `#layouts-demo-shell` with account name on. |
| NavDrawer footer middle band (≥ **0.4.126**) | `account-start` / label no longer `flex-grow` — hug content so `space-between` opens a real empty middle (short names); long names still shrink + fade. Live: `#layouts-demo-shell`. |
| NavDrawer footer edge inset (≥ **0.4.127**, tune **0.4.128**, equal four-way **0.4.129**, Cursor **0.4.131**) | Drop optical −8 on settings. **0.4.128:** no Item `item-pad` stack. **0.4.129:** equal four-way `--fynns-navdrawer-footer-account-inset`. **0.4.131:** inset **≈16dp** (`space-lg`) so Avatar edge / gap rhythm matches Cursor. Live: `#layouts-demo-shell`. |
| NavDrawer footer account label fade (≥ **0.4.130**) | Soft end mask only when truncated (`data-fade`). Short content-hug names stay fully opaque. Live: `#layouts-demo-shell`. |
| Page catalog CodeBlock / Textarea autoGrow (≥ **0.4.132**) | Docs / sandbox teach **default autoGrow** on PageScroll / Card / Dialog file bodies (page scrolls). `autoGrow={false}` reserved for height-resolved **fill** hosts only. Drop consumer `autoGrow={false}` + large `rows` that trap long prompts in an inner scrollbar. Live: `#code-block` file-body Card. Re-paste `consumer-cursor-rule.mdc`. |
| List `trailingMetaAlign` column end-align (≥ **0.4.133**; brief start-ink **0.4.144–0.4.147**; **end-ink ≥ 0.4.148**; **superseded start-ink ≥ 0.5.13**) | Shared 17ch column (box starts align). **Historical:** 0.4.148 end-aligned plain meta so short dates hugged `--with-end` actions. **Current (≥ 0.5.13):** keep `trailingMetaAlign="start"` on date / timestamp catalogs and **start**-align ink inside the column (List + Timeline). Status+action catalogs still **omit** the prop. Live: `#list` org+dates / `#timeline` / run-summary. |
| List meta column start-ink (≥ **0.4.144**; end-ink interlude **0.4.148**; **current start-ink ≥ 0.5.13**) | 0.4.144 briefly start-aligned plain `trailingSupportingText`; **0.4.148** restored end-ink; **≥ 0.5.13** restores start-ink for plain meta (and Timeline). `.fynns-list-item-trailing-stats` cells stay **start**-aligned. Drop consumer private `text-align` / width hacks. Live: `#list` org+dates / usage-stats / `#timeline`. |
| List headline meta overflow / one-metric (≥ **0.4.145**) | Wrap meta labels in `<span>` for ellipsis; **one metric per** `.fynns-table-meta`; sibling cell = tokens track. Do not jam latency+tokens into one fixed elapse+icon box. Trailing timestamp ellipsizes when squeezed. Live: `#list` run-summary. |
| Overlay scrollbar vs rounded Dialog (≥ **0.4.134**) | Fixed portal Y rails clamp to the straight edge of rounded `overflow: hidden|clip` ancestors (centered Dialog `radius-3xl`) — thumb bottom tangent to the start of the bottom corner, not through the curve. Live: `#form-recipe` Dialog. |
| Catalog edit host (≥ **0.4.135**) | In-canvas catalog `List` create/edit/open → `Dialog` `size="lg"` + `showCloseButton` (or `FullscreenDialog` for multi-Card long forms) — list stays mounted. Do **not** silent-replace `PageScroll` with a detail that only has a ghost text back. Nav drill-in (`#layouts-demo-drill-in`) stays a separate grammar. Live: `#list` status+action / `#form-recipe`. |
| Card body trailing icon column (≥ **0.4.136**) | FieldBlock / FieldHeader `actions` InfoHint + `.fynns-control-cluster--end-align` refresh + ControlRow InfoHint in one Card share one `IconButton`/`InfoHint` `size` (`sm` when label-row help is `sm`) so end-docked hover disks share one vertical end edge. Core: (1) stop re-flooring Tooltip-wrapped end-align IconButtons to 40dp; (2) form-host ControlRow clusters `justify-content: flex-end` so shorter OK/Fail rows do not inset the trailing “i”. Live: `#field-header`. |
| Form trail box for lone table-meta (≥ **0.4.137**) | Lone ControlRow `.fynns-table-meta` (`-` / OK / Fail without InfoHint) uses the same `--fynns-form-trail-chrome` box as IconButton / InfoHint (sm → field-header 32dp band; else `icon-target`). Drop content-width em-dash glued to the end edge. Live: `#field-header` idle probe. Re-paste `consumer-cursor-rule.mdc`. |
| Form ControlRow text-start (**0.4.138**; **reversed ≥ 0.5.58**) | **0.4.138** inset ControlRow labels to Select / Input **value** text via `--fynns-form-control-text-inset-inline`. **≥ 0.5.58** drops that inset so ControlRow **label** glyphs flush-align with `FieldHeader` / FieldBlock **titles**; value ink stays inside the shell. Live: `#field-header`. Re-paste `consumer-cursor-rule.mdc`. |
| ChatComposer collapsed field↔Send optical (≥ **0.4.140**) | Collapsed leading + Send: measure **leading glyph → field**, not IconButton hit box → field. Core pads `.fynns-chat-composer-primary-slot` with `composer-glyph-inset` so field → filled Send disk matches. Drop consumer private Send margin. Spec: `llm/CHAT_COMPOSER_LAYOUT.md`. Live: `#chat`. |
| List run-summary single line (≥ **0.4.141**; gap **0.4.142**; meta start **0.4.143**; trailing end-ink **0.4.148** → **start-ink ≥ 0.5.13**; overflow **0.4.145**) | Status + identity + duration on **one** horizontal `ListItem` line. Cluster gap = `control-stack-gap` **8dp**. Headline `.fynns-table-meta` = fixed elapse+icon track + **start** align (≥ 0.4.143); **one metric per cell** + label `<span>` ellipsis (≥ 0.4.145). Timestamp → `trailingSupportingText` + **`List` `trailingMetaAlign="start"`** (**start**-ink ≥ **0.5.13**). Drop `InlineAlert`, `lines={2}` stack, between-row `Divider`, jammed multi-metric meta, and private status↔title margin. Live: `#list` run-summary. |
| Twin Button `loading` rings (≥ **0.4.146**) | In one `.fynns-control-cluster` of action Buttons/IconButtons: **at most one** `loading` spinner. Track which action is busy; siblings `disabled` without a second ring. Never `loading={busy}` on every sibling. Live: `#rhythm` end-align / `#form-recipe` Dialog foot. Re-paste `consumer-cursor-rule.mdc`. |
| UI · — punctuation (≥ **0.4.147**) | Visible chrome: no middle-dot **`·`** / em-dash **`—`** / decorative en-dash **`–`** as field joiners. Org + dates → List slots; ranges `2025-10 - 2026-03`. Live: `#list` org+dates. Re-paste `consumer-cursor-rule.mdc`. |
| Consume model → GitHub Packages | Day-to-day install is **`@fynn7/ui-design-core`** from `https://npm.pkg.github.com` + Vite/tsconfig alias `@fynns/ui` → `node_modules/@fynn7/ui-design-core/src/index.ts`. **Removed:** git-submodule consume, `consume:sync` / `consume:watch` / `llm/local-consumers.json` / `scripts/sync-to-consumer.mjs`. Package id is `@fynn7/ui-design-core` (not `@fynns/ui-design-core`). Migrate: `.npmrc` + dep + re-wire alias; delete `packages/fynns_ui_design_core` (or `gui/…`) submodule. Local unreleased tries: `file:` / `npm link` / publish. Authority: [`CONSUME.md`](CONSUME.md) / [`docs/package-propagation.md`](../docs/package-propagation.md). |

## Related docs

- Catalog summary + **Platform targeting**: [`AGENTS.md`](../AGENTS.md)
- Install contract: [`CONSUME.md`](CONSUME.md) / [`consume.json`](consume.json)
