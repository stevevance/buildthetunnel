// Halsted Pointe: Onni Group's riverfront development at 901 N Halsted St, on the former Greyhound bus garage site at the
// southern tip of Goose Island, between Halsted St (west), the North Branch Canal (east) and the North Branch of the
// Chicago River (south), across the river from Halsted Landing and two blocks north of Bally's Chicago. Planned
// Development 1522: five residential towers and a hotel round landscaped courts, a riverwalk, a lawn and a beach, as
// presented to the Chicago Plan Commission in November 2026 (the film shows a near future, as it does for Bally's). For the
// cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a shareable module like museum-park.js.
//
// Where the numbers come from:
//   - Primary source: the City's deck for the Chicago Plan Commission hearing of November 19, 2026, "Halsted Pointe
//     Sub-Areas B, C, & D" (Department of Planning and Development, file 931_N_Halsted_CPC_Draft_for_posting.pdf; Onni
//     Group, SCB, Langan, DLA Piper): its site and ground floor plan, the level 3-7 and level 8 (amenity) plans, the
//     typical residential floor plans, the hotel floor plans, the north, east, south and west elevations, the building
//     sections, the facade materials and the landscape plan.
//       Towers (the deck's building data): B1 44 stories, 515 ft, 446 homes; B2 51 stories, 590 ft, 688 homes; C1 44
//       stories, 515 ft, 443 homes; C2 46 stories, 535 ft, 609 homes (its elevations give C1 and C2 45 stories and B2 686
//       homes); the hotel 13 stories, 178 ft, 162 keys (18 a floor on levels 3-11, a rooftop amenity floor and pool on
//       12). Heights are given above Chicago City Datum; the sections put the raised terrace the towers stand on at
//       +26 ft CCD (the riverwalk at +14 ft), so above the terrace B1 and C1 are 149.0 m, B2 171.9 m, C2 155.1 m and the
//       hotel 46.3 m. From the sections, scaled by B2's 590 ft over the CCD line: levels 1-2 9.1 m, the parking and
//       liner floors 3-7 to the podium deck at 26.9 m (88 ft), the double-height amenity level 8 to 32.9 m, then 3.09 m
//       stories. From the elevations: B1's and C1's crowns step in three times, 2.4-2.6 m each, to the top; B2's roof at
//       168.1 m under its mechanical screen; C2's southern quarter stops at 0.8 of its height (124.9 m).
//       Footprints: the level 3-7 plans give each pair's podium (B1 and B2 joined by a parking garage running down the
//       east side of the North Arrival Court; C2 and C1 by one over the walk between them), traced off the drawing; the
//       typical floor plans give the towers (B1 and C1 near-square, notched, 12 homes a floor; B2 and C2 bent bars, 16 a
//       floor, balconies along both long sides), each set on its elevator core where the ground and level 3-7 plans put it
//       and turned to match their corridors (they fit the level 8 plan's outlines). The traced towers come within 3% of
//       the deck's typical floors (10,937 and 13,328 sq ft). The plans are registered to OpenStreetMap's site (below) by a
//       least-squares fit to five corners: 0.119 m a pixel at 300 dpi (the deck's own scale bar, 80 ft = 205 px), turned
//       1.8 degrees, 1.2 m rms; the level 3-7 and level 8 plans to the site plan by their elevator cores (the same shift
//       for both pairs). The pools and roof terraces on the podiums come from the level 8 plans, the lawns, beach, courts
//       and round drive from the site plan, the hotel's bar and terrace from its floor plans.
//       Materials (the deck's facade material sheet and elevations): aluminum and glass walls; on B1 and C1 a dark-framed
//       grid with inset balconies over part of each face; brick and glass on the podiums and the hotel; a bronze metal
//       feature wall of vertical fins over the garages; aluminum storefronts; balconies with metal picket guardrails;
//       glass guardrails on the podium decks; metal-clad V columns (not modeled).
//   - The site: OpenStreetMap, November 2026, through the Chicago Cityscape CLI: way 1187740901 (landuse=construction,
//     "Halsted Pointe", 31,100 m2, the reported 8 acres) and way 1561094811 (building=construction, "931 N Halsted
//     Street"). (OSM no longer maps the Greyhound garage.)
//   - Phase 1 (Subarea A, Hartshorne Plunkard Architecture; started April 2026, done September 2028 by the deck; outside
//     its scope): HPA's "Proposed Design Revisions - Subarea A" (April 20, 2023, as published by Urbanize Chicago, June 23,
//     2023): typical floor 125 x 118 ft over its balconies, 12'-11" off Halsted and 53'-4" off the north property line
//     (the City's site plan draws it there too, 7.1 m south of the north-west corner of OSM's outline, which is the
//     excavation), the tower on the north end of a 128 x 252 ft podium (floors 2-5, the pool deck on 6); the 46th floor at
//     480 ft and the top at 497 ft above the 1st floor (the terrace); the north third stepping down to a vertical-metal-
//     panel mechanical screen (422 to 460 ft, off the west elevation). Facade from the same sheets and HPA's renderings:
//     rectilinear corners, angled planes and balcony walls, a captured glass system in two glass and mullion colors,
//     champagne vertical metal panels folded round the podium over a glass storefront. CTBUH: 46 floors, 154.2 m (506 ft,
//     from the Halsted St entrance a level lower), 464 homes. The deck's elevations show its silhouette, which agrees.
//   - Phasing (the deck's timeline): A April 2026 - September 2028; B August 2027 - December 2030; C Q3-Q4 2029 - Q1-Q2
//     2033; D (the hotel) Q1 2032 - Q3 2033. (PD 1522 and Phase 1 were first approved September 14, 2021, with a 691 ft
//     tower on the south-east corner; this plan replaces it.)
//   Assumed: which way B1's and C1's notched sides face (the plans fix their cores and corridors, not that half-turn: B1's
//   faces the podium roof, C1's the Central Arrival Court, as the level 3-7 homes suggest); where on each face the
//   dark-framed grid runs (the middle 70% of each face 8 m or longer); the undulating balconies' exact pattern (the
//   plans show their wavy edge, the renderings their look); the crowns' inset (each step 6% of the tower's width in
//   from every side, the top a central block under half its size); the hotel's level 12 set back 1.4 m; the materials'
//   colors; the trees;
//   the site as level (y 0 is the terrace; Halsted St at its north end and the riverwalk are about 3.7 m lower).
//   Reference images: refs/halsted-pointe/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildHalstedPointe, halstedPointeSite } from "./halsted-pointe.js";
//   scene.add(buildHalstedPointe({ THREE }));                 // or { THREE, phases: [1] } for Phase 1 alone
//
// Phases: 1 = Subarea A (the HPA tower); 2 = Subarea B (B1, B2 and their podium); 3 = Subarea C (C1, C2, their podium,
// Pointe Park and Pointe Beach); 4 = Subarea D (the hotel and The Commons).
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at
// the lakefront). Pass { origin: HALSTED_POINTE_CENTRE } to have it round (0, 0, 0). Heights are from the terrace (y 0).
// It needs a browser (or another DOM with <canvas>): the facades are painted on canvas textures.
export const HALSTED_POINTE_CENTRE = [-87.64677, 41.89899];
const FILM_ORIGIN = [-87.620063, 41.863968];

