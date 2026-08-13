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
   text is flush with the control’s outer start edge. Label→control gap is
   `--fynns-layout-field-hint-gap` on `.fynns-field-block__main` (stable for
   wrapped prompts — do not rely on header min-height optical pad). Trailing
   actions stay on the label line (IconButton sm does not inflate the row).
   Default `ghost`; dense forms may use `size="sm"`. Card / Collapsible
   `chrome="card"` body keeps full `--fynns-layout-content-pad-block` (16dp)
   even when `FieldStack` / `FieldBlock` / `FieldHeader` is the first child
   (do not crush to `space-xs` under the head hairline). Inline stays
   `content-inset`. Do not reinvent this with sandbox-only CSS.
   **Text underlines:** chrome path links (`Breadcrumb`) stay undecorated —
   ancestors are real `Button` `ghost` `sm` (stadium + state-layer). Tooltips also describe *dynamic* state (e.g. why a control is
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
   - Chat citation chips under a message body → `side="bottom" align="start"`
     so the preview does not cover the turn text above (flip still moves to
     `top` near the viewport bottom). Prefer this over the Tooltip default.
   - Never pair `align="center"` with `side="top/bottom"` on a full-width anchor.
4. **Scrollbar discipline.** Every scroll container (`overflow:auto/scroll`)
   carries the `fynns-scroll` class. Browser-default scrollbars are the most
   common source of visual drift — never ship them. **Native classic bars on
   `.fynns-scroll` are hidden** so they never steal content width (NavigationDrawer
   badges / chevrons, Dialog Switch tracks, Chat actions, …). Overlay thumbs are
   painted by `src/theme/overlayScrollbar.ts` (fixed portal rails at
   `--fynns-z-toast` so Dialog / Drawer / Sheet hosts stay above `--fynns-z-modal`;
   `pointer-events: none`; no layout / scrollWidth impact). On fine pointer + hover (`(hover: hover) and (pointer: fine)`), overlay thumbs
   are **idle-transparent** and reveal on host `:hover` or `:focus-within` with a
   soft fade (`--fynns-duration-scrollbar` + `--fynns-ease-out`). Touch / coarse
   pointer keeps thumbs tinted when overflowing. Textarea / input hosts hide the
   native bar only (no overlay rail — replaced elements cannot host children).
   Do **not** use `scrollbar-gutter: stable` / `both-edges` (would reserve a permanent
   empty track or inflate pad). NavigationDrawer keeps `--fynns-navdrawer-pad-inline`
   (10dp) only — no pad+scrollbar inflation; do not crush below ~8dp. Carousel tracks
   and SearchBar / single-line `Input` focused fields may hide bars entirely
   (caret scroll; SearchBar also snap navigation).
   Vertical scroll hosts must pin `overflow-x: clip` (not bare
   `overflow: auto`): CSS overflow pairing otherwise promotes x→auto and can
   reserve *block* gutters that clip the first/last pill radii.
5. **Always show loading / empty / error state.** Prefer `LinearProgress` /
   `CircularProgress`, `BusyScrim` (fullscreen blocking) / `BusyRegion`
   (sectional dim + ring + message), `EmptyState`, `Banner` / `InlineAlert` /
   `BadgedBox` (notification overlay), and
   imperative `snackbar` (+ root `<SnackbarHost />`) for transient feedback. Do
   **not** use deleted Toast APIs or the removed pill `Badge` (see
   `llm/BREAKING_PURGE.md`). Color status as
   `danger` / `warning` / `info` / `success`.
6. **Accessibility is on by default.** `aria-label` on every icon-only control,
   `aria-busy` on regions that are loading, `aria-hidden` on decorative SVG, an
   `.fynns-sr-only` class for screen-reader-only text, a visible `:focus-visible` cue —
   soft ring (`--fynns-focus-ring-width` + `--fynns-color-focus` / `accent-ring`),
   quiet border tint (`--fynns-focus-border-mix` into `--fynns-color-border` for
   fields / SearchBar / Select / Autocomplete / editable CodeBlock / Carousel /
   TimePicker / Collapsible), or a state-layer wash on destination rows
   (NavigationDrawer items), and keyboard affordances
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
9. **Layout patterns.** Destination apps: `ClippedNavShell` (full-bleed
   TopAppBar + drawer|rail|hidden; toggle = open↔closed; destination column
   **width-morphs** like `EndAside`) + optional `EndAside`
   inspector; overlays via
   `Dialog` /
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
   `Card` (static head: `title` / optional `icon` / `actions` + always-visible
   body; same shell as Collapsible, no collapse / head hover / chevron). Prefer
   **`Surface`** for a bordered / tonal well with **no** title/actions head
   (preview iframe, chart stage, arbitrary children; default unpadded + optional
   `fill`). Prefer `FieldBlock` for label-row
   IconButtons above the control. Card / Collapsible default `chrome="card"`:
   inline pad `--fynns-layout-content-inset`; body **block** pad
   `--fynns-layout-content-pad-block`. When nesting a **surface-owning child**
   (CodeBlock, Surface, canvas, BusyRegion, …), pass **`chrome="plain"`** —
   Collapsible/Card stays the **main** outer shell; body uses
   **`--fynns-layout-nest-gap`** (four-side pad + column gap) so the child
   insets as a secondary frame.    Nested CodeBlock with **no filename** → `variant="plain"` (titled
   `default` **throws** without a non-empty `label`). **`chrome="plain"` ≠
   flush** — never cancel nest-gap with negative margins, zero body pad, or
   restyle `.fynns-*`.
   Outside Card/Collapsible, wrap nested wells with **`.fynns-nest`** (same
   nest-gap). No title needed → `Surface` alone. Do not add a second
   page-level outer pad. Consumers choose whether the section lives inline or
   inside an overlay. Simple forms may put fields directly on the host (no
   Card). Avoid semantic-free card-in-card (nest Card only when the inner block
   is an independent interactive subject; otherwise outer `chrome="plain"`).
   Live sample: sandbox Globals → Containment → Card / Collapsible
   `chrome="plain"`, Preview → Collapsible / Card chrome toggle.
   `Input` / `Textarea` fill the parent width by default (`width: 100%`).
   **progressive disclosure** (reveal results only once they exist); and
   **safety-first interactivity** — disable/refuse a destructive action while
   it is unsafe and say why in a tooltip (e.g. disabling a rescan while a
   conflicting process holds the file), rather than letting it fail.
10. **Language.** Design-system docs, default primitive labels, and source comments
 stay **English or German**. Consumer apps (and the aesthetic sandbox) may offer
 an **English ↔ Chinese** UI locale switch for their own chrome strings; Chinese
 is allowed when the active locale is `zh`. Do not bake CJK into `@fynns/ui`
 default labels — pass localized strings from the app.
 **Sandbox / core demos must stay product-agnostic:** never paste consumer app
 copy (feature names, providers, routes, domain jargon) into Globals, Preview,
 Layout templates, or primitive defaults — invent generic placeholders instead
 (see Hard rules).
11. **Performance discipline.** Dense inspectors, live token drafts, catalog
 pages, and `ClippedNavShell` crowding checks must not thrash the main thread
 (observer↔probe loops, tip forests, per-tick history). Authoritative rules:
 [`llm/PERF.md`](llm/PERF.md). Agents building playgrounds / shells / token GUIs
 **must** read that file before coding.

## Hard rules (Do / Don't)

- **DO** build UI from `@fynns/ui` components. Reach for an existing primitive
  before writing a new control.
- **DO** style with `--fynns-*` tokens only: `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`, `var(--fynns-shadow-lg)`,
  `var(--fynns-duration-fast)`, etc.
- **DO** group inspector / settings / Dialog form options with **`FieldStack`**
  by **semantic kind** (identity fields together, radio/checkbox choices
  together, preference switches together, …) — not one flat list of FieldBlocks
  / ControlBlocks. Plain FieldBlocks share `field-stack-gap` (12dp);
  FieldBlocks with description/error (no choice cluster) open the next
  sibling to `unit-stack-gap` (16dp); FieldBlocks that host a
  `.fynns-control-cluster` open to `form-cluster-gap` (32dp); sibling
  ControlBlocks open to `unit-stack-gap` (16dp). **Strongly recommend** a
  horizontal `Divider` between adjacent FieldStacks on kind jumps. Live tree:
  sandbox `#form-recipe`.
  See **Toolbar / unit rhythm** → **FieldStack semantic clusters**.
- **DON'T** hardcode raw colors / hex / rgba in component or app CSS. If a value
  is missing, add a token in [`src/theme/tokens.ts`](src/theme/tokens.ts) and run
  `npm run gen:theme`.
- **DON'T** dump consecutive form units as bare Card / Dialog siblings when they
  belong in different semantic groups (or leave related FieldBlocks ungrouped).
  Flat stacks lose the tight-within / wide-between rhythm — use `FieldStack`.
  Do not invent muted `<p>` / subtitle classes for control notes (`ControlBlock`
  / `FieldBlock` `description` instead).
- **DON'T** invent shell / column / chat **insets or gaps** as raw `rem` / `px`
  or a fresh private CSS variable. Reuse an existing `--fynns-layout-*` key
  (or a component token that **aliases** one — e.g.
  `--fynns-chat-thread-pad-inline` → `dialog-inset`). Missing step → add it to
  `LAYOUT_TOKENS`, run `npm run gen:theme`, and expose it in the sandbox Layout
  chrome inspector in the **same** change. Consumers must not redefine
  margins in app CSS — see [`llm/CONSUME.md`](llm/CONSUME.md). Decision tree:
  **Inset decision tree** below.
- **DON'T** invent private radius CSS variables outside `--fynns-radius-*`
  (e.g. `--fynns-searchbar-container-radius`, `--fynns-selection-box-radius`,
  `--fynns-<component>-*-radius`). Corner radius **must** use
  `var(--fynns-radius-<key>)` from [`RADIUS_TOKENS`](src/theme/tokens.ts).
  Every key in `RADIUS_TOKENS` **must** appear in the sandbox Components shape
  inspector (editable slider or explicit read-only row). If a new radius step is
  required, add it to `RADIUS_TOKENS` **and** to
  [`GlobalsInspector`](examples/sandbox/src/pages/GlobalsInspector.tsx) in the
  same change — never ship a radius token that the GUI cannot show.
- **DON'T** park nodded aesthetics only in
  `SANDBOX_DEFAULT_OVERRIDES` (`examples/sandbox/src/state/baseline.ts`). That
  map must stay **empty** — promote into `tokens.ts` + `npm run gen:theme` so
  consumers match sandbox (`npm run check:wysiwyg`).
- **DON'T** ship a Chat-family **container** squarer than the user bubble
  (`--fynns-radius-22` / ChatGPT `rounded-[22px]`). Floor applies to
  `ChatMessage` bubble, citation footnote cards, composer shell, and any new
  Chat* chrome panel — use `radius-22` **or rounder** (`3xl`, `pill`).
  Micro marks stay smaller (`inline code` → `xs`, favicon → `2xs`). Override
  only when the user **explicitly** asks for a squarer Chat container.
- **DON'T** “fix” missing ChatMessage body spacing in the consumer with
  local CSS or one-off wrappers as the **source of truth**. Sibling answer
  units (prose + `CodeBlock`, two wells, …) must get
  `--fynns-chatmessage-body-stack-gap` (**16dp**) from core — bare strings
  are promoted to `.fynns-chat-message-prose` inside `ChatMessage`. Prefer
  element children for markdown; never invent a parallel body-gap token in
  the app. See **Body sibling stack**.
- **DON'T** reintroduce measure probes under `ClippedNavShell` (or any host
  watched by a subtree `MutationObserver`) to resolve CSS lengths — see
  [`llm/PERF.md`](llm/PERF.md).
