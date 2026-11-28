// Willis Tower (the Sears Tower), 233 S Wacker Dr: SOM's bundled tube (Bruce Graham, architect; Fazlur Khan, structural
// engineer; topped out 1973), the tallest building in the film and the centerpiece of the downtown view from the
// Chicago/Halsted platform, 2.18 km away at a bearing of 150.6 degrees. For the cab-ride film
// (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js and soldier-field.js.
//
// What it draws, in the tower's own frame (its grid turned 1.0 degree counterclockwise from true north):
//   - Nine 22.86 m (75 ft) square tubes in a 3 x 3 bundle, 69.80 m (229 ft) square at the outside faces, stepping back at
//     their real heights: the north-west and south-east tubes stop at the 50th floor (200.6 m), the north-east and
//     south-west at the 66th (263.9 m), the north, east and south at the 90th (359.9 m); the west and center tubes run to
//     the 108th, the main roof deck at 436.4 m. On top, the dark mechanical penthouse (the owners' "110th floor", 442.1 m).
//   - The curtain wall: black aluminum with bronze glass, a column cover every 4.572 m (15 ft, 5 bays a tube face), three
//     windows filling each bay between thin mullions, a spandrel and floor line every story; a wide strip where tubes meet
//     and at the corners. The black louver bands over the mechanical floors: one tier of tall panels in the three stories
//     under floor 33, and two-story bands that are the top two stories of the 66- and 90-floor tubes, so each of those
//     setbacks is capped by a black band (on the taller tubes the band runs on at the same height); at the 90th, the
//     tubes' return faces (those standing over a lower tube) end instead in two rows of light gray panels. The crown
//     (104-108: two stories of gray spandrel panels, two of louvers, one of dark glazing, the coping). The glass carries a
//     faint sky reflection (emissive), so the shaded faces still show their grid.
//   - The two antennas as they stood in August 2026: white stacked cylinders with gray equipment rings and a beacon
//     fixture under each whip, the tips level (west 527.3 m, east 527.8 m), each on its white base with a collar at 460 m
//     braced to two thin masts (tops 461-472 m); the gray lattice of small antennas on the penthouse; the four drums (the
//     window-washing machines' housings: dark walls, white tops) on the 50th and 66th roofs; the five glass boxes of the
//     Skydeck Ledge on the west face at the 103rd floor.
//   - The base: the 2022 Catalog podium round the tower (black steel and glass blocks 5-25 m tall, its roof garden with
//     trees, the glass atrium off Jackson Blvd), the glass entrance pavilion and its canopy on Wacker Dr, the canopies on
//     Franklin St and Jackson Blvd, the door canopies, and the three flags on Wacker Dr.
//
// Where the numbers come from:
//   - Footprint and grid: the published size, 229 ft (69.80 m) at the outside faces, 225 ft between the outside column
//     lines (SkyscraperPage, buildingID 5), nine 75 ft tubes (SOM); the center and the 1.0 degree turn from OpenStreetMap's
//     tube parts (ways 137162289-137162299, November 26, 2026, through the Chicago Cityscape CLI), the streets round the
//     block and the faces in Cook County's 2022 LiDAR (ISGS DSM, 0.5 m grid), which agree to half a meter.
//   - Which tubes stop where: Wikipedia ("Willis Tower"), Skydeck Chicago's guide for teachers (2022), OpenStreetMap's
//     parts and the LiDAR all agree; a photograph from Halsted St and Grand Ave (the Chicago/Halsted platform's bearing)
//     shows the north-east and south-west tubes stepping back at the same height.
//   - Heights: the LiDAR (ISGS 2022 DSM less the DTM, US survey feet x 0.3048006096), above Franklin St's grade (180.85 m
//     NAVD88), the datum the published heights fit: the 50th-floor roofs 381.5 m NAVD88 (200.6 m; the Building Dept.'s
//     658 ft), the 66th 444.75 m (263.9 m), the 90th 540.75 m (359.9 m), the main roof deck 617.25 m (436.4 m; 1,432 ft on
//     the blueprints, SkyscraperPage), the penthouse 622.75-623.75 m (442.1 m, CTBUH's architectural height; its extent,
//     about 19 x 17 m, from the same returns on a 0.3 m grid). Upper Wacker Dr is 1.85 m higher than Franklin St (the
//     DTM); the film's ground is flat, so the tower stands at y = 0. The roofs' colors: OpenStreetMap's roof:colour on the
//     tube parts (#ffffff on the 50th and 66th, #797771 on the 90th and the main roof).
//   - Stories: 108 floors (CTBUH), the floor levels fitted to the measured setbacks (3.976 m a floor to the 51st, 3.956 m
//     to the 67th, 4.0 m to the 91st, then to the 103rd at 412.7 m, CTBUH's observatory level, and 3.95 m to the deck).
//   - The curtain wall: "black aluminum and bronze-tinted, glare-reducing glass" (SOM); columns 15 ft apart, five a side
//     (Khan, Princeton, khan.princeton.edu); 16,000 windows "each 5 by 8 feet" (Wikipedia), three to a bay, the column
//     covers the same aluminum as the spandrels and the corner strips about 1.1 m wide (LeMay's photographs, below).
//   - The louver bands: Wikipedia lists the mechanical floors as 29-32, 64-65, 88-89 and 104-108 ("black louvres covering
//     the trussed levels", Princeton; WikiArquitectura puts the trusses at 29-31, 64-66 and 88-90), and the photographs put
//     the two-story bands directly under the 66th and 90th setbacks, about 1.2 m below the roof edge, whatever the floor
//     numbers say (so they are drawn on floors 65-66 and 89-90), and the low band as one tier
//     of panels about 2.8 stories tall, its top 32 stories under the 66th's band (so floors 30-32): "Willis Tower, 311
//     South Wacker , The Reed, and River City, Chicago, Illinois.jpg" (Julian Lupyan, August 3, 2026, public domain, from
//     983 m due south), the Halsted St photograph and LeMay's two (below). LeMay's also show the gray panels on the 90th's
//     return faces (the north and south tubes' west faces), and Lupyan's the same on the east tube's south face. The
//     louvers are black, darker than the glass in sun, between light column covers. TODO.md asked for white mechanical
//     bands; every photograph shows the louvers black, so they are drawn black.
//   - Antennas: their positions 27.0 m apart on the middle row's center line, from the LiDAR (0.3 m grid; OpenStreetMap's
//     mast nodes 13069895366/13069895367, "Willis West Tower" and "Willis East Tower", agree within a meter); the bases'
//     collar from the LiDAR's flat returns at 641.1 m NAVD88 (460.3 m; "antenna mounts 1,518 ft", SkyscraperPage). Their
//     2026 shape from Lupyan's photograph: shot from due south, it has both antennas at the same range, and a camera fitted
//     to the roof edge (436.4 m) and the east tube's 90th-floor roof (359.9 m) puts both tips at 528 m +-3 m, level within
//     about a meter (the east perhaps slightly higher), the collar at 462 m (the LiDAR's 460.3) and gives each section's
//     height and width (+-0.2 m at 12.6 px a meter). "Willis Tower antennas (12889516014).jpg" (Jaysin Trevino, 2013,
//     CC BY 2.0), from due north, also shows the tips level. The west tip is drawn at the FCC's registered 1,730 ft
//     (527.3 m, ASR 1032959). Both tops have been re-equipped since 2013 (ABC7 Chicago's antenna lifts of 2018 and 2023;
//     the west antenna's triple stack and top plate replaced in spring 2026, TV Technology, June 1, 2026), which is why
//     the 2013 photograph's black section on the east antenna is gone. (SkyscraperPage gives the east antenna 1,710 ft, 521.2 m, under ASR 1032960; the FCC's
//     page for it could not be read, and the figure is older than the 2026 photograph, so it is not used.)
//   - The thin masts: their positions from the LiDAR (0.25 m grid); their tops from Lupyan's photograph, with the same
//     camera, each at its own range (north-east 472 m, south-east 461 m, south-west 470.5 m, +-3 m: plain poles, nothing
//     above them). The 2022 LiDAR's highest returns on them (472.5-478.3 m) and the 2013 photograph had them higher, so
//     they have been cut down since 2022.
//   - Drums: OpenStreetMap ways 1178243970-1178243973 (8.7 m across; roof:colour #ffffff, for their tops), 4.7 m tall from
//     the LiDAR; their walls dark in Lupyan's photograph and the Halsted St one.
//   - The Ledge: five glass boxes (theskydeck.com/the-ledge), each 10 x 10 ft (SOM) projecting 4.3 ft (Skydeck), on the
//     west face (Architect magazine, 2009), the floor at 412.7 m (CTBUH), one in each of the west tube's five bays
//     ("Sears Tower, Wacker Drive and Jackson Boulevard, Chicago, IL.jpg", Warren LeMay, 2024, CC BY-SA 2.0).
//   - The podium: OpenStreetMap's parts of the block (the PODIUM list below: outlines, heights and roof colors from their
//     tags), Gensler's 2022 Catalog (Wikipedia); the flagpoles, OpenStreetMap nodes 11650015760-11650015762.
//   - Colors, read off photographs on Wikimedia Commons: "CTA 8 Halsted Bus Northbound at Grand Avenue.png"
//     (AmyLExtraordinaire, 2023, CC BY-SA 4.0), "Willis Tower top (6591958871).jpg" (Jaysin Trevino, 2011, CC BY 2.0),
//     "Chicago in 2022 Top of the Willis Tower (52049406730) (cropped).jpg" (Chris Rycroft, CC BY 2.0), "Looking South from
//     John Hancock Center Observatory, Chicago, Illinois (11004491413).jpg" (Ken Lund, 2013, CC BY-SA 2.0), "Chicago
//     Skyline - August 2026 - 01.jpg" (NorbertNagel, CC BY-SA 4.0), "Podium, Sears Tower, Wacker Drive and Jackson
//     Boulevard, Chicago, IL.jpg" (Warren LeMay, 2024, CC BY-SA 2.0), LeMay's photograph above and Lupyan's.
//   Assumed: the east tip 0.5 m above the west (the photographs say level within about a meter); the antennas' section
//   breaks (+-1 m) and widths (+-0.2 m) as read from one photograph, so the sections are round in plan; the beacon
//   fixtures as gray boxes; the flat panel on the west antenna's west side (its north-south depth); the second white
//   cylinder beside the west antenna's base (its north-south position); the thin masts 0.6 m across, which of the east
//   pair is the taller (the north-east, as in 2013), the north-west one's top (hidden in the photograph: drawn like the
//   south-west's) and the braces' layout; the penthouse's size (+-1 m), its louvered walls and its lattice (a gray truss
//   with a seeded scatter of rods, panels and dishes, for the irregular tangle in the photographs); the floor pitch above
//   the 90th; the bands' spandrels (1.15 m above the louvers, 0.9 m below); the gray panels on the
//   90th's return faces that no photograph shows; the crown's split into stories; the window, mullion, cover and strip
//   widths and the blinds; the black coping, 0.6 m deep, at each setback's edge; the lobby's dark granite plinth (0.45 m),
//   its tall glass and transom; the column-line faces between tubes (the LiDAR puts them about 0.3 m proud); the drums as
//   plain cylinders; the podium's heights (OpenStreetMap's tags only), its walls as one black steel-and-glass storefront,
//   the 0.6 m shift of its outlines to the tower's measured center, its trees, the canopies' columns and the door canopies'
//   4 m height; the flagpoles' 12 m; Lower Wacker Dr left out (covered); the blue mosaic on Jackson Blvd left out; all
//   colors.
//   Reference images: refs/willis-tower/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildWillisTower, willisTowerSite } from "./willis-tower.js";
//   scene.add(buildWillisTower({ THREE }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: WILLIS_TOWER_CENTRE } to have the tower's center at (0, 0, 0). It needs a browser (or another
// DOM with <canvas>): the facades are painted on canvas textures.
export const WILLIS_TOWER_CENTRE = [-87.635895, 41.878885];          // the center of the nine-tube square, +-0.5 m
const FILM_ORIGIN = [-87.620063, 41.863968];
const TURN = 1.0 * Math.PI / 180;                                     // the grid, counterclockwise from true north

