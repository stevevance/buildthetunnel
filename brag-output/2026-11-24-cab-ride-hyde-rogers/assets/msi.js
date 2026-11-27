// The Griffin Museum of Science and Industry, at the north end of Jackson Park (57th St and Lake Shore Drive): Charles
// Atwood's Palace of Fine Arts for the 1893 World's Columbian Exposition, rebuilt in stone in 1929-33. For the cab-ride
// film's opening shot (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like obama-center.js.
//
// Where the numbers come from:
//   - The footprint: OpenStreetMap's outline of the whole complex (the main hall, the two pavilions and the corridors to
//     them, and the Henry Crown Space Center), through the Chicago Cityscape CLI, November 2026.
//   - Every height and the parts' extents: Cook County's 2022 LiDAR (ISGS, the DSM less the DTM, on a 3 m grid): the main
//     hall's blocks 14.3 m; the cross's two arms, 33 m wide, gabled, their eaves about 20 m and their ridges 28 m; the central
//     dome 33 m across, its crown 44 m and the lantern's top 47.4 m; the pavilions 15.8 m (their wings 11.9 m), each with a
//     small dome to 22.6-22.9 m; the Space Center 7.8 m, with a dome 27 m across to 20 m; the corridors about 8-11 m.
//   Assumed: the porticos and columns at the arms' ends and along the hall (the building's order, not counted), the stone's
//   colour, the roofs' grey, the dome's rings.
//
//   import * as THREE from "three";
//   import { buildMSI } from "./msi.js";
//   scene.add(buildMSI({ THREE }));
//
// Coordinates are local metres, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: MSI_CENTRE } to have the dome at (0, 0, 0). It needs a browser (or another DOM with <canvas>):
// the stone is painted on a canvas texture.
export const MSI_CENTRE = [-87.5829253, 41.7905495];               // the central dome
const FILM_ORIGIN = [-87.620063, 41.863968];
export const MSI_RING = [[-87.582014,41.79088],[-87.581734,41.790883],[-87.581683,41.790883],[-87.581675,41.790867],[-87.581664,41.790853],[-87.58164,41.790843],[-87.581636,41.790417],[-87.58148,41.790416],[-87.581477,41.790223],[-87.581476,41.790128],[-87.581437,41.790129],[-87.581319,41.79013],[-87.581197,41.79013],[-87.581154,41.790131],[-87.581098,41.790131],[-87.580864,41.790133],[-87.580867,41.790279],[-87.580867,41.790304],[-87.580868,41.790329],[-87.580868,41.790353],[-87.580869,41.790428],[-87.580869,41.790469],[-87.580869,41.79051],[-87.58087,41.790565],[-87.581153,41.790563],[-87.581209,41.790562],[-87.581266,41.790562],[-87.581482,41.79056],[-87.581482,41.790542],[-87.581481,41.790443],[-87.581601,41.790442],[-87.581601,41.790541],[-87.581601,41.79064],[-87.581601,41.790651],[-87.581601,41.790659],[-87.581604,41.790733],[-87.581606,41.790844],[-87.581589,41.790854],[-87.581576,41.790868],[-87.581576,41.790883],[-87.581556,41.790883],[-87.581557,41.790894],[-87.581525,41.790903],[-87.581513,41.790918],[-87.581505,41.790935],[-87.581512,41.790956],[-87.581533,41.790971],[-87.581562,41.790974],[-87.581563,41.790984],[-87.581565,41.791095],[-87.581471,41.791095],[-87.581387,41.791097],[-87.581387,41.791067],[-87.581366,41.791067],[-87.581347,41.791067],[-87.581284,41.791068],[-87.58122,41.791068],[-87.5812,41.791068],[-87.581184,41.791069],[-87.581184,41.791102],[-87.580877,41.791101],[-87.580879,41.791247],[-87.580838,41.791247],[-87.580842,41.791335],[-87.580884,41.791335],[-87.580887,41.791479],[-87.58119,41.791474],[-87.58119,41.791505],[-87.581211,41.791506],[-87.58123,41.791505],[-87.581291,41.791505],[-87.581357,41.791505],[-87.581376,41.791505],[-87.581396,41.791504],[-87.581395,41.791471],[-87.581606,41.791473],[-87.581699,41.791472],[-87.581698,41.791353],[-87.581698,41.791344],[-87.581698,41.791334],[-87.581697,41.791325],[-87.581739,41.791325],[-87.581738,41.791236],[-87.581695,41.791236],[-87.581693,41.790982],[-87.582014,41.790978],[-87.582013,41.791001],[-87.58257,41.790993],[-87.582586,41.790993],[-87.582599,41.790993],[-87.582642,41.790993],[-87.582641,41.791049],[-87.582745,41.791049],[-87.582745,41.791083],[-87.582764,41.791083],[-87.582787,41.791083],[-87.582872,41.791082],[-87.582934,41.791082],[-87.583007,41.791081],[-87.583078,41.791081],[-87.583102,41.79108],[-87.583132,41.791079],[-87.583132,41.791042],[-87.583236,41.791043],[-87.583235,41.790987],[-87.583858,41.790982],[-87.583858,41.790963],[-87.584176,41.790957],[-87.584179,41.79121],[-87.584142,41.79121],[-87.584142,41.791295],[-87.58418,41.791295],[-87.584181,41.791441],[-87.584493,41.791435],[-87.584491,41.791465],[-87.584507,41.791465],[-87.584526,41.791464],[-87.584594,41.791464],[-87.584653,41.791463],[-87.584672,41.791462],[-87.584693,41.791462],[-87.584693,41.791436],[-87.585001,41.791431],[-87.584997,41.791284],[-87.585037,41.791283],[-87.585036,41.791198],[-87.584999,41.791198],[-87.584998,41.791051],[-87.584785,41.791055],[-87.584768,41.791055],[-87.584753,41.791055],[-87.584687,41.791055],[-87.584687,41.791031],[-87.584664,41.791032],[-87.584646,41.791032],[-87.584582,41.791032],[-87.584518,41.791033],[-87.5845,41.791032],[-87.584487,41.791032],[-87.584485,41.791059],[-87.584429,41.79106],[-87.584401,41.79106],[-87.584373,41.791061],[-87.584314,41.791061],[-87.584314,41.790939],[-87.584337,41.790937],[-87.584358,41.790926],[-87.584366,41.790902],[-87.584355,41.790882],[-87.584342,41.790871],[-87.584314,41.790864],[-87.584315,41.790851],[-87.584291,41.790852],[-87.584288,41.790829],[-87.584243,41.790813],[-87.584209,41.790822],[-87.584192,41.790838],[-87.584189,41.790855],[-87.583855,41.79086],[-87.583851,41.790783],[-87.58385,41.790761],[-87.58385,41.790738],[-87.583849,41.790703],[-87.583847,41.790684],[-87.58386,41.790684],[-87.583972,41.790685],[-87.58397,41.790633],[-87.583969,41.7906],[-87.583969,41.790537],[-87.583968,41.790467],[-87.583968,41.79044],[-87.583967,41.790394],[-87.583938,41.790395],[-87.583882,41.790395],[-87.583839,41.790395],[-87.583838,41.79026],[-87.583837,41.790205],[-87.583837,41.790095],[-87.5835,41.790103],[-87.583494,41.790103],[-87.583483,41.790103],[-87.583466,41.790103],[-87.583352,41.790106],[-87.583215,41.790107],[-87.583215,41.790054],[-87.583215,41.790053],[-87.583107,41.790054],[-87.583107,41.790016],[-87.58308,41.790016],[-87.583057,41.790016],[-87.582968,41.790017],[-87.582915,41.790018],[-87.582767,41.790021],[-87.582745,41.790022],[-87.582726,41.790022],[-87.582716,41.790023],[-87.58271,41.790023],[-87.582711,41.790056],[-87.582616,41.790058],[-87.582617,41.790116],[-87.581997,41.790121],[-87.581999,41.790417],[-87.58188,41.790419],[-87.581884,41.790436],[-87.581883,41.790444],[-87.581883,41.790451],[-87.581881,41.790463],[-87.581884,41.790497],[-87.581884,41.790559],[-87.581884,41.79063],[-87.581884,41.790657],[-87.581885,41.790705],[-87.582011,41.790705],[-87.582013,41.790767],[-87.582013,41.790781],[-87.582013,41.790794],[-87.582014,41.79088]];
export function msiSite(origin = FILM_ORIGIN) {                     // the outline as a closed ring of local metres [x, z, ...]
  const L = local(origin);
  return MSI_RING.flatMap(([lon, lat]) => L(lon, lat));
}
function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}