// [lon, lat] rings (the closing node left off). SITE and PHASE1 are OpenStreetMap's ways 1187740901 and 1561094811
// (PHASE1 from its north-west corner, down Halsted, then east: only that corner and the Halsted side are used); the rest
// come from the City's deck (see the top).
const SITE = [[-87.647792,41.899947],[-87.646376,41.899985],[-87.645505,41.898385],[-87.645431,41.898245],[-87.645603,41.898054],[-87.645769,41.898069],[-87.645792,41.898089],[-87.64764,41.898256],[-87.647699,41.898253],[-87.647701,41.898329],[-87.647726,41.898329],[-87.647726,41.898359],[-87.647741,41.898718],[-87.647753,41.899006],[-87.647788,41.89986],[-87.64779,41.899906]];
const PHASE1 = [[-87.647733,41.899864],[-87.647692,41.898979],[-87.646981,41.898997],[-87.647022,41.899882]];
// B1, B2, C1, C2: the towers' glass lines (C2_N, C2_S: C2's full-height part and its lower south wing); POD_B, POD_C: the
// podiums' levels 3-7; GROUND_*: levels 1-2 under them; HOTEL: its bar (levels 1-12), HOTEL_RETAIL its one-story wing
const PLAN = {
  B1: [[-87.646956,41.899841],[-87.646995,41.899832],[-87.647002,41.899847],[-87.647039,41.899839],[-87.646989,41.899711],[-87.646971,41.899714],[-87.646952,41.899665],[-87.646949,41.89965],[-87.646963,41.899646],[-87.646955,41.899625],[-87.646937,41.899628],[-87.646897,41.899527],[-87.646804,41.899547],[-87.64681,41.899577],[-87.646735,41.899593],[-87.646732,41.899611],[-87.64666,41.899625],[-87.646663,41.899637],[-87.646654,41.899643],[-87.646577,41.89966],[-87.646565,41.899655],[-87.646532,41.899662],[-87.6466,41.899856],[-87.646627,41.899903],[-87.64694,41.899833],[-87.646953,41.899834]],
  B2: [[-87.647046,41.899236],[-87.647034,41.89921],[-87.647,41.899182],[-87.646972,41.899131],[-87.646969,41.899089],[-87.646948,41.899061],[-87.646936,41.899064],[-87.646944,41.899079],[-87.646846,41.899108],[-87.64671,41.899133],[-87.646615,41.89917],[-87.646523,41.89916],[-87.646371,41.899182],[-87.646283,41.899184],[-87.64626,41.899173],[-87.646254,41.899179],[-87.646252,41.899196],[-87.646276,41.899243],[-87.646278,41.899298],[-87.646269,41.899314],[-87.646278,41.899357],[-87.646276,41.899349],[-87.646313,41.899344],[-87.64639,41.899344],[-87.646394,41.899357],[-87.646472,41.899359],[-87.646666,41.899354],[-87.646897,41.899286],[-87.646922,41.899276],[-87.646914,41.899261],[-87.647021,41.899229],[-87.647032,41.899244]],
  C1: [[-87.646353,41.898693],[-87.646329,41.898691],[-87.646306,41.898639],[-87.646289,41.898642],[-87.646281,41.898635],[-87.646255,41.898579],[-87.646261,41.89857],[-87.646249,41.898546],[-87.645993,41.898606],[-87.645932,41.898629],[-87.646042,41.898859],[-87.646041,41.898868],[-87.646032,41.898871],[-87.646046,41.898899],[-87.646027,41.898905],[-87.64604,41.898932],[-87.646208,41.898888],[-87.646203,41.898875],[-87.646268,41.898858],[-87.646288,41.898855],[-87.646294,41.898866],[-87.646321,41.898858],[-87.646316,41.898845],[-87.646449,41.89881],[-87.646418,41.898742],[-87.646378,41.898749]],
  C2: [[-87.647069,41.898855],[-87.647064,41.898846],[-87.647044,41.898852],[-87.647007,41.898779],[-87.646975,41.898676],[-87.646928,41.898605],[-87.646943,41.898537],[-87.646927,41.898493],[-87.646915,41.898357],[-87.64693,41.89834],[-87.646899,41.898334],[-87.646835,41.89835],[-87.646762,41.898351],[-87.646741,41.898344],[-87.646683,41.89835],[-87.646694,41.898349],[-87.6467,41.898377],[-87.646699,41.898434],[-87.646681,41.898437],[-87.646676,41.898495],[-87.646681,41.89864],[-87.646767,41.898813],[-87.646781,41.898832],[-87.646801,41.898827],[-87.646842,41.898907],[-87.646822,41.898914],[-87.646826,41.898922],[-87.646868,41.898917],[-87.646904,41.898892],[-87.646974,41.898872],[-87.64703,41.898871]],
  C2_N: [[-87.646927,41.898493],[-87.646926,41.898487],[-87.646677,41.898487],[-87.646676,41.898495],[-87.646681,41.89864],[-87.646767,41.898813],[-87.646781,41.898832],[-87.646801,41.898827],[-87.646842,41.898907],[-87.646822,41.898914],[-87.646826,41.898922],[-87.646868,41.898917],[-87.646904,41.898892],[-87.646974,41.898872],[-87.64703,41.898871],[-87.647069,41.898855],[-87.647064,41.898846],[-87.647044,41.898852],[-87.647007,41.898779],[-87.646975,41.898676],[-87.646928,41.898605],[-87.646943,41.898537]],
  C2_S: [[-87.646681,41.898437],[-87.646677,41.898487],[-87.646926,41.898487],[-87.646915,41.898357],[-87.64693,41.89834],[-87.646899,41.898334],[-87.646835,41.89835],[-87.646762,41.898351],[-87.646741,41.898344],[-87.646683,41.89835],[-87.646694,41.898349],[-87.6467,41.898377],[-87.646699,41.898434]],
  POD_B: [[-87.646986,41.899668],[-87.64696,41.89962],[-87.646934,41.899572],[-87.646908,41.899524],[-87.646882,41.899476],[-87.646856,41.899429],[-87.64683,41.899381],[-87.646805,41.899333],[-87.646805,41.899316],[-87.646858,41.899311],[-87.646903,41.899287],[-87.646944,41.899283],[-87.646955,41.899263],[-87.646976,41.899255],[-87.647012,41.899246],[-87.647031,41.899252],[-87.64705,41.899248],[-87.647043,41.899212],[-87.647025,41.899189],[-87.647006,41.899165],[-87.646993,41.899129],[-87.646979,41.899093],[-87.646949,41.89906],[-87.646933,41.899066],[-87.646931,41.899081],[-87.64688,41.899093],[-87.64683,41.899106],[-87.64678,41.899119],[-87.646754,41.899118],[-87.646719,41.899136],[-87.646677,41.899141],[-87.646667,41.899153],[-87.646636,41.899162],[-87.646589,41.899163],[-87.646582,41.899154],[-87.646533,41.899162],[-87.646496,41.899156],[-87.646491,41.899165],[-87.646432,41.899169],[-87.646372,41.899172],[-87.646312,41.899175],[-87.646277,41.899166],[-87.646265,41.899189],[-87.646265,41.899209],[-87.646284,41.899243],[-87.646282,41.899284],[-87.64628,41.899325],[-87.646291,41.899367],[-87.646312,41.899364],[-87.646313,41.899353],[-87.646352,41.899352],[-87.646391,41.899352],[-87.646393,41.899397],[-87.646396,41.899442],[-87.646422,41.89949],[-87.646449,41.899538],[-87.646475,41.899586],[-87.646501,41.899634],[-87.646528,41.899682],[-87.646554,41.89973],[-87.64658,41.899778],[-87.646607,41.899826],[-87.646633,41.899874],[-87.646659,41.899923],[-87.646722,41.899906],[-87.646784,41.899889],[-87.646847,41.899872],[-87.646901,41.899854],[-87.646956,41.899835],[-87.647019,41.899835],[-87.647028,41.899841],[-87.647059,41.899831],[-87.647039,41.899792],[-87.647019,41.899752],[-87.646998,41.899712],[-87.646971,41.899705],[-87.646963,41.899675]],
  POD_C: [[-87.646899,41.898343],[-87.646845,41.898359],[-87.646793,41.898357],[-87.64674,41.898355],[-87.646679,41.898363],[-87.646682,41.898374],[-87.646701,41.898381],[-87.646702,41.898409],[-87.646703,41.898438],[-87.646653,41.89844],[-87.646604,41.898443],[-87.646555,41.898445],[-87.646533,41.898413],[-87.646467,41.898433],[-87.6464,41.898453],[-87.646333,41.898473],[-87.646267,41.898493],[-87.6462,41.898513],[-87.646133,41.898533],[-87.646146,41.898575],[-87.646094,41.898591],[-87.646042,41.898606],[-87.64599,41.898621],[-87.645938,41.898637],[-87.645962,41.898681],[-87.645985,41.898726],[-87.646009,41.89877],[-87.646032,41.898815],[-87.646055,41.898859],[-87.646049,41.898877],[-87.646061,41.898904],[-87.646047,41.898913],[-87.646059,41.898936],[-87.646114,41.898921],[-87.646169,41.898906],[-87.646223,41.898891],[-87.646223,41.898876],[-87.64624,41.898868],[-87.64627,41.898866],[-87.646282,41.898881],[-87.646346,41.898862],[-87.64641,41.898843],[-87.646473,41.898824],[-87.646537,41.898804],[-87.646601,41.898785],[-87.646664,41.898766],[-87.646728,41.898747],[-87.646751,41.898747],[-87.646757,41.898787],[-87.646786,41.898816],[-87.646794,41.898849],[-87.646818,41.898851],[-87.646829,41.898869],[-87.646845,41.898901],[-87.646837,41.898915],[-87.646841,41.898929],[-87.646888,41.898924],[-87.646922,41.89891],[-87.646957,41.898895],[-87.647002,41.898886],[-87.647047,41.898877],[-87.647092,41.898854],[-87.647058,41.898828],[-87.647043,41.898793],[-87.647027,41.898758],[-87.647011,41.898724],[-87.647016,41.898707],[-87.646993,41.898686],[-87.646985,41.898651],[-87.646968,41.898643],[-87.646957,41.898619],[-87.646955,41.898587],[-87.646968,41.898579],[-87.646957,41.898542],[-87.646965,41.898516],[-87.646952,41.898511],[-87.646947,41.898467],[-87.646941,41.898422],[-87.646936,41.898378],[-87.646951,41.898352]],
  GROUND_B1: [[-87.647,41.899802],[-87.646879,41.89945],[-87.646554,41.899559],[-87.646689,41.899914]],
  GROUND_B2: [[-87.646989,41.899225],[-87.64685,41.899105],[-87.646583,41.89916],[-87.646379,41.899161],[-87.646344,41.899192],[-87.646356,41.899464],[-87.646397,41.899496],[-87.646647,41.899487],[-87.646676,41.899467],[-87.646671,41.899343],[-87.646946,41.899255]],
  GROUND_C1: [[-87.646446,41.898767],[-87.646402,41.898542],[-87.646365,41.898517],[-87.645989,41.898599],[-87.64605,41.898848]],
  GROUND_C2: [[-87.647,41.898885],[-87.646952,41.898785],[-87.647015,41.898751],[-87.646962,41.898588],[-87.646946,41.898417],[-87.646916,41.898396],[-87.64661,41.8984],[-87.646501,41.898413],[-87.646468,41.898439],[-87.64658,41.89862],[-87.646679,41.89861],[-87.646811,41.898902],[-87.646852,41.898914]],
  HOTEL: [[-87.647704,41.898926],[-87.647683,41.89842],[-87.647446,41.898425],[-87.647468,41.898932]],
  HOTEL_RETAIL: [[-87.647459,41.898741],[-87.647446,41.898425],[-87.64737,41.898427],[-87.647383,41.898743]],
  POOL_B: [[-87.646755,41.899373],[-87.646715,41.899385],[-87.646711,41.899392],[-87.646768,41.899503],[-87.646775,41.899511],[-87.646782,41.899511],[-87.646825,41.899497],[-87.646834,41.899485],[-87.646781,41.899383],[-87.646771,41.899374]],
  TERRACE_B: [[-87.646428,41.899384],[-87.646428,41.899435],[-87.646536,41.899635],[-87.646708,41.899585],[-87.64669,41.899549],[-87.646662,41.89955],[-87.646657,41.899542],[-87.646654,41.899523],[-87.64667,41.899514],[-87.646665,41.8995],[-87.64666,41.899495],[-87.646656,41.8995],[-87.64664,41.899499],[-87.646625,41.899483],[-87.646628,41.899472],[-87.646642,41.899463],[-87.646641,41.899456],[-87.646635,41.899447],[-87.646613,41.899447],[-87.646601,41.89943],[-87.646601,41.899421],[-87.646614,41.899412],[-87.64661,41.899386],[-87.646599,41.89938]],
  POOL_C: [[-87.646495,41.898467],[-87.646352,41.898511],[-87.646347,41.898521],[-87.646367,41.898558],[-87.64653,41.898511],[-87.646531,41.898502],[-87.646514,41.898473]],
  TERRACE_C: [[-87.646627,41.89856],[-87.646593,41.898571],[-87.646587,41.898591],[-87.646579,41.898595],[-87.646552,41.8986],[-87.64654,41.898588],[-87.64652,41.898592],[-87.646519,41.898611],[-87.646497,41.898621],[-87.646484,41.898619],[-87.646476,41.898609],[-87.646455,41.89861],[-87.64645,41.898636],[-87.646418,41.898643],[-87.646409,41.898628],[-87.6464,41.898628],[-87.646359,41.89864],[-87.646398,41.898715],[-87.646439,41.898713],[-87.646483,41.898793],[-87.646687,41.898733],[-87.646686,41.898722],[-87.646651,41.898665],[-87.646647,41.898574]],
  LAWN_COMMONS: [[-87.647351,41.898668],[-87.647337,41.898356],[-87.647019,41.898393],[-87.647041,41.898676]],
  LAWN_POINTE: [[-87.646334,41.898484],[-87.646267,41.898307],[-87.646142,41.898198],[-87.645934,41.898233],[-87.645822,41.898414],[-87.645729,41.89858],[-87.6458,41.898608]],
  STEPS: [[-87.645729,41.89858],[-87.645822,41.898414],[-87.645934,41.898233],[-87.645882,41.898189],[-87.645751,41.898394],[-87.64567,41.898597]],
  BEACH: [[-87.64567,41.898597],[-87.645751,41.898394],[-87.645882,41.898189],[-87.645917,41.898084],[-87.645597,41.898062],[-87.645435,41.898252]],
  PICKLE_1: [[-87.646592,41.899834],[-87.646586,41.8997],[-87.646466,41.899703],[-87.646472,41.899837]],
  PICKLE_2: [[-87.646854,41.898266],[-87.646851,41.898185],[-87.646621,41.898191],[-87.646625,41.898271]],
};
// each edge of the podiums: "b" brick and glass (homes), "f" the bronze fins (the garage), in ring order
const KINDS = {"POD_B": "bbbbfffbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbfffffbbbbbbbbbbbbbbbbbbbb", "POD_C": "bbbbbbbbbbbfbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbfffbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"};
const COURT_N = [-87.646934, 41.899438], COURT_N_R = 13;                     // the North Arrival Court's round drive: center, radius m

