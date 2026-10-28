# Uy Parking!

A lo-fi, clickable HTML prototype of **Uy Parking!**, a mobile app that answers one
question: *is there a parking space?* Drivers can see how full nearby car parks are,
reserve a space, scan in to get a floor and slot assigned automatically, find their car
later, and pay on the way out. Parking owners get a mock statistics and finance dashboard.

> **This is a prototype, not a working app.** Maps, GPS, QR codes, NFC, OTP and payments
> are all simulated. Nothing is sent to a server.

## Opening the prototype

No install or build step is needed.

**Option A: open the file.** Double-click `source/index.html`, or drag it into Chrome,
Edge, Firefox or Safari.

**Option B: run a local server** (useful for testing on a phone on the same Wi-Fi):

```sh
cd source
python -m http.server 8777
```

Then open <http://localhost:8777>. On a phone, use your computer's local IP address,
for example `http://192.168.1.20:8777`.

On a desktop the app appears inside a phone frame, with a **Presentation controls** panel
beside it. On a phone-sized screen it fills the screen, and the controls panel is below it.

## Walkthrough

Each of these flows follows `docs/user-flowchart.png`.

### 1. Reserve a space
1. On the **Map** tab, tap a lot. Lots are the teal shapes drawn on real buildings; the map
   opens on SM Megamall in Ortigas Center, and zooming out shows 20 lots across Metro Manila
   as small pins. Solid teal means plenty of space, pale teal means nearly full and grey
   means full. Zoom in to see the free-space count on every lot.
   Drag to pan; scroll, double-click or pinch to zoom; ⌖ recentres on your (mock) location.
2. The details sheet shows free spaces, the *parked + reserved* split, the address, features
   (accessible, EV, covered), the hourly rate and a **trends** chart. Tap any bar to see
   that hour's typical availability, or change the day.
3. Tap **Reserve**, review the ₱50 fee (₱35 is credited at exit), then continue.
4. Enter a plate number, or use **Phone (OTP)**. Any 6 digits work as the code; no text is
   actually sent.
5. On the payment screen, tap **I've paid** (QR Ph) or **Pay ₱50** (NFC). No money moves.
6. The reservation QR appears with a **15-minute countdown**. Your floor and slot are not
   assigned yet.
7. Tap **Check in with NFC**, or tap the QR code itself to act as the gate scanner reading
   it. The app checks you in, assigns a floor and slot, and saves the location.

### 2. Walk in without a reservation
**Scan** tab → **Walk in** → choose the lot you're at → **Get entry pass** → **Check in
with NFC** (or tap the QR code). Choosing a full lot (for example *Megamall Building C Carpark*) shows the "lot full" state
with nearby alternatives.

### 3. Leave and pay
**Scan** tab → **Scan out & pay**. Review the fee, including the ₱35 credit if you
reserved. Then either:
- **Pay in the app**, using QR Ph or NFC, then **Exit with NFC** (or tap the exit QR); or
- **Pay at the cashier**, then exit the same way.

### 4. Find my car
Tap the **Parked** banner on the map, or **You're parked** on the Explore tab. You'll see
a floor map with a path to your slot and step-by-step directions.

### 5. Parking owner
Open the **☰ menu** → **Parking owner view**, then switch between **Statistics** and
**Financials**.

### Other states to try
| State | How to see it |
|---|---|
| Reservation expired (no-show) | Presentation controls → **Expire now** while a reservation is active |
| Countdown warning (under 2 min) | Presentation controls → **Skip to last 2 min** |
| Zoomed-in map (`zoomed in.png`) | Scroll, double-click or pinch the map, or Presentation controls → **Toggle zoomed-in map** |
| Lot full | Tap the grey **FULL** marker, or Presentation controls → **Lot full state** |
| Offline / underground | Presentation controls → **Toggle offline**, or actually disconnect. A stale-data notice appears, QR codes still show and the map stops loading new tiles. |
| Dark mode | Settings → **Dark mode**. It follows your system setting by default. |
| Search, saved places, recents | Tap **Where to?** on the map |
| Favourites | Tap the heart on a lot's details sheet; it appears in Explore |

## Presentation controls

The panel next to the phone is for demos and presentations only. It is not part of the app
design. It can jump straight to any flow, fast-forward or expire the reservation timer,
toggle offline or dark mode, and **reset all demo data**.

