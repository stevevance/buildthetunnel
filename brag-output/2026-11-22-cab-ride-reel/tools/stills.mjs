#!/usr/bin/env node
/*
 * Save still frames of the film as PNGs, drawn the same way tools/direct-render.mjs draws them (Chrome on the GPU),
 * which is far quicker than HyperFrames' snapshot.
 *
 *   node tools/stills.mjs <out-dir> 12.5 150 186 ...
 *   node tools/stills.mjs <out-dir> p8@7          preview view 8 (see preview() in assets/cab-ride.js) of stop 7
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [outDir, ...times] = process.argv.slice(2);
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
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html${process.env.SIZE ? "?size=" + process.env.SIZE : ""}`, { waitUntil: "load" });
await page.waitForFunction(() => !!window.__cabRide, { timeout: 180000 });
for (const t of times) {
  const data = await page.evaluate((t) => {
    const m = /^p(\d+)@(\d+)$/.exec(t);
    if (m) window.__cabRide.preview(+m[1], +m[2]); else window.__cabRide.render(+t);
    return document.getElementById("cab").toDataURL("image/png");
  }, t);
  const file = path.join(outDir, `${t.startsWith("p") ? t.replace("@", "-") : "t" + String(t).padStart(6, "0")}.png`);
  fs.writeFileSync(file, Buffer.from(data.split(",")[1], "base64"));
  console.log(file);
}
await browser.close();
server.close();
