# UI Submodule Propagation

This document is the single source of truth for how `fynns_ui_design_core`
propagates submodule pointer bumps to consumer repositories.

## Model

There are two propagation layers:

1. Push-triggered propagation from `Fynn7/fynns_ui_design_core` to every known
   consumer via `repository_dispatch`.
2. Dependabot daily `gitsubmodule` scans in each consumer as a safety net when
   push propagation is unavailable or misconfigured.

The registry of consumers lives in [`.github/ui-consumers.json`](../.github/ui-consumers.json).
Add new consumers there first, then add the thin `repository_dispatch` workflow
to the target repository.

## Design core workflows

- [`.github/workflows/propagate-ui-bump.yml`](../.github/workflows/propagate-ui-bump.yml)
  listens to `push` on `main` and fans out a `fynns-ui-bump` dispatch event to
  each registered consumer.
- [`.github/workflows/bump-submodule-reusable.yml`](../.github/workflows/bump-submodule-reusable.yml)
  is the shared implementation used by consumer repositories. It checks whether
  the submodule exists on the target branch, updates the pointer, opens or
  updates a PR, and enables auto-merge.

## Secret

The design core repository needs a repository secret named
`FYNNS_UI_PROPAGATE_PAT`.

Recommended setup:

- token type: fine-grained PAT if possible, otherwise a classic PAT
- repository access: every consumer that appears in `ui-consumers.json`
- permissions: `Contents` read/write and `Actions` read/write

Store it only in `Fynn7/fynns_ui_design_core` repository secrets. Consumers do
not need this PAT.

## Consumer responsibilities

Push-triggered bump PRs are created by GitHub Actions. Those PRs do not
automatically trigger `pull_request` workflows when `GITHUB_TOKEN` is used, so
the reusable bump workflow dispatches each consumer's typecheck workflow on the
bump branch via `workflow_dispatch` after push.

Each consumer repository should provide:

- a `repository_dispatch` entry workflow that delegates to the reusable bump
  workflow in `fynns_ui_design_core`
- GitHub Actions workflow permissions set to **Read and write** with
  **Allow GitHub Actions to create and approve pull requests** enabled
- a CI check workflow that validates the pinned submodule commit against the
  consumer's code (for example `ui-typecheck.yml` with `workflow_dispatch`)
- an auto-merge workflow that enables merge for both:
  - Dependabot `fynns_ui_design_core` bump PRs
  - `github-actions[bot]` PRs labeled `fynns-ui`

## Skip behavior

The reusable workflow intentionally skips in these cases:

- the target branch does not contain the submodule path yet
- the target branch already points at the requested `target_sha`

Skip still applies when a registered `base_branch` lacks the submodule path.
`fynns_bachelor_thesis` now has the submodule on `main`; the reusable bump
opens the PR, dispatches consumer typecheck, polls the Actions check named
`typecheck`, then squash-merges immediately (with `--admin` fallback). Do not
rely on GitHub `--auto` merge alone: third-party apps (Render / Vercel / Cursor)
often leave empty `queued` check suites that block auto-merge even when only
`typecheck` is required.

## Local development

Consumers import `@fynns/ui` from submodule source via a Vite alias.

**Instant local mirror (uncommitted / local commits):** from a core checkout,
`npm run consume:sync -- --target <CONSUMER_ROOT>` diffs and mirrors `src/` (+
`package.json`) into the consumer submodule **worktree** so Vite HMR can pick
up changes without waiting for a pin bump. Does not commit the pointer. Full
contract: [`llm/CONSUME.md`](../llm/CONSUME.md) **Local sync (instant)**.

**Formal pin bump (release / CI):** pull or checkout a published SHA in the
submodule, then commit the parent pointer — push-triggered bump PRs and
Dependabot cover registered consumers (this document). Day-to-day
`consume:sync` does **not** replace that.

**Local mandatory pin check (agents / humans):** propagate bump PRs do **not**
replace verifying the working tree. Before UI work, run
`node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check` from a
core checkout — it **fails** when the consumer submodule is behind remote
`main`. Authority: [`llm/CONSUME.md`](../llm/CONSUME.md) Hard rule 5a.
