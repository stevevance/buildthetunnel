/* Stadler KISS side elevations, measured from set 321/322 and Caltrain drawings. Repainted for the cab-ride film's
   CrossTowner (see index.js): its white and teal, a deeper teal band low on the side in place of Caltrain's red
   stripe and red top, and no Caltrain marks. */
export const paint = { teal: 0x0b7285, white: 0xdce2e4, grey: 0x4b4d50 };
export const bodySection = [
  [0.46, 1.27], [0.57, 1.41], [0.75, 1.485], [0.95, 1.50],
  [3.44, 1.50], [3.83, 1.48], [4.13, 1.425], [4.37, 1.34],
  [4.50, 1.19], [4.575, 0.92], [4.62, 0.55], [4.63, 0],
];

const top = 4.63;
const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function halfWidth(y) {
  for (let i = 1; i < bodySection.length; i++) {
    const [upperY, upperZ] = bodySection[i];
    if (y <= upperY) {
      const [lowerY, lowerZ] = bodySection[i - 1];
      return mix(lowerZ, upperZ, clamp((y - lowerY) / (upperY - lowerY), 0, 1));
    }
  }
  return 0;
}

function bodyProfile(ctx) {
  const { length, cab, type } = ctx;
  const minX = -length / 2;
  const maxX = length / 2 - (cab ? 4.2 : 0);
  const trucks = ctx.bogieCenters ?? (cab ? [8.2, -10.5] : [9.3, -9.3]);

  function bottomLift(x) {
    const rear = 1 - smooth(trucks[1] + 2.02, trucks[1] + 2.58, x);
    const front = smooth(trucks[0] - 2.58, trucks[0] - 2.02, x);
    return 0.36 * Math.max(rear, front);
  }

  function roofDepth(x, z) {
    const rear = 1 - smooth(3.6, 4.44, x - minX);
    const front = cab
      ? smooth(4.2, 4.82, length / 2 - x) * (1 - smooth(6.5, 7.15, length / 2 - x))
      : 1 - smooth(3.6, 4.44, maxX - x);
    const roofBay = 0.21 * Math.max(rear, front);
    const pantographBay = type === 'D' ? maxX - x : type === 'F' ? x - minX : Infinity;
    const pocket = 0.23 * (1 - smooth(5.35, 5.90, pantographBay)) * (1 - smooth(0.93, 1.12, Math.abs(z)));
    return Math.max(roofBay, pocket);
  }

  function point(x, y, side, lift = 0) {
    const endRound = 0.14 * (1 - smooth(0, 0.23, x - minX));
    const frontRound = cab ? 0 : 0.14 * (1 - smooth(0, 0.23, maxX - x));
    const z = (halfWidth(y) * (1 - (endRound + frontRound) / 1.5) + lift) * side;
    const lower = bottomLift(x) * (1 - smooth(0.46, 1.36, y));
    const upper = roofDepth(x, z) * clamp((y - 4.02) / (top - 4.02), 0, 1);
    return [x, y + lower - upper, z];
  }

  // the grey skirt (ending short of a cab car's leading bogie), and the teal band above it, which on a cab car climbs
  // over its last 2.6 m to meet the teal sweeping down from under the windscreen (cab.js)
  const grayEnd = { A: 6.62, B: 6.62 }[type] ?? 6.62;
  const skirtTop = x => cab ? mix(1.06, 0.46, smooth(grayEnd - 0.53, grayEnd + 0.48, x)) : 1.06;
  const rise = x => cab ? smooth(maxX - 2.6, maxX, x) : 0;
  const bandLow = x => mix(1.06, 1.40, rise(x));
  const bandHigh = x => mix(1.46, 1.80, rise(x));
  const roofPaintEdge = x => cab ? mix(4.51, 4.63, smooth(maxX - 1.1, maxX, x)) : 4.51;
  return { minX, maxX, point, skirtTop, bandLow, bandHigh, roofPaintEdge };
}

const materialDefinitions = {
  white: [paint.white, 0.39, 0.13], teal: [paint.teal, 0.36, 0.16],
  skirt: [paint.grey, 0.50, 0.17], roof: [0x8d9398, 0.51, 0.36],
  belly: [0x272a2c, 0.78, 0.13], endwall: [0x717578, 0.59, 0.19],
  endSeal: [0x313639, 0.82, 0.04],
  windowMask: [0x0a0f13, 0.43, 0.02], rubber: [0x1a2225, 0.68, 0.04],
  windowBrightEdge: [0x515759, 0.45, 0.21], glass: [0xffffff, 0.25, 0.10],
  smokedGlass: [0xffffff, 0.30, 0.08], doorGasket: [0x2f3335, 0.60, 0.10],
  doorMetal: [0xe5e6e5, 0.41, 0.19], midDoor: [0xe7e7e4, 0.40, 0.16],
  steel: [0x8a9090, 0.46, 0.47], polished: [0xbec3c1, 0.35, 0.37],
  shadowSeam: [0xb3b8b6, 0.61, 0.17], highlightSeam: [0xf3f2ef, 0.58, 0.13],
  caution: [0xdcb759, 0.61, 0.04], emergency: [0xc94036, 0.54, 0.04],
  buttonGreen: [0x318a69, 0.47, 0.11], buttonInactive: [0x252c2d, 0.55, 0.11],
  paper: [0xebece7, 0.63, 0.03], labelInk: [0x6f7372, 0.68, 0.03],
  graphicsWhite: [0xf6f3e9, 0.63, 0.03], access: [0x2b6b99, 0.60, 0.03],
  amber: [0xbe6f42, 0.53, 0.07],
};

const bodyMaterials = new WeakMap();
function materialsFor(THREE) {
  if (!bodyMaterials.has(THREE)) {
    const materials = {};
    for (const [name, [color, roughness, metalness]] of Object.entries(materialDefinitions)) {
      const specular = { windowMask: 0.17, glass: 0.53, smokedGlass: 0.36 }[name];
      const vertexColors = name === 'glass' || name === 'smokedGlass';
      const settings = { name, color, roughness, metalness, vertexColors };
      materials[name] = specular === undefined
        ? new THREE.MeshStandardMaterial(settings)
        : new THREE.MeshPhysicalMaterial({ ...settings, specularIntensity: specular, ior: 1.44 });
    }
    bodyMaterials.set(THREE, materials);
  }
  return bodyMaterials.get(THREE);
}

