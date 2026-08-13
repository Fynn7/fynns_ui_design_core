import {
  applyFynnsThemeMode,
  ClippedNavShell,
  wouldClippedNavDrawerCrowd,
  EndAside,
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
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  SnackbarHost,
  SunIcon,
  ToggleGroup,
  Tooltip,
  TopAppBar,
  type FynnsThemeMode,
} from "@fynns/ui";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale } from "../i18n";
import { usePlaygroundTarget } from "../state/PlaygroundTargetProvider";
import { useTokenDraftHistoryActions } from "../state/TokenDraftProvider";
import {
  clearFreshBootFocusArm,
  ensureFreshBootFocusArmed,
  freshSandboxUiSession,
  isFreshBootFocusArmed,
  loadSandboxUiSession,
  patchSandboxUiSession,
  type SandboxPage,
} from "../state/sandboxUiSession";
import { AgentInputBar } from "../pages/AgentInputBar";
import { CardPreviewCanvas } from "../pages/CardPreviewCanvas";
import { CollapsiblePreviewCanvas } from "../pages/CollapsiblePreviewCanvas";
import { PropertyInspector } from "../pages/PropertyInspector";
import { FoundationsPage } from "../pages/FoundationsPage";
import { GlobalsInspector } from "../pages/GlobalsInspector";
import { GlobalsPage } from "../pages/GlobalsPage";
import { LayoutsPage } from "../pages/LayoutsPage";
import { LayoutChromeInspector } from "../pages/LayoutChromeInspector";
import { MotionPage } from "../pages/MotionPage";
import { TemplatesPage } from "../pages/TemplatesPage";

export type { SandboxPage };

/** Fresh / no-session default: EndAside closed (user opens via top bar). */
function defaultAsideOpen(): boolean {
  return false;
}

