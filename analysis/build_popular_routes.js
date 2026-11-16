#!/usr/bin/env node
/*
 * Build popular.html: the TOP_N most-planned trips in the CrossTowner Trip
 * Planner that are NOT one of its predefined example trips, each with a
 * today-vs-CrossTowner map and time bar.
 *
 *   node analysis/build_popular_routes.js
 *
 * Popularity comes from the live D1 `trips` table (via wrangler, so you need to
 * be logged in). Travel times, legs and geometry come from the planner's own
 * precomputed data in planner/data/, station to station, so the page agrees
 * with what the planner shows. The page is static HTML with inline SVG: rerun
 * this script to refresh it.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "planner", "data");
const SLICE = "0800";
const TOP_N = 4;
const SITE = "https://tunnel.stevevance.net/";

/* ---- popularity, from D1 ------------------------------------------------- */
// A station pair counts as predefined if it was ever planned from a predefined
// button, which also drops example trips that have since been retired. Ranked
// by distinct visitors (anonymous client ids) so one person replanning the same
// trip doesn't carry it; trips planned breaks ties.
const SQL_TOP =
  "SELECT origin, destination, COUNT(*) AS trips, COUNT(DISTINCT cid) AS visitors " +
  "FROM trips WHERE result='ok' AND origin IS NOT NULL AND destination IS NOT NULL " +
  "GROUP BY origin, destination HAVING SUM(source='predefined')=0 " +
  "ORDER BY visitors DESC, trips DESC LIMIT 25;";
const SQL_SPAN =
  "SELECT MIN(created_at) AS first, MAX(created_at) AS last, COUNT(*) AS trips, " +
  "COUNT(DISTINCT cid) AS visitors FROM trips WHERE result='ok';";

