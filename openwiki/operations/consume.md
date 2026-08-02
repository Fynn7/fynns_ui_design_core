---
type: Concept
title: Consume into apps
description: How consumer repos install @fynns/ui via submodule and alias.
tags: [consume, submodule, vite]
---

# Consume into apps

**Authority (do not restate):** [`llm/CONSUME.md`](../../llm/CONSUME.md) and
[`llm/consume.json`](../../llm/consume.json). Migration table:
[`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md). Submodule pin propagation:
[`docs/submodule-propagation.md`](../../docs/submodule-propagation.md).

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
