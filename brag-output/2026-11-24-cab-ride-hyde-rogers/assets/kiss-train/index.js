// The CrossTowner double-decker: a four-car electric multiple unit drawn from the "Caltrain Stadler KISS" model
// (assets/Caltrain-KISS-project.zip; MODEL-README.md), its body, roof and running gear unchanged in shape but repainted
// in the CrossTowner's white and teal (body.js), with a reworked nose (cab.js: a longer rake, a square-footed
// windscreen, a slim headlamp bar and horizontal lamps) and none of Caltrain's or Stadler's marks. The film runs it as
// the trains seen on the other lines and the other track: the UP North, the Metra Electric and the tunnel.
//
//   import * as THREE from "three";
//   import { buildKiss, KISS_LENGTH } from "./kiss-train/index.js";
//   scene.add(buildKiss({ THREE, sign: "X1 South Chicago" }));   // 106.2 m over its couplers
//
// Like the CrossTowner FLIRT (assets/crosstowner-train.js) it is a group of cars, each with its origin on the rail
// midway between its two joints and +z toward the leading end, and userData { len, from, kind }: its length joint to
// joint and how far its front joint is behind the train's front. (The model itself runs along +x.) `wire`: the contact
// wire's height above the rail, for the raised pantograph (5.7 m in the open, 5.3 m in the tunnel). `lit`: the
// windows glow, as underground.
import { buildBody } from "./body.js";
import { buildCab } from "./cab.js";
import { buildRoof } from "./roof.js";
import { buildGear, buildConnection } from "./gear.js";
import { preparePart } from "./batch.js";

const GAP = 0.87, NOSE = 0.57;                                    // the gap between bodies; nose to coupler plane
// coupler plane to coupler plane, as the KISS's B, G, F and A cars (the F carries the raised pantograph). (The cab
// numbers use only the digits the nose's numeral outlines have: 1, 2 and 3.)
export const KISS_FORMATION = [
  { type: "B", number: "2131", pitch: 27.495 },
  { type: "G", number: "2111", pitch: 25.110 },
  { type: "F", number: "2112", pitch: 26.120 },
  { type: "A", number: "2132", pitch: 27.495 },
];
export const KISS_LENGTH = KISS_FORMATION.reduce((s, c) => s + c.pitch, 0);

// "CrossTowner" in teal, flat in its XY plane facing +z, `width` wide (where the KISS had Caltrain's roundel)
function wordmark(THREE, width) {
  const g = new THREE.Group();
  try {
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 192;
    const c = cv.getContext("2d");
    c.clearRect(0, 0, 1024, 192);
    c.font = "italic 700 150px Helvetica, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "#0b7285"; c.fillText("CrossTowner", 512, 100);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 0.1875),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.name = "CrossTowner wordmark"; g.add(m);
  } catch { /* no canvas (a Node dry run): no wordmark */ }
  return g;
}

export function buildKiss({ THREE, sign = "X1 South Chicago", wire = 5.7, lit = false, formation = KISS_FORMATION }) {
  const total = formation.reduce((s, c) => s + c.pitch, 0);
  const [service, ...rest] = sign.split(" ");
  const train = new THREE.Group();
  train.name = `CrossTowner double-decker (${sign})`;
  let north = total / 2;                                          // the leading coupler plane, along the model's +x
  formation.forEach((info, index) => {
    const lead = index === 0, tail = index === formation.length - 1, cab = lead || tail;
    const south = north - info.pitch, mid = (north + south) / 2;
    const northEdge = north - (lead ? NOSE : GAP / 2), southEdge = south + (tail ? NOSE : GAP / 2);
    const length = northEdge - southEdge;
    const bogieCenters = cab ? [length / 2 + NOSE - 5.55, -length / 2 - GAP / 2 + 3.26] : [info.pitch / 2 - 3.26, -info.pitch / 2 + 3.26];
    const ctx = { ...info, index, cab, length, bogieCenters, activeCab: lead, pantographRaised: info.type === "F", gap: GAP,
      service, destination: rest.join(" "), makeLogo: wordmark, contactWireHeight: wire };
    const car = new THREE.Group();
    car.position.x = (southEdge + northEdge) / 2 - mid;
    if (tail) car.rotation.y = Math.PI;
    const add = (name, part) => { part.name = name; car.add(preparePart(THREE, part)); };
    add("Carbody, glazing and markings", buildBody(THREE, ctx));
    if (cab) { const nose = buildCab(THREE, ctx); nose.position.x = length / 2; add("Driving cab and coupler", nose); }
    add("Roof equipment", buildRoof(THREE, ctx));
    add("Bogie assemblies and underfloor equipment", buildGear(THREE, ctx));
    const turn = new THREE.Group();                               // the model's +x to the film's +z
    turn.rotation.y = -Math.PI / 2;
    turn.add(car);
    if (!tail) {                                                  // the gangway behind it goes with it
      const gangway = preparePart(THREE, buildConnection(THREE, { gap: GAP, index }));
      gangway.position.x = south - mid;
      turn.add(gangway);
    }
    const unit = new THREE.Group();
    unit.name = `Car ${info.type} ${info.number}`;
    unit.add(turn);
    unit.userData = { len: info.pitch, from: total / 2 - north, kind: info.type };
    train.add(unit);
    north = south;
  });
  // underground, the windows glow from inside (on this train's own copies of the shared glass)
  const copies = new Map();
  train.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (!lit || !/glass/i.test(o.material.name || "")) return;
    if (!copies.has(o.material)) { const m = o.material.clone(); m.emissive = new THREE.Color(0xffe7bf); m.emissiveIntensity = 0.35; copies.set(o.material, m); }
    o.material = copies.get(o.material);
  });
  train.userData = { len: total, kind: "kiss" };
  return train;
}
