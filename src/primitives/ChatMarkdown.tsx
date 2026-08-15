import {
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import { CodeBlock } from "./CodeBlock";
import {
  parseChatMarkdown,
  type MdBlock,
  type MdInline,
  type MdListItem,
} from "./chatMarkdown/parse";

export type ChatMarkdownProps = {
  /** Markdown / GFM-subset source (caller owns streaming token append). */
  source: string;
  className?: string;
  /** Copy control on fenced `CodeBlock`s. @default "Copy" */
  copyAriaLabel?: string;
  /**
   * Trailing streaming caret (ChatMessage injects this when the markdown host
   * is the last body unit).
   */
  showCursor?: boolean;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function renderInlines(nodes: MdInline[]): ReactNode {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return <span key={i}>{node.value}</span>;
      case "code":
        return <code key={i}>{node.value}</code>;
      case "strong":
        return <strong key={i}>{renderInlines(node.children)}</strong>;
      case "em":
        return <em key={i}>{renderInlines(node.children)}</em>;
      case "del":
        return <del key={i}>{renderInlines(node.children)}</del>;
      case "link":
        return (
          <a
            key={i}
            href={node.href}
            title={node.title}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderInlines(node.children)}
          </a>
        );
      case "br":
        return <br key={i} />;
      default:
        return null;
    }
  });
}

function HeadingTag({
  depth,
  children,
}: {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}) {
  const Tag = `h${depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag className={`fynns-chat-markdown-h fynns-chat-markdown-h${depth}`}>
      {children}
    </Tag>
  );
}

/**
 * Chat bubble Markdown / GFM subset → keep-set nodes (inline `code` pill,
 * fenced `CodeBlock`, plain ul/ol). GFM `- [ ]` / `- [x]` become ordinary
 * list items (label only — no interactive Checkbox). Use via
 * `ChatMessage markdown` or as an explicit child.
 */
export function ChatMarkdown({
  source,
  className,
  copyAriaLabel = "Copy",
  showCursor = false,
}: ChatMarkdownProps) {
  const blocks = useMemo(() => parseChatMarkdown(source), [source]);

  if (blocks.length === 0) return null;

  const renderItem = (item: MdListItem, liKey: string) => (
    <li key={liKey} className="fynns-chat-markdown-li">
      {renderInlines(item.children)}
    </li>
  );

  const renderBlocks = (nodes: MdBlock[], keyPrefix: string): ReactNode[] =>
    nodes.map((block, i) => {
      const key = `${keyPrefix}-${i}`;
      switch (block.type) {
        case "paragraph":
          return (
            <p key={key} className="fynns-chat-markdown-p">
              {renderInlines(block.children)}
            </p>
          );
        case "heading":
          return (
            <HeadingTag key={key} depth={block.depth}>
              {renderInlines(block.children)}
            </HeadingTag>
          );
        case "code":
          return (
            <CodeBlock
              key={key}
              variant="plain"
              language={block.language || undefined}
              code={block.value}
              copyAriaLabel={copyAriaLabel}
            />
          );
        case "blockquote":
          return (
            <blockquote key={key} className="fynns-chat-markdown-quote">
              {renderBlocks(block.children, key)}
            </blockquote>
          );
        case "list": {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={key}
              className={join(
                "fynns-chat-markdown-list",
                block.ordered
                  ? "fynns-chat-markdown-list--ol"
                  : "fynns-chat-markdown-list--ul",
              )}
              start={
                block.ordered && block.start !== 1 ? block.start : undefined
              }
            >
              {block.items.map((item, j) => renderItem(item, `${key}-li-${j}`))}
            </ListTag>
          );
        }
        case "hr":
          return <hr key={key} className="fynns-chat-markdown-hr" />;
        default:
          return null;
      }
    });

  const nodes = renderBlocks(blocks, "b").filter(Boolean) as ReactNode[];
  if (showCursor && nodes.length > 0) {
    const lastIdx = nodes.length - 1;
    const last = nodes[lastIdx];
    const caret = (
      <span
        key="fynns-chat-cursor"
        className="fynns-chat-message-cursor"
        aria-hidden
      />
    );
    if (isValidElement(last)) {
      const lastClass =
        (last.props as { className?: string }).className ?? "";
      if (/\bfynns-chat-markdown-(p|h\d)\b/.test(lastClass)) {
        const el = last as ReactElement<{ children?: ReactNode }>;
        nodes[lastIdx] = cloneElement(el, {
          children: (
            <>
              {el.props.children}
              {caret}
            </>
          ),
        });
      } else {
        nodes.push(
          <p key="fynns-chat-md-cursor" className="fynns-chat-markdown-p">
            {caret}
          </p>,
        );
      }
    } else {
      nodes.push(
        <p key="fynns-chat-md-cursor" className="fynns-chat-markdown-p">
          {caret}
        </p>,
      );
    }
  }

  return <div className={join("fynns-chat-markdown", className)}>{nodes}</div>;
}

ChatMarkdown.displayName = "ChatMarkdown";
