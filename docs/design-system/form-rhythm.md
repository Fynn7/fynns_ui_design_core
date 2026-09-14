# Form rhythm (toolbar, FieldStack, inset)

← back to [Design system index](../DESIGN_SYSTEM.md)

## Toolbar / unit rhythm

Prefer these over ad-hoc `--fynns-space-*`:

Inside a padded `Surface` / `Card` strip that is **name + ToggleGroup/Switch +
action + supporting timestamp**, use `ControlStack` + `ControlRow` +
`.fynns-control-cluster` + `ControlBlock` `description` — do **not** hand-roll
flex that stacks name+hint on the left while controls float mid/right.
**Single-row `ControlBlock`:** the hint docks in the **label column** of the
same row unit (may wrap inside that column on a narrow window); the ToggleGroup
/ cluster is **vertically centered** on name + hint. Do **not** let FieldHint
become a full-bleed next row (empty band to the right of the timestamp,
controls look top-heavy). Do **not** stuff the timestamp into `ControlRow`
`label`. Padded `Surface` is a **form host** (same label-fill + end-hug as Card
body). Live: Globals `#rhythm`. Pasteable recipe:
[`llm/consumer-cursor-rule.mdc`](../../llm/consumer-cursor-rule.mdc).

| Role | Token / host |
| --- | --- |
| Between ControlRows (toolbar) | `--fynns-layout-control-stack-gap` (**8dp**) |
| Between ControlRows (form-host) | `--fynns-layout-control-stack-form-gap` (**12dp**) |
| Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
| Label above controls (narrow) | `--fynns-layout-control-row-gap` |
| Sibling IconButtons in one cluster | `--fynns-layout-control-cluster-gap` (**4dp**). List short text meta → first `--with-end` IconButton uses optical `--fynns-list-end-actions-gap` (≥ **0.5.62**) |
| Labeled Buttons in one cluster / Dialog foot | `--fynns-layout-action-cluster-gap` (**8dp**, ≥ **0.5.52**/80) |
| TopAppBar IconButtons + NavigationRail destinations | `--fynns-layout-chrome-icon-gap` |
| Control → supporting / error hint; FieldBlock control→FieldHint | `--fynns-layout-field-hint-gap` (**8dp**) |
| FieldHeader / FieldBlock label→control | `field-label-control-gap` (**12dp**) |
| FieldHeader label row with trailing sm IconButtons | `field-header-action-row-min-height` (**32dp**); any label-row actions in a FieldStack → all headers share the band |
| Related FieldBlocks in FieldStack | `field-stack-gap` (**12dp**); +description → 16dp; +cluster → 32dp |
| Sibling ControlBlocks in FieldStack | visual **16dp** (`unit-stack-gap`) |
| Adjacent FieldStacks (fields → switches) | `form-cluster-gap` (**32dp**) + Divider |
| Unit siblings / `.fynns-unit-stack` | `unit-stack-gap` (**16dp**) |
| Nested surface frames (`chrome="plain"`, `.fynns-nest`) | `nest-gap` |

## FieldStack semantic clusters

When building inspector / settings / Dialog / multi-section forms, **partition
by meaning** with `FieldStack` — do not leave every FieldBlock / ControlBlock as
a flat Card-body sibling.

- **Same kind → one `FieldStack`:** consecutive related Input/Select/Textarea/
  Otp FieldBlocks, **or** same-kind choice cluster (Radio / Checkbox / Slider
  under FieldBlocks), **or** Preference ControlBlocks (Switch + note). Inside:
  plain FieldBlocks keep `field-stack-gap` (**12dp**); with description/error →
  next sibling `unit-stack-gap` (**16dp**); host a `.fynns-control-cluster` →
  next sibling `form-cluster-gap` (**32dp**); sibling ControlBlocks →
  `unit-stack-gap`. Choice lists use `.fynns-control-cluster--stack` (not bare
  radios in form-host ControlStack — that grid auto-flows into label|control
  columns). Stack rows share a dense 2rem min-height floor; taller children
  win. Radio **Other** + free-text Input `sm` →
  `.fynns-control-cluster--choice-extra` (same-row; keep Input mounted —
  `disabled` when Other is not selected).
- **Kind jump → adjacent FieldStacks + Divider (strongly recommended):** e.g.
  identity → choices → preference switches. Between stacks: `form-cluster-gap`
  (**32dp**) **and** a horizontal `Divider`.
- **Control + its narrative** stay one unit → `ControlBlock` (`description` /
  `errorText`). Never a loose muted `<p>` under ControlStack.
- **Copy the tree** from sandbox `#form-recipe` (same FieldStack body under
  Card, Collapsible, and dismissible Dialog).
