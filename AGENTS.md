# AGENTS.md — @fynn7/ui-design-core

暗青设计系统：`--fynns-*` token + 自研无依赖 React primitives。包名 `@fynn7/ui-design-core`，消费别名 `@fynns/ui`。日常同级 `file:` 链接，勿默认走 GitHub Packages。

## 目录地图

| 路径 | 用途 |
|------|------|
| `src/index.ts` | 公开 barrel（只导出 sandbox 演示过的符号） |
| `src/primitives/` | 组件实现；样式在 `src/primitives/css/<domain>.css` |
| `src/theme/tokens.ts` → `theme.css` | token 源 → `npm run gen:theme` 生成 |
| `examples/sandbox/` | 活示例 = 公开表面（`GlobalsPage.tsx` 300 KB，**勿整读**） |
| `llm/`、`docs/design-system/` | 消费契约、条约索引、设计 SoT 子页 |

## 验证

```
npx vitest run <file>        # 单测（全量 npm run test:unit）
npm run typecheck            # 类型
npm run check                # 门禁：typecheck + wysiwyg + perf + no-consumer + doc-links + unit + e2e
npm run gen:theme            # 改过 tokens.ts / motionTokens.ts 之后
```

## 查 API：用工具，不读整文件

```
node scripts/api.mjs <Name>              # props / 签名
node scripts/api.mjs --list              # 全部公开符号
node scripts/api.mjs --search <regex>
node scripts/api.mjs --tokens <regex> [--values]
```

**禁止整读**：`examples/sandbox/src/pages/GlobalsPage.tsx`、`examples/sandbox/src/i18n/messages.ts`、`src/theme/tokens.ts`、任何 `*.css`、`package-lock.json`。
需要片段时 `Read` 带行号范围（≤ 120 行）或 `rg -n <pattern> <path> -m 5`。
Grep 必须限定目录（`src/primitives` / `docs/design-system` / `llm`）并带 `--glob`。

## 硬约束

1. **只用 `@fynns/ui` 与 `--fynns-*`**：禁止 Radix / sonner / 原生 select·dialog·alert 当产品控件；禁止散落 hex/rgba，缺值先加 token 再 `gen:theme`。
2. **勿改对外 API 签名**，除非任务明确要求。扩 barrel 须同任务加 sandbox 活示例（`npm run check:wysiwyg`）。
3. **勿改测试内容当判官**，以现有测试为准。
4. 图标动作用 Tooltip + aria-label，**禁止 `title=`**（自明的关闭/清除可无 Tooltip）。
5. 滚动容器必须 `fynns-scroll`（`PageScroll` 已封装），禁原生条。
6. 加载 / 空 / 错误必显：`BusyRegion` / `BusyScrim` / `EmptyState` / `InlineAlert`；瞬时用 `snackbar` + `<SnackbarHost />`。
7. Popover / Tooltip 定位走 `floatingBox`，勿手写 ad-hoc 几何。
8. a11y 默认在线；动效用 motion token，勿随意写 ms。
9. 消费侧 bug：**优先在本仓约束**（文档 / 条约 / CSS），再修消费者；勿只在消费仓打补丁。
10. Sandbox / 文档不得含消费产品文案（`npm run check:no-consumer`）。
11. **永久跳过**：TimePicker dial / LoadingIndicator / ButtonGroup / RangeSlider（已有数字 TimePicker 足够）。
12. 勿 git commit / push，除非用户明确要求。

密度与列表条约以 sandbox + `docs/DESIGN_SYSTEM.md` Hard rules 为准；不确定就 Read 对应小节，勿猜测。

## 何时读长文

| 需要 | 打开 |
|------|------|
| 完整 Hard rules / 组件目录 / 密度 | `docs/DESIGN_SYSTEM.md` → `docs/design-system/<章节>.md`（读一节，勿连读多章） |
| 视觉语汇 / 术语（写文档时） | [`docs/GLOSSARY.md`](docs/GLOSSARY.md) |
| 在别的 app 里安装 / 绿地骨架 | [`llm/CONSUME.md`](llm/CONSUME.md) |
| 消费仓失败模式索引 | `llm/CONSUMER_TREATY.md`（slug → sandbox `#anchor`） |
| 删掉的 API 与替代 | `llm/BREAKING_PURGE.md` |
| 发布 / bump | `docs/package-propagation.md` |
| 本机小模型 / LM Studio / OpenCode 预算 | `llm/LOCAL_LLM.md` |
| 文档全表 | `llm/AGENT_INTERFACES.md` |
