import { useRef, useState } from "react";
import {
  CodeBlock, InlineAlert, Switch, Textarea, TextSelectionComposer,
  type TextSelectionComposerSubmit,
} from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

const copy = {
  en: {
    help: "Select text, then hover over the area to reveal the reference input. Keyboard/touch selection also opens it; Tab enters the input, Enter sends, and Escape returns to the selection. The callback receives the quote, UTF-16 offsets and prompt. Try the retry switch to inspect failure without losing your draft.",
    source: "Selection example", body: "Select a phrase in this editable text. Add a message about the phrase using the floating input.",
    placeholder: "Describe changes", input: "Message about selected text", send: "Send reference",
    busy: "Sending reference", error: "The sample send failed. Send again to retry.",
    retry: "Test send failure", immediate: "Show immediately after selection",
    rendered: "Rendered text selection", renderedBody: "A reference keeps the original wording while adding a separate message.",
    code: "Editable code selection", quote: "Selected text", prompt: "Message", offsets: "Offsets",
  },
  zh: {
    help: "选中文字后 hover 编辑区，显示引用输入框。键盘或触摸选区也可打开；Tab 进入输入框，Enter 发送，Esc 返回原选区。回调包含原文、UTF-16 位置与输入内容。可打开失败测试，检查保留草稿的重试行为。",
    source: "选区示例", body: "选中这段可编辑文字中的一个短语，通过浮动输入框添加关于该短语的消息。",
    placeholder: "描述修改内容", input: "关于所选文字的消息", send: "发送引用",
    busy: "正在发送引用", error: "示例发送失败。可再次发送以重试。",
    retry: "测试发送失败", immediate: "选中后立即显示",
    rendered: "渲染文本选区", renderedBody: "引用保留原始文字，同时添加一条独立的消息。",
    code: "可编辑代码选区", quote: "所选文字", prompt: "消息", offsets: "位置",
  },
};

export function TextSelectionComposerDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [body, setBody] = useState(c.body);
  const [retry, setRetry] = useState(false);
  const failedOnce = useRef(false);
  const [immediate, setImmediate] = useState(false);
  const [submission, setSubmission] = useState<TextSelectionComposerSubmit | null>(null);
  const props = {
    reveal: immediate ? "selection" as const : "hover" as const,
    placeholder: c.placeholder, inputLabel: c.input, sendLabel: c.send,
    busyLabel: c.busy, errorMessage: c.error,
    onSubmit: (next: TextSelectionComposerSubmit) => {
      if (retry && !failedOnce.current) {
        failedOnce.current = true;
        throw new Error("Sample failure");
      }
      setSubmission(next);
    },
  };
  return (
    <div className="sandbox-globals-row sandbox-globals-row--stack">
      <SandboxHelp text={c.help} />
      <Switch checked={immediate} onCheckedChange={setImmediate} label={c.immediate} />
      <Switch checked={retry} onCheckedChange={(next) => { failedOnce.current = false; setRetry(next); }} label={c.retry} />
      <TextSelectionComposer {...props}>
        <Textarea aria-label={c.source} value={body} onChange={(event) => setBody(event.target.value)} minRows={3} />
      </TextSelectionComposer>
      <TextSelectionComposer {...props}>
        <p aria-label={c.rendered}>{c.renderedBody}</p>
      </TextSelectionComposer>
      <TextSelectionComposer {...props}>
        <CodeBlock variant="editable" language="typescript" label={c.code}
          defaultValue={'const message = "Select this sample";\nconsole.log(message);'} />
      </TextSelectionComposer>
      {submission && <InlineAlert severity="success" message={
        `${c.quote}: “${submission.selection.text}” · ${c.prompt}: ${submission.prompt} · ${c.offsets}: ${submission.selection.start}–${submission.selection.end}`
      } />}
    </div>
  );
}
