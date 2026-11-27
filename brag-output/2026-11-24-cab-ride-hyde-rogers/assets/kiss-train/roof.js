// Roof equipment dimensions are in metres from railhead.
// Caltrain Fire Life Safety, p. 15, identifies the pantograph ends on D and F.
// Caltrain OCS Safety Awareness, pp. 44–45, and Camlin RoofVue show the equipment.

const roofHeight = 4.63;
const nominalWireHeight = 22 * 0.3048;
const foldedHeight = 4.826;
const materialCache = new WeakMap();

function roofMaterials(THREE) {
  if (materialCache.has(THREE)) return materialCache.get(THREE);
  const finish = (name, color, metalness, roughness) =>
    new THREE.MeshStandardMaterial({ name, color, metalness, roughness });
  const materials = {
    aluminum: finish('Roof equipment | satin aluminum', 0xa9afb3, 0.44, 0.42),
    hardware: finish('Roof equipment | dark galvanized steel', 0x666a6a, 0.48, 0.46),
    casing: finish('Roof equipment | dull stainless casing', 0x7d8487, 0.36, 0.53),
    ceramic: finish('Roof equipment | ribbed gray insulator', 0x67686b, 0.11, 0.55),
    rubber: finish('Roof equipment | graphite and rubber', 0x272a2b, 0.12, 0.74),
    mesh: finish('Roof equipment | perforated grating', 0x575859, 0.31, 0.64),
    warm: finish('Roof equipment | copper bonding straps', 0x966c4a, 0.46, 0.50),
    yellow: finish('Roof marking | caution yellow', 0xe3b332, 0.06, 0.66),
  };
  materialCache.set(THREE, materials);
  return materials;
}

function meshBatch(THREE, group) {
  const parts = new Map();
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const up = new THREE.Vector3(0, 1, 0);
  const point = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const transform = new THREE.Matrix4();
  const normalTransform = new THREE.Matrix3();

  function add(geometry, material, position, scale = [1, 1, 1], quaternion = rotation.identity()) {
    let part = parts.get(material);
    if (!part) {
      part = { positions: [], normals: [], indices: [] };
      parts.set(material, part);
    }
    transform.compose(new THREE.Vector3(...position), quaternion, new THREE.Vector3(...scale));
    normalTransform.getNormalMatrix(transform);
    const offset = part.positions.length / 3;
    const positionAttr = geometry.attributes.position;
    const normalAttr = geometry.attributes.normal;
    for (let i = 0; i < positionAttr.count; i++) {
      point.fromBufferAttribute(positionAttr, i).applyMatrix4(transform);
      part.positions.push(point.x, point.y, point.z);
      point.fromBufferAttribute(normalAttr, i).applyNormalMatrix(normalTransform);
      part.normals.push(point.x, point.y, point.z);
    }
    const index = geometry.index;
    for (let i = 0; i < (index?.count ?? positionAttr.count); i++) {
      part.indices.push(offset + (index ? index.getX(i) : i));
    }
  }

  function box(material, x, y, z, dx, dy, dz) {
    add(boxGeometry, material, [x, y, z], [dx, dy, dz]);
  }

  function between(material, start, end, radius, tipRadius = radius, sides = 10) {
    const startPoint = new THREE.Vector3(...start);
    const direction = new THREE.Vector3(...end).sub(startPoint);
    const length = direction.length();
    const center = startPoint.addScaledVector(direction, 0.5);
    const orientation = rotation.setFromUnitVectors(up, direction.normalize());
    const geometry = new THREE.CylinderGeometry(tipRadius, radius, 1, sides, 1);
    add(geometry, material, center.toArray(), [1, length, 1], orientation);
  }

  function tube(material, points, radius, sides = 8) {
    const vectors = points.map(coordinates => new THREE.Vector3(...coordinates));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const geometry = new THREE.TubeGeometry(curve, Math.max(8, points.length * 3), radius, sides, false);
    add(geometry, material, [0, 0, 0]);
  }

  function finish() {
    for (const [material, part] of parts) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(part.positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(part.normals, 3));
      geometry.setIndex(part.indices);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = material.name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }

  return { add, between, box, tube, finish };
}

function partGroup(THREE, root, name) {
  const group = new THREE.Group();
  group.name = name;
  root.add(group);
  return group;
}

