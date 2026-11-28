// Soldier Field, on the lakefront at 18th St east of Lake Shore Drive: Holabird & Roche's 1924 stadium (its two Doric
// colonnades, their end pavilions and the old outer walls round the south end) with the 2003 seating bowl set inside the
// walls by Wood + Zapata and Lohan Caprile Goettsch. For the cab-ride film (brag-output/2026-11-24-cab-ride-hyde-rogers),
// as a shareable module like museum-park.js and msi.js.
//
// What it draws, in the stadium's own frame (the field runs north-south, turned 4.2 degrees so its north end leans west):
//   - The colonnades, east and west: a 14 m stone base with two rows of windows, a double row of 22 fluted Doric columns
//     (9.4 m, 2 m thick), a frieze of triglyphs and roundels and a cornice at 28 m; at each end a pavilion, a 4 x 4 open
//     portico on a projecting base with a pediment at each end and a red tile roof (ridge 30.4 m).
//   - The old walls: the horseshoe round the south end, 13.5 m of stone with a row of small windows and gates, the
//     concourse deck on top with its parapet and flags; to the north the raised plaza and lawn (13.5 m) over the north
//     garage, between the colonnades' lines, and its grass bank.
//   - The west grandstand (the "spaceship"): a saddle-shaped upper deck whose front rises from 10 m at the 50-yard line to
//     35 m at its tips, its back a silver fascia ring (34.5-39.7 m) cantilevered out over the west colonnade, a dark ribbed
//     soffit sloping down to just clear the colonnade, the inclined glass wall under it and its V-struts, the white trussed
//     frames along its rim (to 44.8 m).
//   - The east side: the glass building of suites and club levels (roof 40.5 m, 14.5 m deep, its face bulging), which curves
//     round the south end (33-35 m there, thinner) to meet the grandstand's south tip, with floodlight gantries on its roof.
//   - The bowl: the field (turf, yard lines, end zones, goalposts), the lower bowl, the club tier on the east, the open north
//     stand (to 25 m) with the concourse building behind it, the south stand, and two video boards.
//
// Where the numbers come from:
//   - Footprints: OpenStreetMap, November 2026, through the Chicago Cityscape CLI: the stadium's outline (way 24587933,
//     simplified to 0.6 m: SF_RING below) and its parts (the colonnades 766776875/766776876 and their pavilions, the old
//     south wall 766776882, the north extensions 766776883/766776884, the bowl 766775009-766775012, the pitch 91535224),
//     which agree with the LiDAR to a metre or two.
//   - Heights and the bowl's shape: Cook County's 2022 LiDAR (ISGS, the DSM less the DTM; street grade 181.0 m NAVD88),
//     sampled on a 0.4-0.55 m grid in the stadium's frame: the colonnades' cornice 28.0 m and the pavilions' ridges 30.2 m;
//     the colonnade 9.5 m deep (its outer face 98.5 m from the field's centre line, the pavilions to 102.5 m, 110 m long);
//     the concourse decks and the north plaza 13.5 m; the east building's roof 40.2-40.5 m, its outer face 82 m out and
//     inner face 67.5 m; its south part 33-35 m, 7-9 m deep, 124 m south of midfield; the grandstand's rim 38-43 m (44-45 m
//     on its frames), its outer edge 101 m west of the centre line at midfield, its tips 120 m north and south; its seats
//     rising 0.70 m per m, from 10 m at the front (u = -54) to 35 m; the front's rise to the tips (14 m at +-90 m, 22 m at
//     +-110 m); the north stand 0.42 m per m to 24.8 m at 131 m north; the south stand 0.405 m per m to 16.9 m; the east lower
//     bowl to 7 m and its club tier 13-20.7 m; the field 2 m below the street (here raised to the street: the film's ground
//     is a plane at y = 0); the old south wall's outer face 156.5 m south of midfield.
//   - Design, from photographs on Wikimedia Commons and the critics' and the Park Service's descriptions:
//       "Soldier Field W 2022.jpg" (Sea Cow, 2022, CC BY-SA 4.0): the east colonnade from the air, its 22 columns a row,
//       the pavilions' pediments and tile roofs, the windows of the base, the glass building's bands.
//       "Soldier Field on June 26, 2020.jpg" (Moses8910, CC BY-SA 4.0): the bowl from the south-east, the glass building
//       round the south end on its V-struts, the deck and flags on the old wall, the north board.
//       "Soldier field Chicago seen from the City of New Orleans (5105908725).jpg" (Loco Steve, 2010, CC BY 2.0) and
//       "Soldier Field Chicago, Illinois - panoramio.jpg" (Colin Andersen Photography, 2011, CC BY-SA 3.0): the west side
//       from the Metra Electric's tracks and from the 18th St bridge: the saucer over the west colonnade, its silver rim,
//       dark soffit, glass wall and struts, the low south wall, the glass to the right.
//       "Soldier-Field-01.jpg" (Ken Lund, 2013, CC BY-SA 2.0): the saucer from Lake Shore Drive, the white frames on top.
//       "Soldier Field west colonnade, photographed looking south in September 2024 (54285543867).jpg" (Nairn McWilliams,
//       CC BY-SA 2.0) and "Soldier Field, Lake Shore Drive, Chicago, IL; November 2023 (54216512611).jpg" (Warren LeMay,
//       CC BY-SA 2.0): the soffit's slats and ribs, the inclined glass wall, a pavilion on the north plaza.
//       "Soldier Field east side.JPG" (CC BY-SA 3.0) and "Soldier Field August 2010.JPG" (Michael Barera, CC BY-SA 4.0): a
//       pavilion close up (an open portico, pediment, a frieze of roundels) and the colonnade from below.
//       National Park Service, "Grant Park Stadium (Soldier Field)": the colonnades "formed by a double row of 32 columns";
//       the bowl "cantilevered and asymmetrical", its skyboxes rising "four stories beyond the original colonnades on the
//       east side", its "curving steel and glass skin". Blair Kamin (via Northwestern's Atlas blog, 2015): "the bulbous west
//       grandstand that weighs down brutally on Soldier Field's once-proud columns", the east "wall of 133 glass-clad
//       luxury suites".
//   Assumed: the columns' diameter, entasis and capitals, the entablature's split (architrave 1.6 m, frieze 1.9 m, cornice
//   0.8 m), the pavilions' column layout and roofs' pitch; the windows of the bases and the old wall; the soffit's slope
//   (down to just above the colonnade) and the glass wall's lean; the struts' spacing; the frames' shape; the east
//   building's storeys and bulge; the lower bowl under the overhang; the seats' navy; the north concourse building; the
//   boards' sizes; the field's markings (no logos); the deck as one level (the real one has a sunken walk inside the south
//   wall); the north plaza's edge (the real lawn runs on north toward the Field Museum).
//   Reference images: refs/soldier-field/SOURCES.md
//
//   import * as THREE from "three";
//   import { buildSoldierField, soldierFieldSite } from "./soldier-field.js";
//   scene.add(buildSoldierField({ THREE }));
//
// Coordinates are local meters, x east, z south, y up, from `origin` ([lon, lat]; by default the film's, Roosevelt Rd at the
// lakefront). Pass { origin: SOLDIER_FIELD_CENTRE } to have midfield at (0, 0, 0). It needs a browser (or another DOM with
// <canvas>): the facades are painted on canvas textures.
export const SOLDIER_FIELD_CENTRE = [-87.616685, 41.862331];       // midfield, the 50-yard line
const FILM_ORIGIN = [-87.620063, 41.863968];
const TURN = 4.2 * Math.PI / 180;                                   // the field's axis, clockwise from north

// OpenStreetMap's outline of the stadium (way 24587933, simplified), [lon, lat]
const SF_RING = [[-87.615884,41.861131],[-87.615701,41.861287],[-87.615621,41.861374],[-87.61558,41.861443],[-87.615564,41.861439],[-87.615545,41.861472],[-87.615559,41.861476],[-87.615506,41.861605],[-87.615463,41.861596],[-87.615439,41.861676],[-87.615433,41.861893],[-87.615405,41.861894],[-87.615502,41.862866],[-87.615526,41.862865],[-87.61555,41.863074],[-87.615592,41.86307],[-87.615691,41.864073],[-87.615751,41.86407],[-87.615731,41.863655],[-87.615942,41.86374],[-87.616217,41.86372],[-87.616591,41.863713],[-87.617298,41.863675],[-87.617297,41.863688],[-87.617436,41.863682],[-87.617438,41.863665],[-87.617551,41.86366],[-87.617551,41.863672],[-87.617714,41.863632],[-87.617868,41.863563],[-87.617881,41.863532],[-87.617924,41.863951],[-87.618043,41.863944],[-87.617944,41.862944],[-87.617993,41.86294],[-87.617968,41.862745],[-87.617997,41.862743],[-87.617901,41.861764],[-87.617899,41.861747],[-87.617869,41.861748],[-87.617856,41.861655],[-87.617819,41.86154],[-87.617755,41.861417],[-87.617716,41.86143],[-87.617665,41.861358],[-87.617679,41.861349],[-87.617644,41.861306],[-87.617629,41.861314],[-87.617474,41.861171],[-87.617274,41.861053],[-87.61728,41.861044],[-87.617225,41.861021],[-87.617218,41.861029],[-87.617112,41.86099],[-87.616955,41.860949],[-87.616851,41.860929],[-87.616758,41.860922],[-87.616764,41.860877],[-87.616596,41.860867],[-87.616587,41.860878],[-87.616528,41.860881],[-87.616527,41.860872],[-87.616518,41.860872],[-87.616356,41.8609],[-87.616367,41.860944],[-87.616142,41.861001],[-87.615933,41.861103],[-87.615923,41.861094],[-87.615876,41.861121]];

