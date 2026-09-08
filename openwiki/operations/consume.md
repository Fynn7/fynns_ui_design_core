---
type: Concept
title: Consume into apps
description: How consumer repos install @fynns/ui via zero-token sibling file: (optional GitHub Packages for publishers).
tags: [consume, npm, sibling, vite]
---

# Consume into apps

**Authority (do not restate):** [`llm/CONSUME.md`](../../llm/CONSUME.md) and
[`llm/consume.json`](../../llm/consume.json). Migration table:
[`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md). Package publish / bumps:
[`docs/package-propagation.md`](../../docs/package-propagation.md).

## One-shot (zero-token)

```bash
# from this core checkout — no NODE_AUTH_TOKEN
node scripts/ensure-sibling-ui-core.mjs --target <CONSUMER_ROOT> --install --npmrc --json
npm run consume:install -- --target <CONSUMER_ROOT> --sibling --json
npm run consume:check -- --target <CONSUMER_ROOT> --json
```

## Source map

- `llm/CONSUME.md`, `llm/consume.json`, `llm/BREAKING_PURGE.md`
- `scripts/ensure-sibling-ui-core.mjs`, `scripts/install-as-npm.mjs`
- `docs/package-propagation.md`
- `.github/workflows/publish-package.yml`