function buildFanHousing(THREE, batch, material, x, y, z, alternate, housingLength = 2.56) {
  const { add, between, box } = batch;
  const housingWidth = 1.66;
  const halfLength = housingLength / 2;
  const halfWidth = housingWidth / 2;
  const fanX = alternate * 0.39;
  const grilleX = x - alternate * Math.min(0.58, halfLength - 0.49);
  const fanOffsets = [-0.39, 0.39];
  const casingOutline = new THREE.Shape([
    new THREE.Vector2(-halfLength + 0.10, halfWidth),
    new THREE.Vector2(halfLength - 0.10, halfWidth),
    new THREE.Vector2(halfLength, halfWidth - 0.10),
    new THREE.Vector2(halfLength, -halfWidth + 0.10),
    new THREE.Vector2(halfLength - 0.10, -halfWidth),
    new THREE.Vector2(-halfLength + 0.10, -halfWidth),
    new THREE.Vector2(-halfLength, -halfWidth + 0.10),
    new THREE.Vector2(-halfLength, halfWidth - 0.10),
  ]);
  const topRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  for (const offset of fanOffsets) {
    const opening = new THREE.Path();
    opening.absarc(fanX, -offset, 0.321, 0, Math.PI * 2, true);
    casingOutline.holes.push(opening);
  }

  box(material.hardware, x, y + 0.023, z, housingLength + 0.12, 0.055, housingWidth + 0.10);
  box(material.rubber, x, y + 0.061, z, housingLength - 0.08, 0.052, housingWidth - 0.06);
  add(new THREE.ShapeGeometry(casingOutline, 16), material.casing, [x, y + 0.156, z], [1, 1, 1], topRotation);

  for (const side of [-1, 1]) {
    for (const mount of [0.29 - halfLength, 0, halfLength - 0.29]) {
      box(material.rubber, x + mount, y - 0.023, z + side * 0.73, 0.183, 0.059, 0.174);
    }
    box(material.casing, x, y + 0.114, z + side * (halfWidth - 0.013), housingLength - 0.20, 0.084, 0.026);
    box(material.casing, x + side * (halfLength - 0.013), y + 0.114, z, 0.026, 0.084, housingWidth - 0.20);
    box(material.hardware, grilleX, y + 0.160, z + side * 0.34, 0.77, 0.016, 0.48);
    for (let slot = 0; slot < 13; slot++) {
      box(material.rubber, grilleX - 0.329 + 0.055 * slot, y + 0.171, z + side * 0.34, 0.032, 0.013, 0.402);
    }
    for (let bolt = 0; bolt < 13; bolt++) {
      const boltX = x + (halfLength - 0.16) * (bolt / 6 - 1);
      box(material.aluminum, boltX, y + 0.161, z + side * 0.788, 0.017, 0.009, 0.017);
    }
  }
  box(material.aluminum, x - alternate * 0.11, y + 0.164, z, 0.021, 0.012, 1.55);

  for (const offset of fanOffsets) {
    const fanCenter = [x + fanX, y + 0.153, z + offset];
    const grilleRing = new THREE.RingGeometry(0.297, 0.335, 32);
    const bladeLength = 0.285;
    add(grilleRing, material.aluminum, fanCenter, [1, 1, 1], topRotation);
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * 2 * i / 7;
      const bladeRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.11, angle, 0, 'YXZ'));
      const bladeCenter = [fanCenter[0] + Math.cos(angle) * bladeLength * 0.53, y + 0.119, fanCenter[2] - Math.sin(angle) * bladeLength * 0.53];
      add(new THREE.BoxGeometry(1, 1, 1), material.hardware, bladeCenter, [bladeLength, 0.024, 0.095], bladeRotation);
    }
    for (let radii = 0.095; radii < 0.3; radii += 0.046) {
      const ring = new THREE.RingGeometry(radii, radii + 0.005, 32);
      add(ring, material.mesh, [fanCenter[0], y + 0.156, fanCenter[2]], [1, 1, 1], topRotation);
    }
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * 2 * i / 6;
      between(material.mesh, [fanCenter[0], y + 0.157, fanCenter[2]],
        [fanCenter[0] + 0.313 * Math.cos(angle), y + 0.157, fanCenter[2] + 0.313 * Math.sin(angle)], 0.006, 0.006, 5);
    }
    between(material.casing, [fanCenter[0], y + 0.129, fanCenter[2]], [fanCenter[0], y + 0.172, fanCenter[2]], 0.066, 0.063, 18);
  }
}

