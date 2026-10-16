import { useEffect, useId, useRef, useState } from "react";
import {
  Button, BusyRegion, CheckIcon, ControlBlock, ControlRow, Dialog,
  DropdownMenu, DropdownMenuItem, FieldBlock, FieldStack, FolderOpenIcon,
  IconButton, InfoHint, InlineAlert, Input, LoadingSkeleton,
  NavigationDrawerItem, SaveIcon, SettingsIcon, Switch,
  ToggleGroup, Tooltip, snackbar,
} from "@fynns/ui";
import { useLocale } from "../i18n";

const copy = {
  en: {
    title: "Settings", general: "General", advanced: "Advanced", categories: "Settings categories",
    open: "Open settings", language: "Language", languageHint: "Choose the language used for navigation and settings.",
    startup: "Launch at login", startupHint: "Open the app automatically when you sign in.",
    ready: "Startup entry ready", readyHint: "The startup entry is installed and active on this device.",
    off: "Startup disabled", offHint: "No startup entry is active. Turn on launch at login to create it.",
    unsupported: "Launch at login is unavailable on this platform.", close: "Close settings",
    path: "Project scan root", pathHint: "Scan this folder for projects. Leave blank to use the default location.",
    pathHelp: "Folder policy", pathDetail: "Changing this path affects project discovery only. Existing projects and files are kept.",
    effective: "Current location", save: "Save path", saved: "Saved on this device", unsaved: "Unsaved changes", saving: "Saving preference",
    failed: "Could not save. Your previous preference has been restored.", pathFailed: "Could not save the path. Your draft is kept; try again.",
    loadFailed: "Could not load settings.", retry: "Retry", loading: "Loading settings", failNext: "Fail next save",
    scenario: "Scenario", normal: "Ready", slow: "Loading", error: "Load failure", unavailable: "Unsupported platform",
  },
  zh: {
    title: "设置", general: "常规", advanced: "高级", categories: "设置分类",
    open: "打开设置", language: "界面语言", languageHint: "选择导航和设置界面使用的语言。",
    startup: "开机自启动", startupHint: "登录系统时自动打开应用。",
    ready: "启动项已就绪", readyHint: "此设备上的启动项已安装并启用。",
    off: "自启动已关闭", offHint: "当前没有启用的启动项，打开开关后将创建。",
    unsupported: "当前系统暂不支持开机自启动。", close: "关闭设置",
    path: "项目扫描根目录", pathHint: "扫描此目录中的项目，留空使用默认位置。",
    pathHelp: "目录使用说明", pathDetail: "此路径仅影响项目发现范围，不移动或删除已有项目与文件。",
    effective: "当前生效目录", save: "保存路径", saved: "已保存到此设备", unsaved: "有未保存的更改", saving: "正在保存设置",
    failed: "保存失败，已恢复之前的设置。", pathFailed: "路径保存失败，草稿已保留，请重试。",
    loadFailed: "无法加载设置。", retry: "重试", loading: "加载设置", failNext: "下次保存失败",
    scenario: "演示状态", normal: "正常", slow: "加载中", error: "加载失败", unavailable: "系统不支持",
  },
};
type Category = "general" | "advanced";
type Scenario = "normal" | "slow" | "error" | "unavailable";
type Preference = "language" | "startup" | "path";

