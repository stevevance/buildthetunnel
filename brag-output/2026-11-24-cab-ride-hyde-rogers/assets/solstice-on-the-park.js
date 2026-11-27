// Solstice on the Park: Studio Gang's 26-storey apartment tower at 1616 E 56th St, Hyde Park (completed 2018), on the
// north side of 56th St facing Jackson Park, a block east of the Metra Electric's 55th-56th-57th St station. For the
// cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js.
//
// What makes it Solstice: its long south face is a grid of white-framed window bays, each two storeys tall and tilted so
// its top leans out (the glass at 72 degrees, the summer-solstice noon sun at Chicago's latitude, so in summer the bay
// shades itself and in winter the low sun comes in). The dark bays alternate with flat, pale glass strips and step
// sideways a strip's width every row, a staggered checkerboard with a sawtooth silhouette at the corners. The north face
// repeats it with a shallower tilt; the east and west ends are flat pale panels slotted with narrow windows; an open
// white frame stands above the roof as its crown. A two-storey glass base, a low link and a four-level garage behind.
//
// Where the numbers come from:
//   - Footprints: OpenStreetMap, November 2026, through the Chicago Cityscape CLI (the way ids are the keys of RINGS): the
//     tower (484610698, 26 levels), the 2-level link north of it (1417211020), the 4-level garage behind that
//     (1050626220) and its stair head (1417211021, levels 4 to 5).
//   - Floors and height: 26 storeys (Studio Gang, the CTBUH's Skyscraper Center, OSM); 87.3 m (286 ft) to the top of the
//     crown (Skyscraper Center) and 272 ft (82.9 m) to the roof (Studio Gang's project page). The glass at 72 degrees is
//     Studio Gang's figure.
//   - Cook County's 2022 LiDAR (ISGS, the DSM less the DTM): the garage 9.8 to 11.3 m (drawn at 10.5 m), the link 3.9 m.
//     It has no returns from the tower's roof (it reads the ground there, as at Museum Park's tall towers), so the
//     tower's height is the published one.
//   - The facade, from photographs on Wikimedia Commons: 12 rows of bays over a two-storey base (so two storeys a bay),
//     four bays and four strips to a row on the south face, staggered row to row; the bays' tops out about 2 m (the
//     tilt of a 6.2 m bay at 72 degrees, and what the corner's silhouette shows); the end walls; the open crown frame.
// Assumed: the base's height (8 m, floors 1 and 2) and its storefront; the bay-to-strip split (0.69 of each 13.9 m unit);
//   the north face's tilt (0.9 m) and its stagger, copied from the south; the mullions, the panels and the slots on the
//   ends; the crown's posts and rails (no diagonals) and the mechanical penthouse behind it; the green roof's extent; the
//   link's and garage's walls (no photographs of them); the stair head at 13.6 m.
// Reference images: refs/solstice-on-the-park/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildSolstice, solsticeSite } from "./solstice-on-the-park.js";
//   scene.add(buildSolstice({ THREE }));
//
// Coordinates are local metres, x east, z south, y up (0 at grade), from `origin` ([lon, lat]; by default the film's,
// Roosevelt Rd at the lakefront). Pass { origin: SOLSTICE_CENTRE } to have the tower round (0, 0, 0). It needs a browser
// (or another DOM with <canvas>): the facades are painted on canvas textures.
export const SOLSTICE_CENTRE = [-87.585885, 41.793668];
const FILM_ORIGIN = [-87.620063, 41.863968];

