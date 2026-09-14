# Adding to the system

← back to [Design system index](../DESIGN_SYSTEM.md)

1. New token → edit `tokens.ts` / `motionTokens.ts`, run `npm run gen:theme`,
   reference it as `var(--fynns-...)`.
2. New component → add `src/primitives/X.tsx` (+ styles in the matching
   `src/primitives/css/<domain>.css` — form Field cluster → `form-rhythm.css`;
   do **not** invent empty TSX for CSS-only hosts; barrel
   `src/primitives/primitives.css` keeps `@import` order),    export from
`src/index.ts`, document it in this file, **and add a live sample to sandbox
   Globals or Preview** in the same change. Prefer **one live sample +
   Preview switches** for optional anatomy (`icon`, `actions`, …) — do not
   stack every combo in Components. Do not expand the public barrel without
   that demo (see `llm/BREAKING_PURGE.md`).
3. Keep `npm run typecheck`, `npm run lint`, and `npm run check` green.
   `check` includes unit (`test:unit` / Vitest) and sandbox treaty e2e
   (`test:e2e` / Playwright on `:5174`). New CONSUMER_TREATY / Hard-rule
   regressions belong under [`e2e/treaty/`](../../e2e/treaty/) (DOM / geometry /
   interaction — not pixel screenshots).
4. **Bump + publish (hard):** every landed change consumers should see is a
   new GitHub Packages version in the **same task**. Authority:
   [`docs/package-propagation.md`](../package-propagation.md). Do **not**
   ship via a consumer Vite alias to this checkout.
5. **Consumer pattern bugs (hard):** same-task loop —    (a) constrain in this
   core (`docs/DESIGN_SYSTEM.md` + treaty + pasteable rule + public CSS if needed),
   (b) **update sandbox Globals / Preview / Layout demo** that teaches the fix
   and **browser-verify in sandbox**, (c) **dispatch a subagent** into the
   reporting consumer to bump, patch props-only if needed, and **browser-verify
   there**, (d) **fleet-scan every local `@fynn7/ui-design-core` consumer** with
   parallel Task subagents for the **same failure class**, fix all hits, and
   re-verify. Never a consumer-only patch. Cursor: `/constrain-then-consumer` →
   [`.cursor/skills/constrain-then-consumer/SKILL.md`](../../.cursor/skills/constrain-then-consumer/SKILL.md).