- **DON'T** default-open dense sandbox inspectors full of `InfoHint`/`Slider`
  after hard refresh; unmount closed catalog/inspector bodies (lazy /
  render-prop). Details: [`llm/PERF.md`](llm/PERF.md).
- **DON'T** reintroduce `@radix-ui/*` or `sonner`. Extend the self-developed
  primitives instead. Do not resurrect purged Toast / Popover / Panel APIs
  (see [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md)).
- **DON'T** drop a sandbox Globals/catalog demo while the symbol stays exported
  from `src/index.ts` (or the reverse: export without demo). Public surface is
  **one allowlist** — sandbox ↔ barrel. Deleting a public component is
  **atomic** in one change: unexport + delete TSX/CSS + remove demo/catalog/i18n
  + update keep-set docs + add a Removed row in `llm/BREAKING_PURGE.md`.
  `npm run check:wysiwyg` enforces export⇒demo, purge∩barrel=∅, and forbids
  companion-parking `src/primitives/<Name>.tsx` components. Half-deletes that
  only edit sandbox historically caused CI to *restore* demos — never do that.
- **DON'T** paste **consumer product content** into this core (sandbox Globals /
  Preview / Layout demos, default labels, i18n samples, docs screenshots used as
  specs). Forbidden: consumer feature names, LLM/provider settings, app routes,
  teaching-domain jargon from a specific consumer, or wholesale “realistic”
  settings cards copied from an app. Use **generic** placeholders only; consumers
  supply their own strings when they copy a recipe (`#form-recipe`, AGENTS
  recipes). Cursor rule: [`.cursor/rules/no-consumer-content.mdc`](.cursor/rules/no-consumer-content.mdc).
- **DON'T** rename tokens to non-`--fynns-*` forms. App/teaching-specific tokens
  live in the app under `--afs-*` (automata canvas) or `--dsa-*` (DSA bars,
  pointers, DSU) — never in this core.
- **DON'T** set main app body / chrome / forms / Chat / Dialog / lists to
  `--fynns-font-serif` (or any serif / “editorial” stack). Default text inherits
  `body { font-family: var(--fynns-font-ui) }`. Serif is reserved — see Tokens
  **Font families**. Do not invent parallel stacks (Inter, Georgia, …) outside
  `--fynns-font-*`.
