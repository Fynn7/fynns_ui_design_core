import { useRef, type CSSProperties } from "react";
import { CodeBlock, type CodeBlockLabeledProps, type CodeBlockPlainProps } from "./CodeBlock";
import { ExpandToggle } from "./ExpandToggle";
import { useContentExpansion, usePreviewOverflow, type ContentExpansionProps } from "./contentExpansion";

export type ExpandableCodeBlockProps = (
  Omit<CodeBlockLabeledProps, "maxHeight"> | Omit<CodeBlockPlainProps, "maxHeight">
) & ContentExpansionProps & {
  /** Visible code lines; default 5. Copy always receives the complete source. */
  previewLines?: number;
};

/** Readonly CodeBlock preview. Frame and Copy remain whole; only pre is capped. */
export function ExpandableCodeBlock(props: ExpandableCodeBlockProps) {
  const { previewLines = 5, expanded: controlled, defaultExpanded, onExpandedChange,
    expandLabel, collapseLabel, id: suppliedId, ...codeProps } = props;
  const { id: generatedId, expanded, change } = useContentExpansion({
    expanded: controlled, defaultExpanded, onExpandedChange,
  });
  const id = suppliedId ?? generatedId;
  const host = useRef<HTMLDivElement>(null);
  const { overflow, lines } = usePreviewOverflow(host, previewLines, props.code, "pre");
  return (
    <div ref={host} className="fynns-expandable-content fynns-expandable-code"
      style={{ "--fynns-preview-lines": lines } as CSSProperties}>
      <CodeBlock {...codeProps} id={id} maxHeight={expanded ? "none" :
        "calc(var(--fynns-font-size-xs) * var(--fynns-line-height-body) * var(--fynns-preview-lines) + var(--fynns-space-md) + var(--fynns-layout-content-pad-block))"} />
      {overflow && (
        <div className="fynns-expandable-code-foot">
          <ExpandToggle expanded={expanded} onExpandedChange={change} controls={id}
            expandLabel={expandLabel} collapseLabel={collapseLabel} />
        </div>
      )}
    </div>
  );
}
