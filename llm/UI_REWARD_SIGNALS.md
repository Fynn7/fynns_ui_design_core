# UI reward signals for agents

Use this rubric when building or refactoring a consumer UI. Prefer the approved
live recipes over inventing more chrome. Authority remains the hard contracts in
[Workspace chrome](../docs/design-system/workspace-chrome.md) and the sandbox.
These are agent review signals: award points from rendered evidence, not from
claims about cleanliness or from counting fewer lines of code.

## Positive signals (10 points)

| Reward | Points | Evidence required |
| --- | --- | --- |
| Clear hierarchy with restrained emphasis | 2 | Routine controls are ghost; at most one primary per group. Canvas and content remain visually dominant in dark and light themes. |
| Each surface has one useful purpose | 2 | Exactly one editing toolbar floats on the canvas with 16dp clearance. Document commands live in one top-bar menu. Inspector and canvas span the same full-height row below TopAppBar; menus preserve their bounds. Recovery actions and X belong to their notice. No extra toolbar, duplicate close control or decorative container. |
| Deliberate spacing and alignment | 2 | Icon rows 4dp, labeled rows 8dp, overlay/notice gaps 16dp. Icons/text/X share a centerline. Notices hug content, align at the top/end, wrap at narrow widths and avoid tools. |
| Stable and complete behavior | 2 | Showing/hiding feedback leaves canvas bounds unchanged. Multiple notices have stable ids, independent actions and dismissal, deduplication and bounded scrolling. Dismiss does not claim resolution; real recovery remains reachable. |
| Shared, accessible implementation | 2 | Use core APIs/classes and motion tokens. Browser evidence covers keyboard/focus, entry/exit/reflow, reduced motion, narrow widths and both themes. No private primitive CSS or copied animation timers. |

Award 2 only when the whole row is verified, 1 for partially verified evidence,
and 0 when unverified or wrong. A screenshot alone cannot prove interaction.
Record the score and evidence in the implementation's review/validation notes.
Target **10/10**; fix a lower score before calling the UI complete.

## Disqualifying signals

Any hard-contract violation makes the result **not accepted**, regardless of its
score: filled/labeled Home/Back/sidebar chrome; competing primaries; a rounded
docked toolbar glued to canvas edges; two canvas toolbars; a document toolbar
interrupting the inspector's top edge; duplicated recovery surfaces; full-width
error strips; missing error/loading/empty states; inaccessible actions; hiding
unresolved errors as successful recovery; suppressing gates; modifying tests to
approve defects; or bypassing core with local primitive styles.

Do not earn points by removing useful functions, making actionable errors
unreachable, shrinking hit targets, clearing meaningful state or hiding content.
Cleaner means fewer competing surfaces with complete behavior, not a blank UI.

## Approved reference and verification

- Canvas: `#layouts-demo-canvas-workspace` →
  [CanvasWorkspaceDemo.tsx](../examples/sandbox/src/components/CanvasWorkspaceDemo.tsx).
  Persistent feedback uses `WorkspaceNoticeStack` from `@fynns/ui`; geometry and
  motion ship with core, not the sandbox stylesheet.
- Navigation/context rename: `#layouts-demo-workspace-chrome` →
  [WorkspaceChromeDemo.tsx](../examples/sandbox/src/components/WorkspaceChromeDemo.tsx).
  Core rename dialog (double-click / `F2` on the destination):
  `#layouts-demo-nav-drawer-rename` →
  [NavDrawerRenameDemo.tsx](../examples/sandbox/src/components/NavDrawerRenameDemo.tsx).
- Plain persistent in-panel copy: `#sandbox-inline-alert-dismiss` → `InlineAlert`.
- Validate consumer export/workspace gates, types/build, desktop + narrow,
  dark + light, multiple notices, middle dismissal, keyboard and reduced motion.
  Attach real screenshots and state/geometry observations. Static success alone
  does not grant visual or behavioral points.
