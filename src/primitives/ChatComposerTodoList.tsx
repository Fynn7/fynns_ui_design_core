import { useId, useState } from "react";
import { ChevronDownIcon, CheckIcon, ListChecksIcon } from "./icons";
import { IconButton } from "./IconButton";
import { Tooltip } from "./Tooltip";

export type ChatComposerTodoItem = {
  id: string;
  label: string;
  status?: "pending" | "active" | "completed";
};

export type ChatComposerTodoListProps = {
  items: readonly ChatComposerTodoItem[];
  /** Localize the progress summary; defaults to English. */
  progressLabel?: (completed: number, total: number) => string;
  /** Control the open state externally, or omit to let the header toggle it. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: string;
  collapseLabel?: string;
  completedLabel?: string;
  activeLabel?: string;
  pendingLabel?: string;
};

/** Read-only progress list attached to the composer; task state belongs to the caller. */
export function ChatComposerTodoList({
  items,
  progressLabel = (completed, total) => `${completed} out of ${total} tasks completed`,
  expanded,
  defaultExpanded = true,
  onExpandedChange,
  expandLabel = "Expand tasks",
  collapseLabel = "Collapse tasks",
  completedLabel = "Completed",
  activeLabel = "In progress",
  pendingLabel = "Pending",
}: ChatComposerTodoListProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const open = expanded ?? localExpanded;
  const listId = useId();
  const completed = items.filter((item) => item.status === "completed").length;
  const summary = progressLabel(completed, items.length);

  const toggle = () => {
    if (expanded === undefined) setLocalExpanded(!open);
    onExpandedChange?.(!open);
  };

  return (
    <section className="fynns-chat-composer-todos" aria-label={summary} data-expanded={open ? "" : undefined}>
      <div className="fynns-chat-composer-todos-header">
        <ListChecksIcon aria-hidden="true" />
        <span className="fynns-chat-composer-todos-summary">{summary}</span>
        <Tooltip content={open ? collapseLabel : expandLabel}>
          <IconButton
            type="button"
            size="sm"
            variant="ghost"
            aria-label={open ? collapseLabel : expandLabel}
            aria-expanded={open}
            aria-controls={listId}
            onClick={toggle}
          >
            <ChevronDownIcon />
          </IconButton>
        </Tooltip>
      </div>
      <div className="fynns-chat-composer-todos-reveal" data-open={open ? "" : undefined} aria-hidden={!open}>
        <div className="fynns-chat-composer-todos-reveal-inner">
          <ol id={listId} className="fynns-chat-composer-todos-list fynns-scroll">
            {items.map((item) => (
              <li key={item.id} className="fynns-chat-composer-todos-item" data-status={item.status ?? "pending"}>
                <span className="fynns-chat-composer-todos-status" aria-hidden="true">
                  {item.status === "completed" ? <CheckIcon /> : null}
                </span>
                <span className="fynns-chat-composer-todos-number" aria-hidden="true" />
                <span className="fynns-chat-composer-todos-label">{item.label}</span>
                <span className="fynns-sr-only">
                  {item.status === "completed" ? completedLabel : item.status === "active" ? activeLabel : pendingLabel}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
