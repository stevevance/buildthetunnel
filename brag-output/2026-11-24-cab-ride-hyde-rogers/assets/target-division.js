// Target at Division St and Larrabee St: store T-2613, "Chicago Division" (OpenStreetMap's branch: "Chicago Gold Coast"),
// 1200 N Larrabee St (600 W Division St), on part of the former Cabrini-Green site. Built by Target Corporation, which got the
// 3.6-acre site in a 2012 land swap with the Chicago Housing Authority (Business Planned Development 1183, passed by the City
// Council on July 28, 2011); general contractor Novak Construction; opened in October 2013. About 190,000 sq ft of store
// over a parking garage at street level. The architect could not be found. For the cab-ride film
// (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js and willis-tower.js. It replaces
// OpenStreetMap's single box there (city-wide.js, building i = 36023: 141 x 104 m, 10.8 m from its "3 levels").
//
// What it draws:
//   - The box: 138 x 101 m. The garage at street level, behind gray louvers on a brick plinth; the store above it in
//     horizontal-ribbed gray metal panels on Division and Larrabee, and white (south-west) and cream (north) flat panels.
//     The main roof is 13.3 to 14.0 m (it falls 0.7 m to the north) inside a parapet at 15.0 m. Along the north side there
//     is a taller block, 123 x 25 m, roof 20.0 m and parapet 21.4 m. It is flush with the west face and with the north face's
//     western 40 m, and set back 3.5 to 4 m from the rest of the north face, behind a ledge at the lower roof.
//   - The corner at Division and Larrabee: a red box (red metal panels above a curtain wall). On Division the glass is two
//     stories tall, on a brick sill; at the corner a red canopy over the entrance, with a glass box above it that wraps onto
//     Larrabee. The sign pylon is at the box's west end: a white blade 21 m tall, with Target's red bullseye and "TARGET"
//     on both broad faces (east and west).
//   - The brick bays: three, 10.7 m tall, standing proud of the walls (two on Division, one on Larrabee). Upper part tan
//     brick, lower part red-brown brick, with tall narrow windows; the lower panes carry Target's red and white window
//     graphics. A brick block at the north-east corner, with a red door panel on Larrabee and a large bullseye above it on
//     the north face. Flush brick piers between louver bays along the north side.
//   - Division's canopy (4.2 m, gray with a red stripe) between the bays. The garage entrances on Division (at Howe St) and
//     on Larrabee (near Scott St), each with a "TARGET PARKING" fascia and a bullseye parking sign. The red vertical strips
//     on the north block, on Larrabee and at the south-west corner. The "CVS pharmacy" sign above the eastern bay.
//   - The green roof: four sedum beds on the main roof (one short, three long ones running north-south) and two on the
//     north block, on a tan membrane, with the rooftop units on the walkways between them.
//
// Where the numbers come from:
//   - Outline, heights and the rooftop units: Cook County's 2022 LiDAR (ISGS, IL_Cook_DSM_2022 less IL_Cook_DTM_2022, US
//     survey feet x 0.3048006096), sampled on 2 m and 1 m grids over the block (33,233 points), measured from the street
//     grade (180.5 m NAVD88, the DTM along Division and Larrabee). The faces are where the DSM crosses 8 or 12 m; the
//     four corners are within 0.5 m. Main roof 13.3 m at the north to 14.0 m at the south; parapets 14.4-15.3 m; north block
//     20.0 m with a parapet of 1.2-1.8 m; the ledge and the north-east corner 13.3 m; brick bays 10.7 m (Division bay A
//     x -48.2 to -21.4, 2.7 m proud; bay B x -4.4 to 22.6, 2.8 m proud; Larrabee bay z -8 to 19, 2.4 m proud); Division
//     canopy 4.2 m, its edge 52.4-52.6 m south of the center; corner canopy 4-5 m; pylon top 20.9 m, 1.8 x 5.4 m in plan;
//     25 rooftop units (1.1-2.8 m above the deck), found where the DSM stands 0.7 m or more above a 9 m median of the roof.
//   - Footprint cross-check: OpenStreetMap way 243831261 (Target, "building:levels" 3; November 2026, through the Chicago
//     Cityscape CLI). Its jogs on Division match the bays and the recesses between them. The driveways (ways 830804366 on
//     Division at Howe St and 830804367 on Larrabee) place the two garage entrances.
//   - The sedum beds: traced from Google's satellite view (November 2026) and fitted to the LiDAR's roof corners (+-0.5 m);
//     every rooftop unit in the LiDAR falls on a walkway between them, which confirms the fit.
//   - The design, materials, colors and signs: Google Street View (August 2026: Division from the west, the south-west
//     corner, Division at Howe St, the corner glass and pylon, the corner from across Division and Larrabee, the Larrabee
//     bay, the north-east corner, and the north face from Scott St); NBC Chicago's photograph at the opening (October 2013);
//     YoChicago's construction photographs (July 2013). Reference images: refs/target-division/SOURCES.md.
//   - History: Target's press release (October 18, 2012: about 190,000 sq ft, opening October 2013), DNAinfo (October 8,
//     2013: "three-story"), NBC News (October 9, 2013), YoChicago (October 19, 2012: parking at ground level, Novak
//     Construction), the City Council's journal for PD 1183 (July 28, 2011; applicant Target Corporation; 1200-1232 N
//     Larrabee St and 600-646 W Division St).
//   Assumed: the main roof's fall as one plane (deck() below: 13.3 m at z = -23 to 14.0 m at z = 48) and the parapets at
//   one height (15.0 m; 14.0 m along the ledge and the north-east corner); the storefront's mullion spacing (2.75 m) and transoms; the
//   windows' positions in the bays (+-1 m, read from Street View) and their graphics; the garage louvers' and piers' rhythm on
//   the north and west faces (read from one Street View frame each); the red strips' spacing (13 m); the panels' sizes
//   and colors; the canopy's 0.7 m fascia; the pylon's panel joints and the size of its logo; the rooftop units as plain
//   boxes (their sizes +-0.6 m); the sedum beds' 0.15 m edge; the CVS sign's lettering. Left out: the planters and trees along
//   the sidewalks (the film draws its own street trees), the bike racks, the EV chargers in the garage, and what shows
//   through the glass.
//
//   import * as THREE from "three";
//   import { buildTargetDivision, targetDivisionSite } from "./target-division.js";
//   scene.add(buildTargetDivision({ THREE }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: TARGET_DIVISION_CENTRE } to have the store's center at (0, 0, 0). It needs a browser (or
// another DOM with <canvas>): the facades are painted on canvas textures.
export const TARGET_DIVISION_CENTRE = [-87.64424, 41.90427];        // the center of the footprint, +-0.5 m
const FILM_ORIGIN = [-87.620063, 41.863968];

