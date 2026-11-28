// Operator's-eye ride along the whole Clinton-Roosevelt Connector: north on
// the Metra Electric as it pulls out of McCormick Place, calling at
// 18th (Soldier Field), then down a ramp and through the portal,
// west to Roosevelt, north under Clinton Street calling at Taylor/Clinton,
// Union Station and Randolph/Clinton, then up a ramp and out onto the
// surface to Chicago/Halsted, an open-air station beside the Halsted St and
// Chicago Ave viaducts, and on round onto Metra's UP North tracks to
// Division/Elston and Clybourn.
//
// Three times the film leaves the cab: above the south portal as the train goes
// in, in the tunnel ahead of the train looking back at its cab, and above the
// north portal as it comes out and calls at Chicago/Halsted, from where the
// camera pulls back over the city before the film returns to the cab (see SHOTS).
//
// Everything drawn is a pure function of t (seconds), so frames can be
// rendered in any order. `city` is assets/city.js (real buildings, water,
// parks, the route and its stations, in local metres: x east, z south, y up).
//
// What is real and what is assumed:
//   real     the station positions, the four straight legs of the alignment,
//            every building footprint and height, the river, lake and parks
//   assumed  the curves between the legs (single circular arcs; the drawn
//            alignment wobbles), the whole vertical profile (both ramps, both
//            portals, the depth, and that the line surfaces at its north
//            end), the tunnel and station design, the neighbouring tracks,
//            everything about Chicago/Halsted, 18th, Division/Elston and Clybourn stations but
//            their positions, the curve onto the UP North, and that its tracks are at grade there
//
// Hyde Park to Rogers Park: the plan now starts on the Metra Electric south of 59th (University of Chicago) and runs
// on along the UP North past Rogers Park, on OpenStreetMap's track (assets/tracks.js, from tools/build-tracks.mjs).
// From 59th through McCormick Place and 18th the line is on the real Metra Electric (the main film's straight chord
// there missed the curve between them); past 18th it eases onto the main film's straight JOIN_SIGMA metres from that
// film's first frame (planStart), and from there to LOW_LINE's end it is the main film's line. D0 in createCabRide
// is where planStart would be along the plan, so a point s metres along the straight is D0 + s.
import { ME_LINE, JOIN_SIGMA, ME_SIDES, UPN_LINE, BROWN_LINE, BROWN_ADDISON } from "./tracks.js";
import { buildRiverBridge } from "./webster-bridge.js";
import { buildCrossTowner, TRAIN_LENGTH, FLIRT_CAB } from "./crosstowner-train.js";
import { buildKiss, KISS_LENGTH } from "./kiss-train/index.js";
import { ballysPlan } from "./ballys-chicago.js";
import { buildBallysResort } from "./ballys-resort/index.js";
import { peopleKit } from "./people.js";
import { buildObamaCenter, obamaSite } from "./obama-center.js";
import { buildMSI, msiSite } from "./msi.js";
import { LAKE_SHORE } from "./lake.js";
import { buildMuseumPark, museumParkSite } from "./museum-park.js";
import { buildHalstedPointe, halstedPointeSite } from "./halsted-pointe.js";
import { buildFoundryPark, foundryParkSite } from "./foundry-park.js";
import { buildSoldierField, soldierFieldSite } from "./soldier-field.js";
import { buildWillisTower, willisTowerSite } from "./willis-tower.js";
import { buildPrairieMaterial, prairieMaterialSite } from "./prairie-material.js";
import { buildTargetDivision, targetDivisionSite } from "./target-division.js";
import { buildSolstice, solsticeSite } from "./solstice-on-the-park.js";
import { buildNorthMichigan875, northMichigan875Site } from "./875-north-michigan.js";
import { buildElizabeth410, elizabeth410Site } from "./elizabeth-410.js";
import { buildMarcey1840, marcey1840Site } from "./marcey-1840.js";
// metres of Metra Electric before the route's own start: back to just north of McCormick Place station,
// which the film's first frame has just left (MED_LINE, carried straight on south, passes within ~20 m of it).
const LEAD_IN = 1400;
// North of the route's end (just short of Chicago/Halsted) the X1 carries on to Division/Elston and Clybourn on
// Metra's existing Union Pacific North tracks. The film's line goes straight on under the Halsted St and Chicago Ave
// viaducts for JOIN_AFTER_CH metres past the station, then curves west (assumed: one smooth curve, as the CrossTowner
// GTFS's coarse shape does) onto the UP North's track (LOW_LINE, [lon, lat], OpenStreetMap relation 3117572, from
// where it joins to about 1 km past Clybourn) and follows it, smoothed of the kinks between OSM's nodes.
const JOIN_AFTER_CH = 100;
// OSM's UP North track (LOW_LINE, UPN_LINE) is its northbound one, the west track: the UP North runs on the left, as the
// Chicago & North Western did. The line is UPN_SHIFT metres east of it, between the two tracks, and there the train runs
// on the left-hand one (see sideAt in createCabRide), on that real track, as it keeps to the left the whole way.
const UPN_SHIFT = 2.15;
export const CLYBOURN = [-87.668152, 41.917096];   // the CrossTowner GTFS's Clybourn stop
export const ROGERS_PARK = [-87.675533, 42.008999];   // and its Rogers Park stop, the film's last
export const MAP_PAST_END = 1000;                  // how far past Rogers Park the minimap's plate goes (tools/export-route.mjs)
const LOW_LINE = [[-87.651300, 41.897030], [-87.651600, 41.897292], [-87.651881, 41.897507], [-87.652158, 41.897685], [-87.652511, 41.897879],
  [-87.652784, 41.898003], [-87.653160, 41.898151], [-87.653554, 41.898271], [-87.653840, 41.898341], [-87.654482, 41.898476], [-87.655161, 41.898616], [-87.655518, 41.898700], [-87.655794, 41.898772], [-87.656034, 41.898845],
  [-87.656498, 41.899007], [-87.656751, 41.899108], [-87.656997, 41.899214], [-87.657216, 41.899316], [-87.657510, 41.899470], [-87.657769, 41.899619],
  [-87.658034, 41.899785], [-87.658273, 41.899956], [-87.658475, 41.900113], [-87.658738, 41.900343], [-87.658950, 41.900556], [-87.659171, 41.900801],
  [-87.659357, 41.901033], [-87.659545, 41.901292], [-87.659682, 41.901496], [-87.659817, 41.901714], [-87.659969, 41.901992], [-87.660069, 41.902204],
  [-87.660152, 41.902396], [-87.660210, 41.902568], [-87.660254, 41.902737], [-87.660287, 41.902899], [-87.660312, 41.903092], [-87.660330, 41.903319],
  [-87.660343, 41.903608], [-87.660370, 41.904078], [-87.660391, 41.904487], [-87.660415, 41.904920], [-87.660432, 41.905165], [-87.660454, 41.905404],
  [-87.660494, 41.905657], [-87.660536, 41.905834], [-87.660584, 41.906012], [-87.660646, 41.906205], [-87.660728, 41.906420], [-87.660816, 41.906623],
  [-87.660967, 41.906921], [-87.661068, 41.907095], [-87.661188, 41.907280], [-87.661299, 41.907438], [-87.661439, 41.907616], [-87.661585, 41.907788],
  [-87.661763, 41.907977], [-87.661971, 41.908185], [-87.662241, 41.908446], [-87.662520, 41.908715], [-87.662796, 41.908986], [-87.662964, 41.909154],
  [-87.663140, 41.909344], [-87.663336, 41.909572], [-87.663460, 41.909734], [-87.663677, 41.910052], [-87.664030, 41.910598], [-87.664159, 41.910794],
  [-87.664425, 41.911214], [-87.664660, 41.911576], [-87.665131, 41.912307], [-87.665328, 41.912613], [-87.665487, 41.912866], [-87.665605, 41.913048],
  [-87.665921, 41.913528], [-87.666061, 41.913752], [-87.666474, 41.914389], [-87.666682, 41.914719], [-87.666906, 41.915075], [-87.667228, 41.915609],
  [-87.667509, 41.916100], [-87.667613, 41.916283], [-87.667744, 41.916511], [-87.667866, 41.916739], [-87.667952, 41.916894], [-87.668076, 41.917092],
  [-87.668225, 41.917375], [-87.668374, 41.917706], [-87.668530, 41.918035], [-87.668835, 41.918727], [-87.668977, 41.919034], [-87.669153, 41.919423],
  [-87.669427, 41.920069], [-87.669728, 41.920724], [-87.670068, 41.921447], [-87.670154, 41.921636], [-87.670366, 41.922118], [-87.670605, 41.922646],
  [-87.670864, 41.923200], [-87.671005, 41.923526], [-87.671151, 41.923895], [-87.671353, 41.924368], [-87.671624, 41.924999], [-87.671735, 41.925226],
  [-87.672067, 41.925977], [-87.672230, 41.926337]];
// The route's straight legs, as stretches of the drawn alignment (metres from its start),
// and the radius of the curve joining each to the next.
// (The first span is replaced by the Metra Electric's own line, MED_LINE: see buildPlan.)
// At the south end the line does not turn straight from the Metra Electric onto Roosevelt Rd: the
// towers on the inside of that corner (One Museum Park, The Grant, NEMA) stand on deep foundations.
// As drawn (and as in the flyover) it bows out round them: it leaves the Metra Electric heading due
// north, swings west only once it is north of Roosevelt Rd, under Grant Park, and comes back onto
// Roosevelt Rd in a reverse curve. Spans 2 and 3 are those two short tangents.
const LEG_SPANS = [[0, 183], [0, 200], [510, 570], [700, 1800], [2250, 4100], [4700, 5080]];
// The middle of the Metra Electric's main tracks at about 18th St and just north of Roosevelt Rd
// ([lon, lat], read off OpenStreetMap's "University Park Sub District" tracks). The film runs along
// this line, among those tracks, until its own curve west under Roosevelt Rd; crcl_geo.json's line
// starts 16 m west of it and heads due north instead, which leaves the real tracks.
const MED_LINE = [[-87.618507, 41.859466], [-87.620690, 41.866669]];
const CURVES = [500, 190, 400, 175, 1000];
// From the Ohio St feeder to Chicago Ave the straight would run 4-11 m east of the railroad's land, across the Bally's
// site and its new Jefferson St. The line keeps instead to the middle of that railroad strip (Cook County's 2025 parcels
// of class RR, 25-40 m wide between the site and Halsted St; read against the county's 2025 orthophoto and OSM), so the
// north ramp, its trench and Chicago/Halsted's platforms stand on it; at the platforms' north end, where the strip
// narrows under the Halsted St viaduct, it comes back toward the straight to keep clear of 734 N Halsted (7 storeys,
// on the corner of Chicago Ave). RR_STRIP: [metres along the line from abreast of
// the Chicago/Halsted stop, metres to its left], eased in and out (a cubic through them) over 430 m in the bore south
// of the feeder, and back along the curve onto the UP North (so neither eases the curves there much).
// (From 200 m before the stop to 100 m past it the points lie on one smoothstep, -25 m to -4.5 m: a reverse curve of
// about 730 m radius at its tightest, through the platforms.)
// Past the stop, the curve onto the UP North keeps to the industrial spur it follows (OSM way 927810930), which runs up
// to 14.7 m inside the plain curve: the plain curve put the track through the silos of Prairie Material's Yard 32
// (assets/prairie-material.js), which stand 6-16 m off the real spur. (Offsets measured from the plain curve every 30 m,
// November 2026.)
const RR_STRIP = [[-1000, 0], [-566, -15.5], [-466, -17], [-366, -21], [-266, -24.5], [-200, -25], [-150, -23.5],
  [-100, -19.7], [-50, -14.75], [0, -9.8], [50, -6], [100, -6.5], [130, -7.1], [160, -9.5], [190, -12.4], [220, -14.3],
  [250, -14.7], [280, -13.9], [310, -12.5], [340, -10.6], [370, -8.0], [400, -4.9], [430, -1.1], [480, 0]];

// The alignment in plan: straight legs joined by circular arcs, as 2D points
// (x east, z south) every ~2.5 m. Also used by tools/export-route.mjs, so the
// minimap is drawn along exactly the line the train follows.
export function buildPlan(THREE, city, curves = CURVES) {
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const rt = city.route, rd = [0];
  for (let i = 1; i < rt.length; i++) rd.push(rd[i - 1] + Math.hypot(rt[i][0] - rt[i - 1][0], rt[i][1] - rt[i - 1][1]));
  const rtAt = (d) => { let i = 0; while (i < rd.length - 1 && rd[i] < d) i++; return V2(rt[i][0], rt[i][1]); };
  const LEGS = LEG_SPANS.map(([d0, d1]) => { const p = rtAt(d0), q = rtAt(d1); return { p, dir: q.clone().sub(p).normalize() }; });
  const meet = (A, B) => {                                        // where two legs' lines cross
    const det = A.dir.x * (-B.dir.y) - (-B.dir.x) * A.dir.y, w = B.p.clone().sub(A.p);
    return A.p.clone().addScaledVector(A.dir, (w.x * (-B.dir.y) - (-B.dir.x) * w.y) / det);
  };
  const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070;
  const local = ([lon, lat]) => V2((lon - city.origin[0]) * KX, (city.origin[1] - lat) * KY);
  {
    const a = local(MED_LINE[0]), dir = local(MED_LINE[1]).sub(a).normalize();
    LEGS[0] = { p: a.clone().addScaledVector(dir, rtAt(0).sub(a).dot(dir)), dir };   // p: abreast of the route's start
  }
  const dir1 = LEGS[0].dir, dirN = LEGS[LEGS.length - 1].dir;
  const plan = [];                                                // 2D points every ~2.5 m
  const lineTo = (from, to) => {
    const n = Math.max(1, Math.ceil(from.distanceTo(to) / 2.5));
    for (let i = plan.length ? 1 : 0; i <= n; i++) plan.push(from.clone().lerp(to, i / n));
  };
  // a polyline every 2.5 m, smoothed (two passes of a 50 m moving average) so its curvature is continuous; `ease(i)`
  // is how far point i may move (0 holds it where it is, as where the line has to join another exactly)
  const fine = (pts) => {
    const o = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const m = Math.max(1, Math.round(pts[i].distanceTo(pts[i - 1]) / 2.5));
      for (let k = 1; k <= m; k++) o.push(pts[i - 1].clone().lerp(pts[i], k / m));
    }
    return o;
  };
  const smoothed = (pts, ease) => {
    let sm = pts;
    for (let pass = 0; pass < 2; pass++) {
      const W = 10, o = [];
      for (let i = 0; i < sm.length; i++) {
        const acc = V2(0, 0); let c = 0;
        for (let j = Math.max(0, i - W); j <= Math.min(sm.length - 1, i + W); j++) { acc.add(sm[j]); c++; }
        o.push(sm[i].clone().lerp(acc.multiplyScalar(1 / c), ease(i, sm.length, W)));
      }
      sm = o;
    }
    return sm;
  };
  const planStart = LEGS[0].p.clone().addScaledVector(dir1, -LEAD_IN);
  // From south of 59th along the Metra Electric to the straight, held fixed (with the straight's heading) at its end
  const joinPt = planStart.clone().addScaledVector(dir1, JOIN_SIGMA);
  {
    const me = fine(ME_LINE.map(local));
    me[me.length - 1] = joinPt.clone();
    for (const p of smoothed(me, (i, n, W) => (i < n - W ? Math.min(1, (n - 1 - i) / 40) : 0))) plan.push(p);
  }
  const joinIndex = plan.length - 1;                              // where the Metra Electric meets the straight
  let cursor = joinPt;
  curves.forEach((Rc, i) => {
    const A = LEGS[i], B = LEGS[i + 1], pi = meet(A, B);
    const turn = Math.acos(Math.min(1, A.dir.dot(B.dir))), T = Rc * Math.tan(turn / 2);
    const ts = pi.clone().addScaledVector(A.dir, -T), st = pi.clone().addScaledVector(B.dir, T);
    lineTo(cursor, ts);
    const perp = V2(A.dir.y, -A.dir.x);
    const c1 = ts.clone().addScaledVector(perp, Rc), c2 = ts.clone().addScaledVector(perp, -Rc);
    const centre = Math.abs(c1.distanceTo(st) - Rc) < Math.abs(c2.distanceTo(st) - Rc) ? c1 : c2;
    const from = ts.clone().sub(centre), n = Math.ceil(Rc * turn / 2.5);
    const end = (sg) => from.clone().rotateAround(V2(0, 0), sg * turn).add(centre).distanceTo(st);
    const sg = end(1) < end(-1) ? 1 : -1;                          // rotate the way that ends at st
    for (let k = 1; k <= n; k++) plan.push(from.clone().rotateAround(V2(0, 0), sg * turn * k / n).add(centre));
    cursor = st;
  });
  let routeEnd, join;
  {
    const L = LEGS[LEGS.length - 1], endOfRoute = rtAt(Infinity).sub(L.p).dot(dirN), endPt = L.p.clone().addScaledVector(dirN, endOfRoute);
    lineTo(cursor, endPt);
    routeEnd = plan.length - 1;
    // on under the viaducts, then one curve onto the UP North (a cubic Hermite, its tangents as long as its chord)
    const s0 = L.p.clone().addScaledVector(dirN, local([-87.647364, 41.895754]).sub(L.p).dot(dirN) + JOIN_AFTER_CH);
    lineTo(endPt, s0);
    // joining it where the chord makes the same angle with the straight as with the UP North, so the curve is nearly a circular arc
    // LOW_LINE as far as UPN_LINE's first point (just north of Clybourn), then UPN_LINE, straightened
    const cut = LOW_LINE.reduce((k, q, i) => (Math.hypot(q[0] - UPN_LINE[0][0], q[1] - UPN_LINE[0][1]) < Math.hypot(LOW_LINE[k][0] - UPN_LINE[0][0], LOW_LINE[k][1] - UPN_LINE[0][1]) ? i : k), 0);
    const osm = LOW_LINE.slice(0, cut).concat(UPN_LINE).map(local), ang = (a, b) => Math.atan2(a.x * b.y - a.y * b.x, a.dot(b));
    const all = osm.map((p, k) => {                               // UPN_SHIFT to the right (east, northbound) of OSM's track
      const t = osm[Math.min(k + 3, osm.length - 1)].clone().sub(osm[Math.max(k - 3, 0)]).normalize();
      return p.clone().add(V2(-t.y, t.x).multiplyScalar(UPN_SHIFT));
    });
    const dirAt = (k) => all[k + 3].clone().sub(all[k]).normalize();
    const miss = (k) => { const c = all[k].clone().sub(s0); return Math.abs(ang(dirN, c) - ang(c, dirAt(k))); };
    let kj = 0;
    for (let k = 1; k < 40; k++) if (miss(k) < miss(kj)) kj = k;
    const low = all.slice(kj), j1 = dirAt(kj);
    join = low[0];
    const tail = [], chord = s0.distanceTo(low[0]), n = Math.ceil(chord * 1.1 / 2.5);
    for (let k = 1; k <= n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      tail.push(s0.clone().multiplyScalar(2 * u3 - 3 * u2 + 1).addScaledVector(dirN, chord * (u3 - 2 * u2 + u))
        .addScaledVector(low[0], -2 * u3 + 3 * u2).addScaledVector(j1, chord * (u3 - u2)));
    }
    tail.push(...fine(low).slice(1));                             // the UP North, every 2.5 m
    // smoothed, easing in from the straight so the join stays put
    const sm = smoothed(tail, (i, n, W) => Math.min(1, i / 40) * (i < n - W ? 1 : 0));
    for (let i = 0; i < sm.length; i++) if (sm[i].distanceTo(plan[plan.length - 1]) > 1.5) plan.push(sm[i]);
  }
  {                                                               // over onto the railroad's strip by Bally's (RR_STRIP)
    const ch = local([-87.647364, 41.895754]), cum = [0];
    for (let i = 1; i < plan.length; i++) cum.push(cum[i - 1] + plan[i].distanceTo(plan[i - 1]));
    let ich = 0;
    plan.forEach((p, i) => { if (p.distanceTo(ch) < plan[ich].distanceTo(ch)) ich = i; });
    const off = (s) => {                                          // a cubic Hermite through RR_STRIP, its slopes from the neighbours
      const R = RR_STRIP, k = R.findIndex((q, j) => j < R.length - 1 && s >= q[0] && s <= R[j + 1][0]);
      if (k < 0) return 0;
      const slope = (j) => (j <= 0 || j >= R.length - 1 ? 0 : (R[j + 1][1] - R[j - 1][1]) / (R[j + 1][0] - R[j - 1][0]));
      const h = R[k + 1][0] - R[k][0], u = (s - R[k][0]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * R[k][1] + (u3 - 2 * u2 + u) * h * slope(k) + (-2 * u3 + 3 * u2) * R[k + 1][1] + (u3 - u2) * h * slope(k + 1);
    };
    const right = plan.map((p, i) => { const t = plan[Math.min(i + 2, plan.length - 1)].clone().sub(plan[Math.max(i - 2, 0)]).normalize(); return V2(-t.y, t.x); });
    plan.forEach((p, i) => { const o = off(cum[i] - cum[ich]); if (o) p.addScaledVector(right[i], o); });
  }
  // Every curve eased in and out: the arcs above meet their straights with a step in curvature (no transition), which
  // made the train lurch where the camera watches it at 4x (by the south portal, at the UP North join). The same
  // smoothing as the rest (two passes of a 50 m moving average) turns each step into a ramp about 100 m long and moves
  // the line by under a metre; the two ends stay where they are.
  {
    const sm = smoothed(plan, (i, n, W) => Math.min(1, i / 40, (n - 1 - i) / 40));
    for (let i = 0; i < plan.length; i++) plan[i].copy(sm[i]);
  }
  return { plan, planStart, joinIndex, dir1, dirN, routeEnd, join };
}

// `captions`: [{ start, end, text }] in film seconds (assets/captions.js, written by tools/place-audio.mjs)
// `humans`: no longer used. The people are assets/people.js; the Quaternius Universal Base Characters that index.html
// can still load (USE_HUMANS, off) were too slow to render, and their posing code is in the git history.
// `art`: the Art Institute of Chicago's paintings for the station walls (assets/art.js), each with its loaded `img`.
// `opts`: which overlays the picture carries. `cards` (the story cards, and the dimming under the ending's), `minimap`
// and `captions` (the announcements'), all on by default; `web: true` turns all three off, for the cut on the web page
// (tunnel.stevevance.net/cabride/), which shows them beside the video.
export function createCabRide(THREE, city, out, width, height, mini = null, logos = null, captions = null, humans = null, art = null, opts = {}) {
  const WEB = !!opts.web, CARDS = opts.cards ?? !WEB, MINIMAP = opts.minimap ?? !WEB, CAPTIONS = opts.captions ?? !WEB;
  // Lake Michigan out to the horizon: the map tiles' water stops at the edges of the areas they cover, which left a
  // straight edge in the lake with bare ground beyond. One more piece of water, OSM's shore (assets/lake.js) closed
  // LAKE_OUT metres out in the lake; where it overlaps the tiles' water the two are the same colour at the same level.
  {
    const LAKE_OUT = 40000, kx = 111320 * Math.cos(city.origin[1] * Math.PI / 180), ky = 111070;
    const shore = LAKE_SHORE.map(([lon, lat]) => [(lon - city.origin[0]) * kx, (city.origin[1] - lat) * ky]);
    const s0 = shore[0], s1 = shore[shore.length - 1];
    const ring = [...shore, [s1[0] + LAKE_OUT, s1[1]], [s0[0] + LAKE_OUT, s0[1]], s0].flat();
    city = { ...city, water: [...city.water, ring] };
  }
  const FPS = 30, SUBFRAMES = 8, SHUTTER = 0.6;   // motion blur: 8 samples over 60% of a frame
  const RES = Math.max(1, Math.round(height / 1080));   // drawn textures (facades, signs, the cab's screens) get this many times the pixels: 2 at 4K
  // A canvas `w` x `h` in drawing units, RES times as many pixels, its context scaled to match.
  const hiCanvas = (w, h) => { const cv = document.createElement("canvas"); cv.width = w * RES; cv.height = h * RES; const c = cv.getContext("2d"); c.scale(RES, RES); return [cv, c]; };
  const RAMP_FROM = -130, RAMP_LEN = 300, DEPTH = 11.5;   // ramps and tunnel depth (assumed); the south ramp is underground before the line leaves the Metra Electric's tracks
  const OFF = 2.15;                          // each track's centre from the alignment centreline
  const R = 5.3, CY = 2.7;                   // bore radius, bore centre above the rail (one bore, two tracks)
  const TRENCH = 5.65;                       // half-width between a ramp's retaining walls
  const BED = 4.45;                          // half-width of the track bed inside the bore
  const LIGHT_EVERY = 9, RIB_EVERY = 4.5, TIE_EVERY = 0.65;
  const NOSE = 1.2;                                               // the nose is this far ahead of the operator's eye
  const TRAIN_LONG = TRAIN_LENGTH;                                 // nose to tail, 74.8 m: a four-car FLIRT (assets/crosstowner-train.js)
  const PLAT_LONG = 105.7;                                         // the platforms are sized for a longer train than ours, with room to spare
  const PLAT_IN = 3.65, PLAT_OUT = 8.6, PLAT_UP = 1.1, CEIL = 6.0;   // station box, relative to centreline / rail
  const EXIT_TO = ["Roosevelt Rd", "Taylor St", "Union Station", "Randolph St"];
  // Union Station and Randolph/Clinton are tall vaulted halls instead of boxes, after the atrium of Wuhan Railway
  // Station (all assumed): galleries along both sides at concourse level (GAL), joined by a bridge over the tracks
  // ahead of the cab, under a scalloped vault of panels on white arch ribs whose crown is just under the street.
  // The line drops a further DEEP metres between them to make room.
  const HALLS = [2, 3], DEEP = 7, DEEP_RUN = 300;
  const GAL = 6.8, HALL = 13, SPRING = 11, CROWN = 17, SAG = 1.2;

  /* ---- renderer: WebGL offscreen, accumulated into the visible 2D canvas ---- */
  const gl = document.createElement("canvas");
  gl.width = width; gl.height = height;
  const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true, stencil: true });   // stencil: the river cuts the ground (see below)
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  out.width = width; out.height = height;
  const ctx = out.getContext("2d");

  const scene = new THREE.Scene();
  const HAZE = new THREE.Color(0xc4d3e0), DARK = new THREE.Color(0x030506), HAZE_DENSITY = 0.00026;
  scene.background = HAZE.clone();
  scene.fog = new THREE.FogExp2(HAZE.getHex(), HAZE_DENSITY);

  /* ---- the alignment: straight legs joined by circular arcs ---- */
  const smooth = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const { plan, planStart, joinIndex, dir1, dirN, routeEnd, join } = buildPlan(THREE, city);
  let planLen = 0;
  const pd = plan.map((p, i) => (planLen += i ? p.distanceTo(plan[i - 1]) : 0));
  const D0 = pd[joinIndex] - JOIN_SIGMA;                          // where the main film's first frame would be: d = D0 + s, s metres along the straight
  // Down at the south end, up again at the north end.
  const RAMP1 = D0 + LEAD_IN + RAMP_FROM, RAMP2 = pd[routeEnd] - 20 - RAMP_LEN;
  // the halls' stations along the plan (their boxes run from about 121 m behind to 40 m beyond)
  const planD = (s) => { let best = Infinity, k = 0; plan.forEach((p, i) => { const q = Math.hypot(p.x - s.x, p.y - s.z); if (q < best) { best = q; k = i; } }); return pd[k]; };
  const DEEP0 = planD(city.stations[HALLS[0]]) - 126, DEEP1 = planD(city.stations[HALLS[1]]) + 46;
  // The embankments: the track bed's height above the streets that pass under it, from Cook County's 2022 LiDAR (see
  // NOTES.md). On the Metra Electric 5.3 m from 59th to 47th (the streets under it are 4.5-6.3 m down), easing down to
  // the surface by about 43rd (Oakwood and 27th are at grade). On the UP North it rises from Chicago/Halsted (at grade,
  // under the Chicago Ave and Halsted St viaducts) to 4.4 m at Division/Elston (Division St 4.4 m down, North Ave 4.2 m) and 5.0 m from
  // Clybourn to Rogers Park (Ashland 5.5 m; Sunnyside, Wilson, Leland, Lawrence and Winnemac 4.4-5.7 m).
  const pdLL = (lon, lat) => planD({ x: (lon - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z: (city.origin[1] - lat) * 111070 });
  const E47 = pdLL(-87.591333, 41.80974), ECH = pdLL(-87.647364, 41.895754), EDIV = pdLL(-87.660335, 41.903426), ECLY = pdLL(...CLYBOURN);
  const EMB_ME = 5.3, EMB_DIV = 4.4, EMB_NORTH = 5.0;
  const EMB = (d) => d < (E47 + ECH) / 2
    ? EMB_ME * (1 - smooth((d - (E47 + 150)) / 750))
    : EMB_DIV * smooth((d - (ECH + 130)) / (EDIV - 120 - (ECH + 130))) + (EMB_NORTH - EMB_DIV) * smooth((d - (EDIV + 300)) / (ECLY - 150 - (EDIV + 300)));
  const profile = (d) => -DEPTH * smooth((d - RAMP1) / RAMP_LEN) * (1 - smooth((d - RAMP2) / RAMP_LEN))
    - DEEP * smooth((d - DEEP0 + DEEP_RUN) / DEEP_RUN) * (1 - smooth((d - DEEP1) / DEEP_RUN)) + EMB(d);
  const path = new THREE.CatmullRomCurve3(plan.map((p, i) => new THREE.Vector3(p.x, profile(pd[i]), p.y)), false, "centripetal");
  path.arcLengthDivisions = Math.ceil(planLen / 0.6);
  const LENGTH = path.getLength();
  const UP = new THREE.Vector3(0, 1, 0);
  // Point d metres along the alignment, shifted `side` metres to the right and `up` metres up.
  function at(d, side = 0, up = 0) {
    const u = Math.min(Math.max(d / LENGTH, 0), 1);
    const p = path.getPointAt(u), tan = path.getTangentAt(u);
    const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
    const b = bankAt(d);
    if (!b) return { p: p.addScaledVector(right, side).addScaledVector(UP, up), tan, right };
    // in a curve the track is canted: the cross-section leans into the turn about the centreline
    const c = Math.cos(b), sn = Math.sin(b);
    const r2 = right.clone().multiplyScalar(c).addScaledVector(UP, sn), u2 = UP.clone().multiplyScalar(c).addScaledVector(right, -sn);
    return { p: p.addScaledVector(r2, side).addScaledVector(u2, up), tan, right: r2 };
  }
  // the same beyond the alignment's ends (at() stops at them), carried on straight: for the opening's camera, south of
  // where the plan begins
  function atFar(d, side = 0, up = 0) {
    if (d >= 0 && d <= LENGTH) return at(d, side, up);
    const end = at(d < 0 ? 0 : LENGTH), k = d < 0 ? d : d - LENGTH;
    return { p: end.p.clone().addScaledVector(end.tan, k).addScaledVector(end.right, side).addScaledVector(UP, up), tan: end.tan, right: end.right };
  }
  // Bank (radians, positive in a left-hand curve) from the alignment's curvature,
  // eased in and out over a train length or so. Assumed: about 1.5 degrees per 1/1000 m of curvature, 5.5 degrees at most.
  const BANK_STEP = 2, BANK_GAIN = 27, BANK_MAX = 0.095;
  const bankTable = (() => {
    const n = Math.ceil(LENGTH / BANK_STEP) + 1, k = new Float32Array(n);
    let t0 = path.getTangentAt(0);
    for (let i = 1; i < n; i++) {
      const t1 = path.getTangentAt(Math.min((i * BANK_STEP) / LENGTH, 1));
      k[i] = Math.asin(Math.max(-1, Math.min(1, t0.z * t1.x - t0.x * t1.z))) / BANK_STEP;   // signed curvature, + to the left
      t0 = t1;
    }
    let a = k;
    for (let pass = 0; pass < 2; pass++) {                        // two box blurs: a smooth run-in and run-out
      const o = new Float32Array(n), W = 14;
      for (let i = 0; i < n; i++) { let sum = 0; for (let j = -W; j <= W; j++) sum += a[Math.min(Math.max(i + j, 0), n - 1)]; o[i] = sum / (2 * W + 1); }
      a = o;
    }
    return a.map((v) => Math.max(-BANK_MAX, Math.min(BANK_MAX, v * BANK_GAIN)));
  })();
  function bankAt(d) {
    const f = Math.min(Math.max(d / BANK_STEP, 0), bankTable.length - 1.001), i = Math.floor(f);
    return bankTable[i] + (bankTable[i + 1] - bankTable[i]) * (f - i);
  }
  // Landmarks along the alignment, found by sampling it.
  let PORTAL = 0, PORTAL2 = 0, RAMP_START = 0, RAMP_END = 0;
  // the repo's data calls it "Union Station (West)"; signs and the map say just "Union Station"
  const STN = city.stations.map((s, i) => ({ name: s.name.replace(" (West)", ""), exitTo: EXIT_TO[i] || "Street", x: s.x, z: s.z, d: 0, best: Infinity }));
  // Chicago/Halsted: the X1's next stop, in the open beyond the north portal (its position is the CrossTowner GTFS's)
  const CH = { name: "Chicago/Halsted", exitTo: "Chicago Ave & Halsted St", outdoor: true, d: 0, best: Infinity,
    x: (-87.647364 - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z: (city.origin[1] - 41.895754) * 111070 };
  // 18th (Soldier Field): the X1's stop on the Metra Electric before the tunnel, open-air. Found first from the
  // CrossTowner GTFS's position, then moved to where Metra's platform really is: just south of the East 18th St
  // footbridge, whose stair comes down onto its north end (see FOOTBRIDGE).
  const M18 = { name: "18th (Soldier Field)", exitTo: "18th St & Soldier Field", outdoor: true, d: 0, best: Infinity,
    x: (-87.618198 - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z: (city.origin[1] - 41.858502) * 111070 };
  // Division/Elston and Clybourn: the X1's next two stops, on the UP North (positions from the CrossTowner GTFS). Open-air,
  // each with stairs down from its platforms to the street under the line (all assumed).
  const lonLat = (lon, lat) => ({ x: (lon - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z: (city.origin[1] - lat) * 111070 });
  const DIV = { name: "Division/Elston", exitTo: "Division St & Elston Ave", outdoor: true, d: 0, best: Infinity, ...lonLat(-87.660335, 41.903426) };
  const CLY = { name: "Clybourn", exitTo: "Ashland Ave & Cortland St", outdoor: true, d: 0, best: Infinity, ...lonLat(...CLYBOURN) };
  const ALL = [M18, ...STN, CH, DIV, CLY];                          // STN: the four underground; ALL: the stops with platforms (this film's new ones join it below)
  // Hyde Park to Rogers Park: the X1's other stops in this film (positions from the CrossTowner GTFS). Open-air. On the
  // Metra Electric each is an island platform (see ISLANDS); on the UP North, side platforms like Division/Elston's.
  const stopAt = (name, lon, lat, exitTo) => ({ name, exitTo, outdoor: true, d: 0, best: Infinity, ...lonLat(lon, lat) });
  const SOUTH_STOPS = [
    stopAt("59th (University of Chicago)", -87.58863, 41.788049, "59th St & the Midway Plaisance"),
    stopAt("55th-56th-57th", -87.587643, 41.79336, "55th, 56th & 57th Sts"),
    stopAt("51st/53rd", -87.586784, 41.800015, "51st & 53rd Sts"),
    stopAt("47th (Kenwood)", -87.591333, 41.80974, "47th St"),
    stopAt("Oakwood Blvd", -87.602285, 41.824736, "Oakwood Blvd"),
    stopAt("27th", -87.61322, 41.844182, "27th St"),
    stopAt("McCormick Place", -87.61631, 41.851534, "McCormick Place"),
  ];
  const NORTH_STOPS = [
    stopAt("Addison/Lincoln", -87.673744, 41.946957, "Addison St & Lincoln Ave"),
    stopAt("Ravenswood", -87.674332, 41.968808, "Lawrence Ave"),
    stopAt("Peterson/Ridge", -87.675032, 41.991487, "Peterson & Ridge Aves"),
    stopAt("Rogers Park", ...ROGERS_PARK, "Lunt Ave"),
  ];
  const FIRST = SOUTH_STOPS[0], LAST = NORTH_STOPS[NORTH_STOPS.length - 1];
  const CALLS = [...SOUTH_STOPS, ...ALL, ...NORTH_STOPS];          // every stop in the film, in order
  // the ones shown in full: 59th, Union Station, Rogers Park, and Chicago/Halsted, where the train stands while the
  // camera climbs away from it (shot 2)
  const FULL_STOPS = [FIRST, STN[2], CH, LAST];
  let JOIN_D = 0, joinBest = Infinity;                            // where the line meets the UP North's track
  for (let d = 0; d < LENGTH; d += 0.5) {
    const p = path.getPointAt(d / LENGTH);
    { const k = Math.hypot(p.x - join.x, p.z - join.y); if (k < joinBest) { joinBest = k; JOIN_D = d; } }
    if (p.y < -0.02) { if (!RAMP_START) RAMP_START = d; RAMP_END = d; }
    if (p.y + CY + R < -0.7) { if (!PORTAL) PORTAL = d; PORTAL2 = d; }   // bore roof safely below the ground
    for (const S of CALLS) { const k = Math.hypot(p.x - S.x, p.z - S.z); if (k < S.best) { S.best = k; S.d = d; } }
  }
  for (const S of STN) {
    S.stop = S.d - 6;                                             // where the cab stops
    // The platform runs from a little behind the tail of a stopped 105.7 m train (PLAT_LONG) to 40 m ahead of the cab.
    // The crowd keeps to the stretch it stood on before the platforms were lengthened to the train (crowdFrom).
    S.platFrom = S.stop + NOSE - PLAT_LONG - 4; S.platTo = S.d + 34; S.crowdFrom = S.d + 34 - 95;
    S.boxFrom = S.platFrom - 6; S.boxTo = S.platTo + 6;
    if (HALLS.includes(STN.indexOf(S))) {
      S.hall = true; S.exitTop = GAL; S.stairRun = 14;
      S.bay = (S.boxTo - S.boxFrom) / Math.round((S.boxTo - S.boxFrom) / 13);   // the vault's bays, a whole number in the hall
      S.bridge = [S.d + 28, S.d + 34];                                             // the bridge over the tracks, ahead of the cab
    }
  }
  // Height of a hall's vault above the rail, `x` metres from the centreline: an ogee from the crown down to the
  // springing at the back of the galleries, sagging between the ribs (one at each end of every bay).
  const vaultY = (S, x, d) => {
    const a = Math.min(Math.abs(x) / HALL, 1), s = Math.sin(Math.PI * (d - S.boxFrom) / S.bay);
    return SPRING + (CROWN - SPRING) * (1 - smooth(a)) - SAG * s * s * (1 - a * a);
  };
  // The East 18th Street Footbridge (OpenStreetMap way 56180317), [lon, lat]: up a switchback ramp on the west side,
  // across the Metra Electric on a span (points 3 to 5), and down a long ramp north beside Lake Shore Drive. (OSM's
  // ramp turns back west over the outer track; here it is moved east, to run down just clear of it: points 6 and 7.)
  const FOOTBRIDGE = [[-87.618197, 41.857672], [-87.618519, 41.858227], [-87.61844, 41.858253], [-87.618271, 41.857947],
    [-87.617965, 41.858018], [-87.617771, 41.858065], [-87.6177, 41.858553], [-87.6177, 41.859035]]
    .map(([lon, lat]) => V2((lon - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), (city.origin[1] - lat) * 111070));
  const BRIDGE_W = 4.0, BRIDGE_DECK = 8.4;                        // deck width and its top above the rail (assumed), over the Metra Electric's wires
  // where a line `side` metres from the centreline crosses the span's centreline
  const bridgeCross = (side) => {
    const A = FOOTBRIDGE[3], B = FOOTBRIDGE[5], f = (d) => { const p = at(d, side).p; return (B.x - A.x) * (p.z - A.y) - (B.y - A.y) * (p.x - A.x); };
    let d = M18.d - 200; const s0 = Math.sign(f(d));
    while (d < M18.d + 200 && Math.sign(f(d)) === s0) d += 0.25;
    return d;
  };
  const D_BRIDGE = bridgeCross(0);
  // The cab stops 24 m short of the bridge, so the stairs up to it rise just ahead; the platforms end under it.
  M18.d = D_BRIDGE - 18; M18.stop = M18.d - 6; M18.platFrom = M18.stop + NOSE - PLAT_LONG - 4; M18.platTo = D_BRIDGE + 6; M18.crowdFrom = M18.platTo - 95;
  CH.stop = CH.d - 6; CH.platFrom = CH.stop + NOSE - PLAT_LONG - 4; CH.platTo = CH.d + 62; CH.crowdFrom = CH.d - 48;   // its platforms run on under the Halsted St viaduct
  for (const S of [DIV, CLY]) {                                     // the cab stops 24 m short of the footbridge (Clybourn: its tunnel), as at 18th
    S.bridge = S.d + 18; S.stop = S.d - 6; S.platFrom = S.stop + NOSE - PLAT_LONG - 4; S.platTo = S.bridge + 6; S.crowdFrom = S.platTo - 95;
  }
  // The new stops: the train stands centred on the GTFS's position (its cab ~50 m past it), the platform running from just
  // behind where a 105.7 m train's tail would be to 30 m ahead of the cab. They join ALL (after the main film's, so its crowds keep their seeds).
  for (const S of [...SOUTH_STOPS, ...NORTH_STOPS]) {
    S.stop = S.d + 50; S.platFrom = S.stop + NOSE - PLAT_LONG - 4;
    S.bridge = S.stop + 24; S.platTo = S.bridge + 6; S.crowdFrom = S.platTo - 95;
  }
  ALL.push(...NORTH_STOPS, ...SOUTH_STOPS);
  const MAP_END = LENGTH;                                          // the minimap's line goes on to the end, off the map's top edge
  // standing at 59th to pulling out of Rogers Park (500 m out, the ending's cards over it: see speedupAt)
  const START = FIRST.stop, END = Math.min(LAST.stop + 500, LENGTH - 60);
  // The UP North's bridge over the North Branch at Webster Ave, just past Clybourn: where the line crosses the river
  // (city.water), and 8 m either side for the banks. assets/webster-bridge.js draws it (its design assumed).
  const BRIDGE = (() => {
    const polys = city.water.map((p) => {
      let b = [Infinity, Infinity, -Infinity, -Infinity];
      for (let i = 0; i < p.length; i += 2) b = [Math.min(b[0], p[i]), Math.min(b[1], p[i + 1]), Math.max(b[2], p[i]), Math.max(b[3], p[i + 1])];
      return { p, b };
    });
    const wet = (x, z) => polys.some(({ p, b }) => {
      if (x < b[0] || x > b[2] || z < b[1] || z > b[3]) return false;
      let hit = false;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < (p[j] - p[i]) * (z - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) hit = !hit;
      return hit;
    });
    let d0 = null;
    for (let d = CLY.d; d < CLY.d + 1500; d += 1) {
      const p = at(d).p, w = wet(p.x, p.z);
      if (w && d0 === null) d0 = d;
      if (!w && d0 !== null) return { d0: d0 - 8, d1: d + 8 };
    }
    throw new Error("no river crossing found past Clybourn");
  })();
  // The Metra Electric's four tracks, d metres along. The line was laid OFF metres west of the one OSM's route relation
  // follows (the eastern of the middle two), which is our right-hand track (+OFF): the trains the other way's. meSide(k, d)
  // gives the other three (k: 0 the outer west track, 1 the inner west, 2 the east one): where they really are
  // (ME_SIDES), to the footbridge at 18th; then, as the line eases onto the main film's straight, the outer two settle at
  // -11 and 11, where the main film had them. The inner west track is the X1's own, our left-hand one: it leaves the real
  // one where that starts to swing away west, 75 m short of the footbridge (by the north end of 18th's island), and
  // closes in to -OFF by the join (assumed). All three are smoothed, two passes of an 80 m moving average: read straight
  // between OSM's points every 10 m, the X1's path had a small kink at each, and the western tracks' swing between
  // McCormick Place and 18th had bends of about 330 m radius.
  const D_JOIN = pd[joinIndex];
  const meSide = (() => {
    const ds = [0];
    for (let i = 1; i < ME_SIDES.length; i++) {
      const a = lonLat(...ME_LINE[i - 1]), b = lonLat(...ME_LINE[i]);
      ds.push(ds[i - 1] + Math.hypot(b.x - a.x, b.z - a.z));
    }
    const dReal = ds[ds.length - 1], target = [-11, -OFF, 11];
    const real = (k, d) => {
      let lo = 0, hi = ds.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ds[m] <= d) lo = m; else hi = m; }
      const f = Math.min(Math.max((d - ds[lo]) / (ds[hi] - ds[lo]), 0), 1);
      return ME_SIDES[lo][k] + (ME_SIDES[hi][k] - ME_SIDES[lo][k]) * f;
    };
    // each eases over from where it leaves the real track to EASE_TO, and holds there, so that after the smoothing it is
    // exactly at its place by the join
    const D_W2 = D_BRIDGE - 75, EASE_TO = D_JOIN - 100;
    const raw = (k, d) => {
      const from = k === 1 ? D_W2 : dReal, v = real(k, from);
      return d < from ? real(k, d) : v + (target[k] - v) * smooth((d - from) / (EASE_TO - from));
    };
    const STEP = 2.5, W = 16, n = Math.ceil(D_JOIN / STEP) + 2;
    const table = [0, 1, 2].map((k) => {
      let a = Float64Array.from({ length: n }, (_, i) => raw(k, i * STEP));
      for (let pass = 0; pass < 2; pass++) {
        const o = new Float64Array(n);
        for (let i = 0; i < n; i++) { let s = 0; for (let j = -W; j <= W; j++) s += a[Math.min(Math.max(i + j, 0), n - 1)]; o[i] = s / (2 * W + 1); }
        a = o;
      }
      return a;
    });
    return (k, d) => {
      if (d >= D_JOIN) return target[k];
      const f = Math.max(d, 0) / STEP, i = Math.min(Math.floor(f), n - 2);
      return table[k][i] + (table[k][i + 1] - table[k][i]) * (f - i);
    };
  })();
  // Every train keeps to the left-hand track, the whole way (Steven, 2026-11-27: on the Metra Electric, to match the UP
  // North and UP Northwest, which run on the left as the Chicago & North Western did; and so in the tunnel too). Our two
  // tracks stay parallel, both under the wires, the whole way: railAt(0) the west one, the X1's (on the Metra Electric
  // the inner west track, meSide(1), until it closes in to -OFF by the join), and railAt(1) the east one, at +OFF, for
  // the trains the other way, on their own left.
  const railAt = (k, d) => (k ? OFF : d < D_JOIN ? meSide(1, d) : -OFF);
  const sideAt = (d) => railAt(0, d), otherAt = (d) => railAt(1, d);   // the X1's path, and the trains' the other way
  for (const S of CALLS) S.our = Math.sign(sideAt(S.stop));       // the side of the line the train stands on at each stop (the left, at every one)
  // The Metra Electric's island platforms (OpenStreetMap's; Oakwood Blvd's assumed): at 59th, 55th-56th-57th and
  // 51st/53rd the western pair's own, to our left (with the eastern pair's across the tracks, for the trains the other
  // way); from 47th to 18th one between the middle two tracks, to our right. An island `side` of track `near`, out to
  // track `far`: its edges d metres along, 1.7 m from each track's centre, and no more than 7.5 m wide.
  const islandEdges = (side, near, far) => side < 0
    ? (d) => { const hi = near(d) - 1.7; return [Math.max(far(d) + 1.7, hi - 7.5), hi]; }
    : (d) => { const lo = near(d) + 1.7; return [lo, Math.min(far(d) - 1.7, lo + 7.5)]; };
  const ISLANDS = [[SOUTH_STOPS[0], -1], [SOUTH_STOPS[1], -1], [SOUTH_STOPS[2], -1], [SOUTH_STOPS[3], 1], [SOUTH_STOPS[4], 1],
    [SOUTH_STOPS[5], 1], [SOUTH_STOPS[6], 1], [M18, 1]];
  for (const [S, side] of ISLANDS) {
    // its far edge's track: at the Hyde Park stops the outer west one, whose trains run north like ours (farDir 1); from
    // 47th, the trains' the other way (assumed: the western pair northbound, the eastern southbound)
    const far = side < 0 ? (d) => meSide(0, d) : otherAt;
    S.island = { side, far, farDir: side < 0 ? 1 : -1, edges: islandEdges(side, sideAt, far) };
  }
  // the side the doors open on at each stop (the cab's display says it; build.py's announcements must match): the
  // platform's, or the island's
  for (const S of CALLS) S.doors = (S.island ? S.island.side : S.our) > 0 ? "right" : "left";
  // Where someone stands on a platform: x metres back from its edge beside the track they are waiting for. sg is the
  // platform's side for side platforms; on an island, sg === S.our is the edge by our track, the other its far edge.
  const platAt = (S, sg, x, d) => {
    if (!S.island) return sg * (PLAT_IN + x);
    const [lo, hi] = S.island.edges(d), ours = S.island.side < 0 ? hi : lo, far = S.island.side < 0 ? lo : hi, dir = Math.sign(far - ours);
    const w = Math.abs(hi - lo), k = Math.min(x, w - 0.6);
    return sg === S.our ? ours + dir * k : far - dir * k;
  };
  // the track the people on platform sg wait for
  const trackFor = (S, sg, d) => (sg === S.our ? sideAt(d) : S.island ? S.island.far(d) : otherAt(d));
  const sideFn = (side) => (typeof side === "function" ? side : () => side);   // a side: metres, or a function of d
  const subCurve = (d0, d1, side, up, step = 2) => {
    const c = [], sd = sideFn(side);
    for (let d = d0; d < d1; d += step) c.push(at(d, sd(d), up).p);
    c.push(at(d1, sd(d1), up).p);
    return new THREE.CatmullRomCurve3(c);
  };
  // A railway corridor on the surface that follows the alignment, from d0 to d1, between two edges. latRAt(s), if given, narrows
  // or widens its right-hand edge along the way (latR is then its widest).
  const curvedCorridor = (d0, d1, latL, latR, latRAt = () => latR) => {
    const len = d1 - d0, STEP = 5, cs = [];                       // centreline samples, for finding the nearest
    for (let s = 0; s <= len; s += STEP) { const q = at(d0 + s); cs.push([q.p.x, q.p.z, q.tan.x, q.tan.z, s]); }
    const xs = cs.map((c) => c[0]), zs = cs.map((c) => c[1]), box = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
    // the samples by GRID-metre square, so `has` looks only at those near the point (the corridors run for miles)
    const GRID = 50, cells = new Map(), key = (i, j) => i * 100003 + j;
    for (const c of cs) { const k = key(Math.floor(c[0] / GRID), Math.floor(c[1] / GRID)); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(c); }
    return {
      d0, len, latL, latR, latRAt,
      pt: (s, lat, up = 0) => at(d0 + s, lat).p.setY(up + EMB(d0 + s)),     // (up from the top of any embankment)
      dirAt: (s) => { const t = at(d0 + s).tan; return new THREE.Vector3(t.x, 0, t.z).normalize(); },
      has: (x, z, m) => {
        const pad = Math.max(latR, -latL) + m + 20;
        if (x < box[0] - pad || x > box[2] + pad || z < box[1] - pad || z > box[3] + pad) return false;
        let best = null, bd = Infinity;
        const r = Math.ceil(pad / GRID), ci = Math.floor(x / GRID), cj = Math.floor(z / GRID);
        for (let i = ci - r; i <= ci + r; i++) for (let j = cj - r; j <= cj + r; j++) {
          for (const c of cells.get(key(i, j)) || []) { const dd = (x - c[0]) ** 2 + (z - c[1]) ** 2; if (dd < bd) { bd = dd; best = c; } }
        }
        if (!best) return false;                                    // no part of the line within reach
        const tl = Math.hypot(best[2], best[3]), rx = x - best[0], rz = z - best[1];
        const s = best[4] + (rx * best[2] + rz * best[3]) / tl, lat = (-rx * best[3] + rz * best[2]) / tl;
        return s > -20 && s < len + 20 && lat > latL - m && lat < latRAt(s) + m && { d: d0 + s, lat };
      },
      outline() {
        const c = [];
        for (let s = 0; s <= len; s += 10) { const p = this.pt(s, latL); c.push(V2(p.x, -p.z)); }
        for (let s = Math.floor(len / 10) * 10; s >= 0; s -= 10) { const p = this.pt(s, latRAt(s)); c.push(V2(p.x, -p.z)); }
        return c;
      },
    };
  };
  // South: the Metra Electric, from south of 59th on past the first curve. North: the tracks the line runs on, out of the
  // north ramp, past Chicago/Halsted and on round onto the UP North to Clybourn.
  const SOUTH = curvedCorridor(0, D0 + LEAD_IN + 740, -20, 19.5);   // following the line, from south of 59th
  // On the UP North the line's two tracks are the UP North's own, and the only other railway (the UP Northwest, as far
  // as Clybourn) is to the west, so there the corridor's east side narrows to just past the platforms, and the buildings
  // beside it stay.
  const northFrom = PORTAL2 - 40;
  // (in two, either side of the Webster Ave bridge, so the river runs on under it)
  const NORTH_A = curvedCorridor(northFrom, BRIDGE.d0, -15, 15, (s) => 15 - 5 * smooth((northFrom + s - JOIN_D) / 60));
  const NORTH_B = curvedCorridor(BRIDGE.d1, LENGTH, -15, 10);
  const NORTH = { has: (x, z, m) => NORTH_A.has(x, z, m) || NORTH_B.has(x, z, m) };
  const nearRailway = (x, z, m) => SOUTH.has(x, z, m) || NORTH.has(x, z, m);
  // Where the line is on an embankment, a bridge over each street that crosses it (not the service roads), as [d0, d1, k]:
  // the street's width at its angle to the line plus a sidewalk each side, on the line's centre; k is the skew, how many
  // metres further along the street crosses for each metre to the right, so that the bridge is cut square to the street.
  const EMB_GAP = 2.5;                                            // lower than this the streets are taken to cross at grade
  const lineAt = (x, z, m) => SOUTH.has(x, z, m) || NORTH_A.has(x, z, m) || NORTH_B.has(x, z, m);
  const GAPS = (() => {
    const g = [];
    for (const rd of city.roads || []) {
      if (rd.w <= 5 && rd.w !== 4.8) continue;                     // service roads (5, or 3 one-way) and living streets
      for (let i = 0; i + 3 < rd.p.length; i += 2) {
        const a = lineAt(rd.p[i], rd.p[i + 1], 150), b = lineAt(rd.p[i + 2], rd.p[i + 3], 150);
        if (!a || !b || Math.sign(a.lat) === Math.sign(b.lat) || Math.abs(a.d - b.d) > 120) continue;
        const d = a.d + (b.d - a.d) * a.lat / (a.lat - b.lat);
        if (EMB(d) < EMB_GAP) continue;
        const k = Math.max(-2.5, Math.min(2.5, (b.d - a.d) / (b.lat - a.lat))), half = rd.w / 2 * Math.hypot(1, k) + 2.5;
        g.push([d - half, d + half, k]);
      }
    }
    g.sort((p, q) => p[0] - q[0]);
    return g.reduce((m, q) => { const l = m[m.length - 1]; if (l && q[0] <= l[1] + 3) l[1] = Math.max(l[1], q[1]); else m.push([...q]); return m; }, []);
  })();
  // Over the Metra Electric between 47th and 27th (OpenStreetMap ways, [lon, lat]): the 43rd St and 41st St footbridges,
  // each with blue masts and stays, the 35th St footbridge, and the Oakwood Blvd and 31st St road bridges (the bridge
  // sections only: their approaches are assumed walled ramps). d: where each crosses the line.
  const OVERS = [
    { name: "43rd St", foot: true, blue: true, ll: [[-87.597106,41.816684],[-87.597058,41.816645],[-87.596987,41.816619],[-87.596887,41.816609],[-87.596807,41.816624],[-87.596723,41.816669],[-87.596524,41.816827],[-87.59646,41.816883],[-87.596378,41.816954],[-87.596262,41.817027],[-87.596156,41.817081],[-87.596058,41.817121],[-87.595946,41.817155],[-87.595823,41.817191],[-87.595604,41.817252],[-87.595457,41.817308],[-87.595321,41.817383],[-87.595194,41.817466],[-87.595127,41.81752],[-87.595068,41.817569],[-87.595002,41.817603],[-87.59494,41.81762],[-87.594847,41.817624],[-87.594762,41.817601],[-87.594701,41.817572],[-87.594656,41.817533],[-87.594622,41.817487],[-87.594574,41.817392]] },
    { name: "41st St", foot: true, blue: true, ll: [[-87.597837,41.821635],[-87.597808,41.82157],[-87.59779,41.821499],[-87.597789,41.821427],[-87.597797,41.821373],[-87.597821,41.821313],[-87.597871,41.82124],[-87.597927,41.821178],[-87.597991,41.821123],[-87.598082,41.821065],[-87.598167,41.82102],[-87.598279,41.820971],[-87.598406,41.820927],[-87.598583,41.820882],[-87.598824,41.820809],[-87.598924,41.820774],[-87.598985,41.82075],[-87.599073,41.820709],[-87.599136,41.820677],[-87.599176,41.820654],[-87.599226,41.820622],[-87.599278,41.82058],[-87.5993,41.820558],[-87.59933,41.820519],[-87.599359,41.820468],[-87.599374,41.820399],[-87.599371,41.820323],[-87.59935,41.820259],[-87.599311,41.820195]] },
    { name: "35th St", foot: true, ll: [[-87.605366,41.831549],[-87.605474,41.831547],[-87.605636,41.831546],[-87.605845,41.831536],[-87.605994,41.831517],[-87.606154,41.831489],[-87.606312,41.831455],[-87.606542,41.831385],[-87.606678,41.831344],[-87.606792,41.83132],[-87.606894,41.8313],[-87.607011,41.831285],[-87.607139,41.831269],[-87.60728,41.831257],[-87.607596,41.831252]] },
    { name: "Oakwood Blvd", ll: [[-87.601661,41.82499],[-87.602417,41.824671]] },
    { name: "31st St", ll: [[-87.610242,41.838546],[-87.611248,41.83852]] },
  ].map((o) => {
    const pts = o.ll.map(([lon, lat]) => lonLat(lon, lat));
    let d = null;
    for (let i = 1; i < pts.length && d === null; i++) {
      const a = lineAt(pts[i - 1].x, pts[i - 1].z, 200), b = lineAt(pts[i].x, pts[i].z, 200);
      if (a && b && Math.sign(a.lat) !== Math.sign(b.lat)) d = a.d + (b.d - a.d) * a.lat / (a.lat - b.lat);
    }
    return { ...o, pts, d };
  });
  const OVER_DECK = 8.8;                                          // their deck above the rail (assumed): clear of the wires
  const nearOver = (d, m) => OVERS.some((o) => o.d !== null && Math.abs(d - o.d) < m);
  const inGap = (d, lat = 0) => GAPS.some(([a, b, k]) => d > a + k * lat - 1 && d < b + k * lat + 1);

  /* ---- sky (the dome is kept centred on whichever camera is in use: see drawScene) ---- */
  let sky;
  {
    const g = new THREE.SphereGeometry(7000, 24, 12);
    const c = new Float32Array(g.attributes.position.count * 3);
    const top = new THREE.Color(0x4f8fd6), midc = new THREE.Color(0xa9c8e6), col = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const h = Math.max(0, g.attributes.position.getY(i) / 7000);
      col.copy(HAZE).lerp(midc, smooth(h * 6)).lerp(top, smooth(h * 1.4));
      c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    scene.add(sky);
  }

  /* ---- ground: each railway corridor is cut out and filled with ballast a
          little lower, so the track sits on it; the ballast is slotted for the ramp ---- */
  // The river and the lake lie below the streets. Their outlines are first drawn at street level into the
  // stencil buffer only (renderOrder -1, no colour); the ground and the parks are then not drawn where it is set,
  // which leaves a hole down to the water and its banks. The streets ignore it, so the bridges carry on across.
  const BELOW_RIVER = { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc };
  const flatShape = (outline, y, color, holes = [], extra = {}) => {
    const s = new THREE.Shape(outline);
    holes.forEach((h) => s.holes.push(new THREE.Path(h)));
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, ...extra })));
  };
  const trenchOutline = (d0, d1) => {
    const c = [];
    for (let d = d0; d <= d1; d += 4) { const p = at(d, -TRENCH).p; c.push(V2(p.x, -p.z)); }
    for (let d = d1; d >= d0; d -= 4) { const p = at(d, TRENCH).p; c.push(V2(p.x, -p.z)); }
    return c;
  };
  const TRENCH1 = [RAMP_START - 2, PORTAL], TRENCH2 = [PORTAL2, RAMP_END + 2];
  {
    // the ground: at least the main film's rectangle, and out past every point of the plan (its holes must lie inside it)
    let x0 = -12000, x1 = 9000, y0 = -9000, y1 = 12000;            // shape coordinates: x, -z
    for (const p of plan) { x0 = Math.min(x0, p.x - 3000); x1 = Math.max(x1, p.x + 3000); y0 = Math.min(y0, -p.y - 3000); y1 = Math.max(y1, -p.y + 3000); }
    flatShape([V2(x0, y0), V2(x1, y0), V2(x1, y1), V2(x0, y1)], 0, 0x8d928c, [SOUTH.outline(), NORTH_A.outline(), NORTH_B.outline()], BELOW_RIVER);
  }
  flatShape(SOUTH.outline(), -0.16, 0x6b6660, [trenchOutline(...TRENCH1)]);
  flatShape(NORTH_A.outline(), -0.16, 0x6b6660, [trenchOutline(...TRENCH2)]);
  flatShape(NORTH_B.outline(), -0.16, 0x6b6660);

  /* ---- water and parks: flat polygons, kept clear of the railway ---- */
  // (the water is kept off the railway too, except under the Webster Ave bridge, where it runs on beneath the line:
  // its polygons there are big triangles, and dropping those took out half the river)
  const BRIDGE_MID = at((BRIDGE.d0 + BRIDGE.d1) / 2).p, BRIDGE_REACH = (BRIDGE.d1 - BRIDGE.d0) / 2 + 60;
  const offRailway = (x, z, m) => nearRailway(x, z, m) && Math.hypot(x - BRIDGE_MID.x, z - BRIDGE_MID.z) > BRIDGE_REACH;
  const flatPolys = (list, y, color, material = null, near = nearRailway) => {
    const pos = [];
    for (const p of list) {
      const contour = [];
      for (let i = 0; i < p.length - 2; i += 2) contour.push(V2(p[i], p[i + 1]));   // drop the closing point
      if (contour.length < 3) continue;
      for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) {
        const v = t.map((k) => contour[k]);
        if (v.some((q) => near(q.x, q.y, 2)) || near((v[0].x + v[1].x + v[2].x) / 3, (v[0].y + v[1].y + v[2].y) / 3, 2)) continue;
        for (const q of v) pos.push(q.x, y, q.y);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.Mesh(g, material || new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    scene.add(m); return m;
  };
  flatPolys(city.parks, 0.02, 0, new THREE.MeshBasicMaterial({ color: 0x7fa56a, side: THREE.DoubleSide, ...BELOW_RIVER }));
  // The water, 8 ft (2.44 m) below the street, with a wall down to it along every bank
  const RIVER_DOWN = 2.44;
  flatPolys(city.water, -RIVER_DOWN, 0x5d8fc0, null, offRailway);
  flatPolys(city.water, 0, 0, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, colorWrite: false, depthWrite: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp }), offRailway).renderOrder = -1;
  {
    // The water comes in pieces, cut at map-tile edges and overlapping a little there. A bank is an edge with
    // land beyond it: a point just outside the edge that is in no piece of water, and not at the edge of the
    // map (where the water was simply cut off).
    const polys = city.water.map((p) => {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      return { p, box: [x0, z0, x1, z1] };
    });
    const all = polys.reduce((b, q) => [Math.min(b[0], q.box[0]), Math.min(b[1], q.box[1]), Math.max(b[2], q.box[2]), Math.max(b[3], q.box[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    const inPoly = (x, z, q) => {
      if (x < q.box[0] || x > q.box[2] || z < q.box[1] || z > q.box[3]) return false;
      let hit = false;
      for (let i = 0, j = q.p.length - 2; i < q.p.length; j = i, i += 2) {
        const ax = q.p[i], az = q.p[i + 1], bx = q.p[j], bz = q.p[j + 1];
        if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) hit = !hit;
      }
      return hit;
    };
    const wet = (x, z) => polys.some((q) => inPoly(x, z, q));
    const pos = [];
    for (const q of polys) for (let i = 0; i + 3 < q.p.length; i += 2) {
      const ax = q.p[i], az = q.p[i + 1], bx = q.p[i + 2], bz = q.p[i + 3], len = Math.hypot(bx - ax, bz - az);
      if (len < 0.05) continue;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2, nx = (bz - az) / len, nz = -(bx - ax) / len;
      const sg = inPoly(mx + nx * 0.5, mz + nz * 0.5, q) ? -1 : 1;  // which way is out of this piece
      const ox = mx + sg * nx * 1.5, oz = mz + sg * nz * 1.5;
      if (wet(ox, oz) || ox < all[0] + 5 || ox > all[2] - 5 || oz < all[1] + 5 || oz > all[3] - 5 || offRailway(mx, mz, 2)) continue;
      pos.push(ax, -RIVER_DOWN - 0.1, az, bx, -RIVER_DOWN - 0.1, bz, bx, 0, bz, ax, -RIVER_DOWN - 0.1, az, bx, 0, bz, ax, 0, az);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x77786f, side: THREE.DoubleSide })));
  }

  /* ---- streets: flat ribbons, as wide as their class ---- */
  {
    const pos = [], sides = [];
    for (const rd of city.roads || []) {
      for (let i = 0; i + 3 < rd.p.length; i += 2) {
        const x0 = rd.p[i], z0 = rd.p[i + 1], x1 = rd.p[i + 2], z1 = rd.p[i + 3], len = Math.hypot(x1 - x0, z1 - z0);
        const under = lineAt((x0 + x1) / 2, (z0 + z1) / 2, 3);
        if (len < 0.5 || under && !inGap(under.d, under.lat)) continue;      // the railway passes under them, or (on an embankment) over them
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        if (mx > -2312 && mx < -2290 && mz > -3815 && mz < -3730) continue;  // Halsted St over the North Branch: up on its bridge (see the viaducts)
        const nx = (z1 - z0) / len * rd.w / 2, nz = -(x1 - x0) / len * rd.w / 2, e = rd.w * 0.4 / len;   // run on a little so corners close
        const ax = x0 - (x1 - x0) * e, az = z0 - (z1 - z0) * e, bx = x1 + (x1 - x0) * e, bz = z1 + (z1 - z0) * e;
        const y = 0.012;
        pos.push(ax - nx, y, az - nz, ax + nx, y, az + nz, bx + nx, y, bz + nz,
                 ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
        if (rd.b) for (const k of [-1, 1]) {                // a bridge: its girders' faces, down toward the water
          const px = ax + k * nx, pz = az + k * nz, qx = bx + k * nx, qz = bz + k * nz;
          sides.push(px, -1.1, pz, qx, -1.1, qz, qx, y, qz, px, -1.1, pz, qx, y, qz, px, y, pz);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x5c6063, side: THREE.DoubleSide })));
    const gs = new THREE.BufferGeometry();
    gs.setAttribute("position", new THREE.Float32BufferAttribute(sides, 3));
    scene.add(new THREE.Mesh(gs, new THREE.MeshBasicMaterial({ color: 0x3e4245, side: THREE.DoubleSide })));
  }

  /* ---- in the opening's area, south of 59th (city.introArea): a sidewalk along each side of every street (not Lake
          Shore Drive or the service roads), past a parkway; and the park paths (city.paths), pale ribbons on the grass,
          each that stops short of a street (OSM ends them on sidewalks of their own, not drawn here) carried on to the
          sidewalk ---- */
  const SIDEWALK = [3.0, 4.6];                                    // from the curb: where the sidewalk begins and ends (the parkway between)
  const walked = (w) => w >= 6 && w < 15 && Math.abs(w - 9) > 0.05 && Math.abs(w - 9.6) > 0.05;   // (not the drive's carriageways, nor service roads)
  {
    const pos = [], y = 0.026;
    const ribbon = (x0, z0, x1, z1, w, from = 0, to = 0) => {     // a strip w wide (or from..to to one side) along a segment
      const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.3) return;
      const ux = (x1 - x0) / len, uz = (z1 - z0) / len, nx = uz, nz = -ux, e = (to - from ? 0.3 : w * 0.4);
      const a0 = to - from ? from : -w / 2, a1 = to - from ? to : w / 2;
      const ax = x0 - ux * e, az = z0 - uz * e, bx = x1 + ux * e, bz = z1 + uz * e;
      pos.push(ax + nx * a0, y, az + nz * a0, ax + nx * a1, y, az + nz * a1, bx + nx * a1, y, bz + nz * a1,
               ax + nx * a0, y, az + nz * a0, bx + nx * a1, y, bz + nz * a1, bx + nx * a0, y, bz + nz * a0);
    };
    const area = city.introArea, inArea = (x, z) => area && x > area[0] && x < area[2] && z > area[1] && z < area[3];
    const streets = [];
    for (const rd of city.roads || []) if (walked(rd.w)) for (let i = 0; i + 3 < rd.p.length; i += 2) {
      const sg = [rd.p[i], rd.p[i + 1], rd.p[i + 2], rd.p[i + 3], rd.w];
      if (!inArea(sg[0], sg[1]) && !inArea(sg[2], sg[3])) continue;
      if (nearRailway((sg[0] + sg[2]) / 2, (sg[1] + sg[3]) / 2, 4)) continue;
      streets.push(sg);
      for (const k of [-1, 1]) ribbon(sg[0], sg[1], sg[2], sg[3], 0, k * (sg[4] / 2 + SIDEWALK[0]), k * (sg[4] / 2 + SIDEWALK[1]));
    }
    // the nearest street to a point, within reach: [the point on its sidewalk's middle line, the distance to it]
    const toSidewalk = (x, z, reach) => {
      let best = null, bd = reach;
      for (const [ax, az, bx, bz, w] of streets) {
        const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, f = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)) : 0;
        const px = ax + f * dx, pz = az + f * dz, dist = Math.hypot(x - px, z - pz), mid = w / 2 + (SIDEWALK[0] + SIDEWALK[1]) / 2;
        if (dist < 0.01 || Math.abs(dist - mid) > bd) continue;
        bd = Math.abs(dist - mid); best = [px + (x - px) / dist * mid, pz + (z - pz) / dist * mid];
      }
      return best;
    };
    const paths = city.paths || [], ends = new Map(), end = (x, z) => `${Math.round(x)},${Math.round(z)}`;
    for (const pa of paths) for (const k of [0, pa.p.length - 2]) { const key = end(pa.p[k], pa.p[k + 1]); ends.set(key, (ends.get(key) || 0) + 1); }
    for (const pa of paths) {
      for (let i = 0; i + 3 < pa.p.length; i += 2) if (!nearRailway((pa.p[i] + pa.p[i + 2]) / 2, (pa.p[i + 1] + pa.p[i + 3]) / 2, 2)) ribbon(pa.p[i], pa.p[i + 1], pa.p[i + 2], pa.p[i + 3], pa.w);
      for (const k of [0, pa.p.length - 2]) {                    // an end no other path meets, near a street: on to its sidewalk
        const x = pa.p[k], z = pa.p[k + 1];
        if (ends.get(end(x, z)) > 1 || !inArea(x, z)) continue;
        const to = toSidewalk(x, z, 16);
        if (to && Math.hypot(to[0] - x, to[1] - z) > 0.4) ribbon(x, z, to[0], to[1], pa.w);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xcfc6ad, side: THREE.DoubleSide })));
  }

  // McCormick Place's North and South buildings are built over the Metra Electric: the station (its platform, in OSM,
  // under the North Building's south end and the South Building's north end) is in a concrete undercroft beneath them
  // (it "feels like a tunnel"). They stand on COVER_UP-high walls with openings where the tracks
  // run through, a slab under them, and columns down between the tracks; COVER: the stretch of line under them.
  const OVER_TRACKS = /^McCormick Place (South|North) Building$/, COVER_UP = 13;
  // the North Building isn't in the city files under its name: its outline from OSM (way 769452749), its roof 28.7 m up
  // (Cook County 2022 LiDAR: the surface model's median over the footprint less the ground beside it)
  const MCC_NORTH = { n: "McCormick Place North Building", h: 28.7, m: 0, p: [[-87.616795,41.851855],[-87.617188,41.85284],[-87.617194,41.852854],[-87.617201,41.852871],[-87.617255,41.853008],[-87.617885,41.854588],[-87.61813,41.855204],[-87.617853,41.855266],[-87.617724,41.855295],[-87.617682,41.855305],[-87.617182,41.855416],[-87.617118,41.85543],[-87.617036,41.855448],[-87.616975,41.855462],[-87.616943,41.855469],[-87.616894,41.855482],[-87.616856,41.855491],[-87.616264,41.85562],[-87.616219,41.855629],[-87.616222,41.855635],[-87.616268,41.855626],[-87.61628,41.855657],[-87.616293,41.85569],[-87.616246,41.8557],[-87.616185,41.855714],[-87.61612,41.855729],[-87.616018,41.855751],[-87.615992,41.855681],[-87.615577,41.854621],[-87.615287,41.85389],[-87.614913,41.852955],[-87.614594,41.852163],[-87.614548,41.85206],[-87.614536,41.852028],[-87.614666,41.851998],[-87.614769,41.851975],[-87.615311,41.851854],[-87.616341,41.851625],[-87.616397,41.851613],[-87.61742,41.851388],[-87.617458,41.85138],[-87.617498,41.851372],[-87.617497,41.851457],[-87.617535,41.851457],[-87.617533,41.851529],[-87.617387,41.851563],[-87.617382,41.85152],[-87.617413,41.851513],[-87.617413,41.851501],[-87.617414,41.851465],[-87.617393,41.85147],[-87.61736,41.851478],[-87.617339,41.851483],[-87.617343,41.851494],[-87.617223,41.851522],[-87.617236,41.851554],[-87.617166,41.85157],[-87.617096,41.851586],[-87.617096,41.851523],[-87.61704,41.851534],[-87.616972,41.85155],[-87.616896,41.851566],[-87.616862,41.851574],[-87.616791,41.851589],[-87.616755,41.851596],[-87.616701,41.851607],[-87.616718,41.85165],[-87.616734,41.851691],[-87.616751,41.851737],[-87.616795,41.851855]].flatMap(([lon, lat]) => { const q = lonLat(lon, lat); return [q.x, q.z]; }) };
  const COVER = [Infinity, -Infinity];
  // Heights measured from Cook County's 2022 LiDAR where the city files are wrong, by a point inside the building:
  // McCormick Place's Lakeside Center (the East building), 100 m in OSM; its roof is 25.9 m up, the overhanging roof
  // slab (OSM's upper part) from 23.5 m. The hall under it is dark glass; the roof's edge is black steel trusses.
  const LAKESIDE = lonLat(-87.612514, 41.852671);
  const MEASURED = [{ at: LAKESIDE, fix: (b) => (b.m > 0 ? { ...b, m: 23.5, h: 25.9, f: "t", c: [0.045, 0.045, 0.05] } : { ...b, h: 23.5, f: "c", c: [0.1, 0.11, 0.13] }) }];
  // the glazed footbridges between McCormick Place's halls and over Lake Shore Drive and the tracks: OSM's long, thin
  // 6 m buildings near it, which OSM has standing on the ground. Here their floor is SKY_DECK up (assumed: clear of the
  // catenary and the highway), on a slab, with a pier near each end.
  const SKY_DECK = 8;
  // small OSM buildings around Lakeside Center that read as clutter (the user's mark-up), by a point inside each:
  // a pavilion by its north-west corner, two thin stair towers by the footbridge, and a hut at the footbridge's west end
  // and east of the line around 18th St (Museum Campus, the edge of Lake Shore Drive): the scatter of small OSM sheds and
  // kiosks there reads as clutter. Any building under 30 m across and 12 m tall in this box goes.
  const CLEAR_A = lonLat(-87.6178, 41.864), CLEAR_B = lonLat(-87.610, 41.855);
  const REMOVED = [[-87.61381, 41.85483], [-87.61364, 41.85189], [-87.61356, 41.85191], [-87.61439, 41.85177]].map(([lon, lat]) => lonLat(lon, lat));
  // ...and two that stay although they are within the corridor cleared beside the line: 734 N Halsted and 825 W Chicago
  // Ave, 7 storeys each on the corner of Chicago and Halsted, 11.5 and 13.4 m from the line's centre where it keeps to
  // the railroad's strip (RR_STRIP), clear of the platforms (8.6 m)
  const KEPT = [[-87.64805, 41.8958291], [-87.6484805, 41.8961227]].map(([lon, lat]) => lonLat(lon, lat));
  const MCC_CENTRE = lonLat(-87.6155, 41.8524);
  const skybridge = (b) => {
    if (b.h > 6 || Math.hypot(b.p[0] - MCC_CENTRE.x, b.p[1] - MCC_CENTRE.z) > 400) return false;
    let A = 0, P = 0;
    for (let i = 0; i + 3 < b.p.length; i += 2) { A += b.p[i] * b.p[i + 3] - b.p[i + 2] * b.p[i + 1]; P += Math.hypot(b.p[i + 2] - b.p[i], b.p[i + 3] - b.p[i + 1]); }
    const width = (P - Math.sqrt(Math.max(0, P * P - 8 * Math.abs(A)))) / 4;   // of the rectangle with this area and perimeter
    return width < 13 && Math.abs(A) / 2 / width > 40;
  };
  const inside = (x, z, p) => { let hit = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) { const ax = p[i], az = p[i + 1], bx = p[j], bz = p[j + 1]; if ((az > z) !== (bz > z) && x < (bx - ax) * (z - az) / (bz - az) + ax) hit = !hit; } return hit; };
  const undercroft = (b) => {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8e8f8a, roughness: 0.95, side: THREE.DoubleSide });
    const pos = [];
    for (let i = 0; i + 3 < b.p.length; i += 2) {                 // the walls up to the slab, open where the railway passes
      const ax = b.p[i], az = b.p[i + 1], bx = b.p[i + 2], bz = b.p[i + 3], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 2));
      for (let k = 0; k < n; k++) {
        const x0 = ax + (bx - ax) * k / n, z0 = az + (bz - az) * k / n, x1 = ax + (bx - ax) * (k + 1) / n, z1 = az + (bz - az) * (k + 1) / n;
        if (nearRailway((x0 + x1) / 2, (z0 + z1) / 2, 0.5)) continue;
        pos.push(x0, 0, z0, x1, 0, z1, x1, COVER_UP, z1, x0, 0, z0, x1, COVER_UP, z1, x0, COVER_UP, z0);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, wallMat));
    const ring = []; for (let i = 0; i + 1 < b.p.length - 2; i += 2) ring.push(V2(b.p[i], -b.p[i + 1]));
    flatShape(ring, COVER_UP - 0.02, 0x4f5153, [], { side: THREE.DoubleSide });   // the slab's underside
    for (let d = SOUTH.d0; d < SOUTH.d0 + SOUTH.len; d += 4) { const q = at(d).p; if (inside(q.x, q.z, b.p)) { COVER[0] = Math.min(COVER[0], d); COVER[1] = Math.max(COVER[1], d); } }
  };
  /* ---- buildings: real footprints and parts at their real heights, in their
          real colours where OpenStreetMap or the landmark list has them ---- */
  {
    const SUN = new THREE.Vector3(0.42, 0.78, 0.46).normalize();   // from the south-east, high
    const BAY = 3.6, FLOOR = 3.4;                         // metres per window bay and per storey
    const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    // ordinary buildings with no colour of their own: brick and stone for the city's lofts and flats, paler sheds
    const BRICK = [[0.66, 0.40, 0.30], [0.58, 0.35, 0.28], [0.72, 0.50, 0.36], [0.80, 0.72, 0.60], [0.74, 0.70, 0.66], [0.52, 0.34, 0.28], [0.84, 0.80, 0.74]];
    const SHED = [[0.83, 0.80, 0.74], [0.72, 0.70, 0.67], [0.66, 0.48, 0.38], [0.78, 0.76, 0.72], [0.58, 0.42, 0.34]];
    const PALETTE = [[0.80, 0.74, 0.64], [0.68, 0.63, 0.58], [0.74, 0.54, 0.42], [0.62, 0.65, 0.68], [0.86, 0.83, 0.76], [0.60, 0.46, 0.38]];
    const GLASS = [[0.50, 0.62, 0.76], [0.42, 0.52, 0.64], [0.62, 0.70, 0.78], [0.36, 0.44, 0.54], [0.70, 0.66, 0.60]];
    // One small repeating texture per kind of facade, tinted by the building's
    // colour. In each, the bottom-left corner is plain: roofs and blank walls use it.
    const TEX = 128;                                      // facade textures are TEX x TEX: one window bay wide, one storey tall
    const FACADES = {
      p: (c) => {                                         // masonry with a pair of punched windows
        c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, 128, 128);
        for (const x of [16, 74]) {
          c.fillStyle = "#e0dcd3"; c.fillRect(x - 2, 22, 42, 6); c.fillStyle = "#cfcac0"; c.fillRect(x - 3, 92, 44, 5);   // lintel, sill
          c.fillStyle = "#4f6074"; c.fillRect(x, 28, 38, 64); c.fillStyle = "#8296ab"; c.fillRect(x, 28, 38, 20);
          c.fillStyle = "#e9e6e0"; c.fillRect(x + 18, 28, 2, 64); c.fillRect(x, 58, 38, 2);
        }
      },
      b: (c) => {                                         // brick loft: one wide industrial window of many panes
        c.fillStyle = "#f1ede7"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#e6e1da"; for (let y = 6; y < 128; y += 10) c.fillRect(0, y, 128, 1);
        c.fillStyle = "#d8d2c8"; c.fillRect(12, 18, 104, 6); c.fillRect(10, 98, 108, 6);
        c.fillStyle = "#465463"; c.fillRect(14, 24, 100, 74); c.fillStyle = "#73869a"; c.fillRect(14, 24, 100, 24);
        c.fillStyle = "#c3c9ce"; for (let x = 14; x <= 114; x += 20) c.fillRect(x - 1, 24, 2, 74); for (let y = 24; y <= 98; y += 18.5) c.fillRect(14, y - 1, 100, 2);
      },
      w: (c) => {                                         // low warehouse: panel seams and a small high window
        c.fillStyle = "#f2f0eb"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#e3e0d9"; c.fillRect(126, 0, 2, 128); c.fillRect(0, 0, 128, 5);
        c.fillStyle = "#566575"; c.fillRect(40, 26, 50, 22); c.fillStyle = "#e9e6e0"; c.fillRect(64, 26, 2, 22);
      },
      g: (c) => {                                         // street level: shopfront glass between piers, under a sign band
        c.fillStyle = "#f0ede8"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#dcd8cf"; c.fillRect(0, 0, 128, 26);
        c.fillStyle = "#3f4d5c"; c.fillRect(14, 26, 104, 90); c.fillStyle = "#6f8194"; c.fillRect(14, 26, 104, 22);
        c.fillStyle = "#d9dde0"; c.fillRect(64, 26, 2, 90);
      },
      f: (c) => {                                         // tall metal fins of uneven widths, unbroken from storey to storey
        c.fillStyle = "#f7f7f5"; c.fillRect(0, 0, 128, 128);
        [[6, 3, "#d2d6d9"], [20, 2, "#e0e3e5"], [27, 4, "#c9ced2"], [45, 2, "#dadde0"], [58, 3, "#d0d4d8"], [71, 2, "#e2e4e6"],
          [90, 4, "#cbd0d4"], [97, 2, "#dde0e2"], [113, 3, "#d3d7da"]].forEach(([x, w, col]) => { c.fillStyle = col; c.fillRect(x, 0, w, 128); });
      },
      c: (c) => { c.fillStyle = "#f3f7fb"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#d3dde7"; c.fillRect(0, 0, 128, 24); c.fillStyle = "#bcc8d4"; c.fillRect(120, 0, 8, 128); c.fillRect(58, 0, 4, 128); },   // glass curtain wall
      r: (c) => { c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#566a82"; c.fillRect(0, 20, 128, 60); c.fillStyle = "#7f93a8"; c.fillRect(0, 20, 128, 14); },    // ribbon windows
      v: (c) => { c.fillStyle = "#56677c"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#7f93a8"; c.fillRect(0, 0, 128, 20); c.fillStyle = "#f6f4f0"; c.fillRect(0, 0, 48, 128); },    // vertical piers
      d: (c) => { c.fillStyle = "#e9edf0"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#8f98a2"; c.fillRect(118, 0, 10, 128); c.fillRect(0, 0, 128, 12); },                             // dark metal grid
      s: (c) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#e6e2da"; c.fillRect(0, 0, 128, 4); },                                                           // plain stone
      t: (c) => {                                         // a steel roof truss seen side on: chords, posts and diagonals, open between
        c.clearRect(0, 0, 128, 128); c.fillStyle = "#f2f2f2";
        c.fillRect(0, 0, 128, 16); c.fillRect(0, 112, 128, 16); c.fillRect(0, 0, 7, 128);
        c.strokeStyle = "#f2f2f2"; c.lineWidth = 6; c.beginPath(); c.moveTo(4, 116); c.lineTo(64, 12); c.lineTo(124, 116); c.stroke();
      },
      x: (c) => {                                         // a footbridge's glazing: one big, nearly clear pane per bay, in a slim frame
        c.clearRect(0, 0, 128, 128); c.fillStyle = "rgba(205, 222, 235, 0.2)"; c.fillRect(0, 0, 128, 128);
        c.fillStyle = "#e8eaec"; c.fillRect(0, 0, 128, 10); c.fillRect(0, 116, 128, 12); c.fillRect(0, 0, 4, 128); c.fillRect(124, 0, 4, 128);
      },
      m: (c) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#9aa6b2"; c.fillRect(0, 0, 128, 3); c.fillRect(0, 0, 2, 128); c.fillRect(64, 0, 1, 128); },     // mirror glass: only thin mullions (the reflection is the material's: see below)
    };
    // Mirror glass reflects a painted surround: sky above, the haze at the horizon, the city below it.
    // Tinted by the building's colour, so blue glass gives back a blue sky.
    const mirrorGlass = (tex) => {
      const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
      const c = cv.getContext("2d"), g = c.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, "#3d7fd0"); g.addColorStop(0.36, "#9cc2e8"); g.addColorStop(0.5, "#e8eef3"); g.addColorStop(0.53, "#8a929a"); g.addColorStop(1, "#3c4248");
      c.fillStyle = g; c.fillRect(0, 0, 256, 128);
      for (let x = 0; x < 256; x += 3) { const h = 2 + 9 * ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; c.fillStyle = "rgba(70,78,88,0.55)"; c.fillRect(x, 64 - h, 3, h); }   // other towers, on the horizon
      const env = new THREE.CanvasTexture(cv);
      env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, metalness: 0.9, roughness: 0.08, envMap: env, envMapIntensity: 1.6, side: THREE.DoubleSide });
    };
    const groups = {};
    for (const k of Object.keys(FACADES)) groups[k] = { pos: [], col: [], uvs: [] };
    // Extrude one closed ring from y0 to y1 into facade group f. `windows` maps
    // the facade texture on; `apex` (a height) closes the top as a pyramid instead of flat.
    const extrude = (f, p, y0, y1, c, windows, apex = 0) => {
      const G = groups[f];
      const push = (v, k, u = 0.02, w = 0.02) => { G.pos.push(v[0], v[1], v[2]); G.col.push(c[0] * k, c[1] * k, c[2] * k); G.uvs.push(u, w); };
      const n = p.length / 2 - 1;                         // ring is closed: last point repeats the first
      const glassy = f === "c" || f === "d" || f === "r" || f === "v" || f === "g" || f === "m";
      let cx = 0, cz = 0;
      for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
      for (let i = 0; i < n; i++) {
        const x0 = p[i * 2], z0 = p[i * 2 + 1], x1 = p[i * 2 + 2], z1 = p[i * 2 + 3];
        const len = Math.hypot(x1 - x0, z1 - z0);
        if (len < 0.05) continue;
        const nx = (z1 - z0) / len, nz = -(x1 - x0) / len;
        const lit = 0.58 + 0.42 * Math.max(0, nx * SUN.x + nz * SUN.z);
        // darker toward the street; tall glass also picks up more sky toward the top
        const lo = lit * (glassy && y1 - y0 > 40 ? 0.74 : 0.82), hi = lit * (glassy && y1 - y0 > 40 ? 1.05 : 1);
        const A = [x0, y0, z0], B = [x1, y0, z1], C = [x1, y1, z1], D = [x0, y1, z0];
        if (windows) {
          const pane = f === "x", u1 = Math.max(1, Math.round(len / (pane ? 16 : BAY))), v0 = pane ? 0 : Math.round(y0 / FLOOR), v1 = pane ? 1 : Math.max(v0 + 1, Math.round(y1 / FLOOR));
          push(A, lo, 0, v0); push(B, lo, u1, v0); push(C, hi, u1, v1);
          push(A, lo, 0, v0); push(C, hi, u1, v1); push(D, hi, 0, v1);
        } else {
          push(A, lo); push(B, lo); push(C, hi);
          push(A, lo); push(C, hi); push(D, hi);
        }
        if (apex) { push(D, lit * 0.95); push(C, lit * 0.95); push([cx, apex, cz], lit * 1.05); }
      }
      if (apex) return;
      const contour = [];
      for (let i = 0; i < n; i++) contour.push(V2(p[i * 2], p[i * 2 + 1]));
      for (const t of THREE.ShapeUtils.triangulateShape(contour, [])) for (const k of t) push([contour[k].x, y1, contour[k].y], 1.08);
    };
    const shrink = (p, k) => {                            // a ring pulled toward its centre
      const n = p.length / 2 - 1; let cx = 0, cz = 0;
      for (let i = 0; i < n; i++) { cx += p[i * 2] / n; cz += p[i * 2 + 1] / n; }
      return p.map((v, i) => (i % 2 ? cz : cx) + (v - (i % 2 ? cz : cx)) * k);
    };
    // Bally's Chicago: the resort as designed is assets/ballys-resort/ (the casino, its parking decks, the hotel tower and
    // the riverfront landscape), its outline clearing OpenStreetMap's buildings; the earlier model's site plan
    // (assets/ballys-chicago.js: its pixels in local metres, PLAN) still gives the employee car park north of the tracks
    const PLAN = ballysPlan(city.origin);
    const RESORT = buildBallysResort({ THREE, origin: city.origin }), RESORT_SITE = RESORT.userData.site;
    const ring = (pts) => { const q = pts.flatMap(([px, py]) => PLAN(px, py)); return [...q, q[0], q[1]]; };
    // where OpenStreetMap's buildings give way to the plan: the casino site, and north of the tracks the blocks
    // the plan's Phase 1 turns into a temporary employee car park
    const SITE = [[1003, 15], [520, 15], [520, 300], [490, 300], [490, 470], [560, 470], [626, 402], [1003, 400]].map(([px, py]) => V2(...PLAN(px, py)));
    const inSite = (x, z) => (() => {
      let hit = false;
      for (let i = 0, j = SITE.length - 1; i < SITE.length; j = i++) {
        const a = SITE[i], b = SITE[j];
        if ((a.y > z) !== (b.y > z) && x < (b.x - a.x) * (z - a.y) / (b.y - a.y) + a.x) hit = !hit;
      }
      return hit;
    })();
    const ELSTON_WAREHOUSE = lonLat(-87.65866, 41.90236);
    // the Obama Presidential Center: the campus is assets/obama-center.js; OpenStreetMap's buildings on its site (the
    // Museum 32 m tall from its "9 levels", the Forum, the Library and Home Court as 6 m boxes) give way to it
    const OPC = obamaSite(city.origin), MSI = msiSite(city.origin);   // (and the Museum of Science and Industry: assets/msi.js)
    const MUSEUM_PARK = museumParkSite(city.origin);                  // (and the Museum Park towers: assets/museum-park.js)
    const HALSTED_POINTE = halstedPointeSite(city.origin);            // (and Halsted Pointe on Goose Island: assets/halsted-pointe.js)
    const FOUNDRY = foundryParkSite(city.origin);                     // (and Foundry Park on the Finkl site: assets/foundry-park.js)
    const SOLDIER_FIELD = soldierFieldSite(city.origin);              // (and Soldier Field, east of the tracks by 18th St: assets/soldier-field.js)
    const WILLIS = willisTowerSite(city.origin);                      // (and the Willis Tower, whose nine tubes OSM draws as one box: assets/willis-tower.js)
    const PRAIRIE = prairieMaterialSite(city.origin);                 // (and Prairie Material's Yard 32 by Chicago/Halsted: assets/prairie-material.js)
    const TARGET = targetDivisionSite(city.origin);                   // (and the Target at Division and Larrabee: assets/target-division.js)
    const SOLSTICE = solsticeSite(city.origin);                       // (and Solstice on the Park in Hyde Park: assets/solstice-on-the-park.js)
    const N_MICHIGAN = northMichigan875Site(city.origin);             // (and 875 N Michigan, the old John Hancock Center: assets/875-north-michigan.js)
    const ELIZABETH = elizabeth410Site(city.origin);                  // (and 410 N Elizabeth, going up: assets/elizabeth-410.js)
    const MARCEY = marcey1840Site(city.origin);                       // (and 1840 N Marcey, approved: assets/marcey-1840.js)
    [...city.buildings, MCC_NORTH].forEach((b, k) => {
      const bi = b.i === undefined ? k : b.i;            // its number in the film's first city file, so its colour stays the same in a wider one
      const n = b.p.length / 2 - 1;
      if (n < 3) return;
      const overTracks = OVER_TRACKS.test(b.n || "");
      if (overTracks) { undercroft(b); b = { ...b, m: COVER_UP }; }
      for (const q of MEASURED) if (inside(q.at.x, q.at.z, b.p)) b = q.fix(b);
      if (REMOVED.some((q) => inside(q.x, q.z, b.p) || Math.hypot(b.p[0] - q.x, b.p[1] - q.z) < 5)) return;   // (or a corner near it: the towers are 1 m thin)
      const sky = skybridge(b), kept = KEPT.some((q) => inside(q.x, q.z, b.p));
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, area = 0;
      for (let i = 0; i < n; i++) {
        const x = b.p[i * 2], z = b.p[i * 2 + 1];
        if (nearRailway(x, z, 1) && !overTracks && !sky && !kept) return;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
        area += x * b.p[i * 2 + 3] - b.p[i * 2 + 2] * z;
      }
      area = Math.abs(area) / 2;
      const w = x1 - x0, l = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (cx > CLEAR_A.x && cx < CLEAR_B.x && cz > CLEAR_A.z && cz < CLEAR_B.z && Math.max(w, l) < 30 && b.h <= 12) return;
      if (SOLDIER_FIELD.some((r) => inside(cx, cz, r))) return;          // (the stadium is assets/soldier-field.js)
      if (WILLIS.some((r) => inside(cx, cz, r)) || PRAIRIE.some((r) => inside(cx, cz, r))) return;   // (as are the Willis Tower and the concrete plant)
      if (TARGET.some((r) => inside(cx, cz, r)) || SOLSTICE.some((r) => inside(cx, cz, r))) return;  // (and the Target and Solstice on the Park)
      if (N_MICHIGAN.some((r) => inside(cx, cz, r))) return;            // (and 875 N Michigan, its antennas with it)
      if (ELIZABETH.some((r) => inside(cx, cz, r))) return;             // (and 410 N Elizabeth's construction site)
      if (MARCEY.some((r) => inside(cx, cz, r))) return;                // (and 1840 N Marcey's two warehouses)
      // Bally's Chicago and its car park (built from the site plan, below) replace whatever OpenStreetMap still has there
      if (inSite(cx, cz) || inside(cx, cz, RESORT_SITE)) return;
      if (inside(cx, cz, OPC) || inside(cx, cz, MSI) || MUSEUM_PARK.some((r) => inside(cx, cz, r)) || HALSTED_POINTE.some((r) => inside(cx, cz, r)) || FOUNDRY.some((r) => inside(cx, cz, r))) return;
      // the multi-storey delivery warehouse at 1116 N Elston Ave, beside the line south of Division St: OpenStreetMap's
      // "2 levels" makes it 7.2 m, but warehouse storeys are tall and it carries parking on its roof (14 m assumed)
      if (Math.hypot(cx - ELSTON_WAREHOUSE.x, cz - ELSTON_WAREHOUSE.z) < 45 && b.h < 10) b = { ...b, h: 14 };
      // a chimney (OSM draws the old smokestacks as tiny, tall buildings): plain brick, no windows
      if (Math.max(w, l) < 8 && b.h > 15) b = { ...b, f: "s", c: [0.6, 0.36, 0.28] };
      if (sky) {
        extrude("s", b.p, SKY_DECK - 0.7, SKY_DECK, [0.8, 0.8, 0.78], false);              // the slab it walks on
        let ux = 0, uz = 0;                                                                  // its long axis: the longest side's direction
        for (let i = 0, best = 0; i + 3 < b.p.length; i += 2) { const dx = b.p[i + 2] - b.p[i], dz = b.p[i + 3] - b.p[i + 1], L = Math.hypot(dx, dz); if (L > best) { best = L; ux = dx / L; uz = dz / L; } }
        const t = []; for (let i = 0; i < n; i++) t.push((b.p[i * 2] - cx) * ux + (b.p[i * 2 + 1] - cz) * uz);
        for (const e of [Math.min(...t) + 4, Math.max(...t) - 4]) {
          const px = cx + ux * e, pz = cz + uz * e;
          extrude("s", [px - 0.6, pz - 0.6, px + 0.6, pz - 0.6, px + 0.6, pz + 0.6, px - 0.6, pz + 0.6, px - 0.6, pz - 0.6], 0, SKY_DECK - 0.7, [0.72, 0.72, 0.7], false);
        }
        b = { ...b, m: SKY_DECK, h: SKY_DECK + 4, f: "x", c: [0.86, 0.88, 0.9] };
      }
      // colour and facade: the building's own, or a plausible one for its size
      const hgt = b.h - b.m, tall = b.h > 70, low = hgt <= 7.5, tone = 0.92 + 0.16 * hash(bi + 0.5);
      const pal = tall ? GLASS : low ? SHED : BRICK;
      const base = b.c || pal[Math.floor(hash(bi) * pal.length)];
      // (half the low ones get punched windows rather than the warehouse's small high ones)
      const f = b.f || (tall ? (hash(bi + 0.3) < 0.5 ? "c" : "r") : low ? (hash(bi + 0.3) < 0.5 ? "w" : "p") : (area > 600 && hash(bi + 0.3) < 0.45 ? "b" : "p"));
      const c = base.map((v) => v * (b.c ? 0.96 + 0.08 * hash(bi + 0.5) : tone));
      if (!b.c && !tall && !low && !b.pt && !b.rs) {       // an ordinary mid-rise: shopfronts, upper floors, a parapet, roof plant
        const shop = b.m === 0 && hgt > 9 && hash(bi + 0.9) < 0.7 ? 4.2 : 0;
        if (shop) extrude("g", b.p, 0, shop, c.map((v) => v * 0.86), true);
        extrude(f, b.p, b.m + shop, b.h, c, true);
        extrude("s", b.p, b.h, b.h + 0.8, c.map((v) => v * 0.9), false);
        if (area > 250 && hgt > 10) {
          const k = 0.22 + 0.14 * hash(bi + 0.7), sx = (hash(bi + 1.3) - 0.5) * w * 0.3, sz = (hash(bi + 1.7) - 0.5) * l * 0.3;
          extrude("s", shrink(b.p, k).map((v, i) => v + (i % 2 ? sz : sx)), b.h + 0.8, b.h + 3.2 + 1.5 * hash(bi + 2.1), [0.62, 0.64, 0.66], false);
        }
        return;
      }
      const pointed = b.rs && /pyramid|hipped|dome|round|onion|cone|gabled|mansard/.test(b.rs);
      if (pointed) {
        const rh = Math.min(b.rh || Math.min(w, l) * 0.4, (b.h - b.m) * 0.6);
        extrude(f, b.p, b.m, b.h - rh, c, f !== "s", b.h);
      } else {
        extrude(f, b.p, b.m, b.h, c, f !== "s");
        // a rooftop plant room on big flat roofs that OSM hasn't modelled in parts
        if (!b.pt && b.h > 45 && area > 500) extrude("s", shrink(b.p, 0.42), b.h, b.h + 4 + 3 * hash(bi + 0.7), c.map((v) => v * 0.72), false);
      }
      if (b.a) for (const dx of [-6, 6]) {                 // antenna masts
        const q = [cx + dx - 0.7, cz - 0.7, cx + dx + 0.7, cz - 0.7, cx + dx + 0.7, cz + 0.7, cx + dx - 0.7, cz + 0.7, cx + dx - 0.7, cz - 0.7];
        extrude("s", q, b.h, b.h + b.a * (dx < 0 ? 1 : 0.92), [0.95, 0.95, 0.96], false);
      }
    });
    scene.add(RESORT);                                                       // (assets/ballys-resort/)
    scene.add(buildObamaCenter({ THREE, origin: city.origin, res: RES }));   // (assets/obama-center.js)
    scene.add(buildMSI({ THREE, origin: city.origin }));                    // (assets/msi.js)
    scene.add(buildMuseumPark({ THREE, origin: city.origin }));             // (assets/museum-park.js)
    scene.add(buildHalstedPointe({ THREE, origin: city.origin }));          // (assets/halsted-pointe.js)
    scene.add(buildFoundryPark({ THREE, origin: city.origin }));            // (assets/foundry-park.js)
    scene.add(buildSoldierField({ THREE, origin: city.origin }));           // (assets/soldier-field.js)
    scene.add(buildWillisTower({ THREE, origin: city.origin }));            // (assets/willis-tower.js)
    scene.add(buildTargetDivision({ THREE, origin: city.origin }));         // (assets/target-division.js)
    scene.add(buildSolstice({ THREE, origin: city.origin }));               // (assets/solstice-on-the-park.js)
    scene.add(buildNorthMichigan875({ THREE, origin: city.origin }));       // (assets/875-north-michigan.js)
    // (assets/elizabeth-410.js: the first tower at level 7, its crane standing free at a height for that stage, assumed,
    // not the 20 m above the finished roof it would climb to)
    scene.add(buildElizabeth410({ THREE, origin: city.origin, jibHeight: 60 }));
    scene.add(buildMarcey1840({ THREE, origin: city.origin }));             // (assets/marcey-1840.js)
    // (assets/prairie-material.js; its yard stops at our line's ballast, and its fence and trucks keep off the track)
    scene.add(buildPrairieMaterial({ THREE, origin: city.origin, railway: { line: plan.map((p) => [p.x, p.y]), half: 15 } }));
    // and from that plan, Phase 1's employee car park in the wedge between Halsted St and the tracks (the resort's own
    // landscape has the riverwalk, the drop-off and the trees): the plan's triangle, its east side now along the line
    // (19 m west of its centre, just outside the corridor cleared beside it) where the line keeps to the railroad's strip
    {
      const [N, SW, SE] = [[905, 24], [532, 24], [532, 290]].map(([px, py]) => V2(...PLAN(px, py)));
      const inTri = (q) => { const c = (a, b) => (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x), s1 = c(N, SW), s2 = c(SW, SE), s3 = c(SE, N); return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0); };
      const edge = [];
      for (let d = CH.d - 500; d < CH.d + 150; d += 4) { const q = at(d, -19).p; if (inTri(V2(q.x, q.z))) edge.push(q.x, q.z); }
      flatPolys([[SW.x, SW.y, ...edge, SW.x, SW.y]], 0.025, 0x5d6062);
    }
    for (const [k, G] of Object.entries(groups)) {
      if (!G.pos.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(G.uvs, 2));
      const [cv, c] = hiCanvas(TEX, TEX);
      FACADES[k](c);
      const tex = new THREE.CanvasTexture(cv);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const see = k === "x" ? { transparent: true, depthWrite: false } : k === "t" ? { alphaTest: 0.5 } : {};   // the footbridges' glass, the trusses' gaps
      scene.add(new THREE.Mesh(g, k === "m" ? mirrorGlass(tex) : new THREE.MeshBasicMaterial({ vertexColors: true, map: tex, side: THREE.DoubleSide, ...see })));
    }
  }

  /* ---- track: bed, rails, ties ---- */
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 1, side: THREE.DoubleSide });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: 0.3, metalness: 0.5,
    emissive: 0x39424a, emissiveIntensity: 0.45 });
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 1 });
  const ribbon = (sample, n, mat) => {                    // sample(i) -> [Vector3, Vector3]
    const pos = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const [l, r] = sample(i);
      pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); scene.add(m); return m;
  };
  // A ribbon along the alignment between d0 and d1, from (sideA, upA) to (sideB, upB).
  const along = (d0, d1, sideA, upA, sideB, upB, mat, step = 3) => {
    const n = Math.max(1, Math.ceil((d1 - d0) / step));
    return ribbon((i) => { const d = d0 + (i / n) * (d1 - d0); return [at(d, sideA, upA).p, at(d, sideB, upB).p]; }, n, mat);
  };
  const dummy = new THREE.Object3D();
  const setInst = (mesh, i, p, tan, roll = 0) => {
    dummy.position.copy(p); dummy.lookAt(p.clone().add(tan));
    if (roll) dummy.rotateOnWorldAxis(tan, -roll);                // lean with the banked track
    dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
  };
  const place = (mesh, i, d, side, up) => { const q = at(d, sideFn(side)(d), up); setInst(mesh, i, q.p, q.tan, bankAt(d)); };
  // ours: two tracks. The bed is as wide as a ramp outside, and as wide as the bore inside.
  along(0, PORTAL, -TRENCH + 0.05, -0.12, TRENCH - 0.05, -0.12, bedMat);
  along(PORTAL, PORTAL2, -BED, -0.12, BED, -0.12, bedMat);
  along(PORTAL2, LENGTH, -TRENCH + 0.05, -0.12, TRENCH - 0.05, -0.12, bedMat);
  // Ties and ballast only where the line shares the surface with the existing railways. From the top
  // of one ramp to the top of the other it is slab track (direct fixation): each rail sits on fasteners
  // on a continuous concrete plinth, with no ties, and a drain runs down the middle of the slab.
  const tieAt = [];
  for (let i = 0; i < Math.floor(LENGTH / TIE_EVERY); i++) { const d = i * TIE_EVERY; if (d < RAMP_START || d > RAMP_END) tieAt.push(d); }
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.14, 0.24), tieMat, tieAt.length * 2);
  const FIX_EVERY = 0.75, fixAt = [];
  for (let d = RAMP_START; d <= RAMP_END; d += FIX_EVERY) fixAt.push(d);
  const fixings = new THREE.InstancedMesh(new THREE.BoxGeometry(0.36, 0.05, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x2f3336, roughness: 0.7, metalness: 0.3 }), fixAt.length * 4);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x8b8f8c, roughness: 0.95, side: THREE.DoubleSide });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xa9adaa, roughness: 0.9, side: THREE.DoubleSide });
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x2a2c2d, roughness: 1, side: THREE.DoubleSide });
  const slabSpans = [[RAMP_START, PORTAL, TRENCH - 0.05], [PORTAL, PORTAL2, BED], [PORTAL2, RAMP_END, TRENCH - 0.05]];
  for (const [d0, d1, half] of slabSpans) {
    along(d0, d1, -half, -0.1, half, -0.1, slabMat);
    along(d0, d1, -0.22, -0.085, 0.22, -0.085, drainMat);
  }
  [(d) => railAt(0, d), (d) => railAt(1, d)].forEach((c, k) => {   // (the slab track is all underground, where c is -OFF and OFF)
    [-0.7175, 0.7175].forEach((s, j) => {
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(subCurve(0, LENGTH, (d) => c(d) + s, 0.1, 3), Math.ceil(LENGTH / 3), 0.055, 6, false), railMat));
      const cs = c(PORTAL) + s;
      for (const [d0, d1] of slabSpans) {
        along(d0, d1, cs - 0.3, 0.02, cs + 0.3, 0.02, plinthMat);                 // plinth top...
        for (const e of [-0.3, 0.3]) along(d0, d1, cs + e, -0.1, cs + e, 0.02, plinthMat);   // ...and its sides
      }
      fixAt.forEach((d, i) => place(fixings, (k * 2 + j) * fixAt.length + i, d, cs, 0.045));
    });
    tieAt.forEach((d, i) => place(ties, k * tieAt.length + i, d, c, -0.04));
  });
  scene.add(ties, fixings);

  /* ---- the other tracks on the surface, and (in the south) the overhead wires ---- */
  const steel = new THREE.MeshStandardMaterial({ color: 0x59605f, roughness: 0.8, metalness: 0.3 });
  // lats: each track's offset from the corridor's line, in metres or as a function of s (metres along it)
  const surfaceTracks = (cor, lats, wires) => {
    const n = Math.floor(cor.len / TIE_EVERY);
    const t = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.14, 0.24), tieMat, n * lats.length);
    lats.forEach((lat, k) => {
      const la = sideFn(lat);
      for (const s of [-0.7175, 0.7175]) {
        const pts = [];
        for (let d = 0; d < cor.len; d += 10) pts.push(cor.pt(d, la(d) + s, 0.1));
        pts.push(cor.pt(cor.len, la(cor.len) + s, 0.1));
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.055, 6, false), railMat));
      }
      for (let i = 0; i < n; i++) setInst(t, k * n + i, cor.pt(i * TIE_EVERY, la(i * TIE_EVERY), -0.04), cor.dirAt(i * TIE_EVERY));
    });
    scene.add(t);
    if (!wires) return;
    const spans = [];
    for (let s = 15; s < cor.len; s += 46) if (!nearOver(cor.d0 + s, 16)) spans.push(s);   // (none under a bridge)
    const PL = cor.latL * 0.76, PR = cor.latR * 0.76;             // (inside the edges, on top of any embankment)
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 8.2, 0.28), steel, spans.length * 2);
    const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(PR - PL + 0.4, 0.3, 0.3), steel, spans.length);
    spans.forEach((s, i) => {
      setInst(posts, i * 2, cor.pt(s, PL, 4.1), cor.dirAt(s));
      setInst(posts, i * 2 + 1, cor.pt(s, PR, 4.1), cor.dirAt(s));
      setInst(beams, i, cor.pt(s, (PL + PR) / 2, 7.9), cor.dirAt(s));
    });
    scene.add(posts, beams);
    const wire = [];
    const seg = (p, q) => wire.push(p.x, p.y, p.z, q.x, q.y, q.z);
    lats.forEach((lat) => {                                       // contact and messenger wires, every 10 m along the corridor
      const la = sideFn(lat);
      for (let d = 0; d < cor.len; d += 10) {
        const d1 = Math.min(d + 10, cor.len);
        for (const h of [5.7, 6.9]) seg(cor.pt(d, la(d), h), cor.pt(d1, la(d1), h));
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(wire, 3));
    scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x2c3030 })));
  };
  surfaceTracks(SOUTH, [(s) => meSide(0, s), (s) => meSide(2, s)], true);   // the Metra Electric's other two (it is electrified)
  // to the UP North... (the one to the east ends 100 m past Chicago/Halsted, where our line bends onto the industrial
  // spur past Prairie Material's yard: its silos stand where that track would run)
  const EAST_TRACK_END = CH.d + 100;
  surfaceTracks(curvedCorridor(northFrom, EAST_TRACK_END, -15, 15), [-10.5, 10.5], false);
  surfaceTracks(curvedCorridor(EAST_TRACK_END, JOIN_D, -15, 15), [-10.5], false);
  // ...and beside it to the west, the UP Northwest's two tracks, until they curve away north-west at Clybourn (in OSM they
  // are 4 m apart, right beside the UP North's; here moved out past the platforms, assumed). North of Clybourn the UP North
  // is its own two tracks.
  const UPNW_END = Math.min(CLY.d + 320, BRIDGE.d0 - 10);          // (it has its own bridge over the river, further west)
  const upnwAway = (s) => 30 * smooth((JOIN_D + s - CLY.platTo) / 300);
  surfaceTracks(curvedCorridor(JOIN_D, UPNW_END, -15, 10), [(s) => -10.5 - upnwAway(s), (s) => -14.5 - upnwAway(s)], false);

  /* ---- south of where our alignment begins (in the opening's area: city.rails), the Metra Electric runs on: its main
          tracks from OpenStreetMap, on the same embankment (EMB_ME), between concrete walls, with a plate-girder bridge
          over each street that passes under ---- */
  if (city.rails && city.introArea) {
    const TOP = EMB_ME, HALF = 3, [AW, AN, AE, AS] = city.introArea;
    const CELL = 40, grid = new Map(), key = (i, j) => i * 100003 + j;
    for (const rd of city.roads) for (let i = 0; i + 3 < rd.p.length; i += 2) {
      const sgm = [rd.p[i], rd.p[i + 1], rd.p[i + 2], rd.p[i + 3], rd.w];
      if (Math.max(sgm[0], sgm[2]) < AW || Math.min(sgm[0], sgm[2]) > AE || Math.max(sgm[1], sgm[3]) < AN || Math.min(sgm[1], sgm[3]) > AS) continue;
      for (let a = Math.floor(Math.min(sgm[0], sgm[2]) / CELL); a <= Math.floor(Math.max(sgm[0], sgm[2]) / CELL); a++)
        for (let b = Math.floor(Math.min(sgm[1], sgm[3]) / CELL); b <= Math.floor(Math.max(sgm[1], sgm[3]) / CELL); b++) {
          const k = key(a, b); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(sgm);
        }
    }
    const top = [], walls = [], girders = [], strips = [], stripUV = [];
    const quad = (arr, a, b, c, d) => arr.push(...a, ...b, ...c, ...a, ...c, ...d);
    // each track: a strip painted with its ties (every TIE_EVERY) and rails, so that it stays smooth far off
    const tieTex = (() => {
      const cv = document.createElement("canvas"); cv.width = 64; cv.height = 32;
      const c = cv.getContext("2d"), px = (m) => m / 2.6 * 64;
      c.fillStyle = "#57524d"; c.fillRect(0, 0, 64, 32);
      c.fillStyle = "#3a3632"; c.fillRect(px(0.05), 0, px(2.5), 32 * 0.24 / TIE_EVERY);
      c.fillStyle = "#c3c9cd"; for (const o of [1.3 - 0.7175, 1.3 + 0.7175]) c.fillRect(px(o - 0.04), 0, Math.max(1, px(0.08)), 32);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
      return t;
    })();
    for (const r of city.rails) {
      if (r.s) continue;                                          // (sidings and yards: not on the embankment)
      for (let i = 0; i + 3 < r.p.length; i += 2) {
        const ax = r.p[i], az = r.p[i + 1], bx = r.p[i + 2], bz = r.p[i + 3], len = Math.hypot(bx - ax, bz - az);
        if (len < 0.3 || nearRailway((ax + bx) / 2, (az + bz) / 2, 2)) continue;
        const ux = (bx - ax) / len, uz = (bz - az) / len, nx = uz, nz = -ux;
        const pt = (t, off, y) => [ax + ux * t + nx * off, y, az + uz * t + nz * off];
        quad(top, pt(0, -HALF, TOP), pt(len, -HALF, TOP), pt(len, HALF, TOP), pt(0, HALF, TOP));
        quad(strips, pt(0, -1.3, TOP + 0.03), pt(len, -1.3, TOP + 0.03), pt(len, 1.3, TOP + 0.03), pt(0, 1.3, TOP + 0.03));
        const n = len / TIE_EVERY; stripUV.push(0, 0, 0, n, 1, n, 0, 0, 1, n, 1, 0);
        // where a street crosses under: the stretch of the segment its width (and a sidewalk each side) takes, at its angle
        const cuts = [], seen = new Set();
        for (let a = Math.floor(Math.min(ax, bx) / CELL); a <= Math.floor(Math.max(ax, bx) / CELL); a++)
          for (let b = Math.floor(Math.min(az, bz) / CELL); b <= Math.floor(Math.max(az, bz) / CELL); b++)
            for (const sgm of grid.get(key(a, b)) || []) {
              if (seen.has(sgm)) continue; seen.add(sgm);
              const [cx, cz, dx, dz, w] = sgm, ex = dx - cx, ez = dz - cz, den = ux * len * ez - uz * len * ex;
              if (Math.abs(den) < 1e-6) continue;
              const tt = ((cx - ax) * ez - (cz - az) * ex) / den, uu = ((cx - ax) * uz * len - (cz - az) * ux * len) / den;
              if (tt < 0 || tt > 1 || uu < 0 || uu > 1) continue;
              const sin = Math.abs(ux * ez - uz * ex) / Math.hypot(ex, ez), half = (w / 2 + 2.5) / Math.max(0.3, sin);
              cuts.push([tt * len - half, tt * len + half]);
            }
        cuts.sort((p, q) => p[0] - q[0]);
        let at0 = 0;
        const run = (t0, t1, bridge) => {
          if (t1 - t0 < 0.05) return;
          for (const sg of [-1, 1]) {
            if (bridge) quad(girders, pt(t0, sg * HALF, TOP - 1.3), pt(t1, sg * HALF, TOP - 1.3), pt(t1, sg * HALF, TOP), pt(t0, sg * HALF, TOP));
            else quad(walls, pt(t0, sg * HALF, -0.1), pt(t1, sg * HALF, -0.1), pt(t1, sg * HALF, TOP), pt(t0, sg * HALF, TOP));
          }
        };
        for (const [c0, c1] of cuts) { const s0 = Math.max(at0, c0), s1 = Math.min(len, c1); if (s1 <= s0) continue; run(at0, s0, false); run(s0, s1, true); at0 = s1; }
        run(at0, len, false);
      }
    }
    const mesh = (pos, color, extra = {}) => {
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide, ...extra })));
    };
    mesh(top, 0x57524d); mesh(walls, 0x9d9e97); mesh(girders, 0x6d7773, { roughness: 0.75, metalness: 0.15 });
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(strips, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(stripUV, 2)); sg.computeVertexNormals();
    scene.add(new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: tieTex, roughness: 1, side: THREE.DoubleSide })));
  }

  /* ---- the embankments (EMB): the fill under the railway, its sides sloping down to the street (a retaining wall where
          the corridor is too narrow for a slope), and over each street that passes under (GAPS) a plate-girder bridge
          between concrete abutments ---- */
  {
    const slopeMat = new THREE.MeshStandardMaterial({ color: 0x76805a, roughness: 1, side: THREE.DoubleSide });    // grassed
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9d9e97, roughness: 0.95, side: THREE.DoubleSide });  // concrete
    const topMat = new THREE.MeshStandardMaterial({ color: 0x6b6660, roughness: 1, side: THREE.DoubleSide });      // ballast
    const girderMat = new THREE.MeshStandardMaterial({ color: 0x6d7773, roughness: 0.75, metalness: 0.15, side: THREE.DoubleSide });
    const soffitMat = new THREE.MeshStandardMaterial({ color: 0x8d8f89, emissive: 0x2a2b28, roughness: 1, side: THREE.DoubleSide });   // (in shade: lit a little)
    const DECK = 1.3, PARAPET = 0.6, STEP = 4;
    const P = (d, lat, y) => at(d, lat).p.setY(y);
    // A strip of fill from d0 to d1: top edges L(d) and R(d), feet FL(d) and FR(d) at street level.
    const fill = (d0, d1, L, R, FL, FR) => {
      if (d1 - d0 < 1) return;
      const top = (d) => EMB(d) - 0.16, n = Math.max(1, Math.ceil((d1 - d0) / STEP)), dd = (i) => d0 + (i / n) * (d1 - d0);
      ribbon((i) => [P(dd(i), L(dd(i)), top(dd(i))), P(dd(i), R(dd(i)), top(dd(i)))], n, topMat);
      const clamp = (d) => Math.min(Math.max(d, d0), d1);
      const gaps = GAPS.filter(([a, b]) => EMB((a + b) / 2) > 0.6 && b + 40 > d0 && a - 40 < d1);
      const cut = (e, k, E) => e + k * E(e + k * E(e));            // where a bridge's end, skewed with its street, meets the edge E
      // the sides, broken at each bridge: the fill along each edge stops and starts again where the street crosses that edge
      const runsAt = (E) => { const r = [d0]; for (const [a, b, k] of gaps) r.push(clamp(cut(a, k, E)), clamp(cut(b, k, E))); r.push(d1); return r; };
      for (const [E, F] of [[L, FL], [R, FR]]) {
        const rt = runsAt(E), rb = runsAt(F);
        for (let j = 0; j + 1 < rt.length; j += 2) {
          const lt = rt[j + 1] - rt[j], lb = rb[j + 1] - rb[j];
          if (lt < 0.5 && lb < 0.5) continue;
          const m = Math.max(1, Math.ceil(Math.max(lt, lb) / STEP)), mid = (rt[j] + rt[j + 1]) / 2, steep = Math.abs(F(mid) - E(mid)) < 0.6 * EMB(mid);
          ribbon((i) => { const t = rt[j] + (i / m) * lt, u = rb[j] + (i / m) * lb; return [P(t, E(t), top(t)), P(u, F(u), -0.1)]; }, m, steep ? wallMat : slopeMat);
        }
      }
      // across: the abutments facing each street (square to it), and the fill's ends where the strip stops at full height
      const face = (e, k) => {
        const lats = [FL, L, R, FR].map((E) => E(e)), ys = [-0.1, top(e), top(e), -0.1];
        ribbon((i) => [P(clamp(e + k * lats[i]), lats[i], -0.1), P(clamp(e + k * lats[i]), lats[i], ys[i])], 3, wallMat);
      };
      for (const e of [d0, d1]) if (EMB(e) > 0.6 && !inGap(e)) face(e, 0);
      for (const [a, b, k] of gaps) {
        for (const e of [a, b]) if (e > d0 && e < d1) face(e, k);
        // the bridge: the deck's soffit and a plate girder along each edge, each running square to the street
        const m = Math.max(1, Math.ceil((b - a) / 2)), along = (E, f) => clamp(cut(a, k, E) + f * (b - a));
        if (along(L, 1) - along(L, 0) < 0.5 && along(R, 1) - along(R, 0) < 0.5) continue;
        ribbon((i) => { const t = along(L, i / m), u = along(R, i / m); return [P(t, L(t), EMB(t) - DECK), P(u, R(u), EMB(u) - DECK)]; }, m, soffitMat);
        for (const E of [L, R]) ribbon((i) => { const t = along(E, i / m); return [P(t, E(t), EMB(t) - DECK), P(t, E(t), EMB(t) + PARAPET)]; }, m, girderMat);
      }
    };
    // (the corridor's ends at the river are walls: the Deering Bridge's piers stand there)
    const span = (cor) => { let a = cor.d0, b = cor.d0 + cor.len; while (a < b && EMB(a) < 0.05) a += STEP; while (b > a && EMB(b) < 0.05) b -= STEP; return [a, b]; };
    for (const cor of [SOUTH, NORTH_A, NORTH_B]) {
      const [a, b] = span(cor), s = (d) => d - cor.d0;
      fill(a, b, (d) => Math.min(cor.latL + 0.9 * EMB(d), -10.2), (d) => Math.max(cor.latRAt(s(d)) - 0.9 * EMB(d), Math.min(10.2, cor.latRAt(s(d)))),
        () => cor.latL, (d) => cor.latRAt(s(d)));
    }
    // the UP Northwest's two tracks on their own fill beside ours, as they curve away west after Clybourn
    const nw = (d) => -12.5 - upnwAway(d - JOIN_D);
    fill(Math.max(JOIN_D, span(NORTH_A)[0]), UPNW_END, (d) => nw(d) - 3.5, (d) => Math.min(nw(d) + 3.5, -10.2), (d) => nw(d) - 3.5, (d) => Math.min(nw(d) + 3.5, -10.2));
  }

  /* ---- the bridges over the Metra Electric (OVERS): the footbridges' concrete decks rise from each end to OVER_DECK over
          the tracks on slender piers (43rd's and 41st's with blue masts splaying out over the tracks, stays down to the
          deck's edges); the road bridges climb on walled ramps to a girder span over the railway ---- */
  {
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide, ...extra });
    const conc = std(0xb7b8b2), soffit = std(0x8f918b, { emissive: 0x222320 }), asphalt = std(0x46494c, { roughness: 1 });
    const blue = std(0x4f8fce, { roughness: 0.45, metalness: 0.3 }), railing = std(0x8fa3ad, { roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.6 });
    const box = new THREE.BoxGeometry(1, 1, 1), UPV = new THREE.Vector3(0, 1, 0);
    const tube = (a, b, r, mat) => {
      const dir = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UPV, dir.normalize()); scene.add(m);
    };
    const stays = [];
    for (const o of OVERS) {
      if (o.d === null) continue;
      const base = EMB(o.d), deck = base + OVER_DECK, W = o.foot ? 2.3 : 7.5, TH = o.foot ? 0.8 : 1.4, RAMP = 95;
      let raw = o.pts.map((q) => V2(q.x, q.z));
      if (!o.foot) {                                              // the road's ramps, on along its line from each end
        const u = raw[1].clone().sub(raw[0]).normalize();
        raw = [raw[0].clone().addScaledVector(u, -RAMP), raw[0], raw[1], raw[1].clone().addScaledVector(u, RAMP)];
      }
      const P = [];                                               // every 2 m: point, distance along, direction
      for (let i = 1; i < raw.length; i++) {
        const a = raw[i - 1], b = raw[i], L = a.distanceTo(b), t = b.clone().sub(a).normalize(), s0 = P.length ? P[P.length - 1].s : 0;
        for (let k = P.length ? 1 : 0; k <= Math.ceil(L / 2); k++) { const f = Math.min(k * 2 / L, 1); P.push({ p: a.clone().lerp(b, f), s: s0 + f * L, t }); }
      }
      const L = P[P.length - 1].s, over = P.map((q) => !!nearRailway(q.p.x, q.p.y, 1));   // (has() gives a position, not true)
      const sA = P[over.indexOf(true)]?.s ?? L / 2, sB = P[over.lastIndexOf(true)]?.s ?? L / 2;
      const h = o.foot
        ? (s) => deck * Math.max(0, Math.min(1, sA > 10 ? s / (sA - 6) : 1, L - sB > 10 ? (L - s) / (L - sB - 6) : 1))
        : (s) => deck * smooth(s / RAMP) * (1 - smooth((s - (L - RAMP)) / RAMP));
      const at3 = (i, lat, y) => new THREE.Vector3(P[i].p.x - P[i].t.y * lat, y, P[i].p.y + P[i].t.x * lat);
      const near = P.map((q) => !!nearRailway(q.p.x, q.p.y, 4)), oA = P[near.indexOf(true)]?.s ?? sA, oB = P[near.lastIndexOf(true)]?.s ?? sB;
      const n = P.length - 1, H = P.map((q) => h(q.s)), open = P.map((q) => q.s >= oA && q.s <= oB);   // one span, first track to last (no wall dropping between tracks)
      ribbon((i) => [at3(i, -W, H[i] + 0.02), at3(i, W, H[i] + 0.02)], n, o.foot ? conc : asphalt);
      ribbon((i) => [at3(i, -W, Math.max(0, H[i] - TH)), at3(i, W, Math.max(0, H[i] - TH))], n, soffit);
      for (const lat of [-W, W]) {
        if (o.foot) {
          ribbon((i) => [at3(i, lat, Math.max(0, H[i] - TH)), at3(i, lat, H[i] + 0.25)], n, conc);
          ribbon((i) => [at3(i, lat * 0.98, H[i] + 0.25), at3(i, lat * 0.98, H[i] + 1.25)], n, railing);
        } else {
          ribbon((i) => [at3(i, lat, open[i] ? Math.max(0, H[i] - TH) : -0.1), at3(i, lat, H[i] + 1.0)], n, conc);
        }
      }
      if (o.foot) {                                               // piers every 20 m, none on the railway
        for (let i = 5; i < n - 3; i += 10) {
          const y = H[i] - TH;
          if (y < 1.5 || nearRailway(P[i].p.x, P[i].p.y, 1.5)) continue;
          const m = new THREE.Mesh(box, conc); m.scale.set(0.8, y, 0.8); m.position.set(P[i].p.x, y / 2, P[i].p.y); scene.add(m);
        }
      } else {                                                    // a pier wall each side of the railway, where the span begins and ends
        for (let i = 1; i <= n; i++) if (open[i] !== open[i - 1]) ribbon((k) => [at3(i, k ? W : -W, -0.1), at3(i, k ? W : -W, H[i] - TH)], 1, conc);
      }
      if (o.blue) {                                               // the masts: from each edge over the middle of the tracks, splaying out along and up
        const im = P.findIndex((q) => q.s >= (sA + sB) / 2), reach = 7;
        for (const sg of [-1, 1]) for (const e of [-1, 1]) {
          const j = Math.min(Math.max(im + e * reach, 0), n), foot = at3(im, sg * W, H[im] + 0.25), tip = at3(j, sg * (W + 2.6), H[j] + 7);
          tube(foot, tip, 0.22, blue);
          for (const k of [3, 6, 9]) { const q = at3(Math.min(Math.max(im + e * (reach + k), 0), n), sg * W, H[Math.min(Math.max(im + e * (reach + k), 0), n)] + 1.25); stays.push(tip.x, tip.y, tip.z, q.x, q.y, q.z); }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(stays, 3));
    scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x3f6f9f })));
  }

  // Trees, as instanced meshes: spots [{ x, z, h (its height), r (its crown's radius), c (0..1: which crown, which green) }].
  // A crown is a cluster of lumpy lobes (icosahedra, their corners pushed in and out), darker underneath and in the
  // gaps, lighter on top; three shapes, so neighbours differ. Each lobe is about a unit across the whole crown. detail:
  // the icosahedra's (0 for trees only ever seen from far off, a quarter of the faces).
  function plantTrees(spots, detail = 1) {
    if (!spots.length) return;
    const hash = (n) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
    const crownShape = (seed) => {
      const lobes = [[0, 0, 0, 0.78], [0.5, 0.12, 0.18, 0.56], [-0.44, 0.06, -0.3, 0.58], [0.08, 0.42, -0.36, 0.5], [-0.16, 0.34, 0.46, 0.5]]
        .slice(0, 4 + (seed % 2)).map(([x, y, z, r], k) => [x + (hash(seed * 7 + k) - 0.5) * 0.2, y, z + (hash(seed * 7 + k + 0.5) - 0.5) * 0.2, r]);
      const pos = [], col = [];
      for (const [cx, cy, cz, r] of lobes) {
        const g = new THREE.IcosahedronGeometry(r, detail), a = g.attributes.position;
        for (let i = 0; i < a.count; i++) {
          const x = a.getX(i), y = a.getY(i), z = a.getZ(i), n = 1 + (hash(seed + x * 13.1 + y * 7.7 + z * 3.3) - 0.5) * 0.28;   // the same corner moves the same way
          const px = cx + x * n, py = cy + y * n * 0.9, pz = cz + z * n;
          pos.push(px, py, pz);
          const sh = 0.55 + 0.45 * Math.min(1, Math.max(0, (py + 0.6) / 1.3)) * (0.75 + 0.25 * Math.hypot(x, y, z) / r);   // underside and inner faces in shade
          col.push(sh, sh, sh);
        }
        g.dispose();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.3, 1, detail ? 7 : 5), new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 }), spots.length);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 1, flatShading: true });
    const kinds = [0, 1, 2].map((v) => spots.filter((t) => Math.floor(t.c * 3) === v));
    const crowns = kinds.map((list, v) => new THREE.InstancedMesh(crownShape(v + 1), leafMat, Math.max(1, list.length)));
    const greens = [0x5a8a40, 0x6a9a4b, 0x4f7d3a, 0x77a352].map((c) => new THREE.Color(c));
    spots.forEach((t, i) => {
      dummy.position.set(t.x, t.h * 0.3, t.z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, t.h * 0.6, 1); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
    });
    kinds.forEach((list, v) => list.forEach((t, j) => {
      dummy.position.set(t.x, t.h - t.r * 0.75, t.z); dummy.rotation.set(0, t.c * 37.7, 0); dummy.scale.set(t.r * 1.15, t.r * 0.95, t.r * 1.15); dummy.updateMatrix();
      crowns[v].setMatrixAt(j, dummy.matrix); crowns[v].setColorAt(j, greens[Math.floor(hash(t.c * 97) * 4)]);
    }));
    scene.add(trunk, ...crowns);
  }

  /* ---- trees on both sides of the Metra Electric from 47th to 27th (as in the aerials: strips of trees between the
          railway and the streets and Lake Shore Drive), kept off the footbridges and road bridges ---- */
  {
    const K47 = SOUTH_STOPS[3], K27 = SOUTH_STOPS[5], STEP = 6;
    const hash = (n) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
    const spots = [];
    for (let d = K47.d + 60, i = 0; d < K27.d - 60; d += STEP, i++) for (const sg of [-1, 1]) for (let row = 0; row < 2; row++) {
      const k = i * 4 + (sg > 0 ? 2 : 0) + row;
      if (hash(k) < 0.3 || nearOver(d, 14)) continue;
      const lat = sg * (22.5 + row * 6 + hash(k + 0.5) * 4), dd = d + (hash(k + 0.7) - 0.5) * STEP;
      const p = at(dd, lat).p;
      spots.push({ x: p.x, z: p.z, h: 7 + hash(k + 0.9) * 7, r: 2.6 + hash(k + 0.3) * 2.2, c: hash(k + 0.1) });
    }
    plantTrees(spots);
  }

  /* ---- the opening's area, south of 59th (city.introArea: tools/build-intro-area.mjs): trees thick in its woods and
          scattered over its parks, along its residential streets, and wherever OpenStreetMap has one mapped; kept off
          streets, paths, buildings, water, the railway and the Obama Center's grounds (it has its own) ---- */
  if (city.introArea) {
    const [AW, AN, AE, AS] = city.introArea, inArea = (x, z) => x > AW && x < AE && z > AN && z < AS;
    const hash = (n) => { const x = Math.sin(n * 63.1 + 29.9) * 43758.5453; return x - Math.floor(x); };
    const CELL = 30, cell = (x, z) => Math.floor(x / CELL) * 100003 + Math.floor(z / CELL);
    const ways = new Map(), houses = new Map();                  // grids of street and path segments, and of buildings
    const into = (grid, x0, z0, x1, z1, item) => {
      for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
        const k = i * 100003 + j; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(item);
      }
    };
    for (const w of [...(city.roads || []), ...(city.paths || []).map((pa) => ({ ...pa, path: true }))]) for (let i = 0; i + 3 < w.p.length; i += 2) {
      const s = [w.p[i], w.p[i + 1], w.p[i + 2], w.p[i + 3], w.w / 2, !w.path && walked(w.w)];   // (and whether it has sidewalks)
      if (inArea(s[0], s[1]) || inArea(s[2], s[3])) into(ways, Math.min(s[0], s[2]) - 15, Math.min(s[1], s[3]) - 15, Math.max(s[0], s[2]) + 15, Math.max(s[1], s[3]) + 15, s);
    }
    for (const b of city.buildings) {
      if (!inArea(b.p[0], b.p[1])) continue;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < b.p.length; i += 2) { x0 = Math.min(x0, b.p[i]); x1 = Math.max(x1, b.p[i]); z0 = Math.min(z0, b.p[i + 1]); z1 = Math.max(z1, b.p[i + 1]); }
      into(houses, x0 - 2, z0 - 2, x1 + 2, z1 + 2, b.p);
    }
    const wetPolys = city.water.filter((p) => inArea(p[0], p[1]) || p.length > 400);
    const OPC_SITE = obamaSite(city.origin);
    // (nor on the sites of the modelled projects, which plant their own trees: Soldier Field's decks stand 13.5 m up)
    const MODEL_SITES = [...soldierFieldSite(city.origin), ...halstedPointeSite(city.origin), ...foundryParkSite(city.origin),
      ...willisTowerSite(city.origin), ...prairieMaterialSite(city.origin), ...targetDivisionSite(city.origin), ...solsticeSite(city.origin),
      ...northMichigan875Site(city.origin), ...elizabeth410Site(city.origin),
      ...marcey1840Site(city.origin)];
    // (a tree keeps off the sidewalks too, unless it's planted in the parkway between the curb and the sidewalk)
    const clear = (x, z, m, parkway = false) => {
      if (!inArea(x, z) || nearRailway(x, z, 8) || inside(x, z, OPC_SITE) || MODEL_SITES.some((r) => inside(x, z, r))) return false;
      for (const [ax, az, bx, bz, hw, sw] of ways.get(cell(x, z)) || []) {
        const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, f = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)) : 0;
        const dist = Math.hypot(x - ax - f * dx, z - az - f * dz);
        if (dist < hw + m) return false;
        if (sw && dist < hw + SIDEWALK[1] + m && !(parkway && dist < hw + SIDEWALK[0] - m)) return false;
      }
      for (const p of houses.get(cell(x, z)) || []) if (inside(x, z, p)) return false;
      return !wetPolys.some((p) => inside(x, z, p));
    };
    const spots = [];
    const tree = (x, z, k, big = 1) => spots.push({ x, z, h: (7 + hash(k) * 7) * big, r: (2.4 + hash(k + 0.3) * 1.8) * big, c: hash(k + 0.1) });
    // within a polygon (a flat [x, z, ...] ring), on a jittered grid `step` apart, keeping a share of the spots
    const fill = (p, step, keep, m, k0, big) => {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      let k = k0;
      for (let x = x0; x < x1; x += step) for (let z = z0; z < z1; z += step) {
        k++;
        const px = x + (hash(k + 0.4) - 0.5) * step * 0.8, pz = z + (hash(k + 0.6) - 0.5) * step * 0.8;
        if (hash(k) < keep && inside(px, pz, p) && clear(px, pz, m)) tree(px, pz, k, big);
      }
    };
    (city.trees || []).forEach(([x, z], i) => { if (clear(x, z, 0.5)) tree(x, z, 10 + i); });
    (city.woods || []).forEach((p, i) => fill(p, 9, 0.85, 1.5, 1e5 + i * 1e4, 1.1));
    city.parks.filter((p) => inArea(p[0], p[1])).forEach((p, i) => fill(p, 26, 0.4, 3, 2e6 + i * 1e4, 1));
    // along the residential streets, both sides, every 11 m or so, in the parkway between the curb and the sidewalk
    (city.avenues || []).forEach((w, i) => {
      for (let j = 0; j + 3 < w.p.length; j += 2) {
        const ax = w.p[j], az = w.p[j + 1], bx = w.p[j + 2], bz = w.p[j + 3], len = Math.hypot(bx - ax, bz - az);
        if (len < 4) continue;
        const nx = (bz - az) / len, nz = -(bx - ax) / len;
        for (let u = 5; u < len - 5; u += 11) for (const sg of [-1, 1]) {
          const k = 3e6 + i * 1e3 + j * 10 + u + (sg > 0 ? 0.5 : 0), off = w.w / 2 + SIDEWALK[0] / 2;
          const x = ax + (bx - ax) * u / len + sg * nx * off, z = az + (bz - az) * u / len + sg * nz * off;
          if (hash(k) < 0.75 && clear(x, z, 0.8, true)) tree(x, z, k, 0.95);
        }
      }
    });
    plantTrees(spots, 0);
  }
  /* ---- McCormick Place's undercroft (COVER): columns every 9 m along each side of the tracks and on the island ---- */
  if (COVER[0] < COVER[1]) {
    const colMat = new THREE.MeshStandardMaterial({ color: 0x9a9b95, roughness: 0.9 }), box = new THREE.BoxGeometry(0.9, COVER_UP, 0.9);
    const MP = SOUTH_STOPS[SOUTH_STOPS.length - 1], isl = MP.island ? MP.island.edges : null;
    for (let d = COVER[0] + 4; d < COVER[1] - 2; d += 9) {
      const lats = [SOUTH.latL + 1.2, SOUTH.latR - 1.2];
      if (isl && d > MP.platFrom && d < MP.platTo) { const [a, b] = isl(d); lats.push((a + b) / 2); }
      for (const lat of lats) { const m = new THREE.Mesh(box, colMat), q = at(d, lat).p; m.position.set(q.x, COVER_UP / 2, q.z); scene.add(m); }
    }
  }

  /* ---- our own overhead line, the whole way: a contact wire in the open,
          following the track down the ramps, and a rigid conductor rail hung
          from the roof underground (assumed, like the tunnel itself) ---- */
  {
    const WIRE_OUT = 5.7, WIRE_IN = 5.3;                          // contact height above the rail: open air, tunnel
    const wireUp = (d) => WIRE_OUT - (WIRE_OUT - WIRE_IN) *
      smooth((d - RAMP_START) / (PORTAL - RAMP_START)) * (1 - smooth((d - PORTAL2) / (RAMP_END - PORTAL2)));
    const wireCurve = (d0, d1, c) => {
      const pts = [], sd = sideFn(c);
      for (let d = d0; d < d1; d += 3) pts.push(at(d, sd(d), wireUp(d)).p);
      pts.push(at(d1, sd(d1), wireUp(d1)).p);
      return new THREE.CatmullRomCurve3(pts);
    };
    const copper = new THREE.MeshBasicMaterial({ color: 0x2c3030 });
    const railBar = new THREE.MeshStandardMaterial({ color: 0xaab2b4, roughness: 0.45, metalness: 0.6,
      emissive: 0xaab2b4, emissiveIntensity: 0.12 });
    for (const c of [(d) => railAt(0, d), (d) => railAt(1, d)]) {   // (over our two tracks)
      for (const [d0, d1] of [[0, PORTAL], [PORTAL2, LENGTH]]) {
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve(d0, d1, c), Math.ceil((d1 - d0) / 3), 0.022, 5, false), copper));
      }
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve(PORTAL, PORTAL2, c), Math.ceil((PORTAL2 - PORTAL) / 3), 0.06, 6, false), railBar));
    }
    // An upright box from `lo` to `hi` above the rail (a hanger, a dropper or a post).
    const upright = (mesh, i, d, side, lo, hi) => {
      const q = at(d, sideFn(side)(d), (lo + hi) / 2);
      dummy.scale.set(1, hi - lo, 1); setInst(mesh, i, q.p, q.tan, bankAt(d)); dummy.scale.set(1, 1, 1);
    };
    // underground: a hanger from the roof (or a station's ceiling) to each conductor rail, between the lamps
    const BORE_ROOF = CY + Math.sqrt(R * R - OFF * OFF) - 0.05;
    const hang = [];
    for (let d = Math.ceil(PORTAL / LIGHT_EVERY) * LIGHT_EVERY + LIGHT_EVERY / 2; d < PORTAL2; d += LIGHT_EVERY) hang.push(d);
    const hangers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 1, 0.09), steel, hang.length * 2);
    const clamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.16, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x7a3b2a, roughness: 0.7 }), hang.length * 2);   // insulators
    // in the halls, from a steel beam across the tracks between the galleries' edges
    const inHall = (d) => STN.some((S) => S.hall && d > S.boxFrom + 2 && d < S.boxTo - 2 && !(d > S.bridge[0] - 1 && d < S.bridge[1] + 1));
    const hallBeams = hang.filter(inHall), xBeams = new THREE.InstancedMesh(new THREE.BoxGeometry(PLAT_OUT * 2, 0.22, 0.16), new THREE.MeshBasicMaterial({ color: 0xc9cfd0 }), hallBeams.length);   // painted light, like the hall's steel
    hallBeams.forEach((d, i) => place(xBeams, i, d, 0, GAL - 0.68));
    scene.add(xBeams);
    hang.forEach((d, i) => {
      const box = STN.find((S) => d > S.boxFrom && d < S.boxTo);
      const roof = !box ? BORE_ROOF : !box.hall ? CEIL : inHall(d) ? GAL - 0.79 : box.bridge && d > box.bridge[0] - 1 && d < box.bridge[1] + 1 ? GAL - 0.8 : WIRE_IN + 0.2;
      [-OFF, OFF].forEach((c, k) => {
        upright(hangers, i * 2 + k, d, c, WIRE_IN + 0.2, roof);
        place(clamps, i * 2 + k, d, c, WIRE_IN + 0.13);
      });
    });
    scene.add(hangers, clamps);
    // in the open, beyond the Metra Electric's gantries: a frame over our two tracks,
    // on posts beside the ramp walls until the ramp is deep enough to span wall to wall
    const frames = [];
    for (let d = RAMP_START + 30; d < PORTAL - 6; d += 30) frames.push(d);
    for (let d = PORTAL2 + 12; d < LENGTH; d += 30) if (d < BRIDGE.d0 - 3 || d > BRIDGE.d1 + 3) frames.push(d);   // (none on the bridge)
    const LIFT = 1.0, POST = TRENCH + 0.25;                       // beam above the wire; posts just outside the walls
    const fBeams = new THREE.InstancedMesh(new THREE.BoxGeometry(POST * 2 + 0.3, 0.26, 0.26), steel, frames.length);
    const fPosts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 1, 0.28), steel, frames.length * 2);
    const fDrops = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.07), steel, frames.length * 2);
    frames.forEach((d, i) => {
      const h = wireUp(d), ground = -at(d).p.y + EMB(d);          // ground level (or the top of an embankment), measured from the rail
      place(fBeams, i, d, 0, h + LIFT);
      [-1, 1].forEach((sg, k) => {
        upright(fPosts, i * 2 + k, d, sg * POST, Math.min(ground, h + LIFT - 0.01), h + LIFT);
        upright(fDrops, i * 2 + k, d, railAt(k, d), h + 0.02, h + LIFT);
      });
    });
    scene.add(fBeams, fPosts, fDrops);
  }

  /* ---- the Halsted St and Chicago Ave viaducts: the two streets meet on a bridge right over the
          railway, each climbing to it on a ramp, fill between walls and then spans on piers (heights and ramp
          lengths assumed). The City (CDOT) is rebuilding them now (August 2025 to late 2026), and the film shows the
          new ones: steel-beam spans on open concrete piers, replaced in kind (the project's bid notice), raised bike
          lanes on Halsted, 24-hour CTA bus lanes on Chicago, new street lights and signals (CDOT's project page), and
          a concrete parapet topped with a black steel railing (CDOT's renderings for its June 2024 community meeting,
          as Streetsblog Chicago printed them). CDOT's streets are wider (Halsted 64-104 ft, Chicago 91 ft); here they
          keep the film's 16 m, so the lanes are squeezed in. The girders, piers, bearings, finishes and colors are
          assumed ---- */
  const VIA_DECK = 8.4, VIA_HALF = 8, VIA_HX = -2300, VIA_CZ = -3600;   // deck top above the ground, half-width; Halsted's and Chicago's centrelines in city.roads (local metres)
  {
    const DECK = VIA_DECK, HALF = VIA_HALF, HX = VIA_HX, CZ = VIA_CZ, RAMP = 110;   // ramp length
    const SLAB = 0.28, DEPTH = 1.4;                               // the deck slab; slab and girders together, so 7.0 m clear over the rails
    const PAR_W = 0.4, PAR_H = 0.7, CURB = 0.15, RAIL = 0.6;       // the parapet (its height above the sidewalk), the curb, the railing on the parapet
    const BAND = SLAB + CURB + PAR_H;                             // the deck's edge and the parapet's outer face, one band of concrete
    const BIKE = 1.4;                                             // Halsted's bike lanes, at sidewalk level between the curb and the sidewalk
    const GIRDERS = [-7.2, -4.8, -2.4, 0, 2.4, 4.8, 7.2];         // steel plate girders under each street, 2.4 m apart (the deck overhangs 0.8 m)
    const SEAT = DECK - DEPTH - 0.12;                             // the abutments' bridge seats, under the girders' bearings
    const HMIN = 4.6;                                             // the fill gives way to open spans where the deck is this high
    const STAIR_IN = 6.1;                                         // (openStation's IN: the station's stairs run up between this and PLAT_OUT)
    const hash = (n) => { const x = Math.sin(n * 74.7 + 13.9) * 43758.5453; return x - Math.floor(x); };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    // everything is gathered by material and drawn as one mesh each
    const batches = new Map();
    const bat = (mat) => { if (!batches.has(mat)) batches.set(mat, { p: [], uv: [] }); return batches.get(mat); };
    const quad = (mat, a, b, c, d, ta = [0, 0], tb = [1, 0], tc = [1, 1], td = [0, 1]) => {
      const B = bat(mat);
      for (const [q, t] of [[a, ta], [b, tb], [c, tc], [a, ta], [c, tc], [d, td]]) { B.p.push(q.x, q.y, q.z); B.uv.push(t[0], t[1]); }
    };
    const put = (mat, geo, m) => {                                // a geometry, placed by a matrix
      const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m), p = g.attributes.position, uv = g.attributes.uv, B = bat(mat);
      for (let i = 0; i < p.count; i++) { B.p.push(p.getX(i), p.getY(i), p.getZ(i)); B.uv.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); }
    };
    const BOX = new THREE.BoxGeometry(1, 1, 1), COL = new THREE.CylinderGeometry(0.45, 0.45, 1, 12, 1, true);
    const POLE = new THREE.CylinderGeometry(0.075, 0.12, 1, 8, 1, true);
    const WHEEL = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12).rotateX(Math.PI / 2);

    // each street, from (ax, az) to (bx, bz), at full height between s0 and s1 meters along it: P(s, lat, y) is a point
    // `lat` meters to its right (east on Halsted, south on Chicago); curb: half its roadway's width
    const street = (ax, az, bx, bz, s0, s1, curb) => {
      const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
      return { len, ux, uz, s0, s1, curb, gaps: { [-1]: [], [1]: [] },
        P: (s, lat, y) => V(ax + ux * s - uz * lat, y, az + uz * s + ux * lat),
        h: (s) => DECK * smooth((s - (s0 - RAMP)) / RAMP) * (1 - smooth((s - s1) / RAMP)),
        sOf: (x, z) => (x - ax) * ux + (z - az) * uz };
    };
    const H = street(HX, -3270, HX, -3990, 220, 420, 4.9);         // Halsted St, south to north: one lane south, two north
    // North of Chicago Ave, Halsted stays up: the viaduct runs on to the North Branch, the street crosses the river on its
    // bascule bridge (OSM way 24231504, bridge=movable, layer 1; its leaves down) at about the viaduct's height, and comes
    // down to grade on fill north of it. Measured on the Cook County 2022 LiDAR (ISGS DSM and DTM, spring 2022, before the
    // rebuild), above the rail level under the viaduct (180.0 m NAVD88): the deck 6.4 m up at the south bank, 6.0 m at
    // mid-span and 5.0 m at the north bank (the water 4.4 m below grade), and the road on the north bank on fill, back at
    // grade about 185 m north of the river. The film's viaduct is 8.4 m up (assumed; its 2022 deck read 6.6-6.9 m), so the
    // deck comes down 2 m over the 64 m before the river. bank: the river's banks along Halsted (city.water), as s; end:
    // the foot of the ramp
    H.bank = [484, 534]; H.end = 720;
    {
      const K = [[H.s1, DECK], [H.bank[0], 6.4], [(H.bank[0] + H.bank[1]) / 2, 6.0], [H.bank[1], 5.0], [H.end, 0]], h0 = H.h;
      H.h = (s) => {
        if (s <= K[0][0]) return h0(s);
        if (s >= H.end) return 0;
        let i = 1; while (s > K[i][0]) i++;
        return K[i - 1][1] + (K[i][1] - K[i - 1][1]) * (s - K[i - 1][0]) / (K[i][0] - K[i - 1][0]);
      };
    }
    const C = street(-2640, CZ, -2080, CZ, 220, 450, 6.0);         // Chicago Ave, west to east: a bus lane and a lane each way
    H.other = C; C.other = H;
    // a matrix on street st: at s along it, lat across it, y up; its x along the street, z across it
    const frame = (st, s, lat, y, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().makeBasis(V(st.ux, 0, st.uz), V(0, 1, 0), V(-st.uz, 0, st.ux)).setPosition(st.P(s, lat, y)).scale(V(sx, sy, sz));
    // a matrix at (x, y, z) facing (fx, fz)
    const facing = (x, y, z, fx, fz, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().makeBasis(V(fz, 0, -fx), V(0, 1, 0), V(fx, 0, fz)).setPosition(x, y, z).scale(V(sx, sy, sz));
    const boxS = (mat, st, s0, s1, l0, l1, y0, y1) => put(mat, BOX, frame(st, (s0 + s1) / 2, (l0 + l1) / 2, (y0 + y1) / 2, s1 - s0, y1 - y0, l1 - l0));
    // a bar from (l0, y0) to (l1, y1) across street st at s, t thick
    const seg = (mat, st, s, l0, y0, l1, y1, t) => put(mat, BOX, frame(st, s, (l0 + l1) / 2, (y0 + y1) / 2)
      .multiply(new THREE.Matrix4().makeRotationX(-Math.atan2(y1 - y0, l1 - l0))).scale(V(t, t, Math.hypot(l1 - l0, y1 - y0))));

    for (const st of [H, C]) {
      st.cc = st.sOf(HX, CZ);                                     // where the other crosses
      // Open beneath, spans on piers between an abutment at each end, wherever the deck is HMIN or more up (and over the
      // whole railway, from 3 m before either edge comes within 3 m of its corridor to 3 m after); below that, the
      // ramps are fill between retaining walls
      let lo = Infinity, hi = -Infinity;
      for (let s = st.s0; s <= st.s1; s += 0.5) for (const lat of [-HALF, 0, HALF]) {
        const q = st.P(s, lat, 0);
        if (NORTH.has(q.x, q.z, 3)) { lo = Math.min(lo, s); hi = Math.max(hi, s); }
      }
      let a = st.s0, b = st.s1;
      while (st.h(a - 0.5) >= HMIN) a -= 0.5;
      while (st.h(b + 0.5) >= HMIN && !(st.bank && b + 0.5 > st.bank[0])) b += 0.5;   // (Halsted's spans end at the river)
      st.lo = Math.min(lo - 3, st.cc - HALF, a); st.hi = Math.max(hi + 3, st.cc + HALF, b);
      st.on = st.s0 - RAMP; while (st.h(st.on) < 0.25) st.on += 0.5;      // where the parapets begin and end, on the ramps
      st.off = st.end ?? st.s1 + RAMP; while (st.h(st.off) < 0.25) st.off -= 0.5;
    }
    // the station's stairs come up through Halsted's east parapet onto its sidewalk (see openStation): gaps there
    for (const sg of [1, -1]) {
      const ss = [STAIR_IN, PLAT_OUT].map((lat) => { let d = CH.d; while (d < LENGTH - 5 && at(d, sg * lat).p.x > HX + HALF) d += 0.25; const p = at(d, sg * lat).p; return H.sOf(p.x, p.z); });
      H.gaps[1].push([Math.min(...ss) - 0.7, Math.max(...ss) + 0.7]);
    }
    for (const st of [H, C]) st.breaks = [st.lo, st.hi, st.on, st.off, ...[HALF, HALF - PAR_W, st.other.curb].flatMap((k) => [st.cc - k, st.cc + k]), ...st.gaps[1].flat(), ...(st.bank || [])];
    // sample points along a street: every 8 m on its ramps, and wherever something begins or ends
    const sampleS = (st, from, to) => {
      const v = [from, to, ...st.breaks];
      for (const [r0, r1] of [[st.s0 - RAMP, st.s0], [st.s1, st.end ?? st.s1 + RAMP]]) for (let s = r0; s <= r1 + 1e-6; s += 8) v.push(s);
      return [...new Set(v.filter((s) => s >= from && s <= to).map((s) => Math.round(s * 1000) / 1000))].sort((a, b) => a - b);
    };
    // a strip along street st over [from, to], from (latA, yA) to (latB, yB): each y meters above the deck, or a function
    // of s giving it outright; u along it, one per `tile` meters, and v from vA to vB across it (or the other way round: swap)
    const strip = (mat, st, [from, to], latA, yA, latB, yB, tile = 1, vA = 0, vB = 1, swap = false) => {
      if (to - from < 0.01) return;
      const ss = sampleS(st, from, to), Y = (y, s) => typeof y === "function" ? y(s) : st.h(s) + y, F = (v, s) => typeof v === "function" ? v(s) : v;
      const T = (u, v) => swap ? [v, u] : [u, v];
      for (let i = 1; i < ss.length; i++) {
        const a = ss[i - 1], b = ss[i];
        quad(mat, st.P(a, latA, Y(yA, a)), st.P(b, latA, Y(yA, b)), st.P(b, latB, Y(yB, b)), st.P(a, latB, Y(yB, a)),
          T(a / tile, F(vA, a)), T(b / tile, F(vA, b)), T(b / tile, F(vB, b)), T(a / tile, F(vB, a)));
      }
    };
    const minus = (ranges, [c0, c1]) => ranges.flatMap(([a, b]) => b <= c0 || a >= c1 ? [[a, b]] : [[a, Math.min(b, c0)], [Math.max(a, c1), b]].filter(([p, q]) => q - p > 0.01));

    /* the look: canvas textures, materials */
    const tex = (w, h, draw) => {
      const [cv, c] = hiCanvas(w, h); draw(c);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, ...o });
    // form-lined concrete for the abutments and the ramps' walls: a "fractured fin" liner, ribs every 15 cm (2.4 m a tile)
    const linerMat = std({ map: tex(256, 256, (c) => {
      c.fillStyle = "#bdbcb2"; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 16; i++) {
        const x = i * 16;
        c.fillStyle = `rgba(62, 62, 56, ${0.3 + 0.15 * hash(i)})`; c.fillRect(x, 0, 4, 256);                        // the groove
        for (let y = 0; y < 256; y += 8) {                                                                             // the rib's broken face
          c.fillStyle = `rgba(255, 255, 248, ${0.04 + 0.14 * hash(i * 31 + y)})`; c.fillRect(x + 5 + 3 * hash(i + y * 0.37), y, 7, 8);
          c.fillStyle = `rgba(60, 60, 55, ${0.1 * hash(i * 17 + y)})`; c.fillRect(x + 12, y, 3, 8);
        }
      }
      c.fillStyle = "rgba(55, 55, 50, 0.5)"; c.fillRect(0, 253, 256, 3);                                              // a lift joint every 2.4 m
    }) });
    // the deck's edge and the parapet: smooth concrete, a joint where the parapet sits on the deck, the drip line along
    // the slab's lower edge, a control joint every 6 m
    const bandMat = std({ map: tex(384, 72, (c) => {
      c.fillStyle = "#c9c8bf"; c.fillRect(0, 0, 384, 72);
      for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(90, 90, 80, ${0.06 * hash(i)})`; c.fillRect(hash(i + 0.3) * 384, hash(i + 0.6) * 72, 18, 4); }
      const y = (m) => 72 - (m / BAND) * 72;                       // meters up from the band's foot, on the canvas
      c.fillStyle = "rgba(45, 47, 45, 0.6)"; c.fillRect(0, y(SLAB) - 1, 384, 2);
      c.fillStyle = "rgba(25, 27, 25, 0.75)"; c.fillRect(0, y(0.05), 384, 3);
      c.fillStyle = "rgba(45, 47, 45, 0.5)"; c.fillRect(0, 0, 2, y(SLAB));
    }) });
    // the railing: 3 m panels of black steel pickets between a top and a bottom rail, a post at each end
    const railMat = std({ color: 0x23272a, roughness: 0.55, metalness: 0.35, alphaTest: 0.5, map: tex(512, 104, (c) => {
      c.clearRect(0, 0, 512, 104); c.fillStyle = "#fff";
      c.fillRect(0, 0, 512, 8); c.fillRect(0, 86, 512, 7); c.fillRect(0, 0, 12, 104);
      for (let x = 22; x < 512; x += 20) c.fillRect(x, 0, 4, 93);
    }) });
    // the fascia girders' webs: painted steel, a stiffener every 2 m (and the stiffeners themselves: fin, below)
    const fasciaMat = std({ roughness: 0.55, metalness: 0.25, map: tex(128, 68, (c) => {
      c.fillStyle = "#506069"; c.fillRect(0, 0, 128, 68);
      c.fillStyle = "rgba(0, 0, 0, 0.32)"; c.fillRect(0, 0, 128, 5); c.fillRect(0, 63, 128, 5);
      c.fillStyle = "rgba(255, 255, 255, 0.16)"; c.fillRect(59, 0, 4, 68);
      c.fillStyle = "rgba(0, 0, 0, 0.3)"; c.fillRect(63, 0, 6, 68);
    }) });
    const paint = std({ color: 0x506069, roughness: 0.55, metalness: 0.25 });           // painted steel (assumed): the fascia girders
    const paintDark = std({ color: 0x323b41, roughness: 0.7, metalness: 0.2, emissive: 0x323b41, emissiveIntensity: 0.35 });   // and in the shade under the deck, lit from the ground
    const concrete = std({ color: 0xbebdb3 }), soffit = std({ color: 0x8e908a, emissive: 0x8e908a, emissiveIntensity: 0.22 }), drip = std({ color: 0x2a2c2b });
    const bearingMat = std({ color: 0x2b2c2c, roughness: 0.8 });
    const PX = 20;                                                // road markings: canvas pixels a meter
    const asphalt = (c, w, h) => {
      c.fillStyle = "#4b4e51"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < w * h / 60; i++) { c.fillStyle = hash(i) < 0.5 ? "rgba(20, 20, 20, 0.12)" : "rgba(140, 140, 136, 0.1)"; c.fillRect(hash(i + 0.1) * w, hash(i + 0.2) * h, 3, 3); }
    };
    const yellow2 = (c, x, L) => { c.fillStyle = "#e0b43a"; c.fillRect(x - 4, 0, 2, L); c.fillRect(x + 2, 0, 2, L); };
    // Halsted: a 12 m tile across its roadway (x) and along it (y): the double yellow, and the dashes between the two lanes north
    const hRoad = std({ map: tex(H.curb * 2 * PX, 12 * PX, (c) => {
      const W = H.curb * 2 * PX, L = 12 * PX, x = (lat) => (lat + H.curb) * PX;
      asphalt(c, W, L); yellow2(c, x(-H.curb / 3), L);
      c.fillStyle = "#e8e8e2"; c.fillRect(x(H.curb / 3) - 1, 0, 3, 3 * PX);
    }) });
    // Chicago: red bus lanes at the curbs, marked CTA BUS ONLY (read from the bottom up by those driving in each), a lane each way
    const BUSL = 3.2;
    const cRoad = std({ map: tex(C.curb * 2 * PX, 48 * PX, (c) => {
      const W = C.curb * 2 * PX, L = 48 * PX, x = (lat) => (lat + C.curb) * PX;
      asphalt(c, W, L);
      c.fillStyle = "#a3282b"; c.fillRect(x(-C.curb), 0, BUSL * PX, L); c.fillRect(x(C.curb - BUSL), 0, BUSL * PX, L);
      c.fillStyle = "#e8e8e2"; c.fillRect(x(-C.curb + BUSL) - 1, 0, 3, L); c.fillRect(x(C.curb - BUSL) - 2, 0, 3, L);
      yellow2(c, x(0), L);
      const words = (cx, cy, flip) => {
        c.save(); c.translate(cx, cy); if (flip) c.rotate(Math.PI); c.scale(1, 2.6);
        c.fillStyle = "#efefe8"; c.font = "bold 16px Arial, Helvetica, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
        ["ONLY", "BUS", "CTA"].forEach((w, i) => c.fillText(w, 0, (i - 1) * 23)); c.restore();
      };
      // eastbound (the south lane) up the canvas, westbound down; each 25 m before the intersection (and every 48 m on)
      const yAt = (s) => L * (1 - (((s % 48) + 48) % 48) / 48);
      words(x(C.curb - BUSL / 2), yAt(C.cc - 25), false); words(x(-C.curb + BUSL / 2), yAt(C.cc + 25), true);
    }) });
    const plainRoad = std({ color: 0x4b4e51 }), white = std({ color: 0xe8e8e2 });
    const walkMat = std({ map: tex(48, 48, (c) => { c.fillStyle = "#bfbeb6"; c.fillRect(0, 0, 48, 48); c.fillStyle = "rgba(80, 80, 72, 0.45)"; c.fillRect(0, 0, 2, 48); }) });   // scored every 1.5 m
    const bikeMat = std({ map: tex(32, 32, (c) => { c.fillStyle = "#3f8a52"; c.fillRect(0, 0, 32, 32); c.fillStyle = "#e6e6df"; c.fillRect(0, 0, 32, 4); }) });   // green, a white line on the sidewalk's side
    const poleMat = std({ color: 0x9ba1a5, roughness: 0.5, metalness: 0.15 }), headMat = std({ color: 0x7a8085, roughness: 0.5, metalness: 0.15 });
    const signalMat = std({ color: 0x1b1d1f, roughness: 0.6 });

    /* the decks: roadway, curbs, sidewalks (and Halsted's bike lanes), the deck's edge, the parapet and its railing */
    for (const st of [H, C]) {
      const o = st.other, cc = st.cc, L = [[0, st.len]];
      const roadCut = [cc - o.curb, cc + o.curb], edgeCut = [cc - HALF, cc + HALF], inner = [cc - HALF + PAR_W, cc + HALF - PAR_W];
      const walkCut = st === H ? roadCut : inner, parCut = st === H ? inner : edgeCut;      // (Halsted's sidewalks and parapets run round the corners)
      for (const r of minus(L, roadCut)) strip(st === H ? hRoad : cRoad, st, r, -st.curb, 0.02, st.curb, 0.02, st === H ? 12 : 48, 0, 1, true);
      for (const sg of [-1, 1]) {
        for (const r of minus(L, roadCut)) strip(concrete, st, r, sg * st.curb, 0.02, sg * st.curb, CURB);
        for (const r of minus(L, walkCut)) {
          const w = st === H ? st.curb + BIKE : st.curb;
          if (st === H) strip(bikeMat, st, r, sg * st.curb, CURB, sg * w, CURB, 4);
          strip(walkMat, st, r, sg * w, CURB, sg * (HALF - PAR_W), CURB, 1.5);
        }
        for (const r of minus([[st.on, st.off]], edgeCut)) strip(bandMat, st, r, sg * HALF, -SLAB, sg * HALF, CURB, 6, 0, (SLAB + CURB) / BAND);
        let par = minus([[st.on, st.off]], parCut);
        for (const g of st.gaps[sg]) par = minus(par, g);
        for (const r of par) {
          strip(bandMat, st, r, sg * HALF, CURB, sg * HALF, CURB + PAR_H, 6, (SLAB + CURB) / BAND, 1);
          strip(concrete, st, r, sg * HALF, CURB + PAR_H, sg * (HALF - PAR_W), CURB + PAR_H);
          strip(concrete, st, r, sg * (HALF - PAR_W), CURB, sg * (HALF - PAR_W), CURB + PAR_H);
          strip(railMat, st, r, sg * (HALF - PAR_W / 2), CURB + PAR_H, sg * (HALF - PAR_W / 2), CURB + PAR_H + RAIL, 3);
          for (const s of r) if (Math.abs(Math.abs(s - cc) - HALF) > 0.01) quad(concrete, st.P(s, sg * HALF, st.h(s) + CURB), st.P(s, sg * (HALF - PAR_W), st.h(s) + CURB), st.P(s, sg * (HALF - PAR_W), st.h(s) + CURB + PAR_H), st.P(s, sg * HALF, st.h(s) + CURB + PAR_H));
        }
        // below the edge: the ramps' retaining walls, form-lined, down to the ground
        for (const r of [[st.on, st.lo], [st.bank ? st.bank[1] : st.hi, st.off]]) strip(linerMat, st, r, sg * HALF, () => -0.1, sg * HALF, -SLAB, 2.4, -0.1 / 2.4, (s) => (st.h(s) - SLAB) / 2.4);
      }
    }
    // the intersection: plain asphalt between the curbs, a crosswalk across each street beside it, and a stop line
    quad(plainRoad, V(HX - H.curb, DECK + 0.02, CZ - C.curb), V(HX + H.curb, DECK + 0.02, CZ - C.curb), V(HX + H.curb, DECK + 0.02, CZ + C.curb), V(HX - H.curb, DECK + 0.02, CZ + C.curb));
    for (const st of [H, C]) for (const k of [-1, 1]) {
      const s = st.cc + k * (st.other.curb + 1.8), y = st.h(s) + 0.04;
      for (let lat = -st.curb + 0.5; lat < st.curb - 0.3; lat += 1.2) quad(white, st.P(s - 1.5, lat, y), st.P(s + 1.5, lat, y), st.P(s + 1.5, lat + 0.6, y), st.P(s - 1.5, lat + 0.6, y));
      const sb = st.cc + k * (st.other.curb + 4.0), l0 = k < 0 ? 0.15 : -st.curb, l1 = k < 0 ? st.curb : -0.15;   // (traffic keeps right: it comes in on the right of the center line)
      quad(white, st.P(sb - 0.25, l0, y), st.P(sb + 0.25, l0, y), st.P(sb + 0.25, l1, y), st.P(sb - 0.25, l1, y));
    }

    /* the structure over the railway: girders and cross frames under a slab, abutments with bearings, open piers */
    const TRACKS = (d) => d < JOIN_D ? [-10.5, -OFF, OFF, 10.5] : [-14.5, -10.5, -OFF, OFF];   // ours, and the UP's others (see surfaceTracks)
    const posts = [];                                             // the overhead's frames' posts (see the overhead: every 30 m, TRENCH + 0.25 m out)
    for (let d = PORTAL2 + 12; d < LENGTH; d += 30) for (const sg of [-1, 1]) { const p = at(d, sg * (TRENCH + 0.25)).p; if (Math.hypot(p.x - HX, p.z - CZ) < 250) posts.push(p); }
    const COL_R = 0.45;
    const colFree = (x, z) => {                                   // may a column stand here? Not on a track, a platform or its stair, or by a post
      if (posts.some((p) => Math.hypot(p.x - x, p.z - z) < 1.6)) return false;
      const q = NORTH.has(x, z, 0);
      if (!q) return true;
      if (TRACKS(q.d).some((t) => Math.abs(q.lat - t) < 3.2)) return false;                  // its face 2.75 m or more from a track's center
      return !(q.d > CH.platFrom - 3 && q.d < CH.platTo + 3 && Math.abs(q.lat) > PLAT_IN - 0.5 - COL_R && Math.abs(q.lat) < PLAT_OUT + 0.6 + COL_R);
    };
    // a pier across street st at s: two or three columns as far apart as the railway lets them be (or one, with the cap
    // cantilevered both ways), and how good a pier that is
    const pierAt = (st, s) => {
      const ok = [];
      for (let e = -HALF + 0.9; e <= HALF - 0.9 + 1e-6; e += 0.25) { const q = st.P(s, e, 0); if (colFree(q.x, q.z)) ok.push(e); }
      if (!ok.length) return null;
      const a = ok[0], b = ok[ok.length - 1];
      if (b - a >= 4.5) {
        const m = ok.reduce((k, e) => Math.abs(e - (a + b) / 2) < Math.abs(k - (a + b) / 2) ? e : k, a), cols = m - a >= 4.5 && b - m >= 4.5 ? [a, m, b] : [a, b];
        return { score: 100 - 6 * Math.max(a + HALF, HALF - b) + cols.length, cols };
      }
      const e = ok.reduce((k, e) => Math.abs(e) < Math.abs(k) ? e : k);
      return { score: 40 - 6 * Math.abs(e), cols: [e] };
    };
    // Over the railway the piers run along it, not square to the streets (it crosses them on the skew): a line of columns
    // 14 m out from the line each side, just outside the four tracks, under a cap that carries the girders where they
    // cross it. Between the two lines, a clear span over all the tracks and the platforms
    const SKEW = 14;
    for (const st of [H, C]) {
      st.skew = [];
      for (const L of [-SKEW, SKEW]) {
        const cross = (e) => {                                    // where the line L m out crosses lat e of the street, as s
          let prev = null;
          for (let s = st.lo; s <= st.hi; s += 0.5) {
            const q = st.P(s, e, 0), r = NORTH.has(q.x, q.z, 8), l = r ? r.lat : null;
            if (l !== null && prev && Math.sign(l - L) !== Math.sign(prev[1] - L)) return prev[0] + (L - prev[1]) / (l - prev[1]) * (s - prev[0]);
            prev = l === null ? null : [s, l];
          }
          return null;
        };
        const e0 = -HALF + 0.35, e1 = HALF - 0.35, s0 = cross(e0), s1 = cross(e1);
        if (s0 === null || s1 === null || (st === C && Math.abs((s0 + s1) / 2 - st.cc) < HALF)) continue;   // (in the intersection it is Halsted's)
        st.skew.push({ e0, s0, e1, s1, at: (e) => s0 + (e - e0) / (e1 - e0) * (s1 - s0) });
      }
    }
    // the other piers, about 28 m apart and never more than 34 (none in the intersection, and Chicago Ave's spans end at
    // Halsted's girders): the cheapest chain of spans and piers from one support to the next
    const chain = (st, from, to) => {
      const cand = [{ s: from, cost: 0 }];
      for (let s = from + 12; s <= to - 12; s += 0.5) {
        if (Math.abs(s - st.cc) < HALF + 3) continue;
        const p = pierAt(st, s);
        if (p) cand.push({ s, p, cost: Infinity });
      }
      cand.push({ s: to, cost: Infinity });
      for (let i = 1; i < cand.length; i++) for (let j = i - 1; j >= 0 && cand[i].s - cand[j].s <= 45; j--) {
        const span = cand[i].s - cand[j].s;
        if (span < 12) continue;
        const c = cand[j].cost + 0.05 * (span - 28) ** 2 + (span > 34 ? 50 * (span - 34) : 0) + (cand[i].p ? 0.3 * (120 - cand[i].p.score) : 0);
        if (c < cand[i].cost) { cand[i].cost = c; cand[i].prev = cand[j]; }
      }
      const out = [];
      for (let k = cand[cand.length - 1].prev; k && k.p; k = k.prev) out.unshift({ s: k.s, ...k.p });
      return out;
    };
    for (const st of [H, C]) {
      const cc = st.cc, edgeCut = [cc - HALF, cc + HALF];
      // the girders: Halsted's run right through the intersection; Chicago's stop at Halsted's outer ones
      const runs = st === H ? [[st.lo, st.hi]] : [[st.lo, cc - 7.2], [cc + 7.2, st.hi]];
      st.piers = runs.flatMap(([a, b]) => {                      // (between the skewed piers too)
        const out = []; let from = a;
        for (const [p, q] of st.skew.map((k) => [Math.min(k.s0, k.s1), Math.max(k.s0, k.s1)]).filter(([p, q]) => q > a && p < b).sort((x, y) => x[0] - y[0])) { out.push(...chain(st, from, p)); from = q; }
        return [...out, ...chain(st, from, b)];
      });
      // and Halsted's bascule bridge, from the abutment at the south bank (its backwall) to the one at the north bank
      const spans = st.bank ? [...runs, [st.bank[0] + 0.9, st.bank[1]]] : runs;
      for (const [a, b] of spans) for (const e of GIRDERS) {
        const r = [a === st.lo ? a - 0.6 : a, b === st.hi || (st.bank && b === st.bank[1]) ? b + 0.6 : b], outer = Math.abs(e) > 7, sg = Math.sign(e);
        if (outer) {                                              // the fascia girder: its web's outer face painted and stiffened, its inner face in shade
          strip(fasciaMat, st, r, e + sg * 0.02, -DEPTH + 0.05, e + sg * 0.02, -SLAB - 0.04, 2);
          strip(paintDark, st, r, e - sg * 0.02, -DEPTH + 0.05, e - sg * 0.02, -SLAB - 0.04);
        } else strip(paintDark, st, r, e, -DEPTH + 0.05, e, -SLAB - 0.04);
        strip(outer ? paint : paintDark, st, r, e - 0.225, -DEPTH, e + 0.225, -DEPTH);          // the bottom flange
      }
      // the slab's underside, and the drip groove along each edge where it is open to the sky; the fascia's stiffeners
      strip(soffit, st, [st.lo - 0.9, st.hi + 0.9], -HALF, -SLAB, HALF, -SLAB);
      if (st.bank) strip(soffit, st, [st.bank[0] + 0.9, st.bank[1] + 0.9], -HALF, -SLAB, HALF, -SLAB);
      for (const sg of [-1, 1]) for (const r of minus(st.bank ? [[st.lo, st.hi], [st.bank[0] + 0.9, st.bank[1]]] : [[st.lo, st.hi]], edgeCut)) {
        strip(drip, st, r, sg * (HALF - 0.12), -SLAB - 0.005, sg * (HALF - 0.08), -SLAB - 0.005);
        for (let s = Math.ceil((r[0] - 1) / 2) * 2 + 1; s < r[1] - 0.3; s += 2) {             // (on the texture's lines)
          const h = st.h(s);
          quad(paint, st.P(s, sg * 7.22, h - DEPTH + 0.05), st.P(s, sg * 7.42, h - DEPTH + 0.05), st.P(s, sg * 7.42, h - SLAB - 0.04), st.P(s, sg * 7.22, h - SLAB - 0.04));
        }
      }
      // cross frames between the girders, an X and a bottom strut, at most 8 m apart between supports
      for (const [a, b] of spans) {
        const sup = [a, ...st.piers.map((p) => p.s).filter((s) => s > a && s < b), b];
        for (let k = 1; k < sup.length; k++) {
          const n = Math.ceil((sup[k] - sup[k - 1]) / 8);
          for (let j = 1; j < n; j++) {
            const s = sup[k - 1] + (j / n) * (sup[k] - sup[k - 1]), h = st.h(s), y0 = h - DEPTH + 0.12, y1 = h - SLAB - 0.15, w = 0.05;
            for (let g = 1; g < GIRDERS.length; g++) {
              if (st.skew.some((k) => Math.abs(s - k.at((GIRDERS[g - 1] + GIRDERS[g]) / 2)) < 1.6)) continue;   // (not into a skewed pier's cap)
              const l0 = GIRDERS[g - 1] + 0.05, l1 = GIRDERS[g] - 0.05, n2 = Math.hypot(l1 - l0, y1 - y0), ol = (y1 - y0) / n2 * w, oy = (l1 - l0) / n2 * w;
              quad(paintDark, st.P(s, l0 + ol, y1 + oy), st.P(s, l1 + ol, y0 + oy), st.P(s, l1 - ol, y0 - oy), st.P(s, l0 - ol, y1 - oy));   // the X
              quad(paintDark, st.P(s, l0 - ol, y0 + oy), st.P(s, l1 - ol, y1 + oy), st.P(s, l1 + ol, y1 - oy), st.P(s, l0 + ol, y0 - oy));
              quad(paintDark, st.P(s - w, l0, y0), st.P(s - w, l1, y0), st.P(s + w, l1, y0), st.P(s + w, l0, y0));
            }
          }
        }
      }
      // the abutments, where the fill ends: a form-lined wall up to the bridge seat, the seat, and the backwall behind it up
      // to the deck; a bearing under each girder's end
      for (const [sa, dir] of [[st.lo, 1], [st.hi, -1], ...(st.bank ? [[st.bank[1], -1]] : [])]) {
        const h = st.h(sa), seat = h - DEPTH - 0.12;
        const wall = (s, y0, y1) => quad(linerMat, st.P(s, -HALF, y0), st.P(s, HALF, y0), st.P(s, HALF, y1), st.P(s, -HALF, y1), [-HALF / 2.4, y0 / 2.4], [HALF / 2.4, y0 / 2.4], [HALF / 2.4, y1 / 2.4], [-HALF / 2.4, y1 / 2.4]);
        wall(sa, -0.1, seat); wall(sa - dir * 0.9, seat, h - SLAB);
        quad(concrete, st.P(sa, -HALF, seat), st.P(sa, HALF, seat), st.P(sa - dir * 0.9, HALF, seat), st.P(sa - dir * 0.9, -HALF, seat));
        for (const e of GIRDERS) boxS(bearingMat, st, sa - dir * 0.3 - 0.22, sa - dir * 0.3 + 0.22, e - 0.26, e + 0.26, seat, seat + 0.12);
      }
      // the piers: a cap as deep as the girders (so nothing hangs lower over the tracks), on round columns
      for (const k of st.skew) {
        const a = st.P(k.at(GIRDERS[0]), GIRDERS[0], 0), b = st.P(k.at(GIRDERS[6]), GIRDERS[6], 0), len = a.distanceTo(b), n = Math.ceil(len / 7), h = st.h((k.s0 + k.s1) / 2);
        const m = a.clone().lerp(b, 0.5), dx = (b.x - a.x) / len, dz = (b.z - a.z) / len;      // (from one fascia girder to the other)
        put(concrete, BOX, facing(m.x, (h - DEPTH - 0.05 + h - SLAB) / 2, m.z, dx, dz, 1.4, DEPTH - SLAB + 0.05, len));
        for (let i = 0; i < n; i++) {
          const c = a.clone().lerp(b, (i + 0.5) / n);
          if (colFree(c.x, c.z)) put(concrete, COL, facing(c.x, (h - DEPTH - 0.05 - 0.3) / 2, c.z, 1, 0, 1, h - DEPTH - 0.05 + 0.3, 1));
        }
      }
      for (const p of st.piers) {
        const h = st.h(p.s);
        boxS(concrete, st, p.s - 0.7, p.s + 0.7, -HALF + 0.35, HALF - 0.35, h - DEPTH - 0.05, h - SLAB);
        for (const e of p.cols) put(concrete, COL, frame(st, p.s, e, (h - DEPTH - 0.05 - 0.3) / 2, 1, h - DEPTH - 0.05 + 0.3, 1));
      }
    }

    /* on the decks: street lights, the intersection's signals, CTA's bus stops, and a bus */
    // Chicago's standard: a gray steel pole, its arm reaching out over the road to an LED cobra head 9.1 m up, about every
    // 30 m along each side (staggered); not by the corners, where the signals are, nor in front of the stairs
    const LIGHT = 9.1, ARM = 2.4;
    for (const st of [H, C]) for (const sg of [-1, 1]) for (let s = st.on + 6 + (sg > 0 ? 15 : 0); s < st.off - 4; s += 30) {
      if (Math.abs(s - st.cc) < HALF + 9 || st.gaps[sg].some(([a, b]) => s > a - 2 && s < b + 2)) continue;
      const lat = sg * (HALF - PAR_W - 0.3), y0 = st.h(s) + CURB;
      put(poleMat, BOX, frame(st, s, lat, y0 + 0.3, 0.36, 0.6, 0.36));
      put(poleMat, POLE, frame(st, s, lat, y0 + (LIGHT + 0.6) / 2, 1, LIGHT - 0.6, 1));
      seg(poleMat, st, s, lat, y0 + LIGHT - 0.35, lat - sg * ARM, y0 + LIGHT + 0.2, 0.09);
      put(headMat, BOX, frame(st, s, lat - sg * (ARM + 0.3), y0 + LIGHT + 0.14, 0.34, 0.14, 0.8));
    }
    // the signals (galvanized poles and mast arms; black heads on yellow-bordered backplates, all assumed): a pole at each
    // corner, its mast arm out over the far side of one approach. Halsted has the green; Chicago waits at red
    const headTex = (lit) => tex(64, 160, (c) => {
      c.fillStyle = "#f0c000"; c.fillRect(0, 0, 64, 160);
      c.fillStyle = "#16181a"; c.fillRect(5, 5, 54, 150);
      ["#ff3b2f", "#ffb000", "#3dffa0"].forEach((col, i) => { c.fillStyle = i === lit ? col : "#2c2f31"; c.beginPath(); c.arc(32, 31 + i * 49, 19, 0, Math.PI * 2); c.fill(); });
    });
    const greenHead = new THREE.MeshBasicMaterial({ map: headTex(2) }), redHead = new THREE.MeshBasicMaterial({ map: headTex(0) });
    const pedTex = (walk) => tex(48, 48, (c) => {
      c.fillStyle = "#16181a"; c.fillRect(0, 0, 48, 48); c.fillStyle = walk ? "#f4f4ee" : "#ff8a1e";
      if (walk) { c.beginPath(); c.arc(24, 10, 4, 0, 7); c.fill(); c.fillRect(21, 15, 6, 15); c.fillRect(17, 29, 4, 14); c.fillRect(27, 29, 4, 14); }
      else { c.fillRect(17, 16, 14, 18); for (let k = 0; k < 4; k++) c.fillRect(17 + k * 3.6, 6, 2.6, 12); c.fillRect(31, 22, 6, 4); }
    });
    const walkHead = new THREE.MeshBasicMaterial({ map: pedTex(true) }), handHead = new THREE.MeshBasicMaterial({ map: pedTex(false) });
    const face = (mat, m, w, h) => quad(mat, V(-w / 2, -h / 2, 0).applyMatrix4(m), V(w / 2, -h / 2, 0).applyMatrix4(m), V(w / 2, h / 2, 0).applyMatrix4(m), V(-w / 2, h / 2, 0).applyMatrix4(m));
    const CORNER = 6.9, base = DECK + CURB;                        // the poles stand back on the corners' sidewalks
    for (const [sx, sz, ax, az, lit] of [[1, -1, -1, 0, greenHead], [-1, 1, 1, 0, greenHead], [-1, -1, 0, 1, redHead], [1, 1, 0, -1, redHead]]) {
      const px = HX + sx * CORNER, pz = CZ + sz * CORNER, fx = ax ? 0 : -sx, fz = ax ? -sz : 0;   // the arm along (ax, az); its heads face back across the intersection
      put(poleMat, POLE, facing(px, base + 3, pz, 1, 0, 1.6, 6, 1.6));
      put(poleMat, BOX, facing(px, base + 0.25, pz, 1, 0, 0.5, 0.5, 0.5));
      const ARM2 = 6.2, ya = base + 5.75;
      put(poleMat, BOX, facing(px + ax * ARM2 / 2, ya, pz + az * ARM2 / 2, ax || 0.0001, az, 0.14, 0.14, ARM2));
      for (const k of [2.4, 5.2]) {                               // two heads over the approach's lanes
        const hx = px + ax * k, hz = pz + az * k, m = facing(hx, ya - 0.75, hz, fx, fz);
        put(signalMat, BOX, facing(hx, ya - 0.75, hz, fx, fz, 0.36, 1.05, 0.26));
        face(lit, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.135)), 0.58, 1.3);
      }
      // a pedestrian head on the pole for each crosswalk at this corner: walk across Chicago (with Halsted's green), not across Halsted
      for (const [dx, dz, mat] of [[-sx, 0, handHead], [0, -sz, walkHead]]) {   // (each faces those waiting on the far side)
        const m = facing(px + dx * 0.25, base + 2.7, pz + dz * 0.25, dx || 0.0001, dz);
        put(signalMat, BOX, m.clone().scale(V(0.42, 0.42, 0.24)));
        face(mat, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.125)), 0.36, 0.36);
      }
    }
    // CTA's bus stops (CTA's positions, each moved onto the sidewalk on its side of the film's narrower street): a sign
    // on a pole, facing the buses coming in (the sign's design simplified)
    const stopTex = (route, name, dir) => tex(120, 180, (c) => {
      c.fillStyle = "#ffffff"; c.fillRect(0, 0, 120, 180);
      c.fillStyle = "#0b5aa6"; c.fillRect(0, 0, 120, 46);
      c.textAlign = "center"; c.fillStyle = "#ffffff"; c.font = "bold 24px Arial, Helvetica, sans-serif"; c.fillText("CTA", 60, 24);
      c.font = "bold 13px Arial, Helvetica, sans-serif"; c.fillText("BUS STOP", 60, 40);
      c.fillStyle = "#111"; c.fillRect(14, 54, 92, 64); c.fillStyle = "#fff"; c.font = "bold 52px Arial, Helvetica, sans-serif"; c.fillText(route, 60, 106);
      c.fillStyle = "#111"; c.font = "bold 19px Arial, Helvetica, sans-serif"; c.fillText(name, 60, 144);
      c.font = "14px Arial, Helvetica, sans-serif"; c.fillText(dir, 60, 166);
      c.strokeStyle = "#9a9a9a"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 117, 177);
    });
    const STOPS = [[-87.647606, 41.896724, H, 1, "8", "Halsted", "Northbound"], [-87.647853, 41.896104, H, -1, "8", "Halsted", "Southbound"],
      [-87.647269, 41.896297, C, 1, "66", "Chicago", "Eastbound"], [-87.648183, 41.896518, C, -1, "66", "Chicago", "Westbound"]];
    for (const [lon, lat0, st, sg, route, name, dir] of STOPS) {
      const q = lonLat(lon, lat0), s = st.sOf(q.x, q.z), lat = sg * (st === H ? st.curb + BIKE + 0.3 : st.curb + 0.35), y = st.h(s) + CURB;
      st.stop = st.stop || {}; st.stop[sg] = s;
      put(poleMat, BOX, frame(st, s, lat, y + 1.45, 0.06, 2.9, 0.06));
      const mat = new THREE.MeshStandardMaterial({ map: stopTex(route, name, dir), roughness: 0.6 });
      for (const k of [-1, 1]) {                                  // both faces, each the right way round: toward the buses coming in (-sg along), and away
        const ds = -sg * k * 0.012, w = 0.225 * sg * k;
        quad(mat, st.P(s + ds, lat - w, y + 2.15), st.P(s + ds, lat + w, y + 2.15), st.P(s + ds, lat + w, y + 2.83), st.P(s + ds, lat - w, y + 2.83));
      }
    }
    // a bus waiting at the #8's northbound stop: a generic 40-foot low-floor bus in CTA's white, its blue and red stripe, "8 Halsted" on its signs
    {
      const BL = 12.2, BW = 2.59, B0 = 0.3, B1 = 3.2;             // length, width, body from 0.3 to 3.2 m above the road
      const busTex = tex(1024, 512, (c) => {
        const side = (x0, frontRight, doors) => {                 // 512 x 256 at the top: m meters from the rear, at y meters up
          const X = (m) => x0 + (frontRight ? m : BL - m) / BL * 512, Y = (y) => 256 - (y - B0) / (B1 - B0) * 256;
          const rect = (m0, m1, y0, y1, col) => { c.fillStyle = col; const a = X(m0), b = X(m1); c.fillRect(Math.min(a, b), Y(y1), Math.abs(b - a), Y(y0) - Y(y1)); };
          rect(0, BL, B0, B1, "#f3f4f1"); rect(0, BL, 3.02, B1, "#d4d7d8");
          rect(0.4, BL - 0.15, 1.3, 2.72, "#1f2a31");
          for (let m = 1.6; m < BL - 1; m += 1.45) rect(m, m + 0.07, 1.3, 2.72, "#e9ebe8");     // window pillars
          rect(0, BL, 0.5, 0.8, "#0b5ca8"); rect(0, BL, 0.84, 0.92, "#c8212f");
          if (doors) for (const [m0, m1] of [[BL - 1.85, BL - 0.65], [4.5, 5.7]]) { rect(m0, m1, 0.36, 2.78, "#cfd3d4"); rect(m0 + 0.06, m1 - 0.06, 0.42, 2.72, "#25313a"); rect((m0 + m1) / 2 - 0.02, (m0 + m1) / 2 + 0.02, 0.42, 2.72, "#cfd3d4"); }
          c.fillStyle = "#151617";
          for (const m of [BL - 2.25, BL - 9.25]) { c.beginPath(); c.ellipse(X(m), 256, 0.66 / BL * 512, 0.7 / (B1 - B0) * 256, 0, Math.PI, 0); c.fill(); }
          c.fillStyle = "#0b5ca8"; c.font = "bold 26px Arial, Helvetica, sans-serif"; c.textAlign = "center"; c.fillText("CTA", X(BL * 0.42), Y(1.08));
        };
        side(0, true, true); side(512, false, false);             // its right (curb) side with the doors, and its left
        const end = (x0, front) => {                              // 256 x 256 below: x across its width, y up
          const X = (w) => x0 + w / BW * 256, Y = (y) => 512 - (y - B0) / (B1 - B0) * 256, rect = (w0, w1, y0, y1, col) => { c.fillStyle = col; c.fillRect(X(w0), Y(y1), X(w1) - X(w0), Y(y0) - Y(y1)); };
          rect(0, BW, B0, B1, "#f3f4f1"); rect(0, BW, 0.5, 0.8, "#0b5ca8"); rect(0, BW, B0, 0.46, "#2b2e30");
          if (front) {
            rect(0.08, BW - 0.08, 1.05, 2.45, "#1c262d"); rect(0.2, BW - 0.2, 2.55, 2.95, "#0d0d0d");
            c.fillStyle = "#ffb21e"; c.font = "bold 30px Arial, Helvetica, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("8  Halsted", X(BW / 2), Y(2.75));
            for (const w of [0.18, BW - 0.48]) rect(w, w + 0.3, 0.62, 0.78, "#f6f2dc");
          } else {
            rect(0.35, BW - 0.35, 1.1, 2.0, "#9ea4a6"); rect(BW / 2 - 0.35, BW / 2 + 0.35, 2.55, 2.95, "#0d0d0d");
            c.fillStyle = "#ffb21e"; c.font = "bold 30px Arial, Helvetica, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("8", X(BW / 2), Y(2.75));
            for (const w of [0.1, BW - 0.3]) rect(w, w + 0.2, 0.95, 1.6, "#b3191c");
          }
        };
        end(0, true); end(256, false);
        c.fillStyle = "#d9dcdc"; c.fillRect(512, 256, 512, 256); c.fillStyle = "#b9bdbe"; c.fillRect(560, 300, 160, 168);     // the roof, and its air conditioning
      });
      const busMat = std({ map: busTex, roughness: 0.5 }), dark = std({ color: 0x161718 }), roofMat = std({ color: 0xc4c8c9, roughness: 0.6 });
      busTex.wrapS = busTex.wrapT = THREE.ClampToEdgeWrapping;
      const s = H.stop[1] + 1.0 - BL / 2, lat = H.curb * 2 / 3, y = H.h(s) + 0.02;   // in the middle of the curb lane, its front door at the sign
      const M = frame(H, s, lat, y), P = (x, yy, z) => V(x, yy, z).applyMatrix4(M);
      const uv = (px, py) => [px / 1024, 1 - py / 512];
      const r4 = (a, b, c2, d, x0, y0, x1, y1) => quad(busMat, a, b, c2, d, uv(x0, y1), uv(x1, y1), uv(x1, y0), uv(x0, y0));   // corners as seen from outside: bottom left first
      const x = BL / 2, z = BW / 2;
      r4(P(-x, B0, z), P(x, B0, z), P(x, B1, z), P(-x, B1, z), 0, 0, 512, 256);           // right side
      r4(P(x, B0, -z), P(-x, B0, -z), P(-x, B1, -z), P(x, B1, -z), 512, 0, 1024, 256);    // left side
      r4(P(x, B0, z), P(x, B0, -z), P(x, B1, -z), P(x, B1, z), 0, 256, 256, 512);         // front
      r4(P(-x, B0, -z), P(-x, B0, z), P(-x, B1, z), P(-x, B1, -z), 256, 256, 512, 512);   // rear
      r4(P(-x, B1, z), P(x, B1, z), P(x, B1, -z), P(-x, B1, -z), 512, 256, 1024, 512);    // roof
      quad(dark, P(-x, B0, z), P(x, B0, z), P(x, B0, -z), P(-x, B0, -z));
      for (const ax of [x - 2.25, x - 9.25]) for (const k of [-1, 1]) put(dark, WHEEL, M.clone().multiply(new THREE.Matrix4().makeTranslation(ax, 0.5, k * (z - 0.2))));
      put(roofMat, BOX, M.clone().multiply(new THREE.Matrix4().makeTranslation(-x + 2.6, B1 + 0.18, 0)).scale(V(3.6, 0.36, 2.0)));
    }

    for (const [mat, B] of batches) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(B.p, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(B.uv, 2));
      g.computeVertexNormals();
      scene.add(new THREE.Mesh(g, mat));
    }

    // and on across the North Branch: the Chicago Ave bridge, at street level from the foot of the viaduct's ramp
    // to where the avenue picks up again on the east bank (its bascule leaves are assumed down, its girders 1.6 m deep)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xa9aaa2, roughness: 0.95, side: THREE.DoubleSide });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x45484b, roughness: 1, side: THREE.DoubleSide });
    const underMat = new THREE.MeshStandardMaterial({ color: 0x5b5d59, roughness: 1, side: THREE.DoubleSide });
    {
      const ax = -2084, az = CZ, bx = -1972, bz = -3610, len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, n = Math.ceil(len / 4);
      const P = (i, lat, y) => { const s2 = (i / n) * len; return new THREE.Vector3(ax + ux * s2 - uz * lat, y, az + uz * s2 + ux * lat); };
      ribbon((i) => [P(i, -VIA_HALF, 0.03), P(i, VIA_HALF, 0.03)], n, roadMat);
      ribbon((i) => [P(i, -VIA_HALF, -1.6), P(i, VIA_HALF, -1.6)], n, underMat);
      for (const lat of [-VIA_HALF, VIA_HALF]) {
        ribbon((i) => [P(i, lat, -1.6), P(i, lat, 0.03)], n, wallMat);                               // the girders' faces
        ribbon((i) => [P(i, lat * 0.97, 0.03), P(i, lat * 0.97, 1.15)], n, new THREE.MeshStandardMaterial({ color: 0x3f5560, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));   // open steel railings
      }
    }
  }

  /* ---- the ramps' retaining walls and the two portals ---- */
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa3a69f, roughness: 0.95, side: THREE.DoubleSide });
  for (const [d0, d1] of [TRENCH1, TRENCH2]) for (const side of [-TRENCH, TRENCH]) {
    const n = Math.ceil((d1 - d0) / 3);
    ribbon((i) => {
      const lo = at(d0 + (i / n) * (d1 - d0), side, -0.15).p, hi = lo.clone(); hi.y = 1.0;   // rises to a parapet above the ground
      return [lo, hi];
    }, n, concrete);
  }
  // A wall across the line with the bore cut out of it, facing along the track.
  const boreWall = (d, halfW, bottom, top, mat, clipWorldY = null) => {
    const s = new THREE.Shape([V2(-halfW, bottom), V2(halfW, bottom), V2(halfW, top), V2(-halfW, top)]);
    const hole = new THREE.Path(); hole.absarc(0, CY, R - 0.04, 0, Math.PI * 2, true); s.holes.push(hole);
    const q = at(d);
    const g = new THREE.ShapeGeometry(s, 48);
    if (clipWorldY !== null) {
      const p = g.attributes.position, lim = clipWorldY - q.p.y;
      for (let i = 0; i < p.count; i++) if (p.getY(i) > lim) p.setY(i, lim);
    }
    const m = new THREE.Mesh(g, mat);
    m.position.copy(q.p); m.lookAt(q.p.clone().add(q.tan)); scene.add(m);
  };
  for (const [d, out1] of [[PORTAL, -0.1], [PORTAL2, 0.1]]) {
    boreWall(d, TRENCH, -1.3, 40, concrete, 1.0);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R + 0.12, 0.26, 8, 56),
      new THREE.MeshStandardMaterial({ color: 0x4b4f4d, roughness: 0.9 }));
    const c = at(d + out1, 0, CY); lip.position.copy(c.p); lip.lookAt(c.p.clone().add(c.tan)); scene.add(lip);
  }

  /* ---- the bore, in lengths between the portals and the station boxes ---- */
  const bore = (d0, d1) => {
    const span = d1 - d0, TUB = Math.ceil(span / 1.3), RAD = 36;
    const curve = subCurve(d0, d1, 0, CY);
    const g = new THREE.TubeGeometry(curve, TUB, R, RAD, false);
    const colors = new Float32Array(g.attributes.position.count * 3);
    const pools = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i <= TUB; i++) {
      const d = d0 + (i / TUB) * span;
      const near = Math.abs(((d + LIGHT_EVERY / 2) % LIGHT_EVERY) - LIGHT_EVERY / 2);
      const pool = Math.exp(-(near * near) / 6);
      const spill = Math.exp(-(d - PORTAL) / 16) + Math.exp(-(PORTAL2 - d) / 16);   // daylight reaches a little way in at each end
      for (let j = 0; j <= RAD; j++) {
        const k = (i * (RAD + 1) + j) * 3;
        const ang = (j / RAD) * Math.PI * 2;
        // lamps on both walls, each lighting its own side
        const side = Math.pow(Math.max(0, Math.cos(ang - 2.85)), 2) + Math.pow(Math.max(0, Math.cos(ang - 0.3)), 2);
        const v = 0.2 + 0.7 * pool * side + 0.9 * spill;
        colors[k] = v; colors[k + 1] = v * 0.93; colors[k + 2] = v * 0.82;
        pools[k] = v - 0.2; pools[k + 1] = (v - 0.2) * 0.93; pools[k + 2] = (v - 0.2) * 0.82;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
      color: 0x8f9698, roughness: 0.92, metalness: 0, side: THREE.BackSide, vertexColors: true })));
    // the lamp pools glow on their own, so add them again as an unlit, additive shell
    const shell = new THREE.TubeGeometry(curve, TUB, R - 0.02, RAD, false);
    shell.setAttribute("color", new THREE.BufferAttribute(pools, 3));
    scene.add(new THREE.Mesh(shell, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide,
      transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })));
    const nRibs = Math.floor((span - 4) / RIB_EVERY);
    const ribs = new THREE.InstancedMesh(new THREE.TorusGeometry(R - 0.06, 0.1, 6, 56),
      new THREE.MeshStandardMaterial({ color: 0x454b4e, roughness: 0.9 }), nRibs);
    for (let i = 0; i < nRibs; i++) place(ribs, i, d0 + 3 + i * RIB_EVERY, 0, CY);
    scene.add(ribs);
    const first = Math.ceil(d0 / LIGHT_EVERY) * LIGHT_EVERY, nL = Math.max(0, Math.floor((d1 - first) / LIGHT_EVERY));
    const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.24, 1.1),
      new THREE.MeshBasicMaterial({ color: 0xfff1d6 }), nL * 2);
    for (let i = 0; i < nL; i++) {
      place(lamps, i * 2, first + i * LIGHT_EVERY, -(R - 0.42), CY + 1.55);
      place(lamps, i * 2 + 1, first + i * LIGHT_EVERY, R - 0.42, CY + 1.55);
    }
    scene.add(lamps);
  };
  {
    let from = PORTAL;
    for (const S of STN) { bore(from, S.boxFrom); from = S.boxTo; }
    bore(from, PORTAL2);
  }

  // A sign readable from both sides: two planes back to back (one plane drawn double-sided shows its text mirrored from
  // behind). `back` is the texture on the far side, where it differs: an exit sign's arrow points the other way there.
  const twoSided = (tex, w, h, back = tex) => {
    const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h), far = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: back }));
    far.rotation.y = Math.PI;
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })), far);
    return g;
  };
  /* ---- stations: a box with a platform each side, signs, and an exit ---- */
  const fitFont = (c, text, maxW, size, weightAndFamily) => {     // largest font up to `size` that fits maxW
    do { c.font = weightAndFamily.replace("%", size); size -= 4; } while (c.measureText(text).width > maxW && size > 20);
  };
  const textTexture = (w, h, draw) => {
    const [cv, c] = hiCanvas(w, h);
    draw(c);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  };
  // self-lit surfaces: a station is bright whatever the headlights are doing
  const lit = (color, glow = 0.5) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide,
    emissive: color, emissiveIntensity: glow });
  const tile = lit(0xdfe4e3), floorMat = lit(0xb9bfc0, 0.42), ceilMat = lit(0x8f979a, 0.3), darkMat = lit(0x2b3033, 0.3), stepMat = lit(0x9aa1a3, 0.45);
  const yellow = new THREE.MeshBasicMaterial({ color: 0xf4c400, side: THREE.DoubleSide });
  const teal = new THREE.MeshBasicMaterial({ color: 0x15a3bb, side: THREE.DoubleSide });
  const glass = new THREE.MeshBasicMaterial({ color: 0xbfe3ea, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
  const handrail = new THREE.MeshBasicMaterial({ color: 0x59636a, side: THREE.DoubleSide });
  const daylight = new THREE.MeshBasicMaterial({ color: 0xfdfaf0, side: THREE.DoubleSide });
  const fitting = new THREE.MeshBasicMaterial({ color: 0xfffaf0 });

  /* ---- a hall (see HALLS): galleries and the bridge between them, the vault with its ribs and lights, and a
          glazed screen, lit from behind, at each end above the tunnel mouth ---- */
  const white = lit(0xeef0ee, 0.55);
  const repeatTex = (w, h, draw, rx, ry) => { const t = textTexture(w, h, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  // the vault's panels: aluminium slats, 3.2 m along by 1/22 of the way across, with dark joints
  const vaultMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, map: repeatTex(256, 256, (c) => {
    c.fillStyle = "#c9cdcc"; c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#b1b6b5"; for (let y = 0; y < 256; y += 16) c.fillRect(0, y, 256, 5);
    c.fillStyle = "#7d8486"; c.fillRect(0, 0, 256, 6); c.fillRect(0, 0, 6, 256);
  }, 1 / 3.2, 22) });
  // shopfronts and ticket windows along the back of each gallery, 6 m to a bay
  const shopMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: repeatTex(512, 384, (c) => {
    c.fillStyle = "#3b4246"; c.fillRect(0, 0, 512, 384);
    c.fillStyle = "#15a3bb"; c.fillRect(0, 70, 512, 34);
    const g = c.createLinearGradient(0, 120, 0, 384); g.addColorStop(0, "#fff3dc"); g.addColorStop(1, "#e8d2b0");
    c.fillStyle = g; for (const x of [16, 180, 344]) c.fillRect(x, 120, 152, 264);
  }, 1 / 6, 1) });
  const starCore = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const starGlow = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    map: textTexture(128, 128, (c) => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,250,235,0.9)"); g.addColorStop(0.25, "rgba(255,245,225,0.35)"); g.addColorStop(1, "rgba(255,245,225,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); }) });
  // A surface over the alignment from d0 to d1, every `step` metres: pt(d, v) -> [side, up] for v from 0 to 1 in nv steps.
  // Its uv: metres along, and v; its vertex colours (if `shade`): shade(d, v).
  const surface = (d0, d1, step, nv, pt, mat, shade = null) => {
    const nd = Math.max(1, Math.ceil((d1 - d0) / step)), pos = [], uv = [], col = [], idx = [];
    for (let i = 0; i <= nd; i++) {
      const d = d0 + (i / nd) * (d1 - d0);
      for (let j = 0; j <= nv; j++) {
        const v = j / nv, [side, up] = pt(d, v), p = at(d, side, up).p;
        pos.push(p.x, p.y, p.z); uv.push(d - d0, v);
        if (shade) { const k = shade(d, v); col.push(k, k * 0.985, k * 0.96); }
        if (i < nd && j < nv) { const k = i * (nv + 1) + j; idx.push(k, k + nv + 1, k + 1, k + 1, k + nv + 1, k + nv + 2); }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    if (shade) g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, mat));
  };
  const tube = (pts, r, mat) => scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, r, 8, false), mat));
  const ribMat = new THREE.MeshBasicMaterial({ color: 0xf2f4f3 }), latticeMat = new THREE.MeshBasicMaterial({ color: 0xb4babb });
  function hall(S) {
    const F = S.boxFrom, T = S.boxTo, L0 = S.stop + 17 + S.stairRun, [B0, B1] = S.bridge;
    // the galleries: a floor out to the shopfronts, a white edge beam, and a glass balustrade, open where the stairs
    // come up and where the bridge leaves
    const spans = [[F, L0], [L0 + 1.5, B0], [B1, T]];
    for (const sg of [-1, 1]) {
      along(F, T, sg * PLAT_OUT, GAL, sg * HALL, GAL, floorMat);
      along(F, T, sg * (PLAT_OUT - 0.04), GAL - 0.7, sg * (PLAT_OUT - 0.04), GAL + 0.02, white);
      for (const [a, b] of spans) {
        along(a, b, sg * (PLAT_OUT + 0.15), GAL, sg * (PLAT_OUT + 0.15), GAL + 1.1, glass);
        along(a, b, sg * (PLAT_OUT + 0.15), GAL + 1.06, sg * (PLAT_OUT + 0.15), GAL + 1.16, handrail);
      }
      surface(F, T, 3, 1, (d, v) => [sg * HALL, GAL + v * (SPRING - GAL)], shopMat);
    }
    // the bridge over the tracks: deck, white soffit and faces, glass balustrades
    along(B0, B1, -PLAT_OUT, GAL, PLAT_OUT, GAL, floorMat);
    along(B0, B1, -PLAT_OUT, GAL - 0.8, PLAT_OUT, GAL - 0.8, white);
    for (const d of [B0, B1]) {
      ribbon((i) => [at(d, (i * 2 - 1) * PLAT_OUT, GAL - 0.8).p, at(d, (i * 2 - 1) * PLAT_OUT, GAL + 0.02).p], 1, white);
      ribbon((i) => [at(d, (i * 2 - 1) * PLAT_OUT, GAL).p, at(d, (i * 2 - 1) * PLAT_OUT, GAL + 1.1).p], 1, glass);
      ribbon((i) => [at(d, (i * 2 - 1) * PLAT_OUT, GAL + 1.06).p, at(d, (i * 2 - 1) * PLAT_OUT, GAL + 1.16).p], 1, handrail);
    }
    // the vault, brighter toward the crown and darker in the sag between ribs
    const NV = 48, vx = (v) => (v * 2 - 1) * HALL;
    surface(F, T, 1, NV, (d, v) => [vx(v), vaultY(S, vx(v), d)], vaultMat, (d, v) => {
      const a = Math.abs(v * 2 - 1), s = Math.sin(Math.PI * (d - F) / S.bay);
      return 0.5 + 0.26 * (1 - a) - 0.14 * s * s;
    });
    // a white arch rib at each end of every bay, down the back wall to the gallery floor, and between them a
    // lattice of thinner ribs from the springing to the crown
    const bays = Math.round((T - F) / S.bay);
    for (let k = 0; k <= bays; k++) {
      const d = F + k * S.bay, pts = [at(d, -(HALL - 0.35), GAL).p];
      for (let i = 0; i <= 40; i++) { const x = -(HALL - 0.35) + (i / 40) * 2 * (HALL - 0.35); pts.push(at(d, x, vaultY(S, x, d) - 0.3).p); }
      pts.push(at(d, HALL - 0.35, GAL).p);
      tube(pts, 0.42, ribMat);
      if (k === bays) break;
      for (const sg of [-1, 1]) for (const end of [0, 1]) {
        const lat = [];
        for (let i = 0; i <= 16; i++) {
          const t = i / 16, dd = d + (end ? S.bay * (1 - t / 2) : S.bay * t / 2), x = sg * HALL * (1 - t);
          lat.push(at(dd, x, vaultY(S, x, dd) - 0.12).p);
        }
        tube(lat, 0.07, latticeMat);
      }
    }
    // downlights scattered over the vault in staggered rows, each a bright point with a soft glow
    const stars = [];
    for (let k = 0; k < bays; k++) [0.25, 0.5, 0.75].forEach((f, r) => {
      for (let x = -HALL + 2 + (r === 1 ? 1.6 : 0); x < HALL - 1.8; x += 3.2) stars.push([F + (k + f) * S.bay, x]);
    });
    const cores = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), starCore, stars.length);
    const glows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 1.0), starGlow, stars.length);
    stars.forEach(([d, x], i) => {
      const y = vaultY(S, x, d);
      place(cores, i, d, x, y - 0.1);
      const q = at(d, x, y - 0.14);
      dummy.position.copy(q.p); dummy.lookAt(q.p.clone().add(q.tan)); dummy.rotateX(Math.PI / 2); dummy.updateMatrix(); glows.setMatrixAt(i, dummy.matrix);
    });
    scene.add(cores, glows);
    // each end: a wall across the hall up to the vault, the tunnel mouth in its foot, tiled to the galleries and
    // glazed above them, with the station's name across the glass (`back`: the end behind an arriving train)
    const YT = CROWN + 0.3, W = 2048, ppm = W / (2 * HALL), H = Math.round((YT + 0.14) * ppm);
    const px = (y) => H - (y + 0.14) * ppm;
    const screen = textTexture(W, H, (c) => {
      c.fillStyle = "#dfe4e3"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#15a3bb"; c.fillRect(0, px(2.75), W, 0.5 * ppm);
      const g = c.createLinearGradient(0, px(YT), 0, px(GAL));
      g.addColorStop(0, "#d6e3ee"); g.addColorStop(0.6, "#efe6e0"); g.addColorStop(1, "#f7d9bf");
      c.fillStyle = g; c.fillRect(0, px(YT), W, px(GAL) - px(YT));
      c.fillStyle = "#6b7478";
      for (let i = 0, x = 0; x <= HALL; i++, x += 1.3) for (const sx of [-x, x]) { const w = i % 3 ? 3 : 8; c.fillRect((sx + HALL) * ppm - w / 2, px(YT), w, px(GAL) - px(YT)); }
      for (let i = 1, y = GAL + 1.45; y < YT; i++, y += 1.45) { const w = i % 3 ? 3 : 7; c.fillRect(0, px(y) - w / 2, W, w); }
      c.fillStyle = "#2b3135"; c.textAlign = "center"; c.textBaseline = "middle";
      const name = S.name.toUpperCase();
      fitFont(c, name, 14 * ppm, 1.5 * ppm, "700 %px Helvetica, Arial, sans-serif"); c.fillText(name, W / 2, px(GAL + 5.0));
      c.fillStyle = "#0B7285"; c.fillRect(W / 2 - 4.5 * ppm, px(GAL + 8.2), 9 * ppm, 1.6 * ppm);
      c.fillStyle = "#fff"; c.font = `italic 700 ${0.9 * ppm}px Helvetica, Arial, sans-serif`; c.fillText("CrossTowner", W / 2, px(GAL + 7.4));
      c.fillStyle = "#eef0ee"; c.fillRect(0, px(GAL), W, 0.7 * ppm);
    });
    screen.repeat.set(1 / (2 * HALL), 1 / (YT + 0.14)); screen.offset.set(0.5, 0.14 / (YT + 0.14));
    const screenMat = new THREE.MeshBasicMaterial({ map: screen, side: THREE.DoubleSide });
    for (const [d, back] of [[F, true], [T, false]]) {
      const sh = new THREE.Shape([V2(-HALL, -0.14), V2(HALL, -0.14)]);
      for (let i = 0; i <= 48; i++) { const x = HALL - (i / 48) * 2 * HALL; sh.lineTo(x, vaultY(S, x, d) + 0.05); }
      const hole = new THREE.Path(); hole.absarc(0, CY, R - 0.04, 0, Math.PI * 2, true); sh.holes.push(hole);
      const q = at(d), m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 48), screenMat);
      m.position.copy(q.p); m.lookAt(back ? q.p.clone().add(q.tan) : q.p.clone().sub(q.tan)); scene.add(m);
    }
  }
  STN.forEach((S) => {
    const F = S.boxFrom, T = S.boxTo, WALL = S.hall ? GAL : CEIL;
    for (const sg of [-1, 1]) {
      along(F, T, sg * PLAT_OUT, PLAT_UP, sg * PLAT_OUT, WALL, tile);                         // side wall
      along(F, T, sg * PLAT_IN, PLAT_UP, sg * PLAT_OUT, PLAT_UP, floorMat);                   // platform
      along(F, T, sg * PLAT_IN, -0.12, sg * PLAT_IN, PLAT_UP, darkMat);                       // platform face
      along(F, T, sg * (PLAT_IN + 0.08), PLAT_UP + 0.012, sg * (PLAT_IN + 0.68), PLAT_UP + 0.012, yellow);   // tactile edge
      along(F, T, sg * (PLAT_OUT - 0.03), 2.25, sg * (PLAT_OUT - 0.03), 2.75, teal);          // CrossTowner-teal band
    }
    // The platforms are hollow: close them at each end, or a train in the tunnel sees under them.
    for (const d of [F + 0.04, T - 0.04]) {
      for (const sg of [-1, 1]) ribbon((i) => [at(d, sg * (i ? PLAT_OUT : PLAT_IN), -0.14).p, at(d, sg * (i ? PLAT_OUT : PLAT_IN), PLAT_UP).p], 1, darkMat);
    }
    if (S.hall) hall(S);
    else {
      along(F, T, -PLAT_OUT, CEIL, PLAT_OUT, CEIL, ceilMat);
      boreWall(F, PLAT_OUT, -0.14, CEIL, tile);
      boreWall(T, PLAT_OUT, -0.14, CEIL, tile);
      // The bore's crown is higher than the station's ceiling: close it at each end, or a train in the tunnel sees over the ceiling to the street.
      for (const d of [F + 0.04, T - 0.04]) ribbon((i) => [at(d, (i ? 1 : -1) * (R + 0.4), CEIL - 0.03).p, at(d, (i ? 1 : -1) * (R + 0.4), CY + R + 0.8).p], 1, ceilMat);
      // light fittings over each platform and between the tracks
      for (const [side, w] of [[-5.2, 0.5], [5.2, 0.5], [0, 0.3]]) {
        const n = Math.floor((T - F - 4) / 4);
        const m = new THREE.InstancedMesh(new THREE.BoxGeometry(w, 0.07, 2.6), fitting, n);
        for (let i = 0; i < n; i++) place(m, i, F + 3 + i * 4, side, CEIL - 0.06);
        scene.add(m);
      }
    }
    const nameTex = textTexture(1024, 256, (c) => {
      c.fillStyle = "#0B7285"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
      fitFont(c, S.name, 940, 150, "700 %px Helvetica, Arial, sans-serif"); c.fillText(S.name, 512, 134);
    });
    const exitTexture = (left) => textTexture(1024, 256, (c) => {   // arrow up and to the right, or (left) up and to the left
      c.fillStyle = "#0a7d3b"; c.fillRect(0, 0, 1024, 256);
      c.fillStyle = "#fff"; c.textBaseline = "middle"; c.textAlign = "left";
      const tx = left ? 330 : 60;
      c.font = "700 130px Helvetica, Arial, sans-serif"; c.fillText("Exit", tx, 100);
      fitFont(c, S.exitTo, 640, 58, "500 %px Helvetica, Arial, sans-serif"); c.fillText(S.exitTo, tx + 2, 200);
      const ax = (x) => left ? 1024 - x : x;
      c.strokeStyle = "#fff"; c.lineWidth = 26; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(ax(760), 200); c.lineTo(ax(900), 60); c.moveTo(ax(790), 60); c.lineTo(ax(900), 60); c.lineTo(ax(900), 170); c.stroke();
    });
    const exitRight = exitTexture(false), exitLeft = exitTexture(true);
    const board = (tex, w, h, d, side, up, face, back) => {     // face: "train" (toward arriving trains) or "track"
      const q = at(d, side, up);
      const m = twoSided(tex, w, h, back);
      m.position.copy(q.p);
      m.lookAt(face === "train" ? q.p.clone().sub(q.tan) : q.p.clone().addScaledVector(q.right, side > 0 ? -1 : 1));
      scene.add(m);
    };
    for (let d = S.platFrom + 6; d < S.platTo; d += 15) for (const sg of [-1, 1]) board(nameTex, 2.9, 0.72, d, sg * (PLAT_OUT - 0.06), 2.5, "track");
    // and one each side hung across the platform for arriving trains: over its back half, clear of the edge, on rods from the ceiling
    for (const [d, sg] of [[S.platFrom + 20, S.our], [S.platFrom + 35, -S.our]]) {   // (the far one clear of the painting seen while stopped)
      board(nameTex, 3.0, 0.75, d, sg * 7.0, 4.6, "train");
      // (in a hall: from an arm off the wall below the gallery)
      const top = S.hall ? 5.6 : CEIL;
      for (const lat of [5.8, 8.2]) { const q = at(d, sg * lat, (4.95 + top) / 2), m = new THREE.Mesh(new THREE.BoxGeometry(0.04, top - 4.95, 0.04), handrail); m.position.copy(q.p); scene.add(m); }
      if (S.hall) along(d - 0.03, d + 0.03, sg * 5.75, top, sg * PLAT_OUT, top, handrail, 1);
    }

    // The exits: a stair up from each platform to the street, against the
    // wall, just ahead of where the cab stops.
    // (In a hall the stair comes up onto the gallery.)
    const EX0 = S.stop + 17, RUN = S.stairRun || 11.5, STEPS = 26, IN = 6.1, OUT = PLAT_OUT - 0.1;
    const TOP = S.exitTop ?? CEIL + 0.6, rise = (TOP - PLAT_UP) / STEPS, going = RUN / STEPS;
    for (const sg of [1, -1]) {
      const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(OUT - IN, rise, going), stepMat, STEPS);
      for (let i = 0; i < STEPS; i++) place(steps, i, EX0 + (i + 0.5) * going, sg * (IN + OUT) / 2, PLAT_UP + (i + 0.5) * rise);
      scene.add(steps);
      const slope = (lo, hi, mat) => ribbon((i) => {       // a sloped strip beside the stair, on the platform side
        const d = EX0 + i * RUN, y = PLAT_UP + i * (TOP - PLAT_UP);
        return [at(d, sg * IN, y + lo).p, at(d, sg * IN, y + hi).p];
      }, 1, mat);
      slope(0, 1.0, glass); slope(1.0, 1.08, handrail);
      // the opening in the ceiling above the stair, bright with daylight from the street
      if (!S.hall) along(EX0 + RUN * 0.42, EX0 + RUN + 1.5, sg * IN, CEIL - 0.03, sg * OUT, CEIL - 0.03, daylight, 20);
      else {                                                       // the landing at the top, open to the gallery
        along(EX0 + RUN, EX0 + RUN + 1.5, sg * IN, TOP, sg * PLAT_OUT, TOP, floorMat, 1);
        along(EX0 + RUN, EX0 + RUN + 1.5, sg * IN, TOP, sg * IN, TOP + 1.1, glass, 1);
      }
      // a wall behind the top of the stair, and the signs: each arrow points up the stair,
      // which from the track is to the left on the right-hand wall and to the right on the left-hand one
      ribbon((i) => [at(EX0 + RUN + 1.5, sg * (i ? OUT : IN), PLAT_UP).p, at(EX0 + RUN + 1.5, sg * (i ? OUT : IN), WALL).p], 1, tile);
      if (S.hall) ribbon((i) => [at(EX0 + RUN + 1.5, sg * (i ? PLAT_OUT : IN), TOP).p, at(EX0 + RUN + 1.5, sg * (i ? PLAT_OUT : IN), TOP + 1.1).p], 1, glass);
      board(sg > 0 ? exitRight : exitLeft, 3.0, 0.75, EX0 - 1.2, sg * ((IN + OUT) / 2 - 0.2), 3.75, "train", sg > 0 ? exitLeft : exitRight);
      board(sg > 0 ? exitLeft : exitRight, 2.4, 0.6, EX0 - 9, sg * (PLAT_OUT - 0.07), 2.5, "track", sg > 0 ? exitRight : exitLeft);
    }

    // An easter egg: paintings from the Art Institute of Chicago (public domain), up to three on each wall, hung above
    // the teal band in dark frames with a small label under each. Monet's train at Gare Saint-Lazare greets the
    // first station in the tunnel.
    if (art) {
      const HANG = [[[0, 2, 5], [1, 8]], [[3, 6, 4], [7, 9]], [[12, 10, 13], [14, 11]], [[15, 16, 17], []]];   // per station: the train's platform's wall (the left), the far wall
      const frameMat = new THREE.MeshBasicMaterial({ color: 0x1d1814, side: THREE.DoubleSide }), matMat = new THREE.MeshBasicMaterial({ color: 0xe9e4d8, side: THREE.DoubleSide });
      const panel = (mat, w, h, d, side, up) => {
        const q = at(d, side, up), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        m.position.copy(q.p); m.lookAt(q.p.clone().addScaledVector(q.right, side > 0 ? -1 : 1)); scene.add(m);
      };
      const si = STN.indexOf(S), UP = 3.3;                         // centre height: over the teal band, between the name boards along the wall
      [S.our, -S.our].forEach((sg, k) => {
        // midway between the name boards on the wall (every 15 m from S.platFrom + 6). The platform's wall: on the stretch the
        // cab sees slowing in; the far wall: one there too, and one across the tracks 10 to 15 m ahead of where the cab stops,
        // the nearest stretch of it in view while the train stands
        const list = (HANG[si] || [[], []])[k], spots = !k ? [S.platFrom + 58.5, S.platFrom + 73.5, S.platFrom + 88.5] : [S.platFrom + 88.5, S.platFrom + 121];
        list.forEach((ai, j) => {
          const a = art[ai];
          if (!a) return;
          const h = a.aspect >= 1 ? Math.min(2.4, 4.6 / a.aspect) : 2.4, w = h * a.aspect, d = spots[j];
          const tex = new THREE.Texture(a.img); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
          panel(frameMat, w + 0.5, h + 0.5, d, sg * (PLAT_OUT - 0.03), UP);                           // the frame...
          panel(matMat, w + 0.34, h + 0.34, d, sg * (PLAT_OUT - 0.04), UP);                           // ...its mat...
          panel(new THREE.MeshBasicMaterial({ map: tex, color: 0xeeeeee, toneMapped: false, side: THREE.DoubleSide }), w, h, d, sg * (PLAT_OUT - 0.05), UP);
          const label = textTexture(1024, 96, (c) => {                                               // ...and its label
            c.fillStyle = "#f4f1ea"; c.fillRect(0, 0, 1024, 96); c.fillStyle = "#222"; c.textBaseline = "middle";
            fitFont(c, `${a.artist}, ${a.title}, ${a.date}`, 980, 36, "600 %px Helvetica, Arial, sans-serif"); c.fillText(`${a.artist}, ${a.title}, ${a.date}`, 22, 34);
            c.fillStyle = "#666"; c.font = "500 26px Helvetica, Arial, sans-serif"; c.fillText("Art Institute of Chicago", 22, 72);
          });
          panel(new THREE.MeshBasicMaterial({ map: label, side: THREE.DoubleSide }), 1.4, 0.13, d, sg * (PLAT_OUT - 0.04), UP - h / 2 - 0.42);
        });
      });
    }
  });

  /* ---- the open-air stations on the surface (all assumed but their positions). A platform each side
          with a canopy, and a stair from each up to the street above: at Chicago/Halsted they run on under
          the Halsted St viaduct, the stairs coming up on its sidewalk a few steps from the corner of
          Chicago Ave and Halsted St; at 18th they end under the East 18th St footbridge, the stairs coming
          up onto its span. stair: { reach(side), where a line `side` metres out meets the near edge of
          the street above, and top, its height } ---- */
  // a station's name board, and its exit signs (an arrow up and to the right, or, left, up and to the left; down a stair,
  // the arrow points down)
  const stationName = (S) => textTexture(1024, 256, (c) => {
    c.fillStyle = "#0B7285"; c.fillRect(0, 0, 1024, 256);
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    fitFont(c, S.name, 940, 150, "700 %px Helvetica, Arial, sans-serif"); c.fillText(S.name, 512, 134);
  });
  const exitSign = (S, left, down) => textTexture(1024, 256, (c) => {
    c.fillStyle = "#0a7d3b"; c.fillRect(0, 0, 1024, 256);
    c.fillStyle = "#fff"; c.textBaseline = "middle"; c.textAlign = "left";
    const tx = left ? 330 : 60;
    c.font = "700 130px Helvetica, Arial, sans-serif"; c.fillText("Exit", tx, 100);
    fitFont(c, S.exitTo, 640, 58, "500 %px Helvetica, Arial, sans-serif"); c.fillText(S.exitTo, tx + 2, 200);
    const ax = (x) => left ? 1024 - x : x, ay = (y) => down ? 260 - y : y;
    c.strokeStyle = "#fff"; c.lineWidth = 26; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); c.moveTo(ax(760), ay(200)); c.lineTo(ax(900), ay(60)); c.moveTo(ax(790), ay(60)); c.lineTo(ax(900), ay(60)); c.lineTo(ax(900), ay(170)); c.stroke();
  });
  const openStation = (S, stair) => {
    const F = S.platFrom, T = S.platTo, OUT = PLAT_OUT, IN = 6.1;
    const std = (color, rough = 0.95) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
    const conc = std(0xb4b7b0), paving = std(0x9da19c), face = std(0x3a3d3f), roofMat = new THREE.MeshStandardMaterial({ color: 0xc3c9cb, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xc3c9cb, emissiveIntensity: 0.35 }), stepConc = std(0xa6aaa5);
    // an upright post from `lo` to `hi` above the rail
    const post = (d, side, lo, hi, w = 0.2, mat = steel) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hi - lo, w), mat), q = at(d, side, (lo + hi) / 2);
      m.position.copy(q.p); m.lookAt(q.p.clone().add(q.tan)); scene.add(m);
    };
    const sign = (tex, w, h, d, side, up, face, back) => {       // face: "train" (toward arriving trains) or "track"
      const q = at(d, side, up);
      const m = twoSided(tex, w, h, back);
      m.position.copy(q.p);
      m.lookAt(face === "train" ? q.p.clone().sub(q.tan) : q.p.clone().addScaledVector(q.right, side > 0 ? -1 : 1));
      scene.add(m);
    };
    const nameTex = stationName(S), exitRight = exitSign(S, false, stair.down), exitLeft = exitSign(S, true, stair.down);
    // stair.down: the stair goes down instead, from an opening in the platform to a pedestrian tunnel under the tracks at stair.top
    const { reach } = stair, RUN = 15, STEPS = 40, TOP = stair.top + 0.02, rise = (TOP - PLAT_UP) / STEPS, going = RUN / STEPS;
    const stairFoot = Math.min(...[IN, OUT].map((lat) => reach(lat)), ...[IN, OUT].map((lat) => reach(-lat))) - 0.6 - RUN;
    // the canopies: over the middle of the train to just past the cab, or to just short of the stairs
    const CAN0 = S.d - 36, CAN1 = Math.min(S.stop + 13, stairFoot - 1.5), ROOF = 4.45;
    S.exits = {}; S.stairRun = RUN; S.exitTop = TOP;
    for (const sg of [1, -1]) {
      if (!stair.down) along(F, T, sg * PLAT_IN, PLAT_UP, sg * OUT, PLAT_UP, paving);           // platform
      else {                                                       // the platform, round the stair's opening
        const e0 = Math.min(reach(sg * IN), reach(sg * OUT)) - 0.6 - RUN, e1 = e0 + RUN;
        along(F, T, sg * PLAT_IN, PLAT_UP, sg * IN, PLAT_UP, paving);
        along(F, e0, sg * IN, PLAT_UP, sg * OUT, PLAT_UP, paving); along(e1, T, sg * IN, PLAT_UP, sg * OUT, PLAT_UP, paving);
      }
      along(F, T, sg * PLAT_IN, -0.12, sg * PLAT_IN, PLAT_UP, face);                          // its face to the track
      along(F, T, sg * OUT, -0.12, sg * OUT, PLAT_UP + 1.15, conc);                           // its back, and a parapet
      along(F, T, sg * (PLAT_IN + 0.08), PLAT_UP + 0.012, sg * (PLAT_IN + 0.68), PLAT_UP + 0.012, yellow);   // tactile edge
      along(F, T, sg * (OUT - 0.03), PLAT_UP + 0.85, sg * (OUT - 0.03), PLAT_UP + 1.1, teal); // CrossTowner-teal band
      for (const d of [F, T]) ribbon((i) => [at(d, sg * (i ? OUT : PLAT_IN), -0.12).p, at(d, sg * (i ? OUT : PLAT_IN), PLAT_UP).p], 1, conc);
      // canopy: a roof sloping to the back, a teal fascia, and a row of posts
      along(CAN0, CAN1, sg * 4.2, ROOF, sg * (OUT + 0.3), ROOF - 0.3, roofMat);
      along(CAN0, CAN1, sg * 4.2, ROOF - 0.22, sg * 4.2, ROOF + 0.02, teal);
      for (const d of [CAN0, CAN1]) ribbon((i) => [at(d, sg * (i ? OUT + 0.3 : 4.2), ROOF - (i ? 0.3 : 0) - 0.2).p, at(d, sg * (i ? OUT + 0.3 : 4.2), ROOF - (i ? 0.3 : 0)).p], 1, roofMat);
      for (let d = CAN0 + 1; d <= CAN1 - 0.5; d += 8.5) post(d, sg * (OUT - 0.45), PLAT_UP, ROOF - 0.28);
      // station names: along the back of each platform, and one hung across it for arriving trains
      for (let d = F + 8; d < Math.min(T - 6, stairFoot - 3); d += 15) {
        sign(nameTex, 2.9, 0.72, d, sg * (OUT - 0.12), 2.75, "track");
        for (const e of [-1.2, 1.2]) post(d + e, sg * (OUT - 0.08), PLAT_UP + 1.1, 2.75, 0.08);
      }
      {                                                           // one hung across the platform for arriving trains: under the canopy, over its back half, on rods from the roof
        const d = sg > 0 ? CAN0 + 4 : CAN1 - 4;
        sign(nameTex, 3.0, 0.75, d, sg * 7.0, 3.75, "train");
        for (const lat of [5.8, 8.2]) post(d, sg * lat, 4.1, ROOF - 0.05 - 0.3 * (lat - 4.2) / (OUT + 0.3 - 4.2), 0.04);
      }
      // the stair: up beside the back of the platform to a landing level with the street above
      const top = Math.min(reach(sg * IN), reach(sg * OUT)) - 0.6, land = Math.max(reach(sg * IN), reach(sg * OUT)) + 1.0;
      const EX0 = top - RUN, yAt = (d) => PLAT_UP + Math.min(Math.max((d - EX0) / RUN, 0), 1) * (TOP - PLAT_UP);
      S.exits[sg] = EX0;
      const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(OUT - IN, Math.abs(rise), going), stepConc, STEPS);
      for (let i = 0; i < STEPS; i++) place(steps, i, EX0 + (i + 0.5) * going, sg * (IN + OUT) / 2, PLAT_UP + (i + 0.5) * rise);
      scene.add(steps);
      ribbon((i) => { const d = EX0 + 0.8 + i * (top - EX0 - 0.8); return [at(d, sg * IN, yAt(d) - 0.4).p, at(d, sg * OUT, yAt(d) - 0.4).p]; }, 1, conc);   // soffit
      ribbon((i) => { const d = top + i * (land - top); return [at(d, sg * IN, TOP).p, at(d, sg * OUT, TOP).p]; }, 1, paving);                              // landing
      ribbon((i) => { const d = top + i * (land - top); return [at(d, sg * IN, TOP - 0.4).p, at(d, sg * OUT, TOP - 0.4).p]; }, 1, conc);
      for (const lat of [IN, OUT]) {
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) - 0.4).p, at(d, sg * lat, yAt(d) + 0.05).p]; }, 8, conc);       // stringer
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) + 0.05).p, at(d, sg * lat, yAt(d) + 1.0).p]; }, 8, glass);     // balustrade
        ribbon((i) => { const d = EX0 + i * (land - EX0) / 8; return [at(d, sg * lat, yAt(d) + 1.0).p, at(d, sg * lat, yAt(d) + 1.08).p]; }, 8, handrail);
        if (!stair.down) for (const d of [EX0 + RUN * 0.5, top - 0.3, land - 0.4]) post(d, sg * (lat + (lat === IN ? 0.18 : -0.18)), lat === OUT ? PLAT_UP : -0.1, yAt(d) - 0.4, 0.3, conc);
      }
      if (stair.down) {
        // the opening's walls, and the dark mouth of the tunnel where the stair passes under the platform; below the
        // ground the stair is lost in a dark floor, as if it went on down
        const dz = EX0 + RUN * PLAT_UP / (PLAT_UP - TOP), dim = std(0x16191b);
        along(EX0, top, sg * IN, -0.12, sg * IN, PLAT_UP, face);
        along(EX0, top + 0.3, sg * (IN - 0.05), PLAT_UP, sg * (IN - 0.05), PLAT_UP + 1.05, glass);     // a glass guard on its track side
        along(EX0, top + 0.3, sg * (IN - 0.05), PLAT_UP + 1.05, sg * (IN - 0.05), PLAT_UP + 1.12, handrail);
        for (let d = EX0; d <= top + 0.31; d += (top + 0.3 - EX0) / 3) post(d, sg * (IN - 0.05), PLAT_UP, PLAT_UP + 1.1, 0.06);
        ribbon((i) => [at(top, sg * (i ? OUT : IN), -0.12).p, at(top, sg * (i ? OUT : IN), PLAT_UP).p], 1, dim);
        along(dz, top, sg * (IN + 0.02), -0.06, sg * (OUT - 0.02), -0.06, dim);
      }
      // the way out, on a frame over the foot of the stair
      sign(sg > 0 ? exitRight : exitLeft, 3.0, 0.75, EX0 - 1.2, sg * ((IN + OUT) / 2 - 0.2), 3.75, "train", sg > 0 ? exitLeft : exitRight);
      for (const lat of [IN - 0.75, OUT - 0.12]) post(EX0 - 1.2, sg * lat, PLAT_UP, 4.15, 0.1);
    }
  };
  /* ---- the Metra Electric's island platforms (S.island): between two tracks, edges(d) -> [lo, hi] metres from the line,
          following both as they spread and close. A canopy down the middle, the name hung under it facing each track,
          and in the middle, past the cab, a stair: down to a pedestrian tunnel under the tracks, or (stair.reach) up onto
          a footbridge, as at 18th. No stair: the eastern pair's island across the tracks at the Hyde Park stations ---- */
  const islandStation = (S, edges, stair = null) => {
    const F = S.platFrom, T = S.platTo, STEP = 3;
    const std = (color, rough = 0.95) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
    const conc = std(0xb4b7b0), paving = std(0x9da19c), face = std(0x3a3d3f), stepConc = std(0xa6aaa5), dim = std(0x16191b);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc3c9cb, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xc3c9cb, emissiveIntensity: 0.35 });
    const lo = (d) => edges(d)[0], hi = (d) => edges(d)[1], mid = (d) => (lo(d) + hi(d)) / 2, off = (f, k) => (d) => f(d) + k;
    // a strip from d0 to d1 between lateral a(d) at height ya and b(d) at yb
    const strip = (d0, d1, a, b, ya, yb, mat) => {
      const m = Math.max(1, Math.ceil((d1 - d0) / STEP));
      return ribbon((i) => { const d = d0 + (d1 - d0) * i / m; return [at(d, a(d), ya).p, at(d, b(d), yb).p]; }, m, mat);
    };
    const post = (d, side, y0, y1, w = 0.2, mat = steel) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, y1 - y0, w), mat), q = at(d, side, (y0 + y1) / 2);
      m.position.copy(q.p); m.lookAt(q.p.clone().add(q.tan)); scene.add(m);
    };
    const sign = (tex, w, h, d, side, up, toward, back) => {             // toward: a lateral to face, or "train" (arriving trains)
      const q = at(d, side, up), m = twoSided(tex, w, h, back);
      m.position.copy(q.p); m.lookAt(toward === "train" ? q.p.clone().sub(q.tan) : at(d, toward, up).p); scene.add(m);
    };
    const SW = 2.6, RUN = 15, STEPS = 40, sL = off(mid, -SW / 2), sR = off(mid, SW / 2);
    const TOP = stair ? stair.top + 0.02 : 0;
    const EX0 = !stair ? T : stair.reach ? stair.reach(mid(T)) - 0.6 - RUN : S.stop + 8;
    // the platform (round the stair's opening, if it goes down), its faces to the tracks, its ends, the tactile edges
    if (stair && !stair.reach) {
      strip(F, T, lo, sL, PLAT_UP, PLAT_UP, paving); strip(F, T, sR, hi, PLAT_UP, PLAT_UP, paving);
      strip(F, EX0, sL, sR, PLAT_UP, PLAT_UP, paving); strip(EX0 + RUN, T, sL, sR, PLAT_UP, PLAT_UP, paving);
    } else strip(F, T, lo, hi, PLAT_UP, PLAT_UP, paving);
    for (const e of [lo, hi]) strip(F, T, e, e, -0.12, PLAT_UP, face);
    for (const d of [F, T]) ribbon((i) => { const lat = i ? hi(d) : lo(d); return [at(d, lat, -0.12).p, at(d, lat, PLAT_UP).p]; }, 1, conc);
    strip(F, T, off(lo, 0.08), off(lo, 0.68), PLAT_UP + 0.012, PLAT_UP + 0.012, yellow);
    strip(F, T, off(hi, -0.68), off(hi, -0.08), PLAT_UP + 0.012, PLAT_UP + 0.012, yellow);
    // the canopy: flat, on a row of posts down the middle, edged in teal
    const CAN0 = S.d - 36, CAN1 = stair ? EX0 - 1.5 : S.stop + 13, ROOF = 4.45;
    strip(CAN0, CAN1, off(lo, 0.4), off(hi, -0.4), ROOF, ROOF, roofMat);
    for (const e of [off(lo, 0.4), off(hi, -0.4)]) strip(CAN0, CAN1, e, e, ROOF - 0.22, ROOF + 0.02, teal);
    const POSTS = 8.5;
    for (let d = CAN0 + 1; d <= CAN1 - 0.5; d += POSTS) post(d, mid(d), PLAT_UP, ROOF - 0.02);
    // the name, hung under the canopy, back to back: one facing each track, in every other gap between the posts (a 2.9 m
    // board fits a gap's 8.3 m clear, so no post cuts through it)
    const nameTex = stationName(S);
    for (let d = CAN0 + 1 + POSTS / 2; d < CAN1 - 2; d += 2 * POSTS) sign(nameTex, 2.9, 0.72, d, mid(d), 3.55, mid(d) + 10);
    if (!stair) return;
    // the stair, and the way out on a frame over its foot
    S.exits = { [-1]: EX0, 1: EX0 }; S.stairRun = RUN; S.exitTop = TOP; S.stairLat = mid;
    const rise = (TOP - PLAT_UP) / STEPS, going = RUN / STEPS, yAt = (d) => PLAT_UP + Math.min(Math.max((d - EX0) / RUN, 0), 1) * (TOP - PLAT_UP);
    const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(SW, Math.abs(rise), going), stepConc, STEPS);
    for (let i = 0; i < STEPS; i++) { const d = EX0 + (i + 0.5) * going; place(steps, i, d, mid(d), PLAT_UP + (i + 0.5) * rise); }
    scene.add(steps);
    const n8 = (d0, d1, a, ya, yb, mat) => ribbon((i) => { const d = d0 + i * (d1 - d0) / 8; return [at(d, a(d), ya(d)).p, at(d, a(d), yb(d)).p]; }, 8, mat);
    for (const e of [sL, sR]) {
      if (stair.reach) {                                           // up: stringers, glass balustrades and handrails, sloping with it
        n8(EX0, EX0 + RUN + 0.6, e, (d) => yAt(d) - 0.4, (d) => yAt(d) + 0.05, conc);
        n8(EX0, EX0 + RUN + 0.6, e, (d) => yAt(d) + 0.05, (d) => yAt(d) + 1.0, glass);
        n8(EX0, EX0 + RUN + 0.6, e, (d) => yAt(d) + 1.0, (d) => yAt(d) + 1.08, handrail);
      } else {                                                     // down: the opening's walls, with a glass guard round it
        strip(EX0, EX0 + RUN, e, e, -0.12, PLAT_UP, face);
        strip(EX0, EX0 + RUN, e, e, PLAT_UP, PLAT_UP + 1.05, glass);
        strip(EX0, EX0 + RUN, e, e, PLAT_UP + 1.05, PLAT_UP + 1.12, handrail);
      }
    }
    if (stair.reach) ribbon((i) => { const d = EX0 + 0.8 + i * (RUN - 0.8) / 8; return [at(d, sL(d), yAt(d) - 0.4).p, at(d, sR(d), yAt(d) - 0.4).p]; }, 8, conc);   // soffit, sloping with the stair
    else {                                                         // the far end's wall, and the dark mouth of the tunnel below
      ribbon((i) => { const d = EX0 + RUN, lat = i ? sR(d) : sL(d); return [at(d, lat, -0.12).p, at(d, lat, PLAT_UP).p]; }, 1, dim);
      strip(EX0 + RUN * PLAT_UP / (PLAT_UP - TOP), EX0 + RUN, off(sL, 0.02), off(sR, -0.02), -0.06, -0.06, dim);
    }
    sign(exitSign(S, false, !stair.reach), 3.0, 0.75, EX0 - 1.2, mid(EX0 - 1.2), 3.75, "train", exitSign(S, true, !stair.reach));
    for (const e of [-1.3, 1.3]) post(EX0 - 1.2, mid(EX0 - 1.2) + e, PLAT_UP, 4.15, 0.1);
  };
  for (const [S, side] of ISLANDS) {
    if (S === M18) continue;
    islandStation(S, S.island.edges, { top: -3.6 });
    // at the Hyde Park stations, the eastern pair's island too, across the tracks
    if (side < 0) islandStation(S, islandEdges(1, otherAt, (d) => meSide(2, d)));
  }
  // 18th's: up onto the East 18th St footbridge, which crosses just past the north end of the island
  islandStation(M18, M18.island.edges, { top: BRIDGE_DECK, reach: (side) => bridgeCross(side) - BRIDGE_W / 2 });
  // Chicago/Halsted's: where a line `side` metres from the centreline passes under the Halsted St viaduct's east edge
  openStation(CH, { top: VIA_DECK, reach: (side) => { let d = CH.d; while (d < LENGTH - 5 && at(d, side).p.x > VIA_HX + VIA_HALF) d += 0.25; return d; } });
  // Clybourn's: stairs down from each platform to a pedestrian tunnel under the tracks (assumed)
  openStation(CLY, { top: -3.6, down: true, reach: () => CLY.bridge });
  // (and the new stops on the UP North, all assumed, likewise)
  // Division/Elston's and every new UP North stop's (Addison/Lincoln to Rogers Park): stairs down from each platform to an
  // underpass (the openings only, as at Clybourn)
  const UNDERPASS = [DIV, ...NORTH_STOPS];             // stairs down to the street under the line
  for (const S of UNDERPASS) openStation(S, { top: -3.6, down: true, reach: () => S.bridge });
  for (const S of NORTH_STOPS.filter((S) => !UNDERPASS.includes(S))) {
    openStation(S, { top: BRIDGE_DECK, reach: () => S.bridge - BRIDGE_W / 2 });
    const std = (color, rough = 0.9) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
    const deckMat = std(0x9da19c), sideMat = std(0xb8bbb5), towerMat = std(0x9fa6a8, 0.6);
    const b = S.bridge, H = BRIDGE_W / 2, L = PLAT_OUT + 9, TOP = BRIDGE_DECK, THICK = 0.9, n = 16;
    const across = (d, y0, y1, mat) => ribbon((i) => { const lat = -L + 2 * L * i / n; return [at(d, lat, y0).p, at(d, lat, y1).p]; }, n, mat);
    const deck = (y) => ribbon((i) => { const lat = -L + 2 * L * i / n; return [at(b - H, lat, y).p, at(b + H, lat, y).p]; }, n, deckMat);
    deck(TOP); deck(TOP - THICK);
    for (const e of [-1, 1]) {
      across(b + e * H, TOP - THICK, TOP + 0.25, sideMat);        // the deck's edge, and a curb
      across(b + e * H, TOP + 0.25, TOP + 1.3, glass);            // glass parapet
      across(b + e * H, TOP + 1.3, TOP + 1.4, handrail);
    }
    for (const sg of [-1, 1]) {                                   // the towers: from the ground to a roof over the deck
      const q = at(b, sg * (L + 2.4)), m = new THREE.Mesh(new THREE.BoxGeometry(5.2, TOP + 3.2, 4.8), towerMat);
      m.position.copy(q.p).setY((TOP + 3.2) / 2 - 0.1); m.lookAt(m.position.clone().add(q.tan)); scene.add(m);
      const band = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.5, 4.9), teal);
      band.position.copy(q.p).setY(TOP + 2.4); band.lookAt(band.position.clone().add(q.tan)); scene.add(band);
    }
  }

  // The Brown Line's inbound track (toward the Loop, south-east): of its two main tracks, the one on the right of a train
  // heading that way (the 'L' runs on the right), as points every 3 m in the direction of travel, at its rail height.
  let BROWN_IN = null;
  const brownInbound = () => {
    const ways = BROWN_LINE.filter((w) => w.length >= 20).map((w) => w.map(([lon, lat]) => { const q = lonLat(lon, lat); return new THREE.Vector3(q.x, 8.8 + EMB_NORTH, q.z); }));
    const se = new THREE.Vector3(1, 0, 1).normalize(), right = new THREE.Vector3(-se.z, 0, se.x);
    const way = ways.sort((a, b) => b.reduce((m, p) => m + p.dot(right), 0) / b.length - a.reduce((m, p) => m + p.dot(right), 0) / a.length)[0];
    if (way[way.length - 1].clone().sub(way[0]).dot(se) < 0) way.reverse();
    const pts = [way[0]];
    for (let i = 1; i < way.length; i++) { const n = Math.max(1, Math.round(way[i].distanceTo(way[i - 1]) / 3)); for (let k = 1; k <= n; k++) pts.push(way[i - 1].clone().lerp(way[i], k / n)); }
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    return { pts, cum, len: cum[cum.length - 1] };
  };

  /* ---- the Brown Line (CTA's Ravenswood Branch) overhead just south of Addison/Lincoln, on OSM's alignment (BROWN_LINE):
          each track on a steel deck with side girders, ties and rails, on a column every 15 m, none on our railway. Its
          rail is BROWN_UP above ours, clear of our wires (assumed: in reality the UP North is on an embankment there,
          and the 'L' crosses over it) ---- */
  {
    BROWN_IN = brownInbound();
    const BROWN_UP = 8.8 + EMB_NORTH, HALF = 1.9, GIRDER = 1.3, structural = new THREE.MeshStandardMaterial({ color: 0x47524c, roughness: 0.75, metalness: 0.2, side: THREE.DoubleSide });
    for (const way of BROWN_LINE) {
      // the way every 3 m, and its sideways direction at each point
      const raw = way.map(([lon, lat]) => { const q = lonLat(lon, lat); return new THREE.Vector3(q.x, BROWN_UP, q.z); }), pts = [raw[0]];
      for (let i = 1; i < raw.length; i++) { const n = Math.max(1, Math.round(raw[i].distanceTo(raw[i - 1]) / 3)); for (let k = 1; k <= n; k++) pts.push(raw[i - 1].clone().lerp(raw[i], k / n)); }
      const side = pts.map((p, i) => { const t = pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).setY(0).normalize(); return new THREE.Vector3(-t.z, 0, t.x); });
      const band = (lat0, y0, lat1, y1, mat) => ribbon((i) => [pts[i].clone().addScaledVector(side[i], lat0).setY(y0), pts[i].clone().addScaledVector(side[i], lat1).setY(y1)], pts.length - 1, mat);
      band(-HALF, BROWN_UP - 0.35, HALF, BROWN_UP - 0.35, structural);                                    // deck
      for (const sg of [-1, 1]) band(sg * HALF, BROWN_UP - GIRDER, sg * HALF, BROWN_UP - 0.2, structural);   // side girders
      band(-HALF, BROWN_UP - GIRDER, HALF, BROWN_UP - GIRDER, structural);                                // their bottom flange
      for (const r of [-0.7175, 0.7175]) {
        const c = new THREE.CatmullRomCurve3(pts.map((p, i) => p.clone().addScaledVector(side[i], r).setY(BROWN_UP)));
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, pts.length * 2, 0.05, 5, false), railMat));
      }
      const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 0.14, 0.24), tieMat, pts.length * 4);
      let n = 0;
      for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) {
        const p = pts[i].clone().lerp(pts[i + 1], k / 4).setY(BROWN_UP - 0.25), t = pts[i + 1].clone().sub(pts[i]).setY(0).normalize();
        setInst(ties, n++, p, t, 0);
      }
      ties.count = n; scene.add(ties);
      for (let i = 0; i < pts.length; i += 5) {                     // columns, every 15 m, but none on our railway
        const p = pts[i];
        if (nearRailway(p.x, p.z, 3)) continue;
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, BROWN_UP - GIRDER, 0.5), structural);
        col.position.set(p.x, (BROWN_UP - GIRDER) / 2, p.z); scene.add(col);
      }
    }
  }

  /* ---- the Brown Line's Addison station: its two side platforms on OSM's outlines, at the 'L''s height, under canopies
          on posts, with the station's name (the platforms' height above the rail, the canopies and signs assumed) ---- */
  {
    const RAIL = 8.8 + EMB_NORTH, TOP = RAIL + 0.95, std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, side: THREE.DoubleSide, ...extra });
    const deck = std(0xa7a8a3), edge = std(0xd9b43a), roofMat = std(0x5b4a3e), postMat = std(0x3c3530, { metalness: 0.3 });
    const [cv, c] = hiCanvas(512, 128);
    c.fillStyle = "#1d1d1f"; c.fillRect(0, 0, 512, 128); c.fillStyle = "#62361b"; c.fillRect(0, 100, 512, 28);
    c.fillStyle = "#fff"; c.font = "bold 66px Helvetica, Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Addison", 256, 52);
    const signTex = new THREE.CanvasTexture(cv); signTex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, side: THREE.DoubleSide });
    for (const outline of BROWN_ADDISON) {
      const ring = outline.map(([lon, lat]) => { const q = lonLat(lon, lat); return V2(q.x, -q.z); });
      for (const [y, mat] of [[TOP, deck], [RAIL - 0.5, deck], [RAIL + 4.3, roofMat]]) {
        const g = new THREE.ShapeGeometry(new THREE.Shape(ring)); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
        scene.add(new THREE.Mesh(g, mat));
      }
      for (let i = 0; i + 1 < ring.length; i++) {                 // the platform's edge faces
        const a = ring[i], b = ring[i + 1];
        ribbon((k) => [new THREE.Vector3(k ? b.x : a.x, RAIL - 0.5, -(k ? b.y : a.y)), new THREE.Vector3(k ? b.x : a.x, TOP, -(k ? b.y : a.y))], 1, edge);
      }
      // posts and name signs along its long axis: between its two farthest-apart points
      let A = ring[0], B = ring[0];
      for (const p of ring) for (const q of ring) if (p.distanceTo(q) > A.distanceTo(B)) { A = p; B = q; }
      const len = A.distanceTo(B), cx = ring.reduce((m, p) => m + p.x, 0) / ring.length, cy = ring.reduce((m, p) => m + p.y, 0) / ring.length;
      const u = B.clone().sub(A).normalize(), mid0 = A.clone().add(B).multiplyScalar(0.5), off = V2(cx, cy).sub(mid0);
      for (let s = 4; s < len - 3; s += 9) {
        const q = A.clone().addScaledVector(u, s).add(off);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, RAIL + 4.3 - TOP, 0.25), postMat);
        post.position.set(q.x, (TOP + RAIL + 4.3) / 2, -q.y); scene.add(post);
        if (Math.round(s / 9) % 2) {
          const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), signMat);
          sg.position.set(q.x, TOP + 2.6, -q.y); sg.lookAt(sg.position.clone().add(new THREE.Vector3(-u.y, 0, -u.x))); scene.add(sg);
        }
      }
    }
  }

  /* ---- the UP North's bridge over the North Branch at Webster Ave (assets/webster-bridge.js; its design assumed) ---- */
  { const mid = (BRIDGE.d0 + BRIDGE.d1) / 2; buildRiverBridge({ THREE, scene, at, d0: BRIDGE.d0, d1: BRIDGE.d1, ground: EMB(BRIDGE.d0), trackLats: [otherAt(mid), sideAt(mid)] }); }

  /* ---- the East 18th St footbridge, from OpenStreetMap: a concrete deck with glass parapets, on piers kept clear
          of the railway. It rises from the ground at each end to BRIDGE_DECK over the span (the heights between
          are assumed: an even grade on each ramp) ---- */
  {
    const P = FOOTBRIDGE, cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + P[i].distanceTo(P[i - 1]));
    const hAt = (s) => s <= cum[3] ? BRIDGE_DECK * s / cum[3] : s <= cum[5] ? BRIDGE_DECK : BRIDGE_DECK * (cum[7] - s) / (cum[7] - cum[5]);
    const std = (color, rough = 0.9) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide });
    const deckMat = std(0x9da19c), sideMat = std(0xb8bbb5), pierMat = std(0xa9ada8);
    const quads = (mat) => { const pos = []; return { q: (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d), add: () => {
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, mat)); } }; };
    const deck = quads(deckMat), sides = quads(sideMat), glassQ = quads(glass), rail = quads(handrail);
    const H = BRIDGE_W / 2, THICK = 0.9;
    const pierAt = [];
    for (let i = 1; i < P.length; i++) {
      const A = P[i - 1], B = P[i], n = Math.max(1, Math.ceil(A.distanceTo(B) / 3)), dir = B.clone().sub(A).normalize(), nx = -dir.y, nz = dir.x;
      for (let k = 0; k < n; k++) {
        const s0 = cum[i - 1] + (cum[i] - cum[i - 1]) * k / n, s1 = cum[i - 1] + (cum[i] - cum[i - 1]) * (k + 1) / n;
        const p0 = A.clone().lerp(B, k / n), p1 = A.clone().lerp(B, (k + 1) / n), h0 = hAt(s0), h1 = hAt(s1);
        const v = (p, sg, h) => [p.x + nx * H * sg, h, p.y + nz * H * sg];
        deck.q(v(p0, -1, h0), v(p1, -1, h1), v(p1, 1, h1), v(p0, 1, h0));                                   // the walking surface
        deck.q(v(p0, -1, h0 - THICK), v(p1, -1, h1 - THICK), v(p1, 1, h1 - THICK), v(p0, 1, h0 - THICK));   // its underside
        for (const sg of [-1, 1]) {
          sides.q(v(p0, sg, h0 - THICK), v(p1, sg, h1 - THICK), v(p1, sg, h1 + 0.25), v(p0, sg, h0 + 0.25)); // the deck's edge, and a curb
          glassQ.q(v(p0, sg, h0 + 0.25), v(p1, sg, h1 + 0.25), v(p1, sg, h1 + 1.3), v(p0, sg, h0 + 1.3));   // glass parapet
          rail.q(v(p0, sg, h0 + 1.3), v(p1, sg, h1 + 1.3), v(p1, sg, h1 + 1.4), v(p0, sg, h0 + 1.4));       // handrail
        }
      }
      for (let s = cum[i - 1]; s < cum[i]; s += 12) pierAt.push([A.clone().lerp(B, (s - cum[i - 1]) / (cum[i] - cum[i - 1])), hAt(s)]);
    }
    for (let i = 1; i < P.length - 1; i++) {                      // a pad at each bend, so the pieces meet
      const g = new THREE.CylinderGeometry(H, H, THICK, 24); g.translate(P[i].x, hAt(cum[i]) - THICK / 2, P[i].y); scene.add(new THREE.Mesh(g, deckMat));
    }
    deck.add(); sides.add(); glassQ.add(); rail.add();
    for (const [p, h] of pierAt) {
      if (h < 1.5 || nearRailway(p.x, p.y, -1.5)) continue;       // none on the railway, and none where the ramp is nearly down
      const g = new THREE.BoxGeometry(0.8, h - THICK, 0.8); g.translate(p.x, (h - THICK) / 2, p.y); scene.add(new THREE.Mesh(g, pierMat));
    }
  }

  // Who is on the train's own platform before and after its doors have been open: `boarders` get on
  // (and vanish), `leavers` have got off. The dissolve halfway through each dwell swaps one for the other.
  const boarders = ALL.map(() => []), leavers = ALL.map(() => []), farBoarders = ALL.map(() => []);

  /* ---- people waiting on the platforms: ten kinds of rider (assets/people.js), each varied in skin tone, hair and
          clothes by its seed. Every station
          has someone using a wheelchair, someone with a baby in a stroller, someone with a bike, adults
          with children, and travellers with luggage (one alone, two as a couple). Each is built facing
          +z, then stood on a platform and turned. They don't move. ---- */
  const peopleSpots = [];                                 // { kind, station, pos, d, side } for the preview views
  {
    const { hash, wheelchairUser, withStroller, withBike, family, traveller, couple, crowd, walker, turnHeads, bake } = peopleKit({ THREE });   // (assets/people.js)
    // sg: the platform (see platAt); those on our train's (sg === S.our) board it, and "track" faces the track they wait for
    const stand = (g, kind, si, d, side, yaw, face = "track", up = PLAT_UP, waiting = true, sg = Math.sign(side)) => {
      const S = ALL[si], q = at(d, side, up);
      g.position.copy(q.p);
      g.lookAt(face === "track" ? at(d, trackFor(S, sg, d), up).p : q.p.clone().addScaledVector(q.tan, face === "ahead" ? 1 : -1));
      g.rotateY(yaw);
      scene.add(g);
      if (!waiting) return;
      // heads turned a little toward the train they wait for, up the line where it comes from (ours runs up it; the
      // other track's trains, down it, but those on the far side of the Hyde Park islands run up it too: farDir)
      const from = d + (sg === S.our || (S.island && S.island.farDir > 0) ? -12 : 12);
      turnHeads(g, at(from, trackFor(S, sg, from), up + 1.5).p);
      peopleSpots.push({ kind, station: si, pos: q.p.clone(), d, side });
      if (sg === S.our) boarders[si].push(g);                // on the platform beside the train's track: these get on it
      else farBoarders[si].push(g);                          // and these, the train on the other track (at Union Station, where the two meet)
    };
    ALL.forEach((S, si) => {
      // pi: the station's place in the crowd's seeds. 18th, added first along the line, takes the next free
      // one (5), so every other station keeps the crowd it had before 18th was in the film.
      const pi = si === 0 ? 5 : si <= 5 ? si - 1 : si;              // (Division/Elston and Clybourn, added after, take 6 and 7)
      const sw = pi % 2 ? -1 : 1, K = pi * 100;              // alternate which platform each of the fixed ones is on
      // An island's stair is down its middle (from SPAN[0] to SPAN[1]): nobody on wheels waits beside it (they wait
      // behind it), and anyone else there keeps to the strip between its opening and the platform edge.
      const SPAN = S.island && S.stairLat ? [S.exits[1] - 1.5, S.exits[1] + S.stairRun + 1] : null, WHEELS = ["wheelchair", "stroller", "bike"];
      const besideStair = (d) => SPAN && d > SPAN[0] && d < SPAN[1];
      const strip = (d) => { const [lo, hi] = S.island.edges(d); return (Math.abs(hi - lo) - 2.6) / 2 - 0.35; };
      // someone waiting at d, x metres back from the edge of platform sg
      const wait = (g, kind, d, sg, x, yaw, face) => {
        if (besideStair(d)) { if (WHEELS.includes(kind)) d = SPAN[0] - 1 - 2.5 * WHEELS.indexOf(kind); else x = Math.min(x, strip(d)); }
        stand(g, kind, si, d, platAt(S, sg, x, d), yaw, face, PLAT_UP, true, sg);
      };
      // Everyone waits behind where the cab stops, along the train: nobody at the far end of the platform, past it.
      wait(wheelchairUser(K + 1), "wheelchair", S.stop - 9 - pi * 0.5, sw, 1.7, 0.25);
      // where that one waits across the tracks, a second on the train's own platform, so someone using a wheelchair boards at every stop
      if (sw !== S.our) wait(wheelchairUser(K + 7), "wheelchair", S.stop - 10.5, S.our, 1.7, 0.25);
      wait(withStroller(K + 2), "stroller", S.stop - 13.5, -sw, 2.0, 0.15, "behind");
      wait(withBike(K + 3), "bike", S.stop - 5 - pi * 0.6, -sw, 2.1, 0, "ahead");
      wait(family(K + 4), "family", S.stop - 12.5 - pi * 0.7, sw, 2.6, -0.2);
      wait(traveller(K + 5), "traveller", S.stop - 7.5, -sw, 1.5, 0.2);
      wait(couple(K + 6), "couple", S.stop - 15.5 - pi * 0.5, sw, 1.4, 0.1);
      // then the rest of the crowd, scattered along both platforms (Union Station gets more luggage)
      const kinds = ["family", "traveller", S === STN[2] ? "couple" : "standing", S === STN[2] ? "traveller" : "standing", "kid"];
      for (let i = 0; i < 16; i++) {
        const k = K + 10 + i, sg = hash(k + 0.11) < 0.55 ? 1 : -1, kind = kinds[i] || "standing";
        const d = S.crowdFrom + 5 + hash(k + 0.21) * (Math.min(S.platTo - 4, S.stop - 3) - S.crowdFrom - 5);
        let x = 1.2 + hash(k + 0.31) * 3.0;
        const EX0 = S.exits ? S.exits[sg] : S.stop + 17, RUN = S.stairRun || 12;   // the stairs: keep their foot clear
        if (d > EX0 - 1.5 && d < EX0 + RUN + 2 && x > 1.65) x = 1.2 + hash(k + 0.31) * 0.5;
        if (besideStair(d)) x = Math.min(x, strip(d));
        const pos = at(d, platAt(S, sg, x, d), PLAT_UP).p;
        if (peopleSpots.some((o) => o.station === si && o.pos.distanceTo(pos) < (kind === "standing" ? 1.5 : 2.2))) continue;
        const f = hash(k + 0.41), face = f < 0.6 ? "track" : f < 0.85 ? "behind" : "ahead", yaw = (hash(k + 0.51) - 0.5) * 1.1;
        const g = kind === "family" ? family(k) : kind === "traveller" ? traveller(k) : kind === "couple" ? couple(k)
          : kind === "kid" ? family(k + 50) : crowd(k);
        wait(g, kind === "kid" ? "family" : kind, d, sg, x, yaw, face);
      }
      // And the people who get off here, on the train's platform (S.our: the left-hand one, but from 47th to 18th the
      // island on its right), shown once the doors have been open a while. Most are walking to the stair and up it; anyone on
      // wheels heads back along the platform, to a lift that is out of shot behind the cab.
      const EXL = S.exits ? S.exits[S.our] : S.stop + 17, RUNL = S.stairRun || 11.5, TOPL = S.exitTop ?? (S.outdoor ? VIA_DECK : CEIL + 0.6);
      const leaveAt = (g, d, side, face, yaw, up) => { stand(g, "leaving", si, d, side, yaw, face, up, false, S.our); g.visible = false; leavers[si].push(g); };
      const leave = (g, d, x, face, yaw = 0) => leaveAt(g, d, platAt(S, S.our, x, d), face, yaw, PLAT_UP);
      // on the stair: an island's is down its middle; a side platform's at its back
      const stairLat = (d, u) => (S.stairLat ? S.stairLat(d) + (u - 0.5) * 1.2 : S.our * (6.7 + u * 1.2));
      for (let i = 0; i < 7; i++) {                          // along the platform, drifting over to the foot of the stair
        const k = K + 200 + i, u = (i + 0.25 + 0.5 * hash(k + 0.1)) / 7;
        leave(i === 4 ? family(k) : walker(k), S.stop + 5.5 + u * (EXL - S.stop - 6.5), 2.3 + hash(k + 0.2) * 1.2 + u * 0.7, "ahead", (hash(k + 0.5) - 0.5) * 0.3);
      }
      [0.1, 0.26, 0.43, 0.6].forEach((f, i) => {             // on the stair
        const k = K + 220 + i, d = EXL + f * RUNL;
        leaveAt(walker(k), d, stairLat(d, hash(k + 0.2)), "ahead", 0, PLAT_UP + f * (TOPL - PLAT_UP) + 0.1);
      });
      // (on an island, behind its stair: they're off to a lift, not down the stair)
      const offStair = (d, k) => (SPAN && d > SPAN[0] - 1 ? SPAN[0] - 1.5 - 2.5 * k : d);
      leave(withBike(K + 231), offStair(S.stop + 6, 0), 1.6, "behind");
      leave(wheelchairUser(K + 232), offStair(S.stop + 9.5, 1), 1.5, "behind", 0.1);
      leave(withStroller(K + 233), offStair(S.stop + 13.5, 2), 1.7, "behind");
    });
    // Each station's people, merged into one mesh for each lot that comes and goes together (those waiting for our
    // train, those waiting for the other, those who got off), coloured by vertex: a few draws instead of thousands.
    ALL.forEach((S, si) => {
      for (const lot of [boarders, farBoarders, leavers]) {
        if (!lot[si].length) continue;
        const m = bake(lot[si]); m.visible = lot[si][0].visible; scene.add(m);
        lot[si].forEach((g) => scene.remove(g)); lot[si] = [m];
      }
    });
  }

  /* ---- camera in the operator's seat, and the cab around it ---- */
  const camera = new THREE.PerspectiveCamera(62, width / height, 0.05, 10000);
  scene.add(camera);
  const cabMat = new THREE.MeshBasicMaterial({ color: 0x0c0f10, fog: false });
  const trim = new THREE.MeshBasicMaterial({ color: 0x1b2124, fog: false });
  const box = (w, h, dz, x, y, z, mat = cabMat, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dz), mat);
    m.position.set(x, y, z); m.rotation.set(rx, 0, rz); camera.add(m); return m;
  };
  box(2.6, 0.5, 0.5, 0, -0.85, -0.9);                     // dash
  box(2.6, 0.3, 0.1, 0, 0.75, -0.9);                      // header
  // The windscreen's pillars and the cab's sides, where the train's own nose has them (assets/crosstowner-train.js,
  // FLIRT_CAB): the windscreen wraps round each corner, back along the side as it rises (0.76 m behind the face at its
  // foot, 1.38 m at its top), so from the seat its edges run up and out toward the corners of the view. Each pillar is
  // the strip from there back 0.35 m (to the side window, with its lining); below the side window the cab's side runs
  // back past the seat, and above it the side of the roof. Seen from an eye EYE_S behind the face and EYE_Y up (the
  // seated operator's; the camera itself stays where it is, the cab drawn about it).
  {
    const EYE_S = 2.1, EYE_Y = 2.75, C = FLIRT_CAB, W = C.SIDE_WIN;
    const P = (side, s2, y) => [side * C.halfWidth(s2, y), y - EYE_Y, s2 - EYE_S];   // nose (s back, y up) to the camera's frame
    const sheet = (side, n, at) => {                       // a strip: at(i/n) gives its two edge points [s, y] at step i
      const pos = [];
      for (let i = 0; i < n; i++) {
        const [a0, b0] = at(i / n), [a1, b1] = at((i + 1) / n);
        const q = [a0, b0, b1, a1].map(([s2, y]) => P(side, s2, y));
        pos.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x0c0f10, fog: false, side: THREE.DoubleSide }));
      m.renderOrder = 2; camera.add(m);
    };
    const FOOT = C.glassFoot(1.3), TOP = C.glassTop(1.3);
    for (const side of [-1, 1]) {
      sheet(side, 16, (u) => { const y = FOOT + (TOP - FOOT) * u, s2 = C.glassWrap(y); return [[s2, y], [s2 + 0.35, y]]; });   // the pillar
      sheet(side, 8, (u) => { const s2 = C.glassWrap(FOOT) + (EYE_S + 0.6 - C.glassWrap(FOOT)) * u; return [[s2, 1.2], [s2, Math.min(W.y0, FOOT + 0.02)]]; });   // below the side window
      sheet(side, 8, (u) => { const s2 = C.glassWrap(TOP) + (EYE_S + 0.6 - C.glassWrap(TOP)) * u; return [[s2, W.y1], [s2, 3.75]]; });   // above it
      sheet(side, 8, (u) => { const y = W.y0 + (W.y1 - W.y0) * u; return [[W.back, y], [EYE_S + 0.6, y]]; });   // behind it, beside the seat
    }
  }
  // console: a hooded display in front of the operator, a lamp panel and the controller
  const TILT = -0.42;
  box(0.62, 0.3, 0.06, -0.3, -0.46, -1.0, trim, TILT);    // display housing
  // The rest of the desk follows a Stadler FLIRT's: a second screen beside the first under one long
  // hood, a third angled in from the right, a small gauge panel on the left, and a black T-handle
  // master controller.
  box(0.36, 0.3, 0.06, 0.24, -0.46, -1.0, trim, TILT);    // second screen's housing, with the lamps and buttons
  box(1.1, 0.025, 0.1, -0.08, -0.288, -1.03, cabMat, TILT); // one hood over both
  const screen = (w, h, draw, x, y, z, ry = 0, cw = 512, ch = 256) => {
    const [cv, c] = hiCanvas(cw, ch); draw(c, cw, ch);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.set(TILT, ry, 0, "YXZ"); camera.add(m); return m;
  };
  screen(0.3, 0.115, (c, w, h) => {                       // train status: the consist and its doors
    c.fillStyle = "#0b1a24"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#8fa5b3"; c.font = "600 26px Helvetica, Arial, sans-serif"; c.fillText("X1  Highland Park", 18, 36);
    for (let i = 0; i < 4; i++) {                        // the consist: four cars and their doors
      c.fillStyle = "#1d3a4a"; c.fillRect(18 + i * 120, 70, 112, 46);
      c.fillStyle = "#35d07f"; c.fillRect(32 + i * 120, 100, 14, 10); c.fillRect(102 + i * 120, 100, 14, 10);
    }
    c.fillStyle = "#16303d"; for (let i = 0; i < 4; i++) c.fillRect(18 + i * 122, 150, 110, 78);
    c.fillStyle = "#5f7887"; c.font = "500 20px Helvetica, Arial, sans-serif";
    ["HVAC", "Brakes", "Pantograph", "Doors"].forEach((t, i) => c.fillText(t, 26 + i * 122, 180));
    c.fillStyle = "#35d07f"; for (let i = 0; i < 4; i++) c.fillRect(26 + i * 122, 196, 60, 8);
  }, 0.24, -0.378, -0.99);
  {
    const g = new THREE.Group();                           // the right-hand screen, turned toward the operator
    g.position.set(0.7, -0.47, -0.95); g.rotation.set(TILT, -0.55, 0, "YXZ"); camera.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.05), trim));
    const [cv, c] = hiCanvas(384, 320);
    c.fillStyle = "#12305a"; c.fillRect(0, 0, 384, 320);
    c.strokeStyle = "#7fb2e6"; c.lineWidth = 5; c.beginPath(); c.moveTo(40, 250); c.lineTo(190, 250); c.lineTo(250, 190); c.lineTo(350, 190); c.moveTo(40, 110); c.lineTo(350, 110); c.stroke();
    c.fillStyle = "#cfe3f7"; for (const [x, y] of [[90, 250], [300, 190], [120, 110], [260, 110]]) c.fillRect(x - 10, y - 10, 20, 20);
    c.fillStyle = "#2b5391"; c.fillRect(0, 0, 384, 44); c.fillStyle = "#dbe9f8"; c.font = "600 24px Helvetica, Arial, sans-serif"; c.fillText("Signals", 16, 30);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.21), new THREE.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false }));
    m.position.z = 0.027; g.add(m);
  }
  {
    const g = new THREE.Group();                           // left: a lit round gauge and a keypad
    g.position.set(-0.8, -0.5, -0.97); g.rotation.set(TILT, 0.45, 0, "YXZ"); camera.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.05), trim));
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.036, 28), new THREE.MeshBasicMaterial({ color: 0xf3e6c4, fog: false, toneMapped: false }));
    dial.position.set(0.055, 0.02, 0.027); g.add(dial);
    const hand = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.04), new THREE.MeshBasicMaterial({ color: 0x20262a, fog: false }));
    hand.position.set(0.062, 0.032, 0.028); hand.rotation.z = -0.6; g.add(hand);
    for (let i = 0; i < 9; i++) {
      const k = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.014), new THREE.MeshBasicMaterial({ color: i === 4 ? 0x9bb04a : 0x5a6368, fog: false }));
      k.position.set(-0.085 + (i % 3) * 0.028, 0.045 - Math.floor(i / 3) * 0.022, 0.027); g.add(k);
    }
  }
  {                                                       // master controller: a black T-handle on a short stalk
    const grip = new THREE.MeshBasicMaterial({ color: 0x2c3236, fog: false }), stalk = new THREE.MeshBasicMaterial({ color: 0x3d4448, fog: false });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, 0.13, 10), stalk);
    shaft.position.set(0.47, -0.5, -0.9); shaft.rotation.x = -0.3; camera.add(shaft);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.085, 12), grip);
    bar.position.set(0.47, -0.43, -0.92); bar.rotation.z = Math.PI / 2; camera.add(bar);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.16), new THREE.MeshBasicMaterial({ color: 0x1a1f22, fog: false }));
    gate.position.set(0.47, -0.565, -0.88); camera.add(gate);
  }
  const DISP_W = 768, DISP_H = 384;
  const [dispCanvas, dctx] = hiCanvas(DISP_W, DISP_H);
  const dispTex = new THREE.CanvasTexture(dispCanvas);
  dispTex.colorSpace = THREE.SRGBColorSpace; dispTex.anisotropy = 8;
  {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.27), new THREE.MeshBasicMaterial({ map: dispTex, fog: false, toneMapped: false }));
    m.position.set(-0.3, -0.446, -0.967); m.rotation.x = TILT; camera.add(m);
  }
  const lamp = (x, color) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.017, 20), new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false }));
    m.position.set(x, -0.47, -0.955); m.rotation.x = TILT; camera.add(m); return m;
  };
  const lampDoors = lamp(0.13, 0x35d07f), lampPower = lamp(0.19, 0x35d07f), lampBrake = lamp(0.25, 0x3a3f42);
  lamp(0.31, 0xf4a300);
  for (let i = 0; i < 4; i++) box(0.04, 0.012, 0.01, 0.13 + i * 0.06, -0.55, -0.95, new THREE.MeshBasicMaterial({ color: 0x4d575c, fog: false }), TILT);

  // The display: speed, a speed arc, the next stop and how far it is, and the whole line.
  function drawDisplay(mph, dist, atStation, doorsOpen) {
    const c = dctx, W = DISP_W, H = DISP_H, FONT = "px Helvetica, Arial, sans-serif";
    const next = CALLS.find((S) => S.stop > dist + 0.5);
    c.fillStyle = "#071216"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#0d2229"; c.fillRect(0, 0, W, 54);
    c.textBaseline = "middle"; c.textAlign = "left";
    c.fillStyle = "#7fd3e0"; c.font = "600 30" + FONT; c.fillText("CrossTowner", 22, 28);
    c.textAlign = "right"; c.fillStyle = doorsOpen ? "#f4c400" : "#35d07f";
    c.fillText(doorsOpen ? "DOORS OPEN" : "DOORS CLOSED", W - 22, 28);
    // speed arc
    const cx = 196, cy = 250, rad = 150, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, MAXV = 80;
    c.lineCap = "round"; c.lineWidth = 22;
    c.strokeStyle = "#17313a"; c.beginPath(); c.arc(cx, cy, rad, a0, a1); c.stroke();
    c.strokeStyle = "#15a3bb"; c.beginPath(); c.arc(cx, cy, rad, a0, a0 + (a1 - a0) * Math.min(mph / MAXV, 1) + 0.0001); c.stroke();
    c.lineWidth = 4; c.strokeStyle = "#5c7c86"; c.fillStyle = "#5c7c86"; c.font = "500 22" + FONT; c.textAlign = "center";
    for (let v = 0; v <= MAXV; v += 20) {
      const ang = a0 + (a1 - a0) * v / MAXV;
      c.beginPath(); c.moveTo(cx + Math.cos(ang) * (rad - 20), cy + Math.sin(ang) * (rad - 20));
      c.lineTo(cx + Math.cos(ang) * (rad - 34), cy + Math.sin(ang) * (rad - 34)); c.stroke();
      c.fillText(String(v), cx + Math.cos(ang) * (rad - 56), cy + Math.sin(ang) * (rad - 56));
    }
    c.fillStyle = "#fff"; c.font = "700 124" + FONT; c.fillText(String(Math.round(mph)), cx, cy - 4);
    c.fillStyle = "#9fb9c0"; c.font = "600 30" + FONT; c.fillText("mph", cx, cy + 76);
    // next stop (past the film's last one, the X1's next in the CrossTowner GTFS)
    const label = atStation ? "NOW AT" : "NEXT STOP";
    const name = atStation ? atStation.name : next ? next.name : "Howard/Clark";
    const toGo = next ? next.stop - dist : 0;
    c.textAlign = "left";
    c.fillStyle = "#9fb9c0"; c.font = "600 26" + FONT; c.fillText(label, 410, 104);
    c.fillStyle = "#fff"; fitFont(c, name, W - 408 - 24, 62, "700 %" + FONT); c.fillText(name, 408, 160);
    c.fillStyle = "#7fd3e0"; c.font = "600 40" + FONT;
    c.fillText(atStation ? `Exit on the ${atStation.doors || "right"}` : toGo > 0 ? (toGo / 1609.34).toFixed(2) + " mi" : "", 410, 224);
    // the whole line, with a dot for the train and a tick for each station
    const x0 = 412, x1 = W - 40, y = 300, X = (d) => x0 + (x1 - x0) * Math.min(Math.max((d - START) / (END - START), 0), 1);
    c.lineWidth = 8; c.strokeStyle = "#17313a"; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    c.strokeStyle = "#15a3bb"; c.beginPath(); c.moveTo(x0, y); c.lineTo(X(dist), y); c.stroke();
    for (const S of CALLS) { c.fillStyle = S.stop <= dist + 0.5 ? "#15a3bb" : "#3d5a63"; c.beginPath(); c.arc(X(S.stop), y, 8, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(X(dist), y, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#5c7c86"; c.font = "500 22" + FONT;
    c.fillText("Hyde Park", x0, y + 36); c.textAlign = "right"; c.fillText("Rogers Park", x1, y + 36);
    dispTex.needsUpdate = true;
  }

  /* ---- light: daylight outside, headlights and lamps below ---- */
  const hemi = new THREE.HemisphereLight(0xdfeaf5, 0x2a2a28, 1.5);
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.2);
  sun.position.set(0.42, 0.78, 0.46);
  const ambient = new THREE.AmbientLight(0x8fa3b0, 0.16);
  scene.add(hemi, sun, ambient);
  // The sun casts soft shadows, but only the train's, and only in the shots from outside: the shadow map is drawn
  // just for those frames (drawScene), in a box that follows the train, and falls on the train itself and on
  // a strip along the track that shows nothing but shadow.
  const SUN_DIR = sun.position.clone().normalize();
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
  sun.castShadow = true; scene.add(sun.target);
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  Object.assign(sun.shadow.camera, { left: -75, right: 75, top: 75, bottom: -75, near: 1, far: 400 });
  sun.shadow.camera.updateProjectionMatrix();
  let shadowCatcher = null;                                       // made once the alignment's helpers exist (below)
  let shadowFrame = -1;                                           // the frame the shadow map was last drawn for: once a frame, not once a sub-frame
  const head = new THREE.SpotLight(0xfff4e0, 260, 170, 0.55, 0.8, 1.5);
  head.position.set(0, -0.9, 0.5);
  camera.add(head); camera.add(head.target);
  head.target.position.set(0, -1.1, -30);

  /* ---- motion: the fastest run a train can make, played back faster than real time ----
     Between stops the train does what a Stadler FLIRT could: full power away
     from the platform (acceleration tapering once the motors are at full
     power), then its service brake into the next stop, slowing for each curve
     to the speed 49 CFR 213.57(b) allows. That is quicker than the synthetic
     CrossTowner GTFS (analysis/crosstowner_xroutes_gtfs), which spaces these
     stations two minutes apart with no dwell; the film keeps only its departure
     times. Every second of film is speedupAt(d) seconds of real time: SPEEDUP
     from 18th through Clybourn, as in the main film, and SPEEDUP_ENDS on the
     open-air Metra Electric and UP North beyond, easing between them on the runs
     either side (McCormick Place to 18th, and out of Clybourn). The stops are
     the exception (see DWELL). */
  const SPEEDUP = 4, SPEEDUP_ENDS = 8;
  // Each stop is 60 seconds on the clock but DWELL on screen at the stops shown in full (FULL_STOPS) and DWELL_SHORT
  // at the rest: partway through, the film dissolves over XFADE (XFADE_SHORT) seconds to the end of the stop (the clock
  // running on through what is skipped), by when the people waiting have boarded and those getting off are on their way out.
  const DWELL = 6, DWELL_SHORT = 3, DWELL_REAL = 60, XFADE = 2.2, XFADE_SHORT = 1.2;
  const dwellOf = (S) => (FULL_STOPS.includes(S) ? DWELL : DWELL_SHORT), xfadeOf = (S) => (FULL_STOPS.includes(S) ? XFADE : XFADE_SHORT);
  // what a stop takes on the clock: DWELL_REAL, but 30 s north of Clybourn (Steven, 2026-11-27)
  const realDwellOf = (S) => (NORTH_STOPS.includes(S) ? 30 : DWELL_REAL);
  // The train (assumed: a 4-car FLIRT; typical figures, not from a data sheet). SI units.
  // top: 79 mph, the most Metra's lines allow (the FLIRT itself could do 160 km/h)
  const TRAIN = { mass: 145e3 * 1.06, effort: 200e3, power: 2.6e6, accel: 1.2, brake: 1.0, top: 79 / 2.23694, length: 75 };
  const CANT_IN = 6, DEFICIENCY_IN = 3;                           // each curve's elevation (assumed) and the cant deficiency any vehicle may use, inches
  const ARRIVE_59 = 7 * 3600 + 41 * 60;                           // at 59th from 7:41 AM, leaving at 7:42 (trip X1_NB, one of every 30 minutes; the main film's 7:53 from McCormick Place)
  const END_CREDITS = 9;                                          // seconds of black, with the credits, after the ride
  const REVEAL_TAIL = 14;                                         // seconds the film runs on after the ride's own end (the train 500 m out of Rogers Park), under the ending's cards
  const McC = SOUTH_STOPS[SOUTH_STOPS.length - 1];
  // the speed-up at d metres along: SPEEDUP_ENDS, easing to SPEEDUP after McCormick Place and back once the train has
  // left Chicago/Halsted (its aerial shot is played at SPEEDUP)
  // ...slowed to BRIDGE_K for the overhead shot of the Webster Ave bridge, and after Rogers Park easing to END_K under the
  // ending's cards, so the train doesn't run out of track before the film fades
  const BRIDGE_K = 3, END_K = 2;
  const speedupAt = (d) => {
    let k = SPEEDUP + (SPEEDUP_ENDS - SPEEDUP)
      * (1 - smooth((d - (McC.stop + 60)) / (M18.platFrom - 80 - (McC.stop + 60))) + smooth((d - (CH.stop + 60)) / 400));
    k += (BRIDGE_K - k) * smooth((d - (BRIDGE.d0 - 450)) / 250) * (1 - smooth((d - (BRIDGE.d1 + TRAIN_LONG + 30)) / 250));
    return k + (END_K - k) * smooth((d - (LAST.stop + 40)) / 400);
  };
  // Each curve of the plan, and the speed it allows: Vmax (mph) = sqrt((Ea + Eu) / (0.0007 D)), D the degree
  // of curvature. It holds from the cab entering the curve until the tail of the train has left it.
  const curveLimits = [];
  {
    let from = null, turn = 0;
    for (let i = 2; i < plan.length; i++) {
      const a = plan[i - 1].clone().sub(plan[i - 2]), b = plan[i].clone().sub(plan[i - 1]);
      const k = Math.abs(Math.asin(Math.max(-1, Math.min(1, (a.x * b.y - a.y * b.x) / (a.length() * b.length())))));
      if (k > 1e-4) { if (from === null) { from = i - 1; turn = 0; } turn += k; }
      else if (from !== null) {
        const radius = (pd[i - 1] - pd[from]) / turn, mph = Math.sqrt((CANT_IN + DEFICIENCY_IN) / (0.0007 * 5729.578 / (radius / 0.3048)));
        curveLimits.push({ from: pd[from], to: pd[i - 1] + TRAIN.length, radius, mph, v: mph / 2.23694 });
        from = null;
      }
    }
  }
  // acceleration at full power at speed v: the tractive effort (limited by power) less the train's resistance
  const accelAt = (v) => Math.min(TRAIN.accel, (Math.min(TRAIN.effort, TRAIN.power / Math.max(v, 0.1)) - (2000 + 40 * v + 6.5 * v * v)) / TRAIN.mass);
  // The fastest run from a stand at x0 to a stand at x1 (or, stop = false, still accelerating there):
  // speed and elapsed time every `ds` metres, in real metres and seconds.
  const fastest = (x0, x1, stop = true) => {
    const n = Math.ceil((x1 - x0) / 0.25), ds = (x1 - x0) / n, v = new Float64Array(n + 1), ts = new Float64Array(n + 1);
    const cap = (i) => { const x = x0 + i * ds; let c = TRAIN.top; for (const q of curveLimits) if (x >= q.from && x <= q.to) c = Math.min(c, q.v); return c; };
    for (let i = 1; i <= n; i++) v[i] = Math.min(cap(i), Math.sqrt(v[i - 1] ** 2 + 2 * accelAt(v[i - 1]) * ds));
    if (stop) { let b = 0; v[n] = 0; for (let i = n - 1; i >= 0; i--) { b = Math.min(cap(i), Math.sqrt(b * b + 2 * TRAIN.brake * ds)); v[i] = Math.min(v[i], b); } }
    for (let i = 1; i <= n; i++) ts[i] = ts[i - 1] + ds / ((v[i] + v[i - 1]) / 2);
    return { x0, ds, n, v, ts, T: ts[n], peak: Math.max(...v) };
  };
  // { T, station, k, xf } while stopped, { T, run } while moving (T in film seconds). A run's `tf` is its film time every
  // `ds` metres, alongside `ts`, its real time: each step of real time is played at the speed-up where the train then is.
  const withFilmTime = (run) => {
    const tf = new Float64Array(run.n + 1);
    for (let i = 1; i <= run.n; i++) tf[i] = tf[i - 1] + (run.ts[i] - run.ts[i - 1]) / speedupAt(run.x0 + (i - 0.5) * run.ds);
    return Object.assign(run, { tf });
  };
  const phases = [];
  {
    // standing at 59th as the film opens; then each run, and the stop at its end; and at the last, Rogers Park, the
    // doors open too, then the train pulls away north as the film ends
    phases.push({ T: dwellOf(FIRST), station: FIRST });
    for (let i = 1; i < CALLS.length; i++) {
      const run = withFilmTime(fastest(CALLS[i - 1].stop, CALLS[i].stop));
      phases.push({ run, T: run.tf[run.n] }, { T: dwellOf(CALLS[i]), station: CALLS[i] });
    }
    const away = withFilmTime(fastest(LAST.stop, END, false));
    phases.push({ run: away, T: away.tf[away.n] });
  }
  // The film opens on a shot from high over Jackson Park (SHOTS[4]), the train already standing at 59th; the ride, and
  // everything timed to it, starts INTRO seconds in, the shot dissolving into the cab over its last INTRO_FADE.
  const INTRO = 11, INTRO_FADE = 1.4;
  let tAcc = INTRO, realAcc = 0;
  for (const ph of phases) {
    ph.t0 = tAcc; tAcc += ph.T; ph.real0 = realAcc;
    if (ph.station) {
      ph.real = realDwellOf(ph.station);
      ph.k = Math.min(speedupAt(ph.station.stop), ph.real / ph.T);   // (the clock slows, rather than runs back, at a stop shorter than its time on screen)
      ph.xf = xfadeOf(ph.station); realAcc += ph.real;
    } else realAcc += ph.run.T;
  }
  const RIDE = tAcc, DURATION = Math.ceil(RIDE + REVEAL_TAIL + END_CREDITS);
  const clampT = (t) => Math.min(Math.max(t, INTRO), RIDE - 1e-6);   // (through the opening shot, the moment the ride begins)
  const phaseAt = (t) => { t = clampT(t); let p = phases[0]; for (const q of phases) { if (q.t0 <= t) p = q; else break; } return p; };
  // where a run has got to, `tau` film seconds into it: [metres along the alignment, real m/s, real seconds into the run]
  const runAt = (p, tau) => {
    const r = p.run, tt = Math.min(tau, r.tf[r.n]);
    let lo = 0, hi = r.n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (r.tf[m] <= tt) lo = m; else hi = m; }
    const f = Math.min(Math.max((tt - r.tf[lo]) / (r.tf[hi] - r.tf[lo] || 1), 0), 1);
    return [r.x0 + (lo + f) * r.ds, r.v[lo] + (r.v[hi] - r.v[lo]) * f, r.ts[lo] + (r.ts[hi] - r.ts[lo]) * f];
  };
  const realSpeedAt = (t) => { const p = phaseAt(t); return p.run ? runAt(p, clampT(t) - p.t0)[1] : 0; };   // m/s
  const speedAt = (t) => realSpeedAt(t) * speedupAt(distAt(t));   // m/s of film
  const lastRun = phases[phases.length - 1].run;
  const END_SPEED = lastRun.v[lastRun.n] * speedupAt(END);
  const distAt = (t) => {
    const p = phaseAt(t);                                         // past the end of the ride the train rolls on
    return (p.run ? runAt(p, clampT(t) - p.t0)[0] : p.station.stop) + Math.max(0, t - RIDE) * END_SPEED;
  };
  const stopPhases = phases.filter((q) => q.station);
  const dwellMid = new Map(stopPhases.map((q) => [q.station, q.t0 + q.T / 2]));   // the middle of each stop's dissolve
  // the time of day, seconds after midnight: each run's real time, and at each stop the speed-up there, plus what its
  // dissolve skips (so that every stop takes its realDwellOf on the clock)
  const clockAt = (t) => {
    const p = phaseAt(t), tau = clampT(t) - p.t0;
    if (p.run) return ARRIVE_59 + p.real0 + runAt(p, tau)[2];
    return ARRIVE_59 + p.real0 + p.k * tau + (p.real - p.k * p.T) * smooth((tau - (p.T - p.xf) / 2) / p.xf);
  };
  // Show each station's platform as it is before (`after` false) or after its dissolve; `force` sets that for a station mid-dissolve.
  let peopleForce = null;
  const setPeople = (t) => ALL.forEach((S, si) => {
    const m = dwellMid.get(S), after = peopleForce !== null && Math.abs(t - m) <= xfadeOf(S) ? peopleForce : t >= m;
    for (const g of boarders[si]) g.visible = !after;
    for (const g of leavers[si]) g.visible = after;
    if (S === STN[2] || BOARD_FAR.includes(S)) for (const g of farBoarders[si]) g.visible = !after;   // the oncoming train's riders board it too
  });

  /* ---- the train from outside (a four-car Stadler FLIRT, Metra's battery train without its PowerPack, in CrossTowner
          teal), only ever seen from outside the cab ---- */
  const makeTrain = (lit, sign) => {                      // (assets/crosstowner-train.js); doors at our platforms' height
    const train = buildCrossTowner({ THREE, lit, sill: PLAT_UP, sign });
    train.visible = false; scene.add(train);
    return train;
  };
  // ...and the CrossTowner double-decker (a four-car KISS, assets/kiss-train/), the trains seen the other way and on
  // the other lines; its pantograph raised to the wire (WIRE_OUT, or WIRE_IN in the tunnel)
  const makeKiss = (lit, sign, wire = 5.7) => {
    const k = buildKiss({ THREE, lit, sign, wire });
    k.visible = false; scene.add(k);
    return k;
  };
  const TO_NORTH = "X1 Highland Park", TO_SOUTH = "X1 South Chicago";   // the destination signs, each way
  const train = makeTrain(false, TO_NORTH), oncoming = makeTrain(true, TO_NORTH);   // oncoming: stands in for ours in the dark shot (1)
  const meetTrain = makeKiss(true, TO_SOUTH, 5.3);                // the train the other way, which meets ours at Union Station
  const southbound = makeKiss(false, TO_SOUTH);                   // in the closing shot, a train the other way pulls in to Chicago/Halsted
  shadowCatcher = along(0, LENGTH, -4.3, 0.045, 4.3, 0.045, new THREE.ShadowMaterial({ opacity: 0.32, depthWrite: false }), 4);
  shadowCatcher.receiveShadow = true; shadowCatcher.visible = false;
  // Stand a train on a track with its nose at `front`, heading up (dir 1) or down (dir -1) the alignment.
  const placeTrain = (cars, front, side, dir) => {
    const sd = sideFn(side);
    cars.children.forEach((car) => {                              // each car from its front joint (or coupler) to its back one
      const f = front - dir * car.userData.from, g = f - dir * car.userData.len;
      const a = at(f, sd(f)).p, b = at(g, sd(g)).p;
      car.position.copy(a).add(b).multiplyScalar(0.5);
      car.lookAt(a);
    });
  };
  // A train the other way, on the other track: it brakes into Union Station's far platform as ours pulls in (its
  // service brake, TRAIN.brake, at SPEEDUP), stands beside ours through the stop, and is still there as ours leaves.
  // It stops filling the platform (its tail just past the north end), beside and ahead of our cab, so the operator sees it there.
  const MEET_D = STN[2].platTo + 0.5 - KISS_LENGTH, ON_BRAKE = 6.0;   // where its nose stops; seconds of braking (film)
  const ON_A = TRAIN.brake * SPEEDUP * SPEEDUP, ON_V = ON_A * ON_BRAKE;   // film m/s^2, and its film speed before braking
  let MEET_T = 0;                                                 // when it stops (set once the timing below exists)
  const oncomingAt = (t) => {
    const r = MEET_T - t;
    if (r <= 0) return MEET_D;
    if (r <= ON_BRAKE) return MEET_D + 0.5 * ON_A * r * r;
    return MEET_D + 0.5 * ON_A * ON_BRAKE * ON_BRAKE + ON_V * (r - ON_BRAKE);
  };

  /* ---- the shots from outside the cab. Each dissolves in and out of the operator's view:
          0  above the south portal, as the train runs down the ramp and in
          1  in the tunnel after Union Station, just ahead of the train, looking back at its cab
          2  above the north portal as the train comes out and stops at Chicago/Halsted; then the
             camera climbs away to the north-west until the whole city is in view, and the film goes
             back to the cab, on its way north to Division/Elston and Clybourn ---- */
  const timeAtDist = (d) => { let lo = 0, hi = DURATION; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (distAt(m) < d) lo = m; else hi = m; } return lo; };
  const AIR_FADE = 0.45;
  const arrive = (S) => phases.find((q) => q.station === S).t0;
  const FRONT_IN = arrive(STN[2]) + DWELL + 1.0, FRONT_LEN = 4.8;
  // The closing shot's move: from PULL_FROM to PULL_TO the camera leaves its place by the north ramp for
  // one high over the tracks north-west of the station, and turns from the train to the Loop's towers; it holds
  // there a moment (to HERO_END) and dissolves, slowly, back to the cab.
  const PULL_FROM = arrive(CH) + 1.2, PULL_TO = arrive(CH) + 13.5, HERO_END = PULL_TO + 1.8, HERO_FADE = 1.1;
  const SHOTS = [
    { from: timeAtDist(PORTAL - 165), to: timeAtDist(PORTAL + 135) },
    { from: FRONT_IN, to: FRONT_IN + FRONT_LEN, dark: true },
    { from: timeAtDist(PORTAL2 - 120), to: HERO_END, fadeOut: HERO_FADE },
    // 3: the Webster Ave bridge from above, cut to as the train nears it and cut away once its tail is over
    { from: timeAtDist(BRIDGE.d0 - 140), to: timeAtDist(BRIDGE.d1 + TRAIN_LONG + 15), cut: true },
    // 4: the opening, from high over Jackson Park south of 59th, past the Obama Center, down into the station
    { from: -1, to: INTRO, fadeOut: INTRO_FADE, intro: true },
  ];
  const shotAt = (t) => SHOTS.findIndex((s) => t > s.from && t < s.to);
  const airWeight = (t) => {
    const s = SHOTS[shotAt(t)], out = s && s.fadeOut || AIR_FADE;
    if (s && s.cut) return 1;
    return s ? smooth((t - s.from) / AIR_FADE) * (1 - smooth((t - (s.to - out)) / out)) : 0;
  };
  MEET_T = arrive(STN[2]) + 0.8;                                  // a moment after ours has stopped
  const MEET_GONE = arrive(STN[2]) + DWELL + 10;                  // by when ours has left it well behind

  /* ---- the other trains met at our stops (at 8x a train passing on the open line is gone in a blink): on the Metra
          Electric and the UP North, CrossTowner double-deckers (makeKiss); at 27th, on the outer eastern track (an
          express track, as the South Shore's trains use), a FLIRT like ours; and overhead before Addison/Lincoln a CTA Brown Line train (cta: eight
          stainless cars) ---- */
  const makeConsist = (kind) => {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.4, ...extra });
    // (no environment to reflect, so stainless reads better as a pale, barely metallic grey)
    const stainless = mat(0xd3d7da, { metalness: 0.15, roughness: 0.4 }), dark = mat(0x34434d, { metalness: 0.2, roughness: 0.25 }), under = mat(0x2a2d2f, { roughness: 0.9 });
    const doorMat = mat(0x8b9398, { metalness: 0.15, roughness: 0.5 });
    const roofGrey = mat(0x8d9396, { roughness: 0.7 }), lamp = new THREE.MeshBasicMaterial({ color: 0xfff4d6 });
    const box = (c, w, h, l, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); b.position.set(x, y, z); c.add(b); };
    const W = 3.05;
    // a car `len` long and `h` tall, its length along z (+z the end that leads when cab is 1); rows: window bands' heights
    // doors: where along the car (fractions of its length from the middle) each side's doors are
    const car = ({ len, h, body = stainless, rows, stripe = null, cab = 0, pan = false, doors = [] }) => {
      const c = new THREE.Group(); c.userData.len = len;
      box(c, W, h - 1.05, len, 0, 1.05 + (h - 1.05) / 2, 0, body);
      box(c, W * 0.86, 0.06, len * 0.96, 0, h + 0.03, 0, roofGrey);
      box(c, W * 0.8, 0.85, len * 0.9, 0, 0.6, 0, under);         // underframe, and the trucks under it
      for (const y of rows) for (const sg of [-1, 1]) box(c, 0.02, 0.8, len * 0.86, sg * (W / 2 + 0.005), y, 0, dark);
      if (stripe) for (const sg of [-1, 1]) box(c, 0.02, 0.24, len, sg * (W / 2 + 0.012), stripe.y, 0, mat(stripe.color, { metalness: 0.1, roughness: 0.6 }));
      for (const u of doors) for (const sg of [-1, 1]) box(c, 0.03, 2.1, 1.4, sg * (W / 2 + 0.015), 1.2 + 1.05, u * len, doorMat);
      if (pan) {                                                   // a pantograph, raised to the wire
        box(c, 1.7, 0.06, 0.5, 0, h + 1.15, len * 0.28, dark);
        for (const sg of [-1, 1]) box(c, 0.05, 1.2, 0.05, sg * 0.4, h + 0.6, len * 0.28 + sg * 0.3, dark);
      }
      if (cab) {                                                   // a cab end: a dark windscreen and two headlights
        const z = cab * (len / 2 + 0.02);
        box(c, W * 0.84, 1.0, 0.04, 0, h - 1.2, z, dark);
        for (const sg of [-1, 1]) box(c, 0.32, 0.2, 0.04, sg * 0.95, 1.75, z + cab * 0.01, lamp);
      }
      return c;
    };
    if (kind === "cta") for (let i = 0; i < 8; i++) g.add(car({ len: 14.6, h: 3.75, rows: [2.35], stripe: { y: 1.75, color: 0x1f4e9c }, cab: i === 0 ? 1 : i === 7 ? -1 : 0, doors: [-0.28, 0, 0.28] }));
    g.userData.len = g.children.reduce((sum, c) => sum + c.userData.len + 0.9, -0.9);
    return g;
  };
  // Where a train's nose is at film time t. Arriving (`ts`), it brakes to stop at `stopD` (its service brake at the
  // speed-up there), stands, and from `tl` pulls away; passing (`pass`), it runs through at `mph` throughout.
  const frontAt = (m, t) => {
    if (m.pass) return m.pass + m.dir * (t - m.tp) * m.v;
    if (t < m.ts) { const r = m.ts - t, B = m.v / m.a; return m.stopD - m.dir * (r <= B ? 0.5 * m.a * r * r : 0.5 * m.a * B * B + m.v * (r - B)); }
    if (t <= m.tl) return m.stopD;
    const u = t - m.tl; return m.stopD + m.dir * 0.5 * m.acc * u * u;
  };
  const OTHERS = (() => {
    const McC27 = SOUTH_STOPS[5], ADD = NORTH_STOPS[0];
    const at8 = (S, mph) => { const k = speedupAt(S.stop); return { v: mph / 2.23694 * k, a: TRAIN.brake * k * k, acc: 0.6 * k * k }; };
    const shown = (S) => [arrive(S) - 12, arrive(S) + phases.find((q) => q.station === S).T + 8];
    const list = [];
    const add = (kind, m) => {
      const train = kind === "kiss" ? makeKiss(false, TO_SOUTH) : makeTrain(false, TO_SOUTH);
      list.push({ train, ...m, len: kind === "kiss" ? KISS_LENGTH : TRAIN_LONG });
    };
    // (each on its own left, the track to the east of ours)
    // 59th: a southbound double-decker at the eastern pair's island, across the tracks as the film opens, pulling out past us
    add("kiss", { dir: -1, track: otherAt, ...at8(FIRST, 40), ts: -Infinity, tl: 4.6, vis: [0, 16] });
    // McCormick Place: a southbound double-decker draws in on the far side of our island; those waiting there get on
    add("kiss", { dir: -1, track: otherAt, ...at8(McC, 50), ts: arrive(McC) + 0.5, tl: Infinity, vis: shown(McC) });
    // 27th: a FLIRT like ours runs through southbound on the outer eastern track, beyond the island (assumed: an express
    // track, as the South Shore's trains use)
    add("flirt", { dir: -1, track: (d) => meSide(2, d), ...at8(McC27, 50), pass: McC27.stop + 20, tp: arrive(McC27) + 1.3, vis: shown(McC27) });
    // Addison/Lincoln: a double-decker runs through southbound on the other track
    add("kiss", { dir: -1, track: otherAt, ...at8(ADD, 55), pass: ADD.stop, tp: arrive(ADD) + 1.4, vis: shown(ADD) });
    // Rogers Park: a southbound double-decker draws in at the east platform as the film ends; its riders get on
    add("kiss", { dir: -1, track: otherAt, ...at8(LAST, 45), ts: arrive(LAST) + 0.8, tl: Infinity, vis: [arrive(LAST) - 12, DURATION] });
    // The standing ones stop with their tail at the platform's far (north) end, so the cab sees them there
    for (const [m, S] of [[list[0], FIRST], [list[1], McC], [list[4], LAST]]) m.stopD = S.platTo - 3 - m.len;
    return list;
  })();
  const BOARD_FAR = [McC, LAST];                                  // where those on the far platform board the train that meets ours
  // A Brown Line train inbound overhead before Addison/Lincoln (CTA-style: eight stainless cars), crossing above the line
  // a little ahead of our cab, at 35 mph (and the speed-up there), along OSM's track.
  const brownTrain = makeConsist("cta");
  const BROWN_RUN = (() => {
    const { pts, cum } = BROWN_IN;
    let k = 0, best = Infinity, dc = 0;                             // where it crosses our line: its nearest point to it
    for (let i = 0; i < pts.length; i++) for (let d = NORTH_STOPS[0].d - 800; d < NORTH_STOPS[0].d; d += 4) {
      const q = at(d).p, dd = Math.hypot(q.x - pts[i].x, q.z - pts[i].z);
      if (dd < best) { best = dd; k = i; dc = d; }
    }
    const v = 35 / 2.23694 * speedupAt(dc);
    return { sCross: cum[k], tCross: timeAtDist(dc - 120), v };
  })();
  const brownAlong = (s) => {                                    // a point s metres along the inbound track, and its heading
    const { pts, cum } = BROWN_IN;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const f = Math.min(Math.max((s - cum[i - 1]) / (cum[i] - cum[i - 1]), 0), 1);
    return pts[i - 1].clone().lerp(pts[i], f);
  };
  const placeBrown = (t) => {
    const len = brownTrain.userData.len, head = BROWN_RUN.sCross + len / 2 + (t - BROWN_RUN.tCross) * BROWN_RUN.v;
    brownTrain.visible = head - len > 0 && head < BROWN_IN.len && Math.abs(t - BROWN_RUN.tCross) < 8;
    if (!brownTrain.visible) return;
    let off = 0;
    for (const c of brownTrain.children) {
      const a = brownAlong(head - off), b = brownAlong(head - off - c.userData.len);
      c.position.copy(a).add(b).multiplyScalar(0.5); c.lookAt(a);
      off += c.userData.len + 0.9;
    }
  };
  const airCam = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
  scene.add(airCam);
  const airLamp = new THREE.PointLight(0xfff0d8, 0, 70, 1.4);     // lights the tunnel and the train's face in shot 1
  airCam.add(airLamp);
  // The southbound train: running in at speed on the far track, then its service brake (TRAIN.brake, at SPEEDUP)
  // brings it to a stand at the south end of the platform as the camera climbs away.
  const SB_STOP_T = PULL_FROM + 5.5, SB_BRAKE = 6.0, SB_STOP_D = CH.d - 100;   // when and where it stops (its nose); seconds of braking
  const SB_A = TRAIN.brake * SPEEDUP * SPEEDUP, SB_V = SB_A * SB_BRAKE;      // film m/s^2, and its film speed before braking
  const southboundAt = (t) => {
    const r = SB_STOP_T - t;
    if (r <= 0) return SB_STOP_D;
    if (r <= SB_BRAKE) return SB_STOP_D + 0.5 * SB_A * r * r;
    return SB_STOP_D + 0.5 * SB_A * SB_BRAKE * SB_BRAKE + SB_V * (r - SB_BRAKE);
  };
  const chAt = at(CH.d).p;
  const loopward = new THREE.Vector3(-1313 - chAt.x, 0, -1658 - chAt.z).normalize();   // from the station toward Willis Tower
  const HIGH = chAt.clone().addScaledVector(loopward, -950).setY(380);
  const HIGH_LOOK = chAt.clone().addScaledVector(loopward, 900).setY(60);
  const ease = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * x * (x * (x * 6 - 15) + 10); };
  // The opening shot's flight: from 240 m up, 650 m south of where the plan begins (over Woodlawn and the south of
  // Jackson Park), looking at the Obama Center's tower; past it to the west, coming down; then in over 59th St's
  // platforms to just behind and above the operator's seat, looking where the cab looks (so it dissolves into it).
  const INTRO_FLIGHT = (() => {
    const eye = distAt(INTRO), tower = at(40, 229).p.setY(35);
    const pos = [atFar(-650, 120).p.setY(240), atFar(-260, 70).p.setY(150), at(eye - 95, 18, 38).p, at(eye - 9, sideAt(eye) + 0.9, 4.0).p];
    const look = [tower, at(150, 120).p.setY(12), at(eye, 0, 3).p, at(eye + 30, sideAt(eye + 30) - 0.2, 1.75).p];
    return { pos: new THREE.CatmullRomCurve3(pos, false, "centripetal"), look: new THREE.CatmullRomCurve3(look, false, "centripetal") };
  })();

  function drawScene(t, shot = -1) {
    const dist = distAt(t), air = shot >= 0, dark = air && !!SHOTS[shot].dark;
    setPeople(t);
    const on = oncomingAt(t);
    meetTrain.visible = t > MEET_T - 14 && t < MEET_GONE && on + KISS_LENGTH < PORTAL2 - 30;
    placeBrown(t);
    for (const m of OTHERS) {
      const f = frontAt(m, t), r = f - m.dir * m.len;              // its nose and its tail
      m.train.visible = t >= m.vis[0] && t <= m.vis[1] && Math.abs(f - dist) < 1500 && Math.min(f, r) > 0 && Math.max(f, r) < LENGTH;
      if (m.train.visible) placeTrain(m.train, f, m.track, m.dir);
    }
    if (meetTrain.visible) placeTrain(meetTrain, on, otherAt, -1);
    // 0 in daylight, 1 underground: the eyes (and the lights) adjust as the cab passes each portal
    let under = air ? +dark : smooth((dist - (PORTAL - 14)) / 40) * (1 - smooth((dist - (PORTAL2 - 34)) / 40));
    if (!air && COVER[0] < COVER[1]) under = Math.max(under, 0.7 * smooth((dist - (COVER[0] - 12)) / 25) * (1 - smooth((dist - (COVER[1] - 10)) / 25)));   // under McCormick Place
    scene.fog.color.copy(HAZE).lerp(DARK, under);
    scene.fog.density = HAZE_DENSITY + (0.0105 - HAZE_DENSITY) * under;
    hemi.intensity = 1.5 * (1 - under); sun.intensity = 2.2 * (1 - under);
    head.intensity = 30 + 230 * under;
    camera.visible = !air; train.visible = air && !dark;         // the cab interior and the train's outside never share a frame
    const sbFront = southboundAt(t);
    southbound.visible = shot === 2 && sbFront + KISS_LENGTH < LENGTH - 5;
    if (southbound.visible) placeTrain(southbound, sbFront, otherAt, -1);
    airLamp.intensity = dark ? 30 : 0;
    if (air) {
      const S = SHOTS[shot];
      oncoming.visible = dark;
      airCam.fov = 40;
      if (shot === 0) {
        const u = (t - S.from) / (S.to - S.from);                 // a slow push in over the shot
        const q = at(PORTAL + 30 - 10 * u, -27 + 4 * u);
        airCam.position.set(q.p.x, 40 - 6 * u, q.p.z);
        const look = PORTAL - 34 + 10 * u;
        airCam.lookAt(at(look, sideAt(look), 1).p);
      } else if (dark) {
        // a few metres ahead of the nose and a little to one side (its right, over the middle of the bore), drawing slowly
        // closer; the lit train stands in for ours
        const u = (t - S.from) / (S.to - S.from), front = dist + NOSE, s = sideAt(front);
        airCam.fov = 46;
        airCam.position.copy(at(front + 10 - 3 * u, s + 2.4 - 0.6 * u, 2.9).p);
        airCam.lookAt(at(front - 1.5, s, 2.5).p);
        placeTrain(oncoming, front, sideAt, 1);
        oncoming.userData.glass.envMapRotation.y = dist / 26;     // the lamps' reflections cross the glass as the train moves
      } else if (SHOTS[shot].intro) {
        const u = ease(Math.min(1, t / (INTRO - 0.1)));
        airCam.fov = 40 + 18 * smooth(u * 1.4 - 0.4);           // widening toward the cab's, for the dissolve
        airCam.position.copy(INTRO_FLIGHT.pos.getPointAt(u));
        airCam.lookAt(INTRO_FLIGHT.look.getPointAt(u));
        scene.fog.density = HAZE_DENSITY * (0.55 + 0.45 * u);    // a clearer day from up high
      } else if (shot === 3) {
        // high over the east bank, a little south of the bridge, drifting toward it as the train crosses
        const u = (t - S.from) / (S.to - S.from), mid = (BRIDGE.d0 + BRIDGE.d1) / 2;
        airCam.fov = 42;
        airCam.position.copy(at(mid - 70 + 25 * u, 62 - 8 * u).p).setY(58 - 6 * u);
        airCam.lookAt(at(mid + 10, 0, 2).p);
      } else {
        const e = ease((t - PULL_FROM) / (PULL_TO - PULL_FROM));
        // beside the ramp, drifting from near the portal toward the platforms as the train comes by
        const g = smooth((dist - (PORTAL2 - 60)) / (CH.stop - (PORTAL2 - 60)));
        const low = at(PORTAL2 + 90 + 140 * g, -42 - 8 * g).p.setY(33 + 15 * g);
        const car = at(dist - 14, sideAt(dist - 14), 2).p;        // the middle of the leading car
        airCam.position.copy(low).lerp(HIGH, e);
        airCam.lookAt(car.lerp(HIGH_LOOK, e));
        scene.fog.density = HAZE_DENSITY * (1 - 0.45 * e);        // a clearer day from up here, so the Loop reads
      }
      airCam.updateProjectionMatrix();
      scene.background.copy(scene.fog.color);
      sky.position.set(airCam.position.x, 0, airCam.position.z);
      if (!dark) {
        placeTrain(train, Math.min(dist + NOSE, LENGTH - 2), sideAt, 1);
        const md = Math.min(dist + NOSE, LENGTH - 2) - TRAIN_LONG / 2, mid = at(md, sideAt(md)).p;   // the shadow box, centred on the train
        sun.target.position.copy(mid); sun.position.copy(mid).addScaledVector(SUN_DIR, 200); sun.target.updateMatrixWorld();
        const frame = Math.round(t * FPS);
        if (frame !== shadowFrame) { renderer.shadowMap.needsUpdate = true; shadowFrame = frame; }
      }
      shadowCatcher.visible = !dark;
      if (cubeShot) cubeShot(); else renderer.render(scene, airCam);   // (or the web page's 360 view: see cube)
      shadowCatcher.visible = false;
      return;
    }
    scene.background.copy(scene.fog.color);
    oncoming.visible = false;
    const eye = at(dist, sideAt(dist) - 0.45, 2.25);
    camera.position.copy(eye.p);
    camera.position.y += 0.006 * Math.sin(dist * 1.9) + 0.003 * Math.sin(dist * 9.7);   // a little life from the track
    camera.lookAt(at(dist + 30, sideAt(dist + 30) - 0.2, 1.75).p);
    camera.rotateOnWorldAxis(eye.tan, -bankAt(dist));             // the cab leans with the track
    sky.position.set(eye.p.x, 0, eye.p.z);
    renderer.render(scene, camera);
  }

  /* ---- minimap, top right: a follow-cam window on a baked street map
          (the telemetry-recap-video skill's plate), with the line, the
          stations, how far the train has come, and where it is now ---- */
  let drawMini = () => {}, drawOpening = () => {};
  // when the opening map does what (film seconds): fades in, shows today's terminals, draws the tunnel on, shrinks into the corner
  const OPENING = Object.fromEntries(Object.entries({ in: 0.2, today: 0.9, tunnel: 4.9, drawn: 7.4, shrink: 8.6, done: 9.9 }).map(([k, v]) => [k, INTRO + v]));
  if (mini) {
    const { img, geo } = mini, K = width / 1280;                 // sizes below are for a 1280-wide frame
    const M = geo.win_px, MS = 250 * K, PS = MS / M, PAD = 6 * K;   // the window is 250 px at 1280 wide, whatever the plate's own resolution
    const X = width - MS - 78 * K, Y = 40 * K;                    // clear of the cab's header and pillar
    const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070, RAD = Math.PI / 180;
    const platePx = (x, z) => {                                   // local metres -> plate pixels (Web Mercator)
      const lon = city.origin[0] + x / KX, lat = city.origin[1] - z / KY;
      const mx = lon * 20037508.342789244 / 180, my = Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) * 6378137;
      return [(mx - geo.x0) * geo.px_per_merc, (geo.y1 - my) * geo.px_per_merc];
    };
    const MSTEP = 6, line = [];
    for (let d = 0; d <= MAP_END; d += MSTEP) { const p = at(d).p; line.push(platePx(p.x, p.z)); }
    const pins = CALLS.map((S) => { const p = at(S.d).p; return platePx(p.x, p.z); });
    // Beyond the north portal the line joins the "Low Line" (the existing tracks) and carries on north to Clybourn.
    const lonLatPx = (lon, lat) => platePx((lon - city.origin[0]) * KX, (city.origin[1] - lat) * KY);
    const lowJoin = lonLatPx(-87.645813, 41.894225);              // "Low Line connection" in lines.js
    // The landmarks the ride passes, each labelled on the side away from the line: [name, lon, lat]
    const SIGHTS = [["Obama Center", -87.585879, 41.786262], ["Museum of Science and Industry", -87.5829253, 41.7905495],
      ["McCormick Place", -87.6155, 41.8524], ["Soldier Field", -87.6167, 41.8623], ["Bally's Chicago", -87.6448, 41.8953]]
      .map(([name, lon, lat]) => {
        const p = lonLatPx(lon, lat);
        let near = line[0];
        for (const q of line) if (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(near[0] - p[0], near[1] - p[1])) near = q;
        return { name, p, right: p[0] >= near[0] };
      });
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
    // Downtown Metra's four terminals (stop positions from Metra's GTFS), where its trains end their runs today.
    // Each label sits to the east of its dot, clear of the new line (which passes to the west, under Clinton St).
    const TERMINALS = [["Ogilvie", -87.6405556, 41.8822222, -4], ["Union Station", -87.6388889, 41.8788889, 2],
      ["LaSalle St", -87.6322222, 41.8763889, 4], ["Millennium", -87.6230556, 41.8841667, 0]]
      .map(([name, lon, lat, dy]) => ({ name, p: lonLatPx(lon, lat), dy, onTunnel: name === "Ogilvie" || name === "Union Station" }));
    const iTun0 = Math.round(RAMP_START / MSTEP), iTun1 = Math.min(Math.round(RAMP_END / MSTEP), line.length - 1);   // the new piece: ramp to ramp
    // The window onto the plate the corner minimap shows: MS square, the train in the middle of it.
    const follow = (dist) => {
      const f = Math.min(dist / MSTEP, line.length - 1.001), i = Math.floor(f), u = f - i;
      const cx = line[i][0] + (line[i + 1][0] - line[i][0]) * u, cy = line[i][1] + (line[i + 1][1] - line[i][1]) * u;
      return { sx: Math.min(Math.max(cx - M / 2, 0), geo.w - M), sy: Math.min(Math.max(cy - M / 2, 0), geo.h - M), sw: M, sh: M, x: X, y: Y, w: MS, h: MS };
    };
    // The plate's window v.sx, sy, sw, sh drawn into the frame at v.x, y, w, h. Opacities in `o`: route, the
    // minimap's own line, stations and progress; existing, the tracks the line joins at each end (the opening
    // map); tunnel, how much of the new tunnel is drawn on, bold (0..1); terminals, how many of the four (0..4).
    const drawMap = (v, dist, o) => {
      const { alpha = 1, route = 1, existing = 0, tunnel = 0, terminals = 0, xfer = 0 } = o;
      const sx = (p) => v.x + (p[0] - v.sx) * v.w / v.sw, sy = (p) => v.y + (p[1] - v.sy) * v.h / v.sh;
      const f = Math.min(dist / MSTEP, line.length - 1.001), i = Math.floor(f), u = f - i;
      const cx = line[i][0] + (line[i + 1][0] - line[i][0]) * u, cy = line[i][1] + (line[i + 1][1] - line[i][1]) * u;
      const path = (pts) => { ctx.beginPath(); pts.forEach((q, k) => { if (k) ctx.lineTo(sx(q), sy(q)); else ctx.moveTo(sx(q), sy(q)); }); };
      const stroke = (color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w * K; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); };
      const label = (text, x, y, align = "left", size = 11, color = "#2c3e50") => {
        ctx.font = `700 ${size * K}px Helvetica, Arial, sans-serif`; ctx.textAlign = align; ctx.textBaseline = "middle";
        ctx.lineWidth = 3.5 * K; ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineJoin = "round";
        ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
      };
      const dot = (q, fill, ring, r = 6) => {
        ctx.beginPath(); ctx.arc(sx(q), sy(q), r * K, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2.6 * K; ctx.strokeStyle = ring; ctx.stroke();
      };
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 14 * K; ctx.shadowOffsetY = 3 * K;
      ctx.fillStyle = "rgba(255,255,255,0.93)"; rr(v.x - PAD, v.y - PAD, v.w + PAD * 2, v.h + PAD * 2, 22 * K); ctx.fill();
      ctx.shadowColor = "transparent";
      rr(v.x, v.y, v.w, v.h, 16 * K); ctx.clip();
      ctx.imageSmoothingQuality = "high";                         // above 1080p the plate is enlarged
      ctx.drawImage(img, v.sx, v.sy, v.sw, v.sh, v.x, v.y, v.w, v.h);
      if (existing > 0) {                                         // the Metra Electric and the Low Line, which the tunnel joins
        ctx.globalAlpha = alpha * existing;
        for (const pts of [line.slice(0, iTun0 + 1), line.slice(iTun1)]) {
          path(pts); stroke("rgba(255,255,255,0.9)", 7); path(pts); stroke("rgba(84,104,118,0.85)", 3.5);
        }
      }
      if (route > 0) {
        ctx.globalAlpha = alpha * route;
        path(line); stroke("rgba(255,255,255,0.9)", 7);           // the whole line: a light casing...
        path(line); stroke("rgba(84,104,118,0.85)", 3.5);         // ...and a grey line
        path([...line.slice(0, i + 1), [cx, cy]]); stroke("#0B7285", 5.5);   // travelled so far, in CrossTowner teal
        for (const S of SIGHTS) {                                  // landmarks: an amber diamond and its name
          const x = sx(S.p), y = sy(S.p), r = 5.5 * K;
          if (x < v.x - 150 * K || x > v.x + v.w + 150 * K || y < v.y - 20 * K || y > v.y + v.h + 20 * K) continue;
          ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath();
          ctx.fillStyle = "#d9822b"; ctx.fill(); ctx.lineWidth = 2 * K; ctx.strokeStyle = "#fff"; ctx.stroke();
          ctx.font = `700 ${10.5 * K}px Helvetica, Arial, sans-serif`;
          const tw = ctx.measureText(S.name).width;                 // (below it instead, kept inside the window, if it would run off)
          const fits = S.right ? x + 9 * K + tw < v.x + v.w - 6 * K : x - 9 * K - tw > v.x + 6 * K;
          if (fits) label(S.name, x + (S.right ? 9 : -9) * K, y, S.right ? "left" : "right", 10.5, "#8a4b0f");
          else label(S.name, Math.min(Math.max(x, v.x + 6 * K + tw / 2), v.x + v.w - 6 * K - tw / 2), y + 13 * K, "center", 10.5, "#8a4b0f");
        }
        for (const p of pins) dot(p, "#fff", "#2c3e50");          // stations
        {                                                          // where the new line meets the Low Line
          const jx = sx(lowJoin), jy = sy(lowJoin);
          ctx.beginPath(); ctx.moveTo(jx - 7 * K, jy - 5 * K); ctx.lineTo(jx + 7 * K, jy + 5 * K);
          ctx.lineWidth = 3 * K; ctx.strokeStyle = "#2c3e50"; ctx.lineCap = "round"; ctx.stroke();
          label("Low Line", jx + 13 * K, jy + 4 * K);
        }
      }
      if (tunnel > 0) {                                           // the new tunnel, drawn on from its south end
        const n = iTun0 + (iTun1 - iTun0) * Math.min(tunnel, 1), k = Math.floor(n), pts = line.slice(iTun0, k + 1);
        if (k < iTun1) pts.push([line[k][0] + (line[k + 1][0] - line[k][0]) * (n - k), line[k][1] + (line[k + 1][1] - line[k][1]) * (n - k)]);
        ctx.globalAlpha = alpha * Math.min(1, o.tunnelAlpha ?? 1);
        path(pts); stroke("rgba(255,255,255,0.95)", 12); path(pts); stroke("#0B7285", 7.5);
        const tag = smooth((tunnel - 0.75) / 0.25);                 // and its name, once it is most of the way there
        if (tag > 0) {
          const q = line[Math.round(iTun0 + (iTun1 - iTun0) * 0.55)];
          ctx.globalAlpha = alpha * tag * Math.min(1, o.tunnelAlpha ?? 1);
          label("New tunnel", sx(q) - 14 * K, sy(q), "right", 15, "#0B7285");
        }
      }
      TERMINALS.forEach((T, k) => {                               // today's terminals, one after another
        const a = Math.min(Math.max(terminals - k, 0), 1);
        if (a <= 0) return;
        const x = T.onTunnel ? xfer : 0;                          // with the tunnel drawn, the two it passes become transfers
        const tx = sx(T.p), ty = sy(T.p), lx = tx + 12 * K, ly = ty + T.dy * K;
        if (x < 1) {
          ctx.globalAlpha = alpha * a * (1 - x) * (o.terminalAlpha ?? 1);
          dot(T.p, "#f72f3a", "#fff", 6.5);
          ctx.fillStyle = "#fff"; ctx.fillRect(tx - 3.2 * K, ty - 1.1 * K, 6.4 * K, 2.2 * K);   // a "no through" bar
          label(T.name, lx, ly, "left", 13, "#b3141d");
        }
        if (x > 0) {                                              // a transfer: a white disc in a teal ring, two arrows passing
          ctx.globalAlpha = alpha * a * x * (o.transferAlpha ?? 1);
          dot(T.p, "#fff", "#0B7285", 7.5);
          ctx.strokeStyle = "#0B7285"; ctx.fillStyle = "#0B7285"; ctx.lineWidth = 1.6 * K; ctx.lineCap = "round";
          for (const [y, d] of [[-2.2, 1], [2.2, -1]]) {
            const y0 = ty + y * K, e = tx + d * 3.6 * K;
            ctx.beginPath(); ctx.moveTo(tx - d * 3.6 * K, y0); ctx.lineTo(e, y0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(e + d * 0.8 * K, y0); ctx.lineTo(e - d * 1.8 * K, y0 - 1.7 * K); ctx.lineTo(e - d * 1.8 * K, y0 + 1.7 * K); ctx.closePath(); ctx.fill();
          }
          label(T.name, lx + 2 * K, ly, "left", 13, "#0B7285");
        }
      });
      ctx.globalAlpha = alpha;
      const tx = sx([cx, cy]), ty = sy([cx, cy]);                 // the train
      ctx.beginPath(); ctx.arc(tx, ty, 17 * K, 0, Math.PI * 2); ctx.fillStyle = "rgba(214,51,108,0.28)"; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 8.5 * K, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      ctx.lineWidth = 4.5 * K; ctx.strokeStyle = "#d6336c"; ctx.stroke();
      ctx.restore();
    };
    drawMini = (dist) => drawMap(follow(dist), dist, {});
    // The opening: the whole plate, large, on the right. First today's four terminals, where every Metra train
    // stops and turns back; then the new tunnel draws on between the tracks it joins; then the map shrinks
    // into the corner, onto the minimap's own window, and becomes it.
    drawOpening = (t) => {
      // the part of the plate around the tunnel (geo.opening), not all of it, which runs on north to Clybourn
      const o = geo.opening || geo, sx0 = (o.x0 - geo.x0) * geo.px_per_merc, sy0 = (geo.y1 - o.y1) * geo.px_per_merc;
      const sw0 = (o.x1 - o.x0) * geo.px_per_merc, sh0 = (o.y1 - o.y0) * geo.px_per_merc;
      const dist = distAt(t), H = 600 * K, W = H * sw0 / sh0;
      const big = { sx: sx0, sy: sy0, sw: sw0, sh: sh0, x: width - W - 70 * K, y: 56 * K, w: W, h: H };
      // (with no minimap to become, it fades away where it would have shrunk into one)
      const fin = follow(dist), m = MINIMAP ? ease((t - OPENING.shrink) / (OPENING.done - OPENING.shrink)) : 0;
      const fade = MINIMAP ? 1 : 1 - smooth((t - OPENING.shrink) / (OPENING.done - OPENING.shrink));
      const v = {};
      for (const key in big) v[key] = big[key] + (fin[key] - big[key]) * m;
      const tun = smooth((t - OPENING.tunnel) / 0.6);             // 0 today, 1 with the tunnel
      drawMap(v, dist, {
        alpha: smooth((t - OPENING.in) / 0.5) * fade,
        route: m, existing: tun * (1 - m),
        tunnel: Math.max(0, (t - OPENING.tunnel) / (OPENING.drawn - OPENING.tunnel)), tunnelAlpha: 1 - m,
        terminals: Math.max(0, (t - OPENING.today) / 0.32), terminalAlpha: (1 - 0.45 * tun) * (1 - m),
        xfer: smooth((t - OPENING.drawn) / 0.5), transferAlpha: 1 - m,     // Union Station and Ogilvie, once the tunnel is drawn
      });
    };
  }

  /* ---- the story, for anyone meeting the idea for the first time: cards on the left, under the captions,
          each timed to something on screen (a stop, a shot) rather than to a fixed second. Facts from the
          site: the homepage, the popular-trips page and the O'Hare workforce analysis ---- */
  const TEAL = "#15a3bb", RED = "#f72f3a", GOLD = "#f4a300";
  const WHOLE_RIDE = Math.round((clockAt(arrive(CLY)) - clockAt(arrive(M18)) - realDwellOf(M18)) / 60);   // minutes, leaving 18th to arriving at Clybourn
  const STORY = [
    // the opening map's two halves
    { from: OPENING.today - 0.2, to: OPENING.tunnel, kicker: "TODAY", color: RED, keep: true,
      text: "Metra trains end their runs at four downtown terminals. To cross the region, you change trains." },
    { from: OPENING.tunnel + 0.1, to: OPENING.done, kicker: "WITH THE TUNNEL", color: TEAL, keep: true,
      text: "A new tunnel links the lines, so trains run through downtown. This X1 runs from South Chicago to Highland Park." },
    // and that it's a proposal (cards marked `keep` stay when the rest are left out: see drawStory)
    { from: OPENING.done + 0.3, to: OPENING.done + 6.3, kicker: "A PROPOSAL", color: GOLD, keep: true,
      text: "The CrossTowner and its new tunnel are proposed, not built. This ride shows how they could work." },
    // the Metra Electric: 59th, Hyde Park, and where the X1 leaves it
    { from: 0.9, to: INTRO - 0.7, kicker: "THE OBAMA CENTER", color: TEAL,      // over the opening shot, as it passes
      text: "59th St, where this ride begins, is the Metra stop closest to the Obama Presidential Center in Jackson Park." },
    { from: arrive(SOUTH_STOPS[2]) - 1.5, to: arrive(SOUTH_STOPS[2]) + 4.5, kicker: "TODAY'S TRACKS", color: TEAL,
      text: "From Hyde Park to 18th St, the X1 runs on the Metra Electric, as it runs today, stopping where its trains stop." },
    { from: arrive(M18) + 0.4, to: arrive(M18) + DWELL + 0.6, kicker: "INTO THE TUNNEL", color: TEAL,
      text: "Just past 18th St, the X1 leaves the Metra Electric for a new tunnel under Roosevelt Rd and Clinton St." },
    { from: SHOTS[0].from + 0.3, to: SHOTS[0].from + 6.3, kicker: "PROPOSED", color: GOLD,
      text: "This tunnel doesn't exist yet. The Clinton\u2013Roosevelt Connector would run under Roosevelt Rd and Clinton St." },
    { from: arrive(STN[0]) + 0.4, to: arrive(STN[0]) + DWELL + 0.4, kicker: "NO TRANSFER", color: TEAL,
      text: "Riders from the South Side would reach the West Loop without changing trains." },
    { from: arrive(STN[0]) + DWELL + 2.5, to: arrive(STN[0]) + DWELL + 10.5, kicker: "REGIONAL RAIL", color: TEAL,
      text: "Frequent, all-day trains on Metra's tracks: the missing middle between the \u2018L\u2019 and commuter rail." },
    { from: arrive(STN[2]) + 0.4, to: SHOTS[1].from + 0.2, kicker: "UNION STATION", color: TEAL,
      text: "Today, Metra trains here end their runs and turn back. With the tunnel, they could run through." },
    { from: SHOTS[1].from + 0.4, to: SHOTS[1].to + 1.6, kicker: "SIX ROUTES", color: TEAL,
      text: "X1 to X4 would share this new tunnel; X5 and X6 would run through Union Station. All six would use mostly existing Metra tracks." },
    { from: arrive(STN[3]) + DWELL + 4.0, to: arrive(STN[3]) + DWELL + 12.0, kicker: "ONE TRIP, COMPARED", color: GOLD,
      trip: { from: "Rogers Park", to: "McCormick Place", today: 63, with: 39 }, note: "CrossTowner Trip Planner" },
    { from: PULL_FROM + 0.6, to: PULL_FROM + 6.6, kicker: "O'HARE JOBS", color: GOLD,
      text: "About 48,500 more workers could reach O'Hare within an hour by transit.", note: "Analysis of U.S. Census LODES 2023 jobs data" },
    { from: HERO_END + 0.3, to: HERO_END + 7.3, kicker: "TODAY'S TRACKS", color: TEAL,
      text: "North of Chicago/Halsted, the X1 would join Metra's Union Pacific North tracks, as they run today." },
    { from: arrive(NORTH_STOPS[1]) - 2.0, to: arrive(NORTH_STOPS[1]) + 4.5, kicker: "ON THE LEFT", color: TEAL,
      text: "Trains on the UP North keep to the left-hand track, a holdover from the Chicago & North Western, which built the line." },
    // 18th (by Soldier Field) to Clybourn (by Foundry Park), on the film's own clock, against today's fastest trip in the
    // CrossTowner Trip Planner (8 AM, two transfers)
    { from: arrive(CLY) + 0.4, to: Math.min(arrive(CLY) + DWELL + 3.4, SHOTS[3].from - 0.2), kicker: WHOLE_RIDE < 20 ? "UNDER 20 MINUTES" : "THE WHOLE RIDE", color: GOLD,
      trip: { from: "Foundry Park", to: "Soldier Field", today: 51, with: WHOLE_RIDE },
      note: "Today: Trip Planner, 2 transfers \u00b7 CrossTowner: this ride" },
    // The ending, as the train pulls out of Rogers Park: the whole trip (the Trip Planner's 8 AM figures, station to
    // station), one seat, campus to campus, and jobs (analysis/r5r_jobs_59th.R: 1,122,206 today, 1,277,235 with CrossTowner)
    ...((e) => [
      { from: e, to: e + 5.4, kicker: "HYDE PARK TO ROGERS PARK", color: GOLD,
        trip: { from: "59th St", to: "Rogers Park", today: 78, with: 47 },
        note: "CrossTowner Trip Planner, 8 AM, station to station" },
      { from: e + 5.6, to: e + 10.2, kicker: "ONE SEAT", color: TEAL,
        text: "No transfer needed! Today the same trip takes the Metra Electric, a 10-minute walk, and the Red Line." },
      { from: e + 10.4, to: e + 15.0, kicker: "CAMPUS TO CAMPUS", color: TEAL,
        text: "From the University of Chicago to Rogers Park, home of Loyola University, in one ride." },
      { from: e + 15.2, to: e + 20.2, kicker: "MORE JOBS IN REACH", color: GOLD,
        text: "About 155,000 more jobs within an hour of 59th St by transit.", note: "U.S. Census LODES 2023 jobs \u00b7 8 AM departures" },
      { from: e + 20.4, to: DURATION - END_CREDITS - 1.0, cta: true },
    ])(arrive(LAST) + 0.4),
  ];
  // (keepOnly: just the cards marked `keep`, the opening's and the note that it's a proposal, for a film without the rest)
  const drawStory = (t, keepOnly = false) => {
    const card = STORY.find((q) => t >= q.from && t < q.to && (!keepOnly || q.keep));
    if (!card) return;
    const K = width / 1280 * 1.3, x0 = 48 * K, y = 186 * K, PAD = 15 * K, SANS = "Helvetica, Arial, sans-serif";
    const a = Math.min(1, (t - card.from) / 0.35, (card.to - t) / 0.35), slide = (1 - smooth((t - card.from) / 0.45)) * -22 * K, x = x0 + slide;
    ctx.save();
    ctx.globalAlpha = Math.max(0, a); ctx.textBaseline = "middle"; ctx.textAlign = "left";
    if (card.trip) {                                              // a trip, today and with CrossTowner: two bars, and the time it saves
      const { from, to, today, with: withCT } = card.trip, saved = today - withCT, BAR = 250 * K, w = 470 * K, h = 192 * K;
      const grow = smooth((t - card.from - 0.3) / 0.9);            // the bars draw out from the left
      ctx.fillStyle = "rgba(8,14,18,0.88)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14 * K); ctx.fill();
      ctx.fillStyle = card.color; ctx.beginPath(); ctx.roundRect(x, y, 6 * K, h, [14 * K, 0, 0, 14 * K]); ctx.fill();
      const L = x + PAD + 8 * K;
      ctx.letterSpacing = `${2 * K}px`; ctx.font = `700 ${12 * K}px ${SANS}`; ctx.fillStyle = card.color; ctx.fillText(card.kicker, L, y + 22 * K); ctx.letterSpacing = "0px";
      ctx.font = `700 ${19 * K}px ${SANS}`; ctx.fillStyle = "#fff"; ctx.fillText(`${from} \u2192 ${to}`, L, y + 50 * K);
      const bar = (row, label, min, color, bold) => {
        const by = y + (80 + row * 34) * K, bw = BAR * min / today * grow;
        ctx.font = `600 ${14 * K}px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillText(label, L, by);
        ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(L + 92 * K, by - 10 * K, Math.max(bw, 1), 20 * K, 10 * K); ctx.fill();
        ctx.font = `${bold ? 800 : 700} ${16 * K}px ${SANS}`; ctx.fillStyle = "#fff"; ctx.fillText(`${min} min`, L + 92 * K + bw + 10 * K, by + K);
      };
      bar(0, "Today", today, "#6b7a82", false);
      bar(1, "CrossTowner", withCT, TEAL, true);
      {                                                            // the time saved: a bright green pill with a tick, popping in once the bars are out
        const pop = smooth((t - card.from - 1.1) / 0.35), sc = 0.85 + 0.15 * pop, label = `${saved} minutes faster`;
        ctx.globalAlpha = Math.max(0, a) * pop;
        ctx.font = `800 ${18 * K}px ${SANS}`;
        const pw = ctx.measureText(label).width + 52 * K, ph = 30 * K, px = L - 2 * K, py = y + 150 * K - ph / 2;
        ctx.save(); ctx.translate(px, py + ph / 2); ctx.scale(sc, sc); ctx.translate(-px, -(py + ph / 2));
        ctx.shadowColor = "rgba(53,208,127,0.55)"; ctx.shadowBlur = 16 * K;
        ctx.fillStyle = "#3ee08a"; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, ph / 2); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#05331a"; ctx.lineWidth = 3.2 * K; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(px + 13 * K, py + ph / 2); ctx.lineTo(px + 19 * K, py + ph / 2 + 6 * K); ctx.lineTo(px + 30 * K, py + ph / 2 - 6 * K); ctx.stroke();
        ctx.fillStyle = "#05331a"; ctx.fillText(label, px + 38 * K, py + ph / 2 + K);
        ctx.restore();
      }
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = `500 ${12 * K}px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillText(card.note, L, y + 177 * K);
      ctx.restore();
      return;
    }
    if (card.cta) {                                               // the call to action, bigger
      const url = "tunnel.stevevance.net";
      ctx.font = `700 ${16 * K}px ${SANS}`; const wu = ctx.measureText(url).width + 34 * K;
      ctx.font = `800 ${34 * K}px ${SANS}`; const wt = ctx.measureText("Plan your own trip").width;
      const w = Math.max(wt, wu) + PAD * 2 + 8 * K, h = 150 * K;
      ctx.fillStyle = "rgba(8,14,18,0.88)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 16 * K); ctx.fill();
      ctx.fillStyle = TEAL; ctx.beginPath(); ctx.roundRect(x, y, 6 * K, h, [16 * K, 0, 0, 16 * K]); ctx.fill();
      ctx.letterSpacing = `${2 * K}px`; ctx.font = `700 ${12 * K}px ${SANS}`; ctx.fillStyle = TEAL; ctx.fillText("YOUR TURN", x + PAD + 8 * K, y + 26 * K); ctx.letterSpacing = "0px";
      ctx.font = `800 ${34 * K}px ${SANS}`; ctx.fillStyle = "#fff"; ctx.fillText("Plan your own trip", x + PAD + 6 * K, y + 66 * K);
      const hu = 36 * K, yu = y + 112 * K;
      ctx.fillStyle = "#a8dcff"; ctx.beginPath(); ctx.roundRect(x + PAD + 8 * K, yu - hu / 2, wu, hu, hu / 2); ctx.fill();
      ctx.font = `700 ${16 * K}px ${SANS}`; ctx.fillStyle = "#06202e"; ctx.fillText(url, x + PAD + 8 * K + 17 * K, yu + K);
      ctx.restore();
      return;
    }
    const MAXW = 390 * K, LINE = 25 * K;
    ctx.font = `600 ${19 * K}px ${SANS}`;
    const lines = [];
    for (const word of card.text.split(" ")) {
      const tryLine = lines.length ? lines[lines.length - 1] + " " + word : word;
      if (lines.length && ctx.measureText(tryLine).width <= MAXW) lines[lines.length - 1] = tryLine; else lines.push(word);
    }
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + PAD * 2 + 8 * K;
    const h = 30 * K + lines.length * LINE + (card.note ? 22 * K : 0) + PAD;
    ctx.fillStyle = "rgba(8,14,18,0.86)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14 * K); ctx.fill();
    ctx.fillStyle = card.color; ctx.beginPath(); ctx.roundRect(x, y, 6 * K, h, [14 * K, 0, 0, 14 * K]); ctx.fill();
    ctx.letterSpacing = `${2 * K}px`; ctx.font = `700 ${12 * K}px ${SANS}`; ctx.fillStyle = card.color;
    ctx.fillText(card.kicker, x + PAD + 8 * K, y + 22 * K); ctx.letterSpacing = "0px";
    ctx.font = `600 ${19 * K}px ${SANS}`; ctx.fillStyle = "#fff";
    lines.forEach((l, i) => ctx.fillText(l, x + PAD + 8 * K, y + 30 * K + LINE * (i + 0.5) + 4 * K));
    if (card.note) { ctx.font = `500 ${12 * K}px ${SANS}`; ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillText(card.note, x + PAD + 8 * K, y + 30 * K + LINE * lines.length + 16 * K); }
    ctx.restore();
  };

  /* ---- top left: how much faster than the timetable the film runs, and the timetable's clock ---- */
  // Open captions for the announcements, under the badge: what is being said, a sentence at a time.
  const drawCaption = (t) => {
    const cap = captions && captions.find((q) => t >= q.start && t < q.end);
    if (!cap) return;
    // the pills are drawn at the 1280-wide sizes (smaller than the story cards), on the cards' left margin and top inset
    const M = width / 1280, K = M * 0.95, x = 62.4 * M, y = 44 * M + 34 * K + 10 * K, MAXW = 460 * K, LINE = 23 * K, PAD = 13 * K;
    ctx.save();
    ctx.font = `600 ${17 * K}px Helvetica, Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const lines = [];
    for (const word of cap.text.split(" ")) {
      const tryLine = lines.length ? lines[lines.length - 1] + " " + word : word;
      if (lines.length && ctx.measureText(tryLine).width <= MAXW) lines[lines.length - 1] = tryLine; else lines.push(word);
    }
    const ICON = 30 * K;                                          // room for the speaker, before the words
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + PAD * 2 + ICON, h = lines.length * LINE + PAD * 1.3;
    ctx.globalAlpha = Math.min(1, (t - cap.start) / 0.12, (cap.end - t) / 0.12);
    ctx.fillStyle = "rgba(8,14,18,0.82)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14 * K); ctx.fill();
    {                                                             // a speaker, sounding: it is the announcer talking
      const sx = x + PAD + 1 * K, sy = y + PAD * 0.65 + LINE * 0.5 + K;
      ctx.fillStyle = "#7fd3e0";
      ctx.beginPath(); ctx.moveTo(sx, sy - 3.5 * K); ctx.lineTo(sx + 4 * K, sy - 3.5 * K); ctx.lineTo(sx + 10 * K, sy - 8.5 * K);
      ctx.lineTo(sx + 10 * K, sy + 8.5 * K); ctx.lineTo(sx + 4 * K, sy + 3.5 * K); ctx.lineTo(sx, sy + 3.5 * K); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#7fd3e0"; ctx.lineWidth = 2 * K; ctx.lineCap = "round";
      for (const r of [5, 9.5]) { ctx.beginPath(); ctx.arc(sx + 10 * K, sy, r * K, -0.85, 0.85); ctx.stroke(); }
    }
    ctx.fillStyle = "#fff";
    lines.forEach((l, i) => ctx.fillText(l, x + PAD + ICON, y + PAD * 0.65 + LINE * (i + 0.5) + K));
    ctx.restore();
  };
  const drawBadge = (t) => {
    const M = width / 1280, K = M * 0.95, x = 62.4 * M, y = 44 * M, h = 34 * K;
    const c = Math.max(0, clockAt(Math.min(t, RIDE))), hh = Math.floor(c / 3600) % 24, mm = Math.floor(c / 60) % 60, ss = Math.floor(c) % 60;
    const clock = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
    ctx.save();
    ctx.font = `700 ${16 * K}px Helvetica, Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const a = `${Math.round(speedupAt(distAt(Math.min(t, RIDE))))}\u00d7 speed`, wa = ctx.measureText(`${SPEEDUP_ENDS}\u00d7 speed`).width;
    ctx.font = `500 ${15 * K}px Helvetica, Arial, sans-serif`;
    const wb = ctx.measureText("00:00:00 AM").width, w = 34 * K + wa + 14 * K + wb + 16 * K;
    ctx.fillStyle = "rgba(8,14,18,0.78)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = "#35d07f";                                    // a fast-forward mark
    for (const dx of [0, 9 * K]) { ctx.beginPath(); ctx.moveTo(x + 13 * K + dx, y + 10 * K); ctx.lineTo(x + 22 * K + dx, y + h / 2); ctx.lineTo(x + 13 * K + dx, y + h - 10 * K); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = `700 ${16 * K}px Helvetica, Arial, sans-serif`; ctx.fillText(a, x + 38 * K, y + h / 2 + K);
    // while a stop's dissolve skips ahead, the clock lights up and a second pill says what the stop really takes
    // (only where the dissolve skips at least a second; the stop's own time on the pill)
    const skipOf = (q) => { const m = q.t0 + q.T / 2; return q.real - q.k * q.T < 1 ? 0 : smooth((t - (m - q.xf / 2 - 0.3)) / 0.3) * (1 - smooth((t - (m + q.xf / 2 + 0.5)) / 0.4)); };
    const skipStop = stopPhases.reduce((a, q) => (skipOf(q) > skipOf(a) ? q : a), stopPhases[0]), skipping = skipOf(skipStop);
    ctx.fillStyle = skipping > 0.5 ? "#f4c400" : "rgba(255,255,255,0.78)"; ctx.font = `${skipping > 0.5 ? 700 : 500} ${15 * K}px Helvetica, Arial, sans-serif`; ctx.fillText(clock, x + 38 * K + wa + 14 * K, y + h / 2 + K);
    if (skipping > 0) {
      const label = `${skipStop.real}-second stop`, y2 = y, x2 = x + w + 10 * K;
      ctx.globalAlpha = skipping; ctx.font = `700 ${15 * K}px Helvetica, Arial, sans-serif`;
      const w2 = 46 * K + ctx.measureText(label).width + 18 * K;
      ctx.fillStyle = "#f4c400"; ctx.beginPath(); ctx.roundRect(x2, y2, w2, h, h / 2); ctx.fill();
      ctx.fillStyle = "#1b1b1d";                                  // a skip-ahead mark: two arrows and a bar
      for (const dx of [0, 9 * K]) { ctx.beginPath(); ctx.moveTo(x2 + 13 * K + dx, y2 + 10 * K); ctx.lineTo(x2 + 22 * K + dx, y2 + h / 2); ctx.lineTo(x2 + 13 * K + dx, y2 + h - 10 * K); ctx.fill(); }
      ctx.fillRect(x2 + 32 * K, y2 + 10 * K, 2.5 * K, h - 20 * K);
      ctx.fillText(label, x2 + 44 * K, y2 + h / 2 + K);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  };

  // One output frame = SUBFRAMES renders spread over the shutter time, averaged.
  const airCanvas = document.createElement("canvas");
  airCanvas.width = width; airCanvas.height = height;
  const airCtx = airCanvas.getContext("2d");
  const laterCanvas = document.createElement("canvas");
  laterCanvas.width = width; laterCanvas.height = height;
  const laterCtx = laterCanvas.getContext("2d");
  function render(t) {
    const p = phaseAt(t), braking = !!p.run && speedAt(t + 0.05) < speedAt(t) - 0.02;
    // the doors open just after the train stops and close a moment before it leaves
    const doorsOpen = !!p.station && t - p.t0 > 0.3 && t - p.t0 < p.T - 1.0;
    drawDisplay(realSpeedAt(t) * 2.23694, distAt(t), p.station || null, doorsOpen);   // the real speed, not the film's
    lampBrake.material.color.setHex(braking ? 0xf4a300 : 0x3a3f42);
    lampPower.material.color.setHex(braking || p.station ? 0x3a3f42 : 0x35d07f);
    lampDoors.material.color.setHex(doorsOpen ? 0xf4c400 : 0x35d07f);
    const air = airWeight(t), shot = shotAt(t);
    // where the film runs faster than SPEEDUP, a shorter shutter, so a frame's blur (and the gap between its samples) is
    // no longer than at SPEEDUP: otherwise the overhead line's frames show as separate ghosts
    const shutter = SHUTTER * SPEEDUP / speedupAt(distAt(t));
    // and more samples where the train still moves more than ~0.3 m between them (at 79 mph and 8x, twice as many)
    const samples = Math.max(SUBFRAMES, Math.ceil(speedAt(t) * shutter / FPS / 0.3));
    const accumulate = (c, sh) => {
      for (let k = 0; k < samples; k++) {
        drawScene(t + ((k + 0.5) / samples - 0.5) * shutter / FPS, sh);
        c.globalAlpha = 1 / (k + 1);
        c.drawImage(gl, 0, 0);
      }
      c.globalAlpha = 1;
    };
    ctx.globalAlpha = 1;
    const xq = stopPhases.find((q) => Math.abs(t - (q.t0 + q.T / 2)) < q.xf / 2);   // in a stop's dissolve?
    // One view (the cab's, sh = -1, or a shot's) drawn into c; in a stop's dissolve, the same view a minute on is laid over it.
    const view = (c, sh) => {
      if (!xq) return accumulate(c, sh);
      peopleForce = false; accumulate(c, sh);
      peopleForce = true; accumulate(laterCtx, sh); peopleForce = null;
      c.globalAlpha = smooth((t - (xq.t0 + (xq.T - xq.xf) / 2)) / xq.xf); c.drawImage(laterCanvas, 0, 0); c.globalAlpha = 1;
    };
    if (air < 1) view(ctx, -1);
    if (air > 0) {                                                // dissolve to and from a shot from outside
      view(air < 1 ? airCtx : ctx, shot);
      if (air < 1) { ctx.globalAlpha = air; ctx.drawImage(airCanvas, 0, 0); ctx.globalAlpha = 1; }
    }
    // once the doors close at Rogers Park, the view dims under the ending's cards
    // (without the cards there's nothing over the ending to dim for)
    const dim = CARDS ? 0.45 * smooth((t - (arrive(LAST) + DWELL)) / 1.5) : 0;
    if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, width, height); }
    if (t < OPENING.done) drawOpening(t); else if (MINIMAP) drawMini(distAt(t));
    if (t > INTRO - INTRO_FADE) { ctx.save(); ctx.globalAlpha = smooth((t - (INTRO - INTRO_FADE)) / INTRO_FADE); drawBadge(t); ctx.restore(); }
    if (CAPTIONS) drawCaption(t);
    if (CARDS) drawStory(t); else if (!WEB) drawStory(t, true);
    // the end: fade to black over two seconds, then the credits
    const fade = smooth((t - (DURATION - END_CREDITS - 1.9)) / 2.0);
    if (fade > 0) {
      const K = width / 1280, credit = smooth((t - (DURATION - END_CREDITS)) / 0.6);
      ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, width, height);
      // Three sections, well apart, set on a left margin rather than centred, each sliding in in turn:
      // the campaign (name, site, logos to the right), who made the planner and this film, and the
      // credits for the voice and the map. The last two hang from a label column on the left.
      const tc = t - (DURATION - END_CREDITS), SANS = "Helvetica, Arial, sans-serif";
      const BLUE = "#a8dcff", RED = "#f72f3a";                  // the CrossTowner logo's own blue and red
      const LEFT = 96 * K, RIGHT = width - 96 * K, COL = 420 * K;   // margins, and where the content column starts
      const slide = (delay) => { const u = Math.min(Math.max((tc - delay) / 0.7, 0), 1); return 1 - (1 - u) ** 3; };   // 0..1, easing out
      const text = (str, x, y, font, color, spacing = 0) => {
        ctx.font = font; ctx.fillStyle = color; ctx.letterSpacing = `${spacing * K}px`; ctx.fillText(str, x, y); ctx.letterSpacing = "0px";
      };
      const rule = (y, delay, alpha) => {                          // a line drawn across from the left margin to the right
        const g = slide(delay), x1 = LEFT + (RIGHT - LEFT) * g;
        if (g <= 0) return;
        ctx.globalAlpha = credit * alpha * Math.min(1, g * 3);
        ctx.strokeStyle = BLUE; ctx.fillStyle = BLUE; ctx.lineWidth = 2.5 * K; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(LEFT, y * K); ctx.lineTo(x1, y * K); ctx.stroke();
      };
      // the tunnel, faintly, off to the right behind the logos: rings that keep coming, as they did all ride
      ctx.globalAlpha = credit; ctx.lineWidth = 1.5 * K;
      for (let i = 0; i < 9; i++) {
        const u = ((i + tc * 0.22) % 9) / 9, r = (30 + 900 * u * u) * K;
        ctx.strokeStyle = `rgba(159,216,255,${(0.12 * (1 - u) + 0.015) * Math.min(1, u * 4)})`;   // the smallest rings stay out of the logos' way
        ctx.beginPath(); ctx.ellipse(1062 * K, 214 * K, r, r * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.textBaseline = "middle";
      // 1. the campaign
      {
        const g = slide(0.1), dx = (g - 1) * 40 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("CrossTowner", LEFT - 4 * K + dx, 172 * K, `800 ${92 * K}px ${SANS}`, "#fff");
        text("#BuildTheTunnel", LEFT - 4 * K + dx, 268 * K, `800 ${92 * K}px ${SANS}`, RED);
        // the official site, as a button
        ctx.font = `700 ${27 * K}px ${SANS}`; const url = "buildthetunnelchicago.org", wu = ctx.measureText(url).width + 56 * K, hu = 52 * K;
        ctx.fillStyle = BLUE; ctx.beginPath(); ctx.roundRect(LEFT + dx, 356 * K - hu / 2, wu, hu, hu / 2); ctx.fill();
        text(url, LEFT + 28 * K + dx, 357 * K, `700 ${27 * K}px ${SANS}`, "#06202e");
        if (logos) {                                               // the campaign's own marks, from buildthetunnelchicago.org, on the right margin
          const gl = slide(0.45), H = 104 * K, cap = `500 ${13 * K}px ${SANS}`;
          ctx.globalAlpha = credit * gl; ctx.textAlign = "right";
          [[logos.crosstowner, "CrossTowner Regional Rail", 150], [logos.starline, "Star:Line Chicago", 310]].forEach(([im, name, y]) => {
            const w = H * im.width / im.height, x = RIGHT - w + (1 - gl) * 40 * K;
            ctx.drawImage(im, x, y * K - H / 2, w, H);
            text(name, RIGHT + (1 - gl) * 40 * K, y * K + H / 2 + 16 * K, cap, "rgba(255,255,255,0.72)");
          });
        }
      }
      rule(432, 0.9, 1);
      // 2. who made the planner and the film
      {
        const g = slide(1.2), dx = (g - 1) * 30 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("TRIP PLANNER + VIDEO", LEFT + dx, 474 * K, `600 ${13 * K}px ${SANS}`, "rgba(255,255,255,0.62)", 2.6);
        text("Steven Vance", COL + dx, 470 * K, `700 ${26 * K}px ${SANS}`, "#fff");
        text("tunnel.stevevance.net", COL + dx, 503 * K, `600 ${18 * K}px ${SANS}`, BLUE);
      }
      rule(542, 1.8, 0.45);
      // 3. what the film is made from: the voice, the maps and data, the software, and what its look draws on
      {
        const g = slide(2.1), dx = (g - 1) * 30 * K;
        ctx.globalAlpha = credit * g; ctx.textAlign = "left";
        text("CREDITS", LEFT + dx, 580 * K, `600 ${13 * K}px ${SANS}`, "rgba(255,255,255,0.62)", 2.6);
        const font = `400 ${13.5 * K}px ${SANS}`, dim = "rgba(255,255,255,0.7)";
        [["Announcements: Apple text to speech (macOS voice \u201cZoe\u201d)",
          "Buildings, streets and maps \u00a9 OpenStreetMap contributors",
          "Drawn with three.js; preview tooling: HyperFrames",
          "Trip times: CrossTowner Trip Planner (Conveyal R5)"],
         ["Station art: Art Institute of Chicago (public domain)",
          "Train look inspired by Acrobatic Train (x282665.com)",
          "Jobs: U.S. Census LODES 2023; stations: Metra GTFS",
          "Music: \u201cThis Time With Soul!\u201d by laerlooper, CC BY 2.5"]]
          .forEach((lines, c) => lines.forEach((l, i) => text(l, (c ? 810 : COL / K) * K + dx, (580 + i * 24) * K, font, dim)));
      }
      ctx.textAlign = "center";
      ctx.globalAlpha = 1;
    }
  }
  // Still views of the people at one station, for approving them without rendering the film:
  // close on the wheelchair user, the stroller, the bike, a family, a traveller and a couple, then
  // each platform from the track, then the way out (tools/stills.mjs p<i>@<station>); 15 to 18: close on four of
  // the crowd, one at a time.
  const previewCam = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
  scene.add(previewCam);
  function preview(i, station = 0) {
    const S = ALL[station], spots = peopleSpots.filter((o) => o.station === station);
    if (S.outdoor) { scene.fog.color.copy(HAZE); scene.fog.density = HAZE_DENSITY; scene.background.copy(HAZE); hemi.intensity = 1.5; sun.intensity = 2.2; }
    else { scene.fog.color.copy(DARK); scene.fog.density = 0.0105; scene.background.copy(DARK); hemi.intensity = 0; sun.intensity = 0; }
    camera.visible = false; train.visible = false; oncoming.visible = false; meetTrain.visible = false;
    const close = (kind, n = 0) => {
      const o = spots.filter((q) => q.kind === kind)[n], sg = Math.sign(o.side), q = at(o.d + 2.1, o.side - sg * 2.9, PLAT_UP + 1.35);
      previewCam.fov = 42; previewCam.position.copy(q.p); previewCam.lookAt(at(o.d + 0.25, o.side, PLAT_UP + 0.8).p);
    };
    const wide = (sg, back) => {
      previewCam.fov = 58; previewCam.position.copy(at(S.stop - back, sg * 1.2, 2.6).p); previewCam.lookAt(at(S.stop + 16, sg * 5.6, 1.9).p);
    };
    const exit = () => {                                          // the way out on the train's own platform (an island's middle), from just behind the cab
      const mid = (d) => { const [lo, hi] = S.island.edges(d); return (lo + hi) / 2; };
      const [a, b] = S.island ? [mid(S.stop + 3), mid(S.stop + 16)] : [S.our * 5.0, S.our * 7.3];
      previewCam.fov = 55; previewCam.position.copy(at(S.stop + 3, a, 2.9).p); previewCam.lookAt(at(S.stop + 16, b, 0).p);
    };
    // the embankment (for checking it): from the street under the nearest bridge, and from above, off to one side
    const g = GAPS.reduce((m, q) => (Math.abs((q[0] + q[1]) / 2 - S.d) < Math.abs((m[0] + m[1]) / 2 - S.d) ? q : m), [Infinity, Infinity]), gd = (g[0] + g[1]) / 2;
    const street = (sg) => { previewCam.fov = 60; previewCam.position.copy(at(gd, sg * 30).p.setY(1.7)); previewCam.lookAt(at(gd, 0).p.setY(EMB(gd) - 1.5)); };
    const above = (sg) => { previewCam.fov = 50; previewCam.position.copy(at(S.d - 60, sg * 70).p.setY(45)); previewCam.lookAt(at(S.d + 40, 0).p.setY(EMB(S.d))); };
    [() => close("wheelchair"), () => close("stroller"), () => close("bike"), () => close("family"), () => close("traveller"), () => close("couple"),
      () => wide(1, 4), () => wide(-1, 4), exit, () => street(1), () => street(-1), () => above(1), () => above(-1),
      () => { const d = (CLY.d + BRIDGE.d0) / 2; previewCam.fov = 50; previewCam.position.copy(at(d - 25, 48).p.setY(1.7)); previewCam.lookAt(at(d + 15, 0).p.setY(3)); },
      () => { const d = (CLY.d + BRIDGE.d0) / 2; previewCam.fov = 50; previewCam.position.copy(at(d - 200, 90).p.setY(55)); previewCam.lookAt(at(d, 0).p.setY(3)); },
      ...[0, 1, 2, 3].map((n) => () => close("standing", n))][i % 19]();
    previewCam.updateProjectionMatrix();
    renderer.render(scene, previewCam);
    ctx.globalAlpha = 1; ctx.drawImage(gl, 0, 0);
  }
  // Any view, for checking the scene (tools/stills.mjs v<d>,<lat>,<y>,<d2>,<lat2>,<y2>): from `lat` metres right of the
  // line `d` metres along, `y` metres up, toward the same at (d2, lat2, y2); or d = "stop<k>" for that stop's d.
  function view(d, lat, y, d2, lat2, y2) {
    preview(6, 0);                                                // (daylight, the train hidden)
    previewCam.fov = 55; previewCam.position.copy(at(d, lat).p.setY(y)); previewCam.lookAt(at(d2, lat2).p.setY(y2));
    previewCam.updateProjectionMatrix(); renderer.render(scene, previewCam); ctx.globalAlpha = 1; ctx.drawImage(gl, 0, 0);
  }
  const KXo = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KYo = 111070;
  const toLonLat = (p) => [+(city.origin[0] + p.x / KXo).toFixed(6), +(city.origin[1] - p.z / KYo).toFixed(6)];
  const bearingOf = (v) => +((Math.atan2(v.x, -v.z) * 180 / Math.PI + 360) % 360).toFixed(1);   // degrees clockwise from north
  // The web page's 360 view (tools/cubemap.mjs): the scene as the film has it at t in outside shot `shot` (the train seen
  // from outside, the cab hidden), from `pos` ([d, side, up], as for at(); or null, the shot's own camera), as six square
  // 90-degree views with the front to the north. The faces are JPEG data URLs named as Photo Sphere Viewer's cubemap
  // adapter names them; `look` is the shot's own view (bearing and pitch in degrees, and its fov), to open the 360 view on.
  // With `tiles` (n), each face comes as an n x n grid instead (tiles[face][row][col], row 0 at the top), plus a small
  // whole face (base[face], `base` px) to show while the tiles load: for faces too big to draw at once. `ss`: each tile
  // is drawn that many times larger and shrunk, which smooths edges and the shimmer of distant windows. `only`: just
  // these faces (for big faces, a face at a time).
  let cubeShot = null;
  function cube(t, shot, pos = null, size = 2048, { tiles = 1, ss = 1, base = 1024, only = null } = {}) {
    const cam = new THREE.PerspectiveCamera(90, 1, 0.5, 12000), out = tiles > 1 ? { tiles: {}, base: {} } : { faces: {} };
    const ts = size / tiles, tile = document.createElement("canvas"), small = document.createElement("canvas");
    tile.width = tile.height = ts; small.width = small.height = base;
    const tg = tile.getContext("2d"), sg = small.getContext("2d");
    tg.imageSmoothingQuality = sg.imageSmoothingQuality = "high";
    // [where it looks, its up]: the top's foot and the bottom's head meet the front
    const FACES = { front: [0, 0, -1, 0, 1, 0], right: [1, 0, 0, 0, 1, 0], back: [0, 0, 1, 0, 1, 0], left: [-1, 0, 0, 0, 1, 0],
      top: [0, 1, 0, 0, 0, 1], bottom: [0, -1, 0, 0, 0, -1] };
    cubeShot = () => {
      const dir = airCam.getWorldDirection(new THREE.Vector3());
      out.look = { yaw: bearingOf(dir), pitch: +(Math.asin(dir.y) * 180 / Math.PI).toFixed(1), fov: airCam.fov };
      const p = pos ? at(...pos).p : airCam.position.clone();
      out.at = { lonlat: toLonLat(p), y: +p.y.toFixed(1), x: +p.x.toFixed(1), z: +p.z.toFixed(1) };
      renderer.setSize(ts * ss, ts * ss, false);
      sky.position.set(p.x, 0, p.z);
      for (const [k, [dx, dy, dz, ux, uy, uz]] of Object.entries(FACES)) {
        if (only && !only.includes(k)) continue;
        cam.position.copy(p); cam.up.set(ux, uy, uz); cam.lookAt(p.x + dx, p.y + dy, p.z + dz);
        const grid = [];
        for (let r = 0; r < tiles; r++) {
          grid.push([]);
          for (let c = 0; c < tiles; c++) {
            if (tiles > 1) cam.setViewOffset(size * ss, size * ss, c * ts * ss, r * ts * ss, ts * ss, ts * ss);
            renderer.render(scene, cam);
            tg.drawImage(gl, 0, 0, ts, ts);
            if (tiles > 1) { grid[r].push(tile.toDataURL("image/jpeg", 0.88)); sg.drawImage(tile, c * base / tiles, r * base / tiles, base / tiles, base / tiles); }
          }
        }
        cam.clearViewOffset();
        if (tiles > 1) { out.tiles[k] = grid; out.base[k] = small.toDataURL("image/jpeg", 0.85); }
        else out.faces[k] = tile.toDataURL("image/jpeg", 0.9);
      }
    };
    try { drawScene(t, shot); } finally { cubeShot = null; renderer.setSize(width, height, false); }
    return out;
  }
  // What the web page needs (tools/export-web.mjs), in lon/lat and film seconds: the stops and the story cards; the train
  // (its cab) every `step` s from `from` to `to`, as [t, lon, lat, bearing, d, air] (air: 0 in the cab's view, 1 in a shot
  // from outside); and the alignment every 10 m, with the tunnel's portals as distances along it.
  function webData(from, to, step = 0.25) {
    const track = [];
    for (let i = 0; from + i * step <= to + 1e-6; i++) {
      const t = from + i * step, d = distAt(t), a = at(d, sideAt(d));
      track.push([+t.toFixed(2), ...toLonLat(a.p), bearingOf(a.tan), Math.round(d), +airWeight(t).toFixed(2)]);
    }
    const route = [];
    for (let d = 0; d < LENGTH; d += 10) route.push(toLonLat(at(d).p));
    route.push(toLonLat(at(LENGTH).p));
    return {
      from, to, step, length: LENGTH, portals: [PORTAL, PORTAL2], routeStep: 10, route, track,
      stops: stopPhases.map((q) => ({ name: q.station.name, t: +q.t0.toFixed(2), dwell: +q.T.toFixed(2), d: Math.round(q.station.stop), lonlat: toLonLat(at(q.station.stop).p) })),
      story: STORY.map((c) => ({ ...c, from: +c.from.toFixed(2), to: +c.to.toFixed(2) })),
      shots: SHOTS.map((s) => ({ from: +s.from.toFixed(2), to: +s.to.toFixed(2) })),
      hero: { pullFrom: +PULL_FROM.toFixed(2), pullTo: +PULL_TO.toFixed(2), end: +HERO_END.toFixed(2) },
    };
  }
  return { render, preview, view, cube, webData, duration: DURATION, info: { LENGTH, PORTAL, PORTAL2, speedup: SPEEDUP, ride: RIDE, duration: DURATION, peakMph: phases.filter((ph) => ph.run).map((ph) => +(ph.run.peak * 2.23694).toFixed(1)), runSeconds: phases.filter((ph) => ph.run).map((ph) => Math.round(ph.run.T)),
    curves: curveLimits.map((q) => ({ from: Math.round(q.from), to: Math.round(q.to), radius: Math.round(q.radius), mph: +q.mph.toFixed(1) })), overhead: [SHOTS[0].from, SHOTS[0].to], shots: SHOTS.map((q) => [q.from, Math.min(q.to, DURATION)]), meet: MEET_T, tunnel: [timeAtDist(PORTAL), timeAtDist(PORTAL2)],
    mph: Array.from({ length: Math.ceil(DURATION * 10) }, (_, i) => +(realSpeedAt(i / 10) * 2.23694).toFixed(1)),   // every 0.1 s, for the sound of the train
    spots: Object.fromEntries([["lakeside", [-87.612514, 41.852671]], ["addison", BROWN_ADDISON[0][0]]].map(([k, [lon, lat]]) => {
      const x = (lon - city.origin[0]) * 111320 * Math.cos(city.origin[1] * Math.PI / 180), z = (city.origin[1] - lat) * 111070, d = planD({ x, z });
      const a = at(d, 0, 0).p, b = at(d + 1, 0, 0).p, r = at(d, 1, 0).p;      // the side +1 direction, to read lat's sign
      return [k, [Math.round(d), +((x - a.x) * (r.x - a.x) + (z - a.z) * (r.z - a.z)).toFixed(1)]];
    })),
    dwell: DWELL, cover: COVER, gaps: GAPS, overs: OVERS.map((o) => [o.name, o.d]), calls: CALLS.map((S) => [S.name, S.d]), bridge: [BRIDGE.d0, BRIDGE.d1], upnwEnd: UPNW_END, rampStart: RAMP_START, rampEnd: RAMP_END, banked: (() => { const r = []; let from = null; bankTable.forEach((v, i) => { const on = Math.abs(v) > 0.004; if (on && from === null) from = i; if (!on && from !== null) { r.push([from * BANK_STEP, i * BANK_STEP, +Math.max(...bankTable.slice(from, i).map(Math.abs)).toFixed(3), Math.sign(bankTable[from + 1])]); from = null; } }); return r; })(),
    stations: CALLS.map((S) => ({ name: S.name, d: S.d, off: S.best, platFrom: S.platFrom, platTo: S.platTo })),
    arrivals: phases.filter((ph) => ph.station).map((ph) => ({ name: ph.station.name, t: ph.t0, dwell: ph.T })), wholeRide: WHOLE_RIDE } };
}
