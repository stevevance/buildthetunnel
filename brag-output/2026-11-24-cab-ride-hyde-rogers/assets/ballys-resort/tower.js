// Bally's Chicago hotel enclosure. Metres, with the origin at the centre of its plan.
// The outline, terrace and base come from HKS's 21 Jan 2025 approval set, sheets 02 and 10–13.
const footprint = [
  [-30.0, 8.55], [30.0, 8.55], [24.75, -0.95], [22.50, -0.95],
  [17.75, -8.55], [-18.85, -8.55], [-21.35, -4.52], [-22.20, -4.52],
];
const curveRadii = [1.3, 1.35, 0.65, 0.23, 0.94, 0.94, 0.2, 0.40];

export const hotelTowerDimensions = Object.freeze({
  longFacade: 74.3,
  shortFacade: 45.2,
  depth: 21.3,
  guestroomBase: 31.2,
  height: 136.2,
  angle: 0.576,
});

function roundedOutline(points, radii) {
  const offsets = points.map(([x, z], i) => {
    const [ax, az] = points[(i + points.length - 1) % points.length];
    const [bx, bz] = points[(i + 1) % points.length];
    const r = radii[i];
    return [
      [x + (ax - x) * r / Math.hypot(ax - x, az - z), z + (az - z) * r / Math.hypot(ax - x, az - z)],
      [x + (bx - x) * r / Math.hypot(bx - x, bz - z), z + (bz - z) * r / Math.hypot(bx - x, bz - z)],
    ];
  });
  return points.flatMap(([x, z], i) => {
    const next = (i + 1) % points.length;
    const [[ax, az], [bx, bz]] = offsets[i];
    const bend = [];
    for (let step = 0; step <= 4; step++) {
      const t = step / 4;
      const s = 1 - t;
      bend.push([s * s * ax + 2 * s * t * x + t * t * bx, s * s * az + 2 * s * t * z + t * t * bz]);
    }
    return [
      ...bend.slice(0, -1).map((a, j) => ({ a, b: bend[j + 1], face: i, arc: true })),
      { a: bend[4], b: offsets[next][0], face: i, arc: false },
    ];
  });
}

function outline(points) {
  return points.map((a, face) => ({ a, b: points[(face + 1) % points.length], face, arc: false }));
}

function edgePoint({ a, b }, distance, y, offset = 0) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const length = Math.hypot(dx, dz);
  return [a[0] + dx * distance - dz * offset / length, y, a[1] + dz * distance + dx * offset / length];
}

function sample(a, b, c) {
  const value = Math.sin(a * 127.1 + b * 311.7 + c * 91.17) * 43758.5453;
  return value - Math.floor(value);
}

function batch(THREE, group, name, material) {
  const positions = [];
  const colors = [];
  const white = new THREE.Color(0xffffff);

  function triangle(a, b, c, tint = white) {
    positions.push(...a, ...b, ...c);
    if (material.vertexColors) {
      colors.push(tint.r, tint.g, tint.b, tint.r, tint.g, tint.b, tint.r, tint.g, tint.b);
    }
  }

  function quad(a, b, c, d, tint) {
    triangle(a, b, c, tint);
    triangle(a, c, d, tint);
  }

  function strip(edge, left, right, lower, upper, offset, tint) {
    quad(edgePoint(edge, left, lower, offset), edgePoint(edge, right, lower, offset),
      edgePoint(edge, right, upper, offset), edgePoint(edge, left, upper, offset), tint);
  }

  function plate(edges, y, top = true) {
    const contour = edges.map(({ a }) => new THREE.Vector2(...a));
    for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(contour, [])) {
      const a = [contour[i].x, y, contour[i].y];
      const b = [contour[j].x, y, contour[j].y];
      const c = [contour[k].x, y, contour[k].y];
      const isUp = (b[2] - a[2]) * (c[0] - a[0]) > (b[0] - a[0]) * (c[2] - a[2]);
      triangle(a, isUp === top ? b : c, isUp === top ? c : b);
    }
  }

  function close() {
    if (positions.length === 0) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = !material.transparent;
    mesh.receiveShadow = !material.transparent;
    group.add(mesh);
    return mesh;
  }
  return { quad, strip, plate, close };
}