// Batches keep each material to one GLB primitive per named component group.
function makeBatch(THREE, materials) {
  const geometry = new Map();
  function tri(name, positions, colors, normals) {
    if (!geometry.has(name)) geometry.set(name, { positions: [], colors: [], normals: [] });
    const details = geometry.get(name);
    for (let i = 0; i < 3; i++) {
      details.positions.push(...positions[i]);
      if (colors) details.colors.push(colors[i].r, colors[i].g, colors[i].b);
      if (normals) details.normals.push(...normals[i]);
    }
  }
  function quad(name, a, b, c, d, reverse = false, normals) {
    const first = reverse ? [0, 2, 1] : [0, 1, 2];
    const second = reverse ? [0, 3, 2] : [0, 2, 3];
    const points = [a, b, c, d];
    for (const face of [first, second]) {
      tri(name, face.map(i => points[i]), undefined, normals && face.map(i => normals[i]));
    }
  }
  function finish(groupName, parent) {
    const group = new THREE.Group();
    group.name = groupName;
    for (const [name, data] of geometry) {
      const meshGeometry = new THREE.BufferGeometry();
      meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
      if (data.colors.length) meshGeometry.setAttribute('color', new THREE.Float32BufferAttribute(data.colors, 3));
      if (data.normals.length) meshGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
      else meshGeometry.computeVertexNormals();
      const mesh = new THREE.Mesh(meshGeometry, materials[name]);
      mesh.name = name;
      group.add(mesh);
    }
    parent.add(group);
  }
  return { tri, quad, finish };
}

function makeShell(THREE, ctx, profile, root, materials) {
  const { minX, maxX, point, skirtTop, bandLow, bandHigh, roofPaintEdge } = profile;
  const shell = makeBatch(THREE, materials);
  const count = Math.ceil((maxX - minX) / 0.26);
  const stations = [];
  for (let i = 0; i <= count; i++) stations.push(mix(minX, maxX, i / count));
  stations.push(minX + 0.23);
  if (!ctx.cab) stations.push(maxX - 0.23);
  stations.sort((a, b) => a - b);

  const bands = [
    ['skirt', () => 0.46, skirtTop, 5], ['white', skirtTop, bandLow, 2], ['teal', bandLow, bandHigh, 3],
    ['white', bandHigh, roofPaintEdge, 12],
    ['roof', roofPaintEdge, () => top, 5],
  ];
  const normal = (x, y, side) => {
    const a = point(x - 0.011, y, side);
    const b = point(x + 0.011, y, side);
    const c = point(x, Math.max(0.458, y - 0.014), side);
    const d = point(x, Math.min(top, y + 0.014), side);
    const result = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    result.cross(new THREE.Vector3(d[0] - c[0], d[1] - c[1], d[2] - c[2]));
    if (Math.abs(y - top) < 0.0001) return [0, 1, 0];
    return result.multiplyScalar(side).normalize().toArray();
  };
  for (let i = 0; i < stations.length - 1; i++) {
    const x1 = stations[i], x2 = stations[i + 1];
    for (const side of [-1, 1]) {
      for (const [mat, low, high, slices] of bands) {
        const lo1 = low(x1), lo2 = low(x2), hi1 = high(x1), hi2 = high(x2);
        if (hi1 - lo1 < 1e-5 && hi2 - lo2 < 1e-5) continue;
        const cuts = Array.from({ length: slices + 1 }, (_, j) => j / slices);
        for (const [y] of bodySection) {
          if (y > lo1 && y < hi1) cuts.push((y - lo1) / (hi1 - lo1));
          if (y > lo2 && y < hi2) cuts.push((y - lo2) / (hi2 - lo2));
        }
        cuts.sort((a, b) => a - b);
        for (let j = 0; j < cuts.length - 1; j++) {
          if (cuts[j + 1] - cuts[j] < 0.00001) continue;
          const ya = mix(lo1, hi1, cuts[j]), yb = mix(lo2, hi2, cuts[j]);
          const yc = mix(lo2, hi2, cuts[j + 1]), yd = mix(lo1, hi1, cuts[j + 1]);
          shell.quad(mat, point(x1, ya, side), point(x2, yb, side), point(x2, yc, side), point(x1, yd, side), side < 0,
            [normal(x1, ya, side), normal(x2, yb, side), normal(x2, yc, side), normal(x1, yd, side)]);
        }
      }
    }
    shell.quad('belly', point(x1, 0.46, 1), point(x2, 0.46, 1), point(x2, 0.46, -1), point(x1, 0.46, -1), true,
      [[0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0]]);
  }
  shell.finish('Extruded aluminum shell and painted livery', root);

  const end = makeBatch(THREE, materials);
  for (const [x, sign] of ctx.cab ? [[minX, -1]] : [[minX, -1], [maxX, 1]]) {
    const profileSide = side => bodySection.map(([y]) => point(x, y, side));
    const outline = [...profileSide(1), ...profileSide(-1).reverse().slice(1)];
    const outline2D = outline.map(([, y, z]) => new THREE.Vector2(y, z));
    const opening = [[1.24, -0.68], [1.24, 0.68], [3.41, 0.68], [3.50, 0.59], [3.50, -0.59], [3.41, -0.68]];
    const hole = opening.map(([y, z]) => new THREE.Vector2(y, z));
    const points = [...outline, ...opening.map(([y, z]) => [x, y, z])];
    for (const triangle of THREE.ShapeUtils.triangulateShape(outline2D, [hole])) {
      end.tri('endwall', (sign > 0 ? triangle : [...triangle].reverse()).map(i => points[i]));
    }
  }
  end.finish('Inter-car end bulkheads', root);
}

function roundedRect(x, y, width, height, radius, roundSteps = 4) {
  const r = Math.min(radius, width * 0.49, height * 0.49);
  const points = [];
  const centers = [[x + width / 2 - r, y + height / 2 - r], [x - width / 2 + r, y + height / 2 - r],
    [x - width / 2 + r, y - height / 2 + r], [x + width / 2 - r, y - height / 2 + r]];
  for (let corner = 0; corner < 4; corner++) {
    const [cx, cy] = centers[corner];
    for (let step = 0; step <= roundSteps; step++) {
      const angle = (corner + step / roundSteps) * Math.PI / 2;
      points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
    }
  }
  return points;
}

function surfaceTriangle(batch, mat, surface, side, points, colors) {
  const order = side === 1 ? [0, 1, 2] : [0, 2, 1];
  const chosen = order.map(index => points[index]);
  const normals = mat === 'glass' || mat === 'smokedGlass' || mat === 'windowMask'
    ? chosen.map(([x, y]) => glazingNormal(surface, side, x, y)) : undefined;
  batch.tri(mat, chosen.map(point => surface(...point)), colors && order.map(index => colors[index]), normals);
}

