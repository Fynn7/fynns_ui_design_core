import {
  Autocomplete,
  ArchiveIcon,
  Avatar,
  AvatarGroup,
  BadgedBox,
  Banner,
  BarChartIcon,
  BottomSheet,
  Breadcrumb,
  BusyRegion,
  BusyScrim,
  Button,
  useBusyTask,
  afterNextPaint,
  yieldToMain,
  runBusyTask,
  registerHighlightLanguage,
  Pagination,
  Card,
  Surface,
  Checkbox,
  ChevronRightIcon,
  Chip,
  ChipSet,
  CircularProgress,
  Chat,
  ChatCitationChip,
  ChatCitations,
  ChatComposer,
  ChatMessage,
  ChatScrollToBottom,
  ChatActivity,
  ChatActivityArtifact,
  ChatActivityStep,
  ChatThinking,
  ChatThread,
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
  formatTimeValue,
  parseTimeValue,
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
  FieldStack,
  FieldHeader,
  FileIcon,
  FolderOpenIcon,
  FullscreenDialog,
  Dialog,
  DialogShell,
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
  OtpInput,
  PlusIcon,
  PencilIcon,
  Radio,
  SaveIcon,
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
  Tooltip,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  WrenchIcon,
  ControlBlock,
  ControlRow,
  ControlStack,
  FieldHint,
  Grid,
  InfoHint,
  Slider,
  SparklesIcon,
  useOverflowBounds,
} from "@fynns/ui";
import { useEffect, useMemo, useRef, useState, useCallback, Fragment, type ReactNode } from "react";
import { useLocale, type MessageKey } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { TokenList } from "../components/TokenList";
import { splitCaptionByBackticks } from "../utils/captionSegments";
import {
  demoElementId,
  findDemoById,
  type GlobalsCategoryId,
} from "../catalog/globalsCatalog";
import {
  loadSandboxUiSession,
  patchSandboxUiSession,
} from "../state/sandboxUiSession";
import { GlobalsCatalogSearch } from "./GlobalsCatalogSearch";

/** Render sandbox chat copy with `` `code` `` → `<code>` (ChatGPT inline pill). */
function chatCaption(text: string): ReactNode {
  return splitCaptionByBackticks(text).map((seg, i) =>
    seg.code ? <code key={i}>{seg.text}</code> : <Fragment key={i}>{seg.text}</Fragment>,
  );
}

const SWATCH_KEYS = [
  { key: "xs", usesKey: "globals.swatchXsUses" },
  { key: "sm", usesKey: "globals.swatchSmUses" },
  { key: "md", usesKey: "globals.swatchMdUses" },
  { key: "lg", usesKey: "globals.swatchLgUses" },
  { key: "xl", usesKey: "globals.swatchXlUses" },
] as const satisfies ReadonlyArray<{ key: string; usesKey: MessageKey }>;

type CodeLangDemoId = "py" | "ts" | "cpp";

const CODE_LANG_DEMO: Record<
  CodeLangDemoId,
  { language: string; labelKey: MessageKey; code: string }
> = {
  ts: {
    language: "ts",
    labelKey: "globals.codeLangDemoTsFile",
    code: [
      "type Point = { x: number; y: number };",
      "",
      "export function distance(a: Point, b: Point): number {",
      "  const dx = a.x - b.x;",
      "  const dy = a.y - b.y;",
      "  // Euclidean length",
      '  return Math.sqrt(dx * dx + dy * dy);',
      "}",
    ].join("\n"),
  },
  py: {
    language: "py",
    labelKey: "globals.codeLangDemoPyFile",
    code: [
      "from dataclasses import dataclass",
      "",
      "@dataclass",
      "class Point:",
      "    x: float",
      "    y: float",
      "",
      "def distance(a: Point, b: Point) -> float:",
      "    # Euclidean length",
      "    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5",
    ].join("\n"),
  },
  cpp: {
    language: "cpp",
    labelKey: "globals.codeLangDemoCppFile",
    code: [
      "#include <cmath>",
      "#include <iostream>",
      "",
      "struct Point {",
      "  double x;",
      "  double y;",
      "};",
      "",
      "double distance(const Point& a, const Point& b) {",
      "  const double dx = a.x - b.x;",
      "  const double dy = a.y - b.y;",
      "  // Euclidean length",
      "  return std::sqrt(dx * dx + dy * dy);",
      "}",
    ].join("\n"),
  },
};

/** Minimal line-command profile (Raycaster `.gsc` shape) — not a full command table. */
const GSC_DEMO_PROFILE = {
  keywords: ["if", "else", "endif", "repeat", "endrepeat", "set", "unset"],
  commands: ["setvolume", "setrotation", "reset", "quit"],
};

const GSC_DEMO_CODE = [
  "# sample GSC-shaped DSL (registerHighlightLanguage)",
  "setvolume $vol 0.8",
  "if true",
  "  setrotation 15 0 0",
  "endif",
  "unknownCmd 1 2",
].join("\n");

/** Wave 3: live registry path — CodeBlock resolves language="gsc" via this. */
registerHighlightLanguage("gsc", GSC_DEMO_PROFILE);

/** `--fynns-code-*` roles shown next to CodeBlock demos (swatches, not inspectors). */
const CODE_TOKEN_KEYS = [
  "fg",
  "bg",
  "comment",
  "keyword",
  "string",
  "number",
  "type",
  "function",
  "variable",
  "property",
  "parameter",
  "operator",
  "module",
  "constant",
  "constant-named",
  "escape",
  "invalid",
] as const;

/**
 * Owns per-character stream text so ~28ms updates do not re-render the entire
 * GlobalsPage (76+ useState) while Communication is open.
 */
function ChatStreamingAssistant({
  streaming,
  fullText,
  idlePrompt,
  streamingLabel,
  onDone,
}: {
  streaming: boolean;
  fullText: string;
  idlePrompt: string;
  streamingLabel: string;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const fullRef = useRef(fullText);
  fullRef.current = fullText;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!streaming) return;
    setText("");
    let i = 0;
    const full = fullRef.current;
    const timer = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(timer);
        onDoneRef.current();
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [streaming]);

  return (
    <ChatMessage
      role="assistant"
      streaming={streaming}
      streamingLabel={streamingLabel}
    >
      {text || (streaming ? undefined : idlePrompt)}
    </ChatMessage>
  );
}

/** Anchor + flash target for catalog search jump. */
function GlobalsDemo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      id={demoElementId(id)}
      data-sandbox-demo={id}
      className="sandbox-globals-demo"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

/**
 * Shared FieldStack tree for `#form-recipe` — same body under Card,
 * Collapsible, and dismissible Dialog. `idPrefix` keeps htmlFor unique when
 * multiple hosts mount at once.
 */
