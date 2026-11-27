// Museum Park: the cluster of towers south of Grant Park between Roosevelt Rd and 14th St, Indiana Ave to the Metra
// Electric, west of the film's south portal: NEMA Chicago, One Museum Park, The Grant, Museum Tower, Museum Pointe,
// Museum Park Towers 1 and 2, and Sky55. For the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers), as a
// shareable module like msi.js and obama-center.js.
//
// Where the numbers come from:
//   - Footprints and the towers' parts: OpenStreetMap, November 2026, through the Chicago Cityscape CLI (the way ids are
//     the keys of RINGS below).
//   - Heights of the podiums and the mid-rises: Cook County's 2022 LiDAR (ISGS, the DSM less the DTM, sampled on a 3 m
//     grid inside each footprint): NEMA's podium 50 m and its green-roofed wing 55.5 m (OSM 49 and 54), the lower podium
//     round it 15 m; One Museum Park's base 14.4 m and its glass lobby 19.3 m; The Grant's base 15 m; Museum Tower's 15.5 m;
//     Museum Pointe 82 m (OSM 88) on a 12.7 m podium; Museum Park Tower 1 61.5 m with a 66 m middle (OSM 85); Museum Park
//     Tower 2 69 m (OSM 72) on a 13.5 m podium.
//   - Heights of the five tall towers: the LiDAR has no returns from their roofs (it reads near the ground there), so
//     these are OpenStreetMap's: NEMA's ten 12 m squares at 81 to 277 m, The Grant 181 m, Museum Tower 124 m, Sky55 129 m.
//     One Museum Park's parts carry only levels (5 to 70); they are scaled to its published 221 m (725 ft).
//   - Design, from photographs on Wikimedia Commons and the architects' and critics' descriptions:
//       NEMA (Rafael Viñoly, 2019): dark glass in a light aluminium frame, a heavy pier at each corner of each 12 m
//       square, the squares stepping up (Chicago Tribune, December 8, 2019); the setbacks planted (OSM roof:material
//       grass); the podium white precast with vertical fins round its parking ("NEMA Chicago from NE.jpg", Kestreltail,
//       2022, CC BY-SA 4.0; "NEMA, Near South Side, Chicago, IL, 2022.jpg", Valentinois26, CC BY-SA 4.0).
//       One Museum Park (Pappageorge Haymes, 2009): blue glass with balconies on the lower, curved parts, which step
//       back five times (CTBUH); the tallest part a silver ellipse of vertical fins, which run on past the top floor as
//       an open screen, crowned by a wall of silver bands that winds round, rising to its peak ("20210220 One Museum Park
//       an the Grant from NEMA.jpg" and "Soldier Field, One Museum Park, the Grant, and Soldier Field, viewed from NEMA in
//       February 2021.jpg", TonyTheTiger, CC BY-SA 4.0; "One Museum Park and One Museum Park West in 2011.JPG", Idej
//       Elixe, CC BY-SA 3.0). (The architects' page also names a copper dome; no photograph shows one, so it is left out.)
//       The Grant (One Museum Park West, Pappageorge Haymes, 2010): green glass with bands of balconies, a box with a
//       taller rounded top that carries a steel-framed glass screen ("The-Grant-One-Museum-Park-West-Chicago-2014.jpg",
//       Acediscovery, CC BY 4.0, and the photographs above).
//       Museum Tower and Sky55: dark glass in a white grid ("One Museum Park from Sears Tower.JPG", 2008, public domain).
//       The mid-rises: pale precast with punched windows and balconies (the same photograph).
//   Assumed: the storey heights; the frame's, mullions' and spandrels' proportions; which columns have balconies; where
//   One Museum Park's crown starts (205 m) and that its spiral makes one turn; The Grant's split of its 181 m between
//   the box (164.5 m), the rounded top (176 m) and the screen (5 m); the screen's bracing; the podiums' colours.
//
//   import * as THREE from "three";
//   import { buildMuseumPark, museumParkSite } from "./museum-park.js";
//   scene.add(buildMuseumPark({ THREE }));
//
// Coordinates are local metres, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: MUSEUM_PARK_CENTRE } to have the cluster round (0, 0, 0). It needs a browser (or another DOM with
// <canvas>): the facades are painted on canvas textures.
export const MUSEUM_PARK_CENTRE = [-87.6222, 41.8662];
const FILM_ORIGIN = [-87.620063, 41.863968];

