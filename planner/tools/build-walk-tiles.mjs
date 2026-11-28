#!/usr/bin/env node
/*
 * build-walk-tiles.mjs -- build the trip planner's walking network.
 *
 * The planner routes the walk between a rider's address and a station on real
 * streets and paths. This script turns r5r's own OpenStreetMap extract (the same
 * streets R5 walked riders on when it built the station-to-station matrix) into
 * a small graph, cut into ~1 km tiles that the browser loads on demand, plus an
 * index that says where each station's walk starts and ends.
 *
 * RUN (from the repo root; needs osmium -- `brew install osmium-tool`):
 *
 *   node planner/tools/build-walk-tiles.mjs
 *
 * Options:
 *   --pbf <file>        OSM extract   (default analysis/r5r_network_inputs/chicago-streets.osm.pbf)
 *   --out <dir>         output folder (default planner/data/walk)
 *   --osmium <path>     osmium binary (default /opt/homebrew/bin/osmium, else `osmium` on PATH)
 *
 * planner/tools/walk-exclude.json lists OSM ways to leave out although the extract still has them open to walkers
 * (a private riverwalk, say, until OSM is fixed and the extract re-downloaded), each with its reason.
 *
 * It takes about a minute and ~3 GB of memory. Re-run it whenever the OSM
 * extract or planner/data/stations.json changes, then bump `walkVersion` in
 * planner/config.js so browsers fetch the new tiles.
 *
 * WHAT IT DOES
 *   1. osmium keeps the ways people can walk on and the station-entrance nodes
 *      and streams them out as OPL text, which this script reads line by line.
 *   2. Tag rules (walkable() below) drop what you can't walk on: foot=no,
 *      access=no/private without foot=yes, expressways. Bridges and tunnels are
 *      just ways, so a river, rail line or expressway is only crossed where a
 *      walkable way actually crosses it -- ways only connect at shared OSM nodes.
 *   3. Ways are split at shared nodes; runs of degree-2 nodes are merged into
 *      one edge (length in meters from the full geometry; geometry simplified
 *      with Douglas-Peucker at 2 m). Short dead-end stubs (driveways, path
 *      ends) are pruned: no walk between two other places can use one. Only the
 *      main connected network is kept, plus any island holding a station
 *      entrance (O'Hare's terminal core) -- a gated subdivision or an
 *      unconnected trail system reaches no station, and an address there is
 *      better snapped to the main network than stranded on it.
 *   4. Each station gets access points: OSM station entrances within 150 m
 *      (railway=subway_entrance etc.); else the nearest walkable street within
 *      100 m, plus a platform way within 150 m if one is mapped. Proposed stations
 *      (exists_today false) have no entrances yet, so they are always snapped
 *      and flagged "assumed". An access point that falls mid-edge splits the
 *      edge there, so every access point is a graph node.
 *   5. Edges are written to the ~1 km tiles they touch (an edge crossing a tile
 *      line goes in every tile it touches and carries an id so the browser can
 *      de-duplicate it). Only tiles within 2 km of a station are kept: a
 *      20-minute walk is ~1.5 km, so no walk to a station can leave that disk.
 *
 * OUTPUT
 *   <out>/index.json   { v, built, source, grid, tiles: ["i_j", ...],
 *                        stations: { <id>: { how, assumed?, a: [[lonE6, latE6, connM], ...] } },
 *                        stats }
 *     grid: lon0E6/lat0E6 = the grid's south-west corner, dLonE6/dLatE6 = tile
 *     size, all in millionths of a degree. Tile "i_j" covers
 *     lon0 + i*dLon .. +dLon, lat0 + j*dLat .. +dLat.
 *     a: each access point's coordinates (millionths of a degree) and the
 *     straight connector, in meters, from that graph node to the entrance
 *     (0 when the entrance is itself on the network).
 *   <out>/t/<i>_<j>.json   { e: [ edge, ... ] }, edge = a flat integer array
 *     [id, lenM, flags, x0, y0, dx1, dy1, dx2, dy2, ...]
 *       id     0 when the edge lies in this tile only, else a global id shared
 *              by every tile that holds a copy (the browser keeps one)
 *       lenM   walking length in whole meters, from the full OSM geometry
 *       flags  1 = don't snap an address here (bridge, tunnel, steps, a level
 *              other than the street, expressway sidewalk...); 2 = platform
 *       x0,y0  first vertex in millionths of a degree relative to the tile's
 *              south-west corner; then integer deltas to each next vertex.
 *     Graph nodes are the edges' end vertices, keyed by their exact integer
 *     coordinates, so edges from neighbouring tiles join up in the browser.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

/* ---- settings ---------------------------------------------------------- */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf("--" + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}
const PBF = path.resolve(arg("pbf", path.join(REPO, "analysis/r5r_network_inputs/chicago-streets.osm.pbf")));
const OUT = path.resolve(arg("out", path.join(REPO, "planner/data/walk")));
const OSMIUM = arg("osmium", fs.existsSync("/opt/homebrew/bin/osmium") ? "/opt/homebrew/bin/osmium" : "osmium");

const STATIONS_JSON = path.join(REPO, "planner/data/stations.json");
const EXCLUDE = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(REPO, "planner/tools/walk-exclude.json"), "utf8")).ways).map(Number));
let waysExcluded = 0;
const SSL_JSON = path.join(REPO, "planner/data/southshore.json");

