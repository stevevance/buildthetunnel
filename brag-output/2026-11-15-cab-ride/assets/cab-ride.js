// Operator's-eye ride along the whole Clinton-Roosevelt Connector: north on
// the Metra Electric past Soldier Field, down a ramp and through the portal,
// west to Roosevelt, north under Clinton Street calling at Taylor/Clinton,
// Union Station and Randolph/Clinton, then up a ramp and out onto the
// surface to Chicago/Halsted, an open-air station beside the Halsted St and
// Chicago Ave viaducts.
//
// Three times the film leaves the cab: above the south portal as the train goes
// in, in the tunnel ahead of the train looking back at its cab, and above the
// north portal as it comes out and calls at Chicago/Halsted, from where the
// camera pulls back over the city to end the film (see SHOTS).
//
// Everything drawn is a pure function of t (seconds), so frames can be
// rendered in any order. `city` is assets/city.js (real buildings, water,
// parks, the route and its stations, in local metres: x east, z south, y up).
//
// What is real and what is assumed:
//   real     the station positions, the four straight legs of the alignment,
//            every building footprint and height, the river, lake and parks
//   assumed  the curves between the legs (single circular arcs; the drawn
//            alignment wobbles), the whole vertical profile (both ramps, both
//            portals, the depth, and that the line surfaces at its north
//            end), the tunnel and station design, the neighbouring tracks,
//            everything about Chicago/Halsted station but its position
const LEAD_IN = 520;                         // metres of Metra Electric before the route's own start
export const RUNOUT = 1500;                         // metres of surface track after the route's end (long enough that the closing aerial shot never sees where it stops)
export const FILM_RUNOUT = 300;                     // how much of that the minimap's line covers
// The route's straight legs, as stretches of the drawn alignment (metres from its start),
// and the radius of the curve joining each to the next.
// (The first span is replaced by the Metra Electric's own line, MED_LINE: see buildPlan.)
// At the south end the line does not turn straight from the Metra Electric onto Roosevelt Rd: the
// towers on the inside of that corner (One Museum Park, The Grant, NEMA) stand on deep foundations.
// As drawn (and as in the flyover) it bows out round them: it leaves the Metra Electric heading due
// north, swings west only once it is north of Roosevelt Rd, under Grant Park, and comes back onto
// Roosevelt Rd in a reverse curve. Spans 2 and 3 are those two short tangents.
const LEG_SPANS = [[0, 183], [0, 200], [510, 570], [700, 1800], [2250, 4100], [4700, 5080]];
// The middle of the Metra Electric's main tracks at about 18th St and just north of Roosevelt Rd
// ([lon, lat], read off OpenStreetMap's "University Park Sub District" tracks). The film runs along
// this line, among those tracks, until its own curve west under Roosevelt Rd; crcl_geo.json's line
// starts 16 m west of it and heads due north instead, which leaves the real tracks.
const MED_LINE = [[-87.618507, 41.859466], [-87.620690, 41.866669]];
const CURVES = [500, 190, 400, 175, 1000];

// The alignment in plan: straight legs joined by circular arcs, as 2D points
// (x east, z south) every ~2.5 m. Also used by tools/export-route.mjs, so the
// minimap is drawn along exactly the line the train follows.
export function buildPlan(THREE, city, curves = CURVES) {
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const rt = city.route, rd = [0];
  for (let i = 1; i < rt.length; i++) rd.push(rd[i - 1] + Math.hypot(rt[i][0] - rt[i - 1][0], rt[i][1] - rt[i - 1][1]));
  const rtAt = (d) => { let i = 0; while (i < rd.length - 1 && rd[i] < d) i++; return V2(rt[i][0], rt[i][1]); };
  const LEGS = LEG_SPANS.map(([d0, d1]) => { const p = rtAt(d0), q = rtAt(d1); return { p, dir: q.clone().sub(p).normalize() }; });
  const meet = (A, B) => {                                        // where two legs' lines cross
    const det = A.dir.x * (-B.dir.y) - (-B.dir.x) * A.dir.y, w = B.p.clone().sub(A.p);
    return A.p.clone().addScaledVector(A.dir, (w.x * (-B.dir.y) - (-B.dir.x) * w.y) / det);
  };
  {
    const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070;
    const local = ([lon, lat]) => V2((lon - city.origin[0]) * KX, (city.origin[1] - lat) * KY);
    const a = local(MED_LINE[0]), dir = local(MED_LINE[1]).sub(a).normalize();
    LEGS[0] = { p: a.clone().addScaledVector(dir, rtAt(0).sub(a).dot(dir)), dir };   // p: abreast of the route's start
  }
  const dir1 = LEGS[0].dir, dirN = LEGS[LEGS.length - 1].dir;
  const plan = [];                                                // 2D points every ~2.5 m
  const lineTo = (from, to) => {
    const n = Math.max(1, Math.ceil(from.distanceTo(to) / 2.5));
    for (let i = plan.length ? 1 : 0; i <= n; i++) plan.push(from.clone().lerp(to, i / n));
  };
  const planStart = LEGS[0].p.clone().addScaledVector(dir1, -LEAD_IN);
  let cursor = planStart;
  curves.forEach((Rc, i) => {
    const A = LEGS[i], B = LEGS[i + 1], pi = meet(A, B);
    const turn = Math.acos(Math.min(1, A.dir.dot(B.dir))), T = Rc * Math.tan(turn / 2);
    const ts = pi.clone().addScaledVector(A.dir, -T), st = pi.clone().addScaledVector(B.dir, T);
    lineTo(cursor, ts);
    const perp = V2(A.dir.y, -A.dir.x);
    const c1 = ts.clone().addScaledVector(perp, Rc), c2 = ts.clone().addScaledVector(perp, -Rc);
    const centre = Math.abs(c1.distanceTo(st) - Rc) < Math.abs(c2.distanceTo(st) - Rc) ? c1 : c2;
    const from = ts.clone().sub(centre), n = Math.ceil(Rc * turn / 2.5);
    const end = (sg) => from.clone().rotateAround(V2(0, 0), sg * turn).add(centre).distanceTo(st);
    const sg = end(1) < end(-1) ? 1 : -1;                          // rotate the way that ends at st
    for (let k = 1; k <= n; k++) plan.push(from.clone().rotateAround(V2(0, 0), sg * turn * k / n).add(centre));
    cursor = st;
  });
  {
    const L = LEGS[LEGS.length - 1], endOfRoute = rtAt(Infinity).sub(L.p).dot(dirN);
    lineTo(cursor, L.p.clone().addScaledVector(dirN, endOfRoute + RUNOUT));
  }
  return { plan, planStart, dir1, dirN };
}

