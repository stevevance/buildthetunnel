// Bally's Chicago as designed (HKS's Phase 1 site approval, revised January 21, 2025): the casino and its podium, the
// parking decks built into it, the hotel tower at the south end (about 136 m) and the riverfront landscape. The four
// modules beside this one (tower.js, podium.js, garage.js, landscape.js) are the "Bally's Chicago exterior model"
// (assets/Ballys-Chicago-Project.zip; see MODEL-README.md), unchanged; its own streets, river, neighbouring buildings
// and people are left out, the film having its own. This places the model in the film.
//
// The model's frame (metres, +X east along Chicago Avenue, +Z south, from its site datum) is registered to the film's
// local metres by fitting ten named buildings of its context data (Admiral's Pointe, Erie on the Park, Parc Huron and
// others) to OpenStreetMap's: turned 2.5 degrees, then moved; each lands within 11 m. (The fit also asked for a 1.6%
// stretch, taken to be the context's generalisation and left out.)
//
//   import * as THREE from "three";
//   import { buildBallysResort } from "./ballys-resort/index.js";
//   const resort = buildBallysResort({ THREE });   // a THREE.Group; resort.userData.site: its outline, [x, z, ...]
//   scene.add(resort);
//
// `origin` ([lon, lat]) is the film's by default (Roosevelt Rd at the lakefront). It needs a browser (or another DOM
// with <canvas>): the signs are painted on canvas textures.
import { buildTower } from "./tower.js";
import { buildGarage } from "./garage.js";
import { buildPodium } from "./podium.js";
import { buildLandscape } from "./landscape.js";

const FILM_ORIGIN = [-87.620063, 41.863968];
const TURN = -2.501 * Math.PI / 180;                              // the fit, as a complex multiplier's angle (three.js turns the other way)
const SHIFT = [-2100.33, -3444.43];                              // ...and where the model's datum lands, in the film's metres

export function buildBallysResort({ THREE, origin = FILM_ORIGIN }) {
  const model = new THREE.Group();
  model.name = "Bally's Chicago";
  buildGarage(THREE, model);
  buildPodium(THREE, model);
  const hotel = new THREE.Group();                               // (the model's own registration of the hotel, at the Erie alignment)
  hotel.position.set(65.6, 0, 137.3);
  buildTower(THREE, hotel); model.add(hotel);
  const buildings = model.children.slice();                      // (for the outline: not the landscape)
  buildLandscape(THREE, model);
  // into the film: turned, moved, and moved again if the film's origin is not its own
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  const dx = (FILM_ORIGIN[0] - origin[0]) * KX, dz = (origin[1] - FILM_ORIGIN[1]) * KY;
  const placed = new THREE.Group();
  placed.rotation.y = -TURN;
  placed.position.set(SHIFT[0] + dx, 0, SHIFT[1] + dz);
  placed.add(model);
  placed.updateMatrixWorld(true);
  // its outline on the ground (the buildings' convex hull), for clearing OpenStreetMap's buildings off the site
  const pts = [], v = new THREE.Vector3();
  for (const b of buildings) b.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 400));
    for (let i = 0; i < p.count; i += step) {
      if (o.isInstancedMesh) continue;
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); pts.push([v.x, v.z]);
    }
  });
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (const p of pts.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  placed.userData.site = [...hull, hull[0]].flatMap(([x, z]) => [x, z]);
  // The model's glass is a near-mirror, lit in its own viewer by a sky; the film has none for it to mirror, so it went
  // black. Here it mirrors a painted one: blue overhead, pale at the horizon, the grey of the city below.
  const sky = (() => {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
    const c = cv.getContext("2d"), g = c.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#7fa6cf"); g.addColorStop(0.45, "#d6e3ee"); g.addColorStop(0.5, "#eef2f4"); g.addColorStop(0.56, "#9ba3a5"); g.addColorStop(1, "#5d6466");
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(cv); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  placed.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m.isMeshPhysicalMaterial && !m.envMap) m.envMap = sky;
  });
  return placed;
}