// These are the public Bally's script outlines, in their original 1250 × 470 coordinate space.
// https://commons.wikimedia.org/wiki/File:Bally%27s_Corporation_logo.svg
const scriptContours = [
  'M1169.9 369.1C1218.6 369.1 1250 340.4 1250 296.3C1250 259.2 1227.5 205 1229.6 159.9C1230.1 151.4 1228 144.5 1220.2 144.5' +
  'C1214.4 144.5 1212.3 146.6 1207.1 155.1C1174.1 213 1112.3 286.2 1056.3 332.5C1052.7 335.6 1053.2 338.8 1057.4 347.3C1062.6 358.5 1064.7 358.5 1068.9 355.3' +
  'C1115 316.5 1157.3 270.3 1190.3 222C1192.9 245.9 1200.8 274 1200.8 303.8C1200.8 325 1191.4 342 1177.8 346.8C1175.7 329.3 1162.1 314.9 1147.9 314.9' +
  'C1134.8 314.9 1125.9 324.5 1125.9 337.8C1125.9 355.3 1144.8 369.1 1169.9 369.1Z',
  'M1142.7 133.8C1136.4 139.7 1135.9 143.4 1139 147.1C1142.7 150.8 1146.9 151.9 1153.7 147.6C1184 128 1209.2 98.8 1209.2 69.6' +
  'C1209.2 50.5 1199.2 38.2 1183 38.2C1166.8 38.2 1153.7 53.1 1153.7 71.7C1153.7 83.4 1160 93.5 1169.9 98.8C1163.6 114.7 1153.2 125.3 1142.7 133.8' +
  'Z',
  'M902.4 98.8C907.1 98.8 908.7 102 908.7 106.7C908.7 140.2 861.6 215.6 806.1 273C819.2 203.9 876.8 98.8 902.4 98.8' +
  'Z',
  'M786.2 42C790.9 42 792.5 44.6 792.5 49.4C792.5 83.9 722.9 193.8 662.7 258.6C671.6 166.8 756.4 42 786.2 42' +
  'Z',
  'M427.7 369.1C452.3 369.1 475.8 352.1 497.3 326.1C498.8 349.4 514 366.4 539.2 366.4C562.2 366.4 584.7 354.8 614.5 326.6' +
  'C623.4 351.6 645.9 369.1 676.3 369.1C705.6 369.1 729.2 359 756.9 334.6C764.8 356.3 782 369.1 807.2 369.1C836 369.1 862.1 353.2 887.2 322.9' +
  'C886.7 344.7 897.2 360.6 916.6 360.6C938.5 360.6 963.7 343.6 987.2 318.1L922.3 460.4C919.7 466.3 921.8 470.5 927.6 470' +
  'L966.3 466.3C973.1 465.8 975.2 463.1 978.3 456.7L1108.7 173.7C1111.3 167.8 1109.2 163.6 1102.9 164.1' +
  'L1064.2 167.8C1057.9 168.4 1055.3 171 1052.1 177.4L1036.4 211.4C1013.9 261.8 967.9 315.5 949 315.5' +
  'C940.1 315.5 940.1 303.2 947.4 287.3L1003.5 173.7C1006.6 167.8 1004 163.6 998.2 164.1L959.5 167.8' +
  'C952.7 168.4 950.6 171 947.4 177.4L921.8 229.4C887.8 297.9 854.3 333.5 827.6 333.5C814 333.5 806.1 324.5 804 307.5' +
  'C883.6 234.7 939.1 151.4 939.1 105.7C939.1 82.3 927.6 68.5 908.7 68.5C865.3 68.5 809.3 138.1 777.3 209.8C761.1 245.9 752.2 281.5 753.2 309.6' +
  'C731.8 328.2 716.1 334 699.3 334C678.4 334 666.4 318.1 662.7 292.6C753.8 205.5 823.9 100.9 823.9 46.2C823.9 25 812.9 10.6 793.6 10.6' +
  'C746.4 10.6 674.7 91.9 633.9 180C613 225.2 605.1 266.6 608.8 300.6C585.2 322.4 571.6 331.4 559 331.4C545.4 331.4 542.8 319.2 552.8 299.5' +
  'L579.5 240.6C582.1 235.3 579.5 230.5 574.2 231L535 235.8C528.7 236.3 526.6 238.5 522.9 245.4' +
  'L518.7 253.9C499.9 293.7 470.1 328.7 450.7 328.7C444.4 328.7 441.3 324.5 441.3 317.1C441.3 289.4 484.2 193.3 539.2 183.8' +
  'C542.3 198.1 555.4 210.8 570.6 210.8C586.3 210.8 596.2 200.2 596.2 188C596.2 172.1 580.5 158.8 553.3 158.8C468 158.8 385.3 258.6 385.3 323.4' +
  'C385.8 352.1 401.5 369.1 427.7 369.1Z',
  'M73.3 396.7C145.5 396.7 181.6 316.5 213 236.9C241.3 164.6 268 96.1 319.8 77.5C325.1 75.4 324 66.4 318.3 65.9' +
  'C224.6 61.6 180.6 168.9 146.6 253.3C116.2 328.2 96.8 363.3 69.1 363.3C47.6 363.3 36.1 346.3 36.1 317.1C36.1 223.1 159.1 28.7 326.6 28.7' +
  'C382.6 28.7 415.6 49.4 415.6 83.9C415.6 131.7 371.1 167.8 285.3 188.5C279 190.1 277.4 193.3 277.4 196.5C277.4 200.7 280 202.9 285.3 206.1' +
  'C309.4 218.3 319.3 237.4 319.3 260.2C319.3 297.9 292.1 343.1 260.2 343.1C256 343.1 252.8 342 250.7 340.9C253.9 335.1 255.4 328.7 255.4 321.8' +
  'C255.4 305.4 242.9 291.6 228.7 291.6C214.6 291.6 203.6 303.2 203.6 318.1C203.6 347.9 230.8 368.6 270.1 368.6C331.9 368.6 375.8 322.9 375.8 269.8' +
  'C375.8 238.5 358 213.5 326.1 199.7C418.2 186.4 474.2 145 474.2 85C474.2 34.5 423.5 0 344.4 0C145.5 0 0 166.8 0 306.4' +
  'C0 362.2 27.2 396.7 73.3 396.7Z',
];

