// Foundry Park: JDL Development and Kayne Anderson Real Estate's neighborhood on the old A. Finkl & Sons steel works
// along the North Branch at Cortland St (the reworked northern half of Lincoln Yards), as the plan has it built out:
// Phase 1 (Subarea D: the hotel, two brick apartment buildings and the 39-story tower around Central Square, which broke
// ground on October 21, 2026) and the later phases (Subareas A, B, C, E and F). For the cab-ride film
// (brag-output/2026-11-24-cab-ride-hyde-rogers), whose train stops at Clybourn, about 450 m west, and names Foundry Park on
// its closing card; a shareable module like museum-park.js and obama-center.js.
//
// Where the numbers come from:
//   - The plan: the City of Chicago's deck for the Chicago Plan Commission hearing of January 15, 2026 on Foundry Park
//     (the amendment of Planned Development 1439; JDL Development & Kayne Anderson, Hartshorne Plunkard Architecture,
//     Nudge Design; "2026-01-12_Foundry_Park_CPC_PD_PowerPoint.pdf", 68 slides, on chicago.gov with the Plan
//     Commission's materials). From it: the enlarged master plans (slides 15 to 18: every building's footprint, which
//     part is tower and which podium, and its stories), the infrastructure plan (slide 58: the streets), the massing
//     and program views (slides 12 to 14: maximum heights, setbacks and podiums), Phase 1's plans (slides 38 to 44:
//     garage levels, first, second, typical tower, typical upper and roof floors), its elevations on Southport,
//     Cortland and Kingsbury and its sections (slides 45 to 49), the facade axonometrics and materials board (slides 50
//     to 54), the open-space and riverwalk sheets (slides 21 to 34) and the renderings. Phase 1's footprints are traced
//     from the same sheets as Chicago YIMBY republished them at twice the deck's resolution ("Foundry Park Defined As It
//     Heads To Plan Commission", January 2026; 0.23 m a pixel); the rest from the deck's enlarged master plans (0.46 m a
//     pixel).
//   - Placement: OpenStreetMap, November 2026, through the Chicago Cityscape CLI: the centerlines of Southport Ave,
//     Cortland St, Kingsbury St, Dickens Ave, Dominick St and Elston Ave; the river banks (relation 3485552); the old
//     Finkl lots (ways 399145946, 399145725 and 947059562); and the Bloomingdale Line and the proposed 606 extension
//     south of Subarea F. OSM marks no construction on the site (only the Cortland St bridge's rehabilitation). Phase 1
//     is placed by six OSM street intersections and matches the Finkl lot within 3 m once drawn 3% shorter
//     north-south (the plan's Kingsbury runs at 45 degrees, OSM's at 43.6). C and E are placed from Phase 1 (within
//     0.6 m on shared corners). The deck's drawing does not fit OSM everywhere away from Phase 1, so: C.1's north end
//     is cut back to stay 9 m off OSM's Dickens Ave (the deck draws Dickens about 20 m farther north); the townhouses
//     (A) and houses (B) keep their fit to OSM's Dickens and Dominick, the townhouses moved 8 m west as the deck has
//     them; E.1 is moved 7 m east to keep the riverwalk on OSM's bank; and Subarea F is placed by the plan's own offsets
//     from Elston (F.2's west face 13 m off its centerline) and Cortland (F.1 10 m off), clear of the 606, with the
//     private drive between F.1 and F.2 4 m narrower than drawn.
//   - Heights and stories (the deck): D.4 39 stories to its roof at 520 ft (158.5 m): shops, two floors of offices and
//     studios and an amenity floor in a 60-65 ft podium, apartments to level 23, an amenity floor, condominiums above on
//     a smaller floor (slide 43), and the top floors stepping back on its northwest corner (4.5 m, then 3 m; slide 44).
//     D.2 13 stories, 169 ft 4 in (51.6 m), its 12th floor set back and a 13th-floor amenity room toward Kingsbury.
//     D.1, the hotel, 11 stories, 156 ft (47.5 m), 12 ft floors over a 20 ft base, its top floor (the restaurant) set
//     back 8 m from its south face over a terrace; its banquet wing 49 ft (15 m) with a terrace along its south edge.
//     D.3 8 stories, 116 ft (35.4 m) to its amenity penthouses, the roof at about 31 m. C.1, C.2 and C.3 12, 20 and 25
//     stories (at most 250, 275 and 325 ft), each tallest at its north end and stepping down to the south, on a podium
//     of shops and four parking levels. E.1 30 stories (450 ft at most) on a two-story podium; E.2 7; E.3 24 and E.4 21
//     (375 and 350 ft at most), curved towers on podiums, E.3 stepping back at both ends and E.4 at its east end; E.5
//     a five-story office building; E.6 9 stories on a podium. F.1 a 12-story office building over a parking podium;
//     F.2 35 stories (450 ft at most) over a six-story podium of shops, parking and a fitness club, stepping down along
//     its northeast side. The townhouses 50 ft and the houses 55 ft at most. The deck's affordable-housing tables give
//     D.2 220 homes and D.3 252. Reporting since the plan (Urbanize Chicago and others, autumn 2026) gives Phase 1 as
//     709 mixed-income homes, a 183-key hotel and a 777-space garage; Block Club Chicago (October 22, 2026) gives
//     31 acres, up to 3,737 homes and a $201.6 million TIF that pays for the streets, parks and a possible 606
//     extension over the river.
//   - Design (the deck's renderings, axonometrics and materials board; sketches by Bondy Studio): D.1 limestone and red
//     masonry, the stone base rounding the corner at Southport and Kingsbury, arched top-floor windows, the banquet hall
//     of tall arched windows; D.2 and D.3 masonry with limited metal and stone over shopfronts; D.4 terra cotta and
//     stone piers over glass; green roofs, and amenity decks with pools on the podiums; C.3 and F.2 dark glass; C.1 and
//     C.2 brick; E.1 dark glass in a red-brick frame with balconies; E.3 and E.4 dark glass ringed by balconies; E.5 and
//     E.6 dark metal-framed boxes; F.1 a pale office block; the townhouses brick; the houses pale.
//   Assumed: the floor heights other than the published totals; how much each C tower steps down (2 floors at its
//   middle, 6 at its south end) and the podiums' heights (C 18 m, E 9 m, F.1 14 m, F.2 26 m) from the massing views;
//   E.1's south part 4 floors lower; F.2's northeast strip about 80 m; the curved towers' bows (E.3 3 m, E.4 7 m); all
//   facade proportions and colors; the pools' sizes; the trees; the paths.
//   Reference images: refs/foundry-park/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildFoundryPark, foundryParkSite } from "./foundry-park.js";
//   scene.add(buildFoundryPark({ THREE }));                     // or { THREE, phases: [1] } for Phase 1 alone
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at
// the lakefront). Pass { origin: FOUNDRY_PARK_CENTRE } to center the site on (0, 0, 0). `phases` lists what to build:
// 1 (Subarea D, Dominick St, the Southport Ave extension and Subarea B's riverwalk, the plan's Phase 1 scope) and/or 2
// (everything else); a subarea's letter ("A" to "F") adds that subarea alone. It needs a browser (or another DOM with
// <canvas>): the facades are painted on canvas textures.
export const FOUNDRY_PARK_CENTRE = [-87.66286, 41.91741];
const FILM_ORIGIN = [-87.620063, 41.863968];
const REF = [-87.663128, 41.917068];   // the centerlines of Southport Ave (extended) and Cortland St, where [e, s] = [0, 0]

