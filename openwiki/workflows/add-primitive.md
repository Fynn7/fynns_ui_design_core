---
type: Concept
title: Add a primitive
description: Checklist for shipping a new keep-set control without API drift.
tags: [workflow, primitives, sandbox]
---

# Add a primitive

## Checklist

1. **Need?** Prefer an existing keep-set control ([`AGENTS.md`](../../AGENTS.md) catalog). Do not ship synonyms / thin wrappers (see `.cursor/rules/m3-next.mdc` skip list).
2. **Tokens** — if a new `--fynns-*` value is required, edit `src/theme/tokens.ts` (and radius GUI rows in sandbox if adding `RADIUS_TOKENS`). Run `npm run gen:theme`.
3. **Implement** — `src/primitives/X.tsx` + styles in `src/primitives/primitives.css` (`.fynns-*` + tokens only). Reuse existing state-layer patterns (`Button` ghost/tonal or `::before` + `--fynns-state-*`).
4. **Export** — `src/index.ts` barrel.
5. **Document** — update [`AGENTS.md`](../../AGENTS.md) keep-set line; Cursor rules if the public list is mirrored there.
6. **Demo** — sandbox Globals or Preview sample in the **same** change (public API = what sandbox shows; see [`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md)).
7. **Verify** — `npm run typecheck`; browser-verify rendered UI (workspace rule `browser-verify-ui`).

## Permanent skips

Do **not** implement: TimePicker dial / 表盘, LoadingIndicator, ButtonGroup, RangeSlider, BlockingLoadingOverlay, PanelSkeleton.

## Source map

- `src/primitives/`, `src/index.ts`, `src/theme/tokens.ts`
- `examples/sandbox/src/pages/GlobalsPage.tsx` (+ Preview canvases)
- `AGENTS.md`, `llm/BREAKING_PURGE.md`
