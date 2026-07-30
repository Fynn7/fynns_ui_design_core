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
**Short prompts:** still start from `llm/CONSUME.md` (OpenCode rule template:
[`llm/opencode-fynns-ui-consume.md`](llm/opencode-fynns-ui-consume.md)) — do not expect a long task brief.

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
   `IconButton` is a 40dp circular target (ghost / filled / tonal / outlined). Pure
   informational help uses **`InfoHint`**: standalone "i" when there is no
   visible name; for form/inspector rows pass `label` (plain text trigger,
   `cursor: help`, no underline / trailing icon). Not a chrome `IconButton`.
   **Text underlines:** chrome path links (`Breadcrumb`) stay undecorated —
   ancestors are real `Button` `ghost` `sm` (stadium + state-layer); body links
   (`TextLinkButton`) keep a resting solid underline; import/diff actions
   (`DottedLinkButton`) keep dotted. Do not strip underlines from the latter
   two. Tooltips also describe *dynamic* state (e.g. why a control is
   disabled).
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
- **DON'T** invent private radius CSS variables outside `--fynns-radius-*`
  (e.g. `--fynns-searchbar-container-radius`, `--fynns-selection-box-radius`,
  `--fynns-<component>-*-radius`). Corner radius **must** use
  `var(--fynns-radius-<key>)` from [`RADIUS_TOKENS`](src/theme/tokens.ts).
  Every key in `RADIUS_TOKENS` **must** appear in the sandbox Components shape
  inspector (editable slider or explicit read-only row). If a new radius step is
  required, add it to `RADIUS_TOKENS` **and** to
  [`GlobalsInspector`](examples/sandbox/src/pages/GlobalsInspector.tsx) in the
  same change — never ship a radius token that the GUI cannot show.
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
`toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`, `appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `list`, `datepicker`, `timepicker`, `carousel`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`, plus `misc` (`--fynns-border-hairline`,
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
    `secondary-container`, `on-secondary-container`, `tertiary-container`,
    `on-tertiary-container`, `focus`.
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

Standard chrome glyph: `--fynns-size-icon` (`1rem` / 16dp) + TS `ICON_SIZE`
(default for inline icons / IconButton). Nav / Banner / SearchBar / BottomAppBar /
Toolbar action icons share this. Fab `sm` stays on `--fynns-size-icon-md` (20dp). Dense
micro glyphs (chip trailing, select chevron, steppers) may stay smaller.

Font sizes: prefer t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`;
legacy semantic keys (`caption`, `form-label`, …) remain.

Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`, `toggle-thumb`,
`glow-accent`, `glow-danger`.

Fonts: `--fynns-font-ui` (system), `--fynns-font-mono` (Consolas, then Cascadia/Fira).
`theme.css` resets `code` / `kbd` / `samp` / `pre` onto the mono stack so bare
`<code>` labels never fall back to the browser default monospace.
`--fynns-font-serif` (CMU Serif). Motion: `--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,toggle,fast,flyout,base,slow,pointer,loop-pulse,
loading-spin,loading-skeleton,presentation-hint,reduced-motion-spin}`.

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

Import everything from `@fynns/ui`. Components emit `.fynns-*` classes.

- **Button** `{ variant?: "default"|"primary"|"tonal"|"elevated"|"danger"|"ghost", size?: "md"|"sm"|"lg",
  active?, danger?, iconOnly?, loading? }` + native button attrs. `forwardRef`.
  Default `primary` (M3 filled accent, stadium `radius-pill`, 40dp). `tonal` is
  secondary emphasis (`accent-container`); `elevated` is surface + shadow; `default`
  is outlined; `ghost` is text. All variants share the same size padding /
  `min-height` (M3: prefer one ContentPadding across types — text is not a
  smaller target). `ghost` hover/press fills that stadium via background
  state-layer mix; other variants use `::before` layers
  (`--fynns-state-hover` / `--fynns-state-pressed`) — no scale-on-press.
  `loading` shows a spinner and disables.
- **IconButton** — `Button` with `iconOnly`; defaults to `ghost` (M3 standard).
  40dp circular target (`--fynns-size-icon-target`) with 16dp glyph
  (`--fynns-size-icon`); `primary` / `tonal` / `default` (outlined) / `elevated`
  map to filled / tonal / outlined / elevated. Pass `aria-label`.
- **SplitButton** `{ children, onMainClick, menu, menuOpen, onMenuOpenChange,
  disabled?, mainAriaLabel?, menuAriaLabel? }`.
- **Input** / **Textarea** — `{ invalid?, size?: "sm"|"md", variant?: "filled"|"outlined",
  supportingText?, errorText? }` (+ Input `leading?`/`trailing?`) and native attrs.
  `.fynns-input` / `.fynns-textarea`; hint rows use `.fynns-field-hint`.
  Keep placeholder / external labels — do **not** chase M3 floating-label anatomy.
- **Counter** `{ value, onChange, min?, max?, step?, ariaLabel?, disabled? }` — numeric
  field + press-and-hold steppers (`CounterRoot`, `CounterField`, `CounterSteppers`,
  `CounterIncrement`, `CounterDecrement` for custom layouts via `CounterProvider`).
- **SearchInput** `{ leadingIcon?, trailing?, wrapClassName?, invalid?, size?,
  supportingText?, errorText?, ...inputAttrs }`.
- **SearchBar** `{ value, onChange, ariaLabel, onSearch?, leading?, trailing?,
  expanded?, onExpandedChange?, clearAriaLabel?, children? }` + **SearchBarResult** —
  elevated 56dp capsule for chrome search (`--fynns-radius-3xl`); when `expanded`,
  field + results merge into one docked shell. Result row hover/active uses the
  same `--fynns-radius-3xl` as `NavigationDrawerItem`. Prefer `SearchInput` for dense
  form rows.
- **Banner** `{ text, supportingText?, icon?, actions?, onDismiss?,
  dismissAriaLabel?, variant?: "default"|"tonal" }` — full-width strip under
  TopAppBar (message + actions + dismiss; `--fynns-radius-3xl` long-strip group
  with SearchBar / BottomAppBar / NavigationDrawer items / sheet tops). Prefer
  `InfoBanner` / `WarningBanner` for inline alerts inside panels.
- **List** + **ListItem** `{ headline, supportingText?, overline?, leading?,
  trailing?, trailingSupportingText?, lines?: 1|2|3, selected?, interactive?,
  disabled? }` — M3 content list (56 / 72 / 88dp). Fixed `--fynns-list-leading-width`
  (40dp, matches Avatar `md`) grids icon/avatar columns so headlines share one
  start edge. Leading/trailing glyphs use `--fynns-list-icon-size` (20dp /
  `--fynns-size-icon-md`). Type roles map to the shared font-size ladder (`overline` → `xs`,
  `supporting` / trailing meta → `sm`, `headline` → `md`). Prefer `ListGroup` /
  `ListRow` for sidebar master/detail chrome.
- **DatePicker** `{ value?, defaultValue?, onChange?, displayMonth?,
  defaultDisplayMonth?, onDisplayMonthChange?, minDate?, maxDate?,
  isDateDisabled?, weekStartsOn?: 0|1, labels?, disabled? }` — M3 month
  calendar (`YYYY-MM-DD` local date-only). Docked surface; helpers
  `formatDateValue` / `parseDateValue`. **DatePickerDialog** `{ open,
  onOpenChange, value?, onConfirm, title?, confirmLabel?, cancelLabel?, … }`
  wraps the picker in a centered dialog (draft until OK). Minimal M3 modal
  cues: `--fynns-radius-3xl` shell, supporting selected-date line under the
  title, and hairline dividers between head / calendar / foot (keeps the
  compact calendar; no year menu / huge header).
  **DateRangePicker** `{ value?: { start, end }, defaultValue?, onChange?,
  …same calendar props }` — start-then-end selection with a continuous
  secondary-container strip between accent endpoint discs (range grid uses
  gapless equal columns so the bar abuts; hover preview); complete range +
  click restarts. Helpers share `DateValue` / `formatDateValue` /
  `parseDateValue`. **DateRangePickerDialog** mirrors DatePickerDialog
  (supporting `start – end` line; Confirm needs both).
- **TimePicker** `{ value?, defaultValue?, onChange?, hourCycle?: "h23"|"h12",
  minuteStep?, labels?, disabled? }` — M3 **input** (digital) time picker
  (`HH:mm` 24-hour storage). Hour/minute spinbuttons + optional AM/PM column;
  arrow keys / digit entry. Helpers `formatTimeValue` / `parseTimeValue`.
  Dial / clock face is **out of scope** (do not implement). **TimePickerDialog**
  `{ open, onOpenChange, value?, onConfirm, title?, … }` mirrors DatePickerDialog
  (supporting time line under the title).
- **Carousel** + **CarouselItem** `{ ariaLabel, variant?: "hero"|"multi",
  index?, defaultIndex?, onIndexChange?, showArrows?, showIndicators?,
  prevAriaLabel?, nextAriaLabel? }` — M3 horizontal snap strip (arrows +
  dots; keyboard ←→ Home/End). `multi` peeks neighbors; indices clamp at
  ends (no wrap). Track stays scrollable for drag/swipe but hides the
  scrollbar (chrome is arrows/dots).
- **Select** `{ value, options: (string | { value, label?, disabled? })[],
  onChange, ariaLabel, disabled?, placeholder? }` — same chrome as **SearchBar**:
  `.fynns-search-bar` / `.fynns-search-bar-field` / `.fynns-search-bar-input`,
  open = `.fynns-search-bar--expanded` + docked `.fynns-search-bar-results` /
  `.fynns-search-bar-result` rows (same type + padding; row highlight
  `--fynns-radius-3xl` like `NavigationDrawerItem`). No SearchIcon; trigger
  uses a modest `--fynns-space-md` start inset (not the search leading slot).
  Trailing chevron opens/closes.
- **Autocomplete** `{ value, options, onChange, ariaLabel, placeholder?,
  emptyText?, invalid?, supportingText?, errorText?, disabled? }` — filterable
  text field + docked suggestions using the same SearchBar/Select chrome.
  Prefer `Select` when typing is not needed; prefer headless `Combobox` for
  custom framing.
- **Combobox** — headless search + keyboard list (generic `<Item>`); caller
  supplies `filter`, `onPick`, `renderRow`, `classes`.
- **DropdownMenu** `{ trigger, children, ariaLabel?, align?, open?,
  onOpenChange?, disabled? }` + **DropdownMenuItem** `{ icon?, closeOnSelect? }`
  + **DropdownMenuCheckboxItem** `{ checked, onCheckedChange?, closeOnSelect? }`
  + **DropdownMenuGroup** `{ label? }` + **DropdownMenuLabel** +
  **DropdownMenuSeparator** — M3 menu: portaled flyout (viewport-aware via
  `useFloatingBoxPosition`), section labels / hairline dividers, checkbox rows
  (stay open by default), arrow-key paging + Esc. Prefer over ad-hoc absolute
  menus when the trigger sits in an overflow/scroll ancestor.
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
  accent outline & thumb when checked; handle morphs 18→22dp); no handle icon. Use
  `labelSide="end"` (track then label) in dense
  toolbars so tracks share a left edge with `ToggleGroup` / siblings instead of
  drifting with label length.
  **ControlStack** `{ columns?, gap?, children }` — shared `label | control₁…ₙ`
  grid for multi-row toolbars; each nested `ControlRow` spans the stack via
  CSS subgrid (controls / optional `Grid` flatten with `display: contents`) so
  short rows do not pack the next label into an empty control column.
  Default row gap is `--fynns-layout-control-stack-gap` (omit `gap` unless you
  need a deliberate density override via a `--fynns-space-*` t-shirt key).
  **UnitStack** `{ gap?, children }` — vertical list of *units* (inspector
  fields, HueWheel + help, Collapsible body blocks). Default gap
  `--fynns-layout-unit-stack-gap`. Prefer over ad-hoc margins when stacking
  unrelated blocks; use `ControlStack` when rows share a label column.
  **ControlRow** `{ label, children }` — fixed label column
  (`--fynns-layout-control-row-label`) + controls; alone uses its own row grid,
  inside `ControlStack` spans the shared tracks via subgrid. Gaps:
  `--fynns-layout-control-row-column-gap` (horizontal),
  `--fynns-layout-control-row-gap` (stacked label above controls),
  `--fynns-layout-control-cluster-gap` (siblings in the controls cluster).
  **Grid** `{ x?, y?, gap?,
  children }` — X×Y layout; each axis is a fixed count or `"unbounded"` (default).
  Example: `x={2} y="unbounded"` always keeps 2 columns and grows rows as items
  are added (does not reflow into more columns). Tracks size to `max-content` and
  do not clip / ellipsize cell text — grow the grid instead. Inside `ControlStack`,
  match `columns` to `Grid`’s `x`.

  **Toolbar / unit rhythm** (single source — do not invent ad-hoc gaps):

  | Role | Token / API |
  | --- | --- |
  | Between stacked *units* (inspector fields, help + control blocks) | `--fynns-layout-unit-stack-gap` via **`UnitStack`** |
  | Between `ControlRow`s | `--fynns-layout-control-stack-gap` via **`ControlStack`** |
  | Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
  | Label above controls (narrow / stacked) | `--fynns-layout-control-row-gap` |
  | Sibling switches / chips in one cluster | `--fynns-layout-control-cluster-gap` |
  | Single-line chrome bar (TopAppBar sm / BottomAppBar / SearchBar / Toolbar) | `--fynns-layout-bar-height` |

  Prefer `UnitStack` for vertical unit lists; `ControlStack` + `ControlRow`
  (+ `Grid` for multi-control rows) for labeled toolbar strips. Live sample +
  legend: sandbox **Components → Toolbar / unit rhythm**. Values live in
  [`src/theme/tokens.ts`](src/theme/tokens.ts) (`LAYOUT_TOKENS`); after edits run
  `npm run gen:theme`. Sandbox demo wrap gaps (`--sandbox-row-gap`, …) and the
  same layout knobs are editable in the sandbox **Layout chrome** inspector
  (`SANDBOX_LAYOUT_AGENT_CATALOG` in `examples/sandbox/src/state/baseline.ts`) —
  agents must use that catalog, not ad-hoc gaps.
  **Checkbox** `{ label, checked, onCheckedChange,
  indeterminate?, invalid?, disabled?, …inputAttrs }` — M3 square selection mark
  (18dp) with state layer; real `<input type="checkbox">`. **Radio** `{ label,
  checked, onCheckedChange, name, value, invalid?, disabled? }` — M3 circular
  mark (20dp); group via shared `name`. **ToggleControl** —
  checkbox/radio styled as a switch (same M3 track/thumb as `Switch`); prefer
  `Checkbox` / `Radio` for true selection chrome.
