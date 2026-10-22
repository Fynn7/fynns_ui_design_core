import { useEffect, useRef, useState } from "react";
import {
  Chat, ChatComposer, ChatMessage, ChatQuestion, ChatReveal,
  ChatScrollToBottom, ChatThinking, ChatThinkingStack, ChatThread,
  type ChatQuestionAnswer,
} from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

const copy = {
  en: {
    help: "ChatQuestion appends Other + Input by default. Select Other to type; Continue freezes this card in place and appends your answer, new activity, then the result. Send another prompt to inspect repeated turns. Every event uses one ordered list and a stable key; status rows never move below later cards.",
    label: "Question conversation", prompt: "Prepare a sample response.",
    question: "How should the response be presented?", title: "Question", answered: "Answered",
    options: ["A. Concise paragraph", "B. Detailed explanation", "C. Checklist"],
    other: "D. Other", input: "Your answer", submit: "Continue",
    read: "Read the sample", check: "Checked wording", ready: "Prepared choices",
    body: "Reviewed the sample and kept the choices concise.",
    filling: "Applying the answer…", filled: "Applied the answer", stopped: "Stopped",
    result: "The sample response is ready.", placeholder: "Send another sample prompt…",
    send: "Send", stop: "Stop", next: "Preparing choices…",
  },
  zh: {
    help: "ChatQuestion 默认追加 Other + 输入框。选 Other 后输入；继续会将卡片原地锁定，再追加你的答案、新活动和结果。发送下一条 prompt 可检查多回合顺序。所有事件来自同一有序列表并使用稳定 key；状态行不会移到后续卡片下面。",
    label: "问题对话", prompt: "准备一段示例回复。",
    question: "希望以哪种形式呈现回复？", title: "问题", answered: "已回答",
    options: ["A. 简短段落", "B. 详细说明", "C. 检查清单"],
    other: "D. 其他", input: "你的答案", submit: "继续",
    read: "已阅读示例", check: "已检查措辞", ready: "已准备选项",
    body: "已检查示例，并保持选项简洁。",
    filling: "正在应用答案…", filled: "已应用答案", stopped: "已停止",
    result: "示例回复已准备好。", placeholder: "发送下一条示例 prompt…",
    send: "发送", stop: "停止", next: "正在准备选项…",
  },
};

type Row = { label: string; body?: string; streaming?: boolean };
type Event =
  | { id: number; kind: "user" | "assistant"; text: string }
  | { id: number; kind: "thinking"; rows: Row[] }
  | { id: number; kind: "question"; answer?: ChatQuestionAnswer; answered?: boolean };

/** One chronological event list shared by prompts, reasoning, questions and results. */
export function ChatQuestionSequenceDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const options = c.options.map((label, index) => ({ value: String(index), label }));
  const [events, setEvents] = useState<Event[]>(() => [
    { id: 1, kind: "user", text: c.prompt },
    { id: 2, kind: "thinking", rows: [
      { label: c.read, body: c.body },
      { label: c.check, body: c.body },
      { label: c.ready },
    ] },
    { id: 3, kind: "question" },
  ]);
  const nextId = useRef(3);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingId = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const finishAfterBeat = (id: number, doneLabel: string, result: Event) => {
    pendingId.current = id;
    setBusy(true);
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--fynns-duration-activity").trim();
    const delay = Number.parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
    timer.current = setTimeout(() => {
      setEvents((items) => [
        ...items.map((item): Event => item.id === id && item.kind === "thinking"
          ? { ...item, rows: [{ label: doneLabel }] } : item),
        result,
      ]);
      pendingId.current = undefined;
      setBusy(false);
    }, Number.isFinite(delay) ? delay : 0);
  };

  const submitAnswer = (id: number, answer: ChatQuestionAnswer) => {
    if (busy) return;
    const event = events.find((item) => item.id === id);
    if (event?.kind !== "question" || event.answered) return;
    const text = answer.value === "other" ? answer.text : options.find((option) => option.value === answer.value)!.label;
    const userId = ++nextId.current;
    const thinkingId = ++nextId.current;
    const resultId = ++nextId.current;
    setEvents((items) => [
      ...items.map((item): Event => item.id === id && item.kind === "question"
        ? { ...item, answer, answered: true } : item),
      { id: userId, kind: "user", text },
      { id: thinkingId, kind: "thinking", rows: [{ label: c.filling, streaming: true }] },
    ]);
    finishAfterBeat(thinkingId, c.filled, { id: resultId, kind: "assistant", text: c.result });
  };

  const send = (value: string) => {
    if (busy || !value.trim()) return;
    const userId = ++nextId.current;
    const thinkingId = ++nextId.current;
    const questionId = ++nextId.current;
    setDraft("");
    setEvents((items) => [
      ...items,
      { id: userId, kind: "user", text: value.trim() },
      { id: thinkingId, kind: "thinking", rows: [{ label: c.next, streaming: true }] },
    ]);
    finishAfterBeat(thinkingId, c.ready, { id: questionId, kind: "question" });
  };

  const stop = () => {
    clearTimeout(timer.current);
    const id = pendingId.current;
    setEvents((items) => items.map((item): Event => item.id === id && item.kind === "thinking"
      ? { ...item, rows: [{ label: c.stopped }] } : item));
    pendingId.current = undefined;
    setBusy(false);
  };

  return (
    <div className="fynns-unit-stack">
      <SandboxHelp text={c.help} />
      <Chat label={c.label} className="sandbox-chat-frame">
        <ChatThread>
          {events.map((event) => {
            if (event.kind === "thinking") return (
              <ChatMessage key={event.id} role="assistant" data-event-id={event.id} data-event-kind="thinking" thinking={
                <ChatThinkingStack>
                  {event.rows.map((row, index) => (
                    <ChatThinking key={index} variant={row.body ? "disclosure" : "status"} label={row.label} streamingLabel={row.label} streaming={row.streaming}>
                      {row.body}
                    </ChatThinking>
                  ))}
                </ChatThinkingStack>
              } />
            );
            if (event.kind === "question") return (
              <ChatReveal key={event.id} data-event-id={event.id} data-event-kind="question">
                <ChatQuestion question={c.question} title={event.answered ? c.answered : c.title}
                  options={options} otherLabel={c.other} otherPlaceholder={c.input}
                  submitLabel={c.submit} answer={event.answer} readOnly={event.answered} disabled={busy}
                  onAnswerChange={(answer) => setEvents((items) => items.map((item): Event => item.id === event.id && item.kind === "question" ? { ...item, answer } : item))}
                  onSubmit={(answer) => submitAnswer(event.id, answer)}
                />
              </ChatReveal>
            );
            return <ChatMessage key={event.id} role={event.kind} markdown={event.text} data-event-id={event.id} data-event-kind={event.kind} />;
          })}
        </ChatThread>
        <ChatScrollToBottom />
        <ChatComposer value={draft} onChange={setDraft} onSubmit={send} busy={busy} onStop={stop}
          ariaLabel={c.placeholder} placeholder={c.placeholder} sendLabel={c.send} stopLabel={c.stop} />
      </Chat>
    </div>
  );
}
