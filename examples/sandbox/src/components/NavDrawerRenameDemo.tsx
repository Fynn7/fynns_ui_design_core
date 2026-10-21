import { useState } from "react";
import {
  FileIcon,
  FolderOpenIcon,
  NavigationDrawer,
  NavigationDrawerGroup,
  NavigationDrawerItem,
} from "@fynns/ui";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";

const copy = {
  en: {
    aria: "Sample destinations",
    title: "Rename destination",
    field: "Name",
    cancel: "Cancel",
    save: "Save",
    notes: "Design notes",
    log: "Meeting log",
    plan: "Q3 plan",
    archive: "Archive",
    help: "Core rename flow: double-click a destination (or focus it and press `F2`) opens the core rename dialog — title, `Name` field, ghost Cancel and one primary Save. `Enter` saves, `Escape` cancels, and the trimmed name comes back through `onRename`. Persistent drawers keep the row mounted, so the gesture completes here; a modal drawer closes on the first click, so keep its context-menu rename.",
  },
  zh: {
    aria: "示例目标",
    title: "重命名目标",
    field: "名称",
    cancel: "取消",
    save: "保存",
    notes: "设计笔记",
    log: "会议记录",
    plan: "第三季度计划",
    archive: "归档",
    help: "core 重命名流程：双击目标（或聚焦后按 `F2`）打开 core 重命名对话框——标题、`名称` 字段、ghost 取消与唯一 primary 保存。`Enter` 保存，`Escape` 取消，裁剪后的名称通过 `onRename` 回传。常驻抽屉保留行节点，手势在此完成；modal 抽屉首次点击即关闭，重命名仍走右键菜单。",
  },
};

/**
 * Core-owned double-click rename on persistent drawer destinations.
 * The gesture, the dialog chrome and the commit rules ship in
 * `NavigationDrawerItem` — the demo only owns the names.
 */
export function NavDrawerRenameDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [names, setNames] = useState<Record<string, string>>({});
  const renameLabels = {
    title: c.title,
    field: c.field,
    cancel: c.cancel,
    save: c.save,
  };
  const commit = (id: string) => (next: string) =>
    setNames((prev) => ({ ...prev, [id]: next }));

  return (
    <div id="sandbox-nav-drawer-rename" className="fynns-unit-stack">
      <div
        className="sandbox-globals-navdrawer"
        style={{
          display: "flex",
          width: "fit-content",
          maxWidth: "100%",
          height: "16rem",
          border: "1px solid var(--fynns-color-border)",
          borderRadius: "var(--fynns-radius-md)",
          overflow: "hidden",
          background: "var(--fynns-color-app-bg)",
        }}
      >
        <NavigationDrawer variant="standard" ariaLabel={c.aria}>
          <NavigationDrawerItem
            icon={<FolderOpenIcon />}
            label={names.notes ?? c.notes}
            renamable
            renameLabels={renameLabels}
            onRename={commit("notes")}
          />
          <NavigationDrawerItem
            icon={<FileIcon />}
            label={names.log ?? c.log}
            renamable
            renameLabels={renameLabels}
            onRename={commit("log")}
          />
          <NavigationDrawerGroup label={c.archive} icon={<FolderOpenIcon />}>
            <NavigationDrawerItem
              icon={<FileIcon />}
              label={names.plan ?? c.plan}
              renamable
              renameLabels={renameLabels}
              onRename={commit("plan")}
            />
          </NavigationDrawerGroup>
        </NavigationDrawer>
      </div>
      <SandboxHelp text={c.help} />
    </div>
  );
}
