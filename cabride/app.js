// The cab ride page: a one-minute cut of the cab-ride film, with the story, a map and a 360-degree view beside it.
// Everything runs on film time (video.currentTime + clipStart), the clock the data in data/ is written in.
import { videoSource, panoImages, MAP_STYLE, FOLLOW_ZOOM, PANOS, FOV, KINDS, MOBILE, MOBILE_MAX_FACE } from "./config.js";

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const narrow = matchMedia("(max-width: 899.98px)");
const getJSON = (path) => fetch(path).then((r) => {
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
});

// the header's height sets how tall the stage may be on a desktop
const header = document.querySelector(".site-header");
new ResizeObserver(() => document.documentElement.style.setProperty("--hdr", `${header.offsetHeight}px`)).observe(header);

/* ---------- data ---------- */
let film, story, track, route, places, META, mapStyle;
try {
  let hero, platform;
  [film, story, track, route, places, hero, platform, mapStyle] = await Promise.all([
    getJSON("data/film.json"), getJSON("data/story.json"), getJSON("data/track.json"), getJSON("data/route.geojson"),
    getJSON("data/places.json"), getJSON(PANOS.hero.dir + "meta.json"), getJSON(PANOS.platform.dir + "meta.json"),
    getJSON(MAP_STYLE),
  ]);
  META = { hero, platform };
} catch (err) {
  $("cards-empty").textContent = "Sorry, the ride's data didn't load. Try reloading the page.";
  throw err;
}

const { clipStart, clipEnd } = film;
const PAUSE_AT = film.hero.pullTo;          // the top of the hero shot, where the video turns into the 360 view
const PRELOAD_AT = PAUSE_AT - 25;           // start loading the 360 view this long before
const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
const kindOf = (p) => KINDS[p.kind] || KINDS.destination;

