# 约束 + Sandbox 呈现 + 消费仓修复

消费仓 UI 模式错误（错误 primitive、密度、对齐、宿主）时：**禁止只改 app**。
同一任务内完成 core 约束 → sandbox 可教样例 → 发布 → 消费仓子代理验证。

**权威流程：** 读取并严格遵循 [`.cursor/skills/constrain-then-consumer/SKILL.md`](../skills/constrain-then-consumer/SKILL.md)（内容与旧 rule 一致；本命令为手动触发器）。

用户补充：$ARGUMENTS

## 硬门禁

- 七步闭环见 skill；消费仓上报的 bug 必须 sandbox + consumer **双端 browser 验证**
- 子代理仅 Auto；见用户 rule「子代理仅使用 Auto 模型」
- 浏览器验证见 `.cursor/rules/browser-verify-ui.mdc`
