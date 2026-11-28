#!/usr/bin/env node
/*
 * Render a 360-degree view for the web page (tunnel.stevevance.net/cabride/) from the film's own scene: six square
 * 90-degree views (a cube map) at film time --t, in outside shot --shot (the train seen from outside, the cab hidden).
 *
 *   node tools/cubemap.mjs <out-dir> --t 217.28 --shot 2 [--at camera | --at d,side,up] [--size 2048] [--targets file.json]
 *                          [--tiles 8 --ss 2 --base 1024]
 *
 *   --at camera     from the shot's own camera (the default): the paused frame and the 360 view then match exactly
 *   --at d,side,up  from `side` metres right of the line `d` metres along it, `up` metres above the track bed (as at())
 *   --targets       a JSON list of places, [{ id, name, lon, lat, y }] (y: metres above the ground to point at), for
 *                   which meta.json gets each one's yaw and pitch from the camera (degrees; yaw clockwise from north)
 *   --tiles n       each face as an n x n grid of tiles (tiles/<size>/<face>_<col>_<row>.jpg) plus a small whole face
 *                   (base/<face>.jpg, --base px), for Photo Sphere Viewer's cubemap tiles adapter: faces of 4096 px and
 *                   more, loaded a piece at a time as the viewer zooms in. Run it once per --size into the same <out-dir>
 *                   for several levels of detail (e.g. 2048 in 4, 4096 in 8, 8192 in 16): meta.json lists every level
 *                   found under tiles/, which the viewer picks from by zoom
 *   --ss k          draw each tile k times larger and shrink it (smoother edges; default 1)
 *
 * Writes front.jpg, right.jpg, back.jpg, left.jpg, top.jpg and bottom.jpg (the front faces north; named as Photo Sphere
 * Viewer's cubemap adapter names them; or, with --tiles, tiles/ and base/), cross.jpg (the six laid out as a cross, for
 * checking), and meta.json: where the camera is, the shot's own view (to open the 360 view on: yaw, pitch, fov), the
 * levels of tiles and the targets.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const arg = (name, fallback) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : fallback; };
const outDir = process.argv[2];
const t = +arg("t", NaN), shot = +arg("shot", NaN), size = +arg("size", 2048), atArg = arg("at", "camera"), targetsFile = arg("targets", null);
const tiles = +arg("tiles", 1), ss = +arg("ss", 1), base = +arg("base", 1024);
if (size % tiles) { console.error("--size must divide into --tiles evenly"); process.exit(1); }
if (!outDir || outDir.startsWith("--") || !Number.isFinite(t) || !Number.isFinite(shot)) {
  console.error("usage: node tools/cubemap.mjs <out-dir> --t <s> --shot <i> [--at camera | --at d,side,up] [--size 2048] [--targets file.json]");
  process.exit(1);
}
const pos = atArg === "camera" ? null : atArg.split(",").map(Number);
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
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?size=1280x720&web`, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.__cabRide, { timeout: 180000 });
  const save = (name, url) => { fs.writeFileSync(path.join(outDir, name), Buffer.from(url.split(",")[1], "base64")); console.log(path.join(outDir, name)); };
  const FACES = ["front", "right", "back", "left", "top", "bottom"];
  let r, whole = {};
  if (tiles <= 1) { r = await page.evaluate((t, shot, pos, size, opts) => window.__cabRide.cube(t, shot, pos, size, opts), t, shot, pos, size, { ss }); whole = r.faces; }
  else {
    // a face at a time, so a big face's tiles never all sit in memory at once
    const dir = path.join(outDir, "tiles", String(size));
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.join(outDir, "base"), { recursive: true });
    for (const f of FACES) {
      r = await page.evaluate((t, shot, pos, size, opts) => window.__cabRide.cube(t, shot, pos, size, opts), t, shot, pos, size, { tiles, ss, base, only: [f] });
      r.tiles[f].forEach((row, ri) => row.forEach((url, ci) => fs.writeFileSync(path.join(dir, `${f}_${ci}_${ri}.jpg`), Buffer.from(url.split(",")[1], "base64"))));
      save(`base/${f}.jpg`, whole[f] = r.base[f]);
    }
    console.log(`${6 * tiles * tiles} tiles in ${dir}`);
  }
  if (r.faces) for (const [name, url] of Object.entries(r.faces)) save(`${name}.jpg`, url);
  // the cross: the top over the front, then left, front, right and back in a row, the bottom under the front
  save("cross.jpg", await page.evaluate(async (whole) => {
    const k = 512, cross = document.createElement("canvas"), g = cross.getContext("2d");
    cross.width = 4 * k; cross.height = 3 * k;
    g.fillStyle = "#222"; g.fillRect(0, 0, cross.width, cross.height);
    const place = { top: [1, 0], left: [0, 1], front: [1, 1], right: [2, 1], back: [3, 1], bottom: [1, 2] };
    for (const [name, [x, y]] of Object.entries(place)) {
      const img = new Image(); img.src = whole[name]; await img.decode();
      g.drawImage(img, x * k, y * k, k, k);
    }
    return cross.toDataURL("image/jpeg", 0.85);
  }, whole));
  // every level of tiles in out-dir (this run's and earlier runs' at other sizes), smallest first
  const tileRoot = path.join(outDir, "tiles");
  const levels = fs.existsSync(tileRoot) ? fs.readdirSync(tileRoot).filter((d) => /^\d+$/.test(d)).map(Number).sort((a, b) => a - b)
    .map((faceSize) => ({ faceSize, nbTiles: Math.round(Math.sqrt(fs.readdirSync(path.join(tileRoot, String(faceSize))).filter((f) => f.startsWith("front_")).length)) })) : [];

  // each target's direction from the camera, in local metres (x east, z south), as the film projects lon/lat
  const [lon0, lat0] = r.at.lonlat, KX = 111320 * Math.cos(lat0 * Math.PI / 180), KY = 111070;
  const targets = targetsFile ? JSON.parse(fs.readFileSync(targetsFile, "utf8")).map((p) => {
    const dx = (p.lon - lon0) * KX, dz = (lat0 - p.lat) * KY, dist = Math.hypot(dx, dz);
    return { ...p, yaw: +((Math.atan2(dx, -dz) * 180 / Math.PI + 360) % 360).toFixed(2), pitch: +(Math.atan2((p.y ?? 0) - r.at.y, dist) * 180 / Math.PI).toFixed(2), dist: Math.round(dist) };
  }) : [];
  const meta = { t, shot, ...(tiles > 1 ? { levels, base } : { size }), at: r.at, look: r.look, front: "north", targets };
  fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 1));
  console.log(path.join(outDir, "meta.json"), JSON.stringify({ at: r.at, look: r.look }));
} catch (e) { console.error(e.message); failed = true; }
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
