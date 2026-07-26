# AGENTS.md — @fynns/ui-design-core

Authoritative guide for humans and AI agents working with the fynns UI design
system. This is the **single source of truth** for the design language; other
repos should link here, not duplicate it.

## What this is

A dark-teal design system: canonical `--fynns-*` CSS tokens + self-developed,
dependency-free React primitives. Consumed as source via the `@fynns/ui` alias.

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
3. **Every action is an icon button + tooltip — never `title=`.** Use
   `<Tooltip content={…}>` (and an `aria-label` on the `IconButton`); the HTML
   `title` attribute is forbidden (browser-default styling breaks the system).
   `IconButton` paints as the glyph itself (ghost, no bordered tile). Pure
   informational "i" affordances use **`InfoHint`** (standalone icon + tooltip),
   not a chrome `IconButton`. Tooltips also describe *dynamic* state (e.g. why a
   control is disabled).
   **Positioning conventions** (per NN/g, Material 3, Carbon — a tooltip must not
   cover its trigger or the adjacent related content; the caret links the bubble
   to the anchor so it need not touch the text):
   - Icon buttons → default `side="top" align="center"`.
   - Full-width sidebar rows (list items, group headers) → `side="right"` so the
     bubble sits beside the row and never covers the rows above/below.
   - Inline truncated text in main content (table cells, detail fields) → default
     `side="top" align="start"`; never `side="right"` (it would cover the content
     to the right).
   - Never pair `align="center"` with `side="top/bottom"` on a full-width anchor.
4. **Scrollbar discipline.** Every scroll container (`overflow:auto/scroll`)
   carries the `fynns-scroll` class or uses `ScrollArea`. Browser-default
   scrollbars are the most common source of visual drift — never ship them.
5. **Always show loading / empty / error state.** The kit is `Spinner`,
   `PanelSkeleton`, `BlockingLoadingOverlay`, and `toast` (+ the `*Banner`
   primitives). Prefer *layered* loading for heavy boots: an inline pre-mount
   spinner → a full-screen `BlockingLoadingOverlay` while the engine isn't ready
   → a scoped per-action spinner; freeze the whole UI with an overlay during a
   blocking batch run. Color status semantically — `danger` (fatal), `warning`
   (recoverable/render), `info` (static/notice), `success` (ok) — typically as a
   `border-left: 3px solid var(--fynns-color-*)` or a `Badge` variant. Use
   `Badge` variants to build the information architecture (source / mode /
   confirmed-state), not ad-hoc colored text.
6. **Accessibility is on by default.** `aria-label` on every icon-only control,
   `aria-busy` on regions that are loading, `aria-hidden` on decorative SVG, an
   `.sr-only` class for screen-reader-only text, a visible `:focus-visible` ring
   from `--fynns-focus`/`--fynns-color-focus`, and keyboard affordances
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
9. **Layout patterns.** Sidebar + sticky topbar + master/detail shell;
   `Panel`/`PanelCard` for sections; `Dialog` (centered/command) and `Drawer`
   (side sheet) for overlays; **progressive disclosure** (reveal results only
   once they exist); and **safety-first interactivity** — disable/refuse a
   destructive action while it is unsafe and say why in a tooltip (e.g. disabling
   a rescan while a conflicting process holds the file), rather than letting it
   fail.
