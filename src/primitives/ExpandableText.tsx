import { useRef, type CSSProperties } from "react";
import { ExpandToggle } from "./ExpandToggle";
import { useContentExpansion, usePreviewOverflow, type ContentExpansionProps } from "./contentExpansion";

export type ExpandableTextProps = ContentExpansionProps & {
  /** Plain copy only. Rich content uses ExpandableContent complete units. */
  text: string;
  /** Visible lines before expansion. Default 5; actual wrapping is measured. */
  previewLines?: number;
  className?: string;
};

/** Auto-measured plain text preview with no control for short copy. */
export function ExpandableText(props: ExpandableTextProps) {
  const { text, previewLines = 5, className } = props;
  const { id, expanded, change } = useContentExpansion(props);
  const ref = useRef<HTMLParagraphElement>(null);
  const { overflow, lines } = usePreviewOverflow(ref, previewLines, text);
  return (
    <div className={["fynns-expandable-content", className].filter(Boolean).join(" ")}>
      <p ref={ref} id={id} className="fynns-expandable-text" data-collapsed={!expanded || undefined}
        style={{ "--fynns-preview-lines": lines } as CSSProperties}>{text}</p>
      {overflow && <ExpandToggle expanded={expanded} onExpandedChange={change} controls={id}
        expandLabel={props.expandLabel} collapseLabel={props.collapseLabel} />}
    </div>
  );
}