const SIMPLIFY_M = 2;          // Douglas-Peucker tolerance
const MIN_COMPONENT_M = 1000;  // an island must be this long AND hold a station entrance to stay
const ENTRANCE_M = 150;        // an entrance this close to a station belongs to it
const ENTRANCE_LINK_M = 40;    // an off-network entrance links to a street this close
const PLATFORM_M = 150;        // a platform way this close counts as the station's
const SNAP_M = 100;            // else snap the station to a street this close...
const SNAP_FAR_M = 300;        // ...or, failing that, this close (flagged "far")
const PRUNE_M = 100;           // drop dead-end driveway/path stubs shorter than this
const KEEP_TILE_M = 2000;      // keep tiles within this distance of a station

// The tile grid, in millionths of a degree. 0.012 deg of longitude x 0.009 deg
// of latitude is ~0.99 km x 1.00 km at Chicago's latitude.
const GRID = { lon0E6: -88700000, lat0E6: 41300000, dLonE6: 12000, dLatE6: 9000 };

/* ---- geometry helpers --------------------------------------------------- */
const R_EARTH = 6371008.8, RAD = Math.PI / 180;
function haversineM(lon1, lat1, lon2, lat2) {
  const dLat = (lat2 - lat1) * RAD, dLon = (lon2 - lon1) * RAD;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(s)));
}
// Local flat projection (meters per degree) at a latitude.
function kx(lat) { return 111320 * Math.cos(lat * RAD); }
const KY = 111132;

/* ---- tag rules ---------------------------------------------------------- */
const WALK_HIGHWAYS = new Set([
  "footway", "path", "pedestrian", "steps", "living_street", "residential", "residential_link",
  "service", "unclassified", "tertiary", "tertiary_link", "secondary", "secondary_link",
  "primary", "primary_link", "cycleway", "track", "corridor", "platform", "elevator"
]);
const FOOT_OK = new Set(["yes", "designated", "permissive"]);
const FOOT_NO = new Set(["no", "private", "use_sidepath"]);
const SIDEWALK_YES = new Set(["yes", "both", "left", "right"]);
const SIDEWALK_NONE = new Set(["no", "none", "separate"]);

function sidewalkMapped(t) {
  return SIDEWALK_YES.has(t.sidewalk) || SIDEWALK_YES.has(t["sidewalk:both"]) ||
         SIDEWALK_YES.has(t["sidewalk:left"]) || SIDEWALK_YES.has(t["sidewalk:right"]);
}
function noSidewalkEitherSide(t) {
  return SIDEWALK_NONE.has(t.sidewalk) || SIDEWALK_NONE.has(t["sidewalk:both"]) ||
         (SIDEWALK_NONE.has(t["sidewalk:left"]) && SIDEWALK_NONE.has(t["sidewalk:right"]));
}
function maxspeedMph(t) {
  const m = /^(\d+(?:\.\d+)?)\s*(mph)?/.exec(t.maxspeed || "");
  if (!m) return null;
  return m[2] ? +m[1] : +m[1] / 1.609;
}

// Can a person walk along this way? Returns null (no) or a flags byte.
//   bit 1: don't snap an address onto it; bit 2: it's a platform.
function walkable(t) {
  const hw = t.highway;
  const isPlatform = hw === "platform" || t.railway === "platform" || t.public_transport === "platform";
  if (!hw && !isPlatform) return null;
  if (FOOT_NO.has(t.foot)) return null;
  const footOk = FOOT_OK.has(t.foot);
  if ((t.access === "no" || t.access === "private") && !footOk) return null;
  let ok = false, noSnap = false;
  if (hw === "motorway" || hw === "motorway_link") {
    // Expressways: only where walking is explicitly allowed or a sidewalk is on the way.
    ok = footOk || sidewalkMapped(t);
    noSnap = true;
  } else if (hw === "trunk" || hw === "trunk_link") {
    // Illinois tags many ordinary arterials "trunk" because they carry a US
    // route (Stony Island, La Grange Rd, Rand Rd, Sheridan Rd, Lake St) -- they
    // have sidewalks, usually untagged. The expressway-grade trunks (DuSable
    // Lake Shore Drive, Kingery and Skokie highways, Field Drive, Calumet
    // Expressway) are marked foot=no, motorroad/expressway=yes, sidewalk=no or
    // a 50+ mph limit, and stay out.
    if (footOk || sidewalkMapped(t)) ok = true;
    else if (t.motorroad === "yes" || t.expressway === "yes") ok = false;
    else if (noSidewalkEitherSide(t)) ok = false;
    else { const mph = maxspeedMph(t); ok = !(mph != null && mph >= 50); }
  } else if (isPlatform || WALK_HIGHWAYS.has(hw)) {
    ok = true;
  }
  if (!ok) return null;
  if (t.construction && t.construction !== "no") return null;
  const layer = t.layer ? parseFloat(t.layer) : 0;
  const level = t.level ? parseFloat(t.level) : 0;
  if ((t.bridge && t.bridge !== "no") || (t.tunnel && t.tunnel !== "no") || (t.covered === "yes" && hw !== "footway") ||
      (layer && !isNaN(layer)) || (level && !isNaN(level)) || t.indoor === "yes" ||
      hw === "steps" || hw === "elevator" || hw === "corridor" || isPlatform) noSnap = true;
  return (noSnap ? 1 : 0) | (isPlatform ? 2 : 0);
}

// Way types whose short dead-end stubs can be pruned (see step 3).
const PRUNABLE = new Set(["service", "footway", "path", "steps", "cycleway", "track", "corridor", "elevator"]);

