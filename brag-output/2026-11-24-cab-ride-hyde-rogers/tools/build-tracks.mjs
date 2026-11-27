#!/usr/bin/env node
/*
 * Build assets/tracks.js: the real track the X1 runs on beyond the main film's ends, from OpenStreetMap
 * (via Overpass, cached), as [lon, lat] lines for buildPlan in assets/cab-ride.js.
 *
 *   node tools/build-tracks.mjs [cache-dir]
 *
 * ME_LINE   the Metra Electric from just south of 59th (University of Chicago) north through McCormick Place
 *           and 18th. Of its four tracks the X1 takes the northbound local (the eastern of the middle two,
 *           which every platform from 59th to 18th serves), the track route relation 3117668 (South Chicago
 *           => Millennium Station) is on: found by cross-sectioning the "University Park Sub District" tracks
 *           every 10 m along the relation, then smoothed. The line is 2.15 m west of it, so the train runs on
 *           it. Past 18th's footbridge it eases onto the main film's straight (MED_LINE in cab-ride.js) before
 *           the south ramp: the main film's line was a straight chord ~20-50 m off the real tracks from
 *           McCormick Place to 18th, missing the curve between them.
 * UPN_LINE  the UP North, route relation 3117572 (Ogilvie => Kenosha), from where LOW_LINE in cab-ride.js
 *           ends (about 1 km past Clybourn) to about 1.2 km past Rogers Park, as OSM's nodes.
 *
 * All (c) OpenStreetMap contributors.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = process.argv[2] || path.join(os.tmpdir(), "cab-ride-tracks-cache");
fs.mkdirSync(CACHE, { recursive: true });

// Overpass, through the Chicago Cityscape CLI (cli/overpass.php: the paid Overspan endpoint, then the public servers;
// CITYSCAPE_CLI to point elsewhere). Overspan caps a query at 60 seconds. Cached by name.
const CLI = process.env.CITYSCAPE_CLI || path.join(os.homedir(), "Sites", "Chicago Cityscape", "cli", "overpass.php");
async function overpass(name, query) {
  const file = path.join(CACHE, name + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).elements;
  query = query.replace(/\[timeout:\d+\]/, "[timeout:55]");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = execFileSync("php", [CLI, "--json"], { input: query, encoding: "utf8", maxBuffer: 1 << 30 });
      if (text.trimStart()[0] === "{") { fs.writeFileSync(file, text); return JSON.parse(text).elements; }
    } catch (e) { console.warn(name, "failed:", (e.stderr || e.message || "").toString().slice(0, 300)); }
    await new Promise((r) => setTimeout(r, 10000 * 2 ** attempt));
  }
  throw new Error("Overpass failed for " + name);
}

// local metres, as cab-ride.js's (x east, z south), about the city's origin
const ORIGIN = [-87.620063, 41.863968];
const KX = 111320 * Math.cos(ORIGIN[1] * Math.PI / 180), KY = 111070;
const loc = ([lon, lat]) => [(lon - ORIGIN[0]) * KX, (ORIGIN[1] - lat) * KY];
const unloc = ([x, z]) => [+(ORIGIN[0] + x / KX).toFixed(6), +(ORIGIN[1] - z / KY).toFixed(6)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lerp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const smooth = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };

// a route relation's ways, chained end to end into one line of [lon, lat]
function chain(rel) {
  const ways = rel.members.filter((m) => m.type === "way" && m.geometry && ["", "forward", "backward"].includes(m.role || ""))
    .map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  const d = (a, b) => dist(loc(a), loc(b));
  let line = ways[0].slice();
  const w1 = ways[1];
  if (Math.min(d(line[0], w1[0]), d(line[0], w1.at(-1))) < Math.min(d(line.at(-1), w1[0]), d(line.at(-1), w1.at(-1)))) line.reverse();
  for (let w of ways.slice(1)) {
    if (d(line.at(-1), w.at(-1)) < d(line.at(-1), w[0])) w = w.slice().reverse();
    if (d(line.at(-1), w[0]) > 5) throw new Error("gap in relation " + rel.id);
    line = line.concat(w.slice(1));
  }
  return line;
}
// a polyline resampled every `step` metres
function resample(pts, step) {
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const L = dist(pts[i - 1], pts[i]);
    let s = step - carry;
    while (s <= L) { out.push(lerp(pts[i - 1], pts[i], s / L)); s += step; }
    carry = L - (s - step);
  }
  return out;
}
const movingAverage = (pts, W) => pts.map((_, i) => {
  let x = 0, z = 0, c = 0;
  for (let j = Math.max(0, i - W); j <= Math.min(pts.length - 1, i + W); j++) { x += pts[j][0]; z += pts[j][1]; c++; }
  return [x / c, z / c];
});

/* ---- the Metra Electric ---- */
const [meRel] = await overpass("me-relation", "[out:json][timeout:90];relation(3117668);out geom;");
const meTracks = await overpass("me-tracks", '[out:json][timeout:120];way["railway"="rail"]["name"="University Park Sub District"](41.780,-87.632,41.870,-87.575);out tags geom;');
const segs = meTracks.flatMap((w) => { const p = w.geometry.map((g) => loc([g.lon, g.lat])); return p.slice(1).map((q, i) => [p[i], q]); });
// lateral offsets (+ east, for a northbound guide) where the normal at `o` crosses the tracks, within `half` metres
function crossings(o, t, half = 25) {
  const n = [-t[1], t[0]], out = [];
  for (const [a, b] of segs) {
    const da = (a[0] - o[0]) * t[0] + (a[1] - o[1]) * t[1], db = (b[0] - o[0]) * t[0] + (b[1] - o[1]) * t[1];
    if (da * db > 0 || da === db) continue;
    const p = lerp(a, b, da / (da - db)), lat = (p[0] - o[0]) * n[0] + (p[1] - o[1]) * n[1];
    if (Math.abs(lat) < half && !out.some((v) => Math.abs(v - lat) < 0.5)) out.push(lat);
  }
  return out.sort((u, v) => u - v);
}
// The main film's straight (MED_LINE) and its first frame (planStart: LEAD_IN metres back from the route's start, which is the origin)
const MED_LINE = [[-87.618507, 41.859466], [-87.620690, 41.866669]], LEAD_IN = 1400;
const ma = loc(MED_LINE[0]), mb = loc(MED_LINE[1]), mL = dist(ma, mb), dir1 = [(mb[0] - ma[0]) / mL, (mb[1] - ma[1]) / mL];
const perp1 = [-dir1[1], dir1[0]];
const along0 = (0 - ma[0]) * dir1[0] + (0 - ma[1]) * dir1[1];
const planStart = [ma[0] + dir1[0] * (along0 - LEAD_IN), ma[1] + dir1[1] * (along0 - LEAD_IN)];
const sigma = (p) => (p[0] - planStart[0]) * dir1[0] + (p[1] - planStart[1]) * dir1[1];    // metres along the straight from planStart
const lambda = (p) => (p[0] - planStart[0]) * perp1[0] + (p[1] - planStart[1]) * perp1[1];

