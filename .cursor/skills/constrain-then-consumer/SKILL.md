---
name: constrain-then-consumer
description: >-
  Consumer-reported UI pattern bugs — constrain in core, sandbox living demo,
  bump/publish, consumer subagent verify, then fleet-scan all consumers for
  the same failure. Use when a consumer screen is wrong (primitive, density,
  alignment, host) or when the user runs /constrain-then-consumer.
disable-model-invocation: true
---

# 约束 + Sandbox 呈现 + 消费仓修复

When a consumer UI is wrong (wrong primitive, density, alignment, host),
**do not** only patch the app. Same-task loop — **all steps** are hard:

1. **Core constraint** — `AGENTS.md` (catalog / Content density / Hard rules).
2. **Failure mode index** — `llm/CONSUMER_TREATY.md` (slug → AGENTS + sandbox
   `#anchor`). Do not reintroduce long treaty essays; fix the rule in AGENTS /
   core CSS, then add/update the index row if the slug is new.
3. **Pasteable** — `llm/consumer-cursor-rule.mdc`, then **re-paste** into the
   consumer `.cursor/rules/fynns-ui-consumer.mdc` (installer does not overwrite).
4. **Public recipe in core** if CSS is needed (e.g. `.fynns-table-meta`,
   `.fynns-control-cluster--end-align` / `__grow`). Do **not** invent a
   consumer `.hub-*` clone of a keep-set pattern.
5. **Sandbox living sample (hard)** — update **Globals / Preview / Layout
   templates** in the **same task** so the fixed pattern is visible and
   teachable. Pick the closest `#…` demo (e.g. `#field-header`, `#form-recipe`,
   `#list`, `#rhythm`) or extend it. Run **browser verification in sandbox**
   (`.cursor/rules/browser-verify-ui.mdc`) before publish.
6. **Bump + publish** `@fynn7/ui-design-core` in the same task
   (`docs/package-propagation.md`). Do not ship via a sibling Vite alias.
7. **Reporting consumer via subagent (hard when bug came from a consumer
   screen)** — **dispatch a Task subagent** into that consumer checkout to
   `npm install` the new version and run **browser verification** there (not
   sandbox-only). Consumer fix = props / keep-set classes / own strings only.
   Parent stays in `fynns_ui_design_core` (see `stay-in-core-repo` rule).
8. **Fleet scan all consumers (hard after constrain + publish)** — after steps
   1–7 land, **do not stop at the reporting repo**. In the **same task**:
   - Discover every sibling checkout under the local workspace that depends on
     `@fynn7/ui-design-core` (scan `package.json` trees; skip `node_modules`).
   - **Dispatch many Task subagents in parallel** (one consumer root per
     subagent; **Auto only** — never set `model`). Each subagent:
     1. Searches that checkout for the **same failure class** just constrained
        (treaty slug + AGENTS DON'T + pasteable bullets + typical wrong CSS /
        props / host trees — e.g. inventing `align-items: center` on
        `.fynns-grid`, List path Switch+Chip soup, …).
     2. Fixes every hit **props-only** (or bumps core if the fix needs the
        new version); re-pastes `fynns-ui-consumer.mdc` when the pasteable
        changed.
     3. **Re-checks** each fix: static proof (grep / computed style) and, when
        the app can boot, **browser verification** on the fixed screens.
   - Parent waits for / summarizes all subagents. **Fail the task** if any
     consumer still violates after claimed fixes.

**Do not** report done with only (1) core CSS, (7) one-consumer patch, or a
fleet grep without fixes — (5) sandbox demo + browser proof in the reporting
consumer **and** (8) clean fleet scan are required when the bug was
consumer-reported (or when the user runs `/constrain-then-consumer`).

Generic placeholders in sandbox (see `no-consumer-content.mdc`).
