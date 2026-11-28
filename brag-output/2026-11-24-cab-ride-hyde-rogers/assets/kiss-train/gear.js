const models = new WeakMap();

const railGauge = 1.435;
const wheelRadius = 0.46;
const runningWheelCenter = railGauge / 2 + 0.0575;

const colors = {
  frame: [0x272b2c, 0.55, 0.67],
  casting: [0x3a3c3d, 0.55, 0.63],
  dark: [0x1b1d1e, 0.37, 0.69],
  wheel: [0x333534, 0.67, 0.57],
  rim: [0x696661, 0.74, 0.53],
  tread: [0x9a9a94, 0.88, 0.32],
  steel: [0x666a69, 0.72, 0.49],
  brightSteel: [0x959b98, 0.71, 0.42],
  rubber: [0x202325, 0.02, 0.86],
  bellows: [0x26272b, 0.025, 0.86],
  gangway: [0x4a5557, 0.02, 0.76],
  cabinet: [0x3b4043, 0.34, 0.61],
  zinc: [0x7b7259, 0.58, 0.57],
  marker: [0xb39542, 0.33, 0.58],
};

function resources(THREE) {
  if (!models.has(THREE)) {
    const materials = Object.fromEntries(Object.entries(colors).map(([name, [color, metalness, roughness]]) => [name, new THREE.MeshStandardMaterial({
      name: `Running gear / ${name}`,
      color,
      metalness,
      roughness,
    })]));
    models.set(THREE, { materials, bogies: new Map(), connections: new Map() });
  }
  return models.get(THREE);
}