The app screens themselves use real-app wording (**I've paid**, **Check in with NFC**, and so
on) with no "mock" or "prototype" labels, so they read as the finished product in a
presentation. Behind the scenes everything is still simulated: payments, OTP codes, gate
scans and lot counts. Tapping a gate QR code stands in for the gate's scanner reading it.

## Things to know

- **The look follows `docs/mockup/`.** The map stays on screen at all times, and every
  screen opens as a rounded sheet over it, like the lot-detail sheet in `space selected.png`.
- **The map is real OpenStreetMap, the parking is not.** Map tiles load from
  `tile.openstreetmap.org` when served over http (Option B), or from the OSM community
  server `tile.openstreetmap.de` when you open the file directly, because openstreetmap.org
  blocks pages opened from disk. Either way you need an internet connection; without one, the lots still
  appear on a blank background. The 20 lots are real places, drawn on their OpenStreetMap
  outlines with their street addresses:
  - **Ortigas Center:** SM Megamall Buildings A and C and its open lot, The Podium,
    Shangri-La Plaza and Robinsons Galleria.
  - **Quezon City:** SM North EDSA, TriNoma, Gateway Mall in Cubao and Eastwood Mall.
  - **Makati:** Greenbelt 5, Glorietta and Power Plant Mall.
  - **BGC, Taguig:** SM Aura, Market! Market! (full) and Uptown Mall.
  - **Elsewhere:** SM Mall of Asia (Pasay), Greenhills (San Juan), Robinsons Place
    Manila (Ermita) and Alabang Town Center (Muntinlupa). Their counts, rates and features are
  made up, and none of these malls is involved with the project.
- **"You are here" is fixed** on Doña Julia Vargas Ave. beside SM Megamall. Distances are
  straight-line from that point.

- **Your progress is saved in this browser** (`localStorage`), including reservations,
  favourites, recents and plate/phone, just as the real app would keep a local cache.
  Use **Reset demo data** or Settings → **Clear local data** to start fresh.
- **The countdown is real time.** A reservation genuinely expires 15 minutes later, even
  after a page reload. Use the controls to skip ahead.
- **Parking duration at scan-out is simulated** as 2h 15m, so the fee looks realistic.
- **Users never pick a slot.** The floor and slot are assigned randomly when you scan in,
  matching the "automatic assignment" design decision.
- **QR codes are placeholders.** They look like QR codes but can't be scanned.
- Lot counts, rates and owner figures are mock data, defined at the top of `source/app.js`
  together with each lot's address, map outline and photo credit. The photos are real (see
  **Photo credits** below).

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
source/
  index.html           ← all screens
  styles.css           ← design tokens and components
  app.js               ← screen router, 15-min countdown, mock data and flows
  img/                 ← lot photos from Wikimedia Commons (see Photo credits)
  vendor/leaflet/      ← Leaflet 1.9.4 map library (BSD-2), bundled so no CDN is needed