// ---- the plan, in the tower's frame: u east, n north (z = -n), meters from the center ----
const FACE = 34.9, COL = 11.43;                                       // the outside faces; the inner column lines
const EDGES = [-FACE, -COL, COL, FACE];
const H50 = 200.6, H66 = 263.9, H90 = 359.9, TOP = 436.4, PENT = 442.1;
// each tube's roof: [W, C, E column][S, middle, N row]
const TUBE_H = [[H66, TOP, H50], [H90, TOP, H90], [H50, H90, H66]];
// the floor levels: [y, floors below it (floor 1 = 0)], from the setbacks (see the top); floor n's level is where it gives n - 1
const KNOTS = [[1.8, 0], [H50, 50], [H66, 66], [H90, 90], [412.7, 102], [TOP, 108]];
const floorAt = (y) => {
  let i = 0;
  while (i < KNOTS.length - 2 && y > KNOTS[i + 1][0]) i++;
  const [y0, f0] = KNOTS[i], [y1, f1] = KNOTS[i + 1];
  return f0 + ((y - y0) * (f1 - f0)) / (y1 - y0);
};
const level = (n) => {
  let i = 0;
  while (i < KNOTS.length - 2 && n - 1 > KNOTS[i + 1][1]) i++;
  const [y0, f0] = KNOTS[i], [y1, f1] = KNOTS[i + 1];
  return y0 + ((n - 1 - f0) * (y1 - y0)) / (f1 - f0);
};
// the bands painted on the second texture: [from, to, region]: the lobby (floors 1-2), the louvers (floors 30-32, and the
// top two stories of the 66- and 90-floor tubes, 65-66 and 89-90, Wikipedia's mechanical floors 64-65 and 88-89 sitting
// under them), the crown (104-108)
const BANDS = [[0, level(3), "lobby"], [level(30), level(33), "band4"], [level(65), H66, "band2"],
  [level(89), H90, "band2"], [level(104), TOP, "crown"]];
