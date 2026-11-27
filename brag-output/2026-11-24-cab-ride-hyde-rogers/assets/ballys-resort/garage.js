// Parking podium envelope, reconstructed from the January 2025 HKS site-plan
// sheets 2, 5, 8, 13 and exterior perspectives 15–19. Scene units are metres.
export function buildGarage(THREE, site) {
  const group = new THREE.Group();
  group.name = 'Integrated parking podium, roof and Chicago Avenue frontage';
  site.add(group);

  const material = (color, roughness = 0.72, metalness = 0, options = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...options });
  const pale = material(0xc2b9aa);
  const softWhite = material(0xd9d1c5, 0.6, 0.08);
  const darkReveal = material(0x57524a);
  const warmReveal = material(0x8f7860, 0.62, 0.22);
  const bronze = material(0xa77b58, 0.5, 0.43);
  const copper = material(0xb2815e, 0.51, 0.31);
  const shadowBronze = material(0x635246, 0.59, 0.23);
  const copperHighlight = material(0xd1a57a, 0.44, 0.31);
  const glassEdge = material(0x4f6167, 0.48, 0.24);
  const soffit = material(0x6b6056);
  const asphalt = material(0x484b4c);
  const portalDark = material(0x292b2b);
  const roofMaterial = material(0x92918a, 0.89);
  const ballast = material(0x77756a, 0.92);
  const roofSeam = material(0x8a8882);
  const plantBed = material(0x60734e, 0.97);
  const roofFootpath = material(0xa5a097);
  const plazaGlass = [0x79959d, 0x88a2a7, 0xa49783, 0x9aaca9].map((color, index) =>
    material(color, 0.26, 0.23, index === 2 ? { emissive: 0xf0ae6c, emissiveIntensity: 0.07 } : {}));
  const light = material(0xffe7bd, 0.48, 0, { emissive: 0xffca86, emissiveIntensity: 0.38 });
  const signFace = material(0xf8f1db, 0.58, 0, { emissive: 0xf3d6a5, emissiveIntensity: 0.22 });
  const precast = [0xc7c0b4, 0xcac2b7, 0xc1baaf, 0xcec6b9, 0xc4baad, 0xd3cbbf].map(color => material(color));
  const glass = [0x739098, 0x77939c, 0x819aa1, 0x66858e, 0x6e878d, 0x879ca0].map(color => material(color, 0.26, 0.34));
  const cornerMetal = [0x785e4c, 0x896851, 0x937459, 0xa17c58, 0x946a48, 0xa88a65].map(color => material(color, 0.49, 0.37));
  const lowGreen = [0x617348, 0x7b8655, 0x596947, 0x6c8055, 0x8b9064].map(color => material(color, 0.96));

  const garageRoofHeight = 34;
  const casinoDeckHeight = 12.8;
  const westX = -55.5;
  const westStart = -132;
  const westEnd = -25;
  const northZ = -142.4;
  const corner = [[westX, westStart], [-55.1, -135.3], [-53, -138], [-49.2, -140.65], [-44.8, -141.95], [-40, northZ]];
  const north = [[-40, northZ], [7, northZ], [12.4, -141.6], [17.8, -138.6], [23, -134], [64, -87], [67.5, -79], [68.3, -72]];
  const westReturn = [[-30, 35], [-30, 28], [-54, -20], [westX, westEnd]];
  const northStations = pathStations(north);
  const upperNorth = north.map((_, index) => shiftedPoint(north, index,
    -3.6 * THREE.MathUtils.smoothstep(northStations[index], 0, 24)));
  const riverRoof = [-66, -61, -56, -53, 35].map(z =>
    [68.3 - 3.6 * (1 - THREE.MathUtils.smoothstep(z, -72, -53)), z]);
  const outline = [...corner, ...upperNorth.slice(1), ...riverRoof, ...westReturn];

  const basis = {
    box: new THREE.BoxGeometry(1, 1, 1),
    tuft: new THREE.IcosahedronGeometry(0.5, 0),
  };
  const batches = new Map();
  const placement = new THREE.Object3D();
  let seed = 11551;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const pick = palette => palette[Math.floor(random() * palette.length)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixPoint = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

  function pathStations(path) {
    let distance = 0;
    return path.map(([x, z], index) => {
      if (index > 0) distance += Math.hypot(x - path[index - 1][0], z - path[index - 1][1]);
      return distance;
    });
  }

  function shiftedPoint(path, index, outset) {
    const p = path[index];
    const before = path[Math.max(index - 1, 0)];
    const after = path[Math.min(index + 1, path.length - 1)];
    const [dx, dz] = [after[0] - before[0], after[1] - before[1]];
    const distance = Math.hypot(dx, dz);
    return [p[0] + dz * outset / distance, p[1] - dx * outset / distance];
  }

  function part(finish, x, y, z, width, height, depth, angle = 0, type = 'box') {
    const key = `${finish.id}/${type}`;
    if (!batches.has(key)) batches.set(key, { finish, type, matrices: [] });
    placement.position.set(x, y, z);
    placement.rotation.set(0, angle, 0);
    placement.scale.set(width, height, depth);
    placement.updateMatrix();
    batches.get(key).matrices.push(placement.matrix.clone());
  }

  function mesh(name, positions, triangles, finish) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(triangles);
    geometry.computeVertexNormals();
    const object = new THREE.Mesh(geometry, finish);
    object.name = name;
    object.castShadow = true;
    object.receiveShadow = true;
    group.add(object);
    return object;
  }

  function flat(name, polygon, height, finish, upward = true) {
    const points = polygon.map(([x, z]) => new THREE.Vector2(x, z));
    const triangles = THREE.ShapeUtils.triangulateShape(points, []);
    return mesh(name, polygon.flatMap(([x, z]) => [x, height, z]),
      triangles.flatMap(([a, b, c]) => upward ? [a, c, b] : [a, b, c]), finish);
  }

  function position(a, b, station, outset) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [x, z] = mixPoint(a, b, station / length);
    return [x + (b[1] - a[1]) * outset / length, z - (b[0] - a[0]) * outset / length];
  }

  function band(name, path, bottom, top, finish, projection = 0) {
    const vertices = [];
    const triangles = [];
    let travelled = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const segmentCount = Math.ceil(length / 2.6);
      for (let j = 0; j < segmentCount; j++) {
        const corners = [];
        for (const distance of [j * length / segmentCount, (j + 1) * length / segmentCount]) {
          const [x, z] = position(a, b, distance, projection);
          const p = distance + travelled;
          corners.push(x, typeof bottom === 'function' ? bottom(p) : bottom, z,
            x, typeof top === 'function' ? top(p) : top, z);
        }
        const start = vertices.length / 3;
        vertices.push(...corners);
        triangles.push(start, start + 1, start + 2, start + 2, start + 1, start + 3);
      }
      travelled += length;
    }
    return mesh(name, vertices, triangles, finish);
  }

  function panels(path, bottom, top, bay, callback) {
    let travelled = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const angle = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      const count = Math.ceil(length / bay);
      const width = length / count;
      for (let j = 0; j < count; j++) {
        const station = (j + 0.5) * width;
        const offset = station + travelled;
        const y0 = typeof bottom === 'function' ? bottom(offset) : bottom;
        const y1 = typeof top === 'function' ? top(offset) : top;
        callback((finish, low, high, shift, panelWidth, projection) => {
          if (high <= low) return;
          const [x, z] = position(a, b, station + shift, projection);
          part(finish, x, (low + high) / 2, z, panelWidth, high - low, Math.abs(projection) + 0.055, angle);
        }, y0, y1, width, offset);
      }
      travelled += length;
    }
  }

  // Rounded bronze corner with the recycled vertical Tribune letters.
  band('Curved Chicago Avenue bronze corner', corner, 0.16, 34.55, shadowBronze);
  panels(corner, 0.25, 34.48, 0.72, (panel, y0, y1, width, station) => {
    panel(pick(cornerMetal), y0, y1, 0, width - 0.035, 0.065);
    panel(station % 4 < 2 ? copperHighlight : bronze, 0.7, 34.36, width * 0.44, 0.058, 0.17);
    for (let i = 5; i < y1; i += 4.75) panel(shadowBronze, i, i + 0.035, 0, width - 0.03, 0.11);
  });

  // The straight west elevation combines a slanted glazed bay with full-height
  // precast panels. Vertical reveals vary in length across the skyline pattern.
  const west = [[westX, westEnd], [westX, westStart]];
  const westAt = (z, low, high, finish, width, projection = 0.07) =>
    part(finish, westX - projection, (low + high) / 2, z, width, high - low, projection + 0.06, Math.PI / 2);
  const portalMin = -74.5;
  const portalMax = -63.5;
  const portalHead = 4.7;
  const lowerWest = [[westX, westEnd], [westX, portalMax]];
  const upperWest = [[westX, portalMin], [westX, westStart]];
  band('Jefferson Street façade wall', west, portalHead, garageRoofHeight, pale);
  band('Jefferson Street low wall south of vehicle entry', lowerWest, 0.1, portalHead, pale);
  band('Jefferson Street low wall north of vehicle entry', upperWest, 0.1, portalHead, pale);

  const diagonalTop = -105;
  const diagonalFoot = -76;
  const glazingLimit = y => lerp(diagonalFoot, diagonalTop, y / garageRoofHeight);
  for (let z = westStart + 0.52; z < westEnd; z += 0.91) {
    const width = Math.min(0.88, (westEnd - z) * 2);
    const yAtTransition = (z - diagonalFoot) * garageRoofHeight / (diagonalTop - diagonalFoot);
    const glassHeight = THREE.MathUtils.clamp(yAtTransition, 0, garageRoofHeight);
    const lower = z + width / 2 > portalMin && z - width / 2 < portalMax ? portalHead : 0.12;
    if (glassHeight > lower) {
      for (let y = lower; y <= glassHeight - 0.035; y += 3.67) {
        const end = Math.min(y + 3.62, glassHeight);
        westAt(z, y, end, pick(glass), width, 0.13);
        westAt(z, end, end + 0.045, glassEdge, width, 0.158);
      }
      westAt(z + width * 0.48, lower, glassHeight, glassEdge, 0.045, 0.168);
    }
    const solidBottom = Math.max(glassHeight, lower);
    if (solidBottom < garageRoofHeight) {
      westAt(z, solidBottom, garageRoofHeight, pick(precast), width, 0.103);
      if (random() < 0.61) {
        const height = lerp(6, 26, random());
        const low = lerp(solidBottom + 0.2, Math.max(solidBottom + 0.2, 33.8 - height), random());
        const high = Math.min(33.95, low + height);
        if (high > low) westAt(z + width * 0.4, low, high, random() < 0.6 ? darkReveal : warmReveal,
          0.038 + random() * 0.085, 0.169);
      }
    }
  }

  function diagonalRibbon(width, x, finish, name) {
    const low = 0.18;
    const high = garageRoofHeight + 0.08;
    const foot = glazingLimit(low);
    const head = glazingLimit(high);
    return mesh(name, [x, low, foot - width / 2, x, high, head - width / 2,
      x, low, foot + width / 2, x, high, head + width / 2], [0, 2, 1, 2, 3, 1], finish);
  }
  diagonalRibbon(4.3, westX - 0.227, bronze, 'Angled bronze frame across west elevation');
  diagonalRibbon(3.85, westX - 0.248, copper, 'Angled bronze frame outer surface');
  diagonalRibbon(0.09, westX - 0.268, copperHighlight, 'Angled bronze frame metallic seam');

  // Model the visible parking throat only. The dark recessed plane ends the view.
  const portalCenter = (portalMin + portalMax) / 2;
  part(portalDark, -52.82, portalHead * 0.5, portalCenter, 0.11, portalHead, portalMax - portalMin);
  part(soffit, -54.25, portalHead - 0.15, portalCenter, 2.48, 0.23, portalMax - portalMin);
  for (const z of [portalMin, portalMax]) {
    part(shadowBronze, -54.25, portalHead * 0.5, z, 2.55, portalHead, 0.32);
    part(copper, -55.69, portalHead * 0.49, z, 0.31, portalHead * 0.98, 0.35);
  }
  part(shadowBronze, -55.72, portalHead + 0.13, portalCenter, 0.42, 0.58, portalMax - portalMin + 0.5);
  part(asphalt, -55.05, 0.038, portalCenter, 4.62, 0.072, portalMax - portalMin - 0.24);
  part(roofFootpath, -54.12, 0.13, portalCenter, 2.52, 0.2, 0.4);
  for (const z of [portalCenter - 2.7, portalCenter + 2.7]) {
    part(light, -54.22, portalHead - 0.27, z, 1.98, 0.044, 0.11);
    part(signFace, -55.47, 0.085, z - 0.025, 1.05, 0.015, 0.12);
    mesh('Parking lane pavement marking', [-54.72, 0.089, z - 0.28, -54.72, 0.089, z + 0.23, -54.35, 0.089, z - 0.025], [0, 1, 2], signFace);
  }

  // The northeast parking screen stands behind the sloping green roof of the river plaza.
  const plazaHeight = t => 11.6 + 9.8 * (1 - THREE.MathUtils.smoothstep(t, 6, 105));
  const lowerRibbon = t => Math.max(plazaHeight(t) + 1.0, 17.2 + 1.6 * Math.cos(t / 46));
  const upperRibbon = t => 24.86 + 1.37 * Math.cos(t / 48);
  band('Bronze river plaza façade substrate', north, 0.08, t => plazaHeight(t) - 0.22, warmReveal, -0.06);
  panels(north, 0.22, t => plazaHeight(t) - 0.3, 1.46, (panel, y0, y1, width, station) => {
    const pictureGlazing = station > 67 && station < 121;
    const darkBay = station % 12 > 10;
    if (pictureGlazing) {
      panel(pick(plazaGlass), 3.64, y1, 0, width - 0.055, 0.23);
      panel(pick(glass), y0, 3.51, 0, width - 0.063, 0.23);
      panel(glassEdge, y0, y1, width * 0.48, 0.051, 0.32);
      panel(softWhite, 3.44, 3.7, 0, width + 0.001, 0.53);
      panel(glassEdge, 7.21, 7.28, 0, width + 0.001, 0.31);
      if (station % 8.4 < 1.55) panel(copper, y0, y1, 0, 0.16, 0.49);
    } else {
      const wallFinish = darkBay ? glassEdge : pick(cornerMetal);
      panel(wallFinish, y0, y1, 0, width - 0.05, 0.12);
      panel(pick([bronze, copper, shadowBronze]), y0, y1, -width * 0.32, 0.13, 0.36);
      panel(pick([bronze, copper, shadowBronze]), y0, y1, width * 0.12, 0.10, 0.27);
      panel(pick([bronze, copper, shadowBronze]), y0, y1, width * 0.47, 0.15, 0.43);
      if (darkBay) panel(warmReveal, 4.4, y1, 0, width - 0.14, 0.24);
    }
  });
  band('River plaza balcony glazing sill', north, t => plazaHeight(t) - 0.38, plazaHeight, bronze, 0.34);

  const ledgeSamples = [];
  for (let index = 1; index < north.length; index++) {
    const first = northStations[index - 1];
    const length = northStations[index] - first;
    const steps = Math.ceil(length / 2.2);
    for (let step = index === 1 ? 0 : 1; step <= steps; step++) {
      const t = step / steps;
      const station = first + length * t;
      const y = plazaHeight(station);
      const width = 0.58 + 2.18 * THREE.MathUtils.smoothstep(station, 4, 56);
      const edge = mixPoint(shiftedPoint(north, index - 1, width), shiftedPoint(north, index, width), t);
      const rear = mixPoint(upperNorth[index - 1], upperNorth[index], t);
      const at = (ratio, height) => {
        const [x, z] = mixPoint(edge, rear, ratio);
        return [x, y + height, z];
      };
      ledgeSamples.push([at(0, 0.12), at(0, -1.15), at(1, -0.98), at(0.09, 0.19), at(0.92, 0.29), at(1, 0.29)]);
    }
  }

  function northLedgeStrip(name, first, last, finish, reverse = false) {
    const vertices = ledgeSamples.flatMap(section => [...section[first], ...section[last]]);
    const triangles = [];
    for (let index = 0; index < ledgeSamples.length - 1; index++) {
      const a = index * 2;
      const b = a + 2;
      triangles.push(...(reverse ? [a, a + 1, b + 1, a, b + 1, b] : [a, b, b + 1, a, b + 1, a + 1]));
    }
    mesh(name, vertices, triangles, finish);
  }

  northLedgeStrip('Curved river plaza roof fascia', 0, 1, softWhite);
  northLedgeStrip('River plaza folded bronze soffit', 1, 2, bronze);
  northLedgeStrip('River plaza planted roof curb', 0, 3, softWhite, true);
  northLedgeStrip('Curved planted ledge above Chicago Avenue plaza', 3, 4, plantBed, true);
  northLedgeStrip('River plaza planted roof stone edging', 4, 5, softWhite, true);
  for (const section of ledgeSamples.slice(3)) {
    for (const base of [0.25, 0.64]) {
      const t = base + 0.15 * random();
      const [x, y, z] = section[3].map((value, axis) => lerp(value, section[4][axis], t));
      const width = lerp(0.48, 0.97, random());
      part(pick(lowGreen), x, y + 0.09, z, width, 0.19 + 0.11 * random(), width, 6 * random(), 'tuft');
    }
  }

  band('Setback north parking envelope substrate', upperNorth, plazaHeight, garageRoofHeight, pale);
  for (const [low, high, project] of [
    [plazaHeight, lowerRibbon, 0.62],
    [t => lowerRibbon(t) + 0.74, upperRibbon, 0.38],
    [t => upperRibbon(t) + 0.89, garageRoofHeight, 0.53],
  ]) {
    band('Recessed precast ribbon substrate', upperNorth, low, high, pale, project - 0.07);
    panels(upperNorth, low, high, 0.91, (panel, y0, y1, width) => {
      panel(pick(precast), y0, y1, 0, width - 0.055, project);
      if (random() < 0.52) {
        const inset = lerp(0, 0.48, random());
        const start = lerp(y0, y1, inset);
        const end = lerp(start, y1, 0.38 + random() * 0.6);
        panel(random() < 0.44 ? darkReveal : warmReveal, start, end, width * 0.45, 0.07, project + 0.06);
      }
    });
  }
  band('Lower bronze horizontal recess', upperNorth, lowerRibbon, t => lowerRibbon(t) + 0.74, bronze, 0.16);
  band('Upper bronze horizontal recess', upperNorth, upperRibbon, t => upperRibbon(t) + 0.89, bronze, 0.22);
  band('Lower ribbon edge', upperNorth, t => lowerRibbon(t) - 0.19, lowerRibbon, softWhite, 0.67);
  band('Upper ribbon edge', upperNorth, t => upperRibbon(t) - 0.16, upperRibbon, softWhite, 0.42);

  band('Parking envelope above Jefferson casino arrival', westReturn, casinoDeckHeight, garageRoofHeight, pale);
  panels(westReturn, casinoDeckHeight, garageRoofHeight, 0.88, (panel, y0, y1, width) => {
    panel(pick(precast), y0, y1, 0, width - 0.043, 0.1);
    if (random() < 0.65) {
      const low = y0 + random() * 10;
      const high = Math.min(y1, low + lerp(5, 15, random()));
      panel(pick([warmReveal, darkReveal]), low, high, width * 0.43, 0.057, 0.17);
    }
  });

  band('Parking roof south wall above event center', [[68.3, 35], [-30, 35]], 26.55, garageRoofHeight, pale);
  panels([[68.3, 35], [-30, 35]], 26.55, garageRoofHeight, 1.05, (panel, y0, y1, width) => {
    panel(pick(precast), y0, y1, 0, width - 0.045, 0.09);
  });

  // The covered garage's roof is a planted membrane and access surface.
  flat('Main roof over the covered garage decks', outline, garageRoofHeight, roofMaterial);
  band('Garage roof fascia', [...outline, outline[0]], garageRoofHeight - 0.34, garageRoofHeight + 0.52, pale);
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    part(softWhite, (a[0] + b[0]) / 2, 34.54, (a[1] + b[1]) / 2,
      Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.02, 0.14, 0.76, -Math.atan2(b[1] - a[1], b[0] - a[0]));
    const [innerA, innerB] = [position(a, b, 0.2, -0.56), position(a, b, Math.hypot(b[0] - a[0], b[1] - a[1]) - 0.2, -0.56)];
    part(ballast, (innerA[0] + innerB[0]) / 2, 34.075, (innerA[1] + innerB[1]) / 2,
      Math.hypot(innerB[0] - innerA[0], innerB[1] - innerA[1]), 0.12, 0.35, -Math.atan2(b[1] - a[1], b[0] - a[0]));
  }

  const plantRibbons = [
    [[-47,-140.3],[-31,-139.8],[5,-136.6],[13,-133.8],[19,-128.8],[59,-82.7],[62,-75],[62.8,-70.2],
      [65.3,-54],[66.2,18],[62,18],[62,-51],[58.4,-68.8],[56.3,-76.7],[16.3,-122.1],[11.3,-126.8],[-47,-130]],
    [[-52,-122],[-44,-123],[-38,-114],[-31,-104],[-27,-93],[-27,-36],[-25,-24],[-19,-13],[20,29],[6,29],
      [-21,2],[-31,-9],[-37,-22],[-39,-35],[-39,-83],[-40,-96],[-46,-108]],
    [[-1,-116],[6,-116],[13,-111],[42,-77],[47,-66],[49,-54],[49,-21],[51,-17],[57,-12],[57,-4],[49,-12],
      [44,-19],[44,28],[27,28],[27,-57],[26,-65],[19,-79],[4,-102]],
    [[-38,-102],[-31,-100],[25,-31],[25,-24],[21,-25],[-35,-92]],
  ];
  const inspectionPaths = [
    [[-49,-128],[11,-128],[17,-125],[60,-76],[60,31],[63,31],[63,-76],[18,-127],[12,-130],[-49,-130]],
    [[-27,32],[65,32],[65,29.6],[-26,29.6]],
    [[-46,-124],[24,-38],[25,-40],[-45,-126]],
  ];

  function isInside(x, z, boundary) {
    let inside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
      const [x1, z1] = boundary[i];
      const [x2, z2] = boundary[j];
      if ((z1 > z) !== (z2 > z) && x < x1 + (x2 - x1) * (z - z1) / (z2 - z1)) inside = !inside;
    }
    return inside;
  }

  for (const [index, plants] of plantRibbons.entries()) {
    flat(`Extensive green roof ribbon ${index + 1}`, plants, 34.083 + index * 0.002, plantBed);
    const minX = Math.min(...plants.map(point => point[0]));
    const maxX = Math.max(...plants.map(point => point[0]));
    const minZ = Math.min(...plants.map(point => point[1]));
    const maxZ = Math.max(...plants.map(point => point[1]));
    for (let zGrid = minZ; zGrid <= maxZ; zGrid += 1.9) {
      for (let xGrid = minX; xGrid <= maxX; xGrid += 1.9) {
        const x = xGrid + random() * 1.8;
        const z = zGrid + random() * 1.8;
        if (isInside(x, z, plants)) {
          const width = lerp(0.35, 1.24, random());
          part(pick(lowGreen), x, 34.13, z, width, lerp(0.12, 0.32, random()), width * 0.82, random() * Math.PI, 'tuft');
        }
      }
    }
  }
  for (const path of inspectionPaths) flat('Roof inspection path', path, 34.075, roofFootpath);

  // Add faint welded membrane seams only on exposed, walkable roof sections.
  for (let z = -119; z < 29; z += 8.5) {
    let start = null;
    for (let x = -55; x <= 69; x++) {
      const visible = isInside(x, z, outline) && !plantRibbons.some(plants => isInside(x, z, plants));
      if (visible && start === null) start = x;
      if (!visible && start !== null) {
        if (x - start > 3) part(roofSeam, (x + start) / 2, 34.011, z, x - start - 0.9, 0.014, 0.042);
        start = null;
      }
    }
  }

  addGarageSigns(THREE, group, signFace, portalCenter);
  for (const { finish, type, matrices } of batches.values()) {
    const packed = new THREE.InstancedMesh(basis[type], finish, matrices.length);
    packed.name = type === 'tuft' ? 'Green roof planting texture' : 'Parking envelope repeated details';
    matrices.forEach((matrix, index) => packed.setMatrixAt(index, matrix));
    packed.instanceMatrix.needsUpdate = true;
    packed.castShadow = type !== 'tuft';
    packed.receiveShadow = true;
    group.add(packed);
  }
  return group;
}

