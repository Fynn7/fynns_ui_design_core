import {
  ArrowLeftIcon,
  Card,
  ClippedNavShell,
  EmptyState,
  FileIcon,
  FolderOpenIcon,
  IconButton,
  MenuIcon,
  NavigationDrawer,
  NavigationDrawerItem,
  PanelLeftIcon,
  SearchBar,
  SettingsIcon,
  TopAppBar,
  Tooltip,
} from "@fynns/ui";
import { useMemo, useState, type ReactNode } from "react";
import { useLocale } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import {
  NavDrawerFooterAccount,
  NavDrawerWorkspaceRow,
} from "../components/NavDrawerFooterAccount";

type RootDest = "home" | "catalog" | "prefs";
type DrillLevel = "root" | "catalog";

const CATALOG_IDS = ["alpha", "beta", "gamma"] as const;
type CatalogId = (typeof CATALOG_IDS)[number];

/**
 * Interactive drill-in recipe: root destinations → swap drawer body to a
 * catalog list + TopAppBar leadingExtra back; main stays full-width detail
 * (no list-pane / hub-split). Live at `#layouts-demo-drill-in`.
 */
export function DrillInLayoutsDemo() {
  const { t } = useLocale();
  const [navOpen, setNavOpen] = useState(true);
  const [level, setLevel] = useState<DrillLevel>("root");
  const [rootDest, setRootDest] = useState<RootDest>("home");
  const [catalogId, setCatalogId] = useState<CatalogId | null>(null);
  const [catalogQuery, setCatalogQuery] = useState("");

  const filteredCatalog = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    const labels: Record<CatalogId, string> = {
      alpha: t("layouts.drillCatalogAlpha"),
      beta: t("layouts.drillCatalogBeta"),
      gamma: t("layouts.drillCatalogGamma"),
    };
    if (!q) return [...CATALOG_IDS];
    return CATALOG_IDS.filter((id) => labels[id].toLowerCase().includes(q));
  }, [catalogQuery, t]);

  const catalogLabels: Record<CatalogId, string> = {
    alpha: t("layouts.drillCatalogAlpha"),
    beta: t("layouts.drillCatalogBeta"),
    gamma: t("layouts.drillCatalogGamma"),
  };

  const navFooter = (
    <NavDrawerFooterAccount
      showLabel
      accountLabel={t("nav.footerAccountLabel")}
      accountName={t("nav.footerAccountName")}
      settingsLabel={t("layouts.drillPrefs")}
      settingsTip={t("layouts.drillPrefs")}
    />
  );

  const title =
    level === "catalog"
      ? t("layouts.drillCatalogTitle")
      : rootDest === "prefs"
        ? t("layouts.drillPrefs")
        : rootDest === "catalog"
          ? t("layouts.drillCatalogTitle")
          : t("layouts.drillHome");

  const enterCatalog = () => {
    setLevel("catalog");
    setRootDest("catalog");
    setCatalogId(null);
  };

  const exitCatalog = () => {
    setLevel("root");
    setCatalogQuery("");
    setCatalogId(null);
    setRootDest("home");
  };

  const rootNav = (
    <NavigationDrawer
      variant="standard"
      ariaLabel={t("layouts.drillNavAria")}
      footer={navFooter}
    >
      <NavigationDrawerItem
        icon={<FolderOpenIcon />}
        label={t("layouts.drillHome")}
        active={rootDest === "home"}
        onClick={() => setRootDest("home")}
      />
      <NavigationDrawerItem
        icon={<FileIcon />}
        label={t("layouts.drillCatalogTitle")}
        active={rootDest === "catalog"}
        onClick={enterCatalog}
      />
      <NavigationDrawerItem
        icon={<SettingsIcon />}
        label={t("layouts.drillPrefs")}
        active={rootDest === "prefs"}
        onClick={() => setRootDest("prefs")}
      />
      <NavDrawerWorkspaceRow label={t("nav.footerWorkspace")} />
    </NavigationDrawer>
  );

  const catalogNav = (
    <NavigationDrawer
      variant="standard"
      ariaLabel={t("layouts.drillCatalogNavAria")}
      footer={navFooter}
    >
      <div className="sandbox-navdrawer-tools">
        <SearchBar
          density="destination"
          value={catalogQuery}
          onChange={setCatalogQuery}
          ariaLabel={t("layouts.drillCatalogSearchAria")}
          placeholder={t("layouts.drillCatalogSearchPlaceholder")}
          clearAriaLabel={t("globals.searchBarClear")}
        />
      </div>
      {filteredCatalog.map((id) => (
        <NavigationDrawerItem
          key={id}
          icon={<FileIcon />}
          label={catalogLabels[id]}
          active={catalogId === id}
          onClick={() => setCatalogId(id)}
        />
      ))}
    </NavigationDrawer>
  );

  let main: ReactNode;
  if (level === "catalog") {
    if (catalogId) {
      main = (
        <Card title={catalogLabels[catalogId]}>
          <p className="sandbox-globals-navrail-pane-body">
            {t("layouts.drillCatalogDetailBody", {
              name: catalogLabels[catalogId],
            })}
          </p>
        </Card>
      );
    } else {
      main = (
        <EmptyState
          title={t("layouts.drillCatalogEmptyTitle")}
          description={t("layouts.drillCatalogEmptyBody")}
        />
      );
    }
  } else if (rootDest === "prefs") {
    main = (
      <EmptyState
        title={t("layouts.drillPrefsEmptyTitle")}
        description={t("layouts.drillPrefsEmptyBody")}
      />
    );
  } else {
    main = (
      <EmptyState
        title={t("layouts.drillHomeEmptyTitle")}
        description={t("layouts.drillHomeEmptyBody")}
      />
    );
  }

  return (
    <>
      <div className="sandbox-globals-clipped-shell">
        <ClippedNavShell
          navMode={navOpen ? "drawer" : "hidden"}
          onNavCrowded={() => setNavOpen(false)}
          topBar={
            <TopAppBar
              title={title}
              leading={
                <>
                  <Tooltip
                    content={
                      navOpen ? t("nav.collapseTip") : t("nav.expandTip")
                    }
                  >
                    <IconButton
                      aria-label={navOpen ? t("nav.collapse") : t("nav.expand")}
                      aria-pressed={navOpen}
                      onClick={() => setNavOpen((open) => !open)}
                    >
                      {navOpen ? (
                        <PanelLeftIcon size={16} aria-hidden />
                      ) : (
                        <MenuIcon aria-hidden />
                      )}
                    </IconButton>
                  </Tooltip>
                  {level === "catalog" ? (
                    <Tooltip content={t("layouts.drillBack")}>
                      <IconButton
                        aria-label={t("layouts.drillBack")}
                        onClick={exitCatalog}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </>
              }
            />
          }
          nav={navOpen ? (level === "catalog" ? catalogNav : rootNav) : null}
        >
          <div className="sandbox-globals-shell-canvas sandbox-stack">
            {main}
          </div>
        </ClippedNavShell>
      </div>
      <SandboxHelp text={t("layouts.drillHelp")} />
    </>
  );
}
