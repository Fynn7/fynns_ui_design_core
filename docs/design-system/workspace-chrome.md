# Workspace chrome and error feedback

← back to [Design system index](../DESIGN_SYSTEM.md)

These are mandatory defaults for every greenfield consumer, including canvas,
editor and resource workspaces. Change the information architecture only when
the user explicitly requests a different one. Existing consumers must migrate;
copied older examples do not override this contract.

Live recipe: Layout templates `#layouts-demo-workspace-chrome` →
`#sandbox-workspace-chrome` and `#sandbox-inline-alert-dismiss`.
Implementation: [WorkspaceChromeDemo.tsx](../../examples/sandbox/src/components/WorkspaceChromeDemo.tsx).
Read that small recipe rather than the entire Globals page.

| Job | Required composition | Forbidden |
| --- | --- | --- |
| Inspector open/close | One stable TopAppBar trailing `IconButton variant="ghost"` with `PanelRightIcon`, Tooltip, localized aria-label and `aria-pressed`. Both states toggle the same boolean. | Labeled/filled “Sidebar” Button; a second close X inside the inspector; separate open and collapse controls. |
| Global project/catalog home | TopAppBar leading ghost `IconButton` + `HomeIcon`, Tooltip and aria-label. Clicking shows the root/catalog in the same app shell. | Ordinary drawer/list item secretly routing to a different global page; a text Home pill; replacing the shell. |
| Back from a detail | One ghost `IconButton` + `ArrowLeftIcon` in TopAppBar leading; Tooltip + aria-label. | “← Projects” labeled Button, doubled arrows or a filled navigation CTA. |
| First navigation element | A localized “New <resource>” menu with `PlusIcon` and creation choices using `DropdownMenu`; use ghost/tonal emphasis. Chat's stock `NavigationDrawerNewChat` remains the chat recipe. | A product/domain slogan or redundant section heading above creation; creation only in the main toolbar. |
| Resource rename | Right-click the resource's `NavigationDrawerItem` → `ContextMenu` + `DropdownMenuItem` → rename `Dialog`. Capture the clicked resource id; never change the current selection on right-click. Support ContextMenu key and Shift+F10. | A rename pill/title Button in the canvas toolbar; left-click opening rename; a menu always acting on the selected resource instead of the target. |
| Routine object actions | One horizontal `Toolbar` / `.fynns-control-cluster`: ordering, duplicate and delete use ghost IconButtons + Tooltip + aria-label. If labels are needed, use ghost/tonal Buttons. Danger belongs in the destructive confirmation. | Full-width stacked primary/danger pills for ordinary inspector commands; all actions competing as primary; local accent/destructive fills. |
| Commit form changes | At most one primary per action group, rightmost. Dialog `feet` → `.fynns-control-cluster--end-align`: `CloseIcon` + labeled ghost Cancel, then `CheckIcon` + labeled primary Save. | Filled Cancel; Cancel and Save both primary; icon-only confirmation; footer actions in the scrolling body. |
| Visible chrome copy | Natural sentence case and localized human labels. | All-cap titles/overlines/section names or `text-transform: uppercase` / `toUpperCase()` to decorate UI. Code content and literal protocol/data values remain exact. |

Use `DestinationAppShell` for explicitly requested fixed destination lists: its existing inspector
toggle already owns the one ghost PanelRight control; do not add another toggle
in `trailing` or another close in `aside`. Home uses `leadingExtra`.
When a resource menu and per-item context handling are needed, compose the
existing `ClippedNavShell`, `TopAppBar`, `NavigationDrawer` and `EndAside` slots
as in the live recipe. Do not simulate a creation command through `activeId`
or turn `destinations` into action Buttons. Omit `drawerHeadline` on root shells.

The shell keeps its own background and proportions. Routine actions must not
cover the inspector with accent color. Do not reduce the global accent token
to compensate for choosing too many primary Buttons. Use the correct variants.
Actions share [Form rhythm](form-rhythm.md): **4dp** for an all-icon row,
**8dp** for any labeled/mixed row, including wrapped menu triggers. No custom
button margins/gaps or stacked full-width action columns. Narrow panes must
retain the row or put overflow actions in a core menu, without clipping.

## Error feedback defaults

Unless the user specifies a feedback method, import/save/network/action failures
use `snackbar(message, { severity: "error", duration: "long", dismissible: true })`
and one root `SnackbarHost`. It is a fixed overlay and does not move app content.
Do not automatically add InlineAlert to a page after every failed operation,
and do not show both channels for the same error.

Use `InlineAlert` second, for errors that remain relevant until repaired:
unavailable content, persistent validation/recovery or an explicitly requested
in-panel notice. Put it at the affected content, not as a global full-width
banner. InlineAlert owns these defaults:

- Content width (`fit-content`) with parent `max-width: 100%`; long text wraps
  without overflowing a narrow pane. Do not force `width: 100%` or stretch it.
- Severity icon, body text and dismiss X share the vertical centerline for both
  one-line and wrapped messages. SVG is block, without manual top offsets.
- Icon→message uses Banner gap; message→dismiss is the wider **16dp** unit gap.
  Body uses `--fynns-line-height-body`. No consumer offsets/margins.
- `onDismiss` + localized `dismissAriaLabel` renders the built-in **ghost X
  IconButton**, without visible text. Do not embed a Button in `message`/children.
  The familiar X needs an aria-label; it may omit a Tooltip like other closes.

## Enforcement and review

The existing installed `fynns-ui:gate` calls `check-ui-exports.mjs`, which also
runs [check-workspace-ui.mjs](../../scripts/check-workspace-ui.mjs) on consuming
JSX/TSX files. The parser uses TypeScript tooling from core or the consumer;
missing tooling fails with an install hint. The checker catches direct and
aliased controls, same-file action helpers, multiple primaries in a group,
labeled/filled sidebar/Home/Back chrome, filled Cancel, embedded InlineAlert
controls, direct width/alignment overrides and literal all-cap UI copy.

Static success is necessary, not sufficient: cross-file wrappers, dynamic props,
translated copy, navigation behavior, duplicate controls, CSS transforms and
rendered spacing require browser review. Check desktop + narrow viewport,
dark + light, long translated names, right-click on an inactive resource,
keyboard context menu, Dialog Cancel/Save, inspector open/close and both short
and wrapped notices. Never suppress the gate or rewrite tests to permit a bad UI.
Core geometry and interactions are covered by workspace/InlineAlert treaty e2e.
