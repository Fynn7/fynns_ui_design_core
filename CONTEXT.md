# Fynns UI language

The shared visual dialect every consuming product must speak: what a screen *is*,
not how React or CSS implements it.

## Parties

**Core**:
The one design-system context. Public language, keep-set, and tokens live only here.
_Avoid_: theme kit, component library dump, submodule copy

**Consumer**:
A product that uses Core by labels, slots, and props. It does not author a second visual language.
_Avoid_: host, client app, downstream fork

**Sandbox**:
The teaching surface that shows every public primitive with generic placeholders — never a real product screen.
_Avoid_: live app demo, consumer screenshot as spec

## Visual vocabulary

**Token**:
A named step in the `--fynns-*` language (color, space, type, radius, motion).
_Avoid_: hex, raw px, private `--fynns-<control>-radius`

**Keep-set**:
The closed catalog of primitives that are public because they are demonstrated in Sandbox. Absence from Sandbox means absence from the language.
_Avoid_: full Material dump, one-off wrapper, synonym control

**Primitive**:
One named keep-set control (Button, Tree, StatusBar, …).
_Avoid_: widget, third-party equivalent, native `<select>` / `<dialog>` / `alert()`

## Places on a screen

**Destination**:
An app-level place the person navigates *to* (drawer / rail / bar items). A destination is a short name. Sitting in the start column does not make a file outline a destination.
_Avoid_: tree node, list row, settings outline, project files in NavigationDrawer

**Explorer tree**:
A path-shaped nested outline (`Tree` / `TreeItem`): folders and leaves that look like a filesystem (or any nested path resource). Rare and special — expand/select apply to resource nodes, not destinations and not catalog records.
_Avoid_: Hierarchy (old name), NavigationDrawer group-as-filesystem, List-detail as explorer, Status tree, ordinary settings section lists

**Status tree**:
The collapsible multi-step status of one Chat turn (`ChatActivity`). People may say “tree”; it is still a Status tree, never an Explorer tree.
_Avoid_: Explorer tree, Hierarchy, destination group, session Catalog

**Catalog**:
A collection of records (paths, sessions, bookmarks): name + supporting line, optional row actions, optional in-row disclosure of nested records (`ListItem` `detail` — session / turn / nested table).
_Avoid_: one padded card per entry, Explorer tree, destination list

**Inspector**:
The end-edge supporting pane for the current selection (width morph, not a modal sheet).
_Avoid_: Drawer, sidebar, in-content Split

**Split**:
Two in-content panes the person resizes (editor | preview, list | detail). Not shell chrome.
_Avoid_: Inspector, destination seam, nested Card split

**Content sheet**:
A modal side or bottom sheet for a task (filters, a form, a short flow). Not the destination column and not the Inspector.
_Avoid_: NavigationDrawer, EndAside, StatusBar

## Strips and wait states

**Status strip**:
The thin IDE-style bottom edge (branch, diagnostics, encoding). Not actions, not severity.
_Avoid_: BottomAppBar, Banner, pagination footer

**Pagination footer**:
One horizontal table/list footer: page size, item range, and page numbers together.
_Avoid_: stacked pager, Select-then-pages column

**Busy**:
A known wait: fullscreen block or sectional overlay with one progress chrome. The surface behind stays visible.
_Avoid_: Empty as loading, skeleton panel, second progress nested in the message

**Empty**:
Zero results in a catalog. Never a stand-in for Busy.
_Avoid_: loading shell, tall vacant Card

## Form vs chrome

**Field cluster**:
Consecutive form units of the *same kind* (identity fields together, choices together, preference switches together), with a hard partition on kind jumps.
_Avoid_: flat Card of mixed fields, narrative `<p>` under a control

**Chrome list**:
A dense command, filter, or menu list with a named row model (single-line vs two-line). Type steps at most one shirt size inside one panel.
_Avoid_: form Field cluster rhythm, title two sizes above captions

## Architecture seams (implementation)

Names for **modules** that keep Core navigable. Not public Consumer APIs.

**Overlay frame**:
Shared presence lifecycle for centered and sheet overlays (`DialogFrame` module). Dialog / Drawer / BottomSheet / CommandPalette / date-time dialogs adapt at this **seam** — they do not each own enter/exit/focus trap.
_Avoid_: copy-paste presence in every overlay file, public Export of DialogFrame

**Floating placement**:
Pure geometry for anchored flyouts (`floatingBox` module). Tooltip and DropdownMenu are **adapters**; placement math is testable without React.
_Avoid_: revived public Popover primitive (purged), probes under observed shells

**Form rhythm sheet**:
CSS that paints Field cluster gaps and form-host ControlStack rhythm (`src/primitives/css/form-rhythm.css`). FieldStack / FieldBlock / ControlBlock stay thin React **adapters** over this sheet — do not invent empty TSX shells for CSS-only hosts.
_Avoid_: flat Card of mixed fields, private gap vars outside `--fynns-layout-*`

**Destination geometry**:
Length resolution for DestinationAppShell / ClippedNavShell crowding without measure probes under a subtree `MutationObserver` (`layoutMeasure` module — see `llm/PERF.md`).
_Avoid_: inserting probe nodes into the shell root, densify to unlabeled rail as DestinationAppShell default

**Status-tree timing policy**:
Pure open / settle / queue helpers for a Status tree (`chatActivityPolicy` module). ChatActivity keeps DOM, timers, and paint.
_Avoid_: embedding settle prediction only inside React effects with no tests
