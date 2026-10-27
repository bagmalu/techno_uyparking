/* Uy Parking! clickable prototype — everything here is mocked.
   Screen router, 15-min reservation countdown, mock lot / slot / QR data. */
'use strict';

// ---------- locked product constants (see CLAUDE.md) ----------
const GRACE_MS = 15 * 60 * 1000;   // reservation grace period
const RESERVATION_FEE = 50;        // paid up front
const FEE_CREDIT = 35;             // deducted from the final parking fee
const DEMO_MINUTES = 135;          // simulated parking duration at scan-out

// ---------- mock data ----------
const LOTS = [
  { id: 'sm-b1', name: 'SM Basement Parking 1', area: 'SM City · Basement', capacity: 120, parked: 82, reserved: 15, rate: 40,
    accessible: true, ev: false, covered: true, distance: '120 m', walk: '2 min',
    x: 52, y: 24, rot: -6, w: 30, h: 28, busy: 1.0, tone: '#cfd3d6', sign: 'SM', floors: ['B1', 'B2'],
    landmarks: ['near Elevator B', 'beside Entrance 2', 'by the ramp to B2'] },
  { id: 'open-b', name: 'SM Open Lot B', area: 'SM City · Ground', capacity: 60, parked: 18, reserved: 4, rate: 30,
    accessible: true, ev: false, covered: false, distance: '350 m', walk: '5 min',
    x: 22, y: 31, rot: 28, w: 13, h: 30, busy: .6, tone: '#d9cdb8', sign: 'LOT B', floors: ['G'],
    landmarks: ['near the mall side door', 'by the guard house'] },
  { id: 'north', name: 'North Tower P2', area: 'North Tower · Level P2', capacity: 80, parked: 40, reserved: 8, rate: 50,
    accessible: true, ev: true, covered: true, distance: '400 m', walk: '6 min',
    x: 71, y: 43, rot: 4, w: 10, h: 26, busy: .8, tone: '#b9c4cc', sign: 'NT', floors: ['P2', 'P3'],
    landmarks: ['next to the EV chargers', 'near Lift Lobby A'] },
  { id: 'annex', name: 'Annex Carpark', area: 'Annex Building', capacity: 30, parked: 27, reserved: 3, rate: 35,
    accessible: false, ev: false, covered: true, distance: '250 m', walk: '4 min',
    x: 28, y: 48, rot: -10, w: 26, h: 20, busy: 1.15, tone: '#d1c2c2', sign: 'ANNEX', floors: ['1'],
    landmarks: ['by the stairwell'] },
  { id: 'riverside', name: 'Riverside Lot', area: 'Riverside Walk', capacity: 50, parked: 30, reserved: 2, rate: 30,
    accessible: true, ev: true, covered: false, distance: '650 m', walk: '9 min',
    x: 40, y: 67, rot: 14, w: 50, h: 18, busy: .75, tone: '#c8d4c4', sign: 'RIVERSIDE', floors: ['G'],
    landmarks: ['near the riverside gate'] },
  { id: 'plaza', name: 'Plaza Covered Deck', area: 'Central Plaza', capacity: 100, parked: 85, reserved: 8, rate: 45,
    accessible: true, ev: true, covered: true, distance: '800 m', walk: '11 min',
    x: 66, y: 77, rot: -4, w: 26, h: 24, busy: 1.1, tone: '#c9c6d6', sign: 'PLAZA', floors: ['L2', 'L3', 'L4'],
    landmarks: ['near Elevator 3', 'beside the food court bridge'] },
];

const SAVED_PLACES = [
  { icon: 'i-home', name: 'Home', sub: 'Riverside Walk', lotId: 'riverside' },
  { icon: 'i-pin', name: 'SM City', sub: 'Preset · mall', lotId: 'sm-b1' },
  { icon: 'i-pin', name: 'Office', sub: 'North Tower', lotId: 'north' },
];

// typical occupancy 6 AM → 9 PM (16 hourly bars), scaled per lot and day
const BASE_TREND = [.22, .27, .3, .36, .32, .45, .6, .5, .42, .52, .62, .72, .84, .78, .62, .5];
const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const DAY_FACTOR = [1.12, .9, .92, .95, 1, 1.06, 1.15];

const OWNER = {
  hourly: [18, 25, 31, 42, 40, 55, 71, 64, 52, 60, 74, 86, 93, 88, 70, 54],
  txns: [
    { what: 'Parking fee · NBC 1234', when: 'Today 5:42 PM', amt: 85 },
    { what: 'Reservation fee · #204', when: 'Today 5:31 PM', amt: 50 },
    { what: 'Parking fee · walk-in', when: 'Today 5:18 PM', amt: 120 },
    { what: 'Reservation fee · #203', when: 'Today 5:02 PM', amt: 50 },
    { what: 'Parking fee · ABK 772', when: 'Today 4:47 PM', amt: 45 },
  ],
};

// ---------- state (kept in local cache, like the real app would) ----------
const STORE_KEY = 'uyparking-proto-v1';

function defaultState() {
  return {
    reservation: null,   // { lotId, ref, createdAt, expiresAt }
    session: null,       // { lotId, floor, slot, landmark, enteredAt, reserved, ref, paid, payMethod }
    lastExpired: null,
    favorites: ['sm-b1'],
    recents: ['north', 'plaza'],
    history: [
      { lotId: 'north', ref: '#188', date: 'Oct 21', status: 'Completed' },
      { lotId: 'sm-b1', ref: '#152', date: 'Oct 14', status: 'Expired' },
    ],
    identity: null,      // { type: 'plate' | 'phone', value }
    theme: null,
    offline: false,
  };
}

let state = load();
const ui = { selectedLot: null, pendingLot: null, payCtx: 'reserve', payMethod: 'qrph',
  walkinLot: 'sm-b1', walkinQr: false, focusLot: null, assignLot: null, exitDone: false, ownerTab: 'stats', trendDay: new Date().getDay(), trendSel: null };

function load() {
  try { return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORE_KEY)) || {}); }
  catch { return defaultState(); }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode etc. */ }
}

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const lotById = (id) => LOTS.find((l) => l.id === id);
const peso = (n) => `₱${n.toLocaleString('en-PH')}`;
const icon = (id, cls = '') => `<svg class="ic ${cls}"><use href="#${id}"/></svg>`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
const today = () => new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
const hourLabel = (i) => { const h = 6 + i; return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`; };

function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), h = (h << 13) | (h >>> 19);
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

// Live counts: total taken = parked + reserved (the user's own booking/session included).
function stats(lot) {
  const reserved = lot.reserved + (state.reservation?.lotId === lot.id ? 1 : 0);
  const parked = lot.parked + (state.session?.lotId === lot.id ? 1 : 0);
  const taken = Math.min(lot.capacity, parked + reserved);
  const left = lot.capacity - taken;
  const pct = taken / lot.capacity;
  // marker strength (mockup): solid teal = plenty of space, pale = nearly full
  const lvl = left === 0 ? 'full' : left >= 20 ? 'high' : left >= 10 ? 'mid' : 'low';
  const status = left === 0 ? 'full' : pct >= .7 ? 'filling' : 'available';
  return { parked, reserved, taken, left, pct, lvl, status };
}
const STATUS_LABEL = { available: 'Available', filling: 'Filling up', full: 'Full' };
const statusChip = (s) => `<span class="chip ${s.status}">${STATUS_LABEL[s.status]}</span>`;

// ---------- placeholder visuals ----------
function qrSvg(seed, cls = 'qr') {
  const n = 25, rnd = seeded(seed);
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let cells = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > .52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg class="${cls}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="Placeholder QR code"><g fill="#021c1c">${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${cells}</g></svg>`;
}

