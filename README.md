# @fynns/ui-design-core

Fynn's shared **dark-teal UI design system**: canonical `--fynns-*` tokens +
self-developed React primitives (no `radix`, no `sonner`). This repo is
**public**. Day-to-day consumers link a sibling checkout (`file:`) + Vite alias
`@fynns/ui`. GitHub Packages (`@fynn7/ui-design-core`) remains optional for
publish / bump workflows (Packages still needs a token even when the git repo
is public).

## Authority docs

| Need | Doc |
| --- | --- |
| Design language, Hard rules, keep-set | [`AGENTS.md`](AGENTS.md) |
| Install / consume | [`llm/CONSUME.md`](llm/CONSUME.md) |
| Consumer pasteable rule + failure index | [`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc), [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md) |
| Breaking purge | [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md) |
| Perf (shells / inspectors) | [`llm/PERF.md`](llm/PERF.md) |
| Publish / bumps | [`docs/package-propagation.md`](docs/package-propagation.md) |
| Agent wiki nav | [`openwiki/quickstart.md`](openwiki/quickstart.md) |
| Glossary | [`CONTEXT.md`](CONTEXT.md) |

## Install (consumer)

**Zero-token (preferred for apps like CV Generator):** clone this repo next to the
consumer (`../fynns_ui_design_core`, usually `dev`) and `file:`-link it. No
`NODE_AUTH_TOKEN`. CV Generator `npm run setup` auto-clones the sibling when
missing.

```bash
git clone https://github.com/Fynn7/fynns_ui_design_core.git
# then from the consumer, or via that app's setup script:
# npm install @fynn7/ui-design-core@file:../fynns_ui_design_core
```

**Packages publish / bump** (optional):

```bash
# from a checkout of this repo (needs NODE_AUTH_TOKEN / GITHUB_TOKEN read:packages)
npm run consume:install -- --target ../my-app --json
npm run consume:check -- --target ../my-app --json
```

Manual Packages path: `.npmrc` → `@fynn7:registry=https://npm.pkg.github.com` +
auth token; `npm install @fynn7/ui-design-core`; Vite alias `@fynns/ui` →
`node_modules/@fynn7/ui-design-core/src/index.ts`. Full steps: [`llm/CONSUME.md`](llm/CONSUME.md).

**Do not** use a git submodule for day-to-day consume. Legacy submodule notes
(archived): [`docs/submodule-propagation.md`](docs/submodule-propagation.md).

## Local sandbox

```bash
npm install
npm run sandbox          # aesthetic / Globals playground
npm run check            # typecheck + wysiwyg + perf-sandbox + no-consumer
npm run gen:theme        # tokens.ts → theme.css
```

Public surface = sandbox Globals + Layouts + Preview only
(`npm run check:wysiwyg`).

## Package

- Name: `@fynn7/ui-design-core` (GitHub Packages)
- Alias for app imports: `@fynns/ui`
- Publish: [`docs/package-propagation.md`](docs/package-propagation.md)