// A node that marks a way into a station (not an exit-only door, not a shop).
function isStationEntrance(t) {
  if (t.exit === "only" || t.entrance === "exit" || t.railway === "subway_exit") return false;
  if (t.entrance === "emergency" || t.entrance === "service") return false;
  if (t.railway === "subway_entrance" || t.railway === "train_station_entrance" || t.railway === "entrance") return true;
  if (t.public_transport === "entrance") return true;
  if (t.entrance && (t.railway || t.public_transport)) return true;
  return false;
}

/* ---- OPL parsing -------------------------------------------------------- */
function decodeOpl(s) {
  return s.indexOf("%") < 0 ? s : s.replace(/%([0-9a-fA-F]+)%/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}
function parseTags(field) {          // "Tk=v,k2=v2" -> {k: v}
  const t = {};
  if (field.length <= 1) return t;
  const parts = field.slice(1).split(",");
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq > 0) t[decodeOpl(p.slice(0, eq))] = decodeOpl(p.slice(eq + 1));
  }
  return t;
}

/* ---- 1. read the extract ------------------------------------------------ */
function log(...a) { console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a); }
const T0 = Date.now();

const v = spawnSync(OSMIUM, ["--version"], { encoding: "utf8" });
if (v.status !== 0) { console.error("osmium not found (" + OSMIUM + "). brew install osmium-tool"); process.exit(1); }
if (!fs.existsSync(PBF)) { console.error("No OSM extract at " + PBF); process.exit(1); }

const stations = JSON.parse(fs.readFileSync(STATIONS_JSON, "utf8"));
const ssl = fs.existsSync(SSL_JSON) ? JSON.parse(fs.readFileSync(SSL_JSON, "utf8")) : { stations: [] };

let cap = 1 << 23;
let nodeId = new Float64Array(cap), nodeLon = new Int32Array(cap), nodeLat = new Int32Array(cap);
let nNodes = 0;
const entranceNodes = [];      // node indices of station-entrance candidates
const ways = [];               // { refs: Int32Array of node indices, flag }
let waysSeen = 0, waysKept = 0, missingRefs = 0;

