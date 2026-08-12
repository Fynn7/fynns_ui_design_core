import {
  type HTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from "react";
import { ChevronRightIcon, FileIcon, ICON_SIZE, WrenchIcon } from "./icons";

export type ChatActivityStepStatus = "pending" | "active" | "done";

export type ChatActivityProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  /** Collapsible header — current stage summary (e.g. “Updated plan with details”). */
  label: ReactNode;
  /** Step rows (`ChatActivityStep`). */
  children?: ReactNode;
  /**
   * While true: force-open (unless controlled), header shimmer, `aria-busy`.
   * Use while the agent is still appending / updating steps.
   */
  streaming?: boolean;
  /** Controlled open. Omit for uncontrolled. */
  open?: boolean;
  /** @default true when `streaming`, else true (tree is useful open by default). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ChatActivityStepProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** @default "done" */
  status?: ChatActivityStepStatus;
  /**
   * Leading glyph. Omit → `WrenchIcon` for `done` / `pending`, soft status
   * mark for `active`. Pass `null` for an empty node (rail still connects).
   */
  icon?: ReactNode | null;
  /** Short step title (one line preferred). */
  label: ReactNode;
  /** Optional supporting copy under the title (active / narrative steps). */
  description?: ReactNode;
  /** Optional trailing artifact chip (`ChatActivityArtifact` or custom node). */
  artifact?: ReactNode;
};

export type ChatActivityArtifactProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  children: ReactNode;
  /** Leading glyph inside the capsule. @default FileIcon */
  icon?: ReactNode;
  /** When set, renders an anchor (caller owns navigation). */
  href?: string;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * File / output capsule beside a done tool step (Cursor-style plan.md chip).
 * Micro chrome — may use `radius-sm` (not Chat panel `radius-22` floor).
 */
export function ChatActivityArtifact({
  children,
  icon,
  href,
  className,
  ...rest
}: ChatActivityArtifactProps) {
  const body = (
    <>
      <span className="fynns-chat-activity-artifact-icon" aria-hidden>
        {icon ?? <FileIcon size={ICON_SIZE} />}
      </span>
      <span className="fynns-chat-activity-artifact-label">{children}</span>
    </>
  );
  const classes = join("fynns-chat-activity-artifact", className);
  if (href != null) {
    return (
      <a {...rest} href={href} className={classes}>
        {body}
      </a>
    );
  }
  return (
    <span {...rest} className={classes}>
      {body}
    </span>
  );
}

/**
 * One row in a `ChatActivity` tree — tool call, narrative beat, or pending.
 */
export function ChatActivityStep({
  status = "done",
  icon,
  label,
  description,
  artifact,
  className,
  ...rest
}: ChatActivityStepProps) {
  const leading =
    icon === null ? null : icon !== undefined ? (
      icon
    ) : status === "active" ? (
      <span className="fynns-chat-activity-mark" aria-hidden />
    ) : (
      <WrenchIcon size={ICON_SIZE} />
    );

  return (
    <div
      {...rest}
      className={join(
        "fynns-chat-activity-step",
        `fynns-chat-activity-step--${status}`,
        className,
      )}
      data-status={status}
    >
      <span className="fynns-chat-activity-node" aria-hidden>
        {leading}
      </span>
      <div className="fynns-chat-activity-main">
        <div className="fynns-chat-activity-headline">
          <span className="fynns-chat-activity-step-label">{label}</span>
          {artifact}
        </div>
        {description != null && description !== "" ? (
          <div className="fynns-chat-activity-desc">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Wave 2 multi-step agent / tool-call chain (Cursor-style status tree).
 * Collapsible header + vertical rail + step rows. Compose via
 * `ChatMessage.thinking` (alone or above `ChatThinking`) — UI chrome only.
 *
 * Keep `ChatThinking` for single-block reasoning; do not overload it into a
 * timeline. This is the dedicated chain anatomy.
 *
 * @example
 * ```tsx
 * <ChatMessage role="assistant" thinking={
 *   <ChatActivity label="Updated plan with details" streaming={busy}>
 *     <ChatActivityStep
 *       status="done"
 *       label="Updated memory file"
 *       artifact={<ChatActivityArtifact>plan.md</ChatActivityArtifact>}
 *     />
 *     <ChatActivityStep
 *       status="active"
 *       label="Updating the plan"
 *       description="Refining the outline…"
 *     />
 *   </ChatActivity>
 * }>
 *   Answer…
 * </ChatMessage>
 * ```
 */
export function ChatActivity({
  label,
  children,
  streaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  ...rest
}: ChatActivityProps) {
  const bodyId = useId();
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? Boolean(open) : streaming ? true : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const labelNode = (
    <span
      className={join(
        "fynns-chat-activity-label",
        streaming && "fynns-chat-activity-label--streaming",
      )}
    >
      {label}
    </span>
  );

  return (
    <div
      {...rest}
      className={join(
        "fynns-chat-activity",
        isOpen && "fynns-chat-activity--open",
        streaming && "fynns-chat-activity--streaming",
        className,
      )}
      data-streaming={streaming ? "true" : undefined}
      data-state={isOpen ? "open" : "closed"}
      aria-busy={streaming || undefined}
    >
      <button
        type="button"
        className="fynns-chat-activity-trigger"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setOpen(!isOpen)}
      >
        {labelNode}
        <ChevronRightIcon
          className="fynns-chat-activity-chevron"
          size={ICON_SIZE}
          aria-hidden
        />
      </button>
      <div
        className="fynns-expand"
        data-state={isOpen ? "open" : "closed"}
        aria-hidden={!isOpen}
      >
        <div className="fynns-expand-inner">
          <div
            id={bodyId}
            className="fynns-chat-activity-steps"
            inert={isOpen ? undefined : true}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