function glazingNormal(surface, side, x, y) {
  const a = surface(x - 0.045, y), b = surface(x + 0.045, y);
  const yStep = y > 3.4 ? 0.155 : 0.024;
  const c = surface(x, y - yStep), d = surface(x, y + yStep);
  const [ux, uy, uz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const [vx, vy, vz] = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
  const normal = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const length = Math.hypot(...normal);
  return normal.map(value => value * side / Math.max(length, 1e-10));
}

function conformingTriangle(batch, mat, surface, side, points, colorAt) {
  const emit = (a, b, c) => {
    const triangle = [a, b, c];
    surfaceTriangle(batch, mat, surface, side, triangle, colorAt?.(triangle));
  };
  const lowY = Math.min(...points.map(point => point[1]));
  const highY = Math.max(...points.map(point => point[1]));
  let upper = points;
  for (const [sectionY] of bodySection) {
    if (sectionY <= lowY || sectionY >= highY) continue;
    const lower = [];
    const remaining = [];
    for (let i = 0; i < upper.length; i++) {
      const a = upper[i], b = upper[(i + 1) % upper.length];
      if (a[1] <= sectionY) lower.push(a);
      if (a[1] >= sectionY) remaining.push(a);
      if ((a[1] < sectionY && b[1] > sectionY) || (a[1] > sectionY && b[1] < sectionY)) {
        const intersection = [mix(a[0], b[0], (sectionY - a[1]) / (b[1] - a[1])), sectionY];
        lower.push(intersection);
        remaining.push(intersection);
      }
    }
    for (let i = 1; i < lower.length - 1; i++) emit(lower[0], lower[i], lower[i + 1]);
    upper = remaining;
  }
  for (let i = 1; i < upper.length - 1; i++) emit(upper[0], upper[i], upper[i + 1]);
}

function panel(batch, mat, surface, side, x, y, w, h, r, colorAt, maxWidth = 1.7) {
  const shape = roundedRect(x, y, w, h, r);
  const center = [x, y];
  const emit = (a, b, c) => conformingTriangle(batch, mat, surface, side, [a, b, c], colorAt);
  for (let i = 0; i < shape.length; i++) {
    const a = shape[i], b = shape[(i + 1) % shape.length];
    const count = Math.max(1, Math.ceil(Math.abs(b[0] - a[0]) / maxWidth));
    for (let j = 0; j < count; j++) {
      const p = [mix(a[0], b[0], j / count), mix(a[1], b[1], j / count)];
      const q = [mix(a[0], b[0], (j + 1) / count), mix(a[1], b[1], (j + 1) / count)];
      emit(center, p, q);
    }
  }
}

function gasket(batch, mat, surface, side, x, y, w, h, r, border) {
  const outer = roundedRect(x, y, w, h, r);
  const inner = roundedRect(x, y, w - border * 2, h - border * 2, Math.max(0.001, r - border));
  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    conformingTriangle(batch, mat, surface, side, [outer[i], outer[j], inner[j]]);
    conformingTriangle(batch, mat, surface, side, [outer[i], inner[j], inner[i]]);
  }
}

function stripe(batch, mat, surface, side, x1, y1, x2, y2, width) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length < 0.000002) return;
  const dx = -(y2 - y1) * width / (2 * length), dy = (x2 - x1) * width / (2 * length);
  batch.quad(mat, surface(x1 - dx, y1 - dy), surface(x2 - dx, y2 - dy),
    surface(x2 + dx, y2 + dy), surface(x1 + dx, y1 + dy), side < 0);
}

function disc(batch, mat, surface, side, x, y, radius) {
  const circle = Array.from({ length: 20 }, (_, i) => [x + radius * Math.cos(i * Math.PI / 10), y + radius * Math.sin(i * Math.PI / 10)]);
  for (let i = 0; i < circle.length; i++) {
    surfaceTriangle(batch, mat, surface, side, [[x, y], circle[i], circle[(i + 1) % circle.length]]);
  }
}

