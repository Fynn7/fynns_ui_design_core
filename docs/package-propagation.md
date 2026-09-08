# UI package propagation (sibling file: + optional GitHub Packages)

This document is the single source of truth for how `fynns_ui_design_core`
reaches consumer apps.

**Install contract:** [`llm/CONSUME.md`](../llm/CONSUME.md).

## Model

1. This **git repo is public**. Day-to-day consumers use a **sibling checkout**
   `../fynns_ui_design_core` + `package.json` dependency
   `@fynn7/ui-design-core` via **`file:`**, with Vite/tsconfig alias
   **`@fynns/ui`** → `node_modules/@fynn7/ui-design-core/src/index.ts`.
   **No** `NODE_AUTH_TOKEN` / packages login for clone → install → dev.
   Helper: [`scripts/ensure-sibling-ui-core.mjs`](../scripts/ensure-sibling-ui-core.mjs).
   Reference consumer: CV Generator `scripts/ensure-node.mjs`.
2. This repo **also** publishes **`@fynn7/ui-design-core`** to
   `https://npm.pkg.github.com` (workflow
   [`.github/workflows/publish-package.yml`](../.github/workflows/publish-package.yml))
   for **publishers / optional bump workflows**. GitHub Packages npm **always**
   needs a token (even when package visibility is public) — do **not** make
   that the onboarding path for people cloning a consumer.
3. Consumer `.npmrc` for sibling mode (commit this — **no** auth line):

```
# Zero-token sibling consume
@fynn7:registry=https://registry.npmjs.org
```

Do **not** commit `_authToken=${NODE_AUTH_TOKEN}` (empty env → E401).

## Update notices (consumer dev/build)

`npm run consume:install` may wire **`fynns-ui:check-update`** into consumer
`predev` / `prebuild` / `prepreview` / `postinstall`. On sibling/`file:` the
registry lookup skips quietly without a token. Optional Packages lookup needs
`NODE_AUTH_TOKEN` / `GITHUB_TOKEN`. Silence: `FYNNS_UI_SKIP_UPDATE_CHECK=1`.

**Monorepo:** bump / link in the **app package** that owns `predev` (e.g.
`apps/web`), not only at the git root — nested `node_modules` wins for Vite.
See [`llm/CONSUME.md`](../llm/CONSUME.md) **Monorepo bump**.

## Local core development

Edit this checkout (the sibling consumers already link). After landed
consumer-visible changes:

1. Bump `package.json` semver in the **same task** when you also publish.
2. Consumers on sibling pick up changes via `git pull` in
   `../fynns_ui_design_core` (or their ensure script). Optional: publish to
   GitHub Packages for Packages-based workflows.
3. Do **not** leave Vite pointing at a sibling path while `dependencies` still
   resolve a registry tarball — keep `file:` and alias both on
   `node_modules/@fynn7/ui-design-core/...`.

## Legacy submodule bump workflows (removed)

The old git-submodule propagate workflows
(`propagate-ui-bump.yml`, `bump-submodule-reusable.yml`) and
`.github/ui-consumers.json` were **removed**. Day-to-day = sibling `file:`.
If a consumer still has a `repository_dispatch` handler for submodule bumps,
delete it.

## Optional Packages registry (publishers only)

```
@fynn7:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Requires `NODE_AUTH_TOKEN` / `GITHUB_TOKEN` with `read:packages` /
`write:packages` as appropriate. Not part of consumer onboarding.
