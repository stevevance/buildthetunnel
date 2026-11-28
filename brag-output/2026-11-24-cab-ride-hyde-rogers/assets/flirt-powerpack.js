// The PowerPack of Metra's Stadler FLIRT battery train (BEMU): the short module between its intermediate cars that
// carries the batteries, wider and taller than the cars (2980 x 4285 mm, Stadler's data sheet FBEMU_Metra0724en_us) and
// 9.3 m joint to joint (scaled from the sheet's elevation). No windows: three tall panels a side, drawn as louvred
// grilles (assumed: the drawing shows only their outlines), ribbed posts at its ends, fairings sloping up from the cars'
// roofs either side to its own, equipment slung underneath, and the pantograph. Built with the same parts as the
// CrossTowner train (assets/crosstowner-train.js), which leaves it out; kept for later.
//
//   import * as THREE from "three";
//   import { buildCrossTowner } from "./crosstowner-train.js";
//   import { buildPowerPack, BEMU_CONSIST } from "./flirt-powerpack.js";
//   scene.add(buildPowerPack({ THREE, bogies: true }));         // on its own, on the two bogies it shares with the cars
//   scene.add(buildCrossTowner({ THREE, consist: BEMU_CONSIST }));   // the whole BEMU, 84.1 m, with it in the middle
//
// Its origin is on the rail at its middle, +z forward (its pantograph is toward the front), y up, in metres.
import { flirtKit, section, arcs, vLeftOf, BODY, END, CONSIST } from "./crosstowner-train.js";

export const PACK = { b: 0.8, hb: 1.46, hs: 1.49, ys: 3.98, T: 4.2, n: 5 };   // its cross-section: 2.98 m wide, 4.2 m to the roof
export const PACK_LEN = 9.3;
const PROFILE = section(PACK), V = arcs(PROFILE), vAt = vLeftOf(PROFILE, V);
const lerp = (a, b, f) => a + (b - a) * f;

export function buildPowerPack({ THREE, lit = false, bogies = false, kit = flirtKit({ THREE, lit }) }) {
  const { under, roofGrey, glare, ROOF_C, prism, sidewise, box, sideCanvas, fairingMat, bogie, pantograph, meshesTo } = kit;
  const g = new THREE.Group(), len = PACK_LEN, zOf = (zf) => len / 2 - zf;   // zf: metres back from its front end
  const f0 = END, f1 = len - END;
  const map = sideCanvas(f0, f1, vAt, ({ band }) => {
    band(3.55, 3.95, 0, f1, "#c6cdd0");                         // a ribbed band along the top of each side
    for (let y = 3.6; y < 3.93; y += 0.07) band(y, y + 0.012, END, f1, "#a3abaf");
    band(PACK.T - 0.12, 9, 0, f1, ROOF_C);
    for (const [z0, z1] of [[0.84, 2.81], [3.82, 5.73], [6.8, 8.74]]) {   // the three panels over the batteries
      band(1.05, 3.4, z0, z1, "#3d464b", 12);
      for (let z = z0 + 0.1; z < z1 - 0.06; z += 0.09) band(1.12, 3.33, z, z + 0.025, "#566168");
      for (const f of [1 / 3, 2 / 3]) band(1.08, 3.37, lerp(z0, z1, f) - 0.03, lerp(z0, z1, f) + 0.03, "#2a3135");
    }
    for (const z of [END, f1 - 0.3]) {                          // ribbed posts at its ends
      band(0.8, 3.98, z, z + 0.28, "#aab2b6");
      for (let k = 0; k < 4; k++) band(0.85, 3.93, z + 0.03 + k * 0.065, z + 0.05 + k * 0.065, "#8d969a");
    }
  }, false);
  meshesTo(g, prism(PROFILE, zOf(f1), zOf(f0), V), new THREE.MeshStandardMaterial({ map, roughness: 0.4, metalness: 0.12, envMap: glare,
    envMapIntensity: lit ? 0.35 : 0.4, side: THREE.DoubleSide }));
  box(g, 2.6, 0.08, len - 1.0, 0, PACK.T + 0.04, 0, roofGrey);           // its roof cover, at 4.285 m
  box(g, 2.4, 0.45, len - 1.6, 0, 0.58, 0, under);                       // equipment underneath
  for (const sg of [-1, 1]) {                                            // fairings sloping up from the cars' roofs either side
    const ramp = sidewise([[0, 3.78], [0, PACK.T + 0.02], [1.7, BODY.T + 0.02], [1.7, 3.78]], 2.3, 0, fairingMat);
    if (sg > 0) ramp.rotation.y = Math.PI;
    ramp.position.z = sg * (len / 2 - END); g.add(ramp);
  }
  g.add(pantograph(zOf(2.0), PACK.T + 0.13));
  if (bogies) for (const z of [-len / 2, len / 2]) { const b = bogie(false); b.position.z = z; g.add(b); }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.len = len;
  return g;
}

// Metra's BEMU as Stadler drew it: the CrossTowner train's four cars with the PowerPack between the intermediate two,
// which have one door a side as drawn (bemuMid), and the pantograph on the PowerPack in place of the intermediate car's.
export const BEMU_CONSIST = [
  CONSIST[0],
  { ...CONSIST[1], kind: "bemuMid", pan: false },
  { kind: "pp", len: PACK_LEN, build: (kit) => buildPowerPack({ THREE: kit.THREE, lit: kit.lit, kit }) },
  { ...CONSIST[2], kind: "bemuMid" },
  CONSIST[3],
];
