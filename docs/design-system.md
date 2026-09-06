# Uy Parking! — Design System

Tokens for the Figma file and any HTML prototype. Build these as Figma **styles +
components before drawing screens** — it prevents the week-8 crunch.

Fixed brand inputs (from README, do not change):
`#009f8b` accent · `#021c1c` dark background · `#f7f7f7` light background.

## Color tokens

### Accent ramp (teal)

| Token | Hex | Use |
|---|---|---|
| accent-50 | `#e6f5f3` | tinted backgrounds, selected rows (light) |
| accent-100 | `#b8e5df` | hover fills (light) |
| accent-300 | `#5cc4b7` | large text / icons on dark |
| accent-500 | `#009f8b` | **brand accent**; fills, active nav, map pins |
| accent-600 | `#008576` | button hover |
| accent-700 | `#006b5f` | accent **text on light bg** (passes AA body) |
| accent-900 | `#003832` | pressed states |

Primary button: `#009f8b` fill with `#021c1c` ink (ratio ≈ 5.7:1, passes AA). White
text on `#009f8b` is only ~3:1 — if you need white ink, use an `#006b5f` fill.

### Neutrals — light theme

| Token | Hex |
|---|---|
| bg | `#f7f7f7` |
| surface | `#ffffff` |
| border | `#dcdcdc` |
| text-tertiary / disabled | `#9a9a9a` |
| text-secondary | `#6f6f6f` |
| text-primary | `#1f1f1f` |

### Neutrals — dark theme (tinted toward the brand dark)

| Token | Hex |
|---|---|
| bg | `#021c1c` |
| surface | `#0a2a29` |
| surface-raised | `#113635` |
| border | `#1e4744` |
| text-secondary | `#8fa9a6` |
| text-primary | `#eaf3f1` |

### Semantic status — slot / floor availability

Chosen **blue → amber → red** so it never collides with the teal accent, and it stays
distinguishable under red-green color-vision deficiency. **Always pair with an icon or
label — never color alone.**

| Token | Hex | Meaning |
|---|---|---|
| status-available | `#2563eb` | open slots |
| status-filling | `#f59e0b` | few left |
| status-full | `#dc2626` | none available |

### Heatmap scale — lot fullness on the map

Sequential amber→red (single-hue-ish, CVD-safe). The numeric count is always shown
next to the color, so the color is reinforcement, not the sole signal.

| Band | Hex | Occupancy |
|---|---|---|
| heat-1 | `#ffe9b8` | < 40% taken |
| heat-2 | `#ffc266` | 40–70% |
| heat-3 | `#ff8c42` | 70–90% |
| heat-4 | `#e03131` | > 90% / full |

"Taken" = parked + reserved (see `../CLAUDE.md`).

## Type scale

System font stack. Base 16px.

| Token | Size / line-height | Use |
|---|---|---|
| caption | 12 / 16 | timestamps, helper text |
| body-sm | 14 / 20 | secondary body, list meta |
| body | 16 / 24 | default |
| title-sm | 18 / 24 | card titles |
| title | 20 / 28 | screen section headers |
| heading | 24 / 32 | screen titles |
| display | 30 / 38 | slot counts, countdown timer |

## Spacing scale (4-based)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`
Screen gutter: 16. Card padding: 16. Section gap: 24.

## Radius

`sm 4 · md 8 · lg 12 · xl 16 · pill 999`
Buttons and inputs: md. Cards and sheets: lg. QR sheet: xl.

## Elevation

| Token | Shadow (light) | Use |
|---|---|---|
| e1 | `0 1px 2px rgba(2,28,28,.08)` | cards |
| e2 | `0 4px 12px rgba(2,28,28,.12)` | bottom sheet, dropdowns |
| e3 | `0 12px 32px rgba(2,28,28,.18)` | modals |

On dark theme, lean on `surface` / `surface-raised` steps instead of heavy shadows.

## Components to build (with states)

| Component | States |
|---|---|
| Bottom nav | 3 tabs; active / inactive |
| Map pin | single / cluster; heat-band colored; selected |
| Lot card | default; fullness chip; favorited |
| Floor selector | list row: available count, selected, full (disabled) |
| Slot grid cell | available / taken / selected / accessible / EV |
| Occupancy bar | shows parked vs. reserved split |
| QR sheet | placeholder QR, countdown timer, expired variant |
| Countdown timer | running / < 2 min (warning) / expired |
| Primary button | default / hover / pressed / disabled / loading |
| Secondary button | default / disabled |
| OTP input | empty / partial / error / verified |
| Status chip | available / filling / full |
| Search bar | idle / focused / with recent-searches dropdown |
| Toast / notice | info (e.g. accessibility notice), stale-data warning |
