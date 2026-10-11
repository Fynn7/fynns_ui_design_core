import { useLayoutEffect, useRef, useState } from "react";
import {
  AlertCircleIcon, ArrowLeftIcon, Button, ClippedNavShell, CloseIcon,
  DownloadIcon, DropdownMenu, DropdownMenuItem, EmptyState, EndAside,
  FileIcon, HomeIcon, IconButton, LayoutGridIcon, NavigationDrawer,
  NavigationDrawerItem, PageScroll, PanelLeftIcon, PanelRightIcon, PlusIcon,
  RefreshIcon, SaveIcon, Toolbar, Tooltip, TopAppBar, snackbar,
  WorkspaceNoticeStack, wouldClippedNavDrawerCrowd, type WorkspaceNotice,
} from "@fynns/ui";
import { useLocale } from "../i18n";
import "./CanvasWorkspaceDemo.css";

const copy = {
  en: {
    title: "Canvas workspace", nav: "Navigation", home: "Home", back: "Back",
    inspector: "Inspector", create: "New canvas", blank: "Blank canvas",
    name: "Sample canvas", tools: "Canvas tools", hide: "Hide canvas tools",
    layout: "Arrange nodes", export: "Export canvas", copy: "Save a copy",
    saved: "Copy saved", retry: "Retry save", recovered: "Saved successfully",
    fail: "Simulate save failure", persistent: "Show persistent save conflict",
    multiple: "Show three persistent notices", notices: "Workspace notices",
    unavailable: "The attachment is unavailable. Reconnect to restore access.",
    unavailableDismiss: "Dismiss attachment notice", reconnect: "Reconnect",
    offline: "Offline changes remain on this device. Reconnect before syncing.",
    offlineDismiss: "Dismiss offline notice", sync: "Sync changes",
    failure: "Could not save. Retry or save a copy.",
    conflict: "Another session updated this document. Automatic saving is paused.",
    dismiss: "Dismiss save conflict", node: "Sample node", next: "Next step",
    empty: "Select an object", emptyBody: "Object properties appear here.",
    controls: "Preview controls", docked: "Page tools", newNode: "Add node",
    help: "Canvas tools float over the unchanged canvas with 16dp clearance. Close with X and restore from the top bar. Ordinary errors use snackbar with Retry. Persistent notices stack at the canvas top right with 16dp gaps, independent recovery and ghost X, and smooth entry, exit and reflow. Repeating the same condition updates its card. Narrow canvases move tools to the bottom left to prevent overlap. Dismissing a conflict does not resume saving; Save a copy remains in Export.",
    dockedHelp: "For page content only: an in-flow docked toolbar keeps 16dp clearance on every side. Canvas tools use the floating recipe above.",
  },
  zh: {
    title: "画布工作区", nav: "导航", home: "主页", back: "返回",
    inspector: "检查器", create: "新建画布", blank: "空白画布",
    name: "示例画布", tools: "画布工具", hide: "关闭画布工具",
    layout: "排列节点", export: "导出画布", copy: "另存副本",
    saved: "已保存副本", retry: "重试保存", recovered: "保存成功",
    fail: "模拟保存失败", persistent: "显示持久保存冲突",
    multiple: "显示三条持久提示", notices: "工作区提示",
    unavailable: "附件暂不可用，请重新连接以恢复访问。",
    unavailableDismiss: "关闭附件提示", reconnect: "重新连接",
    offline: "离线修改仍保存在当前设备，连接后再同步。",
    offlineDismiss: "关闭离线提示", sync: "同步修改",
    failure: "保存失败。请重试或另存副本。",
    conflict: "另一会话已更新此文档，自动保存已暂停。",
    dismiss: "关闭保存冲突提示", node: "示例节点", next: "下一步",
    empty: "选择一个对象", emptyBody: "对象属性将显示在这里。",
    controls: "预览操作", docked: "页面工具", newNode: "添加节点",
    help: "画布工具浮在画布上，四周保留 16dp，不挤占画布。X 关闭后可从顶栏恢复。普通错误用带重试的 snackbar。持久提示在画布右上角按 16dp 间距堆叠，每条有自己的恢复动作和 ghost X，并有出现、退出及收拢动效。同一问题重复出现只更新原卡。窄画布把工具条移到左下角以避免重叠。关闭冲突提示不会恢复保存，导出菜单仍保留另存副本。",
    dockedHelp: "仅用于页面内容：占据文档流的 docked 工具条四周保留 16dp 间距。画布工具使用上方浮层模板。",
  },
};

