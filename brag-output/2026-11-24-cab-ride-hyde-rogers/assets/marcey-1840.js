// 1840 N Marcey St, Lincoln Park: Sterling Bay's two apartment towers on the long strip between N Marcey St (east), N
// Kingsbury St (west), N Clifton Ave (north) and W Wisconsin St (south), across Kingsbury from Foundry Park (the old Finkl
// site) and about 800 m east of the UP North tracks, between the film's Division/Elston and Clybourn stations. Residential-
// Business Planned Development 1605, drawn as it would stand finished (approved, not started). For the cab-ride film
// (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js and halsted-pointe.js.
//
// The project: developer Sterling Bay (applicant 1840 N. Marcey, LLC); architect Solomon Cordwell Buenz (SCB). Introduced
// July 19, 2023; approved by the Chicago Plan Commission June 20, 2024; rejected by the Committee on Zoning in December
// 2024 and kept off that month's Council report; scaled back (615 to 590 homes, 275 to 147 parking spaces, the towers cut
// to 19 and 16 stories) and passed by the Committee on Zoning and the City Council on July 16, 2025 (Urbanize Chicago,
// July 17, 2025). Two buildings: Subarea A, the north tower on Clifton Ave, 19 stories, 282 homes, 55 parking spaces;
// Subarea B, the curved south tower along Kingsbury St, 16 stories, 308 homes, 92 spaces; 119 affordable homes in all;
// retail on the ground floors at Clifton Ave and at the south end.
//
// Where the numbers come from:
//   - Primary source: the PD ordinance as published in the City Council's Journal of July 16, 2025, pages 30785-30836
//     (gisapps.chicago.gov/gisimages/zoning_pds/PD1605.pdf): its bulk table (net site 93,957 sq ft; A 34,668 and B
//     59,289; 590 homes, 282 and 308; heights at most 245 ft for A, 195 ft for B) and SCB's exhibits dated June 20, 2024
//     (the Plan Commission set): the site plan, the roof plan and the four elevations.
//       Plan: the roof plan, traced at 300 dpi. Tower A a 70 ft x 230 ft slab on the Marcey St property line, set ~15 ft
//       back from Clifton Ave, over a podium that fills Subarea A to Kingsbury St (its roof the "accessible exterior
//       amenity deck"); its rooftop cooling tower and elevator overrun in a box in the middle. Tower B a bar that bends
//       along Kingsbury St's curve, with a notch in its east face a third of the way down, on a podium that runs on south
//       past it (another amenity deck) and frames the green court toward Marcey St.
//       Heights: the east elevation's labels, "BUILDING HEIGHT" 225'-0" for A (the scan is blurred; its own scale bar
//       measures the roof at 228 ft, and the bulk table allows 245) and 195'-0" for B (the scale bar agrees), the part of
//       B north of the notch; the rest of B measures 175 ft. The base, brick and glass with punched windows over a glass
//       storefront, 39 ft (12 m) on both; over it a lighter glass band (the amenity level) to 17 m.
//       Facade (the elevations' notes and the Plan Commission renderings): "architectural grade aluminum and glass window
//       wall" in a dark frame, blue-green glass; "architectural brick and glass" base; "architectural grade storefront";
//       balconies with "metal picket guardrail" in the recess that splits A into two blocks (57% and 39% of its length).
//   - The site: the PD's boundary map and roof plan, registered to OpenStreetMap (November 2026, through the Chicago
//     Cityscape CLI): the plan's Marcey St property line laid on Marcey St's centre line (way 24103761) 10 m to its west,
//     centred between Clifton Ave (way 24072352) and Wisconsin St (way 24102315), at 0.115 m a pixel (the plan's 679 ft
//     property line on OSM's 212 m; the plan's own 70'-0" dimension gives 0.112, its scale bar 0.118). Kingsbury St is
//     OSM's disused railway way 59204150. OSM's buildings on the site, "1818-1866 North Marcey Street" (way 210315891,
//     the warehouse) and "1868 North Marcey Street" (way 210316235), are replaced.
//   Assumed: the storey heights; the window wall's grid and colours; the recess 2 m deep; the mechanical box 4.5 m tall
//   and 1.5 m in from the slab's own roof; B's taller north block being the part north of the notch; where the drawn
//   curve of the PD boundary and of B run between the points traced; the podium decks as planted roofs; no trees.
//   Reference images: refs/marcey-1840/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildMarcey1840, marcey1840Site } from "./marcey-1840.js";
//   scene.add(buildMarcey1840({ THREE }));
//
// Coordinates are local metres, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: MARCEY_1840_CENTRE } to have the site round (0, 0, 0). It needs a browser (or another DOM with
// <canvas>): the facades are painted on canvas textures.
export const MARCEY_1840_CENTRE = [-87.6571, 41.9151];
const FILM_ORIGIN = [-87.620063, 41.863968];

