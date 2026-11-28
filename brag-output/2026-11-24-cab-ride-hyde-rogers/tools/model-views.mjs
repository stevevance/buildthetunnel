#!/usr/bin/env node
/*
 * Draw one of the film's model modules on its own (no film), from set viewpoints, as PNGs: for checking a design.
 *
 *   node tools/model-views.mjs <out-dir> <module> <builder> [--centre NAME] [--opts JSON] <view> [<view> ...]
 *
 *   module    path from the project root, e.g. assets/soldier-field.js
 *   builder   its exported builder, called as builder({ THREE, origin, ...opts }), e.g. buildSoldierField
 *   --centre  the module's exported [lon, lat] to build round, so the model sits near (0, 0, 0)
 *   view      name=cx,cy,cz@lx,ly,lz[@fov]   camera at (cx, cy, cz) looking at (lx, ly, lz), local metres (x east,
 *             y up, z south); or name=frame:dx,dy,dz   from that direction, framed on the model's bounding box
 *
 *   node tools/model-views.mjs previews/soldier-field assets/soldier-field.js buildSoldierField --centre SOLDIER_FIELD_CENTRE \
 *     se=frame:1,0.6,1 west=-400,60,0@0,25,0
 *
 * Prints the model's bounding box, then each PNG's path. Lights and sky match tools/export-models.html, on a plain ground.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = process.argv.slice(2);
const take = (flag) => { const i = args.indexOf(flag); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const centre = take("--centre"), opts = JSON.parse(take("--opts") || "{}");
const [outDir, module, fn, ...views] = args;
if (!views.length) { console.error("usage: node tools/model-views.mjs <out-dir> <module> <builder> [--centre NAME] [--opts JSON] <view> ..."); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0, args: ["--ignore-gpu-blocklist", "--use-angle=metal"] });
const page = await browser.newPage();
let failed = false;
page.on("pageerror", (e) => { console.error("page error:", e.message); failed = true; });
page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/model-views.html`, { waitUntil: "load" });
  await page.waitForFunction(() => window.ready, { timeout: 60000 });
  const box = await page.evaluate((m, f, c, o) => window.build(m, f, c, o), module, fn, centre, opts);
  console.log("bounding box", JSON.stringify(box));
  for (const spec of views) {
    const [name, rest] = spec.split("=");
    let v;
    if (rest.startsWith("frame:")) v = { frame: rest.slice(6).split(",").map(Number) };
    else { const [c, l, fov] = rest.split("@"); v = { cam: c.split(",").map(Number), look: l.split(",").map(Number), fov: fov ? +fov : undefined }; }
    const png = await page.evaluate((v) => window.view(v), v);
    const file = path.join(outDir, `${name}.png`);
    fs.writeFileSync(file, Buffer.from(png.split(",")[1], "base64"));
    console.log(file);
  }
} catch (e) { console.error(e.message); failed = true; }
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
