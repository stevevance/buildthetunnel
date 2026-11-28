// Prairie Materials' Yard 32 ("Downtown"), the ready-mix concrete plant at 835 N. Peoria St., in the wedge between the
// Union Pacific spur, the North Branch of the Chicago River and the Halsted St viaduct, a short walk from the film's
// Chicago/Halsted stop. Prairie (founded in 1948, part of Votorantim Cimentos North America since 2008) mixes concrete here
// in two central-mix plants, up to 4,000 cubic yards a day. Sand and gravel come up the river by barge from Romeoville, and
// cement comes by truck. (It makes concrete, not cement.) For the cab-ride film
// (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js and soldier-field.js.
//
// In the film: the film's line north of Chicago/Halsted used to cut the corner of its curve onto the UP North and ran
// through this site's silos. Since November 26, 2026 it keeps to the Union Pacific spur past the site (OSM way 927810930;
// cab-ride.js, RR_STRIP), within a meter, which stays 6.4-15.8 m off the silos' faces. The film passes its line to the
// builder as `railway` (below), so that the yard's paving stops at the corridor's ballast and the fence, gate, trucks,
// piles and light poles keep off the track. The silos are where the LiDAR puts them (circle fits within 0.3 m), so don't
// move them.
//
// What it draws:
//   - The aggregate silos: a row of 11 round slip-formed concrete silos and a 14 x 9 m block at the west end, 119 m long,
//     24 m tall, with the dark corrugated conveyor gallery on top, its head house where the barge conveyor arrives, and at
//     the east end the "PRAIRIE / YARD 32" sign, a flag and floodlights, and a small railed balcony on the last silo.
//   - The batch tower (Plants 1 and 2): the base over the truck bay (two lanes under a concrete slab, block walls, chutes),
//     its corrugated upper floors (the control room's windows) and an open steel frame on its east side; the shaft, with a
//     flag and floodlights; and the wider head house at 34-42.5 m, open under its south end. Four steel silos beside it.
//   - The conveyors, as trusses on steel bents and trestles: A from the receiving hopper along the quay, then nearly flat
//     for 8 m past the corner and up 16.6 degrees to the silos' head house; B from the east head house to the transfer
//     house, then up 17.8 degrees to the tower, over A where they cross.
//   - The quay: its sheet-pile edge and tire fenders, the crane runway, the receiving hopper on its gantry, the green
//     lattice-boom crane (as it stood in the 2022 LiDAR), and two barges, one heaped with gravel and one under covers.
//   - The yard: dusty paving, the shed, the transfer house, the east head house, the billboard, three settling basins,
//     block-wall bins with sand and gravel, a pile of returned concrete, light poles, the chain-link fence and the gate at
//     the north end of Peoria St, and ten mixer trucks in Prairie's three liveries.
//
// Where the numbers come from:
//   - The company: Prairie Materials, "About" (prairie.com/about): founded in 1948 in Bridgeview, Illinois, and acquired by
//     Votorantim Cimentos North America in 2008. Prairie Materials, "Good to go" (prairie.com, December 27, 2024): Plant 1
//     and Plant 2 at Yard 32, "peak production reaches 4,000 yards per day", and the "large concrete silos that store all
//     aggregate". Industrial Scenery blog, "Trump's big pour" (2015): "dual central mix plants". Jack B. Siegel, "Ready Mix
//     Sommeliers" (Chicago Observational Ramblings, October 2018): sand and gravel "delivered daily on barges that begin
//     their journey in Romeoville"; the cement trucks' fill pipes, labeled St. Marys and Holcim ("S.T. Mary Is Holcim").
//   - Footprints and positions: OpenStreetMap, November 2026, through the Chicago Cityscape CLI: the site (way 1316242985),
//     the silo row (relation 19797879), the batch plant's base (210308819), the shed (210308573), the transfer house
//     (1317315842), the east head house (1317315837), the conveyors (1317315836, 1317315838), the crane runway (1317315834)
//     and crane (node 12192087213), the quay (1316815063), the basins (1317315839-41), the block walls (1317315843-51), the
//     billboard (node 6789688264, which finds it; its faces are placed from the LiDAR), the driveway at the gate
//     (1316242984) and, for the note above, the Union Pacific spur (927810930).
//   - Heights and shapes: Cook County's 2022 LiDAR (ISGS, the DSM less the DTM, on 2 m, 1 m, 0.5 m and 0.25 m grids and in
//     swaths along the conveyors; every sample returned a value). y = 0 is 180.0 m NAVD88, the yard's median grade. The
//     silos: 11 circles fitted to the 0.25-0.5 m grids, 9.45 m across at a 9.45-9.57 m pitch, roofs 24.0 m; the west block
//     14.0 x 9.0 m; the gallery 4.2 m wide, its roof 26.8 m; its head house 6.0 x 6.3 m, 29.3 m. The tower's roof 42.5 m
//     (its highest return 42.7 m, so nothing but a railing stands on it) on a 9.5 x 13.3 m rectangle turned 11.2 degrees;
//     its base 16.3 m. The steel silos 3.7 m across, their cone roofs' peaks 13.1-14.6 m (the median within 1.2 m of each
//     center; the highest returns, up to 16.9 m, are railings and clutter). Conveyor A's top (the highest return across
//     it every 2 m): 2.1-2.2 m for 8 m from the quay corner, then a straight 16.6-degree climb to 28.5 m, where it enters
//     the head house (96 m in plan from the corner). B's top from 8.2 m at the transfer house to 34.5 m at the tower (82 m
//     in plan); where B crosses over A, B is at 23.4 m and A at 18.4 m. The transfer box at the quay corner no higher than
//     2.1 m (the highest return within 3 m). The shed 6.0 m; the transfer house 8.7 m; the east head house 3.9 m. The
//     billboard: its two faces on lines fitted to the returns above 17 m (bearings 94 and 63 degrees, 14.5 m each, so a V
//     of standard 14.6 m bulletins), its top 22 m. The receiving hopper 7.6 m; the crane's boom tip 19 m; the block walls
//     3.7-4.0 m along the river and 3-4.5 m in the west yard. The barges 61.6 x 10.8 m and 67.5 x 13.2 m, loaded 2.5-3.7 m
//     above the water, where the LiDAR has them along the quay, each turned to the quay beside it with its inner side
//     0.5 m (the fenders) off the quay's line (OSM 1316815063). The east one is at the quay's 103.6 degrees; the west one,
//     which lies across the quay's bend, is at 110.4 degrees, the turn that keeps it closest to both legs.
//   - Appearance: "Prairie Material Yard 32 - Chicago, IL - September 2022.jpg" (AlphaBeta135, Wikimedia Commons, CC BY
//     4.0, from the Halsted St bridge): the unpainted tan-gray silos and their pour lines, the dark brown gallery and its
//     pale roof edge, the sign and flag at the east end, the last silo's small railed balcony (on its east-northeast side,
//     facing Halsted St, about 16 m up, placed from the camera's position; the photo shows no ladder cage on that end), the
//     tower's head house, rusty shaft, flag and floodlights, the open gray frame and dark cladding below, both conveyors'
//     trusses, the steel silos, the shed's dark walls. Siegel's photographs (2018, viewed for reference only): the truck
//     bay's concrete overhang and block walls ("PLANT-1 STAGE HERE"), the conveyors crossing ("Criss Cross"), the quay's
//     tire fenders and hopper gantry, the green crane, the barges' heaps and the hull number MSC 9902, the block-wall bins,
//     the trucks. USGS NAIP, August 2, 2019: the rust-brown roofs, the shed's pale roof, the barges' covers, the parked
//     trucks. Prairie's logo file (prairie.com, 2023): the current livery's green #00B23D and blue #0000BF.
//   Assumed: the silos' textures (pour lines, vents, patches) and the west block's rounded corners; the balcony's size
//   (2.4 x 1.1 m) and brackets, and how it is reached (no photo shows a ladder, so none is drawn); the gallery's low gable;
//   the tower's split between the shaft (7 x 10.5 m, 16.3-34 m) and the head house (34-42.5 m), and the open bay under its
//   south end (both from one sunset photo); the railing round the tower's roof; the band of control-room windows on the
//   base; the truck lanes' direction (along the base's long side) and widths; the open frame's size; the conveyors' depths
//   (2.6 m), the bents' spacing (~20 m) and the trestles; the transfer box at the quay corner (3.4 x 3.4 m); the hopper's
//   and the crane's shapes; the billboard's faces (a standard bulletin, 4.3 m tall) and what is on them; the shed's two
//   roll-up doors; the two light poles (their places and their 18 m height); the fence's line and the gate's design; the
//   second barge's hull number (MSC 9917); where the trucks, piles and barges are (they change day to day); the trucks'
//   size (10.7 x 2.55 x 3.95 m) and shapes. All colors are approximate (the color photos are at sunset). The river is drawn
//   at the film's level (WATER_Y, 2.44 m below the street) rather than its real 4.15 m below the yard, and the west yard's
//   1.5-2.5 m rise above the plant is left flat, since the film's ground is a plane.
//   Reference images: refs/prairie-material/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildPrairieMaterial, prairieMaterialSite } from "./prairie-material.js";
//   scene.add(buildPrairieMaterial({ THREE }));
//   // in the film, with its line near the site, [x, z] in the film's meters
//   scene.add(buildPrairieMaterial({ THREE, railway: { line: plan.map((p) => [p.x, p.y]), half: 15 } }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: PRAIRIE_MATERIAL_CENTRE } to have the plant round (0, 0, 0). It needs a browser (or another DOM
// with <canvas>): the facades are painted on canvas textures. { railway: { line, half = 15, clear = 3 } } keeps the model
// off a railway: `line` is its centerline, [[x, z], ...] in the same meters as `origin`, running on past the site. The
// yard's paving stops `half` meters from it (15 m, the ballast corridor that cab-ride.js cuts round its line, NORTH_A), and
// the fence, the gate, the trucks, the piles and the light poles keep `clear` meters (plus their own size) off it. The
// silos and the other buildings stay where they are, so the line must miss them. { riverCut: true } is for previews on a
// plain ground (tools/model-views.mjs): it draws the river beside the quay and cuts the ground over it so the barges show.
// Leave it off in the film, which cuts its own river.
export const PRAIRIE_MATERIAL_CENTRE = [-87.6490, 41.8975];
const FILM_ORIGIN = [-87.620063, 41.863968];
const WATER_Y = -2.44;                                              // the film's river, RIVER_DOWN below the street (cab-ride.js)

// ---- the plan, [lon, lat] (OpenStreetMap unless marked LiDAR) ----
// the site (way 1316242985; the closing node left off): the spur on the south-west, the quay on the north-east, Halsted St
const SITE = [[-87.6498147,41.8982836],[-87.6499130,41.8982126],[-87.6502589,41.8979628],[-87.6504942,41.8978035],[-87.6505237,41.8977277],
  [-87.6505593,41.8976361],[-87.6497877,41.8973638],[-87.6488563,41.8969820],[-87.6484832,41.8967710],[-87.6481767,41.8965459],
  [-87.6481543,41.8965463],[-87.6480660,41.8965477],[-87.6480053,41.8965823],[-87.6479916,41.8965901],[-87.6479460,41.8966161],
  [-87.6479480,41.8966752],[-87.6479485,41.8966895],[-87.6479545,41.8968620],[-87.6479550,41.8968771],[-87.6479622,41.8970851],
  [-87.6479627,41.8971000],[-87.6479699,41.8973093],[-87.6479696,41.8973225],[-87.6479384,41.8976224],[-87.6479376,41.8976515],
  [-87.6479607,41.8976509],[-87.6479672,41.8977700],[-87.6482637,41.8978270],[-87.6494263,41.8980364],[-87.6496642,41.8981588]];
// the aggregate silos' centers, west to east (LiDAR circle fits; 7-9 placed at the pitch), and the west end's block
const SILOS = [[-87.649261,41.897207],[-87.649160,41.897167],[-87.649061,41.897127],[-87.648959,41.897087],[-87.648857,41.897046],
  [-87.648755,41.897006],[-87.648653,41.896965],[-87.648551,41.896925],[-87.648449,41.896884],[-87.648349,41.896845],[-87.648250,41.896805]];
const SILO_BLOCK = [[-87.649440,41.897324],[-87.649291,41.897264],[-87.649342,41.897193],[-87.649491,41.897252]];   // (LiDAR)
const GALLERY = [[-87.649481,41.897294],[-87.648190,41.896781]];   // the gallery on top, end to end (LiDAR)
const SILO_HEAD = [[-87.648844,41.897073],[-87.648780,41.897048],[-87.648816,41.896998],[-87.648880,41.897023]];   // (LiDAR)
const SILO_R = 4.725, SILO_TOP = 24.0, GAL_EAVE = 26.3, GAL_RIDGE = 26.8, HEAD_TOP = 29.3;
// the batch tower: its head house's corners NW, NE, SE, SW (LiDAR) and the base under it (way 210308819)
const TOWER = [[-87.649076,41.897601],[-87.648963,41.897617],[-87.648932,41.897500],[-87.649046,41.897484]];
const TOWER_BASE = [[-87.649069,41.897433],[-87.649083,41.897487],[-87.649107,41.897483],[-87.649128,41.897568],[-87.649112,41.897571],
  [-87.649128,41.897630],[-87.648945,41.897656],[-87.648903,41.897493],[-87.648894,41.897458]];
