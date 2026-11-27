// 410 N Elizabeth St (filed as 400 N Elizabeth), Fulton Market: the first of the two apartment towers of Residential-Business
// Planned Development 1528, the one on the corner of Kinzie St and Elizabeth St, drawn UNDER CONSTRUCTION, with its tower
// crane. Developers Tree Street Group (formerly Weldon Development Group) and Mark Goodman & Associates, with Magellan
// Development Group; architect Archeo Design Studio; general contractor Clark Construction, concrete Adjustable Forms. 33
// stories, 383 apartments (77 affordable), 150 parking spaces in a five-level podium, all-electric with geothermal wells; the
// PD amendment passed the Plan Commission on May 16, 2024 and the City Council on May 22, 2024; ground broken July 28, 2026.
// The second (west) tower, 341 apartments in Subarea B, is not drawn: its half of the site is the contractor's yard. For the
// cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js and willis-tower.js.
//
// What it draws (the state Steven asked for: "floors up to level 7, with windows on levels 1-4"):
//   - Levels 1 to 4 finished outside, in the PD's design: the glass storefront of level 1 (charcoal metal panels and the
//     garage and loading doors on the north face); levels 2 to 4, the bottom of the parking podium, behind the screen of
//     champagne fins perforated in a tree-branch pattern (south, the east face's southern 25 m, the west face's southern
//     9 m) or behind champagne-fritted glass between charcoal fins (north, and the rest of east and west), all in the
//     projecting charcoal frame (verticals at the bays, bands at level 2 and at the screen's mid-height).
//   - Levels 5 to 7 bare: the concrete slabs of levels 5, 6 and 7 (the podium's notched plate, the tower's full plate at 7),
//     the 14 columns between them, level 7's columns standing on the top deck ready for level 8, reshoring under the newest
//     slab, and a guardrail with netting at every open edge. The concrete core rises to level 8 with its blue climbing
//     formwork above that (to 28.2 m).
//   - The tower crane, a red hammerhead with a tower head (Potain style, as in the photographs), on the south side by the
//     corner: lattice mast in a plywood box at its foot, slewing unit and cab, a 60 m jib and 19 m counter-jib with its
//     counterweights, tie bars, a trolley and hook carrying a concrete bucket over the deck. A material hoist on the west
//     face. The site: graded dirt with containers, a trailer and a dumpster, inside Jersey barriers topped by black screened
//     fence round OpenStreetMap's construction area.
//
// Where the numbers come from:
//   - Plan, heights and design: the PD's exhibits (Archeo Design Studio, November 17, 2023, as published in the City
//     Council's Journal of May 22, 2024, pages 12179-12197, in the City's PD 1528 file, gisapps.chicago.gov), and the
//     Plan Commission deck's slides as Urbanize Chicago published them (May 2024). The elevations: ground floor 15'-7",
//     top of the parking podium 71'-1", the amenities deck 333'-3", the main roof 348'-5" (106.2 m; CTBUH lists 114 m /
//     374 ft, unexplained; the PD allows 380 ft). The subarea map: Subarea A (the east parcel) 166.00' along the south
//     (vacated Kinzie) line, 206.20' along Elizabeth, 98.55' then 70.25' along the Union Pacific line. The typical
//     parking plan and the level 8 plan (scaled from the subarea map): the plate 113 x 126 ft, its south corners notched
//     12 x 6.3 ft at the podium, 6.5 ft west of the Elizabeth St line and 21.7 ft south of the north line; the column grid
//     (perimeter columns about 10.9 ft in from the slab edge) and the core (29.6 x 45.5 ft). Each face's facade zones, the
//     bays and the screen's mid-height line: the four elevations of the east building (exhibits 07, 09, 11, 13), the base
//     detail (exhibit 17) and the rendering of the base at Kinzie and Elizabeth (Urbanize's slide 4).
//   - Floors: the ground floor 4.75 m; levels 2 to 6 parking, 3.383 m each (the podium's 55'-6" over five levels; 150
//     spaces at about 30 a level); level 7 at 71'-1"; levels 7 to 32 residential at 10'-1" (3.073 m), level 33 the
//     amenity floor at 333'-3". The foundation permit covers the superstructure "through level 7" (Urbanize, June 25,
//     2026).
//   - Site: OpenStreetMap way 1308334948 (landuse=construction, "400 N Elizabeth"), November 2026, through the Chicago
//     Cityscape CLI; the PD's north-east corner put on its north-east corner and the plate squared to Elizabeth St's
//     centre line (way 24082322; the grid turns 1.0 degree), which puts the PD's south line 2.5 m south of Kinzie St's
//     centre line, as its "south line of vacated West Kinzie Street" should be. No building of city-wide.js or
//     city-corridor.js stands on the site (the nearest are across Elizabeth St and north of the tracks).
//   - Crane and site: Chicago YIMBY's construction photographs by Daniel Schell (July 30, October 21 and November 10, 2026):
//     a red hammerhead with a tower head (Clark banner on the counter-jib), its mast against the south slab edge toward
//     Elizabeth St (seen from Elizabeth St, from the Kinzie corner, from the yard and from a UP-W train), the core's blue
//     climbing forms, the guardrails, the reshoring, the Jersey-barrier fence with black screen, the yard's containers.
//     Permits: the crane February 19, 2026 (a "Phase 2" permit to tie it in and climb it was approved October 23, 2026),
//     a construction hoist September 2, 2026.
//   Assumed: the crane's height, the jib at 126.2 m, 20 m over the final roof, as asked (a real crane at this stage stands
//   free at perhaps 50-60 m and is climbed and tied in as the tower rises; pass jibHeight); its jib (60 m) and counter-jib
//   (19 m), the mast's place along the south face (9.5 m in from the east face, 1.2 m off the slab edge, from the
//   photographs' angles), its slew (the jib to 290 degrees, west-north-west; pass jibBearing), the trolley and hook; the
//   hoist's place (the west face, toward the yard); the slab thickness (0.23 m), the column size (0.6 x 0.9 m), the core's
//   lead (to level 8, forms to 28.2 m); how far up levels 2 to 4 the screen is hung (to level 5's slab, though the
//   screen's second tier runs on to 71'-1"); the pattern of the perforations and of the frit; the containers.
//   Reference images: refs/elizabeth-410/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildElizabeth410, elizabeth410Site } from "./elizabeth-410.js";
//   scene.add(buildElizabeth410({ THREE }));          // or { THREE, jibHeight: 60, jibBearing: 200 }
//
// Coordinates are local metres, x east, z south, y up (0 at grade), from `origin` ([lon, lat]; by default the film's,
// Roosevelt Rd at the lakefront). Pass { origin: ELIZABETH_410_CENTRE } to have the tower round (0, 0, 0). It needs a
// browser (or another DOM with <canvas>): the facades are painted on canvas textures.
export const ELIZABETH_410_CENTRE = [-87.659319, 41.88923];        // the centre of the tower's plate
const FILM_ORIGIN = [-87.620063, 41.863968];
const TURN = 0.0173;                                                // the plate's turn from true north (rad), clockwise from above
// OpenStreetMap way 1308334948, landuse=construction "400 N Elizabeth" (the closing node left off)
const SITE = [[-87.6601859, 41.8892924], [-87.6603965, 41.8889857], [-87.6603533, 41.888964], [-87.6590752, 41.8889794],
  [-87.6590923, 41.8894649], [-87.6591062, 41.8894646], [-87.6594308, 41.8894576], [-87.659446, 41.8894573]];

