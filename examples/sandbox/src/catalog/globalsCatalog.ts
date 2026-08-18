import type { MessageKey } from "../i18n";

/** M3 / sandbox family ids used by Components page Collapsibles. */
export type GlobalsCategoryId =
  | "actions"
  | "textInputs"
  | "tabs"
  | "selection"
  | "communication"
  | "containment"
  | "patterns"
  | "navigation"
  | "rhythm"
  | "swatches";

export type GlobalsDemoEntry = {
  /** DOM id suffix: `#globals-demo-${id}` */
  id: string;
  categoryId: GlobalsCategoryId;
  /** English display name in search results. */
  label: string;
  /** Extra en/zh aliases (case-insensitive substring match). */
  keywords: string[];
};

/** Category title message keys for search + result subtitles. */
export const GLOBALS_CATEGORY_TITLE_KEY: Record<GlobalsCategoryId, MessageKey> = {
  actions: "globals.catActions",
  textInputs: "globals.catTextInputs",
  tabs: "globals.catTabs",
  selection: "globals.catSelection",
  communication: "globals.catCommunication",
  containment: "globals.catContainment",
  patterns: "globals.catPatterns",
  navigation: "globals.catNavigation",
  rhythm: "globals.rhythm",
  swatches: "globals.swatches",
};

/**
 * Single index of Components-page live demos. Keep in sync with
 * `GlobalsDemo` wrappers in `GlobalsPage.tsx`.
 */