function d1(sql) {
  const out = execFileSync("npx", ["wrangler", "d1", "execute", "planner_emails",
    "--remote", "--json", "--command", sql],
    { cwd: path.join(ROOT, "worker"), encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  return JSON.parse(out)[0].results;
}

/* ---- planner data -------------------------------------------------------- */
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const STATIONS = readJSON(path.join(DATA, "stations.json"));
const LINES = readJSON(path.join(DATA, "lines.json"));
const byName = {};
STATIONS.forEach((s) => { byName[s.name] = s; });

function cell(network, fromId, toId) {
  const f = path.join(DATA, "matrix", network, SLICE, fromId + ".json");
  if (!fs.existsSync(f)) return null;
  const c = readJSON(f)[toId];
  return c && typeof c === "object" && c.legs && c.legs.length ? c : null;
}

/* ---- labels and colors (kept in step with planner/app.js) ---------------- */
const METRA_LINES = {
  "ME": "Metra Electric", "UP-N": "Union Pacific North",
  "UP-NW": "Union Pacific Northwest", "UP-W": "Union Pacific West",
  "BNSF": "BNSF", "RI": "Rock Island", "MD-N": "Milwaukee District North",
  "MD-W": "Milwaukee District West", "NCS": "North Central Service",
  "SWS": "SouthWest Service", "HC": "Heritage Corridor"
};
const CTA_LINES = {
  "Red": "Red Line", "Blue": "Blue Line", "G": "Green Line",
  "Brn": "Brown Line", "Org": "Orange Line", "P": "Purple Line",
  "Pink": "Pink Line", "Y": "Yellow Line"
};
const CROSSTOWNER_RENAME = {
  "UP-N": "A Line", "UP-NW": "C Line", "MD-N": "E Line", "NCS": "G Line",
  "MD-W": "J Line", "UP-W": "K Line", "BNSF": "M Line", "HC": "P Line",
  "SWS": "Q Line", "RI": "R Line", "ME": "U Line"
};
function routeLabel(tok, net) {
  if (net === "scenario" && CROSSTOWNER_RENAME[tok]) return CROSSTOWNER_RENAME[tok];
  if (/^X[1-6]$/.test(tok)) return "CrossTowner " + tok;
  if (/^rle$/i.test(tok)) return "Red Line Extension";
  if (METRA_LINES[tok]) return METRA_LINES[tok];
  if (CTA_LINES[tok]) return CTA_LINES[tok];
  if (/^\d+[A-Za-z]?$/.test(tok) || /^[A-Za-z]\d+$/.test(tok)) return "Bus " + tok;
  return tok;
}
const LINE_COLOR = {
  Red: "#C60C30", Blue: "#00A1DE", G: "#009B3A", Brn: "#62361B", Org: "#F9461C",
  P: "#522398", Pink: "#E27EA6", Y: "#F9E300", RLE: "#C60C30",
  X1: "#0B7285", X2: "#0B7285", X3: "#0B7285", X4: "#0B7285", X5: "#0B7285", X6: "#0B7285"
};
function lineColor(code) {
  if (LINE_COLOR[code]) return LINE_COLOR[code];
  if (/^\d/.test(code)) return "#8B979E";   // bus number -> grey
  return "#2b6cb0";                          // Metra lines -> blue
}
const isX = (code) => /^X[1-6]$/.test(code);

/* ---- geometry ------------------------------------------------------------ */
// Local equirectangular projection in km (x east, y south), corrected for
// latitude. Over the Chicago region this is visually the same as State Plane
// (EPSG:3435), without needing a projection library.
const LAT0 = 41.85, LON0 = -87.65;
const KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 111.07;
const proj = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KY];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Stitch a line's disconnected parts into continuous chains (see app.js).
function stitchChains(parts) {
  const TOL = 0.04;                                  // km
  const dedupe = (p) => p.filter((q, i) => i === 0 || dist(q, p[i - 1]) > 1e-5);
  const segs = parts.map(dedupe).filter((p) => p.length >= 2);
  const used = segs.map(() => false), chains = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    let chain = segs[i].slice(), grew = true;
    while (grew) {
      grew = false;
      for (let j = 0; j < segs.length; j++) {
        if (used[j]) continue;
        const s = segs[j], head = chain[0], tail = chain[chain.length - 1];
        const sh = s[0], st = s[s.length - 1];
        if (dist(tail, sh) < TOL) chain = chain.concat(s.slice(1));
        else if (dist(tail, st) < TOL) chain = chain.concat(s.slice().reverse().slice(1));
        else if (dist(head, st) < TOL) chain = s.slice().concat(chain.slice(1));
        else if (dist(head, sh) < TOL) chain = s.slice().reverse().concat(chain.slice(1));
        else continue;
        used[j] = true; grew = true;
      }
    }
    chains.push(dedupe(chain));
  }
  return chains.filter((c) => c.length >= 2);
}
const CHAINS = {};
Object.keys(LINES).forEach((code) => {
  CHAINS[code] = stitchChains(LINES[code].map((part) => part.map((c) => proj(c[0], c[1]))));
});

// Nearest point on a chain: { d, i (segment index), t (0..1 along it), pt }.
function nearestOn(chain, p) {
  let best = { d: Infinity };
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i], b = chain[i + 1];
    const vx = b[0] - a[0], vy = b[1] - a[1], len2 = vx * vx + vy * vy;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / len2));
    const pt = [a[0] + vx * t, a[1] + vy * t], d = dist(pt, p);
    if (d < best.d) best = { d, i, t, pt };
  }
  return best;
}
// The piece of a line between two points, oriented a -> b; null if no geometry.
function clipLine(code, a, b) {
  const chains = CHAINS[code];
  if (!chains || !chains.length) return null;
  let best = null;
  chains.forEach((ch) => {
    const na = nearestOn(ch, a), nb = nearestOn(ch, b);
    if (!best || na.d + nb.d < best.score) best = { ch, na, nb, score: na.d + nb.d };
  });
  const { ch, na, nb } = best;
  const fwd = na.i + na.t <= nb.i + nb.t;
  const lo = fwd ? na : nb, hi = fwd ? nb : na;
  const pts = [lo.pt].concat(ch.slice(lo.i + 1, hi.i + 1), [hi.pt]);
  return fwd ? pts : pts.reverse();
}

