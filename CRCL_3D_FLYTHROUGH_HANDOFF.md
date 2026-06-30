# CRCL 3D Flythrough — Handoff

A self-contained MapLibre GL viewer that flies a pitched 3D camera along the
**Clinton-Roosevelt Connector Line (CRCL)** of the CrossTowner transit concept,
over OpenFreeMap vector tiles (real extruded buildings).

Status: **working first version**, two enhancements left to wire up (below).

---

## Files (in this directory, `~/Sites/BuildTheTunnel/`)
- `index.html` — the viewer (single file, data embedded inline).
- `crcl_geo.json` — **finalized** geometry/animation data (use this; see below).

The HTML currently has an OLDER embedded dataset (unsmoothed 419-pt path, 294
stations, no station stops). **First step: replace the embedded data with
`crcl_geo.json`.** In the HTML, find the line:

```js
const D = { ...big object... };
```

Either paste `crcl_geo.json`'s contents there, or load it. Note: `fetch()` of a
local file fails under `file://`, so to load it instead of inlining, run a tiny
server in this dir and open via http:

```bash
python3 -m http.server 8000
# then http://localhost:8000/index.html
```

Needs internet (MapLibre CDN + OpenFreeMap tiles).

---

## Data model (`crcl_geo.json`)
```
{
  "path":  [[lon,lat], ...],      // 670 pts, the camera path, S->N, equal ~25ft spacing
  "line":  [[lon,lat], ...],      // same coords, drawn as the purple CRCL line
  "stations": [
    {"name":"Roosevelt",            "lonlat":[lon,lat], "s":0.187},
    {"name":"Taylor/Clinton",       "lonlat":[lon,lat], "s":0.445},
    {"name":"Union Station (West)", "lonlat":[lon,lat], "s":0.619},
    {"name":"Randolph/Clinton",     "lonlat":[lon,lat], "s":0.765}
  ]
}
```
`s` = normalized arc-length position (0..1) of each station along `path`.
The path starts ~south of Roosevelt and ends ~north of Randolph/Clinton, so the
stations sit in the interior of the range, not at the ends.

How it was generated (QGIS, so you can regenerate/extend): CRCL geometry from
layer `b_crosstowner_lines` (feature name exactly
`Clinton-Roosevelt Connector Line (CRCL)`), in **EPSG:3435** (IL State Plane E,
US feet). Corners rounded with **Chaikin (4 iterations)** in projected feet,
resampled at 25 ft, then reprojected to **EPSG:4326**. The four stations are the
points within ~8 ft of the line that carry the `X1, X2, X3, X4` tag in their
`description` (from layer `b_crosstowner_stations`, 294 pts). Union Station
(Riverside) is intentionally excluded — it is 619 ft off on the parallel SCAL line.

> Authoritative source: the stations/lines live in **our database** (PostGIS /
> Chicago Cityscape). The line<->station membership here was derived spatially as
> a stopgap. When wiring to the DB, pull membership from the real relationship
> rather than a distance buffer.

---

## Current viewer behavior
- MapLibre GL **4.7.1** (unpkg CDN).
- Style: `https://tiles.openfreemap.org/styles/liberty` — already contains a
  `building-3d` fill-extrusion layer, so buildings extrude once the camera is pitched.
- Camera: per-frame `map.jumpTo({center, bearing, pitch, zoom})`, center sampled
  along `path`, bearing from a 6-point lookahead, **pitch 62**, **zoom 16**,
  single pass over **30 s** with a smootherstep ease.
- UI: pitch slider, zoom slider, "Replay" button; drag to look around.
- Overlays: purple CRCL line (`#8d5a99`), stations as red dots (`#d62728`).

OpenFreeMap notes: free, no key. The vector tile path embeds a dated build folder
that rotates over time, but the **style URL auto-resolves** it, so don't hardcode
the `.pbf` path. Attribution required: "© OpenMapTiles, data from OpenStreetMap"
(MapLibre adds it automatically from the style).

---

## TODO (the two requested changes)

### 1) Stop at each of the four stations
Dwell ~2.5 s at each station, decelerating in and accelerating out. Replace the
single 30 s sweep with a leg-based schedule over waypoints
`[0, 0.187, 0.445, 0.619, 0.765, 1.0]`, dwelling at the four station `s` values.
Reference logic:

```js
const stops = D.stations.map(s => s.s);              // [0.187,0.445,0.619,0.765]
const waypoints = [0, ...stops, 1.0];
const DWELL = 2500;                                   // ms paused at each station
const LEG_MS = s0 => 4000 + 16000 * s0;              // time ~ proportional to leg length
const smooth = u => u*u*u*(u*(u*6-15)+10);

// Build a timeline of phases: {type:'move', sFrom, sTo, dur} and {type:'hold', s, dur}
// On each frame, find the active phase by elapsed time; for 'move' set
// s = sFrom + (sTo - sFrom) * smooth(localT); for 'hold' keep s constant
// (optionally nudge zoom +0.4 during the hold for emphasis and show the name).
// Convert s -> path index -> center, same as today.
```
Show the current/last station name in the UI during a hold; optional gentle
zoom-in while paused.

### 2) Smoother turns
The path is already Chaikin-smoothed, but the per-frame bearing still snaps.
Damp it: keep a running `camBearing` and ease toward the desired bearing each
frame using the shortest angular delta.

```js
let camBearing = null;
function easeBearing(target){
  if(camBearing===null){camBearing=target; return target;}
  let d = ((target - camBearing + 540) % 360) - 180;  // shortest signed delta
  camBearing = (camBearing + d * 0.08 + 360) % 360;   // 0.08 = smoothing factor
  return camBearing;
}
// use easeBearing(desired) instead of the raw lookahead bearing
```
Tune `0.08` (lower = smoother/laggier). Also try a longer lookahead (8–12) and
slowing the camera near stations (the stop schedule already helps a lot here).

---

## Nice-to-haves / backlog
- **Headless vertical MP4 export** (the original ask was a 9:16 video): drive this
  page with Playwright/puppeteer + a fixed 1080x1920 window, capture frames per
  animation step, encode with ffmpeg (installed at `/opt/homebrew/bin/ffmpeg`).
  This gives a real 3D video without screen-recording.
- Pull line + stations straight from PostGIS; generalize to any CrossTowner line
  (the same code works for any feature in `b_crosstowner_lines`).
- Station labels/popups; sky/fog already attempted via `map.setSky(...)`.

## Dead ends (don't revisit)
- 2D perspective "tilt" of flat top-down frames (ffmpeg `perspective`): produced
  edge artifacts and, fundamentally, no real building height. Real 3D must come
  from a pitched GL camera (this MapLibre approach).

## Also on disk (QGIS side, top-down 2D pipeline — separate from this 3D viewer)
- `~/Desktop/CRCL_2500_flat.mp4` — clean flat top-down flythrough (keeper).
- `/tmp/crcl_frames_2500/` + `/tmp/crcl_cfg_2500.json` — 360 rendered 2D frames
  + config, if you ever want to re-encode a flat top-down video.