// `captions`: [{ start, end, text }] in film seconds (assets/captions.js, written by tools/place-audio.mjs)
export function createCabRide(THREE, city, out, width, height, mini = null, logos = null, captions = null) {
  const FPS = 30, SUBFRAMES = 8, SHUTTER = 0.6;   // motion blur: 8 samples over 60% of a frame
  const RES = Math.max(1, Math.round(height / 1080));   // drawn textures (facades, signs, the cab's screens) get this many times the pixels: 2 at 4K
  // A canvas `w` x `h` in drawing units, RES times as many pixels, its context scaled to match.
  const hiCanvas = (w, h) => { const cv = document.createElement("canvas"); cv.width = w * RES; cv.height = h * RES; const c = cv.getContext("2d"); c.scale(RES, RES); return [cv, c]; };
  const RAMP_FROM = -130, RAMP_LEN = 300, DEPTH = 11.5;   // ramps and tunnel depth (assumed); the south ramp is underground before the line leaves the Metra Electric's tracks
  const OFF = 2.15;                          // each track's centre from the alignment centreline
  const R = 5.3, CY = 2.7;                   // bore radius, bore centre above the rail (one bore, two tracks)
  const TRENCH = 5.65;                       // half-width between a ramp's retaining walls
  const BED = 4.45;                          // half-width of the track bed inside the bore
  const LIGHT_EVERY = 9, RIB_EVERY = 4.5, TIE_EVERY = 0.65;
  const CAR_LEN = 25.9, CAR_GAP = 0.7, CARS = 4, NOSE = 1.2;     // the train's cars; the nose is this far ahead of the operator's eye
  const TRAIN_LONG = CARS * CAR_LEN + (CARS - 1) * CAR_GAP;        // nose to tail, 105.7 m
  const PLAT_IN = 3.65, PLAT_OUT = 8.6, PLAT_UP = 1.1, CEIL = 6.0;   // station box, relative to centreline / rail
  const EXIT_TO = ["Roosevelt Rd", "Taylor St", "Union Station", "Randolph St"];

  /* ---- renderer: WebGL offscreen, accumulated into the visible 2D canvas ---- */
  const gl = document.createElement("canvas");
  gl.width = width; gl.height = height;
  const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, stencil: true });   // stencil: the river cuts the ground (see below)
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  out.width = width; out.height = height;
  const ctx = out.getContext("2d");

  const scene = new THREE.Scene();
  const HAZE = new THREE.Color(0xc4d3e0), DARK = new THREE.Color(0x030506), HAZE_DENSITY = 0.00026;
  scene.background = HAZE.clone();
  scene.fog = new THREE.FogExp2(HAZE.getHex(), HAZE_DENSITY);

  /* ---- the alignment: straight legs joined by circular arcs ---- */
  const smooth = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const { plan, planStart, dir1, dirN } = buildPlan(THREE, city);
  let planLen = 0;
  const pd = plan.map((p, i) => (planLen += i ? p.distanceTo(plan[i - 1]) : 0));
  // Down at the south end, up again at the north end.
  const RAMP1 = LEAD_IN + RAMP_FROM, RAMP2 = planLen - RUNOUT - 20 - RAMP_LEN;
  const profile = (d) => -DEPTH * smooth((d - RAMP1) / RAMP_LEN) * (1 - smooth((d - RAMP2) / RAMP_LEN));
  const path = new THREE.CatmullRomCurve3(plan.map((p, i) => new THREE.Vector3(p.x, profile(pd[i]), p.y)), false, "centripetal");
  path.arcLengthDivisions = 14000;
  const LENGTH = path.getLength();
  const UP = new THREE.Vector3(0, 1, 0);
  // Point d metres along the alignment, shifted `side` metres to the right and `up` metres up.
  function at(d, side = 0, up = 0) {
    const u = Math.min(Math.max(d / LENGTH, 0), 1);
    const p = path.getPointAt(u), tan = path.getTangentAt(u);
    const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
    const b = bankAt(d);
    if (!b) return { p: p.addScaledVector(right, side).addScaledVector(UP, up), tan, right };
    // in a curve the track is canted: the cross-section leans into the turn about the centreline
    const c = Math.cos(b), sn = Math.sin(b);
    const r2 = right.clone().multiplyScalar(c).addScaledVector(UP, sn), u2 = UP.clone().multiplyScalar(c).addScaledVector(right, -sn);
    return { p: p.addScaledVector(r2, side).addScaledVector(u2, up), tan, right: r2 };
  }
  // Bank (radians, positive in a left-hand curve) from the alignment's curvature,
  // eased in and out over a train length or so. Assumed: about 1.5 degrees per 1/1000 m of curvature, 5.5 degrees at most.
  const BANK_STEP = 2, BANK_GAIN = 27, BANK_MAX = 0.095;
  const bankTable = (() => {
    const n = Math.ceil(LENGTH / BANK_STEP) + 1, k = new Float32Array(n);
    let t0 = path.getTangentAt(0);
    for (let i = 1; i < n; i++) {
      const t1 = path.getTangentAt(Math.min((i * BANK_STEP) / LENGTH, 1));
      k[i] = Math.asin(Math.max(-1, Math.min(1, t0.z * t1.x - t0.x * t1.z))) / BANK_STEP;   // signed curvature, + to the left
      t0 = t1;
    }
    let a = k;
    for (let pass = 0; pass < 2; pass++) {                        // two box blurs: a smooth run-in and run-out
      const o = new Float32Array(n), W = 14;
      for (let i = 0; i < n; i++) { let sum = 0; for (let j = -W; j <= W; j++) sum += a[Math.min(Math.max(i + j, 0), n - 1)]; o[i] = sum / (2 * W + 1); }
      a = o;
    }
    return a.map((v) => Math.max(-BANK_MAX, Math.min(BANK_MAX, v * BANK_GAIN)));
  })();
  function bankAt(d) {
    const f = Math.min(Math.max(d / BANK_STEP, 0), bankTable.length - 1.001), i = Math.floor(f);
    return bankTable[i] + (bankTable[i + 1] - bankTable[i]) * (f - i);
  }
  // Landmarks along the alignment, found by sampling it.
  let PORTAL = 0, PORTAL2 = 0, RAMP_START = 0, RAMP_END = 0;
  // the repo's data calls it "Union Station (West)"; signs and the map say just "Union Station"
  const STN = city.stations.map((s, i) => ({ name: s.name.replace(" (West)", ""), exitTo: EXIT_TO[i] || "Street", x: s.x, z: s.z, d: 0, best: Infinity }));
  // Chicago/Halsted: the X1's next stop, in the open beyond the north portal (its position is the CrossTowner GTFS's)
  const CH = { name: "Chicago/Halsted", exitTo: "Chicago Ave & Halsted St", outdoor: true, d: 0, best: Infinity,
    x: (-87.647364 - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z: (city.origin[1] - 41.895754) * 111070 };
  const ALL = [...STN, CH];                                       // STN: the four underground; ALL: every stop in the film
  for (let d = 0; d < LENGTH; d += 0.5) {
    const p = path.getPointAt(d / LENGTH);
    if (p.y < -0.02) { if (!RAMP_START) RAMP_START = d; RAMP_END = d; }
    if (p.y + CY + R < -0.7) { if (!PORTAL) PORTAL = d; PORTAL2 = d; }   // bore roof safely below the ground
    for (const S of ALL) { const k = Math.hypot(p.x - S.x, p.z - S.z); if (k < S.best) { S.best = k; S.d = d; } }
  }
  for (const S of STN) {
    S.stop = S.d - 6;                                             // where the cab stops
    // The platform runs from a little behind the tail of the stopped train to 40 m ahead of the cab.
    // The crowd keeps to the stretch it stood on before the platforms were lengthened to the train (crowdFrom).
    S.platFrom = S.stop + NOSE - TRAIN_LONG - 4; S.platTo = S.d + 34; S.crowdFrom = S.d + 34 - 95;
    S.boxFrom = S.platFrom - 6; S.boxTo = S.platTo + 6;
  }
  CH.stop = CH.d - 6; CH.platFrom = CH.stop + NOSE - TRAIN_LONG - 4; CH.platTo = CH.d + 62; CH.crowdFrom = CH.d - 48;   // its platforms run on under the Halsted St viaduct
  const MAP_END = LENGTH - (RUNOUT - FILM_RUNOUT);        // under the Chicago/Halsted viaducts
  const START = 6, END = Math.min(CH.stop + 150, LENGTH - 60);   // the film ends as the train pulls away under them
  const subCurve = (d0, d1, side, up, step = 2) => {
    const c = [];
    for (let d = d0; d < d1; d += step) c.push(at(d, side, up).p);
    c.push(at(d1, side, up).p);
    return new THREE.CatmullRomCurve3(c);
  };
  // A straight railway corridor on the surface: an origin, a direction, a length and two edges.
  const corridor = (o, dir, len, latL, latR) => ({
    len, latL, latR, dir3: new THREE.Vector3(dir.x, 0, dir.y),
    pt: (s, lat, up = 0) => new THREE.Vector3(o.x + dir.x * s - dir.y * lat, up, o.y + dir.y * s + dir.x * lat),   // lat > 0 is to the right
    has: (x, z, m) => {
      const rx = x - o.x, rz = z - o.y, s = rx * dir.x + rz * dir.y, lat = -rx * dir.y + rz * dir.x;
      return s > -20 && s < len + 20 && lat > latL - m && lat < latR + m;
    },
    outline() {
      const c = [];
      for (let s = 0; s <= len; s += 20) { const p = this.pt(s, latL); c.push(V2(p.x, -p.z)); }
      for (let s = len; s >= 0; s -= 20) { const p = this.pt(s, latR); c.push(V2(p.x, -p.z)); }
      return c;
    },
  });
  // South: the Metra Electric, carried straight on past the first curve. North: the tracks the line joins.
  const SOUTH = corridor(planStart, dir1, LEAD_IN + 740, -20, 19.5);
  const northFrom = PORTAL2 - 40, nf = at(northFrom).p;
  const NORTH = corridor(V2(nf.x, nf.z), dirN, LENGTH - northFrom, -15, 15);
  const nearRailway = (x, z, m) => SOUTH.has(x, z, m) || NORTH.has(x, z, m);

  /* ---- sky (the dome is kept centred on whichever camera is in use: see drawScene) ---- */
  let sky;
  {
    const g = new THREE.SphereGeometry(7000, 24, 12);
    const c = new Float32Array(g.attributes.position.count * 3);
    const top = new THREE.Color(0x4f8fd6), midc = new THREE.Color(0xa9c8e6), col = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const h = Math.max(0, g.attributes.position.getY(i) / 7000);
      col.copy(HAZE).lerp(midc, smooth(h * 6)).lerp(top, smooth(h * 1.4));
      c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    scene.add(sky);
  }

  /* ---- ground: each railway corridor is cut out and filled with ballast a
          little lower, so the track sits on it; the ballast is slotted for the ramp ---- */
  // The river and the lake lie below the streets. Their outlines are first drawn at street level into the
  // stencil buffer only (renderOrder -1, no colour); the ground and the parks are then not drawn where it is set,
  // which leaves a hole down to the water and its banks. The streets ignore it, so the bridges carry on across.
  const BELOW_RIVER = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc };
  const flatShape = (outline, y, color, holes = [], extra = {}) => {
    const s = new THREE.Shape(outline);
    holes.forEach((h) => s.holes.push(new THREE.Path(h)));
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, ...extra })));
  };
  const trenchOutline = (d0, d1) => {
    const c = [];
    for (let d = d0; d <= d1; d += 4) { const p = at(d, -TRENCH).p; c.push(V2(p.x, -p.z)); }
    for (let d = d1; d >= d0; d -= 4) { const p = at(d, TRENCH).p; c.push(V2(p.x, -p.z)); }
    return c;
  };
  const TRENCH1 = [RAMP_START - 2, PORTAL], TRENCH2 = [PORTAL2, RAMP_END + 2];
  flatShape([V2(-12000, -9000), V2(9000, -9000), V2(9000, 12000), V2(-12000, 12000)], 0, 0x8d928c, [SOUTH.outline(), NORTH.outline()], BELOW_RIVER);
  flatShape(SOUTH.outline(), -0.16, 0x6b6660, [trenchOutline(...TRENCH1)]);
  flatShape(NORTH.outline(), -0.16, 0x6b6660, [trenchOutline(...TRENCH2)]);

  /* ---- water and parks: flat polygons, kept clear of the railway ---- */
  const flatPolys = (list, y, color, material = null) => {
    const pos = [];
    for (const p of list) {
      const contour = [];
      for (let i = 0; i < p.length - 2; i += 2) contour.push(V2(p[i], p[i + 1]));   // drop the closing point
      if (contour.length < 3) continue;
      for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) {
        const v = t.map((k) => contour[k]);
        if (v.some((q) => nearRailway(q.x, q.y, 2)) || nearRailway((v[0].x + v[1].x + v[2].x) / 3, (v[0].y + v[1].y + v[2].y) / 3, 2)) continue;
        for (const q of v) pos.push(q.x, y, q.y);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.Mesh(g, material || new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    scene.add(m); return m;
  };
  flatPolys(city.parks, 0.02, 0, new THREE.MeshBasicMaterial({ color: 0x7fa56a, side: THREE.DoubleSide, ...BELOW_RIVER }));
  // The water, 8 ft (2.44 m) below the street, with a wall down to it along every bank
  const RIVER_DOWN = 2.44;
  flatPolys(city.water, -RIVER_DOWN, 0x5d8fc0);
  flatPolys(city.water, 0, 0, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, colorWrite: false, depthWrite: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp })).renderOrder = -1;
  {
    // The water comes in pieces, cut at map-tile edges and overlapping a little there. A bank is an edge with
    // land beyond it: a point just outside the edge that is in no piece of water, and not at the edge of the
    // map (where the water was simply cut off).
    const polys = city.water.map((p) => {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      return { p, box: [x0, z0, x1, z1] };
    });
    const all = polys.reduce((b, q) => [Math.min(b[0], q.box[0]), Math.min(b[1], q.box[1]), Math.max(b[2], q.box[2]), Math.max(b[3], q.box[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    const inPoly = (x, z, q) => {
      if (x < q.box[0] || x > q.box[2] || z < q.box[1] || z > q.box[3]) return false;
      let hit = false;
      for (let i = 0, j = q.p.length - 2; i < q.p.length; j = i, i += 2) {
        const ax = q.p[i], az = q.p[i + 1], bx = q.p[j], bz = q.p[j + 1];
        if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) hit = !hit;
      }
      return hit;
    };
    const wet = (x, z) => polys.some((q) => inPoly(x, z, q));
    const pos = [];
    for (const q of polys) for (let i = 0; i + 3 < q.p.length; i += 2) {
      const ax = q.p[i], az = q.p[i + 1], bx = q.p[i + 2], bz = q.p[i + 3], len = Math.hypot(bx - ax, bz - az);
      if (len < 0.05) continue;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, nx = (bz - az) / len, nz = -(bx - ax) / len;
      const sg = inPoly(mx + nx * 0.5, mz + nz * 0.5, q) ? -1 : 1;  // which way is out of this piece
      const ox = mx + sg * nx * 1.5, oz = mz + sg * nz * 1.5;
      if (wet(ox, oz) || ox < all[0] + 5 || ox > all[2] - 5 || oz < all[1] + 5 || oz > all[3] - 5 || nearRailway(mx, mz, 2)) continue;
      pos.push(ax, -RIVER_DOWN - 0.1, az, bx, -RIVER_DOWN - 0.1, bz, bx, 0, bz, ax, -RIVER_DOWN - 0.1, az, bx, 0, bz, ax, 0, az);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x77786f, side: THREE.DoubleSide })));
  }

  /* ---- streets: flat ribbons, as wide as their class ---- */
  {
    const pos = [], sides = [];
    for (const rd of city.roads || []) {
      for (let i = 0; i + 3 < rd.p.length; i += 2) {
        const x0 = rd.p[i], z0 = rd.p[i + 1], x1 = rd.p[i + 2], z1 = rd.p[i + 3], len = Math.hypot(x1 - x0, z1 - z0);
        if (len < 0.5 || nearRailway((x0 + x1) / 2, (z0 + z1) / 2, 3)) continue;   // the railway passes under them
        const nx = (z1 - z0) / len * rd.w / 2, nz = -(x1 - x0) / len * rd.w / 2, e = rd.w * 0.4 / len;   // run on a little so corners close
        const ax = x0 - (x1 - x0) * e, az = z0 - (z1 - z0) * e, bx = x1 + (x1 - x0) * e, bz = z1 + (z1 - z0) * e;
        const y = 0.012;
        pos.push(ax - nx, y, az - nz, ax + nx, y, az + nz, bx + nx, y, bz + nz,
                 ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
        if (rd.b) for (const k of [-1, 1]) {                // a bridge: its girders' faces, down toward the water
          const px = ax + k * nx, pz = az + k * nz, qx = bx + k * nx, qz = bz + k * nz;
          sides.push(px, -1.1, pz, qx, -1.1, qz, qx, y, qz, px, -1.1, pz, qx, y, qz, px, y, pz);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x5c6063, side: THREE.DoubleSide })));
    const gs = new THREE.BufferGeometry();
    gs.setAttribute("position", new THREE.Float32BufferAttribute(sides, 3));
    scene.add(new THREE.Mesh(gs, new THREE.MeshBasicMaterial({ color: 0x3e4245, side: THREE.DoubleSide })));
  }

  let ballysSite = null;                                  // set once the casino is built, for its signs
  /* ---- buildings: real footprints and parts at their real heights, in their
          real colours where OpenStreetMap or the landmark list has them ---- */
  {
    const SUN = new THREE.Vector3(0.42, 0.78, 0.46).normalize();   // from the south-east, high
    const BAY = 3.6, FLOOR = 3.4;                         // metres per window bay and per storey
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    // ordinary buildings with no colour of their own: brick and stone for the city's lofts and flats, paler sheds
    const BRICK = [[0.66, 0.40, 0.30], [0.58, 0.35, 0.28], [0.72, 0.50, 0.36], [0.80, 0.72, 0.60], [0.74, 0.70, 0.66], [0.52, 0.34, 0.28], [0.84, 0.80, 0.74]];
    const SHED = [[0.83, 0.80, 0.74], [0.72, 0.70, 0.67], [0.66, 0.48, 0.38], [0.78, 0.76, 0.72], [0.58, 0.42, 0.34]];
    const PALETTE = [[0.80, 0.74, 0.64], [0.68, 0.63, 0.58], [0.74, 0.54, 0.42], [0.62, 0.65, 0.68], [0.86, 0.83, 0.76], [0.60, 0.46, 0.38]];
    const GLASS = [[0.50, 0.62, 0.76], [0.42, 0.52, 0.64], [0.62, 0.70, 0.78], [0.36, 0.44, 0.54], [0.70, 0.66, 0.60]];
    const STONE = [0.90, 0.86, 0.76], STEEL = [0.74, 0.78, 0.82];
    // One small repeating texture per kind of facade, tinted by the building's
    // colour. In each, the bottom-left corner is plain: roofs and blank walls use it.
    const TEX = 128;                                      // facade textures are TEX x TEX: one window bay wide, one storey tall
    const FACADES = {
      p: (c) => {                                         // masonry with a pair of punched windows
        c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, 128, 128);
        for (const x of [16, 74]) {
          c.fillStyle = "#e0dcd3"; c.fillRect(x - 2, 22, 42, 6); c.fillStyle = "#cfcac0"; c.fillRect(x - 3, 92, 44, 5);   // lintel, sill
          c.fillStyle = "#4f6074"; c.fillRect(x, 28, 38, 64); c.fillStyle = "#8296ab"; c.fillRect(x, 28, 38, 20);
          c.fillStyle = "#e9e6e0"; c.fillRect(x + 18, 28, 2, 64); c.fillRect(x, 58, 38, 2);
        }
      },
      b: (c) => {                                         // brick loft: one wide industrial window of many panes
        c.fillStyle = "#f1ede7"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#e6e1da"; for (let y = 6; y < 128; y += 10) c.fillRect(0, y, 128, 1);
        c.fillStyle = "#d8d2c8"; c.fillRect(12, 18, 104, 6); c.fillRect(10, 98, 108, 6);
        c.fillStyle = "#465463"; c.fillRect(14, 24, 100, 74); c.fillStyle = "#73869a"; c.fillRect(14, 24, 100, 24);
        c.fillStyle = "#c3c9ce"; for (let x = 14; x <= 114; x += 20) c.fillRect(x - 1, 24, 2, 74); for (let y = 24; y <= 98; y += 18.5) c.fillRect(14, y - 1, 100, 2);
      },
      w: (c) => {                                         // low warehouse: panel seams and a small high window
        c.fillStyle = "#f2f0eb"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#e3e0d9"; c.fillRect(126, 0, 2, 128); c.fillRect(0, 0, 128, 5);
        c.fillStyle = "#566575"; c.fillRect(40, 26, 50, 22); c.fillStyle = "#e9e6e0"; c.fillRect(64, 26, 2, 22);
      },
      g: (c) => {                                         // street level: shopfront glass between piers, under a sign band
        c.fillStyle = "#f0ede8"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#dcd8cf"; c.fillRect(0, 0, 128, 26);
        c.fillStyle = "#3f4d5c"; c.fillRect(14, 26, 104, 90); c.fillStyle = "#6f8194"; c.fillRect(14, 26, 104, 22);
        c.fillStyle = "#d9dde0"; c.fillRect(64, 26, 2, 90);
      },
      f: (c) => {                                         // tall metal fins of uneven widths, unbroken from storey to storey
        c.fillStyle = "#f7f7f5"; c.fillRect(0, 0, 128, 128);
        [[6, 3, "#d2d6d9"], [20, 2, "#e0e3e5"], [27, 4, "#c9ced2"], [45, 2, "#dadde0"], [58, 3, "#d0d4d8"], [71, 2, "#e2e4e6"],
          [90, 4, "#cbd0d4"], [97, 2, "#dde0e2"], [113, 3, "#d3d7da"]].forEach(([x, w, col]) => { c.fillStyle = col; c.fillRect(x, 0, w, 128); });
      },
      c: (c) => { c.fillStyle = "#f3f7fb"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#d3dde7"; c.fillRect(0, 0, 128, 24); c.fillStyle = "#bcc8d4"; c.fillRect(120, 0, 8, 128); c.fillRect(58, 0, 4, 128); },   // glass curtain wall
      r: (c) => { c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#566a82"; c.fillRect(0, 20, 128, 60); c.fillStyle = "#7f93a8"; c.fillRect(0, 20, 128, 14); },    // ribbon windows
      v: (c) => { c.fillStyle = "#56677c"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#7f93a8"; c.fillRect(0, 0, 128, 20); c.fillStyle = "#f6f4f0"; c.fillRect(0, 0, 48, 128); },    // vertical piers
      d: (c) => { c.fillStyle = "#e9edf0"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#8f98a2"; c.fillRect(118, 0, 10, 128); c.fillRect(0, 0, 128, 12); },                             // dark metal grid
      s: (c) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#e6e2da"; c.fillRect(0, 0, 128, 4); },                                                           // plain stone
      m: (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#9aa6b2"; c.fillRect(0, 0, 128, 3); c.fillRect(0, 0, 2, 128); c.fillRect(64, 0, 1, 128); },     // mirror glass: only thin mullions (the reflection is the material's: see below)
    };
    // Mirror glass reflects a painted surround: sky above, the haze at the horizon, the city below it.
    // Tinted by the building's colour, so blue glass gives back a blue sky.
    const mirrorGlass = (tex) => {
      const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
      const c = cv.getContext("2d"), g = c.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#3d7fd0"); g.addColorStop(0.36, "#9cc2e8"); g.addColorStop(0.5, "#e8eef3"); g.addColorStop(0.53, "#8a929a"); g.addColorStop(1, "#3c4248");
      c.fillStyle = g; c.fillRect(0, 0, 256, 128);
      for (let x = 0; x < 256; x += 3) { const h = 2 + 9 * ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; c.fillStyle = "rgba(70,78,88,0.55)"; c.fillRect(x, 64 - h, 3, h); }   // other towers, on the horizon
      const env = new THREE.CanvasTexture(cv);
      env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, metalness: 0.9, roughness: 0.08, envMap: env, envMapIntensity: 1.6, side: THREE.DoubleSide });
    };
    const groups = {};
    for (const k of Object.keys(FACADES)) groups[k] = { pos: [], col: [], uvs: [] };
    // Extrude one closed ring from y0 to y1 into facade group f. `windows` maps
    // the facade texture on; `apex` (a height) closes the top as a pyramid instead of flat.
    const extrude = (f, p, y0, y1, c, windows, apex = 0) => {
      const G = groups[f];
      const push = (v, k, u = 0.02, w = 0.02) => { G.pos.push(v[0], v[1], v[2]); G.col.push(c[0] * k, c[1] * k, c[2] * k); G.uvs.push(u, w); };
      const n = p.length / 2 - 1;                         // ring is closed: last point repeats the first
      const glassy = f === "c" || f === "d" || f === "r" || f === "v" || f === "g" || f === "m";
      let cx = 0, cz = 0;
      for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
      for (let i = 0; i < n; i++) {
        const x0 = p[i * 2], z0 = p[i * 2 + 1], x1 = p[i * 2 + 2], z1 = p[i * 2 + 3];
        const len = Math.hypot(x1 - x0, z1 - z0);
        if (len < 0.05) continue;
        const nx = (z1 - z0) / len, nz = -(x1 - x0) / len;
        const lit = 0.58 + 0.42 * Math.max(0, nx * SUN.x + nz * SUN.z);
        // darker toward the street; tall glass also picks up more sky toward the top
        const lo = lit * (glassy && y1 - y0 > 40 ? 0.74 : 0.82), hi = lit * (glassy && y1 - y0 > 40 ? 1.05 : 1);
        const A = [x0, y0, z0], B = [x1, y0, z1], C = [x1, y1, z1], D = [x0, y1, z0];
        if (windows) {
          const u1 = Math.max(1, Math.round(len / BAY)), v0 = Math.round(y0 / FLOOR), v1 = Math.max(v0 + 1, Math.round(y1 / FLOOR));
          push(A, lo, 0, v0); push(B, lo, u1, v0); push(C, hi, u1, v1);
          push(A, lo, 0, v0); push(C, hi, u1, v1); push(D, hi, 0, v1);
        } else {
          push(A, lo); push(B, lo); push(C, hi);
          push(A, lo); push(C, hi); push(D, hi);
        }
        if (apex) { push(D, lit * 0.95); push(C, lit * 0.95); push([cx, apex, cz], lit * 1.05); }
      }
      if (apex) return;
      const contour = [];
      for (let i = 0; i < n; i++) contour.push(V2(p[i * 2], p[i * 2 + 1]));
      for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) for (const k of t) push([contour[k].x, y1, contour[k].y], 1.08);
    };
    const shrink = (p, k) => {                            // a ring pulled toward its centre
      const n = p.length / 2 - 1; let cx = 0, cz = 0;
      for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
      return p.map((v, i) => (i % 2 ? cz : cx) + (v - (i % 2 ? cz : cx)) * k);
    };
    // Soldier Field sits east of the tracks just south of the route's start.
    // Its parts get stone and steel, and the two long, narrow ones become its colonnades.
    const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070;
    const SF = V2((-87.6167 - city.origin[0]) * KX, -(41.8623 - city.origin[1]) * KY);
    const columns = [];
    // The casino and its hotel tower, massed from the renderings on the City's permanent-casino page:
    // a long hall clad in white fins over a glass base with a copper band, a glass drum at the
    // Chicago Ave corner, and a blue glass hotel tower (about 500 ft) at the south end by the river.
    const BALLYS = V2(-2100, -3450);                      // a point inside the old plant's footprint (local metres)
    const ballys = (p, x0, z0) => {
      const COPPER = [0.80, 0.52, 0.32], WHITE = [0.97, 0.97, 0.96];
      extrude("c", p, 0, 8.5, [0.86, 0.72, 0.56], true);          // warm-lit glass at street level
      extrude("s", shrink(p, 1.012), 8.5, 10.5, COPPER, false);
      extrude("f", p, 10.5, 26, WHITE, true);
      extrude("s", shrink(p, 1.008), 26, 27, COPPER.map((v) => v * 1.1), false);
      extrude("s", shrink(p, 0.8), 27, 30, [0.86, 0.87, 0.88], false);
      const ringAt = (cx, cz, r, n) => { const q = []; for (let i = 0; i <= n; i++) { const a = -(i % n) / n * Math.PI * 2; q.push(cx + r * Math.cos(a), cz + r * Math.sin(a)); } return q; };
      extrude("v", ringAt(x0 + 12, z0 + 14, 11, 24), 0, 31, [0.90, 0.76, 0.58], true);     // the drum at the corner
      extrude("s", ringAt(x0 + 12, z0 + 14, 11.6, 24), 31, 32.2, COPPER, false);
      // the hotel: a slab parallel to the river and the tracks, with a taller crown set in from its ends
      const ux = -0.598, uz = -0.802, rx = 0.802, rz = -0.598, cx = BALLYS.x + 60, cz = BALLYS.y + 147;
      const slab = (hl, hw) => { const q = []; for (const [a, b2] of [[-1, -1], [-1, 1], [1, 1], [1, -1], [-1, -1]]) q.push(cx + ux * hl * a + rx * hw * b2, cz + uz * hl * a + rz * hw * b2); return q; };
      const BLUE = [0.26, 0.48, 0.92];                               // blue mirror glass, all the way up
      extrude("m", slab(29, 13), 0, 141, BLUE, true);
      extrude("m", slab(22, 11), 141, 152, BLUE.map((v) => v * 1.05), true);
      extrude("s", slab(34, 19), 0, 9, [0.80, 0.70, 0.58], false);     // its porte-cochere base
      ballysSite = { x0, z0 };
    };
    city.buildings.forEach((b, k) => {
      const bi = b.i === undefined ? k : b.i;            // its number in the film's first city file, so its colour stays the same in a wider one
      const n = b.p.length / 2 - 1;
      if (n < 3) return;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, area = 0;
      for (let i = 0; i < n; i++) {
        const x = b.p[i * 2], z = b.p[i * 2 + 1];
        if (nearRailway(x, z, 1)) return;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
        area += x * b.p[i * 2 + 3] - b.p[i * 2 + 2] * z;
      }
      area = Math.abs(area) / 2;
      const w = x1 - x0, l = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (((cx - SF.x) / 160) ** 2 + ((cz - SF.y) / 205) ** 2 < 1 && b.h >= 20) {
        if (b.h <= 30 && w < 30 && l > 90) {              // a colonnade: plinth, columns, entablature
          extrude("s", b.p, 0, 19, STONE, false);
          extrude("s", b.p, 29, 31.5, STONE, false);
          for (let z = z0 + 3; z < z1 - 2; z += 4.2) for (const f of [0.28, 0.72]) columns.push([x0 + w * f, z]);
        } else {
          extrude("s", b.p, b.m, b.h, b.h >= 50 ? STEEL : STONE, false);
        }
        return;
      }
      // Bally's Chicago (under construction on the old Tribune printing plant's site, east of the
      // tracks south of Chicago Ave) stands in for whatever OpenStreetMap still has there.
      if (BALLYS.x > x0 && BALLYS.x < x1 && BALLYS.y > z0 && BALLYS.y < z1) {
        if (area > 15000) { ballys(b.p, x0, z0); }
        return;
      }
      // colour and facade: the building's own, or a plausible one for its size
      const hgt = b.h - b.m, tall = b.h > 70, low = hgt <= 7.5, tone = 0.92 + 0.16 * hash(bi + 0.5);
      const pal = tall ? GLASS : low ? SHED : BRICK;
      const base = b.c || pal[Math.floor(hash(bi) * pal.length)];
      const f = b.f || (tall ? (hash(bi + 0.3) < 0.5 ? "c" : "r") : low ? "w" : (area > 600 && hash(bi + 0.3) < 0.45 ? "b" : "p"));
      const c = base.map((v) => v * (b.c ? 0.96 + 0.08 * hash(bi + 0.5) : tone));
      if (!b.c && !tall && !low && !b.pt && !b.rs) {       // an ordinary mid-rise: shopfronts, upper floors, a parapet, roof plant
        const shop = b.m === 0 && hgt > 9 && hash(bi + 0.9) < 0.7 ? 4.2 : 0;
        if (shop) extrude("g", b.p, 0, shop, c.map((v) => v * 0.86), true);
        extrude(f, b.p, b.m + shop, b.h, c, true);
        extrude("s", b.p, b.h, b.h + 0.8, c.map((v) => v * 0.9), false);
        if (area > 250 && hgt > 10) {
          const k = 0.22 + 0.14 * hash(bi + 0.7), sx = (hash(bi + 1.3) - 0.5) * w * 0.3, sz = (hash(bi + 1.7) - 0.5) * l * 0.3;
          extrude("s", shrink(b.p, k).map((v, i) => v + (i % 2 ? sz : sx)), b.h + 0.8, b.h + 3.2 + 1.5 * hash(bi + 2.1), [0.62, 0.64, 0.66], false);
        }
        return;
      }
      const pointed = b.rs && /pyramid|hipped|dome|round|onion|cone|gabled|mansard/.test(b.rs);
      if (pointed) {
        const rh = Math.min(b.rh || Math.min(w, l) * 0.4, (b.h - b.m) * 0.6);
        extrude(f, b.p, b.m, b.h - rh, c, f !== "s", b.h);
      } else {
        extrude(f, b.p, b.m, b.h, c, f !== "s");
        // a rooftop plant room on big flat roofs that OSM hasn't modelled in parts
        if (!b.pt && b.h > 45 && area > 500) extrude("s", shrink(b.p, 0.42), b.h, b.h + 4 + 3 * hash(bi + 0.7), c.map((v) => v * 0.72), false);
      }
      if (b.a) for (const dx of [-6, 6]) {                 // antenna masts
        const q = [cx + dx - 0.7, cz - 0.7, cx + dx + 0.7, cz - 0.7, cx + dx + 0.7, cz + 0.7, cx + dx - 0.7, cz + 0.7, cx + dx - 0.7, cz - 0.7];
        extrude("s", q, b.h, b.h + b.a * (dx < 0 ? 1 : 0.92), [0.95, 0.95, 0.96], false);
      }
    });
    for (const [k, G] of Object.entries(groups)) {
      if (!G.pos.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
      const [cv, c] = hiCanvas(TEX, TEX);
      FACADES[k](c);
      const tex = new THREE.CanvasTexture(cv);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      scene.add(new THREE.Mesh(g, k === "m" ? mirrorGlass(tex) : new THREE.MeshBasicMaterial({ vertexColors: true, map: tex, side: THREE.DoubleSide })));
    }
    if (columns.length) {
      const cols = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.85, 0.95, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xd9d2bd }), columns.length);
      const o = new THREE.Object3D();
      columns.forEach((c, i) => { o.position.set(c[0], 24, c[1]); o.updateMatrix(); cols.setMatrixAt(i, o.matrix); });
      scene.add(cols);
    }
  }

  /* ---- track: bed, rails, ties ---- */
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 1, side: THREE.DoubleSide });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: 0.3, metalness: 0.5,
    emissive: 0x39424a, emissiveIntensity: 0.45 });
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 1 });
  const ribbon = (sample, n, mat) => {                    // sample(i) -> [Vector3, Vector3]
    const pos = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const [l, r] = sample(i);
      pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); scene.add(m); return m;
  };
  // A ribbon along the alignment between d0 and d1, from (sideA, upA) to (sideB, upB).
  const along = (d0, d1, sideA, upA, sideB, upB, mat, step = 3) => {
    const n = Math.max(1, Math.ceil((d1 - d0) / step));
    return ribbon((i) => { const d = d0 + (i / n) * (d1 - d0); return [at(d, sideA, upA).p, at(d, sideB, upB).p]; }, n, mat);
  };
  const dummy = new THREE.Object3D();
  const setInst = (mesh, i, p, tan, roll = 0) => {
    dummy.position.copy(p); dummy.lookAt(p.clone().add(tan));
    if (roll) dummy.rotateOnWorldAxis(tan, -roll);                // lean with the banked track
    dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
  };
  const place = (mesh, i, d, side, up) => { const q = at(d, side, up); setInst(mesh, i, q.p, q.tan, bankAt(d)); };
  // ours: two tracks. The bed is as wide as a ramp outside, and as wide as the bore inside.
  along(0, PORTAL, -TRENCH + 0.05, -0.12, TRENCH - 0.05, -0.12, bedMat);
  along(PORTAL, PORTAL2, -BED, -0.12, BED, -0.12, bedMat);
  along(PORTAL2, LENGTH, -TRENCH + 0.05, -0.12, TRENCH - 0.05, -0.12, bedMat);
  // Ties and ballast only where the line shares the surface with the existing railways. From the top
  // of one ramp to the top of the other it is slab track (direct fixation): each rail sits on fasteners
  // on a continuous concrete plinth, with no ties, and a drain runs down the middle of the slab.
  const tieAt = [];
  for (let i = 0; i < Math.floor(LENGTH / TIE_EVERY); i++) { const d = i * TIE_EVERY; if (d < RAMP_START || d > RAMP_END) tieAt.push(d); }
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.14, 0.24), tieMat, tieAt.length * 2);
  const FIX_EVERY = 0.75, fixAt = [];
  for (let d = RAMP_START; d <= RAMP_END; d += FIX_EVERY) fixAt.push(d);
  const fixings = new THREE.InstancedMesh(new THREE.BoxGeometry(0.36, 0.05, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x2f3336, roughness: 0.7, metalness: 0.3 }), fixAt.length * 4);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x8b8f8c, roughness: 0.95, side: THREE.DoubleSide });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xa9adaa, roughness: 0.9, side: THREE.DoubleSide });
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x2a2c2d, roughness: 1, side: THREE.DoubleSide });
  const slabSpans = [[RAMP_START, PORTAL, TRENCH - 0.05], [PORTAL, PORTAL2, BED], [PORTAL2, RAMP_END, TRENCH - 0.05]];
  for (const [d0, d1, half] of slabSpans) {
    along(d0, d1, -half, -0.1, half, -0.1, slabMat);
    along(d0, d1, -0.22, -0.085, 0.22, -0.085, drainMat);
  }
  [-OFF, OFF].forEach((c, k) => {
    [-0.7175, 0.7175].forEach((s, j) => {
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(subCurve(0, LENGTH, c + s, 0.1, 3), Math.ceil(LENGTH / 3), 0.055, 6, false), railMat));
      for (const [d0, d1] of slabSpans) {
        along(d0, d1, c + s - 0.3, 0.02, c + s + 0.3, 0.02, plinthMat);                 // plinth top...
        for (const e of [-0.3, 0.3]) along(d0, d1, c + s + e, -0.1, c + s + e, 0.02, plinthMat);   // ...and its sides
      }
      fixAt.forEach((d, i) => place(fixings, (k * 2 + j) * fixAt.length + i, d, c + s, 0.045));
    });
    tieAt.forEach((d, i) => place(ties, k * tieAt.length + i, d, c, -0.04));
  });
  scene.add(ties, fixings);

  /* ---- the other tracks on the surface, and (in the south) the overhead wires ---- */
  const steel = new THREE.MeshStandardMaterial({ color: 0x59605f, roughness: 0.8, metalness: 0.3 });
  const surfaceTracks = (cor, lats, wires) => {
    const n = Math.floor(cor.len / TIE_EVERY);
    const t = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.14, 0.24), tieMat, n * lats.length);
    lats.forEach((lat, k) => {
      for (const s of [-0.7175, 0.7175]) {
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(cor.pt(0, lat + s, 0.1), cor.pt(cor.len, lat + s, 0.1)), 8, 0.055, 6, false), railMat));
      }
      for (let i = 0; i < n; i++) setInst(t, k * n + i, cor.pt(i * TIE_EVERY, lat, -0.04), cor.dir3);
    });
    scene.add(t);
    if (!wires) return;
    const spans = [];
    for (let s = 15; s < cor.len; s += 46) spans.push(s);
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 8.2, 0.28), steel, spans.length * 2);
    const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(cor.latR - cor.latL + 0.4, 0.3, 0.3), steel, spans.length);
    spans.forEach((s, i) => {
      setInst(posts, i * 2, cor.pt(s, cor.latL + 0.5, 4.1), cor.dir3);
      setInst(posts, i * 2 + 1, cor.pt(s, cor.latR - 0.5, 4.1), cor.dir3);
      setInst(beams, i, cor.pt(s, (cor.latL + cor.latR) / 2, 7.9), cor.dir3);
    });
    scene.add(posts, beams);
    const wire = [];
    const seg = (p, q) => wire.push(p.x, p.y, p.z, q.x, q.y, q.z);
    lats.forEach((lat) => { seg(cor.pt(0, lat, 5.7), cor.pt(cor.len, lat, 5.7)); seg(cor.pt(0, lat, 6.9), cor.pt(cor.len, lat, 6.9)); });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(wire, 3));
    scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x2c3030 })));
  };
  surfaceTracks(SOUTH, [-15.5, -11, 11, 15.5], true);   // the Metra Electric is electrified
  surfaceTracks(NORTH, [-10.5, 10.5], false);

  /* ---- our own overhead line, the whole way: a contact wire in the open,
          following the track down the ramps, and a rigid conductor rail hung
          from the roof underground (assumed, like the tunnel itself) ---- */
  {
    const WIRE_OUT = 5.7, WIRE_IN = 5.3;                          // contact height above the rail: open air, tunnel
    const wireUp = (d) => WIRE_OUT - (WIRE_OUT - WIRE_IN) *
      smooth((d - RAMP_START) / (PORTAL - RAMP_START)) * (1 - smooth((d - PORTAL2) / (RAMP_END - PORTAL2)));
    const wireCurve = (d0, d1, c) => {
      const pts = [];
      for (let d = d0; d < d1; d += 3) pts.push(at(d, c, wireUp(d)).p);
      pts.push(at(d1, c, wireUp(d1)).p);
      return new THREE.CatmullRomCurve3(pts);
    };
    const copper = new THREE.MeshBasicMaterial({ color: 0x2c3030 });
    const railBar = new THREE.MeshStandardMaterial({ color: 0xaab2b4, roughness: 0.45, metalness: 0.6,
      emissive: 0xaab2b4, emissiveIntensity: 0.12 });
    for (const c of [-OFF, OFF]) {
      for (const [d0, d1] of [[0, PORTAL], [PORTAL2, LENGTH]]) {
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve(d0, d1, c), Math.ceil((d1 - d0) / 3), 0.022, 5, false), copper));
      }
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve(PORTAL, PORTAL2, c), Math.ceil((PORTAL2 - PORTAL) / 3), 0.06, 6, false), railBar));
    }
    // An upright box from `lo` to `hi` above the rail (a hanger, a dropper or a post).
    const upright = (mesh, i, d, side, lo, hi) => {
      const q = at(d, side, (lo + hi) / 2);
      dummy.scale.set(1, hi - lo, 1); setInst(mesh, i, q.p, q.tan, bankAt(d)); dummy.scale.set(1, 1, 1);
    };
    // underground: a hanger from the roof (or a station's ceiling) to each conductor rail, between the lamps
    const BORE_ROOF = CY + Math.sqrt(R * R - OFF * OFF) - 0.05;
    const hang = [];
    for (let d = Math.ceil(PORTAL / LIGHT_EVERY) * LIGHT_EVERY + LIGHT_EVERY / 2; d < PORTAL2; d += LIGHT_EVERY) hang.push(d);
    const hangers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 1, 0.09), steel, hang.length * 2);
    const clamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.16, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x7a3b2a, roughness: 0.7 }), hang.length * 2);   // insulators
    hang.forEach((d, i) => {
      const roof = STN.some((S) => d > S.boxFrom && d < S.boxTo) ? CEIL : BORE_ROOF;
      [-OFF, OFF].forEach((c, k) => {
        upright(hangers, i * 2 + k, d, c, WIRE_IN + 0.2, roof);
        place(clamps, i * 2 + k, d, c, WIRE_IN + 0.13);
      });
    });
    scene.add(hangers, clamps);
    // in the open, beyond the Metra Electric's gantries: a frame over our two tracks,
    // on posts beside the ramp walls until the ramp is deep enough to span wall to wall
    const frames = [];
    for (let d = RAMP_START + 30; d < PORTAL - 6; d += 30) frames.push(d);
    for (let d = PORTAL2 + 12; d < LENGTH; d += 30) frames.push(d);
    const LIFT = 1.0, POST = TRENCH + 0.25;                       // beam above the wire; posts just outside the walls
    const fBeams = new THREE.InstancedMesh(new THREE.BoxGeometry(POST * 2 + 0.3, 0.26, 0.26), steel, frames.length);
    const fPosts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 1, 0.28), steel, frames.length * 2);
    const fDrops = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.07), steel, frames.length * 2);
    frames.forEach((d, i) => {
      const h = wireUp(d), ground = -at(d).p.y;                   // ground level, measured from the rail
      place(fBeams, i, d, 0, h + LIFT);
      [-1, 1].forEach((sg, k) => {
        upright(fPosts, i * 2 + k, d, sg * POST, Math.min(ground, h + LIFT - 0.01), h + LIFT);
        upright(fDrops, i * 2 + k, d, sg * OFF, h + 0.02, h + LIFT);
      });
    });
    scene.add(fBeams, fPosts, fDrops);
  }

  /* ---- the Halsted St and Chicago Ave viaducts: the two streets meet on a bridge right over the
          railway, each climbing to it on a walled ramp (heights and ramp lengths assumed) ---- */
  const VIA_DECK = 8.4, VIA_HALF = 8, VIA_HX = -2300, VIA_CZ = -3600;   // deck top above the ground, half-width; Halsted's and Chicago's centrelines in city.roads (local metres)
  {
    const DECK = VIA_DECK, DEPTH = 1.4, RAIL = 1.0, RAMP = 110;   // girder depth, parapet, ramp length
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xa9aaa2, roughness: 0.95, side: THREE.DoubleSide });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x45484b, roughness: 1, side: THREE.DoubleSide });
    const underMat = new THREE.MeshStandardMaterial({ color: 0x5b5d59, roughness: 1, side: THREE.DoubleSide });
    const HX = VIA_HX, CZ = VIA_CZ;
    // from (ax, az) to (bx, bz), at full height between distances s0 and s1 along it
    const viaduct = (ax, az, bx, bz, half, s0, s1) => {
      const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, n = Math.ceil(len / 4);
      const P = (i, lat, y) => { const s = (i / n) * len; return new THREE.Vector3(ax + ux * s - uz * lat, y, az + uz * s + ux * lat); };
      const hAt = (i) => { const s = (i / n) * len; return DECK * smooth((s - (s0 - RAMP)) / RAMP) * (1 - smooth((s - s1) / RAMP)); };
      const open = (i) => { const q = P(i, 0, 0); return NORTH.has(q.x, q.z, 5); };   // spans the railway; solid elsewhere
      ribbon((i) => [P(i, -half, hAt(i) + 0.02), P(i, half, hAt(i) + 0.02)], n, roadMat);
      ribbon((i) => [P(i, -half, Math.max(0, hAt(i) - DEPTH)), P(i, half, Math.max(0, hAt(i) - DEPTH))], n, underMat);
      for (const lat of [-half, half]) {
        ribbon((i) => [P(i, lat, open(i) ? Math.max(0, hAt(i) - DEPTH) : -0.1), P(i, lat, hAt(i) + (hAt(i) > 0.3 ? RAIL : 0))], n, wallMat);
      }
      // a pier wall each side of the railway, where the span begins and ends
      for (let i = 1; i < n; i++) if (open(i) !== open(i - 1)) ribbon((k) => [P(i, k ? half : -half, -0.1), P(i, k ? half : -half, hAt(i) - DEPTH)], 1, wallMat);
    };
    viaduct(HX, -3270, HX, -3920, VIA_HALF, 220, 420);                   // Halsted St, south to north
    viaduct(-2640, CZ, -2080, CZ, VIA_HALF, 220, 450);                   // Chicago Ave, west to east
  }

  /* ---- the ramps' retaining walls and the two portals ---- */
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa3a69f, roughness: 0.95, side: THREE.DoubleSide });
  for (const [d0, d1] of [TRENCH1, TRENCH2]) for (const side of [-TRENCH, TRENCH]) {
    const n = Math.ceil((d1 - d0) / 3);
    ribbon((i) => {
      const lo = at(d0 + (i / n) * (d1 - d0), side, -0.15).p, hi = lo.clone(); hi.y = 1.0;   // rises to a parapet above the ground
      return [lo, hi];
    }, n, concrete);
  }
  // A wall across the line with the bore cut out of it, facing along the track.
  const boreWall = (d, halfW, bottom, top, mat, clipWorldY = null) => {
    const s = new THREE.Shape([V2(-halfW, bottom), V2(halfW, bottom), V2(halfW, top), V2(-halfW, top)]);
    const hole = new THREE.Path(); hole.absarc(0, CY, R - 0.04, 0, Math.PI * 2, true); s.holes.push(hole);
    const q = at(d);
    const g = new THREE.ShapeGeometry(s, 48);
    if (clipWorldY !== null) {
      const p = g.attributes.position, lim = clipWorldY - q.p.y;
      for (let i = 0; i < p.count; i++) if (p.getY(i) > lim) p.setY(i, lim);
    }
    const m = new THREE.Mesh(g, mat);
    m.position.copy(q.p); m.lookAt(q.p.clone().add(q.tan)); scene.add(m);
  };
  for (const [d, out1] of [[PORTAL, -0.1], [PORTAL2, 0.1]]) {
    boreWall(d, TRENCH, -1.3, 40, concrete, 1.0);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R + 0.12, 0.26, 8, 56),
      new THREE.MeshStandardMaterial({ color: 0x4b4f4d, roughness: 0.9 }));
    const c = at(d + out1, 0, CY); lip.position.copy(c.p); lip.lookAt(c.p.clone().add(c.tan)); scene.add(lip);
  }

  /* ---- the bore, in lengths between the portals and the station boxes ---- */
  const bore = (d0, d1) => {
    const span = d1 - d0, TUB = Math.ceil(span / 1.3), RAD = 36;
    const curve = subCurve(d0, d1, 0, CY);
    const g = new THREE.TubeGeometry(curve, TUB, R, RAD, false);
    const colors = new Float32Array(g.attributes.position.count * 3);
    const pools = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i <= TUB; i++) {
      const d = d0 + (i / TUB) * span;
      const near = Math.abs(((d + LIGHT_EVERY / 2) % LIGHT_EVERY) - LIGHT_EVERY / 2);
      const pool = Math.exp(-(near * near) / 6);
      const spill = Math.exp(-(d - PORTAL) / 16) + Math.exp(-(PORTAL2 - d) / 16);   // daylight reaches a little way in at each end
      for (let j = 0; j <= RAD; j++) {
        const k = (i * (RAD + 1) + j) * 3;
        const ang = (j / RAD) * Math.PI * 2;
        // lamps on both walls, each lighting its own side
        const side = Math.pow(Math.max(0, Math.cos(ang - 2.85)), 2) + Math.pow(Math.max(0, Math.cos(ang - 0.3)), 2);
        const v = 0.2 + 0.7 * pool * side + 0.9 * spill;
        colors[k] = v; colors[k + 1] = v * 0.93; colors[k + 2] = v * 0.82;
        pools[k] = v - 0.2; pools[k + 1] = (v - 0.2) * 0.93; pools[k + 2] = (v - 0.2) * 0.82;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      color: 0x8f9698, roughness: 0.92, metalness: 0, side: THREE.BackSide, vertexColors: true })));
    // the lamp pools glow on their own, so add them again as an unlit, additive shell
    const shell = new THREE.TubeGeometry(curve, TUB, R - 0.02, RAD, false);
    shell.setAttribute("color", new THREE.BufferAttribute(pools, 3));
    scene.add(new THREE.Mesh(shell, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide,
      transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
    const nRibs = Math.floor((span - 4) / RIB_EVERY);
    const ribs = new THREE.InstancedMesh(new THREE.TorusGeometry(R - 0.06, 0.1, 6, 56),
      new THREE.MeshStandardMaterial({ color: 0x454b4e, roughness: 0.9 }), nRibs);
    for (let i = 0; i < nRibs; i++) place(ribs, i, d0 + 3 + i * RIB_EVERY, 0, CY);
    scene.add(ribs);
    const first = Math.ceil(d0 / LIGHT_EVERY) * LIGHT_EVERY, nL = Math.max(0, Math.floor((d1 - first) / LIGHT_EVERY));
    const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.24, 1.1),
      new THREE.MeshBasicMaterial({ color: 0xfff1d6 }), nL * 2);
    for (let i = 0; i < nL; i++) {
      place(lamps, i * 2, first + i * LIGHT_EVERY, -(R - 0.42), CY + 1.55);
      place(lamps, i * 2 + 1, first + i * LIGHT_EVERY, R - 0.42, CY + 1.55);
    }
    scene.add(lamps);
  };
  {
    let from = PORTAL;
    for (const S of STN) { bore(from, S.boxFrom); from = S.boxTo; }
    bore(from, PORTAL2);
  }

  /* ---- stations: a box with a platform each side, signs, and an exit ---- */
  const fitFont = (c, text, maxW, size, weightAndFamily) => {     // largest font up to `size` that fits maxW
    do { c.font = weightAndFamily.replace("%", size); size -= 4; } while (c.measureText(text).width > maxW && size > 20);
  };
  const textTexture = (w, h, draw) => {
    const [cv, c] = hiCanvas(w, h);
    draw(c);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  };
  // self-lit surfaces: a station is bright whatever the headlights are doing
  const lit = (color, glow = 0.5) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide,
    emissive: color, emissiveIntensity: glow });
  const tile = lit(0xdfe4e3), floorMat = lit(0xb9bfc0, 0.42), ceilMat = lit(0x8f979a, 0.3), darkMat = lit(0x2b3033, 0.3), stepMat = lit(0x9aa1a3, 0.45);
  const yellow = new THREE.MeshBasicMaterial({ color: 0xf4c400, side: THREE.DoubleSide });
  const teal = new THREE.MeshBasicMaterial({ color: 0x15a3bb, side: THREE.DoubleSide });
  const glass = new THREE.MeshBasicMaterial({ color: 0xbfe3ea, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
  const handrail = new THREE.MeshBasicMaterial({ color: 0x59636a, side: THREE.DoubleSide });
  const daylight = new THREE.MeshBasicMaterial({ color: 0xfdfaf0, side: THREE.DoubleSide });
  const fitting = new THREE.MeshBasicMaterial({ color: 0xfffaf0 });
  STN.forEach((S) => {
    const F = S.boxFrom, T = S.boxTo;
    for (const sg of [-1, 1]) {
      along(F, T, sg * PLAT_OUT, PLAT_UP, sg * PLAT_OUT, CEIL, tile);                         // side wall
      along(F, T, sg * PLAT_IN, PLAT_UP, sg * PLAT_OUT, PLAT_UP, floorMat);                   // platform
      along(F, T, sg * PLAT_IN, -0.12, sg * PLAT_IN, PLAT_UP, darkMat);                       // platform face
      along(F, T, sg * (PLAT_IN + 0.08), PLAT_UP + 0.012, sg * (PLAT_IN + 0.68), PLAT_UP + 0.012, yellow);   // tactile edge
      along(F, T, sg * (PLAT_OUT - 0.03), 2.25, sg * (PLAT_OUT - 0.03), 2.75, teal);          // CrossTowner-teal band
    }
    along(F, T, -PLAT_OUT, CEIL, PLAT_OUT, CEIL, ceilMat);
    boreWall(F, PLAT_OUT, -0.14, CEIL, tile);
    boreWall(T, PLAT_OUT, -0.14, CEIL, tile);
    // The bore's crown is higher than the station's ceiling, and the platforms are hollow: close both
    // at each end, or a train in the tunnel sees over the ceiling to the street and under the platforms.
    for (const d of [F + 0.04, T - 0.04]) {
      ribbon((i) => [at(d, (i ? 1 : -1) * (R + 0.4), CEIL - 0.03).p, at(d, (i ? 1 : -1) * (R + 0.4), CY + R + 0.8).p], 1, ceilMat);
      for (const sg of [-1, 1]) ribbon((i) => [at(d, sg * (i ? PLAT_OUT : PLAT_IN), -0.14).p, at(d, sg * (i ? PLAT_OUT : PLAT_IN), PLAT_UP).p], 1, darkMat);
    }
    // light fittings over each platform and between the tracks
    for (const [side, w] of [[-5.2, 0.5], [5.2, 0.5], [0, 0.3]]) {
      const n = Math.floor((T - F - 4) / 4);
      const m = new THREE.InstancedMesh(new THREE.BoxGeometry(w, 0.07, 2.6), fitting, n);
      for (let i = 0; i < n; i++) place(m, i, F + 3 + i * 4, side, CEIL - 0.06);
      scene.add(m);
    }
    const nameTex = textTexture(1024, 256, (c) => {
      c.fillStyle = "#0B7285"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      fitFont(c, S.name, 940, 150, "700 %px Helvetica, Arial, sans-serif"); c.fillText(S.name, 512, 134);
    });
    const exitTexture = (left) => textTexture(1024, 256, (c) => {   // arrow up and to the right, or (left) up and to the left
      c.fillStyle = "#0a7d3b"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textBaseline = "middle"; c.textAlign = "left";
      const tx = left ? 330 : 60;
      c.font = "700 130px Helvetica, Arial, sans-serif"; c.fillText("Exit", tx, 100);
      fitFont(c, S.exitTo, 640, 58, "500 %px Helvetica, Arial, sans-serif"); c.fillText(S.exitTo, tx + 2, 200);
      const ax = (x) => left ? 1024 - x : x;
      c.strokeStyle = "#fff"; c.lineWidth = 26; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(ax(760), 200); c.lineTo(ax(900), 60); c.moveTo(ax(790), 60); c.lineTo(ax(900), 60); c.lineTo(ax(900), 170); c.stroke();
    });
    const exitRight = exitTexture(false), exitLeft = exitTexture(true);
    const board = (tex, w, h, d, side, up, face) => {     // face: "train" (toward arriving trains) or "track"
      const q = at(d, side, up);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      m.position.copy(q.p);
      m.lookAt(face === "train" ? q.p.clone().sub(q.tan) : q.p.clone().addScaledVector(q.right, side > 0 ? -1 : 1));
      scene.add(m);
    };
    for (let d = S.platFrom + 6; d < S.platTo; d += 15) for (const sg of [-1, 1]) board(nameTex, 2.9, 0.72, d, sg * (PLAT_OUT - 0.06), 2.5, "track");
    board(nameTex, 3.0, 0.75, S.platFrom + 20, 5.6, 4.6, "train");
    board(nameTex, 3.0, 0.75, S.stop + 12, -5.6, 4.6, "train");

    // The exits: a stair up from each platform to the street, against the
    // wall, just ahead of where the cab stops.
    const EX0 = S.stop + 17, RUN = 11.5, STEPS = 26, IN = 6.1, OUT = PLAT_OUT - 0.1;
    const TOP = CEIL + 0.6, rise = (TOP - PLAT_UP) / STEPS, going = RUN / STEPS;
    for (const sg of [1, -1]) {
      const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(OUT - IN, rise, going), stepMat, STEPS);
      for (let i = 0; i < STEPS; i++) place(steps, i, EX0 + (i + 0.5) * going, sg * (IN + OUT) / 2, PLAT_UP + (i + 0.5) * rise);
      scene.add(steps);
      const slope = (lo, hi, mat) => ribbon((i) => {       // a sloped strip beside the stair, on the platform side
        const d = EX0 + i * RUN, y = PLAT_UP + i * (TOP - PLAT_UP);
        return [at(d, sg * IN, y + lo).p, at(d, sg * IN, y + hi).p];
      }, 1, mat);
      slope(0, 1.0, glass); slope(1.0, 1.08, handrail);
      // the opening in the ceiling above the stair, bright with daylight from the street
      along(EX0 + RUN * 0.42, EX0 + RUN + 1.5, sg * IN, CEIL - 0.03, sg * OUT, CEIL - 0.03, daylight, 20);
      // a wall behind the top of the stair, and the signs: each arrow points up the stair,
      // which from the track is to the left on the right-hand wall and to the right on the left-hand one
      ribbon((i) => [at(EX0 + RUN + 1.5, sg * (i ? OUT : IN), PLAT_UP).p, at(EX0 + RUN + 1.5, sg * (i ? OUT : IN), CEIL).p], 1, tile);
      board(sg > 0 ? exitRight : exitLeft, 3.0, 0.75, EX0 - 1.2, sg * ((IN + OUT) / 2 - 0.2), 3.75, "train");
      board(sg > 0 ? exitLeft : exitRight, 2.4, 0.6, EX0 - 9, sg * (PLAT_OUT - 0.07), 2.5, "track");
    }
  });

  /* ---- Chicago/Halsted: an open-air station on the surface (all assumed but its position). A platform
          each side with a canopy, running on under the Halsted St viaduct, and a stair from each up
          to the viaduct's sidewalk, a few steps from the corner of Chicago Ave and Halsted St ---- */
  {
    const S = CH, F = S.platFrom, T = S.platTo, OUT = PLAT_OUT, IN = 6.1;
    const std = (color, rough = 0.95) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
    const conc = std(0xb4b7b0), paving = std(0x9da19c), face = std(0x3a3d3f), roofMat = new THREE.MeshStandardMaterial({ color: 0xc3c9cb, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xc3c9cb, emissiveIntensity: 0.35 }), stepConc = std(0xa6aaa5);
    // an upright post from `lo` to `hi` above the rail
    const post = (d, side, lo, hi, w = 0.2, mat = steel) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hi - lo, w), mat), q = at(d, side, (lo + hi) / 2);
      m.position.copy(q.p); m.lookAt(q.p.clone().add(q.tan)); scene.add(m);
    };
    const sign = (tex, w, h, d, side, up, face) => {       // face: "train" (toward arriving trains) or "track"
      const q = at(d, side, up);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      m.position.copy(q.p);
      m.lookAt(face === "train" ? q.p.clone().sub(q.tan) : q.p.clone().addScaledVector(q.right, side > 0 ? -1 : 1));
      scene.add(m);
    };
    const nameTex = textTexture(1024, 256, (c) => {
      c.fillStyle = "#0B7285"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      fitFont(c, S.name, 940, 150, "700 %px Helvetica, Arial, sans-serif"); c.fillText(S.name, 512, 134);
    });
    const exitTexture = (left) => textTexture(1024, 256, (c) => {   // arrow up and to the right, or (left) up and to the left
      c.fillStyle = "#0a7d3b"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textBaseline = "middle"; c.textAlign = "left";
      const tx = left ? 330 : 60;
      c.font = "700 130px Helvetica, Arial, sans-serif"; c.fillText("Exit", tx, 100);
      fitFont(c, S.exitTo, 640, 58, "500 %px Helvetica, Arial, sans-serif"); c.fillText(S.exitTo, tx + 2, 200);
      const ax = (x) => left ? 1024 - x : x;
      c.strokeStyle = "#fff"; c.lineWidth = 26; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(ax(760), 200); c.lineTo(ax(900), 60); c.moveTo(ax(790), 60); c.lineTo(ax(900), 60); c.lineTo(ax(900), 170); c.stroke();
    });
    const exitRight = exitTexture(false), exitLeft = exitTexture(true);
    const CAN0 = S.d - 36, CAN1 = S.stop + 13, ROOF = 4.45;       // the canopies: over the middle of the train to just past the cab
    // where a line `side` metres from the centreline passes under the Halsted St viaduct's east edge
    const reach = (side) => { let d = S.d; while (d < LENGTH - 5 && at(d, side).p.x > VIA_HX + VIA_HALF) d += 0.25; return d; };
    const RUN = 15, STEPS = 40, TOP = VIA_DECK + 0.02, rise = (TOP - PLAT_UP) / STEPS, going = RUN / STEPS;
    S.exits = {}; S.stairRun = RUN;
    for (const sg of [1, -1]) {
      along(F, T, sg * PLAT_IN, PLAT_UP, sg * OUT, PLAT_UP, paving);                           // platform
      along(F, T, sg * PLAT_IN, -0.12, sg * PLAT_IN, PLAT_UP, face);                          // its face to the track
      along(F, T, sg * OUT, -0.12, sg * OUT, PLAT_UP + 1.15, conc);                           // its back, and a parapet
      along(F, T, sg * (PLAT_IN + 0.08), PLAT_UP + 0.012, sg * (PLAT_IN + 0.68), PLAT_UP + 0.012, yellow);   // tactile edge
      along(F, T, sg * (OUT - 0.03), PLAT_UP + 0.85, sg * (OUT - 0.03), PLAT_UP + 1.1, teal); // CrossTowner-teal band
      for (const d of [F, T]) ribbon((i) => [at(d, sg * (i ? OUT : PLAT_IN), -0.12).p, at(d, sg * (i ? OUT : PLAT_IN), PLAT_UP).p], 1, conc);
      // canopy: a roof sloping to the back, a teal fascia, and a row of posts
      along(CAN0, CAN1, sg * 4.2, ROOF, sg * (OUT + 0.3), ROOF - 0.3, roofMat);
      along(CAN0, CAN1, sg * 4.2, ROOF - 0.22, sg * 4.2, ROOF + 0.02, teal);
      for (const d of [CAN0, CAN1]) ribbon((i) => [at(d, sg * (i ? OUT + 0.3 : 4.2), ROOF - (i ? 0.3 : 0) - 0.2).p, at(d, sg * (i ? OUT + 0.3 : 4.2), ROOF - (i ? 0.3 : 0)).p], 1, roofMat);
      for (let d = CAN0 + 1; d <= CAN1 - 0.5; d += 8.5) post(d, sg * (OUT - 0.45), PLAT_UP, ROOF - 0.28);
      // station names: along the back of each platform, and one hung across it for arriving trains
      for (let d = F + 8; d < T - 6; d += 15) {
        sign(nameTex, 2.9, 0.72, d, sg * (OUT - 0.12), 2.75, "track");
        for (const e of [-1.2, 1.2]) post(d + e, sg * (OUT - 0.08), PLAT_UP + 1.1, 2.75, 0.08);
      }
      sign(nameTex, 3.0, 0.75, sg > 0 ? F + 22 : S.stop + 11, sg * 5.9, 3.75, "train");
      // the stair: up beside the back of the platform to a landing level with the viaduct's sidewalk
      const top = Math.min(reach(sg * IN), reach(sg * OUT)) - 0.6, land = Math.max(reach(sg * IN), reach(sg * OUT)) + 1.0;
      const EX0 = top - RUN, yAt = (d) => PLAT_UP + Math.min(Math.max((d - EX0) / RUN, 0), 1) * (TOP - PLAT_UP);
      S.exits[sg] = EX0;
      const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(OUT - IN, rise, going), stepConc, STEPS);
      for (let i = 0; i < STEPS; i++) place(steps, i, EX0 + (i + 0.5) * going, sg * (IN + OUT) / 2, PLAT_UP + (i + 0.5) * rise);
      scene.add(steps);
      ribbon((i) => { const d = EX0 + 0.8 + i * (top - EX0 - 0.8); return [at(d, sg * IN, yAt(d) - 0.4).p, at(d, sg * OUT, yAt(d) - 0.4).p]; }, 1, conc);   // soffit
      ribbon((i) => { const d = top + i * (land - top); return [at(d, sg * IN, TOP).p, at(d, sg * OUT, TOP).p]; }, 1, paving);                              // landing
      ribbon((i) => { const d = top + i * (land - top); return [at(d, sg * IN, TOP - 0.4).p, at(d, sg * OUT, TOP - 0.4).p]; }, 1, conc);
      for (const lat of [IN, OUT]) {
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) - 0.4).p, at(d, sg * lat, yAt(d) + 0.05).p]; }, 8, conc);       // stringer
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) + 0.05).p, at(d, sg * lat, yAt(d) + 1.0).p]; }, 8, glass);     // balustrade
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) + 1.0).p, at(d, sg * lat, yAt(d) + 1.08).p]; }, 8, handrail);
        for (const d of [EX0 + RUN * 0.5, top - 0.3, land - 0.4]) post(d, sg * (lat + (lat === IN ? 0.18 : -0.18)), lat === OUT ? PLAT_UP : -0.1, yAt(d) - 0.4, 0.3, conc);
      }
      // the way out, on a frame over the foot of the stair
      sign(sg > 0 ? exitRight : exitLeft, 3.0, 0.75, EX0 - 1.2, sg * ((IN + OUT) / 2 - 0.2), 3.75, "train");
      for (const lat of [IN - 0.75, OUT - 0.12]) post(EX0 - 1.2, sg * lat, PLAT_UP, 4.15, 0.1);
    }
  }

  // Who is on the train's own platform before and after its doors have been open: `boarders` get on
  // (and vanish), `leavers` have got off. The dissolve halfway through each dwell swaps one for the other.
  const boarders = ALL.map(() => []), leavers = ALL.map(() => []);

  /* ---- people waiting on the platforms: rounded figures in many skin tones and clothes. Every station
          has someone using a wheelchair, someone with a baby in a stroller, someone with a bike, adults
          with children, and travellers with luggage (one alone, two as a couple). Each is built facing
          +z, then stood on a platform and turned. They don't move. ---- */
  const peopleSpots = [];                                 // { kind, station, pos, d, side } for the preview views
  {
    const hash = (n) => { const x = Math.sin(n * 91.7 + 47.3) * 43758.5453; return x - Math.floor(x); };
    const pick = (list, k) => list[Math.floor(hash(k) * list.length)];
    const SKIN = [0xf0c9ae, 0xe6b894, 0xd9a47c, 0xc68a5e, 0xa86b42, 0x8a5433, 0x6b3f26, 0x4a2c1b];
    const HAIR = [0x17120f, 0x2e1f16, 0x5a3a22, 0x8c8c8c, 0xc9a25c, 0x7a3b1e, 0x0f0f12];
    const TOPS = [0x23395b, 0x3a3f44, 0x5b6b3a, 0x7a2434, 0xd0a030, 0x0b7285, 0x8f979a, 0xe9e6df, 0xb8322a, 0x4a6fa5, 0x6a4c93, 0xd97b3a];
    const LEGS = [0x1f2a3a, 0x2b2d30, 0x3d4b63, 0x5a5346, 0x6f7a80, 0x1a1a1c, 0x4a3b2e];
    const KIDS = [0xe2574c, 0xf2c94c, 0x3aa0d8, 0x58b368, 0xf08a5d, 0x9b6bd0, 0xf2f2f2];   // brighter clothes for children
    const BAGS = [0x1f2a44, 0x7a2434, 0x2f5d50, 0x2b2d30, 0xc9772f, 0x5a5f66, 0x3b6ea5];
    // Shading comes from a "matcap" (a picture of a lit ball), not from the scene's lights, so the
    // figures look round in the station's flat light and the same wherever the train's headlights point.
    const matcap = (() => {
      const cv = document.createElement("canvas"); cv.width = cv.height = 256;
      const c = cv.getContext("2d"), g = c.createRadialGradient(100, 84, 8, 128, 128, 150);
      g.addColorStop(0, "#f1f1f1"); g.addColorStop(0.45, "#dcdcdc"); g.addColorStop(0.8, "#a6a6a6"); g.addColorStop(1, "#808080");
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const mats = new Map(), geos = new Map();
    const tone = (color) => { if (!mats.has(color)) mats.set(color, new THREE.MeshMatcapMaterial({ color, matcap })); return mats.get(color); };
    const geo = (key, make) => { if (!geos.has(key)) geos.set(key, make()); return geos.get(key); };
    const CYL = () => geo("cyl", () => new THREE.CylinderGeometry(1, 1, 1, 20)), BALL = () => geo("ball", () => new THREE.SphereGeometry(1, 32, 22)),
      RING = () => geo("ring", () => new THREE.TorusGeometry(1, 0.06, 10, 44));
    const RBOX = () => geo("rbox", () => {                 // a box with rounded edges, 1 x 1 x 1
      const sh = new THREE.Shape(), a = 0.5, r = 0.14;
      sh.moveTo(-a + r, -a); sh.lineTo(a - r, -a); sh.quadraticCurveTo(a, -a, a, -a + r); sh.lineTo(a, a - r); sh.quadraticCurveTo(a, a, a - r, a);
      sh.lineTo(-a + r, a); sh.quadraticCurveTo(-a, a, -a, a - r); sh.lineTo(-a, -a + r); sh.quadraticCurveTo(-a, -a, -a + r, -a);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 5, curveSegments: 8 });
      g.computeBoundingBox(); const b = g.boundingBox, sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
      g.translate(-c.x, -c.y, -c.z); g.scale(1 / sz.x, 1 / sz.y, 1 / sz.z); g.computeVertexNormals(); return g;
    });
    const add = (g, geometry, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geometry, tone(color)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); g.add(m); return m;
    };
    const Y = new THREE.Vector3(0, 1, 0);
    const between = (g, geometry, a, b, color, sx, sz, lenScale = true) => {
      const A = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(A), len = d.length();
      const m = new THREE.Mesh(geometry, tone(color)); m.scale.set(sx, lenScale ? len : 1, sz);
      m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); g.add(m); return m;
    };
    const tube = (g, a, b, r, color) => between(g, CYL(), a, b, color, r, r);          // a thin rod from a to b
    // a limb from a to b with rounded ends (a capsule of radius r, flattened front to back by `flat`)
    const limb = (g, a, b, r, color, flat = 1) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), key = `cap${r.toFixed(3)}_${len.toFixed(2)}`;
      return between(g, geo(key, () => new THREE.CapsuleGeometry(r, len, 8, 20)), a, b, color, 1, flat, false);
    };
    const wheel = (g, x, y, z, r, color = 0x1c1e20) => add(g, RING(), color, x, y, z, r, r, r, 0, Math.PI / 2, 0);
    const look = (k, kid = false) => ({ skin: pick(SKIN, k), hair: pick(kid ? HAIR.filter((h) => h !== 0x8c8c8c) : HAIR, k + 0.2), top: pick(kid ? KIDS : TOPS, k + 0.4), legs: pick(LEGS, k + 0.6), k, kid });
    // a limb or body section from a to b that tapers from radius r0 (at a) to r1 (at b), flattened front to back by `flat`
    const taper = (g, a, b, r0, r1, color, flat = 1) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), key = `tap${r0.toFixed(3)}_${r1.toFixed(3)}_${len.toFixed(2)}`;
      return between(g, geo(key, () => new THREE.CylinderGeometry(r1, r0, len, 24)), a, b, color, 1, flat, false);
    };
    const joint = (g, p, r, color, flat = 1) => add(g, BALL(), color, p[0], p[1], p[2], r, r, r * flat);
    // The figures are the plain "scale figures" of an architect's drawing: real proportions, no faces.
    // head, neck and hair (or a hat), from the base of the neck at height y; children's heads are larger for their size
    const head = (g, L, y) => {
      const h = new THREE.Group(); h.position.y = y; h.scale.setScalar(L.kid ? 1.22 : 1); g.add(h);
      taper(h, [0, -0.04, 0], [0, 0.06, 0], 0.05, 0.042, L.skin);
      add(h, BALL(), L.skin, 0, 0.155, 0.004, 0.09, 0.113, 0.099);
      const style = hash(L.k + 0.8);
      if (style < 0.14) add(h, BALL(), pick(TOPS, L.k + 0.9), 0, 0.2, -0.006, 0.097, 0.085, 0.106);   // a knit hat
      else if (style > 0.2) {
        add(h, BALL(), L.hair, 0, 0.183, -0.02, 0.095, 0.098, 0.1);
        if (style > 0.62) add(h, BALL(), L.hair, 0, 0.07, -0.062, 0.082, 0.15, 0.05);              // longer hair, to the shoulders
      }
    };
    // hips to head, with the hip joints at height y; `reach` swings the arms forward (radians), per arm if an array
    const upper = (g, L, y, reach = 0, pack = true) => {
      const FLAT = 0.62, coat = !L.kid && hash(L.k + 1.1) < 0.3;
      taper(g, [0, y - 0.03, 0], [0, y + 0.2, 0], 0.168, 0.148, L.top, FLAT);                      // hips up to the waist
      taper(g, [0, y + 0.2, 0], [0, y + 0.5, 0], 0.148, 0.188, L.top, FLAT);                       // waist up to the chest
      add(g, BALL(), L.top, 0, y + 0.5, 0, 0.214, 0.075, 0.122);                                   // shoulders
      if (coat) taper(g, [0, y - 0.34, 0], [0, y + 0.2, 0], 0.2, 0.152, L.top, 0.66);              // a coat to mid-thigh
      [-1, 1].forEach((sg, i) => {
        const r = Array.isArray(reach) ? reach[i] : reach, a1 = r * 0.7, a2 = r * 1.2 + 0.18;
        const sh = [sg * 0.215, y + 0.5, 0], el = [sh[0] + sg * 0.03, sh[1] - 0.28 * Math.cos(a1), 0.28 * Math.sin(a1)],
          wr = [el[0], el[1] - 0.25 * Math.cos(a2), el[2] + 0.25 * Math.sin(a2)];
        joint(g, sh, 0.056, L.top); taper(g, sh, el, 0.054, 0.044, L.top); joint(g, el, 0.044, L.top); taper(g, el, wr, 0.043, 0.034, L.top);
        add(g, BALL(), L.skin, wr[0], wr[1] - 0.04 * Math.cos(a2), wr[2] + 0.04 * Math.sin(a2), 0.032, 0.05, 0.04);   // hand
      });
      head(g, L, y + 0.6);
      if (pack && hash(L.k + 1.3) < 0.3) add(g, RBOX(), pick(BAGS, L.k + 1.4), 0, y + 0.31, -0.165, 0.29, 0.4, 0.15);   // a backpack
    };
    const HIP = 0.86;                                      // hip joints above the ground, standing
    // `stride` (1 or -1) sets one leg forward and the other back, mid-step
    const standing = (L, reach = 0, pack = true, stride = 0) => {
      const g = new THREE.Group();
      for (const sg of [-1, 1]) {
        const f = sg * stride;
        const hip = [sg * 0.085, HIP, 0], knee = [sg * 0.085, 0.47, 0.005 + f * 0.11], ankle = [sg * 0.085, 0.09, f * 0.24];
        taper(g, knee, hip, 0.058, 0.08, L.legs); joint(g, knee, 0.057, L.legs); taper(g, ankle, knee, 0.04, 0.055, L.legs);
        add(g, BALL(), 0x1b1b1d, sg * 0.085, 0.042, 0.05 + f * 0.24, 0.05, 0.042, 0.125);          // shoes
      }
      upper(g, L, HIP, reach, pack);
      g.scale.setScalar(L.kid ? 0.52 + 0.2 * hash(L.k + 1.7) : 0.92 + 0.14 * hash(L.k + 1.7));     // different heights; children are 4 to 10 or so
      return g;
    };
    const wheelchairUser = (L) => {
      const g = new THREE.Group(), FRAME = 0x2a4d8f;
      for (const sg of [-1, 1]) {
        wheel(g, sg * 0.31, 0.3, -0.05, 0.3);                                                      // drive wheels, with push rims
        add(g, RING(), 0xb8bcc0, sg * 0.335, 0.3, -0.05, 0.26, 0.26, 0.26, 0, Math.PI / 2, 0);
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; tube(g, [sg * 0.31, 0.3 - 0.29 * Math.cos(a), -0.05 - 0.29 * Math.sin(a)], [sg * 0.31, 0.3 + 0.29 * Math.cos(a), -0.05 + 0.29 * Math.sin(a)], 0.005, 0x8d9296); }
        wheel(g, sg * 0.22, 0.07, 0.4, 0.07);                                                      // casters
        tube(g, [sg * 0.22, 0.1, 0.4], [sg * 0.22, 0.47, 0.22], 0.014, FRAME);
        tube(g, [sg * 0.22, 0.47, 0.24], [sg * 0.22, 0.47, -0.2], 0.014, FRAME);
        tube(g, [sg * 0.22, 0.47, -0.2], [sg * 0.22, 0.98, -0.26], 0.014, FRAME);                  // back posts and push handles
        limb(g, [sg * 0.22, 0.98, -0.27], [sg * 0.22, 0.98, -0.35], 0.017, 0x1c1e20);
        tube(g, [sg * 0.22, 0.47, 0.24], [sg * 0.16, 0.12, 0.52], 0.012, FRAME);                   // footrest hangers
        taper(g, [sg * 0.09, 0.6, -0.05], [sg * 0.1, 0.6, 0.32], 0.08, 0.06, L.legs);              // thighs along the seat
        joint(g, [sg * 0.1, 0.6, 0.32], 0.06, L.legs);
        taper(g, [sg * 0.1, 0.6, 0.32], [sg * 0.1, 0.19, 0.47], 0.056, 0.042, L.legs);             // shins down to the footplate
        add(g, BALL(), 0x1b1b1d, sg * 0.1, 0.145, 0.53, 0.058, 0.048, 0.13);
      }
      add(g, RBOX(), 0x1c1e20, 0, 0.49, 0.03, 0.46, 0.07, 0.46);                                   // seat, backrest, footplate
      add(g, RBOX(), 0x1c1e20, 0, 0.76, -0.235, 0.46, 0.42, 0.05);
      add(g, RBOX(), 0x4a4f54, 0, 0.1, 0.52, 0.34, 0.03, 0.16);
      upper(g, L, 0.6, 0.45, false);
      return g;
    };
    const withStroller = (L, babySkin) => {
      const g = standing(L, 0.8, false), s = new THREE.Group(), SHELL = 0x38546e;
      for (const sg of [-1, 1]) {
        wheel(s, sg * 0.24, 0.11, 0.3, 0.11); wheel(s, sg * 0.24, 0.11, -0.3, 0.11);
        tube(s, [sg * 0.24, 0.11, 0.3], [sg * 0.22, 0.98, -0.5], 0.014, 0x9aa0a4);                 // frame up to the handle
        tube(s, [sg * 0.24, 0.11, -0.3], [sg * 0.22, 0.6, 0.12], 0.014, 0x9aa0a4);
      }
      limb(s, [-0.22, 0.98, -0.5], [0.22, 0.98, -0.5], 0.02, 0x1c1e20);                            // handle
      add(s, RBOX(), SHELL, 0, 0.62, 0.02, 0.44, 0.3, 0.66);                                       // the seat shell
      add(s, BALL(), SHELL, 0, 0.76, -0.2, 0.225, 0.25, 0.25);                                     // canopy, behind the baby
      add(s, RBOX(), 0xe8dfc8, 0, 0.775, 0.16, 0.34, 0.06, 0.34);                                  // blanket
      add(s, BALL(), babySkin, 0, 0.86, 0.02, 0.085, 0.09, 0.09);                                  // the baby...
      add(s, BALL(), 0xf2c94c, 0, 0.915, 0.005, 0.09, 0.05, 0.092);                                // ...in a sun hat
      s.position.z = 0.98; g.add(s);
      return g;
    };
    const withBike = (L) => {
      const g = new THREE.Group(), FRAME = 0xc8432b, DARK = 0x1c1e20, b = new THREE.Group();
      const rider = standing(L, [0.1, 0.75], false); rider.position.x = -0.42; g.add(rider);
      wheel(b, 0, 0.34, 0.54, 0.33); wheel(b, 0, 0.34, -0.5, 0.33);
      for (const z of [0.54, -0.5]) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 6; tube(b, [0, 0.34 - 0.32 * Math.cos(a), z - 0.32 * Math.sin(a)], [0, 0.34 + 0.32 * Math.cos(a), z + 0.32 * Math.sin(a)], 0.004, 0x9aa0a4); }
      const BB = [0, 0.3, -0.02], SEAT = [0, 0.84, -0.2], HEAD = [0, 0.88, 0.36], REAR = [0, 0.34, -0.5], FRONT = [0, 0.34, 0.54];
      tube(b, BB, SEAT, 0.018, FRAME); tube(b, SEAT, HEAD, 0.018, FRAME); tube(b, [0, 0.8, 0.38], BB, 0.02, FRAME);   // seat, top and down tubes
      tube(b, BB, REAR, 0.012, FRAME); tube(b, SEAT, REAR, 0.012, FRAME);                          // chain and seat stays
      tube(b, HEAD, FRONT, 0.014, FRAME);                                                          // fork
      tube(b, SEAT, [0, 0.95, -0.22], 0.012, 0x9aa0a4); add(b, BALL(), DARK, 0, 0.965, -0.23, 0.06, 0.025, 0.13);     // seat post and saddle
      tube(b, HEAD, [0, 1.0, 0.34], 0.012, 0x9aa0a4); limb(b, [-0.26, 1.0, 0.34], [0.26, 1.0, 0.34], 0.014, DARK);    // stem and handlebar
      add(b, CYL(), 0x9aa0a4, 0, 0.3, -0.02, 0.07, 0.012, 0.07, 0, 0, Math.PI / 2);                // chainring
      b.rotation.z = -0.07; g.add(b);                                                              // leaning a little toward its owner
      return g;
    };
    // a rolling suitcase standing at (x, z), its handle up
    const suitcase = (g, k, x, z, big = true) => {
      const w = big ? 0.44 : 0.36, h = big ? 0.68 : 0.52, color = pick(BAGS, k);
      add(g, RBOX(), color, x, 0.06 + h / 2, z, w, h, 0.27);
      for (const sg of [-1, 1]) {
        add(g, RING(), 0x1c1e20, x + sg * (w / 2 - 0.06), 0.035, z - 0.08, 0.03, 0.03, 0.03, 0, Math.PI / 2, 0);
        tube(g, [x + sg * 0.09, 0.06 + h, z - 0.08], [x + sg * 0.09, 0.06 + h + 0.34, z - 0.08], 0.009, 0x9aa0a4);
      }
      limb(g, [x - 0.1, 0.06 + h + 0.34, z - 0.08], [x + 0.1, 0.06 + h + 0.34, z - 0.08], 0.014, 0x1c1e20);
      add(g, RBOX(), 0x1c1e20, x, 0.06 + h * 0.62, z + 0.14, w * 0.5, 0.05, 0.02);                 // a strap across the front
    };
    const traveller = (k) => {                             // alone, with a suitcase and sometimes a second bag on top
      const g = standing(look(k), [0.05, 0.3]);
      suitcase(g, k + 0.3, 0.52, 0.1);
      if (hash(k + 0.7) < 0.6) add(g, RBOX(), pick(BAGS, k + 0.8), 0.52, 0.86, 0.1, 0.36, 0.22, 0.2);
      return g;
    };
    const couple = (k) => {                                // two travellers side by side, turned a little toward each other
      const g = new THREE.Group();
      const a = standing(look(k), [0.3, 0.05]), b = standing(look(k + 7), [0.05, 0.3]);
      a.position.x = -0.34; a.rotation.y = 0.3; b.position.x = 0.34; b.rotation.y = -0.3; g.add(a, b);
      suitcase(g, k + 0.3, -0.78, 0.1); suitcase(g, k + 0.5, 0.78, 0.1, hash(k + 0.6) < 0.5);
      return g;
    };
    const family = (k) => {                                // an adult with one or two children, hand in hand
      const g = new THREE.Group(), n = hash(k + 0.9) < 0.4 ? 2 : 1;
      const adult = standing(look(k), n === 2 ? [0.12, 0.12] : [0.02, 0.12], false); g.add(adult);
      for (let i = 0; i < n; i++) {
        const kid = standing(look(k + 3 + i * 5, true), 0.05, hash(k + i + 1.2) < 0.5);
        kid.position.x = (i ? -1 : 1) * 0.4; kid.position.z = 0.04; g.add(kid);
      }
      return g;
    };
    const stand = (g, kind, si, d, side, yaw, face = "track", up = PLAT_UP, waiting = true) => {
      const q = at(d, side, up);
      g.position.copy(q.p);
      g.lookAt(face === "track" ? at(d, 0, up).p : q.p.clone().addScaledVector(q.tan, face === "ahead" ? 1 : -1));
      g.rotateY(yaw);
      scene.add(g);
      if (!waiting) return;
      peopleSpots.push({ kind, station: si, pos: q.p.clone(), d, side });
      if (side > 0) boarders[si].push(g);                    // the train is on the right-hand track: these get on it
    };
    ALL.forEach((S, si) => {
      const sw = si % 2 ? -1 : 1, K = si * 100;              // alternate which platform each of the fixed ones is on
      stand(wheelchairUser(look(K + 1)), "wheelchair", si, S.stop + 9 + si, sw * (PLAT_IN + 1.7), 0.25);
      stand(withStroller(look(K + 2), pick(SKIN, K + 2.5)), "stroller", si, S.stop + 13.5, -sw * (PLAT_IN + 2.0), 0.15, "behind");
      stand(withBike(look(K + 3)), "bike", si, S.stop + 5 - si * 0.6, -sw * (PLAT_IN + 2.1), 0, "ahead");
      stand(family(K + 4), "family", si, S.stop + 12.5 + si * 0.7, sw * (PLAT_IN + 2.6), -0.2);
      stand(traveller(K + 5), "traveller", si, S.stop + 7.5, -sw * (PLAT_IN + 1.5), 0.2);
      stand(couple(K + 6), "couple", si, S.stop + 15.5 - si * 0.5, sw * (PLAT_IN + 1.4), 0.1);
      // then the rest of the crowd, scattered along both platforms (Union Station gets more luggage)
      const crowd = ["family", "traveller", si === 2 ? "couple" : "standing", si === 2 ? "traveller" : "standing", "kid"];
      for (let i = 0; i < 16; i++) {
        const k = K + 10 + i, sg = hash(k + 0.11) < 0.55 ? 1 : -1, kind = crowd[i] || "standing";
        const d = S.crowdFrom + 5 + hash(k + 0.21) * (S.platTo - S.crowdFrom - 9);
        let side = PLAT_IN + 1.2 + hash(k + 0.31) * 3.0;
        const EX0 = S.exits ? S.exits[sg] : S.stop + 17, RUN = S.stairRun || 12;   // the stairs: keep their foot clear
        if (d > EX0 - 1.5 && d < EX0 + RUN + 2 && side > 5.3) side = PLAT_IN + 1.2 + hash(k + 0.31) * 0.5;
        const pos = at(d, sg * side, PLAT_UP).p;
        if (peopleSpots.some((o) => o.station === si && o.pos.distanceTo(pos) < (kind === "standing" ? 1.5 : 2.2))) continue;
        const f = hash(k + 0.41), face = f < 0.6 ? "track" : f < 0.85 ? "behind" : "ahead", yaw = (hash(k + 0.51) - 0.5) * 1.1;
        const g = kind === "family" ? family(k) : kind === "traveller" ? traveller(k) : kind === "couple" ? couple(k)
          : kind === "kid" ? family(k + 50) : standing(look(k));
        stand(g, kind === "kid" ? "family" : kind, si, d, sg * side, yaw, face);
      }
      // And the people who get off here, on the train's platform, shown once the doors have been open a
      // while. Most are walking to the stair and up it; anyone on wheels heads back along the platform,
      // to a lift that is out of shot behind the cab.
      const EXL = S.exits ? S.exits[1] : S.stop + 17, RUNL = S.stairRun || 11.5, TOPL = S.outdoor ? VIA_DECK : CEIL + 0.6;
      const leave = (g, d, side, face, yaw = 0, up = PLAT_UP) => { stand(g, "leaving", si, d, side, yaw, face, up, false); g.visible = false; leavers[si].push(g); };
      const walker = (k) => { const st = hash(k + 0.3) < 0.5 ? 1 : -1; return standing(look(k), [0.4 * st, -0.4 * st], true, st); };
      for (let i = 0; i < 7; i++) {                          // along the platform, drifting over to the foot of the stair
        const k = K + 200 + i, u = (i + 0.25 + 0.5 * hash(k + 0.1)) / 7;
        leave(i === 4 ? family(k) : walker(k), S.stop + 5.5 + u * (EXL - S.stop - 6.5), PLAT_IN + 2.3 + hash(k + 0.2) * 1.2 + u * 0.7, "ahead", (hash(k + 0.5) - 0.5) * 0.3);
      }
      [0.1, 0.26, 0.43, 0.6].forEach((f, i) => {             // on the stair
        const k = K + 220 + i;
        leave(walker(k), EXL + f * RUNL, 6.7 + hash(k + 0.2) * 1.2, "ahead", 0, PLAT_UP + f * (TOPL - PLAT_UP) + 0.1);
      });
      leave(withBike(look(K + 231)), S.stop + 6, PLAT_IN + 1.6, "behind");
      leave(wheelchairUser(look(K + 232)), S.stop + 9.5, PLAT_IN + 1.5, "behind", 0.1);
      leave(withStroller(look(K + 233), pick(SKIN, K + 233.5)), S.stop + 13.5, PLAT_IN + 1.7, "behind");
    });
  }

  /* ---- "CHICAGO" down the casino's corner drum (no operator's name on the building) ---- */
  if (ballysSite) {
    const drum = textTexture(160, 1024, (c) => {
      c.fillStyle = "#2a1c12"; c.fillRect(0, 0, 160, 1024);
      c.fillStyle = "#fff6e0"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "700 120px Georgia, 'Times New Roman', serif";
      [..."CHICAGO"].forEach((ch, i) => c.fillText(ch, 80, 90 + i * 140));
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 21), new THREE.MeshBasicMaterial({ map: drum, side: THREE.DoubleSide }));
    m.position.set(ballysSite.x0 + 12 - 11.6 * 0.82, 17, ballysSite.z0 + 14 + 11.6 * 0.57); m.rotation.y = -Math.PI / 2 - 0.6; scene.add(m);
  }

  /* ---- camera in the operator's seat, and the cab around it ---- */
  const camera = new THREE.PerspectiveCamera(62, width / height, 0.05, 10000);
  scene.add(camera);
  const cabMat = new THREE.MeshBasicMaterial({ color: 0x0c0f10, fog: false });
  const trim = new THREE.MeshBasicMaterial({ color: 0x1b2124, fog: false });
  const box = (w, h, dz, x, y, z, mat = cabMat, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dz), mat);
    m.position.set(x, y, z); m.rotation.set(rx, 0, rz); camera.add(m); return m;
  };
  box(2.6, 0.5, 0.5, 0, -0.85, -0.9);                     // dash
  box(2.6, 0.3, 0.1, 0, 0.75, -0.9);                      // header
  box(0.1, 1.6, 0.1, -1.0, 0.05, -0.9, cabMat, 0, -0.06);    // windscreen pillars
  box(0.1, 1.6, 0.1, 1.0, 0.05, -0.9, cabMat, 0, 0.06);
  // console: a hooded display in front of the operator, a lamp panel and the controller
  const TILT = -0.42;
  box(0.62, 0.3, 0.06, -0.3, -0.46, -1.0, trim, TILT);    // display housing
  // The rest of the desk follows a Stadler FLIRT's: a second screen beside the first under one long
  // hood, a third angled in from the right, a small gauge panel on the left, and a black T-handle
  // master controller.
  box(0.36, 0.3, 0.06, 0.24, -0.46, -1.0, trim, TILT);    // second screen's housing, with the lamps and buttons
  box(1.1, 0.025, 0.1, -0.08, -0.288, -1.03, cabMat, TILT); // one hood over both
  const screen = (w, h, draw, x, y, z, ry = 0, cw = 512, ch = 256) => {
    const [cv, c] = hiCanvas(cw, ch); draw(c, cw, ch);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.set(TILT, ry, 0, "YXZ"); camera.add(m); return m;
  };
  screen(0.3, 0.115, (c, w, h) => {                       // train status: the consist and its doors
    c.fillStyle = "#0b1a24"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#8fa5b3"; c.font = "600 26px Helvetica, Arial, sans-serif"; c.fillText("X1  Highland Park", 18, 36);
    for (let i = 0; i < 6; i++) {
      c.fillStyle = "#1d3a4a"; c.fillRect(18 + i * 80, 70, 72, 46);
      c.fillStyle = "#35d07f"; c.fillRect(26 + i * 80, 100, 14, 10); c.fillRect(60 + i * 80, 100, 14, 10);
    }
    c.fillStyle = "#16303d"; for (let i = 0; i < 4; i++) c.fillRect(18 + i * 122, 150, 110, 78);
    c.fillStyle = "#5f7887"; c.font = "500 20px Helvetica, Arial, sans-serif";
    ["HVAC", "Brakes", "Pantograph", "Doors"].forEach((t, i) => c.fillText(t, 26 + i * 122, 180));
    c.fillStyle = "#35d07f"; for (let i = 0; i < 4; i++) c.fillRect(26 + i * 122, 196, 60, 8);
  }, 0.24, -0.378, -0.99);
  {
    const g = new THREE.Group();                           // the right-hand screen, turned toward the operator
    g.position.set(0.7, -0.47, -0.95); g.rotation.set(TILT, -0.55, 0, "YXZ"); camera.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.05), trim));
    const [cv, c] = hiCanvas(384, 320);
    c.fillStyle = "#12305a"; c.fillRect(0, 0, 384, 320);
    c.strokeStyle = "#7fb2e6"; c.lineWidth = 5; c.beginPath(); c.moveTo(40, 250); c.lineTo(190, 250); c.lineTo(250, 190); c.lineTo(350, 190); c.moveTo(40, 110); c.lineTo(350, 110); c.stroke();
    c.fillStyle = "#cfe3f7"; for (const [x, y] of [[90, 250], [300, 190], [120, 110], [260, 110]]) c.fillRect(x - 10, y - 10, 20, 20);
    c.fillStyle = "#2b5391"; c.fillRect(0, 0, 384, 44); c.fillStyle = "#dbe9f8"; c.font = "600 24px Helvetica, Arial, sans-serif"; c.fillText("Signals", 16, 30);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.21), new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
    m.position.z = 0.027; g.add(m);
  }
  {
    const g = new THREE.Group();                           // left: a lit round gauge and a keypad
    g.position.set(-0.8, -0.5, -0.97); g.rotation.set(TILT, 0.45, 0, "YXZ"); camera.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.05), trim));
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.036, 28), new THREE.MeshBasicMaterial({ color: 0xf3e6c4, fog: false, toneMapped: false }));
    dial.position.set(0.055, 0.02, 0.027); g.add(dial);
    const hand = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.04), new THREE.MeshBasicMaterial({ color: 0x20262a, fog: false }));
    hand.position.set(0.062, 0.032, 0.028); hand.rotation.z = -0.6; g.add(hand);
    for (let i = 0; i < 9; i++) {
      const k = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.014), new THREE.MeshBasicMaterial({ color: i === 4 ? 0x9bb04a : 0x5a6368, fog: false }));
      k.position.set(-0.085 + (i % 3) * 0.028, 0.045 - Math.floor(i / 3) * 0.022, 0.027); g.add(k);
    }
  }
  {                                                       // master controller: a black T-handle on a short stalk
    const grip = new THREE.MeshBasicMaterial({ color: 0x2c3236, fog: false }), stalk = new THREE.MeshBasicMaterial({ color: 0x3d4448, fog: false });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, 0.13, 10), stalk);
    shaft.position.set(0.47, -0.5, -0.9); shaft.rotation.x = -0.3; camera.add(shaft);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.085, 12), grip);
    bar.position.set(0.47, -0.43, -0.92); bar.rotation.z = Math.PI / 2; camera.add(bar);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.16), new THREE.MeshBasicMaterial({ color: 0x1a1f22, fog: false }));
    gate.position.set(0.47, -0.565, -0.88); camera.add(gate);
  }
  const DISP_W = 768, DISP_H = 384;
  const [dispCanvas, dctx] = hiCanvas(DISP_W, DISP_H);
  const dispTex = new THREE.CanvasTexture(dispCanvas);
  dispTex.colorSpace = THREE.SRGBColorSpace; dispTex.anisotropy = 8;
  {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.27), new THREE.MeshBasicMaterial({ map: dispTex, fog: false, toneMapped: false }));
    m.position.set(-0.3, -0.446, -0.967); m.rotation.x = TILT; camera.add(m);
  }
  const lamp = (x, color) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.017, 20), new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false }));
    m.position.set(x, -0.47, -0.955); m.rotation.x = TILT; camera.add(m); return m;
  };
  const lampDoors = lamp(0.13, 0x35d07f), lampPower = lamp(0.19, 0x35d07f), lampBrake = lamp(0.25, 0x3a3f42);
  lamp(0.31, 0xf4a300);
  for (let i = 0; i < 4; i++) box(0.04, 0.012, 0.01, 0.13 + i * 0.06, -0.55, -0.95, new THREE.MeshBasicMaterial({ color: 0x4d575c, fog: false }), TILT);

  // The display: speed, a speed arc, the next stop and how far it is, and the whole line.
  function drawDisplay(mph, dist, atStation, doorsOpen) {
    const c = dctx, W = DISP_W, H = DISP_H, FONT = "px Helvetica, Arial, sans-serif";
    const next = ALL.find((S) => S.stop > dist + 0.5);
    c.fillStyle = "#071216"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#0d2229"; c.fillRect(0, 0, W, 54);
    c.textBaseline = "middle"; c.textAlign = "left";
    c.fillStyle = "#7fd3e0"; c.font = "600 30" + FONT; c.fillText("CrossTowner", 22, 28);
    c.textAlign = "right"; c.fillStyle = doorsOpen ? "#f4c400" : "#35d07f";
    c.fillText(doorsOpen ? "DOORS OPEN" : "DOORS CLOSED", W - 22, 28);
    // speed arc
    const cx = 196, cy = 250, rad = 150, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, MAXV = 80;
    c.lineCap = "round"; c.lineWidth = 22;
    c.strokeStyle = "#17313a"; c.beginPath(); c.arc(cx, cy, rad, a0, a1); c.stroke();
    c.strokeStyle = "#15a3bb"; c.beginPath(); c.arc(cx, cy, rad, a0, a0 + (a1 - a0) * Math.min(mph / MAXV, 1) + 0.0001); c.stroke();
    c.lineWidth = 4; c.strokeStyle = "#5c7c86"; c.fillStyle = "#5c7c86"; c.font = "500 22" + FONT; c.textAlign = "center";
    for (let v = 0; v <= MAXV; v += 20) {
      const ang = a0 + (a1 - a0) * v / MAXV;
      c.beginPath(); c.moveTo(cx + Math.cos(ang) * (rad - 20), cy + Math.sin(ang) * (rad - 20));
      c.lineTo(cx + Math.cos(ang) * (rad - 34), cy + Math.sin(ang) * (rad - 34)); c.stroke();
      c.fillText(String(v), cx + Math.cos(ang) * (rad - 56), cy + Math.sin(ang) * (rad - 56));
    }
    c.fillStyle = "#fff"; c.font = "700 124" + FONT; c.fillText(String(Math.round(mph)), cx, cy - 4);
    c.fillStyle = "#9fb9c0"; c.font = "600 30" + FONT; c.fillText("mph", cx, cy + 76);
    // next stop (past the film's last one, the X1's next in the CrossTowner GTFS)
    const label = atStation ? "NOW AT" : "NEXT STOP";
    const name = atStation ? atStation.name : next ? next.name : "Division/Elston";
    const toGo = next ? next.stop - dist : 0;
    c.textAlign = "left";
    c.fillStyle = "#9fb9c0"; c.font = "600 26" + FONT; c.fillText(label, 410, 104);
    c.fillStyle = "#fff"; fitFont(c, name, W - 408 - 24, 62, "700 %" + FONT); c.fillText(name, 408, 160);
    c.fillStyle = "#7fd3e0"; c.font = "600 40" + FONT;
    c.fillText(atStation ? "Exit on the right" : toGo > 0 ? (toGo / 1609.34).toFixed(2) + " mi" : "", 410, 224);
    // the whole line, with a dot for the train and a tick for each station
    const x0 = 412, x1 = W - 40, y = 300, X = (d) => x0 + (x1 - x0) * Math.min(Math.max((d - START) / (END - START), 0), 1);
    c.lineWidth = 8; c.strokeStyle = "#17313a"; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    c.strokeStyle = "#15a3bb"; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(dist), y); c.stroke();
    for (const S of ALL) { c.fillStyle = S.stop <= dist + 0.5 ? "#15a3bb" : "#3d5a63"; c.beginPath(); c.arc(X(S.stop), y, 8, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(X(dist), y, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#5c7c86"; c.font = "500 22" + FONT;
    c.fillText("Metra Electric", x0, y + 36); c.textAlign = "right"; c.fillText("Chicago/Halsted", x1, y + 36);
    dispTex.needsUpdate = true;
  }

  /* ---- light: daylight outside, headlights and lamps below ---- */
  const hemi = new THREE.HemisphereLight(0xdfeaf5, 0x2a2a28, 1.5);
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.2);
  sun.position.set(0.42, 0.78, 0.46);
  const ambient = new THREE.AmbientLight(0x8fa3b0, 0.16);
  scene.add(hemi, sun, ambient);
  const head = new THREE.SpotLight(0xfff4e0, 260, 170, 0.55, 0.8, 1.5);
  head.position.set(0, -0.9, 0.5);
  camera.add(head); camera.add(head.target);
  head.target.position.set(0, -1.1, -30);

  /* ---- motion: the fastest run a train can make, played back at a constant SPEEDUP ----
     Between stops the train does what a Stadler FLIRT could: full power away
     from the platform (acceleration tapering once the motors are at full
     power), then its service brake into the next stop, slowing for each curve
     to the speed 49 CFR 213.57(b) allows. That is quicker than the synthetic
     CrossTowner GTFS (analysis/crosstowner_xroutes_gtfs), which spaces these
     stations two minutes apart with no dwell; the film keeps only its 7:55
     departure from 18th. Every second of film is SPEEDUP seconds of real
     time, but for the stops (see DWELL). */
  const SPEEDUP = 4;
  // Each stop is 60 seconds on the clock but 6 on screen: partway through, the film dissolves over
  // XFADE seconds to the end of the stop (the clock running on through what is skipped), by when
  // the people waiting have boarded and those getting off are on their way out.
  const DWELL = 6, DWELL_REAL = 60, XFADE = 2.2;
  // The train (assumed: a 4-car FLIRT; typical figures, not from a data sheet). SI units.
  const TRAIN = { mass: 145e3 * 1.06, effort: 200e3, power: 2.6e6, accel: 1.2, brake: 1.0, top: 160 / 3.6, length: 75 };
  const CANT_IN = 6, DEFICIENCY_IN = 3;                           // each curve's elevation (assumed) and the cant deficiency any vehicle may use, inches
  const DEPART_18TH = 7 * 3600 + 55 * 60;                         // leaves 18th at 7:55:00 AM (trip X1_NB, one of every 30 minutes)
  const END_CREDITS = 9;                                          // seconds of black, with the credits, after the ride
  const REVEAL_TAIL = 5.5;                                        // seconds the closing aerial shot runs on after the ride's own end
  const stops = STN.map((S) => S.stop);
  const localOf = (lon, lat) => V2((lon - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), (city.origin[1] - lat) * 111070);
  // 18th station, behind the film's start, as a distance along (before) the alignment
  const p0 = at(0).p;
  const d18th = -localOf(-87.618198, 41.858502).distanceTo(V2(p0.x, p0.z));
  // Each curve of the plan, and the speed it allows: Vmax (mph) = sqrt((Ea + Eu) / (0.0007 D)), D the degree
  // of curvature. It holds from the cab entering the curve until the tail of the train has left it.
  const curveLimits = [];
  {
    let from = null, turn = 0;
    for (let i = 2; i < plan.length; i++) {
      const a = plan[i - 1].clone().sub(plan[i - 2]), b = plan[i].clone().sub(plan[i - 1]);
      const k = Math.abs(Math.asin(Math.max(-1, Math.min(1, (a.x * b.y - a.y * b.x) / (a.length() * b.length())))));
      if (k > 1e-4) { if (from === null) { from = i - 1; turn = 0; } turn += k; }
      else if (from !== null) {
        const radius = (pd[i - 1] - pd[from]) / turn, mph = Math.sqrt((CANT_IN + DEFICIENCY_IN) / (0.0007 * 5729.578 / (radius / 0.3048)));
        curveLimits.push({ from: pd[from], to: pd[i - 1] + TRAIN.length, radius, mph, v: mph / 2.23694 });
        from = null;
      }
    }
  }
  // acceleration at full power at speed v: the tractive effort (limited by power) less the train's resistance
  const accelAt = (v) => Math.min(TRAIN.accel, (Math.min(TRAIN.effort, TRAIN.power / Math.max(v, 0.1)) - (2000 + 40 * v + 6.5 * v * v)) / TRAIN.mass);
  // The fastest run from a stand at x0 to a stand at x1 (or, stop = false, still accelerating there):
  // speed and elapsed time every `ds` metres, in real metres and seconds.
  const fastest = (x0, x1, stop = true) => {
    const n = Math.ceil((x1 - x0) / 0.25), ds = (x1 - x0) / n, v = new Float64Array(n + 1), ts = new Float64Array(n + 1);
    const cap = (i) => { const x = x0 + i * ds; let c = TRAIN.top; for (const q of curveLimits) if (x >= q.from && x <= q.to) c = Math.min(c, q.v); return c; };
    for (let i = 1; i <= n; i++) v[i] = Math.min(cap(i), Math.sqrt(v[i - 1] ** 2 + 2 * accelAt(v[i - 1]) * ds));
    if (stop) { let b = 0; v[n] = 0; for (let i = n - 1; i >= 0; i--) { b = Math.min(cap(i), Math.sqrt(b * b + 2 * TRAIN.brake * ds)); v[i] = Math.min(v[i], b); } }
    for (let i = 1; i <= n; i++) ts[i] = ts[i - 1] + ds / ((v[i] + v[i - 1]) / 2);
    return { x0, ds, n, v, ts, T: ts[n], peak: Math.max(...v) };
  };
  // { T, station } while stopped, { T, run, skip } while moving (T in film seconds; `skip` real seconds of the run are before the film starts)
  const phases = [];
  {
    const first = fastest(d18th, stops[0]), skip = first.ts[Math.ceil((START - d18th) / first.ds)];   // the film joins the train already under way
    phases.push({ run: first, skip, T: (first.T - skip) / SPEEDUP });
    const calls = [...stops, CH.stop];
    for (let i = 1; i < calls.length; i++) {
      const run = fastest(calls[i - 1], calls[i]);
      phases.push({ T: DWELL, station: ALL[i - 1] }, { run, skip: 0, T: run.T / SPEEDUP });
    }
    // the doors open at Chicago/Halsted too, then the train pulls away north under the viaducts as the film ends
    const away = fastest(CH.stop, END, false);
    phases.push({ T: DWELL, station: CH }, { run: away, skip: 0, T: away.T / SPEEDUP });
  }
  let tAcc = 0;
  for (const ph of phases) { ph.t0 = tAcc; tAcc += ph.T; }
  const RIDE = tAcc, DURATION = Math.ceil(RIDE + REVEAL_TAIL + END_CREDITS);
  const clampT = (t) => Math.min(Math.max(t, 0), RIDE - 1e-6);
  const phaseAt = (t) => { t = clampT(t); let p = phases[0]; for (const q of phases) { if (q.t0 <= t) p = q; else break; } return p; };
  // where a run has got to, and how fast it is going, `tau` film seconds into it: [metres along the alignment, real m/s]
  const runAt = (p, tau) => {
    const r = p.run, tr = Math.min(p.skip + tau * SPEEDUP, r.T);
    let lo = 0, hi = r.n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (r.ts[m] <= tr) lo = m; else hi = m; }
    const f = Math.min(Math.max((tr - r.ts[lo]) / (r.ts[hi] - r.ts[lo] || 1), 0), 1);
    return [r.x0 + (lo + f) * r.ds, r.v[lo] + (r.v[hi] - r.v[lo]) * f];
  };
  const speedAt = (t) => { const p = phaseAt(t); return p.run ? runAt(p, clampT(t) - p.t0)[1] * SPEEDUP : 0; };   // m/s of film
  const END_SPEED = phases[phases.length - 1].run.v[phases[phases.length - 1].run.n] * SPEEDUP;
  const distAt = (t) => {
    const p = phaseAt(t);                                         // past the end of the ride the train rolls on
    return (p.run ? runAt(p, clampT(t) - p.t0)[0] : p.station.stop) + Math.max(0, t - RIDE) * END_SPEED;
  };
  const dwellMid = ALL.map((S) => phases.find((q) => q.station === S).t0 + DWELL / 2);   // the middle of each stop's dissolve
  const DWELL_SKIP = DWELL_REAL - DWELL * SPEEDUP;                // seconds of clock each dissolve skips
  // the time of day, seconds after midnight: SPEEDUP times the film's, plus what each stop's dissolve has skipped
  const clockAt = (t) => DEPART_18TH + phases[0].skip + t * SPEEDUP
    + dwellMid.reduce((sum, m) => sum + DWELL_SKIP * smooth((t - (m - XFADE / 2)) / XFADE), 0);
  // Show each station's platform as it is before (`after` false) or after its dissolve; `force` sets that for a station mid-dissolve.
  let peopleForce = null;
  const setPeople = (t) => ALL.forEach((S, si) => {
    const after = peopleForce !== null && Math.abs(t - dwellMid[si]) <= XFADE ? peopleForce : t >= dwellMid[si];
    for (const g of boarders[si]) g.visible = !after;
    for (const g of leavers[si]) g.visible = after;
  });

  /* ---- the train from outside (assumed: four single-deck cars in CrossTowner
          teal, with a rounded cab at each end), only ever seen from outside the cab ---- */
  const makeTrain = (lit) => {                            // lit: seen in the dark, so its windows and lamps glow
    const train = new THREE.Group();
    train.visible = false; scene.add(train);
    const paint = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25, ...extra });
    const body = paint(0xd3d9dc), dark = paint(0x1a2226, { roughness: 0.3 }), stripe = paint(0x0b7285),
      roofMat = paint(0x9aa2a6, { roughness: 0.8 }), under = paint(0x23282b, { roughness: 0.9 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: !lit });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff1c8, fog: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const windowMat = lit ? new THREE.MeshBasicMaterial({ color: 0x8d8973 }) : dark;
    // The windscreen never shows the cab behind it: it is a mirror. What it reflects is a painted
    // surround (an equirectangular picture): in daylight the sky, brightest low in the south-east; in the
    // tunnel, darkness and the lamps, which drawScene turns about the train so that they slide over the glass.
    const glare = (() => {
      const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256;
      const c = cv.getContext("2d");
      if (lit) {
        c.fillStyle = "#06090b"; c.fillRect(0, 0, 512, 256);
        const blob = (x, y, rx, ry, a) => {
          const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
          g.addColorStop(0, `rgba(255,247,226,${a})`); g.addColorStop(0.55, `rgba(255,244,214,${a * 0.75})`); g.addColorStop(1, "rgba(255,240,205,0)");
          c.save(); c.translate(x, y); c.scale(rx, ry); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, Math.PI * 2); c.fill(); c.restore();
        };
        const haze = c.createLinearGradient(0, 30, 0, 170);          // their light on the tunnel wall: the glass is never quite dark
        haze.addColorStop(0, "rgba(255,244,214,0)"); haze.addColorStop(0.5, "rgba(255,244,214,0.12)"); haze.addColorStop(1, "rgba(255,244,214,0)");
        c.fillStyle = haze; c.fillRect(0, 30, 512, 140);
        for (let i = 0; i < 8; i++) {                              // the lamps: long soft bars, one after another round the horizon
          const x = (i + 0.5) / 8 * 512;
          blob(x, 96, 16, 60, 0.9); blob(x, 96, 6, 42, 1);
          if (x < 40) blob(x + 512, 96, 16, 60, 0.9);
        }
      } else {
        const g = c.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, "#6f9fd0"); g.addColorStop(0.42, "#dbe8f3"); g.addColorStop(0.5, "#f6f8f8"); g.addColorStop(0.56, "#8f9a9c"); g.addColorStop(1, "#4d5557");
        c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      }
      const tex = new THREE.CanvasTexture(cv);
      tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const screenMat = new THREE.MeshStandardMaterial({ color: lit ? 0xffffff : 0xdfe6ea, metalness: 1, roughness: lit ? 0.06 : 0.08, envMap: glare, envMapIntensity: lit ? 1.3 : 1.0 });
    train.userData.glass = screenMat;
    const FLOOR = 1.05, TOP = 3.8, WIDE = 3.05, CAB = 3.4;        // body bottom and top above the rail, width, cab length
    // A box that narrows and leans back toward the front in a quarter-ellipse: the rounded cab end.
    const noseBox = (w, lo, hi, mat, proud = 0) => {
      const g = new THREE.BoxGeometry(w, hi - lo, CAB + proud, 10, 4, 16);
      g.translate(0, (lo + hi) / 2, (CAB + proud) / 2);
      const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const u = Math.min(p.getZ(k) / (CAB + proud), 1), f = Math.sqrt(1 - u * u);
        p.setX(k, p.getX(k) * (0.42 + 0.58 * f));
        p.setY(k, FLOOR + (p.getY(k) - FLOOR) * (0.62 + 0.38 * f));
      }
      g.computeVertexNormals();
      return new THREE.Mesh(g, mat);
    };
    const cabEnd = () => {                                        // origin where the cab meets the car body, +z outward
      const end = new THREE.Group();
      end.add(noseBox(WIDE, FLOOR, TOP, body));
      end.add(noseBox(WIDE + 0.06, 2.45, 3.3, screenMat, 0.03));  // wraparound windscreen
      end.add(noseBox(WIDE + 0.06, 1.7, 2.0, stripe, 0.03));
      end.add(noseBox(WIDE - 0.3, 0.2, FLOOR, under, -0.5));
      for (const x of [-0.42, 0.42]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.1), lampMat); m.position.set(x, 1.38, CAB + 0.02); end.add(m);
        if (lit) { const g = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), glowMat); g.position.set(x, 1.38, CAB + 0.09); end.add(g); }
      }
      return end;
    };
    for (let i = 0; i < CARS; i++) {
      const car = new THREE.Group();                              // origin on the rail at the car's middle, +z forward
      const cabF = i === 0, cabR = i === CARS - 1;
      const len = CAR_LEN - (cabF ? CAB : 0) - (cabR ? CAB : 0), zc = ((cabR ? CAB : 0) - (cabF ? CAB : 0)) / 2;
      const part = (w, h, l, y, mat, z = 0, x = 0) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat); m.position.set(x, y, z); car.add(m); return m;
      };
      part(2.75, 0.85, CAR_LEN - 1.4 - (cabF || cabR ? CAB : 0), 0.62, under, zc);   // underframe and trucks
      part(WIDE, TOP - FLOOR, len, (FLOOR + TOP) / 2, body, zc);
      part(WIDE + 0.04, 0.3, len, 1.85, stripe, zc);
      part(WIDE + 0.05, 0.85, len - 2.4, 2.88, windowMat, zc);    // one row of windows
      part(2.6, 0.18, len - 0.6, TOP + 0.08, roofMat, zc);
      part(0.9, 0.08, len - 1.6, TOP + 0.2, stripe, zc);          // a teal band along the roof
      for (const z of [-len / 4, len / 4]) part(1.8, 0.3, 3.4, TOP + 0.3, under, zc + z);   // roof equipment
      if (i % 2 === 0) {                                          // pantograph
        const z = zc - len / 2 + 4.2;
        part(1.7, 0.07, 0.34, 5.42, under, z);
        for (const sg of [-1, 1]) { const arm = part(0.07, 1.75, 0.07, 4.7, under, z + sg * 0.5); arm.rotation.x = sg * 0.62; }
      }
      if (cabF) { const e = cabEnd(); e.position.z = CAR_LEN / 2 - CAB; car.add(e); }
      if (cabR) { const e = cabEnd(); e.position.z = -CAR_LEN / 2 + CAB; e.rotation.y = Math.PI; car.add(e); }
      train.add(car);
    }
    return train;
  };
  const train = makeTrain(false), oncoming = makeTrain(true);
  // Stand a train on a track with its nose at `front`, heading up (dir 1) or down (dir -1) the alignment.
  const placeTrain = (cars, front, side, dir) => {
    cars.children.forEach((car, i) => {
      const f = front - dir * i * (CAR_LEN + CAR_GAP);
      const a = at(f, side).p, b = at(f - dir * CAR_LEN, side).p;
      car.position.copy(a).add(b).multiplyScalar(0.5);
      car.lookAt(a);
    });
  };
  // An oncoming train on the other track: it passes the cab on the straight between Roosevelt and Taylor/Clinton.
  const MEET_D = stops[0] + 500, ON_SPEED = 40;                   // where the two noses pass; its speed, m/s of film
  let MEET_T = 0;                                                 // when (set once the timing below exists)
  const oncomingAt = (t) => MEET_D + (MEET_T - t) * ON_SPEED;

  /* ---- the shots from outside the cab. Each dissolves in and out of the operator's view:
          0  above the south portal, as the train runs down the ramp and in
          1  in the tunnel after Union Station, just ahead of the train, looking back at its cab
          2  above the north portal as the train comes out and stops at Chicago/Halsted; then the
             camera climbs away to the north-west until the whole city is in view, and the film ends ---- */
  const timeAtDist = (d) => { let lo = 0, hi = DURATION; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (distAt(m) < d) lo = m; else hi = m; } return lo; };
  const AIR_FADE = 0.45;
  const arrive = (S) => phases.find((q) => q.station === S).t0;
  const FRONT_IN = arrive(STN[2]) + DWELL + 1.0, FRONT_LEN = 4.8;
  const SHOTS = [
    { from: timeAtDist(PORTAL - 165), to: timeAtDist(PORTAL + 135) },
    { from: FRONT_IN, to: FRONT_IN + FRONT_LEN, dark: true },
    { from: timeAtDist(PORTAL2 - 120), to: Infinity },
  ];
  const shotAt = (t) => SHOTS.findIndex((s) => t > s.from && t < s.to);
  const airWeight = (t) => { const s = SHOTS[shotAt(t)]; return s ? smooth((t - s.from) / AIR_FADE) * (1 - smooth((t - (s.to - AIR_FADE)) / AIR_FADE)) : 0; };
  MEET_T = timeAtDist(MEET_D);
  const airCam = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
  scene.add(airCam);
  const airLamp = new THREE.PointLight(0xfff0d8, 0, 70, 1.4);     // lights the tunnel and the train's face in shot 1
  airCam.add(airLamp);
  // The closing shot's move: from PULL_FROM to PULL_TO the camera leaves its place by the north ramp for
  // one high over the tracks north-west of the station, and turns from the train to the Loop's towers.
  const PULL_FROM = arrive(CH) + 1.2, PULL_TO = DURATION - END_CREDITS - 2.4;
  const chAt = at(CH.d).p;
  const loopward = new THREE.Vector3(-1313 - chAt.x, 0, -1658 - chAt.z).normalize();   // from the station toward Willis Tower
  const HIGH = chAt.clone().addScaledVector(loopward, -950).setY(380);
  const HIGH_LOOK = chAt.clone().addScaledVector(loopward, 900).setY(60);
  const ease = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * x * (x * (x * 6 - 15) + 10); };

  function drawScene(t, shot = -1) {
    const dist = distAt(t), air = shot >= 0, dark = air && !!SHOTS[shot].dark;
    setPeople(t);
    // 0 in daylight, 1 underground: the eyes (and the lights) adjust as the cab passes each portal
    const under = air ? +dark : smooth((dist - (PORTAL - 14)) / 40) * (1 - smooth((dist - (PORTAL2 - 34)) / 40));
    scene.fog.color.copy(HAZE).lerp(DARK, under);
    scene.fog.density = HAZE_DENSITY + (0.0105 - HAZE_DENSITY) * under;
    hemi.intensity = 1.5 * (1 - under); sun.intensity = 2.2 * (1 - under);
    head.intensity = 30 + 230 * under;
    camera.visible = !air; train.visible = air && !dark;         // the cab interior and the train's outside never share a frame
    airLamp.intensity = dark ? 30 : 0;
    if (air) {
      const S = SHOTS[shot];
      oncoming.visible = dark;
      airCam.fov = 40;
      if (shot === 0) {
        const u = (t - S.from) / (S.to - S.from);                 // a slow push in over the shot
        const q = at(PORTAL + 30 - 10 * u, -27 + 4 * u);
        airCam.position.set(q.p.x, 40 - 6 * u, q.p.z);
        airCam.lookAt(at(PORTAL - 34 + 10 * u, OFF, 1).p);
      } else if (dark) {
        // a few metres ahead of the nose and a little to one side, drawing slowly closer; the lit train stands in for ours
        const u = (t - S.from) / (S.to - S.from), front = dist + NOSE;
        airCam.fov = 46;
        airCam.position.copy(at(front + 10 - 3 * u, OFF - 2.4 + 0.6 * u, 2.9).p);
        airCam.lookAt(at(front - 1.5, OFF, 2.5).p);
        placeTrain(oncoming, front, OFF, 1);
        oncoming.userData.glass.envMapRotation.y = dist / 26;     // the lamps' reflections cross the glass as the train moves
      } else {
        const e = ease((t - PULL_FROM) / (PULL_TO - PULL_FROM));
        // beside the ramp, drifting from near the portal toward the platforms as the train comes by
        const g = smooth((dist - (PORTAL2 - 60)) / (CH.stop - (PORTAL2 - 60)));
        const low = at(PORTAL2 + 90 + 140 * g, -42 - 8 * g).p.setY(33 + 15 * g);
        const car = at(dist - 14, OFF, 2).p;                      // the middle of the leading car
        airCam.position.copy(low).lerp(HIGH, e);
        airCam.lookAt(car.lerp(HIGH_LOOK, e));
        scene.fog.density = HAZE_DENSITY * (1 - 0.45 * e);        // a clearer day from up here, so the Loop reads
      }
      airCam.updateProjectionMatrix();
      scene.background.copy(scene.fog.color);
      sky.position.set(airCam.position.x, 0, airCam.position.z);
      if (!dark) placeTrain(train, Math.min(dist + NOSE, LENGTH - 2), OFF, 1);
      renderer.render(scene, airCam);
      return;
    }
    scene.background.copy(scene.fog.color);
    const on = oncomingAt(t);
    oncoming.visible = Math.abs(t - MEET_T) < 9 && on > PORTAL + 30 && on + CARS * (CAR_LEN + CAR_GAP) < PORTAL2 - 30;
    if (oncoming.visible) { placeTrain(oncoming, on, -OFF, -1); oncoming.userData.glass.envMapRotation.y = on / 26; }
    const eye = at(dist, OFF - 0.45, 2.25);
    camera.position.copy(eye.p);
    camera.position.y += 0.006 * Math.sin(dist * 1.9) + 0.003 * Math.sin(dist * 9.7);   // a little life from the track
    camera.lookAt(at(dist + 30, OFF - 0.2, 1.75).p);
    camera.rotateOnWorldAxis(eye.tan, -bankAt(dist));             // the cab leans with the track
    sky.position.set(eye.p.x, 0, eye.p.z);
    renderer.render(scene, camera);
  }

  /* ---- minimap, top right: a follow-cam window on a baked street map
          (the telemetry-recap-video skill's plate), with the line, the
          stations, how far the train has come, and where it is now ---- */
  let drawMini = () => {};
  if (mini) {
    const { img, geo } = mini, K = width / 1280;                 // sizes below are for a 1280-wide frame
    const M = geo.win_px, MS = 250 * K, PS = MS / M, PAD = 6 * K;   // the window is 250 px at 1280 wide, whatever the plate's own resolution
    const X = width - MS - 78 * K, Y = 40 * K;                    // clear of the cab's header and pillar
    const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070, RAD = Math.PI / 180;
    const platePx = (x, z) => {                                   // local metres -> plate pixels (Web Mercator)
      const lon = city.origin[0] + x / KX, lat = city.origin[1] - z / KY;
      const mx = lon * 20037508.342789244 / 180, my = Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) * 6378137;
      return [(mx - geo.x0) * geo.px_per_merc, (geo.y1 - my) * geo.px_per_merc];
    };
    const MSTEP = 6, line = [];
    for (let d = 0; d <= MAP_END; d += MSTEP) { const p = at(d).p; line.push(platePx(p.x, p.z)); }
    const pins = STN.map((S) => { const p = at(S.d).p; return platePx(p.x, p.z); });
    // Beyond the north portal the line joins the "Low Line" (the existing tracks) and
    // carries on north: the X1's route from the CrossTowner GTFS, as far as the plate goes.
    const lonLatPx = (lon, lat) => platePx((lon - city.origin[0]) * KX, (city.origin[1] - lat) * KY);
    const lineEnd = line[line.length - 1];
    const lowLine = [lineEnd, ...[[-87.647316, 41.895693], [-87.648754, 41.896827], [-87.650192, 41.897434], [-87.652831, 41.898248],
      [-87.65665, 41.899083], [-87.658753, 41.900265], [-87.659869, 41.901606], [-87.660335, 41.903426]]
      .map(([lon, lat]) => lonLatPx(lon, lat)).filter((q) => q[1] < lineEnd[1] - 3)];
    const lowJoin = lonLatPx(-87.645813, 41.894225);              // "Low Line connection" in lines.js
    const lowStops = [lonLatPx(-87.647364, 41.895754)];           // Chicago/Halsted (Bally's), the next station north
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    drawMini = (dist) => {
      const f = Math.min(dist / MSTEP, line.length - 1.001), i = Math.floor(f), u = f - i;
      const cx = line[i][0] + (line[i + 1][0] - line[i][0]) * u, cy = line[i][1] + (line[i + 1][1] - line[i][1]) * u;
      const ox = Math.min(Math.max(cx - M / 2, 0), geo.w - M), oy = Math.min(Math.max(cy - M / 2, 0), geo.h - M);
      const sx = (p) => X + (p[0] - ox) * PS, sy = (p) => Y + (p[1] - oy) * PS;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 14 * K; ctx.shadowOffsetY = 3 * K;
      ctx.fillStyle = "rgba(255,255,255,0.93)"; rr(X - PAD, Y - PAD, MS + PAD * 2, MS + PAD * 2, 22 * K); ctx.fill();
      ctx.shadowColor = "transparent";
      rr(X, Y, MS, MS, 16 * K); ctx.clip();
      ctx.imageSmoothingQuality = "high";                         // above 1080p the plate is enlarged
      ctx.drawImage(img, ox, oy, M, M, X, Y, MS, MS);
      const stroke = (from, to, color, w) => {
        ctx.beginPath();
        for (let k = from; k <= to; k++) { if (k === from) ctx.moveTo(sx(line[k]), sy(line[k])); else ctx.lineTo(sx(line[k]), sy(line[k])); }
        ctx.strokeStyle = color; ctx.lineWidth = w * K; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      };
      stroke(0, line.length - 1, "rgba(255,255,255,0.9)", 7);     // the whole line: a light casing...
      stroke(0, line.length - 1, "rgba(84,104,118,0.85)", 3.5);   // ...and a grey line
      for (const [color, w] of [["rgba(255,255,255,0.9)", 7], ["rgba(84,104,118,0.85)", 3.5]]) {   // the Low Line, on north
        ctx.beginPath();
        lowLine.forEach((q, k) => { if (k) ctx.lineTo(sx(q), sy(q)); else ctx.moveTo(sx(q), sy(q)); });
        ctx.strokeStyle = color; ctx.lineWidth = w * K; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      }
      ctx.beginPath();                                             // travelled so far, in CrossTowner teal
      for (let k = 0; k <= i; k++) { if (!k) ctx.moveTo(sx(line[0]), sy(line[0])); else ctx.lineTo(sx(line[k]), sy(line[k])); }
      ctx.lineTo(X + (cx - ox) * PS, Y + (cy - oy) * PS);
      ctx.strokeStyle = "#0B7285"; ctx.lineWidth = 5.5 * K; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      for (const p of pins) {                                      // stations
        ctx.beginPath(); ctx.arc(sx(p), sy(p), 6 * K, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 2.6 * K; ctx.strokeStyle = "#2c3e50"; ctx.stroke();
      }
      for (const q of lowStops) {
        ctx.beginPath(); ctx.arc(sx(q), sy(q), 6 * K, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 2.6 * K; ctx.strokeStyle = "#2c3e50"; ctx.stroke();
      }
      {                                                            // where the new line meets the Low Line
        const jx = sx(lowJoin), jy = sy(lowJoin);
        ctx.beginPath(); ctx.moveTo(jx - 7 * K, jy - 5 * K); ctx.lineTo(jx + 7 * K, jy + 5 * K);
        ctx.lineWidth = 3 * K; ctx.strokeStyle = "#2c3e50"; ctx.lineCap = "round"; ctx.stroke();
        ctx.font = `700 ${11 * K}px Helvetica, Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.lineWidth = 3.5 * K; ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineJoin = "round";
        for (const [text, dy] of [["Low Line", 0], ["to Clybourn", 12]]) {
          ctx.strokeText(text, jx + 13 * K, jy + (4 + dy) * K); ctx.fillStyle = "#2c3e50"; ctx.fillText(text, jx + 13 * K, jy + (4 + dy) * K);
        }
      }
      const tx = X + (cx - ox) * PS, ty = Y + (cy - oy) * PS;       // the train
      ctx.beginPath(); ctx.arc(tx, ty, 17 * K, 0, Math.PI * 2); ctx.fillStyle = "rgba(214,51,108,0.28)"; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 8.5 * K, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = 4.5 * K; ctx.strokeStyle = "#d6336c"; ctx.stroke();
      ctx.restore();
    };
  }

  /* ---- top left: how much faster than the timetable the film runs, and the timetable's clock ---- */
  // Open captions for the announcements, under the badge: what is being said, a sentence at a time.
  const drawCaption = (t) => {
    const cap = captions && captions.find((q) => t >= q.start && t < q.end);
    if (!cap) return;
    const K = width / 1280 * 1.3, x = 48 * K, y = 34 * K + 34 * K + 10 * K, MAXW = 400 * K, LINE = 23 * K, PAD = 13 * K;
    ctx.save();
    ctx.font = `600 ${17 * K}px Helvetica, Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const lines = [];
    for (const word of cap.text.split(" ")) {
      const tryLine = lines.length ? lines[lines.length - 1] + " " + word : word;
      if (lines.length && ctx.measureText(tryLine).width <= MAXW) lines[lines.length - 1] = tryLine; else lines.push(word);
    }
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + PAD * 2, h = lines.length * LINE + PAD * 1.3;
    ctx.globalAlpha = Math.min(1, (t - cap.start) / 0.12, (cap.end - t) / 0.12);
    ctx.fillStyle = "rgba(8,14,18,0.82)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14 * K); ctx.fill();
    ctx.fillStyle = "#fff";
    lines.forEach((l, i) => ctx.fillText(l, x + PAD, y + PAD * 0.65 + LINE * (i + 0.5) + K));
    ctx.restore();
  };
  const drawBadge = (t) => {
    const K = width / 1280 * 1.3, x = 48 * K, y = 34 * K, h = 34 * K;
    const c = Math.max(0, clockAt(Math.min(t, RIDE))), hh = Math.floor(c / 3600) % 24, mm = Math.floor(c / 60) % 60, ss = Math.floor(c) % 60;
    const clock = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
    ctx.save();
    ctx.font = `700 ${16 * K}px Helvetica, Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const a = `${SPEEDUP}\u00d7 speed`, wa = ctx.measureText(a).width;
    ctx.font = `500 ${15 * K}px Helvetica, Arial, sans-serif`;
    const wb = ctx.measureText("00:00:00 AM").width, w = 34 * K + wa + 14 * K + wb + 16 * K;
    ctx.fillStyle = "rgba(8,14,18,0.78)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = "#35d07f";                                    // a fast-forward mark
    for (const dx of [0, 9 * K]) { ctx.beginPath(); ctx.moveTo(x + 13 * K + dx, y + 10 * K); ctx.lineTo(x + 22 * K + dx, y + h / 2); ctx.lineTo(x + 13 * K + dx, y + h - 10 * K); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = `700 ${16 * K}px Helvetica, Arial, sans-serif`; ctx.fillText(a, x + 38 * K, y + h / 2 + K);
    // while a stop's dissolve skips ahead, the clock lights up and a second pill says what the stop really takes
    const skipping = Math.max(0, ...dwellMid.map((m) => smooth((t - (m - XFADE / 2 - 0.3)) / 0.3) * (1 - smooth((t - (m + XFADE / 2 + 0.5)) / 0.4))));
    ctx.fillStyle = skipping > 0.5 ? "#f4c400" : "rgba(255,255,255,0.78)"; ctx.font = `${skipping > 0.5 ? 700 : 500} ${15 * K}px Helvetica, Arial, sans-serif`; ctx.fillText(clock, x + 38 * K + wa + 14 * K, y + h / 2 + K);
    if (skipping > 0) {
      const label = `${DWELL_REAL}-second stop`, y2 = y, x2 = x + w + 10 * K;
      ctx.globalAlpha = skipping; ctx.font = `700 ${15 * K}px Helvetica, Arial, sans-serif`;
      const w2 = 46 * K + ctx.measureText(label).width + 18 * K;
      ctx.fillStyle = "#f4c400"; ctx.beginPath(); ctx.roundRect(x2, y2, w2, h, h / 2); ctx.fill();
      ctx.fillStyle = "#1b1b1d";                                  // a skip-ahead mark: two arrows and a bar
      for (const dx of [0, 9 * K]) { ctx.beginPath(); ctx.moveTo(x2 + 13 * K + dx, y2 + 10 * K); ctx.lineTo(x2 + 22 * K + dx, y2 + h / 2); ctx.lineTo(x2 + 13 * K + dx, y2 + h - 10 * K); ctx.fill(); }
      ctx.fillRect(x2 + 32 * K, y2 + 10 * K, 2.5 * K, h - 20 * K);
      ctx.fillText(label, x2 + 44 * K, y2 + h / 2 + K);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  // One output frame = SUBFRAMES renders spread over the shutter time, averaged.
  const airCanvas = document.createElement("canvas");
  airCanvas.width = width; airCanvas.height = height;
  const airCtx = airCanvas.getContext("2d");
  const laterCanvas = document.createElement("canvas");
  laterCanvas.width = width; laterCanvas.height = height;
  const laterCtx = laterCanvas.getContext("2d");
  function render(t) {
    const p = phaseAt(t), braking = !!p.run && speedAt(t + 0.05) < speedAt(t) - 0.02;
    // the doors open just after the train stops and close a moment before it leaves
    const doorsOpen = !!p.station && t - p.t0 > 0.3 && t - p.t0 < DWELL - 1.0;
    drawDisplay(speedAt(t) / SPEEDUP * 2.23694, distAt(t), p.station || null, doorsOpen);   // the real speed, not the film's
    lampBrake.material.color.setHex(braking ? 0xf4a300 : 0x3a3f42);
    lampPower.material.color.setHex(braking || p.station ? 0x3a3f42 : 0x35d07f);
    lampDoors.material.color.setHex(doorsOpen ? 0xf4c400 : 0x35d07f);
    const air = airWeight(t), shot = shotAt(t);
    const accumulate = (c, sh) => {
      for (let k = 0; k < SUBFRAMES; k++) {
        drawScene(t + ((k + 0.5) / SUBFRAMES - 0.5) * SHUTTER / FPS, sh);
        c.globalAlpha = 1 / (k + 1);
        c.drawImage(gl, 0, 0);
      }
      c.globalAlpha = 1;
    };
    ctx.globalAlpha = 1;
    const xi = dwellMid.findIndex((m) => Math.abs(t - m) < XFADE / 2);   // in a stop's dissolve?
    // One view (the cab's, sh = -1, or a shot's) drawn into c; in a stop's dissolve, the same view a minute on is laid over it.
    const view = (c, sh) => {
      if (xi < 0) return accumulate(c, sh);
      peopleForce = false; accumulate(c, sh);
      peopleForce = true; accumulate(laterCtx, sh); peopleForce = null;
      c.globalAlpha = smooth((t - (dwellMid[xi] - XFADE / 2)) / XFADE); c.drawImage(laterCanvas, 0, 0); c.globalAlpha = 1;
    };
    if (air < 1) view(ctx, -1);
    if (air > 0) {                                                // dissolve to and from a shot from outside
      view(air < 1 ? airCtx : ctx, shot);
      if (air < 1) { ctx.globalAlpha = air; ctx.drawImage(airCanvas, 0, 0); ctx.globalAlpha = 1; }
    }
    drawMini(distAt(t));
    drawBadge(t);
    drawCaption(t);
    // the end: fade to black over two seconds, then the credits
    const fade = smooth((t - (DURATION - END_CREDITS - 1.9)) / 2.0);
    if (fade > 0) {
      const K = width / 1280, credit = smooth((t - (DURATION - END_CREDITS)) / 0.6);
      ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, width, height);
      // Three sections, well apart, set on a left margin rather than centred, each sliding in in turn:
      // the campaign (name, site, logos to the right), who made the planner and this film, and the
      // credits for the voice and the map. The last two hang from a label column on the left.
      const tc = t - (DURATION - END_CREDITS), SANS = "Helvetica, Arial, sans-serif";
      const BLUE = "#a8dcff", RED = "#f72f3a";                  // the CrossTowner logo's own blue and red
      const LEFT = 96 * K, RIGHT = width - 96 * K, COL = 420 * K;   // margins, and where the content column starts
      const slide = (delay) => { const u = Math.min(Math.max((tc - delay) / 0.7, 0), 1); return 1 - (1 - u) ** 3; };   // 0..1, easing out
      const text = (str, x, y, font, color, spacing = 0) => {
        ctx.font = font; ctx.fillStyle = color; ctx.letterSpacing = `${spacing * K}px`; ctx.fillText(str, x, y); ctx.letterSpacing = "0px";
      };
      const rule = (y, delay, alpha) => {                          // a line drawn across from the left margin to the right
        const g = slide(delay), x1 = LEFT + (RIGHT - LEFT) * g;
        if (g <= 0) return;
        ctx.globalAlpha = credit * alpha * Math.min(1, g * 3);
        ctx.strokeStyle = BLUE; ctx.fillStyle = BLUE; ctx.lineWidth = 2.5 * K; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(LEFT, y * K); ctx.lineTo(x1, y * K); ctx.stroke();
      };
      // the tunnel, faintly, off to the right behind the logos: rings that keep coming, as they did all ride
      ctx.globalAlpha = credit; ctx.lineWidth = 1.5 * K;
      for (let i = 0; i < 9; i++) {
        const u = ((i + tc * 0.22) % 9) / 9, r = (30 + 900 * u * u) * K;
        ctx.strokeStyle = `rgba(159,216,255,${(0.12 * (1 - u) + 0.015) * Math.min(1, u * 4)})`;   // the smallest rings stay out of the logos' way
        ctx.beginPath(); ctx.ellipse(1062 * K, 214 * K, r, r * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.textBaseline = "middle";
      // 1. the campaign
      {
        const g = slide(0.1), dx = (g - 1) * 40 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("CrossTowner", LEFT - 4 * K + dx, 172 * K, `800 ${92 * K}px ${SANS}`, "#fff");
        text("#BuildTheTunnel", LEFT - 4 * K + dx, 268 * K, `800 ${92 * K}px ${SANS}`, RED);
        // the official site, as a button
        ctx.font = `700 ${27 * K}px ${SANS}`; const url = "buildthetunnelchicago.org", wu = ctx.measureText(url).width + 56 * K, hu = 52 * K;
        ctx.fillStyle = BLUE; ctx.beginPath(); ctx.roundRect(LEFT + dx, 356 * K - hu / 2, wu, hu, hu / 2); ctx.fill();
        text(url, LEFT + 28 * K + dx, 357 * K, `700 ${27 * K}px ${SANS}`, "#06202e");
        if (logos) {                                               // the campaign's own marks, from buildthetunnelchicago.org, on the right margin
          const gl = slide(0.45), H = 104 * K, cap = `500 ${13 * K}px ${SANS}`;
          ctx.globalAlpha = credit * gl; ctx.textAlign = "right";
          [[logos.crosstowner, "CrossTowner Regional Rail", 150], [logos.starline, "Star:Line Chicago", 310]].forEach(([im, name, y]) => {
            const w = H * im.width / im.height, x = RIGHT - w + (1 - gl) * 40 * K;
            ctx.drawImage(im, x, y * K - H / 2, w, H);
            text(name, RIGHT + (1 - gl) * 40 * K, y * K + H / 2 + 16 * K, cap, "rgba(255,255,255,0.72)");
          });
        }
      }
      rule(432, 0.9, 1);
      // 2. who made the planner and the film
      {
        const g = slide(1.2), dx = (g - 1) * 30 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("TRIP PLANNER + VIDEO", LEFT + dx, 492 * K, `600 ${13 * K}px ${SANS}`, "rgba(255,255,255,0.62)", 2.6);
        text("Steven Vance", COL + dx, 488 * K, `700 ${26 * K}px ${SANS}`, "#fff");
        text("tunnel.stevevance.net", COL + dx, 522 * K, `600 ${18 * K}px ${SANS}`, BLUE);
      }
      rule(590, 1.8, 0.45);
      // 3. the voice and the map
      {
        const g = slide(2.1), dx = (g - 1) * 30 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("CREDITS", LEFT + dx, 630 * K, `600 ${13 * K}px ${SANS}`, "rgba(255,255,255,0.62)", 2.6);
        text("Station announcements: Apple text to speech (macOS system voice “Zoe”)", COL + dx, 630 * K, `400 ${15 * K}px ${SANS}`, "rgba(255,255,255,0.7)");
        text("Buildings, streets and map © OpenStreetMap contributors", COL + dx, 655 * K, `400 ${15 * K}px ${SANS}`, "rgba(255,255,255,0.7)");
      }
      ctx.textAlign = "center";
      ctx.globalAlpha = 1;
    }
  }
  // Still views of the people at one station, for approving them without rendering the film:
  // close on the wheelchair user, the stroller, the bike, a family, a traveller and a couple, then
  // each platform from the track.
  const previewCam = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
  scene.add(previewCam);
  function preview(i, station = 0) {
    const S = ALL[station], spots = peopleSpots.filter((o) => o.station === station);
    scene.fog.color.copy(DARK); scene.fog.density = 0.0105; scene.background.copy(DARK);
    hemi.intensity = 0; sun.intensity = 0;
    camera.visible = false; train.visible = false; oncoming.visible = false;
    const close = (kind) => {
      const o = spots.find((q) => q.kind === kind), sg = Math.sign(o.side), q = at(o.d + 2.1, o.side - sg * 2.9, PLAT_UP + 1.35);
      previewCam.fov = 42; previewCam.position.copy(q.p); previewCam.lookAt(at(o.d + 0.25, o.side, PLAT_UP + 0.8).p);
    };
    const wide = (sg, back) => {
      previewCam.fov = 58; previewCam.position.copy(at(S.stop - back, sg * 1.2, 2.6).p); previewCam.lookAt(at(S.stop + 16, sg * 5.6, 1.9).p);
    };
    [() => close("wheelchair"), () => close("stroller"), () => close("bike"), () => close("family"), () => close("traveller"), () => close("couple"),
      () => wide(1, 4), () => wide(-1, 4)][i % 8]();
    previewCam.updateProjectionMatrix();
    renderer.render(scene, previewCam);
    ctx.globalAlpha = 1; ctx.drawImage(gl, 0, 0);
  }
  return { render, preview, duration: DURATION, info: { LENGTH, PORTAL, PORTAL2, speedup: SPEEDUP, ride: RIDE, duration: DURATION, peakMph: phases.filter((ph) => ph.run).map((ph) => +(ph.run.peak * 2.23694).toFixed(1)), runSeconds: phases.filter((ph) => ph.run).map((ph) => Math.round(ph.run.T)),
    curves: curveLimits.map((q) => ({ from: Math.round(q.from), to: Math.round(q.to), radius: Math.round(q.radius), mph: +q.mph.toFixed(1) })), overhead: [SHOTS[0].from, SHOTS[0].to], shots: SHOTS.map((q) => [q.from, Math.min(q.to, DURATION)]), meet: MEET_T, tunnel: [timeAtDist(PORTAL), timeAtDist(PORTAL2)],
    mph: Array.from({ length: Math.ceil(DURATION * 10) }, (_, i) => +(speedAt(i / 10) / SPEEDUP * 2.23694).toFixed(1)),   // every 0.1 s, for the sound of the train
    dwell: DWELL, rampStart: RAMP_START, rampEnd: RAMP_END, banked: (() => { const r = []; let from = null; bankTable.forEach((v, i) => { const on = Math.abs(v) > 0.004; if (on && from === null) from = i; if (!on && from !== null) { r.push([from * BANK_STEP, i * BANK_STEP, +Math.max(...bankTable.slice(from, i).map(Math.abs)).toFixed(3), Math.sign(bankTable[from + 1])]); from = null; } }); return r; })(),
    stations: ALL.map((S) => ({ name: S.name, d: S.d, off: S.best, platFrom: S.platFrom, platTo: S.platTo })),
    arrivals: phases.filter((ph) => ph.station).map((ph) => ({ name: ph.station.name, t: ph.t0 })) } };
}