let photoN = 0;
function lotPhoto(lot, cls = 'photo') {
  const id = `sky${photoN++}`;
  const floors = [0, 1, 2, 3].map((i) => `<rect x="60" y="${64 + i * 19}" width="230" height="5" fill="rgba(0,0,0,.16)"/>`).join('');
  return `<svg class="${cls}" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of ${esc(lot.name)}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb8e8"/><stop offset="1" stop-color="#d7eefb"/></linearGradient></defs>
    <rect width="320" height="160" fill="url(#${id})"/>
    <rect x="18" y="22" width="52" height="130" fill="#97a3ab"/><rect x="24" y="30" width="40" height="110" fill="#aab5bc"/>
    <rect x="60" y="52" width="232" height="96" fill="${lot.tone}"/>${floors}
    <rect x="150" y="30" width="96" height="34" fill="#55616a"/>
    <text x="198" y="53" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#fff">${esc(lot.sign)}</text>
    <rect x="96" y="122" width="96" height="9" fill="#c0392b"/><rect x="192" y="122" width="98" height="9" fill="#1d4ed8"/>
    <text x="241" y="130" text-anchor="middle" font-family="Arial" font-weight="700" font-size="8" fill="#fff">ENTRANCE</text>
    <rect y="146" width="320" height="14" fill="#8e9192"/>
    <circle cx="14" cy="96" r="26" fill="#3f7d3a"/><rect x="11" y="110" width="6" height="40" fill="#5b4632"/>
    <rect x="296" y="96" width="14" height="22" rx="2" fill="#1d4ed8"/><text x="303" y="112" text-anchor="middle" font-family="Arial" font-weight="700" font-size="12" fill="#fff">P</text>
  </svg>`;
}

function floorMap(session) {
  const cols = 10, slotW = 24, gap = 4, x0 = 46;
  const idx = (session.slot - 1) % (cols * 2);
  const rnd = seeded(session.lotId + session.slot);
  let slots = '';
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, x = x0 + c * (slotW + gap), y = r === 0 ? 14 : 112;
    const mine = i === idx;
    slots += `<rect class="slot ${mine ? 'mine' : rnd() > .35 ? 'taken' : ''}" x="${x}" y="${y}" width="${slotW}" height="40" rx="3"/>`;
    if (mine) slots += `<text x="${x + slotW / 2}" y="${y + 25}" text-anchor="middle" style="fill:#021c1c">${session.slot}</text>`;
  }
  const c = idx % cols, row = idx < cols ? 0 : 1;
  const tx = x0 + c * (slotW + gap) + slotW / 2, ty = row === 0 ? 56 : 110;
  return `<svg class="floormap" viewBox="0 0 340 166" role="img" aria-label="Floor ${esc(session.floor)} map with your slot highlighted">
    <rect class="lane" x="0" y="62" width="340" height="42"/>
    ${slots}
    <rect x="4" y="66" width="34" height="34" rx="4" fill="#3b82f6"/><text x="21" y="87" text-anchor="middle" style="fill:#fff">LIFT</text>
    <path class="path" d="M38 83 H${tx} V${ty}"/>
    <text x="4" y="160">Floor ${esc(session.floor)} · not to scale</text>
  </svg>`;
}

// The art covers 2× the viewport in each direction (viewBox 800×1600); the visible
// map at zoom 1 is the centre region (200..600, 400..1200), where markers live.
function drawMapArt() {
  const rnd = seeded('uy-parking-map');
  let blocks = '';
  for (let y = 0; y < 1600; y += 44) for (let x = 0; x < 800; x += 44) {
    const n = rnd() < .45 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const w = 12 + rnd() * 22, h = 10 + rnd() * 22, bx = x + 3 + rnd() * (40 - w), by = y + 3 + rnd() * (40 - h);
      blocks += `<rect class="block" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" transform="rotate(${((rnd() - .5) * 24).toFixed(1)} ${(bx + w / 2).toFixed(1)} ${(by + h / 2).toFixed(1)})"/>`;
    }
  }
  const ring = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const cx = 400, cy = 820, R = 70;
  // radial avenues out of the central roundabout, slightly bent like the mockup
  const spokes = [-92, -62, -118, -20, 20, 158, 200, 96].map((deg) => {
    const a = (deg * Math.PI) / 180, b = a + .12;
    const x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R;
    const xm = cx + Math.cos(b) * 380, ym = cy + Math.sin(b) * 380;
    const x2 = cx + Math.cos(a) * 1100, y2 = cy + Math.sin(a) * 1100;
    return `M${x1.toFixed(0)} ${y1.toFixed(0)} Q${xm.toFixed(0)} ${ym.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}`;
  });
  const cross = ['M-20 560 Q400 500 820 575', 'M-20 1090 Q400 1040 820 1100', 'M-20 300 Q400 260 820 320',
    'M-20 1380 Q400 1330 820 1400', 'M140 -20 Q170 800 120 1620', 'M690 -20 Q650 800 700 1620'];
  const rings = [ring(cx, cy, R), ring(404, 535, 11), ring(388, 1068, 11), ring(560, 548, 10), ring(222, 556, 10),
    ring(160, 1090, 10), ring(640, 1094, 10), ring(150, 300, 10), ring(672, 312, 10)];
  $('#mapArt').innerHTML = blocks + [...spokes, ...cross, ...rings].map((d) => `<path class="road" d="${d}" stroke-width="5"/>`).join('');
}

// ---------- map view: pan / zoom / focus ----------
const view = { s: 1, x: 0, y: 0 };
let userView = { ...view };
const ZOOMED_AT = 1.6, FOCUS_SCALE = 2.3;

function mapSize() { const r = $('#map').getBoundingClientRect(); return { W: r.width, H: r.height }; }
function clampView() {
  const { W, H } = mapSize();
  view.s = Math.min(3, Math.max(1, view.s));
  // the art extends half a viewport beyond each edge
  view.x = Math.min(.5 * W * view.s, Math.max(W - 1.5 * W * view.s, view.x));
  view.y = Math.min(.5 * H * view.s, Math.max(H - 1.5 * H * view.s, view.y));
}
function applyView(animate = true) {
  const layer = $('#mapLayer');
  layer.classList.toggle('no-anim', !animate);
  layer.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  layer.style.setProperty('--s', view.s);
  $('#map').classList.toggle('zoomed', view.s >= ZOOMED_AT);
}
function setView(v, animate = true) { Object.assign(view, v); clampView(); applyView(animate); }
function zoomAt(px, py, factor, animate = true) {
  const s2 = Math.min(3, Math.max(1, view.s * factor)), k = s2 / view.s;
  setView({ s: s2, x: px - k * (px - view.x), y: py - k * (py - view.y) }, animate);
  userView = { ...view };
}
// Put a lot in the strip of map left visible above the sheet (like space selected.png)
function focusLot(id) {
  const lot = lotById(id);
  if (!lot) return;
  const { W, H } = mapSize();
  setView({ s: FOCUS_SCALE, x: W * .5 - FOCUS_SCALE * (lot.x / 100) * W, y: H * .19 - FOCUS_SCALE * (lot.y / 100) * H });
}

// which lot the map should centre on for each screen
const FOCUS = {
  reserve: () => ui.pendingLot,
  otp: () => ui.pendingLot,
  pay: () => (ui.payCtx === 'exit' ? state.session?.lotId : ui.pendingLot),
  resqr: () => state.reservation?.lotId,
  expired: () => state.lastExpired?.lotId,
  walkin: () => ui.walkinLot,
  assigning: () => ui.assignLot,
  parked: () => state.session?.lotId,
  locator: () => state.session?.lotId,
  session: () => state.session?.lotId,
  exit: () => state.session?.lotId,
};

function initMapGestures() {
  const map = $('#map');
  const pts = new Map();
  let last = null, moved = 0, pinch = 0;
  map.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last = { x: e.clientX, y: e.clientY }; moved = 0;
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  map.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = map.getBoundingClientRect();
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch, false);
      pinch = d; moved = 99;
      return;
    }
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    last = { x: e.clientX, y: e.clientY };
    if (moved > 6) {
      if (!map.classList.contains('dragging')) { map.classList.add('dragging'); map.setPointerCapture(e.pointerId); }
      setView({ x: view.x + dx, y: view.y + dy }, false);
      userView = { ...view };
    }
  });
  const end = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; map.classList.remove('dragging'); };
  map.addEventListener('pointerup', end);
  map.addEventListener('pointercancel', end);
  // a drag must not count as a tap on a marker
  map.addEventListener('click', (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
  map.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = map.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.25 : 0.8);
  }, { passive: false });
  map.addEventListener('dblclick', (e) => {
    const r = map.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, view.s >= ZOOMED_AT ? 0.4 : 2);
  });
}

