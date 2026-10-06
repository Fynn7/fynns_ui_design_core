# List selection and context menus

Use `@fynns/ui` selection primitives for selectable datasets. No document-wide
shortcut listener, private modifier-key state machine, menu coordinates, or row
selection CSS in consumers. Public API lookup:

```sh
node scripts/api.mjs SelectionArea
node scripts/api.mjs useListSelection
node scripts/api.mjs ChatSessionsDrawer
```

Live: `#sandbox-list-selection` / `#layouts-demo-list-selection`, and
`#sandbox-chat-sessions-drawer` / `#layouts-demo-chat-sessions-drawer`.

## Scope and gestures

- Selection acts on a **dataset**, never on all buttons / controls in a page.
  `items` is the full ordered current source / filter result, including rows
  hidden by pagination or collapsed groups. IDs must be unique within a scope.
- Ctrl / Cmd+A selects all enabled IDs in the **focused scope**. No listener
  is installed on document. Unrelated scopes stay unchanged. Inputs, textarea,
  select, textbox roles and contenteditable descendants keep their native
  editing shortcuts and context menus.
- Ctrl / Cmd click toggles one row. Shift click replaces selection with the
  anchor-to-target range. Ctrl / Cmd+Shift click adds that range. These gestures
  prevent normal row activation; the open conversation / destination does not
  change. Range order is the provided dataset order. Disabled items are skipped.
- Plain row click selects that row and preserves its ordinary activation.
  Ctrl / Cmd+Space toggles the focused row. Escape first dismisses a menu, then
  a subsequent Escape in the scope clears selection.
- Right-click a selected row retains the selection; right-click another row
  selects only that row without activating it. More uses the same rules and
  menu renderer. Shift+F10 / Menu key opens the same menu at the focused row.
- Selection and `active` / `aria-current` are independent. `getItemProps`
  supplies `aria-pressed` and core selection styling. Do not set destination
  `active` for every selected row or use `ListItem.selected` to mark multiple
  current destinations.
- `resetKey` clears selection, range anchor and menus when source / filter /
  workspace identity changes. Prune removed or disabled items automatically.
  A new row added after Ctrl+A is not silently added to the selection.

## Flat session drawer

`ChatSessionsDrawer` includes the gestures by default. Pass the full session
array, never slice the dataset before the drawer. `reveal` controls rendering;
selection covers all `sessions`.

Keep `activeSessionId` for the open conversation. Optionally pass controlled
selection through `selection={{ selectedIds, onSelectionChange, resetKey }}`.

For the built-in batch deletion, pass **both** `labels.deleteSelected` and
`onDeleteSelected(ids)`. The callback requests a mutation; consumers still own
confirmation, persistence, loading and error feedback. `onDeleteAll` remains
distinct. Ctrl+A is the bulk selection path, even for a one-item dataset.
Without a configured bulk action, the drawer suppresses the bulk menu; it
never falls back to deleting only the clicked row.

For custom actions use `renderMenu(context)` and core `DropdownMenuItem` /
`DropdownMenuSeparator`. Return null to suppress unsupported menus. Context:

| Field | Contract |
| --- | --- |
| `kind` | `item`, `selection`, or `area`; full selection uses `selection` |
| `trigger` | `context` (right-click / keyboard) or `more` |
| `targetId` | Row opening the menu; null for area / toolbar |
| `selectedIds` | Captured action targets in dataset order; empty for area actions |
| `allSelected` | Whether the selection covered every enabled dataset ID at opening |

Do not branch bulk behavior on `selectedIds.length > 1` alone: Ctrl+A of a
one-item dataset still has `kind="selection"`. Capture these IDs in pending
confirmation state. Revalidate targets before persistence; never substitute
the active conversation's detail or a freshly expanded full dataset.

## Lists and grouped navigation

`SelectionArea` supplies bindings without adding a layout wrapper:

```tsx
<SelectionArea
  items={rows}
  label={labels.list}
  moreLabel={labels.more}
  resetKey={sourceKey}
  renderMenu={(context) => (
    <DropdownMenuItem onClick={() => requestAction(context.selectedIds)}>
      {context.kind === "selection" ? labels.batchAction : labels.singleAction}
    </DropdownMenuItem>
  )}
>
  {(scope) => (
    <div {...scope.areaProps}>
      <List>
        {rows.map((row) => (
          <ListItem
            key={row.id}
            {...scope.getItemProps(row.id)}
            headline={row.label}
            interactive
            disabled={row.disabled}
            onClick={() => activate(row.id)}
            trailing={scope.menuTrigger(row.id)}
          />
        ))}
      </List>
    </div>
  )}
</SelectionArea>
```

For grouped sidebars pass `scope.areaProps` through
`NavigationDrawer bodyProps={scope.areaProps}`. Keep the existing
`NavigationDrawerGroup` hierarchy; bind each selectable row using
`getItemProps(id)` and `menuTrigger(id)`. Include the enabled descendants in
the full `items` dataset even while their groups are collapsed. The drawer
retains core scroll geometry, direct child spacing and footer pinning.

Custom hosts can use `useListSelection` directly (`selectOnly`, `toggle`,
`selectRange`, `selectAll`, `replace`, `clear`); prefer `SelectionArea` when
menus or DOM shortcut arbitration are needed. Scope only eligible data rows,
not headings, search controls or account/footer actions.

For mixed capability sources, `renderMenu` only shows supported actions.
Read-only rows may still be selected for copying / exporting. Do not wire
no-op rename/delete callbacks or represent local aliases/hiding as mutations
of the underlying source. Batch export/copy operates on exact captured IDs;
batch deletion needs one confirmation and explicit failure reporting, and
must not leave failed IDs reported as deleted.
