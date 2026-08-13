/**
 * Sandbox chrome UI persistence for the current Vite process.
 *
 * - Same `__SANDBOX_BOOT_ID__` (browser refresh): restore page / aside / nav /
 *   playground target / open Components categories / main-canvas scroll per page.
 * - New Vite boot id (server restart): treat as fresh — callers default to
 *   Components + catalog search focus. Does not use localStorage.
 */

import {
  GLOBALS_CATEGORY_TITLE_KEY,
  type GlobalsCategoryId,
} from "../catalog/globalsCatalog";

export type SandboxPage =
  | "playground"
  | "globals"
  | "layouts"
  | "foundations"
  | "motion"
  | "templates";

export type PlaygroundTarget = "card" | "collapsible";

const UI_SESSION_KEY = "fynns-sandbox-ui";
/** Armed when this Vite boot has no session yet — survives StrictMode remount. */
const FRESH_FOCUS_ARM_KEY = "fynns-sandbox-fresh-focus";

export type SandboxUiSession = {
  bootId: string;
  page: SandboxPage;
  asideOpen: boolean;
  preferNavOpen: boolean;
  playgroundTarget: PlaygroundTarget;
  openCategories: Partial<Record<GlobalsCategoryId, boolean>>;
  /** `.sandbox-canvas` scrollTop keyed by page (refresh + in-session page switches). */
  canvasScrollByPage: Partial<Record<SandboxPage, number>>;
};

const PAGES: readonly SandboxPage[] = [
  "playground",
  "globals",
  "layouts",
  "foundations",
  "motion",
  "templates",
];

const CATEGORY_IDS = Object.keys(
  GLOBALS_CATEGORY_TITLE_KEY,
) as GlobalsCategoryId[];

function isSandboxPage(value: unknown): value is SandboxPage {
  return typeof value === "string" && (PAGES as readonly string[]).includes(value);
}

function isPlaygroundTarget(value: unknown): value is PlaygroundTarget {
  return value === "card" || value === "collapsible";
}

function sanitizeOpenCategories(
  value: unknown,
): Partial<Record<GlobalsCategoryId, boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Partial<Record<GlobalsCategoryId, boolean>> = {};
  for (const id of CATEGORY_IDS) {
    if (typeof (value as Record<string, unknown>)[id] === "boolean") {
      out[id] = (value as Record<string, boolean>)[id];
    }
  }
  return out;
}

function sanitizeCanvasScrollByPage(
  value: unknown,
): Partial<Record<SandboxPage, number>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Partial<Record<SandboxPage, number>> = {};
  for (const page of PAGES) {
    const n = (value as Record<string, unknown>)[page];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) {
      out[page] = Math.round(n);
    }
  }
  return out;
}

/** Vite `define` — new string each `npm run sandbox` process start. */
export function getSandboxBootId(): string {
  return __SANDBOX_BOOT_ID__;
}

/**
 * If there is no valid session for this boot, arm catalog-search focus.
 * Idempotent; survives React StrictMode remount (sessionStorage).
 */
export function ensureFreshBootFocusArmed(): void {
  if (typeof sessionStorage === "undefined") return;
  if (loadSandboxUiSession() != null) return;
  try {
    sessionStorage.setItem(FRESH_FOCUS_ARM_KEY, getSandboxBootId());
  } catch {
    /* ignore */
  }
}

export function isFreshBootFocusArmed(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(FRESH_FOCUS_ARM_KEY) === getSandboxBootId();
  } catch {
    return false;
  }
}

export function clearFreshBootFocusArm(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (sessionStorage.getItem(FRESH_FOCUS_ARM_KEY) === getSandboxBootId()) {
      sessionStorage.removeItem(FRESH_FOCUS_ARM_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Defaults for a brand-new Vite session (Components + search focus elsewhere). */
export function freshSandboxUiSession(
  asideOpen = false,
): Omit<SandboxUiSession, "bootId"> {
  return {
    page: "globals",
    asideOpen,
    preferNavOpen: true,
    playgroundTarget: "card",
    openCategories: {},
    canvasScrollByPage: {},
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
      openCategories: sanitizeOpenCategories(parsed.openCategories),
      canvasScrollByPage: sanitizeCanvasScrollByPage(parsed.canvasScrollByPage),
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
  const base = prev ?? { bootId, ...freshSandboxUiSession() };
  const next: SandboxUiSession = {
    ...base,
    ...patch,
    bootId,
    openCategories: sanitizeOpenCategories(
      patch.openCategories ?? base.openCategories,
    ),
    canvasScrollByPage: sanitizeCanvasScrollByPage(
      patch.canvasScrollByPage !== undefined
        ? { ...base.canvasScrollByPage, ...patch.canvasScrollByPage }
        : base.canvasScrollByPage,
    ),
  };
  try {
    sessionStorage.setItem(UI_SESSION_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode — ignore */
  }
}
