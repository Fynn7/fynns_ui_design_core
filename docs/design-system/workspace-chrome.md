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

Canvas reference: `#layouts-demo-canvas-workspace` →
[CanvasWorkspaceDemo.tsx](../../examples/sandbox/src/components/CanvasWorkspaceDemo.tsx).
Its overlay placement, notice stacking and motion are shipped core behavior.

| Job | Required composition | Forbidden |
| --- | --- | --- |
| Inspector open/close | One stable TopAppBar trailing `IconButton variant="ghost"` with `PanelRightIcon`, Tooltip, localized aria-label and `aria-pressed`. Both states toggle the same boolean. | Labeled/filled “Sidebar” Button; a second close X inside the inspector; separate open and collapse controls. |
| Global project/catalog home | TopAppBar leading ghost `IconButton` + `HomeIcon`, Tooltip and aria-label. Clicking shows the root/catalog in the same app shell. | Ordinary drawer/list item secretly routing to a different global page; a text Home pill; replacing the shell. |
| Back from a detail | One ghost `IconButton` + `ArrowLeftIcon` in TopAppBar leading; Tooltip + aria-label. | “← Projects” labeled Button, doubled arrows or a filled navigation CTA. |
| First navigation element | A localized “New <resource>” menu with `PlusIcon` and creation choices using `DropdownMenu`; use ghost/tonal emphasis. Chat's stock `NavigationDrawerNewChat` remains the chat recipe. | A product/domain slogan or redundant section heading above creation; creation only in the main toolbar. |
| Resource rename | Right-click the resource's `NavigationDrawerItem` → `ContextMenu` + `DropdownMenuItem` → rename `Dialog`. Capture the clicked resource id; never change the current selection on right-click. Support ContextMenu key and Shift+F10. | A rename pill/title Button in the canvas toolbar; left-click opening rename; a menu always acting on the selected resource instead of the target. |
| Routine object actions | One horizontal `Toolbar` / `.fynns-control-cluster`: ordering, duplicate and delete use ghost IconButtons + Tooltip + aria-label. If labels are needed, use ghost/tonal Buttons. Danger belongs in the destructive confirmation. | Full-width stacked primary/danger pills for ordinary inspector commands; all actions competing as primary; local accent/destructive fills. |
| Commit form changes | At most one primary per action group, rightmost. Dialog `feet` → `.fynns-control-cluster--end-align`: `CloseIcon` + labeled ghost Cancel, then `CheckIcon` + labeled primary Save. | Filled Cancel; Cancel and Save both primary; icon-only confirmation; footer actions in the scrolling body. |
| Visible chrome copy | Natural sentence case and localized human labels; preserve the conventional casing of technical abbreviations. | All-cap titles/overlines/section names or `text-transform: uppercase` / `toUpperCase()` to decorate UI. Code content and literal protocol/data values remain exact. |

The static `natural-case` gate leaves standalone one-to-three-letter uppercase
labels for copy review because they may be technical initialisms. This is a
limit of static detection, not permission to capitalize ordinary UI words.
Conventional metric/hardware labels `TTFT`, `GPU`, `VRAM`, `CPU`, `RAM` and
slash-separated combinations of those names retain their exact casing. This
explicit vocabulary does not exempt arbitrary uppercase words or headings.
Other longer or compound uppercase labels remain checked; use natural sentence case
for the surrounding human label (for example, “API settings”).

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

Dismissal and recovery have different jobs. For unavailable in-flow content,
use [SectionNotice](section-notice.md) when details/actions belong to one notice.
Its string slots and action descriptors keep consumer controls out of the body.
Existing simple recovery compositions may continue to
keep the persistent error visible and put Retry in a sibling action row; keep
its existing disabled state and callback. Use the stack in a canvas instead.

```tsx
<div className="fynns-unit-stack">
  <InlineAlert severity="error" message={errorMessage} />
  <div className="fynns-control-cluster">
    <Button variant="ghost" disabled={retrying} onClick={retry}>
      <RefreshIcon aria-hidden />{retryLabel}
    </Button>
  </div>
</div>
```

Never replace a Retry handler with `onDismiss`, clear a business error on close,
or remove recovery to pass a gate. Cancel in Dialog feet explicitly uses
`variant="ghost"`; the rightmost confirm action retains `variant="primary"`.

## Canvas tools and persistent notice stacks

Each canvas workspace has **one editing toolbar**. Document-level commands
(layout mode, layout direction, arrange once and export) belong in **one
TopAppBar ghost icon-only DropdownMenu** with `MoreHorizontalIcon`, Tooltip
and localized aria-label; use core submenus for choices/export formats. Do not
replace the removed large toolbar with a second floating toolbar, a row of
menu triggers, or duplicated commands in both surfaces. Editing tools stay in
the single canvas toolbar. Do not remove business functions to satisfy this rule.

Compose the main shell content as `.fynns-workspace-panes` containing the
`.fynns-workspace-canvas` and `EndAside` as siblings. This shared full-height
row begins directly below TopAppBar and ends at the workspace bottom (above
StatusBar when present). The desktop inspector's top and bottom align with the
canvas; no document toolbar row, header spacer or menu container precedes the
pane row or spans above the inspector. Menu popups are overlays and must not
change canvas/inspector bounds. Keep core's narrow-screen aside behavior.

