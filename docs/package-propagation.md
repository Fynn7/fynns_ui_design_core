# UI package propagation (sibling file: + optional GitHub Packages)

This document is the single source of truth for how `fynns_ui_design_core`
reaches consumer apps.

**Install contract:** [`llm/CONSUME.md`](../llm/CONSUME.md).

**Canvas migration ≥ 0.5.310:** consume `WorkspaceNoticeStack` plus core canvas
overlay classes instead of copying sandbox positioning/motion CSS. The updated
workspace gate rejects docked canvas toolbars in semantic/shared hosts, multiple
canvas editing toolbars and standalone document toolbar rows. Use one top-bar
document menu and `.fynns-workspace-panes` for continuous canvas/inspector edges. Re-sync
the pasteable consumer rule and merge `UI_REWARD_SIGNALS.md` review requirements
into consumer agent guidance. See [workspace contract](design-system/workspace-chrome.md).

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

## Update notices + hard gate (consumer dev/build)

### Install readiness and failure ownership

The consumer gate now checks declared app dependencies/devDependencies and
installed CLI/main artifacts as well as the UI barrel. A repaired core link
alone cannot produce a successful app preflight. JSON issue code
`consumer-dependencies` identifies an incomplete app install; sync, cache and
workspace failures retain their own codes. This is a development/build gate,
so production-only installs that omit required dev tooling are not ready.

From this core checkout, diagnose and repair the actual app package:

```bash
npm run consume:check-deps -- --target ../my-app/gui
npm run consume:repair-deps -- --target ../my-app/gui
npm run check:consumers -- --target ../my-app/gui
```

Repair runs `npm install --include=dev` in that package, keeps normal lifecycle
scripts (including native tool setup), verifies the resulting artifacts and
preserves npm/hook failures. It never runs recursively inside install hooks.
The gate itself is read-only; it never retries an install or rewrites app JSX.
Healthy hoisted installs are supported; broken nearer packages shadow parents.
Optional packages may be absent. This read-only preflight does not prove native
binary execution, prop compatibility or browser behavior:
the consumer's own typecheck/build and startup verification are still required.

A root `npm install` installs nested packages only when that root declares them
as npm workspaces. Startup recovery installs the actual app package when needed.
Linking core, syncing its version or counting matching exports does not install
React, Vite or the consumer's process runner. Do not report “ready to start” on
an export-only or wire-only success. Do not tell users to clean/pull core for an
app dependency or source-contract error.

Workspace checks must distinguish simultaneously reachable controls from
conditional alternatives. Mutually exclusive actions on the same discriminator
may each be primary; independent conditions can still show competing primaries.
Uppercase machine keys on FieldBlock labels linked to their actual Input or
Textarea preserve their casing. These exceptions do not allow all-cap headings
or labels unconnected to a field. New gate rules require positive and negative
fixtures plus checks against affected consumers before compatibility is claimed.

Startup recovery is implemented by
[`scripts/consumer-recovery.mjs`](../scripts/consumer-recovery.mjs), called by
`ensure-sibling-ui-core.mjs --update` and the installer-owned `fynns-ui:prepare`
hook. Ordinary `npm run dev` / build / preview checks direct package metadata,
main/bin artifacts, command shims and the npm dependency tree. Missing/broken
installs trigger one `npm install --include=dev` in the app package, with native
setup and consumer lifecycle hooks enabled. Damaged installed directories are
renamed into ignored `.fynns-ui-recovery` backups before reinstalling; source
checkouts are retained. Hoisted CLI packages receive app-local links for
launchers that address `node_modules/<tool>` directly.
Physical UI copies left by npm `install-links` are compared with the declared
`file:` source (version and source digest); a stale copy is retained as a backup
and replaced by a source link, including source-only updates at the same version.

Recovery serializes installs per consumer repository, rechecks after waiting,
reclaims dead-process locks and prevents recursive installation, including
external npm installs whose nested `npm run` hooks replace lifecycle env vars.
It applies the standard Vite no-store header and only supported mechanical
workspace migrations (such as Cancel emphasis and simple InlineAlert retry
composition, retaining handlers and disabled state). The strict export/workspace
gate runs afterward. Unknown source errors and failed npm/native hooks remain
failures; the process never loops or declares readiness just because npm exited.
Healthy restarts do not install again. Regression fixtures run real npm
lifecycles with fault injection and offline local packages.

