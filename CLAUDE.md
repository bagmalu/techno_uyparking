# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a **lo-fi project**, not a working system. The deliverable
across 1 month is a Figma MVP and/or a basic clickable HTML prototype of the
"Uy Parking!" mobile app.

Do **not** build a real backend, authentication, database, or payment integration.
Every feature only has to be drawn or mocked. The map may use an OpenStreetMap base map
(tiles via Leaflet) with mock lots drawn on real building outlines for realism; live
occupancy data, real GPS, and routing stay out of scope. Per-slot availability
assumes the mall's existing parking-bay sensors — that integration is out of scope.
Users do not choose a floor or individual parking slot; the prototype shows aggregate
availability and mocks automatic floor/slot assignment only when the user scans or taps
NFC at entry.

Working docs:
- `docs/product-spec.md` — prototype scope, screen inventory, user flows, defense notes
- `docs/design-system.md` — color tokens, type/spacing scales, component list
- `docs/mockup/` — contains mockups which is the basis of the aesthetic of the app

Clickable HTML prototype in `source/` (no build step) — open `source/index.html`
directly, or `cd source && python -m http.server 8777`. Screens live in
`index.html`; tokens in `styles.css` mirror `docs/design-system.md`; `app.js` holds
the screen router, the 1 h 15 min reservation countdown, and the mock slot/QR data. See
`source/README.md`.

## Product

"Uy Parking!" — a mobile Online Parking Availability & Locator app. Core question:
*is there a parking space?* Around that: per-slot attributes (EV charging,
covered/uncovered, disabled-accessible), reservation, proximity to entrance/elevator,
historical fill-time trends, payment on exit, and "find where you parked."

Two user types:
- **Consumer** — map + search home page with saved/preset locations and recent
  searches; heatmap of lot fullness; select a lot → reserve; QR scan-in / scan-out;
  walk-in flow where the scanner generates a QR; scanning or tapping NFC at entry then
  automatically assigns a floor and slot. The assigned location is shown after entry and
  saved for parking recovery.
- **Parking Owner** — parking statistics, financial reports.

Unauthenticated users can use the app.

See `docs/product-spec.md` for the full screen inventory and the nav/sidebar layout.

## Locked decisions (do not contradict without the user's say-so)

- **Reservation grace period:** 1 hour 15 minutes. No-show → reservation is auto-removed
  and released for other drivers.
- **Payment:** 50 peso consumer-side reservation fee, 35 pesos is deductible from the
  final parking fee, and payment on exit is shown through a visual
  **Universal QR Ph / NFC integration**. Settlement, refunds, and disputes are out of scope.
- **Occupancy display:** heatmap and lot-level counts show *total taken = parked +
  reserved*. Show the split on lot detail (e.g. "28 parked + 6 reserved / 40") so it
  reads as intentional. Floor and slot data may be shown only as system-assigned
  location details, never as user selection controls.
- **Identity:** no account required to use the app. An account, when created, is keyed
  on **plate number or phone-number OTP**. Recent reservations and similar are kept in
  local cache. The OTP prompt appears only at reserve/pay.
- **Accessibility:** the app is a **locator, not an enforcement authority** — no
  eligibility check. Accessible facilities or spaces may be indicated, but users do not
  select a specific accessible slot. An optional non-blocking notice is allowed.

## Branding (fixed — do not change without the user's say-so)

- App name: **Uy Parking!**
- Primary / accent color: `#009f8b`
- Dark mode background: `#021c1c`
- Light mode background: `#f7f7f7`

Derived ramps, semantic colors, and the heatmap scale live in `docs/design-system.md`.

## Scope constraints

- Business / third-party integration is deferred to future work.

## Domain vocabulary

- **Heatmap** / "how full" — lot-level capacity indicator on the map.
- **Trends** — historical "what time does it usually fill up" (one static chart in the
  prototype; there is no real historical data).
- **Automatic assignment** — the mocked system chooses an available floor and slot when
  the user scans or taps NFC at entry, after reservation or walk-in setup; users do not
  browse or select individual spaces.
