import {
  applyFynnsThemeMode,
  DIALOG_TRANSITION_MS,
  getFynnsThemeMode,
  IconButton,
  MoonIcon,
  NavItem,
  NavItemLabel,
  Panel,
  PanelRightIcon,
  restoreFynnsThemeMode,
  SettingsIcon,
  SunIcon,
  Toaster,
  ToggleGroup,
  Tooltip,
  type FynnsThemeMode,
} from "@fynns/ui";
import { useEffect, useState, type ReactNode } from "react";
import { useLocale } from "../i18n";
import { usePlaygroundTarget } from "../state/PlaygroundTargetProvider";
import { useTokenDraft } from "../state/TokenDraftProvider";
import { AgentInputBar } from "../pages/AgentInputBar";
import { CardPreviewCanvas } from "../pages/CardPreviewCanvas";
import { CollapsiblePreviewCanvas } from "../pages/CollapsiblePreviewCanvas";
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

function asideTransitionMs(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return DIALOG_TRANSITION_MS;
}

/** Right inspector pane: width expand/collapse (no translate — keeps the
 * topbar / canvas / aside seam a hard edge throughout the motion). */
function SandboxAside({ open, children }: { open: boolean; children: ReactNode }) {
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(open);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setRendered(false), asideTransitionMs());
    return () => clearTimeout(timer);
  }, [open]);

  if (!rendered) return null;

  return (
    <aside
      className="sandbox-aside"
      data-state={entered ? "open" : "closing"}
      aria-hidden={!open || undefined}
      inert={!open ? true : undefined}
    >
      {children}
    </aside>
  );
}

export function SandboxShell() {
  const { t } = useLocale();
  const [page, setPage] = useState<SandboxPage>("playground");
  const [theme, setTheme] = useState<FynnsThemeMode>("dark");
  const [asideOpen, setAsideOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(max-width: 900px)").matches;
  });
  const { undo, redo } = useTokenDraft();
  const { target, setTarget } = usePlaygroundTarget();

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
      ? t("nav.playground")
      : page === "globals"
        ? t("nav.globals")
        : page === "foundations"
          ? t("nav.foundations")
          : page === "motion"
            ? t("nav.motion")
            : t("nav.templates");

  const hasInspector = page === "playground" || page === "globals";
  const showAside = hasInspector && asideOpen;

  return (
    <div className="sandbox-root">
      <Toaster position="bottom-right" />
      <Panel className="sandbox-nav" side="left">
        <div className="sandbox-brand">{t("brand.name")}</div>
        <nav className="sandbox-nav-list" aria-label={t("nav.aria")}>
          <NavItem active={page === "playground"} onClick={() => setPage("playground")}>
            <NavItemLabel>{t("nav.playground")}</NavItemLabel>
          </NavItem>
          <NavItem active={page === "globals"} onClick={() => setPage("globals")}>
            <NavItemLabel>{t("nav.globals")}</NavItemLabel>
          </NavItem>
          <NavItem active={page === "foundations"} onClick={() => setPage("foundations")}>
            <NavItemLabel>{t("nav.foundations")}</NavItemLabel>
          </NavItem>
          <NavItem active={page === "motion"} onClick={() => setPage("motion")}>
            <NavItemLabel>{t("nav.motion")}</NavItemLabel>
          </NavItem>
        </nav>
        <div className="sandbox-nav-foot">
          <Tooltip content={t("nav.templatesTip")} side="right">
            <IconButton
              aria-label={t("nav.templatesAria")}
              aria-pressed={page === "templates"}
              className={
                page === "templates" ? "sandbox-nav-gear sandbox-nav-gear--active" : "sandbox-nav-gear"
              }
              onClick={() => setPage("templates")}
            >
              <SettingsIcon size={18} aria-hidden />
            </IconButton>
          </Tooltip>
        </div>
      </Panel>

      <div className="sandbox-main">
        <header className="sandbox-topbar">
          <div className="sandbox-topbar-title">{pageTitle}</div>
          <div className="sandbox-topbar-actions">
            {page === "playground" ? <AgentInputBar /> : null}
            {hasInspector ? (
              <Tooltip content={asideOpen ? t("topbar.hideAside") : t("topbar.showAside")}>
                <IconButton
                  aria-label={asideOpen ? t("topbar.hideAside") : t("topbar.showAside")}
                  aria-pressed={asideOpen}
                  onClick={() => setAsideOpen((open) => !open)}
                >
                  <PanelRightIcon size={16} aria-hidden />
                </IconButton>
              </Tooltip>
            ) : null}
            <Tooltip content={theme === "light" ? t("topbar.themeToDark") : t("topbar.themeToLight")}>
              <IconButton
                aria-label={theme === "light" ? t("topbar.themeToDark") : t("topbar.themeToLight")}
                aria-pressed={theme === "light"}
                onClick={toggleTheme}
              >
                {theme === "light" ? <MoonIcon size={16} aria-hidden /> : <SunIcon size={16} aria-hidden />}
              </IconButton>
            </Tooltip>
          </div>
        </header>

        <div className="sandbox-body">
          <main className="sandbox-canvas fynns-scroll">
            {page === "playground" ? (
              <div className="sandbox-playground">
                <div className="sandbox-playground-target">
                  <ToggleGroup
                    size="compact"
                    value={target}
                    onChange={(id) => setTarget(id as typeof target)}
                    options={[
                      { value: "card", label: t("playground.targetCard") },
                      { value: "collapsible", label: t("playground.targetCollapsible") },
                    ]}
                  />
                </div>
                {target === "card" ? <CardPreviewCanvas /> : <CollapsiblePreviewCanvas />}
              </div>
            ) : null}
            {page === "globals" ? <GlobalsPage /> : null}
            {page === "foundations" ? <FoundationsPage /> : null}
            {page === "motion" ? <MotionPage /> : null}
            {page === "templates" ? (
              <TemplatesPage theme={theme} onThemeChange={setTheme} />
            ) : null}
          </main>
          {page === "playground" ? (
            <SandboxAside open={showAside}>
              <PropertyInspector />
            </SandboxAside>
          ) : null}
          {page === "globals" ? (
            <SandboxAside open={showAside}>
              <GlobalsInspector />
            </SandboxAside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
