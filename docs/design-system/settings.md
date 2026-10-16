# Categorized settings

← back to [Design system index](../DESIGN_SYSTEM.md)

Use an inset, centered `Dialog className="fynns-settings-dialog"` for a small
set of device preferences with categories. This is a focused settings surface;
feature catalogs remain destinations in the application shell. The dialog owns
one visible title and one close action. Keep the existing settings entry point.

Live prototype: Layout templates → Settings dialog,
`#layouts-demo-settings-dialog`. Source:
[SettingsDialogDemo.tsx](../../examples/sandbox/src/components/SettingsDialogDemo.tsx).

## Composition contract

- `Dialog` → `.fynns-settings-layout` → `nav.fynns-settings-nav` and
  `section.fynns-settings-content`. Existing `NavigationDrawerItem` buttons
  select categories and expose `aria-current`. Label the navigation and connect
  the content section to its visible `.fynns-settings-heading` with
  `aria-labelledby`. Use ordinary Tab/Enter/Space navigation; these are navigation
  buttons, not ARIA tabs.
- Desktop: a restrained navigation column and one flexible settings column.
  The shared `settings-dialog-width`, `settings-nav-width`, and
  `settings-content-min-height` layout tokens keep the surface stable between
  categories. At 640px and below, navigation becomes a wrapping top row.
  The built-in `fynns-scroll` dialog body keeps all content reachable on short
  screens. Do not add consumer `.fynns-*` overrides or fixed screen dimensions.
- General preferences use `FieldStack.fynns-settings-rows` with a `ControlBlock`
  per setting. Put the visible label in `ControlRow`, a short explanation in
  `ControlBlock.description`, and the compact control in its trailing cell.
  Core owns row separators and spacing. Language uses a compact, content-hugging
  binary `ToggleGroup`; avoid full-width language strips and one Card per option.
- Startup readiness belongs in the same row as the preference, through
  `InfoHint size="sm" icon={<CheckIcon aria-hidden />}` on the label. Explain
  an unavailable platform beside a disabled Switch. Never claim readiness
  before the server confirms the startup entry exists; pending is informational.
- Advanced paths use `FieldStack` / `FieldBlock` and a full-width Input.
  Put a ghost `size="sm"` Save icon with Tooltip and `aria-label` in Input's
  `trailing` slot. Render the effective path separately using
  `.fynns-settings-meta`; wrap long paths without horizontal page scrolling.
  Keep a blank configured path distinct from its effective default.

## State and behavior

Language and startup preferences save immediately. Disable conflicting writes
while pending, update only the requested field, and roll back optimistic state
on failure (including the document language). Announce errors with snackbar.
Preserve server platform support, actual startup readiness and diagnostic paths.
Before disabling the focused control, move focus to the still-mounted dialog;
after IO, restore it only if the user has not navigated elsewhere. When Save
becomes disabled because the draft is clean, return focus to the Input. Escape
must remain available during and after saving.

Path edits are drafts until explicit save. Keep drafts when switching categories
and after failed requests; update the effective path only after success. Keep
save disabled when unchanged. Define a deliberate draft policy for dismissal;
the prototype retains drafts on close/reopen for its mounted lifetime.

Keep known category headings, row labels and explanations mounted during cold
loading. Each control uses its own transparent `BusyRegion` text skeleton in
the future control footprint. Keep navigation and the same scrolling body
mounted. Loading has no visible copy or spinner. A fetch failure keeps retry
and dismissal available. A blank path uses the default location rather than an
empty-state page. Production IO also needs cancellation, a bounded timeout,
cached data retention, and protection against stale reloads overwriting drafts.

The sandbox uses fake asynchronous IO and an isolated language preference.
It does not call a consumer API or change the sandbox chrome language. Scenario
controls outside the dialog exercise cold loading, fetch failure/retry,
unsupported startup, and one-shot save failure. They are demonstration controls,
not product settings.

## Reference and validation

This composition borrows the consistent label/supporting-text/trailing-control
hierarchy from [M3 lists](https://m3.material.io/components/lists/overview) and
categorized settings from the official
[ChatGPT language settings example](https://help.openai.com/en/articles/8357869-how-to-change-your-language-setting-in-chatgpt).
Colors, components, geometry and interaction remain the core design system.

Browser coverage lives in
[settings-dialog.spec.ts](../../e2e/treaty/settings-dialog.spec.ts): both themes,
1440/390/320px widths, short viewport scrolling, category/draft persistence,
effective-path save and retry, optimistic rollback, successful immediate saves,
transparent loading slots, platform support, focus trap/return and reduced motion.

Settings-surface review against [UI reward signals](../../llm/UI_REWARD_SIGNALS.md)
(canvas-only toolbar/notice criteria do not apply to this modal):

| Signal | Score | Rendered evidence |
| --- | --- | --- |
| Clear hierarchy | 2/2 | One title, one close action, one active category; compact controls and ghost path Save. |
| Useful surfaces | 2/2 | Navigation and settings content only; no option Cards or detached startup-status row. |
| Spacing and alignment | 2/2 | Desktop side-by-side panes; top navigation on narrow screens; no label/control intersections at 1440/390/320px. |
| Complete behavior | 2/2 | Stable panel width/height, draft preservation, real effective-path transition, failed-save rollback/retry and unsupported state. |
| Shared and accessible | 2/2 | Shipped CSS/tokens and existing primitives; both themes, keyboard trap/return, Escape after save and reduced motion verified in the browser. |

Settings composition: **10/10**, with no hard-contract violations found in the
covered states. Screenshots are generated under `.tmp/settings-validation/` by
the browser suite. This review covers the prototype; consumers must independently
verify their real backend integration after migration.
