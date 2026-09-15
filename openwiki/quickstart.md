# @fynn7/ui-design-core — 快速开始

本仓是 Fynn 共享的**暗青（dark-teal）UI 设计系统**：权威 `--fynns-*` design tokens + 自研无依赖 React primitives（无 Radix、无 sonner）。npm 包名 `@fynn7/ui-design-core`，消费侧 Vite 别名通常为 `@fynns/ui`。日常用同级 checkout 的 `file:` 链接；GitHub Packages 仅可选发布路径。

公开 API = sandbox 里演示过、且通过 `npm run check:wysiwyg` 的符号（见 `src/index.ts` barrel）。

## 本机怎么跑

```bash
npm install
npm run sandbox          # 启动 examples/sandbox（Globals / Layouts / Preview）
npm run check            # typecheck + wysiwyg + perf + no-consumer + doc-links + unit + e2e
npm run gen:theme        # src/theme/tokens.ts → theme.css
npm run typecheck
npx vitest run <file>    # 单测；全量 npm run test:unit
```

查公开符号 / props（勿整读大文件）：

```bash
node scripts/api.mjs --list
node scripts/api.mjs <Name>
node scripts/api.mjs --search <regex>
node scripts/api.mjs --tokens <regex> [--values]
```

消费侧安装（同级零 token）：见 [`llm/CONSUME.md`](../llm/CONSUME.md)。本仓开发入口摘要亦见根目录 [`README.md`](../README.md)。

## 关键目录

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 公开 barrel |
| `src/primitives/` | React 组件实现（约 80+ `.tsx`）；样式在 `src/primitives/css/<domain>.css` |
| `src/theme/` | `tokens.ts` / `motionTokens.ts` → `theme.css`；scrollbar、themeMode 等 |
| `src/layout/` | 溢出测量等布局辅助（如 `useOverflowBounds`） |
| `src/scheduling/` | busy 调度（`busyTask` / `runBusyTask`） |
| `examples/sandbox/` | 活示例 = 公开表面（Vite playground） |
| `docs/DESIGN_SYSTEM.md` | 设计 SoT 入口；子页在 `docs/design-system/` |
| `llm/` | 消费契约、条约索引、purge、本地 LLM 接口 |
| `scripts/` | gen-theme、门禁、api、sibling 安装脚本 |
| `e2e/` | Playwright（含 `treaty/` 等） |
| `AGENTS.md` | Agent 常驻精简版（目录地图 + 硬约束摘要） |

## 权威文档去哪读

| 需要 | 打开 |
|------|------|
| Hard rules / 组件目录 / 密度 | [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) → `docs/design-system/` |
| 在别的 app 安装 / 绿地骨架 | [`llm/CONSUME.md`](../llm/CONSUME.md) |
| 消费失败模式索引 | [`llm/CONSUMER_TREATY.md`](../llm/CONSUMER_TREATY.md) |
| 已删 API 与替代 | [`llm/BREAKING_PURGE.md`](../llm/BREAKING_PURGE.md) |
| 发布 / bump | [`docs/package-propagation.md`](../docs/package-propagation.md) |
| 文档全表 | [`llm/AGENT_INTERFACES.md`](../llm/AGENT_INTERFACES.md) |

架构分层见 [`architecture/overview.md`](architecture/overview.md)。
