// Export the film's shareable pieces as glTF binary (.glb) files, with a preview PNG of each, into exports/:
//   node tools/export-models.mjs [crosstowner-train] [flirt-powerpack] [ballys-chicago] [obama-center]
// Each is built by its own module (assets/crosstowner-train.js, assets/flirt-powerpack.js, assets/ballys-chicago.js, assets/obama-center.js) in headless Chrome (they
// paint their textures on <canvas>), then written out by three.js's GLTFExporter.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const names = process.argv.slice(2).length ? process.argv.slice(2) : ["crosstowner-train", "flirt-powerpack", "ballys-chicago", "obama-center"];
const OUT = path.join(ROOT, "exports");
fs.mkdirSync(OUT, { recursive: true });
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
await page.goto(`http://127.0.0.1:${server.address().port}/tools/export-models.html`, { waitUntil: "load" });
await page.waitForFunction(() => window.ready, { timeout: 60000 });
for (const name of names) {
  const { png, glb } = await page.evaluate((n) => window.exportModel(n), name);
  fs.writeFileSync(path.join(OUT, `${name}.glb`), Buffer.from(glb, "base64"));
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(png.split(",")[1], "base64"));
  console.log(`${name}.glb ${(Buffer.from(glb, "base64").length / 1e6).toFixed(1)} MB, ${name}.png`);
}
await browser.close();
server.close();
