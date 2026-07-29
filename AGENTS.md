# AGENTS.md — @fynns/ui-design-core

Authoritative guide for humans and AI agents working with the fynns UI design
system. This is the **single source of truth** for the design language; other
repos should link here, not duplicate it.

## What this is

A dark-teal design system: canonical `--fynns-*` CSS tokens + self-developed,
dependency-free React primitives. Consumed as source via the `@fynns/ui` alias.

**Installing into a consumer repo (submodule + Vite alias):** follow
[`llm/CONSUME.md`](llm/CONSUME.md) and run
`npm run consume:install -- --target <consumer-root>`
(`scripts/install-as-submodule.mjs`). Machine contract: [`llm/consume.json`](llm/consume.json).
Never add this package to a consumer's `package.json` dependencies.

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
   informational help uses **`InfoHint`**: standalone "i" when there is no
   visible name; for form/inspector rows pass `label` (plain text trigger,
   `cursor: help`, no underline / trailing icon). Not a chrome `IconButton`.
   Tooltips also describe *dynamic* state (e.g. why a
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
   `LinearProgress` / `CircularProgress`, `PanelSkeleton`,
   `BlockingLoadingOverlay`, and `toast` (+ the `*Banner`
   primitives). Prefer *layered* loading for heavy boots: an inline pre-mount
   spinner → a full-screen `BlockingLoadingOverlay` while the engine isn't ready
   → a scoped per-action spinner; freeze the whole UI with an overlay during a
   blocking batch run. Use Progress when the fraction is known (upload, batch).
   Color status semantically — `danger` (fatal), `warning`
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
   `Panel`/`PanelCard` for sections; `Dialog` (centered/command), `Drawer`
   (side sheet), and `BottomSheet` (bottom edge) for overlays; **progressive disclosure** (reveal results only
   once they exist); and **safety-first interactivity** — disable/refuse a
   destructive action while it is unsafe and say why in a tooltip (e.g. disabling
   a rescan while a conflicting process holds the file), rather than letting it
   fail.
10. **Language.** Design-system docs, default primitive labels, and source comments
 stay **English or German**. Consumer apps (and the aesthetic sandbox) may offer
 an **English ↔ Chinese** UI locale switch for their own chrome strings; Chinese
 is allowed when the active locale is `zh`. Do not bake CJK into `@fynns/ui`
 default labels — pass localized strings from the app.

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
- Text in this package (docs, default primitive labels, comments) is **English or
 German**. Consumer apps / the sandbox may localize their chrome to Chinese via
 a locale switch — see [README.md](README.md#aesthetic-sandbox).

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
`toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `appbar`, `navrail`, `focus`, `layout`, `scrollbar`, plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases kept: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`, `skeleton-base`, `skeleton-sheen`.
  - Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
    `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
    `accent-ring`, `on-accent`, `accent-container`, `on-accent-container`,
    `secondary-container`, `on-secondary-container`, `focus`.
  - Lines/text: `border` `#0d2e2c`, `border-strong`, `outline-subtle`, `text` `#e2f0ed`,
    `text-muted` `#7a9e98`.
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

- **Button** `{ variant?: "default"|"primary"|"tonal"|"danger"|"ghost", size?: "md"|"sm"|"lg",
  active?, danger?, iconOnly?, loading? }` + native button attrs. `forwardRef`.
  Default `tonal` (`accent-container`, `radius-xl`, 40dp). `default` is the outlined
  border style; `primary` is filled accent. `loading` shows a spinner and disables.
- **IconButton** — `Button` with `iconOnly`; defaults to `ghost` so the control
  reads as the icon itself (no bordered square tile). Pass `aria-label`.
- **SplitButton** `{ children, onMainClick, menu, menuOpen, onMenuOpenChange,
  disabled?, mainAriaLabel?, menuAriaLabel? }`.
- **Input** / **Textarea** — `{ invalid?, size?: "sm"|"md", variant?: "filled"|"outlined",
  supportingText?, errorText? }` (+ Input `leading?`/`trailing?`) and native attrs.
  `.fynns-input` / `.fynns-textarea`; hint rows use `.fynns-field-hint`.
- **Counter** `{ value, onChange, min?, max?, step?, ariaLabel?, disabled? }` — numeric
  field + press-and-hold steppers (`CounterRoot`, `CounterField`, `CounterSteppers`,
  `CounterIncrement`, `CounterDecrement` for custom layouts via `CounterProvider`).
- **SearchInput** `{ leadingIcon?, trailing?, wrapClassName?, invalid?, size?,
  supportingText?, errorText?, ...inputAttrs }`.
- **Select** `{ value, options: (string | { value, label?, disabled? })[],
  onChange, ariaLabel, disabled?, placeholder? }` — custom listbox; options
  portal to `document.body` (anchored, flip top/bottom) so overflow ancestors
  (e.g. Collapsible / scroll panels) do not clip the flyout.
- **Combobox** — headless search + keyboard list (generic `<Item>`); caller
  supplies `filter`, `onPick`, `renderRow`, `classes`.
- **DropdownMenu** + **DropdownMenuItem** `{ trigger, children, ariaLabel?,
  align? }`.
- **Popover** `{ open, onOpenChange, anchorRef, side?, align?, offset? }` —
  positions via `useFloatingBoxPosition` (top/left box coords, no CSS
  transform). Placement tries all four sides (preferred first, then opposite,
  then the rest), auto `align` start/end near viewport edges, shifts the bubble
  inside the viewport margin, and **flips to the opposite side** when the
  preferred side would overlap the anchor after clamping.
  `useAnchoredPosition` returns the raw attachment point (for caret math);
  prefer `useFloatingBoxPosition` / `resolveFloatingBox` when rendering a panel
  with `top`/`left` only.
- **Tooltip** `{ content, side?, align?, interactive?, children, className? }` + **TooltipProvider**
  (compat passthrough). Renders a caret aimed at the trigger's center (preferring
  the child control over the inline wrapper), clamped inside the bubble: dead-center
  when the bubble is centered on the anchor (the default, since alignment prefers
  `center`), and tracking the anchor when the bubble shifts to fit the viewport. Pass **`interactive`** when the bubble
  contains buttons or other controls (pointer events on + delayed hide while the
  cursor is over the bubble). **InfoHint** `{ content, label?, ariaLabel?, iconSize? }` —
  icon-only help glyph, or `label` as a plain help trigger (prefer for
  form/inspector rows; no underline fence, no trailing "i").
- **Dialog** `{ open, onOpenChange, title, visibleTitle?, description?,
  headActions?, variant?: "centered"|"command", size?: "sm"|"md"|"lg",
  showCloseButton?, closeAriaLabel?
  }` — portal + focus-trap + scrim + Esc; centered/command variants fade/scale in
  via the shared frame presence lifecycle. `size` maps to
  `--fynns-layout-dialog-max-width-*` (centered only). **DialogShell** is the low-level shell
  `{ open, onClose, labelledBy?, ariaLabel?, variant?, children }`. **DialogFrame**
  is the shared low-level frame reused by Dialog/Drawer/BottomSheet (`modal?`, `side?`,
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
  **BottomSheet** `{ open, onClose, modal?, title?, description?,
  showCloseButton?, showHandle?, size?: "content"|"half"|"full", actions?,
  closeAriaLabel?, ariaLabel?, className?, children }` — M3 bottom sheet
  ([specs](https://m3.material.io/components/bottom-sheets/specs)):
  `surface-1` container, 28dp top corners, level-1 shadow, visual drag-handle
  chrome (not interactive drag),
  `title-large` headline. Close icon **off** by default (dismiss via Esc/scrim).
  Prefer `Drawer` for desktop side panels.
- **Switch** `{ label, checked, onCheckedChange, ariaLabel?, size?,
  labelSide?: "start"|"end", disabled? }` (`role="switch"`). M3-aligned track /
  thumb (52×32dp proportions, outlined unchecked / soft `accent-24` track +
  accent outline & thumb when checked, fixed-size handle); no handle icon. Use
  `labelSide="end"` (track then label) in dense
  toolbars so tracks share a left edge with `ToggleGroup` / siblings instead of
  drifting with label length.
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
  match `columns` to `Grid`’s `x`. **Checkbox** `{ label, checked, onCheckedChange,
  indeterminate?, invalid?, disabled?, …inputAttrs }` — M3 square selection mark
  (18dp) with state layer; real `<input type="checkbox">`. **Radio** `{ label,
  checked, onCheckedChange, name, value, invalid?, disabled? }` — M3 circular
  mark (20dp); group via shared `name`. **ToggleControl** —
  checkbox/radio styled as a switch (same M3 track/thumb as `Switch`); prefer
  `Checkbox` / `Radio` for true selection chrome.
- **ToggleGroup** `{ options, value, onChange, fullWidth?, size? }`
  — segmented chips. Options may include `tip` (per-segment tooltip) and
  `ariaLabel`. `size="compact"` tightens padding for narrow panels.
  Segments are always equal width (sized to the longest label) with centered
  text; `fullWidth` stretches the group to its container. Chips fill the
  group when it is stretched (a flex/grid child or `fullWidth`). **Chip** /
  **ChipSet** `{ variant?: "assist"|"filter"|"input", selected?, elevated?,
  leadingIcon?, trailingIcon?, onRemove?, removeAriaLabel? }` — M3 chips (32dp);
  filter uses `aria-pressed` + optional leading check; input uses sibling dismiss
  button. Prefer over `Badge` when interactive; prefer `ToggleGroup` for equal-width
  segmented exclusivity. **Tabs**
  `{ tabs, activeId, onChange, size?: "sm"|"md", fullWidth? }`.
- **Collapsible** `{ title, actions?, open?, defaultOpen?, onOpenChange?, children }`
  — **one-shot disclosure section** for agents and apps: pass `title` + `children`
  (optional `actions` / controlled `open`). Chevron, head, trigger, and body chrome
  are built in — do **not** hand-assemble `.fynns-collapsible-*` pieces. Controlled
  via `open` or uncontrolled via `defaultOpen`. `actions` sits outside the toggle
  button. Body stays mounted so open and close both animate height + fade
  (`data-state` open/closed). No head/body hairline (spacing only). Respects
  `prefers-reduced-motion`.
  Reusable utility: `.fynns-expand` / `.fynns-expand-inner`. Use to keep long
  repeated form sections scannable.
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
- **Card** `{ variant?: "elevated"|"filled"|"outlined", interactive?, selected?, disabled? }`
  + anatomy: **CardMedia** `{ src?, alt?, height?, children? }` (custom media via
  `children` when not using a plain image), **CardHeader**
  `{ title, subtitle?, avatar?, action? }`, **CardContent**, **CardActions**
  `{ align?: "start"|"end", disableSpacing? }`, **CardActionArea**. M3-informed
  subject card (distinct from `PanelCard` layout shell). Uses elevation /
  state-layer tokens; elevated+interactive hovers to a stronger shadow;
  `selected` uses `accent-container`. Aesthetic sandbox (`npm run sandbox`) exposes preview
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
  **LinearProgress** `{ value?, label, stopIndicator? }` / **CircularProgress**
  `{ value?, label, size?: "sm"|"md"|"lg" }` — M3 progress (4dp track, rounded caps,
  determinate track gap + linear stop). Omit `value` for indeterminate. Prefer
  `Spinner` for compact button/inline busy; use Progress for known % or section waits.
  **Avatar** `{ src?, alt?, name?, size?: "sm"|"md"|"lg", children? }` — M3 circular
  identity (40dp default); image → children → initials from `name` → person glyph.
  Pass into `CardHeader`’s `avatar` slot.
  **Fab** `{ children, label?, size?: "sm"|"md"|"lg" }` — M3 floating action (56dp);
  pass `label` for Extended FAB. Icon-only needs `aria-label` (+ usually `Tooltip`).
  **TopAppBar** `{ title?, leading?, trailing?, size?: "sm"|"md"|"lg", scrolled? }` —
  top app bar (40 / 80 / 104dp; denser than stock M3). Title uses medium weight
  at compact type. `scrolled` → surface-1 + shadow (caller owns scroll).
  Prefer `Panel` for sidebar chrome.
  **NavigationRail** `{ labelVisibility?, alignment?, children }` +
  **NavigationRailMenu** (menu `IconButton` uses a 48dp hover target /
  24dp glyph via `--fynns-navrail-menu-target` / `icon-size`) /
  **NavigationRailHeader** / **NavigationRailItem**
  `{ icon, label?, active?, alwaysShowLabel?, badge? }` / **NavigationRailBadge** —
  M3 compact vertical destinations (80dp). Active/hover highlight is a square
  wrapping icon + label (`secondary-container`); icon-only stays a 56dp
  pill. Optional badge (dot or count) centers on the icon’s
  top-end corner.
  `labelVisibility`: `labeled` | `selected` | `unlabeled`. Prefer `NavItem` +
  `Panel` for full sidebar rows; icon-only items need `aria-label`.
- **Badge** `{ variant?: "neutral"|"success"|"danger"|"warning"|"info"|"accent", size?: "sm"|"md", icon? }`.
  **Divider** `{ orientation?: "horizontal"|"vertical", inset?, insetStart?, insetEnd? }` —
  M3 hairline separator (`outline-subtle`); `inset` indents both ends by `--fynns-space-lg`
  (16dp). Vertical stretches in a flex row (`align-self: stretch`).
  **Kbd**. **CommandPalette** (generic shell over Combobox + DialogShell).
- Inline icons (dependency-free): `ChevronDownIcon`, `ChevronUpIcon`,
  `ChevronRightIcon`, `ChevronLeftIcon`, `ArrowLeftIcon`, `CloseIcon`,
  `PersonIcon`,
  `InfoIcon`, `SearchIcon`, `AlertCircleIcon`, `AlertTriangleIcon`,
  `CheckCircleIcon`, `CheckIcon`, `PlusIcon`, `SaveIcon`, `TrashIcon`,
  `PencilIcon`, `EyeIcon`, `RocketIcon`, `RefreshIcon`, `ArchiveIcon`, `FileIcon`,
  `FolderOpenIcon`, `UndoIcon`, `DownloadIcon`, `UploadIcon`, `ClipboardIcon`, `ScrollTextIcon`, `TerminalIcon`,
  `BotIcon`, `SparklesIcon`, `PlugIcon`, `GlobeIcon`, `CpuIcon`, `MessageSquareIcon`,
  `BarChartIcon`, `StopIcon`, `PanelLeftIcon`, `PanelRightIcon`, `MenuIcon`,
  `LayoutGridIcon`, `LockIcon`, `SettingsIcon`, `SunIcon`, `MoonIcon`. Components also accept
  your own icon nodes where an `icon` prop exists.

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in
   `src/primitives/primitives.css` using `.fynns-*` + tokens), export from
   `src/index.ts`, document it here, **and add a live sample to the aesthetic
   sandbox** (`examples/sandbox`, typically Globals controls or a Surfaces
   preview). Gallery (`examples/gallery`) is optional extra coverage, not a
   substitute for sandbox.
3. Keep `npm run typecheck` and `npm run lint` green.
