import {
  ArchiveIcon,
  ArrowLeftIcon,
  BarChartIcon,
  BottomAppBar,
  Button,
  DestinationAppShell,
  EmptyState,
  Fab,
  FileIcon,
  FolderOpenIcon,
  IconButton,
  LayoutGridIcon,
  MenuIcon,
  NavigationRail,
  NavigationRailHeader,
  NavigationRailItem,
  NavigationRailMenu,
  NavigationBar,
  NavigationBarItem,
  NavigationDrawer,
  NavigationDrawerGroup,
  NavigationDrawerHeadline,
  NavigationDrawerItem,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SearchBar,
  SearchBarResult,
  SettingsIcon,
  SparklesIcon,
  Surface,
  Switch,
  ToggleGroup,
  TopAppBar,
  Toolbar,
  Tooltip,
  TrashIcon,
  UndoIcon,
  UploadIcon,
} from "@fynns/ui";
import { useState, type ReactNode } from "react";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { TokenList } from "../components/TokenList";
import { layoutsDemoElementId } from "../catalog/layoutsCatalog";

type RailId = "home" | "search" | "charts" | "all";

const RAIL_PANE_BODY: Record<RailId, MessageKey> = {
  home: "globals.navRailPaneHome",
  search: "globals.navRailPaneSearch",
  charts: "globals.navRailPaneCharts",
  all: "globals.navRailPaneAll",
};

/** Anchor for hash jumps (`#layouts-demo-${id}`). */
function LayoutsDemo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      id={layoutsDemoElementId(id)}
      data-sandbox-demo={id}
      className="sandbox-globals-demo"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

/**
 * Chrome / app-shell demos — greenfield default is DestinationAppShell.
 * Hash anchors: `#layouts-demo-${id}`.
 */
