import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ChatActivityStep } from "./ChatActivity";

const mounts: Array<{ root: Root; host: HTMLElement }> = [];

function mountStep(
  status: "active" | "done",
  description: string | undefined,
) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });

  const render = (
    nextStatus: "active" | "done",
    nextDescription: string | undefined,
  ) => {
    act(() => {
      root.render(
        createElement(ChatActivityStep, {
          status: nextStatus,
          label: nextStatus === "done" ? "Read files" : "Reading files…",
          description: nextDescription,
        }),
      );
    });
  };

  render(status, description);
  return { host, render };
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("ChatActivityStep description disclosure", () => {
  it("retains the disclosure and its last text after completion", () => {
    const { host, render } = mountStep("active", "Reading package metadata");

    render("done", undefined);

    const trigger = host.querySelector<HTMLButtonElement>(
      ".fynns-chat-activity-desc-trigger",
    );
    const description = host.querySelector(".fynns-chat-activity-desc");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(description?.textContent).toBe("Reading package metadata");

    act(() => trigger?.click());

    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(description?.textContent).toBe("Reading package metadata");
  });
});
