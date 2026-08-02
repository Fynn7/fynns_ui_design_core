# @fynns/ui-design-core — OpenWiki brief (user-authored; not rewritten by update runs)

## Purpose
Agent-facing wiki for this design-system package: canonical `--fynns-*` tokens + self-developed React primitives, consumed as **source** via git submodule + Vite alias `@fynns/ui` (not npm).

## Authoritative sources (do not duplicate — link)
1. `AGENTS.md` — design language, hard rules, token groups, keep-set component catalog.
2. `llm/CONSUME.md` + `llm/consume.json` — install / consume contract for consumer apps.
3. `llm/BREAKING_PURGE.md` — public API purge / migration (deleted → replacement).
4. `docs/submodule-propagation.md` — submodule pin propagation.
5. Sandbox Globals + Preview (`examples/sandbox/`) — live demos that define the public surface.

## Priorities (high → low)
1. How agents should consume and extend the system (submodule, alias, tokens-only CSS, no radix/sonner).
2. Repo layout: `src/theme/`, `src/primitives/`, `src/index.ts` barrel, `examples/sandbox/`, `scripts/`.
3. Adding a primitive: tokens → `gen:theme` when needed → primitive + CSS → export → AGENTS.md → sandbox sample → typecheck.
4. Busy / feedback: BusyScrim / BusyRegion / snackbar — not purged Toast / BlockingLoadingOverlay / PanelSkeleton.
5. Permanent skips: TimePicker dial, LoadingIndicator, ButtonGroup, RangeSlider.

## Out of scope
- Re-listing every keep-set prop table (live in AGENTS.md + sandbox).
- Consumer app-specific `--afs-*` / `--dsa-*` teaching tokens.
- Historical purge narrative beyond linking BREAKING_PURGE.

## Style
Short operational English (or German); Chinese only in consumer sandboxes. Prefer navigation + source maps over restating AGENTS.md.
