import { Button, Dialog, toast, Tooltip } from "@fynns/ui";
import { useState } from "react";
import {
  applyTokenOverrides,
  previewTokenOverrides,
  type ApplyFileDiff,
} from "../export/applyTokens";
import { useTokenDraft } from "../state/TokenDraftProvider";

type Phase = "idle" | "previewing" | "review" | "applying";

/**
 * Inspector footer control: preview per-file diffs, then confirm writeback.
 */
export function ApplyChangesControl() {
  const { draft, reset } = useTokenDraft();
  const overrideCount = Object.keys(draft.overrides).length;
  const [phase, setPhase] = useState<Phase>("idle");
  const [files, setFiles] = useState<ApplyFileDiff[]>([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const busy = phase === "previewing" || phase === "applying";
  const reviewOpen = phase === "review" || phase === "applying";
  const changedFiles = files.filter((f) => f.changed);

  const openReview = async () => {
    if (overrideCount === 0 || busy) return;
    setPhase("previewing");
    try {
      const preview = await previewTokenOverrides(draft.overrides);
      if (!preview.ok) {
        toast.error(preview.error ?? "Preview failed");
        setPhase("idle");
        return;
      }
      setFiles(preview.files);
      setAppliedCount(preview.applied.length);
      setSkippedCount(preview.skipped.length);
      setPhase("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Preview failed");
      setPhase("idle");
    }
  };

  const closeReview = () => {
    if (phase === "applying") return;
    setPhase("idle");
    setFiles([]);
  };

  const confirmApply = async () => {
    if (phase !== "review") return;
    setPhase("applying");
    try {
      const result = await applyTokenOverrides(draft.overrides);
      if (!result.ok) {
        toast.error(result.error ?? "Apply failed");
        setPhase("review");
        return;
      }
      reset();
      setPhase("idle");
      setFiles([]);
      if (result.skipped.length > 0) {
        toast.warning(
          `Applied ${result.applied.length} token(s); skipped ${result.skipped.length}`,
        );
      } else {
        toast.success(`Applied ${result.applied.length} token(s) to tokens.ts`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Apply failed");
      setPhase("review");
    }
  };

  return (
    <>
      <Tooltip content="Review per-file diffs, then write tokens.ts and regenerate theme.css">
        <Button
          size="sm"
          variant="primary"
          disabled={overrideCount === 0 || busy}
          onClick={() => void openReview()}
        >
          {phase === "previewing" ? "Preparing diff…" : "Apply changes"}
        </Button>
      </Tooltip>

      <Dialog
        open={reviewOpen}
        onOpenChange={(open) => {
          if (!open) closeReview();
        }}
        title="Review apply changes"
        description={
          skippedCount > 0
            ? `${appliedCount} token(s) will write; ${skippedCount} skipped. Confirm to update the files below.`
            : `${appliedCount} token(s) will write across ${changedFiles.length} file(s). Confirm to apply.`
        }
        className="sandbox-apply-diff-dialog"
        showCloseButton={phase !== "applying"}
      >
        <div className="sandbox-apply-diff-list fynns-scroll">
          {files.length === 0 ? (
            <p className="sandbox-muted">No file diffs.</p>
          ) : (
            files.map((file) => (
              <section key={file.path} className="sandbox-apply-diff-file">
                <header className="sandbox-apply-diff-file-head">
                  <code>{file.path}</code>
                  <span className="sandbox-muted">
                    {file.changed ? "changed" : "unchanged"}
                  </span>
                </header>
                {file.changed && file.diff ? (
                  <pre className="sandbox-apply-diff-pre fynns-scroll">{file.diff}</pre>
                ) : (
                  <p className="sandbox-muted">No textual changes.</p>
                )}
              </section>
            ))
          )}
        </div>
        <div className="sandbox-apply-diff-foot">
          <Button variant="ghost" onClick={closeReview} disabled={phase === "applying"}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={phase === "applying" || changedFiles.length === 0}
            onClick={() => void confirmApply()}
          >
            {phase === "applying" ? "Applying…" : "Apply"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
