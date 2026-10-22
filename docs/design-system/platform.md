# Platform targeting

← back to [Design system index](../DESIGN_SYSTEM.md)

Labels: **`both`** = any viewport; **`mobile-first`** = prefer on compact /
phone (pair with a desktop sibling when adapting); **`desktop-first`** =
prefer on medium+ / pointer; **`adaptive`** = same component changes layout by
breakpoint or `(hover: none)`. Most controls are **`both`**. Only
**ClippedNavShell** / **EndAside** implement a real viewport break
(`max-width: 56.25rem`). Destination chrome does **not** auto-swap — the
**app** chooses Rail vs Bar vs Drawer.

**Destination ladder (not duplicates):** phone → `NavigationBar` (bottom) or
intentional `NavigationRail` as a **standalone** phone root (not
DestinationAppShell densify); wide labeled → `NavigationDrawer` `standard`
inside **DestinationAppShell** (desktop default; open drawer or fully hidden —
never unlabeled rail intermediate); overlay → `modal`. Live composed default:
sandbox **Layout templates** (`#layouts-demo-shell`). Standalone Rail/Bar demos
on that page are parts — not a desktop greenfield root.

| Symbol | Platform | Notes |
| --- | --- | --- |
| DestinationAppShell | adaptive | Default greenfield; binary drawer/hidden; flat roots only — drill-in → hand-compose ClippedNavShell (`#layouts-demo-drill-in`) |
| TopAppBar | both | Edge-flush; slot into shell |
| BottomAppBar | mobile-first | Actions + optional FAB — not destinations |
| StatusBar | desktop-first | ~22dp IDE strip; live `#status-bar` |
| Toolbar | both | Contextual `docked` / `floating` |
| NavigationBar | mobile-first | Bottom destinations (phone) |
| NavigationRail | mobile-first | Intentional phone/icon root only — never DestinationAppShell densify |
| NavigationDrawer | adaptive | Desktop default inside DestinationAppShell; Group (collapsible) or Headline; sheet `headline` = static title only (never back/bulk row); Group/Item short labels; SearchBar↔dest = `navdrawer-search-gap` (8dp); optional `footer` account+settings |
| ClippedNavShell | adaptive | Low-level TopAppBar + nav\|main; `drawer`\|`rail`\|`hidden` must match `nav` slot; drill-in / mode body → `navKey` + `navDirection` Shared Axis X (`#layouts-demo-drill-in`); prefer DestinationAppShell for flat roots |
| EndAside | adaptive | Width morph (≥ **0.5.86**); desktop resize; main ≤32rem → overlay; ≤56.25rem → bottom sheet |
| Drawer | desktop-first | Modal **content** side sheet (~400dp). Phone → BottomSheet. ≠ NavigationDrawer |
| BottomSheet | mobile-first | Bottom content sheet. Desktop → Drawer. Drag handle; no header\|body divider |
| FullscreenDialog | mobile-first | Full-viewport; flush-start when first body child is bordered well (`#fullscreen-flush`) |
| Dialog / ConfirmDialog | both | Centered; form hosts fill `size` ceiling; `size="viewport"` = large inset code/config workspace (not fullscreen); dismissible prefs = `showCloseButton` + ControlStack |
| CommandPalette | both | ⌘K filter dialog; live `#command-palette` |
| ContextMenu / Tooltip / InfoHint | desktop-first | Pointer/hover-first |
| Table* | desktop-first | Horizontal scroll when narrow |
| Dropzone | desktop-first | Drag-drop primary |
| Collapsible / CodeBlock | adaptive | Hover-none changes disclose/copy |
| Chat* / List* / Timeline* / FillColumn / PageScroll / SplitPane / Tree / Busy* / Banner / … | both | See keep-set + Content density |
