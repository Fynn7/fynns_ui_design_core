import type { Locale } from "./types";

/**
 * Flat message catalog for the aesthetic sandbox chrome.
 * Interpolation: `{name}` placeholders; use `t(key, { name })`.
 */
export type MessageKey = keyof typeof en;

const en = {
  "brand.name": "fynns sandbox",

  "nav.aria": "Sandbox pages",
  "nav.playground": "Surfaces",
  "nav.globals": "Globals",
  "nav.foundations": "Foundations",
  "nav.motion": "Motion",
  "nav.templates": "Templates",
  "nav.templatesTip": "Templates & config export/import",
  "nav.templatesAria": "Templates and config",

  "topbar.undo": "Undo",
  "topbar.undoTip": "Undo (Ctrl+Z)",
  "topbar.redo": "Redo",
  "topbar.redoTip": "Redo (Ctrl+Y)",
  "topbar.reset": "Reset",
  "topbar.resetAria": "Reset draft overrides",
  "topbar.resetTip": "Clear all token overrides in the draft (hue, radius, elevation, …)",
  "topbar.resetToast": "Draft reset",
  "topbar.themeLight": "Light theme",
  "topbar.themeDark": "Dark theme",
  "topbar.themeToLight": "Switch to light theme",
  "topbar.themeToDark": "Switch to dark theme",

  "playground.targetCard": "Card",
  "playground.targetCollapsible": "Collapsible",

  "settings.languageTitle": "Language",
  "settings.languageLead": "Switch the sandbox UI between English and Chinese. Choice is saved in this browser.",
  "settings.languageAria": "Interface language",
  "settings.languageEn": "English",
  "settings.languageZh": "中文",

  "templates.lead":
    "Export or import the full sandbox configuration as JSON (token overrides + theme). Save the same bundle as a named template for reuse.",
  "templates.export": "Export JSON",
  "templates.exportTip": "Download current overrides and theme as JSON",
  "templates.import": "Import JSON",
  "templates.importTip": "Import a previously exported config JSON",
  "templates.importAria": "Import config JSON",
  "templates.saveAs": "Save as template",
  "templates.saveAsTip": "Save the current full configuration as a template",
  "templates.currentDraft": "Current draft: {count} override{plural} · theme {theme}",
  "templates.savedTitle": "Saved templates",
  "templates.savedAria": "Saved templates",
  "templates.empty": "No templates yet. Tune tokens on Surfaces / Globals, then Save as template.",
  "templates.cardMeta": "{count} override{plural} · {theme} · {when}",
  "templates.apply": "Apply",
  "templates.exportOneTip": "Download this template as JSON",
  "templates.exportOneAria": "Export {name}",
  "templates.rename": "Rename",
  "templates.deleteTip": "Delete template",
  "templates.deleteAria": "Delete {name}",
  "templates.saveDialogTitle": "Save as template",
  "templates.saveDialogDesc":
    "Stores the current overrides and theme in this browser (same JSON shape as Export).",
  "templates.name": "Name",
  "templates.nameAria": "Template name",
  "templates.namePlaceholder": "e.g. Amber accent workshop",
  "templates.description": "Description (optional)",
  "templates.descriptionAria": "Template description",
  "templates.cancel": "Cancel",
  "templates.saveTemplate": "Save template",
  "templates.renameTitle": "Rename template",
  "templates.save": "Save",
  "templates.toastDownloaded": "Config JSON downloaded",
  "templates.toastNameRequired": "Template name is required",
  "templates.toastSaved": 'Template "{name}" saved',
  "templates.toastExported": 'Exported "{name}"',
  "templates.toastDeleted": 'Deleted "{name}"',
  "templates.toastRenamed": "Template renamed",
  "templates.toastNotFound": "Template not found",
  "templates.toastLoaded": "Loaded {label} ({count} override{plural}, {theme})",

  "preview.anatomy": "Anatomy",
  "preview.media": "Media",
  "preview.states": "States",
  "preview.interactive": "Interactive",
  "preview.disabled": "Disabled",
  "preview.actions": "Actions",
  "preview.start": "Start",
  "preview.end": "End",
  "preview.cardTitle": "Aurora project",
  "preview.cardSubtitle": "Updated just now",
  "preview.cardInfo": "More info about this card subject.",
  "preview.cardInfoAria": "More info",
  "preview.cardBody":
    "A subject card with shared anatomy. Use the inspector to tune Card-related tokens — sandbox chrome updates from the same variables. Shape / radius lives under Globals.",
  "preview.dismiss": "Dismiss",
  "preview.open": "Open",
  "preview.cardActivated": "{variant} card activated",
  "preview.collapsibleOpen": "Open",
  "preview.collapsibleActions": "Header actions",
  "preview.collapsibleLabel": "disclosure",
  "preview.collapsibleTitle": "Presets",
  "preview.collapsibleBody":
    "One-shot disclosure: pass title and children. Chevron, head, and body chrome are built in — do not assemble them by hand.",
  "preview.collapsibleActionTip": "Example header action (outside the toggle)",
  "preview.collapsibleActionAria": "Example header action",
  "preview.collapsibleActionToast": "Header action clicked",

  "agent.hint": 'Try: "make corners rounder" or "softer hover"',
  "agent.promptAria": "Agent prompt",
  "agent.triggerAria": "Agent proposals",
  "agent.tipIdle": "Natural-language token proposals (local heuristics)",
  "agent.tipPending": "{count} proposal(s) awaiting confirmation",
  "agent.propose": "Propose",
  "agent.dismiss": "Dismiss",
  "agent.confirm": "Confirm apply",
  "agent.help":
    "Agent proposals require confirmation before they change tokens. Model backend is not wired yet — local heuristics only.",
  "agent.toastNone":
    "No structured proposals yet — refine the request or wait for a model backend.",
  "agent.toastReady": "{count} proposal(s) ready — confirm to apply.",
  "agent.toastApplied": "Agent proposals applied",

  "apply.button": "Apply changes",
  "apply.preparing": "Preparing diff…",
  "apply.tip": "Review per-file diffs, then write tokens.ts and regenerate theme.css",
  "apply.dialogTitle": "Review apply changes",
  "apply.dialogDesc":
    "{applied} token(s) will write across {files} file(s). Confirm to apply.",
  "apply.dialogDescSkipped":
    "{applied} token(s) will write; {skipped} skipped. Confirm to update the files below.",
  "apply.noDiffs": "No file diffs.",
  "apply.changed": "changed",
  "apply.unchanged": "unchanged",
  "apply.noTextual": "No textual changes.",
  "apply.cancel": "Cancel",
  "apply.confirm": "Apply",
  "apply.applying": "Applying…",
  "apply.toastPreviewFailed": "Preview failed",
  "apply.toastApplyFailed": "Apply failed",
  "apply.toastPartial": "Applied {applied} token(s); skipped {skipped}",
  "apply.toastOk": "Applied {applied} token(s) to tokens.ts",

  "inspector.propertyTitle": "Property inspector",
  "inspector.globalTitle": "Global properties",
  "inspector.overrides": "{count} override{plural}",
  "inspector.overridesAria": "What overrides means",
  "inspector.overridesHint":
    "Count of draft CSS variables versus baseline (--fynns-* and sandbox chrome). Reset clears them; Apply changes writes only --fynns-* into tokens.ts.",
  "inspector.applyPreset": "Apply preset",
  "inspector.loadedPreset": "Loaded preset: {label}",
  "inspector.color": "Color",
  "inspector.colorHelp":
    "Preset chips stay inline; open the rainbow chip for the full hue ring. Surfaces stay on the committed ladder — only the accent family shifts.",
  "inspector.brightness": "Brightness",
  "inspector.brightnessHint":
    "Shift this surface’s hex brightness relative to the tokens.ts baseline (does not change hue).",
  "inspector.surface1": "Elevated (surface-1)",
  "inspector.surface1Hint":
    "Elevation 1 panel surface — resting fill for elevated Card and sidebar chrome.",
  "inspector.surface4": "Filled (surface-4)",
  "inspector.surface4Hint":
    "Elevation 4 filled surface — filled Card and dragged / emphasis fills.",
  "inspector.appBg": "Outlined (app-bg)",
  "inspector.appBgHint":
    "App background — outlined Card sits on this; lowest rung of the elevation ladder.",
  "inspector.outlineBorder": "Outline border (border-strong)",
  "inspector.outlineBorderAria": "About outline border",
  "inspector.outlineBorderHint":
    "--fynns-color-border-strong — stroke for outlined Card and strong borders.",
  "inspector.outlineBorderBrightness": "Outline border brightness",
  "inspector.outlineHelp": "Used by outlined cards as the stroke color.",
  "inspector.stateLayers": "State layers",
  "inspector.stateHoverHint":
    "--fynns-state-hover opacity for pointer-hover overlays (color-mix on interactive surfaces).",
  "inspector.stateFocusHint":
    "--fynns-state-focus opacity for keyboard / focus-visible overlays.",
  "inspector.statePressedHint":
    "--fynns-state-pressed opacity while the control is actively pressed.",
  "inspector.stateDraggedHint":
    "--fynns-state-dragged opacity for drag / high-emphasis interactive overlays.",
  "inspector.stateDemoTitle": "State demo",
  "inspector.stateDemoSubtitle": "Hover / press me",
  "inspector.stateDemoBody": "Live overlay uses the opacities above.",
  "inspector.spacing": "Spacing",
  "inspector.spacingHelp":
    "Card anatomy — `--fynns-space-*` used by Card content / header / actions (Apply writeback).",
  "inspector.spaceLg": "Content (space-lg)",
  "inspector.spaceLgHint":
    "--fynns-space-lg — Card content padding and related roomy content gaps.",
  "inspector.spaceMd": "Header (space-md)",
  "inspector.spaceMdHint": "--fynns-space-md — Card header spacing and mid-density gaps.",
  "inspector.spaceSm": "Actions gap (space-sm)",
  "inspector.spaceSmHint":
    "--fynns-space-sm — Card actions row gap and compact control spacing.",
  "inspector.blockGapHelp":
    "Inspector blocks — gap between adjacent chrome blocks in every inspector stack (`--sandbox-block-gap`, sandbox-only; not written by Apply changes).",
  "inspector.blockGap": "Block gap",
  "inspector.blockGapAria": "About block gap",
  "inspector.blockGapHint":
    "--sandbox-block-gap — uniform gap between adjacent blocks in inspector stacks (sandbox chrome; not Apply writeback).",
  "inspector.blockGapSlider": "Inspector block gap",
  "inspector.typography": "Typography",
  "inspector.fontSmHint":
    "--fynns-font-size-sm — compact UI copy (captions, dense labels).",
  "inspector.fontMdHint": "--fynns-font-size-md — default body / control text size.",
  "inspector.fontLgHint":
    "--fynns-font-size-lg — emphasized titles and larger chrome text.",

  "globals.lead":
    "Shape tokens (`--fynns-radius-*`) apply across the UI core. Tune the ladder in the inspector — every sample below updates from the same draft.",
  "globals.controls": "Controls",
  "globals.controlsAria": "Controls",
  "globals.btnSmall": "Small",
  "globals.btnDefault": "Default",
  "globals.btnPrimary": "Primary",
  "globals.btnGhost": "Ghost",
  "globals.inputPlaceholder": "Input",
  "globals.inputAria": "Sample input",
  "globals.selectAria": "Sample select",
  "globals.badgeNeutral": "Neutral",
  "globals.badgeAccent": "Accent",
  "globals.badgeSuccess": "Success",
  "globals.surfaces": "Surfaces",
  "globals.surfacesAria": "Surfaces",
  "globals.cardSubtitle": "Shared radius-md",
  "globals.cardBody": "Container shape follows the global ladder.",
  "globals.collapsible": "Collapsible sample",
  "globals.collapsibleHelp": "Headers and panels also consume radius tokens.",
  "globals.swatches": "Ladder swatches",
  "globals.swatchesAria": "Radius swatches",

  "globalsInspector.shapePresets": "Shape presets",
  "globalsInspector.shapePresetAria": "Shape preset",
  "globalsInspector.applyPresetTip":
    "Replace the entire draft with this preset's overrides (clears other knobs)",
  "globalsInspector.applyPresetNote":
    "Apply preset replaces the whole draft. Align M3 / Reset ladder only touch radius.",
  "globalsInspector.shapeLadder": "Shape ladder",
  "globalsInspector.shapeLadderHelp":
    "Writes `--fynns-radius-*` used by every primitive (Button, Input, Card, flyouts, …) — not Card-only.",
  "globalsInspector.radiusXsHint":
    "Smallest ladder step (M3 XS ≈ 4dp). Finest corners; keep below sm in the scale.",
  "globalsInspector.radiusSmHint":
    "Compact controls: Button, SplitButton, ToggleGroup, Badge, PickList, toast action chips.",
  "globalsInspector.radiusMdHint":
    "Default surface radius: Input, Select, Card, PanelCard, Popover, Tooltip, Tabs, Collapsible, list rows, Alert/Toast.",
  "globalsInspector.radiusLgHint":
    "Larger chrome: DropdownMenu / SplitButton menus, Dialog and Drawer panels.",
  "globalsInspector.radiusXlHint":
    "Largest ladder step (M3 XL band). Soft / emphasis shells; keep above lg in the scale.",
  "globalsInspector.specialReadonly": "Special (read-only)",
  "globalsInspector.radiusNoneHint":
    "Sharp corners (0). Flush edges when a control must meet a hard boundary.",
  "globalsInspector.radiusPillHint":
    "Capsule (999px): Switch track, SearchInput, fully rounded chips.",
  "globalsInspector.radiusRoundHint":
    "Circle (50%): Switch thumb and other circular affordances.",
  "globalsInspector.resetLadder": "Reset ladder",
  "globalsInspector.resetLadderTip":
    "Restore radius xs–xl to baseline; leaves color and other overrides",
  "globalsInspector.alignM3": "Align M3 ladder",
  "globalsInspector.alignM3Tip":
    "Apply the M3-aligned radius values (xs–xl only; other overrides stay)",
  "globalsInspector.toastReset": "Shape ladder reset to baseline",
  "globalsInspector.toastAlign": "Aligned to M3 radius ladder",

  "preset.m3Aligned": "M3-aligned radius",
  "preset.m3AlignedDesc": "Push radius-md toward M3 medium (12px) and expand the shape ladder.",
  "preset.restrained": "Restrained radius",
  "preset.restrainedDesc": "Slightly tighter corners than current baseline.",

  "hue.presetsAria": "Hue presets",
  "hue.openPalette": "Open hue palette",
  "hue.paletteAria": "Accent hue palette",
  "hue.degrees": "{n} degrees",
  "hue.slider": "Accent hue",
  "hue.degreeField": "Hue degrees",
  "hue.hexField": "Accent hex",
  "hue.violet": "Violet",
  "hue.teal": "Teal",
  "hue.amber": "Amber",
  "hue.rose": "Rose",
  "hue.blue": "Blue",

  "foundations.elevation": "Elevation (surface ladder)",
  "foundations.accent": "Accent palette",
  "foundations.semantic": "Semantic colors",
  "foundations.spacing": "Spacing scale (t-shirt)",
  "foundations.type": "Type scale",
  "foundations.radiusShadow": "Radius & shadow",

  "motion.easing": "Easing curves",
  "motion.replay": "Replay",
  "motion.flyout": "Flyout & overlay motion",
  "motion.flyoutHelp":
    "Open a dialog, select, split-button menu, or tooltip in the Components section to preview enter animations.",

  "hue.cyan": "Cyan",
} as const;

