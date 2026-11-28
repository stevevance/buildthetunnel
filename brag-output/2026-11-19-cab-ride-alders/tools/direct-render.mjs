#!/usr/bin/env node
/*
 * Render the film straight from three.js to MP4, without HyperFrames' screenshot capture.
 *
 *   node tools/direct-render.mjs [--output file.mp4] [--start 0] [--end 157] [--bitrate 30] [--edit edit.json]
 *
 * --edit plays a cut instead of the whole film: pieces of it (source seconds) joined by dissolves (edit.json). In a
 * dissolve both pieces are drawn and blended; the sound of each piece is mixed on its own (only announcements that
 * fit wholly inside it, so none is cut off mid-sentence; the train's own sound throughout) and crossfaded to the next.
 *
 * Every frame of the film is a pure function of time (assets/cab-ride.js: render(t)), so this opens
 * index.html in Google Chrome (new headless mode, which draws on the GPU), steps t through the film a
 * frame at a time, and hands each frame of the canvas to the browser's own H.264 encoder (WebCodecs).
 * The encoded video streams back to this script, which writes it to disk, then lays the film's sound
 * under it with ffmpeg: the same clips, start times and volumes as the <audio> elements in index.html
 * (written by tools/place-audio.mjs).
 *
 * The frame size is whatever index.html is set to (build.py --size). HyperFrames still does the
 * previews and the check; this only replaces its render.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FPS = 30;
const arg = (name, fallback) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : fallback; };
const output = path.resolve(arg("output", path.join(ROOT, "cab-ride-direct.mp4")));
const startT = +arg("start", 0), endArg = arg("end", null), bitrate = +arg("bitrate", 30) * 1e6;
const videoOnly = output.replace(/\.mp4$/, "") + ".video.mp4";
const editFile = arg("edit", null), edit = editFile ? JSON.parse(fs.readFileSync(path.resolve(editFile), "utf8")) : null;

/* ---- a small server: the project's files, and a place for the browser to send the encoded video ---- */
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".wav": "audio/wav", ".gltf": "model/gltf+json", ".bin": "application/octet-stream" };
let fd = null;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "POST" && url.pathname === "/__out") {          // a piece of the MP4, written where the muxer says
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
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

/* ---- the browser ---- */
fd = fs.openSync(videoOnly, "w");
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--use-angle=metal", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
page.on("console", (m) => { const t = m.text(); if (t.startsWith("[direct]")) console.log(t.slice(9)); });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "load" });
await page.waitForFunction(() => !!window.__cabRide, { timeout: 180000 });

const t0 = Date.now();
const info = await page.evaluate(async (startT, endArg, FPS, bitrate, edit) => {
  const { Muxer, StreamTarget } = await import("/tools/vendor/mp4-muxer.mjs");
  const ride = window.__cabRide, canvas = document.getElementById("cab");
  const W = canvas.width, H = canvas.height;
  // the film's time to show at output time u, as [[source time, weight], ...]: one entry, or two in a dissolve
  const pieces = edit ? edit.pieces : null, X = edit ? edit.xfade : 0;
  const outAt = [];                                               // where each piece starts in the output
  if (pieces) { let o = 0; pieces.forEach((q) => { outAt.push(o); o += q.to - q.from - X; }); }
  const cutLength = pieces ? outAt[outAt.length - 1] + pieces[pieces.length - 1].to - pieces[pieces.length - 1].from : 0;
  const sourceAt = (u) => {
    if (!pieces) return [[u, 1]];
    const k = Math.max(0, outAt.findLastIndex((o) => o <= u)), local = u - outAt[k], q = pieces[k];
    const next = pieces[k + 1], overlap = next ? local - (q.to - q.from - X) : -1;
    if (overlap > 0) { const w = overlap / X; return [[q.from + local, 1 - w], [next.from + overlap, w]]; }
    return [[q.from + local, 1]];
  };
  const endT = pieces ? cutLength : endArg === null ? ride.duration : +endArg;
  const held = document.createElement("canvas"); held.width = W; held.height = H;
  const heldCtx = held.getContext("2d"), outCtx = canvas.getContext("2d");
  const gl = document.createElement("canvas").getContext("webgl2"), dbg = gl.getExtension("WEBGL_debug_renderer_info");
  console.log(`[direct] ${W} x ${H}, ${startT}-${endT} s, GPU: ${dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "?"}`);
  // H.264 High profile; level 5.2 covers 4K at 30 fps
  let config = null;
  for (const codec of ["avc1.640034", "avc1.640033", "avc1.64002A"]) {
    const c = { codec, width: W, height: H, bitrate, framerate: FPS, hardwareAcceleration: "prefer-hardware", avc: { format: "avc" } };
    if ((await VideoEncoder.isConfigSupported(c)).supported) { config = c; break; }
  }
  if (!config) throw new Error("no H.264 encoder for " + W + " x " + H);
  const sends = [];
  const muxer = new Muxer({
    target: new StreamTarget({ chunked: true, chunkSize: 8 * 2 ** 20,
      onData: (data, pos) => sends.push(fetch(`/__out?pos=${pos}`, { method: "POST", body: data.slice() })) }),
    video: { codec: "avc", width: W, height: H, frameRate: FPS }, fastStart: false, firstTimestampBehavior: "offset",
  });
  let failed = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failed = e; } });
  enc.configure(config);
  const first = Math.round(startT * FPS), last = Math.round(endT * FPS), n = last - first, began = performance.now();
  for (let f = first; f < last; f++) {
    if (failed) throw failed;
    const src = sourceAt(f / FPS);
    if (src.length === 1) ride.render(src[0][0]);
    else {                                                        // a dissolve: the outgoing piece, then the incoming one over it
      ride.render(src[0][0]); heldCtx.globalAlpha = 1; heldCtx.drawImage(canvas, 0, 0);
      ride.render(src[1][0]);
      outCtx.save(); outCtx.globalAlpha = src[0][1]; outCtx.drawImage(held, 0, 0); outCtx.restore();
    }
    const vf = new VideoFrame(canvas, { timestamp: Math.round((f - first) * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
    enc.encode(vf, { keyFrame: (f - first) % (2 * FPS) === 0 });
    vf.close();
    while (enc.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 2));
    const k = f - first + 1;
    if (k % 150 === 0 || k === n) {
      const s = (performance.now() - began) / 1000;
      console.log(`[direct] frame ${k} / ${n}  (${(k / s).toFixed(1)} frames/s, about ${Math.round((n - k) / (k / s) / 60)} min left)`);
    }
  }
  await enc.flush();
  muxer.finalize();
  await Promise.all(sends);
  return { W, H, endT, codec: config.codec, frames: n };
}, startT, endArg, FPS, bitrate, edit);
await browser.close();
server.close();
fs.closeSync(fd);
console.log(`video: ${info.frames} frames (${info.codec}) in ${((Date.now() - t0) / 60000).toFixed(1)} min`);

