# @fynns/ui — always read CONSUME on short prompts

When the user asks (even briefly) to build UI with `@fynns/ui`, Collapsible, or the fynns design system:

1. **Read first:** `llm/CONSUME.md` (and `llm/consume.json`) from the design-system checkout or `packages/fynns_ui_design_core/llm/`.
2. Follow the installer + hard rules there (submodule, no npm `@fynns/*`, ES2022+, real entry mount, **API-only** — props/children only; no consumer restyle wrappers). Do not use purged symbols — see `llm/BREAKING_PURGE.md`.
3. For component APIs and preview anatomy, use `AGENTS.md` and `examples/sandbox/src/pages/*PreviewCanvas.tsx`. Chat containers must stay ≥ `--fynns-radius-22` unless the user explicitly asks squarer. Inspector / settings / Dialog forms: **strongly prefer `FieldStack`** to partition options by semantic kind, with a horizontal **`Divider` between FieldStacks** on kind jumps (see AGENTS.md **FieldStack semantic clusters** / `#form-recipe`) — do not flatten multi-topic FieldBlocks. **CodeBlock:** `label` is filename chrome only — always pass matching `language` / profile (`llm/AGENT_INTERFACES.md`); fill editors need `autoGrow={false}`.
4. For **shells / inspectors / catalogs / live token drafts**, also read `llm/PERF.md` and apply its DoD before coding. For `ClippedNavShell`, keep `navMode` in sync with Drawer vs Rail children — see `llm/CONSUMER_TREATY.md` / `llm/consumer-cursor-rule.mdc` (never rail-width + labeled drawer). Sandbox Globals/Preview resting look is the consumer default (WYSIWYG); never restyle `.fynns-*` in the app. **ChatMessage:** prefer `markdown` / `ChatMarkdown` for LLM turns (do not dump raw Markdown as bare children).
5. Do **not** invent a long task file; the consume contract + AGENTS/sandbox (+ PERF when triggered) are the source of truth. If the keep-set cannot meet the ask, tell the user to implement in `fynns_ui_design_core` first.

Local core path on this machine is often `D:\fynns_local_ws\fynns_ui_design_core`.
