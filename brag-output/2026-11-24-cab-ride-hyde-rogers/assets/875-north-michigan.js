// 875 N Michigan Ave (the John Hancock Center until 2018): SOM's X-braced tube (Bruce Graham, architect; Fazlur Khan,
// structural engineer; completed 1969), the tapered black tower with the two white antennas at the north end of the
// downtown skyline. For the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like
// willis-tower.js and museum-park.js. It is seen from far away, so the silhouette comes first.
//
// What it draws, in the tower's own frame (its grid turned 1.0 degree counterclockwise from true north):
//   - The tapered tube: 80.77 x 50.29 m (265 x 165 ft) at grade, the long faces north and south, narrowing in straight
//     lines to 48.77 x 30.48 m (160 x 100 ft) at the parapet, 337.4 m. A curtain wall of black aluminum and bronze glass
//     painted on one canvas a face, floor by floor: the glass storefront of the two lobby floors, the commercial floors
//     (3-5), the parking floors (6-12) behind dark panels, the offices (13-41) with larger windows, a mechanical band
//     (42-43), the residences (44-92), the observatory and former restaurant floors (93-96), the top mechanical floors
//     (97-99), the pale band of the 100th (where the white lights are) and the black parapet over it.
//   - The X-braces as raised strips on all four faces: five X's stacked from the second floor to the 93rd, each
//     diagonal running corner to corner, a horizontal tie at every node, so they wrap round the corners.
//   - The roof: the deck inside the parapet, the black mechanical penthouse to 343.7 m, a few small masts.
//   - The two antennas as they stood in 2024: a white cylindrical base 3.3 m across, then a white lattice mast; the
//     east one (taller) ends in a thin whip at 457.2 m, the west one at 424.3 m, with an equipment cage round its base.
//   - The base: the plaza on Michigan Ave with its elliptical sunken court (a railing, the paving and the pool), the
//     entrance canopies on the north, south and west and the curved canopy at the court's south end.
//
// Where the numbers come from:
//   - Footprint, center and turn: OpenStreetMap, November 27, 2026, through the Chicago Cityscape CLI: the building way
//     31064573 and its five parts (ways 232905278, 232905280, 232905283, 232906397, 232914185, the four sloping faces
//     and the top), whose top face is 49.0 x 30.8 m and base 82.3 x 52.5 m, both on the same center and turned 0.95-1.0
//     degrees. The dimensions drawn are the published ones: 80.77 x 50.29 m at the base (SkyscraperPage, buildingID 17,
//     which labels the axes the other way round; OpenStreetMap and every photograph put the long faces north and
//     south) and 160 x 100 ft at the top (OpenStreetMap's top face agrees to 0.3 m).
//   - Heights: the parapet at 337.4 m (1,107 ft, SkyscraperPage's "lower roof", from the blueprint in the lobby) and the
//     penthouse at 343.7 m (1,128 ft, CTBUH's architectural height and Wikipedia's roof). One LiDAR check (Cook County
//     2022, ISGS DSM less the DTM, an east-west line through the antennas at 1 m steps) agrees: the parapet's returns
//     at 517.6-517.7 m NAVD88 are 337.3-337.4 m over Michigan Ave's grade (180.3 m), the penthouse's 523.9-526.8 m are
//     343.6-346.5 m (its rooftop gear above the 343.7), the deck between them 332-334 m. The dark glass gave few
//     returns: inside the walls the DSM falls to the ground in places, so the faces were not measured from it. The DTM
//     shows the sunken court 4.3 m below Michigan Ave, from about 9 to 27 m west of the tower's west face.
//   - Floors: 100 (CTBUH, Wikipedia); their uses from Wikipedia (offices below the 44th-floor sky lobby, residences
//     44-92, the observatory on the 94th, the restaurant and lounge on the 95th and 96th, closed in 2023, parking on
//     the lower floors).
//   - Antennas: their positions from OpenStreetMap's mast nodes 9332348649 and 9332348650 (31.0 m apart on the long
//     axis) and the antenna ways 279951771 and 279951772 (3.3 m across, for the white bases). The east tip at 457.2 m
//     (1,500 ft, FCC registration 1009012 as SkyscraperPage cites it; CTBUH and Wikipedia 1,499 ft). The west tip at
//     424.3 m: Wikipedia says the west antenna "was reduced to a height of 285 feet" and the east "extended to 378
//     feet"; 285 ft over the 1,107 ft roof is 1,392 ft, 424.3 m, and a photograph from December 2024 (Ames, below),
//     scaled from the east tip and the penthouse, puts the west top at 423.5 m (+-4 m). (SkyscraperPage's 1,476 ft for
//     the lower antenna is older than the cut, so it is not used.) The sections (the bases to about 367 m, the east
//     lattice to 429.6 m and then the whip; the west's cage at 352-360 m) are read off the same photograph.
//   - The X-braces, the bays and the colors, from photographs on Wikimedia Commons: "Chicago in 2022 John Hancock
//     Center (52054925135).jpg" (Chris Rycroft, March 21, 2022, CC BY 2.0: the south face, five X's on the broad face,
//     the top tie about half an X under the parapet, four bays between column covers, the braces lighter and browner
//     than the glass, the pale top band), "John Hancock Center in Chicago seen above fog, December 2024
//     (54349201865).jpg" (Cole Ames, public domain: the roof, the penthouse and both antennas, white), and "Plaza, John
//     Hancock Center, Michigan Avenue, Streeterville, Chicago, IL.jpg" (Warren LeMay, June 13, 2024, CC BY-SA 2.0: the
//     plaza). SOM: "black anodized aluminum" and "bronze-tinted glass" (assumed from SOM's era: the same skin as the
//     Willis Tower; the photographs agree).
//   - The canopies and the curved canopy: OpenStreetMap's building=roof ways 1282265436, 1282265437, 1282293649 and
//     1282293648, as the city files carry them.
//   Assumed: the tie levels (7.3 m, then every 60.5 m to 310 m, from the photographs' proportions; an X spans about 18
//   floors); the strips' widths (1.7 m) and how proud they stand; the floor heights (4.88 m for floors 1-5, then even
//   to 334.3 m at the top of the 100th); the uses painted on each band (the parking panels and the mechanical louvers
//   in particular); three bays on the narrow faces and five windows a bay; the deck's level (334 m); the penthouse's
//   outline (OpenStreetMap's) and its plain black walls; the small rooftop masts; the antennas' widths and section
//   breaks (+-1-2 m), the lattice's pattern, the beacons left out; the sunken court drawn at grade (the film's ground
//   is flat at y = 0), its north-south length (40 m), the pool; the canopies' height (5.5 m) and columns; all colors.
//   Reference images: refs/875-north-michigan/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildNorthMichigan875, northMichigan875Site } from "./875-north-michigan.js";
//   scene.add(buildNorthMichigan875({ THREE }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at
// the lakefront). Pass { origin: NORTH_MICHIGAN_875_CENTRE } to have the tower's center at (0, 0, 0). It needs a browser
// (or another DOM with <canvas>): the facades are painted on canvas textures.
export const NORTH_MICHIGAN_875_CENTRE = [-87.623098, 41.898821];   // the center of the tube, +-1 m
const FILM_ORIGIN = [-87.620063, 41.863968];
const TURN = 1.0 * Math.PI / 180;                                     // the grid, counterclockwise from true north