function ring(batch, mat, surface, side, x, y, radius, width) {
  for (let i = 0; i < 20; i++) {
    const a = (i - 0.3) * Math.PI / 10, b = (i + 1.3) * Math.PI / 10;
    stripe(batch, mat, surface, side, x + radius * Math.cos(a), y + radius * Math.sin(a),
      x + radius * Math.cos(b), y + radius * Math.sin(b), width);
  }
}
const numberPaths = [
  [
    [-0.0003, 0.4109, -0.0642, 0.3995, -0.1166, 0.3652, -0.1574, 0.3081, -0.1763, 0.2628, -0.1911, 0.2093, -0.2016, 0.1475, -0.2079, 0.0774, -0.21, -0.001, -0.2079, -0.0791, -0.2016, -0.1491, -0.1911, -0.2107, -0.1763, -0.2642, -0.1574, -0.3094, -0.1166, -0.3666, -0.0642, -0.4008, -0.0003, -0.4123, 0.0639, -0.4008, 0.1165, -0.3666, 0.1574, -0.3094, 0.1763, -0.2642, 0.1911, -0.2107, 0.2016, -0.1491, 0.2079, -0.0791, 0.21, -0.001, 0.2079, 0.0774, 0.2016, 0.1475, 0.1911, 0.2093, 0.1763, 0.2628, 0.1574, 0.3081, 0.1165, 0.3652, 0.0639, 0.3995],
    [-0.0003, 0.5181, 0.0637, 0.5128, 0.1215, 0.4968, 0.1728, 0.4702, 0.2179, 0.433, 0.2565, 0.3851, 0.2836, 0.3375, 0.3058, 0.2831, 0.3231, 0.2221, 0.3354, 0.1544, 0.3428, 0.08, 0.3453, -0.001, 0.3428, -0.0819, 0.3354, -0.1561, 0.3231, -0.2236, 0.3058, -0.2846, 0.2836, -0.3388, 0.2565, -0.3865, 0.2179, -0.4343, 0.1728, -0.4716, 0.1215, -0.4982, 0.0637, -0.5141, -0.0003, -0.5194, -0.0644, -0.5141, -0.1221, -0.4982, -0.1735, -0.4716, -0.2185, -0.4343, -0.2572, -0.3865, -0.2843, -0.3388, -0.3065, -0.2846, -0.3238, -0.2236, -0.3361, -0.1561, -0.3435, -0.0819, -0.3459, -0.001, -0.3435, 0.08, -0.3361, 0.1544, -0.3238, 0.2221, -0.3065, 0.2831, -0.2843, 0.3375, -0.2572, 0.3851, -0.2185, 0.433, -0.1735, 0.4702, -0.1221, 0.4968, -0.0644, 0.5128],
  ],
  [
    [-0.2662, -0.3861, -0.0452, -0.3861, -0.0452, 0.3768, -0.2857, 0.3285, -0.2857, 0.4518, -0.0466, 0.5, 0.0887, 0.5, 0.0887, -0.3861, 0.3098, -0.3861, 0.3098, -0.5, -0.2662, -0.5],
  ],
  [
    [-0.1731, -0.3861, 0.2991, -0.3861, 0.2991, -0.5, -0.3359, -0.5, -0.3359, -0.3861, -0.3029, -0.3521, -0.2653, -0.3136, -0.2233, -0.2708, -0.1769, -0.2237, -0.1259, -0.1721, -0.0656, -0.111, -0.0177, -0.0617, 0.0179, -0.0244, 0.0412, 0.001, 0.0802, 0.0472, 0.1104, 0.0884, 0.1319, 0.1246, 0.1513, 0.1747, 0.1577, 0.224, 0.1438, 0.2964, 0.1018, 0.354, 0.0608, 0.3819, 0.0122, 0.3986, -0.0439, 0.4042, -0.1093, 0.3987, -0.1782, 0.3821, -0.2264, 0.3649, -0.2767, 0.3425, -0.3292, 0.3151, -0.3292, 0.4518, -0.2759, 0.4719, -0.225, 0.4884, -0.1765, 0.5013, -0.1085, 0.5139, -0.0466, 0.5181, 0.0272, 0.5132, 0.0931, 0.4987, 0.1511, 0.4744, 0.2013, 0.4404, 0.2417, 0.3983, 0.2706, 0.3496, 0.2879, 0.2945, 0.2937, 0.2328, 0.2879, 0.1727, 0.2706, 0.1159, 0.251, 0.0768, 0.223, 0.0334, 0.1865, -0.0144, 0.1673, -0.0355, 0.1318, -0.0729, 0.08, -0.1266, 0.0412, -0.1667, -0.0035, -0.2126, -0.0542, -0.2646, -0.1107, -0.3224],
  ],
  [
    [0.1202, 0.0392, 0.1802, 0.0204, 0.2308, -0.0084, 0.2719, -0.0472, 0.3023, -0.0944, 0.3205, -0.1484, 0.3265, -0.2093, 0.3202, -0.2791, 0.3011, -0.3406, 0.2693, -0.3937, 0.2247, -0.4384, 0.1806, -0.4676, 0.1296, -0.4902, 0.0717, -0.5065, 0.007, -0.5162, -0.0646, -0.5194, -0.1285, -0.5163, -0.1942, -0.507, -0.262, -0.4915, -0.3319, -0.4699, -0.3319, -0.3392, -0.2729, -0.3681, -0.2086, -0.3888, -0.1402, -0.4014, -0.0687, -0.4056, 0.0095, -0.4, 0.0741, -0.3832, 0.1253, -0.3553, 0.1623, -0.3168, 0.1845, -0.2681, 0.1919, -0.2093, 0.185, -0.1546, 0.1644, -0.1085, 0.1299, -0.071, 0.0832, -0.0433, 0.0257, -0.0266, -0.0425, -0.0211, -0.1591, -0.0211, -0.1591, 0.0901, -0.0372, 0.0901, 0.0241, 0.0945, 0.0751, 0.1078, 0.1155, 0.1299, 0.1552, 0.1786, 0.1685, 0.2448, 0.1548, 0.3129, 0.1139, 0.363, 0.0722, 0.3859, 0.0201, 0.3996, -0.0425, 0.4042, -0.1001, 0.4012, -0.1618, 0.3922, -0.2286, 0.3768, -0.3017, 0.3547, -0.3017, 0.4752, -0.2515, 0.4883, -0.2034, 0.499, -0.1574, 0.5074, -0.092, 0.5154, -0.0305, 0.5181, 0.0425, 0.5137, 0.1075, 0.5006, 0.1644, 0.4787, 0.2133, 0.4481, 0.2632, 0.396, 0.2931, 0.3329, 0.3031, 0.2589, 0.2978, 0.2064, 0.2819, 0.1596, 0.2555, 0.1186, 0.2194, 0.0843, 0.1743, 0.0578],
  ],
  [
    [0.082, 0.3821, -0.2595, -0.1517, 0.082, -0.1517],
    [0.0466, 0.5, 0.2167, 0.5, 0.2167, -0.1517, 0.3593, -0.1517, 0.3593, -0.2642, 0.2167, -0.2642, 0.2167, -0.5, 0.082, -0.5, 0.082, -0.2642, -0.3694, -0.2642, -0.3694, -0.1336],
  ],
  [
    [-0.2883, 0.5, 0.2428, 0.5, 0.2428, 0.3861, -0.1644, 0.3861, -0.1644, 0.141, -0.135, 0.1498, -0.1055, 0.1561, -0.076, 0.1598, -0.0466, 0.1611, 0.0328, 0.1553, 0.1035, 0.1381, 0.1654, 0.1095, 0.2187, 0.0693, 0.2615, 0.0194, 0.292, -0.0387, 0.3104, -0.1049, 0.3165, -0.1792, 0.3102, -0.2554, 0.2914, -0.3226, 0.26, -0.3808, 0.216, -0.43, 0.1725, -0.4622, 0.1225, -0.4872, 0.0658, -0.5051, 0.0025, -0.5158, -0.0673, -0.5194, -0.1309, -0.5167, -0.1956, -0.5087, -0.262, -0.4953, -0.3305, -0.4766, -0.3305, -0.3406, -0.2693, -0.3692, -0.206, -0.3895, -0.1398, -0.4015, -0.07, -0.4056, 0.0019, -0.3988, 0.0631, -0.3785, 0.1135, -0.3446, 0.1511, -0.2991, 0.1737, -0.244, 0.1812, -0.1792, 0.1737, -0.1143, 0.1511, -0.0592, 0.1135, -0.0137, 0.0631, 0.0201, 0.0019, 0.0404, -0.07, 0.0472, -0.1242, 0.0442, -0.1782, 0.0352, -0.2327, 0.0198, -0.2883, -0.0023],
  ],
  [
    [0.0164, 0.0539, -0.0401, 0.047, -0.0882, 0.0262, -0.1279, -0.0084, -0.1575, -0.055, -0.1753, -0.112, -0.1812, -0.1792, -0.1753, -0.246, -0.1575, -0.3029, -0.1279, -0.3496, -0.0882, -0.3844, -0.0401, -0.4053, 0.0164, -0.4123, 0.0729, -0.4053, 0.121, -0.3844, 0.1608, -0.3496, 0.1903, -0.3029, 0.2081, -0.246, 0.214, -0.1792, 0.2081, -0.112, 0.1903, -0.055, 0.1608, -0.0084, 0.121, 0.0262, 0.0729, 0.047],
    [0.285, 0.4779, 0.285, 0.3547, 0.2338, 0.3759, 0.1822, 0.3915, 0.1305, 0.401, 0.0794, 0.4042, 0.0163, 0.3986, -0.0388, 0.3816, -0.086, 0.3534, -0.1253, 0.3138, -0.1568, 0.2628, -0.1808, 0.2003, -0.1971, 0.1262, -0.206, 0.0405, -0.1614, 0.092, -0.1068, 0.1299, -0.0442, 0.1533, 0.0244, 0.1611, 0.0958, 0.1554, 0.1593, 0.1382, 0.2149, 0.1097, 0.2626, 0.0697, 0.3008, 0.0198, 0.3281, -0.0383, 0.3445, -0.1046, 0.35, -0.1792, 0.3443, -0.2524, 0.3272, -0.318, 0.2987, -0.376, 0.2589, -0.4263, 0.2096, -0.4671, 0.1527, -0.4961, 0.0883, -0.5136, 0.0164, -0.5194, -0.0497, -0.5141, -0.1093, -0.4982, -0.1623, -0.4716, -0.2089, -0.4343, -0.2488, -0.3865, -0.2769, -0.3388, -0.2998, -0.2846, -0.3176, -0.2236, -0.3304, -0.1561, -0.338, -0.0819, -0.3406, -0.001, -0.3375, 0.0754, -0.3281, 0.1464, -0.3125, 0.2121, -0.2906, 0.2724, -0.2624, 0.3274, -0.2281, 0.3771, -0.18, 0.4278, -0.1257, 0.4673, -0.0653, 0.4955, 0.0013, 0.5124, 0.074, 0.5181, 0.1252, 0.5156, 0.1768, 0.508, 0.2298, 0.4955],
  ],
  [
    [-0.3238, 0.5, 0.3192, 0.5, 0.3192, 0.4424, -0.0439, -0.5, -0.1852, -0.5, 0.1564, 0.3861, -0.3238, 0.3861],
  ],
  [
    [-0.0003, -0.0251, -0.0601, -0.0308, -0.1106, -0.048, -0.152, -0.0767, -0.1827, -0.1154, -0.2012, -0.1627, -0.2073, -0.2187, -0.2012, -0.2747, -0.1827, -0.322, -0.152, -0.3607, -0.1106, -0.3893, -0.0601, -0.4065, -0.0003, -0.4123, 0.0594, -0.4065, 0.1101, -0.3892, 0.1517, -0.3603, 0.1826, -0.3215, 0.2011, -0.2743, 0.2073, -0.2187, 0.2012, -0.1627, 0.1827, -0.1154, 0.152, -0.0767, 0.1106, -0.048, 0.0598, -0.0308],
    [-0.1356, 0.0325, -0.1894, 0.051, -0.2346, 0.078, -0.2713, 0.1135, -0.2982, 0.1562, -0.3144, 0.2046, -0.3198, 0.2589, -0.3103, 0.3332, -0.2819, 0.3964, -0.2344, 0.4484, -0.1878, 0.4789, -0.1332, 0.5007, -0.0707, 0.5137, -0.0003, 0.5181, 0.0703, 0.5137, 0.133, 0.5007, 0.1875, 0.4789, 0.2341, 0.4484, 0.2814, 0.3964, 0.3097, 0.3332, 0.3192, 0.2589, 0.3138, 0.2046, 0.2976, 0.1562, 0.2706, 0.1135, 0.234, 0.078, 0.189, 0.051, 0.1356, 0.0325, 0.196, 0.0125, 0.2468, -0.0172, 0.288, -0.0566, 0.3183, -0.1041, 0.3365, -0.1581, 0.3426, -0.2187, 0.3371, -0.2871, 0.3204, -0.3471, 0.2927, -0.3987, 0.2539, -0.4417, 0.2047, -0.4757, 0.1459, -0.5, 0.0776, -0.5146, -0.0003, -0.5194, -0.0783, -0.5146, -0.1466, -0.5, -0.2054, -0.4757, -0.2545, -0.4417, -0.2933, -0.3987, -0.3211, -0.3471, -0.3377, -0.2871, -0.3433, -0.2187, -0.3372, -0.1581, -0.3189, -0.1041, -0.2883, -0.0566, -0.247, -0.0172, -0.1961, 0.0125],
    [-0.1852, 0.2461, -0.1731, 0.177, -0.1366, 0.1249, -0.0783, 0.0923, -0.0003, 0.0814, 0.0773, 0.0923, 0.136, 0.1249, 0.1729, 0.177, 0.1852, 0.2461, 0.1729, 0.3153, 0.136, 0.3674, 0.0773, 0.4, -0.0003, 0.4109, -0.0783, 0.4, -0.1366, 0.3674, -0.1731, 0.3153],
  ],
  [
    [-0.2857, -0.4792, -0.2857, -0.356, -0.2344, -0.3773, -0.1825, -0.3928, -0.1308, -0.4024, -0.08, -0.4056, -0.017, -0.3999, 0.0381, -0.383, 0.0853, -0.3549, 0.1246, -0.3155, 0.1561, -0.2646, 0.1801, -0.202, 0.1965, -0.1278, 0.2053, -0.0419, 0.1613, -0.0928, 0.1068, -0.1303, 0.044, -0.1534, -0.0251, -0.1611, -0.0962, -0.1554, -0.1595, -0.1384, -0.2149, -0.11, -0.2626, -0.0703, -0.3008, -0.0208, -0.3281, 0.0371, -0.3445, 0.1033, -0.35, 0.1778, -0.3443, 0.251, -0.3272, 0.3166, -0.2987, 0.3746, -0.2589, 0.425, -0.2096, 0.4657, -0.1527, 0.4948, -0.0883, 0.5123, -0.0164, 0.5181, 0.0497, 0.5128, 0.1092, 0.4968, 0.1622, 0.4702, 0.2086, 0.433, 0.2485, 0.3851, 0.2764, 0.3375, 0.2993, 0.2831, 0.3171, 0.2221, 0.3298, 0.1544, 0.3374, 0.08, 0.3399, -0.001, 0.3368, -0.0772, 0.3275, -0.148, 0.3119, -0.2136, 0.2901, -0.2738, 0.262, -0.3288, 0.2277, -0.3784, 0.1798, -0.4292, 0.1256, -0.4687, 0.0653, -0.4969, -0.0013, -0.5138, -0.074, -0.5194, -0.1253, -0.5169, -0.1772, -0.5094, -0.2304, -0.4968],
    [-0.0164, -0.0553, 0.0401, -0.0483, 0.0882, -0.0276, 0.1279, 0.007, 0.1575, 0.0537, 0.1753, 0.1106, 0.1812, 0.1778, 0.1753, 0.2447, 0.1575, 0.3015, 0.1279, 0.3483, 0.0882, 0.3831, 0.0401, 0.404, -0.0164, 0.4109, -0.0729, 0.404, -0.121, 0.3831, -0.1608, 0.3483, -0.1903, 0.3015, -0.2081, 0.2447, -0.214, 0.1778, -0.2081, 0.1106, -0.1903, 0.0537, -0.1608, 0.007, -0.121, -0.0276, -0.0729, -0.0483],
  ],
];

