#!/usr/bin/env node
/*
 * Build assets/city-intro.js: the city the film's opening shot looks over, high above Jackson Park south of 59th St,
 * beyond what assets/city-corridor.js already has (BUFFER metres either side of the track) and assets/city-wide.js
 * covers: the rest of Jackson Park, Woodlawn and the south of Hyde Park, inside AREA. The same sources and rules as
 * tools/build-corridor.mjs (buildings and streets from OpenStreetMap via Overpass, water and parks from the OpenFreeMap
 * vector tiles), in the same local metres; and three things the other files don't have, for the whole of AREA: park
 * paths (footways, paths, cycleways), mapped trees (natural=tree), and woods (where trees stand thick). index.html adds
 * it to the city's lists.
 *
 *   node tools/build-intro-area.mjs [cache-dir]          (needs assets/tracks.js: node tools/build-tracks.mjs)
 *
 * Overpass queries go through the Chicago Cityscape CLI (cli/overpass.php, CITYSCAPE_CLI to point elsewhere). Every
 * answer is cached, so a rerun fetches only what it doesn't have.
 *
 * All (c) OpenStreetMap contributors.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { VectorTile } from "@mapbox/vector-tile";
import * as pbfNs from "pbf";
import { ME_LINE, UPN_LINE } from "../assets/tracks.js";
const Pbf = pbfNs.default || pbfNs.PbfReader || pbfNs;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = process.argv[2] || path.join(os.tmpdir(), "cab-ride-intro-cache");
fs.mkdirSync(CACHE, { recursive: true });

// Jackson Park, Woodlawn and the south of Hyde Park: from Washington Park's east edge to the lake, 67th St to 55th St
const AREA = { west: -87.6125, east: -87.565, south: 41.765, north: 41.8 };
const BUFFER = 500, CHUNK = 1400;                                 // city-corridor.js's reach either side of the track; each query's box
const [LON0, LAT0] = [-87.620063, 41.863968];                    // city-wide.js's origin
const KX = 111.32 * 1000 * Math.cos(LAT0 * Math.PI / 180), KY = 111.07 * 1000;
const proj = ([lon, lat]) => [(lon - LON0) * KX, -(lat - LAT0) * KY];
const unX = (x) => LON0 + x / KX, unZ = (z) => LAT0 - z / KY;
const r1 = (v) => Math.round(v * 10) / 10;
const centroid = (ring) => { let x = 0, y = 0; for (const p of ring) { x += p[0]; y += p[1]; } return [x / ring.length, y / ring.length]; };
const [AW, AS] = proj([AREA.west, AREA.south]), [AE, AN] = proj([AREA.east, AREA.north]);
const inArea = ([x, z]) => x > AW && x < AE && z < AS && z > AN;
const WIDE = { west: -4900, east: 1500, north: -6900, south: 1300 };
const inWide = ([x, z]) => x > WIDE.west && x < WIDE.east && z > WIDE.north && z < WIDE.south;
const lines = [ME_LINE, UPN_LINE].map((l) => l.map(proj));
const segDist = (p, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz;
  const f = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)) : 0;
  return Math.hypot(p[0] - a[0] - f * dx, p[1] - a[1] - f * dz);
};
const near = (p, m = BUFFER) => lines.some((l) => { for (let i = 1; i < l.length; i++) if (segDist(p, l[i - 1], l[i]) < m) return true; return false; });
// what city-corridor.js and city-wide.js don't already have
const fresh = (p) => inArea(p) && !near(p) && !inWide(p);

const boxes = [];                                                 // [west, north, east, south] in local metres
for (let x = AW; x < AE; x += CHUNK) for (let z = AN; z < AS; z += CHUNK) boxes.push([x, z, Math.min(x + CHUNK, AE), Math.min(z + CHUNK, AS)]);
const bbox = (b) => [unZ(b[3]), unX(b[0]), unZ(b[1]), unX(b[2])].map((v) => v.toFixed(5)).join(",");

const CLI = process.env.CITYSCAPE_CLI || path.join(os.homedir(), "Sites", "Chicago Cityscape", "cli", "overpass.php");
async function overpass(name, query) {
  const file = path.join(CACHE, name + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).elements;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = execFileSync("php", [CLI, "--json"], { input: query, encoding: "utf8", maxBuffer: 1 << 30 });
      if (text.trimStart()[0] === "{") { fs.writeFileSync(file, text); console.log("fetched", name); return JSON.parse(text).elements; }
      console.warn(name, "not JSON:", text.slice(0, 200));
    } catch (e) { console.warn(name, "failed:", (e.stderr || e.message || "").toString().slice(0, 300)); }
    await new Promise((r) => setTimeout(r, 10000 * 2 ** attempt));
  }
  throw new Error("Overpass failed for " + name);
}

/* ---- buildings (as build-corridor.mjs: parts replace their outline; real colours and materials where OSM has them) ---- */
const NAMED = { black: "#2a2a2c", white: "#f0f0ee", grey: "#9a9a9a", gray: "#9a9a9a", tan: "#c8ab82", brown: "#7a5a44", beige: "#dccfb4",
  red: "#a8402e", silver: "#c2c8cc", blue: "#5a82b4", green: "#5f8f72", yellow: "#d8c060", orange: "#c8763a", darkgrey: "#555558", lightgrey: "#c8c8c8" };
