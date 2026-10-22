import {
  Button,
  Divider,
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
  NavigationDrawer,
  NavigationDrawerHeadline,
  NavigationDrawerItem,
  PencilIcon,
  SaveIcon,
  SplitButton,
  Toolbar,
  Tooltip,
  UndoIcon,
} from "@fynns/ui";
import { useLocale } from "../i18n";

/** Shared action rhythm, including controls with trigger wrappers. */
export function ActionSpacingDemo() {
  const { t } = useLocale();
  const actions = (
    <>
      <Button size="sm">
        <PencilIcon aria-hidden />{t("globals.toolbarEdit")}
      </Button>
      <DropdownMenu
        trigger={t("globals.menuTrigger")}
        ariaLabel={t("globals.menuAria")}
        size="sm"
      >
        <DropdownMenuItem>{t("globals.menuOpen")}</DropdownMenuItem>
      </DropdownMenu>
      <Button size="sm">
        <SaveIcon aria-hidden />{t("globals.toolbarSave")}
      </Button>
      <Tooltip content={t("globals.toolbarUndo")}>
        <IconButton aria-label={t("globals.toolbarUndo")}><UndoIcon /></IconButton>
      </Tooltip>
    </>
  );
  return (
    <div id="sandbox-action-spacing" className="fynns-unit-stack">
      <div className="fynns-docked-tools-inset">
        <Toolbar variant="docked" aria-label={t("globals.toolbarDockedAria")}>
          {actions}
        </Toolbar>
      </div>
      <Toolbar variant="floating" aria-label={t("globals.toolbarFloatingAria")}>
        {actions}
      </Toolbar>
      <Toolbar orientation="vertical" aria-label={t("globals.toolbarVibrantAria")}>
        {actions}
      </Toolbar>
      <div className="fynns-control-cluster">{actions}</div>
      <div className="fynns-control-cluster fynns-control-cluster--end-align">
        {actions}
      </div>
      <div className="fynns-control-cluster">
        <SplitButton
          label={t("globals.toolbarSave")}
          leadingIcon={<SaveIcon />}
          onMainClick={() => {}}
          menuAriaLabel={t("globals.menuAria")}
        >
          <DropdownMenuItem>{t("globals.menuOpen")}</DropdownMenuItem>
        </SplitButton>
        <Button size="sm">
          <PencilIcon aria-hidden />{t("globals.toolbarEdit")}
        </Button>
      </div>
    </div>
  );
}

/** Sheet titles and body sections own distinct title boundary spacing. */
export function DrawerTitleSpacingDemo() {
  const { t } = useLocale();
  const frameStyle = {
    height: "calc(var(--fynns-navdrawer-item-height) * 5 + var(--fynns-layout-unit-stack-gap) * 2)",
    width: "var(--fynns-navdrawer-width)",
    maxWidth: "100%",
  };
  return (
    <div id="sandbox-navdrawer-title-spacing" className="fynns-unit-stack">
      <div style={frameStyle}>
        <NavigationDrawer variant="standard" headline={t("globals.navDrawerHeadline")}>
          <NavigationDrawerItem label={t("globals.navDrawerInbox")} />
        </NavigationDrawer>
      </div>
      <div style={frameStyle}>
        <NavigationDrawer variant="standard">
          <NavigationDrawerHeadline>{t("globals.navDrawerSection")}</NavigationDrawerHeadline>
          <NavigationDrawerItem label={t("globals.navDrawerInbox")} />
          <Divider />
          <NavigationDrawerHeadline>{t("globals.navDrawerSection")}</NavigationDrawerHeadline>
          <NavigationDrawerItem label={t("globals.navDrawerSent")} />
        </NavigationDrawer>
      </div>
    </div>
  );
}
