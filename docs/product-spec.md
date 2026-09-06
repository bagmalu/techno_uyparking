# Uy Parking! — Prototype Spec

A prototype-only spec (Figma MVP + optional clickable HTML). Nothing here is built as
a working system. See `../CLAUDE.md` for locked product decisions.

## Prototype scope & timeline (~8 weeks)

| Weeks | Goal |
|---|---|
| 1–2 | Low-fidelity wireframes for **every** flow below. Nail navigation and screen order. |
| 3–5 | High-fidelity for the golden-path screens. Build the design system first (`design-system.md`). |
| 6–8 | Wire the interactive prototype, polish visuals, write the defense notes, rehearse the demo. |

## In scope vs. out of scope

| In scope (mock/draw) | Out of scope (do not build) |
|---|---|
| All consumer golden paths, clickable end to end | Real backend, auth, database |
| Static styled map image with pins / clusters | Live map SDK, real GPS |
| QR screens with a placeholder QR image | Real QR generation / validation |
| Universal QR Ph payment screen (visual only) | Real payment, settlement, refunds |
| One static "trends" chart | Real historical data / analytics |
| Owner dashboard — 2 static screens | Full owner tooling, exports |
| Profile + settings — 1 screen each, mostly non-functional | Deep settings, real preferences storage |
| Bay-sensor-driven per-slot availability (assumed) | Sensor integration |

## Navigation structure

- **Bottom nav:** Landing (map) · QR / Parking Finder · Explore
- **Sidebar:** User profile (works without an account) · Settings
- **Owner mode:** separate stats + financials screens (own entry point)

## Screen inventory

### Landing / map
| Screen | Purpose |
|---|---|
| Map home | Static campus map, heatmap overlay of lot fullness, search bar, preset/saved locations, recent searches |
| Search results | List + map pins of nearby lots ranked by proximity and fullness |
| Lot detail | Floor list with available counts; occupancy split ("28 parked + 6 reserved / 40"); attributes (EV, covered, PWD, distance to entrance/elevator) |
| Floor detail | Slot grid for the chosen floor; available vs. taken; tap a slot to reserve |

### QR / Parking Finder
| Screen | Purpose |
|---|---|
| Reservation QR | Placeholder QR + prominent 15-min countdown + lot/floor/slot summary |
| Reservation expired | No-show state after grace period; offer to re-reserve |
| Walk-in entry | "Choose walk-in at the scanner" → generates QR, auto-assigns a slot |
| Scan-in confirmation | "You're parked" + saved location (floor, slot, photo, map dot) |
| Scan-out / session summary | Duration, amount due, pay button |
| Payment (Universal QR Ph) | Visual mock of the QR Ph merchant flow → success |
| Parking locator | "Find where you parked" — saved dot on the floor map + walking hint |

### Explore
| Screen | Purpose |
|---|---|
| Explore home | Parking near you, recent reservations (from cache), favorite lots |

### Sidebar
| Screen | Purpose |
|---|---|
| User profile | Works unauthenticated; shows plate/phone if added; recent activity |
| Settings | Theme, notifications, saved plates — mostly non-functional toggles |
| OTP / identity | Appears only at reserve/pay; plate number or phone-number OTP |

### Owner
| Screen | Purpose |
|---|---|
| Owner stats | Occupancy over time, peak hours, turnover — static charts |
| Owner financials | Revenue summary, per-day breakdown — static |

## Golden-path user flows (make these clickable)

**1. Reserve a slot**
1. Open app → Map home with heatmap
2. Search or tap a lot → Lot detail with floor counts
3. Pick a floor → Floor detail slot grid
4. Tap an open slot → confirm reservation (OTP prompt if no identity yet)
5. Reservation QR screen with 15-min countdown
6. Arrive → scan-in → Scan-in confirmation with location saved

**2. Walk-in**
1. At the scanner → choose "Walk-in"
2. QR generated, a slot is auto-assigned
3. Scan-in confirmation with location saved

**3. Exit & pay**
1. Scan-out → Session summary (duration, amount)
2. Pay → Universal QR Ph mock → Success
3. Return to Explore home

**4. Find where you parked**
1. From Explore or a persistent "You're parked" banner → Parking locator
2. Floor map with saved dot + walking hint

**5. Parking owner**
1. Owner entry → Owner stats
2. Switch tab → Owner financials

## Secondary states (one screen each — shows rigor at defense)

- Reservation expired / no-show (grace period elapsed)
- Lot full / floor full
- Offline underground — QR still renders from cache, "counts may be stale" note
- First-time vs. returning user — "continue without account" vs. cached recents

## Notes for the writeup / defense

- **Reserved counts as taken.** Prevents phantom availability. Always show the split
  on lot detail so panelists don't read it as a bug.
- **15-min grace, auto-release.** Countdown is front and center on the QR screen; the
  expired state is prototyped.
- **Payment.** Universal QR Ph on exit only; no reservation fee. Settlement, refunds,
  and disputes are explicitly out of scope.
- **Identity.** No account needed to browse or locate parking. Plate number or phone
  OTP only at reserve/pay. Recents live in local cache.
- **Sensors.** Per-slot availability assumes the mall's existing bay sensors; the
  integration is assumed, not built. State this assumption plainly.
- **Accessibility slots.** The app is a locator, not an enforcement authority — no
  eligibility check. An optional non-blocking "please ensure you're eligible" notice
  on reserve costs nothing and reads as responsible.
- **Scope.** Campus parking only; business onboarding is future work.
