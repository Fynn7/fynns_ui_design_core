import {
  applyFynnsThemeMode,
  EyeIcon,
  FileIcon,
  getFynnsThemeMode,
  IconButton,
  LayoutGridIcon,
  MenuIcon,
  MoonIcon,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailItem,
  PanelLeftIcon,
  PanelRightIcon,
  restoreFynnsThemeMode,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
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
import { LayoutChromeInspector } from "../pages/LayoutChromeInspector";
import { MotionPage } from "../pages/MotionPage";
import { TemplatesPage } from "../pages/TemplatesPage";

export type SandboxPage =
  | "playground"
  | "globals"
  | "foundations"
  | "motion"
  | "templates";

const NAV_EXPANDED_KEY = "fynns-sandbox-nav-expanded";

/** Keep in sync with `--fynns-duration-base` (aside expand/collapse). */
const ASIDE_TRANSITION_MS = 240;

function asideTransitionMs(): number {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  return ASIDE_TRANSITION_MS;
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
  /** User preference for drawer vs rail; narrow viewports always use the drawer. */
  const [preferNavExpanded, setPreferNavExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(NAV_EXPANDED_KEY) !== "0";
  });
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const { undo, redo } = useTokenDraft();
  const { target, setTarget } = usePlaygroundTarget();

  const navExpanded = narrow || preferNavExpanded;

  useEffect(() => {
    setTheme(restoreFynnsThemeMode());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(NAV_EXPANDED_KEY, preferNavExpanded ? "1" : "0");
  }, [preferNavExpanded]);

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

  const hasInspector =
    page === "playground" ||
    page === "globals" ||
    page === "foundations" ||
    page === "motion";
  const showAside = hasInspector && asideOpen;

  const destinations = (
    <>
      <Tooltip content={t("nav.playgroundHint")} side="right">
        <NavigationDrawerItem
          icon={<EyeIcon />}
          label={t("nav.playground")}
          active={page === "playground"}
          onClick={() => setPage("playground")}
        />
      </Tooltip>
      <Tooltip content={t("nav.globalsHint")} side="right">
        <NavigationDrawerItem
          icon={<LayoutGridIcon />}
          label={t("nav.globals")}
          active={page === "globals"}
          onClick={() => setPage("globals")}
        />
      </Tooltip>
      <NavigationDrawerItem
        icon={<FileIcon />}
        label={t("nav.foundations")}
        active={page === "foundations"}
        onClick={() => setPage("foundations")}
      />
      <NavigationDrawerItem
        icon={<SparklesIcon />}
        label={t("nav.motion")}
        active={page === "motion"}
        onClick={() => setPage("motion")}
      />
      <Tooltip
        content={t("nav.templatesTip")}
        side="right"
        className="sandbox-nav-templates"
      >
        <NavigationDrawerItem
          icon={<SettingsIcon />}
          label={t("nav.templates")}
          active={page === "templates"}
          onClick={() => setPage("templates")}
        />
      </Tooltip>
    </>
  );

  return (
    <div
      className="sandbox-root"
      data-nav={navExpanded ? "drawer" : "rail"}
    >
      {/* M3 clipped shell: top app bar spans the window; nav sits below (no crosshair). */}
      <header className="sandbox-topbar">
        <div className="sandbox-topbar-leading">
          {!narrow ? (
            <Tooltip content={navExpanded ? t("nav.collapseTip") : t("nav.expandTip")}>
              <IconButton
                aria-label={navExpanded ? t("nav.collapse") : t("nav.expand")}
                aria-pressed={navExpanded}
                onClick={() => setPreferNavExpanded((open) => !open)}
              >
                {navExpanded ? (
                  <PanelLeftIcon size={16} aria-hidden />
                ) : (
                  <MenuIcon aria-hidden />
                )}
              </IconButton>
            </Tooltip>
          ) : null}
          <span className="sandbox-topbar-brand">{t("brand.name")}</span>
        </div>
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

      <div className="sandbox-shell-body">
        {navExpanded ? (
          <NavigationDrawer
            variant="standard"
            className="sandbox-nav"
            ariaLabel={t("nav.aria")}
          >
            {destinations}
          </NavigationDrawer>
        ) : (
          <NavigationRail
            className="sandbox-nav-rail"
            aria-label={t("nav.aria")}
            labelVisibility="selected"
          >
            <Tooltip content={t("nav.playgroundHint")} side="right">
              <NavigationRailItem
                icon={<EyeIcon />}
                label={t("nav.playground")}
                active={page === "playground"}
                onClick={() => setPage("playground")}
              />
            </Tooltip>
            <Tooltip content={t("nav.globalsHint")} side="right">
              <NavigationRailItem
                icon={<LayoutGridIcon />}
                label={t("nav.globals")}
                active={page === "globals"}
                onClick={() => setPage("globals")}
              />
            </Tooltip>
            <NavigationRailItem
              icon={<FileIcon />}
              label={t("nav.foundations")}
              active={page === "foundations"}
              onClick={() => setPage("foundations")}
            />
            <NavigationRailItem
              icon={<SparklesIcon />}
              label={t("nav.motion")}
              active={page === "motion"}
              onClick={() => setPage("motion")}
            />
            <Tooltip
              content={t("nav.templatesTip")}
              side="right"
              className="sandbox-nav-templates"
            >
              <NavigationRailItem
                icon={<SettingsIcon />}
                label={t("nav.templates")}
                active={page === "templates"}
                onClick={() => setPage("templates")}
              />
            </Tooltip>
          </NavigationRail>
        )}

        <div className="sandbox-main">
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
            {page === "foundations" || page === "motion" ? (
              <SandboxAside open={showAside}>
                <LayoutChromeInspector />
              </SandboxAside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
