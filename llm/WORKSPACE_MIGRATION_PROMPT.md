# Consumer workspace migration prompt

Paste the task below in the consumer repository.

```text
请完成当前消费仓的工作区 UI 重构，保持现有业务功能和数据完整。

先确认实际 UI app package，再将同级 fynns_ui_design_core 更新到 origin/dev
且版本至少为 0.5.309。保留 file: 依赖及 @fynns/ui alias，不改走 Packages。
不要覆盖脏的 core 工作树。同步最新 consumer-cursor-rule.mdc，并把新增约束
合并进消费仓现有 AGENTS.md；保留该仓自己的其他规则。
在实际 UI app package 中刷新 file: 安装，确认其 node_modules 中的 core
版本及公开 barrel 已包含 WorkspaceNoticeStack，不能只更新同级源仓。

先读 core 中：
- docs/design-system/workspace-chrome.md
- llm/UI_REWARD_SIGNALS.md
- examples/sandbox/src/components/CanvasWorkspaceDemo.tsx
- examples/sandbox/src/components/WorkspaceChromeDemo.tsx
通过 scripts/api.mjs 查 WorkspaceNoticeStack、Toolbar、IconButton 的 API。

落实全部约束：
1. 顶栏 Home/Back/侧栏 toggle 均为 ghost 纯图标，Tooltip + aria-label。
   侧栏开关由同一个按钮处理，删除检查器内的冗余关闭按钮。
   导航首项是“新建资源”菜单；重命名只从被右键的导航项 ContextMenu
   进入 Dialog，并支持 Shift+F10/ContextMenu 键。右键不改变当前选中项。
2. 用 .fynns-workspace-canvas 承载画布，.fynns-workspace-tools 内使用
   floating Toolbar，保持 16dp 边距，可用 ghost X 关闭、从顶栏恢复。
   删除贴边整宽圆角 docked 工具条。普通页面的 docked 工具必须放入
   .fynns-docked-tools-inset，四周保留 16dp。
3. 操作失败默认 error snackbar + 单一 SnackbarHost，按需带重试动作。
   持久可操作问题改用 core WorkspaceNoticeStack，放在受影响画布内：
   右上角、内容宽度、16dp 堆叠，每条 ghost X 和恢复动作放在同一卡内。
   删除另起的重试/另存容器及重复反馈。普通持久正文才使用 InlineAlert。
4. 提示 id 绑定资源与问题类型；同一问题更新原提示，多问题独立恢复、
   独立关闭。onDismiss 只移除呈现，不清除未解决错误或恢复暂停保存。
   异步恢复进行中禁用对应动作，成功后才移除该问题；失败保留真实状态。
   提示关闭后，仍能从现有菜单到达恢复/另存。数组为空也保持 Stack 挂载。
5. 直接复用 core 的定位、去重、出现/退出/收拢动效和 reduced-motion。
   不复制 sandbox 动画/定位 CSS，不写私人计时器、不覆盖 .fynns-*。
   窄画布工具移至左下，提示保留右上并在自己的 fynns-scroll 区域溢出滚动。
6. 检查器常规动作是一行 ghost 图标；文字组 8dp、纯图标组 4dp。
   每组最多一个 primary；Dialog feet 的取消为 ghost，保存为右侧唯一
   primary。禁止全大写 UI 装饰、无用途容器、补丁 margin 和私人颜色。

完成实际重构并运行消费 export/workspace gate、类型检查及构建。
在浏览器验证深浅主题、桌面/窄屏、单条/多条/长提示、重复 id、关闭中间
一条、恢复失败/成功、关闭后恢复入口、键盘焦点、减少动效设置。
测量开关工具和提示前后的画布尺寸，确认未变，且无贴边、重叠或溢出。
提供截图与交互证据，按 UI_REWARD_SIGNALS.md 自评 10 分；低分继续修复，
硬违规不得用高分抵消。交付修改摘要、验证结果、截图和评分依据。
```
