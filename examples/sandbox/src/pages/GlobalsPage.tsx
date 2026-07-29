import {
  ArrowLeftIcon,
  Avatar,
  Badge,
  BarChartIcon,
  BottomSheet,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  ChipSet,
  CircularProgress,
  Collapsible,
  Divider,
  Fab,
  FolderOpenIcon,
  IconButton,
  Input,
  LayoutGridIcon,
  LinearProgress,
  MenuIcon,
  NavigationRail,
  NavigationRailHeader,
  NavigationRailItem,
  NavigationRailMenu,
  PlusIcon,
  Radio,
  SearchIcon,
  Select,
  SettingsIcon,
  Switch,
  ToggleGroup,
  TopAppBar,
  Tooltip,
  ControlRow,
  ControlStack,
  Grid,
} from "@fynns/ui";
import { useState } from "react";
import { useLocale, type MessageKey } from "../i18n";

const SWATCH_KEYS = [
  { key: "xs", usesKey: "globals.swatchXsUses" },
  { key: "sm", usesKey: "globals.swatchSmUses" },
  { key: "md", usesKey: "globals.swatchMdUses" },
  { key: "lg", usesKey: "globals.swatchLgUses" },
  { key: "xl", usesKey: "globals.swatchXlUses" },
] as const satisfies ReadonlyArray<{ key: string; usesKey: MessageKey }>;

type RailId = "home" | "search" | "charts" | "all";

const RAIL_PANE_BODY: Record<RailId, MessageKey> = {
  home: "globals.navRailPaneHome",
  search: "globals.navRailPaneSearch",
  charts: "globals.navRailPaneCharts",
  all: "globals.navRailPaneAll",
};

/**
 * Live stage proving `--fynns-radius-*` is system-wide: multiple primitives
 * share the same token ladder (not Card-only).
 */
