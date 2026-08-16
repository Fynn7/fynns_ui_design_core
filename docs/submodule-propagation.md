# UI Submodule Propagation (LEGACY)

> **Deprecated.** Day-to-day consume is **npm + GitHub Packages**
> (`@fynn7/ui-design-core`). See [`package-propagation.md`](package-propagation.md)
> and [`llm/CONSUME.md`](../llm/CONSUME.md).
>
> The workflows below only apply to consumers that have **not** yet migrated off
> a `packages/fynns_ui_design_core` (or `gui/…`) git submodule.

This document previously described how `fynns_ui_design_core` propagated
submodule pointer bumps. Keep it only as a migration reference.

## Legacy model

1. Push-triggered propagation from `Fynn7/fynns_ui_design_core` to consumers via
   `repository_dispatch` ([`propagate-ui-bump.yml`](../.github/workflows/propagate-ui-bump.yml)).
2. Dependabot `gitsubmodule` scans as a safety net.

Registry: [`.github/ui-consumers.json`](../.github/ui-consumers.json).

After a consumer migrates to npm, remove its `repository_dispatch` bump workflow
and drop it from the submodule registry when ready.
