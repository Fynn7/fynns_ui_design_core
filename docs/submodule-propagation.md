# UI Submodule Propagation (ARCHIVED — legacy)

> **Archived.** Day-to-day consume is **npm + GitHub Packages**
> (`@fynn7/ui-design-core`). See [`package-propagation.md`](package-propagation.md)
> and [`llm/CONSUME.md`](../llm/CONSUME.md).
>
> Keep this file only as a migration reference for consumers that have **not**
> yet left a `packages/fynns_ui_design_core` (or `gui/…`) git submodule.

## Legacy model (do not use for new work)

1. Push-triggered propagation via `repository_dispatch`
   ([`propagate-ui-bump.yml`](../.github/workflows/propagate-ui-bump.yml)).
2. Dependabot `gitsubmodule` as a safety net.
3. Registry: [`.github/ui-consumers.json`](../.github/ui-consumers.json).

After a consumer migrates to npm, remove its submodule bump workflow and drop it
from that registry when ready.
