// Bally's Chicago, at the old Chicago Tribune printing plant on Chicago Ave by the North Branch, lifted out of the
// cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers/assets/cab-ride.js) so it can be shared.
//
// From the site plan in the City's Plan Commission presentation for the PD 1426 amendment (December 12, 2022,
// "Existing context plan - proposed Phase 1"): the casino hall along the river, its long north-west face to the
// tracks; the drum at its north-east corner by Chicago Ave. The hotel is not where that plan has it (a lens at the
// north-east corner): in February 2024 it moved to the hall's south end, where the plan had the event center, as built
// (drone video of the site, autumn 2026): a dark glass slab of about 35 storeys. Heights are from the renderings.
//
//   import * as THREE from "three";
//   import { buildBallys } from "./ballys-chicago.js";
//   scene.add(buildBallys({ THREE }));
//
// Coordinates are local metres, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt
// Rd at the lakefront). Pass your own origin, or { origin: BALLYS_CENTRE } to have the casino at about (0, 0, 0).
// It needs a browser (or another DOM with <canvas>): the facades and the lettering are painted on canvas textures.

export const BALLYS_CENTRE = [-87.6455, 41.8945];

// The site plan is drawn with north to the right; ballysPlan(origin) turns its pixels into local metres, fitted to
// three street corners (Chicago & Halsted, Grand & Halsted, Chicago & Larrabee) from OpenStreetMap.
export function ballysPlan(origin = [-87.620063, 41.863968]) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  const P = [[1003, 14, -87.64782, 41.896403], [147, 14, -87.647627, 41.891194], [1003, 603, -87.642948, 41.896481]];   // [px, py, lon, lat]
  const solve = (k) => {                                          // v = a px + b py + c through the three corners
    const [[x1, y1], [x2, y2], [x3, y3]] = P, [v1, v2, v3] = P.map((q) => q[k]);
    const det = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2);
    return [(v1 * (y2 - y3) - y1 * (v2 - v3) + (v2 * y3 - v3 * y2)) / det, (x1 * (v2 - v3) - v1 * (x2 - x3) + (x2 * v3 - x3 * v2)) / det,
      (x1 * (y2 * v3 - y3 * v2) - y1 * (x2 * v3 - x3 * v2) + v1 * (x2 * y3 - x3 * y2)) / det];
  };
  const LON = solve(2), LAT = solve(3);
  return (px, py) => {
    const lon = LON[0] * px + LON[1] * py + LON[2], lat = LAT[0] * px + LAT[1] * py + LAT[2];
    return [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
  };
}