// ---- the tube, in the tower's frame: u east, n north (z = -n), meters from the center ----
const BASE_W = 80.77, BASE_D = 50.29, TOP_W = 48.77, TOP_D = 30.48;
const PARAPET = 337.4, DECK = 334.0, PENT = 343.7, BAND100 = 334.3;
const halfW = (y) => (BASE_W + (TOP_W - BASE_W) * (y / PARAPET)) / 2;
const halfD = (y) => (BASE_D + (TOP_D - BASE_D) * (y / PARAPET)) / 2;
// floor n's level: 4.88 m floors to the 6th, then even to the top of the 100th
const level = (n) => (n <= 6 ? (n - 1) * 4.88 : 24.4 + ((n - 6) * (BAND100 - 24.4)) / 95);
// the X-braces' nodes: five X's
const TIES = [7.3, 67.8, 128.4, 188.9, 249.5, 310.0];
// the antennas: OpenStreetMap's mast nodes [lon, lat]
const ANT_W = [-87.6232861, 41.8988133], ANT_E = [-87.6229116, 41.8988192];
const TIP_E = 457.2, TIP_W = 424.3;
// city-file outlines (film frame, meters east and south of the center): the penthouse and the canopies
const PENTHOUSE = [[-22.3, -6.5], [-18.9, -8.5], [15, -8.8], [15.3, 7.9], [-12.6, 8.2], [-12.6, 10.6], [-15.8, 10.6], [-22.3, 7.4]];
const CANOPIES = [
  [[-13.6, -25.9], [-13.7, -31.1], [0.3, -31.3], [0.4, -26.2]],                                   // north door (1282265436)
  [[-12.9, 26.6], [-12.7, 31.3], [13.7, 31], [13.6, 26.1]],                                       // south door (1282265437)
  [[-41.4, -14.7], [-44.5, -14.6], [-43.9, 15.9], [-40.8, 15.9]],                                 // Michigan Ave (1282293649)
  [[-62.3, 28.3], [-62.7, 27.5], [-59.1, 25.6], [-54.3, 19.8], [-52.1, 13.2], [-51, 10], [-49.3, 10.5], [-50, 13.4],
    [-51.9, 17.9], [-54.3, 21.9], [-56.9, 25.1], [-60.2, 27.4]],                                  // the curved one (1282293648)
];
const COURT = { x: -54, z: 0, a: 9, b: 20 };                          // the sunken court (film frame), semi-axes
// The site (film frame offsets from the center): the tower, its plaza to Michigan Ave's sidewalk and the canopies; not
// the parking helix to the east
const SITE = [[-67, -33], [46, -33], [46, 33], [-67, 33]];

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The site as a closed ring of local meters [x0, z0, x1, z1, ..., x0, z0], for clearing OpenStreetMap's buildings
export function northMichigan875Site(origin = FILM_ORIGIN) {
  const [cx, cz] = local(origin)(...NORTH_MICHIGAN_875_CENTRE), r = SITE.flatMap(([x, z]) => [cx + x, cz + z]);
  return [[...r, r[0], r[1]]];
}