/* ---- the sound: index.html's clips, mixed by ffmpeg at their times and volumes ---- */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const allClips = [...html.matchAll(/<audio id="([^"]+)"[^>]*src="([^"]+)" data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*data-volume="([\d.]+)"/g)]
  .map(([, id, src, s, d, v]) => ({ id, src, s: +s, d: +d, v: +v }));
// the mix of [T0, T1] of the film to a WAV file; whole: only clips wholly inside it (the train's sound always)
const mixTo = (T0, T1, file, whole) => {
  const clips = allClips.filter((c) => c.s + c.d > T0 && c.s < T1 && (!whole || c.id === "rumble" || (c.s >= T0 - 0.01 && c.s + c.d <= T1 + 0.01)));
  const inputs = [], filters = [];
  clips.forEach((c, i) => {
    inputs.push("-i", path.join(ROOT, c.src));
    const skip = Math.max(0, T0 - c.s), delay = Math.round(Math.max(0, c.s - T0) * 1000);
    filters.push(`[${i}:a]atrim=start=${skip.toFixed(3)},asetpts=PTS-STARTPTS,volume=${c.v},adelay=${delay}:all=1[a${i}]`);
  });
  const mix = `${filters.join(";")};${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,apad[m]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", mix, "-map", "[m]", "-t", (T1 - T0).toFixed(3), "-ar", "48000", "-ac", "2", file], { stdio: "inherit" });
};
const sound = output.replace(/\.mp4$/, "") + ".sound.wav";
if (!edit) mixTo(startT, info.endT, sound, false);
else {                                                            // each piece on its own, then crossfaded into one
  const parts = edit.pieces.map((q, i) => { const f = output.replace(/\.mp4$/, "") + `.piece${i}.wav`; mixTo(q.from, q.to, f, true); return f; });
  const chain = parts.slice(1).reduce((acc, _, i) => `${acc}${i ? `[x${i}]` : "[0:a]"}[${i + 1}:a]acrossfade=d=${edit.xfade}:c1=tri:c2=tri[x${i + 1}];`, "");
  execFileSync("ffmpeg", ["-v", "error", "-y", ...parts.flatMap((f) => ["-i", f]), "-filter_complex", chain.slice(0, -1), "-map", `[x${parts.length - 1}]`, sound], { stdio: "inherit" });
  parts.forEach((f) => fs.unlinkSync(f));
}
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", videoOnly, "-i", sound, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
  "-t", (info.endT - (edit ? 0 : startT)).toFixed(3), "-movflags", "+faststart", output], { stdio: "inherit" });
fs.unlinkSync(videoOnly); fs.unlinkSync(sound);
console.log(`Done: ${output}`);
