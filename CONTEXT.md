# Fynns UI language

Shared visual dialect: what a screen *is*, not how React/CSS implements it.
Implementation authority: [`AGENTS.md`](AGENTS.md).

## Parties

| Term | Meaning | Avoid calling it |
| --- | --- | --- |
| **Core** | Design-system source of truth (tokens + keep-set) | theme kit, submodule copy |
| **Consumer** | Product that uses Core via props / slots / labels only | host, fork |
| **Sandbox** | Teaching surface with generic placeholders | live product demo |

## Visual vocabulary

| Term | Meaning | Avoid |
| --- | --- | --- |
| **Token** | Named `--fynns-*` step | hex, raw px, private `*-radius` |
| **Keep-set** | Public primitives demoed in Sandbox | Material dump, synonym control |
| **Primitive** | One named keep-set control | native `<select>` / `<dialog>` / `alert()` |

## Places on a screen

| Term | Meaning | Avoid |
| --- | --- | --- |
| **Destination** | App-level nav place (drawer / rail / bar) | tree node, settings outline in nav |
| **Explorer tree** | Path outline (`Tree`) | NavigationDrawer-as-filesystem |
| **Status tree** | Chat turn multi-step status (`ChatActivity`) | Explorer tree |
| **Catalog** | Record collection (`List` / `Timeline`) | one Card per entry |
| **Inspector** | End-edge supporting pane (`EndAside`) | Drawer, in-content Split |
| **Split** | In-content resizable panes (`SplitPane`) | Inspector / destination seam |
| **Content sheet** | Modal side/bottom task sheet | NavigationDrawer, EndAside |

## Strips and wait states

| Term | Meaning | Avoid |
| --- | --- | --- |
| **Status strip** | Thin IDE bottom edge (`StatusBar`) | BottomAppBar, Banner |
| **Pagination footer** | One horizontal page-size + range + pages row | stacked pager column |
| **Busy** | Known wait with one progress chrome | Empty-as-loading, twin progress |
| **Empty** | Zero-result catalog | loading shell |

## Form vs chrome

| Term | Meaning | Avoid |
| --- | --- | --- |
| **Field cluster** | Same-kind form units (`FieldStack`) | flat mixed Card |
| **Chrome list** | Dense command/filter/menu list | form FieldStack rhythm |

## Architecture seams (implementation)

Module names that keep Core navigable — **not** public Consumer APIs.

| Seam | Role | Avoid |
| --- | --- | --- |
| **Overlay frame** | Shared presence (`DialogFrame`) | copy-paste presence per overlay |
| **Floating placement** | Flyout geometry (`floatingBox`) | revived public Popover |
| **Form rhythm sheet** | Field/Control gaps (`form-rhythm.css`) | empty TSX for CSS-only hosts |
| **Destination geometry** | Crowding lengths without probes (`layoutMeasure` / `PERF.md`) | probes under shell MutationObserver |
| **Status-tree timing** | ChatActivity open/settle policy | timing only in untested effects |
| **Catalog row geometry** | Trailing-action vs decorative (`catalogRowGeometry`) | List ticks as fake Timeline |
