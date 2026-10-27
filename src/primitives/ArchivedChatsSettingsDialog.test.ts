import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ArchivedChatsSettingsDialog,
  type ArchivedChatsSettingsDialogProps,
} from "./ArchivedChatsSettingsDialog";

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));

const mounts: Array<{ root: Root; host: HTMLElement }> = [];
const labels = {
  title: "Settings", categories: "Settings categories",
  general: "General", generalSample: "Dark theme", archived: "Archived chats",
  unarchive: "Unarchive", close: "Close settings",
  archivedEmptyTitle: "No archived conversations", archivedEmptyDescription: "Archive one first.",
};

function mount(overrides: Partial<ArchivedChatsSettingsDialogProps> = {}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  mounts.push({ root, host });
  const props: ArchivedChatsSettingsDialogProps = {
    open: true, onOpenChange: vi.fn(),
    sessions: [{ id: "a", label: "First" }, { id: "b", label: "Second" }],
    labels, onUnarchive: vi.fn(),
    ...overrides,
  };
  act(() => root.render(createElement(ArchivedChatsSettingsDialog, props)));
  return { host, props };
}

function dialog() {
  return document.querySelector('[role="dialog"]')!;
}

afterEach(() => {
  for (const { root, host } of mounts.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

describe("ArchivedChatsSettingsDialog settings window", () => {
  it("lands on the archived sub-page with per-row unarchive actions", () => {
    const onUnarchive = vi.fn();
    mount({ onUnarchive });
    expect(dialog().textContent).toContain("First");
    expect(dialog().textContent).toContain("Second");
    const restore = Array.from(dialog().querySelectorAll("button")).find((el) => el.textContent === "Unarchive")!;
    act(() => restore.click());
    expect(onUnarchive).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("switches to the general sample category and back", () => {
    mount();
    const general = Array.from(dialog().querySelectorAll("button")).find((el) => el.textContent === "General")!;
    act(() => general.click());
    expect(dialog().textContent).toContain("Dark theme");
    expect(dialog().textContent).not.toContain("First");
    const archived = Array.from(dialog().querySelectorAll("button")).find((el) => el.textContent === "Archived chats")!;
    act(() => archived.click());
    expect(dialog().textContent).toContain("First");
  });

  it("shows the empty state when nothing is archived", () => {
    mount({ sessions: [] });
    expect(dialog().textContent).toContain("No archived conversations");
    expect(dialog().textContent).not.toContain("Unarchive");
  });

  it("renders nothing while closed", () => {
    mount({ open: false });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
