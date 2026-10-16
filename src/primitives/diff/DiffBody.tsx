import { Fragment, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { InlineAlert } from "../InlineAlert";
import { highlightCode, type CodeSegment } from "../codeHighlight";
import { contextRanges, DIFF_LIMITS, emphasize, type DiffModel, type DiffRow } from "./model";
import type { DiffLabels } from "./labels";

/** Tokenize complete available runs per side, preserving multiline syntax state. */
function syntaxLines(rows: DiffRow[], language?: string): Map<number, CodeSegment[]> {
  const result = new Map<number, CodeSegment[]>();
  for (const side of ["del", "add"] as const) {
    let run: number[] = [];
    const flush = () => {
      if (!run.length) return;
      const text = run.map(i => rows[i].text).join("\n");
      const tokens = highlightCode(text, language);
      let line = 0;
      for (const token of tokens) {
        const parts = token.text.split("\n");
        parts.forEach((part, index) => {
          if (index) line++;
          const rowIndex = run[line];
          if (rowIndex != null && part && (side === "add" || rows[rowIndex].type === "del")) {
            const existing = result.get(rowIndex) ?? [];
            existing.push({ kind: token.kind, text: part }); result.set(rowIndex, existing);
          }
        });
      }
      run = [];
    };
    rows.forEach((row, i) => {
      if (row.type === "gap" || row.type === "meta") flush();
      else if (row.type === "same" || row.type === side) run.push(i);
    });
    flush();
  }
  return result;
}

function LineText({ row, tokens }: { row: DiffRow; tokens?: CodeSegment[] }) {
  let offset = 0;
  return <>{(tokens ?? [{ kind: "plain", text: row.text }]).map((token, index) => {
    const start = offset; offset += token.text.length;
    const boundaries = new Set([start, offset]);
    for (const [a, b] of row.emphasis ?? []) { if (a > start && a < offset) boundaries.add(a); if (b > start && b < offset) boundaries.add(b); }
    const sorted = [...boundaries].sort((a, b) => a - b);
    const ink = { "--fynns-diff-token-ink": `var(--fynns-code-${token.kind === "plain" ? "fg" : token.kind})` } as CSSProperties;
    return <span key={index} className={`fynns-diff-token fynns-code-${token.kind}`} style={ink}>{sorted.slice(0, -1).map((a, i) => {
      const b = sorted[i + 1], marked = row.emphasis?.some(([x, y]) => x <= a && y >= b);
      const text = row.text.slice(a, b);
      return marked ? <mark key={a}>{text}</mark> : <Fragment key={a}>{text}</Fragment>;
    })}</span>;
  })}{!row.text ? "\u200b" : null}</>;
}

export function DiffBody({ model, language, labels, wrap, maxHeight, embedded, target, onResetTarget }: {
  model: DiffModel; language?: string; labels: DiffLabels; wrap: boolean;
  maxHeight?: number | string; embedded?: boolean; target?: { index: number; serial: number };
  onResetTarget: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState<number>(DIFF_LIMITS.page);
  const [expanded, setExpanded] = useState<Record<number, number>>({});
  const rows = useMemo(() => {
    const next = model.rows.map(row => ({ ...row }));
    emphasize(next); return next;
  }, [model]);
  const syntax = useMemo(() => syntaxLines(rows, language), [rows, language]);
  const ranges = useMemo(() => contextRanges(rows), [rows]);
  const visible = useMemo(() => {
    const set = new Set<number>();
    for (const [start, end] of ranges) for (let i = start; i < end; i++) set.add(i);
    return set;
  }, [ranges]);
  // A navigation window replaces the initial page instead of mounting all prior rows.
  const entries: Array<{ row: number } | { start: number; end: number; shown: number }> = [];
  for (let i = 0; i < rows.length;) {
    if (rows[i].type === "same" && !visible.has(i)) {
      const start = i;
      while (i < rows.length && rows[i].type === "same" && !visible.has(i)) i++;
      const end = i, shown = Math.min(expanded[start] ?? 0, end - start);
      for (let j = start; j < start + shown; j++) entries.push({ row: j });
      if (shown < end - start) entries.push({ start, end, shown });
      continue;
    }
    entries.push({ row: i++ });
  }
  const targetPosition = target ? entries.findIndex(entry => "row" in entry && entry.row === target.index) : -1;
  const windowStart = targetPosition < 0 ? 0 : Math.max(0, targetPosition - 3);
  const items = entries.slice(windowStart, windowStart + limit).map(entry => "row" in entry ? renderRow(entry.row) : <div key={`context-${entry.start}`} className="fynns-diff-context">
    <span>{labels.hidden(entry.end - entry.start - entry.shown)}</span>
    <div className="fynns-control-cluster"><Button size="sm" variant="ghost" onClick={() => setExpanded(value => ({ ...value, [entry.start]: entry.shown + 20 }))}>{labels.showMore}</Button><Button size="sm" variant="ghost" onClick={() => setExpanded(value => ({ ...value, [entry.start]: entry.end - entry.start }))}>{labels.showAll}</Button></div>
  </div>);
  function renderRow(i: number) {
    const row = rows[i];
    if (row.type === "gap") return <div key={i} className="fynns-diff-unavailable">{labels.unavailable}</div>;
    return <Fragment key={i}><div className={`fynns-diff-row fynns-diff-row--${row.type}`} data-diff-row={i} data-diff-target={target?.index === i || undefined}>
      <span className="fynns-diff-gutter" aria-hidden>{row.oldNumber}</span><span className="fynns-diff-gutter" aria-hidden>{row.newNumber}</span>
      <span className="fynns-diff-marker" aria-hidden>{row.type === "add" ? "+" : row.type === "del" ? "−" : ""}</span>
      <code className="fynns-diff-code">{row.type === "add" || row.type === "del" ? <span className="fynns-sr-only">{row.type === "add" ? labels.added : labels.removed}: </span> : null}<LineText row={row} tokens={syntax.get(i)} /></code>
    </div>{row.noNewline ? <div className="fynns-diff-unavailable">{labels.noNewline}</div> : null}</Fragment>;
  }
  useLayoutEffect(() => {
    if (!target) return;
    const body = root.current;
    const row = body?.querySelector<HTMLElement>(`[data-diff-row="${target.index}"]`);
    const host = embedded ? body?.closest<HTMLElement>(".fynns-dialog-body") : body;
    if (!row || !host) return;
    // Scroll only the reading surface. scrollIntoView can also scroll an
    // overflow:hidden Dialog panel and move its fixed title/feet out of view.
    const reveal = () => host.scrollTo({ top: host.scrollTop + row.getBoundingClientRect().top - host.getBoundingClientRect().top - host.clientHeight / 2 + row.clientHeight / 2, behavior: "instant" });
    reveal();
    const expansion = body?.closest(".fynns-expand");
    const settle = (event: Event) => { if (event.target === expansion) reveal(); };
    expansion?.addEventListener("transitionend", settle);
    return () => expansion?.removeEventListener("transitionend", settle);
  }, [target, embedded]);
  if (model.problem) return <InlineAlert severity="error" message={labels.problem(model.problem)} />;
  if (model.status) return <EmptyState size="sm" title={labels[model.status === "binary" ? "binary" : model.status === "renamed" ? "renamed" : "emptyFile"]} />;
  if (!model.changes.length) return <EmptyState size="sm" title={labels.noChanges} />;
  const digits = String(rows.reduce((max, row) => Math.max(max, row.oldNumber ?? 0, row.newNumber ?? 0), 0)).length;
  return <div ref={root} className={`fynns-diff-body fynns-scroll${wrap ? "" : " fynns-diff-body--nowrap"}${embedded ? " fynns-diff-body--embedded" : ""}`} style={{ maxHeight: embedded ? undefined : maxHeight, "--fynns-diff-line-digits": `${digits}ch` } as CSSProperties} tabIndex={0} role="region" aria-label={labels.diff}>
    <div className="fynns-diff-rows">{windowStart > 0 ? <div className="fynns-diff-context"><Button size="sm" variant="ghost" onClick={onResetTarget}>{labels.showAll}</Button></div> : null}{items}</div>
    {windowStart + limit < entries.length ? <div className="fynns-diff-context"><Button size="sm" variant="ghost" onClick={() => setLimit(value => value + DIFF_LIMITS.page)}>{labels.showMore}</Button></div> : null}
  </div>;
}
