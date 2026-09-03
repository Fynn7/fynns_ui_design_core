---
type: Concept
title: fynns UI design core Quickstart
description: How agents should navigate this design-system package and where authority docs live.
tags: [fynns-ui, quickstart, design-system]
---

# @fynns/ui-design-core quickstart

Dark-teal design system: `--fynns-*` tokens + self-developed React primitives.
Consumed as **source** via GitHub Packages (`@fynn7/ui-design-core`) + Vite alias
`@fynns/ui`.

## Start here (authority — do not restate)

| Need | Doc |
|------|-----|
| Design language, Hard rules, keep-set | [`AGENTS.md`](../AGENTS.md) |
| Install into a consumer | [`llm/CONSUME.md`](../llm/CONSUME.md) |
| Failure-mode slug index | [`llm/CONSUMER_TREATY.md`](../llm/CONSUMER_TREATY.md) |
| Deleted APIs → replacements | [`llm/BREAKING_PURGE.md`](../llm/BREAKING_PURGE.md) |
| Publish / bumps | [`docs/package-propagation.md`](../docs/package-propagation.md) |
| Live public surface | `npm run sandbox` → Globals + Preview |

## Local scripts

```bash
npm run gen:theme
npm run check
npm run sandbox
npm run consume:install -- --target ../my-app --json
```

## See also

- [Architecture overview](./architecture/overview.md)
- [Add a primitive](./workflows/add-primitive.md)
- [Consume into apps](./operations/consume.md)
- Brief: [`INSTRUCTIONS.md`](./INSTRUCTIONS.md)
