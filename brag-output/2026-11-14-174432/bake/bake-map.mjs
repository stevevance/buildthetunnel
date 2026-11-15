// Bakes the CRCL 3D flythrough (the real index.html viewer) to an all-intra MP4,
// one frame at a time, so the HyperFrames composition plays a frozen, deterministic map.
// The viewer's own panels are hidden; titles and station cards are drawn live in the composition.
//
//   FORMAT=landscape|vertical [FRAMES=a-b] [STILLS=12,80,...] node bake-map.mjs
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const require = createRequire(import.meta.url);
const npx = join(homedir(), ".npm/_npx");
const pcDir = readdirSync(npx).map(d => join(npx, d, "node_modules/puppeteer-core")).find(existsSync);
const puppeteer = require(pcDir);

const FORMAT = process.env.FORMAT === "vertical" ? "vertical" : "landscape";
const FPS = 30, DUR = 24.5, N = Math.round(FPS * DUR);
const VP = FORMAT === "vertical" ? { width: 540, height: 960 } : { width: 960, height: 540 };
const OUT = join(HERE, FORMAT);
mkdirSync(join(OUT, "frames"), { recursive: true });

// camera settings per format (CSS px; the page renders at 2x)
const CFG = FORMAT === "vertical"
  ? { mapPad: { top: 0, bottom: 210, left: 0, right: 0 }, ovPad: { top: 365, bottom: 150, left: 40, right: 40 }, zFly: 15.1, zBoost: 0.9 }
  : { mapPad: { top: 0, bottom: 0, left: 0, right: 0 }, ovPad: { top: 45, bottom: 45, left: 520, right: 70 }, zFly: 15.3, zBoost: 0.75 };

const chromeBase = join(homedir(), ".cache/puppeteer/chrome-headless-shell");
let chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!process.env.FULL_CHROME && existsSync(chromeBase)) {
  for (const v of readdirSync(chromeBase)) for (const inner of readdirSync(join(chromeBase, v))) {
    const bin = join(chromeBase, v, inner, "chrome-headless-shell");
    if (existsSync(bin)) chrome = bin;
  }
}

