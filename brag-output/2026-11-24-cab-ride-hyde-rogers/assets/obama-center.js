// The Obama Presidential Center, in Jackson Park between Stony Island Ave and the West Lagoon just south of the Midway
// Plaisance (opened 2026), for the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers/assets/cab-ride.js), as a
// shareable module like ballys-chicago.js. The 59th St Metra station, where the film opens, is 300 m to the north-west.
//
// Where the numbers come from:
//   - Footprints and positions: OpenStreetMap, November 2026, through the Chicago Cityscape CLI (the Museum, way 1434240394;
//     the Forum 1434240395; the Library 1531754627 and its roof garden 1528631087; the Nancy Pelosi Garden Pavilion
//     1510607941; Home Court 1463249421 and its Main Court 1531768697; the Woman's Garden 1530944181; the Great Lawn
//     1510670285; the plaza is the gap OSM leaves between the Museum, the Forum, the Library and the street).
//   - Heights: Planned Development 1409 as revised February 10, 2021 (sheets PD-07.1 to 07.8 in the 2023 minor-change file,
//     gisapps.chicago.gov/gisimages/zoning_pds/PD1409.pdf): the Museum 219 ft to its roof (the 2018 approval allowed 235 ft;
//     the Foundation and the architects say 225 ft, which must be to the top of the letter screen), the Forum 22 ft, the
//     Library 36 ft, the Program, Athletic and Activity Center ("Home Court") 50 ft at most.
//   - The Museum's shape: the PD's four elevations at 1" = 50', which show every face widest about 83 ft up (the
//     "representative tower level plan" is 120 ft square) and leaning in to about 97 ft at the roof and 105-109 ft at the
//     ground, with sculptural facets at the corners; checked against photographs of the finished tower on Wikimedia Commons
//     (April-June 2026). The corner facets, the stepped volume at the north-east corner and the sunken courtyards are left out.
//   - The letter screen ("Words of Hope", Pentagram with Tod Williams Billie Tsien): 103 words of Obama's 2015 Selma speech in
//     458 letters 4 ft 4 in tall (Pentagram; the Foundation says 5 ft), cast in concrete, wrapping the upper south-west corner,
//     two elevations each about 84 ft tall and 67 ft wide (ASCE Civil Engineering Source, June 8, 2026). The words are the
//     Foundation's (obama.org/visit/museum/exterior), split into the 19 lines the photographs show.
//   - The stone: heavily figured grey granite in courses about 9 ft 4 in tall (ASCE). The ribbed bas-relief at the south-east
//     corner, the frosted light-box slot over the plaza entrance and the punched windows are placed from the photographs.
//   - Cook County's 2022 LiDAR predates the buildings (that spring the site was an excavation), so nothing here is measured.
//   Assumed: the Forum's and the Library's glass walls, roof slabs and planted roofs; the terrace over the parking structure
//   (2.5 m) that carries the vegetable garden and the garden pavilion; Home Court as a 15 m gymnasium box in metal panels
//   beside an 8 m masonry wing; the trees (a grove along Stony Island, a ring round the Woman's Garden, the lawn's edges).
//
//   import * as THREE from "three";
//   import { buildObamaCenter } from "./obama-center.js";
//   scene.add(buildObamaCenter({ THREE }));
//
// Coordinates are local metres, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass your own origin, or { origin: OBAMA_CENTRE } to have the Museum tower at about (0, 0, 0). It needs a
// browser (or another DOM with <canvas>): the granite, the glass, the paving and the lettering are painted on canvas textures.

export const OBAMA_CENTRE = [-87.585879, 41.786262];                 // the Museum tower
const FILM_ORIGIN = [-87.620063, 41.863968];

// The campus, for clearing OpenStreetMap's buildings off it (the film's city files have the Museum 32 m tall from its "9
// levels", and the Forum, the Library and Home Court as 6 m boxes): Stony Island Ave to the lagoon, the Midway to Hayes Dr,
// stepping round the old comfort station at the south-east, which stays.
export const OBAMA_SITE = [[-87.58635, 41.78760], [-87.58450, 41.78760], [-87.58450, 41.78310], [-87.58530, 41.78310],
  [-87.58530, 41.78270], [-87.58635, 41.78270]];
