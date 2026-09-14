# @fynn7/ui-design-core

Fynn's shared **dark-teal UI design system**: canonical `--fynns-*` tokens +
self-developed React primitives (no `radix`, no `sonner`). Public repo.
Consumers link a sibling checkout (`file:`) and import through the Vite alias
`@fynns/ui`; GitHub Packages (`@fynn7/ui-design-core`) is optional for
publishers only.

## Where to read

| Need | Doc |
| --- | --- |
| Install into an app / greenfield skeleton | [`llm/CONSUME.md`](llm/CONSUME.md) |
| Props of any export | `node scripts/api.mjs <Name>` (`--list`, `--search`, `--tokens`) |
| Design language, Hard rules, keep-set | [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) (resident summary: [`AGENTS.md`](AGENTS.md)) |
| Consumer failure-mode index / pasteable rule | [`llm/CONSUMER_TREATY.md`](llm/CONSUMER_TREATY.md), [`llm/consumer-cursor-rule.mdc`](llm/consumer-cursor-rule.mdc) |
| Deleted APIs → replacements | [`llm/BREAKING_PURGE.md`](llm/BREAKING_PURGE.md) |
| Publish / bumps | [`docs/package-propagation.md`](docs/package-propagation.md) |
| Local LLM (LM Studio + OpenCode) | [`llm/LOCAL_LLM.md`](llm/LOCAL_LLM.md) |
| Full doc catalog | [`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md) |

## Install (consumer, zero-token)

```bash
git clone https://github.com/Fynn7/fynns_ui_design_core.git   # next to your app
node ../fynns_ui_design_core/scripts/ensure-sibling-ui-core.mjs --target . --install --npmrc --json
node ../fynns_ui_design_core/scripts/install-as-npm.mjs --target . --sibling --json
```

No `NODE_AUTH_TOKEN`, no git submodule. Details and the app skeleton:
[`llm/CONSUME.md`](llm/CONSUME.md).

## Develop here

```bash
npm install
npm run sandbox          # Globals / Layouts / Preview playground (= public surface)
npm run check            # typecheck + wysiwyg + perf + no-consumer + doc-links + unit + e2e
npm run gen:theme        # tokens.ts → theme.css
```

Public API = what the sandbox demos (`npm run check:wysiwyg`).