Canvas tools are `Toolbar variant="floating"` inside `.fynns-workspace-tools`
over a `.fynns-workspace-canvas` host. The canvas is relative and retains its
full geometry; tools have **16dp** edge clearance and a ghost X. Keep a
top-bar ghost icon to restore closed tools. Never insert a full-width rounded
toolbar into page flow above the canvas or glue docked corners to neighboring
panes. In-flow tools belong to ordinary page content inside
`.fynns-docked-tools-inset`, which preserves **16dp on all four sides**.

Persistent actionable workspace errors use **`WorkspaceNoticeStack`** from
`@fynns/ui`, mounted inside the affected canvas. Core anchors it at top/end
(top right in left-to-right layouts), **16dp** from each edge. Cards align at the
end, hug their content, wrap within available width and stack with **16dp** gaps.
Each card owns its semantic icon, message, ghost X and ghost recovery actions.
Do not create a sibling retry/save toolbar. Ordinary operation errors continue
to use snackbar; plain non-actionable in-panel errors use InlineAlert.

Pass `notices: WorkspaceNotice[]`, localized `ariaLabel`, and `onDismiss(id)`.
Each notice supplies `id`, `severity`, `message`, localized `dismissAriaLabel`,
and optional `actions: { label, icon?, onClick, disabled? }[]`. Use a stable
condition/resource id: repeats update the existing card instead of flooding
the stack. Existing entries keep their arrival order; new entries append.
Keep the stack mounted when the array is empty, remove ids on dismissal, and
remove repaired conditions after the actual recovery succeeds. Presentation
dismissal must not reset unresolved business errors or resume paused saving.
Keep recovery reachable through an existing menu after the card is dismissed.

Core retains closing cards until their fade/height transition finishes, then
reflows the remaining stack. Entry, exit and reflow use motion tokens;
`prefers-reduced-motion` removes travel and skips delayed exit. Exiting controls
are inert and hidden from assistive technology. Closing a focused card moves
focus to another active notice, canvas tools or the focusable canvas host
(`tabIndex={-1}`). No focus is stolen when a notice appears.

The stack has a canvas-bounded `fynns-scroll` region for overflow. On squeezed
canvases core moves tools to the bottom/start so top/end notices do not collide.
Consumers must not copy positioning CSS, animation timers or private card styles.

## Enforcement and review

The existing installed `fynns-ui:gate` calls `check-ui-exports.mjs`, which also
runs [check-workspace-ui.mjs](../../scripts/check-workspace-ui.mjs) on consuming
JSX/TSX files. The parser uses TypeScript tooling from core or the consumer;
missing tooling fails with an install hint. The checker catches direct and
aliased controls, same-file action helpers, multiple primaries in a group,
labeled/filled sidebar/Home/Back chrome, filled Cancel, embedded InlineAlert
controls, direct width/alignment overrides, docked canvas tools inside the shared
overlay host (or with literal canvas-tools labels), and literal all-cap UI copy.
It also rejects multiple toolbars in a shared canvas and standalone command
toolbars in the shared pane row/canvas ClippedNavShell, including same-file
helpers. Conditional alternatives count as one surface. Unknown cross-file
wrappers and private layout classes still require rendered verification.

Consumer diagnostics distinguish `workspace-contract`, `workspace-tooling`,
`missing-exports`, `linked-core-missing` and `dev-cache` in the gate's JSON
`issues` array. A wrapper must show those diagnostics rather than describe every
exit 1 as stale core. Workspace violations require consumer source edits;
pulling core or skipping sibling sync does not repair them.

Existing consumers can explicitly run `check-ui-exports.mjs --target <app> --fix`
and review the diff. This migrates literal Cancel variants, bare text-only `div`
wrappers (including `fynns-unit-stack`) and simple,
unconditional InlineAlert retry rows, preserving callbacks, disabled state,
icons and localized copy. Dynamic variants, spreads, conditional recovery and
message slots remain manual migrations. It then runs the complete strict gate;
unresolved problems still exit 1. Checks without `--fix` never write source.
Keep the original tests and the gate enabled after migration.

After changing core contracts or migrating consumers, run a read-only preflight
against **every affected consumer package**, before declaring the update complete:

```sh
npm run check:consumers -- --target ../app-one/apps/web --target ../app-two/gui
```

The command runs the current core export/workspace/cache gate for each explicitly
named package, continues after failures, and exits nonzero if any package fails.
It never syncs core, installs dependencies or edits consumers. Core's own
`npm run check` cannot prove consumer compatibility; CI without sibling packages
still runs it independently. Follow preflight with each consumer's typecheck/build
and browser verification. A migrated alert is accepted only when its original
`inline-dismiss` violation disappears; details, styled wrappers and indirect
controls cannot be reported as a successful partial migration.

Static success is necessary, not sufficient: cross-file wrappers, dynamic props,
translated copy, navigation behavior, duplicate controls, CSS transforms and
rendered spacing require browser review. Check desktop + narrow viewport,
dark + light, long translated names, right-click on an inactive resource,
keyboard context menu, Dialog Cancel/Save, inspector open/close and both short
and wrapped notices. Never suppress the gate or rewrite tests to permit a bad UI.
Core geometry and interactions are covered by workspace/InlineAlert treaty e2e.
Canvas e2e additionally verifies top/end placement, stacking, independent
recovery, deduplication, animated middle dismissal, focus and reduced motion.
Verify one editing toolbar, working document menu/keyboard submenus, and desktop
canvas/inspector edges aligned below the top bar before and after menu opening.
Agent review uses the positive evidence rubric in
[UI reward signals](../../llm/UI_REWARD_SIGNALS.md): aim for 10/10; hard-rule
failures cannot be compensated by decorative polish.
