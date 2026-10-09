import { Children, useLayoutEffect, useRef, type ReactNode } from "react";
import { ExpandToggle } from "./ExpandToggle";
import { useContentExpansion, type ContentExpansionProps } from "./contentExpansion";

export type ExpandableContentProps = ContentExpansionProps & {
  /** Complete units that remain visible. Never crop cards, fields or media. */
  preview?: ReactNode;
  /** Additional complete units; mounted but hidden while collapsed. */
  children: ReactNode;
  /** False renders all children without a toggle. */
  canExpand?: boolean;
  className?: string;
};

/** Footer disclosure for whole units. Live: #sandbox-content-expand-units. */
export function ExpandableContent(props: ExpandableContentProps) {
  const { preview, children, className } = props;
  const hasChildren = Children.toArray(children).length > 0;
  const canExpand = hasChildren && (props.canExpand ?? true);
  const { id, expanded, change } = useContentExpansion(props);
  const body = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (canExpand && !expanded && body.current?.contains(document.activeElement)) {
      foot.current?.querySelector("button")?.focus();
    }
  }, [canExpand, expanded]);
  return (
    <div className={["fynns-expandable-content", className].filter(Boolean).join(" ")}>
      {preview}
      {hasChildren && <div ref={body} id={id} hidden={canExpand && !expanded} className="fynns-expandable-content-body">
        {children}
      </div>}
      {canExpand && <div ref={foot}><ExpandToggle expanded={expanded} onExpandedChange={change}
        controls={id} expandLabel={props.expandLabel} collapseLabel={props.collapseLabel} /></div>}
    </div>
  );
}
