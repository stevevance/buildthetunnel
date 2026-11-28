// Deering Bridge: a 1916 C&NW Strauss heel-trunnion bascule, drawn lowered (closed, trains crossing),
// after an aerial photo. Proportions are approximate. The counterweights are concrete blocks beside
// the tracks, outside the trusses, hung clear of the heel pier, chamfered at the land end. The three-track leaf is drawn with trusses at
// lateral ±7.4 m; the unused third track isn't drawn.

const RUST = 0x6e4a33;
const RUST_DARK = 0x5e3f2c;
const CONCRETE = 0xa9ada8;
const COUNTERWEIGHT = 0x9fa19b;
const HOUSE_WALL = 0xb5b3ad;
const HOUSE_ROOF = 0x6f6e6a;
const TRUSS = 7.4;
const DECK = 7.6;
const BOT_Y = -0.2;
const TOP_Y = 7.5;
const HEEL_TOP = 13.5;
const FLOOR_Y = -1.5;

export function buildRiverBridge({ THREE, scene, at, d0, d1, trackLats, ground = 0 }) {   // ground: the rail's height above the street
  const group = new THREE.Group();
  group.name = 'deering-bridge';

  const steel = new THREE.MeshStandardMaterial({ color: RUST, roughness: 0.8, metalness: 0.1 });
  const bracing = new THREE.MeshStandardMaterial({ color: RUST_DARK, roughness: 0.8, metalness: 0.1 });
  const concrete = new THREE.MeshStandardMaterial({ color: CONCRETE, roughness: 0.9, metalness: 0 });
  const counter = new THREE.MeshStandardMaterial({ color: COUNTERWEIGHT, roughness: 0.9, metalness: 0 });
  const wall = new THREE.MeshStandardMaterial({ color: HOUSE_WALL, roughness: 0.9, metalness: 0 });
  const roof = new THREE.MeshStandardMaterial({ color: HOUSE_ROOF, roughness: 0.9, metalness: 0 });
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);

  const add = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };

  // Box centred at c: sx across the line, sy up, sz along it.
  const frameBox = (c, right, sx, sy, sz, mat) => {
    const x = right.clone().normalize();
    const z = new THREE.Vector3().crossVectors(x, Y);
    const mesh = new THREE.Mesh(unit, mat);
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, Y, z));
    mesh.position.copy(c);
    mesh.scale.set(sx, sy, sz);
    return mesh;
  };

  // Member from a to b, w by h in section.
  const beam = (a, b, w, h, mat) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(unit, mat);
    mesh.quaternion.setFromUnitVectors(Z, dir.divideScalar(len));
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.scale.set(w, h, len);
    return mesh;
  };

  // Heel pier, wide enough for both counterweight blocks; far abutment under the toe.
  const pierBot = -ground - 4, pierYc = (pierBot + -0.15) / 2;    // down into the river bed
  const pier = at(d0 - 2, 0, pierYc);
  add(frameBox(pier.p, pier.right, 30, -0.15 - pierBot, 20, concrete));
  const far = at(d1 + 2, 0, pierYc);
  add(frameBox(far.p, far.right, 18, -0.15 - pierBot, 8, concrete));

  // Counterweights: tall, thin concrete blocks on each side, outside the trusses, never over the tracks
  // (2.8 m thick, 7 m along the line, as in the aerial photo). They hang clear of the ground, CW_BOT up,
  // and their bottom corner at the land end is chamfered: as the leaf opens they swing down behind the
  // heel, and neither may strike the pier.
  const CW_THICK = 2.8, CW_LONG = 7, CW_BOT = 3.5, CW_TOP = 15, CW_IN = 9, CW_CHAMFER = 3, CW_D = d0 - 4;
  const profile = new THREE.Shape();                     // in (along the line, up), land end first
  profile.moveTo(-CW_LONG / 2, CW_BOT + CW_CHAMFER);
  profile.lineTo(-CW_LONG / 2 + CW_CHAMFER, CW_BOT);
  profile.lineTo(CW_LONG / 2, CW_BOT);
  profile.lineTo(CW_LONG / 2, CW_TOP);
  profile.lineTo(-CW_LONG / 2, CW_TOP);
  profile.closePath();
  const cwGeo = new THREE.ExtrudeGeometry(profile, { depth: CW_THICK, bevelEnabled: false });
  cwGeo.translate(0, 0, -CW_THICK / 2);
  for (const s of [-1, 1]) {
    const q = at(CW_D, s * (CW_IN + CW_THICK / 2), 0), mesh = new THREE.Mesh(cwGeo, counter);
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(q.tan.clone().normalize(), Y, q.right.clone().normalize()));
    mesh.position.copy(q.p);
    add(mesh);
    // a bracket from its inner face, low down, to the heel frame's post, beside the struts at its top (below)
    add(beam(at(CW_D, s * CW_IN, CW_BOT + 1.5).p, at(CW_D, s * 7.8, CW_BOT + 1.5).p, 0.7, 0.9, steel));
  }

  // Heel framework: side frames at ±7.8 rising to 13.5 m, X-braced across the top.
  const heelA = d0 - 4;
  const heelB = d0 + 8;
  for (const s of [-7.8, 7.8]) {
    add(beam(at(heelA, s, -0.15).p, at(heelA, s, HEEL_TOP).p, 0.8, 0.8, steel));
    add(beam(at(heelB, s, -0.15).p, at(heelB, s, HEEL_TOP).p, 0.8, 0.8, steel));
    add(beam(at(heelA, s, HEEL_TOP).p, at(heelB, s, HEEL_TOP).p, 0.8, 0.8, steel));
    add(beam(at(heelA, s, -0.15).p, at(heelB, s, HEEL_TOP).p, 0.5, 0.5, steel));
  }
  for (const d of [heelA, (heelA + heelB) / 2, heelB]) {
    add(beam(at(d, -7.8, HEEL_TOP).p, at(d, 7.8, HEEL_TOP).p, 0.5, 0.5, bracing));
  }
  for (const [d0x, d1x] of [[heelA, (heelA + heelB) / 2], [(heelA + heelB) / 2, heelB]]) {
    add(beam(at(d0x, -7.8, HEEL_TOP).p, at(d1x, 7.8, HEEL_TOP).p, 0.35, 0.35, bracing));
    add(beam(at(d0x, 7.8, HEEL_TOP).p, at(d1x, -7.8, HEEL_TOP).p, 0.35, 0.35, bracing));
  }
  // Heavy struts from each counterweight's inner top edge to the heel frame's top corners.
  for (const s of [-1, 1]) {
    add(beam(at(CW_D - CW_LONG / 2, s * CW_IN, CW_TOP).p, at(heelA, s * 7.8, HEEL_TOP).p, 0.8, 0.8, steel));
    add(beam(at(CW_D + CW_LONG / 2, s * CW_IN, CW_TOP).p, at(heelB, s * 7.8, HEEL_TOP).p, 0.8, 0.8, steel));
    // Sloped member stepping down from the heel frame to the leaf's top chord.
    add(beam(at(heelB, s * 7.8, HEEL_TOP).p, at(heelB + 2, s * TRUSS, TOP_Y).p, 0.8, 0.8, steel));
  }

  // Leaf: heel at d0+8, toe on the far abutment at d1-2.
  const heel = heelB;
  const toe = d1 - 2;
  const span = toe - heel;
  const n = Math.max(4, Math.round(span / 6.5));
  const pan = span / n;
  const dAt = (i) => heel + i * pan;
  const B = (i, s) => at(dAt(i), s, BOT_Y).p;
  const T = (i, s) => at(dAt(i), s, TOP_Y).p;

  // Deck slab and transverse floor beams under the leaf.
  const dm = (heel + toe) / 2;
  const deck = at(dm, 0, (FLOOR_Y + -0.15) / 2 + 0.2);
  add(frameBox(deck.p, deck.right, DECK * 2, 1.25, span, steel));
  for (let i = 0; i <= n; i++) {
    add(beam(at(dAt(i), -TRUSS, FLOOR_Y).p, at(dAt(i), TRUSS, FLOOR_Y).p, 0.5, 0.4, steel));
  }

  // Two trusses: parallel chords, Warren web, verticals, and a sloped end post at the toe.
  for (const s of [-TRUSS, TRUSS]) {
    for (let i = 0; i < n; i++) add(beam(B(i, s), B(i + 1, s), 0.7, 0.7, steel));
    for (let i = 0; i < n - 1; i++) add(beam(T(i, s), T(i + 1, s), 0.7, 0.7, steel));
    for (let i = 0; i < n; i++) add(beam(B(i, s), T(i, s), 0.45, 0.45, steel));
    add(beam(B(n, s), T(n - 1, s), 0.7, 0.7, steel));
    for (let i = 0; i <= n - 2; i++) {
      add(i % 2 ? beam(T(i, s), B(i + 1, s), 0.45, 0.45, steel) : beam(B(i, s), T(i + 1, s), 0.45, 0.45, steel));
    }
  }

  // Top lateral struts and X-bracing across the whole flat top.
  for (let i = 0; i < n; i++) {
    add(beam(at(dAt(i), -TRUSS, TOP_Y).p, at(dAt(i), TRUSS, TOP_Y).p, 0.5, 0.5, bracing));
  }
  for (let i = 0; i < n - 1; i++) {
    const s = i % 2 ? -TRUSS : TRUSS;
    add(beam(at(dAt(i), s, TOP_Y).p, at(dAt(i + 1), -s, TOP_Y).p, 0.35, 0.35, bracing));
  }
  // Portal bracing at the toe end, across the sloped end posts at mid-height.
  const toeMidY = (BOT_Y + TOP_Y) / 2;
  add(beam(at(dAt(n), -TRUSS, toeMidY).p, at(dAt(n), TRUSS, toeMidY).p, 0.5, 0.5, bracing));

  // Operator's house beyond the west counterweight, on the bank at ground level.
  const house = at(d0 - 18, -19, 1.75 - ground);
  add(frameBox(house.p, house.right, 3.5, 3.5, 6, wall));
  const roofP = at(d0 - 18, -19, 3.65 - ground);
  add(frameBox(roofP.p, roofP.right, 3.8, 0.3, 6.2, roof));

  scene.add(group);
  return group;
}