// Floor levels (top of slab, m above grade), by level number: the ground floor 15'-7", five parking levels to 71'-1",
// then 10'-1" a floor
const LV = [0, 0, 4.75, 8.133, 11.516, 14.899, 18.282, 21.666, 24.739];
const SLAB = 0.23;
// The tower's frame: u east, v south, metres from the plate's centre (turned TURN with the street grid)
const W2 = 17.25, D2 = 19.185;                                      // half the plate: 113.2 x 125.9 ft
const NOTCH_U = 13.59, NOTCH_V = 17.265;                            // the podium's south corners, notched 12 x 6.3 ft
const PODIUM = [[-W2, -D2], [W2, -D2], [W2, NOTCH_V], [NOTCH_U, NOTCH_V], [NOTCH_U, D2], [-NOTCH_U, D2], [-NOTCH_U, NOTCH_V], [-W2, NOTCH_V]];
const PLATE = [[-W2, -D2], [W2, -D2], [W2, D2], [-W2, D2]];
// the columns (the parking plan's grid; the middle rows have only their perimeter columns)
const CU = [-13.93, -5.15, 4.63, 13.81], CV = [-15.86, -10.59, -1.87, 6.91, 15.62];
const COLUMNS = [];
for (const v of CV) for (const u of CU) if (v === CV[0] || v === CV[4] || u === CU[0] || u === CU[3]) COLUMNS.push([u, v]);
const CORE = [-4.51, 4.51, -6.96, 6.91];                            // u0, u1, v0, v1
// The crane: the mast's centre (frame), and its defaults
const MAST = [W2 - 9.5, D2 + 2.2], MAST_W = 2.0;
const FINAL_ROOF = 106.2;                                           // 348'-5"
const JIB_LEN = 60, CJ_LEN = 19;

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The site (OpenStreetMap's construction area) as a closed ring of local metres [x, z, x, z, ...], for clearing the city
export function elizabeth410Site(origin = FILM_ORIGIN) {
  const L = local(origin), r = SITE.flatMap(([lon, lat]) => L(lon, lat));
  return [[...r, r[0], r[1]]];
}

export function buildElizabeth410({ THREE, origin = FILM_ORIGIN, jibHeight = FINAL_ROOF + 20, jibBearing = 290 }) {
  const L = local(origin), [cx, cz] = L(...ELIZABETH_410_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)

  // ---- geometry, gathered per material and merged: points are [u, y, v] in the current frame (the tower's, turned
  //      TURN, or the site's, unturned); each face is turned so its normal points along `hint` ----
  let rot = TURN;
  const T = ([u, y, v]) => { const c = Math.cos(rot), s = Math.sin(rot); return [u * c + v * s, y, -u * s + v * c]; };
  const BUF = {};
  const tri = (k, a, b, c, ta, tb, tc, hint) => {
    const A = T(a); let B = T(b), C = T(c);
    const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const H = T(hint);
    if (n[0] * H[0] + n[1] * H[1] + n[2] * H[2] < 0) { [B, C] = [C, B]; [tb, tc] = [tc, tb]; n = n.map((x) => -x); }
    const l = Math.hypot(...n) || 1; n = n.map((x) => x / l);
    const o = BUF[k] || (BUF[k] = { p: [], n: [], t: [] });
    for (const [P, t] of [[A, ta], [B, tb], [C, tc]]) { o.p.push(...P); o.n.push(...n); o.t.push(...t); }
  };
  const quad = (k, a, b, c, d, ta, tb, tc, td, hint) => { tri(k, a, b, c, ta, tb, tc, hint); tri(k, a, c, d, ta, tc, td, hint); };
  // a wall over edge p -> q ([u, v]) facing n, from y0 to y1; u runs s0 -> s1 along it, v = (y - vy) / tileH
  const wall = (k, p, q, n, y0, y1, s0, s1, vy, tileH) => quad(k, [p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]],
    [s0, (y0 - vy) / tileH], [s1, (y0 - vy) / tileH], [s1, (y1 - vy) / tileH], [s0, (y1 - vy) / tileH], [n[0], 0, n[1]]);
  // a box: centre (cu, cv), from y0 to y1, `lf` long along unit vector f = [fu, fv] and `lr` across it; uv in metres / tile
  const obox = (k, cu, cv, y0, y1, lf, lr, f = [1, 0], tile = 1, bottom = false) => {
    const r = [-f[1], f[0]], P = (a, b) => [cu + f[0] * a * lf / 2 + r[0] * b * lr / 2, cv + f[1] * a * lf / 2 + r[1] * b * lr / 2];
    const c = [P(-1, -1), P(1, -1), P(1, 1), P(-1, 1)], h = (y1 - y0) / tile;
    const side = (i, j, len, n) => quad(k, [c[i][0], y0, c[i][1]], [c[j][0], y0, c[j][1]], [c[j][0], y1, c[j][1]], [c[i][0], y1, c[i][1]],
      [0, 0], [len / tile, 0], [len / tile, h], [0, h], n);
    side(0, 1, lf, [-r[0], 0, -r[1]]); side(1, 2, lr, [f[0], 0, f[1]]); side(2, 3, lf, [r[0], 0, r[1]]); side(3, 0, lr, [-f[0], 0, -f[1]]);
    const cap = (y, up) => quad(k, [c[0][0], y, c[0][1]], [c[1][0], y, c[1][1]], [c[2][0], y, c[2][1]], [c[3][0], y, c[3][1]],
      [0, 0], [lf / tile, 0], [lf / tile, lr / tile], [0, lr / tile], [0, up, 0]);
    cap(y1, 1); if (bottom) cap(y0, -1);
  };
  const abox = (k, u0, u1, y0, y1, v0, v1, tile, bottom) => obox(k, (u0 + u1) / 2, (v0 + v1) / 2, y0, y1, u1 - u0, v1 - v0, [1, 0], tile, bottom);
  // a beam between points a and b ([u, y, v]), w x h in section
  const beam = (k, a, b, w, h = w) => {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d), D = d.map((x) => x / len);
    const up = Math.abs(D[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    let s = [D[1] * up[2] - D[2] * up[1], D[2] * up[0] - D[0] * up[2], D[0] * up[1] - D[1] * up[0]];
    const sl = Math.hypot(...s); s = s.map((x) => x / sl);
    const t = [s[1] * D[2] - s[2] * D[1], s[2] * D[0] - s[0] * D[2], s[0] * D[1] - s[1] * D[0]];
    const C = (p, i, j) => [p[0] + s[0] * i * w / 2 + t[0] * j * h / 2, p[1] + s[1] * i * w / 2 + t[1] * j * h / 2, p[2] + s[2] * i * w / 2 + t[2] * j * h / 2];
    const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1]], sd = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (let i = 0; i < 4; i++) {
      const [i0, j0] = ring[i], [i1, j1] = ring[(i + 1) % 4], n = [s[0] * sd[i][0] + t[0] * sd[i][1], s[1] * sd[i][0] + t[1] * sd[i][1], s[2] * sd[i][0] + t[2] * sd[i][1]];
      quad(k, C(a, i0, j0), C(a, i1, j1), C(b, i1, j1), C(b, i0, j0), [0, 0], [1, 0], [1, len], [0, len], n);
    }
    for (const [p, sg] of [[a, -1], [b, 1]]) quad(k, C(p, -1, -1), C(p, 1, -1), C(p, 1, 1), C(p, -1, 1), [0, 0], [1, 0], [1, 1], [0, 1], D.map((x) => x * sg));
  };
  // a flat polygon ([u, v] points) at height y, facing up or down; uv in metres / tile
  const flat = (k, pts, y, up, tile = 1) => {
    const idx = THREE.ShapeUtils.triangulateShape(pts.map(([u, v]) => new THREE.Vector2(u, v)), []);
    for (const [a, b, c] of idx) tri(k, [pts[a][0], y, pts[a][1]], [pts[b][0], y, pts[b][1]], [pts[c][0], y, pts[c][1]],
      [pts[a][0] / tile, pts[a][1] / tile], [pts[b][0] / tile, pts[b][1] / tile], [pts[c][0] / tile, pts[c][1] / tile], [0, up, 0]);
  };
  // a ring's edges with their outward normals (any winding)
  const edges = (pts) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length], du = q[0] - p[0], dv = q[1] - p[1], l = Math.hypot(du, dv), sg = a > 0 ? 1 : -1;
      return { p, q, len: l, f: [du / l, dv / l], n: [sg * dv / l, -sg * du / l] };
    });
  };
  // the ring moved `d` inward (right-angled corners)
  const inset = (pts, d) => {
    const E = edges(pts);
    return pts.map((p, i) => { const a = E[(i + E.length - 1) % E.length].n, b = E[i].n; return [p[0] - d * (a[0] + b[0]), p[1] - d * (a[1] + b[1])]; });
  };
  const slab = (k, pts, top, th = SLAB) => {
    flat(k, pts, top, 1, 4); flat(k, pts, top - th, -1, 4);
    for (const e of edges(pts)) wall(k, e.p, e.q, e.n, top - th, top, 0, e.len / 4, 0, 4);
  };
  // a band of a flat texture standing on a ring (rails, netting, shores, fences): u in metres / tileW
  const band = (k, pts, y0, y1, tileW, closed = true) => {
    const E = edges(pts); let s = 0;
    for (let i = 0; i < (closed ? E.length : E.length - 1); i++) { const e = E[i]; wall(k, e.p, e.q, e.n, y0, y1, s / tileW, (s + e.len) / tileW, y0, y1 - y0); s += e.len; }
  };

  // ---- the textures, each painted once on a canvas ----
  const canvas = (w, h, draw) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  const CHAR = "#323538";                                             // the charcoal of the frame, fins and slab covers
  // level 1's glass: a tile 6 m wide, 4.55 m tall: four 1.5 m panes in charcoal mullions, a transom, the shop's lights
  const storeTex = canvas(256, 256, (c) => {
    for (let k = 0; k < 4; k++) {
      const x = k * 64, gr = c.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, "#8b9fae"); gr.addColorStop(0.3, "#3e4c57"); gr.addColorStop(1, "#28323a");
      c.fillStyle = gr; c.fillRect(x, 0, 64, 256);
      c.fillStyle = "rgba(222,178,118,0.28)"; c.fillRect(x + 6 + rnd() * 20, 120 + rnd() * 40, 20 + rnd() * 24, 60 + rnd() * 50);
      c.fillStyle = "rgba(240,220,180,0.35)"; c.fillRect(x + 10 + rnd() * 30, 86, 10, 4);
    }
    c.fillStyle = CHAR; for (let k = 0; k < 4; k++) c.fillRect(k * 64, 0, 4, 256);
    c.fillRect(0, 70, 256, 4); c.fillRect(0, 248, 256, 8);
  });
  // levels 2-4, the screen: champagne fins (one tile 13.4 m wide, the screen's tier 8.435 m tall), perforated so a pattern of
  // branches shows light through them (the pattern wraps round the tile's sides)
  const meshTex = canvas(512, 512, (c) => {
    const mc = document.createElement("canvas"); mc.width = mc.height = 512;
    const m = mc.getContext("2d"); m.strokeStyle = "#fff"; m.lineCap = "round";
    const branch = (x, y, a, len, w, depth) => {
      const x1 = x + Math.cos(a) * len, y1 = y - Math.sin(a) * len, bx = x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * len * 0.3;
      for (const o of [-512, 0, 512]) { m.lineWidth = w; m.beginPath(); m.moveTo(x + o, y); m.quadraticCurveTo(bx + o, (y + y1) / 2, x1 + o, y1); m.stroke(); }
      if (depth > 0) for (const da of [0.35 + rnd() * 0.35, -0.35 - rnd() * 0.35]) branch(x1, y1, a + da, len * (0.62 + rnd() * 0.18), w * 0.68, depth - 1);
    };
    for (const x0 of [40, 150, 290, 410]) branch(x0 + rnd() * 50, 530, Math.PI / 2 + (rnd() - 0.5) * 0.6, 130 + rnd() * 50, 20 + rnd() * 6, 5);
    const mask = m.getImageData(0, 0, 512, 512).data;
    c.fillStyle = "#4b3d2d"; c.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 64; k++) {
      const t = rnd() * 14, gr = c.createLinearGradient(k * 8, 0, k * 8 + 6, 0);
      gr.addColorStop(0, `rgb(${207 - t},${174 - t},${125 - t})`); gr.addColorStop(1, `rgb(${156 - t},${124 - t},${82 - t})`);
      c.fillStyle = gr; c.fillRect(k * 8, 0, 6, 512);
      // the perforations: broken dashes along the branches, a few strays
      for (let r = 0; r < 128; r++) {
        const on = mask[((r * 4 + 2) * 512 + k * 8 + 3) * 4] > 128 ? rnd() < 0.85 : rnd() < 0.02;
        if (on) { c.fillStyle = rnd() < 0.6 ? "#ece6d8" : "#d9cfba"; c.fillRect(k * 8, r * 4, 6, 3 + Math.floor(rnd() * 3)); }
      }
    }
  });
  // levels 2-4, the fritted glass: one tile 6 m wide, one parking floor (3.383 m) tall: 0.75 m panes, light (fritted) or
  // dark, between charcoal fins, and the floor's charcoal slab cover
  const fritTex = canvas(256, 256, (c) => {
    const lit = [1, 0, 1, 1, 0, 1, 0, 0];
    for (let k = 0; k < 8; k++) {
      const gr = c.createLinearGradient(0, 0, 0, 230);
      if (lit[k]) { gr.addColorStop(0, "#c3ccd1"); gr.addColorStop(1, "#97a5ad"); } else { gr.addColorStop(0, "#7f909c"); gr.addColorStop(0.35, "#465560"); gr.addColorStop(1, "#38444d"); }
      c.fillStyle = gr; c.fillRect(k * 32, 0, 32, 256);
      if (lit[k]) { c.fillStyle = "rgba(235,232,222,0.5)"; for (let y = 2; y < 230; y += 5) for (let x = 2; x < 30; x += 5) c.fillRect(k * 32 + x, y, 2, 2); }
    }
    c.fillStyle = CHAR; for (let k = 0; k < 8; k++) c.fillRect(k * 32, 0, 4, 256);
    c.fillRect(0, 232, 256, 24);
  });
  // level 1's north face, once across its 34.5 m: charcoal panels, the garage door and the loading door near its west end,
  // and fritted glass at its east end
  const northTex = canvas(512, 128, (c) => {
    const px = 512 / 34.5;
    c.fillStyle = "#3a3d40"; c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#2c2f31"; for (let x = 0; x < 512; x += 1.2 * px) c.fillRect(x, 0, 1.5, 128);
    const door = (s, w, h) => {
      c.fillStyle = "#55595c"; c.fillRect((s - w / 2) * px, 128 - h / 4.55 * 128, w * px, h / 4.55 * 128);
      c.fillStyle = "#44484b"; for (let y = 128 - h / 4.55 * 128; y < 128; y += 5) c.fillRect((s - w / 2) * px, y, w * px, 1.5);
    };
    door(7.6, 6.4, 3.9); door(16.2, 4.6, 4.3);
    for (let s = 24; s < 34.2; s += 0.75) { c.fillStyle = (Math.floor(s * 4) % 3) ? "#a8b4bb" : "#4a5862"; c.fillRect(s * px, 6, 0.75 * px, 116); }
    c.fillStyle = CHAR; for (let s = 24; s < 34.4; s += 1.5) c.fillRect(s * px, 0, 3, 128);
    c.fillRect(0, 0, 512, 6);
  });
  // concrete: a 4 m tile
  const concTex = canvas(128, 128, (c) => {
    c.fillStyle = "#bdbab2"; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 900; i++) { const v = 150 + rnd() * 60; c.fillStyle = `rgba(${v},${v - 2},${v - 8},0.35)`; c.fillRect(rnd() * 128, rnd() * 128, 2, 2); }
    for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(120,115,105,0.08)"; c.fillRect(rnd() * 128, rnd() * 128, 30 + rnd() * 40, 20 + rnd() * 30); }
  });
  // the core: concrete with the forms' joints and tie holes, a tile 4.8 x 3.6 m
  const coreTex = canvas(256, 256, (c) => {
    c.fillStyle = "#b5b2aa"; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) { const v = 150 + rnd() * 60; c.fillStyle = `rgba(${v},${v},${v - 6},0.3)`; c.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    c.fillStyle = "rgba(80,80,76,0.45)"; for (let x = 0; x < 256; x += 64) c.fillRect(x, 0, 1.5, 256);
    for (let y = 0; y < 256; y += 85.3) c.fillRect(0, y, 256, 1.5);
    c.fillStyle = "rgba(60,60,58,0.6)"; for (let x = 16; x < 256; x += 32) for (let y = 21; y < 256; y += 42.7) c.fillRect(x, y, 2.5, 2.5);
  });
  // the core's climbing forms: blue panels on orange walers and soldiers, a tile 4 x 4.2 m
  const jumpTex = canvas(256, 256, (c) => {
    c.fillStyle = "#2b5aa6"; c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#3a6cba"; for (let x = 0; x < 256; x += 16) c.fillRect(x, 0, 6, 256);
    c.fillStyle = "#d9772a"; for (let x = 0; x < 256; x += 64) c.fillRect(x, 0, 7, 256);
    for (const y of [0, 92, 184]) c.fillRect(0, y, 256, 9);
    c.fillStyle = "#c9a46a"; c.fillRect(0, 0, 256, 6);
  });
  // a guardrail with netting: a tile 4 m long, 1.1 m tall; posts every 2 m (transparent between)
  const railTex = canvas(256, 64, (c) => {
    c.clearRect(0, 0, 256, 64);
    c.fillStyle = "rgba(25,25,25,0.38)"; c.fillRect(0, 4, 256, 50);
    c.strokeStyle = "rgba(15,15,15,0.55)"; c.lineWidth = 1;
    for (let x = 0; x < 256; x += 6) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 54); c.stroke(); }
    c.fillStyle = "#e3a21f"; c.fillRect(0, 0, 256, 5); c.fillRect(0, 28, 256, 4);
    for (const x of [0, 128]) c.fillRect(x, 0, 6, 64);
    c.fillStyle = "#c69f66"; c.fillRect(0, 52, 256, 12);
  });
  // reshores under the newest slab: blue frames with cross braces, aluminium joists under the slab; a tile 4 m long
  const shoreTex = canvas(256, 128, (c) => {
    c.clearRect(0, 0, 256, 128);
    c.strokeStyle = "#2f5fae"; c.lineWidth = 4;
    for (let x = 4; x < 256; x += 64) {
      c.beginPath(); c.moveTo(x, 10); c.lineTo(x, 128); c.moveTo(x + 32, 10); c.lineTo(x + 32, 128); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(x, 20); c.lineTo(x + 32, 120); c.moveTo(x + 32, 20); c.lineTo(x, 120); c.stroke(); c.lineWidth = 4;
    }
    c.fillStyle = "#8d5a32"; c.fillRect(0, 0, 256, 8);
  });
  // lattice: the bracing between a lattice's chords (the chords are beams), white so each material colours it; one panel
  const latTex = canvas(64, 64, (c) => {
    c.clearRect(0, 0, 64, 64); c.fillStyle = "#fff"; c.fillRect(0, 0, 64, 5); c.fillRect(0, 59, 64, 5);
    c.strokeStyle = "#fff"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 64); c.lineTo(64, 0); c.stroke();
  });
  // the crane's cab: white with its windows
  const cabTex = canvas(128, 128, (c) => {
    c.fillStyle = "#e7e9e8"; c.fillRect(0, 0, 128, 128);
    const gr = c.createLinearGradient(0, 14, 0, 84); gr.addColorStop(0, "#7d93a3"); gr.addColorStop(1, "#253139");
    c.fillStyle = gr; c.fillRect(12, 14, 104, 70);
    c.fillStyle = "#c8cbca"; c.fillRect(0, 118, 128, 10);
  });
  // the fence: black screen on the chain link, a site banner every 10 m (blank)
  const fenceTex = canvas(256, 64, (c) => {
    c.fillStyle = "#1d1f20"; c.fillRect(0, 0, 256, 64);
    c.fillStyle = "rgba(255,255,255,0.05)"; for (let x = 0; x < 256; x += 4) c.fillRect(x, 0, 1, 64);
    c.fillStyle = "#1f2d4d"; c.fillRect(150, 10, 90, 44); c.fillStyle = "#e9ecef"; c.fillRect(162, 24, 66, 16);
    c.fillStyle = "#7a7c7c"; c.fillRect(0, 0, 256, 3);
  });
  // ribbed steel (containers), white so each material colours it
  const ribTex = canvas(64, 64, (c) => {
    for (let x = 0; x < 64; x += 8) { c.fillStyle = "#f2f2f2"; c.fillRect(x, 0, 5, 64); c.fillStyle = "#c4c4c4"; c.fillRect(x + 5, 0, 3, 64); }
  });

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const MATS = {
    store: std({ map: storeTex, roughness: 0.25, metalness: 0.3 }),
    mesh: std({ map: meshTex, roughness: 0.6, metalness: 0.25 }),
    frit: std({ map: fritTex, roughness: 0.3, metalness: 0.2 }),
    north: std({ map: northTex, roughness: 0.55, metalness: 0.3 }),
    frame: std({ color: 0x35383b, roughness: 0.5, metalness: 0.4 }),
    conc: std({ map: concTex, roughness: 0.95 }),
    core: std({ map: coreTex, roughness: 0.95 }),
    jump: std({ map: jumpTex, roughness: 0.7 }),
    ply: std({ color: 0xc9a46a, roughness: 0.9 }),
    rail: std({ map: railTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.8 }),
    shore: std({ map: shoreTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.6 }),
    latRed: std({ map: latTex, color: 0xc41f29, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.2 }),
    red: std({ color: 0xc41f29, roughness: 0.55, metalness: 0.2 }),
    latGrey: std({ map: latTex, color: 0x9ba0a4, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 }),
    grey: std({ color: 0x8e9396, roughness: 0.6, metalness: 0.3 }),
    cab: std({ map: cabTex, roughness: 0.4 }),
    weight: std({ map: concTex, color: 0xb8b8b8, roughness: 0.95 }),
    yellow: std({ color: 0xe5b01e, roughness: 0.5 }),
    rope: std({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.4 }),
    banner: std({ color: 0xf1f1ed, roughness: 0.8, side: THREE.DoubleSide }),
    fence: std({ map: fenceTex, roughness: 0.9, side: THREE.DoubleSide }),
    barrier: std({ color: 0xd8d7d0, roughness: 0.95 }),
    dirt: std({ color: 0x8e8170, roughness: 1 }),
    contRed: std({ map: ribTex, color: 0x93402f, roughness: 0.7 }),
    contBlue: std({ map: ribTex, color: 0x305f92, roughness: 0.7 }),
    contWhite: std({ map: ribTex, color: 0xe6e6e1, roughness: 0.7 }),
  };

  // ======== the tower (its own frame) ========
  rot = TURN;
  const TOP4 = LV[5] - SLAB;                                          // the finished facade stops under level 5's slab
  const BAND0 = 4.55, TIER = [4.775, 13.21];                          // level 2's band; the screen's tiers
  const PE = edges(PODIUM);                                           // N, E, notch S, notch E, S, notch W, notch S, W
  // each face's zones above level 1: [from, to (m along the edge), texture]
  const ZONES = [[[0, 34.5, "frit"]], [[0, 11, "frit"], [11, 36.45, "mesh"]], [[0, 3.66, "mesh"]], [[0, 1.92, "mesh"]],
    [[0, 27.18, "mesh"]], [[0, 1.92, "mesh"]], [[0, 3.66, "mesh"]], [[0, 9.2, "mesh"], [9.2, 36.45, "frit"]]];
  // the frame's verticals (m along each edge)
  const BAYS = [[0, 6.9, 13.8, 20.7, 27.6, 34.5], [0, 5.5, 11, 17.36, 23.73, 30.09, 36.45], [3.66], [], [0, 6.795, 13.59, 20.385, 27.18],
    [], [0], [0, 4.6, 9.2, 16.01, 22.83, 29.64, 36.45]];
  PE.forEach((e, i) => {
    const at = (s) => [e.p[0] + e.f[0] * s, e.p[1] + e.f[1] * s];
    // level 1: the north face's panels and doors, the shop glass elsewhere
    if (i === 0) wall("north", e.p, e.q, e.n, 0, BAND0, 0, 1, 0, BAND0);
    else wall("store", e.p, e.q, e.n, 0, BAND0, 0, e.len / 6, 0, BAND0);
    // levels 2-4
    for (const [s0, s1, k] of ZONES[i]) {
      if (k === "mesh") wall("mesh", at(s0), at(s1), e.n, BAND0, TOP4, s0 / 13.4, s1 / 13.4, TIER[0], TIER[1] - TIER[0]);
      else wall("frit", at(s0), at(s1), e.n, BAND0, TOP4, s0 / 6, s1 / 6, LV[2], LV[3] - LV[2]);
    }
    // the charcoal frame, standing 0.3 m proud: verticals at the bays, the band at level 2, the line between the tiers
    for (const s of BAYS[i]) { const [u, v] = at(s); obox("frame", u + e.n[0] * 0.15, v + e.n[1] * 0.15, 0, TOP4, 0.4, 0.3, e.f); }
    const [mu, mv] = at(e.len / 2);
    obox("frame", mu + e.n[0] * 0.15, mv + e.n[1] * 0.15, BAND0, 5.0, e.len + 0.3, 0.3, e.f, 1, true);
    obox("frame", mu + e.n[0] * 0.15, mv + e.n[1] * 0.15, TIER[1] - 0.17, TIER[1] + 0.17, e.len + 0.3, 0.3, e.f, 1, true);
  });
  // the canopy over the lobby's door on Elizabeth St (the ground floor plan's main entrance, the base rendering's canopy)
  abox("frame", W2 + 0.3, W2 + 2.7, 3.9, 4.2, -1.5, 4.5, 1, true);
  // levels 5-7: the slabs (level 7's is the tower's whole plate), the columns, level 7's columns ready for level 8
  slab("conc", PODIUM, LV[5]); slab("conc", PODIUM, LV[6]); slab("conc", PLATE, LV[7]);
  for (const [y0, y1] of [[LV[5], LV[6] - SLAB], [LV[6], LV[7] - SLAB], [LV[7], LV[8] - SLAB]])
    for (const [u, v] of COLUMNS) abox("conc", u - 0.3, u + 0.3, y0, y1, v - 0.45, v + 0.45, 4);
  // the core to level 8, its climbing forms above, their deck
  const [c0, c1, d0, d1] = CORE, FORM0 = LV[8] - 0.74, FORM1 = 28.2;
  for (const e of edges([[c0, d0], [c1, d0], [c1, d1], [c0, d1]])) wall("core", e.p, e.q, e.n, TOP4, FORM0, 0, e.len / 4.8, 0, 3.6);
  for (const e of edges([[c0 - 0.6, d0 - 0.6], [c1 + 0.6, d0 - 0.6], [c1 + 0.6, d1 + 0.6], [c0 - 0.6, d1 + 0.6]])) wall("jump", e.p, e.q, e.n, FORM0, FORM1, 0, e.len / 4, FORM0, 4.2);
  flat("ply", [[c0 - 0.6, d0 - 0.6], [c1 + 0.6, d0 - 0.6], [c1 + 0.6, d1 + 0.6], [c0 - 0.6, d1 + 0.6]], FORM1, 1);
  band("rail", inset([[c0 - 0.6, d0 - 0.6], [c1 + 0.6, d0 - 0.6], [c1 + 0.6, d1 + 0.6], [c0 - 0.6, d1 + 0.6]], 0.05), FORM1, FORM1 + 1.1, 4);
  // guardrails and netting at every open edge; reshores under the newest slab
  band("rail", inset(PODIUM, 0.12), LV[5], LV[5] + 1.1, 4);
  band("rail", inset(PODIUM, 0.12), LV[6], LV[6] + 1.1, 4);
  band("rail", inset(PLATE, 0.12), LV[7], LV[7] + 1.1, 4);
  band("shore", inset(PODIUM, 1.4), LV[6], LV[7] - SLAB, 4);

  // ======== the tower crane ========
  const H = jibHeight, MT = H - 3.4, [mu, mv] = MAST, hw = MAST_W / 2, b = jibBearing * Math.PI / 180;
  const f = [Math.sin(b), -Math.cos(b)], r = [-f[1], f[0]];
  const J = (s, l, y) => [mu + f[0] * s + r[0] * l, y, mv + f[1] * s + r[1] * l];  // along the jib s, across it l
  // the plywood box round its foot, the mast's chords and bracing
  abox("ply", mu - 1.8, mu + 1.8, 0, 3.0, mv - 1.8, mv + 1.8, 1);
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) abox("red", mu + i * hw - 0.11 * (i + 1), mu + i * hw - 0.11 * (i - 1), 0, MT, mv + j * hw - 0.11 * (j + 1), mv + j * hw - 0.11 * (j - 1), 1);
  for (const e of edges([[mu - hw, mv - hw], [mu + hw, mv - hw], [mu + hw, mv + hw], [mu - hw, mv + hw]])) wall("latRed", e.p, e.q, e.n, 3.0, MT, 0, 1, 3.0, MAST_W);
  // the slewing unit (turning with the jib), the cab beside the jib's root
  obox("red", mu, mv, MT, MT + 0.8, 2.6, 2.6, f, 1, true);
  obox("red", mu, mv, MT + 0.8, H + 0.3, 2.1, 2.1, f);
  { const [u, , v] = J(0.6, -2.0, 0); obox("cab", u, v, H - 2.6, H - 0.1, 1.9, 1.7, f, 2.4, true); }
  // the tower head: four legs to its apex, braced
  const AP = J(0, 0, H + 10);
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) beam("red", J(i * 1.0, j * 1.0, H + 0.3), AP, 0.24);
  for (const [i0, j0, i1, j1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]])
    tri("latRed", J(i0, j0, H + 0.3), J(i1, j1, H + 0.3), AP, [0, 0], [1, 0], [0.5, 5], [0, 1, 0]);
  // the jib: a triangle in section (bottom chords 1.6 m apart, top chord 1.8 m up), braced on both sides
  const S0 = 1.0, S1 = S0 + JIB_LEN;
  beam("red", J(S0, -0.8, H), J(S1, -0.8, H), 0.18); beam("red", J(S0, 0.8, H), J(S1, 0.8, H), 0.18);
  beam("red", J(S0, 0, H + 1.8), J(S1, 0, H + 1.8), 0.18);
  for (const l of [-0.8, 0.8]) quad("latRed", J(S0, l, H), J(S1, l, H), J(S1, 0, H + 1.8), J(S0, 0, H + 1.8), [0, 0], [JIB_LEN / 2, 0], [JIB_LEN / 2, 1], [0, 1], [r[0] * l, 0.5, r[1] * l]);
  quad("latRed", J(S0, -0.8, H), J(S1, -0.8, H), J(S1, 0.8, H), J(S0, 0.8, H), [0, 0], [JIB_LEN / 1.6, 0], [JIB_LEN / 1.6, 1], [0, 1], [0, -1, 0]);
  // the counter-jib: two girders, its deck and rails, the winch, the counterweights, the contractor's banner
  const C1 = -(1.0 + CJ_LEN);
  for (const l of [-1.05, 1.05]) { beam("red", J(-1.0, l, H + 0.3), J(C1, l, H + 0.3), 0.25, 0.6); beam("red", J(-1.0, l * 1.05, H + 1.7), J(C1 + 1.5, l * 1.05, H + 1.7), 0.07); }
  { const [u, , v] = J((C1 - 1) / 2, 0, 0); obox("grey", u, v, H + 0.55, H + 0.65, CJ_LEN, 2.1, f, 1, true); }
  { const [u, , v] = J(-6.5, 0, 0); obox("grey", u, v, H + 0.65, H + 2.0, 2.2, 1.5, f); }
  { const [u, , v] = J(C1 + 1.3, 0, 0); obox("weight", u, v, H - 2.4, H + 1.5, 2.4, 2.5, f, 4, true); }
  quad("banner", J(-3.0, -1.15, H + 0.75), J(-11.0, -1.15, H + 0.75), J(-11.0, -1.15, H + 1.65), J(-3.0, -1.15, H + 1.65), [0, 0], [1, 0], [1, 1], [0, 1], [-r[0], 0, -r[1]]);
  // the tie bars from the apex to the jib and the counter-jib
  for (const s of [22, 44]) beam("red", AP, J(s, 0, H + 1.8), 0.1);
  for (const l of [-1.05, 1.05]) beam("red", AP, J(C1 + 2.5, l, H + 0.9), 0.1);
  // the trolley, the hoist ropes, the hook block and the concrete bucket it carries over the deck
  const TS = 16, HOOK = LV[7] + 5.2;
  { const [u, , v] = J(TS, 0, 0); obox("red", u, v, H - 0.6, H - 0.05, 1.5, 1.9, f, 1, true); }
  for (const l of [-0.25, 0.25]) beam("rope", J(TS, l, H - 0.6), J(TS, l, HOOK + 0.9), 0.05);
  { const [u, , v] = J(TS, 0, 0); obox("yellow", u, v, HOOK, HOOK + 0.9, 0.55, 0.9, f, 1, true); obox("rope", u, v, HOOK - 0.9, HOOK, 0.12, 0.12, f); obox("grey", u, v, HOOK - 2.6, HOOK - 0.9, 1.3, 1.3, f, 1, true); }

  // ======== the material hoist on the west face ========
  const HU = -W2 - 3.05, HV = -8, HT = LV[8] + 2.6;
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) abox("grey", HU + i * 0.75 - 0.06, HU + i * 0.75 + 0.06, 0, HT, HV + j * 0.75 - 0.06, HV + j * 0.75 + 0.06, 1);
  for (const e of edges([[HU - 0.75, HV - 0.75], [HU + 0.75, HV - 0.75], [HU + 0.75, HV + 0.75], [HU - 0.75, HV + 0.75]])) wall("latGrey", e.p, e.q, e.n, 0, HT, 0, 1, 0, 1.5);
  abox("grey", -W2 - 2.25, -W2 - 0.45, LV[6] + 0.1, LV[6] + 2.7, HV - 1.6, HV + 1.6, 1, true);
  for (const y of [LV[5] + 0.5, LV[7] + 0.5]) beam("grey", [HU + 0.75, y, HV], [-W2, y, HV], 0.12);

  // ======== the yard: containers, a trailer, a dumpster, pallets by the crane ========
  abox("contRed", -37.1, -24.9, 0, 2.6, 7, 9.44, 2.6, false);
  abox("contBlue", -37.1, -24.9, 0, 2.6, 10.2, 12.64, 2.6, false);
  abox("contWhite", -53.3, -38.7, 0, 3.1, 0, 3.6, 3.1, false);
  abox("contBlue", -27, -21, 0, 1.8, 20.3, 22.7, 1.8, false);
  abox("ply", MAST[0] - 8, MAST[0] - 4, 0, 0.8, MAST[1] + 0.5, MAST[1] + 2.5, 1);
  abox("ply", MAST[0] + 3, MAST[0] + 6, 0, 1.2, MAST[1] + 1.0, MAST[1] + 3.0, 1);

  // ======== the site (unturned): graded dirt, Jersey barriers with the screened fence on them ========
  rot = 0;
  const site = SITE.map(([lon, lat]) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; });
  flat("dirt", site, 0.03, 1, 8);
  for (const e of edges(site)) {
    const [u, v] = [(e.p[0] + e.q[0]) / 2 - e.n[0] * 0.3, (e.p[1] + e.q[1]) / 2 - e.n[1] * 0.3];
    obox("barrier", u, v, 0, 0.81, e.len, 0.6, e.f, 1);
  }
  band("fence", inset(site, 0.3), 0.81, 2.6, 10);

  // ---- merge: one mesh per material ----
  for (const [k, o] of Object.entries(BUF)) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(o.p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(o.n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(o.t, 2));
    const mesh = new THREE.Mesh(geo, MATS[k]); mesh.name = `elizabeth-410:${k}`;
    mesh.castShadow = !MATS[k].transparent; mesh.receiveShadow = true;
    g.add(mesh);
  }
  return g;
}
