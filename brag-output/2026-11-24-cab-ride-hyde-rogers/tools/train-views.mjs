// Pictures of the CrossTowner train (assets/crosstowner-train.js) on its own, from set viewpoints (see VIEWS in
// tools/train-views.html), as PNGs:
//   node tools/train-views.mjs <out-dir> [front34 front side aerial rear34 pack cab top34] [--lit] [--bemu] [--kiss]
// (--bemu: with the PowerPack, assets/flirt-powerpack.js, put back between the intermediate cars; --kiss: the
// CrossTowner double-decker, assets/kiss-train/, instead)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = process.argv.slice(2), lit = args.includes("--lit"), bemu = args.includes("--bemu"), kiss = args.includes("--kiss");
const [outDir, ...rest] = args.filter((a) => !a.startsWith("--"));
const names = rest.length ? rest : ["front34", "front", "side", "aerial", "rear34", "pack", "cab"];
fs.mkdirSync(outDir, { recursive: true });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--ignore-gpu-blocklist", "--use-angle=metal"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("page error:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
await page.goto(`http://127.0.0.1:${server.address().port}/tools/train-views.html`, { waitUntil: "load" });
await page.waitForFunction(() => window.ready, { timeout: 60000 });
const pngs = await page.evaluate((n, l, b, k) => window.views(n, l, b, k), names, lit, bemu, kiss);
names.forEach((n, i) => {
  const file = path.join(outDir, `${n}${bemu ? "-bemu" : ""}${kiss ? "-kiss" : ""}${lit ? "-lit" : ""}.png`);
  fs.writeFileSync(file, Buffer.from(pngs[i].split(",")[1], "base64"));
  console.log(file);
});
await browser.close();
server.close();
