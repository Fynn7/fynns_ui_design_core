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
  "topbar.resetTip": "Clear all token changes in the draft (hue, radius, …)",
  "topbar.resetToast": "Draft reset",
  "topbar.themeLight": "Light theme",
  "topbar.themeDark": "Dark theme",
  "topbar.themeToLight": "Switch to light theme",
  "topbar.themeToDark": "Switch to dark theme",
  "topbar.hideAside": "Hide inspector",
  "topbar.showAside": "Show inspector",

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

  "preview.anatomy": "Contents",
  "preview.media": "Image",
  "preview.states": "Behavior",
  "preview.interactive": "Clickable",
  "preview.disabled": "Disabled",
  "preview.actions": "Footer buttons",
  "preview.start": "Left",
  "preview.end": "Right",
  "preview.cardTitle": "Aurora project",
  "preview.cardSubtitle": "Updated just now",
  "preview.cardInfo": "More about this card.",
  "preview.cardInfoAria": "More info",
  "preview.cardBody":
    "Sample card. Use the inspector on the right to tweak colors and spacing — this preview updates live. Corner rounding is on the Globals page.",
  "preview.dismiss": "Dismiss",
  "preview.open": "Open",
  "preview.cardActivated": "{variant} card activated",
  "preview.collapsibleOpen": "Expanded",
  "preview.collapsibleActions": "Extra header button",
  "preview.collapsibleLabel": "Sample",
  "preview.collapsibleTitle": "Section title",
  "preview.collapsibleBody":
    "Fold/unfold section: pass a title and body content. The chevron and header are built in — no need to assemble them yourself.",
  "preview.collapsibleActionTip": "Sample button in the header (does not fold the section)",
  "preview.collapsibleActionAria": "Sample header button",
  "preview.collapsibleActionToast": "Header button clicked",

  "agent.hint": 'Try: "make corners rounder" or "softer hover"',
  "agent.promptAria": "Agent prompt",
  "agent.triggerAria": "Agent proposals",
  "agent.tipIdle": "Suggest token changes in plain language (local rules for now)",
  "agent.tipPending": "{count} proposal(s) awaiting confirmation",
  "agent.propose": "Propose",
  "agent.dismiss": "Dismiss",
  "agent.confirm": "Confirm apply",
  "agent.help":
    "Proposals only change tokens after you confirm. No model is wired yet — suggestions come from simple local rules.",
  "agent.toastNone":
    "No proposals matched — try a clearer request, or wait until a model backend is connected.",
  "agent.toastReady": "{count} proposal(s) ready — confirm to apply.",
  "agent.toastApplied": "Proposals applied",

  "apply.button": "Apply changes",
  "apply.preparing": "Preparing diff…",
  "apply.tip": "Review file diffs, then write tokens.ts and regenerate theme.css",
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

  "inspector.propertyTitle": "Inspector",
  "inspector.globalTitle": "Global properties",
  "inspector.overrides": "{count} override{plural}",
  "inspector.overridesAria": "What overrides means",
  "inspector.overridesHint":
    "How many draft values differ from the baseline. Reset clears them; Apply changes writes only --fynns-* into tokens.ts.",
  "inspector.color": "Color",
  "inspector.colorHelp":
    "Tap a color chip for a quick accent; open the rainbow chip for the full hue wheel. Card surface fills stay on the surface levels — only the accent family shifts.",
  "inspector.brightness": "Brightness",
  "inspector.brightnessOf": "{name} brightness",
  "inspector.brightnessHint":
    "Lighten or darken this fill relative to the tokens.ts baseline (hue stays the same).",
  "inspector.surface1": "Elevated card",
  "inspector.surface1Hint":
    "Fill for elevated cards and sidebar panels (surface-1).",
  "inspector.surface4": "Filled card",
  "inspector.surface4Hint":
    "Fill for filled cards and strong emphasis (surface-4).",
  "inspector.appBg": "Page background (app-bg)",
  "inspector.appBgHint":
    "App background (app-bg). Outlined cards sit on this lowest surface.",
  "inspector.outlineBorder": "Outlined card border",
  "inspector.outlineBorderAria": "About outlined card border",
  "inspector.outlineBorderHint":
    "Stroke color for outlined cards and strong borders (border-strong).",
  "inspector.outlineBorderBrightness": "Outlined card border brightness",
  "inspector.outlineHelp": "Stroke color used by outlined cards.",
  "inspector.stateLayers": "Hover overlays",
  "inspector.stateHoverHint":
    "How strong the hover tint is (state-hover).",
  "inspector.stateFocusHint":
    "How strong the keyboard-focus tint is (state-focus).",
  "inspector.statePressedHint":
    "How strong the pressed tint is (state-pressed).",
  "inspector.stateDraggedHint":
    "How strong the drag / high-emphasis tint is (state-dragged).",
  "inspector.stateDemoTitle": "Try hover / press",
  "inspector.stateDemoSubtitle": "Interactive sample",
  "inspector.stateDemoBody": "Overlay strength follows the sliders above.",
  "inspector.spacing": "Spacing",
  "inspector.spacingHelp":
    "Padding and gaps inside cards (--fynns-space-*). Apply changes can write these back.",
  "inspector.spaceLg": "Body padding",
  "inspector.spaceLgHint":
    "Padding inside the card body (space-lg).",
  "inspector.spaceMd": "Title row spacing",
  "inspector.spaceMdHint": "Spacing in the card title row (space-md).",
  "inspector.spaceSm": "Footer button gap",
  "inspector.spaceSmHint":
    "Gap between footer buttons (space-sm).",
  "inspector.blockGapHelp":
    "Gap between sections in this inspector only (--sandbox-block-gap). Not written by Apply changes.",
  "inspector.blockGap": "Section gap",
  "inspector.blockGapAria": "About section gap",
  "inspector.blockGapHint":
    "Uniform gap between inspector sections (sandbox-only; not Apply writeback).",
  "inspector.blockGapSlider": "Inspector section gap",
  "inspector.typography": "Type size",
  "inspector.fontSmHint":
    "Small UI text (font-size-sm).",
  "inspector.fontMdHint": "Default body / control text (font-size-md).",
  "inspector.fontLgHint":
    "Larger titles and chrome text (font-size-lg).",

  "globals.lead":
    "Corner radius is a named set of levels (xs→xl), plus special shapes (pill / round). Cards and inputs on this page use md; buttons use sm; the switch track uses pill.",
  "globals.controls": "Controls",
  "globals.controlsAria": "Controls",
  "globals.controlsRadiusHelp":
    "Buttons / badges → radius-sm. Input / Select → radius-md. Switch track → radius-pill (not on the xs–xl levels).",
  "globals.btnSmall": "Small",
  "globals.btnDefault": "Default",
  "globals.btnPrimary": "Primary",
  "globals.btnGhost": "Subtle",
  "globals.inputPlaceholder": "Input",
  "globals.inputAria": "Sample input",
  "globals.selectAria": "Sample select",
  "globals.badgeNeutral": "Neutral",
  "globals.badgeAccent": "Accent",
  "globals.badgeSuccess": "Success",
  "globals.switchPill": "Switch",
  "globals.checkbox": "Checkbox",
  "globals.checkboxMixed": "Indeterminate",
  "globals.radioA": "Option A",
  "globals.radioB": "Option B",
  "globals.chipsAria": "Sample chips",
  "globals.chipAssist": "Assist",
  "globals.chipFilter": "Filter",
  "globals.chipElevated": "Elevated",
  "globals.chipRemove": "Remove chip",
  "globals.dividerFull": "Divider (full)",
  "globals.dividerInset": "Divider (inset)",
  "globals.dividerVerticalA": "A",
  "globals.dividerVerticalB": "B",
  "globals.surfaces": "Cards & sections",
  "globals.surfacesAria": "Cards and sections",
  "globals.cardSubtitle": "Uses radius-md",
  "globals.cardBody": "Card corners follow radius-md on the global levels.",
  "globals.collapsible": "Fold section sample",
  "globals.collapsibleHelp": "Collapsible headers also use radius-md.",
  "globals.swatches": "Radius levels (who uses what)",
  "globals.swatchesAria": "Radius levels",
  "globals.swatchesHelp":
    "Each box is one token step. This page’s cards use md — not xs or xl.",
  "globals.swatchXsUses": "finest chips",
  "globals.swatchSmUses": "buttons, badges",
  "globals.swatchMdUses": "cards, inputs",
  "globals.swatchLgUses": "menus, dialogs",
  "globals.swatchXlUses": "soft shells",
  "globals.swatchesSpecialHelp":
    "Special (not in this row): pill = switch track / search field; round = switch thumb; none = sharp.",

  "globalsInspector.shapeLadder": "Levels",
  "globalsInspector.shapeLadderHelp":
    "Each step maps to different components. Cards / inputs = md; buttons = sm; switch capsule = pill (read-only below). Save named bundles via Templates JSON export — no built-in radius presets.",
  "globalsInspector.radiusXsUses": "Finest chips",
  "globalsInspector.radiusSmUses": "Buttons, badges, toggle chips",
  "globalsInspector.radiusMdUses": "Cards, inputs, panels (this page)",
  "globalsInspector.radiusLgUses": "Menus, dialogs, drawers",
  "globalsInspector.radiusXlUses": "Soft / emphasis shells",
  "globalsInspector.radiusXsHint":
    "Smallest level (M3 XS ≈ 4dp). Keep below sm on the scale.",
  "globalsInspector.radiusSmHint":
    "Compact controls: buttons, toggle groups, badges, toast action chips.",
  "globalsInspector.radiusMdHint":
    "Default corners: inputs, selects, cards, panels, popovers, tooltips, tabs, fold sections, list rows, alerts/toasts.",
  "globalsInspector.radiusLgHint":
    "Larger chrome: dropdown menus, dialogs, and drawers.",
  "globalsInspector.radiusXlHint":
    "Largest corners (M3 XL band). Soft / emphasis shells; keep above lg on the scale.",
  "globalsInspector.specialReadonly": "Special shapes (read-only)",
  "globalsInspector.radiusNoneUses": "Sharp corners when needed",
  "globalsInspector.radiusPillUses": "Switch track, search field",
  "globalsInspector.radiusRoundUses": "Switch thumb (circle)",
  "globalsInspector.radiusNoneHint":
    "Sharp corners (0). Use when a control must meet a hard edge.",
  "globalsInspector.radiusPillHint":
    "Pill shape (999px): switch track, search field, fully rounded chips — higher than xl on purpose.",
  "globalsInspector.radiusRoundHint":
    "Circle (50%): switch thumb and other round controls.",
  "globalsInspector.resetLadder": "Reset levels",
  "globalsInspector.resetLadderTip":
    "Restore radius xs–xl to baseline; keep color and other overrides",
  "globalsInspector.toastReset": "Radius levels reset to baseline",

  "hue.presetsAria": "Accent color presets",
  "hue.openPalette": "Open hue wheel",
  "hue.paletteAria": "Accent hue wheel",
  "hue.degrees": "{n}°",
  "hue.slider": "Accent hue",
  "hue.degreeField": "Hue degrees",
  "hue.hexField": "Accent hex",
  "hue.violet": "Violet",
  "hue.teal": "Teal",
  "hue.amber": "Amber",
  "hue.rose": "Rose",
  "hue.blue": "Blue",

  "foundations.elevation": "Surfaces (elevation levels)",
  "foundations.accent": "Accent palette",
  "foundations.semantic": "Status colors",
  "foundations.spacing": "Spacing scale",
  "foundations.type": "Type scale",
  "foundations.radiusShadow": "Radius & shadow",

  "motion.easing": "Easing curves",
  "motion.replay": "Replay",
  "motion.flyout": "Menus & overlays",
  "motion.flyoutHelp":
    "Open a dialog, select, split-button menu, or tooltip elsewhere to preview enter animations.",

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
  "topbar.resetAria": "重置草稿改动",
  "topbar.resetTip": "清除草稿中的全部 token 改动（色相、圆角等）",
  "topbar.resetToast": "草稿已重置",
  "topbar.themeLight": "浅色主题",
  "topbar.themeDark": "深色主题",
  "topbar.themeToLight": "切换到浅色主题",
  "topbar.themeToDark": "切换到深色主题",
  "topbar.hideAside": "隐藏检查器",
  "topbar.showAside": "显示检查器",

  "playground.targetCard": "Card",
  "playground.targetCollapsible": "Collapsible",

  "settings.languageTitle": "语言",
  "settings.languageLead": "在英语与中文之间切换沙盒界面。选择会保存在本浏览器中。",
  "settings.languageAria": "界面语言",
  "settings.languageEn": "English",
  "settings.languageZh": "中文",

  "templates.lead":
    "用 JSON 导出或导入完整沙盒配置（token 改动 + 主题）。也可存成命名模板方便复用。",
  "templates.export": "导出 JSON",
  "templates.exportTip": "下载当前改动与主题为 JSON",
  "templates.import": "导入 JSON",
  "templates.importTip": "导入此前导出的配置 JSON",
  "templates.importAria": "导入配置 JSON",
  "templates.saveAs": "另存为模板",
  "templates.saveAsTip": "将当前完整配置保存为模板",
  "templates.currentDraft": "当前草稿：{count} 项改动{plural} · 主题 {theme}",
  "templates.savedTitle": "已存模板",
  "templates.savedAria": "已存模板",
  "templates.empty": "尚无模板。先在「表面 / 全局」调好，再另存为模板。",
  "templates.cardMeta": "{count} 项改动{plural} · {theme} · {when}",
  "templates.apply": "应用",
  "templates.exportOneTip": "下载此模板为 JSON",
  "templates.exportOneAria": "导出 {name}",
  "templates.rename": "重命名",
  "templates.deleteTip": "删除模板",
  "templates.deleteAria": "删除 {name}",
  "templates.saveDialogTitle": "另存为模板",
  "templates.saveDialogDesc": "将当前改动与主题存入本浏览器（格式与导出相同）。",
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
  "templates.toastLoaded": "已加载 {label}（{count} 项改动{plural}，{theme}）",

  "preview.anatomy": "内容",
  "preview.media": "图片",
  "preview.states": "行为",
  "preview.interactive": "可点击",
  "preview.disabled": "禁用",
  "preview.actions": "底部按钮",
  "preview.start": "靠左",
  "preview.end": "靠右",
  "preview.cardTitle": "Aurora 项目",
  "preview.cardSubtitle": "刚刚更新",
  "preview.cardInfo": "关于这张卡片的更多说明。",
  "preview.cardInfoAria": "更多信息",
  "preview.cardBody":
    "示例卡片。右侧检查器可调颜色与间距，预览会即时更新。圆角请到「全局」页。",
  "preview.dismiss": "关闭",
  "preview.open": "打开",
  "preview.cardActivated": "已激活 {variant} 卡片",
  "preview.collapsibleOpen": "展开",
  "preview.collapsibleActions": "标题旁按钮",
  "preview.collapsibleLabel": "示例",
  "preview.collapsibleTitle": "分区标题",
  "preview.collapsibleBody":
    "可折叠分区：传入标题和正文即可。箭头与标题栏已内置，不必自己拼。",
  "preview.collapsibleActionTip": "标题栏上的示例按钮（不会折叠分区）",
  "preview.collapsibleActionAria": "示例标题按钮",
  "preview.collapsibleActionToast": "已点击标题按钮",

  "agent.hint": "试试：「圆角更大」或「悬停更柔和」",
  "agent.promptAria": "智能体提示",
  "agent.triggerAria": "智能体提案",
  "agent.tipIdle": "用自然语言建议改 token（目前为本地规则）",
  "agent.tipPending": "{count} 条提案等待确认",
  "agent.propose": "生成提案",
  "agent.dismiss": "丢弃",
  "agent.confirm": "确认应用",
  "agent.help":
    "提案需你确认后才会改 token。模型后端尚未接入 —— 目前只靠简单本地规则。",
  "agent.toastNone": "没有匹配到提案 —— 请说得更具体，或等待模型后端接入。",
  "agent.toastReady": "{count} 条提案就绪 —— 确认后应用。",
  "agent.toastApplied": "提案已应用",

  "apply.button": "应用更改",
  "apply.preparing": "正在准备差异…",
  "apply.tip": "先审阅文件差异，再写入 tokens.ts 并重新生成 theme.css",
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

  "inspector.propertyTitle": "检查器",
  "inspector.globalTitle": "全局属性",
  "inspector.overrides": "{count} 项改动{plural}",
  "inspector.overridesAria": "改动项说明",
  "inspector.overridesHint":
    "草稿相对基线改了多少项。重置会清空；「应用更改」只把 --fynns-* 写入 tokens.ts。",
  "inspector.color": "颜色",
  "inspector.colorHelp":
    "点色块可快速换强调色；点彩虹色块打开完整色相环。卡片底色仍走表面等级 —— 只会动强调色族。",
  "inspector.brightness": "亮度",
  "inspector.brightnessOf": "{name} 亮度",
  "inspector.brightnessHint":
    "相对 tokens.ts 基线调亮或调暗（色相不变）。",
  "inspector.surface1": "抬升卡片 (elevated)",
  "inspector.surface1Hint": "elevated 卡片与侧栏面板的底色（surface-1）。",
  "inspector.surface4": "填充卡片 (filled)",
  "inspector.surface4Hint": "filled 卡片与强调区域的底色（surface-4）。",
  "inspector.appBg": "页面背景 (app-bg)",
  "inspector.appBgHint": "应用背景（app-bg）。outlined 卡片落在这层最低表面上。",
  "inspector.outlineBorder": "描边卡片边框 (outlined)",
  "inspector.outlineBorderAria": "关于描边卡片边框",
  "inspector.outlineBorderHint":
    "outlined 卡片与强边框的描边色（border-strong）。",
  "inspector.outlineBorderBrightness": "描边卡片边框 (outlined) 亮度",
  "inspector.outlineHelp": "outlined 卡片使用的边框颜色。",
  "inspector.stateLayers": "悬停叠加",
  "inspector.stateHoverHint": "悬停时叠色有多强（state-hover）。",
  "inspector.stateFocusHint": "键盘聚焦时叠色有多强（state-focus）。",
  "inspector.statePressedHint": "按下时叠色有多强（state-pressed）。",
  "inspector.stateDraggedHint": "拖拽 / 高强调时叠色有多强（state-dragged）。",
  "inspector.stateDemoTitle": "试悬停 / 按压",
  "inspector.stateDemoSubtitle": "可交互示例",
  "inspector.stateDemoBody": "叠色强度跟随上方滑条。",
  "inspector.spacing": "间距",
  "inspector.spacingHelp":
    "卡片内部的内边距与间隙（--fynns-space-*）。「应用更改」可写回源码。",
  "inspector.spaceLg": "正文内边距",
  "inspector.spaceLgHint": "卡片正文区域内边距（space-lg）。",
  "inspector.spaceMd": "标题行间距",
  "inspector.spaceMdHint": "卡片标题行间距（space-md）。",
  "inspector.spaceSm": "底部按钮间隙",
  "inspector.spaceSmHint": "底部按钮之间的间隙（space-sm）。",
  "inspector.blockGapHelp":
    "仅本检查器各分区之间的间距（--sandbox-block-gap）。不会由「应用更改」写入。",
  "inspector.blockGap": "分区间距",
  "inspector.blockGapAria": "关于分区间距",
  "inspector.blockGapHint":
    "检查器各分区之间的统一间距（仅沙盒；不写回）。",
  "inspector.blockGapSlider": "检查器分区间距",
  "inspector.typography": "字号",
  "inspector.fontSmHint": "较小界面文字（font-size-sm）。",
  "inspector.fontMdHint": "默认正文 / 控件字号（font-size-md）。",
  "inspector.fontLgHint": "较大标题与界面文字（font-size-lg）。",

  "globals.lead":
    "圆角是命名等级（xs→xl），另有特殊形（pill / round）。本页卡片与输入框用 md；按钮用 sm；开关轨道用 pill。",
  "globals.controls": "控件",
  "globals.controlsAria": "控件",
  "globals.controlsRadiusHelp":
    "按钮 / 徽章 → radius-sm。输入框 / 选择器 → radius-md。开关轨道 → radius-pill（不在 xs–xl 等级上）。",
  "globals.btnSmall": "小号",
  "globals.btnDefault": "默认",
  "globals.btnPrimary": "主要",
  "globals.btnGhost": "轻量",
  "globals.inputPlaceholder": "输入框",
  "globals.inputAria": "示例输入",
  "globals.selectAria": "示例选择",
  "globals.badgeNeutral": "中性",
  "globals.badgeAccent": "强调",
  "globals.badgeSuccess": "成功",
  "globals.switchPill": "开关",
  "globals.checkbox": "复选框",
  "globals.checkboxMixed": "半选",
  "globals.radioA": "选项甲",
  "globals.radioB": "选项乙",
  "globals.chipsAria": "示例芯片",
  "globals.chipAssist": "辅助",
  "globals.chipFilter": "筛选",
  "globals.chipElevated": "浮起",
  "globals.chipRemove": "移除芯片",
  "globals.dividerFull": "分割线（通栏）",
  "globals.dividerInset": "分割线（缩进）",
  "globals.dividerVerticalA": "甲",
  "globals.dividerVerticalB": "乙",
  "globals.surfaces": "卡片与分区",
  "globals.surfacesAria": "卡片与分区",
  "globals.cardSubtitle": "使用 radius-md",
  "globals.cardBody": "卡片圆角跟随全局等级的 md。",
  "globals.collapsible": "折叠分区示例",
  "globals.collapsibleHelp": "折叠分区标题栏也使用 radius-md。",
  "globals.swatches": "圆角等级（谁用哪档）",
  "globals.swatchesAria": "圆角等级",
  "globals.swatchesHelp":
    "每个色块是一档 token。本页卡片用的是 md —— 不是 xs 或 xl。",
  "globals.swatchXsUses": "最细芯片",
  "globals.swatchSmUses": "按钮、徽章",
  "globals.swatchMdUses": "卡片、输入框",
  "globals.swatchLgUses": "菜单、对话框",
  "globals.swatchXlUses": "柔和外壳",
  "globals.swatchesSpecialHelp":
    "特殊形（不在上排）：pill = 开关轨道 / 搜索框；round = 开关圆钮；none = 直角。",

  "globalsInspector.shapeLadder": "等级",
  "globalsInspector.shapeLadderHelp":
    "每一档对应不同组件。卡片 / 输入 = md；按钮 = sm；开关胶囊 = pill（下方只读）。命名配置请用模板 JSON 导出 —— 无内置圆角预设。",
  "globalsInspector.radiusXsUses": "最细芯片",
  "globalsInspector.radiusSmUses": "按钮、徽章、切换芯片",
  "globalsInspector.radiusMdUses": "卡片、输入框、面板（本页）",
  "globalsInspector.radiusLgUses": "菜单、对话框、抽屉",
  "globalsInspector.radiusXlUses": "柔和 / 强调外壳",
  "globalsInspector.radiusXsHint":
    "最小圆角（M3 XS ≈ 4dp）。在尺度上应小于 sm。",
  "globalsInspector.radiusSmHint":
    "紧凑控件：按钮、切换组、徽章、toast 操作芯片。",
  "globalsInspector.radiusMdHint":
    "默认圆角：输入框、选择器、卡片、面板、气泡、提示、标签页、折叠分区、列表行、提示条。",
  "globalsInspector.radiusLgHint":
    "较大界面：下拉菜单、对话框与抽屉。",
  "globalsInspector.radiusXlHint":
    "最大圆角（M3 XL）。柔和 / 强调外壳；在尺度上应大于 lg。",
  "globalsInspector.specialReadonly": "特殊形（只读）",
  "globalsInspector.radiusNoneUses": "需要直角时",
  "globalsInspector.radiusPillUses": "开关轨道、搜索框",
  "globalsInspector.radiusRoundUses": "开关圆钮（圆形）",
  "globalsInspector.radiusNoneHint":
    "直角 (0)。需要贴齐硬边时使用。",
  "globalsInspector.radiusPillHint":
    "胶囊形 (999px)：开关轨道、搜索框、全圆角芯片 —— 刻意高于 xl。",
  "globalsInspector.radiusRoundHint":
    "圆形 (50%)：开关圆钮与其他圆形控件。",
  "globalsInspector.resetLadder": "重置等级",
  "globalsInspector.resetLadderTip":
    "将 radius xs–xl 恢复为基线；保留颜色与其他改动",
  "globalsInspector.toastReset": "圆角等级已重置为基线",

  "hue.presetsAria": "强调色预设",
  "hue.openPalette": "打开色相环",
  "hue.paletteAria": "强调色色相环",
  "hue.degrees": "{n}°",
  "hue.slider": "强调色色相",
  "hue.degreeField": "色相角度",
  "hue.hexField": "强调色十六进制",
  "hue.violet": "紫罗兰",
  "hue.teal": "青绿",
  "hue.amber": "琥珀",
  "hue.rose": "玫红",
  "hue.blue": "蓝色",

  "foundations.elevation": "表面（海拔等级）",
  "foundations.accent": "强调色板",
  "foundations.semantic": "状态色",
  "foundations.spacing": "间距尺度",
  "foundations.type": "字号尺度",
  "foundations.radiusShadow": "圆角与阴影",

  "motion.easing": "缓动曲线",
  "motion.replay": "重放",
  "motion.flyout": "菜单与浮层",
  "motion.flyoutHelp":
    "在别处打开对话框、选择框、拆分按钮菜单或提示，即可预览进入动画。",

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