const FROM_LAT = 41.7845, OFF = 2.15;                            // ~400 m south of 59th; cab-ride.js's track offset
// The ease onto the straight runs from just past the north end of 18th's platform (the East 18th St footbridge, which
// it ends under) to JOIN_SIGMA, before the south ramp begins (LEAD_IN + RAMP_FROM in cab-ride.js, 1270 m) and well
// before the first curve (~1440 m).
const BRIDGE = [-87.618021, 41.858006], JOIN_SIGMA = 1250;
const meChain = chain(meRel);
if (meChain[0][1] > meChain.at(-1)[1]) meChain.reverse();          // south to north
const guide = resample(meChain.filter(([, lat]) => lat > FROM_LAT - 0.002 && lat < 41.8625).map(loc), 10);
// The relation runs on the northbound local track (the eastern of the middle two), which serves every platform from
// 59th to 18th: the island between the middle two tracks at 18th, McCormick Place and 47th, and the eastern pair's
// island at 51st/53rd, 55th-56th-57th and 59th. The line is OFF metres west of it, so the train (OFF to the line's
// right) runs on it.
// Alongside, the other three tracks' offsets from ours (the two to the west, w1 the outer and w2 the inner, beside the
// island at McCormick Place and 18th; and the one to the east, e2), at each sample of the real track.
let centre = [];
const real = [];                                                   // { p: our track, sides: [w1, w2, e2] from it }
for (let i = 0; i < guide.length - 1; i++) {
  const o = guide[i], q = guide[i + 1], L = dist(o, q), t = [(q[0] - o[0]) / L, (q[1] - o[1]) / L];
  const offs = crossings(o, t, 24), own = offs.reduce((b, v) => (Math.abs(v) < Math.abs(b) ? v : b), Infinity);
  if (Math.abs(own) > 1.5) continue;                               // not on a track here (a gap in OSM's ways)
  centre.push([o[0] - t[1] * (own - OFF), o[1] + t[0] * (own - OFF)]);
  const west = offs.filter((v) => v < own - 2.5).sort((u, v) => v - u), east = offs.filter((v) => v > own + 2.5);
  real.push({ p: [o[0] - t[1] * own, o[1] + t[0] * own], sides: [west[1] ?? null, west[0] ?? null, east[0] ?? null].map((v) => (v === null ? null : v - own)) });
}
// Smoothed over ~300 m: OSM's kinks made the S-curve north of McCormick Place two tight bends (310 and 370 m radius;
// now ~950 m). That moves the line up to ~15 m off the real track mid-curve, so the other tracks and the platforms are
// placed by their offsets from our real track (above), and the whole corridor moves with it.
centre = movingAverage(movingAverage(resample(centre, 10), 15), 15);
const zFrom = loc([ORIGIN[0], FROM_LAT])[1], sigE = sigma(loc(BRIDGE)) + 15;
let me = centre.filter((p) => p[1] < zFrom && sigma(p) < sigE);    // the real track, from FROM_LAT to the footbridge
const easeFrom = me.at(-1), lam0 = lambda(easeFrom), sig0 = sigma(easeFrom);
// heading of the real track where the ease begins, so it leaves it without a kink
const h = me.at(-1), h0 = me.at(-4), slope = (lambda(h) - lambda(h0)) / (sigma(h) - sigma(h0));
const span = JOIN_SIGMA - sig0;
for (let s = sig0 + 10; s < JOIN_SIGMA + 5; s += 10) {
  const u = Math.min(1, (s - sig0) / span);                        // 0 at the ease's start, 1 at the join
  // a cubic Hermite in the offset: lam0 with the real track's slope at u = 0, 0 and flat at u = 1
  const lam = lam0 * (2 * u ** 3 - 3 * u * u + 1) + slope * span * (u ** 3 - 2 * u * u + u);
  me.push([planStart[0] + dir1[0] * s + perp1[0] * lam, planStart[1] + dir1[1] * s + perp1[1] * lam]);
}
me[me.length - 1] = [planStart[0] + dir1[0] * JOIN_SIGMA, planStart[1] + dir1[1] * JOIN_SIGMA];
// The other three tracks as offsets from the line (metres, + to the right) at each of its points on the real track:
// their offsets from our real track (nearest sample), plus ours from the line (OFF).
const nReal = centre.filter((p) => p[1] < zFrom && sigma(p) < sigE).length;
let sides = me.map((p, i) => {
  if (i >= nReal) return null;
  let best = real[0], bd = Infinity;
  for (const r of real) { const q = dist(r.p, p); if (q < bd) { bd = q; best = r; } }
  return best.sides.map((v) => (v === null ? null : v + OFF));
});
// fill each column's gaps by interpolation, then smooth it (~50 m)
for (let k = 0; k < 3; k++) {
  const col = sides.map((q) => (q ? q[k] : null));
  for (let i = 0; i < nReal; i++) if (col[i] === null) {
    let a = i - 1, b = i + 1;
    while (a >= 0 && col[a] === null) a--; while (b < nReal && col[b] === null) b++;
    col[i] = a < 0 ? col[b] : b >= nReal ? col[a] : col[a] + (col[b] - col[a]) * (i - a) / (b - a);
  }
  for (let i = 0; i < nReal; i++) {
    let sum = 0, c = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(nReal - 1, i + 2); j++) { sum += col[j]; c++; }
    sides[i][k] = Math.round(sum / c * 10) / 10;
  }
}