const BASE_TOP = 16.3, SHAFT_TOP = 34.0, TOWER_TOP = 42.5;
// the steel silos beside it: [lon, lat, the cone roof's peak] (LiDAR: the median within 1.2 m of the center)
const STEEL_SILOS = [[-87.648864,41.897619,14.5],[-87.648805,41.897544,14.2],[-87.648762,41.897551,13.1],[-87.648696,41.897570,14.6]];
const SHED = [[-87.648262,41.896984],[-87.648806,41.897159],[-87.648731,41.897289],[-87.648187,41.897114]];
const TRANSFER = [[-87.648073,41.897022],[-87.648101,41.896938],[-87.648030,41.896925],[-87.648002,41.897008]];
const EAST_HEAD = [[-87.648171,41.896822],[-87.648106,41.896798],[-87.648071,41.896785],[-87.648123,41.896708],[-87.648222,41.896745],
  [-87.648209,41.896765],[-87.648188,41.896796]];
// the conveyors (their gallery tops from the LiDAR swaths). A's knee, 8 m along from the corner, is where it starts to climb
const CONV_A = { hopper: [-87.648858,41.897835], corner: [-87.648060,41.897704], knee: [-87.648123,41.897650], top: [-87.648819,41.897051] };
const A_FLAT = 2.2, A_TOP = 28.5;                                   // A's top at the knee, and where it enters the head house
const CONV_B = { east: [-87.648095,41.896834], transfer: [-87.648064,41.896932], start: [-87.648107,41.897014], tower: [-87.648875,41.897477] };
// the quay: the crane runway (its east part, short of the block wall), the hopper, the crane and its boom tip (2022)
const RUNWAY = [[-87.648006,41.897735],[-87.649027,41.897905],[-87.649283,41.897947],[-87.649408,41.897981],[-87.649491,41.898014]];
const HOPPER = [-87.648820,41.897864], CRANE = [-87.649027,41.897905], BOOM_TIP = [-87.649196,41.897927];
const QUAY = [[-87.6479672,41.8977700],[-87.6482637,41.8978270],[-87.6494263,41.8980364],[-87.6496642,41.8981588],[-87.6498147,41.8982836]];
// the barges: [lon, lat, bearing, length, beam, covered, hull number]. Sizes and places along the quay from the 2022 LiDAR;
// each turned to the quay beside it and moved out until its inner side is 0.5 m (the fenders) off the quay's line at its
// nearest. (The west one lies across the quay's 21-degree bend, so it takes the bearing between the two legs that keeps it
// closest to both, 110.4 degrees; the east one the quay's own 103.6.)
const BARGES = [
  [-87.649256, 41.898094, 110.4, 61.6, 10.8, true, "M S C        9 9 1 7"], [-87.648491, 41.897934, 103.6, 67.5, 13.2, false, "M S C        9 9 0 2"]];
const BASINS = [
  [[-87.648066,41.897550],[-87.648043,41.897653],[-87.648271,41.897687],[-87.648299,41.897583]],
  [[-87.649107,41.897802],[-87.649121,41.897764],[-87.649359,41.897798],[-87.649345,41.897839]],
  [[-87.649267,41.897827],[-87.649251,41.897885],[-87.649565,41.897938],[-87.649595,41.897881]]];
const WALLS = [   // [height, points]: the block walls (heights from the LiDAR)
  [3.8, [[-87.649595,41.897881],[-87.649565,41.897938],[-87.649549,41.897992],[-87.649664,41.898052],[-87.649719,41.898085],[-87.649790,41.898127],[-87.649913,41.898213],[-87.650259,41.897963]]],
  [3.5, [[-87.649970,41.897695],[-87.649765,41.897915],[-87.649813,41.897937],[-87.649719,41.898085]]],
  [3.2, [[-87.649813,41.897937],[-87.649910,41.897830],[-87.649974,41.897758]]],
  [1.6, [[-87.649910,41.897830],[-87.650021,41.897874]]], [1.6, [[-87.649519,41.897823],[-87.649506,41.897866]]],
  [1.6, [[-87.649107,41.897802],[-87.649098,41.897841],[-87.649009,41.897830]]],
  [1.6, [[-87.649359,41.897798],[-87.649345,41.897839],[-87.649506,41.897866]]], [1.6, [[-87.649506,41.897866],[-87.649595,41.897881]]]];
// the billboard: the V's apex and ends, on lines fitted to the LiDAR's returns above 17 m
const BILLBOARD = { apex: [-87.647986, 41.896782], ends: [[-87.648161, 41.896792], [-87.648143, 41.896723]], top: 22 };
const GATE = [-87.6497877, 41.8973638];                             // the site's corner at the driveway, north end of Peoria St
// the rest, assumed, in meters east and south of [-87.6492, 41.8974] (the research spec's frame)
const SPEC = [-87.6492, 41.8974], SPEC_KX = 82860.1;
const TRUCKS = [   // [x, z, bearing, livery]; the ones by the tower are placed from its frame below. (Any within `railway`'s
  // clearance of its line are left out)
  [-86.2, -37.9, 205, 0], [-81.7, -35.8, 205, 1], [-77.2, -33.7, 205, 0], [-72.7, -31.6, 205, 2],
  [62.0, -16.0, 340, 0], [67.5, -19.0, 340, 1], [-40.0, -18.0, 25, 0]];
const PILES = [   // [x, z, length, width, height, bearing, kind]: in the block-wall bins, and returned concrete by the basins
  [-57.0, -46.2, 18, 3.2, 2.4, 35, "gravel"], [-66.0, -63.0, 22, 12, 3.4, 40, "sand"], [-56.0, -78.0, 10, 7, 2.6, 40, "gravel"],
  [-21.0, -29.0, 13, 10, 3.0, 100, "rubble"]];
const POLES = [[-47, -31], [55, -32]];

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The ground OpenStreetMap's buildings and trees give way to: the site (it holds all five buildings the film draws there
// from OpenStreetMap) and the silo row's footprint with a meter round it (its south-west side reaches past the site's
// line), each a closed ring of local meters [x, z, x, z, ...]. (Fix the film's line before using them: see the header.)
export function prairieMaterialSite(origin = FILM_ORIGIN) {
  const L = local(origin), close = (r) => [...r, r[0], r[1]];
  const [g0, g1] = GALLERY.map(([lon, lat]) => L(lon, lat)), l = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]);
  const ux = (g1[0] - g0[0]) / l, uz = (g1[1] - g0[1]) / l, vx = -uz, vz = ux, w = SILO_R + 1;
  const silos = [[g0[0] - ux + vx * w, g0[1] - uz + vz * w], [g1[0] + ux + vx * w, g1[1] + uz + vz * w],
    [g1[0] + ux - vx * w, g1[1] + uz - vz * w], [g0[0] - ux - vx * w, g0[1] - uz - vz * w]];
  return [close(SITE.flatMap(([lon, lat]) => L(lon, lat))), close(silos.flat())];
}

