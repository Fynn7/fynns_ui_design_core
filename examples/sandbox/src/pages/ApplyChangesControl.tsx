import { Button, FullscreenDialog, Tooltip } from "@fynns/ui";
import { useState } from "react";
import {
  applyTokenOverrides,
  previewTokenOverrides,
  type ApplyFileDiff,
} from "../export/applyTokens";
import { useLocale } from "../i18n";
import { useTokenDraft } from "../state/TokenDraftProvider";

type Phase = "idle" | "previewing" | "review" | "applying";

/**
 * Inspector footer controls: reset draft, then preview/confirm writeback.
 */
export function ApplyChangesControl() {
  const { t } = useLocale();
  const { draft, reset } = useTokenDraft();
  const overrideCount = Object.keys(draft.overrides).length;
  const [phase, setPhase] = useState<Phase>("idle");
  const [files, setFiles] = useState<ApplyFileDiff[]>([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const busy = phase === "previewing" || phase === "applying";
  const reviewOpen = phase === "review" || phase === "applying";
  const changedFiles = files.filter((f) => f.changed);

  const openReview = async () => {
    if (overrideCount === 0 || busy) return;
    setPhase("previewing");
    setStatus(null);
    try {
      const preview = await previewTokenOverrides(draft.overrides);
      if (!preview.ok) {
        setStatus(preview.error ?? t("apply.toastPreviewFailed"));
        setPhase("idle");
        return;
      }
      setFiles(preview.files);
      setAppliedCount(preview.applied.length);
      setSkippedCount(preview.skipped.length);
      setPhase("review");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("apply.toastPreviewFailed"));
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
        setStatus(result.error ?? t("apply.toastApplyFailed"));
        setPhase("review");
        return;
      }
      reset();
      setPhase("idle");
      setFiles([]);
      if (result.skipped.length > 0) {
        setStatus(
          t("apply.toastPartial", {
            applied: result.applied.length,
            skipped: result.skipped.length,
          }),
        );
      } else {
        setStatus(t("apply.toastOk", { applied: result.applied.length }));
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("apply.toastApplyFailed"));
      setPhase("review");
    }
  };

  return (
    <>
      <Tooltip content={t("topbar.resetTip")}>
        <Button
          size="sm"
          variant="ghost"
          disabled={overrideCount === 0 || busy}
          onClick={() => {
            reset();
            setStatus(t("topbar.resetToast"));
          }}
        >
          {t("topbar.reset")}
        </Button>
      </Tooltip>
      <Tooltip content={t("apply.tip")}>
        <Button
          size="sm"
          variant="primary"
          disabled={overrideCount === 0 || busy}
          onClick={() => void openReview()}
        >
          {phase === "previewing" ? t("apply.preparing") : t("apply.button")}
        </Button>
      </Tooltip>
      {status ? <p className="sandbox-muted sandbox-apply-status">{status}</p> : null}

      <FullscreenDialog
        open={reviewOpen}
        onOpenChange={(open) => {
          if (!open) closeReview();
        }}
        title={t("apply.dialogTitle")}
        actions={
          <>
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
          </>
        }
      >
        <p className="sandbox-muted">
          {skippedCount > 0
            ? t("apply.dialogDescSkipped", {
                applied: appliedCount,
                skipped: skippedCount,
              })
            : t("apply.dialogDesc", {
                applied: appliedCount,
                files: changedFiles.length,
              })}
        </p>
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
      </FullscreenDialog>
    </>
  );
}
