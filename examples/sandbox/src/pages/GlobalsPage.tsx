import {
  Autocomplete,
  ArchiveIcon,
  Avatar,
  AvatarGroup,
  Banner,
  BarChartIcon,
  BottomSheet,
  Breadcrumb,
  BusyRegion,
  BusyScrim,
  Button,
  MessageSquareIcon,
  useBusyTask,
  useLoadingTask,
  afterNextPaint,
  yieldToMain,
  runBusyTask,
  runLoadingTask,
  registerHighlightLanguage,
  codeLanguageFromPath,
  Pagination,
  Card,
  Surface,
  Checkbox,
  ChevronRightIcon,
  Chip,
  ChipSet,
  CircularProgress,
  CHART_TOKENS,
  Chat,
  ChatCitationChip,
  ChatCitations,
  ChatComposer,
  ChatMarkdown,
  ChatMessage,
  ChatReveal,
  ChatScrollToBottom,
  ChatActivity,
  ChatActivityArtifact,
  ChatActivityStep,
  ChatThinking,
  ChatThread,
  ClipboardIcon,
  ListChecksIcon,
  CloseIcon,
  CheckSquareIcon,
  SquareIcon,
  BriefcaseIcon,
  Carousel,
  CarouselItem,
  CodeBlock,
  DiffView,
  Collapsible,
  Divider,
  ContextMenu,
  ContextMenuTrigger,
  CommandPalette,
  DatePicker,
  DatePickerDialog,
  DateRangePicker,
  DateRangePickerDialog,
  TimePicker,
  TimePickerDialog,
  formatTimeValue,
  parseTimeValue,
  DownloadIcon,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
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
  GlobeIcon,
  Dialog,
  DialogShell,
  ConfirmDialog,
  Drawer,
  IconButton,
  InfoIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InlineAlert,
  Input,
  Textarea,
  Tabs,
  LayoutGridIcon,
  LinearProgress,
  List,
  ListItem,
  Timeline,
  TimelineItem,
  MenuIcon,
  OtpInput,
  NumberInput,
  PlusIcon,
  PencilIcon,
  Radio,
  RefreshIcon,
  MoreHorizontalIcon,
  SaveIcon,
  SearchIcon,
  Select,
  SettingsIcon,
  SearchBar,
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
  RevealMore,
  useRevealMore,
  REVEAL_MORE_DEFAULT_INITIAL,
  REVEAL_MORE_DEFAULT_STEP,
  REVEAL_MORE_LIST_DEFAULT_INITIAL,
  REVEAL_MORE_LIST_DEFAULT_STEP,
  ToggleGroup,
  Tooltip,
  OverflowTip,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  ControlBlock,
  ControlRow,
  ControlStack,
  FieldHint,
  Grid,
  FillColumn,
  PageScroll,
  SplitPane,
  StatusBar,
  StatusBarItem,
  Tree,
  TreeItem,
  InfoHint,
  Slider,
  SparklesIcon,
  useOverflowBounds,
} from "@fynns/ui";
import { ChatComposerModelMenuSections } from "../components/ChatComposerModelMenuSections";
import { ChatComposerModeTogglesEndActions } from "../components/ChatComposerModeTogglesEndActions";
import { ChatTodoComposerDemo } from "../components/ChatTodoComposerDemo";
import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import { useLocale, type MessageKey, type TranslateFn } from "../i18n";
import { SandboxHelp } from "../components/SandboxHelp";
import { ChartAnalyticsDemo } from "../components/ChartAnalyticsDemo";
import { ChatEmptySurfaceStarters } from "../components/ChatEmptySurfaceStarters";
import { IconsLibraryDemo } from "../components/IconsLibraryDemo";
import { ProviderSettingsManageShell } from "../components/ProviderSettingsManageShell";
import { TokenList } from "../components/TokenList";
import {
  demoElementId,
  findDemoById,
  type GlobalsCategoryId,
  type GlobalsDemoEntry,
} from "../catalog/globalsCatalog";
import {
  loadSandboxUiSession,
  patchSandboxUiSession,
} from "../state/sandboxUiSession";
import { GlobalsCatalogSearch } from "./GlobalsCatalogSearch";

/** Demo turn chrome — Copy + Regenerate + More; consumer apps own LLM rerun. */
function ChatDemoActions({
  copyLabel,
  retryLabel,
  moreLabel,
  moreShareLabel,
  moreExportLabel,
  onCopy,
  onRetry,
  onMoreShare,
  onMoreExport,
}: {
  copyLabel: string;
  retryLabel: string;
  moreLabel: string;
  moreShareLabel: string;
  moreExportLabel: string;
  onCopy?: () => void;
  onRetry?: () => void;
  onMoreShare?: () => void;
  onMoreExport?: () => void;
}) {
  return (
    <>
      <Tooltip content={copyLabel}>
        <IconButton size="sm" aria-label={copyLabel} onClick={onCopy}>
          <ClipboardIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content={retryLabel}>
        <IconButton size="sm" aria-label={retryLabel} onClick={onRetry}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <DropdownMenu
        trigger={<MoreHorizontalIcon />}
        ariaLabel={moreLabel}
        align="start"
        iconOnly
      >
        <DropdownMenuItem onClick={onMoreShare}>
          {moreShareLabel}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMoreExport}>
          {moreExportLabel}
        </DropdownMenuItem>
      </DropdownMenu>
    </>
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

/** Generic FullscreenDialog flush-start sample — not consumer product copy. */
const FULLSCREEN_FLUSH_XML = [
  "<?xml version=\"1.0\"?>",
  "<notes>",
  "  <title>Project preferences</title>",
  "  <layout>Compact</layout>",
  "  <digests>Daily</digests>",
  "  <region>EU</region>",
  "  <contact>sample@example.com</contact>",
  "</notes>",
].join("\n");

/** Drawer body scroll + nested CodeBlock — overlay rail must stay below panel head. */
const DRAWER_NESTED_SCROLL_JSON = [
  "{",
  '  "trStructure": "flat",',
  '  "densityNotes": "Prefer compact rows in narrow hosts.",',
  '  "sizeNotes": "Sample volume metadata for teaching scroll clamp.",',
  '  "region": "EU",',
  '  "digests": "Daily",',
  '  "contact": "sample@example.com",',
  "  \"sections\": [",
  '    { "id": "alpha", "label": "Sample block A" },',
  '    { "id": "beta", "label": "Sample block B" },',
  '    { "id": "gamma", "label": "Sample block C" },',
  '    { "id": "delta", "label": "Sample block D" },',
  '    { "id": "epsilon", "label": "Sample block E" }',
  "  ]",
  "}",
].join("\n");

/** Centered Dialog + List + Collapsible + plain CodeBlock — rail + rail clamp cap. */
const DIALOG_NESTED_SCROLL_JSON = [
  "{",
  '  "sample": "nested-scroll",',
  '  "region": "EU",',
  '  "digests": "Daily",',
  '  "contact": "sample@example.com",',
  '  "notes": [',
  '    "Sample note 01 — tall host teaching scroll clamp.",',
  '    "Sample note 02 — keep thumbs inside radius-3xl.",',
  '    "Sample note 03 — plain CodeBlock uses copy-float.",',
  '    "Sample note 04 — Dialog body is a size container.",',
  '    "Sample note 05 — max-height composes with rail clamp.",',
  '    "Sample note 06 — List rows stay above the fold.",',
  '    "Sample note 07 — Collapsible chrome is plain.",',
  '    "Sample note 08 — generic placeholders only.",',
  '    "Sample note 09 — wrap soft; vertical overflow only.",',
  '    "Sample note 10 — overlay Y rail clamps below chrome.",',
  '    "Sample note 11 — rounded clip after copy-float geometry.",',
  '    "Sample note 12 — prefer compact rows in narrow hosts.",',
  '    "Sample note 13 — sample volume metadata for scroll.",',
  '    "Sample note 14 — section alpha teaching block.",',
  '    "Sample note 15 — section beta teaching block.",',
  '    "Sample note 16 — section gamma teaching block.",',
  '    "Sample note 17 — section delta teaching block.",',
  '    "Sample note 18 — section epsilon teaching block.",',
  '    "Sample note 19 — nested scroll stays inside panel.",',
  '    "Sample note 20 — no consumer product strings here.",',
  '    "Sample note 21 — textarea-max-height token on root.",',
  '    "Sample note 22 — host scroll and nested rail coexist.",',
  '    "Sample note 23 — thumb never paints past bottom curve.",',
  '    "Sample note 24 — live sandbox #dialog-nested-scroll."',
  "  ]",
  "}",
].join("\n");

/** Suffixed file-body Card demo — generic placeholders only (not consumer copy). */
const FILE_BODY_SAMPLE_PATH = "sample.md";
const FILE_BODY_SAMPLE_MD = [
  "## Design guidance",
  "",
  "Be creative within the host tokens. Avoid slop patterns.",
  "",
  "### Visual hierarchy",
  "",
  "**Color.** All colors from theme tokens — never hardcode hex.",
  "",
  "### Notes",
  "",
  "- Prefer CodeBlock for `.md` / `.xml` / `.py` file bodies",
  "- `.txt` drafts may stay on Textarea",
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
 * Idle / reset → no row (avoid a fake assistant turn above the fail demo).
 */
function ChatStreamingAssistant({
  streaming,
  fullText,
  streamingLabel,
  onDone,
}: {
  streaming: boolean;
  fullText: string;
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
    }, 90);
    return () => window.clearInterval(timer);
  }, [streaming]);

  if (!streaming && !text) return null;

  return (
    <ChatMessage
      role="assistant"
      streaming={streaming}
      streamingLabel={streamingLabel}
      markdown={text || undefined}
    />
  );
}

const GLOBALS_DEMO_FOCUS_TIMEOUT_MS = 5000;
/** Collapsible expand uses `--fynns-duration-base` (240ms) + small layout buffer. */
const GLOBALS_DEMO_EXPAND_SETTLE_MS = 280;

/**
 * Lazily mounted category bodies may appear after Collapsible open. Poll until
 * the demo anchor exists, wait for expand height morph, then scroll + flash.
 */
