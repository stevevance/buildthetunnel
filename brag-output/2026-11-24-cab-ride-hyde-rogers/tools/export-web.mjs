#!/usr/bin/env node
/*
 * Write the data the web page (tunnel.stevevance.net/cabride/) needs to follow a cut of the film, from the film itself,
 * so the page never drifts from the render: the story cards, the stops, the train's position and the route.
 *
 *   node tools/export-web.mjs <out-dir> --from 160 --to 222 [--step 0.25]
 *
 *   --from, --to   the cut, in film seconds (as direct-render.mjs --start and --end); the video's time 0 is --from
 *   --step         seconds between the train's positions in track.json (default 0.25)
 *
 * Writes into <out-dir>:
 *   film.json      the cut (clipStart = --from, clipEnd = --to), the stops, the outside shots and the hero shot's times,
 *                  all in film seconds (video time = film time - clipStart)
 *   story.json     the story cards (cab-ride.js STORY), in film seconds
 *   track.json     [t, lon, lat, bearing, d, air] every --step s of the cut: the cab's position, the line's bearing (degrees
 *                  clockwise from north), metres along the line, and 0 in the cab's view, 1 in a shot from outside
 *   route.geojson  the whole alignment, and the stretch between the tunnel's portals
 *   captions.vtt   the announcements' captions in the cut, in video time
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const arg = (name, fallback) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : fallback; };
const outDir = process.argv[2];
const from = +arg("from", NaN), to = +arg("to", NaN), step = +arg("step", 0.25);
if (!outDir || outDir.startsWith("--") || !(to > from)) {
  console.error("usage: node tools/export-web.mjs <out-dir> --from <s> --to <s> [--step 0.25]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".gltf": "model/gltf+json", ".bin": "application/octet-stream" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ["--ignore-gpu-blocklist", ...(process.platform === "darwin" ? ["--use-angle=metal"] : [])] });
let failed = false;
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => { console.error("page error:", e.message); failed = true; });
  // the scene needn't be drawn at any size to give its timings and geometry
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?size=640x360&web`, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.__cabRide, { timeout: 180000 });
  const w = await page.evaluate((a, b, s) => window.__cabRide.webData(a, b, s), from, to, step);

  const write = (name, data) => {
    fs.writeFileSync(path.join(outDir, name), typeof data === "string" ? data : JSON.stringify(data));
    console.log(path.join(outDir, name));
  };
  write("film.json", { clipStart: from, clipEnd: to, step, length: w.length, portals: w.portals, stops: w.stops, shots: w.shots, hero: w.hero });
  write("story.json", w.story);
  write("track.json", w.track);
  const [p0, p1] = w.portals.map((d) => Math.round(d / w.routeStep));
  write("route.geojson", { type: "FeatureCollection", features: [
    { type: "Feature", properties: { name: "X1", part: "route" }, geometry: { type: "LineString", coordinates: w.route } },
    { type: "Feature", properties: { name: "Clinton-Roosevelt Connector", part: "tunnel" }, geometry: { type: "LineString", coordinates: w.route.slice(p0, p1 + 1) } },
  ] });

  // the captions in the cut, in the video's time (cues cut at its ends)
  const captions = (await import(pathToFileURL(path.join(ROOT, "assets/captions.js")).href)).default;
  const ts = (s) => { const ms = Math.round(Math.max(0, s) * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`; };
  const cues = captions.filter((c) => c.end > from && c.start < to)
    .map((c, i) => `${i + 1}\n${ts(c.start - from)} --> ${ts(Math.min(c.end, to) - from)}\n${c.text}\n`);
  write("captions.vtt", `WEBVTT\n\n${cues.join("\n")}`);

  const inCut = w.stops.filter((q) => q.t + q.dwell > from && q.t < to).map((q) => `${q.name} ${q.t}`);
  console.log(`stops in the cut: ${inCut.join(", ") || "none"}; hero ${JSON.stringify(w.hero)}; ${w.track.length} positions, ${cues.length} captions`);
} catch (e) { console.error(e.message); failed = true; }
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
