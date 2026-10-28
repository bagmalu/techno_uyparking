# Uy Parking! — HTML prototype

Open `index.html` directly, or run `python -m http.server 8777` in this folder and visit
<http://localhost:8777>. No build step is needed.

- `index.html` — every screen, as `<section class="screen" id="screen-…">`
- `styles.css` — tokens mirror `../docs/design-system.md`
- `app.js` — mock lot data (with real OSM outlines and addresses), the Leaflet map
  (`initMap`, `focusLot`, `renderMap`), the screen router (`go` / `back` / `tab`), the 15-minute
  reservation countdown (`tick`), automatic slot assignment (`entryScan`) and the demo
  shortcuts (`DEMO_FLOWS`)
- `vendor/leaflet/` — Leaflet 1.9.4. Tiles come from `tile.openstreetmap.org`, or from
  `tile.openstreetmap.de` when the page is opened as `file://` (openstreetmap.org rejects
  requests without a Referer). The base map needs an internet connection.

See the root [README](../README.md) for a walkthrough of each flow.