export const GLOBALS_DEMOS: readonly GlobalsDemoEntry[] = [
  {
    id: "button",
    categoryId: "actions",
    label: "Button",
    keywords: ["按钮", "btn", "primary", "tonal", "ghost"],
  },
  {
    id: "split-button",
    categoryId: "actions",
    label: "SplitButton",
    keywords: ["分割按钮", "split"],
  },
  {
    id: "icon-button",
    categoryId: "actions",
    label: "IconButton",
    keywords: ["图标按钮", "icon button"],
  },
  {
    id: "info-hint",
    categoryId: "actions",
    label: "InfoHint",
    keywords: ["提示", "help", "info", "帮助"],
  },
  {
    id: "fab",
    categoryId: "actions",
    label: "Fab",
    keywords: ["浮动按钮", "fab", "fabmenu", "floating"],
  },
  {
    id: "menu",
    categoryId: "actions",
    label: "DropdownMenu",
    keywords: ["菜单", "dropdown", "menu"],
  },
  {
    id: "context-menu",
    categoryId: "actions",
    label: "ContextMenu",
    keywords: ["右键菜单", "context", "contextmenu"],
  },
  {
    id: "input",
    categoryId: "textInputs",
    label: "Input",
    keywords: ["输入框", "text field", "field"],
  },
  {
    id: "select",
    categoryId: "textInputs",
    label: "Select",
    keywords: ["下拉", "选择器", "listbox"],
  },
  {
    id: "autocomplete",
    categoryId: "textInputs",
    label: "Autocomplete",
    keywords: ["自动完成", "combo", "suggest"],
  },
  {
    id: "otp",
    categoryId: "textInputs",
    label: "OtpInput",
    keywords: ["验证码", "otp", "pin"],
  },
  {
    id: "password",
    categoryId: "textInputs",
    label: "Password",
    keywords: ["密码", "password", "可见"],
  },
  {
    id: "textarea",
    categoryId: "textInputs",
    label: "Textarea",
    keywords: ["多行", "textarea", "文本域"],
  },
  {
    id: "tabs",
    categoryId: "tabs",
    label: "Tabs",
    keywords: ["标签页", "tab", "选项卡"],
  },
  {
    id: "switch",
    categoryId: "selection",
    label: "Switch",
    keywords: ["开关", "toggle", "switch"],
  },
  {
    id: "checkbox",
    categoryId: "selection",
    label: "Checkbox",
    keywords: ["复选", "checkbox", "勾选"],
  },
  {
    id: "radio",
    categoryId: "selection",
    label: "Radio",
    keywords: ["单选", "radio"],
  },
  {
    id: "chip",
    categoryId: "selection",
    label: "Chip",
    keywords: ["芯片", "chip", "chipset", "filter chip"],
  },
  {
    id: "toggle-group",
    categoryId: "selection",
    label: "ToggleGroup",
    keywords: ["分段", "segmented", "segment", "分段按钮"],
  },
  {
    id: "slider",
    categoryId: "selection",
    label: "Slider",
    keywords: ["滑块", "slider", "range"],
  },
  {
    id: "date-picker",
    categoryId: "selection",
    label: "DatePicker",
    keywords: ["日期", "calendar", "datepicker", "日期选择"],
  },
  {
    id: "date-range-picker",
    categoryId: "selection",
    label: "DateRangePicker",
    keywords: ["日期范围", "range", "daterange"],
  },
  {
    id: "time-picker",
    categoryId: "selection",
    label: "TimePicker",
    keywords: ["时间", "time", "clock", "时间选择"],
  },
  {
    id: "progress",
    categoryId: "communication",
    label: "Progress",
    keywords: ["进度", "linear", "circular", "spinner"],
  },
  {
    id: "banner",
    categoryId: "communication",
    label: "Banner",
    keywords: ["横幅", "banner"],
  },
  {
    id: "inline-alert",
    categoryId: "communication",
    label: "InlineAlert",
    keywords: ["告警", "alert", "banner", "warning", "error", "提示条"],
  },
  {
    id: "snackbar",
    categoryId: "communication",
    label: "Snackbar",
    keywords: ["吐司", "toast", "snackbar", "snack"],
  },
  {
    id: "chat",
    categoryId: "communication",
    label: "Chat",
    keywords: ["聊天", "chat", "composer", "message", "对话"],
  },
  {
    id: "thinking",
    categoryId: "communication",
    label: "ChatThinking",
    keywords: ["思维", "thinking", "reasoning", "thought", "披露"],
  },
  {
    id: "activity",
    categoryId: "communication",
    label: "ChatActivity",
    keywords: [
      "活动",
      "activity",
      "chain",
      "tool",
      "agent",
      "步骤",
      "状态树",
      "rail",
    ],
  },
  {
    id: "chat-citations",
    categoryId: "communication",
    label: "ChatCitationChip / ChatCitations",
    keywords: ["引用", "citation", "sources", "来源"],
  },
  {
    id: "carousel",
    categoryId: "containment",
    label: "Carousel",
    keywords: ["轮播", "carousel", "slider"],
  },
  {
    id: "avatar",
    categoryId: "containment",
    label: "Avatar",
    keywords: ["头像", "avatar", "avatargroup"],
  },
  {
    id: "badged-box",
    categoryId: "containment",
    label: "BadgedBox",
    keywords: ["角标", "badge", "badged"],
  },
  {
    id: "list",
    categoryId: "containment",
    label: "List",
    keywords: ["列表", "list", "listitem", "path", "catalog", "bookmark", "links", "密度", "tree", "overline"],
  },
  {
    id: "divider",
    categoryId: "containment",
    label: "Divider",
    keywords: ["分割线", "divider", "separator"],
  },
  {
    id: "card",
    categoryId: "containment",
    label: "Card",
    keywords: ["卡片", "card"],
  },
  {
    id: "surface",
    categoryId: "containment",
    label: "Surface",
    keywords: ["表面", "surface"],
  },
  {
    id: "field-header",
    categoryId: "containment",
    label: "FieldHeader",
    keywords: ["字段头", "fieldheader", "label row", "fieldblock"],
  },
  {
    id: "collapsible",
    categoryId: "containment",
    label: "Collapsible",
    keywords: ["折叠", "collapsible", "disclosure", "展开"],
  },
  {
    id: "overlays",
    categoryId: "containment",
    label: "Dialog / Drawer / Sheet",
    keywords: [
      "对话框",
      "dialog",
      "dialogshell",
      "drawer",
      "bottomsheet",
      "sheet",
      "confirm",
      "fullscreen",
      "弹窗",
      "抽屉",
    ],
  },
  {
    id: "empty-state",
    categoryId: "patterns",
    label: "EmptyState",
    keywords: ["空状态", "empty"],
  },
  {
    id: "busy-region",
    categoryId: "patterns",
    label: "BusyRegion",
    keywords: ["忙碌", "busy", "loading region", "linear"],
  },
  {
    id: "busy-scrim",
    categoryId: "patterns",
    label: "BusyScrim",
    keywords: ["遮罩", "scrim", "blocking", "busy"],
  },
  {
    id: "busy-paint",
    categoryId: "patterns",
    label: "Busy paint",
    keywords: ["主线程", "paint", "busy paint"],
  },
  {
    id: "overflow-bounds",
    categoryId: "selection",
    label: "useOverflowBounds",
    keywords: ["溢出", "overflow", "ellipsis", "截断"],
  },
  {
    id: "stepper",
    categoryId: "patterns",
    label: "Stepper",
    keywords: ["步骤", "stepper", "wizard"],
  },
  {
    id: "dropzone",
    categoryId: "patterns",
    label: "Dropzone",
    keywords: ["上传", "dropzone", "file", "拖拽"],
  },
  {
    id: "table",
    categoryId: "patterns",
    label: "Table",
    keywords: ["表格", "table"],
  },
  {
    id: "code-block",
    categoryId: "patterns",
    label: "CodeBlock",
    keywords: ["代码", "code", "syntax", "高亮"],
  },
  {
    id: "diff-view",
    categoryId: "patterns",
    label: "DiffView",
    keywords: ["diff", "unified", "对比", "变更"],
  },
  {
    id: "breadcrumb",
    categoryId: "navigation",
    label: "Breadcrumb",
    keywords: ["面包屑", "breadcrumb"],
  },
  {
    id: "pagination",
    categoryId: "navigation",
    label: "Pagination",
    keywords: ["分页", "pagination", "pager"],
  },
  {
    id: "skip-link",
    categoryId: "navigation",
    label: "SkipLink",
    keywords: ["跳过", "skip", "a11y", "accessibility", "跳转"],
  },
  {
    id: "rhythm",
    categoryId: "rhythm",
    label: "Toolbar rhythm",
    keywords: [
      "节奏",
      "controlstack",
      "controlrow",
      "controlblock",
      "fieldhint",
      "unit-stack",
      "toolbar rhythm",
      "layout",
    ],
  },
  {
    id: "form-recipe",
    categoryId: "rhythm",
    label: "Inspector form recipe",
    keywords: [
      "表单",
      "form",
      "fieldblock",
      "controlblock",
      "fieldstack",
      "inspector",
      "card",
      "collapsible",
      "dialog",
      "recipe",
      "settings",
      "preferences",
    ],
  },
  {
    id: "swatches",
    categoryId: "swatches",
    label: "Radius swatches",
    keywords: ["圆角", "radius", "swatch", "等级"],
  },
] as const;

export function demoElementId(demoId: string): string {
  return `globals-demo-${demoId}`;
}

export function findDemoById(id: string): GlobalsDemoEntry | undefined {
  return GLOBALS_DEMOS.find((d) => d.id === id);
}

export function filterGlobalsDemos(
  query: string,
  categoryLabel: (categoryId: GlobalsCategoryId) => string,
): GlobalsDemoEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return GLOBALS_DEMOS.filter((entry) => {
    const haystack = [
      entry.label,
      entry.id,
      ...entry.keywords,
      categoryLabel(entry.categoryId),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
