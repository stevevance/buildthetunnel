// NewCity: the shopping center and apartment tower on the old Lincoln Park shopping center site, in the triangle of
// Halsted St (west), Clybourn Ave (north-east) and Blackhawk St (south), Lincoln Park (1457 N Halsted St, opened 2014-15;
// architect and planner OKW Architects). For the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a
// shareable module like salt-shed.js.
//
// What it draws:
//   - The Residences at NewCity: a 19-storey tower (three in the podium, 16 above it) standing on the podium on Halsted St,
//     22 m wide and 69 m long, north-south, its north-west and south-east corners rounded off into all-glass prows; blue
//     glass with white slab edges at each floor, stacks of balconies (white slabs, glass rails) on the long east and west
//     faces, a mechanical penthouse on the roof.
//   - The podium under it: retail and the tower's lobby, silver ribbed metal panels over shopfront glass, a ribbon window
//     on the top floor; the pool deck on the lower south part.
//   - The north building (Dick's Sporting Goods and others) on Halsted and Clybourn: two tall retail floors under a green
//     roof crossed by paths, its south side curved around the plaza.
//   - The main block along Clybourn: Mariano's below and the cinema (now AMC NewCity 14) above, light and mid-grey metal
//     panels over a ribbon of second-floor glass and the shopfronts, its plaza side a glass curtain wall.
//   - The garage behind it on Blackhawk St: six decks of white spandrels and dark openings, the open top deck striped for
//     cars, two courts on it.
//   (The plaza between them, with its fountain, is left to the film's ground.)
//
// Where the numbers come from:
//   - Footprints: OpenStreetMap (November 2026, through the Chicago Cityscape CLI): ways 325764478 (north building),
//     325764477 (main block; the garage, way 1004593498, cut out of it), 325764476 and 381783835 (podium), 1004593499
//     (tower), 1313371511 and 1313371512 (the courts on the garage), 1435154637 (the pool); the site is the landuse way
//     325764479 ("New City").
//   - Heights: Cook County's 2022 LiDAR (ISGS IL_Cook_DSM_2022 minus IL_Cook_DTM_2022; a 4 m grid over the block and a 2 m
//     grid over the tower; ground 180.4-180.8 m NAVD88): tower main roof 66 m (DSM 246.4 m), penthouse 72 m (252.9 m);
//     main block 24 m (204.5 m); garage top deck 21.6 m (202.4 m, the courts at the same level); podium 16.6 m (197.0 m),
//     its south part and the pool deck 15.6 m (196.0 m); north building 12.4 m (193.1 m, flat). The LiDAR's plateau over
//     the tower narrows at the north-west and south-east, as OSM's footprint does.
//   - Storeys: 19 (news and listing descriptions of the tower; 199 units); 66 m - 16.6 m over 16 floors = 3.09 m each.
//   - Looks: OKW Architects' project photos (Defined Space, 2015-16): the tower's blue glass, rounded prow and balconies,
//     the podium's silver panels, the cinema's grey panel box and glass corner on the plaza, the green roof; the 2019 NAIP
//     aerial (USGS NAIP Plus) for the roofs (green roof with paths, white membrane, grey garage deck, the pool).
//   Assumed: the prows' curve (OSM and the LiDAR give a straight chamfer; the photos show a curve), the balcony stacks'
//   number and spacing, the garage's deck heights and column spacing, panel patterns, the penthouse's exact outline.
//   Left out: signs, canopies, the plaza's fountain and planting, rooftop units, the garage's ramps and stair towers.
//   Reference images: refs/new-city/SOURCES.md.
//
//   import * as THREE from "three";
//   import { buildNewCity, newCitySite } from "./new-city.js";
//   scene.add(buildNewCity({ THREE, origin }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at
// the lakefront). It needs a browser (or another DOM with <canvas>): the facades are painted on canvas textures.
const FILM_ORIGIN = [-87.620063, 41.863968];
export const NEW_CITY_CENTRE = [-87.6470, 41.9082];

// ---- the footprints (OpenStreetMap), [lon, lat] ----
const NORTH = [[-87.648111, 41.909492], [-87.648087, 41.9087], [-87.647788, 41.908702], [-87.647757, 41.908913], [-87.647724, 41.908916],
  [-87.647692, 41.908925], [-87.647661, 41.908938], [-87.647637, 41.908954], [-87.647634, 41.908978], [-87.647607, 41.908989],
  [-87.647582, 41.908995], [-87.64755, 41.908995], [-87.647255, 41.908792], [-87.647023, 41.908965], [-87.647862, 41.909573],
  [-87.647915, 41.909534], [-87.647952, 41.90954], [-87.64799, 41.909533], [-87.648022, 41.909518], [-87.648039, 41.909496]];
