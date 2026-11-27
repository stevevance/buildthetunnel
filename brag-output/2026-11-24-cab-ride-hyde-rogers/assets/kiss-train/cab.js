const section = [
  [0.46, 1.27], [0.57, 1.41], [0.75, 1.485], [0.95, 1.5],
  [3.44, 1.5], [3.83, 1.48], [4.13, 1.425], [4.37, 1.34],
  [4.50, 1.19], [4.575, 0.92], [4.62, 0.55], [4.63, 0]
];

const kissSections = [
  [0.46, -0.22, 1.33, 0.39], [0.65, -0.18, 1.44, 0.47],
  [0.93, -0.155, 1.47, 0.49], [1.25, -0.13, 1.49, 0.49],
  [1.39, -0.10, 1.49, 0.50], [1.46, -0.045, 1.49, 0.53],
  [1.70, -0.005, 1.484, 0.56], [1.82, 0, 1.481, 0.57],
  [2.02, -0.018, 1.475, 0.59], [2.28, -0.056, 1.465, 0.62],
  [2.52, -0.116, 1.465, 0.66], [2.82, -0.24, 1.465, 0.67],
  [3.12, -0.39, 1.46, 0.65], [3.42, -0.61, 1.45, 0.61],
  [3.72, -0.85, 1.437, 0.55], [4.00, -1.095, 1.42, 0.49],
  [4.23, -1.39, 1.39, 0.41], [4.40, -1.71, 1.34, 0.37],
  [4.51, -1.98, 1.26, 0.32], [4.565, -2.18, 1.15, 0.27],
  [4.60, -2.38, 0.93, 0.22], [4.62, -2.61, 0.61, 0.15],
  [4.63, -2.88, 0, 0.004]
];

const displayAlphabet = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  // (the letters the KISS model's Caltrain signs never needed, added for the CrossTowner's)
  'B': ['11110','10001','10001','11110','10001','10001','11110'],
  'G': ['01110','10001','10000','10111','10001','10001','01111'],
  'H': ['10001','10001','10001','11111','10001','10001','10001'],
  'K': ['10001','10010','10100','11000','10100','10010','10001'],
  'M': ['10001','11011','10101','10101','10001','10001','10001'],
  'P': ['11110','10001','10001','11110','10000','10000','10000'],
  'U': ['10001','10001','10001','10001','10001','10001','01110'],
  'V': ['10001','10001','10001','10001','10001','01010','00100'],
  'W': ['10001','10001','10001','10101','10101','10101','01010'],
  'X': ['10001','10001','01010','00100','01010','10001','10001'],
  'Y': ['10001','10001','01010','00100','00100','00100','00100'],
  '/': ['00001','00010','00010','00100','01000','01000','10000'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['00110','01000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00010','01100'],
  'A': ['01110','10001','10001','11111','10001','10001','10001'],
  'C': ['01110','10001','10000','10000','10000','10001','01110'],
  'D': ['11110','10001','10001','10001','10001','10001','11110'],
  'E': ['11111','10000','10000','11110','10000','10000','11111'],
  'F': ['11111','10000','10000','11110','10000','10000','10000'],
  'I': ['01110','00100','00100','00100','00100','00100','01110'],
  'J': ['00111','00010','00010','00010','10010','10010','01100'],
  'L': ['10000','10000','10000','10000','10000','10000','11111'],
  'N': ['10001','11001','11001','10101','10011','10011','10001'],
  'O': ['01110','10001','10001','10001','10001','10001','01110'],
  'R': ['11110','10001','10001','11110','10100','10010','10001'],
  'S': ['01111','10000','10000','01110','00001','00001','11110'],
  'T': ['11111','00100','00100','00100','00100','00100','00100'],
};

const numberOutlines = {
  '1': [[.05,.68],[.33,.91],[.42,.91],[.42,.115],[.62,.115],[.62,0],
    [.08,0],[.08,.115],[.28,.115],[.28,.734],[.05,.55]],
  '2': [[.04,.73],[.10,.855],[.22,.92],[.43,.92],[.57,.845],[.62,.745],
    [.61,.61],[.52,.49],[.28,.28],[.18,.115],[.62,.115],[.62,0],
    [.015,0],[.015,.105],[.10,.28],[.40,.55],[.48,.67],[.48,.75],[.42,.795],
    [.23,.795],[.17,.765],[.16,.69]],
  '3': [[.04,.77],[.16,.885],[.30,.92],[.46,.90],[.58,.82],[.61,.73],
    [.57,.62],[.47,.525],[.58,.455],[.63,.345],[.63,.22],[.57,.095],
    [.47,.025],[.33,0],[.16,.025],[.035,.10],[.015,.225],[.145,.245],
    [.18,.155],[.26,.124],[.42,.133],[.49,.21],[.49,.325],[.43,.401],
    [.26,.43],[.26,.55],[.41,.57],[.47,.65],[.47,.735],[.41,.789],
    [.29,.803],[.20,.776],[.16,.71]]
};

