// The CrossTowner train from outside, modeled on Metra's Stadler FLIRT battery train (BEMU) without its PowerPack: four
// single-deck cars, cab car, intermediate car, intermediate car, cab car, riding on shared (Jacobs) bogies where they
// meet and a motor bogie under each cab, with a pantograph on the leading intermediate car, in CrossTowner livery.
// Lengths, heights, doors, windows and bogies follow Stadler's data sheet for Metra (FBEMU_Metra0724en_us: cars 2880 mm
// wide and 4129 mm tall, 870 mm wheels, 2700 mm bogies, 1800 mm doors, 24 in boarding) and the elevation drawn on it,
// from which the car lengths are scaled; the nose follows photographs of the train shown at APTA EXPO 2026 in Chicago.
// 74.8 m. The PowerPack (the batteries) is its own module, assets/flirt-powerpack.js, whose BEMU_CONSIST puts it back
// between the intermediate cars. Lifted out of the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers) so it can
// be shared.
//
//   import * as THREE from "three";
//   import { buildCrossTowner, TRAIN_LENGTH } from "./crosstowner-train.js";
//   const train = buildCrossTowner({ THREE });   // a THREE.Group; its cars are its children, front car first
//   scene.add(train);
//
// Each car's origin is on the rail at the middle of its length, +z forward, y up, in metres. A car runs from joint to
// joint (from the coupler, for a cab car), and car.userData has its length (len) and how far its front is behind the
// train's (from), so the caller can stand each car on its track (the film does: see placeTrain there); or `layout: true`
// strings them along -z behind the front car. lit: seen in the dark, so the windows and lamps glow and the windscreen
// mirrors lamps. sill: the doors' sill above the rail (the BEMU's low floor by default; the film raises it to its
// platforms). sign: the destination on the sign at the top of the windscreen. consist: the cars, front first (CONSIST
// by default); besides "cab" and "mid" cars, an entry may bring its own model, { len, build(kit) }, as the PowerPack does.
// train.userData.glass is the windscreen's material (the film turns its reflection with the lamps in the tunnel).
// It needs a browser (or another DOM with <canvas>): the livery is painted on canvas textures.
export const CONSIST = [
  { kind: "cab", len: 21.6 },
  { kind: "mid", len: 15.8, pan: true },
  { kind: "mid", len: 15.8, flip: true },
  { kind: "cab", len: 21.6, flip: true },
];
export const TRAIN_LENGTH = CONSIST.reduce((s, c) => s + c.len, 0);   // coupler to coupler, 74.8 m

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, f) => a + (b - a) * f;
// A smooth curve through [x, y] points that never overshoots them (monotone cubic), level at its far end.
const spline = (P) => {
  const n = P.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((P[i + 1][1] - P[i][1]) / (P[i + 1][0] - P[i][0]));
  m.push(d[0]);
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(0);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (x) => {
    if (x <= P[0][0]) return P[0][1];
    if (x >= P[n - 1][0]) return P[n - 1][1];
    let i = 0; while (x > P[i + 1][0]) i++;
    const h = P[i + 1][0] - P[i][0], t = (x - P[i][0]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * P[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * P[i + 1][1] + (t3 - t2) * h * m[i + 1];
  };
};

// A cross-section, bottom left round over the roof to bottom right ([x, y], metres): sides that lean out a little from
// the bottom b (half-width hb) and stand straight (half-width hs) to ys, then a superellipse of exponent n over the
// top to the crown, T: on the car body, the FLIRT's broad rounded shoulder up to a narrower roof. The car body, the nose (every section of it) and the PowerPack are all drawn by it, with the
// same number of points, so that one runs smoothly into the next.
const TOP_N = 12;
const section = ({ b, hb, hs, ys, T, n }) => {
  const ym = Math.min(b + 0.7, b + (ys - b) * 0.35), half = [];
  for (let k = 0; k < 3; k++) half.push([lerp(hb, hs, k / 3), lerp(b, ym, k / 3)]);
  for (let k = 0; k < 6; k++) half.push([hs, lerp(ym, ys, k / 6)]);
  for (let k = 0; k < TOP_N; k++) {
    const a = k / (TOP_N - 1) * Math.PI / 2;
    half.push([hs * Math.cos(a) ** (2 / n), ys + (T - ys) * Math.sin(a) ** (2 / n)]);
  }
  half[half.length - 1][0] = 0;
  return [...half.map(([x, y]) => [-x, y]), ...half.slice(0, -1).reverse()];   // up the left side to the crown, down the right
};
const BODY = { b: 1.0, hb: 1.38, hs: 1.44, ys: 3.05, T: 3.92, n: 3 };       // 2.88 m wide, roof crown 3.92 m (4.13 over the roof units)
const PROFILE = section(BODY);
// the low-floor belly between the bogies, hung under the body: down to 0.5 m above the rail
const BELLY = (() => {
  const half = [[1.38, 1.0], [1.37, 0.72], [1.335, 0.6], [1.27, 0.53], [1.17, 0.5], [0, 0.5]];
  return [...half.map(([x, y]) => [-x, y]), ...half.slice(0, -1).reverse()];
})();
const arcs = (P) => {                                    // how far round the profile each point is, 0..1
  const a = [0];
  for (let j = 1; j < P.length; j++) a.push(a[j - 1] + Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]));
  return a.map((x) => x / a[a.length - 1]);
};
// how far round the profile (0..1, from its first point) its left side is at height y; the right side is 1 minus it
const vLeftOf = (P, V) => {
  const left = P.slice(0, (P.length + 1) / 2), ys = left.map(([, y]) => y), lo = Math.min(...ys), hi = Math.max(...ys);
  return (y) => {
    y = Math.min(hi, Math.max(lo, y));
    for (let j = 0; j < left.length - 1; j++) {
      const ya = left[j][1], yb = left[j + 1][1];
      if ((y - ya) * (y - yb) <= 0 && ya !== yb) return V[j] + (y - ya) / (yb - ya) * (V[j + 1] - V[j]);
    }
    return ys.indexOf(y) >= 0 ? V[ys.indexOf(y)] : 0.5;
  };
};

