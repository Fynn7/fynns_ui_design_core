import {
  Autocomplete,
  ArchiveIcon,
  ArrowLeftIcon,
  Avatar,
  AvatarGroup,
  BadgedBox,
  Banner,
  BarChartIcon,
  BottomAppBar,
  BottomSheet,
  Breadcrumb,
  BusyRegion,
  BusyScrim,
  Button,
  useBusyTask,
  Pagination,
  Card,
  CardContent,
  CardHeader,
  Surface,
  Checkbox,
  ChevronRightIcon,
  Chip,
  ChipSet,
  CircularProgress,
  ClipboardIcon,
  Carousel,
  CarouselItem,
  CodeBlock,
  Collapsible,
  ContextMenu,
  ContextMenuTrigger,
  DatePicker,
  DatePickerDialog,
  DateRangePicker,
  DateRangePickerDialog,
  TimePicker,
  TimePickerDialog,
  Divider,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dropzone,
  EmptyState,
  EyeIcon,
  EyeOffIcon,
  Fab,
  FabMenu,
  FabMenuItem,
  FieldBlock,
  FileIcon,
  FolderOpenIcon,
  FullscreenDialog,
  Dialog,
  ConfirmDialog,
  Drawer,
  IconButton,
  InfoIcon,
  InlineAlert,
  Input,
  Textarea,
  Tabs,
  LayoutGridIcon,
  LinearProgress,
  List,
  ListItem,
  MenuIcon,
  NavigationRail,
  NavigationRailHeader,
  NavigationRailItem,
  NavigationRailMenu,
  NavigationBar,
  NavigationBarItem,
  NavigationDrawer,
  NavigationDrawerHeadline,
  NavigationDrawerItem,
  OtpInput,
  PlusIcon,
  PencilIcon,
  Radio,
  SaveIcon,
  SearchIcon,
  SearchBar,
  SearchBarResult,
  Select,
  SettingsIcon,
  SkipLink,
  snackbar,
  SplitButton,
  Stepper,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  ToggleGroup,
  TopAppBar,
  Toolbar,
  Tooltip,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  ControlRow,
  ControlStack,
  Grid,
  InfoHint,
  Slider,
  SparklesIcon,
  useOverflowBounds,
} from "@fynns/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";

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

/** One M3 / sandbox category — Collapsible defaults to collapsed. */
function GlobalsCategory({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Collapsible title={title} icon={icon} className="sandbox-globals-category">
      <div className="sandbox-globals-section-body">{children}</div>
    </Collapsible>
  );
}

/** Live demo of `useOverflowBounds` (content mode + ellipsis truncation). */
function OverflowBoundsDemo() {
  const { t } = useLocale();
  const lineRef = useRef<HTMLDivElement>(null);
  const overflow = useOverflowBounds(lineRef, "viewport", { mode: "content" });
  const edges =
    [
      overflow.edges.left ? "L" : null,
      overflow.edges.right ? "R" : null,
      overflow.edges.top ? "T" : null,
      overflow.edges.bottom ? "B" : null,
    ]
      .filter(Boolean)
      .join("") || "—";

  return (
    <div className="sandbox-globals-row sandbox-globals-row--stack">
      <div ref={lineRef} className="sandbox-overflow-sample">
        {t("globals.overflowSample")}
      </div>
      <SandboxHelp
        text={t("globals.overflowHelp", {
          overflows: overflow.overflows ? "true" : "false",
          edges,
          right: String(Math.round(overflow.delta.right)),
        })}
      />
    </div>
  );
}

/**
 * Live stage proving `--fynns-radius-*` is system-wide: multiple primitives
 * share the same token ladder (not Card-only). Samples are grouped by M3
 * component families; each family is a collapsed Collapsible.
 */
