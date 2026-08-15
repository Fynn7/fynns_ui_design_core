# Consumer treaty — pasteable `@fynns/ui` contract

**Purpose:** give any consumer repo a short, always-on agent rule so it obeys
`@fynns/ui` even when nobody opens `AGENTS.md` / `CONSUME.md`.

**Single paste source:** [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc)
(copy that entire file).

Install / design catalog remain elsewhere — this file only explains *why* and
*how* to paste. Do not duplicate the full design language here.

## How to paste (any consumer)

1. Create `.cursor/rules/fynns-ui-consumer.mdc` in the **consumer** root
   (or merge into an existing always-apply rule).
2. Paste the full contents of
   [`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).
3. Optional: one line in the consumer `AGENTS.md` / README:

   > UI: follow `.cursor/rules/fynns-ui-consumer.mdc` and the submodule
   > `packages/fynns_ui_design_core/llm/CONSUME.md`.

The consume installer may also drop this rule when wiring a consumer
(`scripts/install-as-submodule.mjs`); if the file already exists it is left
alone unless you re-copy by hand — **re-paste after treaty updates** (e.g. pin
freshness / Dialog row recipe / **CodeBlock `label` ≠ `language`** /
**ChatMessage Markdown ownership**). Local pin gate:
`consume --check` vs remote `main` — see [`CONSUME.md`](CONSUME.md) Hard rule 5a;
propagate bump PRs do not replace that check. Day-to-day local core edits →
consumer Vite: `npm run consume:sync -- --target <CONSUMER_ROOT>` (worktree
mirror; not a pin commit). Formal release still bumps the pin.

## Failure mode this treaty targets: sandbox-only aesthetics

Symptoms: Select / Input look rounder in the aesthetic sandbox than in a
consumer (e.g. `--fynns-radius-md` was 20px in sandbox resting but 8px in
shipped `theme.css`).

**Cause:** non-empty `SANDBOX_DEFAULT_OVERRIDES` in
`examples/sandbox/src/state/baseline.ts` — sandbox lies about the shipped
default. **Fix in core:** promote the nodded value into
`src/theme/tokens.ts` + `npm run gen:theme`, keep
`SANDBOX_DEFAULT_OVERRIDES` empty (`npm run check:wysiwyg`). Core maintainers:
public API deletes are **atomic** (export + source + sandbox demo +
`BREAKING_PURGE` Removed row) — see [`BREAKING_PURGE.md`](BREAKING_PURGE.md).

## Failure mode this treaty targets: squashed drawer

**Prefer** `DestinationAppShell` for greenfield — it syncs Drawer↔Rail for you.
Only hand-compose `ClippedNavShell` when you need a fully custom shell.

Symptoms (often on **first paint** after crowding / narrow init):

- Left column ~**80px** (`--fynns-navrail-width`)
- Labels stay **horizontal** (drawer items / headline)
- Unexpected **scrollbar** on the nav column (drawer body `overflow: auto`)
- Looks like “mini icon mode” but glyphs + text never became a real rail

**Not** a healthy `NavigationRail`. Mechanism:

1. `ClippedNavShell` sets `data-nav` / grid track from `navMode` only.
2. Crowding (`onNavCrowded` / `wouldClippedNavDrawerCrowd`) or app logic sets
   `navMode="rail"`.
3. Consumer keeps rendering `NavigationDrawer` + `NavigationDrawerItem`
   (optional `NavigationDrawerGroup` / `NavigationDrawerHeadline` for sections).
4. Drawer fills the **rail-width** track → cramped horizontal chrome + scroll.

Reference implementation:
[`examples/sandbox/src/shell/SandboxShell.tsx`](../examples/sandbox/src/shell/SandboxShell.tsx)
(`navMode` and `nav` swap together). Declarative default:
sandbox Layout templates `#layouts-demo-shell` (`DestinationAppShell`).
Catalog notes: [`AGENTS.md`](../AGENTS.md) (destination ladder).
Main canvas Preview+Chat: [`AGENTS.md`](../AGENTS.md) **FillColumn** (Layout
templates `#layouts-demo-fill-column`) — do not stack Preview / EmptyState /
Composer as canvas siblings.

Core slot shell does **not** auto-swap Drawer↔Rail. Dev builds warn when
`data-nav="rail"` still hosts `.fynns-nav-drawer`.

## Failure mode this treaty targets: plain CodeBlock despite a filetype label

Symptoms: titled head shows `system-prompt.xml` / `theme.json` / `tokens.ts`, but
the body is **one-color mono** (no keyword / string spans).

**Cause:** consumer set `label` (filename chrome) but omitted `language` (or
passed an unknown id). Core does **not** infer language from the label
extension. **Fix in the consumer:** pass matching `language` / profile; for
fill editors also `autoGrow={false}`. Authority:
[`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) (`label` ≠ `language`) +
[`CONSUME.md`](CONSUME.md) Hard rule 9b. Pasteable checklist:
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc).

## Failure mode this treaty targets: literal backticks in Chat bubbles

Symptoms: assistant/user turns show raw `` `token` `` / unrendered `**bold**` /
GFM lists inside `.fynns-chat-message-prose`.

**Cause:** the app passed the LLM Markdown **string** as bare `ChatMessage`
`children`. Prefer **`markdown={md}`** or **`<ChatMarkdown source={md} />`**
(core L2 subset). Raw children stay plain prose. Authority:
[`AGENTS.md`](../AGENTS.md) **Parity note (markdown / GFM)** + pasteable
[`consumer-cursor-rule.mdc`](consumer-cursor-rule.mdc) **ChatMessage Markdown**.

## Related docs

| Doc | Role |
| --- | --- |
| [`CONSUME.md`](CONSUME.md) | Install submodule + hard consume rules |
| [`consume.json`](consume.json) | Machine contract |
| [`AGENT_INTERFACES.md`](AGENT_INTERFACES.md) | Custom highlight + CodeBlock language hard rules |
| [`PERF.md`](PERF.md) | Shells / inspectors / catalogs |
| [`opencode-fynns-ui-consume.md`](opencode-fynns-ui-consume.md) | Short-prompt reminder |
| [`AGENTS.md`](../AGENTS.md) | Tokens + component catalog |
