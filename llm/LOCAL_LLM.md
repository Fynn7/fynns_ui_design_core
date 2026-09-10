# 本地小模型上下文（8G / Q4 / ~32k ctx）

权威约定：本文件。OpenCode 会自动注入根目录 [`AGENTS.md`](../AGENTS.md)（已精简）。**不要**把完整设计文档或 15 万 token 的 repomix 包塞进首轮上下文。

## 本机预算（与钉版引擎对齐）

- llama-server：`engine/presets/p0-low.json` → `ctx_size: 32768`，KV `q8_0`
- OpenCode `llamacpp/qwen38-q4xl` → `limit.context: 32768`
- 建议：**常驻包 / 首轮粘贴 ≤ ctx 的 20–30%**（约 6–10k tokens）；其余靠 Read / Grep

## 推荐工作方式

1. 新会话只靠精简 `AGENTS.md` + 任务描述。
2. 需要色值 / 某组件实现时 **按路径 Read**，不要整包 `src/theme/tokens.ts` 或全部 primitives。
3. Grep **必须**带仓库根 `path`；禁止搜 `C:\Users\…` 或跨仓乱扫。
4. 需要契约 / breaking 时再 Read `llm/*.md`，勿打进常驻 repomix。

## Repomix（可选，按任务裁剪）

配置在仓库根：

| 配置 | 用途 | 预期量级 |
|------|------|----------|
| [`repomix.local-llm.config.json`](../repomix.local-llm.config.json) | **默认本地包**：短 AGENTS + layout + scheduling（无 tokens / llm / 全 primitives） | 宜 ≤ ~8k tokens |
| [`repomix.scheduling.config.json`](../repomix.scheduling.config.json) | 只打 scheduling | 更小 |
| [`repomix.primitives-compress.config.json`](../repomix.primitives-compress.config.json) | 全量 primitives 签名（compress） | **仍约 8 万 tokens** — 勿粘进 32k 本地会话；仅云端大 ctx 或按 `--include` 再裁 |

```powershell
cd D:\fynns_local_ws\fynns_ui_design_core
npx --yes repomix -c repomix.local-llm.config.json
npx --yes repomix -c repomix.scheduling.config.json
# 按任务裁 primitives 示例（把需要的组件名写进 --include）:
# npx --yes repomix -c repomix.primitives-compress.config.json --include "AGENTS.md,src/primitives/Button.tsx,src/primitives/List.tsx"
```

输出文件已 gitignore。跑完看 summary 的 **真实 token 数**；粘进本地会话前确认 **≪ 8k**。

**结构性建议：** 多数 OpenCode 任务 **不必** 先 repomix；精简 `AGENTS.md` + 工具按需 Read/Grep 通常更省、更少触发 compaction。