export function obamaSite(origin = FILM_ORIGIN) {                   // the same as a closed ring of local metres [x, z, ...]
  const L = localiser(origin), q = OBAMA_SITE.flatMap(([lon, lat]) => L(lon, lat));
  return [...q, q[0], q[1]];
}
const localiser = (origin) => {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
};

// The words on the tower, as the 19 lines run: each starts on the west face and carries on round the corner onto the south
// face (no spaces: the letters are joined by ligatures).
const WORDS = [["YOUAREAMERICA", "UNCONSTRAIN"], ["EDBYHABITAND", "CONVENTION"], ["UNENCUMBERED", "BYWHATISRE"],
  ["ADYTOSEIZEW", "HATOUGHTTO"], ["BEFOREVERYW", "HEREINTHIS"], ["COUNTRYTHERE", "AREFIRSTSTEPS"], ["TOBETAKENTHE", "REISNEWGROU"],
  ["NDTOCOVERTHE", "REAREMORE"], ["BRIDGESTOBECR", "OSSEDAMERICA"], ["ISNOTTHEPROJ", "ECTOFANYONE"], ["PERSONTHESING", "LEMOSTPOWER"],
  ["FULWORDINOU", "RDEMOCRACY"], ["ISTHEWORDWE", "WETHEPEOPLE"], ["WESHALLOVERCO", "MEYESWECAN"], ["THATWORDISOW", "NEDBYNOONE"],
  ["ITBELONGSTO", "EVERYONEOH"], ["WHATAGLORIOU", "STASKWEARE"], ["GIVENTOCONTI", "NUALLYTRYTO"], ["IMPROVETHISGREAT", "NATIONOFOURS"]];

