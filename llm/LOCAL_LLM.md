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
5. GPU 分配：默认 **`--gpu 0.3`**。本机 smoke（4060 8 GB / ctx 32k）：`0.3` ≈ 2.7 tok/s，`0.4` ≈ 2.3，`max` ≈ 1.3；`max` 估显存 22 GiB，溢出到内存后更慢。不要为了「榨满 GPU」选 `max`。
6. 上下文长度：默认 **32768**。smoke：decode 16k/24k/32k 接近（≈2.2–2.5 tok/s）；短 prefill 16k 明显更快，但绿地会话峰值曾到 ≈26.5k，**24k/16k 会顶窗**。只有同时降 `limit.output` 并接受更短会话才考虑 `24576`。

### OpenCode（`~/.config/opencode/opencode.json`，旧版已备份为 `opencode.json.bak-before-plain-lms-*`）

| 项 | 值 | 目的 |
|----|----|------|
| provider `lmstudio` | `@ai-sdk/openai-compatible` → `http://127.0.0.1:1234/v1`；`timeout/headerTimeout/chunkTimeout: false` | 8 min 的 prompt 处理不会被超时打断 |
| model `qwen38-q4xl` | `limit.context 32768 / output 4096`，`reasoningEffort: low`，variants low/medium | 可用窗口 ≈ 28.7k（绿地峰值曾 ≈26.5k；6144 余量几乎为 0，已改回 4096） |
| `tools` | 关 `task / webfetch / websearch / codesearch / todowrite / todoread / skill` | system prompt 从 ≈12k 降到 ≈4k；无子代理、无联网 |
| `tool_output` | `max_lines 300 / max_bytes 8000` | 单次工具输出 ≤ ≈2k tokens（原 12000≈3k；绿地曾顶到 11899，再压回灌） |
| `compaction` | `auto + prune`，`preserve_recent_tokens 2000` | 真要压缩时只保留很短的近期上下文（原 3000；再短一点减摘要后体积） |
| `plugin: []`，`mcp: {}` | 停用 oh-my-opencode-slim 与内置 MCP | 单卡 8 GB 跑不起多代理；每个子代理都要再付一次 system prompt |
| `permission.external_directory` | **仅**允许 `D:/fynns_local_ws/fynns_ui_design_core/**` | 绿地可读 sibling UI core；**禁止**整棵 `fynns_local_ws`（含各仓 `node_modules`）|
| `instructions` | 4 个短规则（含 `search-budget.md` 禁父目录 recurse + `fynns-ui-consume.md` → `llm/CONSUME.md`） | 软约束 + 消费入口 |

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