// [lon, lat] rings from OpenStreetMap, by way id (the closing node left off)
const RINGS = {
  484610698: [[-87.5862177, 41.7935602], [-87.585551, 41.7935663], [-87.5855544, 41.7937759], [-87.5856761, 41.7937748],
    [-87.5860899, 41.793771], [-87.5862211, 41.7937698]],
  1417211020: [[-87.5860917, 41.7938796], [-87.5860899, 41.793771], [-87.5856761, 41.7937748], [-87.5856779, 41.7938836]],
  1050626220: [[-87.5855618, 41.7938847], [-87.5855628, 41.7939393], [-87.5855672, 41.7941987], [-87.5862436, 41.7941922],
    [-87.5862382, 41.7938782], [-87.5860917, 41.7938796], [-87.5856779, 41.7938836], [-87.585644, 41.7938839]],
  1417211021: [[-87.585645, 41.7939389], [-87.585644, 41.7938839], [-87.5855618, 41.7938847], [-87.5855628, 41.7939393]],
};
// the tower's corners (its ring's SW, SE, NE and NW nodes)
const CORNERS = [RINGS[484610698][0], RINGS[484610698][1], RINGS[484610698][2], RINGS[484610698][5]];
// The footprints OpenStreetMap's own buildings give way to (the stair head lies inside the garage)
const SITE_IDS = [484610698, 1417211020, 1050626220];

const BASE = 8, ROOF = 82.9, TOP = 87.3, ROWS = 12, ROW = (ROOF - BASE) / ROWS;   // 12 rows of two 3.12 m storeys
const TILT_S = ROW * Math.tan(18 * Math.PI / 180);                                // 2.03 m: glass at 72 degrees
const TILT_N = 0.9;                                                               // (assumed)
const UNITS = 4, BAY_SHARE = 0.69;                                                // four bays and four strips a row

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// Each footprint as a closed ring of local metres [x, z, x, z, ...], for clearing OpenStreetMap's buildings
export function solsticeSite(origin = FILM_ORIGIN) {
  const L = local(origin);
  return SITE_IDS.map((id) => { const r = RINGS[id].flatMap(([lon, lat]) => L(lon, lat)); return [...r, r[0], r[1]]; });
}

