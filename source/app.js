/* Uy Parking! clickable prototype — everything here is mocked.
   Screen router, 15-min reservation countdown, mock lot / slot / QR data. */
'use strict';

// ---------- locked product constants (see CLAUDE.md) ----------
const GRACE_MS = 15 * 60 * 1000;   // reservation grace period
const RESERVATION_FEE = 50;        // paid up front
const FEE_CREDIT = 35;             // deducted from the final parking fee
const DEMO_MINUTES = 135;          // simulated parking duration at scan-out

// ---------- mock data ----------
// Real places in Metro Manila (around Ortigas Center first) used as placeholders. `shape` is the building / lot outline
// from OpenStreetMap (© OpenStreetMap contributors, ODbL); counts, rates and features are mock.
const LOTS = [
  { id: 'sm-b1', name: 'SM Megamall Basement 1', area: 'Megamall · Bldg A',
    address: 'EDSA cor. Doña Julia Vargas Ave., Ortigas Center, Mandaluyong', capacity: 120, parked: 82, reserved: 15, rate: 40,
    accessible: true, ev: false, covered: true, busy: 1.0, tone: '#cfd3d6', sign: 'SM', floors: ['B1', 'B2'],
    landmarks: ['near Elevator B', 'beside Entrance 2', 'by the ramp to B2'],
    shape: [[14.584589, 121.056611], [14.584578, 121.057686], [14.584701, 121.057687], [14.584727, 121.056956], [14.585667, 121.056967],
      [14.585658, 121.057699], [14.586828, 121.057712], [14.586838, 121.056795], [14.586408, 121.056790], [14.586408, 121.056638],
      [14.585812, 121.056631], [14.585815, 121.056374], [14.585656, 121.056372], [14.585654, 121.056623]] },
  { id: 'open-b', name: 'SM Megamall Open Parking', area: 'Megamall · Open lot',
    address: 'Doña Julia Vargas Ave., Ortigas Center, Mandaluyong', capacity: 60, parked: 18, reserved: 4, rate: 30,
    accessible: true, ev: false, covered: false, busy: .6, tone: '#d9cdb8', sign: 'OPEN', floors: ['G'],
    landmarks: ['near the mall side door', 'by the guard house'],
    shape: [[14.585863, 121.058042], [14.585606, 121.058038], [14.585603, 121.058654], [14.585855, 121.058655]] },
  { id: 'north', name: 'The Podium Parking', area: 'The Podium · P2',
    address: 'ADB Ave. cor. Doña Julia Vargas Ave., Ortigas Center, Mandaluyong', capacity: 80, parked: 40, reserved: 8, rate: 50,
    accessible: true, ev: true, covered: true, busy: .8, tone: '#b9c4cc', sign: 'PODIUM', floors: ['P2', 'P3'],
    landmarks: ['next to the EV chargers', 'near Lift Lobby A'],
    shape: [[14.584609, 121.059143], [14.584645, 121.059344], [14.584815, 121.059525], [14.584906, 121.059613], [14.585031, 121.059620],
      [14.585118, 121.059586], [14.585593, 121.059589], [14.585603, 121.058676], [14.584605, 121.058673]] },
  { id: 'annex', name: 'Megamall Building C Carpark', area: 'Megamall · Bldg C',
    address: 'EDSA, Ortigas Center, Mandaluyong', capacity: 30, parked: 27, reserved: 3, rate: 35,
    accessible: false, ev: false, covered: true, busy: 1.15, tone: '#d1c2c2', sign: 'BLDG C', floors: ['1'],
    landmarks: ['by the stairwell'],
    shape: [[14.585159, 121.056492], [14.584692, 121.056483], [14.584701, 121.055984], [14.585384, 121.056222], [14.585647, 121.056314],
      [14.585648, 121.056502]] },
  { id: 'riverside', name: 'Shangri-La Plaza Parking', area: 'Shangri-La · Basement',
    address: 'EDSA cor. Shaw Blvd., Mandaluyong', capacity: 50, parked: 30, reserved: 2, rate: 30,
    accessible: true, ev: true, covered: true, busy: .75, tone: '#c8d4c4', sign: 'SHANGRI-LA', floors: ['B1', 'B2'],
    landmarks: ['near the East Wing entrance'],
    shape: [[14.581316, 121.054049], [14.581446, 121.054115], [14.581604, 121.054264], [14.581977, 121.054517], [14.581673, 121.054830],
      [14.581732, 121.054879], [14.581395, 121.055268], [14.581361, 121.055236], [14.580847, 121.055835], [14.580540, 121.056236],
      [14.579976, 121.055713], [14.580223, 121.055427], [14.580096, 121.055310], [14.581182, 121.054035]] },
  { id: 'plaza', name: 'Robinsons Galleria Parking', area: 'Galleria · Deck',
    address: 'EDSA cor. Ortigas Ave., Ortigas Center, Quezon City', capacity: 100, parked: 85, reserved: 8, rate: 45,
    accessible: true, ev: true, covered: true, busy: 1.1, tone: '#c9c6d6', sign: 'GALLERIA', floors: ['L2', 'L3', 'L4'],
    landmarks: ['near Elevator 3', 'beside the food court bridge'],
    shape: [[14.592243, 121.059302], [14.592157, 121.059058], [14.592064, 121.058958], [14.591981, 121.059055], [14.591734, 121.059256],
      [14.591677, 121.059208], [14.591952, 121.058883], [14.591942, 121.058701], [14.591783, 121.058545], [14.591624, 121.058481],
      [14.591578, 121.058644], [14.591319, 121.058591], [14.591285, 121.058462], [14.591007, 121.058747], [14.590239, 121.059637],
      [14.589995, 121.059975], [14.590197, 121.060071], [14.590197, 121.060307], [14.590039, 121.060355], [14.590291, 121.060586],
      [14.590465, 121.060586], [14.590631, 121.060385], [14.590573, 121.060571], [14.590921, 121.060878], [14.591601, 121.060068]] },
  // elsewhere in Metro Manila
  { id: 'moa', name: 'SM Mall of Asia Parking', area: 'MOA · North Parking',
    address: 'Seaside Blvd., Mall of Asia Complex, Pasay', capacity: 300, parked: 210, reserved: 30, rate: 50,
    accessible: true, ev: true, covered: true, busy: 1.05, tone: '#cfd3d6', sign: 'MOA', floors: ['B1', 'B2', 'P3'],
    landmarks: ['near the North Entrance', 'by Elevator 4'],
    shape: [[14.533093, 120.979943], [14.533408, 120.979889], [14.537087, 120.979749], [14.537115, 120.979767], [14.537133, 120.979799],
      [14.537278, 120.983803], [14.537259, 120.983840], [14.537231, 120.983861], [14.536034, 120.983964], [14.535985, 120.983918],
      [14.535838, 120.983632], [14.535741, 120.983540], [14.535501, 120.983413], [14.535271, 120.983375], [14.535146, 120.983379],
      [14.534893, 120.983449], [14.534704, 120.983571], [14.534585, 120.983702], [14.534505, 120.984028], [14.534422, 120.984113],
      [14.533244, 120.984200], [14.533222, 120.984176], [14.533044, 120.979964]] },
  { id: 'sm-north', name: 'SM North EDSA Parking', area: 'SM North EDSA · The Block',
    address: 'North Ave. cor. EDSA, Quezon City', capacity: 250, parked: 220, reserved: 18, rate: 40,
    accessible: true, ev: false, covered: true, busy: 1.1, tone: '#d1c2c2', sign: 'SM NORTH', floors: ['B1', 'B2', 'P1'],
    landmarks: ['near The Block entrance', 'by the cinema escalators'],
    shape: [[14.657342, 121.026544], [14.656682, 121.026385], [14.656477, 121.027308], [14.656659, 121.027354], [14.656577, 121.027724],
      [14.656384, 121.027679], [14.655960, 121.029608], [14.655894, 121.029662], [14.655888, 121.030284], [14.655829, 121.030395],
      [14.655676, 121.030516], [14.655617, 121.030603], [14.655622, 121.030773], [14.655472, 121.031570], [14.655210, 121.032651],
      [14.655819, 121.032797], [14.655681, 121.033473], [14.658591, 121.034132], [14.658742, 121.033464], [14.657450, 121.033192],
      [14.658310, 121.029135], [14.656843, 121.028782]] },
  { id: 'trinoma', name: 'TriNoma Parking', area: 'TriNoma · Basement',
    address: 'EDSA cor. North Ave., Quezon City', capacity: 180, parked: 120, reserved: 15, rate: 50,
    accessible: true, ev: true, covered: true, busy: 0.9, tone: '#c8d4c4', sign: 'TRINOMA', floors: ['B1', 'B2'],
    landmarks: ['near the MRT link bridge', 'by Elevator 2'],
    shape: [[14.654065, 121.031494], [14.654568, 121.032304], [14.654250, 121.033756], [14.654520, 121.033819], [14.654380, 121.034480],
      [14.654320, 121.034596], [14.654229, 121.034700], [14.654015, 121.034811], [14.653177, 121.034627], [14.652950, 121.034620],
      [14.652779, 121.034558], [14.652617, 121.034451], [14.652347, 121.034385], [14.652334, 121.034443], [14.651165, 121.034184],
      [14.650824, 121.033651]] },
  { id: 'gateway', name: 'Gateway Mall Parking', area: 'Araneta City · Gateway',
    address: 'Gen. Aguinaldo Ave., Araneta City, Cubao, Quezon City', capacity: 150, parked: 138, reserved: 7, rate: 45,
    accessible: true, ev: false, covered: true, busy: 1.1, tone: '#c9c6d6', sign: 'GATEWAY', floors: ['B1', 'B2'],
    landmarks: ['near the Cubao MRT walkway', 'by Lift Lobby C'],
    shape: [[14.621182, 121.052975], [14.622021, 121.052547], [14.622395, 121.053321], [14.621823, 121.053609], [14.621744, 121.053440],
      [14.621350, 121.053642], [14.621332, 121.053610], [14.621309, 121.053678], [14.621243, 121.053701], [14.621192, 121.053670],
      [14.621176, 121.053615], [14.621219, 121.053547], [14.621304, 121.053553], [14.621280, 121.053507], [14.621292, 121.053364],
      [14.621254, 121.053290], [14.621205, 121.053326], [14.621165, 121.053151], [14.621087, 121.053024]] },
  { id: 'eastwood', name: 'Eastwood Mall Parking', area: 'Eastwood City · Mall',
    address: 'Orchard Rd., Eastwood City, Libis, Quezon City', capacity: 120, parked: 80, reserved: 10, rate: 40,
    accessible: true, ev: true, covered: true, busy: 0.8, tone: '#b9c4cc', sign: 'EASTWOOD', floors: ['B1', 'B2'],
    landmarks: ['near the Open Park doors', 'by the EV chargers'],
    shape: [[14.609690, 121.080318], [14.609838, 121.080461], [14.609992, 121.080531], [14.610183, 121.080568], [14.610393, 121.080552],
      [14.610515, 121.080505], [14.610586, 121.080525], [14.610603, 121.080461], [14.610625, 121.080445], [14.610643, 121.080466],
      [14.610697, 121.080427], [14.610843, 121.080286], [14.610891, 121.080211], [14.610869, 121.080196], [14.610881, 121.080177],
      [14.610952, 121.080151], [14.610930, 121.080093], [14.610987, 121.079947], [14.610997, 121.079726], [14.610950, 121.079524],
      [14.610853, 121.079350], [14.610739, 121.079245], [14.610673, 121.079315], [14.610629, 121.079271], [14.610465, 121.079509],
      [14.610420, 121.079482], [14.610370, 121.079650], [14.610258, 121.079724], [14.610203, 121.079723], [14.610157, 121.079759],
      [14.610151, 121.079826], [14.610099, 121.079930], [14.609971, 121.079957], [14.609917, 121.079990], [14.609937, 121.080035],
      [14.609715, 121.080201], [14.609752, 121.080246]] },
  { id: 'greenbelt', name: 'Greenbelt 5 Parking', area: 'Ayala Center · Greenbelt 5',
    address: 'Legazpi St., Ayala Center, Makati', capacity: 140, parked: 125, reserved: 9, rate: 60,
    accessible: true, ev: true, covered: true, busy: 1.1, tone: '#d9cdb8', sign: 'GREENBELT', floors: ['B1', 'B2', 'B3'],
    landmarks: ['near the garden-side lifts', 'by the EV chargers'],
    shape: [[14.552651, 121.020247], [14.552504, 121.020428], [14.552449, 121.020580], [14.552433, 121.020693], [14.552464, 121.020761],
      [14.552617, 121.020766], [14.552624, 121.020828], [14.552452, 121.020902], [14.552531, 121.021085], [14.552652, 121.021233],
      [14.552663, 121.021222], [14.552764, 121.021395], [14.552822, 121.021585], [14.552823, 121.021791], [14.553033, 121.022096],
      [14.552994, 121.022119], [14.553557, 121.022818], [14.553698, 121.022843], [14.553861, 121.022946], [14.553884, 121.022921],
      [14.553873, 121.022891], [14.553904, 121.022867], [14.553721, 121.022459], [14.553696, 121.022470], [14.553519, 121.022025],
      [14.553544, 121.021792], [14.553474, 121.021785], [14.553500, 121.021520], [14.553223, 121.021491], [14.553249, 121.021295],
      [14.553097, 121.021280], [14.553132, 121.020905], [14.552826, 121.020878], [14.552883, 121.020375], [14.552747, 121.020361],
      [14.552752, 121.020277]] },
  { id: 'glorietta', name: 'Glorietta Parking', area: 'Ayala Center · Glorietta',
    address: 'Palm Dr., Ayala Center, Makati', capacity: 200, parked: 160, reserved: 22, rate: 60,
    accessible: true, ev: false, covered: true, busy: 1.0, tone: '#cfd3d6', sign: 'GLORIETTA', floors: ['P1', 'P2', 'P3'],
    landmarks: ['near the Activity Center lifts', 'beside Entrance 3'],
    shape: [[14.551733, 121.024215], [14.552286, 121.024493], [14.552226, 121.024628], [14.552200, 121.024749], [14.552179, 121.024996],
      [14.552189, 121.025130], [14.552164, 121.025134], [14.552210, 121.025234], [14.552182, 121.025240], [14.552193, 121.025283],
      [14.552219, 121.025278], [14.552309, 121.025483], [14.552494, 121.025738], [14.552194, 121.026068], [14.552338, 121.026202],
      [14.552019, 121.026561], [14.551868, 121.026422], [14.551735, 121.026567], [14.551583, 121.026479], [14.551500, 121.026460],
      [14.551474, 121.026428], [14.551454, 121.026447], [14.551425, 121.026412], [14.551394, 121.026439], [14.551342, 121.026377],
      [14.551256, 121.026436], [14.551165, 121.026442], [14.551085, 121.026401], [14.551023, 121.026463], [14.550994, 121.026431],
      [14.550960, 121.026468], [14.550940, 121.026450], [14.550628, 121.026659], [14.550356, 121.026353], [14.550324, 121.026383],
      [14.550298, 121.026353], [14.550215, 121.026431], [14.550127, 121.026325], [14.550209, 121.026248], [14.550176, 121.026212],
      [14.550215, 121.026177], [14.549941, 121.025856], [14.550218, 121.025601], [14.550373, 121.025230], [14.550591, 121.024814],
      [14.550715, 121.024636], [14.550899, 121.024481], [14.551173, 121.024320], [14.551331, 121.024009]] },
  { id: 'powerplant', name: 'Power Plant Mall Parking', area: 'Rockwell Center · Basement',
    address: 'Hidalgo Dr., Rockwell Center, Makati', capacity: 160, parked: 100, reserved: 12, rate: 70,
    accessible: true, ev: true, covered: true, busy: 0.75, tone: '#c9c6d6', sign: 'ROCKWELL', floors: ['B1', 'B2', 'B3'],
    landmarks: ['near the cinema lifts', 'by the EV chargers'],
    shape: [[14.564378, 121.037029], [14.565682, 121.037056], [14.565693, 121.036654], [14.565774, 121.036654], [14.565778, 121.035989],
      [14.564040, 121.035981], [14.564042, 121.036066], [14.563931, 121.036067], [14.563932, 121.036102], [14.563859, 121.036103],
      [14.563864, 121.036486], [14.563892, 121.036485], [14.563891, 121.036509], [14.564176, 121.036512], [14.564379, 121.036747]] },
  { id: 'sm-aura', name: 'SM Aura Parking', area: 'BGC · SM Aura',
    address: 'C.P. Garcia Ave. cor. McKinley Pkwy., Bonifacio Global City, Taguig', capacity: 220, parked: 150, reserved: 20, rate: 50,
    accessible: true, ev: true, covered: true, busy: 0.85, tone: '#b9c4cc', sign: 'SM AURA', floors: ['B1', 'B2', 'B3'],
    landmarks: ['near the Sky Park lifts', 'by Entrance 1'],
    shape: [[14.545408, 121.052219], [14.543963, 121.052881], [14.543911, 121.053048], [14.544449, 121.053165], [14.544746, 121.053296],
      [14.545083, 121.053481], [14.545348, 121.053680], [14.545592, 121.053900], [14.545798, 121.054126], [14.546569, 121.055314],
      [14.546612, 121.055372], [14.546673, 121.055397], [14.546905, 121.055215], [14.547087, 121.054956], [14.547243, 121.054619],
      [14.547273, 121.054389], [14.546510, 121.053964], [14.546313, 121.053805], [14.546134, 121.053621], [14.545885, 121.053310],
      [14.545686, 121.052979]] },
  { id: 'market', name: 'Market! Market! Car Park', area: 'BGC · Market! Market!',
    address: 'McKinley Pkwy., Bonifacio Global City, Taguig', capacity: 180, parked: 172, reserved: 8, rate: 40,
    accessible: true, ev: false, covered: true, busy: 1.15, tone: '#d1c2c2', sign: 'MARKET!', floors: ['P1', 'P2', 'P3'],
    landmarks: ['near the bridge to the mall', 'by the stairwell'],
    shape: [[14.550140, 121.056986], [14.550071, 121.057047], [14.550028, 121.057197], [14.550130, 121.057260], [14.550402, 121.057814],
      [14.550451, 121.057825], [14.550450, 121.057904], [14.550489, 121.057974], [14.550614, 121.058011], [14.550688, 121.057965],
      [14.550903, 121.058032], [14.551047, 121.057927], [14.551111, 121.057736], [14.551154, 121.057750], [14.551284, 121.057362]] },
  { id: 'uptown', name: 'Uptown Mall Parking', area: 'BGC · Uptown Bonifacio',
    address: '9th Ave. cor. 36th St., Uptown Bonifacio, Taguig', capacity: 130, parked: 90, reserved: 12, rate: 50,
    accessible: true, ev: true, covered: true, busy: 0.8, tone: '#c8d4c4', sign: 'UPTOWN', floors: ['B1', 'B2'],
    landmarks: ['near the Sky Park lifts', 'by the underground link'],
    shape: [[14.556514, 121.055196], [14.555790, 121.054965], [14.555757, 121.055005], [14.555647, 121.054908], [14.555392, 121.054822],
      [14.556465, 121.053496], [14.556769, 121.053760], [14.556738, 121.053848], [14.556784, 121.053956], [14.556926, 121.054063],
      [14.556945, 121.054111], [14.556899, 121.054260], [14.556938, 121.054284], [14.556910, 121.054454], [14.556821, 121.054526],
      [14.556597, 121.055222]] },
  { id: 'greenhills', name: 'Greenhills Mall Parking', area: 'Greenhills · Shopping Center',
    address: 'Ortigas Ave., Greenhills, San Juan', capacity: 160, parked: 140, reserved: 6, rate: 40,
    accessible: true, ev: false, covered: false, busy: 1.05, tone: '#d9cdb8', sign: 'GREENHILLS', floors: ['G'],
    landmarks: ['near the Theatre Mall side', 'by the guard house'],
    shape: [[14.601536, 121.048625], [14.601342, 121.048878], [14.601832, 121.049279], [14.602150, 121.048864], [14.602765, 121.049365],
      [14.603151, 121.048859], [14.601939, 121.047868], [14.601579, 121.048376]] },
  { id: 'rob-manila', name: 'Robinsons Place Manila Parking', area: 'Ermita · Robinsons Place',
    address: 'Pedro Gil St. cor. M. Adriatico St., Ermita, Manila', capacity: 200, parked: 130, reserved: 14, rate: 40,
    accessible: true, ev: false, covered: true, busy: 0.85, tone: '#cfd3d6', sign: 'ROBINSONS', floors: ['B1', 'P2', 'P3'],
    landmarks: ['near the Padre Faura wing', 'by Elevator 5'],
    shape: [[14.574310, 120.983881], [14.574314, 120.983963], [14.574403, 120.984191], [14.574914, 120.985320], [14.576203, 120.984601],
      [14.576366, 120.984895], [14.577635, 120.984337], [14.578660, 120.983796], [14.578256, 120.983009], [14.577210, 120.983570],
      [14.577115, 120.983607], [14.577047, 120.983579], [14.576876, 120.983246], [14.576830, 120.983275], [14.576517, 120.982681],
      [14.575750, 120.983130]] },
  { id: 'atc', name: 'Alabang Town Center Parking', area: 'Ayala Alabang · ATC',
    address: 'Alabang–Zapote Rd. cor. Madrigal Ave., Ayala Alabang, Muntinlupa', capacity: 150, parked: 135, reserved: 9, rate: 40,
    accessible: true, ev: true, covered: true, busy: 1.0, tone: '#c8d4c4', sign: 'ATC', floors: ['P1', 'P2'],
    landmarks: ['near the Corporate Center bridge', 'by the EV chargers'],
    shape: [[14.424080, 121.031384], [14.424377, 121.031533], [14.424620, 121.031001], [14.424629, 121.030869], [14.424451, 121.030787],
      [14.424333, 121.030841]] },
];

