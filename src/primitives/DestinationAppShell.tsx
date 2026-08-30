import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { ClippedNavShell } from "./ClippedNavShell";
import { EndAsideMorphTrack, EndAsidePane, endAsideMorphMemoryReset } from "./EndAside";
import { IconButton } from "./IconButton";
import { MenuIcon, PanelLeftIcon, PanelRightIcon } from "./icons";
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from "./NavigationDrawer";
import { TopAppBar } from "./TopAppBar";
import { Tooltip } from "./Tooltip";

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
   * Open → labeled `NavigationDrawer` (resizable); closed → hidden.
   * No icon-only rail densify.
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
   * Optional `NavigationDrawer` footer (Cursor-style single account row +
   * settings). Prefer settings here, not TopAppBar `trailing`. Live: sandbox
   * Layouts `#layouts-demo-shell` + SandboxShell.
   */
  navFooter?: ReactNode;
  className?: string;
  drawerWidth?: number;
  defaultDrawerWidth?: number;
  onDrawerWidthChange?: (widthPx: number) => void;
  disableDrawerResize?: boolean;
  /** Controlled `EndAside` width (px). */
  asideWidth?: number;
  defaultAsideWidth?: number;
  onAsideWidthChange?: (widthPx: number) => void;
  disableAsideResize?: boolean;
};

/**
 * Declarative destination-app chrome — **default greenfield template**.
 *
 * Wraps `ClippedNavShell` + `TopAppBar` + labeled `NavigationDrawer` + optional
 * `EndAside`. Destinations are **binary**: open drawer (resizable) or fully
 * closed — no icon-only `NavigationRail` densify. Prefer this over composing
 * the slots alone unless the app needs a fully custom shell.
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
    navFooter,
    className,
    drawerWidth,
    defaultDrawerWidth,
    onDrawerWidthChange,
    disableDrawerResize,
    asideWidth,
    defaultAsideWidth,
    onAsideWidthChange,
    disableAsideResize,
  },
  ref,
) {
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

  if (aside != null && !asideToggleLabel) {
    throw new Error(
      "DestinationAppShell: `asideToggleLabel` is required when `aside` is set.",
    );
  }

  useLayoutEffect(() => {
    if (aside == null) {
      endAsideMorphMemoryReset();
    }
  }, [aside]);

  const navMode = navOpen ? "drawer" : "hidden";

  const toggleNav = useCallback(() => {
    setNavOpen(!navOpen);
  }, [navOpen, setNavOpen]);

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

  const nav = !navOpen ? null : (
    <NavigationDrawer
      variant="standard"
      ariaLabel={navAriaLabel}
      headline={drawerHeadline}
      footer={navFooter}
    >
      {drawerItems}
    </NavigationDrawer>
  );

  const asideToggle =
    aside != null && asideToggleLabel ? (
      <Tooltip content={asideToggleLabel}>
        <IconButton
          aria-label={asideToggleLabel}
          aria-pressed={asideOpen}
          onClick={() => setAsideOpen(!asideOpen)}
        >
          <PanelRightIcon size={16} aria-hidden />
        </IconButton>
      </Tooltip>
    ) : null;

  const rootClass = ["fynns-destination-app-shell", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <ClippedNavShell
      ref={ref}
      className={rootClass}
      navMode={navMode}
      onNavCrowded={() => setNavOpen(false)}
      drawerWidth={drawerWidth}
      defaultDrawerWidth={defaultDrawerWidth}
      onDrawerWidthChange={onDrawerWidthChange}
      disableDrawerResize={disableDrawerResize}
      topBar={
        <TopAppBar
          title={title}
          leading={
            <>
              <Tooltip content={navOpen ? collapseNavLabel : expandNavLabel}>
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
              </Tooltip>
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
        <div className="fynns-destination-app-shell-canvas fynns-scroll">{children}</div>
        {aside != null ? (
          <EndAsideMorphTrack
            open={asideOpen}
            width={asideWidth}
            defaultWidth={defaultAsideWidth}
            onWidthChange={onAsideWidthChange}
          >
            <EndAsidePane open={asideOpen} disableResize={disableAsideResize}>
              {aside}
            </EndAsidePane>
          </EndAsideMorphTrack>
        ) : null}
      </div>
    </ClippedNavShell>
  );
});