const COPING = 0.6;                                                   // the black coping at a setback's edge
// the antennas: [u, n, tip]; the thin masts [u, n, top]; the drums [u, n, roof]
const ANT_E = [2.5, 0, 527.8], ANT_W = [-24.5, 0, 527.3], COLLAR = TOP + 23.6;
const MASTS = [[7.2, 7.2, 472], [7.5, -7.25, 461], [-28.9, 6.75, 470.5], [-30.2, -6.9, 470.5]];
const DRUMS = [[-22.45, 22.85, H50], [23.1, -22.55, H50], [23.4, 22.85, H66], [-22.6, -22.65, H66]];
const PENTHOUSE = { u0: -20.8, u1: -2.0, n0: -8.2, n1: 8.2 };
const LEDGE = { y: 412.7, h: 3.05, w: 3.05, out: 1.31, n: [-9.144, -4.572, 0, 4.572, 9.144] };

// The podium: OpenStreetMap's parts of the block, in the tower's frame (shifted 0.6 m east, as OpenStreetMap's tubes sit
// 0.6 m west of the measured center), [way, outline [u, n], bottom, top, walls, roof]
const PODIUM = [
  [1178212995, [[-51.1, -10.9], [-34.9, -10.9], [-34.9, -34.9], [-11.5, -34.9], [-11.5, -62.3], [12.1, -62.3], [12.1, -34.9],
    [34.9, -34.9], [34.9, -66.4], [11.7, -66.4], [11.7, -72.0], [-11.0, -72.0], [-11.0, -66.3], [-51.1, -66.3]], 0, 20, "pod", "green"],
  [1178212996, [[-40.0, -56.0], [-19.9, -56.0], [-19.9, -38.3], [-40.0, -38.3]], 20, 25, "pod", "green"],
  [1007423276, [[-11.5, -62.3], [12.1, -62.3], [12.1, -34.9], [-11.5, -34.9]], 0, 21, "pav", "glassRoof"],
  [1178212994, [[34.9, -11.7], [40.8, -12.1], [40.8, -76.1], [11.7, -76.1], [11.7, -66.4], [34.9, -66.4]], 0, 10, "pod", "green"],
  [1178212997, [[-43.4, -76.1], [-24.5, -76.1], [-24.5, -66.3], [-43.4, -66.3]], 0, 18, "pod", "roofW"],
  [1178212998, [[-51.1, -76.1], [-43.4, -76.1], [-43.4, -66.3], [-51.1, -66.3]], 0, 10, "pod", "green"],
  [1178212999, [[-24.5, -76.1], [-11.0, -76.1], [-11.0, -66.3], [-24.5, -66.3]], 0, 10, "pod", "green"],
  [1178213001, [[-43.5, -10.9], [-34.9, -10.9], [-34.9, 11.0], [-43.5, 11.0]], 0, 18, "pav", "glassRoof"],
  [1178226264, [[-51.3, 11.0], [-34.9, 11.0], [-34.9, 34.1], [-51.3, 34.1]], 0, 20, "pod", "green"],
  [1178226263, [[-51.3, 34.1], [-34.9, 34.1], [-34.9, 34.9], [-24.7, 34.9], [-24.7, 42.8], [-51.3, 42.8]], 0, 10, "pod", "green"],
  [1178212993, [[-24.7, 34.9], [20.6, 34.9], [20.6, 42.8], [-24.7, 42.8]], 0, 5, "dark", "roofW"],   // black marble
  [1178212992, [[34.9, 11.6], [40.8, 11.6], [40.8, 42.8], [20.6, 42.8], [20.6, 34.9], [34.9, 34.9]], 0, 10, "pod", "green"],
];
// the canopies (OpenStreetMap's building=roof): [way, u0, u1, n0, n1, top, columns [u, n]]
const CANOPIES = [
  [1178212981, -51.2, -43.5, -10.9, 11.0, 18, [[-50.6, -9.5], [-50.6, 0], [-50.6, 9.5]]],   // Wacker Dr, over the entrance
  [590536152, 34.9, 40.8, -12.1, 11.7, 10, [[40.2, -11.4], [40.2, -3.8], [40.2, 3.8], [40.2, 11.0]]],   // Franklin St
  [1178213002, -11.0, 11.7, -76.1, -72.0, 10, [[-10.4, -75.5], [0.35, -75.5], [11.1, -75.5]]],   // Jackson Blvd
  // the door canopies (no height in OpenStreetMap: 4 m assumed)
  [1178212983, -52.7, -51.1, -38.7, -34.5, 4, []], [1178212984, -52.8, -51.1, -20.2, -16.0, 4, []],
  [1178212985, -52.8, -51.1, -56.6, -52.4, 4, []], [1178212986, -53.1, -51.2, 16.4, 20.6, 4, []],
  [1178212987, -33.6, -29.7, 42.8, 44.0, 4, []], [1178212988, 40.8, 42.6, 30.2, 34.4, 4, []],
  [1178212989, 40.8, 42.6, -47.9, -43.7, 4, []], [1178212990, 40.8, 42.5, -29.3, -25.1, 4, []],
  [1178212991, 40.8, 42.6, -20.6, -16.4, 4, []], [1178234330, 16.9, 20.9, -77.6, -76.1, 4, []],
];
// the flags on Wacker Dr: [lon, lat, flag] (OpenStreetMap nodes 11650015760-11650015762)
const FLAGS = [[-87.6365723, 41.8791796, 0], [-87.6365723, 41.87913, 1], [-87.6365723, 41.8790924, 2]];   // US, Illinois, Chicago
// The ground OpenStreetMap's buildings and trees give way to: the whole block, with the canopies past its edges and the
// flags on Wacker Dr (the west edge about 4 m beyond the flagpoles, short of upper Wacker's roadway), [lon, lat]
const SITE_RING = [[-87.63662, 41.879287], [-87.63537, 41.879287], [-87.63537, 41.87818], [-87.63662, 41.87818]];

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The site as a closed ring of local meters [x0, z0, x1, z1, ..., x0, z0], for clearing OpenStreetMap's buildings
export function willisTowerSite(origin = FILM_ORIGIN) {
  const L = local(origin), r = SITE_RING.flatMap(([lon, lat]) => L(lon, lat));
  return [[...r, r[0], r[1]]];
}

