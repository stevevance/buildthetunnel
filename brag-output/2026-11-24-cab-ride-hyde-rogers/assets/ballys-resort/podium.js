// Exteriors based on the revised HKS scheme and subsequent published renderings.
export function buildPodium(THREE, site) {
  const building = new THREE.Group();
  building.name = 'Casino podium, theater and dining terraces';
  site.add(building);

  const material = (color, roughness = 0.75, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const materials = {
    base: material(0x7b7971),
    pale: material(0xc2b9aa),
    edge: material(0xd4ccbf, 0.52, 0.08),
    brightEdge: material(0xe0d9ca, 0.42, 0.15),
    paleShade: material(0xa69e91, 0.78),
    roof: material(0x8f9290, 0.84),
    roofDark: material(0x666c6b, 0.85),
    grate: material(0x505552, 0.55, 0.2),
    dark: material(0x3f4343, 0.64, 0.12),
    mullion: material(0x454a4b, 0.46, 0.34),
    reflective: material(0x7c9093, 0.34, 0.27),
    handrail: material(0x646e70, 0.44, 0.42),
    bronze: material(0x8f7560, 0.53, 0.28),
    copper: material(0xb38262, 0.51, 0.24),
    soffit: material(0xb18a64, 0.68),
    soffitDark: material(0x755638, 0.76),
    paving: material(0xb0a79b),
    paverSeam: material(0x898276),
    wood: material(0x895d42),
    umbrella: material(0xe5d3bc),
    umbrellaRed: material(0xb25a49),
    soil: material(0x6b654b),
    grass: material(0x687650),
    ribbonStone: material(0xb8b6ac, 0.57, 0.09),
    ribbonPlanting: material(0x60764a, 0.9),
    ribbonSoffit: material(0x956a4a, 0.63, 0.12),
    curtainWall: material(0x6f929b, 0.29, 0.28),
    light: material(0xffdfa2, 0.55, 0, { emissive: 0xffbb69, emissiveIntensity: 0.34 }),
    railGlass: material(0x9bb9ba, 0.27, 0.1, { transparent: true, opacity: 0.48, depthWrite: false }),
  };
  const precast = [0xbab4a9, 0xaea99c, 0xc7c0b4, 0xb5aea1, 0xbeb7ad, 0xd0c8bb]
    .map(color => material(color, 0.76));
  const glass = [0x79979c, 0x719198, 0x698890, 0x668791, 0x86a1a3, 0x586f76]
    .map(color => material(color, 0.32, 0.24));
  const litGlass = [0xaf987e, 0xc3a791, 0x958a79, 0xbb9273, 0xa9a195]
    .map(color => material(color, 0.42, 0.13, { emissive: 0xe5a36c, emissiveIntensity: 0.045 }));
  const vegetation = [0x6e7b4f, 0x69764d, 0x80875a, 0x576746, 0x8d8961, 0x737d55]
    .map(color => material(color));

  const mix = (a, b, t) => a + (b - a) * t;
  const blend = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
  const rootGeometry = {
    box: new THREE.BoxGeometry(1, 1, 1),
    round: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
    parasol: new THREE.ConeGeometry(0.5, 1, 8),
    foliage: new THREE.IcosahedronGeometry(0.5, 1),
  };
  const batches = new Map();
  const transform = new THREE.Object3D();

  function addPart(partMaterial, x, y, z, width, height, depth, angle = 0, shape = 'box') {
    const key = `${partMaterial.id}-${shape}`;
    if (!batches.has(key)) batches.set(key, { partMaterial, shape, matrices: [] });
    transform.position.set(x, y, z);
    transform.scale.set(width, height, depth);
    transform.rotation.set(0, angle, 0);
    transform.updateMatrix();
    batches.get(key).matrices.push(transform.matrix.clone());
  }

  function horizontalLine(partMaterial, a, b, height, thickness, depth = thickness) {
    const run = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const rotation = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    addPart(partMaterial, (a[0] + b[0]) / 2, height, (a[1] + b[1]) / 2,
      run, thickness, depth, rotation);
  }

  function flushParts() {
    for (const { partMaterial, shape, matrices } of batches.values()) {
      const mesh = new THREE.InstancedMesh(rootGeometry[shape], partMaterial, matrices.length);
      matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
      mesh.castShadow = !partMaterial.transparent && shape !== 'foliage';
      mesh.receiveShadow = !partMaterial.transparent;
      building.add(mesh);
    }
  }

  function rounded(points, radius = 7) {
    const ring = [];
    for (let index = 0; index < points.length; index++) {
      const corner = points[index];
      const before = points[(index + points.length - 1) % points.length];
      const after = points[(index + 1) % points.length];
      const first = blend(corner, before, Math.min(0.45, radius / Math.hypot(before[0] - corner[0], before[1] - corner[1])));
      const last = blend(corner, after, Math.min(0.45, radius / Math.hypot(after[0] - corner[0], after[1] - corner[1])));
      for (let step = 0; step <= 7; step++) {
        const t = step / 7;
        ring.push(blend(blend(first, corner, t), blend(corner, last, t), t));
      }
    }
    return ring;
  }

  function offset(points, metres) {
    return points.map((point, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      const next = points[(index + 1) % points.length];
      const beforeLength = Math.hypot(point[0] - previous[0], point[1] - previous[1]);
      const afterLength = Math.hypot(next[0] - point[0], next[1] - point[1]);
      const before = [(point[1] - previous[1]) / beforeLength, (previous[0] - point[0]) / beforeLength];
      const after = [(next[1] - point[1]) / afterLength, (point[0] - next[0]) / afterLength];
      const scale = metres / (1 + before[0] * after[0] + before[1] * after[1]);
      return [point[0] + (before[0] + after[0]) * scale, point[1] + (before[1] + after[1]) * scale];
    });
  }

  function surface(vertices, triangles, partMaterial, name) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(triangles);
    geometry.computeVertexNormals();
    const shell = new THREE.Mesh(geometry, partMaterial);
    shell.name = name;
    shell.castShadow = true;
    shell.receiveShadow = true;
    building.add(shell);
    return shell;
  }

  function face(points, elevation, faceMaterial, name, upward = true) {
    const sh = points.map(([x, z]) => new THREE.Vector2(x, z));
    const triangles = THREE.ShapeUtils.triangulateShape(sh, []);
    // Triangulation is counterclockwise in x-z, which is downward in the scene.
    return surface(points.flatMap(([x, z]) => [x, elevation, z]),
      triangles.flatMap(([a, b, c]) => upward ? [a, c, b] : [a, b, c]), faceMaterial, name);
  }

  function loft(lower, bottom, upper, top, sideMaterial, name) {
    const vertices = [];
    const triangles = [];
    for (let index = 0; index < lower.length; index++) {
      const a = lower[index];
      const b = upper[index];
      vertices.push(a[0], typeof bottom === 'function' ? bottom(a) : bottom, a[1]);
      vertices.push(b[0], typeof top === 'function' ? top(b) : top, b[1]);
      const previous = index * 2;
      const next = ((index + 1) % lower.length) * 2;
      triangles.push(previous, previous + 1, next, next, previous + 1, next + 1);
    }
    return surface(vertices, triangles, sideMaterial, name);
  }

  function slab(ring, bottom, top, sideMaterial, capMaterial, name) {
    loft(ring, bottom, ring, top, sideMaterial, name);
    face(ring, top, capMaterial, `${name} top`);
    face(ring, bottom, sideMaterial, `${name} underside`, false);
  }

  function positions(path, interval, visitor) {
    let travelled = 0;
    let distance = interval * 0.5;
    for (let index = 0; index < path.length - 1; index++) {
      const start = path[index];
      const end = path[index + 1];
      const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
      const angle = -Math.atan2(end[1] - start[1], end[0] - start[0]);
      const normal = [(end[1] - start[1]) / length, (start[0] - end[0]) / length];
      while (distance <= travelled + length) {
        const [x, z] = blend(start, end, (distance - travelled) / length);
        visitor(x, z, distance, angle, normal);
        distance += interval;
      }
      travelled += length;
    }
  }

  const loop = ring => [...ring, ring[0]];
  function facadePanels(ring, yBase, yTop, bay, chooseMaterial, project = 0.16) {
    positions(loop(ring), bay, (x, z, distance, angle, [nx, nz]) => {
      const selection = chooseMaterial(x, z, nx, nz, distance);
      if (!selection) return;
      const height = yTop - yBase;
      addPart(selection, x + nx * project, yBase + height / 2, z + nz * project,
        bay - 0.06, height, 0.22, angle);
      const [jambX, jambZ] = [x + Math.cos(angle) * (bay / 2 - 0.035), z - Math.sin(angle) * (bay / 2 - 0.035)];
      addPart(materials.mullion, jambX + nx * (project + 0.055), yBase + height / 2,
        jambZ + nz * (project + 0.055), 0.07, height + 0.04, 0.19, angle);
    });
  }

  function rail(path, height) {
    positions(path, 2.4, (x, z, distance, angle) => {
      addPart(materials.handrail, x, height + 0.55, z, 0.062, 1.1, 0.07, angle);
      addPart(materials.railGlass, x + 0.008, height + 0.55, z + 0.008, 2.34, 0.91, 0.037, angle);
    });
    for (let index = 0; index < path.length - 1; index++) {
      horizontalLine(materials.handrail, path[index], path[index + 1], height + 1.12, 0.065);
    }
  }

  let seed = 2412;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = list => list[Math.floor(random() * list.length)];

  function planter(x, y, z, width, depth, angle = 0) {
    addPart(materials.paleShade, x, y + 0.18, z, width, 0.36, depth, angle);
    addPart(materials.soil, x, y + 0.37, z, width - 0.16, 0.04, depth - 0.13, angle);
    const columns = Math.ceil(width / 0.52);
    const rows = Math.ceil(depth / 0.5);
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const dx = ((i + 0.2 + random() * 0.6) / columns - 0.5) * (width - 0.36);
        const dz = ((j + 0.2 + random() * 0.6) / rows - 0.5) * (depth - 0.3);
        const h = 0.3 + random() * 0.45;
        addPart(pick(vegetation), x + dx * Math.cos(angle) + dz * Math.sin(angle),
          y + 0.38 + h * 0.28, z - dx * Math.sin(angle) + dz * Math.cos(angle),
          0.37 + random() * 0.25, h, 0.35 + random() * 0.25, random() * 6, 'foliage');
      }
    }
  }

  function diningTable(x, height, z, umbrellaMaterial) {
    addPart(materials.wood, x, height + 0.76, z, 0.95, 0.12, 0.95, 0, 'round');
    addPart(materials.mullion, x, height + 0.41, z, 0.08, 0.75, 0.08, 0, 'round');
    for (let seat = 0; seat < 4; seat++) {
      const angle = seat * Math.PI / 2;
      const cx = x + Math.sin(angle) * 0.78;
      const cz = z + Math.cos(angle) * 0.78;
      addPart(materials.bronze, cx, height + 0.23, cz, 0.41, 0.47, 0.42, angle);
      addPart(materials.wood, cx + Math.sin(angle) * 0.17,
        height + 0.64, cz + Math.cos(angle) * 0.17, 0.41, 0.49, 0.075, angle);
    }
    if (umbrellaMaterial) {
      addPart(materials.mullion, x, height + 1.42, z, 0.068, 2.8, 0.068, 0, 'round');
      addPart(umbrellaMaterial, x, height + 2.68, z, 2.65, 0.59, 2.65, Math.PI / 8, 'parasol');
    }
  }

  function letterSign(word, x, y, z, width, height, angle, options = {}) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = Math.round(1024 * height / width);
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const size = options.script ? canvas.height * 0.74 : canvas.height * 0.59;
    ctx.font = options.script ? `italic bold ${size}px Georgia, serif` : `600 ${size}px Arial, sans-serif`;
    if (!options.script && 'letterSpacing' in ctx) ctx.letterSpacing = '12px';
    ctx.lineJoin = 'round';
    if (options.script) {
      ctx.strokeStyle = '#8f2334';
      ctx.lineWidth = 4;
      ctx.strokeText(word, 514, canvas.height * 0.54, 1000);
    }
    ctx.fillStyle = options.color ?? '#f3e9d9';
    ctx.fillText(word, 512, canvas.height * 0.51, 1000);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({
      map: texture, transparent: true, alphaTest: 0.25, toneMapped: false,
    }));
    mesh.name = `${word} sign`;
    mesh.position.set(x, y, z);
    mesh.rotation.y = angle;
    building.add(mesh);
  }

  function slopingLine(partMaterial, a, b, height, depth) {
    const [dx, dy, dz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const length = Math.hypot(dx, dy, dz);
    const angle = -Math.atan2(dz, dx);
    const pitch = Math.atan2(dy, Math.hypot(dx, dz));
    const key = `${partMaterial.id}-box`;
    if (!batches.has(key)) batches.set(key, { partMaterial, shape: 'box', matrices: [] });
    transform.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    transform.scale.set(length + 0.016, height, depth);
    transform.rotation.set(0, angle, pitch, 'YXZ');
    transform.updateMatrix();
    batches.get(key).matrices.push(transform.matrix.clone());
  }

  function canopy(path, depths, name, sideMaterial = materials.bronze) {
    const vertices = [];
    const triangles = [[], [], []];
    path.forEach(([x, y, z], index) => {
      const [dx, dz] = depths[index];
      vertices.push(x, y, z, x, y - 0.46, z, x - dx, y - 0.81, z - dz, x - dx, y - 0.16, z - dz);
      if (index === 0) return;
      const a = (index - 1) * 4;
      const b = index * 4;
      triangles[0].push(a, b, b + 3, a, b + 3, a + 3);
      triangles[1].push(a, a + 1, b + 1, a, b + 1, b);
      triangles[2].push(a + 1, a + 2, b + 2, a + 1, b + 2, b + 1);
      slopingLine(materials.light, [x, y - 0.53, z], [path[index - 1][0], path[index - 1][1] - 0.53, path[index - 1][2]], 0.047, 0.051);
    });
    surface(vertices, triangles[0], materials.roof, `${name} upper flashing`).material.side = THREE.DoubleSide;
    surface(vertices, triangles[1], sideMaterial, `${name} fascia`).material.side = THREE.DoubleSide;
    surface(vertices, triangles[2], materials.soffit, `${name} timber soffit`).material.side = THREE.DoubleSide;
  }

  function roofRibbon(path) {
    const spline = new THREE.CatmullRomCurve3(path.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const stations = spline.getSpacedPoints(Math.ceil(spline.getLength() / 2.2));
    const sections = stations.map(({ x, y, z }, index) => {
      const a = stations[Math.max(index - 1, 0)];
      const b = stations[Math.min(index + 1, stations.length - 1)];
      const run = Math.hypot(b.x - a.x, b.z - a.z);
      const nx = (b.z - a.z) / run;
      const nz = (a.x - b.x) / run;
      const plantedWidth = 6.2 + 2.0 * THREE.MathUtils.smoothstep(z, -18, 62);
      const roofDepth = 8.75 + 5.65 * THREE.MathUtils.smoothstep(z, -49, 68);
      const at = (inset, rise) => [x - inset * nx, y + rise, z - inset * nz];
      return [at(0, 0), at(-0.1, -0.28), at(0.36, -1.42), at(roofDepth, -1.1),
        at(roofDepth, 0.33), at(0.46, 0.11), at(plantedWidth - 0.43, 0.35)];
    });

    function ribbonStrip(name, first, last, finish, reverse = false) {
      const vertices = sections.flatMap(section => [...section[first], ...section[last]]);
      const triangles = [];
      for (let index = 0; index < sections.length - 1; index++) {
        const a = index * 2;
        const b = a + 2;
        triangles.push(...(reverse ? [a, a + 1, b + 1, a, b + 1, b] : [a, b, b + 1, a, b + 1, a + 1]));
      }
      return surface(vertices, triangles, finish, name);
    }

    ribbonStrip('Inclined river roof fascia', 0, 1, materials.brightEdge);
    ribbonStrip('Deep inclined river roof fascia', 1, 2, materials.ribbonStone);
    ribbonStrip('Inclined bronze soffit', 2, 3, materials.ribbonSoffit);
    ribbonStrip('River roof outer metal coping', 0, 5, materials.brightEdge, true);
    ribbonStrip('Inclined planted roof between casino and tower', 5, 6, materials.ribbonPlanting, true);
    ribbonStrip('River roof interior gravel curb', 6, 4, materials.paleShade, true);

    for (const [index, front] of [[0, true], [sections.length - 1, false]]) {
      const end = sections[index];
      surface([0, 1, 2, 3, 4].flatMap(point => end[point]),
        front ? [0, 2, 1, 0, 3, 2, 0, 4, 3] : [0, 1, 2, 0, 2, 3, 0, 3, 4],
        materials.ribbonStone, 'Inclined river roof return');
    }

    for (let index = 1; index < sections.length; index++) {
      const previous = sections[index - 1];
      const section = sections[index];
      slopingLine(materials.soffitDark, previous[2], section[2], 0.16, 0.18);
      const lightAt = ([x, y, z]) => [x - 0.33, y - 0.013, z];
      slopingLine(materials.light, lightAt(previous[2]), lightAt(section[2]), 0.048, 0.09);
      for (let row = 0; row < 3; row++) {
        const t = (row + 0.28 + 0.44 * random()) / 3;
        const p = section[5].map((value, axis) => mix(value, section[6][axis], t));
        const size = 0.5 + random() * 0.68;
        addPart(pick(vegetation), p[0], p[1] + 0.08, p[2], size, 0.21 + random() * 0.13,
          size * 1.28, random() * 3.14, 'foliage');
      }
    }
  }

  function portal({ start, end, normal, height, projection, name, scenic = false }) {
    const [nx, nz] = normal;
    const front = start.map((value, axis) => value + normal[axis] * projection);
    const other = end.map((value, axis) => value + normal[axis] * projection);
    const width = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const angle = -Math.atan2(end[1] - start[1], end[0] - start[0]);
    const insetWall = [start, end].map(([x, z]) => [x + nx * 0.25, z + nz * 0.25]);
    canopy([
      [other[0], height - 0.28, other[1]],
      [mix(other[0], front[0], 0.14), height + 0.05, mix(other[1], front[1], 0.14)],
      [mix(other[0], front[0], 0.8), height + 0.13, mix(other[1], front[1], 0.8)],
      [front[0], height - 0.5, front[1]],
    ], Array.from({ length: 4 }, () => [nx * (projection + 1.15), nz * (projection + 1.15)]), name);
    const [sx, sz] = insetWall[0];
    const [ex, ez] = insetWall[1];
    const count = Math.floor(width / 1.52);
    for (let index = 0; index < count; index++) {
      const ratio = (index + 0.5) / count;
      const x = mix(sx, ex, ratio);
      const z = mix(sz, ez, ratio);
      const panelHeight = height - 1.1;
      const ground = scenic ? -0.55 : 0;
      addPart(index % 3 === 1 ? pick(glass) : pick(litGlass), x, ground + panelHeight * 0.5,
        z, width / count - 0.055, panelHeight, 0.16, angle);
      addPart(materials.mullion, x + Math.cos(angle) * 0.74 + nx * 0.1, ground + panelHeight * 0.5,
        z - Math.sin(angle) * 0.74 + nz * 0.1, 0.068, panelHeight + 0.05, 0.13, angle);
      addPart(materials.mullion, x + nx * 0.095, ground + 3.2,
        z + nz * 0.095, width / count, 0.085, 0.15, angle);
      if (ratio > 0.26 && ratio < 0.76) {
        addPart(materials.mullion, x + nx * 0.12, ground + 1.57, z + nz * 0.12, 0.047, 3.1, 0.13, angle);
        addPart(materials.bronze, x + nx * 0.22 + Math.cos(angle) * 0.13, ground + 1.24,
          z + nz * 0.22 - Math.sin(angle) * 0.13, 0.025, 0.34, 0.035, angle);
      }
    }
    const ribs = Math.ceil(projection / 1.65);
    for (let rib = 0; rib < ribs; rib++) {
      const ratio = (rib + 0.28) / ribs;
      const [ax, az] = blend(start, front, ratio);
      const [bx, bz] = blend(end, other, ratio);
      const y = height - 0.7 - (1 - ratio) * 0.27;
      const [gx, gz] = blend([ax, az], [bx, bz], 0.08);
      const [hx, hz] = blend([bx, bz], [ax, az], 0.08);
      slopingLine(materials.soffitDark, [ax, 0.15, az], [ax, y - 1.0, az], 0.49, 0.37);
      slopingLine(materials.soffit, [ax, y - 1.0, az], [gx, y, gz], 0.42, 0.4);
      horizontalLine(materials.soffit, [gx, gz], [hx, hz], y, 0.37, 0.42);
      slopingLine(materials.soffit, [hx, y, hz], [bx, y - 1.0, bz], 0.42, 0.4);
      slopingLine(materials.soffitDark, [bx, 0.15, bz], [bx, y - 1.0, bz], 0.49, 0.37);
      horizontalLine(materials.light, [gx, gz], [hx, hz], y - 0.195, 0.034, 0.18);
      slopingLine(materials.light, [gx, y - 0.17, gz], [ax, y - 1.2, az], 0.027, 0.14);
      slopingLine(materials.light, [hx, y - 0.17, hz], [bx, y - 1.2, bz], 0.027, 0.14);
    }
    return { x: (sx + ex) / 2 + nx * 0.32, z: (sz + ez) / 2 + nz * 0.32, angle: Math.atan2(nx, nz) };
  }

  // The lower casino follows the approved river parcel and pulls inward at the parking entrance.
  const casino = rounded([
    [-52.2, -139.5], [12.6, -139.5], [24, -134], [64.5, -87], [66.5, -76],
    [66.5, -21], [62.7, -8], [62.7, 30], [67.5, 32], [67.5, 81], [60.8, 99],
    [22, 106], [-34.5, 40], [-47, 26], [-51.4, 8], [-52.2, -17],
  ], 5);
  const casinoLimestone = 12.8;
  slab(casino, -2.0, 11.93, materials.base, materials.roof, 'Casino foundation and glazing backing');
  slab(offset(casino, 0.27), -1.79, -0.96, materials.paleShade, materials.paving, 'Riverfront foundation course');
  const glazed = (x, z, nx, nz, frequency) => {
    if (nx > 0.55 || z < -131 || x < -30 && z > -31) {
      return frequency % 10.8 < 5.4 && pick([true, true, false]) ? pick(litGlass) : pick(glass);
    }
    return pick(precast);
  };
  facadePanels(casino, -0.89, 4.6, 1.69, glazed);
  facadePanels(casino, 4.8, 11.98, 2.18, (x, z, nx, nz, distance) => {
    if (nx > 0.47 || x > -32 && z < -120) return distance % 12 > 8.6 ? pick(litGlass) : pick(glass);
    return pick(precast);
  });
  for (const height of [0.03, 4.68, 7.47, 11.99]) {
    const edge = loop(offset(casino, height === 4.68 ? 0.42 : 0.31));
    for (let index = 0; index < edge.length - 1; index++) {
      horizontalLine(height === 4.68 ? materials.edge : materials.mullion,
        edge[index], edge[index + 1], height, height === 4.68 ? 0.28 : 0.071, 0.24);
    }
  }
  positions(loop(casino), 2.18, (x, z, distance, angle, [nx, nz]) => {
    if (nx < 0.47 || z < -90 || z > 75) return;
    const depth = 0.34 + (1 + Math.cos(distance * 0.12)) * 0.16;
    addPart(distance % 9 < 2.2 ? materials.copper : materials.bronze,
      x + nx * 0.45, 8.49, z + nz * 0.45, 0.18, 7.3, depth, angle);
  });
  slab(offset(casino, 0.66), 12.02, casinoLimestone, materials.edge, materials.paving, 'Main casino transfer floor');

  // The planted roof leaves the north plaza, crosses in front of the garage,
  // and rises to the amenity level where the hotel begins.
  const eave = [
    [70.3, 11.85, -75], [72.1, 10.7, -58], [73.15, 9.95, -33],
    [73.25, 10.0, -5], [73.0, 11.65, 12], [73.05, 14.45, 29],
    [73.0, 19.0, 47], [72.4, 23.9, 65], [71.65, 27.15, 81],
    [70.0, 29.05, 96], [69.85, 29.9, 111], [72.4, 30.55, 124],
    [76.05, 30.98, 135],
  ];
  function eaveHeight(z) {
    const next = eave.findIndex(point => point[2] >= z);
    if (next < 0) return eave[eave.length - 1][1];
    if (next === 0) return eave[0][1];
    const [, low, start] = eave[next - 1];
    const [, high, end] = eave[next];
    return mix(low, high, (z - start) / (end - start));
  }
  const parkingX = z => 68.3 - 3.6 * (1 - THREE.MathUtils.smoothstep(z, -72, -53));
  const screenStart = -72;
  const screenEnd = 35;
  const screenHeights = [12.8, 17.4, 22.35, 27.9, 34.0];
  const screenDepths = [0.0, -0.38, -0.72, -0.42];
  const groovePalette = [materials.paleShade, materials.paleShade, materials.bronze, materials.edge, materials.edge];
  for (let tier = 0; tier < screenHeights.length - 1; tier++) {
    const floor = screenHeights[tier] + 0.17;
    const top = screenHeights[tier + 1] - 0.17;
    for (let z = screenStart + 0.4, index = 0; z < screenEnd;) {
      const panel = 0.76 + random() * 0.71;
      const end = Math.min(z + panel - 0.035, screenEnd);
      const mid = (z + end) / 2;
      const bottom = Math.max(floor, eaveHeight(mid) - 0.9);
      if (bottom >= top) break;
      const faceX = parkingX(mid) + screenDepths[tier];
      const slope = (parkingX(end) - parkingX(z)) / (end - z);
      const angle = -Math.atan2(1, slope);
      const wetStone = ((index + tier * 2) % 11 < 3) ? precast[4] : pick(precast);
      const panelProjection = random() * 0.19;
      addPart(materials.paleShade, faceX - 0.42, (bottom + top) / 2, mid,
        end - z + 0.06, top - bottom + 0.30, 0.44, angle);
      addPart(wetStone, faceX - 0.13 + panelProjection, (bottom + top) * 0.5, mid,
        end - z, top - bottom, 0.25, angle);
      if (random() > 0.14) {
        const lineHeight = (top - bottom) * (0.53 + random() * 0.46);
        const lineBottom = random() > 0.55 ? top - lineHeight : bottom;
        addPart(pick(groovePalette), faceX + panelProjection + 0.018, lineBottom + lineHeight * 0.5,
          mid + (random() - 0.5) * 0.48, 0.025 + random() * 0.115, lineHeight, 0.08, angle);
      }
      z += panel;
      index++;
    }
    const lipY = screenHeights[tier] + 0.12;
    for (let z = screenStart; z < screenEnd; z += 2.5) {
      const end = Math.min(z + 2.5, screenEnd);
      if (lipY < eaveHeight(z) + 0.3) break;
      const lipX = point => parkingX(point) + screenDepths[tier] + 0.28;
      horizontalLine(tier === 0 ? materials.brightEdge : materials.bronze,
        [lipX(z), z], [lipX(end), end], lipY, tier > 0 ? 0.27 : 0.42, 0.52);
    }
  }

  // Above the lower river frontage, vertical bronze fins continue under the rising eave.
  for (let z = 8.8; z < 43; z += 1.48) {
    const low = 11.88;
    const high = eaveHeight(z) - 1.16;
    if (high <= low) continue;
    const x = z < 31 ? 67.4 : 67.4 - (z - 31) * 0.27;
    addPart(materials.curtainWall, x, (low + high) / 2, z, 1.43, high - low, 0.29, Math.PI / 2);
    addPart(pick([materials.bronze, materials.copper, materials.soffitDark]), x + 0.34,
      (low + high) / 2, z - 0.68, 0.116, high - low, 0.62, Math.PI / 2);
  }
  for (let z = 55; z < 126; z += 1.64) {
    const low = 20.05;
    const high = eaveHeight(z) - 1.04;
    if (high <= low) continue;
    const x = 60.0 - 0.14 * Math.max(0, z - 85) + 0.39 * Math.max(0, z - 108);
    const angle = Math.PI / 2 + (z > 108 ? 0.25 : z > 85 ? -0.14 : 0);
    addPart(z % 7 > 5.1 ? pick(litGlass) : materials.curtainWall, x, (low + high) / 2, z,
      1.66, high - low, 0.28, angle);
    addPart(materials.bronze, x + 0.19, (low + high) / 2, z - 0.78, 0.10, high - low, 0.4, angle);
  }

  // Open terraces, glazing and the inclined eave connect the casino to the hotel wing.
  const riverTerrace = rounded([[57.4, 31], [70.7, 32], [71.0, 69], [71.2, 87],
    [68.9, 102], [65.05, 106.8], [58.5, 102], [55.5, 82]], 4.2);
  slab(riverTerrace, 4.28, 5.04, materials.edge, materials.paving, 'Lower river dining terrace');
  const riverTerraceRail = [[70.37, 34], [70.54, 69], [70.78, 87], [68.35, 101.5], [64.7, 106.5]];
  rail(riverTerraceRail, 5.04);
  for (let z = 38; z < 96; z += 3.0) {
    horizontalLine(materials.paverSeam, [60.2, z], [z > 87 ? 69.9 : 70.3, z], 5.05, 0.018, 0.044);
  }
  for (let z = 40; z < 99; z += 5.3) {
    const x = z < 86 ? 69.05 : 68.2 - (z - 86) * 0.146;
    diningTable(x, 5.04, z, z % 4 < 2 ? materials.umbrella : undefined);
  }
  for (let z = 42; z < 90; z += 8.2) planter(68.0, 5.04, z - 1.35, 1.34, 0.59, Math.PI / 2);

  const southWing = rounded([[-28.3, 30], [32.1, 32], [64.5, 37], [66, 79], [61.8, 111],
    [79.9, 138], [89.7, 160], [90.2, 177.8], [67.1, 169.3], [47.1, 154.3], [28.2, 136.4],
    [13.3, 111.4], [-8.4, 86.0], [-33.4, 55.1]], 4.1);
  slab(southWing, -1.63, 9.85, materials.base, materials.roof, 'South theater and hotel podium');
  facadePanels(southWing, -1.45, 9.57, 1.69, (x, z, nx, nz, distance) => {
    if (nx > 0.52 || z > 140 || nx < -0.4 && z > 58 && z < 108) {
      return distance % 13 < 8.7 ? pick(litGlass) : pick(glass);
    }
    return pick(precast);
  });
  slab(offset(southWing, 0.47), 9.53, 10.52, materials.edge, materials.paving, 'River and hotel balcony datum');
  const wingSecond = rounded([[-23.3, 38], [25.5, 34.8], [59.1, 39], [61.5, 73.8], [59.1, 107.5],
    [76.7, 138], [85.4, 162], [71.0, 164], [49.0, 150], [27.3, 130], [8.4, 105], [-16.6, 75]], 4.6);
  slab(wingSecond, 10.52, 20.42, materials.dark, materials.roof, 'Theater upper space and hotel podium');
  facadePanels(wingSecond, 10.7, 20.1, 1.63, (x, z, nx, nz, distance) => {
    if (nx > 0.55 && z > 42 || z > 139) return distance % 8 < 4 ? pick(litGlass) : pick(glass);
    return pick(precast);
  });
  positions(loop(wingSecond), 1.32, (x, z, distance, angle, [nx, nz]) => {
    if (nx > 0.56 && z > 52 && z < 127) {
      addPart(distance % 4 < 1 ? materials.copper : materials.bronze,
        x + nx * 0.27, 15.31, z + nz * 0.27, 0.19, 9.2, 0.37, angle);
    }
  });
  slab(offset(wingSecond, 0.66), 20.05, 20.88, materials.pale, materials.paving, 'Hotel and theater second-floor terrace');

  const restaurantRoof = rounded([[-21, 41], [25.5, 36.9], [56.9, 40.8], [59.6, 82], [56.7, 111],
    [70.6, 137.9], [55.4, 143.1], [34.3, 127], [16.4, 105.4], [-9.9, 79.9], [-22, 65.1]], 6.8);
  slab(restaurantRoof, 20.88, 25.3, materials.paleShade, materials.roof, 'Event and restaurant upper enclosure');
  facadePanels(restaurantRoof, 21.0, 24.95, 1.5, (x, z, nx) => nx > 0.4 && z > 47 ? pick(glass) : pick(precast));
  slab(offset(restaurantRoof, 0.6), 24.94, 25.78, materials.edge, materials.roof, 'Theater roof and terrace edge');

  roofRibbon(eave);
  const upperTerrace = rounded([[49.7, 70], [63.5, 69], [64.0, 93], [61.3, 106], [66.4, 119.0],
    [66.4, 128.1], [52.7, 112.8], [49.7, 99.1]], 3.8);
  slab(upperTerrace, 14.42, 15.27, materials.edge, materials.paving, 'Upper river restaurant balcony');
  rail([[63.6, 73.9], [63.7, 91], [61, 106], [65.84, 119], [65.5, 126.2]], 15.27);
  for (let z = 76; z < 108; z += 6.2) {
    const x = z > 96 ? 59.7 : 61.2;
    diningTable(x, 15.27, z, null);
  }
  for (let z = 74; z < 96; z += 4.6) planter(58.3, 15.27, z, 2.9, 0.82, Math.PI / 2);

  const arrival = portal({
    start: [-51.82, -6.5], end: [-40.2, 38.6], normal: [-0.969, 0.25],
    height: 11.45, projection: 10.1, name: 'Casino porte cochère',
  });
  letterSign('Bally’s', arrival.x, 8.82, arrival.z, 13.1, 3.55, arrival.angle,
    { script: true, color: '#de3751' });

  const theaterFace = [[-30.5, 55.4], [9.8, 104.7]];
  const theaterAngle = -Math.atan2(theaterFace[1][1] - theaterFace[0][1], theaterFace[1][0] - theaterFace[0][0]);
  positions(theaterFace, 1.10, (x, z, distance) => {
    const base = 10.35 + Math.min(distance / 63, 1) * 0.72;
    const top = 25.34 - Math.max(0, (distance - 41) / 22) * 1.15;
    addPart(pick(precast), x, (base + top) / 2, z, 1.067, top - base, 0.49, theaterAngle);
    const rib = (top - base) * (0.37 + random() * 0.59);
    const ribBase = random() > 0.42 ? base : top - rib;
    addPart(pick([materials.bronze, materials.paleShade, materials.edge]), x - 0.25,
      ribBase + rib * 0.5, z + 0.20, 0.048 + random() * 0.122, rib, 0.14, theaterAngle);
  });
  horizontalLine(materials.edge, theaterFace[0], theaterFace[1], 25.31, 0.41, 1.0);
  const theaterEntry = portal({
    start: [-28.85, 57.15], end: [-8.1, 82.8], normal: [-0.778, 0.628],
    height: 10.51, projection: 5.4, name: 'Theater marquee',
  });
  addPart(materials.dark, theaterEntry.x, 4.28, theaterEntry.z, 12.85, 0.76, 0.39, theaterEntry.angle);
  addPart(materials.light, theaterEntry.x - 0.17, 3.93, theaterEntry.z + 0.135,
    12.72, 0.052, 0.12, theaterEntry.angle);
  letterSign('THEATER', theaterEntry.x - 0.177, 4.48, theaterEntry.z + 0.148, 8.7, 1.02, theaterEntry.angle);
  addPart(materials.dark, -33.45, 1.84, 62.25, 0.99, 3.65, 0.31, theaterEntry.angle);
  addPart(materials.bronze, -33.62, 2.03, 62.39, 0.78, 2.71, 0.08, theaterEntry.angle);
  letterSign('LIVE', -33.7, 2.63, 62.45, 0.69, 0.35, theaterEntry.angle);
  for (let i = 0; i < 8; i++) {
    const [x, z] = blend([-34.5, 62.7], [-12.0, 90.2], (i + 0.25) / 8);
    addPart(materials.dark, x, 0.47, z, 0.145, 0.94, 0.145, 0, 'round');
    addPart(materials.reflective, x, 0.91, z, 0.158, 0.07, 0.158, 0, 'round');
  }

  const hotelEntry = portal({
    start: [29.3, 139.5], end: [60.2, 163.0], normal: [-0.606, 0.796],
    height: 9.15, projection: 7.1, name: 'Hotel porte cochère',
  });
  letterSign('HOTEL', hotelEntry.x - 0.12, 5.8, hotelEntry.z + 0.17, 5.7, 1.04, hotelEntry.angle);

  const riverEntry = portal({
    start: [67.62, 65.4], end: [67.62, 46], normal: [1, 0],
    height: 5.1, projection: 2.45, name: 'Riverwalk casino entry', scenic: true,
  });
  letterSign('Bally’s', riverEntry.x, 3.45, riverEntry.z, 9.45, 2.31, riverEntry.angle,
    { script: true, color: '#df3450' });
  letterSign('Bally’s', 46.45, 6.55, -108.02, 13.1, 2.6, Math.atan2(47, -41),
    { script: true, color: '#df3450' });

  // Hotel-floor amenity volume and planted event roof at the base of the tower.
  const hotelAmenity = rounded([[31.1, 123.6], [49.8, 114.2], [58.6, 118.6], [91.8, 142.5],
    [92.8, 164.1], [90.0, 166.4], [72.1, 157.5], [30.6, 130.4]], 2.9);
  slab(hotelAmenity, 20.42, 31.3, materials.dark, materials.roofDark, 'Hotel amenity base and tower connection');
  facadePanels(hotelAmenity, 20.79, 30.8, 1.57, (x, z, nx, nz, distance) => {
    if (z < 127 || nx < -0.51 || nz > 0.52) return pick(glass);
    return distance % 6.6 > 2.1 ? pick(glass) : pick(precast);
  });
  slab(offset(hotelAmenity, 0.56), 30.89, 31.51, materials.edge, materials.roofDark, 'Hotel amenity roof');
  const band = loop(offset(hotelAmenity, 0.25));
  for (let i = 0; i < band.length - 1; i++) {
    horizontalLine(materials.mullion, band[i], band[i + 1], 25.69, 0.089, 0.18);
  }

  const eventGreen = rounded([[13.8, 101.3], [27.0, 97.8], [48.2, 88.8], [55.7, 93.1],
    [54.0, 110.5], [61.9, 123.4], [46.0, 128.7], [28.7, 121]], 2.4);
  slab(eventGreen, 25.68, 26.05, materials.pale, materials.grass, 'Planted roof at the event center');
  for (let k = 0; k < 17; k++) {
    const z = 93 + k * 1.62;
    const x = mix(51.7, 56.3, k / 16);
    planter(x, 26.05, z, 2.15, 0.82, -0.22);
  }

  const leisureDeck = rounded([[26.2, 104.1], [50.3, 97.4], [54.0, 111.1],
    [47.9, 117.6], [29.7, 121.7], [24.7, 113.2]], 2.25);
  slab(leisureDeck, 25.88, 26.38, materials.edge, materials.paving, 'Hotel sun deck');
  rail([[26.65, 103.8], [50.07, 97.9], [53.32, 111.0], [47.43, 117.14], [30.05, 121.11]], 26.38);
  // Bally's announced a spa and sun deck. Pool detailing is an illustrative furnishing of that amenity.
  const poolAccent = material(0x94b7be, 0.35, 0.2);
  const poolWater = material(0x438e9c, 0.17, 0.27, { emissive: 0x23505a, emissiveIntensity: 0.15 });
  const pool = rounded([[30.0, 107.1], [44.45, 103.32], [46.01, 108.91], [31.42, 112.63]], 1.2);
  slab(offset(pool, 0.66), 26.36, 26.67, materials.brightEdge, poolAccent, 'Pool coping');
  face(pool, 26.68, poolWater, 'Hotel pool water');
  for (let index = 0; index < 7; index++) {
    const t = (index + 0.45) / 7;
    const [x, z] = blend([31.18, 115.41], [46.3, 111.3], t);
    addPart(materials.wood, x, 26.53, z, 0.74, 0.29, 1.84, Math.PI * 0.085);
    addPart(materials.umbrella, x, 26.703, z, 0.63, 0.085, 1.71, Math.PI * 0.085);
    if (index % 2 === 0) {
      addPart(materials.mullion, x + 0.77, 27.73, z + 0.15, 0.063, 2.74, 0.063, 0, 'round');
      addPart(materials.umbrella, x + 0.77, 28.96, z + 0.15, 2.14, 0.5, 2.14, Math.PI / 8, 'parasol');
    }
  }

  // Low-profile service screening and standing seams on the event center roof.
  const roofPars = rounded([[-20.4, 49.4], [-6.2, 42.1], [23.6, 42.0], [32.4, 53.8],
    [31.3, 71.6], [15.0, 79.3], [-5.3, 71.7]], 2.2);
  slab(roofPars, 25.78, 26.07, materials.paleShade, materials.roof, 'Event roof parapet flashing');
  for (let row = 0; row < 3; row++) {
    for (let bay = 0; bay < 5; bay++) {
      const x = -5.7 + bay * 4.65;
      const z = 51.3 + row * 4.3;
      addPart(materials.paleShade, x, 26.44, z, 3.62, 0.72, 2.14);
      addPart(materials.grate, x, 26.823, z, 3.29, 0.055, 1.87);
      for (let slat = 0; slat < 7; slat++) {
        addPart(materials.roof, x - 1.41 + slat * 0.47, 26.864, z, 0.043, 0.040, 1.82);
      }
    }
  }
  for (let z = 43; z < 74; z += 3.3) {
    horizontalLine(materials.paleShade, [32.25, z], [53.85, z], 25.792, 0.029, 0.054);
  }

  flushParts();
  return building;
}
