# @fynns/ui — always read CONSUME on short prompts

When the user asks (even briefly) to build UI with `@fynns/ui`, Collapsible, or the fynns design system:

1. **Read first:** `llm/CONSUME.md` (and `llm/consume.json`) from the design-system checkout or `packages/fynns_ui_design_core/llm/`.
2. Follow the installer + hard rules there (submodule, no npm `@fynns/*`, ES2022+, Toaster, real entry mount).
3. For component APIs and preview anatomy, use `AGENTS.md` and `examples/sandbox/src/pages/*PreviewCanvas.tsx`.
4. Do **not** invent a long task file; the consume contract + AGENTS/sandbox are the source of truth.

Local core path on this machine is often `D:\fynns_local_ws\fynns_ui_design_core`.