- **ToggleGroup** `{ options, value, onChange, fullWidth?, size?, showCheck? }`
  — M3 **Segmented button** (single-select). Outlined stadium row (`--fynns-segmented-*`),
  40dp (compact 32dp), hairline dividers, selected = `secondary-container` + leading
  check (disable with `showCheck={false}`). Options may include `tip`, `ariaLabel`,
  and `icon` (replaced by the check while selected). Equal-width segments; leading
  slot width is reserved (no column reflow); check fades/scales in with an optical
  label slide (`--fynns-duration-fast` + `--fynns-ease-emphasized`). `fullWidth`
  justifies across the container.
  `role="radiogroup"` + arrow-key paging.
  Prefer over `Chip` filter for exclusive equal-width segments. **Chip** /
  **ChipSet** `{ variant?: "assist"|"filter"|"input", selected?, elevated?,
  leadingIcon?, trailingIcon?, onRemove?, removeAriaLabel? }` — M3 stadium chips (32dp);
  filter uses `aria-pressed` + optional leading check; input uses sibling dismiss
  `IconButton` + `Tooltip` (`removeAriaLabel`). Prefer over `Badge` when interactive; prefer `ToggleGroup` for equal-width
  segmented exclusivity. **Tabs**
  `{ tabs, activeId, onChange, size?: "sm"|"md", fullWidth? }` — primary underline
  indicator (3dp accent), not folder-style tops.
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
  Prefer **List** / **ListItem** for main-content M3 lists.