// Marcey St's centre line where Clifton Ave and Wisconsin St meet it (OpenStreetMap way 24103761)
const MARCEY_N = [-87.65779, 41.916182], MARCEY_S = [-87.656027, 41.914558];
const ROW_HALF = 10.06;                    // half of Marcey St's 66 ft right of way (assumed)
const PX = 0.115;                          // metres a pixel of the roof plan at 300 dpi (see the top)
const PL_X = 1495, PL_MID_Y = 1649.5;      // the plan's Marcey St property line (x) and its midpoint (y), in pixels

// Points traced off the PD's roof plan (page 30828), pixels at 300 dpi: x right (toward Marcey St), y down (south-east)
const SITE_PX = [[1493, 728], [1497, 2571], [1400, 2490], [1307, 2393], [1220, 2290], [1136, 2150], [1060, 2010],
  [1021, 1914], [1014, 1586], [1080, 1406], [1156, 775]];
const A_PODIUM_PX = [[1491, 731], [1491, 1404], [1081, 1404], [1157, 778]];
const A_NORTH = [1300, 1490, 775, 1019], A_SLOT = [1300, 1490, 1019, 1048], A_SOUTH = [1300, 1490, 1048, 1400];
const A_MECH = [1328, 1460, 868, 1288];
const B_PODIUM_PX = [[1021, 1593], [1300, 1567], [1285, 1660], [1281, 1721], [1290, 1800], [1307, 1879], [1340, 1950],
  [1379, 2021], [1430, 2120], [1486, 2229], [1343, 2329], [1290, 2300], [1236, 2264], [1185, 2210], [1136, 2136],
  [1080, 2030], [1029, 1914]];
// Tower B, north of the notch and south of it (the shared edge runs across at the notch)
const B_NORTH_PX = [[1076, 1576], [1253, 1581], [1231, 1786], [1216, 1790], [1090, 1790], [1083, 1700]];
const B_SOUTH_PX = [[1090, 1790], [1216, 1790], [1222, 1850], [1229, 1907], [1247, 1960], [1271, 2007], [1300, 2055],
  [1333, 2100], [1221, 2186], [1185, 2135], [1150, 2079], [1128, 2030], [1111, 1979], [1097, 1973], [1092, 1900]];
const B_MECH_PX = [[1110, 1600], [1180, 1600], [1180, 1660], [1110, 1660]];   // the cooling tower at B's north end
const B_CORE_PX = [[1135, 1890], [1200, 1890], [1200, 1950], [1135, 1950]];  // the elevator overrun

// Heights, metres above the street
const BASE = 12, BAND = 17;                // the brick base and the amenity band over it, both towers
const A_TOP = 68.6;                        // 225 ft
const B_NORTH_TOP = 59.4, B_SOUTH_TOP = 53.3;   // 195 ft and 175 ft
const MECH = 4.5;                          // the rooftop boxes (assumed)
const RECESS = 2;                          // A's recess, each side (assumed)

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// the roof plan's pixels to local metres
function planToLocal(origin) {
  const L = local(origin), [nx, nz] = L(...MARCEY_N), [sx, sz] = L(...MARCEY_S);
  const len = Math.hypot(sx - nx, sz - nz), dx = (sx - nx) / len, dz = (sz - nz) / len;   // down the plan: along Marcey St
  const ex = [dz, -dx];                                                                   // across it: toward Marcey St
  const mx = (nx + sx) / 2 - ROW_HALF * ex[0], mz = (nz + sz) / 2 - ROW_HALF * ex[1];
  return ([X, Y]) => {
    const a = (X - PL_X) * PX, b = (Y - PL_MID_Y) * PX;
    return [mx + a * ex[0] + b * dx, mz + a * ex[1] + b * dz];
  };
}
const rect = ([x0, x1, y0, y1]) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// The PD's boundary as a closed ring of local metres [x, z, x, z, ...], for clearing OpenStreetMap's buildings (it holds
// both of theirs on the site; see the top)
export function marcey1840Site(origin = FILM_ORIGIN) {
  const P = planToLocal(origin), r = SITE_PX.flatMap((p) => P(p));
  return [[...r, r[0], r[1]]];
}