function addSign(THREE, group, edge, distance, width) {
  const shapes = [];
  const holes = [];
  for (let index = 0; index < scriptContours.length; index++) {
    const path = index === 2 || index === 3 ? new THREE.Path() : new THREE.Shape();
    const commands = scriptContours[index].match(/[MCLZ][^MCLZ]*/g);
    for (const command of commands) {
      const values = command.slice(1).trim().split(' ').map((value, coordinate) =>
        (coordinate % 2 ? 235 - Number(value) : Number(value) - 625) * width / 1250);
      switch (command[0]) {
        case 'M': path.moveTo(...values); break;
        case 'C': path.bezierCurveTo(...values); break;
        case 'L': path.lineTo(...values); break;
        case 'Z': path.closePath(); break;
      }
    }
    if (index === 2 || index === 3) holes.push(path);
    if (index === 4) path.holes = holes;
    if (path.isShape || path.type === 'Shape') shapes.push(path);
  }
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xc51828, emissive: 0x8d0713, emissiveIntensity: 0.17, roughness: 0.32 }),
    new THREE.MeshStandardMaterial({ color: 0x791624, roughness: 0.45 }),
  ];
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shapes, { depth: 0.14, bevelEnabled: false, curveSegments: 5 }), materials);
  const [dx, dz] = [edge.b[0] - edge.a[0], edge.b[1] - edge.a[1]];
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.position.set(...edgePoint(edge, distance, 134.08, 0.16));
  mesh.name = edge.face === 4 ? 'Bally’s crown signage — river elevation' : 'Bally’s crown signage — southeast return';
  group.add(mesh);
}

