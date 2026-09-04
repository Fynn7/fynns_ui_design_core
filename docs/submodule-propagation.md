# UI Submodule Propagation (ARCHIVED — legacy)

> **Archived.** Day-to-day consume is **npm + GitHub Packages**
> (`@fynn7/ui-design-core`). See [`package-propagation.md`](package-propagation.md)
> and [`llm/CONSUME.md`](../llm/CONSUME.md).
>
> Core no longer ships submodule bump workflows or
> `.github/ui-consumers.json`. Keep this file only as a migration note for
> consumers that still have a `packages/fynns_ui_design_core` (or `gui/…`)
> git submodule and/or a leftover `repository_dispatch` handler.

## Legacy model (do not use)

1. Push-triggered propagation via `repository_dispatch` (removed from this
   repo).
2. Dependabot `gitsubmodule` as a safety net.
3. Consumer registry JSON (removed from this repo).

After a consumer migrates to npm, remove its submodule bump workflow and any
`repository_dispatch` handler that listened for UI bumps.