/* ---- one trip (one network) -> drawable pieces + time breakdown ---------- */
function buildTrip(c, net, A, B) {
  const WALK_GAP = 0.09;                             // km, as in app.js drawClipped
  const rides = [], walks = [], dots = [];
  const pa = proj(A.lon, A.lat), pb = proj(B.lon, B.lat);
  let prev = pa;
  const vehicle = c.legs.filter((l) => l.mode !== "WALK");
  vehicle.forEach((leg, i) => {
    const sf = byName[leg.from], st = byName[leg.to];
    if (!sf || !st) throw new Error("Unknown station in leg: " + leg.from + " / " + leg.to);
    const from = proj(sf.lon, sf.lat), to = proj(st.lon, st.lat);
    if (dist(prev, from) > 0.03) walks.push([prev, from]);
    if (i > 0) dots.push(from);
    const color = lineColor(leg.line), bus = leg.mode === "BUS";
    const geom = bus ? null : clipLine(leg.line, from, to);
    if (!geom) {
      rides.push({ pts: [from, to], color, bus });   // no track geometry: straight
    } else {
      let line = geom.slice();
      if (dist(from, line[0]) > WALK_GAP) walks.push([from, line[0]]); else line.unshift(from);
      if (dist(to, line[line.length - 1]) > WALK_GAP) walks.push([line[line.length - 1], to]); else line.push(to);
      rides.push({ pts: line, color, bus: false });
    }
    if (i < vehicle.length - 1) dots.push(to);
    prev = to;
  });
  if (dist(prev, pb) > 0.03) walks.push([prev, pb]);

  // Time bar, the way the planner itemizes a trip: walking and riding are
  // what the legs say; whatever is left of the median total is waiting,
  // shared out in proportion to each leg's scheduled wait.
  const walkMin = c.legs.filter((l) => l.mode === "WALK").reduce((s, l) => s + (l.ride || 0), 0);
  const rideMin = vehicle.reduce((s, l) => s + (l.ride || 0), 0);
  const waitMin = Math.max(0, c.m - walkMin - rideMin);
  const pool = vehicle.reduce((s, l) => s + (l.wait || 0), 0);
  const segs = [];
  c.legs.forEach((leg) => {
    if (leg.mode === "WALK") { if (leg.ride) segs.push({ kind: "walk", min: leg.ride }); return; }
    const w = pool > 0 ? waitMin * (leg.wait || 0) / pool : waitMin / vehicle.length;
    if (w >= 0.5) segs.push({ kind: "wait", min: w });
    segs.push({ kind: "ride", min: leg.ride || 0, color: lineColor(leg.line),
                label: routeLabel(leg.line, net), x: isX(leg.line) });
  });
  const all = [pa, pb].concat(...rides.map((r) => r.pts), ...walks);
  return {
    m: c.m, rides, walks, dots, segs, all,
    labels: vehicle.map((l) => ({ text: routeLabel(l.line, net), x: isX(l.line) })),
    transfers: Math.max(vehicle.length - 1, 0),
    walkMin, waitMin: Math.round(waitMin)
  };
}

