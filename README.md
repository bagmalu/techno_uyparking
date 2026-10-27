# Uy Parking!

A lo-fi, clickable HTML prototype of **Uy Parking!**, a mobile app that answers one
question: *is there a parking space?* Drivers can see how full nearby car parks are,
reserve a space, scan in to get a floor and slot assigned automatically, find their car
later, and pay on the way out. Parking owners get a mock statistics and finance dashboard.

> **This is a prototype, not a working app.** Maps, GPS, QR codes, NFC, OTP and payments
> are all simulated. Nothing is sent to a server.

## Opening the prototype

No install or build step is needed.

**Option A: open the file.** Double-click `prototype/index.html`, or drag it into Chrome,
Edge, Firefox or Safari.

**Option B: run a local server** (useful for testing on a phone on the same Wi-Fi):

```sh
cd prototype
python -m http.server 8777
```

Then open <http://localhost:8777>. On a phone, use your computer's local IP address,
for example `http://192.168.1.20:8777`.

On a desktop the app appears inside a phone frame, with a **Prototype controls** panel
beside it. On a phone-sized screen it fills the screen, and the controls panel is below it.

## Walkthrough

Each of these flows follows `docs/user-flowchart.png`.

### 1. Reserve a space
1. On the **Map** tab, tap a lot marker. Solid teal means plenty of space, pale teal means
   nearly full and grey means full. Zoom in to see the free-space count on every marker.
   Drag to pan; scroll, double-click or pinch to zoom; ⌖ recentres the map.
2. The details sheet shows free spaces, the *parked + reserved* split, features
   (accessible, EV, covered), the hourly rate and a **trends** chart. Tap any bar to see
   that hour's typical availability, or change the day.
3. Tap **Reserve**, review the ₱50 fee (₱35 is credited at exit), then continue.
4. Enter a plate number, or use **Phone (OTP)**. Any 6 digits work as the code.
5. On the payment screen, tap **Simulate successful payment**.
6. The reservation QR appears with a **15-minute countdown**. Your floor and slot are not
   assigned yet.
7. Tap **I'm at the gate — scan QR**. The app checks you in, assigns a floor and slot,
   and saves the location.

### 2. Walk in without a reservation
**Scan** tab → **Walk in** → choose the lot you're at → **Generate entry QR** → **Scan in
at the gate**. Choosing a full lot (for example *Annex Carpark*) shows the "lot full" state
with nearby alternatives.

### 3. Leave and pay
**Scan** tab → **Scan out & pay**. Review the fee, including the ₱35 credit if you
reserved. Then either:
- **Pay in the app**, using the QR Ph or NFC visual, then scan at the exit; or
- **Pay at the cashier**, then scan at the exit.

### 4. Find my car
Tap the **Parked** banner on the map, or **You're parked** on the Explore tab. You'll see
a floor map with a path to your slot and step-by-step directions.

### 5. Parking owner
Open the **☰ menu** → **Parking owner view**, then switch between **Statistics** and
**Financials**.

### Other states to try
| State | How to see it |
|---|---|
| Reservation expired (no-show) | Prototype controls → **Expire now** while a reservation is active |
| Countdown warning (under 2 min) | Prototype controls → **Skip to last 2 min** |
| Zoomed-in map (`zoomed in.png`) | Scroll, double-click or pinch the map, or Prototype controls → **Toggle zoomed-in map** |
| Lot full | Tap the grey **FULL** marker, or Prototype controls → **Lot full state** |
| Offline / underground | Settings → **Simulate offline**. A stale-data notice appears and QR codes still show. |
| Dark mode | Settings → **Dark mode**. It follows your system setting by default. |
| Search, saved places, recents | Tap **Where to?** on the map |
| Favourites | Tap the heart on a lot's details sheet; it appears in Explore |

## Prototype controls

The panel next to the phone is for demos and presentations only. It is not part of the app
design. It can jump straight to any flow, fast-forward or expire the reservation timer,
toggle offline or dark mode, and **reset all demo data**.

## Things to know

- **The look follows `docs/mockup/`.** The map stays on screen at all times, and every
  screen opens as a rounded sheet over it, like the lot-detail sheet in `space selected.png`.

- **Your progress is saved in this browser** (`localStorage`), including reservations,
  favourites, recents and plate/phone, just as the real app would keep a local cache.
  Use **Reset demo data** or Settings → **Clear local data** to start fresh.
- **The countdown is real time.** A reservation genuinely expires 15 minutes later, even
  after a page reload. Use the controls to skip ahead.
- **Parking duration at scan-out is simulated** as 2h 15m, so the fee looks realistic.
- **Users never pick a slot.** The floor and slot are assigned randomly when you scan in,
  matching the "automatic assignment" design decision.
- **QR codes are placeholders.** They look like QR codes but can't be scanned.
- Lot names, photos (illustrations), counts and owner figures are all mock data, defined
  at the top of `prototype/app.js`.

## Project layout

```
README.md              ← you are here
requirements.md        ← features, user stories, rules, open questions
CLAUDE.md              ← locked product decisions and scope
docs/
  product-spec.md      ← screen inventory and golden-path flows
  design-system.md     ← colours, type, spacing, components
  user-flowchart.png   ← end-to-end user flow
  mockup/              ← reference frames for the visual style
prototype/
  index.html           ← all screens
  styles.css           ← design tokens and components
  app.js               ← screen router, 15-min countdown, mock data and flows
```

## Branding

**Uy Parking!** · accent `#009f8b` · dark background `#021c1c` · light background `#f7f7f7`.