// Heights, m above the terrace (see the top)
const P1_FLOOR = (k) => k <= 1 ? 0 : k <= 6 ? 5.5 + (k - 2) * 3.575 : 19.8 + (k - 6) * 3.1625;   // Phase 1, floor k
const P1_ROOF = 149.5, P1_TOP = 151.5, P1_NORTH = 128.7, P1_SCREEN = 140.2, P1_TERRACE = 139, P1_PODIUM = 20.5;
const P1_SOUTH = 7.1;                       // Phase 1's north face, south of OSM's corner (HPA's 53'-4" setback)
const BASE = 9.1, DECK = 26.9, AMENITY = 32.9, STORY = 3.09;   // the later towers: levels 1-2, podium deck, level 9
const B1_TOP = 149.0, C1_TOP = 149.0, CROWN = [[0, 1], [7.6, 0.88], [5.2, 0.76], [2.6, 0.45]];   // [m below the top, scale]
const B2_ROOF = 168.1, B2_TOP = 171.9, C2_ROOF = 153.9, C2_TOP = 155.1, C2_WING = 124.9;
const HOTEL_L12 = 39.4, HOTEL_ROOF = 43.5, HOTEL_SLAB = 44.0, HOTEL_TOP = 46.3, HOTEL_WING = 6.5;

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// The site as a closed ring of local meters [x, z, x, z, ...], for clearing OpenStreetMap's buildings (every part of the
// model lies inside it)
export function halstedPointeSite(origin = FILM_ORIGIN) {
  const L = local(origin), r = SITE.flatMap(([lon, lat]) => L(lon, lat));
  return [[...r, r[0], r[1]]];
}