const rgb = (c) => {
  if (!c) return null;
  c = NAMED[c.toLowerCase().replace(/[ _-]/g, "")] || c;
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1];
  return [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) / 2.55) / 100);
};
const MATERIAL = { brick: [[0.62, 0.36, 0.28], "p"], glass: [[0.46, 0.60, 0.76], "c"], metal: [[0.72, 0.75, 0.78], "r"], steel: [[0.30, 0.32, 0.35], "d"],
  concrete: [[0.78, 0.76, 0.72], "r"], stone: [[0.84, 0.80, 0.72], "p"], limestone: [[0.88, 0.84, 0.74], "p"], marble: [[0.92, 0.90, 0.86], "s"],
  cement_block: [[0.74, 0.73, 0.70], "p"], sandstone: [[0.80, 0.68, 0.52], "p"], granite: [[0.70, 0.66, 0.64], "p"] };
const LANDMARKS = [
  [/Museum of Science and Industry/, [0.90, 0.87, 0.80], "s"],    // white Beaux-Arts, the 1893 fair's Palace of Fine Arts
  [/Rockefeller Memorial Chapel/, [0.80, 0.74, 0.62], "p"],
];
const height = (t) => {
  const m = /^[\d.]+/.exec(t.height || "");
  if (m) return parseFloat(m[0]) * (/ft|'/.test(t.height) ? 0.3048 : 1);
  const lv = parseFloat(t["building:levels"]);
  return lv > 0 ? lv * 3.6 + (parseFloat(t["roof:levels"]) || 0) * 3 : 0;
};
const minHeight = (t) => parseFloat(t.min_height) || (parseFloat(t["building:min_level"]) || 0) * 3.6;
const polys = [], seen = new Set();
for (const b of boxes) {
  const els = await overpass("buildings-" + bbox(b), `[out:json][timeout:55];(way["building"](${bbox(b)});relation["building"](${bbox(b)});way["building:part"](${bbox(b)});relation["building:part"](${bbox(b)}););out body geom;`);
  for (const e of els) {
    if (seen.has(e.type + e.id)) continue;
    seen.add(e.type + e.id);
    const t = e.tags || {};
    const rings = e.type === "way" ? [e.geometry] : (e.members || []).filter((m) => m.role === "outer" && m.geometry).map((m) => m.geometry);
    for (const g of rings) {
      if (!g || g.length < 4 || g[0].lat !== g[g.length - 1].lat || g[0].lon !== g[g.length - 1].lon) continue;
      const ring = g.map((p) => proj([p.lon, p.lat]));
      if (!fresh(centroid(ring))) continue;
      const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
      polys.push({ ring, t, part: !!t["building:part"] && t["building:part"] !== "no", box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], c: centroid(ring) });
    }
  }
}
const inside = (pt, P) => {
  if (pt[0] < P.box[0] || pt[0] > P.box[2] || pt[1] < P.box[1] || pt[1] > P.box[3]) return false;
  let hit = false;
  for (let i = 0, j = P.ring.length - 1; i < P.ring.length; j = i++) {
    const a = P.ring[i], b = P.ring[j];
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
};
const outlines = polys.filter((p) => !p.part), parts = polys.filter((p) => p.part);
for (const P of parts) { P.parent = outlines.find((O) => inside(P.c, O)); if (P.parent) P.parent.hasParts = true; }
const buildings = [];
let next = 400000;                                               // numbers (for colour) clear of city-wide.js's and city-corridor.js's
for (const P of polys) {
  if (!P.part && P.hasParts) continue;
  const own = P.t, par = (P.parent && P.parent.t) || {}, tag = (k) => own[k] || par[k];
  const h = height(own) || height(par) || 6, m = minHeight(own);
  if (h - m < 1) continue;
  const name = tag("name") || "";
  const b = { h: r1(h), m: r1(m), p: P.ring.flatMap((q) => [r1(q[0]), r1(q[1])]), i: next++ };
  const lm = name && LANDMARKS.find((L) => L[0].test(name)), mat = MATERIAL[tag("building:material")], col = rgb(tag("building:colour"));
  if (lm) { b.c = lm[1]; b.f = lm[2]; b.n = name; }
  else if (col || mat) { b.c = col || mat[0]; b.f = mat ? mat[1] : (h > 60 ? "r" : "p"); }
  const rs = own["roof:shape"];
  if (rs && rs !== "flat") { b.rs = rs; b.rh = r1(parseFloat(own["roof:height"]) || 0); }
  if (P.part) b.pt = 1;
  buildings.push(b);
}

/* ---- streets; and, everywhere in AREA, park paths (not the sidewalks and crossings that run with the streets) ---- */
const WIDTH = { motorway: 16, trunk: 15, primary: 14, secondary: 12, tertiary: 10, residential: 8, unclassified: 8, service: 5, living_street: 6 };
const PATH_W = { footway: 2.4, path: 2.4, cycleway: 3, pedestrian: 5, bridleway: 2.4 };
// avenues: every residential street in AREA (those near the track are in city-corridor.js too), for the trees along them
const roads = [], paths = [], avenues = [], seenWay = new Set();
for (const b of boxes) {
  const els = await overpass("ways-" + bbox(b), `[out:json][timeout:55];way["highway"~"^(${[...Object.keys(WIDTH), ...Object.keys(PATH_W)].join("|")})$"](${bbox(b)});out body geom;`);
  for (const e of els) {
    if (!e.geometry || e.tags.tunnel === "yes" || seenWay.has(e.id)) continue;
    seenWay.add(e.id);
    const p = e.geometry.map((q) => proj([q.lon, q.lat])), hw = e.tags.highway;
    if ((hw === "residential" || hw === "living_street") && p.some(inArea)) avenues.push({ w: WIDTH[hw], p: p.flatMap((q) => q.map(r1)) });
    if (PATH_W[hw]) {
      if (["sidewalk", "crossing", "traffic_island"].includes(e.tags.footway) || e.tags.indoor === "yes" || !p.some(inArea)) continue;
      const pa = { w: PATH_W[hw], p: p.flatMap((q) => q.map(r1)) };
      if (e.tags.bridge && e.tags.bridge !== "no") pa.b = 1;
      paths.push(pa);
    } else if (p.some(fresh)) {
      const rd = { w: WIDTH[hw] * (e.tags.oneway === "yes" ? 0.6 : 1), p: p.flatMap((q) => q.map(r1)) };
      if (e.tags.bridge && e.tags.bridge !== "no") rd.b = 1;
      roads.push(rd);
    }
  }
}
/* ---- the railway: every track in AREA (the film draws those south of where its own track begins) ---- */
const rails = [], seenRail = new Set();
for (const b of boxes) {
  const els = await overpass("rails-" + bbox(b), `[out:json][timeout:55];way["railway"="rail"](${bbox(b)});out body geom;`);
  for (const e of els) {
    if (!e.geometry || seenRail.has(e.id) || e.tags.tunnel === "yes") continue;
    seenRail.add(e.id);
    const p = e.geometry.map((q) => proj([q.lon, q.lat]));
    if (p.some(inArea)) rails.push({ p: p.flatMap((q) => q.map(r1)), ...(e.tags.service ? { s: 1 } : {}) });
  }
}

/* ---- mapped trees ---- */
const trees = [], seenTree = new Set();
for (const b of boxes) {
  const els = await overpass("trees-" + bbox(b), `[out:json][timeout:55];node["natural"="tree"](${bbox(b)});out body;`);
  for (const e of els) {
    if (seenTree.has(e.id)) continue;
    seenTree.add(e.id);
    const q = proj([e.lon, e.lat]);
    if (inArea(q)) trees.push(q.map(r1));
  }
}

/* ---- water, parks and woods, from the vector tiles over AREA ---- */
const Z = 14;
const lon2x = (lon) => Math.floor((lon + 180) / 360 * 2 ** Z);
const lat2y = (lat) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** Z); };
const tiles = [];
for (let x = lon2x(AREA.west); x <= lon2x(AREA.east); x++) for (let y = lat2y(AREA.north); y <= lat2y(AREA.south); y++) tiles.push([x, y]);
const tileBounds = (x, y) => {
  const n = 2 ** Z, lon = (v) => v / n * 360 - 180, lat = (v) => Math.atan(Math.sinh(Math.PI * (1 - 2 * v / n))) * 180 / Math.PI;
  return { w: lon(x), e: lon(x + 1), n: lat(y), s: lat(y + 1) };
};
const template = (await (await fetch("https://tiles.openfreemap.org/planet")).json()).tiles[0];
const flat = (ring) => ring.flatMap((p) => { const q = proj(p); return [r1(q[0]), r1(q[1])]; });
const water = [], parks = [], woods = [];
for (const [x, y] of tiles) {
  const file = path.join(CACHE, `tile-${Z}-${x}-${y}.pbf`);
  if (!fs.existsSync(file)) {
    const res = await fetch(template.replace("{z}", Z).replace("{x}", x).replace("{y}", y));
    if (!res.ok) { console.warn("tile failed", x, y, res.status); continue; }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const tile = new VectorTile(new Pbf(new Uint8Array(fs.readFileSync(file))));
  const b = tileBounds(x, y);
  const mine = (ring) => { const c = centroid(ring); return c[0] >= b.w && c[0] < b.e && c[1] <= b.n && c[1] > b.s; };
  const each = (layerName, filter, out, keep) => {
    const layer = tile.layers[layerName];
    if (!layer) return;
    for (let i = 0; i < layer.length; i++) {
      const f = layer.feature(i);
      if (f.type !== 3 || (filter && !filter(f.properties))) continue;
      const g = f.toGeoJSON(x, y, Z).geometry;
      for (const rings of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
        const outer = rings[0];
        if (outer && outer.length >= 4 && mine(outer) && keep(outer.map(proj))) out.push(flat(outer));
      }
    }
  };
  // what city-corridor.js didn't keep (it kept anything coming near the track); woods: all of AREA's
  const notThere = (ring) => inArea(centroid(ring)) && !inWide(centroid(ring)) && !ring.some((p) => near(p));
  each("water", null, water, (ring) => notThere(ring) && !ring.some((p) => near(p, BUFFER * 3)));
  each("park", null, parks, notThere);
  each("landcover", (p) => p.class === "grass", parks, notThere);
  each("landcover", (p) => p.class === "wood", woods, (ring) => inArea(centroid(ring)));
}

const file = path.join(HERE, "..", "assets", "city-intro.js");
fs.writeFileSync(file, "// Generated by tools/build-intro-area.mjs. Don't edit by hand. Buildings, streets, paths and trees: OpenStreetMap via " +
  "Overpass. Water, parks and woods: OpenFreeMap / OpenMapTiles. All (c) OpenStreetMap contributors.\nexport default " +
  JSON.stringify({ area: [AW, AN, AE, AS].map(r1), buildings, roads, water, parks, paths, avenues, rails, trees, woods }) + ";\n");
console.log(`${boxes.length} boxes; ${buildings.length} buildings, ${roads.length} streets, ${paths.length} paths, ${avenues.length} residential streets, ${rails.length} tracks, ` +
  `${trees.length} mapped trees, ${water.length} water, ${parks.length} parks, ${woods.length} woods; ${(fs.statSync(file).size / 1e6).toFixed(2)} MB`);
