import { Fragment, type ElementType } from "react";
import { splitCaptionByBackticks } from "@fynns/ui";

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type SandboxHelpProps = {
  /** Prose with optional `` `code` `` spans (rendered as Consolas via theme `code`). */
  text: string;
  as?: "p" | "span";
  className?: string;
};

/**
 * Help / caption copy. Backtick segments become `<code>` so inline tokens
 * use `--fynns-font-mono` (Consolas).
 */
export function SandboxHelp({
  text,
  as: Tag = "p",
  className,
}: SandboxHelpProps) {
  const segments = splitCaptionByBackticks(text);
  return (
    <Tag className={join("sandbox-help", className)}>
      {segments.map((seg, i) =>
        seg.code ? (
          <code key={i}>{seg.text}</code>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </Tag>
  );
}

/** Type-safe alias when a polymorphic call site needs ElementType. */
export type SandboxHelpTag = Extract<ElementType, "p" | "span">;