// SVG subpaths define islands and holes by containment; retain the white knockout letters.
function vectorFaces(THREE, raw) {
  const contours = raw.map(coords => {
    const points = [];
    for (let i = 0; i < coords.length; i += 2) points.push(new THREE.Vector2(coords[i], coords[i + 1]));
    return { points, area: Math.abs(THREE.ShapeUtils.area(points)), holes: [], depth: 0 };
  }).sort((a, b) => b.area - a.area);
  function contains(poly, { x, y }) {
    let crosses = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) crosses = !crosses;
    }
    return crosses;
  }
  for (let i = 1; i < contours.length; i++) {
    const contour = contours[i];
    const parent = contours.slice(0, i).reverse().find(other => contains(other.points, contour.points[0]));
    if (parent) {
      contour.depth = parent.depth + 1;
      if (contour.depth % 2) parent.holes.push(contour.points);
    }
  }
  const triangles = [];
  for (const { points, holes, depth } of contours) {
    if (depth % 2) continue;
    const faces = THREE.ShapeUtils.triangulateShape(points, holes);
    const vertices = [...points, ...holes.flat()];
    for (const face of faces) triangles.push(face.map(i => [vertices[i].x, vertices[i].y]));
  }
  return triangles;
}

const markCache = new WeakMap();
function artwork(THREE) {
  if (!markCache.has(THREE)) {
    markCache.set(THREE, {
      numerals: numberPaths.map(outline => vectorFaces(THREE, outline)),
      palette: {
        logoBlack: new THREE.MeshStandardMaterial({ name: 'Fleet number black', color: 0x151515, roughness: 0.58, metalness: 0.03 }),
      },
    });
  }
  return markCache.get(THREE);
}


