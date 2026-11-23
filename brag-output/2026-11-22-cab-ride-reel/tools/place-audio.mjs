#!/usr/bin/env node
/*
 * Time the announcements and chimes in index.html to the ride, and set the
 * composition's length to the ride's.
 *
 *   node tools/place-audio.mjs
 *
 * The ride's timing (when the train stops at each station, how long it dwells)
 * is computed inside assets/cab-ride.js, so this builds the ride without a
 * renderer, reads those times, and rewrites the block of <audio> clips between
 * the "audio:start" and "audio:end" comments in index.html. Run it again after
 * changing the film's length, the dwell, the speeds or any clip in assets/audio.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as THREE from "../assets/vendor/three.module.js";
import city from "../assets/city-wide.js";
import { createCabRide } from "../assets/cab-ride.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// just enough of a browser for createCabRide to build its timing
const fn = () => {};
const ctx = new Proxy({}, { get: (t, k) => (k === "measureText" ? () => ({ width: 0 }) : () => ctx), set: () => true });   // every call returns the context, so gradients and the like work too
const canvas = () => ({ width: 0, height: 0, getContext: () => ctx, style: {}, addEventListener: fn });
globalThis.document = { createElement: canvas, createElementNS: canvas };
class NoRenderer { shadowMap = {}; setPixelRatio() {} setSize() {} render() {} }
const { info } = createCabRide({ ...THREE, WebGLRenderer: NoRenderer }, city, canvas(), 1280, 720, null);

// `--ride` just prints the ride's timing (for build.py, which makes the sound of the train from it)
if (process.argv.includes("--ride")) {
  console.log(JSON.stringify({ duration: info.duration, ride: info.ride, mph: info.mph, tunnel: info.tunnel }));
  process.exit(0);
}

const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(ROOT, "assets/audio", f)]).toString();
const clips = [];
// open captions: what each announcement says (assets/audio/announcements.json, written by build.py), a
// sentence at a time, each sentence given its share of the clip by its length
const said = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/audio/announcements.json"), "utf8"));
const captions = [];
const caption = (file, start) => {
  const text = said[file.replace(".wav", "")];
  if (!text) return;
  const parts = text.split(/(?<=[.!?])\s+/), total = parts.reduce((n, p) => n + p.length, 0), len = dur(file) - 0.25;
  let at = start + 0.05;
  for (const p of parts) { const d = len * p.length / total; captions.push({ start: +at.toFixed(2), end: +(at + d).toFixed(2), text: p }); at += d; }
};
const add = (id, file, start, track, volume) => {
  clips.push({ id, file, start, track, volume });
  caption(file, start);
};
if (fs.existsSync(path.join(ROOT, "assets/audio/rumble.wav"))) add("rumble", "rumble.wav", 0, 3, 0.45);   // the train itself, under everything
// The notices (notice1.wav, notice2.wav, ...) are played once each between stations, at "random": which
// gap each gets, and where in it, come from a fixed seed, so every build places them the same way.
// Change NOTICE_SEED for a different draw. A gap is the quiet between one stop's doors closing and the
// chime before the next stop's announcement; only a gap with room for the whole notice is used.
const NOTICE_SEED = 7;
const rand = (() => { let a = NOTICE_SEED >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; })();
const gaps = [];                                                  // [from, to] in film seconds, filled in below
add("prechime0", "prechime.wav", 1.0, 2, 0.8);
add("welcome", "welcome.wav", 2.7, 1, 1);
info.arrivals.forEach(({ t, name }, k) => {
  // "Next stop…" ends just before the train stops. On a short run it may have to end closer to the stop
  // to stay clear of the doors closing at the stop before.
  const i = k + 1, free = k ? info.arrivals[k - 1].t + info.dwell - 0.3 : 5.2, need = 1.7 + dur(`next${i}.wav`);
  const gap = Math.max(0.2, Math.min(1.2, t - free - need)), next = t - gap - dur(`next${i}.wav`);
  if (next - 1.7 < free - 0.05) console.warn(`  note: the announcement before ${name} overlaps the doors closing by ${(free - (next - 1.7)).toFixed(1)} s`);
  gaps.push([free + 1.0, next - 1.7 - 0.6]);
  add(`prechime${i}`, "prechime.wav", next - 1.7, 2, 0.8);
  add(`next${i}`, `next${i}.wav`, next, 1, 1);
  add(`chime${i}`, "chime.wav", t + 0.1, 2, 0.7);                 // doors open
  add(`this${i}`, `this${i}.wav`, t + 0.9, 1, 1);
  add(`closing${i}`, "closing.wav", t + info.dwell - 3.1, 1, 1);
  add(`closechime${i}`, "closechime.wav", t + info.dwell - 2.1, 2, 0.7);
});
{
  const notices = fs.readdirSync(path.join(ROOT, "assets/audio")).filter((f) => /^notice\d+\.wav$/.test(f)).sort();
  for (let i = notices.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [notices[i], notices[j]] = [notices[j], notices[i]]; }
  for (const file of notices) {
    const fits = gaps.filter(([a, b]) => b - a >= dur(file));
    if (!fits.length) { console.warn(`  note: no gap between stations is long enough for ${file}; it was left out`); continue; }
    const g = fits[Math.floor(rand() * fits.length)], start = g[0] + rand() * (g[1] - g[0] - dur(file));
    add(file.replace(".wav", ""), file, start, 1, 1);
    gaps.splice(gaps.indexOf(g), 1);                              // one notice to a gap
    console.log(`  ${file} at ${start.toFixed(1)} s`);
  }
}
// keep each caption up long enough to read: at least 2 s, and 0.7 s after the words end, unless the next one is due
captions.sort((a, b) => a.start - b.start);
captions.forEach((c, i) => {
  const next = captions[i + 1] ? captions[i + 1].start - 0.05 : Infinity;
  c.end = +Math.min(next, Math.max(c.end + 0.7, c.start + 2.0)).toFixed(2);
});
fs.writeFileSync(path.join(ROOT, "assets/captions.js"), "// Written by tools/place-audio.mjs: the announcements' open captions, in film seconds.\nexport default " + JSON.stringify(captions.sort((a, b) => a.start - b.start), null, 1) + ";\n");
// The intro cut (see film() in assets/cab-ride.js) plays only part of the ride: the clips above are in ride seconds,
// so each is cut to the cab part and moved to the cut's own clock. Under the intro, the train's sound from the
// stretch of ride it shows (shot 2, from outside, so quieter); none of its announcements.
const F = info.film, tag = (id, file, start, len, from, track, volume, fades = "") =>
  `      <audio id="${id}" class="clip" src="assets/audio/${file}" data-start="${start.toFixed(2)}" data-duration="${len.toFixed(2)}" data-media-start="${from.toFixed(2)}" data-track-index="${track}" data-volume="${volume}"${fades}></audio>`;
const placed = [];
if (clips.some((c) => c.id === "rumble")) placed.push(tag("rumble-intro", "rumble.wav", 0, F.intro, F.introFrom, 3, 0.25, ` data-fade-in="0.8" data-fade-out="0.9"`));
for (const c of clips) {
  const a = Math.max(c.start, F.cabFrom), b = Math.min(c.start + dur(c.file), F.cabTo);
  if (b - a < 0.3 || c.start > F.cabTo - 3) continue;            // nothing that would only start under the payoff
  const fades = c.id === "rumble" ? ` data-fade-in="0.9" data-fade-out="2"` : c.start + dur(c.file) > F.cabTo ? ` data-fade-out="1.5"` : "";
  placed.push(tag(c.id, c.file, F.intro + a - F.cabFrom, b - a, a - c.start, c.track, c.volume, fades));
}
const file = path.join(ROOT, "index.html");
const html = fs.readFileSync(file, "utf8");
const a0 = html.indexOf("<!-- audio:start"), b0 = html.indexOf("<!-- audio:end -->");
if (a0 < 0 || b0 < 0) throw new Error("audio:start / audio:end markers not found in index.html");
// the film's length follows from the timetable and the speed-up, so keep the composition's in step
const sized = html.replace(/(id="(?:root|cab)"[^>]*?data-duration=")[\d.]+/g, `$1${F.duration}`);
const head = "<!-- audio:start: announcements (macOS voice Zoe) and chimes, placed by tools/place-audio.mjs -->";
const a = sized.indexOf("<!-- audio:start"), b = sized.indexOf("<!-- audio:end -->");
fs.writeFileSync(file, sized.slice(0, a) + head + "\n" + placed.join("\n") + "\n      " + sized.slice(b));
console.log(`${info.duration} s film at ${info.speedup}x (peaks ${info.peakMph.join(", ")} mph; runs ${info.runSeconds.join(", ")} s); ${clips.length} clips; arrivals at ${info.arrivals.map((x) => x.t.toFixed(2)).join(", ")} s`);
