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
npm run check:consumers -- --target <消费包> [--target <消费包> ...] # 逐一检查受影响消费仓
```

改动消费契约 / 门禁或要求多个消费仓迁移时，完成前必须对每个受影响消费包运行
`check:consumers`，再运行消费包自己的类型 / 构建检查。core 的 `npm run check`
不证明消费仓已兼容；不得仅凭同步成功、修了部分报错或 core 单测通过宣称完成。

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
   纯信息/状态提示用 InfoHint；完成/结果已存在用 `icon={<CheckIcon aria-hidden />}`，眼睛只表示查看/显隐。禁止自建微型 SVG/span 提示变体；保留标准 16dp glyph 与圆形 hover/focus target。
   Card / Collapsible header 的 Button / IconButton / InfoHint / 菜单按钮统一 `size="sm"`（32dp）；core CSS 对包装后的按钮同样限为小号，禁止大号实心圆按钮撑 header。正文动作按所在场景密度执行。
5. 滚动容器必须 `fynns-scroll`（`PageScroll` 已封装），禁原生条。
6. 加载 / 空 / 错误必显：应用开屏用 `AppLoadingScreen`（不透明主题背景 + 居中扫光 logo，自动优先已配置图标 → 字母缩写头像 → core 标记，无骨架 / 可见文案 / 加载圈；JS 配置图标传 `logoSrc`）；应用内用 `BusyRegion` / `BusyScrim` / `EmptyState` / `InlineAlert`；骨架仅在即将渲染的内容原位占位，加载画面无可见文案；`LoadingSkeleton` 默认加粗的宽幅文字骨架（非 fill 六行，fill 省略 lines 时按高度自适应铺满），内容冷启动画布内边距由 core 保留，禁止清零或在整窗格固定六行；Block 仅用于图片 / iframe 等整块内容，禁 compact / 小型居中文字徽记；真实 `value` 用线性进度；加载圈永久 archive/deprecated，强烈不推荐消费仓使用；瞬时用 `snackbar` + `<SnackbarHost />`。
   内容骨架只绘制条带：根节点、包装层、BusyRegion overlay / BusyScrim 骨架背景透明，冷启动 / 已有内容刷新及明暗主题均禁黑底、洗色、backdrop blur 和阴影面板；保留宿主主题表面，禁消费侧 `.fynns-*` 覆盖。AppLoadingScreen 仍不透明，阻塞骨架保留焦点 / 输入锁定。
7. Popover / Tooltip 定位走 `floatingBox`，勿手写 ad-hoc 几何。
8. a11y 默认在线；动效用 motion token，勿随意写 ms。
9. 消费侧 UI 问题遵循 本机 `constrain-then-consumer` 完整技能（OpenCode：`@constrain-then-consumer`；Codex：`$constrain-then-consumer`）：同一 agent 完成 core 与指定消费仓的实施及真实页面验收。先查既有能力与实际依赖；可复用缺陷修 core，已有 API 的误用修消费调用，禁消费侧私有 CSS 补丁。尊重只改 core 的范围；不默认子代理、发布或全消费仓迁移。
10. Sandbox / 文档不得含消费产品文案（`npm run check:no-consumer`）。
11. **永久跳过**：TimePicker dial / LoadingIndicator / ButtonGroup / RangeSlider（已有数字 TimePicker 足够）。
12. 勿 git commit / push，除非用户明确要求。
13. 正文 / 图注用 `--fynns-line-height-body`；图文流用 `.fynns-content-flow`，图集用 `.fynns-media-gallery` + `figure.fynns-media-figure`。图→图注固定 8dp，图集行列与正文块间固定 16dp。禁止 tight/snug 压正文、清零 gap、负 margin 或 `<br>` 补间距。详见 `docs/design-system/content-rhythm.md` 与 sandbox `#sandbox-content-rhythm`。

按钮操作组用 Toolbar / `.fynns-control-cluster`：含文字 Button / Menu 的整行 8dp，纯图标 4dp；禁止私人紧凑 gap / 按钮 margin，Toolbar 外层 gap 不控制内层。抽屉 section title 用 NavigationDrawerHeadline / Group；首标题距 sheet 上缘 24dp，内部 Divider→标题 16dp，禁止清零 body/headline padding。见 `docs/design-system/form-rhythm.md`。

密度与列表条约以 sandbox + `docs/DESIGN_SYSTEM.md` Hard rules 为准；不确定就 Read 对应小节，勿猜测。

工作区与所有 greenfield 默认强制遵守 [workspace-chrome.md](docs/design-system/workspace-chrome.md)：顶栏一个 ghost 纯图标侧栏 toggle（同一按钮开/关，禁侧栏内第二个关闭）；Home 为顶栏 HomeIcon，返回为 ghost ArrowLeftIcon，均无可见文字；导航首项为“新建资源”菜单；重命名只从目标导航项右键菜单进入并支持键盘，禁画布顶栏重命名按钮。常规检查器操作为水平 ghost 图标组，禁整宽纵向 primary/danger 堆叠；每组最多一个 primary；Dialog feet 的取消为 ghost、保存为右侧唯一 primary。禁止全大写 UI 文案/uppercase 装饰。用户未指定反馈方式时错误优先 snackbar，其次持久 InlineAlert；InlineAlert 保留内容宽度、居中与 16dp 文字→关闭间距，用 onDismiss + dismissAriaLabel 内置 ghost X，禁 message 内嵌按钮。活例 `#layouts-demo-workspace-chrome` / `#sandbox-inline-alert-dismiss`，静态门禁 `npm run check:workspace-ui` 及消费 export gate；动态/跨文件行为仍须浏览器验证。

画布工具强制用 `.fynns-workspace-canvas` → `.fynns-workspace-tools` → floating Toolbar（四周 16dp，可关闭并由顶栏恢复）；禁贴边整宽圆角 docked 条。页面内 docked 用 `.fynns-docked-tools-inset` 保留四周 16dp。持久可操作错误用 `WorkspaceNoticeStack`：画布右上角 16dp、内容宽度、每条 ghost X 与恢复动作同卡、16dp 堆叠、稳定 id 去重、core 进出/收拢动效和 reduced-motion；禁另开重试工具条，关闭提示不得清除错误业务状态。活例 `#layouts-demo-canvas-workspace`。干净整洁设计按 [UI_REWARD_SIGNALS.md](llm/UI_REWARD_SIGNALS.md) 给予 10 分证据评分；目标 10/10，违反硬约束不得以高分抵消。

画布工作区只允许一个浮动编辑 Toolbar。原上方整宽大工具栏的模式/方向/布局/导出全部收进 TopAppBar 的一个 ghost 纯图标 DropdownMenu（MoreHorizontalIcon + Tooltip + aria-label），禁换成第二条浮动工具栏或多个并列菜单。主区用 `.fynns-workspace-panes` 包含画布与 EndAside，同一整高行直接接顶栏下缘，延伸到底部状态栏上缘；禁在整行之前放工具栏/占位容器导致右栏上部断裂。菜单浮层不得改变画布/右栏尺寸。门禁检查共享 canvas/panes 与同文件封装，浏览器仍须验证实际数量与边缘。

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
