/**
 * Sandbox chrome UI persistence for the current Vite process.
 *
 * - Same `__SANDBOX_BOOT_ID__` (browser refresh): restore page / aside / nav /
 *   playground target / open Components categories.
 * - New Vite boot id (server restart): treat as fresh — callers default to
 *   Components + catalog search focus. Does not use localStorage.
 */

import type { GlobalsCategoryId } from "../catalog/globalsCatalog";

export type SandboxPage =
  | "playground"
  | "globals"
  | "foundations"
  | "motion"
  | "templates";

export type PlaygroundTarget = "card" | "collapsible";

const UI_SESSION_KEY = "fynns-sandbox-ui";

export type SandboxUiSession = {
  bootId: string;
  page: SandboxPage;
  asideOpen: boolean;
  preferNavOpen: boolean;
  playgroundTarget: PlaygroundTarget;
  openCategories: Partial<Record<GlobalsCategoryId, boolean>>;
};

const PAGES: readonly SandboxPage[] = [
  "playground",
  "globals",
  "foundations",
  "motion",
  "templates",
];

function isSandboxPage(value: unknown): value is SandboxPage {
  return typeof value === "string" && (PAGES as readonly string[]).includes(value);
}

function isPlaygroundTarget(value: unknown): value is PlaygroundTarget {
  return value === "card" || value === "collapsible";
}

/** Vite `define` — new string each `npm run sandbox` process start. */
export function getSandboxBootId(): string {
  return __SANDBOX_BOOT_ID__;
}

/** Defaults for a brand-new Vite session (Components + search focus elsewhere). */
export function freshSandboxUiSession(
  asideOpen = true,
): Omit<SandboxUiSession, "bootId"> {
  return {
    page: "globals",
    asideOpen,
    preferNavOpen: true,
    playgroundTarget: "card",
    openCategories: {},
  };
}

export function loadSandboxUiSession(): SandboxUiSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UI_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SandboxUiSession>;
    if (parsed.bootId !== getSandboxBootId()) return null;
    if (!isSandboxPage(parsed.page)) return null;
    if (typeof parsed.asideOpen !== "boolean") return null;
    if (typeof parsed.preferNavOpen !== "boolean") return null;
    if (!isPlaygroundTarget(parsed.playgroundTarget)) return null;
    return {
      bootId: parsed.bootId,
      page: parsed.page,
      asideOpen: parsed.asideOpen,
      preferNavOpen: parsed.preferNavOpen,
      playgroundTarget: parsed.playgroundTarget,
      openCategories:
        parsed.openCategories && typeof parsed.openCategories === "object"
          ? parsed.openCategories
          : {},
    };
  } catch {
    return null;
  }
}

export function patchSandboxUiSession(
  patch: Partial<Omit<SandboxUiSession, "bootId">>,
): void {
  if (typeof sessionStorage === "undefined") return;
  const bootId = getSandboxBootId();
  const prev = loadSandboxUiSession();
  const asideDefault =
    typeof window !== "undefined"
      ? !window.matchMedia("(max-width: 900px)").matches
      : true;
  const base = prev ?? { bootId, ...freshSandboxUiSession(asideDefault) };
  const next: SandboxUiSession = {
    ...base,
    ...patch,
    bootId,
    openCategories: patch.openCategories ?? base.openCategories,
  };
  try {
    sessionStorage.setItem(UI_SESSION_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — ignore */
  }
}
