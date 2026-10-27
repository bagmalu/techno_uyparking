# Uy Parking! — Requirements

**Goal:** In one month, design a lo-fi mobile app for **online parking availability and
location**. The deliverable is a Figma MVP and/or a clickable HTML prototype, not a working
system.

The core question the app answers: **"Is there a parking space?"**

---

## 1. Features

| # | Feature | Notes |
|---|---|---|
| 1 | **Availability** (main feature) | Show how many spaces are free in each parking area. |
| 2 | **Space attributes** | Show whether a lot has EV charging, covered parking and accessible (PWD) spaces. |
| 3 | **Reservation** | Reserve a space ahead of arrival. The exact floor and slot are assigned automatically at the entrance, not picked by the user. |
| 4 | **How full is it?** | A heatmap on the map shows how crowded each lot is. Each marker also shows a number, so colour is never the only signal. |
| 5 | **Trends** | A chart of when a lot usually fills up, by day and hour. |
| 6 | **Payment** | Pay the reservation fee and the parking fee in the app with QR Ph or NFC, or pay a cashier at the exit. |
| 7 | **Find my car** | After entry, the assigned floor and slot are saved so the driver can find their car later. |

### Accessible spaces
Users can see that a lot has accessible spaces, but the app does **not** verify whether a
driver is eligible to use them. Uy Parking! is a locator, not an enforcement authority. A
short, non-blocking reminder is shown when reserving.

---

## 2. Users and user stories

### Consumer (driver)
No account is needed to browse. A plate number or phone OTP is asked for only when
reserving or paying.

- **Home:** a map with a search bar, saved/preset locations and recent searches.
- **Search:** look up a location and see nearby parking.
- **Recommendations:** nearby lots are shown with a heatmap of how full they are.
- **Reserve:** hold a space at a chosen lot by paying a reservation fee.
- **Arriving with a reservation:** scan the QR code or tap NFC at the gate. The system
  assigns a floor and slot and raises the barrier.
- **Walk-in (no reservation):** choose "Walk-in" at the gate scanner. It generates an
  entry QR (on the phone or as a printed ticket), and the system assigns a floor and slot.
- **Leaving:** scan out, see the fee, pay (in app or at the cashier) and scan at the exit
  gate.

### Parking owner
- Parking statistics (occupancy, peak times, no-shows, per-lot usage).
- Financial reports (revenue, reservation fees, payment mix, transactions).

---

## 3. Reservation and payment rules

| Rule | Value |
|---|---|
| Reservation fee | **₱50**, paid up front |
| Credit at exit | **₱35** of the reservation fee is deducted from the final parking fee |
| Grace period | **15 minutes** to scan in. If the driver doesn't arrive in time, the reservation is released automatically. |
| Slot assignment | Automatic, at the moment of entry scan/NFC tap. Users never pick a floor or slot. |
| Occupancy count | "Taken" = parked + reserved. Lot details show the split, e.g. "82 parked + 15 reserved / 120". |
| Wrong slot | Parking in a slot other than the assigned one may incur a penalty. If someone takes your slot, staff redirect you to another slot and give you a voucher. |
| Payment methods | Universal QR Ph and NFC (visual mock only), or pay a cashier/vendor. |

---

## 4. Screens

**Bottom navigation (3 tabs)**
- **Map:** landing page with a heatmap of parking capacity and a search bar.
- **Scan:** reservation QR, walk-in QR generation, NFC, scan-out and payment.
- **Explore:** parking near you, favourite lots and recent reservations.

**Side menu**
- Profile (works without an account)
- Settings
- Parking owner view

**Scan tab details**
- Generate a reservation or walk-in QR
- Payment details and payment methods
- Parking locator ("Find my car")

---

## 5. Mockups

Reference frames are in `docs/mockup/`:

| File | Shows |
|---|---|
| `default.png` | Landing page: map with lot markers |
| `zoomed in.png` | Zoomed map showing the number of free spaces on each lot |
| `space selected.png` | Lot detail sheet after tapping a lot. Tapping a trend bar shows that hour's typical availability. |
| `live space selected.png` | Same sheet with the current hour's live availability highlighted |
| `w reserved.png` | Map with a banner showing the active reservation |
| `../user-flowchart.png` | End-to-end user flow from opening the app to exiting the car park |

---

## 6. Branding

| Item | Value |
|---|---|
| App name | **Uy Parking!** |
| Primary / accent colour | `#009f8b` |
| Dark mode background | `#021c1c` |
| Light mode background | `#f7f7f7` |

---

## 7. Out of scope

- Business and third-party integrations (mall systems, payment settlement, refunds,
  disputes) are left for future development.
- No real backend, login, database, live maps, GPS or payments. Everything is mocked.
- Per-slot sensing assumes the car park's existing bay sensors; integrating them is out of
  scope.

---

## 8. Open questions

- **1 hour vs. 15 minutes:** the flowchart says a reservation is made "1 hour in advance"
  and checks whether the driver is "within their 1hr reservation time". The locked rule is
  a 15-minute grace period. Should drivers be able to book up to 1 hour ahead, then get
  15 minutes of grace after their chosen arrival time? The prototype currently uses only
  the 15-minute timer.
- **Wrong-slot penalty:** who issues it and how much is it? The prototype only shows a
  warning and a "Someone's in my slot?" option.