// res: texture pixels per drawing unit (the film uses 2 at 4K)
export function buildObamaCenter({ THREE, origin = FILM_ORIGIN, res = 1 }) {
  const group = new THREE.Group();
  group.name = "obama-center";
  const L = localiser(origin);
  const SUN = new THREE.Vector3(0.42, 0.78, 0.46).normalize();     // from the south-east, high (the film's)
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const canvas = (w, h) => { const cv = document.createElement("canvas"); cv.width = w * res; cv.height = h * res; const c = cv.getContext("2d"); c.scale(res, res); return [cv, c]; };
  const texture = (cv, repeat = true) => {
    const t = new THREE.CanvasTexture(cv);
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  };
  const lit = (nx, nz) => 0.58 + 0.42 * Math.max(0, nx * SUN.x + nz * SUN.z);

  // the granite: figured grey stone in panels one course tall, painted over w x h metres starting at seed s
  const granite = (c, w, h, s, course = 2.85) => {
    c.fillStyle = "#a6aaad"; c.fillRect(0, 0, w, h);
    let k = s;
    for (let y = 0; y < h; y += course) {                           // a course of panels of uneven widths, each its own shade
      for (let x = 0, i = 0; x < w; i++) {
        const pw = 0.9 + 0.6 * hash(k + i * 0.37), g = 160 + Math.round(22 * hash(k + i * 0.71));
        c.fillStyle = `rgb(${g},${g + 3},${g + 6})`; c.fillRect(x, y, pw + 0.02, course + 0.02);
        x += pw;
      }
      k += 3.1;
    }
    for (let i = 0; i < w * h * 0.9; i++) {                          // the veining: short diagonal streaks, light and dark
      const x = w * hash(s + i * 0.13), y = h * hash(s + i * 0.29), a = -0.5 + 1.0 * hash(s + i * 0.47), len = 0.4 + 1.6 * hash(s + i * 0.59);
      c.strokeStyle = hash(s + i * 0.83) < 0.6 ? "rgba(224,227,229,0.55)" : "rgba(110,115,120,0.45)";
      c.lineWidth = 0.05 + 0.12 * hash(s + i * 0.91);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * len, y - Math.sin(a) * len * 1.6); c.stroke();
    }
    c.fillStyle = "rgba(70,74,78,0.35)";
    for (let y = course; y < h; y += course) c.fillRect(0, y - 0.02, w, 0.04);   // the joints between courses
  };
  // the tiled facades: one tile covers TILE.w x TILE.h metres
  const TILE = { stone: [4, 2.85], glass: [4, 4], concrete: [4, 4], green: [8, 8], paving: [24, 24], metal: [4, 15], masonry: [4, 4], soffit: [4, 4], roof: [8, 8] };
  const PAINT = {
    stone: (c) => granite(c, 4, 2.85, 7.3),
    glass: (c) => {                                                 // dark glass behind bronze mullions
      c.fillStyle = "#3f5262"; c.fillRect(0, 0, 4, 4); c.fillStyle = "#5f7384"; c.fillRect(0, 0, 4, 0.9);
      c.fillStyle = "#5a4a38"; for (const x of [0, 1.33, 2.67]) c.fillRect(x, 0, 0.06, 4); c.fillRect(0, 3.92, 4, 0.08);
    },
    concrete: (c) => { c.fillStyle = "#cfcdc6"; c.fillRect(0, 0, 4, 4); c.fillStyle = "#c3c1ba"; c.fillRect(0, 1.98, 4, 0.04); c.fillRect(1.98, 0, 0.04, 4); },
    green: (c) => {                                                 // a planted roof or lawn, mottled
      c.fillStyle = "#6c9a4e"; c.fillRect(0, 0, 8, 8);
      for (let i = 0; i < 90; i++) { c.fillStyle = hash(i * 0.7) < 0.5 ? "#5f8c44" : "#7aa65a"; c.beginPath(); c.arc(8 * hash(i * 0.31), 8 * hash(i * 0.53), 0.3 + 0.5 * hash(i * 0.77), 0, 7); c.fill(); }
    },
    paving: (c) => {                                                // the plaza: a checkerboard of grey granite slabs in three tones
      c.fillStyle = "#b4b6b8"; c.fillRect(0, 0, 24, 24);
      const TONES = ["#c6c8ca", "#a9acae", "#8d9195", "#bcbfc1"];
      for (let y = 0; y < 24; y += 3) for (let x = 0, i = 0; x < 24; i++) { const w = 2 + 4 * hash(y * 1.7 + i * 0.41); c.fillStyle = TONES[Math.floor(4 * hash(y * 2.3 + i * 0.67))]; c.fillRect(x, y, w - 0.04, 2.96); x += w; }
    },
    metal: (c) => {                                                 // the gymnasium's ribbed panels, the full 15 m, with a clerestory band near the top
      c.fillStyle = "#b9bcbe"; c.fillRect(0, 0, 4, 15); c.fillStyle = "#9da1a4"; for (let x = 0; x < 4; x += 0.5) c.fillRect(x, 0, 0.05, 15);
      c.fillStyle = "#4b5661"; c.fillRect(0, 2.2, 4, 1.6); c.fillStyle = "#8c9ba8"; for (let x = 0.4; x < 4; x += 1.2) c.fillRect(x, 2.2, 0.06, 1.6);
    },
    masonry: (c) => { c.fillStyle = "#6e5a4e"; c.fillRect(0, 0, 4, 4); c.fillStyle = "#5e4c42"; for (let y = 0; y < 4; y += 0.3) c.fillRect(0, y, 4, 0.03); },
    soffit: (c) => { c.fillStyle = "#f2f1ed"; c.fillRect(0, 0, 4, 4); },
    roof: (c) => { c.fillStyle = "#8f9397"; c.fillRect(0, 0, 8, 8); c.fillStyle = "#868a8e"; c.fillRect(0, 0, 8, 0.08); c.fillRect(0, 0, 0.08, 8); },
  };
  const groups = {};
  for (const k of Object.keys(PAINT)) groups[k] = { pos: [], col: [], uvs: [] };
  const push = (G, v, c, u, w) => { G.pos.push(v[0], v[1], v[2]); G.col.push(c[0], c[1], c[2]); G.uvs.push(u, w); };
  const quad = (G, A, B, C, D, cl, ch, u0, u1, v0, v1) => {         // A, B along the bottom (left to right seen from outside), C, D above them
    push(G, A, cl, u0, v0); push(G, B, cl, u1, v0); push(G, C, ch, u1, v1);
    push(G, A, cl, u0, v0); push(G, C, ch, u1, v1); push(G, D, ch, u0, v1);
  };
  // One closed ring ([x, z, ..., x0, z0]) from y0 to y1, its walls in facade `side` (a key, or a function of the wall's
  // direction (dx, dz) giving one), its flat top in `cap` (null for none), both tinted by `c` (0-1 RGB).
  const extrude = (p, y0, y1, side, cap, c, cc = c) => {
    const n = p.length / 2 - 1;
    for (let i = 0; i < n; i++) {
      const x0 = p[i * 2], z0 = p[i * 2 + 1], x1 = p[i * 2 + 2], z1 = p[i * 2 + 3], len = Math.hypot(x1 - x0, z1 - z0);
      if (len < 0.05) continue;
      const key = typeof side === "function" ? side(x1 - x0, z1 - z0) : side, [tw, th] = TILE[key];
      const nx = (z1 - z0) / len, nz = -(x1 - x0) / len, k = lit(nx, nz), lo = c.map((v) => v * k * 0.86), hi = c.map((v) => v * k);
      quad(groups[key], [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], lo, hi, 0, len / tw, y0 / th, y1 / th);
    }
    if (!cap) return;
    const [tw, th] = TILE[cap], contour = [];
    for (let i = 0; i < n; i++) contour.push(new THREE.Vector2(p[i * 2], p[i * 2 + 1]));
    for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) for (const k of t) push(groups[cap], [contour[k].x, y1, contour[k].y], cc.map((v) => v * 1.08), contour[k].x / tw, contour[k].y / th);
  };
  const shrink = (p, k) => {                                      // a ring pulled toward (k < 1) or pushed from (k > 1) its centre
    const n = p.length / 2 - 1; let cx = 0, cz = 0;
    for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
    return p.map((v, i) => (i % 2 ? cz : cx) + (v - (i % 2 ? cz : cx)) * k);
  };
  const ring = (pts) => { const q = pts.flatMap(([lon, lat]) => L(lon, lat)); return [...q, q[0], q[1]]; };
  const box = (lon0, lon1, lat0, lat1) => ring([[lon0, lat1], [lon1, lat1], [lon1, lat0], [lon0, lat0]]);   // its corners, clockwise seen from above
  const ends = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? "stone" : "glass");     // stone on walls running east-west, glass on the others
  const sides = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? "glass" : "stone");
  const WHITE = [1, 1, 1], STONE = [0.96, 0.96, 0.95];

  /* ---- the Museum tower: a 120 ft square at its widest, 83 ft up, leaning in toward the ground and the roof ---- */
  const [cx, cz] = L(...OBAMA_CENTRE), HALF = 18.3, H = 66.8;      // 120 ft, 219 ft
  // the faces' insets from the 120 ft square at each knot height (metres; from the PD elevations, 2021)
  const KNOTS = [0, 25.3, 41.1, H];
  const INSET = { N: [2.2, 0, 0.6, 3.2], S: [1.0, 0, 0.3, 3.0], E: [2.4, 0, 0.6, 3.2], W: [1.5, 0, 0.3, 3.0] };
  const insetAt = (f, y) => { let i = 0; while (y > KNOTS[i + 1]) i++; const t = (y - KNOTS[i]) / (KNOTS[i + 1] - KNOTS[i]); return INSET[f][i] + (INSET[f][i + 1] - INSET[f][i]) * t; };
  const xW = (y) => cx - HALF + insetAt("W", y), xE = (y) => cx + HALF - insetAt("E", y);
  const zN = (y) => cz - HALF + insetAt("N", y), zS = (y) => cz + HALF - insetAt("S", y);
  // each face's corners at height y, left to right as seen from outside: west (left = north), south (left = west),
  // east (left = south), north (left = east)
  const FACE = {
    W: { at: (y) => [[xW(y), y, zN(y)], [xW(y), y, zS(y)]], n: [-1, 0] },
    S: { at: (y) => [[xW(y), y, zS(y)], [xE(y), y, zS(y)]], n: [0, 1] },
    E: { at: (y) => [[xE(y), y, zS(y)], [xE(y), y, zN(y)]], n: [1, 0] },
    N: { at: (y) => [[xE(y), y, zN(y)], [xW(y), y, zN(y)]], n: [0, -1] },
  };
  // What is on each face, in metres from its left edge (seen from outside) and from the ground: [x, y, w, h, kind].
  // dark: a window; frost: the light box over the plaza entrance; glass: the glazed base; ribs: the bas-relief; screen: the
  // dark glazing behind the letter screen (the letters are their own mesh).
  const SCREEN_W = 19.0, SCREEN_Y = H - 25.6;                       // 67 ft wide on each face, 84 ft tall, to the roof
  const FEATURES = {
    W: [[2 * HALF - SCREEN_W, SCREEN_Y, SCREEN_W, H - SCREEN_Y, "screen"], [7, 48, 3, 3, "dark"], [9.5, 0, 2.4, 7, "dark"], [26, 0, 10, 6, "glass"]],
    S: [[0, SCREEN_Y, SCREEN_W, H - SCREEN_Y, "screen"], [14, 8, 4.5, 28, "frost"], [0, 0, 21, 5, "glass"], [28.6, 0, 8, 45, "ribs"], [24, 52, 2.5, 2.5, "dark"]],
    E: [[0, 0, 11, 42, "ribs"], [5, 20, 3, 3, "dark"], [6, 8, 2, 2, "dark"], [15, 44, 2.5, 2.5, "dark"], [22, 44, 3, 3, "dark"], [29, 46, 6, 3, "dark"]],
    N: [[16, 10, 4, 22, "stained"], [4, 50, 4, 5, "dark"], [10, 46, 2.5, 2.5, "dark"], [3, 40, 2, 2, "dark"], [26, 0, 8, 5, "glass"]],
  };
  const tower = new THREE.Group(); tower.name = "museum";
  for (const f of Object.keys(FACE)) {
    const [cv, c] = canvas(512, 1024), W = 2 * HALF;
    c.scale(512 / W, 1024 / H); c.translate(0, H); c.scale(1, -1);  // metres, y up from the ground
    granite(c, W, H, { W: 1.1, S: 2.2, E: 3.3, N: 4.4 }[f]);
    for (const [x, y, w, h, kind] of FEATURES[f]) {
      if (kind === "ribs") { for (let r = 0; r < w; r += 0.5) { c.fillStyle = "#9ca0a4"; c.fillRect(x + r, y, 0.25, h); c.fillStyle = "#c4c7ca"; c.fillRect(x + r + 0.25, y, 0.25, h); } continue; }
      c.fillStyle = { dark: "#1f262c", frost: "#d9e7ef", glass: "#2b3a46", stained: "#4e5f72", screen: "#23262a" }[kind];
      c.fillRect(x, y, w, h);
      if (kind === "frost" || kind === "stained") { c.fillStyle = kind === "frost" ? "#e9f1f5" : "#8a9bad"; for (let yy = y + 2.8; yy < y + h; yy += 2.85) c.fillRect(x, yy, w, 0.12); }
      if (kind === "glass") { c.fillStyle = "#5a4a38"; for (let xx = x + 1.5; xx < x + w; xx += 1.5) c.fillRect(xx, y, 0.08, h); }
      if (kind === "dark") { c.fillStyle = "#d4d7d9"; c.fillRect(x - 0.15, y - 0.15, w + 0.3, 0.15); c.fillRect(x - 0.15, y - 0.15, 0.15, h + 0.3); }   // a pale reveal
    }
    const G = { pos: [], col: [], uvs: [] }, k = lit(...FACE[f].n);
    for (let i = 0; i + 1 < KNOTS.length; i++) {
      const [A, B] = FACE[f].at(KNOTS[i]), [D, C] = FACE[f].at(KNOTS[i + 1]);
      quad(G, A, B, C, D, [k * 0.9, k * 0.9, k * 0.9], [k, k, k], 0, 1, KNOTS[i] / H, KNOTS[i + 1] / H);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, map: texture(cv, false), side: THREE.DoubleSide }));
    m.name = "face-" + f;
    tower.add(m);
  }
  {                                                               // the roof: flat, with the skylight over the Sky Room
    const [cv, c] = canvas(128, 128);
    c.fillStyle = "#8d9094"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#c7d4de"; c.fillRect(30, 50, 40, 40); c.fillStyle = "#7d8185"; c.fillRect(84, 20, 24, 18);
    const g = new THREE.BufferGeometry(), G = { pos: [], col: [], uvs: [] };
    quad(G, [xW(H), H, zS(H)], [xE(H), H, zS(H)], [xE(H), H, zN(H)], [xW(H), H, zN(H)], [1.05, 1.05, 1.05], [1.05, 1.05, 1.05], 0, 1, 0, 1);
    g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, map: texture(cv, false), side: THREE.DoubleSide }));
    m.name = "roof"; tower.add(m);
  }
  {                                                               // the letter screen: the 19 lines, the left of each on the west face, the rest on the south
    const [cv, c] = canvas(1024, 640);
    c.fillStyle = "#1c1f23"; c.fillRect(0, 0, 1024, 640);
    const LH = 640 / WORDS.length;                                 // the letters fill their line, as built
    c.fillStyle = "#d6d8da"; c.textBaseline = "alphabetic"; c.font = `700 ${LH * 0.86}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    WORDS.forEach(([w, s], i) => {
      const y = LH * (i + 0.84);
      for (const [text, x0] of [[w, 0], [s, 512]]) {               // each half stretched to its face's 512 px
        const tw = c.measureText(text).width;
        c.save(); c.translate(x0, y); c.scale(500 / tw, 1); c.fillText(text, 6, 0); c.restore();
      }
    });
    const tex = texture(cv, false), G = { pos: [], col: [], uvs: [] }, OUT = 0.18;   // the panels stand a little proud of the stone
    const kW = lit(-1, 0), kS = lit(0, 1), y0 = SCREEN_Y;
    // west face: from SCREEN_W north of the corner to the corner; south face: from the corner SCREEN_W east
    quad(G, [xW(y0) - OUT, y0, zS(y0) - SCREEN_W], [xW(y0) - OUT, y0, zS(y0)], [xW(H) - OUT, H, zS(H)], [xW(H) - OUT, H, zS(H) - SCREEN_W], [kW, kW, kW], [kW, kW, kW], 0, 0.5, 0, 1);
    quad(G, [xW(y0), y0, zS(y0) + OUT], [xW(y0) + SCREEN_W, y0, zS(y0) + OUT], [xW(H) + SCREEN_W, H, zS(H) + OUT], [xW(H), H, zS(H) + OUT], [kS, kS, kS], [kS, kS, kS], 0.5, 1, 0, 1);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, map: tex, side: THREE.DoubleSide }));
    m.name = "letter-screen"; tower.add(m);
  }
  group.add(tower);

  /* ---- the low buildings: granite ends, glass sides, a deep roof slab with a planted roof on top ---- */
  // the Forum, east of the plaza (22 ft): its outline is OSM's; the slab overhangs on every side, most toward the plaza
  const FORUM = ring([[-87.585718, 41.785997], [-87.585745, 41.785996], [-87.585744, 41.785949], [-87.585743, 41.785895], [-87.585741, 41.785831], [-87.58574, 41.785787], [-87.585775, 41.785787], [-87.585774, 41.785722], [-87.585739, 41.785722], [-87.585738, 41.785704], [-87.585735, 41.785551], [-87.585731, 41.785409], [-87.585363, 41.785414], [-87.585368, 41.785605], [-87.585309, 41.785607], [-87.585318, 41.785893], [-87.585379, 41.785892], [-87.585382, 41.786001]]);
  extrude(FORUM, 0, 5.8, ends, null, WHITE);
  extrude(shrink(FORUM, 1.09), 5.8, 6.7, "concrete", "roof", STONE);
  extrude(FORUM, 6.7, 7.3, "concrete", "green", STONE, WHITE);
  // the Library, south of the plaza (36 ft), and its roof garden; the garden runs on south over the parking structure, with
  // the Nancy Pelosi Garden Pavilion on it
  const LIB = box(-87.586007, -87.585545, 41.785162, 41.785359);
  extrude(LIB, 0, 10.2, sides, null, WHITE);
  extrude(shrink(LIB, 1.06), 10.2, 11.0, "concrete", "roof", STONE);
  extrude(shrink(LIB, 0.96), 11.0, 11.6, "concrete", "green", STONE, WHITE);
  const TERRACE = box(-87.585913, -87.585386, 41.784813, 41.785162);
  extrude(TERRACE, 0, 2.5, "concrete", "green", STONE, WHITE);
  const PAV = box(-87.585659, -87.585316, 41.785005, 41.785108);
  extrude(PAV, 2.5, 6.0, "glass", null, WHITE);
  extrude(shrink(PAV, 1.08), 6.0, 6.6, "soffit", "roof", WHITE);
  // Home Court, at the south end by Hayes Dr: the gymnasium box in metal panels (15 m), the wing in dark masonry (8 m)
  const HOME = ring([[-87.585357, 41.783237], [-87.585344, 41.782891], [-87.586086, 41.782877], [-87.5861, 41.783224]]);
  extrude(HOME, 0, 8, "masonry", "roof", WHITE);
  extrude(box(-87.585963, -87.585344, 41.782879, 41.783147), 0, 15, "metal", "roof", WHITE);
  // the plaza, granite-paved, from the street to the Forum between the Museum and the Library (the Forum stands on it)
  const PLAZA = box(-87.586330, -87.585309, 41.785359, 41.786105);
  extrude(PLAZA, 0, 0.03, "concrete", "paving", WHITE);

  for (const [k, G] of Object.entries(groups)) {
    if (!G.pos.length) continue;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
    const [cv, c] = canvas(256, 256);
    c.scale(256 / TILE[k][0], 256 / TILE[k][1]);
    PAINT[k](c);
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, map: texture(cv), side: THREE.DoubleSide }));
    mesh.name = k;
    group.add(mesh);
  }

  /* ---- trees: the grove along Stony Island, a ring round the Woman's Garden north of the Museum, the Great Lawn's edges ---- */
  const spots = [];
  const row = (a, b, every) => { const [ax, az] = L(...a), [bx, bz] = L(...b), n = Math.floor(Math.hypot(bx - ax, bz - az) / every); for (let i = 0; i <= n; i++) spots.push([ax + (bx - ax) * i / n, az + (bz - az) * i / n]); };
  row([-87.586300, 41.785380], [-87.586300, 41.786090], 8); row([-87.586235, 41.785420], [-87.586235, 41.786050], 8);
  row([-87.586300, 41.786250], [-87.586300, 41.787500], 10);     // on north along the street to the Midway
  const [wx, wz] = L(-87.585742, 41.787039);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; spots.push([wx + 46 * Math.cos(a), wz + 44 * Math.sin(a)]); }
  row([-87.584600, 41.783250], [-87.584600, 41.784330], 12); row([-87.585560, 41.783300], [-87.585560, 41.784300], 14);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.24, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }), spots.length);
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.8, 1), new THREE.MeshStandardMaterial({ color: 0x4f7d3a, roughness: 1, flatShading: true }), spots.length);
  const dummy = new THREE.Object3D();
  spots.forEach(([x, z], i) => {
    const k = 0.8 + 0.4 * hash(i + 0.37);
    dummy.position.set(x, 1.6, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, k, 1); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 3.2 + 2.4 * k, z); dummy.rotation.set(0, hash(i) * 6, 0); dummy.scale.set(k, k * 0.9, k); dummy.updateMatrix(); crown.setMatrixAt(i, dummy.matrix);
  });
  trunk.name = "tree-trunks"; crown.name = "tree-crowns";
  group.add(trunk, crown);
  return group;
}