// ---------- router ----------
const TABS = ['map', 'scan', 'explore'];
let stack = ['map'];
let current = 'map';

function show(name) {
  current = name;
  const app = $('#app');
  const screen = $(`#screen-${name}`);
  $$('.screen').forEach((s) => s.classList.toggle('active', s === screen));
  app.dataset.screen = name;
  app.classList.toggle('has-tabs', TABS.includes(name));
  app.classList.toggle('is-root', TABS.includes(name));
  app.classList.toggle('no-back', screen.dataset.back === 'none');
  $$('#tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tabId === name));
  closeDrawer();
  hideSearch();
  RENDER[name]?.();
  const panel = screen.querySelector('.panel:not(.sheet)');
  if (panel) { panel.classList.remove('expanded'); panel.scrollTop = 0; }

  const focusId = FOCUS[name]?.();
  ui.focusLot = focusId || null;
  if (focusId) focusLot(focusId);
  else if (name === 'map' && ui.selectedLot) focusLot(ui.selectedLot);
  else setView(userView);
  renderMap();
}
function go(name, { replace = false } = {}) { if (replace) stack.pop(); stack.push(name); show(name); }
function back() {
  const mode = $(`#screen-${current}`).dataset.back;
  if (mode === 'none') return;
  if (mode === 'home' || stack.length <= 1) { ACTIONS.home(); return; }
  stack.pop();
  show(stack[stack.length - 1]);
}
function tab(name) { stack = [name]; show(name); }
function goFrom(root, name) { stack = [root, name]; show(name); }

// ---------- map ----------
function renderMap() {
  $('#markers').innerHTML = LOTS.map((lot) => {
    const s = stats(lot);
    const cls = ['marker', `lvl-${s.lvl}`];
    if (ui.selectedLot === lot.id || ui.focusLot === lot.id) cls.push('selected');
    if (state.reservation?.lotId === lot.id) cls.push('reserved');
    return `<button class="${cls.join(' ')}" style="left:${lot.x}%;top:${lot.y}%;--w:${lot.w}px;--h:${lot.h}px;--rot:${lot.rot}deg"
      data-action="openLot" data-id="${lot.id}" aria-label="${esc(lot.name)}: ${s.left} spaces left, ${STATUS_LABEL[s.status]}">
      <b>${s.left || 'Full'}</b></button>`;
  }).join('');
  renderBanners();
}

// w reserved.png: "SM Basement 1 Parking | # 206" pill under the search bar
function renderBanners() {
  let html = '';
  if (state.reservation) {
    const lot = lotById(state.reservation.lotId);
    html += `<button class="banner" data-action="go" data-to="resqr" data-banner="res">
      <span>${esc(lot.name)}</span><span class="sep"></span><span>${state.reservation.ref}</span>
      <span class="left" data-banner-left hidden>· <span data-countdown>--:--</span></span></button>`;
  }
  if (state.session) {
    html += `<button class="banner parked" data-action="go" data-to="locator">
      <span>Floor ${esc(state.session.floor)}</span><span class="sep"></span><span>Slot ${state.session.slot}</span></button>`;
  }
  $('#mapBanners').innerHTML = html;
  tick();
}

function openLot(id) {
  hideSearch();
  ui.selectedLot = id;
  ui.trendSel = null;
  ui.trendDay = new Date().getDay();
  renderSheet();
  $('#sheet').scrollTop = 0;
  $('#app').classList.add('sheet-open');
  focusLot(id);
  renderMap();
}
function closeSheet() {
  if (!ui.selectedLot) return;
  ui.selectedLot = null;
  $('#app').classList.remove('sheet-open');
  if (current === 'map') setView(userView);
  renderMap();
}

function liveIndex() { const i = new Date().getHours() - 6; return i >= 0 && i < 16 ? i : 12; }

// space selected.png
function renderSheet() {
  const lot = lotById(ui.selectedLot);
  if (!lot) return;
  const s = stats(lot);
  const fav = state.favorites.includes(lot.id);
  const mine = state.reservation?.lotId === lot.id;
  const alternative = LOTS.filter((l) => l.id !== lot.id && stats(l).left > 0).sort((a, b) => parseInt(a.distance) - parseInt(b.distance))[0];

  let cta;
  if (mine) cta = `<button class="btn primary lg block" data-action="go" data-to="resqr">View reservation</button>`;
  else if (state.reservation) cta = `<button class="btn primary lg block" disabled>You already have a reservation</button>`;
  else if (s.status === 'full') cta = `<button class="btn primary lg block" disabled>Full — no space to assign</button>
      <button class="btn text block" data-action="openLot" data-id="${alternative.id}">Try ${esc(alternative.name)} · ${stats(alternative).left} left</button>`;
  else cta = `<button class="btn primary lg block" data-action="reserve" data-id="${lot.id}">Reserve</button>`;

  $('#sheetBody').innerHTML = `
    <div class="sheet-title">
      <h1 class="panel-title">${esc(lot.name)}</h1>
      <button class="fav-btn ${fav ? 'on' : ''}" data-action="fav" data-id="${lot.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove from' : 'Add to'} favorites">${icon('i-heart')}</button>
    </div>
    <p class="lot-sub"><b>${s.left ? `${s.left} slots left` : 'Full'}</b> · ${s.parked} parked + ${s.reserved} reserved / ${lot.capacity} · ${lot.distance}</p>

    ${lotPhoto(lot)}

    <div class="attrs">
      <span class="attr ${lot.accessible ? '' : 'off'}">${icon('i-access')} Accessible</span>
      <span class="attr ${lot.ev ? '' : 'off'}">${icon('i-ev')} EV Charging</span>
      <span class="attr ${lot.covered ? '' : 'off'}">${icon('i-covered')} Covered</span>
      <span class="attr rate">${peso(lot.rate)}/hr</span>
    </div>

    <div class="trend" id="trend"></div>
    ${cta}
    <p class="sheet-note">You don't pick a slot. The gate assigns your floor and slot when you scan in.</p>`;
  renderTrend(lot);
}

function renderTrend(lot) {
  const f = DAY_FACTOR[ui.trendDay];
  const vals = BASE_TREND.map((v, i) => Math.min(.98, v * lot.busy * f + (seeded(lot.id + i)() - .5) * .06));
  const isToday = ui.trendDay === new Date().getDay();
  const live = isToday ? liveIndex() : -1;
  const sel = ui.trendSel ?? (live >= 0 ? live : 10);
  const s = stats(lot);

  let label;
  if (sel === live) label = `<b>Live ${hourLabel(sel)}</b> • ${s.left} slots left`;
  else {
    const left = Math.round(lot.capacity * (1 - vals[sel]));
    label = `${hourLabel(sel)} • Usually has ${Math.max(0, left - 3)}-${left + 2} slots left`;
  }

  $('#trend').innerHTML = `
    <select data-action-change="trendDay" aria-label="Day of week">
      ${DAYS.map((d, i) => `<option value="${i}" ${i === ui.trendDay ? 'selected' : ''}>${d}</option>`).join('')}
    </select>
    <div class="trend-label">${label}</div>
    <div class="bars">
      ${vals.map((v, i) => `<button class="bar ${i === sel ? 'sel' : ''} ${i === live ? 'is-live' : ''}" style="height:${Math.round(v * 100)}%"
          data-action="trendBar" data-i="${i}" aria-label="${hourLabel(i)}">
          ${i === live ? `<span class="live" style="height:${Math.min(100, Math.round((s.pct / v) * 100))}%"></span>` : ''}</button>`).join('')}
    </div>
    <div class="bar-axis"><span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span><span>9p</span></div>`;
}

// ---------- search ----------
function renderSearch(q = '') {
  const query = q.trim().toLowerCase();
  const lotRow = (lot, ic = 'i-pin', sub) => {
    const s = stats(lot);
    return `<button class="row" data-action="pickLot" data-id="${lot.id}">${icon(ic)}
      <span>${esc(lot.name)}<small>${sub || `${esc(lot.area)} · ${lot.distance}`}</small></span>${statusChip(s)}</button>`;
  };
  let html;
  if (query) {
    const hits = LOTS.filter((l) => `${l.name} ${l.area}`.toLowerCase().includes(query));
    html = `<h4>Parking near “${esc(q.trim())}”</h4>` + (hits.length ? hits.map((l) => lotRow(l)).join('') : `<p class="empty" style="padding:8px 16px">No lots found. Try “SM”, “Plaza” or “Tower”.</p>`);
  } else {
    html = `<h4>Saved places</h4>` + SAVED_PLACES.map((p) => `<button class="row" data-action="pickLot" data-id="${p.lotId}">${icon(p.icon)}
      <span>${p.name}<small>${p.sub} · nearest: ${esc(lotById(p.lotId).name)}</small></span>${icon('i-chevron', 'sm')}</button>`).join('')
      + `<h4>Recent searches</h4>` + (state.recents.length ? state.recents.map((id) => lotRow(lotById(id), 'i-history')).join('') : `<p class="empty" style="padding:8px 16px">Nothing yet.</p>`)
      + `<h4>Nearby</h4>` + [...LOTS].sort((a, b) => parseInt(a.distance) - parseInt(b.distance)).slice(0, 3).map((l) => lotRow(l)).join('');
  }
  $('#searchResults').innerHTML = html;
  $('#searchPanel').hidden = false;
}
function hideSearch() { $('#searchPanel').hidden = true; }
function pickLot(id) {
  state.recents = [id, ...state.recents.filter((r) => r !== id)].slice(0, 4);
  save();
  $('#searchInput').value = '';
  $('#searchInput').blur();
  hideSearch();
  if (current !== 'map') tab('map');
  openLot(id);
}

// ---------- reserve ----------
function renderReserve() {
  const lot = lotById(ui.pendingLot);
  const s = stats(lot);
  const who = state.identity ? `${state.identity.type === 'plate' ? 'Plate' : 'Phone'} ${esc(state.identity.value)}` : 'Guest — add a plate or phone next';
  $('#reserveBody').innerHTML = `
    <div class="card">
      <h3>${esc(lot.name)}</h3>
      <p class="caption" style="margin:0 0 8px">${esc(lot.area)} · ${lot.distance} · ${peso(lot.rate)}/hr</p>
      ${statusChip(s)} <span class="caption">${s.left} spaces left right now</span>
    </div>

    <div class="notice">${icon('i-car')}<div><b>Your space is assigned at the gate</b>
      Scan your QR or tap NFC at the entrance and we'll assign an open floor and slot for you.</div></div>

    <div class="notice">${icon('i-clock')}<div><b>Arrive within 15 minutes</b>
      If you don't scan in within 15 minutes, the reservation is released automatically for other drivers.</div></div>

    ${lot.accessible ? `<div class="notice">${icon('i-info')}<div><b>About accessible spaces</b>
      This lot has accessible spaces near the elevators. Please leave them for drivers who need them. We don't check eligibility.</div></div>` : ''}

    <div class="card">
      <div class="kv"><span>Reservation fee (pay now)</span><span>${peso(RESERVATION_FEE)}</span></div>
      <div class="kv credit"><span>Credited to your parking fee at exit</span><span>−${peso(FEE_CREDIT)}</span></div>
      <div class="kv total"><span>Pay now</span><span>${peso(RESERVATION_FEE)}</span></div>
    </div>

    <div class="kv"><span>Reserving as</span><span>${who}</span></div>
    <div class="btn-stack"><button class="btn primary lg block" data-action="confirmReserve">Continue to pay ${peso(RESERVATION_FEE)}</button></div>`;
}

function afterIdentity() {
  ui.payCtx = 'reserve';
  renderDrawer();
  go('pay', { replace: current === 'otp' });
}

// ---------- payment ----------
function renderPay() {
  const exit = ui.payCtx === 'exit';
  const lot = lotById(exit ? state.session.lotId : ui.pendingLot);
  const amount = exit ? fees().due : RESERVATION_FEE;
  $('#payTitle').textContent = exit ? 'Pay parking fee' : 'Pay reservation fee';
  const qr = ui.payMethod === 'qrph';
  $('#payBody').innerHTML = `
    <div class="center" style="margin-bottom:16px">
      <span class="caption">${exit ? 'Amount due' : 'Reservation fee'} · ${esc(lot.name)}</span>
      <div class="display">${peso(amount)}</div>
      ${exit ? '' : `<span class="caption">${peso(FEE_CREDIT)} of this comes off your parking fee at exit</span>`}
    </div>
    <div class="segmented">
      <button class="seg ${qr ? 'active' : ''}" data-action="payMethod" data-m="qrph">${icon('i-qr', 'sm')} QR Ph</button>
      <button class="seg ${qr ? '' : 'active'}" data-action="payMethod" data-m="nfc">${icon('i-nfc', 'sm')} NFC</button>
    </div>
    <div class="ticket">
      ${qr ? `<div class="ref">Scan with any QR Ph bank or e-wallet app</div>
        <h3>Uy Parking! · ${esc(lot.name)}</h3>${qrSvg('pay' + amount + lot.id)}
        <div class="qr-cap">Universal QR Ph · merchant QR (mock)</div>`
      : `<div class="pulse" style="margin:8px auto 12px">${icon('i-nfc', 'xl')}</div>
        <h3>Hold your phone or card near the reader</h3><div class="ref">Contactless / NFC payment (mock)</div>`}
    </div>
    <button class="btn primary lg block" data-action="paid">Simulate successful payment</button>
    <p class="caption center">Visual mock only. No real payment is made.</p>`;
}

function fees() {
  const lot = lotById(state.session.lotId);
  const hours = Math.ceil(DEMO_MINUTES / 60);
  const fee = lot.rate * hours;
  const credit = state.session.reserved ? FEE_CREDIT : 0;
  return { hours, fee, credit, due: Math.max(0, fee - credit) };
}

function paid() {
  if (ui.payCtx === 'reserve') {
    const now = Date.now();
    state.reservation = { lotId: ui.pendingLot, ref: `#${200 + Math.floor(Math.random() * 90)}`, createdAt: now, expiresAt: now + GRACE_MS };
    state.history.unshift({ lotId: ui.pendingLot, ref: state.reservation.ref, date: today(), status: 'Active' });
    save();
    $('#app').classList.remove('sheet-open');
    ui.selectedLot = null;
    goFrom('map', 'resqr');
    toast(`${peso(RESERVATION_FEE)} paid. Your reservation is ready.`);
  } else {
    state.session.paid = true;
    state.session.payMethod = ui.payMethod;
    save();
    ui.exitDone = false;
    go('exit', { replace: true });
    toast(`${peso(fees().due)} paid.`);
  }
}

