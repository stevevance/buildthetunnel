#!/usr/bin/env node
/*
 * Render the film straight from three.js to MP4, without HyperFrames' screenshot capture.
 *
 *   node tools/direct-render.mjs [--size 720|1080|2k|4k] [--output file.mp4] [--start 0] [--end 157] [--bitrate 30]
 *
 * Every frame of the film is a pure function of time (assets/cab-ride.js: render(t)), so this opens
 * index.html in Google Chrome (new headless mode, which draws on the GPU), steps t through the film a
 * frame at a time, and hands each frame of the canvas to the browser's own H.264 encoder (WebCodecs).
 * The encoded video streams back to this script, which writes it to disk, then lays the film's sound
 * under it with ffmpeg: the same clips, start times and volumes as the <audio> elements in index.html
 * (written by tools/place-audio.mjs).
 *
 * The frame size is --size: 720 (1280 x 720, the default), 1080 (1920 x 1080), 2k (2560 x 1440) or 4k (3840 x 2160).
 * It reaches the page as index.html?size=WxH and leaves index.html as it is (build.py --size sets that, for
 * HyperFrames). The bitrate defaults to suit the size: 8, 12, 20 or 30 Mbit/s. HyperFrames still does the previews
 * and the check; this only replaces its render.
 *
 * Where Chrome has no H.264 encoder for the frame size (Linux has none at 4K), or with RAW=1, each frame is sent back
 * as a JPEG (quality 0.97: raw pixels are 33 MB a frame at 4K, far too slow to send) and ffmpeg encodes them: on an
 * NVIDIA GPU with NVENC (h264_nvenc), else with x264.
 * On a Linux GPU droplet, see tools/droplet-render.sh.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// Google Chrome: the Mac's, or CHROME=... (on a Linux GPU droplet, /usr/bin/google-chrome); CHROME_ARGS adds flags (space-separated)
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const EXTRA_ARGS = (process.env.CHROME_ARGS || "").split(" ").filter(Boolean);
const FPS = 30;
const arg = (name, fallback) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : fallback; };
const output = path.resolve(arg("output", path.join(ROOT, "cab-ride-direct.mp4")));
const SIZES = { 720: [1280, 720, 8], 1080: [1920, 1080, 12], "2k": [2560, 1440, 20], "4k": [3840, 2160, 30] };   // width, height, default Mbit/s
const sizeArg = String(arg("size", "720")).toLowerCase().replace(/p$/, "");
if (!SIZES[sizeArg]) { console.error(`--size must be one of: ${Object.keys(SIZES).join(", ")}`); process.exit(1); }
const [frameW, frameH, defaultMbps] = SIZES[sizeArg];
const startT = +arg("start", 0), endArg = arg("end", null), bitrate = +arg("bitrate", defaultMbps) * 1e6;
const videoOnly = output.replace(/\.mp4$/, "") + ".video.mp4";

/* ---- a small server: the project's files, and a place for the browser to send the encoded video ---- */
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".gltf": "model/gltf+json", ".bin": "application/octet-stream" };
let fd = null, enc = null;                                        // enc: ffmpeg, taking JPEG frames on stdin (raw mode)
const held = new Map(); let nextFrame = 0;                        // frames that arrived ahead of their turn
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/__frame") {        // raw mode: frame i, a JPEG, into ffmpeg in order
    const parts = [];
    req.on("data", (c) => parts.push(c));
    req.on("end", () => {
      held.set(+url.searchParams.get("i"), Buffer.concat(parts));
      let ok = true;
      while (held.has(nextFrame)) { ok = enc.stdin.write(held.get(nextFrame)) && ok; held.delete(nextFrame++); }
      if (ok) res.end("ok"); else enc.stdin.once("drain", () => res.end("ok"));
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/__start") {        // raw mode: start ffmpeg for frames W x H
    const W = +url.searchParams.get("w"), H = +url.searchParams.get("h");
    const nvenc = execFileSync("ffmpeg", ["-hide_banner", "-encoders"]).toString().includes("h264_nvenc");
    const codec = nvenc ? ["-c:v", "h264_nvenc", "-preset", "p6", "-rc", "vbr", "-cq", "18", "-b:v", `${bitrate}`, "-maxrate", `${bitrate * 1.5}`]
      : ["-c:v", "libx264", "-preset", "medium", "-crf", "16"];
    enc = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", `${FPS}`, "-i", "-",
      ...codec, "-pix_fmt", "yuv420p", "-g", `${2 * FPS}`, videoOnly], { stdio: ["pipe", "inherit", "inherit"] });
    console.log(`JPEG frames -> ffmpeg ${nvenc ? "h264_nvenc" : "libx264"} (${W} x ${H})`);
    return res.end("ok");
  }
  if (req.method === "POST" && url.pathname === "/__out") {          // a piece of the MP4, written where the muxer says
    if (fd === null) fd = fs.openSync(videoOnly, "w");
    const parts = [];
    req.on("data", (c) => parts.push(c));
    req.on("end", () => { const buf = Buffer.concat(parts); fs.writeSync(fd, buf, 0, buf.length, +url.searchParams.get("pos")); res.end("ok"); });
    return;
  }
  const file = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
server.keepAliveTimeout = 120000;                                 // or Chrome may reuse a socket just as it closes ("Failed to fetch")
server.requestTimeout = 0;
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

/* ---- the browser ---- */
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", ...(process.platform === "darwin" ? ["--use-angle=metal"] : []),
    "--autoplay-policy=no-user-gesture-required", ...EXTRA_ARGS],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
