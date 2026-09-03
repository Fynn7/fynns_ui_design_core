# @fynns/ui-design-core

Fynn's shared **dark-teal UI design system**: canonical `--fynns-*` tokens +
self-developed React primitives (no `radix`, no `sonner`). Consumed as source via
GitHub Packages (`@fynn7/ui-design-core`) + Vite alias `@fynns/ui`.

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

```bash
# from a checkout of this repo (needs NODE_AUTH_TOKEN / GITHUB_TOKEN read:packages)
npm run consume:install -- --target ../my-app --json
npm run consume:check -- --target ../my-app --json
```

Manual: `.npmrc` → `@fynn7:registry=https://npm.pkg.github.com` + auth token;
`npm install @fynn7/ui-design-core`; Vite alias `@fynns/ui` →
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