// The nose, s metres back from its front face (s = 0) to where it meets the body (NOSE_L). From the side, the crown
// (nT) is the outline in Stadler's drawing: a near-upright face to 1.95 m, then the long raked windscreen up to the roof;
// from above (nHB, nHS) it narrows to 2.24 m across the face; nYS and nN shape how the windscreen wraps round. The
// coupler and the crash boxes stand TIP ahead of the face.
const NOSE_L = 3.5, TIP = 0.8;
const nT = spline([[0, 1.95], [0.12, 2.2], [0.3, 2.52], [0.7, 3.05], [1.25, 3.55], [1.8, 3.82], [2.4, 3.92]]);
const nHB = spline([[0, 1.12], [0.25, 1.25], [0.6, 1.33], [1.1, 1.37], [1.8, 1.38]]);
const nHS = spline([[0, 1.06], [0.3, 1.18], [0.7, 1.3], [1.2, 1.38], [1.8, 1.43], [2.4, 1.44]]);
const nYS = spline([[0, 1.62], [0.3, 1.92], [0.7, 2.2], [1.25, 2.5], [1.8, 2.85], [2.4, 3.05]]);
const nN = spline([[0, 3.2], [0.3, 2.4], [1.2, 2.4], [2.4, 3]]);
const nB = (s) => lerp(0.58, BODY.b, smooth((s - 2.9) / 0.25));      // the nose's skirt, low to just ahead of the bogie
const noseSection = (s) => section({ b: nB(s), hb: nHB(s), hs: nHS(s), ys: nYS(s), T: nT(s), n: nN(s) });
// On the nose (x across, y up, s back from the face): the windscreen's bottom edge, a shallow V lowest in the middle;
// its top edge; how far back it wraps round the side at height y; the cab's side window and the crew door behind it.
const glassFoot = (x) => 1.97 + 0.3 * clamp01(Math.abs(x) / 0.98) ** 1.4;
const glassTop = (x) => 3.6 - 0.22 * clamp01(Math.abs(x) / 0.9) ** 2.2;
const glassWrap = (y) => 0.78 + (y - 2.31) * 0.56;
const CREW_DOOR = [2.05, 3.4];                             // (s) a hinged door with a drop window, behind the cab's side window
// For the cab seen from inside (cab-ride.js): the nose's half-width at s metres back and y up, and the edges above.
export const FLIRT_CAB = {
  glassFoot, glassTop, glassWrap, SIDE_WIN: { y0: 2.31, y1: 3.12, back: 1.93 },
  halfWidth(s, y) {                                        // on the nose's right side, where it is at height y
    const P = s < NOSE_L ? noseSection(Math.max(0, s)) : PROFILE, mid = (P.length - 1) / 2;
    for (let k = mid; k < P.length - 1; k++) {
      const [x0, y0] = P[k], [x1, y1] = P[k + 1];
      if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) return x0 + (x1 - x0) * (y - y0) / (y1 - y0);
    }
    return P[P.length - 1][0];
  },
};

// Windows ([front, back, kind], metres back from the car's front end) and doors (their middles), from the drawing. Where
// the floor is low (between the bogies) the windows reach lower; over the bogies, where it steps up, they sit higher.
// The intermediate cars have two doors a side, a third of the way in from each end (assumed: Metra's BEMU, as drawn,
// has one, near the cab car's end: bemuMid, which the BEMU in assets/flirt-powerpack.js uses).
const WIN_Y = { h: [1.88, 2.72], l: [1.38, 2.72], j: [1.74, 2.72] };
const CARS = {
  cab: { windows: [[6.74, 7.93, "h"], [8.6, 9.75, "h"], [12.07, 13.47, "l"], [13.88, 15.29, "l"], [15.7, 17.1, "l"], [17.5, 18.9, "l"], [19.4, 20.6, "j"]],
    doors: [10.95], belly: [7.8, 19.4] },
  mid: { windows: [[1.07, 2.19, "j"], [2.45, 3.55, "l"], [5.75, 7.0, "l"], [7.275, 8.525, "l"], [8.8, 10.05, "l"], [12.25, 13.35, "l"], [13.61, 14.73, "j"]],
    doors: [4.6, 11.2], belly: [1.8, 14.0] },
  bemuMid: { windows: [[1.07, 2.19, "j"], [2.75, 4.0, "l"], [6.4, 7.67, "l"], [8.2, 9.5, "l"], [10.06, 11.3, "l"], [11.9, 13.1, "l"], [13.7, 14.8, "j"]],
    doors: [5.2], belly: [1.8, 14.0] },
};
const DOOR_W = 1.6, DOOR_TOP = 3.0, BAND = [1.12, 1.32], END = 0.25;   // door frame width; the teal band; body ends short of each joint

