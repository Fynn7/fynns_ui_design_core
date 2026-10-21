import { useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  ArrowLeftIcon, ArrowUpIcon, Button, Card, ClipboardIcon,
  ClippedNavShell, ContextMenu, DropdownMenu,
  DropdownMenuItem, EmptyState, EndAside, FieldBlock, FieldStack, FileIcon,
  HomeIcon, IconButton, InlineAlert, Input, NavigationDrawer,
  NavigationDrawerItem, PageScroll, PanelLeftIcon, PanelRightIcon,
  PencilIcon, PlusIcon, Toolbar, TopAppBar, Tooltip, TrashIcon, snackbar,
} from "@fynns/ui";
import { useLocale } from "../i18n";

const copy = {
  en: {
    title: "Sample workspace", home: "Home", back: "Back", nav: "Navigation",
    inspector: "Inspector", create: "New document", blank: "Blank document",
    name: "Sample document", rename: "Rename document", cancel: "Cancel",
    save: "Save", field: "Name", actions: "Object actions", front: "Bring to front",
    rear: "Send to back", duplicate: "Duplicate", remove: "Delete",
    menu: "Document actions", saved: "Saved", empty: "No document selected",
    body: "Select a document in navigation or create one from the first menu.",
    failure: "Import failed. Choose a supported file and try again.",
    longFailure: "Import failed. The selected file contains unsupported fields. Check the file format, correct the fields and try again.",
    dismiss: "Dismiss notice", restore: "Show persistent notice", transient: "Simulate import failure",
    feedback: "Error feedback",
    help: "Home and Back are top-bar icons. One inspector icon toggles both states. The first navigation control creates a document; double-click a document (or right-click / press Shift+F10) to rename it in the core rename dialog. Routine object actions stay in one ghost icon row. Errors default to snackbar; persistent notices use the content-width InlineAlert with its built-in ghost X.",
  },
  zh: {
    title: "示例工作区", home: "主页", back: "返回", nav: "导航",
    inspector: "检查器", create: "新建文档", blank: "空白文档",
    name: "示例文档", rename: "重命名文档", cancel: "取消", save: "保存",
    field: "名称", actions: "对象操作", front: "移到顶层", rear: "移到底层",
    duplicate: "复制", remove: "删除", menu: "文档操作", saved: "已保存",
    empty: "未选择文档", body: "从导航选择文档，或使用首个菜单新建文档。",
    failure: "导入失败。请选择受支持的文件后重试。",
    longFailure: "导入失败。所选文件包含不支持的字段。请检查文件格式，修正字段后重试。",
    dismiss: "关闭提示", restore: "显示持久提示", transient: "模拟导入失败",
    feedback: "错误反馈",
    help: "主页与返回均为顶栏纯图标。同一个检查器图标切换开关。导航首项用于新建文档；双击文档（或右键 / 按 Shift+F10）在 core 重命名对话框中重命名。常规对象操作使用一行 ghost 图标。错误默认用 snackbar；持久提示使用按内容宽度布局且内置 ghost X 的 InlineAlert。",
  },
};