function focusGlobalsDemoWhenReady(
  demoId: string,
  entry: GlobalsDemoEntry,
  onFlash: (id: string) => void,
): () => void {
  const targetId = demoElementId(demoId);
  const deadline = performance.now() + GLOBALS_DEMO_FOCUS_TIMEOUT_MS;
  let cancelled = false;

  const scrollTo = (el: HTMLElement) => {
    if (cancelled) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    el.setAttribute("aria-label", entry.label);
    el.focus({ preventScroll: true });
    onFlash(demoId);
  };

  const afterExpandSettled = (el: HTMLElement) => {
    const expand = el.closest(".fynns-expand") as HTMLElement | null;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!expand || reduceMotion || expand.dataset.state !== "open") {
      scrollTo(el);
      return;
    }

    let done = false;
    const finish = () => {
      if (done || cancelled) return;
      done = true;
      expand.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallbackTimer);
      scrollTo(el);
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== expand) return;
      if (event.propertyName !== "grid-template-rows") return;
      finish();
    };

    expand.addEventListener("transitionend", onTransitionEnd);
    const fallbackTimer = window.setTimeout(finish, GLOBALS_DEMO_EXPAND_SETTLE_MS);
  };

  const poll = () => {
    if (cancelled) return;
    const el = document.getElementById(targetId);
    if (el) {
      afterExpandSettled(el);
      return;
    }
    if (performance.now() < deadline) {
      requestAnimationFrame(poll);
    }
  };

  requestAnimationFrame(poll);
  return () => {
    cancelled = true;
  };
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
  gridAgent,
  onGridAgentChange,
  gridProject,
  onGridProjectChange,
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
  highlights,
  onHighlightsChange,
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
  t: TranslateFn;
  gridAgent: string;
  onGridAgentChange: (value: string) => void;
  gridProject: string;
  onGridProjectChange: (value: string) => void;
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
  highlights: string[];
  onHighlightsChange: (value: string[]) => void;
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
  const agentId = `${idPrefix}-grid-agent`;
  const projectId = `${idPrefix}-grid-project`;
  const regionId = `${idPrefix}-region`;
  const nameId = `${idPrefix}-display-name`;
  const emailId = `${idPrefix}-email`;
  const timezoneId = `${idPrefix}-timezone`;
  const notesId = `${idPrefix}-notes`;
  const updateHighlightAt = (index: number, value: string) => {
    const next = [...highlights];
    next[index] = value;
    onHighlightsChange(next);
  };
  const removeHighlightAt = (index: number) => {
    onHighlightsChange(highlights.filter((_, i) => i !== index));
  };
  const addHighlight = () => {
    onHighlightsChange([...highlights, ""]);
  };
  const accessName = `${idPrefix}-access`;
  const accessOtherId = `${idPrefix}-access-other`;
  const previewId = `${idPrefix}-preview-length`;
  return (
    <>
      <FieldHint>{t("globals.formRecipeIntro")}</FieldHint>
      <FieldStack>
        {/*
          Multi-column FieldBlocks: only this recipe — FieldStack → Grid x={N}
          fill (core ≥ 0.5.211). Never equalCells / max-content hug / private 1fr.
          Live treaty host: `#sandbox-field-stack-grid-select` (Card below).
        */}
        <Grid x={2} y="unbounded" gap="md">
          <FieldBlock label={t("globals.formGridAgentLabel")} htmlFor={agentId}>
            <Select
              id={agentId}
              ariaLabel={t("globals.formGridAgentLabel")}
              value={gridAgent}
              options={[
                {
                  value: "build",
                  label: t("globals.formGridAgentBuild"),
                },
                {
                  value: "plan",
                  label: t("globals.formGridAgentPlan"),
                },
              ]}
              onChange={onGridAgentChange}
            />
          </FieldBlock>
          <FieldBlock
            label={t("globals.formGridProjectLabel")}
            htmlFor={projectId}
            actions={
              <InfoHint size="sm" content={t("globals.formGridProjectHelp")} />
            }
          >
            <Select
              id={projectId}
              ariaLabel={t("globals.formGridProjectLabel")}
              value={gridProject}
              options={[
                {
                  value: "sample-workspace",
                  label: t("globals.formGridProjectA"),
                },
                {
                  value: "sample-notes",
                  label: t("globals.formGridProjectB"),
                },
                {
                  value: "sample-catalog",
                  label: t("globals.formGridProjectC"),
                },
                {
                  value: "sample-core",
                  label: t("globals.formGridProjectD"),
                },
                {
                  value: "sample-thesis-lab",
                  label: t("globals.formGridProjectE"),
                },
                {
                  value: "console-game-2d",
                  label: t("globals.formGridProjectF"),
                },
                {
                  value: "sample-game",
                  label: t("globals.formGridProjectG"),
                },
                {
                  value: "sample-thesis",
                  label: t("globals.formGridProjectH"),
                },
              ]}
              onChange={onGridProjectChange}
            />
          </FieldBlock>
        </Grid>
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
        <FieldBlock label={t("globals.formRecipeEmail")} htmlFor={emailId}>
          <Input
            id={emailId}
            aria-label={t("globals.formRecipeEmail")}
            type={revealEmail ? "text" : "password"}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            autoComplete="off"
            trailing={
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
          />
        </FieldBlock>
        <FieldBlock label={t("globals.formRecipeTimezone")} htmlFor={timezoneId}>
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Select
              id={timezoneId}
              className="fynns-control-cluster__grow"
              ariaLabel={t("globals.formRecipeTimezone")}
              options={["UTC", "Europe/Berlin", "Asia/Shanghai"]}
              value={timezone}
              onChange={onTimezoneChange}
            />
            <Tooltip content={t("globals.formRecipeRefreshTip")}>
              <IconButton
                size="sm"
                aria-label={t("globals.formRecipeRefreshTip")}
                onClick={() => {}}
              >
                <UndoIcon aria-hidden />
              </IconButton>
            </Tooltip>
          </div>
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
        <FieldBlock
          label={t("globals.formRecipeHighlights")}
          description={t("globals.formRecipeHighlightsHint")}
          actions={
            <Tooltip content={t("globals.formRecipeHighlightAdd")}>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={t("globals.formRecipeHighlightAdd")}
                onClick={addHighlight}
              >
                <PlusIcon aria-hidden />
              </IconButton>
            </Tooltip>
          }
        >
          {highlights.length === 0 ? (
            <FieldHint>{t("globals.formRecipeHighlightsEmpty")}</FieldHint>
          ) : (
            <FieldStack>
              {highlights.map((entry, index) => (
                <div
                  key={`${idPrefix}-highlight-${index}`}
                  className="fynns-control-cluster fynns-control-cluster--end-align"
                >
                  <Textarea
                    className="fynns-control-cluster__grow"
                    value={entry}
                    minRows={2}
                    autoGrow
                    aria-label={t("globals.formRecipeHighlightItem", { n: index + 1 })}
                    onChange={(event) => updateHighlightAt(index, event.target.value)}
                  />
                  <Tooltip content={t("globals.formRecipeHighlightRemove")}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label={t("globals.formRecipeHighlightRemove")}
                      onClick={() => removeHighlightAt(index)}
                    >
                      <TrashIcon aria-hidden />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </FieldStack>
          )}
        </FieldBlock>
      </FieldStack>
      <Divider />
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
      <Divider />
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

/** Live demo of `useRevealMore` + `RevealMore` on a long data Table. */
const TABLE_REVEAL_ROWS = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const id = String(n).padStart(2, "0");
  return {
    name: `sample/catalog-item-${id}`,
    status: n % 3 === 0 ? "Draft" : "Ready",
    qty: String(n * 3),
    cache: n % 4 === 0 ? "—" : `${n * 12}k`,
    total: `${n * 3}`,
  };
});

function TableRevealMoreDemo() {
  const { t } = useLocale();
  const { visible, canRevealMore, revealMore } = useRevealMore({
    total: TABLE_REVEAL_ROWS.length,
    initial: REVEAL_MORE_DEFAULT_INITIAL,
    step: REVEAL_MORE_DEFAULT_STEP,
  });
  const rows = TABLE_REVEAL_ROWS.slice(0, visible);

  return (
    <Card title={t("globals.tableRevealCaption")} chrome="plain">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>{t("globals.tableColName")}</TableHeaderCell>
            <TableHeaderCell>{t("globals.tableColStatus")}</TableHeaderCell>
            <TableHeaderCell align="end">
              {t("globals.tableColQty")}
            </TableHeaderCell>
            <TableHeaderCell align="end">
              {t("globals.tableColCache")}
            </TableHeaderCell>
            <TableHeaderCell align="end">
              {t("globals.tableColTotal")}
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell align="end">{row.qty}</TableCell>
              <TableCell align="end">{row.cache}</TableCell>
              <TableCell align="end">{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <RevealMore
        canRevealMore={canRevealMore}
        onRevealMore={revealMore}
        label={t("globals.tableRevealMore")}
      />
    </Card>
  );
}

const LIST_REVEAL_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1;
  const id = String(n).padStart(2, "0");
  return {
    id: `list-reveal-${id}`,
    headline: `sample/catalog-entry-${id}`,
    supporting: n % 3 === 0 ? "Needs review" : "Unmatched",
  };
});

/** Live demo of `useRevealMore` + `RevealMore` on a long List (5/5). */
function ListRevealMoreDemo() {
  const { t } = useLocale();
  const { visible, canRevealMore, revealMore } = useRevealMore({
    total: LIST_REVEAL_ITEMS.length,
    initial: REVEAL_MORE_LIST_DEFAULT_INITIAL,
    step: REVEAL_MORE_LIST_DEFAULT_STEP,
  });
  const items = LIST_REVEAL_ITEMS.slice(0, visible);

  return (
    <Card title={t("globals.listRevealCaption")}>
      <div className="fynns-unit-stack">
        <FieldHint>{t("globals.listRevealHint")}</FieldHint>
        <List aria-label={t("globals.listRevealAria")}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              interactive={false}
              headline={item.headline}
              supportingText={item.supporting}
              trailing={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => snackbar(t("globals.listRevealMapSnack"))}
                >
                  {t("globals.listRevealMap")}
                </Button>
              }
            />
          ))}
        </List>
        <RevealMore
          canRevealMore={canRevealMore}
          onRevealMore={revealMore}
          label={t("globals.listRevealMore")}
        />
        <div className="fynns-control-cluster">
          <Button
            variant="primary"
            onClick={() => snackbar(t("globals.listRevealContinueSnack"))}
          >
            {t("globals.listRevealContinue")}
          </Button>
        </div>
      </div>
    </Card>
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
  const [pageSize, setPageSize] = useState("10");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetHalfOpen, setSheetHalfOpen] = useState(false);
  const [sheetFullOpen, setSheetFullOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerDefaultVisible, setBannerDefaultVisible] = useState(true);
  const [listId, setListId] = useState<
    | "inbox"
    | "starred"
    | "sent"
    | "tone-a"
    | "tone-b"
    | "tone-c"
    | "run-ok"
    | "run-fail"
    | "run-overflow"
  >("inbox");
  const [listTreeOpen, setListTreeOpen] = useState(true);
  const [listTurnOpen, setListTurnOpen] = useState(true);
  const [listGroupOpen, setListGroupOpen] = useState(true);
  const [timelineExpand, setTimelineExpand] = useState<
    Partial<Record<"lead" | "mid" | "trail", boolean>>
  >({ lead: true });
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
  const [segmentNarrow, setSegmentNarrow] = useState<"all" | "alpha" | "beta" | "gamma">(
    "all",
  );
  const [styleMarks, setStyleMarks] = useState<Array<"bold" | "italic">>(["bold"]);
  const [sliderValue, setSliderValue] = useState(40);
  const [autoValue, setAutoValue] = useState("");
  const [autoObjValue, setAutoObjValue] = useState("");
  const [selectObjValue, setSelectObjValue] = useState("teal");
  const [selectWideShortValue, setSelectWideShortValue] = useState("low");
  const [otpValue, setOtpValue] = useState("");
  const [otpShortValue, setOtpShortValue] = useState("");
  const [numberValue, setNumberValue] = useState(8);
  const [numberDenseValue, setNumberDenseValue] = useState(1.5);
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [stepperIndex, setStepperIndex] = useState(1);
  const [stepperVerticalIndex, setStepperVerticalIndex] = useState(0);
  const [dropNames, setDropNames] = useState<string[]>([]);
  const [dropBusy, setDropBusy] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenFlushOpen, setFullscreenFlushOpen] = useState(false);
  const [drawerNestedScrollOpen, setDrawerNestedScrollOpen] = useState(false);
  const [dialogNestedScrollOpen, setDialogNestedScrollOpen] = useState(false);
  const [dialogViewportOpen, setDialogViewportOpen] = useState(false);
  const [dialogViewportCode, setDialogViewportCode] = useState(
    DIALOG_NESTED_SCROLL_JSON,
  );
  const [fullscreenLocale, setFullscreenLocale] = useState("zh");
  const [fullscreenPath, setFullscreenPath] = useState("");
  const [fullscreenFlushXml, setFullscreenFlushXml] = useState(FULLSCREEN_FLUSH_XML);
  const [busyRegion, setBusyRegion] = useState(false);
  const [busyRegionDeterminate, setBusyRegionDeterminate] = useState(false);
  const [busyRegionFill, setBusyRegionFill] = useState(true);
  const [busyRegionPaneLeadCold, setBusyRegionPaneLeadCold] = useState(true);
  /** Pane cold → timeout/fail → retry teaching host (`#sandbox-pane-load-error`). */
  const [paneLoadPhase, setPaneLoadPhase] = useState<"cold" | "error" | "ready">(
    "ready",
  );
  const [busyRegionDialogOpen, setBusyRegionDialogOpen] = useState(false);
  const [busyRegionColdBody, setBusyRegionColdBody] = useState(true);
  const [busyRegionFieldBusy, setBusyRegionFieldBusy] = useState(false);
  const [busyScrimOpen, setBusyScrimOpen] = useState(false);
  const [busyScrimDeterminateOpen, setBusyScrimDeterminateOpen] = useState(false);
  const [busyPaintBad, setBusyPaintBad] = useState(false);
  const busyPaintGood = useBusyTask();
  const [busyYield, setBusyYield] = useState(false);
  const [busyRunDirect, setBusyRunDirect] = useState(false);
  const [busyTaskHang, setBusyTaskHang] = useState(false);
  const [busyTaskTimeoutNote, setBusyTaskTimeoutNote] = useState<string | null>(null);
  const busyTaskAbort = useBusyTask();
  const [busyTaskAbortNote, setBusyTaskAbortNote] = useState<string | null>(null);
  const [buttonLoadingDirect, setButtonLoadingDirect] = useState(false);
  const [buttonLoadingNote, setButtonLoadingNote] = useState<string | null>(null);
  const confirmTrapLoading = useLoadingTask();
  const [confirmTrapOpen, setConfirmTrapOpen] = useState(false);
  const [confirmTrapNote, setConfirmTrapNote] = useState<string | null>(null);
  const [chatBusyNoStop, setChatBusyNoStop] = useState(false);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatStreamEpoch, setChatStreamEpoch] = useState(0);
  const [chatFailed, setChatFailed] = useState(true);
  const [chatThreadMode, setChatThreadMode] = useState<"empty" | "populated">(
    "populated",
  );
  const [chatDraft, setChatDraft] = useState("");
  const [chatComposerMultiDraft, setChatComposerMultiDraft] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  const [chatComposerLeadingMenusDraft, setChatComposerLeadingMenusDraft] =
    useState("");
  const [chatComposerLeadingMenusVolume, setChatComposerLeadingMenusVolume] =
    useState<"short" | "long">("short");
  const [chatComposerThinkingOn, setChatComposerThinkingOn] = useState(true);
  const [chatComposerVisionOn, setChatComposerVisionOn] = useState(false);
  const [chatAsideDraft, setChatAsideDraft] = useState("");
  const [thinkingStreaming, setThinkingStreaming] = useState(false);
  const [thinkingDoneMs, setThinkingDoneMs] = useState<number | undefined>(4200);
  const [thinkingActionIdx, setThinkingActionIdx] = useState(0);
  const thinkingStartedAtRef = useRef(0);
  const [activityStreaming, setActivityStreaming] = useState(false);
  const [activityPhase, setActivityPhase] = useState(3);
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
  const [cardModeBodySide, setCardModeBodySide] = useState<"primary" | "secondary">(
    "primary",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmDisabled, setConfirmDisabled] = useState(false);
  const [codeLangDialogOpen, setCodeLangDialogOpen] = useState(false);
  const [codeBlockHiddenTabOpen, setCodeBlockHiddenTabOpen] = useState(false);
  const [codeLangDemo, setCodeLangDemo] = useState<"py" | "ts" | "cpp">("ts");
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [tabsId, setTabsId] = useState<"single" | "batch">("single");
  const [tabsSmId, setTabsSmId] = useState<"a" | "b" | "c">("a");
  const [textareaValue, setTextareaValue] = useState(
    [
      "Sample opening — interest in the role and why this org.",
      "",
      "Sample body — one or two paragraphs of relevant project work, tools, and outcomes. Keep growing past a ChatComposer-sized well so PageScroll moves instead of an inner thumb.",
      "",
      "Sample close — availability and thanks.",
    ].join("\n"),
  );
  const [btnActive, setBtnActive] = useState(false);
  const [iconBtnActive, setIconBtnActive] = useState(false);
  const [switchStartOn, setSwitchStartOn] = useState(true);
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [splitOrientation, setSplitOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [pageScrollTool, setPageScrollTool] = useState("a");
  const [treeSelectedId, setTreeSelectedId] = useState<string | null>(
    "src/components/Tree.tsx",
  );
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [fabMenuAlignOpen, setFabMenuAlignOpen] = useState(false);
  const [menuStarred, setMenuStarred] = useState(true);
  const [menuNotify, setMenuNotify] = useState(false);
  const [scrollMenuModel, setScrollMenuModel] = useState("sample-model-a");
  const [rhythmShowIcon, setRhythmShowIcon] = useState(true);
  const [rhythmShowActions, setRhythmShowActions] = useState(true);
  const [rhythmDisabled, setRhythmDisabled] = useState(false);
  const [rhythmFooterBusy, setRhythmFooterBusy] = useState<
    null | "secondary" | "primary"
  >(null);
  const [rhythmSource, setRhythmSource] = useState("catalog");
  const [formRegion, setFormRegion] = useState("Europe");
  const [formDisplayName, setFormDisplayName] = useState("Sandbox user");
  const [formEmail, setFormEmail] = useState("demo@example.com");
  const [formRevealEmail, setFormRevealEmail] = useState(false);
  const [formTimezone, setFormTimezone] = useState("UTC");
  const [formNotes, setFormNotes] = useState("");
  const [formHighlights, setFormHighlights] = useState([
    "Sample achievement one for the record.",
    "Sample achievement two with longer copy that wraps to two lines when the host is narrow.",
  ]);
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
  const [formRecipeStackDialogOpen, setFormRecipeStackDialogOpen] = useState(false);
  const [formRecipeFileDialogOpen, setFormRecipeFileDialogOpen] = useState(false);
  const [formGridAgent, setFormGridAgent] = useState("build");
  const [formGridProject, setFormGridProject] = useState("sample-workspace");
  const [listCatalogEditOpen, setListCatalogEditOpen] = useState(false);
  const [listCatalogEditName, setListCatalogEditName] = useState("");
  /** Last previewed recipe — keep through DialogFrame exit (~240ms). */
  const [listRecipeDetail, setListRecipeDetail] = useState<"a" | "b">("a");
  const [listRecipeOpen, setListRecipeOpen] = useState(false);
  const [listRepoPathEnabled, setListRepoPathEnabled] = useState(true);
  const [listRepoRunScope, setListRepoRunScope] = useState<"batch" | string | null>(
    null,
  );
  const [tableWheelX, setTableWheelX] = useState(true);
  const [listInspectorKindGap, setListInspectorKindGap] = useState("skill");
  const [cardHeadRevision, setCardHeadRevision] = useState("rev-a");
  const [cardChromeType, setCardChromeType] = useState("flat");
  const [cardChromeQuality, setCardChromeQuality] = useState("fast");
  const [listInspectorKindMapped, setListInspectorKindMapped] = useState("skill");
  const [timelineEditOpen, setTimelineEditOpen] = useState(false);
  const [timelineEditName, setTimelineEditName] = useState("");
  const formRecipeFieldProps = {
    t,
    gridAgent: formGridAgent,
    onGridAgentChange: setFormGridAgent,
    gridProject: formGridProject,
    onGridProjectChange: setFormGridProject,
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
    highlights: formHighlights,
    onHighlightsChange: setFormHighlights,
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
    // Longer than min-busy (presentation-hint) + complete + enter (duration-activity)
    // so the settle is visible before the next phase mounts.
    const timer = window.setInterval(() => {
      setActivityPhase((phase) => {
        if (phase >= 3) {
          setActivityStreaming(false);
          return 3;
        }
        return phase + 1;
      });
    }, 2800);
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

  const focusDemoCancelRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      focusDemoCancelRef.current?.();
    },
    [],
  );

  const focusDemo = (demoId: string) => {
    const entry = findDemoById(demoId);
    if (!entry) return;
    focusDemoCancelRef.current?.();
    setOpenCategories((prev) => ({ ...prev, [entry.categoryId]: true }));
    focusDemoCancelRef.current = focusGlobalsDemoWhenReady(
      demoId,
      entry,
      setFlashDemoId,
    );
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
        <GlobalsDemo id="button-icon-label">
        <div className="sandbox-globals-row">
          <Button variant="tonal" size="sm">
            <>
              <EyeIcon aria-hidden />
              {t("globals.btnViewDetails")}
            </>
          </Button>
          <Button variant="ghost" size="sm">
            <ClipboardIcon aria-hidden />
            {t("globals.btnCopyText")}
          </Button>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="button-icon-label-matrix">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div className="sandbox-globals-row">
            <Button>
              <CheckIcon aria-hidden />
              {t("globals.btnApply")}
            </Button>
            <Button variant="tonal">
              <RefreshIcon aria-hidden />
              {t("globals.btnRefresh")}
            </Button>
            <Button variant="elevated">
              <EyeIcon aria-hidden />
              {t("globals.btnViewDetails")}
            </Button>
            <Button variant="default">
              <SaveIcon aria-hidden />
              {t("globals.btnSave")}
            </Button>
            <Button variant="ghost">
              <CloseIcon aria-hidden />
              {t("globals.btnCancel")}
            </Button>
            <Button variant="danger">
              <TrashIcon aria-hidden />
              {t("globals.btnDelete")}
            </Button>
          </div>
          <div className="sandbox-globals-row">
            <Button variant="tonal" size="sm">
              <ClipboardIcon aria-hidden />
              {t("globals.btnCopyText")}
            </Button>
            <Button variant="tonal">
              <ClipboardIcon aria-hidden />
              {t("globals.btnCopyText")}
            </Button>
            <Button variant="tonal" size="lg">
              <ClipboardIcon aria-hidden />
              {t("globals.btnCopyText")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.btnIconLabelHelp")} />
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
              tone="danger"
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
          <div id="sandbox-iconbutton-primary-loading">
            <Tooltip content={t("globals.iconBtnPrimaryLoading")}>
              <IconButton
                variant="primary"
                loading
                aria-label={t("globals.iconBtnPrimaryLoading")}
              >
                <PlusIcon />
              </IconButton>
            </Tooltip>
          </div>
          <SandboxHelp text={t("globals.iconBtnPrimaryLoadingHelp")} />
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
        <GlobalsDemo id="icons">
          <SandboxHelp text={t("globals.iconsHelp")} />
          <IconsLibraryDemo />
          <SandboxHelp text={t("globals.iconsBulkRecipeHelp")} />
          <div className="fynns-control-cluster" aria-label={t("globals.iconsBulkRecipeAria")}>
            <Tooltip content={t("globals.iconsBulkExit")}>
              <IconButton size="sm" variant="ghost" aria-label={t("globals.iconsBulkExit")}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("globals.iconsBulkSelectAll")}>
              <IconButton size="sm" variant="ghost" aria-label={t("globals.iconsBulkSelectAll")}>
                <CheckSquareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("globals.iconsBulkDeselectAll")}>
              <IconButton size="sm" variant="ghost" aria-label={t("globals.iconsBulkDeselectAll")}>
                <SquareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("globals.iconsBulkEnter")}>
              <IconButton size="sm" variant="ghost" aria-label={t("globals.iconsBulkEnter")}>
                <ListChecksIcon />
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
            tone="danger"
            content={t("globals.infoHintDangerBody")}
            ariaLabel={t("globals.infoHintDangerAria")}
          />
          <InfoHint
            label={t("globals.infoHintLabeledTrigger")}
            content={t("globals.infoHintLabeledBody")}
            ariaLabel={t("globals.infoHintLabeledAria")}
          />
          <ControlStack columns={2}>
            <ControlRow
              label={
                <>
                  {t("globals.infoHintRowLabel")}
                  <InfoHint
                    size="sm"
                    content={t("globals.infoHintRowBody")}
                    ariaLabel={t("globals.infoHintRowAria")}
                  />
                </>
              }
            >
              <Switch
                label=""
                ariaLabel={t("globals.infoHintRowSwitch")}
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
            </ControlRow>
          </ControlStack>
          <div
            id="sandbox-control-row-tip-switch-narrow"
            className="sandbox-select-narrow-host"
          >
            <ControlRow
              label={
                <>
                  {t("globals.infoHintNarrowLabel")}
                  <InfoHint
                    size="sm"
                    content={t("globals.infoHintNarrowBody")}
                    ariaLabel={t("globals.infoHintNarrowAria")}
                  />
                </>
              }
            >
              <Switch
                label=""
                ariaLabel={t("globals.infoHintNarrowSwitch")}
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
            </ControlRow>
          </div>
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
          <div className="fynns-control-cluster">
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
                  icon={<FileIcon />}
                >
                  {t("globals.menuSortName")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={menuNotify}
                  onCheckedChange={setMenuNotify}
                  icon={<PencilIcon />}
                >
                  {t("globals.menuSortUpdated")}
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<PencilIcon />}>
              {t("globals.menuRename")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<TrashIcon />} tone="danger">
              {t("globals.menuDelete")}
            </DropdownMenuItem>
          </DropdownMenu>
            <div id="sandbox-menu-leading-icon">
              <DropdownMenu
                leadingIcon={<RefreshIcon />}
                trigger={t("globals.menuLeadingTrigger")}
                ariaLabel={t("globals.menuLeadingAria")}
                variant="ghost"
              >
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.menuOpen")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.menuRename")}
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
            <Tooltip content={t("globals.menuIconStripTip")}>
              <span>
                <DropdownMenu
                  trigger={<MoreHorizontalIcon />}
                  ariaLabel={t("globals.menuIconStripAria")}
                  align="end"
                  iconOnly
                >
                  <DropdownMenuItem onClick={() => {}}>
                    {t("globals.menuOpen")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    {t("globals.menuRename")}
                  </DropdownMenuItem>
                </DropdownMenu>
              </span>
            </Tooltip>
          </div>
        </div>
        <div
          id="sandbox-menu-field-match"
          className="sandbox-globals-row sandbox-globals-row--stack"
        >
          <div className="sandbox-select-narrow-host">
            <FieldBlock label={t("globals.menuFieldMatchLabel")}>
              <DropdownMenu
                ariaLabel={t("globals.menuFieldMatchAria")}
                trigger={t("globals.autocompleteOptTeal")}
                matchTriggerWidth
              >
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptTeal")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptCyan")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.selectLongOption")}
                </DropdownMenuItem>
              </DropdownMenu>
            </FieldBlock>
          </div>
          <FieldStack>
            <FieldBlock
              label={t("globals.menuFieldTipWrapLongLabel")}
              actions={
                <InfoHint
                  size="sm"
                  ariaLabel={t("globals.menuFieldTipWrapHintAria")}
                  content={t("globals.menuFieldTipWrapHint")}
                />
              }
            >
              <Tooltip content={t("globals.selectLongOption")} align="start">
                <span>
                  <DropdownMenu
                    ariaLabel={t("globals.menuFieldTipWrapLongAria")}
                    trigger={t("globals.selectLongOption")}
                    matchTriggerWidth
                  >
                    <DropdownMenuItem onClick={() => {}}>
                      {t("globals.autocompleteOptTeal")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      {t("globals.selectLongOption")}
                    </DropdownMenuItem>
                  </DropdownMenu>
                </span>
              </Tooltip>
            </FieldBlock>
            <FieldBlock label={t("globals.menuFieldTipWrapShortLabel")}>
              <DropdownMenu
                ariaLabel={t("globals.menuFieldTipWrapShortAria")}
                trigger={t("globals.autocompleteOptCyan")}
                matchTriggerWidth
              >
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptTeal")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptCyan")}
                </DropdownMenuItem>
              </DropdownMenu>
            </FieldBlock>
          </FieldStack>
          <FieldBlock label={t("globals.menuFieldRefreshLabel")}>
            <div className="fynns-control-cluster fynns-control-cluster--end-align">
              <DropdownMenu
                className="fynns-control-cluster__grow"
                ariaLabel={t("globals.menuFieldRefreshAria")}
                trigger={t("globals.autocompleteOptCyan")}
                matchTriggerWidth
              >
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptTeal")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.autocompleteOptCyan")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  {t("globals.selectLongOption")}
                </DropdownMenuItem>
              </DropdownMenu>
              <Tooltip content={t("globals.menuFieldRefreshTip")}>
                <IconButton
                  aria-label={t("globals.menuFieldRefreshTip")}
                  size="sm"
                  variant="ghost"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </div>
          </FieldBlock>
          <SandboxHelp text={t("globals.menuFieldMatchHelp")} />
        </div>
        <div id="sandbox-menu-submenu" className="sandbox-globals-row sandbox-globals-row--stack">
          <DropdownMenu trigger={t("globals.menuTrigger")} ariaLabel={t("globals.menuAria")}>
            <DropdownMenuItem icon={<FileIcon />}>{t("globals.menuNew")}</DropdownMenuItem>
            <DropdownMenuSub
              trigger={t("globals.menuSubTrigger")}
              ariaLabel={t("globals.menuSubAria")}
              icon={<FolderOpenIcon />}
            >
              <DropdownMenuItem>{t("globals.menuSubItemA")}</DropdownMenuItem>
              <DropdownMenuItem>{t("globals.menuSubItemB")}</DropdownMenuItem>
              <DropdownMenuItem>{t("globals.menuSubItemC")}</DropdownMenuItem>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<PencilIcon />}>{t("globals.menuRename")}</DropdownMenuItem>
          </DropdownMenu>
          <SandboxHelp text={t("globals.menuSubHelp")} />
        </div>
        <div id="sandbox-scroll-menu-stack">
          <SandboxHelp text={t("globals.scrollMenuStackHelp")} />
          <div className="sandbox-scroll-menu-stack fynns-scroll">
            <FieldStack>
              <FieldBlock label={t("globals.scrollMenuStackLabel")}>
                <DropdownMenu
                  ariaLabel={t("globals.scrollMenuStackAria")}
                  trigger={scrollMenuModel}
                  matchTriggerWidth
                >
                  {(
                    [
                      "sample-model-a",
                      "sample-model-b",
                      "sample-model-c",
                      "sample-model-d",
                      "sample-model-e",
                      "sample-model-f",
                      "sample-model-g",
                      "sample-model-h",
                      "sample-model-i",
                      "sample-model-j",
                      "sample-model-k",
                      "sample-model-l",
                      "sample-model-m",
                      "sample-model-n",
                      "sample-model-o",
                      "sample-model-p",
                    ] as const
                  ).map((id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => setScrollMenuModel(id)}
                    >
                      {id}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              </FieldBlock>
              <FieldHint>{t("globals.scrollMenuStackFillerA")}</FieldHint>
              <FieldHint>{t("globals.scrollMenuStackFillerB")}</FieldHint>
              <FieldHint>{t("globals.scrollMenuStackFillerC")}</FieldHint>
              <FieldHint>{t("globals.scrollMenuStackFillerD")}</FieldHint>
            </FieldStack>
          </div>
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
            <DropdownMenuItem icon={<TrashIcon />} tone="danger">
              {t("globals.contextMenuDelete")}
            </DropdownMenuItem>
          </ContextMenu>
        </div>
        <SandboxHelp text={t("globals.contextMenuHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="command-palette">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
            <Button onClick={() => setCommandOpen(true)}>
              {t("globals.commandPaletteOpen")}
            </Button>
            <CommandPalette
              open={commandOpen}
              onOpenChange={setCommandOpen}
              label={t("globals.commandPaletteAria")}
              placeholder={t("globals.commandPalettePlaceholder")}
              emptyLabel={t("globals.commandPaletteEmpty")}
              items={[
                {
                  id: "nav-home",
                  group: t("globals.commandPaletteGroupNav"),
                  label: t("globals.commandPaletteItemHome"),
                  icon: <LayoutGridIcon />,
                  shortcut: "Ctrl G",
                  onSelect: () =>
                    snackbar(t("globals.commandPaletteToastHome"), {
                      duration: "short",
                      dismissAriaLabel: t("globals.snackbarDismiss"),
                    }),
                },
                {
                  id: "nav-settings",
                  group: t("globals.commandPaletteGroupNav"),
                  label: t("globals.commandPaletteItemSettings"),
                  icon: <SettingsIcon />,
                  shortcut: "Ctrl ,",
                  onSelect: () =>
                    snackbar(t("globals.commandPaletteToastSettings"), {
                      duration: "short",
                      dismissAriaLabel: t("globals.snackbarDismiss"),
                    }),
                },
                {
                  id: "act-search",
                  group: t("globals.commandPaletteGroupActions"),
                  label: t("globals.commandPaletteItemSearch"),
                  icon: <SearchIcon />,
                  shortcut: "Ctrl K",
                  onSelect: () =>
                    snackbar(t("globals.commandPaletteToastSearch"), {
                      duration: "short",
                      dismissAriaLabel: t("globals.snackbarDismiss"),
                    }),
                },
                {
                  id: "act-file",
                  group: t("globals.commandPaletteGroupActions"),
                  label: t("globals.commandPaletteItemFile"),
                  icon: <FileIcon />,
                  shortcut: "Ctrl Shift O",
                  onSelect: () =>
                    snackbar(t("globals.commandPaletteToastFile"), {
                      duration: "short",
                      dismissAriaLabel: t("globals.snackbarDismiss"),
                    }),
                },
                {
                  id: "act-disabled",
                  group: t("globals.commandPaletteGroupActions"),
                  label: t("globals.commandPaletteItemDisabled"),
                  icon: <ArchiveIcon />,
                  disabled: true,
                },
              ]}
            />
          </div>
          <SandboxHelp text={t("globals.commandPaletteHelp")} />
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
          <Input
            id="sandbox-input-plain"
            placeholder={t("globals.inputPlaceholder")}
            aria-label={t("globals.inputAria")}
          />
            <Input
              id="sandbox-input-leading-affix"
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
            <SandboxHelp text={t("globals.inputHelp")} />
          </div>
        </GlobalsDemo>
        <GlobalsDemo id="select">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
            <InlineAlert
              severity="warning"
              message={t("globals.selectDeprecatedAlert")}
            />
          <Select
            ariaLabel={t("globals.selectAria")}
            value="one"
            options={[
              "one",
              "two",
              "sample-project-with-a-long-catalog-name",
            ]}
            onChange={() => {}}
          />
            <div className="sandbox-select-narrow-host">
              <Select
                className="fynns-control-cluster__grow"
                ariaLabel={t("globals.selectObjectAria")}
                value={selectObjValue}
                options={[
                  { value: "teal", label: t("globals.autocompleteOptTeal") },
                  { value: "cyan", label: t("globals.autocompleteOptCyan") },
                  { value: "blue", label: t("globals.autocompleteOptBlue"), disabled: true },
                  {
                    value: "long",
                    label: t("globals.selectLongOption"),
                  },
                ]}
                onChange={setSelectObjValue}
              />
            </div>
            <div
              id="sandbox-select-wide-short"
              className="sandbox-select-wide-host"
            >
              <Select
                fullWidth
                ariaLabel={t("globals.selectWideShortAria")}
                value={selectWideShortValue}
                options={[
                  {
                    value: "low",
                    label: t("globals.selectWideShortOptLow"),
                  },
                  {
                    value: "medium",
                    label: t("globals.selectWideShortOptMed"),
                  },
                ]}
                onChange={setSelectWideShortValue}
              />
              <SandboxHelp text={t("globals.selectWideShortHelp")} />
            </div>
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
            <InlineAlert
              severity="warning"
              message={t("globals.autocompleteDeprecatedAlert")}
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
        <GlobalsDemo id="number-input">
          <div className="sandbox-globals-row sandbox-globals-row--stack">
            <FieldBlock label={t("globals.numberInputLabel")}>
              <NumberInput
                value={numberValue}
                onChange={setNumberValue}
                min={0}
                max={24}
                step={1}
                aria-label={t("globals.numberInputAria")}
                supportingText={t("globals.numberInputSupporting")}
                incrementLabel={t("globals.numberInputInc")}
                decrementLabel={t("globals.numberInputDec")}
              />
            </FieldBlock>
            <FieldBlock label={t("globals.numberInputDenseLabel")}>
              <NumberInput
                size="sm"
                value={numberDenseValue}
                onChange={setNumberDenseValue}
                min={0}
                max={4}
                step={0.25}
                aria-label={t("globals.numberInputDenseAria")}
                supportingText={t("globals.numberInputDenseSupporting")}
                incrementLabel={t("globals.numberInputInc")}
                decrementLabel={t("globals.numberInputDec")}
              />
            </FieldBlock>
            <SandboxHelp text={t("globals.numberInputHelp")} />
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
          <div style={{ width: "min(100%, 14rem)" }}>
            <ToggleGroup
              size="compact"
              fullWidth
              showCheck={false}
              ariaLabel={t("globals.segmentedNarrowAria")}
              value={segmentNarrow}
              onChange={setSegmentNarrow}
              options={[
                { value: "all", label: t("globals.segmentedNarrowAll") },
                {
                  value: "alpha",
                  label: t("globals.segmentedNarrowAlpha"),
                  tip: t("globals.segmentedNarrowAlpha"),
                },
                {
                  value: "beta",
                  label: t("globals.segmentedNarrowBeta"),
                  tip: t("globals.segmentedNarrowBeta"),
                },
                {
                  value: "gamma",
                  label: t("globals.segmentedNarrowGamma"),
                  tip: t("globals.segmentedNarrowGamma"),
                },
              ]}
            />
          </div>
          <SandboxHelp text={t("globals.segmentedNarrowHelp")} />
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
          <SandboxHelp text={t("globals.progressHelp")} />
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
        <GlobalsDemo id="sandbox-inline-alert-recovery">
        <div
          id="sandbox-inline-alert-recovery-host"
          className="fynns-unit-stack"
          style={{ maxWidth: "40rem" }}
        >
          <InlineAlert severity="error" message={t("globals.inlineAlertRecoveryError")} />
          <FieldHint>{t("globals.inlineAlertRecoveryHint")}</FieldHint>
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Button variant="tonal" size="sm" type="button">
              {t("globals.inlineAlertRecoveryReload")}
            </Button>
          </div>
        </div>
        <SandboxHelp text={t("globals.inlineAlertRecoveryHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="env-check">
        <Card title={t("globals.envCheckCardTitle")}>
          <div className="fynns-unit-stack">
            <InlineAlert severity="warning" message={t("globals.envCheckAlert")} />
            <List aria-label={t("globals.envCheckListAria")}>
              <ListItem
                headline={t("globals.envCheckTokenHeadline")}
                supportingText={t("globals.envCheckTokenSupporting")}
                trailingSupportingText={t("globals.envCheckMissing")}
              />
              <ListItem
                headline={t("globals.envCheckAppHeadline")}
                supportingText={t("globals.envCheckAppSupporting")}
                trailingSupportingText={t("globals.envCheckMissing")}
              />
              <ListItem
                headline={t("globals.envCheckRegionHeadline")}
                supportingText={t("globals.envCheckRegionSupporting")}
                trailingSupportingText={t("globals.envCheckOk")}
              />
            </List>
            <ControlRow label={t("globals.envCheckRefreshLabel")}>
              <Button size="sm" variant="default">
                {t("globals.envCheckRecheck")}
              </Button>
            </ControlRow>
          </div>
        </Card>
        <SandboxHelp text={t("globals.envCheckHelp")} />
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
            <ToggleGroup
              size="compact"
              showCheck={false}
              ariaLabel={t("globals.chatThreadModeAria")}
              value={chatThreadMode}
              onChange={(v) =>
                setChatThreadMode(v === "empty" ? "empty" : "populated")
              }
              options={[
                {
                  value: "empty",
                  label: t("globals.chatThreadModeEmpty"),
                },
                {
                  value: "populated",
                  label: t("globals.chatThreadModePopulated"),
                },
              ]}
            />
            <Chat label={t("globals.chatLabel")} className="sandbox-chat-frame">
              <ChatThread
                empty={
                  <div className="fynns-unit-stack sandbox-chat-empty">
                    <EmptyState
                      title={t("globals.chatEmpty")}
                      description={t("globals.chatEmptyBody")}
                    />
                    <ChatEmptySurfaceStarters
                      ariaLabel={t("globals.chatStarterAria")}
                      items={[
                        {
                          id: "summarize",
                          label: t("globals.chatStarter1Label"),
                          prompt: t("globals.chatStarter1Prompt"),
                        },
                        {
                          id: "outline",
                          label: t("globals.chatStarter2Label"),
                          prompt: t("globals.chatStarter2Prompt"),
                        },
                        {
                          id: "rewrite",
                          label: t("globals.chatStarter3Label"),
                          prompt: t("globals.chatStarter3Prompt"),
                        },
                        {
                          id: "checklist",
                          label: t("globals.chatStarter4Label"),
                          prompt: t("globals.chatStarter4Prompt"),
                        },
                        {
                          id: "compare",
                          label: t("globals.chatStarter5Label"),
                          prompt: t("globals.chatStarter5Prompt"),
                        },
                        {
                          id: "explain",
                          label: t("globals.chatStarter6Label"),
                          prompt: t("globals.chatStarter6Prompt"),
                        },
                      ]}
                      onSelect={(prompt) => {
                        snackbar(t("globals.chatStarterSent", { prompt }), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        });
                        setChatThreadMode("populated");
                      }}
                    />
                  </div>
                }
              >
                {chatThreadMode === "populated" ? (
                  <>
                <ChatMessage role="system">{t("globals.chatSystem")}</ChatMessage>
                <ChatMessage
                  role="user"
                  markdown={t("globals.chatUserBody")}
                />
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
                    <ChatDemoActions
                      copyLabel={t("globals.chatCopyTip")}
                      retryLabel={t("globals.chatRetryTip")}
                      moreLabel={t("globals.chatMoreTip")}
                      moreShareLabel={t("globals.chatMoreShare")}
                      moreExportLabel={t("globals.chatMoreExport")}
                      onCopy={() =>
                        snackbar(t("globals.chatCopyDemo"), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        })
                      }
                      onRetry={() =>
                        snackbar(t("globals.chatRetryDemo"), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        })
                      }
                      onMoreShare={() =>
                        snackbar(t("globals.chatMoreShareDemo"), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        })
                      }
                      onMoreExport={() =>
                        snackbar(t("globals.chatMoreExportDemo"), {
                          dismissAriaLabel: t("globals.snackbarDismiss"),
                        })
                      }
                    />
                  }
                >
                  <ChatMarkdown source={t("globals.chatAssistantMarkdown")} />
                </ChatMessage>
                <ChatReveal>
                  <Surface variant="soft" padded>
                    {t("globals.chatRevealCard")}
                  </Surface>
                </ChatReveal>
                <ChatStreamingAssistant
                  key={chatStreamEpoch}
                  streaming={chatStreaming}
                  fullText={t("globals.chatStreamFull")}
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
                      <ChatDemoActions
                        copyLabel={t("globals.chatCopyTip")}
                        retryLabel={t("globals.chatRetryTip")}
                        moreLabel={t("globals.chatMoreTip")}
                        moreShareLabel={t("globals.chatMoreShare")}
                        moreExportLabel={t("globals.chatMoreExport")}
                        onCopy={() =>
                          snackbar(t("globals.chatCopyDemo"), {
                            dismissAriaLabel: t("globals.snackbarDismiss"),
                          })
                        }
                        onRetry={() =>
                          snackbar(t("globals.chatRetryDemo"), {
                            dismissAriaLabel: t("globals.snackbarDismiss"),
                          })
                        }
                        onMoreShare={() =>
                          snackbar(t("globals.chatMoreShareDemo"), {
                            dismissAriaLabel: t("globals.snackbarDismiss"),
                          })
                        }
                        onMoreExport={() =>
                          snackbar(t("globals.chatMoreExportDemo"), {
                            dismissAriaLabel: t("globals.snackbarDismiss"),
                          })
                        }
                      />
                    )
                  }
                >
                  {chatFailed ? undefined : t("globals.chatRetrySuccess")}
                </ChatMessage>
                <ChatMessage
                  role="user"
                  expandLabel={t("globals.chatExpand")}
                  collapseLabel={t("globals.chatCollapse")}
                  markdown={Array(12)
                    .fill(t("globals.chatUserBody"))
                    .join("\n\n")}
                />
                <ChatMessage
                  role="assistant"
                  expandLabel={t("globals.chatExpand")}
                  collapseLabel={t("globals.chatCollapse")}
                  markdown={Array(6)
                    .fill(t("globals.chatAssistantMarkdown"))
                    .join("\n\n")}
                />
                <ChatMessage role="system">
                  {Array(12).fill(t("globals.chatSystem")).join(" ")}
                </ChatMessage>
                  </>
                ) : null}
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
                  setChatThreadMode("populated");
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
              <ChatScrollToBottom label={t("globals.chatScrollBottom")} />
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
        <ChatTodoComposerDemo />
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
        <p className="sandbox-chat-aside-label">
          {t("globals.chatComposerLeadingMenusLabel")}
        </p>
        <div
          id="sandbox-chat-composer-leading-menus"
          className="sandbox-chat-composer-leading-menus-host"
        >
          {/* Same host teaches leading labeled Menu + endActions model sections. */}
          <div id="sandbox-chat-composer-model-sections">
            <ChatComposer
              value={chatComposerLeadingMenusDraft}
              onChange={setChatComposerLeadingMenusDraft}
              ariaLabel={t("globals.chatComposerLeadingMenusAria")}
              placeholder={t("globals.chatComposerPlaceholder")}
              onSubmit={() => setChatComposerLeadingMenusDraft("")}
              sendLabel={t("globals.chatSend")}
              leading={
                <>
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
                  <DropdownMenu
                    trigger={
                      chatComposerLeadingMenusVolume === "long"
                        ? t("globals.chatComposerLeadingMenusVolumeLong")
                        : t("globals.chatComposerLeadingMenusVolume")
                    }
                    ariaLabel={t("globals.chatComposerLeadingMenusVolumeAria")}
                    size="sm"
                    variant="ghost"
                    align="start"
                  >
                    <DropdownMenuItem
                      onClick={() => setChatComposerLeadingMenusVolume("short")}
                    >
                      {t("globals.chatComposerLeadingMenusVolume")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setChatComposerLeadingMenusVolume("long")}
                    >
                      {t("globals.chatComposerLeadingMenusVolumeLong")}
                    </DropdownMenuItem>
                  </DropdownMenu>
                </>
              }
              endActions={
                <ChatComposerModelMenuSections
                  trigger={t("globals.chatComposerLeadingMenusModel")}
                  ariaLabel={t("globals.chatComposerLeadingMenusModelAria")}
                  emptyLabel={t("globals.chatComposerModelMenuEmpty")}
                  sections={[
                    {
                      id: "local",
                      label: t("globals.chatComposerModelSectionLocal"),
                      models: [
                        t("globals.chatComposerLeadingMenusModel"),
                        t("globals.chatComposerModelLocalSample"),
                      ],
                    },
                    {
                      id: "cloud",
                      label: t("globals.chatComposerModelSectionCloud"),
                      models: [t("globals.chatComposerModelCloudSample")],
                    },
                    {
                      id: "cli",
                      label: t("globals.chatComposerModelSectionCli"),
                      models: [
                        t("globals.chatComposerModelCliCursor"),
                        t("globals.chatComposerModelCliCodex"),
                        t("globals.chatComposerModelCliClaude"),
                      ],
                    },
                  ]}
                  footer={
                    <DropdownMenuItem>
                      {t("globals.chatComposerModelMenuRefresh")}
                    </DropdownMenuItem>
                  }
                />
              }
            />
          </div>
        </div>
        <div
          id="sandbox-chat-composer-leading-menus-narrow"
          className="sandbox-chat-composer-leading-menus-narrow"
        >
          <ChatComposer
            value={chatComposerLeadingMenusDraft}
            onChange={setChatComposerLeadingMenusDraft}
            ariaLabel={t("globals.chatComposerLeadingMenusAria")}
            placeholder={t("globals.chatComposerPlaceholder")}
            onSubmit={() => setChatComposerLeadingMenusDraft("")}
            sendLabel={t("globals.chatSend")}
            leading={
              <>
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
                <DropdownMenu
                  trigger={
                    chatComposerLeadingMenusVolume === "long"
                      ? t("globals.chatComposerLeadingMenusVolumeLong")
                      : t("globals.chatComposerLeadingMenusVolume")
                  }
                  ariaLabel={t("globals.chatComposerLeadingMenusVolumeAria")}
                  size="sm"
                  variant="ghost"
                  align="start"
                >
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("short")}
                  >
                    {t("globals.chatComposerLeadingMenusVolume")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("long")}
                  >
                    {t("globals.chatComposerLeadingMenusVolumeLong")}
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            }
            endActions={
              <ChatComposerModelMenuSections
                trigger={t("globals.chatComposerLeadingMenusModel")}
                ariaLabel={t("globals.chatComposerLeadingMenusModelAria")}
                emptyLabel={t("globals.chatComposerModelMenuEmpty")}
                sections={[
                  {
                    id: "local",
                    label: t("globals.chatComposerModelSectionLocal"),
                    models: [
                      t("globals.chatComposerLeadingMenusModel"),
                      t("globals.chatComposerModelLocalSample"),
                    ],
                  },
                  {
                    id: "cloud",
                    label: t("globals.chatComposerModelSectionCloud"),
                    models: [t("globals.chatComposerModelCloudSample")],
                  },
                  {
                    id: "cli",
                    label: t("globals.chatComposerModelSectionCli"),
                    models: [
                      t("globals.chatComposerModelCliCursor"),
                      t("globals.chatComposerModelCliCodex"),
                      t("globals.chatComposerModelCliClaude"),
                    ],
                  },
                ]}
                footer={
                  <DropdownMenuItem>
                    {t("globals.chatComposerModelMenuRefresh")}
                  </DropdownMenuItem>
                }
              />
            }
          />
        </div>
        <SandboxHelp text={t("globals.chatComposerLeadingMenusNarrowHelp")} />
        <SandboxHelp text={t("globals.chatComposerLeadingMenusHelp")} />

        <p className="sandbox-chat-aside-label">
          {t("globals.chatComposerThinkingToggleLabel")}
        </p>
        <div
          id="sandbox-chat-composer-thinking-toggle"
          className="sandbox-chat-composer-leading-menus-host"
        >
          <ChatComposer
            value={chatComposerLeadingMenusDraft}
            onChange={setChatComposerLeadingMenusDraft}
            ariaLabel={t("globals.chatComposerThinkingToggleAria")}
            placeholder={t("globals.chatComposerPlaceholder")}
            onSubmit={() => setChatComposerLeadingMenusDraft("")}
            sendLabel={t("globals.chatSend")}
            leading={
              <>
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
                <DropdownMenu
                  trigger={
                    chatComposerLeadingMenusVolume === "long"
                      ? t("globals.chatComposerLeadingMenusVolumeLong")
                      : t("globals.chatComposerLeadingMenusVolume")
                  }
                  ariaLabel={t("globals.chatComposerLeadingMenusVolumeAria")}
                  size="sm"
                  variant="ghost"
                  align="start"
                >
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("short")}
                  >
                    {t("globals.chatComposerLeadingMenusVolume")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("long")}
                  >
                    {t("globals.chatComposerLeadingMenusVolumeLong")}
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            }
            endActions={
              <ChatComposerModeTogglesEndActions
                modelTrigger={t("globals.chatComposerLeadingMenusModel")}
                modelAriaLabel={t("globals.chatComposerLeadingMenusModelAria")}
                modelEmptyLabel={t("globals.chatComposerModelMenuEmpty")}
                modelSections={[
                  {
                    id: "local",
                    label: t("globals.chatComposerModelSectionLocal"),
                    models: [t("globals.chatComposerLeadingMenusModel")],
                  },
                  {
                    id: "cloud",
                    label: t("globals.chatComposerModelSectionCloud"),
                    models: [t("globals.chatComposerModelCloudSample")],
                  },
                  {
                    id: "cli",
                    label: t("globals.chatComposerModelSectionCli"),
                    models: [t("globals.chatComposerModelCliCursor")],
                  },
                ]}
                thinkingPressed={chatComposerThinkingOn}
                onThinkingChange={setChatComposerThinkingOn}
                thinkingLabel={t("globals.chatComposerThinking")}
                thinkingAriaLabel={t("globals.chatComposerThinkingAria")}
                thinkingTip={t("globals.chatComposerThinkingTip")}
                visionPressed={chatComposerVisionOn}
                onVisionChange={setChatComposerVisionOn}
                visionLabel={t("globals.chatComposerVision")}
                visionAriaLabel={t("globals.chatComposerVisionAria")}
                visionTip={t("globals.chatComposerVisionTip")}
              />
            }
          />
        </div>
        <SandboxHelp text={t("globals.chatComposerThinkingToggleHelp")} />
        <p className="sandbox-chat-aside-label">
          {t("globals.chatComposerThinkingToggleNarrowLabel")}
        </p>
        <div
          id="sandbox-chat-composer-thinking-toggle-narrow"
          className="sandbox-chat-composer-leading-menus-narrow"
        >
          <ChatComposer
            value={chatComposerLeadingMenusDraft}
            onChange={setChatComposerLeadingMenusDraft}
            ariaLabel={t("globals.chatComposerThinkingToggleNarrowAria")}
            placeholder={t("globals.chatComposerPlaceholder")}
            onSubmit={() => setChatComposerLeadingMenusDraft("")}
            sendLabel={t("globals.chatSend")}
            leading={
              <>
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
                <DropdownMenu
                  trigger={
                    chatComposerLeadingMenusVolume === "long"
                      ? t("globals.chatComposerLeadingMenusVolumeLong")
                      : t("globals.chatComposerLeadingMenusVolume")
                  }
                  ariaLabel={t("globals.chatComposerLeadingMenusVolumeAria")}
                  size="sm"
                  variant="ghost"
                  align="start"
                >
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("short")}
                  >
                    {t("globals.chatComposerLeadingMenusVolume")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setChatComposerLeadingMenusVolume("long")}
                  >
                    {t("globals.chatComposerLeadingMenusVolumeLong")}
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            }
            endActions={
              <ChatComposerModeTogglesEndActions
                modelTrigger={t("globals.chatComposerLeadingMenusModel")}
                modelAriaLabel={t("globals.chatComposerLeadingMenusModelAria")}
                modelEmptyLabel={t("globals.chatComposerModelMenuEmpty")}
                modelSections={[
                  {
                    id: "local",
                    label: t("globals.chatComposerModelSectionLocal"),
                    models: [t("globals.chatComposerLeadingMenusModel")],
                  },
                  {
                    id: "cloud",
                    label: t("globals.chatComposerModelSectionCloud"),
                    models: [t("globals.chatComposerModelCloudSample")],
                  },
                  {
                    id: "cli",
                    label: t("globals.chatComposerModelSectionCli"),
                    models: [t("globals.chatComposerModelCliCursor")],
                  },
                ]}
                thinkingPressed={chatComposerThinkingOn}
                onThinkingChange={setChatComposerThinkingOn}
                thinkingLabel={t("globals.chatComposerThinking")}
                thinkingAriaLabel={t("globals.chatComposerThinkingAria")}
                thinkingTip={t("globals.chatComposerThinkingTip")}
                visionPressed={chatComposerVisionOn}
                onVisionChange={setChatComposerVisionOn}
                visionLabel={t("globals.chatComposerVision")}
                visionAriaLabel={t("globals.chatComposerVisionAria")}
                visionTip={t("globals.chatComposerVisionTip")}
              />
            }
          />
        </div>
        <SandboxHelp text={t("globals.chatComposerThinkingToggleNarrowHelp")} />
        <p className="sandbox-chat-aside-label">
          {t("globals.chatComposerModelEmptyLabel")}
        </p>
        <div
          id="sandbox-chat-composer-model-empty"
          className="sandbox-chat-composer-leading-menus-host"
        >
          <ChatComposer
            value={chatComposerLeadingMenusDraft}
            onChange={setChatComposerLeadingMenusDraft}
            ariaLabel={t("globals.chatComposerModelEmptyAria")}
            placeholder={t("globals.chatComposerPlaceholder")}
            onSubmit={() => setChatComposerLeadingMenusDraft("")}
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
            endActions={
              <ChatComposerModelMenuSections
                trigger={t("globals.chatComposerModelEmptyTrigger")}
                ariaLabel={t("globals.chatComposerModelEmptyAria")}
                emptyLabel={t("globals.chatComposerModelMenuEmpty")}
                sections={[]}
                footer={
                  <DropdownMenuItem>
                    {t("globals.chatComposerModelMenuRefresh")}
                  </DropdownMenuItem>
                }
              />
            }
          />
        </div>
        <SandboxHelp text={t("globals.chatComposerModelSectionsHelp")} />
        <SandboxHelp text={t("globals.chatHelp")} />
        <TokenList group="chat" title={t("globals.tokenListChat")} />
        <TokenList group="chatmessage" title={t("globals.tokenListChatMessage")} />
        </GlobalsDemo>
        <GlobalsDemo id="chat-collapse">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp text={t("globals.chatCollapseHelp")} />
          <ChatMessage
            role="user"
            expandLabel={t("globals.chatExpand")}
            collapseLabel={t("globals.chatCollapse")}
            markdown={t("globals.chatUserBody")}
          />
          <ChatMessage
            role="user"
            expandLabel={t("globals.chatExpand")}
            collapseLabel={t("globals.chatCollapse")}
            markdown={Array(24).fill(t("globals.chatUserBody")).join("\n\n")}
          />
          <ChatMessage
            role="assistant"
            expandLabel={t("globals.chatExpand")}
            collapseLabel={t("globals.chatCollapse")}
            markdown={Array(6)
              .fill(t("globals.chatAssistantMarkdown"))
              .join("\n\n")}
          />
          <ChatMessage
            role="assistant"
            streaming
            streamingLabel={t("globals.chatStreamingLabel")}
            expandLabel={t("globals.chatExpand")}
            collapseLabel={t("globals.chatCollapse")}
            markdown={Array(6)
              .fill(t("globals.chatAssistantMarkdown"))
              .join("\n\n")}
          />
          <ChatMessage role="system">
            {Array(40).fill(t("globals.chatSystem")).join(" ")}
          </ChatMessage>
        </div>
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
            streaming={thinkingStreaming}
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
          <div className="sandbox-activity-narrow">
          <ChatMessage
            role="assistant"
            streaming={activityStreaming}
            thinking={
              <ChatActivity
                label={activityHeader}
                streaming={activityStreaming}
                defaultOpen
              >
                {activityPhase >= 1 ? (
                  <ChatActivityStep
                    key="create"
                    status="done"
                    label={t("globals.activityStepCreate")}
                  />
                ) : null}
                {activityPhase >= 2 ? (
                  <ChatActivityStep
                    key="update"
                    status="done"
                    label={t("globals.activityStepUpdate")}
                  />
                ) : null}
                <ChatActivityStep
                  key="live"
                  status={activityPhase >= 3 ? "done" : "active"}
                  label={
                    activityPhase >= 3
                      ? t("globals.activityStepPresentDone")
                      : activityPhase <= 0
                        ? t("globals.activityStepGather")
                        : activityPhase === 1
                          ? t("globals.activityStepRead")
                          : t("globals.activityStepPresent")
                  }
                  description={
                    activityPhase >= 3 ? undefined : activityPhase >= 2 ? (
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
                {activityPhase >= 3 ? (
                  <ChatActivityStep
                    key="slots"
                    status="done"
                    label={t("globals.activityStepSlots")}
                    description={
                      <div className="fynns-unit-stack">
                        <ControlStack columns={1}>
                          <ControlRow label={t("globals.activitySlotRegion")}>
                            <div className="fynns-control-cluster">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={t("globals.activitySlotRegionValue")}
                              >
                                {t("globals.activitySlotRegionValue")}
                              </Button>
                              <InfoHint
                                size="sm"
                                content={t("globals.activitySlotRegionTip")}
                                ariaLabel={t("globals.activitySlotRegionTip")}
                              />
                            </div>
                          </ControlRow>
                          <ControlRow label={t("globals.activitySlotMode")}>
                            <div className="fynns-control-cluster">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={t("globals.activitySlotModeValue")}
                              >
                                {t("globals.activitySlotModeValue")}
                              </Button>
                              <InfoHint
                                size="sm"
                                content={t("globals.activitySlotModeTip")}
                                ariaLabel={t("globals.activitySlotModeTip")}
                              />
                            </div>
                          </ControlRow>
                          <ControlRow label={t("globals.activitySlotStatus")}>
                            <div className="fynns-control-cluster">
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={t("globals.activitySlotStatusValue")}
                              >
                                {t("globals.activitySlotStatusValue")}
                              </Button>
                              <InfoHint
                                size="sm"
                                content={t("globals.activitySlotStatusTip")}
                                ariaLabel={t("globals.activitySlotStatusTip")}
                              />
                            </div>
                          </ControlRow>
                        </ControlStack>
                      </div>
                    }
                  />
                ) : null}
              </ChatActivity>
            }
          >
            {activityStreaming ? undefined : t("globals.activityAnswer")}
          </ChatMessage>
          </div>
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
          <Collapsible
            title={t("globals.activityArtifactOptionalTitle")}
            chrome="plain"
            defaultOpen={false}
          >
            <div className="sandbox-activity-narrow fynns-unit-stack">
              <SandboxHelp text={t("globals.activityArtifactOptionalHelp")} />
              <ChatMessage
                role="assistant"
                thinking={
                  <ChatActivity
                    label={t("globals.activityHeaderDone")}
                    defaultOpen
                  >
                    <ChatActivityStep
                      status="done"
                      label={t("globals.activityStepUpdate")}
                      artifact={
                        <ChatActivityArtifact>
                          {t("globals.activityArtifactPlan")}
                        </ChatActivityArtifact>
                      }
                    />
                  </ChatActivity>
                }
              >
                {t("globals.activityAnswer")}
              </ChatMessage>
            </div>
          </Collapsible>
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
        <SandboxHelp text={t("globals.avatarInitialsHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="avatar-group">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <AvatarGroup max={3} size="sm" aria-label={t("globals.avatarGroupHelp")}>
            <Avatar name="Ada Lovelace" alt="Ada" />
            <Avatar name="Grace Hopper" alt="Grace" />
            <Avatar name="Katherine Johnson" alt="Katherine" />
            <Avatar name="Dorothy Vaughan" alt="Dorothy" />
            <Avatar name="Mary Jackson" alt="Mary" />
          </AvatarGroup>
        </div>
        <SandboxHelp text={t("globals.avatarGroupHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="list">
        <div className="sandbox-globals-list sandbox-stack">
          <List aria-label={t("globals.listAria")}>
            <ListItem
              headline={t("globals.listOneLine")}
              leading={<FolderOpenIcon />}
              trailing={<ChevronRightIcon />}
              trailingSupportingText="24"
              selected={listId === "inbox"}
              onClick={() => setListId("inbox")}
            />
            <ListItem
              headline={t("globals.listTwoLine")}
              supportingText={t("globals.listTwoLineSupporting")}
              leading={<Avatar name="Ada Lovelace" alt={t("globals.avatarAda")} />}
              trailingSupportingText="10:24"
              selected={listId === "starred"}
              onClick={() => setListId("starred")}
            />
            <ListItem
              overline={t("globals.listOverline")}
              headline={t("globals.listThreeLine")}
              supportingText={t("globals.listThreeLineSupporting")}
              leading={<InfoIcon />}
              trailing={<ChevronRightIcon />}
              selected={listId === "sent"}
              onClick={() => setListId("sent")}
            />
            <ListItem
              headline={t("globals.listStatic")}
              supportingText={t("globals.listStaticSupporting")}
              leading={<SettingsIcon />}
            />
            <ListItem
              headline={t("globals.listDisabled")}
              supportingText={t("globals.listDisabledSupporting")}
              leading={<ArchiveIcon />}
              disabled
              onClick={() => {}}
            />
          </List>
          <SandboxHelp text={t("globals.listHostToneHelp")} />
          <List aria-label={t("globals.listHostToneAria")}>
            <ListItem
              headline={t("globals.listHostToneAccent")}
              supportingText={t("globals.listHostToneAccentSupporting")}
              trailingSupportingText={t("globals.listHostToneAccentMeta")}
              leading={<FolderOpenIcon />}
              selected={listId === "tone-a"}
              onClick={() => setListId("tone-a")}
            />
            <ListItem
              headline={t("globals.listHostToneMuted")}
              supportingText={t("globals.listHostToneMutedSupporting")}
              trailingSupportingText={t("globals.listHostToneMutedMeta")}
              leading={<FileIcon />}
              selected={listId === "tone-b"}
              onClick={() => setListId("tone-b")}
            />
            <ListItem
              headline={t("globals.listHostTonePlain")}
              supportingText={t("globals.listHostTonePlainSupporting")}
              trailingSupportingText={t("globals.listHostTonePlainMeta")}
              leading={<SettingsIcon />}
              selected={listId === "tone-c"}
              onClick={() => setListId("tone-c")}
            />
          </List>
          <SandboxHelp text={t("globals.listOrgDatesHelp")} />
          <List
            aria-label={t("globals.listOrgDatesAria")}
            trailingMetaAlign="start"
          >
            <ListItem
              headline={t("globals.listOrgDatesHeadline")}
              overline={t("globals.listOrgDatesStatus")}
              supportingText={t("globals.listOrgDatesOrg")}
              trailingSupportingText={t("globals.listOrgDatesRange")}
              leading={<BriefcaseIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              headline={t("globals.listOrgDatesHeadlineShort")}
              overline={t("globals.listOrgDatesStatusB")}
              supportingText={t("globals.listOrgDatesOrgB")}
              trailingSupportingText={t("globals.listOrgDatesRangeShort")}
              leading={<BriefcaseIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              headline={t("globals.listOrgDatesHeadlineC")}
              overline={t("globals.listOrgDatesStatusC")}
              supportingText={t("globals.listOrgDatesOrgC")}
              trailingSupportingText={t("globals.listOrgDatesRangeC")}
              leading={<ClipboardIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
          </List>
          <SandboxHelp text={t("globals.listStatusActionHelp")} />
          <List
            aria-label={t("globals.listStatusActionAria")}
            id="sandbox-list-status-action"
          >
            <ListItem
              headline={t("globals.listStatusActionHeadline")}
              trailingSupportingText={t("globals.listStatusActionMeta")}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listStatusActionAssist")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listStatusActionAssist")}
                      onClick={(e) => {
                        e.stopPropagation();
                        snackbar(t("globals.listStatusActionAssistSnack"));
                      }}
                    >
                      <SparklesIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listCatalogRemove")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogRemove")}
                      onClick={(e) => {
                        e.stopPropagation();
                        snackbar(t("globals.listCatalogRemoveSnack"));
                      }}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => {
                setListCatalogEditName(t("globals.listStatusActionHeadline"));
                setListCatalogEditOpen(true);
              }}
            />
          </List>
          <SandboxHelp text={t("globals.listInspectorTrailingHelp")} />
          <List
            aria-label={t("globals.listInspectorTrailingAria")}
            id="sandbox-list-inspector-trailing"
          >
            <ListItem
              overline={t("globals.listInspectorTrailingOverline")}
              headline={t("globals.listInspectorTrailingHeadlineGap")}
              supportingText={t("globals.listInspectorTrailingSupportingTall")}
              trailingSupportingText={t("globals.listInspectorTrailingMetaGap")}
              trailing={
                <div className="fynns-control-cluster">
                  <Button
                    size="sm"
                    variant="tonal"
                    onClick={(e) => {
                      e.stopPropagation();
                      snackbar(t("globals.listInspectorTrailingCtaSnack"));
                    }}
                  >
                    {t("globals.listInspectorTrailingCta")}
                  </Button>
                  <Select
                    ariaLabel={t("globals.listInspectorTrailingKind")}
                    value={listInspectorKindGap}
                    onChange={setListInspectorKindGap}
                    options={[
                      {
                        value: "skill",
                        label: t("globals.listInspectorTrailingKindSkill"),
                      },
                      {
                        value: "tool",
                        label: t("globals.listInspectorTrailingKindTool"),
                      },
                    ]}
                  />
                </div>
              }
            />
            <ListItem
              overline={t("globals.listInspectorTrailingOverline")}
              headline={t("globals.listInspectorTrailingHeadlineGapB")}
              trailingSupportingText={t("globals.listInspectorTrailingMetaGap")}
              trailing={
                <div className="fynns-control-cluster">
                  <Button
                    size="sm"
                    variant="tonal"
                    onClick={(e) => {
                      e.stopPropagation();
                      snackbar(t("globals.listInspectorTrailingCtaSnack"));
                    }}
                  >
                    {t("globals.listInspectorTrailingCta")}
                  </Button>
                  <Select
                    ariaLabel={t("globals.listInspectorTrailingKind")}
                    value={listInspectorKindGap}
                    onChange={setListInspectorKindGap}
                    options={[
                      {
                        value: "skill",
                        label: t("globals.listInspectorTrailingKindSkill"),
                      },
                      {
                        value: "tool",
                        label: t("globals.listInspectorTrailingKindTool"),
                      },
                    ]}
                  />
                </div>
              }
            />
            <ListItem
              overline={t("globals.listInspectorTrailingOverline")}
              headline={t("globals.listInspectorTrailingHeadlineMapped")}
              trailing={
                <div className="fynns-control-cluster">
                  <Select
                    ariaLabel={t("globals.listInspectorTrailingKind")}
                    value={listInspectorKindMapped}
                    onChange={setListInspectorKindMapped}
                    options={[
                      {
                        value: "skill",
                        label: t("globals.listInspectorTrailingKindSkill"),
                      },
                      {
                        value: "tool",
                        label: t("globals.listInspectorTrailingKindTool"),
                      },
                    ]}
                  />
                </div>
              }
            />
          </List>
          <SandboxHelp text={t("globals.listRunSummaryHelp")} />
          <div id="sandbox-list-run-summary-narrow">
          <List
            aria-label={t("globals.listRunSummaryAria")}
            trailingMetaAlign="start"
          >
            <ListItem
              headline={
                <span className="fynns-control-cluster">
                  <span className="fynns-list-item-status">
                    <CheckCircleIcon aria-hidden />
                    {t("globals.listRunSummaryOk")}
                  </span>
                  <span className="fynns-control-cluster__grow">
                    <OverflowTip content={t("globals.listRunSummaryModel")}>
                      {t("globals.listRunSummaryModel")}
                    </OverflowTip>
                  </span>
                  <span className="fynns-table-meta">
                    <span>{t("globals.listRunSummaryDuration")}</span>
                  </span>
                </span>
              }
              trailingSupportingText={t("globals.listRunSummaryTime")}
              trailing={<ChevronRightIcon />}
              selected={listId === "run-ok"}
              onClick={() => setListId("run-ok")}
            />
            <ListItem
              headline={
                <span className="fynns-control-cluster">
                  <span className="fynns-list-item-status" data-tone="danger">
                    <AlertTriangleIcon aria-hidden />
                    {t("globals.listRunSummaryFail")}
                  </span>
                  <span className="fynns-control-cluster__grow">
                    <OverflowTip content={t("globals.listRunSummaryModelB")}>
                      {t("globals.listRunSummaryModelB")}
                    </OverflowTip>
                  </span>
                  <span className="fynns-table-meta">
                    <span>{t("globals.listRunSummaryDurationB")}</span>
                  </span>
                </span>
              }
              trailingSupportingText={t("globals.listRunSummaryTimeB")}
              trailing={<ChevronRightIcon />}
              selected={listId === "run-fail"}
              onClick={() => setListId("run-fail")}
            />
            <ListItem
              headline={
                <span className="fynns-control-cluster">
                  <span className="fynns-list-item-status">
                    <CheckCircleIcon aria-hidden />
                    {t("globals.listRunSummaryOk")}
                  </span>
                  <span className="fynns-control-cluster__grow">
                    <OverflowTip content={t("globals.listRunSummaryModelOverflow")}>
                      {t("globals.listRunSummaryModelOverflow")}
                    </OverflowTip>
                  </span>
                  <span className="fynns-table-meta">
                    <BarChartIcon aria-hidden />
                    <span>{t("globals.listRunSummaryDurationOverflow")}</span>
                  </span>
                  <span className="fynns-table-meta">
                    <span>{t("globals.listRunSummaryTokens")}</span>
                  </span>
                </span>
              }
              trailingSupportingText={t("globals.listRunSummaryTimeOverflow")}
              trailing={<ChevronRightIcon />}
              selected={listId === "run-overflow"}
              onClick={() => setListId("run-overflow")}
            />
          </List>
          </div>
          <Dialog
            open={listCatalogEditOpen}
            onOpenChange={setListCatalogEditOpen}
            title={t("globals.listCatalogEditDialogTitle")}
            size="lg"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
            feet={
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setListCatalogEditOpen(false)}
                >
                  {t("globals.formRecipeDialogCancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setListCatalogEditOpen(false);
                    snackbar(t("globals.listCatalogEditDialogSaved"));
                  }}
                >
                  {t("globals.formRecipeSave")}
                </Button>
              </div>
            }
          >
            <FieldStack>
              <FieldBlock label={t("globals.listCatalogEditDialogName")}>
                <Input
                  value={listCatalogEditName}
                  onChange={(e) => setListCatalogEditName(e.target.value)}
                />
              </FieldBlock>
              <FieldBlock
                label={t("globals.listCatalogEditDialogNotes")}
                description={t("globals.listCatalogEditDialogNotesHint")}
              >
                <Textarea
                  minRows={3}
                  placeholder={t("globals.listCatalogEditDialogNotesPh")}
                />
              </FieldBlock>
            </FieldStack>
          </Dialog>
          <SandboxHelp text={t("globals.listCatalogHelp")} />
          <List aria-label={t("globals.listCatalogAria")}>
            <ListItem
              headline={t("globals.listCatalogProject")}
              supportingText={t("globals.listCatalogProjectPath")}
              leading={<FolderOpenIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listCatalogRemove")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogRemove")}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              headline={t("globals.listCatalogConfig")}
              supportingText={t("globals.listCatalogConfigPath")}
              leading={<FileIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listCatalogRemove")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogRemove")}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              headline={t("globals.listCatalogRules")}
              supportingText={t("globals.listCatalogRulesPath")}
              leading={<FileIcon />}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listCatalogEdit")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogEdit")}
                    >
                      <PencilIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listCatalogRemove")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.listCatalogRemove")}
                    >
                      <TrashIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
          </List>
          <SandboxHelp text={t("globals.listShortcutCardHelp")} />
          <Card
            title={t("globals.listShortcutCardTitle")}
            actions={
              <div className="fynns-control-cluster">
                <Tooltip content={t("globals.listShortcutCardRefresh")}>
                        <IconButton
                          variant="ghost"
                    aria-label={t("globals.listShortcutCardRefresh")}
                    onClick={() => snackbar(t("globals.listShortcutCardRefreshSnack"))}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </div>
            }
          >
            <List aria-label={t("globals.listShortcutCardAria")}>
              <ListItem
                headline={t("globals.listShortcutCardFolder")}
                supportingText={t("globals.listShortcutCardFolderPath")}
                leading={<FolderOpenIcon />}
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listCatalogOpen")}>
                        <IconButton
                          variant="ghost"
                        aria-label={t("globals.listCatalogOpen")}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
                onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
              />
              <ListItem
                headline={t("globals.listShortcutCardFile")}
                supportingText={t("globals.listShortcutCardFilePath")}
                leading={<FileIcon />}
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listCatalogOpen")}>
                        <IconButton
                          variant="ghost"
                        aria-label={t("globals.listCatalogOpen")}
                      >
                        <FileIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
                onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
              />
              <ListItem
                headline={t("globals.listShortcutCardUrl")}
                supportingText={t("globals.listShortcutCardUrlPath")}
                leading={<GlobeIcon />}
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listCatalogOpen")}>
                        <IconButton
                          variant="ghost"
                        aria-label={t("globals.listCatalogOpen")}
                      >
                        <GlobeIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
                onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
              />
            </List>
          </Card>
          <SandboxHelp text={t("globals.listRecipeCatalogHelp")} />
          <div id="sandbox-list-recipe-catalog">
            <Card title={t("globals.listRecipeCatalogTitle")}>
              <List aria-label={t("globals.listRecipeCatalogAria")}>
                <ListItem
                  headline={t("globals.listRecipeA")}
                  supportingText={t("globals.listRecipeASupporting")}
                  trailingSupportingText={t("globals.listRecipeAMeta")}
                  leading={<SparklesIcon />}
                  trailing={
                    <div className="fynns-control-cluster">
                      <Tooltip content={t("globals.listRecipeCatalogPreview")}>
                        <IconButton
                          variant="ghost"
                          aria-label={t("globals.listRecipeCatalogPreview")}
                          onClick={(e) => {
                            e.stopPropagation();
                            setListRecipeDetail("a");
                            setListRecipeOpen(true);
                          }}
                        >
                          <EyeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content={t("globals.listRecipeCatalogExport")}>
                        <IconButton
                          variant="ghost"
                          aria-label={t("globals.listRecipeCatalogExport")}
                          onClick={(e) => {
                            e.stopPropagation();
                            snackbar(t("globals.listRecipeCatalogExport"));
                          }}
                        >
                          <UploadIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                  onClick={() => {
                    setListRecipeDetail("a");
                    setListRecipeOpen(true);
                  }}
                />
                <ListItem
                  headline={t("globals.listRecipeB")}
                  supportingText={t("globals.listRecipeBSupporting")}
                  trailingSupportingText={t("globals.listRecipeBMeta")}
                  leading={<ClipboardIcon />}
                  trailing={
                    <div className="fynns-control-cluster">
                      <Tooltip content={t("globals.listRecipeCatalogPreview")}>
                        <IconButton
                          variant="ghost"
                          aria-label={t("globals.listRecipeCatalogPreview")}
                          onClick={(e) => {
                            e.stopPropagation();
                            setListRecipeDetail("b");
                            setListRecipeOpen(true);
                          }}
                        >
                          <EyeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content={t("globals.listRecipeCatalogExport")}>
                        <IconButton
                          variant="ghost"
                          aria-label={t("globals.listRecipeCatalogExport")}
                          onClick={(e) => {
                            e.stopPropagation();
                            snackbar(t("globals.listRecipeCatalogExport"));
                          }}
                        >
                          <UploadIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                  onClick={() => {
                    setListRecipeDetail("b");
                    setListRecipeOpen(true);
                  }}
                />
              </List>
            </Card>
            <Dialog
              open={listRecipeOpen}
              onOpenChange={setListRecipeOpen}
              title={t("globals.listRecipeCatalogDialogTitle")}
              size="lg"
              showCloseButton
              closeAriaLabel={t("globals.listRecipeCatalogDialogClose")}
            >
              <FieldHint>
                {listRecipeDetail === "b"
                  ? t("globals.listRecipeBDetail")
                  : t("globals.listRecipeADetail")}
              </FieldHint>
            </Dialog>
          </div>
          <SandboxHelp text={t("globals.listCatalogStaticHelp")} />
          <div id="sandbox-list-repo-path-actions">
            <Card
              title={t("globals.listRepoPathCardTitle")}
              chrome="plain"
              actions={
                <div className="fynns-control-cluster">
                  <Button
                    variant="primary"
                    loading={listRepoRunScope === "batch"}
                    disabled={listRepoRunScope != null && listRepoRunScope !== "batch"}
                    onClick={() => {
                      setListRepoRunScope("batch");
                      window.setTimeout(() => setListRepoRunScope(null), 1200);
                    }}
                  >
                    {t("globals.listRepoPathBatchRebuild")}
                  </Button>
                </div>
              }
            >
            <List
              className="fynns-scroll"
              aria-label={t("globals.listCatalogStaticAria")}
              style={{
                maxHeight: "var(--fynns-layout-list-well-max-height-sm)",
              }}
            >
              <ListItem
                interactive={false}
                lines={3}
                overline={t("globals.listRepoPathOverline")}
                headline={t("globals.listRepoPathName")}
                supportingText={t("globals.listRepoPathPath")}
                leading={
                  <Checkbox
                    label=""
                    aria-label={t("globals.listRepoPathEnable")}
                    checked={listRepoPathEnabled}
                    onCheckedChange={setListRepoPathEnabled}
                  />
                }
                trailingSupportingText={
                  <span className="fynns-table-meta">
                    {t("globals.listRepoPathMeta")}
                  </span>
                }
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listRepoPathRefresh")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listRepoPathRefresh")}
                        disabled={listRepoRunScope === "batch"}
                        loading={listRepoRunScope === "sample-repo"}
                        onClick={() => {
                          setListRepoRunScope("sample-repo");
                          window.setTimeout(() => setListRepoRunScope(null), 1200);
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogFolder")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogFolder")}
                        disabled={listRepoRunScope != null}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogRemove")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogRemove")}
                        disabled={listRepoRunScope != null}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              />
              <ListItem
                interactive={false}
                lines={3}
                overline={t("globals.listRepoPathOverline")}
                headline={t("globals.listRepoPathName2")}
                supportingText={t("globals.listRepoPathPath2")}
                leading={
                  <Checkbox
                    label=""
                    aria-label={t("globals.listRepoPathEnable")}
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                }
                trailingSupportingText={
                  <span className="fynns-table-meta">
                    {t("globals.listRepoPathMeta2")}
                  </span>
                }
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listRepoPathRefresh")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listRepoPathRefresh")}
                        disabled={listRepoRunScope === "batch"}
                        loading={listRepoRunScope === "sample-notes"}
                        onClick={() => {
                          setListRepoRunScope("sample-notes");
                          window.setTimeout(() => setListRepoRunScope(null), 1200);
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogFolder")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogFolder")}
                        disabled={listRepoRunScope != null}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogRemove")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogRemove")}
                        disabled={listRepoRunScope != null}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              />
              <ListItem
                interactive={false}
                lines={3}
                overline={t("globals.listRepoPathOverline")}
                headline={t("globals.listRepoPathName3")}
                supportingText={t("globals.listRepoPathPath3")}
                leading={
                  <Checkbox
                    label=""
                    aria-label={t("globals.listRepoPathEnable")}
                    checked
                    onCheckedChange={() => {}}
                  />
                }
                trailingSupportingText={
                  <span className="fynns-table-meta">
                    {t("globals.listRepoPathMeta3")}
                  </span>
                }
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listRepoPathRefresh")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listRepoPathRefresh")}
                        disabled={listRepoRunScope === "batch"}
                        loading={listRepoRunScope === "sample-tools"}
                        onClick={() => {
                          setListRepoRunScope("sample-tools");
                          window.setTimeout(() => setListRepoRunScope(null), 1200);
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogFolder")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogFolder")}
                        disabled={listRepoRunScope != null}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogRemove")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogRemove")}
                        disabled={listRepoRunScope != null}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              />
              <ListItem
                interactive={false}
                lines={2}
                overline={t("globals.listCatalogStaticOrigin")}
                headline={t("globals.listCatalogStaticFile")}
                supportingText={t("globals.listCatalogStaticPath")}
                trailingSupportingText={
                  <span className="fynns-table-meta">
                    {t("globals.listCatalogStaticKind")}
                  </span>
                }
                trailing={
                  <div className="fynns-control-cluster">
                    <Tooltip content={t("globals.listCatalogOpen")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogOpen")}
                        disabled={listRepoRunScope != null}
                      >
                        <FileIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content={t("globals.listCatalogFolder")}>
                      <IconButton
                        variant="ghost"
                        aria-label={t("globals.listCatalogFolder")}
                        disabled={listRepoRunScope != null}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              />
            </List>
            </Card>
          </div>
          <SandboxHelp text={t("globals.listStatsHelp")} />
          <List aria-label={t("globals.listStatsAria")}>
            <ListItem
              overline={t("globals.listStatsRow1Overline")}
              headline={t("globals.listStatsRow1Headline")}
              supportingText={t("globals.listStatsRow1Path")}
              trailingSupportingText={
                <span className="fynns-list-item-trailing-stats">
                  <span>{t("globals.listStatsRow1Elapse")}</span>
                  <span>{t("globals.listStatsRow1Tokens")}</span>
                  <span>{t("globals.listStatsRow1Cost")}</span>
                  <span className="fynns-table-meta">{t("globals.listStatsRow1Count")}</span>
                </span>
              }
              trailing={
                <Tooltip content={t("globals.listTreeOpen")}>
                        <IconButton
                          variant="ghost"
                    aria-label={t("globals.listTreeOpen")}
                  >
                    <MessageSquareIcon />
                  </IconButton>
                </Tooltip>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              overline={t("globals.listStatsRow2Overline")}
              headline={t("globals.listStatsRow2Headline")}
              supportingText={t("globals.listStatsRow2Path")}
              trailingSupportingText={
                <span className="fynns-list-item-trailing-stats">
                  <span>{t("globals.listStatsRow2Elapse")}</span>
                  <span>{t("globals.listStatsRow2Tokens")}</span>
                  <span className="fynns-table-meta">{t("globals.listStatsRow2Cost")}</span>
                  <span className="fynns-table-meta">{t("globals.listStatsRow2Count")}</span>
                </span>
              }
              trailing={
                <Tooltip content={t("globals.listTreeOpen")}>
                        <IconButton
                          variant="ghost"
                    aria-label={t("globals.listTreeOpen")}
                  >
                    <MessageSquareIcon />
                  </IconButton>
                </Tooltip>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
            <ListItem
              overline={t("globals.listStatsRow3Overline")}
              headline={t("globals.listStatsRow3Headline")}
              supportingText={t("globals.listStatsRow3Path")}
              trailingSupportingText={
                <span className="fynns-list-item-trailing-stats">
                  <span>{t("globals.listStatsRow3Elapse")}</span>
                  <span>{t("globals.listStatsRow3Tokens")}</span>
                  <span>{t("globals.listStatsRow3Cost")}</span>
                  <span className="fynns-table-meta">{t("globals.listStatsRow3Count")}</span>
                </span>
              }
              trailing={
                <Tooltip content={t("globals.listTreeOpen")}>
                        <IconButton
                          variant="ghost"
                    aria-label={t("globals.listTreeOpen")}
                  >
                    <MessageSquareIcon />
                  </IconButton>
                </Tooltip>
              }
              onClick={() => snackbar(t("globals.listCatalogOpenSnack"))}
            />
          </List>
          <SandboxHelp text={t("globals.listGroupHelp")} />
          <List aria-label={t("globals.listGroupAria")}>
            <ListItem
              leading={<ChevronRightIcon />}
              headline={
                <Tooltip content={t("globals.listGroupPath")} side="right">
                  <span>{t("globals.listGroupHeadline")}</span>
                </Tooltip>
              }
              trailingSupportingText={
                <span className="fynns-table-meta">{t("globals.listGroupCount")}</span>
              }
              aria-expanded={listGroupOpen}
              onClick={() => setListGroupOpen((open) => !open)}
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listGroupAdd")}>
                    <IconButton size="sm" variant="ghost" aria-label={t("globals.listGroupAdd")}>
                      <PlusIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listGroupImport")}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label={t("globals.listGroupImport")}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listGroupExport")}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label={t("globals.listGroupExport")}
                    >
                      <UploadIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              detail={
                <List aria-label={t("globals.listGroupMembersAria")}>
                  <ListItem
                    headline={t("globals.listGroupMemberHeadline")}
                    supportingText={t("globals.listGroupMemberSupporting")}
                    trailingSupportingText={
                      <span className="fynns-control-cluster">
                        <span className="fynns-table-meta">{t("globals.listGroupMemberKind")}</span>
                        <span className="fynns-table-meta">{t("globals.listGroupMemberFresh")}</span>
                      </span>
                    }
                  />
                </List>
              }
            />
          </List>
          <SandboxHelp text={t("globals.listTreeHelp")} />
          <List aria-label={t("globals.listTreeAria")}>
            <ListItem
              leading={<ChevronRightIcon />}
              overline={t("globals.listTreeOverline")}
              headline={t("globals.listTreeHeadline")}
              supportingText={t("globals.listTreePath")}
              trailingSupportingText={
                <span className="fynns-list-item-trailing-stats fynns-list-item-trailing-stats--pair">
                  <span>{t("globals.listTreeDuration")}</span>
                  <span className="fynns-table-meta">{t("globals.listTreeCalls")}</span>
                </span>
              }
              trailing={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.listTreeAdd")}>
                    <IconButton variant="ghost" aria-label={t("globals.listTreeAdd")}>
                      <PlusIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.listTreeOpen")}>
                    <IconButton variant="ghost" aria-label={t("globals.listTreeOpen")}>
                      <MessageSquareIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
              aria-expanded={listTreeOpen}
              onClick={() => setListTreeOpen((open) => !open)}
              detail={
                <List aria-label={t("globals.listTreeTurnsAria")}>
                  <ListItem
                    lines={2}
                    leading={<ChevronRightIcon />}
                    overline={t("globals.listTreeTurnOverline")}
                    headline={
                      <Tooltip
                        content={t("globals.listTreeTurnHeadline")}
                        side="top"
                        align="start"
                      >
                        <span>{t("globals.listTreeTurnHeadline")}</span>
                      </Tooltip>
                    }
                    trailingSupportingText={t("globals.listTreeDuration")}
                    aria-expanded={listTurnOpen}
                    onClick={() => setListTurnOpen((open) => !open)}
                    detail={
                      <div className="fynns-table-wrap fynns-scroll">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableHeaderCell>{t("globals.listTreeColWhen")}</TableHeaderCell>
                              <TableHeaderCell>{t("globals.listTreeColModel")}</TableHeaderCell>
                              <TableHeaderCell align="end">
                                {t("globals.listTreeColTokens")}
                              </TableHeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>{t("globals.listTreeOverline")}</TableCell>
                              <TableCell>sample-model</TableCell>
                              <TableCell align="end">
                                <span className="fynns-control-cluster">
                                  <span>12.4k</span>
                                  <span className="fynns-table-meta">
                                    {t("globals.listTreeEstimated")}
                                  </span>
                                </span>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    }
                  />
                </List>
              }
            />
          </List>
          <SandboxHelp text={t("globals.listRevealHelp")} />
          <ListRevealMoreDemo />
        </div>
        <SandboxHelp text={t("globals.listHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="timeline">
          <div className="fynns-unit-stack">
            <SandboxHelp text={t("globals.timelineIntroHelp")} />
            <SandboxHelp text={t("globals.timelineFlatHelp")} />
            <Timeline
              aria-label={t("globals.timelineFlatAria")}
              trailingMetaAlign="start"
            >
              <TimelineItem
                headline={t("globals.timelineItemHeadlineLead")}
                supportingText={t("globals.timelineItemOrgLead")}
                trailingSupportingText={t("globals.timelineItemRangeLead")}
                onClick={() => {
                  setTimelineEditName(t("globals.timelineItemHeadlineLead"));
                  setTimelineEditOpen(true);
                }}
              />
              <TimelineItem
                headline={t("globals.timelineItemHeadlineMid")}
                supportingText={t("globals.timelineItemOrgMid")}
                trailingSupportingText={t("globals.timelineItemRangeMid")}
                onClick={() => {
                  setTimelineEditName(t("globals.timelineItemHeadlineMid"));
                  setTimelineEditOpen(true);
                }}
              />
              <TimelineItem
                headline={t("globals.timelineItemHeadlineTrail")}
                supportingText={t("globals.timelineItemOrgTrail")}
                trailingSupportingText={t("globals.timelineItemRangeTrail")}
                onClick={() => {
                  setTimelineEditName(t("globals.timelineItemHeadlineTrail"));
                  setTimelineEditOpen(true);
                }}
              />
            </Timeline>
            <Dialog
              open={timelineEditOpen}
              onOpenChange={setTimelineEditOpen}
              title={t("globals.timelineEditDialogTitle")}
              size="lg"
              showCloseButton
              closeAriaLabel={t("globals.dialogClose")}
              feet={
                <div className="fynns-control-cluster fynns-control-cluster--end-align">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimelineEditOpen(false)}
                  >
                    {t("globals.formRecipeDialogCancel")}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setTimelineEditOpen(false);
                      snackbar(t("globals.timelineEditDialogDeleted"));
                    }}
                  >
                    {t("globals.timelineEditDialogDelete")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setTimelineEditOpen(false);
                      snackbar(t("globals.timelineEditDialogSaved"));
                    }}
                  >
                    {t("globals.formRecipeSave")}
                  </Button>
                </div>
              }
            >
              <FieldStack>
                <FieldBlock label={t("globals.timelineEditDialogName")}>
                  <Input
                    value={timelineEditName}
                    onChange={(e) => setTimelineEditName(e.target.value)}
                  />
                </FieldBlock>
                <FieldBlock
                  label={t("globals.timelineEditDialogNotes")}
                  description={t("globals.timelineEditDialogNotesHint")}
                >
                  <Textarea
                    minRows={3}
                    placeholder={t("globals.timelineEditDialogNotesPh")}
                  />
                </FieldBlock>
              </FieldStack>
            </Dialog>

            <SandboxHelp text={t("globals.timelineDetailHelp")} />
            <Timeline
              aria-label={t("globals.timelineDetailAria")}
              trailingMetaAlign="start"
            >
              {(
                [
                  {
                    id: "lead" as const,
                    headline: "globals.timelineItemHeadlineLead" as MessageKey,
                    org: "globals.timelineItemOrgLead" as MessageKey,
                    range: "globals.timelineItemRangeLead" as MessageKey,
                    bullet: "globals.timelineBulletLead" as MessageKey,
                  },
                  {
                    id: "mid" as const,
                    headline: "globals.timelineItemHeadlineMid" as MessageKey,
                    org: "globals.timelineItemOrgMid" as MessageKey,
                    range: "globals.timelineItemRangeMid" as MessageKey,
                    bullet: "globals.timelineBulletMid" as MessageKey,
                  },
                  {
                    id: "trail" as const,
                    headline: "globals.timelineItemHeadlineTrail" as MessageKey,
                    org: "globals.timelineItemOrgTrail" as MessageKey,
                    range: "globals.timelineItemRangeTrail" as MessageKey,
                    bullet: "globals.timelineBulletTrail" as MessageKey,
                  },
                ] as const
              ).map((row) => (
                <TimelineItem
                  key={row.id}
                  headline={t(row.headline)}
                  supportingText={t(row.org)}
                  trailingSupportingText={t(row.range)}
                  expanded={Boolean(timelineExpand[row.id])}
                  onExpandedChange={(next) =>
                    setTimelineExpand((prev) => ({ ...prev, [row.id]: next }))
                  }
                  detail={
                    <ul className="fynns-timeline-bullets">
                      <li>{t(row.bullet)}</li>
                      <li>{t("globals.timelineBulletShared")}</li>
                    </ul>
                  }
                />
              ))}
            </Timeline>
          </div>
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
          <div
            id="sandbox-card-plain-field-align"
            className="sandbox-globals-row sandbox-globals-row--stack"
          >
            <Card className="sandbox-globals-card" title={t("globals.cardPlainAlignDefaultTitle")}>
              <FieldStack>
                <FieldBlock label={t("globals.cardPlainAlignFieldLabel")}>
                  <Select
                    ariaLabel={t("globals.cardPlainAlignFieldLabel")}
                    value="a"
                    onChange={() => {}}
                    options={[
                      { value: "a", label: t("globals.cardPlainAlignOptionA") },
                      { value: "b", label: t("globals.cardPlainAlignOptionB") },
                    ]}
                  />
                </FieldBlock>
              </FieldStack>
            </Card>
            <Card
              className="sandbox-globals-card"
              title={t("globals.cardPlainAlignPlainTitle")}
              chrome="plain"
            >
              <FieldStack>
                <FieldBlock label={t("globals.cardPlainAlignFieldLabel")}>
                  <Select
                    ariaLabel={t("globals.cardPlainAlignFieldLabel")}
                    value="a"
                    onChange={() => {}}
                    options={[
                      { value: "a", label: t("globals.cardPlainAlignOptionA") },
                      { value: "b", label: t("globals.cardPlainAlignOptionB") },
                    ]}
                  />
                </FieldBlock>
              </FieldStack>
            </Card>
          </div>
          <SandboxHelp text={t("globals.cardPlainAlignHelp")} />
          <div id="sandbox-card-table-meta-ellipsis">
            <Card
              className="sandbox-globals-card"
              title={t("globals.cardHintTitle")}
              actions={
                <InfoHint
                  content={t("globals.cardHintTip")}
                  ariaLabel={t("globals.cardHintAria")}
                />
              }
            >
              <div className="fynns-unit-stack">
                <FieldHint>{t("globals.cardHintBodyLead")}</FieldHint>
                <span className="fynns-table-meta">
                  <OverflowTip content={t("globals.cardHintBodyMeta")}>
                    {t("globals.cardHintBodyMeta")}
                  </OverflowTip>
                </span>
              </div>
            </Card>
          </div>
          <Card
            className="sandbox-globals-card sandbox-globals-card--actions-strip"
            title={t("globals.cardActionsStripTitle")}
            actions={
              <div className="fynns-control-cluster">
                <InfoHint
                  content={t("globals.cardActionsStripHint")}
                  ariaLabel={t("globals.cardActionsStripHintAria")}
                />
                <Tooltip content={t("globals.cardActionsStripStar")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.cardActionsStripStar")}
                  >
                    <SparklesIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.cardActionsStripPin")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.cardActionsStripPin")}
                  >
                    <SaveIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.cardActionsStripOpen")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.cardActionsStripOpen")}
                  >
                    <FileIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.cardActionsStripFolder")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.cardActionsStripFolder")}
                  >
                    <FolderOpenIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.cardActionsStripDelete")}>
                  <IconButton
                    variant="danger"
                    aria-label={t("globals.cardActionsStripDelete")}
                  >
                    <TrashIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
              </div>
            }
          >
            {t("globals.cardActionsStripBody")}
          </Card>
          <div id="sandbox-card-draft-actions">
            <Card
              className="sandbox-globals-card"
              chrome="plain"
              title={t("globals.cardDraftTitle")}
              actions={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.cardDraftCopy")}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      aria-label={t("globals.cardDraftCopy")}
                    >
                      <ClipboardIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.cardDraftDiscard")}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      aria-label={t("globals.cardDraftDiscard")}
                    >
                      <UndoIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.cardDraftSave")}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      aria-label={t("globals.cardDraftSave")}
                    >
                      <SaveIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <FieldHint>{t("globals.cardDraftBody")}</FieldHint>
            </Card>
            <SandboxHelp as="span" text={t("globals.cardDraftHelp")} />
          </div>
          <div id="sandbox-card-chrome-icon-actions">
            <SandboxHelp text={t("globals.cardChromeIconHelp")} />
            <Card
              className="sandbox-globals-card"
              chrome="plain"
              title={t("globals.cardChromeIconTitle")}
              actions={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.cardChromeIconCopy")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.cardChromeIconCopy")}
                    >
                      <ClipboardIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.cardChromeIconFolder")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.cardChromeIconFolder")}
                    >
                      <FolderOpenIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <FieldStack>
                <div className="fynns-control-cluster">
                  <Select
                    ariaLabel={t("globals.cardChromeIconTypeAria")}
                    value={cardChromeType}
                    onChange={setCardChromeType}
                    options={[
                      {
                        value: "flat",
                        label: t("globals.cardChromeIconTypeFlat"),
                      },
                      {
                        value: "tree",
                        label: t("globals.cardChromeIconTypeTree"),
                      },
                    ]}
                  />
                  <Select
                    ariaLabel={t("globals.cardChromeIconQualityAria")}
                    value={cardChromeQuality}
                    onChange={setCardChromeQuality}
                    options={[
                      {
                        value: "fast",
                        label: t("globals.cardChromeIconQualityFast"),
                      },
                      {
                        value: "high",
                        label: t("globals.cardChromeIconQualityHigh"),
                      },
                    ]}
                  />
                  <Tooltip content={t("globals.cardChromeIconSaveDefaults")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.cardChromeIconSaveDefaults")}
                    >
                      <SaveIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                </div>
              </FieldStack>
            </Card>
          </div>
          <div id="sandbox-card-head-primary-end">
            <SandboxHelp text={t("globals.cardHeadPrimaryHelp")} />
            <Card
              className="sandbox-globals-card"
              title={t("globals.cardHeadPrimaryTitle")}
              actions={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.cardHeadPrimaryDownload")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.cardHeadPrimaryDownload")}
                    >
                      <DownloadIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.cardHeadPrimaryFolder")}>
                    <IconButton
                      variant="ghost"
                      aria-label={t("globals.cardHeadPrimaryFolder")}
                    >
                      <FolderOpenIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("globals.cardHeadPrimaryPack")}>
                    <IconButton
                      variant="primary"
                      aria-label={t("globals.cardHeadPrimaryPack")}
                    >
                      <ArchiveIcon size={16} aria-hidden />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <FieldHint>{t("globals.cardHeadPrimaryBody")}</FieldHint>
            </Card>
          </div>
          <div id="sandbox-card-head-select">
            <Card
              className="sandbox-globals-card"
              chrome="plain"
              title={t("globals.cardHeadSelectTitle")}
              actions={
                <div className="fynns-control-cluster">
                  <Select
                    ariaLabel={t("globals.cardHeadSelectRevisionAria")}
                    value={cardHeadRevision}
                    onChange={setCardHeadRevision}
                    options={[
                      {
                        value: "rev-a",
                        label: t("globals.cardHeadSelectRevisionA"),
                      },
                      {
                        value: "rev-b",
                        label: t("globals.cardHeadSelectRevisionB"),
                      },
                    ]}
                  />
                  <Button size="sm" variant="primary" onClick={() => {}}>
                    {t("globals.cardHeadSelectCta")}
                  </Button>
                </div>
              }
            >
              {t("globals.cardHeadSelectBody")}
            </Card>
            <SandboxHelp text={t("globals.cardHeadSelectHelp")} />
          </div>
          <Card
            className="sandbox-globals-card sandbox-globals-card--mode-body"
            title={t("globals.cardModeBodyTitle")}
            actions={
              <div className="fynns-control-cluster">
                <Tooltip content={t("globals.cardModeBodyOpen")}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={t("globals.cardModeBodyOpen")}
                  >
                    <FileIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.cardModeBodyDelete")}>
                  <IconButton
                    variant="danger"
                    size="sm"
                    aria-label={t("globals.cardModeBodyDelete")}
                  >
                    <TrashIcon size={16} aria-hidden />
                  </IconButton>
                </Tooltip>
              </div>
            }
          >
            <ControlStack columns={1}>
              <ControlRow label={t("globals.cardModeBodyCopyLabel")}>
                <ToggleGroup
                  ariaLabel={t("globals.cardModeBodyCopyLabel")}
                  value={cardModeBodySide}
                  onChange={(value) =>
                    setCardModeBodySide(value as "primary" | "secondary")
                  }
                  options={[
                    { value: "primary", label: t("globals.cardModeBodyPrimary") },
                    {
                      value: "secondary",
                      label: t("globals.cardModeBodySecondary"),
                    },
                  ]}
                />
              </ControlRow>
            </ControlStack>
            <SandboxHelp as="span" text={t("globals.cardModeBodyHelp")} />
          </Card>
          <Card className="sandbox-globals-card" title={t("globals.cardTitlePlain")}>
            {t("globals.cardBody")}
          </Card>
          <Card className="sandbox-globals-card" title={t("globals.cardMetaBodyTitle")}>
            <div className="fynns-unit-stack">
              <span className="fynns-table-meta">{t("globals.cardMetaBodyCount")}</span>
              <span className="fynns-table-meta mono">{t("globals.cardMetaBodyBranch")}</span>
              <SandboxHelp as="span" text={t("globals.cardMetaBodyHelp")} />
            </div>
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
            <Surface variant="soft" padded style={{ minWidth: "8rem" }}>
              <SandboxHelp as="span" text={t("globals.surfaceSoft")} />
            </Surface>
            <Surface
              variant="soft"
              padded
              interactive
              role="button"
              tabIndex={0}
              style={{ minWidth: "8rem" }}
              aria-label={t("globals.surfaceInteractiveAria")}
            >
              <SandboxHelp as="span" text={t("globals.surfaceInteractive")} />
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
            htmlFor="sandbox-field-header-api-key"
          />
          <Input
            id="sandbox-field-header-api-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={t("globals.fieldHeaderPlaceholder")}
            aria-label={t("globals.fieldHeaderLabel")}
            trailing={
              <Tooltip content={t("globals.fieldHeaderReveal")}>
                <IconButton
                  size="sm"
                  aria-label={t("globals.fieldHeaderReveal")}
                >
                  <EyeIcon size={16} aria-hidden />
                </IconButton>
              </Tooltip>
            }
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
          <div className="sandbox-stack" style={{ padding: "var(--fynns-layout-content-inset)" }}>
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
          headActions={
            <InfoHint size="sm" content={t("globals.dialogCreateHelp")} />
          }
          size="sm"
          closeAriaLabel={t("globals.dialogClose")}
          feet={
            <div className="fynns-control-cluster fynns-control-cluster--end-align">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCenteredDialogOpen(false)}
              >
                {t("globals.dialogCreateCancel")}
              </Button>
              <Button
                size="sm"
                onClick={() => setCenteredDialogOpen(false)}
              >
                {t("globals.dialogCreateAction")}
              </Button>
            </div>
          }
        >
          <FieldStack>
            <FieldBlock label={t("globals.dialogCreateNameLabel")} htmlFor="sandbox-dialog-create-name">
              <Input
                id="sandbox-dialog-create-name"
                placeholder={t("globals.dialogCreateNamePlaceholder")}
              />
            </FieldBlock>
          </FieldStack>
        </Dialog>
        <SandboxHelp text={t("globals.dialogFootCanonicalHelp")} />
        <SandboxHelp text={t("globals.dialogTitleBodyInsetHelp")} />
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
          <div className="fynns-unit-stack">
            <SandboxHelp text={t("globals.fullscreenBody")} />
            <Card title={t("globals.fullscreenCardAppearance")}>
              <FieldStack>
                <FieldBlock label={t("globals.fullscreenCardLocale")}>
                  <ToggleGroup
                    ariaLabel={t("globals.fullscreenLocaleAria")}
                    value={fullscreenLocale}
                    onChange={setFullscreenLocale}
                    options={[
                      { value: "en", label: t("globals.fullscreenLocaleEn") },
                      { value: "zh", label: t("globals.fullscreenLocaleZh") },
                    ]}
                    size="compact"
                    showCheck={false}
                  />
                </FieldBlock>
              </FieldStack>
            </Card>
            <Card title={t("globals.fullscreenCardPath")}>
              <FieldStack>
                <FieldBlock label={t("globals.fullscreenPathLabel")}>
                  <div className="fynns-control-cluster fynns-control-cluster--end-align">
                    <div className="fynns-control-cluster__grow">
                      <Input
                        value={fullscreenPath}
                        onChange={(e) => setFullscreenPath(e.target.value)}
                        placeholder={t("globals.fullscreenPathPlaceholder")}
                        aria-label={t("globals.fullscreenPathLabel")}
                      />
                    </div>
                    <Button type="button">{t("globals.fullscreenPathSave")}</Button>
                  </div>
                </FieldBlock>
              </FieldStack>
            </Card>
          </div>
        </FullscreenDialog>
        <SandboxHelp text={t("globals.overlayHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="fullscreen-flush">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setFullscreenFlushOpen(true)}>
            {t("globals.fullscreenFlushOpen")}
          </Button>
        </div>
        <FullscreenDialog
          open={fullscreenFlushOpen}
          onOpenChange={setFullscreenFlushOpen}
          title={t("globals.fullscreenFlushTitle")}
          closeAriaLabel={t("globals.fullscreenClose")}
          actions={
            <Button size="sm" onClick={() => setFullscreenFlushOpen(false)}>
              {t("globals.fullscreenDone")}
            </Button>
          }
        >
          <CodeBlock
            variant="editable"
            label={t("globals.fullscreenFlushFile")}
            language="xml"
            wrap
            autoGrow
            value={fullscreenFlushXml}
            onChange={setFullscreenFlushXml}
          />
        </FullscreenDialog>
        <SandboxHelp text={t("globals.fullscreenFlushHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="drawer-nested-scroll">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setDrawerNestedScrollOpen(true)}>
            {t("globals.drawerNestedScrollOpen")}
          </Button>
        </div>
        <Drawer
          open={drawerNestedScrollOpen}
          onClose={() => setDrawerNestedScrollOpen(false)}
          side="left"
          title={t("globals.drawerNestedScrollTitle")}
          closeAriaLabel={t("globals.dialogClose")}
        >
          <div className="fynns-unit-stack">
            <FieldBlock label={t("globals.drawerNestedScrollProvider")}>
              <Select
                ariaLabel={t("globals.drawerNestedScrollProvider")}
                options={["Sample provider", "Alternate provider"]}
                value="Sample provider"
                onChange={() => {}}
              />
            </FieldBlock>
            <FieldBlock label={t("globals.drawerNestedScrollRegion")}>
              <Select
                ariaLabel={t("globals.drawerNestedScrollRegion")}
                options={["EU", "Americas", "Asia Pacific"]}
                value="EU"
                onChange={() => {}}
              />
            </FieldBlock>
            <FieldBlock label={t("globals.drawerNestedScrollDigest")}>
              <Select
                ariaLabel={t("globals.drawerNestedScrollDigest")}
                options={["Daily", "Weekly", "Monthly"]}
                value="Daily"
                onChange={() => {}}
              />
            </FieldBlock>
            <Divider />
            <FieldBlock label={t("globals.drawerNestedScrollCard")}>
              <CodeBlock
                variant="plain"
                language="json"
                wrap
                maxHeight="12rem"
                copyAriaLabel={t("globals.codeBlockCopy")}
                code={DRAWER_NESTED_SCROLL_JSON}
              />
            </FieldBlock>
          </div>
        </Drawer>
        <SandboxHelp text={t("globals.drawerNestedScrollHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="dialog-nested-scroll">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setDialogNestedScrollOpen(true)}>
            {t("globals.dialogNestedScrollOpen")}
          </Button>
        </div>
        <Dialog
          open={dialogNestedScrollOpen}
          onOpenChange={setDialogNestedScrollOpen}
          title={t("globals.dialogNestedScrollTitle")}
          size="md"
          showCloseButton
          closeAriaLabel={t("globals.dialogClose")}
          feet={
            <div className="fynns-control-cluster fynns-control-cluster--end-align">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogNestedScrollOpen(false)}
              >
                {t("globals.dialogCreateCancel")}
              </Button>
              <Button
                size="sm"
                onClick={() => setDialogNestedScrollOpen(false)}
              >
                {t("globals.dialogCreateAction")}
              </Button>
            </div>
          }
        >
          <div className="fynns-unit-stack">
            <List aria-label={t("globals.dialogNestedScrollTitle")}>
              <ListItem
                interactive={false}
                headline="Sample patch · alpha"
                supportingText="sample.json"
              />
              <ListItem
                interactive={false}
                headline="Sample patch · beta"
                supportingText="sample.json"
              />
              <ListItem
                interactive={false}
                headline="Sample patch · gamma"
                supportingText="sample.json"
              />
              <ListItem
                interactive={false}
                headline="Sample patch · delta"
                supportingText="sample.json"
              />
              <ListItem
                interactive={false}
                headline="Sample patch · epsilon"
                supportingText="sample.json"
              />
            </List>
            <Collapsible
              chrome="plain"
              defaultOpen
              title={t("globals.dialogNestedScrollFold")}
            >
              <CodeBlock
                variant="plain"
                language="json"
                wrap
                maxHeight="var(--fynns-layout-textarea-max-height)"
                copyAriaLabel={t("globals.codeBlockCopy")}
                code={DIALOG_NESTED_SCROLL_JSON}
              />
            </Collapsible>
          </div>
        </Dialog>
        <SandboxHelp text={t("globals.dialogNestedScrollHelp")} />
        </GlobalsDemo>
        <GlobalsDemo id="dialog-viewport">
        <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
          <Button size="sm" onClick={() => setDialogViewportOpen(true)}>
            {t("globals.dialogViewportOpen")}
          </Button>
        </div>
        <Dialog
          open={dialogViewportOpen}
          onOpenChange={setDialogViewportOpen}
          title={t("globals.dialogViewportTitle")}
          description={t("globals.dialogViewportDescription")}
          size="viewport"
          showCloseButton
          closeAriaLabel={t("globals.dialogClose")}
          feet={
            <div className="fynns-control-cluster fynns-control-cluster--end-align">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogViewportOpen(false)}
              >
                {t("globals.dialogCreateCancel")}
              </Button>
              <Button size="sm" onClick={() => setDialogViewportOpen(false)}>
                {t("globals.dialogCreateAction")}
              </Button>
            </div>
          }
        >
          <CodeBlock
            variant="editable"
            label="sample.config.json"
            language="json"
            wrap={false}
            autoGrow={false}
            value={dialogViewportCode}
            onChange={setDialogViewportCode}
          />
        </Dialog>
        <SandboxHelp text={t("globals.dialogViewportHelp")} />
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
          <SandboxHelp text={t("globals.emptyFillHelp")} />
          <div className="sandbox-fill-column-stage">
            <FillColumn>
              <EmptyState
                fill
                icon={<FolderOpenIcon />}
                title={t("globals.emptyFillTitle")}
                description={t("globals.emptyFillDescription")}
                actions={<Button>{t("globals.emptyAction")}</Button>}
              />
            </FillColumn>
          </div>
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
            indicator="linear"
            label={t("globals.busyRegionLabel")}
            message={t("globals.busyRegionMessage")}
            value={0.55}
          >
            <Card title={t("globals.busyRegionTitle")}>
              <p style={{ margin: 0 }}>{t("globals.busyRegionBody")}</p>
            </Card>
          </BusyRegion>
          <SandboxHelp text={t("globals.busyRegionNarrowHelp")} />
          <div className="sandbox-busy-narrow">
            <BusyRegion
              busy
              indicator="linear"
              label={t("globals.busyRegionNarrowLabel")}
              message={t("globals.busyRegionNarrowMessage")}
              value={0.35}
            />
          </div>
          <SandboxHelp text={t("globals.busyRegionDrawerHelp")} />
          <div
            id="sandbox-busy-region-empty-no-mask"
            className="sandbox-busy-narrow sandbox-busy-drawer-tools"
          >
            <SearchBar
              density="destination"
              placeholder={t("globals.busyRegionDrawerSearchPh")}
              value=""
              onChange={() => {}}
              ariaLabel={t("globals.busyRegionDrawerSearchAria")}
            />
            <BusyRegion busy label={t("globals.busyRegionDrawerBusyLabel")} />
          </div>
          <SandboxHelp text={t("globals.busyRegionHelp")} />
          <div className="sandbox-fill-column-stage">
            <FillColumn>
              <BusyRegion
                fill
                busy={busyRegionFill}
                label={t("globals.busyRegionFillLabel")}
                message={t("globals.busyRegionFillMessage")}
              />
            </FillColumn>
          </div>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              onClick={() => setBusyRegionFill(true)}
              disabled={busyRegionFill}
            >
              {t("globals.busyRegionFillStart")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setBusyRegionFill(false)}
              disabled={!busyRegionFill}
            >
              {t("globals.busyRegionFillStop")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.busyRegionFillHelp")} />
          <div id="sandbox-busy-region-pane-lead" className="sandbox-fill-column-stage">
            <FillColumn>
              {busyRegionPaneLeadCold ? (
                <BusyRegion
                  fill
                  busy
                  label={t("globals.busyRegionPaneLeadLabel")}
                />
              ) : (
                <div className="fynns-unit-stack">
                  <FieldHint>{t("globals.busyRegionPaneLeadHint")}</FieldHint>
                  <Card title={t("globals.busyRegionTitle")}>
                    <p style={{ margin: 0 }}>{t("globals.busyRegionPaneLeadBody")}</p>
                  </Card>
                </div>
              )}
            </FillColumn>
          </div>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              onClick={() => setBusyRegionPaneLeadCold(true)}
              disabled={busyRegionPaneLeadCold}
            >
              {t("globals.busyRegionPaneLeadShowCold")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setBusyRegionPaneLeadCold(false)}
              disabled={!busyRegionPaneLeadCold}
            >
              {t("globals.busyRegionPaneLeadShowReady")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.busyRegionPaneLeadHelp")} />
          <SandboxHelp text={t("globals.busyRegionPageScrollFillHelp")} />
          <div id="sandbox-busy-region-page-scroll-fill" className="sandbox-page-scroll-stage">
            <FillColumn>
              <PageScroll>
                {/* Thin section wrapper (SectionLead cold-start): must pass height chain. */}
                <div data-sandbox-section-lead="">
                  <BusyRegion
                    fill
                    busy
                    label={t("globals.busyRegionPageScrollFillLabel")}
                  />
                </div>
              </PageScroll>
            </FillColumn>
          </div>
          <SandboxHelp text={t("globals.paneLoadErrorHelp")} />
          <div id="sandbox-pane-load-error" className="sandbox-fill-column-stage">
            <FillColumn>
              {paneLoadPhase === "cold" ? (
                <BusyRegion
                  fill
                  busy
                  label={t("globals.paneLoadErrorBusyLabel")}
                  message={t("globals.paneLoadErrorBusyMessage")}
                />
              ) : paneLoadPhase === "error" ? (
                <div className="fynns-unit-stack">
                  <InlineAlert
                    severity="error"
                    message={t("globals.paneLoadErrorAlert")}
                  />
                  <FieldHint>{t("globals.paneLoadErrorHint")}</FieldHint>
                  <div className="fynns-control-cluster fynns-control-cluster--end-align">
                    <Button
                      variant="tonal"
                      size="sm"
                      type="button"
                      onClick={() => setPaneLoadPhase("cold")}
                    >
                      {t("globals.paneLoadErrorRetry")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Card title={t("globals.paneLoadErrorReadyTitle")}>
                  <FieldHint>{t("globals.paneLoadErrorReadyBody")}</FieldHint>
                </Card>
              )}
            </FillColumn>
          </div>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              onClick={() => setPaneLoadPhase("cold")}
              disabled={paneLoadPhase === "cold"}
            >
              {t("globals.paneLoadErrorShowCold")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setPaneLoadPhase("error")}
              disabled={paneLoadPhase === "error"}
            >
              {t("globals.paneLoadErrorShowFail")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPaneLoadPhase("ready")}
              disabled={paneLoadPhase === "ready"}
            >
              {t("globals.paneLoadErrorShowReady")}
            </Button>
          </div>
          <div className="sandbox-globals-row">
            <Button size="sm" onClick={() => setBusyRegionDialogOpen(true)}>
              {t("globals.busyRegionDialogOpen")}
            </Button>
          </div>
          <Dialog
            open={busyRegionDialogOpen}
            onOpenChange={setBusyRegionDialogOpen}
            title={t("globals.busyRegionDialogTitle")}
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
            size="md"
          >
            <BusyRegion
              busy
              label={t("globals.busyRegionDialogLabel")}
              message={t("globals.busyRegionDialogMessage")}
            />
          </Dialog>
          <SandboxHelp text={t("globals.busyRegionDialogHelp")} />
          <SandboxHelp text={t("globals.busyRegionColdHelp")} />
          <Card title={t("globals.busyRegionColdTitle")}>
            {busyRegionColdBody ? (
              <BusyRegion
                busy
                label={t("globals.busyRegionColdLabel")}
                message={t("globals.busyRegionColdMessage")}
              />
            ) : (
              <div className="fynns-unit-stack">
                <List aria-label={t("globals.busyRegionColdListAria")}>
                  <ListItem
                    overline={t("globals.listTreeOverline")}
                    headline={t("globals.listTreeHeadline")}
                    supportingText={t("globals.listTreePath")}
                    trailingSupportingText={t("globals.listTreeDuration")}
                  />
                </List>
                <Select
                  ariaLabel={t("globals.busyRegionColdSessions")}
                  value="10"
                  onChange={() => {}}
                  options={[
                    { value: "10", label: t("globals.busyRegionColdSessionsOpt") },
                  ]}
                />
                <Pagination page={1} pageCount={3} onPageChange={() => {}} />
              </div>
            )}
          </Card>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              onClick={() => setBusyRegionColdBody(true)}
              disabled={busyRegionColdBody}
            >
              {t("globals.busyRegionColdShow")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setBusyRegionColdBody(false)}
              disabled={!busyRegionColdBody}
            >
              {t("globals.busyRegionColdClear")}
            </Button>
          </div>
          <SandboxHelp text={t("globals.busyRegionFieldHelp")} />
          <div id="sandbox-busy-region-field-sample">
            <FieldBlock
              label={t("globals.busyRegionFieldLabel")}
              actions={
                <div className="fynns-control-cluster">
                  <Tooltip content={t("globals.busyRegionFieldRefreshTip")}>
                    <IconButton
                      size="sm"
                      aria-label={t("globals.busyRegionFieldRefreshTip")}
                      onClick={() => setBusyRegionFieldBusy(true)}
                      disabled={busyRegionFieldBusy}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <BusyRegion
                busy={busyRegionFieldBusy}
                label={t("globals.busyRegionFieldBusyLabel")}
                message={t("globals.busyRegionFieldBusyMessage")}
              >
                <CodeBlock
                  variant="plain"
                  language="yaml"
                  code={t("globals.busyRegionFieldBody")}
                  showCopy
                  copyAriaLabel={t("globals.busyRegionFieldCopyAria")}
                  maxHeight="12rem"
                />
              </BusyRegion>
            </FieldBlock>
          </div>
          <div className="sandbox-globals-row">
            <Button
              size="sm"
              onClick={() => setBusyRegionFieldBusy(true)}
              disabled={busyRegionFieldBusy}
            >
              {t("globals.busyRegionFieldStart")}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setBusyRegionFieldBusy(false)}
              disabled={!busyRegionFieldBusy}
            >
              {t("globals.busyRegionFieldStop")}
            </Button>
          </div>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="page-scroll">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <SandboxHelp text={t("globals.pageScrollHelp")} />
          <div className="sandbox-page-scroll-stage">
            <FillColumn>
              <PageScroll>
                  <ControlRow label={t("globals.pageScrollToolLabel")}>
                    <ToggleGroup
                      showCheck={false}
                      ariaLabel={t("globals.pageScrollToolAria")}
                      value={pageScrollTool}
                      onChange={setPageScrollTool}
                      options={[
                        {
                          value: "a",
                          label: t("globals.pageScrollToolA"),
                        },
                        {
                          value: "b",
                          label: t("globals.pageScrollToolB"),
                        },
                        {
                          value: "c",
                          label: t("globals.pageScrollToolC"),
                        },
                      ]}
                    />
                  </ControlRow>
                  <Card title={t("globals.pageScrollCardTitle")}>
                    <List aria-label={t("globals.pageScrollListAria")}>
                      <ListItem
                        headline={t("globals.listCatalogProject")}
                        supportingText={t("globals.listCatalogProjectPath")}
                      />
                      <ListItem
                        headline={t("globals.listCatalogConfig")}
                        supportingText={t("globals.listCatalogConfigPath")}
                      />
                      <ListItem
                        headline={t("globals.listCatalogRules")}
                        supportingText={t("globals.listCatalogRulesPath")}
                      />
                      <ListItem
                        headline={t("globals.listCatalogStaticFile")}
                        supportingText={t("globals.listCatalogStaticPath")}
                      />
                      <ListItem
                        headline={t("globals.listTwoLine")}
                        supportingText={t("globals.listTwoLineSupporting")}
                      />
                      <ListItem
                        headline={t("globals.listThreeLine")}
                        supportingText={t("globals.listThreeLineSupporting")}
                      />
                      <ListItem
                        headline={t("globals.listCatalogProject")}
                        supportingText={t("globals.listCatalogProjectPath")}
                      />
                      <ListItem
                        headline={t("globals.listCatalogConfig")}
                        supportingText={t("globals.listCatalogConfigPath")}
                      />
                    </List>
                  </Card>
                  <Card title={t("globals.pageScrollCardTitle2")}>
                    <p style={{ margin: 0 }}>{t("globals.pageScrollCardBody")}</p>
                  </Card>
                  <Card title={t("globals.pageScrollCardTitle")}>
                    <p style={{ margin: 0 }}>{t("globals.pageScrollCardBody")}</p>
                  </Card>
              </PageScroll>
            </FillColumn>
          </div>
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="split-pane">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <ToggleGroup
            showCheck={false}
            ariaLabel={t("globals.splitPaneOrientationAria")}
            value={splitOrientation}
            onChange={setSplitOrientation}
            options={[
              {
                value: "horizontal",
                label: t("globals.splitPaneHorizontal"),
              },
              {
                value: "vertical",
                label: t("globals.splitPaneVertical"),
              },
            ]}
          />
          <div className="sandbox-split-stage">
            <SplitPane
              key={splitOrientation}
              orientation={splitOrientation}
              label={t("globals.splitPaneResizeAria")}
              start={
                <div className="sandbox-split-pane-pad">
                  <strong>{t("globals.splitPaneStartTitle")}</strong>
                  <p>{t("globals.splitPaneStartBody")}</p>
                </div>
              }
              end={
                <div className="sandbox-split-pane-pad">
                  <strong>{t("globals.splitPaneEndTitle")}</strong>
                  <p>{t("globals.splitPaneEndBody")}</p>
                </div>
              }
            />
          </div>
          <SandboxHelp text={t("globals.splitPaneHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="tree">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <Card title={t("globals.treeAria")}>
            <div className="sandbox-tree-stage fynns-scroll">
              <Tree
                label={t("globals.treeAria")}
                selectedId={treeSelectedId}
                onSelectedChange={setTreeSelectedId}
              >
                <TreeItem
                  id="src"
                  label={t("globals.treeFolderSrc")}
                  icon={<FolderOpenIcon />}
                  defaultExpanded
                >
                  <TreeItem
                    id="src/components"
                    label={t("globals.treeFolderComponents")}
                    icon={<FolderOpenIcon />}
                    defaultExpanded
                  >
                    <TreeItem
                      id="src/components/Tree.tsx"
                      label={t("globals.treeFileTree")}
                      icon={<FileIcon />}
                    />
                    <TreeItem
                      id="src/App.tsx"
                      label={t("globals.treeFileApp")}
                      icon={<FileIcon />}
                    />
                  </TreeItem>
                </TreeItem>
                <TreeItem
                  id="README.md"
                  label={t("globals.treeFileReadme")}
                  icon={<FileIcon />}
                />
                <TreeItem
                  id="package.json"
                  label={t("globals.treeFilePackage")}
                  icon={<FileIcon />}
                />
              </Tree>
            </div>
            <p className="sandbox-tree-selected" aria-live="polite">
              {t("globals.treeSelected")}:{" "}
              <code>{treeSelectedId ?? "—"}</code>
            </p>
          </Card>
          <SandboxHelp text={t("globals.treeHelp")} />
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
            indicator="linear"
            label={t("globals.busyScrimLabel")}
            message={t("globals.busyScrimMessage")}
            value={0.7}
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
          <SandboxHelp text={t("globals.busyPaintHelp")} />
          <SandboxHelp text={t("globals.busyPaintYieldHelp")} />
          <div className="fynns-unit-stack" style={{ width: "100%" }}>
            <div id="sandbox-busy-task-timeout" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="tonal"
                disabled={busyTaskHang}
                onClick={() => {
                  setBusyTaskTimeoutNote(null);
                  void runBusyTask(
                    setBusyTaskHang,
                    () => new Promise(() => {}),
                    {
                      timeoutMs: 800,
                      onError: (_err, meta) => {
                        setBusyTaskTimeoutNote(t("globals.busyTaskTimeoutNote", { reason: meta.reason }));
                      },
                    },
                  ).catch(() => {});
                }}
              >
                {t("globals.busyTaskTimeout")}
              </Button>
              {busyTaskTimeoutNote ? (
                <span className="fynns-table-meta">{busyTaskTimeoutNote}</span>
              ) : null}
            </div>
            <SandboxHelp text={t("globals.busyTaskTimeoutHelp")} />
            <div id="sandbox-busy-task-abort" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="tonal"
                disabled={busyTaskAbort.busy}
                onClick={() => {
                  setBusyTaskAbortNote(null);
                  void busyTaskAbort
                    .run(
                      t("globals.busyPaintLabel"),
                      () => new Promise(() => {}),
                      {
                        onError: (_err, meta) => {
                          setBusyTaskAbortNote(t("globals.busyTaskAbortNote", { reason: meta.reason }));
                        },
                      },
                    )
                    .catch(() => {});
                }}
              >
                {t("globals.busyTaskAbortStart")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={!busyTaskAbort.busy}
                onClick={() => busyTaskAbort.abort()}
              >
                {t("globals.busyTaskAbortStop")}
              </Button>
              {busyTaskAbortNote ? (
                <span className="fynns-table-meta">{busyTaskAbortNote}</span>
              ) : null}
            </div>
            <SandboxHelp text={t("globals.busyTaskAbortHelp")} />
            <div id="sandbox-busy-task-generation" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="tonal"
                onClick={() => {
                  void busyPaintGood
                    .run(t("globals.busyPaintLabel"), async () => {
                      await new Promise((r) => setTimeout(r, 1200));
                    })
                    .catch(() => {});
                }}
              >
                {t("globals.busyTaskGeneration")}
              </Button>
              <span className="fynns-table-meta">
                {t("globals.busyTaskGenerationMeta", {
                  generation: String(busyPaintGood.generation),
                  busy: busyPaintGood.busy ? "true" : "false",
                })}
              </span>
            </div>
            <SandboxHelp text={t("globals.busyTaskGenerationHelp")} />
            <div id="sandbox-button-loading-task" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                loading={buttonLoadingDirect}
                onClick={() => {
                  setButtonLoadingNote(null);
                  void runLoadingTask(
                    setButtonLoadingDirect,
                    () => new Promise(() => {}),
                    {
                      timeoutMs: 800,
                      onError: (_err, meta) => {
                        setButtonLoadingNote(t("globals.buttonLoadingTaskNote", { reason: meta.reason }));
                      },
                    },
                  ).catch(() => {});
                }}
              >
                {t("globals.buttonLoadingTask")}
              </Button>
              {buttonLoadingNote ? (
                <span className="fynns-table-meta">{buttonLoadingNote}</span>
              ) : null}
            </div>
            <SandboxHelp text={t("globals.buttonLoadingTaskHelp")} />
            <div id="sandbox-confirm-loading-trap" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="tonal"
                onClick={() => {
                  setConfirmTrapNote(null);
                  setConfirmTrapOpen(true);
                }}
              >
                {t("globals.confirmTrapOpen")}
              </Button>
              {confirmTrapNote ? (
                <span className="fynns-table-meta">{confirmTrapNote}</span>
              ) : null}
            </div>
            <ConfirmDialog
              open={confirmTrapOpen}
              onOpenChange={setConfirmTrapOpen}
              title={t("globals.confirmTrapTitle")}
              description={t("globals.confirmTrapDescription")}
              confirmLabel={t("globals.confirmTrapConfirm")}
              cancelLabel={t("globals.confirmTrapCancel")}
              loading={confirmTrapLoading.loading}
              onAbort={() => confirmTrapLoading.abort()}
              onConfirm={() => {
                void confirmTrapLoading
                  .run(
                    () => new Promise(() => {}),
                    {
                      timeoutMs: 5000,
                      onError: (_err, meta) => {
                        setConfirmTrapNote(t("globals.confirmTrapNote", { reason: meta.reason }));
                        setConfirmTrapOpen(false);
                      },
                    },
                  )
                  .catch(() => {});
              }}
            />
            <SandboxHelp text={t("globals.confirmTrapHelp")} />
            <div id="sandbox-chat-busy-no-stop" className="sandbox-globals-row" style={{ flexWrap: "wrap", gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChatBusyNoStop((v) => !v)}
              >
                {chatBusyNoStop ? t("globals.chatBusyNoStopOff") : t("globals.chatBusyNoStopOn")}
              </Button>
            </div>
            <div style={{ width: "min(24rem, 100%)", height: "12rem" }}>
              <Chat>
                <ChatThread aria-label={t("globals.chatBusyNoStopAria")}>
                  <ChatMessage role="assistant">{t("globals.chatBusyNoStopMessage")}</ChatMessage>
                </ChatThread>
                <ChatComposer
                  value=""
                  onChange={() => {}}
                  onSubmit={() => {}}
                  busy={chatBusyNoStop}
                  ariaLabel={t("globals.chatBusyNoStopAria")}
                  placeholder={t("globals.chatBusyNoStopPlaceholder")}
                />
              </Chat>
            </div>
            <SandboxHelp text={t("globals.chatBusyNoStopHelp")} />
          </div>
          <BusyScrim
            open={
              busyPaintBad ||
              busyPaintGood.busy ||
              busyYield ||
              busyRunDirect ||
              busyTaskHang ||
              busyTaskAbort.busy
            }
            label={
              busyPaintGood.busy
                ? (busyPaintGood.label ?? t("globals.busyPaintLabel"))
                : busyTaskAbort.busy
                  ? (busyTaskAbort.label ?? t("globals.busyPaintLabel"))
                  : t("globals.busyPaintLabel")
            }
            message={t("globals.busyPaintMessage")}
          />
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
          <Card title={t("globals.tableCaption")} chrome="plain">
          <div
            className="fynns-table-wrap fynns-scroll sandbox-table-h-scroll"
            data-fynns-wheel-x={tableWheelX ? undefined : "off"}
          >
            <Table>
              <TableCaption>{t("globals.tableCaption")}</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{t("globals.tableColName")}</TableHeaderCell>
                  <TableHeaderCell>{t("globals.tableColStatus")}</TableHeaderCell>
                  <TableHeaderCell align="end">
                    {t("globals.tableColQty")}
                  </TableHeaderCell>
                  <TableHeaderCell align="end">
                    {t("globals.tableColCache")}
                  </TableHeaderCell>
                  <TableHeaderCell align="end">
                    {t("globals.tableColTotal")}
                  </TableHeaderCell>
                  <TableHeaderCell>{t("globals.tableColMapping")}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div>sample/catalog-item-with-an-extremely-long-identifier-for-table-overflow-and-a-second-descriptive-segment</div>
                    <FieldHint>{t("globals.tableMapManual")}</FieldHint>
                  </TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell align="end">8</TableCell>
                  <TableCell align="end">16M</TableCell>
                  <TableCell align="end">24M</TableCell>
                  <TableCell>sample/ink-35b</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>sample/ink-bench-16k</TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell align="end">12</TableCell>
                  <TableCell align="end">31M</TableCell>
                  <TableCell align="end">31M</TableCell>
                  <TableCell>
                    <div className="fynns-control-cluster fynns-control-cluster--end-align">
                      <span className="fynns-table-meta">{t("globals.tableMapManual")}</span>
                      <span
                        className="fynns-control-cluster__grow"
                        style={{ fontFamily: "var(--fynns-font-mono)" }}
                      >
                        sample/ink-35b
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        {t("globals.tableMapAction")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>sample/surface-kit-agent</TableCell>
                  <TableCell>Draft</TableCell>
                  <TableCell align="end">4</TableCell>
                  <TableCell align="end">—</TableCell>
                  <TableCell align="end">4</TableCell>
                  <TableCell>
                    <div className="fynns-control-cluster fynns-control-cluster--end-align">
                      <span className="fynns-table-meta">{t("globals.tableMapAuto")}</span>
                      <span
                        className="fynns-control-cluster__grow"
                        style={{ fontFamily: "var(--fynns-font-mono)" }}
                      >
                        catalog
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        {t("globals.tableMapAction")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>sample/focus-ring</TableCell>
                  <TableCell>Ready</TableCell>
                  <TableCell align="end">28</TableCell>
                  <TableCell align="end">717k</TableCell>
                  <TableCell align="end">28</TableCell>
                  <TableCell>
                    <div className="fynns-control-cluster fynns-control-cluster--end-align">
                      <span className="fynns-table-meta">{t("globals.tableMapUnpriced")}</span>
                      <span className="fynns-control-cluster__grow" aria-hidden="true" />
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        {t("globals.tableMapAction")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          </Card>
          <Switch
            labelSide="end"
            label={t("globals.tableWheelX")}
            checked={tableWheelX}
            onCheckedChange={setTableWheelX}
          />
          <SandboxHelp text={t("globals.tableWheelXHelp")} />
          <Card title={t("globals.tableStickyCaption")} chrome="plain">
          <div className="fynns-table-wrap fynns-scroll sandbox-table-sticky">
            <Table stickyHeader>
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
                {[
                  "sample/ink-bench-16k",
                  "sample/surface-kit-agent",
                  "sample/focus-ring",
                  "sample/token-ladder",
                  "sample/radius-22",
                  "sample/busy-region",
                ].map((name, i) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{i % 2 === 0 ? "Ready" : "Draft"}</TableCell>
                    <TableCell align="end">{(i + 1) * 4}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </Card>
          <SandboxHelp text={t("globals.tableStickyHelp")} />
          <TableRevealMoreDemo />
          <SandboxHelp text={t("globals.tableHelp")} />
          <SandboxHelp text={t("globals.tableRevealHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="chart">
          <ChartAnalyticsDemo />
          <TokenList
            group="chart"
            title={t("globals.tokenListChart")}
            keys={Object.keys(CHART_TOKENS)}
          />
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
            code={`def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("world"))\n    print(greet("sandbox"))\n`}
            maxHeight="8rem"
          />
          <CodeBlock
            variant="plain"
            language="text"
            copyAriaLabel={t("globals.codeBlockCopy")}
            code={t("globals.codeBlockLongLine")}
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
          {/* Narrow host — soft-wrap editable (native selection). */}
          <div style={{ maxWidth: "22rem" }}>
            <CodeBlock
              variant="editable"
              label={t("globals.codeBlockSoftWrapSelLabel")}
              language="bash"
              copyAriaLabel={t("globals.codeBlockCopy")}
              defaultValue={t("globals.codeBlockSoftWrapHlSelCode")}
              aria-label={t("globals.codeBlockSoftWrapSelAria")}
              maxHeight="8rem"
            />
          </div>
          <SandboxHelp text={t("globals.codeBlockSoftWrapSelHelp")} />
          <Card
            title={t("globals.codeBlockFileBodyTitle")}
            chrome="plain"
          >
            <CodeBlock
              variant="editable"
              language={codeLanguageFromPath(FILE_BODY_SAMPLE_PATH) ?? "markdown"}
              defaultValue={FILE_BODY_SAMPLE_MD}
              copyAriaLabel={t("globals.codeBlockCopy")}
              aria-label={t("globals.codeBlockFileBodyAria")}
            />
          </Card>
          <SandboxHelp text={t("globals.codeBlockFileBodyHelp")} />
          <Card title={t("globals.codeBlockFileBodyTitle")} chrome="plain">
            <CodeBlock
              variant="editable"
              language={codeLanguageFromPath(FILE_BODY_SAMPLE_PATH) ?? "markdown"}
              readOnly
              defaultValue={FILE_BODY_SAMPLE_MD}
              copyAriaLabel={t("globals.codeBlockCopy")}
              aria-label={t("globals.codeBlockFileBodyAria")}
            />
          </Card>
          <SandboxHelp text={t("globals.codeBlockFileBodyReadOnlyHelp")} />
          <div className="sandbox-globals-row" style={{ alignItems: "center" }}>
            <Button
              size="sm"
              variant="tonal"
              onClick={() => setCodeBlockHiddenTabOpen((open) => !open)}
            >
              {codeBlockHiddenTabOpen
                ? t("globals.codeBlockHiddenTabHide")
                : t("globals.codeBlockHiddenTabShow")}
            </Button>
          </div>
          <div hidden={!codeBlockHiddenTabOpen} id="sandbox-code-block-hidden-tab">
            <CodeBlock
              variant="editable"
              language="markdown"
              value={FILE_BODY_SAMPLE_MD}
              copyAriaLabel={t("globals.codeBlockCopy")}
              aria-label={t("globals.codeBlockHiddenTabAria")}
            />
          </div>
          <SandboxHelp text={t("globals.codeBlockHiddenTabHelp")} />
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
        <GlobalsDemo id="diff-view">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <DiffView
            maxHeight={12 * 16}
            lines={[
              { type: "meta", text: "@@ sample @@" },
              { type: "same", text: " keep this line" },
              { type: "del", text: "- remove the old value" },
              { type: "add", text: "+ add the new value" },
            ]}
          />
          <SandboxHelp text={t("globals.diffViewHelp")} />
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
          <div className="sandbox-pagination-narrow-host">
            <Card title={t("globals.paginationCardTitle")}>
              <div className="fynns-pagination-bar fynns-scroll">
                <div className="fynns-pagination-bar__start">
                  <span className="fynns-table-meta">
                    {t("globals.paginationPageSizeLabel")}
                  </span>
                  <Select
                    ariaLabel={t("globals.paginationPageSizeAria")}
                    value={pageSize}
                    options={[
                      { value: "10", label: t("globals.paginationPageSize10") },
                      { value: "50", label: t("globals.paginationPageSize50") },
                      { value: "100", label: t("globals.paginationPageSize100") },
                    ]}
                    onChange={setPageSize}
                  />
                  <FieldHint>
                    {t("globals.paginationRange")
                      .replace(
                        "{from}",
                        String((page - 1) * Number(pageSize) + 1),
                      )
                      .replace(
                        "{to}",
                        String(Math.min(page * Number(pageSize), 120)),
                      )
                      .replace("{total}", "120")}
                  </FieldHint>
                </div>
                <div className="fynns-pagination-bar__end">
                  <Pagination
                    page={page}
                    pageCount={Math.max(1, Math.ceil(120 / Number(pageSize)))}
                    onPageChange={setPage}
                    ariaLabel={t("globals.paginationAria")}
                    previousAriaLabel={t("globals.paginationPrev")}
                    nextAriaLabel={t("globals.paginationNext")}
                    getPageAriaLabel={(n) =>
                      t("globals.paginationPage").replace("{n}", String(n))
                    }
                  />
                </div>
              </div>
            </Card>
          </div>
          <SandboxHelp text={t("globals.paginationHelp")} />
        </div>
        </GlobalsDemo>
        <GlobalsDemo id="status-bar">
        <div className="sandbox-globals-row sandbox-globals-row--stack">
          <div className="sandbox-globals-status-bar">
            <StatusBar
              aria-label={t("globals.statusBarAria")}
              leading={
                <>
                  <StatusBarItem>{t("globals.statusBarBranch")}</StatusBarItem>
                  <StatusBarItem>
                    {t("globals.statusBarWorkspace")}
                  </StatusBarItem>
                </>
              }
              trailing={
                <>
                  <StatusBarItem
                    onClick={() =>
                      snackbar(t("globals.statusBarProblemsToast"), {
                        duration: "short",
                        dismissAriaLabel: t("globals.snackbarDismiss"),
                      })
                    }
                  >
                    {t("globals.statusBarProblems")}
                  </StatusBarItem>
                  <StatusBarItem>
                    {t("globals.statusBarEncoding")}
                  </StatusBarItem>
                  <StatusBarItem>
                    {t("globals.statusBarCursor")}
                  </StatusBarItem>
                </>
              }
            />
          </div>
          <SandboxHelp text={t("globals.statusBarHelp")} />
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
                <code>--fynns-layout-field-label-control-gap</code>
              </dt>
              <dd>{t("globals.rhythmTokenFieldLabel")}</dd>
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
        <SandboxHelp text={t("globals.rhythmSurfaceHelp")} />
        <Surface
          variant="outlined"
          padded
          className="sandbox-globals-rhythm-surface"
        >
          <ControlBlock description={t("globals.rhythmAsOfHint")}>
            <ControlStack columns={1}>
              <ControlRow label={t("globals.rhythmSourceLabel")}>
                <div className="fynns-control-cluster">
                  <ToggleGroup
                    size="compact"
                    ariaLabel={t("globals.rhythmSourceLabel")}
                    value={rhythmSource}
                    onChange={setRhythmSource}
                    options={[
                      {
                        value: "catalog",
                        label: t("globals.rhythmSourceAlpha"),
                      },
                      {
                        value: "mirror",
                        label: t("globals.rhythmSourceBeta"),
                      },
                    ]}
                  />
                  <Button size="sm" variant="ghost">
                    {t("globals.rhythmRefresh")}
                  </Button>
                </div>
              </ControlRow>
            </ControlStack>
          </ControlBlock>
        </Surface>
        <SandboxHelp text={t("globals.rhythmCatalogHelp")} />
        <div id="sandbox-rhythm-catalog">
          <Surface variant="outlined" padded className="sandbox-globals-rhythm-catalog">
            <ControlRow label={t("globals.rhythmCatalogLabel")}>
              <div className="fynns-control-cluster">
                <Tooltip content={t("globals.rhythmCatalogBulk")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.rhythmCatalogBulk")}
                  >
                    <ListChecksIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.rhythmCatalogRefresh")}>
                  <IconButton
                    variant="ghost"
                    aria-label={t("globals.rhythmCatalogRefresh")}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip content={t("globals.rhythmCatalogAdd")}>
                  <IconButton
                    variant="primary"
                    aria-label={t("globals.rhythmCatalogAdd")}
                  >
                    <PlusIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </ControlRow>
          </Surface>
        </div>
        <SandboxHelp text={t("globals.rhythmEndAlignHelp")} />
        <Surface variant="outlined" padded>
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Button
              size="sm"
              variant="tonal"
              loading={rhythmFooterBusy === "secondary"}
              disabled={
                rhythmFooterBusy !== null && rhythmFooterBusy !== "secondary"
              }
              onClick={() => {
                setRhythmFooterBusy("secondary");
                window.setTimeout(() => setRhythmFooterBusy(null), 1600);
              }}
            >
              {t("globals.rhythmEndAlignSecondary")}
            </Button>
            <Button
              size="sm"
              loading={rhythmFooterBusy === "primary"}
              disabled={
                rhythmFooterBusy !== null && rhythmFooterBusy !== "primary"
              }
              onClick={() => {
                setRhythmFooterBusy("primary");
                window.setTimeout(() => setRhythmFooterBusy(null), 1600);
              }}
            >
              {t("globals.rhythmEndAlignPrimary")}
            </Button>
          </div>
        </Surface>
        <SandboxHelp text={t("globals.rhythmEndAlignIconHelp")} />
        <Surface variant="outlined" padded>
          <div className="fynns-control-cluster fynns-control-cluster--end-align">
            <Tooltip content={t("globals.rhythmEndAlignIconOpenTip")}>
              <IconButton aria-label={t("globals.rhythmEndAlignIconOpenTip")}>
                <FolderOpenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content={t("globals.rhythmEndAlignIconPrimaryTip")}>
              <IconButton
                variant="primary"
                aria-label={t("globals.rhythmEndAlignIconPrimaryTip")}
              >
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Surface>
        <SandboxHelp text={t("globals.rhythmGridHelp")} />
        <Grid x={2} y={2} gap="sm">
          <Button size="sm">{t("globals.rhythmGridA")}</Button>
          <Button size="sm" variant="tonal">{t("globals.rhythmGridB")}</Button>
          <Button size="sm" variant="ghost">{t("globals.rhythmGridC")}</Button>
          <Button size="sm" variant="default">{t("globals.rhythmGridD")}</Button>
        </Grid>
        <SandboxHelp text={t("globals.rhythmAgentHint")} />
        </GlobalsDemo>

        <GlobalsDemo id="provider-settings">
          <SandboxHelp text={t("globals.providerSettingsHelp")} />
          <ProviderSettingsManageShell />
        </GlobalsDemo>

        <GlobalsDemo id="form-recipe">
          <SandboxHelp text={t("globals.formRecipeLead")} />
          <SandboxHelp text={t("globals.formGridSelectHelp")} />
          <div className="sandbox-globals-form-recipe-hosts">
            <SandboxHelp text={t("globals.formRecipeHostCard")} />
            <div id="sandbox-field-stack-grid-select">
              <Card
                className="sandbox-globals-form-recipe"
                title={t("globals.formRecipeTitle")}
                actions={
                  <div className="fynns-control-cluster">
                    <InfoHint
                      size="sm"
                      content={t("globals.formRecipeCardRunHelp")}
                    />
                    <Tooltip content={t("globals.formRecipeCardRunTip")}>
                      <IconButton
                        size="sm"
                        variant="primary"
                        aria-label={t("globals.formRecipeCardRunTip")}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                }
              >
                <FormRecipeFields idPrefix="sandbox-form-card" {...formRecipeFieldProps} />
              </Card>
            </div>
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
            <div className="sandbox-globals-row" style={{ gap: "var(--fynns-space-sm)" }}>
              <Button
                size="sm"
                variant="tonal"
                onClick={() => setFormRecipeDialogOpen(true)}
              >
                {t("globals.formRecipeDialogOpen")}
              </Button>
              <Button
                size="sm"
                variant="tonal"
                onClick={() => setFormRecipeStackDialogOpen(true)}
              >
                {t("globals.formRecipeStackDialogOpen")}
              </Button>
              <Button
                size="sm"
                variant="tonal"
                onClick={() => setFormRecipeFileDialogOpen(true)}
              >
                {t("globals.formRecipeFileDialogOpen")}
              </Button>
            </div>
          </div>
          <Dialog
            open={formRecipeDialogOpen}
            onOpenChange={setFormRecipeDialogOpen}
            title={t("globals.formRecipeTitle")}
            size="lg"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
            feet={
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Button variant="ghost" size="sm" disabled>
                  {t("globals.formRecipeDialogCancel")}
                </Button>
                <Button variant="tonal" size="sm" disabled>
                  {t("globals.formRecipeDialogCopyPrompt")}
                </Button>
                <Button variant="tonal" size="sm" disabled>
                  {t("globals.formRecipeDialogImportJson")}
                </Button>
                <Button size="sm" loading>
                  {t("globals.formRecipeDialogExtract")}
                </Button>
              </div>
            }
          >
            <FormRecipeFields
              idPrefix="sandbox-form-dialog"
              {...formRecipeFieldProps}
            />
          </Dialog>
          <Dialog
            open={formRecipeStackDialogOpen}
            onOpenChange={setFormRecipeStackDialogOpen}
            title={t("globals.formRecipeStackDialogTitle")}
            size="lg"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
          >
            <FieldHint>{t("globals.formRecipeStackDialogHelp")}</FieldHint>
            <Card title={t("globals.formRecipeStackStepOne")}>
              <FieldHint>{t("globals.formRecipeStackStepOneHint")}</FieldHint>
              <FieldHint>{t("globals.formRecipeStackStepOneBody")}</FieldHint>
            </Card>
            <Divider />
            <Card title={t("globals.formRecipeStackStepTwo")}>
              <FieldHint>{t("globals.formRecipeStackStepTwoHint")}</FieldHint>
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Button size="sm" variant="tonal" disabled>
                  {t("globals.formRecipeStackStepTwo")}
                </Button>
              </div>
            </Card>
            <Divider />
            <Card title={t("globals.formRecipeStackStepThree")}>
              <FieldHint>{t("globals.formRecipeStackStepThreeHint")}</FieldHint>
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Button size="sm" disabled>
                  {t("globals.formRecipeSave")}
                </Button>
              </div>
            </Card>
            <Divider />
            <Card title={t("globals.formRecipeStackStepFour")}>
              <FieldHint>{t("globals.formRecipeStackStepFourHint")}</FieldHint>
              <FieldStack>
                <FieldBlock
                  label={t("globals.formRecipeStackPasteLabel")}
                  htmlFor="sandbox-form-stack-paste"
                >
                  <Textarea
                    id="sandbox-form-stack-paste"
                    rows={8}
                    autoGrow
                    aria-label={t("globals.formRecipeStackPasteLabel")}
                    defaultValue=""
                    placeholder={t("globals.formRecipeStackStepFourHint")}
                  />
                </FieldBlock>
              </FieldStack>
            </Card>
          </Dialog>
          <Dialog
            open={formRecipeFileDialogOpen}
            onOpenChange={setFormRecipeFileDialogOpen}
            title={t("globals.formRecipeFileDialogTitle")}
            size="lg"
            showCloseButton
            closeAriaLabel={t("globals.dialogClose")}
            feet={
              <div className="fynns-control-cluster fynns-control-cluster--end-align">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormRecipeFileDialogOpen(false)}
                >
                  {t("globals.formRecipeDialogCancel")}
                </Button>
                <Button size="sm" onClick={() => setFormRecipeFileDialogOpen(false)}>
                  {t("globals.formRecipeFileDialogSave")}
                </Button>
              </div>
            }
          >
            <CodeBlock
              variant="editable"
              label={FILE_BODY_SAMPLE_PATH}
              language={codeLanguageFromPath(FILE_BODY_SAMPLE_PATH) ?? "markdown"}
              defaultValue={FILE_BODY_SAMPLE_MD}
              copyAriaLabel={t("globals.codeBlockCopy")}
              aria-label={t("globals.codeBlockFileBodyAria")}
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
