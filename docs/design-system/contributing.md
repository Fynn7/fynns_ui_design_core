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
4. **Propagation:** use the specified consumer's actual dependency mode.
   Daily sibling `file:` does not require a package release. Follow
   [`docs/package-propagation.md`](../package-propagation.md); publish, commit
   and push only with user authorization. Verify the actual resolved core
   path/version rather than assuming the app loaded a source change.
5. **Consumer UI issues:** load the installed, self-contained
   `constrain-then-consumer` skill (`@constrain-then-consumer` in OpenCode,
   `$constrain-then-consumer` in Codex).
   One agent completes core and the explicitly specified consumers, including
   sandbox and real-page browser verification. Fix reusable defects in core;
   correct misuse of existing public APIs in the consumer. No mandatory
   subagent, publication or migration of unrelated consumers. Honor explicit
   core-only scope and mark consumer implementation/verification pending.