/** Complete resource-workspace recipe; no product-specific labels or data. */
export function WorkspaceChromeDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [navOpen, setNavOpen] = useState(true);
  const [asideOpen, setAsideOpen] = useState(false);
  const [selected, setSelected] = useState(true);
  const [name, setName] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0 });
  const label = name ?? c.name;
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setMenu({ open: true, x: event.clientX, y: event.clientY });
  };
  const keyboardMenu = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setMenu({ open: true, x: rect.left, y: rect.bottom });
    }
  };
  return <div id="sandbox-workspace-chrome" className="fynns-unit-stack">
    <div style={{ height: "calc(var(--fynns-navdrawer-item-height) * 10)" }}>
      <ClippedNavShell navMode={navOpen ? "drawer" : "hidden"}
        onNavCrowded={() => setNavOpen(false)}
        topBar={<TopAppBar title={c.title} leading={<>
          <Tooltip content={c.nav}><IconButton variant="ghost" aria-label={c.nav}
            aria-pressed={navOpen} onClick={() => setNavOpen(!navOpen)}><PanelLeftIcon /></IconButton></Tooltip>
          <Tooltip content={c.home}><IconButton variant="ghost" aria-label={c.home}
            onClick={() => setSelected(false)}><HomeIcon /></IconButton></Tooltip>
          {selected && <Tooltip content={c.back}><IconButton variant="ghost" aria-label={c.back}
            onClick={() => setSelected(false)}><ArrowLeftIcon /></IconButton></Tooltip>}
        </>} trailing={<Tooltip content={c.inspector}>
          <IconButton variant="ghost" aria-label={c.inspector} aria-pressed={asideOpen}
            onClick={() => setAsideOpen(!asideOpen)}><PanelRightIcon /></IconButton>
        </Tooltip>} />}
        nav={navOpen ? <NavigationDrawer variant="standard" ariaLabel={c.nav}>
          <DropdownMenu trigger={c.create} leadingIcon={<PlusIcon />} variant="ghost" ariaLabel={c.create}>
            <DropdownMenuItem icon={<FileIcon />} onClick={() => setSelected(true)}>{c.blank}</DropdownMenuItem>
          </DropdownMenu>
          <NavigationDrawerItem label={label} icon={<FileIcon />} active={selected}
            onClick={() => setSelected(true)} onContextMenu={openMenu} onKeyDown={keyboardMenu}
            renamable renameOpen={renameOpen} onRenameOpenChange={setRenameOpen}
            renameLabels={{ title: c.rename, field: c.field, cancel: c.cancel, save: c.save }}
            onRename={(next) => { setName(next); setRenameOpen(false); snackbar(c.saved); }} />
        </NavigationDrawer> : null}>
        <div style={{ display: "flex", height: "100%", minHeight: 0, minWidth: 0 }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}><PageScroll>
            {selected ? <Card title={label}><FieldStack><FieldBlock label={c.field}>
              <Input value={label} readOnly />
            </FieldBlock></FieldStack></Card> : <EmptyState title={c.empty} description={c.body} />}
          </PageScroll></div>
          <EndAside open={asideOpen}><PageScroll><Card title={c.inspector}>
            <Toolbar variant="docked" aria-label={c.actions}>
              <Tooltip content={c.front}><IconButton variant="ghost" aria-label={c.front}
                onClick={() => snackbar(c.front)}><ArrowUpIcon /></IconButton></Tooltip>
              <Tooltip content={c.rear}><IconButton variant="ghost" aria-label={c.rear}
                onClick={() => snackbar(c.rear)}><ArrowUpIcon style={{ transform: "rotate(180deg)" }} /></IconButton></Tooltip>
              <Tooltip content={c.duplicate}><IconButton variant="ghost" aria-label={c.duplicate}
                onClick={() => snackbar(c.duplicate)}><ClipboardIcon /></IconButton></Tooltip>
              <Tooltip content={c.remove}><IconButton variant="ghost" aria-label={c.remove}
                onClick={() => snackbar(c.remove)}><TrashIcon /></IconButton></Tooltip>
            </Toolbar>
          </Card></PageScroll></EndAside>
        </div>
      </ClippedNavShell>
    </div>
    <ContextMenu open={menu.open} x={menu.x} y={menu.y} ariaLabel={c.menu}
      onOpenChange={open => setMenu(prev => ({ ...prev, open }))}>
      <DropdownMenuItem icon={<PencilIcon />} onClick={() => setRenameOpen(true)}>
        {c.rename}
      </DropdownMenuItem>
    </ContextMenu>
    <InlineAlertDemo />
    <p className="sandbox-globals-navrail-pane-body">{c.help}</p>
  </div>;
}

/** Short, wrapped and constrained notices share the same core geometry. */
export function InlineAlertDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [visible, setVisible] = useState(true);
  return <div id="sandbox-inline-alert-dismiss" className="fynns-unit-stack">
    <Toolbar variant="docked" aria-label={c.feedback}>
      <Button variant="ghost" onClick={() => snackbar(c.failure, {
        severity: "error", duration: "long", dismissible: true, dismissAriaLabel: c.dismiss,
      })}><PlusIcon />{c.transient}</Button>
      <Button variant="ghost" onClick={() => setVisible(true)}><PlusIcon />{c.restore}</Button>
    </Toolbar>
    {visible && <InlineAlert severity="error" message={c.failure}
      onDismiss={() => setVisible(false)} dismissAriaLabel={c.dismiss} />}
    <div style={{ maxWidth: "var(--fynns-navdrawer-width)" }}>
      <InlineAlert severity="warning" message={c.longFailure} onDismiss={() => {}}
        dismissAriaLabel={c.dismiss} />
    </div>
    <InlineAlert severity="info" message={c.body} />
  </div>;
}
