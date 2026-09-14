# AGENTS.md — app built on `@fynns/ui`

This app consumes the fynns design system from the sibling checkout
`../fynns_ui_design_core` (`@fynn7/ui-design-core`, `file:` link, Vite alias
`@fynns/ui`). Authority docs live **there**, not here:

| Need | Read (in `../fynns_ui_design_core`) |
| --- | --- |
| Install / greenfield skeleton / primitive-by-job table | `llm/CONSUME.md` |
| Props of a primitive | run `node ../fynns_ui_design_core/scripts/api.mjs <Name>` (`--list`, `--search <re>`, `--tokens <re>`) |
| A screen looks wrong (failure-mode index) | `llm/CONSUMER_TREATY.md` |
| Deleted APIs → replacements | `llm/BREAKING_PURGE.md` |
| Full design rules | `docs/DESIGN_SYSTEM.md` → one chapter at a time |

## Hard rules

1. Build UI only from `@fynns/ui` exports; style only with `var(--fynns-*)`.
   Never restyle `.fynns-*`, never hardcode hex / px, never add `@radix-ui/*`,
   `sonner`, native `<select>` / `<dialog>` / `alert()`.
2. Default chrome `DestinationAppShell` → main `PageScroll` → `Card` / `List`
   / `EmptyState`. Modal = `Dialog`; feedback = `snackbar` + `<SnackbarHost />`;
   loading = `BusyRegion` / `BusyScrim`.
3. Missing capability → say so and stop; it must land in `fynns_ui_design_core`
   first (never edit `node_modules/@fynn7/ui-design-core`).
4. Keep `npm run build` green; run `node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --check` when imports fail.

## Token discipline (local models)

- Look props up with `api.mjs`; do **not** Read files under
  `../fynns_ui_design_core/src` or `examples/sandbox` whole (`GlobalsPage.tsx`
  is 300 KB). If you must, Read ≤ 120 lines with an offset.
- One step per turn: read → edit → `npm run build` (or `npx tsc --noEmit`).
- Grep only inside this app or `../fynns_ui_design_core/src/primitives` with a
  `--glob`; take the first few hits.