const mix = (a, b, t) => a + (b - a) * t;
const unit = value => Math.min(1, Math.max(0, value));
const smooth = value => {
  const t = unit(value);
  return t * t * (3 - 2 * t);
};

function curve(rows, at, channel, interpolate = true) {
  const last = rows.length - 1;
  if (at <= rows[0][0]) return rows[0][channel];
  if (at >= rows[last][0]) return rows[last][channel];

  let i = 0;
  while (rows[i + 1][0] < at) i += 1;
  const [a, b] = [rows[i], rows[i + 1]];
  const delta = b[0] - a[0];
  const t = (at - a[0]) / delta;
  if (!interpolate) return mix(a[channel], b[channel], t);
  const slope = j => (rows[j + 1][channel] - rows[j][channel]) / (rows[j + 1][0] - rows[j][0]);
  const mean = (left, right) => left * right <= 0 ? 0 : 2 * left * right / (left + right);
  const current = slope(i);
  const m0 = i === 0 ? current : mean(slope(i - 1), current);
  const m1 = i + 1 === last ? current : mean(current, slope(i + 1));

  return a[channel] * (2 * t ** 3 - 3 * t ** 2 + 1)
    + m0 * delta * (t ** 3 - 2 * t ** 2 + t)
    + b[channel] * (3 * t ** 2 - 2 * t ** 3)
    + m1 * delta * (t ** 3 - t ** 2);
}

// The CrossTowner's version leans its upper face back further than the KISS (a longer, sleeker rake, 0.5 m more at
// the roof) and squares off the windscreen's foot, the lamps and the headlamp pod (below).
const frontSections = kissSections.map(([y, face, w, corner]) =>
  [y, face * (1 + 0.18 * Math.min(1, Math.max(0, (y - 2.3) / 2.0)) ** 1.5), w, corner]);

