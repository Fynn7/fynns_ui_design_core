# Chrome type & row proportion

← back to [Design system index](../DESIGN_SYSTEM.md)

Applies to filter lists, command palettes, menus, pickers, and similar **dense
chrome lists** (live reference: sandbox `#command-palette` vs Cursor Actions).
Form / Card rhythm stays under **Toolbar / unit rhythm**
([form-rhythm.md](form-rhythm.md)). Also
[`.cursor/rules/chrome-proportion.mdc`](../../.cursor/rules/chrome-proportion.mdc).

1. **Row model first.** Before CSS, name the **primary** row shape from the
   product reference (Cursor / ChatGPT / M3):

   | Primary model | Icon / trailing | Typical height |
   | --- | --- | --- |
   | **Single-line** (icon \| label \| shortcut) | Vertically **center** on the row | ~32–36dp (pad ~8dp block + `font-size-sm`) |
   | **Two-line** (label + description stack) | Icon / shortcut align to the **title line only** — not mid title+description | Grows from content + pad; label↔description ≥ `space-2xs` |

   Do **not** design for two-line then ship a single-line reference (or the
   reverse). Optional `description` is a **modifier** (`--described`), not the
   default when the reference is single-line.
2. **Type ladder — one step max.** In one panel, primary text and secondary
   captions may differ by **at most one** t-shirt step (`md`↔`sm` or
   `sm`↔`xs`). Command / Actions chrome: search + item label →
   `--fynns-font-size-sm` (14); group / description / shortcut →
   `--fynns-font-size-xs` (12). **Forbidden:** label `md` (16) next to group
   `xs` (12).
3. **Breath from in-row pad, not crushed gaps.** Prefer item `padding-block`
   (~8dp) so a single line clears ~32–36dp. Do **not** fake density with
   `gap: 0` between label and description under a large title, or rely on tiny
   inter-row gutters while starving in-row pad. Sibling rows may sit flush;
   selection pills carry separation (Cursor Actions).
4. **Shortcut chips are keys.** Split accelerators on whitespace into separate
   `kbd` chips (`Ctrl` `Shift` `R`), not one fused string capsule.
5. **Calibrate with evidence.** Against a positive screenshot: count lines per
   row, measure title vs group font-size, icon mid vs label mid (and vs
   title+description mid when two-line). Ship only when those match the chosen
   row model. Component tokens for CommandPalette live under `COMMAND_TOKENS` /
   `--fynns-command-*`.