function FormRecipeFields({
  idPrefix,
  t,
  region,
  onRegionChange,
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
  revealEmail,
  onRevealEmailToggle,
  timezone,
  onTimezoneChange,
  notes,
  onNotesChange,
  access,
  onAccessChange,
  accessOther,
  onAccessOtherChange,
  notifyEmail,
  onNotifyEmailChange,
  notifyInApp,
  onNotifyInAppChange,
  notifyDesktop,
  onNotifyDesktopChange,
  previewLength,
  onPreviewLengthChange,
  compact,
  onCompactChange,
  digests,
  onDigestsChange,
  experimental,
  onExperimentalChange,
}: {
  idPrefix: string;
  t: (key: MessageKey) => string;
  region: string;
  onRegionChange: (value: string) => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  revealEmail: boolean;
  onRevealEmailToggle: () => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  access: "anyone" | "team" | "private" | "other";
  onAccessChange: (value: "anyone" | "team" | "private" | "other") => void;
  accessOther: string;
  onAccessOtherChange: (value: string) => void;
  notifyEmail: boolean;
  onNotifyEmailChange: (value: boolean) => void;
  notifyInApp: boolean;
  onNotifyInAppChange: (value: boolean) => void;
  notifyDesktop: boolean;
  onNotifyDesktopChange: (value: boolean) => void;
  previewLength: number;
  onPreviewLengthChange: (value: number) => void;
  compact: boolean;
  onCompactChange: (value: boolean) => void;
  digests: boolean;
  onDigestsChange: (value: boolean) => void;
  experimental: boolean;
  onExperimentalChange: (value: boolean) => void;
}) {
  const regionId = `${idPrefix}-region`;
  const nameId = `${idPrefix}-display-name`;
  const emailId = `${idPrefix}-email`;
  const timezoneId = `${idPrefix}-timezone`;
  const notesId = `${idPrefix}-notes`;
  const accessName = `${idPrefix}-access`;
  const accessOtherId = `${idPrefix}-access-other`;
  const previewId = `${idPrefix}-preview-length`;
  return (
    <>
      <FieldHint>{t("globals.formRecipeIntro")}</FieldHint>
      <FieldStack>
        <FieldBlock
          label={t("globals.formRecipeRegion")}
          htmlFor={regionId}
          description={t("globals.formRecipeRegionHint")}
        >
          <Select
            id={regionId}
            ariaLabel={t("globals.formRecipeRegion")}
            options={["Europe", "Americas", "Asia Pacific"]}
            value={region}
            onChange={onRegionChange}
          />
        </FieldBlock>
        <FieldBlock label={t("globals.formRecipeDisplayName")} htmlFor={nameId}>
          <Input
            id={nameId}
            aria-label={t("globals.formRecipeDisplayName")}
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
          />
        </FieldBlock>
        <FieldBlock
          label={t("globals.formRecipeEmail")}
          htmlFor={emailId}
          actions={
            <Tooltip content={t("globals.formRecipeRevealTip")}>
              <IconButton
                size="sm"
                aria-label={t("globals.formRecipeRevealTip")}
                onClick={onRevealEmailToggle}
              >
                {revealEmail ? (
                  <EyeOffIcon aria-hidden />
                ) : (
                  <EyeIcon aria-hidden />
                )}
              </IconButton>
            </Tooltip>
          }
        >
          <Input
            id={emailId}
            aria-label={t("globals.formRecipeEmail")}
            type={revealEmail ? "text" : "password"}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            autoComplete="off"
          />
        </FieldBlock>
        <FieldBlock
          label={t("globals.formRecipeTimezone")}
          htmlFor={timezoneId}
          actions={
            <Tooltip content={t("globals.formRecipeRefreshTip")}>
              <IconButton
                size="sm"
                aria-label={t("globals.formRecipeRefreshTip")}
                onClick={() => {}}
              >
                <UndoIcon aria-hidden />
              </IconButton>
            </Tooltip>
          }
        >
          <Select
            id={timezoneId}
            ariaLabel={t("globals.formRecipeTimezone")}
            options={["UTC", "Europe/Berlin", "Asia/Shanghai"]}
            value={timezone}
            onChange={onTimezoneChange}
          />
        </FieldBlock>
        <FieldBlock
          label={t("globals.formRecipeNotes")}
          htmlFor={notesId}
          description={t("globals.formRecipeNotesHint")}
        >
          <Textarea
            id={notesId}
            aria-label={t("globals.formRecipeNotes")}
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            minRows={2}
          />
        </FieldBlock>
      </FieldStack>
      <FieldStack>
        <FieldBlock
          label={t("globals.formRecipeAccess")}
          description={t("globals.formRecipeAccessHint")}
        >
          <div
            className="fynns-control-cluster fynns-control-cluster--stack"
            role="radiogroup"
            aria-label={t("globals.formRecipeAccess")}
          >
            <Radio
              name={accessName}
              value="anyone"
              label={t("globals.formRecipeAccessAnyone")}
              checked={access === "anyone"}
              onCheckedChange={() => onAccessChange("anyone")}
            />
            <Radio
              name={accessName}
              value="team"
              label={t("globals.formRecipeAccessTeam")}
              checked={access === "team"}
              onCheckedChange={() => onAccessChange("team")}
            />
            <Radio
              name={accessName}
              value="private"
              label={t("globals.formRecipeAccessPrivate")}
              checked={access === "private"}
              onCheckedChange={() => onAccessChange("private")}
            />
            <div className="fynns-control-cluster fynns-control-cluster--choice-extra">
              <Radio
                name={accessName}
                value="other"
                label={t("globals.formRecipeAccessOther")}
                checked={access === "other"}
                onCheckedChange={() => onAccessChange("other")}
              />
              <Input
                id={accessOtherId}
                size="sm"
                aria-label={t("globals.formRecipeAccessOtherInput")}
                placeholder={t("globals.formRecipeAccessOtherPlaceholder")}
                value={accessOther}
                onChange={(event) => onAccessOtherChange(event.target.value)}
                disabled={access !== "other"}
                autoComplete="off"
              />
            </div>
          </div>
        </FieldBlock>
        <FieldBlock
          label={t("globals.formRecipeChannels")}
          description={t("globals.formRecipeChannelsHint")}
        >
          <div
            className="fynns-control-cluster fynns-control-cluster--stack"
            role="group"
            aria-label={t("globals.formRecipeChannels")}
          >
            <Checkbox
              label={t("globals.formRecipeChannelEmail")}
              checked={notifyEmail}
              onCheckedChange={onNotifyEmailChange}
            />
            <Checkbox
              label={t("globals.formRecipeChannelInApp")}
              checked={notifyInApp}
              onCheckedChange={onNotifyInAppChange}
            />
            <Checkbox
              label={t("globals.formRecipeChannelDesktop")}
              checked={notifyDesktop}
              onCheckedChange={onNotifyDesktopChange}
            />
          </div>
        </FieldBlock>
        <FieldBlock
          label={t("globals.formRecipePreviewLength")}
          htmlFor={previewId}
          description={t("globals.formRecipePreviewLengthHint")}
        >
          <Slider
            id={previewId}
            ariaLabel={t("globals.formRecipePreviewLength")}
            value={previewLength}
            onChange={onPreviewLengthChange}
            min={0}
            max={100}
          />
        </FieldBlock>
      </FieldStack>
      <FieldStack>
        <ControlBlock description={t("globals.formRecipeCompactHint")}>
          <ControlStack columns={1}>
            <ControlRow label={t("globals.formRecipeCompact")}>
              <Switch
                label=""
                ariaLabel={t("globals.formRecipeCompact")}
                checked={compact}
                onCheckedChange={onCompactChange}
              />
            </ControlRow>
          </ControlStack>
        </ControlBlock>
        <ControlBlock description={t("globals.formRecipeDigestsHint")}>
          <ControlStack columns={1}>
            <ControlRow label={t("globals.formRecipeDigests")}>
              <Switch
                label=""
                ariaLabel={t("globals.formRecipeDigests")}
                checked={digests}
                onCheckedChange={onDigestsChange}
              />
            </ControlRow>
          </ControlStack>
        </ControlBlock>
      </FieldStack>
      <Checkbox
        label={t("globals.formRecipeExperimental")}
        checked={experimental}
        onCheckedChange={onExperimentalChange}
      />
      <InlineAlert severity="info" message={t("globals.formRecipeAlert")} />
      <div className="sandbox-globals-form-recipe-actions">
        <Button variant="ghost" size="sm">
          {t("globals.formRecipeReset")}
        </Button>
        <Button size="sm">{t("globals.formRecipeSave")}</Button>
      </div>
    </>
  );
}

/** One M3 / sandbox category — Collapsible defaults to collapsed.
 * Body is a render prop and mounts only while `open`, so closed catalog
 * sections do not keep demo DOM / indeterminate progress animations alive.
 */
function GlobalsCategory({
  title,
  icon,
  open = false,
  onOpenChange,
  children,
}: {
  title: string;
  icon: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: () => ReactNode;
}) {
  return (
    <Collapsible
      title={title}
      icon={icon}
      open={open}
      onOpenChange={onOpenChange}
      className="sandbox-globals-category"
    >
      {open ? (
        <div className="sandbox-globals-section-body">{children()}</div>
      ) : null}
    </Collapsible>
  );
}

