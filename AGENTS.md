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
**Public API purge / migration:** [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
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
3. **Icon actions: tooltip when the glyph is not self-evident — never `title=`.**
   Use `<Tooltip content={…}>` (and an `aria-label` on the `IconButton`); the HTML
   `title` attribute is forbidden (browser-default styling breaks the system).
   `IconButton` is a 40dp circular target (ghost / filled / tonal / outlined).
   **Skip Tooltip** on chrome dismiss/clear whose glyph already means the action
   (Dialog / FullscreenDialog / Drawer / BottomSheet close X, Banner / Snackbar
   dismiss, Chip input remove, SearchBar clear) — keep `aria-label` only.
   Pure informational help uses **`InfoHint`**: standalone "i" when there is no
   visible name; for form/inspector rows pass `label` (plain text trigger,
   `cursor: help`, no underline / trailing icon). Not a chrome `IconButton`.
   **Field header actions** (e.g. expand / reset next to a Textarea label): use
   **`FieldHeader`** / **`FieldBlock`** (label row + trailing `IconButton`s +
   `Tooltip` above the control — not overlaid on the textarea corner). Label
   text is flush with the control’s outer start edge. Default `ghost`; dense
   forms may use `size="sm"`. As the first child of `CardContent`, top inset
   shrinks to `--fynns-space-xs` (Card content block pad is
   `--fynns-layout-content-pad-block` at 16dp; inline stays `content-inset`).
   Do not reinvent this with sandbox-only CSS.
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
4. **Scrollbar discipline.** Every scroll container (`overflow:auto/scroll`) carries the `fynns-scroll` class. Browser-default scrollbars are the most common source of visual drift — never ship them.
5. **Always show loading / empty / error state.** Prefer `LinearProgress` /
   `CircularProgress`, `BusyScrim` (fullscreen blocking) / `BusyRegion`
   (sectional dim + ring + message), `EmptyState`, `Banner` / `Badge`, and
   imperative `snackbar` (+ root `<SnackbarHost />`) for transient feedback. Do
   **not** use deleted Toast APIs (see `llm/BREAKING_PURGE.md`). Color status as
   `danger` / `warning` / `info` / `success`.
6. **Accessibility is on by default.** `aria-label` on every icon-only control,
   `aria-busy` on regions that are loading, `aria-hidden` on decorative SVG, an
   `.sr-only` class for screen-reader-only text, a visible `:focus-visible` ring
   from `--fynns-focus-ring-width` + `--fynns-color-focus`, and keyboard affordances
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
   overlays via `Dialog` /
   `ConfirmDialog` / `Drawer` / `FullscreenDialog` / `BottomSheet` /
   `NavigationDrawer`; blocking / sectional busy: `BusyScrim` (full-viewport
   non-dismissible scrim + focus trap + `CircularProgress` + message) or
   `BusyRegion` (relative dim layer over children; content is `inert` while
   busy); for heavy boots use **`runBusyTask` / `useBusyTask`** (show busy →
   paint → then work) so the ring can start before the main thread blocks;
   do not revive `BlockingLoadingOverlay` or purged `Panel` /
   `PanelCard`;
   **Nested containment** (host → section → field): any `surface-1` (or higher)
   host — page body, Dialog, Drawer, etc. — may group fields with
   `Card variant="outlined"` (or `filled` for emphasis) — **not** `elevated`
   (same surface + stacked shadow). Prefer **`Surface`** for a bordered /
   tonal well with **no** title/actions anatomy (preview iframe, chart stage,
   arbitrary children; default unpadded + optional `fill`). Prefer `FieldBlock`
   for label-row
   IconButtons above the control. Card inline pad uses
   `--fynns-layout-content-inset`; CardContent / Header / Actions **block** pad
   uses `--fynns-layout-content-pad-block` (same as Collapsible body).
   Do not add a second page-level outer
   pad. Consumers choose whether the
   section lives inline or inside an overlay. Simple forms may put fields
   directly on the host (no Card). Avoid semantic-free card-in-card (nest Card
   only when the inner block is an independent interactive subject). Live
   sample: sandbox Globals → Containment → nested section (+ optional Dialog
   host). `Input` / `Textarea` fill the parent width by default (`width: 100%`).
   **progressive disclosure** (reveal results only once they exist); and
   **safety-first interactivity** — disable/refuse a destructive action while
   it is unsafe and say why in a tooltip (e.g. disabling a rescan while a
   conflicting process holds the file), rather than letting it fail.
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
- **DON'T** reintroduce `@radix-ui/*` or `sonner`. Extend the self-developed
  primitives instead. Do not resurrect purged Toast / Popover / Panel APIs
  (see [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md)).
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
`toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`, `appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `list`, `datepicker`, `timepicker`, `carousel`, `breadcrumb`, `pagination`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`, plus `misc` (`--fynns-border-hairline`,
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
(exported from `@fynns/ui`; default for inline icons / IconButton). Nav / Banner /
SearchBar / BottomAppBar / Toolbar action icons share this. Fab `sm` stays on
`--fynns-size-icon-md` (20dp). Dense micro glyphs (chip trailing, select chevron,
steppers) may stay smaller.

Font sizes: prefer t-shirt keys `--fynns-font-size-{xs,sm,md,lg,xl,2xl}`;
legacy semantic keys (`caption`, `form-label`, …) remain.

Shadows: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `flyout`, `tooltip`, `toggle-thumb`,
`glow-accent`, `glow-danger`.

Fonts: `--fynns-font-ui` (system), `--fynns-font-mono` (Consolas, then Cascadia/Fira).
`theme.css` resets `code` / `kbd` / `samp` / `pre` onto the mono stack so bare
`<code>` labels never fall back to the browser default monospace.
`--fynns-font-serif` (CMU Serif). Motion: `--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,tooltip-show-delay,tooltip-skip-delay,toggle,fast,flyout,base,slow,pointer,loop-pulse,
loading-spin,loading-skeleton,presentation-hint,reduced-motion-spin}`.

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

**Breaking surface:** only symbols demoed in sandbox Globals + Preview are
public. Removed APIs and migration table: [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
Import from `@fynns/ui`. Components emit `.fynns-*` classes.

### Keep set (summary)

- **Actions:** Button, IconButton, SplitButton (M3 Expressive: leading action +
  trailing `DropdownMenu`; variants `primary` / `tonal` / `default` /
  `elevated` / `danger` (filled like primary: danger surface + on-accent ink);
  sizes `sm` / `md` / `lg`), Fab, FabMenu / FabMenuItem
- **Fields:** Input, Textarea (`width: 100%` by default; dense multiline; no
  floating label — not full M3 Text Field anatomy), **FieldHeader** /
  **FieldBlock** (label | trailing IconButtons above a control), Select,
  Autocomplete (same docked SearchBar expand shell as Select; open on
  click/type/ArrowDown, not focus alone; hint wrap only when
  supporting/error text), OtpInput, SearchBar / SearchBarResult, Switch,
  Checkbox, Radio,
  Chip / ChipSet (`assist` | `filter` | `input` | `suggestion`), Slider,
  ToggleGroup, Tabs (M3 Primary underline — not a ToggleGroup substitute)
- **Feedback:** Banner (M3 chrome), InlineAlert (fynns in-panel severity — **not**
  M3; soft tonal fill; shares Banner pad/gap/icon tokens; icon tinted, body
  on-surface; long copy wraps — do not confuse with Banner), Badge / BadgedBox,
  LinearProgress /
  CircularProgress, **BusyScrim** `{ open, label, message?, value?, size? }` /
  **BusyRegion** `{ busy, label, children, message?, value?, size? }` (M3-style
  fullscreen non-dismissible scrim or sectional dim + ring + visible message;
  `label` is the progress accessible name and the default visible copy when
  `message` is omitted; `value` in `[0, 1]` for determinate, omit for
  indeterminate; `size` defaults `md`),
  **paint-before-work:** `afterNextPaint` / `yieldToMain` / `runBusyTask(setBusy,
  task)` / `useBusyTask()` — `flushSync` busy on → wait one paint → then run
  the async task so `CircularProgress` can start spinning. Does **not** keep
  the ring smooth through long sync / WASM compile on the main thread (use a
  Worker or `yieldToMain` slices for that). Prefer over `setBusy(true)` then
  immediately blocking work.
  EmptyState, **Snackbar** (`snackbar(message, opts?)` / `snackbar.dismiss(id?)`
  + root `<SnackbarHost />`;
  one at a time, bottom-center; optional single action; `short` / `long` /
  `indefinite`; surface `--fynns-color-toast-surface`, z `--fynns-z-toast`),
  Tooltip (hover opens after `--fynns-duration-tooltip-show-delay`;
  leave hides immediately; focus opens at once; after any tip has shown,
  further tips skip the delay for `--fynns-duration-tooltip-skip-delay` so
  consecutive toolbar hovers are instant; enter fades/slides via
  `--fynns-duration-tooltip` once placement is ready; bubble stays inside the
  viewport via flip/shift + inline `maxWidth` from the floating placer), InfoHint
- **Overlay / sheets:** Dialog / DialogShell / ConfirmDialog (M3 basic shape:
  `radius-3xl`, no default close X on Dialog/Confirm; centered width is
  content-fit by default — `size` only sets the `--fynns-layout-dialog-max-width-*`
  ceiling), Drawer (content side
  sheet ~400dp, open-edge `radius-xl`; always modal), FullscreenDialog, BottomSheet,
  DropdownMenu (+ Item / CheckboxItem / Group / Separator), ContextMenu /
  ContextMenuTrigger
- **Dates / time:** DatePicker / DatePickerDialog / DateRangePicker /
  DateRangePickerDialog, TimePicker / TimePickerDialog
- **Chrome:** TopAppBar, BottomAppBar, Toolbar, NavigationRail (+ Menu / Header /
  Item), NavigationBar / Item, NavigationDrawer (+ Headline / Item), SkipLink,
  Breadcrumb, Pagination
- **Content:** List / ListItem (main-content M3 rows; sidebar destinations use
  `NavigationDrawer` / `NavigationRail` / `NavigationBar` — not deleted
  `ListGroup` / `ListRow`), Card (+ Media / Header / Content / Actions),
  **Surface** (generic bordered / tonal well; any children; no Card anatomy —
  use for preview wells / stages), Collapsible (optional `icon` in the chevron slot — header hover /
  keyboard focus-visible swaps to expand chevron; on `(hover: none)` the slot stays chevron-only;
  open: full-bleed hairline under head; focus = quiet Input-like border),
  Carousel / CarouselItem,
  Divider, Table (+ Head / Body / Row /
  HeaderCell / Cell / Caption), CodeBlock, Stepper, Dropzone, Avatar /
  AvatarGroup
- **Layout helpers:** ControlStack, ControlRow, Grid,
  `measureOverflow` / `overflowsBounds` / `measureContentOverflow` /
  `useOverflowBounds` (dynamic border-box or scroll overflow vs a container or
  the viewport — small public API; prefer over ad-hoc getBoundingClientRect).

  **Toolbar / unit rhythm** (prefer these over ad-hoc `--fynns-space-*`):

  | Role | Token |
  | --- | --- |
  | Between `ControlRow`s in a `ControlStack` | `--fynns-layout-control-stack-gap` |
  | Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
  | Label above controls (narrow) | `--fynns-layout-control-row-gap` |
  | Sibling switches / chips in one cluster | `--fynns-layout-control-cluster-gap` |
  | Control → supporting / error hint (`.fynns-field` / Otp / Autocomplete) | `--fynns-layout-field-hint-gap` (= `unit-stack-gap`) |
  | Vertical stacked units (inspector fields, Collapsible body, sibling demos) | `--fynns-layout-unit-stack-gap` |

  Prefer `ControlStack` + `ControlRow` (+ `Grid` for multi-control rows). Values
  live in `LAYOUT_TOKENS`; sandbox Layout chrome GUI edits them via
  `SANDBOX_LAYOUT_AGENT_CATALOG`.

  **Inset decision tree:** Panel shells (Collapsible, Drawer, Card): equal outer
  inset via `--fynns-layout-content-inset` (18dp) on the **inline** edges.
  Collapsible body and Card content anatomy use shared **block** pad
  `--fynns-layout-content-pad-block` (16dp) so the first control isn’t flush
  under section chrome; Collapsible trigger stays denser (`--fynns-space-sm`).
  Do **not** add a second padding wrapper inside those shells. Stack siblings
  (section label → `InlineAlert` → next block) with
  `gap: var(--fynns-layout-unit-stack-gap)` — never ad-hoc rem margins or a
  second custom status box (use `InlineAlert` for in-panel severity).
  Centered Dialog /
  ConfirmDialog: `--fynns-layout-dialog-inset` (24dp) on head / foot / body
  inline; body block (top = bottom) uses `--fynns-layout-content-inset`.
  Width: content-fit (`max-content`) up to the `size` token ceiling
  (`--fynns-layout-dialog-max-width-*`); at the ceiling, Switch / ControlStack
  labels wrap (body `overflow-x: clip` — no horizontal scrollbar). Do not
  invent consumer width or wrap hacks. Vertical scroll only when body exceeds
  panel `max-height`.
  FullscreenDialog inherits content-inset on head/body. BottomSheet keeps
  asymmetric `--fynns-layout-sheet-pad-inline` / `sheet-pad-block` (M3
  block≠inline). Do not force Snackbar / ListItem onto equal four-side padding.
  Do not substitute raw `--fynns-space-*` for dialog/panel shell insets.
  Sandbox Layout chrome GUI groups these under panel insets / sheet pads /
  shell size (see `SANDBOX_LAYOUT_AGENT_CATALOG` in
  `examples/sandbox/src/state/baseline.ts`).
- **Icons (public subset):** Archive, ArrowLeft, BarChart, Bot, ChevronRight,
  Clipboard, Download, Eye, EyeOff, File, FolderOpen, Info, LayoutGrid, Menu,
  Moon, PanelLeft, PanelRight, Pencil, Plus, Save, Search, Settings, Sparkles,
  Sun, Trash, Undo, Upload — plus any glyph still imported by Globals/Preview.
  Prefer `IconButton` + `Tooltip` over `title=`.

Theme exports (`applyFynnsThemeMode`, tokens, scrollbar helpers) remain public.
`DialogFrame`, `Spinner`, and floating-box helpers are **internal**.

## Adding to the system

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in
   `src/primitives/primitives.css` using `.fynns-*` + tokens), export from
   `src/index.ts`, document it here, **and add a live sample to sandbox
   Globals or Preview** in the same change. Prefer **one live sample +
   Preview switches** for optional anatomy (`icon`, `actions`, …) — do not
   stack every combo in Components. Do not expand the public barrel
   without that demo (see `llm/BREAKING_PURGE.md`).
3. Keep `npm run typecheck` and `npm run lint` green.

<!-- OPENWIKI:START -->

## OpenWiki

This repository uses OpenWiki for agent-facing docs under `openwiki/`. Start with [`openwiki/quickstart.md`](openwiki/quickstart.md), then architecture / workflows / consume.

Local updates: **Agents Hub → OpenWiki** (thin wrap: `openwiki code --update --print` + Cursor Agent CLI `auto` via `cursor-api-proxy`). Brief: [`openwiki/INSTRUCTIONS.md`](openwiki/INSTRUCTIONS.md). Prefer updating source + regenerating over rewriting seeds unless fixing a seed; authority specs stay in this file and `llm/`.

<!-- OPENWIKI:END -->