function addGarageSigns(THREE, group, finish, parkingCenter) {
  function placeLetter(character, outlines, span, [x, y, z], angle, depth) {
    const [width, contours] = outlines[character];
    const path = new THREE.ShapePath();
    for (const contour of contours) {
      for (let index = 0; index < contour.length; index += 2) {
        const letterX = (contour[index] - width / 2) * span;
        const letterY = (contour[index + 1] - 0.5) * span;
        if (index === 0) path.moveTo(letterX, letterY);
        else path.lineTo(letterX, letterY);
      }
      path.currentPath.closePath();
    }
    const geometry = new THREE.ExtrudeGeometry(path.toShapes(), { depth, bevelEnabled: false, curveSegments: 1 });
    const letter = new THREE.Mesh(geometry, finish);
    letter.position.set(x, y, z);
    letter.rotation.y = angle;
    letter.castShadow = true;
    group.add(letter);
    return letter;
  }
  const signLetters = new THREE.Group();
  signLetters.name = 'Chicago Tribune heritage lettering';
  group.add(signLetters);
  Array.from('Chicago').forEach((character, index) => {
    const letter = placeLetter(character, heritageOutlines, index === 0 ? 4.4 : 3.15,
      [-53.45, 30.4 - index * 4.12, -138.62], -2.43, 0.26);
    signLetters.add(letter);
  });
  const parking = new THREE.Group();
  parking.name = 'Public parking entry lettering';
  group.add(parking);
  let letterZ = parkingCenter - 1.83;
  for (const character of 'PARKING') {
    const span = 0.57;
    const width = parkingOutlines[character][0] * span;
    const letter = placeLetter(character, parkingOutlines, span,
      [-55.951, 5.18, letterZ + width / 2], -Math.PI / 2, 0.045);
    parking.add(letter);
    letterZ += width + 0.098;
  }
}

