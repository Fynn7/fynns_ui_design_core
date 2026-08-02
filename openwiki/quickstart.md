---
type: Concept
title: fynns UI design core Quickstart
description: How agents should navigate this design-system package and where authority docs live.
tags: [fynns-ui, quickstart, design-system]
---

# @fynns/ui-design-core quickstart

Dark-teal design system: canonical `--fynns-*` tokens + self-developed React primitives. Consumed as **source** via git submodule + Vite alias `@fynns/ui` (never npm-install this package into consumers).

## Start here (authority — do not restate)

| Need | Doc |
|------|-----|
| Design language, hard rules, keep-set catalog | [`AGENTS.md`](../AGENTS.md) |
| Install into a consumer app | [`llm/CONSUME.md`](../llm/CONSUME.md) + [`llm/consume.json`](../llm/consume.json) |
| Deleted APIs → replacements | [`llm/BREAKING_PURGE.md`](../llm/BREAKING_PURGE.md) |
| Submodule pin propagation | [`docs/submodule-propagation.md`](../docs/submodule-propagation.md) |
| Live public surface | `examples/sandbox/` Globals + Preview |

## Local package scripts

```bash
npm run gen:theme    # tokens.ts → theme.css
npm run typecheck
npm run lint
npm run sandbox      # aesthetic / Globals playground
```

Consume into another app (from this checkout):

```bash
npm run consume:install -- --target ../my-app --json
npm run consume:check -- --target ../my-app --json
```

## OpenWiki on this machine (via Agents Hub)

Updates go through **Agents Hub → OpenWiki** (thin wrap: `openwiki code --update --print` + Cursor Agent CLI `auto` bridge). Brief: [`INSTRUCTIONS.md`](./INSTRUCTIONS.md).

> Note: `cursor-api-proxy` runs Cursor in **ask** mode; OpenWiki’s tool-calling write loop may stall. This wiki tree is **seeded** for agents; refresh surgically when code changes, or re-run update when a write-capable provider is available.

## See also

- [Architecture overview](./architecture/overview.md)
- [Add a primitive](./workflows/add-primitive.md)
- [Consume into apps](./operations/consume.md)
