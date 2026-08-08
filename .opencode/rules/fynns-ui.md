# fynns UI design system

This repo consumes `@fynns/ui` (the `fynns_ui_design_core` submodule at
`packages/fynns_ui_design_core`). It is the single source of truth for UI.

**Public API purge / migration:** `llm/BREAKING_PURGE.md` — only symbols demoed in
sandbox Globals + Preview are public; do not import deleted APIs.

## Rules

- Build UI from `@fynns/ui` keep-set primitives (see `AGENTS.md` catalog). Reach
  for an existing keep-set primitive before writing a new control.
- Style with `--fynns-*` tokens only (e.g. `var(--fynns-color-accent)`,
  `var(--fynns-space-3)`, `var(--fynns-radius-md)`). Never hardcode hex/rgba.
  Vertical units: flex + `--fynns-layout-unit-stack-gap`. Toolbars:
  `ControlStack` + `ControlRow`. Font families: inherit `ui` for body/chrome;
  `mono` for code; never `serif` for main prose (see `AGENTS.md` Font families).
- Do NOT reintroduce `@radix-ui/*` or `sonner`. Do not resurrect purged Toast /
  Popover / Panel / BlockingLoadingOverlay APIs. Dialog / Drawer /
  FullscreenDialog stay in the keep-set (see `AGENTS.md` / `llm/BREAKING_PURGE.md`).
  Transient feedback: `snackbar` + `SnackbarHost`.
- App/teaching-specific tokens stay app-side under `--afs-*` or `--dsa-*`.
- If a token or component is missing, add it in the submodule and run
  `npm run gen:theme`.
- **Performance:** shells / inspectors / catalogs / live token drafts → read
  `packages/fynns_ui_design_core/llm/PERF.md` before coding.

See `packages/fynns_ui_design_core/AGENTS.md` for the full token + component
catalog. Text must be English or German only (no CJK).
