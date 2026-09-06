# Uy Parking! — clickable HTML prototype

Static, no backend, no build step. Every screen and interaction is mocked for
click-through demos and for translating into Figma. See `../docs/product-spec.md` for
the flow spec and `../docs/design-system.md` for the tokens (mirrored in `styles.css`).

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
cd prototype
python -m http.server 8777
```

Then visit http://localhost:8777.

## Files

| File | Purpose |
|---|---|
| `index.html` | All screens as `<section class="screen">` blocks |
| `styles.css` | Design tokens as CSS variables + component styles; light/dark themes |
| `app.js` | Screen router (`data-goto`), 15-min countdown, slot grid, pseudo-QR, owner tabs, theme toggle |

## What's wired

- **Reserve flow:** map → lot → floor → slot grid → reserve sheet → quick verify (OTP)
  → reservation QR with a live 15:00 countdown → scan-in confirmation
- **No-show:** the countdown (or the "Simulate no-show" button) drops you on the
  released-reservation screen
- **Walk-in:** Scan / Pay tab → Walk-in → auto-assigned slot + QR
- **Exit & pay:** session summary → QR Ph mock → paid
- **Find where you parked:** mini-map with a saved dot
- **Owner:** stats / financials tabs (static charts)
- **Theme:** ◐ button in the status bar toggles light/dark

## Deliberately fake

QR images are cosmetic (random modules). The map is a static SVG. Counts, prices,
charts, and the payment step are hard-coded. Slot availability is a fixed set in
`app.js` (`TAKEN` / `EV` / `PWD`).
