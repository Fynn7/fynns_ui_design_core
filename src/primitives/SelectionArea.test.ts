import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DropdownMenuItem } from "./DropdownMenu";
import { SelectionArea, type SelectionAreaProps, type SelectionAreaState } from "./SelectionArea";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
function mount(overrides: Partial<SelectionAreaProps> = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  const action = vi.fn();
  let scope: SelectionAreaState;
  let props: SelectionAreaProps = {
    label: "Samples", items: ["a", "b", "c"].map((id) => ({ id })),
    renderMenu: (context) => createElement(DropdownMenuItem, {
      onClick: () => action(context),
    }, context.kind),
    children: (value) => {
      scope = value;
      return createElement("div", value.areaProps,
        ...props.items.map((item) => createElement("button", {
          key: item.id, ...value.getItemProps(item.id), disabled: item.disabled,
        }, item.id)));
    },
    ...overrides,
  };
  const update = (next: Partial<SelectionAreaProps>) => {
    props = { ...props, ...next };
    act(() => root.render(createElement(SelectionArea, props)));
  };
  update({});
  const row = (id: string) => Array.from(host.querySelectorAll<HTMLButtonElement>("button"))
    .find((el) => el.getAttribute("data-fynns-selection-id") === id)!;
  return { host, action, row, update, get scope() { return scope!; } };
}
function rightClick(target: HTMLElement) {
  act(() => target.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 30, clientY: 60 })));
}
function menu() { return document.querySelector('[role="menu"][data-state="open"]'); }
afterEach(() => {
  for (const { root, host } of mounts.splice(0)) { act(() => root.unmount()); host.remove(); }
});

describe("SelectionArea action target snapshots", () => {
  it("keeps captured bulk targets if controlled selection changes after the menu opens", () => {
    const state = mount();
    act(() => state.scope.replace(["a", "b"]));
    rightClick(state.row("a"));
    act(() => state.scope.replace(["c"]));
    act(() => menu()!.querySelector<HTMLButtonElement>("button")!.click());
    expect(state.action).toHaveBeenCalledWith(expect.objectContaining({ kind: "selection", selectedIds: ["a", "b"] }));
  });
  it("closes a bulk menu if any captured action target disappears", () => {
    const state = mount();
    act(() => state.scope.selectAll());
    rightClick(state.row("a"));
    state.update({ items: [{ id: "a" }, { id: "c" }] });
    expect(menu()).toBeNull();
    expect(state.scope.selectedIds).toEqual(["a", "c"]);
    expect(state.action).not.toHaveBeenCalled();
  });
  it("passes select-all of a one-item dataset through the customizable bulk renderer", () => {
    const state = mount({ items: [{ id: "a" }] });
    act(() => state.scope.selectAll());
    rightClick(state.row("a"));
    expect(menu()?.textContent).toBe("selection");
    act(() => menu()!.querySelector<HTMLButtonElement>("button")!.click());
    expect(state.action).toHaveBeenCalledWith(expect.objectContaining({ kind: "selection", allSelected: true, selectedIds: ["a"] }));
  });
  it("allows a custom renderer to suppress unsupported menus without a fallback action", () => {
    const state = mount({ renderMenu: () => null });
    act(() => state.scope.selectAll());
    rightClick(state.row("a"));
    expect(menu()).toBeNull();
    expect(state.scope.menuTrigger("a")).toBeNull();
    expect(state.action).not.toHaveBeenCalled();
  });
  it("closes the old source menu even if a replacement source reuses the same IDs", () => {
    const state = mount({ resetKey: "first" });
    act(() => state.scope.replace(["a", "b"]));
    rightClick(state.row("a"));
    state.update({ resetKey: "second" });
    expect(menu()).toBeNull();
    expect(state.scope.selectedIds).toEqual([]);
  });
});