- **ListRow** / **ListRowSelectable** / **ListRowBody** / **ListRowTitle** /
  **ListRowName** / **ListRowSub** / **ListRowBadges** / **ListRowMain** —
  selectable sidebar rows (normal and bulk-select shells).
- **NavItem** / **NavItemLabel** / **NavItemIcon** / **NavCount** / **NavBrandButton**
  — primary sidebar navigation buttons.
- **TextLinkButton** — inline accent text link control (body/paragraph links:
  resting solid underline — M3/a11y; not a chrome text button). Prefer
  `Button` `ghost` for undecorated toolbar/dialog actions.
- **Breadcrumb** `{ items: { label, href?, onClick?, current? }[], ariaLabel?,
  separator? }` — hierarchical path trail (`nav` + ordered list). Last item
  (or `current`) is plain text with `aria-current="page"`; ancestors compose
  **`Button` `ghost` `sm`** (or the same classes on `<a href>`) — stadium
  radius, compact height, ghost state-layer; accent label. Prefer over
  hand-rolled chevron rows in app chrome.
- **DottedLinkButton** — dotted-underline action link (e.g. import diff rows);
  keep the dotted resting decoration (distinct from TextLink / Breadcrumb).
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
  — drop-in for the `sonner` subset; defaults to **bottom-center** Snackbar-ish
  inverse surface. Enter/exit uses motion tokens (`--fynns-duration-base`,
  `--fynns-ease-emphasized`): slides in from the toaster edge (bottom positions from below,
  top from above) with a fade; dismiss plays the reverse before unmount. **ToastProvider** +
  **useToast** compat; declarative `<Toast>` uses the same animation (bottom-center).
