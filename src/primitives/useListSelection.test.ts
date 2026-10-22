import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useListSelection, type ListSelection, type UseListSelectionOptions } from "./useListSelection";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
const items = ["a", "b", "c", "d", "e"].map((id) => ({ id, disabled: id === "d" }));

function mount(overrides: Partial<UseListSelectionOptions> = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  let current: ListSelection;
  let options: UseListSelectionOptions = { items, ...overrides };
  function Harness() { current = useListSelection(options); return null; }
  const update = (next: Partial<UseListSelectionOptions>) => {
    options = { ...options, ...next };
    act(() => root.render(createElement(Harness)));
  };
  update({});
  return { get selection() { return current!; }, update };
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount()); host.remove();
  }
});

describe("list selection dataset semantics", () => {
  it("selects the full ordered dataset, skips disabled IDs, and treats select-all as bulk", () => {
    const state = mount();
    act(() => state.selection.selectAll());
    expect(state.selection.selectedIds).toEqual(["a", "b", "c", "e"]);
    expect(state.selection.allSelected).toBe(true);
    expect(state.selection.multiple).toBe(true);
  });
  it("routes select-all to bulk even when only one enabled row exists", () => {
    const state = mount({ items: [{ id: "one" }] });
    act(() => state.selection.selectOnly("one"));
    expect(state.selection.multiple).toBe(false);
    act(() => state.selection.selectAll());
    expect(state.selection.multiple).toBe(true);
    expect(state.selection.allSelected).toBe(true);
  });
  it("uses a stable range anchor and can add a range without losing prior selections", () => {
    const state = mount();
    act(() => state.selection.selectOnly("b"));
    act(() => state.selection.selectRange("e"));
    expect(state.selection.selectedIds).toEqual(["b", "c", "e"]);
    act(() => state.selection.selectRange("c"));
    expect(state.selection.selectedIds).toEqual(["b", "c"]);
    act(() => state.selection.toggle("e"));
    act(() => state.selection.selectRange("a", true));
    expect(state.selection.selectedIds).toEqual(["a", "b", "c", "e"]);
  });
  it("normalizes duplicate IDs and invalid external selections", () => {
    const state = mount({ items: [{ id: "b" }, { id: "a" }, { id: "b" }] });
    act(() => state.selection.replace(["a", "missing", "b", "a"]));
    expect(state.selection.selectedIds).toEqual(["b", "a"]);
  });
  it("prunes deleted / disabled IDs, retaining remaining selection", () => {
    const changed = vi.fn();
    const state = mount({ onSelectionChange: changed });
    act(() => state.selection.selectAll());
    state.update({ items: [{ id: "a" }, { id: "c", disabled: true }, { id: "e" }] });
    expect(state.selection.selectedIds).toEqual(["a", "e"]);
    expect(changed).toHaveBeenLastCalledWith(["a", "e"]);
  });
  it("does not replace controlled selection until the caller accepts it", () => {
    const changed = vi.fn();
    const state = mount({ selectedIds: ["b"], onSelectionChange: changed });
    act(() => state.selection.toggle("e"));
    expect(changed).toHaveBeenLastCalledWith(["b", "e"]);
    expect(state.selection.selectedIds).toEqual(["b"]);
    state.update({ selectedIds: ["b", "e"] });
    expect(state.selection.selectedIds).toEqual(["b", "e"]);
  });
  it("clears the selection and old range anchor when source identity changes", () => {
    const state = mount({ resetKey: "source-a" });
    act(() => state.selection.selectOnly("a"));
    state.update({ resetKey: "source-b" });
    expect(state.selection.selectedIds).toEqual([]);
    act(() => state.selection.selectRange("e"));
    expect(state.selection.selectedIds).toEqual(["e"]);
  });
});