// Batch the small fittings by finish. Powered and trailer trucks share these meshes by reference.
function builder(THREE, name) {
  const batches = new Map();
  const group = new THREE.Group();
  const { materials } = resources(THREE);
  group.name = name;

  function add(geometry, finish, position = [0, 0, 0], orient = null) {
    if (orient) geometry.applyQuaternion(orient);
    geometry.translate(...position);
    if (!batches.has(finish)) batches.set(finish, { positions: [], normals: [], indices: [] });
    const batch = batches.get(finish);
    const vertices = geometry.getAttribute('position').array;
    const normals = geometry.getAttribute('normal').array;
    const offset = batch.positions.length / 3;
    for (let i = 0; i < vertices.length; i += 1) {
      batch.positions.push(vertices[i]);
      batch.normals.push(normals[i]);
    }
    const geometryIndices = geometry.getIndex()?.array;
    if (geometryIndices) {
      for (const index of geometryIndices) batch.indices.push(offset + index);
    } else {
      for (let index = 0; index < vertices.length / 3; index += 1) batch.indices.push(offset + index);
    }
    geometry.dispose();
  }

  function box(finish, dimensions, position) {
    add(new THREE.BoxGeometry(...dimensions), finish, position);
  }

  function shaft(finish, a, b, radius, sides = 12, endRadius = radius) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const axis = end.clone().sub(start);
    const orient = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
    add(new THREE.CylinderGeometry(endRadius, radius, axis.length(), sides), finish, start.lerp(end, 0.5).toArray(), orient);
  }

  function path(finish, points, radius, steps = 18, sides = 7) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    add(new THREE.TubeGeometry(curve, steps, radius, sides, false), finish);
  }

  function plate(finish, points, startZ, width) {
    const outline = new THREE.Shape();
    outline.moveTo(...points[0]);
    for (const point of points.slice(1)) outline.lineTo(...point);
    outline.closePath();
    add(new THREE.ExtrudeGeometry(outline, { depth: width, bevelEnabled: false, steps: 1, curveSegments: 1 }), finish, [0, 0, startZ]);
  }

  function polygonSurface(finish, positions, indices) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    add(geometry, finish);
  }

  function build() {
    for (const [finish, batch] of batches) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(batch.normals, 3));
      geometry.setIndex(batch.indices);
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, materials[finish]);
      mesh.name = `${name} / ${finish}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }

  return { add, box, shaft, path, plate, polygonSurface, build };
}

function wheel(THREE, build, x, side) {
  const orient = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), side * Math.PI / 2);
  const center = [x, wheelRadius, side * runningWheelCenter];
  function turn(finish, outline) {
    build.add(new THREE.LatheGeometry(outline.map(point => new THREE.Vector2(...point)), 40), finish, center, orient);
  }

  turn('wheel', [[0, -0.085], [0.145, -0.085], [0.158, -0.056], [0.213, -0.03], [0.370, -0.035], [0.401, -0.065], [0.443, -0.068]]);
  turn('rim', [[0.443, -0.068], [0.477, -0.085], [0.488, -0.074], [0.489, -0.060], [0.477, -0.048]]);
  turn('tread', [[0.477, -0.048], [0.461, -0.033], [0.459, 0.052], [0.454, 0.083]]);
  turn('rim', [[0.454, 0.083], [0.443, 0.091], [0.389, 0.091], [0.386, 0.065]]);
  turn('wheel', [[0.386, 0.065], [0.345, 0.046], [0.211, 0.041], [0.154, 0.072], [0.144, 0.106], [0, 0.106]]);
  build.shaft('casting', [x, 0.46, side * 0.877], [x, 0.46, side * 0.932], 0.143, 16);
}

function airSpring(build, x, z) {
  build.shaft('frame', [x, 0.577, z], [x, 0.649, z], 0.247, 18);
  build.shaft('rubber', [x, 0.649, z], [x, 0.921, z], 0.207, 20);
  for (const y of [0.651, 0.713, 0.785, 0.856, 0.914]) {
    build.shaft('rubber', [x, y - 0.018, z], [x, y + 0.018, z], 0.238, 20);
  }
  build.shaft('frame', [x, 0.91, z], [x, 0.947, z], 0.255, 20);
  build.box('frame', [0.77, 0.105, 0.56], [x, 0.974, z]);
}

function coilSpring(THREE, build, x, z) {
  class Spring extends THREE.Curve {
    getPoint(t, result = new THREE.Vector3()) {
      const angle = t * Math.PI * 10;
      return result.set(x + Math.cos(angle) * 0.090, 0.617 + t * 0.2, z + Math.sin(angle) * 0.090);
    }
  }
  build.add(new THREE.TubeGeometry(new Spring(), 50, 0.016, 7, false), 'steel');
  for (const y of [0.593, 0.829]) {
    build.shaft('casting', [x, y - 0.012, z], [x, y + 0.012, z], 0.114);
  }
}

function sideFrame(build, axleOffset, side) {
  const f = axleOffset;
  const profile = [
    [-f - 0.36, 0.72], [-f - 0.16, 0.91], [-f + 0.35, 0.91],
    [-f + 0.59, 0.79], [-0.40, 0.52], [0.40, 0.52],
    [f - 0.59, 0.79], [f - 0.35, 0.91], [f + 0.16, 0.91], [f + 0.36, 0.72],
    [f + 0.28, 0.64], [f - 0.21, 0.64], [f - 0.42, 0.51], [0.65, 0.26],
    [0.43, 0.195], [-0.43, 0.195], [-0.65, 0.26], [-f + 0.42, 0.51],
    [-f + 0.21, 0.64], [-f - 0.28, 0.64],
  ];
  build.plate('frame', profile, side > 0 ? 0.81 : -0.995, 0.185);
  const lip = [
    [-f - 0.27, 0.68], [-f + 0.31, 0.68], [-f + 0.48, 0.56], [-0.62, 0.31],
    [-0.40, 0.245], [0.40, 0.245], [0.62, 0.31], [f - 0.48, 0.56],
    [f - 0.31, 0.68], [f + 0.27, 0.68], [f + 0.27, 0.704], [f - 0.31, 0.704],
    [f - 0.49, 0.584], [0.60, 0.337], [0.396, 0.269], [-0.396, 0.269],
    [-0.60, 0.337], [-f + 0.49, 0.584], [-f + 0.31, 0.704], [-f - 0.27, 0.704],
  ];
  build.plate('casting', lip, side > 0 ? 0.993 : -1.014, 0.021);

  for (const sign of [-1, 1]) {
    const x = sign * 0.445;
    build.shaft('casting', [x, 0.442, side * 0.984], [x, 0.442, side * 1.034], 0.120);
    build.shaft('steel', [x, 0.442, side * 1.035], [x, 0.442, side * 1.066], 0.070);
    build.shaft('zinc', [x, 0.442, side * 1.063], [x, 0.442, side * 1.080], 0.049, 10);
  }

  build.shaft('dark', [-0.18, 0.58, side * 1.01], [0.11, 0.58, side * 1.01], 0.038);
  build.shaft('steel', [0.09, 0.58, side * 1.01], [0.27, 0.58, side * 1.01], 0.022);
  build.shaft('frame', [-0.16, 0.42, side * 0.99], [-0.19, 0.81, side * 0.99], 0.031);
  build.shaft('brightSteel', [-0.19, 0.79, side * 0.99], [-0.20, 0.93, side * 0.99], 0.015);
  build.shaft('frame', [0.15, 0.43, side * 1.024], [0.15, 0.83, side * 1.024], 0.039);
  build.shaft('brightSteel', [0.15, 0.81, side * 1.024], [0.15, 0.91, side * 1.024], 0.019);
  build.box('zinc', [0.09, 0.065, 0.018], [0.15, 0.44, side * 1.054]);
  build.box('marker', [0.10, 0.023, 0.006], [0.19, 0.983, side * 1.132]);
  airSpring(build, 0, side * 0.85);
}

function axleBearing(THREE, build, x, side, sensor) {
  const s = side;
  const centerY = 0.464;
  const points = [
    [-0.13, -0.14], [0.12, -0.14], [0.17, -0.09], [0.174, 0.08],
    [0.112, 0.139], [-0.112, 0.139], [-0.166, 0.08], [-0.17, -0.08],
  ].map(([dx, dy]) => [x + dx, centerY + dy]);
  build.plate('frame', points, side > 0 ? 0.927 : -1.086, 0.159);
  build.shaft('dark', [x, centerY, s * 1.086], [x, centerY, s * 1.116], 0.128, 18);
  for (const dx of [-0.102, 0.102]) {
    for (const dy of [-0.104, 0.104]) {
      build.shaft('steel', [x + dx, centerY + dy, s * 1.086], [x + dx, centerY + dy, s * 1.111], 0.022, 6);
    }
  }
  if (sensor) {
    build.shaft('steel', [x, centerY, s * 1.112], [x, centerY, s * 1.142], 0.081, 16);
    build.shaft('marker', [x - 0.021, centerY + 0.015, s * 1.142], [x - 0.021, centerY + 0.015, s * 1.16], 0.057, 14);
    build.shaft('zinc', [x + 0.018, centerY + 0.025, s * 1.156], [x + 0.018, centerY + 0.025, s * 1.174], 0.028, 10);
    build.path('rubber', [
      [x + 0.015, centerY + 0.05, s * 1.17], [x - 0.26, 0.56, s * 1.109],
      [x - 0.30, 0.76, s * 1.073], [x - 0.22, 0.822, s * 1.027],
    ], 0.012, 14);
  }
  coilSpring(THREE, build, x, s * 0.935);
}

function brakeAndDrive(build, x, powered) {
  for (const s of [-1, 1]) {
    const z = s * (powered ? 0.43 : 0.48);
    build.shaft('wheel', [x, 0.46, z - 0.049], [x, 0.46, z + 0.049], 0.267, 28);
    build.shaft('rim', [x, 0.46, z + s * 0.043], [x, 0.46, z + s * 0.057], 0.277, 28);
    build.shaft('steel', [x, 0.46, z + s * 0.053], [x, 0.46, z + s * 0.070], 0.130, 16);
    const inside = Math.sign(x);
    build.box('casting', [0.165, 0.215, 0.17], [x - inside * 0.228, 0.61, z]);
    const bracket = x - inside * 0.40;
    build.shaft('dark', [bracket, 0.63, z - 0.056], [bracket, 0.63, z + 0.056], 0.072, 10);
    build.shaft('steel', [x - inside * 0.215, 0.682, z], [bracket, 0.684, z], 0.033, 8);
    build.path('rubber', [[bracket, 0.69, z], [bracket, 0.77, z], [x - inside * 0.63, 0.80, z * 1.3], [0, 0.74, z]], 0.012, 14);
  }

  if (powered) {
    const motorX = x - Math.sign(x) * 0.32;
    const motorSide = Math.sign(x);
    build.shaft('casting', [motorX, 0.46, -0.21 + motorSide * 0.07], [motorX, 0.46, 0.21 + motorSide * 0.07], 0.245, 18);
    build.shaft('frame', [x, 0.46, motorSide * 0.23], [x, 0.46, motorSide * 0.37], 0.247, 16);
    build.shaft('casting', [motorX, 0.46, motorSide * 0.18], [motorX, 0.46, motorSide * 0.29], 0.198, 16);
    for (const offset of [-0.13, -0.09, -0.05, 0, 0.05, 0.09, 0.13]) {
      const y = 0.46 + Math.sqrt(0.235 ** 2 - offset ** 2);
      build.box('frame', [0.019, 0.034, 0.33], [motorX + offset, y, motorSide * 0.07]);
    }
    build.box('frame', [0.19, 0.125, 0.165], [motorX, 0.747, -motorSide * 0.09]);
    build.path('rubber', [[motorX, 0.78, -motorSide * 0.112], [motorX, 0.84, -motorSide * 0.23], [0.19 * motorSide, 0.86, -motorSide * 0.48], [0.11 * motorSide, 0.73, -motorSide * 0.48]], 0.035, 14, 8);
  }
}

function bogie(THREE, powered) {
  const { bogies } = resources(THREE);
  if (bogies.has(powered)) return bogies.get(powered).clone();
  const build = builder(THREE, powered ? 'Powered two-axle bogie' : 'Trailer two-axle bogie');
  const halfBase = 1.35;
  build.box('frame', [0.63, 0.23, 1.78], [0, 0.435, 0]);
  build.box('casting', [0.97, 0.14, 0.28], [0, 0.55, 0]);
  build.shaft('dark', [0, 0.49, 0], [0, 0.98, 0], 0.238, 22);
  build.shaft('casting', [0, 0.94, 0], [0, 1.052, 0], 0.355, 22);
  build.box('frame', [0.71, 0.095, 1.71], [0, 1.04, 0]);
  for (const side of [-1, 1]) sideFrame(build, halfBase, side);

  for (const sign of [-1, 1]) {
    const x = sign * halfBase;
    build.shaft('steel', [x, wheelRadius, -0.944], [x, wheelRadius, 0.944], 0.086, 20);
    build.box('frame', [0.145, 0.144, 1.69], [sign * (halfBase + 0.19), 0.76, 0]);
    brakeAndDrive(build, x, powered);
    for (const side of [-1, 1]) {
      wheel(THREE, build, x, side);
      axleBearing(THREE, build, x, side, sign === side);
      const xFrom = sign * (halfBase - 0.21);
      build.shaft('casting', [xFrom, 0.495, side * 1.008], [sign * 0.62, 0.449, side * 1.018], 0.045);
      build.shaft('steel', [xFrom, 0.515, side * 1.024], [sign * 0.66, 0.462, side * 1.027], 0.018);
      build.path('rubber', [
        [x + sign * 0.13, 0.462, side * 1.109], [x + sign * 0.30, 0.57, side * 1.076],
        [x + sign * 0.28, 0.769, side * 1.024], [x - sign * 0.34, 0.785, side * 0.94],
        [sign * 0.43, 0.58, side * 0.95],
      ], 0.013, 19);
      const z = side * 1.041;
      build.shaft('steel', [sign * (halfBase - 0.15), 0.754, z], [sign * 0.37, 0.535, z], 0.012, 7);
      build.box('zinc', [0.105, 0.048, 0.047], [sign * (halfBase - 0.26), 0.591, z]);
      build.shaft('steel', [sign * (halfBase - 0.27), 0.618, z], [sign * (halfBase - 0.27), 0.64, z], 0.018, 6);
    }
  }
  const template = build.build();
  bogies.set(powered, template);
  return template.clone();
}

function cabinet(build, x, y, z, length, height, width, vents) {
  const side = Math.sign(z);
  build.box('dark', [length, height, width], [x, y, z]);
  build.box('cabinet', [length + 0.045, 0.048, width + 0.045], [x, y + height * 0.47, z]);
  const faceZ = z + side * (width / 2);
  build.box('cabinet', [length - 0.045, height - 0.038, 0.026], [x, y, faceZ]);
  for (const direction of [-1, 1]) {
    const handleX = x + direction * length * 0.42;
    build.box('steel', [0.049, 0.022, 0.019], [handleX, y + 0.025, faceZ + side * 0.02]);
    build.box('frame', [0.042, 0.04, 0.055], [handleX, y - height / 2, faceZ]);
  }
  if (vents) {
    for (let i = -3; i <= 3; i += 1) {
      build.box('dark', [0.015, height * 0.43, 0.007], [x + i * 0.039, y + 0.014, faceZ + side * 0.016]);
    }
  }
}

function underframe(THREE, { length, cab }, centers, power) {
  const build = builder(THREE, 'Underframe and auxiliary equipment');
  const [front, rear] = centers;
  const deckLength = front - rear - 2.8;
  const midpoint = (front + rear) / 2;

  for (const side of [-1, 1]) {
    build.box('frame', [deckLength, 0.13, 0.122], [midpoint, 0.409, side * 0.89]);
    build.box('casting', [deckLength - 0.22, 0.032, 0.153], [midpoint, 0.35, side * 0.89]);
    build.box('frame', [deckLength + 0.7, 0.095, 0.093], [midpoint, 0.392, side * 0.45]);
    for (const fraction of [-0.42, -0.25, -0.075, 0.075, 0.25, 0.42]) {
      const x = midpoint + deckLength * fraction;
      build.box('frame', [0.115, 0.09, 2.02], [x, 0.393, 0]);
      build.box('casting', [0.16, 0.044, 0.28], [x, 0.385, side * 0.841]);
    }
    const compressorX = rear + 4.27;
    build.shaft('casting', [compressorX - 0.36, 0.327, side * 0.55], [compressorX + 0.36, 0.327, side * 0.55], 0.106, 16);
    build.shaft('steel', [compressorX - 0.40, 0.327, side * 0.55], [compressorX - 0.34, 0.327, side * 0.55], 0.087, 12);
    for (const dx of [-0.25, 0.25]) {
      build.shaft('frame', [compressorX + dx - 0.026, 0.327, side * 0.55], [compressorX + dx + 0.026, 0.327, side * 0.55], 0.114, 16);
      build.box('casting', [0.061, 0.081, 0.181], [compressorX + dx, 0.422, side * 0.55]);
    }
    build.path('rubber', [[rear + 1.45, 0.45, side * 0.45], [rear + 3.3, 0.332, side * 0.34], [midpoint, 0.339, side * 0.41], [front - 3.3, 0.335, side * 0.41], [front - 1.47, 0.48, side * 0.42]], 0.017, 40);
    const lead = side * 0.015;
    build.shaft('dark', [rear + 2.1, 0.337, side * 0.70 + lead], [front - 2.15, 0.337, side * 0.70 + lead], 0.024, 8);
    cabinet(build, side < 0 ? front - 4.53 : rear + 5.44, 0.365, side * 0.768, 1.33, 0.227, 0.53, true);
  }
  const endBounds = [length / 2 - (cab ? 0.37 : 0.05), -length / 2 + 0.05];
  centers.forEach((x, i) => {
    const end = endBounds[i];
    const endFrameLength = Math.abs(end - x);
    build.box('frame', [endFrameLength, 0.122, 1.79], [(end + x) / 2, 0.837, 0]);
    build.box('casting', [0.46, 0.13, 2.05], [x, 0.994, 0]);
    build.box('frame', [0.71, 0.094, 1.66], [x, 1.075, 0]);
    if (power[i]) {
      const inward = i === 0 ? -1 : 1;
      cabinet(build, x + inward * 2.07, 0.643, 0.643, 0.94, 0.32, 0.60, true);
      cabinet(build, x + inward * 2.07, 0.643, -0.643, 1.13, 0.32, 0.60, false);
    }
    if (i === 1 || !cab) {
      const inset = i === 0 ? -0.15 : 0.15;
      build.box('frame', [0.19, 0.28, 0.70], [end + inset, 0.656, 0]);
      build.box('steel', [0.025, 0.15, 0.46], [end + inset / 2.1, 0.671, 0]);
    }
  });
  return build.build();
}

export function buildGear(THREE, ctx) {
  const centers = ctx.bogieCenters ?? (ctx.cab ? [8.1975, -10.4875] : [9.295, -9.295]);
  const powered = ['C', 'G', 'E'].includes(ctx.type);
  const power = [powered, powered || Boolean(ctx.cab)];
  const group = new THREE.Group();
  group.name = 'Running gear and underframe';
  group.add(underframe(THREE, ctx, centers, power));
  centers.forEach((x, i) => {
    const truck = bogie(THREE, power[i]);
    truck.position.x = x;
    group.add(truck);
  });
  return group;
}

function roundSection(halfWidth, minY, maxY, radius, topInset = 0) {
  const arcCorners = [
    [halfWidth - radius - topInset, maxY - radius, 0],
    [-halfWidth + radius + topInset, maxY - radius, Math.PI / 2],
    [-halfWidth + radius, minY + radius, Math.PI],
    [halfWidth - radius, minY + radius, 3 * Math.PI / 2],
  ];
  const points = [];
  for (const [z, y, start] of arcCorners) {
    for (let i = 0; i <= 5; i += 1) {
      const angle = start + i * Math.PI / 10;
      points.push([y + radius * Math.sin(angle), z + radius * Math.cos(angle)]);
    }
  }
  return points;
}

function corrugation(build, finish, section, rings, invert = false) {
  const middleY = (Math.max(...section.map(p => p[0])) + Math.min(...section.map(p => p[0]))) / 2;
  const positions = [];
  for (const [x, inset] of rings) {
    for (const [y, z] of section) {
      positions.push(x, middleY + (y - middleY) * (1 - inset * 0.54), z * (1 - inset));
    }
  }
  const indices = [];
  const size = section.length;
  for (let i = 0; i < rings.length - 1; i += 1) {
    for (let j = 0; j < size; j += 1) {
      const a = i * size + j;
      const b = (i + 1) * size + j;
      const c = (i + 1) * size + (j + 1) % size;
      const d = i * size + (j + 1) % size;
      if (invert) indices.push(a, c, b, a, d, c);
      else indices.push(a, b, c, a, c, d);
    }
  }
  build.polygonSurface(finish, positions, indices);
}

export function buildConnection(THREE, { gap = 0.87 } = {}) {
  const { connections } = resources(THREE);
  if (connections.has(gap)) return connections.get(gap).clone();
  const build = builder(THREE, 'Intercar gangway and drawgear');
  const limit = gap / 2;
  const flange = Math.min(0.055, gap * 0.09);
  const active = gap - 2 * flange;
  const pleats = 10;
  const envelope = roundSection(1.226, 0.644, 3.585, 0.146, 0.04);
  const interior = roundSection(0.709, 1.245, 3.532, 0.163, 0.020);
  const outsideRings = [];
  const insideRings = [];
  for (let i = 0; i < pleats; i += 1) {
    const origin = -limit + flange + i * active / pleats;
    const pitch = active / pleats;
    outsideRings.push([origin, 0.071], [origin + pitch * 0.39, 0.004], [origin + pitch * 0.64, 0.004]);
    insideRings.push([origin, -0.043], [origin + pitch * 0.36, 0], [origin + pitch * 0.63, 0.003]);
  }
  outsideRings.push([limit - flange, 0.071]);
  insideRings.push([limit - flange, -0.043]);
  corrugation(build, 'bellows', envelope, outsideRings);
  corrugation(build, 'gangway', interior, insideRings, true);
  corrugation(build, 'frame', envelope, [[-limit - 0.019, 0.00], [-limit + 0.017, 0.00], [-limit + flange, 0.071]]);
  corrugation(build, 'frame', envelope, [[limit - flange, 0.071], [limit - 0.017, 0.00], [limit + 0.019, 0.00]]);
  corrugation(build, 'cabinet', interior, [[-limit - 0.021, 0.045], [-limit + 0.020, 0.045], [-limit + flange, -0.043]], true);
  corrugation(build, 'cabinet', interior, [[limit - flange, -0.043], [limit - 0.020, 0.045], [limit + 0.021, 0.045]], true);
  build.box('cabinet', [gap + 0.071, 0.055, 1.40], [0, 1.248, 0]);
  build.box('dark', [gap * 0.88, 0.014, 1.30], [0, 1.280, 0]);
  for (const sign of [-1, 1]) {
    build.box('steel', [0.028, 0.012, 1.32], [sign * gap / 2, 1.277, 0]);
    build.box('frame', [0.095, 0.25, 0.56], [sign * (limit + 0.03), 0.626, 0]);
    build.shaft('dark', [sign * (limit + 0.08), 0.643, 0], [sign * gap * 0.22, 0.643, 0], 0.121, 14);
    build.shaft('steel', [sign * gap * 0.25, 0.643, 0], [0, 0.643, 0], 0.079, 14);
    build.box('frame', [gap * 0.32, 0.15, 0.26], [sign * gap * 0.10, 0.643, sign * 0.015]);
    build.shaft('steel', [sign * 0.06, 0.532, 0], [sign * 0.06, 0.744, 0], 0.043, 12);
  }
  for (const side of [-1, 1]) {
    for (const sign of [-1, 1]) {
      const sideX = sign * (limit - 0.052);
      build.box('cabinet', [0.108, 2.865, 0.091], [sideX, 2.881, side * 1.224]);
      build.box('steel', [0.041, 2.83, 0.025], [sideX - sign * 0.042, 2.879, side * 1.273]);
      build.box('frame', [0.108, 0.087, 0.10], [sideX, 4.29, side * 1.214]);
      build.box('frame', [0.105, 0.073, 0.103], [sideX, 1.461, side * 1.214]);
    }
    build.box('steel', [gap - 0.14, 0.035, 0.060], [0, 4.288, side * 1.216]);
    build.shaft('dark', [-limit + 0.078, 4.238, side * 1.216], [limit - 0.078, 4.238, side * 1.216], 0.016, 9);
    for (const offset of [0, -0.085, -0.160]) {
      const z = side * (1.227 + Math.abs(offset) * 0.14);
      build.path('dark', [[-limit + 0.062, 1.892 + offset, z], [-limit * 0.53, 1.616 + offset, z], [0, 1.508 + offset, z], [limit * 0.55, 1.607 + offset, z], [limit - 0.062, 1.891 + offset, z]], 0.016, 24, 7);
    }
    for (const height of [0.59, 0.694]) {
      const z = side * (height === 0.59 ? 0.33 : 0.55);
      build.path('rubber', [[-limit - 0.049, height, z], [-limit * 0.58, height - 0.04, z + side * 0.10], [0, height - 0.19, z + side * 0.041], [limit * 0.64, height - 0.11, z - side * 0.034], [limit + 0.052, height, z]], 0.029, 20, 8);
      for (const sign of [-1, 1]) {
        build.shaft('steel', [sign * (limit + 0.009), height, z], [sign * (limit + 0.075), height, z], 0.044, 10);
      }
    }
  }
  const connection = build.build();
  connections.set(gap, connection);
  return connection.clone();
}
