# fynns UI design system

This repo is the **core** design system (`@fynn7/ui-design-core` + alias
`@fynns/ui`). Authority: `AGENTS.md`. Install into consumers:
`llm/CONSUME.md` / `scripts/install-as-npm.mjs`.

**Public API purge:** `llm/BREAKING_PURGE.md` — only symbols demoed in sandbox
Globals + Preview are public.

**Consumer failure-mode index:** `llm/CONSUMER_TREATY.md` (slug → AGENTS +
sandbox). Pasteable consumer rule: `llm/consumer-cursor-rule.mdc`.

## Rules

- Build UI from `@fynns/ui` keep-set primitives (`AGENTS.md` catalog). Reach for
  an existing keep-set primitive before writing a new control.
- Style with `--fynns-*` tokens only. Never hardcode hex/rgba. Fonts: inherit
  `ui` for body/chrome; `mono` for code; never `serif` for main prose.
- Do NOT reintroduce `@radix-ui/*` or `sonner`. Do not resurrect purged Toast /
  Popover / Panel / BlockingLoadingOverlay APIs.
- Consumers: props-only — no local `.fynns-*` restyles. Missing capability →
  implement here first, then bump + publish (`docs/package-propagation.md`) and
  bump the consumer package version.
- Do not use a git submodule for day-to-day consume.