export function GlobalsPage() {
  const { t } = useLocale();
  const [switchOn, setSwitchOn] = useState(true);
  const [checkOn, setCheckOn] = useState(true);
  const [checkMixed, setCheckMixed] = useState(true);
  const [radioValue, setRadioValue] = useState<"a" | "b">("a");
  const [filterOn, setFilterOn] = useState(true);
  const [inputChips, setInputChips] = useState(["Alpha", "Beta"]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [appBarScrolled, setAppBarScrolled] = useState(false);
  const [railId, setRailId] = useState<RailId>("home");
  const [rhythmClickable, setRhythmClickable] = useState(true);
  const [rhythmDisabled, setRhythmDisabled] = useState(false);
  const [rhythmAlign, setRhythmAlign] = useState<"start" | "end">("end");
  const [rhythmMedia, setRhythmMedia] = useState(false);

  return (
    <div className="sandbox-globals">
      <p className="sandbox-globals-lead">{t("globals.lead")}</p>

      <section className="sandbox-globals-section" aria-label={t("globals.controlsAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.controls")}</h3>
        <div className="sandbox-globals-row">
          <Button size="sm">{t("globals.btnSmall")}</Button>
          <Button>{t("globals.btnDefault")}</Button>
          <Button variant="default">{t("globals.btnOutlined")}</Button>
          <Button variant="primary">{t("globals.btnPrimary")}</Button>
          <Button variant="ghost">{t("globals.btnGhost")}</Button>
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Input placeholder={t("globals.inputPlaceholder")} aria-label={t("globals.inputAria")} />
          <Select
            ariaLabel={t("globals.selectAria")}
            value="one"
            options={["one", "two", "three"]}
            onChange={() => {}}
          />
        </div>
        <div className="sandbox-globals-row">
          <Badge>{t("globals.badgeNeutral")}</Badge>
          <Badge variant="accent">{t("globals.badgeAccent")}</Badge>
          <Badge variant="success">{t("globals.badgeSuccess")}</Badge>
          <Switch
            size="sm"
            labelSide="end"
            label={t("globals.switchPill")}
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Checkbox
            label={t("globals.checkbox")}
            checked={checkOn}
            onCheckedChange={(next) => {
              setCheckOn(next);
              setCheckMixed(false);
            }}
          />
          <Checkbox
            label={t("globals.checkboxMixed")}
            checked={checkOn}
            indeterminate={checkMixed}
            onCheckedChange={(next) => {
              setCheckOn(next);
              setCheckMixed(false);
            }}
          />
          <div className="sandbox-globals-row">
            <Radio
              name="sandbox-globals-radio"
              value="a"
              label={t("globals.radioA")}
              checked={radioValue === "a"}
              onCheckedChange={() => setRadioValue("a")}
            />
            <Radio
              name="sandbox-globals-radio"
              value="b"
              label={t("globals.radioB")}
              checked={radioValue === "b"}
              onCheckedChange={() => setRadioValue("b")}
            />
          </div>
          <ChipSet ariaLabel={t("globals.chipsAria")}>
            <Chip onClick={() => {}}>{t("globals.chipAssist")}</Chip>
            <Chip
              variant="filter"
              selected={filterOn}
              onClick={() => setFilterOn((v) => !v)}
            >
              {t("globals.chipFilter")}
            </Chip>
            <Chip elevated onClick={() => {}}>
              {t("globals.chipElevated")}
            </Chip>
            {inputChips.map((name) => (
              <Chip
                key={name}
                variant="input"
                selected
                removeAriaLabel={t("globals.chipRemove")}
                onRemove={() => setInputChips((list) => list.filter((x) => x !== name))}
              >
                {name}
              </Chip>
            ))}
          </ChipSet>
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <span className="sandbox-help">{t("globals.dividerFull")}</span>
          <Divider />
          <span className="sandbox-help">{t("globals.dividerInset")}</span>
          <Divider inset />
          <div
            className="sandbox-globals-row"
            style={{ alignItems: "stretch", height: "var(--fynns-space-2xl)" }}
          >
            <span className="sandbox-help">{t("globals.dividerVerticalA")}</span>
            <Divider orientation="vertical" />
            <span className="sandbox-help">{t("globals.dividerVerticalB")}</span>
          </div>
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <span className="sandbox-help">{t("globals.progressLinear")}</span>
          <LinearProgress value={0.42} label={t("globals.progressLinearAria")} />
          <span className="sandbox-help">{t("globals.progressLinearIndeterminate")}</span>
          <LinearProgress label={t("globals.progressLinearIndeterminateAria")} />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <CircularProgress value={0.65} label={t("globals.progressCircularAria")} size="sm" />
            <CircularProgress label={t("globals.progressCircularIndeterminateAria")} />
            <CircularProgress value={0.2} label={t("globals.progressCircularAria")} size="lg" />
          </div>
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Avatar size="sm" name="Ada" alt={t("globals.avatarAda")} />
          <Avatar name="Ada Lovelace" alt={t("globals.avatarAda")} />
          <Avatar size="lg" name="Grace Hopper" alt={t("globals.avatarGrace")} />
          <Avatar alt={t("globals.avatarFallback")} />
          <Avatar
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%230a3d3a' width='40' height='40'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%232dd4bf'/%3E%3Cellipse cx='20' cy='38' rx='14' ry='13' fill='%232dd4bf'/%3E%3C/svg%3E"
            name="Ada Lovelace"
            alt={t("globals.avatarImage")}
          />
          <Avatar
            src="/__missing-avatar__.png"
            name="Broken Src"
            alt={t("globals.avatarBroken")}
          />
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Tooltip content={t("globals.fabTip")}>
            <Fab size="sm" aria-label={t("globals.fabTip")}>
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Tooltip content={t("globals.fabTip")}>
            <Fab aria-label={t("globals.fabTip")}>
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Fab label={t("globals.fabExtended")} aria-label={t("globals.fabExtended")}>
            <PlusIcon />
          </Fab>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            {t("globals.sheetOpen")}
          </Button>
        </div>
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t("globals.sheetTitle")}
          description={t("globals.sheetDescription")}
          actions={
            <Button onClick={() => setSheetOpen(false)}>
              {t("globals.sheetDone")}
            </Button>
          }
        >
          <p style={{ margin: 0 }}>{t("globals.sheetBody")}</p>
        </BottomSheet>
        <div
          className="sandbox-globals-appbar"
          style={{
            width: "100%",
            maxWidth: "28rem",
            border: "1px solid var(--fynns-color-border)",
            borderRadius: "var(--fynns-radius-md)",
            overflow: "hidden",
          }}
        >
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
          size="sm"
          labelSide="end"
          label={t("globals.appBarScrolled")}
          checked={appBarScrolled}
          onCheckedChange={setAppBarScrolled}
        />
        <div className="sandbox-globals-navrail">
          <NavigationRail aria-label={t("globals.navRailAria")}>
            <NavigationRailMenu>
              <Tooltip content={t("globals.navRailMenu")} side="right">
                <IconButton aria-label={t("globals.navRailMenu")}>
                  <MenuIcon size={24} />
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
          <div className="sandbox-globals-navrail-pane fynns-scroll">
            <p className="sandbox-globals-navrail-pane-body">
              {t(RAIL_PANE_BODY[railId])}
            </p>
            {railId === "all" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  document
                    .querySelector(".sandbox-globals-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {t("globals.navRailShowAll")}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="sandbox-help">{t("globals.controlsRadiusHelp")}</p>
      </section>

      <section
        className="sandbox-globals-section"
        aria-label={t("globals.rhythmAria")}
      >
        <h3 className="sandbox-globals-heading">{t("globals.rhythm")}</h3>
        <p className="sandbox-help">{t("globals.rhythmLead")}</p>
        <div className="sandbox-globals-rhythm">
          <ControlStack className="sandbox-globals-rhythm-stack" columns={2}>
            <ControlRow label={t("globals.rhythmRowContent")}>
              <Switch
                size="sm"
                labelSide="end"
                label={t("globals.rhythmMedia")}
                checked={rhythmMedia}
                onCheckedChange={setRhythmMedia}
              />
            </ControlRow>
            <ControlRow label={t("globals.rhythmRowBehavior")}>
              <Grid x={2} y="unbounded">
                <Switch
                  size="sm"
                  labelSide="end"
                  label={t("globals.rhythmClickable")}
                  checked={rhythmClickable}
                  onCheckedChange={setRhythmClickable}
                />
                <Switch
                  size="sm"
                  labelSide="end"
                  label={t("globals.rhythmDisabled")}
                  checked={rhythmDisabled}
                  onCheckedChange={setRhythmDisabled}
                />
              </Grid>
            </ControlRow>
            <ControlRow label={t("globals.rhythmRowActions")}>
              <ToggleGroup
                size="compact"
                value={rhythmAlign}
                onChange={(id) => setRhythmAlign(id as "start" | "end")}
                options={[
                  { value: "start", label: t("globals.rhythmStart") },
                  { value: "end", label: t("globals.rhythmEnd") },
                ]}
              />
            </ControlRow>
          </ControlStack>
          <dl className="sandbox-globals-rhythm-legend">
            <div>
              <dt>
                <code>--fynns-layout-control-stack-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenStack")}</dd>
            </div>
            <div>
              <dt>
                <code>--fynns-layout-control-row-column-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenRowCol")}</dd>
            </div>
            <div>
              <dt>
                <code>--fynns-layout-control-row-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenRow")}</dd>
            </div>
            <div>
              <dt>
                <code>--fynns-layout-control-cluster-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenCluster")}</dd>
            </div>
          </dl>
        </div>
        <p className="sandbox-help">{t("globals.rhythmAgentHint")}</p>
      </section>

      <section className="sandbox-globals-section" aria-label={t("globals.surfacesAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.surfaces")}</h3>
        <div className="sandbox-globals-cards">
          {(["elevated", "filled", "outlined"] as const).map((variant) => (
            <Card key={variant} variant={variant} className="sandbox-globals-card">
              <CardHeader
                title={variant}
                subtitle={t("globals.cardSubtitle")}
                avatar={<Avatar name="FY" alt={t("globals.avatarCard")} size="sm" />}
              />
              <CardContent>{t("globals.cardBody")}</CardContent>
            </Card>
          ))}
        </div>
        <Collapsible title={t("globals.collapsible")} defaultOpen>
          <p className="sandbox-help">{t("globals.collapsibleHelp")}</p>
        </Collapsible>
      </section>

      <section className="sandbox-globals-section" aria-label={t("globals.swatchesAria")}>
        <h3 className="sandbox-globals-heading">{t("globals.swatches")}</h3>
        <p className="sandbox-help">{t("globals.swatchesHelp")}</p>
        <div className="sandbox-globals-swatches">
          {SWATCH_KEYS.map(({ key, usesKey }) => (
            <div key={key} className="sandbox-globals-swatch">
              <div
                className="sandbox-globals-swatch-box"
                style={{ borderRadius: `var(--fynns-radius-${key})` }}
                aria-hidden
              />
              <code>{key}</code>
              <span className="sandbox-globals-swatch-uses">{t(usesKey)}</span>
            </div>
          ))}
        </div>
        <p className="sandbox-help">{t("globals.swatchesSpecialHelp")}</p>
      </section>
    </div>
  );
}
