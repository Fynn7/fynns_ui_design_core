import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { GlobeIcon } from "./icons";
import { Tooltip } from "./Tooltip";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * One browsing / RAG source for an assistant turn (ChatGPT-style citation).
 * The primitive does not fetch — pass publisher identity + link from the app.
 */
export type ChatCitation = {
  /** Stable key when the publisher string is not unique. */
  id?: string;
  /** Publisher / site name on the chip (e.g. "Reuters"). */
  publisher: string;
  /** Destination URL opened on activate. */
  href: string;
  /** Article headline for hover preview / expanded card. */
  title?: string;
  /** Short excerpt for hover preview / expanded card. */
  snippet?: string;
  /** Leading mark (favicon `<img>` / icon). Defaults to `GlobeIcon`. */
  favicon?: ReactNode;
};

export type ChatCitationChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  citation: ChatCitation;
  /**
   * Called when the chip is activated. Default opens `href` in a new tab
   * (`noopener,noreferrer`) when this prop is omitted.
   */
  onOpen?: (citation: ChatCitation) => void;
  /** Show hover preview (title / snippet). @default true */
  preview?: boolean;
};

function citationKey(citation: ChatCitation, index: number) {
  return citation.id ?? `${citation.href}::${citation.publisher}::${index}`;
}

function openCitationHref(href: string) {
  if (typeof window === "undefined" || !href) return;
  window.open(href, "_blank", "noopener,noreferrer");
}

function CitationFavicon({ favicon }: { favicon?: ReactNode }) {
  return (
    <span className="fynns-chat-citation-favicon" aria-hidden>
      {favicon ?? <GlobeIcon size={14} />}
    </span>
  );
}

function CitationPreview({ citation }: { citation: ChatCitation }) {
  return (
    <div className="fynns-chat-citation-preview">
      <div className="fynns-chat-citation-preview-publisher">
        {citation.publisher}
      </div>
      {citation.title ? (
        <div className="fynns-chat-citation-preview-title">{citation.title}</div>
      ) : null}
      {citation.snippet ? (
        <div className="fynns-chat-citation-preview-snippet">
          {citation.snippet}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Publisher-first source chip (favicon + name). Hover shows title/snippet;
 * click opens the source. Usable under `ChatMessage` or inline in body markdown.
 */
export function ChatCitationChip({
  citation,
  onOpen,
  preview = true,
  className,
  onClick,
  ...rest
}: ChatCitationChipProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (onOpen) onOpen(citation);
    else openCitationHref(citation.href);
  };

  const chip = (
    <button
      {...rest}
      type="button"
      className={join("fynns-chat-citation-chip", className)}
      onClick={handleClick}
    >
      <CitationFavicon favicon={citation.favicon} />
      <span className="fynns-chat-citation-chip-label">{citation.publisher}</span>
    </button>
  );

  const hasPreview =
    preview && (citation.title != null || citation.snippet != null);

  if (!hasPreview) return chip;

  return (
    <Tooltip content={<CitationPreview citation={citation} />} side="bottom" align="start">
      {chip}
    </Tooltip>
  );
}

export type ChatCitationsProps = {
  citations: ChatCitation[];
  /**
   * How many publisher chips to show before a “+N” more control.
   * @default 3
   */
  visibleCount?: number;
  /** Group accessible name / collapse control label. @default "Sources" */
  label?: string;
  /**
   * Label for the overflow expand control. Receives remaining count.
   * @default (n) => `+${n}`
   */
  moreLabel?: (count: number) => string;
  /** Called instead of the default new-tab open when a chip / card is activated. */
  onOpen?: (citation: ChatCitation, index: number) => void;
  className?: string;
};

/**
 * Footnotes / source chips under an assistant message (ChatGPT browsing).
 * Collapsed: publisher chips (+N when truncated). Expanded: full source cards.
 */
export function ChatCitations({
  citations,
  visibleCount = 3,
  label = "Sources",
  moreLabel = (n) => `+${n}`,
  onOpen,
  className,
}: ChatCitationsProps) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  const limit = Math.max(0, visibleCount);
  const head = citations.slice(0, limit);
  const overflow = Math.max(0, citations.length - limit);

  const handleOpen = (citation: ChatCitation, index: number) => {
    if (onOpen) onOpen(citation, index);
    else openCitationHref(citation.href);
  };

  return (
    <div
      className={join(
        "fynns-chat-citations",
        expanded && "fynns-chat-citations--expanded",
        className,
      )}
      role="group"
      aria-label={label}
    >
      <div className="fynns-chat-citations-chips">
        {head.map((citation, index) => (
          <ChatCitationChip
            key={citationKey(citation, index)}
            citation={citation}
            onOpen={() => handleOpen(citation, index)}
          />
        ))}
        {overflow > 0 ? (
          <button
            type="button"
            className="fynns-chat-citation-chip fynns-chat-citation-chip--more"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="fynns-chat-citation-chip-label">
              {expanded ? label : moreLabel(overflow)}
            </span>
          </button>
        ) : null}
      </div>

      {expanded ? (
        <ul id={listId} className="fynns-chat-citations-list">
          {citations.map((citation, index) => (
            <li key={citationKey(citation, index)}>
              <a
                className="fynns-chat-citation-card"
                href={citation.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!onOpen) return;
                  e.preventDefault();
                  onOpen(citation, index);
                }}
              >
                <CitationFavicon favicon={citation.favicon} />
                <span className="fynns-chat-citation-card-body">
                  <span className="fynns-chat-citation-card-publisher">
                    {citation.publisher}
                  </span>
                  {citation.title ? (
                    <span className="fynns-chat-citation-card-title">
                      {citation.title}
                    </span>
                  ) : null}
                  {citation.snippet ? (
                    <span className="fynns-chat-citation-card-snippet">
                      {citation.snippet}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
