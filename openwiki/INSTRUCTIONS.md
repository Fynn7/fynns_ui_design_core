# @fynns/ui-design-core — OpenWiki brief (user-authored; not rewritten by update runs)

## Purpose
Agent-facing wiki for this design-system package: canonical `--fynns-*` tokens +
self-developed React primitives, consumed as **source** via GitHub Packages
(`@fynn7/ui-design-core`) + Vite alias `@fynns/ui`.

## Authoritative sources (do not duplicate — link)
1. `AGENTS.md` — design language, Hard rules, keep-set catalog.
2. `llm/CONSUME.md` + `llm/consume.json` — install / consume contract.
3. `llm/CONSUMER_TREATY.md` — failure-mode **slug index** (details in AGENTS).
4. `llm/BREAKING_PURGE.md` — public API purge / migration.
5. `docs/package-propagation.md` — GitHub Packages publish / bumps.
6. Sandbox Globals + Preview (`examples/sandbox/`) — live public surface.

## Priorities (high → low)
1. How agents consume and extend the system (npm, alias, tokens-only, no radix/sonner).
2. Repo layout: `src/theme/`, `src/primitives/`, barrel, `examples/sandbox/`, `scripts/`.
3. Adding a primitive: tokens → `gen:theme` → primitive + CSS → export → AGENTS → sandbox → check.
4. Busy / feedback: BusyScrim / BusyRegion / snackbar — not purged Toast / BlockingLoadingOverlay.
5. Permanent skips: TimePicker dial, LoadingIndicator, ButtonGroup, RangeSlider.

## Out of scope
- Re-listing every keep-set prop table (live in AGENTS.md + sandbox).
- Consumer app-specific `--afs-*` / `--dsa-*` tokens.
- Long failure-mode essays (use AGENTS Hard rules + treaty index).

## Style
Short operational English (or German). Prefer navigation + source maps over
restating AGENTS.md.
