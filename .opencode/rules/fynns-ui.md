# fynns UI design system

This repo consumes `@fynns/ui` via **`@fynn7/ui-design-core`** (GitHub Packages)
with a Vite/tsconfig alias to
`node_modules/@fynn7/ui-design-core/src/index.ts`. It is the single source of
truth for UI. Install: `llm/CONSUME.md` / `scripts/install-as-npm.mjs`.

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
- Do not use a git submodule for day-to-day consume; depend on
  `@fynn7/ui-design-core` from GitHub Packages.
- Missing capability → implement in `fynns_ui_design_core` first, then bump the
  consumer package version.