function findNode(id) {        // binary search the sorted node ids
  let lo = 0, hi = nNodes - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, x = nodeId[mid];
    if (x === id) return mid;
    if (x < id) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

await new Promise((resolve, reject) => {
  const filter = [
    "w/highway=" + [...WALK_HIGHWAYS, "motorway", "motorway_link", "trunk", "trunk_link"].join(","),
    "w/railway=platform", "w/public_transport=platform",
    "n/railway=subway_entrance,train_station_entrance,entrance", "n/public_transport=entrance", "n/entrance"
  ];
  log("osmium tags-filter", path.relative(REPO, PBF));
  const p = spawn(OSMIUM, ["tags-filter", PBF, ...filter, "-f", "opl,add_metadata=false", "-o", "-"],
                  { stdio: ["ignore", "pipe", "inherit"] });
  p.on("error", reject);
  const rl = readline.createInterface({ input: p.stdout, crlfDelay: Infinity });
  let lastId = -Infinity;
  rl.on("line", (line) => {
    const c = line.charCodeAt(0);
    if (c === 110) {                                   // 'n'
      const f = line.split(" ");
      const id = +f[0].slice(1);
      if (id <= lastId) throw new Error("OPL nodes are not sorted by id");
      lastId = id;
      if (nNodes === cap) {
        cap *= 2;
        const a = new Float64Array(cap); a.set(nodeId); nodeId = a;
        const b = new Int32Array(cap); b.set(nodeLon); nodeLon = b;
        const d = new Int32Array(cap); d.set(nodeLat); nodeLat = d;
      }
      nodeId[nNodes] = id;
      nodeLon[nNodes] = Math.round(parseFloat(f[2].slice(1)) * 1e7);
      nodeLat[nNodes] = Math.round(parseFloat(f[3].slice(1)) * 1e7);
      if (f[1].length > 1 && /entrance|railway|public_transport/.test(f[1])) {
        const t = parseTags(f[1]);
        if (isStationEntrance(t)) entranceNodes.push(nNodes);
      }
      nNodes++;
    } else if (c === 119) {                            // 'w'
      waysSeen++;
      const f = line.split(" ");
      if (EXCLUDE.has(+f[0].slice(1))) { waysExcluded++; return; }   // (walk-exclude.json)
      const tags = parseTags(f[1]);
      const flag = walkable(tags);
      if (flag == null) return;
      const prune = PRUNABLE.has(tags.highway) ? 1 : 0;
      const refs = f[2].slice(1).split(",");
      let cur = [];
      const flush = () => { if (cur.length >= 2) ways.push({ refs: Int32Array.from(cur), flag, prune }); cur = []; };
      for (const r of refs) {
        const idx = findNode(+r.slice(1));
        if (idx < 0) { missingRefs++; flush(); continue; }   // clipped at the extract's edge
        cur.push(idx);
      }
      flush();
      waysKept++;
    }
  });
  rl.on("close", () => p.on("close", (code) => code === 0 ? resolve() : reject(new Error("osmium exited " + code))));
});
log(`read ${nNodes.toLocaleString()} nodes, kept ${waysKept.toLocaleString()} of ${waysSeen.toLocaleString()} ways (${waysExcluded} left out by walk-exclude.json)` +
    (missingRefs ? ` (${missingRefs} refs outside the extract)` : "") + `, ${entranceNodes.length} entrance nodes`);

/* ---- station entrances -------------------------------------------------- */
// Assign each entrance node to the nearest station that exists today, within
// ENTRANCE_M. (Proposed stations have no entrances; see the access step.)
const existing = stations.filter((s) => s.exists_today);
const keepNode = new Uint8Array(nNodes);
const entrancesByStation = new Map();            // station id -> [node index]
for (const ni of entranceNodes) {
  const lon = nodeLon[ni] / 1e7, lat = nodeLat[ni] / 1e7;
  let best = null, bestD = Infinity;
  for (const s of existing) {
    if (Math.abs(s.lat - lat) > 0.002 || Math.abs(s.lon - lon) > 0.003) continue;
    const d = haversineM(lon, lat, s.lon, s.lat);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (best && bestD <= ENTRANCE_M) {
    if (!entrancesByStation.has(best.id)) entrancesByStation.set(best.id, []);
    entrancesByStation.get(best.id).push(ni);
    keepNode[ni] = 1;                            // an entrance on a way stays a graph node
  }
}
log(`${[...entrancesByStation.values()].reduce((a, b) => a + b.length, 0)} entrances near ${entrancesByStation.size} stations`);

/* ---- 2. split ways into segments at shared nodes ------------------------ */
const use = new Uint8Array(nNodes);              // way positions referencing each node (saturating)
const endNode = new Uint8Array(nNodes);
for (const w of ways) {
  for (let i = 0; i < w.refs.length; i++) { const n = w.refs[i]; if (use[n] < 255) use[n]++; }
  endNode[w.refs[0]] = 1; endNode[w.refs[w.refs.length - 1]] = 1;
}
const vOf = new Int32Array(nNodes).fill(-1);     // node index -> vertex id
const vNode = [];                                // vertex id -> node index
function vertexOf(n) { if (vOf[n] < 0) { vOf[n] = vNode.length; vNode.push(n); } return vOf[n]; }
function isVertex(n) { return endNode[n] || use[n] >= 2 || keepNode[n]; }

const segA = [], segB = [], segFlag = [], segLen = [], segNodes = [], segPrune = [];
for (const w of ways) {
  let start = 0;
  for (let i = 1; i < w.refs.length; i++) {
    if (!isVertex(w.refs[i]) && i < w.refs.length - 1) continue;
    const nodes = w.refs.subarray(start, i + 1);
    let len = 0;
    for (let k = 1; k < nodes.length; k++) {
      len += haversineM(nodeLon[nodes[k - 1]] / 1e7, nodeLat[nodes[k - 1]] / 1e7, nodeLon[nodes[k]] / 1e7, nodeLat[nodes[k]] / 1e7);
    }
    if (len > 0) {
      segA.push(vertexOf(nodes[0])); segB.push(vertexOf(nodes[nodes.length - 1]));
      segFlag.push(w.flag); segLen.push(len); segNodes.push(nodes); segPrune.push(w.prune);
    }
    start = i;
  }
}
ways.length = 0;
const nSeg = segA.length, nV = vNode.length;
log(`${nSeg.toLocaleString()} segments, ${nV.toLocaleString()} vertices`);

/* ---- drop small disconnected pieces ------------------------------------- */
const uf = new Int32Array(nV); for (let i = 0; i < nV; i++) uf[i] = i;
function find(x) { while (uf[x] !== x) { uf[x] = uf[uf[x]]; x = uf[x]; } return x; }
for (let s = 0; s < nSeg; s++) { const a = find(segA[s]), b = find(segB[s]); if (a !== b) uf[a] = b; }
const compLen = new Float64Array(nV);
for (let s = 0; s < nSeg; s++) compLen[find(segA[s])] += segLen[s];
// Keep the main network, plus any island that holds a station entrance (O'Hare's
// terminal core is one: you can't walk in from outside, but you can walk from a
// terminal hotel to the Blue Line). Every other island -- a gated subdivision,
// an unconnected trail system, a stray sidewalk -- reaches no station, so it can't
// be part of any walk; dropping it lets an address there snap to the main
// network instead of being stranded on a piece that goes nowhere.
const segKeep = new Uint8Array(nSeg);
const hasEntrance = new Uint8Array(nV);
for (let i = 0; i < nV; i++) if (keepNode[vNode[i]]) hasEntrance[find(i)] = 1;
let giantRoot = 0;
for (let i = 0; i < nV; i++) if (compLen[i] > compLen[giantRoot]) giantRoot = i;
const keepComp = (r) => r === giantRoot || (hasEntrance[r] && compLen[r] >= MIN_COMPONENT_M);
let comps = 0, compsKept = 0, lenDropped = 0, lenKept = 0, giant = compLen[giantRoot];
for (let i = 0; i < nV; i++) if (find(i) === i && compLen[i] > 0) { comps++; if (keepComp(i)) compsKept++; }
for (let s = 0; s < nSeg; s++) {
  if (keepComp(find(segA[s]))) { segKeep[s] = 1; lenKept += segLen[s]; } else lenDropped += segLen[s];
}
if (process.env.WALK_DEBUG) {
  const roots = [];
  for (let i = 0; i < nV; i++) if (find(i) === i && compLen[i] > 0) roots.push(i);
  roots.sort((a, b) => compLen[b] - compLen[a]);
  for (const r of roots.slice(0, 15)) {
    let s0 = -1; for (let s = 0; s < nSeg; s++) if (find(segA[s]) === r) { s0 = s; break; }
    const n0 = vNode[segA[s0]];
    console.log("  component", (compLen[r] / 1000).toFixed(1), "km at", (nodeLat[n0] / 1e7).toFixed(5) + "," + (nodeLon[n0] / 1e7).toFixed(5));
  }
}
log(`${comps.toLocaleString()} connected pieces; kept ${compsKept} (the main network + islands with a station entrance) ` +
    `(${(lenKept / 1000).toFixed(0)} km; largest ${(giant / 1000).toFixed(0)} km), dropped ${(lenDropped / 1000).toFixed(0)} km`);

/* ---- prune short dead-end stubs ----------------------------------------- */
// A dead-end driveway, parking spur or path stub can never be part of a walk
// between two other places -- it only gives an address something to snap to,
// and the street it hangs off serves that as well. Drop the short ones, except
// a stub that ends at a station entrance or is a platform.
{
  const d0 = new Int32Array(nV);
  for (let s = 0; s < nSeg; s++) if (segKeep[s]) { d0[segA[s]]++; d0[segB[s]]++; }
  let pruned = 0, prunedLen = 0;
  for (let s = 0; s < nSeg; s++) {
    if (!segKeep[s] || !segPrune[s] || segLen[s] >= PRUNE_M || (segFlag[s] & 2)) continue;
    const deadA = d0[segA[s]] === 1 && !keepNode[vNode[segA[s]]];
    const deadB = d0[segB[s]] === 1 && !keepNode[vNode[segB[s]]];
    if (deadA !== deadB) { segKeep[s] = 0; pruned++; prunedLen += segLen[s]; }
  }
  log(`pruned ${pruned.toLocaleString()} dead-end stubs under ${PRUNE_M} m (${(prunedLen / 1000).toFixed(0)} km)`);
}

/* ---- 3. merge chains of degree-2 vertices into edges -------------------- */
const deg = new Int32Array(nV);
for (let s = 0; s < nSeg; s++) if (segKeep[s]) { deg[segA[s]]++; deg[segB[s]]++; }
const adjStart = new Int32Array(nV + 1);
for (let v2 = 0; v2 < nV; v2++) adjStart[v2 + 1] = adjStart[v2] + deg[v2];
const adj = new Int32Array(adjStart[nV]), fill = adjStart.slice(0, nV);
for (let s = 0; s < nSeg; s++) if (segKeep[s]) { adj[fill[segA[s]]++] = s; adj[fill[segB[s]]++] = s; }

// A vertex the merge must stop at: an intersection or dead end, an entrance,
// a change of flags (so a bridge stays its own edge), or a loop's turn-around.
const stopV = new Uint8Array(nV);
for (let v2 = 0; v2 < nV; v2++) {
  if (deg[v2] === 0) continue;
  if (deg[v2] !== 2 || keepNode[vNode[v2]]) { stopV[v2] = 1; continue; }
  const s1 = adj[adjStart[v2]], s2 = adj[adjStart[v2] + 1];
  if (s1 === s2 || segFlag[s1] !== segFlag[s2]) stopV[v2] = 1;
}
const used = new Uint8Array(nSeg);
const edges = [];          // { a, b (vertex ids), nodes: [node idx], len, flag }
function walkChain(s, fromV) {
  const nodes = []; let len = 0, flag = segFlag[s], cur = s, at = fromV;
  for (;;) {
    used[cur] = 1;
    const fwd = segA[cur] === at;
    const ns = segNodes[cur];
    if (fwd) { for (let k = nodes.length ? 1 : 0; k < ns.length; k++) nodes.push(ns[k]); }
    else { for (let k = ns.length - 1 - (nodes.length ? 1 : 0); k >= 0; k--) nodes.push(ns[k]); }
    len += segLen[cur];
    at = fwd ? segB[cur] : segA[cur];
    if (stopV[at]) break;
    const o1 = adj[adjStart[at]], o2 = adj[adjStart[at] + 1];
    const next = o1 === cur ? o2 : o1;
    if (used[next]) break;
    cur = next;
  }
  edges.push({ a: fromV, b: at, nodes, len, flag });
}
for (let s = 0; s < nSeg; s++) {
  if (!segKeep[s] || used[s]) continue;
  if (stopV[segA[s]]) walkChain(s, segA[s]);
  else if (stopV[segB[s]]) walkChain(s, segB[s]);
}
for (let s = 0; s < nSeg; s++) {                 // pure rings with no stop vertex
  if (!segKeep[s] || used[s]) continue;
  stopV[segA[s]] = 1; walkChain(s, segA[s]);
}
log(`${edges.length.toLocaleString()} edges after merging`);

/* ---- spatial index over edges (for snapping) ---------------------------- */
const CELL = 0.001;        // ~100 m cells
const cellMap = new Map();
function cellKey(cx, cy) { return cx * 100000 + cy; }
function indexEdge(ei) {
  const e = edges[ei], seen = new Set();
  for (let k = 0; k < e.nodes.length; k++) {
    const n = e.nodes[k];
    const lon = nodeLon[n] / 1e7, lat = nodeLat[n] / 1e7;
    // cover the segment's bbox to the next vertex
    const n2 = e.nodes[Math.min(k + 1, e.nodes.length - 1)];
    const lon2 = nodeLon[n2] / 1e7, lat2 = nodeLat[n2] / 1e7;
    const x0 = Math.floor(Math.min(lon, lon2) / CELL), x1 = Math.floor(Math.max(lon, lon2) / CELL);
    const y0 = Math.floor(Math.min(lat, lat2) / CELL), y1 = Math.floor(Math.max(lat, lat2) / CELL);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
      const key = cellKey(x, y);
      if (seen.has(key)) continue;
      seen.add(key);
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key).push(ei);
    }
  }
}
for (let i = 0; i < edges.length; i++) indexEdge(i);

