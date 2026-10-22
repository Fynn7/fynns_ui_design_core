import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ClipboardIcon, ChevronUpIcon, ChevronDownIcon } from "./icons";
import { Button } from "./Button";
import { OverflowTip } from "./OverflowTip";
import { codeLanguageFromPath } from "./codeHighlight";
import { DiffBody } from "./diff/DiffBody";
import { buildDiff, type DiffSource } from "./diff/model";
import { DiffAction, DiffStats } from "./diff/shared";
import { copyPatch, defaultLabels, type DiffLabels } from "./diff/labels";

export type { DiffSource, DiffFile } from "./diff/model";
export type { DiffLabels } from "./diff/labels";

export type DiffLineKind = "add" | "del" | "same" | "meta";

export type DiffViewLine = {
  type: DiffLineKind;
  text: string;
};

type LegacyDiffViewProps = {
  lines: DiffViewLine[];
  source?: never;
  /** Scroll host max height. Default `320`. */
  maxHeight?: number | string;
  className?: string;
};

export type DiffViewProps = LegacyDiffViewProps | {
  lines?: never;
  source: DiffSource;
  path?: string;
  previousPath?: string;
  language?: string;
  maxHeight?: number | string;
  className?: string;
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  labels?: Partial<DiffLabels>;
};

const LINE_CLASS: Record<DiffLineKind, string> = {
  add: "fynns-diff-view-line--add",
  del: "fynns-diff-view-line--del",
  same: "",
  meta: "fynns-diff-view-line--meta",
};

/**
 * Read-only single-file unified comparison from text or a patch. Legacy lines
 * retain their minimal rendering and caller-owned prefix markers (`+` / `-`).
 */
export function DiffView(props: DiffViewProps) {
  return props.source ? <SourceDiffView {...props} /> : <LegacyDiffView {...props} />;
}

function SourceDiffView({ source, path, previousPath, language, maxHeight = 320, className, wrap: controlledWrap, defaultWrap = true, onWrapChange, labels: overrides }: Extract<DiffViewProps, { source: DiffSource }>) {
  const labels = { ...defaultLabels, ...overrides };
  const [localWrap, setWrap] = useState(defaultWrap);
  const wrap = controlledWrap ?? localWrap;
  const [target, setTarget] = useState<{ index: number; serial: number }>();
  const kind = source.kind;
  const before = source.kind === "text" ? source.before : "";
  const after = source.kind === "text" ? source.after : "";
  const patch = source.kind === "patch" ? source.patch : "";
  const model = useMemo(() => buildDiff({ id: "file", path: path ?? "file", previousPath, source: kind === "text" ? { kind, before, after } : { kind, patch } }, false), [kind, before, after, patch, path, previousPath]);
  useEffect(() => setTarget(undefined), [model]);
  const position = target ? model.changes.indexOf(target.index) + 1 : 0;
  const navigate = (direction: number) => {
    const count = model.changes.length;
    const next = position === 0 ? direction > 0 ? 0 : count - 1 : (position - 1 + direction + count) % count;
    setTarget(value => ({ index: model.changes[next], serial: (value?.serial ?? 0) + 1 }));
  };
  return <section className={["fynns-diff", className].filter(Boolean).join(" ")} aria-label={path ?? labels.diff}>
    <div className="fynns-diff-head"><div className="fynns-diff-path"><OverflowTip content={previousPath ? `${previousPath} → ${path}` : path ?? labels.diff}>{previousPath ? <span className="fynns-diff-old-path">{previousPath} → </span> : null}{path ?? labels.diff}</OverflowTip></div>{!model.problem ? <DiffStats model={model} labels={labels} /> : null}</div>
    <div className="fynns-diff-tools fynns-control-cluster" role="toolbar" aria-label={labels.tools}>
      <DiffAction label={labels.previous} disabled={!model.changes.length} onClick={() => navigate(-1)}><ChevronUpIcon aria-hidden /></DiffAction>
      <span className="fynns-diff-position" role="status">{labels.position(position, model.changes.length)}</span>
      <DiffAction label={labels.next} disabled={!model.changes.length} onClick={() => navigate(1)}><ChevronDownIcon aria-hidden /></DiffAction>
      <Button size="sm" variant="ghost" aria-pressed={wrap} onClick={() => { setWrap(!wrap); onWrapChange?.(!wrap); }}>{labels.wrap}</Button>
      <DiffAction label={labels.copy} disabled={!model.patch || !!model.problem} onClick={() => void copyPatch(model.patch, labels)}><ClipboardIcon aria-hidden /></DiffAction>
    </div>
    <DiffBody key={model.patch} model={model} labels={labels} language={language ?? codeLanguage(path)} wrap={wrap} maxHeight={maxHeight} target={target} onResetTarget={() => setTarget(undefined)} />
  </section>;
}

function codeLanguage(path?: string) { return path ? codeLanguageFromPath(path) ?? undefined : undefined; }

function LegacyDiffView({
  lines,
  maxHeight = 320,
  className,
}: LegacyDiffViewProps) {
  const style: CSSProperties = {
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
  };

  return (
    <pre
      className={["fynns-diff-view", "fynns-scroll", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={["fynns-diff-view-line", LINE_CLASS[line.type]]
            .filter(Boolean)
            .join(" ")}
        >
          {line.text || " "}
        </div>
      ))}
    </pre>
  );
}