// ---- the plan: meters [east, south] of REF ----
const FP = {
  // Subarea D (Phase 1): the hotel's tower (D1T), its set-back top floor (D1U) and banquet wing (ground D1Q, upper
  // floors D1W); the Kingsbury bar (D2); the L along Southport and Cortland (D3); the tower (D4T: typical floor; D4C: the
  // condominium floors) and its podium (D4Q); the roofs' penthouses; the lot (DSITE); Central Square
  D1T: [[13.4, -170.3], [37.1, -170.3], [54.5, -187.2], [17.9, -223.1], [16.1, -223.7], [14.5, -223.1], [13.6, -221.7], [13.4, -220]],
  D1U: [[13.4, -178.2], [33.5, -178.2], [48.6, -192.6], [17.9, -223.1], [16.1, -223.7], [14.5, -223.1], [13.6, -221.7], [13.4, -220]],
  D1Q: [[13.4, -170.3], [37.1, -170.3], [54.5, -187.2], [77, -163.8], [38.9, -127], [13.4, -127]],
  D1W: [[13.4, -170.3], [37.1, -170.3], [54.5, -187.2], [76, -166], [36.5, -139.2], [13.4, -139.2]],
  D1MECH: [[23, -203.9], [31.3, -203.9], [31.3, -190.4], [35, -190.4], [35, -181], [23, -181]],
  D2: [[86.3, -153.1], [144, -95.5], [125.3, -77.8], [68.4, -135.6]],
  D2AM: [[81.7, -133.8], [90.5, -141.7], [133.3, -100.2], [124.2, -91.7]],
  D2MECH: [[86, -136.3], [90.8, -140.3], [114.9, -116.9], [110.1, -112.5]],
  D3: [[13.4, -110.6], [37.1, -110.6], [37.1, -40.2], [94.6, -40.2], [94.6, -17.2], [13.4, -17.2]],
  D3PH: [[[17.3, -101.1], [30.4, -101.1], [30.4, -89.6], [17.3, -89.6]], [[25.7, -36.5], [84.5, -36.5], [84.5, -24.5], [25.7, -24.5]]],
  D4T: [[167.2, -17.2], [167.2, -36.3], [187.1, -55.5], [226.5, -19.9], [228.1, -18.3], [227.9, -17.2]],
  D4C: [[167.3, -17.2], [167.3, -39.1], [182.1, -54.9], [185.7, -55.2], [189, -49.9], [217.6, -22.8], [215.8, -17.2]],
  D4MECH: [[175.9, -34], [184.9, -43.5], [203.8, -25.2], [197.7, -19.9], [190.9, -26.7], [186.7, -22.8]],
  D4Q: [[108.1, -17.2], [108.1, -43.5], [153.7, -87.2], [187.1, -55.5], [167.2, -36.3], [167.2, -17.2]],
  DSITE: [[9.6, -234.7], [230.6, -15.5], [10, -15.5]],
  LAWN: [[51.1, -98.6], [76.1, -98.6], [76.1, -63.2], [51.1, -63.2]],
  GARDEN: [[79.9, -98.6], [102.5, -98.6], [102.5, -61.4], [79.9, -61.4]],
  PAVILION: [[56, -111.7], [71.8, -111.7], [71.8, -100.3], [56, -100.3]],
  BASIN: [63.7, -122.7],
  POOL_D1: [[22.9, -154.6], [37.5, -154.6], [37.5, -147.6], [22.9, -147.6]],
  POOL_D4: [[124.1, -37.8], [147, -37.8], [147, -30.1], [124.1, -30.1]],
  // Subarea C: three podiums along Southport, each with its tower in parts from north to south (tallest first)
  C1P: [[-58, -302], [-21.1, -302], [-21.1, -231.3], [-58, -231.3]],
  C1T: [[[-46.8, -300.5], [-24.3, -300.5], [-24.3, -234], [-46.8, -234]]],
  C2P: [[-59.4, -211.9], [-21.4, -211.9], [-22.1, -143.5], [-60.1, -143.5]],
  C2T: [[[-47.9, -209.3], [-24.2, -209.3], [-24.6, -169.1], [-48.3, -169.1]], [[-48.3, -169.1], [-25.8, -169.1], [-25.9, -153.4], [-48.4, -153.4]],
    [[-48.4, -153.4], [-25.9, -153.4], [-26, -144.4], [-48.5, -144.4]]],
  C3P: [[-60.6, -99], [-23, -99], [-23.9, -17.7], [-61.5, -17.7]],
  C3T: [[[-49, -97.9], [-25.8, -97.9], [-26.3, -51.6], [-49.5, -51.6]], [[-50, -51.6], [-25.8, -51.6], [-26, -32.6], [-50.2, -32.6]],
    [[-49.7, -32.6], [-26, -32.6], [-26.1, -23.8], [-49.8, -23.8]]],
  // Subarea A: the townhouses' four rows around their garden; Subarea B: the houses' row (its river and Dominick sides)
  A_N: [[-124.2, -301.8], [-66.8, -302], [-66.8, -289.6], [-124.2, -289.4]],
  A_E: [[-79.7, -280.7], [-66.7, -280.7], [-66.5, -245.8], [-79.5, -245.8]],
  A_S: [[-101.5, -237.3], [-66.5, -237.4], [-66.4, -225.4], [-101.4, -225.3]],
  A_W: [[-136.7, -283.2], [-126.4, -287.7], [-95.6, -230.2], [-105, -224.9]],
  A_GARDEN: [[-120, -286], [-83, -286], [-83, -241], [-98, -241]],
  B_ROW: { w0: [-186.9, -279.1], e0: [-159.7, -292], w1: [-119.9, -149.6], e1: [-90.8, -153.2] },
  // Subarea E: E.1's tower (north and south parts) on its podium, E.2, E.3 and E.4 (curved towers given by center,
  // direction, length, width and bow) on their podiums, E.5, E.6's tower on its podium
  E1T: [[[-19.9, 64.2], [-42.8, 63.6], [-42.3, 21.7], [-19.4, 22.3]], [[-19.9, 80.9], [-42.1, 80.9], [-42.8, 63.6], [-19.9, 64.2]]],
  E1P: [[-56.1, 18], [-15.7, 18.2], [-15.5, 96.1], [-41.6, 96.2], [-45.1, 83.9], [-49.6, 60.8], [-54.2, 42.3], [-56.1, 33.5]],
  E2: [[64.6, 43.6], [14.6, 43.7], [12.6, 42.1], [12.5, 18.5], [81.2, 17.7], [82.8, 21.1], [82.8, 31.8], [81, 35]],
  E3P: [[12.6, 68], [62.3, 67.2], [77.1, 63], [94.5, 75.2], [91.1, 81.5], [63.8, 99.1], [44.9, 107], [24.5, 111.7], [17.3, 104.6], [12.7, 97.2]],
  E3: { c: [63.7, 83.7], u: [0.844, -0.536], L: 62.5, W: 23, bow: 3 },
  E4P: [[119, 17.6], [158.7, 18.2], [197.6, 17.4], [197.6, 38.4], [195.5, 41.4], [178.6, 42.9], [147.9, 50.3], [128, 60.1], [122.9, 58.3], [118.5, 51.1], [114.8, 43.7], [114.8, 40.5], [119, 35.6]],
  E4: { c: [157.4, 36.9], u: [0.964, -0.266], L: 85.8, W: 22, bow: 7 },
  E5: [[228.9, 55.2], [210.5, 37], [210.5, 18], [261.1, 17.2], [263.7, 20.2], [260.9, 23.9]],
  E6T: [[258.6, 96.3], [238.4, 76.7], [282, 33.3], [301.7, 53]],
  E6P: [[238.4, 76.7], [282, 33.3], [310.3, 61.4], [267.2, 104.7]],
  // Subarea F (placed on OSM's streets; see the top): the office F.1 on its parking podium, F.2's podium, its tower and
  // the lower strip along its northeast side, the pools on the podium
  F1P: [[-201.7, 61.8], [-147.5, 46.4], [-131.3, 30.7], [-115.3, 84.3], [-133.7, 92.2], [-152.3, 98], [-152.8, 108.6], [-173.9, 114.7], [-176, 114], [-179.5, 105.5], [-199.3, 111.5], [-211.1, 75.9], [-202.6, 72.9]],
  F1: [[-173.9, 114.7], [-176, 114], [-179.5, 105.5], [-199.3, 111.5], [-200.9, 110.9], [-211.1, 75.9], [-202.6, 72.9], [-200.6, 70.8], [-202.9, 63], [-201.7, 61.8], [-147.5, 46.4], [-133.7, 92.2], [-152.3, 98], [-154, 99.6], [-152.1, 106.1], [-152.8, 108.6]],
  F2P: [[-200.5, 165.4], [-175.4, 155.1], [-124.7, 128], [-118.7, 124.8], [-107.8, 144.8], [-102.5, 144.5], [-85.1, 177.9], [-90.4, 182.7], [-167.6, 223.5], [-172, 221]],
  F2T: [[-165.7, 174.4], [-175.4, 155.1], [-124.7, 128], [-113.8, 148.5]],
  F2S: [[-123.1, 127.8], [-118.7, 124.8], [-107.8, 144.8], [-110.8, 147.3]],
  F2POOLS: [[-150, 203], [-118, 186]],
  // streets the plan adds: Southport Ave south to Cortland, Dominick St and its turn east to Southport, the alley
  SOUTHPORT: [[-5, -253.9], [-5, -1.7]],
  DOMINICK: [[-157.5, -306.1], [-124.9, -240.3], [-93.2, -176.2], [-83.2, -151.9], [-72.8, -131.1], [-54.8, -118.8], [-34.6, -116.2], [-1, -115.9]],
  ALLEY: [[-63.3, -301.7], [-63.3, -150], [-64.5, -138], [-68, -125.4]],
  // parks: Crescent Park and the dog park (C), Foundry Point (E), F's green between its buildings and the river
  CRESCENT: [[-61.6, -127.6], [-56.1, -105.5], [-55.6, -14.8], [-70, -13.5], [-79.9, -30.2], [-85.5, -70], [-97.3, -105.4], [-79.5, -127.6]],
  POINT: [[-58.6, 13.9], [-45.2, 13.9], [-44.8, 91.3], [4.6, 106.7], [4.7, 120], [-15.4, 133.3], [-33.4, 124.5], [-49.2, 106.8]],
  FGREEN: [[-131.3, 30.7], [-124.5, 30.5], [-111, 92], [-96, 145], [-107.8, 144.8], [-118.7, 124.8], [-140, 135], [-152.8, 108.6], [-133.7, 92.2], [-115.3, 84.3]],
  // the riverwalk (a 16 ft trail in a 30 ft setback, per the riverwalk sections), 9 m in from OSM's banks
  RW_C: [[-227.4, -304.1], [-155, -168.1], [-130, -140.5], [-106.2, -125.6], [-90.5, -95.3], [-82.3, -67.8], [-79, -55], [-70.5, -11.8]],
  RW_E: [[-78.7, 8.2], [-64.2, 17], [-39.5, 117.9], [-9.8, 140.5], [1.7, 138.8], [38.3, 126.8], [86.4, 90.6], [129, 68.2], [162.1, 58.6], [195.2, 67.7], [239.2, 104.8]],
  RW_F: [[-85.1, 166.2], [-106.9, 93.7], [-121, 29.9]],
  BANK_C: [[-235.4, -300.2], [-162.4, -162.9], [-136.2, -134], [-113.5, -120.3], [-98.8, -91.9], [-91.3, -55.9], [-85.3, -50.4], [-79.4, -10.5]],
  BANK_E: [[-75.9, 16.7], [-45.3, 124.7], [-12.5, 151.3], [-0.1, 152], [5, 147.2], [41.7, 135.1], [91, 98.3], [133.1, 76.3], [162.1, 67.6], [189.7, 74.8], [233.4, 111.7]],
  BANK_F: [[-76.4, 163.6], [-98.2, 91.4], [-115.2, 8]],
};
// The site, for clearing OpenStreetMap's buildings and trees: north of Cortland (A to D, Dickens Ave to the river and
// Kingsbury St), E (Cortland to the river), F (its lot west of the river)
const SITE = [
  [[-240, -310], [-2, -311], [-1, -256], [23, -232], [110, -146], [175, -84], [214, -46], [257, -5], [224, -5], [74, -2], [5, 0], [-43, 1], [-68, -3], [-85, -50], [-91, -56], [-91, -66], [-99, -92], [-114, -120], [-121, -123], [-136, -134], [-162, -163], [-187, -207], [-212, -257], [-226, -280], [-235, -300]],
  [[-72, 4], [5, 2], [74, 0], [224, -3], [257, -2], [295, 30], [316, 56], [288, 155], [278, 147], [233, 112], [190, 75], [162, 68], [133, 76], [91, 98], [47, 132], [25, 141], [5, 147], [-10, 152], [-19, 146], [-45, 125], [-56, 91], [-63, 63], [-70, 31], [-76, 17]],
  [[-98, 91], [-112, 28], [-125, 30], [-222, 62], [-215, 77], [-227, 84], [-246, 95], [-236, 113], [-224, 135], [-173, 226], [-70, 172], [-76, 164]],
];