// Sampled vector lettering from UnifrakturMaguntia and DejaVu Sans Bold.
const heritageOutlines = {
  C: [0.8542,[[0.4594,0.1766,0.4517,0.174,0.4452,0.1736,0.4398,0.1753,0.4356,0.1792,0.4332,0.1842,0.4334,0.1893,0.4362,0.1945,0.4415,0.1997,0.4752,0.2271,0.4996,0.2525,0.5146,0.2758,0.5202,0.297,0.5194,0.3111,0.515,0.3266,0.507,0.3432,0.4954,0.3611,0.4795,0.3812,0.4585,0.4043,0.4324,0.4304,0.4012,0.4597,0.3414,0.5192,0.2988,0.5734,0.2736,0.6224,0.2656,0.666,0.2727,0.7034,0.2941,0.7402,0.3296,0.7765,0.3794,0.8122,0.3829,0.8141,0.3895,0.8179,0.3991,0.8235,0.4118,0.831,0.425,0.839,0.4362,0.846,0.4455,0.852,0.4528,0.8571,0.4553,0.8599,0.4569,0.8628,0.4576,0.8658,0.4574,0.869,0.4426,0.9087,0.4187,0.937,0.3857,0.954,0.3437,0.9597,0.2993,0.9523,0.261,0.9303,0.2286,0.8936,0.2021,0.8423,0.1824,0.7822,0.1704,0.7195,0.1659,0.6541,0.1691,0.586,0.1877,0.4725,0.22,0.3741,0.2658,0.2908,0.3251,0.2226,0.3936,0.1695,0.4668,0.1315,0.5448,0.1088,0.6274,0.1012,0.6749,0.1043,0.7236,0.1138,0.7735,0.1295,0.8245,0.1515,0.8316,0.154,0.8377,0.1542,0.8428,0.1521,0.847,0.1478,0.8493,0.1423,0.8489,0.1367,0.846,0.1309,0.8404,0.125,0.7585,0.0703,0.671,0.0312,0.5779,0.0078,0.4792,0.0,0.3821,0.01,0.2939,0.0399,0.2145,0.0898,0.1439,0.1597,0.0854,0.2391,0.0422,0.3177,0.0143,0.3954,0.0017,0.4722,0.0018,0.5785,0.0158,0.6763,0.0438,0.7656,0.0857,0.8466,0.1379,0.9137,0.1965,0.9616,0.2616,0.9904,0.3331,1.0,0.362,0.9981,0.3879,0.9923,0.4108,0.9827,0.4306,0.9692,0.4476,0.9531,0.4616,0.9354,0.4729,0.9162,0.4812,0.8955,0.484,0.8902,0.4877,0.8874,0.4923,0.8872,0.4978,0.8896,0.5263,0.9116,0.5538,0.9347,0.5802,0.9589,0.6056,0.9841,0.6169,0.9904,0.629,0.9928,0.6418,0.9913,0.6555,0.9858,0.6693,0.9785,0.6825,0.9716,0.6952,0.9651,0.7074,0.959,0.7189,0.9524,0.7317,0.9453,0.7457,0.9375,0.761,0.9292,0.7771,0.9227,0.7937,0.9201,0.8108,0.9217,0.8284,0.9272,0.8353,0.93,0.8413,0.9308,0.8464,0.9298,0.8506,0.9269,0.8534,0.923,0.8542,0.9187,0.8529,0.9142,0.8496,0.9094,0.833,0.8933,0.817,0.8781,0.8016,0.8637,0.7868,0.8502,0.7723,0.8372,0.758,0.8243,0.7439,0.8116,0.7299,0.7989,0.7269,0.796,0.7244,0.7938,0.7226,0.7924,0.7213,0.7917,0.7199,0.7911,0.7183,0.7907,0.7166,0.7904,0.7147,0.7903,0.7119,0.7906,0.709,0.7915,0.7058,0.7929,0.7025,0.795,0.6991,0.7972,0.6961,0.7991,0.6933,0.8008,0.6909,0.8022,0.6381,0.8266,0.5942,0.8439,0.5591,0.8543,0.5328,0.8578,0.5169,0.8556,0.5009,0.8504,0.4848,0.8421,0.4687,0.8307,0.4449,0.8096,0.4278,0.7887,0.4174,0.7679,0.4138,0.7474,0.4181,0.7203,0.4331,0.6906,0.4588,0.6584,0.4951,0.6237,0.5715,0.5524,0.6274,0.4888,0.6628,0.4327,0.6777,0.3843,0.6665,0.3395,0.6264,0.29,0.5574,0.2357,0.4594,0.1766]]],
  h: [0.4601,[[0.0034,0.9381,0.0007,0.9432,0.0,0.9476,0.0013,0.9515,0.0045,0.9547,0.0088,0.9567,0.013,0.9566,0.0172,0.9546,0.0214,0.9505,0.0332,0.9347,0.0438,0.9184,0.0533,0.9015,0.0615,0.884,0.0626,0.8815,0.0643,0.8798,0.0665,0.8787,0.0694,0.8784,0.0718,0.8782,0.0741,0.8789,0.0763,0.8805,0.0784,0.8829,0.0971,0.9105,0.1204,0.9348,0.1485,0.9557,0.1813,0.9733,0.2165,0.9869,0.2519,0.9957,0.2876,0.9997,0.3236,0.999,0.33,0.998,0.3346,0.9957,0.3373,0.9921,0.3383,0.9872,0.3374,0.9823,0.3347,0.979,0.3303,0.9772,0.3242,0.977,0.2955,0.9768,0.2688,0.9722,0.2439,0.9633,0.221,0.9499,0.2018,0.9308,0.1882,0.9046,0.1801,0.8711,0.1776,0.8304,0.1787,0.7042,0.179,0.7015,0.1798,0.6993,0.1813,0.6975,0.1832,0.696,0.1855,0.6951,0.1877,0.6948,0.19,0.6952,0.1922,0.6963,0.2078,0.7049,0.2233,0.714,0.2389,0.7235,0.2545,0.7335,0.2699,0.7439,0.2846,0.755,0.2988,0.7668,0.3123,0.7791,0.3216,0.7865,0.3287,0.7877,0.3335,0.7828,0.336,0.7718,0.3379,0.7617,0.3415,0.7521,0.3467,0.7431,0.3535,0.7346,0.3609,0.7265,0.3681,0.7184,0.375,0.7104,0.3817,0.7025,0.4151,0.653,0.4393,0.6016,0.4543,0.5482,0.46,0.4928,0.4542,0.4123,0.4328,0.3367,0.3959,0.2659,0.3433,0.1999,0.2844,0.1401,0.2282,0.0878,0.1747,0.043,0.124,0.0057,0.1177,0.0019,0.1123,0.0001,0.1077,0.0004,0.104,0.0026,0.1018,0.006,0.1017,0.0096,0.1037,0.0134,0.1077,0.0176,0.1475,0.0536,0.1875,0.0913,0.2277,0.1305,0.2681,0.1714,0.303,0.2193,0.3269,0.2793,0.3398,0.3515,0.3416,0.4358,0.339,0.4708,0.3345,0.5048,0.3282,0.5378,0.3199,0.5697,0.3089,0.5998,0.2941,0.6273,0.2755,0.6521,0.2531,0.6743,0.2395,0.6821,0.2235,0.6846,0.2051,0.6818,0.1844,0.6737,0.1821,0.6726,0.1806,0.6708,0.1796,0.6683,0.1793,0.6653,0.1815,0.3248,0.1838,0.3053,0.1907,0.2925,0.2021,0.2864,0.2182,0.287,0.222,0.2884,0.2256,0.2903,0.2291,0.2926,0.2323,0.2955,0.2355,0.2985,0.2388,0.3013,0.2424,0.304,0.2461,0.3065,0.2498,0.3082,0.2533,0.3086,0.2567,0.3078,0.2599,0.3056,0.2622,0.3028,0.263,0.2998,0.2622,0.2968,0.2599,0.2938,0.246,0.2788,0.2321,0.2645,0.2181,0.2507,0.2041,0.2374,0.1908,0.2241,0.1791,0.2102,0.1691,0.1957,0.1607,0.1805,0.1569,0.1754,0.1522,0.1737,0.1467,0.1754,0.1404,0.1805,0.1147,0.2058,0.088,0.2278,0.0601,0.2464,0.031,0.2616,0.0237,0.2666,0.0207,0.2714,0.0223,0.2759,0.0282,0.2802,0.044,0.2895,0.0551,0.3051,0.0617,0.3268,0.0637,0.3547,0.0626,0.7312,0.0613,0.7675,0.058,0.8004,0.0527,0.8298,0.0454,0.8558,0.0365,0.8791,0.0266,0.9006,0.0155,0.9203,0.0034,0.9381]]],
  i: [0.327,[[0.09,0.1835,0.0851,0.5605,0.0849,0.5667,0.0841,0.5723,0.0828,0.5774,0.081,0.5818,0.0731,0.5927,0.0657,0.5985,0.059,0.5992,0.0528,0.5949,0.0253,0.5667,0.0199,0.5618,0.0145,0.5598,0.0094,0.5605,0.0043,0.5639,0.0008,0.5692,0.0001,0.5754,0.0023,0.5826,0.0074,0.5907,0.0222,0.6096,0.0361,0.6286,0.0493,0.6475,0.0618,0.6664,0.0739,0.6853,0.0862,0.7041,0.0986,0.7228,0.1113,0.7414,0.117,0.7462,0.1231,0.7477,0.1297,0.7459,0.1367,0.7407,0.1511,0.7237,0.1653,0.7078,0.1793,0.6929,0.1931,0.6791,0.2083,0.6657,0.2265,0.6519,0.2476,0.6377,0.2715,0.6231,0.2778,0.6202,0.2819,0.617,0.2841,0.6136,0.2843,0.61,0.283,0.6066,0.2811,0.6041,0.2784,0.6025,0.275,0.6017,0.2663,0.5977,0.2581,0.5924,0.2505,0.5858,0.2433,0.578,0.2373,0.5682,0.233,0.5556,0.2304,0.5402,0.2296,0.5219,0.2296,0.231,0.2312,0.1993,0.2361,0.1744,0.2443,0.1563,0.2557,0.145,0.2702,0.1392,0.2832,0.1399,0.2949,0.1468,0.3052,0.1601,0.3089,0.1654,0.3129,0.1681,0.3173,0.1683,0.3221,0.166,0.3258,0.1618,0.327,0.1564,0.3256,0.1499,0.3218,0.1423,0.3116,0.1261,0.3018,0.1098,0.2924,0.0936,0.2832,0.0773,0.2743,0.0609,0.2652,0.0447,0.256,0.0284,0.2468,0.0123,0.2399,0.0045,0.2322,0.0006,0.2237,0.0004,0.2145,0.004,0.1854,0.0196,0.1602,0.0368,0.1388,0.0557,0.1213,0.0762,0.1076,0.0989,0.0978,0.1244,0.0919,0.1526,0.09,0.1835],[0.1897,1.0,0.2227,0.9954,0.2452,0.9816,0.2574,0.9586,0.2592,0.9264,0.2547,0.9078,0.2455,0.8892,0.2315,0.8705,0.2127,0.8518,0.1927,0.8354,0.1748,0.8238,0.1591,0.817,0.1457,0.815,0.134,0.8174,0.1238,0.8248,0.1151,0.837,0.1078,0.8542,0.1023,0.8734,0.0987,0.8918,0.0971,0.9095,0.0975,0.9264,0.1002,0.9416,0.1062,0.9554,0.1155,0.9679,0.1281,0.979,0.1427,0.9882,0.1578,0.9948,0.1735,0.9987,0.1897,1.0]]],
  c: [0.575,[[0.2614,0.0125,0.2592,0.023,0.2546,0.032,0.2474,0.0397,0.2378,0.0459,0.2273,0.0515,0.2177,0.0571,0.209,0.0626,0.2011,0.0682,0.1517,0.1064,0.1101,0.1485,0.0763,0.1947,0.0504,0.2449,0.0308,0.2979,0.0159,0.3524,0.0059,0.4085,0.0008,0.4661,0.0055,0.5905,0.0309,0.699,0.0769,0.7918,0.1436,0.8688,0.172,0.8922,0.2025,0.9134,0.2351,0.9323,0.2698,0.949,0.3057,0.9638,0.3421,0.9772,0.379,0.9891,0.4163,0.9996,0.4261,0.9995,0.4351,0.9956,0.4433,0.9879,0.4507,0.9764,0.5592,0.7574,0.5637,0.7454,0.5641,0.7363,0.5604,0.7301,0.5527,0.7268,0.5191,0.72,0.4871,0.7097,0.4565,0.6959,0.4275,0.6786,0.4151,0.6734,0.4038,0.6744,0.3937,0.6817,0.3848,0.6953,0.2883,0.8957,0.2828,0.9033,0.2753,0.9068,0.2661,0.9061,0.2549,0.9012,0.2271,0.8769,0.2048,0.84,0.1881,0.7906,0.177,0.7287,0.1712,0.6619,0.1705,0.5979,0.1749,0.5366,0.1844,0.4782,0.2102,0.3807,0.244,0.3024,0.2858,0.2434,0.3356,0.2036,0.3894,0.1798,0.4432,0.1688,0.497,0.1706,0.5509,0.1851,0.5574,0.1874,0.5631,0.1879,0.5681,0.1865,0.5722,0.1832,0.5747,0.1776,0.5747,0.1728,0.5724,0.1688,0.5675,0.1656,0.5304,0.1465,0.4941,0.1271,0.4588,0.1075,0.4242,0.0877,0.391,0.0675,0.3596,0.0468,0.33,0.0257,0.3022,0.0042,0.2976,0.0019,0.2919,0.0005,0.2853,0.0,0.2777,0.0005,0.2706,0.0019,0.2655,0.0044,0.2624,0.0079,0.2614,0.0125]]],
  a: [0.7795,[[0.4441,0.173,0.42,0.1546,0.3947,0.1353,0.3683,0.1152,0.3408,0.0941,0.3131,0.0731,0.2865,0.053,0.261,0.0337,0.2365,0.0152,0.2286,0.0097,0.2216,0.006,0.2154,0.0042,0.2102,0.0042,0.206,0.0059,0.2034,0.0092,0.2021,0.0142,0.2023,0.0208,0.1987,0.0326,0.188,0.0489,0.1701,0.0696,0.1451,0.0946,0.0796,0.1705,0.0337,0.257,0.0072,0.3542,0.0002,0.4619,0.0135,0.5551,0.048,0.6407,0.1035,0.7189,0.1802,0.7896,0.2065,0.8102,0.232,0.8313,0.2566,0.8531,0.2803,0.8754,0.3029,0.8992,0.3243,0.9255,0.3442,0.9541,0.3629,0.9852,0.371,0.9961,0.3804,1.0,0.3913,0.997,0.4035,0.9871,0.4737,0.9158,0.5438,0.8609,0.6139,0.8221,0.6841,0.7997,0.7013,0.7944,0.7085,0.7868,0.7059,0.7769,0.6933,0.7646,0.6741,0.748,0.6599,0.7296,0.6506,0.7093,0.6462,0.6871,0.6462,0.6853,0.649,0.2635,0.6509,0.2439,0.6567,0.2277,0.6664,0.2149,0.6799,0.2053,0.6957,0.201,0.7121,0.2035,0.7292,0.213,0.7468,0.2293,0.7537,0.2357,0.7603,0.2392,0.7668,0.2396,0.7731,0.2372,0.7778,0.2325,0.7795,0.2262,0.7781,0.2184,0.7736,0.209,0.7571,0.1842,0.741,0.1597,0.7251,0.1353,0.7095,0.1112,0.6946,0.087,0.681,0.0623,0.6685,0.0371,0.6573,0.0115,0.6564,0.0106,0.6496,0.0027,0.6421,0.0,0.6339,0.0027,0.625,0.0106,0.6197,0.0157,0.6139,0.0198,0.6077,0.0231,0.601,0.0254,0.5533,0.0427,0.5152,0.0718,0.4868,0.1124,0.4681,0.1647,0.4668,0.1675,0.4649,0.1703,0.4622,0.173,0.4589,0.1758,0.4549,0.176,0.451,0.1756,0.4475,0.1746,0.4441,0.173],[0.4543,0.7166,0.4245,0.7281,0.3922,0.7466,0.3575,0.7724,0.3205,0.8052,0.3029,0.8224,0.2872,0.8295,0.2734,0.8265,0.2614,0.8136,0.2199,0.7387,0.1933,0.6601,0.1816,0.5777,0.1848,0.4915,0.2069,0.3775,0.2438,0.2877,0.2955,0.222,0.362,0.1804,0.3624,0.1804,0.3629,0.1802,0.3634,0.1799,0.3638,0.1795,0.3837,0.1778,0.4056,0.1848,0.4294,0.2004,0.4552,0.2247,0.4568,0.2274,0.458,0.23,0.4587,0.2325,0.4589,0.2349,0.4585,0.2428,0.4582,0.2526,0.458,0.2645,0.458,0.2783,0.4663,0.7019,0.4655,0.707,0.4633,0.7111,0.4595,0.7143,0.4543,0.7166]]],
  g: [0.5458,[[0.3697,0.366,0.3437,0.3544,0.3153,0.3421,0.2844,0.3291,0.251,0.3156,0.2182,0.3016,0.1892,0.2875,0.164,0.2733,0.1426,0.259,0.1359,0.2549,0.1302,0.2523,0.1256,0.2511,0.122,0.2514,0.1194,0.2529,0.1177,0.2554,0.117,0.2588,0.1172,0.2631,0.1168,0.2703,0.1149,0.2797,0.1115,0.2913,0.1066,0.3049,0.1006,0.3193,0.0941,0.3329,0.0871,0.3457,0.0794,0.3578,0.0594,0.389,0.0433,0.4188,0.0309,0.4473,0.0225,0.4744,0.0163,0.5021,0.0107,0.5322,0.0056,0.5649,0.0012,0.6,0.0004,0.6345,0.0053,0.6681,0.016,0.7007,0.0324,0.7324,0.0534,0.7628,0.0773,0.7914,0.1043,0.8183,0.1343,0.8436,0.1539,0.8589,0.1729,0.8746,0.1913,0.8908,0.2091,0.9074,0.2261,0.9251,0.2419,0.9446,0.2566,0.9659,0.2702,0.989,0.2765,0.9971,0.2837,1.0,0.2919,0.9978,0.3011,0.9904,0.3534,0.9379,0.4074,0.8969,0.4632,0.8675,0.5206,0.8497,0.5328,0.8455,0.539,0.8405,0.5393,0.8345,0.5337,0.8278,0.5065,0.7812,0.488,0.7342,0.4783,0.6867,0.4774,0.6387,0.4828,0.5904,0.492,0.5417,0.5051,0.4928,0.522,0.4435,0.522,0.4429,0.5227,0.4422,0.5433,0.337,0.5432,0.2474,0.5225,0.1732,0.4812,0.1145,0.4297,0.0693,0.3783,0.0355,0.3272,0.0132,0.2764,0.0024,0.196,0.0016,0.1304,0.0164,0.0797,0.0469,0.0438,0.0929,0.0389,0.1051,0.0372,0.1169,0.0387,0.1284,0.0434,0.1396,0.0505,0.1494,0.0591,0.1571,0.0692,0.1625,0.0808,0.1657,0.1044,0.1648,0.1266,0.154,0.1473,0.1332,0.1666,0.1025,0.1949,0.0603,0.229,0.0358,0.269,0.0291,0.3148,0.0401,0.3522,0.0608,0.3807,0.0878,0.4002,0.1211,0.4108,0.1609,0.4139,0.2053,0.4108,0.253,0.4016,0.3038,0.3861,0.3578,0.3861,0.3584,0.386,0.359,0.3858,0.3594,0.3855,0.3598,0.3848,0.3605,0.3823,0.3647,0.3789,0.367,0.3747,0.3675,0.3697,0.366],[0.4095,0.7489,0.3894,0.7578,0.3675,0.7689,0.3437,0.7822,0.3182,0.7976,0.2936,0.8134,0.2724,0.8279,0.2548,0.8412,0.2407,0.8532,0.2393,0.8538,0.2393,0.8542,0.2393,0.8545,0.2393,0.8549,0.2393,0.8552,0.2273,0.8692,0.216,0.8749,0.2054,0.8723,0.1954,0.8614,0.1645,0.8058,0.1446,0.7473,0.1357,0.686,0.1378,0.6219,0.144,0.5792,0.1523,0.5382,0.1629,0.4989,0.1755,0.4614,0.1911,0.4278,0.2105,0.4007,0.2337,0.3798,0.2606,0.3653,0.2613,0.3646,0.262,0.3646,0.2826,0.3626,0.306,0.3667,0.3323,0.377,0.3614,0.3935,0.3643,0.3956,0.3661,0.3984,0.3667,0.4021,0.3663,0.4065,0.3541,0.4461,0.3464,0.486,0.3433,0.5262,0.3446,0.5667,0.3517,0.6075,0.3657,0.6488,0.3865,0.6904,0.4143,0.7324,0.4163,0.7375,0.4162,0.742,0.4139,0.7458,0.4095,0.7489]]],
  o: [0.74,[[0.3604,0.0116,0.353,0.0029,0.3448,0.0,0.3359,0.0029,0.3261,0.0116,0.2684,0.0712,0.1976,0.1229,0.1135,0.1667,0.0162,0.2027,0.009,0.2053,0.0038,0.2087,0.0009,0.2128,0.0,0.2175,0.0009,0.2223,0.0029,0.2263,0.0062,0.2297,0.0107,0.2324,0.0367,0.2477,0.0552,0.2734,0.0663,0.3094,0.07,0.3557,0.0673,0.8288,0.0671,0.8336,0.0668,0.838,0.0662,0.8418,0.0654,0.845,0.0648,0.848,0.0648,0.8508,0.0655,0.8535,0.0668,0.8562,0.0688,0.8584,0.0716,0.8602,0.0751,0.8615,0.0793,0.8622,0.1993,0.8782,0.3124,0.906,0.4186,0.9455,0.5181,0.9967,0.5222,0.9986,0.5261,0.9997,0.5298,1.0,0.5334,0.9995,0.5365,0.998,0.5388,0.9953,0.5404,0.9915,0.5413,0.9865,0.5533,0.9366,0.5737,0.8872,0.6025,0.8383,0.6396,0.7898,0.6613,0.7595,0.6812,0.724,0.6991,0.6834,0.7152,0.6377,0.728,0.5915,0.7362,0.5494,0.7398,0.5113,0.7388,0.4772,0.7323,0.4406,0.7219,0.4059,0.7077,0.3731,0.6897,0.3423,0.669,0.313,0.647,0.2849,0.6236,0.258,0.5988,0.2324,0.568,0.2038,0.5362,0.1776,0.5031,0.1537,0.4689,0.1322,0.436,0.1093,0.407,0.0816,0.3818,0.049,0.3604,0.0116],[0.2593,0.8409,0.263,0.3066,0.2637,0.3001,0.2658,0.2947,0.2692,0.2904,0.2741,0.2871,0.4383,0.1851,0.4501,0.1797,0.4615,0.1795,0.4724,0.1844,0.4828,0.1943,0.5209,0.244,0.5468,0.2984,0.5607,0.3576,0.5626,0.4216,0.5599,0.4618,0.5537,0.4997,0.5439,0.5355,0.5306,0.5691,0.5146,0.6006,0.4968,0.6303,0.4773,0.6581,0.4559,0.6841,0.4219,0.7229,0.3921,0.7662,0.3667,0.8138,0.3455,0.8659,0.3443,0.8681,0.3425,0.8702,0.3401,0.8721,0.3372,0.8738,0.334,0.875,0.3309,0.8755,0.328,0.8753,0.3251,0.8742,0.3112,0.8693,0.2973,0.8647,0.2834,0.8605,0.2695,0.8566,0.265,0.8542,0.2618,0.8508,0.2599,0.8464,0.2593,0.8409]]],
};
const parkingOutlines = {
  P: [0.8232,[[0.0,1.0,0.428,1.0,0.5179,0.9947,0.5967,0.9788,0.6644,0.9523,0.721,0.9153,0.7657,0.8684,0.7976,0.8125,0.8168,0.7477,0.8232,0.6738,0.8168,0.5997,0.7976,0.5346,0.7657,0.4786,0.721,0.4317,0.6644,0.3946,0.5967,0.3681,0.5179,0.3522,0.428,0.347,0.2579,0.347,0.2579,0.0,0.0,0.0],[0.2579,0.8131,0.2579,0.5338,0.4005,0.5338,0.4359,0.5361,0.467,0.543,0.4938,0.5544,0.5164,0.5703,0.5343,0.5905,0.5471,0.6145,0.5547,0.6422,0.5573,0.6738,0.5547,0.7054,0.5471,0.7331,0.5343,0.7569,0.5164,0.777,0.4938,0.7928,0.467,0.8041,0.4359,0.8109,0.4005,0.8131]]],
  A: [1.0482,[[0.7261,0.1822,0.3228,0.1822,0.2592,0.0,0.0,0.0,0.3704,1.0,0.6778,1.0,1.0482,0.0,0.789,0.0],[0.3871,0.3677,0.6611,0.3677,0.5244,0.7656]]],
  R: [0.9029,[[0.3664,0.5566,0.404,0.5585,0.436,0.5641,0.4621,0.5736,0.4826,0.5867,0.498,0.6042,0.509,0.6266,0.5156,0.6538,0.5177,0.6859,0.5156,0.7176,0.509,0.7445,0.498,0.7665,0.4826,0.7837,0.4621,0.7966,0.436,0.8058,0.404,0.8113,0.3664,0.8131,0.2579,0.8131,0.2579,0.5566],[0.2579,0.3784,0.2579,0.0,0.0,0.0,0.0,1.0,0.3938,1.0,0.486,0.9959,0.5651,0.9834,0.6309,0.9627,0.6835,0.9337,0.7238,0.8957,0.7526,0.8481,0.7699,0.7909,0.7756,0.724,0.7726,0.6767,0.7636,0.6338,0.7487,0.5953,0.7277,0.5613,0.7007,0.5316,0.6677,0.506,0.6286,0.4847,0.5834,0.4675,0.6092,0.4596,0.6335,0.4478,0.6565,0.4323,0.6782,0.4129,0.6992,0.3889,0.7203,0.3594,0.7415,0.3245,0.7629,0.284,0.9029,0.0,0.6283,0.0,0.5064,0.2485,0.4879,0.283,0.4693,0.3116,0.4505,0.3343,0.4317,0.351,0.4112,0.363,0.3876,0.3716,0.3608,0.3767,0.3309,0.3784]]],
  K: [0.9786,[[0.0,1.0,0.2579,1.0,0.2579,0.635,0.6296,1.0,0.929,1.0,0.4474,0.5265,0.9786,0.0,0.6557,0.0,0.2579,0.3938,0.2579,0.0,0.0,0.0]]],
  I: [0.2579,[[0.0,1.0,0.2579,1.0,0.2579,0.0,0.0,0.0]]],
  N: [0.8962,[[0.0,1.0,0.288,1.0,0.6517,0.3141,0.6517,1.0,0.8962,1.0,0.8962,0.0,0.6082,0.0,0.2445,0.6859,0.2445,0.0,0.0,0.0]]],
  G: [0.9219,[[0.9219,0.0904,0.875,0.0692,0.8271,0.0508,0.7784,0.0353,0.7289,0.0226,0.6784,0.0127,0.6272,0.0056,0.5751,0.0014,0.5223,0.0,0.4081,0.0084,0.3065,0.0337,0.2174,0.0757,0.1407,0.1346,0.0792,0.2079,0.0352,0.2932,0.0088,0.3904,0.0,0.4997,0.009,0.61,0.0358,0.7079,0.0806,0.7933,0.1433,0.8664,0.2216,0.9248,0.3131,0.9666,0.4179,0.9916,0.5358,1.0,0.5834,0.9989,0.63,0.9955,0.6756,0.9898,0.7201,0.9819,0.7636,0.9718,0.8058,0.9595,0.8467,0.945,0.8864,0.9283,0.8864,0.7289,0.8461,0.7503,0.8059,0.7689,0.7659,0.7845,0.726,0.7973,0.6861,0.8072,0.6461,0.8142,0.6062,0.8185,0.5662,0.8199,0.4962,0.8147,0.4347,0.7991,0.3818,0.7732,0.3373,0.7369,0.3022,0.691,0.277,0.6361,0.262,0.5724,0.2569,0.4997,0.2618,0.4275,0.2763,0.3641,0.3005,0.3094,0.3344,0.2634,0.3772,0.227,0.4282,0.2009,0.4873,0.1853,0.5546,0.1801,0.5736,0.1804,0.5919,0.1813,0.6096,0.1828,0.6265,0.185,0.6427,0.1877,0.6581,0.1912,0.6726,0.1953,0.6862,0.2001,0.6862,0.3873,0.5345,0.3873,0.5345,0.5539,0.9219,0.5539]]],
};