// Mock "you are here" (no real GPS): Doña Julia Vargas Ave., between SM Megamall and The Podium
const ME = [14.58515, 121.05788];

// centre of each outline (area-weighted, so it stays inside L-shaped and irregular buildings)
// and straight-line distance from ME
function centroid(shape) {
  let a = 0, lat = 0, lng = 0;
  shape.forEach(([y0, x0], i) => {
    const [y1, x1] = shape[(i + 1) % shape.length], c = x0 * y1 - x1 * y0;
    a += c; lng += (x0 + x1) * c; lat += (y0 + y1) * c;
  });
  return [lat / (3 * a), lng / (3 * a)];
}
function metres([lat1, lng1], [lat2, lng2]) {
  const r = Math.PI / 180, x = (lng2 - lng1) * r * Math.cos(((lat1 + lat2) / 2) * r), y = (lat2 - lat1) * r;
  return 6371000 * Math.hypot(x, y);
}
LOTS.forEach((lot) => {
  lot.center = centroid(lot.shape);
  lot.metres = metres(ME, lot.center);
  lot.distance = lot.metres < 1000 ? `${Math.round(lot.metres / 10) * 10} m` : `${(lot.metres / 1000).toFixed(1)} km`;
});

const SAVED_PLACES = [
  { icon: 'i-home', name: 'Home', sub: 'Shaw Blvd., Mandaluyong', lotId: 'riverside' },
  { icon: 'i-pin', name: 'SM Megamall', sub: 'Preset · EDSA, Mandaluyong', lotId: 'sm-b1' },
  { icon: 'i-pin', name: 'Office', sub: 'ADB Ave., Ortigas Center', lotId: 'north' },
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
  return `<svg class="${cls}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code"><g fill="#021c1c">${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${cells}</g></svg>`;
}