function buildRoofAccess(THREE, root, material) {
  const group = partGroup(THREE, root, 'Roof access panels and safety walk');
  const batch = meshBatch(THREE, group);
  const { box } = batch;
  const y = roofHeight + 0.002;
  for (const side of [-1, 1]) {
    const x = side * 3.54;
    const z = side * 0.26;
    box(material.mesh, x, y, z, 4.953, 0.019, 0.49);
    box(material.hardware, x, y + 0.008, z, 4.743, 0.009, 0.36);
    for (const end of [-1, 1]) {
      const capX = x + end * 2.36;
      box(material.yellow, capX, y + 0.013, z, 0.145, 0.006, 0.39);
      for (let i = 0; i < 7; i += 2) {
        box(material.rubber, capX, y + 0.016, z - 0.165 + 0.055 * i, 0.106, 0.004, 0.024);
      }
    }
    for (const edge of [-1, 1]) {
      for (let i = 0; i < 11; i++) {
        box(material.aluminum, x - 2.2 + 0.44 * i, y + 0.011, z + edge * 0.222, 0.018, 0.005, 0.017);
      }
    }
  }
  batch.finish();
}

function insulator(THREE, batch, material, x, y, z, height, radius, ribs) {
  const positions = [new THREE.Vector2(radius * 0.58, 0)];
  const step = height / ribs;
  for (let i = 0; i < ribs; i++) {
    positions.push(
      new THREE.Vector2(radius * 0.63, i * step + step * 0.16),
      new THREE.Vector2(radius, i * step + step * 0.43),
      new THREE.Vector2(radius * 0.93, i * step + step * 0.55),
      new THREE.Vector2(radius * 0.58, i * step + step * 0.72),
    );
  }
  positions.push(new THREE.Vector2(radius * 0.58, height));
  batch.add(new THREE.LatheGeometry(positions, 16), material.ceramic, [x, y, z]);
  batch.between(material.hardware, [x, y - 0.016, z], [x, y + 0.014, z], radius * 0.66, radius * 0.66, 12);
  batch.between(material.aluminum, [x, y + height - 0.014, z], [x, y + height + 0.013, z], radius * 0.61, radius * 0.71, 12);
}