function addNumber(THREE, batch, surface, side, text, x, y, h) {
  const { numerals } = artwork(THREE);
  const step = h * 0.84;
  for (let i = 0; i < text.length; i++) {
    const offset = (i - (text.length - 1) / 2) * step;
    for (const triangle of numerals[Number(text[i])] ?? []) {
      const position = triangle.map(([u, v]) => [x + side * (offset + u * h), y + v * h]);
      if (side < 0) position.reverse();
      surfaceTriangle(batch, 'graphicsWhite', surface, side, position);
    }
  }
}

const sideLayouts = {
  B: { entry: [-6.58, 4.10], raised: [-9.69, 7.39], bank: -1.23, logos: [-11.95, 5.83], numberEnd: -1 },
  C: { entry: [-5.41, 5.40], raised: [-8.44, 8.43], bank: 0, logos: [10.87], numberEnd: -1, hatch: -10.09, restroom: true },
  D: { entry: [-6.08, 6.06], raised: [-9.32, 9.32], bank: 0, logos: [7.72], numberEnd: -1, bicycle: true },
  G: { entry: [-5.32, 5.32], raised: [-8.48, 8.48], bank: 0, logos: [10.87], numberEnd: -1, hatch: -10.09 },
  E: { entry: [-5.37, 5.37], raised: [-8.47, 8.47], bank: 0, logos: [10.87], numberEnd: 1, hatch: -10.09 },
  F: { entry: [-6.07, 6.07], raised: [-9.32, 9.32], bank: 0, logos: [7.72], numberEnd: 1, bicycle: true },
  A: { entry: [-6.57, 4.13], raised: [-9.67, 7.48], bank: -1.22, logos: [-11.00, 6.04], numberEnd: -1 },
};

const glassTones = {
  cool: [0x384d55, 0x435b63, 0x3e545f, 0x344852, 0x465858, 0x354a52],
  shade: [0x131d20, 0x182427, 0x141d26, 0x18282d, 0x1c2627, 0x142025],
};

function glassGradient(THREE, y, height, variant, shade = 1) {
  const cool = new THREE.Color(glassTones.cool[variant % glassTones.cool.length]).multiplyScalar(shade);
  const dark = new THREE.Color(glassTones.shade[variant % glassTones.shade.length]).multiplyScalar(shade);
  return points => points.map(([, sampleY]) => cool.clone().lerp(dark, clamp((sampleY - y) / height + 0.55, 0, 1)));
}

// Tonal shapes inside the glass suggest dim seats, vestibule lines and reflection.
// The window remains a compact exterior assembly with a single opaque glaze.
function glazingDepth(THREE, batch, at, side, mat, x, y, w, h, variant, lift, usage) {
  if (!usage) return;
  const direction = variant % 2 ? 1 : -1;
  const t = variant % 6;
  function tone(localX, localY, width, height, radius, brightness, offset) {
    panel(batch, mat, at(lift + offset), side, x + direction * localX * w, y + localY * h,
      width * w, height * h, radius, glassGradient(THREE, y, h, variant, brightness));
  }
  if (usage === 'door') {
    if (t % 3 !== 0) tone(-0.16, -0.07, 0.10, 0.70, 0.017, 0.78, 0.0074);
    tone(0.04, -0.27, 0.72, 0.065, 0.016, 0.72, 0.0080);
    return;
  }
  if (t % 3 !== 1) tone(0.23, 0.08, 0.36, 0.53, 0.025, 1.21, 0.0073);
  if (usage !== 'bike') {
    tone(-0.21, -0.25, 0.26, t % 3 === 1 ? 0.34 : 0.38, 0.052, 0.58, 0.0079);
    if (w > 1 && t % 3 === 2) tone(0.13, -0.33, 0.24, 0.22, 0.043, 0.65, 0.0085);
  } else {
    tone(-0.23, -0.21, 0.055, 0.34, 0.018, 0.70, 0.0081);
    tone(0.17, -0.25, 0.048, 0.30, 0.017, 0.69, 0.0082);
  }
  if (t === 0 || t === 4) tone(0.02, 0.22, 0.66, 0.035, 0.009, 1.36, 0.0084);
}

