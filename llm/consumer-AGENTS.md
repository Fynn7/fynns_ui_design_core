# AGENTS.md — app built on `@fynns/ui`

This app consumes the fynns design system from the sibling checkout
`../fynns_ui_design_core` (`@fynn7/ui-design-core`, `file:` link, Vite alias
`@fynns/ui`). Authority docs live **there**, not here:

| Need | Read (in `../fynns_ui_design_core`) |
| --- | --- |
| Install / greenfield skeleton / primitive-by-job table | `llm/CONSUME.md` |
| Props of a primitive | run `node ../fynns_ui_design_core/scripts/api.mjs <Name>` (`--list`, `--search <re>`, `--tokens <re>`) |
| A screen looks wrong (failure-mode index) | `llm/CONSUMER_TREATY.md` |
| Chat question / thinking variants / event order | `llm/CHAT_SEQUENCE.md`: `ChatQuestion` with Other/Input; `ChatThinking` status/disclosure in `ChatThinkingStack`; append one chronological list |
| Deleted APIs → replacements | `llm/BREAKING_PURGE.md` |
| Full design rules | `docs/DESIGN_SYSTEM.md` → one chapter at a time |

## Hard rules

1. Build UI only from `@fynns/ui` exports; style only with `var(--fynns-*)`.
   Never restyle `.fynns-*`, never hardcode hex / px, never add `@radix-ui/*`,
   `sonner`, native `<select>` / `<dialog>` / `alert()`.
2. Default chrome `DestinationAppShell` → main `PageScroll` → `Card` / `List`
   / `EmptyState`. Modal = `Dialog`; feedback = `snackbar` + `<SnackbarHost />`;
   loading = `BusyRegion` / `BusyScrim`.
   Chat = `FillColumn` → `Chat`; core owns main top + left/right well padding
   (`--fynns-layout-dialog-inset`). Never reset `.fynns-fill-column-main`.
   Transient request failures → `snackbar(message, { severity: "error",
   duration: "long", dismissible: true })`, rising from bottom-center; no
   inline error strip above Chat. Persistent notices/recovery stay InlineAlert.
   Snackbar defaults to info icon; severity=`warning`/`error`/`success` sets
   color + matching icon; `icon: false` / `null` keeps color + text only.
3. Missing capability → say so and stop; it must land in `fynns_ui_design_core`
   first (never edit `node_modules/@fynn7/ui-design-core`).
4. Keep `npm run build` green; run `node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --check` when imports fail.
5. Consumer app action Buttons default to a semantic leading icon plus visible
   text (`CloseIcon` + Cancel, `CheckIcon` + Apply, `RefreshIcon` + Refresh).
   Put both directly inside `Button`, set the icon `aria-hidden`, and never add
   local icon margin / gap / literal spaces; core owns the spacing. Use
   `IconButton` + Tooltip + `aria-label` only for compact self-evident chrome.
6. Every ellipsized or line-clamped UI label must reveal its exact full text in
   a hover/focus Tooltip. Prefer string props that core wraps automatically;
   wrap custom `ReactNode` text with `OverflowTip` at the call site. This also
   applies in intentionally narrow drawers/sidebars. Never use native `title=`
   or hand-author `.fynns-control-row__label-text`; pass a string to
   `ControlRow label` whenever possible.
7. Before shipping dense rows, inspect their rendered geometry at the narrowest
   supported viewport and with the longest localized labels. Text, InfoHint
   target, Switch, panel edge, and adjacent rows must not overlap. Preference
   rows use `ControlStack columns={1}`: text + `InfoHint size="sm"` in
   `ControlRow label`, Switch alone in children. Allow core label wrapping and
   choose a fitting Dialog `size` (usually `md` for several long rows). Never
   hide a collision with clipping, absolute offsets, or local `.fynns-*` CSS.

## Token discipline (local models)

Chat tool summaries (`ChatActivity`) and reasoning (`ChatThinking`) keep the
chevron a shared short gap after the label text, independent of body width or
expansion. Do not stretch header/label or override core geometry; see
`llm/CHAT_SEQUENCE.md`, sandbox `#chat-chevron`.

- Look props up with `api.mjs`; do **not** Read files under
  `../fynns_ui_design_core/src` or `examples/sandbox` whole (`GlobalsPage.tsx`
  is 300 KB). If you must, Read ≤ 120 lines with an offset.
- One step per turn: read → edit → `npm run build` (or `npx tsc --noEmit`).
- Grep only inside this app or `../fynns_ui_design_core/src/primitives` with a
  `--glob`; take the first few hits.
