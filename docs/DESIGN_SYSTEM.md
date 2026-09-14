# Design system（完整 SoT）

> 本文由原根目录胖 `AGENTS.md` 迁出。OpenCode **常驻**只加载根目录精简 [`AGENTS.md`](../AGENTS.md)；需要完整 Hard rules / 组件目录时再按下方目录 Read 对应子页。其它仓应 **链接** 本文或 `llm/CONSUME.md`，勿整份复制。

Authoritative guide for humans and AI agents working with the fynns UI design
system. This is the **single source of truth** for the design language; other
repos should link here, not duplicate it. Long-form sections live under
[`docs/design-system/`](design-system/).

## What this is

A dark-teal design system: canonical `--fynns-*` CSS tokens + self-developed,
dependency-free React primitives. Consumed as source via the `@fynns/ui` alias
into **`@fynn7/ui-design-core`**.

**Installing into a consumer repo (zero-token sibling + Vite alias):** follow
[`llm/CONSUME.md`](../llm/CONSUME.md). Day-to-day = public sibling checkout
`../fynns_ui_design_core` + `file:` link — **no** `NODE_AUTH_TOKEN` /
GitHub Packages login. Helper:
`scripts/ensure-sibling-ui-core.mjs` / `npm run consume:install -- --target
<consumer-root> --sibling`. Machine contract:
[`llm/consume.json`](../llm/consume.json). Do **not** use a git submodule for
day-to-day consume. Publish / optional Packages bumps:
[`docs/package-propagation.md`](package-propagation.md).
**Public API purge / migration:** [`llm/BREAKING_PURGE.md`](../llm/BREAKING_PURGE.md).
**Short prompts:** still start from `llm/CONSUME.md` (install + greenfield skeleton) and look props up with `node scripts/api.mjs <Name>` — do not expect a long task brief.

## Directory

| Topic | Page |
| --- | --- |
| Design philosophy & UX principles | [`design-system/philosophy.md`](design-system/philosophy.md) |
| Hard rules (Do / Don't) | [`design-system/hard-rules.md`](design-system/hard-rules.md) |
| Tokens | [`design-system/tokens.md`](design-system/tokens.md) |
| Component catalog (Keep set) | [`design-system/catalog.md`](design-system/catalog.md) |
| Platform targeting | [`design-system/platform.md`](design-system/platform.md) |
| Content density | [`design-system/content-density.md`](design-system/content-density.md) |
| Chrome type & row proportion | [`design-system/chrome-proportion.md`](design-system/chrome-proportion.md) |
| Form rhythm (toolbar / FieldStack / inset) | [`design-system/form-rhythm.md`](design-system/form-rhythm.md) |
| Icons | [`design-system/icons.md`](design-system/icons.md) |
| Adding to the system | [`design-system/contributing.md`](design-system/contributing.md) |

**High-traffic sandbox anchors (start here):**

| Topic | Anchor |
| --- | --- |
| Form / FieldStack / Dialog | `#form-recipe`, `#field-header`, `#sandbox-field-stack-grid-select` |
| List catalogs / density | `#list`, `#page-scroll`, `#sandbox-list-status-action`, `#sandbox-list-repo-path-actions`, `#sandbox-list-recipe-catalog` |
| Timeline | `#timeline` |
| Toolbar / ControlRow / end-align | `#rhythm` |
| Provider Manage (active-only status) | `#provider-settings` |
| Banner strip + dismiss center | `#banner` |
| Busy / loading | `#busy-region`, `#sandbox-pane-load-error` |
| Busy hang guards (timeout/abort) | `#busy-paint`, `#sandbox-busy-task-timeout`, `#sandbox-busy-task-abort`, `#sandbox-busy-task-generation`, `#sandbox-button-loading-task`, `#sandbox-confirm-loading-trap`, `#sandbox-chat-busy-no-stop` |
| CodeBlock file body | `#code-block` |
| Env key FieldHeader | `#env-check` / `#password` / `#provider-settings` |
| Card head Select / draft / chrome icons | `#sandbox-card-head-select`, `#sandbox-card-draft-actions`, `#sandbox-card-chrome-icon-actions`, `#sandbox-card-head-primary-end` |
| Destination shell / EndAside | `#layouts-demo-shell`, `#layouts-demo-drill-in`, `#layouts-demo-fill-column` |
| Mode drawer / bulk | `#layouts-demo-navigation-drawer` |
| Mode drawer catalog load fail | `#sandbox-navdrawer-mode-catalog-fail` / `#layouts-demo-navigation-drawer` |
| Command chrome proportion | `#command-palette` |
| Flush-start overlay | `#fullscreen-flush` |
| Split / Tree / Chart / Table | `#split-pane`, `#tree`, `#chart`, `#table` |
| Icons | `#icons` |