function buildPantograph(THREE, root, material, center, sign, deck, raised, contactHeight) {
  const group = partGroup(THREE, root, `Single-arm pantograph | ${raised ? 'raised' : 'stowed'}`);
  group.position.x = center;
  group.rotation.y = sign === 1 ? 0 : Math.PI;
  const batch = meshBatch(THREE, group);
  const { between, box, tube } = batch;
  const mount = deck + 0.14;
  const contactY = raised ? contactHeight : foldedHeight;
  const innerX = -0.68;
  const elbow = raised ? [1.01, (mount + contactY) / 2 - 0.085, 0] : [1.08, mount + 0.107, 0];
  const tip = raised ? [-0.88, contactY - 0.16, 0] : [-0.65, contactY - 0.092, 0];
  const hornDrop = raised ? 0.29 : 0.15;

  for (const z of [-0.47, 0.47]) {
    box(material.hardware, -0.06, deck + 0.018, z, 2.11, 0.044, 0.151);
    box(material.aluminum, -0.06, mount + 0.013, z, 1.90, 0.046, 0.112);
    for (const x of [-0.85, 0.72]) insulator(THREE, batch, material, x, deck + 0.041, z, 0.091, 0.147, 5);
  }
  box(material.aluminum, -0.83, mount + 0.022, 0, 0.15, 0.07, 1.04);
  box(material.aluminum, 0.69, mount + 0.022, 0, 0.15, 0.07, 1.04);
  between(material.hardware, [innerX, mount + 0.061, -0.48], [innerX, mount + 0.061, 0.48], 0.064, 0.064, 15);
  between(material.aluminum, [innerX, mount + 0.061, -0.25], [innerX, mount + 0.061, 0.25], 0.083, 0.083, 15);
  between(material.aluminum, [innerX, mount + 0.061, 0], elbow, 0.068, 0.039, 15);
  between(material.aluminum, [elbow[0], elbow[1], -0.16], [elbow[0], elbow[1], 0.16], 0.049, 0.049, 14);

  for (const side of [-1, 1]) {
    const knee = [elbow[0], elbow[1], side * 0.12];
    const topJoint = [tip[0], tip[1], side * 0.24];
    between(material.aluminum, knee, topJoint, 0.027, 0.019, 10);
    between(material.hardware, [innerX + 0.196, mount + 0.045, side * 0.43],
      [elbow[0] + 0.047, elbow[1] + 0.003, side * 0.18], 0.014);
    between(material.hardware, [elbow[0] + 0.066, elbow[1], side * 0.166],
      [tip[0] + 0.12, tip[1] + 0.047, side * 0.19], 0.012);
    between(material.hardware, [tip[0] - 0.24, tip[1], side * 0.24],
      [tip[0] + 0.25, tip[1], side * 0.24], 0.021);

    // Braided shunt across the pivot allows the aluminum hinge to articulate.
    tube(material.warm, [[elbow[0] - 0.09, elbow[1], side * 0.13],
      [elbow[0] + 0.075, elbow[1] + 0.064, side * 0.15],
      [elbow[0] + 0.09, elbow[1] + 0.018, side * 0.18],
      [elbow[0] - 0.03, elbow[1] - 0.024, side * 0.166]], 0.009, 6);
  }

  for (const x of [-0.23, 0.23]) {
    const topX = tip[0] + x;
    between(material.aluminum, [topX, tip[1], -0.53], [topX, tip[1], 0.53], 0.021);
    for (const side of [-1, 1]) {
      tube(material.aluminum, [[topX, contactY - 0.035, side * 0.51],
        [topX, contactY - 0.058, side * 0.65],
        [topX, contactY - hornDrop * 0.57, side * 0.78],
        [topX, contactY - hornDrop, side * 0.976]], 0.016);
      between(material.aluminum, [topX, tip[1], side * 0.37],
        [topX, contactY - 0.04, side * 0.43], 0.018);
    }
    box(material.hardware, topX, contactY - 0.034, 0, 0.060, 0.025, 1.058);
    box(material.rubber, topX, contactY - 0.011, 0, 0.050, 0.022, 1.030);
  }
  between(material.aluminum, [tip[0] - 0.23, tip[1], 0], [tip[0] + 0.23, tip[1], 0], 0.022);

  // Air bellows and short lifting linkage at the base pivot.
  for (let i = 0; i < 5; i++) {
    const left = [-0.39 + 0.052 * i, mount + 0.064, 0.16];
    const right = [left[0] + 0.053, left[1], left[2]];
    between(material.rubber, left, right, 0.057, 0.051, 15);
  }
  between(material.aluminum, [-0.79, mount + 0.060, 0.16], [-0.13, mount + 0.064, 0.16], 0.023, 0.021);
  box(material.hardware, 0.57, mount + 0.029, -0.23, 0.29, 0.071, 0.085);
  tube(material.rubber, [[-0.29, deck + 0.067, 0.47], [-0.41, deck + 0.057, 0.71],
    [-0.74, deck + 0.082, 0.78], [-1.09, deck + 0.108, 0.75]], 0.022);
  batch.finish();
}

