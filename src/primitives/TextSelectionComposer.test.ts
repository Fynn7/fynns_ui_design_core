import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextSelectionComposer, type TextSelectionComposerProps } from "./TextSelectionComposer";

vi.mock("./textSelection", async (original) => ({
  ...await original<typeof import("./textSelection")>(),
  textSelectionRect: () => new DOMRect(100, 100, 50, 20),
}));

let root: Root;
let host: HTMLElement;
function mount(props: Omit<TextSelectionComposerProps, "children">) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = (next = props) => act(() => root.render(createElement(TextSelectionComposer, {
    ...next, children: createElement("textarea", { defaultValue: "Alpha Beta" }),
  })));
  render();
  const source = host.querySelector("textarea")!;
  act(() => {
    source.focus();
    source.setSelectionRange(0, 5);
    source.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift", bubbles: true }));
  });
  const input = document.querySelector(".fynns-text-selection-composer-input") as HTMLInputElement;
  act(() => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "Explain");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return { source, input, render };
}
function send() {
  act(() => document.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
}
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = "";
});

describe("TextSelectionComposer async submission", () => {
  it("locks duplicate sends and closes after success with the captured quote", async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { source } = mount({ onSubmit });
    send();
    send();
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      prompt: "Explain", selection: { text: "Alpha", start: 0, end: 5 },
    });
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    await act(async () => { finish(); });
    expect(document.querySelector(".fynns-text-selection-composer-panel")).toBeNull();
    expect(document.activeElement).toBe(source);
  });

  it("keeps the draft on rejection and allows retry", async () => {
    let reject!: (reason: Error) => void;
    const onSubmit = vi.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
    const { input } = mount({ onSubmit, errorMessage: "Retry the reference" });
    send();
    await act(async () => { reject(new Error("network")); });
    expect(document.querySelector('[role="alert"]')?.textContent).toContain("Retry the reference");
    expect(input.value).toBe("Explain");
    expect(document.activeElement).toBe(input);
    send();
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("invalidates a pending completion when disabled", async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { render } = mount({ onSubmit });
    send();
    render({ onSubmit, disabled: true });
    expect(document.querySelector(".fynns-text-selection-composer-panel")).toBeNull();
    const other = document.createElement("button");
    document.body.append(other);
    other.focus();
    await act(async () => { finish(); });
    expect(document.activeElement).toBe(other);
    expect(document.querySelector(".fynns-text-selection-composer-panel")).toBeNull();
  });
});
