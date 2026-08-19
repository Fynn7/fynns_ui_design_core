---
name: constrain-then-consumer
description: >-
  Consumer-reported UI pattern bugs — constrain in core, sandbox living demo,
  bump/publish, consumer subagent verify. Use when a consumer screen is wrong
  (primitive, density, alignment, host) or when the user runs /constrain-then-consumer.
disable-model-invocation: true
---

# 约束 + Sandbox 呈现 + 消费仓修复

When a consumer UI is wrong (wrong primitive, density, alignment, host),
**do not** only patch the app. Same-task loop — **all three** are hard:

1. **Core constraint** — `AGENTS.md` (catalog / Content density / Hard rules).
2. **Failure mode** — `llm/CONSUMER_TREATY.md` (symptoms / cause / consumer fix).
3. **Pasteable** — `llm/consumer-cursor-rule.mdc`, then **re-paste** into the
   consumer `.cursor/rules/fynns-ui-consumer.mdc` (installer does not overwrite).
4. **Public recipe in core** if CSS is needed (e.g. `.fynns-table-meta`,
   `.fynns-control-cluster--end-align` / `__grow`). Do **not** invent a
   consumer `.hub-*` clone of a keep-set pattern.
5. **Sandbox living sample (hard)** — update **Globals / Preview / Layout
   templates** in the **same task** so the fixed pattern is visible and
   teachable. Pick the closest `#…` demo (e.g. `#field-header`, `#form-recipe`,
   `#list`, `#rhythm`) or extend it; add a new catalog row only when no host
   fits. The sample must **show the corrected geometry/hosts** — never leave a
   demo that still teaches the anti-pattern (Chip-in-`#table` lesson). Run
   **browser verification in sandbox** (`.cursor/rules/browser-verify-ui.mdc`)
   before publish — not CSS-only reasoning.
6. **Bump + publish** `@fynn7/ui-design-core` in the same task
   (`docs/package-propagation.md`). Do not ship via a sibling Vite alias.
7. **Consumer via subagent (hard when bug came from a consumer screen)** —
   **dispatch a subagent** (or continue in that checkout) to `npm install` the
   new version and run **browser verification** there (not sandbox-only).
   Consumer fix = props / keep-set classes / own strings only — drop private
   restyles of `.fynns-*`. Follow `.cursor/rules/browser-verify-ui.mdc` /
   verifying-in-browser in the consumer repo.

**Do not** report done with only (1) core CSS or (7) consumer patch — (5)
sandbox demo + browser proof in **both** repos when the bug was consumer-reported.

Consumer-only AGENTS bullets are allowed **after** the core recipe + sandbox
sample exist, and must **link** here — not restate the spec.

Generic placeholders in sandbox (see `no-consumer-content.mdc`).
