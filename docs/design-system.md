# Uy Parking! — Design System

Tokens for the Figma file and any HTML prototype. Build these as Figma **styles +
components before drawing screens** — it prevents the week-8 crunch.

Fixed brand inputs (from README, do not change):
`#009f8b` accent · `#021c1c` dark background · `#f7f7f7` light background.

## Visual direction from the mockup

The prototype uses a map-first composition with a quiet, pale map background and a small
number of high-contrast controls layered above it. Use the mockup frames in `mockup/` as
the visual reference:

- Keep the map visually subordinate to parking markers and availability numbers.
- Use a floating hamburger button and a wide pill-shaped search field at the top.
- Use a rounded bottom sheet for lot details; it may contain a drag handle, lot photo,
  attribute row, trend chart, and one prominent Reserve action.
- Keep the three-item bottom navigation visible on map, scan, and explore roots.
- Use teal for brand actions and selected parking markers; use the separate heatmap ramp
  for fullness so accent teal remains an interaction color.
- Prefer short labels and numeric availability such as `23 spaces left`; do not make
  users decode marker color without a number or status label.

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

| Token | Hex | Chip label | Rule (share of capacity taken) |
|---|---|---|---|
| status-available | `#2563eb` | Available | under 70% taken |
| status-filling | `#f59e0b` | Filling up | 70% or more taken, at least 1 slot left |
| status-full | `#dc2626` | Full | 0 slots left |

The status chip is based on the **percentage** taken, so it says how close the lot is to
capacity regardless of its size. The map heatmap below is based on the **count** of slots
left instead, which reflects your chance of getting a space. Big lots can therefore show
"Filling up" on solid teal (e.g. 240 of 300 taken: 80%, but 60 left), and small lots
"Available" on pale teal (e.g. 6 of 15 taken: 40%, but 9 left). This is intentional: the
chip shows how fast the lot is filling, the marker shows how much room is left. Both
rules live in `stats()` in `../source/app.js`.

### Heatmap scale — lot availability on the map

Matches the mockups (`mockup/default.png`, `mockup/zoomed in.png`): markers are teal, and
their strength shows how much space is left. The count appears on every marker once the map
is zoomed in (and always on the selected marker), so color is never the only signal.

| Band | Hex | Spaces left (count, not %) |
|---|---|---|
| lot-high | `#009f8b` | 20 or more |
| lot-mid | `#2cac9d` | 10–19 |
| lot-low | `#b3d6d4` (ink `#0b5e55`) | 1–9 |
| lot-full | `#d3d9d9` (ink `#6b7574`, label "Full") | 0 |

Selected marker: `#009f8b` with a `#aeb3bd` ring.

Base map: OpenStreetMap tiles, greyed with a CSS filter (`.osm-tiles`) so they read like the
mockups' pale map; dark mode inverts them to a deep teal. Map background while tiles load:
`#f1f4f5` (light) / `#062625` (dark). OSM attribution must stay visible.

"Taken" = parked + reserved (see `../CLAUDE.md`).

### Map marker and availability guidance

| Element | Treatment | Required content |
|---|---|---|
| Default lot marker | Teal fill on the building's real OSM outline (lot-high/mid) | Spaces left, shown when zoomed in |
| Low-availability marker | lot-low or lot-full fill | Count, or `Full` label |
| Selected marker | Accent-500 with grey `#aeb3bd` ring | Count, always visible |
| User location | Small blue dot | Do not imply GPS precision in the prototype |

The mockup's large teal markers are intentionally legible at a glance. Keep marker labels
large enough to survive map scaling and pair every color state with text.

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
| display | 30 / 38 | availability counts, countdown timer |

## Spacing scale (4-based)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`
Screen gutter: 16. Card padding: 16. Section gap: 24. Map control gap: 12.

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
| Map shell | default; zoomed; selected lot; reservation banner |
| Top controls | hamburger; search idle/focused; voice affordance; locate-me |
| Bottom nav | 3 tabs — Map, Scan, Explore; active / inactive |
| Map pin | single / cluster; numeric label; heat-band colored; selected |
| Lot card / detail sheet | default; fullness chip; favorited; expanded with photo and trends |
| Attribute row | accessible; EV charging; covered; rate chip (first-block price, hover/tap for the breakdown card) |
| Availability summary | slots left / total for drivers (parked/reserved split on the owner dashboard); available, filling, and full states |
| Automatic assignment card | waiting for entry scan / assigning / assigned / unavailable; assigned floor and slot shown after scan |
| Occupancy bar | total taken plus parked vs. reserved split |
| Trend chart | static bars; selected time; day selector; live availability label |
| QR sheet | placeholder QR, lot/reservation summary, unassigned state, countdown timer, expired variant |
| Countdown timer | running / < 2 min (warning) / expired |
| Reservation fee summary | ₱50 paid; ₱35 deductible at exit |
| Scan mode selector | reservation QR/NFC; walk-in |
| Parked confirmation | assigned location, photo/map dot, find-where-you-parked action |
| Session/payment summary | duration; parking fee; deduction; amount due; QR Ph/NFC options |
| Primary button | default / hover / pressed / disabled / loading |
| Secondary button | default / disabled |
| OTP input | empty / partial / error / verified |
| Status chip | available / filling / full |
| Search bar | idle / focused / with recent-searches dropdown |
| Toast / notice | info (e.g. accessibility notice), stale-data warning |

## Screen-specific composition

### Map home

The map occupies the available screen behind floating controls. The search field is the
primary entry point, while the bottom nav and locate-me control remain easy to reach.
Parking markers should show availability without requiring a tap.

### Lot detail

Open lot details as a rounded bottom sheet over the map. The information order follows
the mockup:

1. Lot name and aggregate availability context.
2. Photo.
3. Accessibility, EV, covered, and rate attributes.
4. Day selector and historical availability bars.
5. Reserve button.

### Reservation and scan

Use the same rounded-card language for confirmation and QR states. The QR screen must
prioritize the countdown and reservation or walk-in status. Do not show a floor or slot
before entry. When the user scans or taps NFC, show the assignment transition and then
the assigned location in the parked-confirmation component.

### Accessibility and status

Never communicate availability or fullness by color alone. Pair color with counts, labels,
icons, or patterns. The system assigns the floor and slot only when the user scans or
taps NFC at entry, after reservation or walk-in setup; users do not browse or select
individual spaces. The accessibility reminder is informational and must not block a
reservation.