// ---- the plan, in meters from the center (x east, z south): the four corners of the main walls (from the LiDAR) ----
const SW = [-67.6, 49.5], SE = [71.0, 48.9], NE = [68.4, -52.0], NW = [-69.8, -48.8];
const lerp = (a, b, t) => a + (b - a) * t;
const xE = (z) => lerp(SE[0], NE[0], (z - SE[1]) / (NE[1] - SE[1]));   // the Larrabee face at z
const zN = (x) => lerp(NE[1], NW[1], (x - NE[0]) / (NW[0] - NE[0]));   // the north face at x
const xW = (z) => lerp(NW[0], SW[0], (z - NW[1]) / (SW[1] - NW[1]));   // the west face at z
const zS = (x) => lerp(SW[1], SE[1], (x - SW[0]) / (SE[0] - SW[0]));   // the south wall's line (the west part and the red box)
// heights (m above the street)
const PARAPET = 15.0, LEDGE = 14.0, BLOCK_ROOF = 20.0, BLOCK_TOP = 21.4, BAY = 10.7, PYLON_TOP = 20.9;
const CANOPY = [3.6, 4.3], RED_CANOPY = [4.2, 4.9];
const deck = (z) => lerp(13.3, 14.0, Math.min(1, Math.max(0, (z + 23) / 71)));   // the main roof, falling to the north
// Division's main wall, west to east: the white part, behind bay A, in to recess 1, behind bay B and recess 2, out to the red box
const SOUTH = [SW, [-21.4, 49.3], [-21.4, 48.2], [22.6, 48.0], [22.6, 47.6], [33.6, 47.6], [33.6, 49.1], SE];
const SPLIT = -25.45;                                                    // north of this on Larrabee the wall stops at LEDGE
// the north block: from the north-west corner along the north face, in to the setback, east, down its east end, west along
// its south face
const BLOCK = [NW, [-29.5, zN(-29.5)], [-29.5, -46.25], [53.5, -47.63], [53.6, -25.45], [xW(-22.85), -22.85]];
// the brick bays: [x0, x1 (or z0, z1 on Larrabee), the wall's line, the front]
const BAY_A = [-48.2, -21.4, 49.4, 52.2], BAY_B = [-4.4, 22.6, 48.1, 50.9], BAY_C = [19, -8, null, 72.6];
const PYLON = [33.6, 35.4, 46.2, 51.6];                                  // x0, x1, z0, z1
// the sedum beds [x0, x1, z0, z1]: on the main roof, then on the north block
const BEDS = [[-60.9, -36.0, -17.1, -2.2], [-28.3, -2.5, -17.5, 37.5], [3.8, 31.4, -18.4, 36.9], [36.4, 61.3, -19.3, 33.7]];
const BLOCK_BEDS = [[-63.9, -23.5, -43.0, -27.5], [-7.6, 46.9, -44.5, -29.0]];
// the rooftop units: the LiDAR's [x0, x1, z0, z1] (its 1 m cells), height above the deck
const UNITS = [[9.9, 10.9, -23.1, -21.1, 1.6], [-11.1, -8.1, -22.1, -21.1, 1.6], [-54.1, -52.1, -21.1, -20.1, 1.4], [31.9, 33.9, -19.1, -15.1, 1.6],
  [-1.1, -0.1, -18.1, -14.1, 1.6], [-34.1, -32.1, -17.1, -13.1, 1.6], [-44.1, -42.1, -0.1, 6.9, 2.0], [-48.1, -45.1, 7.9, 10.9, 1.3],
  [-43.1, -41.1, 8.9, 14.9, 1.9], [-65.1, -65.1, 10.9, 12.9, 1.5], [32.9, 33.9, 11.9, 16.9, 1.6], [-48.1, -46.1, 12.9, 15.9, 1.3],
  [-1.1, 0.9, 12.9, 16.9, 1.6], [-33.1, -32.1, 15.9, 19.9, 1.6], [-56.1, -52.1, 20.9, 21.9, 1.7], [58.9, 59.9, 27.9, 28.9, 1.4],
  [62.9, 62.9, 27.9, 31.9, 1.1], [46.9, 48.9, 28.9, 31.9, 1.4], [-1.1, 0.9, 35.9, 38.9, 1.6], [39.9, 40.9, 37.9, 41.9, 1.6],
  [54.9, 56.9, 37.9, 41.9, 1.7], [61.9, 63.9, 37.9, 38.9, 1.4], [-55.1, -53.1, 38.9, 41.9, 1.4], [58.9, 59.9, -42.1, -39.1, 2.8],
  [54.9, 56.9, -31.1, -28.1, 1.7]];
// what the film's own OpenStreetMap buildings and trees give way to: the lot to the curbs' side of the canopies, [lon, lat]
const SITE_RING = [[-87.6450970, 41.9047202], [-87.6433999, 41.9047508], [-87.6433408, 41.9037838], [-87.6450704, 41.9037838]];

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The site as a closed ring of local meters [x0, z0, x1, z1, ..., x0, z0], for clearing OpenStreetMap's buildings
export function targetDivisionSite(origin = FILM_ORIGIN) {
  const L = local(origin), r = SITE_RING.flatMap(([lon, lat]) => L(lon, lat));
  return [[...r, r[0], r[1]]];
}