// [lon, lat] rings from OpenStreetMap, by way id (the closing node left off)
const RINGS = {
  509032412: [[-87.622811,41.867289],[-87.622806,41.86707],[-87.622805,41.866965],[-87.622803,41.866877],[-87.622801,41.866772],[-87.622799,41.866666],[-87.62294,41.866664],[-87.623356,41.86666],[-87.623362,41.866959],[-87.623366,41.867181],[-87.623368,41.867283],[-87.623233,41.867285],[-87.623091,41.867286],[-87.622952,41.867288]],
  1581043622: [[-87.623368,41.867283],[-87.623233,41.867285],[-87.623231,41.867183],[-87.623366,41.867181]],
  1581043623: [[-87.623226,41.866961],[-87.623362,41.866959],[-87.623366,41.867181],[-87.623231,41.867183],[-87.623228,41.867066]],
  1581043624: [[-87.623362,41.866959],[-87.623226,41.866961],[-87.623084,41.866962],[-87.622946,41.866963],[-87.622944,41.866876],[-87.622942,41.866771],[-87.62294,41.866664],[-87.623356,41.86666]],
  1333503937: [[-87.62294,41.866664],[-87.622942,41.866771],[-87.622801,41.866772],[-87.622799,41.866666]],
  1333503938: [[-87.622942,41.866771],[-87.622944,41.866876],[-87.622803,41.866877],[-87.622801,41.866772]],
  1333503939: [[-87.622944,41.866876],[-87.622946,41.866963],[-87.622805,41.866965],[-87.622803,41.866877]],
  1333503940: [[-87.622946,41.866963],[-87.622948,41.867069],[-87.622806,41.86707],[-87.622805,41.866965]],
  1333503941: [[-87.622948,41.867069],[-87.62295,41.867182],[-87.622952,41.867288],[-87.622811,41.867289],[-87.622806,41.86707]],
  1333503942: [[-87.623091,41.867286],[-87.623089,41.86718],[-87.62295,41.867182],[-87.622952,41.867288]],
  1333503943: [[-87.623089,41.86718],[-87.623087,41.867067],[-87.622948,41.867069],[-87.62295,41.867182]],
  1333503944: [[-87.623087,41.867067],[-87.623228,41.867066],[-87.623231,41.867183],[-87.623233,41.867285],[-87.623091,41.867286],[-87.623089,41.86718]],
  1333503945: [[-87.623087,41.867067],[-87.623084,41.866962],[-87.622946,41.866963],[-87.622948,41.867069]],
  1333503946: [[-87.623228,41.867066],[-87.623226,41.866961],[-87.623084,41.866962],[-87.623087,41.867067]],
  151479984: [[-87.621445,41.866815],[-87.62145,41.866753],[-87.621496,41.866755],[-87.621497,41.866747],[-87.621488,41.866504],[-87.621488,41.866468],[-87.620979,41.866476],[-87.621053,41.866646],[-87.621037,41.866651],[-87.621247,41.867142],[-87.62127,41.867138],[-87.621302,41.867163],[-87.621294,41.867228],[-87.621307,41.867268],[-87.621331,41.867313],[-87.621413,41.867304],[-87.621479,41.867281],[-87.621505,41.867314],[-87.621568,41.867307],[-87.621649,41.867296],[-87.621758,41.867291],[-87.621755,41.867256],[-87.621761,41.867191],[-87.621743,41.867103],[-87.621741,41.866909],[-87.621661,41.866911],[-87.621517,41.866916],[-87.621514,41.866877],[-87.621508,41.866858],[-87.621487,41.866834]],
  1267940234: [[-87.621743,41.867103],[-87.62173,41.867099],[-87.62172,41.867027],[-87.621692,41.86696],[-87.621603,41.866943],[-87.621514,41.866938],[-87.621517,41.866916],[-87.621514,41.866877],[-87.621508,41.866858],[-87.621487,41.866834],[-87.621445,41.866815],[-87.62145,41.866753],[-87.621496,41.866755],[-87.621497,41.866747],[-87.621488,41.866504],[-87.621488,41.866468],[-87.620979,41.866476],[-87.621053,41.866646],[-87.621037,41.866651],[-87.621247,41.867142],[-87.62127,41.867138],[-87.621249,41.867106],[-87.621241,41.86707],[-87.621252,41.867067],[-87.621233,41.867031],[-87.621225,41.866998],[-87.621215,41.867],[-87.621186,41.866961],[-87.621169,41.866913],[-87.621161,41.866873],[-87.62116,41.86684],[-87.621225,41.866819],[-87.621274,41.86681],[-87.621309,41.866805],[-87.621345,41.8668],[-87.621391,41.866816],[-87.621417,41.866839],[-87.621423,41.86687],[-87.621452,41.866877],[-87.621478,41.866936],[-87.621485,41.86699],[-87.621417,41.867007],[-87.621426,41.867033],[-87.621481,41.867013],[-87.62155,41.867002],[-87.621576,41.867049],[-87.621591,41.867093],[-87.621667,41.867094]],
  1267940235: [[-87.621417,41.867007],[-87.621405,41.866989],[-87.621389,41.866986],[-87.621374,41.866946],[-87.621355,41.86694],[-87.621348,41.866927],[-87.621378,41.866916],[-87.6214,41.866898],[-87.621384,41.866857],[-87.621356,41.866826],[-87.621334,41.866822],[-87.621309,41.866805],[-87.621345,41.8668],[-87.621391,41.866816],[-87.621417,41.866839],[-87.621423,41.86687],[-87.621452,41.866877],[-87.621478,41.866936],[-87.621485,41.86699]],
  1267940236: [[-87.621334,41.866822],[-87.62128,41.866825],[-87.621227,41.86684],[-87.621218,41.866884],[-87.621223,41.866923],[-87.621233,41.86695],[-87.621216,41.86696],[-87.62122,41.866982],[-87.621225,41.866998],[-87.621215,41.867],[-87.621186,41.866961],[-87.621169,41.866913],[-87.621161,41.866873],[-87.62116,41.86684],[-87.621225,41.866819],[-87.621274,41.86681],[-87.621309,41.866805]],
  1267940237: [[-87.621233,41.86695],[-87.621276,41.866942],[-87.621326,41.866939],[-87.621355,41.86694],[-87.621348,41.866927],[-87.621378,41.866916],[-87.6214,41.866898],[-87.621384,41.866857],[-87.621356,41.866826],[-87.621334,41.866822],[-87.62128,41.866825],[-87.621227,41.86684],[-87.621218,41.866884],[-87.621223,41.866923]],
  1267940238: [[-87.621389,41.866986],[-87.621374,41.866946],[-87.621355,41.86694],[-87.621326,41.866939],[-87.621276,41.866942],[-87.621233,41.86695],[-87.621216,41.86696],[-87.62122,41.866982],[-87.621225,41.866998],[-87.621233,41.867031],[-87.621252,41.867067],[-87.621294,41.86712],[-87.621315,41.867136],[-87.621322,41.867126],[-87.621295,41.867089],[-87.621277,41.867049],[-87.621271,41.867013],[-87.621274,41.866983],[-87.621318,41.866978],[-87.621357,41.866979]],
  1267940239: [[-87.621322,41.867126],[-87.621353,41.867087],[-87.621396,41.86705],[-87.621426,41.867033],[-87.621417,41.867007],[-87.621405,41.866989],[-87.621389,41.866986],[-87.621357,41.866979],[-87.621318,41.866978],[-87.621274,41.866983],[-87.621271,41.867013],[-87.621277,41.867049],[-87.621295,41.867089]],
  1267940240: [[-87.621331,41.867313],[-87.621307,41.867268],[-87.621294,41.867228],[-87.621302,41.867163],[-87.621322,41.867126],[-87.621353,41.867087],[-87.621396,41.86705],[-87.621426,41.867033],[-87.621481,41.867013],[-87.62155,41.867002],[-87.621576,41.867049],[-87.621591,41.867093],[-87.621589,41.867104],[-87.621584,41.867137],[-87.621567,41.867187],[-87.621542,41.867226],[-87.62152,41.86725],[-87.621502,41.867267],[-87.621479,41.867281],[-87.621413,41.867304]],
  1267940241: [[-87.62152,41.86725],[-87.621606,41.86726],[-87.621691,41.867265],[-87.621692,41.867259],[-87.621694,41.867216],[-87.621689,41.867179],[-87.621675,41.867142],[-87.62166,41.867118],[-87.621623,41.86711],[-87.621589,41.867104],[-87.621584,41.867137],[-87.621567,41.867187],[-87.621542,41.867226]],
  1267940242: [[-87.621502,41.867267],[-87.621604,41.867271],[-87.621606,41.86726],[-87.62152,41.86725]],
  1267940243: [[-87.621692,41.867259],[-87.621755,41.867256],[-87.621761,41.867191],[-87.621743,41.867103],[-87.62173,41.867099],[-87.621667,41.867094],[-87.621591,41.867093],[-87.621589,41.867104],[-87.621623,41.86711],[-87.62166,41.867118],[-87.621675,41.867142],[-87.621689,41.867179],[-87.621694,41.867216]],
  1267940244: [[-87.621302,41.867163],[-87.62127,41.867138],[-87.621249,41.867106],[-87.621241,41.86707],[-87.621252,41.867067],[-87.621294,41.86712],[-87.621315,41.867136]],
  151371817: [[-87.621758,41.867291],[-87.621755,41.867256],[-87.621761,41.867191],[-87.621743,41.867103],[-87.621741,41.866909],[-87.622262,41.866902],[-87.62231,41.866902],[-87.62232,41.867104],[-87.622329,41.86713],[-87.622332,41.867157],[-87.622329,41.867181],[-87.622325,41.8672],[-87.622328,41.86728],[-87.622313,41.86728],[-87.622313,41.867286],[-87.622312,41.867295],[-87.622157,41.867292],[-87.622103,41.867285],[-87.622079,41.86731]],
  1554322545: [[-87.622312,41.867295],[-87.622313,41.867286],[-87.622313,41.86728],[-87.622328,41.86728],[-87.622325,41.8672],[-87.622329,41.867181],[-87.622332,41.867157],[-87.622329,41.86713],[-87.62232,41.867104],[-87.62231,41.866902],[-87.621741,41.866909],[-87.621743,41.867103],[-87.621761,41.867191],[-87.621755,41.867256],[-87.621758,41.867291],[-87.622079,41.86731],[-87.622103,41.867285],[-87.622157,41.867292]],
  1554322546: [[-87.622085,41.866944],[-87.622107,41.866919],[-87.622148,41.866945],[-87.62218,41.866944],[-87.622221,41.866944],[-87.622255,41.866945],[-87.622282,41.866948],[-87.622284,41.866977],[-87.622282,41.867002],[-87.622278,41.867026],[-87.622271,41.867046],[-87.622288,41.86706],[-87.622302,41.867074],[-87.62232,41.867104],[-87.622329,41.86713],[-87.622332,41.867157],[-87.622329,41.867181],[-87.622325,41.8672],[-87.622328,41.86728],[-87.622313,41.86728],[-87.622313,41.867286],[-87.622312,41.867295],[-87.622157,41.867292],[-87.622103,41.867285],[-87.622049,41.867275],[-87.622009,41.867267],[-87.621988,41.867263],[-87.621985,41.867246],[-87.621957,41.867247],[-87.621925,41.867247],[-87.621893,41.867247],[-87.621889,41.867141],[-87.621914,41.867117],[-87.621892,41.867105],[-87.621897,41.867095],[-87.621886,41.867085],[-87.621903,41.86706],[-87.621921,41.867034],[-87.621945,41.867007],[-87.621977,41.866981],[-87.622002,41.866965],[-87.622028,41.866951],[-87.622062,41.866934]],
  1554322547: [[-87.622033,41.867205],[-87.622325,41.8672],[-87.622329,41.867181],[-87.622332,41.867157],[-87.622329,41.86713],[-87.62232,41.867104],[-87.622302,41.867074],[-87.622288,41.86706],[-87.622271,41.867046],[-87.622249,41.867033],[-87.622225,41.867023],[-87.622199,41.867015],[-87.622171,41.867008],[-87.622144,41.867005],[-87.622112,41.867005]],
  151477490: [[-87.621527,41.866355],[-87.621505,41.866372],[-87.621434,41.866375],[-87.621387,41.866378],[-87.621341,41.866376],[-87.621296,41.86637],[-87.621255,41.86636],[-87.621224,41.866307],[-87.621207,41.866261],[-87.621194,41.866209],[-87.621187,41.866154],[-87.621191,41.866096],[-87.621199,41.866037],[-87.621217,41.865986],[-87.621227,41.865974],[-87.621259,41.865947],[-87.621319,41.865938],[-87.621394,41.865936],[-87.621456,41.86594],[-87.62151,41.865946],[-87.621539,41.865982],[-87.621561,41.866034],[-87.621574,41.866088],[-87.621578,41.866148],[-87.621581,41.8662],[-87.62157,41.866252],[-87.621554,41.866304]],
  151477513: [[-87.621505,41.866372],[-87.621486,41.866401],[-87.621488,41.866468],[-87.620979,41.866476],[-87.620771,41.86598],[-87.620891,41.865977],[-87.621227,41.865974],[-87.621259,41.865947],[-87.621319,41.865938],[-87.621394,41.865936],[-87.621456,41.86594],[-87.62151,41.865946],[-87.621539,41.865982],[-87.621561,41.866034],[-87.621574,41.866088],[-87.621578,41.866148],[-87.621581,41.8662],[-87.62157,41.866252],[-87.621554,41.866304],[-87.621527,41.866355]],
  151479987: [[-87.621302,41.865749],[-87.620647,41.865761],[-87.620631,41.865724],[-87.620622,41.865689],[-87.620619,41.865645],[-87.620619,41.865606],[-87.620626,41.86557],[-87.620639,41.86553],[-87.621197,41.86552],[-87.621295,41.865518]],
  151543012: [[-87.620639,41.86553],[-87.620626,41.86557],[-87.620619,41.865606],[-87.620619,41.865645],[-87.620622,41.865689],[-87.620631,41.865724],[-87.620647,41.865761],[-87.621302,41.865749],[-87.621295,41.865518],[-87.621197,41.86552],[-87.621195,41.86546],[-87.621231,41.865459],[-87.62123,41.865432],[-87.62125,41.865431],[-87.62125,41.86542],[-87.621269,41.865419],[-87.621268,41.865368],[-87.621246,41.865368],[-87.621246,41.865358],[-87.621232,41.865358],[-87.621232,41.865343],[-87.621177,41.865344],[-87.621178,41.865335],[-87.621091,41.865337],[-87.621091,41.865345],[-87.62105,41.865346],[-87.62105,41.865337],[-87.620969,41.865338],[-87.620969,41.865346],[-87.620923,41.865346],[-87.620923,41.865338],[-87.620841,41.865339],[-87.620841,41.865348],[-87.620794,41.865349],[-87.620794,41.865367],[-87.620766,41.865367],[-87.620767,41.865417],[-87.620548,41.86542],[-87.62058,41.865522],[-87.62064,41.865521]],
  151479985: [[-87.621755,41.86493],[-87.621879,41.864928],[-87.621879,41.864944],[-87.621923,41.864943],[-87.621924,41.864987],[-87.621937,41.864987],[-87.621951,41.865439],[-87.621888,41.86544],[-87.62189,41.865508],[-87.621768,41.86551],[-87.621523,41.865514],[-87.621522,41.865478],[-87.621499,41.865479],[-87.621483,41.864957],[-87.621504,41.864957],[-87.621503,41.864921],[-87.621755,41.864917]],
  151479983: [[-87.621755,41.864954],[-87.621755,41.86493],[-87.621755,41.864917],[-87.621503,41.864921],[-87.621504,41.864957],[-87.621483,41.864957],[-87.621499,41.865479],[-87.621522,41.865478],[-87.621523,41.865514],[-87.621768,41.86551],[-87.621766,41.865478],[-87.621788,41.865477],[-87.621775,41.864954]],
  151479986: [[-87.620823,41.86497],[-87.620749,41.864971],[-87.620492,41.864974],[-87.620478,41.864384],[-87.620787,41.86438],[-87.620809,41.86438],[-87.62081,41.864415],[-87.620811,41.864468],[-87.620821,41.864885]],
  151543013: [[-87.620766,41.865367],[-87.620765,41.865317],[-87.620809,41.865316],[-87.620808,41.865268],[-87.620829,41.865267],[-87.620828,41.865199],[-87.620807,41.865199],[-87.620806,41.86515],[-87.620751,41.865151],[-87.620749,41.864971],[-87.620823,41.86497],[-87.620821,41.864885],[-87.620811,41.864468],[-87.62081,41.864415],[-87.620809,41.86438],[-87.620787,41.86438],[-87.620784,41.864281],[-87.620739,41.864281],[-87.620739,41.864272],[-87.62065,41.864273],[-87.62065,41.864281],[-87.620612,41.864282],[-87.620612,41.864274],[-87.620528,41.864275],[-87.620528,41.864283],[-87.620491,41.864284],[-87.62049,41.864276],[-87.620401,41.864277],[-87.620401,41.864294],[-87.620368,41.864294],[-87.62037,41.864344],[-87.620327,41.864345],[-87.620548,41.86542],[-87.620767,41.865417]],
  151544480: [[-87.62391,41.866165],[-87.623723,41.866168],[-87.623722,41.866141],[-87.623642,41.866142],[-87.623574,41.866141],[-87.623513,41.866138],[-87.623452,41.866133],[-87.623394,41.866123],[-87.62336,41.866116],[-87.623337,41.866107],[-87.623319,41.866095],[-87.623304,41.866081],[-87.623294,41.866063],[-87.623289,41.86604],[-87.623289,41.866024],[-87.623297,41.866007],[-87.623268,41.866007],[-87.623264,41.865901],[-87.623528,41.865896],[-87.623528,41.86588],[-87.623906,41.865873]],
};

