import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TagInput, type TagInputProps } from "./TagInput";

let root: Root;
let host: HTMLElement;
function mount(extra: Partial<TagInputProps> = {}) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const onValueChange = vi.fn();
  const props = { value: ["React"], onValueChange, tagsAriaLabel: "Tags", removeAriaLabel: (tag: string) => `Remove ${tag}`, "aria-label": "Add tags", ...extra };
  act(() => root.render(createElement(TagInput, props)));
  const input = host.querySelector("input")!;
  const type = (value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const enter = (isComposing = false) => {
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, isComposing });
    act(() => input.dispatchEvent(event));
    return event;
  };
  return { input, type, enter, onValueChange };
}
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = "";
});

describe("TagInput commits and accessibility", () => {
  it("adds a pasted batch once and prevents enclosing form submission", () => {
    const { input, type, enter, onValueChange } = mount();
    type(" React, TypeScript， CSS, CSS, , ");
    expect(enter().defaultPrevented).toBe(true);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["React", "TypeScript", "CSS"]);
    expect(input.value).toBe("");
    act(() => input.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
  it("commits on blur and removes via the localized button", () => {
    const { type, input, onValueChange } = mount();
    type(" CSS ");
    act(() => input.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(onValueChange).toHaveBeenCalledWith(["React", "CSS"]);
    act(() => (host.querySelector('[aria-label="Remove React"]') as HTMLButtonElement).click());
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });
  it("preserves IME draft and respects consumer keyboard cancellation", () => {
    const { type, input, enter, onValueChange } = mount({ onKeyDown: event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) event.preventDefault(); } });
    type("设计");
    enter(true);
    expect(input.value).toBe("设计");
    enter();
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it.each([{ disabled: true }, { readOnly: true }])("locks additions and remove buttons for %s", extra => {
    const { type, enter, onValueChange } = mount(extra);
    type("CSS");
    enter();
    const remove = host.querySelector('[aria-label="Remove React"]') as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    act(() => remove.click());
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it("shows an accessible empty input and connects error text", () => {
    const { input } = mount({ value: [], errorText: "Invalid tag", id: "tags" });
    expect(host.querySelector(".fynns-chip-set")).toBeNull();
    expect(input.getAttribute("aria-label")).toBe("Add tags");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("Invalid tag");
  });
});