```

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).

## Photo credits

Lot photos come from [Wikimedia Commons](https://commons.wikimedia.org). Each has been cropped
and resized to `source/img/<lot id>.jpg`, and the lot sheet shows its credit. Cropped versions of
CC BY-SA photos are shared under the same licence as the original.

| Lot | Original file | Photographer | Licence |
|---|---|---|---|
| SM Megamall Basement 1 | [SM Megamall.jpg](https://commons.wikimedia.org/wiki/File:SM_Megamall.jpg) | Manager27 | CC BY-SA 4.0 |
| SM Megamall Open Parking | [SM Megamall Side View 6.jpg](https://commons.wikimedia.org/wiki/File:SM_Megamall_Side_View_6.jpg) | Ganmatthew | CC BY 4.0 |
| The Podium Parking | [Podium Mall ADB Avenue 1.jpg](https://commons.wikimedia.org/wiki/File:Podium_Mall_ADB_Avenue_1.jpg) | Ganmatthew | CC BY-SA 4.0 |
| Megamall Building C Carpark | [SM Megamall Side View 8.jpg](https://commons.wikimedia.org/wiki/File:SM_Megamall_Side_View_8.jpg) | Ganmatthew | CC BY 4.0 |
| Shangri-La Plaza Parking | [SHANGRI LA MALL PLAZA.jpg](https://commons.wikimedia.org/wiki/File:SHANGRI_LA_MALL_PLAZA.jpg) | Jhnry14 | CC BY-SA 4.0 |
| Robinsons Galleria Parking | [Robinsons Galleria, Ortigas Center, Apr 2025.jpg](https://commons.wikimedia.org/wiki/File:Robinsons_Galleria,_Ortigas_Center,_Apr_2025.jpg) | Ralff Nestor Nacor | CC BY-SA 4.0 |
| SM Mall of Asia Parking | [SM Mall of Asia Picture.jpg](https://commons.wikimedia.org/wiki/File:SM_Mall_of_Asia_Picture.jpg) | Jamesjames1024 | CC BY-SA 4.0 |
| SM North EDSA Parking | [SM City North EDSA, Q.C., Jun 2026.jpg](https://commons.wikimedia.org/wiki/File:SM_City_North_EDSA,_Q.C.,_Jun_2026.jpg) | Ralff Nestor Nacor | CC BY-SA 4.0 |
| TriNoma Parking | [09906jfBarangay Bagong Pag-asa North Avenue SM TriNoma Quezon Cityfvf 08.jpg](https://commons.wikimedia.org/wiki/File:09906jfBarangay_Bagong_Pag-asa_North_Avenue_SM_TriNoma_Quezon_Cityfvf_08.jpg) | Judgefloro | Public domain |
| Gateway Mall Parking | [09520jf Gateway Mall Araneta Center Cubao fvf 09.jpg](https://commons.wikimedia.org/wiki/File:09520jf_Gateway_Mall_Araneta_Center_Cubao_fvf_09.jpg) | Judgefloro | CC0 |
| Eastwood Mall Parking | [Interior of the Eastwood Mall (01) (2026-01-16).jpg](https://commons.wikimedia.org/wiki/File:Interior_of_the_Eastwood_Mall_%2801%29_%282026-01-16%29.jpg) | Wide Awake! | CC BY 4.0 |
| Greenbelt 5 Parking | [Greenbelt 5 Interior, Makati, Jul 2024.jpg](https://commons.wikimedia.org/wiki/File:Greenbelt_5_Interior,_Makati,_Jul_2024.jpg) | Ralff Nestor Nacor | CC BY-SA 4.0 |
| Glorietta Parking | [Glorietta Uniqlo.jpg](https://commons.wikimedia.org/wiki/File:Glorietta_Uniqlo.jpg) | ScarletViolet | CC BY-SA 4.0 |
| Power Plant Mall Parking | [Rockwell Power Plant Mall C (Dec 6, 2024).jpg](https://commons.wikimedia.org/wiki/File:Rockwell_Power_Plant_Mall_C_%28Dec_6,_2024%29.jpg) | RFNirmala | CC0 |
| SM Aura Parking | [SM Aura, BGC, Taguig, Aug 2026.jpg](https://commons.wikimedia.org/wiki/File:SM_Aura,_BGC,_Taguig,_Aug_2026.jpg) | Ralff Nestor Nacor | CC BY-SA 4.0 |
| Market! Market! Car Park | [Fort Bonifacio, Taguig, Metro Manila, Philippines - panoramio (35).jpg](https://commons.wikimedia.org/wiki/File:Fort_Bonifacio,_Taguig,_Metro_Manila,_Philippines_-_panoramio_%2835%29.jpg) | Idawriter | CC BY-SA 3.0 |
| Uptown Mall Parking | [Uptown Mall.jpg](https://commons.wikimedia.org/wiki/File:Uptown_Mall.jpg) | Lawrence Ruiz | CC BY-SA 4.0 |
| Greenhills Mall Parking | [Greenhills Shopping Center.jpg](https://commons.wikimedia.org/wiki/File:Greenhills_Shopping_Center.jpg) | Badudoy | CC BY 3.0 |
| Robinsons Place Manila Parking | [Robinsons Place Manila, May 2025 (1).jpg](https://commons.wikimedia.org/wiki/File:Robinsons_Place_Manila,_May_2025_%281%29.jpg) | Ralff Nestor Nacor | CC BY-SA 4.0 |
| Alabang Town Center Parking | [5749Ayala Alabang Landmarks 06.jpg](https://commons.wikimedia.org/wiki/File:5749Ayala_Alabang_Landmarks_06.jpg) | Judgefloro | CC0 |

## Branding

**Uy Parking!** · accent `#009f8b` · dark background `#021c1c` · light background `#f7f7f7`.
