// Pictures of the film's ten kinds of people (assets/people.js), from tools/people-lineup.html, as PNGs:
//   node tools/people-lineup.mjs <out-dir> [front q side back faces1 faces2 vary1 vary2] [--seed n]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = process.argv.slice(2), si = args.indexOf("--seed"), seed = si >= 0 ? +args[si + 1] : 1;
const [outDir, ...rest] = args.filter((a, i) => !a.startsWith("--") && (si < 0 || i !== si + 1));
const views = rest.length ? rest : ["front", "q", "side", "back", "faces1", "faces2", "vary1", "vary2"];
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
await page.goto(`http://127.0.0.1:${server.address().port}/tools/people-lineup.html`, { waitUntil: "load" });
await page.waitForFunction(() => window.ready, { timeout: 60000 });
for (const v of views) {
  const png = await page.evaluate((view, s) => window.lineup(view, s), v, seed);
  const file = path.join(outDir, `${v}.png`);
  fs.writeFileSync(file, Buffer.from(png.split(",")[1], "base64"));
  console.log(file);
}
await browser.close();
server.close();