/* ---- HTML / SVG helpers -------------------------------------------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const n2 = (v) => (Math.round(v * 100) / 100).toString();
const pathD = (pts) => "M" + pts.map((p) => n2(p[0]) + " " + n2(p[1])).join("L");

// Background rail network, drawn once and reused by every map via <use>.
// Thinned to ~80 m between vertices: it is only ever a faint backdrop.
function thin(pts) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) if (dist(pts[i], out[out.length - 1]) > 0.08) out.push(pts[i]);
  out.push(pts[pts.length - 1]);
  return out;
}
const NET_STYLE = "fill:none;stroke-width:1.2px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;stroke:";
// Water (Lake Michigan, the rivers and canals, larger lagoons) as one filled
// path. analysis/data/hydro.geojson is the City of Chicago "Hydro" layer,
// simplified and clipped to the region:
//   ogr2ogr -f GeoJSON analysis/data/hydro.geojson Hydro.shp -t_srs EPSG:4326 \
//     -simplify 60 -where "SHAPE_AREA > 150000" -clipdst -88.35 41.45 -87.35 42.25 -select NAME
const HYDRO = readJSON(path.join(__dirname, "data", "hydro.geojson"));
function hydroD() {
  let d = "";
  HYDRO.features.forEach((f) => {
    const g = f.geometry;
    if (!g) return;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    polys.forEach((rings) => rings.forEach((ring) => {
      const pts = thin(ring.map((c) => proj(c[0], c[1])));
      if (pts.length >= 4) d += pathD(pts) + "Z";
    }));
  });
  return d;
}
function networkDefs() {
  const d = (codes) => codes.map((code) => CHAINS[code].map((ch) => pathD(thin(ch))).join("")).join("");
  const codes = Object.keys(CHAINS);
  const today = codes.filter((c) => !isX(c) && c !== "RLE");
  const future = codes.filter((c) => isX(c) || c === "RLE");
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    // Inline styles, not classes or attributes: browsers disagree on whether
    // stylesheet selectors reach <use> copies, and the page's "svg path" rule
    // would override a fill attribute where they do (Safari hid the water).
    '<path id="hydro" style="fill:#c9dfec;fill-rule:evenodd;stroke:none" d="' + hydroD() + '"/>' +
    '<path id="net-today" style="' + NET_STYLE + '#cfd7db" d="' + d(today) + '"/>' +
    '<path id="net-future" style="' + NET_STYLE + '#9fc3cb" d="' + d(future) + '"/>' +
    "</defs></svg>";
}

// One square map. `box` is shared by a route's two maps so they line up.
function mapSvg(trip, net, box, A, B, title) {
  const u = box.side / 100;                          // 1% of the map's width
  const pa = proj(A.lon, A.lat), pb = proj(B.lon, B.lat);
  let s = '<svg viewBox="' + [box.x, box.y, box.side, box.side].map(n2).join(" ") +
    '" role="img" aria-label="' + esc(title) + '">';
  s += '<use href="#hydro"/><use href="#net-today"/>';
  if (net === "scenario") s += '<use href="#net-future"/>';
  trip.walks.forEach((w) => {
    s += '<path d="' + pathD(w) + '" class="walk" stroke-width="' + n2(0.9 * u) +
      '" stroke-dasharray="' + n2(0.1 * u) + " " + n2(2 * u) + '"/>';
  });
  trip.rides.forEach((r) => {
    const dash = r.bus ? ' stroke-dasharray="' + n2(2.4 * u) + " " + n2(1.6 * u) + '"' : "";
    s += '<path d="' + pathD(r.pts) + '" class="halo" stroke-width="' + n2(3.2 * u) + '"/>';
    s += '<path d="' + pathD(r.pts) + '" class="ride" stroke="' + r.color + '" stroke-width="' +
      n2(1.9 * u) + '"' + dash + "/>";
  });
  trip.dots.forEach((p) => {
    s += '<circle cx="' + n2(p[0]) + '" cy="' + n2(p[1]) + '" r="' + n2(1.3 * u) +
      '" class="xfer" stroke-width="' + n2(0.6 * u) + '"/>';
  });
  // Labels sit above or below their marker, on the side away from the other
  // end, so the route (which heads toward the other end) doesn't run under them.
  const cx = box.x + box.side / 2;
  [[pa, pb, A.name, "end-a"], [pb, pa, B.name, "end-b"]].forEach(([p, other, name, cls]) => {
    const left = p[0] > cx, above = p[1] <= other[1];
    s += '<circle cx="' + n2(p[0]) + '" cy="' + n2(p[1]) + '" r="' + n2(2 * u) +
      '" class="' + cls + '" stroke-width="' + n2(0.7 * u) + '"/>';
    s += '<text x="' + n2(p[0] + (left ? 2 : -2) * u) + '" y="' + n2(p[1] + (above ? -3.6 : 6.2) * u) +
      '" font-size="' + n2(3.7 * u) + '" stroke-width="' + n2(1 * u) + '"' +
      (left ? ' text-anchor="end"' : "") + ">" + esc(name) + "</text>";
  });
  return s + "</svg>";
}

function timeBar(trip, maxMin) {
  let s = '<div class="tbar" style="width:' + n2(100 * trip.m / maxMin) + '%">';
  trip.segs.forEach((g) => {
    const w = n2(100 * g.min / trip.m), mins = Math.round(g.min) + " min";
    if (g.kind === "ride") {
      s += '<span class="seg" style="width:' + w + "%;background:" + g.color + '" title="' +
        esc(g.label + ": " + mins + " riding") + '"></span>';
    } else {
      s += '<span class="seg ' + g.kind + '" style="width:' + w + '%" title="' +
        esc((g.kind === "walk" ? "Walking: " : "Waiting: ") + mins) + '"></span>';
    }
  });
  return s + "</div>";
}
const chips = (trip) => trip.labels.map((l) =>
  '<span class="chip' + (l.x ? " chip-x" : "") + '">' + esc(l.text) + "</span>").join(
  '<span class="arr" aria-hidden="true">&rarr;</span>');
const plural = (n, w) => n + " " + w + (n === 1 ? "" : "s");
const xferText = (n) => (n === 0 ? "no transfers" : plural(n, "transfer"));

function plannerLink(A, B) {
  const p = new URLSearchParams({
    ol: A.name, olat: A.lat.toFixed(5), olon: A.lon.toFixed(5),
    dl: B.name, dlat: B.lat.toFixed(5), dlon: B.lon.toFixed(5), sl: SLICE
  });
  return "planner/?" + p.toString();
}

function routeCard(r, rank) {
  const { A, B, today, scen } = r;
  const saved = today.m - scen.m;
  const all = today.all.concat(scen.all);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const side = Math.max(maxX - minX, maxY - minY, 6) * 1.34;   // pad for labels
  const box = { x: (minX + maxX) / 2 - side / 2, y: (minY + maxY) / 2 - side / 2, side };
  const maxMin = Math.max(today.m, scen.m);
  const name = esc(A.name) + " to " + esc(B.name);

  let verdict;
  if (saved > 0) {
    verdict = '<div class="stat"><div class="n gain">&minus;' + saved + ' min</div><div class="l">' +
      Math.round(100 * saved / today.m) + "% faster with CrossTowner</div></div>";
  } else if (saved === 0) {
    verdict = '<div class="stat"><div class="n same">No change</div><div class="l">CrossTowner doesn\'t speed up this trip</div></div>';
  } else {
    verdict = '<div class="stat"><div class="n same">+' + (-saved) + ' min</div><div class="l">slower in the CrossTowner scenario</div></div>';
  }
  const panel = (trip, net, head) =>
    '<figure class="panel"><figcaption>' + head + "</figcaption>" +
    mapSvg(trip, net, box, A, B, "Map of the trip from " + A.name + " to " + B.name +
      (net === "today" ? " today" : " with CrossTowner")) + "</figure>";
  const row = (trip, head) =>
    '<div class="trow"><div class="thead"><b>' + head + "</b> " + trip.m + " min &middot; " +
    xferText(trip.transfers) + '</div><div class="ttrack">' + timeBar(trip, maxMin) + "</div>" +
    '<div class="tlegs">' + chips(trip) + '<span class="tmeta">' + trip.walkMin + " min walking, " +
    trip.waitMin + " min waiting</span></div></div>";

  return '<section class="route" id="trip-' + rank + '">' +
    "<h2>" + rank + ". " + name + "</h2>" +
    '<p class="pop">Planned <b>' + plural(r.trips, "time") + "</b> by <b>" + plural(r.visitors, "visitor") + "</b></p>" +
    '<div class="stats">' +
      '<div class="stat"><div class="n">' + today.m + ' min</div><div class="l">today, ' + xferText(today.transfers) + "</div></div>" +
      '<div class="stat"><div class="n">' + scen.m + ' min</div><div class="l">with CrossTowner, ' + xferText(scen.transfers) + "</div></div>" +
      verdict +
    "</div>" +
    '<div class="maps">' + panel(today, "today", "Today") + panel(scen, "scenario", "With CrossTowner") + "</div>" +
    row(today, "Today") + row(scen, "With CrossTowner") +
    '<p class="mt-3 mb-0"><a href="' + esc(plannerLink(A, B)) + '">Open this trip in the planner &rarr;</a></p>' +
    "</section>";
}

/* ---- assemble ------------------------------------------------------------ */
const ranked = d1(SQL_TOP), span = d1(SQL_SPAN)[0];
const routes = [];
for (const row of ranked) {
  if (routes.length >= TOP_N) break;
  const A = byName[row.origin], B = byName[row.destination];
  const ct = A && B && cell("today", A.id, B.id), cs = A && B && cell("scenario", A.id, B.id);
  if (!ct || !cs) { console.warn("skipped (no station or matrix data): " + row.origin + " -> " + row.destination); continue; }
  routes.push({ A, B, trips: row.trips, visitors: row.visitors,
    today: buildTrip(ct, "today", A, B), scen: buildTrip(cs, "scenario", A, B) });
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US",
  { year: "numeric", month: "long", day: "numeric", timeZone: "America/Chicago" });
