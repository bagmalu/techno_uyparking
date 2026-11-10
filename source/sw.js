// Uy Parking! service worker: the app opens and runs offline, and map tiles already seen stay available.
// - App files: the network first, so edits and deploys show up straight away; the cache when offline,
//   or when the network takes longer than SLOW_MS (a weak signal underground).
// - Map tiles: kept as OpenStreetMap's headers allow (fresh for max-age, then shown while refetched,
//   and shown when offline, for up to STALE_DAYS); at most TILE_MAX are kept. Nothing is prefetched.
// - Fonts: the cache first.
// - Lot photos: the page stores them all in 'uyparking-photos' once it is online (app.js), so every lot
//   sheet has its photo offline; they are served like other app files.
// Bump VERSION when APP_FILES changes.
const VERSION = 1;
const APP = `uyparking-app-v${VERSION}`, TILES = 'uyparking-tiles', FONTS = 'uyparking-fonts';
const APP_FILES = ['./', 'index.html', 'styles.css', 'app.js', 'places.js', 'manifest.webmanifest',
  'vendor/leaflet/leaflet.css', 'vendor/leaflet/leaflet.js',
  'img/logo.png', 'img/icons/favicon-32.png', 'img/icons/icon-192.png'];
const SLOW_MS = 3000, STALE_DAYS = 7, TILE_MAX = 600;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('uyparking-app-') && k !== APP).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) e.respondWith(appFile(req));
  else if (url.hostname === 'tile.openstreetmap.org') e.respondWith(tile(req, e));
  else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') e.respondWith(font(req));
});

async function appFile(req) {
  const cache = await caches.open(APP);
  const photo = /\/img\/[^/]+\.jpg$/.test(new URL(req.url).pathname);   // kept in 'uyparking-photos' instead
  const network = fetch(req).then((res) => { if (res.ok && !photo) cache.put(req, res.clone()); return res; });
  network.catch(() => {});   // handled below
  try {
    const res = await Promise.race([network, new Promise((r) => setTimeout(r, SLOW_MS))]);
    if (res) return res;
  } catch { /* offline: use the cache */ }
  const cached = await caches.match(req, { ignoreSearch: true })   // any cache: lot photos are kept by the page (app.js)
    || (req.mode === 'navigate' && await cache.match('index.html'));
  return cached || network.catch(() => Response.error());   // nothing cached: wait for the network after all
}

let tilePuts = 0;
async function tile(req, e) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(req);
  const age = hit ? Date.now() - Number(hit.headers.get('x-cached-at')) : Infinity;
  const maxAge = hit ? Number(/max-age=(\d+)/.exec(hit.headers.get('cache-control') || '')?.[1] || 0) * 1000 : 0;
  const refresh = async () => {
    const res = await fetch(req);
    if (res.ok) {   // only CORS responses: an opaque one can't be checked and costs far more storage
      const headers = new Headers(res.headers);
      headers.set('x-cached-at', String(Date.now()));
      await cache.put(req, new Response(await res.clone().blob(), { status: res.status, statusText: res.statusText, headers }));
      if (++tilePuts % 50 === 0) trim(cache);
    }
    return res;
  };
  if (hit && age < maxAge) return hit;
  if (hit && age < STALE_DAYS * 864e5) { e.waitUntil(refresh().catch(() => {})); return hit; }
  try { return await refresh(); } catch (err) { if (hit) return hit; throw err; }
}
async function trim(cache) {   // oldest first
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - TILE_MAX)).map((k) => cache.delete(k)));
}

async function font(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}
