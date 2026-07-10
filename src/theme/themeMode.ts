/**
 * Runtime theme mode helpers for the fynns design system.
 *
 * Dark is the default (no attribute required). Light is activated by setting
 * `data-fynns-theme="light"` on `<html>`.
 */

export type FynnsThemeMode = "dark" | "light";

const STORAGE_KEY = "fynns-theme-mode";

function resolveRoot(root?: HTMLElement): HTMLElement | null {
  if (root) return root;
  if (typeof document === "undefined") return null;
  return document.documentElement;
}

/** Read the active theme mode from the document root. */
export function getFynnsThemeMode(root?: HTMLElement): FynnsThemeMode {
  const el = resolveRoot(root);
  if (!el) return "dark";
  return el.getAttribute("data-fynns-theme") === "light" ? "light" : "dark";
}

/** Apply a theme mode to the document root and optionally persist it. */
export function applyFynnsThemeMode(
  mode: FynnsThemeMode,
  opts?: { root?: HTMLElement; persist?: boolean },
): void {
  const el = resolveRoot(opts?.root);
  if (el) {
    if (mode === "light") {
      el.setAttribute("data-fynns-theme", "light");
    } else {
      el.removeAttribute("data-fynns-theme");
    }
  }
  if (opts?.persist !== false && typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

/** Restore the last persisted theme mode, or fall back to dark. */
export function restoreFynnsThemeMode(root?: HTMLElement): FynnsThemeMode {
  if (typeof localStorage === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  const mode: FynnsThemeMode = stored === "light" ? "light" : "dark";
  applyFynnsThemeMode(mode, { root, persist: false });
  return mode;
}