10. **Language.** UI chrome / code text is **English or German only (no CJK)**.
   The only CJK allowed is genuine user-facing deliverable *content* (e.g. a
   report's optional `中文` section), never UI chrome.

## Hard rules (Do / Don't)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc.
- **DON'T** hardcode raw colors / hex / rgba in component or app CSS. If a value
  is missing, add a token in [`src/theme/tokens.ts`](src/theme/tokens.ts) and run
  `npm run gen:theme`.
- **DON'T** reintroduce `@radix-ui/*` or `sonner`. Every overlay, toggle, and
  toast here is self-developed. Extend these primitives instead.
- **DON'T** rename tokens to non-`--fynns-*` forms. App/teaching-specific tokens
  live in the app under `--afs-*` (automata canvas) or `--dsa-*` (DSA bars,
  pointers, DSU) — never in this core.
- Text is **English or German only** (no CJK), per the workspace language policy.

## Tokens

Source of truth: [`src/theme/tokens.ts`](src/theme/tokens.ts) +
[`src/theme/motionTokens.ts`](src/theme/motionTokens.ts). Generated CSS:
[`src/theme/theme.css`](src/theme/theme.css) (`:root { --fynns-* }` + light
override + reset + scrollbar + reduced-motion). Naming: `--fynns-<group>-<key>`
(the `misc` group has no sub-prefix).

**Light theme:** dark is the default (no attribute). Activate light via
`applyFynnsThemeMode("light")` from `@fynns/ui`, which sets
`data-fynns-theme="light"` on `<html>` and overrides a subset of color/shadow/
scrollbar tokens. `restoreFynnsThemeMode()` reads `localStorage` key
`fynns-theme-mode`.

Groups: `color`, `space`, `size`, `radius`, `shadow`, `state`, `font`, `font-size`,
`font-weight`, `line-height`, `letter-spacing`, `z`, `duration`, `ease`,
`toggle`, `focus`, `layout`, `scrollbar`, plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases kept: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`, `skeleton-base`, `skeleton-sheen`.
- Lines/text: `border` `#0d2e2c`, `border-strong`, `text` `#e2f0ed`,
  `text-muted` `#7a9e98`.
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
  `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
  `accent-ring`, `focus`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `toggle-track`, `toggle-track-hover`,
  `scrollbar-thumb*` (also under the `scrollbar` group).
- State layers (`--fynns-state-*`): `hover` `8%`, `focus` `10%`, `pressed`
  `12%`, `dragged` `16%` — used via `color-mix(...)` for interactive overlays.
- Card lookups (TS only, not CSS vars): `CARD_VARIANT_MAP`, `ELEVATION_TOKENS`.
  M3 reference mirror: [`src/theme/tokens.m3-draft.ts`](src/theme/tokens.m3-draft.ts).

Spacing: prefer t-shirt keys `--fynns-space-{2xs,xs,sm,md,lg,xl,2xl,3xl}`;
legacy numeric keys (`--fynns-space-1` …) remain as aliases.

Font sizes: prefer t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`;
legacy semantic keys (`caption`, `form-label`, …) remain.

Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`, `toggle-thumb`,
`glow-accent`, `glow-danger`.

Fonts: `--fynns-font-ui` (system), `--fynns-font-mono` (Cascadia/Fira),
`--fynns-font-serif` (CMU Serif). Motion: `--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,toggle,fast,flyout,base,slow,pointer,loop-pulse,
loading-spin,loading-skeleton,presentation-hint,reduced-motion-spin}`.

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

Import everything from `@fynns/ui`. Components emit `.fynns-*` classes.

- **Button** `{ variant?: "default"|"primary"|"danger"|"ghost", size?: "md"|"sm",
  active?, danger?, iconOnly? }` + native button attrs. `forwardRef`.
- **IconButton** — `Button` with `iconOnly`; defaults to `ghost` so the control
  reads as the icon itself (no bordered square tile). Pass `aria-label`.
- **SplitButton** `{ children, onMainClick, menu, menuOpen, onMenuOpenChange,
  disabled?, mainAriaLabel?, menuAriaLabel? }`.
- **Input** / **Textarea** — native attrs + `.fynns-input`/`.fynns-textarea`.
- **Counter** `{ value, onChange, min?, max?, step?, ariaLabel?, disabled? }` — numeric
  field + press-and-hold steppers (`CounterRoot`, `CounterField`, `CounterSteppers`,
  `CounterIncrement`, `CounterDecrement` for custom layouts via `CounterProvider`).
- **SearchInput** `{ leadingIcon?, wrapClassName?, ...inputAttrs }`.
- **Select** `{ value, options: (string | { value, label?, disabled? })[],
  onChange, ariaLabel, disabled?, placeholder? }` — custom listbox; options
  portal to `document.body` (anchored, flip top/bottom) so overflow ancestors
  (e.g. Collapsible / scroll panels) do not clip the flyout.
- **Combobox** — headless search + keyboard list (generic `<Item>`); caller
  supplies `filter`, `onPick`, `renderRow`, `classes`.
- **DropdownMenu** + **DropdownMenuItem** `{ trigger, children, ariaLabel?,
  align? }`.
- **Popover** `{ open, onOpenChange, anchorRef, side?, align?, offset? }` +
  `useAnchoredPosition(anchorEl, floatingEl, open, opts)` — flips top/bottom (or
  left/right), auto `align` start/end near viewport edges, clamps to stay in the
  viewport (prefer in-bounds over never covering the anchor), and returns a
  viewport-aware `maxWidth` so floating layers can wrap before painting past the
  window edge. Tooltips use `pos.side` + `pos.align` with
  `floatingTransformForSide`.
- **Tooltip** `{ content, side?, align?, children, className? }` + **TooltipProvider**
  (compat passthrough). Applies `min(token, pos.maxWidth)` so long copy wraps
  near viewport corners instead of being clipped. Enter animation is
  **opacity-only** — never animate `transform` on the bubble (fill-mode would
  override the placement `translate(-50%)` and clip at the window edge).
  Renders a caret aimed at the anchor's center, clamped inside the bubble:
  dead-center when the bubble is centered on the anchor (the default, since
  alignment prefers `center`), and tracking the anchor when the bubble shifts
  to fit the viewport. **InfoHint** `{ content, ariaLabel?, iconSize? }` —
  standalone info glyph + tooltip for help affordances (not an `IconButton` tile).
- **Dialog** `{ open, onOpenChange, title, visibleTitle?, description?,
  headActions?, variant?: "centered"|"command", showCloseButton?, closeAriaLabel?
  }` — portal + focus-trap + scrim + Esc; centered/command variants fade/scale in
  via the shared frame presence lifecycle. **DialogShell** is the low-level shell
  `{ open, onClose, labelledBy?, ariaLabel?, variant?, children }`. **DialogFrame**
  is the shared low-level frame reused by Dialog/Drawer (`modal?`, `side?`,
  `dataState?`); manages enter/exit when `dataState` is omitted. **ConfirmDialog** `{ open, onOpenChange, title, description?,
  children?, confirmLabel?, cancelLabel?, onConfirm, onCancel?, danger?,
  confirmDisabled?, loading?, confirmIcon?, closeAriaLabel? }` — yes/no
  confirmation with a centered bold title, top-right close (X), and a
  right-aligned Cancel + Confirm footer. `danger` makes Confirm destructive;
  `loading` shows a spinner and blocks close (X/Esc/scrim). Labels default to
  English ("Confirm"/"Cancel").
- **Drawer** `{ open, onClose, side?: "left"|"right", modal?, title?, visibleTitle?,
  description?, headActions?, showCloseButton?, closeAriaLabel?, ariaLabel?,
  className?, children }` — side sheet that slides in from `side` (default right).
  Enter/exit animation is handled by `DialogFrame`. `modal` defaults to `true`; pass
  `modal={false}` for a non-modal drawer that leaves the page behind interactive
  (no scroll lock / focus trap / blocking scrim). Width via
  `--fynns-layout-drawer-width`.
- **Switch** `{ label, checked, onCheckedChange, ariaLabel?, size?,
  labelSide?: "start"|"end", disabled? }` (`role="switch"`). Use
  `labelSide="end"` (track then label) in dense toolbars so tracks share a left
  edge with `ToggleGroup` / siblings instead of drifting with label length.
  **ControlStack** `{ columns?, gap?, children }` — shared `label | control₁…ₙ`
  grid for multi-row toolbars; each nested `ControlRow` spans the stack via
  CSS subgrid (controls / optional `Grid` flatten with `display: contents`) so
  short rows do not pack the next label into an empty control column.
  **ControlRow** `{ label, children }` — fixed label column
  (`--fynns-layout-control-row-label`) + controls; alone uses its own row grid,
  inside `ControlStack` spans the shared tracks via subgrid. **Grid** `{ x?, y?, gap?,
  children }` — X×Y layout; each axis is a fixed count or `"unbounded"` (default).
  Example: `x={2} y="unbounded"` always keeps 2 columns and grows rows as items
  are added (does not reflow into more columns). Tracks size to `max-content` and
  do not clip / ellipsize cell text — grow the grid instead. Inside `ControlStack`,
  match `columns` to `Grid`’s `x`. **ToggleControl** —
  checkbox/ radio styled as a switch.
- **ToggleGroup** `{ options, value, onChange, fullWidth?, size? }`
  — segmented chips. Options may include `tip` (per-segment tooltip) and
  `ariaLabel`. `size="compact"` tightens padding for narrow panels.
  Segments are always equal width (sized to the longest label) with centered
  text; `fullWidth` stretches the group to its container. Chips fill the
  group when it is stretched (a flex/grid child or `fullWidth`). **Tabs**
  `{ tabs, activeId, onChange }`.
- **Collapsible** `{ title, actions?, open?, defaultOpen?, onOpenChange?, children }`
  — disclosure row; collapses content behind a clickable header (chevron rotates).
  Controlled via `open` or uncontrolled via `defaultOpen`. `actions` sits outside
  the toggle button. Use to keep long repeated form sections scannable.
- **ListGroup** / **ListGroupHead** / **ListGroupTrigger** / **ListDisclosureToggle**
  / **ListDisclosureToggleSpacer** / **ListTree** / **ListTreeRow** / **ListTreeSlot**
  / **ListTreeBranch** — sidebar master/detail list: collapsible project groups,
  compact tree chevrons, and nested branches. `ListGroupTrigger` integrates chevron
  + title; `ListDisclosureToggle` is chevron-only for split headers or tree rows.
- **ListRow** / **ListRowSelectable** / **ListRowBody** / **ListRowTitle** /
  **ListRowName** / **ListRowSub** / **ListRowBadges** / **ListRowMain** —
  selectable sidebar rows (normal and bulk-select shells).
- **NavItem** / **NavItemLabel** / **NavItemIcon** / **NavCount** / **NavBrandButton**
  — primary sidebar navigation buttons.
- **TextLinkButton** — inline accent text link control.
- **DottedLinkButton** — dotted-underline action link (e.g. import diff rows).
- **PickList** / **PickListItem** — bordered mono pick lists in dialogs.
- **Card** `{ variant?: "elevated"|"filled"|"outlined", interactive?, disabled? }`
  + anatomy: **CardMedia** `{ src?, alt?, height?, children? }` (custom media via
  `children` when not using a plain image), **CardHeader**
  `{ title, subtitle?, avatar?, action? }`, **CardContent**, **CardActions**
  `{ align?: "start"|"end", disableSpacing? }`, **CardActionArea**. M3-informed
  subject card (distinct from `PanelCard` layout shell). Uses elevation /
  state-layer tokens. Aesthetic sandbox (`npm run sandbox`) exposes preview
  toggles + token knobs listed in [README.md](README.md#aesthetic-sandbox).
- **CardOpenButton** — full-width card primary action area (quicklinks).
- **Slider** `{ value, onChange, min?, max?, step?, ariaLabel, disabled? }` —
  styled native range.
- **Panel** (sidebar `<aside>`) / **PanelCard** `{ title, actions?, fill?,
  noScroll?, fillBody? }` / **ScrollArea** (custom scrollbar skin).
- **Toaster** (mount once) + imperative **toast** `toast(msg, opts?)`,
  `toast.message/.success/.error/.warning/.info(msg, opts?)`, `toast.dismiss(id?)`
  — drop-in for the `sonner` subset. Enter/exit uses motion tokens (`--fynns-duration-base`,
  `--fynns-ease-emphasized`): slides in from the toaster edge (bottom positions from below,
  top from above) with a fade; dismiss plays the reverse before unmount. **ToastProvider** +
  **useToast** compat; declarative `<Toast>` uses the same animation (bottom-center).
- **AlertMessageBase** `{ severity: "warning"|"error"|"info"|"success", message? }`
  + **WarningBanner / ErrorBanner / InfoBanner / SuccessBanner**.
- **Spinner / PanelSkeleton / BlockingLoadingOverlay** (loading states).
- **Badge** `{ variant?: "neutral"|"success"|"danger"|"warning"|"info"|"accent", icon? }`.
  **Kbd**. **CommandPalette** (generic shell over Combobox + DialogShell).
- Inline icons (dependency-free): `ChevronDownIcon`, `ChevronUpIcon`,
  `ChevronRightIcon`, `ChevronLeftIcon`, `ArrowLeftIcon`, `CloseIcon`,
  `InfoIcon`, `SearchIcon`, `AlertCircleIcon`, `AlertTriangleIcon`,
  `CheckCircleIcon`, `CheckIcon`, `PlusIcon`, `SaveIcon`, `TrashIcon`,
  `PencilIcon`, `EyeIcon`, `RocketIcon`, `RefreshIcon`, `ArchiveIcon`, `FileIcon`,
  `FolderOpenIcon`, `UndoIcon`, `DownloadIcon`, `ClipboardIcon`, `ScrollTextIcon`, `TerminalIcon`,
  `BotIcon`, `SparklesIcon`, `PlugIcon`, `CpuIcon`, `MessageSquareIcon`,
  `BarChartIcon`, `StopIcon`, `PanelLeftIcon`, `LockIcon`. Components also accept
  your own icon nodes where an `icon` prop exists.

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in
   `src/primitives/primitives.css` using `.fynns-*` + tokens), export from
   `src/index.ts`, and document it here.
3. Keep `npm run typecheck` and `npm run lint` green.