export function buildHalstedPointe({ THREE, origin = FILM_ORIGIN, phases = [1, 2, 3, 4] } = {}) {
  const want = new Set(phases);
  const L = local(origin), [cx, cz] = L(...HALSTED_POINTE_CENTRE), g = new THREE.Group();
  g.name = "Halsted Pointe"; g.position.set(cx, 0, cz);
  g.userData.site = halstedPointeSite(origin);
  const ring = (r) => r.map(([lon, lat]) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; });
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)

  // ---- geometry goes into one bucket per material, merged into a single mesh each at the end ----
  const BK = {};
  const bucket = (k) => BK[k] || (BK[k] = { pos: [], nor: [], uv: [], col: [] });
  // a triangle with per-vertex [x, y, z], uv and shade; wound so its front faces along n
  const tri = (k, a, b, c, n, ua = [0, 0], ub = [0, 0], uc = [0, 0], sa = 1, sb = 1, sc = 1) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const d = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
    if (d < 0) { [b, c] = [c, b]; [ub, uc] = [uc, ub]; [sb, sc] = [sc, sb]; }
    const B = bucket(k);
    for (const [p, u, s] of [[a, ua, sa], [b, ub, sb], [c, uc, sc]]) { B.pos.push(p[0], p[1], p[2]); B.nor.push(n[0], n[1], n[2]); B.uv.push(u[0], u[1]); B.col.push(s, s, s); }
  };
  const quad = (k, a, b, c, d, n, ua, ub, uc, ud, sa = 1, sb = 1, sc = 1, sd = 1) => { tri(k, a, b, c, n, ua, ub, uc, sa, sb, sc); tri(k, a, c, d, n, ua, uc, ud, sa, sc, sd); };
  const area2 = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
  const outward = (pts) => area2(pts) < 0 ? [...pts].reverse() : pts;   // so (dz, -dx) points out of every edge
  const glassShade = (y) => 0.86 + 0.24 * Math.min(1, y / 200);           // glass reflects more sky higher up
  // one wall panel from p to q (on the ring `out`, +1 if the ring runs so (dz, -dx) points out, else -1)
  const panel = (k, p, q, y0, y1, out, s0, uvOf, shade) => {
    const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
    if (l < 1e-6) return;
    const n = [out * dz / l, 0, -out * dx / l];
    quad(k, [p[0], y0, p[1]], [q[0], y0, q[1]], [q[0], y1, q[1]], [p[0], y1, p[1]], n,
      uvOf(s0, y0), uvOf(s0 + l, y0), uvOf(s0 + l, y1), uvOf(s0, y1), shade(y0), shade(y0), shade(y1), shade(y1));
  };
  // walls round a ring from y0 to y1, edge i in material keyOf(i, length) (or one material); uvOf(s, y) gives the uv
  // at s meters round the ring
  const walls = (k, pts, y0, y1, uvOf, shade = () => 1) => {
    const out = area2(pts) < 0 ? -1 : 1;
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      panel(typeof k === "function" ? k(i, l) : k, p, q, y0, y1, out, s, uvOf, shade);
      s += l;
    }
  };
  const tiled = (tw, th, vy0 = 0) => (s, y) => [s / tw, (y - vy0) / th];
  // a flat face over a ring at height y, facing up (or down), uv in meters / tile
  const cap = (k, pts, y, up = true, tile = 8) => {
    const c = pts.map(([x, z]) => new THREE.Vector2(x, z));
    const n = [0, up ? 1 : -1, 0];
    for (const t of THREE.ShapeUtils.triangulateShape(c, [])) {
      const [a, b, d] = t.map((i) => [c[i].x, y, c[i].y]);
      tri(k, a, b, d, n, [a[0] / tile, a[2] / tile], [b[0] / tile, b[2] / tile], [d[0] / tile, d[2] / tile]);
    }
  };
  const prism = (k, pts, y0, y1, uvOf, shade, roof = "roof", bottom = null) => {
    walls(k, pts, y0, y1, uvOf, shade);
    if (roof) cap(roof, pts, y1, true);
    if (bottom) cap(bottom, pts, y0, false);
  };
  // a convex ring moved out by d meters (its edges pushed out and met again)
  const grow = (pts, d) => {
    pts = outward(pts);
    const n = pts.length, lines = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], l = Math.hypot(q[0] - p[0], q[1] - p[1]); const nx = (q[1] - p[1]) / l, nz = -(q[0] - p[0]) / l; lines.push([p[0] + nx * d, p[1] + nz * d, q[0] - p[0], q[1] - p[1]]); }
    return lines.map((a, i) => {
      const b = lines[(i + n - 1) % n], den = a[2] * b[3] - a[3] * b[2];
      if (Math.abs(den) < 1e-9) return [a[0], a[1]];
      const t = ((b[0] - a[0]) * b[3] - (b[1] - a[1]) * b[2]) / den;
      return [a[0] + a[2] * t, a[1] + a[3] * t];
    });
  };
  // the part of a four-cornered ring [p0, p1, p2, p3] between fractions a0..a1 along p0->p1 and b0..b1 along p0->p3
  const sub = (r, a0, a1, b0, b1) => {
    const at = (a, b) => [0, 1].map((i) => r[0][i] * (1 - a) * (1 - b) + r[1][i] * a * (1 - b) + r[2][i] * a * b + r[3][i] * (1 - a) * b);
    return [at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)];
  };
  // a ring scaled about its center
  const shrink = (r, k) => { const m = r.reduce((s, p) => [s[0] + p[0] / r.length, s[1] + p[1] / r.length], [0, 0]); return r.map(([x, z]) => [m[0] + (x - m[0]) * k, m[1] + (z - m[1]) * k]); };

  // ---- the facades, each painted once on a canvas and repeated by the walls' uv ----
  const canvas = (draw, w = 512, h = 512) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  const sky = (c, x, y, w, h, tone, top = "#a9bccb") => { const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(0.35, tone); gr.addColorStop(1, tone); c.fillStyle = gr; c.fillRect(x, y, w, h); };
  // the aluminum and glass walls: light blue-gray glass, thin mullions, a slab line at each floor (6 m by two stories)
  const glassTex = canvas((c, W, H) => {
    const cols = 4, rows = 2, pw = W / cols, ph = H / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) sky(c, k * pw, r * ph, pw, ph, ["#8aa3b6", "#94acbe", "#839db1", "#9cb3c3"][Math.floor(rnd() * 4)], "#b9cad6");
    c.fillStyle = "#5e6c76"; for (let r = 0; r < rows; r++) c.fillRect(0, (r + 1) * ph - ph * 0.05, W, ph * 0.05);
    c.fillStyle = "#d6dee3"; for (let k = 0; k < cols; k++) c.fillRect(k * pw, 0, 3, H);
  });
  // B1's and C1's dark-framed grid: a bronze-black frame round two-story bays (a fin at each bay, a band every second
  // floor), dark glass set back behind balconies with picket guardrails (6 m by two stories)
  const frameTex = canvas((c, W, H) => {
    c.fillStyle = "#4d4743"; c.fillRect(0, 0, W, H);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
      const x = k * W / 2 + 16, y = r * H / 2 + 9, w = W / 2 - 32, h = H / 2 - 18;
      sky(c, x, y, w, h, ["#5a6874", "#62707c", "#55636f"][Math.floor(rnd() * 3)], "#8fa2b0");
      c.fillStyle = "rgba(0,0,0,0.22)"; c.fillRect(x, y, w, h * 0.2);                           // the slab above's shadow
      c.fillStyle = "#c3c7c8"; c.fillRect(x, y + h * 0.6, w, 5);                                   // the guardrail's top rail
      c.fillStyle = "rgba(195,199,200,0.7)"; for (let p = x; p < x + w; p += 7) c.fillRect(p, y + h * 0.6, 2, h * 0.4);   // pickets
      c.fillStyle = "#6a5644"; c.fillRect(x + w / 2 - 2, y, 4, h * 0.6);                            // a mullion
    }
    c.fillStyle = "#7a624c"; c.fillRect(0, 0, 9, H); c.fillRect(W / 2 - 5, 0, 10, H); c.fillRect(W - 9, 0, 9, H);   // the fins
    c.fillStyle = "#3e3530"; c.fillRect(0, 0, W, 9); c.fillRect(0, H / 2 - 3, W, 5);                         // the bands
  });
  // brick and glass (the podiums' homes): warm tan-brown brick piers and spandrels round paired windows (6 m by two
  // podium stories, 7.12 m; between the elevations' brown and the renderings' buff)
  const brickTex = canvas((c, W, H) => {
    c.fillStyle = "#97704f"; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 0 : 11; x < W; x += 22) { c.fillStyle = `rgba(${rnd() < 0.5 ? "255,230,210" : "40,20,10"},${0.05 + 0.07 * rnd()})`; c.fillRect(x, y, 20, 5); }
    for (let r = 0; r < 2; r++) for (const x0 of [W * 0.1, W * 0.55]) {
      const y = r * H / 2 + H * 0.07, h = H / 2 * 0.72;
      c.fillStyle = "#3e2c22"; c.fillRect(x0 - 5, y - 5, W * 0.35 + 10, h + 10);
      sky(c, x0, y, W * 0.35, h, "#4c5a65", "#93a5b2");
      c.fillStyle = "#3b2d22"; c.fillRect(x0 + W * 0.175 - 2, y, 4, h); c.fillRect(x0, y + h * 0.72, W * 0.35, 4);
    }
  });
  // the metal feature wall over the garages: bronze vertical fins, the parking dark between (3 m by 6 m)
  const metalTex = canvas((c, W, H) => {
    c.fillStyle = "#2a2622"; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 10; k++) {
      const x0 = k * W / 10 + 4 + rnd() * 6, w = W / 10 * (0.45 + 0.25 * rnd()), gr = c.createLinearGradient(x0, 0, x0 + w, 0);
      gr.addColorStop(0, "#b48a62"); gr.addColorStop(0.5, "#8c6a4c"); gr.addColorStop(1, "#5e4634"); c.fillStyle = gr; c.fillRect(x0, 0, w, H);
    }
  });
  // levels 1-2: shopfronts (lit rooms behind bronze mullions) under level 2's windows in brick (6 m by the 9.1 m base)
  const baseTex = canvas((c, W, H) => {
    const sf = H * 0.6;                                                                               // the shopfronts' 5.5 m
    const gr = c.createLinearGradient(0, H - sf, 0, H); gr.addColorStop(0, "#8ea2b1"); gr.addColorStop(0.35, "#5a6b78"); gr.addColorStop(0.6, "#8a7158"); gr.addColorStop(1, "#c9a777");
    c.fillStyle = gr; c.fillRect(0, H - sf, W, sf);
    for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(40,30,22,${0.15 + 0.2 * rnd()})`; c.fillRect(k * W / 4 + 20 + rnd() * 40, H - sf * 0.38, 30 + rnd() * 50, sf * 0.38); }
    c.fillStyle = "#2d2925"; for (let k = 0; k < 4; k++) c.fillRect(k * W / 4, H - sf, 6, sf); c.fillRect(0, H - sf * 0.72, W, 4);
    c.fillStyle = "#8a6549"; c.fillRect(0, 0, W, H - sf);
    for (const x0 of [W * 0.08, W * 0.55]) { sky(c, x0, H * 0.08, W * 0.37, H * 0.24, "#4f5d68", "#8fa1ae"); c.fillStyle = "#3b2d22"; c.fillRect(x0 + W * 0.185 - 2, H * 0.08, 4, H * 0.24); }
    c.fillStyle = "#3a2e24"; c.fillRect(0, H - sf - 8, W, 8);
  });
  // the hotel: charcoal glazed brick piers framing two-story windows, a bronze band at each floor (7.5 m by 7.2 m)
  const hotelTex = canvas((c, W, H) => {
    c.fillStyle = "#43464d"; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 0 : 12; x < W; x += 24) { c.fillStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "0,0,0"},${0.04 + 0.06 * rnd()})`; c.fillRect(x, y, 22, 5); }   // the glazed brick
    const px = W * 0.18, top = H * 0.07;
    c.fillStyle = "#2f3136"; c.fillRect(px - 8, top - 8, W - 2 * px + 16, H - top - H * 0.04 + 16);   // the reveal
    sky(c, px, top, W - 2 * px, H - top - H * 0.04, "#6a7c8a", "#b0c0cc");
    c.fillStyle = "#8a6a4e"; c.fillRect(px, H / 2 - 7, W - 2 * px, 14);                 // the bronze band at the floor between
    for (const f of [1 / 3, 2 / 3]) c.fillRect(px + (W - 2 * px) * f - 3, top, 6, H - top - H * 0.04);   // mullions
  });
  // shopfronts: lit interiors behind bronze mullions, a transom, a dark band at the top (6 m by 6 m)
  const storeTex = canvas((c, W, H) => {
    // glass reflecting the street above, lit rooms behind it lower down
    const gr = c.createLinearGradient(0, H * 0.12, 0, H); gr.addColorStop(0, "#8ea2b1"); gr.addColorStop(0.35, "#5a6b78"); gr.addColorStop(0.6, "#8a7158"); gr.addColorStop(1, "#c9a777");
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(40,30,22,${0.15 + 0.2 * rnd()})`; c.fillRect(k * W / 4 + 20 + rnd() * 40, H * 0.62, 30 + rnd() * 50, H * 0.38); }
    c.fillStyle = "#33302c"; c.fillRect(0, 0, W, H * 0.12); c.fillRect(0, H * 0.3, W, 5);   // the band over the shops, a transom
    c.fillStyle = "#2d2925"; for (let k = 0; k < 4; k++) c.fillRect(k * W / 4, 0, 6, H);
  });
  // vertical metal panels, champagne (the mechanical screens; 4 m by 6 m)
  const screenTex = canvas((c, W, H) => {
    for (let k = 0; k < 16; k++) { const gr = c.createLinearGradient(k * W / 16, 0, (k + 1) * W / 16, 0); gr.addColorStop(0, "#e2d8c2"); gr.addColorStop(0.6, "#b8ab90"); gr.addColorStop(1, "#8d8270"); c.fillStyle = gr; c.fillRect(k * W / 16, 0, W / 16, H); }
  });
  // Phase 1's podium: champagne fins in three folded bands over floors 2-5 (3 m wide, the band's height)
  // (each fin a lit face and a shaded one, 0.19 m apart; the bands' depths are geometry, below)
  const finsTex = canvas((c, W, H) => {
    for (let k = 0; k < 16; k++) {
      const x0 = k * W / 16, x1 = (k + 1) * W / 16, gr = c.createLinearGradient(x0, 0, x1, 0);
      gr.addColorStop(0, "#ece2cc"); gr.addColorStop(0.45, "#d2c6aa"); gr.addColorStop(0.5, "#8c8170"); gr.addColorStop(1, "#a89c84");
      c.fillStyle = gr; c.fillRect(x0, 0, x1 - x0, H);
    }
    c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, H - 6, W, 6); c.fillStyle = "rgba(255,255,255,0.25)"; c.fillRect(0, 0, W, 4);
  });
  // metal picket guardrails: a top rail and pickets, open between (1 m wide, the rail's 1.07 m high)
  const picketTex = canvas((c, W, H) => {
    c.clearRect(0, 0, W, H); c.fillStyle = "#d5d8d8"; c.fillRect(0, 0, W, H * 0.09); c.fillRect(0, H * 0.9, W, H * 0.1);
    for (let k = 0; k < 8; k++) c.fillRect(k * W / 8, 0, W / 8 * 0.22, H);
  }, 128, 128);

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const MATS = {
    p1: null,   // (below: its atlas)
    fins: std({ map: finsTex, roughness: 0.45, metalness: 0.45 }),
    store: std({ map: storeTex, roughness: 0.35, metalness: 0.15 }),
    glass: std({ map: glassTex, roughness: 0.2, metalness: 0.3, vertexColors: true }),
    frame: std({ map: frameTex, roughness: 0.55, metalness: 0.1, vertexColors: true }),
    brick: std({ map: brickTex, roughness: 0.85 }),
    metal: std({ map: metalTex, roughness: 0.45, metalness: 0.5 }),
    base: std({ map: baseTex, roughness: 0.6, metalness: 0.1 }),
    hotel: std({ map: hotelTex, roughness: 0.7, metalness: 0.05, vertexColors: true }),
    screen: std({ map: screenTex, roughness: 0.45, metalness: 0.45 }),
    slab: std({ color: 0xeeede8, roughness: 0.6 }),
    soffit: std({ color: 0xcfb08a, roughness: 0.7 }),        // the undulating balconies' warm undersides (the renderings)
    soffitLight: std({ color: 0xd9d9d4, roughness: 0.7 }),
    rail: std({ color: 0xcfdde4, transparent: true, opacity: 0.32, roughness: 0.1, metalness: 0.3, side: THREE.DoubleSide, depthWrite: false }),
    picket: std({ map: picketTex, alphaTest: 0.4, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }),
    roof: std({ color: 0x8f9396, roughness: 0.9 }),
    deck: std({ color: 0xa98b68, roughness: 0.85 }),
    green: std({ color: 0x6a8a4c, roughness: 1 }),
    water: std({ color: 0x4fb0c6, roughness: 0.12, metalness: 0.1 }),
    bronze: std({ color: 0x8c6b4f, roughness: 0.45, metalness: 0.5 }),
    paving: std({ color: 0xc8c0b0, roughness: 0.95 }),
    lawn: std({ color: 0x7f9256, roughness: 1 }),
    sand: std({ color: 0xe2d2ab, roughness: 1 }),
    stone: std({ color: 0xbab2a0, roughness: 0.9 }),
    court: std({ color: 0x2f5a8a, roughness: 0.9 }),
    pavers: std({ color: 0x8f8c87, roughness: 0.95 }),
    trunk: std({ color: 0x605747, roughness: 1 }),
    canopy: std({ color: 0xffffff, roughness: 0.95, vertexColors: true }),
  };

  // Phase 1's frame: from OSM's north-west corner, u meters east (square to Halsted), v meters south along Halsted, its
  // north face P1_SOUTH south of that corner
  const P1R = ring(PHASE1), P1O = P1R[0], P1L = Math.hypot(P1R[1][0] - P1O[0], P1R[1][1] - P1O[1]);
  const P1T = [(P1R[1][0] - P1O[0]) / P1L, (P1R[1][1] - P1O[1]) / P1L], P1S = [P1T[1], -P1T[0]];
  const at = (u, v) => [P1O[0] + u * P1S[0] + (v + P1_SOUTH) * P1T[0], P1O[1] + u * P1S[1] + (v + P1_SOUTH) * P1T[1]];
  const box = (u0, u1, v0, v1) => [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];

  // ---- Phase 1 (Subarea A, HPA) ----
  if (want.has(1)) {
    // the tower's glass line (the balconies stand out 1.3-1.4 m to the 125 x 118 ft of the typical floor)
    const U0 = 1.3, U1 = 36.8, V0 = 1.4, V1 = 34.6, VN = 14;              // VN: the north third steps down
    const W = U1 - U0, D = V1 - V0;
    // each face's two corner balcony stacks run from its corners to fractions a and b of it; the plain glass between
    // (the lighter glass) narrows downward on the north and south faces and widens on the east and west, so the
    // angled planes turn as the tower rises
    const uLR = (f, y) => { const k = Math.min(1, Math.max(0, (y - 20) / 120)), w = f % 2 === 0 ? 0.16 + 0.16 * k : 0.34 - 0.14 * k; return [0.5 - w, 0.5 + w]; };
    // the atlas: the four faces side by side (N, E, S, W, each a quarter), the tower's full height up the canvas
    const AW = 2048, AH = 2048;
    const atlas = canvas((c) => {
      for (let f = 0; f < 4; f++) {
        const x0 = f * AW / 4, fw = AW / 4, len = f % 2 ? D : W, cols = Math.round(len / 1.5), pw = fw / cols;
        const yPx = (y) => AH - y / P1_ROOF * AH;
        for (let k = 1; k <= 46; k++) {
          const ya = P1_FLOOR(k), yb = k < 46 ? P1_FLOOR(k + 1) : P1_ROOF, top = yPx(yb), h = yPx(ya) - top;
          const [a, b] = uLR(f, (ya + yb) / 2);
          for (let col = 0; col < cols; col++) {
            const m = (col + 0.5) / cols, inMid = m > a && m < b;
            const tone = inMid ? ["#9cafbf", "#a5b7c6", "#95a9ba"][Math.floor(rnd() * 3)] : ["#24405f", "#2b4868", "#213b58"][Math.floor(rnd() * 3)];
            sky(c, x0 + col * pw, top, pw, h, tone, inMid ? "#cbd7e0" : "#5f7c97");
            if (!inMid && k >= 7) { c.fillStyle = "rgba(10,16,24,0.35)"; c.fillRect(x0 + col * pw, top, pw, h * 0.35); c.fillStyle = "rgba(205,218,226,0.22)"; c.fillRect(x0 + col * pw, top + h * 0.62, pw, h * 0.38); }
          }
          c.fillStyle = "#1d2a36"; c.fillRect(x0, top + h - 2, fw, 2);              // the slab edge
          // the angled mullions: the edges of the lighter plane, slanting with it
          c.fillStyle = "#c9d3da"; c.fillRect(x0 + a * fw - 2, top, 4, h); c.fillRect(x0 + b * fw - 2, top, 4, h);
          if (f % 2 && k >= 7) { c.fillStyle = "#34444f"; c.fillRect(x0 + fw * 0.46, top, fw * 0.08, h); c.fillStyle = "rgba(205,216,224,0.55)"; c.fillRect(x0 + fw * 0.46, top + h * 0.6, fw * 0.08, 4); c.fillStyle = "#cfd8de"; c.fillRect(x0 + fw * 0.46, top + h - 5, fw * 0.08, 3); }   // the inset balconies' slot
        }
        c.fillStyle = "rgba(210,220,226,0.55)"; for (let col = 0; col <= cols; col++) c.fillRect(x0 + col * pw - 1, 0, 2, AH);   // mullions
      }
    }, AW, AH);
    atlas.wrapS = atlas.wrapT = THREE.ClampToEdgeWrapping;
    MATS.p1 = std({ map: atlas, roughness: 0.22, metalness: 0.3, vertexColors: true });
    // a glass block of the tower, its faces textured from the atlas by where they lie on the full faces
    const p1Block = (u0, u1, v0, v1, y0, y1, ySouth = y0) => {
      const fa = [(u) => (u - U0) / W, (v) => (v - V0) / D, (u) => (U1 - u) / W, (v) => (V1 - v) / D];
      const faces = [[[u0, v0], [u1, v0], 0], [[u1, v0], [u1, v1], 1], [[u1, v1], [u0, v1], 2], [[u0, v1], [u0, v0], 3]];
      for (const [[ua, va], [ub, vb], f] of faces) {
        const pa = at(ua, va), pb = at(ub, vb), dx = pb[0] - pa[0], dz = pb[1] - pa[1], l = Math.hypot(dx, dz), n = [dz / l, 0, -dx / l];
        const yb = f === 2 ? ySouth : y0;
        const A = fa[f](f % 2 ? va : ua), B = fa[f](f % 2 ? vb : ub);
        const U = (a) => (f + 0.002 + 0.996 * a) / 4, Vv = (y) => y / P1_ROOF;
        quad("p1", [pa[0], yb, pa[1]], [pb[0], yb, pb[1]], [pb[0], y1, pb[1]], [pa[0], y1, pa[1]], n,
          [U(A), Vv(yb)], [U(B), Vv(yb)], [U(B), Vv(y1)], [U(A), Vv(y1)], glassShade(yb), glassShade(yb), glassShade(y1), glassShade(y1));
      }
      cap("roof", box(u0, u1, v0, v1), y1, true);
    };
    p1Block(U0, U1, V0, V1, 0, P1_NORTH, P1_PODIUM);
    p1Block(U0, U1, VN, V1, P1_NORTH, P1_TERRACE);
    const UT0 = U0 + 0.18 * W, UT1 = U1 - 0.18 * W;                       // the top floors: the middle, its corners terraces
    p1Block(UT0, UT1, VN, V1, P1_TERRACE, P1_ROOF);
    // the mechanical screens: over the north third (422-460 ft) and the roof's (to 497 ft), vertical metal panels
    prism("screen", box(U0 + 0.9, U1 - 0.9, V0 + 0.9, VN), P1_NORTH, P1_SCREEN, tiled(4, 6), undefined, "roof");
    prism("screen", box(UT0 + 2, UT1 - 2, VN + 2.5, V1 - 2.5), P1_ROOF, P1_TOP, tiled(4, 6), undefined, "roof");
    // the terraces' planters and rails
    // (rails on the three open sides only: the fourth is the glass of the floors above)
    for (const [a, b, out] of [[U0, UT0, U0 + 0.3], [UT1, U1, U1 - 0.3]]) {
      cap("deck", box(a, b, VN, V1), P1_TERRACE + 0.02, true);
      const o0 = out < (a + b) / 2 ? a + 0.3 : b - 1.5, o1 = o0 + 1.2;
      prism("green", box(o0, o1, VN + 0.4, V1 - 0.4), P1_TERRACE, P1_TERRACE + 0.9, () => [0, 0], undefined, "green");
      prism("green", box(Math.min(a, b) + 0.4, Math.max(a, b) - 0.4, V1 - 1.6, V1 - 0.4), P1_TERRACE, P1_TERRACE + 0.9, () => [0, 0], undefined, "green");
      const x = out < (a + b) / 2 ? a : b, inner = out < (a + b) / 2 ? b : a;
      for (const [p, q] of [[at(x, VN), at(x, V1)], [at(x, V1), at(inner, V1)], [at(inner, VN), at(x, VN)]]) {
        const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
        quad("rail", [p[0], P1_TERRACE, p[1]], [q[0], P1_TERRACE, q[1]], [q[0], P1_TERRACE + 1.1, q[1]], [p[0], P1_TERRACE + 1.1, p[1]], [dz / l, 0, -dx / l], [0, 0], [0, 0], [0, 0], [0, 0]);
      }
    }
    // the balcony stacks: a slab 0.22 m thick and a glass rail at each floor, at the corners of each face, out to the
    // balcony line; each face's first stack also covers the corner past its start
    const corners = [[U0, V0], [U1, V0], [U1, V1], [U0, V1]];
    for (let f = 0; f < 4; f++) {
      const [ua, va] = corners[f], [ub, vb] = corners[(f + 1) % 4], len = f % 2 ? D : W;
      const e = [(ub - ua) / len, (vb - va) / len], nrm = [e[1], -e[0]];       // along the face, and out (u, v)
      const dep = f % 2 ? 1.3 : 1.4;
      for (let k = 7; k <= 45; k++) {
        const y = P1_FLOOR(k), [a, b] = uLR(f, y + 1.6);
        // where the crown steps: no balconies over the north third above it, none over the corners above the terraces
        const northEnd = (frac) => (f === 0) || (f === 1 && frac < 0.5) || (f === 3 && frac > 0.5);
        for (const [f0, f1] of [[-dep / len, a], [b, 1]]) {
          const mid = (f0 + f1) / 2;
          if (northEnd(mid) ? y > P1_NORTH - 3.2 : y > P1_TERRACE - 3.2) continue;
          if (f1 - f0 < 0.02) continue;
          const p0 = [ua + e[0] * f0 * len, va + e[1] * f0 * len], p1 = [ua + e[0] * f1 * len, va + e[1] * f1 * len];
          const q0 = [p0[0] + nrm[0] * dep, p0[1] + nrm[1] * dep], q1 = [p1[0] + nrm[0] * dep, p1[1] + nrm[1] * dep];
          const R = [at(...p0), at(...p1), at(...q1), at(...q0)];
          slab(R, y, 0.22, [1, 2, 3]);
        }
      }
    }
    // the podium: a glass storefront, the folded champagne fins over floors 2-5, and the sixth-floor pool deck
    const pod = box(0.4, 39.1, V1, 76.8);
    walls("store", pod, 0, 5.5, tiled(6, 6));
    // three bands of fins, the middle one folded out furthest; their ledges and soffits champagne too
    const BANDS = [[5.5, 10.5, 0.25], [10.5, 15.5, 0.8], [15.5, P1_PODIUM, 0.4]];
    for (const [y0, y1, d] of BANDS) {
      const r = grow(pod, d).map(([x, z]) => [x, z]);
      walls("fins", r, y0, y1, (s2, y) => [s2 / 3, (y - y0) / (y1 - y0)]);
      cap("screen", r, y1, true); cap("screen", r, y0, false);
    }
    cap("deck", pod, P1_PODIUM + 0.03, true);
    walls("rail", box(0.4, 39.1, V1, 76.8), P1_PODIUM, P1_PODIUM + 1.1, () => [0, 0]);
    cap("water", box(9, 21, 50, 68), P1_PODIUM + 0.06, true);
    for (const [a, b, c2, d] of [[3, 7, 40, 74], [32, 36, 40, 74], [7, 32, 71, 74]]) prism("green", box(a, b, c2, d), P1_PODIUM, P1_PODIUM + 0.8, () => [0, 0], undefined, "green");
  }

  // ---- a slab: a ring [p0, p1, p2, p3] (p0-p1 against the building), 0.22 m thick, with a glass rail on the edges
  //      listed in `railEdges` (edge i runs from point i to i+1) ----
  function slab(R, y, th, railEdges) {
    cap("slab", R, y + th, true); cap("soffitLight", R, y, false);
    const pts = outward(R);
    walls("slab", R, y, y + th, () => [0, 0]);
    for (const i of railEdges) {
      const a = R[i], b = R[(i + 1) % R.length], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      if (l < 1e-3) continue;
      quad("rail", [a[0], y + th, a[1]], [b[0], y + th, b[1]], [b[0], y + th + 1.07, b[1]], [a[0], y + th + 1.07, a[1]], [dz / l, 0, -dx / l], [0, 0], [0, 0], [0, 0], [0, 0]);
    }
    return pts;
  }

  // ---- the later towers ----
  const typical = (y0, y1) => { const f = []; for (let y = AMENITY; y < y1 - 0.5; y += STORY) if (y >= y0 - 0.01) f.push(y); return f; };
  // walls of the aluminum and glass, or (B1, C1) with the dark-framed grid over the middle 70% of each face of 8 m or
  // more (the short jogs between them stay glass)
  const towerWalls = (r, y0, y1, framed) => {
    const out = area2(r) < 0 ? -1 : 1, uv = tiled(6, 2 * STORY, AMENITY);
    let s = 0;
    for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const cuts = framed && l >= 8 ? [[0, 0.15, "glass"], [0.15, 0.85, "frame"], [0.85, 1, "glass"]] : [[0, 1, "glass"]];
      for (const [a, b, k] of cuts) {
        const pa = [p[0] + (q[0] - p[0]) * a, p[1] + (q[1] - p[1]) * a], pb = [p[0] + (q[0] - p[0]) * b, p[1] + (q[1] - p[1]) * b];
        panel(k, pa, pb, y0, y1, out, s + l * a, uv, glassShade);
      }
      s += l;
    }
    cap("roof", r, y1, true);
  };
  // corner balconies (B1, C1): at each outer corner with long enough sides, an L of slab `len` m along both faces, `dep`
  // m out, with a metal picket guardrail
  const cornerBalconies = (r0, floors, len = 4.5, dep = 1.5) => {
    const pts = outward(r0), n = pts.length;
    for (let i = 0; i < n; i++) {
      const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n];
      const la = Math.hypot(A[0] - P[0], A[1] - P[1]), lb = Math.hypot(B[0] - P[0], B[1] - P[1]);
      if (la < len + 1.5 || lb < len + 1.5) continue;
      const ea = [(A[0] - P[0]) / la, (A[1] - P[1]) / la], eb = [(B[0] - P[0]) / lb, (B[1] - P[1]) / lb];
      if (ea[0] * eb[1] - ea[1] * eb[0] < 0.3) continue;                     // (outer corners only)
      const outA = [-ea[1], ea[0]], outB = [eb[1], -eb[0]];                   // out of the edge from A, and of the edge to B
      const dot = outA[0] * outB[0] + outA[1] * outB[1], m = [(outA[0] + outB[0]) * dep / (1 + dot), (outA[1] + outB[1]) * dep / (1 + dot)];
      const a1 = [P[0] + ea[0] * len, P[1] + ea[1] * len], b1 = [P[0] + eb[0] * len, P[1] + eb[1] * len];
      const L6 = [a1, [a1[0] + outA[0] * dep, a1[1] + outA[1] * dep], [P[0] + m[0], P[1] + m[1]], [b1[0] + outB[0] * dep, b1[1] + outB[1] * dep], b1, P];
      for (const y of floors) {
        const th = 0.22;
        cap("slab", L6, y + th, true); cap("soffitLight", L6, y, false);
        for (let j = 0; j < 4; j++) {
          const a = L6[j], b = L6[j + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
          let nn = [dz / l, 0, -dx / l];
          const cxm = (a[0] + b[0]) / 2 - P[0] - m[0] / 2, czm = (a[1] + b[1]) / 2 - P[1] - m[1] / 2;
          if (nn[0] * cxm + nn[2] * czm < 0) nn = [-nn[0], 0, -nn[2]];
          quad("slab", [a[0], y, a[1]], [b[0], y, b[1]], [b[0], y + th, b[1]], [a[0], y + th, a[1]], nn, [0, 0], [0, 0], [0, 0], [0, 0]);
          quad("picket", [a[0], y + th, a[1]], [b[0], y + th, b[1]], [b[0], y + th + 1.07, b[1]], [a[0], y + th + 1.07, a[1]], nn, [0, 0], [l, 0], [l, 1], [0, 1]);
        }
      }
    }
  };
  // undulating balconies (B2, C2): at each floor a slab round the whole ring, its depth swelling and shrinking along the
  // faces (to nothing in places: the setbacks), the waves shifting floor by floor; the corners always deep
  const waveBalconies = (r, floors, phase, maxDep = 1.7) => {
    const pts = outward(r), n = pts.length, samples = [];
    let per = 0;
    for (let i = 0; i < n; i++) per += Math.hypot(pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1]);
    const waves = Math.round(per / 10.5), lam = per / waves;
    let s = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz), nx = dz / l, nz = -dx / l;
      const pp = pts[(i + n - 1) % n], pl = Math.hypot(p[0] - pp[0], p[1] - pp[1]), pnx = (p[1] - pp[1]) / pl, pnz = -(p[0] - pp[0]) / pl;
      const turn = pnx * nz - pnz * nx;                                     // (round the outer corners only)
      if (turn < -0.05 || turn > 0.05) for (let k = 0; k <= 4; k++) {
        const f = k / 4, ax = pnx * (1 - f) + nx * f, az = pnz * (1 - f) + nz * f, al = Math.hypot(ax, az);
        samples.push({ x: p[0], z: p[1], nx: ax / al, nz: az / al, s, corner: turn > 0.3 });
      }
      const m = Math.max(1, Math.round(l / 1.5));
      for (let j = turn < -0.05 || turn > 0.05 ? 1 : 0; j < m; j++) samples.push({ x: p[0] + dx * j / m, z: p[1] + dz * j / m, nx, nz, s: s + l * j / m, corner: false, edge: Math.min(j, m - j) * l / m });
      s += l;
    }
    samples.push({ ...samples[0], s: per });
    const th = 0.24, H = 1.07;
    floors.forEach((y) => {
      const fl = Math.round((y - AMENITY) / STORY), ph = phase + fl * 0.55 + 0.9 * Math.sin(fl * 0.23);
      const depth = (q) => {
        let d = Math.max(0, -0.25 + (maxDep + 0.25) * (0.5 + 0.5 * Math.sin(2 * Math.PI * q.s / lam + ph)));
        const near = q.corner ? 0 : q.edge === undefined ? 9 : q.edge;
        if (near < 3.5) d = Math.max(d, maxDep * (1 - near / 3.5) + d * near / 3.5);
        return d;
      };
      for (let j = 0; j + 1 < samples.length; j++) {
        const a = samples[j], b = samples[j + 1], da = depth(a), db = depth(b);
        if (da < 0.05 && db < 0.05) continue;
        const ia = [a.x - a.nx * 0.05, a.z - a.nz * 0.05], ib = [b.x - b.nx * 0.05, b.z - b.nz * 0.05];
        const oa = [a.x + a.nx * da, a.z + a.nz * da], ob = [b.x + b.nx * db, b.z + b.nz * db];
        quad("slab", [ia[0], y + th, ia[1]], [ib[0], y + th, ib[1]], [ob[0], y + th, ob[1]], [oa[0], y + th, oa[1]], [0, 1, 0], [0, 0], [0, 0], [0, 0], [0, 0]);
        quad("soffit", [ia[0], y, ia[1]], [ib[0], y, ib[1]], [ob[0], y, ob[1]], [oa[0], y, oa[1]], [0, -1, 0], [0, 0], [0, 0], [0, 0], [0, 0]);
        const ex = ob[0] - oa[0], ez = ob[1] - oa[1], el = Math.hypot(ex, ez) || 1;
        let nn = [ez / el, 0, -ex / el];
        if (nn[0] * a.nx + nn[2] * a.nz < 0) nn = [-nn[0], 0, -nn[2]];
        if (el < 1e-3) nn = [a.nx, 0, a.nz];
        quad("slab", [oa[0], y, oa[1]], [ob[0], y, ob[1]], [ob[0], y + th, ob[1]], [oa[0], y + th, oa[1]], nn, [0, 0], [0, 0], [0, 0], [0, 0]);
        if (da > 0.4 && db > 0.4) quad("picket", [oa[0], y + th, oa[1]], [ob[0], y + th, ob[1]], [ob[0], y + th + H, ob[1]], [oa[0], y + th + H, oa[1]], nn, [0, 0], [el, 0], [el, 1], [0, 1]);
      }
    });
  };
  // a podium: levels 1-2 (shopfronts and brick) on the ground floors' outlines; levels 3-7 on the podium's, brick and glass
  // where it holds homes and bronze fins over the garage, its underside showing where it spans the walks; the deck on
  // top with glass guardrails at its edge, the pools and the roof terraces
  const podium = (key, grounds, pool, terrace) => {
    for (const k of grounds) prism("base", T(k), 0, BASE, (s, y) => [s / 6, y / BASE], undefined, "roof");
    const r = T(key), kinds = KINDS[key];
    walls((i) => kinds[i] === "f" ? "metal" : "brick", r, BASE, DECK, (s, y) => [s / 6, (y - BASE) / (2 * (DECK - BASE) / 5)]);
    cap("soffitLight", r, BASE, false); cap("deck", r, DECK, true);
    walls("rail", r, DECK, DECK + 1.1, () => [0, 0]);
    cap("water", T(pool), DECK + 0.06, true); cap("green", T(terrace), DECK + 0.05, true);
  };
  const T = (k) => ring(PLAN[k]);
  // a tower's crown (B1, C1): the body, then three steps (CROWN: meters below the top, and the scale about the center)
  const zigguratTower = (r, top) => {
    let y0 = DECK;
    CROWN.forEach(([below, k], i) => {
      const y1 = i + 1 < CROWN.length ? top - CROWN[i + 1][0] : top;
      towerWalls(shrink(r, k), y0, y1, i === 0);
      y0 = y1;
    });
  };

  if (want.has(2)) {
    podium("POD_B", ["GROUND_B1", "GROUND_B2"], "POOL_B", "TERRACE_B");
    const b1 = T("B1"), b2 = T("B2");
    zigguratTower(b1, B1_TOP);
    cornerBalconies(b1, typical(AMENITY, B1_TOP - CROWN[1][0]));
    towerWalls(b2, DECK, B2_ROOF, false);
    prism("screen", shrink(b2, 0.45), B2_ROOF, B2_TOP, tiled(4, 6), undefined, "roof");
    waveBalconies(b2, typical(AMENITY, B2_ROOF), 0.3);
  }
  if (want.has(3)) {
    podium("POD_C", ["GROUND_C2", "GROUND_C1"], "POOL_C", "TERRACE_C");
    const c1 = T("C1"), c2 = T("C2"), c2n = T("C2_N"), c2s = T("C2_S");
    zigguratTower(c1, C1_TOP);
    cornerBalconies(c1, typical(AMENITY, C1_TOP - CROWN[1][0]));
    // C2: its southern quarter stops lower (the west elevation)
    towerWalls(c2s, DECK, C2_WING, false); towerWalls(c2n, DECK, C2_ROOF, false);
    prism("screen", shrink(c2n, 0.5), C2_ROOF, C2_TOP, tiled(4, 6), undefined, "roof");
    waveBalconies(c2, typical(AMENITY, C2_WING), 2.1);
    waveBalconies(c2n, typical(C2_WING, C2_ROOF), 2.1);
  }
  if (want.has(4)) {
    // the hotel: brick and glass to level 11; level 12's rooftop amenity in glass over the bar's middle, under a thin
    // roof slab and a bronze penthouse; the pool deck at its south end; the one-story retail wing, a terrace on top
    const h = T("HOTEL");
    walls("store", h, 0, 6.5, tiled(7.5, 6.5));
    walls("hotel", h, 6.5, HOTEL_L12, tiled(7.5, 7.2, 6.5), glassShade);
    cap("deck", h, HOTEL_L12, true);
    const l12 = sub(h, 0.07, 0.93, 0.09, 0.66);
    prism("glass", l12, HOTEL_L12, HOTEL_ROOF, tiled(6, 2 * STORY), glassShade, null);
    prism("bronze", grow(l12, 0.6), HOTEL_ROOF, HOTEL_SLAB, () => [0, 0], undefined, "roof");
    prism("bronze", sub(h, 0.3, 0.7, 0.25, 0.45), HOTEL_SLAB, HOTEL_TOP, () => [0, 0], undefined, "roof");
    cap("water", sub(h, 0.3, 0.7, 0.76, 0.9), HOTEL_L12 + 0.06, true);
    walls("rail", h, HOTEL_L12, HOTEL_L12 + 1.1, () => [0, 0]);
    prism("store", T("HOTEL_RETAIL"), 0, HOTEL_WING, tiled(6, 6), undefined, "deck");
  }

  // ---- the ground: the site's paving, lawns, Pointe Beach and its terraced steps, courts, the round drive, trees ----
  const site = ring(SITE);
  cap("paving", site, 0.05, true, 6);
  if (want.has(4)) cap("lawn", T("LAWN_COMMONS"), 0.14, true);
  if (want.has(3)) { cap("lawn", T("LAWN_POINTE"), 0.14, true); cap("stone", T("STEPS"), 0.14, true); cap("sand", T("BEACH"), 0.14, true); cap("court", T("PICKLE_2"), 0.14, true); }
  if (want.has(2)) {
    cap("court", T("PICKLE_1"), 0.14, true);
    const [ox, oz] = ring([COURT_N])[0], circ = [];
    for (let k = 0; k < 32; k++) circ.push([ox + COURT_N_R * Math.cos(k / 32 * Math.PI * 2), oz + COURT_N_R * Math.sin(k / 32 * Math.PI * 2)]);
    cap("pavers", circ, 0.14, true);
  }
  {
    // trees: every ~10 m 5 m in from the site's edge (the riverwalk and Halsted's parkway), round The Commons, along
    // the drive east of Phase 1; none under a building (3 m clear), on the beach, the steps or a court
    const keepOut = [["A", box(0, 39.5, 0, 77)],
      ["B", T("POD_B")], ["B", T("GROUND_B1")], ["B", T("GROUND_B2")], ["C", T("POD_C")], ["C", T("GROUND_C2")], ["C", T("GROUND_C1")], ["D", T("HOTEL")], ["D", T("HOTEL_RETAIL")],
      ["x", T("BEACH")], ["x", T("STEPS")], ["x", T("PICKLE_1")], ["x", T("PICKLE_2")]];
    const inside = (x, z, p) => { let hit = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit; } return hit; };
    const segDist = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz; let k = l2 ? ((x - a[0]) * dx + (z - a[1]) * dz) / l2 : 0; k = Math.max(0, Math.min(1, k)); return Math.hypot(x - a[0] - k * dx, z - a[1] - k * dz); };
    const near = (x, z, p, m) => inside(x, z, p) || p.some((a, i) => segDist(x, z, a, p[(i + 1) % p.length]) < m);
    const spots = [];
    const S2 = outward(site);
    for (let i = 0; i < S2.length; i++) {
      const p = S2[i], q = S2[(i + 1) % S2.length], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz);
      if (l < 8) continue;
      const nx = -dz / l, nz = dx / l;                                    // inward
      for (let d = 5; d < l - 4; d += 10) spots.push([p[0] + dx * d / l + nx * 5, p[1] + dz * d / l + nz * 5]);
    }
    const lc = outward(T("LAWN_COMMONS"));
    for (let i = 0; i < 4; i++) { const p = lc[i], q = lc[(i + 1) % 4], l = Math.hypot(q[0] - p[0], q[1] - p[1]); for (let d = 4; d < l - 2; d += 9) spots.push([p[0] + (q[0] - p[0]) * d / l + (q[1] - p[1]) / l * 2.5, p[1] + (q[1] - p[1]) * d / l - (q[0] - p[0]) / l * 2.5]); }
    for (let v = 6; v < 90; v += 10) for (const u of [43, 56]) spots.push(at(u, v));
    const centers = { A: at(20, 40), B: T("B2")[0], C: T("C1")[0], D: T("HOTEL")[0] };
    const phaseOf = { A: 1, B: 2, C: 3, D: 4 };
    const trunk = new THREE.CylinderGeometry(0.16, 0.24, 3.2, 5).toNonIndexed(), crown = new THREE.IcosahedronGeometry(2.6, 1);
    for (const [x, z] of spots) {
      if (!inside(x, z, site) || keepOut.some(([, p]) => near(x, z, p, 3))) continue;
      let best = "A", bd = Infinity;
      for (const [k, c] of Object.entries(centers)) { const d = Math.hypot(x - c[0], z - c[1]); if (d < bd) { bd = d; best = k; } }
      if (!want.has(phaseOf[best])) continue;
      const sc = 0.8 + 0.45 * rnd(), green = [0.08 + 0.05 * rnd(), 0.16 + 0.07 * rnd(), 0.045 + 0.03 * rnd()];   // (linear)
      for (const [geo, key, yOff, sy] of [[trunk, "trunk", 1.6, 1], [crown, "canopy", 5.4, 0.85]]) {
        const pa = geo.attributes.position.array, na = geo.attributes.normal.array, B = bucket(key);
        for (let i = 0; i < pa.length; i += 3) {
          B.pos.push(x + pa[i] * sc, (yOff + pa[i + 1] * sy) * sc, z + pa[i + 2] * sc); B.nor.push(na[i], na[i + 1], na[i + 2]); B.uv.push(0, 0);
          if (key === "canopy") { const v = 0.8 + 0.4 * rnd(); B.col.push(green[0] * v, green[1] * v, green[2] * v); } else B.col.push(1, 1, 1);
        }
      }
    }
  }

  // ---- one mesh per material ----
  for (const [k, b] of Object.entries(BK)) {
    if (!b.pos.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(b.col, 3));
    const m = new THREE.Mesh(geo, MATS[k]); m.name = k;
    m.castShadow = !MATS[k].transparent && !["paving", "lawn", "sand", "stone", "court", "pavers"].includes(k); m.receiveShadow = true;
    g.add(m);
  }
  return g;
}