/* ---- the UP North ---- */
const [upRel] = await overpass("upn-relation", "[out:json][timeout:90];relation(3117572);out geom;");
const up = chain(upRel), LOW_END = [-87.672230, 41.926337];
const k0 = up.findIndex((p) => dist(loc(p), loc(LOW_END)) < 0.5);
if (k0 < 0) throw new Error("LOW_LINE's end isn't on relation 3117572 any more");
const ROGERS_PARK = [-87.675533, 42.008999], PAST = 4000;          // the CrossTowner GTFS's stop; past it, room for the film's ending
let kEnd = k0, best = Infinity;
up.forEach((p, k) => { const q = dist(loc(p), loc(ROGERS_PARK)); if (k > k0 && q < best) { best = q; kEnd = k; } });
for (let run = 0; kEnd < up.length - 1 && run < PAST; kEnd++) run += dist(loc(up[kEnd]), loc(up[kEnd + 1]));
// Straightened: OSM's nodes wander a metre or two on the long straights between the north side stations, which the
// cab shows as soft bends. Douglas-Peucker at TOL metres keeps the real curves and drops the wander (buildPlan smooths
// the corners that are left).
const TOL = 2.0;
const simplify = (pts, tol = TOL) => {
  if (pts.length < 3) return pts;
  const a = loc(pts[0]), b = loc(pts.at(-1)), L = dist(a, b);
  let far = 0, k = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = loc(pts[i]), off = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
    if (off > far) { far = off; k = i; }
  }
  return far < tol ? [pts[0], pts.at(-1)] : [...simplify(pts.slice(0, k + 1), tol).slice(0, -1), ...simplify(pts.slice(k), tol)];
};
// It starts UPN_FROM_PAST metres past Clybourn (the main film's LOW_LINE wanders like OSM's nodes from there on too;
// buildPlan cuts LOW_LINE at UPN_FROM, the first point here).
const CLYBOURN = [-87.668152, 41.917096], UPN_FROM_PAST = 250;
let kFrom = 0;
up.forEach((p, k) => { if (k < k0 && dist(loc(p), loc(CLYBOURN)) < dist(loc(up[kFrom]), loc(CLYBOURN))) kFrom = k; });
for (let run = 0; kFrom < k0 && run < UPN_FROM_PAST; kFrom++) run += dist(loc(up[kFrom]), loc(up[kFrom + 1]));
let upn = simplify(up.slice(kFrom, kEnd + 1));
// Between Ravenswood and Peterson/Ridge OSM's track steps ~3.5 m sideways off the 6.8 km straight (by Foster and
// Berwyn), which the cab shows as a pointless S-bend: straightened there at a looser tolerance.
const STRAIGHT = [41.955, 42.005], inS = (p) => p[1] > STRAIGHT[0] && p[1] < STRAIGHT[1];
const s0 = upn.findIndex(inS) - 1, s1 = upn.findLastIndex(inS) + 1;
upn = [...upn.slice(0, s0), ...simplify(upn.slice(s0, s1 + 1), 4.0), ...upn.slice(s1 + 1)];

