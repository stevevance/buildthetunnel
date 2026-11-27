// The people on the cab-ride film's platforms: ten kinds of rider, built in code, each varied by its seed (skin tone,
// hair colour and style, clothing colours, build and height) so that a platform of them doesn't look repeated:
//
//   commuter    a knee-length coat (and sometimes a scarf), trousers, shoes, a shoulder bag; looking at a phone
//   student     a hoodie, jeans, sneakers, a backpack, sometimes headphones; hands in the hoodie's pocket
//   nurse       scrubs, sneakers, a lanyard and badge, sometimes a small backpack; holding a coffee
//   trades      a hi-vis vest over a flannel shirt, work trousers, boots, often a beanie; carrying a lunch bag
//   elder       grey or white hair, a cardigan or a quilted vest, slacks; both hands on a cane
//   dress       a knee-length dress with a denim jacket or a cardigan, flats, a tote; a hand on its strap
//   parent      a zip jacket, jeans, sneakers, a crossbody bag; pushing a stroller, or holding a child's hand
//   cyclist     dressed as the parent; holding a bike by its handlebar
//   child       a bright rain jacket, joggers, sneakers, sometimes a little backpack; holding the parent's hand
//   wheelchair  a sweater, trousers, sometimes a scarf; seated, hands on the wheels' rims
//
// They are scale figures, not portraits: real proportions, simple faces (eyes, eyebrows, a nose), clothes with their
// own shapes. Shading comes from a "matcap" (a picture of a lit ball), not the scene's lights, so they look round in a
// station's flat light. Each is built facing +z (its left is +x), feet at y = 0, in metres.
//
//   import * as THREE from "three";
//   import { peopleKit } from "./people.js";
//   const P = peopleKit({ THREE });
//   scene.add(P.person("nurse", 17));               // one person of a kind, from a seed
//   scene.add(P.bake([P.family(4), P.crowd(9)]));   // placed groups merged into one mesh (one draw)
//
// It needs a browser (or another DOM with <canvas>): the matcap is painted on one.
export const KINDS = ["commuter", "student", "nurse", "trades", "elder", "dress", "parent", "cyclist", "child", "wheelchair"];