/** Live demo of `useOverflowBounds` (content ellipsis + bounds vs parent). */
function OverflowBoundsDemo() {
  const { t } = useLocale();
  const lineRef = useRef<HTMLDivElement>(null);
  const boundsParentRef = useRef<HTMLDivElement>(null);
  const boundsChildRef = useRef<HTMLDivElement>(null);
  const overflow = useOverflowBounds(lineRef, "viewport", { mode: "content" });
  const boundsOverflow = useOverflowBounds(boundsChildRef, boundsParentRef, {
    mode: "bounds",
  });
  const edges =
    [
      overflow.edges.left ? "L" : null,
      overflow.edges.right ? "R" : null,
      overflow.edges.top ? "T" : null,
      overflow.edges.bottom ? "B" : null,
    ]
      .filter(Boolean)
      .join("") || "—";
  const boundsEdges =
    [
      boundsOverflow.edges.left ? "L" : null,
      boundsOverflow.edges.right ? "R" : null,
      boundsOverflow.edges.top ? "T" : null,
      boundsOverflow.edges.bottom ? "B" : null,
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
      <div ref={boundsParentRef} className="sandbox-overflow-bounds-parent">
        <div ref={boundsChildRef} className="sandbox-overflow-bounds-child">
          {t("globals.overflowBoundsSample")}
        </div>
      </div>
      <SandboxHelp
        text={t("globals.overflowBoundsHelp", {
          overflows: boundsOverflow.overflows ? "true" : "false",
          edges: boundsEdges,
          right: String(Math.round(boundsOverflow.delta.right)),
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
export type GlobalsPageProps = {
  /** Increment from shell topbar Search to focus the catalog SearchBar. */
  searchFocusTick?: number;
};

export function GlobalsPage({ searchFocusTick = 0 }: GlobalsPageProps) {
  const { t } = useLocale();
  const [openCategories, setOpenCategories] = useState<
    Partial<Record<GlobalsCategoryId, boolean>>
  >(() => loadSandboxUiSession()?.openCategories ?? {});
  const [flashDemoId, setFlashDemoId] = useState<string | null>(null);
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
  const [sheetHalfOpen, setSheetHalfOpen] = useState(false);
  const [sheetFullOpen, setSheetFullOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerDefaultVisible, setBannerDefaultVisible] = useState(true);
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
  const [carouselHeroIndex, setCarouselHeroIndex] = useState(0);
  const [segment, setSegment] = useState<"day" | "week" | "month">("week");
  const [segmentCompact, setSegmentCompact] = useState<"list" | "grid">("list");
  const [styleMarks, setStyleMarks] = useState<Array<"bold" | "italic">>(["bold"]);
  const [sliderValue, setSliderValue] = useState(40);
  const [autoValue, setAutoValue] = useState("");
  const [autoObjValue, setAutoObjValue] = useState("");
  const [selectObjValue, setSelectObjValue] = useState("teal");
  const [otpValue, setOtpValue] = useState("");
  const [otpShortValue, setOtpShortValue] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [stepperIndex, setStepperIndex] = useState(1);
  const [stepperVerticalIndex, setStepperVerticalIndex] = useState(0);
  const [dropNames, setDropNames] = useState<string[]>([]);
  const [dropBusy, setDropBusy] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [busyRegion, setBusyRegion] = useState(false);
  const [busyRegionDeterminate, setBusyRegionDeterminate] = useState(false);
  const [busyScrimOpen, setBusyScrimOpen] = useState(false);
  const [busyScrimDeterminateOpen, setBusyScrimDeterminateOpen] = useState(false);
  const [busyPaintBad, setBusyPaintBad] = useState(false);
  const busyPaintGood = useBusyTask();
  const [busyYield, setBusyYield] = useState(false);
  const [busyRunDirect, setBusyRunDirect] = useState(false);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatStreamEpoch, setChatStreamEpoch] = useState(0);
  const [chatFailed, setChatFailed] = useState(true);
  const [chatDraft, setChatDraft] = useState("");
  const [chatComposerMultiDraft, setChatComposerMultiDraft] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  const [chatAsideDraft, setChatAsideDraft] = useState("");
  const [thinkingStreaming, setThinkingStreaming] = useState(false);
  const [thinkingDoneMs, setThinkingDoneMs] = useState<number | undefined>(4200);
  const [thinkingActionIdx, setThinkingActionIdx] = useState(0);
  const thinkingStartedAtRef = useRef(0);
  const [activityStreaming, setActivityStreaming] = useState(false);
  const [activityPhase, setActivityPhase] = useState(2);
  const stopChatStream = useCallback(() => setChatStreaming(false), []);
  const startChatStream = useCallback(() => {
    setChatStreamEpoch((n) => n + 1);
    setChatStreaming(true);
  }, []);
  const resetChatStream = useCallback(() => {
    setChatStreaming(false);
    setChatStreamEpoch((n) => n + 1);
  }, []);
  const [centeredDialogOpen, setCenteredDialogOpen] = useState(false);
  const [labeledDialogOpen, setLabeledDialogOpen] = useState(false);
  const [labeledOptA, setLabeledOptA] = useState(true);
  const [labeledOptB, setLabeledOptB] = useState(false);
  const [labeledOptC, setLabeledOptC] = useState(true);
  const [dialogShellOpen, setDialogShellOpen] = useState(false);
  const [nestedDialogOpen, setNestedDialogOpen] = useState(false);
  const [nestedPrompt, setNestedPrompt] = useState(
    "Sample multiline body for the nested Card + FieldBlock recipe.",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [codeLangDialogOpen, setCodeLangDialogOpen] = useState(false);
  const [codeLangDemo, setCodeLangDemo] = useState<"py" | "ts" | "cpp">("ts");
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [tabsId, setTabsId] = useState<"single" | "batch">("single");
  const [tabsSmId, setTabsSmId] = useState<"a" | "b" | "c">("a");
  const [textareaValue, setTextareaValue] = useState("");
  const [btnActive, setBtnActive] = useState(false);
  const [iconBtnActive, setIconBtnActive] = useState(false);
  const [switchStartOn, setSwitchStartOn] = useState(true);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [fabMenuAlignOpen, setFabMenuAlignOpen] = useState(false);
  const [menuStarred, setMenuStarred] = useState(true);
  const [menuNotify, setMenuNotify] = useState(false);
  const [rhythmShowIcon, setRhythmShowIcon] = useState(true);
  const [rhythmShowActions, setRhythmShowActions] = useState(true);
  const [rhythmDisabled, setRhythmDisabled] = useState(false);
  const [formRegion, setFormRegion] = useState("Europe");
  const [formDisplayName, setFormDisplayName] = useState("Sandbox user");
  const [formEmail, setFormEmail] = useState("demo@example.com");
  const [formRevealEmail, setFormRevealEmail] = useState(false);
  const [formTimezone, setFormTimezone] = useState("UTC");
  const [formNotes, setFormNotes] = useState("");
  const [formAccess, setFormAccess] = useState<
    "anyone" | "team" | "private" | "other"
  >("team");
  const [formAccessOther, setFormAccessOther] = useState("");
  const [formNotifyEmail, setFormNotifyEmail] = useState(true);
  const [formNotifyInApp, setFormNotifyInApp] = useState(true);
  const [formNotifyDesktop, setFormNotifyDesktop] = useState(false);
  const [formPreviewLength, setFormPreviewLength] = useState(40);
  const [formCompact, setFormCompact] = useState(false);
  const [formDigests, setFormDigests] = useState(true);
  const [formExperimental, setFormExperimental] = useState(true);
  const [formRecipeCollapsibleOpen, setFormRecipeCollapsibleOpen] =
    useState(true);
  const [formRecipeDialogOpen, setFormRecipeDialogOpen] = useState(false);
  const formRecipeFieldProps = {
    t,
    region: formRegion,
    onRegionChange: setFormRegion,
    displayName: formDisplayName,
    onDisplayNameChange: setFormDisplayName,
    email: formEmail,
    onEmailChange: setFormEmail,
    revealEmail: formRevealEmail,
    onRevealEmailToggle: () => setFormRevealEmail((v) => !v),
    timezone: formTimezone,
    onTimezoneChange: setFormTimezone,
    notes: formNotes,
    onNotesChange: setFormNotes,
    access: formAccess,
    onAccessChange: setFormAccess,
    accessOther: formAccessOther,
    onAccessOtherChange: setFormAccessOther,
    notifyEmail: formNotifyEmail,
    onNotifyEmailChange: setFormNotifyEmail,
    notifyInApp: formNotifyInApp,
    onNotifyInAppChange: setFormNotifyInApp,
    notifyDesktop: formNotifyDesktop,
    onNotifyDesktopChange: setFormNotifyDesktop,
    previewLength: formPreviewLength,
    onPreviewLengthChange: setFormPreviewLength,
    compact: formCompact,
    onCompactChange: setFormCompact,
    digests: formDigests,
    onDigestsChange: setFormDigests,
    experimental: formExperimental,
    onExperimentalChange: setFormExperimental,
  };

  useEffect(() => {
    if (!busyScrimOpen) return;
    const timer = window.setTimeout(() => setBusyScrimOpen(false), 2000);
    return () => window.clearTimeout(timer);
  }, [busyScrimOpen]);

  useEffect(() => {
    if (!busyScrimDeterminateOpen) return;
    const timer = window.setTimeout(() => setBusyScrimDeterminateOpen(false), 2000);
    return () => window.clearTimeout(timer);
  }, [busyScrimDeterminateOpen]);

  useEffect(() => {
    if (!thinkingStreaming) return;
    // Long enough to cycle several dummy agent activities.
    const timer = window.setTimeout(() => {
      setThinkingDoneMs(Date.now() - thinkingStartedAtRef.current);
      setThinkingStreaming(false);
    }, 7200);
    return () => window.clearTimeout(timer);
  }, [thinkingStreaming]);

  const thinkingActions = useMemo(
    () => [
      t("globals.thinkingActionThink"),
      t("globals.thinkingActionSearch"),
      t("globals.thinkingActionRead"),
      t("globals.thinkingActionCheck"),
      t("globals.thinkingActionDraft"),
    ],
    [t],
  );

  useEffect(() => {
    if (!thinkingStreaming) {
      setThinkingActionIdx(0);
      return;
    }
    // ~presentation-hint dwell between activity label swaps.
    const timer = window.setInterval(() => {
      setThinkingActionIdx((idx) => (idx + 1) % thinkingActions.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [thinkingStreaming, thinkingActions.length]);

  const thinkingStreamingLabel =
    thinkingActions[thinkingActionIdx] ?? t("globals.thinkingStreaming");

  useEffect(() => {
    if (!activityStreaming) return;
    const timer = window.setInterval(() => {
      setActivityPhase((phase) => {
        if (phase >= 3) {
          setActivityStreaming(false);
          return 3;
        }
        return phase + 1;
      });
    }, 1600);
    return () => window.clearInterval(timer);
  }, [activityStreaming]);

  const activityHeader =
    activityPhase <= 0
      ? t("globals.activityHeaderStart")
      : activityPhase === 1
        ? t("globals.activityHeaderMemory")
        : activityPhase === 2
          ? t("globals.activityHeaderPlan")
          : t("globals.activityHeaderDone");

  useEffect(() => {
    if (!flashDemoId) return;
    const el = document.getElementById(demoElementId(flashDemoId));
    el?.classList.add("sandbox-globals-demo--flash");
    const timer = window.setTimeout(() => {
      el?.classList.remove("sandbox-globals-demo--flash");
      setFlashDemoId(null);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
      el?.classList.remove("sandbox-globals-demo--flash");
    };
  }, [flashDemoId]);

  const focusDemo = (demoId: string) => {
    const entry = findDemoById(demoId);
    if (!entry) return;
    setOpenCategories((prev) => ({ ...prev, [entry.categoryId]: true }));
    // Wait for Collapsible expand (`--fynns-duration-base` = 240ms) before scroll.
    window.setTimeout(() => {
      const el = document.getElementById(demoElementId(demoId));
      if (!el) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      el.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      });
      el.setAttribute("aria-label", entry.label);
      el.focus({ preventScroll: true });
      setFlashDemoId(demoId);
    }, 250);
  };

  const setCategoryOpen = (id: GlobalsCategoryId, open: boolean) => {
    setOpenCategories((prev) => ({ ...prev, [id]: open }));
  };

  useEffect(() => {
    patchSandboxUiSession({ openCategories });
  }, [openCategories]);

  const nestedPromptDefault =
    "Sample multiline body for the nested Card + FieldBlock recipe.";

  /** Host-agnostic section recipe — reuse inline or inside Dialog/Drawer. */
  const renderNestedPromptSection = (fieldId: string) => (
    <Card title={t("globals.nestedDialogTitle")}>
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
    </Card>
  );

  return (
    <div className="sandbox-globals">
      <SkipLink href="#globals-content" label={t("globals.skipLink")} />
      <div id="globals-content" className="sandbox-globals-content" tabIndex={-1}>
      <p className="sandbox-globals-lead">{t("globals.lead")}</p>
        <SandboxHelp text={t("globals.skipLinkHelp")} />
        <GlobalsDemo id="skip-link">
          <div className="sandbox-skip-link-teach">
            <SkipLink href="#globals-content" label={t("globals.skipLinkTeach")} />
          </div>
          <SandboxHelp text={t("globals.skipLinkTeachHelp")} />
        </GlobalsDemo>

        <GlobalsCatalogSearch
          searchFocusTick={searchFocusTick}
          onFocusDemo={focusDemo}
        />

        <GlobalsCategory
          title={t("globals.catActions")}
          icon={<PlusIcon aria-hidden />}
          open={openCategories.actions ?? false}
          onOpenChange={(open) => setCategoryOpen("actions", open)}
        >
        {() => (
          <>
        <GlobalsDemo id="button">
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
        </GlobalsDemo>
        <GlobalsDemo id="split-button">
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
          <SplitButton
            size="lg"
            label={t("globals.splitBtnLarge")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() => {}}
          >
            <DropdownMenuItem onClick={() => {}}>{t("globals.splitBtnOptionA")}</DropdownMenuItem>
          </SplitButton>
          <SplitButton
            disabled
            label={t("globals.splitBtnDisabled")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() => {}}
          >
            <DropdownMenuItem onClick={() => {}}>{t("globals.splitBtnOptionA")}</DropdownMenuItem>
          </SplitButton>
          <SplitButton
            loading
            label={t("globals.splitBtnLoading")}
            menuAriaLabel={t("globals.splitBtnMenuAria")}
            onMainClick={() => {}}
          >
            <DropdownMenuItem onClick={() => {}}>{t("globals.splitBtnOptionA")}</DropdownMenuItem>
          </SplitButton>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="icon-button">
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
          <Tooltip content={t("globals.iconBtnElevated")}>
            <IconButton variant="elevated" aria-label={t("globals.iconBtnElevated")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnLoading")}>
            <IconButton loading aria-label={t("globals.iconBtnLoading")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnDisabled")}>
            <IconButton disabled aria-label={t("globals.iconBtnDisabled")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
          <Tooltip content={t("globals.iconBtnActive")}>
            <IconButton
              active={iconBtnActive}
              aria-label={t("globals.iconBtnActive")}
              onClick={() => setIconBtnActive((v) => !v)}
            >
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="info-hint">
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
        </GlobalsDemo>
        <GlobalsDemo id="fab">
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
          <Tooltip content={t("globals.fabLarge")}>
            <Fab size="lg" aria-label={t("globals.fabLarge")}>
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
          <FabMenu
            ariaLabel={t("globals.fabMenuAlignOpen")}
            closeAriaLabel={t("globals.fabMenuClose")}
            expanded={fabMenuAlignOpen}
            onExpandedChange={setFabMenuAlignOpen}
            variant="tertiary"
            itemVariant="surface"
            align="start"
          >
            <FabMenuItem icon={<FileIcon />} label={t("globals.fabMenuFile")} />
            <FabMenuItem icon={<FolderOpenIcon />} label={t("globals.fabMenuFolder")} />
          </FabMenu>
        </div>
        <SandboxHelp text={t("globals.fabHelp")} />
        <TokenList group="fab" title={t("globals.tokenListFab")} />
        <TokenList group="fabmenu" title={t("globals.tokenListFabMenu")} />
        </GlobalsDemo>
        <GlobalsDemo id="menu">
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
        </GlobalsDemo>
        <GlobalsDemo id="context-menu">
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
        </div>
        <SandboxHelp text={t("globals.contextMenuHelp")} />
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catTextInputs")}
        icon={<PencilIcon aria-hidden />}
        open={openCategories.textInputs ?? false}
        onOpenChange={(open) => setCategoryOpen("textInputs", open)}
      >
        {() => (
          <>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
        <GlobalsDemo id="input">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Input placeholder={t("globals.inputPlaceholder")} aria-label={t("globals.inputAria")} />
            <Input
              variant="filled"
              size="sm"
              leading={<SettingsIcon aria-hidden />}
              placeholder={t("globals.inputFilledPlaceholder")}
              aria-label={t("globals.inputFilledAria")}
              supportingText={t("globals.inputFilledSupporting")}
            />
            <Input
              invalid
              errorText={t("globals.inputError")}
              placeholder={t("globals.inputInvalidPlaceholder")}
              aria-label={t("globals.inputInvalidAria")}
            />
          </div>
        </GlobalsDemo>
        <GlobalsDemo id="select">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Select
            ariaLabel={t("globals.selectAria")}
            value="one"
            options={["one", "two", "three"]}
            onChange={() => {}}
          />
            <Select
              ariaLabel={t("globals.selectObjectAria")}
              value={selectObjValue}
              options={[
                { value: "teal", label: t("globals.autocompleteOptTeal") },
                { value: "cyan", label: t("globals.autocompleteOptCyan") },
                { value: "blue", label: t("globals.autocompleteOptBlue"), disabled: true },
              ]}
              onChange={setSelectObjValue}
            />
            <Select
              disabled
              ariaLabel={t("globals.selectDisabledAria")}
              value="one"
              options={["one", "two"]}
              onChange={() => {}}
            />
            <SandboxHelp text={t("globals.selectHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="autocomplete">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
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
              supportingText={
                autoValue
                  ? t("globals.autocompleteSelected", { value: autoValue })
                  : t("globals.autocompleteSupporting")
              }
            />
            <Autocomplete
              ariaLabel={t("globals.autocompleteObjectAria")}
              placeholder={t("globals.autocompleteObjectPlaceholder")}
              emptyText={t("globals.autocompleteEmpty")}
              value={autoObjValue}
              onChange={setAutoObjValue}
              options={[
                { value: "teal", label: t("globals.autocompleteOptTeal") },
                { value: "cyan", label: t("globals.autocompleteOptCyan") },
                { value: "blue", label: t("globals.autocompleteOptBlue"), disabled: true },
              ]}
              errorText={autoObjValue === "cyan" ? t("globals.autocompleteError") : undefined}
            />
            <Autocomplete
              disabled
              ariaLabel={t("globals.autocompleteDisabledAria")}
              value=""
              onChange={() => {}}
              options={[t("globals.autocompleteOptTeal")]}
              placeholder={t("globals.autocompleteDisabledPlaceholder")}
            />
            <SandboxHelp text={t("globals.autocompleteHelp")} />
          </div>
        </GlobalsDemo>
        <GlobalsDemo id="otp">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              ariaLabel={t("globals.otpAria")}
              supportingText={t("globals.otpSupporting")}
            />
            <OtpInput
              length={4}
              value={otpShortValue}
              onChange={setOtpShortValue}
              ariaLabel={t("globals.otpShortAria")}
              errorText={t("globals.otpError")}
              invalid
            />
            <OtpInput
              length={4}
              value="12"
              onChange={() => {}}
              disabled
              ariaLabel={t("globals.otpDisabledAria")}
              supportingText={t("globals.otpDisabledSupporting")}
            />
            <SandboxHelp text={t("globals.otpHelp")} />
          </div>
        </GlobalsDemo>
        <GlobalsDemo id="password">
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
        </GlobalsDemo>
        <GlobalsDemo id="textarea">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
            <Textarea
              value={textareaValue}
              onChange={(event) => setTextareaValue(event.target.value)}
              placeholder={t("globals.textareaPlaceholder")}
              aria-label={t("globals.textareaAria")}
              supportingText={t("globals.textareaSupporting")}
              rows={4}
            />
            <Textarea
              variant="filled"
              size="sm"
              defaultValue=""
              placeholder={t("globals.textareaFilledPlaceholder")}
              aria-label={t("globals.textareaFilledAria")}
              errorText={t("globals.textareaError")}
              rows={3}
            />
            <SandboxHelp text={t("globals.textareaHelp")} />
          </div>
        </GlobalsDemo>
        </div>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catTabs")}
        icon={<LayoutGridIcon aria-hidden />}
        open={openCategories.tabs ?? false}
        onOpenChange={(open) => setCategoryOpen("tabs", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="tabs">
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
        <Tabs
          size="sm"
          ariaLabel={t("globals.tabsSmAria")}
          tabs={[
            { id: "a", label: t("globals.tabsSmA") },
            { id: "b", label: t("globals.tabsSmB") },
            { id: "c", label: t("globals.tabsSmDisabled"), disabled: true },
          ]}
          activeId={tabsSmId}
          onChange={setTabsSmId}
        />
        <SandboxHelp text={t("globals.tabsHelp")} />
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catSelection")}
        icon={<ClipboardIcon aria-hidden />}
        open={openCategories.selection ?? false}
        onOpenChange={(open) => setCategoryOpen("selection", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="switch">
        <div className="sandbox-globals-row">
          <Switch
            labelSide="end"
            label={t("globals.switchPill")}
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
          <Switch
            labelSide="start"
            label={t("globals.switchLabelStart")}
            checked={switchStartOn}
            onCheckedChange={setSwitchStartOn}
          />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="checkbox">
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
          <Checkbox label={t("globals.checkboxInvalid")} invalid checked={false} onCheckedChange={() => {}} />
          <Checkbox
            label={t("globals.checkboxDisabled")}
            disabled
            checked
            onCheckedChange={() => {}}
          />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="radio">
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
            <Radio
              name="sandbox-globals-radio-invalid"
              value="bad"
              label={t("globals.radioInvalid")}
              invalid
              checked={false}
              onCheckedChange={() => {}}
            />
            <Radio
              name="sandbox-globals-radio-disabled"
              value="off"
              label={t("globals.radioDisabled")}
              disabled
              checked
              onCheckedChange={() => {}}
            />
          </div>
        </GlobalsDemo>
        <GlobalsDemo id="chip">
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
            <Chip leadingIcon={<SparklesIcon aria-hidden />} onClick={() => {}}>
              {t("globals.chipLeading")}
            </Chip>
            <Chip trailingIcon={<ChevronRightIcon aria-hidden />} onClick={() => {}}>
              {t("globals.chipTrailing")}
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
        </GlobalsDemo>
        <GlobalsDemo id="toggle-group">
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
          <ToggleGroup
            size="compact"
            showCheck={false}
            ariaLabel={t("globals.segmentedCompactAria")}
            value={segmentCompact}
            onChange={setSegmentCompact}
            options={[
              { value: "list", label: t("globals.segmentedList"), icon: <LayoutGridIcon aria-hidden /> },
              { value: "grid", label: t("globals.segmentedGrid"), icon: <BarChartIcon aria-hidden /> },
            ]}
          />
          <SandboxHelp text={t("globals.segmentedCompactHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="slider">
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
        </GlobalsDemo>
        <GlobalsDemo id="date-picker">
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
        </GlobalsDemo>
        <GlobalsDemo id="overflow-bounds">
          <OverflowBoundsDemo />
        </GlobalsDemo>
        <GlobalsDemo id="date-range-picker">
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
        </GlobalsDemo>
        <GlobalsDemo id="time-picker">
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
          <SandboxHelp
            text={(() => {
              const parts = parseTimeValue(pickedTime);
              return parts
                ? `formatTimeValue/parseTimeValue: ${JSON.stringify(parts)} → ${formatTimeValue(parts.hours, parts.minutes)}`
                : "formatTimeValue/parseTimeValue: —";
            })()}
          />
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
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catCommunication")}
        icon={<InfoIcon aria-hidden />}
        open={openCategories.communication ?? false}
        onOpenChange={(open) => setCategoryOpen("communication", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="progress">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp as="span" text={t("globals.progressLinear")} />
          <LinearProgress value={0.42} label={t("globals.progressLinearAria")} />
          <SandboxHelp as="span" text={t("globals.progressLinearNoStop")} />
          <LinearProgress
            value={0.42}
            stopIndicator={false}
            label={t("globals.progressLinearNoStopAria")}
          />
          <SandboxHelp as="span" text={t("globals.progressLinearIndeterminate")} />
          <LinearProgress label={t("globals.progressLinearIndeterminateAria")} />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <CircularProgress value={0.65} label={t("globals.progressCircularAria")} size="sm" />
            <CircularProgress label={t("globals.progressCircularIndeterminateAria")} />
            <CircularProgress value={0.2} label={t("globals.progressCircularAria")} size="lg" />
          </div>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="banner">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
        {bannerDefaultVisible ? (
          <div className="sandbox-globals-banner">
            <Banner
              variant="default"
              text={t("globals.bannerDefaultText")}
              supportingText={t("globals.bannerDefaultSupporting")}
            />
          </div>
        ) : null}
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
        <Button size="sm" variant="ghost" onClick={() => setBannerDefaultVisible((v) => !v)}>
          {bannerDefaultVisible ? t("globals.bannerHideDefault") : t("globals.bannerShowDefault")}
        </Button>
        <SandboxHelp text={t("globals.bannerHelp")} />
        <TokenList group="banner" title={t("globals.tokenListBanner")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="inline-alert">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <InlineAlert severity="info" message={t("globals.inlineAlertInfo")} />
          <InlineAlert severity="success" message={t("globals.inlineAlertSuccess")} />
          <InlineAlert severity="warning" message={t("globals.inlineAlertWarning")} />
          <InlineAlert severity="error" message={t("globals.inlineAlertError")} />
          <InlineAlert severity="success" message={t("globals.inlineAlertWrap")} />
        </div>
        <SandboxHelp text={t("globals.inlineAlertHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="snackbar">
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
        </GlobalsDemo>
        <GlobalsDemo id="chat">
        <div className="sandbox-globals-row sandbox-chat-dual">
          <div className="sandbox-chat-main">
            <Chat label={t("globals.chatLabel")} className="sandbox-chat-frame">
              <ChatThread empty={<EmptyState title={t("globals.chatEmpty")} />}>
                <ChatMessage role="system">{t("globals.chatSystem")}</ChatMessage>
                <ChatMessage role="user">
                  {chatCaption(t("globals.chatUserBody"))}
                </ChatMessage>
                <ChatMessage
                  role="assistant"
                  citations={[
                    {
                      id: "reuters",
                      publisher: t("globals.chatCiteReuters"),
                      href: "https://www.reuters.com/",
                      title: t("globals.chatCiteReutersTitle"),
                      snippet: t("globals.chatCiteReutersSnippet"),
                    },
                    {
                      id: "ap",
                      publisher: t("globals.chatCiteAp"),
                      href: "https://apnews.com/",
                      title: t("globals.chatCiteApTitle"),
                      snippet: t("globals.chatCiteApSnippet"),
                    },
                    {
                      id: "bbc",
                      publisher: t("globals.chatCiteBbc"),
                      href: "https://www.bbc.com/news",
                      title: t("globals.chatCiteBbcTitle"),
                      snippet: t("globals.chatCiteBbcSnippet"),
                    },
                    {
                      id: "nyt",
                      publisher: t("globals.chatCiteNyt"),
                      href: "https://www.nytimes.com/",
                      title: t("globals.chatCiteNytTitle"),
                      snippet: t("globals.chatCiteNytSnippet"),
                    },
                  ]}
                  citationsLabel={t("globals.chatCitationsLabel")}
                  citationsVisibleCount={3}
                  actions={
                    <Tooltip content={t("globals.chatCopyTip")}>
                      <IconButton size="sm" aria-label={t("globals.chatCopyTip")}>
                        <ClipboardIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  {chatCaption(t("globals.chatAssistantBody"))}
                </ChatMessage>
                <ChatStreamingAssistant
                  key={chatStreamEpoch}
                  streaming={chatStreaming}
                  fullText={t("globals.chatStreamFull")}
                  idlePrompt={t("globals.chatStreamPrompt")}
                  streamingLabel={t("globals.chatStreamingLabel")}
                  onDone={stopChatStream}
                />
                <ChatMessage
                  role="assistant"
                  error={chatFailed ? t("globals.chatError") : undefined}
                  onRetry={
                    chatFailed ? () => setChatFailed(false) : undefined
                  }
                  retryLabel={t("globals.chatRetry")}
                  actions={
                    chatFailed ? undefined : (
                      <Tooltip content={t("globals.chatCopyTip")}>
                        <IconButton
                          size="sm"
                          aria-label={t("globals.chatCopyTip")}
                        >
                          <ClipboardIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  {chatFailed ? undefined : t("globals.chatRetrySuccess")}
                </ChatMessage>
              </ChatThread>
              <ChatScrollToBottom label={t("globals.chatScrollBottom")} />
              <ChatComposer
                value={chatDraft}
                onChange={setChatDraft}
                ariaLabel={t("globals.chatComposerAria")}
                placeholder={t("globals.chatComposerPlaceholder")}
                busy={chatStreaming}
                onStop={stopChatStream}
                onSubmit={() => {
                  startChatStream();
                  setChatDraft("");
                }}
                sendLabel={t("globals.chatSend")}
                stopLabel={t("globals.chatStop")}
                leading={
                  <Tooltip content={t("globals.chatComposerLeadingTip")}>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={t("globals.chatComposerLeadingTip")}
                    >
                      <PlusIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
            </Chat>
            <div className="sandbox-globals-row">
              <Button
                size="sm"
                disabled={chatStreaming}
                onClick={startChatStream}
              >
                {t("globals.chatStreamStart")}
              </Button>
              <Button
                size="sm"
                variant="tonal"
                onClick={resetChatStream}
              >
                {t("globals.chatStreamReset")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={chatFailed}
                onClick={() => setChatFailed(true)}
              >
                {t("globals.chatFailDemo")}
              </Button>
            </div>
          </div>
          <div className="fynns-chat-host--fill sandbox-chat-aside">
            <p className="sandbox-chat-aside-label">{t("globals.chatAsideLabel")}</p>
            <Chat label={t("globals.chatAsideLabel")} className="sandbox-chat-frame sandbox-chat-frame--aside">
              <ChatThread>
                <ChatMessage role="user">
                  {t("globals.chatAsideUserBody")}
                </ChatMessage>
                <ChatMessage role="assistant">
                  {t("globals.chatAsideAssistantBody")}
                </ChatMessage>
              </ChatThread>
              <ChatComposer
                value={chatAsideDraft}
                onChange={setChatAsideDraft}
                ariaLabel={t("globals.chatAsideComposerAria")}
                placeholder={t("globals.chatAsideComposerPlaceholder")}
                onSubmit={() => setChatAsideDraft("")}
                leading={null}
              />
            </Chat>
          </div>
        </div>
        <p className="sandbox-chat-aside-label">{t("globals.chatComposerMultiLabel")}</p>
        <ChatComposer
          value={chatComposerMultiDraft}
          onChange={setChatComposerMultiDraft}
          ariaLabel={t("globals.chatComposerMultiAria")}
          placeholder={t("globals.chatComposerPlaceholder")}
          onSubmit={() => setChatComposerMultiDraft("")}
          sendLabel={t("globals.chatSend")}
          leading={
            <Tooltip content={t("globals.chatComposerLeadingTip")}>
              <IconButton
                type="button"
                size="sm"
                variant="ghost"
                aria-label={t("globals.chatComposerLeadingTip")}
              >
                <PlusIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <SandboxHelp text={t("globals.chatComposerMultiHelp")} />
        <SandboxHelp text={t("globals.chatHelp")} />
        <TokenList group="chat" title={t("globals.tokenListChat")} />
        <TokenList group="chatmessage" title={t("globals.tokenListChatMessage")} />
        </GlobalsDemo>
        <GlobalsDemo id="thinking">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp text={t("globals.thinkingActionsHelp")} />
          <div className="sandbox-globals-row sandbox-globals-row--stack sandbox-globals-thinking-actions">
            {thinkingActions.map((action) => (
              <ChatThinking
                key={action}
                streaming
                streamingLabel={action}
              />
            ))}
          </div>
          <ChatThinking
            durationMs={3800}
            streamingLabel={t("globals.thinkingStreaming")}
            durationLabel={(n) => t("globals.thinkingDuration").replace("{n}", String(n))}
          />
          <ChatMessage
            role="assistant"
            thinking={
              <ChatThinking
                streaming={thinkingStreaming}
                durationMs={thinkingStreaming ? undefined : thinkingDoneMs}
                streamingLabel={thinkingStreamingLabel}
                label={t("globals.thinkingLabel")}
                durationLabel={(n) => t("globals.thinkingDuration").replace("{n}", String(n))}
              >
                {t("globals.thinkingBody")}
              </ChatThinking>
            }
          >
            {thinkingStreaming
              ? undefined
              : t("globals.thinkingAnswer")}
          </ChatMessage>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              disabled={thinkingStreaming}
              onClick={() => {
                thinkingStartedAtRef.current = Date.now();
                setThinkingDoneMs(undefined);
                setThinkingActionIdx(0);
                setThinkingStreaming(true);
              }}
            >
              {t("globals.thinkingSimulate")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              disabled={thinkingStreaming}
              onClick={() => {
                setThinkingStreaming(false);
                setThinkingDoneMs(4200);
                setThinkingActionIdx(0);
              }}
            >
              {t("globals.thinkingReset")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.thinkingHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="activity">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <ChatMessage
            role="assistant"
            thinking={
              <ChatActivity
                label={activityHeader}
                streaming={activityStreaming}
                defaultOpen
              >
                {activityPhase >= 1 ? (
                  <ChatActivityStep
                    status="done"
                    icon={<WrenchIcon />}
                    label={t("globals.activityStepCreate")}
                    artifact={
                      <ChatActivityArtifact>
                        {t("globals.activityArtifactPlan")}
                      </ChatActivityArtifact>
                    }
                  />
                ) : null}
                {activityPhase >= 2 ? (
                  <ChatActivityStep
                    status="done"
                    icon={<WrenchIcon />}
                    label={t("globals.activityStepUpdate")}
                    artifact={
                      <ChatActivityArtifact>
                        {t("globals.activityArtifactPlan")}
                      </ChatActivityArtifact>
                    }
                  />
                ) : null}
                {activityPhase >= 3 ? (
                  <ChatActivityStep
                    status="done"
                    label={t("globals.activityStepPresentDone")}
                  />
                ) : (
                  <ChatActivityStep
                    status="active"
                    label={
                      activityPhase <= 0
                        ? t("globals.activityStepGather")
                        : activityPhase === 1
                          ? t("globals.activityStepRead")
                          : t("globals.activityStepPresent")
                    }
                    description={
                      activityPhase >= 2 ? (
                        <>
                          {t("globals.activityStepPresentDescBefore")}
                          <code>{t("globals.activityStepPresentCode")}</code>
                          {t("globals.activityStepPresentDescAfter")}
                        </>
                      ) : activityPhase === 1 ? (
                        t("globals.activityStepReadDesc")
                      ) : (
                        t("globals.activityStepGatherDesc")
                      )
                    }
                  />
                )}
              </ChatActivity>
            }
          >
            {activityStreaming ? undefined : t("globals.activityAnswer")}
          </ChatMessage>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              disabled={activityStreaming}
              onClick={() => {
                setActivityPhase(0);
                setActivityStreaming(true);
              }}
            >
              {t("globals.activitySimulate")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              disabled={activityStreaming}
              onClick={() => {
                setActivityStreaming(false);
                setActivityPhase(3);
              }}
            >
              {t("globals.activityReset")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.activityHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="chat-citations">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <ChatCitationChip
            citation={{
              id: "inline-reuters",
              publisher: t("globals.chatCiteReuters"),
              href: "https://www.reuters.com/",
              title: t("globals.chatCiteReutersTitle"),
              snippet: t("globals.chatCiteReutersSnippet"),
            }}
          />
          <ChatCitations
            label={t("globals.chatCitationsLabel")}
            visibleCount={2}
            citations={[
              {
                id: "s1",
                publisher: t("globals.chatCiteReuters"),
                href: "https://www.reuters.com/",
                title: t("globals.chatCiteReutersTitle"),
                snippet: t("globals.chatCiteReutersSnippet"),
              },
              {
                id: "s2",
                publisher: t("globals.chatCiteAp"),
                href: "https://apnews.com/",
                title: t("globals.chatCiteApTitle"),
                snippet: t("globals.chatCiteApSnippet"),
              },
              {
                id: "s3",
                publisher: t("globals.chatCiteBbc"),
                href: "https://www.bbc.com/news",
                title: t("globals.chatCiteBbcTitle"),
                snippet: t("globals.chatCiteBbcSnippet"),
              },
            ]}
          />
          <SandboxHelp text={t("globals.chatCitationsAnatomyHelp")} />
        </div>
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catContainment")}
        icon={<FolderOpenIcon aria-hidden />}
        open={openCategories.containment ?? false}
        onOpenChange={(open) => setCategoryOpen("containment", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="carousel">
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
          <Carousel
            ariaLabel={t("globals.carouselHeroAria")}
            variant="hero"
            index={carouselHeroIndex}
            onIndexChange={setCarouselHeroIndex}
            prevAriaLabel={t("globals.carouselPrev")}
            nextAriaLabel={t("globals.carouselNext")}
          >
            <CarouselItem label={t("globals.carouselHeroSlide1")}>
              <strong>{t("globals.carouselHeroSlide1")}</strong>
              <SandboxHelp as="span" text={t("globals.carouselHeroSlide1Body")} />
            </CarouselItem>
            <CarouselItem label={t("globals.carouselHeroSlide2")}>
              <strong>{t("globals.carouselHeroSlide2")}</strong>
              <SandboxHelp as="span" text={t("globals.carouselHeroSlide2Body")} />
            </CarouselItem>
          </Carousel>
          <SandboxHelp text={t("globals.carouselHeroHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="avatar">
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
        </GlobalsDemo>
        <GlobalsDemo id="badged-box">
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
        </GlobalsDemo>
        <GlobalsDemo id="list">
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
            <Divider inset />
            <ListItem
              headline={t("globals.listDisabled")}
              supportingText={t("globals.listDisabledSupporting")}
              leading={<ArchiveIcon />}
              disabled
              onClick={() => {}}
            />
          </List>
        </div>
        <SandboxHelp text={t("globals.listHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="divider">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp as="span" text={t("globals.dividerFull")} />
          <Divider />
          <SandboxHelp as="span" text={t("globals.dividerInset")} />
          <Divider inset />
          <SandboxHelp as="span" text={t("globals.dividerInsetStart")} />
          <Divider insetStart />
          <SandboxHelp as="span" text={t("globals.dividerInsetEnd")} />
          <Divider insetEnd />
          <div
            className="sandbox-globals-row"
            style={{ alignItems: "stretch", height: "var(--fynns-space-2xl)" }}
          >
            <SandboxHelp as="span" text={t("globals.dividerVerticalA")} />
            <Divider orientation="vertical" />
            <SandboxHelp as="span" text={t("globals.dividerVerticalB")} />
          </div>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="card">
        <div className="sandbox-globals-cards">
          <Card
            className="sandbox-globals-card"
            title={t("globals.cardTitle")}
            icon={<FolderOpenIcon aria-hidden />}
            actions={
              <Tooltip content={t("globals.cardActionTip")}>
                <IconButton aria-label={t("globals.cardActionAria")}>
                  <SettingsIcon size={16} aria-hidden />
                </IconButton>
              </Tooltip>
            }
          >
            {t("globals.cardBody")}
            </Card>
          <Card className="sandbox-globals-card" title={t("globals.cardTitlePlain")}>
            {t("globals.cardBody")}
          </Card>
          <Card
            className="sandbox-globals-card"
            title={t("globals.cardChromePlainTitle")}
            chrome="plain"
          >
            <Surface fill padded style={{ minHeight: "3.5rem" }}>
              <SandboxHelp as="span" text={t("globals.cardChromePlainBody")} />
            </Surface>
            <p
              style={{
                margin: 0,
                color: "var(--fynns-color-text-muted)",
                fontSize: "var(--fynns-font-size-sm)",
                lineHeight: "var(--fynns-line-height-normal)",
              }}
            >
              {t("globals.cardChromePlainNote")}
            </p>
          </Card>
        </div>
        <SandboxHelp text={t("globals.cardChromeHelp")} />
        </GlobalsDemo>
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          {renderNestedPromptSection("sandbox-nested-prompt")}
          <SandboxHelp text={t("globals.nestedSectionHelp")} />
        </div>
        <GlobalsDemo id="surface">
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
          <div className="sandbox-globals-row" style={{ alignItems: "stretch", flexWrap: "wrap" }}>
            <Surface variant="outlined" padded style={{ minWidth: "8rem" }}>
              <SandboxHelp as="span" text={t("globals.surfaceOutlined")} />
            </Surface>
            <Surface variant="filled" padded style={{ minWidth: "8rem" }}>
              <SandboxHelp as="span" text={t("globals.surfaceFilled")} />
            </Surface>
            <Surface variant="elevated" padded style={{ minWidth: "8rem" }}>
              <SandboxHelp as="span" text={t("globals.surfaceElevated")} />
            </Surface>
          </div>
          <div className="sandbox-surface-fill-host">
            <Surface fill variant="filled" style={{ alignItems: "center", justifyContent: "center" }}>
              <p
                style={{
                  margin: 0,
                  color: "var(--fynns-color-text-muted)",
                  fontSize: "var(--fynns-font-size-sm)",
                }}
              >
                {t("globals.surfaceFillLabel")}
              </p>
            </Surface>
          </div>
          <SandboxHelp text={t("globals.surfaceHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="field-header">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <FieldHeader
            label={t("globals.fieldHeaderLabel")}
            htmlFor="sandbox-field-header-demo"
            actions={
              <Tooltip content={t("globals.fieldHeaderActionTip")}>
                <IconButton size="sm" aria-label={t("globals.fieldHeaderActionTip")}>
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <Input
            id="sandbox-field-header-demo"
            placeholder={t("globals.fieldHeaderPlaceholder")}
            aria-label={t("globals.fieldHeaderLabel")}
          />
          <SandboxHelp text={t("globals.fieldHeaderHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="collapsible">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Collapsible
            title={t("globals.collapsible")}
            icon={<FolderOpenIcon aria-hidden />}
            open={collapsibleOpen}
            onOpenChange={setCollapsibleOpen}
            actions={
              <Tooltip content={t("globals.collapsibleActionTip")}>
                <IconButton size="sm" aria-label={t("globals.collapsibleActionTip")}>
                  <SettingsIcon size={16} aria-hidden />
                </IconButton>
              </Tooltip>
            }
          >
            <SandboxHelp text={t("globals.collapsibleBody")} />
        </Collapsible>
          <Collapsible
            title={t("globals.collapsibleChromePlainTitle")}
            chrome="plain"
            defaultOpen
            icon={<FolderOpenIcon aria-hidden />}
          >
            <CodeBlock
              variant="plain"
              language="gsc"
              copyAriaLabel={t("globals.codeBlockCopy")}
              code={`setdir output/demo\nresize 512 512\nscreenshot out.png\n`}
              maxHeight="6rem"
            />
            <CodeBlock
              variant="plain"
              language="bash"
              copyAriaLabel={t("globals.codeBlockCopy")}
              code={`# sibling well — same nest-gap as above\nnpm run sandbox\n`}
              maxHeight="5rem"
            />
            <p
              style={{
                margin: 0,
                color: "var(--fynns-color-text-muted)",
                fontSize: "var(--fynns-font-size-sm)",
                lineHeight: "var(--fynns-line-height-normal)",
              }}
            >
              {t("globals.collapsibleChromePlainNote")}
            </p>
          </Collapsible>
          <SandboxHelp text={t("globals.collapsibleHelpPreview")} />
          <SandboxHelp text={t("globals.collapsibleChromeHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="overlays">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            {t("globals.sheetOpen")}
          </Button>
          <Button size="sm" onClick={() => setSheetHalfOpen(true)}>
            {t("globals.sheetHalfOpen")}
          </Button>
          <Button size="sm" onClick={() => setSheetFullOpen(true)}>
            {t("globals.sheetFullOpen")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDialogShellOpen(true)}>
            {t("globals.dialogShellOpen")}
          </Button>
          <Button size="sm" onClick={() => setCenteredDialogOpen(true)}>
            {t("globals.dialogOpen")}
          </Button>
          <Button size="sm" variant="tonal" onClick={() => setLabeledDialogOpen(true)}>
            {t("globals.dialogLabeledOpen")}
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
          <Button size="sm" variant="tonal" onClick={() => setLeftDrawerOpen(true)}>
            {t("globals.drawerLeftOpen")}
          </Button>
        </div>
        <div className="sandbox-globals-row" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <Switch labelSide="end" label={t("globals.confirmLoading")} checked={confirmLoading} onCheckedChange={setConfirmLoading} />
          <Switch labelSide="end" label={t("globals.confirmDisabled")} checked={confirmDisabled} onCheckedChange={setConfirmDisabled} />
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
        <BottomSheet
          open={sheetHalfOpen}
          onClose={() => setSheetHalfOpen(false)}
          size="half"
          title={t("globals.sheetHalfTitle")}
          description={t("globals.sheetDescription")}
          actions={<Button onClick={() => setSheetHalfOpen(false)}>{t("globals.sheetDone")}</Button>}
        >
          <p style={{ margin: 0 }}>{t("globals.sheetBody")}</p>
        </BottomSheet>
        <BottomSheet
          open={sheetFullOpen}
          onClose={() => setSheetFullOpen(false)}
          size="full"
          title={t("globals.sheetFullTitle")}
          description={t("globals.sheetDescription")}
          actions={<Button onClick={() => setSheetFullOpen(false)}>{t("globals.sheetDone")}</Button>}
        >
          <p style={{ margin: 0 }}>{t("globals.sheetBody")}</p>
        </BottomSheet>
        <DialogShell
          open={dialogShellOpen}
          onClose={() => setDialogShellOpen(false)}
          ariaLabel={t("globals.dialogShellTitle")}
        >
          <div className="sandbox-stack" style={{ padding: "var(--fynns-space-lg)" }}>
            <strong>{t("globals.dialogShellTitle")}</strong>
            <p style={{ margin: 0 }}>{t("globals.dialogShellBody")}</p>
            <Button size="sm" onClick={() => setDialogShellOpen(false)}>
              {t("globals.dialogShellClose")}
            </Button>
          </div>
        </DialogShell>
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
          open={labeledDialogOpen}
          onOpenChange={setLabeledDialogOpen}
          title={t("globals.dialogLabeledTitle")}
          size="sm"
          showCloseButton
          closeAriaLabel={t("globals.dialogClose")}
        >
          <ControlStack columns={1}>
            <ControlRow label={t("globals.dialogLabeledOptA")}>
              <Switch
                label=""
                ariaLabel={t("globals.dialogLabeledOptA")}
                checked={labeledOptA}
                onCheckedChange={setLabeledOptA}
              />
            </ControlRow>
            <ControlRow label={t("globals.dialogLabeledOptB")}>
              <Switch
                label=""
                ariaLabel={t("globals.dialogLabeledOptB")}
                checked={labeledOptB}
                onCheckedChange={setLabeledOptB}
              />
            </ControlRow>
            <ControlRow label={t("globals.dialogLabeledOptC")}>
              <Switch
                label=""
                ariaLabel={t("globals.dialogLabeledOptC")}
                checked={labeledOptC}
                onCheckedChange={setLabeledOptC}
              />
            </ControlRow>
          </ControlStack>
        </Dialog>
        <SandboxHelp text={t("globals.dialogLabeledHelp")} />
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
          loading={confirmLoading}
          confirmDisabled={confirmDisabled}
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
        <Drawer
          open={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          side="left"
          title={t("globals.drawerLeftTitle")}
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
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catPatterns")}
        icon={<SparklesIcon aria-hidden />}
        open={openCategories.patterns ?? false}
        onOpenChange={(open) => setCategoryOpen("patterns", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="empty-state">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <EmptyState
            icon={<FolderOpenIcon />}
            title={t("globals.emptyTitle")}
            description={t("globals.emptyDescription")}
            actions={
              <Button>{t("globals.emptyAction")}</Button>
            }
          />
          <EmptyState
            size="sm"
            title={t("globals.emptySmTitle")}
            description={t("globals.emptySmDescription")}
          />
          <SandboxHelp text={t("globals.emptyHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="busy-region">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <BusyRegion
            busy={busyRegion}
            label={t("globals.busyRegionLabel")}
            message={t("globals.busyRegionMessage")}
          >
            <Card title={t("globals.busyRegionTitle")}>
              <p style={{ margin: 0 }}>{t("globals.busyRegionBody")}</p>
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBusyRegionDeterminate((v) => !v)}
            >
              {t("globals.busyRegionDeterminate")}
            </Button>
          </div>
          <BusyRegion
            busy={busyRegionDeterminate}
            label={t("globals.busyRegionLabel")}
            message={t("globals.busyRegionMessage")}
            value={0.55}
            size="sm"
          >
            <Card title={t("globals.busyRegionTitle")}>
              <p style={{ margin: 0 }}>{t("globals.busyRegionBody")}</p>
            </Card>
          </BusyRegion>
          <SandboxHelp text={t("globals.busyRegionHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="busy-scrim">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Button onClick={() => setBusyScrimOpen(true)}>
            {t("globals.busyScrimOpen")}
          </Button>
          <Button variant="tonal" onClick={() => setBusyScrimDeterminateOpen(true)}>
            {t("globals.busyScrimDeterminate")}
          </Button>
          <BusyScrim
            open={busyScrimOpen}
            label={t("globals.busyScrimLabel")}
            message={t("globals.busyScrimMessage")}
          />
          <BusyScrim
            open={busyScrimDeterminateOpen}
            label={t("globals.busyScrimLabel")}
            message={t("globals.busyScrimMessage")}
            value={0.7}
            size="lg"
          />
          <SandboxHelp text={t("globals.busyScrimHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="busy-paint">
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
              disabled={busyPaintBad || busyPaintGood.busy || busyYield || busyRunDirect}
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
            <Button
              size="sm"
              variant="tonal"
              disabled={busyPaintBad || busyPaintGood.busy || busyYield || busyRunDirect}
              onClick={() => {
                void (async () => {
                  setBusyYield(true);
                  await afterNextPaint();
                  for (let i = 0; i < 4; i++) {
                    const until = performance.now() + 200;
                    while (performance.now() < until) {
                      /* slice */
                    }
                    await yieldToMain();
                  }
                  setBusyYield(false);
                })();
              }}
            >
              {t("globals.busyPaintYield")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busyPaintBad || busyPaintGood.busy || busyYield || busyRunDirect}
              onClick={() => {
                void runBusyTask(setBusyRunDirect, async () => {
                  const until = performance.now() + 800;
                  while (performance.now() < until) {
                    /* stall after paint via runBusyTask */
                  }
                });
              }}
            >
              {t("globals.busyPaintRunDirect")}
            </Button>
          </div>
          <BusyScrim
            open={busyPaintBad || busyPaintGood.busy || busyYield || busyRunDirect}
            label={
              busyPaintGood.busy
                ? (busyPaintGood.label ?? t("globals.busyPaintLabel"))
                : t("globals.busyPaintLabel")
            }
            message={t("globals.busyPaintMessage")}
          />
          <SandboxHelp text={t("globals.busyPaintHelp")} />
          <SandboxHelp text={t("globals.busyPaintYieldHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="stepper">
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
          <Stepper
            orientation="vertical"
            ariaLabel={t("globals.stepperVerticalAria")}
            activeIndex={stepperVerticalIndex}
            onStepChange={setStepperVerticalIndex}
            steps={[
              { label: t("globals.stepperStep1"), description: t("globals.stepperStep1Desc") },
              { label: t("globals.stepperStep2"), description: t("globals.stepperStep2Desc") },
              { label: t("globals.stepperStep3"), description: t("globals.stepperStep3Desc"), optional: true },
            ]}
          />
          <SandboxHelp text={t("globals.stepperVerticalHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="dropzone">
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
          <Dropzone
            busy={dropBusy}
            label={t("globals.dropzoneBusy")}
            browseLabel={t("globals.dropzoneBrowse")}
            onFiles={() => {}}
          />
          <Dropzone
            disabled
            label={t("globals.dropzoneDisabled")}
            browseLabel={t("globals.dropzoneBrowse")}
            onFiles={() => {}}
          />
          <Dropzone
            accept="image/*"
            label={t("globals.dropzoneAccept")}
            hint={t("globals.dropzoneAcceptHint")}
            browseLabel={t("globals.dropzoneBrowse")}
            onFiles={(files) => setDropNames(files.map((f) => f.name))}
          />
          <Switch
            labelSide="end"
            label={t("globals.dropzoneBusy")}
            checked={dropBusy}
            onCheckedChange={setDropBusy}
          />
          <SandboxHelp
            text={
              dropNames.length > 0
                ? t("globals.dropzoneToast", { names: dropNames.join(", ") })
                : t("globals.dropzoneHelp")
            }
          />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="table">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div className="fynns-table-wrap fynns-scroll sandbox-table-sticky">
            <Table stickyHeader>
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
          <SandboxHelp text={t("globals.tableStickyHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="code-block">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <CodeBlock
            label={t("globals.codeBlockLabel")}
            language="ts"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`export const accent = "var(--fynns-color-accent)";\nexport const radius = "var(--fynns-radius-md)";`}
            maxHeight="8rem"
          />
          <CodeBlock
            variant="plain"
            language="py"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("world"))`}
          />
          <CodeBlock
            label={t("globals.codeBlockCssLabel")}
            language="css"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`.hero {\n  color: var(--fynns-color-accent);\n  /* tokenized ink */\n  padding: 1rem;\n}`}
            maxHeight="8rem"
          />
          <CodeBlock
            label={t("globals.codeBlockJsonLabel")}
            language="json"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`{\n  "accent": "#2dd4bf",\n  "radius": "md",\n  "enabled": true\n}`}
            maxHeight="8rem"
          />
          <CodeBlock
            label={t("globals.codeBlockXmlLabel")}
            language="xml"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`<?xml version="1.0"?>\n<!-- sample sections -->\n<section name="intro">\n  Short supporting copy.\n</section>\n`}
            maxHeight="8rem"
          />
          <CodeBlock
            variant="editable"
            label={t("globals.codeBlockEditableLabel")}
            language="ts"
            copyAriaLabel={t("globals.codeBlockCopy")}
            defaultValue={`export const accent = "var(--fynns-color-accent)";\n`}
            maxHeight="8rem"
          />
          <SandboxHelp text={t("globals.codeBlockHelp")} />
          <SandboxHelp text={t("globals.codeBlockEditableHelp")} />
          <CodeBlock
            wrap={false}
            label={t("globals.codeBlockNowrapLabel")}
            language="ts"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={`export const veryLongTokenName = "color-mix(in srgb, var(--fynns-color-accent) 12%, var(--fynns-color-border))";\n`}
            maxHeight="6rem"
          />
          <SandboxHelp text={t("globals.codeBlockNowrapHelp")} />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <Button size="sm" variant="tonal" onClick={() => setCodeLangDialogOpen(true)}>
              {t("globals.codeLangDemoOpen")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.codeLangDemoHelp")} />
          <CodeBlock
            label={t("globals.codeRegisterLabel")}
            language="gsc"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={GSC_DEMO_CODE}
            maxHeight="10rem"
          />
          <SandboxHelp text={t("globals.codeRegisterHelp")} />
          <Dialog
            open={codeLangDialogOpen}
            onOpenChange={setCodeLangDialogOpen}
            title={t("globals.codeLangDemoTitle")}
            description={t("globals.codeLangDemoDescription")}
            size="md"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
          >
            <div className="sandbox-stack">
              <ToggleGroup
                ariaLabel={t("globals.codeLangDemoAria")}
                value={codeLangDemo}
                onChange={setCodeLangDemo}
                fullWidth
                options={[
                  { value: "py", label: t("globals.codeLangDemoPy") },
                  { value: "ts", label: t("globals.codeLangDemoTs") },
                  { value: "cpp", label: t("globals.codeLangDemoCpp") },
                ]}
              />
              <CodeBlock
                label={t(CODE_LANG_DEMO[codeLangDemo].labelKey)}
                language={CODE_LANG_DEMO[codeLangDemo].language}
                copyAriaLabel={t("globals.codeBlockCopy")}
                code={CODE_LANG_DEMO[codeLangDemo].code}
                maxHeight="16rem"
              />
            </div>
          </Dialog>
          <Grid
            equalCells
            gap="sm"
            className="sandbox-globals-code-tokens"
            role="list"
            aria-label={t("globals.codeTokensAria")}
          >
            {CODE_TOKEN_KEYS.map((key) => (
              <div key={key} className="sandbox-globals-code-token" role="listitem">
                <span
                  className="sandbox-globals-code-token-swatch"
                  style={{ background: `var(--fynns-code-${key})` }}
                  aria-hidden
                />
                <code>{key}</code>
              </div>
            ))}
          </Grid>
          <SandboxHelp text={t("globals.codeTokensHelp")} />
        </div>
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.catNavigation")}
        icon={<MenuIcon aria-hidden />}
        open={openCategories.navigation ?? false}
        onOpenChange={(open) => setCategoryOpen("navigation", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="breadcrumb">
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
        </GlobalsDemo>
        <GlobalsDemo id="pagination">
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
          <SandboxHelp as="span" text={t("globals.paginationMd")} />
          <Pagination
            size="md"
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
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.rhythm")}
        icon={<SettingsIcon aria-hidden />}
        open={openCategories.rhythm ?? false}
        onOpenChange={(open) => setCategoryOpen("rhythm", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="rhythm">
        <SandboxHelp text={t("globals.rhythmLead")} />
        <Card
          className="sandbox-globals-rhythm"
          title={t("globals.rhythmSampleTitle")}
        >
          <ControlStack className="sandbox-globals-rhythm-stack" columns={1}>
            <ControlRow label={t("globals.rhythmShowIcon")}>
              <Switch
                label=""
                ariaLabel={t("globals.rhythmShowIcon")}
                checked={rhythmShowIcon}
                onCheckedChange={setRhythmShowIcon}
                disabled={rhythmDisabled}
              />
            </ControlRow>
            <ControlRow label={t("globals.rhythmShowActions")}>
              <Switch
                label=""
                ariaLabel={t("globals.rhythmShowActions")}
                checked={rhythmShowActions}
                onCheckedChange={setRhythmShowActions}
                disabled={rhythmDisabled}
              />
            </ControlRow>
            <ControlRow label={t("globals.rhythmDisabled")}>
              <Switch
                label=""
                ariaLabel={t("globals.rhythmDisabled")}
                checked={rhythmDisabled}
                onCheckedChange={setRhythmDisabled}
              />
            </ControlRow>
          </ControlStack>
          <ControlBlock
            className="sandbox-globals-rhythm-block"
            description={t("globals.rhythmControlBlockHint")}
          >
            <ControlStack columns={1}>
              <ControlRow label={t("globals.rhythmCompactLabel")}>
                <Switch
                  label=""
                  ariaLabel={t("globals.rhythmCompactLabel")}
                  checked={rhythmShowIcon}
                  onCheckedChange={setRhythmShowIcon}
                  disabled={rhythmDisabled}
                />
              </ControlRow>
            </ControlStack>
          </ControlBlock>
          <FieldHint>{t("globals.rhythmFieldHintSample")}</FieldHint>
          <SandboxHelp text={t("globals.rhythmClusterHelp")} />
          <ControlStack columns={1}>
            <ControlRow label={t("globals.rhythmRowContent")}>
              <div className="fynns-control-cluster">
                <Switch
                  labelSide="end"
                  label={t("globals.rhythmShowIcon")}
                  checked={rhythmShowIcon}
                  onCheckedChange={setRhythmShowIcon}
                  disabled={rhythmDisabled}
                />
                <Switch
                  labelSide="end"
                  label={t("globals.rhythmShowActions")}
                  checked={rhythmShowActions}
                  onCheckedChange={setRhythmShowActions}
                  disabled={rhythmDisabled}
                />
              </div>
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
        </Card>
        <SandboxHelp text={t("globals.rhythmGridHelp")} />
        <Grid x={2} y={2} gap="sm" equalCells>
          <Button size="sm">{t("globals.rhythmGridA")}</Button>
          <Button size="sm" variant="tonal">{t("globals.rhythmGridB")}</Button>
          <Button size="sm" variant="ghost">{t("globals.rhythmGridC")}</Button>
          <Button size="sm" variant="default">{t("globals.rhythmGridD")}</Button>
        </Grid>
        <SandboxHelp text={t("globals.rhythmAgentHint")} />
        </GlobalsDemo>

        <GlobalsDemo id="form-recipe">
          <SandboxHelp text={t("globals.formRecipeLead")} />
          <div className="sandbox-globals-form-recipe-hosts">
            <SandboxHelp text={t("globals.formRecipeHostCard")} />
            <Card
              className="sandbox-globals-form-recipe"
              title={t("globals.formRecipeTitle")}
            >
              <FormRecipeFields idPrefix="sandbox-form-card" {...formRecipeFieldProps} />
            </Card>
            <SandboxHelp text={t("globals.formRecipeHostCollapsible")} />
            <Collapsible
              className="sandbox-globals-form-recipe"
              title={t("globals.formRecipeTitle")}
              open={formRecipeCollapsibleOpen}
              onOpenChange={setFormRecipeCollapsibleOpen}
            >
              <FormRecipeFields
                idPrefix="sandbox-form-collapsible"
                {...formRecipeFieldProps}
              />
            </Collapsible>
            <SandboxHelp text={t("globals.formRecipeHostDialog")} />
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setFormRecipeDialogOpen(true)}
            >
              {t("globals.formRecipeDialogOpen")}
            </Button>
          </div>
          <Dialog
            open={formRecipeDialogOpen}
            onOpenChange={setFormRecipeDialogOpen}
            title={t("globals.formRecipeTitle")}
            size="md"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
          >
            <FormRecipeFields
              idPrefix="sandbox-form-dialog"
              {...formRecipeFieldProps}
            />
          </Dialog>
          <SandboxHelp text={t("globals.formRecipeHelp")} />
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>

      <GlobalsCategory
        title={t("globals.swatches")}
        icon={<BarChartIcon aria-hidden />}
        open={openCategories.swatches ?? false}
        onOpenChange={(open) => setCategoryOpen("swatches", open)}
      >
        {() => (
          <>
        <GlobalsDemo id="swatches">
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
        </GlobalsDemo>
      </>
        )}
      </GlobalsCategory>
      </div>
    </div>
  );
}
