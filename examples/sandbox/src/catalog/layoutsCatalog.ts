import type { MessageKey } from "../i18n";

/**
 * Layout templates page demos — greenfield chrome / DestinationAppShell.
 * Hash anchors: `#layouts-demo-${id}`.
 */
export type LayoutsDemoEntry = {
  id: string;
  label: string;
  keywords: string[];
};

export function layoutsDemoElementId(id: string): string {
  return `layouts-demo-${id}`;
}

export const LAYOUTS_LEAD_KEY: MessageKey = "layouts.lead";

export const LAYOUTS_DEMOS: readonly LayoutsDemoEntry[] = [
  {
    id: "shell",
    label: "DestinationAppShell",
    keywords: [
      "壳",
      "shell",
      "clipped",
      "destination",
      "appshell",
      "layout shell",
      "默认模板",
    ],
  },
  {
    id: "top-app-bar",
    label: "TopAppBar",
    keywords: ["顶栏", "appbar", "topbar", "top app bar"],
  },
  {
    id: "navigation-drawer",
    label: "NavigationDrawer",
    keywords: ["导航抽屉", "drawer", "navdrawer"],
  },
  {
    id: "navigation-rail",
    label: "NavigationRail",
    keywords: ["导航轨", "rail", "navrail", "mobile", "narrow"],
  },
  {
    id: "navigation-bar",
    label: "NavigationBar",
    keywords: ["底部导航", "navbar", "navigation bar", "mobile"],
  },
  {
    id: "bottom-app-bar",
    label: "BottomAppBar",
    keywords: ["底栏", "bottom app bar", "bottomappbar"],
  },
  {
    id: "toolbar",
    label: "Toolbar",
    keywords: ["工具栏", "toolbar"],
  },
  {
    id: "search-bar",
    label: "SearchBar",
    keywords: ["搜索栏", "searchbar", "search bar"],
  },
] as const;