// Nearest point on an edge to (lon, lat) within maxM, among edges accepted by ok(edge).
// Returns { ei, k (segment index), t (0..1), lon, lat, d } or null.
function nearestOnEdges(lon, lat, maxM, ok) {
  const KX = kx(lat), r = Math.ceil(maxM / 100) + 1;
  const cx = Math.floor(lon / CELL), cy = Math.floor(lat / CELL);
  let best = null;
  const tried = new Set();
  for (let x = cx - r; x <= cx + r; x++) for (let y = cy - r; y <= cy + r; y++) {
    const list = cellMap.get(cellKey(x, y));
    if (!list) continue;
    for (const ei of list) {
      if (tried.has(ei)) continue;
      tried.add(ei);
      const e = edges[ei];
      if (ok && !ok(e)) continue;
      for (let k = 0; k + 1 < e.nodes.length; k++) {
        const ax = (nodeLon[e.nodes[k]] / 1e7 - lon) * KX, ay = (nodeLat[e.nodes[k]] / 1e7 - lat) * KY;
        const bx = (nodeLon[e.nodes[k + 1]] / 1e7 - lon) * KX, by = (nodeLat[e.nodes[k + 1]] / 1e7 - lat) * KY;
        const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
        let t = L2 > 0 ? -(ax * dx + ay * dy) / L2 : 0;
        t = Math.max(0, Math.min(1, t));
        const px = ax + t * dx, py = ay + t * dy, d = Math.hypot(px, py);
        if (d <= maxM && (!best || d < best.d)) best = { ei, k, t, lon: lon + px / KX, lat: lat + py / KY, d };
      }
    }
  }
  return best;
}