function setHistoryStatus(ref, status) {
  const h = state.history.find((x) => x.ref === ref);
  if (h) h.status = status;
}

// ---------- reservation QR + countdown ----------
function renderResQr() {
  const r = state.reservation;
  if (!r) { show(state.lastExpired ? 'expired' : 'map'); return; }
  const lot = lotById(r.lotId);
  $('#resqrBody').innerHTML = `
    <div class="ticket">
      <div class="ref">Reservation ${r.ref}</div>
      <h3>${esc(lot.name)}</h3>
      <div class="countdown" data-countdown>--:--</div>
      <div class="caption">left to scan in at the entrance</div>
      <div class="progress" data-progress><i></i></div>
      ${qrSvg(r.ref + r.lotId)}
      <div class="qr-cap">${state.offline ? 'Saved offline. Works without signal.' : 'Show this at the gate, or tap NFC.'}</div>
    </div>
    <div class="center" style="margin-bottom:12px"><span class="status-line">${icon('i-info', 'sm')} Floor &amp; slot: assigned when you scan in</span></div>
    <div class="card tinted">
      <div class="kv"><span>Reservation fee</span><span>${peso(RESERVATION_FEE)} paid</span></div>
      <div class="kv credit"><span>Credit at exit</span><span>−${peso(FEE_CREDIT)}</span></div>
      <div class="kv"><span>Reserved for</span><span>${esc(state.identity?.value || 'Guest')}</span></div>
    </div>
    <div class="btn-stack">
      <button class="btn primary lg block" data-action="entryScan" data-via="reservation">${icon('i-qr')} I'm at the gate — scan QR</button>
      <button class="btn secondary block" data-action="entryScan" data-via="reservation">${icon('i-nfc')} Tap NFC instead</button>
      <button class="btn text block" data-action="cancelReservation">Cancel reservation</button>
    </div>`;
  tick();
}

