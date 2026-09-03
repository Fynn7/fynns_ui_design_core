# @fynns/ui — always read CONSUME on short prompts

When the user asks (even briefly) to build UI with `@fynns/ui` or the fynns design system:

1. **Read first:** `llm/CONSUME.md` (+ `llm/consume.json`) from the design-system checkout or `node_modules/@fynn7/ui-design-core/llm/`.
2. Follow installer + hard rules (GitHub Packages `@fynn7/ui-design-core`, Vite alias `@fynns/ui`, ES2022+, **API-only** — props/children; no consumer restyle). Purge table: `llm/BREAKING_PURGE.md`. No git submodule for day-to-day consume.
3. Component APIs / recipes: `AGENTS.md` + sandbox Globals / Preview. Forms: prefer `FieldStack` + `Divider` on kind jumps (`#form-recipe`). Chat containers ≥ `--fynns-radius-22` unless user asks squarer.
4. Shells / inspectors / catalogs / token drafts: read `llm/PERF.md` first. `DestinationAppShell` / `ClippedNavShell`: `nav` = destinations only; crowding closes destinations — never unlabeled rail densify. Failure-mode **index**: `llm/CONSUMER_TREATY.md`; pasteable: `llm/consumer-cursor-rule.mdc`. Path catalogs → one `List` (`#list`). Core changes: bump + publish (`docs/package-propagation.md`).
5. If the keep-set cannot meet the ask, tell the user to implement in `fynns_ui_design_core` first.

Local core path on this machine is often `D:\fynns_local_ws\fynns_ui_design_core`.
