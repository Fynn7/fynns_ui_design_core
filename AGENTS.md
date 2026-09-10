# AGENTS.md — @fynn7/ui-design-core（本地核心版）

> **常驻进 OpenCode system 的只有本文件（几 KB）。**  
> 完整设计语言 / Hard rules / 组件目录 / 令牌说明 → [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)（按需 `Read`，勿整份塞进会话或 repomix 常驻包）。  
> 消费安装条约 → [`llm/CONSUME.md`](llm/CONSUME.md)。本地小模型打包 → [`llm/LOCAL_LLM.md`](llm/LOCAL_LLM.md)。

## 定位

暗青设计系统：`--fynns-*` token + 自研无依赖 React primitives。对外包名 `@fynn7/ui-design-core`，消费别名 `@fynns/ui`。日常同级 `file:` 链接，勿默认走 GitHub Packages。

## 目录地图

| 路径 | 用途 |
|------|------|
| `src/primitives/` | 组件实现 |
| `src/layout/` | 布局 / clamp |
| `src/theme/` | tokens / CSS（色值细节按需 Read `tokens.ts`，勿整文件常驻） |
| `src/scheduling/` | busy / 调度辅助 |
| `examples/sandbox/` | 活示例（条约 demos） |
| `llm/` | 消费契约 / breaking（日常改 src 时按需读） |
| `docs/DESIGN_SYSTEM.md` | 完整 SoT（原胖 AGENTS） |

## 测试与检查

- 单测：`npx --yes vitest@3.2.4 run <file>`
- 门禁：`npm run check`（typecheck + unit + sandbox e2e）
- 新 token：改 `tokens.ts` / `motionTokens.ts` 后 `npm run gen:theme`

## 设计原则（摘要）

1. **只用 `@fynns/ui`**：禁止 Radix / sonner / 原生 select·dialog·alert 当产品控件。
2. **样式只走 `--fynns-*`**：禁止散落 hex/rgba；缺值加 token 再 gen。
3. **图标动作用 Tooltip + aria-label**，禁止 `title=`；自明关闭/清除可无 Tooltip。
4. **滚动容器必须 `fynns-scroll`**：禁原生条；overlay thumb 由 core 管。
5. **加载 / 空 / 错误必显**（Progress / Empty / InlineAlert 等）。
6. **a11y 默认在线**；动效用 motion token，勿随意 ms。
7. **密度与列表条约**以 sandbox + `docs/DESIGN_SYSTEM.md` Hard rules 为准；不确定就 Read 对应小节，勿猜测。

## 硬约束（本地 agent）

1. 勿改对外 API 签名，除非任务明确要求；扩 barrel 须同任务加 sandbox 活示例。
2. 勿改测试内容当判官；以现有测试为准。
3. Popover/Tooltip 定位走 floating 辅助，勿手写 ad-hoc 几何。
4. 勿 git commit / push，除非用户明确要求。
5. 消费侧 bug：优先在 **本仓** 约束（文档/条约/CSS），再修消费者；勿只在消费仓打补丁。
6. **永久跳过**：TimePicker dial / LoadingIndicator / ButtonGroup / RangeSlider 变体（已有数字 TimePicker input 足够）。

## 何时再读长文

| 需要 | 打开 |
|------|------|
| 完整 Hard rules / 组件目录 | `docs/DESIGN_SYSTEM.md` |
| 安装进消费仓 | `llm/CONSUME.md` |
| breaking / purge | `llm/BREAKING_PURGE.md` |
| 发版传播 | `docs/package-propagation.md` |
