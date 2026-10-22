import { useEffect, useRef, useState } from "react";
import { Button, Chat, ChatMessage, ChatThread, ChatThinking, ChatThinkingStack } from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

function formatElapsed(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const tail = `${seconds % 60}s`;
  if (seconds < 60) return tail;
  const minutes = `${Math.floor(seconds / 60) % 60}m ${tail}`;
  return seconds < 3600 ? minutes : `${Math.floor(seconds / 3600)}h ${minutes}`;
}

/** Clock ticks change text, never row identity or animation state. */
export function ChatThinkingClockDemo({ inConversation = false }: { inConversation?: boolean }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [elapsedMs, setElapsedMs] = useState(58000);
  const [ticking, setTicking] = useState(true);
  const [stage, setStage] = useState<"waiting" | "processing" | "complete">("waiting");
  const startedAt = useRef(Date.now() - 58000);
  useEffect(() => {
    if (!ticking) return;
    // One second is the sampling cadence, not an animation duration. Measure
    // wall time so a delayed/background interval cannot lose elapsed seconds.
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt.current), 1000);
    return () => window.clearInterval(timer);
  }, [ticking]);
  const resetClock = (seconds: number) => {
    startedAt.current = Date.now() - seconds * 1000;
    setElapsedMs(seconds * 1000);
  };
  const elapsed = formatElapsed(elapsedMs);
  const streaming = stage === "processing";
  const phase = zh
    ? stage === "waiting" ? "等待确认" : streaming ? "正在准备" : "已完成"
    : stage === "waiting" ? "Awaiting confirmation" : streaming ? "Preparing output" : "Completed";
  const thinking = <ChatThinkingStack>
    <ChatThinking
      data-clock-row="inline"
      label={`${zh ? "示例处理" : "Sample processing"} · ${phase} · ${elapsed}`}
      streamingLabel={`${zh ? "示例处理" : "Sample processing"} · ${phase} · ${elapsed}`}
      streaming={streaming}
      defaultOpen
      details={[
        { id: "phase", label: phase, streamingLabel: phase, streaming, summary: elapsed, defaultOpen: true, details: [
          { id: "elapsed", text: `${zh ? "阶段耗时" : "Elapsed time"} ${elapsed}.` },
        ] },
      ]}
    />
    <ChatThinking data-clock-row="summary" variant="status" label={phase} streamingLabel={phase} streaming={streaming} summary={elapsed} />
  </ChatThinkingStack>;
  const demo = <div className="fynns-unit-stack" data-thinking-clock-preview>
    <SandboxHelp text={zh
      ? "标题内计时、summary 计时与正文数字每秒原位更新，不重播淡入、不重启流光。阶段文案也原位更新；只有挂载、处理状态与展开/折叠触发动效。计时不进入 live region。"
      : "Inline clocks, summary clocks and body numbers update in place each second. Ticks never replay entry or restart shimmer. Phase copy also updates in place; mounting, processing state and disclosure changes own motion. Clocks stay outside live regions."} />
    {thinking}
    <div className="fynns-control-cluster">
      <Button variant="tonal" onClick={() => {
        if (!ticking) startedAt.current = Date.now() - elapsedMs;
        setTicking(!ticking);
      }}>{zh ? ticking ? "暂停计时" : "继续计时" : ticking ? "Pause clock" : "Resume clock"}</Button>
      <Button variant="ghost" onClick={() => { startedAt.current -= 1000; setElapsedMs(value => value + 1000); }}>{zh ? "增加一秒" : "Advance one second"}</Button>
      <Button variant="ghost" onClick={() => resetClock(59)}>{zh ? "分钟进位" : "Minute boundary"}</Button>
      <Button variant="ghost" onClick={() => resetClock(3599)}>{zh ? "小时进位" : "Hour boundary"}</Button>
      <Button variant="ghost" onClick={() => {
        const next = stage === "waiting" ? "processing" : streaming ? "complete" : "waiting";
        setStage(next);
        if (next === "complete") setTicking(false);
      }}>{zh ? "下一阶段" : "Next stage"}</Button>
    </div>
  </div>;
  return inConversation ? <Chat label={zh ? "计时更新审核" : "Clock update review"} style={{ height: "100dvh" }}>
    <ChatThread><ChatMessage role="assistant">{demo}</ChatMessage></ChatThread>
  </Chat> : demo;
}
