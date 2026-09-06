# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a **prototype-only design project**, not a working system. The deliverable
across ~2 months is a Figma MVP and/or a basic clickable HTML prototype of the
"Uy Parking!" mobile app.

Do **not** build a real backend, authentication, database, live maps, or payment
integration. Every feature only has to be drawn or mocked. Per-slot availability
assumes the mall's existing parking-bay sensors — that integration is out of scope.

Working docs:
- `docs/product-spec.md` — prototype scope, screen inventory, user flows, defense notes
- `docs/design-system.md` — color tokens, type/spacing scales, component list

Clickable HTML prototype in `prototype/` (no build step) — open `prototype/index.html`
directly, or `cd prototype && python -m http.server 8777`. Screens live in
`index.html`; tokens in `styles.css` mirror `docs/design-system.md`; `app.js` holds
the screen router, the 15-min countdown, and the mock slot/QR data. See
`prototype/README.md`.

## Product

"Uy Parking!" — a mobile Online Parking Availability & Locator app. Core question:
*is there a parking space?* Around that: per-slot attributes (EV charging,
covered/uncovered, disabled-accessible), reservation, proximity to entrance/elevator,
historical fill-time trends, payment on exit, and "find where you parked."

Two user types:
- **Consumer** — map + search home page with saved/preset locations and recent
  searches; heatmap of lot fullness; drill in to floor selector → slot selector →
  reserve; QR scan-in / scan-out; walk-in flow where the scanner generates a QR and
  auto-assigns a slot.
- **Parking Owner** — parking statistics, financial reports.

Unauthenticated users can use the app.

See `docs/product-spec.md` for the full screen inventory and the nav/sidebar layout.

## Locked decisions (do not contradict without the user's say-so)

- **Reservation grace period:** 15 minutes. No-show → reservation is auto-removed.
- **Payment:** no consumer-side reservation fee. Payment happens on exit via
  **Universal QR Ph**. Settlement, refunds, and disputes are out of scope.
- **Occupancy display:** heatmap and floor/lot counts show *total taken = parked +
  reserved*. Show the split on lot detail (e.g. "28 parked + 6 reserved / 40") so it
  reads as intentional.
- **Identity:** no account required to use the app. An account, when created, is keyed
  on **plate number or phone-number OTP**. Recent reservations and similar are kept in
  local cache. The OTP prompt appears only at reserve/pay.
- **Accessibility slots:** the app is a **locator, not an enforcement authority** — no
  eligibility check. An optional non-blocking notice is allowed.

## Branding (fixed — do not change without the user's say-so)

- App name: **Uy Parking!**
- Primary / accent color: `#009f8b`
- Dark mode background: `#021c1c`
- Light mode background: `#f7f7f7`

Derived ramps, semantic colors, and the heatmap scale live in `docs/design-system.md`.

## Scope constraints

- Limit parking coverage to the user's school's parking slots for now.
- Business / third-party integration is deferred to future work.

## Domain vocabulary

- **Lot → floors → slots** hierarchy; each floor reports an available-slot count.
- **Heatmap** / "how full" — lot-level capacity indicator on the map.
- **Trends** — historical "what time does it usually fill up" (one static chart in the
  prototype; there is no real historical data).
- Two entry paths: **reservation** (pick a slot ahead of time) and **walk-in** (the
  scanner generates a QR and auto-assigns a slot on arrival).