export function buildSolstice({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...SOLSTICE_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz);
  const P = ([lon, lat]) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; };

  // ---- the facades, each painted once on a canvas ----
  const canvas = (draw) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    draw(cv.getContext("2d"));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  const WHITE = "#e9e8e3";
  // a bay, two storeys in its white frame: the glass (facing a little down, so dark green-grey), its mullions, the slab
  // between the storeys and a pale glass guard at the foot of each
  const bayTex = canvas((c) => {
    c.fillStyle = WHITE; c.fillRect(0, 0, 256, 256);
    for (const [y0, y1] of [[13, 124], [132, 243]]) {
      const gr = c.createLinearGradient(0, y0, 0, y1);
      gr.addColorStop(0, "#26302f"); gr.addColorStop(0.25, "#3f4f4d"); gr.addColorStop(1, "#5a6b68");
      c.fillStyle = gr; c.fillRect(9, y0, 238, y1 - y0);
      c.fillStyle = "#9aa7a5"; for (let x = 30; x < 247; x += 24) c.fillRect(x, y0, 3, y1 - y0);
      c.fillStyle = "rgba(215,228,230,0.55)"; c.fillRect(9, y1 - 18, 238, 18);
      c.fillStyle = "#c9cdca"; c.fillRect(9, y1 - 19, 238, 2);
    }
    c.fillStyle = "#d4d6d2"; c.fillRect(9, 124, 238, 8);
  });
  // a strip: flat pale glass that catches the sky, three panes a storey in the same frame
  const stripTex = canvas((c) => {
    c.fillStyle = WHITE; c.fillRect(0, 0, 256, 256);
    for (const [y0, y1] of [[13, 124], [132, 243]]) {
      const gr = c.createLinearGradient(0, y0, 0, y1);
      gr.addColorStop(0, "#c9d7e0"); gr.addColorStop(1, "#8ea5b4");
      c.fillStyle = gr; c.fillRect(11, y0, 234, y1 - y0);
      c.fillStyle = "#dfe4e5"; c.fillRect(86, y0, 4, y1 - y0); c.fillRect(166, y0, 4, y1 - y0); c.fillRect(11, y0 + 60, 234, 2);
    }
    c.fillStyle = "#d4d6d2"; c.fillRect(11, 124, 234, 8);
  });
  // the east and west ends: pale panels, narrow dark slot windows staggered storey to storey; a tile is 1/5 of the end
  const endTex = canvas((c) => {
    c.fillStyle = "#e0dcd2"; c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#c9c5bb"; for (let x = 0; x < 256; x += 51) c.fillRect(x, 0, 2, 256);
    for (const [y0, cols] of [[0, [1, 3]], [128, [0, 2, 4]]]) for (const k of cols) {
      const gr = c.createLinearGradient(0, y0, 0, y0 + 120);
      gr.addColorStop(0, "#5d6b76"); gr.addColorStop(1, "#2f3a44");
      c.fillStyle = gr; c.fillRect(k * 51 + 17, y0 + 10, 18, 108);
    }
    c.fillStyle = WHITE; c.fillRect(0, 124, 256, 5); c.fillRect(0, 251, 256, 5);
  });
  // the base: two storeys of storefront glass, 3 m a tile, the second floor's slab at 5 m
  const baseTex = canvas((c) => {
    const gr = c.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#8196a4"); gr.addColorStop(0.36, "#4a5c68"); gr.addColorStop(0.4, "#7f94a2"); gr.addColorStop(1, "#33424c");
    c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#d6d8d6"; c.fillRect(0, 0, 6, 256); c.fillRect(126, 0, 4, 256);
    c.fillStyle = WHITE; c.fillRect(0, 90, 256, 12);
  });
  // the garage: a white precast spandrel and the dark opening of a parking level, with fins; a tile is one level, 6 m
  const garageTex = canvas((c) => {
    c.fillStyle = "#dedbd2"; c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#4f5455"; c.fillRect(0, 18, 256, 140);
    c.fillStyle = "#d2cfc6"; for (let x = 0; x < 256; x += 32) c.fillRect(x + 12, 18, 8, 140);
    c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(0, 158, 256, 6);
  });
  const MATS = {
    frame: new THREE.MeshStandardMaterial({ color: 0xe9e8e3, roughness: 0.8 }),
    bay: new THREE.MeshStandardMaterial({ map: bayTex, roughness: 0.3, metalness: 0.2 }),
    strip: new THREE.MeshStandardMaterial({ map: stripTex, roughness: 0.25, metalness: 0.2 }),
    end: new THREE.MeshStandardMaterial({ map: endTex, roughness: 0.8 }),
    base: new THREE.MeshStandardMaterial({ map: baseTex, roughness: 0.3, metalness: 0.2 }),
    garage: new THREE.MeshStandardMaterial({ map: garageTex, roughness: 0.9 }),
    green: new THREE.MeshStandardMaterial({ color: 0x7a8a5c, roughness: 1 }),
    grey: new THREE.MeshStandardMaterial({ color: 0x8f9396, roughness: 0.9 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xb9bec1, roughness: 0.6, metalness: 0.3 }),
  };

  // ---- geometry, gathered per material and merged at the end ----
  const acc = {};
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // a flat polygon (a fan from its first point), wound to face `face`
  const poly = (k, pts, uvs, face) => {
    let n = unit(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (n[0] * face[0] + n[1] * face[1] + n[2] * face[2] < 0) { pts = [...pts].reverse(); uvs = [...uvs].reverse(); n = n.map((v) => -v); }
    const a = acc[k] || (acc[k] = { pos: [], nor: [], uv: [] });
    for (let i = 1; i + 1 < pts.length; i++) for (const j of [0, i, i + 1]) { a.pos.push(...pts[j]); a.nor.push(...n); a.uv.push(...uvs[j]); }
  };
  const UV4 = [[0, 0], [1, 0], [1, 1], [0, 1]], UV3 = [[0, 0], [1, 0], [1, 1]];

  // the tower is built square to its own footprint (x along the south face, z south, from its centre), then turned
  const C = CORNERS.map(P);
  const LEN = (Math.hypot(C[1][0] - C[0][0], C[1][1] - C[0][1]) + Math.hypot(C[2][0] - C[3][0], C[2][1] - C[3][1])) / 2;
  const DEP = (Math.hypot(C[3][0] - C[0][0], C[3][1] - C[0][1]) + Math.hypot(C[2][0] - C[1][0], C[2][1] - C[1][1])) / 2;
  const th = Math.atan2(-(C[1][1] - C[0][1]), C[1][0] - C[0][0]), co = Math.cos(th), si = Math.sin(th);
  const tc = [(C[0][0] + C[1][0] + C[2][0] + C[3][0]) / 4, (C[0][1] + C[1][1] + C[2][1] + C[3][1]) / 4];
  const turn = (p) => [p[0] * co + p[2] * si, p[1], -p[0] * si + p[2] * co];
  const tq = (k, pts, uvs, face) => poly(k, pts.map((p) => { const q = turn(p); return [q[0] + tc[0], q[1], q[2] + tc[1]]; }), uvs, turn(face));
  const box = (k, x0, x1, y0, y1, z0, z1) => {
    const v = (x, y, z) => [x, y, z];
    tq(k, [v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], UV4, [0, 0, 1]);
    tq(k, [v(x1, y0, z0), v(x0, y0, z0), v(x0, y1, z0), v(x1, y1, z0)], UV4, [0, 0, -1]);
    tq(k, [v(x1, y0, z1), v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1)], UV4, [1, 0, 0]);
    tq(k, [v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1), v(x0, y1, z0)], UV4, [-1, 0, 0]);
    tq(k, [v(x0, y1, z1), v(x1, y1, z1), v(x1, y1, z0), v(x0, y1, z0)], UV4, [0, 1, 0]);
    tq(k, [v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1)], UV4, [0, -1, 0]);
  };
  const W2 = LEN / 2, D2 = DEP / 2;
  // each face: its left end seen from outside (O), the way along it (R), out of it (N)
  const FACES = {
    s: { O: [-W2, 0, D2], R: [1, 0, 0], N: [0, 0, 1], len: LEN, d: TILT_S },
    n: { O: [W2, 0, -D2], R: [-1, 0, 0], N: [0, 0, -1], len: LEN, d: TILT_N },
    e: { O: [W2, 0, D2], R: [0, 0, -1], N: [1, 0, 0], len: DEP },
    w: { O: [-W2, 0, -D2], R: [0, 0, 1], N: [-1, 0, 0], len: DEP },
  };
  const at = (f, s, y, d = 0) => [f.O[0] + f.R[0] * s + f.N[0] * d, y, f.O[2] + f.R[2] * s + f.N[2] * d];
  const neg = (a) => a.map((v) => -v);

  // the base: storefront round all four sides, white piers at the bays' rhythm, and the slab over it
  for (const f of Object.values(FACES)) {
    tq("base", [at(f, 0, 0), at(f, f.len, 0), at(f, f.len, BASE), at(f, 0, BASE)], [[0, 0], [f.len / 3, 0], [f.len / 3, 1], [0, 1]], f.N);
    const piers = f.d ? UNITS * 2 : 2;
    for (let i = 1; i < piers; i++) {
      const [x, , z] = at(f, (i * f.len) / piers, 0, 0.2);
      box("frame", x - 0.35, x + 0.35, 0, BASE, z - 0.35, z + 0.35);
    }
  }
  box("frame", -W2 - 0.3, W2 + 0.3, BASE - 0.7, BASE, -D2 - 0.3, D2 + 0.3);
  for (const [x, z] of [[-W2, -D2], [W2, -D2], [W2, D2], [-W2, D2]]) box("frame", x - 0.4, x + 0.4, 0, ROOF, z - 0.4, z + 0.4);

  // the south and north faces: rows of tilted bays and flat strips, the pattern stepping one strip sideways each row
  for (const f of [FACES.s, FACES.n]) {
    const u = f.len / UNITS, B = u * BAY_SHARE, S = u - B;
    for (let r = 0; r < ROWS; r++) {
      const y0 = BASE + r * ROW, y1 = y0 + ROW;
      let s = 0;
      for (let k = 0; k < UNITS * 2; k++) {
        const bay = (k + r) % 2 === 0, s0 = s, s1 = s + (bay ? B : S);
        s = s1;
        if (!bay) { tq("strip", [at(f, s0, y0), at(f, s1, y0), at(f, s1, y1), at(f, s0, y1)], UV4, f.N); continue; }
        tq("bay", [at(f, s0, y0), at(f, s1, y0), at(f, s1, y1, f.d), at(f, s0, y1, f.d)], UV4, f.N);
        tq("frame", [at(f, s0, y0), at(f, s0, y1, f.d), at(f, s0, y1)], UV3, neg(f.R));          // its sides
        tq("frame", [at(f, s1, y0), at(f, s1, y1), at(f, s1, y1, f.d)], UV3, f.R);
        tq("frame", [at(f, s0, y1), at(f, s1, y1), at(f, s1, y1, f.d), at(f, s0, y1, f.d)], UV4, [0, 1, 0]);   // its top
      }
    }
  }
  // the flat east and west ends
  for (const f of [FACES.e, FACES.w])
    tq("end", [at(f, 0, BASE), at(f, f.len, BASE), at(f, f.len, ROOF), at(f, 0, ROOF)], [[0, 0], [5, 0], [5, ROWS], [0, ROWS]], f.N);

  // the roof: a white slab out to the bays' tops, the green roof on it, the penthouse, and the open frame of the crown
  const zS = D2 + TILT_S, zN = -D2 - TILT_N;
  box("frame", -W2 - 0.2, W2 + 0.2, ROOF - 0.6, ROOF, zN, zS);
  tq("green", [[-W2 + 0.8, ROOF + 0.02, D2 - 0.8], [W2 - 0.8, ROOF + 0.02, D2 - 0.8], [W2 - 0.8, ROOF + 0.02, -D2 + 0.8], [-W2 + 0.8, ROOF + 0.02, -D2 + 0.8]], UV4, [0, 1, 0]);
  box("metal", -13, 13, ROOF, ROOF + 4.2, -6, 5);
  const POST = 0.35, RAIL = 0.3;
  for (let i = 0; i <= 8; i++) {                                   // posts along the south and north edges
    const x = -W2 + (i * LEN) / 8;
    for (const z of [zS - POST / 2, zN + POST / 2]) box("frame", x - POST / 2, x + POST / 2, ROOF, TOP, z - POST / 2, z + POST / 2);
  }
  for (let i = 1; i < 4; i++) {                                    // and the ends
    const z = zN + (i * (zS - zN)) / 4;
    for (const x of [-W2 + POST / 2, W2 - POST / 2]) box("frame", x - POST / 2, x + POST / 2, ROOF, TOP, z - POST / 2, z + POST / 2);
  }
  for (const [y0, y1] of [[TOP - 0.55, TOP], [ROOF + 2.1, ROOF + 2.1 + RAIL]]) {   // the top ring and a rail
    box("frame", -W2, W2, y0, y1, zS - POST, zS);
    box("frame", -W2, W2, y0, y1, zN, zN + POST);
    box("frame", -W2, -W2 + POST, y0, y1, zN, zS);
    box("frame", W2 - POST, W2, y0, y1, zN, zS);
  }

  // ---- the link and the garage behind, straight from their footprints ----
  const prism = (id, y0, y1, k, tileW, tileH, roof) => {
    let pts = RINGS[id].map(P), a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a < 0) pts = [...pts].reverse();                           // so (dz, -dx) points out of every edge
    let u = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
      if (l < 0.01) continue;
      poly(k, [[p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]]],
        [[u / tileW, y0 / tileH], [(u + l) / tileW, y0 / tileH], [(u + l) / tileW, y1 / tileH], [u / tileW, y1 / tileH]], [dz, 0, -dx]);
      u += l;
    }
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const t of tris) poly(roof, t.map((j) => [pts[j][0], y1, pts[j][1]]), [[0, 0], [1, 0], [1, 1]], [0, 1, 0]);
  };
  prism(1417211020, 0, 3.9, "base", 3, BASE, "grey");
  prism(1050626220, 0, 10.5, "garage", 6, 10.5 / 4, "grey");
  prism(1417211021, 10.5, 13.6, "frame", 3, 3, "grey");

  for (const [k, a] of Object.entries(acc)) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(a.pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(a.nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(a.uv, 2));
    const m = new THREE.Mesh(geo, MATS[k]);
    m.name = `solstice-${k}`; m.castShadow = m.receiveShadow = true;
    g.add(m);
  }
  return g;
}
