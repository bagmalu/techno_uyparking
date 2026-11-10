# Uy Parking! — HTML prototype

Open `index.html` directly, or run `python -m http.server 8777` in this folder and visit
<http://localhost:8777>. No build step is needed.

- `index.html` — every screen, as `<section class="screen" id="screen-…">`
- `styles.css` — tokens mirror `../docs/design-system.md`
- `app.js` — mock lot data (with real OSM outlines and addresses), the Leaflet map
  (`initMap`, `focusLot`, `renderMap`), the screen router (`go` / `back` / `tab`), the 1 hour 15 minute
  reservation countdown (`tick`), automatic slot assignment (`entryScan`) and the demo
  shortcuts (`DEMO_FLOWS`)
- `places.js` — popular businesses (Jollibee, McDonald's, Starbucks, Mercury Drug, banks, …)
  and landmarks from OpenStreetMap, kept only within 700 m of a lot. Search falls back to
  these when no lot matches (`placeHits`, `lotsNear` in `app.js`)
- `vendor/leaflet/` — Leaflet 1.9.4. Tiles come from `tile.openstreetmap.org`, or from
  `tile.openstreetmap.de` when the page is opened as `file://` (openstreetmap.org rejects
  requests without a Referer). The base map needs an internet connection.
- `manifest.webmanifest`, `sw.js`, `img/icons/` — the installable app. The service worker
  (registered only over http/https) serves app files network-first with a cached fallback,
  keeps OpenStreetMap tiles as their cache headers allow (at most 600, up to a week stale
  when offline), and serves the lot photos that `app.js` stores in `uyparking-photos`. Bump
  `VERSION` in `sw.js` when its `APP_FILES` list changes. Real loss of connection turns on
  the same offline banner as the demo toggle (`state.offline === 'network'`).

See the root [README](../README.md) for a walkthrough of each flow.
