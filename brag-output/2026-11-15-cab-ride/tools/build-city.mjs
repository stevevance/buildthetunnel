#!/usr/bin/env node
/*
 * Build assets/city.js for the cab-ride animation: the Clinton-Roosevelt
 * Connector alignment and its stations plus the real buildings, streets, water
 * and parks around it, all in local metres (x east, z south, origin at the
 * start of the route).
 *
 *   npm install @mapbox/vector-tile pbf      (anywhere on the module path)
 *   node tools/build-city.mjs [cache-dir]
 *   node tools/build-city.mjs --wide [cache-dir]     the wider city for the closing aerial shot -> assets/city-wide.js
 *
 * Sources (all (c) OpenStreetMap contributors):
 *   buildings  OpenStreetMap itself, via Overpass, for its "simple 3D
 *              buildings" detail: building parts with their own heights,
 *              colours, materials and roof shapes. Where a building has parts,
 *              the parts replace its outline.
 *   streets    Overpass, around the two stretches where the line is on the surface.
 *   water and parks   the OpenFreeMap vector tiles (as the site's 3D flythrough uses).
 * The alignment comes from ../../crcl_geo.json.
 *
 * LANDMARKS below gives the buildings a rider would recognise their real
 * colour and facade. Those were set by looking at each one's lead photo on
 * English Wikipedia (and, where it has none, from its article's description).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VectorTile } from "@mapbox/vector-tile";
import * as pbfNs from "pbf";
const Pbf = pbfNs.default || pbfNs.PbfReader || pbfNs;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..", "..");
// --wide: more of the city to the north, west and east (and the lake beyond), and every street rather than
// only those by the surface track, for the film's last shot, which pulls back from Chicago/Halsted to show
// the city. Written to its own file, assets/city-wide.js, so the two can be compared.
const WIDE = process.argv.includes("--wide");
const CACHE = process.argv.slice(2).find((a) => !a.startsWith("--")) || path.join(os.tmpdir(), "cab-ride-city-cache" + (WIDE ? "-wide" : ""));
fs.mkdirSync(CACHE, { recursive: true });
const crcl = JSON.parse(fs.readFileSync(path.join(REPO, "crcl_geo.json"), "utf8"));

const Z = 14;
const [LON0, LAT0] = crcl.path[0];
const KX = 111.32 * 1000 * Math.cos(LAT0 * Math.PI / 180), KY = 111.07 * 1000;
const proj = ([lon, lat]) => [(lon - LON0) * KX, -(lat - LAT0) * KY];
const unX = (x) => LON0 + x / KX, unZ = (z) => LAT0 - z / KY;
// How far around the start of the route to keep, in metres.
// (--wide reaches north-west to Clybourn, where the film now ends: 41.917, -87.668 is about x -3980, z -5900)
const EXTENT = WIDE ? { west: -4900, east: 1500, north: -6900, south: 1300 } : { west: -3100, east: 900, north: -4300, south: 1300 };
const WATER_EAST = WIDE ? 5200 : EXTENT.east;                     // the lake runs on east past the buildings
const inExtent = ([x, z]) => x > EXTENT.west && x < EXTENT.east && z > EXTENT.north && z < EXTENT.south;
const r1 = (v) => Math.round(v * 10) / 10;
const centroid = (ring) => { let x = 0, y = 0; for (const p of ring) { x += p[0]; y += p[1]; } return [x / ring.length, y / ring.length]; };

const route = crcl.path.map(proj);
const stations = crcl.stations.map((s) => { const q = proj(s.lonlat); return { name: s.name, x: r1(q[0]), z: r1(q[1]) }; });

/* ---- Overpass, cached ---- */
async function overpass(name, query) {
  const file = path.join(CACHE, name + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")).elements;
  for (const ep of ["https://overpass-api.de/api/interpreter", "https://lz4.overpass-api.de/api/interpreter", "https://z.overpass-api.de/api/interpreter"]) {
    const res = await fetch(ep, { method: "POST", headers: { "User-Agent": "buildthetunnel-cab-ride/1.0", "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query) });
    if (!res.ok) { console.warn(ep, res.status); continue; }
    const text = await res.text();
    if (text[0] !== "{") continue;
    fs.writeFileSync(file, text);
    return JSON.parse(text).elements;
  }
  throw new Error("Overpass failed for " + name);
}
const bbox = [unZ(EXTENT.south), unX(EXTENT.west), unZ(EXTENT.north), unX(EXTENT.east)].map((v) => v.toFixed(4)).join(",");
const osm = await overpass("buildings", `[out:json][timeout:180];(way["building"](${bbox});relation["building"](${bbox});way["building:part"](${bbox});relation["building:part"](${bbox}););out body geom;`);

/* ---- colours, materials, facades ---- */
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
// material -> [colour, facade]. Facades: p punched windows, c glass curtain wall,
// r ribbon windows, v vertical piers, d dark grid, s plain stone.
const MATERIAL = { brick: [[0.62, 0.36, 0.28], "p"], glass: [[0.46, 0.60, 0.76], "c"], metal: [[0.72, 0.75, 0.78], "r"], steel: [[0.30, 0.32, 0.35], "d"],
  concrete: [[0.78, 0.76, 0.72], "r"], stone: [[0.84, 0.80, 0.72], "p"], limestone: [[0.88, 0.84, 0.74], "p"], marble: [[0.92, 0.90, 0.86], "s"],
  cement_block: [[0.74, 0.73, 0.70], "p"], sandstone: [[0.80, 0.68, 0.52], "p"], granite: [[0.70, 0.66, 0.64], "p"] };
// Landmarks: [name pattern, colour, facade, extras]. Colours are 0-1 RGB.
const LANDMARKS = [
  [/^The Grant$/, [0.40, 0.62, 0.66], "c"],                       // blue-green glass, white trim
  [/One Museum Park|Museum Park (East|West)/, [0.60, 0.70, 0.82], "v"],   // blue-grey glass between white ribs
  [/^NEMA/, [0.22, 0.38, 0.44], "d"],                             // dark teal glass, gridded
  [/^1000M$/, [0.36, 0.56, 0.76], "r"],                           // blue glass in horizontal bands
  [/Essex on the Park/, [0.30, 0.56, 0.58], "c"],                 // teal-green glass
  [/Willis Tower/, [0.17, 0.17, 0.18], "d", { antenna: 85 }],     // black aluminium, bronze glass, two antennas
  [/311 South Wacker/, [0.66, 0.54, 0.50], "p"],                  // pink-brown granite
  [/Field Museum/, [0.93, 0.91, 0.86], "s"],                      // white marble
  [/Shedd Aquarium/, [0.93, 0.91, 0.86], "s"],
  [/Aon Center/, [0.94, 0.94, 0.92], "v"],                        // white granite piers
  [/Two Prudential/, [0.66, 0.68, 0.70], "v"],                    // grey granite, vertical
  [/Blue Cross/, [0.36, 0.52, 0.78], "c"],
  [/CNA Center|333 South Wabash/, [0.62, 0.17, 0.13], "d"],       // the red one
  [/Salesforce Tower/, [0.46, 0.63, 0.86], "c"],                  // reflective blue glass
  [/River Point/, [0.44, 0.60, 0.82], "c"],
  [/150 N(orth)? Riverside/, [0.42, 0.60, 0.84], "c"],
  [/Wolf Point/, [0.52, 0.64, 0.76], "c"],
  [/The Montgomery/, [0.90, 0.88, 0.82], "r"],                    // cream concrete slab
  [/110 North Wacker/, [0.22, 0.32, 0.56], "v"],                  // dark blue glass, white fins
  [/Franklin Center|AT&T Corporate/, [0.76, 0.68, 0.62], "v"],    // beige-pink granite
  [/Trump International/, [0.64, 0.75, 0.84], "r"],               // silver-blue glass, banded
  [/St\. Regis|Vista Tower/, [0.26, 0.60, 0.62], "c"],            // teal glass
  [/The Columbian/, [0.82, 0.76, 0.66], "r"],                     // tan concrete and glass
  [/Kingsbury Plaza/, [0.86, 0.84, 0.78], "r"],
  [/Erie on the Park/, [0.50, 0.60, 0.68], "c"],
  [/Museum (Park )?Tower|1400 Museum Park|Sky55|Arrive Michigan|Michigan Avenue Tower/, [0.62, 0.70, 0.78], "r"],   // glass and pale concrete
  [/John Hancock Center|875 North Michigan/, [0.15, 0.15, 0.16], "d", { antenna: 100 }],
  [/Soldier Field/, [0.84, 0.82, 0.76], "s"],
  [/Old (Chicago )?(Main )?Post Office/, [0.80, 0.76, 0.68], "p"],
  [/Union Station/, [0.86, 0.82, 0.74], "s"],
];

/* ---- OSM elements -> polygons ---- */
const height = (t) => {
  const m = /^[\d.]+/.exec(t.height || "");
  if (m) return parseFloat(m[0]) * (/ft|'/.test(t.height) ? 0.3048 : 1);
  const lv = parseFloat(t["building:levels"]);
  return lv > 0 ? lv * 3.6 + (parseFloat(t["roof:levels"]) || 0) * 3 : 0;
};
const minHeight = (t) => parseFloat(t.min_height) || (parseFloat(t["building:min_level"]) || 0) * 3.6;
const polys = [];                                                 // { ring (projected, closed), tags, part }
for (const e of osm) {
  const t = e.tags || {};
  const rings = e.type === "way" ? [e.geometry] : (e.members || []).filter((m) => m.role === "outer" && m.geometry).map((m) => m.geometry);
  for (const g of rings) {
    if (!g || g.length < 4 || g[0].lat !== g[g.length - 1].lat || g[0].lon !== g[g.length - 1].lon) continue;
    const ring = g.map((p) => proj([p.lon, p.lat]));
    if (!inExtent(centroid(ring))) continue;
    const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
    polys.push({ ring, t, part: !!t["building:part"] && t["building:part"] !== "no",
      box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], c: centroid(ring) });
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
// each part belongs to the outline that contains it; an outline with parts is not drawn itself
for (const P of parts) { P.parent = outlines.find((O) => inside(P.c, O)); if (P.parent) P.parent.hasParts = true; }
const buildings = [];
let styled = 0;
for (const P of polys) {
  if (!P.part && P.hasParts) continue;
  const own = P.t, par = (P.parent && P.parent.t) || {};
  const tag = (k) => own[k] || par[k];
  const h = height(own) || height(par) || 6, m = minHeight(own);
  if (h - m < 1) continue;
  const name = tag("name") || "";
  const b = { h: r1(h), m: r1(m), p: P.ring.flatMap((q) => [r1(q[0]), r1(q[1])]) };
  const lm = name && LANDMARKS.find((L) => L[0].test(name));
  const mat = MATERIAL[tag("building:material")];
  const col = rgb(tag("building:colour"));
  if (lm) { b.c = lm[1]; b.f = lm[2]; styled++; if (lm[3] && lm[3].antenna && !P.part) b.a = lm[3].antenna; }
  else if (col || mat) { b.c = col || mat[0]; b.f = mat ? mat[1] : (h > 60 ? "r" : "p"); }
  if (lm && lm[3] && lm[3].antenna && P.part) b.aTop = lm[3].antenna;       // decided below: only the tallest part carries it
  if (lm) b.n = name;
  const rs = own["roof:shape"];
  if (rs && rs !== "flat") { b.rs = rs; b.rh = r1(parseFloat(own["roof:height"]) || 0); }
  if (P.part) b.pt = 1;
  buildings.push(b);
}
// an antenna goes on the tallest part of its landmark only
for (const n of new Set(buildings.filter((b) => b.aTop).map((b) => b.n))) {
  const top = buildings.filter((b) => b.n === n && b.aTop).sort((x, y) => y.h - x.h)[0];
  top.a = top.aTop;
}
for (const b of buildings) delete b.aTop;

/* ---- streets, where the line is on the surface ---- */
const WIDTH = { motorway: 16, trunk: 15, primary: 14, secondary: 12, tertiary: 10, residential: 8, unclassified: 8, service: 5, living_street: 6 };
const SURFACE = [[41.8560, -87.6330, 41.8720, -87.6090], [41.8870, -87.6540, 41.8990, -87.6370], [41.8960, -87.6730, 41.9250, -87.6500]];   // the third: on to Clybourn
const roads = [], seen = new Set();
for (const [i, bb] of SURFACE.entries()) {
  const els = await overpass("roads" + i, `[out:json][timeout:120];way["highway"~"^(${Object.keys(WIDTH).join("|")})$"](${bb.join(",")});out body geom;`);
  for (const e of els) {
    if (!e.geometry || e.tags.tunnel === "yes") continue;
    seen.add(e.id);
    roads.push({ w: WIDTH[e.tags.highway] * (e.tags.oneway === "yes" ? 0.6 : 1), p: e.geometry.flatMap((q) => proj([q.lon, q.lat]).map(r1)) });
  }
}
if (WIDE) {                                                       // and the streets of the whole city (no alleys or driveways), bridges marked
  const MAIN = Object.keys(WIDTH).filter((k) => k !== "service" && k !== "living_street");
  const els = await overpass("roads-wide", `[out:json][timeout:180];way["highway"~"^(${MAIN.join("|")})$"](${bbox});out body geom;`);
  for (const e of els) {
    if (!e.geometry || e.tags.tunnel === "yes" || seen.has(e.id)) continue;
    const rd = { w: WIDTH[e.tags.highway] * (e.tags.oneway === "yes" ? 0.6 : 1), p: e.geometry.flatMap((q) => proj([q.lon, q.lat]).map(r1)) };
    if (e.tags.bridge && e.tags.bridge !== "no") rd.b = 1;
    roads.push(rd);
  }
}

/* ---- water and parks, from the vector tiles ---- */
const lon2x = (lon) => Math.floor((lon + 180) / 360 * 2 ** Z);
const lat2y = (lat) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** Z); };
const x0 = lon2x(unX(EXTENT.west)), x1 = lon2x(unX(WATER_EAST));
const y0 = lat2y(unZ(EXTENT.north)), y1 = lat2y(unZ(EXTENT.south));
const tileBounds = (x, y) => {
  const n = 2 ** Z, lon = (v) => v / n * 360 - 180;
  const lat = (v) => Math.atan(Math.sinh(Math.PI * (1 - 2 * v / n))) * 180 / Math.PI;
  return { w: lon(x), e: lon(x + 1), n: lat(y), s: lat(y + 1) };
};
const template = (await (await fetch("https://tiles.openfreemap.org/planet")).json()).tiles[0];
const flat = (ring) => ring.flatMap((p) => { const q = proj(p); return [r1(q[0]), r1(q[1])]; });
const water = [], parks = [];
for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
  const res = await fetch(template.replace("{z}", Z).replace("{x}", x).replace("{y}", y));
  if (!res.ok) { console.warn("tile failed", x, y, res.status); continue; }
  const tile = new VectorTile(new Pbf(new Uint8Array(await res.arrayBuffer())));
  const b = tileBounds(x, y);
  // A polygon belongs to the tile its centroid is in, so the buffer overlap
  // between neighbouring tiles doesn't duplicate it.
  const mine = (ring) => { const c = centroid(ring); return c[0] >= b.w && c[0] < b.e && c[1] <= b.n && c[1] > b.s; };
  const each = (layerName, filter, out) => {
    const layer = tile.layers[layerName];
    if (!layer) return;
    for (let i = 0; i < layer.length; i++) {
      const f = layer.feature(i);
      if (f.type !== 3 || (filter && !filter(f.properties))) continue;
      const g = f.toGeoJSON(x, y, Z).geometry;
      for (const rings of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
        const outer = rings[0];
        if (outer && outer.length >= 4 && mine(outer) && within(proj(centroid(outer)))) out.push(flat(outer));
      }
    }
  };
  let within = ([px, pz]) => px > EXTENT.west && px < WATER_EAST && pz > EXTENT.north && pz < EXTENT.south;
  each("water", null, water);
  within = inExtent;
  each("park", null, parks);
  each("landcover", (p) => p.class === "grass" || p.class === "wood", parks);
}

if (WIDE) {
  // Buildings with no colour of their own are given one by their number in the list (see cab-ride.js).
  // So that the buildings already in the film keep theirs, each carries its number from assets/city.js.
  const old = (await import("../assets/city.js")).default.buildings, key = (b) => `${b.h}|${b.m}|${b.p.join(",")}`;
  const was = new Map(old.map((b, i) => [key(b), i]));
  let fresh = old.length, kept = 0;
  for (const b of buildings) { const i = was.get(key(b)); if (i === undefined) b.i = fresh++; else { b.i = i; kept++; } }
  console.log(`${kept} of the ${old.length} buildings in assets/city.js matched`);
}
const out = {
  source: "Buildings and streets: OpenStreetMap via Overpass. Water and parks: OpenFreeMap / OpenMapTiles. All (c) OpenStreetMap contributors. Route: crcl_geo.json.",
  origin: [LON0, LAT0],
  route: route.map((p) => [r1(p[0]), r1(p[1])]),
  stations, buildings, roads, water, parks,
};
const file = path.join(HERE, "..", "assets", WIDE ? "city-wide.js" : "city.js");
fs.writeFileSync(file, "// Generated by tools/build-city.mjs. Don't edit by hand.\nexport default " + JSON.stringify(out) + ";\n");
console.log(`${buildings.length} buildings (${buildings.filter((b) => b.pt).length} are parts, ${buildings.filter((b) => b.c).length} with a real colour or material, ` +
  `${styled} pieces of ${new Set(buildings.filter((b) => b.n).map((b) => b.n)).size} landmarks), ${roads.length} streets, ${water.length} water, ${parks.length} park polygons; ` +
  `${(fs.statSync(file).size / 1e6).toFixed(2)} MB`);
console.log("landmarks found:", [...new Set(buildings.filter((b) => b.n).map((b) => b.n))].join("; "));