const browser = await puppeteer.launch({
  executablePath: chrome, headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl", "--hide-scrollbars", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.setViewport({ ...VP, deviceScaleFactor: 2 });
page.on("pageerror", e => console.error("pageerror", e.message));
await page.goto("file://" + join(REPO, "index.html") + "#crcl", { waitUntil: "load" });
await page.addStyleTag({ content: "#ui,#info2,#announce,.maplibregl-control-container,.maplibregl-popup{display:none!important}" });
await page.waitForFunction("typeof timeline!=='undefined' && timeline", { timeout: 60000 });

const coords = await page.evaluate((CFG, FPS) => {
  pauseFly(); hideCallout(); hideNote();
  map._fadeDuration = 0;
  map.setPadding(CFG.mapPad);
  const P = activeLine.path, n = P.length, ST = activeLine.stations;
  const oc0 = map.cameraForBounds(lineBounds(activeLine.line), { padding: CFG.ovPad, bearing: 0 });
  const OC = { center: [oc0.center.lng, oc0.center.lat], zoom: oc0.zoom };
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const PITCH = 62, LOOK = 24;
  // arrival / departure times are on the music's beat grid (vol-12, ~110 BPM)
  const S = [0, ...ST.map(s => s.s), 1];
  const LEGS = [[4.39, 6.56], [8.19, 9.83], [11.46, 13.11], [14.73, 16.38], [18.02, 19.5]];
  const T_DIVE = [2.19, 4.39], T_PULL = [19.66, 21.84];
  function sAt(t) {
    if (t <= LEGS[0][0]) return 0;
    for (let k = 0; k < LEGS.length; k++) {
      if (t < LEGS[k][0]) return S[k];
      if (t <= LEGS[k][1]) return lerp(S[k], S[k + 1], smooth(seg(t, LEGS[k][0], LEGS[k][1])));
    }
    return 1;
  }
  function pt(s) { const f = s * (n - 1), i = Math.min(Math.floor(f), n - 2), fr = f - i; return [lerp(P[i][0], P[i + 1][0], fr), lerp(P[i][1], P[i + 1][1], fr)]; }
  function brgAt(s) { const i = Math.min(Math.floor(s * (n - 1)), n - 2); return bearing(P[i], P[Math.min(i + LOOK, n - 1)]); }
  function zoomAt(s) { let d = 1; for (const st of ST) d = Math.min(d, Math.abs(s - st.s)); return CFG.zFly + CFG.zBoost * smooth(Math.max(0, 1 - d / 0.07)); }
  const short = (from, to) => from + (((to - from + 540) % 360) - 180);
  let br = null, lastI = -1;
  function camAt(i) {
    const t = i / FPS;
    if (t < T_DIVE[0]) return { center: OC.center, zoom: OC.zoom - 0.07 * (1 - t / T_DIVE[0]), pitch: 0, bearing: 0 };
    if (t < T_DIVE[1]) {
      const u = smooth(seg(t, T_DIVE[0], T_DIVE[1])), b0 = short(0, brgAt(0));
      br = brgAt(0);
      return { center: [lerp(OC.center[0], P[0][0], u), lerp(OC.center[1], P[0][1], u)], zoom: lerp(OC.zoom, zoomAt(0), u), pitch: PITCH * u, bearing: b0 * u };
    }
    if (t < T_PULL[0]) {
      const s = sAt(t);
      br = short(br, brgAt(s)) * 0.11 + br * 0.89;   // low-pass the heading so corners sweep
      return { center: pt(s), zoom: zoomAt(s), pitch: PITCH, bearing: br };
    }
    const u = smooth(seg(t, T_PULL[0], T_PULL[1])), bEnd = short(0, br);
    const drift = 0.05 * seg(t, T_PULL[1], 24.5);
    return { center: [lerp(P[n - 1][0], OC.center[0], u), lerp(P[n - 1][1], OC.center[1], u)], zoom: lerp(zoomAt(1), OC.zoom, u) + drift, pitch: PITCH * (1 - u), bearing: bEnd * (1 - u) };
  }
  // frames must be stepped in order (the heading filter carries state)
  window.__frame = async (i) => {
    let cam; for (let k = lastI + 1; k <= i; k++) cam = camAt(k); lastI = i;
    map.jumpTo(cam);
    await new Promise(res => { const done = () => res(); const to = setTimeout(done, 15000);
      const chk = () => { if (map.loaded() && map.areTilesLoaded()) { clearTimeout(to); requestAnimationFrame(() => requestAnimationFrame(done)); } else map.once("idle", chk); };
      map.once("render", chk); map.triggerRepaint(); });
  };
  // overview projections (device px) for the composition's live labels
  map.jumpTo({ center: OC.center, zoom: OC.zoom, pitch: 0, bearing: 0 });
  const pr = ll => { const p = map.project(ll); return [Math.round(p.x * 2), Math.round(p.y * 2)]; };
  return { overview: { stations: ST.map(s => ({ name: s.name, xy: pr(s.lonlat) })), notes: activeLine.notes.map(s => ({ name: s.name, xy: pr(s.lonlat) })) }, legs: LEGS, dive: T_DIVE, pull: T_PULL };
}, CFG, FPS);
writeFileSync(join(OUT, "coords.json"), JSON.stringify(coords, null, 1));

const stills = process.env.STILLS ? process.env.STILLS.split(",").map(Number) : null;
const [fa, fb] = (process.env.FRAMES || `0-${N - 1}`).split("-").map(Number);
const list = stills || Array.from({ length: fb - fa + 1 }, (_, k) => fa + k);
const t0 = Date.now();
for (const i of list) {
  await page.evaluate(i => window.__frame(i), i);
  await page.screenshot({ path: join(OUT, "frames", `f${String(i).padStart(4, "0")}.png`) });
  if (i % 60 === 0) console.log(FORMAT, "frame", i, "/", N, ((Date.now() - t0) / 1000).toFixed(0) + "s");
}
await browser.close();
if (!stills && fa === 0 && fb === N - 1) {
  const r = spawnSync("ffmpeg", ["-y", "-framerate", String(FPS), "-i", join(OUT, "frames", "f%04d.png"), "-c:v", "libx264", "-g", "1", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(OUT, "map.mp4")], { stdio: "inherit" });
  console.log("encoded", r.status);
}
console.log("done", FORMAT, list.length, "frames");
