import { useId, useLayoutEffect, useState, type RefObject } from "react";

export type ContentExpansionProps = {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: string;
  collapseLabel?: string;
};

export function useContentExpansion(props: ContentExpansionProps) {
  const id = useId();
  const [local, setLocal] = useState(props.defaultExpanded ?? false);
  const expanded = props.expanded ?? local;
  const change = (next: boolean) => {
    if (props.expanded === undefined) setLocal(next);
    props.onExpandedChange?.(next);
  };
  return { id, expanded, change };
}

/** Measure natural content, including soft wrapping, padding and font changes. */
export function usePreviewOverflow(ref: RefObject<HTMLElement | null>, lines: number, content: string, selector?: string) {
  const [overflow, setOverflow] = useState(false);
  const safeLines = Number.isFinite(lines) ? Math.max(1, Math.floor(lines)) : 5;
  useLayoutEffect(() => {
    const node = selector ? ref.current?.querySelector<HTMLElement>(selector) : ref.current;
    if (!node) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const css = getComputedStyle(node);
      const line = parseFloat(css.lineHeight);
      const pad = parseFloat(css.paddingTop) + parseFloat(css.paddingBottom);
      setOverflow(node.scrollHeight > line * safeLines + pad + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    void document.fonts?.ready.then(measure);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      active = false;
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [ref, safeLines, content, selector]);
  return { overflow, lines: safeLines };
}