// ---- the plan, in the stadium's frame: u east (across the field), v south (along it), meters from midfield ----
const DECK = 13.5, STY = 14.0;                                       // the concourse decks and plaza; the colonnades' floor
const COL = { inner: 89, outer: 98.5, half: 39.5 };                  // a colonnade's body (|u| from 89 to 98.5, |v| < 39.5)
const PAV = { inner: 85.5, outer: 102.5, v0: 39.5, v1: 55 };         // its pavilions (|v| 39.5 to 55)
const ORDER = { top: 23.4, arch: 25.0, frieze: 26.9, cornice: 27.7, roof: 28.0, ridge: 30.4, bays: 22 };
const TERRACE = { west: -101, east: 97.5, north: -177, bank: -200, lawn: -143 };
// the old wall round the south end, its outer face (south half; the west half mirrors it)
const RING_PTS = [[102.5, 55], [101.5, 62], [99.5, 72], [97, 80], [91.6, 91.6], [84, 108], [74, 128], [56, 141], [39.6, 147.8], [20, 154], [0, 156.5]];
// the west grandstand's outer edge (north half; the south half mirrors it) and its front
const SAUCER_PTS = [[-101, 0], [-100.8, 10], [-100.2, 25], [-99, 40], [-97.5, 50], [-95.5, 57], [-93.5, 64], [-91.5, 72], [-89, 79], [-86, 85], [-82, 92], [-77, 99], [-71, 105.5], [-62, 112], [-54, 117], [-47, 120]];
const SAUCER_TIP = 119.5;
const frontU = (v) => -53 + 6.5 * Math.min(1, (v / 60) ** 2);       // the upper deck's front edge
const frontY = (v) => 10 + 22 * Math.min(1.13, Math.abs(v) / 112) ** 2.4;   // and its height: a saddle, rising to the tips
const RIM = 37.5, BACK = 37, SOFFIT = 34.5;                          // the rim deck; the top row; the fascia's foot
// the east building's outer face, from its north tip round the east side and the south end to the grandstand:
// [u, v, depth (to the inner face), roof]
const BAND_PTS = [[16, -123, 8, 32], [30, -119, 8, 33.5], [41.4, -113.7, 8.5, 35.6], [51, -107, 10, 36.5], [58.3, -100.9, 11.5, 37.5],
  [64, -92, 12.5, 38], [69.4, -82.7, 13.5, 38.3], [74.7, -62.7, 14, 39.1], [78.4, -45.2, 14.2, 39.4], [80.8, -29.4, 14.5, 39.7],
  [81.7, -14.4, 14.5, 40], [82, 0, 14.5, 40.3], [82.2, 14.5, 14.5, 40.4], [80.8, 29.4, 14.5, 40.1], [78.8, 45.5, 14.2, 39.7],
  [75.5, 63.3, 14, 39.3], [70.1, 83.5, 13, 38.6], [65, 95, 12.5, 38], [60.5, 104.8, 12, 37.5], [52, 112, 11, 36.5],
  [43.6, 119.8, 10, 35.3], [33, 122.5, 9, 35], [22, 124.6, 9, 34.8], [0, 124, 8, 33.3], [-21.4, 121.1, 8.5, 31.3],
  [-33, 118, 8, 30.5], [-41, 114.5, 7, 30]];
const FIELD = { a: 43.2, b: 68, p: 3.5 };                             // the field-level floor inside the bowl (a superellipse)
const NORTH_BACK = -131;                                             // the north stand's back

function local(origin) {
  const KX = 111320 * Math.cos(origin[1] * Math.PI / 180), KY = 111070;
  return (lon, lat) => [(lon - origin[0]) * KX, (origin[1] - lat) * KY];
}
// the stadium's frame to local meters
function frameToLocal(origin) {
  const [cx, cz] = local(origin)(...SOLDIER_FIELD_CENTRE), c = Math.cos(TURN), s = Math.sin(TURN);
  return (u, v) => [cx + u * c + v * s, cz - u * s + v * c];
}
// a Catmull-Rom curve through pts ([u, v, ...extra]), resampled every `step` meters (extras interpolated linearly)
function curve(pts, step) {
  const dense = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 16; k++) {
      const t = k / 16, t2 = t * t, t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push(p1.map((_, j) => (j < 2 ? cr(p0[j], p1[j], p2[j], p3[j]) : p1[j] + (p2[j] - p1[j]) * t)));
    }
  }
  dense.push([...pts[pts.length - 1]]);
  const out = [dense[0]];
  let acc = 0;
  for (let i = 1; i < dense.length; i++) {
    const a = dense[i - 1], b = dense[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let left = l;
    while (acc + left >= step) {
      const f = (l - left + step - acc) / l;
      out.push(a.map((x, j) => x + (b[j] - x) * f));
      left -= step - acc; acc = 0;
    }
    acc += left;
  }
  const last = dense[dense.length - 1], prev = out[out.length - 1];
  if (Math.hypot(last[0] - prev[0], last[1] - prev[1]) > step * 0.3) out.push(last); else out[out.length - 1] = last;
  return out;
}
const mirrorV = (pts) => [...pts.slice(1).reverse().map(([u, v, ...r]) => [u, -v, ...r]), ...pts];   // north half from the south half
const mirrorU = (pts) => [...pts.map(([u, v]) => [-u, v]), ...pts.slice(0, -1).reverse()];          // west half from the east half
// the podium's outline (the colonnades' and pavilions' bases, the old south wall, the north plaza), counterclockwise in
// u, v, with an `out` margin
function podium(out = 0) {
  const o = out, ring = curve(mirrorU(RING_PTS), 4).map(([u, v]) => {
    const l = Math.hypot(u / 1.4, v) || 1; return [u + (u / 1.4 / l) * o, v + (v / l) * o];
  });
  ring[0] = [-PAV.outer - o, PAV.v1]; ring[ring.length - 1] = [PAV.outer + o, PAV.v1];
  return [
    [-PAV.outer - o, -PAV.v1], [-PAV.outer - o, -PAV.v0], [-COL.outer - o, -PAV.v0], [-COL.outer - o, PAV.v0], [-PAV.outer - o, PAV.v0],
    ...ring,
    [PAV.outer + o, PAV.v0], [COL.outer + o, PAV.v0], [COL.outer + o, -PAV.v0], [PAV.outer + o, -PAV.v0], [PAV.outer + o, -PAV.v1],
    [TERRACE.east + o, -PAV.v1], [TERRACE.east + o, TERRACE.bank - o], [TERRACE.west - o, TERRACE.bank - o], [TERRACE.west - o, -PAV.v1],
  ];
}

// The ground OpenStreetMap's buildings give way to: OSM's outline of the stadium and the model's own footprint (with a
// 5 m margin), each a closed ring of local meters [x, z, x, z, ...]
export function soldierFieldSite(origin = FILM_ORIGIN) {
  const L = local(origin), F = frameToLocal(origin);
  const close = (r) => [...r, r[0], r[1]];
  return [close(SF_RING.flatMap(([lon, lat]) => L(lon, lat))), close(podium(5).flatMap(([u, v]) => F(u, v)))];
}