function windowPanel(THREE, batch, at, side, x, y, w, h, r, variant, lift = 0.020, usage) {
  const mat = usage === 'upper' ? 'smokedGlass' : 'glass';
  panel(batch, 'windowMask', at(lift), side, x, y, w, h, r);
  gasket(batch, 'windowBrightEdge', at(lift + 0.027), side, x, y, w - 0.028, h - 0.027, r - 0.014, 0.009);
  gasket(batch, 'rubber', at(lift + 0.028), side, x, y, w - 0.038, h - 0.036, r - 0.018, 0.030);
  panel(batch, mat, at(lift + 0.006), side, x, y, w - 0.093, h - 0.088, r - 0.040,
    glassGradient(THREE, y, h, variant));
  glazingDepth(THREE, batch, at, side, mat, x, y, w - 0.105, h - 0.104, variant, lift, usage);
  if (variant % 4 === 0) {
    panel(batch, 'labelInk', at(lift + 0.016), side, x, y + h * 0.38, w * 0.31, 0.020, 0.005);
  }
}

function safetyLabel(batch, at, side, x, y, color = 'emergency', width = 0.31) {
  panel(batch, 'paper', at(0.017), side, x, y, width, 0.115, 0.010);
  panel(batch, color, at(0.021), side, x, y + 0.029, width - 0.015, 0.039, 0.005);
  for (let i = 0; i < 3; i++) {
    panel(batch, 'labelInk', at(0.024), side, x, y - 0.005 - i * 0.015, width * (0.73 - i * 0.1), 0.005, 0.001);
  }
}

function bicycleIcon(batch, surface, side, x, y) {
  const transform = ([a, b]) => [x - side * a, y + b];
  for (const a of [-0.118, 0.118]) ring(batch, 'graphicsWhite', surface, side, x + a, y - 0.096, 0.082, 0.016);
  const frame = [[-0.118, -0.096], [-0.048, 0.021], [0.030, -0.093], [-0.118, -0.096],
    [-0.043, -0.004], [0.083, 0.011], [0.030, -0.093], [0.115, -0.096], [0.072, 0.079], [0.023, 0.079]];
  for (let i = 1; i < frame.length; i++) {
    stripe(batch, 'graphicsWhite', surface, side, ...transform(frame[i - 1]), ...transform(frame[i]), 0.017);
  }
  for (const [a, b, w] of [
    [[0.005, 0.135], [-0.075, 0.070], 0.058],
    [[0.005, 0.135], [0.055, 0.070], 0.041],
    [[0.055, 0.070], [0.112, 0.070], 0.033],
    [[-0.075, 0.070], [0.011, 0.025], 0.045],
    [[0.011, 0.025], [-0.013, -0.068], 0.042],
  ]) stripe(batch, 'graphicsWhite', surface, side, ...transform(a), ...transform(b), w);
  disc(batch, 'graphicsWhite', surface, side, ...transform([0.049, 0.165]), 0.029);
}

function restroomIcon(batch, surface, side, x, y) {
  disc(batch, 'access', surface, side, x, y, 0.089);
  const face = (a, b) => { const p = surface(a, b); p[2] += side * 0.0015; return p; };
  surfaceTriangle(batch, 'graphicsWhite', face, side, [[x - 0.074, y - 0.053], [x + 0.074, y - 0.053], [x, y + 0.076]]);
  const ink = (a, b) => { const p = surface(a, b); p[2] += side * 0.0026; return p; };
  disc(batch, 'access', ink, side, x, y + 0.032, 0.0065);
  disc(batch, 'access', ink, side, x - 0.022, y + 0.003, 0.0055);
  for (const [x1, y1, x2, y2, width] of [
    [-0.021, -0.004, -0.021, -0.025, 0.006], [-0.030, -0.012, -0.012, -0.012, 0.005],
    [0.001, 0.022, 0.001, -0.020, 0.007], [0.001, -0.009, 0.017, -0.016, 0.006],
    [0.017, -0.016, 0.025, -0.029, 0.005], [-0.035, -0.039, 0.035, -0.039, 0.0045],
  ]) stripe(batch, 'access', ink, side, x + x1, y + y1, x + x2, y + y2, width);
  ring(batch, 'access', ink, side, x + 0.003, y - 0.020, 0.012, 0.004);
}

function buildGlazing(THREE, ctx, layout, batch, detail, at, side) {
  const bike = layout.bicycle;
  const upperOffsets = bike ? [-6.12, -4.22, -2.53, -0.84, 0.84, 2.53, 4.22, 6.17] : [-5.26, -3.37, -1.69, 0, 1.69, 3.37, 5.29];
  const upperY = 4.03;
  const upperWidth = bike ? 13.89 : 12.38;
  panel(batch, 'windowMask', at(0.025), side, layout.bank, upperY, upperWidth, 0.87, 0.14);
  upperOffsets.forEach((offset, i) => {
    const isEdge = i === 0 || i === upperOffsets.length - 1;
    windowPanel(THREE, batch, at, side, layout.bank + offset, upperY, isEdge ? 0.83 : 1.33,
      0.79, 0.155, i + ctx.index, 0.035, 'upper');
    if (i === 1 || i === upperOffsets.length - 3) safetyLabel(detail, at, side, layout.bank + offset, 3.48, 'emergency', 0.31);
  });

  const lowerY = 1.91;
  // (one more window at each end than the KISS, where its low-platform entry doors were: see buildDoors)
  const lowerOffsets = bike ? [-5.89, -4.21, -2.53, -0.84, 0.84, 2.53, 4.21, 5.89] : [-5.07, -3.38, -1.69, 0, 1.69, 3.38, 5.07];
  // Car C's photographed restroom wall shows three panes. The Stadler GA
  // lower-floor plan (Caltrain 35492, p. 8) shows the full window bank opposite.
  const restroomWall = layout.restroom && side === -1;
  const visible = restroomWall ? [[0.22, 0.93], [1.68, 1.30], [3.36, 1.30]] : lowerOffsets.map(offset => [offset, 1.31]);
  const [first, firstW] = visible[0], [last, lastW] = visible[visible.length - 1];
  const left = first - firstW / 2 - 0.045, right = last + lastW / 2 + 0.045;
  panel(batch, 'windowMask', at(0.015), side, layout.bank + (left + right) / 2, lowerY, right - left, 0.85, 0.13);
  visible.forEach(([offset, w], i) => {
    const x = layout.bank + offset;
    windowPanel(THREE, batch, at, side, x, lowerY, w, 0.790, 0.14, i * 5 + ctx.index, 0.024, bike ? 'bike' : 'passenger');
    if (i === 0 || i === 2 || i === visible.length - 1) safetyLabel(detail, at, side, x - side * 0.31, 1.265, 'emergency', 0.30);
  });
  if (restroomWall) panel(detail, 'steel', at(0.012), side, -0.90, 2.42, 0.17, 0.18, 0.025);
  if (bike) {
    for (const end of [-1, 1]) {
      windowPanel(THREE, batch, at, side, end * 11.35, 2.58, 0.95, 0.82, 0.15, 0);
      safetyLabel(detail, at, side, end * 11.35, 2.03, 'emergency', 0.30);
    }
  }
}