export function GlobalsPage() {
  const { t } = useLocale();
  const [switchOn, setSwitchOn] = useState(true);
  const [checkOn, setCheckOn] = useState(true);
  const [checkMixed, setCheckMixed] = useState(true);
  const [radioValue, setRadioValue] = useState<"a" | "b">("a");
  const [filterOn, setFilterOn] = useState(true);
  const [inputChips, setInputChips] = useState(["Alpha", "Beta"]);
  const [breadcrumbLeaf, setBreadcrumbLeaf] = useState<"library" | "folder" | "page">(
    "page",
  );
  const [page, setPage] = useState(3);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [appBarScrolled, setAppBarScrolled] = useState(false);
  const [railId, setRailId] = useState<RailId>("home");
  const [barId, setBarId] = useState<"home" | "search" | "charts" | "all">("home");
  const [drawerId, setDrawerId] = useState<"inbox" | "sent" | "drafts" | "settings">(
    "inbox",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [listId, setListId] = useState<"inbox" | "starred" | "sent">("inbox");
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [pickedRange, setPickedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [pickedTime, setPickedTime] = useState<string | null>("14:30");
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [timeHourCycle, setTimeHourCycle] = useState<"h23" | "h12">("h23");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [segment, setSegment] = useState<"day" | "week" | "month">("week");
  const [styleMarks, setStyleMarks] = useState<Array<"bold" | "italic">>(["bold"]);
  const [sliderValue, setSliderValue] = useState(40);
  const [autoValue, setAutoValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [stepperIndex, setStepperIndex] = useState(1);
  const [dropNames, setDropNames] = useState<string[]>([]);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [busyRegion, setBusyRegion] = useState(false);
  const [busyScrimOpen, setBusyScrimOpen] = useState(false);
  const [busyPaintBad, setBusyPaintBad] = useState(false);
  const busyPaintGood = useBusyTask();
  const [centeredDialogOpen, setCenteredDialogOpen] = useState(false);
  const [nestedDialogOpen, setNestedDialogOpen] = useState(false);
  const [nestedPrompt, setNestedPrompt] = useState(
    "You translate natural-language requests into structured camera commands.",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [tabsId, setTabsId] = useState<"single" | "batch">("single");
  const [textareaValue, setTextareaValue] = useState("");
  const [btnActive, setBtnActive] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [menuStarred, setMenuStarred] = useState(true);
  const [menuNotify, setMenuNotify] = useState(false);
  const [rhythmClickable, setRhythmClickable] = useState(true);
  const [rhythmDisabled, setRhythmDisabled] = useState(false);
  const [rhythmAlign, setRhythmAlign] = useState<"start" | "end">("end");
  const [rhythmMedia, setRhythmMedia] = useState(false);

  useEffect(() => {
    if (!busyScrimOpen) return;
    const timer = window.setTimeout(() => setBusyScrimOpen(false), 2000);
    return () => window.clearTimeout(timer);
  }, [busyScrimOpen]);

  const nestedPromptDefault =
    "You translate natural-language requests into structured camera commands.";

  /** Host-agnostic section recipe — reuse inline or inside Dialog/Drawer. */
  const renderNestedPromptSection = (fieldId: string) => (
    <Card variant="outlined">
      <CardContent>
        <FieldBlock
          label={t("globals.nestedDialogFieldLabel")}
          htmlFor={fieldId}
          actions={
            <>
              <Tooltip content={t("globals.nestedDialogExpandTip")}>
                <IconButton
                  size="sm"
                  aria-label={t("globals.nestedDialogExpandTip")}
                >
                  <LayoutGridIcon />
                </IconButton>
              </Tooltip>
              <Tooltip content={t("globals.nestedDialogResetTip")}>
                <IconButton
                  size="sm"
                  aria-label={t("globals.nestedDialogResetTip")}
                  onClick={() => setNestedPrompt(nestedPromptDefault)}
                >
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            </>
          }
        >
          <Textarea
            id={fieldId}
            value={nestedPrompt}
            onChange={(event) => setNestedPrompt(event.target.value)}
            placeholder={t("globals.textareaPlaceholder")}
            aria-label={t("globals.nestedDialogFieldLabel")}
          />
        </FieldBlock>
      </CardContent>
    </Card>
  );

  return (
    <div className="sandbox-globals" id="main">
      <SkipLink href="#main" label={t("globals.skipLink")} />
      <p className="sandbox-globals-lead">{t("globals.lead")}</p>
      <SandboxHelp text={t("globals.skipLinkHelp")} />

      <GlobalsCategory title={t("globals.catActions")} icon={<PlusIcon aria-hidden />}>
        <div className="sandbox-globals-row">
          <Button size="sm">{t("globals.btnSmall")}</Button>
          <Button>{t("globals.btnDefault")}</Button>
          <Button size="lg">{t("globals.btnLarge")}</Button>
          <Button variant="tonal">{t("globals.btnTonal")}</Button>
          <Button variant="elevated">{t("globals.btnElevated")}</Button>
          <Button variant="default">{t("globals.btnOutlined")}</Button>
          <Button variant="ghost">{t("globals.btnGhost")}</Button>
          <Button variant="danger">{t("globals.btnDanger")}</Button>
          <Button loading>{t("globals.btnLoading")}</Button>
          <Button disabled>{t("globals.btnDisabled")}</Button>
          <Button active={btnActive} onClick={() => setBtnActive((v) => !v)}>
            {t("globals.btnActive")}
          </Button>
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <SplitButton
            label={t("globals.splitBtnLabel")}
            leadingIcon={<SaveIcon />}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() =>
              snackbar(t("globals.splitBtnMainToast"), {
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            <DropdownMenuItem
              icon={<SaveIcon />}
              onClick={() =>
                snackbar(t("globals.splitBtnSaveToast"), {
                  dismissAriaLabel: t("globals.snackbarDismiss"),
                })
              }
            >
              {t("globals.splitBtnSave")}
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<UploadIcon />}
              onClick={() =>
                snackbar(t("globals.splitBtnExportToast"), {
                  dismissAriaLabel: t("globals.snackbarDismiss"),
                })
              }
            >
              {t("globals.splitBtnExport")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              icon={<TrashIcon />}
              onClick={() =>
                snackbar(t("globals.splitBtnDeleteToast"), {
                  dismissAriaLabel: t("globals.snackbarDismiss"),
                })
              }
            >
              {t("globals.splitBtnDelete")}
            </DropdownMenuItem>
          </SplitButton>
          <SplitButton
            variant="tonal"
            label={t("globals.splitBtnTonal")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() =>
              snackbar(t("globals.splitBtnMainToast"), {
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionA")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionB")}
            </DropdownMenuItem>
          </SplitButton>
          <SplitButton
            variant="default"
            label={t("globals.splitBtnOutlined")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() =>
              snackbar(t("globals.splitBtnMainToast"), {
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionA")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionB")}
            </DropdownMenuItem>
          </SplitButton>
          <SplitButton
            variant="elevated"
            size="sm"
            label={t("globals.splitBtnElevated")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() =>
              snackbar(t("globals.splitBtnMainToast"), {
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionA")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              {t("globals.splitBtnOptionB")}
            </DropdownMenuItem>
          </SplitButton>
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Tooltip content={t("globals.iconBtnTip")}>
            <IconButton size="sm" aria-label={t("globals.iconBtnTip")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnTip")}>
            <IconButton aria-label={t("globals.iconBtnTip")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnTip")}>
            <IconButton size="lg" aria-label={t("globals.iconBtnTip")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnFilled")}>
            <IconButton variant="primary" aria-label={t("globals.iconBtnFilled")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnTonal")}>
            <IconButton variant="tonal" aria-label={t("globals.iconBtnTonal")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnOutlined")}>
            <IconButton variant="default" aria-label={t("globals.iconBtnOutlined")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnDanger")}>
            <IconButton variant="danger" aria-label={t("globals.iconBtnDanger")}>
              <TrashIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <InfoHint
            content={t("globals.infoHintIconBody")}
            ariaLabel={t("globals.infoHintIconAria")}
          />
          <InfoHint
            label={t("globals.infoHintLabeledTrigger")}
            content={t("globals.infoHintLabeledBody")}
            ariaLabel={t("globals.infoHintLabeledAria")}
          />
          <ControlStack columns={2}>
            <ControlRow label={t("globals.infoHintRowLabel")}>
              <Switch
                size="sm"
                labelSide="end"
                label={t("globals.infoHintRowSwitch")}
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
              <InfoHint
                content={t("globals.infoHintRowBody")}
                ariaLabel={t("globals.infoHintRowAria")}
              />
            </ControlRow>
          </ControlStack>
        </div>
        <SandboxHelp text={t("globals.infoHintHelp")} />
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
          <Tooltip content={t("globals.fabSecondary")}>
            <Fab variant="secondary" aria-label={t("globals.fabSecondary")}>
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Tooltip content={t("globals.fabTertiary")}>
            <Fab variant="tertiary" aria-label={t("globals.fabTertiary")}>
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Tooltip content={t("globals.fabSurface")}>
            <Fab variant="surface" lowered aria-label={t("globals.fabSurface")}>
              <PlusIcon />
            </Fab>
          </Tooltip>
          <Fab label={t("globals.fabExtended")} aria-label={t("globals.fabExtended")}>
            <PlusIcon />
          </Fab>
        </div>
        <div className="sandbox-globals-row" style={{ justifyContent: "flex-end" }}>
          <FabMenu
            ariaLabel={t("globals.fabMenuOpen")}
            closeAriaLabel={t("globals.fabMenuClose")}
            expanded={fabMenuOpen}
            onExpandedChange={setFabMenuOpen}
          >
            <FabMenuItem
              icon={<FileIcon />}
              label={t("globals.fabMenuFile")}
            />
            <FabMenuItem
              icon={<FolderOpenIcon />}
              label={t("globals.fabMenuFolder")}
            />
            <FabMenuItem
              icon={<PencilIcon />}
              label={t("globals.fabMenuEdit")}
            />
          </FabMenu>
        </div>
        <SandboxHelp text={t("globals.fabHelp")} />
        <div className="sandbox-globals-row">
          <DropdownMenu trigger={t("globals.menuTrigger")} ariaLabel={t("globals.menuAria")}>
            <DropdownMenuGroup label={t("globals.menuGroupFile")}>
              <DropdownMenuItem icon={<FileIcon />}>
                {t("globals.menuNew")}
              </DropdownMenuItem>
              <DropdownMenuItem icon={<FolderOpenIcon />}>
                {t("globals.menuOpen")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup label={t("globals.menuGroupView")}>
              <DropdownMenuCheckboxItem
                checked={menuStarred}
                onCheckedChange={setMenuStarred}
              >
                {t("globals.menuStarred")}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={menuNotify}
                onCheckedChange={setMenuNotify}
              >
                {t("globals.menuNotify")}
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<PencilIcon />}>
              {t("globals.menuRename")}
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
        <SandboxHelp text={t("globals.menuHelp")} />
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <ContextMenuTrigger
            onOpenChange={setCtxOpen}
            onPositionChange={(x, y) => setCtxPos({ x, y })}
            style={{
              padding: "var(--fynns-space-lg)",
              border: "1px dashed var(--fynns-color-border)",
              borderRadius: "var(--fynns-radius-md)",
              color: "var(--fynns-color-text-muted)",
            }}
          >
            {t("globals.contextMenuHint")}
          </ContextMenuTrigger>
          <ContextMenu
            open={ctxOpen}
            onOpenChange={setCtxOpen}
            x={ctxPos.x}
            y={ctxPos.y}
            ariaLabel={t("globals.contextMenuAria")}
          >
            <DropdownMenuItem icon={<ClipboardIcon />}>
              {t("globals.contextMenuCopy")}
            </DropdownMenuItem>
            <DropdownMenuItem icon={<FileIcon />}>
              {t("globals.contextMenuPaste")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<TrashIcon />}>
              {t("globals.contextMenuDelete")}
            </DropdownMenuItem>
          </ContextMenu>
          <SandboxHelp text={t("globals.contextMenuHelp")} />
        </div>
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catTextInputs")} icon={<PencilIcon aria-hidden />}>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Input placeholder={t("globals.inputPlaceholder")} aria-label={t("globals.inputAria")} />
          <Select
            ariaLabel={t("globals.selectAria")}
            value="one"
            options={["one", "two", "three"]}
            onChange={() => {}}
          />
          <Autocomplete
            ariaLabel={t("globals.autocompleteAria")}
            placeholder={t("globals.autocompletePlaceholder")}
            emptyText={t("globals.autocompleteEmpty")}
            value={autoValue}
            onChange={setAutoValue}
            options={[
              t("globals.autocompleteOptTeal"),
              t("globals.autocompleteOptCyan"),
              t("globals.autocompleteOptBlue"),
              t("globals.autocompleteOptViolet"),
              t("globals.autocompleteOptAmber"),
            ]}
          />
          <SandboxHelp
            text={
              autoValue
                ? t("globals.autocompleteSelected", { value: autoValue })
                : t("globals.autocompleteHelp")
            }
          />
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            ariaLabel={t("globals.otpAria")}
            supportingText={t("globals.otpSupporting")}
          />
          <SandboxHelp text={t("globals.otpHelp")} />
          <Input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("globals.passwordPlaceholder")}
            aria-label={t("globals.passwordAria")}
            trailing={
              <Tooltip
                content={
                  passwordVisible
                    ? t("globals.passwordHide")
                    : t("globals.passwordShow")
                }
              >
                <IconButton
                  size="sm"
                  aria-label={
                    passwordVisible
                      ? t("globals.passwordHide")
                      : t("globals.passwordShow")
                  }
                  onClick={() => setPasswordVisible((v) => !v)}
                >
                  {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </IconButton>
              </Tooltip>
            }
          />
          <SandboxHelp text={t("globals.passwordHelp")} />
          <Textarea
            value={textareaValue}
            onChange={(event) => setTextareaValue(event.target.value)}
            placeholder={t("globals.textareaPlaceholder")}
            aria-label={t("globals.textareaAria")}
            supportingText={t("globals.textareaSupporting")}
            rows={4}
          />
          <SandboxHelp text={t("globals.textareaHelp")} />
        </div>
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catTabs")} icon={<LayoutGridIcon aria-hidden />}>
        <Tabs
          ariaLabel={t("globals.tabsAria")}
          tabs={[
            { id: "single", label: t("globals.tabsSingle") },
            { id: "batch", label: t("globals.tabsBatch") },
          ]}
          activeId={tabsId}
          onChange={setTabsId}
          fullWidth
        />
        <SandboxHelp
          text={
            tabsId === "single"
              ? t("globals.tabsPaneSingle")
              : t("globals.tabsPaneBatch")
          }
        />
        <SandboxHelp text={t("globals.tabsHelp")} />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catSelection")} icon={<ClipboardIcon aria-hidden />}>
        <div className="sandbox-globals-row">
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
            <Chip variant="suggestion" onClick={() => {}}>
              {t("globals.chipSuggestion")}
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
          <ToggleGroup
            ariaLabel={t("globals.segmentedAria")}
            value={segment}
            onChange={setSegment}
            options={[
              { value: "day", label: t("globals.segmentedDay") },
              { value: "week", label: t("globals.segmentedWeek") },
              { value: "month", label: t("globals.segmentedMonth") },
            ]}
          />
          <SandboxHelp text={t("globals.segmentedHelp")} />
          <ToggleGroup
            multiple
            ariaLabel={t("globals.segmentedMultiAria")}
            value={styleMarks}
            onChange={setStyleMarks}
            options={[
              { value: "bold", label: t("globals.segmentedBold") },
              { value: "italic", label: t("globals.segmentedItalic") },
            ]}
          />
          <SandboxHelp text={t("globals.segmentedMultiHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div style={{ width: "min(100%, 20rem)" }}>
            <Slider
              value={sliderValue}
              onChange={setSliderValue}
              ariaLabel={t("globals.sliderAria")}
            />
          </div>
          <SandboxHelp text={t("globals.sliderHelp", { value: String(sliderValue) })} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <DatePicker
            value={pickedDate}
            onChange={setPickedDate}
            weekStartsOn={1}
            labels={{
              previousMonth: t("globals.datePrev"),
              nextMonth: t("globals.dateNext"),
              weekdays: [
                t("globals.dateWd0"),
                t("globals.dateWd1"),
                t("globals.dateWd2"),
                t("globals.dateWd3"),
                t("globals.dateWd4"),
                t("globals.dateWd5"),
                t("globals.dateWd6"),
              ],
              months: [
                t("globals.dateM0"),
                t("globals.dateM1"),
                t("globals.dateM2"),
                t("globals.dateM3"),
                t("globals.dateM4"),
                t("globals.dateM5"),
                t("globals.dateM6"),
                t("globals.dateM7"),
                t("globals.dateM8"),
                t("globals.dateM9"),
                t("globals.dateM10"),
                t("globals.dateM11"),
              ],
            }}
          />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <Button size="sm" variant="tonal" onClick={() => setDateDialogOpen(true)}>
              {t("globals.dateOpenDialog")}
            </Button>
            <SandboxHelp
              as="span"
              text={
                pickedDate
                  ? t("globals.dateSelected", { date: pickedDate })
                  : t("globals.dateNone")
              }
            />
          </div>
          <SandboxHelp text={t("globals.dateHelp")} />
          <OverflowBoundsDemo />
        </div>
        <DatePickerDialog
          open={dateDialogOpen}
          onOpenChange={setDateDialogOpen}
          value={pickedDate}
          onConfirm={setPickedDate}
          title={t("globals.dateDialogTitle")}
          confirmLabel={t("globals.dateConfirm")}
          cancelLabel={t("globals.dateCancel")}
          closeAriaLabel={t("globals.dateClose")}
          weekStartsOn={1}
          labels={{
            previousMonth: t("globals.datePrev"),
            nextMonth: t("globals.dateNext"),
            weekdays: [
              t("globals.dateWd0"),
              t("globals.dateWd1"),
              t("globals.dateWd2"),
              t("globals.dateWd3"),
              t("globals.dateWd4"),
              t("globals.dateWd5"),
              t("globals.dateWd6"),
            ],
            months: [
              t("globals.dateM0"),
              t("globals.dateM1"),
              t("globals.dateM2"),
              t("globals.dateM3"),
              t("globals.dateM4"),
              t("globals.dateM5"),
              t("globals.dateM6"),
              t("globals.dateM7"),
              t("globals.dateM8"),
              t("globals.dateM9"),
              t("globals.dateM10"),
              t("globals.dateM11"),
            ],
          }}
        />
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <DateRangePicker
            value={pickedRange}
            onChange={setPickedRange}
            weekStartsOn={1}
            labels={{
              previousMonth: t("globals.datePrev"),
              nextMonth: t("globals.dateNext"),
              weekdays: [
                t("globals.dateWd0"),
                t("globals.dateWd1"),
                t("globals.dateWd2"),
                t("globals.dateWd3"),
                t("globals.dateWd4"),
                t("globals.dateWd5"),
                t("globals.dateWd6"),
              ],
              months: [
                t("globals.dateM0"),
                t("globals.dateM1"),
                t("globals.dateM2"),
                t("globals.dateM3"),
                t("globals.dateM4"),
                t("globals.dateM5"),
                t("globals.dateM6"),
                t("globals.dateM7"),
                t("globals.dateM8"),
                t("globals.dateM9"),
                t("globals.dateM10"),
                t("globals.dateM11"),
              ],
            }}
          />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <Button size="sm" variant="tonal" onClick={() => setRangeDialogOpen(true)}>
              {t("globals.dateRangeOpenDialog")}
            </Button>
            <SandboxHelp
              as="span"
              text={
                pickedRange.start && pickedRange.end
                  ? t("globals.dateRangeSelected", {
                      start: pickedRange.start,
                      end: pickedRange.end,
                    })
                  : pickedRange.start
                    ? t("globals.dateRangePartial", { start: pickedRange.start })
                    : t("globals.dateRangeNone")
              }
            />
          </div>
          <SandboxHelp text={t("globals.dateRangeHelp")} />
        </div>
        <DateRangePickerDialog
          open={rangeDialogOpen}
          onOpenChange={setRangeDialogOpen}
          value={pickedRange}
          onConfirm={setPickedRange}
          title={t("globals.dateRangeDialogTitle")}
          confirmLabel={t("globals.dateConfirm")}
          cancelLabel={t("globals.dateCancel")}
          closeAriaLabel={t("globals.dateClose")}
          weekStartsOn={1}
          labels={{
            previousMonth: t("globals.datePrev"),
            nextMonth: t("globals.dateNext"),
            weekdays: [
              t("globals.dateWd0"),
              t("globals.dateWd1"),
              t("globals.dateWd2"),
              t("globals.dateWd3"),
              t("globals.dateWd4"),
              t("globals.dateWd5"),
              t("globals.dateWd6"),
            ],
            months: [
              t("globals.dateM0"),
              t("globals.dateM1"),
              t("globals.dateM2"),
              t("globals.dateM3"),
              t("globals.dateM4"),
              t("globals.dateM5"),
              t("globals.dateM6"),
              t("globals.dateM7"),
              t("globals.dateM8"),
              t("globals.dateM9"),
              t("globals.dateM10"),
              t("globals.dateM11"),
            ],
          }}
        />
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <ToggleGroup
            ariaLabel={t("globals.timeCycleAria")}
            value={timeHourCycle}
            onChange={setTimeHourCycle}
            options={[
              { value: "h23", label: t("globals.timeCycle24") },
              { value: "h12", label: t("globals.timeCycle12") },
            ]}
          />
          <TimePicker
            value={pickedTime}
            onChange={setPickedTime}
            hourCycle={timeHourCycle}
            labels={{
              hour: t("globals.timeHour"),
              minute: t("globals.timeMinute"),
              am: t("globals.timeAm"),
              pm: t("globals.timePm"),
              periodAria: t("globals.timePeriodAria"),
            }}
          />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <Button size="sm" variant="tonal" onClick={() => setTimeDialogOpen(true)}>
              {t("globals.timeOpenDialog")}
            </Button>
            <SandboxHelp
              as="span"
              text={
                pickedTime
                  ? t("globals.timeSelected", { time: pickedTime })
                  : t("globals.timeNone")
              }
            />
          </div>
          <SandboxHelp text={t("globals.timeHelp")} />
        </div>
        <TimePickerDialog
          open={timeDialogOpen}
          onOpenChange={setTimeDialogOpen}
          value={pickedTime}
          onConfirm={setPickedTime}
          title={t("globals.timeDialogTitle")}
          confirmLabel={t("globals.timeConfirm")}
          cancelLabel={t("globals.timeCancel")}
          closeAriaLabel={t("globals.timeClose")}
          hourCycle={timeHourCycle}
          labels={{
            hour: t("globals.timeHour"),
            minute: t("globals.timeMinute"),
            am: t("globals.timeAm"),
            pm: t("globals.timePm"),
            periodAria: t("globals.timePeriodAria"),
          }}
        />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catCommunication")} icon={<InfoIcon aria-hidden />}>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp as="span" text={t("globals.progressLinear")} />
          <LinearProgress value={0.42} label={t("globals.progressLinearAria")} />
          <SandboxHelp as="span" text={t("globals.progressLinearIndeterminate")} />
          <LinearProgress label={t("globals.progressLinearIndeterminateAria")} />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <CircularProgress value={0.65} label={t("globals.progressCircularAria")} size="sm" />
            <CircularProgress label={t("globals.progressCircularIndeterminateAria")} />
            <CircularProgress value={0.2} label={t("globals.progressCircularAria")} size="lg" />
          </div>
        </div>
        {bannerVisible ? (
          <div className="sandbox-globals-banner">
            <Banner
              variant="tonal"
              icon={<InfoIcon />}
              text={t("globals.bannerText")}
              supportingText={t("globals.bannerSupporting")}
              actions={
                <Button size="sm" variant="ghost" onClick={() => setBannerVisible(false)}>
                  {t("globals.bannerAction")}
                </Button>
              }
              onDismiss={() => setBannerVisible(false)}
              dismissAriaLabel={t("globals.bannerDismiss")}
            />
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setBannerVisible(true)}>
            {t("globals.bannerShow")}
          </Button>
        )}
        <SandboxHelp text={t("globals.bannerHelp")} />
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <InlineAlert severity="info" message={t("globals.inlineAlertInfo")} />
          <InlineAlert severity="success" message={t("globals.inlineAlertSuccess")} />
          <InlineAlert severity="warning" message={t("globals.inlineAlertWarning")} />
          <InlineAlert severity="error" message={t("globals.inlineAlertError")} />
        </div>
        <SandboxHelp text={t("globals.inlineAlertHelp")} />
        <div className="sandbox-globals-row">
          <Button
            size="sm"
            variant="tonal"
            onClick={() =>
              snackbar(t("globals.snackbarShort"), {
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            {t("globals.snackbarShortBtn")}
          </Button>
          <Button
            size="sm"
            variant="tonal"
            onClick={() =>
              snackbar(t("globals.snackbarUndoMsg"), {
                action: {
                  label: t("globals.snackbarUndo"),
                  onClick: () => snackbar(t("globals.snackbarUndone")),
                },
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            {t("globals.snackbarUndoBtn")}
          </Button>
          <Button
            size="sm"
            variant="tonal"
            onClick={() =>
              snackbar(t("globals.snackbarIndefiniteMsg"), {
                duration: "indefinite",
                dismissible: true,
                dismissAriaLabel: t("globals.snackbarDismiss"),
              })
            }
          >
            {t("globals.snackbarIndefiniteBtn")}
          </Button>
        </div>
        <SandboxHelp text={t("globals.snackbarHelp")} />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catContainment")} icon={<FolderOpenIcon aria-hidden />}>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Carousel
            ariaLabel={t("globals.carouselAria")}
            variant="multi"
            index={carouselIndex}
            onIndexChange={setCarouselIndex}
            prevAriaLabel={t("globals.carouselPrev")}
            nextAriaLabel={t("globals.carouselNext")}
          >
            <CarouselItem label={t("globals.carouselSlide1")}>
              <strong>{t("globals.carouselSlide1")}</strong>
              <SandboxHelp as="span" text={t("globals.carouselSlide1Body")} />
            </CarouselItem>
            <CarouselItem label={t("globals.carouselSlide2")}>
              <strong>{t("globals.carouselSlide2")}</strong>
              <SandboxHelp as="span" text={t("globals.carouselSlide2Body")} />
            </CarouselItem>
            <CarouselItem label={t("globals.carouselSlide3")}>
              <strong>{t("globals.carouselSlide3")}</strong>
              <SandboxHelp as="span" text={t("globals.carouselSlide3Body")} />
            </CarouselItem>
          </Carousel>
          <SandboxHelp text={t("globals.carouselHelp")} />
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
          <BadgedBox badge={3}>
            <Tooltip content={t("globals.badgedBoxIconTip")}>
              <IconButton
                aria-label={`${t("globals.badgedBoxIconTip")}, 3`}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </BadgedBox>
          <BadgedBox badge>
            <Avatar name="Ada Lovelace" alt={t("globals.avatarAda")} />
          </BadgedBox>
          <AvatarGroup max={3} size="sm" aria-label={t("globals.avatarGroupHelp")}>
            <Avatar name="Ada Lovelace" alt="Ada" />
            <Avatar name="Grace Hopper" alt="Grace" />
            <Avatar name="Katherine Johnson" alt="Katherine" />
            <Avatar name="Dorothy Vaughan" alt="Dorothy" />
            <Avatar name="Mary Jackson" alt="Mary" />
          </AvatarGroup>
        </div>
        <SandboxHelp text={t("globals.badgedBoxHelp")} />
        <SandboxHelp text={t("globals.avatarGroupHelp")} />
        <div className="sandbox-globals-list">
          <List aria-label={t("globals.listAria")}>
            <ListItem
              headline={t("globals.listOneLine")}
              leading={<FolderOpenIcon />}
              trailing={<ChevronRightIcon />}
              trailingSupportingText="24"
              selected={listId === "inbox"}
              onClick={() => setListId("inbox")}
            />
            <Divider inset />
            <ListItem
              headline={t("globals.listTwoLine")}
              supportingText={t("globals.listTwoLineSupporting")}
              leading={<Avatar name="Ada Lovelace" alt={t("globals.avatarAda")} />}
              trailingSupportingText="10:24"
              selected={listId === "starred"}
              onClick={() => setListId("starred")}
            />
            <Divider inset />
            <ListItem
              overline={t("globals.listOverline")}
              headline={t("globals.listThreeLine")}
              supportingText={t("globals.listThreeLineSupporting")}
              leading={<InfoIcon />}
              trailing={<ChevronRightIcon />}
              selected={listId === "sent"}
              onClick={() => setListId("sent")}
            />
            <Divider inset />
            <ListItem
              headline={t("globals.listStatic")}
              supportingText={t("globals.listStaticSupporting")}
              leading={<SettingsIcon />}
            />
          </List>
        </div>
        <SandboxHelp text={t("globals.listHelp")} />
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp as="span" text={t("globals.dividerFull")} />
          <Divider />
          <SandboxHelp as="span" text={t("globals.dividerInset")} />
          <Divider inset />
          <div
            className="sandbox-globals-row"
            style={{ alignItems: "stretch", height: "var(--fynns-space-2xl)" }}
          >
            <SandboxHelp as="span" text={t("globals.dividerVerticalA")} />
            <Divider orientation="vertical" />
            <SandboxHelp as="span" text={t("globals.dividerVerticalB")} />
          </div>
        </div>
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
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          {renderNestedPromptSection("sandbox-nested-prompt")}
          <SandboxHelp text={t("globals.nestedSectionHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Surface padded style={{ maxWidth: "24rem" }}>
            <div className="sandbox-stack">
              <Input
                placeholder={t("globals.surfaceFieldPlaceholder")}
                aria-label={t("globals.surfaceFieldAria")}
              />
              <Button size="sm">{t("globals.surfaceAction")}</Button>
            </div>
          </Surface>
          <Surface
            style={{
              height: "7.5rem",
              maxWidth: "24rem",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--fynns-color-surface-head)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--fynns-color-text-muted)",
                fontSize: "var(--fynns-font-size-sm)",
              }}
            >
              {t("globals.surfacePreviewLabel")}
            </p>
          </Surface>
          <SandboxHelp text={t("globals.surfaceHelp")} />
        </div>
        <Collapsible
          title={t("globals.collapsible")}
          icon={<FolderOpenIcon aria-hidden />}
          defaultOpen
        >
          <SandboxHelp text={t("globals.collapsibleHelp")} />
        </Collapsible>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            {t("globals.sheetOpen")}
          </Button>
          <Button size="sm" onClick={() => setCenteredDialogOpen(true)}>
            {t("globals.dialogOpen")}
          </Button>
          <Button size="sm" variant="tonal" onClick={() => setNestedDialogOpen(true)}>
            {t("globals.nestedDialogOpen")}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
            {t("globals.confirmOpen")}
          </Button>
          <Button size="sm" variant="tonal" onClick={() => setSideDrawerOpen(true)}>
            {t("globals.drawerOpen")}
          </Button>
        </div>
        <SandboxHelp text={t("globals.nestedDialogHelp")} />
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
        <Dialog
          open={centeredDialogOpen}
          onOpenChange={setCenteredDialogOpen}
          title={t("globals.dialogTitle")}
          description={t("globals.dialogDescription")}
          size="sm"
          closeAriaLabel={t("globals.dialogClose")}
        >
          <p style={{ margin: 0 }}>{t("globals.dialogBody")}</p>
        </Dialog>
        <Dialog
          open={nestedDialogOpen}
          onOpenChange={setNestedDialogOpen}
          title={t("globals.nestedDialogTitle")}
          description={t("globals.nestedDialogDescription")}
          size="md"
          closeAriaLabel={t("globals.dialogClose")}
          showCloseButton
        >
          {renderNestedPromptSection("sandbox-nested-prompt-dialog")}
        </Dialog>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("globals.confirmTitle")}
          description={t("globals.confirmDescription")}
          confirmLabel={t("globals.confirmOk")}
          cancelLabel={t("globals.confirmCancel")}
          danger
          onConfirm={() => setConfirmOpen(false)}
        />
        <Drawer
          open={sideDrawerOpen}
          onClose={() => setSideDrawerOpen(false)}
          side="right"
          title={t("globals.drawerTitle")}
          description={t("globals.drawerDescription")}
          closeAriaLabel={t("globals.dialogClose")}
        >
          <p style={{ margin: 0 }}>{t("globals.drawerBody")}</p>
        </Drawer>
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setFullscreenOpen(true)}>
            {t("globals.fullscreenOpen")}
          </Button>
        </div>
        <FullscreenDialog
          open={fullscreenOpen}
          onOpenChange={setFullscreenOpen}
          title={t("globals.fullscreenTitle")}
          closeAriaLabel={t("globals.fullscreenClose")}
          actions={
            <Button size="sm" onClick={() => setFullscreenOpen(false)}>
              {t("globals.fullscreenDone")}
            </Button>
          }
        >
          <p style={{ margin: 0 }}>{t("globals.fullscreenBody")}</p>
        </FullscreenDialog>
        <SandboxHelp text={t("globals.overlayHelp")} />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catPatterns")} icon={<SparklesIcon aria-hidden />}>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <EmptyState
            icon={<FolderOpenIcon />}
            title={t("globals.emptyTitle")}
            description={t("globals.emptyDescription")}
            actions={
              <Button>{t("globals.emptyAction")}</Button>
            }
          />
          <SandboxHelp text={t("globals.emptyHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <BusyRegion
            busy={busyRegion}
            label={t("globals.busyRegionLabel")}
            message={t("globals.busyRegionMessage")}
          >
            <Card variant="outlined">
              <CardContent>
                <p style={{ margin: 0 }}>{t("globals.busyRegionBody")}</p>
              </CardContent>
            </Card>
          </BusyRegion>
          <div className="sandbox-globals-row">
            <Button size="sm" onClick={() => setBusyRegion(true)} disabled={busyRegion}>
              {t("globals.busyRegionStart")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setBusyRegion(false)}
              disabled={!busyRegion}
            >
              {t("globals.busyRegionStop")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.busyRegionHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Button onClick={() => setBusyScrimOpen(true)}>
            {t("globals.busyScrimOpen")}
          </Button>
          <BusyScrim
            open={busyScrimOpen}
            label={t("globals.busyScrimLabel")}
            message={t("globals.busyScrimMessage")}
          />
          <SandboxHelp text={t("globals.busyScrimHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              variant="danger"
              disabled={busyPaintBad || busyPaintGood.busy}
              onClick={() => {
                setBusyPaintBad(true);
                const until = performance.now() + 800;
                while (performance.now() < until) {
                  /* intentional main-thread stall — anti-pattern demo */
                }
                setBusyPaintBad(false);
              }}
            >
              {t("globals.busyPaintBad")}
            </Button>
            <Button
              size="sm"
              disabled={busyPaintBad || busyPaintGood.busy}
              onClick={() => {
                void busyPaintGood.run(t("globals.busyPaintLabel"), async () => {
                  const until = performance.now() + 800;
                  while (performance.now() < until) {
                    /* same stall after paint — ring can start first */
                  }
                });
              }}
            >
              {t("globals.busyPaintGood")}
            </Button>
          </div>
          <BusyScrim
            open={busyPaintBad || busyPaintGood.busy}
            label={
              busyPaintGood.busy
                ? (busyPaintGood.label ?? t("globals.busyPaintLabel"))
                : t("globals.busyPaintLabel")
            }
            message={t("globals.busyPaintMessage")}
          />
          <SandboxHelp text={t("globals.busyPaintHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Stepper
            ariaLabel={t("globals.stepperAria")}
            activeIndex={stepperIndex}
            onStepChange={setStepperIndex}
            steps={[
              {
                label: t("globals.stepperStep1"),
                description: t("globals.stepperStep1Desc"),
              },
              {
                label: t("globals.stepperStep2"),
                description: t("globals.stepperStep2Desc"),
              },
              {
                label: t("globals.stepperStep3"),
                description: t("globals.stepperStep3Desc"),
                optional: true,
              },
            ]}
          />
          <Button
            size="sm"
            variant="tonal"
            disabled={stepperIndex >= 2}
            onClick={() => setStepperIndex((i) => Math.min(2, i + 1))}
          >
            {t("globals.stepperNext")}
          </Button>
          <SandboxHelp text={t("globals.stepperHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Dropzone
            multiple
            label={t("globals.dropzoneLabel")}
            hint={t("globals.dropzoneHint")}
            browseLabel={t("globals.dropzoneBrowse")}
            onFiles={(files) => {
              const names = files.map((f) => f.name);
              setDropNames(names);
            }}
          />
          <SandboxHelp
            text={
              dropNames.length > 0
                ? t("globals.dropzoneToast", { names: dropNames.join(", ") })
                : t("globals.dropzoneHelp")
            }
          />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div className="fynns-table-wrap fynns-scroll">
            <Table>
              <TableCaption>{t("globals.tableCaption")}</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t("globals.tableColName")}</TableHeaderCell>
                  <TableHeaderCell>{t("globals.tableColStatus")}</TableHeaderCell>
                  <TableHeaderCell align="end">
                    {t("globals.tableColQty")}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Teal ink</TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell align="end">12</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Surface kit</TableCell>
                  <TableCell>Draft</TableCell>
                  <TableCell align="end">4</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Focus ring</TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell align="end">28</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <SandboxHelp text={t("globals.tableHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <CodeBlock
            label={t("globals.codeBlockLabel")}
            language="ts"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`export const accent = "var(--fynns-color-accent)";\nexport const radius = "var(--fynns-radius-md)";`}
            maxHeight="8rem"
          />
          <SandboxHelp text={t("globals.codeBlockHelp")} />
        </div>
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.catNavigation")} icon={<MenuIcon aria-hidden />}>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Breadcrumb
            ariaLabel={t("globals.breadcrumbAria")}
            items={[
              {
                label: t("globals.breadcrumbHome"),
                onClick: () => setBreadcrumbLeaf("library"),
              },
              ...(breadcrumbLeaf === "library"
                ? [
                    {
                      label: t("globals.breadcrumbLibrary"),
                      current: true as const,
                    },
                  ]
                : [
                    {
                      label: t("globals.breadcrumbLibrary"),
                      onClick: () => setBreadcrumbLeaf("library"),
                    },
                  ]),
              ...(breadcrumbLeaf === "folder"
                ? [
                    {
                      label: t("globals.breadcrumbFolder"),
                      current: true as const,
                    },
                  ]
                : breadcrumbLeaf === "page"
                  ? [
                      {
                        label: t("globals.breadcrumbFolder"),
                        onClick: () => setBreadcrumbLeaf("folder"),
                      },
                      {
                        label: t("globals.breadcrumbPage"),
                        current: true as const,
                      },
                    ]
                  : []),
            ]}
          />
          <SandboxHelp text={t("globals.breadcrumbHelp")} />
        </div>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Pagination
            page={page}
            pageCount={12}
            onPageChange={setPage}
            ariaLabel={t("globals.paginationAria")}
            previousAriaLabel={t("globals.paginationPrev")}
            nextAriaLabel={t("globals.paginationNext")}
            getPageAriaLabel={(n) =>
              t("globals.paginationPage").replace("{n}", String(n))
            }
          />
          <SandboxHelp text={t("globals.paginationHelp")} />
        </div>
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
        <div className="sandbox-globals-navbar">
          <NavigationBar aria-label={t("globals.navBarAria")}>
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
        <div
          className="sandbox-globals-navdrawer"
          style={{
            display: "flex",
            width: "fit-content",
            maxWidth: "100%",
            height: "14rem",
            border: "1px solid var(--fynns-color-border)",
            borderRadius: "var(--fynns-radius-md)",
            overflow: "hidden",
            background: "var(--fynns-color-app-bg)",
          }}
        >
          <NavigationDrawer
            variant="standard"
            aria-label={t("globals.navDrawerAria")}
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
            <NavigationDrawerItem
              icon={<SettingsIcon />}
              label={t("globals.navDrawerSettings")}
              active={drawerId === "settings"}
              onClick={() => setDrawerId("settings")}
            />
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
          aria-label={t("globals.navDrawerModalAria")}
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
        <div className="sandbox-globals-search-bar">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            ariaLabel={t("globals.searchBarAria")}
            placeholder={t("globals.searchBarPlaceholder")}
            clearAriaLabel={t("globals.searchBarClear")}
            expanded={searchExpanded}
            onExpandedChange={setSearchExpanded}
            onSearch={() => setSearchExpanded(false)}
          >
            {(
              [
                t("globals.searchBarResultLibs"),
                t("globals.searchBarResultDocs"),
                t("globals.searchBarResultSettings"),
              ] as const
            )
              .filter((label) =>
                searchQuery.trim()
                  ? label.toLowerCase().includes(searchQuery.trim().toLowerCase())
                  : true,
              )
              .map((label) => (
                <SearchBarResult
                  key={label}
                  onClick={() => {
                    setSearchQuery(label);
                    setSearchExpanded(false);
                  }}
                >
                  {label}
                </SearchBarResult>
              ))}
          </SearchBar>
        </div>
        <SandboxHelp text={t("globals.searchBarHelp")} />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.rhythm")} icon={<SettingsIcon aria-hidden />}>
        <SandboxHelp text={t("globals.rhythmLead")} />
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
                  {
                    value: "start",
                    label: t("globals.rhythmStart"),
                    tip: t("globals.rhythmStartTip"),
                  },
                  {
                    value: "end",
                    label: t("globals.rhythmEnd"),
                    tip: t("globals.rhythmEndTip"),
                  },
                ]}
              />
            </ControlRow>
          </ControlStack>
          <dl className="sandbox-globals-rhythm-legend">
            <div>
              <dt>
                <code>--fynns-layout-unit-stack-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenUnit")}</dd>
            </div>
            <div>
              <dt>
                <code>--fynns-layout-field-hint-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenFieldHint")}</dd>
            </div>
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
        <SandboxHelp text={t("globals.rhythmAgentHint")} />
      </GlobalsCategory>

      <GlobalsCategory title={t("globals.swatches")} icon={<BarChartIcon aria-hidden />}>
        <SandboxHelp text={t("globals.swatchesHelp")} />
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
        <SandboxHelp text={t("globals.swatchesSpecialHelp")} />
      </GlobalsCategory>
    </div>
  );
}