/** Approved canvas recipe: core owns overlay placement, notice geometry and motion. */
export function CanvasWorkspaceDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [navOpen, setNavOpen] = useState(true);
  const [asideOpen, setAsideOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [conflict, setConflict] = useState(false);
  const [visibleNotices, setVisibleNotices] = useState<string[]>([]);
  const [arranged, setArranged] = useState(false);
  const [secondNode, setSecondNode] = useState(true);
  const shellRef = useRef<HTMLDivElement>(null);
  // Nested preview hosts need the same explicit opening check as full-window apps.
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell || !navOpen) return;
    const check = () => { if (wouldClippedNavDrawerCrowd(shell)) setNavOpen(false); };
    const observer = new ResizeObserver(check);
    observer.observe(shell);
    check();
    return () => observer.disconnect();
  }, [navOpen, asideOpen]);
  const dismiss = (id: string) => setVisibleNotices(previous => previous.filter(item => item !== id));
  const retry = () => { setConflict(false); dismiss("save"); snackbar(c.recovered); };
  const saveCopy = () => { setConflict(false); dismiss("save"); snackbar(c.saved); };
  const showConflict = () => { setConflict(true); setVisibleNotices(previous => [...new Set([...previous, "save"])]); };
  const notices: WorkspaceNotice[] = visibleNotices.map(id => id === "save" ? {
    id, severity: "error", message: c.conflict, dismissAriaLabel: c.dismiss,
    actions: [{ label: c.retry, icon: <RefreshIcon />, onClick: retry }, { label: c.copy, icon: <SaveIcon />, onClick: saveCopy }],
  } : id === "attachment" ? {
    id, severity: "warning", message: c.unavailable, dismissAriaLabel: c.unavailableDismiss,
    actions: [{ label: c.reconnect, icon: <RefreshIcon />, onClick: () => dismiss(id) }],
  } : {
    id, severity: "info", message: c.offline, dismissAriaLabel: c.offlineDismiss,
    actions: [{ label: c.sync, icon: <RefreshIcon />, onClick: () => dismiss(id) }],
  });
  const addNode = () => setSecondNode(true);
  return <div id="sandbox-canvas-workspace" className="fynns-unit-stack">
    <div className="fynns-control-cluster" aria-label={c.controls}>
      <Button variant="ghost" onClick={() => snackbar(c.failure, {
        severity: "error", duration: "indefinite", dismissible: true,
        dismissAriaLabel: c.dismiss,
        action: { label: c.retry, variant: "ghost", onClick: retry },
      })}><AlertCircleIcon />{c.fail}</Button>
      <Button variant="ghost" onClick={showConflict}>
        <AlertCircleIcon />{c.persistent}
      </Button>
      <Button variant="ghost" onClick={() => { setConflict(true); setVisibleNotices(["save", "attachment", "offline"]); }}>
        <PlusIcon />{c.multiple}
      </Button>
    </div>
    <div className="sandbox-canvas-workspace-host">
      <ClippedNavShell ref={shellRef} navMode={navOpen ? "drawer" : "hidden"}
        onNavCrowded={() => { setNavOpen(false); setAsideOpen(false); }}
        topBar={<TopAppBar title={c.title} leading={<>
          <Tooltip content={c.nav}><IconButton variant="ghost" aria-label={c.nav}
            aria-pressed={navOpen} onClick={() => setNavOpen(!navOpen)}><PanelLeftIcon /></IconButton></Tooltip>
          <Tooltip content={c.home}><IconButton variant="ghost" aria-label={c.home}
            onClick={() => { setArranged(false); setSecondNode(true); }}><HomeIcon /></IconButton></Tooltip>
          <Tooltip content={c.back}><IconButton variant="ghost" aria-label={c.back}
            onClick={() => setArranged(false)}><ArrowLeftIcon /></IconButton></Tooltip>
        </>} trailing={<>
          <Tooltip content={c.tools}><IconButton variant="ghost" aria-label={c.tools}
            aria-pressed={toolsOpen} onClick={() => setToolsOpen(!toolsOpen)}><LayoutGridIcon /></IconButton></Tooltip>
          <Tooltip content={c.inspector}><IconButton variant="ghost" aria-label={c.inspector}
            aria-pressed={asideOpen} onClick={() => setAsideOpen(!asideOpen)}><PanelRightIcon /></IconButton></Tooltip>
        </>} />}
        nav={navOpen ? <NavigationDrawer variant="standard" ariaLabel={c.nav}>
          <DropdownMenu trigger={c.create} leadingIcon={<PlusIcon />} variant="ghost" ariaLabel={c.create}>
            <DropdownMenuItem icon={<FileIcon />} onClick={() => { setSecondNode(false); setArranged(false); }}>{c.blank}</DropdownMenuItem>
          </DropdownMenu>
          <NavigationDrawerItem label={c.name} icon={<FileIcon />} active
            onClick={() => setSecondNode(true)} />
        </NavigationDrawer> : null}>
        <div className="sandbox-canvas-workspace-panes">
          <div className="fynns-workspace-canvas sandbox-canvas-stage" tabIndex={-1} aria-label={c.name}
            data-paused={conflict || undefined}>
            <div className="sandbox-canvas-scene" data-arranged={arranged}>
              <div className="sandbox-canvas-node">{c.node}</div>
              {secondNode && <><span className="sandbox-canvas-connector" aria-hidden />
                <div className="sandbox-canvas-node sandbox-canvas-node--next">{c.next}</div></>}
            </div>
            {toolsOpen && <div className="fynns-workspace-tools">
              <Toolbar variant="floating" aria-label={c.tools}>
                <Tooltip content={c.newNode}><IconButton variant="ghost" aria-label={c.newNode}
                  onClick={addNode}><PlusIcon /></IconButton></Tooltip>
                <Tooltip content={c.layout}><IconButton variant="ghost" aria-label={c.layout}
                  onClick={() => setArranged(!arranged)}><RefreshIcon /></IconButton></Tooltip>
                <Tooltip content={c.export}><DropdownMenu trigger={<DownloadIcon />} iconOnly
                  variant="ghost" ariaLabel={c.export}>
                  <DropdownMenuItem icon={<SaveIcon />} onClick={saveCopy}>{c.copy}</DropdownMenuItem>
                </DropdownMenu></Tooltip>
                <IconButton variant="ghost" aria-label={c.hide} onClick={() => setToolsOpen(false)}><CloseIcon /></IconButton>
              </Toolbar>
            </div>}
            <WorkspaceNoticeStack notices={notices} onDismiss={dismiss} ariaLabel={c.notices} />
          </div>
          <EndAside open={asideOpen}><PageScroll>
            <EmptyState title={c.empty} description={c.emptyBody} />
          </PageScroll></EndAside>
        </div>
      </ClippedNavShell>
    </div>
    <p className="sandbox-globals-navrail-pane-body">{c.help}</p>
    <div className="fynns-docked-tools-inset sandbox-canvas-docked-specimen">
      <Toolbar variant="docked" aria-label={c.docked}>
        <Button variant="ghost" onClick={addNode}><PlusIcon />{c.newNode}</Button>
        <Button variant="ghost" onClick={() => setArranged(!arranged)}><RefreshIcon />{c.layout}</Button>
      </Toolbar>
    </div>
    <p className="sandbox-globals-navrail-pane-body">{c.dockedHelp}</p>
  </div>;
}
