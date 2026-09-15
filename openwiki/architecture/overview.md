# 架构概览

本仓是**可发布的设计系统库**（非空仓、非纯文档仓）：源码在 `src/`，活契约在 `examples/sandbox/`，设计 SoT 在 `docs/`，消费契约在 `llm/`。

## 分层（对照真实目录）

```
消费应用 (@fynns/ui 别名 / file: @fynn7/ui-design-core)
        │
        ▼
src/index.ts          ← 公开 barrel（仅 sandbox 演示过的符号）
        │
        ├── src/theme/       tokens / motionTokens → theme.css；scrollbar、themeMode
        ├── src/primitives/  React 控件 + css/<domain>.css
        ├── src/layout/      溢出与几何辅助（overflowBounds 等）
        └── src/scheduling/  BusyScrim / BusyRegion 所用 busyTask
        │
examples/sandbox/     ← Vite 活示例 = 公开表面真源（Globals / Layouts / Preview）
docs/ + llm/          ← 设计规则与消费条约（非运行时）
scripts/              ← gen-theme、wysiwyg / no-consumer 等门禁、api.mjs
e2e/ + vitest         ← Playwright 条约用例 + 单元测试
```

## 包出口（`package.json` exports）

| 子路径 | 指向 |
|--------|------|
| `.` | `src/index.ts` |
| `./theme.css` | `src/theme/theme.css` |
| `./styles.css` | `src/styles.css` |
| `./tokens` | `src/theme/tokens.ts` |
| `./scrollbar` | `src/theme/scrollbar.ts` |

peer：`react` / `react-dom` ^19。

## 设计纪律（架构后果）

- 样式只走 `--fynns-*`；新值改 `src/theme/tokens.ts`（或 motion）后 `npm run gen:theme`。
- 扩 barrel 必须同任务在 sandbox 加活示例，并由 `check:wysiwyg` 守门。
- 消费侧 props-only：不在消费仓覆写 `.fynns-*` 或 keep-set 半径/展开 chrome；缺能力回本仓改。
- Sandbox / 文档禁止粘贴消费产品文案（`check:no-consumer`）。

## 相关入口

- 人类 / Agent 快速开始：[`../quickstart.md`](../quickstart.md)
- 设计 SoT：[`../../docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md)
- Agent 精简地图：[`../../AGENTS.md`](../../AGENTS.md)