- Text in this package (docs, default primitive labels, comments) is **English or
  German**. Consumer apps / the sandbox may localize their chrome to Chinese via
  a locale switch — see [README.md](README.md#aesthetic-sandbox).

**Consumer apps (agents in any repo that consumes `@fynns/ui`):** treat this
package as a **function API** — import primitives and pass props / children /
labels only. **Do not** wrap `@fynns/ui` components in local restyles, fork
CSS, or invent parallel variants in the consumer. **Do not** edit submodule
sources for app features (bump the pin). If the keep-set cannot meet the
requirement after exploring `AGENTS.md` + sandbox Globals, **stop and tell the
user explicitly** that the work must land in `fynns_ui_design_core` first, then
the consumer only calls the new API. Install / pin rules:
[`llm/CONSUME.md`](llm/CONSUME.md).

## Tokens

Source of truth: [`src/theme/tokens.ts`](src/theme/tokens.ts) +
[`src/theme/motionTokens.ts`](src/theme/motionTokens.ts). Generated CSS:
[`src/theme/theme.css`](src/theme/theme.css) (`:root { --fynns-* }` + light
override + reset + scrollbar + reduced-motion). Naming: `--fynns-<group>-<key>`
(the `misc` group has no sub-prefix).

**Light theme:** dark is the default (no attribute). Activate light via
`applyFynnsThemeMode("light")` from `@fynns/ui`, which sets
`data-fynns-theme="light"` on `<html>` and overrides a subset of color/shadow/
scrollbar/`code` tokens. `restoreFynnsThemeMode()` reads `localStorage` key
`fynns-theme-mode`.

Groups: `color`, `space`, `size`, `radius`, `shadow`, `state`, `font`, `font-size`,
`font-weight`, `line-height`, `letter-spacing`, `z`, `duration`, `ease`,
`toggle`, `selection`, `chip`, `progress`, `avatar`, `fab`, `fabmenu`, `appbar`, `bottomappbar`, `toolbar`, `searchbar`, `banner`, `chatmessage`, `chat`, `list`, `datepicker`, `timepicker`, `carousel`, `breadcrumb`, `pagination`, `navrail`, `navbar`, `navdrawer`, `focus`, `layout`, `scrollbar`, `code` (CodeBlock highlight roles — see below), plus `misc` (`--fynns-border-hairline`,
`--fynns-opacity-muted`).

Color tokens (`--fynns-color-*`):

- Surfaces (elevation ladder): `app-bg` `#031417`, `surface-1` (panels),
  `surface-2` (flyouts), `surface-3` (tooltips/toasts), `surface-4` (dragged /
  filled card), `surface-5` (reserved). Legacy aliases kept: `surface`,
  `surface-head`, `toast-surface`. Also `surface-muted`, `surface-hover`,
  `control-surface`, `control-surface-hover`, `flyout-item`,
  `flyout-item-hover`, `input-fill`,
  `chat-user-bubble` (quiet Chat user-bubble lift; light override).
- Accent: `accent` `#2dd4bf`, `accent-dim` `#14b8a6`, `accent-hover`,
  `accent-active`, `accent-soft`, `accent-mid`, `accent-24`, `accent-42`,
    `accent-ring` (soft mark for small controls / nav indicators), `on-accent`, `accent-container`, `on-accent-container`,
    `secondary-container`, `on-secondary-container`, `tertiary-container`,
    `on-tertiary-container`, `focus` (faint keyboard ring fill).
  - Focus geometry (`--fynns-focus-*`): `ring-width`, `ring-offset-control`,
    `ring-offset-input`, `border-mix` (accent % into resting border for fields).
  - Lines/text: `border` `#0d2e2c`, `border-strong`, `outline-subtle`, `text` `#e2f0ed`,
    `text-muted` `#7a9e98`.
- Semantic: `success` `#4ade80`, `warning` `#fbbf24`, `danger` `#f87171`,
  `danger-border`, `info` `#60a5fa`.
- Misc: `overlay`, `toggle-track`, `toggle-track-hover`,
  `scrollbar-thumb*` (also under the `scrollbar` group).
- State layers (`--fynns-state-*`): `hover` `8%`, `focus` `10%`, `pressed`
  `12%`, `dragged` `16%` — used via `color-mix(...)` for interactive overlays.
- Elevation lookups (TS only, not CSS vars): `ELEVATION_TOKENS`.
  M3 reference mirror: [`llm/m3-draft-tokens.md`](llm/m3-draft-tokens.md).

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

Fonts: three stacks only — see **Font families** below. Motion:
`--fynns-ease-{standard,emphasized,out,in-out,spring}`,
`--fynns-duration-{instant,tooltip,tooltip-show-delay,tooltip-skip-delay,toggle,fast,flyout,base,slow,
scrollbar,loading-spin,activity,presentation-hint,thinking-shimmer,reduced-motion-spin}`.

**Font families (`--fynns-font-*`) — when to use (agents / consumers):**

| Token | Stack | Use for | Do **not** use for |
| --- | --- | --- | --- |
| `ui` | system-ui / Segoe / Roboto | **Default everything:** page body, chrome, forms, Dialog, Chat, lists, buttons, captions. `theme.css` already sets `body { font-family: var(--fynns-font-ui) }` — prefer inheriting; only set explicitly when resetting a subtree. | — |
| `mono` | Consolas-first | Code only: `CodeBlock`, bare `code` / `kbd` / `samp` / `pre` (already reset in `theme.css`), technical identifiers. | Running prose, UI labels, Chat bubbles |
| `serif` | CMU Serif / Times-like | **Rare** academic / editorial *prose* when the user explicitly asks for formal serif (theorem / definition / proof statements, paper-like reading passages). CMU Serif matches TeX-adjacent teaching tone — **not** a substitute for a math renderer. | App chrome, main body copy, forms, Chat, Dialog, lists, buttons; live formula *rendering* (use KaTeX/MathJax or app math chrome — those bring their own Computer Modern); ASCII / code-like identifiers (`mono`) |

Consumer rule of thumb: if you are about to write `font-family`, stop — inherit `ui` unless the content is literally code (`mono`) or the user demanded serif for a narrow display passage. Never pick serif to make body text “more serious”.

**Code highlight (`--fynns-code-*`):** semantic roles for `CodeBlock` (fg, bg,
comment, keyword, string, number, type, function, variable, property, parameter,
operator, module, constant, constant-named, escape, invalid). Distilled from the
cpptools VS dark/light TextMate themes (last-wins colors) — readable CodeBlock
ink, not a full VS Code grammar. Zero-dep tokenizer in
`src/primitives/codeHighlight/`; no Shiki/Prism. **Consumer custom languages**
(line-command / Raycaster `.gsc` shape): see
[`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md) technical interface
(`SimpleHighlightProfile` / `registerHighlightLanguage`).

For the exhaustive list, read `theme.css` (generated) or `tokens.ts` (typed).

## Component catalog

**Breaking surface:** only symbols demoed in sandbox Globals + Layouts + Preview are
public. Removed APIs and migration table: [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md).
**Surface sync:** `npm run check:wysiwyg` — every barrel value needs a demo (or
companion); Removed-table names must not be exported; never companion-park
`src/primitives/<Name>.tsx`. Import from `@fynns/ui`. Components emit `.fynns-*`
classes.

### Keep set (summary)

- **Actions:** Button, IconButton, SplitButton (M3 Expressive: leading action +
  trailing `DropdownMenu`; variants `primary` / `tonal` / `default` /
  `elevated` / `danger` (filled like primary: danger surface + on-accent ink);
  sizes `sm` / `md` / `lg`), Fab, FabMenu / FabMenuItem
- **Fields:** Input, Textarea (`width: 100%` by default; dense multiline; no
  floating label — not full M3 Text Field anatomy; **autoGrow** height from
  content by default — `minRows`, soft cap `--fynns-layout-textarea-max-height`,
  optional `maxRows` overrides the token; `autoGrow={false}` keeps a fixed well
  + vertical resize; block pad → `--fynns-layout-field-pad-block`), **FieldHeader** /
  **FieldBlock** (label | trailing IconButtons above a control), Select
  (trigger `min-width` floors to the widest option / placeholder so
  content-sized hosts do not resize when the value changes; still
  `width: 100%` in form rows),
  Autocomplete (same docked SearchBar expand shell as Select; open on
  click/type/ArrowDown, not focus alone; hint wrap only when
  supporting/error text), OtpInput, SearchBar / SearchBarResult (narrow hosts
  ellipsis the field value — not mid-glyph hard clip; same on Autocomplete
  **and** single-line `Input`; idle ellipsis / focused caret scroll), Switch
  (dense track only — no `size` / no former md 52×32; `labelSide`
  `start`|`end`),
  Checkbox, Radio,
  Chip / ChipSet (`assist` | `filter` | `input` | `suggestion`), Slider,
  ToggleGroup, Tabs (M3 Primary underline — not a ToggleGroup substitute)
- **Feedback:** Banner (M3 chrome), InlineAlert (fynns in-panel severity — **not**
  M3; soft tonal fill; shares Banner pad/gap/icon tokens; icon tinted, body
  on-surface; long copy wraps — do not confuse with Banner), BadgedBox
  (notification overlay via `NavigationRailBadge` — **not** the removed pill
  label `Badge`),
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
  EmptyState,
  **Chat** / **ChatThread** / **ChatComposer** / **ChatScrollToBottom** /
  **ChatMessage** `{ role, children?, avatar?, name?, streaming?,
  streamingLabel?, error?, onRetry?, retryLabel?, thinking?, citations?,
  citationsLabel?, citationsVisibleCount?, onCitationOpen?, actions? }` (**dual
  placement** — main keeps ChatGPT 70% bubble; aside lifts bubble to 100% to
  match composer shell on long turns; no density mode):
  - **Shell:** `Chat` full-height flex column; soft floor
    `min(var(--fynns-layout-chat-min-width), 100%)` (**no** OS window lock).
    Parent must resolve height — on DestinationAppShell canvas / shell main
    with a Preview (or other) band above Chat, wrap with **`FillColumn`**
    (`header` = Preview, `children` = `Chat`); do **not** stack Preview /
    EmptyState / Composer as canvas siblings (dead band under content height;
    canvas `overflow-y: auto` does not replace a fill column). Aside full-pane
    Chat still uses `.fynns-chat-host--fill` / EndAside (bubble 100%) — not
    FillColumn’s job. Only `ChatThread` scrolls (`role="log"` + `fynns-scroll`);
    composer docks at root bottom; stick-to-bottom + scroll-to-bottom (32dp
    elevated `IconButton`, not Fab; show after ~80dp leave-bottom /
    `--fynns-chat-scroll-threshold`; sit `--fynns-chat-scroll-fab-inset`
    above the **live** composer box — not collapsed `composer-min-height`).
    `empty` prefers `EmptyState`;
    optional starter prompts = `Chip` / `ChipSet` (`suggestion` /
    `assist`, `radius-pill`) **inside** `empty`, centered wrap — they
    sit in the thread **above** the docked composer (do **not** mirror
    ChatGPT’s centered-composer “chips below input”; do not add
    `ChatStarterChip`). Composer stays docked. No built-in markdown /
    Voice Mode / quote-reply / Slack-style
    emoji reactions / attachment upload (`attachments` slot + optional
    dictation hook only). **Parity note (markdown / GFM):** ChatGPT
    renders GFM in assistant turns, including **task-list checkboxes**
    (`- [ ]` / `- [x]`). `@fynns/ui` does **not** — `ChatMessage`
    `children` are opaque; the app owns markdown (and any interactive
    task list, e.g. via `Checkbox`). Do not add a markdown/GFM renderer
    to this primitive. **Parity note (reactions):** ChatGPT and
    Claude.ai ship **thumbs up/down** as vendor quality feedback under
    assistant turns — not multi-emoji reactions (those remain feature
    requests on both). Pass thumbs via the `actions` slot if the app
    needs them; do not add a reaction picker primitive.
    **`actions` recipe (assistant):** `IconButton` + `Tooltip` for **Copy**
    and **Regenerate** (`RefreshIcon`), plus a **More** (`MoreHorizontalIcon`)
    `DropdownMenu` for overflow — hover / focus-within reveal (touch always;
    opacity fade). Core paints chrome only; **consumer agents must
    implement LLM rerun** on Regenerate (same ownership as streaming tokens).
    Failed-turn footer stays `error` + `onRetry` (labeled Regenerate button) —
    do not confuse with idle-turn `actions` regenerate.
  - **Main** (`ClippedNavShell` main): column ceiling
    `--fynns-layout-chat-max-width` / `--fynns-chatmessage-max-width`
    (**48rem**, ChatGPT `max-w-3xl`) — **not** full main / viewport. User
    bubble `--fynns-chatmessage-bubble-max-width` **70%** of that host row
    (short copy shrinks; `radius-22` / ChatGPT `rounded-[22px]`;
    `--fynns-color-chat-user-bubble`; body `1rem` / pad-inline `1rem`).
    Composer = **100%** of the same host (`radius-3xl`, ~44dp collapsed
    shell with 32dp controls + 6dp pad — Cursor-dense circle, one step
    below IconButton md 40dp; not SearchBar 56dp chrome; not viewport
    full-bleed). Thread
    `--fynns-chat-thread-pad-inline` (= `dialog-inset`, 24dp column breath)
    and composer `--fynns-chat-composer-inset-inline` (**aliases the thread
    token**) so the user bubble end edge and composer shell end edge align
    (equal L/R on the capped column; see `llm/CHAT_COMPOSER_LAYOUT.md`).
    Inner radius-3xl expanded text breath: shell pad = strip − glyph-inset,
    textarea glyph-inset so copy aligns with + / Send **glyphs** (text edge
    still at strip-pad); do not conflate column outer inset with shell pad.
  - **Aside** (`EndAside` / `.fynns-chat-host--fill`): host = **100%** of
    aside content (rem ceiling dropped). User bubble ceiling **100%** of that
    host (long turns share composer shell start+end; short still shrinks);
    composer **100%**. Pane soft mins + chat stage min on the shell root.
  - Unchanged under 640px; `assistant` plain; `system` centered muted
    notice (no pill); **`avatar` default omit**; `actions` hover /
    focus-within on the message (opacity fade via
    `--fynns-chatmessage-actions-reveal` → `duration-slow` / `--fynns-ease-out`
    both ways; touch always; reduced-motion snaps);
    `streaming` = caret + `aria-busy` / polite
    live — no LLM; caret only while answer `children` has text (no empty
    bubble / lone caret during thinking-only wait — conditional `null`
    child slots also count as empty); caret height
    `--fynns-chatmessage-cursor-height` (**`1lh`**
    of body line box — thin I-beam, not a rounded stub; width 1dp; color accent); **`error` / `onRetry` / `retryLabel`** = ChatGPT failed-
    generation footer under the assistant turn (danger copy + optional
    Regenerate; wins over streaming / citations / actions);
    **`thinking`** / **`ChatThinking`** = single-block reasoning /
    Agent activity disclosure between `name` and the answer bubble
    (ChatGPT / Claude “Thinking / Thought for Ns”; Cursor-style tool
    status via `streamingLabel` — not only “Thinking”; `.fynns-expand`
    height morph — not Collapsible card chrome; muted trigger).
    **Secondary ink (dark teal):** rest = `text-muted`; hover / active
    emphasis = soft `color-mix` into `text` (never full
    `--fynns-color-text` — VS Code/Vercel jump muted→foreground, which
    reads as a white flash here);     no trigger state-layer wash. Streaming
    = label shimmer (`--fynns-duration-thinking-shimmer` 2s linear,
    muted base + accent-into-muted mid peak — never full `text`) + swap
    enter (`--fynns-duration-base`, opacity fade only — no translateY); no default streaming orb (`icon` is
    optional leading glyph only);
    force-open while streaming unless user pinned closed (trigger stays
    enabled so the disclosure can collapse mid-run; a new streaming cycle
    clears the pin); auto-collapse once when done; user expand sticks;
    no body → static duration strip without chevron; caller owns thought `children` — core does **not**
    parse markdown / CoT; do **not** pipe thinking tokens into
    `aria-live` — see
    [`llm/CHAT_ARIA_PARITY.md`](llm/CHAT_ARIA_PARITY.md); geometry under
    `CHATMESSAGE_TOKENS` `thinking-*`, no `THINKING_*` group;
    `thinking-body-pad-block` aliases `field-stack-gap` so trigger ↔ body
    is not flush).
    **`ChatActivity`** / **`ChatActivityStep`** / **`ChatActivityArtifact`**
    = Wave 2 multi-step agent / tool-call **status tree** (Cursor-style
    collapsible header + vertical rail + `ChatActivityStep` rows).
    **`icon`** is any ReactNode — consumers swap per tool / situation
    (`FileIcon` / `PencilIcon` / `SearchIcon` / …). Omit → `WrenchIcon`
    (`done` / `pending`) or the soft status mark (`active`); `null` →
    empty node (rail still connects). Node box + SVG descendants use
    `--fynns-size-icon`. Optional file capsule + description (icon ↔
    filename gap aliases `--fynns-chatmessage-citation-chip-gap`). Each step
    is its own `ChatActivityStep` with a dedicated `.fynns-chat-activity-step-row`
    (icon | headline label(+artifact); description indented under the band —
    form-style `--fynns-chatmessage-activity-step-min-height` floor, then
    measured max across open steps applied as shared min-height so glyph /
    label / artifact vertically center; rail starts at centered icon bottom).
    Same secondary-ink band as
    ChatThinking (header label inherits muted; active step / artifact
    hover use soft mixes — not full on-surface). Header `label` remounts
    with the same fade-only swap as ChatThinking (no translateY). While
    `streaming`, every newly mounted step fades the **whole row** over
    `--fynns-chatmessage-activity-enter` (aliases `duration-activity` — not
    `presentation-hint` / not chrome `duration-slow`) / `--fynns-ease-emphasized`
    (`--enter` on the step, opacity only). Step shells snap `.fynns-expand`
    `0fr`/`1fr` with **no** height transition — morphing the row clips the
    tree top-to-bottom (`overflow: hidden`) and reads as a bounce. Closed
    shells stay `opacity: 0`. Node + rail stay in the layout box so the
    tree does not desync. Already-visible rows stay still. Growing trees
    need a stable `key` per logical step so
    rows do not morph identity. Static completed trees skip the enter
    flash. Instant-complete `done`
    steps still visualize while streaming: the active mark holds for
    `--fynns-chatmessage-activity-step-min-busy` (aliases
    `presentation-hint`, one pulse) then glyph + artifact play a
    complete one-shot (`--fynns-chatmessage-activity-complete`, aliases
    `duration-activity`; glyph fade, no scale; artifact stays in layout,
    `visibility: hidden` during hold).
    `active` → `done` on the same row skips the hold and plays complete
    (if that row is still entering, complete waits for enter to finish).
    The hold + complete finish even if `streaming` ends mid-pulse;
    steps that already painted as `active` skip the hold;
    `prefers-reduced-motion` skips hold / enter / complete.
    A newly mounted last step stays
    queued (`0fr`, not painted) until earlier holds **and** complete one-shots
    finish, then snaps open + whole-step fade —
    complete and enter never overlap. Uncontrolled: force-open
    while `streaming` unless the user pinned closed (trigger stays
    enabled so the tree can collapse mid-run; a new streaming cycle
    clears the pin). Completed trees stay at last open — no post-stream
    auto-collapse. Also slots via
    `ChatMessage.thinking` (alone or above `ChatThinking`). Keep
    `ChatThinking` for single-block reasoning — do **not** overload it
    into a tool timeline. Geometry: `CHATMESSAGE_TOKENS` `activity-*`.
    **`citations`** / **`ChatCitations`** / **`ChatCitationChip`** =
    browsing source chips under the assistant body (publisher + favicon;
    hover title/snippet preview with Tooltip `side="bottom"` so it does not
    cover the turn text; click opens `href` or `onCitationOpen`;
    +N expands footnote cards at `--fynns-radius-22` — same floor as the
    user bubble, never squarer — no Sources sidebar); `data-message-author-role`
    on each row. **Body sibling stack (hard — 16dp):** adjacent **element**
    children of `.fynns-chat-message-body` use
    `--fynns-chatmessage-body-stack-gap` (aliases
    `--fynns-layout-unit-stack-gap` / same as `.fynns-unit-stack`) — CodeBlock
    + prose, two wells, etc.; not CodeBlock-specific. **Core guarantee:**
    bare string / number `children` are promoted to
    `.fynns-chat-message-prose` so `{text}<CodeBlock/>` still gets the gap —
    consumers must **not** patch this with app CSS or ad-hoc wrappers as the
    primary fix. Consecutive **non-block** children (string + inline `code`,
    …) coalesce into **one** prose unit so caption-style mixes stay inline;
    block wells (`CodeBlock`, `div`/`p`/`pre`, …) stay siblings. Prefer
    element siblings for markdown roots (app `<div>` /
    `.fynns-unit-stack`); nested markdown still stacks inside the wrapper
    with the same layout token. Streaming caret nests inside the last prose
    when that is the trailing unit (same line as text); a caret that remains
    a direct body child after an element is excluded from the gap rule.
    **Inline `code`** (caller-rendered, not markdown): ChatGPT
    prose parity — `--fynns-font-mono`, `--fynns-color-chat-inline-code-bg`
    (text wash via `code-user-bg-mix` 15% dark / 10% light — not ChatGPT
    gray-700), pad `.15rem` / `.3rem`,
    `--fynns-radius-xs` (4px), size `.875em`, weight medium; user bubble uses
    the same wash + tighter pad.
    `pre code` stays unstyled by these rules.
    **ARIA (ChatGPT parity):** skip → `#main`; **prefer** dual `.fynns-sr-only` notify
    regions for respond/complete (app-owned today — not token-live on the
    bubble; core ships `role="log"` on `ChatThread` + `aria-busy` on the
    row). Keep composer focus after send; Send/Stop/dictate labels — full
    contract: [`llm/CHAT_ARIA_PARITY.md`](llm/CHAT_ARIA_PARITY.md). Idle without
    `onDictate`: Send stays visible and is **disabled** when the draft is empty
    (not omitted). With `onDictate`, empty idle still shows Dictate.
  - **Composer keys (ChatGPT parity):** Enter sends; Shift+Enter newline;
    Esc stops while `busy`. **CJK IME:** Enter during composition (or the
    confirming Enter some browsers fire just after `compositionend`)
    commits the candidate only — it must **not** send; a later Enter
    sends. Guarded via `compositionstart`/`end` + `isComposing` /
    `keyCode === 229`.
    **Parity note (composer input model — ProseMirror vs textarea):**
    ChatGPT’s docked prompt is **not** a growing `<textarea>` as the
    primary editor. Captured CSS/DOM (`scripts/_focus-verify/chatgpt-*`):
    parent `.wcDTda_prosemirror-parent` hosts
    `.ProseMirror[contenteditable]` (ProseMirror) after hydration, with a
    `.wcDTda_fallbackTextarea` (`name="prompt-textarea"`, empty height
    `1lh`) for the SSR / no-JS path. The scroll host caps growth with
    `max-h-[max(30svh,5rem)]` + `max-h-52` (~13rem) and `overflow-auto`.
    **Height growth:** a contenteditable block sizes to its paragraphs
    (layout does the grow); the parent scrolls past the cap. A native
    `<textarea>` does **not** — it needs either `field-sizing: content`
    (uneven support) or the classic JS resize (`height: 0` →
    `scrollHeight`, clamp to max). Placeholder wrap can inflate
    `scrollHeight` on empty textareas (narrow panes); ProseMirror uses a
    CSS `::after`/`::before` placeholder instead. **fynns:**
    `ChatComposer` stays a controlled `<textarea>` (`rows={1}`,
    `field-sizing: fixed`, layout-effect auto-grow). Empty value forces
    height to `--fynns-chat-composer-line-height` (32dp) so
    placeholder wrap cannot inflate a narrow EndAside; shell pad is
    `--fynns-chat-composer-pad-inline` / `pad-block` (~6dp equal inset
    around the Send/Stop circle). Without a leading
    control, textarea start adds pad so text lands at
    `--fynns-layout-strip-pad-inline` (Banner breath on the text side only).
    Outer form inset aliases `--fynns-chat-thread-pad-inline` →
    `dialog-inset` (column breath, not strip-pad). **Multiline layout** is model C
    + compact morph (Cursor): collapsed ≈ one horizontal row (~44dp = 32dp
    control + 6dp pad — Cursor-dense circle, not SearchBar 56dp; toolbar
    `display: contents`; `line-height` = 32dp control row); expanded =
    full-width textarea above a bottom `role="toolbar"` (leading start,
    Send end) with shell pad `composer-expanded-pad-inline` /
    `composer-expanded-pad-block` (= strip-pad − glyph-inset), textarea
    `composer-glyph-inset` so copy shares + / Send **glyph** edges (text
    at strip-pad from shell), **8dp** text↔toolbar gap
    (`composer-expanded-gap`), and `composer-text-line-height` (22dp).
    Height auto-grows from `scrollHeight` after the expanded morph
    (remeasures when `data-expanded` flips) — never leave icons vertically
    centered beside tall text. **Do not auto-collapse a non-empty draft:**
    EndAside / narrow hosts morph width when `data-expanded` flips, so
    expand↔collapse can hit `Maximum update depth exceeded` and blank
    `#root`. Collapse only when the value is cleared. Spec:
    [`llm/CHAT_COMPOSER_LAYOUT.md`](llm/CHAT_COMPOSER_LAYOUT.md).
    Collapsed shell ≈ 44dp (`--fynns-radius-3xl`). Cap:
    `--fynns-chat-composer-max-height` (13rem).
    Plain-text prompts only, zero ProseMirror dependency. Do **not** swap
    to contenteditable for visual parity alone.
    **Parity note (paste):** Upgraded ChatGPT ProseMirror keeps rich HTML
    (bold/lists/headings per schema); pure `text/plain` that looks like
    Markdown is parsed into rich nodes; code marks stay literal. Native
    `<textarea>` strips HTML to plain and never Markdown-parses — that is
    the intentional fynns composer model until a rich editor is adopted.
    **User edit (ChatGPT parity — not built into core yet):** pencil under
    the bubble → **inline** host-width Cancel/Send surface (does **not**
    replace the docked composer); Send forks + `< N/M >` branch picker.
    Full UX: [`llm/CHAT_USER_EDIT_UX.md`](llm/CHAT_USER_EDIT_UX.md).
  - **Parity note (`prefers-reduced-motion`)** — ChatGPT (captured CSS in
    `scripts/_focus-verify/chatgpt-{root,conversation}.css`) vs `@fynns/ui`:
    - **Streaming caret:** ChatGPT’s default `.result-streaming` trailing
      `●` is **static** (no animation). The optional `.pulse` / `pulseSize`
      scale loop is **not** killed under `prefers-reduced-motion: reduce`
      (hard-coded `animation: … pulseSize`). Related streaming motion that
      **does** respect reduce: text color-decay, content-enter fade; working
      wave dots / `.pulsing-dot` only run under `no-preference`. **fynns:**
      `.fynns-chat-message-cursor` blink → `animation: none; opacity: 1`
      under reduce (plus global `theme.css` instant durations).
    - **Scroll-to-bottom:** ChatGPT CSS only positions the control
      (`--thread-scroll-to-bottom-banner-offset`); no dedicated enter/exit
      motion found. Smooth-scroll utilities are gated
      (`not-motion-reduce:…scroll-smooth`); carousels set
      `scroll-behavior: auto` under reduce. **fynns:** `Chat.scrollToBottom`
      uses `behavior: "auto"` when reduce matches (else `"smooth"`); FAB
      itself has no enter animation.
    - **Shell transitions:** ChatGPT disables page↔page / sidebar **View
      Transitions** under reduce (`::view-transition { display: none }`) and
      zeros model-picker / chrome menu transitions. Orphaned
      `float-sidebar-in/out` keyframes exist but are unused in the dump.
      **fynns:** composer focus border transition → none; `EndAside` /
      `ClippedNavShell` width-morph durations → `0` via `matchMedia`.
    Evidence dumps only — re-check live ChatGPT if product CSS drifts.,
  **Snackbar** (`snackbar(message, opts?)` / `snackbar.dismiss(id?)`
  + root `<SnackbarHost />`;
  one at a time, bottom-center; optional single action; `short` / `long` /
  `indefinite`; surface `--fynns-color-toast-surface`, z `--fynns-z-toast`),
  Tooltip (hover opens after `--fynns-duration-tooltip-show-delay`;
  leave hides immediately; focus opens at once; after any tip has shown,
  further tips skip the delay for `--fynns-duration-tooltip-skip-delay` so
  consecutive toolbar hovers are instant; enter fades/slides via
  `--fynns-duration-tooltip` once placement is ready; bubble stays inside the
  viewport via flip/shift + inline `maxWidth` from the floating placer), InfoHint
- **Overlay / sheets:** Dialog / DialogShell / ConfirmDialog / FullscreenDialog
  (**M3 variants** — official catalog is basic + full-screen only):
  | Role | API | Close | Notes |
  | --- | --- | --- | --- |
  | Basic confirm | `ConfirmDialog` | none | Title + supporting text + foot actions; `dialog-inset`. |
  | Basic content | `Dialog` (`showCloseButton` default **false**) | optional | Same M3 basic shell (`radius-3xl`, content-fit width / `size` ceiling). Optional X is a web extension for dismissible forms — **not** a separate component. |
  | Full-screen | `FullscreenDialog` | leading X | `content-inset` header; mobile-first long tasks. |
  **Dismissible Dialog + ControlStack** (do **not** invent a parallel
  `SettingsDialog` / Preferences shell): `Dialog` + `showCloseButton` +
  full-width `ControlStack` / `ControlRow` / `Switch`. Live sample: sandbox
  Globals → Containment overlays → Open Dialog with close (not the InfoHint
  demo). **Row recipe (hard):** one visible name = `ControlRow` `label`;
  `Switch` uses `label=""` + matching `ariaLabel` (track only at the end).
  **Do not** put a second visible Switch `label` / `labelSide="end"` copy on
  the same row, and **do not** treat Globals `#info-hint` (`ControlRow` +
  labeled Switch + trailing `InfoHint`) as a Dialog / Preferences template —
  that demo is InfoHint anatomy only. Add `InfoHint` only where help is
  needed (dense rows prefer plain labels — see [`llm/PERF.md`](llm/PERF.md)).
  No forced uppercase on `ControlRow` captions — pass the casing you show.
  Centered panel CSS stretches the stack (`width: 100%`, label `1fr`,
  controls `max-content`) and optically shifts the close IconButton so the
  **CloseIcon glyph** end edge (not the 40dp hover disk) shares the Switch
  track end edge (`panel − dialog-inset`). Do not wrap body in extra padding
  or keep toolbar `max-content` stacks inside Dialog.
  Drawer (content side sheet ~400dp, open-edge `radius-xl`; always modal),
  BottomSheet, DropdownMenu (+ Item / CheckboxItem / Group / Separator),
  ContextMenu / ContextMenuTrigger
- **Dates / time:** DatePicker / DatePickerDialog / DateRangePicker /
  DateRangePickerDialog, TimePicker / TimePickerDialog
- **Chrome:** TopAppBar (**edge-flush** — no outer radius / no card frame;
  greenfield via DestinationAppShell / `ClippedNavShell.topBar`), BottomAppBar,
  Toolbar (docked / floating — use floating when a rounded tool strip is needed),
  NavigationRail (+ Menu / Header /
  Item), NavigationBar / Item, NavigationDrawer (+ Headline / Group / Item;
  Headline = static section label; Group = collapsible Cursor-style folder row
  with optional leading `icon` any ReactNode + indented items), SkipLink,
  Breadcrumb, Pagination
- **App shells:** **`DestinationAppShell` (default greenfield template)** —
  declarative `destinations[]` / `title` / optional `leadingExtra` /
  `trailing` / `children` / optional `aside` (not assumed Chat). Internally
  wires `ClippedNavShell` + `TopAppBar` +
  Drawer|Rail + optional `EndAside` and auto-densifies to rail on narrow (~900px)
  or crowding — agents **must** use this unless the user specifies another
  template. Demo: sandbox **Layout templates** `#layouts-demo-shell`.
  Low-level **ClippedNavShell** (full-bleed `TopAppBar` + `nav | main`
  under it — M3 clipped; no topbar×sidebar crosshair; `navMode`
  `drawer`|`rail`|`hidden` drives column width via `--fynns-navdrawer-width` /
  `--fynns-navrail-width` / `0`. Open↔closed **width-morphs** the destination
  track (two grid columns → `0px`; shell keeps the last `nav` through
  `--fynns-duration-flyout` so consumers may pass `null` when hidden).
  TopAppBar leading toggle is **open ↔ closed**
  only; `"rail"` is for automatic crowding via `onNavCrowded` **and** for
  narrow viewports (apps should pass `rail` below ~900px — do not keep a
  labeled `drawer` mode that stacks above the canvas).
  **Consumer sync (slot API only):** `navMode` and the `nav` slot must match
  (`drawer`→`NavigationDrawer`, `rail`→`NavigationRail`); the shell never
  auto-swaps. Prefer `DestinationAppShell` so agents never hand-sync this.
  A rail-width track still hosting a labeled drawer is a
  **squashed drawer** (narrow strip + body scrollbar) — not a real rail.
  Pasteable consumer rule: [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md).
  In `drawer` mode the nav|main seam is **resizable** (local
  `--fynns-navdrawer-width`; drawer fills the grid track; clamped by absolute
  `--fynns-navdrawer-min-width` / `max-width` rem tokens and remaining room for
  main / EndAside mins — do not use `%` in those tokens). Live drag paints the
  CSS variable directly (rAF) and commits React width on pointerup so the seam
  tracks the pointer without per-pixel re-renders. `onNavCrowded` also
  watches **main-column** overflow (canvas + `EndAside` floors vs the main
  track), not only the outer shell scrollWidth — also when shrink-to-fit hides
  overflow (drawer track starves main below `main-min` + `end-aside-min`, or
  nav column ≥ main while EndAside is open).   On open, crowding is predicted from
  **target** drawer width (`wouldClippedNavDrawerCrowd(shellEl, { endAsideOpen })`)
  in `useLayoutEffect` **before** applying `navMode="drawer"` paint — if the open
  width would crowd, densify to `"rail"` first so destinations never flash as a
  full labeled drawer then snap. Export is also available for apps that open
  destinations themselves. It **must not** fire while the
  drawer seam is being dragged or while `EndAside` is in `data-state="closing"`
  (closing morph would otherwise false-trip overflow and collapse labeled
  drawer → rail). Crowding length reads (`readVarPx` / `readRemPx`) resolve
  `px`/`rem`/`%`/`clamp()` **without** inserting measure probes into the shell
  root — probes under a `subtree` `MutationObserver` cause idle layout thrash
  (see [`llm/PERF.md`](llm/PERF.md)).
  and
  **EndAside** (end-edge supporting pane with **width** open/close; tokens
  `--fynns-layout-end-aside-width` / `end-aside-max-width` /
  `end-aside-min-width`; canvas preferred size `--fynns-layout-main-min-width`).
  Flex panes use **`min-width: 0`** (not `min(token, 100%)` of the full row —
  that percentage resolves against the parent and overflows when both panes are
  open). Preferred size stays on `width` / `flex-basis`. When
  `.fynns-clipped-nav-shell-main` is ≤32rem (container query — works
  for nested demos), EndAside **overlays** the end edge at its min/preferred
  width (out of flex flow) so both mins stay usable without horizontal overflow.
  Drawer still open + floors overflowing → `onNavCrowded` → rail. Viewport
  ≤56.25rem → bottom sheet (`max-height: min(52dvh, 22rem)` — usable sheet, not a
  thin ribbon). If `navMode` stays `"drawer"` on a narrow viewport,
  CSS stacks that drawer above main (rem-capped); prefer `"rail"` so destinations
  stay a side column. Slot-only — destinations stay in `nav`, inspector
  content in `EndAside` children; toggle IconButtons live in the consumer
  `TopAppBar`. Prefer for destination chrome apps. **Not** `Drawer` (modal
  content side sheet) and **not** a revived `Panel` / `ListGroup` shell. Demo:
  sandbox Layouts (`#layouts-demo-shell`).
- **Content:** List / ListItem (main-content M3 rows; selected =
  `secondary-container` + `radius-3xl` like NavigationDrawerItem / Select /
  menu; sidebar destinations use `NavigationDrawer` / `NavigationRail` /
  `NavigationBar` — not deleted `ListGroup` / `ListRow`), Card (`title` /
  optional `icon` / `actions` + body;
  same shell as Collapsible, static head — no collapse / hover layer / chevron;
  title = `--fynns-font-size-md` + medium; body = `--fynns-font-size-sm` /
  body line-height — do not leave both on inherited root size;
  `chrome="card"` (default) | `chrome="plain"` nesting host (same outer shell;
  body uses `--fynns-layout-nest-gap` — plain ≠ flush),
  old Media/Header/Content/Actions / variant APIs deleted),
  **Surface** (generic bordered / tonal well; any children; no Card head —
  use for preview wells / stages), Collapsible (optional `icon` in the chevron slot — header hover /
  keyboard focus-visible swaps to expand chevron; on `(hover: none)` the slot stays chevron-only;
  open: full-bleed hairline under head; focus = quiet Input-like border; same title/body
  type roles as Card; same `chrome` prop — `plain` = nest surface children with nest-gap
  the main shell),
  Carousel / CarouselItem,
  **Chat** / **ChatThread** / **ChatComposer** / **ChatScrollToBottom** /
  **ChatMessage** (`user` | `assistant` | `system`; dual placement main |
  left/right resizable asides — see Feedback keep-set; user bubble
  `--fynns-chatmessage-bubble-max-width` 70% of the message-row host on
  **main** / `radius-22` / body `1rem` — main: 48rem column; **aside**
  (`.fynns-end-aside` / `.fynns-chat-host--fill`): 100% pane + user bubble
  ceiling **100%** so long turns share the composer shell edges; composer
  100% of same host (`radius-3xl`,
  32dp controls + 6dp pad ≈ 44dp shell); soft mins on the
  pane + `--fynns-layout-chat-min-width` on the shell; **avatar omitted by
  default**; `streaming` caret only with answer text + busy — no LLM; `error` / `onRetry` =
  failed-generation footer — see Feedback keep-set; `thinking` /
  `ChatThinking` = single-block reasoning disclosure (name ↔ bubble; Wave 1)
  — see Feedback keep-set; **`ChatActivity`** / Step / Artifact = Wave 2
  multi-step status tree — see Feedback keep-set; `citations` /
  `ChatCitations` / `ChatCitationChip` = browsing source chips — see
  Feedback keep-set; no built-in GFM /
  task-list checkboxes — see Feedback keep-set; CJK IME Enter while
  composing does not send — see Feedback **Composer keys**; composer is
  a growing `<textarea>` (not ChatGPT ProseMirror; paste stays plain) — see Feedback
  **composer input model**),
  Divider, Table (+ Head / Body / Row /
  HeaderCell / Cell / Caption), CodeBlock (**strict chrome** — titled
  `default` **requires** non-empty `label` (filename) + head hairline + copy;
  missing / empty / whitespace `label` **throws**; no title →
  `variant="plain"` (frame + floating copy only — do not pass `label` or
  `label=""`); `editable` same head rules when `label` is set, omit `label`
  for float-copy; live highlight via pre backdrop + transparent textarea —
  `value`/`defaultValue`/`onChange` (local draft + deferred highlight;
  `onChange` coalesced while typing / flushed on blur); editable height
  defaults to **autoGrow** (content-sized from `rows` floor, default `1`,
  up to `maxHeight`; `autoGrow={false}` for a fixed well or fill hosts that
  set `textarea { height: 100% }`); **`label` ≠ `language`** — filename chrome
  does not select a highlighter; always pass matching `language` /
  `highlightProfile` (see [`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md));
  editable highlight spans inherit
  textarea font-weight (no bold keyword/module metrics — soft-wrap must
  match caret); `wrap` defaults
  **true** (soft-wrap, no horizontal scrollbar; `wrap={false}` → classic
  `pre` scroll); vertical thumb only when content exceeds the host
  (`data-scrollable`, same gate as ChatComposer — avoids early bars from
  pad / trailing-newline noise); focus = quiet Input-like border
  (`--fynns-focus-border-mix`), not an inset ring;
  supported `language` → zero-dep `--fynns-code-*` spans (`ts`/`js`/`py`/`cpp`/
  `css`/`json`/`xml`/`html`/`bash`/… or consumer `registerHighlightLanguage` /
  `highlightProfile`); unknown → plain mono;
  copy fades in on hover, keyboard via :focus-visible), Stepper, Dropzone, Avatar /
  AvatarGroup
- **Layout helpers:** ControlStack, ControlRow, **ControlBlock** `{ children,
  description?, errorText? }` (control chrome + supporting/error note —
  `--fynns-layout-field-hint-gap`; related Switch + narrative **must** wrap
  here, not as loose Card siblings), **FieldHint** (muted/error caption;
  prefer via ControlBlock / FieldBlock / Input), FieldBlock / FieldHeader
  (`description?` / `errorText?` under the control), **FieldStack** (**strongly
  recommended** invisible cluster: group consecutive form units by **semantic
  kind** — e.g. all identity FieldBlocks in one stack, all Preference
  ControlBlocks in another — gap `--fynns-layout-field-stack-gap` / 12dp;
  adjacent stacks → `form-cluster-gap` / 32dp; live `#form-recipe`),
  `.fynns-unit-stack`
  (CSS host — purged `UnitStack` replacement; sibling **units** only — not a
  substitute for FieldStack inside forms),
  Grid (`equalCells` makes every
  cell match the largest content width/height via measure),
  **FillColumn** `{ header?, children, footer? }` (vertical fill host for a
  height-resolved parent — shell main / DestinationAppShell canvas / fixed
  stage: `header`/`footer` content-sized, `children` `flex:1` + `min-height:0`;
  put `<Chat>` in `children` so the thread absorbs leftover and composer docks
  to the column bottom. **Do not** stack Preview / EmptyState / Composer as
  canvas siblings — that leaves a dead band under content height. Does **not**
  apply aside bubble 100% (`.fynns-chat-host--fill` / EndAside stay for that)),
  `measureOverflow` / `overflowsBounds` / `measureContentOverflow` /
  `useOverflowBounds` (dynamic border-box or scroll overflow vs a container or
  the viewport — small public API; prefer over ad-hoc getBoundingClientRect).

  ### Platform targeting (agents — authoritative)

  Labels: **`both`** = any viewport; **`mobile-first`** = prefer on compact /
  phone (pair with a desktop sibling when adapting); **`desktop-first`** =
  prefer on medium+ / pointer (pair with a mobile sibling when adapting);
  **`adaptive`** = same component changes layout by breakpoint or
  `(hover: none)`. Most controls are **`both`**. Only **ClippedNavShell** /
  **EndAside** implement a real viewport break (`max-width: 56.25rem`). Destination
  chrome does **not** auto-swap — the **app** chooses Rail vs Bar vs Drawer.

  **Destination ladder (not duplicates):** phone → `NavigationBar` (bottom) or
  densified `NavigationRail` inside ClippedNavShell / DestinationAppShell; wide labeled →
  `NavigationDrawer` `standard` inside **DestinationAppShell** (desktop default);
  overlay → `modal`. Live composed default: sandbox **Layout templates**
  (`#layouts-demo-shell`). Standalone Rail/Bar demos on that page are parts —
  not a desktop greenfield root.

  | Symbol | Platform | Notes |
  | --- | --- | --- |
  | DestinationAppShell | adaptive | **Default greenfield chrome.** Declarative destinations + TopAppBar + optional EndAside; auto Drawer↔Rail. Prefer over hand-composed ClippedNavShell. |
  | TopAppBar | both | **Edge-flush** page header (`border-radius: 0`, no card frame). Slot into `ClippedNavShell.topBar` / DestinationAppShell — shell adds bottom hairline only. Floating rounded strips → `Toolbar`. |
  | BottomAppBar | mobile-first | Bottom **actions** + optional FAB — not destinations. |
  | Toolbar | both | Contextual actions (`docked` / `floating`). |
  | NavigationBar | mobile-first | Bottom **destinations** (phone). |
  | NavigationRail | mobile-first / narrow densify | Vertical destinations for phone densify or ClippedNavShell crowding. **Never** the default desktop app root. Default / agent densify: `labelVisibility="labeled"` (always show captions). |
  | NavigationDrawer | adaptive | `standard` = medium+ permanent; `modal` = overlay. Destinations only. **Desktop default** inside DestinationAppShell. Optional `NavigationDrawerGroup` (collapsible; leading icon any ReactNode; collapsed + active leaf → selected pill on trigger; group body `aria-labelledby` the label) or static `NavigationDrawerHeadline`. |
  | ClippedNavShell | adaptive | Low-level layout: full-bleed TopAppBar + nav\|main; `drawer`\|`rail`\|`hidden`. Prefer DestinationAppShell for greenfield. Narrow `hidden` with an empty nav slot stays **one** main row (no empty second track under main / EndAside). |
  | EndAside | adaptive | Inspector width morph; flex `min-width: 0` + child `max-width:100%`; main ≤32rem → end-edge overlay; ≤56.25rem → bottom sheet (`min(52dvh, 22rem)`). Not Drawer. |
  | Banner / SearchBar / SkipLink / Breadcrumb / Pagination / Fab / FabMenu | both | Chrome utilities. |
  | Drawer | desktop-first | Modal **content** side sheet. Phone → BottomSheet. ≠ NavigationDrawer. Head: **no** head|body divider / no `surface-head` strip (single surface with body). |
  | BottomSheet | mobile-first | Bottom content sheet. Desktop → Drawer. Drag handle identifies the sheet; header has **no** head|body divider. |
  | FullscreenDialog | mobile-first | Full-viewport dialog. Short tasks → Dialog / ConfirmDialog. Head: **no** head|body divider / no `surface-head` strip (`content-inset` pad only). |
  | Dialog / DialogShell / ConfirmDialog | both | Centered modals. M3 basic + optional close on `Dialog`; dismissible labeled rows = `showCloseButton` + full-width ControlStack (Switch track aligns with CloseIcon glyph, not hit box). Centered Dialog head: **no** head|body divider; non-confirm head pad-block-start `dialog-inset/2` + end `0` + `head + body` pad-top `space-sm`; **ConfirmDialog** title pad-block-start full `dialog-inset`. Date/Time picker dialogs: **no** head hairline (picker head pad may stay picker-specific). |
  | DropdownMenu / snackbar / SnackbarHost / BusyScrim / BusyRegion | both | Menus / feedback / busy. |
  | ContextMenu / Tooltip / InfoHint | desktop-first | Pointer / hover-first; touch apps need care. |
  | Button → Grid / FillColumn (form / selection / action / layout keep-set) | both | FillColumn = vertical fill host (header + flex main); not aside bubble geometry. |
  | Card / Surface / List / ListItem / Divider / Avatar* / Carousel* / EmptyState / Chat* / ChatMessage / ChatThinking / ChatActivity* / Progress* / BadgedBox / InlineAlert / Date* / Time* / measureOverflow* | both | Content / data. |
  | Collapsible / CodeBlock | adaptive | `(hover: none)` changes disclose / copy visibility. |
  | Table* | desktop-first | Wide tables; narrow = horizontal scroll, not reflow. |
  | Dropzone | desktop-first | Drag-drop primary; file input still works on touch. |
  | Stepper | both | `orientation` is caller-chosen — no auto breakpoint. |

  **Toolbar / unit rhythm** (prefer these over ad-hoc `--fynns-space-*`):

  | Role | Token / host |
  | --- | --- |
  | Between `ControlRow`s in a `ControlStack` | `--fynns-layout-control-stack-gap` (**8dp** — toolbar / page chrome; tighter than unit-stack) |
  | Between `ControlRow`s in a **form-host** `ControlStack` (centered Dialog / Card body / Collapsible body direct) | `--fynns-layout-control-stack-form-gap` (**12dp**, aliases `space-md` — between `control-stack-gap` 8dp and `unit-stack-gap` 16dp) |
  | Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
  | Label above controls (narrow) | `--fynns-layout-control-row-gap` |
  | Sibling switches / chips in one cluster | `--fynns-layout-control-cluster-gap` |
  | TopAppBar IconButtons + NavigationRail destinations (shared) | `--fynns-layout-chrome-icon-gap` |
  | Control → supporting / error hint; **also** `FieldBlock` label→control (`.fynns-field`, `ControlBlock`, `FieldBlock` description / `__main`, Otp / Autocomplete) | `--fynns-layout-field-hint-gap` (**8dp** — tighter than unit-stack) |
  | Consecutive related FieldBlocks inside `FieldStack` | `--fynns-layout-field-stack-gap` (**12dp**, aliases `control-stack-form-gap`); with description/error → next sibling **16dp** (`unit-stack-gap`); host a `.fynns-control-cluster` → next sibling **32dp** (`form-cluster-gap`) |
  | Sibling ControlBlocks inside `FieldStack` | visual **16dp** (`unit-stack-gap`; CSS adds the remainder over field-stack-gap) |
  | Adjacent `FieldStack` clusters (fields → switches) | `--fynns-layout-form-cluster-gap` (**32dp**) + **strongly recommend** a horizontal `Divider` between stacks |
  | Vertical stacked **units** / other Card siblings (`.fynns-unit-stack`, intro, Checkbox, …) | `--fynns-layout-unit-stack-gap` (**16dp**) |
  | Nested surface frames (`chrome="plain"` body, `.fynns-nest`) | `--fynns-layout-nest-gap` |

  **FieldStack semantic clusters (hard — agents):** When building any inspector,
  settings Card, Preferences Dialog, or multi-section form, **partition options
  by meaning** with `FieldStack` — do **not** leave every FieldBlock /
  ControlBlock as a flat Card-body sibling.
  - **Same kind → one `FieldStack`:** consecutive related Input / Select /
    Textarea / Otp `FieldBlock`s, **or** a same-kind choice cluster
    (`Radio` single-select, `Checkbox` multi-select, and/or `Slider` under
    `FieldBlock`s), **or** Preference `ControlBlock`s (Switch + note).
    Inside: plain **FieldBlock**s keep `field-stack-gap` (**12dp**); FieldBlocks
    with description/error (no choice cluster) open the next sibling to
    `unit-stack-gap` (**16dp**); FieldBlocks that host a
    `.fynns-control-cluster` open to `form-cluster-gap` (**32dp**); sibling
    **ControlBlock**s open to `unit-stack-gap` (**16dp**) so Switch+note
    units breathe. Choice lists use
    `.fynns-control-cluster--stack` (not bare radios in form-host
    `ControlStack` — that grid auto-flows into label|control columns).
    Stack rows share a dense 2rem **min-height** (option floor) and `space-xs`
    (4dp) gap. Taller children win (`max(floor, content)` — never a fixed
    row `height`). Radio **Other** + free-text `Input` `sm` use
    `.fynns-control-cluster--choice-extra`: Google Forms-style **same-row**
    short field beside the option; keep the Input mounted — **`disabled`
    when Other is not selected** (preserve draft text; enable when Other
    is selected).
  - **Kind jump → adjacent `FieldStack`s + `Divider` (strongly recommended):**
    e.g. identity fields → radio/checkbox choices → preference switches.
    Between stacks: `form-cluster-gap` (**32dp**) **and** a horizontal
    `Divider` so the topic change reads as a hard partition (choice-cluster
    FieldBlocks also use the cluster step between siblings — spacing alone
    without FieldStack / Divider is not enough). Card / Collapsible / Dialog
    body `unit-stack-gap` stays **16dp** for intro / lone Checkbox / actions /
    other non-cluster siblings.
  - **Control + its narrative** stay one unit → `ControlBlock` (`description` /
    `errorText`). Never a loose muted `<p>` under `ControlStack`.
  - **Copy the tree** from sandbox Globals **Inspector form recipe**
    (`#form-recipe`) — same FieldStack body under **Card**, **Collapsible**,
    and dismissible **Dialog** (`showCloseButton`); supply consumer-owned
    strings only.

  **Recipe (hard):** a Switch (or other labeled row) **and** its narrative
  supporting text are **one unit** → wrap in `ControlBlock` (`description` /
  `errorText`). Do **not** place the note as the next Card-body sibling under
  a bare `ControlStack` (zero gap / invented subtitle classes). Prefer
  `ControlStack` + `ControlRow` (+ `Grid` for multi-control rows) inside the
  block. **Form hosts** (Card body, centered Dialog, Collapsible body
  **direct** `ControlStack` / `ControlBlock`): ControlStack is label-fill
  (`1fr`) + end-hug controls (`max-content`) so Switch tracks share one trailing
  edge across sibling rows / ControlBlocks — same Preferences recipe as
  dismissible Dialog. Form-host stacks also open row gap to
  `--fynns-layout-control-stack-form-gap` (**12dp**, aliases `space-md` —
  between `control-stack-gap` 8dp and `unit-stack-gap` 16dp); toolbar stacks
  keep `control-stack-gap` (**8dp**).
  Do not rely on a descendant
  `.fynns-collapsible-body .fynns-control-stack` rule (sandbox category
  Collapsibles would steal toolbar demos). Toolbar / page chrome outside those
  hosts keep the fixed `--fynns-layout-control-row-label` track. Values
  live in `LAYOUT_TOKENS`; sandbox Layout chrome GUI edits
  them via `SANDBOX_LAYOUT_AGENT_CATALOG`. Live samples: Globals → Toolbar /
  unit rhythm (`#rhythm`) + **Inspector form recipe** (`#form-recipe`).

  **Inset decision tree:** Panel shells (Collapsible, Drawer, Card): equal outer
  inset via `--fynns-layout-content-inset` (18dp) on the **inline** edges of
  heads / `chrome="card"` bodies (`chrome="card"` and `chrome="plain"` share the
  outer shell). Collapsible / Card **`chrome="card"`** body uses shared **block**
  pad `--fynns-layout-content-pad-block` (16dp) **and** stacks direct children
  with `--fynns-layout-unit-stack-gap` so FieldBlock / ControlBlock / intro
  copy do not need ad-hoc margins. Nesting a surface-owning child → **`chrome="plain"`**:
  body pad + column gap are **`--fynns-layout-nest-gap`** (16dp) so the child
  reads as a secondary inset frame; sibling wells / meta in that body also use
  the same gap. **plain ≠ flush** — never cancel nest-gap with negative margins
  or by zeroing `.fynns-*-body` pad. Custom hosts outside Card/Collapsible use
  **`.fynns-nest`**. Card / Collapsible **heads** share one
  `min-height` (`icon-target` + `space-xs`×2 + hairline); lead/trigger use
  `padding-block: 0` (flex-centered). Trailing head actions keep
  `space-xs` block pad so IconButton hover disks clear the edge.
  Do **not** add a second padding wrapper inside those shells. Stack siblings
  (section label → `InlineAlert` → next block) with
  `gap: var(--fynns-layout-unit-stack-gap)` — never ad-hoc rem margins or a
  second custom status box (use `InlineAlert` for in-panel severity).
  **Long-strip / `radius-3xl` text chrome** (Banner, InlineAlert, Snackbar,
  ChatComposer **collapsed** text-only start, and **expanded** ChatComposer
  **text edge**): `--fynns-layout-strip-pad-inline` (20dp default). Banner /
  InlineAlert / Snackbar pad-inline **alias** this key — never hardcode
  `--fynns-banner-pad-inline: 1rem` or raw `--fynns-space-*`.
  Expanded ChatComposer shell pad is derived: `composer-expanded-pad-*` =
  strip − glyph-inset; textarea uses `composer-glyph-inset` (optical glyphs;
  text edge still = strip). See `llm/CHAT_COMPOSER_LAYOUT.md`.
  **Collapsed ChatComposer shell** uses `--fynns-chat-composer-pad-inline` /
  `pad-block` (~6dp equal inset around the 32dp Send/Stop circle — not
  capsule-chrome). Text-only start (no leading) adds pad so copy lands at
  `strip-pad-inline` (`strip − composer-pad-inline`).
  **Capsule chrome** (SearchBar field next to IconButtons — ChatGPT-style
  flush): `--fynns-layout-capsule-chrome-pad-inline` (4dp). Do **not** use
  this for ChatComposer shell pad.
  **Chat conversation column** (thread + composer **outer** form):
  `--fynns-layout-dialog-inset` (24dp) via `--fynns-chat-thread-pad-inline`;
  `--fynns-chat-composer-inset-inline` **must** alias the thread token so
  bubble end and composer shell end stay one vertical line. Do **not** use
  `strip-pad-inline` for the column outer inset (that key is text-in-shell /
  expanded composer shell pad only).
  **Form fields:** `Input` / `.fynns-field-shell` inline pad =
  `--fynns-layout-capsule-chrome-pad-inline` + `--fynns-layout-field-pad-inline`
  (4dp + 12dp) so text start matches densified **Select** / Autocomplete
  (searchbar capsule pad + trigger `space-md`). `field-pad-inline` alone
  stays the 12dp step (aliases `space-md`) — do **not** use capsule alone
  for form fields. `Textarea` →
  same inline recipe **plus** `--fynns-layout-field-pad-block` (12dp) so
  multiline copy is not flush to the top/bottom — do **not** let
  `.fynns-input--sm`’s zero block pad (32dp single-line Input) apply to
  Textarea. Default **autoGrow** (content height; soft cap
  `--fynns-layout-textarea-max-height`). Affix → text gap uses
  `--fynns-layout-control-cluster-gap`.
  Centered Dialog /
  ConfirmDialog: head/foot/body **inline** `--fynns-layout-dialog-inset`
  (24dp); non-confirm centered head **block-start** `dialog-inset / 2`,
  **block-end** `0`; confirm head **block-start** full `dialog-inset`;
  body block-end / no-head bodies still use `--fynns-layout-content-inset`.
  **Inter-section optical pads** (not outer column insets) may use space
  tokens: `head + body` pad-top `space-sm`; foot **block-end** `space-lg`
  (under 40dp action Buttons). (**no** head|body hairline.)
  Width: content-fit (`max-content`) up to the `size` token ceiling
  (`--fynns-layout-dialog-max-width-*`); at the ceiling, Switch / ControlStack
  labels wrap (body `overflow-x: clip` — no horizontal scrollbar). Do not
  invent consumer width or wrap hacks. Vertical scroll only when body exceeds
  panel `max-height`.
  FullscreenDialog inherits content-inset on head/body — **no** head|body
  hairline / `surface-head`. BottomSheet keeps asymmetric
  `--fynns-layout-sheet-pad-inline` / `sheet-pad-block` (M3 block≠inline) and
  **no** header|body divider (handle is enough). Drawer content head same:
  content-inset, no divider. Do not force ListItem onto equal four-side
  padding.
  Do not substitute raw `--fynns-space-*` or rem literals for
  dialog/panel/strip/chat-column **outer** shell insets (inline / confirm
  head-start stay on `--fynns-layout-*`). Inter-section optical pads above
  are the documented exception.
  Sandbox Layout chrome GUI groups these under panel insets / sheet pads /
  shell size (see `SANDBOX_LAYOUT_AGENT_CATALOG` in
  `examples/sandbox/src/state/baseline.ts`).
- **Icons (public subset):** Archive, ArrowLeft, ArrowUp, BarChart, Bot,
  ChevronDown, ChevronRight, Clipboard, Download, Eye, EyeOff, File,
  FolderOpen, HelpCircle, Info, LayoutGrid, Menu, Mic, Moon, MoreHorizontal,
  PanelLeft, PanelRight, Pencil, Plus, Refresh, Save, Search, Settings,
  Sparkles, StopSquare, Sun, Trash, Undo, Upload, Wrench — plus any glyph
  still imported by Globals/Layouts/Preview.
  Prefer `IconButton` + `Tooltip` over `title=`.
  `HelpCircle` = ask / clarify (“?”); `Info` = informational (“i”) — do not
  swap them.

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
