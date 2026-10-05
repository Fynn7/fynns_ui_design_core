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
   app startup / reopening = `AppLoadingScreen` (opaque theme background,
   centered logo sweep; configured project icon → initials Avatar → core mark).
   Icon discovery is automatic; pass existing JS brand assets through logoSrc.
   Never show whole-window text skeletons or translucent app chrome at startup.
   Content loading = large content-position BusyRegion skeletons; BusyScrim
   only for explicit in-app blocking content waits,
   `LoadingSkeleton` slots matching the upcoming UI/text. Default = the large,
   full-width thick text skeleton; six rows without fill, adaptive rows with
   fill and omitted lines. Whole-pane waits must not freeze six rows or clear
   padding: core owns the bare cold-start dialog-inset and retains canonical
   FillColumn / PageScroll / ChatThread insets. ChatThread.empty uses BusyRegion
   busy fill; avoid content-sized wrappers. Explicit block = image / iframe / canvas.
   Labels are accessible-only; no visible Loading copy, compact busy marks or
   small centered text emblems. Keep the large text skeleton.
   Actions prefer disabled + aria-busy with the content skeleton owning the wait.
   Rings / Button loading / explicit busy message+circular are permanently
   archived, deprecated and strongly discouraged. Real value = linear progress.
   See `docs/design-system/loading.md`; no local shimmer CSS.
   Chat = FillColumn → Chat; core owns main top + inline `dialog-inset`.
   Never reset `.fynns-fill-column-main`. Transient request errors use
   `snackbar(message, { severity: "error", duration: "long", dismissible: true })`.
   Default snackbar = theme surface, no icon; four severity variants match
   InlineAlert's rendered tones on app-bg as flat fills (12% semantic color,
   88% app canvas), on-surface text and matching icons. No frosted glass,
   backdrop blur or see-through content; never change InlineAlert.
   `icon: true` enables an icon on the default;
   `false` / `null` hides one. Persistent notices/recovery remain InlineAlert.
   SnackbarHost always portals a fixed overlay. Do not add an in-flow host,
   footer spacer or conditional app padding: showing/replacing/dismissing
   feedback must leave shell, Chat/composer, nav and preview bounds and thread
   scroll unchanged. Use core flat tonal fills rather than moving the layout.
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
8. ChatComposer buttons, menu triggers, mode toggles and Send/Stop always share
   **one horizontal action row**. Prevent pane/window compression below the
   complete row's minimum (controls + menu floors + gaps + shell/form/host
   insets); `--fynns-layout-chat-min-width` is only the baseline. Clamp drag,
   keyboard and restored pane sizes; enforce native window minima. In browsers,
   collapse nav/preview into core overlay/sheet before crowding chat. Never wrap,
   stack, clip or horizontally scroll actions. Read `llm/CHAT_COMPOSER_LAYOUT.md`.

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