export { section, arcs, vLeftOf, BODY, END };            // for other FLIRT pieces built to match (assets/flirt-powerpack.js)

// The parts every piece of the train is made with, so that others built to match it (the PowerPack) share them: its
// materials and the sky they reflect, geometry helpers, the livery painter, bogies, roof units and the pantograph.
export function flirtKit({ THREE, lit = false }) {
  const paint = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25, ...extra });
  const under = paint(0x23282b, { roughness: 0.9 }), roofGrey = paint(0x9aa2a6, { roughness: 0.7 }), fanMat = paint(0x2a3034, { roughness: 0.6 });
  const wheelMat = paint(0x3a3f42, { roughness: 0.5, metalness: 0.6 }), bellows = paint(0x15191b, { roughness: 0.95, metalness: 0 });
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x14181a, roughness: 0.3, metalness: 0.6 });
  const boxMat = paint(0x3d4448, { roughness: 0.6, metalness: 0.35 });
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
  const canvasTex = (cv, srgb = true) => { const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const BODY_C = "#dce2e4", ROOF_C = "#b9c0c3", TEAL = "#0b7285", GLASS_C = "#1a2329";
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  // A loft through cross-sections at z = zs[i] (in order of z), its u from us[i] and v from vs[j]; faces outward.
  const loft = (sections, zs, us, vs) => {
    const pos = [], uv = [], idx = [], np = sections[0].length;
    sections.forEach((sec, i) => {
      sec.forEach(([x, y], j) => { pos.push(x, y, zs[i]); uv.push(us[i], vs[j]); });
      if (i < sections.length - 1) for (let j = 0; j < np - 1; j++) { const a = i * np + j, b = a + np; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  // a flat end on a profile at z, facing +z or -z, its uv all at one spot (uvAt) of the texture, or mapped by uvOf(x, y)
  const cap = (P, z, facing, uvAt = [0.002, 0.3], uvOf = null) => {
    const g = new THREE.ShapeGeometry(new THREE.Shape(P.map(([x, y]) => new THREE.Vector2(x, y))));
    if (facing < 0) { g.scale(-1, 1, 1); }
    g.translate(0, 0, z);
    const p = g.attributes.position, uv = new Float32Array(p.count * 2);
    for (let k = 0; k < p.count; k++) { const q = uvOf ? uvOf(p.getX(k), p.getY(k)) : uvAt; uv[2 * k] = q[0]; uv[2 * k + 1] = q[1]; }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  };
  const prism = (P, z0, z1, V, caps = [true, true]) => {    // a profile swept straight from z0 to z1, u = 0 at z0
    const parts = [loft([P, P], [z0, z1], [0, 1], V)];
    if (caps[0]) parts.push(cap(P, z0, -1)); if (caps[1]) parts.push(cap(P, z1, 1));
    return parts;
  };
  // a box with rounded edges, w x h x l, centred
  const rounded = (w, h, l, r, mat) => {
    const sh = new THREE.Shape(), a = w / 2 - r, b = h / 2 - r;
    sh.moveTo(-a, -h / 2); sh.lineTo(a, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -b); sh.lineTo(w / 2, b); sh.quadraticCurveTo(w / 2, h / 2, a, h / 2);
    sh.lineTo(-a, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, b); sh.lineTo(-w / 2, -b); sh.quadraticCurveTo(-w / 2, -h / 2, -a, -h / 2);
    const g = new THREE.ExtrudeGeometry(sh, { depth: l - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 4, curveSegments: 6 });
    g.translate(0, 0, -(l - 2 * r) / 2); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  };
  // a shape drawn from the side ([along, up] points, `along` metres back from z0) and extruded w across: roof fairings
  const sidewise = (pts, w, z0, mat, r = 0.1) => {
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([a, y]) => new THREE.Vector2(a, y))),
      { depth: w - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const a = p.getX(k), y = p.getY(k), d = p.getZ(k); p.setXYZ(k, d - (w - 2 * r) / 2, y, z0 - a); }
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  };
  const rod = (a, b, r, mat) => {                                // a round bar from a to b
    const A = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(A), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
    m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  const box = (g, w, h, l, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat); m.position.set(x, y, z); g.add(m); return m; };

  /* ---- the livery, painted ---- */
  const PX = 64, TH = 512;                                     // texture pixels per metre along a car; round the profile
  // A car's side and roof, painted: its width runs along the car from its front end (zf = f0) back to f1, and its
  // height round the profile (vAt: how far round it the left side is at height y). draw(api) paints on it. glow: the
  // windows alone, white on black, for the lit train's emissive map.
  const sideCanvas = (f0, f1, vAt, draw, glow) => {
    const cv = document.createElement("canvas"); cv.width = Math.round((f1 - f0) * PX); cv.height = TH;
    const c = cv.getContext("2d"), zx = (zf) => (f1 - zf) / (f1 - f0) * cv.width;   // u runs toward the front
    const rows = (y0, y1) => [[(1 - vAt(y1)) * TH, (1 - vAt(y0)) * TH], [vAt(y0) * TH, vAt(y1) * TH]];   // [top, bottom] on each side
    const band = (y0, y1, z0, z1, fill, r = 0) => rows(y0, y1).forEach(([t, b]) => {
      c.fillStyle = fill; c.beginPath(); c.roundRect(zx(z1), Math.min(t, b), zx(z0) - zx(z1), Math.abs(b - t), r); c.fill();
    });
    // words on both sides, reading the right way round on each (the right-hand side's texture runs back to front and
    // upside down, so they're turned round there)
    const words = (text, zc, y0, y1, fill, weight = 700) => rows(y0, y1).forEach(([t, b], k) => {
      c.save(); c.fillStyle = fill; c.font = `${weight} ${Math.round(Math.abs(b - t))}px Helvetica, Arial, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
      c.translate(zx(zc), (t + b) / 2); if (k === 1) c.rotate(Math.PI); c.fillText(text, 0, (b - t) * 0.06); c.restore();
    });
    c.fillStyle = glow ? "#000" : BODY_C; c.fillRect(0, 0, cv.width, TH);
    draw({ band, words, glow });
    return canvasTex(cv);
  };
  const plainBody = new THREE.MeshStandardMaterial({ color: BODY_C, roughness: 0.4, metalness: 0.12, envMap: glare, envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide });
  const fairingMat = new THREE.MeshStandardMaterial({ color: 0xc9d0d3, roughness: 0.5, metalness: 0.12, envMap: glare, envMapIntensity: 0.3 });

  // bogies: a frame on four 870 mm wheels, 2.7 m apart; a motor bogie has its traction motors slung between
  const bogie = (motor) => {
    const g = new THREE.Group();
    box(g, 2.15, 0.34, 3.3, 0, 0.66, 0, under);
    for (const wz of [-1.35, 1.35]) for (const wx of [-0.75, 0.75]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.435, 0.435, 0.14, 24), wheelMat); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.435, wz); g.add(w);
      box(g, 0.24, 0.22, 0.36, wx * 1.18, 0.47, wz, under);
    }
    if (motor) for (const wz of [-0.55, 0.55]) box(g, 1.3, 0.42, 0.5, 0, 0.52, wz, boxMat);
    return g;
  };
  const roofUnit = (len) => {                                     // an air-conditioning unit, its fans on top
    const g = new THREE.Group(), ac = rounded(1.8, 0.32, len, 0.1, roofGrey); ac.position.y = BODY.T; g.add(ac);
    for (const fz of [-len / 4, len / 4]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 24), fanMat); f.position.set(0, BODY.T + 0.165, fz); g.add(f); }
    return g;
  };
  // a single-arm pantograph, raised to the wire, on its base at y0
  const pantograph = (z, y0) => {
    const g = new THREE.Group();
    box(g, 1.3, 0.1, 0.9, 0, y0, z, under);                         // its base, on insulators
    for (const sx of [-0.5, 0.5]) for (const sz of [-0.35, 0.35]) box(g, 0.1, 0.16, 0.1, sx, y0 - 0.08, z + sz, fanMat);
    const knee = [0, y0 + 0.62, z + 1.15], head = [0, 5.42, z + 0.15];
    g.add(rod([0, y0 + 0.05, z - 0.3], knee, 0.045, under), rod(knee, head, 0.03, under));   // lower and upper arms
    g.add(rod([0, y0 + 0.05, z - 0.1], [0, y0 + 0.5, z + 0.9], 0.015, under));               // the link that keeps the head level
    g.add(rod([-0.85, 5.45, z + 0.15], [0.85, 5.45, z + 0.15], 0.035, under));                // the pan, on the wire
    return g;
  };
  const meshesTo = (g, geos, mat) => geos.forEach((geo) => g.add(new THREE.Mesh(geo, mat)));
  return { THREE, lit, paint, under, roofGrey, fanMat, wheelMat, bellows, housingMat, boxMat, glare, canvasTex, BODY_C, ROOF_C, TEAL, GLASS_C, rgb,
    loft, cap, prism, rounded, sidewise, rod, box, sideCanvas, plainBody, fairingMat, bogie, roofUnit, pantograph, meshesTo };
}

const NOSE_LOOKS = new Map();                                // the nose's paintings, by sign and sill

export function buildCrossTowner({ THREE, lit = false, layout = false, sill = 0.615, sign = "CrossTowner", consist = CONSIST }) {
  const train = new THREE.Group(), K = flirtKit({ THREE, lit });
  const { under, bellows, housingMat, boxMat, glare, canvasTex, BODY_C, ROOF_C, TEAL, GLASS_C, rgb, loft, cap, prism, rounded, sidewise, box,
    sideCanvas, plainBody, fairingMat, bogie, roofUnit, pantograph, meshesTo } = K;
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: !lit }), tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a1c, fog: !lit });
  // A headlamp's glow, as a camera would see it: a soft bloom that fades smoothly to nothing (a radial gradient on a
  // sprite, so it always faces the lens), and a faint horizontal streak through it, as lens flare spreads in a camera.
  const glowTex = (stops) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const c = cv.getContext("2d"), g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach(([at, a]) => g.addColorStop(at, `rgba(255,246,228,${a})`));
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const sprite = (stops, color, opacity = 1) => new THREE.SpriteMaterial({ map: glowTex(stops), color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const glowMat = lit ? sprite([[0, 1], [0.08, 0.85], [0.25, 0.32], [0.55, 0.08], [1, 0]], 0xfff3dc) : null;
  const streakMat = lit ? sprite([[0, 0.55], [0.3, 0.12], [1, 0]], 0xdfe9ff, 0.6) : null;
  const tailGlow = lit ? sprite([[0, 0.9], [0.15, 0.5], [0.5, 0.08], [1, 0]], 0xff3322) : null;
  const VB = arcs(PROFILE), vBody = vLeftOf(PROFILE, VB);
  const windowsAndDoors = ({ band, glow }, spec) => {
    for (const [z0, z1, k] of spec.windows) {
      const [y0, y1] = WIN_Y[k];
      band(y0, y1, z0, z1, glow ? "#fff" : GLASS_C, 9);
      if (!glow) band(y1 - 0.26, y1 - 0.04, z0 + 0.06, z1 - 0.06, "rgba(190,215,230,0.18)", 6);   // sky caught in the glass
    }
    for (const d of spec.doors) {                                  // a pair of plug doors, each with a tall window
      const top = DOOR_TOP, lo = Math.max(sill, BODY.b);
      if (!glow) {
        band(lo, top + 0.04, d - DOOR_W / 2 - 0.04, d + DOOR_W / 2 + 0.04, "#59636a", 7); band(lo, top, d - DOOR_W / 2, d + DOOR_W / 2, "#c9d0d3", 6);
        band(lo, top, d - 0.015, d + 0.015, "#59636a"); band(top + 0.1, top + 0.13, d - DOOR_W / 2 - 0.2, d + DOOR_W / 2 + 0.2, "#59636a");
        if (sill < BAND[1]) band(Math.max(lo, BAND[0]), BAND[1], d - DOOR_W / 2, d + DOOR_W / 2, TEAL);   // the band runs on across the doors
      }
      for (const sg of [-1, 1]) band(1.42, 2.66, d + (sg < 0 ? -0.66 : 0.14), d + (sg < 0 ? -0.14 : 0.66), glow ? "#fff" : GLASS_C, 6);
    }
  };
  const bodyTex = {};                                              // one painting per kind of car, shared
  const carTexture = (kind, f0, f1, glow) => {
    const key = `${kind}${glow ? "-glow" : ""}`;
    if (bodyTex[key]) return bodyTex[key];
    return (bodyTex[key] = sideCanvas(f0, f1, vBody, (api) => {
      const { band, words } = api;
      if (!glow) {
        band(3.72, 9, 0, f1, ROOF_C);                              // a grey roof
        band(3.0, 3.03, 0, f1, "#a9b2b6");                          // a rain strip where the shoulder begins
        band(BAND[0], BAND[1], 0, f1, TEAL);                        // the CrossTowner teal band, low on the side
        if (kind === "cab") words("CrossTowner", 5.45, 2.0, 2.3, TEAL);   // on the cab car's blank side over its motor bogie
      }
      windowsAndDoors(api, CARS[kind]);
    }, glow));
  };
  const bodyMat = (kind, f0, f1) => new THREE.MeshStandardMaterial({ map: carTexture(kind, f0, f1, false), roughness: 0.4, metalness: 0.12, envMap: glare,
    envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide,
    ...(lit ? { emissive: 0xfff0c8, emissiveIntensity: 0.55, emissiveMap: carTexture(kind, f0, f1, true) } : {}) });


  // The nose's paint, worked out texel by texel from where each one lands on it: body, the teal (a V under the
  // windscreen that sweeps back along the cab's sides into the band), the cab's windows (as glass, in a mask for the
  // mirror-like windscreen laid over it) and the destination sign at the top of the windscreen.
  const NS = 40, NU = 512, NV = 1024;                            // nose sections; texels along it, round it
  const nP = PROFILE.length, nV = PROFILE.map((_, j) => j / (nP - 1));
  const noseLook = (() => {
    const key = `${sign}|${sill}`;
    const cvs = NOSE_LOOKS.get(key) || paintNose();
    NOSE_LOOKS.set(key, cvs);
    return { body: canvasTex(cvs.body), mask: canvasTex(cvs.mask, false), glow: canvasTex(cvs.glow), face: canvasTex(cvs.face) };
  })();
  // (worked out once for each sign and sill, and shared between trains: it takes a moment, four samples a texel)
  function paintNose() {
    const mk = (w, h) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; return cv; };
    const body = mk(NU, NV), mask = mk(NU, NV), glowC = mk(NU, NV), face = mk(256, 160);
    const bc = body.getContext("2d"), mc = mask.getContext("2d"), gc = glowC.getContext("2d");
    const B = bc.createImageData(NU, NV), M = mc.createImageData(NU, NV), G = gc.createImageData(NU, NV);
    // the sign's words, drawn once and sampled
    const sw = 512, sh = 72, sv = mk(sw, sh), sx = sv.getContext("2d");
    sx.fillStyle = "#000"; sx.fillRect(0, 0, sw, sh);
    sx.fillStyle = "#ffb347"; sx.font = "700 50px Helvetica, Arial, sans-serif"; sx.textAlign = "center"; sx.textBaseline = "middle";
    sx.fillText(sign, sw / 2, sh / 2 + 2, sw - 24);
    const signPx = sx.getImageData(0, 0, sw, sh).data;
    const cBody = rgb(BODY_C), cTeal = rgb(TEAL), cGlass = rgb(GLASS_C), cRoof = rgb(ROOF_C), cLine = [0x59, 0x63, 0x6a];
    const SIGN = [0.58, 3.27, 3.5];                              // its half-width, bottom and top
    // what one point of the nose looks like: [colour, glass?, sign's light]
    const look = (x, y, s, side) => {
      const ax = Math.abs(x);
      let col = cBody, glass = false, glow = null;
      if (y > 3.72 && s > 2.0) col = cRoof;
      if (side && s > 2.6 && Math.abs(y - 3.015) < 0.015) col = cRoof;
      // the teal: under the windscreen, then down the cab's sides into the band
      const vee = s < 0.75 && ax < 1.08 && y > glassFoot(x) - 0.3 && y < glassFoot(x) - 0.02;
      const k = smooth((s - 0.45) / 2.3), bandTop = lerp(2.25, BAND[1], k), bandBot = bandTop - lerp(0.28, BAND[1] - BAND[0], k);
      if (vee || (side && s > 0.3 && y > bandBot && y < bandTop)) col = cTeal;
      // the crew door's outline
      if (side && y > Math.max(sill, 1.0) && y < 3.24 && CREW_DOOR.some((d) => Math.abs(s - d) < 0.012)) col = cLine;
      if (side && Math.abs(y - 3.235) < 0.012 && s > CREW_DOOR[0] && s < CREW_DOOR[1]) col = cLine;
      // glass: the windscreen, wrapping round the corners; the cab's side window; the crew door's window
      if (y > glassFoot(x) && y < glassTop(x) && s < glassWrap(y)) glass = true;
      if (side && y > 2.31 && y < 3.12 && s > glassWrap(y) + 0.15 && s < 1.93) glass = true;
      if (side && y > 2.34 && y < 3.08 && s > 2.25 && s < 2.88) glass = true;
      if (glass) col = cGlass;
      if (glass && !side && ax < SIGN[0] && y > SIGN[1] && y < SIGN[2]) {   // the sign, lit behind the glass
        const px = Math.min(sw - 1, Math.floor((x + SIGN[0]) / (2 * SIGN[0]) * sw)), py = Math.min(sh - 1, Math.floor((SIGN[2] - y) / (SIGN[2] - SIGN[1]) * sh));
        const q = (py * sw + px) * 4; glow = [signPx[q], signPx[q + 1], signPx[q + 2]];
      }
      return [col, glass, glow];
    };
    const SUB = [0.25, 0.75];
    for (let ci = 0; ci < NU; ci++) {
      const secs = SUB.map((d) => { const s = (1 - (ci + d) / NU) * NOSE_L; return [s, noseSection(s)]; });
      for (let r = 0; r < NV; r++) {
        const acc = [0, 0, 0], gl = [0, 0, 0]; let cover = 0;
        for (const [s, sec] of secs) for (const d of SUB) {
          const fj = (1 - (r + d) / NV) * (nP - 1), j = Math.min(nP - 2, Math.floor(fj)), f = fj - j;
          const [x0, y0] = sec[j], [x1, y1] = sec[j + 1];
          const side = Math.abs((y1 - y0) / (Math.hypot(x1 - x0, y1 - y0) || 1)) > 0.75;
          const [col, glass, glow] = look(lerp(x0, x1, f), lerp(y0, y1, f), s, side);
          for (let q = 0; q < 3; q++) { acc[q] += col[q] / 4; if (glow) gl[q] += glow[q] / 4; }
          if (glass) cover += 0.25;
        }
        const k = (r * NU + ci) * 4, m = Math.round(cover * 255);
        B.data[k] = acc[0]; B.data[k + 1] = acc[1]; B.data[k + 2] = acc[2]; B.data[k + 3] = 255;
        M.data[k] = M.data[k + 1] = M.data[k + 2] = m; M.data[k + 3] = 255;
        G.data[k] = gl[0]; G.data[k + 1] = gl[1]; G.data[k + 2] = gl[2]; G.data[k + 3] = 255;
      }
    }
    bc.putImageData(B, 0, 0); mc.putImageData(M, 0, 0); gc.putImageData(G, 0, 0);
    // the front face, flat: body, the foot of the teal V, and a dark recess round the coupler
    const fc = face.getContext("2d"), F = fc.createImageData(256, 160);
    for (let r = 0; r < 160; r++) for (let ci = 0; ci < 256; ci++) {
      const acc = [0, 0, 0];
      for (const dy of SUB) for (const dx of SUB) {
        const x = -1.2 + (ci + dx) / 256 * 2.4, y = 2.0 - (r + dy) / 160 * 1.5;
        let col = cBody;
        if (y > glassFoot(x) - 0.3 && y < glassFoot(x) - 0.02) col = cTeal;
        if (Math.abs(x) < 0.5 && y < 1.26) col = [0x1e, 0x24, 0x27];
        for (let q = 0; q < 3; q++) acc[q] += col[q] / 4;
      }
      const k = (r * 256 + ci) * 4; F.data[k] = acc[0]; F.data[k + 1] = acc[1]; F.data[k + 2] = acc[2]; F.data[k + 3] = 255;
    }
    fc.putImageData(F, 0, 0);
    return { body, mask, glow: glowC, face };
  }
  const noseMat = new THREE.MeshStandardMaterial({ map: noseLook.body, roughness: 0.4, metalness: 0.12, envMap: glare, envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide });
  const faceMat = new THREE.MeshStandardMaterial({ map: noseLook.face, roughness: 0.4, metalness: 0.12, envMap: glare, envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide });
  // In daylight it is dark glass, like the side windows, with a faint sheen of sky; in the tunnel, a dark mirror for
  // the lamps. Either way the sign glows through it.
  const screenMat = new THREE.MeshStandardMaterial({ ...(lit ? { color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.3 }
    : { color: 0x1a2329, metalness: 0, roughness: 0.12, envMapIntensity: 0.3 }), envMap: glare,
    alphaMap: noseLook.mask, alphaTest: 0.5, emissive: 0xffffff, emissiveMap: noseLook.glow, emissiveIntensity: 1.1 });
  train.userData.glass = screenMat;
  // the nose's geometry: its sections from where it meets the body (at z = 0 here) forward to its face (z = NOSE_L)
  const noseGeo = (() => {
    const ss = Array.from({ length: NS + 1 }, (_, i) => NOSE_L * (1 - i / NS) ** 1.4);   // closer together toward the face
    return loft(ss.map(noseSection), ss.map((s) => NOSE_L - s), ss.map((s) => 1 - s / NOSE_L), nV);
  })();
  const glassGeo = (() => {                                      // the same surface, a centimetre proud of it
    const g = noseGeo.clone(), p = g.attributes.position, n = g.attributes.normal;
    for (let k = 0; k < p.count; k++) p.setXYZ(k, p.getX(k) + n.getX(k) * 0.012, p.getY(k) + n.getY(k) * 0.012, p.getZ(k) + n.getZ(k) * 0.012);
    return g;
  })();

  // A cab end: the nose, its face, the lamps, the coupler and crash boxes, and the roof fairing behind it. Origin where
  // the nose meets the body, +z forward. lead: the front of the train (white lamps); otherwise its tail (red ones).
  const cabEnd = (lead) => {
    const end = new THREE.Group(), zF = NOSE_L;
    end.add(new THREE.Mesh(noseGeo, noseMat), new THREE.Mesh(glassGeo, screenMat));
    end.add(new THREE.Mesh(cap(noseSection(0), zF, 1, null, (x, y) => [(x + 1.2) / 2.4, (y - 0.5) / 1.5]), faceMat));
    box(end, 2.1, 0.04, 2.9, 0, 0.6, zF - 1.45, under);           // under the nose
    // the lamp clusters, one at each lower corner, leaning up a little toward the outside: LED headlamps and a tail lamp
    for (const sg of [-1, 1]) {
      const hs = rounded(0.62, 0.2, 0.1, 0.04, housingMat); hs.position.set(sg * 0.71, 1.54, zF + 0.02); hs.rotation.z = sg * 0.07; end.add(hs);
      for (const [dx, w, mat] of [[-0.12, 0.2, lampMat], [0.1, 0.16, lampMat], [0.26, 0.07, tailMat]]) {
        const on = (mat === tailMat) !== lead;
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.065, 0.02), on ? mat : housingMat);
        m.position.set(sg * (0.71 + dx), 1.54 + dx * 0.07, zF + 0.075); m.rotation.z = sg * 0.07; end.add(m);
      }
      if (lit && lead) {
        const g = new THREE.Sprite(glowMat); g.scale.set(1.25, 1.25, 1); g.position.set(sg * 0.68, 1.55, zF + 0.3); end.add(g);
        const st = new THREE.Sprite(streakMat); st.scale.set(3.2, 0.09, 1); st.position.set(sg * 0.68, 1.55, zF + 0.31); end.add(st);
      }
      if (lit && !lead) { const g = new THREE.Sprite(tailGlow); g.scale.set(0.5, 0.5, 1); g.position.set(sg * 0.97, 1.56, zF + 0.2); end.add(g); }
      // a crash box at each lower corner, a camera arm on each side of the cab
      const cb = rounded(0.38, 0.42, 0.42, 0.05, boxMat); cb.position.set(sg * 0.86, 0.95, zF + 0.21); end.add(cb);
      for (let k = 0; k < 4; k++) box(end, 0.3, 0.022, 0.02, sg * 0.86, 0.81 + k * 0.09, zF + 0.425, housingMat);
      box(end, 0.07, 0.12, 0.26, sg * (nHS(0.95) + 0.04), 2.15, zF - 0.95, housingMat);
    }
    const ctr = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16), lead ? lampMat : housingMat);
    ctr.rotation.x = Math.PI / 2; ctr.position.set(0, 1.47, zF + 0.02); end.add(ctr);
    if (lit && lead) { const g = new THREE.Sprite(glowMat); g.scale.set(0.7, 0.7, 1); g.position.set(0, 1.47, zF + 0.25); end.add(g); }
    // the coupler, its head at the front of the train, and the pilot under the face
    box(end, 0.16, 0.16, TIP - 0.1, 0, 0.9, zF + (TIP - 0.1) / 2, boxMat);
    box(end, 0.3, 0.26, 0.2, 0, 0.9, zF + TIP - 0.1, boxMat);
    box(end, 1.9, 0.26, 0.12, 0, 0.45, zF - 0.02, boxMat);
    // the raised roof behind the windscreen (over the cab and the equipment behind it), sloping up from the nose
    end.add(sidewise([[-1.9, 3.5], [-1.3, 3.95], [-0.6, 4.12], [8.0, 4.12], [9.3, 3.82], [9.3, 3.5]], 2.0, 0, fairingMat));
    return end;
  };

  let from = 0;
  const specs = consist.map((c) => { const s = { ...c, from }; from += c.len; return s; });
  specs.forEach((spec, i) => {
    const car = new THREE.Group(), len = spec.len;              // origin on the rail at the car's middle, +z forward
    const inner = new THREE.Group(); car.add(inner);            // the car's own parts, built facing forward, turned for flip
    if (spec.flip) inner.rotation.y = Math.PI;
    const zOf = (zf) => len / 2 - zf;                            // metres back from the car's front end -> z
    if (spec.build) inner.add(spec.build(K));                   // a piece with a model of its own (the PowerPack)
    else {
      const look = CARS[spec.kind], cab = spec.kind === "cab", f0 = cab ? TIP + NOSE_L : END, f1 = len - END;
      meshesTo(inner, prism(PROFILE, zOf(f1), zOf(f0), VB, [true, !cab]), bodyMat(spec.kind, f0, f1));
      box(inner, 2.62, 0.05, f1 - f0, 0, BODY.b + 0.03, zOf((f0 + f1) / 2), under);              // its floor, closing it underneath
      // the low-floor belly, plain, with the doors run down onto it when they reach below the body
      const [b0, b1] = look.belly, bellyMat = sill < BODY.b ? new THREE.MeshStandardMaterial({ map: bellyTexture(look, b0, b1), roughness: 0.4,
        metalness: 0.12, envMap: glare, envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide }) : plainBody;
      meshesTo(inner, prism(BELLY, zOf(b1), zOf(b0), arcs(BELLY)), bellyMat);
      if (cab) {
        const e = cabEnd(!spec.flip); e.position.z = zOf(f0); inner.add(e);
        const mb = bogie(true); mb.position.z = zOf(5.9); inner.add(mb);
        const ac = roofUnit(3.4); ac.position.z = zOf(15.6); inner.add(ac);
      } else {
        const ac = roofUnit(4.0); ac.position.z = zOf(7.7); inner.add(ac);
      }
      if (spec.pan) inner.add(pantograph(zOf(12.6), BODY.T + 0.12));   // a pantograph, toward its back end
    }
    if (i < specs.length - 1) {                                 // where it meets the next car: a shared bogie, and the gangway's bellows
      const jb = bogie(false); jb.position.z = -len / 2; car.add(jb);
      box(car, 2.5, 2.75, 2 * END + 0.02, 0, 2.38, -len / 2, bellows);
    }
    car.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    car.userData = { len, from: spec.from, kind: spec.kind };
    train.add(car);
  });
  // the belly's paint: body colour, and below the body each door's frame and leaves down to the sill
  function bellyTexture(look, b0, b1) {
    const VBe = arcs(BELLY), vBe = vLeftOf(BELLY, VBe);
    return sideCanvas(b0, b1, vBe, ({ band }) => {
      for (const d of look.doors) {
        band(sill, BODY.b + 0.05, d - DOOR_W / 2 - 0.04, d + DOOR_W / 2 + 0.04, "#59636a");
        band(sill + 0.03, BODY.b + 0.05, d - DOOR_W / 2, d + DOOR_W / 2, "#c9d0d3");
        band(sill, BODY.b + 0.05, d - 0.015, d + 0.015, "#59636a");
      }
    }, false);
  }
  if (layout) train.children.forEach((car) => { car.position.z = -(car.userData.from + car.userData.len / 2); });
  train.userData.len = from;
  return train;
}
