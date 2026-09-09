import { describe, expect, it } from "vitest";
import { initialsFromName } from "./Avatar";

describe("initialsFromName", () => {
  it("uses first+last word letters for multi-word labels", () => {
    expect(initialsFromName("Agents Hub")).toBe("AH");
    expect(initialsFromName("Sample user")).toBe("SU");
    expect(initialsFromName("  Ada   Lovelace  ")).toBe("AL");
  });

  it("takes up to two letters from a single word", () => {
    expect(initialsFromName("Ada")).toBe("AD");
    expect(initialsFromName("Hub")).toBe("HU");
  });

  it("returns empty for blank input", () => {
    expect(initialsFromName("")).toBe("");
    expect(initialsFromName("   ")).toBe("");
  });
});