/* ---- 4. station access points ------------------------------------------- */
// Each access point becomes a graph node: an entrance already on a way is one
// (keepNode); anything else is projected onto an edge, which is split there.
const splits = new Map();        // edge index -> [{k, t, lon, lat, tag}]
const access = {};               // station id -> { how, assumed, far, pts: [{tag | vertex, conn}] }
let splitSeq = 0;
function addSplit(hit) {
  const tag = ++splitSeq;
  if (!splits.has(hit.ei)) splits.set(hit.ei, []);
  splits.get(hit.ei).push({ k: hit.k, t: hit.t, lon: hit.lon, lat: hit.lat, tag });
  return tag;
}
const isSnappable = (e) => !(e.flag & 1);
const isPlatformEdge = (e) => (e.flag & 2) !== 0;
const counts = { entrance: 0, platform: 0, snap: 0, far: 0, none: 0 };
for (const s of stations) {
  const rec = { how: null, assumed: !s.exists_today, pts: [] };
  // (a) entrances
  for (const ni of (s.exists_today && entrancesByStation.get(s.id)) || []) {
    const vid = vOf[ni];
    if (vid >= 0 && deg[vid] > 0) { rec.pts.push({ vertex: vid, conn: 0 }); continue; }
    const lon = nodeLon[ni] / 1e7, lat = nodeLat[ni] / 1e7;
    const hit = nearestOnEdges(lon, lat, ENTRANCE_LINK_M, null);
    if (hit) rec.pts.push({ tag: addSplit(hit), conn: hit.d });
  }
  if (rec.pts.length) rec.how = "entrance";
  if (!rec.pts.length) {
    // (b) no entrances mapped: a platform way at the station, if the network
    // reaches one (an embankment station's stairs, a big terminal's concourse)...
    if (s.exists_today) {
      const hit = nearestOnEdges(s.lon, s.lat, PLATFORM_M, isPlatformEdge);
      if (hit) { rec.pts.push({ tag: addSplit(hit), conn: 0 }); rec.how = "platform"; }
    }
    // (c) ...and the nearest street to the station point, so the walk reaches
    // whichever comes first. The connector isn't charged: R5's own walk from
    // the station point (in the matrix cell) starts from about here.
    let hit = nearestOnEdges(s.lon, s.lat, SNAP_M, isSnappable);
    if (!hit) { hit = nearestOnEdges(s.lon, s.lat, SNAP_FAR_M, null); if (hit) rec.far = true; }
    if (hit) { rec.pts.push({ tag: addSplit(hit), conn: 0 }); rec.how = rec.how || "snap"; }
  }
  counts[rec.how || "none"]++;
  if (rec.far) counts.far++;
  access[s.id] = rec;
}
log(`station access: ${counts.entrance} by entrance, ${counts.platform} by platform, ${counts.snap} snapped ` +
    `(${counts.far} beyond ${SNAP_M} m), ${counts.none} with no street within ${SNAP_FAR_M} m`);

