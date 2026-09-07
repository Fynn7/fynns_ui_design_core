import { describe, expect, it } from "vitest";
import {
  createStatusTreeOpenState,
  reduceStatusTreeStreaming,
  reduceStatusTreeUserOpen,
  snapshotStatusTreeOpen,
  statusTreeOpenFromState,
} from "./statusTreeOpen";

describe("statusTreeOpenFromState", () => {
  it("controlled open wins", () => {
    const state = createStatusTreeOpenState(true, true);
    expect(
      statusTreeOpenFromState(state, {
        mode: "thinking",
        streaming: true,
        open: false,
      }),
    ).toBe(false);
  });

  it("forces open while streaming unless pinned closed", () => {
    const open = createStatusTreeOpenState(false, true);
    expect(
      statusTreeOpenFromState(open, { mode: "activity", streaming: true }),
    ).toBe(true);
    const pinned = { ...open, userPinnedClosed: true };
    expect(
      statusTreeOpenFromState(pinned, { mode: "activity", streaming: true }),
    ).toBe(false);
  });
});

describe("reduceStatusTreeStreaming · thinking", () => {
  it("clears pins and opens on idle → streaming", () => {
    const prev = {
      ...createStatusTreeOpenState(false, false),
      userPinnedClosed: true,
      userPinnedOpen: true,
      didAutoCollapse: true,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "thinking",
      streaming: true,
    });
    expect(next).toMatchObject({
      wasStreaming: true,
      userPinnedClosed: false,
      userPinnedOpen: false,
      didAutoCollapse: false,
      internalOpen: true,
    });
    expect(
      statusTreeOpenFromState(next, { mode: "thinking", streaming: true }),
    ).toBe(true);
  });

  it("auto-collapses once on streaming → done", () => {
    const prev = {
      ...createStatusTreeOpenState(true, true),
      didAutoCollapse: false,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "thinking",
      streaming: false,
    });
    expect(next.internalOpen).toBe(false);
    expect(next.didAutoCollapse).toBe(true);
    expect(
      statusTreeOpenFromState(next, { mode: "thinking", streaming: false }),
    ).toBe(false);
  });

  it("skips auto-collapse when userPinnedOpen", () => {
    const prev = {
      ...createStatusTreeOpenState(true, true),
      userPinnedOpen: true,
      didAutoCollapse: false,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "thinking",
      streaming: false,
    });
    expect(next.internalOpen).toBe(true);
    expect(next.didAutoCollapse).toBe(false);
  });

  it("does not re-collapse after didAutoCollapse", () => {
    const prev = {
      ...createStatusTreeOpenState(true, true),
      didAutoCollapse: true,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "thinking",
      streaming: false,
    });
    expect(next.internalOpen).toBe(true);
  });
});

describe("reduceStatusTreeStreaming · activity", () => {
  it("force-opens and clears pin on idle → streaming", () => {
    const prev = {
      ...createStatusTreeOpenState(false, false),
      userPinnedClosed: true,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "activity",
      streaming: true,
    });
    expect(next.internalOpen).toBe(true);
    expect(next.userPinnedClosed).toBe(false);
  });

  it("does not auto-collapse on streaming → done", () => {
    const prev = createStatusTreeOpenState(true, true);
    const next = reduceStatusTreeStreaming(prev, {
      mode: "activity",
      streaming: false,
    });
    expect(next.internalOpen).toBe(true);
    expect(
      snapshotStatusTreeOpen(next, { mode: "activity", streaming: false }).open,
    ).toBe(true);
  });

  it("controlled mode only advances wasStreaming", () => {
    const prev = {
      ...createStatusTreeOpenState(false, false),
      userPinnedClosed: true,
    };
    const next = reduceStatusTreeStreaming(prev, {
      mode: "activity",
      streaming: true,
      controlled: true,
    });
    expect(next.wasStreaming).toBe(true);
    expect(next.userPinnedClosed).toBe(true);
    expect(next.internalOpen).toBe(false);
  });
});

describe("reduceStatusTreeUserOpen", () => {
  it("pins closed while streaming (thinking)", () => {
    const prev = createStatusTreeOpenState(true, true);
    const next = reduceStatusTreeUserOpen(prev, {
      mode: "thinking",
      streaming: true,
      open: false,
    });
    expect(next.internalOpen).toBe(false);
    expect(next.userPinnedClosed).toBe(true);
    expect(
      statusTreeOpenFromState(next, { mode: "thinking", streaming: true }),
    ).toBe(false);
  });

  it("pins open after done so auto-collapse does not re-fire", () => {
    const prev = {
      ...createStatusTreeOpenState(false, false),
      didAutoCollapse: true,
    };
    const next = reduceStatusTreeUserOpen(prev, {
      mode: "thinking",
      streaming: false,
      open: true,
    });
    expect(next.userPinnedOpen).toBe(true);
    expect(next.didAutoCollapse).toBe(true);
  });
});
