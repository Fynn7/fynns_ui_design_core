# Component catalog — Keep set

← back to [Design system index](../DESIGN_SYSTEM.md)

**Breaking surface:** only symbols demoed in sandbox Globals + Layouts + Preview
are public. Removed APIs and migration table:
[`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md). **Surface sync:**
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
  default), FieldHeader / FieldBlock, Select (**soft-deprecated ≥ 0.5.236** —
  anatomy + Pagination carve-out; prefer `DropdownMenu`), Autocomplete
  (**soft-deprecated ≥ 0.5.236** — prefer `SearchBar` / `CommandPalette`),
  OtpInput, NumberInput, SearchBar /
  SearchBarResult, Switch (dense track; `labelSide`), Checkbox, Radio, Chip /
  ChipSet (`assist`|`filter`|`input`|`suggestion` — never table-cell status),
  Slider, ToggleGroup, Tabs (M3 Primary underline)
- **Feedback:** Banner, InlineAlert (phrasing copy only — never nest List /
  FieldStack / CodeBlock inside), LinearProgress / CircularProgress,
  BusyScrim `{ open, label, message?, value?, size?, indicator? }` /
  BusyRegion `{ busy, label, children?, message?, value?, size?, fill?,
  indicator? }` (soft frosted blur + `--fynns-color-busy-region-mask` when
  children are mounted; empty cold-start ≥ **0.5.191** = chrome only — no
  content-sized mask island; `indicator` `circular`|`linear`; never stack
  ring on bar; `fill` for height-resolved cold-start), EmptyState,
  **Chat** family (see below), Snackbar (`snackbar()` + `<SnackbarHost />`),
  Tooltip, InfoHint

  **Loading placement (hard):**

  | Scene | Use | Do **not** |
  | --- | --- | --- |
  | Full-app block | `BusyScrim` | `EmptyState` + ring; revived `BlockingLoadingOverlay` |
  | Pane cold-start | `BusyRegion` `fill` as FillColumn/shell child **or** PageScroll → `.fynns-content-column` (direct / thin section wrapper hosting only the fill — core ≥ **0.5.136** stretches scrollport + pass-through wrappers so BusyStack centers, does not overflow a collapsed overlay); hide section FieldHint until ready; empty host ≥ **0.5.191** paints chrome without frosted mask island | Nest under content-sized unit-stack/Card; EmptyState as loading; FieldHint + busy in one well; bare `fill` inside PageScroll without the content-column height chain; empty BusyRegion painting a content-sized mask “贴图色块” (fixed in core ≥ **0.5.191**) |
  | Dialog/Card body load | `BusyRegion` (+ `fill` if height resolved); no pager siblings under empty overlay; drawer SearchBar **above** BusyRegion | Bare CircularProgress as body; wrap List+Select+Pagination so chrome flickers |
  | Refresh over existing | BusyRegion around List/table only | Unmount → EmptyState; consumer `surface-*` wash; wrap whole Card |
  | Known % / unknown wait | `linear`+`value` / default `circular`; chrome `min(20rem,100%)` | Stack ring+bar; nest progress in `message` |
  | Button/icon slot | Inline Spinner via `loading` + **`runLoadingTask` / `useLoadingTask`** (≥ **0.5.177**) | Page-level CircularProgress in the slot; bare `setLoading(true)` with no timeout/abort clear path |
  | Multi-action footer | **At most one** `loading` in cluster | Twin `loading={busy}` rings |
  | Card batch CTA + path List rows | **One** ring: batch → Card primary only; per-row → that IconButton only (≥ **0.5.265**) | Card `loading` **and** every row Refresh `loading` for the same run |
  | Section wait + chrome | BusyRegion only; header/foot `disabled` without `loading` | BusyRegion + chrome loading |
  | Zero-result catalog | `EmptyState` (`fill` if sole pane body) | EmptyState as loading; content-sized EmptyState as sole canvas child |
  | Hang / cancel guard | `runBusyTask` / `runLoadingTask` with `timeoutMs` and/or `signal` (+ `onError` for toast) | Forever BusyRegion/Scrim/`loading` when fetch never settles; empty catalog painted as BusyRegion |
  | Pane cold-start fail | Clear busy → `InlineAlert` + short FieldHint + end-align Retry (≥ **0.5.178**) | Permanent `fill`; EmptyState as load-fail shell; silent empty |
  | Confirm while loading | `ConfirmDialog` `onAbort` → `useLoadingTask().abort()` (≥ **0.5.177**) | `blockCloseWhileLoading` with no abort — Cancel/Esc trap forever |
  | Chat generate busy | Pair `ChatComposer` `busy` with `onStop` | `busy` without `onStop` (Send locked / Esc dead) |

  **Error surface pick (hard — consumer AppError maps here; core has no ErrorCode):**

  | Scene | Use | Do **not** |
  | --- | --- | --- |
  | Pane / Card recoverable fail | `InlineAlert` + short hint + end-align Retry | EmptyState as 500 shell; snackbar alone (vanishes) |
  | Persistent app announcement | `Banner` + actions / dismiss | InlineAlert in TopAppBar; snackbar |
  | Instant op result / light fail | `snackbar` (± one action) | Whole-page EmptyState; Banner |
  | Chat generate fail | `ChatMessage` `error` + `onRetry` | Duplicate the same line as InlineAlert |
  | Zero-result catalog | `EmptyState` | EmptyState as loading or as API-fail shell |
  | Field validation | `errorText` / FieldHint error | InlineAlert wrapping one Input |
  | Probe OK/Fail | `.fynns-list-item-status` ± InfoHint danger | Chip / InlineAlert inside List headline |
  | Machine `code` | Consumer `AppError { code, message, … }` → map to the row above | Put ErrorCode / AppError on core `snackbar` API |

  **paint-before-work:** `afterNextPaint` / `yieldToMain` /
  `runBusyTask(setBusy, task, options?)` / `useBusyTask()` /
  `runLoadingTask` / `useLoadingTask` (≥ **0.5.177**) — `flushSync` busy on →
  wait one paint → then run the async task so `CircularProgress` can start
  spinning. Does **not** keep the ring smooth through long sync / WASM compile
  on the main thread (use a Worker or `yieldToMain` slices for that). Prefer
  over `setBusy(true)` then immediately blocking work.
  **Hang guards (≥ 0.5.177):** pass `timeoutMs` and/or `signal` so timeout /
  abort **race** the task and clear busy even when the task ignores
  `ctx.signal`. `onError(err, { reason })` observes (`reject` | `timeout` |
  `abort`) before rethrow — map to snackbar / InlineAlert in the **consumer**
  (do **not** put AppError / ErrorCode on core snackbar). Concurrent runs:
  default `concurrency: "generation"` (stale `finally` must not clear a newer
  busy); `"refcount"` for nested; `"exclusive"` aborts the previous
  controller. Live `#busy-paint` / `#sandbox-busy-task-timeout` /
  `#sandbox-busy-task-abort` / `#sandbox-busy-task-generation` /
  `#sandbox-button-loading-task` / `#sandbox-confirm-loading-trap`.

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
    empty-thread starter prompts = app-owned full-width clickable
    **`Surface` `variant="soft"` `padded` `interactive`** rows inside
    `ChatThread.empty`
    (unit-stack under EmptyState; **outer** edges = `.fynns-chat-composer-shell`
    — stay inside `.fynns-chat-thread-inner` pad; **never** negative-margin
    breakout that flush-aligns with `form.fynns-chat-composer`; **inner** pad =
    equal `--fynns-layout-content-inset` all edges — never rem/`px` or mixed
    block/inline; wrap with text). App-owned rotate: **M3 Shared Axis Y** —
    incoming in-flow rises ~40% + fade (`--fynns-duration-slow` /
    `--fynns-ease-out`); outgoing absolute overlay exits up + fade
    (`--fynns-duration-base` / `--fynns-ease-emphasized`); reduced-motion =
    instant. `interactive` = Button-grammar state-layer hover/press. Do **not**
    use `Chip`/`ChipSet` or a dedicated starter primitive. Live `#chat` Empty.
  - **Product / session host (default for chat-like UIs):** compose
    **`ClippedNavShell`** (or drill-in with `navKey`; omit TopAppBar on
    new-chat landing) + session **`NavigationDrawer`**
    (`NavigationDrawerNewChat` ghost labeled New chat + optional More; empty
    list `EmptyState` sm; session Items **label-only by default** — leading
    `icon` opt-in only when the glyph carries meaning ≥ **0.5.298**; row
    trailing prefer More; footer account) + main
    **`FillColumn` → `Chat`**. **New-chat landing:** greeting `EmptyState` +
    soft starters **centered above**; **`ChatComposer` inside `ChatThread.empty`**
    pinned to the column bottom with the same
    `--fynns-chat-composer-inset-block` as a docked Chat composer (collapse
    docked composer row). Active thread: composer under `ChatThread` inside
    Chat. Flat **destination** roots stay on `DestinationAppShell`. Do **not**
    put `ChatComposer` in FillColumn `footer` or use `PageScroll` as the chat
    main scroll. Live `#layouts-demo-chat-product` /
    `#sandbox-navdrawer-session-chrome` (clean) /
    `#sandbox-navdrawer-session-icon` (opt-in icon). Failure: CONSUMER_TREATY
    chat product / session host wrong tree /
    session history leading icon by default.
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
    [`llm/CHAT_COMPOSER_LAYOUT.md`](../../llm/CHAT_COMPOSER_LAYOUT.md).
  - **Message entrance:** newly mounted `ChatMessage` rows enter with a
    tokenized rise/fade after `ChatThread`'s first paint. Wrap keyed non-message
    results in `ChatReveal` (including blocks added inside an existing answer);
    initial history stays still, and reduced motion paints immediately. Main
    and EndAside use the same behavior. Live `#layouts-demo-chat-product` /
    `#layouts-demo-chat-aside`. See [`CHAT_MOTION.md`](../../llm/CHAT_MOTION.md).
  - **Message lifecycle:** `streaming` = last-glyph color pulse only while answer
    text exists + `aria-busy`; `error`/`onRetry` = failed-generation footer;
    `thinking`/`ChatThinking` = single-block reasoning (Wave 1); `ChatActivity`/
    Step = multi-step tool tree (Wave 2 — **minimal** ≥ **0.5.272**: default
    status **mark** + continuous rail, no default tool icons / file artifacts;
    step band **2rem** + gap `unit-stack-gap` ≥ **0.5.273**;
    **done** marks = Timeline accent ≥ **0.5.274**;
    pulse rail masked under mark ≥ **0.5.275**;
    pending wash opaque + rail ends at last mark ≥ **0.5.276**;
    optional `icon` / `ChatActivityArtifact` for rare dense hosts; label tense:
    **active** = *-ing*, **done** = past; header may summarize latest completed
    milestone while later step still streams). `citations`/`ChatCitations`/
    `ChatCitationChip` under assistant (Tooltip `side="bottom"`). Idle
    `actions`: IconButton + Tooltip for Copy / Regenerate + More menu.
    Body sibling stack gap **16dp** from core — bare strings promoted to
    `.fynns-chat-message-prose`; do **not** patch with consumer CSS. ARIA:
    [`llm/CHAT_ARIA_PARITY.md`](../../llm/CHAT_ARIA_PARITY.md). User edit UX (not in
    core yet): [`llm/CHAT_USER_EDIT_UX.md`](../../llm/CHAT_USER_EDIT_UX.md). Live
    `#activity` / `#thinking`.
- **Overlay / sheets:** Dialog / DialogShell / ConfirmDialog / FullscreenDialog
  (M3 basic + full-screen only). `ConfirmDialog` = title + supporting + foot
  (no close). `Dialog` optional `showCloseButton` for dismissible forms —
  **form bodies** (`FieldStack` / `FieldBlock` / `Textarea` / `CodeBlock`)
  stretch to the `size` ceiling (prefer `size="lg"` / M3 560dp). Centered
  non-confirm head block-start = `--fynns-layout-content-inset` (**18dp**, ≥
  **0.5.280**) — title ink top equals body-end / trailing primary IconButton
  bottom clearance (no consumer head-pad patch). Dismissible
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
  (`.fynns-pagination-bar` = single M3/MUI footer row — never wrap to two rows;
  rows-per-page Select is the **stock** Keep-set Select — 40dp shell +
  portaled `.fynns-select-menu` like `#select` (≥ **0.5.208**); siblings share
  the **40dp shell** band (≥ **0.5.197**); noun|Select|range gap **8dp** /
  start↔end **16dp** (≥ **0.5.202**); never invent a private absolute dock or
  restyle keep-set menu chrome; options = **digits only** + sibling
  `.fynns-table-meta` noun — never `Rows: N` / `Sessions: N` / `每页 N 行` in
  every option)
- **App shells:** **`DestinationAppShell`** (default greenfield — declarative
  `destinations[]` / `title` / optional `leadingExtra` / `trailing` /
  `navFooter` / `children` / optional `aside`). Destinations are **binary**:
  open labeled resizable drawer **or** fully `hidden` — **no** icon-only
  `NavigationRail` densify (`onNavCrowded` **closes**). Flat root destinations
  only — drill-in / dynamic drawer body → hand-compose `ClippedNavShell`
  (`#layouts-demo-drill-in`) and pass **`navKey`** + **`navDirection`**
  (root vs mode / catalog identity; `"back"` on mode exit) so the drawer
  body runs **Shared Axis X** (short slide + fade) while track **width stays
  open** — do **not** hard-swap `nav` or close→reopen the track. Low-level **`ClippedNavShell`**: full-bleed
  TopAppBar + `nav | main`; `navMode` `drawer`|`rail`|`hidden` must match the
  `nav` slot (shell never auto-swaps). Drawer seam resizable (rAF live width;
  commit on pointerup). Crowding watches main-column overflow too; predict
  before open paint; must **not** fire while drawer/EndAside mid-drag or
  EndAside closing. Length reads without measure probes under MutationObserver
  ([`llm/PERF.md`](../../llm/PERF.md)). **`EndAside`:** width morph (≥ **0.5.86**
  track stays mounted — toggle `open` only); desktop leading-edge resize;
  main ≤32rem → end-edge overlay; ≤56.25rem → bottom sheet
  `min(52dvh, 22rem)`. Live `#layouts-demo-shell`.
- **Content:** List / ListItem (selected = `secondary-container` +
  `radius-3xl`; host paints whole-row wash; sibling gap =
  `--fynns-list-item-gap` **4dp**; **no Divider between items**; `--with-end`
  overlay reveal for path catalogs; expandable trees = row `onClick` +
  decorative chevron + `detail` — keep mounted, do not `open ? … : null`),
  Card / Collapsible (`chrome="card"`|`"plain"` — plain = nest-gap, **≠ flush**;
  head actions = interactive chrome only), Surface (untitled well;
  `outlined`|`filled`|`elevated`|`soft` — soft = surface-2, same paint as Banner
  default; `interactive` = M3 state-layer large-button hover/press ≥ **0.5.167**
  (inset focus ring ≥ **0.5.168**); `fill` only when parent height-resolved), Carousel, Divider, Table (host
  built-in `.fynns-table-wrap.fynns-scroll`; nowrap + max-content, with
  clipped plain-text cells capped and tipped by core; cell status =
  `.fynns-table-meta` never Chip), **`RevealMore` + `useRevealMore`** (long
  Card / PageScroll catalogs — Table default **10**/step **10** ≥ **0.5.144**;
  List pass **5**/step **5** via `REVEAL_MORE_LIST_DEFAULT_*` ≥ **0.5.145**;
  foot outside wrap / after List), DiffView, CodeBlock (titled `default`
  **requires** non-empty `label`; else `variant="plain"`; `label` ≠ `language`
  — always pass matching `language` / `codeLanguageFromPath`; editable
  autoGrow default on PageScroll; soft-wrap live highlight ≥ **0.5.52**;
  fill-host overflow gate uses shared min(ta,pre) slack (floor 8px)
  ≥ **0.5.299** so short scripts / textarea-only phantom delta stay
  non-scrollable (no edge fade / selection drift); caret scroll clamped
  to glyph-layer max;
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
  [`.cursor/rules/timeline-catalog.mdc`](../../.cursor/rules/timeline-catalog.mdc)),
  `measureOverflow` / `overflowsBounds` / `measureContentOverflow` /
  `useOverflowBounds`

Theme exports (`applyFynnsThemeMode`, tokens, scrollbar helpers) remain public.
`DialogFrame` (`src/primitives/DialogFrame.tsx`), `Spinner`, floating placement
(`src/primitives/floatingBox.tsx`), Status-tree open
(`src/primitives/statusTreeOpen.ts` / `useStatusTreeOpen.ts`), and ChatActivity
stream timing (`src/primitives/chatActivityPolicy.ts`) are **internal**. Domain
CSS lives
under `src/primitives/css/` — `primitives.css` only `@import`s (see CONTEXT.md
**Architecture seams**).