// The KISS has two sets of doors, for Caltrain's two platform heights: low entry doors (sill 0.55 m) in the middle of
// each car and doors for future high platforms (sill 1.44 m) over the bogies at its ends. The CrossTowner's platforms
// are all 1.10 m above the rail, so it keeps only the end doors, lowered to that height; the low doors' places get
// lower-deck windows (buildGlazing). (layout.entry still places the seams in fleetDetails.)
const SILL = 1.10;
function buildDoors(THREE, ctx, layout, doors, details, at, lowAt, side) {
  const dy = SILL - 1.4365;                                     // the KISS's high door (centred 2.55 m, 2.227 m tall), brought down
  for (const [i, x] of layout.raised.entries()) {
    const midCenter = 2.55 + dy;
    panel(doors, 'doorGasket', at(0.014), side, x, midCenter, 1.628, 2.27, 0.092);
    panel(doors, 'midDoor', at(0.019), side, x, midCenter, 1.596, 2.227, 0.082);
    windowPanel(THREE, doors, at, side, x, 2.722 + dy, 0.958, 0.83, 0.17, i * 4, 0.031, 'door');
    panel(doors, 'steel', at(0.033), side, x, 1.424 + dy, 1.558, 0.027, 0.006);
    panel(doors, 'caution', at(0.036), side, x, 1.444 + dy, 1.489, 0.012, 0.005);
    safetyLabel(details, lift => at(lift + 0.008), side, x, 2.175 + dy, 'emergency', 0.305);
    for (const y of [1.49, 3.59]) disc(details, 'steel', at(0.035), side, x + side * 0.76, y + dy, 0.016);
    if (layout.bicycle) bicycleIcon(details, at(0.040), side, x, 1.62);
    // the open/close buttons beside it
    const buttonX = x + side * 0.94 * Math.sign(x);
    for (const [y, ring, center] of [[2.20, 'steel', 'polished'], [2.02, 'emergency', 'buttonGreen']]) {
      disc(details, 'buttonInactive', at(0.020), side, buttonX, y, 0.044);
      disc(details, ring, at(0.027), side, buttonX, y, 0.036);
      disc(details, center, at(0.033), side, buttonX, y, 0.017);
    }
  }
}

function fleetDetails(THREE, ctx, layout, profile, details, at, side, root) {
  const { minX, maxX, point } = profile;
  const length = maxX - minX;
  const highY = 3.81;
  const [rearDoor, frontDoor] = layout.raised;
  const [rearEntry, frontEntry] = layout.entry;
  function seam(from, to, y, width = 0.014, color = 'shadowSeam') {
    const pieces = Math.max(1, Math.ceil((to - from) / 1.6));
    for (let i = 0; i < pieces; i++) {
      stripe(details, color, at(0.011), side, mix(from, to, i / pieces), y, mix(from, to, (i + 1) / pieces), y, width);
    }
  }
  seam(minX + 0.30, rearEntry - 1.02, highY, 0.016);
  seam(frontEntry + 0.95, maxX - (ctx.cab ? 0.29 : 0.32), highY, 0.014);
  seam(rearEntry - 1.52, frontEntry + 1.52, 3.21, 0.018);
  seam(rearEntry - 1.55, frontEntry + 1.55, 3.245, 0.021, 'highlightSeam');
  seam(rearEntry - 1.60, rearEntry + 1.16, 3.135, 0.011);
  seam(frontEntry - 1.16, frontEntry + 1.60, 3.135, 0.011);
  for (const x of [rearDoor - 1.76, frontDoor + 1.76]) {
    if (x < minX + 0.25 || x > maxX - 0.30) continue;
    gasket(details, 'shadowSeam', at(0.013), side, x, 1.66, 0.393, 0.149, 0.018, 0.012);
    for (const u of [-0.137, 0.137]) disc(details, 'shadowSeam', at(0.014), side, x + u, 1.659, 0.009);
  }
  if (layout.hatch !== undefined) {
    const x = layout.hatch;
    panel(details, 'doorGasket', at(0.012), side, x, 2.499, 0.867, 1.092, 0.115);
    panel(details, 'white', at(0.018), side, x, 2.499, 0.838, 1.063, 0.105);
    for (const y of [2.14, 2.85]) {
      panel(details, 'shadowSeam', at(0.025), side, x, y, 0.30, 0.042, 0.009);
      disc(details, 'steel', at(0.028), side, x + side * 0.35, y, 0.018);
    }
  }
  const numberX = layout.numberEnd < 0 ? minX + 0.82 : maxX - 0.82;
  addNumber(THREE, details, at(0.013), side, String(ctx.number ?? ''), numberX, 1.118, 0.251);
  for (const x of ctx.cab && ctx.makeLogo ? layout.logos.slice(0, 1) : []) {
    if (x < minX + 0.60 || x > minX + length - 0.65) continue;
    const logo = ctx.makeLogo(THREE, 2.3);
    logo.position.fromArray(point(x, 2.78, side, 0.013));
    if (side < 0) logo.rotation.y = Math.PI;
    root.add(logo);
  }
}

export function buildBody(THREE, ctx) {
  const root = new THREE.Group();
  const letter = String(ctx.type ?? (ctx.cab ? 'B' : 'G')).toUpperCase();
  const layout = sideLayouts[letter] ?? sideLayouts[ctx.cab ? 'B' : 'G'];
  const options = { ...ctx, index: ctx.index ?? 0, type: letter };
  root.name = `Car ${letter} • bodyshell and glazing`;
  const profile = bodyProfile(options);
  const materials = materialsFor(THREE);
  makeShell(THREE, options, profile, root, materials);
  const glass = makeBatch(THREE, materials);
  const doors = makeBatch(THREE, materials);
  const details = makeBatch(THREE, materials);
  for (const side of [-1, 1]) {
    const at = lift => (x, y) => profile.point(x, y, side, lift * 0.52);
    // The plug-door faces stay straight across the tapered lower bodyshell lip.
    const lowAt = lift => (x, y) => {
      const point = profile.point(x, y, side);
      point[1] = y;
      point[2] = side * (Math.max(1.473, halfWidth(y)) + lift * 0.52);
      return point;
    };
    buildGlazing(THREE, options, layout, glass, details, at, side);
    buildDoors(THREE, options, layout, doors, details, at, lowAt, side);
    fleetDetails(THREE, options, layout, profile, details, at, side, root);
  }
  glass.finish('Upper and lower deck glazing', root);
  doors.finish('Low-platform and future high-platform doors', root);
  details.finish('Fleet markings and access hardware', root);
  return root;
}