/* ---- apply the splits; give every graph node its integer key ----------- */
// Final edges carry integer coordinates (millionths of a degree). Vertex keys
// must be unique: two different vertices that round to the same spot (rare;
// a bridge drawn with a node right over the street below) are nudged apart.
const keyOwner = new Map();      // "lonE6,latE6" -> owner
const vKey = new Map();          // owner (vertex id, or "s<tag>" for a split point) -> [lonE6, latE6]
let nudged = 0;
function claimKey(owner, lonE6, latE6) {
  if (vKey.has(owner)) return vKey.get(owner);
  let x = lonE6;
  while (keyOwner.has(x + "," + latE6)) x++;
  if (x !== lonE6) nudged++;
  keyOwner.set(x + "," + latE6, owner);
  const c = [x, latE6]; vKey.set(owner, c); return c;
}
const splitOwner = new Map();    // split tag -> the owner of the node it landed on
const E6 = (v7) => Math.round(v7 / 10);
const finalEdges = [];           // { coords: [[lonE6, latE6], ...], len, flag }
for (let ei = 0; ei < edges.length; ei++) {
  const e = edges[ei];
  const full = e.nodes.map((n) => [nodeLon[n] / 1e7, nodeLat[n] / 1e7]);
  const last = full.length - 1;
  // Split points in order along the edge; pos = segment index + fraction.
  const sp = (splits.get(ei) || []).map((p) => ({ pos: p.k + p.t, lon: p.lon, lat: p.lat, tag: p.tag }))
    .sort((a, b) => a.pos - b.pos);
  const pieces = [];
  let cur = [full[0]], curOwner = e.a, lastPos = 0;
  for (const p of sp) {
    if (p.pos <= 1e-9) { splitOwner.set(p.tag, e.a); continue; }             // on the start vertex
    if (p.pos >= last - 1e-9) { splitOwner.set(p.tag, e.b); continue; }      // on the end vertex
    if (lastPos > 0 && p.pos - lastPos <= 1e-9) { splitOwner.set(p.tag, curOwner); continue; }  // same spot
    const k = Math.floor(p.pos), t = p.pos - k;
    for (let j = Math.floor(lastPos) + 1; j <= (t > 1e-9 ? k : k - 1); j++) cur.push(full[j]);
    cur.push([p.lon, p.lat]);
    const owner = "s" + p.tag;
    splitOwner.set(p.tag, owner);
    pieces.push({ coords: cur, startOwner: curOwner, endOwner: owner });
    cur = [[p.lon, p.lat]]; curOwner = owner; lastPos = p.pos;
  }
  for (let j = Math.floor(lastPos) + 1; j <= last; j++) cur.push(full[j]);
  pieces.push({ coords: cur, startOwner: curOwner, endOwner: e.b });

  const ownerCoord = (owner, c) => typeof owner === "number"
    ? claimKey(owner, E6(nodeLon[vNode[owner]]), E6(nodeLat[vNode[owner]]))
    : claimKey(owner, Math.round(c[0] * 1e6), Math.round(c[1] * 1e6));
  for (const pc of pieces) {
    let len = 0;
    for (let j = 1; j < pc.coords.length; j++) len += haversineM(pc.coords[j - 1][0], pc.coords[j - 1][1], pc.coords[j][0], pc.coords[j][1]);
    const a = ownerCoord(pc.startOwner, pc.coords[0]);
    const b = ownerCoord(pc.endOwner, pc.coords[pc.coords.length - 1]);
    if (len < 0.05 && a === b) continue;
    const mid = pc.coords.slice(1, -1).map((c) => [Math.round(c[0] * 1e6), Math.round(c[1] * 1e6)]);
    finalEdges.push({ coords: [a, ...mid, b], len: Math.max(len, 0.1), flag: e.flag });
  }
}
log(`${finalEdges.length.toLocaleString()} edges after access splits; ${nudged} vertex keys nudged apart`);

/* ---- Douglas-Peucker (in local meters), endpoints kept ----------------- */
function simplify(coords) {
  if (coords.length <= 2) return coords;
  const KX = kx(coords[0][1] / 1e6) / 1e6, KYm = KY / 1e6;
  const keep = new Uint8Array(coords.length); keep[0] = keep[coords.length - 1] = 1;
  const stack = [[0, coords.length - 1]];
  while (stack.length) {
    const [i0, i1] = stack.pop();
    const ax = coords[i0][0] * KX, ay = coords[i0][1] * KYm, bx = coords[i1][0] * KX, by = coords[i1][1] * KYm;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    let worst = -1, wd = SIMPLIFY_M;
    for (let i = i0 + 1; i < i1; i++) {
      const px = coords[i][0] * KX - ax, py = coords[i][1] * KYm - ay;
      let t = L2 > 0 ? (px * dx + py * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - t * dx, py - t * dy);
      if (d > wd) { wd = d; worst = i; }
    }
    if (worst > 0) { keep[worst] = 1; stack.push([i0, worst], [worst, i1]); }
  }
  return coords.filter((_, i) => keep[i]);
}
let vtxBefore = 0, vtxAfter = 0;
for (const e of finalEdges) { vtxBefore += e.coords.length; e.coords = simplify(e.coords); vtxAfter += e.coords.length; }
log(`simplified ${vtxBefore.toLocaleString()} -> ${vtxAfter.toLocaleString()} vertices`);