const zh: Record<MessageKey, string> = {
  "brand.name": "fynns 沙盒",

  "nav.aria": "沙盒页面",
  "nav.playground": "表面",
  "nav.globals": "全局",
  "nav.foundations": "基础",
  "nav.motion": "动效",
  "nav.templates": "模板",
  "nav.templatesTip": "模板与配置导入导出",
  "nav.templatesAria": "模板与配置",

  "topbar.undo": "撤销",
  "topbar.undoTip": "撤销 (Ctrl+Z)",
  "topbar.redo": "重做",
  "topbar.redoTip": "重做 (Ctrl+Y)",
  "topbar.reset": "重置",
  "topbar.resetAria": "重置草稿覆盖",
  "topbar.resetTip": "清除草稿中的全部 token 覆盖（色相、圆角、海拔等）",
  "topbar.resetToast": "草稿已重置",
  "topbar.themeLight": "浅色主题",
  "topbar.themeDark": "深色主题",
  "topbar.themeToLight": "切换到浅色主题",
  "topbar.themeToDark": "切换到深色主题",

  "playground.targetCard": "Card",
  "playground.targetCollapsible": "Collapsible",

  "settings.languageTitle": "语言",
  "settings.languageLead": "在英语与中文之间切换沙盒界面。选择会保存在本浏览器中。",
  "settings.languageAria": "界面语言",
  "settings.languageEn": "English",
  "settings.languageZh": "中文",

  "templates.lead":
    "以 JSON 导出或导入完整沙盒配置（token 覆盖 + 主题）。可将同一份配置保存为命名模板以便复用。",
  "templates.export": "导出 JSON",
  "templates.exportTip": "下载当前覆盖项与主题为 JSON",
  "templates.import": "导入 JSON",
  "templates.importTip": "导入此前导出的配置 JSON",
  "templates.importAria": "导入配置 JSON",
  "templates.saveAs": "另存为模板",
  "templates.saveAsTip": "将当前完整配置保存为模板",
  "templates.currentDraft": "当前草稿：{count} 项覆盖{plural} · 主题 {theme}",
  "templates.savedTitle": "已存模板",
  "templates.savedAria": "已存模板",
  "templates.empty": "尚无模板。先在表面 / 全局调整 token，再另存为模板。",
  "templates.cardMeta": "{count} 项覆盖{plural} · {theme} · {when}",
  "templates.apply": "应用",
  "templates.exportOneTip": "下载此模板为 JSON",
  "templates.exportOneAria": "导出 {name}",
  "templates.rename": "重命名",
  "templates.deleteTip": "删除模板",
  "templates.deleteAria": "删除 {name}",
  "templates.saveDialogTitle": "另存为模板",
  "templates.saveDialogDesc": "将当前覆盖项与主题存入本浏览器（JSON 形状与导出相同）。",
  "templates.name": "名称",
  "templates.nameAria": "模板名称",
  "templates.namePlaceholder": "例如：琥珀色强调实验",
  "templates.description": "描述（可选）",
  "templates.descriptionAria": "模板描述",
  "templates.cancel": "取消",
  "templates.saveTemplate": "保存模板",
  "templates.renameTitle": "重命名模板",
  "templates.save": "保存",
  "templates.toastDownloaded": "配置 JSON 已下载",
  "templates.toastNameRequired": "请填写模板名称",
  "templates.toastSaved": "模板「{name}」已保存",
  "templates.toastExported": "已导出「{name}」",
  "templates.toastDeleted": "已删除「{name}」",
  "templates.toastRenamed": "模板已重命名",
  "templates.toastNotFound": "未找到模板",
  "templates.toastLoaded": "已加载 {label}（{count} 项覆盖{plural}，{theme}）",

  "preview.anatomy": "结构",
  "preview.media": "媒体",
  "preview.states": "状态",
  "preview.interactive": "可交互",
  "preview.disabled": "禁用",
  "preview.actions": "操作区",
  "preview.start": "靠左",
  "preview.end": "靠右",
  "preview.cardTitle": "Aurora 项目",
  "preview.cardSubtitle": "刚刚更新",
  "preview.cardInfo": "关于此卡片主题的更多信息。",
  "preview.cardInfoAria": "更多信息",
  "preview.cardBody":
    "带共享结构的主题卡片。用检查器调节 Card 相关 token —— 沙盒界面会同步更新。形状 / 圆角在「全局」页。",
  "preview.dismiss": "关闭",
  "preview.open": "打开",
  "preview.cardActivated": "已激活 {variant} 卡片",
  "preview.collapsibleOpen": "展开",
  "preview.collapsibleActions": "标题操作",
  "preview.collapsibleLabel": "disclosure",
  "preview.collapsibleTitle": "预设",
  "preview.collapsibleBody":
    "一站式折叠区：传入 title 与 children 即可。Chevron、标题行与内容壳已内置，无需手拼。",
  "preview.collapsibleActionTip": "示例标题操作（在折叠触发器外）",
  "preview.collapsibleActionAria": "示例标题操作",
  "preview.collapsibleActionToast": "已点击标题操作",

  "agent.hint": "试试：「圆角更大」或「更柔和的悬停」",
  "agent.promptAria": "智能体提示",
  "agent.triggerAria": "智能体提案",
  "agent.tipIdle": "自然语言 token 提案（本地启发式）",
  "agent.tipPending": "{count} 条提案等待确认",
  "agent.propose": "生成提案",
  "agent.dismiss": "丢弃",
  "agent.confirm": "确认应用",
  "agent.help":
    "智能体提案需确认后才会改动 token。模型后端尚未接入 —— 目前仅为本地启发式。",
  "agent.toastNone": "尚无结构化提案 —— 请细化请求，或等待模型后端。",
  "agent.toastReady": "{count} 条提案就绪 —— 确认后应用。",
  "agent.toastApplied": "智能体提案已应用",

  "apply.button": "应用更改",
  "apply.preparing": "正在准备差异…",
  "apply.tip": "审阅各文件差异，然后写入 tokens.ts 并重新生成 theme.css",
  "apply.dialogTitle": "审阅应用更改",
  "apply.dialogDesc": "将写入 {applied} 个 token，涉及 {files} 个文件。确认后应用。",
  "apply.dialogDescSkipped":
    "将写入 {applied} 个 token；跳过 {skipped} 个。确认后更新下列文件。",
  "apply.noDiffs": "无文件差异。",
  "apply.changed": "已更改",
  "apply.unchanged": "未更改",
  "apply.noTextual": "无文本变更。",
  "apply.cancel": "取消",
  "apply.confirm": "应用",
  "apply.applying": "正在应用…",
  "apply.toastPreviewFailed": "预览失败",
  "apply.toastApplyFailed": "应用失败",
  "apply.toastPartial": "已应用 {applied} 个 token；跳过 {skipped} 个",
  "apply.toastOk": "已将 {applied} 个 token 写入 tokens.ts",

  "inspector.propertyTitle": "属性检查器",
  "inspector.globalTitle": "全局属性",
  "inspector.overrides": "{count} 项覆盖{plural}",
  "inspector.overridesAria": "覆盖项含义",
  "inspector.overridesHint":
    "草稿 CSS 变量相对基线的数量（--fynns-* 与沙盒界面）。重置会清空；「应用更改」仅将 --fynns-* 写入 tokens.ts。",
  "inspector.applyPreset": "应用预设",
  "inspector.loadedPreset": "已加载预设：{label}",
  "inspector.color": "颜色",
  "inspector.colorHelp":
    "预设色块保持内联；打开彩虹色块可使用完整色相环。表面留在已提交的阶梯上 —— 仅强调色族会偏移。",
  "inspector.brightness": "亮度",
  "inspector.brightnessHint":
    "相对 tokens.ts 基线偏移该表面的十六进制亮度（不改变色相）。",
  "inspector.surface1": "抬升 (surface-1)",
  "inspector.surface1Hint": "海拔 1 面板表面 —— elevated Card 与侧栏的静止填充。",
  "inspector.surface4": "填充 (surface-4)",
  "inspector.surface4Hint": "海拔 4 填充表面 —— filled Card 与拖拽 / 强调填充。",
  "inspector.appBg": "描边 (app-bg)",
  "inspector.appBgHint": "应用背景 —— outlined Card 落在其上；海拔阶梯最低档。",
  "inspector.outlineBorder": "描边边框 (border-strong)",
  "inspector.outlineBorderAria": "关于描边边框",
  "inspector.outlineBorderHint":
    "--fynns-color-border-strong — outlined Card 与强边框的描边色。",
  "inspector.outlineBorderBrightness": "描边边框亮度",
  "inspector.outlineHelp": "outlined 卡片用作描边颜色。",
  "inspector.stateLayers": "状态层",
  "inspector.stateHoverHint":
    "--fynns-state-hover 不透明度，用于指针悬停叠加（在可交互表面上 color-mix）。",
  "inspector.stateFocusHint":
    "--fynns-state-focus 不透明度，用于键盘 / focus-visible 叠加。",
  "inspector.statePressedHint":
    "--fynns-state-pressed 不透明度，控件处于按下状态时。",
  "inspector.stateDraggedHint":
    "--fynns-state-dragged 不透明度，用于拖拽 / 高强调交互叠加。",
  "inspector.stateDemoTitle": "状态演示",
  "inspector.stateDemoSubtitle": "悬停 / 按压我",
  "inspector.stateDemoBody": "实时叠加使用上方不透明度。",
  "inspector.spacing": "间距",
  "inspector.spacingHelp":
    "Card 结构 —— Card 内容 / 页眉 / 操作区使用的 `--fynns-space-*`（可应用写回）。",
  "inspector.spaceLg": "内容 (space-lg)",
  "inspector.spaceLgHint":
    "--fynns-space-lg — Card 内容内边距及相关宽松内容间距。",
  "inspector.spaceMd": "页眉 (space-md)",
  "inspector.spaceMdHint": "--fynns-space-md — Card 页眉间距与中密度间隙。",
  "inspector.spaceSm": "操作间距 (space-sm)",
  "inspector.spaceSmHint":
    "--fynns-space-sm — Card 操作行间隙与紧凑控件间距。",
  "inspector.blockGapHelp":
    "检查器区块 —— 各检查器堆栈中相邻界面块之间的间隙（`--sandbox-block-gap`，仅沙盒；不由「应用更改」写入）。",
  "inspector.blockGap": "区块间隙",
  "inspector.blockGapAria": "关于区块间隙",
  "inspector.blockGapHint":
    "--sandbox-block-gap — 检查器堆栈中相邻块的统一间隙（沙盒界面；不写回）。",
  "inspector.blockGapSlider": "检查器区块间隙",
  "inspector.typography": "字体",
  "inspector.fontSmHint":
    "--fynns-font-size-sm — 紧凑界面文案（说明、密集标签）。",
  "inspector.fontMdHint": "--fynns-font-size-md — 默认正文 / 控件字号。",
  "inspector.fontLgHint":
    "--fynns-font-size-lg — 强调标题与较大界面文字。",

  "globals.lead":
    "形状 token（`--fynns-radius-*`）作用于整个 UI 核心。在检查器中调节阶梯 —— 下方每个样例都会随同一草稿更新。",
  "globals.controls": "控件",
  "globals.controlsAria": "控件",
  "globals.btnSmall": "小号",
  "globals.btnDefault": "默认",
  "globals.btnPrimary": "主要",
  "globals.btnGhost": "幽灵",
  "globals.inputPlaceholder": "输入框",
  "globals.inputAria": "示例输入",
  "globals.selectAria": "示例选择",
  "globals.badgeNeutral": "中性",
  "globals.badgeAccent": "强调",
  "globals.badgeSuccess": "成功",
  "globals.surfaces": "表面",
  "globals.surfacesAria": "表面",
  "globals.cardSubtitle": "共享 radius-md",
  "globals.cardBody": "容器形状跟随全局阶梯。",
  "globals.collapsible": "可折叠示例",
  "globals.collapsibleHelp": "页眉与面板也会消费圆角 token。",
  "globals.swatches": "阶梯色块",
  "globals.swatchesAria": "圆角色块",

  "globalsInspector.shapePresets": "形状预设",
  "globalsInspector.shapePresetAria": "形状预设",
  "globalsInspector.applyPresetTip":
    "用此预设的覆盖项替换整个草稿（清除其他旋钮）",
  "globalsInspector.applyPresetNote":
    "「应用预设」会替换整个草稿。对齐 M3 / 重置阶梯仅影响圆角。",
  "globalsInspector.shapeLadder": "形状阶梯",
  "globalsInspector.shapeLadderHelp":
    "写入每个原语使用的 `--fynns-radius-*`（Button、Input、Card、浮层等）—— 非仅 Card。",
  "globalsInspector.radiusXsHint":
    "最小阶梯档（M3 XS ≈ 4dp）。最细圆角；在尺度上保持小于 sm。",
  "globalsInspector.radiusSmHint":
    "紧凑控件：Button、SplitButton、ToggleGroup、Badge、PickList、toast 操作芯片。",
  "globalsInspector.radiusMdHint":
    "默认表面圆角：Input、Select、Card、PanelCard、Popover、Tooltip、Tabs、Collapsible、列表行、Alert/Toast。",
  "globalsInspector.radiusLgHint":
    "较大界面：DropdownMenu / SplitButton 菜单、Dialog 与 Drawer 面板。",
  "globalsInspector.radiusXlHint":
    "最大阶梯档（M3 XL 带）。柔和 / 强调外壳；在尺度上保持大于 lg。",
  "globalsInspector.specialReadonly": "特殊（只读）",
  "globalsInspector.radiusNoneHint":
    "直角 (0)。控件需贴齐硬边界时使用。",
  "globalsInspector.radiusPillHint":
    "胶囊 (999px)：Switch 轨道、SearchInput、全圆角芯片。",
  "globalsInspector.radiusRoundHint":
    "圆形 (50%)：Switch 拇指与其他圆形控件。",
  "globalsInspector.resetLadder": "重置阶梯",
  "globalsInspector.resetLadderTip":
    "将 radius xs–xl 恢复为基线；保留颜色与其他覆盖",
  "globalsInspector.alignM3": "对齐 M3 阶梯",
  "globalsInspector.alignM3Tip":
    "应用 M3 对齐的圆角值（仅 xs–xl；其他覆盖保留）",
  "globalsInspector.toastReset": "形状阶梯已重置为基线",
  "globalsInspector.toastAlign": "已对齐到 M3 圆角阶梯",

  "preset.m3Aligned": "M3 对齐圆角",
  "preset.m3AlignedDesc": "将 radius-md 推向 M3 medium (12px) 并扩展形状阶梯。",
  "preset.restrained": "克制圆角",
  "preset.restrainedDesc": "比当前基线略紧的圆角。",

  "hue.presetsAria": "色相预设",
  "hue.openPalette": "打开色相盘",
  "hue.paletteAria": "强调色色相盘",
  "hue.degrees": "{n} 度",
  "hue.slider": "强调色色相",
  "hue.degreeField": "色相角度",
  "hue.hexField": "强调色十六进制",
  "hue.violet": "紫罗兰",
  "hue.teal": "青绿",
  "hue.amber": "琥珀",
  "hue.rose": "玫红",
  "hue.blue": "蓝色",

  "foundations.elevation": "海拔（表面阶梯）",
  "foundations.accent": "强调色板",
  "foundations.semantic": "语义色",
  "foundations.spacing": "间距尺度（尺码）",
  "foundations.type": "字号尺度",
  "foundations.radiusShadow": "圆角与阴影",

  "motion.easing": "缓动曲线",
  "motion.replay": "重放",
  "motion.flyout": "浮层与遮罩动效",
  "motion.flyoutHelp":
    "在组件区打开对话框、选择框、拆分按钮菜单或工具提示，以预览进入动画。",

  "hue.cyan": "青色",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en: en as Record<MessageKey, string>,
  zh,
};

export type TranslateFn = (
  key: MessageKey,
  params?: Record<string, string | number>,
) => string;

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  let text = messages[locale][key] ?? messages.en[key] ?? String(key);
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** English plural suffix helper: empty when count === 1, else `"s"`. */
export function pluralS(count: number): string {
  return count === 1 ? "" : "s";
}

/** Chinese often omits plural marking; keep empty for zh-friendly templates. */
export function pluralSuffix(locale: Locale, count: number): string {
  if (locale === "zh") return "";
  return pluralS(count);
}
