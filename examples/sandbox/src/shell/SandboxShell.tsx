import {
  applyFynnsThemeMode,
  getFynnsThemeMode,
  IconButton,
  MoonIcon,
  NavItem,
  NavItemLabel,
  Panel,
  RefreshIcon,
  restoreFynnsThemeMode,
  SettingsIcon,
  SunIcon,
  toast,
  Toaster,
  Tooltip,
  type FynnsThemeMode,
} from "@fynns/ui";
import { useEffect, useState } from "react";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { AgentInputBar } from "../pages/AgentInputBar";
import { CardPreviewCanvas } from "../pages/CardPreviewCanvas";
import { PropertyInspector } from "../pages/PropertyInspector";
import { FoundationsPage } from "../pages/FoundationsPage";
import { GlobalsInspector } from "../pages/GlobalsInspector";
import { GlobalsPage } from "../pages/GlobalsPage";
import { MotionPage } from "../pages/MotionPage";
import { TemplatesPage } from "../pages/TemplatesPage";

export type SandboxPage =
  | "playground"
  | "globals"
  | "foundations"
  | "motion"
  | "templates";

export function SandboxShell() {
  const [page, setPage] = useState<SandboxPage>("playground");
  const [theme, setTheme] = useState<FynnsThemeMode>("dark");
  const { undo, redo, reset } = useTokenDraft();

  useEffect(() => {
    setTheme(restoreFynnsThemeMode());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (mod && (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const toggleTheme = () => {
    const next: FynnsThemeMode = getFynnsThemeMode() === "light" ? "dark" : "light";
    applyFynnsThemeMode(next);
    setTheme(next);
  };

  const pageTitle =
    page === "playground"
      ? "Playground"
      : page === "globals"
        ? "Globals"
        : page === "foundations"
          ? "Foundations"
          : page === "motion"
            ? "Motion"
            : "Templates";

  return (
    <div className="sandbox-root">
      <Toaster position="bottom-right" />
      <Panel className="sandbox-nav" side="left">
        <div className="sandbox-brand">fynns sandbox</div>
        <nav className="sandbox-nav-list" aria-label="Sandbox pages">
          <NavItem active={page === "playground"} onClick={() => setPage("playground")}>
            <NavItemLabel>Playground</NavItemLabel>
          </NavItem>
          <NavItem active={page === "globals"} onClick={() => setPage("globals")}>
            <NavItemLabel>Globals</NavItemLabel>
          </NavItem>
          <NavItem active={page === "foundations"} onClick={() => setPage("foundations")}>
            <NavItemLabel>Foundations</NavItemLabel>
          </NavItem>
          <NavItem active={page === "motion"} onClick={() => setPage("motion")}>
            <NavItemLabel>Motion</NavItemLabel>
          </NavItem>
        </nav>
        <div className="sandbox-nav-foot">
          <Tooltip content="Templates & config export/import" side="right">
            <IconButton
              aria-label="Templates and config"
              aria-pressed={page === "templates"}
              className={
                page === "templates" ? "sandbox-nav-gear sandbox-nav-gear--active" : "sandbox-nav-gear"
              }
              onClick={() => setPage("templates")}
            >
              <SettingsIcon size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </Panel>

      <div className="sandbox-main">
        <header className="sandbox-topbar">
          <div className="sandbox-topbar-title">{pageTitle}</div>
          <div className="sandbox-topbar-actions">
            {page === "playground" ? <AgentInputBar /> : null}
            <Tooltip content="Clear all token overrides in the draft (hue, radius, elevation, …)">
              <IconButton
                aria-label="Reset draft overrides"
                onClick={() => {
                  reset();
                  toast.message("Draft reset");
                }}
              >
                <RefreshIcon size={16} aria-hidden />
              </IconButton>
            </Tooltip>
            <Tooltip content={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
              <IconButton
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                aria-pressed={theme === "light"}
                onClick={toggleTheme}
              >
                {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </IconButton>
            </Tooltip>
          </div>
        </header>

        <div
          className={
            page === "templates" ? "sandbox-body sandbox-body--single" : "sandbox-body"
          }
        >
          <main className="sandbox-canvas fynns-scroll">
            {page === "playground" ? <CardPreviewCanvas /> : null}
            {page === "globals" ? <GlobalsPage /> : null}
            {page === "foundations" ? <FoundationsPage /> : null}
            {page === "motion" ? <MotionPage /> : null}
            {page === "templates" ? (
              <TemplatesPage theme={theme} onThemeChange={setTheme} />
            ) : null}
          </main>
          {page === "playground" ? (
            <aside className="sandbox-aside">
              <PropertyInspector />
            </aside>
          ) : null}
          {page === "globals" ? (
            <aside className="sandbox-aside">
              <GlobalsInspector />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