export function buildTargetDivision({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...TARGET_DIVISION_CENTRE), g = new THREE.Group();
  g.name = "target-division";
  g.position.set(cx, 0, cz);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)
  const rgb = (c, f = 1) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * f)))).join(",")})`;

  // ======== the elevation atlas: each street front painted to scale on one canvas, as seen from outside ========
  // Four strips, 22 m tall (256 px, 11.6 px a meter) and 28 px a meter along: 0 Division (s = x + 70, west to east),
  // 1 Larrabee (s = 51 - z, south to north), 2 the north face (s = 70 - x, east to west), 3 the west face (s = z + 50, north
  // to south). A face parallel to a strip (a wall, a bay's front, a canopy's fascia) takes its u from where it stands, so
  // the bays, signs and canopies land where they are; the returns take a swatch (strip 1, past the face), and the pylon's
  // faces their own panel (strip 3). The top of strips 0 and 1 (15.2-22 m, above those walls) holds the north block's south
  // face and east end, squeezed into 6.8 m. The emissive canvas, a quarter the size, carries the sky the glass reflects.
  const AW = 4096, AH = 1024, SH = 256, HM = 22, PXM = 28, PXV = SH / HM, PX = 1 / PXM, PY = 1 / PXV, ES = 0.25;
  const S = [(p) => p[0] + 70, (p) => 51 - p[1], (p) => 70 - p[0], (p) => p[1] + 50];
  const SWATCH = (i) => 2940 + i * 124, PYLON_X = 2830;                  // canvas x of each swatch (4.2 m wide), of the pylon's face
  const SW_BRICK = 0, SW_GRAY = 1, SW_RED = 2, SW_CREAM = 3, SW_WHITE = 4, SW_CANOPY = 5;
  const vOf = (k, y) => 1 - ((k + 1) * SH - y * PXV) / AH;
  const fy = (y) => 15.2 + (y - 13.3) * (6.8 / 8.1);                    // the north block's faces, squeezed into a strip's top
  const atlas = document.createElement("canvas"); atlas.width = AW; atlas.height = AH;
  const emis = document.createElement("canvas"); emis.width = AW * ES; emis.height = AH * ES;
  const A = atlas.getContext("2d"), E = emis.getContext("2d");
  A.fillStyle = "#a3a8ab"; A.fillRect(0, 0, AW, AH); E.fillStyle = "#000"; E.fillRect(0, 0, AW * ES, AH * ES);
  // paint into strip k from canvas x X0, in meters: (s, y) with y up from the street
  const on = (k, X0, draw) => {
    for (const [c, sc] of [[A, 1], [E, ES]]) {
      c.save(); c.beginPath(); c.rect(0, k * SH * sc, AW * sc, SH * sc); c.clip();
      c.setTransform(PXM * sc, 0, 0, PXV * sc, X0 * sc, (k + 1) * SH * sc);
    }
    draw();
    A.restore(); E.restore();
  };
  const R = (s0, s1, y0, y1, fill) => { A.fillStyle = fill; A.fillRect(s0, -y1, s1 - s0, y1 - y0); };
  const sky = (s0, s1, y0, y1) => {                                      // the sky in the glass, on the emissive canvas
    const gr = E.createLinearGradient(0, -y1, 0, -y0); gr.addColorStop(0, "#b6c8d6"); gr.addColorStop(1, "#56697a");
    E.fillStyle = gr; E.fillRect(s0, -y1, s1 - s0, y1 - y0);
  };
  // flat panels, each a little lighter or darker, with joints
  const panels = (s0, s1, y0, y1, c, pw, ph, vary = 0.035, joint = "rgba(70,70,66,0.35)", yMap = (y) => y) => {
    for (let y = y0; y < y1 - 1e-6; y += ph) for (let s = s0; s < s1 - 1e-6; s += pw)
      R(s, Math.min(s + pw, s1), yMap(y), yMap(Math.min(y + ph, y1)), rgb(c, 1 + (rnd() - 0.5) * 2 * vary));
    for (let y = y0 + ph; y < y1 - 1e-6; y += ph) R(s0, s1, yMap(y) - PY * 0.5, yMap(y) + PY * 0.5, joint);
    for (let s = s0 + pw; s < s1 - 1e-6; s += pw) R(s - PX * 0.5, s + PX * 0.5, yMap(y0), yMap(y1), joint);
  };
  // horizontal-ribbed metal panels: ribs every 0.32 m, a joint every 6 m
  const ribbed = (s0, s1, y0, y1) => {
    R(s0, s1, y0, y1, "#a6abae");
    for (let y = y0 + 0.16; y < y1; y += 0.32) { R(s0, s1, y, y + PY, "#8b9093"); R(s0, s1, y + PY, y + 2 * PY, "#bcc0c2"); }
    for (let s = Math.ceil(s0 / 6) * 6; s < s1; s += 6) R(s, s + PX, y0, y1, "rgba(60,64,68,0.4)");
  };
  // brick: the color with a speckle and faint coursing
  const brick = (s0, s1, y0, y1, c) => {
    R(s0, s1, y0, y1, rgb(c));
    const n = Math.round((s1 - s0) * (y1 - y0) * 9);
    for (let i = 0; i < n; i++) { const s = s0 + rnd() * (s1 - s0), y = y0 + rnd() * (y1 - y0); R(s, s + PX, y, y + PY, rgb(c, 0.86 + rnd() * 0.28)); }
    for (let y = y0 + 0.4; y < y1; y += 0.4) R(s0, s1, y, y + PY * 0.6, "rgba(235,225,210,0.16)");
  };
  const louvers = (s0, s1, y0, y1) => { R(s0, s1, y0, y1, "#4a4f53"); for (let y = y0 + 0.1; y < y1; y += 0.3) R(s0, s1, y, y + PY * 1.3, "#969b9e"); };
  // glass between mullions every `bay` m, with transoms at the heights in `tr`
  const glass = (s0, s1, y0, y1, bay = 2.75, tr = [], mull = "#c6cacd") => {
    const gr = A.createLinearGradient(0, -y1, 0, -y0); gr.addColorStop(0, "#7b93a2"); gr.addColorStop(0.35, "#3e5664"); gr.addColorStop(1, "#2c3f4a");
    A.fillStyle = gr; A.fillRect(s0, -y1, s1 - s0, y1 - y0); sky(s0, s1, y0, y1);
    const n = Math.max(1, Math.round((s1 - s0) / bay)), w = (s1 - s0) / n;
    for (let i = 0; i <= n; i++) R(s0 + i * w - 0.07, s0 + i * w + 0.07, y0, y1, mull);
    for (const t of tr) R(s0, s1, t - 0.06, t + 0.06, mull);
    R(s0, s1, y0, y0 + 0.12, mull); R(s0, s1, y1 - 0.12, y1, mull);
  };
  const BRICK_TAN = [198, 142, 100], BRICK_RED = [152, 88, 60], BRICK_N = [166, 108, 76], WHITE = [233, 233, 228], CREAM = [222, 215, 199];
  const RED = [198, 20, 30], CAP = "#d8ccb6", COPING = "#cfd1d0", DARK = "#24272a";
  // Target's bullseye: a red disc, a white ring, a red dot (r in meters; the strip's scale makes it round on the wall)
  const bullseye = (s, y, r) => {
    for (const [f, c] of [[1, "#cc0000"], [0.66, "#ffffff"], [0.33, "#cc0000"]]) {
      A.beginPath(); A.ellipse(s, -y, r * f, r * f, 0, 0, Math.PI * 2); A.fillStyle = c; A.fill();
    }
  };
  // red letters, `h` meters tall, centered on s with the baseline at y
  const words = (text, s, y, h, color = "#cc0000", weight = "bold") => {
    A.save(); A.translate(s, -y); A.scale(h / 40, h / 40);             // (in meters, so the letters are true on the wall)
    A.font = `${weight} 52px Helvetica, Arial, sans-serif`; A.textAlign = "center"; A.textBaseline = "alphabetic"; A.fillStyle = color;
    A.fillText(text, 0, 0); A.restore();
  };
  // a tall narrow window in a brick bay: aluminum frame, glass, a transom at 4.5 m, the lower panes with red graphics
  const tallWindow = (s, w = 1.5, y0 = 1.0, y1 = 9.8) => {
    R(s - w / 2, s + w / 2, y0, y1, "#c3c7ca");
    glass(s - w / 2 + 0.1, s + w / 2 - 0.1, 4.6, y1 - 0.1, 9, [], "#c3c7ca");
    R(s - w / 2 + 0.1, s + w / 2 - 0.1, y0 + 0.1, 4.4, "#f2f0ec");
    A.save(); A.beginPath(); A.rect(s - w / 2 + 0.1, -4.4, w - 0.2, 4.4 - y0 - 0.1); A.clip();
    const cy = y0 + 1.2 + rnd() * 1.5, cs = s + (rnd() - 0.5) * w;
    for (const [r, c] of [[2.6, "#cc0000"], [1.8, "#f2f0ec"], [1.0, "#cc0000"]]) { A.beginPath(); A.ellipse(cs, -cy, r, r, 0, 0, Math.PI * 2); A.fillStyle = c; A.fill(); }
    A.restore();
  };
  // a brick bay's front: red-brown below 4.5 m, tan above, a stone cap; windows at the given s
  const bayFront = (s0, s1, wins, c = BRICK_TAN) => {
    brick(s0, s1, 0, 4.5, BRICK_RED); brick(s0, s1, 4.5, BAY - 0.3, c); R(s0, s1, BAY - 0.3, BAY, CAP); R(s0, s1, 0, 0.3, "#6e4a3a");
    for (const s of wins) tallWindow(s);
  };
  const plinth = (s0, s1, h = 0.6) => brick(s0, s1, 0, h, [125, 90, 70]);
  const garageLevel = (s0, s1, top = 4.0) => { plinth(s0, s1); louvers(s0, s1, 0.6, top); };
  // a garage entrance: the opening, the "TARGET PARKING" fascia (sampled by its canopy's front) and a bullseye parking sign
  const garage = (s0, s1, signAt) => {
    R(s0, s1, 0, 3.6, DARK);
    for (let s = s0 + 1; s < s1 - 0.5; s += 2.2) R(s, s + 0.6, 3.25, 3.35, "#e8e6d8");      // the lights inside
    R(s0, s1, CANOPY[0], CANOPY[1], "#e4e4e0"); R(s0, s1, CANOPY[0], CANOPY[0] + 0.08, "#9a9c9c");
    words("TARGET PARKING", (s0 + s1) / 2, CANOPY[0] + 0.2, 0.42);
    bullseye(signAt, 5.0, 0.42);
  };
  // the under-canopy band: gray fascia over a red stripe (the canopy's front shows it), in the canopy's shade below
  const fascia = (s0, s1) => { R(s0, s1, CANOPY[0] + 0.32, CANOPY[1], "#d4d6d7"); R(s0, s1, CANOPY[0], CANOPY[0] + 0.32, "#c8161e"); };
  const shade = (s0, s1, y1 = CANOPY[0]) => R(s0, s1, 0, y1, "rgba(20,24,28,0.28)");
  // the north block's cream panels and red strips, drawn with a height map (the squeezed tops of strips 0 and 1, or not)
  const blockFace = (s0, s1, y0, strips, yMap = (y) => y) => {
    panels(s0, s1, y0, BLOCK_TOP - 0.4, CREAM, 3.0, 1.5, 0.035, "rgba(70,70,66,0.35)", yMap);
    R(s0, s1, yMap(BLOCK_TOP - 0.4), yMap(BLOCK_TOP), COPING);
    for (const s of strips) if (s > s0 && s < s1) R(s - 0.45, s + 0.45, yMap(17.6), yMap(20.8), rgb(RED));
  };
  // the north side's base: brick piers 10.7 m tall, between them louvers under cream panels
  const northBase = (s0, s1, piers, doors = []) => {
    panels(s0, s1, 0.6, BAY, CREAM, 3.0, 1.5); garageLevel(s0, s1, 3.6);
    for (const [a, b] of piers) { const p0 = Math.max(s0, Math.min(a, b)), p1 = Math.min(s1, Math.max(a, b)); if (p1 > p0) brick(p0, p1, 0, BAY, BRICK_N); }
    for (const s of doors) { R(s - 0.75, s + 0.75, 0, 2.4, "#3a3330"); R(s - 0.02, s + 0.02, 0, 2.4, "#1a1715"); }
  };

  // ---- strip 0: Division St (s = x + 70) ----
  on(0, 0, () => {
    const sx = (x) => x + 70;
    R(0, AW / PXM, 0, HM, "#a6abae");
    // the white south-west block: panels above, at street level the corner pier, louvers, a red panel, the garage entrance
    panels(sx(-67.6), sx(-48.2), 4.5, PARAPET - 0.2, WHITE, 3.0, 1.5);
    plinth(sx(-67.6), sx(-48.2));
    brick(sx(-67.6), sx(-66.2), 0, 4.5, BRICK_N);
    louvers(sx(-66.2), sx(-63.0), 0.6, 4.0); panels(sx(-66.2), sx(-61.4), 4.0, 4.5, WHITE, 3, 1.5);
    panels(sx(-63.0), sx(-61.4), 0.6, 4.5, WHITE, 1.6, 1.5);
    panels(sx(-61.4), sx(-60.0), 0, 4.5, RED, 1.4, 1.5);
    louvers(sx(-60.0), sx(-57.4), 0.6, 4.0); panels(sx(-60.0), sx(-57.4), 4.0, 4.5, WHITE, 3, 1.5);
    garage(sx(-57.4), sx(-50.0), sx(-58.6));
    brick(sx(-50.0), sx(-48.2), 0, 4.5, BRICK_N);
    // bay A (its front samples here), the ribbed wall above it
    ribbed(sx(-48.2), sx(-21.4), BAY, PARAPET);
    bayFront(sx(-48.2), sx(-21.4), [sx(-38.5), sx(-36.3), sx(-23.3)]);
    // recess 1: ribbed, a ribbon window, the canopy, louvers and white columns in its shade, two doors
    ribbed(sx(-21.4), sx(-4.4), CANOPY[1], PARAPET);
    glass(sx(-19.4), sx(-6.6), 6.0, 8.7, 3.2);
    garageLevel(sx(-21.4), sx(-4.4), 3.4);
    for (const x of [-19.2, -13.7, -8.2]) R(sx(x) - 0.22, sx(x) + 0.22, 0, CANOPY[0], "#e2e2de");
    R(sx(-20.9), sx(-19.8), 0, 2.4, "#5d4337"); R(sx(-6.1), sx(-4.6), 0, 2.7, DARK);
    shade(sx(-21.4), sx(-4.4));
    // bay B, the CVS sign above it
    ribbed(sx(-4.4), sx(22.6), BAY, PARAPET);
    bayFront(sx(-4.4), sx(22.6), [sx(5.1), sx(7.1), sx(19.8)]);
    words("CVS", sx(13.4), 12.1, 1.0); words("pharmacy", sx(16.9), 12.1, 0.62, "#cc0000", "normal");
    // recess 2: ribbed, the canopy, louvers, a glass door by the pylon
    ribbed(sx(22.6), sx(33.6), CANOPY[1], PARAPET);
    garageLevel(sx(22.6), sx(33.6), 3.4);
    R(sx(27.8) - 0.22, sx(27.8) + 0.22, 0, CANOPY[0], "#e2e2de");
    glass(sx(31.4), sx(33.4), 0.05, 3.0, 1.0);
    shade(sx(22.6), sx(33.6));
    // the canopy's fascia along recess 1, bay B and recess 2 (and over bay A's east end)
    fascia(sx(-27), sx(33.6));
    // the red box: red panels over the two-story glass on a brick sill; at the corner the entrance, the red canopy, the glass
    // box above (and past the corner, for the red canopy's front, which runs on to x = 72.6)
    panels(sx(33.6), sx(73), 10.5, PARAPET - 0.2, RED, 2.4, 1.125, 0.04, "rgba(90,8,12,0.5)");
    brick(sx(33.6), sx(57.4), 0, 1.0, [150, 78, 56]);
    glass(sx(35.4), sx(57.4), 1.0, 10.5, 2.75, [4.4, 4.9, 7.7]);
    R(sx(35.4), sx(57.4), 4.45, 4.85, "rgba(200,212,218,0.75)");                       // the frit at the floor line
    glass(sx(57.4), sx(71.0), 0.0, RED_CANOPY[0], 1.7, [2.6]);
    for (const x of [62.0, 64.0, 66.0]) R(sx(x) - 0.9, sx(x) + 0.9, 0.0, 2.4, "rgba(30,40,46,0.55)");   // the doors
    R(sx(56.5), sx(73), RED_CANOPY[0], RED_CANOPY[1], "#c4121b");
    glass(sx(57.4), sx(71.0), RED_CANOPY[1], 10.5, 2.75, [7.7]);
    R(sx(71.0) - 0.15, sx(71.0), 0, PARAPET, "#b9bdbf");                                // the corner's mullion
    R(sx(-67.6), sx(73), PARAPET - 0.2, PARAPET, COPING);
    // the north block's south face (x -69.22 to 53.6), squeezed into 15.2-22 m
    blockFace(sx(-70), sx(54), 13.3, [], fy);
  });

  // ---- strip 1: Larrabee St (s = 51 - z), then the swatches ----
  on(1, 0, () => {
    const sz = (z) => 51 - z;
    R(0, AW / PXM, 0, HM, "#a6abae");
    // the corner: the entrance, the red canopy, the glass box, red above; red panels to z = 28.9 over a garage opening
    panels(sz(51), sz(28.9), 10.5, PARAPET - 0.2, RED, 2.4, 1.125, 0.04, "rgba(90,8,12,0.5)");
    glass(sz(48.9), sz(36.9), 0.0, RED_CANOPY[0], 1.7, [2.6]);
    for (const z of [45.5, 43.5]) R(sz(z) - 0.9, sz(z) + 0.9, 0, 2.4, "rgba(30,40,46,0.55)");
    R(sz(51), sz(35.5), RED_CANOPY[0], RED_CANOPY[1], "#c4121b");
    glass(sz(48.9), sz(36.9), RED_CANOPY[1], 10.5, 2.75, [7.7]);
    panels(sz(36.9), sz(28.9), 4.0, 10.5, RED, 2.4, 1.125, 0.04, "rgba(90,8,12,0.5)");
    R(sz(36.9), sz(28.9), 0, 4.0, DARK); R(sz(33.2) - 0.3, sz(33.2) + 0.3, 0, 4.0, "#b8b8b2"); R(sz(36.9), sz(36.3), 0, 4.0, "#b8b8b2");
    R(sz(48.9), sz(48.9) + 0.15, 0, PARAPET, "#b9bdbf");
    // the ribbed wall with the garage behind louvers, from the red box to the north-east corner
    ribbed(sz(28.9), sz(-52.6), 4.0, PARAPET);
    garageLevel(sz(28.9), sz(-38));
    // bay C
    bayFront(sz(19), sz(-8), [sz(12.0), sz(6.5), sz(-3.0)]);
    // the red strip, the garage entrance, the red door panel, the brick block at the corner
    R(sz(-35.0), sz(-36.2), 4.5, 13.6, rgb(RED));
    garage(sz(-38), sz(-45.5), sz(-37.4));
    panels(sz(-45.5), sz(-50.5), 0, 4.5, RED, 2.5, 1.5);
    for (const z of [-47.2, -48.3]) { R(sz(z) - 0.55, sz(z) + 0.55, 0, 2.4, "#a4111a"); R(sz(z) - 0.5, sz(z) + 0.5, 0.05, 2.35, "#c2141d"); }
    brick(sz(-45.5), sz(-52.6), 4.5, BAY - 0.3, BRICK_TAN); brick(sz(-50.5), sz(-52.6), 0, 4.5, BRICK_RED);
    R(sz(-45.5), sz(-52.6), BAY - 0.3, BAY, CAP);
    R(sz(51), sz(SPLIT), PARAPET - 0.2, PARAPET, COPING); R(sz(SPLIT), sz(-52.6), LEDGE - 0.2, LEDGE, COPING);
    // the north block's east end (z -25.45 to -47.63), squeezed into 15.2-22 m
    blockFace(sz(-25.45), sz(-47.63), 13.3, [], fy);
  });
  // the swatches, for the returns: each 4.2 m wide, full height
  on(1, SWATCH(SW_BRICK), () => { bayFront(0, 4.2, []); ribbed(0, 4.2, BAY, HM); });
  on(1, SWATCH(SW_GRAY), () => { ribbed(0, 4.2, 4.0, HM); garageLevel(0, 4.2); });
  on(1, SWATCH(SW_RED), () => panels(0, 4.2, 0, HM, RED, 2.1, 1.125, 0.04, "rgba(90,8,12,0.5)"));
  on(1, SWATCH(SW_CREAM), () => panels(0, 4.2, 0, HM, CREAM, 2.1, 1.5));
  on(1, SWATCH(SW_WHITE), () => panels(0, 4.2, 0, HM, WHITE, 2.1, 1.5));
  on(1, SWATCH(SW_CANOPY), () => { R(0, 4.2, 0, HM, "#d4d6d7"); R(0, 4.2, CANOPY[0], CANOPY[0] + 0.32, "#c8161e"); });

  // ---- strip 2: the north face (s = 70 - x) ----
  on(2, 0, () => {
    const sx = (x) => 70 - x;
    R(0, AW / PXM, 0, HM, "#a6abae");
    // the north-east corner: the brick block, the ribbed wall above, the bullseye
    brick(sx(68.9), sx(50), 0, BAY - 0.3, BRICK_N); R(sx(68.9), sx(50), BAY - 0.3, BAY, CAP); R(sx(68.9), sx(50), 0, 0.5, "#6e4a3a");
    ribbed(sx(68.9), sx(50), BAY, LEDGE);
    bullseye(sx(63.5), 12.3, 1.4);
    ribbed(sx(50), sx(42), 3.6, LEDGE); garageLevel(sx(50), sx(42), 3.6);      // the ribbed wall runs on past the brick a little
    // the base along the rest, the cream panels, the block's face above the ledge and the flush part, the red strips
    const piers = [[40, 31], [27, 17], [10, 2], [-5, -11.5], [-23, -42], [-52, -60], [-66, -70]].map(([a, b]) => [sx(a), sx(b)]);
    northBase(sx(42), sx(-70), piers, [sx(-35.2)]);
    panels(sx(42), sx(-29.5), BAY, LEDGE - 0.2, CREAM, 3.0, 1.5); R(sx(68.9), sx(-29.5), LEDGE - 0.2, LEDGE, COPING);
    const strips = [51, 38, 25, 12, -1, -14, -27, -40, -53, -66].map(sx);
    blockFace(sx(53.6), sx(-29.5), 13.3, strips);
    blockFace(sx(-29.5), sx(-70), BAY, strips);
  });

  // ---- strip 3: the west face (s = z + 50), then the pylon's face ----
  on(3, 0, () => {
    const sz = (z) => z + 50;
    R(0, AW / PXM, 0, HM, "#a6abae");
    // the north block's flush part, then the white wall over a brick base with louver openings, the red strip by the corner
    northBase(sz(-48.8), sz(-22.85), [[sz(-48.8), sz(-44)], [sz(-36), sz(-30)]]);
    blockFace(sz(-48.8), sz(-22.85), BAY, [sz(-40), sz(-27)]);
    panels(sz(-22.85), sz(49.5), 4.5, PARAPET - 0.2, WHITE, 3.0, 1.5);
    R(sz(-22.85), sz(49.5), 4.5, 9.0, "rgba(120,124,126,0.10)");                     // the lower rows a shade grayer
    brick(sz(-22.85), sz(49.5), 0, 4.5, BRICK_N);
    for (let z = -19; z < 40; z += 12) louvers(sz(z), sz(z + 6), 0.6, 3.8);
    R(sz(46.9), sz(48.3), 5.5, 13.0, rgb(RED));
    R(sz(-22.85), sz(49.5), PARAPET - 0.2, PARAPET, COPING);
  });
  // the pylon's broad face (5.4 m wide): white panels, the bullseye, the wordmark
  on(3, PYLON_X, () => {
    panels(0, 5.4, 0, PYLON_TOP - 0.2, [241, 241, 237], 1.35, 1.5, 0.02);
    R(0, 5.4, PYLON_TOP - 0.2, PYLON_TOP, COPING);
    bullseye(2.7, 18.4, 1.7);
    words("TARGET", 2.7, 15.6, 0.72);
  });

  const tex = (cv, repeat) => {
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const small = (n, draw) => { const cv = document.createElement("canvas"); cv.width = cv.height = n; draw(cv.getContext("2d"), n); return tex(cv, true); };
  // the roof membrane (16 m a tile): tan, its sheets' seams every 2 m
  const membrane = small(256, (c, n) => {
    c.fillStyle = "#d8c8a8"; c.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) { c.fillStyle = rgb([216, 200, 168], 0.9 + rnd() * 0.18); c.fillRect(rnd() * n, rnd() * n, 2, 2); }
    c.fillStyle = "rgba(120,104,80,0.25)"; for (let y = 0; y < n; y += 32) c.fillRect(0, y, n, 1);
  });
  // sedum (8 m a tile): olive, with yellow-green, dark green and russet clumps
  const sedum = small(256, (c, n) => {
    c.fillStyle = "#77722f"; c.fillRect(0, 0, n, n);
    const tones = [[140, 136, 60], [96, 104, 44], [124, 98, 52], [108, 118, 50], [150, 142, 72]];
    for (let i = 0; i < 2600; i++) { const t = tones[Math.floor(rnd() * tones.length)], r = 1 + rnd() * 3; c.fillStyle = rgb(t, 0.9 + rnd() * 0.2); c.beginPath(); c.arc(rnd() * n, rnd() * n, r, 0, Math.PI * 2); c.fill(); }
  });
  const atlasTex = tex(atlas, false), emisTex = tex(emis, false);
  const MAT = {
    walls: new THREE.MeshStandardMaterial({ map: atlasTex, emissive: 0xffffff, emissiveMap: emisTex, emissiveIntensity: 0.32, roughness: 0.78, metalness: 0.05 }),
    roof: new THREE.MeshStandardMaterial({ map: membrane, roughness: 0.95, side: THREE.DoubleSide }),
    green: new THREE.MeshStandardMaterial({ map: sedum, roughness: 1, side: THREE.DoubleSide }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc4c7c9, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide }),
  };

  // ======== the geometry, gathered by material into one mesh each ========
  const B = {};
  const bt = (k) => B[k] || (B[k] = { p: [], n: [], t: [] });
  const tri = (k, a, b, c, ta, tb, tc) => {                             // its normal from its winding (counterclockwise = front)
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const q = bt(k);
    for (const [p, t] of [[a, ta], [b, tb], [c, tc]]) { q.p.push(p[0], p[1], p[2]); q.n.push(nx, ny, nz); q.t.push(t[0], t[1]); }
  };
  const quad = (k, a, b, c, d, uv) => { tri(k, a, b, c, uv[0], uv[1], uv[2]); tri(k, a, c, d, uv[0], uv[2], uv[3]); };
  // a wall from A to B (left to right as seen from outside), y0 to y1 (or per end: [yA, yB]), its texture from uvf(point, y, t)
  const wall = (k, A2, B2, y0, y1, uvf) => {
    const [a0, b0] = Array.isArray(y0) ? y0 : [y0, y0], [a1, b1] = Array.isArray(y1) ? y1 : [y1, y1];
    const len = Math.hypot(B2[0] - A2[0], B2[1] - A2[1]);
    quad(k, [A2[0], a0, A2[1]], [B2[0], b0, B2[1]], [B2[0], b1, B2[1]], [A2[0], a1, A2[1]],
      [uvf(A2, a0, 0), uvf(B2, b0, len), uvf(B2, b1, len), uvf(A2, a1, 0)]);
  };
  const elev = (k, y = (v) => v) => (p, v) => [S[k](p) * PXM / AW, vOf(k, y(v))];
  const swatch = (i) => (p, v, t) => [(SWATCH(i) + t * PXM) / AW, vOf(1, v)];
  const plain = (scale = 16) => (p, v, t) => [t / scale, v / scale];
  // a flat polygon at heights y(x, z), facing up (or down), its texture in meters / tile
  const flat = (k, pts, y, down = false, tile = 16) => {
    const tris = THREE.ShapeUtils.triangulateShape(pts.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const t of tris) {
      let [a, b, c] = t.map((i) => [pts[i][0], y(pts[i][0], pts[i][1]), pts[i][1]]);
      const up = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]) > 0;   // the y of (b - a) x (c - a)
      if (up === down) [b, c] = [c, b];
      tri(k, a, b, c, [a[0] / tile, a[2] / tile], [b[0] / tile, b[2] / tile], [c[0] / tile, c[2] / tile]);
    }
  };
  // a box [x0, x1] x [z0, z1] from y0 to y1, its sides and top from the given textures (null: leave the face out)
  const box = (x0, x1, z0, z1, y0, y1, { top = "metal", bottom = null, south, north, east, west }) => {
    const sides = { south: [[x0, z1], [x1, z1]], north: [[x1, z0], [x0, z0]], east: [[x1, z1], [x1, z0]], west: [[x0, z0], [x0, z1]] };
    for (const [face, f] of Object.entries({ south, north, east, west })) if (f) wall(f[0], ...sides[face], y0, y1, f[1]);
    const ring = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    if (top) flat(top, ring, () => y1);
    if (bottom) flat(bottom, ring, () => y0, true);
  };
  const M = (k) => ["metal", plain(4)], W = (uvf) => ["walls", uvf];

  // ---- the main walls ----
  for (let i = 0; i < SOUTH.length - 1; i++) {                           // Division: the faces, and the returns where it steps in
    const a = SOUTH[i], b = SOUTH[i + 1];                                // (the one step out, at x = 33.6, is inside the pylon)
    if (a[0] !== b[0]) wall("walls", a, b, 0, PARAPET, elev(0));
    else if (b[1] < a[1]) wall("walls", a, b, 0, PARAPET, swatch(SW_GRAY));
  }
  const eSplit = [xE(SPLIT), SPLIT];
  wall("walls", SE, eSplit, 0, PARAPET, elev(1)); wall("walls", eSplit, NE, 0, LEDGE, elev(1));
  const nStep = [-29.5, zN(-29.5)];
  wall("walls", NE, nStep, 0, LEDGE, elev(2)); wall("walls", nStep, NW, 0, BLOCK_TOP, elev(2));
  const wSplit = BLOCK[5];
  wall("walls", NW, wSplit, 0, BLOCK_TOP, elev(3)); wall("walls", wSplit, SW, 0, PARAPET, elev(3));
  // ---- the north block's faces above the roofs ----
  wall("walls", BLOCK[2], BLOCK[1], 13.3, BLOCK_TOP, swatch(SW_CREAM));          // the return at the setback, facing east
  wall("walls", BLOCK[3], BLOCK[2], 13.3, BLOCK_TOP, elev(2));                   // the setback face, behind the ledge
  wall("walls", BLOCK[4], BLOCK[3], 13.3, BLOCK_TOP, elev(1, fy));               // the east end
  wall("walls", BLOCK[5], BLOCK[4], 13.3, BLOCK_TOP, elev(0, fy));               // the south face, over the main roof

  // ---- the roofs: the main deck inside its parapet (and up to the block's faces), the block's roof inside its own ----
  // offset a ring's edges inward by d[i] each (mitered), for the parapets' inner faces
  const inset = (ring, d) => {
    let area = 0; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; area += p[0] * q[1] - q[0] * p[1]; }
    const sgn = area > 0 ? 1 : -1, n = ring.length, lines = [];
    for (let i = 0; i < n; i++) {
      const p = ring[i], q = ring[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
      const nx = -dz / l * sgn, nz = dx / l * sgn;                       // inward, for a ring of either winding
      lines.push([[p[0] + nx * d[i], p[1] + nz * d[i]], [dx / l, dz / l]]);
    }
    return lines.map((ln, i) => {
      const [p1, d1] = lines[(i + n - 1) % n], [p2, d2] = ln, den = d1[0] * d2[1] - d1[1] * d2[0];
      if (Math.abs(den) < 1e-9) return p2;
      const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
      return [p1[0] + d1[0] * t, p1[1] + d1[1] * t];
    });
  };
  const T = 0.3;                                                         // the parapets' thickness
  {
    // the main roof's ring with each edge's parapet top (0: a face of the north block, no parapet)
    const ring = [...SOUTH, eSplit, NE, BLOCK[1], BLOCK[2], BLOCK[3], BLOCK[4], BLOCK[5]];
    const tops = [...SOUTH.slice(1).map(() => PARAPET), PARAPET, LEDGE, LEDGE, 0, 0, 0, 0, PARAPET];
    const inner = inset(ring, tops.map((t) => (t ? T : 0)));
    flat("roof", inner, (x, z) => deck(z));
    for (let i = 0; i < ring.length; i++) {
      const top = tops[i]; if (!top) continue;
      const j = (i + 1) % ring.length, a = inner[i], b = inner[j];
      // the inner face (facing in: drawn from b to a) and the coping
      wall("roof", b, a, [deck(b[1]), deck(a[1])], top, plain(4));
      quad("metal", [ring[i][0], top, ring[i][1]], [a[0], top, a[1]], [b[0], top, b[1]], [ring[j][0], top, ring[j][1]], [[0, 0], [0, 0.1], [1, 0.1], [1, 0]]);
    }
  }
  {
    const inner = inset(BLOCK, BLOCK.map(() => T));
    flat("roof", inner, () => BLOCK_ROOF);
    for (let i = 0; i < BLOCK.length; i++) {
      const j = (i + 1) % BLOCK.length, a = inner[i], b = inner[j];
      wall("roof", b, a, BLOCK_ROOF, BLOCK_TOP, plain(4));
      quad("metal", [BLOCK[i][0], BLOCK_TOP, BLOCK[i][1]], [a[0], BLOCK_TOP, a[1]], [b[0], BLOCK_TOP, b[1]], [BLOCK[j][0], BLOCK_TOP, BLOCK[j][1]], [[0, 0], [0, 0.1], [1, 0.1], [1, 0]]);
    }
  }

  // ---- the brick bays, the north-east brick block ----
  const brickSide = W(swatch(SW_BRICK)), roofTop = "roof";
  box(BAY_A[0], BAY_A[1], BAY_A[2], BAY_A[3], 0, BAY, { top: roofTop, south: W(elev(0)), east: brickSide, west: brickSide });
  box(BAY_B[0], BAY_B[1], BAY_B[2], BAY_B[3], 0, BAY, { top: roofTop, south: W(elev(0)), east: brickSide, west: brickSide });
  {
    const [zA, zB, , xF] = BAY_C, xa = xE(zA), xb = xE(zB);                // Larrabee's bay: from the wall to its front
    wall("walls", [xF, zA], [xF, zB], 0, BAY, elev(1));
    wall("walls", [xa, zA], [xF, zA], 0, BAY, swatch(SW_BRICK));         // its south side
    wall("walls", [xF, zB], [xb, zB], 0, BAY, swatch(SW_BRICK));         // its north side
    flat(roofTop, [[xa, zA], [xF, zA], [xF, zB], [xb, zB]], () => BAY);
  }
  {
    const zn = (x) => zN(x) - 0.6;                                         // the block's north part, 0.6 m proud of the north face
    wall("walls", [68.9, zn(68.9)], [50, zn(50)], 0, BAY, elev(2));
    wall("walls", [50, zn(50)], [50, zN(50)], 0, BAY, swatch(SW_BRICK));
    flat(roofTop, [[50, zN(50)], [50, zn(50)], [68.9, zn(68.9)], [xE(-52.0) + 0.5, -52.0]], () => BAY);
    const xe = (z) => xE(z) + 0.5;                                        // its east part, 0.5 m proud of Larrabee's face
    wall("walls", [xe(-45.5), -45.5], [xe(-52.6), -52.6], 0, BAY, elev(1));
    wall("walls", [xE(-45.5), -45.5], [xe(-45.5), -45.5], 0, BAY, swatch(SW_BRICK));
    flat(roofTop, [[xE(-45.5), -45.5], [xe(-45.5), -45.5], [xe(-52.6), -52.6], [xE(-52.6), -52.6]], () => BAY);
  }

  // ---- the canopies, the pylon ----
  const canopyEnd = W(swatch(SW_CANOPY));
  box(-27, PYLON[0], 47.6, 52.6, CANOPY[0], CANOPY[1], { top: "metal", bottom: "metal", south: W(elev(0)), west: canopyEnd, east: canopyEnd });
  box(-57.4, -50.0, zS(-54), zS(-54) + 1.1, CANOPY[0], CANOPY[1], { top: "metal", bottom: "metal", south: W(elev(0)), west: canopyEnd, east: canopyEnd });
  {
    const x0 = xE(-41.75), x1 = x0 + 1.1;                                // Larrabee's garage entrance
    box(x0, x1, -45.5, -38, CANOPY[0], CANOPY[1], { top: "metal", bottom: "metal", east: W(elev(1)), north: canopyEnd, south: canopyEnd });
  }
  const redEnd = W(swatch(SW_RED));
  box(56.5, 72.6, zS(56.5), 50.5, RED_CANOPY[0], RED_CANOPY[1], { top: "metal", bottom: "metal", south: W(elev(0)), west: redEnd });
  box(xE(42), 72.6, 35.5, 50.5, RED_CANOPY[0], RED_CANOPY[1], { top: "metal", bottom: "metal", east: W(elev(1)), north: redEnd });
  {
    const [x0, x1, z0, z1] = PYLON, face = (p, v, t) => [(PYLON_X + t * PXM) / AW, vOf(3, v)];
    wall("walls", [x1, z1], [x1, z0], 0, PYLON_TOP, face);              // east face
    wall("walls", [x0, z0], [x0, z1], 0, PYLON_TOP, face);              // west face
    wall("walls", [x0, z1], [x1, z1], 0, PYLON_TOP, swatch(SW_WHITE));  // south end
    wall("walls", [x1, z0], [x0, z0], deck(z0), PYLON_TOP, swatch(SW_WHITE));   // north end, above the roof
    flat("metal", [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], () => PYLON_TOP);
  }

  // ---- the green roof and the rooftop units ----
  const bed = ([x0, x1, z0, z1], base) => {
    const y = (x, z) => base(z) + 0.15, ring = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    flat("green", ring, y, false, 8);
    for (let i = 0; i < 4; i++) {
      const a = ring[i], b = ring[(i + 1) % 4];
      quad("roof", [a[0], base(a[1]), a[1]], [b[0], base(b[1]), b[1]], [b[0], y(...b), b[1]], [a[0], y(...a), a[1]], [[0, 0], [1, 0], [1, 0.02], [0, 0.02]]);
    }
  };
  for (const b of BEDS) bed(b, deck);
  for (const b of BLOCK_BEDS) bed(b, () => BLOCK_ROOF);
  for (const [x0, x1, z0, z1, h] of UNITS) {
    const y0 = deck((z0 + z1) / 2) - 0.05, m = M();
    box(x0 - 0.6, x1 + 0.6, z0 - 0.6, z1 + 0.6, y0, y0 + 0.05 + h, { top: "metal", south: m, north: m, east: m, west: m });
  }

  // ======== one mesh a material ========
  let triangles = 0;
  for (const [k, q] of Object.entries(B)) {
    if (!q.p.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(q.p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(q.n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(q.t, 2));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, MAT[k]);
    mesh.name = `target-division-${k}`;
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    triangles += q.p.length / 9;
  }
  g.userData = { triangles, drawCalls: g.children.length };
  return g;
}
