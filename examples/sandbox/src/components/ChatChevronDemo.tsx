import { useState } from "react";
import { Button, ChatActivity, ChatActivityStep, ChatThinking } from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

/** Label-owned headers: tool summaries and reasoning use the same short gap. */
export function ChatChevronDemo() {
  const { locale } = useLocale();
  const [narrow, setNarrow] = useState(false);
  const [grown, setGrown] = useState(false);
  const zh = locale === "zh";
  const read = zh ? "1 次 read" : "1 read";
  const calls = zh ? "2 次工具调用" : "2 tool calls";
  const body = zh ? "已读取示例文档。" : "Read the sample document.";
  return (
    <div className="fynns-unit-stack">
      <SandboxHelp text={zh
        ? "工具调用摘要与 Thinking / Thought 的 chevron 都紧跟标签，间距统一。改变容器宽度、展开状态或输出长度，不能把 chevron 推到右边。"
        : "Tool summaries and Thinking / Thought keep their chevrons next to the label with one shared gap. Host width, disclosure state and output length must not push a chevron to the right."} />
      <div className="fynns-control-cluster">
        <Button variant="tonal" onClick={() => setNarrow((value) => !value)}>
          {zh ? (narrow ? "加宽容器" : "缩窄容器") : (narrow ? "Widen host" : "Narrow host")}
        </Button>
        <Button variant="tonal" onClick={() => setGrown((value) => !value)}>
          {zh ? (grown ? "缩短输出" : "增加输出") : (grown ? "Shorten output" : "Grow output")}
        </Button>
      </div>
      <div data-chat-chevron-host className="fynns-unit-stack" style={{
        width: narrow ? "var(--fynns-navdrawer-width)" : "100%",
        maxWidth: "100%", minWidth: 0, fontFamily: "var(--fynns-font-ui)",
      }}>
        <ChatActivity label={read} defaultOpen={false} data-chevron-case="read-short">
          <ChatActivityStep status="done" label="read" description={body} />
        </ChatActivity>
        <ChatThinking label="Thought" data-chevron-case="thought">{body}</ChatThinking>
        <ChatActivity label={read} defaultOpen={false} data-chevron-case="read-long">
          <ChatActivityStep status="done" label="read" description={Array(grown ? 32 : 8).fill(body).join(" ")} />
        </ChatActivity>
        <ChatThinking label="Thinking" data-chevron-case="thinking">{body}</ChatThinking>
        <ChatActivity label={calls} defaultOpen={false} data-chevron-case="calls">
          <ChatActivityStep status="done" label="read" description={body} />
          <ChatActivityStep status="done" label="check" description={body} />
        </ChatActivity>
        <ChatThinking label="Thought briefly" data-chevron-case="brief">{Array(8).fill(body).join(" ")}</ChatThinking>
      </div>
    </div>
  );
}