// res: texture pixels per drawing unit (the film uses 2 at 4K)
export function buildBallys({ THREE, origin = [-87.620063, 41.863968], res = 1 }) {
  const group = new THREE.Group();
  group.name = "ballys-chicago";
  const PLAN = ballysPlan(origin);
  const SUN = new THREE.Vector3(0.42, 0.78, 0.46).normalize();     // from the south-east, high
  const BAY = 3.6, FLOOR = 3.4, TEX = 128;                         // metres per window bay and per storey; texture size
  const canvas = (w, h) => { const cv = document.createElement("canvas"); cv.width = w * res; cv.height = h * res; const c = cv.getContext("2d"); c.scale(res, res); return [cv, c]; };
  // the facades it uses (the same as the film's city): one window bay by one storey, tinted by vertex colour
  const FACADES = {
    f: (c) => {                                                   // tall white metal fins of uneven widths
      c.fillStyle = "#f7f7f5"; c.fillRect(0, 0, 128, 128);
      [[6, 3, "#d2d6d9"], [20, 2, "#e0e3e5"], [27, 4, "#c9ced2"], [45, 2, "#dadde0"], [58, 3, "#d0d4d8"], [71, 2, "#e2e4e6"],
        [90, 4, "#cbd0d4"], [97, 2, "#dde0e2"], [113, 3, "#d3d7da"]].forEach(([x, w, col]) => { c.fillStyle = col; c.fillRect(x, 0, w, 128); });
    },
    c: (c) => { c.fillStyle = "#f3f7fb"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#d3dde7"; c.fillRect(0, 0, 128, 24); c.fillStyle = "#bcc8d4"; c.fillRect(120, 0, 8, 128); c.fillRect(58, 0, 4, 128); },   // glass curtain wall
    v: (c) => { c.fillStyle = "#56677c"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#7f93a8"; c.fillRect(0, 0, 128, 20); c.fillStyle = "#f6f4f0"; c.fillRect(0, 0, 48, 128); },    // vertical piers
    s: (c) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#e6e2da"; c.fillRect(0, 0, 128, 4); },                                                           // plain
    m: (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#9aa6b2"; c.fillRect(0, 0, 128, 3); c.fillRect(0, 0, 2, 128); c.fillRect(64, 0, 1, 128); },     // mirror glass: thin mullions
  };
  // mirror glass reflects a painted surround: sky above, the haze at the horizon, the city below it
  const mirrorGlass = (tex) => {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
    const c = cv.getContext("2d"), g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#3d7fd0"); g.addColorStop(0.36, "#9cc2e8"); g.addColorStop(0.5, "#e8eef3"); g.addColorStop(0.53, "#8a929a"); g.addColorStop(1, "#3c4248");
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
    for (let x = 0; x < 256; x += 3) { const h = 2 + 9 * ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; c.fillStyle = "rgba(70,78,88,0.55)"; c.fillRect(x, 64 - h, 3, h); }
    const env = new THREE.CanvasTexture(cv);
    env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, metalness: 0.9, roughness: 0.08, envMap: env, envMapIntensity: 1.6, side: THREE.DoubleSide });
  };
  const groups = {};
  for (const k of Object.keys(FACADES)) groups[k] = { pos: [], col: [], uvs: [] };
  // one closed ring ([x, z, ..., x0, z0]) from y0 to y1, flat-topped, into facade f; `windows` maps the facade texture on
  const extrude = (f, p, y0, y1, c, windows) => {
    const G = groups[f];
    const push = (v, k, u = 0.02, w = 0.02) => { G.pos.push(v[0], v[1], v[2]); G.col.push(c[0] * k, c[1] * k, c[2] * k); G.uvs.push(u, w); };
    const n = p.length / 2 - 1, glassy = f === "c" || f === "v" || f === "m";
    for (let i = 0; i < n; i++) {
      const x0 = p[i * 2], z0 = p[i * 2 + 1], x1 = p[i * 2 + 2], z1 = p[i * 2 + 3], len = Math.hypot(x1 - x0, z1 - z0);
      if (len < 0.05) continue;
      const nx = (z1 - z0) / len, nz = -(x1 - x0) / len, lit = 0.58 + 0.42 * Math.max(0, nx * SUN.x + nz * SUN.z);
      const lo = lit * (glassy && y1 - y0 > 40 ? 0.74 : 0.82), hi = lit * (glassy && y1 - y0 > 40 ? 1.05 : 1);
      const A = [x0, y0, z0], B = [x1, y0, z1], C = [x1, y1, z1], D = [x0, y1, z0];
      if (windows) {
        const u1 = Math.max(1, Math.round(len / BAY)), v0 = Math.round(y0 / FLOOR), v1 = Math.max(v0 + 1, Math.round(y1 / FLOOR));
        push(A, lo, 0, v0); push(B, lo, u1, v0); push(C, hi, u1, v1); push(A, lo, 0, v0); push(C, hi, u1, v1); push(D, hi, 0, v1);
      } else { push(A, lo); push(B, lo); push(C, hi); push(A, lo); push(C, hi); push(D, hi); }
    }
    const contour = [];
    for (let i = 0; i < n; i++) contour.push(new THREE.Vector2(p[i * 2], p[i * 2 + 1]));
    for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) for (const k of t) push([contour[k].x, y1, contour[k].y], 1.08);
  };
  const shrink = (p, k) => {                                      // a ring pulled toward its centre
    const n = p.length / 2 - 1; let cx = 0, cz = 0;
    for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
    return p.map((v, i) => (i % 2 ? cz : cx) + (v - (i % 2 ? cz : cx)) * k);
  };
  const ring = (pts) => { const q = pts.flatMap(([px, py]) => PLAN(px, py)); return [...q, q[0], q[1]]; };

  // the casino hall: warm-lit glass at street level, a copper band, the hall clad in white fins, a copper cornice
  const CASINO = [[740, 208], [892, 208], [908, 320], [895, 392], [624, 390], [614, 397], [622, 407], [531, 457], [495, 413], [577, 347], [602, 328], [722, 216]];
  const COPPER = [0.80, 0.52, 0.32], WHITE = [0.97, 0.97, 0.96], p = ring(CASINO);
  extrude("c", p, 0, 8.5, [0.86, 0.72, 0.56], true);
  extrude("s", shrink(p, 1.006), 8.5, 10.5, COPPER, false);
  extrude("f", p, 10.5, 26, WHITE, true);
  extrude("s", shrink(p, 1.004), 26, 27, COPPER.map((v) => v * 1.1), false);
  extrude("s", shrink(p, 0.85), 27, 30, [0.86, 0.87, 0.88], false);
  // the drum at the hall's north-east corner, toward Chicago Ave
  const [dx, dz] = PLAN(894, 214);
  const ringAt = (cx, cz, r, n) => { const q = []; for (let i = 0; i <= n; i++) { const a = -(i % n) / n * Math.PI * 2; q.push(cx + r * Math.cos(a), cz + r * Math.sin(a)); } return q; };
  extrude("v", ringAt(dx, dz, 11, 24), 0, 31, [0.90, 0.76, 0.58], true);
  extrude("s", ringAt(dx, dz, 11.6, 24), 31, 32.2, COPPER, false);
  // the hotel: a slab at the hall's south end, its long side to the river; dark mirror glass, about 35 storeys
  const [hx, hz] = PLAN(566, 418), [ax, az] = PLAN(626, 402), [bx, bz] = PLAN(531, 457);
  const ul = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / ul, uz = (bz - az) / ul, rx = -uz, rz = ux;
  const slab = (hl, hw) => { const q = []; for (const [a, b2] of [[-1, -1], [-1, 1], [1, 1], [1, -1], [-1, -1]]) q.push(hx + ux * hl * a + rx * hw * b2, hz + uz * hl * a + rz * hw * b2); return q; };
  extrude("m", slab(28, 12), 0, 122, [0.30, 0.36, 0.44], true);
  extrude("s", slab(28.3, 12.3), 122, 125, [0.22, 0.24, 0.27], false);

  for (const [k, G] of Object.entries(groups)) {
    if (!G.pos.length) continue;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
    const [cv, c] = canvas(TEX, TEX);
    FACADES[k](c);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const mesh = new THREE.Mesh(g, k === "m" ? mirrorGlass(tex) : new THREE.MeshBasicMaterial({ vertexColors: true, map: tex, side: THREE.DoubleSide }));
    mesh.name = { f: "hall", c: "street-level-glass", v: "drum", s: "trim", m: "hotel" }[k];
    group.add(mesh);
  }

  // "CHICAGO" down the drum (no operator's name on the building)
  const [cv, c] = canvas(160, 1024);
  c.fillStyle = "#2a1c12"; c.fillRect(0, 0, 160, 1024);
  c.fillStyle = "#fff6e0"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "700 120px Georgia, 'Times New Roman', serif";
  [..."CHICAGO"].forEach((ch, i) => c.fillText(ch, 80, 90 + i * 140));
  const drumTex = new THREE.CanvasTexture(cv); drumTex.colorSpace = THREE.SRGBColorSpace; drumTex.anisotropy = 8;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 21), new THREE.MeshBasicMaterial({ map: drumTex, side: THREE.DoubleSide }));
  sign.name = "drum-lettering";
  sign.position.set(dx - 11.6 * 0.82, 17, dz + 11.6 * 0.57); sign.rotation.y = -Math.PI / 2 - 0.6;
  group.add(sign);
  return group;
}