/* ---- the Brown Line (CTA's Ravenswood Branch), on its elevated structure over the UP North just south of
        Addison/Lincoln: its two tracks within BROWN_REACH metres of the crossing (far enough that the structure runs
        on out of the cab's view either way, rather than stopping in mid-air), as OSM's ways, and the Addison
        station's two platforms ---- */
const BROWN_REACH = 2500;
const brownWays = (await overpass("brown-line-3", '[out:json][timeout:55];way["railway"="subway"]["name"="Ravenswood Branch"](41.920,-87.705,41.970,-87.640);out tags geom;'))
  .filter((w) => w.tags.service !== "crossover").map((w) => w.geometry.map((g) => [g.lon, g.lat]));
// where it crosses the UP North: the nearest approach of any of its points to the UP North's line
const upLine = upn.map(loc);
let cross = null, cd = Infinity;
for (const w of brownWays) for (const q of w) for (let i = 1; i < upLine.length; i++) {
  const a = upLine[i - 1], b = upLine[i], p = loc(q), dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz;
  const f = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2)) : 0;
  const dd = Math.hypot(p[0] - a[0] - f * dx, p[1] - a[1] - f * dz);
  if (dd < cd) { cd = dd; cross = p; }
}
const brown = brownWays.map((w) => w.filter((q) => dist(loc(q), cross) < BROWN_REACH)).filter((w) => w.length >= 2);
const brownPlatforms = (await overpass("brown-addison-platforms", '[out:json][timeout:55];way["railway"="platform"](41.9455,-87.6760,41.9490,-87.6735);out tags geom;'))
  .map((w) => w.geometry.map((g) => [g.lon, g.lat]));