function tick() {
  const r = state.reservation;
  if (!r) return;
  const left = r.expiresAt - Date.now();
  if (left <= 0) { expireReservation(); return; }
  const mm = String(Math.floor(left / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  const warn = left < 2 * 60 * 1000;
  $$('[data-countdown]').forEach((el) => { el.textContent = `${mm}:${ss}`; el.classList.toggle('warn', warn); });
  $$('[data-progress]').forEach((el) => { el.classList.toggle('warn', warn); el.firstElementChild.style.width = `${(left / GRACE_MS) * 100}%`; });
  $$('[data-banner="res"]').forEach((el) => el.classList.toggle('warn', warn));
  $$('[data-banner-left]').forEach((el) => { el.hidden = !warn; });
}

function expireReservation() {
  const r = state.reservation;
  state.lastExpired = r;
  state.reservation = null;
  setHistoryStatus(r.ref, 'Expired');
  save();
  if (current === 'resqr') goFrom('map', 'expired');
  else {
    toast(`Reservation ${r.ref} was released after 15 minutes.`);
    if (current === 'map') { renderMap(); if (ui.selectedLot) renderSheet(); }
  }
}

function renderExpired() {
  const r = state.lastExpired;
  const lot = r ? lotById(r.lotId) : LOTS[0];
  $('#expiredBody').innerHTML = `
    <div class="big-icon warn">${icon('i-clock')}</div>
    <h2 style="margin:0 0 8px">Your 15 minutes are up</h2>
    <p class="lead">You didn't scan in within the grace period, so reservation ${r ? r.ref : ''} at <b>${esc(lot.name)}</b> was released for other drivers.</p>
    <div class="notice" style="text-align:left">${icon('i-info')}<div>Already at the gate? You can still enter as a walk-in if there's space.</div></div>
    <div class="btn-stack">
      <button class="btn primary lg block" data-action="walkinAt" data-id="${lot.id}">Walk in instead</button>
      <button class="btn secondary block" data-action="reserveAgain" data-id="${lot.id}">Reserve again</button>
      <button class="btn text block" data-action="home">Back to map</button>
    </div>`;
}

// ---------- scan tab ----------
function renderScan() {
  let html = '';
  if (state.session) {
    const lot = lotById(state.session.lotId);
    html += `<div class="card">
      <span class="chip plain">${icon('i-car', 'sm')} Parked</span>
      <h3 style="margin-top:8px">${esc(lot.name)}</h3>
      <p class="caption" style="margin:0 0 12px">Floor ${esc(state.session.floor)} · Slot ${state.session.slot} · since ${fmtTime(state.session.enteredAt)}</p>
      <div class="btn-stack" style="margin-top:0">
        <button class="btn primary block" data-action="go" data-to="session">Scan out &amp; pay</button>
        <button class="btn secondary block" data-action="go" data-to="locator">Find my car</button>
      </div></div>`;
  } else if (state.reservation) {
    const lot = lotById(state.reservation.lotId);
    html += `<button class="choice" data-action="go" data-to="resqr">
      <span class="ic-wrap">${icon('i-qr')}</span>
      <span><b>Reservation ${state.reservation.ref}</b><small>${esc(lot.name)} · <span data-countdown>--:--</span> left to scan in</small></span>${icon('i-chevron')}</button>`;
  }
  if (!state.session) {
    html += `<h3 class="section-title">At the entrance</h3>
      <button class="choice" data-action="walkinAt" data-id="${state.reservation?.lotId || ui.walkinLot}">
        <span class="ic-wrap">${icon('i-car')}</span>
        <span><b>Walk in</b><small>No reservation? Choose “Walk-in” at the scanner to get an entry QR.</small></span>${icon('i-chevron')}</button>`;
    if (!state.reservation) html += `<button class="choice" data-action="tab" data-tab-id="map">
        <span class="ic-wrap">${icon('i-pin')}</span>
        <span><b>Reserve first</b><small>Find a lot on the map and hold a space for 15 minutes.</small></span>${icon('i-chevron')}</button>`;
  }
  html += `<div class="notice" style="margin-top:16px">${icon('i-nfc')}<div>Every gate supports both <b style="display:inline">QR</b> and <b style="display:inline">NFC</b>. Hold your phone near the reader or show the code on screen.</div></div>`;
  $('#scanBody').innerHTML = html;
  tick();
}

// ---------- walk-in ----------
function renderWalkin() {
  if (state.session) {
    $('#walkinBody').innerHTML = `<div class="notice">${icon('i-info')}<div>You're already parked. Scan out before starting a new entry.</div></div>`;
    return;
  }
  const lot = lotById(ui.walkinLot);
  const s = stats(lot);
  const options = LOTS.map((l) => `<option value="${l.id}" ${l.id === lot.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('');
  let body;
  if (s.status === 'full') {
    const alts = LOTS.filter((l) => stats(l).left > 0).sort((a, b) => parseInt(a.distance) - parseInt(b.distance)).slice(0, 3);
    body = `<div class="center">
        <div class="big-icon full">${icon('i-warn')}</div>
        <h2 style="margin:0 0 8px">${esc(lot.name)} is full</h2>
        <p class="lead">All ${lot.capacity} spaces are parked or reserved, so the gate can't assign you a slot right now.</p></div>
      <h3 class="section-title">Nearby lots with space</h3>${alts.map(lotCard).join('')}`;
  } else if (!ui.walkinQr) {
    body = `<div class="card"><div class="kv"><span>Spaces left</span><span>${s.left} ${statusChip(s)}</span></div>
        <div class="kv"><span>Rate</span><span>${peso(lot.rate)}/hr · pay on exit</span></div></div>
      <div class="notice">${icon('i-info')}<div>No reservation fee for walk-ins. Your floor and slot are assigned when you scan in.</div></div>
      <button class="btn primary lg block" data-action="genWalkin">Generate entry QR</button>`;
  } else {
    const ref = `W-${lot.id.toUpperCase().slice(0, 3)}-${String(Date.now()).slice(-4)}`;
    body = `<div class="ticket"><div class="ref">Walk-in ticket ${ref}</div><h3>${esc(lot.name)}</h3>${qrSvg(ref)}
        <div class="qr-cap">${state.offline ? 'Saved offline. Works without signal.' : 'Scan this at the gate, or tap NFC'}</div></div>
      <div class="btn-stack" style="margin-top:0">
        <button class="btn primary lg block" data-action="entryScan" data-via="walkin">${icon('i-qr')} Scan in at the gate</button>
        <button class="btn secondary block" data-action="entryScan" data-via="walkin">${icon('i-nfc')} Tap NFC instead</button>
        <button class="btn text block" data-action="print">${icon('i-printer', 'sm')} Print paper ticket instead</button>
      </div>`;
  }
  $('#walkinBody').innerHTML = `
    <label class="field"><span>You're at</span><select data-action-change="walkinLot">${options}</select></label>${body}`;
}

// ---------- entry scan → automatic assignment ----------
function entryScan(via) {
  if (via === 'reservation' && !state.reservation) { goFrom('map', 'expired'); return; }
  const lotId = via === 'reservation' ? state.reservation.lotId : ui.walkinLot;
  const lot = lotById(lotId);
  ui.assignLot = lotId;
  stack = ['map', 'assigning'];
  show('assigning');
  $('#stepCheck').textContent = via === 'reservation' ? `Checking reservation ${state.reservation.ref}` : 'Walk-in, no reservation';
  const items = $$('#assignSteps li');
  items.forEach((li) => li.classList.remove('done'));
  items.forEach((li, i) => setTimeout(() => li.classList.add('done'), 450 * (i + 1)));

  setTimeout(() => {
    const rnd = Math.random;
    const res = state.reservation;
    state.session = {
      lotId, floor: lot.floors[Math.floor(rnd() * lot.floors.length)], slot: 1 + Math.floor(rnd() * 48),
      landmark: lot.landmarks[Math.floor(rnd() * lot.landmarks.length)], enteredAt: Date.now(),
      reserved: via === 'reservation', ref: res?.ref || null, paid: false, payMethod: null,
    };
    if (res) setHistoryStatus(res.ref, 'Checked in');
    state.reservation = null;
    ui.walkinQr = false;
    save();
    goFrom('map', 'parked');
  }, 450 * (items.length + 1));
}

function renderParked() {
  const s = state.session;
  if (!s) { show('map'); return; }
  const lot = lotById(s.lotId);
  $('#parkedBody').innerHTML = `
    <div class="center"><div class="big-icon">${icon('i-check')}</div>
      <h2 style="margin:0">Barrier raised</h2>
      <p class="lead" style="margin-top:4px">${esc(lot.name)} · entered ${fmtTime(s.enteredAt)}</p></div>
    <div class="assigned">
      <div><small>Floor</small><b>${esc(s.floor)}</b></div>
      <div><small>Slot</small><b>${s.slot}</b></div>
    </div>
    <p class="center muted" style="margin:0 0 12px">Your slot is ${esc(s.landmark)}.</p>
    ${floorMap(s)}
    <div class="notice" style="margin-top:12px">${icon('i-pin')}<div><b>Location saved</b>Open “Find my car” anytime, even offline.</div></div>
    <div class="notice warn">${icon('i-warn')}<div><b>Park only in your assigned slot</b>Parking elsewhere may incur a penalty.
      <button class="btn text" style="padding:0;min-height:28px" data-action="slotTaken">Someone's in my slot?</button></div></div>
    <div class="btn-stack">
      <button class="btn primary lg block" data-action="go" data-to="locator">Find my car</button>
      <button class="btn secondary block" data-action="home">Done</button>
    </div>`;
}

function renderLocator() {
  const s = state.session;
  if (!s) {
    $('#locatorBody').innerHTML = `<div class="center"><div class="big-icon soft">${icon('i-car')}</div>
      <h2 style="margin:0 0 8px">No saved car</h2><p class="lead">When you scan in, your assigned floor and slot are saved here.</p>
      <button class="btn primary block" data-action="home">Back to map</button></div>`;
    return;
  }
  const lot = lotById(s.lotId);
  $('#locatorBody').innerHTML = `
    <div class="card"><h3>${esc(lot.name)}</h3>
      <p class="caption" style="margin:0">Parked at ${fmtTime(s.enteredAt)}</p>
      <div class="assigned" style="margin-bottom:0"><div><small>Floor</small><b>${esc(s.floor)}</b></div><div><small>Slot</small><b>${s.slot}</b></div></div></div>
    ${floorMap(s)}
    <ol class="directions">
      <li>Head to the parking lift lobby of ${esc(lot.name)}.</li>
      <li>Take the lift to Floor ${esc(s.floor)}.</li>
      <li>Follow the blue path along the lane. Your car is in slot ${s.slot}, ${esc(s.landmark)}.</li>
    </ol>
    <p class="caption">Indoor directions are illustrative. No live GPS is used.</p>
    <div class="btn-stack"><button class="btn primary lg block" data-action="go" data-to="session">Leaving? Scan out &amp; pay</button></div>`;
}

// ---------- scan-out, pay, exit ----------
function renderSession() {
  const s = state.session;
  if (!s) { show('scan'); return; }
  const lot = lotById(s.lotId);
  const f = fees();
  $('#sessionBody').innerHTML = `
    <div class="card">
      <h3>${esc(lot.name)}</h3>
      <div class="kv"><span>Floor · slot</span><span>${esc(s.floor)} · ${s.slot}</span></div>
      <div class="kv"><span>Entered</span><span>${fmtTime(s.enteredAt)}</span></div>
      <div class="kv"><span>Duration</span><span>2h 15m <span class="caption">(simulated)</span></span></div>
      <div class="kv"><span>Rate</span><span>${peso(lot.rate)}/hr × ${f.hours} hr</span></div>
      <div class="kv"><span>Parking fee</span><span>${peso(f.fee)}</span></div>
      ${s.reserved ? `<div class="kv credit"><span>Reservation credit (${esc(s.ref)})</span><span>−${peso(f.credit)}</span></div>` : ''}
      <div class="kv total"><span>Amount due</span><span>${peso(f.due)}</span></div>
    </div>
    <h3 class="section-title">How do you want to pay?</h3>
    <button class="choice" data-action="payExit">
      <span class="ic-wrap">${icon('i-wallet')}</span>
      <span><b>Pay in the app</b><small>Universal QR Ph or NFC tap. Then just scan at the exit.</small></span>${icon('i-chevron')}</button>
    <button class="choice" data-action="payVendor">
      <span class="ic-wrap">${icon('i-store')}</span>
      <span><b>Pay at the cashier</b><small>Pay the parking attendant or pay station, then scan at the exit.</small></span>${icon('i-chevron')}</button>`;
}

function renderExit() {
  const s = state.session;
  if (ui.exitDone || !s) {
    $('#exitBody').innerHTML = `<div class="big-icon">${icon('i-check')}</div>
      <h2 style="margin:0 0 8px">Drive safe!</h2>
      <p class="lead">The barrier is up. Your receipt is saved in Recent reservations.</p>
      <div class="btn-stack"><button class="btn primary lg block" data-action="tab" data-tab-id="explore">Back to Explore</button></div>`;
    return;
  }
  const lot = lotById(s.lotId);
  const vendor = s.payMethod === 'vendor';
  $('#exitBody').innerHTML = `
    ${vendor ? `<div class="notice warn" style="text-align:left;width:100%">${icon('i-store')}<div><b>Pay ${peso(fees().due)} at the cashier first</b>Then scan this code at the exit gate.</div></div>`
      : `<span class="status-line" style="margin-bottom:12px">${icon('i-check', 'sm')} Paid ${peso(fees().due)} via ${s.payMethod === 'nfc' ? 'NFC' : 'QR Ph'}</span>`}
    <div class="ticket" style="width:100%">
      <div class="ref">Exit pass</div><h3>${esc(lot.name)}</h3>${qrSvg('exit' + s.slot + s.lotId)}
      <div class="qr-cap">Show at the exit gate, or tap NFC</div></div>
    <div class="btn-stack" style="margin-top:0">
      <button class="btn primary lg block" data-action="exitScan">${icon('i-qr')} Scan at exit</button>
    </div>`;
}

function exitScan() {
  const s = state.session;
  const ref = s.ref || `W-${String(s.enteredAt).slice(-3)}`;
  if (s.ref) setHistoryStatus(s.ref, 'Completed');
  else state.history.unshift({ lotId: s.lotId, ref, date: today(), status: 'Completed' });
  state.session = null;
  ui.exitDone = true;
  save();
  renderExit();
}

// ---------- explore ----------
function lotCard(lot) {
  const s = stats(lot);
  return `<button class="lot-card" data-action="pickLot" data-id="${lot.id}">
    ${lotPhoto(lot, 'lot-thumb')}
    <span class="info"><b>${esc(lot.name)}</b><small>${lot.distance} · ${peso(lot.rate)}/hr</small>${statusChip(s)}</span>
    <span class="count lvl-${s.lvl}">${s.left || 'Full'}</span></button>`;
}

function renderExplore() {
  const near = [...LOTS].sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
  const favs = LOTS.filter((l) => state.favorites.includes(l.id));
  let html = '';
  if (state.session) {
    const lot = lotById(state.session.lotId);
    html += `<button class="choice" data-action="go" data-to="locator"><span class="ic-wrap">${icon('i-car')}</span>
      <span><b>You're parked</b><small>${esc(lot.name)} · Floor ${esc(state.session.floor)} · Slot ${state.session.slot}</small></span>${icon('i-chevron')}</button>`;
  }
  html += `<h3 class="section-title">Parking near you</h3>${near.slice(0, 4).map(lotCard).join('')}`;
  html += `<h3 class="section-title">Favorites</h3>` + (favs.length ? favs.map(lotCard).join('') : `<p class="empty">Tap the heart on a lot to save it here.</p>`);
  html += `<h3 class="section-title">Recent reservations</h3>` + historyList();
  $('#exploreBody').innerHTML = html;
}

function historyList() {
  if (!state.history.length) return `<p class="empty">No reservations yet.</p>`;
  return `<div class="list">${state.history.slice(0, 6).map((h) => {
    const lot = lotById(h.lotId);
    const cls = h.status === 'Expired' ? 'full' : h.status === 'Active' || h.status === 'Checked in' ? 'available' : 'plain';
    return `<button class="row" data-action="pickLot" data-id="${lot.id}">${icon('i-history')}
      <span>${esc(lot.name)}<small>${h.ref} · ${h.date}</small></span><span class="chip ${cls}">${h.status}</span></button>`;
  }).join('')}</div><p class="caption">Stored on this device only.</p>`;
}

// ---------- profile / drawer ----------
function renderProfile() {
  const id = state.identity;
  $('#profileBody').innerHTML = `
    <div class="center"><div class="big-icon">${icon('i-user')}</div>
      <h2 style="margin:0">${id ? esc(id.value) : 'Guest'}</h2>
      <p class="lead" style="margin-top:4px">${id ? `Signed in with ${id.type === 'plate' ? 'plate number' : 'phone OTP'}` : "You're using Uy Parking! without an account."}</p></div>
    <div class="list">
      ${id ? `<div class="row">${icon(id.type === 'plate' ? 'i-car' : 'i-user')}<span>${esc(id.value)}<small>${id.type === 'plate' ? 'Plate number' : 'Phone number'}</small></span></div>
        <button class="row" data-action="signOut"><span>Remove from this device</span><small class="danger-text">Remove</small></button>`
      : `<button class="row" data-action="addIdentity">${icon('i-car')}<span>Add plate number or phone<small>Optional. Only needed to reserve or pay.</small></span>${icon('i-chevron', 'sm')}</button>`}
    </div>
    <h3 class="section-title">Recent activity</h3>${historyList()}`;
}

function renderDrawer() {
  $('#drawerName').textContent = state.identity ? state.identity.value : 'Guest';
  $('#drawerSub').textContent = state.identity ? (state.identity.type === 'plate' ? 'Plate number' : 'Phone number') : 'Using the app without an account';
}
function openDrawer() { renderDrawer(); $('#app').classList.add('drawer-open'); }
function closeDrawer() { $('#app').classList.remove('drawer-open'); }

// ---------- owner ----------
function renderOwner() {
  $$('#screen-owner .seg').forEach((b) => b.classList.toggle('active', b.dataset.tabId === ui.ownerTab));
  const totalCap = LOTS.reduce((a, l) => a + l.capacity, 0);
  const totalTaken = LOTS.reduce((a, l) => a + stats(l).taken, 0);
  const max = Math.max(...OWNER.hourly);
  if (ui.ownerTab === 'stats') {
    $('#ownerBody').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><small>Occupancy now</small><b>${Math.round((totalTaken / totalCap) * 100)}%</b><div class="delta">${totalTaken} / ${totalCap} spaces</div></div>
        <div class="stat"><small>Peak time today</small><b>6 PM</b><div class="delta">93% full</div></div>
        <div class="stat"><small>Entries today</small><b>412</b><div class="delta">▲ 8% vs last Thu</div></div>
        <div class="stat"><small>No-shows</small><b>6</b><div class="delta">of 58 reservations</div></div>
      </div>
      <div class="card"><h3>Hourly occupancy</h3><p class="caption" style="margin:0">Today · all lots</p>
        <div class="mini-bars">${OWNER.hourly.map((v) => `<i class="${v === max ? 'peak' : ''}" style="height:${v}%" title="${v}%"></i>`).join('')}</div>
        <div class="bar-axis"><span>6a</span><span>9a</span><span>12p</span><span>3p</span><span>6p</span><span>9p</span></div></div>
      <div class="card"><h3>By lot</h3>${LOTS.map((l) => { const s = stats(l); return `<div class="lot-occ">
        <div class="top"><span>${esc(l.name)}</span><span>${s.parked} + ${s.reserved} / ${l.capacity}</span></div>
        <div class="occ-bar"><i class="parked" style="width:${(s.parked / l.capacity) * 100}%"></i><i class="reserved" style="width:${(s.reserved / l.capacity) * 100}%"></i></div></div>`; }).join('')}
        <div class="occ-legend"><span><i class="parked"></i>Parked</span><span><i class="reserved"></i>Reserved</span></div></div>
      <p class="caption center">Mock data for the prototype.</p>`;
  } else {
    $('#ownerBody').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><small>Revenue today</small><b>${peso(38450)}</b><div class="delta">▲ 5% vs last Thu</div></div>
        <div class="stat"><small>This week</small><b>${peso(214900)}</b><div class="delta">▲ 3%</div></div>
        <div class="stat"><small>Reservation fees</small><b>${peso(2900)}</b><div class="delta">58 × ${peso(RESERVATION_FEE)}</div></div>
        <div class="stat"><small>Credits applied</small><b>−${peso(1820)}</b><div class="delta">52 × ${peso(FEE_CREDIT)}</div></div>
      </div>
      <div class="card"><h3>Payment mix</h3>
        <div class="kv"><span>QR Ph (in app)</span><span>54%</span></div>
        <div class="kv"><span>NFC</span><span>18%</span></div>
        <div class="kv"><span>Cashier / vendor</span><span>28%</span></div></div>
      <div class="card"><h3>Recent transactions</h3>${OWNER.txns.map((t) => `<div class="txn"><span>${t.what}<small>${t.when}</small></span><b>${peso(t.amt)}</b></div>`).join('')}</div>
      <p class="caption center">Mock data. Settlement, refunds and disputes are out of scope.</p>`;
  }
}

// ---------- theme / offline / toast ----------
function applyTheme() {
  const theme = state.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  $('#themeToggle').checked = theme === 'dark';
}
function applyOffline() {
  $('#offlineBar').hidden = !state.offline;
  $('#offlineToggle').checked = state.offline;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------- demo shortcuts ----------
function ensureSession() {
  if (!state.session) {
    state.session = { lotId: 'sm-b1', floor: 'B1', slot: 23, landmark: 'near Elevator B', enteredAt: Date.now() - DEMO_MINUTES * 60000,
      reserved: true, ref: '#206', paid: false, payMethod: null };
    state.reservation = null;
    save();
  }
}

const DEMO_FLOWS = {
  reserve() { state.session = null; state.reservation = null; save(); tab('map'); openLot('sm-b1'); },
  walkin() { state.session = null; ui.walkinLot = 'open-b'; ui.walkinQr = false; save(); goFrom('scan', 'walkin'); },
  exit() { ensureSession(); goFrom('scan', 'session'); },
  find() { ensureSession(); goFrom('explore', 'locator'); },
  owner() { ui.ownerTab = 'stats'; goFrom('map', 'owner'); },
  full() { tab('map'); openLot('annex'); },
};

// ---------- actions ----------
const ACTIONS = {
  tab: (d) => { if (d.tabId === 'map') closeSheet(); tab(d.tabId); },
  go: (d) => go(d.to),
  back,
  home: () => { closeSheet(); tab('map'); },
  openDrawer, closeDrawer,
  drawerGo: (d) => (TABS.includes(d.to) ? tab(d.to) : goFrom(current === 'map' || TABS.includes(current) ? current : 'map', d.to)),
  openLot: (d) => { if (current !== 'map') tab('map'); openLot(d.id); },
  closeSheet,
  pickLot: (d) => pickLot(d.id),
  expand: (d, el) => el.closest('.panel').classList.toggle('expanded'),
  locate: () => {
    const { W, H } = mapSize();
    setView({ s: 1.3, x: W * .5 - 1.3 * .49 * W, y: H * .5 - 1.3 * .5 * H }); userView = { ...view };
    toast('Centered on your approximate location (mock, no real GPS).');
  },
  demoZoom: () => {
    if (current !== 'map') tab('map');
    closeSheet();
    const { W, H } = mapSize();
    setView(view.s >= ZOOMED_AT ? { s: 1, x: 0, y: 0 } : { s: 2.2, x: W * .5 - 2.2 * .42 * W, y: H * .45 - 2.2 * .36 * H });
    userView = { ...view };
  },
  voice: () => toast('Voice search is not part of the prototype.'),
  fav: (d) => {
    const on = state.favorites.includes(d.id);
    state.favorites = on ? state.favorites.filter((f) => f !== d.id) : [...state.favorites, d.id];
    save(); renderSheet();
    toast(on ? 'Removed from favorites' : 'Saved to favorites');
  },
  trendBar: (d) => { ui.trendSel = Number(d.i); renderTrend(lotById(ui.selectedLot)); },
  reserve: (d) => { ui.pendingLot = d.id; go('reserve'); },
  reserveAgain: (d) => { tab('map'); openLot(d.id); },
  confirmReserve: () => { if (state.identity) afterIdentity(); else go('otp'); },
  idTab: (d) => {
    $$('#screen-otp .seg').forEach((b) => b.classList.toggle('active', b.dataset.tabId === d.tabId));
    $('#idPlate').hidden = d.tabId !== 'plate';
    $('#idPhone').hidden = d.tabId !== 'phone';
  },
  savePlate: () => {
    const v = $('#plateInput').value.trim().toUpperCase();
    if (v.replace(/\s/g, '').length < 4) { toast('Enter a valid plate number, e.g. NBC 1234.'); return; }
    state.identity = { type: 'plate', value: v }; save(); afterIdentity();
  },
  sendOtp: () => {
    const v = $('#phoneInput').value.replace(/\D/g, '');
    if (v.length < 10) { toast('Enter a 10-digit mobile number, e.g. 917 123 4567.'); return; }
    $('#otpBlock').hidden = false;
    $('#sendOtpBtn').textContent = 'Resend code';
    toast('Code sent (mock). Any 6 digits will work.');
    $('#otpBoxes input').focus();
  },
  verifyOtp: () => {
    const boxes = $('#otpBoxes');
    const code = $$('#otpBoxes input').map((i) => i.value).join('');
    if (!/^\d{6}$/.test(code)) { boxes.classList.add('error'); $('#otpError').hidden = false; return; }
    boxes.classList.remove('error'); boxes.classList.add('ok'); $('#otpError').hidden = true;
    const digits = $('#phoneInput').value.replace(/\D/g, '');
    state.identity = { type: 'phone', value: `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` };
    save();
    setTimeout(afterIdentity, 400);
  },
  addIdentity: () => go('otp'),
  signOut: () => { state.identity = null; save(); renderProfile(); renderDrawer(); toast('Removed from this device.'); },
  payMethod: (d) => { ui.payMethod = d.m; renderPay(); },
  paid,
  cancelReservation: () => {
    setHistoryStatus(state.reservation.ref, 'Cancelled');
    state.reservation = null; save(); tab('map');
    toast('Reservation cancelled. Refunds are out of scope for the prototype.');
  },
  entryScan: (d) => entryScan(d.via),
  walkinAt: (d) => { ui.walkinLot = d.id; ui.walkinQr = false; goFrom('scan', 'walkin'); },
  genWalkin: () => { ui.walkinQr = true; renderWalkin(); },
  print: () => toast('Ticket sent to the gate printer (mock).'),
  slotTaken: () => toast('Staff have been notified. They will direct you to another slot and give you a voucher.'),
  payExit: () => { ui.payCtx = 'exit'; ui.payMethod = 'qrph'; go('pay'); },
  payVendor: () => { state.session.payMethod = 'vendor'; save(); ui.exitDone = false; go('exit'); },
  exitScan,
  ownerTab: (d) => { ui.ownerTab = d.tabId; renderOwner(); },
  toggleTheme: () => {
    state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    save(); applyTheme();
  },
  toggleOffline: () => { state.offline = !state.offline; save(); applyOffline(); RENDER[current]?.(); },
  resetDemo: () => {
    state = defaultState(); save();
    Object.assign(ui, { selectedLot: null, pendingLot: null, walkinQr: false, exitDone: false });
    applyTheme(); applyOffline(); closeSheet(); tab('map');
    toast('Demo data reset.');
  },
  demoFlow: (d) => DEMO_FLOWS[d.flow](),
  demoTime: (d) => {
    if (!state.reservation) { toast('Make a reservation first (flow 1).'); return; }
    state.reservation.expiresAt = d.mode === 'expire' ? Date.now() : Date.now() + 2 * 60 * 1000 - 5000;
    save(); tick();
  },
};

const RENDER = {
  map: () => { renderMap(); if (ui.selectedLot) renderSheet(); },
  reserve: renderReserve,
  pay: renderPay,
  resqr: renderResQr,
  expired: renderExpired,
  scan: renderScan,
  walkin: renderWalkin,
  parked: renderParked,
  locator: renderLocator,
  session: renderSession,
  exit: renderExit,
  explore: renderExplore,
  profile: renderProfile,
  owner: renderOwner,
  settings: () => { applyTheme(); applyOffline(); },
  otp: () => {
    $('#otpBlock').hidden = true;
    $('#sendOtpBtn').textContent = 'Send code';
    $$('#otpBoxes input').forEach((i) => { i.value = ''; });
    $('#otpBoxes').classList.remove('error', 'ok');
    $('#otpError').hidden = true;
  },
};

// ---------- wiring ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') {
    if (!e.target.closest('.search, .search-panel')) hideSearch();
    return;
  }
  const fn = ACTIONS[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('[data-action="toggleTheme"]')) ACTIONS.toggleTheme();
  else if (el.matches('[data-action="toggleOffline"]')) ACTIONS.toggleOffline();
  else if (el.dataset.actionChange === 'trendDay') { ui.trendDay = Number(el.value); ui.trendSel = null; renderTrend(lotById(ui.selectedLot)); }
  else if (el.dataset.actionChange === 'walkinLot') { ui.walkinLot = el.value; ui.walkinQr = false; renderWalkin(); ui.focusLot = el.value; focusLot(el.value); renderMap(); }
});

const searchInput = $('#searchInput');
searchInput.addEventListener('focus', () => { closeSheet(); renderSearch(searchInput.value); });
searchInput.addEventListener('input', () => renderSearch(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { searchInput.blur(); hideSearch(); }
  if (e.key === 'Enter') { const first = $('#searchResults [data-action="pickLot"]'); if (first) pickLot(first.dataset.id); }
});

// OTP boxes: auto-advance and backspace
$('#otpBoxes').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 1);
  if (e.target.value && e.target.nextElementSibling) e.target.nextElementSibling.focus();
});
$('#otpBoxes').addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) e.target.previousElementSibling.focus();
});

// ---------- boot ----------
drawMapArt();
initMapGestures();
addEventListener('resize', () => { if (ui.focusLot || ui.selectedLot) focusLot(ui.focusLot || ui.selectedLot); else setView(view, false); });
applyTheme();
applyOffline();
renderDrawer();
if (state.reservation && state.reservation.expiresAt <= Date.now()) expireReservation();
tab('map');
setInterval(tick, 1000);