export function buildTower(THREE, site) {
  const building = new THREE.Group();
  building.name = 'Bally’s hotel tower';
  building.rotation.y = -hotelTowerDimensions.angle;
  site.add(building);

  // The traced footprint and terrace share the same registration to the approved site plan.
  const hotel = new THREE.Group();
  hotel.name = 'Hotel envelope';
  hotel.scale.set(1.25, 1, 1.2456);
  hotel.position.z = -0.85;
  building.add(hotel);

  const tone = (value) => new THREE.Color(value);
  const material = (color, roughness, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const hotelGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, metalness: 0.51, roughness: 0.20,
    clearcoat: 0.72, clearcoatRoughness: 0.13, envMapIntensity: 1.24,
  });
  const spandrelGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, metalness: 0.38, roughness: 0.28,
    clearcoat: 0.45, clearcoatRoughness: 0.20, envMapIntensity: 0.95,
  });
  const edges = roundedOutline(footprint, curveRadii);
  const vision = batch(THREE, hotel, 'Guestroom curtain wall — reflective vision glass', hotelGlass);
  const spandrel = batch(THREE, hotel, 'Guestroom curtain wall — bird-safe spandrel panels', spandrelGlass);
  const illuminatedPanes = batch(THREE, hotel, 'Guestroom curtain wall — scattered warm window light', new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, roughness: 0.25, metalness: 0.26,
    emissive: 0xffb765, emissiveIntensity: 0.10, clearcoat: 0.50, envMapIntensity: 1.08,
  }));
  const joints = batch(THREE, hotel, 'Unitized curtain wall — charcoal aluminum joints', material(0x354653, 0.44, 0.62));
  const crownGlass = batch(THREE, hotel, 'Continuous glass crown and parapet', hotelGlass);
  const podiumGlass = batch(THREE, hotel, 'Southeast curtain wall at podium and park', hotelGlass);
  const podiumFrame = batch(THREE, hotel, 'Podium transoms and recessed curtain wall returns', material(0x3e4b52, 0.41, 0.64));
  const roofMetal = batch(THREE, hotel, 'Roof coping, crown soffit and corner flashings', material(0x9aabb1, 0.39, 0.58));
  const deck = batch(THREE, hotel, 'Level 36 outdoor terrace and rooftop surface', material(0x727470, 0.79));
  const deckJoints = batch(THREE, hotel, 'Terrace paver joints', material(0x5e625e, 0.86));
  const bronze = batch(THREE, hotel, 'Level 36 bronze canopy soffit', material(0xa57b51, 0.46, 0.49));
  const railGlass = batch(THREE, hotel, 'Level 36 glass terrace balustrade', new THREE.MeshPhysicalMaterial({
    color: 0xbcd2d6, roughness: 0.13, metalness: 0.12, transparent: true, opacity: 0.37, side: THREE.DoubleSide,
  }));
  const warmGlass = batch(THREE, hotel, 'Recessed rooftop restaurant glazing', new THREE.MeshPhysicalMaterial({
    color: 0x78878d, vertexColors: true, roughness: 0.28, metalness: 0.22,
    emissive: 0xe5a56b, emissiveIntensity: 0.16, clearcoat: 0.38,
  }));
  const roofLining = batch(THREE, hotel, 'Recessed crown liner with folded panels', material(0x3d4d58, 0.47, 0.55));

  const palette = [0x8da9c0, 0x9ab4c5, 0x84a3b9, 0x84a4bb, 0xa6bed0, 0x91adc1, 0x85a2b7, 0x93aec4].map(tone);
  const secondary = [0x54718a, 0x67899e, 0x7892a6, 0x8cabb8, 0xb1c0c6, 0x536c83].map(tone);
  const silverGlass = tone(0xbac8cb);
  const guestStart = hotelTowerDimensions.guestroomBase;
  const guestEnd = 123.55;
  const clubEnd = 127.76;
  const restaurantCeiling = 132.36;
  const roofTop = hotelTowerDimensions.height;
  const faceBays = [46, 9, 2, 7, 29, 4, 1, 13];

  function curtainPanels(edge, lower, upper, row, mode = 'guest') {
    const length = Math.hypot(edge.b[0] - edge.a[0], edge.b[1] - edge.a[1]);
    const bays = edge.arc ? 1 : faceBays[edge.face];
    const isGuest = mode === 'guest';
    const skin = isGuest ? vision : crownGlass;
    joints.strip(edge, 0, 1, lower, upper, -0.035);
    for (let j = 0; j < bays; j++) {
      const seam = edge.arc ? 0.008 : 0.024 / length;
      const a = j / bays + seam;
      const b = (j + 1) / bays - seam;
      const field = sample(j + 5, row, edge.face + 16);
      const columnTint = sample(j, edge.face + 2, 43);
      const drift = 0.038 * Math.sin(row * 0.27 + j * 0.13 + edge.face);
      const lightness = isGuest ? 0.92 + field * 0.13 + columnTint * 0.06 + drift : 0.98 + field * 0.11;
      const glassTint = palette[edge.face].clone().multiplyScalar(lightness);
      if (isGuest) {
        if (!edge.arc && field > 0.86) glassTint.lerp(secondary[Math.floor(columnTint * secondary.length)], 0.38);
        if (edge.arc) glassTint.lerp(silverGlass, 0.11);
        const register = lower + 0.71;
        skin.strip(edge, a, b, register + 0.005, upper - 0.038, 0, glassTint);
        spandrel.strip(edge, a, b, lower + 0.036, register - 0.006, -0.006,
          glassTint.clone().lerp(tone(0x697f8b), 0.14 + field * 0.10));
        if (!edge.arc && row < 28 && sample(Math.floor(j / 3), row, edge.face + 90) > 0.88 && field > 0.38) {
          const inset = (b - a) * (0.10 + columnTint * 0.10);
          illuminatedPanes.strip(edge, a + inset, b - inset, register + 0.36,
            upper - 0.18 - 0.60 * field, 0.024, glassTint.clone().lerp(silverGlass, 0.18));
        }
      } else {
        skin.strip(edge, a, b, lower + 0.042, upper - 0.041, 0, glassTint);
      }
    }
  }

  for (const edge of edges) {
    for (let row = 0; row < 28; row++) {
      const lower = guestStart + (guestEnd - guestStart) * row / 28;
      curtainPanels(edge, lower, guestStart + (guestEnd - guestStart) * (row + 1) / 28, row);
    }
    curtainPanels(edge, guestEnd, clubEnd, 28);
    curtainPanels(edge, restaurantCeiling, 134.3, 30, 'crown');
    curtainPanels(edge, 134.3, roofTop - 0.12, 31, 'crown');
    roofMetal.strip(edge, 0, 1, roofTop - 0.12, roofTop, 0.034);
    roofMetal.strip(edge, 0, 1, restaurantCeiling - 0.11, restaurantCeiling + 0.04, 0.03);
  }
  roofMetal.plate(edges, guestStart - 0.01, false);

  // The restaurant retreats from the river elevation to expose the full length of the terrace.
  // Its floor and bronze canopy continue beneath the surrounding glass crown.
  const restaurantShape = [
    [-27.7, 7.8], [26.0, 7.8], [21.18, -0.65], [20.22, -0.65],
    [17.19, -4.52], [-20.75, -4.52], [-25.42, 2.65],
  ];
  const restaurantEdges = roundedOutline(restaurantShape, [0.55, 0.57, 0.34, 0.12, 0.55, 0.55, 0.30]);
  for (const edge of edges) {
    const terraceFront = edge.face >= 3 && edge.face <= 6;
    const glassStub = !terraceFront && edge.face !== 2;
    if (glassStub) curtainPanels(edge, clubEnd, restaurantCeiling, 29, 'crown');
    if (terraceFront || edge.face === 2) {
      railGlass.strip(edge, 0.008, 0.992, clubEnd + 0.32, clubEnd + 1.36, -0.32);
      roofMetal.strip(edge, 0, 1, clubEnd + 1.36, clubEnd + 1.45, -0.32);
    }
  }
  for (const edge of restaurantEdges) {
    const width = Math.hypot(edge.b[0] - edge.a[0], edge.b[1] - edge.a[1]);
    const bays = edge.arc ? 1 : Math.max(1, Math.round(width / 1.55));
    joints.strip(edge, 0, 1, clubEnd + 0.25, restaurantCeiling, -0.05);
    for (let i = 0; i < bays; i++) {
      const lightness = 0.75 + sample(i, edge.face, 81) * 0.25;
      warmGlass.strip(edge, (i + 0.026) / bays, (i + 0.974) / bays,
        clubEnd + 0.28, restaurantCeiling - 0.14, 0, tone(0xc0aaa0).multiplyScalar(lightness));
    }
  }
  deck.plate(edges, clubEnd + 0.018);
  bronze.plate(edges, restaurantCeiling - 0.12, false);
  deck.plate(edges, restaurantCeiling + 0.14);

  // Lift and mechanical screening sit behind the crown, below its apparent skyline.
  const mechanical = outline([[-12.98, 4.0], [10.6, 4.0], [10.6, -2.1], [-12.98, -2.1]]);
  deck.plate(mechanical, 135.08);
  for (const edge of mechanical) {
    roofLining.strip(edge, 0, 1, restaurantCeiling + 0.14, 135.08, 0);
    const bays = Math.round(Math.hypot(edge.b[0] - edge.a[0], edge.b[1] - edge.a[1]) / 0.29);
    for (let i = 0; i < bays; i++) {
      roofMetal.strip(edge, i / bays, (i + 0.16) / bays, restaurantCeiling + 0.20, 135.04, 0.045);
    }
  }

  const terraceEdge = edges.find(({ face, arc }) => face === 4 && !arc);
  for (let x = -18.65; x < 17.6; x += 1.22) {
    const railPost = { a: [x + 0.027, -8.35], b: [x - 0.027, -8.35] };
    roofMetal.strip(railPost, 0, 1, clubEnd + 0.25, clubEnd + 1.42, 0);
    const y = clubEnd + 0.022;
    deckJoints.quad([x, y, -8.35], [x, y, -4.55], [x + 0.015, y, -4.55], [x + 0.015, y, -8.35]);
  }
  for (let z = -8.32; z < -4.55; z += 1.18) {
    const y = clubEnd + 0.022;
    deckJoints.quad([-18.55, y, z], [-18.55, y, z + 0.014], [17.4, y, z + 0.014], [17.4, y, z]);
  }

  // The east end of the tower glass drops through the horizontal planes of the shared podium.
  const pylon = roundedOutline([[8.8, 8.40], [29.77, 8.40], [24.60, -0.86], [22.35, -0.86],
    [17.55, -8.40], [11.1, -8.40], [8.6, -5.9]], [0.25, 1.18, 0.56, 0.20, 0.77, 0.27, 0.16]);
  const pylonLevels = [9.2, 13.8, 18.5, 23.25, 27.40, guestStart + 0.02];
  podiumFrame.plate(pylon, pylonLevels[0], false);
  for (const edge of pylon) {
    const length = Math.hypot(edge.b[0] - edge.a[0], edge.b[1] - edge.a[1]);
    const bays = edge.arc ? 1 : Math.max(1, Math.round(length / 1.34));
    podiumFrame.strip(edge, 0, 1, pylonLevels[0], guestStart, -0.034);
    for (let row = 0; row < pylonLevels.length - 1; row++) {
      const start = pylonLevels[row];
      const end = pylonLevels[row + 1];
      for (let i = 0; i < bays; i++) {
        const tint = palette[edge.face].clone().multiplyScalar(0.90 + sample(i, row, edge.face) * 0.17);
        podiumGlass.strip(edge, (i + 0.017) / bays, (i + 0.981) / bays, start + 0.075, end - 0.08, 0, tint);
      }
    }
  }

  for (const surface of [vision, spandrel, illuminatedPanes, joints, crownGlass, podiumGlass, podiumFrame, roofMetal,
    deck, deckJoints, bronze, railGlass, warmGlass, roofLining]) surface.close();

  addSign(THREE, hotel, terraceEdge, 0.21, 9.0);
  addSign(THREE, hotel, edges.find(({ face, arc }) => face === 1 && !arc), 0.55, 7.8);
  return building;
}