export function buildNorthMichigan875({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...NORTH_MICHIGAN_875_CENTRE), g = new THREE.Group();
  g.name = "875-north-michigan";
  g.position.set(cx, 0, cz); g.rotation.y = TURN;                     // everything below is in the tower's frame (x = u, z = -n)
  // film-frame offsets (meters east, south of the center) to the tower's frame [u, n]
  const toUN = (dx, dz) => [dx * Math.cos(TURN) - dz * Math.sin(TURN), -(dx * Math.sin(TURN) + dz * Math.cos(TURN))];
  const lonlatUN = (ll) => { const [x, z] = L(...ll); return toUN(x - cx, z - cz); };
  let seed = 23;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)
  const rgb = (c, s = 1) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * s)))).join(",")})`;

  // ======== the facade: one canvas pair (color, and the sky the glass reflects), the broad faces on the left half,
  // the narrow on the right; v runs from grade (0) to the parapet (1) ========
  const CW = 1024, CH = 2048, HALF = CW / 2;
  const cvD = document.createElement("canvas"), cvE = document.createElement("canvas");
  cvD.width = cvE.width = CW; cvD.height = cvE.height = CH;
  const cD = cvD.getContext("2d"), cE = cvE.getContext("2d");
  const row = (y) => (1 - y / PARAPET) * CH;
  const ALUM = [46, 43, 41], ALUM_E = [34, 36, 40];
  cD.fillStyle = rgb(ALUM); cD.fillRect(0, 0, CW, CH);
  cE.fillStyle = rgb(ALUM_E); cE.fillRect(0, 0, CW, CH);
  // floor bands: [first, last, kind]
  const KINDS = [[1, 2, "lobby"], [3, 5, "shop"], [6, 12, "park"], [13, 41, "office"], [42, 43, "mech"], [44, 92, "home"],
    [93, 96, "obs"], [97, 99, "mech"], [100, 100, "band"]];
  const kindOf = (n) => KINDS.find(([a, b]) => n >= a && n <= b)[2];
  const paintFace = (x0, bays) => {
    const EDGE = 9, COVER = 6, BW = HALF / bays, WPB = 5;
    for (let n = 1; n <= 100; n++) {
      const k = kindOf(n), top = Math.round(row(level(n + 1))), bot = Math.round(row(level(n))), h = bot - top;
      const glassH = { lobby: 0.92, shop: 0.7, park: 0.62, office: 0.7, mech: 0.75, home: 0.6, obs: 0.8, band: 0.8 }[k];
      const gy = top + 1, gh = Math.max(2, Math.round(h * glassH));
      for (let b = 0; b < bays; b++) {
        const l = x0 + b * BW + (b ? COVER / 2 : EDGE), r = x0 + (b + 1) * BW - (b < bays - 1 ? COVER / 2 : EDGE);
        const per = k === "lobby" ? 3 : WPB, w = (r - l) / per;
        for (let i = 0; i < per; i++) {
          const wx = Math.round(l + i * w + 1), ww = Math.max(1, Math.round(w - 2)), s = 0.82 + rnd() * 0.36;
          if (k === "park" || k === "mech") {                        // dark panels, louvered
            cD.fillStyle = rgb([30, 29, 28], s); cD.fillRect(wx, gy, ww, gh);
            cE.fillStyle = rgb([26, 28, 31], s); cE.fillRect(wx, gy, ww, gh);
            cD.fillStyle = "rgba(90,86,80,0.35)"; for (let y = gy + 1; y < gy + gh; y += 2) cD.fillRect(wx, y, ww, 1);
          } else if (k === "band") {                                  // the pale top band
            cD.fillStyle = rgb([150, 160, 150], s); cD.fillRect(wx, gy, ww, gh);
            cE.fillStyle = rgb([150, 166, 172], s); cE.fillRect(wx, gy, ww, gh);
          } else {                                                    // bronze glass
            const lift = k === "office" || k === "obs" || k === "lobby" ? 1.15 : 1;
            cD.fillStyle = rgb([62, 50, 38], s * lift); cD.fillRect(wx, gy, ww, gh);
            const gr = cE.createLinearGradient(0, gy, 0, gy + gh);
            gr.addColorStop(0, rgb([92, 98, 106], s * lift)); gr.addColorStop(1, rgb([50, 52, 56], s * lift));
            cE.fillStyle = gr; cE.fillRect(wx, gy, ww, gh);
            if (k === "home" && rnd() < 0.35) {                       // curtains and blinds
              cD.fillStyle = rgb([92, 84, 72], 0.8 + rnd() * 0.4); cD.fillRect(wx, gy, ww, Math.round(gh * (0.3 + rnd() * 0.7)));
            }
          }
        }
      }
    }
    // the column covers and the corner columns, catching the light on one edge
    for (let b = 1; b < bays; b++) {
      const x = x0 + b * BW - COVER / 2;
      cD.fillStyle = "#3e3a37"; cD.fillRect(x, 0, COVER, CH); cD.fillStyle = "#57514b"; cD.fillRect(x, 0, 1, CH);
      cE.fillStyle = "#2f3236"; cE.fillRect(x, 0, COVER, CH);
    }
    for (const x of [x0, x0 + HALF - EDGE]) {
      cD.fillStyle = "#3a3633"; cD.fillRect(x, 0, EDGE, CH); cE.fillStyle = "#2c2f33"; cE.fillRect(x, 0, EDGE, CH);
    }
    // the parapet over the 100th: black
    const p = Math.round(row(BAND100));
    cD.fillStyle = "#1d1c1b"; cD.fillRect(x0, 0, HALF, p); cE.fillStyle = "#1b1d20"; cE.fillRect(x0, 0, HALF, p);
  };
  paintFace(0, 4);                                                    // the broad faces: four bays (Rycroft's photograph)
  paintFace(HALF, 3);                                                 // the narrow faces: three (assumed)
  const tex = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const facadeD = tex(cvD), facadeE = tex(cvE);
  const one = (w, h, draw) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = tex(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const paving = one(128, 128, (c, w, h) => {                         // granite paving in 1.5 m squares (4 a tile)
    c.fillStyle = "#a9a49c"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = rgb([170, 165, 156], 0.92 + rnd() * 0.14); c.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); }
  });

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, vertexColors: true, side: THREE.DoubleSide, ...o });
  const MAT = {
    facade: std({ map: facadeD, emissive: 0xffffff, emissiveMap: facadeE, emissiveIntensity: 0.34, roughness: 0.5, metalness: 0.2 }),
    frame: std({ color: 0x5e564e, roughness: 0.5, metalness: 0.25 }),   // the braces, the ties, the coping, the railing
    dark: std({ color: 0x1c1c1d, roughness: 0.6, metalness: 0.2 }),     // the penthouse, the canopies
    roof: std({ color: 0x6f6d69, roughness: 0.9 }),                     // the deck
    white: std({ color: 0xf0f1ee, roughness: 0.45, emissive: 0xe8eaec, emissiveIntensity: 0.16 }),   // the antennas' bases, the whip
    lattice: std({ color: 0xe8eae9, roughness: 0.55, emissive: 0xe2e4e6, emissiveIntensity: 0.14 }),  // the lattice masts, the rooftop masts
    core: std({ color: 0xbcc1c4, roughness: 0.7, emissive: 0xb8bdc2, emissiveIntensity: 0.12 }),   // inside the masts (see lattice())
    pave: std({ map: paving, roughness: 0.95 }),
    water: std({ color: 0x41545e, roughness: 0.15, metalness: 0.3 }),
  };

  // ======== the geometry, gathered by material into one mesh each ========
  const B = {};
  const bt = (k) => B[k] || (B[k] = { p: [], n: [], t: [], c: [] });
  const P = (u, y, n) => [u, y, -n];
  const tri = (k, a, b, c, ta = [0, 0], tb = [0, 0], tc = [0, 0], s = 1) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const q = bt(k);
    for (const [p, t] of [[a, ta], [b, tb], [c, tc]]) { q.p.push(p[0], p[1], p[2]); q.n.push(nx, ny, nz); q.t.push(t[0], t[1]); q.c.push(s, s, s); }
  };
  const quad = (k, a, b, c, d, uv = [[0, 0], [1, 0], [1, 1], [0, 1]], s = 1) => { tri(k, a, b, c, uv[0], uv[1], uv[2], s); tri(k, a, c, d, uv[0], uv[2], uv[3], s); };
  const addGeo = (k, geo, s = 1) => {
    const gg = geo.index ? geo.toNonIndexed() : geo, q = bt(k), Ps = gg.attributes.position, Ns = gg.attributes.normal, Ts = gg.attributes.uv;
    for (let i = 0; i < Ps.count; i++) {
      q.p.push(Ps.getX(i), Ps.getY(i), Ps.getZ(i)); q.n.push(Ns.getX(i), Ns.getY(i), Ns.getZ(i));
      q.t.push(Ts ? Ts.getX(i) : 0, Ts ? Ts.getY(i) : 0); q.c.push(s, s, s);
    }
    geo.dispose(); if (gg !== geo) gg.dispose();
  };
  const cyl = (k, u, n, y0, y1, r0, r1 = r0, seg = 16, caps = true, s = 1) => {
    const geo = new THREE.CylinderGeometry(r1, r0, y1 - y0, seg, 1, !caps); geo.translate(u, (y0 + y1) / 2, -n); addGeo(k, geo, s);
  };
  const up = new THREE.Vector3(0, 1, 0);
  const rod = (k, a, b, r, seg = 4, s = 1) => {                        // a cylinder from a to b ([u, y, n])
    const A = new THREE.Vector3(...P(...a)), Bv = new THREE.Vector3(...P(...b)), d = Bv.clone().sub(A), l = d.length();
    const geo = new THREE.CylinderGeometry(r, r, l, seg, 1, true);
    geo.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(up, d.normalize()), new THREE.Vector3(1, 1, 1)));
    addGeo(k, geo, s);
  };
  // a flat polygon ([u, n], optional holes) at height y, texture in meters / tile
  const flat = (k, pts, y, tile = 6, s = 1, holes = []) => {
    const all = [...pts, ...holes.flat()];
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(([u, n]) => new THREE.Vector2(u, n)), holes.map((h) => h.map(([u, n]) => new THREE.Vector2(u, n))));
    for (const [a, b, c] of tris) tri(k, P(all[a][0], y, all[a][1]), P(all[b][0], y, all[b][1]), P(all[c][0], y, all[c][1]),
      [all[a][0] / tile, all[a][1] / tile], [all[b][0] / tile, all[b][1] / tile], [all[c][0] / tile, all[c][1] / tile], s);
  };
  const prism = (k, pts, y0, y1, s = 1) => {                          // walls, top and bottom
    for (let i = 0; i < pts.length; i++) {
      const [u0, n0] = pts[i], [u1, n1] = pts[(i + 1) % pts.length];
      quad(k, P(u0, y0, n0), P(u1, y0, n1), P(u1, y1, n1), P(u0, y1, n0), undefined, s * 0.9);
    }
    flat(k, pts, y1, 6, s); flat(k, pts, y0, 6, s * 0.6);
  };

  // ======== the tube ========
  // a point on face f at s (-1 left to 1 right, seen from outside) and height y, `out` meters proud of it
  const FACES = {
    S: (s, y, o) => [s * halfW(y), y, -halfD(y) - o], N: (s, y, o) => [-s * halfW(y), y, halfD(y) + o],
    E: (s, y, o) => [halfW(y) + o, y, s * halfD(y)], W: (s, y, o) => [-halfW(y) - o, y, -s * halfD(y)],
  };
  const fp = (f, s, y, o = 0) => { const [u, yy, n] = FACES[f](s, y, o); return P(u, yy, n); };
  const STRIPS = 24;
  for (const f of ["S", "N", "E", "W"]) {
    const u0 = f === "S" || f === "N" ? 0.001 : 0.501, u1 = u0 + 0.498;
    for (let i = 0; i < STRIPS; i++) {
      const y0 = (PARAPET * i) / STRIPS, y1 = (PARAPET * (i + 1)) / STRIPS, v0 = y0 / PARAPET, v1 = y1 / PARAPET;
      quad("facade", fp(f, -1, y0), fp(f, 1, y0), fp(f, 1, y1), fp(f, -1, y1), [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
    }
  }
  // the braces: a raised strip on face f from (s0, y0) to (s1, y1), `d` meters above and below that line, with its edges
  const strip = (f, s0, y0, s1, y1, d, o) => {
    const ext = (s, y) => s * (1 + o / (f === "S" || f === "N" ? halfW(y) : halfD(y)));   // close the corners
    const a = fp(f, ext(s0, y0), y0 - d, o), b = fp(f, ext(s1, y1), y1 - d, o), c = fp(f, ext(s1, y1), y1 + d, o), e = fp(f, ext(s0, y0), y0 + d, o);
    quad("frame", a, b, c, e);
    quad("frame", fp(f, s0, y0 - d), fp(f, s1, y1 - d), b, a, undefined, 0.7);
    quad("frame", e, c, fp(f, s1, y1 + d), fp(f, s0, y0 + d), undefined, 1.1);
  };
  const HW = 0.85;                                                    // half the strips' width
  for (const f of ["S", "N", "E", "W"]) {
    const wide = f === "S" || f === "N";
    for (const y of TIES) strip(f, -1, y, 1, y, HW, 0.3);
    for (let i = 0; i < TIES.length - 1; i++) {
      const y0 = TIES[i], y1 = TIES[i + 1], w = 2 * (wide ? halfW((y0 + y1) / 2) : halfD((y0 + y1) / 2));
      const d = HW / Math.cos(Math.atan2(y1 - y0, w));
      strip(f, -1, y0, 1, y1, d, 0.38);
      strip(f, 1, y0, -1, y1, d, 0.46);
    }
  }
  // the roof: the parapet's coping, its inner walls, the deck
  {
    const o = [[-halfW(PARAPET), -halfD(PARAPET)], [halfW(PARAPET), -halfD(PARAPET)], [halfW(PARAPET), halfD(PARAPET)], [-halfW(PARAPET), halfD(PARAPET)]];
    const i = o.map(([u, n]) => [u - Math.sign(u) * 0.6, n - Math.sign(n) * 0.6]);
    for (let k = 0; k < 4; k++) {
      const a = o[k], b = o[(k + 1) % 4], c = i[(k + 1) % 4], d = i[k];
      quad("dark", P(a[0], PARAPET, a[1]), P(b[0], PARAPET, b[1]), P(c[0], PARAPET, c[1]), P(d[0], PARAPET, d[1]));
      quad("dark", P(d[0], DECK, d[1]), P(c[0], DECK, c[1]), P(c[0], PARAPET, c[1]), P(d[0], PARAPET, d[1]), undefined, 0.8);
    }
    flat("roof", i, DECK, 6);
  }
  // the penthouse (OpenStreetMap's outline), black, with a coping
  const pent = PENTHOUSE.map(([x, z]) => toUN(x, z));
  prism("dark", pent, DECK, PENT);
  // a few small masts and dishes on the roof (assumed)
  for (let k = 0; k < 14; k++) {
    const u = -20 + rnd() * 34, n = (rnd() < 0.5 ? -1 : 1) * (9.5 + rnd() * 4), h = 3 + rnd() * 6;
    rod("lattice", [u, DECK, n], [u, DECK + h, n], 0.12, 4);
  }
  for (let k = 0; k < 8; k++) { const u = -18 + rnd() * 30, n = -7 + rnd() * 14, h = 2 + rnd() * 5; rod("lattice", [u, PENT, n], [u, PENT + h, n], 0.1, 4); }

  // ======== the antennas ========
  // a square lattice mast `w` wide from y0 to y1: four legs, a zigzag on each face every `p` meters, and (core) a solid
  // grey prism inside: the real masts' steel is dense and full of feed lines and panel antennas, so from any distance
  // they read as near-solid white columns with dark texture (Ames's photograph), not as empty frames
  const lattice = (u, n, y0, y1, w, p = 2.5, core = true) => {
    const h = w / 2, C = [[-h, -h], [h, -h], [h, h], [-h, h]];
    if (core) { const geo = new THREE.BoxGeometry(w * 0.84, y1 - y0, w * 0.84); geo.translate(u, (y0 + y1) / 2, -n); addGeo("core", geo); }
    for (const [du, dn] of C) rod("lattice", [u + du, y0, n + dn], [u + du, y1, n + dn], 0.13, 4);
    const steps = Math.max(1, Math.round((y1 - y0) / p)), dy = (y1 - y0) / steps;
    for (let f = 0; f < 4; f++) {
      const [au, an] = C[f], [bu, bn] = C[(f + 1) % 4];
      for (let j = 0; j < steps; j++) {
        const ya = y0 + j * dy, yb = ya + dy, [pu, pn] = j % 2 ? [au, an] : [bu, bn], [qu, qn] = j % 2 ? [bu, bn] : [au, an];
        rod("lattice", [u + pu, ya, n + pn], [u + qu, yb, n + qn], 0.07, 3);
      }
    }
  };
  const [eu, en] = lonlatUN(ANT_E), [wu, wn] = lonlatUN(ANT_W);
  // the east antenna: the white base, a lattice, its equipment section, the whip
  cyl("white", eu, en, DECK, 367.2, 1.65, 1.65, 16, true);
  cyl("white", eu, en, 367.2, 368.4, 1.65, 1.2, 16, false);
  lattice(eu, en, 368.4, 420, 2.1);
  cyl("lattice", eu, en, 420, 429.6, 1.5, 1.5, 4, true, 0.95);        // the equipment section (a boxy lattice in the photograph)
  cyl("white", eu, en, 429.6, TIP_E, 0.36, 0.1, 8, true);
  // the west antenna: the white base with its cage, a lattice to the top
  cyl("white", wu, wn, DECK, 366, 1.65, 1.65, 16, true);
  cyl("white", wu, wn, 366, 367.2, 1.65, 1.15, 16, false);
  lattice(wu, wn, 352, 360, 6.0, 4, false);                           // the equipment cage round the base (open: a frame of panels)
  lattice(wu, wn, 367.2, TIP_W, 2.0);
  cyl("lattice", wu, wn, TIP_W - 0.3, TIP_W, 1.2, 1.2, 4, true);      // its top plate

  // ======== the base: the plaza, the sunken court, the canopies ========
  {
    const site = SITE.map(([x, z]) => toUN(x, z));
    const SEG = 28, ell = (a, b) => Array.from({ length: SEG }, (_, i) => { const t = (i / SEG) * 2 * Math.PI; return toUN(COURT.x + a * Math.cos(t), COURT.z + b * Math.sin(t)); });
    const rim = ell(COURT.a, COURT.b), pool = ell(COURT.a * 0.55, COURT.b * 0.62);
    flat("pave", site, 0.04, 6, 1, [rim.slice().reverse()]);
    flat("pave", rim, 0.03, 6, 0.62);                                 // the court, darker (it is 4.3 m down)
    flat("water", pool, 0.06, 6);
    for (let i = 0; i < SEG; i++) {                                   // the railing round the court: a low wall
      const [u0, n0] = rim[i], [u1, n1] = rim[(i + 1) % SEG];
      quad("frame", P(u0, 0, n0), P(u1, 0, n1), P(u1, 1.05, n1), P(u0, 1.05, n0), undefined, 0.9);
    }
    for (const c of CANOPIES) {
      const pts = c.map(([x, z]) => toUN(x, z));
      prism("dark", pts, 4.9, 5.5);
      const cols = pts.length > 6 ? [pts[1], pts[4], pts[6]] : [pts[0], pts[3]];   // (assumed)
      for (const [u, n] of cols) cyl("dark", u, n, 0, 4.9, 0.22, 0.22, 8, false);
    }
  }

  // ======== one mesh a material ========
  let triangles = 0;
  for (const [k, q] of Object.entries(B)) {
    if (!q.p.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(q.p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(q.n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(q.t, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(q.c, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, MAT[k]);
    mesh.name = `875-north-michigan-${k}`;
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    triangles += q.p.length / 9;
  }
  g.userData = { triangles, drawCalls: g.children.length };
  return g;
}