- **AlertMessageBase** `{ severity: "warning"|"error"|"info"|"success", message? }`
  + **WarningBanner / ErrorBanner / InfoBanner / SuccessBanner** — inline panel
  alerts (not the M3 chrome `Banner`).
- **Spinner / PanelSkeleton / BlockingLoadingOverlay** (loading states).
  **LinearProgress** `{ value?, label, stopIndicator? }` / **CircularProgress**
  `{ value?, label, size?: "sm"|"md"|"lg" }` — M3 progress (4dp track, rounded caps,
  determinate track gap + linear stop). Omit `value` for indeterminate (the
  loading ring for unknown waits). Prefer `Spinner` for compact button/inline
  busy; use Progress for known % or section waits.
  **Avatar** `{ src?, alt?, name?, size?: "sm"|"md"|"lg", children? }` — M3 circular
  identity (40dp default); image → children → initials from `name` → person glyph.
  Pass into `CardHeader`’s `avatar` slot.
  **Fab** `{ children, label?, size?: "sm"|"md"|"lg",
  variant?: "primary"|"secondary"|"tertiary"|"surface", lowered? }` — M3 floating
  action (56dp default; sm 40 / lg 96). Color roles map to accent / secondary /
  tertiary containers (or `surface-3` + accent ink). `lowered` drops elevation.
  Pass `label` for Extended FAB. Icon-only needs `aria-label` (+ usually `Tooltip`).
  Shape: md `radius-xl` (16dp), lg `radius-3xl` (28dp); state layers via `::before`.
  **FabMenu** `{ children, ariaLabel, closeAriaLabel?, icon?, expanded?,
  defaultExpanded?, onExpandedChange?, variant?, itemVariant?, align?,
  closeOnSelect? }` + **FabMenuItem** `{ icon, label, onClick?, disabled?,
  variant? }` — M3 Expressive FAB menu: toggle FAB expands 2–6 labeled small
  FABs stacked above it (items portal to `document.body` so Collapsible /
  overflow parents cannot clip them; staggered enter/exit via `data-state`
  closed/open/closing; collapsed footprint stays the toggle; Esc / outside
  click dismiss; default Plus rotates 45° into Close). Prefer a lone `Fab`
  when there is only one primary action.
  **TopAppBar** `{ title?, leading?, trailing?, size?: "sm"|"md"|"lg", scrolled? }` —
  top app bar (`sm` / action row = `--fynns-layout-bar-height` 56dp shared with
  BottomAppBar / SearchBar; md 80 / lg 104). Leading/trailing keep the standard
  40dp `IconButton` so hover discs sit inset in the bar (not edge-flush).
  `--fynns-appbar-actions-gap` between siblings. Title uses medium weight at
  compact type. `scrolled` → surface-1 + shadow (caller owns scroll). Prefer
  `Panel` for sidebar chrome.
  **BottomAppBar** `{ actions?, floatingActionButton?, children? }` — bottom
  action bar (`--fynns-layout-bar-height` 56dp with TopAppBar sm / SearchBar;
  stock M3 is 80dp; `--fynns-radius-3xl` long-strip group with SearchBar /
  Banner / NavigationDrawer items / sheet tops). Actions start-aligned with
  40dp targets; optional FAB sits inside the bar (no cradle cutout). Prefer
  `NavigationBar` for bottom destinations. Prefer **Toolbar** (`docked`) for
  flexible Expressive page actions.
  **Toolbar** `{ variant?: "docked"|"floating", orientation?: "horizontal"|"vertical",
  color?: "standard"|"vibrant", floatingActionButton?, children }` — M3 Expressive
  action chrome (`role="toolbar"`; pass `aria-label`). Height
  `--fynns-layout-bar-height` (56dp). `docked` is full-width long-strip
  (`--fynns-radius-3xl`); `floating` is wrap-content pill (`--fynns-radius-pill`)
  and may stack `vertical`. `vibrant` uses `accent-container`. Optional FAB:
  end slot when docked; beside the capsule when floating. Prefer `ControlStack`
  for labeled inspector rows; prefer `BottomAppBar` / `NavigationBar` when those
  roles fit better.
  **NavigationRail** `{ labelVisibility?, alignment?, children }` +
  **NavigationRailMenu** (menu `IconButton` uses a 48dp hover target /
  16dp glyph via `--fynns-navrail-menu-target` / `icon-size`) /
  **NavigationRailHeader** / **NavigationRailItem**
  `{ icon, label?, active?, alwaysShowLabel?, badge? }` / **NavigationRailBadge** —
  M3 compact vertical destinations (80dp). Active/hover highlight is a square
  wrapping icon + label (`secondary-container`); icon-only stays a 56dp
  pill. Optional badge (dot or count) centers on the icon’s
  top-end corner.
  `labelVisibility`: `labeled` | `selected` | `unlabeled`. Prefer `NavItem` +
  `Panel` for full sidebar rows; icon-only items need `aria-label`.
  **NavigationBar** `{ labelVisibility?, children }` + **NavigationBarItem**
  `{ icon, label?, active?, alwaysShowLabel?, badge? }` — horizontal bottom
  destinations (80dp, 3–5 items). Same labelVisibility + square
  `secondary-container` highlight as the rail; badge via `NavigationRailBadge`
  (count folds into the item accessible name).   Prefer `NavigationRail` on medium+ layouts; pair with `NavigationDrawer`
  `standard` for M3 adaptive expand/collapse (drawer ↔ rail).
  **NavigationDrawer** `{ variant?: "modal"|"standard", open?, onClose?,
  side?, modal?, headline?, children }` + **NavigationDrawerItem**
  `{ icon?, label, active?, badge? }` + **NavigationDrawerHeadline** —
  destination side sheet (280dp dense; stock M3 is 360dp). Modal overlays with scrim (default
  `side="left"`); `standard` is permanent in-layout. Item highlight is a
  full-width row highlight (`secondary-container`, `--fynns-radius-3xl` — same
  long-strip step as SearchBar / Select suggestion rows); trailing badge for counts.
  Prefer generic `Drawer` for inspector / form panels.
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
  `LayoutGridIcon`, `LockIcon`, `SettingsIcon`, `SunIcon`, `MoonIcon`,
  `CalendarIcon`, `ClockIcon`. Components also accept
  your own icon nodes where an `icon` prop exists.

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in
   `src/primitives/primitives.css` using `.fynns-*` + tokens), export from
   `src/index.ts`, document it here, **and add a live sample to the aesthetic
   sandbox** (`examples/sandbox`, typically Components catalog or the Preview
   Card/Collapsible stage). Gallery (`examples/gallery`) is optional extra coverage, not a
   substitute for sandbox.
3. Keep `npm run typecheck` and `npm run lint` green.