// What is drawn, part by part: [way id, bottom, top, facade, roof]. Heights in metres above the street (see the top).
const OMP = 221 / 70;                                              // One Museum Park's storey, its 70 levels scaled to 221 m
const OMP_CROWN = 205;                                             // where its crown starts (assumed; the fins, then the spiral)
const PARTS = [
  // NEMA Chicago: the white podium under the tower's ten 12 m squares (dark glass in a light frame), stepping up
  [509032412, 0, 15, "nemaPod", "grey"], [1581043622, 0, 50, "nemaPod", "pale"], [1581043623, 0, 55.5, "nemaPod", "grass"],
  [1581043624, 0, 50, "nemaPod", "pale"],
  [1333503937, 0, 81, "nema", "grass"], [1333503938, 0, 108, "nema", "grass"], [1333503939, 0, 135, "nema", "grass"],
  [1333503940, 0, 180, "nema", "grass"], [1333503941, 0, 203, "nema", "grass"], [1333503946, 0, 216, "nema", "grass"],
  [1333503942, 0, 226, "nema", "grass"], [1333503944, 0, 242, "nema", "grass"], [1333503943, 0, 255, "nema", "grass"],
  [1333503945, 0, 277.2, "nema", "pale"],
  // One Museum Park: the precast base and podium, the glass lobby, the blue parts with their balconies stepping up, and
  // the silver ellipse to its crown (added below)
  [151479984, 0, 14.4, "precast", "grey"], [1267940234, 0, 14.4, "precast", "grey"], [1267940235, 0, 19.3, "omp", "grey"],
  [1267940236, 0, 29 * OMP, "omp", "grey"], [1267940237, 0, 39 * OMP, "omp", "grey"], [1267940244, 0, 39 * OMP, "omp", "grey"],
  [1267940242, 0, 49 * OMP, "omp", "grey"], [1267940243, 0, 49 * OMP, "omp", "grey"], [1267940238, 0, 53 * OMP, "omp", "grey"],
  [1267940239, 0, 66 * OMP, "omp", "grey"], [1267940241, 0, 66 * OMP, "omp", "grey"], [1267940240, 0, OMP_CROWN, "ompCore", "grey"],
  // The Grant: its glass base, the shaft, the rounded top (its screen is added below)
  [1554322545, 0, 15, "grant", "grey"], [1554322546, 0, 164.5, "grant", "grey"], [1554322547, 0, 176, "grant", "grey"],
  // Museum Tower on its podium; Museum Pointe, Museum Park Towers 1 and 2 (precast) on theirs; Sky55
  [151477513, 0, 15.5, "podium", "grey"], [151477490, 0, 124, "mt", "pale"],
  [151543012, 0, 12.7, "podium", "grey"], [151479987, 0, 82, "precast", "grey"],
  [151479985, 0, 61.5, "precast", "grey"], [151479983, 0, 66, "precast", "grey"],
  [151543013, 0, 13.5, "podium", "grey"], [151479986, 0, 69, "precast", "grey"],
  [151544480, 0, 129, "sky", "pale"],
];
// The footprints OpenStreetMap's own buildings give way to (the outer ones; every part lies inside one of them)
const SITE_IDS = [509032412, 151479984, 1267940234, 151371817, 151477513, 151477490, 151543012, 151479987, 151479985,
  151479983, 151543013, 151479986, 151544480];

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// Each footprint as a closed ring of local metres [x, z, x, z, ...], for clearing OpenStreetMap's buildings
export function museumParkSite(origin = FILM_ORIGIN) {
  const L = local(origin);
  return SITE_IDS.map((id) => { const r = RINGS[id].flatMap(([lon, lat]) => L(lon, lat)); return [...r, r[0], r[1]]; });
}

