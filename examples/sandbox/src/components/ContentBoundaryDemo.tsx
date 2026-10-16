import { useState } from "react";
import {
  BusyRegion, Button, EmptyState, FieldHint, InlineAlert, NavigationDrawer,
  NavigationDrawerGroup, NavigationDrawerItem, SearchBar, ToggleGroup,
} from "@fynns/ui";
import { useLocale } from "../i18n";

type Phase = "loading" | "ready" | "empty" | "error";
type Source = "local" | "shared";

const copy = {
  en: {
    help: "The first content unit keeps the same 24dp clearance below the search and source controls in every state.",
    loading: "Loading", ready: "Ready", empty: "Empty", error: "Error",
    search: "Search resources", placeholder: "Search resources…", source: "Resource source",
    local: "Local", shared: "Shared", group: "Resources", item: "Example resource",
    emptyTitle: "No resources", errorMessage: "Resources could not be loaded.",
    busy: "Loading resources", drawer: "Content boundary example",
  },
  zh: {
    help: "搜索和数据源控件下方的首个内容单元，在每种状态下都保持 24dp 间距。",
    loading: "加载", ready: "完成", empty: "空态", error: "错误",
    search: "搜索资源", placeholder: "搜索资源…", source: "资源来源",
    local: "本地", shared: "共享", group: "资源", item: "示例资源",
    emptyTitle: "没有资源", errorMessage: "资源加载失败。",
    busy: "资源加载中", drawer: "内容边界示例",
  },
};

/** Tools and the first data unit are direct NavigationDrawer body siblings. */
export function ContentBoundaryDemo() {
  const { locale } = useLocale();
  const c = copy[locale];
  const [phase, setPhase] = useState<Phase>("loading");
  const [source, setSource] = useState<Source>("local");
  const [query, setQuery] = useState("");
  const options = [
    { value: "local" as const, label: c.local },
    { value: "shared" as const, label: c.shared },
  ];
  return <div id="sandbox-loading-content-boundary" className="fynns-unit-stack">
    <FieldHint>{c.help}</FieldHint>
    <div className="fynns-control-cluster" role="group" aria-label={c.drawer}>
      {(["loading", "ready", "empty", "error"] as const).map(next =>
        <Button key={next} variant="ghost" size="sm" aria-pressed={phase === next}
          onClick={() => setPhase(next)}>{c[next]}</Button>)}
    </div>
    <div style={{ height: "calc(var(--fynns-layout-skeleton-block-height) * 4)", minHeight: 0 }}>
      <NavigationDrawer variant="standard" ariaLabel={c.drawer}>
        <div id="sandbox-loading-content-boundary-tools" style={{
          display: "flex", flexDirection: "column", gap: "var(--fynns-layout-control-stack-gap)",
          flexShrink: 0, minWidth: 0,
        }}>
          <SearchBar density="destination" value={query} onChange={setQuery}
            ariaLabel={c.search} placeholder={c.placeholder} />
          <ToggleGroup ariaLabel={c.source} value={source} onChange={setSource}
            options={options} size="compact" fullWidth showCheck={false} />
        </div>
        {phase === "loading" ? <BusyRegion busy label={c.busy}
          className="fynns-content-boundary" data-content-phase={phase} />
          : phase === "ready" ? <NavigationDrawerGroup label={c.group}
            className="fynns-content-boundary">
            <NavigationDrawerItem label={c.item} />
          </NavigationDrawerGroup>
          : phase === "empty" ? <EmptyState title={c.emptyTitle} size="sm"
            className="fynns-content-boundary" data-content-phase={phase} />
          : <InlineAlert severity="error" message={c.errorMessage}
            className="fynns-content-boundary" data-content-phase={phase} />}
      </NavigationDrawer>
    </div>
  </div>;
}
