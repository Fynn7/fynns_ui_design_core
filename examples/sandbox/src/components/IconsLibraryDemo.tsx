import type { ReactNode } from "react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  BarChartIcon,
  BotIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClipboardIcon,
  CloseIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileIcon,
  FolderOpenIcon,
  GlobeIcon,
  InfoIcon,
  LayoutGridIcon,
  ListChecksIcon,
  MenuIcon,
  MicIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PencilIcon,
  PersonIcon,
  PlusIcon,
  PlugIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  SquareIcon,
  StopSquareIcon,
  SunIcon,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  WrenchIcon,
} from "@fynns/ui";

/** Full `@fynns/ui` icon library — consumers may use any glyph; not a subset gate. */
const ICONS: { name: string; node: ReactNode }[] = [
  { name: "AlertCircle", node: <AlertCircleIcon /> },
  { name: "AlertTriangle", node: <AlertTriangleIcon /> },
  { name: "Archive", node: <ArchiveIcon /> },
  { name: "ArrowLeft", node: <ArrowLeftIcon /> },
  { name: "ArrowUp", node: <ArrowUpIcon /> },
  { name: "BarChart", node: <BarChartIcon /> },
  { name: "Bot", node: <BotIcon /> },
  { name: "Briefcase", node: <BriefcaseIcon /> },
  { name: "Check", node: <CheckIcon /> },
  { name: "CheckCircle", node: <CheckCircleIcon /> },
  { name: "CheckSquare", node: <CheckSquareIcon /> },
  { name: "ChevronDown", node: <ChevronDownIcon /> },
  { name: "ChevronLeft", node: <ChevronLeftIcon /> },
  { name: "ChevronRight", node: <ChevronRightIcon /> },
  { name: "ChevronUp", node: <ChevronUpIcon /> },
  { name: "Clipboard", node: <ClipboardIcon /> },
  { name: "Close", node: <CloseIcon /> },
  { name: "Download", node: <DownloadIcon /> },
  { name: "Eye", node: <EyeIcon /> },
  { name: "EyeOff", node: <EyeOffIcon /> },
  { name: "File", node: <FileIcon /> },
  { name: "FolderOpen", node: <FolderOpenIcon /> },
  { name: "Globe", node: <GlobeIcon /> },
  { name: "Info", node: <InfoIcon /> },
  { name: "LayoutGrid", node: <LayoutGridIcon /> },
  { name: "ListChecks", node: <ListChecksIcon /> },
  { name: "Menu", node: <MenuIcon /> },
  { name: "Mic", node: <MicIcon /> },
  { name: "Moon", node: <MoonIcon /> },
  { name: "MoreHorizontal", node: <MoreHorizontalIcon /> },
  { name: "PanelLeft", node: <PanelLeftIcon /> },
  { name: "PanelRight", node: <PanelRightIcon /> },
  { name: "Pencil", node: <PencilIcon /> },
  { name: "Person", node: <PersonIcon /> },
  { name: "Plus", node: <PlusIcon /> },
  { name: "Plug", node: <PlugIcon /> },
  { name: "Refresh", node: <RefreshIcon /> },
  { name: "Save", node: <SaveIcon /> },
  { name: "Search", node: <SearchIcon /> },
  { name: "Settings", node: <SettingsIcon /> },
  { name: "Sparkles", node: <SparklesIcon /> },
  { name: "Square", node: <SquareIcon /> },
  { name: "StopSquare", node: <StopSquareIcon /> },
  { name: "Sun", node: <SunIcon /> },
  { name: "Trash", node: <TrashIcon /> },
  { name: "Undo", node: <UndoIcon /> },
  { name: "Upload", node: <UploadIcon /> },
  { name: "Wrench", node: <WrenchIcon /> },
];

export function IconsLibraryDemo() {
  return (
    <div
      className="sandbox-icons-library"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(7.5rem, 1fr))",
        gap: "var(--fynns-layout-control-stack-gap)",
      }}
    >
      {ICONS.map(({ name, node }) => (
        <div
          key={name}
          className="fynns-control-cluster"
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--fynns-space-2xs)",
            paddingBlock: "var(--fynns-space-xs)",
            color: "var(--fynns-color-text)",
            fontSize: "var(--fynns-font-size-xs)",
          }}
        >
          {node}
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}
