# UI package propagation (npm / GitHub Packages)

This document is the single source of truth for how `fynns_ui_design_core`
reaches consumer apps after the **npm consume model** (GitHub Packages).

**Install contract:** [`llm/CONSUME.md`](../llm/CONSUME.md).

## Model

1. This repo publishes **`@fynn7/ui-design-core`** to
   `https://npm.pkg.github.com` (workflow
   [`.github/workflows/publish-package.yml`](../.github/workflows/publish-package.yml)
   on GitHub Release / `workflow_dispatch`).
2. Consumers depend on that package in `package.json`, authenticate via
   `.npmrc` + `NODE_AUTH_TOKEN` / `GITHUB_TOKEN` (`read:packages`), and keep the
   Vite/tsconfig alias **`@fynns/ui`** →
   `node_modules/@fynn7/ui-design-core/src/index.ts`.
3. Version bumps in consumers: Dependabot (npm) or manual
   `npm install @fynn7/ui-design-core@x.y.z`. There is **no** local
   `consume:sync` / `consume:watch` worktree mirror.

## Local core development

Edit this checkout, then either:

- **`npm version` + Release** (or `workflow_dispatch` publish) and bump the
  consumer dependency, or
- Temporary **`file:../fynns_ui_design_core`** (or `npm link`) while iterating —
  still no submodule pin.

## Legacy submodule bump workflows

[`.github/workflows/propagate-ui-bump.yml`](../.github/workflows/propagate-ui-bump.yml)
and [`.github/workflows/bump-submodule-reusable.yml`](../.github/workflows/bump-submodule-reusable.yml)
target the **old git-submodule** consume path. Do not use them for new apps.
Remove consumer `repository_dispatch` handlers once each app is on npm.

## Registry

Consumer `.npmrc`:

```
@fynn7:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```
