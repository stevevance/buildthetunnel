// Bally's Chicago, Phase 1 public realm. Coordinates are metres east/south of the site datum.
export function buildLandscape(THREE, site) {
  const group = new THREE.Group();
  group.name = 'Riverwalk, riverfront park and streetscape';
  const batches = new Map();
  const object = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3();
  let seed = 478216;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const between = (min, max) => min + (max - min) * random();
  const pick = (items) => items[Math.floor(random() * items.length)];
  const surface = (color, roughness = 0.9, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const materials = {
    paving: surface(0xc5bdab), pavingCool: surface(0xaaa89e), paverJoint: surface(0x99958b),
    lightStone: surface(0xdad3bf), sideStone: surface(0xa49b87), darkStone: surface(0x807663),
    path: surface(0xc5b79d), curb: surface(0xd8d0bc), asphalt: surface(0x53575b),
    reserved: surface(0xacae9c), quietPath: surface(0xb3aa97),
    whitePaint: surface(0xece8d8), yellowPaint: surface(0xb39c5f),
    grass: surface(0x7f9256), roughGrass: surface(0x75854e), meadow: surface(0x748652),
    warmGrass: surface(0x829354), rainGarden: surface(0x617452),
    metal: surface(0x827f76, 0.55, 0.37), darkMetal: surface(0x454944, 0.6, 0.25),
    steel: surface(0xa7a499, 0.43, 0.36), wood: surface(0x93694a), paleWood: surface(0xa48560),
    corten: surface(0x7d5039, 0.84, 0.14), pileRib: surface(0x966a4e, 0.86, 0.1),
    trunk: surface(0x605747), canopy: surface(0xffffff, 0.96), shrub: surface(0xffffff),
    blades: surface(0xffffff), flowers: surface(0xffffff), aggregate: surface(0xffffff),
    glazing: surface(0x445968, 0.38, 0.32),
    sailRed: surface(0x983927, 0.58, 0.2), creamCloth: surface(0xd6c7a5),
    lamp: new THREE.MeshStandardMaterial({ color: 0xdad2ba, emissive: 0xffdfac, emissiveIntensity: 0.18 }),
  };
  function mottling(contrast, grain) {
    const size = 128;
    const texels = new Uint8Array(size * size * 4);
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const x = Math.PI * 2 * column / size, z = Math.PI * 2 * row / size;
        const soft = Math.sin(x * 2 + z) * Math.cos(z * 2 - x) + 0.53 * Math.sin(x * 3 - z * 5);
        const granules = Math.sin(x * 29 + z * 31) * Math.cos(x * 41 - z * 43);
        const tint = Math.round(241 + soft * contrast + granules * grain);
        texels.set([tint, tint, tint, 255], (row * size + column) * 4);
      }
    }
    const texture = new THREE.DataTexture(texels, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }
  const turfTexture = mottling(6, 4);
  const stoneTexture = mottling(2, 3);
  for (const name of ['grass', 'roughGrass', 'meadow', 'warmGrass', 'rainGarden']) materials[name].map = turfTexture;
  for (const name of ['paving', 'pavingCool', 'path', 'lightStone', 'sideStone', 'quietPath']) materials[name].map = stoneTexture;
  materials.reserved.map = mottling(8, 4);
  materials.canopy.vertexColors = true;
  materials.canopy.side = THREE.DoubleSide;
  const geometry = {
    box: new THREE.BoxGeometry(),
    post: new THREE.CylinderGeometry(0.45, 0.5, 1, 7),
    limb: new THREE.CylinderGeometry(0.26, 0.5, 1, 6),
    shrub: new THREE.IcosahedronGeometry(1, 1),
    flower: new THREE.IcosahedronGeometry(1, 0),
    boulder: new THREE.DodecahedronGeometry(1, 0),
    umbrella: new THREE.ConeGeometry(1, 0.34, 8),
    seat: new THREE.CylinderGeometry(1, 1, 1, 10),
  };
  const grass = new THREE.BufferGeometry();
  const bladePoints = [];
  for (let blade = 0; blade < 10; blade++) {
    const angle = between(0, Math.PI * 2);
    const ru = between(0.01, 0.17);
    const h = between(0.4, 1);
    const x = Math.cos(angle), z = Math.sin(angle);
    const f = between(0.22, 0.57);
    const w = between(0.025, 0.052);
    bladePoints.push(x * ru - z * w, 0, z * ru + x * w, x * ru + z * w, 0, z * ru - x * w,
      x * (ru + f * 0.37), h * 0.61, z * (ru + f * 0.37));
    bladePoints.push(x * (ru + f * 0.31) - z * w * 0.67, h * 0.51, z * (ru + f * 0.31) + x * w * 0.67,
      x * (ru + f * 0.31) + z * w * 0.67, h * 0.51, z * (ru + f * 0.31) - x * w * 0.67,
      x * (ru + f), h, z * (ru + f));
  }
  grass.setAttribute('position', new THREE.Float32BufferAttribute(bladePoints, 3));
  grass.computeVertexNormals();
  geometry.grass = grass;
  materials.blades.side = THREE.DoubleSide;

  function queue(layer, shape, material, color) {
    const key = `${layer} ${shape} ${material} ${color ?? ''}`;
    if (!batches.has(key)) batches.set(key, { layer, shape, material, matrices: [], color });
    object.updateMatrix();
    batches.get(key).matrices.push(object.matrix.clone());
  }

  function instance(layer, shape, material, x, y, z, w, h, d, angle = 0, color) {
    object.position.set(x, y, z);
    object.rotation.set(0, angle, 0);
    object.scale.set(w, h, d);
    queue(layer, shape, material, color);
  }

  function link(layer, shape, material, start, end, width, depth = width, color) {
    axis.set(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
    const length = axis.length();
    if (length < 0.001) return;
    object.position.set((start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5, (start[2] + end[2]) * 0.5);
    object.quaternion.setFromUnitVectors(up, axis.normalize());
    object.scale.set(width, length, depth);
    queue(layer, shape, material, color);
  }

  function boundary(points, x, z) {
    let inside = false;
    for (let i = 0, previous = points.length - 1; i < points.length; previous = i++) {
      const [a, b] = points[i], [c, d] = points[previous];
      if ((b > z) !== (d > z) && x < (c - a) * (z - b) / (d - b) + a) inside = !inside;
    }
    return inside;
  }

  function slab(layer, points, y, material, side = 0, sideMaterial = material) {
    const face = points.map(([x, z]) => new THREE.Vector2(x, -z));
    const indices = THREE.ShapeUtils.triangulateShape(face, []);
    const meshGeometry = new THREE.BufferGeometry();
    meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(([x, z]) => [x, y, z]), 3));
    meshGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(points.flatMap(([x, z]) => [x / 11, z / 11]), 2));
    const index = indices.flatMap(([a, b, c]) => {
      const area = (points[b][1] - points[a][1]) * (points[c][0] - points[a][0]) -
        (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]);
      return area < 0 ? [a, c, b] : [a, b, c];
    });
    meshGeometry.setIndex(index);
    meshGeometry.computeVertexNormals();
    const mesh = new THREE.Mesh(meshGeometry, materials[material]);
    mesh.name = layer;
    mesh.receiveShadow = true;
    group.add(mesh);
    if (side > 0) {
      points.forEach(([x, z], i) => {
        const [otherX, otherZ] = points[(i + 1) % points.length];
        edge(layer, sideMaterial, [x, z], [otherX, otherZ], y - side / 2, 0.13, side);
      });
    }
  }

  function edge(layer, material, a, b, height, width, thickness, color) {
    const x = b[0] - a[0], z = b[1] - a[1];
    instance(layer, 'box', material, (a[0] + b[0]) * 0.5, height, (a[1] + b[1]) * 0.5,
      Math.hypot(x, z), thickness, width, -Math.atan2(z, x), color);
  }

  function alignment(points) {
    const lengths = points.slice(1).map(([x, z], index) => Math.hypot(x - points[index][0], z - points[index][1]));
    const length = lengths.reduce((a, b) => a + b, 0);
    const depths = [0];
    lengths.forEach((part) => depths.push(depths[depths.length - 1] + part));
    function at(distance, offset = 0) {
      const position = THREE.MathUtils.clamp(distance, 0, length);
      let index = 0;
      while (index < lengths.length - 1 && depths[index + 1] < position) index++;
      const t = (position - depths[index]) / lengths[index];
      const [x, z] = points[index];
      const [nx, nz] = points[index + 1];
      const dx = (nx - x) / lengths[index], dz = (nz - z) / lengths[index];
      return [x + (nx - x) * t - dz * offset, z + (nz - z) * t + dx * offset, Math.atan2(dz, dx)];
    }
    return { at, length, depths };
  }

  function ribbon(layer, points, left, right, y, material, side = 0, sideMaterial) {
    const line = alignment(points);
    const corners = (offset) => line.depths.map((s, index) => {
      if (index === 0 || index === line.depths.length - 1) return line.at(s, offset).slice(0, 2);
      const [, , prev] = line.at(s - 0.001), [, , next] = line.at(s + 0.001);
      const center = (prev + next) * 0.5;
      const miter = offset / Math.max(0.6, Math.cos((next - prev) * 0.5));
      return [points[index][0] - Math.sin(center) * miter, points[index][1] + Math.cos(center) * miter];
    });
    slab(layer, [...corners(left), ...corners(right).reverse()], y, material, side, sideMaterial);
    return line;
  }

  function rail(line, start, end, offset, y, infill = true) {
    const layer = 'Riverwalk railings';
    const spacing = 3.2;
    const count = Math.ceil((end - start) / spacing);
    const heights = [0.23, 1.04];
    for (let i = 0; i < count; i++) {
      const a = line.at(start + (end - start) * i / count, offset);
      const b = line.at(start + (end - start) * (i + 1) / count, offset);
      for (const height of heights) edge(layer, 'steel', a, b, y + height, 0.054, height > 1 ? 0.058 : 0.029);
      instance(layer, 'box', 'metal', a[0], y + 0.53, a[1], 0.073, 1.06, 0.072);
      if (infill) {
        for (let spindle = 1; spindle <= 5; spindle++) {
          const t = spindle / 6;
          instance(layer, 'box', 'steel', a[0] + (b[0] - a[0]) * t, y + 0.636, a[1] + (b[1] - a[1]) * t,
            0.021, 0.813, 0.024);
        }
      }
    }
  }

  function bench(x, y, z, angle = 0, width = 2.05) {
    const layer = 'Riverwalk seating and furnishings';
    const xOf = (a, b) => x + Math.cos(angle) * a + Math.sin(angle) * b;
    const zOf = (a, b) => z - Math.sin(angle) * a + Math.cos(angle) * b;
    for (const foot of [-0.34, 0.34]) {
      instance(layer, 'box', 'darkMetal', xOf(width * foot, 0), y + 0.26, zOf(width * foot, 0), 0.065, 0.52, 0.56, angle);
      instance(layer, 'box', 'darkMetal', xOf(width * foot, 0.25), y + 0.62, zOf(width * foot, 0.25), 0.055, 0.46, 0.055, angle);
    }
    for (const slat of [-0.19, -0.065, 0.065, 0.19]) {
      instance(layer, 'box', 'wood', xOf(0, slat), y + 0.49, zOf(0, slat), width, 0.055, 0.112, angle);
    }
    for (const backY of [0.66, 0.79]) {
      instance(layer, 'box', 'wood', xOf(0, 0.26), y + backY, zOf(0, 0.26), width, 0.102, 0.055, angle);
    }
  }

  function yardLight(x, y, z, angle, height = 4.6) {
    const layer = 'Pedestrian lighting';
    instance(layer, 'post', 'darkMetal', x, y + height / 2, z, 0.116, height, 0.116);
    instance(layer, 'post', 'darkMetal', x, y + 0.2, z, 0.22, 0.4, 0.22);
    const dx = 0.47 * Math.cos(angle), dz = 0.47 * Math.sin(angle);
    link(layer, 'post', 'darkMetal', [x, y + height - 0.015, z], [x + dx, y + height + 0.01, z + dz], 0.071);
    instance(layer, 'box', 'metal', x + dx, y + height + 0.02, z + dz, 0.48, 0.085, 0.22, -angle);
    instance(layer, 'box', 'lamp', x + dx, y + height - 0.031, z + dz, 0.43, 0.018, 0.184, -angle);
  }

  const foliage = [0x76925a, 0x819c63, 0x87a25b, 0x709361];
  const meadowHues = [0x748342, 0x8b9652, 0x667740, 0x9eaa62, 0x9a9f6a, 0xb1a673, 0x596c48, 0x5d7c5b];
  const flowerHues = [0xe9d6ab, 0xe7dcd0, 0x9c7c9e, 0xd0a5a1, 0xe3c269, 0xd3c8b2];
  const greens = [0x637a48, 0x758953, 0x828955, 0x58754e, 0x738054];

  // Reuse four branched crowns with small foliage masses and an irregular fringe of leaf sprays.
  function crownForm(variant) {
    let crownSeed = 70607 + variant * 21379;
    const sample = (min, max) => {
      crownSeed = (Math.imul(1664525, crownSeed) + 1013904223) >>> 0;
      return min + (max - min) * crownSeed / 4294967296;
    };
    const source = new THREE.IcosahedronGeometry(1, 0);
    const vertices = source.attributes.position;
    const positions = [], normals = [], colors = [], boughs = [];
    const add = (p, n, intensity, yellow) => {
      positions.push(...p);
      normals.push(...n);
      colors.push(intensity * (0.84 + yellow * 0.15), intensity, intensity * (0.92 - yellow * 0.18));
    };
    const normalVector = new THREE.Vector3();
    function foliageLobe(x, y, z, rx, ry, rz, shade) {
      const bend = sample(3, 16), yellow = sample(0, 1);
      for (let i = 0; i < vertices.count; i++) {
        const a = vertices.getX(i), b = vertices.getY(i), c = vertices.getZ(i);
        const radius = 1 + 0.19 * Math.sin(a * 2.8 + b * 5.1 + bend) * Math.cos(b * 3.7 - c * 2.7);
        normalVector.set(a / rx, b / ry, c / rz).normalize();
        const illumination = shade * (0.91 + 0.085 * b + 0.095 * Math.sin(a * 7 + b * 4 + c * 6 + bend));
        add([x + a * rx * radius, y + b * ry * radius, z + c * rz * radius], normalVector.toArray(), illumination, yellow);
      }
    }
    function spray(x, y, z, azimuth, size) {
      const dx = Math.cos(azimuth), dz = Math.sin(azimuth);
      const rise = sample(-0.24, 0.63);
      const root = [x, y, z];
      const tip = [x + size * dx, y + size * rise * 0.45, z + size * dz];
      const crease = [x + size * dx * 0.49, y + size * (rise + 0.2) * 0.24, z + size * dz * 0.49];
      const width = size * sample(0.19, 0.33);
      const twist = sample(-0.22, 0.22);
      const left = [crease[0] - width * dz, crease[1] + twist * width, crease[2] + width * dx];
      const right = [crease[0] + width * dz, crease[1] - twist * width, crease[2] - width * dx];
      const tint = sample(0.67, 1.07), yellow = sample(0, 1);
      const normal = normalVector.set(-0.32 * dx, 0.8, -0.32 * dz).normalize().toArray();
      for (const [a, b, c] of [[root, left, crease], [left, tip, crease], [crease, tip, right], [crease, right, root]]) {
        add(a, normal, tint * 0.87, yellow);
        add(b, normal, tint, yellow);
        add(c, normal, tint * 0.94, yellow);
      }
    }
    for (let bough = 0; bough < 8; bough++) {
      const peak = bough === 7;
      const angle = bough * 2.39996 + variant * 0.77 + sample(-0.29, 0.29);
      const spread = peak ? 0.045 : sample(0.38, 0.69);
      const x = Math.cos(angle) * spread, z = Math.sin(angle) * spread;
      const y = peak ? 0.89 : sample(0.57, 0.81);
      const breadth = peak ? 0.28 : sample(0.25, 0.38);
      boughs.push({ x, y, z, angle, breadth, base: sample(0.29, 0.5) });
      foliageLobe(x, y + 0.014, z, breadth * 0.56, 0.063, breadth * 0.52, sample(0.73, 0.9));
      for (let clump = 0; clump < 13; clump++) {
        const theta = sample(0, 6.28319);
        const extent = breadth * sample(0.25, 0.94);
        const du = extent * Math.cos(theta), dv = extent * Math.sin(theta);
        const dy = sample(-0.058, 0.095) - (extent / breadth) * 0.026;
        const r = sample(0.064, 0.145) * (clump < 5 ? 1.1 : 1);
        const lx = x + du, lz = z + dv, ly = y + dy;
        foliageLobe(lx, ly, lz, r * sample(0.84, 1.23), r * sample(0.29, 0.61), r * sample(0.83, 1.15), sample(0.7, 1.03));
        for (let leaf = 0; leaf < 4; leaf++) {
          const bearing = theta + sample(-1.2, 1.2);
          const offset = r * sample(0.65, 1.07);
          spray(lx + Math.cos(bearing) * offset, ly + r * sample(-0.21, 0.38), lz + Math.sin(bearing) * offset,
            bearing + sample(-0.61, 0.61), r * sample(0.27, 0.56));
        }
      }
    }
    source.dispose();
    const crown = new THREE.BufferGeometry();
    crown.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    crown.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    crown.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const name = `crown${variant}`;
    geometry[name] = crown;
    return { name, boughs };
  }
  const crowns = Array.from({ length: 4 }, (_, i) => crownForm(i));

  function tree(x, y, z, h = between(5, 8), breadth = between(0.34, 0.46), upright = false) {
    const layer = 'Deciduous shade trees';
    const rotation = between(0, Math.PI * 2);
    const r = h * breadth * (upright ? 0.9 : 1);
    const shape = pick(crowns);
    const trunkWidth = h * between(0.036, 0.048);
    const world = (u, v, w) => [
      x + r * (u * Math.cos(rotation) + w * Math.sin(rotation)),
      y + h * v,
      z + r * (w * Math.cos(rotation) - u * Math.sin(rotation)),
    ];
    const trunkTop = [0.022, 0.45, -0.036];
    link(layer, 'limb', 'trunk', [x, y, z], world(...trunkTop), trunkWidth);
    link(layer, 'limb', 'trunk', world(...trunkTop), world(-0.025, 0.83, 0.047), trunkWidth * 0.61);
    for (const bough of shape.boughs) {
      const { x: dx, y: dy, z: dz, angle, breadth: reach, base } = bough;
      const joint = world(dx * 0.58, base + (dy - base) * 0.48, dz * 0.58);
      const outer = world(dx, dy - 0.014, dz);
      link(layer, 'limb', 'trunk', world(0.018, base, -0.019), joint, trunkWidth * 0.54);
      link(layer, 'limb', 'trunk', joint, outer, trunkWidth * 0.35);
      const radial = reach * 0.54;
      for (const swing of [-0.88, 0.68]) {
        const twig = angle + swing;
        const tip = world(dx + radial * Math.cos(twig), dy + 0.014, dz + radial * Math.sin(twig));
        link(layer, 'limb', 'trunk', joint, tip, trunkWidth * 0.14);
      }
    }
    instance(layer, shape.name, 'canopy', x, y, z, r, h, r, rotation, pick(foliage));
  }

  function tuft(x, y, z, density = 1, blossoms = false) {
    const size = density * between(0.3, 0.78);
    instance('Perennial grasses and wildflowers', 'grass', 'blades', x, y, z, size * between(1.04, 1.51), size, size * 1.23,
      between(0, Math.PI * 2), pick(meadowHues));
    if (blossoms && random() > 0.37) {
      const hue = pick(flowerHues);
      for (let i = 0; i < 2; i++) {
        const flower = size * between(0.13, 0.22);
        instance('Perennial grasses and wildflowers', 'flower', 'flowers', x + between(-0.24, 0.24), y + size * between(0.57, 0.92),
          z + between(-0.23, 0.23), flower, flower * 0.34, flower, between(0, 5), hue);
      }
    }
  }

  function groundcover(layer, polygon, y, intensity, excluded = []) {
    const xs = polygon.map((p) => p[0]), zs = polygon.map((p) => p[1]);
    const xMin = Math.min(...xs), zMin = Math.min(...zs), xMax = Math.max(...xs), zMax = Math.max(...zs);
    const target = Math.ceil((xMax - xMin) * (zMax - zMin) * intensity);
    for (let i = 0; i < target; i++) {
      const x = between(xMin, xMax), z = between(zMin, zMax);
      if (!boundary(polygon, x, z) || excluded.some((other) => boundary(other, x, z))) continue;
      if (random() < 0.12) {
        const rad = between(0.38, 0.99);
        instance(layer, 'shrub', 'shrub', x, y + rad * 0.3, z, rad * 1.18, rad * 0.49, rad, between(0, 6), pick(greens));
      } else tuft(x, y, z, 1, true);
    }
  }

  function bins(x, y, z, angle = 0) {
    for (const offset of [-0.28, 0.28]) {
      const u = x + offset * Math.cos(angle), v = z + offset * Math.sin(angle);
      instance('Riverwalk seating and furnishings', 'seat', 'darkMetal', u, y + 0.46, v, 0.235, 0.91, 0.235);
      instance('Riverwalk seating and furnishings', 'seat', 'metal', u, y + 0.934, v, 0.238, 0.038, 0.238);
    }
  }

  function table(x, y, z, angle = 0, shade = false) {
    const layer = 'Riverwalk café seating';
    instance(layer, 'post', 'darkMetal', x, y + 0.39, z, 0.08, 0.77, 0.08);
    instance(layer, 'seat', 'paleWood', x, y + 0.795, z, 0.6, 0.052, 0.6);
    for (let seat = 0; seat < 4; seat++) {
      const phi = angle + Math.PI * 0.5 * seat;
      const a = x + Math.sin(phi) * 0.91, b = z + Math.cos(phi) * 0.91;
      instance(layer, 'post', 'darkMetal', a, y + 0.23, b, 0.068, 0.46, 0.068);
      instance(layer, 'seat', 'wood', a, y + 0.48, b, 0.263, 0.061, 0.263);
      instance(layer, 'box', 'darkMetal', a + Math.sin(phi) * 0.22, y + 0.635, b + Math.cos(phi) * 0.22,
        0.395, 0.36, 0.047, phi);
    }
    if (shade) {
      instance(layer, 'post', 'darkMetal', x, y + 1.48, z, 0.065, 2.9, 0.065);
      instance(layer, 'umbrella', 'creamCloth', x, y + 2.63, z, 1.43, 1, 1.43, angle);
    }
  }

  function finish() {
    const painted = new Map();
    for (const entry of batches.values()) {
      const { layer, shape, material, matrices, color } = entry;
      const key = `${material} ${color ?? ''}`;
      if (!painted.has(key)) {
        const paint = color === undefined ? materials[material] : materials[material].clone();
        if (color !== undefined) paint.color.setHex(color);
        painted.set(key, paint);
      }
      const mesh = new THREE.InstancedMesh(geometry[shape], painted.get(key), matrices.length);
      mesh.name = layer;
      matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = !['blades', 'flowers', 'aggregate'].includes(material);
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      group.add(mesh);
    }
    return group;
  }

  const scale = 0.63;
  const point = ([x, z]) => [(x - 398) * scale, (z - 340) * scale];
  const trace = (points) => points.map(point);
  const bankPoints = trace([
    [522, 111], [522.5, 195], [523, 304], [523, 502], [533, 521], [544, 542], [556, 564],
    [569, 588], [581, 611], [596, 633], [608, 646], [628, 661], [647, 679], [669, 698],
    [694, 719], [727, 747], [767, 775], [800, 808], [829, 845], [854, 884], [879, 924], [906, 985],
  ]);
  const bank = alignment(bankPoints);
  const fullLength = bank.length;
  const parkEnd = bank.depths[13];
  const walk = 'Continuous lower Riverwalk';
  const waterEdge = 'River retaining structure';
  const north = 'Chicago Avenue entry plaza';
  const park = 'Terraced riverfront park';
  const roads = 'Jefferson Street and porte-cochères';
  const plazaElevation = 0.015;
  const walkElevation = -1.71;

  function subAlignment(line, start, end, offset = 0) {
    const distances = [start, ...line.depths.filter((p) => p > start && p < end), end];
    return distances.map((distance) => line.at(distance, offset).slice(0, 2));
  }

  // Reserve the western blocks and the area on either side of Ohio Street for subsequent phases.
  const shoreGrade = [
    ...trace([[419, 112], [445, 122], [456, 136], [483, 164], [501, 191], [501, 207], [512, 224]]),
    ...subAlignment(bank, 74, fullLength, 6.65),
  ];
  const propertyWest = trace([
    [118, 139], [141, 122], [274, 114], [398, 112], [522, 111], [906, 985], [724, 1004], [552, 1008],
    [551, 862], [512, 812], [484, 812], [458, 778], [484, 777], [386, 653], [447, 642],
    [422, 604], [354, 616], [111, 618], [114, 363],
  ]);
  // (In the cab-ride film this slab is left out: the film has its own ground and streets there. site.userData.grade
  // brings it back.)
  if (site.userData && site.userData.grade) slab('Resort grade and future parcels', [
    ...propertyWest.slice(0, 4), ...shoreGrade, ...propertyWest.slice(6),
  ], -0.22, 'reserved');

  // Connect the street entrances via a raised interior forecourt and the lower waterside walk.
  const civicPad = trace([
    [307, 111], [424, 111], [446, 121], [462, 145], [490, 176], [516, 210],
    [514, 496], [508, 504], [529, 543], [549, 588], [564, 614], [566, 639], [550, 651],
    [526, 629], [503, 608], [479, 589], [453, 566], [428, 539], [393, 491], [357, 447],
    [337, 416], [308, 381], [305, 318],
  ]);
  slab('Resort entrance and upper aprons', civicPad, -0.095, 'pavingCool');
  ribbon(walk, bankPoints, 0.17, 7.03, walkElevation, 'paving', 0.16, 'sideStone');
  for (const [start, end] of [[74, 356], [361, 394], [399, parkEnd]]) {
    const retainingAlignment = subAlignment(bank, start, end);
    ribbon('Upper riverwalk retaining edge', retainingAlignment, 6.64, 7.03, walkElevation + 0.76,
      'sideStone', 1.5, 'sideStone');
    ribbon('Upper planting terrace stemwall', retainingAlignment, 6.93, 7.32, -0.207, 'lightStone', 0.82, 'sideStone');
  }
  ribbon('Riverwalk to Grand Avenue', subAlignment(bank, parkEnd, fullLength), 1.07, 5.8,
    walkElevation + 0.021, 'pavingCool');
  const grandRampStart = fullLength - 30.2;
  const grandRampEnd = fullLength - 5.8;
  const grandRamp = subAlignment(bank, grandRampStart, grandRampEnd, 4.92);
  const rampPath = alignment(grandRamp);
  const rampDeck = new THREE.BufferGeometry();
  const rampCoordinates = [];
  const rampUvs = [];
  const rampIndices = [];
  for (const [index, distance] of rampPath.depths.entries()) {
    const y = walkElevation + 1.735 * (distance / rampPath.length) + 0.025;
    for (const side of [-1.36, 1.36]) {
      const [x, z] = rampPath.at(distance, side);
      rampCoordinates.push(x, y, z);
      rampUvs.push(x / 11, z / 11);
    }
    if (index > 0) rampIndices.push(index * 2 - 2, index * 2 - 1, index * 2, index * 2 - 1, index * 2 + 1, index * 2);
  }
  rampDeck.setAttribute('position', new THREE.Float32BufferAttribute(rampCoordinates, 3));
  rampDeck.setAttribute('uv', new THREE.Float32BufferAttribute(rampUvs, 2));
  rampDeck.setIndex(rampIndices);
  rampDeck.computeVertexNormals();
  const grandConnector = new THREE.Mesh(rampDeck, materials.pavingCool);
  grandConnector.name = 'Riverwalk ramp to Grand Avenue';
  grandConnector.receiveShadow = true;
  group.add(grandConnector);
  for (const side of [-1.36, 1.36]) {
    for (let i = 0; i < rampPath.length; i += 2.4) {
      const [ax, az] = rampPath.at(i, side);
      const [bx, bz] = rampPath.at(i + 2.4, side);
      const aBase = walkElevation + 0.025 + i * 1.735 / rampPath.length;
      const bBase = walkElevation + 0.025 + Math.min(i + 2.4, rampPath.length) * 1.735 / rampPath.length;
      instance(grandConnector.name, 'post', 'metal', ax, aBase + 0.51, az, 0.056, 1.02, 0.056);
      link(grandConnector.name, 'post', 'steel', [ax, aBase + 1.02, az], [bx, bBase + 1.02, bz], 0.06);
    }
  }
  const grandRampTip = grandRamp[grandRamp.length - 1];
  ribbon('Connection to Grand Avenue sidewalk', [grandRampTip, [grandRampTip[0] - 1.7, 404.7]], -1.38, 1.38, 0.056, 'pavingCool', 0.22, 'sideStone');
  ribbon(waterEdge, bankPoints, -0.09, 0.26, walkElevation - 0.17, 'corten', 2.84, 'corten');
  ribbon(waterEdge, bankPoints, -0.23, 0.92, walkElevation + 0.027, 'sideStone', 0.18, 'sideStone');
  for (let s = 0.55; s < fullLength; s += 0.74) {
    const [x, z, angle] = bank.at(s, -0.17);
    instance(waterEdge, 'box', 'pileRib', x, walkElevation - 1.48, z, 0.26, 2.66, 0.18, -angle);
  }
  const dockGap = [70, 89];
  rail(bank, 0.6, dockGap[0], 0.52, walkElevation);
  rail(bank, dockGap[0], 76.85, 0.52, walkElevation);
  rail(bank, 79.5, dockGap[1], 0.52, walkElevation);
  rail(bank, dockGap[1], fullLength - 1.4, 0.52, walkElevation);
  const paverColors = [0xbcb39f, 0xc6beac, 0xd0c5af, 0xc4b9a2, 0xb5ae9e];
  for (let s = 1.5; s < parkEnd - 1; s += 2.75) {
    const a = bank.at(s, 1.05), b = bank.at(s, 6.96);
    edge('Stone paver joints', 'paverJoint', a, b, walkElevation + 0.008, 0.022, 0.009);
    if (Math.floor(s) % 7 < 4) {
      const c = bank.at(s + 1.35, between(1.45, 6.4));
      instance('Stone inlays', 'box', 'aggregate', c[0], walkElevation + 0.006, c[1], 2.69, 0.01, 0.72, -c[2], pick(paverColors));
    }
  }
  for (let s = 15; s < parkEnd; s += 17.2) {
    const p = bank.at(s, 5.68), light = bank.at(s + 3.95, 6.26);
    if (s > 64 && s < 98) continue;
    bench(p[0], walkElevation, p[1], -p[2]);
    yardLight(light[0], walkElevation, light[1], p[2] - Math.PI / 2, 4.1);
    if (Math.floor(s) % 3 === 0) bins(p[0], walkElevation, p[1] + 2.15, p[2]);
  }
  for (let s = 15; s < parkEnd - 6; s += 2.4) {
    const [x, z] = bank.at(s, between(6.48, 6.88));
    tuft(x, walkElevation, z, between(0.62, 0.95), true);
  }

  // Color shifts in the banded stone distinguish the larger gathering space at Chicago Avenue.
  const northPlaza = trace([
    [419, 112], [522, 111], [522, 211], [513, 224], [501, 207], [501, 191],
    [483, 164], [456, 136], [445, 122],
  ]);
  slab(north, northPlaza, walkElevation + 0.035, 'paving');
  for (let index = 0; index < 7; index++) {
    const rise = index * 0.25;
    const lead = 511 - index * 6.2;
    const tail = 190 - index * 9.1;
    const terrace = trace([
      [419, 112], [lead + 5, 111.9], [lead + 0.5, Math.max(122, tail - 28)],
      [lead - 5.2, Math.max(125, tail - 21)], [lead - 6, Math.max(127, tail - 9)],
      [lead - 10, Math.max(129, tail)], [lead - 14, Math.max(128, tail + 5)],
      [450 - index * 1.9, 130 - index * 2],
    ]);
    slab(north, terrace, walkElevation + 0.19 + rise, index % 2 ? 'lightStone' : 'paving', 0.24, 'sideStone');
  }
  const northGarden = trace([[446, 112], [501, 112], [505, 124], [503, 139], [497, 147], [488, 151], [476, 146], [466, 138], [449, 131]]);
  slab('North entry perennial gardens', northGarden, plazaElevation + 0.05, 'rainGarden', 0.11, 'sideStone');
  groundcover('North entry perennial gardens', northGarden, plazaElevation + 0.053, 1.9);
  for (const [x, z, h] of [[456, 117, 5.8], [469, 122, 7.0], [493, 118, 6.5], [490, 140, 5.8]]) {
    const p = point([x, z]);
    tree(p[0], plazaElevation, p[1], h, 0.34);
  }
  for (const [x, z, h] of [[511, 140, -1.22], [505, 158, -1.45], [514, 177, -1.42], [507, 195, -1.66]]) {
    const p = point([x, z]);
    const rootBed = [[p[0] - 1.35, p[1] - 1.4], [p[0] + 1.32, p[1] - 1.05], [p[0] + 1.05, p[1] + 1.34], [p[0] - 1.1, p[1] + 1.5]];
    slab('North plaza shade beds', rootBed, h + 0.115, 'rainGarden', 0.23, 'lightStone');
    tree(p[0], h + 0.12, p[1], between(4.8, 5.8), 0.31);
  }
  for (let z = -142; z < -100; z += 1.65) {
    for (let x = 39; x < 77; x += 1.55) {
      const y = walkElevation + 0.041;
      if (!boundary(northPlaza, x, z) || random() > 0.2) continue;
      instance('North plaza stone pattern', 'box', 'aggregate', x, y, z, 1.49, 0.008, 1.59, 0, pick(paverColors));
    }
  }

  // Water taxi landing near the northern food hall, approached by a hinged gangway.
  const landing = 'Water taxi landing';
  const dockAt = bank.at((dockGap[0] + dockGap[1]) * 0.5, -4.1);
  const dockY = -3.19;
  const deckAngle = -dockAt[2];
  instance(landing, 'box', 'darkMetal', dockAt[0], dockY - 0.23, dockAt[1], 21.1, 0.58, 3.65, deckAngle);
  for (let i = -10.45; i < 10.55; i += 0.23) {
    const along = bank.at((dockGap[0] + dockGap[1]) / 2 + i, -4.1);
    instance(landing, 'box', 'paleWood', along[0], dockY + 0.072, along[1], 0.214, 0.1, 3.61, deckAngle);
  }
  const stepOn = bank.at(78, 0.42), stepOff = bank.at(83.7, -3.0);
  const rampDelta = [stepOff[0] - stepOn[0], dockY - walkElevation + 0.14, stepOff[1] - stepOn[1]];
  const rampLength = Math.hypot(...rampDelta);
  const yaw = Math.atan2(rampDelta[0], rampDelta[2]);
  object.position.set((stepOn[0] + stepOff[0]) / 2, (walkElevation + dockY + 0.14) / 2, (stepOn[1] + stepOff[1]) / 2);
  object.rotation.set(0, yaw, 0);
  object.rotateX(-Math.asin(rampDelta[1] / rampLength));
  object.scale.set(1.53, 0.14, rampLength);
  queue(landing, 'box', 'steel');
  for (const side of [-0.7, 0.7]) {
    const xShift = side * Math.cos(yaw), zShift = -side * Math.sin(yaw);
    const ends = [
      [stepOn[0] + xShift, walkElevation, stepOn[1] + zShift],
      [stepOff[0] + xShift, dockY + 0.14, stepOff[1] + zShift],
    ];
    link(landing, 'post', 'steel', ends[0].map((p, axis) => p + (axis === 1 ? 1.06 : 0)),
      ends[1].map((p, axis) => p + (axis === 1 ? 1.06 : 0)), 0.067);
    for (const step of [0.13, 0.5, 0.86]) {
      const pos = ends[0].map((a, k) => a * (1 - step) + ends[1][k] * step);
      instance(landing, 'post', 'metal', pos[0], pos[1] + 0.53, pos[2], 0.059, 1.07, 0.059);
    }
  }
  for (const s of [69.8, 89.2]) {
    for (const offset of [-1.91, -6.12]) {
      const [x, z] = bank.at(s, offset);
      instance(landing, 'post', 'darkMetal', x, -3.34, z, 0.23, 3.3, 0.23);
      instance(landing, 'post', 'steel', x, -1.68, z, 0.19, 0.064, 0.19);
    }
  }
  for (let s = 84; s <= 118; s += 8.8) {
    const [x, z, theta] = bank.at(s, 3.5);
    table(x, walkElevation, z, theta, s > 93);
  }
  const waterTaxiSign = bank.at(70.35, 1.42);
  instance(landing, 'box', 'darkMetal', waterTaxiSign[0], walkElevation + 0.99, waterTaxiSign[1], 0.095, 1.99, 0.099);
  instance(landing, 'box', 'glazing', waterTaxiSign[0], walkElevation + 1.95, waterTaxiSign[1], 0.12, 0.38, 0.64);

  // Floating native plantings at the surviving bend and river abutment.
  for (const [s, offset, length, width] of [[275, -2.1, 10.5, 2.3], [293, -2.8, 13.8, 3.2], [322, -3.35, 12.1, 2.9], [339, -3.9, 12.4, 3.2]]) {
    const [x, z, angle] = bank.at(s, offset);
    instance('Floating wetlands', 'box', 'corten', x, -3.94, z, length, 0.25, width, -angle);
    instance('Floating wetlands', 'box', 'rainGarden', x, -3.79, z, length - 0.22, 0.11, width - 0.23, -angle);
    for (let i = 0; i < 40; i++) {
      const t = between(-length / 2, length / 2), lateral = between(-width / 2, width / 2);
      const px = x + Math.cos(angle) * t - Math.sin(angle) * lateral;
      const pz = z + Math.sin(angle) * t + Math.cos(angle) * lateral;
      tuft(px, -3.72, pz, between(0.95, 1.85), true);
    }
  }
  const abutment = bank.at(329, -1.08);
  instance('Existing bridge abutment', 'box', 'sideStone', abutment[0], -2.39, abutment[1], 6.15, 2.9, 3.15, -abutment[2]);
  instance('Existing bridge abutment', 'box', 'darkStone', abutment[0], -0.925, abutment[1], 6.24, 0.15, 3.21, -abutment[2]);

  // A broad park descends in planted terraces, with separate upper and waterside paths.
  const parkOutline = trace([[526, 609], [553, 609], [576, 626], [588, 648], [610, 664], [632, 682], [651, 703],
    [649, 720], [628, 728], [604, 720], [585, 711], [564, 694], [544, 674], [528, 655], [516, 631]]);
  slab(park, parkOutline, -0.07, 'grass', 1.52, 'sideStone');
  const lowerPark = trace([[550, 613], [571, 626], [590, 648], [605, 662], [624, 678], [643, 693], [650, 706],
    [645, 716], [630, 716], [610, 702], [590, 683], [578, 667], [565, 651], [553, 636], [546, 623]]);
  slab('Park lower terrace', lowerPark, 0.078, 'meadow', 0.24, 'sideStone');
  const middlePark = trace([[533, 619], [553, 625], [568, 643], [588, 672], [603, 693], [622, 710],
    [626, 721], [614, 721], [595, 712], [579, 696], [563, 677], [547, 661], [535, 638]]);
  slab('Park middle terrace', middlePark, 0.49, 'warmGrass', 0.45, 'sideStone');
  const upperPark = trace([[521, 626], [533, 629], [549, 648], [563, 667], [578, 693], [591, 710],
    [597, 722], [585, 714], [569, 703], [554, 688], [541, 672], [530, 651]]);
  slab('Park upper terrace', upperPark, 0.92, 'roughGrass', 0.48, 'darkStone');
  const lawn = trace([[577, 638], [587, 646], [609, 666], [625, 678], [642, 696], [649, 704],
    [645, 713], [635, 716], [623, 709], [608, 696], [595, 682], [584, 662], [575, 648]]);
  slab('Open lawn', lawn, 0.092, 'grass');
  const middlePath = trace([[531, 624], [544, 634], [556, 648], [568, 665], [580, 680], [590, 690],
    [602, 700], [614, 710], [624, 714], [634, 715]]);
  ribbon('Park garden walk', middlePath, -1.06, 1.12, 0.538, 'path', 0.08, 'sideStone');
  const upperPath = trace([[516, 621], [526, 637], [538, 654], [549, 669], [562, 685], [580, 707], [592, 718]]);
  ribbon('Park upper walk', upperPath, -1.05, 1.07, 0.955, 'path', 0.14, 'sideStone');
  const lowerPath = trace([[567, 610], [575, 624], [591, 644], [613, 664], [633, 677], [647, 695], [654, 711]]);
  ribbon('Park sweeping lower path', lowerPath, -0.96, 0.99, 0.125, 'path', 0.12, 'sideStone');
  const parkLowerSpurs = [
    [[551, 622], [563, 626], [576, 641], [585, 651]],
    [[602, 699], [612, 692], [626, 682]],
  ];
  parkLowerSpurs.forEach((spur) => ribbon('Path across open lawn', trace(spur), -0.86, 0.86, 0.126, 'path'));
  groundcover('Park low prairie beds', lowerPark, 0.087, 0.9, [middlePark, lawn]);
  groundcover('Park middle prairie beds', middlePark, 0.5, 1.45, [upperPark]);
  groundcover('Park upper prairie beds', upperPark, 0.929, 1.2);

  function stair(layer, start, end, base, top, size, count) {
    const line = alignment([start, end]);
    for (let i = 0; i < count; i++) {
      const [x, z, angle] = line.at(line.length * (i + 0.5) / count);
      const height = (top - base) * (i + 1) / count;
      instance(layer, 'box', i % 4 === 0 ? 'lightStone' : 'paving', x, base + height / 2, z,
        line.length / count + 0.015, height, size, -angle);
    }
    for (const offset of [-size * 0.44, size * 0.44]) {
      const a = line.at(0, offset), b = line.at(line.length, offset);
      link(layer, 'post', 'metal', [a[0], base + 1, a[1]], [b[0], top + 1, b[1]], 0.061);
      for (let j = 0; j <= 3; j++) {
        const p = line.at(line.length * j / 3, offset);
        const y = base + (top - base) * j / 3;
        instance(layer, 'post', 'metal', p[0], y + 0.51, p[1], 0.062, 1.01, 0.062);
      }
    }
  }
  stair('Riverfront park steps', point([611, 653]), point([604, 661]), walkElevation, 0.128, 3.45, 12);
  stair('Riverfront park steps', point([657, 693]), point([647, 697]), walkElevation, 0.127, 3.87, 12);
  stair('Riverfront park steps', point([577, 664]), point([570, 666]), 0.127, 0.545, 2.6, 3);
  stair('Riverfront park steps', point([567, 667]), point([561, 673]), 0.544, 0.964, 2.2, 3);
  stair('Chicago Avenue access steps', point([516, 130]), point([507, 112]), walkElevation, plazaElevation, 3.32, 10);

  const parkTrees = [
    [546, 614, -0.029, 5.3], [558, 620, -0.03, 5.4], [551, 636, 0.495, 6.6], [553, 649, 0.928, 7.3],
    [573, 660, 0.1, 5.4], [538, 656, 0.0, 6.8], [546, 672, 0.03, 7.6], [559, 682, 0.0, 6.9],
    [567, 697, 0.0, 6.5], [576, 707, 0.0, 7.9], [590, 714, 0.504, 6.1], [602, 719, 0.499, 7.0],
    [627, 722, 0.12, 6.7], [641, 718, 0.092, 6.2], [649, 710, 0.07, 6.2], [635, 697, 0.124, 5.9],
    [588, 681, 0.51, 6.2], [621, 677, 0.13, 5.8], [604, 669, 0.17, 5.7], [570, 640, 0.17, 4.85],
  ];
  for (const [x, z, elevation, h] of parkTrees) {
    const p = point([x, z]);
    tree(p[0], elevation, p[1], h, 0.38);
  }
  for (const [x, z, y, a] of [[554, 646, 0.538, -0.68], [577, 673, 0.538, -0.87], [609, 704, 0.538, -0.77],
    [596, 653, 0.13, -0.66], [636, 682, 0.125, -0.56]]) {
    const p = point([x, z]);
    bench(p[0], y, p[1], a, 2.35);
    if (x > 575) yardLight(p[0] + 0.9, y, p[1] + 0.63, Math.PI / 2, 3.4);
  }
  const parkGardenWalk = alignment(middlePath);
  for (let i = 0; i < 82; i++) {
    const [x, z] = parkGardenWalk.at(between(2.1, parkGardenWalk.length - 1.7), between(1.31, 2.67));
    const size = between(0.23, 0.59);
    instance('Limestone blocks and boulder seats', 'boulder', 'aggregate', x, 0.37, z, size * between(0.9, 1.9), size * 0.39,
      size * 0.73, between(0, 6), pick([0xa59b83, 0xb4aa94, 0x948b77, 0xa99d85]));
  }
  // Entry frames follow the red park accents shown in the HKS public renderings.
  for (const [x, z, h, w] of [[547, 643, 3.6, 1.88], [555, 653, 4.2, 1.73], [563, 667, 2.88, 1.59]]) {
    const p = point([x, z]);
    const [dx, dz] = [w * 0.38, -w * 0.31];
    const bottom = 0.91;
    for (const sign of [-1, 1]) {
      instance('Park accent frames', 'box', 'sailRed', p[0] + dx * sign, bottom + h / 2, p[1] + dz * sign,
        0.19, h, 0.32, 0.69);
    }
    edge('Park accent frames', 'sailRed', [p[0] - dx - 0.035, p[1] - dz], [p[0] + dx + 0.035, p[1] + dz],
      bottom + h, 0.32, 0.21);
  }

  const jeffersonPoints = trace([[290, 111], [290, 221], [290, 310], [290, 347], [292, 376], [304, 403],
    [325, 431], [352, 465], [380, 500], [405, 534], [434, 573], [463, 612], [493, 650], [527, 687], [560, 725]]);
  const street = ribbon(roads, jeffersonPoints, -5.45, 5.52, -0.047, 'asphalt');
  const garageDrive = [69.28, 81.22];
  const throat = street.length - 8.75;
  const easternWalk = [subAlignment(street, 0, garageDrive[0]), subAlignment(street, garageDrive[1], throat)];
  for (const points of easternWalk) {
    ribbon('Jefferson Street sidewalks', points, -8.45, -5.45, 0.105, 'pavingCool', 0.22, 'curb');
    ribbon('Jefferson Street curbs', points, -5.61, -5.35, 0.116, 'curb', 0.23);
  }
  const westernWalk = subAlignment(street, 0, throat);
  ribbon('Jefferson Street sidewalks', westernWalk, 5.52, 8.5, 0.105, 'pavingCool', 0.22, 'curb');
  ribbon('Jefferson Street curbs', westernWalk, 5.42, 5.68, 0.116, 'curb', 0.23);
  const driveway = subAlignment(street, garageDrive[0], garageDrive[1]);
  ribbon('Garage driveway with dropped curb', driveway, -12.71, -5.38, -0.022, 'pavingCool');
  const [turnX, turnZ, turnBearing] = street.at(street.length);
  const arc = (radius, start, sweep, segments = 30) => Array.from({length: segments + 1}, (_, i) => {
    const angle = start + sweep * i / segments;
    return [turnX + Math.cos(angle) * radius, turnZ + Math.sin(angle) * radius];
  });
  const turnaround = 'Jefferson Street turnaround';
  const turnStart = turnBearing - Math.PI + 0.53;
  const turnSweep = Math.PI * 2 - 1.06;
  const pavementArc = arc(10.35, turnStart, turnSweep);
  slab(turnaround, pavementArc, -0.041, 'asphalt');
  slab(turnaround, [...arc(12.3, turnStart, turnSweep), ...pavementArc.reverse()], 0.104,
    'pavingCool', 0.22, 'curb');
  slab('Turnaround center island', arc(2.55, 0.001, Math.PI * 2 - 0.002, 21), 0.105, 'meadow', 0.28, 'curb');
  groundcover('Turnaround center island', arc(2.36, 0.001, Math.PI * 2 - 0.002, 21), 0.108, 1.12);
  ribbon('Park connection from Jefferson', [[turnX + 9.5, turnZ + 2.2], ...trace([[584, 735], [603, 733], [623, 725], [637, 721], [650, 714], [654, 711]])],
    -1.26, 1.18, 0.112, 'quietPath', 0.16, 'sideStone');
  const segments = [34, 87, 154, 196, 224, 303, 358, 398, 430];
  const central = 0.24;
  const crosswalkLocations = [60, 153.5, 271, 352, 406];
  for (let s = 2.2; s < throat - 1; s += 2.7) {
    if (crosswalkLocations.some((value) => Math.abs(value - s) < 4.6)) continue;
    const a = street.at(s, central), b = street.at(s + 1.5, central);
    edge('Street centerline', 'yellowPaint', a, b, -0.034, 0.095, 0.01);
  }
  for (const [left, right] of [[-8.42, -5.49], [5.56, 8.45]]) {
    for (let s = 3; s < throat - 1; s += 3.2) {
      if (left < 0 && s > garageDrive[0] && s < garageDrive[1]) continue;
      edge('Sidewalk joints', 'paverJoint', street.at(s, left), street.at(s, right), 0.112, 0.024, 0.009);
    }
  }
  for (const where of crosswalkLocations) {
    for (let i = -4.9; i < 5.05; i += 0.78) {
      const [x, z, bearing] = street.at(where, i);
      instance('Jefferson Street crossings', 'box', 'whitePaint', x, -0.03, z, 3.63, 0.01, 0.36, -bearing);
    }
    for (const edgeSide of [-1, 1]) {
      const [x, z, heading] = street.at(where, (5.88 + random() * 0.05) * edgeSide);
      instance('Curb ramps and tactile paving', 'box', 'paleWood', x, 0.139, z, 2.31, 0.026, 0.8, -heading);
    }
  }
  const valetPoints = trace([[292, 310], [303, 331], [325, 360], [322, 384], [327, 412], [325, 433]]);
  const hotelPoints = trace([[466, 614], [488, 624], [508, 634], [531, 653], [536, 669], [522, 680], [514, 674]]);
  ribbon('Casino arrival forecourt', valetPoints, -5.18, 5.35, -0.032, 'asphalt');
  ribbon('Casino arrival apron', valetPoints, -7.62, -5.18, 0.101, 'paving', 0.16, 'curb');
  ribbon('Hotel arrival forecourt', hotelPoints, -4.29, 3.79, -0.031, 'asphalt');
  ribbon('Hotel arrival apron', hotelPoints, -7.05, -4.29, 0.092, 'paving', 0.2, 'curb');
  const hotelIsland = trace([[506, 641], [512, 642], [524, 652], [530, 661], [526, 672], [517, 671], [501, 655], [499, 648]]);
  slab('Hotel porte-cochère planting island', hotelIsland, 0.08, 'meadow', 0.25, 'curb');
  groundcover('Hotel porte-cochère planting island', hotelIsland, 0.087, 1.65);
  for (const [x, z] of [[507, 648], [523, 660]]) {
    const p = point([x, z]);
    tree(p[0], 0.088, p[1], between(4.4, 5.9), 0.38);
  }
  const treeDistance = [7, 15, 23, 31, 39, 47, 55, 63, 71, 79, 87, 102, 112, 123, 194, 202, 210, 218, 226,
    234, 242, 250, 260, 278, 288, 298, 308, 318, 328, 339, 365, 375, 389, 400, 424, 433];
  for (const s of treeDistance) {
    const east = s > 181 && s < 264 || s > 275 && s < 326 || s > 382;
    for (const offset of (east ? [7.97, -7.98] : [7.97])) {
      if (crosswalkLocations.some((value) => Math.abs(value - s) < 2.1)) continue;
      const [x, z, angle] = street.at(s, offset);
      instance('Street tree grates', 'box', 'darkMetal', x, 0.12, z, 2.62, 0.031, 1.21, -angle);
      tree(x, 0.12, z, between(4.55, 6.85), between(0.32, 0.39), true);
    }
  }
  for (const s of segments) {
    for (const offset of s % 2 === 0 ? [-7.43] : [7.43]) {
      const [x, z, angle] = street.at(s, offset);
      yardLight(x, 0.12, z, angle + (offset > 0 ? -Math.PI / 2 : Math.PI / 2), 5.1);
    }
  }
  for (const offset of [-7.65, 7.65]) {
    const [x, z] = street.at(3.3, offset);
    const height = 5.68;
    instance('Chicago Avenue intersection signals', 'post', 'darkMetal', x, 0.108 + height / 2, z, 0.19, height, 0.19);
    const across = offset > 0 ? 2.55 : -2.55;
    link('Chicago Avenue intersection signals', 'post', 'darkMetal', [x, height, z], [x + across, height + 0.11, z], 0.105);
    instance('Chicago Avenue intersection signals', 'box', 'darkMetal', x + across, height - 0.12, z, 0.31, 0.67, 0.18);
    instance('Chicago Avenue intersection signals', 'box', 'yellowPaint', x + across, height - 0.133, z - 0.105, 0.18, 0.62, 0.078);
  }

  for (const [start, end, offset] of [[119, 151, 7.14], [170, 214, 7.05], [219, 259, 6.78], [270, 297, 7.05], [312, 341, 7.2]]) {
    for (let s = start + 1; s < end; s += 2.58) {
      const shift = offset + between(-0.4, 0.39);
      const p = bank.at(s, shift);
      tuft(p[0], -0.18, p[1], between(1, 1.56), true);
    }
    for (let s = start + 5.8; s < end; s += 9.45) {
      const p = bank.at(s, offset + 1.03);
      tree(p[0], -0.22, p[1], between(4.15, 5.8), 0.32, true);
    }
  }
  for (let s = parkEnd + 11; s < fullLength - 6; s += 16.2) {
    const [x, z] = bank.at(s, 8.8);
    if (s > bank.depths[15] && s < bank.depths[17]) continue;
    tuft(x, -0.19, z, 1.28, false);
  }

  const result = finish();
  site.add(result);
  return result;
}