export function buildSoldierField({ THREE, origin = FILM_ORIGIN }) {
  const [cx, cz] = local(origin)(...SOLDIER_FIELD_CENTRE), g = new THREE.Group();
  g.position.set(cx, 0, cz); g.rotation.y = TURN;                     // everything below is in the stadium's frame (x = u, z = v)
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // (the same every build)

  // ---- the textures, each painted once on a canvas and repeated by the surfaces' uv ----
  const canvas = (w, h, draw, repeat = true) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    draw(cv.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const STONE = "#d3cec3", STONE_D = "#bdb7ab", JOINT = "rgba(120,110,95,0.22)";
  const ashlar = (c, w, h, course, x0 = 0, y0 = 0, x1 = w, y1 = h) => {   // coursed stone in a rectangle, `course` px a course
    c.fillStyle = STONE; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "90,80,70" : "255,255,250"},0.05)`; c.fillRect(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), 3, 2); }
    c.fillStyle = JOINT;
    for (let y = y0, r = 0; y < y1; y += course, r++) {
      c.fillRect(x0, y, x1 - x0, 1);
      for (let x = x0 + (r % 2) * course; x < x1; x += course * 2) c.fillRect(x, y, 1, course);
    }
  };
  const grille = (c, x, y, w, h, soft = false) => {                   // a window: deep reveal, dark green metal grille
    c.fillStyle = "#a59f93"; c.fillRect(x - 3, y - 3, w + 6, h + 6);
    c.fillStyle = soft ? "#4f5d52" : "#2b3a30"; c.fillRect(x, y, w, h);
    c.strokeStyle = "rgba(120,150,125,0.55)"; c.lineWidth = 1;
    for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + (w * k) / 4, y); c.lineTo(x + (w * k) / 4, y + h); c.stroke(); }
    for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(x, y + (h * k) / 7); c.lineTo(x + w, y + (h * k) / 7); c.stroke(); }
    c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, y, w, 3);
  };
  const T = {};
  T.stone = canvas(256, 256, (c, w, h) => ashlar(c, w, h, 32));      // 4.8 m x 4.8 m
  // the colonnades' bases: one column bay (3.59 m) by the base's 13.5 m; a tall window up, a small one low, a cornice band
  T.base = canvas(128, 480, (c, w, h) => {
    ashlar(c, w, h, 21);
    c.fillStyle = "#e0dbd0"; c.fillRect(0, 0, w, 18); c.fillStyle = "rgba(60,50,40,0.35)"; c.fillRect(0, 18, w, 5);   // the band at the top
    c.fillStyle = "#c9c3b7"; c.fillRect(0, 452, w, 28);                                                                // the plinth
    grille(c, 42, 105, 44, 110);                                                                                       // 7.4-10.6 m
    grille(c, 49, 372, 30, 34);                                                                                        // 1.6-2.6 m
  });
  // a pavilion's base: one face, 15.5 m by 13.5 m; a tall window over a door
  T.pavBase = canvas(256, 224, (c, w, h) => {
    ashlar(c, w, h, 14);
    c.fillStyle = "#e0dbd0"; c.fillRect(0, 0, w, 9); c.fillStyle = "rgba(60,50,40,0.35)"; c.fillRect(0, 9, w, 3);
    c.fillStyle = "#c9c3b7"; c.fillRect(0, 210, w, 14);
    c.fillStyle = "#c6c0b3"; c.fillRect(100, 52, 56, 6);
    grille(c, 110, 62, 36, 70);
    c.fillStyle = "#3d5141"; c.fillRect(114, 176, 28, 34);
  });
  // the entablature's face: one bay (3.59 m) by 3.5 m: the architrave (taenia, guttae), the frieze's triglyphs and roundels
  T.frieze = canvas(256, 256, (c, w, h) => {
    c.fillStyle = "#d8d3c8"; c.fillRect(0, 0, w, h);
    const fr = 256 * (1.9 / 3.5);                                     // the frieze's share, at the top
    c.fillStyle = "#cdc7bb"; c.fillRect(0, fr, w, 10);                // the taenia
    c.fillStyle = "rgba(70,60,50,0.45)"; c.fillRect(0, fr + 10, w, 3);
    c.fillStyle = "rgba(70,60,50,0.18)"; c.fillRect(0, fr + 52, w, 2); // the architrave's fascia
    for (const x0 of [0, 128]) {
      const tw = 46, tx = x0 - tw / 2;                                // a triglyph over each column and one between
      for (const xx of [tx, tx + 256]) {
        c.fillStyle = "#c9c3b6"; c.fillRect(xx, 8, tw, fr - 8);
        c.fillStyle = "rgba(60,52,44,0.45)"; for (const k of [0.25, 0.5, 0.75]) c.fillRect(xx + tw * k - 3, 14, 6, fr - 16);
        c.fillStyle = "rgba(60,52,44,0.35)"; c.fillRect(xx + 4, fr + 13, tw - 8, 5);   // the guttae
      }
      const mx = x0 + 64;                                            // the metope: a roundel
      c.strokeStyle = "rgba(90,80,68,0.55)"; c.lineWidth = 5; c.beginPath(); c.arc(mx, fr / 2 + 4, 30, 0, Math.PI * 2); c.stroke();
      c.fillStyle = "rgba(255,255,248,0.35)"; c.beginPath(); c.arc(mx - 3, fr / 2 + 1, 18, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = "rgba(60,52,44,0.35)"; c.fillRect(0, 0, w, 6);
  });
  // the old south wall: 18 m by 13.5 m; a band at the top, small windows in pairs, a gate
  T.ring = canvas(320, 240, (c, w, h) => {
    ashlar(c, w, h, 13);
    c.fillStyle = "#e0dbd0"; c.fillRect(0, 0, w, 10); c.fillStyle = "rgba(60,50,40,0.35)"; c.fillRect(0, 10, w, 4);
    c.fillStyle = "#c9c3b7"; c.fillRect(0, 226, w, 14);
    for (const x of [80, 240]) grille(c, x - 7, 62, 14, 20, true);
    c.fillStyle = "#c6c0b4"; c.fillRect(150, 14, 20, 212);           // a pier
    c.fillStyle = "rgba(60,50,40,0.15)"; c.fillRect(170, 14, 3, 212);
    c.fillStyle = "#aaa498"; c.fillRect(142, 172, 36, 54); c.fillStyle = "#56645a"; c.fillRect(147, 177, 26, 49);   // the gate
  });
  // the north plaza's walls: 9 m by 13.5 m of stone, a pier, a band at the top
  T.terrace = canvas(160, 240, (c, w, h) => {
    ashlar(c, w, h, 13);
    c.fillStyle = "#e0dbd0"; c.fillRect(0, 0, w, 10); c.fillStyle = "rgba(60,50,40,0.35)"; c.fillRect(0, 10, w, 4);
    c.fillStyle = "#c9c3b7"; c.fillRect(0, 226, w, 14);
    c.fillStyle = "#c4beb2"; c.fillRect(0, 14, 14, 212); c.fillStyle = "rgba(60,50,40,0.18)"; c.fillRect(14, 14, 3, 212);
  });
  T.tile = canvas(128, 128, (c, w, h) => {                            // red clay roof tile, 3 m square
    c.fillStyle = "#a65135"; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { c.fillStyle = "rgba(255,190,150,0.20)"; c.fillRect(x, 0, 3, h); c.fillStyle = "rgba(60,20,10,0.30)"; c.fillRect(x + 6, 0, 2, h); }
    for (let y = 0; y < h; y += 10) { c.fillStyle = "rgba(50,15,5,0.35)"; c.fillRect(0, y, w, 2); }
  });
  // the east building's glass: one storey (4.4 m) by 6 m; clear glass reflecting the sky, a white frit band, mullions
  const glassTex = (top, mid, low, band, mull) => canvas(256, 192, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h * 0.72);
    gr.addColorStop(0, top); gr.addColorStop(0.45, mid); gr.addColorStop(1, low);
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(255,255,255,${0.04 + rnd() * 0.06})`; c.fillRect(k * 64, 0, 64, h * 0.72); }
    c.fillStyle = band; c.fillRect(0, h * 0.72, w, h * 0.28);
    c.fillStyle = "rgba(255,255,255,0.35)"; c.fillRect(0, h * 0.72, w, 3);
    c.fillStyle = mull; for (let k = 0; k < 4; k++) c.fillRect(k * 64, 0, 4, h);
  });
  T.glassE = glassTex("#b6d3d6", "#6f9fa6", "#4f7f88", "#c9d4d6", "#d9e0e2");
  T.glassIn = glassTex("#7d939a", "#3d5157", "#2d3c42", "#8b969a", "#a8b0b2");
  T.glassS = canvas(128, 128, (c, w, h) => {                          // the grandstand's inclined glass: 4 m square, cable net
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8ea4a4"); gr.addColorStop(1, "#4d6366");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(225,232,232,0.65)"; c.fillRect(0, 0, w, 3); c.fillRect(0, 64, w, 2); c.fillRect(0, 0, 2, h);
  });
  T.soffit = canvas(256, 128, (c, w, h) => {                          // dark ribbed metal, 15 m by 8 m: slats, one white rib
    c.fillStyle = "#6a6e73"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { c.fillStyle = "rgba(190,195,200,0.30)"; c.fillRect(0, y, w, 1); c.fillStyle = "rgba(30,32,36,0.25)"; c.fillRect(0, y + 2, w, 1); }
    c.fillStyle = "#d4d8db"; c.fillRect(0, 0, 8, h);
  });
  T.fascia = canvas(256, 64, (c, w, h) => {                           // brushed silver panels, 9 m by 6 m
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f1f3f4"); gr.addColorStop(0.55, "#d6dadd"); gr.addColorStop(1, "#b3b9be");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(80,85,90,0.35)"; c.fillRect(0, 0, 2, h); c.fillRect(0, h * 0.18, w, 1);
  });
  T.seats = canvas(256, 256, (c, w, h) => {                           // 8 m wide by 4 rows (3.4 m deep): navy seats, an aisle
    for (let r = 0; r < 4; r++) {
      const y = r * 64;
      c.fillStyle = "#8a8c90"; c.fillRect(0, y, w, 64);              // the tread
      c.fillStyle = "#1f2c4c"; c.fillRect(0, y + 14, w, 34);          // the row of seats
      c.fillStyle = "#33456e"; c.fillRect(0, y + 14, w, 8);
      c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(0, y + 48, w, 6);  // the riser's shadow
      c.fillStyle = "rgba(255,255,255,0.10)"; for (let x = 0; x < w; x += 6) c.fillRect(x, y + 22, 1, 26);
    }
    c.fillStyle = "#9a9ca0"; c.fillRect(0, 0, 30, h);                 // the aisle
    c.fillStyle = "rgba(0,0,0,0.25)"; for (let y = 0; y < h; y += 16) c.fillRect(0, y, 30, 2);
  });
  T.deck = canvas(256, 256, (c, w, h) => {                            // concrete, 12 m square, 6 m joints
    c.fillStyle = "#bebcb6"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "60,60,60" : "255,255,255"},0.05)`; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
    c.fillStyle = "rgba(80,80,80,0.25)"; c.fillRect(0, 0, w, 2); c.fillRect(0, 128, w, 2); c.fillRect(0, 0, 2, h); c.fillRect(128, 0, 2, h);
  });
  T.grass = canvas(256, 256, (c, w, h) => {                           // lawn, 20 m square, mowing stripes
    c.fillStyle = "#6b8a4a"; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,220,0.07)"; c.fillRect(0, 0, w / 2, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? "30,50,20" : "200,230,150"},0.10)`; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
  });
  // the field: the whole floor of the bowl (86.4 m by 136 m) on one texture, 1 px = 0.2 m
  T.field = canvas(432, 680, (c, w, h) => {
    const S = 5, X = (u) => (u + FIELD.a) * S, Y = (v) => (v + FIELD.b) * S;
    c.fillStyle = "#3f6a35"; c.fillRect(0, 0, w, h);                 // the surround
    const yd = 0.9144, half = 26.67 * yd, end = 60 * yd, ez = 50 * yd;
    for (let k = -12; k < 12; k++) { c.fillStyle = k % 2 ? "#4f8a3e" : "#5a9646"; c.fillRect(X(-half), Y(k * 5 * yd), 2 * half * S, 5 * yd * S); }
    for (const sg of [-1, 1]) {                                        // the end zones: navy, an orange border
      const y0 = Y(sg < 0 ? -end : ez), y1 = Y(sg < 0 ? -ez : end);
      c.fillStyle = "#1c2848"; c.fillRect(X(-half), y0, 2 * half * S, y1 - y0);
      c.strokeStyle = "#d8642a"; c.lineWidth = 4; c.strokeRect(X(-half) + 8, y0 + 8, 2 * half * S - 16, y1 - y0 - 16);
    }
    c.fillStyle = "#f2f2ee";
    for (let k = -10; k <= 10; k++) c.fillRect(X(-half), Y(k * 5 * yd) - 1, 2 * half * S, 2);   // the yard lines
    for (let k = -50; k <= 50; k++) for (const u of [-half, -3.08, 3.08, half - 0.6]) c.fillRect(X(u), Y(k * yd) - 0.5, 3, 1);   // hashes
    c.lineWidth = 3; c.strokeStyle = "#f2f2ee"; c.strokeRect(X(-half), Y(-end), 2 * half * S, 2 * end * S);
    c.fillStyle = "rgba(240,240,235,0.9)"; c.font = "bold 26px sans-serif"; c.textAlign = "center";
    for (let k = -4; k <= 4; k++) { const n = 50 - Math.abs(k) * 10; for (const u of [-half + 8, half - 8]) { c.save(); c.translate(X(u), Y(k * 10 * yd)); c.rotate(u < 0 ? Math.PI / 2 : -Math.PI / 2); c.fillText(String(n), 0, 9); c.restore(); } }
  }, false);
  T.board = canvas(256, 96, (c, w, h) => {                            // a video board, lit
    const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#152448"); gr.addColorStop(0.6, "#22356a"); gr.addColorStop(1, "#c4552a");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,0.75)"; c.fillRect(16, 60, 120, 6); c.fillRect(16, 72, 80, 4);
    c.fillStyle = "#0d0f12"; c.fillRect(0, 0, w, 5); c.fillRect(0, h - 5, w, 5);
  }, false);
  T.flag = canvas(64, 40, (c, w, h) => {                              // the flags on the old wall's parapet
    for (let k = 0; k < 13; k++) { c.fillStyle = k % 2 ? "#f2f2f2" : "#b22234"; c.fillRect(0, (k * h) / 13, w, h / 13 + 1); }
    c.fillStyle = "#3c3b6e"; c.fillRect(0, 0, w * 0.42, h * 0.54);
  }, false);

  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, vertexColors: true, side: THREE.DoubleSide, ...o });
  const MAT = {
    stone: std({ map: T.stone, color: 0xffffff }),
    base: std({ map: T.base }), pavBase: std({ map: T.pavBase }), frieze: std({ map: T.frieze }), ring: std({ map: T.ring }),
    tile: std({ map: T.tile, roughness: 0.75 }),
    plain: std({ color: 0xd6d1c6 }),                                  // smooth stone (cornices, columns' abaci)
    shadow: std({ color: 0x77726a }),                                 // the colonnades' and porticos' back walls, in shade
    glassE: std({ map: T.glassE, roughness: 0.25, metalness: 0.15 }), glassIn: std({ map: T.glassIn, roughness: 0.3, metalness: 0.1 }),
    glassS: std({ map: T.glassS, roughness: 0.25, metalness: 0.15, emissive: 0xffffff, emissiveMap: T.glassS, emissiveIntensity: 0.12 }),
    soffit: std({ map: T.soffit, roughness: 0.6, emissive: 0xffffff, emissiveMap: T.soffit, emissiveIntensity: 0.16 }),
    fascia: std({ map: T.fascia, roughness: 0.32, metalness: 0.15, emissive: 0xffffff, emissiveMap: T.fascia, emissiveIntensity: 0.08 }),
    metal: std({ color: 0x7c8084, roughness: 0.5, metalness: 0.2 }), white: std({ color: 0xe9ebed, roughness: 0.5 }),
    roofE: std({ color: 0xd9dbdc, roughness: 0.8 }), dark: std({ color: 0x2c2f33 }), front: std({ color: 0x27304a, roughness: 0.6 }), terrace: std({ map: T.terrace }),
    seats: std({ map: T.seats }), deck: std({ map: T.deck }), grass: std({ map: T.grass, roughness: 1 }),
    field: std({ map: T.field, roughness: 1 }), yellow: std({ color: 0xf0cf2e, roughness: 0.5 }), board: std({ map: T.board, emissive: 0xffffff, emissiveMap: T.board, emissiveIntensity: 0.55 }),
  };

  // ---- the geometry, gathered by material into one mesh each ----
  const B = {};
  const batch = (k) => B[k] || (B[k] = { p: [], t: [], c: [], i: [] });
  // a grid of quads: P[i][j] = [u, y, v], U[i][j] = [s, t] (texture), shade S (number or function (i, j))
  const grid = (k, P, U, S = 1) => {
    const b = batch(k), o = b.p.length / 3, nj = P[0].length;
    P.forEach((row, i) => row.forEach((q, j) => {
      b.p.push(q[0], q[1], q[2]); b.t.push(U[i][j][0], U[i][j][1]);
      const s = typeof S === "function" ? S(i, j) : S; b.c.push(s, s, s);
    }));
    for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < nj - 1; j++) {
      const a = o + i * nj + j; b.i.push(a, a + nj, a + 1, a + 1, a + nj, a + nj + 1);
    }
  };
  const quad = (k, a, b, c, d, uv = [[0, 0], [1, 0], [1, 1], [0, 1]], s = 1) => grid(k, [[a, b], [d, c]], [[uv[0], uv[1]], [uv[3], uv[2]]], s);
  // a wall along the polyline pts ([u, v]) from y0 to y1 (numbers or functions of the point's index); texture u in
  // meters / tw from u0, v from (y - vy0) / th
  const wall = (k, pts, y0, y1, tw, th, { u0 = 0, vy0 = 0, s0 = 1, s1 = 1, closed = false } = {}) => {
    const q = closed ? [...pts, pts[0]] : pts, Y0 = typeof y0 === "function" ? y0 : () => y0, Y1 = typeof y1 === "function" ? y1 : () => y1;
    let acc = u0;
    const bot = [], top = [], ub = [], ut = [];
    q.forEach(([u, v], i) => {
      if (i) acc += Math.hypot(u - q[i - 1][0], v - q[i - 1][1]);
      const a = Y0(i), b = Y1(i);
      bot.push([u, a, v]); top.push([u, b, v]); ub.push([acc / tw, (a - vy0) / th]); ut.push([acc / tw, (b - vy0) / th]);
    });
    grid(k, [bot, top], [ub, ut], (i) => (i ? s1 : s0));
  };
  const box = (k, u0, u1, y0, y1, v0, v1, tile = 4, sTop = 1, sSide = 0.92, sBot = 0.55) => {
    const P = (a, b, c) => [a, b, c];
    const f = (pts, uvA, uvB, s) => quad(k, ...pts, [[0, 0], [uvA, 0], [uvA, uvB], [0, uvB]], s);
    const du = (u1 - u0) / tile, dy = (y1 - y0) / tile, dv = (v1 - v0) / tile;
    f([P(u0, y1, v0), P(u1, y1, v0), P(u1, y1, v1), P(u0, y1, v1)], du, dv, sTop);
    f([P(u0, y0, v0), P(u1, y0, v0), P(u1, y0, v1), P(u0, y0, v1)], du, dv, sBot);
    f([P(u0, y0, v0), P(u1, y0, v0), P(u1, y1, v0), P(u0, y1, v0)], du, dy, sSide);
    f([P(u0, y0, v1), P(u1, y0, v1), P(u1, y1, v1), P(u0, y1, v1)], du, dy, sSide);
    f([P(u0, y0, v0), P(u0, y0, v1), P(u0, y1, v1), P(u0, y1, v0)], dv, dy, sSide);
    f([P(u1, y0, v0), P(u1, y0, v1), P(u1, y1, v1), P(u1, y1, v0)], dv, dy, sSide);
  };
  // a flat polygon at height y (with holes), texture in meters / tile
  const flat = (k, outer, holes, y, tile, s = 1) => {
    const b = batch(k), o = b.p.length / 3, all = [outer, ...holes].flat();
    const tris = THREE.ShapeUtils.triangulateShape(outer.map(([u, v]) => new THREE.Vector2(u, v)), holes.map((h) => h.map(([u, v]) => new THREE.Vector2(u, v))));
    all.forEach(([u, v]) => { b.p.push(u, y, v); b.t.push(u / tile, v / tile); b.c.push(s, s, s); });
    tris.forEach(([a, c, d]) => b.i.push(o + a, o + c, o + d));
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const rayHit = (pu, pv, du, dv, poly) => {                         // distance along a ray to a closed polygon
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const [au, av] = poly[i], [bu, bv] = poly[(i + 1) % poly.length], eu = bu - au, ev = bv - av, den = du * ev - dv * eu;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((au - pu) * ev - (av - pv) * eu) / den, s = ((au - pu) * dv - (av - pv) * du) / den;
      if (t > 0.01 && s >= 0 && s <= 1 && t < best) best = t;
    }
    return best;
  };

  // ======== the colonnades and their pavilions (sg = -1 west, +1 east) ========
  const columns = [], flags = [];                                     // [u, v] of each column and each flagpole
  const BAY = (2 * COL.half) / ORDER.bays;
  for (const sg of [-1, 1]) {
    const U = (u) => sg * u, lo = (a, b) => [Math.min(U(a), U(b)), Math.max(U(a), U(b))];
    // the base: its outer face (windows in each bay), the band and plinth as boxes, the stone elsewhere
    wall("base", [[U(COL.outer), -COL.half], [U(COL.outer), COL.half]], 0, DECK, BAY, DECK);
    { const [a, b] = lo(COL.outer, COL.outer + 0.5); box("plain", a, b, 12.7, 13.5, -COL.half, COL.half, 4, 1, 0.97); }
    { const [a, b] = lo(COL.outer, COL.outer + 0.3); box("stone", a, b, 0, 0.9, -COL.half, COL.half, 4, 1, 0.85); }
    // the stylobate and the colonnade's floor
    { const [a, b] = lo(COL.inner, COL.outer + 0.3); box("plain", a, b, DECK, STY, -COL.half, COL.half, 4, 0.95, 0.9); }
    // the back wall (toward the bowl) and the dark recess behind the columns
    { const [a, b] = lo(COL.inner, COL.inner + 1.2); box("stone", a, b, STY, ORDER.top, -COL.half, COL.half, 4.8, 1, 0.9); }
    wall("shadow", [[U(COL.inner + 1.25), -COL.half], [U(COL.inner + 1.25), COL.half]], STY, ORDER.top, 4, 4);
    // the entablature: its block, its face (architrave and frieze), the cornice and the blocking course
    { const [a, b] = lo(COL.inner, COL.outer - 0.3); box("plain", a, b, ORDER.top, ORDER.frieze, -COL.half, COL.half, 4, 1, 0.9, 0.42); }
    wall("frieze", [[U(COL.outer - 0.28), -COL.half], [U(COL.outer - 0.28), COL.half]], ORDER.top, ORDER.frieze, BAY, ORDER.frieze - ORDER.top, { vy0: ORDER.top });
    { const [a, b] = lo(COL.inner - 0.4, COL.outer + 0.5); box("plain", a, b, ORDER.frieze, ORDER.cornice, -COL.half, COL.half, 4, 1, 1.0, 0.5); }
    { const [a, b] = lo(COL.inner, COL.outer); box("plain", a, b, ORDER.cornice, ORDER.roof, -COL.half, COL.half, 4, 0.85, 0.95); }
    // the double row of columns
    for (let k = 0; k < ORDER.bays; k++) {
      const v = -COL.half + BAY * (k + 0.5);
      columns.push([U(COL.outer - 1.25), v], [U(COL.inner + 4.6), v]);
    }
    // the pavilions
    for (const sv of [-1, 1]) {
      const V = (v) => sv * v, [v0, v1] = [Math.min(V(PAV.v0), V(PAV.v1)), Math.max(V(PAV.v0), V(PAV.v1))];
      const [a, b] = lo(COL.outer, PAV.outer), [ia, ib] = lo(PAV.inner, PAV.outer), vm = (v0 + v1) / 2;
      // its base projects from the colonnade's: a face with a window and a door on each side
      box("stone", a, b, 0, DECK, v0, v1, 4.8, 1, 0.92);
      wall("pavBase", [[U(PAV.outer + 0.01), V(PAV.v0)], [U(PAV.outer + 0.01), V(PAV.v1)]], 0, DECK, PAV.v1 - PAV.v0, DECK);
      wall("pavBase", [[U(COL.outer), V(sv > 0 ? PAV.v1 : PAV.v1) + sv * 0.01], [U(PAV.outer), V(PAV.v1) + sv * 0.01]], 0, DECK, PAV.v1 - PAV.v0, DECK, { u0: -1.5 });
      { const [c0, c1] = lo(COL.outer, PAV.outer + 0.5); box("plain", c0, c1, 12.7, DECK, v0 - 0.4, v1 + 0.4, 4, 1, 0.97); }
      box("plain", ia, ib + (sg > 0 ? 0.3 : 0), DECK, STY, v0, v1, 4, 0.95, 0.9);
      // the portico: 4 columns on each face (12 in all), the ceiling, the entablature, cornice, pediments and the roof
      const cu = [PAV.inner + 1.2, PAV.inner + 6.2, PAV.outer - 6.2, PAV.outer - 1.2], cv = [PAV.v0 + 1.2, PAV.v0 + 5.6, PAV.v1 - 5.6, PAV.v1 - 1.2];
      for (const u of cu) for (const v of cv) if (u === cu[0] || u === cu[3] || v === cv[0] || v === cv[3]) columns.push([U(u), V(v)]);
      box("plain", ia, ib, ORDER.top, ORDER.frieze, v0, v1, 4, 1, 0.9, 0.42);
      for (const [p, q] of [[[ia, v0 - 0.01], [ib, v0 - 0.01]], [[ib, v1 + 0.01], [ia, v1 + 0.01]], [[ia - 0.01, v1], [ia - 0.01, v0]], [[ib + 0.01, v0], [ib + 0.01, v1]]])
        wall("frieze", [p, q], ORDER.top, ORDER.frieze, BAY * 1.2, ORDER.frieze - ORDER.top, { vy0: ORDER.top });
      box("plain", ia - 0.5, ib + 0.5, ORDER.frieze, ORDER.cornice, v0 - 0.5, v1 + 0.5, 4, 1, 1, 0.5);
      // the gable: ridge along u at the pavilion's middle, pediments at both ends
      const e0 = v0 - 0.6, e1 = v1 + 0.6, ry = ORDER.ridge;
      for (const [uu, s] of [[ia - 0.4, 1], [ib + 0.4, 1]]) {
        quad("plain", [uu, ORDER.cornice, e0], [uu, ORDER.cornice, e1], [uu, ry, vm], [uu, ry, vm], undefined, 0.95 * s);   // the pediment
      }
      quad("tile", [ia - 0.7, ORDER.cornice, e0], [ib + 0.7, ORDER.cornice, e0], [ib + 0.7, ry + 0.15, vm], [ia - 0.7, ry + 0.15, vm], [[0, 0], [(ib - ia) / 3, 0], [(ib - ia) / 3, 3], [0, 3]], 0.95);
      quad("tile", [ia - 0.7, ORDER.cornice, e1], [ib + 0.7, ORDER.cornice, e1], [ib + 0.7, ry + 0.15, vm], [ia - 0.7, ry + 0.15, vm], [[0, 0], [(ib - ia) / 3, 0], [(ib - ia) / 3, 3], [0, 3]], 0.85);
      box("plain", ia - 0.7, ib + 0.7, ry, ry + 0.4, vm - 0.3, vm + 0.3, 2);                       // the ridge
      for (const uu of [ia - 0.6, ib + 0.6]) {                         // acroteria at the apex and the corners
        box("plain", uu - 0.35, uu + 0.35, ry, ry + 1.3, vm - 0.5, vm + 0.5, 2);
        for (const vv of [e0 + 0.4, e1 - 0.4]) box("plain", uu - 0.3, uu + 0.3, ORDER.cornice, ORDER.cornice + 0.9, vv - 0.3, vv + 0.3, 2);
      }
    }
  }

  // ======== the podium: the old south wall, the north plaza's walls, the decks, the lawn and its bank ========
  const OUT = podium(0);
  {
    const ring = curve(mirrorU(RING_PTS), 3);
    wall("ring", ring, 0, DECK, 18, DECK, { u0: 4 });
    // its cornice band and the deck's parapet (with a flag every 12 m)
    const offs = (pts, d) => pts.map(([u, v], i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], du = b[0] - a[0], dv = b[1] - a[1], l = Math.hypot(du, dv) || 1;
      return [u + (dv / l) * d, v - (du / l) * d];
    });
    const out1 = offs(ring, -0.45), in1 = offs(ring, 0.3);
    wall("plain", out1, 12.7, DECK + 0.15, 4, 4, { s0: 0.9, s1: 1 });
    grid("plain", [out1.map(([u, v]) => [u, DECK + 0.15, v]), ring.map(([u, v]) => [u, DECK + 0.15, v])], [out1.map(() => [0, 0]), ring.map(() => [0, 1])], 1);
    wall("plain", ring, DECK, DECK + 1.1, 4, 4);
    wall("plain", in1, DECK, DECK + 1.1, 4, 4, { s0: 0.8, s1: 0.95 });
    grid("plain", [ring.map(([u, v]) => [u, DECK + 1.1, v]), in1.map(([u, v]) => [u, DECK + 1.1, v])], [ring.map(() => [0, 0]), in1.map(() => [0, 1])], 1.05);
    for (let i = 2, acc = 0; i < ring.length - 2; i++) {
      acc += Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]);
      if (acc > 12) { acc = 0; flags.push(in1[i]); }
    }
  }
  // the north plaza's walls (west and east, from the pavilions to the bank) and parapets
  for (const [u, s] of [[TERRACE.west, -1], [TERRACE.east, 1]]) {
    wall("terrace", [[u, -PAV.v1], [u, TERRACE.north]], 0, DECK, 9, DECK);
    wall("terrace", [[u, TERRACE.north], [u, TERRACE.bank]], 0, (i) => (i ? 0 : DECK), 9, DECK, { u0: TERRACE.north + PAV.v1 });
    box("plain", Math.min(u, u - s * 0.5), Math.max(u, u - s * 0.5), DECK, DECK + 1.1, TERRACE.north, -PAV.v1, 4, 1.02, 0.95);
    box("plain", Math.min(u, u + s * 0.4), Math.max(u, u + s * 0.4), 12.7, DECK + 0.1, TERRACE.north, -PAV.v1, 4, 1, 0.92);
  }
  // the bank down from the lawn
  grid("grass", [[[TERRACE.west, DECK, TERRACE.north], [TERRACE.east, DECK, TERRACE.north]], [[TERRACE.west, 0.02, TERRACE.bank], [TERRACE.east, 0.02, TERRACE.bank]]],
    [[[0, 0], [10, 0]], [[0, 1], [10, 1]]], 0.92);
  flat("grass", [[TERRACE.west, TERRACE.lawn], [TERRACE.east, TERRACE.lawn], [TERRACE.east, TERRACE.north], [TERRACE.west, TERRACE.north]], [], DECK, 20);

  // ======== the east building (the glass band round the east side and the south end) ========
  const band = curve(BAND_PTS, 2.5);
  const bandN = band.map((p, i) => {                                  // the inward normal (toward the field)
    const a = band[Math.max(0, i - 1)], b = band[Math.min(band.length - 1, i + 1)], du = b[0] - a[0], dv = b[1] - a[1], l = Math.hypot(du, dv) || 1;
    return [-dv / l, du / l];
  });
  const bandIn = band.map(([u, v, w], i) => [u + bandN[i][0] * w, v + bandN[i][1] * w]);
  {
    // the outer face: glass storeys from the deck, bulging out by 1.5 m at mid-height, a white roof edge
    const rows = [[DECK, -1.6], [DECK + 4.4, -0.6], [DECK + 8.8, 0], [DECK + 13.2, 0.25], [DECK + 17.6, 0], [DECK + 22, -0.5], [null, -1.0]];
    const P = [], U = [];
    let acc = 0;
    band.forEach(([u, v, , r], i) => { if (i) acc += Math.hypot(u - band[i - 1][0], v - band[i - 1][1]); band[i].acc = acc; });
    rows.forEach(([y, off]) => {
      P.push(band.map(([u, v, , r], i) => { const yy = y === null ? r - 1.3 : Math.min(y, r - 1.3); return [u - bandN[i][0] * off, yy, v - bandN[i][1] * off]; }));
      U.push(band.map(([u, v, , r], i) => [band[i].acc / 6, ((y === null ? r - 1.3 : Math.min(y, r - 1.3)) - DECK) / 4.4]));
    });
    grid("glassE", P, U, (i) => 0.92 + i * 0.03);
    // the roof edge and the roof
    wall("roofE", band.map(([u, v], i) => [u + bandN[i][0] * 1.0, v + bandN[i][1] * 1.0]), (i) => band[i][3] - 1.3, (i) => band[i][3], 4, 4, { s0: 1, s1: 1.05 });
    grid("roofE", [band.map(([u, v, , r], i) => [u + bandN[i][0] * 1.0, r, v + bandN[i][1] * 1.0]), bandIn.map(([u, v], i) => [u, band[i][3], v])],
      [band.map((_, i) => [band[i].acc / 8, 0]), band.map((_, i) => [band[i].acc / 8, 1])], 1.0);
    // the inner face, toward the field: the suites' dark glass from the bowl's floor to the roof
    wall("glassIn", bandIn, 0, (i) => band[i][3], 6, 4.4, { s0: 0.7, s1: 1 });
    // its ends
    for (const i of [0, band.length - 1]) quad("glassE", [band[i][0], DECK, band[i][1]], [bandIn[i][0], DECK, bandIn[i][1]], [bandIn[i][0], band[i][3], bandIn[i][1]], [band[i][0], band[i][3], band[i][1]], [[0, 0], [2, 0], [2, 4], [0, 4]], 0.85);
    // rooftop plant, and the floodlight gantries along the inner edge on the east side
    for (let i = 4; i < band.length - 4; i += 7) {
      const [u, v, w, r] = band[i], m = [u + bandN[i][0] * w * 0.45, v + bandN[i][1] * w * 0.45];
      if (rnd() < 0.5) box("roofE", m[0] - 1.6, m[0] + 1.6, r, r + 1.2 + rnd() * 0.8, m[1] - 1.6, m[1] + 1.6, 4, 0.92, 0.8);
    }
    for (let i = 0; i < band.length; i++) {
      const [u, v, w, r] = band[i]; if (Math.abs(v) > 80 || u < 50) continue;
      if (i % 4) continue;
      const m = [bandIn[i][0] - bandN[i][0] * 1.2, bandIn[i][1] - bandN[i][1] * 1.2];
      box("metal", m[0] - 0.2, m[0] + 0.2, r, r + 3.6, m[1] - 0.2, m[1] + 0.2, 2);
      box("metal", m[0] - 0.3, m[0] + 0.3, r + 2.4, r + 3.8, m[1] - 1.8, m[1] + 1.8, 2, 1.1, 1.0);
      quad("white", [m[0] - 0.32, r + 2.5, m[1] - 1.7], [m[0] - 0.32, r + 2.5, m[1] + 1.7], [m[0] - 0.32, r + 3.7, m[1] + 1.7], [m[0] - 0.32, r + 3.7, m[1] - 1.7], undefined, 1.15);
    }
  }

  // ======== the west grandstand: the saucer ========
  const sauc = curve(mirrorV(SAUCER_PTS), 1);
  const outerU = (v) => {                                             // its outer edge as a function of v
    const a = Math.max(-120, Math.min(120, v));
    for (let i = 1; i < sauc.length; i++) if (sauc[i][1] >= a) { const p = sauc[i - 1], q = sauc[i], t = (a - p[1]) / (q[1] - p[1] || 1); return lerp(p[0], q[0], t); }
    return sauc[sauc.length - 1][0];
  };
  const SV = [];                                                      // its stations, every 2 m, finer toward the tips
  for (let v = -SAUCER_TIP; v <= SAUCER_TIP + 0.01; v += Math.abs(v) > 100 ? 1 : 2) SV.push(v);
  const S = SV.map((v) => {
    const uo = outerU(v), uf = Math.max(uo + 0.4, frontU(v)), len = uf - uo;
    const ub = uo + Math.min(10, len * 0.5);                          // the top row
    const ug = uo + Math.min(20, len * 0.7);                          // where the glass meets the soffit
    const yf = Math.min(frontY(v), BACK - 0.5);
    const seatY = (u) => lerp(yf, BACK, (uf - u) / (uf - ub || 1));
    // the soffit runs straight from the fascia's foot down to the glass, but stays clear of the colonnade and the pavilions
    const u0 = uo + 0.7, av = Math.abs(v);
    const clear = (uObs, yObs) => SOFFIT + ((yObs - SOFFIT) * (ug - u0)) / (uObs - u0);
    const wc = Math.max(0, Math.min(1, (COL.half + 2 - av) / 3)), wp = Math.max(0, Math.min(1, (PAV.v1 + 2.5 - av) / 3)) * (1 - wc);
    let yg = Math.min(seatY(ug) - 5.4, 33);
    if (wc > 0) yg = Math.max(yg, lerp(yg, clear(-COL.inner, ORDER.roof + 0.6), wc));
    if (wp > 0) yg = Math.max(yg, lerp(yg, clear(-PAV.inner + 0.5, ORDER.ridge + 1.6), wp));
    const uFoot = ug + Math.min(6, (uf - ug) * 0.5);
    return { v, uo, uf, ub, ug, yf, yg, uFoot, seatY, len };
  });
  {
    const M = 16;
    // the seats, front to the top row
    grid("seats", S.map((s) => { const r = []; for (let j = 0; j <= M; j++) { const u = lerp(s.uf, s.ub, j / M); r.push([u, s.seatY(u), s.v]); } return r; }),
      S.map((s) => { const r = []; for (let j = 0; j <= M; j++) r.push([s.v / 8, ((s.uf - s.ub) * j) / M / 3.4]); return r; }), (i, j) => 0.85 + 0.15 * (j / M));
    // the rim deck from the top row to the edge, and the silver fascia round it (bulging a little)
    grid("roofE", S.map((s) => [[s.ub, BACK, s.v], [s.ub, RIM, s.v], [s.uo + 0.3, RIM, s.v]]), S.map((s) => [[s.v / 8, 0], [s.v / 8, 0.1], [s.v / 8, 1]]), 0.95);
    grid("fascia", S.map((s) => [[s.uo + 0.7, SOFFIT, s.v], [s.uo - 0.25, 36.6, s.v], [s.uo, RIM + 1.1, s.v], [s.uo + 0.3, RIM + 2.2, s.v]]),
      S.map((s, i) => [[s.v / 9, 0], [s.v / 9, 0.43], [s.v / 9, 0.85], [s.v / 9, 1]]), (i, j) => [0.82, 1.0, 1.08, 1.12][j]);
    grid("roofE", S.map((s) => [[s.uo + 0.3, RIM + 2.2, s.v], [s.uo + 1.6, RIM + 2.2, s.v], [s.uo + 1.6, RIM, s.v]]), S.map((s) => [[0, 0], [0, 0.3], [0, 0.6]]), 0.95);
    // the soffit: from the fascia down and in to the glass, then under the seats to the front
    grid("soffit", S.map((s) => [[s.uo + 0.7, SOFFIT, s.v], [lerp(s.uo + 0.7, s.ug, 0.5), lerp(SOFFIT, s.yg, 0.5), s.v], [s.ug, s.yg, s.v], [s.uf, s.yf - 2, s.v]]),
      S.map((s) => [[s.v / 15, 0], [s.v / 15, (s.ug - s.uo) / 16], [s.v / 15, (s.ug - s.uo) / 8], [s.v / 15, (s.uf - s.uo) / 8]]), (i, j) => [0.9, 0.8, 0.72, 0.6][j]);
    // the front of the upper deck (a parapet) and the dark wall under it
    grid("front", S.map((s) => [[s.uf, s.yf - 2, s.v], [s.uf, s.yf + 0.8, s.v]]), S.map(() => [[0, 0], [0, 1]]), 1);
    grid("roofE", S.map((s) => [[s.uf, s.yf + 0.8, s.v], [s.uf - 0.4, s.yf + 0.8, s.v]]), S.map(() => [[0, 0], [0, 1]]), 1);
    // (kept inside the glass wall's foot, which comes close to the front at the tips)
    const uw = (s) => Math.max(s.uf - 2, s.uFoot + 0.3);
    grid("dark", S.map((s) => [[uw(s), 0, s.v], [uw(s), Math.max(0.1, Math.min(DECK, s.yf - 2)), s.v]]), S.map(() => [[0, 0], [0, 1]]), 0.6);
    grid("front", S.map((s) => [[uw(s), Math.min(DECK, s.yf - 2), s.v], [uw(s), s.yf - 2, s.v]]), S.map(() => [[0, 0], [0, 1]]), 0.7);
    // the inclined glass wall under the soffit, its foot on the deck
    grid("glassS", S.map((s) => [[s.uFoot, DECK, s.v], [s.ug, s.yg, s.v]]), S.map((s) => [[s.v / 4, 0], [s.v / 4, (s.yg - DECK) / 4]]), (i, j) => 0.85 + 0.15 * j);
    // the tips' caps
    for (const s of [S[0], S[S.length - 1]]) {
      quad("fascia", [s.uo, SOFFIT, s.v], [s.uf, s.yf - 2, s.v], [s.uf, s.yf + 0.8, s.v], [s.uo, RIM + 2.2, s.v], undefined, 0.9);
      // and the glass closing the concourse under the tip, from the deck to the soffit
      grid("glassS", [[[s.uFoot, DECK, s.v], [s.uf - 2, DECK, s.v]], [[s.ug, s.yg, s.v], [s.uf, s.yf - 2, s.v]]], [[[0, 0], [1, 0]], [[0, 2], [1, 2]]], 0.9);
    }
    // the north stand's west end, from the grandstand's north tip back to the stand's back wall
    wall("glassE", [[S[0].uf - 2, S[0].v], [S[0].uf - 2, NORTH_BACK]], DECK, (i) => (i ? 25.6 : S[0].yf - 2), 6, 4.4, { vy0: DECK });
    // the white frames along the rim: a post at the top row and one at the edge every ~10 m, a beam over, rails along
    const rail = (f, y) => S.map((s) => [lerp(s.ub, s.uo, f), y, s.v]);
    for (const [f, y] of [[0.15, RIM + 6.3], [0.85, RIM + 6.3]]) {
      const r = rail(f, y);
      grid("white", [r, r.map(([u, yy, v]) => [u, yy + 0.45, v])], [r.map(() => [0, 0]), r.map(() => [0, 1])], 1.1);
    }
    let acc = 99, last = null;
    S.forEach((s, i) => {
      if (i) acc += Math.abs(s.v - S[i - 1].v);
      if (acc < 10 || s.len < 14) return; acc = 0;
      for (const f of [0.15, 0.85]) { const u = lerp(s.ub, s.uo, f); box("white", u - 0.22, u + 0.22, RIM, RIM + 6.4, s.v - 0.22, s.v + 0.22, 2, 1.1, 1.05); }
      if (last) for (const f of [0.15, 0.85]) {                      // a diagonal brace in each bay
        const a = [lerp(last.ub, last.uo, f), RIM + 0.3, last.v], b = [lerp(s.ub, s.uo, f), RIM + 6.3, s.v];
        grid("white", [[a, b], [[a[0], a[1] + 0.4, a[2]], [b[0], b[1] + 0.4, b[2]]]], [[[0, 0], [1, 0]], [[0, 1], [1, 1]]], 1.05);
      }
      last = s;
      box("white", Math.min(lerp(s.ub, s.uo, 0.15), lerp(s.ub, s.uo, 0.85)), Math.max(lerp(s.ub, s.uo, 0.15), lerp(s.ub, s.uo, 0.85)), RIM + 6.3, RIM + 7.3, s.v - 0.25, s.v + 0.25, 2, 1.1, 1.05);
    });
  }
  // its V-struts: pairs from the glass's foot up and out to the soffit (inside the colonnade's line beside it)
  const struts = [];
  {
    let acc = 99;
    S.forEach((s, i) => {
      if (i) acc += Math.abs(s.v - S[i - 1].v);
      if (acc < 13 || s.len < 16) return; acc = 0;
      const inset = Math.abs(s.v) < 58 ? 14 : 7, top = s.uo + inset;
      const ty = lerp(SOFFIT, s.yg, Math.min(1, (inset - 0.7) / Math.max(1, s.ug - s.uo - 0.7)));
      for (const dv of [-3.5, 3.5]) struts.push([[s.uFoot - 1.2, DECK, s.v], [top, ty - 0.4, s.v + dv]]);
    });
  }

  // ======== the bowl: the field, the lower bowl and the end stands ========
  // the back of the seating: the east building's inner face, the grandstand's front (2 m under it), the north stand's back
  const tipIn = bandIn[0];
  const back = [...bandIn.map(([u, v]) => [u, v]), [S[S.length - 1].uf - 2, S[S.length - 1].v - 1.5],
    ...S.slice().reverse().map((s) => [s.uf - 2, s.v]), [S[0].uf - 2, NORTH_BACK], [tipIn[0], NORTH_BACK]];
  // the field's edge, as a superellipse resampled every ~1.6 m, and its outward normals
  const edge = [];
  {
    const dense = [];
    for (let k = 0; k < 2000; k++) {
      const t = (k / 2000) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      dense.push([FIELD.a * Math.sign(c) * Math.abs(c) ** (2 / FIELD.p), FIELD.b * Math.sign(s) * Math.abs(s) ** (2 / FIELD.p)]);
    }
    let per = 0; dense.forEach((p, i) => { const q = dense[(i + 1) % dense.length]; per += Math.hypot(q[0] - p[0], q[1] - p[1]); });
    const n = Math.round(per / 1.6), step = per / n;
    let acc = 0, k = 0;
    for (let i = 0; i < n; i++) {
      const target = i * step;
      while (true) { const p = dense[k % 2000], q = dense[(k + 1) % 2000], l = Math.hypot(q[0] - p[0], q[1] - p[1]); if (acc + l >= target) { const f = (target - acc) / l; edge.push([lerp(p[0], q[0], f), lerp(p[1], q[1], f), target]); break; } acc += l; k++; }
    }
    edge.forEach((e) => {                                             // the normal: the superellipse's gradient
      const [u, v] = e, gu = Math.sign(u) * Math.abs(u / FIELD.a) ** (FIELD.p - 1) / FIELD.a, gv = Math.sign(v) * Math.abs(v / FIELD.b) ** (FIELD.p - 1) / FIELD.b, l = Math.hypot(gu, gv) || 1;
      e.push(gu / l, gv / l);
    });
    edge.push([...edge[0].slice(0, 2), per, ...edge[0].slice(3)]);
  }
  {
    // each side's rake, by the distance d out from the field's edge (LiDAR): east, lower bowl then a club tier; west, the
    // lower bowl (its back under the grandstand); north and south, single tiers
    const prof = (nu, nv, d) => {
      const wE = Math.max(0, nu) ** 2, wW = Math.max(0, -nu) ** 2, wS = Math.max(0, nv) ** 2, wN = Math.max(0, -nv) ** 2;
      const E = d < 12 ? 1.3 + 0.48 * d : d < 13 ? 7.06 + (d - 12) * 5.94 : 13 + 0.68 * (d - 13);
      const W = 1.3 + 0.48 * d, N = 1.3 + 0.42 * Math.max(0, d - 6), Sv = 1.3 + 0.405 * Math.max(0, d - 8);
      return (wE * E + wW * W + wS * Sv + wN * N) / (wE + wW + wS + wN);
    };
    const M = 40, P = [], U = [];
    edge.forEach(([u, v, s, nu, nv]) => {
      const dmax = Math.min(70, rayHit(u, v, nu, nv, back) + 0.3), r = [[u, 0.06, v]], t = [[s / 8, -0.4]];
      for (let j = 0; j <= M; j++) { const d = (dmax * j) / M; r.push([u + nu * d, prof(nu, nv, d), v + nv * d]); t.push([s / 8, d / 3.4]); }
      P.push(r); U.push(t);
    });
    grid("seats", P, U, (i, j) => (j === 0 ? 0.6 : 0.85 + 0.15 * Math.min(1, j / M)));
    // the field's floor
    flat("field", edge.slice(0, -1).map(([u, v]) => [u, v]), [], 0.06, 1);
    const fb = B.field; for (let k = 0; k < fb.p.length; k += 3) { fb.t[(k / 3) * 2] = (fb.p[k] + FIELD.a) / (2 * FIELD.a); fb.t[(k / 3) * 2 + 1] = 1 - (fb.p[k + 2] + FIELD.b) / (2 * FIELD.b); }
    // the goalposts at the end lines
    for (const sv of [-1, 1]) {
      const v = sv * 60 * 0.9144, yel = "yellow";
      box(yel, -0.2, 0.2, 0, 3.05, v + sv * 1.2 - 0.2, v + sv * 1.2 + 0.2, 1);
      box(yel, -0.15, 0.15, 2.9, 3.2, v - 0.15, v + sv * 1.2, 1);
      box(yel, -2.82, 2.82, 3.0, 3.25, v - 0.12, v + 0.12, 1);
      for (const u of [-2.82, 2.82]) box(yel, u - 0.1, u + 0.1, 3.0, 12.2, v - 0.1, v + 0.1, 1);
    }
    // the north stand's back wall and top, and the concourse building behind it (on the plaza)
    const nb = [[S[0].uf - 2, NORTH_BACK], [tipIn[0], NORTH_BACK]];
    wall("dark", nb, 0, DECK, 4, 4, { s0: 0.6, s1: 0.8 });
    wall("glassE", nb, DECK, 25.6, 6, 4.4, { vy0: DECK });
    box("roofE", nb[0][0], nb[1][0], 25.6, 26.0, NORTH_BACK - 0.6, NORTH_BACK + 0.4, 4);
    box("glassE", -44, tipIn[0] - 2, DECK, 20.6, -143, NORTH_BACK - 0.6, 6, 1, 0.92);
    box("roofE", -44.5, tipIn[0] - 1.5, 20.6, 21.2, -143.5, NORTH_BACK - 0.6, 4, 1, 1);
    // the NE corner, where the north stand meets the east building's tip
    wall("glassIn", [[tipIn[0], NORTH_BACK], [tipIn[0], tipIn[1]]], 0, 26, 6, 4.4);
    wall("glassE", [[band[0][0], band[0][1]], [tipIn[0], NORTH_BACK]], DECK, (i) => (i ? 26 : band[0][3]), 6, 4.4, { vy0: DECK });
    box("roofE", tipIn[0] - 0.5, band[0][0] + 0.5, 25.6, 26.0, NORTH_BACK - 0.6, band[0][1], 4);
    // and the SW, between the east building's end and the grandstand's tip
    const se = band[band.length - 1], st = S[S.length - 1];
    wall("glassE", [[se[0], se[1]], [st.uo + 1, st.v]], DECK, (i) => (i ? RIM : se[3]), 6, 4.4, { vy0: DECK });
    // the video boards: north, over the north stand; south, on the east building's south end
    box("metal", -6.5, 22.5, 25.5, 35.0, NORTH_BACK - 1.6, NORTH_BACK - 0.6, 4, 1, 0.9);
    quad("board", [-6, 26, NORTH_BACK - 0.55], [22, 26, NORTH_BACK - 0.55], [22, 34.5, NORTH_BACK - 0.55], [-6, 34.5, NORTH_BACK - 0.55], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    const sb = (u) => { let best = bandIn[0], bd = 1e9; bandIn.forEach((q) => { if (q[1] > 0 && Math.abs(q[0] - u) < bd) { bd = Math.abs(q[0] - u); best = q; } }); return best[1]; };
    const sv0 = Math.min(sb(-38), sb(-10)) - 0.8;
    box("metal", -38.5, -9.5, 19.5, 31.0, sv0, sv0 + 1.0, 4, 1, 0.9);
    quad("board", [-10, 20, sv0 - 0.05], [-38, 20, sv0 - 0.05], [-38, 30.5, sv0 - 0.05], [-10, 30.5, sv0 - 0.05], [[0, 0], [1, 0], [1, 1], [0, 1]]);
  }

  // ======== the decks: the concourse level round the bowl, from the podium's walls to the stands ========
  {
    const hole = [...band.map(([u, v]) => [u, v]), ...S.slice().reverse().map((s) => [s.uFoot, s.v]),
      [S[0].uo + 1, NORTH_BACK - 0.5], [band[0][0], NORTH_BACK - 0.5]];
    // (the podium's outline, its north part cut at the lawn's edge)
    const deckOut = [];
    OUT.forEach((p) => { if (p[1] >= -PAV.v1 - 0.01) deckOut.push(p); });
    const iE = deckOut.findIndex(([u, v]) => u === TERRACE.east && v === -PAV.v1);
    deckOut.splice(iE + 1, 0, [TERRACE.east, TERRACE.lawn], [TERRACE.west, TERRACE.lawn]);
    flat("deck", deckOut, [hole], DECK, 12);
  }

  // ---- the meshes ----
  for (const [k, b] of Object.entries(B)) {
    if (!b.i.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(b.t, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
    geo.setIndex(b.i); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, MAT[k]); m.name = `soldier-field-${k}`;
    g.add(m);
  }
  // the columns: fluted, tapering shafts with an echinus and a square abacus, all one instanced mesh
  {
    const pos = [], idx = [], H = ORDER.top - STY, SH = H - 0.85, R0 = 1.0, R1 = 0.8, NF = 20, SEG = NF * 3, RINGS = 5;
    const ring = (y, r, fl) => { const o = pos.length / 3; for (let k = 0; k <= SEG; k++) { const t = (k / SEG) * Math.PI * 2, f = (k % 3) / 3, rr = r * (1 - fl * Math.sin(Math.PI * f)); pos.push(Math.cos(t) * rr, y, Math.sin(t) * rr); } return o; };
    const join = (a, b) => { for (let k = 0; k < SEG; k++) idx.push(a + k, b + k, a + k + 1, a + k + 1, b + k, b + k + 1); };
    let prev = ring(0, R0, 0.06);
    for (let r = 1; r <= RINGS; r++) { const t = r / RINGS, rr = lerp(R0, R1, t) + 0.05 * Math.sin(Math.PI * t); const o = ring(SH * t, rr, 0.06); join(prev, o); prev = o; }
    const neck = ring(SH, R1 * 0.97, 0); join(prev, neck);
    const ech = [[SH + 0.08, 0.86], [SH + 0.25, 1.0], [SH + 0.4, 1.1], [SH + 0.45, 1.12]];
    let p2 = neck; for (const [y, r] of ech) { const o = ring(y, r, 0); join(p2, o); p2 = o; }
    const top = ring(SH + 0.45, 0.2, 0); join(p2, top);
    const shaft = new THREE.BufferGeometry();
    shaft.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); shaft.setIndex(idx); shaft.computeVertexNormals();
    const aba = new THREE.BoxGeometry(2.45, H - SH - 0.45, 2.45).toNonIndexed(); aba.translate(0, (H + SH + 0.45) / 2, 0);
    const sh = shaft.toNonIndexed();
    const merged = new THREE.BufferGeometry(), P = [...sh.attributes.position.array, ...aba.attributes.position.array], N = [...sh.attributes.normal.array, ...aba.attributes.normal.array];
    merged.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); merged.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    const cols = new THREE.InstancedMesh(merged, new THREE.MeshStandardMaterial({ color: 0xd9d4c9, roughness: 0.8 }), columns.length);
    const o = new THREE.Object3D();
    columns.forEach(([u, v], i) => { o.position.set(u, STY, v); o.updateMatrix(); cols.setMatrixAt(i, o.matrix); });
    cols.name = "soldier-field-columns"; g.add(cols);
  }
  // the grandstand's struts, and the flagpoles and flags on the old wall
  {
    const cyl = new THREE.CylinderGeometry(0.32, 0.32, 1, 10); cyl.translate(0, 0.5, 0);
    const st = new THREE.InstancedMesh(cyl, new THREE.MeshStandardMaterial({ color: 0xe4e7e9, roughness: 0.5 }), struts.length);
    const o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
    struts.forEach(([a, b], i) => {
      d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const l = d.length(); d.normalize();
      o.position.set(...a); o.quaternion.setFromUnitVectors(up, d); o.scale.set(1, l, 1); o.updateMatrix(); st.setMatrixAt(i, o.matrix);
    });
    st.name = "soldier-field-struts"; g.add(st);
    const pole = new THREE.CylinderGeometry(0.06, 0.08, 9, 6); pole.translate(0, 4.5, 0);
    const poles = new THREE.InstancedMesh(pole, new THREE.MeshStandardMaterial({ color: 0xcfd2d4, roughness: 0.4 }), flags.length);
    const fl = new THREE.PlaneGeometry(2.2, 1.3); fl.translate(1.15, 0, 0);
    const cloth = new THREE.InstancedMesh(fl, new THREE.MeshStandardMaterial({ map: T.flag, side: THREE.DoubleSide, roughness: 0.9 }), flags.length);
    flags.forEach(([u, v], i) => {
      o.position.set(u, DECK + 1.1, v); o.quaternion.identity(); o.scale.set(1, 1, 1); o.updateMatrix(); poles.setMatrixAt(i, o.matrix);
      o.position.set(u, DECK + 1.1 + 8.1, v); o.rotation.set(0, 0.6 + (i % 5) * 0.15, 0); o.updateMatrix(); cloth.setMatrixAt(i, o.matrix);
    });
    poles.name = "soldier-field-flagpoles"; cloth.name = "soldier-field-flags"; g.add(poles, cloth);
  }
  g.traverse((ob) => { if (ob.isMesh) { ob.castShadow = !ob.material.transparent; ob.receiveShadow = true; } });
  return g;
}
