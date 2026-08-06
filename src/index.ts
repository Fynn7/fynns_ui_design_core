/**
 * @fynns/ui-design-core -- barrel entry.
 *
 * Public surface = symbols demoed in sandbox GlobalsPage + Preview canvases
 * (plus theme infrastructure). See llm/BREAKING_PURGE.md.
 */
import "./theme/theme.css";
import "./primitives/primitives.css";

/* Theme (tokens + helpers) */
export * from "./theme/tokens";
export * from "./theme/motionTokens";
export * from "./theme/scrollbar";
export * from "./theme/themeMode";

/* Icons (public subset) */
export {
  ArchiveIcon,
  ArrowLeftIcon,
  BarChartIcon,
  BotIcon,
  ChevronRightIcon,
  ClipboardIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileIcon,
  FolderOpenIcon,
  ICON_SIZE,
  InfoIcon,
  LayoutGridIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  ArrowUpIcon,
  MicIcon,
  StopSquareIcon,
  ChevronDownIcon,
  SunIcon,
  TrashIcon,
  UndoIcon,
  UploadIcon,
} from "./primitives/icons";

/* Primitives — named keep-list only */
export { Button } from "./primitives/Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./primitives/Button";
export { SplitButton } from "./primitives/SplitButton";
export type {
  SplitButtonProps,
  SplitButtonSize,
  SplitButtonVariant,
} from "./primitives/SplitButton";
export { IconButton } from "./primitives/IconButton";
export { Input } from "./primitives/Input";
export type { InputProps, InputSize, InputVariant } from "./primitives/Input";
export { SearchBar, SearchBarResult } from "./primitives/SearchBar";
export type {
  SearchBarProps,
  SearchBarResultProps,
} from "./primitives/SearchBar";
export { Banner } from "./primitives/Banner";
export type { BannerProps, BannerVariant } from "./primitives/Banner";
export { Breadcrumb } from "./primitives/Breadcrumb";
export type { BreadcrumbItemData, BreadcrumbProps } from "./primitives/Breadcrumb";
export { Pagination } from "./primitives/Pagination";
export type { PaginationProps } from "./primitives/Pagination";
export { List, ListItem } from "./primitives/List";
export type { ListItemProps, ListProps } from "./primitives/List";
export {
  DatePicker,
  DatePickerDialog,
  DateRangePicker,
  DateRangePickerDialog,
  formatDateValue,
  parseDateValue,
} from "./primitives/DatePicker";
export type {
  DatePickerDialogProps,
  DatePickerProps,
  DateRangePickerDialogProps,
  DateRangePickerProps,
  DateRangeValue,
  DateValue,
} from "./primitives/DatePicker";
export { TimePicker, TimePickerDialog } from "./primitives/TimePicker";
export type {
  TimePickerDialogProps,
  TimePickerProps,
} from "./primitives/TimePicker";
export { Carousel, CarouselItem } from "./primitives/Carousel";
export type {
  CarouselItemProps,
  CarouselProps,
  CarouselVariant,
} from "./primitives/Carousel";
export { Select } from "./primitives/Select";
export type { SelectOption, SelectProps } from "./primitives/Select";
export { Autocomplete } from "./primitives/Autocomplete";
export type {
  AutocompleteOption,
  AutocompleteProps,
} from "./primitives/Autocomplete";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./primitives/DropdownMenu";
export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
  DropdownMenuSeparatorProps,
} from "./primitives/DropdownMenu";
export { ContextMenu, ContextMenuTrigger } from "./primitives/ContextMenu";
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
} from "./primitives/ContextMenu";
export { Tooltip } from "./primitives/Tooltip";
export type { TooltipProps } from "./primitives/Tooltip";
export { InfoHint } from "./primitives/InfoHint";
export type { InfoHintProps } from "./primitives/InfoHint";
export { snackbar, SnackbarHost } from "./primitives/Snackbar";
export type {
  SnackbarAction,
  SnackbarDuration,
  SnackbarHostProps,
  SnackbarOptions,
} from "./primitives/Snackbar";
export { FullscreenDialog, Dialog, DialogShell, ConfirmDialog } from "./primitives/Dialog";
export type {
  FullscreenDialogProps,
  DialogProps,
  DialogShellProps,
  ConfirmDialogProps,
  DialogVariant,
  DrawerSide,
} from "./primitives/Dialog";
export { Drawer } from "./primitives/Drawer";
export type { DrawerProps } from "./primitives/Drawer";
export { BottomSheet } from "./primitives/BottomSheet";
export type { BottomSheetProps, BottomSheetSize } from "./primitives/BottomSheet";
export { Textarea } from "./primitives/Textarea";
export type {
  TextareaProps,
  TextareaSize,
  TextareaVariant,
} from "./primitives/Textarea";
export { Tabs } from "./primitives/Tabs";
export type { TabsProps, TabItem, TabsSize } from "./primitives/Tabs";
export { InlineAlert } from "./primitives/InlineAlert";
export type {
  InlineAlertProps,
  InlineAlertSeverity,
} from "./primitives/InlineAlert";
export { Switch } from "./primitives/Switch";
export type { SwitchProps } from "./primitives/Switch";
export { Checkbox } from "./primitives/Checkbox";
export type { CheckboxProps } from "./primitives/Checkbox";
export { Radio } from "./primitives/Radio";
export type { RadioProps } from "./primitives/Radio";
export { Chip, ChipSet } from "./primitives/Chip";
export type { ChipProps, ChipSetProps, ChipVariant } from "./primitives/Chip";
export { ControlRow } from "./primitives/ControlRow";
export type { ControlRowProps } from "./primitives/ControlRow";
export { ControlStack } from "./primitives/ControlStack";
export type { ControlStackProps } from "./primitives/ControlStack";
export { Grid } from "./primitives/Grid";
export type { GridProps } from "./primitives/Grid";
export { ToggleGroup } from "./primitives/ToggleGroup";
export type { ToggleGroupOption, ToggleGroupProps } from "./primitives/ToggleGroup";
export { Collapsible } from "./primitives/Collapsible";
export type { CollapsibleProps } from "./primitives/Collapsible";
export { Slider } from "./primitives/Slider";
export type { SliderProps } from "./primitives/Slider";
export { Card } from "./primitives/Card";
export type { CardProps } from "./primitives/Card";
export { Surface } from "./primitives/Surface";
export type { SurfaceProps, SurfaceVariant } from "./primitives/Surface";
export { FieldBlock, FieldHeader } from "./primitives/FieldHeader";
export type {
  FieldBlockProps,
  FieldHeaderProps,
} from "./primitives/FieldHeader";
export { LinearProgress, CircularProgress } from "./primitives/Progress";
export type {
  CircularProgressProps,
  LinearProgressProps,
} from "./primitives/Progress";
export { BusyScrim, BusyRegion } from "./primitives/Busy";
export type { BusyScrimProps, BusyRegionProps } from "./primitives/Busy";
export {
  afterNextPaint,
  yieldToMain,
  runBusyTask,
  useBusyTask,
} from "./scheduling/busyTask";
export type { UseBusyTaskResult } from "./scheduling/busyTask";
export { Badge } from "./primitives/Badge";
export type { BadgeProps, BadgeSize, BadgeVariant } from "./primitives/Badge";
export { BadgedBox } from "./primitives/BadgedBox";
export type { BadgedBoxProps } from "./primitives/BadgedBox";
export { Avatar } from "./primitives/Avatar";
export type { AvatarProps, AvatarSize } from "./primitives/Avatar";
export { AvatarGroup } from "./primitives/AvatarGroup";
export type { AvatarGroupProps } from "./primitives/AvatarGroup";
export { Fab } from "./primitives/Fab";
export type { FabProps, FabSize, FabVariant } from "./primitives/Fab";
export { FabMenu, FabMenuItem } from "./primitives/FabMenu";
export type { FabMenuItemProps, FabMenuProps } from "./primitives/FabMenu";
export { TopAppBar } from "./primitives/TopAppBar";
export type { TopAppBarProps } from "./primitives/TopAppBar";
export { ClippedNavShell } from "./primitives/ClippedNavShell";
export type {
  ClippedNavShellNavMode,
  ClippedNavShellProps,
} from "./primitives/ClippedNavShell";
export { EndAside } from "./primitives/EndAside";
export type { EndAsideProps } from "./primitives/EndAside";
export { BottomAppBar } from "./primitives/BottomAppBar";
export type { BottomAppBarProps } from "./primitives/BottomAppBar";
export { Toolbar } from "./primitives/Toolbar";
export type { ToolbarProps } from "./primitives/Toolbar";
export {
  NavigationRail,
  NavigationRailHeader,
  NavigationRailItem,
  NavigationRailMenu,
} from "./primitives/NavigationRail";
export type {
  NavigationRailHeaderProps,
  NavigationRailItemProps,
  NavigationRailMenuProps,
  NavigationRailProps,
} from "./primitives/NavigationRail";
export { NavigationBar, NavigationBarItem } from "./primitives/NavigationBar";
export type {
  NavigationBarItemProps,
  NavigationBarProps,
} from "./primitives/NavigationBar";
export {
  NavigationDrawer,
  NavigationDrawerHeadline,
  NavigationDrawerItem,
} from "./primitives/NavigationDrawer";
export type {
  NavigationDrawerHeadlineProps,
  NavigationDrawerItemProps,
  NavigationDrawerProps,
} from "./primitives/NavigationDrawer";
export { Divider } from "./primitives/Divider";
export type { DividerProps } from "./primitives/Divider";
export { OtpInput } from "./primitives/OtpInput";
export type { OtpInputProps } from "./primitives/OtpInput";
export { EmptyState } from "./primitives/EmptyState";
export type { EmptyStateProps } from "./primitives/EmptyState";
export {
  Chat,
  ChatComposer,
  ChatScrollToBottom,
  ChatThread,
} from "./primitives/Chat";
export type {
  ChatComposerProps,
  ChatProps,
  ChatScrollToBottomProps,
  ChatThreadProps,
} from "./primitives/Chat";
export { ChatMessage } from "./primitives/ChatMessage";
export type {
  ChatMessageProps,
  ChatMessageRole,
} from "./primitives/ChatMessage";
export {
  ChatCitationChip,
  ChatCitations,
} from "./primitives/ChatCitation";
export type {
  ChatCitation,
  ChatCitationChipProps,
  ChatCitationsProps,
} from "./primitives/ChatCitation";
export { SkipLink } from "./primitives/SkipLink";
export type { SkipLinkProps } from "./primitives/SkipLink";
export { Stepper } from "./primitives/Stepper";
export type { StepperProps, StepperStep } from "./primitives/Stepper";
export { Dropzone } from "./primitives/Dropzone";
export type { DropzoneProps } from "./primitives/Dropzone";
export {
  measureContentOverflow,
  measureOverflow,
  overflowsBounds,
  OVERFLOW_EPSILON,
} from "./layout/overflowBounds";
export type {
  BoundsOverflow,
  MeasureOverflowOptions,
  OverflowContainer,
  OverflowDelta,
  OverflowEdges,
} from "./layout/overflowBounds";
export { useOverflowBounds } from "./layout/useOverflowBounds";
export type { UseOverflowBoundsOptions } from "./layout/useOverflowBounds";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./primitives/Table";
export type {
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableHeadProps,
  TableHeaderCellProps,
  TableProps,
  TableRowProps,
} from "./primitives/Table";
export { CodeBlock } from "./primitives/CodeBlock";
export type {
  CodeBlockProps,
  CodeBlockVariant,
  CodeBlockReadonlyProps,
  CodeBlockEditableProps,
} from "./primitives/CodeBlock";
export {
  highlightCode,
  highlightWithProfile,
  isHighlightableLanguage,
  normalizeLanguage,
  registerHighlightLanguage,
  unregisterHighlightLanguage,
  getRegisteredHighlightLanguage,
} from "./primitives/codeHighlight";
export type {
  CodeLanguageId,
  CodeSegment,
  CodeTokenKind,
  SimpleHighlightProfile,
} from "./primitives/codeHighlight";