export function buildMSI({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...MSI_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz);
  const at = (lon, lat) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; };   // relative to the dome
  // the stone: a 6 m bay of the order, a pilaster each side, a tall window between, a band at the top; repeated by the
  // walls' uv (in bays across, in storeys of 14.3 m up)
  const bay = (() => {
    const cv = document.createElement("canvas"); cv.width = 128; cv.height = 256;
    const c = cv.getContext("2d");
    c.fillStyle = "#e4ddcd"; c.fillRect(0, 0, 128, 256);
    c.fillStyle = "#d3cbb9"; c.fillRect(0, 0, 18, 256); c.fillRect(110, 0, 18, 256);       // pilasters' shadowed sides
    c.fillStyle = "#efe9dc"; c.fillRect(4, 0, 10, 256); c.fillRect(114, 0, 10, 256);
    c.fillStyle = "#c9c0ad"; c.fillRect(0, 0, 128, 22); c.fillRect(0, 230, 128, 26);       // the cornice; the base
    c.fillStyle = "#8a8578"; c.fillRect(40, 70, 48, 120);                                  // a window
    c.fillStyle = "#a39d8e"; c.fillRect(40, 70, 48, 8);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  })();
  const stone = new THREE.MeshStandardMaterial({ map: bay, roughness: 0.8 });
  const plain = new THREE.MeshStandardMaterial({ color: 0xe6dfd0, roughness: 0.8 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x9ba3a3, roughness: 0.75, side: THREE.DoubleSide });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xd8d4ca, roughness: 0.7 });
  const ring = new THREE.MeshStandardMaterial({ color: 0xb9b3a6, roughness: 0.8 });
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  // a block w (x) by d (z) and h tall, its walls in the stone (uv in bays and storeys), its roof flat and grey
  const block = (x0, x1, z0, z1, h, y0 = 0) => {
    const w = x1 - x0, d = z1 - z0, geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv;
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {    // BoxGeometry's faces: +x, -x, +y, -y, +z, -z
      const i = f * 4 + k, span = f < 2 ? d : w;
      uv.setXY(i, uv.getX(i) * span / 6, uv.getY(i) * h / 14.3);
    }
    const m = add(geo, [stone, stone, roof, plain, stone, stone], (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2);
    add(new THREE.BoxGeometry(w + 1.2, 0.9, d + 1.2), plain, (x0 + x1) / 2, y0 + h - 0.45, (z0 + z1) / 2);   // the cornice
    return m;
  };
  // one of the cross's arms: walls to the eaves, then a gable to the ridge, len long, centred, along x (or z if turned)
  const arm = (len, turned) => {
    const W = 16.5;
    if (turned) block(-W, W, -len / 2, len / 2, 20); else block(-len / 2, len / 2, -W, W, 20);
    const sh = new THREE.Shape([new THREE.Vector2(-W - 0.6, 20), new THREE.Vector2(W + 0.6, 20), new THREE.Vector2(0, 28)]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: len + 1.2, bevelEnabled: false });
    geo.translate(0, 0, -(len + 1.2) / 2);
    const m = new THREE.Mesh(geo, [plain, roof]);               // (its ends, pediments in the stone; its slopes, grey)
    if (!turned) m.rotation.y = Math.PI / 2;
    g.add(m);
    for (const sg of [-1, 1]) {                                 // a portico at each end: a stylobate, columns, an entablature
      const p = new THREE.Group(); p.rotation.y = turned ? (sg > 0 ? 0 : Math.PI) : (sg > 0 ? Math.PI / 2 : -Math.PI / 2); g.add(p);
      const e = len / 2;
      const steps = new THREE.Mesh(new THREE.BoxGeometry(36, 1.4, 7), plain); steps.position.set(0, 0.7, e + 3.2); p.add(steps);
      const col = new THREE.CylinderGeometry(0.85, 0.95, 15.6, 12);
      for (let k = 0; k < 8; k++) { const c = new THREE.Mesh(col, plain); c.position.set(-14.7 + k * 4.2, 1.4 + 7.8, e + 4.2); p.add(c); }
      const ent = new THREE.Mesh(new THREE.BoxGeometry(34, 2.4, 3.2), plain); ent.position.set(0, 18.2, e + 4.2); p.add(ent);
      const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-17, 0), new THREE.Vector2(17, 0), new THREE.Vector2(0, 7.6)]),
        { depth: 3.2, bevelEnabled: false }), [plain, roof]);
      ped.position.set(0, 19.4, e + 2.6); p.add(ped);
    }
  };
  // the corridors, the Space Center's base and anything else in the outline: 8 m, under the rest
  {
    const pts = MSI_RING.map(([lon, lat]) => { const [x, z] = at(lon, lat); return new THREE.Vector2(x, -z); });
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 8, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    add(geo, [roof, plain]);
  }
  // the main hall: four corner blocks round the cross (one block under it), the two arms, columns along its long sides
  block(-76, 76, -45, 48, 14.3);
  arm(164, false); arm(113, true);
  {
    const col = new THREE.CylinderGeometry(0.7, 0.8, 12.4, 10), n = 2 * Math.floor(140 / 6);
    const cols = new THREE.InstancedMesh(col, plain, n), m4 = new THREE.Matrix4();
    let k = 0;
    for (const z of [-45.9, 48.9]) for (let x = -70; x <= 70 && k < n; x += 6) { if (Math.abs(x) < 20) continue; cols.setMatrixAt(k++, m4.makeTranslation(x, 6.2, z)); }
    cols.count = k; g.add(cols);
  }
  // the central dome: a drum, the dome (its profile from the LiDAR, every 3 m out from the crown), rings round it, the lantern
  add(new THREE.CylinderGeometry(16.5, 16.5, 7, 40), stone, 0, 29.5, 0);
  const profile = [[16.5, 33], [15.4, 35.4], [13.6, 37.4], [11.6, 39.2], [9, 41.2], [6, 43], [3, 44], [0.01, 44.3]];
  add(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 40), domeMat);
  for (const [r, y] of [[15.9, 34.5], [12.7, 38.3], [9, 41.25]]) add(new THREE.TorusGeometry(r, 0.25, 6, 48), ring, 0, y, 0).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(2.4, 2.6, 2.6, 16), plain, 0, 45.4, 0);
  add(new THREE.ConeGeometry(2.6, 1.6, 16), domeMat, 0, 47.4 - 0.8, 0);
  // the pavilions, north-west and north-east: a block, its wings, a small dome
  for (const lon of [-87.58477, -87.58148]) {
    const [px, pz] = at(lon, 41.79128);
    block(px - 24, px + 24, pz - 21, pz + 21, 15.8);
    block(px - 33, px - 24, pz - 15, pz + 15, 11.9); block(px + 24, px + 33, pz - 15, pz + 15, 11.9);
    add(new THREE.CylinderGeometry(7.2, 7.2, 2, 28), stone, px, 16.8, pz);
    add(new THREE.SphereGeometry(7.2, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, px, 17.8, pz).scale.y = 0.68;
  }
  // the Henry Crown Space Center's dome, on its 8 m base
  {
    const [sx, sz] = at(-87.5811542, 41.7903334);
    add(new THREE.SphereGeometry(13.6, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, sx, 7.8, sz).scale.y = 12.2 / 13.6;
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
