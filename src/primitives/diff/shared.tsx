import type { ReactNode } from "react";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import type { DiffModel } from "./model";
import type { DiffLabels } from "./labels";

export function DiffAction({ label, children, onClick, disabled, pressed }: {
  label: string; children: ReactNode; onClick: () => void; disabled?: boolean; pressed?: boolean;
}) {
  return <Tooltip content={label}><IconButton size="sm" variant="ghost" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>{children}</IconButton></Tooltip>;
}

export function DiffStats({ model, labels }: { model: Pick<DiffModel, "additions" | "deletions">; labels: DiffLabels }) {
  const { additions, deletions } = model;
  const total = additions + deletions;
  const green = !total ? 0 : !deletions ? 5 : !additions ? 0 : Math.min(4, Math.max(1, Math.round(additions / total * 5)));
  return <span className="fynns-diff-stats" role="img" aria-label={`${labels.added} ${additions}, ${labels.removed} ${deletions}`}>
    <span className="fynns-diff-added" aria-hidden>+{additions}</span>
    <span className="fynns-diff-removed" aria-hidden>−{deletions}</span>
    <span className="fynns-diff-ratio" aria-hidden>{Array.from({ length: 5 }, (_, i) => <span key={i} className={!total ? "" : i < green ? "fynns-diff-ratio--add" : "fynns-diff-ratio--del"} />)}</span>
  </span>;
}