page.on("console", (m) => { const t = m.text(); if (t.startsWith("[direct]")) console.log(t.slice(9)); });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${port}/index.html?size=${frameW}x${frameH}`, { waitUntil: "load" });
await page.waitForFunction(() => !!window.__cabRide, { timeout: 180000 });

const t0 = Date.now();
const forceRaw = process.env.RAW === "1";
const info = await page.evaluate(async (startT, endArg, FPS, bitrate, forceRaw) => {
  const { Muxer, StreamTarget } = await import("/tools/vendor/mp4-muxer.mjs");
  const ride = window.__cabRide, canvas = document.getElementById("cab");
  const W = canvas.width, H = canvas.height, endT = endArg === null ? ride.duration : +endArg;
  const gl = document.createElement("canvas").getContext("webgl2"), dbg = gl.getExtension("WEBGL_debug_renderer_info");
  console.log(`[direct] ${W} x ${H}, ${startT}-${endT} s, GPU: ${dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "?"}`);
  // H.264 High profile; level 5.2 covers 4K at 30 fps
  let config = null;
  for (const codec of ["avc1.640034", "avc1.640033", "avc1.64002A"]) {
    const c = { codec, width: W, height: H, bitrate, framerate: FPS, hardwareAcceleration: "prefer-hardware", avc: { format: "avc" } };
    if ((await VideoEncoder.isConfigSupported(c)).supported) { config = c; break; }
  }
  const first = Math.round(startT * FPS), last = Math.round(endT * FPS), n = last - first, began = performance.now();
  const progress = (k) => {
    if (k % 150 === 0 || k === n) {
      const s = (performance.now() - began) / 1000;
      console.log(`[direct] frame ${k} / ${n}  (${(k / s).toFixed(1)} frames/s, about ${Math.round((n - k) / (k / s) / 60)} min left)`);
    }
  };
  if (!config || forceRaw) {                                       // raw mode: each frame as a JPEG, a few in flight at once
    await fetch(`/__start?w=${W}&h=${H}`, { method: "POST" });
    const flight = [];
    for (let f = first; f < last; f++) {
      ride.render(f / FPS);
      const i = f - first;                                          // toBlob takes the canvas as it is now, so the next frame can be drawn at once
      const send = async (b) => {                                   // a frame is never lost to a dropped connection: try again
        for (let k = 0; ; k++) {
          try { const r = await fetch(`/__frame?i=${i}`, { method: "POST", body: b }); if (r.ok) return; } catch (e) { if (k >= 5) throw e; }
          await new Promise((r) => setTimeout(r, 200));
        }
      };
      // sent as bytes, not the Blob: Chrome's blob store fills up after a few hundred 4K frames and uploads then fail
      flight.push(new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.97)).then((b) => b.arrayBuffer()).then(send));
      if (flight.length >= 4) await flight.shift();
      progress(i + 1);
    }
    await Promise.all(flight);
    return { W, H, endT, codec: "jpeg", frames: n };
  }
  const sends = [];
  const muxer = new Muxer({
    target: new StreamTarget({ chunked: true, chunkSize: 8 * 2 ** 20,
      onData: (data, pos) => sends.push(fetch(`/__out?pos=${pos}`, { method: "POST", body: data.slice() })) }),
    video: { codec: "avc", width: W, height: H, frameRate: FPS }, fastStart: false, firstTimestampBehavior: "offset",
  });
  let failed = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failed = e; } });
  enc.configure(config);
  for (let f = first; f < last; f++) {
    if (failed) throw failed;
    ride.render(f / FPS);
    const vf = new VideoFrame(canvas, { timestamp: Math.round((f - first) * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(vf, { keyFrame: (f - first) % (2 * FPS) === 0 });
    vf.close();
    while (enc.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 2));
    progress(f - first + 1);
  }
  await enc.flush();
  muxer.finalize();
  await Promise.all(sends);
  return { W, H, endT, codec: config.codec, frames: n };
}, startT, endArg, FPS, bitrate, forceRaw);
await browser.close();
server.close();
if (enc) { enc.stdin.end(); await new Promise((r) => enc.on("close", r)); }
else fs.closeSync(fd);
console.log(`video: ${info.frames} frames (${info.codec}) in ${((Date.now() - t0) / 60000).toFixed(1)} min`);

/* ---- the sound: index.html's clips, mixed by ffmpeg at their times and volumes ---- */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const clips = [...html.matchAll(/<audio id="([^"]+)"[^>]*src="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*data-volume="([\d.]+)"/g)]
  .map(([, id, src, s, d, v]) => ({ id, src, s: +s, d: +d, v: +v }))
  .filter((c) => c.s + c.d > startT && c.s < info.endT);
const inputs = [], filters = [];
clips.forEach((c, i) => {
  inputs.push("-i", path.join(ROOT, c.src));
  const skip = Math.max(0, startT - c.s), delay = Math.round(Math.max(0, c.s - startT) * 1000);
  filters.push(`[${i + 1}:a]atrim=start=${skip.toFixed(3)},asetpts=PTS-STARTPTS,volume=${c.v},adelay=${delay}:all=1[a${i}]`);
});
const len = (info.endT - startT).toFixed(3);
const mix = clips.length ? `${filters.join(";")};${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0[mix]` : null;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", videoOnly, ...inputs,
  ...(mix ? ["-filter_complex", mix, "-map", "0:v", "-map", "[mix]", "-c:a", "aac", "-b:a", "192k"] : ["-map", "0:v"]),
  "-c:v", "copy", "-t", len, "-movflags", "+faststart", output], { stdio: "inherit" });
fs.unlinkSync(videoOnly);
console.log(`Done: ${output}`);