// the train's position, bearing and "air" (0 in the cab, 1 outside) at film time t, between track samples
const T0 = track[0][0], STEP = film.step || 0.25;
function trackAt(t) {
  const x = clamp((t - T0) / STEP, 0, track.length - 1);
  const i = Math.min(Math.floor(x), track.length - 2), f = x - i;
  const a = track[i], b = track[i + 1];
  const turn = ((b[3] - a[3] + 540) % 360) - 180;
  return {
    lon: a[1] + (b[1] - a[1]) * f,
    lat: a[2] + (b[2] - a[2]) * f,
    bearing: (a[3] + turn * f + 360) % 360,
    air: a[5] + (b[5] - a[5]) * f,
  };
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ---------- state ---------- */
const S = {
  t: clipStart,     // film time of the last frame shown
  stamp: 0,         // when it was shown (performance.now)
  lastPlayT: null,  // film time at the previous tick during play, to catch the crossing of PAUSE_AT
  mode: "video",    // "video" or "pano"
  follow: true,     // the map follows the train
  pano: null,       // which 360 view is loaded: "hero" or "platform"
  place: null,      // the chosen place's id
};

const video = $("video");
const stage = $("stage");
{
  const src = videoSource();
  if (/^https?:/.test(src)) video.src = src;
  else {
    // A local test file: python's http.server (local testing and the ngrok tunnel) ignores Range requests, and
    // without them Chrome can't seek. So read the file whole and play it from memory.
    fetch(src).then((r) => r.blob()).then((b) => { video.src = URL.createObjectURL(b); }).catch(() => { video.src = src; });
  }
}

// The announcements' captions, on our own switch: the players' CC buttons differ from browser to browser, and Safari's
// sits in a menu. The switch and the player's own menu stay in step.
{
  const track = () => video.textTracks[0];
  const apply = () => { const t = track(); if (t) t.mode = $("captions").checked ? "showing" : "hidden"; };
  $("captions").addEventListener("change", apply);
  video.textTracks.addEventListener("addtrack", apply);
  video.textTracks.addEventListener("change", () => { const t = track(); if (t) $("captions").checked = t.mode === "showing"; });
  apply();
}

// On phones and tablets: the page is best on a desktop (until dismissed; remembered where the browser allows)
if (MOBILE) {
  let dismissed = false;
  try { dismissed = localStorage.getItem("cabride-mobile-note") === "dismissed"; } catch {}
  if (!dismissed) $("mobile-note").hidden = false;
  $("mobile-note-close").addEventListener("click", () => {
    $("mobile-note").hidden = true;
    try { localStorage.setItem("cabride-mobile-note", "dismissed"); } catch {}
  });
}

/* ---------- time ---------- */
const HAS_RVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;

function onTime(mediaTime) {
  S.t = mediaTime + clipStart;
  S.stamp = performance.now();
  checkPause(S.t);
  updateStory(S.t);
  if (S.t >= PRELOAD_AT && $("stop360").checked && !viewerFailed) ensureViewer();
}

// film time now, carried forward between frames so the train glides on the map
function filmNow() {
  let t = S.t;
  if (!video.paused && !video.seeking && !video.ended && S.stamp) {
    t += Math.min(0.25, (performance.now() - S.stamp) / 1000) * video.playbackRate;
  }
  return Math.min(t, clipEnd);
}

// Pause at the top of the hero shot, but only when normal playback crosses it (a seek past it doesn't count).
function checkPause(t) {
  if (video.paused || video.seeking || video.ended) return;
  const prev = S.lastPlayT;
  S.lastPlayT = t;
  if (prev == null || S.mode !== "video" || !$("stop360").checked) return;
  if (prev < PAUSE_AT && t >= PAUSE_AT && t - prev < 1.5) {
    video.pause();
    seekFilm(PAUSE_AT);
    open360();
  }
}

function seekFilm(t) {
  S.lastPlayT = null;
  video.currentTime = clamp(t - clipStart, 0, clipEnd - clipStart);
  S.t = t;
  S.stamp = performance.now();
  updateStory(t);
}

// seek on a click in the page (a story card, a stop on the map)
function seekTo(t) {
  if (S.mode === "pano") close360({ play: false });
  hideEnd();
  seekFilm(t);
}

if (HAS_RVFC) {
  const onFrame = (now, meta) => {
    onTime(meta.mediaTime);
    video.requestVideoFrameCallback(onFrame);
  };
  video.requestVideoFrameCallback(onFrame);
} else {
  video.addEventListener("timeupdate", () => onTime(video.currentTime));
}
video.addEventListener("loadedmetadata", () => onTime(video.currentTime));
video.addEventListener("seeked", () => onTime(video.currentTime));
video.addEventListener("seeking", () => {
  S.lastPlayT = null;
  hideEnd();
});
video.addEventListener("play", () => {
  hideEnd();
  if (S.mode === "pano") close360({ play: false });
});
video.addEventListener("ended", showEnd);

/* ---------- story panel ---------- */
const CARDS = story
  .filter((c) => !c.cta && c.to > clipStart && c.from < clipEnd)
  .sort((a, b) => a.from - b.from);
// darker versions of the film's card colors, for text on white
const INK = { "#15a3bb": "#0b7285", "#f72f3a": "#c8102e", "#f4a300": "#8f5b00" };

const cardsList = $("cards");
const cardEls = CARDS.map((c) => {
  const li = el("li");
  li.hidden = true;
  const b = el("button", "card-btn");
  b.type = "button";
  b.style.setProperty("--c", c.color);
  b.style.setProperty("--ck", INK[c.color.toLowerCase()] || c.color);
  let body = `<span class="card-top"><span class="card-kicker">${esc(c.kicker)}</span><span class="card-now">Now</span>`
    + `<span class="card-time"><span class="visually-hidden">Play from </span>&#9654;&#xFE0E; ${fmt(c.from - clipStart)}</span></span>`;
  if (c.trip) {
    const { from, to, today, with: withCT } = c.trip;
    const bar = (label, min, cls) => `<span class="bar-row"><span class="bar-label">${label}</span>`
      + `<span class="bar-track"><span class="bar ${cls}" style="--f:${(min / Math.max(today, withCT)).toFixed(3)}"></span>`
      + `<span class="bar-min">${min} min</span></span></span>`;
    body += `<span class="trip-route">${esc(from)} &rarr; ${esc(to)}</span>`
      + bar("Today", today, "") + bar("With CrossTowner", withCT, "with");
    if (today > withCT) body += `<span class="saved">${today - withCT} minutes faster</span>`;
  } else if (c.text) {
    body += `<span class="card-text">${esc(c.text)}</span>`;
  }
  if (c.note) body += `<span class="card-note">${esc(c.note)}</span>`;
  b.innerHTML = body;
  b.addEventListener("click", () => seekTo(c.from + 0.02));
  li.addEventListener("animationend", () => li.classList.remove("is-new"));
  li.append(b);
  cardsList.append(li);
  return li;
});

let storySig = "";
function updateStory(t) {
  let shown = 0, current = -1;
  CARDS.forEach((c, i) => {
    if (t >= c.from - 0.01) shown = i + 1;
    if (t >= c.from - 0.01 && t < c.to) current = i;
  });
  const sig = `${shown}/${current}`;
  if (sig === storySig) return;
  const [prevShown] = storySig.split("/").map(Number);
  storySig = sig;
  cardEls.forEach((li, i) => {
    const show = i < shown;
    if (li.hidden === show) {
      li.hidden = !show;
      li.classList.toggle("is-new", show && i >= (prevShown || 0));
    }
    li.classList.toggle("is-current", i === current);
  });
  $("cards-empty").hidden = shown > 0;
  // keep the newest card in sight (the story panel scrolls on its own only on a desktop)
  const focusCard = cardEls[current >= 0 ? current : shown - 1];
  if (focusCard && !narrow.matches) {
    focusCard.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
}

/* ---------- place card ---------- */
function selectPlace(id, { look = false, reveal = false } = {}) {
  const p = placeById[id];
  if (!p) return;
  S.place = id;
  const k = kindOf(p), card = $("place-card");
  card.style.setProperty("--k", k.color);
  card.style.setProperty("--ki", k.ink);
  $("place-kind").innerHTML = `<span class="kind-chip">${esc(k.label)}</span>`;
  $("place-name").textContent = p.name;
  $("place-text").textContent = p.text || "";
  const facts = [];
  if (p.walk != null) facts.push(["Walk", typeof p.walk === "number" ? `${p.walk} min from the platform` : p.walk]);
  if (p.every != null) facts.push(["Buses", typeof p.every === "number" ? `every ${p.every} min` : p.every]);
  $("place-facts").innerHTML = facts.map(([k2, v]) => `<dt>${esc(k2)}</dt><dd>${esc(v)}</dd>`).join("");
  $("place-source").textContent = p.source ? `Source: ${p.source}` : "";
  $("place-source").hidden = !p.source;
  card.hidden = false;
  markPlaces();
  if (narrow.matches && reveal) card.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
  else if (!narrow.matches) $("story").scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  if (look && S.mode === "pano" && viewer) {
    const tg = META[S.pano].targets.find((x) => x.id === id);
    if (tg) {
      const to = { yaw: rad(tg.yaw), pitch: rad(tg.pitch) };
      if (reduceMotion.matches) viewer.rotate(to);
      else viewer.animate({ ...to, speed: 1200 });
    }
  }
}
function closePlace() {
  S.place = null;
  $("place-card").hidden = true;
  markPlaces();
}
$("place-close").addEventListener("click", closePlace);

// the same place appears up to three times: a dot on the map, a pill in the 360 view, a button in the list
const placeEls = { map: {}, pano: {}, list: {} };
const eachPlaceEl = (id, fn) => ["map", "pano", "list"].forEach((k) => placeEls[k][id] && fn(placeEls[k][id]));
function markPlaces() {
  for (const p of places) eachPlaceEl(p.id, (e) => e.classList.toggle("is-selected", p.id === S.place));
}
function hot(id, on) {
  eachPlaceEl(id, (e) => e.classList.toggle("is-hot", on));
}
function hoverable(node, id) {
  node.addEventListener("mouseenter", () => hot(id, true));
  node.addEventListener("mouseleave", () => hot(id, false));
  node.addEventListener("focus", () => hot(id, true));
  node.addEventListener("blur", () => hot(id, false));
}

/* ---------- map ---------- */
const maplibregl = window.maplibregl;
// credit OpenFreeMap, OpenMapTiles and the OpenStreetMap contributors (a style's own attribution overrides its TileJSON's)
for (const src of Object.values(mapStyle.sources)) {
  if (src.type === "vector") {
    src.attribution = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> '
      + '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a> '
      + '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>';
  }
}
const start = trackAt(clipStart);
const map = new maplibregl.Map({
  container: "map",
  style: mapStyle,
  center: [start.lon, start.lat],
  zoom: FOLLOW_ZOOM.cab,
  attributionControl: { compact: true },
  dragRotate: false,
  pitchWithRotate: false,
  touchPitch: false,
  maxPitch: 0,
  cooperativeGestures: narrow.matches, // on a phone, one finger scrolls the page past the map strip
});
map.touchZoomRotate.disableRotation();
map.keyboard.disableRotation();
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

class FollowControl {
  onAdd() {
    this.box = el("div", "maplibregl-ctrl maplibregl-ctrl-group follow-ctrl");
    const b = el("button", "follow-btn", "&#9678; Follow the train");
    b.type = "button";
    b.addEventListener("click", () => setFollow(true));
    this.box.append(b);
    this.box.hidden = true;
    return this.box;
  }
  onRemove() { this.box.remove(); }
}
const followCtrl = new FollowControl();
map.addControl(followCtrl, "top-left");
function setFollow(on) {
  S.follow = on;
  followCtrl.box.hidden = on || S.mode === "pano";
}
// dragging or zooming the map by hand stops the following
const byHand = (e) => { if (e.originalEvent && S.mode === "video") setFollow(false); };
map.on("dragstart", byHand);
map.on("zoomstart", byHand);

// the train: a dot with a heading arrow, north-up, turned to the line's bearing
const trainEl = el("div", "train-marker",
  '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" fill="#0b7285" stroke="#fff" stroke-width="3"/>'
  + '<path d="M18 7 L25.5 25 L18 21 L10.5 25 Z" fill="#fff"/></svg>');
trainEl.setAttribute("role", "img");
trainEl.setAttribute("aria-label", "The train");
const trainMarker = new maplibregl.Marker({ element: trainEl, rotationAlignment: "map", pitchAlignment: "map" })
  .setLngLat([start.lon, start.lat]).setRotation(start.bearing);

// the stops: the cut's are buttons that seek to the train's arrival; the rest are only drawn
const inCut = (s) => s.t >= clipStart && s.t <= clipEnd;
for (const s of film.stops.filter(inCut)) {
  const wrap = el("div", "stop-marker");
  const b = el("button", "stop-btn", `<span class="stop-dot"></span><span class="stop-name">${esc(s.name)}</span>`);
  b.type = "button";
  b.title = `Jump to the train's arrival at ${s.name}`;
  b.setAttribute("aria-label", `${s.name}: jump to the train's arrival`);
  b.addEventListener("click", () => seekTo(s.t));
  wrap.append(b);
  new maplibregl.Marker({ element: wrap, anchor: "left", offset: [-6.5, 0] }).setLngLat(s.lonlat).addTo(map);
}

// the places, as small dots
for (const p of places) {
  const k = kindOf(p), wrap = el("div", "place-marker");
  const b = el("button", "place-dot", `<span class="place-label">${esc(p.name)}</span>`);
  b.type = "button";
  b.style.setProperty("--k", k.color);
  b.style.setProperty("--ki", k.ink);
  b.setAttribute("aria-label", `${p.name} (${k.label.toLowerCase()})`);
  b.addEventListener("click", () => selectPlace(p.id, { look: true, reveal: true }));
  hoverable(b, p.id);
  placeEls.map[p.id] = b;
  wrap.append(b);
  new maplibregl.Marker({ element: wrap }).setLngLat([p.lon, p.lat]).addTo(map);
}
trainMarker.addTo(map); // last, so it sits above the stops and places

const EMPTY = { type: "FeatureCollection", features: [] };
let mapReady = false;
map.on("load", () => {
  const w = (a, b) => ["interpolate", ["linear"], ["zoom"], 11, a, 16, b];
  map.addSource("cone", { type: "geojson", data: EMPTY });
  map.addLayer({ id: "cone-fill", type: "fill", source: "cone", filter: ["==", ["geometry-type"], "Polygon"],
    paint: { "fill-color": "#15a3bb", "fill-opacity": 0.2 } });
  map.addLayer({ id: "cone-line", type: "line", source: "cone", filter: ["==", ["geometry-type"], "Polygon"],
    paint: { "line-color": "#0b7285", "line-width": 1.5, "line-opacity": 0.8 } });
  map.addSource("route", { type: "geojson", data: route });
  map.addLayer({ id: "route", type: "line", source: "route", filter: ["==", ["get", "part"], "route"],
    layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#7d8a91", "line-width": w(2.5, 5) } });
  map.addLayer({ id: "tunnel-casing", type: "line", source: "route", filter: ["==", ["get", "part"], "tunnel"],
    layout: { "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": w(4.5, 8) } });
  map.addLayer({ id: "tunnel", type: "line", source: "route", filter: ["==", ["get", "part"], "tunnel"],
    layout: { "line-join": "round" }, paint: { "line-color": "#15a3bb", "line-width": w(3, 5.5), "line-dasharray": [1.4, 1] } });
  const others = film.stops.filter((s) => !inCut(s));
  map.addSource("stops", { type: "geojson", data: { type: "FeatureCollection", features: others.map((s) => (
    { type: "Feature", properties: { name: s.name }, geometry: { type: "Point", coordinates: s.lonlat } })) } });
  map.addLayer({ id: "stops", type: "circle", source: "stops",
    paint: { "circle-radius": w(3.5, 6), "circle-color": "#ffffff", "circle-stroke-color": "#7d8a91", "circle-stroke-width": 2.5 } });
  map.addLayer({ id: "stop-labels", type: "symbol", source: "stops",
    layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 11.5, "text-anchor": "left", "text-offset": [0.8, 0] },
    paint: { "text-color": "#4a565c", "text-halo-color": "#ffffff", "text-halo-width": 1.6 } });
  map.addLayer({ id: "pano-at", type: "circle", source: "cone", filter: ["==", ["geometry-type"], "Point"],
    paint: { "circle-radius": 5.5, "circle-color": "#ffffff", "circle-stroke-color": "#0b7285", "circle-stroke-width": 3 } });
  mapReady = true;
  // on a phone the full credit line would cover a fifth of the map strip: start it folded behind its (i) button
  if (narrow.matches) map.getContainer().querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
});

// Follow the train: north-up, centered on it, closer in the cab and farther out for the shots from outside. Eased.
let lastFrame = performance.now();
function follow(p, dt) {
  const target = p.air > 0.5 ? FOLLOW_ZOOM.air : FOLLOW_ZOOM.cab;
  const c = map.getCenter(), z = map.getZoom();
  const k = reduceMotion.matches ? 1 : 1 - Math.exp(-dt / 0.3);
  const kz = reduceMotion.matches ? 1 : 1 - Math.exp(-dt / 0.9);
  const lon = c.lng + (p.lon - c.lng) * k, lat = c.lat + (p.lat - c.lat) * k, zoom = z + (target - z) * kz;
  if (Math.abs(lon - c.lng) < 1e-8 && Math.abs(lat - c.lat) < 1e-8 && Math.abs(zoom - z) < 1e-4) return;
  map.jumpTo({ center: [lon, lat], zoom });
}
function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!HAS_RVFC && !video.paused) checkPause(video.currentTime + clipStart);
  const p = trackAt(filmNow());
  trainMarker.setLngLat([p.lon, p.lat]).setRotation(p.bearing);
  if (S.follow && S.mode === "video" && !map.isMoving()) follow(p, dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- the 360 view ---------- */
let viewer = null, markersPlugin = null, rangePlugin = null, gyroPlugin = null, viewerReady = null, viewerFailed = false;
// The six faces, laid out as the usual skybox cross (the top face's bottom edge and the bottom face's top edge meet the
// front). PSV's own cross ("net") loader marks that layout flipTopBottom, so separate faces cut from it need the same.
// Each view comes as tiles at several levels of detail (tools/cubemap.mjs --tiles: 2048, 4096 and 8192 px faces, listed
// in meta.levels), the viewer fetching the level that suits its zoom, over a small whole cube (base/) while they load.
const levelsOf = (key) => META[key].levels.filter((l) => !MOBILE || l.faceSize <= MOBILE_MAX_FACE);   // (phones: the smallest only)
const facePaths = (key) => Object.fromEntries(["left", "front", "right", "back", "top", "bottom"].map((f) => [f, panoImages(PANOS[key].dir) + "base/" + f + ".jpg"]));
const faces = (key) => ({
  baseUrl: { type: "separate", paths: facePaths(key), flipTopBottom: true },
  levels: levelsOf(key),
  tileUrl: (face, col, row, level) => `${panoImages(PANOS[key].dir)}tiles/${levelsOf(key)[level].faceSize}/${face}_${col}_${row}.jpg`,
  flipTopBottom: true,
});
const lookOf = (key) => ({ yaw: rad(META[key].look.yaw), pitch: rad(META[key].look.pitch) });

// On a phone the viewer is small: touch does the looking and zooming, so its navbar keeps only tilt-to-look
// (the gyroscope button, shown only where the device supports it) and fullscreen.
const navbarButtons = () => (narrow.matches ? ["gyroscope", "fullscreen"] : ["zoom", "move", "gyroscope", "caption", "fullscreen"]);
narrow.addEventListener("change", () => viewer?.setOption("navbar", navbarButtons()));

// load Photo Sphere Viewer and the hero view (once), hidden under the video until the pause
function ensureViewer() {
  if (viewerReady) return viewerReady;
  viewerReady = (async () => {
    const [{ Viewer }, { CubemapTilesAdapter }, { MarkersPlugin }, { GyroscopePlugin }, { VisibleRangePlugin }] = await Promise.all([
      import("@photo-sphere-viewer/core"), import("@photo-sphere-viewer/cubemap-tiles-adapter"),
      import("@photo-sphere-viewer/markers-plugin"), import("@photo-sphere-viewer/gyroscope-plugin"),
      import("@photo-sphere-viewer/visible-range-plugin"),
    ]);
    const look = lookOf("hero");
    // The faces' front looks north and the meta's yaw runs clockwise from north, as PSV's yaw does from the front face,
    // so yaw passes straight through (checked: the Willis Tower's marker sits on the tower in the paused frame).
    viewer = new Viewer({
      container: $("psv"),
      adapter: CubemapTilesAdapter,
      panorama: faces("hero"),
      caption: PANOS.hero.label,
      defaultYaw: look.yaw,
      defaultPitch: look.pitch,
      minFov: FOV.min,
      maxFov: FOV.max,
      defaultZoomLvl: 50,
      navbar: navbarButtons(),
      keyboard: false, // turned on only while the viewer has focus (below), so the arrow keys still scroll the page
      loadingTxt: "Loading the 360° view…",
      plugins: [
        [MarkersPlugin, { markers: [] }],
        [GyroscopePlugin, { touchmove: true }],
        [VisibleRangePlugin, { verticalRange: [-Math.PI / 2, rad(PANOS.hero.top)] }],
      ],
    });
    markersPlugin = viewer.getPlugin(MarkersPlugin);
    rangePlugin = viewer.getPlugin(VisibleRangePlugin);
    gyroPlugin = viewer.getPlugin(GyroscopePlugin);
    await new Promise((resolve) => viewer.addEventListener("ready", resolve, { once: true }));
    S.pano = "hero";
    setHotspots("hero");
    viewer.addEventListener("position-updated", drawCone);
    viewer.addEventListener("zoom-updated", drawCone);
    viewer.addEventListener("size-updated", drawCone);
    markersPlugin.addEventListener("select-marker", (e) => selectPlace(e.marker.id, { reveal: true }));
    markersPlugin.addEventListener("enter-marker", (e) => hot(e.marker.id, true));
    markersPlugin.addEventListener("leave-marker", (e) => hot(e.marker.id, false));
    const psvEl = $("psv");
    psvEl.addEventListener("focusin", () => viewer.startKeyboardControl());
    psvEl.addEventListener("focusout", (e) => { if (!psvEl.contains(e.relatedTarget)) viewer.stopKeyboardControl(); });
  })();
  // after a failure, try again only when someone asks for the 360 view, not on every frame
  viewerReady.catch((err) => { viewerReady = null; viewerFailed = true; console.warn("The 360 view didn't load:", err); });
  return viewerReady;
}

// Lay the hotspot labels out so they overlap as little as possible in the opening view. Each pill sits on a stem
// above its place (or below it, near the top edge), centered or off to one side; a crowded place gets a longer stem.
// The pills keep clear of the buttons over the top-left corner and of the viewer's navbar along the bottom.
const measure = document.createElement("canvas").getContext("2d");
function labelLayout(key) {
  const { look, targets } = META[key];
  const psv = $("psv"), w = psv.clientWidth || 960, h = psv.clientHeight || 540;
  const small = narrow.matches, font = small ? 11 : 13, pad = small ? 17 : 23, pillH = font + (small ? 11 : 13);
  measure.font = `600 ${font}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const dir = (y, p) => [Math.sin(rad(y)) * Math.cos(rad(p)), Math.sin(rad(p)), Math.cos(rad(y)) * Math.cos(rad(p))];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const f = dir(look.yaw, look.pitch), r = [Math.cos(rad(look.yaw)), 0, -Math.sin(rad(look.yaw))];
  const u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
  const fpx = h / 2 / Math.tan(rad((FOV.min + FOV.max) / 4));
  const pts = targets.map((tg) => {
    const d = dir(tg.yaw, tg.pitch), z = dot(d, f);
    const name = placeById[tg.id]?.name || tg.name;
    return { id: tg.id, front: z > 0.05, x: w / 2 + (fpx * dot(d, r)) / z, y: h / 2 - (fpx * dot(d, u)) / z, w: measure.measureText(name).width + pad };
  });
  // the areas to keep clear, in the viewer's pixels
  const base = psv.getBoundingClientRect();
  const keepClear = small ? [[0, h - 42, 92, h], [w - 46, h - 42, w, h]] : [[0, h - 44, w, h]];
  for (const b of document.querySelectorAll(".pano-bar > *")) {
    const rb = b.getBoundingClientRect();
    keepClear.push([rb.left - base.left - 4, rb.top - base.top - 4, rb.right - base.left + 4, rb.bottom - base.top + 4]);
  }
  const STEMS = [14, 40, 66, 92, 118];
  const SIDES = [
    { shift: "-50%", left: (p) => p.x - p.w / 2, cost: 0 },
    { shift: "calc(-100% + 12px)", left: (p) => p.x + 12 - p.w, cost: 0.01 },
    { shift: "-12px", left: (p) => p.x - 12, cost: 0.01 },
  ];
  const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
  const vis = pts.filter((p) => p.front);
  for (const p of vis) {
    p.tip = [p.x - 6, p.y - 6, p.x + 6, p.y + 6];
    p.options = [false, true].flatMap((below) => STEMS.flatMap((s) => SIDES.map((side) => {
      const x0 = side.left(p), y0 = below ? p.y + s : p.y - s - pillH;
      const box = [x0 - 3, y0 - 3, x0 + p.w + 3, y0 + pillH + 3];
      let base = s / 1000 + side.cost + (below ? 0.02 : 0);
      if (box[0] < 0 || box[2] > w || box[1] < 0 || box[3] > h) base += 8; // off the view: nearly as bad as a pile-up
      for (const k of keepClear) if (hit(box, k)) base += 3;
      return { s, side, below, box, stem: below ? [p.x - 1, p.y, p.x + 1, p.y + s] : [p.x - 1, p.y - s, p.x + 1, p.y], base };
    })));
    p.pick = p.options.reduce((a, o) => (o.base < a.base ? o : a));
  }
  // a pill on another pill is worst; a pill over another's stem or tip is bad too. A few rounds in which each
  // label takes its best spot given all the others.
  const cost = (p, o) => vis.reduce((c, q) => q === p ? c
    : c + (hit(o.box, q.pick.box) ? 10 : 0) + (hit(o.stem, q.pick.box) ? 1 : 0) + (hit(o.box, q.pick.stem) ? 1 : 0) + (hit(o.box, q.tip) ? 2 : 0), o.base);
  for (let round = 0; round < 8; round++) {
    let moved = false;
    for (const p of vis) {
      const best = p.options.reduce((a, o) => (cost(p, o) < cost(p, a) ? o : a), p.pick);
      if (best !== p.pick) { p.pick = best; moved = true; }
    }
    if (!moved) break;
  }
  const out = {};
  for (const p of pts) out[p.id] = p.front ? { stem: p.pick.s, shift: p.pick.side.shift, below: p.pick.below } : { stem: STEMS[0], shift: SIDES[0].shift, below: false };
  return out;
}

function setHotspots(key) {
  const layout = labelLayout(key);
  placeEls.pano = {};
  markersPlugin.setMarkers(META[key].targets.map((tg) => {
    const p = placeById[tg.id] || tg, k = kindOf(p);
    const node = el("div", "hs", `<span class="hs-pill">${esc(p.name)}</span><span class="hs-stem"></span>`);
    node.style.setProperty("--k", k.color);
    node.style.setProperty("--ki", k.ink);
    const at = layout[tg.id];
    node.style.setProperty("--stem", `${at.stem}px`);
    node.style.setProperty("--shift", at.shift);
    node.classList.toggle("hs--below", at.below);
    node.setAttribute("aria-hidden", "true"); // the list under the viewer is the accessible way in
    placeEls.pano[tg.id] = node;
    return { id: tg.id, element: node, position: { yaw: rad(tg.yaw), pitch: rad(tg.pitch) },
      anchor: at.below ? "top center" : "bottom center", zIndex: 10 };
  }));
  // the same hotspots as plain buttons, for keyboard and screen-reader users
  const list = $("hotspot-list");
  list.replaceChildren();
  placeEls.list = {};
  for (const tg of META[key].targets) {
    const p = placeById[tg.id] || tg, k = kindOf(p);
    const b = el("button", "hs-btn", `<span class="kdot" aria-hidden="true"></span>${esc(p.name)}`);
    b.type = "button";
    b.style.setProperty("--k", k.color);
    b.addEventListener("click", () => selectPlace(tg.id, { look: true, reveal: true }));
    hoverable(b, tg.id);
    placeEls.list[tg.id] = b;
    const li = el("li");
    li.append(b);
    list.append(li);
  }
  $("hotspots-h").textContent = key === "hero" ? "What you can see from up here" : "What you can reach from the platform";
  markPlaces();
}

// show one of the views, facing the way its meta says (the paused frame's own view, for the hero)
async function showPano(key, { animate = false } = {}) {
  const position = lookOf(key);
  if (S.pano === key) {
    viewer.rotate(position);
    viewer.zoom(50);
  } else {
    markersPlugin.clearMarkers();
    const ok = await viewer.setPanorama(faces(key), {
      position,
      zoom: 50,
      caption: PANOS[key].label,
      transition: animate && !reduceMotion.matches ? { speed: 1500, rotation: true, effect: "fade" } : false,
    });
    if (ok === false) return;
    S.pano = key;
    rangePlugin.setVerticalRange([-Math.PI / 2, rad(PANOS[key].top)]);
    setHotspots(key);
  }
  $("pano-switch").textContent = key === "hero" ? "Down to the platform" : "Back up above";
  drawCone();
  fitMapToPano();
}

async function open360() {
  if (S.mode === "pano") return;
  S.mode = "pano";
  hideEnd();
  if (!video.paused) video.pause();
  if (document.fullscreenElement === video) document.exitFullscreen().catch(() => {});
  if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen();
  setFollow(S.follow);
  $("open360").disabled = true;
  const loading = $("pano-loading");
  loading.hidden = false;
  try {
    await ensureViewer();
    if (S.mode !== "pano") return;
    await showPano("hero");
  } catch (err) {
    loading.textContent = "Sorry, the 360° view didn't load.";
    setTimeout(() => { loading.hidden = true; loading.textContent = "Loading the 360° view…"; close360({ play: false }); }, 2500);
    return;
  }
  loading.hidden = true;
  if (S.mode !== "pano") return;
  stage.classList.add("is-pano");
  video.setAttribute("inert", "");
  $("hotspots").hidden = false;
  $("psv").focus({ preventScroll: true });
  // fetch the platform's faces now, so the switch is quick
  for (const src of Object.values(facePaths("platform"))) new Image().src = src;
}

function close360({ play = true } = {}) {
  if (S.mode !== "pano") return;
  S.mode = "video";
  stage.classList.remove("is-pano");
  video.removeAttribute("inert");
  $("hotspots").hidden = true;
  $("open360").disabled = false;
  $("pano-loading").hidden = true;
  if (viewer) {
    viewer.stopKeyboardControl();
    if (gyroPlugin?.isEnabled()) gyroPlugin.stop();
  }
  for (const id of Object.keys(placeEls.pano)) hot(id, false);
  if (mapReady) map.getSource("cone").setData(EMPTY);
  setFollow(true);
  if (play) {
    video.focus({ preventScroll: true });
    video.play().catch(() => {});
  }
}

$("pano-back").addEventListener("click", () => close360({ play: true }));
$("pano-switch").addEventListener("click", () => {
  if (viewer && S.mode === "pano") showPano(S.pano === "hero" ? "platform" : "hero", { animate: true });
});
$("open360").addEventListener("click", () => {
  hideEnd();
  video.pause();
  seekFilm(PAUSE_AT);
  open360();
});
$("open360").addEventListener("pointerenter", () => ensureViewer(), { once: true });

// the view cone on the map: from the panorama's spot, the current yaw, as wide as the current field of view
function conePolygon([lon0, lat0], yaw, hfov, meters) {
  const mLat = 111320, mLon = 111320 * Math.cos(rad(lat0)), ring = [[lon0, lat0]];
  for (let i = 0; i <= 24; i++) {
    const a = rad(yaw - hfov / 2 + (hfov * i) / 24);
    ring.push([lon0 + (Math.sin(a) * meters) / mLon, lat0 + (Math.cos(a) * meters) / mLat]);
  }
  ring.push([lon0, lat0]);
  return ring;
}
function drawCone() {
  if (!mapReady || !viewer || S.mode !== "pano" || !S.pano) return;
  const at = META[S.pano].at.lonlat;
  const ring = conePolygon(at, deg(viewer.getPosition().yaw), viewer.state.hFov, PANOS[S.pano].cone);
  map.getSource("cone").setData({ type: "FeatureCollection", features: [
    { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } },
    { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: at } },
  ] });
}
// frame the map on the view: the cone at its opening direction, and the places within reach of it
function fitMapToPano() {
  if (!mapReady || !viewer || !S.pano) return;
  const meta = META[S.pano], reach = PANOS[S.pano].cone;
  const pts = conePolygon(meta.at.lonlat, meta.look.yaw, viewer.state.hFov || 66, reach);
  for (const tg of meta.targets) if (tg.dist <= reach * 1.1) pts.push([tg.lon, tg.lat]);
  const b = pts.reduce((bb, p) => bb.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
  map.fitBounds(b, { padding: 24, maxZoom: 16.5, duration: reduceMotion.matches ? 0 : 900 });
}

/* ---------- the end of the cut ---------- */
function showEnd() {
  if (S.mode === "pano") return;
  $("end-layer").hidden = false;
}
function hideEnd() {
  $("end-layer").hidden = true;
}
$("replay").addEventListener("click", () => {
  hideEnd();
  seekFilm(clipStart);
  video.play().catch(() => {});
});

updateStory(clipStart);