export function buildMuseumPark({ THREE, origin = FILM_ORIGIN }) {
  const L = local(origin), [cx, cz] = L(...MUSEUM_PARK_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz);
  const ring = (id) => RINGS[id].map(([lon, lat]) => { const [x, z] = L(lon, lat); return [x - cx, z - cz]; });
  const outward = (pts) => {                                      // the ring turned so (dz, -dx) points out of every edge
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a < 0 ? [...pts].reverse() : pts;
  };
  let seed = 1;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)

  // ---- the facades, each painted once on a canvas and repeated by the walls' uv (u in tiles along the wall, v up) ----
  const canvas = (draw) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    draw(cv.getContext("2d"));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  };
  // glass: cols x rows panels, each a tone from `tones` with the sky reflected at its top; mullions `mw` px wide; a
  // spandrel band at each floor `spH` of its height; and, in a share `balc` of the columns, a balcony at each floor (its
  // pale slab and the shadow under it)
  const curtain = ({ cols, rows, tones, mullion, mw = 2, spandrel, spH = 0.12, balc = 0 }) => canvas((c) => {
    const pw = 256 / cols, ph = 256 / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const tone = tones[Math.floor(rnd() * tones.length)], gr = c.createLinearGradient(0, r * ph, 0, (r + 1) * ph);
      gr.addColorStop(0, "#9fb2bf"); gr.addColorStop(0.3, tone); gr.addColorStop(1, tone);
      c.fillStyle = gr; c.fillRect(k * pw, r * ph, pw, ph);
    }
    c.fillStyle = spandrel; for (let r = 0; r < rows; r++) c.fillRect(0, (r + 1) * ph - ph * spH, 256, ph * spH);
    c.fillStyle = mullion; for (let k = 0; k < cols; k++) c.fillRect(k * pw, 0, mw, 256);
    for (let k = 0; k < cols; k++) if (rnd() < balc) for (let r = 0; r < rows; r++) {
      const y = (r + 1) * ph - ph * 0.1;
      c.fillStyle = "rgba(20,28,36,0.35)"; c.fillRect(k * pw, y - ph * 0.3, pw, ph * 0.3);      // the shade under the slab above
      c.fillStyle = "#cdd2d4"; c.fillRect(k * pw, y, pw, ph * 0.1);                            // the slab
      c.fillStyle = "rgba(205,215,220,0.45)"; c.fillRect(k * pw, y - ph * 0.28, pw, ph * 0.28); // the glass railing
    }
  });
  // NEMA: dark glass, a light aluminium frame (a slab line at each floor, thin mullions) and a heavy pier at each corner of
  // a 12 m square: one tile is one square's face, two floors
  const nema = canvas((c) => {
    c.fillStyle = "#d6d7d6"; c.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) {
      const x = 10 + k * 29.5, y = r * 128 + 7, gr = c.createLinearGradient(0, y, 0, y + 112);
      gr.addColorStop(0, "#7f97a3"); gr.addColorStop(0.3, "#34494f"); gr.addColorStop(1, ["#2c3f45", "#33474d", "#283a40"][Math.floor(rnd() * 3)]);
      c.fillStyle = gr; c.fillRect(x, y, 27, 112);
    }
    c.fillStyle = "#e2e3e2"; c.fillRect(0, 0, 10, 256); c.fillRect(246, 0, 10, 256);   // the piers, half a pier each edge
    c.fillStyle = "#c2c3c2"; for (let r = 0; r < 2; r++) c.fillRect(0, r * 128 + 119, 256, 9);   // the slab edges
  });
  // a white precast wall in vertical fins round its parking floors' dark openings (NEMA's podium): two floors a tile
  const fins = canvas((c) => {
    c.fillStyle = "#e3e2dc"; c.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 2; r++) { c.fillStyle = "#6e7270"; c.fillRect(0, r * 128 + 40, 256, 62); }   // the openings
    for (let k = 0; k < 16; k++) { c.fillStyle = "#d6d5ce"; c.fillRect(k * 16 + 6, 0, 7, 256); c.fillStyle = "#b9b8b1"; c.fillRect(k * 16 + 13, 0, 2, 256); }
  });
  // punched windows in a wall of `wall`: cols x rows, each window w by h of its cell; and, in some columns, balconies
  const punched = (wall, glass, cols, rows, w = 0.5, h = 0.55, balc = 0) => canvas((c) => {
    c.fillStyle = wall; c.fillRect(0, 0, 256, 256);
    const pw = 256 / cols, ph = 256 / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      c.fillStyle = glass; c.fillRect(k * pw + pw * (1 - w) / 2, r * ph + ph * 0.18, pw * w, ph * h);
      c.fillStyle = "rgba(0,0,0,0.10)"; c.fillRect(k * pw, (r + 1) * ph - 3, pw, 3);
    }
    for (let k = 0; k < cols; k++) if (rnd() < balc) for (let r = 0; r < rows; r++) {
      c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(k * pw + 4, r * ph + ph * 0.05, pw - 8, ph * 0.75);
      c.fillStyle = "#f0ece2"; c.fillRect(k * pw + 2, (r + 1) * ph - ph * 0.12, pw - 4, ph * 0.08);
    }
  });
  // [texture, tile width m, tile height m, glassy, whole tiles per wall (so a pattern meets each corner)]
  const FACADES = {
    nema: [nema, 12, 6.7, true, true],
    nemaPod: [fins, 12, 6, false, false],
    ompCore: [curtain({ cols: 8, rows: 4, tones: ["#4d6274", "#5a6f80", "#68798a", "#7a8a98"], mullion: "#d9dee2", mw: 5, spandrel: "#56697a", spH: 0.06 }), 12, 4 * OMP, true, false],
    omp: [curtain({ cols: 6, rows: 4, tones: ["#2f4a6b", "#365375", "#3e5b7c", "#2a4462"], mullion: "#aeb8c2", spandrel: "#3a5272", balc: 0.4 }), 9, 4 * OMP, true, false],
    grant: [curtain({ cols: 6, rows: 4, tones: ["#3f6f6c", "#477a75", "#36625f", "#53837c"], mullion: "#b9c6c3", spandrel: "#3e6662", balc: 0.45 }), 9, 13, true, false],
    mt: [curtain({ cols: 8, rows: 4, tones: ["#33475a", "#3b5064", "#2e4253"], mullion: "#e6e8e8", mw: 7, spandrel: "#4a5c6c", spH: 0.08 }), 12, 12.8, true, false],
    sky: [curtain({ cols: 6, rows: 2, tones: ["#30465d", "#384f67", "#2b4055"], mullion: "#eceeec", mw: 6, spandrel: "#eceeec", spH: 0.12 }), 9, 6.4, true, false],
    precast: [punched("#e5dfd0", "#59636c", 3, 2, 0.5, 0.55, 0.3), 6, 6, false, false],
    podium: [punched("#c9bda6", "#4b5560", 3, 2, 0.45, 0.5), 6, 7, false, false],
  };
  const MATS = {};
  for (const [k, [map, , , glassy]] of Object.entries(FACADES))
    MATS[k] = new THREE.MeshStandardMaterial({ map, roughness: glassy ? 0.3 : 0.85, metalness: glassy ? 0.2 : 0, vertexColors: true });
  const ROOFS = {
    grey: new THREE.MeshStandardMaterial({ color: 0x8f9396, roughness: 0.9 }),
    pale: new THREE.MeshStandardMaterial({ color: 0xd8d2d2, roughness: 0.9 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x6d8a4e, roughness: 1 }),
  };

  // ---- a prism: walls from y0 to y1 round the ring (smooth where the wall curves, sharp at corners), and a flat roof ----
  const prism = (pts, y0, y1, mat, tileW, tileH, glassy, whole, roof) => {
    pts = outward(pts);
    const n = pts.length, en = [];
    for (let i = 0; i < n; i++) {                                 // each edge's outward normal and length
      const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1;
      en.push([dz / l, -dx / l, l]);
    }
    const pos = [], nor = [], uv = [], col = [];
    const shade = (y) => glassy ? 0.86 + 0.24 * Math.min(1, y / 220) : 1;   // glass reflects more sky higher up
    let u = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], e = en[i], pe = en[(i + n - 1) % n], ne = en[(i + 1) % n];
      // at each end, average with the neighbouring edge's normal if the wall turns less than 35 degrees there
      const avg = (o) => { const d = e[0] * o[0] + e[1] * o[1]; if (d < 0.82) return [e[0], e[1]]; const x = e[0] + o[0], z = e[1] + o[1], l = Math.hypot(x, z); return [x / l, z / l]; };
      const n0 = avg(pe), n1 = avg(ne), v0 = y0 / tileH, v1 = y1 / tileH;
      const u0 = whole ? 0 : u / tileW, u1 = whole ? Math.max(1, Math.round(e[2] / tileW)) : (u + e[2]) / tileW;
      const V = [[p, y0, n0, u0, v0], [q, y1, n1, u1, v1], [q, y0, n1, u1, v0], [p, y0, n0, u0, v0], [p, y1, n0, u0, v1], [q, y1, n1, u1, v1]];
      for (const [pt, y, nn, uu, vv] of V) { pos.push(pt[0], y, pt[1]); nor.push(nn[0], 0, nn[1]); uv.push(uu, vv); const s = shade(y); col.push(s, s, s); }
      u += e[2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.add(new THREE.Mesh(geo, mat));
    if (roof) {
      const top = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))));
      top.rotateX(-Math.PI / 2); top.translate(0, y1, 0);
      g.add(new THREE.Mesh(top, roof));
    }
  };
  for (const [id, y0, y1, f, r] of PARTS) { const [, w, h, glassy, whole] = FACADES[f]; prism(ring(id), y0, y1, MATS[f], w, h, glassy, whole, ROOFS[r]); }

  // ---- a wall round a ring, open (no roof), its top at y0 + top(s), s from 0 to 1 once round from the ring's first point;
  //      u in metres / tileW along it, v from 0 at y0 to 1 at its top ----
  const screen = (pts, y0, top, mat, tileW) => {
    pts = outward(pts);
    const n = pts.length, at = [0];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; at.push(at[i] + Math.hypot(q[0] - p[0], q[1] - p[1])); }
    const per = at[n], pos = [], uv = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], h0 = top(at[i] / per), h1 = top(at[i + 1] / per), u0 = at[i] / tileW, u1 = at[i + 1] / tileW;
      pos.push(p[0], y0, p[1], q[0], y0 + h1, q[1], q[0], y0, q[1], p[0], y0, p[1], p[0], y0 + h0, p[1], q[0], y0 + h1, q[1]);
      uv.push(u0, 0, u1, 1, u1, 0, u0, 0, u0, 1, u1, 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, mat));
  };
  // ---- One Museum Park's crown, as the photographs show it: the ellipse's silver fins run on 7 m past its top floor as an
  //      open screen, and above them a wall of silver bands winds once round, rising to 221 m at its peak ----
  {
    const pts = ring(1267940240);
    // (start the spiral at the ring's north-west, so its peak is over the west side, toward the Loop, as in the photographs)
    let k0 = 0; pts.forEach(([x, z], k) => { if (x + z < pts[k0][0] + pts[k0][1]) k0 = k; });
    const turned = [...pts.slice(k0), ...pts.slice(0, k0)];
    const finTex = canvas((c) => {
      c.clearRect(0, 0, 256, 256); c.fillStyle = "rgba(170,190,205,0.35)"; c.fillRect(0, 0, 256, 256);
      c.fillStyle = "#dfe4e7"; for (let k = 0; k < 8; k++) c.fillRect(k * 32, 0, 7, 256);
      c.fillRect(0, 0, 256, 6);
    });
    const bandTex = canvas((c) => {
      for (let r = 0; r < 8; r++) { c.fillStyle = r % 2 ? "#b9c1c7" : "#dde2e5"; c.fillRect(0, r * 32, 256, 32); }
      c.fillStyle = "rgba(60,70,80,0.35)"; for (let r = 0; r < 8; r++) c.fillRect(0, r * 32 + 28, 256, 4);
    });
    const finMat = new THREE.MeshStandardMaterial({ map: finTex, transparent: true, roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide, depthWrite: false });
    const bandMat = new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide });
    screen(turned, OMP_CROWN, () => 7, finMat, 12);
    screen(turned, OMP_CROWN + 7, (s) => 1.2 + (221 - OMP_CROWN - 8.2) * s, bandMat, 12);
  }
  // ---- The Grant's crown: a steel-framed glass screen round its rounded top, 5 m tall, braced on the diagonal ----
  {
    const tex = canvas((c) => {
      c.fillStyle = "rgba(170,195,190,0.45)"; c.fillRect(0, 0, 256, 256);
      c.strokeStyle = "#cfd8d5"; c.lineWidth = 7;
      c.beginPath(); c.moveTo(0, 256); c.lineTo(128, 0); c.lineTo(256, 256); c.stroke();
      c.fillStyle = "#cfd8d5"; c.fillRect(0, 0, 256, 10); c.fillRect(0, 0, 8, 256); c.fillRect(124, 0, 8, 256);
    });
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.35, metalness: 0.3, side: THREE.DoubleSide, depthWrite: false });
    screen(ring(1554322547), 176, () => 5, mat, 6);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = !o.material.transparent; o.receiveShadow = true; } });
  return g;
}
