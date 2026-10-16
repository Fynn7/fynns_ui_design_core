import { snackbar } from "../Snackbar";
import type { DiffProblem } from "./model";

/** Override any visible or accessible string; defaults are English. */
export type DiffLabels = {
  diff: string; close: string; tools: string; previous: string; next: string;
  wrap: string; copy: string; copyAll: string; copied: string; copyFailed: string;
  expandAll: string; collapseAll: string; showMore: string; showAll: string;
  noChanges: string; noFiles: string; unavailable: string; noNewline: string;
  binary: string; renamed: string; emptyFile: string;
  added: string; removed: string;
  position: (current: number, total: number) => string;
  hidden: (count: number) => string;
  problem: (reason: DiffProblem) => string;
};
export const defaultLabels: DiffLabels = {
  diff: "Diff", close: "Close", tools: "Diff tools", previous: "Previous change", next: "Next change",
  wrap: "Wrap lines", copy: "Copy patch", copyAll: "Copy all patches", copied: "Patch copied", copyFailed: "Could not copy patch",
  expandAll: "Expand all files", collapseAll: "Collapse all files", showMore: "Show more", showAll: "Show all",
  noChanges: "No changes", noFiles: "No files to compare", unavailable: "Only the context included in this patch is available.", noNewline: "No newline at end of file",
  binary: "Binary file changed. Text comparison is unavailable.", renamed: "File renamed. Contents unchanged.", emptyFile: "File metadata changed. No text changes.",
  added: "Added", removed: "Removed",
  position: (current, total) => `${current} / ${total}`,
  hidden: count => `${count} unchanged lines`,
  problem: reason => ({
    size: "This file exceeds the comparison limit (20,000 lines or 1 Mi UTF-16 code units).",
    budget: "Comparison stopped because this file exceeded the calculation budget.",
    invalid: "This patch is incomplete or uses an unsupported format.",
    multiple: "This patch contains multiple files. Use DiffDialog to review them.",
  })[reason],
};

export async function copyPatch(patch: string, labels: DiffLabels) {
  try {
    await navigator.clipboard.writeText(patch);
    snackbar(labels.copied, { severity: "success" });
  } catch { snackbar(labels.copyFailed, { severity: "error" }); }
}