export function SandboxShell() {
  const { t } = useLocale();
  // Arm before reading session snapshot so StrictMode remount still sees focus.
  ensureFreshBootFocusArmed();
  const initialSessionRef = useRef(loadSandboxUiSession());
  const [page, setPage] = useState<SandboxPage>(
    () => initialSessionRef.current?.page ?? freshSandboxUiSession().page,
  );
  const [globalsSearchFocusTick, setGlobalsSearchFocusTick] = useState(() =>
    isFreshBootFocusArmed() ? 1 : 0,
  );
  const [theme, setTheme] = useState<FynnsThemeMode>("dark");
  const [asideOpen, setAsideOpen] = useState(
    () => initialSessionRef.current?.asideOpen ?? defaultAsideOpen(),
  );
  /** User preference: destinations fully open vs fully closed. */
  const [preferNavOpen, setPreferNavOpen] = useState(
    () => initialSessionRef.current?.preferNavOpen ?? true,
  );
  /** Automatic icon rail when open drawer + EndAside mins still overflow. */
  const [navCompact, setNavCompact] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  /** Ignore scroll events fired while restoring scrollTop after navigation / refresh. */
  const canvasScrollRestoreLockRef = useRef(false);
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const { undo, redo } = useTokenDraftHistoryActions();
  const { target, setTarget } = usePlaygroundTarget();

  /** Prefer user choice on all widths — do not force destinations open on phone. */
  const navOpen = preferNavOpen;
  /**
   * Narrow / crowded → icon rail (side column). Full drawer only when there is
   * room; stacking a labeled drawer above the canvas starves the main stage.
   */
  const navMode = !navOpen
    ? "hidden"
    : narrow || navCompact
      ? "rail"
      : "drawer";

  useEffect(() => {
    setTheme(restoreFynnsThemeMode());
  }, []);

  /** New Vite process: Components + catalog search focus (dev convenience). */
  useEffect(() => {
    if (!isFreshBootFocusArmed()) return;
    setPage("globals");
    setGlobalsSearchFocusTick((n) => Math.max(n, 1));
    const clearId = window.setTimeout(() => clearFreshBootFocusArm(), 0);
    return () => window.clearTimeout(clearId);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    patchSandboxUiSession({
      page,
      asideOpen,
      preferNavOpen,
    });
  }, [page, asideOpen, preferNavOpen]);

  /** Persist / restore main canvas scroll for the current Vite session. */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (canvasScrollRestoreLockRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (canvasScrollRestoreLockRef.current) return;
        patchSandboxUiSession({
          canvasScrollByPage: { [pageRef.current]: el.scrollTop },
        });
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const top = loadSandboxUiSession()?.canvasScrollByPage?.[page] ?? 0;
    canvasScrollRestoreLockRef.current = true;
    const apply = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTop = Math.min(top, max);
    };
    apply();
    let attempts = 0;
    let raf = 0;
    const settle = () => {
      apply();
      attempts += 1;
      // Tall Globals content / open Collapsibles may grow after first paint.
      if (top > 0 && el.scrollTop < top - 1 && attempts < 24) {
        raf = requestAnimationFrame(settle);
        return;
      }
      canvasScrollRestoreLockRef.current = false;
    };
    raf = requestAnimationFrame(settle);
    const timeoutId = window.setTimeout(() => {
      canvasScrollRestoreLockRef.current = true;
      apply();
      requestAnimationFrame(() => {
        canvasScrollRestoreLockRef.current = false;
      });
    }, 280);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeoutId);
      canvasScrollRestoreLockRef.current = false;
    };
  }, [page]);

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
    page === "layouts" ||
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
      <Tooltip content={t("nav.layoutsHint")} side="right">
        <NavigationDrawerItem
          icon={<PanelLeftIcon />}
          label={t("nav.layouts")}
          active={page === "layouts"}
          onClick={() => setPage("layouts")}
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

  const nav =
    !navOpen ? null : navMode === "rail" ? (
    <NavigationRail
      className="sandbox-nav-rail"
      aria-label={t("nav.aria")}
      labelVisibility="labeled"
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
      <Tooltip content={t("nav.layoutsHint")} side="right">
        <NavigationRailItem
          icon={<PanelLeftIcon />}
          label={t("nav.layouts")}
          active={page === "layouts"}
          onClick={() => setPage("layouts")}
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
  ) : (
    <NavigationDrawer
      variant="standard"
      className="sandbox-nav"
      ariaLabel={t("nav.aria")}
    >
      {destinations}
    </NavigationDrawer>
  );

  return (
    <>
      <ClippedNavShell
        ref={shellRef}
        className="sandbox-root"
        navMode={navMode}
        onNavCrowded={() => {
          setNavCompact(true);
        }}
        topBar={
          <TopAppBar
            className="sandbox-topbar"
            leading={
              <Tooltip content={navOpen ? t("nav.collapseTip") : t("nav.expandTip")}>
                <IconButton
                  aria-label={navOpen ? t("nav.collapse") : t("nav.expand")}
                  aria-pressed={navOpen}
                  onClick={() => {
                    if (preferNavOpen) {
                      setPreferNavOpen(false);
                    } else {
                      const crowd =
                        narrow ||
                        (shellRef.current
                          ? wouldClippedNavDrawerCrowd(shellRef.current)
                          : false);
                      setNavCompact(crowd);
                      setPreferNavOpen(true);
                    }
                  }}
                >
                  {navOpen ? (
                    <PanelLeftIcon size={16} aria-hidden />
                  ) : (
                    <MenuIcon aria-hidden />
                  )}
                </IconButton>
              </Tooltip>
            }
            title={t("brand.name")}
            trailing={
              <div className="sandbox-topbar-actions">
                {page === "playground" ? <AgentInputBar /> : null}
                <Tooltip content={t("topbar.componentSearch")}>
                  <IconButton
                    aria-label={t("topbar.componentSearch")}
                    onClick={() => {
                      setPage("globals");
                      setGlobalsSearchFocusTick((n) => n + 1);
                    }}
                  >
                    <SearchIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
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
            }
          />
        }
        nav={nav}
      >
        <div className="sandbox-body">
          <main ref={canvasRef} className="sandbox-canvas fynns-scroll">
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
            {page === "globals" ? (
              <GlobalsPage searchFocusTick={globalsSearchFocusTick} />
            ) : null}
            {page === "layouts" ? <LayoutsPage /> : null}
            {page === "foundations" ? <FoundationsPage /> : null}
            {page === "motion" ? <MotionPage /> : null}
            {page === "templates" ? (
              <TemplatesPage theme={theme} onThemeChange={setTheme} />
            ) : null}
          </main>
          {page === "playground" ? (
            <EndAside open={showAside}>
              <PropertyInspector />
            </EndAside>
          ) : null}
          {page === "globals" ? (
            <EndAside open={showAside}>
              <GlobalsInspector />
            </EndAside>
          ) : null}
          {page === "foundations" || page === "motion" || page === "layouts" ? (
            <EndAside open={showAside}>
              <LayoutChromeInspector />
            </EndAside>
          ) : null}
        </div>
      </ClippedNavShell>
      <SnackbarHost />
    </>
  );
}