- **Multi-column FieldBlocks** → `FieldStack` → `Grid` `x={2}` (or more). Core
  Grid is **top**-aligned (`align-items: start` ≥ **0.5.172**) so a taller
  sibling (or consumer `center` override) does not mid-park a short FieldBlock.
  Select shell stays 40dp with a **portaled** menu (≥ **0.5.208**). Fixed-`x`
  fills the parent with equal `1fr` tracks (≥ **0.5.211**) — not a
  `max-content` island. **No other variant** for this recipe (`equalCells` /
  hug / private CSS). Live `#form-recipe` / `#sandbox-field-stack-grid-select`.

**Recipe (hard):** Switch (or other labeled row) **and** its narrative are
**one unit** → wrap in `ControlBlock`. On a **single** ControlRow, `description`
stays in the **label column**; controls vertically center on name + hint. Form
hosts (Card body, padded Surface, centered Dialog, Collapsible body **direct**
ControlStack/ControlBlock): ControlStack is label-fill (`1fr`) + end-hug
controls (`max-content`) so Switch tracks share one trailing edge; form-host
row gap = `control-stack-form-gap` (**12dp**). Probe / path / outcome meta
stacks opt in with `controlsAlign="start"` (≥ **0.5.154**) so value cells
share a start edge — live `#provider-settings` for a single active status
row (no multi-kind probe wall in Globals). **Action / Button
clusters stay end by default** (≥ **0.5.158**) — start packing is never the
default for CTAs. Toolbar stacks outside those
hosts keep `control-stack-gap` (**8dp**). Live `#rhythm` + `#form-recipe`.

## Inset decision tree

Panel shells (Collapsible, Drawer, Card): equal outer
inset via `--fynns-layout-content-inset` (18dp) on the **inline** edges of heads
/ `chrome="card"` bodies. Collapsible / Card `chrome="card"` body also uses
`content-inset` for **block** pad and stacks direct children with
`unit-stack-gap`. **`Surface` `padded`** (≥ **0.5.157**): equal `content-inset`
on **all** edges — same as Card body; never mix `content-pad-block` or rem/`px`.
Nested surface-owning child → **`chrome="plain"`**: body pad =
`content-inset`; column gap = `nest-gap` so the child reads as a secondary inset
frame — **plain ≠ flush** (never cancel with negative margins, zero body pad, or
restyling `.fynns-*`). Custom hosts outside Card/Collapsible → **`.fynns-nest`**
(same nest-gap). Card / Collapsible heads share one `min-height`; trailing head
actions keep `space-xs` block pad so IconButton hover disks clear the edge. Do
**not** add a second padding wrapper inside those shells. Stack siblings
(section label → InlineAlert → next block) with `unit-stack-gap` — never ad-hoc
rem margins.

Long-strip / `radius-3xl` text chrome (Banner, InlineAlert, Snackbar,
ChatComposer text edge) → `--fynns-layout-strip-pad-inline` (20dp). Capsule
chrome (SearchBar beside IconButtons) →
`--fynns-layout-capsule-chrome-pad-inline` (4dp) — **not** ChatComposer shell
pad. Chat conversation column (thread + composer outer) → `dialog-inset` via
`--fynns-chat-thread-pad-inline`; composer inset **must** alias the thread
token so bubble end and composer shell end stay one vertical line. Form fields:
`Input` / field-shell **text** edges = `capsule-chrome-pad-inline` +
`field-pad-inline` (4+12dp) so text start matches densified Select /
Autocomplete; an affix-owned edge drops to capsule-chrome only (≥ **0.5.237**).
Textarea adds `field-pad-block` (12dp) and default autoGrow (soft cap
`--fynns-layout-textarea-max-height` ≥ **0.5.103**). Centered Dialog /
ConfirmDialog: head/foot/body **inline** `dialog-inset` (24dp); form hosts fill
the `size` ceiling (prefer `size="lg"` for tall inspectors); ControlStack-only
bodies stay content-fit. FullscreenDialog inherits content-inset on head/body —
**flush-start** when the first body child (or one unpadded fill wrapper’s first
child) is a bordered well (`CodeBlock` / `Surface` / `.fynns-table-wrap`) — live
`#fullscreen-flush`. BottomSheet: asymmetric `sheet-pad-*` (M3 block≠inline);
no header|body divider (handle is enough). Do not invent rem literals for shell
**outer** insets (inter-section optical pads like head+body `space-sm` / foot
`space-lg` are the documented exception). Sandbox Layout chrome GUI edits these
via `SANDBOX_LAYOUT_AGENT_CATALOG` in `examples/sandbox/src/state/baseline.ts`.
