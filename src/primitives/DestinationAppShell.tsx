import {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ClippedNavShell,
  wouldClippedNavDrawerCrowd,
  type ClippedNavShellProps,
} from "./ClippedNavShell";
import { EndAside } from "./EndAside";
import { IconButton } from "./IconButton";
import { MenuIcon, PanelLeftIcon, PanelRightIcon } from "./icons";
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from "./NavigationDrawer";
import {
  NavigationRail,
  NavigationRailItem,
} from "./NavigationRail";
import { TopAppBar } from "./TopAppBar";

export type DestinationAppShellDestination = {
  id: string;
  icon: ReactNode;
  label: string;
  badge?: number | string | true | ReactNode;
};

export type DestinationAppShellProps = {
  /** TopAppBar title (brand / page). */
  title?: ReactNode;
  /**
   * Left destination list — fixed structure; vary icon, label, count, badge.
   * Wide → `NavigationDrawer`; narrow / crowded → `NavigationRail`.
   */
  destinations: readonly DestinationAppShellDestination[];
  activeId: string;
  onActiveIdChange: (id: string) => void;
  /** Main canvas (any content — not assumed to be Chat). */
  children: ReactNode;
  /** Extra leading controls after the built-in nav open/close IconButton. */
  leadingExtra?: ReactNode;
  /** Trailing TopAppBar actions (theme, search, …). Aside toggle is separate. */
  trailing?: ReactNode;
  /**
   * Optional end-edge inspector / supporting pane. Content is arbitrary —
   * do not assume Chat.
   */
  aside?: ReactNode;
  asideOpen?: boolean;
  defaultAsideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  /**
   * Accessible name for the aside toggle IconButton. Required when `aside` is
   * set (auto-wired PanelRight control).
   */
  asideToggleLabel?: string;
  navOpen?: boolean;
  defaultNavOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  /** Accessible name for the destination nav. */
  navAriaLabel: string;
  /** IconButton label when destinations are closed. */
  expandNavLabel: string;
  /** IconButton label when destinations are open. */
  collapseNavLabel: string;
  /** Optional drawer headline (standard / labeled mode only). */
  drawerHeadline?: ReactNode;
  /**
   * Rail densify label mode. Default `labeled` (always show destination
   * captions) — agent / greenfield default. Prefer over `selected`.
   */
  railLabelVisibility?: "labeled" | "selected" | "unlabeled";
  /**
   * Viewport max-width (px) at or below which open destinations densify to
   * `NavigationRail`. Default `900`.
   */
  narrowBreakpoint?: number;
  className?: string;
  drawerWidth?: number;
  defaultDrawerWidth?: number;
  onDrawerWidthChange?: (widthPx: number) => void;
  disableDrawerResize?: boolean;
};

const DEFAULT_NARROW_BREAKPOINT = 900;

/**
 * Declarative destination-app chrome — **default greenfield template**.
 *
 * Wraps `ClippedNavShell` + `TopAppBar` + Drawer|Rail + optional `EndAside`
 * so consumers (and agents) pass destinations / title / trailing / children
 * without hand-syncing `navMode`. Prefer this over composing the slots alone
 * unless the app needs a fully custom shell.
 *
 * @see AGENTS.md App shells / Layout templates
 */
export const DestinationAppShell = forwardRef<
  HTMLDivElement,
  DestinationAppShellProps
