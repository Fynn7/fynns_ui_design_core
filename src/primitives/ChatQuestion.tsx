import { useId, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { InfoIcon } from "./icons";
import { Input } from "./Input";
import { Radio } from "./Radio";

export type ChatQuestionOption = {
  /** Stable, unique identifier. `other` is reserved for the free-text option. */
  value: string;
  label: string;
  /** Optional supporting copy for explicitly requested detailed choices. */
  description?: ReactNode;
};

export type ChatQuestionAnswer = {
  /** Selected option identifier, or `other` for the built-in free-text choice. */
  value: string;
  /** Retained Other draft, including while a coded option is selected. */
  text: string;
};

export type ChatQuestionProps = {
  question: string;
  options: readonly ChatQuestionOption[];
  /** Card heading. @default "Question" */
  title?: string;
  /** Controlled draft. Omit for internal draft state. */
  answer?: ChatQuestionAnswer;
  defaultAnswer?: ChatQuestionAnswer;
  onAnswerChange?: (answer: ChatQuestionAnswer) => void;
  /** Adds a submit button; fires only for a coded choice or non-blank Other. */
  onSubmit?: (answer: ChatQuestionAnswer) => void;
  /** @default "Continue" */
  submitLabel?: string;
  /** Preserve submitted controls and text, with editing disabled. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Final Other + inline Input is on by default. Disable only for a requested special structure. */
  other?: boolean;
  /** @default "Other" */
  otherLabel?: string;
  /** @default "Your answer" */
  otherPlaceholder?: string;
  className?: string;
};

/**
 * In-thread question well: Card + labeled native radio group + final Other/Input.
 * Wrap in a keyed ChatReveal at its chronological position in ChatThread.
 * Options are concise by default; descriptions are opt-in. No app-specific
 * pager, regeneration action, or completion footer is inserted by default.
 */
export function ChatQuestion({
  question,
  options,
  title = "Question",
  answer,
  defaultAnswer,
  onAnswerChange,
  onSubmit,
  submitLabel = "Continue",
  readOnly = false,
  disabled = false,
  other = true,
  otherLabel = "Other",
  otherPlaceholder = "Your answer",
  className,
}: ChatQuestionProps) {
  const scope = useId();
  const [draft, setDraft] = useState<ChatQuestionAnswer>(
    () => defaultAnswer ?? { value: "", text: "" },
  );
  const current = answer ?? draft;
  const locked = readOnly || disabled;
  const otherSelected = other && current.value === "other";
  const complete = otherSelected
    ? current.text.trim().length > 0
    : options.some((option) => option.value === current.value);
  const change = (next: ChatQuestionAnswer) => {
    if (locked) return;
    if (answer === undefined) setDraft(next);
    onAnswerChange?.(next);
  };

  return (
    <Card title={title} icon={<InfoIcon aria-hidden />} className={["fynns-chat-question", className].filter(Boolean).join(" ")}>
      <fieldset className="fynns-chat-question-group" disabled={locked}>
        <legend className="fynns-chat-question-prompt">{question}</legend>
        <div className="fynns-control-cluster fynns-control-cluster--stack">
          {options.map((option) => (
            <Radio
              key={option.value}
              name={scope}
              value={option.value}
              checked={current.value === option.value}
              disabled={locked}
              onCheckedChange={() => change({ ...current, value: option.value })}
              label={
                <span className="fynns-chat-question-option">
                  <span>{option.label}</span>
                  {option.description != null ? <span className="fynns-chat-question-description">{option.description}</span> : null}
                </span>
              }
            />
          ))}
          {other ? (
            <div className="fynns-control-cluster fynns-control-cluster--choice-extra">
              <Radio
                id={`${scope}-other`}
                name={scope}
                value="other"
                label={otherLabel}
                checked={otherSelected}
                disabled={locked}
                onCheckedChange={() => change({ ...current, value: "other" })}
              />
              <Input
                size="sm"
                aria-label={`${question} — ${otherLabel}`}
                value={current.text}
                placeholder={otherPlaceholder}
                disabled={locked || !otherSelected}
                autoComplete="off"
                onChange={(event) => change({ value: "other", text: event.target.value })}
              />
            </div>
          ) : null}
        </div>
      </fieldset>
      {onSubmit && !readOnly ? (
        <div className="fynns-chat-question-actions">
          <Button disabled={locked || !complete} onClick={() => {
            if (complete && !locked) onSubmit({ value: current.value, text: otherSelected ? current.text.trim() : "" });
          }}>{submitLabel}</Button>
        </div>
      ) : null}
    </Card>
  );
}
