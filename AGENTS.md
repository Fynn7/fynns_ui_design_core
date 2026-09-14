# AGENTS.md — @fynn7/ui-design-core（常驻精简版）

> 常驻上下文只有本文件。完整 Hard rules / 组件目录 / 令牌 → [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)（按需 `Read` 对应子页，勿整份塞进会话）。
> 消费安装 + 绿地骨架 → [`llm/CONSUME.md`](llm/CONSUME.md)。本机 LM Studio / OpenCode 预算 → [`llm/LOCAL_LLM.md`](llm/LOCAL_LLM.md)。文档全表 → [`llm/AGENT_INTERFACES.md`](llm/AGENT_INTERFACES.md)。

## 定位

暗青设计系统：`--fynns-*` token + 自研无依赖 React primitives。包名 `@fynn7/ui-design-core`，消费别名 `@fynns/ui`。日常同级 `file:` 链接，勿默认走 GitHub Packages。

## 目录地图

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 公开 barrel（只导出 sandbox 演示过的符号） |
| `src/primitives/` | 组件实现；样式在 `src/primitives/css/<domain>.css` |
| `src/theme/tokens.ts` → `theme.css` | token 源 → `npm run gen:theme` 生成 |
| `src/layout/`, `src/scheduling/` | 溢出测量 / busy 调度辅助 |
| `examples/sandbox/` | 活示例 = 公开表面（`GlobalsPage.tsx` 300 KB，勿整读） |
| `llm/` | 消费契约、条约索引、purge 表、本地模型 |
| `docs/design-system/` | 设计 SoT 子页 |
| `scripts/` | 门禁与消费安装脚本 |

## Token 纪律（本地小模型必读）

1. **查 API 用工具，不读整文件：** `node scripts/api.mjs <Name> …` 打印 props/签名；`--list` 列全部公开符号；`--search <regex>`；`--tokens <regex> [--values]` 列 `--fynns-*`。
2. **禁止整读**：`examples/sandbox/src/pages/GlobalsPage.tsx`、`examples/sandbox/src/i18n/messages.ts`、`src/theme/tokens.ts`、任何 `*.css`、`package-lock.json`。需要片段时 `Read` 带行号范围（≤ 120 行）或 `rg -n <pattern> <path> -m 5`。
3. Grep 必须限定目录（`src/primitives`、`docs/design-system`、`llm`），带 `--glob`；结果只取前几条。
4. 一次只做一步：读 → 改 → `npm run typecheck`（或 `npx vitest run <file>`），不要把多份长输出堆进同一轮。
5. 完整设计规则只在需要时 `Read docs/design-system/<章节>.md` 的对应小节，不要连续读多章。

## 测试与检查

- 单测：`npx vitest run <file>`（全量 `npm run test:unit`）；类型：`npm run typecheck`
- 门禁：`npm run check`（typecheck + wysiwyg + perf + no-consumer + doc-links + unit + e2e）
- 新 token：改 `tokens.ts` / `motionTokens.ts` 后 `npm run gen:theme`

## 设计原则（摘要）

1. **只用 `@fynns/ui`**：禁止 Radix / sonner / 原生 select·dialog·alert 当产品控件。
2. **样式只走 `--fynns-*`**：禁止散落 hex/rgba；缺值加 token 再 gen。
3. **图标动作用 Tooltip + aria-label**，禁止 `title=`；自明关闭/清除可无 Tooltip。
4. **滚动容器必须 `fynns-scroll`**（`PageScroll` 已封装）；禁原生条。
5. **加载 / 空 / 错误必显**：`BusyRegion` / `BusyScrim` / `EmptyState` / `InlineAlert`；瞬时 → `snackbar` + `<SnackbarHost />`。
6. **a11y 默认在线**；动效用 motion token，勿随意 ms。
7. **密度与列表条约**以 sandbox + `docs/DESIGN_SYSTEM.md` Hard rules 为准；不确定就 Read 对应小节，勿猜测。

## 硬约束

1. 勿改对外 API 签名，除非任务明确要求；扩 barrel 须同任务加 sandbox 活示例（`npm run check:wysiwyg`）。
2. 勿改测试内容当判官；以现有测试为准。
3. Popover/Tooltip 定位走 `floatingBox` 辅助，勿手写 ad-hoc 几何。
4. 勿 git commit / push，除非用户明确要求。
5. 消费侧 bug：优先在 **本仓** 约束（文档/条约/CSS），再修消费者；勿只在消费仓打补丁。
6. Sandbox / 文档不得含消费产品文案（`npm run check:no-consumer`）。
7. **永久跳过**：TimePicker dial / LoadingIndicator / ButtonGroup / RangeSlider（已有数字 TimePicker 足够）。

## 何时再读长文

| 需要 | 打开 |
|------|------|
| 完整 Hard rules / 组件目录 / 密度 | `docs/DESIGN_SYSTEM.md` → `docs/design-system/<章节>.md` |
| 在别的 app 里安装 / 绿地骨架 | `llm/CONSUME.md` |
| 消费仓失败模式索引 | `llm/CONSUMER_TREATY.md`（slug → sandbox `#anchor`） |
| 删掉的 API 与替代 | `llm/BREAKING_PURGE.md` |
| 发布 / bump | `docs/package-propagation.md` |
| 本机小模型 / LM Studio / OpenCode | `llm/LOCAL_LLM.md` |
