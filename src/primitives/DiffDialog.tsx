import { useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog } from "./Dialog";
import { Collapsible } from "./Collapsible";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { OverflowTip } from "./OverflowTip";
import { InfoHint } from "./InfoHint";
import { ClipboardIcon, ChevronUpIcon, ChevronDownIcon } from "./icons";
import { codeLanguageFromPath } from "./codeHighlight";
import { DiffBody } from "./diff/DiffBody";
import { buildDiff, splitPatch, type DiffFile } from "./diff/model";
import { DiffAction, DiffStats } from "./diff/shared";
import { copyPatch, defaultLabels, type DiffLabels } from "./diff/labels";

type DiffDialogData = { files: DiffFile[]; patch?: never } | { patch: string; files?: never };
export type DiffDialogProps = DiffDialogData & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  feet?: ReactNode;
  className?: string;
  labels?: Partial<DiffLabels>;
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  expandedFileIds?: string[];
  onExpandedFileIdsChange?: (ids: string[]) => void;
};

/** Stable reading dialog. Own business actions through feet; mount SnackbarHost once. */
export function DiffDialog(props: DiffDialogProps) {
  const { open, onOpenChange } = props;
  const retained = useRef(props);
  if (open) retained.current = props;
  const display = retained.current;
  const { title, description, feet, className } = display;
  const labels = { ...defaultLabels, ...display.labels };
  // Closing keeps the current content mounted for DialogFrame's exit animation.
  const [session, setSession] = useState({ wasOpen: open, number: 0 });
  if (session.wasOpen !== open) setSession({ wasOpen: open, number: session.number + (open ? 1 : 0) });
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description} size="viewport" className={["fynns-diff-dialog", className].filter(Boolean).join(" ")} feet={feet ?? <div className="fynns-control-cluster fynns-control-cluster--end-align"><Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>{labels.close}</Button></div>}>
    <DiffDialogContent key={session.number} {...display} />
  </Dialog>;
}

function DiffDialogContent(props: DiffDialogProps) {
  const { files: input, patch, expandedFileIds, onExpandedFileIdsChange, wrap: controlledWrap, defaultWrap = true, onWrapChange } = props;
  const labels = { ...defaultLabels, ...props.labels };
  const files = useMemo(() => input ?? splitPatch(patch ?? ""), [input, patch]);
  // Exact summary counts need the bounded line comparison; syntax/inline work and DOM
  // are deferred until a file is opened. Each model is reused by copy and navigation.
  const entries = useMemo(() => files.map(file => ({ file, model: buildDiff(file, false) })), [files]);
  const [localExpanded, setExpanded] = useState<string[]>(() => files.length === 1 ? [files[0].id] : []);
  const expanded = expandedFileIds ?? localExpanded;
  const setOpenFiles = (ids: string[]) => { setExpanded(ids); onExpandedFileIdsChange?.(ids); };
  const [localWrap, setWrap] = useState(defaultWrap);
  const wrap = controlledWrap ?? localWrap;
  const [target, setTarget] = useState<{ id: string; index: number; serial: number }>();
  const changes = entries.flatMap(({ file, model }) => model.changes.map(index => ({ id: file.id, index })));
  const position = target ? changes.findIndex(change => change.id === target.id && change.index === target.index) + 1 : 0;
  const navigate = (direction: number) => {
    if (!changes.length) return;
    const next = position === 0 ? direction > 0 ? 0 : changes.length - 1 : (position - 1 + direction + changes.length) % changes.length;
    const change = changes[next];
    if (!expanded.includes(change.id)) setOpenFiles([...expanded, change.id]);
    setTarget(previous => ({ ...change, serial: (previous?.serial ?? 0) + 1 }));
  };
  const allExpanded = files.length > 0 && files.every(file => expanded.includes(file.id));
  const validPatches = entries.filter(entry => !entry.model.problem).map(entry => entry.model.patch).filter(Boolean);
  return <div className="fynns-diff-files">
    <div className="fynns-diff-tools fynns-control-cluster" role="toolbar" aria-label={labels.tools}>
      <DiffAction label={labels.previous} disabled={!changes.length} onClick={() => navigate(-1)}><ChevronUpIcon aria-hidden /></DiffAction>
      <span className="fynns-diff-position" role="status">{labels.position(position, changes.length)}</span>
      <DiffAction label={labels.next} disabled={!changes.length} onClick={() => navigate(1)}><ChevronDownIcon aria-hidden /></DiffAction>
      <Button size="sm" variant="ghost" aria-pressed={wrap} onClick={() => { setWrap(!wrap); onWrapChange?.(!wrap); }}>{labels.wrap}</Button>
      <Button size="sm" variant="ghost" disabled={!files.length} onClick={() => setOpenFiles(allExpanded ? [] : files.map(file => file.id))}>{allExpanded ? labels.collapseAll : labels.expandAll}</Button>
      <DiffAction label={labels.copyAll} disabled={!validPatches.length || entries.some(entry => !!entry.model.problem)} onClick={() => void copyPatch(validPatches.map(patch => patch.endsWith("\n") ? patch : `${patch}\n`).join(""), labels)}><ClipboardIcon aria-hidden /></DiffAction>
    </div>
    {!files.length ? <EmptyState title={labels.noFiles} /> : entries.map(({ file, model }, index) => <div key={file.id} data-diff-file-index={index}>
      <Collapsible className="fynns-diff-file" chrome="plain" open={expanded.includes(file.id)} onOpenChange={value => setOpenFiles(value ? [...expanded, file.id] : expanded.filter(id => id !== file.id))} title={<OverflowTip fill className="fynns-diff-file-path" content={file.previousPath ? `${file.previousPath} → ${file.path}` : file.path}>{file.previousPath ? <span className="fynns-diff-old-path">{file.previousPath} → </span> : null}{file.path}</OverflowTip>} actions={<>
        {!model.problem ? <DiffStats model={model} labels={labels} /> : <InfoHint size="sm" tone="danger" ariaLabel={labels.problem(model.problem)} content={labels.problem(model.problem)} />}
        <DiffAction label={`${labels.copy}: ${file.path}`} disabled={!model.patch || !!model.problem} onClick={() => void copyPatch(model.patch, labels)}><ClipboardIcon aria-hidden /></DiffAction>
      </>}>
        {expanded.includes(file.id) ? <DiffBody key={model.patch} model={model} language={file.language ?? codeLanguageFromPath(file.path) ?? undefined} labels={labels} wrap={wrap} embedded target={target?.id === file.id ? target : undefined} onResetTarget={() => setTarget(undefined)} /> : null}
      </Collapsible>
    </div>)}
  </div>;
}
