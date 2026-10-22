import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiffView } from "../DiffView";
import { DiffDialog, type DiffDialogProps } from "../DiffDialog";
import type { DiffFile, DiffSource } from "./model";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
const source: DiffSource = { kind: "text", before: "const value = 1;\n", after: "const value = 2;\n" };
const files: DiffFile[] = [{ id: "a", path: "a.ts", source }, { id: "b", path: "b.ts", source }];
const button = (label: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find(el => el.getAttribute("aria-label") === label || el.textContent === label)!;

describe("Diff component state contracts", () => {
  it("retains legacy caller-owned prefixes without modern chrome", () => {
    act(() => root.render(createElement(DiffView, { lines: [{ type: "del", text: "- literal" }, { type: "add", text: "+ literal" }], maxHeight: 99 })));
    expect(host.querySelector("pre")?.style.maxHeight).toBe("99px");
    expect(host.querySelectorAll(".fynns-diff-view-line")[0].textContent).toBe("- literal");
    expect(host.querySelector(".fynns-diff-head")).toBeNull();
  });

  it("controlled wrapping emits a request and waits for the new prop", () => {
    const onWrapChange = vi.fn();
    const render = (wrap: boolean) => act(() => root.render(createElement(DiffView, { source, wrap, onWrapChange, labels: { wrap: "换行", added: "新增", removed: "删除" } })));
    render(false);
    act(() => button("换行").click());
    expect(onWrapChange).toHaveBeenCalledWith(true);
    expect(button("换行").getAttribute("aria-pressed")).toBe("false");
    render(true);
    expect(button("换行").getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector(".fynns-diff-stats")?.getAttribute("aria-label")).toBe("新增 1, 删除 1");
    expect(host.querySelector(".fynns-diff-stats")?.getAttribute("role")).toBe("img");
  });

  it("keeps navigation when a controlled parent recreates an equivalent source object", () => {
    const render = (wrap: boolean) => act(() => root.render(createElement(DiffView, { source: { ...source }, wrap })));
    render(true);
    act(() => button("Next change").click());
    expect(host.querySelector('[role="status"]')?.textContent).toBe("1 / 1");
    render(false);
    expect(host.querySelector('[role="status"]')?.textContent).toBe("1 / 1");
  });

  it("renders source as inert text and handles unavailable multi-file input", () => {
    act(() => root.render(createElement(DiffView, { source: { kind: "text", before: "", after: '<script>alert(1)</script>\n' } })));
    expect(host.querySelector("script")).toBeNull();
    expect(host.textContent).toContain("<script>alert(1)</script>");
    const patch = "--- a/a\n+++ b/a\n@@ -0,0 +1 @@\n+text\n";
    act(() => root.render(createElement(DiffView, { source: { kind: "patch", patch: patch + patch } })));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("multiple files");
  });

  it("controlled file disclosure emits stable IDs without opening on its own", () => {
    const onExpandedFileIdsChange = vi.fn();
    const render = (ids: string[]) => act(() => root.render(createElement(DiffDialog, { open: true, onOpenChange: vi.fn(), title: "Review", files, expandedFileIds: ids, onExpandedFileIdsChange })));
    render([]);
    const disclosure = () => document.querySelector<HTMLButtonElement>(".fynns-diff-file .fynns-collapsible-trigger")!;
    act(() => disclosure().click());
    expect(onExpandedFileIdsChange).toHaveBeenCalledWith(["a"]);
    expect(disclosure().getAttribute("aria-expanded")).toBe("false");
    render(["a"]);
    expect(disclosure().getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelectorAll(".fynns-diff-body")).toHaveLength(1);
  });

  it("retains the last open review while closing and resets uncontrolled disclosure on reopen", () => {
    const onOpenChange = vi.fn();
    const render = (props: Partial<DiffDialogProps>) => act(() => root.render(createElement(DiffDialog, { open: true, onOpenChange, title: "Original review", files, ...props } as DiffDialogProps)));
    render({});
    act(() => button("Expand all files").click());
    expect(document.querySelectorAll(".fynns-diff-body")).toHaveLength(2);
    render({ open: false, title: "Cleared review", files: [] });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Original review");
    expect(document.querySelectorAll(".fynns-diff-body")).toHaveLength(2);
    render({ open: true });
    expect(document.querySelectorAll(".fynns-diff-body")).toHaveLength(0);
    act(() => button("Close").click());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("copies all patches with proper file boundaries and reports clipboard failures", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(writeText);
    const patch = "--- a/a\n+++ b/a\n@@ -0,0 +1 @@\n+text";
    const patchFiles: DiffFile[] = ["a", "b"].map(id => ({ id, path: id, source: { kind: "patch", patch } }));
    act(() => root.render(createElement(DiffDialog, { open: true, onOpenChange: vi.fn(), title: "Review", files: patchFiles })));
    await act(async () => button("Copy all patches").click());
    expect(writeText).toHaveBeenCalledWith(`${patch}\n${patch}\n`);
    // Rejection must be caught, including when clipboard permission is denied.
    writeText.mockRejectedValueOnce(new Error("denied"));
    await act(async () => button("Copy all patches").click());
    expect(writeText).toHaveBeenCalledTimes(2);
  });
});
