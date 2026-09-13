# 任务（请浏览器 LLM 回答）

你在看的是 `@fynn7/ui-design-core`（暗青设计系统）的 **Agent 常触达面** 打包：目录树 + 入口文档 + 条约/规则 + barrel，**不是**全量 primitives/CSS 实现。

请给出可执行的「大面积瘦身、清理」方案，目标是：**之后大幅节省 Agent 遍历本 repo 的 token**，且 **不损失核心要点**（设计 SoT、Hard rules、消费契约、可发现的组件目录仍在）。

请按优先级输出：

1. **立刻可删 / 可移出 git 跟踪 / 可 gitignore**（`.tmp-*`、审计截图、重复文档、过时 dump）
2. **可压缩 / 拆分 / 外置**（超大单文件：sandbox Globals、i18n、DESIGN_SYSTEM、CSS 包、tokens、llm 长文）——说明拆到哪、入口还留什么摘要
3. **Agent 上下文面精简**（`AGENTS.md`、alwaysApply rules、repomix 配置、OpenWiki）：常驻 vs 按需 Read 的边界怎么画
4. **保留清单（不可丢）**：列必须留下的「核心要点」文件与一句话理由
5. **预期收益**：粗估每类动作能省多少遍历/常驻 token（数量级即可）
6. **风险与回归门禁**：瘦身后如何保证 sandbox / consume / check 不哑火

约束：这是设计系统源仓，消费者 props-only；不要建议把核心 primitive 实现「删掉只留类型」除非明确是文档/演示面。优先「文档与演示瘦身 + 索引化」，其次才是代码结构。