// the main block without the garage; its edges from vertex PLAZA_FROM on face the plaza (glass)
const MAIN = [[-87.64688, 41.908871], [-87.645749, 41.908065], [-87.645732, 41.908045], [-87.64574, 41.908022], [-87.645761, 41.908004],
  [-87.645781, 41.907999], [-87.645805, 41.907997], [-87.645826, 41.908004], [-87.645954, 41.907906], [-87.646053, 41.907828],
  [-87.646139, 41.907762], [-87.646163, 41.907744], [-87.646182, 41.907728], [-87.646197, 41.907716], [-87.646282, 41.907776],
  [-87.646737, 41.908094], [-87.64727, 41.908085], [-87.647275, 41.908322], [-87.647326, 41.908371], [-87.64726, 41.908421],
  [-87.647198, 41.908371], [-87.647142, 41.908433], [-87.647106, 41.90852], [-87.647101, 41.908593], [-87.647101, 41.908665],
  [-87.647126, 41.908696]];
const PLAZA_FROM = 16;
const GARAGE = [[-87.646737, 41.908094], [-87.646282, 41.907776], [-87.646197, 41.907716], [-87.646237, 41.907683], [-87.646265, 41.907661],
  [-87.64629, 41.90764], [-87.646307, 41.907627], [-87.646328, 41.907626], [-87.64635, 41.907613], [-87.646351, 41.907605],
  [-87.646368, 41.907605], [-87.647573, 41.907585], [-87.647581, 41.907989], [-87.647583, 41.908081], [-87.647413, 41.908084],
  [-87.64727, 41.908085]];
const PODIUM_N = [[-87.648073, 41.908477], [-87.647783, 41.908488], [-87.647735, 41.908421], [-87.647669, 41.908366], [-87.647583, 41.908332],
  [-87.647583, 41.908081], [-87.647581, 41.907989], [-87.647678, 41.907991], [-87.647685, 41.907868], [-87.647873, 41.9077], [-87.648058, 41.9077]];
const PODIUM_S = [[-87.647573, 41.907585], [-87.648046, 41.907581], [-87.648058, 41.9077], [-87.647873, 41.9077], [-87.647685, 41.907868],
  [-87.647678, 41.907991], [-87.647581, 41.907989]];
// the tower: north tip, east side, the south-east chamfer (a curve here), south tip, west side, the north-west chamfer (a curve)
const TOWER = { n0: [-87.647796, 41.908357], n1: [-87.647733, 41.908338], e1: [-87.647711, 41.907996], se0: [-87.647714, 41.907875],
  se1: [-87.647901, 41.907733], s: [[-87.647945, 41.907743], [-87.647965, 41.907764]], sw: [-87.647978, 41.907782], nw0: [-87.647992, 41.908217] };
const PENTHOUSE = [[-87.64794, 41.90822], [-87.64780, 41.90822], [-87.64780, 41.90790], [-87.64794, 41.90790]];
const COURTS = [[[-87.646864, 41.907754], [-87.646495, 41.907761], [-87.646491, 41.907617], [-87.64686, 41.90761]],
  [[-87.647248, 41.907756], [-87.646879, 41.907762], [-87.646874, 41.907618], [-87.647243, 41.907612]]];
const POOL = [[-87.647868, 41.90772], [-87.647722, 41.907722], [-87.647718, 41.907645], [-87.647866, 41.907643]];
const SITE = [[-87.648154, 41.909724], [-87.648095, 41.907538], [-87.648044, 41.907539], [-87.648042, 41.907473], [-87.646121, 41.907506],
  [-87.646125, 41.907564], [-87.645998, 41.907569], [-87.6459, 41.90762], [-87.645634, 41.907991], [-87.645636, 41.908023],
  [-87.645658, 41.908046], [-87.648046, 41.909732]];

// ---- heights (2022 LiDAR, above the street), meters ----
const H = { tower: 66.0, penthouse: 72.0, main: 24.0, garage: 21.6, podiumN: 16.6, podiumS: 15.6, north: 12.4 };
const FLOOR = (H.tower - H.podiumN) / 16;                       // 3.09

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}