>(function DestinationAppShell(
  {
    title,
    destinations,
    activeId,
    onActiveIdChange,
    children,
    leadingExtra,
    trailing,
    aside,
    asideOpen: asideOpenProp,
    defaultAsideOpen = false,
    onAsideOpenChange,
    asideToggleLabel,
    navOpen: navOpenProp,
    defaultNavOpen = true,
    onNavOpenChange,
    navAriaLabel,
    expandNavLabel,
    collapseNavLabel,
    drawerHeadline,
    railLabelVisibility = "labeled",
    narrowBreakpoint = DEFAULT_NARROW_BREAKPOINT,
    className,
    drawerWidth,
    defaultDrawerWidth,
    onDrawerWidthChange,
    disableDrawerResize,
  },
  ref,
) {
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const setShellRef = useCallback(
    (node: HTMLDivElement | null) => {
      setShellEl(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const [navOpenUncontrolled, setNavOpenUncontrolled] = useState(defaultNavOpen);
  const navOpen = navOpenProp ?? navOpenUncontrolled;
  const setNavOpen = useCallback(
    (open: boolean) => {
      if (navOpenProp === undefined) setNavOpenUncontrolled(open);
      onNavOpenChange?.(open);
    },
    [navOpenProp, onNavOpenChange],
  );

  const [asideOpenUncontrolled, setAsideOpenUncontrolled] =
    useState(defaultAsideOpen);
  const asideOpen = asideOpenProp ?? asideOpenUncontrolled;
  const setAsideOpen = useCallback(
    (open: boolean) => {
      if (asideOpenProp === undefined) setAsideOpenUncontrolled(open);
      onAsideOpenChange?.(open);
    },
    [asideOpenProp, onAsideOpenChange],
  );

  const [narrow, setNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${narrowBreakpoint}px)`).matches;
  });
  const [navCompact, setNavCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${narrowBreakpoint}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [narrowBreakpoint]);

  useEffect(() => {
    if (!navOpen) setNavCompact(false);
  }, [navOpen]);

  if (aside != null && !asideToggleLabel) {
    throw new Error(
      "DestinationAppShell: `asideToggleLabel` is required when `aside` is set.",
    );
  }

  const navMode: ClippedNavShellProps["navMode"] = !navOpen
    ? "hidden"
    : narrow || navCompact
      ? "rail"
      : "drawer";

  const openNav = useCallback(() => {
    const crowd =
      narrow ||
      (shellEl ? wouldClippedNavDrawerCrowd(shellEl) : false);
    setNavCompact(crowd);
    setNavOpen(true);
  }, [narrow, setNavOpen, shellEl]);

  const toggleNav = useCallback(() => {
    if (navOpen) setNavOpen(false);
    else openNav();
  }, [navOpen, openNav, setNavOpen]);

  const drawerItems = destinations.map((d) => (
    <NavigationDrawerItem
      key={d.id}
      icon={d.icon}
      label={d.label}
      badge={d.badge}
      active={activeId === d.id}
      onClick={() => onActiveIdChange(d.id)}
    />
  ));

  const railItems = destinations.map((d) => (
    <NavigationRailItem
      key={d.id}
      icon={d.icon}
      label={d.label}
      badge={d.badge}
      active={activeId === d.id}
      onClick={() => onActiveIdChange(d.id)}
    />
  ));

  const nav =
    !navOpen ? null : navMode === "rail" ? (
      <NavigationRail
        aria-label={navAriaLabel}
        labelVisibility={railLabelVisibility}
      >
        {railItems}
      </NavigationRail>
    ) : (
      <NavigationDrawer
        variant="standard"
        ariaLabel={navAriaLabel}
        headline={drawerHeadline}
      >
        {drawerItems}
      </NavigationDrawer>
    );

  const asideToggle =
    aside != null && asideToggleLabel ? (
      <IconButton
        aria-label={asideToggleLabel}
        aria-pressed={asideOpen}
        onClick={() => setAsideOpen(!asideOpen)}
      >
        <PanelRightIcon size={16} aria-hidden />
      </IconButton>
    ) : null;

  const rootClass = ["fynns-destination-app-shell", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <ClippedNavShell
      ref={setShellRef}
      className={rootClass}
      navMode={navMode}
      onNavCrowded={() => setNavCompact(true)}
      drawerWidth={drawerWidth}
      defaultDrawerWidth={defaultDrawerWidth}
      onDrawerWidthChange={onDrawerWidthChange}
      disableDrawerResize={disableDrawerResize}
      topBar={
        <TopAppBar
          title={title}
          leading={
            <>
              <IconButton
                aria-label={navOpen ? collapseNavLabel : expandNavLabel}
                aria-pressed={navOpen}
                onClick={toggleNav}
              >
                {navOpen ? (
                  <PanelLeftIcon size={16} aria-hidden />
                ) : (
                  <MenuIcon aria-hidden />
                )}
              </IconButton>
              {leadingExtra}
            </>
          }
          trailing={
            asideToggle != null || trailing != null ? (
              <>
                {trailing}
                {asideToggle}
              </>
            ) : undefined
          }
        />
      }
      nav={nav}
    >
      <div className="fynns-destination-app-shell-body">
        <div className="fynns-destination-app-shell-canvas">{children}</div>
        {aside != null ? <EndAside open={asideOpen}>{aside}</EndAside> : null}
      </div>
    </ClippedNavShell>
  );
});
