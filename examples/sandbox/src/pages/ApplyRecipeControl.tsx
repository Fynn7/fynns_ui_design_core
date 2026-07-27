import { Button, Dialog, toast, Tooltip } from "@fynns/ui";
import { useState } from "react";
import {
  applyRecipeDraft,
  previewRecipeDraft,
  type ApplyRecipeFileDiff,
} from "../export/applyRecipe";
import { useRecipeDraft } from "../state/RecipeDraftProvider";

type Phase = "idle" | "previewing" | "review" | "applying";

/**
 * Inspector footer: preview + apply CollapsibleCard template to source files.
 */
export function ApplyRecipeControl() {
  const { draft, isDirty, commit } = useRecipeDraft();
  const [phase, setPhase] = useState<Phase>("idle");
  const [files, setFiles] = useState<ApplyRecipeFileDiff[]>([]);

  const busy = phase === "previewing" || phase === "applying";
  const reviewOpen = phase === "review" || phase === "applying";
  const changedFiles = files.filter((f) => f.changed);

  const openReview = async () => {
    if (!isDirty || busy) return;
    setPhase("previewing");
    try {
      const preview = await previewRecipeDraft(draft);
      if (!preview.ok) {
        toast.error(preview.error ?? "Preview failed");
        setPhase("idle");
        return;
      }
      setFiles(preview.files);
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
      const result = await applyRecipeDraft(draft);
      if (!result.ok) {
        toast.error(result.error ?? "Apply failed");
        setPhase("review");
        return;
      }
      toast.success("CollapsibleCard template applied");
      commit();
      setPhase("idle");
      setFiles([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Apply failed");
      setPhase("review");
    }
  };

  return (
    <>
      <Tooltip
        content={
          isDirty
            ? "Write CollapsibleCard recipe + CSS block to src/primitives (dev server only)"
            : "No template changes in the recipe draft"
        }
      >
        <Button size="sm" disabled={!isDirty || busy} onClick={() => void openReview()}>
          {phase === "previewing" ? "Preparing diff…" : "Apply component template"}
        </Button>
      </Tooltip>

      <Dialog
        open={reviewOpen}
        onOpenChange={(open) => {
          if (!open) closeReview();
        }}
        title="Apply CollapsibleCard template"
        description={`${changedFiles.length} file(s) will update. Confirm to write the recipe and CSS block.`}
        className="sandbox-apply-diff-dialog"
        showCloseButton={phase !== "applying"}
        closeAriaLabel="Close"
      >
        <div className="sandbox-apply-diff-list fynns-scroll">
          {files.length === 0 ? (
            <p className="sandbox-muted">No file diffs.</p>
          ) : (
            files.map((file) => (
              <section key={file.path} className="sandbox-apply-diff-file">
                <header className="sandbox-apply-diff-file-head">
                  <code>{file.path}</code>
                  <span className="sandbox-muted">{file.changed ? "changed" : "unchanged"}</span>
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
