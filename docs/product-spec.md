# Uy Parking! — Prototype Spec

A lo-fi prototype-only spec (Figma MVP + optional clickable HTML). Nothing here is built as
a working system. The visual starting point is the map-first mockup in `mockup/`; the
interaction model follows `user-flowchart.png`. See `../CLAUDE.md` for locked product
decisions.

## In scope vs. out of scope

| In scope (mock/draw) | Out of scope (do not build) |
|---|---|
| All consumer golden paths, clickable end to end | Real backend, authentication, database |
| OpenStreetMap base map with mock lots drawn on real building outlines | Live occupancy feeds, real GPS, routing |
| QR screens with a placeholder QR image | Real QR generation / validation |
| Universal QR Ph payment screen & NFC integration (visual only) | Real payment, settlement, refunds |
| Static "usually fills up" trends chart | Real historical data / analytics |
| Mocked owner statistics and financial reports | Business onboarding and third-party integrations |

## Navigation and visual hierarchy

The primary consumer shell is a map-first mobile layout:

- **Top:** hamburger menu and a pill-shaped search field with search and voice affordances.
- **Center:** a pale static map with teal parking markers; zoomed views show numeric
  availability directly on each marker.
- **Bottom:** three-tab navigation — Map, Scan, and Explore — plus a locate-me control.
- **Lot detail:** a rounded bottom sheet opened by selecting a map marker. It contains the
  lot name, photo, attributes, hourly rate, trend chart, and a prominent Reserve button.
- **Reservation banner:** after a reservation, a compact teal banner identifies the lot and
  assigned reservation reference while the user returns to the map.

The map is the default landing state. Search, lot details, reservation, and scan flows
should preserve this shell where practical rather than introducing unrelated page layouts.

## Screen inventory

### Landing / map
| Screen | Purpose |
|---|---|
| Map home | OpenStreetMap view of Ortigas Center, teal/heatmap lot outlines, search bar, locate-me control, saved/preset locations, and recent searches |
| Zoomed map | Enlarged map region with numeric availability labels on parking markers |
| Search results | List and map pins for nearby lots ranked by proximity and availability |
| Lot detail sheet | Lot photo, name, aggregate availability, accessible/EV/covered attributes, hourly rate, and trends |
| Reservation confirmation | Selected lot, automatic-space-assignment notice, fee breakdown, grace-period reminder, and optional accessibility notice |
| Assignment confirmation | System-assigned floor/slot after entry scan, photo or map reference, and directions to the assigned space |

### QR / Parking Finder
| Screen | Purpose |
|---|---|
| Reservation QR | Placeholder QR + prominent 15-min countdown + lot and reservation summary; no floor/slot is assigned yet |
| Reservation expired | No-show state after grace period; offer to re-reserve |
| Walk-in entry | "Choose walk-in at the scanner" → generates QR; entry scan/NFC then assigns a floor and slot |
| Scan-in confirmation | "You're parked" + saved system-assigned location (floor, slot, photo, map dot) |
| Scan-out / session summary | Duration, parking fee, ₱35 reservation-fee deduction, amount due, and pay button |
| Payment (Universal QR Ph) | Visual mock of the QR Ph merchant flow; NFC is represented as an alternate visual option |
| Parking locator | "Find where you parked" — saved assigned-space dot on the floor map + walking hint |

### Explore
| Screen | Purpose |
|---|---|
| Explore home | Parking near you, recent reservations (from cache), favorite lots |

### Sidebar and owner views
| Screen | Purpose |
|---|---|
| User profile | Works unauthenticated; shows plate/phone if added; recent activity |
| Settings | Theme, notifications, saved plates — mostly non-functional toggles |
| OTP / identity | Appears only at reserve/pay; plate number or phone-number OTP |
| Owner statistics | Mock occupancy, peak-time, and lot-performance cards |
| Owner financials | Mock revenue, reservation-fee, and transaction summary |


## Golden-path user flows (make these clickable)

**1. Reserve parking**
1. Open app → Map home with heatmap
2. Search or tap a lot → Lot detail bottom sheet with photo, attributes, rate, and trend
3. Tap Reserve → reservation confirmation; the user does not choose a floor or slot
4. If needed, enter plate number or complete phone OTP
5. Pay the ₱50 reservation fee → ₱35 will be deducted from the final parking fee
6. Reservation QR screen with 15-min countdown and no assigned slot
7. Arrive → scan QR/NFC → system assigns an available floor and slot
8. Scan-in confirmation with the assigned location saved

**2. Walk-in**
1. At the Scan tab/scanner → choose "Walk-in"
2. QR generated for entry
3. Scan QR/NFC in → system assigns a floor and slot
4. Confirmation with floor, slot, photo, and saved location

**3. Exit & pay**
1. Scan-out → Session summary (duration, amount)
2. Apply the ₱35 reservation-fee deduction when applicable
3. Pay → Universal QR Ph/NFC mock → Success
4. Return to Explore home

**4. Find where you parked**
1. From Explore or a persistent "You're parked" banner → Parking locator
2. Floor map with saved dot + walking hint

**5. Parking owner**
1. Owner entry → Owner stats
2. Switch tab → Owner financials

## Secondary states (one screen each — shows rigor at defense)

- Reservation expired / no-show (grace period elapsed)
- Lot full / no assignable space
- Offline underground — QR still renders from cache, "counts may be stale" note
- First-time vs. returning user — "continue without account" vs. cached recents
- Reservation fee payment confirmation — ₱50 paid, ₱35 exit deduction explained
- Accessibility slot reminder — non-blocking eligibility notice
- Reserved versus parked split — counts are explicit on the lot detail sheet

## Notes for the writeup / defense

- **Reserved counts as taken.** Prevents phantom availability. Always show the split
  on lot detail so panelists don't read it as a bug.
- **15-min grace, auto-release.** Countdown is front and center on the QR screen; the
  expired state is prototyped.
- **Payment.** A ₱50 consumer-side reservation fee is paid before the reservation QR is
  shown; ₱35 is deductible from the final parking fee. Universal QR Ph/NFC is shown on
  exit as a visual mock only. Settlement, refunds, and disputes are out of scope.
- **Identity.** No account needed to browse or locate parking. Plate number or phone
  OTP only at reserve/pay. Recents live in local cache.
- **Accessibility.** The app is a locator, not an enforcement authority — no eligibility
  check. Lot attributes can identify accessible facilities, but the user does not select
  a specific accessible slot. An optional non-blocking reminder on reserve costs nothing
  and reads as responsible.
- **Scope.** Campus parking only; business onboarding is future work.