export function LayoutsPage() {
  const { t } = useLocale();
  const [appBarScrolled, setAppBarScrolled] = useState(false);
  const [railId, setRailId] = useState<RailId>("home");
  const [railLabelVisibility, setRailLabelVisibility] = useState<
    "labeled" | "selected" | "unlabeled"
  >("labeled");
  const [barId, setBarId] = useState<"home" | "search" | "charts" | "all">("home");
  const [barLabelVisibility, setBarLabelVisibility] = useState<
    "labeled" | "selected" | "unlabeled"
  >("labeled");
  const [drawerId, setDrawerId] = useState<
    "inbox" | "sent" | "drafts" | "settings" | "archive" | "assist"
  >("inbox");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shellNavOpen, setShellNavOpen] = useState(true);
  const [shellAsideOpen, setShellAsideOpen] = useState(true);
  const [shellDest, setShellDest] = useState<"home" | "search" | "long">("home");
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [navSearchExpanded, setNavSearchExpanded] = useState(false);

  return (
    <div className="sandbox-globals">
      <div className="sandbox-globals-content">
        <p className="sandbox-globals-lead">{t("layouts.lead")}</p>

        <div className="sandbox-globals-section-body">
          <LayoutsDemo id="shell">
            <div className="sandbox-globals-row sandbox-globals-row--stack">
              <Switch
                labelSide="end"
                label={t("globals.shellNavMode")}
                checked={shellNavOpen}
                onCheckedChange={setShellNavOpen}
              />
              <Switch
                labelSide="end"
                label={t("globals.shellAsideOpen")}
                checked={shellAsideOpen}
                onCheckedChange={setShellAsideOpen}
              />
            </div>
            <div className="sandbox-globals-clipped-shell">
              <DestinationAppShell
                title={t("globals.shellTitle")}
                navAriaLabel={t("globals.shellNavAria")}
                expandNavLabel={t("nav.expand")}
                collapseNavLabel={t("nav.collapse")}
                asideToggleLabel={t("globals.shellToggleAside")}
                navOpen={shellNavOpen}
                onNavOpenChange={setShellNavOpen}
                asideOpen={shellAsideOpen}
                onAsideOpenChange={setShellAsideOpen}
                activeId={shellDest}
                onActiveIdChange={(id) =>
                  setShellDest(id as "home" | "search" | "long")
                }
                leadingExtra={
                  <Tooltip content={t("globals.appBarBack")}>
                    <IconButton aria-label={t("globals.appBarBack")}>
                      <ArrowLeftIcon />
                    </IconButton>
                  </Tooltip>
                }
                trailing={
                  <>
                    <Tooltip content={t("globals.appBarSearch")}>
                      <IconButton aria-label={t("globals.appBarSearch")}>
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.appBarSettings")}>
                      <IconButton aria-label={t("globals.appBarSettings")}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
                destinations={[
                  {
                    id: "home",
                    icon: <FolderOpenIcon />,
                    label: t("globals.navRailHome"),
                  },
                  {
                    id: "search",
                    icon: <SearchIcon />,
                    label: t("globals.navRailSearch"),
                  },
                  {
                    id: "long",
                    icon: <ArchiveIcon />,
                    label: t("globals.shellNavLongLabel"),
                  },
                ]}
                aside={
                  <div className="sandbox-globals-shell-aside sandbox-stack">
                    <p className="sandbox-chat-aside-label">
                      {t("layouts.shellAsideLabel")}
                    </p>
                    <Surface variant="filled" padded>
                      <p className="sandbox-globals-navrail-pane-body">
                        {t("layouts.shellAsideBody")}
                      </p>
                    </Surface>
                  </div>
                }
              >
                <div className="sandbox-globals-shell-canvas sandbox-stack">
                  <EmptyState
                    title={t("layouts.shellMainTitle")}
                    description={t("layouts.shellMainBody")}
                  />
                </div>
              </DestinationAppShell>
            </div>
            <SandboxHelp text={t("globals.shellHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="top-app-bar">
            <div className="sandbox-globals-appbar">
              <TopAppBar
                title={t("globals.appBarTitle")}
                scrolled={appBarScrolled}
                leading={
                  <Tooltip content={t("globals.appBarBack")}>
                    <IconButton aria-label={t("globals.appBarBack")}>
                      <ArrowLeftIcon />
                    </IconButton>
                  </Tooltip>
                }
                trailing={
                  <>
                    <Tooltip content={t("globals.appBarSearch")}>
                      <IconButton aria-label={t("globals.appBarSearch")}>
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.appBarSettings")}>
                      <IconButton aria-label={t("globals.appBarSettings")}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
            </div>
            <Switch
              labelSide="end"
              label={t("globals.appBarScrolled")}
              checked={appBarScrolled}
              onCheckedChange={setAppBarScrolled}
            />
            <div className="sandbox-globals-appbar">
              <TopAppBar
                size="md"
                title={t("globals.appBarMdTitle")}
                scrolled={appBarScrolled}
              />
            </div>
            <div className="sandbox-globals-appbar">
              <TopAppBar
                size="lg"
                title={t("globals.appBarLgTitle")}
                scrolled={appBarScrolled}
              />
            </div>
            <SandboxHelp text={t("globals.appBarHelp")} />
            <SandboxHelp text={t("globals.appBarSizeHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="navigation-drawer">
            <div
              className="sandbox-globals-navdrawer"
              style={{
                display: "flex",
                width: "fit-content",
                maxWidth: "100%",
                height: "22rem",
                border: "1px solid var(--fynns-color-border)",
                borderRadius: "var(--fynns-radius-md)",
                overflow: "hidden",
                background: "var(--fynns-color-app-bg)",
              }}
            >
              <NavigationDrawer
                variant="standard"
                ariaLabel={t("globals.navDrawerAria")}
                headline={t("globals.navDrawerHeadline")}
              >
                <NavigationDrawerItem
                  icon={<FolderOpenIcon />}
                  label={t("globals.navDrawerInbox")}
                  active={drawerId === "inbox"}
                  badge={24}
                  onClick={() => setDrawerId("inbox")}
                />
                <NavigationDrawerItem
                  icon={<UploadIcon />}
                  label={t("globals.navDrawerSent")}
                  active={drawerId === "sent"}
                  onClick={() => setDrawerId("sent")}
                />
                <NavigationDrawerHeadline>
                  {t("globals.navDrawerSection")}
                </NavigationDrawerHeadline>
                <NavigationDrawerItem
                  icon={<FileIcon />}
                  label={t("globals.navDrawerDrafts")}
                  active={drawerId === "drafts"}
                  badge
                  onClick={() => setDrawerId("drafts")}
                />
                <NavigationDrawerGroup
                  label={t("globals.navDrawerGroupRepos")}
                  icon={<FolderOpenIcon />}
                  defaultOpen
                >
                  <NavigationDrawerItem
                    icon={<ArchiveIcon />}
                    label={t("globals.navDrawerGroupArchive")}
                    active={drawerId === "archive"}
                    badge={3}
                    onClick={() => setDrawerId("archive")}
                  />
                  <NavigationDrawerItem
                    icon={<SettingsIcon />}
                    label={t("globals.navDrawerSettings")}
                    active={drawerId === "settings"}
                    onClick={() => setDrawerId("settings")}
                  />
                </NavigationDrawerGroup>
                <NavigationDrawerGroup
                  label={t("globals.navDrawerGroupAssist")}
                  icon={<SparklesIcon />}
                  defaultOpen={false}
                >
                  <NavigationDrawerItem
                    icon={<SparklesIcon />}
                    label={t("globals.navDrawerGroupAssistItem")}
                    active={drawerId === "assist"}
                    onClick={() => setDrawerId("assist")}
                  />
                </NavigationDrawerGroup>
              </NavigationDrawer>
            </div>
            <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
              <Button size="sm" onClick={() => setDrawerOpen(true)}>
                {t("globals.navDrawerOpen")}
              </Button>
            </div>
            <NavigationDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ariaLabel={t("globals.navDrawerModalAria")}
              headline={t("globals.navDrawerHeadline")}
            >
              <NavigationDrawerItem
                icon={<FolderOpenIcon />}
                label={t("globals.navDrawerInbox")}
                active={drawerId === "inbox"}
                badge={24}
                onClick={() => {
                  setDrawerId("inbox");
                  setDrawerOpen(false);
                }}
              />
              <NavigationDrawerItem
                icon={<UploadIcon />}
                label={t("globals.navDrawerSent")}
                active={drawerId === "sent"}
                onClick={() => {
                  setDrawerId("sent");
                  setDrawerOpen(false);
                }}
              />
              <NavigationDrawerItem
                icon={<SettingsIcon />}
                label={t("globals.navDrawerSettings")}
                active={drawerId === "settings"}
                onClick={() => {
                  setDrawerId("settings");
                  setDrawerOpen(false);
                }}
              />
            </NavigationDrawer>
            <SandboxHelp text={t("globals.navDrawerHelp")} />
            <TokenList group="navdrawer" title={t("globals.tokenListNavdrawer")} />
          </LayoutsDemo>

          <LayoutsDemo id="navigation-rail">
            <ToggleGroup
              size="compact"
              showCheck={false}
              ariaLabel={t("globals.navLabelVisibilityAria")}
              value={railLabelVisibility}
              onChange={setRailLabelVisibility}
              options={[
                { value: "labeled", label: t("globals.navLabelLabeled") },
                { value: "selected", label: t("globals.navLabelSelected") },
                { value: "unlabeled", label: t("globals.navLabelUnlabeled") },
              ]}
            />
            <div className="sandbox-globals-navrail">
              <NavigationRail
                aria-label={t("globals.navRailAria")}
                labelVisibility={railLabelVisibility}
              >
                <NavigationRailMenu>
                  <Tooltip content={t("globals.navRailMenu")} side="right">
                    <IconButton aria-label={t("globals.navRailMenu")}>
                      <MenuIcon />
                    </IconButton>
                  </Tooltip>
                </NavigationRailMenu>
                <NavigationRailHeader>
                  <Tooltip content={t("globals.fabTip")} side="right">
                    <Fab size="sm" aria-label={t("globals.fabTip")}>
                      <PlusIcon />
                    </Fab>
                  </Tooltip>
                </NavigationRailHeader>
                <NavigationRailItem
                  icon={<FolderOpenIcon />}
                  label={t("globals.navRailHome")}
                  active={railId === "home"}
                  onClick={() => setRailId("home")}
                />
                <NavigationRailItem
                  icon={<SearchIcon />}
                  label={t("globals.navRailSearch")}
                  active={railId === "search"}
                  badge={3}
                  onClick={() => setRailId("search")}
                />
                <NavigationRailItem
                  icon={<BarChartIcon />}
                  label={t("globals.navRailCharts")}
                  active={railId === "charts"}
                  badge
                  onClick={() => setRailId("charts")}
                />
                <NavigationRailItem
                  icon={<LayoutGridIcon />}
                  label={t("globals.navRailAll")}
                  active={railId === "all"}
                  onClick={() => setRailId("all")}
                />
              </NavigationRail>
              <div className="sandbox-globals-navrail-pane">
                <p className="sandbox-globals-navrail-pane-body">
                  {t(RAIL_PANE_BODY[railId])}
                </p>
              </div>
            </div>
            <SandboxHelp text={t("globals.navRailHelp")} />
            <SandboxHelp text={t("globals.navRailLabelHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="navigation-bar">
            <ToggleGroup
              size="compact"
              showCheck={false}
              ariaLabel={t("globals.navLabelVisibilityAria")}
              value={barLabelVisibility}
              onChange={setBarLabelVisibility}
              options={[
                { value: "labeled", label: t("globals.navLabelLabeled") },
                { value: "selected", label: t("globals.navLabelSelected") },
                { value: "unlabeled", label: t("globals.navLabelUnlabeled") },
              ]}
            />
            <div className="sandbox-globals-navbar">
              <NavigationBar
                aria-label={t("globals.navBarAria")}
                labelVisibility={barLabelVisibility}
              >
                <NavigationBarItem
                  icon={<FolderOpenIcon />}
                  label={t("globals.navRailHome")}
                  active={barId === "home"}
                  onClick={() => setBarId("home")}
                />
                <NavigationBarItem
                  icon={<SearchIcon />}
                  label={t("globals.navRailSearch")}
                  active={barId === "search"}
                  badge={3}
                  onClick={() => setBarId("search")}
                />
                <NavigationBarItem
                  icon={<BarChartIcon />}
                  label={t("globals.navRailCharts")}
                  active={barId === "charts"}
                  badge
                  onClick={() => setBarId("charts")}
                />
                <NavigationBarItem
                  icon={<LayoutGridIcon />}
                  label={t("globals.navRailAll")}
                  active={barId === "all"}
                  onClick={() => setBarId("all")}
                />
              </NavigationBar>
            </div>
            <SandboxHelp text={t("globals.navBarHelp")} />
            <SandboxHelp text={t("globals.navBarLabelHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="bottom-app-bar">
            <div className="sandbox-globals-bottom-app-bar">
              <BottomAppBar
                aria-label={t("globals.bottomAppBarAria")}
                actions={
                  <>
                    <Tooltip content={t("globals.bottomAppBarSearch")}>
                      <IconButton aria-label={t("globals.bottomAppBarSearch")}>
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.bottomAppBarArchive")}>
                      <IconButton aria-label={t("globals.bottomAppBarArchive")}>
                        <ArchiveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.bottomAppBarDelete")}>
                      <IconButton aria-label={t("globals.bottomAppBarDelete")}>
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
                floatingActionButton={
                  <Tooltip content={t("globals.fabTip")}>
                    <IconButton variant="primary" aria-label={t("globals.fabTip")}>
                      <PlusIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
            </div>
            <SandboxHelp text={t("globals.bottomAppBarHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="toolbar">
            <div className="sandbox-globals-toolbar">
              <Toolbar
                variant="docked"
                aria-label={t("globals.toolbarDockedAria")}
                floatingActionButton={
                  <Tooltip content={t("globals.fabTip")}>
                    <Fab size="sm" aria-label={t("globals.fabTip")}>
                      <PlusIcon />
                    </Fab>
                  </Tooltip>
                }
              >
                <Tooltip content={t("globals.toolbarUndo")}>
                  <IconButton aria-label={t("globals.toolbarUndo")}>
                    <UndoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.toolbarEdit")}>
                  <IconButton aria-label={t("globals.toolbarEdit")}>
                    <PencilIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.toolbarSave")}>
                  <IconButton aria-label={t("globals.toolbarSave")}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.bottomAppBarDelete")}>
                  <IconButton aria-label={t("globals.bottomAppBarDelete")}>
                    <TrashIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--fynns-space-md)",
                  alignItems: "flex-end",
                }}
              >
                <Toolbar
                  variant="floating"
                  aria-label={t("globals.toolbarFloatingAria")}
                  floatingActionButton={
                    <Tooltip content={t("globals.fabTip")}>
                      <Fab size="sm" aria-label={t("globals.fabTip")}>
                        <PlusIcon />
                      </Fab>
                    </Tooltip>
                  }
                >
                  <Tooltip content={t("globals.toolbarUndo")}>
                    <IconButton aria-label={t("globals.toolbarUndo")}>
                      <UndoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.toolbarEdit")}>
                    <IconButton aria-label={t("globals.toolbarEdit")}>
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.toolbarSave")}>
                    <IconButton aria-label={t("globals.toolbarSave")}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                </Toolbar>
                <Toolbar
                  variant="floating"
                  color="vibrant"
                  orientation="vertical"
                  aria-label={t("globals.toolbarVibrantAria")}
                >
                  <Tooltip content={t("globals.toolbarUndo")} side="right">
                    <IconButton aria-label={t("globals.toolbarUndo")}>
                      <UndoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.toolbarEdit")} side="right">
                    <IconButton aria-label={t("globals.toolbarEdit")}>
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.toolbarSave")} side="right">
                    <IconButton aria-label={t("globals.toolbarSave")}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                </Toolbar>
              </div>
            </div>
            <SandboxHelp text={t("globals.toolbarHelp")} />
          </LayoutsDemo>

          <LayoutsDemo id="search-bar">
            <div className="sandbox-globals-search-bar">
              <SearchBar
                value={navSearchQuery}
                onChange={setNavSearchQuery}
                ariaLabel={t("globals.searchBarAria")}
                placeholder={t("globals.searchBarPlaceholder")}
                clearAriaLabel={t("globals.searchBarClear")}
                expanded={navSearchExpanded}
                onExpandedChange={setNavSearchExpanded}
                onSearch={() => setNavSearchExpanded(false)}
              >
                {(
                  [
                    t("globals.searchBarResultLibs"),
                    t("globals.searchBarResultDocs"),
                    t("globals.searchBarResultSettings"),
                  ] as const
                )
                  .filter((label) =>
                    navSearchQuery.trim()
                      ? label
                          .toLowerCase()
                          .includes(navSearchQuery.trim().toLowerCase())
                      : true,
                  )
                  .map((label) => (
                    <SearchBarResult
                      key={label}
                      onClick={() => {
                        setNavSearchQuery(label);
                        setNavSearchExpanded(false);
                      }}
                    >
                      {label}
                    </SearchBarResult>
                  ))}
              </SearchBar>
            </div>
            <SandboxHelp text={t("globals.searchBarHelp")} />
          </LayoutsDemo>
        
        </div>
      </div>
    </div>
  );
}
