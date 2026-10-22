import { useState } from "react";
import { applyFynnsThemeMode, getFynnsThemeMode, Button, Chat, ChatThread, ChatMessage, ChatComposer, ChatThinking, type ChatThinkingDetail } from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

/** One quiet task; attempts and operations are indented reasoning disclosures. */
export function ChatThinkingDetailsDemo({ inConversation = false }: { inConversation?: boolean }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [theme, setTheme] = useState(getFynnsThemeMode);
  const details: ChatThinkingDetail[] = [
    { id: "summary", text: zh ? "已核对输入并保留处理记录。" : "Checked the inputs and retained the processing record." },
    { id: "attempt-previous", label: zh ? "上次尝试 · 已中断" : "Previous attempt · interrupted", details: [
      { id: "retained", text: zh ? "连接中断。已完成的内容仍可回看。" : "The connection ended. Completed work remains available for review." },
    ] },
    { id: "attempt-current", label: zh ? "本次尝试" : "Current attempt", defaultOpen: true, details: [
      { id: "read", label: zh ? "已读取输入" : "Read the inputs", details: [
        { id: "read-result", text: zh ? "已核对 3 个文件。未记录传输耗时。" : "Checked 3 files. Transfer duration was not recorded." },
      ] },
      { id: "check", label: zh ? "已检查内容" : "Checked the content", defaultOpen: true, details: [
        { id: "check-summary", text: zh ? "保留可直接核实的信息；无法确认的内容标为未知。" : "Kept directly verifiable information; uncertain details remain unknown." },
        { id: "detail", label: zh ? "核验细节" : "Verification details", details: [
          { id: "long", text: zh ? "这是可换行的详细说明。窄屏中同样保留缩进、弱化文字和完整内容。" : "This longer explanation wraps within its available width. Narrow hosts retain indentation, muted text and the complete content." },
        ] },
      ] },
      { id: "finish", label: zh ? (running ? "正在准备结果…" : failed ? "准备结果 · 已停止" : "已准备结果") : (running ? "Preparing the result…" : failed ? "Preparing the result · stopped" : "Prepared the result"), streaming: running, defaultOpen: failed, details: [
        { id: "output", text: zh ? (running ? "等待确认；暂不估算百分比。" : failed ? "本次操作已停止。之前完成的内容仍然保留。" : "结果已就绪。操作入口位于 thinking 容器之外。") : (running ? "Awaiting confirmation; no reliable percentage is available." : failed ? "The operation stopped. Earlier completed work is retained." : "The result is ready. Result actions belong outside the thinking container.") },
      ] },
    ] },
  ];
  const thinking = <ChatThinking
    label={zh ? (failed ? "处理已停止 · 3 步 · 12 秒" : "已完成 3 步 · 12 秒") : (failed ? "Stopped after 3 steps · 12s" : "Completed 3 steps in 12s")}
    streaming={running}
    streamingLabel={zh ? "正在处理 · 准备结果" : "Processing · preparing the result"}
    open={open}
    onOpenChange={value => { setOpen(value); setPinned(true); }}
    details={details}
  />;
  const controls = <div className="fynns-control-cluster">
    <Button variant="tonal" disabled={running} onClick={() => { setFailed(false); setRunning(true); setOpen(true); setPinned(false); }}>{zh ? "模拟处理中" : "Simulate processing"}</Button>
    <Button variant="tonal" disabled={!running} onClick={() => { setFailed(false); setRunning(false); if (!pinned) setOpen(false); }}>{zh ? "完成" : "Complete"}</Button>
    <Button variant="tonal" disabled={!running} onClick={() => { setFailed(true); setRunning(false); if (!pinned) setOpen(true); }}>{zh ? "停止" : "Stop"}</Button>
    {inConversation && <Button variant="ghost" onClick={() => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); applyFynnsThemeMode(next, { persist: false }); }}>{theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}</Button>}
  </div>;
  if (inConversation) return <Chat label="Thinking component review" style={{ height: "100dvh" }}>
    <ChatThread>
      <ChatMessage role="user">{zh ? "请检查示例输入并保留处理细节。" : "Review the sample inputs and retain the processing details."}</ChatMessage>
      <ChatMessage role="assistant" thinking={<div data-thinking-details-preview>{thinking}</div>}>
        {zh ? "这是核心库的交互式样式预览，尚未接入实际任务。" : "This is an interactive core component preview. No real task or model is connected."}
      </ChatMessage>
      {controls}
    </ChatThread>
    <ChatComposer value="" onChange={() => {}} disabled ariaLabel="Preview composer" placeholder={zh ? "仅供样式审核" : "Component review only"} />
  </Chat>;
  return <div className="fynns-unit-stack">
    <SandboxHelp text={zh ? "Thinking 中只使用灰色小字与带缩进的 ChatThinking。尝试、阶段和技术细节没有卡片、胶囊按钮或时间线；操作始终在容器外。" : "Thinking contains only muted small text and indented ChatThinking. Attempts, stages and technical details have no cards, pill buttons or timeline; actions always stay outside."} />
    <div data-thinking-details-preview>{thinking}</div>
    {controls}
  </div>;
}