/** Generic device preferences; fake IO stays here, layout rules ship with core. */
export function SettingsDialogDemo() {
  const { locale } = useLocale();
  const [language, setLanguage] = useState<"en" | "zh">(locale);
  const c = copy[language];
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("general");
  const [startup, setStartup] = useState(true);
  const [draft, setDraft] = useState("");
  const [savedPath, setSavedPath] = useState("");
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [failNext, setFailNext] = useState(false);
  const [pending, setPending] = useState<Preference | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pathError, setPathError] = useState(false);
  const loadRequest = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRequest = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const focusAfterSave = useRef<{ target: HTMLElement; panel: HTMLElement } | null>(null);
  const pathInput = useRef<HTMLInputElement>(null);
  const pathId = useId();
  const headingId = useId();
  const defaultPath = "D:\\Workspaces";
  const dirty = draft !== savedPath;

  useEffect(() => () => {
    if (loadRequest.current != null) clearTimeout(loadRequest.current);
    if (saveRequest.current != null) clearTimeout(saveRequest.current);
  }, []);

  useEffect(() => {
    if (pending || !focusAfterSave.current) return;
    const { target, panel } = focusAfterSave.current;
    focusAfterSave.current = null;
    if (document.activeElement !== panel) return;
    if (target.isConnected && !target.matches(":disabled")) target.focus();
    else pathInput.current?.focus();
  }, [pending]);

  function startLoad(retry = false) {
    if (loadRequest.current != null) clearTimeout(loadRequest.current);
    setLoadError(!retry && scenario === "error");
    setLoading(scenario === "slow" || retry);
    if (scenario === "slow" || retry) {
      // Simulated network latency, unrelated to animation timing.
      loadRequest.current = setTimeout(() => setLoading(false), 1400);
    }
  }

  function save(key: Preference, apply: () => void, rollback: () => void) {
    if (busy.current) return;
    busy.current = true;
    // Disabling a focused button drops browser focus to body. Keep the modal's
    // Escape/Tab handling alive, then restore only if the user has not moved on.
    const target = document.activeElement;
    const panel = target?.closest<HTMLElement>(".fynns-settings-dialog");
    if (target instanceof HTMLElement && panel) {
      focusAfterSave.current = { target, panel };
      panel.focus();
    }
    setPending(key);
    apply();
    const fails = failNext;
    setFailNext(false);
    // Fake IO makes pending and rollback visible without an external service.
    saveRequest.current = setTimeout(() => {
      busy.current = false;
      setPending(null);
      if (fails) {
        rollback();
        if (key === "path") setPathError(true);
        snackbar(key === "path" ? c.pathFailed : c.failed, { severity: "error" });
      } else {
        if (key === "path") { setSavedPath(draft); setPathError(false); }
        snackbar(c.saved, { severity: "success" });
      }
    }, 650);
  }

  const disabled = pending != null || loading;
  return (
    <div id="sandbox-settings-dialog" className="fynns-unit-stack">
      <div className="fynns-control-cluster fynns-control-cluster--start-align">
        <Button onClick={() => { setCategory("general"); startLoad(); setOpen(true); }}>
          <SettingsIcon aria-hidden />{c.open}
        </Button>
        <DropdownMenu trigger={`${c.scenario}: ${c[scenario]}`} ariaLabel={c.scenario}>
          {(["normal", "slow", "error", "unavailable"] as const).map(value => (
            <DropdownMenuItem key={value} onClick={() => setScenario(value)}>{c[value]}</DropdownMenuItem>
          ))}
        </DropdownMenu>
        <Switch label={c.failNext} checked={failNext} onCheckedChange={setFailNext} />
      </div>
      <Dialog open={open} onOpenChange={setOpen} title={c.title}
        className="fynns-settings-dialog" showCloseButton closeAriaLabel={c.close}>
        <div className="fynns-settings-layout">
          <nav className="fynns-settings-nav" aria-label={c.categories}>
            <NavigationDrawerItem icon={<SettingsIcon aria-hidden />} label={c.general}
              active={category === "general"} onClick={() => setCategory("general")} />
            <NavigationDrawerItem icon={<FolderOpenIcon aria-hidden />} label={c.advanced}
              active={category === "advanced"} onClick={() => setCategory("advanced")} />
          </nav>
          <section className="fynns-settings-content" aria-labelledby={headingId}>
            <h3 className="fynns-settings-heading" id={headingId}>{c[category]}</h3>
            {loadError ? (
              <div className="fynns-unit-stack">
                <InlineAlert severity="error">{c.loadFailed}</InlineAlert>
                <div className="fynns-control-cluster fynns-control-cluster--start-align">
                  <Button variant="ghost" onClick={() => startLoad(true)}>{c.retry}</Button>
                </div>
              </div>
            ) : (
              <>
                {category === "general" ? (
                  <FieldStack className="fynns-settings-rows">
                    <ControlBlock description={c.languageHint}>
                      <ControlRow label={c.language}>
                        <BusyRegion busy={loading} label={c.loading} skeleton={<LoadingSkeleton variant="text" lines={1} />}>
                        <ToggleGroup ariaLabel={c.language} value={language} size="compact" showCheck={false}
                          options={[{ value: "en", label: "English", disabled }, { value: "zh", label: "中文", disabled }]}
                          onChange={next => { const before = language; save("language", () => setLanguage(next), () => setLanguage(before)); }} />
                        </BusyRegion>
                      </ControlRow>
                    </ControlBlock>
                    <ControlBlock description={scenario === "unavailable" ? c.unsupported : c.startupHint}>
                      <ControlRow label={<>{c.startup}
                        {scenario !== "unavailable" && <InfoHint size="sm" icon={startup && !loading && pending !== "startup" ? <CheckIcon aria-hidden /> : undefined}
                          ariaLabel={loading ? c.startup : pending === "startup" ? c.saving : startup ? c.ready : c.off}
                          content={loading ? c.startupHint : pending === "startup" ? c.saving : startup ? c.readyHint : c.offHint} />}
                      </>}>
                        <BusyRegion busy={loading} label={c.loading} skeleton={<LoadingSkeleton variant="text" lines={1} />}>
                        <Switch label="" ariaLabel={c.startup} checked={startup}
                          disabled={disabled || scenario === "unavailable"}
                          onCheckedChange={next => { const before = startup; save("startup", () => setStartup(next), () => setStartup(before)); }} />
                        </BusyRegion>
                      </ControlRow>
                    </ControlBlock>
                  </FieldStack>
                ) : (
                  <FieldStack>
                    <FieldBlock label={c.path} htmlFor={pathId} description={c.pathHint}
                      errorText={pathError ? c.pathFailed : undefined}
                      actions={<InfoHint size="sm" ariaLabel={c.pathHelp} content={c.pathDetail} />}>
                      <BusyRegion busy={loading} label={c.loading} skeleton={<LoadingSkeleton variant="text" lines={1} />}>
                      <Input ref={pathInput} id={pathId} value={draft} placeholder={defaultPath} disabled={disabled}
                        leading={<FolderOpenIcon aria-hidden />}
                        onChange={e => { setDraft(e.target.value); setPathError(false); }}
                        trailing={<Tooltip content={c.save}><IconButton size="sm" variant="ghost" aria-label={c.save}
                          disabled={!dirty || disabled} onClick={() => save("path", () => {}, () => {})}>
                          <SaveIcon aria-hidden />
                        </IconButton></Tooltip>} />
                      </BusyRegion>
                    </FieldBlock>
                    <p className="fynns-settings-meta">{c.effective}: {savedPath || defaultPath}</p>
                    <p className="fynns-settings-meta" role="status">{dirty ? c.unsaved : c.saved}</p>
                  </FieldStack>
                )}
              </>
            )}
          </section>
        </div>
      </Dialog>
    </div>
  );
}
