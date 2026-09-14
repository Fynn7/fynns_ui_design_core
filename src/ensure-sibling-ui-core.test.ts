import { describe, expect, it } from "vitest";
import {
  decideSiblingSyncAction,
  npmrcHasActiveEmptyAuth,
  npmrcHasActivePackagesRegistry,
  versionAtLeast,
} from "../scripts/ensure-sibling-ui-core.mjs";

describe("decideSiblingSyncAction", () => {
  it("soft-skips pure ahead tips", () => {
    expect(
      decideSiblingSyncAction({
        ahead: 1,
        behind: 0,
        localVer: "0.5.250",
        remoteVer: "0.5.250",
      }),
    ).toEqual({ action: "skip", reason: "ahead" });
  });

  it("resets diverged tips when remote semver is equal (breaks consumer dead loop)", () => {
    expect(
      decideSiblingSyncAction({
        ahead: 1,
        behind: 3,
        localVer: "0.5.250",
        remoteVer: "0.5.250",
      }),
    ).toEqual({ action: "reset", reason: "remote-same-or-newer" });
  });

  it("resets when remote semver is newer", () => {
    expect(
      decideSiblingSyncAction({
        ahead: 1,
        behind: 2,
        localVer: "0.5.240",
        remoteVer: "0.5.250",
      }),
    ).toEqual({ action: "reset", reason: "remote-same-or-newer" });
    expect(versionAtLeast("0.5.250", "0.5.240")).toBe(true);
  });

  it("soft-skips when local semver is newer on a non-ff tip", () => {
    expect(
      decideSiblingSyncAction({
        ahead: 1,
        behind: 2,
        localVer: "0.5.260",
        remoteVer: "0.5.250",
      }),
    ).toEqual({ action: "skip", reason: "diverged" });
  });

  it("treats unknown behind as non-pure-ahead so equal remote can reset", () => {
    expect(
      decideSiblingSyncAction({
        ahead: 1,
        behind: null,
        localVer: "0.5.250",
        remoteVer: "0.5.250",
      }),
    ).toEqual({ action: "reset", reason: "remote-same-or-newer" });
  });
});

describe("safe .npmrc active-line detection", () => {
  const safeTemplate =
    "# Zero-token sibling consume: do not point @fynn7 at npm.pkg.github.com.\n" +
    "@fynn7:registry=https://registry.npmjs.org\n" +
    "# @fynn7:registry=https://npm.pkg.github.com\n" +
    "# //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n";

  it("ignores commented GitHub Packages lines in SAFE templates", () => {
    expect(npmrcHasActivePackagesRegistry(safeTemplate)).toBe(false);
    expect(npmrcHasActiveEmptyAuth(safeTemplate)).toBe(false);
  });

  it("detects active Packages registry / empty auth", () => {
    expect(npmrcHasActivePackagesRegistry("@fynn7:registry=https://npm.pkg.github.com\n")).toBe(
      true,
    );
    expect(
      npmrcHasActiveEmptyAuth("//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n"),
    ).toBe(true);
  });
});