const TITLE = "Most popular CrossTowner trips: travel times before and after";
const NUM = ["zero", "one", "two", "three", "four", "five", "six"][routes.length] || String(routes.length);
const DESC = "The " + NUM + " trips people plan most in the CrossTowner Trip Planner, with maps and travel times for each one today and with the proposed Chicago regional-rail tunnel.";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Generated by analysis/build_popular_routes.js. Rerun it to refresh; don't edit by hand. -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE} | Build the Tunnel</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${SITE}popular.html">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Build the Tunnel">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE}popular.html">
<meta property="og:image" content="${SITE}img/og-card.png">
<meta name="twitter:card" content="summary_large_image">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<style>
  :root{ --crcl:#0B7285; --gain:#f4a300; }
  body{ padding-bottom:3rem; color:#1c2427; }
  .bg-crcl{ background:var(--crcl)!important; }
  header h1{ letter-spacing:-.01em; }
  main{ max-width:780px; }
  h2{ color:var(--crcl); font-size:1.3rem; margin:0 0 .15rem; }
  .lead-sm{ font-size:1.06rem; }
  a{ color:#095c6c; }
  .box{ background:#f4f6f7; border:1px solid #d7dee2; border-radius:8px; padding:1rem 1.15rem; }
  .route{ margin-top:2.6rem; padding-top:1.6rem; border-top:1px solid #d7dee2; }
  .pop{ color:#5b6770; font-size:.92rem; margin:0; }
  /* stat cards */
  .stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem; margin:1rem 0; }
  .stat{ background:#fff; border:1px solid #d7dee2; border-radius:10px; padding:.8rem .9rem; }
  .stat .n{ font-size:1.55rem; font-weight:800; color:var(--crcl); line-height:1.05; white-space:nowrap; }
  .stat .n.gain{ color:#1a7f37; }
  .stat .n.same{ color:#5b6770; }
  .stat .l{ font-size:.8rem; color:#5b6770; margin-top:.25rem; }
  /* before / after maps */
  .maps{ display:grid; grid-template-columns:1fr 1fr; gap:.7rem; }
  .panel{ margin:0; }
  .panel figcaption{ font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#424a4d; margin-bottom:.3rem; }
  .panel svg{ display:block; width:100%; height:auto; aspect-ratio:1; background:#f4f6f7; border:1px solid #d7dee2; border-radius:8px; }
  svg path{ fill:none; stroke-linecap:round; stroke-linejoin:round; }
  svg .halo{ stroke:#fff; }
  svg .walk{ stroke:#3A4750; }
  svg .xfer{ fill:#fff; stroke:#3A4750; }
  svg .end-a{ fill:#fff; stroke:#1c2427; }
  svg .end-b{ fill:#1c2427; stroke:#fff; }
  svg text{ font-family:system-ui,-apple-system,"Segoe UI",sans-serif; font-weight:700; fill:#1c2427; stroke:#f4f6f7; paint-order:stroke; stroke-linejoin:round; }
  /* time bars */
  .trow{ margin-top:1rem; }
  .thead{ font-size:.9rem; }
  .ttrack{ margin:.3rem 0; }
  .tbar{ display:flex; height:20px; border-radius:4px; overflow:hidden; min-width:40px; }
  .seg{ display:block; height:100%; box-shadow:inset -1px 0 0 #fff; }
  .seg.walk{ background:#aab4b9; }
  .seg.wait{ background:repeating-linear-gradient(135deg,#e3e8ea 0 4px,#cfd7db 4px 8px); }
  .tlegs{ font-size:.82rem; display:flex; flex-wrap:wrap; align-items:center; gap:.3rem; }
  .chip{ border:1px solid #cfd7da; border-radius:999px; padding:.05rem .55rem; background:#fff; white-space:nowrap; }
  .chip-x{ background:var(--crcl); border-color:var(--crcl); color:#fff; font-weight:600; }
  .arr{ color:#8B979E; }
  .tmeta{ color:#5b6770; margin-left:.3rem; }
  .key{ font-size:.82rem; color:#424a4d; display:flex; flex-wrap:wrap; gap:.3rem 1.1rem; margin-top:.6rem; }
  .key span{ display:inline-flex; align-items:center; gap:.4rem; }
  .key i{ width:22px; height:12px; border-radius:3px; display:inline-block; }
  @media(max-width:560px){
    .maps{ grid-template-columns:1fr; }
    .stats{ grid-template-columns:1fr 1fr; }
    .stats .stat:last-child{ grid-column:1 / -1; }
  }
</style>
</head>
<body>
${networkDefs()}
<header class="bg-crcl text-white px-3 py-3">
  <div class="mx-auto" style="max-width:780px">
    <h1 class="h4 mb-0">Most popular CrossTowner trips</h1>
    <div class="small opacity-75">What people plan most, today vs. with the tunnel</div>
    <nav class="small mt-2 d-flex flex-wrap gap-3">
      <a href="./" class="text-white text-decoration-none opacity-75">Home</a>
      <a href="planner/" class="text-white text-decoration-none opacity-75">Trip planner</a>
      <a href="popular.html" class="text-white text-decoration-none fw-semibold" style="border-bottom:2px solid #fff;padding-bottom:1px">Popular trips</a>
      <a href="ohareaccess.html" class="text-white text-decoration-none opacity-75">O'Hare workforce</a>
      <a href="planner/methodology.html" class="text-white text-decoration-none opacity-75">Methodology</a>
      <a href="flythrough/" class="text-white text-decoration-none opacity-75">3D map</a>
      <a href="signup.html" class="text-white text-decoration-none opacity-75">Get updates</a>
    </nav>
  </div>
</header>

<main class="mx-auto px-3 mt-4">
  <p class="lead-sm">These are the ${NUM} trips people have planned most often in the
  <a href="planner/">CrossTowner Trip Planner</a>, not counting the example trips the planner offers
  as buttons. Each one shows the route and travel time today next to the same trip with the proposed
  CrossTowner tunnel.</p>

  <div class="box">
    <b>How to read this page</b>
    <ul class="mb-0 mt-1">
      <li>Trips are ranked by the number of different visitors who planned them, then by how many times they were planned.</li>
      <li>Counts cover ${fmtDate(span.first)} through ${fmtDate(span.last)}: ${span.trips.toLocaleString("en-US")} planned trips from ${span.visitors.toLocaleString("en-US")} visitors.</li>
      <li>Times are station to station for a weekday 8 AM departure, from the same precomputed data as the planner.
      See the <a href="planner/methodology.html">methodology</a>.</li>
    </ul>
    <div class="key">
      <span><i style="background:#0B7285"></i>CrossTowner</span>
      <span><i style="background:#2b6cb0"></i>Metra</span>
      <span><i style="background:#00A1DE"></i>CTA &lsquo;L&rsquo; (line color)</span>
      <span><i style="background:#8B979E"></i>Bus</span>
      <span><i style="background:#aab4b9"></i>Walking</span>
      <span><i style="background:repeating-linear-gradient(135deg,#e3e8ea 0 4px,#cfd7db 4px 8px)"></i>Waiting</span>
    </div>
  </div>

${routes.map((r, i) => routeCard(r, i + 1)).join("\n\n")}

  <footer class="text-secondary small mt-5 pt-3 border-top">
    <p>Made by Steven Vance, using the
    <a href="https://buildthetunnelchicago.org/" target="_blank" rel="noopener">Star:Line Chicago CrossTowner</a>
    map and synthetic schedule. This site is otherwise unaffiliated with Star:Line Chicago.
    Water on the maps is from the City of Chicago. The planner logs only the stations a trip uses and an anonymous visitor ID, never addresses.</p>
  </footer>
</main>
<!-- Cloudflare Web Analytics -->
<script type="module" src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "998e0617479743128964a1b458776630"}'></script>
<!-- End Cloudflare Web Analytics -->
</body></html>
`;

fs.writeFileSync(path.join(ROOT, "popular.html"), html);
console.log("popular.html: " + routes.map((r) => r.A.name + " -> " + r.B.name +
  " (" + r.today.m + " -> " + r.scen.m + " min)").join("; "));