The installer now writes `scripts/fynns-ui-bootstrap.mjs` into the consumer;
commit this helper with the consumer. It resolves the declared file dependency
before loading core tooling, so a deleted node_modules link cannot prevent its
own repair. Re-run `consume:install -- --target <app> --wire-only` to migrate
installer-owned sync commands; custom consumer wrappers are preserved. To add
recovery hooks alone, use `consume:install -- --target <app> --recovery-only`;
this preserves dependency pins, Vite/TS configs and consumer rules. A pinned UI
snapshot without the helper uses recovery tooling from the canonical local
sibling, while its original snapshot and gate stay selected. Missing sibling checkouts can
be cloned by the bootstrap; unavailable Git/network, invalid source and actual
consumer incompatibilities remain actionable failures, not successful startups.

`npm run consume:install` wires:

1. **`fynns-ui:prepare`** (hard) — deterministic recovery before existing
   lifecycle gates, loaded from the copied bootstrap independently of node_modules.
2. **`fynns-ui:gate`** (hard) — `ensure-sibling-ui-core.mjs --update` then
   `check-ui-exports.mjs` on `predev` / `prebuild` / `prepreview` /
   `postinstall`. Auto fast-forwards a **clean** sibling to `origin/dev`
   (or `FYNNS_UI_CORE_REF`) with `git merge --ff-only` after fetch. If FF is
   impossible and remote `package.json` semver is **≥** local (stale shallow
   / diverged consumer tip, including equal versions), it
   `reset --hard FETCH_HEAD`. **Pure-ahead** / local-semver-newer diverged
   tips → **soft-skip** with disposable `reset --hard` recovery in the notice.
   **Dirty** = tracked sibling changes only (untracked `.tmp-*` ignored) →
   soft-skip with commit/stash/discard guidance (not hard-reset); committing
   the consumer does not clear sibling dirt. Dev continues; export check still
   runs.
   The same export gate now checks static workspace composition (ghost chrome,
   action emphasis, Cancel, natural-case copy and InlineAlert controls). It uses
   TypeScript tooling from core or the consumer; parser absence fails closed.
   See [workspace contract](design-system/workspace-chrome.md). Refresh copied
   consumer rules with `--sync-consumer-rule`; existing custom AGENTS.md remains
   consumer-owned, so merge the new rules there explicitly.
   `FYNNS_UI_STRICT_SIBLING_SYNC=1` hard-fails those cases (CI). Also
   fails closed on failed fetch, missing `@fynns/ui` barrel symbols, or a Vite
   dev config without `Cache-Control: no-store`. The last check prevents a
   webview from reusing a stale native ESM barrel after the sibling updates.
   Optional: `FYNNS_UI_SKIP_SIBLING_SYNC=1` while editing core. Optional
   floor: `"fynnsUi": { "minVersion": "…" }` in the consumer package.json.
3. **`fynns-ui:check-update`** (soft) — registry notice on
   `predev` / `prebuild` / `prepreview`. On sibling/`file:` the registry
   lookup skips quietly without a token. Optional Packages lookup needs
   `NODE_AUTH_TOKEN` / `GITHUB_TOKEN`. Silence: `FYNNS_UI_SKIP_UPDATE_CHECK=1`.

**Do not** rely on a hand-maintained stale `MIN_UI_CORE_VERSION` alone —
that is how consumers ship new imports against an old sibling and get a
Vite-green / browser-red blank page.

**Monorepo:** bump / link in the **app package** that owns `predev` (e.g.
`apps/web`), not only at the git root — nested `node_modules` wins for Vite.
`install-as-npm.mjs` redirects a root target to the sole UI app package and
removes only its own mistaken hooks from a parent package without the UI
dependency. With multiple UI apps, pass each package explicitly.
See [`llm/CONSUME.md`](../llm/CONSUME.md) **Monorepo bump**.

## Local core development

Edit this checkout (the sibling consumers already link). After landed
consumer-visible changes:

1. Bump `package.json` semver in the **same task** when you also publish.
2. Consumers on sibling pick up changes via **`fynns-ui:gate` / `--update`**
   on next `npm run dev` (clean worktree), or `git pull` in
   `../fynns_ui_design_core`. Optional: publish to GitHub Packages for
   Packages-based workflows.
3. Do **not** leave Vite pointing at a sibling path while `dependencies` still
   resolve a registry tarball — keep `file:` and alias both on
   `node_modules/@fynn7/ui-design-core/...`.
4. While iterating on core next to a consumer: set
   `FYNNS_UI_SKIP_SIBLING_SYNC=1` so predev does not reset your WIP tip.

`consume:install -- --wire-only` adds the dev response header to existing
consumer Vite configs. A browser with a previously cached response can require
one hard reload or cache clear during this migration. Future responses carry
`no-store`, so subsequent linked-core updates do not reuse that stale module.
For an already wired consumer with custom app scripts, use
`node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target <app> --dev-cache-only`
to change only the Vite header.

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