// The ground the model stands on, as closed rings of local meters [x0, z0, x1, z1, ..., x0, z0], for clearing
// OpenStreetMap's buildings (and keeping trees off): the whole NewCity block, OSM's landuse way 325764479.
export function newCitySite(origin = FILM_ORIGIN) {
  const L = local(origin), r = SITE.flatMap(([lon, lat]) => L(lon, lat));
  return [[...r, r[0], r[1]]];
}

// the tower's outline in local meters, its two chamfers drawn as curves (a quadratic through a point `bulge` of the way
// from the chamfer's middle to the square corner it cuts off)
function towerRing(L, bulge = 0.5, steps = 10) {
  const P = (q) => L(...q), out = [];
  const curve = (a, b, corner) => {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], c = [m[0] + (corner[0] - m[0]) * bulge * 2, m[1] + (corner[1] - m[1]) * bulge * 2];
    for (let i = 1; i < steps; i++) {
      const t = i / steps, u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
  };
  const n0 = P(TOWER.n0), n1 = P(TOWER.n1), e1 = P(TOWER.e1), se0 = P(TOWER.se0), se1 = P(TOWER.se1), sw = P(TOWER.sw), nw0 = P(TOWER.nw0);
  out.push(n0, n1, e1, se0);
  curve(se0, se1, [se0[0], se1[1]]);                             // (the corner: the east side's x, the south tip's z)
  out.push(se1, ...TOWER.s.map(P), sw, nw0);
  curve(nw0, n0, [nw0[0], n0[1]]);                               // (the west side's x, the north tip's z)
  return out;
}

