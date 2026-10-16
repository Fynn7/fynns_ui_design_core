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

**Preference rows with help:** use `ControlStack columns={1}` and one
`ControlRow` per preference. Put visible text (a custom label may use
`OverflowTip`) and `InfoHint size="sm"` in `label`; put only the track-only
`Switch` in `children`. Core reserves a separate label-end track for the help
target, centers it on its own row, and wraps long text inside the remaining
label space. All help targets and switches then share their respective edges.
Choose a Dialog `size` that lets most labels read comfortably (`md` for a
multi-row settings panel with longer labels); the size is a ceiling, so text
must still reflow at smaller viewports. Do not solve collisions by absolute
positioning, negative margins, hidden overflow, or a consumer override of
`.fynns-*` geometry. Check rendered rectangles at the narrowest supported
viewport and with longest localized labels: label, help target, Switch, panel
edges, and adjacent rows must not intersect. Live:
`#sandbox-control-row-tip-wrap` / `#sandbox-control-row-tip-switch-narrow`.

| Role | Token / host |
| --- | --- |
| Between ControlRows (toolbar) | `--fynns-layout-control-stack-gap` (**8dp**) |
| Between ControlRows (form-host) | `--fynns-layout-control-stack-form-gap` (**12dp**) |
| Label \| controls (horizontal) | `--fynns-layout-control-row-column-gap` |
| Label above controls (narrow) | `--fynns-layout-control-row-gap` |
| Sibling IconButtons in one cluster | `--fynns-layout-control-cluster-gap` (**4dp**). List short text meta → first `--with-end` IconButton uses optical `--fynns-list-end-actions-gap` (≥ **0.5.62**) |
| Labeled Buttons / Menu triggers in a Toolbar, cluster or Dialog foot | `--fynns-layout-action-cluster-gap` (**8dp**, ≥ **0.5.52**/80) |
| TopAppBar IconButtons + NavigationRail destinations | `--fynns-layout-chrome-icon-gap` |
| Control → supporting / error hint; FieldBlock control→FieldHint | `--fynns-layout-field-hint-gap` (**8dp**) |
| FieldHeader / FieldBlock label→control | `field-label-control-gap` (**12dp**) |
| FieldHeader label row with trailing sm IconButtons | `field-header-action-row-min-height` (**32dp**); any label-row actions in a FieldStack → all headers share the band |
| Related FieldBlocks in FieldStack | `field-stack-gap` (**12dp**); +description → 16dp; +cluster → 32dp |
| Sibling ControlBlocks in FieldStack | visual **16dp** (`unit-stack-gap`) |
| Adjacent FieldStacks (fields → switches) | `form-cluster-gap` (**32dp**) + Divider |
| Unit siblings / `.fynns-unit-stack` | `unit-stack-gap` (**16dp**) |
| Nested surface frames (`chrome="plain"`, `.fynns-nest`) | `nest-gap` |

**Action row (hard):** use `Toolbar` for docked or floating tools and
`.fynns-control-cluster` for other action groups. If a row contains any
labeled Button or DropdownMenu trigger, the whole row uses
`--fynns-layout-action-cluster-gap` (**8dp**) in both directions, including
Button↔Menu, Button↔IconButton and wrapped Tooltip triggers. Icon-only rows
use `--fynns-layout-control-cluster-gap` (**4dp**). Core owns these gaps;
never use private 0/2/4dp action containers, per-button margins or outer
Toolbar `gap` overrides. SplitButton's joined internal segments remain
flush; neighboring independent controls still need 8dp. On narrow hosts,
wrap or adapt the composition instead of compressing the gap. Live:
`#sandbox-action-spacing`.

**Drawer title boundary (hard):** a title line box clears the sheet's top
edge / app-bar divider by `--fynns-navdrawer-title-edge-inset`
(aliases `dialog-inset`, **24dp**). An internal Divider→section title uses
`--fynns-navdrawer-title-divider-gap` (aliases `unit-stack-gap`, **16dp**).
Core counts sheet/body/headline padding once; destination Item↔Item remains
4dp and tools↔destinations remains 8dp. Use `NavigationDrawerHeadline`
for a static body section title, Group for a collapsible section. Reserve
sheet `headline` for standalone drawers; omit `drawerHeadline` on
DestinationAppShell where TopAppBar already owns the title. Do not add bare
headings, negative margins or reset drawer body/headline padding. Live:
`#sandbox-navdrawer-title-spacing`.

## FieldStack semantic clusters

Categorized settings use the shared two-pane dialog recipe in
[Settings](settings.md), live `#layouts-demo-settings-dialog`. Keep preference
rows compact and path drafts independent of category navigation.

**Input decorative leading glyph:** pass the standard glyph through `leading`.
Core reserves 16dp from the shell's inner edge to the glyph and 16dp from glyph
to text, including when a trailing Save action is present. An IconButton owns a
32dp hit target and retains the 4dp capsule edge; a bare decorative SVG gets its
own inner field padding. Do not use a consumer margin or pad the icon manually.
Live: `#input` and Settings → Advanced; geometry regression also checks the
standalone Input sample so the rule is not limited to the settings prototype.

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
`Surface` defaults to **unpadded** for canvas / iframe wells. A saved-text
preview or form inside a Surface must opt into `padded`: rounded overflow
otherwise clips edge glyphs and leaves labels/actions against the frame.
Use `.fynns-content-flow` for preview prose so wrapped lines inherit
`--fynns-line-height-body`; keep labels/actions outside text-selection wrappers.
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
ConfirmDialog: head/foot/body **inline** `dialog-inset` (24dp); non-confirm
head **block-start** = `content-inset` (18dp, ≥ **0.5.280**) so title ink
matches body-end / trailing primary IconButton; form hosts fill
the `size` ceiling (prefer `size="lg"` for tall inspectors); ControlStack-only
bodies stay content-fit. FullscreenDialog inherits content-inset on head/body —
**flush-start** when the first body child (or one unpadded fill wrapper’s first
child) is a bordered well (`CodeBlock` / `Surface` / `.fynns-table-wrap`) — live
`#fullscreen-flush`. BottomSheet: header outer block-start aliases
`sheet-actions-pad-bottom` (24dp, ≥ **0.5.281**) so title matches primary
action bottom; `sheet-pad-*` still asymmetric inline≠block (M3); no header|body
divider (handle is enough). Do not invent rem literals for shell
**outer** insets (inter-section optical pads like head+body `space-sm` / foot
`space-lg` are the documented exception). Sandbox Layout chrome GUI edits these
via `SANDBOX_LAYOUT_AGENT_CATALOG` in `examples/sandbox/src/state/baseline.ts`.