function buildElectricalBay(THREE, root, material, center, sign, deck, halfLength) {
  const group = partGroup(THREE, root, 'Vacuum circuit breaker, high-voltage jumpers and PanVue housings');
  group.position.x = center;
  group.rotation.y = sign === 1 ? 0 : Math.PI;
  const batch = meshBatch(THREE, group);
  const { between, box, tube } = batch;
  box(material.aluminum, 0.02, deck + 0.010, 0, 3.58, 0.035, 2.02);
  box(material.hardware, 1.42, deck + 0.064, -0.44, 0.47, 0.112, 0.39);
  insulator(THREE, batch, material, 1.41, deck + 0.123, -0.44, 0.215, 0.117, 8);
  insulator(THREE, batch, material, 1.54, deck + 0.037, 0.24, 0.247, 0.111, 9);
  tube(material.hardware, [[0.67, deck + 0.175, -0.47], [1.03, deck + 0.295, -0.47],
    [1.21, deck + 0.382, -0.46], [1.41, deck + 0.350, -0.44]], 0.024);
  tube(material.rubber, [[1.54, deck + 0.299, 0.24], [1.69, deck + 0.30, 0.33],
    [1.80, deck + 0.19, 0.46], [halfLength - Math.abs(center) - 0.11, deck + 0.12, 0.47]], 0.031);
  for (const side of [-1, 1]) {
    box(material.hardware, -0.71, deck + 0.085, side * 0.81, 0.45, 0.133, 0.308);
    box(material.casing, -0.71, deck + 0.154, side * 0.81, 0.49, 0.021, 0.331);
    box(material.aluminum, -0.47, deck + 0.108, side * 0.81, 0.026, 0.106, 0.311);
    between(material.rubber, [-0.455, deck + 0.114, side * 0.82], [-0.425, deck + 0.114, side * 0.82], 0.042, 0.037, 14);
    between(material.hardware, [-1.39, deck + 0.074, side * 0.88], [1.80, deck + 0.074, side * 0.88], 0.011);
    for (const x of [-1.30, -0.34, 0.64, 1.63]) {
      box(material.aluminum, x, deck + 0.049, side * 0.88, 0.044, 0.060, 0.077);
    }

    const tankGeometry = new THREE.CapsuleGeometry(0.092, 0.37, 5, 18);
    const tankRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    batch.add(tankGeometry, material.aluminum, [0.19, deck + 0.110, side * 0.711], [1, 1, 1], tankRotation);
    for (const bracketX of [0.059, 0.328]) {
      between(material.hardware, [bracketX - 0.014, deck + 0.110, side * 0.711],
        [bracketX + 0.014, deck + 0.110, side * 0.711], 0.096, 0.096, 16);
      box(material.hardware, bracketX, deck + 0.031, side * 0.711, 0.052, 0.043, 0.21);
    }
    tube(material.rubber, [[0.465, deck + 0.107, side * 0.711], [0.56, deck + 0.083, side * 0.705],
      [0.62, deck + 0.061, side * 0.78], [0.67, deck + 0.064, side * 0.885]], 0.011);
  }
  batch.finish();
}

export function buildRoof(THREE, ctx) {
  const root = new THREE.Group();
  root.name = `${ctx.type}-car roof equipment`;
  const material = roofMaterials(THREE);
  const halfLength = ctx.length / 2;
  const pantographSide = { D: 1, F: -1 }[ctx.type];
  const isCab = ctx.type === 'A' || ctx.type === 'B';
  const equipment = partGroup(THREE, root, 'Passenger HVAC, cable trays and antennas');
  const batch = meshBatch(THREE, equipment);
  const { between, box } = batch;
  const deck = ctx.pantographDeckHeight ?? 4.395;

  for (const side of [-1, 1]) {
    const nearNose = isCab && side === 1;
    const nearPantograph = pantographSide === side;
    const x = side * (halfLength - (nearPantograph ? 4.28 : nearNose ? 5.67 : 2.79));
    const mountHeight = nearPantograph ? deck : 4.418;
    buildFanHousing(THREE, batch, material, x, mountHeight, 0, side, nearNose ? 1.92 : 2.56);
    if (nearPantograph || nearNose) continue;
    for (const z of [-0.78, 0.78]) {
      const endX = side * (halfLength - 0.69);
      const y = 4.441;
      between(material.hardware, [x, y, z], [endX, y, z], 0.010, 0.010, 8);
      for (const proportion of [0.13, 0.42, 0.72, 0.93]) {
        box(material.casing, x + (endX - x) * proportion, y - 0.011, z, 0.059, 0.028, 0.063);
      }
    }
  }

  if (isCab) {
    const antennaX = halfLength - 7.71;
    box(material.rubber, antennaX, roofHeight - 0.019, -0.59, 0.31, 0.019, 0.15);
    box(material.casing, antennaX, roofHeight + 0.013, -0.59, 0.209, 0.059, 0.093);
    between(material.casing, [antennaX - 0.44, roofHeight - 0.018, -0.24],
      [antennaX - 0.44, roofHeight + 0.029, -0.24], 0.078, 0.059, 18);
  }
  batch.finish();
  buildRoofAccess(THREE, root, material);

  if (pantographSide) {
    const center = pantographSide * (halfLength - 2.04);
    const raised = ctx.pantographRaised ?? ctx.type === 'F';
    buildElectricalBay(THREE, root, material, center, pantographSide, deck, halfLength);
    buildPantograph(THREE, root, material, center, pantographSide, deck, raised, ctx.contactWireHeight ?? nominalWireHeight);
  }
  return root;
}