const fmt = (line) => "[" + line.map(([lon, lat]) => `[${lon.toFixed(6)}, ${lat.toFixed(6)}]`).join(",\n  ") + "]";
fs.writeFileSync(path.join(HERE, "..", "assets", "tracks.js"),
  `// Generated by tools/build-tracks.mjs. Don't edit by hand. Track: OpenStreetMap, (c) OpenStreetMap contributors.
// ME_LINE: the Metra Electric, south of 59th, through McCormick Place and 18th, to where it joins the main film's
// straight, JOIN_SIGMA metres along it from the main film's first frame (planStart), [lon, lat] every 10 m.
export const ME_LINE = ${fmt(me.map(unloc))};
export const JOIN_SIGMA = ${JOIN_SIGMA};
// ME_SIDES: at each point of ME_LINE on the real track, the other three tracks' offsets from the line, [w1, w2, e2]
export const ME_SIDES = ${JSON.stringify(sides.slice(0, nReal))};
// UPN_LINE: the UP North, from ${UPN_FROM_PAST} m past Clybourn (buildPlan cuts LOW_LINE at its first point) to ~${PAST} m past
// Rogers Park, [lon, lat]: OSM's nodes, straightened (Douglas-Peucker).
export const UPN_LINE = ${fmt(upn)};
// BROWN_LINE: the Brown Line's tracks (OSM's ways) within ${BROWN_REACH} m of where it crosses over the UP North, [lon, lat].
export const BROWN_LINE = [${brown.map(fmt).join(",\n ")}];
// BROWN_ADDISON: the two platforms of the Brown Line's Addison station (OSM's outlines), [lon, lat].
export const BROWN_ADDISON = [${brownPlatforms.map(fmt).join(",\n ")}];
`);
console.log(`ME_LINE ${me.length} points (${(me.length * 10 / 1609).toFixed(2)} mi), ease from ${unloc(easeFrom)} (${lam0.toFixed(1)} m off the straight); UPN_LINE ${upn.length} points to ${upn.at(-1)}; BROWN_LINE ${brown.length} ways, ${brownPlatforms.length} platforms at Addison, crossing at ${unloc(cross)}`);
