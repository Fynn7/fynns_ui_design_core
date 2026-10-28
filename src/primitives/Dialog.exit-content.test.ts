import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];

function mount() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  return { root };
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("Dialog exit content", () => {
  it("keeps the last open children while the closing panel is still painting", () => {
    const { root } = mount();
    const render = (open: boolean, content: string) => {
      act(() =>
        root.render(
          createElement(Dialog, {
            open,
            onOpenChange: () => undefined,
            title: "Batch",
            children: createElement("div", { id: "dialog-content" }, content),
          }),
        ),
      );
    };

    render(true, "members");
    expect(document.querySelector("#dialog-content")?.textContent).toBe("members");

    // Mirrors a consumer clearing its data in the same tick as open=false.
    render(false, "No members yet");
    expect(document.querySelector("#dialog-content")?.textContent).toBe("members");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("members");
    expect(document.querySelector('[role="dialog"]')?.textContent).not.toContain("No members yet");
  });
});