// A QR the gate scanner reads. Tapping it stands in for the scanner reading it.
const gateQr = (svg, attrs) => `<button class="qr-tap" ${attrs} aria-label="QR code for the gate scanner">${svg}</button>`;

let photoN = 0;
function lotPhoto(lot, cls = 'photo') {
  const id = `sky${photoN++}`;
  const floors = [0, 1, 2, 3].map((i) => `<rect x="60" y="${64 + i * 19}" width="230" height="5" fill="rgba(0,0,0,.16)"/>`).join('');
  return `<svg class="${cls}" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Photo of ${esc(lot.name)}">
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

// ---------- map: OpenStreetMap tiles via Leaflet (vendor/leaflet) ----------
// Tiles are greyed with a CSS filter to match the mockups (see .osm-tiles in styles.css).
// tile.openstreetmap.org blocks requests with no Referer ("Access blocked … tile usage policy"),
// and a page opened as file:// never sends one. There we use the German OSM community's tile
// server instead: same OpenStreetMap data and style, and it accepts requests without a Referer.
const OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const TILES = location.protocol === 'file:'
  ? { url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png', attribution: `${OSM_ATTRIBUTION}, tiles by <a href="https://openstreetmap.de" target="_blank" rel="noopener">openstreetmap.de</a>` }
  : { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM_ATTRIBUTION };
const HOME_VIEW = { center: [14.5862, 121.0578], zoom: 16 };
const ZOOMED_AT = 17;          // lot counts show from this zoom (zoomed in.png)
const FAR_BELOW = 15;          // below this, outlines are too small to tap, so lots show as pins
let map, tiles;
const lotLayers = {};          // id → { poly, label }
let userView = null;           // the view to return to once nothing is focused
let focused = false;
let flyingTo = null;           // zoom of the fly animation in progress, if any

function initMap() {
  map = L.map('map', { zoomControl: false, zoomSnap: .25, minZoom: 11, maxZoom: 19 })
    .setView(HOME_VIEW.center, HOME_VIEW.zoom);
  map.attributionControl.setPrefix(false);
  tiles = L.tileLayer(TILES.url, { maxZoom: 19, className: 'osm-tiles', attribution: TILES.attribution });
  // demo offline mode: tiles already on screen stay (like a cache), new ones are left blank
  const createTile = tiles.createTile;
  tiles.createTile = function (coords, done) {
    if (!state.offline) return createTile.call(this, coords, done);
    const blank = document.createElement('div');
    setTimeout(() => done(null, blank));
    return blank;
  };
  tiles.addTo(map);
  map.on('moveend', () => { flyingTo = null; });

  LOTS.forEach((lot) => {
    const open = () => ACTIONS.openLot({ id: lot.id });
    const poly = L.polygon(lot.shape, { className: 'lot-shape', weight: 2 }).on('click', open).addTo(map);
    const label = L.marker(lot.center, { icon: L.divIcon({ className: 'lot-label', iconSize: [0, 0], html: '<b></b>' }), title: lot.name, riseOnHover: true })
      .on('click', open).addTo(map);
    lotLayers[lot.id] = { poly, label };
  });
  L.marker(ME, { icon: L.divIcon({ className: 'me-dot', iconSize: [15, 15] }), interactive: false, keyboard: false, title: 'Your location' }).addTo(map);

  const onZoom = () => {
    $('#map').classList.toggle('zoomed', map.getZoom() >= ZOOMED_AT);
    $('#map').classList.toggle('far', map.getZoom() < FAR_BELOW);
  };
  map.on('zoomend', onZoom);
  onZoom();
  // the map grows when the tab bar hides (lot sheet open), so keep Leaflet's size in sync
  new ResizeObserver(() => {
    const before = map.getSize();
    map.invalidateSize({ pan: flyingTo === null });   // keep the centre, unless a fly animation owns the view
    if (before.equals(map.getSize()) || flyingTo !== null) return;
    const id = ui.focusLot || (current === 'map' ? ui.selectedLot : null);
    if (id) focusLot(id, false);
  }).observe($('#map'));
}

// Put a lot in the strip of map left visible above the sheet (like space selected.png),
// as close as it fits.
function focusLot(id, animate = true) {
  const lot = lotById(id);
  if (!lot) return;
  map.invalidateSize({ pan: false });   // the sheet / tab bar may have just changed the map's size
  if (!focused) { userView = { center: map.getCenter(), zoom: map.getZoom() }; focused = true; }
  const size = map.getSize();
  const b = lotLayers[id].poly.getBounds();
  const fits = (z) => {
    const nw = map.project(b.getNorthWest(), z), se = map.project(b.getSouthEast(), z);
    return se.x - nw.x <= size.x * .7 && se.y - nw.y <= size.y * .16;
  };
  let z = 18;
  while (z > 15 && !fits(z)) z -= .25;
  const centre = map.unproject(map.project(lot.center, z).add([0, size.y * (.5 - .19)]), z);
  if (animate) fly(centre, z, .6);
  else map.setView(centre, z, { animate: false });
}
function fly(center, zoom, duration) {
  map.invalidateSize({ pan: false });
  flyingTo = zoom;
  map.flyTo(center, zoom, { duration });
}
function restoreView() {
  if (!focused) return;
  focused = false;
  fly(userView.center, userView.zoom, .5);
}
function flyHome(center, zoom) { focused = false; fly(center, zoom, .6); }
// the zoom the map is at or heading to, ignoring a focus that is about to be undone
const settledZoom = () => (focused ? userView.zoom : flyingTo ?? map.getZoom());

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
  else restoreView();
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
  LOTS.forEach((lot) => {
    const s = stats(lot);
    const { poly, label } = lotLayers[lot.id];
    const selected = ui.selectedLot === lot.id || ui.focusLot === lot.id;
    for (const el of [poly.getElement(), label.getElement()]) {
      ['high', 'mid', 'low', 'full'].forEach((l) => el.classList.toggle(`lvl-${l}`, l === s.lvl));
      el.classList.toggle('selected', selected);
      el.classList.toggle('reserved', state.reservation?.lotId === lot.id);
    }
    if (selected) poly.bringToFront();
    const el = label.getElement();
    el.firstChild.textContent = s.left || 'Full';
    el.setAttribute('aria-label', `${lot.name}: ${s.left} spaces left, ${STATUS_LABEL[s.status]}`);
  });
  renderBanners();
}

// w reserved.png: "<lot name> | #206" pill under the search bar
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
  if (current === 'map') restoreView();
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
  const alternative = LOTS.filter((l) => l.id !== lot.id && stats(l).left > 0).sort((a, b) => a.metres - b.metres)[0];

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
    <p class="lot-sub"><b>${s.left ? `${s.left} slots left` : 'Full'}</b> · ${s.parked} parked + ${s.reserved} reserved / ${lot.capacity} · <span style="white-space:nowrap">${lot.distance}</span></p>
    <p class="lot-addr" title="${esc(lot.address)}">${icon('i-pin')}<span>${esc(lot.address)}</span></p>

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
    const hits = LOTS.filter((l) => `${l.name} ${l.area} ${l.address}`.toLowerCase().includes(query));
    html = `<h4>Parking near “${esc(q.trim())}”</h4>` + (hits.length ? hits.map((l) => lotRow(l)).join('') : `<p class="empty" style="padding:8px 16px">No lots found. Try “Megamall”, “Podium” or “EDSA”.</p>`);
  } else {
    html = `<h4>Saved places</h4>` + SAVED_PLACES.map((p) => `<button class="row" data-action="pickLot" data-id="${p.lotId}">${icon(p.icon)}
      <span>${p.name}<small>${p.sub} · nearest: ${esc(lotById(p.lotId).name)}</small></span>${icon('i-chevron', 'sm')}</button>`).join('')
      + `<h4>Recent searches</h4>` + (state.recents.length ? state.recents.map((id) => lotRow(lotById(id), 'i-history')).join('') : `<p class="empty" style="padding:8px 16px">Nothing yet.</p>`)
      + `<h4>Nearby</h4>` + [...LOTS].sort((a, b) => a.metres - b.metres).slice(0, 3).map((l) => lotRow(l)).join('');
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
      <p class="caption" style="margin:0 0 8px">${esc(lot.address)} · ${lot.distance} · ${peso(lot.rate)}/hr</p>
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
        <div class="qr-cap">Universal QR Ph</div>`
      : `<div class="pulse" style="margin:8px auto 12px">${icon('i-nfc', 'xl')}</div>
        <h3>Hold your phone or card near the reader</h3><div class="ref">Contactless / NFC</div>`}
    </div>
    <button class="btn primary lg block" data-action="paid">${qr ? "I've paid" : `Pay ${peso(amount)}`}</button>
    <p class="caption center">${qr ? 'Paid in your bank or e-wallet app? Tap above once the payment goes through.' : 'Your receipt appears here once the payment is confirmed.'}</p>`;
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
      ${gateQr(qrSvg(r.ref + r.lotId), 'data-action="entryScan" data-via="reservation"')}
      <div class="qr-cap">${state.offline ? 'Saved offline. Works without signal.' : 'Show this at the gate, or tap NFC.'}</div>
    </div>
    <div class="center" style="margin-bottom:12px"><span class="status-line">${icon('i-info', 'sm')} Floor &amp; slot: assigned when you scan in</span></div>
    <div class="card tinted">
      <div class="kv"><span>Reservation fee</span><span>${peso(RESERVATION_FEE)} paid</span></div>
      <div class="kv credit"><span>Credit at exit</span><span>−${peso(FEE_CREDIT)}</span></div>
      <div class="kv"><span>Reserved for</span><span>${esc(state.identity?.value || 'Guest')}</span></div>
    </div>
    <div class="btn-stack">
      <button class="btn primary lg block" data-action="entryScan" data-via="reservation">${icon('i-nfc')} Check in with NFC</button>
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
    const alts = LOTS.filter((l) => stats(l).left > 0).sort((a, b) => a.metres - b.metres).slice(0, 3);
    body = `<div class="center">
        <div class="big-icon full">${icon('i-warn')}</div>
        <h2 style="margin:0 0 8px">${esc(lot.name)} is full</h2>
        <p class="lead">All ${lot.capacity} spaces are parked or reserved, so the gate can't assign you a slot right now.</p></div>
      <h3 class="section-title">Nearby lots with space</h3>${alts.map(lotCard).join('')}`;
  } else if (!ui.walkinQr) {
    body = `<div class="card"><div class="kv"><span>Spaces left</span><span>${s.left} ${statusChip(s)}</span></div>
        <div class="kv"><span>Rate</span><span>${peso(lot.rate)}/hr · pay on exit</span></div></div>
      <div class="notice">${icon('i-info')}<div>No reservation fee for walk-ins. Your floor and slot are assigned when you scan in.</div></div>
      <button class="btn primary lg block" data-action="genWalkin">Get entry pass</button>`;
  } else {
    const ref = `W-${lot.id.toUpperCase().slice(0, 3)}-${String(Date.now()).slice(-4)}`;
    body = `<div class="ticket"><div class="ref">Walk-in ticket ${ref}</div><h3>${esc(lot.name)}</h3>${gateQr(qrSvg(ref), 'data-action="entryScan" data-via="walkin"')}
        <div class="qr-cap">${state.offline ? 'Saved offline. Works without signal.' : 'Scan this at the gate, or tap NFC'}</div></div>
      <div class="btn-stack" style="margin-top:0">
        <button class="btn primary lg block" data-action="entryScan" data-via="walkin">${icon('i-nfc')} Check in with NFC</button>
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
      <div class="kv"><span>Duration</span><span>2h 15m</span></div>
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
      <div class="ref">Exit pass</div><h3>${esc(lot.name)}</h3>${gateQr(qrSvg('exit' + s.slot + s.lotId), 'data-action="exitScan"')}
      <div class="qr-cap">Show at the exit gate, or tap NFC</div></div>
    <div class="btn-stack" style="margin-top:0">
      <button class="btn primary lg block" data-action="exitScan">${icon('i-nfc')} Exit with NFC</button>
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
  const near = [...LOTS].sort((a, b) => a.metres - b.metres);
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
      <p class="caption center">Updated ${fmtTime(Date.now())}</p>`;
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
      <p class="caption center">Updated ${fmtTime(Date.now())}</p>`;
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
  const wasOffline = $('#map').classList.contains('offline');
  $('#map').classList.toggle('offline', state.offline);
  if (wasOffline && !state.offline) tiles.redraw();   // fill in tiles left blank while offline
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
    flyHome(ME, 17);
    toast('Showing your location.');
  },
  demoZoom: () => {
    const zoomedIn = settledZoom() >= ZOOMED_AT;
    if (current !== 'map') tab('map');
    closeSheet();
    if (zoomedIn) flyHome(HOME_VIEW.center, HOME_VIEW.zoom);
    else flyHome([14.5852, 121.0575], 17.5);
  },
  voice: () => toast("Voice search isn't available yet."),
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
    toast(`Code sent to +63 ${v.slice(-10)}.`);
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
    toast('Reservation cancelled.');
  },
  entryScan: (d) => entryScan(d.via),
  walkinAt: (d) => { ui.walkinLot = d.id; ui.walkinQr = false; goFrom('scan', 'walkin'); },
  genWalkin: () => { ui.walkinQr = true; renderWalkin(); },
  print: () => toast('Ticket sent to the gate printer.'),
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
    closeSheet();
    state = defaultState(); save();
    Object.assign(ui, { selectedLot: null, pendingLot: null, walkinQr: false, exitDone: false });
    applyTheme(); applyOffline(); tab('map');
    toast('Local data cleared.');
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
addEventListener('offline', () => { state.offline = true; save(); applyOffline(); RENDER[current]?.(); });
addEventListener('online', () => { state.offline = false; save(); applyOffline(); RENDER[current]?.(); });
initMap();
applyTheme();
applyOffline();
renderDrawer();
if (state.reservation && state.reservation.expiresAt <= Date.now()) expireReservation();
tab('map');
setInterval(tick, 1000);
