# M3 reference draft (read-only)

Mirror of Material Design 3 values for comparing against `src/theme/tokens.ts`
and sandbox overrides. **Not** emitted into `theme.css` and **not** imported by
production components.

Layers: `m3-reference` (this doc) → `fynns-base` (`tokens.ts`) → `fynns-override` (sandbox).

Values are approximate translations of M3 dp into CSS (1dp ≈ 1px at 1x).

## Shape (corner radius)

| Key | Value | Notes |
| --- | --- | --- |
| none | `0` | |
| extra-small | `4px` | |
| small | `8px` | |
| medium | `12px` | Card default |
| large | `16px` | |
| extra-large | `28px` | |
| full | `999px` | |

## Surface container (OKLCH teal hue 192)

Suggested L/C targets, not committed production colors:

- surface → `oklch(9% 0.02 192)`
- surface-container-lowest → `oklch(10% 0.022 192)`
- surface-container-low → `oklch(11% 0.025 192)`
- surface-container → `oklch(14% 0.03 192)`
- surface-container-high → `oklch(17% 0.035 192)`
- surface-container-highest → `oklch(20% 0.038 192)`

## Elevation → surface / shadow pairing

| Level | Role | Surface | Shadow |
| --- | --- | --- | --- |
| 0 | flat / filled+outlined resting | surface | none |
| 1 | elevated card resting | surface-container-low | xs |
| 2 | nav / menu | surface-container | sm |
| 3 | FAB / dialog | surface-container-high | md |
| 4 | card dragged | surface-container-highest | lg |
| 5 | reserved hover emphasis | surface-container-highest+ | xl |

## State-layer opacities

- hover `8%` · focus `10%` · pressed `12%` · dragged `16%`

## Card variants (M3)

| Variant | Surface role | Elevation | Outline |
| --- | --- | --- | --- |
| elevated | surface-container-low | 1 | no |
| filled | surface-container-highest | 0 | no |
| outlined | surface | 0 | yes |

## Card spacing

- content padding `16px`
- header padding-block `12px`
- actions padding-block `8px`
