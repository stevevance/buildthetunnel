#!/usr/bin/env node
/*
 * Build assets/city-corridor.js: the city along this film's new track, beyond what assets/city-wide.js covers
 * (the Metra Electric south of McCormick Place, the UP North north of Clybourn), BUFFER metres either side of it.
 * index.html adds it to city-wide.js's lists. The same sources and rules as tools/build-city.mjs (buildings and
 * streets from OpenStreetMap via Overpass, water and parks from the OpenFreeMap vector tiles), in the same local
 * metres, so the two join up.
 *
 *   node tools/build-corridor.mjs [cache-dir]           (needs assets/tracks.js: node tools/build-tracks.mjs)
 *
 * Overpass queries go through the Chicago Cityscape CLI (cli/overpass.php, CITYSCAPE_CLI to point elsewhere), which
 * uses the paid Overspan endpoint first and falls back to the public servers. Overspan caps a query at 60 seconds,
 * so each asks for 55. Every answer is cached, so a rerun fetches only what it doesn't have.
 *
 * All (c) OpenStreetMap contributors.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { VectorTile } from "@mapbox/vector-tile";
import * as pbfNs from "pbf";
import { ME_LINE, UPN_LINE } from "../assets/tracks.js";
const Pbf = pbfNs.default || pbfNs.PbfReader || pbfNs;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = process.argv[2] || path.join(os.tmpdir(), "cab-ride-corridor-cache");
fs.mkdirSync(CACHE, { recursive: true });

const BUFFER = 500, CHUNK = 1500;                                 // metres either side of the track; length of each Overpass query's stretch
const [LON0, LAT0] = [-87.620063, 41.863968];                    // city-wide.js's origin
const KX = 111.32 * 1000 * Math.cos(LAT0 * Math.PI / 180), KY = 111.07 * 1000;
const proj = ([lon, lat]) => [(lon - LON0) * KX, -(lat - LAT0) * KY];
const unX = (x) => LON0 + x / KX, unZ = (z) => LAT0 - z / KY;
const r1 = (v) => Math.round(v * 10) / 10;
const centroid = (ring) => { let x = 0, y = 0; for (const p of ring) { x += p[0]; y += p[1]; } return [x / ring.length, y / ring.length]; };
// city-wide.js's extent (tools/build-city.mjs --wide): what's inside it is already in the film
const WIDE = { west: -4900, east: 1500, north: -6900, south: 1300 };
const inWide = ([x, z]) => x > WIDE.west && x < WIDE.east && z > WIDE.north && z < WIDE.south;

// the new track, as projected polylines, and whether a point is within BUFFER of it
const lines = [ME_LINE, UPN_LINE].map((l) => l.map(proj));
const segDist = (p, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz;
  const f = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)) : 0;
  return Math.hypot(p[0] - a[0] - f * dx, p[1] - a[1] - f * dz);
};
const near = (p, m = BUFFER) => lines.some((l) => { for (let i = 1; i < l.length; i++) if (segDist(p, l[i - 1], l[i]) < m) return true; return false; });
const wanted = (p) => near(p) && !inWide(p);
// the stretches to query: each line cut every CHUNK metres, as a [south, west, north, east] box padded by BUFFER
const boxes = [];
for (const l of lines) {
  let from = 0, run = 0;
  for (let i = 1; i < l.length; i++) {
    run += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]);
    if (run < CHUNK && i < l.length - 1) continue;
    const pts = l.slice(from, i + 1), xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    const box = [Math.min(...xs) - BUFFER, Math.min(...zs) - BUFFER, Math.max(...xs) + BUFFER, Math.max(...zs) + BUFFER];
    if (!(box[0] > WIDE.west && box[2] < WIDE.east && box[1] > WIDE.north && box[3] < WIDE.south)) boxes.push(box);
    from = i; run = 0;
  }
}
const bbox = (b) => [unZ(b[3]), unX(b[0]), unZ(b[1]), unX(b[2])].map((v) => v.toFixed(5)).join(",");

const CLI = process.env.CITYSCAPE_CLI || path.join(os.homedir(), "Sites", "Chicago Cityscape", "cli", "overpass.php");
// (cached by name: each stretch's is its box, so a stretch re-cut after the track changes is fetched afresh)
async function overpass(name, query) {
  const file = path.join(CACHE, name + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).elements;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const text = execFileSync("php", [CLI, "--json"], { input: query, encoding: "utf8", maxBuffer: 1 << 30 });
      if (text.trimStart()[0] === "{") {
        fs.writeFileSync(file, text);
        console.log("fetched", name);
        return JSON.parse(text).elements;
      }
      console.warn(name, "not JSON:", text.slice(0, 200));
    } catch (e) { console.warn(name, "failed:", (e.stderr || e.message || "").toString().slice(0, 300)); }
    await new Promise((r) => setTimeout(r, 10000 * 2 ** attempt));
  }
  throw new Error("Overpass failed for " + name);
}

/* ---- buildings (as build-city.mjs: parts replace their outline; real colours and materials where OSM has them) ---- */
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
// Landmarks a rider on these stretches would know: [name pattern, colour, facade]
const LANDMARKS = [
  [/Obama Presidential Center|Obama Presidential Library|Presidential Center Museum/, [0.86, 0.84, 0.80], "s"],   // pale granite tower
  [/Museum of Science and Industry/, [0.90, 0.87, 0.80], "s"],    // white Beaux-Arts, the 1893 fair's Palace of Fine Arts
  [/^McCormick Place (North|South|East|West|Lakeside)/, [0.36, 0.38, 0.40], "d"],   // the halls (not the hotel or the car parks)
  [/Rockefeller Memorial Chapel/, [0.80, 0.74, 0.62], "p"],
  [/Mercy Hospital/, [0.82, 0.78, 0.70], "r"],
];
const height = (t) => {
  const m = /^[\d.]+/.exec(t.height || "");
  if (m) return parseFloat(m[0]) * (/ft|'/.test(t.height) ? 0.3048 : 1);
  const lv = parseFloat(t["building:levels"]);
  return lv > 0 ? lv * 3.6 + (parseFloat(t["roof:levels"]) || 0) * 3 : 0;
};
const minHeight = (t) => parseFloat(t.min_height) || (parseFloat(t["building:min_level"]) || 0) * 3.6;

const polys = [], seenEl = new Set();
for (const [i, b] of boxes.entries()) {
  const els = await overpass("buildings-" + bbox(b), `[out:json][timeout:55];(way["building"](${bbox(b)});relation["building"](${bbox(b)});way["building:part"](${bbox(b)});relation["building:part"](${bbox(b)}););out body geom;`);
  for (const e of els) {
    if (seenEl.has(e.type + e.id)) continue;
    seenEl.add(e.type + e.id);
    const t = e.tags || {};
    const rings = e.type === "way" ? [e.geometry] : (e.members || []).filter((m) => m.role === "outer" && m.geometry).map((m) => m.geometry);
    for (const g of rings) {
      if (!g || g.length < 4 || g[0].lat !== g[g.length - 1].lat || g[0].lon !== g[g.length - 1].lon) continue;
      const ring = g.map((p) => proj([p.lon, p.lat]));
      if (!wanted(centroid(ring))) continue;
      const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
      polys.push({ ring, t, part: !!t["building:part"] && t["building:part"] !== "no",
        box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], c: centroid(ring) });
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
// each part belongs to the outline that contains it (looked up by a coarse grid: there are tens of thousands)
const G = 200, grid = new Map(), gk = (x, z) => Math.floor(x / G) * 100003 + Math.floor(z / G);
for (const O of outlines) {
  for (let x = Math.floor(O.box[0] / G); x <= Math.floor(O.box[2] / G); x++) for (let z = Math.floor(O.box[1] / G); z <= Math.floor(O.box[3] / G); z++) {
    const k = x * 100003 + z; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(O);
  }
}
for (const P of parts) { P.parent = (grid.get(gk(P.c[0], P.c[1])) || []).find((O) => inside(P.c, O)); if (P.parent) P.parent.hasParts = true; }
const buildings = [];
let styled = 0, next = 200000;                                   // numbers (for colour) clear of city-wide.js's
for (const P of polys) {
  if (!P.part && P.hasParts) continue;
  const own = P.t, par = (P.parent && P.parent.t) || {};
  const tag = (k) => own[k] || par[k];
  const h = height(own) || height(par) || 6, m = minHeight(own);
  if (h - m < 1) continue;
  const name = tag("name") || "";
  const b = { h: r1(h), m: r1(m), p: P.ring.flatMap((q) => [r1(q[0]), r1(q[1])]), i: next++ };
  const lm = name && LANDMARKS.find((L) => L[0].test(name));
  const mat = MATERIAL[tag("building:material")];
  const col = rgb(tag("building:colour"));
  if (lm) { b.c = lm[1]; b.f = lm[2]; b.n = name; styled++; }
  else if (col || mat) { b.c = col || mat[0]; b.f = mat ? mat[1] : (h > 60 ? "r" : "p"); }
  const rs = own["roof:shape"];
  if (rs && rs !== "flat") { b.rs = rs; b.rh = r1(parseFloat(own["roof:height"]) || 0); }
  if (P.part) b.pt = 1;
  buildings.push(b);
}

/* ---- streets ---- */
const WIDTH = { motorway: 16, trunk: 15, primary: 14, secondary: 12, tertiary: 10, residential: 8, unclassified: 8, service: 5, living_street: 6 };
const roads = [], seenRoad = new Set();
for (const [i, b] of boxes.entries()) {
  const els = await overpass("roads-" + bbox(b), `[out:json][timeout:55];way["highway"~"^(${Object.keys(WIDTH).join("|")})$"](${bbox(b)});out body geom;`);
  for (const e of els) {
    if (!e.geometry || e.tags.tunnel === "yes" || seenRoad.has(e.id)) continue;
    const p = e.geometry.map((q) => proj([q.lon, q.lat]));
    if (!p.some(wanted)) continue;
    seenRoad.add(e.id);
    const rd = { w: WIDTH[e.tags.highway] * (e.tags.oneway === "yes" ? 0.6 : 1), p: p.flatMap((q) => q.map(r1)) };
    if (e.tags.bridge && e.tags.bridge !== "no") rd.b = 1;
    roads.push(rd);
  }
}

/* ---- water and parks, from the vector tiles touching the corridor ---- */
const Z = 14;
const lon2x = (lon) => Math.floor((lon + 180) / 360 * 2 ** Z);
const lat2y = (lat) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** Z); };
const tiles = new Set();
for (const b of boxes) for (let x = lon2x(unX(b[0])); x <= lon2x(unX(b[2])); x++) for (let y = lat2y(unZ(b[1])); y <= lat2y(unZ(b[3])); y++) tiles.add(x + "/" + y);
const tileBounds = (x, y) => {
  const n = 2 ** Z, lon = (v) => v / n * 360 - 180;
  const lat = (v) => Math.atan(Math.sinh(Math.PI * (1 - 2 * v / n))) * 180 / Math.PI;
  return { w: lon(x), e: lon(x + 1), n: lat(y), s: lat(y + 1) };
};
const template = (await (await fetch("https://tiles.openfreemap.org/planet")).json()).tiles[0];
const flat = (ring) => ring.flatMap((p) => { const q = proj(p); return [r1(q[0]), r1(q[1])]; });
const water = [], parks = [];
for (const xy of tiles) {
  const [x, y] = xy.split("/").map(Number), file = path.join(CACHE, `tile-${Z}-${x}-${y}.pbf`);
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
  // the lake is one huge polygon: keep any water that reaches the corridor; parks whose outline comes near it
  each("water", null, water, (ring) => !ring.every(inWide) && ring.some((p) => near(p, BUFFER * 3)));
  each("park", null, parks, (ring) => !inWide(centroid(ring)) && ring.some((p) => near(p)));
  each("landcover", (p) => p.class === "grass" || p.class === "wood", parks, (ring) => !inWide(centroid(ring)) && ring.some((p) => near(p)));
}

const file = path.join(HERE, "..", "assets", "city-corridor.js");
fs.writeFileSync(file, "// Generated by tools/build-corridor.mjs. Don't edit by hand. Buildings and streets: OpenStreetMap via Overpass. " +
  "Water and parks: OpenFreeMap / OpenMapTiles. All (c) OpenStreetMap contributors.\nexport default " + JSON.stringify({ buildings, roads, water, parks }) + ";\n");
console.log(`${boxes.length} stretches; ${buildings.length} buildings (${styled} landmark pieces: ${[...new Set(buildings.filter((b) => b.n).map((b) => b.n))].join("; ")}), ` +
  `${roads.length} streets, ${water.length} water, ${parks.length} park polygons; ${(fs.statSync(file).size / 1e6).toFixed(2)} MB`);
