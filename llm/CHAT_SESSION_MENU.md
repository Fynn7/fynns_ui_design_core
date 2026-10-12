# Active chat session menu

Use `ChatSessionMenu` directly inside `Chat`, before `ChatThread`. It reserves
the top-right seat outside the scrolling log. In a FillColumn workspace with
its own TopAppBar, the trigger is portaled to the well edge: end inset matches
`--fynns-appbar-pad-inline`, and the gap below the bar matches
`--fynns-appbar-actions-gap`. Content padding stays intact. Standalone Chat
uses a 32dp trigger; shell chrome uses the same 40dp circular target as
TopAppBar, so both the hover radius and centerline match. TopAppBar normalizes
wrapped IconButton/menu actions to this target, including explicit sm/lg props.
Do not add private width, height, padding or transforms to chrome buttons.
Standalone Chat and aside hosts retain their 16dp internal seat.
Core owns the ghost ellipsis trigger, Tooltip, menu surface, nested positioning,
keyboard navigation, focus return and dismissal. No consumer positioning CSS
or extra toolbar is needed. The same shell works in the main canvas and EndAside.

```tsx
import {
  Chat, ChatSessionMenu, ChatThread, ChatComposer,
  DropdownMenuSub, DropdownMenuItem,
} from "@fynns/ui";

<Chat>
  <ChatSessionMenu
    activeSessionId={activeSessionId ?? null}
    label="Chat session options"
    disabled={sessionBusy}
    renderMenu={(sessionId) => (
      <DropdownMenuSub trigger="Export chat as…">
        <DropdownMenuItem onClick={() => exportChat(sessionId, "md")}>
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportChat(sessionId, "json")}>
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuSub>
    )}
  />
  <ChatThread>{messages}</ChatThread>
  <ChatComposer {...composerProps} />
</Chat>
```

- Localize `label` (both tooltip and accessible name) and menu copy.
- `activeSessionId` targets the active conversation, not sidebar multi-selection.
  Null disables the trigger and does not call `renderMenu`.
- Changing the ID or disabling the component unmounts the previous menu tree.
  Bind actions to the `sessionId` supplied to `renderMenu` and take the correct
  session's message snapshot. Consumers own export serializers, downloads,
  errors, persistence and extra items/separators/submenus.
- Keep Rename in the target navigation item's keyboard-accessible context menu.
- A null/false menu body disables the trigger. Omit the component entirely if
  this surface has no session actions. Mount only one per Chat.
- Keep existing ChatThread/composer sizing, scrolling and empty/loading/error
  states; the menu is a direct sibling, not part of ChatThread or TopAppBar.

Live examples: sandbox `#layouts-demo-chat-product` and
`#layouts-demo-chat-aside`. The product example downloads sample Markdown/JSON;
its Archive row only demonstrates a callback request, without persistence.
See [catalog](../docs/design-system/catalog.md).

Alignment reference: `#layouts-demo-chat-session-menu` includes the owning
TopAppBar. `e2e/treaty/chat-session-menu-chrome.spec.ts` verifies the shared
vertical centerline, matching bar/action spacing, unchanged well bounds,
keyboard focus return, dark/light themes, narrow shell and reduced motion.
The standalone and FillColumn inset regressions remain unchanged.

UI review for this menu scope: **10/10** — ghost emphasis (2), one session menu
without extra toolbar (2), shared chrome spacing/alignment (2), stable geometry
and session-scoped actions (2), core keyboard/focus and theme/width checks (2).
Message/composer well padding remains intact; no consumer CSS patch is needed.
