import { Button, Dialog, toast, Tooltip } from "@fynns/ui";
import { useState } from "react";
import {
  applyRecipeDraft,
  previewRecipeDraft,
  type ApplyRecipeFileDiff,
} from "../export/applyRecipe";
import { useLocale } from "../i18n";
import { useRecipeDraft } from "../state/RecipeDraftProvider";

type Phase = "idle" | "previewing" | "review" | "applying";

/**
 * Inspector footer: preview + apply CollapsibleCard template to source files.
 */
export function ApplyRecipeControl() {
  const { t } = useLocale();
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
        toast.error(preview.error ?? t("apply.toastPreviewFailed"));
        setPhase("idle");
        return;
      }
      setFiles(preview.files);
      setPhase("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("apply.toastPreviewFailed"));
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
        toast.error(result.error ?? t("apply.toastApplyFailed"));
        setPhase("review");
        return;
      }
      toast.success(t("applyRecipe.toastOk"));
      commit();
      setPhase("idle");
      setFiles([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("apply.toastApplyFailed"));
      setPhase("review");
    }
  };

  return (
    <>
      <Tooltip content={isDirty ? t("applyRecipe.tipDirty") : t("applyRecipe.tipClean")}>
        <Button size="sm" disabled={!isDirty || busy} onClick={() => void openReview()}>
          {phase === "previewing" ? t("applyRecipe.preparing") : t("applyRecipe.button")}
        </Button>
      </Tooltip>

      <Dialog
        open={reviewOpen}
        onOpenChange={(open) => {
          if (!open) closeReview();
        }}
        title={t("applyRecipe.dialogTitle")}
        description={t("applyRecipe.dialogDesc", { files: changedFiles.length })}
        className="sandbox-apply-diff-dialog"
        showCloseButton={phase !== "applying"}
        closeAriaLabel={t("applyRecipe.closeAria")}
      >
        <div className="sandbox-apply-diff-list fynns-scroll">
          {files.length === 0 ? (
            <p className="sandbox-muted">{t("apply.noDiffs")}</p>
          ) : (
            files.map((file) => (
              <section key={file.path} className="sandbox-apply-diff-file">
                <header className="sandbox-apply-diff-file-head">
                  <code>{file.path}</code>
                  <span className="sandbox-muted">
                    {file.changed ? t("apply.changed") : t("apply.unchanged")}
                  </span>
                </header>
                {file.changed && file.diff ? (
                  <pre className="sandbox-apply-diff-pre fynns-scroll">{file.diff}</pre>
                ) : (
                  <p className="sandbox-muted">{t("apply.noTextual")}</p>
                )}
              </section>
            ))
          )}
        </div>
        <div className="sandbox-apply-diff-foot">
          <Button variant="ghost" onClick={closeReview} disabled={phase === "applying"}>
            {t("apply.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={phase === "applying" || changedFiles.length === 0}
            onClick={() => void confirmApply()}
          >
            {phase === "applying" ? t("apply.applying") : t("apply.confirm")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
