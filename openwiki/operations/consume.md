---
type: Concept
title: Consume into apps
description: How consumer repos install @fynns/ui via submodule and alias.
tags: [consume, submodule, vite]
---

# Consume into apps

**Authority:** [`llm/CONSUME.md`](../../llm/CONSUME.md) and [`llm/consume.json`](../../llm/consume.json). This page is a pointer only.

## Hard rules (short)

1. Git submodule + source alias `@fynns/ui` → `packages/fynns_ui_design_core/src/index.ts`.
2. Never add `@fynns/ui` / `@fynns/ui-design-core` to consumer `package.json` dependencies.
3. Vite `dedupe: ["react", "react-dom"]`.
4. Consumer `compilerOptions.target` / `lib` ≥ **ES2022**.
5. Do not import purged symbols — [`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md).
6. Transient feedback: `snackbar(...)` + mount **one** root `<SnackbarHost />` near the app entry (not per-page).

## One-shot

```bash
# from this core checkout
npm run consume:install -- --target <CONSUMER_ROOT> --json
npm run consume:check -- --target <CONSUMER_ROOT> --json
```

## Source map

- `llm/CONSUME.md`, `llm/consume.json`, `llm/BREAKING_PURGE.md`
- `scripts/install-as-submodule.mjs`, `scripts/install-as-submodule.ps1`
- `docs/submodule-propagation.md`
