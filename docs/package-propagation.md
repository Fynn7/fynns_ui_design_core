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

## Update notices (consumer dev/build)

`npm run consume:install` wires **`fynns-ui:check-update`** into consumer
`predev` / `prebuild` / `prepreview` / `postinstall`. When GitHub Packages has
a newer semver than the installed tarball, `npm run dev` (and build/preview)
prints a one-line upgrade hint — that is the intended reminder loop after each
core publish. Registry lookup requires `NODE_AUTH_TOKEN` / `GITHUB_TOKEN`
(`read:packages`); set `FYNNS_UI_SKIP_UPDATE_CHECK=1` in CI to silence. Manual:
`npm run fynns-ui:check-update` in the consumer app.

## Local core development

Edit this checkout, then **ship on the registry** — not via a sibling Vite alias.

**Agent ship rule (hard):** after every landed change consumers should see
(primitive, CSS, token, keep-set docs):

1. Bump `package.json` semver in the **same task** (`patch` for fixes /
   geometry; `minor` for new public API).
2. Commit, then publish `@fynn7/ui-design-core` to GitHub Packages
   (`npm publish --access restricted`, or GitHub Release /
   `workflow_dispatch` on
   [`.github/workflows/publish-package.yml`](../.github/workflows/publish-package.yml)).
3. Consumers stay on
   `node_modules/@fynn7/ui-design-core/src/index.ts`. Bump their dependency
   (`npm install @fynn7/ui-design-core@x.y.z`) when they should pick it up.

Do **not** deliver by pointing a consumer Vite alias at
`../../fynns_ui_design_core`. Committing that path is machine-specific; restoring
the npm alias on commit reloads the **last published** tarball and looks like a
visual rollback (unpublished CSS disappears). Temporary `file:` / `npm link`
is iteration-only — never the ship path. There is **no** `consume:sync` /
`consume:watch`.

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