/* ---- 5. tiles ------------------------------------------------------------ */
const { lon0E6, lat0E6, dLonE6, dLatE6 } = GRID;
const tileOf = (lonE6, latE6) => [Math.floor((lonE6 - lon0E6) / dLonE6), Math.floor((latE6 - lat0E6) / dLatE6)];
// Tiles whose rectangle comes within KEEP_TILE_M of a station (rail or South Shore).
const keepTiles = new Set();
const pts = stations.map((s) => [s.lon, s.lat]).concat((ssl.stations || []).map((s) => [s.lon, s.lat]));
for (const [lon, lat] of pts) {
  const KX = kx(lat), rLon = KEEP_TILE_M / KX, rLat = KEEP_TILE_M / KY;
  const [i0, j0] = tileOf(Math.round((lon - rLon) * 1e6), Math.round((lat - rLat) * 1e6));
  const [i1, j1] = tileOf(Math.round((lon + rLon) * 1e6), Math.round((lat + rLat) * 1e6));
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const w = (lon0E6 + i * dLonE6) / 1e6, e = w + dLonE6 / 1e6, s = (lat0E6 + j * dLatE6) / 1e6, n = s + dLatE6 / 1e6;
    const cx = Math.max(w, Math.min(lon, e)), cy = Math.max(s, Math.min(lat, n));
    if (Math.hypot((cx - lon) * KX, (cy - lat) * KY) <= KEEP_TILE_M) keepTiles.add(i + "_" + j);
  }
}
// Every tile a polyline passes through (grid traversal in tile units).
function tilesTouched(coords) {
  const out = new Set();
  for (let k = 0; k < coords.length; k++) {
    const x0 = (coords[k][0] - lon0E6) / dLonE6, y0 = (coords[k][1] - lat0E6) / dLatE6;
    out.add(Math.floor(x0) + "_" + Math.floor(y0));
    if (k + 1 === coords.length) break;
    const x1 = (coords[k + 1][0] - lon0E6) / dLonE6, y1 = (coords[k + 1][1] - lat0E6) / dLatE6;
    let ix = Math.floor(x0), iy = Math.floor(y0);
    const ex = Math.floor(x1), ey = Math.floor(y1);
    const dx = x1 - x0, dy = y1 - y0, sx = Math.sign(dx), sy = Math.sign(dy);
    let tMaxX = dx ? ((sx > 0 ? ix + 1 : ix) - x0) / dx : Infinity, tMaxY = dy ? ((sy > 0 ? iy + 1 : iy) - y0) / dy : Infinity;
    const tDX = dx ? Math.abs(1 / dx) : Infinity, tDY = dy ? Math.abs(1 / dy) : Infinity;
    let guard = 0;
    while ((ix !== ex || iy !== ey) && guard++ < 1000) {
      if (tMaxX < tMaxY) { ix += sx; tMaxX += tDX; } else { iy += sy; tMaxY += tDY; }
      out.add(ix + "_" + iy);
    }
  }
  return out;
}
const tileEdges = new Map();     // tile key -> [edge index]
let nextId = 1, multi = 0;
const edgeId = new Int32Array(finalEdges.length);
for (let i = 0; i < finalEdges.length; i++) {
  const ts = [...tilesTouched(finalEdges[i].coords)].filter((t) => keepTiles.has(t));
  if (!ts.length) continue;
  if (ts.length > 1) { edgeId[i] = nextId++; multi++; }
  for (const t of ts) { if (!tileEdges.has(t)) tileEdges.set(t, []); tileEdges.get(t).push(i); }
}

/* ---- write ---------------------------------------------------------------- */
const TDIR = path.join(OUT, "t");
fs.rmSync(TDIR, { recursive: true, force: true });
fs.mkdirSync(TDIR, { recursive: true });
let bytes = 0, edgesWritten = 0;
const tileList = [...tileEdges.keys()].sort();
for (const key of tileList) {
  const [i, j] = key.split("_").map(Number);
  const ox = lon0E6 + i * dLonE6, oy = lat0E6 + j * dLatE6;
  const rows = tileEdges.get(key).map((ei) => {
    const e = finalEdges[ei], c = e.coords;
    const row = [edgeId[ei], Math.max(1, Math.round(e.len)), e.flag & 3, c[0][0] - ox, c[0][1] - oy];
    for (let k = 1; k < c.length; k++) row.push(c[k][0] - c[k - 1][0], c[k][1] - c[k - 1][1]);
    return row;
  });
  edgesWritten += rows.length;
  const json = '{"e":[' + rows.map((r) => "[" + r.join(",") + "]").join(",\n") + "]}\n";
  fs.writeFileSync(path.join(TDIR, key + ".json"), json);
  bytes += Buffer.byteLength(json);
}

// Station access points, as integer coordinates of their graph nodes.
const stationsOut = {};
for (const s of stations) {
  const rec = access[s.id];
  const a = [];
  for (const p of rec.pts) {
    let c = null;
    if (p.vertex != null) c = vKey.get(p.vertex);
    else { const owner = splitOwner.get(p.tag); c = owner != null ? vKey.get(owner) : null; }
    if (c) a.push([c[0], c[1], Math.round(p.conn)]);
  }
  if (!a.length) continue;
  const o = { how: rec.how, a };
  if (rec.assumed) o.assumed = 1;
  if (rec.far) o.far = 1;
  stationsOut[s.id] = o;
}
const index = {
  v: 1,
  built: new Date().toISOString(),
  source: path.relative(REPO, PBF),
  grid: GRID,
  tiles: tileList,
  stations: stationsOut,
  stats: {
    tiles: tileList.length, edges: edgesWritten, crossTileEdges: multi, bytes,
    access: counts, minComponentM: MIN_COMPONENT_M, simplifyM: SIMPLIFY_M
  }
};
const indexJson = JSON.stringify(index);
fs.writeFileSync(path.join(OUT, "index.json"), indexJson + "\n");
bytes += indexJson.length;
log(`wrote ${tileList.length} tiles (${edgesWritten.toLocaleString()} edge copies, ${multi.toLocaleString()} edges span tiles) ` +
    `+ index.json = ${(bytes / 1048576).toFixed(1)} MB in ${path.relative(REPO, OUT)}/`);
const missing = stations.filter((s) => !stationsOut[s.id]).map((s) => s.name);
if (missing.length) log("stations with no access point (walks fall back to straight-line):", missing.join("; "));