function toLocal(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070, KR = 111320 * Math.cos(REF[1] * Math.PI / 180);
  const L = (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
  const [rx, rz] = L(...REF);
  return { L, P: ([e, s]) => [rx + e * KX / KR, rz + s] };          // [east, south] of REF to local [x, z]
}
// The site as closed rings of local meters [x, z, x, z, ...], for clearing OpenStreetMap's buildings
export function foundryParkSite(origin = FILM_ORIGIN) {
  const { P } = toLocal(origin);
  return SITE.map((ring) => { const r = ring.flatMap((p) => P(p)); return [...r, r[0], r[1]]; });
}

export function buildFoundryPark({ THREE, origin = FILM_ORIGIN, phases = [1, 2] }) {
  const { L, P: toXZ } = toLocal(origin), [gx, gz] = L(...FOUNDRY_PARK_CENTRE), g = new THREE.Group();
  g.name = "foundry-park";
  g.position.set(gx, 0, gz);
  const P = (p) => { const [x, z] = toXZ(p); return [x - gx, z - gz]; };   // [east, south] to the group's [x, z]
  const R = (ring) => ring.map(P);
  const want = (phase, sub) => phases.includes(phase) || phases.includes(sub);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)

  // ---- the facades, each painted once on a canvas and repeated by the walls' uv (u in tiles along the wall, v up) ----
  const canvas = (draw, size = 512) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = size;
    const c = cv.getContext("2d"); draw(c, size);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  const glassFill = (c, x, y, w, h, tone) => {                   // a pane: the sky reflected at its top, darker below
    const gr = c.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, "#a8bccb"); gr.addColorStop(0.35, tone); gr.addColorStop(1, tone);
    c.fillStyle = gr; c.fillRect(x, y, w, h);
  };
  const brickBase = (c, S, brick, course = 12) => {              // a brick wall: tone speckle and faint coursing
    c.fillStyle = brick; c.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) { const v = rnd(); c.fillStyle = v < 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)"; c.fillRect(rnd() * S, rnd() * S, 9 + rnd() * 6, course / 2); }
    c.fillStyle = "rgba(220,210,195,0.10)"; for (let y = 0; y < S; y += course) c.fillRect(0, y, S, 1.5);
  };
  // brick with punched windows: cols x rows (a row a story); each window w x h of its cell from `top`; stone sills
  // and lintels; `arch` rounds the heads; `pair` splits each window with a mullion; `piers` darkens alternate piers
  const brickWin = ({ brick, cols, rows, w = 0.5, h = 0.6, top = 0.2, frame = "#2b2b2c", glass = ["#3b4a57", "#33424e", "#40505c"], stone = "#d9d2c3", arch = false, pair = true, course, piers }) => canvas((c, S) => {
    brickBase(c, S, brick, course);
    const cw = S / cols, ch = S / rows;
    if (piers) for (let k = 0; k < cols; k++) { c.fillStyle = piers; c.fillRect(k * cw, 0, cw * 0.12, S); }
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const x = k * cw + cw * (1 - w) / 2, y = r * ch + ch * top, ww = cw * w, hh = ch * h;
      c.fillStyle = stone; c.fillRect(x - 4, y + hh, ww + 8, 6);                                   // sill
      if (!arch) c.fillRect(x - 4, y - 7, ww + 8, 7);                                             // lintel
      c.fillStyle = frame;
      if (arch) { c.beginPath(); c.moveTo(x - 3, y + hh); c.lineTo(x - 3, y + ww / 2); c.arc(x + ww / 2, y + ww / 2, ww / 2 + 3, Math.PI, 0); c.lineTo(x + ww + 3, y + hh); c.fill(); }
      else c.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      const tone = glass[Math.floor(rnd() * glass.length)];
      c.save(); c.beginPath();
      if (arch) { c.moveTo(x, y + hh); c.lineTo(x, y + ww / 2); c.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); c.lineTo(x + ww, y + hh); c.closePath(); }
      else c.rect(x, y, ww, hh);
      c.clip(); glassFill(c, x, y, ww, hh, tone); c.restore();
      c.fillStyle = frame;
      if (pair) c.fillRect(x + ww / 2 - 2, y, 4, hh);
      c.fillRect(x, y + hh * 0.72, ww, 3);                                                         // transom
    }
  });
  // a shopfront story: piers of `frame` round tall glass with a transom, a sign band at the top
  const storefront = ({ frame, glass = "#36454f", bays = 2, band }) => canvas((c, S) => {
    c.fillStyle = frame; c.fillRect(0, 0, S, S);
    const bw = S / bays;
    for (let k = 0; k < bays; k++) {
      const x = k * bw + bw * 0.1, w = bw * 0.8;
      glassFill(c, x, S * 0.2, w, S * 0.8, glass);
      c.fillStyle = "rgba(20,24,28,0.85)"; c.fillRect(x, S * 0.36, w, 5); c.fillRect(x + w / 2 - 2, S * 0.36, 4, S * 0.64);
      c.fillStyle = "rgba(255,240,215,0.18)"; c.fillRect(x + 6, S * 0.6, w - 12, S * 0.4);      // the lit interior
    }
    if (band) { c.fillStyle = band; c.fillRect(0, S * 0.05, S, S * 0.09); }
  });
  // glass curtain wall (as in museum-park.js): cols x rows panels, mullions, a spandrel at each floor, balconies
  const curtain = ({ cols, rows, tones, mullion, mw = 3, spandrel, spH = 0.12, balc = 0, slab }) => canvas((c, S) => {
    const pw = S / cols, ph = S / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) glassFill(c, k * pw, r * ph, pw, ph, tones[Math.floor(rnd() * tones.length)]);
    c.fillStyle = spandrel; for (let r = 0; r < rows; r++) c.fillRect(0, (r + 1) * ph - ph * spH, S, ph * spH);
    c.fillStyle = mullion; for (let k = 0; k < cols; k++) c.fillRect(k * pw, 0, mw, S);
    if (slab) { c.fillStyle = slab; for (let r = 0; r < rows; r++) c.fillRect(0, (r + 1) * ph - 7, S, 7); }
    for (let k = 0; k < cols; k++) if (rnd() < balc) for (let r = 0; r < rows; r++) {
      const y = (r + 1) * ph - ph * 0.1;
      c.fillStyle = "rgba(20,28,36,0.35)"; c.fillRect(k * pw, y - ph * 0.3, pw, ph * 0.3);
      c.fillStyle = "#d4d6d4"; c.fillRect(k * pw, y, pw, ph * 0.1);
      c.fillStyle = "rgba(205,215,220,0.45)"; c.fillRect(k * pw, y - ph * 0.28, pw, ph * 0.28);
    }
  });
  // D.4: a cream frame of piers (one each 4.5 m bay, thin mullions between) and slab bands over dark glass; two
  // stories a tile, the heavier band every second story; a balcony bay at one edge (the corner units)
  const frameGrid = ({ frame, shade, tones, cols = 2, rows = 2, balcony = true }) => canvas((c, S) => {
    c.fillStyle = frame; c.fillRect(0, 0, S, S);
    const cw = S / cols, rh = S / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const x = k * cw + 46, y = r * rh + (r % 2 ? 16 : 30), w = cw - 92, h = rh - (r % 2 ? 32 : 46);
      glassFill(c, x, y, w, h, tones[Math.floor(rnd() * tones.length)]);
      c.fillStyle = shade; c.fillRect(x + w / 2 - 2, y, 4, h); c.fillRect(x + w / 4 - 1, y, 2, h); c.fillRect(x + 3 * w / 4 - 1, y, 2, h);
    }
    c.fillStyle = shade; for (let k = 0; k <= cols; k++) { c.fillRect(k * cw - 3, 0, 6, S); c.fillRect(k * cw + 40, 0, 4, S); c.fillRect(k * cw - 44, 0, 4, S); }   // the piers' shadowed edges
    if (balcony) { c.fillStyle = "rgba(235,232,222,0.9)"; for (let r = 0; r < rows; r++) c.fillRect(S - cw * 0.5, (r + 1) * rh - 10, cw * 0.5, 8); }
  });
  // tall arched windows in brick, one a tile (D.1's banquet hall), on a stone base course
  const arches = canvas((c, S) => {
    brickBase(c, S, "#8e3b2c");
    const x = S * 0.2, w = S * 0.6, y = S * 0.12, h = S * 0.72;
    c.fillStyle = "#d8d0bf"; c.beginPath(); c.moveTo(x - 14, y + h); c.lineTo(x - 14, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2 + 14, Math.PI, 0); c.lineTo(x + w + 14, y + h); c.fill();
    c.save(); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); c.clip();
    glassFill(c, x, y, w, h, "#3a4954"); c.fillStyle = "rgba(255,236,200,0.16)"; c.fillRect(x, y + h * 0.4, w, h * 0.6);
    c.fillStyle = "#2a2a2a"; for (let i = 1; i < 4; i++) c.fillRect(x + w * i / 4 - 2, y, 4, h); c.fillRect(x, y + w / 2, w, 4); c.fillRect(x, y + h * 0.7, w, 4);
    c.restore();
    c.fillStyle = "#d8d0bf"; c.fillRect(x + w / 2 - 12, y - 18, 24, 26);                          // keystone
    c.fillRect(0, S * 0.9, S, S * 0.1);                                                          // base course
  });
  // stone: rusticated limestone with tall windows (D.1's corner base)
  const stone = canvas((c, S) => {
    c.fillStyle = "#ddd5c4"; c.fillRect(0, 0, S, S);
    c.fillStyle = "rgba(120,110,95,0.35)"; for (let y = 0; y < S; y += 32) c.fillRect(0, y, S, 2);
    for (let k = 0; k < 2; k++) for (let r = 0; r < 2; r++) {
      const x = k * S / 2 + S * 0.14, y = r * S / 2 + S * 0.08, w = S * 0.22, h = S * 0.36;
      c.fillStyle = "#4a4a48"; c.fillRect(x - 3, y - 3, w + 6, h + 6); glassFill(c, x, y, w, h, "#3c4b56");
      c.fillStyle = "#4a4a48"; c.fillRect(x + w / 2 - 2, y, 4, h);
    }
  });
  // parking decks: precast spandrels over dark openings, two levels a tile, with a screen of fins
  const parking = canvas((c, S) => {
    c.fillStyle = "#b9b6ae"; c.fillRect(0, 0, S, S);
    for (let r = 0; r < 2; r++) { c.fillStyle = "#4a4d4f"; c.fillRect(0, r * S / 2 + S * 0.16, S, S * 0.24); }
    c.fillStyle = "rgba(90,90,85,0.6)"; for (let k = 0; k < 12; k++) c.fillRect(k * S / 12, 0, 6, S);
  });
  // the townhouses: one house a tile (5 m), four stories: a stoop and door, windows, a cornice
  const townhouse = canvas((c, S) => {
    brickBase(c, S, "#6e4a3c");
    c.fillStyle = "#2c2a29"; c.fillRect(0, 0, 5, S);
    for (let r = 0; r < 4; r++) {
      const y = S * 0.08 + r * S * 0.23;
      for (const x of r === 3 ? [S * 0.16, S * 0.56] : [S * 0.12, S * 0.55]) {
        if (r === 3 && x > S * 0.5) { c.fillStyle = "#2c2a29"; c.fillRect(x, y + S * 0.02, S * 0.26, S * 0.19); glassFill(c, x + 6, y + S * 0.03, S * 0.26 - 12, S * 0.18, "#3d4a54"); continue; }
        c.fillStyle = "#2c2a29"; c.fillRect(x - 3, y - 3, S * 0.32 + 6, S * 0.15 + 6); glassFill(c, x, y, S * 0.32, S * 0.15, "#3d4a54");
      }
    }
    c.fillStyle = "#cfc6b4"; c.fillRect(0, 0, S, S * 0.03); c.fillRect(S * 0.12, S * 0.94, S * 0.3, S * 0.06);
  });
  // the houses: pale masonry and big windows, three stories, one house a tile
  const house = canvas((c, S) => {
    c.fillStyle = "#d9d5cc"; c.fillRect(0, 0, S, S);
    c.fillStyle = "rgba(0,0,0,0.06)"; for (let y = 0; y < S; y += 20) c.fillRect(0, y, S, 1);
    for (let r = 0; r < 3; r++) {
      const y = S * 0.06 + r * S * 0.31, x = S * 0.12, w = S * 0.76, h = S * 0.22;
      c.fillStyle = "#2f2f2f"; c.fillRect(x - 4, y - 4, w + 8, h + 8); glassFill(c, x, y, w, h, "#3e4c56");
      c.fillStyle = "#2f2f2f"; c.fillRect(x + w / 3, y, 3, h); c.fillRect(x + 2 * w / 3, y, 3, h);
    }
    c.fillStyle = "#2f2f2f"; c.fillRect(S * 0.05, 0, 4, S); c.fillRect(S * 0.95, 0, 4, S);
  });
  // the amenity rooms on the roofs: pale glass boxes
  const amenity = curtain({ cols: 6, rows: 1, tones: ["#7f95a3", "#8aa0ad", "#748a98"], mullion: "#e8e8e4", mw: 5, spandrel: "#e8e8e4", spH: 0.1 });

  // [texture, tile width m, tile height m, glassy, metalness (glass 0.2 unless given)]
  const FACADES = {
    hotel: [brickWin({ brick: "#8a3a2b", cols: 4, rows: 2, w: 0.46, h: 0.62, top: 0.2 }), 7.2, 7.32, false],
    hotelTop: [brickWin({ brick: "#8a3a2b", cols: 4, rows: 1, w: 0.46, h: 0.6, top: 0.25, arch: true, stone: "#ddd6c6" }), 7.2, 3.5, false],
    stone: [stone, 6, 7, false],
    arches: [arches, 6.5, 8.9, false],
    redBrick: [brickWin({ brick: "#93412f", cols: 4, rows: 2, w: 0.52, h: 0.6, top: 0.2, piers: "rgba(70,25,15,0.25)" }), 7.2, 6.9, false],
    orangeBrick: [brickWin({ brick: "#b4683f", cols: 2, rows: 2, w: 0.66, h: 0.62, top: 0.18, piers: "rgba(110,50,20,0.25)", stone: "#e7e0d0" }), 7.2, 7, false],
    brownBrick: [brickWin({ brick: "#6f4a3a", cols: 4, rows: 2, w: 0.5, h: 0.62, top: 0.2, stone: "#c9bfae" }), 7.2, 6.6, false],
    bronzeBrick: [brickWin({ brick: "#7c4636", cols: 2, rows: 2, w: 0.7, h: 0.72, top: 0.14, frame: "#5a4027", pair: true, piers: "rgba(60,30,20,0.3)", stone: "#8a6a45" }), 6.6, 6.6, false],
    lowBrick: [brickWin({ brick: "#9b4b33", cols: 3, rows: 2, w: 0.6, h: 0.6, top: 0.2, arch: true }), 7.5, 7, false],
    frameCream: [frameGrid({ frame: "#efe7d4", shade: "#cfc4ae", tones: ["#3a4e62", "#41576c", "#34475a", "#4a6177"] }), 9, 7.8, true, 0],
    podiumCream: [frameGrid({ frame: "#ebe3d0", shade: "#c6bba5", tones: ["#3e505d", "#475966"], cols: 2, rows: 2, balcony: false }), 9, 9.2, true, 0],
    darkGlass: [curtain({ cols: 6, rows: 4, tones: ["#27333d", "#2d3a45", "#232e37", "#33414c"], mullion: "#1b2126", mw: 3, spandrel: "#20282f", spH: 0.08 }), 9, 13.2, true],
    darkGlass2: [curtain({ cols: 5, rows: 4, tones: ["#2b3846", "#314052", "#26323e"], mullion: "#9ea7ad", mw: 2, spandrel: "#2a3540", spH: 0.1, balc: 0.25 }), 9, 13.6, true],
    bandGlass: [curtain({ cols: 6, rows: 2, tones: ["#2a3744", "#30404e", "#25313c"], mullion: "#56636c", mw: 2, spandrel: "#2c3843", spH: 0.05, slab: "#e9e9e6" }), 9, 7, true],
    brickFrame: [curtain({ cols: 5, rows: 2, tones: ["#2b3540", "#313c47"], mullion: "#7e3a2a", mw: 14, spandrel: "#7e3a2a", spH: 0.1, balc: 0.6 }), 9, 6.6, true],
    metalGrid: [curtain({ cols: 4, rows: 2, tones: ["#36434d", "#3c4954", "#2f3b44"], mullion: "#2a2d30", mw: 10, spandrel: "#2a2d30", spH: 0.2 }), 7.2, 8.6, true],
    whiteOffice: [curtain({ cols: 4, rows: 2, tones: ["#5a6e7d", "#647889", "#536778"], mullion: "#f1f0ea", mw: 26, spandrel: "#f1f0ea", spH: 0.3 }), 7.2, 8.4, true, 0],
    parking: [parking, 9, 6.4, false],
    townhouse: [townhouse, 5, 14, false],
    house: [house, 7.4, 12, false],
    amenity: [amenity, 9, 4.8, true],
    shopStone: [storefront({ frame: "#d7cfbd", band: "#3c3a36" }), 9, 6.1, true],
    shopDark: [storefront({ frame: "#2a2b2d" }), 9, 6.1, true],
    shopCream: [storefront({ frame: "#e2dac8", glass: "#3b4b57" }), 9, 6.1, true],
    shopWhite: [storefront({ frame: "#ecebe6", band: "#4a4a48" }), 9, 6.1, true],
    stoneBand: [canvas((c, S) => { c.fillStyle = "#ddd5c4"; c.fillRect(0, 0, S, S); c.fillStyle = "rgba(90,80,65,0.35)"; c.fillRect(0, S * 0.7, S, S * 0.3); c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(0, 0, S, S * 0.12); }, 64), 6, 0.9, false],
    railing: [canvas((c, S) => { c.clearRect(0, 0, S, S); c.fillStyle = "rgba(40,42,44,0.9)"; c.fillRect(0, 0, S, 6); for (let k = 0; k < 16; k++) c.fillRect(k * S / 16, 0, 2, S); }, 64), 1.8, 1.05, false],
    slabEdge: [canvas((c, S) => { c.fillStyle = "#ecebe7"; c.fillRect(0, 0, S, S); c.fillStyle = "rgba(0,0,0,0.12)"; c.fillRect(0, S * 0.8, S, S * 0.2); }, 64), 9, 1, false],
  };
  const MATS = {};
  for (const [k, [map, , , glassy, metal]] of Object.entries(FACADES))
    MATS[k] = new THREE.MeshStandardMaterial({ map, roughness: glassy ? (metal === 0 ? 0.6 : 0.35) : 0.88, metalness: glassy ? (metal ?? 0.2) : 0, vertexColors: true });
  Object.assign(MATS.railing, { transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
  // roofs and ground (uv in meters / 8)
  const greenRoof = canvas((c, S) => {
    c.fillStyle = "#6b7f45"; c.fillRect(0, 0, S, S);
    for (let i = 0; i < 260; i++) { c.fillStyle = ["#8b9a4c", "#a39a48", "#56703c", "#7d8f5a", "#9aa35a"][Math.floor(rnd() * 5)]; c.beginPath(); c.arc(rnd() * S, rnd() * S, 6 + rnd() * 26, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "rgba(210,205,190,0.45)"; c.fillRect(0, 0, S, 4); c.fillRect(0, 0, 4, S);       // paths through the beds
  }, 256);
  greenRoof.repeat.set(0.5, 0.5);
  const deck = canvas((c, S) => {
    c.fillStyle = "#cfc9bc"; c.fillRect(0, 0, S, S);
    c.fillStyle = "rgba(0,0,0,0.08)"; for (let i = 0; i < S; i += 32) { c.fillRect(i, 0, 2, S); c.fillRect(0, i, S, 2); }
    for (let i = 0; i < 7; i++) { c.fillStyle = "#6f8649"; c.fillRect(rnd() * S * 0.8, rnd() * S * 0.8, S * (0.06 + rnd() * 0.12), S * (0.04 + rnd() * 0.08)); }   // planters
    c.fillStyle = "#e9e4d8"; for (let i = 0; i < 10; i++) c.fillRect(rnd() * S, rnd() * S, 10, 4);                          // loungers
  }, 256);
  deck.repeat.set(1 / 3, 1 / 3);
  const lawnTex = canvas((c, S) => {
    c.fillStyle = "#6f8f45"; c.fillRect(0, 0, S, S);
    for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; c.fillRect(k * S / 8, 0, S / 8, S); }
  }, 256);
  const pavingTex = canvas((c, S) => {
    c.fillStyle = "#c8c1b3"; c.fillRect(0, 0, S, S);
    c.fillStyle = "rgba(90,80,70,0.15)"; for (let i = 0; i < S; i += 16) { c.fillRect(i, 0, 1, S); c.fillRect(0, i, S, 1); }
  }, 256);
  const flat = (o) => new THREE.MeshStandardMaterial({ roughness: 0.95, ...o });
  const ROOFS = {
    roof: flat({ color: 0x8e9294 }), pale: flat({ color: 0xd2ccc4 }), green: flat({ map: greenRoof }), deck: flat({ map: deck }),
    pool: new THREE.MeshStandardMaterial({ color: 0x4f9fc0, roughness: 0.15, metalness: 0.1 }),
    lawn: flat({ map: lawnTex }), paving: flat({ map: pavingTex }), meadow: flat({ color: 0x5f7a3c }), bed: flat({ color: 0x55703a }),
    asphalt: flat({ color: 0x3c3f42 }), walk: flat({ color: 0xbdb7ac }), trail: flat({ color: 0xcfc8b8 }), water: new THREE.MeshStandardMaterial({ color: 0x6a8fa0, roughness: 0.1 }),
    tree: new THREE.MeshStandardMaterial({ roughness: 1, vertexColors: true, flatShading: true }), trunk: flat({ color: 0x4a3b2e }),
  };
  // the ground's layers lie a few centimeters apart; offsets keep them from flickering against each other far off
  for (const [k, o] of [["walk", 1], ["meadow", 1], ["paving", 2], ["asphalt", 3], ["lawn", 4], ["bed", 4], ["trail", 4]])
    Object.assign(ROOFS[k], { polygonOffset: true, polygonOffsetFactor: -o, polygonOffsetUnits: -o });

  // ---- the batches: one merged geometry per material (few draw calls) ----
  const B = new Map();
  const batch = (mat) => { let b = B.get(mat); if (!b) B.set(mat, b = { p: [], n: [], u: [], c: [] }); return b; };
  const outward = (pts) => {                                      // the ring turned so (dz, -dx) points out of every edge
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a < 0 ? [...pts].reverse() : pts;
  };
  // walls around a ring from y0 to y1; u in meters / tw along the wall, v = (y - vb) / th; tint a color multiplier
  const walls = (pts, y0, y1, face, { tint = [1, 1, 1], vb = y0 } = {}) => {
    if (y1 <= y0) return;
    const [, tw, th, glassy] = FACADES[face], b = batch(MATS[face]);
    pts = outward(pts);
    const n = pts.length, en = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1; en.push([dz / l, -dx / l, l]); }
    const shade = (y) => glassy ? 0.85 + 0.25 * Math.min(1, y / 160) : 1;
    let u = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], e = en[i], pe = en[(i + n - 1) % n], ne = en[(i + 1) % n];
      if (e[2] < 0.05) continue;
      const avg = (o) => { const d = e[0] * o[0] + e[1] * o[1]; if (d < 0.82) return [e[0], e[1]]; const x = e[0] + o[0], z = e[1] + o[1], l = Math.hypot(x, z); return [x / l, z / l]; };
      const n0 = avg(pe), n1 = avg(ne), v0 = (y0 - vb) / th, v1 = (y1 - vb) / th, u0 = u / tw, u1 = (u + e[2]) / tw;
      for (const [pt, y, nn, uu, vv] of [[p, y0, n0, u0, v0], [q, y1, n1, u1, v1], [q, y0, n1, u1, v0], [p, y0, n0, u0, v0], [p, y1, n0, u0, v1], [q, y1, n1, u1, v1]]) {
        b.p.push(pt[0], y, pt[1]); b.n.push(nn[0], 0, nn[1]); b.u.push(uu, vv); const s = shade(y); b.c.push(s * tint[0], s * tint[1], s * tint[2]);
      }
      u += e[2];
    }
  };
  // a flat polygon (with holes) at height y, facing up (or down)
  const cap = (pts, y, mat, holes = [], down = false) => {
    const b = batch(mat), V = (q) => new THREE.Vector2(q[0], q[1]);
    const all = [...pts, ...holes.flat()];
    const faces = THREE.ShapeUtils.triangulateShape(pts.map(V), holes.map((h) => h.map(V)));
    for (const f of faces) {
      let [a, c2, d] = f.map((i) => all[i]);
      const cr = (c2[0] - a[0]) * (d[1] - a[1]) - (c2[1] - a[1]) * (d[0] - a[0]);   // < 0: the face points up (y up, z south)
      if ((cr > 0) !== down) [c2, d] = [d, c2];
      for (const q of [a, c2, d]) { b.p.push(q[0], y, q[1]); b.n.push(0, down ? -1 : 1, 0); b.u.push(q[0] / 8, -q[1] / 8); b.c.push(1, 1, 1); }
    }
  };
  // a prism with its roof; `face` may be [[y, face], ...] bands from y0 (each band up to the next's y, the last to y1)
  const prism = (pts, y0, y1, face, roof, opts = {}) => {
    const bands = Array.isArray(face) ? face : [[y0, face]];
    bands.forEach(([y, f], i) => walls(pts, Math.max(y, y0), i + 1 < bands.length ? bands[i + 1][0] : y1, f, { ...opts, vb: opts.vb ?? y }));
    if (roof) cap(pts, y1, ROOFS[roof]);
  };
  // a ribbon along a polyline, `w` wide, flat at y
  const ribbon = (line, w, y, mat) => {
    const b = batch(mat);
    for (let i = 0; i + 1 < line.length; i++) {
      const p = line[i], q = line[i + 1], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2;
      const A = [p[0] + nx, p[1] + nz], Bq = [p[0] - nx, p[1] - nz], C = [q[0] - nx, q[1] - nz], D = [q[0] + nx, q[1] + nz];
      for (const t of [[A, C, Bq], [A, D, C]]) {
        let [a, c2, d] = t;
        const cr = (c2[0] - a[0]) * (d[1] - a[1]) - (c2[1] - a[1]) * (d[0] - a[0]);
        if (cr > 0) [c2, d] = [d, c2];
        for (const v of [a, c2, d]) { b.p.push(v[0], y, v[1]); b.n.push(0, 1, 0); b.u.push(v[0] / 8, -v[1] / 8); b.c.push(1, 1, 1); }
      }
    }
  };
  // polygon helpers: the centroid, a copy scaled about it, the part on the inner side of a line moved in by d
  const centroid = (pts) => { let x = 0, z = 0; for (const p of pts) { x += p[0]; z += p[1]; } return [x / pts.length, z / pts.length]; };
  const scaled = (pts, f) => { const [cx, cz] = centroid(pts); return pts.map(([x, z]) => [cx + (x - cx) * f, cz + (z - cz) * f]); };
  const clip = (pts, a, b, d) => {                                // keep the side of line a->b that holds the centroid, moved in by d
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); let nx = -dz / l, nz = dx / l;
    const [cx, cz] = centroid(pts); if ((cx - a[0]) * nx + (cz - a[1]) * nz < 0) { nx = -nx; nz = -nz; }
    const side = (p) => (p[0] - a[0]) * nx + (p[1] - a[1]) * nz - d, out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  };
  const rectAt = ([cx, cz], ux, uz, lu, lv) => [[cx - ux * lu / 2 + uz * lv / 2, cz - uz * lu / 2 - ux * lv / 2], [cx + ux * lu / 2 + uz * lv / 2, cz + uz * lu / 2 - ux * lv / 2], [cx + ux * lu / 2 - uz * lv / 2, cz + uz * lu / 2 + ux * lv / 2], [cx - ux * lu / 2 - uz * lv / 2, cz - uz * lu / 2 + ux * lv / 2]];
  const grow = (pts, d) => {                                      // the ring moved d m outward (mitred corners, capped)
    const o = outward(pts), n = o.length;
    return o.map((p, i) => {
      const a = o[(i + n - 1) % n], b = o[(i + 1) % n];
      const e1 = [p[1] - a[1], a[0] - p[0]], e2 = [b[1] - p[1], p[0] - b[0]], l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1;
      let nx = e1[0] / l1 + e2[0] / l2, nz = e1[1] / l1 + e2[1] / l2; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
      const m = Math.min(3, 1 / Math.max(0.35, nx * e1[0] / l1 + nz * e1[1] / l1));
      return [p[0] + nx * d * m, p[1] + nz * d * m];
    });
  };
  const cornice = (pts, y, out = 0.45, h = 0.9) => { const r = grow(pts, out); walls(r, y - h, y, "stoneBand"); cap(r, y, ROOFS.pale, [pts]); cap(r, y - h, ROOFS.pale, [pts], true); };
  const mech = (pts, y, h, f = 0.4) => prism(scaled(pts, f), y, y + h, "parking", "roof", { tint: [0.95, 0.95, 0.95] });
  const pool = (pts, y) => { cap(scaled(pts, 1.08), y + 0.05, ROOFS.pale); cap(pts, y + 0.12, ROOFS.pool); };
  const pointIn = (x, z, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };

  // ---- trees: a low faceted crown on a trunk, merged ----
  const ico = new THREE.IcosahedronGeometry(1, 1).toNonIndexed(), icoP = ico.attributes.position.array, icoN = ico.attributes.normal.array;
  const footprints = [];                                          // (trees keep out of the buildings)
  const tree = (x, z, h = 9 + rnd() * 4, r = 2.6 + rnd() * 1.4) => {
    if (footprints.some((f) => pointIn(x, z, f))) return;
    const b = batch(ROOFS.tree), t = batch(ROOFS.trunk), cy = h - r * 0.9;
    const tone = [[0.33, 0.45, 0.2], [0.29, 0.41, 0.19], [0.38, 0.48, 0.22], [0.3, 0.38, 0.2]][Math.floor(rnd() * 4)], k = 0.85 + rnd() * 0.3;
    for (let i = 0; i < icoP.length; i += 3) { b.p.push(x + icoP[i] * r, cy + icoP[i + 1] * r * 1.15, z + icoP[i + 2] * r); b.n.push(icoN[i], icoN[i + 1], icoN[i + 2]); b.u.push(0, 0); b.c.push(tone[0] * k, tone[1] * k, tone[2] * k); }
    const w = 0.18;                                               // the trunk: four sides
    for (const [ax, az, bx, bz, nx, nz] of [[-w, -w, w, -w, 0, -1], [w, -w, w, w, 1, 0], [w, w, -w, w, 0, 1], [-w, w, -w, -w, -1, 0]])
      for (const [px, pz, py] of [[ax, az, 0], [bx, bz, cy], [bx, bz, 0], [ax, az, 0], [ax, az, cy], [bx, bz, cy]]) { t.p.push(x + px, py, z + pz); t.n.push(nx, 0, nz); t.u.push(0, 0); t.c.push(1, 1, 1); }
  };
  const treeLine = (line, step, off = 0, jit = 1) => {           // trees every `step` m along a polyline, `off` m to its left
    for (let i = 0; i + 1 < line.length; i++) {
      const p = line[i], q = line[i + 1], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
      for (let s = (i ? 0 : step / 2); s < l; s += step) tree(p[0] + dx * s / l - dz / l * off + (rnd() - 0.5) * jit, p[1] + dz * s / l + dx / l * off + (rnd() - 0.5) * jit);
    }
  };
  const treeFill = (pts, step) => {                              // trees on a jittered grid inside a polygon
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    for (let x = Math.min(...xs) + step / 2; x < Math.max(...xs); x += step) for (let z = Math.min(...zs) + step / 2; z < Math.max(...zs); z += step) {
      const px = x + (rnd() - 0.5) * step * 0.7, pz = z + (rnd() - 0.5) * step * 0.7;
      if (pointIn(px, pz, pts)) tree(px, pz);
    }
  };
  const offsetLine = (line, d) => line.map((p, i) => {            // a polyline moved d m to its left
    const a = line[Math.max(i - 1, 0)], b = line[Math.min(i + 1, line.length - 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    return [p[0] - dz / l * d, p[1] + dx / l * d];
  });
  const strip = (a, b) => [...a, ...[...b].reverse()];           // the polygon between two polylines

  // a curved tower's footprint: a slab `W` wide around an axis through center `c` along `u`, `Lt` long overall, its
  // middle bowed `bow` m toward the river (south) and its rounded ends cut back by `tw` (west) and `te` (east) meters
  const slab = ({ c, u, L: Lt, W, bow }, { tw = 0, te = 0, dw = 0, n = 16 } = {}) => {
    const half = (Lt - W) / 2, [ax, az] = P([c[0] - u[0] * half, c[1] - u[1] * half]), [bx2, bz2] = P([c[0] + u[0] * half, c[1] + u[1] * half]);
    const dx = bx2 - ax, dz = bz2 - az, len = Math.hypot(dx, dz);
    let nx = -dz / len, nz = dx / len; if (nz < 0) { nx = -nx; nz = -nz; }   // (toward the south, the river)
    const at = (t) => [ax + dx * t + nx * bow * 4 * t * (1 - t), az + dz * t + nz * bow * 4 * t * (1 - t)];
    const tan = (t) => { const tx = dx + nx * bow * 4 * (1 - 2 * t), tz = dz + nz * bow * 4 * (1 - 2 * t), m = Math.hypot(tx, tz); return [tx / m, tz / m]; };
    const hw = (W - dw) / 2, t0 = tw / len, t1 = 1 - te / len, side = [], other = [];
    for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n, [px, pz] = at(t), [tx, tz] = tan(t); side.push([px - tz * hw, pz + tx * hw]); other.push([px + tz * hw, pz - tx * hw]); }
    const capEnd = (t, from) => { const [px, pz] = at(t), [tx, tz] = tan(t), out = []; for (let k = 1; k < 8; k++) { const a2 = from + Math.PI * k / 8; out.push([px + (Math.cos(a2) * -tz - Math.sin(a2) * tx) * hw, pz + (Math.cos(a2) * tx - Math.sin(a2) * tz) * hw]); } return out; };
    return [...side, ...capEnd(t1, 0), ...[...other].reverse(), ...capEnd(t0, Math.PI)];
  };
  // a curved tower in tiers [[y1, cut], ...] (cut: { tw, te, dw }), from the ground (shops, then dark glass ringed by a
  // balcony at every floor) to its top, its podium beside it
  const curved = (spec, tiers, fh) => {
    let y0 = 0;
    tiers.forEach(([y1, cut], i) => {
      const f = slab(spec, cut);
      if (i === 0) footprints.push(f);
      prism(f, y0, y1, i === 0 ? [[0, "shopDark"], [6, "bandGlass"]] : "bandGlass", i === tiers.length - 1 ? "green" : "deck", i === 0 ? {} : { vb: 6 });
      const ring = slab(spec, { tw: Math.max(0, (cut.tw || 0) - 0.9), te: Math.max(0, (cut.te || 0) - 0.9), dw: (cut.dw || 0) - 1.8 });
      for (let y = Math.max(y0, 6) + fh; y < y1 - 0.5; y += fh) {          // the balconies' slabs
        cap(ring, y, ROOFS.pale, [f]); cap(ring, y - 0.25, ROOFS.pale, [f], true);
        walls(ring, y - 0.25, y, "slabEdge", { vb: y - 0.25 });
      }
      y0 = y1;
    });
  };

  // ================= Phase 1: Subarea D =================
  if (want(1, "D")) {
    const D1T = R(FP.D1T), D1U = R(FP.D1U), D1Q = R(FP.D1Q), D1W = R(FP.D1W), D2 = R(FP.D2), D3 = R(FP.D3), D4T = R(FP.D4T), D4C = R(FP.D4C), D4Q = R(FP.D4Q);
    footprints.push(D1T, D1Q, D2, D3, D4T, D4Q);
    // D.1, the hotel (11 stories, 156 ft to its roof): shops and the hotel's restaurant at the street, two stories of
    // limestone that round the corner, red masonry, and the top floor (the restaurant again) set back 8 m from the south
    // face over a terrace, its arched windows under a cornice; its mechanical penthouse (the deck's roof plan)
    prism(D1T, 0, 42.4, [[0, "shopStone"], [6.1, "stone"], [13.1, "hotel"]], null);
    cap(D1T, 42.4, ROOFS.deck);
    prism(D1U, 42.4, 47.5, "hotelTop", "green");
    cornice(D1U, 47.5, 0.6, 1.1); cornice(D1T, 13.6, 0.35, 0.6); cornice(D1T, 42.7, 0.3, 0.5);
    prism(R(FP.D1MECH), 47.5, 51, "parking", "roof", { tint: [0.95, 0.95, 0.95] });
    // its banquet wing: shops on the ground floor, the banquet hall's tall arched windows above (49 ft), with a terrace
    // along its south edge at the second floor and the hotel's pool deck on its roof
    prism(D1Q, 0, 6.1, "shopStone", "deck");
    prism(D1W, 6.1, 15, "arches", "deck", { vb: 6.1 });
    cornice(D1W, 15.3, 0.4, 0.8);
    pool(R(FP.POOL_D1), 15);
    // D.2 along Kingsbury (13 stories, 169 ft 4 in; 220 homes): red masonry over shopfronts, the 12th floor set back,
    // and the residents' amenity room on the roof toward Kingsbury, its mechanical room inside it (the roof plan)
    prism(D2, 0, 40.6, [[0, "shopDark"], [6.1, "redBrick"]], "pale");
    const D2b = scaled(D2, 0.965);
    prism(D2b, 40.6, 45.5, "redBrick", "green", { vb: 6.1 });
    cornice(D2, 40.9, 0.4, 0.7); cornice(D2, 6.7, 0.25, 0.5);
    {                                                           // the balconies stacked up its northwest end
      const [n0, , , w0] = D2, ux = w0[0] - n0[0], uz = w0[1] - n0[1], l = Math.hypot(ux, uz), ex = uz / l, ez = -ux / l;
      const dir = (ex * (n0[0] - D2[1][0]) + ez * (n0[1] - D2[1][1])) > 0 ? 1 : -1;   // (pointing away from the bar)
      for (const f of [0.2, 0.5, 0.8]) for (let y = 9.55; y < 40; y += 3.45) {
        const cx = n0[0] + ux * f + ex * dir * 0.9, cz = n0[1] + uz * f + ez * dir * 0.9;
        const r = rectAt([cx, cz], ux / l, uz / l, 3.6, 1.8);
        prism(r, y - 0.2, y, "slabEdge", "pale"); walls(r, y, y + 1.05, "railing");
      }
    }
    prism(R(FP.D2AM), 45.5, 51.6, "amenity", "roof");
    prism(R(FP.D2MECH), 51.6, 54, "parking", "roof", { tint: [0.95, 0.95, 0.95] });
    // D.3, the L along Southport and Cortland (8 stories, 116 ft to its penthouses; 252 homes): orange masonry over a
    // white shopfront base, a green roof, and the amenity penthouses on its north end and along its south wing
    prism(D3, 0, 30.6, [[0, "shopWhite"], [6.1, "orangeBrick"]], "green");
    cornice(D3, 30.9, 0.4, 0.8); cornice(D3, 6.6, 0.3, 0.5);
    for (const ph of FP.D3PH) prism(R(ph), 30.6, 35.4, "amenity", "roof");
    // D.4 at Cortland and Kingsbury (39 stories, 520 ft): terra cotta piers over glass. Its podium: shops, then two
    // floors of offices and studios set back 8 m from the northwest edge over a terrace, to 65 ft, with the residents'
    // pool deck on top. The tower: an amenity floor, apartments to level 23 on the typical floor, an amenity floor, then
    // the condominiums on a smaller floor (4 m in from Kingsbury, the corner cut back to terraces); the top floors step
    // in on the west face and the northwest corner (4.5 m, then 3 m more), under the mechanical penthouse
    const D4Q2 = clip(D4Q, P(FP.D4Q[1]), P(FP.D4Q[2]), 8.4);
    prism(D4Q, 0, 6.1, "shopCream", "deck");
    prism(D4Q2, 6.1, 19.8, "podiumCream", "deck", { vb: 6.1 });
    pool(R(FP.POOL_D4), 19.8);
    prism(D4T, 0, 97.8, [[0, "shopCream"], [6.1, "podiumCream"], [15.3, "amenity"], [19.8, "frameCream"], [93.9, "amenity"]], null);
    cap(D4T, 97.8, ROOFS.deck);
    const west = [D4C[0], D4C[1]], cham = [D4C[1], D4C[2]];
    const C2 = clip(clip(D4C, ...west, 4.8), ...cham, 4.5), C3 = clip(clip(D4C, ...west, 7), ...cham, 7.5);
    prism(D4C, 97.8, 129, "frameCream", "deck", { vb: 19.8 });
    prism(C2, 129, 144.6, "frameCream", "deck", { vb: 19.8 });
    prism(C3, 144.6, 158.5, "frameCream", "green", { vb: 19.8 });
    cornice(C3, 158.5, 0.35, 0.8);
    prism(R(FP.D4MECH), 158.5, 162.5, "parking", "roof", { tint: [0.95, 0.95, 0.95] });
    // Central Square over the garage: paving across the block, the great lawn, the gardens' beds, a glass pavilion,
    // the basin, and trees around the lawn and through the gardens
    cap(R(FP.DSITE), 0.1, ROOFS.paving);
    const lawn = R(FP.LAWN), pav = R(FP.PAVILION);
    cap(lawn, 0.16, ROOFS.lawn);
    const [g0, g1] = [FP.GARDEN[0], FP.GARDEN[2]];
    for (let e = g0[0] + 1; e < g1[0] - 3; e += 7.5) for (let s = g0[1] + 1; s < g1[1] - 4; s += 9.5) prism(R([[e, s], [e + 5.5, s], [e + 5.5, s + 7.5], [e, s + 7.5]]), 0, 0.45, "stone", "bed", { tint: [0.8, 0.78, 0.74] });
    prism(pav, 0, 4.2, "amenity", null);
    cap(scaled(pav, 1.18), 4.2, ROOFS.pale); cap(scaled(pav, 1.18), 4.0, ROOFS.pale, [], true);
    footprints.push(pav);
    const [bx, bz] = P(FP.BASIN), circ = (r, n = 24) => Array.from({ length: n }, (_, i) => [bx + r * Math.cos(i / n * Math.PI * 2), bz + r * Math.sin(i / n * Math.PI * 2)]);
    prism(circ(4.5), 0, 0.5, "stone", null, { tint: [0.9, 0.88, 0.84] }); cap(circ(4.5), 0.4, ROOFS.water);
    treeLine(R([[47.5, -100], [47.5, -60]]), 8); treeLine(R([[78, -100], [78, -60]]), 8);
    treeLine(R([[50, -57.5], [104, -57.5]]), 8);
    for (let e = g0[0] + 7; e < g1[0]; e += 7.5) treeLine(R([[e, g0[1]], [e, g1[1]]]), 9.5, 0, 0.5);
    // street trees around the block (Southport, Cortland, Kingsbury)
    treeLine(R([[9.5, -228], [9.5, -20]]), 9); treeLine(R([[14, -11.5], [224, -11.5]]), 9);
    treeLine(R([[12, -239], [235, -19]]), 9, -4.5);
  }
  // Phase 1's streets: Southport Ave south to Cortland (wide, with bike lanes) and Dominick St (with its turn to
  // Southport), new; and Subarea B's riverwalk
  if (want(1, "D") || want(1, "B")) {
    const SP = R(FP.SOUTHPORT), DM = R(FP.DOMINICK);
    ribbon(SP, 29, 0.05, ROOFS.walk); ribbon(SP, 16, 0.12, ROOFS.asphalt);
    ribbon(DM, 18, 0.05, ROOFS.walk); ribbon(DM, 10, 0.12, ROOFS.asphalt);
    treeLine(SP, 9, 12); treeLine(DM, 9, 7); treeLine(DM, 9, -7);
    const rw = R(FP.RW_C.slice(0, 3)), bank = R(FP.BANK_C.slice(0, 3));
    cap(strip(offsetLine(rw, 2.5), bank), 0.08, ROOFS.meadow);
    ribbon(rw, 4.9, 0.14, ROOFS.trail);
    treeLine(rw, 8, -5, 2); treeLine(rw, 10, 7, 2);
  }

  // ================= the later phases =================
  // Subarea A: 28 townhouses (four stories, 50 ft at most) around a private garden
  if (want(2, "A")) {
    for (const k of ["A_N", "A_E", "A_S", "A_W"]) { const r = R(FP[k]); footprints.push(r); prism(r, 0, 14, "townhouse", "roof", { tint: k === "A_E" || k === "A_W" ? [0.92, 0.95, 1] : [1, 1, 1] }); }
    const gdn = R(FP.A_GARDEN);
    cap(gdn, 0.12, ROOFS.lawn); treeFill(gdn, 11);
    ribbon(R(FP.ALLEY), 6, 0.12, ROOFS.asphalt);
  }
  // Subarea B: 19 houses on the river (55 ft at most), their fronts on Dominick St, gardens behind
  if (want(2, "B")) {
    const { w0, e0, w1, e1 } = FP.B_ROW, lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    for (let i = 0; i < 19; i++) {
      const t0 = i / 19 + 0.004, t1 = (i + 1) / 19 - 0.004, fa = lerp(e0, e1, t0), fb = lerp(e0, e1, t1), ba = lerp(w0, w1, t0), bb = lerp(w0, w1, t1);
      const r = R([fa, fb, lerp(fb, bb, 0.58), lerp(fa, ba, 0.58)]), h = [12.2, 13.4, 11.6, 12.8][i % 4], tone = [[1, 1, 1], [0.86, 0.84, 0.8], [0.62, 0.62, 0.64], [0.95, 0.9, 0.82]][(i * 7) % 4];
      footprints.push(r); prism(r, 0, h, "house", "roof", { tint: tone });
      cap(R([lerp(fa, ba, 0.6), lerp(fb, bb, 0.6), lerp(fb, bb, 0.98), lerp(fa, ba, 0.98)]), 0.12, ROOFS.lawn);
    }
  }
  // Subarea C: three towers along Southport, 12, 20 and 25 stories, getting taller to the south, each on a podium of
  // shops and four parking levels; each tower tallest at its north end, stepping down 2 and then 6 floors to the south;
  // Crescent Park and the dog park between them and the river, and its riverwalk
  if (want(2, "C")) {
    const C = [["C1P", "C1T", 44, "brownBrick"], ["C2P", "C2T", 70, "bronzeBrick"], ["C3P", "C3T", 87, "darkGlass"]];
    for (const [pk, tk, h, f] of C) {
      const pr = R(FP[pk]); footprints.push(pr);
      prism(pr, 0, 18, [[0, "shopDark"], [6.1, "parking"]], "green");
      FP[tk].forEach((part, i) => {
        const tr = R(part), top = h - [0, 2, 6][i] * 3.3;
        prism(tr, 18, top, f, "roof", { vb: 18 });
        if (i === 0) mech(tr, top, 4);
      });
    }
    const cres = R(FP.CRESCENT); cap(cres, 0.12, ROOFS.lawn); treeFill(cres, 13);
    const rw = R(FP.RW_C.slice(2)), bank = R(FP.BANK_C.slice(2));
    cap(strip(offsetLine(rw, 2.5), bank), 0.08, ROOFS.meadow); ribbon(rw, 4.9, 0.14, ROOFS.trail);
    treeLine(rw, 9, -5, 2); treeLine(rw, 11, 7, 2);
  }
  // Subarea E, south of Cortland along the river: E.1 (30 stories) by the bridge, E.2 (7), the curved E.3 (24) and
  // E.4 (21), the office building E.5 (5) and E.6 (9); Foundry Point at the tip and the riverwalk, which carries the 606
  if (want(2, "E")) {
    const E1P = R(FP.E1P), E2 = R(FP.E2), E5 = R(FP.E5), E6T = R(FP.E6T), E6P = R(FP.E6P), E3P = R(FP.E3P), E4P = R(FP.E4P);
    footprints.push(E1P, E2, E5, E6P, E3P, E4P);
    prism(E1P, 0, 9, [[0, "shopDark"], [6.1, "lowBrick"]], "deck");
    FP.E1T.forEach((part, i) => { const tr = R(part), top = i ? 90 : 104; prism(tr, 9, top, "brickFrame", "roof", { vb: 9 }); if (!i) mech(tr, top, 4); });
    prism(E2, 0, 27, [[0, "shopDark"], [6.1, "lowBrick"]], "green");
    prism(E5, 0, 22, [[0, "shopDark"], [6.1, "metalGrid"]], "green");
    prism(E6P, 0, 9, [[0, "shopDark"], [6.1, "metalGrid"]], "deck");
    prism(E6T, 9, 33, "metalGrid", "green", { vb: 9 });
    // the curved towers on their podiums: E.3 stepping back at both ends, E.4 at its east end (the deck's nested outlines)
    prism(E3P, 0, 9, [[0, "shopDark"], [6.1, "metalGrid"]], "deck");
    prism(E4P, 0, 9, [[0, "shopDark"], [6.1, "metalGrid"]], "deck");
    curved(FP.E3, [[79.5, {}], [83, { tw: 3.8, te: 3.8, dw: 2 }], [86.5, { tw: 7.6, te: 7.6, dw: 4 }]], 3.5);
    curved(FP.E4, [[65.5, {}], [69, { te: 6.8 }], [72.5, { te: 13.6 }], [76, { te: 20.4 }]], 3.5);
    const pt = R(FP.POINT); cap(pt, 0.12, ROOFS.lawn); treeFill(pt, 12);
    const rw = R(FP.RW_E), bank = R(FP.BANK_E);
    cap(strip(offsetLine(rw, 2.5), bank), 0.08, ROOFS.meadow); ribbon(rw, 4.9, 0.14, ROOFS.trail);
    treeLine(rw, 9, -5, 2); treeLine(rw, 11, 7, 2); treeLine(R([[0, 9], [200, 9]]), 9); treeLine(R([[4, 14], [200, 14]]), 9);
  }
  // Subarea F, across the river: the office building F.1 (12 stories) over its parking podium, and F.2 (35 stories)
  // over a six-story podium of shops, parking and a fitness club with pools on its roof, its tower stepping down along
  // its northeast side; the green between them and the river, and the riverwalk
  if (want(2, "F")) {
    const F1P = R(FP.F1P), F1 = R(FP.F1), F2P = R(FP.F2P), F2T = R(FP.F2T), F2S = R(FP.F2S);
    footprints.push(F1P, F2P);
    prism(F1P, 0, 14, [[0, "shopDark"], [6.1, "parking"]], "green");
    prism(F1, 14, 50, "whiteOffice", "roof", { vb: 14 }); mech(F1, 50, 5, 0.35);
    prism(F2P, 0, 26, [[0, "shopDark"], [6.1, "parking"], [12.5, "darkGlass2"]], "deck");
    prism(F2T, 26, 122, "darkGlass", "roof", { vb: 26 }); mech(F2T, 122, 4.5);
    prism(F2S, 26, 80, "darkGlass", "roof", { vb: 26 });
    const [sx, sz] = [0.884, -0.467];
    for (const c of FP.F2POOLS) pool(R(rectAt(c, sx, sz, 22, 8)), 26);
    const fg = R(FP.FGREEN); cap(fg, 0.12, ROOFS.lawn); treeFill(fg, 11);
    const rw = R(FP.RW_F), bank = R(FP.BANK_F);
    cap(strip(offsetLine(rw, 2.5), bank), 0.08, ROOFS.meadow); ribbon(rw, 4.9, 0.14, ROOFS.trail);
    treeLine(rw, 9, -5, 2); treeLine(rw, 11, 7, 2);
  }

  // ---- the merged meshes ----
  for (const [mat, b] of B) {
    if (!b.p.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.u, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = !mat.transparent && mat !== ROOFS.lawn && mat !== ROOFS.paving; m.receiveShadow = true;
    g.add(m);
  }
  return g;
}