export function buildWillisTower({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...WILLIS_TOWER_CENTRE), g = new THREE.Group();
  g.name = "willis-tower";
  g.position.set(cx, 0, cz); g.rotation.y = TURN;                     // everything below is in the tower's frame (x = u, z = -n)
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)
  const rgb = (c, s = 1) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * s)))).join(",")})`;

  // ======== the textures: each painted once on a canvas; the facades as pairs, the color and the sky it reflects ========
  const tex = (cv, repeat = true) => {
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const one = (w, h, draw, repeat = true) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); return tex(cv, repeat); };
  const pair = (w, h, draw) => {
    const a = document.createElement("canvas"), b = document.createElement("canvas");
    a.width = b.width = w; a.height = b.height = h;
    draw(a.getContext("2d"), b.getContext("2d"));
    return [tex(a), tex(b)];
  };
  // One tube face is one texture width (u 0 to 1 across each face), so the column covers and the strips at the tubes'
  // edges fall where they are: 5 bays of 3 windows filling the bay between thin mullions; the strips 1.1 m each side of an
  // edge, the covers 0.36 m. 512 px a face (22 px a meter) is plenty for a tower seen from 300 m and more; near the
  // ground, the lobby gets the same.
  const FW = 512, PXM = FW / 22.86, BAYW = FW / 5, EDGE = Math.round(1.1 * PXM), COVER = Math.round(0.36 * PXM), MULL = 2;
  const BAYS = [], WIN = [];
  for (let b = 0; b < 5; b++) {
    const l = b * BAYW + (b ? COVER / 2 : EDGE), r = (b + 1) * BAYW - (b < 4 ? COVER / 2 : EDGE), w = (r - l - 2 * MULL) / 3;
    BAYS.push([l, r]);
    for (let k = 0; k < 3; k++) WIN.push([l + k * (w + MULL), l + k * (w + MULL) + w]);
  }
  const ALUM = [52, 53, 56], ALUM_E = [40, 43, 48];                     // black anodized aluminum; what it reflects
  // the column covers and the edge strips, over rows y0..y1 of both canvases: the same aluminum as the spandrels, their
  // edges catching the light (and so light between the louver panels in the bands)
  const piers = (cD, cE, y0, y1) => {
    const h = y1 - y0;
    for (let b = 1; b < 5; b++) {
      const x = b * BAYW - COVER / 2;
      cD.fillStyle = "#3a3b3f"; cD.fillRect(x, y0, COVER, h); cD.fillStyle = "#4c4e53"; cD.fillRect(x, y0, 1, h);
      cE.fillStyle = "#2e3136"; cE.fillRect(x, y0, COVER, h); cE.fillStyle = "#3c4046"; cE.fillRect(x, y0, 1, h);
    }
    for (const x of [0, FW - EDGE]) {
      cD.fillStyle = "#333438"; cD.fillRect(x, y0, EDGE, h);
      cE.fillStyle = "#292c30"; cE.fillRect(x, y0, EDGE, h);
    }
    cD.fillStyle = "#47494d"; cD.fillRect(EDGE - 1, y0, 1, h); cD.fillRect(FW - EDGE, y0, 1, h);
    cD.fillStyle = "#0e0f10"; cD.fillRect(0, y0, 2, h); cD.fillRect(FW - 2, y0, 2, h);   // the joint between tubes
    cE.fillStyle = "#0c0d0f"; cE.fillRect(0, y0, 2, h); cE.fillRect(FW - 2, y0, 2, h);
  };
  // a window: a thin frame, bronze glass reflecting the sky, and (sometimes) blinds part-way down
  const window_ = (cD, cE, x0, x1, top, bot, blinds = 0.3, dark = 1) => {
    cD.fillStyle = "#3d3f43"; cD.fillRect(x0, top, x1 - x0, bot - top);
    cE.fillStyle = "#2f3338"; cE.fillRect(x0, top, x1 - x0, bot - top);
    const gx = x0 + 1, gw = x1 - x0 - 2, gy = top + 1, gh = bot - top - 2, s = (0.8 + rnd() * 0.35) * dark;
    cD.fillStyle = rgb([68, 58, 48], s); cD.fillRect(gx, gy, gw, gh);
    const gr = cE.createLinearGradient(0, gy, 0, gy + gh);
    gr.addColorStop(0, rgb([104, 118, 138], s)); gr.addColorStop(1, rgb([50, 60, 74], s));
    cE.fillStyle = gr; cE.fillRect(gx, gy, gw, gh);
    if (rnd() < blinds) {
      const bh = gh * (0.15 + rnd() * 0.85);
      cD.fillStyle = rgb([80, 74, 66], 0.8 + rnd() * 0.35); cD.fillRect(gx, gy, gw, bh);
      cD.fillStyle = "rgba(0,0,0,0.2)"; for (let y = gy + 1; y < gy + bh; y += 3) cD.fillRect(gx, y, gw, 1);
      cE.fillStyle = "rgba(110,106,98,0.25)"; cE.fillRect(gx, gy, gw, bh);
    }
  };
  // the curtain wall: 12 stories a tile (1024 px), floor k's level at the bottom of its row
  const FLOORS = 12, FH = 1024, PH = FH / FLOORS, MV = PH / 3.98;
  const [facadeD, facadeE] = pair(FW, FH, (cD, cE) => {
    cD.fillStyle = rgb(ALUM); cD.fillRect(0, 0, FW, FH); cE.fillStyle = rgb(ALUM_E); cE.fillRect(0, 0, FW, FH);
    for (let k = 0; k < FLOORS; k++) {
      const yb = FH - k * PH;
      cD.fillStyle = "#424448"; cD.fillRect(0, yb - 2, FW, 1);         // the floor line
      cE.fillStyle = "#373a3f"; cE.fillRect(0, yb - 2, FW, 1);
      for (const [x0, x1] of WIN) window_(cD, cE, x0, x1, yb - 3.3 * MV, yb - 0.85 * MV);
    }
    piers(cD, cE, 0, FH);
  });
  // the bands, stacked on one texture: the crown, the two-story louver band, the 90th's return faces, the three-story
  // louver band and the lobby
  const B2 = 8.0, B4 = level(33) - level(30);
  const AH = 2048, GAP = 16, REG = [["crown", TOP - level(104)], ["band2", B2], ["ret90", B2], ["band4", B4], ["lobby", level(3)]];
  const AMV = (AH - GAP * (REG.length - 1)) / REG.reduce((s, [, h]) => s + h, 0), ATLAS = {};
  { let y = 0; for (const [k, h] of REG) { ATLAS[k] = { top: y, bot: y + h * AMV, v0: 1 - (y + h * AMV) / AH, v1: 1 - y / AH }; y += h * AMV + GAP; } }
  const louver = (cD, cE, x0, x1, ya, yb) => {                         // a louver panel filling a bay: fine horizontal blades
    cD.fillStyle = "#1f2022"; cD.fillRect(x0, ya, x1 - x0, yb - ya);
    cD.fillStyle = "#303236"; for (let y = ya + 2; y < yb - 1; y += 3) cD.fillRect(x0, y, x1 - x0, 1);
    cD.fillStyle = "#2b2c2f"; cD.fillRect(x0, ya, x1 - x0, 1); cD.fillRect(x0, yb - 1, x1 - x0, 1);
    cE.fillStyle = "#181a1d"; cE.fillRect(x0, ya, x1 - x0, yb - ya);
    cE.fillStyle = "#23262a"; for (let y = ya + 2; y < yb - 1; y += 3) cE.fillRect(x0, y, x1 - x0, 1);
  };
  const [bandsD, bandsE] = pair(FW, AH, (cD, cE) => {
    cD.fillStyle = rgb(ALUM); cD.fillRect(0, 0, FW, AH); cE.fillStyle = rgb(ALUM_E); cE.fillRect(0, 0, FW, AH);
    const at = (reg) => (m) => ATLAS[reg].bot - m * AMV;               // canvas y of a height m above the region's foot
    const line = (y) => { cD.fillStyle = "#424448"; cD.fillRect(0, y - 1, FW, 1); cE.fillStyle = "#373a3f"; cE.fillRect(0, y - 1, FW, 1); };
    // light gray opaque panels, three to a bay, from a to b meters above the region's foot
    const panels = (Y, a, b) => {
      for (const [l, r] of BAYS) for (let k = 0; k < 3; k++) {
        const w = (r - l) / 3, x = l + k * w, s = 0.96 + rnd() * 0.08;
        cD.fillStyle = rgb([98, 102, 105], s); cD.fillRect(x + 1, Y(b) + 1, w - 2, Y(a) - Y(b) - 2);
        cE.fillStyle = rgb([72, 77, 84], s); cE.fillRect(x + 1, Y(b) + 1, w - 2, Y(a) - Y(b) - 2);
      }
    };
    // the crown: floors 104-105 gray opaque spandrel panels, 106-107 louvers, 108 dark glazing, the coping
    {
      const Y = at("crown"), st = (TOP - level(104)) / 5;
      cD.fillStyle = "#4c5053"; cD.fillRect(0, Y(2 * st), FW, 2 * st * AMV); cE.fillStyle = "#34383d"; cE.fillRect(0, Y(2 * st), FW, 2 * st * AMV);
      for (let row = 0; row < 4; row++) panels(Y, row * st / 2, (row + 1) * st / 2);
      line(Y(0)); line(Y(st)); line(Y(2 * st));
      for (const [l, r] of BAYS) louver(cD, cE, l, r, Y(4 * st - 0.75), Y(2 * st + 0.7));
      line(Y(4 * st));
      for (const [x0, x1] of WIN) window_(cD, cE, x0, x1, Y(5 * st - 0.95), Y(4 * st + 0.7), 0.1, 0.62);
      piers(cD, cE, ATLAS.crown.top, ATLAS.crown.bot);
      cD.fillStyle = "#303235"; cD.fillRect(0, Y(TOP - level(104)), FW, 0.5 * AMV);   // the coping
      cD.fillStyle = "#4a4d51"; cD.fillRect(0, Y(TOP - level(104)), FW, 2);
      cE.fillStyle = "#2c2f34"; cE.fillRect(0, Y(TOP - level(104)), FW, 0.5 * AMV);
    }
    // two stories of louvers (65-66, 89-90): a spandrel, the panels, 1.15 m of spandrel above them (half of it under the
    // coping where the band caps a setback)
    { const Y = at("band2"); line(Y(0)); for (const [l, r] of BAYS) louver(cD, cE, l, r, Y(B2 - 1.15), Y(0.9)); piers(cD, cE, ATLAS.band2.top, ATLAS.band2.bot); }
    // the 90th's return faces: two rows of the gray panels in place of the louvers
    { const Y = at("ret90"); line(Y(0)); line(Y(B2 / 2)); panels(Y, 0.45, B2 / 2 - 0.25); panels(Y, B2 / 2 + 0.2, B2 - 1.15); piers(cD, cE, ATLAS.ret90.top, ATLAS.ret90.bot); }
    // three stories (30-32): one tier of tall panels, spandrels only at the top and the bottom
    { const Y = at("band4"); line(Y(0)); for (const [l, r] of BAYS) louver(cD, cE, l, r, Y(B4 - 0.3), Y(0.65)); piers(cD, cE, ATLAS.band4.top, ATLAS.band4.bot); }
    // the lobby (floors 1-2): a granite plinth, tall glass, a spandrel, the second floor's windows
    {
      const Y = at("lobby");
      for (const [x0, x1] of WIN) {
        window_(cD, cE, x0, x1, Y(5.2), Y(0.45), 0, 1.15);
        cD.fillStyle = "#2b2d30"; cD.fillRect(x0, Y(2.95), x1 - x0, 2);    // a transom
        window_(cD, cE, x0, x1, Y(level(3) - 0.75), Y(level(2) + 0.85), 0.3);
      }
      line(Y(level(2)));
      cD.fillStyle = "#202021"; cD.fillRect(0, Y(0.45), FW, 0.45 * AMV); cE.fillStyle = "#18191b"; cE.fillRect(0, Y(0.45), FW, 0.45 * AMV);
      piers(cD, cE, ATLAS.lobby.top, ATLAS.lobby.bot);
    }
  });
  // the podium: black steel storefront, one level (6 m by 5 m) a tile; and the clear glass of the pavilion and the atrium
  const [podD, podE] = pair(512, 512, (cD, cE) => {
    const gr = cD.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#3b4550"); gr.addColorStop(1, "#262c33");
    cD.fillStyle = gr; cD.fillRect(0, 0, 512, 512);
    const ge = cE.createLinearGradient(0, 0, 0, 512); ge.addColorStop(0, "#7c8ea2"); ge.addColorStop(1, "#3d4a58");
    cE.fillStyle = ge; cE.fillRect(0, 0, 512, 512);
    for (const c of [cD, cE]) {
      c.fillStyle = c === cD ? "#1b1c1e" : "#0c0d0e";
      c.fillRect(0, 512 - 61, 512, 61);                                 // the slab and its steel fascia
      for (let k = 0; k < 4; k++) c.fillRect(k * 128, 0, 10, 512);      // the mullions, every 1.5 m
      c.fillRect(0, 512 - 61 - 290, 512, 7);                            // the transom
    }
  });
  const pav = one(512, 512, (c) => {
    const gr = c.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#a9bccb"); gr.addColorStop(0.5, "#6f8494"); gr.addColorStop(1, "#4a5b68");
    c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
    c.fillStyle = "rgba(255,255,255,0.08)"; c.fillRect(0, 0, 256, 512);
    c.fillStyle = "#c9d0d5"; for (let k = 0; k < 4; k++) c.fillRect(k * 128, 0, 5, 512);   // silver mullions, 1.5 m
    c.fillRect(0, 0, 512, 5); c.fillRect(0, 256, 512, 4);
  });
  const green = one(256, 256, (c, w, h) => {                           // the roof garden's planting, 16 m square
    c.fillStyle = "#5f7f3e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "30,55,20" : "170,200,120"},0.12)`; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
  });
  const flags = one(512, 128, (c) => {                                 // US, Illinois, Chicago (simplified), drawn at 1024 x 256
    c.scale(0.5, 0.5);
    const W = 1024 / 3;
    for (let k = 0; k < 13; k++) { c.fillStyle = k % 2 ? "#f4f4f2" : "#b22234"; c.fillRect(0, (k * 256) / 13, W, 256 / 13 + 1); }
    c.fillStyle = "#3c3b6e"; c.fillRect(0, 0, W * 0.4, 256 * 7 / 13);
    c.fillStyle = "#f4f4f2"; for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) c.fillRect(8 + k * 21 + (r % 2) * 10, 8 + r * 14.5, 4, 4);
    c.fillStyle = "#f6f6f4"; c.fillRect(W, 0, W, 256);
    c.fillStyle = "#8a6a3a"; c.beginPath(); c.arc(W * 1.5, 112, 62, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#5e7f3c"; c.beginPath(); c.arc(W * 1.5, 128, 40, 0, Math.PI); c.fill();
    c.fillStyle = "#24356b"; c.font = "bold 34px sans-serif"; c.textAlign = "center"; c.fillText("ILLINOIS", W * 1.5, 232);
    c.fillStyle = "#f6f6f4"; c.fillRect(2 * W, 0, W, 256);
    c.fillStyle = "#8fcdea"; c.fillRect(2 * W, 256 / 6, W, 256 / 6); c.fillRect(2 * W, 256 * 4 / 6, W, 256 / 6);
    c.fillStyle = "#e3242b";
    for (let k = 0; k < 4; k++) {
      const x = 2 * W + W * (0.2 + k * 0.2), y = 128, R = 20;
      c.beginPath(); for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6 - Math.PI / 2, rr = i % 2 ? R * 0.55 : R; c.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } c.fill();
    }
  }, false);

  const EI = 0.5;                                                     // how much sky the glass reflects
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, vertexColors: true, side: THREE.DoubleSide, ...o });
  const MAT = {
    facade: std({ map: facadeD, emissive: 0xffffff, emissiveMap: facadeE, emissiveIntensity: EI, roughness: 0.5, metalness: 0.2 }),
    bands: std({ map: bandsD, emissive: 0xffffff, emissiveMap: bandsE, emissiveIntensity: EI, roughness: 0.55, metalness: 0.2 }),
    dark: std({ color: 0x1c1d1f, roughness: 0.6, metalness: 0.2 }),   // the copings, the penthouse, the drums, the canopies, black marble
    roofW: std({ color: 0xecece6, roughness: 0.9 }),                   // white membrane (the 50th and 66th, the drums' tops; the podium's pale roofs)
    roofG: std({ color: 0x797771, roughness: 0.9 }),                   // the 90th and the main roof deck
    white: std({ color: 0xf2f3ef, roughness: 0.45, emissive: 0xe8eaec, emissiveIntensity: 0.16 }),   // the antennas, the masts, the Ledge's frames, the flagpoles
    metal: std({ color: 0x8b9196, roughness: 0.7, metalness: 0.05 }),  // the antennas' equipment rings and beacon fixtures, the lattice
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe6ee, transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    pod: std({ map: podD, emissive: 0xffffff, emissiveMap: podE, emissiveIntensity: 0.22, roughness: 0.35, metalness: 0.15 }),
    pav: std({ map: pav, emissive: 0xffffff, emissiveMap: pav, emissiveIntensity: 0.12, roughness: 0.25, metalness: 0.1 }),
    glassRoof: std({ color: 0xcddce7, roughness: 0.3, metalness: 0.1 }),
    green: std({ map: green, roughness: 1 }),
    flags: std({ map: flags, roughness: 0.9 }),
  };

  // ======== the geometry, gathered by material into one mesh each ========
  const B = {};
  const bt = (k) => B[k] || (B[k] = { p: [], n: [], t: [], c: [] });
  const P = (u, y, n) => [u, y, -n];
  // a triangle (its normal from its winding: the materials are two-sided, so either winding lights right)
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
  const rod = (k, a, b, r, seg = 6, s = 1) => {                        // a cylinder from a to b ([u, y, n])
    const A = new THREE.Vector3(...P(...a)), Bv = new THREE.Vector3(...P(...b)), d = Bv.clone().sub(A), l = d.length();
    const geo = new THREE.CylinderGeometry(r, r, l, seg, 1, true);
    geo.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(Bv).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(up, d.normalize()), new THREE.Vector3(1, 1, 1)));
    addGeo(k, geo, s);
  };
  const ball = (k, u, y, n, r, s = 1) => { const geo = new THREE.SphereGeometry(r, 10, 6); geo.translate(u, y, -n); addGeo(k, geo, s); };
  const box = (k, u0, u1, y0, y1, n0, n1, s = 1, tile = 4, sides = 0.92) => {
    const c = (u, y, n) => P(u, y, n), du = (u1 - u0) / tile, dy = (y1 - y0) / tile, dn = (n1 - n0) / tile;
    const uv = (a, b) => [[0, 0], [a, 0], [a, b], [0, b]];
    quad(k, c(u0, y1, n0), c(u1, y1, n0), c(u1, y1, n1), c(u0, y1, n1), uv(du, dn), s);
    quad(k, c(u0, y0, n0), c(u0, y0, n1), c(u1, y0, n1), c(u1, y0, n0), uv(dn, du), s * 0.6);
    quad(k, c(u0, y0, n0), c(u1, y0, n0), c(u1, y1, n0), c(u0, y1, n0), uv(du, dy), s * sides);
    quad(k, c(u1, y0, n1), c(u0, y0, n1), c(u0, y1, n1), c(u1, y1, n1), uv(du, dy), s * sides);
    quad(k, c(u0, y0, n1), c(u0, y0, n0), c(u0, y1, n0), c(u0, y1, n1), uv(dn, dy), s * sides);
    quad(k, c(u1, y0, n0), c(u1, y0, n1), c(u1, y1, n1), c(u1, y1, n0), uv(dn, dy), s * sides);
  };
  // a flat polygon ([u, n]) at height y, texture in meters / tile
  const flat = (k, pts, y, tile = 16, s = 1) => {
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(([u, n]) => new THREE.Vector2(u, n)), []);
    for (const [a, b, c] of tris) tri(k, P(pts[a][0], y, pts[a][1]), P(pts[b][0], y, pts[b][1]), P(pts[c][0], y, pts[c][1]),
      [pts[a][0] / tile, pts[a][1] / tile], [pts[b][0] / tile, pts[b][1] / tile], [pts[c][0] / tile, pts[c][1] / tile], s);
  };

  // ======== the tubes ========
  // A tube face from A to B ([u, n], left to right seen from outside), y0 to y1: cut at the bands, the floor model's knots
  // and (under a setback's roof) the coping; the curtain wall's v follows the floor levels, so each story's row meets its
  // floor, and each face starts the 12-story tile at a different floor. A return face (one standing over a lower tube) of
  // a 90-floor tube ends in the gray panels instead of the louvers.
  const CUTS = [...new Set([...BANDS.flatMap(([a, b]) => [a, b]), ...KNOTS.map(([y]) => y)])];
  let faceNo = 0;
  const face = (A, Bp, y0, y1, roofEdge, ret) => {
    const ys = [...new Set([y0, y1, ...CUTS.filter((y) => y > y0 + 0.01 && y < y1 - 0.01), ...(roofEdge ? [y1 - COPING] : [])])].sort((a, b) => a - b);
    const f = faceNo++, off = ((f * 5) % FLOORS) / FLOORS, [u0, u1] = f % 2 ? [1, 0] : [0, 1];
    const pa = (y) => P(A[0], y, A[1]), pb = (y) => P(Bp[0], y, Bp[1]);
    for (let i = 0; i < ys.length - 1; i++) {
      const a = ys[i], b = ys[i + 1], m = (a + b) / 2;
      if (roofEdge && a >= y1 - COPING - 0.001) { quad("dark", pa(a), pb(a), pb(b), pa(b)); continue; }
      const band = BANDS.find(([b0, b1]) => m > b0 && m < b1);
      if (band) {
        const [b0, b1] = band, reg = ret && b1 === H90 ? "ret90" : band[2];
        const { v0, v1 } = ATLAS[reg], V = (y) => v0 + ((y - b0) / (b1 - b0)) * (v1 - v0);
        quad("bands", pa(a), pb(a), pb(b), pa(b), [[0, V(a)], [1, V(a)], [1, V(b)], [0, V(b)]]);
      } else {
        const va = floorAt(a) / FLOORS + off, vb = floorAt(b) / FLOORS + off;
        quad("facade", pa(a), pb(a), pb(b), pa(b), [[u0, va], [u1, va], [u1, vb], [u0, vb]]);
      }
    }
  };
  const tubeH = (i, j) => (i < 0 || i > 2 || j < 0 || j > 2 ? 0 : TUBE_H[i][j]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const h = TUBE_H[i][j], ua = EDGES[i], ub = EDGES[i + 1], na = EDGES[j], nb = EDGES[j + 1], edge = h < TOP;
    // [neighbor's roof, left, right]: west, east, south, north
    for (const [nh, A, Bp] of [[tubeH(i - 1, j), [ua, nb], [ua, na]], [tubeH(i + 1, j), [ub, na], [ub, nb]],
      [tubeH(i, j - 1), [ua, na], [ub, na]], [tubeH(i, j + 1), [ub, nb], [ua, nb]]])
      if (nh < h) face(A, Bp, nh, h, edge, nh > 0);
    flat(h < H90 ? "roofW" : "roofG", [[ua, na], [ub, na], [ub, nb], [ua, nb]], h);
  }
  // the penthouse ("110th floor") and the lattice of small antennas on it
  {
    const { u0, u1, n0, n1 } = PENTHOUSE;
    // its walls louvered, like the bands (the louver panels of the two-story band's texture)
    const { v0, v1 } = ATLAS.band2, V = (m) => v0 + (m / B2) * (v1 - v0), uv = [[0, V(1.0)], [1, V(1.0)], [1, V(6.7)], [0, V(6.7)]];
    for (const [a, b] of [[[u0, n0], [u1, n0]], [[u1, n0], [u1, n1]], [[u1, n1], [u0, n1]], [[u0, n1], [u0, n0]]])
      quad("bands", P(a[0], TOP, a[1]), P(b[0], TOP, b[1]), P(b[0], PENT, b[1]), P(a[0], PENT, a[1]), uv);
    box("dark", u0 - 0.15, u1 + 0.15, PENT - 0.5, PENT, n0 - 0.15, n1 + 0.15, 1, 4, 0.9);   // its coping
    flat("roofG", [[u0, n0], [u1, n0], [u1, n1], [u0, n1]], PENT + 0.02, 16, 0.55);
    // the lattice, gray: a truss about 3 m tall on three broken lines, and an irregular tangle of rods, panel antennas
    // and small dishes on it and round it (seeded, so the same every build)
    const y = PENT;
    for (const [n, a, b] of [[-5.2, u0 + 2.0, u1 - 6.5], [0.4, u0 + 3.5, u1 - 2.2], [5.4, u0 + 1.6, u1 - 4.0]]) {
      const steps = Math.round((b - a) / 2.4), du = (b - a) / steps;
      for (const h of [1.1, 2.9]) rod("metal", [a, y + h, n], [b, y + h, n], 0.07, 4);
      for (let k = 0; k <= steps; k++) {
        const u = a + k * du;
        rod("metal", [u, y, n], [u, y + 2.9, n], 0.06, 4);
        if (k < steps) rod("metal", [u, y + (k % 2 ? 1.1 : 2.9), n], [u + du, y + (k % 2 ? 2.9 : 1.1), n], 0.045, 4);
        if (rnd() < 0.55) {                                            // an antenna on the truss
          const h = 1.2 + rnd() * rnd() * 4.2, uu = u + (rnd() - 0.5) * du * 0.6;
          rod("metal", [uu, y + 2.9, n], [uu, y + 2.9 + h, n], 0.035 + rnd() * 0.05, 4);
        }
      }
    }
    for (const u of [u0 + 4.5, u0 + 9.8, u1 - 4.4]) rod("metal", [u, y + 2.9, -5.2], [u, y + 2.9, 5.4], 0.06, 4);   // cross members
    for (let k = 0; k < 16; k++) {                                     // rods standing on the roof
      const u = u0 + 1 + rnd() * (u1 - u0 - 2), n = n0 + 1 + rnd() * (n1 - n0 - 2), h = 1.4 + rnd() * rnd() * 4.5;
      rod("metal", [u, y, n], [u, y + h, n], 0.03 + rnd() * 0.05, 4);
    }
    for (let k = 0; k < 9; k++) {                                      // panel antennas
      const u = u0 + 1.5 + rnd() * (u1 - u0 - 3), n = n0 + 1.5 + rnd() * (n1 - n0 - 3), y0 = y + (rnd() < 0.5 ? 2.9 : 0.6 + rnd());
      box("metal", u - 0.2, u + 0.2, y0, y0 + 1.2 + rnd() * 0.8, n - 0.15, n + 0.15, 0.9);
    }
    for (let k = 0; k < 4; k++) {                                      // small dishes
      const u = u0 + 2 + rnd() * (u1 - u0 - 4), n = n0 + 2 + rnd() * (n1 - n0 - 4);
      cyl("metal", u, n, y + 2.9, y + 3.3, 0.55, 0.4, 10, true, 1.05);
    }
  }
  // the drums on the 50th and 66th roofs: dark walls, white tops
  for (const [u, n, y] of DRUMS) {
    cyl("dark", u, n, y, y + 4.7, 4.35, 4.35, 24, false);
    flat("roofW", Array.from({ length: 24 }, (_, k) => [u + 4.35 * Math.cos((k * Math.PI) / 12), n + 4.35 * Math.sin((k * Math.PI) / 12)]), y + 4.7);
  }

  // ======== the antennas, as in August 2026 ========
  // [from, to (m above the deck), radius at the foot, at the top, material]; above each, a beacon fixture and the whip
  const EAST = [[0, 23.2, 1.75, 1.75], [23.2, 24.4, 2.25, 2.25], [24.4, 57, 1.69, 1.69], [57, 58.2, 1.69, 1.3], [58.2, 68.3, 1.3, 1.3],
    [68.3, 68.7, 1.3, 0.95], [68.7, 77.4, 0.94, 0.94], [77.4, 78.6, 1.2, 1.2, "metal"], [78.6, 86.4, 0.4, 0.4]];
  const WEST = [[0, 23.2, 1.75, 1.75], [23.2, 24.4, 2.2, 2.2], [24.4, 49, 1.72, 1.72], [49, 49.8, 1.72, 1.28], [49.8, 66, 1.28, 1.28],
    [66, 69, 1.2, 1.2, "metal"], [69, 77.6, 0.65, 0.65], [77.6, 78.8, 0.8, 0.8, "metal"], [78.8, 86, 0.35, 0.35]];
  for (const [[u, n, tip], prof] of [[ANT_E, EAST], [ANT_W, WEST]]) {
    for (const [a, b, r0, r1, k = "white"] of prof) cyl(k, u, n, TOP + a, TOP + b, r0, r1, r0 > 1 ? 16 : 10, true);
    const f0 = TOP + prof[prof.length - 1][1];                          // the beacon fixture, about 1.6 m across
    box("metal", u - 0.8, u + 0.8, f0, f0 + 2.2, n - 0.5, n + 0.5, 1);
    cyl("white", u, n, f0 + 2.2, tip - 0.3, 0.13, 0.11, 8, false);     // the whip
    ball("white", u, tip - 0.3, n, 0.3);                               // the beacon on the tip
  }
  // the flat panel on the west antenna's west side, 1.2 m out
  box("white", ANT_W[0] - 1.28 - 1.2, ANT_W[0] - 1.0, TOP + 55, TOP + 67, ANT_W[1] - 0.15, ANT_W[1] + 0.15, 0.95);
  // the second cylinder at the west base, with its domed top
  cyl("white", ANT_W[0] - 3.0, ANT_W[1] - 1.3, TOP, TOP + 27, 1.2, 1.2, 12, false);
  ball("white", ANT_W[0] - 3.0, TOP + 27, ANT_W[1] - 1.3, 1.2);
  // the thin masts (capped) and the braces from each antenna's collar
  for (const [u, n, top] of MASTS) {
    cyl("white", u, n, TOP, top - 0.3, 0.3, 0.3, 8, false);
    ball("white", u, top - 0.3, n, 0.3);
    const [au, an] = u > 0 ? ANT_E : ANT_W, d = Math.hypot(u - au, n - an), ou = (u - au) / d, on = (n - an) / d;
    rod("white", [au + ou * 2, COLLAR, an + on * 2], [u, COLLAR, n], 0.15);
    rod("white", [au + ou * 1.8, COLLAR - 0.3, an + on * 1.8], [u, TOP + 11, n], 0.15);
  }

  // ======== the Ledge: five glass boxes on the west face, white frames ========
  for (const nc of LEDGE.n) {
    const u0 = -FACE - LEDGE.out, u1 = -FACE, y0 = LEDGE.y, y1 = LEDGE.y + LEDGE.h, n0 = nc - LEDGE.w / 2, n1 = nc + LEDGE.w / 2;
    quad("glass", P(u0, y0, n0), P(u0, y0, n1), P(u0, y1, n1), P(u0, y1, n0));          // the outer face
    quad("glass", P(u0, y1, n0), P(u0, y1, n1), P(u1, y1, n1), P(u1, y1, n0));          // the top
    quad("glass", P(u0, y0, n0), P(u1, y0, n0), P(u1, y0, n1), P(u0, y0, n1));          // the glass floor
    quad("glass", P(u0, y0, n0), P(u1, y0, n0), P(u1, y1, n0), P(u0, y1, n0));          // the sides
    quad("glass", P(u0, y0, n1), P(u1, y0, n1), P(u1, y1, n1), P(u0, y1, n1));
    const t = 0.09;
    for (const [a, b] of [[[u0, y0, n0], [u0, y0, n1]], [[u0, y1, n0], [u0, y1, n1]], [[u0, y0, n0], [u0, y1, n0]], [[u0, y0, n1], [u0, y1, n1]],
      [[u0, y0, n0], [u1, y0, n0]], [[u0, y0, n1], [u1, y0, n1]], [[u0, y1, n0], [u1, y1, n0]], [[u0, y1, n1], [u1, y1, n1]]])
      rod("white", a, b, t, 4, 0.92);
  }

  // ======== the base: the podium, its roof garden, the canopies, the flags ========
  for (const [, pts, y0, y1, wk, rk] of PODIUM) {
    let acc = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const s = wk === "dark" ? 1 : 0.95;
      quad(wk, P(a[0], y0, a[1]), P(b[0], y0, b[1]), P(b[0], y1, b[1]), P(a[0], y1, a[1]),
        [[acc / 6, y0 / 5], [(acc + l) / 6, y0 / 5], [(acc + l) / 6, y1 / 5], [acc / 6, y1 / 5]], s);
      acc += l;
    }
    flat(rk, pts, y1);
  }
  // trees in the roof garden (on the 20 m roof, clear of the 25 m block and the atrium)
  for (const [u, n] of [[-47, -16], [-47, -24], [-47, -32], [-47, -42], [-47, -52], [-46, -61], [-36, -61], [-27, -61], [-17, -61],
    [-16, -40], [-16, -50], [17, -40], [24, -44], [31, -40], [18, -52], [28, -56], [20, -61], [31, -62]]) {
    const r = 1.6 + rnd() * 1.1, geo = new THREE.IcosahedronGeometry(r, 0);
    geo.scale(1, 0.85, 1); geo.translate(u, 20 + 1.2 + r, -n); addGeo("green", geo, 0.62);
    rod("dark", [u, 20, n], [u, 20 + 1.4, n], 0.12, 4);
  }
  for (const [, u0, u1, n0, n1, y, cols] of CANOPIES) {
    box("dark", u0, u1, y - (y > 5 ? 0.6 : 0.3), y, n0, n1, 1, 4, 0.85);
    for (const [u, n] of cols) cyl("dark", u, n, 0, y - 0.6, 0.25, 0.25, 8, false);
  }
  {
    const L2 = local(origin);
    for (const [lon, lat, k] of FLAGS) {
      const [x, z] = L2(lon, lat), dx = x - cx, dz = z - cz;
      const u = dx * Math.cos(TURN) - dz * Math.sin(TURN), n = -(dx * Math.sin(TURN) + dz * Math.cos(TURN)), H = 12;
      cyl("white", u, n, 0, H, 0.09, 0.07, 8, false, 0.9);
      ball("white", u, H + 0.12, n, 0.15, 0.9);
      const du = -0.34, dn = 0.94, a = (k + 0.02) / 3, b = (k + 0.98) / 3;   // the flag flies north-north-west, 2.4 m by 1.4 m
      quad("flags", P(u, H - 1.6, n), P(u + du * 2.4, H - 1.6, n + dn * 2.4), P(u + du * 2.4, H - 0.2, n + dn * 2.4), P(u, H - 0.2, n),
        [[a, 0], [b, 0], [b, 1], [a, 1]]);
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
    mesh.name = `willis-tower-${k}`;
    mesh.castShadow = !MAT[k].transparent; mesh.receiveShadow = true;
    if (MAT[k].transparent) mesh.renderOrder = 1;
    g.add(mesh);
    triangles += q.p.length / 9;
  }
  g.userData = { triangles, drawCalls: g.children.length };
  return g;
}