export function buildCab(THREE, ctx = {}) {
  const group = new THREE.Group();
  group.name = 'Stadler KISS EMU cab and pilot';
  const active = ctx.activeCab ?? true;
  const material = (name, color, metalness, roughness, extras = {}) =>
    new THREE.MeshStandardMaterial({name, color, metalness, roughness, ...extras});

  const red = material('CrossTowner teal gelcoat', '#0b7285', .16, .36);   // (teal: the name kept from the KISS model)
  const white = material('CrossTowner white gelcoat', '#dce2e4', .13, .39);
  const gray = material('Cab roof graphite paint', '#42494f', .12, .47);
  const seal = material('Molded rubber glazing seal', '#121517', .08, .60);
  const panel = material('Glazing mask', '#12171c', .15, .34);
  const glass = material('Laminated windshield', '#ffffff', .24, .21, {vertexColors: true});
  const sideGlass = material('Laminated side glass', '#ffffff', .21, .23, {vertexColors: true});
  const lens = material('Smoked headlamp insert', '#181e20', .31, .19);
  const reflector = material('Lamp reflector', '#56616a', .65, .20);
  const reflectorDark = material('Rear lamp carrier', '#333b3e', .42, .26);
  const whiteLight = material('White marker and headlight LED', active ? '#e6f4ff' : '#8b999c', .12, .19,
    {emissive: active ? '#d9ebff' : '#000000', emissiveIntensity: active ? 1.65 : 1});
  const redLight = material('Red rear marker LED', active ? '#6d2530' : '#fb2737', .14, .23,
    {emissive: active ? '#2c0305' : '#ff1a2a', emissiveIntensity: active ? .22 : 1.78});
  const led = material('Amber destination display dots', '#dfc36d', .04, .38,
    {emissive: '#fac34f', emissiveIntensity: active ? .65 : .1});
  const ledFrame = material('LED display substrate', '#202829', .16, .41);
  const trim = material('Black cab hardware', '#1b1e20', .31, .42);
  const pocket = material('Coupler recess lining and hoses', '#0e1112', .13, .74);
  const steel = material('Cast steel coupler', '#6e777a', .63, .39);
  const stainless = material('Coupler wear surfaces', '#a0aaa9', .71, .31);
  const pilots = material('Pilot deflector', '#23282b', .34, .49);
  const edge = material('Pilot wear strip', '#62483e', .42, .63);
  const cable = material('Reinforced air hose', '#343134', .10, .57);
  const redCable = material('Draw gear bellows', '#513a36', .08, .64);
  const navy = material('Stadler badge', '#273540', .12, .37);
  const numberBlack = material('Nose vehicle number', '#272629', .06, .44);

  const widthAt = y => curve(frontSections, y, 2);
  const moduleRise = x => .120 * smooth((x + 4.05) / .60) * smooth((-1.55 - x) / 1.12);
  const halfCore = .68;
  const top = 4.63;
  const rear = -4.2;

  function surface(q, y, lift = 0) {
    const s = Math.abs(q);
    const sign = Math.sign(q);
    const w = widthAt(y);
    const face = curve(frontSections, y, 1);
    const corner = curve(frontSections, y, 3);
    const limit = (y < 4.6 ? .058 : .038) * Math.min(1, w);
    const theta = (Math.PI / 2) * unit((s - halfCore) / (1 - halfCore));
    const cornerX = face - limit - corner;
    const sAt = s <= halfCore ? s : halfCore + (1 - halfCore) * Math.sin(theta);
    const x = s <= 1
      ? face - limit * sAt ** 2 - corner * (1 - Math.cos(theta))
      : mix(cornerX, rear, s - 1);
    const z = s <= 1
      ? sign * w * sAt
      : sign * mix(w, curve(section, y, 1, false), smooth(s - 1));
    const arch = moduleRise(x) * smooth((y - 3.77) / .86);
    const bumperLift = .125 * (1 - smooth((s - 1) / .90)) * (1 - smooth((y - .46) / .30));
    const wheelOpeningLift = .36 * smooth((-x - 1.8) / 2.4) * (1 - smooth((y - .46) / .90));
    const lower = Math.max(bumperLift, wheelOpeningLift);
    const result = new THREE.Vector3(x, y + arch + lower, z);
    if (lift) {
      result.x += lift * (s < 1 ? Math.cos(theta) : 0);
      result.z += lift * sign * (s < 1 ? Math.sin(theta) : 1);
    }
    return result;
  }

  function surfaceNormal(q, y) {
    const epsilon = .00014;
    const dy = surface(q, Math.min(top, y + epsilon)).sub(surface(q, Math.max(.46, y - epsilon)));
    const dq = surface(Math.min(2, q + epsilon), y).sub(surface(Math.max(-2, q - epsilon), y));
    const normal = dy.normalize().cross(dq.normalize());
    if (normal.lengthSq() > 1e-12) return normal.normalize();
    return new THREE.Vector3(0, 1, 0);
  }

  function faceQ(z, y) {
    const ratio = unit(Math.abs(z) / Math.max(.0001, widthAt(y)));
    const theta = Math.asin(unit((ratio - halfCore) / (1 - halfCore)));
    const q = ratio <= halfCore ? ratio : halfCore + (1 - halfCore) * theta / (Math.PI / 2);
    return Math.sign(z) * q;
  }

  function front(z, y, lift = 0) {
    const p = surface(faceQ(z, y), y);
    p.x += lift;
    return p;
  }

  function flank(x, y, sign, lift = 0) {
    let min = 0;
    let max = 2;
    for (let i = 0; i < 18; i += 1) {
      const q = (min + max) / 2;
      if (surface(q, y).x > x) min = q;
      else max = q;
    }
    const p = surface((min + max) / 2 * sign, y);
    p.z += lift * sign;
    return p;
  }

  function geometry(name, positions, indices, mat, normals, colors) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (indices?.length) geo.setIndex(indices);
    if (normals) geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    else geo.computeVertexNormals();
    if (colors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function sheet(name, qStart, qEnd, yStart, yEnd, mat, columns = 72, rows = 44) {
    const vertices = [];
    const normals = [];
    const indices = [];
    for (let i = 0; i <= rows; i += 1) {
      for (let j = 0; j <= columns; j += 1) {
        const height = i / rows;
        const across = j / columns;
        const q = mix(qStart(height), qEnd(height), across);
        const yy = mix(yStart(q), yEnd(q), height);
        vertices.push(...surface(q, yy).toArray());
        normals.push(...surfaceNormal(q, yy).toArray());
        if (i < rows && j < columns) {
          const a = i * (columns + 1) + j;
          const b = a + columns + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    return geometry(name, vertices, indices, mat, normals);
  }

  function underside() {
    const positions = [];
    const indices = [];
    const edgeQ = faceQ(.66, .46);
    for (const [from, to] of [[-2, -edgeQ], [edgeQ, 2]]) {
      const start = positions.length / 3;
      for (let i = 0; i <= 36; i += 1) {
        const q = mix(from, to, i / 36);
        const p = surface(q, .46);
        positions.push(...p.toArray(), p.x, p.y + .015, p.z * .70);
        if (i < 36) {
          const a = start + i * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
    }
    geometry('Lower gelcoat returns', positions, indices, white);
  }

  const fixed = n => () => n;
  // the teal: a band straight across under the windscreen, which sweeps down the cab's sides into the body's band
  const tealHigh = q => { const a = Math.abs(q); return a <= 1 ? 2.42 : mix(2.42, 1.80, smooth(a - 1)); };
  const tealLow = q => { const a = Math.abs(q); return a <= 1 ? 1.86 + .06 * a * a : mix(1.92, 1.40, smooth(a - 1)); };
  sheet('Molded cab upper shell', fixed(-2), fixed(2), tealHigh, fixed(top), white, 120, 68);
  sheet('Molded cab teal band', fixed(-2), fixed(2), tealLow, tealHigh, red, 120, 20);
  sheet('Molded cab lower shell', fixed(-2), fixed(2), fixed(1.33), tealLow, white, 120, 24);
  const opening = t => faceQ(mix(.66, .615, smooth(t / .13)), mix(.46, 1.33, t));
  sheet('Port bumper wing', fixed(-2), t => -opening(t), fixed(.46), fixed(1.33), white, 52, 33);
  sheet('Starboard bumper wing', opening, fixed(2), fixed(.46), fixed(1.33), white, 52, 33);
  underside();

  function rounded(poly, radius = .024, steps = 4) {
    if (!radius) return poly;
    return poly.flatMap((point, i) => {
      const before = poly[(i + poly.length - 1) % poly.length];
      const after = poly[(i + 1) % poly.length];
      const p = new THREE.Vector2(...point);
      const a = new THREE.Vector2(...before).sub(p);
      const b = new THREE.Vector2(...after).sub(p);
      a.setLength(Math.min(radius, a.length() * .30)).add(p);
      b.setLength(Math.min(radius, b.length() * .30)).add(p);
      return Array.from({length: steps + 1}, (_, j) => {
        const t = j / steps;
        const v = a.clone().multiplyScalar((1 - t) ** 2)
          .addScaledVector(p, 2 * t * (1 - t)).addScaledVector(b, t * t);
        return v.toArray();
      });
    });
  }

  function patch(name, outline, sample, mat, opts = {}) {
    const {radius = .025, subdivisions = 5, normal = new THREE.Vector3(1, 0, 0), shade} = opts;
    const boundary = rounded(outline, radius).map(p => new THREE.Vector2(...p));
    const shape = THREE.ShapeUtils.triangulateShape(boundary, []);
    const vertices = [];
    const indices = [];
    const normals = [];
    const colors = [];
    for (const [ai, bi, ci] of shape) {
      const a = boundary[ai];
      const b = boundary[bi];
      const c = boundary[ci];
      const start = vertices.length / 3;
      const rowStart = i => i * (subdivisions + 1) - i * (i - 1) / 2 + start;
      for (let i = 0; i <= subdivisions; ++i) {
        for (let j = 0; j <= subdivisions - i; ++j) {
          const u = (b.x - a.x) * i / subdivisions + (c.x - a.x) * j / subdivisions + a.x;
          const v = (b.y - a.y) * i / subdivisions + (c.y - a.y) * j / subdivisions + a.y;
          const point = sample(u, v);
          vertices.push(...point.toArray());
          if (shade) colors.push(...shade(u, v).toArray());
          const du = sample(u + .00015, v).sub(sample(u - .00015, v));
          const dv = sample(u, v + .00015).sub(sample(u, v - .00015));
          const n = dv.cross(du).normalize();
          if (n.dot(normal) < 0) n.negate();
          normals.push(...n.toArray());
        }
      }
      for (let i = 0; i < subdivisions; ++i) {
        for (let j = 0; j < subdivisions - i; ++j) {
          const at = rowStart(i) + j;
          const next = rowStart(i + 1) + j;
          indices.push(at, next, at + 1);
          if (j < subdivisions - i - 1) indices.push(at + 1, next, next + 1);
        }
      }
    }
    if (indices.length) {
      const [ai, bi, ci] = indices;
      const a = new THREE.Vector3().fromArray(vertices, 3 * ai);
      const b = new THREE.Vector3().fromArray(vertices, 3 * bi);
      const c = new THREE.Vector3().fromArray(vertices, 3 * ci);
      if (b.sub(a).cross(c.sub(a)).dot(normal) < 0) {
        for (let i = 0; i < indices.length; i += 3) {
          [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
        }
      }
    }
    return geometry(name, vertices, indices, mat, normals, shade ? colors : undefined);
  }

  const patchFront = (name, points, mat, lift, options) =>
    patch(name, points, (z, y) => front(z, y, lift), mat, options);
  const patchSide = (name, points, mat, side, lift, options) =>
    patch(name, points, (x, y) => flank(x, y, side, lift), mat,
      {...options, normal: new THREE.Vector3(0, 0, side)});

  function frontPaint(name, mat, left, right, heightAt, lift) {
    const vertices = [];
    const normals = [];
    const indices = [];
    const columns = 36;
    const rows = 90;
    for (let row = 0; row <= rows; row += 1) {
      for (let col = 0; col <= columns; col += 1) {
        const u = col / columns;
        const t = row / rows;
        const y = heightAt(u, t);
        const z = mix(left(y), right(y), u);
        const q = faceQ(z, y);
        vertices.push(...surface(q, y, lift).toArray());
        normals.push(...surfaceNormal(q, y).toArray());
        if (row < rows && col < columns) {
          const i = row * (columns + 1) + col;
          indices.push(i, i + columns + 1, i + 1,
            i + columns + 1, i + columns + 2, i + 1);
        }
      }
    }
    return geometry(name, vertices, indices, mat, normals);
  }

  const whiteEdgeWidth = y => Math.min(widthAt(y) * .961, mix(1.205, 1.13, unit((y - 2.04) / 2.10)));
  const grayEdgeWidth = y => Math.min(widthAt(y) * .77, .94);
  frontPaint('Graphite cab forehead', gray, y => -grayEdgeWidth(y), grayEdgeWidth,
    (u, t) => mix(3.98, top, t), .014);

  patchFront('Panoramic windshield gasket',
    [[-1.025,2.50],[1.025,2.50],[.985,4.025],[-.985,4.025]],
    seal, .022, {radius: .120, subdivisions: 12});
  patchFront('Upper front glazing mask',
    [[-.996,2.53],[.996,2.53],[.956,4.00],[-.956,4.00]],
    panel, .026, {radius: .100, subdivisions: 12});
  const blueDeep = new THREE.Color('#101b24');
  const blueGray = new THREE.Color('#384951');
  const sideDeep = new THREE.Color('#111d25');
  const sideBlue = new THREE.Color('#294755');
  function frontTint(z, y) {
    const low = 1 - unit((y - 2.59) / 1.32);
    return blueDeep.clone().lerp(blueGray, .20 + .60 * low + .085 * unit((.50 - z) / 1.20));
  }
  const sideTint = (x, y) => sideDeep.clone().lerp(sideBlue,
    .32 + .43 * unit((y - 2.35) / .82) + .11 * Math.cos((x + 1.2) * 5.0));
  patchFront('Single-piece cab windshield',
    [[-.942,2.59],[.942,2.59],[.926,3.84],[-.926,3.84]],
    glass, .032, {radius: .090, subdivisions: 14, shade: frontTint});
  patchFront('Destination sign glass surround',
    [[-.93,3.85],[.93,3.85],[.93,3.979],[-.93,3.979]], lens, .032,
    {radius: .017, subdivisions: 13});
  patchFront('Destination sign display',
    [[-.876,3.866],[.876,3.866],[.876,3.961],[-.876,3.961]], ledFrame, .037,
    {radius: .008, subdivisions: 13});

  function bitmap(name, content, widthPitch, heightPitch, map, mat, normal, fill = .82) {
    const positions = [];
    const indices = [];
    const caption = content.toUpperCase();
    const glyphs = [...caption].map(character => displayAlphabet[character] ?? displayAlphabet[' ']);
    const advance = (glyphs.length * 6 - 1) * widthPitch;
    for (const [column, glyph] of glyphs.entries()) {
      for (const [row, bits] of glyph.entries()) {
        for (let pixel = 0; pixel < bits.length; pixel += 1) {
          if (bits[pixel] !== '1') continue;
          const x = (column * 6 + pixel + .5) * widthPitch - advance / 2;
          const y = (3 - row) * heightPitch;
          const dx = widthPitch * fill / 2;
          const dy = heightPitch * fill / 2;
          const first = positions.length / 3;
          const corners = [map(x-dx,y-dy), map(x+dx,y-dy), map(x+dx,y+dy), map(x-dx,y+dy)];
          positions.push(...corners.flatMap(p => p.toArray()));
          const facing = corners[1].clone().sub(corners[0])
            .cross(corners[2].clone().sub(corners[0])).dot(normal);
          if (facing > 0) indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
          else indices.push(first, first + 2, first + 1, first, first + 3, first + 2);
        }
      }
    }
    if (indices.length) return geometry(name, positions, indices, mat);
  }

  const ahead = new THREE.Vector3(1, 0, 0);
  if (active) {
    const wording = `${ctx.service ?? '159'} ${ctx.destination ?? 'San Francisco'}`.slice(0, 22);
    bitmap('Destination and train number', wording, Math.min(.0155, 1.63 / (wording.length * 6)),
      .012, (a, b) => front(-a, 3.915 + b, .043), led, ahead);
  }

  const segments = str => str.split('').filter(digit => numberOutlines[digit]);
  function vehicleNumber(name, value, height, map, mat, normal) {
    const digits = segments(value);
    const advance = .73;
    for (const [i, digit] of digits.entries()) {
      const center = (i - (digits.length - 1) / 2) * advance - .31;
      const outline = numberOutlines[digit].map(([a, b]) => [(a + center) * height, (b - .46) * height]);
      patch(`${name} ${digit}`, outline, map, mat, {radius: 0, subdivisions: 2, normal});
    }
  }

  const cabNumber = String(ctx.number ?? (active ? 321 : 322));
  vehicleNumber('Nose fleet numeral', cabNumber, .155,
    (a, b) => front(-a - .04, 1.575 + b, .016), numberBlack, ahead);

  if (ctx.makeLogo && ctx.noseLogo) {
    const brand = ctx.makeLogo(THREE, .72);
    brand.updateMatrixWorld(true);
    brand.traverse(child => {
      if (!child.isMesh) return;
      const geo = child.geometry.clone();
      const attr = geo.getAttribute('position');
      for (let i = 0; i < attr.count; i += 1) {
        const v = new THREE.Vector3().fromBufferAttribute(attr, i).applyMatrix4(child.matrixWorld);
        const at = front(-v.x, 2.098 + v.y, .025 + v.z);
        attr.setXYZ(i, at.x, at.y, at.z);
      }
      geo.computeVertexNormals();
      const mark = new THREE.Mesh(geo, child.material);
      mark.name = 'Caltrain nose emblem';
      group.add(mark);
    });
  }

  function rod(name, start, end, radius, mat, sides = 9) {
    const axis = end.clone().sub(start);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, axis.length(), sides), mat);
    mesh.name = name;
    mesh.position.copy(start).addScaledVector(axis, .5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), axis.normalize());
    group.add(mesh);
    return mesh;
  }

  function line(name, points, radius, mat) {
    const path = new THREE.CatmullRomCurve3(points);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(8, points.length * 6), radius, 6), mat);
    mesh.name = name;
    group.add(mesh);
    return mesh;
  }

  function rim(name, z, y, radius, mat, lift = .032, count = 18) {
    patchFront(name, Array.from({length:count}, (_, j) => {
      const t = Math.PI * 2 * j / count;
      return [z + radius * Math.cos(t), y + radius * Math.sin(t)];
    }), mat, lift, {radius: 0, subdivisions: 2});
  }

  const frontPath = (pairs, lift) => pairs.map(([z,y]) => front(z,y,lift));
  const wiperBottom = [front(.44, 2.675, .048), front(.49, 2.668, .04)];
  for (const p of wiperBottom) rod('Wiper pivot boss', p.clone().addScaledVector(ahead,-.012), p, .031, seal);
  line('Windshield wiper linkage', frontPath([[.44,2.675],[.60,2.86],[.745,3.17],[.78,3.322]], .058),
    .014, trim);
  line('Windshield wiper parallel arm', frontPath([[.49,2.668],[.66,2.87],[.76,3.12],[.775,3.303]], .049),
    .010, trim);
  line('Windshield wiper blade', frontPath([[.719,2.94],[.77,3.178],[.804,3.37],[.823,3.575]], .050),
    .015, seal);
  line('Wiper tension spring', frontPath([[.55,2.782],[.585,2.825],[.62,2.86]], .067),
    .008, steel);

  patchFront('Upper headlamp bar pocket',
    [[-.66,4.09],[.66,4.09],[.62,4.30],[-.62,4.30]], panel, .022,
    {radius: .060, subdivisions: 12});
  patchFront('Upper headlamp bar glass',
    [[-.63,4.11],[.63,4.11],[.595,4.28],[-.595,4.28]], lens, .028,
    {radius: .050, subdivisions: 12});
  for (const side of [-1, 1]) {
    const z = side * .45;
    rim('Upper headlamp reflector bezel', z, 4.195, .070, reflector, .035);
    for (const [dx, dy] of [[0,0],[-.028,0],[.028,0]]) {
      rim('Upper headlamp LED optic', z + dx, 4.195 + dy, .016, whiteLight, .050, 10);
    }
  }

  for (const side of [-1, 1]) {
    const eye = [[.470,1.600],[1.190,1.600],[1.190,1.850],[.470,1.850]];
    const inset = [[.495,1.622],[1.165,1.622],[1.165,1.828],[.495,1.828]];
    const lampPatch = (name, pts, mat, lift, subdivisions = 6) =>
      patchFront(name, pts.map(([z,y]) => [z * side,y]), mat, lift, {radius: .029, subdivisions});
    lampPatch('Angular low lamp rubber gasket', eye, seal, .017, 10);
    lampPatch('Angular smoked low lamp housing', inset, lens, .026, 10);
    const z = side * 1.014;
    rim('Ditch lamp reflector ring', z, 1.725, .085, reflector, .035);
    rim('Ditch lamp inset', z, 1.725, .066, reflectorDark, .040);
    for (const [dx,dy] of [[-.028,-.024],[.028,-.024],[0,0],[-.028,.024],[.028,.024]]) {
      rim('Ditch lamp LED lens', z + dx, 1.725 + dy, .019, whiteLight, .048, 10);
    }
    lampPatch('Rear marker matrix carrier', [[.53,1.655],[.86,1.655],[.86,1.795],[.53,1.795]],
      reflectorDark, .039);
    for (let column = 0; column < 9; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        rim('Rear marker LED lens', side * (.55 + column * .036), 1.675 + row * .033, .012, redLight, .046, 8);
      }
    }

    const vent = [[.760,.729],[1.178,.729],[1.208,1.219],[.750,1.225]];
    lampPatch('Pilot vent rubber surround', vent, seal, .024);
    lampPatch('Pilot vent shadow box', [[.786,.757],[1.154,.757],[1.176,1.197],[.778,1.198]],
      pocket, .035);
    for (let slot = 0; slot < 6; slot += 1) {
      const y = .785 + slot * .071;
      lampPatch('Pilot vent shutter', [[.797,y],[1.159,y],[1.166,y+.027],[.789,y+.027]],
        trim, .059, 3);
      lampPatch('Pilot vent shutter lip', [[.797,y+.023],[1.159,y+.023],[1.166,y+.033],[.789,y+.033]],
        gray, .062, 3);
    }
    for (const [x,y] of [[-.71,.76],[-1.40,.72],[-1.94,.74],[-2.88,.74],[-.70,1.318],
      [-1.38,1.315],[-2.08,1.32],[-2.94,1.315]]) {
      patchSide('Countersunk bumper fastener',
        [[x-.011,y],[x,y-.013],[x+.011,y],[x,y+.013]], trim, side, .011, {radius: .004});
    }

    patchSide('Cab side window continuous exterior mask',
      [[-3.50,2.393],[-1.09,2.393],[-1.02,2.49],[-1.48,3.203],[-3.49,3.203],[-3.57,3.13],[-3.57,2.49]],
      panel, side, .012, {radius: .062, subdivisions: 13});
    patchSide('Forward cab quarter window',
      [[-1.95,2.44],[-1.14,2.454],[-1.09,2.514],[-1.489,3.125],[-2.174,3.125]],
      sideGlass, side, .015, {radius: .062, subdivisions: 11, shade: sideTint});
    patchSide('Sliding crew window rubber frame',
      [[-3.49,2.435],[-2.59,2.435],[-2.59,3.16],[-3.49,3.16]],
      seal, side, .017, {radius: .098, subdivisions: 8});
    patchSide('Sliding crew window glass',
      [[-3.43,2.493],[-2.649,2.493],[-2.649,3.107],[-3.43,3.107]],
      sideGlass, side, .021, {radius: .089, subdivisions: 10, shade: (x,y) => sideTint(x, y).multiplyScalar(1.2)});

    const flankPath = (points, lift) => points.map(([x,y]) => flank(x,y,side,lift));
    line('Cab module joint', flankPath([[-1.89,.49],[-1.89,1.46],[-1.89,2.39],[-2.335,3.21],
      [-2.68,4.00],[-2.93,4.52]], .005), .008, gray);
    patchSide('Crew window latch',
      [[-2.67,2.635],[-2.62,2.63],[-2.62,2.82],[-2.67,2.825]], trim, side, .027,
      {radius: .018});
    patchSide('Cab side access service fitting',
      [[-2.66,2.074],[-2.57,2.074],[-2.57,2.185],[-2.66,2.185]], trim, side, .016);

    const strikeBase = flank(-3.04, 1.915, side, .003);
    const plate = new THREE.Mesh(new THREE.SphereGeometry(1,16,8), red);
    plate.name = 'Red cab access pull cover';
    plate.scale.set(.10,.079,.015);
    plate.position.copy(strikeBase);
    group.add(plate);

    const normal = new THREE.Vector3(0,0,side);
    vehicleNumber('Cab side fleet numeral', cabNumber, .248,
      (a,b) => flank(-1.57 + a * side, 2.164 + b, side, .012), white, normal);
  }

  function box(name, dims, at, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dims), mat);
    mesh.name = name;
    mesh.position.set(...at);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function pocketWall(side) {
    const vertices = [];
    const indices = [];
    for (let row = 0; row <= 16; row += 1) {
      const y = mix(.46, 1.33, row / 16);
      const w = side * mix(.660,.615,smooth(row / 2.1));
      const p = front(w, y);
      vertices.push(...p.toArray(), -.63, p.y, w * .94);
      if (row < 16) {
        const n = row * 2;
        if (side > 0) indices.push(n,n+1,n+2,n+1,n+3,n+2);
        else indices.push(n,n+2,n+1,n+1,n+2,n+3);
      }
    }
    geometry('Coupler pocket gelcoat return', vertices, indices, white);
  }
  pocketWall(1);
  pocketWall(-1);
  box('Coupler pocket transverse lining', [.10,.82,1.25], [-.642,.902,0], pocket);
  box('Coupler slot top shelf', [.54,.078,1.25], [-.371,1.297,0], pocket);
  box('Pilot backing crossmember', [.34,.117,2.37], [-.71,.353,0], pilots);

  function deflector() {
    const shape = [
      [-.06,.269,-1.28],[-.06,.269,1.28],[-.38,.357,1.41],[-.38,.357,-1.41],
      [-.075,.203,-1.27],[-.075,.203,1.27],[-.39,.294,1.40],[-.39,.294,-1.40]
    ];
    const verts = shape.flat();
    const faces = [0,2,1,0,3,2,0,5,4,0,1,5,1,6,5,1,2,6,
      2,7,6,2,3,7,3,4,7,3,0,4,4,6,7,4,5,6];
    geometry('Wide pilot snow and obstacle deflector', verts, faces, pilots);
    box('Replaceable pilot wear lip', [.024,.045,2.54], [-.064,.207,0], edge);
    for (let z = -1.20; z <= 1.201; z += .24) {
      rod('Pilot wear lip bolt', new THREE.Vector3(-.057,.207,z), new THREE.Vector3(-.046,.207,z),
        .012, steel, 6);
    }
  }
  deflector();

  const pin = (name, x1, x2, y, z, rad, mat, sides = 14) =>
    rod(name, new THREE.Vector3(x1,y,z), new THREE.Vector3(x2,y,z), rad, mat, sides);
  pin('Automatic coupler draw tube', -.65, .125, .876, 0, .132, steel);
  for (let i = 0; i < 8; i += 1) {
    pin('Coupler draft gear boot convolution', -.49 + i * .031, -.477 + i * .031, .876, 0,
      .160 + i * .002, redCable, 24);
  }
  box('Coupler body', [.345,.35,.462], [.141,.857,.018], steel);
  box('Automatic coupler face casting', [.159,.321,.475], [.346,.849,.015], steel);
  box('Electric head casing', [.228,.177,.481], [.315,1.054,.015], steel);
  box('Electrical head dust cover', [.217,.139,.442], [.436,1.066,.015], trim);
  box('Electrical head upper wear plate', [.243,.022,.50], [.441,1.155,.015], stainless);
  box('Electrical head lower cross strip', [.020,.027,.433], [.552,1.002,.015], stainless);
  pin('Automatic coupler gathering cone', .35,.57,.858,.104,.103,stainless,24);
  pin('Gathering cone cavity', .559,.57,.858,.104,.073,pocket,24);
  pin('Opposite coupler pocket rim', .403,.435,.85,-.104,.107,stainless,24);
  pin('Opposite coupler pocket', .424,.436,.85,-.104,.085,pocket,24);
  for (const z of [-.205,.228]) {
    for (const y of [.72,.952,1.076]) pin('Coupler keeper pin and retaining bolt',.426,.453,y,z,.019,stainless,8);
  }
  for (const side of [-1,1]) {
    line('Pilot flexible air trainline', [
      new THREE.Vector3(-.48,.99,.44 * side), new THREE.Vector3(-.29,.69,.44 * side),
      new THREE.Vector3(-.19,.566,.35 * side), new THREE.Vector3(.10,.68,.289 * side)
    ], .024, cable);
    line('Coupler electrical service cable', [
      new THREE.Vector3(-.50,1.21,.34 * side), new THREE.Vector3(-.24,.95,.30 * side),
      new THREE.Vector3(-.098,.86,.31 * side), new THREE.Vector3(.315,1.069,.238 * side)
    ], .015, pocket);
  }
  line('Coupler manual release lever', [
    new THREE.Vector3(.352,.737,.085), new THREE.Vector3(.397,.595,.081),
    new THREE.Vector3(.425,.507,.174), new THREE.Vector3(.408,.463,.251)
  ], .019, steel);
  return group;
}