export function peopleKit({ THREE }) {
  const hash = (n) => { const x = Math.sin(n * 91.7 + 47.3) * 43758.5453; return x - Math.floor(x); };
  const pick = (list, k) => list[Math.floor(hash(k) * list.length)];
  const wpick = (opts, u) => {                             // one of [value, weight] pairs, by weight
    const tot = opts.reduce((s, [, w]) => s + w, 0); let t = 0;
    for (const [v, w] of opts) { t += w / tot; if (u < t) return v; }
    return opts[opts.length - 1][0];
  };
  const SKIN = [0xf0c9ae, 0xe6b894, 0xd9a47c, 0xc68a5e, 0xa86b42, 0x8a5433, 0x6b3f26, 0x4a2c1b];
  const HAIR = [0x17120f, 0x2e1f16, 0x5a3a22, 0xc9a25c, 0x7a3b1e, 0x0f0f12, 0x3b2a1e], GREY = [0x9a9a9a, 0xc8c8c8, 0xe0ddd5, 0xb0aca4];
  const EYES = [0x2a1d15, 0x2a1d15, 0x3b2a1a, 0x4a3a22, 0x3c5a72, 0x4a5a3a];
  const BAGS = [0x1f2a44, 0x7a2434, 0x2f5d50, 0x2b2d30, 0xc9772f, 0x5a5f66, 0x3b6ea5];
  const DENIM = [0x2d4a6e, 0x3b5f8a, 0x22344f, 0x4f6f95];
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
  // (kept light: placed people are merged into one mesh, every part of them its own vertices)
  const CYL = () => geo("cyl", () => new THREE.CylinderGeometry(1, 1, 1, 12)), BALL = () => geo("ball", () => new THREE.SphereGeometry(1, 24, 16)),
    NUB = () => geo("nub", () => new THREE.SphereGeometry(1, 10, 7)),                         // a small ball: joints, hands, shoes, eyes
    RING = () => geo("ring", () => new THREE.TorusGeometry(1, 0.06, 6, 28)), HALF_RING = () => geo("half", () => new THREE.TorusGeometry(1, 0.08, 5, 14, Math.PI)),
    ROLL = () => geo("roll", () => new THREE.TorusGeometry(1, 0.42, 8, 22));               // a thick ring: a scarf wound round

  const RBOX = () => geo("rbox", () => {                   // a box with rounded edges, 1 x 1 x 1
    const sh = new THREE.Shape(), a = 0.5, r = 0.14;
    sh.moveTo(-a + r, -a); sh.lineTo(a - r, -a); sh.quadraticCurveTo(a, -a, a, -a + r); sh.lineTo(a, a - r); sh.quadraticCurveTo(a, a, a - r, a);
    sh.lineTo(-a + r, a); sh.quadraticCurveTo(-a, a, -a, a - r); sh.lineTo(-a, -a + r); sh.quadraticCurveTo(-a, -a, -a + r, -a);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1, bevelSegments: 3, curveSegments: 5 });
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
  const tube = (g, a, b, r, color) => between(g, CYL(), a, b, color, r, r);              // a thin rod from a to b
  const limb = (g, a, b, r, color, flat = 1) => {                                          // a capsule from a to b
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), key = `cap${r.toFixed(3)}_${len.toFixed(2)}`;
    return between(g, geo(key, () => new THREE.CapsuleGeometry(r, len, 4, 10)), a, b, color, 1, flat, false);
  };
  const wheel = (g, x, y, z, r, color = 0x1c1e20) => add(g, RING(), color, x, y, z, r, r, r, 0, Math.PI / 2, 0);
  // a limb or body section from a to b tapering from radius r0 to r1, open at its ends (a joint or the body covers them)
  const taper = (g, a, b, r0, r1, color, flat = 1) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), key = `tap${r0.toFixed(3)}_${r1.toFixed(3)}_${len.toFixed(2)}`;
    return between(g, geo(key, () => new THREE.CylinderGeometry(r1, r0, len, 12, 1, true)), a, b, color, 1, flat, false);
  };
  const joint = (g, p, r, color, flat = 1) => add(g, NUB(), color, p[0], p[1], p[2], r, r, r * flat);
  // an ellipsoid centred at c, its long semi-axis rl along dir, rx and rz across it (a hand, along its forearm)
  const blob = (g, c, dir, rx, rl, rz, color) => {
    const m = new THREE.Mesh(NUB(), tone(color)); m.position.set(...c); m.scale.set(rx, rl, rz);
    m.quaternion.setFromUnitVectors(Y, dir); g.add(m); return m;
  };
  const shade = (hex, f) => new THREE.Color(hex).multiplyScalar(f).getHex();

  /* ---- who each kind of person is, and what they wear: a description from the kind and the seed ---- */
  const hairFor = (k, styles) => wpick(styles, hash(k + 0.85));
  const any = (fem) => (fem ? [["long", 3], ["ponytail", 3], ["curls", 2], ["short", 1]] : [["short", 4], ["buzz", 2], ["curls", 2]]);
  const describe = (kind, k) => {
    const fem = kind === "dress" ? true : kind === "trades" ? hash(k + 2.1) < 0.2 : hash(k + 2.1) < 0.5;
    const D = { kind, k, fem, kid: kind === "child", skin: pick(SKIN, k), hair: pick(HAIR, k + 0.2), eyes: pick(EYES, k + 0.25),
      build: kind === "child" ? 1 : +(0.92 + 0.18 * hash(k + 3.7)).toFixed(2), style: "short", hat: null,
      top: "tee", topC: 0x4a6fa5, under: 0xe9e6df, legsC: 0x2b2d30, bare: false, shoes: "sneakers", shoeC: 0xe9e6df,
      bag: null, bagC: pick(BAGS, k + 1.4), pose: "relaxed", phones: false, scarf: null, lanyard: false };
    if (kind === "commuter") Object.assign(D, { top: "coat", topC: pick([0x2b2d30, 0x8a6a48, 0x23395b, 0x1a1a1c, 0x4f5a3a, 0x6a2430, 0x5a5f66], k + 0.4),
      under: pick([0xe9e6df, 0xd9d4c7, 0x8fa5c0], k + 0.45), legsC: pick([0x2b2d30, 0x23395b, 0x1a1a1c, 0x5a5f66, 0x8a7a63], k + 0.6),
      shoes: "shoes", shoeC: pick([0x1b1b1d, 0x3a2a1e], k + 1.35), bag: "shoulder", pose: "phone", style: hairFor(k, any(fem)),
      scarf: hash(k + 1.6) < 0.5 ? pick([0x7a2434, 0xc9a25c, 0x8f979a, 0x2f5d50, 0xd97b3a], k + 1.65) : null });
    if (kind === "student") Object.assign(D, { top: "hoodie", topC: pick([0x7a2434, 0x2f5d50, 0x8f979a, 0x23395b, 0xd0a030, 0x6a4c93, 0x3a3f44, 0xb8322a], k + 0.4),
      legsC: pick(DENIM, k + 0.6), shoeC: pick([0xe9e6df, 0x2b2d30, 0x3a6fb0, 0xb8322a], k + 1.35), bag: "backpack", pose: "pockets",
      style: hairFor(k, any(fem)), phones: hash(k + 3.9) < 0.5 });
    if (kind === "nurse") {
      const sc = pick([0x1f7a7a, 0x23395b, 0x6a2430, 0x5b8fbf, 0x4a5258, 0x3d7a5a], k + 0.4);
      Object.assign(D, { top: "scrubs", topC: sc, legsC: sc, shoeC: pick([0xe9e6df, 0x1b1b1d, 0x5b8fbf], k + 1.35), lanyard: true, pose: "cup",
        bag: hash(k + 1.3) < 0.5 ? "smallpack" : null, style: hairFor(k, fem ? [["ponytail", 4], ["short", 1], ["curls", 2], ["scarf", 1.2]] : [["short", 3], ["buzz", 2], ["curls", 1]]) });
    }
    if (kind === "trades") Object.assign(D, { top: "vest", topC: pick([0xd8e03a, 0xe8792a], k + 0.4), under: pick([0x8a2a2a, 0x2f4f7a, 0x3f5a3a, 0x5a5f66, 0x6a4a2a], k + 0.45),
      legsC: pick([0x8a7a5a, 0x3a3f44, 0x2b3550, 0x5a5346], k + 0.6), shoes: "boots", shoeC: pick([0x6a4a2a, 0x3a2a1e, 0x2b2d30], k + 1.35), pose: "lunch",
      bagC: pick([0x2b2d30, 0x23395b, 0x7a2434], k + 1.4), style: hairFor(k, [["short", 3], ["buzz", 3], ["curls", 1]]),
      hat: hash(k + 0.9) < 0.6 ? "beanie" : null, hatC: pick([0x2b2d30, 0xe8792a, 0x23395b, 0x5a5f66, 0x7a2434], k + 0.92) });
    if (kind === "elder") Object.assign(D, { top: hash(k + 0.95) < 0.6 ? "cardigan" : "quilted", hair: pick(GREY, k + 0.2),
      topC: pick([0x6a2430, 0xb8a888, 0x23395b, 0x3f5a3a, 0x5a4a3e, 0x8f979a], k + 0.4), under: pick([0xdfe6ee, 0xe9e6df, 0xc9d6e3], k + 0.45),
      legsC: pick([0x5a5f66, 0x8a7a63, 0x23395b, 0x3a3f44], k + 0.6), shoes: "shoes", shoeC: pick([0x3a2a1e, 0x1b1b1d], k + 1.35), pose: "cane",
      style: hairFor(k, fem ? [["short", 3], ["curls", 2], ["bob", 2]] : [["short", 3], ["bald", 3], ["curls", 1]]) });
    if (kind === "dress") Object.assign(D, { top: "dress", topC: pick([0x7a2434, 0x2f5d50, 0xd0a030, 0x23395b, 0xd97b3a, 0x6a4c93, 0x1a1a1c, 0xb8322a], k + 0.4),
      under: hash(k + 0.95) < 0.55 ? "denim" : "cardigan", layerC: hash(k + 0.95) < 0.55 ? pick(DENIM, k + 0.47) : pick([0xe9e6df, 0x8f979a, 0xc9a25c, 0x2b2d30], k + 0.47),
      bare: hash(k + 1.15) < 0.6, legsC: pick([0x2b2d30, 0x1a1a1c, 0x5a4a3e], k + 1.2), shoes: "flats", shoeC: pick([0x1b1b1d, 0x7a2434, 0xc9a25c, 0xe9e6df], k + 1.35),
      bag: "tote", pose: "strap", style: hairFor(k, [["long", 3], ["ponytail", 2], ["curls", 2], ["bob", 1.5], ["scarf", 1]]) });
    if (kind === "parent" || kind === "cyclist") Object.assign(D, { top: "jacket", topC: pick([0x23395b, 0x3f5a3a, 0x2b2d30, 0x7a2434, 0x8a6a48, 0x4a6fa5, 0x5a5f66], k + 0.4),
      under: pick([0xe9e6df, 0x8f979a, 0xd0a030, 0x2b2d30], k + 0.45), legsC: pick(DENIM, k + 0.6), shoeC: pick([0xe9e6df, 0x2b2d30, 0x5a5f66], k + 1.35),
      bag: "crossbody", style: hairFor(k, any(fem)) });
    if (kind === "child") Object.assign(D, { top: "raincoat", topC: pick([0xe2574c, 0xf2c94c, 0x3aa0d8, 0x58b368, 0xf08a5d, 0x9b6bd0], k + 0.4),
      legsC: pick([0x5a5f66, 0x23395b, 0x2b2d30, 0x7a2434], k + 0.6), shoeC: pick([0xe2574c, 0x3aa0d8, 0xf2f2f2, 0x58b368], k + 1.35),
      bag: hash(k + 1.3) < 0.6 ? "smallpack" : null, style: hairFor(k, fem ? [["ponytail", 3], ["long", 2], ["curls", 2]] : [["short", 3], ["curls", 2], ["buzz", 2]]) });
    if (kind === "wheelchair") Object.assign(D, { top: "sweater", topC: pick([0x23395b, 0x7a2434, 0x2f5d50, 0x8f979a, 0xd0a030, 0x5a4a3e], k + 0.4),
      legsC: pick([0x2b2d30, 0x23395b, 0x5a5f66, 0x22344f], k + 0.6), shoeC: pick([0x1b1b1d, 0xe9e6df, 0x3a2a1e], k + 1.35), style: hairFor(k, any(fem)),
      scarf: hash(k + 1.6) < 0.4 ? pick([0x7a2434, 0xc9a25c, 0x8f979a, 0xd97b3a], k + 1.65) : null });
    if (D.style === "scarf") { D.hat = "headscarf"; D.hatC = pick([0x2b2d30, 0x6a2430, 0x23395b, 0x8f979a, 0xc9a25c, 0x2f5d50], k + 0.93); }
    D.brows = D.hair === 0xc9a25c ? 0x8a6a3a : shade(D.hair, D.hair > 0x808080 ? 0.75 : 1);
    return D;
  };

  /* ---- the body ---- */
  const HIP = 0.86, FLAT = 0.62;                           // hip joints above the ground, standing; bodies' depth for their width
  const TORSO_H = [-0.07, 0.04, 0.19, 0.34, 0.47, 0.55, 0.6];
  // the torso's radius at h metres above the hip joints (a lathe's profile), by build: heavier builds thicken most at the waist
  const torsoR = (fem, b, h) => {
    const R = fem ? [0.152, 0.174, 0.14, 0.156, 0.16, 0.14, 0.068] : [0.15, 0.164, 0.15, 0.166, 0.178, 0.152, 0.072];
    const w = (i) => R[i] * (i === 6 ? 1 : b) * (i === 2 ? b : 1);
    if (h <= TORSO_H[0]) return w(0);
    for (let i = 1; i < 7; i++) if (h <= TORSO_H[i]) return w(i - 1) + (w(i) - w(i - 1)) * (h - TORSO_H[i - 1]) / (TORSO_H[i] - TORSO_H[i - 1]);
    return w(6);
  };
  // a band of clothing round the torso from h0 to h1 above the hip joints, `grow` times its radius (widening to grow2
  // by the hips, to clear the thighs); below the torso's foot it flares out by `flare` (a coat's skirts, a dress)
  const band = (g, D, y, h0, h1, grow, color, flare = 0, grow2 = grow) => add(g, geo(`band${D.fem}${D.build}${h0}${h1}${grow}${flare}${grow2}`, () => {
    const pts = [], n = 8;
    for (let i = 0; i <= n; i++) {
      const h = h0 + (h1 - h0) * i / n, below = Math.max(0, TORSO_H[0] - h) / Math.max(1e-6, TORSO_H[0] - h0);
      const gr = grow + (grow2 - grow) * Math.min(1, Math.max(0, (0.06 - h) / 0.14));
      pts.push(new THREE.Vector2(torsoR(D.fem, D.build, h) * gr + below * flare, h));
    }
    return new THREE.LatheGeometry(pts, 18);
  }), color, 0, y, 0, 1, 1, FLAT * 1.04);
  const torso = (g, D, y, color) => add(g, geo(`torso${D.fem}${D.build}`, () => new THREE.LatheGeometry(
    [new THREE.Vector2(0.001, -0.1), ...TORSO_H.map((h) => new THREE.Vector2(torsoR(D.fem, D.build, h), h)), new THREE.Vector2(0.001, 0.6)], 18)),
    color, 0, y, 0, 1, 1, FLAT);
  // a strip down the front of the torso (an open jacket's shirt, a zip, a vest's opening), from h0 to h1
  const front = (D, h) => torsoR(D.fem, D.build, h) * FLAT;
  const strip = (g, D, y, h0, h1, w, color, out = 0.006) => add(g, RBOX(), color, 0, y + (h0 + h1) / 2, front(D, (h0 + h1) / 2) * (1 + out * 8) + out, w, h1 - h0, 0.02);
  // the V of a neckline, from h0 up to the collar: what's worn underneath, showing (a cardigan's, a jacket over a dress)
  const vee = (g, D, y, h0, color, grow) => add(g, NUB(), color, 0, y + (h0 + 0.58) / 2, front(D, (h0 + 0.58) / 2) * grow + 0.006, 0.05, (0.58 - h0) / 2, 0.012);

  // The head, from the base of the neck at height y: skull, jaw, ears, a nose, eyes and eyebrows; then hair, a beanie or
  // a headscarf. Every hairstyle keeps above the eyebrows at the front. pitch tips the head forward (to a phone).
  const SKULL = [0, 0.165, -0.004, 0.091, 0.112, 0.101];  // its centre and semi-axes
  const onSkull = (x, y) => SKULL[2] + SKULL[5] * Math.sqrt(Math.max(0, 1 - ((x - SKULL[0]) / SKULL[3]) ** 2 - ((y - SKULL[1]) / SKULL[4]) ** 2));
  const head = (g, D, y, pitch = 0) => {
    const h = new THREE.Group(); h.position.y = y; h.rotation.set(pitch, 0, 0, "YXZ"); h.scale.setScalar(D.kid ? 1.22 : 1); g.add(h);
    h.userData.head = true;                              // (turnHeads finds it)
    const S = D.skin, H = D.hair;
    taper(h, [0, -0.04, 0], [0, 0.08, 0.004], 0.052, 0.045, S);                                   // neck
    add(h, BALL(), S, ...SKULL);
    add(h, NUB(), S, 0, 0.112, 0.024, 0.068, 0.062, 0.072);                                       // jaw and chin
    for (const sg of [-1, 1]) add(h, NUB(), S, sg * 0.089, 0.155, -0.006, 0.015, 0.03, 0.022);    // ears
    add(h, NUB(), shade(S, 0.96), 0, 0.146, onSkull(0, 0.146) + 0.008, 0.015, 0.028, 0.021, 0.28, 0, 0);   // nose
    for (const sg of [-1, 1]) {
      const ex = sg * 0.033, ey = 0.168, ez = onSkull(ex, ey);
      add(h, NUB(), 0xf2efe8, ex, ey, ez - 0.002, 0.016, 0.0105, 0.008);                         // the white of the eye
      add(h, NUB(), D.eyes, ex, ey - 0.0005, ez + 0.0045, 0.0078, 0.0088, 0.0035);               // iris
      const bx = sg * 0.034, by = 0.19;
      add(h, RBOX(), D.brows, bx, by, onSkull(bx, by) + 0.0015, 0.031, 0.0075, 0.009, 0, 0, -sg * 0.1);   // eyebrow
    }
    if (D.hat === "headscarf") {                          // framing the face, over the head and down round the neck
      add(h, BALL(), D.hatC, 0, 0.172, -0.02, 0.108, 0.124, 0.11);
      taper(h, [0, -0.07, -0.012], [0, 0.11, -0.012], 0.1, 0.084, D.hatC);
      return;
    }
    const cap = (sx, sy, sz, cy, cz) => add(h, BALL(), H, 0, cy, cz, sx, sy, sz);
    const st = D.style;
    if (st === "buzz") cap(0.095, 0.104, 0.105, 0.18, -0.012);
    else if (st === "short" || st === "long" || st === "ponytail") cap(0.098, 0.096, 0.104, 0.195, -0.016);
    else if (st === "bob") { cap(0.104, 0.1, 0.108, 0.19, -0.02); for (const sg of [-1, 1]) add(h, BALL(), H, sg * 0.082, 0.14, -0.02, 0.03, 0.075, 0.075); }
    else if (st === "curls") cap(0.118, 0.108, 0.115, 0.215, -0.028);
    if (st === "long") {                                   // down the back to the shoulders, and either side of the face
      add(h, BALL(), H, 0, 0.1, -0.062, 0.096, 0.15, 0.05);
      for (const sg of [-1, 1]) add(h, BALL(), H, sg * 0.086, 0.125, -0.022, 0.03, 0.11, 0.07);
    }
    if (st === "ponytail") {
      add(h, NUB(), shade(H, 0.7), 0, 0.2, -0.104, 0.022, 0.022, 0.016);                          // its band
      taper(h, [0, 0.2, -0.11], [0, 0.04, -0.155], 0.03, 0.016, H); joint(h, [0, 0.04, -0.155], 0.016, H);
    }
    if (D.hat === "beanie") {
      add(h, BALL(), D.hatC, 0, 0.225, -0.012, 0.101, 0.085, 0.108);
      add(h, CYL(), shade(D.hatC, 0.82), 0, 0.215, -0.012, 0.102, 0.036, 0.109);                  // its turned-up cuff, above the eyebrows
    }
    if (D.phones) {
      add(h, HALF_RING(), 0x1c1e20, 0, 0.165, -0.005, 0.106, 0.106, 0.106);
      for (const sg of [-1, 1]) add(h, CYL(), 0x1c1e20, sg * 0.098, 0.152, -0.005, 0.034, 0.03, 0.034, 0, 0, Math.PI / 2);
    }
  };

  // Hips to head, with the hip joints at height y: the torso and what's worn on it, the arms (each reaching from its
  // shoulder to where its hand is, the elbow bending back and out), the head, and anything carried. hands: [right, left]
  // targets, if something sets them (a stroller's handle, a child's hand); otherwise the pose places them.
  const upper = (g, D, y, { hands = [null, null], seated = false } = {}) => {
    const b = D.build, shw = (D.fem ? 0.172 : 0.188) * b * (D.top === "quilted" || D.top === "raincoat" ? 1.04 : 1);
    const long = D.top !== "scrubs" && D.top !== "tee";   // (a dress is worn with a long-sleeved jacket or cardigan)
    let sleeve = D.topC, body = D.topC;
    // the clothes, by kind of top
    if (D.top === "coat") {
      torso(g, D, y, body); if (!seated) band(g, D, y, -0.46, 0.08, 1.04, body, 0.05, 1.22);
      strip(g, D, y, -0.1, 0.5, 0.012, shade(body, 0.7));                                        // where it closes
      add(g, RING(), body, 0, y + 0.58, 0, 0.082, 0.082, 0.068, Math.PI / 2, 0, 0);               // collar
    } else if (D.top === "hoodie") {
      torso(g, D, y, body);
      add(g, BALL(), body, 0, y + 0.55, -0.08, 0.13, 0.085, 0.075);                               // the hood, down
      add(g, RBOX(), shade(body, 0.86), 0, y + 0.1, front(D, 0.1) + 0.005, 0.24, 0.13, 0.03);     // its pocket
      for (const sg of [-1, 1]) tube(g, [sg * 0.03, y + 0.56, front(D, 0.56) + 0.01], [sg * 0.035, y + 0.42, front(D, 0.42) + 0.012], 0.0045, 0xe9e6df);
    } else if (D.top === "scrubs") {
      torso(g, D, y, body);
      add(g, NUB(), D.skin, 0, y + 0.565, front(D, 0.565) + 0.002, 0.024, 0.036, 0.008);        // the V of the neck
    } else if (D.top === "vest") {                       // a hi-vis vest, open at the front, with reflective stripes, over a shirt
      body = D.under; sleeve = D.under; torso(g, D, y, body);
      band(g, D, y, -0.01, 0.52, 1.05, D.topC);
      for (const h of [0.12, 0.3]) band(g, D, y, h, h + 0.035, 1.065, 0xc9cdd0);
      strip(g, D, y, -0.01, 0.5, 0.008, shade(D.topC, 0.72), 0.012);                             // where it closes
    } else if (D.top === "cardigan" || D.top === "quilted") {
      body = D.under; torso(g, D, y, body);
      band(g, D, y, -0.01, 0.53, D.top === "quilted" ? 1.07 : 1.04, D.topC);
      if (D.top === "quilted") {                         // a vest, zipped, its stitching across
        for (const h of [0.08, 0.2, 0.32, 0.44]) band(g, D, y, h, h + 0.012, 1.075, shade(D.topC, 0.78));
        strip(g, D, y, -0.01, 0.52, 0.008, shade(D.topC, 0.65), 0.012);
      } else {                                           // a cardigan: the shirt in a V at the neck, buttons below it
        vee(g, D, y, 0.36, D.under, 1.1);
        for (const h of [0.07, 0.17, 0.27]) add(g, NUB(), shade(D.topC, 0.6), 0, y + h, front(D, h) * 1.09 + 0.006, 0.011, 0.011, 0.006);
      }
      sleeve = D.top === "quilted" ? D.under : D.topC;
    } else if (D.top === "dress") {                      // a dress, and over it a denim jacket or a cardigan
      torso(g, D, y, body); if (!seated) band(g, D, y, -0.38, 0.19, 1.03, body, 0.06, 1.22);
      band(g, D, y, D.under === "denim" ? 0.12 : -0.02, 0.55, 1.05, D.layerC);
      vee(g, D, y, 0.34, body, 1.1);
      sleeve = D.layerC;
    } else if (D.top === "jacket") {                     // a zip jacket to the hip, its collar and hem
      torso(g, D, y, body);
      band(g, D, y, -0.02, 0.04, 1.035, shade(body, 0.82));
      strip(g, D, y, -0.02, 0.55, 0.01, shade(body, 0.6));
      add(g, RING(), body, 0, y + 0.58, 0, 0.08, 0.08, 0.066, Math.PI / 2, 0, 0);
    } else if (D.top === "raincoat") {                   // a child's rain jacket to mid-thigh, hood down
      torso(g, D, y, body); if (!seated) band(g, D, y, -0.2, 0.06, 1.04, body, 0.04, 1.22);
      add(g, BALL(), body, 0, y + 0.54, -0.08, 0.13, 0.085, 0.075);
      strip(g, D, y, -0.2, 0.55, 0.01, shade(body, 0.7));
    } else {                                             // a sweater, ribbed at its hem
      torso(g, D, y, body); band(g, D, y, -0.01, 0.04, 1.03, shade(body, 0.85));
    }
    if (!["coat", "dress", "raincoat"].includes(D.top)) band(g, D, y, -0.1, -0.03, 1.02, D.legsC);   // trousers' seat
    if (D.scarf) {                                       // a scarf wound round the neck in a thick roll, one end hanging from it
      add(g, ROLL(), D.scarf, 0, y + 0.6, 0.004, 0.068, 0.07, 0.06, Math.PI / 2, 0, 0);
      add(g, ROLL(), shade(D.scarf, 0.9), 0, y + 0.565, 0.006, 0.08, 0.075, 0.07, Math.PI / 2 + 0.12, 0, 0);
      const top = [-0.045, y + 0.555, 0.088], foot = [-0.075, y + 0.39, front(D, 0.39) + 0.03];
      between(g, RBOX(), top, foot, D.scarf, 0.06, 0.024);
    }
    if (D.lanyard) {                                     // a lanyard and badge
      for (const sg of [-1, 1]) tube(g, [sg * 0.05, y + 0.59, 0.02], [sg * 0.008, y + 0.36, front(D, 0.36) + 0.012], 0.004, 0x2a5d9a);
      add(g, RBOX(), 0xf2f2f2, 0, y + 0.33, front(D, 0.33) + 0.015, 0.055, 0.08, 0.01);
    }
    // the arms
    const UA = 0.285, FA = 0.255, sh = (sg) => new THREE.Vector3(sg * shw, y + 0.475, -0.005);
    const at = (sg, dx, dy, dz) => new THREE.Vector3(sg * dx, y + dy, dz);
    const posed = (sg) => {                              // sg = -1: the right hand; +1: the left
      const right = sg < 0, p = D.pose;
      if (p === "phone") return right ? at(sg, 0.045, 0.3, front(D, 0.3) + 0.17) : at(sg, 0.045, 0.27, front(D, 0.27) + 0.155);
      if (p === "pockets") return at(sg, 0.06, 0.11, front(D, 0.11) + 0.03);
      if (p === "cup" && right) return at(sg, 0.1, 0.24, front(D, 0.24) + 0.1);
      if (p === "lunch" && right) return at(sg, shw + 0.04, -0.05, 0.08);
      if (p === "cane") return at(sg, 0.06, 0.0, 0.24);
      if (p === "strap" && !right) return at(sg, 0.14, 0.44, front(D, 0.44) + 0.04);
      return at(sg, shw + 0.035, -0.07, 0.04);
    };
    const handsAt = [-1, 1].map((sg, i) => {
      const S = sh(sg), T = hands[i] ? new THREE.Vector3(hands[i][0], y + hands[i][1], hands[i][2]) : posed(sg), dir = T.clone().sub(S);
      const d = Math.min(Math.max(dir.length(), 0.12), UA + FA - 0.002); dir.normalize();
      const x = (UA * UA - FA * FA + d * d) / (2 * d), hgt = Math.sqrt(Math.max(0, UA * UA - x * x));
      const pole = new THREE.Vector3(sg * 0.6, -0.2, -1).normalize(); pole.addScaledVector(dir, -pole.dot(dir)).normalize();
      const E = S.clone().addScaledVector(dir, x).addScaledVector(pole, hgt), W = S.clone().addScaledVector(dir, d), fd = W.clone().sub(E).normalize();
      const r = (v) => v * b * (D.top === "quilted" || D.top === "raincoat" || D.top === "coat" ? 1.1 : 1), cover = long ? sleeve : D.skin;
      const a = S.toArray(), e = E.toArray(), w = W.toArray();
      joint(g, a, r(0.05), sleeve); taper(g, a, e, r(0.048), r(0.042), cover);
      if (!long) taper(g, a, S.clone().lerp(E, 0.5).toArray(), r(0.056), r(0.052), sleeve);   // a short sleeve
      joint(g, e, r(0.042), cover); taper(g, e, w, r(0.041), r(0.032), cover);
      if (long) joint(g, w, r(0.036), cover);
      blob(g, W.clone().addScaledVector(fd, 0.05).toArray(), fd, 0.033, 0.055, 0.042, D.skin);   // hand
      return W.clone().addScaledVector(fd, 0.07);
    });
    // what's in their hands
    const [rh, lh] = handsAt, p = D.pose;
    if (p === "phone") add(g, RBOX(), 0x111316, (rh.x + lh.x) / 2, rh.y + 0.01, rh.z - 0.005, 0.075, 0.15, 0.014, -1.0, 0, 0);
    if (p === "cup") { add(g, CYL(), 0xf2efe8, rh.x, rh.y + 0.035, rh.z, 0.036, 0.13, 0.036); add(g, CYL(), 0x9b6a3c, rh.x, rh.y + 0.025, rh.z, 0.038, 0.05, 0.038); }
    if (p === "lunch") { tube(g, rh.toArray(), [rh.x, rh.y - 0.08, rh.z], 0.006, 0x1c1e20); add(g, RBOX(), D.bagC, rh.x, rh.y - 0.2, rh.z, 0.14, 0.2, 0.24); }
    if (p === "cane") {
      const top = rh.clone().lerp(lh, 0.5);
      tube(g, top.toArray(), [top.x, 0.01, top.z + 0.03], 0.012, 0x3a2a1e);
      limb(g, [top.x, top.y + 0.01, top.z - 0.04], [top.x, top.y + 0.01, top.z + 0.06], 0.016, 0x3a2a1e);
    }
    head(g, D, y + 0.6, p === "phone" ? 0.42 : 0);
    // a bag
    if (D.bag === "backpack" || D.bag === "smallpack") {
      const s = D.bag === "smallpack" ? 0.78 : 1;
      add(g, RBOX(), D.bagC, 0, y + 0.31 + 0.06 * (1 - s), -(front(D, 0.31) + 0.085 * s), 0.29 * s, 0.4 * s, 0.15 * s);
      for (const sg of [-1, 1]) tube(g, [sg * 0.095, y + 0.545, front(D, 0.545) + 0.006], [sg * 0.15, y + 0.25, front(D, 0.25) * 0.6], 0.013, shade(D.bagC, 0.8));
    }
    if (D.bag === "tote" && !seated) {
      tube(g, [0.13, y + 0.53, 0.005], [shw + 0.06, y + 0.12, 0.01], 0.012, D.bagC);
      add(g, RBOX(), D.bagC, shw + 0.07, y + 0.0, 0.01, 0.08, 0.3, 0.32);
    }
    if (D.bag === "shoulder" && !seated) {               // from the right shoulder, the bag at the left hip
      tube(g, [-0.12, y + 0.54, 0], [shw + 0.04, y + 0.06, 0.0], 0.012, shade(D.bagC, 0.7));
      add(g, RBOX(), D.bagC, shw + 0.05, y - 0.02, 0.0, 0.09, 0.26, 0.34);
    }
    if (D.bag === "crossbody") {
      tube(g, [-0.13, y + 0.53, front(D, 0.53) - 0.02], [0.15, y + 0.08, front(D, 0.08) + 0.03], 0.011, shade(D.bagC, 0.7));
      add(g, RBOX(), D.bagC, 0.17, y + 0.06, front(D, 0.06) + 0.04, 0.2, 0.15, 0.06);
    }
  };
  // the legs, from the hip joints down; stride (1 or -1) sets one forward and the other back, mid-step
  const legs = (g, D, stride = 0) => {
    const b = D.build, skirt = D.top === "dress", shin = skirt ? (D.bare ? D.skin : D.legsC) : D.legsC;
    for (const sg of [-1, 1]) {
      const f = sg * stride, x = sg * 0.088 * b;
      const hip = [x, HIP, 0], knee = [x, 0.47, 0.008 + f * 0.11], ankle = [x * 0.95, 0.09, f * 0.24];
      taper(g, knee, hip, 0.058 * b, 0.082 * b, shin); joint(g, knee, 0.057 * b, shin); taper(g, ankle, knee, 0.04 * b, 0.056 * b, shin);
      const fz = 0.045 + f * 0.24;
      if (D.shoes === "sneakers") { add(g, RBOX(), 0xf0eee8, x, 0.02, fz, 0.1, 0.035, 0.27); add(g, NUB(), D.shoeC, x, 0.055, fz - 0.005, 0.05, 0.042, 0.12); }
      else if (D.shoes === "boots") { taper(g, [x * 0.95, 0.03, f * 0.24], [x * 0.95, 0.17, f * 0.24], 0.052, 0.047, D.shoeC); add(g, NUB(), D.shoeC, x, 0.045, fz, 0.052, 0.045, 0.13); }
      else if (D.shoes === "flats") add(g, NUB(), D.shoeC, x, 0.03, fz, 0.044, 0.03, 0.118);
      else add(g, NUB(), D.shoeC, x, 0.042, fz, 0.048, 0.04, 0.125);
    }
  };
  // how much each is scaled from the modelled figure (1.75 m or so): children are 4 to 10 or so
  const tallOf = (kind, k) => { const D = describe(kind, k); return D.kid ? 0.56 + 0.18 * hash(k + 1.7) : (D.fem ? 0.9 : 0.96) + 0.09 * hash(k + 1.7); };
  // a point given in a group's own metres, as a target for a hand of the person at `at` in it (turned by `turn`, scaled
  // by `tall`): [x, height above the hip joints, z] in the person's own figure
  const handFor = (p, tall, at = [0, 0], turn = 0) => {
    const x = p[0] - at[0], z = p[2] - at[1], c = Math.cos(-turn), s = Math.sin(-turn);
    return [(x * c + z * s) / tall, p[1] / tall - HIP, (-x * s + z * c) / tall];
  };
  // a whole person of a kind, standing (or, with stride, mid-step, arms swinging). hands: [right, left] targets
  // ([x, y above the hips, z]) for holding things; otherwise their pose places them
  const person = (kind, k, { stride = 0, hands } = {}) => {
    const D = describe(kind, k), g = new THREE.Group(), tall = tallOf(kind, k);
    if (stride) D.pose = "walk";
    const h = hands || (stride ? [[-0.22, -0.1, 0.04 + 0.16 * stride], [0.22, -0.1, 0.04 - 0.16 * stride]] : [null, null]);
    legs(g, D, stride);
    upper(g, D, HIP, { hands: h });
    g.scale.setScalar(tall);
    g.userData.tall = tall;
    return g;
  };

  /* ---- people with things: a wheelchair, a stroller, a bike, luggage; and families ---- */
  const wheelchairUser = (k) => {
    const D = describe("wheelchair", k), g = new THREE.Group(), FRAME = 0x2a4d8f;
    for (const sg of [-1, 1]) {
      wheel(g, sg * 0.31, 0.3, -0.05, 0.3);                                                        // drive wheels, with push rims
      add(g, RING(), 0xb8bcc0, sg * 0.335, 0.3, -0.05, 0.26, 0.26, 0.26, 0, Math.PI / 2, 0);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; tube(g, [sg * 0.31, 0.3 - 0.29 * Math.cos(a), -0.05 - 0.29 * Math.sin(a)], [sg * 0.31, 0.3 + 0.29 * Math.cos(a), -0.05 + 0.29 * Math.sin(a)], 0.005, 0x8d9296); }
      wheel(g, sg * 0.22, 0.07, 0.4, 0.07);                                                        // casters
      tube(g, [sg * 0.22, 0.1, 0.4], [sg * 0.22, 0.47, 0.22], 0.014, FRAME);
      tube(g, [sg * 0.22, 0.47, 0.24], [sg * 0.22, 0.47, -0.2], 0.014, FRAME);
      tube(g, [sg * 0.22, 0.47, -0.2], [sg * 0.22, 0.98, -0.26], 0.014, FRAME);                    // back posts and push handles
      limb(g, [sg * 0.22, 0.98, -0.27], [sg * 0.22, 0.98, -0.35], 0.017, 0x1c1e20);
      tube(g, [sg * 0.22, 0.47, 0.24], [sg * 0.16, 0.12, 0.52], 0.012, FRAME);                     // footrest hangers
      taper(g, [sg * 0.09, 0.6, -0.05], [sg * 0.1, 0.6, 0.32], 0.08, 0.06, D.legsC);               // thighs along the seat
      joint(g, [sg * 0.1, 0.6, 0.32], 0.06, D.legsC);
      taper(g, [sg * 0.1, 0.6, 0.32], [sg * 0.1, 0.19, 0.47], 0.056, 0.042, D.legsC);              // shins down to the footplate
      add(g, NUB(), D.shoeC, sg * 0.1, 0.145, 0.53, 0.058, 0.048, 0.13);
    }
    add(g, RBOX(), 0x1c1e20, 0, 0.49, 0.03, 0.46, 0.07, 0.46);                                     // seat, backrest, footplate
    add(g, RBOX(), 0x1c1e20, 0, 0.76, -0.235, 0.46, 0.42, 0.05);
    add(g, RBOX(), 0x4a4f54, 0, 0.1, 0.52, 0.34, 0.03, 0.16);
    upper(g, D, 0.6, { hands: [[-0.33, -0.135, 0.15], [0.33, -0.135, 0.15]], seated: true });     // hands on the rims, toward their tops
    return g;
  };
  const withStroller = (k) => {
    const t = tallOf("parent", k), g = person("parent", k, { hands: [-0.2, 0.2].map((x) => handFor([x, 0.98, 0.48], t)) }), s = new THREE.Group(), SHELL = 0x38546e;
    for (const sg of [-1, 1]) {
      wheel(s, sg * 0.24, 0.11, 0.3, 0.11); wheel(s, sg * 0.24, 0.11, -0.3, 0.11);
      tube(s, [sg * 0.24, 0.11, 0.3], [sg * 0.22, 0.98, -0.5], 0.014, 0x9aa0a4);                   // frame up to the handle
      tube(s, [sg * 0.24, 0.11, -0.3], [sg * 0.22, 0.6, 0.12], 0.014, 0x9aa0a4);
    }
    limb(s, [-0.22, 0.98, -0.5], [0.22, 0.98, -0.5], 0.02, 0x1c1e20);                              // handle
    add(s, RBOX(), SHELL, 0, 0.62, 0.02, 0.44, 0.3, 0.66);                                         // the seat shell
    add(s, BALL(), SHELL, 0, 0.76, -0.2, 0.225, 0.25, 0.25);                                       // canopy, behind the baby
    add(s, RBOX(), 0xe8dfc8, 0, 0.775, 0.16, 0.34, 0.06, 0.34);                                    // blanket
    add(s, BALL(), pick(SKIN, k + 2.5), 0, 0.86, 0.02, 0.085, 0.09, 0.09);                         // the baby...
    add(s, BALL(), 0xf2c94c, 0, 0.915, 0.005, 0.09, 0.05, 0.092);                                  // ...in a sun hat
    s.position.z = 0.98 / t; s.scale.setScalar(1 / t);                                             // (the stroller keeps its own size)
    g.add(s);
    return g;
  };
  const withBike = (k) => {
    const g = new THREE.Group(), FRAME = pick([0xc8432b, 0x2a4d8f, 0x2f5d50, 0x1c1e20, 0xd0a030], k + 5.1), DARK = 0x1c1e20, b = new THREE.Group();
    // the rider stands to the bike's right, the near end of its handlebar (leaning with the bike) in their left hand
    const rider = person("cyclist", k, { hands: [null, handFor([-0.19, 1.016, 0.34], tallOf("cyclist", k), [-0.42, 0])] }); rider.position.x = -0.42; g.add(rider);
    wheel(b, 0, 0.34, 0.54, 0.33); wheel(b, 0, 0.34, -0.5, 0.33);
    for (const z of [0.54, -0.5]) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; tube(b, [0, 0.34 - 0.32 * Math.cos(a), z - 0.32 * Math.sin(a)], [0, 0.34 + 0.32 * Math.cos(a), z + 0.32 * Math.sin(a)], 0.004, 0x9aa0a4); }
    const BB = [0, 0.3, -0.02], SEAT = [0, 0.84, -0.2], HEAD = [0, 0.88, 0.36], REAR = [0, 0.34, -0.5], FRONT = [0, 0.34, 0.54];
    tube(b, BB, SEAT, 0.018, FRAME); tube(b, SEAT, HEAD, 0.018, FRAME); tube(b, [0, 0.8, 0.38], BB, 0.02, FRAME);   // seat, top and down tubes
    tube(b, BB, REAR, 0.012, FRAME); tube(b, SEAT, REAR, 0.012, FRAME);                            // chain and seat stays
    tube(b, HEAD, FRONT, 0.014, FRAME);                                                            // fork
    tube(b, SEAT, [0, 0.95, -0.22], 0.012, 0x9aa0a4); add(b, BALL(), DARK, 0, 0.965, -0.23, 0.06, 0.025, 0.13);       // seat post and saddle
    tube(b, HEAD, [0, 1.0, 0.34], 0.012, 0x9aa0a4); limb(b, [-0.26, 1.0, 0.34], [0.26, 1.0, 0.34], 0.014, DARK);      // stem and handlebar
    add(b, CYL(), 0x9aa0a4, 0, 0.3, -0.02, 0.07, 0.012, 0.07, 0, 0, Math.PI / 2);                  // chainring
    b.rotation.z = -0.07; g.add(b);                                                                // leaning a little toward its owner
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
    add(g, RBOX(), 0x1c1e20, x, 0.06 + h * 0.62, z + 0.14, w * 0.5, 0.05, 0.02);                   // a strap across the front
  };
  const traveller = (k) => {                             // a commuter or someone in a dress, with a suitcase (its handle in the left hand)
    const kind = hash(k + 5.3) < 0.5 ? "commuter" : "dress", t = tallOf(kind, k);
    const g = new THREE.Group(), who = person(kind, k, { hands: [null, handFor([0.48, 1.08, 0.02], t)] }); g.add(who);
    suitcase(g, k + 0.3, 0.52, 0.1);
    if (hash(k + 0.7) < 0.6) add(g, RBOX(), pick(BAGS, k + 0.8), 0.52, 0.86, 0.1, 0.36, 0.22, 0.2);
    return g;
  };
  const couple = (k) => {                                // two travellers side by side, turned a little toward each other
    const g = new THREE.Group(), ka = hash(k + 5.5) < 0.5 ? "commuter" : "parent", kb = hash(k + 5.7) < 0.5 ? "dress" : "commuter", small = hash(k + 0.6) < 0.5;
    const a = person(ka, k, { hands: [handFor([-0.74, 1.08, 0.02], tallOf(ka, k), [-0.34, 0], 0.3), null] });
    const b = person(kb, k + 7, { hands: [null, handFor([0.74, small ? 0.92 : 1.08, 0.02], tallOf(kb, k + 7), [0.34, 0], -0.3)] });
    a.position.x = -0.34; a.rotation.y = 0.3; b.position.x = 0.34; b.rotation.y = -0.3; g.add(a, b);
    suitcase(g, k + 0.3, -0.78, 0.1); suitcase(g, k + 0.5, 0.78, 0.1, !small);
    return g;
  };
  // a parent with one or two children, hand in hand: the children reach up to where the parent's hands hang
  const family = (k) => {
    const g = new THREE.Group(), n = hash(k + 0.9) < 0.4 ? 2 : 1, HAND = [0.3, -0.13, 0.06];
    const adult = person("parent", k, { hands: [n === 2 ? [-HAND[0], HAND[1], HAND[2]] : null, HAND] });
    g.add(adult);
    const ps = adult.userData.tall;
    for (let i = 0; i < n; i++) {
      const sg = i ? -1 : 1, kx = sg * 0.42, kk = k + 3 + i * 5;
      const target = handFor([sg * HAND[0] * ps, (HIP + HAND[1]) * ps, HAND[2] * ps], tallOf("child", kk), [kx, 0.04]);
      const kid = person("child", kk, { hands: sg > 0 ? [target, null] : [null, target] });
      kid.position.set(kx, 0, 0.04); g.add(kid);
    }
    return g;
  };
  // the crowd: someone of one of the first six kinds, standing about
  const crowdKind = (k) => wpick([["commuter", 3], ["student", 2.5], ["nurse", 1.5], ["trades", 1.5], ["elder", 1.2], ["dress", 2]], hash(k + 6.1));
  const crowd = (k) => person(crowdKind(k), k);
  const walker = (k) => person(crowdKind(k), k, { stride: hash(k + 0.3) < 0.5 ? 1 : -1 });

  // Once a group is stood in its place: turn every head in it toward a point (in the world), part of the way (share)
  // and no more than `most` radians from where the body faces; anyone looking at a phone glances up from it.
  const turnHeads = (g, target, { share = 0.6, most = 0.75 } = {}) => {
    g.updateMatrixWorld(true);
    g.traverse((h) => {
      if (!h.userData.head) return;
      const t = h.parent.worldToLocal(target.clone()).sub(h.position);
      const yaw = Math.max(-most, Math.min(most, Math.atan2(t.x, t.z) * share));
      h.rotation.set(Math.min(h.rotation.x, 0.15), yaw, 0, "YXZ");
    });
  };

  /* ---- placed groups, merged: one mesh, coloured by vertex, instead of a draw for every part of every person ---- */
  const merged = new THREE.MeshMatcapMaterial({ vertexColors: true, matcap, side: THREE.DoubleSide });
  const bake = (groups) => {
    const parts = []; let nv = 0, ni = 0;
    for (const g of groups) {
      g.updateMatrixWorld(true);
      g.traverse((o) => { if (o.isMesh) { parts.push(o); const n = o.geometry.attributes.position.count; nv += n; ni += o.geometry.index ? o.geometry.index.count : n; } });
    }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Uint8Array(nv * 3), idx = new Uint32Array(ni);
    const v = new THREE.Vector3(), nm = new THREE.Matrix3();
    let ov = 0, oi = 0;
    for (const o of parts) {
      const gm = o.geometry, P = gm.attributes.position, N = gm.attributes.normal, n = P.count, c = o.material.color;
      const cr = Math.round(c.r * 255), cg = Math.round(c.g * 255), cb = Math.round(c.b * 255);
      nm.getNormalMatrix(o.matrixWorld);
      for (let i = 0; i < n; i++) {
        const j = (ov + i) * 3;
        v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); pos[j] = v.x; pos[j + 1] = v.y; pos[j + 2] = v.z;
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[j] = v.x; nor[j + 1] = v.y; nor[j + 2] = v.z;
        col[j] = cr; col[j + 1] = cg; col[j + 2] = cb;
      }
      if (gm.index) for (let i = 0; i < gm.index.count; i++) idx[oi + i] = gm.index.getX(i) + ov;
      else for (let i = 0; i < n; i++) idx[oi + i] = ov + i;
      oi += gm.index ? gm.index.count : n; ov += n;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geom.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(col, 3, true)); geom.setIndex(new THREE.BufferAttribute(idx, 1));
    geom.computeBoundingSphere();
    return new THREE.Mesh(geom, merged);
  };

  return { hash, pick, describe, tallOf, person, crowd, walker, wheelchairUser, withStroller, withBike, suitcase, traveller, couple, family, turnHeads, bake };
}
