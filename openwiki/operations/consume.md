---
type: Concept
title: Consume into apps
description: How consumer repos install @fynns/ui via GitHub Packages and alias.
tags: [consume, npm, github-packages, vite]
---

# Consume into apps

**Authority (do not restate):** [`llm/CONSUME.md`](../../llm/CONSUME.md) and
[`llm/consume.json`](../../llm/consume.json). Migration table:
[`llm/BREAKING_PURGE.md`](../../llm/BREAKING_PURGE.md). Package publish / bumps:
[`docs/package-propagation.md`](../../docs/package-propagation.md).

## One-shot

```bash
# from this core checkout (NODE_AUTH_TOKEN / GITHUB_TOKEN with read:packages)
npm run consume:install -- --target <CONSUMER_ROOT> --json
npm run consume:check -- --target <CONSUMER_ROOT> --json
```

## Source map

- `llm/CONSUME.md`, `llm/consume.json`, `llm/BREAKING_PURGE.md`
- `scripts/install-as-npm.mjs`
- `docs/package-propagation.md`
- `.github/workflows/publish-package.yml`