export function buildNewCity({ THREE, origin = FILM_ORIGIN }) {
  const L0 = local(origin), [cx, cz] = L0(...NEW_CITY_CENTRE), g = new THREE.Group();
  g.name = "new-city";
  g.position.set(cx, 0, cz);
  const L = (lon, lat) => { const [x, z] = L0(lon, lat); return [x - cx, z - cz]; };
  const ring = (pts) => pts.map(([lon, lat]) => L(lon, lat));

  // ======== the geometry, collected a material at a time; each face turned to face `out` ========
  const B = {};
  const bin = (k) => B[k] || (B[k] = { p: [], n: [], t: [] });
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const tri = (k, a, b, c, ua, ub, uc, out) => {
    let n = unit(cross(sub(b, a), sub(c, a)));
    if (out && n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) { [b, c] = [c, b]; [ub, uc] = [uc, ub]; n = n.map((v) => -v); }
    const q = bin(k);
    for (const [p, u] of [[a, ua], [b, ub], [c, uc]]) { q.p.push(p[0], p[1], p[2]); q.n.push(n[0], n[1], n[2]); q.t.push(u[0], u[1]); }
  };
  const area = (r) => { let a = 0; for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
  // the walls of a ring from y0 to y1: u runs in meters / tw along the ring, v is (y - y0) / th (th = 0: 0..1 over the wall)
  const walls = (k, r, y0, y1, tw, th = 0, kOf = null) => {
    const s = Math.sign(area(r)); let u = 0;
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.05) continue;
      const dx = (b[0] - a[0]) / len, dz = (b[1] - a[1]) / len, out = [dz * s, 0, -dx * s];
      const v1 = th ? (y1 - y0) / th : 1, u0 = u / tw, u1 = (u + len) / tw;
      const kk = kOf ? kOf(i) : k;
      tri(kk, [a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [u0, 0], [u1, 0], [u1, v1], out);
      tri(kk, [a[0], y0, a[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], [u0, 0], [u1, v1], [u0, v1], out);
      u += len;
    }
  };
  // a flat roof over a ring at y, its texture `tile` meters
  const roof = (k, r, y, tile = 20) => {
    const tris = THREE.ShapeUtils.triangulateShape(r.map(([x, z]) => new THREE.Vector2(x, z)), []);
    const P = (i) => [r[i][0], y, r[i][1]], U = (i) => [r[i][0] / tile, -r[i][1] / tile];
    for (const [i, j, l] of tris) tri(k, P(i), P(j), P(l), U(i), U(j), U(l), [0, 1, 0]);
  };
  const prism = (kw, kr, r, y0, y1, tw, th, tile, kOf) => { walls(kw, r, y0, y1, tw, th, kOf); roof(kr, r, y1, tile); };

  // ======== the textures ========
  const canvas = (w, h, draw) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  // y in a canvas counts down from the top; these take meters up from the bottom of a wall `hm` tall drawn `h` px
  const band = (c, w, h, hm, y0, y1, color) => { c.fillStyle = color; c.fillRect(0, h * (1 - y1 / hm), w, h * (y1 - y0) / hm); };
  const glassFill = (c, x, y, w, h, top, bottom) => { const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); c.fillStyle = gr; c.fillRect(x, y, w, h); };
  // shopfronts: dark glass with mullions every 1.5 m, from 0 to top m, on a wall hm tall and tw wide
  const shopfront = (c, w, h, hm, tw, top) => {
    glassFill(c, 0, h * (1 - top / hm), w, h * top / hm, "#4a5866", "#2b333b");
    c.fillStyle = "#9aa3aa";
    for (let x = 0; x < tw; x += 1.5) c.fillRect(x / tw * w, h * (1 - top / hm), Math.max(2, w / tw * 0.12), h * top / hm);
    band(c, w, h, hm, top - 0.35, top, "#8f979d");
  };
  const ribbon = (c, w, h, hm, tw, y0, y1, step = 1.5) => {
    glassFill(c, 0, h * (1 - y1 / hm), w, h * (y1 - y0) / hm, "#6f8aa6", "#3f5266");
    c.fillStyle = "#c3c8cc";
    for (let x = 0; x < tw; x += step) c.fillRect(x / tw * w, h * (1 - y1 / hm), Math.max(2, w / tw * 0.1), h * (y1 - y0) / hm);
  };
  const seams = (c, w, h, hm, y0, y1, every, alpha = 0.07) => {
    c.fillStyle = `rgba(0,0,0,${alpha})`;
    for (let y = y0; y < y1; y += every) c.fillRect(0, h * (1 - y / hm), w, 1);
  };
  // the tower's glass, a tile 3 m wide and a floor tall: a white slab edge at the floor, blue glass, a mullion
  const towerTex = canvas(128, 132, (c, w, h) => {
    glassFill(c, 0, 0, w, h, "#8db3df", "#5f8cc2");
    c.fillStyle = "rgba(255,255,255,0.10)"; c.fillRect(0, 0, w, h * 0.35);
    c.fillStyle = "#e6ebee"; c.fillRect(0, h - h * 0.13, w, h * 0.13);
    c.fillStyle = "#cfd6dc"; c.fillRect(0, 0, 3, h); c.fillRect(w / 2, 0, 2, h - h * 0.13);
  });
  // the podium: shopfronts, silver ribbed panels, a ribbon window on the top floor (16.6 m tall, 6 m wide)
  const podiumTex = canvas(192, 512, (c, w, h) => {
    const hm = H.podiumN, tw = 6;
    c.fillStyle = "#cdd1d4"; c.fillRect(0, 0, w, h);
    seams(c, w, h, hm, 5, hm, 0.6, 0.06);
    ribbon(c, w, h, hm, tw, 11.4, 14.4);
    shopfront(c, w, h, hm, tw, 5.0);
    band(c, w, h, hm, hm - 0.6, hm, "#b9bec2");
  });
  // the north building: shopfronts and a ribbon window between white panels (12.4 m tall, 6 m wide)
  const northTex = canvas(192, 384, (c, w, h) => {
    const hm = H.north, tw = 6;
    c.fillStyle = "#dedfdc"; c.fillRect(0, 0, w, h);
    seams(c, w, h, hm, 5.4, hm, 1.2, 0.05);
    ribbon(c, w, h, hm, tw, 7.0, 10.4, 2);
    shopfront(c, w, h, hm, tw, 5.2);
    band(c, w, h, hm, hm - 0.5, hm, "#c8c9c6");
  });
  // the main block: shopfronts, a ribbon of second-floor glass, then the cinema's box of grey panels (24 m tall, 12 m wide)
  const mainTex = canvas(384, 768, (c, w, h) => {
    const hm = H.main, tw = 12, cols = ["#d6d9dc", "#cdd1d4", "#dcdee0", "#c6cacd"];
    let n = 0;
    for (let y = 10.6; y < hm; y += 2.7) for (let x = 0; x < tw; x += 3) {
      c.fillStyle = cols[(n++ * 7 + Math.floor(y)) % 4]; c.fillRect(x / tw * w, h * (1 - Math.min(hm, y + 2.7) / hm), w * 3 / tw, h * 2.7 / hm);
    }
    c.fillStyle = "rgba(0,0,0,0.12)";
    for (let x = 0; x < tw; x += 3) c.fillRect(x / tw * w, 0, 1, h * (1 - 10.6 / hm));
    band(c, w, h, hm, 5.6, 10.6, "#d9dbdc");
    ribbon(c, w, h, hm, tw, 6.6, 10.0, 1.5);
    shopfront(c, w, h, hm, tw, 5.6);
    band(c, w, h, hm, hm - 0.6, hm, "#a9aeb3");
  });
  // the main block's plaza side: a curtain wall, a grid of 1.5 m by a floor (4.5 m) (24 m tall, 6 m wide)
  const curtainTex = canvas(192, 768, (c, w, h) => {
    const hm = H.main, tw = 6;
    glassFill(c, 0, 0, w, h, "#7f9cba", "#3e5167");
    c.fillStyle = "#c9cfd4";
    for (let x = 0; x < tw; x += 1.5) c.fillRect(x / tw * w, 0, 2, h);
    for (let y = 0; y < hm; y += 4.5) c.fillRect(0, h * (1 - y / hm) - 3, w, 3);
    band(c, w, h, hm, hm - 0.8, hm, "#b4b9be");
  });
  // the garage: six decks of white spandrels over dark openings, columns every 8 m (one deck: 3.6 m tall, 8 m wide)
  const garageTex = canvas(256, 116, (c, w, h) => {
    c.fillStyle = "#2f3337"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#e3e3df"; c.fillRect(0, 0, w, h * 1.15 / 3.6);
    c.fillStyle = "#cfcfca"; c.fillRect(0, h * 1.15 / 3.6 - 2, w, 2); c.fillRect(0, 0, 16, h);
    c.fillStyle = "rgba(255,255,255,0.05)"; c.fillRect(16, h * 0.32, w - 16, h * 0.68);
  });
  // roofs
  const greenTex = canvas(512, 512, (c, w, h) => {            // the green roof, a 60 m tile: sedum, paths, a few patches
    c.fillStyle = "#7f9c5c"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${i % 2 ? "60,90,40" : "160,180,110"},0.18)`; c.fillRect((i * 97) % w, (i * 61) % h, 6, 6); }
    c.strokeStyle = "#c9c6b4"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(0, h * 0.3); c.lineTo(w, h * 0.55); c.moveTo(w * 0.35, 0); c.lineTo(w * 0.62, h); c.moveTo(0, h * 0.85); c.lineTo(w * 0.5, h * 0.7); c.stroke();
  });
  const membraneTex = canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#e4e4e0"; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(0,0,0,0.04)"; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 2, h);
  });
  const deckTex = canvas(256, 256, (c, w, h) => {              // the top deck, a 16 m tile: concrete, stall lines
    c.fillStyle = "#a6a7a3"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#e9e9e4";
    for (let x = 0; x < w; x += w / 6.4) { c.fillRect(x, h * 0.04, 2, h * 0.32); c.fillRect(x, h * 0.64, 2, h * 0.32); }
    c.fillStyle = "rgba(0,0,0,0.05)"; c.fillRect(0, h * 0.45, w, h * 0.1);
  });
  const courtTex = canvas(256, 128, (c, w, h) => {             // a court, its own tile (0..1)
    c.fillStyle = "#3f7d6a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#3a6b9a"; c.fillRect(w * 0.08, h * 0.12, w * 0.84, h * 0.76);
    c.strokeStyle = "#f2f2ee"; c.lineWidth = 2; c.strokeRect(w * 0.08, h * 0.12, w * 0.84, h * 0.76);
    c.beginPath(); c.moveTo(w / 2, h * 0.12); c.lineTo(w / 2, h * 0.88); c.moveTo(w * 0.08, h / 2); c.lineTo(w * 0.92, h / 2); c.stroke();
  });
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...o });
  const MAT = {
    tower: std({ map: towerTex, roughness: 0.35 }), podium: std({ map: podiumTex, roughness: 0.6 }), north: std({ map: northTex }),
    main: std({ map: mainTex, roughness: 0.6 }), curtain: std({ map: curtainTex, roughness: 0.35 }), garage: std({ map: garageTex }),
    green: std({ map: greenTex, roughness: 1 }), membrane: std({ map: membraneTex, roughness: 0.9 }), deck: std({ map: deckTex, roughness: 0.95 }),
    court: std({ map: courtTex, roughness: 0.9 }), pool: std({ color: 0x5fb3cf, roughness: 0.2 }), paving: std({ color: 0xc9c7c0, roughness: 0.95 }),
    plant: std({ color: 0x7c9a5e, roughness: 1 }), mech: std({ color: 0xc4c8cb, roughness: 0.7 }), slab: std({ color: 0xeef0f1, roughness: 0.6 }),
    rail: std({ color: 0x9fc0d8, roughness: 0.2, transparent: true, opacity: 0.45, depthWrite: false }),
  };

  // ======== the buildings ========
  const north = ring(NORTH), main = ring(MAIN), garage = ring(GARAGE), podN = ring(PODIUM_N), podS = ring(PODIUM_S);
  prism("north", "green", north, 0, H.north, 6, 0, 60);
  prism("main", "membrane", main, 0, H.main, 12, 0, 20, (i) => (i >= PLAZA_FROM ? "curtain" : "main"));
  prism("garage", "deck", garage, 0, H.garage, 8, 3.6, 16);
  prism("podium", "paving", podN, 0, H.podiumN, 6, 0, 10);
  prism("podium", "paving", podS, 0, H.podiumS, 6, 0, 10);
  // the courts on the garage's top deck, and the pool on the podium's south part, each laid just over its roof
  for (const c of COURTS) {
    const r = ring(c), y = H.garage + 0.03, U = [[0, 0], [1, 0], [1, 1], [0, 1]];
    tri("court", [r[0][0], y, r[0][1]], [r[1][0], y, r[1][1]], [r[2][0], y, r[2][1]], U[0], U[1], U[2], [0, 1, 0]);
    tri("court", [r[0][0], y, r[0][1]], [r[2][0], y, r[2][1]], [r[3][0], y, r[3][1]], U[0], U[2], U[3], [0, 1, 0]);
  }
  roof("pool", ring(POOL), H.podiumS + 0.04, 10);
  // the tower: from the lower podium's roof to its own, then its parapet top and the penthouse
  const tw = towerRing(L);
  walls("tower", tw, H.podiumS, H.tower, 3, FLOOR);
  roof("membrane", tw, H.tower, 20);
  prism("mech", "membrane", ring(PENTHOUSE), H.tower, H.penthouse, 6, 0, 20);

  // balconies: stacks on the long east and west faces, a white slab and a glass rail at each of the 16 floors
  const balc = [];
  const face = (a, b, outSign, stacks) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / len, dz = (b[1] - a[1]) / len;
    const nx = dz * outSign, nz = -dx * outSign;
    for (const f of stacks) for (let k = 1; k <= 16; k++) {
      const s = f * len, y = H.podiumN + k * FLOOR - 0.05;
      balc.push({ x: a[0] + dx * s + nx * 0.9, z: a[1] + dz * s + nz * 0.9, y, rot: Math.atan2(-dz, dx), nx, nz });
    }
  };
  const sA = Math.sign(area(tw));
  const E0 = L(...TOWER.n1), E1 = L(...TOWER.se0), W0 = L(...TOWER.sw), W1 = L(...TOWER.nw0);
  face(E0, E1, sA, [0.12, 0.3, 0.48, 0.66, 0.84]);
  face(W0, W1, sA, [0.12, 0.3, 0.48, 0.66, 0.84]);
  const slabGeo = new THREE.BoxGeometry(4.2, 0.22, 1.8), railGeo = new THREE.BoxGeometry(4.2, 1.05, 0.04);
  const slabs = new THREE.InstancedMesh(slabGeo, MAT.slab, balc.length), rails = new THREE.InstancedMesh(railGeo, MAT.rail, balc.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  balc.forEach((b, i) => {
    q.setFromEuler(e.set(0, b.rot, 0));
    slabs.setMatrixAt(i, m4.compose(new THREE.Vector3(b.x, b.y, b.z), q, one));
    rails.setMatrixAt(i, m4.compose(new THREE.Vector3(b.x + b.nx * 0.88, b.y + 0.62, b.z + b.nz * 0.88), q, one));
  });
  slabs.name = "new-city-balconies"; rails.name = "new-city-rails";
  g.add(slabs, rails);

  // ======== the meshes ========
  for (const k of Object.keys(B)) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(B[k].p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(B[k].n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(B[k].t, 2));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, MAT[k]);
    mesh.name = "new-city-" + k;
    g.add(mesh);
  }
  return g;
}
