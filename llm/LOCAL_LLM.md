# 本地小模型：LM Studio + OpenCode（Qwen3.8-27B UD-Q4_K_XL）

权威约定：本文件。目标是「正常运行、不反复 compaction」，不追求速度。

## 本机与实测（2026-09-14）

| 项 | 值 |
|----|----|
| 机器 | i5-12400F · 32 GB RAM · RTX 4060 8 GB |
| 模型 | `qwen3.8-27b-ud`（unsloth UD-Q4_K_XL，17.6 GB，大部分权重落在系统内存） |
| 上下文 | 32768（KV q8_0 ≈ 4 GB；f16 ≈ 8 GB，会把 32 GB 挤爆） |
| prompt 处理 | ≈ 23 tok/s → 每 **4k** 新 prompt ≈ 3 min；首轮 12k system prompt ≈ 9 min |

### 为什么之前一直 compaction

- 旧配置的 system prompt ≈ **12k tokens**：oh-my-opencode-slim 编排提示 + 3 个内置 MCP（context7 / exa / grep.app）+ ast_grep / task / cancel_task 等 **20 个工具**描述。
- OpenCode 可用窗口 = `limit.context − limit.output` = 32768 − 4096 ≈ **28k**；扣掉 12k 只剩 16k 给对话。
- 单个工具输出默认可达 50 KB（≈ 12k tokens）；`compaction.prune` 只在工具输出累计 > 40k tokens 时生效，32k 窗口下**永远不触发**。
- 每次 compaction = 整段上下文重算（≈ 10 min）+ 生成摘要；插件 `fallback.timeoutMs: 120000` 又在 2 分钟时中断并重试 → 恶性循环。

## 现在的配置（已落盘）

### LM Studio

启动 / 加载：`pwsh -File "$HOME\.config\opencode\lmstudio-qwen38.ps1"`（可加 `-Gpu 0.3` / `-Ctx 24576`）。
等价命令：`lms load qwen3.8-27b-ud --identifier qwen38-q4xl --context-length 32768 -y`。

只能在 GUI 里做一次的每模型设置（My Models → 模型 → 齿轮）：

1. **Flash Attention 开、K/V cache 量化 q8_0**（否则 32k KV 占 8 GB）。
2. **Prompt Template → reasoning_effort 默认值改成 `low`**。LM Studio 目前只暴露 On/Off，API 传 `reasoning_effort` 会被忽略并回落到模板默认（`xhigh`）；模板默认改成 `low` 才是真正的「low thinking」。可选：推理 token 预算 ≈ 1024。
3. **Preserve Thinking 关**：Qwen3.8 默认把历史轮的思考重新塞回 prompt，32k 窗口顶不住。
4. 设置 → 默认上下文长度 8192 只影响 JIT 自动加载；**必须**用上面的命令显式加载（带 `--context-length 32768`），否则模型会以 8k 上下文加载。
5. GPU 分配：不要强制 `--gpu max`（8 GB 装不下 17.6 GB，会走 sysmem fallback 变慢）；先用自动，再试 `--gpu 0.3`。

### OpenCode（`~/.config/opencode/opencode.json`，旧版已备份为 `opencode.json.bak-before-plain-lms-*`）

| 项 | 值 | 目的 |
|----|----|------|
| provider `lmstudio` | `@ai-sdk/openai-compatible` → `http://127.0.0.1:1234/v1`；`timeout/headerTimeout/chunkTimeout: false` | 8 min 的 prompt 处理不会被超时打断 |
| model `qwen38-q4xl` | `limit.context 32768 / output 6144`，`reasoningEffort: low`，variants low/medium | 可用窗口 ≈ 26.6k |
| `tools` | 关 `task / webfetch / websearch / codesearch / todowrite / todoread / skill` | system prompt 从 ≈12k 降到 ≈4k；无子代理、无联网 |
| `tool_output` | `max_lines 300 / max_bytes 12000` | 单次工具输出 ≤ ≈3k tokens，超出落盘只回预览 |
| `compaction` | `auto + prune`，`preserve_recent_tokens 3000` | 真要压缩时只保留很短的近期上下文 |
| `plugin: []`，`mcp: {}` | 停用 oh-my-opencode-slim 与内置 MCP | 单卡 8 GB 跑不起多代理；每个子代理都要再付一次 system prompt |
| `instructions` | 4 个短规则（含 `rules/fynns-ui-consume.md` → 指向本仓 `llm/CONSUME.md`） | 消费仓里也能找到入口 |

恢复旧多代理配置：把 `.bak-before-plain-lms-*` 拷回 `opencode.json` / `tui.json` 即可。

## 工作方式

1. 新会话只带精简 `AGENTS.md` + 任务；一次一步（读 → 改 → typecheck），长任务拆成多个会话。
2. 查 API 用 `node scripts/api.mjs <Name>`（`--list` / `--search` / `--tokens`），**不要**整读 `src/` / sandbox / CSS / `tokens.ts`。
3. Grep 必须限定目录 + `--glob`，只取前几条；Read 带行号范围（≤ 120 行）。
4. 消费仓（绿地 app）：入口 [`CONSUME.md`](CONSUME.md)；安装脚本会把 [`consumer-AGENTS.md`](consumer-AGENTS.md) 写成该 app 的 `AGENTS.md`。
5. 上下文一旦被污染（大输出 / 反复失败）：**新开会话**，不要在原会话硬塞。
6. 不再使用 repomix 打包：32k 窗口下任何整仓包都是负收益。

## 验证

- `lms log stream`：看每次请求的 `Prompt processing … n_tokens`；首轮应 ≈ 4–5k，而不是 12k。
- OpenCode 会话内 `/status`（或底栏）看 token 占用；正常一个 10 步的小任务应停留在 15k 以内。
- 出现 `Reasoning setting 'low' is not supported … Falling back to 'on'` 属正常：LM Studio 忽略 API 值，以模板默认为准（见上）。