export function buildPrairieMaterial({ THREE, origin = FILM_ORIGIN, riverCut = false, railway = null }) {
  const L = local(origin), [cx, cz] = L(...PRAIRIE_MATERIAL_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz); g.name = "prairie-material";
  const P = ([lon, lat]) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; };
  const S = (x, z) => P([SPEC[0] + x / SPEC_KX, SPEC[1] - z / 111070]);
  let seed = 32;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)
  const lerp = (a, b, t) => a + (b - a) * t;
  const col = (hex, s = 1) => { const c = new THREE.Color(hex); return [c.r * s, c.g * s, c.b * s]; };
  const gray = (s) => [s, s, s];
  const WHITE = gray(1);
  const unit = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l, l]; };

  // ---- the textures, each painted once on a canvas ----
  const canvas = (w, h, draw, repeat = true) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const speckle = (c, x, y, w, h, n, a, dark = "60,52,42", light = "255,250,238", size = 3) => {
    for (let i = 0; i < n; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? dark : light},${a * (0.5 + rnd())})`; c.fillRect(x + rnd() * w, y + rnd() * h, 1 + rnd() * size, 1 + rnd() * size * 0.6); }
  };
  const T = {};
  // the concrete silos: one silo's whole circumference (29.7 m) by its 24 m, twice over (u 0-0.5 and 0.5-1, two variants
  // the silos alternate between). Pour lines every 1.2 m, streaks from the top, vents, patches of pale paint over graffiti
  // at the foot
  T.concrete = canvas(1024, 512, (c, w, h) => {
    const PX = h / SILO_TOP;
    for (const x0 of [0, 512]) {
      c.fillStyle = "#bdb4a4"; c.fillRect(x0, 0, 512, h);
      for (let k = 0; k < 12; k++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "120,108,92" : "236,226,206"},0.07)`; c.fillRect(x0 + rnd() * 500, 0, 16 + rnd() * 60, h); }
      speckle(c, x0, 0, 512, h, 3000, 0.05, "70,62,50", "255,250,238", 8);
      for (let y = h - 1.2 * PX; y > 2; y -= 1.2 * PX) {             // the pour lines
        for (let x = x0; x < x0 + 512; x += 8) {
          if (rnd() < 0.08) continue;
          const yy = y + Math.sin((x + y) * 0.05) * 1.2;
          c.fillStyle = "rgba(92,82,66,0.30)"; c.fillRect(x, yy, 8, 1.4);
          c.fillStyle = "rgba(255,250,240,0.10)"; c.fillRect(x, yy + 1.4, 8, 1);
        }
      }
      for (let k = 0; k < 30; k++) {                                // streaks from the top and from the vents
        const x = x0 + rnd() * 510, y = rnd() < 0.6 ? 0 : rnd() * h * 0.7, len = 30 + rnd() * 260, gr = c.createLinearGradient(0, y, 0, y + len);
        gr.addColorStop(0, `rgba(${rnd() < 0.5 ? "138,125,107" : "120,104,84"},0.45)`); gr.addColorStop(1, "rgba(138,125,107,0)");
        c.fillStyle = gr; c.fillRect(x, y, 1 + rnd() * 4, len);
      }
      for (let k = 0; k < 5; k++) {                                 // small square vents and patches
        const x = x0 + 30 + rnd() * 450, y = 40 + rnd() * 380, s = 6 + rnd() * 6;
        c.fillStyle = rnd() < 0.5 ? "#6f685d" : "#cbc4b6"; c.fillRect(x, y, s, s);
      }
      for (let k = 0; k < 4; k++) {                                 // pale paint over graffiti, at the foot
        const x = x0 + rnd() * 470, pw = 18 + rnd() * 70, ph = 20 + rnd() * 34;
        c.fillStyle = rnd() < 0.5 ? "#d2cfc8" : "#c8c5be"; c.fillRect(x, h - 2 - ph, pw, ph);
      }
      const gr = c.createLinearGradient(0, h - 16, 0, h); gr.addColorStop(0, "rgba(90,80,65,0)"); gr.addColorStop(1, "rgba(90,80,65,0.4)");
      c.fillStyle = gr; c.fillRect(x0, h - 16, 512, 16);
      c.fillStyle = "rgba(255,255,250,0.10)"; c.fillRect(x0, 0, 512, 5);   // the roof slab's edge
    }
  });
  // weathered dark-brown corrugated steel, 6 x 6 m: vertical ribs, girt lines, rust streaks
  T.steel = canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#4d3d34"; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 4) { c.fillStyle = "rgba(255,232,210,0.07)"; c.fillRect(x, 0, 1.5, h); c.fillStyle = "rgba(0,0,0,0.16)"; c.fillRect(x + 2, 0, 1.5, h); }
    for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "20,12,8" : "120,90,70"},0.10)`; c.fillRect(rnd() * w, 0, 20 + rnd() * 60, h); }
    for (let k = 0; k < 40; k++) {
      const x = rnd() * w, y = rnd() * h * 0.8, len = 20 + rnd() * 120, gr = c.createLinearGradient(0, y, 0, y + len);
      gr.addColorStop(0, `rgba(${rnd() < 0.6 ? "120,74,48" : "150,96,60"},0.55)`); gr.addColorStop(1, "rgba(120,74,48,0)");
      c.fillStyle = gr; c.fillRect(x, y, 2 + rnd() * 6, len);
    }
    c.fillStyle = "rgba(0,0,0,0.20)"; c.fillRect(0, 0, w, 2); c.fillRect(0, 128, w, 2);
    c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, 0, 2, h);
  });
  // pale galvanized steel, 6 x 6 m: ribs every 0.19 m, mottling (tinted darker by vertex color for the transfer house)
  T.light = canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#e4e3de"; c.fillRect(0, 0, w, h);
    speckle(c, 0, 0, w, h, 1500, 0.05, "80,80,76", "255,255,255", 6);
    for (let x = 0; x < w; x += 8) { c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(x + 5, 0, 2, h); c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(x + 3, 0, 1, h); }
    for (let k = 0; k < 14; k++) { const x = rnd() * w, len = 30 + rnd() * 160, gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, "rgba(110,100,85,0.28)"); gr.addColorStop(1, "rgba(110,100,85,0)"); c.fillStyle = gr; c.fillRect(x, rnd() * 80, 2 + rnd() * 4, len); }
    c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(0, 0, w, 2);
  });
  // the yard: concrete paving under cement dust, 32 m square: joints every 4 m, wet patches, tire tracks (seamless)
  T.yard = canvas(512, 512, (c, w, h) => {
    c.fillStyle = "#d8d5cd"; c.fillRect(0, 0, w, h);
    speckle(c, 0, 0, w, h, 6000, 0.05, "90,86,78", "255,255,250", 5);
    const wrap = (f) => { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { c.save(); c.translate(ox, oy); f(); c.restore(); } };
    for (let k = 0; k < 9; k++) {
      const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 60, a = 0.12 + rnd() * 0.18;
      wrap(() => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(150,146,138,${a})`); gr.addColorStop(1, "rgba(150,146,138,0)"); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); });
    }
    c.lineCap = "round";
    for (let k = 0; k < 7; k++) {
      const x0 = rnd() * w, y0 = rnd() * h, ang = rnd() * Math.PI * 2, bend = (rnd() - 0.5) * 2, len = 150 + rnd() * 250;
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = ang + bend * t; pts.push([x0 + Math.cos(a) * len * t, y0 + Math.sin(a) * len * t, a]); }
      for (const off of [-15, 15]) wrap(() => {
        c.strokeStyle = "rgba(170,166,156,0.45)"; c.lineWidth = 6; c.beginPath();
        pts.forEach(([x, y, a], i) => { const px = x - Math.sin(a) * off, py = y + Math.cos(a) * off; if (i) c.lineTo(px, py); else c.moveTo(px, py); });
        c.stroke();
      });
    }
    c.fillStyle = "rgba(120,115,105,0.16)"; for (let k = 0; k < 8; k++) { c.fillRect(k * 64, 0, 1.5, h); c.fillRect(0, k * 64, w, 1.5); }
  });
  // the stacked concrete blocks ("Lego" blocks, 0.76 x 0.76 x 1.52 m): 3.04 m square, running bond
  T.blocks = canvas(256, 256, (c, w, h) => {
    const bh = h / 4, bw = w / 2;
    for (let r = 0; r < 4; r++) for (let k = -1; k < 3; k++) {
      const x = k * bw + (r % 2) * bw / 2, y = r * bh, s = 0.9 + rnd() * 0.14;
      c.fillStyle = `rgb(${188 * s | 0},${184 * s | 0},${176 * s | 0})`; c.fillRect(x, y, bw, bh);
      speckle(c, x, y, bw, bh, 120, 0.06, "70,66,60", "255,255,250", 4);
      c.fillStyle = "rgba(255,255,250,0.18)"; c.fillRect(x + 3, y + 3, bw - 6, 3);
      c.fillStyle = "rgba(40,38,34,0.55)"; c.fillRect(x, y, 3, bh); c.fillRect(x, y + bh - 3, bw, 3);
    }
    for (let k = 0; k < 8; k++) { const x = rnd() * w, len = 20 + rnd() * 90, gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, "rgba(90,86,76,0.3)"); gr.addColorStop(1, "rgba(90,86,76,0)"); c.fillStyle = gr; c.fillRect(x, rnd() * h, 3, len); }
  });
  // sand, gravel and broken concrete: a pale speckle, colored by the piles' vertex colors; 6 m square
  T.grain = canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#e6e5e2"; c.fillRect(0, 0, w, h);
    speckle(c, 0, 0, w, h, 9000, 0.12, "40,40,40", "255,255,255", 3);
  });
  // the steelwork, white on clear (tinted by vertex color), one kind a row: [top px, bottom px, px a bay]
  const ROWS = { truss: [0, 128, 256], fence: [128, 256, 256], frame: [256, 384, 128], boom: [384, 448, 64], rail: [448, 512, 128] };
  T.lattice = canvas(512, 512, (c, w) => {
    const row = (name, f) => { const [y0, y1, bay] = ROWS[name]; c.save(); c.beginPath(); c.rect(0, y0, w, y1 - y0); c.clip(); for (let x = 0; x < w; x += bay) { c.save(); c.translate(x, y0); f(bay, y1 - y0); c.restore(); } c.restore(); };
    const line = (x0, y0, x1, y1, lw) => { c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    c.strokeStyle = c.fillStyle = "#f2f2f0"; c.lineCap = "square";
    row("truss", (b, h) => {                                        // a Warren truss: chords, end posts, diagonals
      c.fillRect(0, 4, b, 10); c.fillRect(0, h - 14, b, 10); c.fillRect(0, 4, 6, h - 8); c.fillRect(b - 6, 4, 6, h - 8);
      line(4, h - 10, b / 2, 10, 8); line(b / 2, 10, b - 4, h - 10, 8); c.fillRect(b / 2 - 3, 4, 6, h - 8);
    });
    row("fence", (b, h) => {                                        // chain-link's frame: top rail, posts, bottom wire
      // (the mesh itself is drawn apart, see T.mesh: cut out by the alpha test it broke up into dark blotches far off)
      c.fillRect(0, 4, b, 6); c.fillRect(0, 0, 5, h); c.fillRect(b - 5, 0, 5, h); c.fillRect(0, h - 4, b, 2);
    });
    row("frame", (b, h) => {                                        // an X-braced steel frame
      c.fillRect(0, 0, 6, h); c.fillRect(b - 6, 0, 6, h); c.fillRect(0, 2, b, 7); c.fillRect(0, h - 9, b, 7);
      line(6, 8, b - 6, h - 8, 6); line(b - 6, 8, 6, h - 8, 6);
    });
    row("boom", (b, h) => {                                         // a lattice boom's side: chords and lacing
      c.fillRect(0, 2, b, 7); c.fillRect(0, h - 9, b, 7); line(0, h - 6, b / 2, 6, 4.5); line(b / 2, 6, b, h - 6, 4.5);
    });
    row("rail", (b, h) => {                                         // a handrail: top and middle rails, toe board, posts
      c.fillRect(0, 3, b, 6); c.fillRect(0, 26, b, 4); c.fillRect(0, h - 14, b, 10); c.fillRect(0, 3, 6, h - 6);
    });
  });
  // the chain-link mesh, 1 m square, 5 cm wire on a 12.5 cm diamond: drawn see-through (not cut out), so that its mipmaps
  // fade it far off to an even faint veil, about a fifth opaque, rather than blotches
  T.mesh = canvas(128, 128, (c, w, h) => {
    c.strokeStyle = "rgba(240,240,236,0.95)"; c.lineWidth = 1.6;
    for (let k = -h; k <= w + h; k += 16) {
      for (const [x0, x1] of [[k, k + h], [k + h, k]]) for (const ox of [-w, 0, w]) { c.beginPath(); c.moveTo(x0 + ox, 0); c.lineTo(x1 + ox, h); c.stroke(); }
    }
  });
  // signs, flags, the billboard, barge lettering and the drums' liveries, on one canvas: [x, y, w, h] px
  const AT = { bill: [0, 0, 1024, 300], sign: [0, 310, 250, 200], flag: [260, 310, 228, 120], msc: [[500, 310, 520, 64], [500, 380, 520, 64]],
    liv: [[0, 600, 340, 400], [342, 600, 340, 400], [684, 600, 340, 400]] };
  T.atlas = canvas(1024, 1024, (c) => {
    c.fillStyle = "#f4f4f0"; c.fillRect(0, 0, 1024, 1024);
    { // the billboard: a generic bulletin (white, a blue border, a sky-blue panel, a headline in blocks)
      const [x, y, w, h] = AT.bill;
      c.fillStyle = "#f5f5f2"; c.fillRect(x, y, w, h);
      const gr = c.createLinearGradient(x, y, x + 420, y + h); gr.addColorStop(0, "#5aa0d8"); gr.addColorStop(1, "#1d5fa8");
      c.fillStyle = gr; c.fillRect(x + 20, y + 20, 400, h - 40);
      c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.arc(x + 220, y + 150, 70, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#1d3f73"; for (const [yy, ww, hh] of [[60, 470, 46], [124, 380, 46], [204, 260, 26], [244, 300, 18]]) c.fillRect(x + 470, y + yy, ww, hh);
      c.fillStyle = "#e0532b"; c.fillRect(x + 470, y + 186, 120, 8);
      c.strokeStyle = "#1d4f9c"; c.lineWidth = 16; c.strokeRect(x + 8, y + 8, w - 16, h - 16);
    }
    { // the yard's sign: "PRAIRIE / YARD 32"
      const [x, y, w, h] = AT.sign;
      c.fillStyle = "#f1efe6"; c.fillRect(x, y, w, h);
      c.strokeStyle = "#8a8880"; c.lineWidth = 4; c.strokeRect(x + 3, y + 3, w - 6, h - 6);
      c.fillStyle = "#2a2a26"; c.textAlign = "center"; c.textBaseline = "middle";
      // (each line squeezed to the panel if the font found is wider, as it may be off a Mac)
      c.font = "bold 58px Georgia, 'Times New Roman', serif"; c.fillText("PRAIRIE", x + w / 2, y + 70, w - 24);
      c.font = "bold 46px Helvetica, Arial, sans-serif"; c.fillText("YARD 32", x + w / 2, y + 148, w - 24);
    }
    { // the flag
      const [x, y, w, h] = AT.flag;
      for (let k = 0; k < 13; k++) { c.fillStyle = k % 2 ? "#f4f4f0" : "#b22234"; c.fillRect(x, y + (k * h) / 13, w, h / 13 + 1); }
      c.fillStyle = "#3c3b6e"; c.fillRect(x, y, w * 0.4, (h * 7) / 13);
      c.fillStyle = "#f4f4f0"; for (let r = 0; r < 9; r++) for (let k = 0; k < (r % 2 ? 5 : 6); k++) c.fillRect(x + 5 + k * 15 + (r % 2) * 7.5, y + 4 + r * 7, 2.5, 2.5);
    }
    BARGES.forEach((bg, i) => { // each barge's coaming, with its hull number
      const [x, y, w, h] = AT.msc[i];
      c.fillStyle = "#7a2e2a"; c.fillRect(x, y, w, h);
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y + h - 8, w, 8);
      c.fillStyle = "#d3a640"; c.font = "bold 44px Helvetica, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(bg[6], x + w / 2, y + h / 2, w - 20);
    });
    // the drums: x along the drum, front to back; y round it from the top, so the right side's band is at a quarter and
    // the left's at three quarters (each drawn so it reads from its own side)
    const band = (r, frac, flipX, flipY, draw) => { const [x, y, w, h] = r; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x + w / 2, y + frac * h); c.scale(flipX ? -1 : 1, flipY ? -1 : 1); draw(); c.restore(); };
    const both = (r, draw) => { band(r, 0.25, true, false, draw); band(r, 0.75, false, true, draw); };
    const drum = (r) => {
      const [x, y, w, h] = r, gr = c.createLinearGradient(x, 0, x + w, 0);
      gr.addColorStop(0, "#dcdcd6"); gr.addColorStop(0.08, "#f4f4f0"); gr.addColorStop(0.9, "#f4f4f0"); gr.addColorStop(1, "#d4d4ce");
      c.fillStyle = gr; c.fillRect(x, y, w, h);
      c.fillStyle = "rgba(0,0,0,0.10)"; for (const f of [0.2, 0.45, 0.7]) c.fillRect(x + f * w, y, 2, h);   // the drum's welds
    };
    c.textBaseline = "middle"; c.textAlign = "left";
    // 1. the current livery (since about 2023): the green triangle, "prairie" in blue, "materials" in green
    drum(AT.liv[0]);
    both(AT.liv[0], () => {
      c.fillStyle = "#00B23D"; c.beginPath(); c.moveTo(-150, 40); c.lineTo(-112, -42); c.lineTo(-74, 40); c.closePath(); c.fill();
      c.strokeStyle = "#f4f4f0"; c.lineWidth = 6; c.beginPath(); c.moveTo(-128, 6); c.lineTo(-112, -24); c.moveTo(-138, 22); c.lineTo(-92, 22); c.stroke();
      c.fillStyle = "#0000BF"; c.font = "bold 62px Helvetica, Arial, sans-serif"; c.fillText("prairie", -62, -10);
      c.fillStyle = "#00B23D"; c.font = "bold 30px Helvetica, Arial, sans-serif"; c.fillText("materials", 10, 36);
    });
    // 2. the 2010s livery: "PRAIRIE" in orange-red italic capitals and the square P emblem
    drum(AT.liv[1]);
    both(AT.liv[1], () => {
      c.fillStyle = "#e0532b"; c.font = "italic bold 60px Helvetica, Arial, sans-serif"; c.fillText("PRAIRIE", -150, 0);
      c.fillStyle = "#1e7a3c"; c.fillRect(100, -30, 56, 56); c.fillStyle = "#e0532b"; c.fillRect(110, -20, 36, 36);
      c.fillStyle = "#f4f4f0"; c.font = "bold 34px Helvetica, Arial, sans-serif"; c.fillText("P", 117, 0);
    });
    // 3. the older livery: "PRAIRIE" in dark green serif over "MATERIAL" in red-orange
    drum(AT.liv[2]);
    both(AT.liv[2], () => {
      c.fillStyle = "#1e5a38"; c.font = "bold 58px Georgia, 'Times New Roman', serif"; c.fillText("PRAIRIE", -130, -20);
      c.fillStyle = "#d2492a"; c.font = "bold 34px Helvetica, Arial, sans-serif"; c.fillText("MATERIAL", -110, 30);
    });
  }, false);
  const atl = (r, u0 = 0, u1 = 1, v0 = 0, v1 = 1) => {             // a rectangle of the atlas, as uv (v up)
    const [x, y, w, h] = r, U = (u) => (x + 0.5 + u * (w - 1)) / 1024, Vv = (v) => 1 - (y + 0.5 + (1 - v) * (h - 1)) / 1024;
    return [[U(u0), Vv(v0)], [U(u1), Vv(v0)], [U(u1), Vv(v1)], [U(u0), Vv(v1)]];
  };

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, vertexColors: true, side: THREE.DoubleSide, ...o });
  const MAT = {
    plain: std({}),
    concrete: std({ map: T.concrete, roughness: 0.92 }),
    steel: std({ map: T.steel, roughness: 0.7, metalness: 0.15 }),
    light: std({ map: T.light, roughness: 0.55, metalness: 0.2 }),
    yard: std({ map: T.yard, roughness: 0.95 }),
    blocks: std({ map: T.blocks, roughness: 0.95 }),
    grain: std({ map: T.grain, roughness: 1 }),
    lattice: std({ map: T.lattice, alphaTest: 0.35, roughness: 0.7, metalness: 0.15, alphaToCoverage: true }),
    mesh: std({ map: T.mesh, transparent: true, depthWrite: false, roughness: 0.6, metalness: 0.2 }),
    atlas: std({ map: T.atlas, roughness: 0.6 }),
  };
  const C = {
    roof: col(0x7b5545), roofEdge: col(0xd9dde0), siloRoof: col(0xa9a294), shedRoof: col(0xc8c7c2), slab: col(0x9d9a93),
    ceil: col(0x3b3835), cmu: col(0xb8b5ae), dark: col(0x3d322c), steelDk: col(0x4a3a32), truss: col(0x5a3f30), frame: col(0xa3a6a5),
    fence: col(0xa9aba8), rail: col(0xc9a227), boom: col(0x3f6e4e), crane: col(0x48594c), glass: col(0x1d272c), lamp: col(0xe9e6d8),
    pile: col(0x5e4636), tire: col(0x1e1e1e), basin: col(0x9aa69c), barge: col(0x7a2e2a), cover: col(0xb9bcbc), river: col(0x5d8fc0),
    sand: col(0xcdb48a), gravel: col(0xc9c5bd), rubble: col(0xe4e2dc), cab: col(0x13483a), fender: col(0x9a9692), black: col(0x1c1c1c),
    chassis: col(0x2a2a2c), mech: col(0x3a3a3a), pole: col(0x8d9092), billBack: col(0x7d7f80),
  };

  // ---- the geometry, gathered by material into one mesh each (normals per vertex, so curved parts are smooth) ----
  const B = {};
  let WET = false;                                                  // the river side (drawn first when riverCut)
  const batch = (k) => { const key = WET && riverCut ? `${k}@wet` : k; return B[key] || (B[key] = { p: [], n: [], t: [], c: [], i: [] }); };
  const vert = (b, p, n, uv, c) => { b.p.push(p[0], p[1], p[2]); b.n.push(n[0], n[1], n[2]); b.t.push(uv[0], uv[1]); b.c.push(c[0], c[1], c[2]); return b.p.length / 3 - 1; };
  const face = (b, i0, i1, i2) => {                                // a triangle, wound to agree with its normals
    const p = b.p, n = b.n, a = (i, k) => p[i * 3 + k];
    const ux = a(i1, 0) - a(i0, 0), uy = a(i1, 1) - a(i0, 1), uz = a(i1, 2) - a(i0, 2), vx = a(i2, 0) - a(i0, 0), vy = a(i2, 1) - a(i0, 1), vz = a(i2, 2) - a(i0, 2);
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const d = nx * (n[i0 * 3] + n[i1 * 3] + n[i2 * 3]) + ny * (n[i0 * 3 + 1] + n[i1 * 3 + 1] + n[i2 * 3 + 1]) + nz * (n[i0 * 3 + 2] + n[i1 * 3 + 2] + n[i2 * 3 + 2]);
    if (d < 0) b.i.push(i0, i2, i1); else b.i.push(i0, i1, i2);
  };
  const norm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const isCol = (c) => typeof c[0] === "number";
  // a flat quad a-b-c-d (in order round it); uv per corner; one color or one per corner
  const quad = (k, a, b, c, d, uv = [[0, 0], [1, 0], [1, 1], [0, 1]], cl = WHITE) => {
    const bb = batch(k), n = norm3(cross(sub(c, a), sub(d, b))), o = [a, b, c, d].map((p, j) => vert(bb, p, n, uv[j], isCol(cl) ? cl : cl[j]));
    bb.i.push(o[0], o[1], o[2], o[0], o[2], o[3]);
  };
  // a flat polygon (pts [x, z]) at height y, its texture in meters / tile
  const flat = (k, pts, y, tile = 6, cl = WHITE, down = false) => {
    const bb = batch(k), tris = THREE.ShapeUtils.triangulateShape(pts.map(([x, z]) => new THREE.Vector2(x, z)), []);
    const o = pts.map(([x, z]) => vert(bb, [x, y, z], [0, down ? -1 : 1, 0], [x / tile, -z / tile], cl));
    tris.forEach(([a, b, c]) => face(bb, o[a], o[b], o[c]));
  };
  // walls along pts from y0 to y1 (texture u in meters / tw along them, v = y / th; c0 at the foot, c1 at the top)
  const walls = (k, pts, y0, y1, { closed = true, tw = 6, th = 6, u0 = 0, c0 = WHITE, c1 = c0, vOff = 0 } = {}) => {
    const q = closed ? [...pts, pts[0]] : pts;
    let acc = u0;
    for (let i = 0; i + 1 < q.length; i++) {
      const p = q[i], r = q[i + 1], l = Math.hypot(r[0] - p[0], r[1] - p[1]);
      const ua = acc / tw, ub = (acc + l) / tw, va = (y0 + vOff) / th, vb = (y1 + vOff) / th;
      quad(k, [p[0], y0, p[1]], [r[0], y0, r[1]], [r[0], y1, r[1]], [p[0], y1, p[1]], [[ua, va], [ub, va], [ub, vb], [ua, vb]], [c0, c0, c1, c1]);
      acc += l;
    }
  };
  // a box in plan: centered at (x, z), `len` along (ux, uz), `wid` across, from y0 to y1
  const corners = (x, z, ux, uz, len, wid) => {
    const vx = -uz, vz = ux, hl = len / 2, hw = wid / 2;
    return [[x - ux * hl - vx * hw, z - uz * hl - vz * hw], [x + ux * hl - vx * hw, z + uz * hl - vz * hw],
      [x + ux * hl + vx * hw, z + uz * hl + vz * hw], [x - ux * hl + vx * hw, z - uz * hl + vz * hw]];
  };
  const obox = (k, x, z, ux, uz, len, wid, y0, y1, { tw = 6, th = 6, c0 = WHITE, c1 = c0, topK = k, topC = c1, bot = null, top = true } = {}) => {
    const q = corners(x, z, ux, uz, len, wid);
    walls(k, q, y0, y1, { tw, th, c0, c1 });
    if (top) flat(topK, q, y1, tw, topC);
    if (bot) flat("plain", q, y0, tw, bot, true);
    return q;
  };
  const prism = (k, pts, y0, y1, o = {}) => { walls(k, pts, y0, y1, o); if (o.topK !== null) flat(o.topK || k, pts, y1, o.tw || 6, o.topC || o.c1 || WHITE); };
  // an upright cylinder (open), u from u0 to u1 once round from angle a0, v from v0 to v1; and a cone or frustum
  const cyl = (k, x, z, r, y0, y1, seg, { a0 = 0, u0 = 0, u1 = 1, v0 = 0, v1 = 1, c0 = WHITE, c1 = c0 } = {}) => {
    const bb = batch(k), lo = [], hi = [];
    for (let j = 0; j <= seg; j++) {
      const a = a0 + (j / seg) * Math.PI * 2, n = [Math.cos(a), 0, Math.sin(a)], u = lerp(u0, u1, j / seg);
      lo.push(vert(bb, [x + n[0] * r, y0, z + n[2] * r], n, [u, v0], c0)); hi.push(vert(bb, [x + n[0] * r, y1, z + n[2] * r], n, [u, v1], c1));
    }
    for (let j = 0; j < seg; j++) { face(bb, lo[j], lo[j + 1], hi[j + 1]); face(bb, lo[j], hi[j + 1], hi[j]); }
  };
  const frustum = (k, x, z, r0, y0, r1, y1, seg, cl = WHITE, tile = 6) => {
    const bb = batch(k), lo = [], hi = [], h = y1 - y0;
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2, n = norm3([Math.cos(a) * h, r0 - r1, Math.sin(a) * h]);
      lo.push(vert(bb, [x + Math.cos(a) * r0, y0, z + Math.sin(a) * r0], n, [(j / seg) * 2 * Math.PI * r0 / tile, 0], cl));
      hi.push(vert(bb, [x + Math.cos(a) * r1, y1, z + Math.sin(a) * r1], n, [(j / seg) * 2 * Math.PI * r0 / tile, Math.hypot(h, r0 - r1) / tile], cl));
    }
    for (let j = 0; j < seg; j++) { face(bb, lo[j], lo[j + 1], hi[j + 1]); if (r1 > 0) face(bb, lo[j], hi[j + 1], hi[j]); }
  };
  const disk = (k, x, z, r, y, seg, cl = WHITE, down = false) => {
    const pts = []; for (let j = 0; j < seg; j++) { const a = (j / seg) * Math.PI * 2; pts.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); }
    flat(k, pts, y, 6, cl, down);
  };
  // a beam from a to b ([x, y, z]), w x h in section (h in the vertical plane through it)
  const beam = (k, a, b, w, h = w, cl = WHITE) => {
    const d = norm3(sub(b, a)), ref = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0], s = norm3(cross(d, ref)), u = cross(s, d);
    const off = (p, i, j) => [p[0] + s[0] * i * w / 2 + u[0] * j * h / 2, p[1] + s[1] * i * w / 2 + u[1] * j * h / 2, p[2] + s[2] * i * w / 2 + u[2] * j * h / 2];
    const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let q = 0; q < 4; q++) { const [i0, j0] = ring[q], [i1, j1] = ring[(q + 1) % 4]; quad(k, off(a, i0, j0), off(a, i1, j1), off(b, i1, j1), off(b, i0, j0), undefined, cl); }
    quad(k, off(b, -1, -1), off(b, 1, -1), off(b, 1, 1), off(b, -1, 1), undefined, cl);
  };
  const post = (k, x, z, y0, y1, w, cl) => obox(k, x, z, 1, 0, w, w, y0, y1, { c0: cl });
  // a lattice panel a-b-c-d (a-b along the bottom, `len` meters long), its row of the steelwork canvas, `bay` meters a bay
  const lat = (row, a, b, c, d, len, bay, cl, u0 = 0) => {
    const [y0, y1, px] = ROWS[row], ua = (u0 / bay) * (px / 512), ub = ((u0 + len) / bay) * (px / 512), vb = 1 - (y1 - 1) / 512, vt = 1 - (y0 + 1) / 512;
    quad("lattice", a, b, c, d, [[ua, vb], [ub, vb], [ub, vt], [ua, vt]], cl);
  };
  // a face hung on a wall: centered at (x, z) facing (nx, nz), w wide, from y0 to y1, the atlas's rectangle r
  const sheet = (k, x, z, nx, nz, w, y0, y1, uv, cl = WHITE) => {
    const rx = nz, rz = -nx;                                       // the viewer's right: up x n
    quad(k, [x - rx * w / 2, y0, z - rz * w / 2], [x + rx * w / 2, y0, z + rz * w / 2], [x + rx * w / 2, y1, z + rz * w / 2], [x - rx * w / 2, y1, z - rz * w / 2], uv, cl);
  };
  const inside = (x, z, poly) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
    }
    return hit;
  };
  const segDist = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z); };
  const outward = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a < 0 ? [...pts].reverse() : pts; };

  // ---- the railway to keep off, if one is given (see the header): its segments near the site, in the group's meters ----
  const rail = railway && railway.line && railway.line.length > 1 ? (() => {
    const pts = railway.line.map(([x, z]) => [x - cx, z - cz]), segs = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (l > 1e-6 && Math.min(Math.hypot(...a), Math.hypot(...b)) < 400 + l) segs.push([a, (b[0] - a[0]) / l, (b[1] - a[1]) / l, l]);
    }
    return segs.length ? { segs, half: railway.half ?? 15, clear: railway.clear ?? 3 } : null;
  })() : null;
  // the nearest segment to (x, z): the distance to it, and the signed distance from its line (+ to its right, looking along it)
  const nearRail = (x, z) => {
    let best = null;
    for (const [a, ux_, uz_, l] of rail.segs) {
      const s = Math.max(0, Math.min(l, (x - a[0]) * ux_ + (z - a[1]) * uz_)), d = Math.hypot(a[0] + ux_ * s - x, a[1] + uz_ * s - z);
      if (!best || d < best.d) best = { d, a, ux: ux_, uz: uz_, t: -(x - a[0]) * uz_ + (z - a[1]) * ux_ };
    }
    return best;
  };
  const offRail = (x, z, m = 0) => !rail || nearRail(x, z).d > rail.clear + m;
  // the part of a polygon ([[x, z], ...]) where f(p) >= 0, for a linear f (Sutherland-Hodgman, one edge)
  const clipHalf = (poly, f) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out.filter((p, i) => { const q = out[(i + 1) % out.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-4; });
  };

  // ======== the yard: paving over the whole site, or, beside a railway, up to its ballast ========
  const site = SITE.map(P);
  if (!rail) flat("yard", site, 0.06, 32, gray(0.8));
  else {
    // in 10 m squares: each square's part of the site, less the part within `half` of the line (cut on the line of its
    // nearest segment, which over 10 m is as good as the curve)
    const G = 10, xs = site.map((p) => p[0]), zs = site.map((p) => p[1]);
    for (let x = Math.min(...xs); x < Math.max(...xs); x += G) for (let z = Math.min(...zs); z < Math.max(...zs); z += G) {
      let piece = site;
      for (const f of [(p) => p[0] - x, (p) => x + G - p[0], (p) => p[1] - z, (p) => z + G - p[1]]) { piece = clipHalf(piece, f); if (piece.length < 3) break; }
      if (piece.length < 3) continue;
      const nr = nearRail(x + G / 2, z + G / 2);
      if (nr.d < rail.half - G) continue;
      if (nr.d < rail.half + G) {
        const sg = nr.t >= 0 ? 1 : -1;
        piece = clipHalf(piece, (p) => sg * (-(p[0] - nr.a[0]) * nr.uz + (p[1] - nr.a[1]) * nr.ux) - rail.half);
        if (piece.length < 3) continue;
      }
      flat("yard", piece, 0.06, 32, gray(0.8));
    }
  }

  // ======== the aggregate silos, the west block and the gallery on top ========
  const [g0, g1] = GALLERY.map(P), [ux, uz, galLen] = unit(g0, g1), vx = -uz, vz = ux;   // u along the row (ESE), v across (SSW)
  const silos = SILOS.map(P);
  silos.forEach(([x, z], i) => {
    const a0 = rnd() * Math.PI * 2, u0 = (i % 2) * 0.5;               // (a random turn, and every other one the second variant)
    cyl("concrete", x, z, SILO_R, 0, SILO_TOP, 28, { a0, u0, u1: u0 + 0.5, c0: gray(0.74), c1: gray(0.88) });
    disk("plain", x, z, SILO_R, SILO_TOP, 28, C.siloRoof);
  });
  { // the east end's silo: a small railed steel balcony 16 m up on its east-northeast side, toward Halsted St (2022 photo)
    const [x, z] = silos[silos.length - 1], br = (65 * Math.PI) / 180, rx = Math.sin(br), rz = -Math.cos(br), tx = -rz, tz = rx;
    const Y = 16.0, dep = 1.1, wid = 2.4, o = (a, b) => [x + rx * (SILO_R - 0.1 + b) + tx * a, z + rz * (SILO_R - 0.1 + b) + tz * a];
    const [fx, fz] = o(0, dep / 2);
    obox("plain", fx, fz, tx, tz, wid, dep, Y - 0.12, Y, { c0: col(0x4a4844), topC: col(0x5a5854) });   // its grating
    const rl = [o(-wid / 2, 0.05), o(-wid / 2, dep), o(wid / 2, dep), o(wid / 2, 0.05)];
    for (let k = 0; k < 3; k++) {
      const p = rl[k], q = rl[k + 1], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      lat("rail", [p[0], Y, p[1]], [q[0], Y, q[1]], [q[0], Y + 1.05, q[1]], [p[0], Y + 1.05, p[1]], l, Math.min(1.2, l), C.steelDk);
    }
    for (const a of [-wid / 2 + 0.2, wid / 2 - 0.2]) {                // two brackets under it, back to the wall
      const p = o(a, dep - 0.1), q = o(a, 0);
      beam("plain", [q[0], Y - 1.1, q[1]], [p[0], Y - 0.12, p[1]], 0.08, 0.08, C.steelDk);
    }
  }
  { // the west block: 14 x 9 m with rounded corners, as tall as the silos
    const q = SILO_BLOCK.map(P), bx = q.reduce((s, p) => s + p[0], 0) / 4, bz = q.reduce((s, p) => s + p[1], 0) / 4;
    const pts = [], hl = 7.0, hw = 4.5, r = 2.2;
    for (const [sa, sb, a0] of [[1, 1, 0], [-1, 1, 0.5], [-1, -1, 1], [1, -1, 1.5]]) for (let k = 0; k <= 4; k++) {
      const a = (a0 + k / 8) * Math.PI, la = sa * (hl - r) + Math.cos(a) * r, lb = sb * (hw - r) + Math.sin(a) * r;
      pts.push([bx + ux * la + vx * lb, bz + uz * la + vz * lb]);
    }
    let per = 0; pts.forEach((p, i) => { const n = pts[(i + 1) % pts.length]; per += Math.hypot(n[0] - p[0], n[1] - p[1]); });
    walls("concrete", pts, 0, SILO_TOP, { tw: per * 2, th: SILO_TOP, c0: gray(0.74), c1: gray(0.88) });
    flat("plain", pts, SILO_TOP, 6, C.siloRoof);
  }
  { // the gallery: corrugated walls, a low gable roof (rust brown, its edges catching the light), gable ends
    const hw = 2.1, ov = 0.25, at = (s, t) => [g0[0] + ux * s + vx * t, g0[1] + uz * s + vz * t];
    walls("steel", [at(0, -hw), at(galLen, -hw), at(galLen, hw), at(0, hw)], SILO_TOP, GAL_EAVE, { c0: gray(0.85), c1: gray(1) });
    flat("plain", [at(0, -hw), at(galLen, -hw), at(galLen, hw), at(0, hw)], SILO_TOP - 0.02, 6, C.steelDk, true);   // its floor, seen between the silos
    for (const sg of [-1, 1]) {
      const e0 = at(-ov, sg * (hw + ov)), e1 = at(galLen + ov, sg * (hw + ov)), r0 = at(-ov, 0), r1 = at(galLen + ov, 0);
      quad("plain", [e0[0], GAL_EAVE - 0.05, e0[1]], [e1[0], GAL_EAVE - 0.05, e1[1]], [r1[0], GAL_RIDGE, r1[1]], [r0[0], GAL_RIDGE, r0[1]], undefined, C.roof);
      beam("plain", [e0[0], GAL_EAVE - 0.1, e0[1]], [e1[0], GAL_EAVE - 0.1, e1[1]], 0.16, 0.16, C.roofEdge);
    }
    for (const s of [0, galLen]) { const a = at(s, -hw), b = at(s, hw), m = at(s, 0); quad("steel", [a[0], GAL_EAVE, a[1]], [b[0], GAL_EAVE, b[1]], [m[0], GAL_RIDGE, m[1]], [m[0], GAL_RIDGE, m[1]], [[0, 0], [0.7, 0], [0.35, 0.1], [0.35, 0.1]]); }
    // the head house where conveyor A arrives
    prism("steel", SILO_HEAD.map(P), SILO_TOP, HEAD_TOP, { c0: gray(0.85), topK: "plain", topC: C.roof });
    // the east end: the sign facing Halsted St on two posts, floodlights, the flagpole behind with its flag
    const e = at(galLen + 0.35, 0);
    for (const t of [-0.9, 0.9]) post("plain", e[0] + vx * t, e[1] + vz * t, GAL_EAVE - 0.4, 29.0, 0.12, C.steelDk);
    sheet("atlas", e[0] + ux * 0.08, e[1] + uz * 0.08, ux, uz, 2.5, 27.0, 29.0, atl(AT.sign));
    for (const t of [-1.8, 1.8]) {                                  // (below the sign's corners, aimed up at it)
      const l = at(galLen + 0.7, t);
      beam("plain", [e[0] + vx * t * 0.6, 26.2, e[1] + vz * t * 0.6], [l[0], 26.3, l[1]], 0.08, 0.08, C.steelDk);
      obox("plain", l[0], l[1], ux, uz, 0.35, 0.45, 26.25, 26.6, { c0: C.lamp });
    }
    const fp = at(galLen - 1.4, 0.3);
    beam("plain", [fp[0], GAL_RIDGE, fp[1]], [fp[0], 33.0, fp[1]], 0.1, 0.1, C.pole);
    const fd = [vx * 0.8 + ux * 0.6, vz * 0.8 + uz * 0.6], fl = Math.hypot(...fd), fx = fd[0] / fl, fz = fd[1] / fl;
    quad("atlas", [fp[0], 31.7, fp[1]], [fp[0] + fx * 2.1, 31.75, fp[1] + fz * 2.1], [fp[0] + fx * 2.1, 32.85, fp[1] + fz * 2.1], [fp[0], 32.9, fp[1]], atl(AT.flag));
  }

  // ======== the batch tower ========
  const tw = TOWER.map(P), hc = [tw.reduce((s, p) => s + p[0], 0) / 4, tw.reduce((s, p) => s + p[1], 0) / 4];
  const [ax, az, wa] = unit(tw[0], tw[1]), [bx, bz, wb] = unit(tw[0], tw[3]);   // a: along its north side (ENE); b: SSE
  const Tf = (a, b) => [hc[0] + ax * a + bx * b, hc[1] + az * a + bz * b];
  const tbox = (k, a0, a1, b0, b1, y0, y1, o) => { const [x, z] = Tf((a0 + a1) / 2, (b0 + b1) / 2); return obox(k, x, z, ax, az, a1 - a0, b1 - b0, y0, y1, o); };
  const base = outward(TOWER_BASE.map(P));
  let aMin = Infinity, aMax = -Infinity, bMin = Infinity, bMax = -Infinity;
  base.forEach(([x, z]) => { const a = (x - hc[0]) * ax + (z - hc[1]) * az, b = (x - hc[0]) * bx + (z - hc[1]) * bz; aMin = Math.min(aMin, a); aMax = Math.max(aMax, a); bMin = Math.min(bMin, b); bMax = Math.max(bMax, b); });
  const SLAB0 = 4.8, SLAB1 = 5.4;
  const laneW = [aMin + 2.3, -0.4], laneE = [1.0, aMax - 0.5];       // the two truck lanes, along b (assumed)
  {
    // the truck bay: block walls either side and between the lanes, the slab over it (overhanging the lanes' ends)
    for (const [a0, a1] of [[aMin + 1.8, laneW[0]], [laneW[1], laneE[0]], [laneE[1], aMax]]) tbox("plain", a0, a1, bMin + 0.6, bMax - 0.6, 0, SLAB0, { c0: col(0xa9a69f), c1: C.cmu, topC: C.ceil });
    tbox("plain", aMin, aMax, bMin - 1.2, bMax + 1.2, SLAB0, SLAB1, { c0: C.slab, bot: C.ceil });
    for (const [a0, a1] of [laneW, laneE]) {                       // over each lane: a chute and pipes
      const [x, z] = Tf((a0 + a1) / 2, 0);
      frustum("plain", x, z, 0.9, SLAB0, 0.3, SLAB0 - 1.1, 10, col(0x6f6c66));
      for (const b of [-5, 5]) { const [px, pz] = Tf(a0 + 0.4, b); post("plain", px, pz, 0, SLAB0, 0.25, col(0x8c8a84)); }
    }
    // the clad floors above, with a row of windows (the control room: assumed), and its roof
    prism("steel", base, SLAB1, BASE_TOP, { c0: gray(0.92), c1: gray(1.05), topK: "plain", topC: C.roof });
    base.forEach((p, i) => {
      const q = base[(i + 1) % base.length], [ex, ez, l] = unit(p, q);
      if (l < 8) return;
      const nx = ez, nz = -ex;
      for (const f of [0.3, 0.43, 0.57, 0.7]) sheet("plain", p[0] + ex * l * f + nx * 0.08, p[1] + ez * l * f + nz * 0.08, nx, nz, l * 0.1, 6.4, 7.7, undefined, C.glass);
    });
    // the open steel frame on the east side (light gray, from the 2022 photo; its size assumed), floors every 4 m
    const fa0 = aMax, fa1 = aMax + 3.5, fb0 = (bMin + bMax) / 2, fb1 = bMax, FH = 20;
    const fc = [Tf(fa0, fb0), Tf(fa1, fb0), Tf(fa1, fb1), Tf(fa0, fb1)];
    for (let y = 0; y < FH; y += 4) {
      for (let i = 0; i < 3; i++) {
        const p = fc[i], q = fc[i + 1], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
        lat("frame", [p[0], y, p[1]], [q[0], y, q[1]], [q[0], y + 4, q[1]], [p[0], y + 4, p[1]], l, Math.min(4, l / Math.round(l / 4)), C.frame);
      }
      if (y) tbox("plain", fa0, fa1, fb0, fb1, y - 0.12, y, { c0: col(0x8f918f) });
    }
    for (const p of fc) post("plain", p[0], p[1], 0, FH, 0.3, C.frame);
  }
  { // the shaft (rusty corrugated, the flag and floodlights on its east face) and the head house, open under its south end
    tbox("steel", -3.5, 3.5, -5.25, 5.25, BASE_TOP, SHAFT_TOP, { c0: gray(0.95), c1: gray(1.05), top: false });
    const [fx, fz] = Tf(3.5 + 0.08, 0);
    sheet("atlas", fx, fz, ax, az, 2.8, 30.6, 32.2, atl(AT.flag));
    for (const b of [-0.8, 0.8]) { const [lx, lz] = Tf(3.85, b); obox("plain", lx, lz, ax, az, 0.5, 0.6, 29.0, 29.5, { c0: C.lamp }); }
    const hb0 = -wb / 2, hb1 = wb / 2, ha = wa / 2, porch = 3.0;
    tbox("steel", -ha, ha, hb0, hb1 - porch, SHAFT_TOP, TOWER_TOP, { c0: gray(0.9), c1: gray(1.05), topK: "plain", topC: C.roof, bot: C.ceil });
    tbox("steel", -ha, ha, hb1 - porch, hb1, SHAFT_TOP + 3.0, TOWER_TOP, { c0: gray(0.9), c1: gray(1.05), topK: "plain", topC: C.roof, bot: C.ceil });
    for (const a of [-ha + 0.2, ha - 0.2]) { const [px, pz] = Tf(a, hb1 - 0.2); post("plain", px, pz, SHAFT_TOP, SHAFT_TOP + 3.0, 0.25, C.steelDk); }
    { const [px, pz] = Tf(-ha + 0.2, hb1 - porch); post("plain", px, pz, SHAFT_TOP, SHAFT_TOP + 3.0, 0.25, C.steelDk); }
    tbox("plain", -ha + 0.2, ha - 0.2, hb1 - porch, hb1 - 0.2, SHAFT_TOP - 0.1, SHAFT_TOP + 0.1, { c0: col(0x5a514a) });   // its floor
    // a railing round the head house's roof (assumed; nothing else stands on it: the LiDAR's highest return is 42.7 m)
    const rc = [Tf(-ha, hb0), Tf(ha, hb0), Tf(ha, hb1), Tf(-ha, hb1)];
    rc.forEach((p, i) => { const q = rc[(i + 1) % 4], l = Math.hypot(q[0] - p[0], q[1] - p[1]); lat("rail", [p[0], TOWER_TOP, p[1]], [q[0], TOWER_TOP, q[1]], [q[0], TOWER_TOP + 1.1, q[1]], [p[0], TOWER_TOP + 1.1, p[1]], l, 2, C.steelDk); });
  }
  // the steel silos: cylinders, cone roofs (their peaks at `top`), a railing round each top, a fill pipe down the side
  STEEL_SILOS.forEach(([lon, lat_, top], i) => {
    const [x, z] = P([lon, lat_]), r = 1.85, hc_ = top - 0.75;
    cyl("light", x, z, r, 0, hc_, 24, { u0: i * 0.3, u1: i * 0.3 + (2 * Math.PI * r) / 6, v1: hc_ / 6, c0: gray(0.82), c1: gray(0.98) });
    frustum("light", x, z, r, hc_, 0.35, hc_ + 0.75, 24, gray(0.95));
    disk("plain", x, z, 0.35, hc_ + 0.75, 8, col(0xb8b7b1));
    for (let j = 0; j < 8; j++) {
      const a0 = (j / 8) * Math.PI * 2, a1 = ((j + 1) / 8) * Math.PI * 2, p = [x + Math.cos(a0) * r, z + Math.sin(a0) * r], q = [x + Math.cos(a1) * r, z + Math.sin(a1) * r];
      lat("rail", [p[0], hc_, p[1]], [q[0], hc_, q[1]], [q[0], hc_ + 1.1, q[1]], [p[0], hc_ + 1.1, p[1]], 2 * r * Math.sin(Math.PI / 8), 1.4, col(0x9c9b94), j * 1.4);
    }
    const pa = i * 1.7;
    beam("plain", [x + Math.cos(pa) * (r + 0.15), 1.0, z + Math.sin(pa) * (r + 0.15)], [x + Math.cos(pa) * (r + 0.15), hc_ + 0.4, z + Math.sin(pa) * (r + 0.15)], 0.16, 0.16, col(0xb7b4ad));
  });

  // ======== the conveyors ========
  const galleries = [];                                             // [p0, p1, top0, top1, width, depth], for the bents
  // a gallery from p0 to p1 ([x, z]), its top rising from t0 to t1, w wide and dep deep: "A" (siding behind a truss, a roof),
  // "B" (an open truss, a grated floor, a roof hood), "box" (a low covered belt)
  const gallery = (p0, p1, t0, t1, w, dep, kind) => {
    const [gx, gz, len] = unit(p0, p1), px = -gz, pz = gx, k3 = Math.hypot(len, t1 - t0) / len;
    galleries.push([p0, p1, t0, t1, w, dep]);
    const n = Math.max(1, Math.ceil(len / 6));
    for (let i = 0; i < n; i++) {
      const s0 = (i / n) * len, s1 = ((i + 1) / n) * len, A = [p0[0] + gx * s0, p0[1] + gz * s0], Bp = [p0[0] + gx * s1, p0[1] + gz * s1];
      const ya = lerp(t0, t1, s0 / len), yb = lerp(t0, t1, s1 / len), da = Math.min(dep, ya - 0.3), db = Math.min(dep, yb - 0.3);
      const side = (t) => [[A[0] + px * t, ya - da, A[1] + pz * t], [Bp[0] + px * t, yb - db, Bp[1] + pz * t], [Bp[0] + px * t, yb, Bp[1] + pz * t], [A[0] + px * t, ya, A[1] + pz * t]];
      for (const sg of [-1, 1]) {
        if (kind !== "box") { const q = side(sg * w / 2); lat("truss", ...q, (s1 - s0) * k3, 3, C.truss, s0 * k3); }
        if (kind !== "B") { const q = side(sg * (w / 2 - (kind === "A" ? 0.12 : 0))); quad("steel", ...q, [[s0 * k3 / 6, 0], [s1 * k3 / 6, 0], [s1 * k3 / 6, dep / 6], [s0 * k3 / 6, dep / 6]], [gray(0.8), gray(0.8), gray(0.95), gray(0.95)]); }
      }
      const ro = w / 2 + (kind === "B" ? 0.1 : 0.2);
      quad("plain", [A[0] - px * ro, ya + 0.04, A[1] - pz * ro], [Bp[0] - px * ro, yb + 0.04, Bp[1] - pz * ro], [Bp[0] + px * ro, yb + 0.04, Bp[1] + pz * ro], [A[0] + px * ro, ya + 0.04, A[1] + pz * ro], undefined, kind === "B" ? C.dark : C.roof);
      quad("plain", [A[0] - px * w / 2, ya - da, A[1] - pz * w / 2], [Bp[0] - px * w / 2, yb - db, Bp[1] - pz * w / 2], [Bp[0] + px * w / 2, yb - db, Bp[1] + pz * w / 2], [A[0] + px * w / 2, ya - da, A[1] + pz * w / 2], undefined, C.steelDk);
      if (kind === "B") for (const sg of [-1, 1]) {
        const q = side(sg * (w / 2 - 0.05)), f = side(sg * (w / 2 + 0.08));
        lat("rail", q[0], q[1], [q[1][0], q[1][1] + 1.1, q[1][2]], [q[0][0], q[0][1] + 1.1, q[0][2]], (s1 - s0) * k3, 2, C.rail, s0 * k3);
        // the hood's deep fascia over the belt and walkway (dark corrugated)
        quad("steel", [f[3][0], ya - 0.9, f[3][2]], [f[2][0], yb - 0.9, f[2][2]], f[2], f[3], [[s0 * k3 / 6, 0], [s1 * k3 / 6, 0], [s1 * k3 / 6, 0.15], [s0 * k3 / 6, 0.15]], gray(0.8));
      }
    }
  };
  // A: the quay belt from the hopper to the corner, a low transfer box there (assumed; no higher than the LiDAR's 2.1 m),
  // then the incline to the silos' head house: nearly flat for 8 m to the knee, then a straight climb into the head house
  const aHop = P(CONV_A.hopper), aCor = P(CONV_A.corner), aKnee = P(CONV_A.knee), aTop = P(CONV_A.top);
  gallery(aHop, aCor, 1.0, 1.6, 1.4, 0.8, "box");
  { const [qx, qz] = unit(aHop, aCor); obox("light", aCor[0], aCor[1], qx, qz, 3.4, 3.4, 0, 2.1, { c0: gray(0.6), c1: gray(0.72), topK: "plain", topC: col(0x77736d) }); }
  gallery(aCor, aKnee, 2.1, A_FLAT, 2.8, 2.6, "A");
  gallery(aKnee, aTop, A_FLAT, A_TOP, 2.8, 2.6, "A");
  // B: the short leg from the east head house to the transfer house, then the incline to the tower (carried on into its
  // head house's south-east corner at the same slope)
  const bEast = P(CONV_B.east), bTr = P(CONV_B.transfer), bS = P(CONV_B.start), bT = P(CONV_B.tower);
  gallery(bEast, bTr, 4.2, 6.8, 2.0, 1.8, "A");
  const [bdx, bdz, bLen] = unit(bS, bT), bSlope = (34.5 - 8.2) / bLen, bEnd = [bT[0] + bdx * 6.5, bT[1] + bdz * 6.5];
  gallery(bS, bEnd, 8.2, 34.5 + bSlope * 6.5, 4.2, 2.6, "B");
  // the transfer house (galvanized) with a railing round its roof; the east head house (dark corrugated)
  {
    const tr = outward(TRANSFER.map(P));
    prism("light", tr, 0, 8.7, { c0: gray(0.36), c1: gray(0.44), topK: "plain", topC: col(0x8a8c8c) });
    tr.forEach((p, i) => { const q = tr[(i + 1) % tr.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]); lat("rail", [p[0], 8.7, p[1]], [q[0], 8.7, q[1]], [q[0], 9.8, q[1]], [p[0], 9.8, p[1]], l, 2, C.rail); });
    prism("steel", EAST_HEAD.map(P), 0, 3.9, { c0: gray(0.85), topK: "plain", topC: C.roof });
  }
  // the bents: two legs and a cross beam under the gallery every ~20 m, braced; tall ones as four-legged trestles. Each is
  // moved along its gallery to keep off the buildings, the silos and the other conveyor
  const shed = SHED.map(P), towerBase = base, transfer = TRANSFER.map(P), eastHead = EAST_HEAD.map(P);
  const clearAt = (x, z, gi) => {
    for (const poly of [shed, towerBase, transfer, eastHead, ...BASINS.map((b) => b.map(P))]) {
      if (inside(x, z, poly)) return false;
      for (let i = 0; i < poly.length; i++) if (segDist(x, z, poly[i], poly[(i + 1) % poly.length]) < 2.5) return false;
    }
    if (segDist(x, z, g0, g1) < SILO_R + 3) return false;
    for (let j = 0; j < galleries.length; j++) if (j !== gi && galleries[j][4] > 2.5 && segDist(x, z, galleries[j][0], galleries[j][1]) < 5) return false;
    return !STEEL_SILOS.some(([lon, lat_]) => { const [sx, sz] = P([lon, lat_]); return Math.hypot(sx - x, sz - z) < 4.5; });
  };
  galleries.forEach(([p0, p1, t0, t1, w, dep], gi) => {
    const [gx, gz, len] = unit(p0, p1), px = -gz, pz = gx;
    const step = w < 2 ? 6 : 20;
    for (let s = step * 0.9; s < len - 4; s += step) {
      let at = null;
      for (const d of [0, 2, -2, 4, -4, 6, -6, 8, -8]) { const ss = s + d; if (ss < 2 || ss > len - 2) continue; const x = p0[0] + gx * ss, z = p0[1] + gz * ss; if (clearAt(x, z, gi)) { at = ss; break; } }
      if (at === null) continue;
      const y = lerp(t0, t1, at / len) - Math.min(dep, lerp(t0, t1, at / len) - 0.3), x = p0[0] + gx * at, z = p0[1] + gz * at, hw = w / 2 + 0.25;
      if (y < 0.5) continue;
      if (w < 2) { for (const sg of [-1, 1]) post("plain", x + px * sg * 0.55, z + pz * sg * 0.55, 0, y, 0.12, C.steelDk); continue; }
      const legs = y > 12 ? [-1.3, 1.3] : [0];
      const L = (sg, d) => [x + px * sg * hw + gx * d, z + pz * sg * hw + gz * d];
      for (const d of legs) {
        for (const sg of [-1, 1]) { const [lx, lz] = L(sg, d); post("plain", lx, lz, 0, y, 0.35, C.steelDk); }
        const a = L(-1, d), b = L(1, d);
        beam("plain", [a[0], y - 0.2, a[1]], [b[0], y - 0.2, b[1]], 0.4, 0.4, C.steelDk);
        for (let yy = 0; yy + 1 < y - 0.4; yy += 4.5) { const y1 = Math.min(y - 0.4, yy + 4.5); lat("frame", [a[0], yy, a[1]], [b[0], yy, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], 2 * hw, 2 * hw, C.truss); }
      }
      if (legs.length > 1) for (const sg of [-1, 1]) {                // the trestle's sides
        const a = L(sg, -1.3), b = L(sg, 1.3);
        for (let yy = 0; yy + 1 < y - 0.4; yy += 4.5) { const y1 = Math.min(y - 0.4, yy + 4.5); lat("frame", [a[0], yy, a[1]], [b[0], yy, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], 2.6, 2.6, C.truss); }
      }
    }
  });

  // ======== the other buildings: the shed, and the billboard ========
  {
    const sh = outward(shed);
    prism("steel", sh, 0, 6.0, { c0: gray(0.72), c1: gray(0.82), topK: "plain", topC: C.shedRoof });
    // two roll-up doors (assumed) on its long side toward the yard (the one farther from the silos)
    const mid = ([a, b]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], elen = ([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
    const longs = sh.map((v, i) => [v, sh[(i + 1) % 4]]).sort((m, n) => elen(n) - elen(m)).slice(0, 2);
    const [p, q] = longs.sort((m, n) => segDist(...mid(n), g0, g1) - segDist(...mid(m), g0, g1))[0];
    const [ex, ez, l] = unit(p, q);                                 // (outward is (ez, -ex): the ring is turned outward)
    for (const f of [0.3, 0.62]) sheet("light", p[0] + ex * l * f + ez * 0.08, p[1] + ez * l * f - ex * 0.08, ez, -ex, 4.2, 0, 4.4, [[0, 0], [0.7, 0], [0.7, 0.73], [0, 0.73]], gray(0.62));
  }
  {
    const ap = P(BILLBOARD.apex), [e1, e2] = BILLBOARD.ends.map(P), y0 = BILLBOARD.top - 4.3, y1 = BILLBOARD.top;
    const m = [lerp(ap[0], (e1[0] + e2[0]) / 2, 0.35), lerp(ap[1], (e1[1] + e2[1]) / 2, 0.35)];
    cyl("plain", m[0], m[1], 0.6, 0, y0 - 0.8, 12, { c0: C.billBack, c1: C.billBack });
    for (const e of [e1, e2]) {
      const other = e === e1 ? e2 : e1, [ex, ez, l] = unit(ap, e), mid = [(ap[0] + e[0]) / 2, (ap[1] + e[1]) / 2];
      const out = ez * (other[0] - mid[0]) - ex * (other[1] - mid[1]) < 0 ? 1 : -1;   // (each face on the V's outside)
      const fx = ez * out, fz = -ex * out;
      sheet("atlas", mid[0] + fx * 0.05, mid[1] + fz * 0.05, fx, fz, l, y0, y1, atl(AT.bill));
      sheet("plain", mid[0] - fx * 0.3, mid[1] - fz * 0.3, -fx, -fz, l, y0, y1, undefined, C.billBack);
      beam("plain", [m[0], y0 - 0.8, m[1]], [mid[0], y0 - 0.2, mid[1]], 0.35, 0.35, C.billBack);
      obox("plain", mid[0] + fx * 0.6, mid[1] + fz * 0.6, ex, ez, l, 1.0, y0 - 0.5, y0 - 0.4, { c0: C.billBack });   // the catwalk
      lat("rail", [ap[0] + fx * 1.1, y0 - 0.4, ap[1] + fz * 1.1], [e[0] + fx * 1.1, y0 - 0.4, e[1] + fz * 1.1], [e[0] + fx * 1.1, y0 + 0.6, e[1] + fz * 1.1], [ap[0] + fx * 1.1, y0 + 0.6, ap[1] + fz * 1.1], l, 2, C.billBack);
      for (const f of [0.15, 0.4, 0.65, 0.9]) {                    // floodlights on arms, aimed up at the face
        const b = [ap[0] + ex * l * f, ap[1] + ez * l * f];
        beam("plain", [b[0] + fx * 0.3, y0 - 0.4, b[1] + fz * 0.3], [b[0] + fx * 1.8, y0 - 0.1, b[1] + fz * 1.8], 0.08, 0.08, C.billBack);
        obox("plain", b[0] + fx * 1.9, b[1] + fz * 1.9, ex, ez, 0.5, 0.4, y0 - 0.25, y0 + 0.1, { c0: C.lamp });
      }
    }
  }

  // ======== the quay: the crane runway, the hopper, the crane; then the river side (sheet piles, fenders, barges) ========
  const run = RUNWAY.map(P);
  for (let i = 0; i + 1 < run.length; i++) {                      // the runway's two rails, 6 m apart (assumed)
    const p = run[i], q = run[i + 1], [ex, ez] = unit(p, q), nx = -ez, nz = ex;
    for (const o of [-3, 3]) {
      const at = (r, d) => [r[0] + nx * (o + d), 0.1, r[1] + nz * (o + d)];
      quad("plain", at(p, -0.08), at(q, -0.08), at(q, 0.08), at(p, 0.08), undefined, col(0x55524d));
    }
  }
  {
    // the receiving hopper: a gantry over the runway's rails (X-braced on its long sides), the hopper and its funnel on top
    const hp = P(HOPPER), [ex, ez] = unit(run[0], run[1]), nx = -ez, nz = ex, ga = 3.5, gb = 4.5;
    const at = (a, b) => [hp[0] + ex * a + nx * b, hp[1] + ez * a + nz * b];
    for (const a of [-ga, ga]) for (const b of [-gb, gb]) { const [x, z] = at(a, b); post("plain", x, z, 0.3, 4.6, 0.5, col(0xc3c0b8)); obox("plain", x, z, ex, ez, 1.6, 0.7, 0, 0.5, { c0: C.mech }); }
    for (const b of [-gb, gb]) { const p = at(-ga, b), q = at(ga, b); lat("frame", [p[0], 0.8, p[1]], [q[0], 0.8, q[1]], [q[0], 4.6, q[1]], [p[0], 4.6, p[1]], 2 * ga, ga, col(0xc3c0b8)); }
    obox("light", hp[0], hp[1], ex, ez, 2 * ga + 0.6, 2 * gb + 0.6, 4.6, 7.7, { c0: gray(0.82), c1: gray(0.92), topK: "plain", topC: col(0x9a9890) });
    const top = corners(hp[0], hp[1], ex, ez, 2 * ga, 2 * gb), bot = corners(hp[0], hp[1], ex, ez, 1.6, 1.6);
    for (let i = 0; i < 4; i++) { const a = top[i], b = top[(i + 1) % 4], c = bot[(i + 1) % 4], d = bot[i]; quad("plain", [a[0], 4.6, a[1]], [b[0], 4.6, b[1]], [c[0], 2.9, c[1]], [d[0], 2.9, d[1]], undefined, col(0xb4b1a9)); }
  }
  {
    // the crane: a portal on the rails, the revolving house and cab, the green lattice boom raised toward its 2022 tip,
    // the A-frame and pendants, the hoist line and clamshell
    const ch = P(CRANE), tip = P(BOOM_TIP), [ex, ez] = unit(run[0], run[1]), nx = -ez, nz = ex;
    for (const a of [-2.5, 2.5]) for (const b of [-3, 3]) post("plain", ch[0] + ex * a + nx * b, ch[1] + ez * a + nz * b, 0, 3.6, 0.45, col(0x3c4a40));
    obox("plain", ch[0], ch[1], ex, ez, 6, 7, 3.6, 4.2, { c0: col(0x3c4a40) });
    const [bdx_, bdz_] = unit(ch, tip), sx = -bdz_, sz = bdx_;
    const hx = ch[0] - bdx_ * 0.8, hz = ch[1] - bdz_ * 0.8;
    obox("plain", hx, hz, bdx_, bdz_, 5.2, 3.6, 4.2, 7.4, { c0: C.crane, topC: col(0x55665a) });
    obox("plain", hx + bdx_ * 2.0 + sx * 1.5, hz + bdz_ * 2.0 + sz * 1.5, bdx_, bdz_, 1.8, 1.4, 5.0, 7.0, { c0: C.crane });
    sheet("plain", hx + bdx_ * 2.95 + sx * 1.5, hz + bdz_ * 2.95 + sz * 1.5, bdx_, bdz_, 1.2, 5.8, 6.8, undefined, C.glass);
    const foot = [ch[0] + bdx_ * 1.8, 5.2, ch[1] + bdz_ * 1.8], end = [tip[0], 19.0, tip[1]];
    const bl = Math.hypot(end[0] - foot[0], end[1] - foot[1], end[2] - foot[2]), d = norm3(sub(end, foot)), su = norm3(cross(d, [0, 1, 0])), up = cross(su, d);
    const cornerAt = (p, i, j, r) => [p[0] + su[0] * i * r + up[0] * j * r, p[1] + su[1] * i * r + up[1] * j * r, p[2] + su[2] * i * r + up[2] * j * r];
    const sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let q = 0; q < 4; q++) {
      const [i0, j0] = sq[q], [i1, j1] = sq[(q + 1) % 4];
      lat("boom", cornerAt(foot, i0, j0, 0.7), cornerAt(end, i0, j0, 0.35), cornerAt(end, i1, j1, 0.35), cornerAt(foot, i1, j1, 0.7), bl, 1.6, C.boom);
    }
    const af = [hx - bdx_ * 1.6, 10.6, hz - bdz_ * 1.6];
    for (const s of [-1, 1]) {
      beam("plain", [hx - bdx_ * 2.4 + sx * s * 1.4, 7.4, hz - bdz_ * 2.4 + sz * s * 1.4], [af[0] + sx * s * 0.6, af[1], af[2] + sz * s * 0.6], 0.25, 0.25, C.crane);
      beam("plain", [hx + bdx_ * 0.4 + sx * s * 1.4, 7.4, hz + bdz_ * 0.4 + sz * s * 1.4], [af[0] + sx * s * 0.6, af[1], af[2] + sz * s * 0.6], 0.22, 0.22, C.crane);
      beam("plain", [af[0] + sx * s * 0.5, af[1], af[2] + sz * s * 0.5], [end[0] + sx * s * 0.25, end[1] + 0.3, end[2] + sz * s * 0.25], 0.06, 0.06, C.black);
    }
    beam("plain", [end[0], end[1] - 0.2, end[2]], [end[0], 9.6, end[2]], 0.06, 0.06, C.black);
    obox("plain", end[0], end[2], bdx_, bdz_, 2.0, 2.4, 7.8, 9.6, { c0: col(0x4a4844), c1: col(0x5c5954) });
  }
  // the river side
  WET = true;
  const quay = QUAY.map(P), RIVER = () => [...quay, [quay[quay.length - 1][0], quay[quay.length - 1][1] - 55], [quay[0][0], quay[0][1] - 55]];
  {
    walls("plain", quay, WATER_Y - 0.8, 0.05, { closed: false, c0: col(0x4a3a2e), c1: C.pile });
    for (let i = 0; i + 1 < quay.length; i++) {
      const p = quay[i], q = quay[i + 1], [ex, ez, l] = unit(p, q);
      for (let s = 2; s < l - 1; s += 4.5) {                       // the tire fenders, hung on the face (on its river side)
        const x = p[0] + ex * s, z = p[1] + ez * s, nx = ez, nz = -ex, side = (nz < 0 ? 1 : -1);
        obox("plain", x + nx * side * 0.25, z + nz * side * 0.25, ex, ez, 1.0, 0.35, -1.5, -0.4, { c0: C.tire });
      }
    }
    // the barges: rust-red hulls; one heaped with gravel (as in 2018), one under rolling covers (as in 2019)
    BARGES.forEach(([lon, lat_, brg, len, beamW, covered], bi) => {
      const [x, z] = P([lon, lat_]), th = (brg * Math.PI) / 180, ex = Math.sin(th), ez = -Math.cos(th);
      const deck = WATER_Y + 1.0, coam = WATER_Y + 1.9;
      obox("plain", x, z, ex, ez, len, beamW, WATER_Y - 0.6, deck, { c0: col(0x5e2522), c1: C.barge, topC: col(0x6a2a26) });
      const hl = len / 2 - 1.4, hw = beamW / 2 - 1.2;
      const cq = corners(x, z, ex, ez, 2 * hl, 2 * hw);
      walls("plain", cq, deck, coam, { c0: C.barge, c1: col(0x8a3a33) });
      flat("plain", cq, coam, 6, col(0x6a2a26));
      for (const sg of [-1, 1]) sheet("atlas", x - ez * sg * (hw + 0.06), z + ex * sg * (hw + 0.06), -ez * sg, ex * sg, 7, deck + 0.05, coam - 0.05, atl(AT.msc[bi]));
      if (covered) {
        const n = 10, seg = 8;
        for (let k = 0; k < n; k++) {                               // half-round covers along the hopper
          const s0 = -hl + (k / n) * 2 * hl + 0.1, s1 = -hl + ((k + 1) / n) * 2 * hl - 0.1;
          const ring = (s) => { const r = []; for (let j = 0; j <= seg; j++) { const a = (j / seg) * Math.PI, t = -Math.cos(a) * hw, y = coam + Math.sin(a) * 1.5; r.push([x + ex * s - ez * t, y, z + ez * s + ex * t]); } return r; };
          const r0 = ring(s0), r1 = ring(s1), cc = k % 2 ? C.cover : col(0xaeb1b1);
          for (let j = 0; j < seg; j++) quad("plain", r0[j], r0[j + 1], r1[j + 1], r1[j], undefined, cc);
          for (const [r, s] of [[r0, s0], [r1, s1]]) {              // its half-round ends
            const m = [x + ex * s, coam, z + ez * s];
            for (let j = 0; j < seg; j++) quad("plain", m, r[j], r[j + 1], r[j + 1], undefined, col(0x9a9d9d));
          }
        }
      } else {
        for (let k = 0; k < 3; k++) {                               // three heaps of gravel along the hopper
          const s = -hl + ((k + 0.5) / 3) * 2 * hl;
          heap(x + ex * s, z + ez * s, ex, ez, (2 * hl) / 3 * 0.55, hw * 0.95, coam - 0.4, WATER_Y + 3.3, C.gravel);
        }
      }
    });
    // (previews only) the river beside the quay, 55 m out, at the film's level (the ground over it is cut away below)
    if (riverCut) flat("plain", RIVER(), WATER_Y, 6, C.river);
  }
  WET = false;
  // an elongated mound: base (len x wid) at y0, rising to h, along (ex, ez); planar texture
  function heap(x, z, ex, ez, hlen, hwid, y0, h, cl, seg = 16) {
    const bb = batch("grain"), rings = [[1, y0], [0.7, lerp(y0, h, 0.55)], [0.35, lerp(y0, h, 0.88)]], idx = [];
    const jit = []; for (let j = 0; j < seg; j++) jit.push(0.9 + rnd() * 0.18);
    rings.forEach(([f, y], ri) => {
      const r = [];
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2, jj = jit[j % seg], la = Math.cos(a) * hlen * f * jj, lb = Math.sin(a) * hwid * f * jj;
        const px = x + ex * la - ez * lb, pz = z + ez * la + ex * lb, nn = norm3([Math.cos(a) * ex * 1.2 - Math.sin(a) * ez * 1.2, 1 - ri * 0.1, Math.cos(a) * ez * 1.2 + Math.sin(a) * ex * 1.2]);
        r.push(vert(bb, [px, y, pz], nn, [px / 6, -pz / 6], cl));
      }
      idx.push(r);
    });
    const topV = vert(bb, [x, h, z], [0, 1, 0], [x / 6, -z / 6], cl);
    for (let ri = 0; ri + 1 < idx.length; ri++) for (let j = 0; j < seg; j++) { face(bb, idx[ri][j], idx[ri][j + 1], idx[ri + 1][j + 1]); face(bb, idx[ri][j], idx[ri + 1][j + 1], idx[ri + 1][j]); }
    for (let j = 0; j < seg; j++) face(bb, idx[idx.length - 1][j], idx[idx.length - 1][j + 1], topV);
  }

  // ======== the yard's other things: basins, block walls, piles, light poles, the fence and the gate ========
  BASINS.forEach((b) => {
    const q = outward(b.map(P));
    flat("plain", q, 0.35, 6, C.basin);
    q.forEach((p, i) => { const r = q[(i + 1) % q.length], [ex, ez, l] = unit(p, r); obox("blocks", (p[0] + r[0]) / 2, (p[1] + r[1]) / 2, ex, ez, l + 0.76, 0.76, 0, 1.0, { tw: 3.04, th: 3.04, c0: gray(0.92) }); });
  });
  WALLS.forEach(([h, pts]) => {
    const q = pts.map(P);
    for (let i = 0; i + 1 < q.length; i++) {
      const p = q[i], r = q[i + 1], [ex, ez, l] = unit(p, r);
      obox("blocks", (p[0] + r[0]) / 2, (p[1] + r[1]) / 2, ex, ez, l + 0.76, 0.76, 0, h, { tw: 3.04, th: 3.04, c0: gray(0.88), c1: gray(1) });
    }
  });
  PILES.forEach(([sx, sz, len, wid, h, brg, kind]) => {
    const [x, z] = S(sx, sz), th = (brg * Math.PI) / 180, ex = Math.sin(th), ez = -Math.cos(th);
    if (!offRail(x, z, Math.max(len, wid) / 2)) return;
    heap(x, z, ex, ez, len / 2, wid / 2, 0, h, C[kind]);
    if (kind === "rubble") for (let k = 0; k < 14; k++) {          // broken slabs on and round the pile
      const a = rnd() * Math.PI * 2, f = Math.sqrt(rnd()) * 0.9, bx_ = x + Math.cos(a) * len / 2 * f, bz_ = z + Math.sin(a) * wid / 2 * f, s = 0.8 + rnd() * 1.4;
      const y = h * (1 - f * f) * 0.85;
      obox("plain", bx_, bz_, Math.cos(a * 3), Math.sin(a * 3), s * 1.6, s, y - 0.2, y + s * 0.5, { c0: col(0xd8d6cf), topC: col(0xe8e6e0) });
    }
  });
  POLES.forEach(([sx, sz]) => {                                     // (assumed: where they stand, and 18 m tall)
    const [x, z] = S(sx, sz);
    if (!offRail(x, z, 1.5)) return;
    cyl("plain", x, z, 0.2, 0, 18, 8, { c0: C.pole, c1: C.pole });
    obox("plain", x, z, 1, 0, 2.4, 0.5, 18, 18.6, { c0: C.pole });
    for (const o of [-0.7, 0.7]) obox("plain", x + o, z + 0.3, 1, 0, 0.6, 0.15, 17.9, 18.5, { c0: C.lamp });
  });
  {
    // the chain-link fence: along the spur from the west corner to the gate, then on to the silos; and under the Halsted St
    // viaduct (none along the site's south tip, by the spur). Its posts and rails are cut out of the steelwork canvas, its
    // mesh a see-through sheet just inside them; any stretch within `railway`'s clearance of the line is left out
    const fence = (pts) => {
      let acc = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const p = pts[i], q = pts[i + 1], [ex, ez, l] = unit(p, q), n = Math.max(1, Math.ceil(l / 0.5)), runs = [];
        let r0 = null;
        for (let k = 0; k <= n; k++) {
          const sk = (k / n) * l, ok = offRail(p[0] + ex * sk, p[1] + ez * sk);
          if (ok && r0 === null) r0 = sk;
          if (r0 !== null && (!ok || k === n)) { const r1 = ok ? sk : sk - l / n; if (r1 - r0 > 0.3) runs.push([r0, r1]); r0 = null; }
        }
        for (const [s0, s1] of runs) {
          const a = [p[0] + ex * s0, p[1] + ez * s0], b = [p[0] + ex * s1, p[1] + ez * s1], u0 = acc + s0, u1 = acc + s1;
          lat("fence", [a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], 2.4, b[1]], [a[0], 2.4, a[1]], s1 - s0, 3, C.fence, u0);
          quad("mesh", [a[0], 0.04, a[1]], [b[0], 0.04, b[1]], [b[0], 2.3, b[1]], [a[0], 2.3, a[1]], [[u0, 0], [u1, 0], [u1, 2.26], [u0, 2.26]], C.fence);
        }
        acc += l;
      }
    };
    const gate = P(GATE), w5 = site[5], w7 = site[7];
    const [gwx, gwz] = unit(gate, w5), [gex, gez, gel] = unit(gate, w7);
    const gw = [gate[0] + gwx * 4.5, gate[1] + gwz * 4.5], ge = [gate[0] + gex * 4.5, gate[1] + gez * 4.5];
    fence([site[2], site[3], site[4], site[5], gw]);
    const silW = [gate[0] + gex * gel * 0.3, gate[1] + gez * gel * 0.3];
    fence([ge, silW]);
    fence(site.slice(14, 27));
    for (const p of [gw, ge]) if (offRail(...p)) post("plain", p[0], p[1], 0, 2.8, 0.2, C.fence);
    // the sliding gate, run open behind the fence to the west
    const sg = [gw[0] - gwz * 0.6, gw[1] + gwx * 0.6], se = [sg[0] + gwx * 9, sg[1] + gwz * 9];
    if (offRail(...sg) && offRail(...se)) {
      fence([sg, se]);
      beam("plain", [sg[0], 2.3, sg[1]], [se[0], 2.3, se[1]], 0.1, 0.1, C.fence);
    }
  }

  // ======== the mixer trucks ========
  const LIV = AT.liv;
  const truck = (x, z, brg, livery) => {
    const th = (brg * Math.PI) / 180, fx = Math.sin(th), fz = -Math.cos(th), rx = Math.cos(th), rz = Math.sin(th);
    const W = (f, r, y) => [x + fx * f + rx * r, y, z + fz * f + rz * r];
    const tb = (f0, f1, r0, r1, y0, y1, cl, o = {}) => obox("plain", x + fx * (f0 + f1) / 2 + rx * (r0 + r1) / 2, z + fz * (f0 + f1) / 2 + rz * (r0 + r1) / 2, fx, fz, f1 - f0, r1 - r0, y0, y1, { c0: cl, ...o });
    tb(-5.0, 4.9, -0.5, 0.5, 0.75, 1.1, C.chassis);
    tb(5.0, 5.35, -1.25, 1.25, 0.45, 0.95, C.black);
    tb(3.75, 5.0, -0.95, 0.95, 1.0, 2.35, C.cab);
    quad("plain", W(5.01, -0.72, 1.15), W(5.01, 0.72, 1.15), W(5.01, 0.72, 2.2), W(5.01, -0.72, 2.2), undefined, C.fender);
    for (const s of [-1, 1]) tb(3.4, 4.7, s > 0 ? 0.95 : -1.25, s > 0 ? 1.25 : -0.95, 1.05, 1.45, C.fender);
    tb(2.0, 3.75, -1.25, 1.25, 1.0, 3.35, C.cab);
    quad("plain", W(3.77, 1.05, 2.45), W(3.77, -1.05, 2.45), W(3.77, -1.05, 3.15), W(3.77, 1.05, 3.15), undefined, C.glass);
    for (const s of [-1, 1]) quad("plain", W(2.6, s * 1.27, 2.3), W(3.6, s * 1.27, 2.3), W(3.6, s * 1.27, 3.15), W(2.6, s * 1.27, 3.15), undefined, C.glass);
    tb(1.35, 1.85, -0.6, 0.6, 1.1, 2.3, C.mech);
    tb(-3.9, -3.5, -0.9, 0.9, 1.1, 2.9, C.mech);
    tb(-4.95, -4.3, -0.5, 0.5, 3.0, 3.8, C.mech);
    beam("plain", W(-4.6, 0, 3.0), W(-5.4, 0, 2.0), 0.5, 0.2, C.mech);
    // the drum, tilted 13 degrees up toward the back, in its livery
    {
      const A = W(1.8, 0, 2.2), Bd = W(-4.35, 0, 2.2 + 6.15 * Math.tan((13 * Math.PI) / 180));
      const d = norm3(sub(Bd, A)), len = Math.hypot(...sub(Bd, A)), side = [rx, 0, rz], upv = norm3(cross(d, side));
      const prof = [[0, 0.05], [0.04, 0.75], [0.12, 1.08], [0.3, 1.2], [0.5, 1.15], [0.72, 0.92], [0.92, 0.62], [1, 0.55]];
      const seg = 14, bb = batch("atlas"), [lx, ly, lw, lh] = LIV[livery], rows = [];
      prof.forEach(([t, r]) => {
        const row = [];
        for (let j = 0; j <= seg; j++) {
          const a = (j / seg) * Math.PI * 2, n = [upv[0] * Math.cos(a) + side[0] * Math.sin(a), upv[1] * Math.cos(a) + side[1] * Math.sin(a), upv[2] * Math.cos(a) + side[2] * Math.sin(a)];
          const p = [A[0] + d[0] * t * len + n[0] * r, A[1] + d[1] * t * len + n[1] * r, A[2] + d[2] * t * len + n[2] * r];
          row.push(vert(bb, p, n, [(lx + 1 + t * (lw - 2)) / 1024, 1 - (ly + 1 + (j / seg) * (lh - 2)) / 1024], WHITE));
        }
        rows.push(row);
      });
      for (let i = 0; i + 1 < rows.length; i++) for (let j = 0; j < seg; j++) { face(bb, rows[i][j], rows[i][j + 1], rows[i + 1][j + 1]); face(bb, rows[i][j], rows[i + 1][j + 1], rows[i + 1][j]); }
    }
    // the wheels: the steer axle and the tandem (duals)
    for (const [f, wd] of [[4.05, 0.35], [-2.2, 0.6], [-3.55, 0.6]]) for (const s of [-1, 1]) {
      const seg = 10, rad = 0.53, bb = batch("plain"), r0 = s * (1.25 - wd), r1 = s * 1.25, ringA = [], ringB = [];
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * Math.PI * 2, cf = Math.cos(a) * rad, cy = 0.53 + Math.sin(a) * rad, n = [fx * Math.cos(a), Math.sin(a), fz * Math.cos(a)];
        ringA.push(vert(bb, W(f + cf, r0, cy), n, [0, 0], C.tire)); ringB.push(vert(bb, W(f + cf, r1, cy), n, [0, 0], C.tire));
      }
      for (let j = 0; j < seg; j++) { face(bb, ringA[j], ringA[j + 1], ringB[j + 1]); face(bb, ringA[j], ringB[j + 1], ringB[j]); }
      const hub = []; for (let j = 0; j < seg; j++) { const a = (j / seg) * Math.PI * 2; hub.push(W(f + Math.cos(a) * rad, r1, 0.53 + Math.sin(a) * rad)); }
      const bbh = batch("plain"), o = hub.map((p) => vert(bbh, p, [rx * s, 0, rz * s], [0, 0], col(0x55524e)));
      for (let j = 1; j + 1 < seg; j++) face(bbh, o[0], o[j], o[j + 1]);
    }
  };
  TRUCKS.forEach(([sx, sz, brg, liv]) => { const [x, z] = S(sx, sz); if (offRail(x, z, 5.5)) truck(x, z, brg, liv); });
  { // and three at the tower: one under it in the east lane, one waiting for the west lane, one just out on the north side
    const north = (Math.atan2(-bx, bz) * 180) / Math.PI;           // the bearing of -b
    for (const [a, b, liv] of [[(laneE[0] + laneE[1]) / 2, 1.0, 0], [(laneW[0] + laneW[1]) / 2, bMax + 9, 2], [(laneE[0] + laneE[1]) / 2, bMin - 8, 1]]) {
      const [x, z] = Tf(a, b); truck(x, z, north, liv);
    }
  }

  // ---- the meshes ----
  for (const [key, b] of Object.entries(B)) {
    if (!b.i.length) continue;
    const [k, wet] = key.split("@");
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.t, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
    geo.setIndex(b.i);
    const m = new THREE.Mesh(geo, MAT[k]); m.name = `prairie-material-${key}`;
    m.castShadow = k !== "lattice" && k !== "yard" && k !== "mesh"; m.receiveShadow = true;
    if (wet) m.renderOrder = -3;
    g.add(m);
  }
  if (riverCut) {
    // (previews only) a mask over the river at the street's level: it writes depth but no color, after the river and
    // barges and before the plain ground, so the ground does not show there
    const shape = new THREE.Shape(RIVER().map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ShapeGeometry(shape); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.3, 0);   // (0.3 m up: clear of the ground's depth)
    const mask = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }));
    mask.renderOrder = -2; mask.name = "prairie-material-river-mask"; g.add(mask);
  }
  return g;
}