export function buildMarcey1840({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), P = planToLocal(origin), [cx, cz] = L(...MARCEY_1840_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz);
  const ring = (pts) => pts.map((p) => { const [x, z] = P(p); return [x - cx, z - cz]; });
  const outward = (pts) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a < 0 ? [...pts].reverse() : pts;
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---- the facades, painted once on canvases and repeated by the walls' uv (u in tiles along the wall, v up) ----
  const canvas = (draw) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    draw(cv.getContext("2d"));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  const glassPanel = (c, x, y, w, h, tones) => {
    const gr = c.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, "#a9bfc4"); gr.addColorStop(0.35, tones[Math.floor(rnd() * tones.length)]); gr.addColorStop(1, tones[Math.floor(rnd() * tones.length)]);
    c.fillStyle = gr; c.fillRect(x, y, w, h);
  };
  const TONES = ["#4d6f77", "#587b82", "#44656d", "#62858a", "#3f5f67"];
  // the window wall: one tile 9 m wide and three 3.15 m floors; panels 1.5 m, a heavy dark mullion every three of them
  // and a heavy band every three floors (the elevations' grid), thin slab lines at the floors between
  const windowWall = canvas((c) => {
    const pw = 256 / 6, ph = 256 / 3;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) glassPanel(c, k * pw, r * ph, pw, ph, TONES);
    c.fillStyle = "#2e3437"; for (let r = 0; r < 3; r++) c.fillRect(0, (r + 1) * ph - 6, 256, 6);
    for (let k = 0; k < 6; k++) c.fillRect(k * pw, 0, 3, 256);
    c.fillStyle = "#23282b"; c.fillRect(0, 0, 9, 256); c.fillRect(124, 0, 8, 256); c.fillRect(247, 0, 9, 256); c.fillRect(0, 0, 256, 9);
  });
  // A's recess: darker glass behind balconies (a pale slab edge and a dark picket rail each floor)
  const balconies = canvas((c) => {
    const ph = 256 / 3;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) glassPanel(c, k * 128, r * ph, 128, ph, ["#33494f", "#3a5157", "#2f444a"]);
    for (let r = 0; r < 3; r++) {
      const y = (r + 1) * ph;
      c.fillStyle = "rgba(10,14,16,0.35)"; c.fillRect(0, y - ph * 0.42, 256, ph * 0.3);
      c.fillStyle = "#1f2426"; for (let x = 0; x < 256; x += 6) c.fillRect(x, y - ph * 0.36, 2, ph * 0.3);
      c.fillRect(0, y - ph * 0.38, 256, 3);
      c.fillStyle = "#b8bcbd"; c.fillRect(0, y - 8, 256, 8);
    }
  });
  // the amenity band: tall clear glass in a dark frame
  const band = canvas((c) => {
    for (let k = 0; k < 6; k++) glassPanel(c, k * 256 / 6, 0, 256 / 6, 256, ["#6d8d93", "#789aa0", "#62838a"]);
    c.fillStyle = "#2a2f32"; for (let k = 0; k < 6; k++) c.fillRect(k * 256 / 6, 0, 5, 256);
    c.fillRect(0, 0, 256, 14); c.fillRect(0, 242, 256, 14);
  });
  // the base: charcoal brick with two floors of large punched windows over a tall glass storefront (one tile 6 m by 12 m;
  // the canvas's top is the tile's top)
  const base = canvas((c) => {
    c.fillStyle = "#5a504a"; c.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 150; y += 4) for (let x = (y % 8) * 2; x < 256; x += 16) {   // the brick coursing
      c.fillStyle = ["#61564f", "#544a44", "#5d534c", "#4e4540"][Math.floor(rnd() * 4)]; c.fillRect(x, y, 14, 3);
    }
    for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
      c.fillStyle = "#2a2826"; c.fillRect(26 + k * 128, 16 + r * 68, 76, 50);
      glassPanel(c, 30 + k * 128, 18 + r * 68, 68, 46, ["#4a6168", "#556d73", "#3f555b"]);
      c.fillStyle = "#2a2826"; c.fillRect(62 + k * 128, 18 + r * 68, 4, 46);
    }
    c.fillStyle = "#2b2928"; c.fillRect(0, 150, 256, 10);
    for (let k = 0; k < 4; k++) glassPanel(c, 4 + k * 64, 166, 58, 90, ["#5c7277", "#687e82", "#526a70"]);
    c.fillStyle = "#1f1e1d"; for (let k = 0; k < 5; k++) c.fillRect(k * 64 - 2, 160, 6, 96);
    c.fillRect(0, 198, 256, 3);
  });
  const metal = canvas((c) => {
    c.fillStyle = "#8a9093"; c.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 8) { c.fillStyle = "#6f7477"; c.fillRect(x, 0, 3, 256); }
    c.fillStyle = "#5d6265"; c.fillRect(0, 0, 256, 10);
  });
  // [texture, tile width m, tile height m, glassy, whole tiles per wall]
  const FACADES = {
    wall: [windowWall, 9, 9.45, true, true],
    wallCurved: [windowWall, 9, 9.45, true, false],
    balc: [balconies, 4, 9.45, true, false],
    band: [band, 9, BAND - BASE, true, false],
    base: [base, 6, BASE, false, false],
    metal: [metal, 4, MECH, false, false],
  };
  const MATS = {};
  for (const [k, [map, , , glassy]] of Object.entries(FACADES))
    MATS[k] = new THREE.MeshStandardMaterial({ map, roughness: glassy ? 0.3 : 0.85, metalness: glassy ? 0.25 : 0.05 });
  const ROOFS = {
    grey: new THREE.MeshStandardMaterial({ color: 0x8b8f92, roughness: 0.9 }),
    deck: new THREE.MeshStandardMaterial({ color: 0x7d8a6a, roughness: 1 }),
  };

  // ---- prisms, their geometry gathered per material and merged at the end ----
  const bins = new Map();
  const bin = (mat) => { if (!bins.has(mat)) bins.set(mat, { pos: [], nor: [], uv: [] }); return bins.get(mat); };
  const prism = (pts, y0, y1, face, roof) => {
    pts = outward(pts);
    const [, tileW, tileH, , whole] = FACADES[face], B = bin(MATS[face]), n = pts.length;
    let u = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1;
      const nx = dz / l, nz = -dx / l, v0 = y0 / tileH, v1 = y1 / tileH;
      const u0 = whole ? 0 : u / tileW, u1 = whole ? Math.max(1, Math.round(l / tileW)) : (u + l) / tileW;
      for (const [pt, y, uu, vv] of [[p, y0, u0, v0], [q, y1, u1, v1], [q, y0, u1, v0], [p, y0, u0, v0], [p, y1, u0, v1], [q, y1, u1, v1]]) {
        B.pos.push(pt[0], y, pt[1]); B.nor.push(nx, 0, nz); B.uv.push(uu, vv);
      }
      u += l;
    }
    if (roof) {
      const top = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))));
      top.rotateX(-Math.PI / 2); top.translate(0, y1, 0);
      const R = bin(roof), pa = top.attributes.position.array, idx = top.index.array;
      for (const k of idx) { R.pos.push(pa[k * 3], pa[k * 3 + 1], pa[k * 3 + 2]); R.nor.push(0, 1, 0); R.uv.push(0, 0); }
      top.dispose();
    }
  };
  const tower = (pts, top, face) => { prism(pts, BASE, BAND, "band", null); prism(pts, BAND, top, face, ROOFS.grey); };

  // Subarea A: the podium to Kingsbury St, then the slab in two blocks either side of the balconied recess
  prism(ring(A_PODIUM_PX), 0, BASE, "base", ROOFS.deck);
  tower(ring(rect(A_NORTH)), A_TOP, "wall");
  tower(ring(rect(A_SOUTH)), A_TOP, "wall");
  const r = RECESS / PX, [sx0, sx1, sy0, sy1] = A_SLOT;
  tower(ring(rect([sx0 + r, sx1 - r, sy0, sy1])), A_TOP, "balc");
  prism(ring(rect(A_MECH)), A_TOP, A_TOP + MECH, "metal", ROOFS.grey);
  // Subarea B: the podium round the court, the bent tower (taller north of the notch), its cooling tower and overrun
  prism(ring(B_PODIUM_PX), 0, BASE, "base", ROOFS.deck);
  tower(ring(B_NORTH_PX), B_NORTH_TOP, "wallCurved");
  tower(ring(B_SOUTH_PX), B_SOUTH_TOP, "wallCurved");
  prism(ring(B_MECH_PX), B_NORTH_TOP, B_NORTH_TOP + MECH, "metal", ROOFS.grey);
  prism(ring(B_CORE_PX), B_SOUTH_TOP, B_SOUTH_TOP + MECH, "metal", ROOFS.grey);

  for (const [mat, { pos, nor, uv }] of bins) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  return g;
}
